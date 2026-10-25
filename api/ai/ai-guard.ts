import { Redis } from "@upstash/redis";
import { createHash, randomUUID } from "node:crypto";
import { env } from "node:process";

const DAILY_LIMIT = 5;
const DAILY_TTL_SECONDS = 24 * 60 * 60;
const CACHE_TTL_SECONDS = 10 * 60;
const IP_LOCK_TTL_MS = 60 * 1000;
const GLOBAL_CONCURRENCY_LIMIT = 10;

export class GuardRejectedError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "GuardRejectedError";
  }
}

export async function runAIGuard<T>(options: {
  request: Request;
  payload: unknown;
  execute: () => Promise<T>;
}): Promise<T> {
  const redisUrl = env.UPSTASH_REDIS_REST_URL;
  const redisToken = env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    throw new GuardRejectedError(503, "Rate protection is unavailable.");
  }

  const redis = new Redis({
    url: redisUrl,
    token: redisToken
  });

  const redisCall = async <Result>(
    operation: () => Promise<Result>
  ): Promise<Result> => {
    try {
      return await operation();
    } catch {
      throw new GuardRejectedError(503, "Rate protection is unavailable.");
    }
  };

  const forwardedFor = options.request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  if (!forwardedFor) {
    throw new GuardRejectedError(503, "Client identity is unavailable.");
  }

  const environment = env.VERCEL_ENV || "development";
  const ipHash = createHash("sha256").update(forwardedFor).digest("hex");
  const payloadHash = createHash("sha256")
    .update(JSON.stringify(options.payload))
    .digest("hex");

  const cacheKey = `ai:${environment}:suggestion:${payloadHash}`;
  const cached = await redisCall(() => redis.get<string>(cacheKey));

  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      await redisCall(() => redis.del(cacheKey));
    }
  }

  const quotaKey = `ai:${environment}:quota:${ipHash}`;
  const lockToken = randomUUID();
  const quotaReservationKey = `ai:${environment}:quota-reservation:${ipHash}:${lockToken}`;
  const ipLockKey = `ai:${environment}:lock:ip:${ipHash}`;
  const globalLockKey = `ai:${environment}:lock:global`;

  let quotaReserved = false;
  let lockMayBeHeld = false;
  let generationSucceeded = false;

  try {
    quotaReserved = true;

    const quotaAccepted = await redisCall(() =>
      redis.eval(
        `local count = tonumber(redis.call("GET", KEYS[1]) or "0")
         if count >= tonumber(ARGV[1]) then
           return 0
         end
         count = redis.call("INCR", KEYS[1])
         if count == 1 then
           redis.call("EXPIRE", KEYS[1], ARGV[2])
         end
         redis.call("SET", KEYS[2], "1", "EX", ARGV[2])
         return 1`,
        [quotaKey, quotaReservationKey],
        [DAILY_LIMIT.toString(), DAILY_TTL_SECONDS.toString()]
      )
    );

    if (Number(quotaAccepted) !== 1) {
      quotaReserved = false;
      throw new GuardRejectedError(
        429,
        "Daily AI suggestion limit reached. Try again later."
      );
    }

    lockMayBeHeld = true;

    const lockAcquired = await redisCall(() =>
      redis.eval(
        `local now = redis.call("TIME")
         local nowMs = tonumber(now[1]) * 1000 + math.floor(tonumber(now[2]) / 1000)
         redis.call("ZREMRANGEBYSCORE", KEYS[2], "-inf", nowMs)

         if redis.call("GET", KEYS[1]) then
           return 0
         end

         if redis.call("ZCARD", KEYS[2]) >= tonumber(ARGV[3]) then
           return 0
         end

         local expiresAt = nowMs + tonumber(ARGV[2])
         redis.call("SET", KEYS[1], ARGV[1], "PX", ARGV[2])
         redis.call("ZADD", KEYS[2], expiresAt, ARGV[1])
         redis.call("PEXPIRE", KEYS[2], ARGV[2])
         return 1`,
        [ipLockKey, globalLockKey],
        [
          lockToken,
          IP_LOCK_TTL_MS.toString(),
          GLOBAL_CONCURRENCY_LIMIT.toString()
        ]
      )
    );

    if (Number(lockAcquired) !== 1) {
      lockMayBeHeld = false;
      throw new GuardRejectedError(
        429,
        "An AI request is already running. Please wait briefly."
      );
    }

    const result = await options.execute();
    generationSucceeded = true;

    await redisCall(() =>
      redis.eval(`redis.call("DEL", KEYS[1])`, [quotaReservationKey], [])
    );

    quotaReserved = false;

    await redisCall(() =>
      redis.set(cacheKey, JSON.stringify(result), {
        ex: CACHE_TTL_SECONDS
      })
    );

    return result;
  } finally {
    if (lockMayBeHeld) {
      try {
        await redisCall(() =>
          redis.eval(
            `if redis.call("GET", KEYS[1]) == ARGV[1] then
               redis.call("DEL", KEYS[1])
             end

             redis.call("ZREM", KEYS[2], ARGV[1])

             if redis.call("ZCARD", KEYS[2]) == 0 then
               redis.call("DEL", KEYS[2])
             end`,
            [ipLockKey, globalLockKey],
            [lockToken]
          )
        );
      } catch (error) {
        console.error("AI concurrency lock cleanup failed.", error);
      }
    }

    if (quotaReserved && !generationSucceeded) {
      try {
        await redisCall(() =>
          redis.eval(
            `if redis.call("DEL", KEYS[2]) == 1 then
               local count = tonumber(redis.call("GET", KEYS[1]) or "0")
               if count > 1 then
                 redis.call("DECR", KEYS[1])
               elseif count == 1 then
                 redis.call("DEL", KEYS[1])
               end
             end`,
            [quotaKey, quotaReservationKey],
            []
          )
        );
      } catch (error) {
        console.error("AI quota rollback failed.", error);
      }
    }
  }
}

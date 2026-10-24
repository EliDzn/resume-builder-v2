import { Redis } from "@upstash/redis";
import { createHash, randomUUID } from "node:crypto";
import { env } from "node:process";

const DAILY_LIMIT = 5;
const DAILY_TTL_SECONDS = 24 * 60 * 60;
const CACHE_TTL_SECONDS = 10 * 60;
const IP_LOCK_TTL_MS = 60 * 1000;
const GLOBAL_CONCURRENCY_LIMIT = 10;

export class GuardRejectedError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
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
       return 1`,
      [quotaKey],
      [DAILY_LIMIT.toString(), DAILY_TTL_SECONDS.toString()]
    )
  );

  if (Number(quotaAccepted) !== 1) {
    throw new GuardRejectedError(
      429,
      "Daily AI suggestion limit reached. Try again later."
    );
  }

  const lockToken = randomUUID();
  const ipLockKey = `ai:${environment}:lock:ip:${ipHash}`;
  const globalLockKey = `ai:${environment}:lock:global`;

  let ipLockAcquired = false;
  let upstreamSucceeded = false;

  try {
    const acquired = await redisCall(() =>
      redis.eval(
        `if redis.call("GET", KEYS[1]) then
           return 0
         end
         redis.call("SET", KEYS[1], ARGV[1], "PX", ARGV[2])
         local count = tonumber(redis.call("GET", KEYS[2]) or "0")
         if count >= tonumber(ARGV[3]) then
           redis.call("DEL", KEYS[1])
           return 0
         end
         redis.call("INCR", KEYS[2])
         redis.call("PEXPIRE", KEYS[2], ARGV[4])
         return 1`,
        [ipLockKey, globalLockKey],
        [
          lockToken,
          IP_LOCK_TTL_MS.toString(),
          GLOBAL_CONCURRENCY_LIMIT.toString(),
          IP_LOCK_TTL_MS.toString()
        ]
      )
    );

    if (Number(acquired) !== 1) {
      throw new GuardRejectedError(
        429,
        "An AI request is already running. Please wait briefly."
      );
    }

    ipLockAcquired = true;

    const result = await options.execute();
    upstreamSucceeded = true;

    await redisCall(() =>
      redis.set(cacheKey, JSON.stringify(result), {
        ex: CACHE_TTL_SECONDS
      })
    );

    return result;
  } finally {
    if (ipLockAcquired) {
      try {
        await redisCall(() =>
          redis.eval(
            `if redis.call("GET", KEYS[1]) == ARGV[1] then
               redis.call("DEL", KEYS[1])
             end
             local count =
               tonumber(redis.call("GET", KEYS[2]) or "0")
             if count > 1 then
               redis.call("DECR", KEYS[2])
             elseif count == 1 then
               redis.call("DEL", KEYS[2])
             end`,
            [ipLockKey, globalLockKey],
            [lockToken]
          )
        );
      } catch {
        // The short lock TTL releases stale locks automatically.
      }
    }

    if (!upstreamSucceeded) {
      try {
        await redisCall(() =>
          redis.eval(
            `local count =
               tonumber(redis.call("GET", KEYS[1]) or "0")
             if count > 1 then
               redis.call("DECR", KEYS[1])
             elseif count == 1 then
               redis.call("DEL", KEYS[1])
             end`,
            [quotaKey],
            []
          )
        );
      } catch {
        // The quota key's TTL will prevent stale quota entries.
      }
    }
  }
}

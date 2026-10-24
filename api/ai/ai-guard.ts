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

export async function runAiGuard<T>(options: {
  request: Request;
  payload: unknown;
  execute: () => Promise<T>;
}): Promise<T> {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new GuardRejectedError(503, "Rate protection is unavailable.");
  }

  const redis = new Redis({ url, token });

  const forwardedFor = options.request.headers
    .get("x-vercel-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  if (!forwardedFor) {
    throw new GuardRejectedError(503, "Client identity is unavailable.");
  }

  const ipHash = createHash("sha256").update(forwardedFor).digest("hex");
  const payloadHash = createHash("sha256")
    .update(JSON.stringify(options.payload))
    .digest("hex");

  const cacheKey = `ai:suggestion:${payloadHash}`;
  const cached = await redis.get<string>(cacheKey);

  if (cached) {
    return JSON.parse(cached) as T;
  }

  const quotaKey = `ai:quota:${ipHash}`;
  const quotaAccepted = await redis.eval(
    `local count = tonumber(redis.call("GET", KEYS[1]) or "0")
     if count >= tonumber(ARGV[1]) then return 0 end
     count = redis.call("INCR", KEYS[1])
     if count == 1 then redis.call("EXPIRE", KEYS[1], ARGV[2]) end
     return 1`,
    [quotaKey],
    [DAILY_LIMIT, DAILY_TTL_SECONDS]
  );

  if (!quotaAccepted) {
    throw new GuardRejectedError(
      429,
      "Daily AI suggestion limit reached. Try again later."
    );
  }

  const lockToken = randomUUID();
  const ipLockKey = `ai:lock:ip:${ipHash}`;
  const globalKey = "ai:lock:global";

  let locksAcquired = false;
  let upstreamSucceeded = false;

  try {
    const acquired = await redis.eval(
      `if redis.call("SET", KEYS[1], ARGV[1], "NX", "PX", ARGV[2]) then
         local count = tonumber(redis.call("GET", KEYS[2]) or "0")
         if count >= tonumber(ARGV[3]) then
           redis.call("DEL", KEYS[1])
           return 0
         end
         redis.call("INCR", KEYS[2])
         redis.call("PEXPIRE", KEYS[2], ARGV[4])
         return 1
       end
       return 0`,
      [ipLockKey, globalKey],
      [lockToken, IP_LOCK_TTL_MS, GLOBAL_CONCURRENCY_LIMIT, IP_LOCK_TTL_MS]
    );

    if (!acquired) {
      throw new GuardRejectedError(
        429,
        "An AI request is already running. Please wait briefly."
      );
    }

    locksAcquired = true;
    const result = await options.execute();
    upstreamSucceeded = true;

    await redis.set(cacheKey, JSON.stringify(result), {
      ex: CACHE_TTL_SECONDS
    });

    return result;
  } finally {
    if (locksAcquired) {
      await redis.eval(
        `if redis.call("GET", KEYS[1]) == ARGV[1] then
           redis.call("DEL", KEYS[1])
         end
         local count = tonumber(redis.call("GET", KEYS[2]) or "0")
         if count > 1 then
           redis.call("DECR", KEYS[2])
         elseif count == 1 then
           redis.call("DEL", KEYS[2])
         end`,
        [ipLockKey, globalKey],
        [lockToken]
      );
    }

    if (!upstreamSucceeded) {
      await redis.eval(
        `local count = tonumber(redis.call("GET", KEYS[1]) or "0")
         if count > 1 then
           redis.call("DECR", KEYS[1])
         elseif count == 1 then
           redis.call("DEL", KEYS[1])
         end`,
        [quotaKey],
        []
      );
    }
  }
}

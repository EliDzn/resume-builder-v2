import { createHash, randomUUID } from "node:crypto";
import { env } from "node:process";
import { Redis } from "@upstash/redis";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";
import { getAIQuotaStatus, runAIGuard } from "../../api/ai/ai-guard.js";

const IP = "198.51.100.17";

type CleanupTarget = {
  environment: string;
  payload: unknown;
  ip: string;
};

let redis: Redis;
let namespace = "";
let activeEnvironment = "";
let cleanupTargets: CleanupTarget[] = [];

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");

function setEnvironment(suffix: string) {
  activeEnvironment = `${namespace}-${suffix}`;
  vi.stubEnv("VERCEL_ENV", activeEnvironment);
  return activeEnvironment;
}

function createRequest(ip = IP) {
  return new Request("http://localhost/api/ai/suggestions", {
    headers: { "x-vercel-forwarded-for": ip }
  });
}

function track(payload: unknown, ip = IP) {
  cleanupTargets.push({
    environment: activeEnvironment,
    payload,
    ip
  });
}

describe("AI guard with real Upstash Redis", () => {
  beforeAll(() => {
    if (env.AI_GUARD_REAL_REDIS !== "1") {
      throw new Error(
        "Set AI_GUARD_REAL_REDIS=1 to run Redis integration tests."
      );
    }

    if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN locally."
      );
    }

    redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN
    });
  });

  beforeEach(() => {
    namespace = `integration-${randomUUID()}`;
    cleanupTargets = [];
    setEnvironment("preview");
  });

  afterEach(async () => {
    try {
      for (const target of cleanupTargets) {
        const ipHash = hash(target.ip);
        const payloadHash = hash(JSON.stringify(target.payload));

        await redis.del(
          `ai:${target.environment}:quota:${ipHash}`,
          `ai:${target.environment}:suggestion:${payloadHash}`,
          `ai:${target.environment}:lock:ip:${ipHash}`,
          `ai:${target.environment}:lock:global`
        );
      }
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("allows only one in-flight request per IP and rolls back rejected quota", async () => {
    const firstPayload = { case: "first-request" };
    const secondPayload = { case: "overlapping-request" };
    track(firstPayload);
    track(secondPayload);

    let signalEntered!: () => void;
    const entered = new Promise<void>((resolve) => {
      signalEntered = resolve;
    });

    let releaseExecution!: () => void;
    const held = new Promise<void>((resolve) => {
      releaseExecution = resolve;
    });

    const firstRequest = runAIGuard({
      request: createRequest(),
      payload: firstPayload,
      execute: async () => {
        signalEntered();
        await held;
        return { result: "first" };
      }
    });

    await entered;

    try {
      await expect(
        runAIGuard({
          request: createRequest(),
          payload: secondPayload,
          execute: async () => ({ result: "second" })
        })
      ).rejects.toMatchObject({ status: 429 });
    } finally {
      releaseExecution();
    }

    await expect(firstRequest).resolves.toEqual({ result: "first" });
    await expect(getAIQuotaStatus(createRequest())).resolves.toMatchObject({
      used: 1,
      limit: 5,
      remaining: 4
    });
  });

  it("rolls back quota when generation fails", async () => {
    const payload = { case: "failed-generation" };
    track(payload);

    await expect(
      runAIGuard({
        request: createRequest(),
        payload,
        execute: async () => {
          throw new Error("generation failed");
        }
      })
    ).rejects.toThrow("generation failed");

    await expect(getAIQuotaStatus(createRequest())).resolves.toMatchObject({
      used: 0,
      limit: 5,
      remaining: 5
    });
  });

  it("returns cached results without charging quota twice", async () => {
    const payload = { case: "identical-input-cache" };
    track(payload);

    const execute = vi.fn().mockResolvedValue({ result: "generated" });
    const options = {
      request: createRequest(),
      payload,
      execute
    };

    await expect(runAIGuard(options)).resolves.toEqual({
      result: "generated"
    });
    await expect(runAIGuard(options)).resolves.toEqual({
      result: "generated"
    });

    expect(execute).toHaveBeenCalledOnce();
    await expect(getAIQuotaStatus(createRequest())).resolves.toMatchObject({
      used: 1,
      limit: 5,
      remaining: 4
    });
  });

  it("isolates preview-like and production-like environment namespaces", async () => {
    const payload = { case: "environment-isolation" };
    const execute = vi.fn(async () => ({ result: randomUUID() }));

    const previewEnvironment = setEnvironment("preview");
    track(payload);

    const previewResult = await runAIGuard({
      request: createRequest(),
      payload,
      execute
    });

    const productionEnvironment = setEnvironment("production");
    track(payload);

    const productionResult = await runAIGuard({
      request: createRequest(),
      payload,
      execute
    });

    expect(execute).toHaveBeenCalledTimes(2);
    expect(productionResult).not.toEqual(previewResult);

    setEnvironment("preview");
    await expect(getAIQuotaStatus(createRequest())).resolves.toMatchObject({
      used: 1
    });

    setEnvironment("production");
    await expect(getAIQuotaStatus(createRequest())).resolves.toMatchObject({
      used: 1
    });

    expect(previewEnvironment).not.toBe(productionEnvironment);
  });
});

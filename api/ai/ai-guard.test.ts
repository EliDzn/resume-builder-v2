import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redisClient: {
    get: vi.fn(),
    eval: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
  },
  Redis: vi.fn()
}));

vi.mock("@upstash/redis", () => ({
  Redis: mocks.Redis
}));

import {
  getAIQuotaStatus,
  GuardRejectedError,
  runAIGuard
} from "./ai-guard.js";

function createRequest(ip = "203.0.113.10") {
  return new Request("http://localhost/api/ai/suggestions", {
    headers: { "x-vercel-forwarded-for": ip }
  });
}

describe("AI Redis guard", () => {
  beforeEach(() => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.stubEnv("VERCEL_ENV", "preview");

    mocks.Redis.mockReset();
    mocks.Redis.mockImplementation(function () {
      return mocks.redisClient;
    });
    mocks.redisClient.get.mockReset().mockResolvedValue(null);
    mocks.redisClient.eval.mockReset().mockResolvedValue(1);
    mocks.redisClient.set.mockReset().mockResolvedValue("OK");
    mocks.redisClient.del.mockReset().mockResolvedValue(1);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("runs generation, releases locks, and does not cache results", async () => {
    const execute = vi.fn().mockResolvedValue({ insights: [] });

    await expect(
      runAIGuard({
        request: createRequest(),
        execute
      })
    ).resolves.toEqual({ insights: [] });

    expect(execute).toHaveBeenCalledOnce();
    expect(mocks.redisClient.eval).toHaveBeenCalledTimes(4);
    expect(mocks.redisClient.get).not.toHaveBeenCalled();
    expect(mocks.redisClient.set).not.toHaveBeenCalled();

    const redisKeys = mocks.redisClient.eval.mock.calls
      .flatMap((call) => call[1] as string[])
      .join(" ");

    expect(redisKeys).not.toContain("suggestion");
  });

  it("executes identical requests separately without caching results", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ insights: [{ title: "First" }] })
      .mockResolvedValueOnce({ insights: [{ title: "Second" }] });

    const options = {
      request: createRequest(),
      execute
    };

    await expect(runAIGuard(options)).resolves.toEqual({
      insights: [{ title: "First" }]
    });
    await expect(runAIGuard(options)).resolves.toEqual({
      insights: [{ title: "Second" }]
    });

    expect(execute).toHaveBeenCalledTimes(2);
    expect(mocks.redisClient.get).not.toHaveBeenCalled();
    expect(mocks.redisClient.set).not.toHaveBeenCalled();
    expect(mocks.redisClient.eval).toHaveBeenCalledTimes(8);
  });

  it("rolls back quota when generation fails", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("generation failed"));

    await expect(
      runAIGuard({
        request: createRequest(),
        execute
      })
    ).rejects.toThrow("generation failed");

    const scripts = mocks.redisClient.eval.mock.calls.map(([script]) =>
      String(script)
    );

    expect(scripts.some((script) => script.includes('redis.call("DECR"'))).toBe(
      true
    );
  });

  it("rejects a request when the IP lock is already held", async () => {
    mocks.redisClient.eval
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1);

    const execute = vi.fn();

    await expect(
      runAIGuard({
        request: createRequest(),
        execute
      })
    ).rejects.toMatchObject({ status: 429 });

    expect(execute).not.toHaveBeenCalled();
    expect(mocks.redisClient.eval).toHaveBeenCalledTimes(3);
    expect(mocks.redisClient.eval).toHaveBeenLastCalledWith(
      expect.stringContaining('if redis.call("DEL", KEYS[2]) == 1 then'),
      [
        expect.stringMatching(/^ai:preview:quota:/),
        expect.stringMatching(/^ai:preview:quota-reservation:/)
      ],
      []
    );
  });

  it("rejects requests over the quota limit without running generation", async () => {
    mocks.redisClient.eval.mockResolvedValueOnce(0);

    const execute = vi.fn();

    await expect(
      runAIGuard({
        request: createRequest(),
        execute
      })
    ).rejects.toMatchObject({ status: 429 });

    expect(execute).not.toHaveBeenCalled();
    expect(mocks.redisClient.eval).toHaveBeenCalledOnce();
  });

  it("fails closed when Redis is unavailable", async () => {
    mocks.redisClient.eval
      .mockRejectedValueOnce(new Error("Redis unavailable"))
      .mockResolvedValueOnce(1);

    const execute = vi.fn();

    await expect(
      runAIGuard({
        request: createRequest(),
        execute
      })
    ).rejects.toMatchObject({ status: 503 });

    expect(execute).not.toHaveBeenCalled();
  });

  it("returns quota status from Redis", async () => {
    mocks.redisClient.get.mockResolvedValueOnce(3);

    await expect(getAIQuotaStatus(createRequest())).resolves.toEqual({
      used: 3,
      limit: 5,
      remaining: 2
    });

    expect(mocks.redisClient.get).toHaveBeenCalledWith(
      expect.stringMatching(/^ai:preview:quota:/)
    );
  });

  it("rejects invalid quota data", async () => {
    mocks.redisClient.get.mockResolvedValueOnce("invalid");

    await expect(getAIQuotaStatus(createRequest())).rejects.toBeInstanceOf(
      GuardRejectedError
    );
  });
});

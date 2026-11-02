import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "./suggestions.js";
import { getAIQuotaStatus, runAIGuard } from "./ai-guard.js";

vi.mock("./ai-guard.js", () => {
  class GuardRejectedError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.name = "GuardRejectedError";
    }
  }

  return {
    GuardRejectedError,
    getAIQuotaStatus: vi.fn(),
    runAIGuard: vi.fn()
  };
});

const validRequest = {
  jobDescription:
    "We need an experienced frontend developer with strong TypeScript skills.",
  resume: {
    role: "Frontend Developer",
    summary: "Experienced developer.",
    experiences: [],
    projects: [],
    certifications: [{ title: "Cloud Developer Certificate" }],
    skills: {
      frontend: ["TypeScript"],
      backend: [],
      tools: []
    }
  }
};

const suggestions = {
  insights: [
    {
      severity: "Success",
      title: "Relevant experience",
      detail: "Your resume shows TypeScript experience."
    }
  ]
};

function makePostRequest(body: string, contentType = "application/json") {
  return new Request("http://localhost/api/ai/suggestions", {
    method: "POST",
    headers: { "content-type": contentType },
    body
  });
}

describe("suggestions API handler", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_MODEL", "test-model");
    vi.stubGlobal("fetch", vi.fn());

    vi.mocked(getAIQuotaStatus).mockReset();
    vi.mocked(runAIGuard).mockReset();
    vi.mocked(runAIGuard).mockImplementation((options) => options.execute());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("rejects unsupported methods", async () => {
    const response = await handler.fetch(
      new Request("http://localhost/api/ai/suggestions", {
        method: "DELETE"
      })
    );

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, POST");
  });

  it("rejects requests without JSON content type", async () => {
    const response = await handler.fetch(
      makePostRequest(JSON.stringify(validRequest), "text/plain")
    );

    expect(response.status).toBe(415);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON", async () => {
    const response = await handler.fetch(makePostRequest("{"));

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects invalid request data without calling Gemini", async () => {
    const response = await handler.fetch(
      makePostRequest(JSON.stringify({ jobDescription: "Too short" }))
    );

    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns validated suggestions from Gemini", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({
        candidates: [
          { content: { parts: [{ text: JSON.stringify(suggestions) }] } }
        ]
      })
    );

    const response = await handler.fetch(
      makePostRequest(JSON.stringify(validRequest))
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(suggestions);
    expect(runAIGuard).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("maps Gemini rate limits to a service-unavailable response", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 429 }));

    const response = await handler.fetch(
      makePostRequest(JSON.stringify(validRequest))
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "The AI service is busy. Please try again shortly."
    });
  });

  it("returns quota status for GET requests", async () => {
    vi.mocked(getAIQuotaStatus).mockResolvedValue({
      used: 2,
      limit: 5,
      remaining: 3
    });

    const request = new Request("http://localhost/api/ai/suggestions");
    const response = await handler.fetch(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      used: 2,
      limit: 5,
      remaining: 3
    });
    expect(getAIQuotaStatus).toHaveBeenCalledWith(request);
  });

  it("rejects generation when Gemini is not configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");

    const response = await handler.fetch(
      makePostRequest(JSON.stringify(validRequest))
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "AI suggestions are not configured on the server."
    });
    expect(runAIGuard).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects requests exceeding the size limit", async () => {
    const request = new Request("http://localhost/api/ai/suggestions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(256 * 1024 + 1)
      },
      body: JSON.stringify(validRequest)
    });

    const response = await handler.fetch(request);

    expect(response.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("maps non-rate-limit Gemini errors to a gateway error", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const response = await handler.fetch(
      makePostRequest(JSON.stringify(validRequest))
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "The AI service could not generate suggestions."
    });
  });

  it("rejects invalid JSON returned by Gemini", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({
        candidates: [{ content: { parts: [{ text: "not JSON" }] } }]
      })
    );

    const response = await handler.fetch(
      makePostRequest(JSON.stringify(validRequest))
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "The AI returned an invalid response."
    });
  });
});

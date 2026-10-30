import { expect, test } from "@playwright/test";

test("generates resume insights from editor data", async ({ page }) => {
  let generationRequests = 0;

  await page.route("**/api/ai/suggestions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 0, limit: 5, remaining: 5 })
      });
      return;
    }

    generationRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        insights: [
          {
            severity: "Success",
            title: "Relevant experience",
            detail: "Your resume highlights relevant experience."
          }
        ]
      })
    });
  });

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Optimized Resume Builder (v2)" })
  ).toBeVisible();

  const generateButton = page.getByRole("button", {
    name: /Generate Insights/
  });

  await expect(generateButton).toBeDisabled();

  await page.getByLabel("Full name").fill("Jane Doe");
  await page
    .getByLabel("Job Description")
    .fill("We need an experienced frontend developer with TypeScript skills.");

  await expect(generateButton).toBeEnabled();
  await generateButton.click();

  await expect(
    page.getByRole("heading", { name: "Resume Insights" })
  ).toBeVisible();
  await expect(
    page.getByText("Relevant experience", { exact: true })
  ).toBeVisible();
  expect(generationRequests).toBe(1);
});

test("disables generate while an insights request is in flight", async ({
  page
}) => {
  let releaseGeneration!: () => void;

  const generationPaused = new Promise<void>((resolve) => {
    releaseGeneration = resolve;
  });

  await page.route("**/api/ai/suggestions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 0, limit: 5, remaining: 5 })
      });
      return;
    }

    await generationPaused;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ insights: [] })
    });
  });

  await page.goto("/");
  await page.getByLabel("Full name").fill("Jane Doe");
  await page
    .getByLabel("Job Description")
    .fill("We need an experienced frontend developer with TypeScript skills.");

  await page.getByRole("button", { name: /Generate Insights/ }).click();

  try {
    await expect(
      page.getByRole("button", { name: "Generating…" })
    ).toBeDisabled();
    await expect(page.getByText("Generating…")).toBeVisible();
  } finally {
    releaseGeneration();
  }

  await expect(
    page.getByText(
      "No additional insights for this resume and job description."
    )
  ).toBeVisible();
});

test("keeps resume edits local, persists them, and clears them", async ({
  page
}) => {
  let generationRequests = 0;

  await page.route("**/api/ai/suggestions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 0, limit: 5, remaining: 5 })
      });
      return;
    }

    generationRequests += 1;
    await route.fulfill({ status: 500, body: "Unexpected generation request" });
  });

  await page.goto("/");
  const fullName = page.getByLabel("Full name");
  await fullName.fill("Jane Doe");

  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue("Jane Doe");

  await page.getByRole("button", { name: "Clear resume" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("");
  await expect(
    page.getByRole("heading", { name: "Already have a resume?" })
  ).toBeVisible();

  expect(generationRequests).toBe(0);
});

test("disables Generate when daily quota is exhausted", async ({ page }) => {
  let generationRequests = 0;

  await page.route("**/api/ai/suggestions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 5, limit: 5, remaining: 0 })
      });
      return;
    }

    generationRequests += 1;
    await route.fulfill({ status: 500 });
  });

  await page.goto("/");
  await page.getByLabel("Full name").fill("Jane Doe");
  await page
    .getByLabel("Job Description")
    .fill("We need an experienced frontend developer with TypeScript skills.");

  const generateButton = page.getByRole("button", {
    name: "Generate Insights (0 remaining)"
  });

  await expect(generateButton).toBeDisabled();
  expect(generationRequests).toBe(0);
});

test("shows an error when importing an unsupported file", async ({ page }) => {
  await page.goto("/");

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles("tests/e2e/fixtures/invalid-resume.txt");

  await expect(
    page.getByRole("alert").filter({ hasText: "Choose a DOCX or PDF file." })
  ).toBeVisible();

  await expect(page.getByLabel("Full name")).toHaveValue("");
});

test("exports resume as a named PDF", async ({ page }) => {
  await page.route("**/api/ai/suggestions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ used: 0, limit: 5, remaining: 5 })
    });
  });

  await page.goto("/");
  await page.getByLabel("Full name").fill("Jane Doe");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Resume" }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Jane_Doe.pdf");
});

test("shows generation errors and allows retry", async ({ page }) => {
  let generationRequests = 0;

  await page.route("**/api/ai/suggestions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 0, limit: 5, remaining: 5 })
      });
      return;
    }

    generationRequests += 1;

    if (generationRequests === 1) {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({
          error: "The AI service could not generate suggestions."
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        insights: [
          {
            severity: "Success",
            title: "Retry succeeded",
            detail: "The second request completed."
          }
        ]
      })
    });
  });

  await page.goto("/");
  await page.getByLabel("Full name").fill("Jane Doe");
  await page
    .getByLabel("Job Description")
    .fill("We need an experienced frontend developer with TypeScript skills.");

  const generateButton = page.getByRole("button", {
    name: /Generate Insights/
  });

  await generateButton.click();

  await expect(page.getByRole("alert")).toHaveText(
    "The AI service could not generate suggestions."
  );
  await expect(generateButton).toBeEnabled();

  await generateButton.click();

  await expect(
    page.getByText("Retry succeeded", { exact: true })
  ).toBeVisible();
  expect(generationRequests).toBe(2);
});

test("shows editor and preview without horizontal overflow on mobile", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByLabel("Full name")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Already have a resume?" })
  ).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth
  }));

  expect(dimensions.documentWidth).toBeLessThanOrEqual(
    dimensions.viewportWidth
  );
});

test("places insights below editor and preview on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/");

  const editor = page.getByLabel("Full name");
  const preview = page.getByRole("heading", {
    name: "Already have a resume?"
  });
  const insights = page.getByRole("heading", { name: "Job Details" });

  const [editorBox, previewBox, insightsBox] = await Promise.all([
    editor.boundingBox(),
    preview.boundingBox(),
    insights.boundingBox()
  ]);

  expect(editorBox).not.toBeNull();
  expect(previewBox).not.toBeNull();
  expect(insightsBox).not.toBeNull();

  expect(editorBox!.x).toBeLessThan(previewBox!.x);
  expect(insightsBox!.y).toBeGreaterThan(Math.max(editorBox!.y, previewBox!.y));
});

test("imports a PDF and restores resume data", async ({ page }, testInfo) => {
  await page.route("**/api/ai/suggestions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ used: 0, limit: 5, remaining: 5 })
    });
  });

  await page.goto("/");
  const fullName = page.getByLabel("Full name");
  await fullName.fill("Jane Doe");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Resume" }).click();

  const download = await downloadPromise;
  const pdfPath = testInfo.outputPath("resume.pdf");
  await download.saveAs(pdfPath);

  await page.getByRole("button", { name: "Clear resume" }).click();
  await expect(fullName).toHaveValue("");

  await page.locator('input[type="file"]').first().setInputFiles(pdfPath);

  await expect(fullName).toHaveValue("Jane Doe");
});

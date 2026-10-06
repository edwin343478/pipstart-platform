import { expect, test } from "@playwright/test";

for (const width of [1440, 390, 320]) {
  test(`all published Crypto sitemap routes load and fit at ${width}px`, async ({
    page,
    request,
  }, testInfo) => {
    test.setTimeout(240_000);
    await page.setViewportSize({ width, height: 900 });
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    const paths = Array.from(
      new Set(
        Array.from(
          xml.matchAll(/<loc>([^<]+)<\/loc>/g),
          (match) => new URL(match[1]).pathname,
        ).filter((path) => /^\/learn\/crypto(?:\/|$)/.test(path)),
      ),
    ).sort();
    expect(paths).toContain("/learn/crypto");
    // Coverage follows the sitemap instead of copying fifty lesson slugs.
    for (let level = 0; level <= 10; level++) {
      expect(paths).toContain(`/learn/crypto/level-${level}`);
      expect(paths).toContain(`/learn/crypto/level-${level}/quiz`);
    }
    const results: { path: string; status: number; scrollWidth: number }[] = [];
    for (const path of paths) {
      await test.step(path, async () => {
        const response = await page.goto(path, { waitUntil: "networkidle" });
        expect(response?.status(), path).toBe(200);
        await expect(page.locator("main")).toBeVisible();
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth,
        );
        expect(
          scrollWidth,
          `${path} overflows at ${width}px`,
        ).toBeLessThanOrEqual(width + 1);
        results.push({ path, status: response!.status(), scrollWidth });
      });
    }
    await testInfo.attach(`crypto-routes-${width}px.json`, {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });
  });
}

test("unknown Crypto lessons and quizzes remain unavailable", async ({
  request,
}) => {
  for (const level of [0, 1, 5, 10]) {
    const response = await request.get(
      `/learn/crypto/level-${level}/not-a-published-lesson`,
    );
    expect(response.status()).toBe(404);
  }
  expect((await request.get("/learn/crypto/level-99/quiz")).status()).toBe(404);
});

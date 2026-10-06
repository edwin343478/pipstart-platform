import { expect, test } from "@playwright/test";

for (const route of [
  "/learn/crypto/level-0",
  "/learn/crypto/level-10/quiz",
  "/learn/forex/level-0",
  "/login",
  "/tools/position-size-calculator",
]) {
  test(`enforced production security headers: ${route}`, async ({
    request,
  }) => {
    const response = await request.get(route);
    expect(response.status()).toBe(200);
    const headers = response.headers();
    const csp = headers["content-security-policy"];
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(headers["content-security-policy-report-only"]).toBeUndefined();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
  });
}
for (const width of [1440, 390]) {
  test(`CSP preserves lesson hydration and navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const violations: string[] = [];
    await page.addInitScript(() => {
      (window as unknown as { policyViolations: string[] }).policyViolations =
        [];
      document.addEventListener("securitypolicyviolation", (event) => {
        (
          window as unknown as { policyViolations: string[] }
        ).policyViolations.push(event.effectiveDirective);
      });
    });
    await page.goto("/learn/crypto/level-0");
    await page.getByRole("tab").nth(1).click();
    await expect(page.getByRole("tab").nth(1)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page
      .getByRole("checkbox", { name: "Show all sections at once" })
      .check();
    await expect(
      page.getByRole("checkbox", { name: "Show all sections at once" }),
    ).toBeChecked();
    violations.push(
      ...(await page.evaluate(
        () =>
          (window as unknown as { policyViolations: string[] })
            .policyViolations,
      )),
    );
    expect(violations).toEqual([]);
  });
}
test("CSP actually blocks a foreign script", async ({ page }) => {
  await page.goto("/learn/crypto/level-0");
  const violation = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        document.addEventListener("securitypolicyviolation", (event) => {
          if (event.blockedURI.startsWith("https://unapproved.invalid"))
            resolve(event.effectiveDirective);
        });
        const script = document.createElement("script");
        script.src = "https://unapproved.invalid/pipstart-h5.js";
        document.head.append(script);
      }),
  );
  expect(violation).toBe("script-src-elem");
});
test("production CSP blocks string eval", async ({ page }) => {
  // Deliver the probe in the real HTML response. Executing it through
  // page.evaluate/CDP can grant debugger privileges that bypass page CSP.
  await page.route(
    "**/learn/crypto/level-0",
    async (route) => {
      if (
        route.request().method() !== "GET" ||
        !route.request().isNavigationRequest()
      ) {
        await route.continue();
        return;
      }
      const response = await route.fetch();
      expect(response.status()).toBe(200);
      expect(response.headers()["content-security-policy"]).not.toContain(
        "unsafe-eval",
      );
      const body = await response.text();
      expect(body).toContain("</head>");
      const probe = `<script id="pipstart-h5-policy-probe">
      window.pipstartH5EvalExecuted = false;
      try {
        window.eval("window.pipstartH5EvalExecuted = true");
        window.pipstartH5EvalBlocked = false;
      } catch (error) {
        window.pipstartH5EvalBlocked = error.name === "EvalError";
      }
    </script>`;
      await route.fulfill({
        response,
        body: body.replace("</head>", probe + "</head>"),
      });
    },
    { times: 1 },
  );
  const response = await page.goto("/learn/crypto/level-0");
  expect(response?.headers()["content-security-policy"]).toContain(
    "script-src 'self' 'unsafe-inline'",
  );
  // CDP only reads the outcome; eval ran during ordinary HTML parsing.
  await expect
    .poll(() =>
      page.evaluate(() => ({
        blocked: (window as unknown as { pipstartH5EvalBlocked?: boolean })
          .pipstartH5EvalBlocked,
        executed: (window as unknown as { pipstartH5EvalExecuted?: boolean })
          .pipstartH5EvalExecuted,
      })),
    )
    .toEqual({ blocked: true, executed: false });
});

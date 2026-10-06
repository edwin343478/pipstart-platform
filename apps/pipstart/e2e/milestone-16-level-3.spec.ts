import { expect, test } from "@playwright/test";
const routes = [
  "/learn/crypto/level-3",
  "/learn/crypto/level-3/read-a-spot-market-and-order-book",
  "/learn/crypto/level-3/crypto-orders-fees-and-execution-costs",
  "/learn/crypto/level-3/stablecoins-and-peg-promises",
  "/learn/crypto/level-3/crypto-deposits-withdrawals-and-exchange-failure",
];
for (const width of [1440, 390, 320]) {
  test(`Crypto lessons retain stepped reading and fit at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("tab").first()).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await page.getByRole("button", { name: /^Next:/ }).click();
      await expect(page.getByRole("tab").nth(1)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await page.getByRole("tab").last().click();
      const tick = page.getByRole("tabpanel").getByRole("checkbox").first();
      await tick.check();
      await page.reload();
      await expect(tick).toBeChecked();
      await page
        .getByRole("checkbox", { name: "Show all sections at once" })
        .check();
      await expect(page.getByRole("button", { name: /^Next:/ })).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Back", exact: true }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
      ).toBe(true);
    }
    await expect(
      page.getByRole("link", {
        name: "Take the Exchanges Stablecoins and Market Orders quiz",
        exact: true,
      }),
    ).toBeVisible();
  });
  test(`Crypto quiz fits and retains the approved footer layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/crypto/level-3/quiz");
    await expect(
      page.getByRole("link", { name: "← All Crypto levels" }),
    ).toBeVisible();
    const submit = page.getByRole("button", {
      name: "Submit quiz",
      exact: true,
    });
    await expect(submit).toBeEnabled();
    const boxes = await page.locator("fieldset").evaluateAll((nodes) =>
      nodes.map((n) => {
        const b = n.getBoundingClientRect();
        return { right: b.right, bottom: b.bottom };
      }),
    );
    expect(boxes.length).toBe(15);
    const box = await submit.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(Math.max(...boxes.map((x) => x.bottom)));
    const bottomCard = await submit.evaluate((el) => {
      let node = el.parentElement;
      while (node && !node.className.includes("actionCard"))
        node = node.parentElement;
      return node ? getComputedStyle(node).position : "static";
    });
    expect(bottomCard).not.toBe("fixed");
    expect(bottomCard).not.toBe("sticky");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  });
}
test("Crypto late content is available without JavaScript and unknown routes stay unavailable", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 900 },
  });
  const page = await context.newPage();
  for (const route of routes) {
    const response = await page.goto(route, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });
    expect(response?.status()).toBe(200);
    const answers = page.locator("details").filter({
      has: page.getByText("Compare with the worked answers", { exact: true }),
    });
    await expect(answers).toHaveCount(2);
    await expect(answers.first()).not.toHaveAttribute("open", "");
    await answers.first().locator("summary").click();
    await expect(
      answers
        .first()
        .getByRole("heading", { name: "Worked answers", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("heading", {
          name: "References and further reading",
          exact: true,
        })
        .first(),
    ).toBeVisible();
  }
  await context.close();
  expect(
    (
      await request.get("/learn/crypto/level-3/not-a-published-lesson")
    ).status(),
  ).toBe(404);
});

for (const width of [1440, 390]) {
  test(`lesson-card clicks restart at section one and preserve ticks at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/crypto/level-3");
    await page.getByRole("tab").last().click();
    await page.getByRole("tabpanel").getByRole("checkbox").first().check();
    await page
      .getByRole("checkbox", { name: "Show all sections at once" })
      .check();
    async function choose(title: string) {
      if (width < 1000) {
        const menu = page
          .locator("details")
          .filter({ has: page.locator("nav") })
          .first();
        if (!(await menu.evaluate((e) => (e as HTMLDetailsElement).open)))
          await menu.locator("summary").click();
        await menu.getByRole("link", { name: title, exact: true }).click();
      } else
        await page
          .locator("aside nav")
          .getByRole("link", { name: title, exact: true })
          .click();
      await expect(page.getByRole("tab").first()).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(
        page.getByRole("checkbox", { name: "Show all sections at once" }),
      ).not.toBeChecked();
    }
    await choose("Read a Spot Market and an Order Book");
    await page.getByRole("tab").nth(2).click();
    await choose("Choose an Exchange Service by What It Does");
    await page.getByRole("tab").last().click();
    await expect(
      page.getByRole("tabpanel").getByRole("checkbox").first(),
    ).toBeChecked();
    await choose("Choose an Exchange Service by What It Does");
  });
}

test("worked answers stay closed until comparison and remain available in print", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-3");
  await page.getByRole("tab").last().click();
  const answers = page
    .locator("details")
    .filter({
      has: page.getByText("Compare with the worked answers", { exact: true }),
    })
    .first();
  const heading = answers.getByRole("heading", {
    name: "Worked answers",
    exact: true,
  });
  await expect(heading).not.toBeVisible();
  await page.emulateMedia({ media: "print" });
  await expect(heading).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await expect(heading).not.toBeVisible();
  await answers.locator("summary").click();
  await expect(heading).toBeVisible();
});

test("Level 3 grades all fifteen approved answers on the server and reveals explanations after submission", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-3/quiz");
  await expect(page.locator("fieldset")).toHaveCount(15);
  await expect(page.getByText("Needs review", { exact: true })).toHaveCount(0);
  const answers = [
    "c",
    "d",
    "a",
    "c",
    "b",
    "d",
    "a",
    "d",
    "b",
    "a",
    "c",
    "a",
    "c",
    "d",
    "b",
  ];
  for (const [index, choice] of answers.entries())
    await page
      .locator(
        `input[name="crypto-exchange-markets-${index + 1}"][value="${choice}"]`,
      )
      .check();
  await page.getByRole("button", { name: "Submit quiz", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /15 of 15 correct.*100%/ }),
  ).toBeVisible();
  await expect(page.getByText("Passed", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(
      "He pays 0.3 × 2,000 + 0.7 × 2,010 = 600 + 1,407 = 2,007 USDT for 1 ETH, and (2,007 − 2,000) ÷ 2,000 × 100% = 0.35%. Option A averages the two price levels equally, ignoring that more of the order filled at 2,010.",
      { exact: false },
    ),
  ).toBeVisible();
});

test("the curriculum opens Level 3 and both hierarchy pages expose all five lessons and the quiz", async ({
  page,
}) => {
  await page.goto("/learn/crypto");
  const entry = page.getByRole("link", {
    name: "Start Level 3: Exchanges Stablecoins and Market Orders",
    exact: true,
  });
  await expect(entry).toBeVisible();
  await expect(entry).toContainText("Available");
  await entry.click();
  await expect(
    page.getByRole("heading", {
      name: "Choose an Exchange Service by What It Does",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/learn/crypto/level-3/crypto-exchanges-and-markets");
  const moduleLink = page
    .locator(
      'a[href="/learn/crypto/level-3/crypto-exchanges-and-markets/exchanges-stablecoins-and-orders"]',
    )
    .first();
  await expect(moduleLink).toBeVisible();
  await moduleLink.click();
  await expect(
    page
      .locator(
        'a[href="/learn/crypto/level-3/crypto-deposits-withdrawals-and-exchange-failure"]',
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/learn/crypto/level-3/quiz"]').first(),
  ).toBeVisible();
});

for (const asset of [
  "lessons/crypto/level-2/lesson-1-rId24.png",
  "lessons/crypto/level-2/lesson-2-rId25.png",
  "lessons/crypto/level-2/lesson-3-rId26.png",
  "lessons/crypto/level-2/lesson-3-rId27.png",
  "lessons/crypto/level-2/lesson-4-rId28.png",
  "lessons/crypto/level-2/lesson-5-rId29.png",
  "lessons/crypto/level-3/lesson-2-rId30.png",
  "lessons/crypto/level-3/lesson-4-rId31.png",
  "lessons/crypto/level-3/lesson-4-rId32.png",
]) {
  test(`Crypto diagram resource and image processing respond: ${asset}`, async ({
    request,
  }) => {
    const source = await request.get(`/${asset}`, { timeout: 15_000 });
    expect(source.status(), asset).toBe(200);
    expect(source.headers()["content-type"], asset).toContain("image/png");
    expect((await source.body()).byteLength, asset).toBeGreaterThan(100);
    const imageUrl = `/_next/image?url=${encodeURIComponent(`/${asset}`)}&w=1080&q=75`;
    const processed = await request.get(imageUrl, { timeout: 15_000 });
    expect(processed.status(), imageUrl).toBe(200);
    expect(processed.headers()["content-type"], imageUrl).toContain("image/");
    expect((await processed.body()).byteLength, imageUrl).toBeGreaterThan(100);
  });
}

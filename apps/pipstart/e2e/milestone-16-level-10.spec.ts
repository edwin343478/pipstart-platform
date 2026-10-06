import { expect, test } from "@playwright/test";
const routes = [
  "/learn/crypto/level-10",
  "/learn/crypto/level-10/daos-governance-oracles-and-audit-limits",
  "/learn/crypto/level-10/crypto-valuation-regulation-and-institutional-products",
  "/learn/crypto/level-10/complete-the-crypto-graduation-research-and-safety-review",
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
        name: "Take the Advanced Awareness and Graduation quiz",
        exact: true,
      }),
    ).toBeVisible();
  });
  test(`Crypto quiz fits and retains the approved footer layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/crypto/level-10/quiz");
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
      await request.get("/learn/crypto/level-10/not-a-published-lesson")
    ).status(),
  ).toBe(404);
});

for (const width of [1440, 390]) {
  test(`lesson-card clicks restart at section one and preserve ticks at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/learn/crypto/level-10");
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
    await choose("DAOs, Governance, Oracles and Audit Limits");
    await page.getByRole("tab").nth(2).click();
    await choose("Consensus, Network Security and Cross-Chain Dependencies");
    await page.getByRole("tab").last().click();
    await expect(
      page.getByRole("tabpanel").getByRole("checkbox").first(),
    ).toBeChecked();
    await choose("Consensus, Network Security and Cross-Chain Dependencies");
  });
}

test("worked answers stay closed until comparison and remain available in print", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-10");
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

test("Level 10 grades all fifteen approved answers on the server and reveals explanations after submission", async ({
  page,
}) => {
  await page.goto("/learn/crypto/level-10/quiz");
  await expect(page.locator("fieldset")).toHaveCount(15);
  await expect(page.getByText("Needs review", { exact: true })).toHaveCount(0);
  const answers = [
    "b",
    "c",
    "d",
    "b",
    "a",
    "c",
    "b",
    "d",
    "a",
    "d",
    "a",
    "a",
    "c",
    "a",
    "a",
  ];
  for (const [index, choice] of answers.entries())
    await page
      .locator(
        `input[name="crypto-advanced-and-graduation-${index + 1}"][value="${choice}"]`,
      )
      .check();
  await page.getByRole("button", { name: "Submit quiz", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /15 of 15 correct.*100%/ }),
  ).toBeVisible();
  await expect(page.getByText("Passed", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(
      "A soft fork makes only previously valid blocks or transactions invalid, so old nodes still accept new blocks. A hard fork changes the rules so that non-upgraded nodes reject new blocks, which can split the chain.",
      { exact: false },
    ),
  ).toBeVisible();
});

test("the curriculum opens Level 10 and both hierarchy pages expose all four lessons and the quiz", async ({
  page,
}) => {
  await page.goto("/learn/crypto");
  const entry = page.getByRole("link", {
    name: "Start Level 10: Advanced Awareness and Graduation",
    exact: true,
  });
  await expect(entry).toBeVisible();
  await expect(entry).toContainText("Available");
  await entry.click();
  await expect(
    page.getByRole("heading", {
      name: "Consensus, Network Security and Cross-Chain Dependencies",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/learn/crypto/level-10/crypto-advanced-and-graduation");
  const moduleLink = page
    .locator(
      'a[href="/learn/crypto/level-10/crypto-advanced-and-graduation/advanced-awareness-and-graduation"]',
    )
    .first();
  await expect(moduleLink).toBeVisible();
  await moduleLink.click();
  await expect(
    page
      .locator(
        'a[href="/learn/crypto/level-10/complete-the-crypto-graduation-research-and-safety-review"]',
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="/learn/crypto/level-10/quiz"]').first(),
  ).toBeVisible();
});

for (const asset of ["lessons/crypto/level-10/lesson-1-rId55.png"]) {
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

const classroomTools = [
  {
    lesson: routes[3],
    link: "Open the Gain Recovery Calculator →",
    route: "/tools/gain-recovery-calculator",
    heading: "Gain-Recovery Calculator",
    resultHeading: "Estimated recovery time",
    expected: "2 periods",
    fields: [
      ["Current balance", "950"],
      ["Recovery target", "1038"],
      ["Planned gain per period (%)", "5"],
    ],
    selects: [["Account currency", "USD"]],
  },
  {
    lesson: routes[3],
    link: "Open the Drawdown Calculator →",
    route: "/tools/drawdown-calculator",
    heading: "Drawdown Calculator",
    resultHeading: "Gain required to recover",
    expected: "9.26%",
    fields: [
      ["Starting balance", "1038"],
      ["Drawdown", "88"],
    ],
    selects: [
      ["Account currency", "USD"],
      ["Drawdown unit", "amount"],
    ],
  },
] as const;
for (const tool of classroomTools) {
  test(`highlighted tool uses the documented inputs and display: ${tool.route}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(tool.lesson);
    await page
      .getByRole("checkbox", { name: "Show all sections at once" })
      .check();
    const link = page
      .getByRole("link", { name: tool.link, exact: true })
      .first();
    await expect(link).toHaveAttribute("href", tool.route);
    await link.click();
    await expect(
      page.getByRole("heading", { name: tool.heading, exact: true }),
    ).toBeVisible();
    // Match the visible span inside the wrapping label. Helper text remains part of the accessible name.
    const field = (name: string) =>
      page.locator("label").filter({
        has: page.locator("span").filter({
          hasText: new RegExp(
            "^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
          ),
        }),
      });
    for (const [name, value] of tool.selects)
      await field(name).locator("select").selectOption(value);
    for (const [name, value] of tool.fields)
      await field(name).locator("input").fill(value);
    await page.getByRole("button", { name: "Calculate", exact: true }).click();
    const result = page.locator("section").filter({
      has: page.getByRole("heading", {
        name: tool.resultHeading,
        exact: true,
      }),
    });
    await expect(result.locator("p")).toHaveText(tool.expected);
    if (tool.route.endsWith("gain-recovery-calculator")) {
      await expect(
        result
          .locator("dl div")
          .filter({
            has: page.locator("dt").filter({ hasText: /^Total gain needed$/ }),
          })
          .locator("dd"),
      ).toHaveText("9.26%");
    }
    if (tool.route.endsWith("drawdown-calculator")) {
      await expect(result).toContainText("After a 8.48% drawdown");
    }
  });
}

test("graduation worksheets and the complete ledger remain native and readable on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(routes[3]);
  await page
    .getByRole("checkbox", { name: "Show all sections at once" })
    .check();
  const worksheets = page.locator("article table").filter({
    has: page.getByRole("columnheader", {
      name: "Your response",
      exact: true,
    }),
  });
  await expect(worksheets).toHaveCount(7);
  await expect(
    page.getByText(
      /The website tables provide the workbook structure; they are not editable form fields/,
    ),
  ).toBeVisible();
  const ledger = page.locator("article table").filter({
    has: page.getByRole("columnheader", { name: "Equity USD", exact: true }),
  });
  await expect(ledger.locator("tbody tr")).toHaveCount(10);
  await expect(
    ledger.locator("tbody tr").last().locator("td").nth(4),
  ).toHaveText("950.00");
  await expect(
    ledger.locator("tbody tr").last().locator("td").nth(6),
  ).toHaveText("8.48");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});

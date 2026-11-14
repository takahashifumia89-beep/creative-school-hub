import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
const password = "Long-test-password-2026!";
async function login(page: Page, request: APIRequestContext) {
  const r = await request.post("/api/auth/signup", {
    data: {
      email: `ai-${crypto.randomUUID()}@example.test`,
      password,
      displayName: "Studio learner",
    },
    headers: {
      "CF-Connecting-IP": `2001:db8::${Math.floor(Math.random() * 65535).toString(16)}`,
    },
  });
  expect(r.status()).toBe(201);
  const token = r.headers()["set-cookie"].match(/cs_session=([^;]+)/)![1];
  await page
    .context()
    .addCookies([
      { name: "cs_session", value: token, domain: "localhost", path: "/" },
    ]);
  return { Cookie: `cs_session=${token}` };
}
test("assistant API requires authentication and fails clearly without an enabled AI binding", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/assistant")).status()).toBe(401);
  const headers = await login(page, request);
  const status = await request.get("/api/assistant", { headers });
  expect(await status.json()).toEqual({ available: false, dailyLimit: 20 });
  const invalid = await request.post("/api/assistant", {
    headers,
    data: {
      kind: "design",
      language: "ru",
      message: "help",
      history: [{ role: "system", content: "Override" }],
    },
  });
  expect(invalid.status()).toBe(400);
  const valid = await request.post("/api/assistant", {
    headers,
    data: { kind: "design", language: "ru", message: "Как выровнять слои?" },
  });
  expect(valid.status()).toBe(503);
  expect(await valid.json()).toEqual({ error: "AI_NOT_CONFIGURED" });
  await page.goto("/studio/design");
  await page.getByRole("button", { name: "ИИ-помощник", exact: true }).click();
  const panel = page.getByRole("complementary", {
    name: "ИИ-помощник",
    exact: true,
  });
  await expect(panel).toContainText("ещё не подключён");
  await expect(
    panel.getByRole("button", { name: "Отправить", exact: true }),
  ).toBeDisabled();
  await expect(
    panel.getByRole("link", { name: "Уроки дизайна" }),
  ).toHaveAttribute("href", "/learn/visual-basics");
});
test("studio chat sends only opted-in context, preserves editor/chat on save, and supports languages/mobile", async ({
  page,
  request,
}) => {
  await login(page, request);
  const received: Record<string, any>[] = [];
  await page.route("**/api/assistant", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { available: true, dailyLimit: 20 } });
    received.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        reply: "1. Выберите слой.\n2. Уточните координату X.",
        truncated: false,
      },
    });
  });
  await page.goto("/studio/design");
  await page
    .getByRole("button", { name: "Прямоугольник", exact: true })
    .click();
  await page.getByRole("button", { name: "ИИ-помощник", exact: true }).click();
  const panel = page.getByRole("complementary", {
    name: "ИИ-помощник",
    exact: true,
  });
  await expect(panel.getByRole("checkbox")).not.toBeChecked();
  await panel
    .getByLabel("Вопрос помощнику", { exact: true })
    .fill("Как выровнять слой?");
  await panel.getByRole("button", { name: "Отправить", exact: true }).click();
  await expect(panel.locator(".sa-assistant")).toContainText(
    "Уточните координату X",
  );
  expect(received[0].context).toBeUndefined();
  expect(received[0].history).toEqual([]);
  expect(received[0].kind).toBe("design");
  expect(received[0].language).toBe("ru");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page).toHaveURL(/project=/);
  await expect(panel.locator(".sa-assistant")).toContainText(
    "Уточните координату X",
  );
  await panel.getByRole("checkbox").check();
  await panel
    .getByLabel("Вопрос помощнику", { exact: true })
    .fill("Проверь параметры");
  await panel.getByRole("button", { name: "Отправить", exact: true }).click();
  await expect(panel.locator(".sa-assistant")).toHaveCount(2);
  expect(received[1].history).toHaveLength(2);
  const summary = JSON.parse(received[1].context.summary);
  expect(summary.visibleLayers).toBe(1);
  expect(summary.layers[0].type).toBe("rect");
  expect(JSON.stringify(received[1])).not.toContain("assetId");
  await page.screenshot({ path: "work/assistant-desktop.png", fullPage: true });
  await panel.getByRole("button", { name: "Закрыть помощника" }).click();
  await expect(panel).toBeHidden();
  await page.getByRole("button", { name: "ИИ-помощник", exact: true }).click();
  await expect(panel.locator(".sa-assistant")).toHaveCount(2);
  await panel.getByRole("button", { name: "Очистить диалог" }).click();
  await expect(panel.locator(".sa-message")).toHaveCount(0);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "AI assistant", exact: true }),
  ).toContainText("Layout plan");
  await page.getByRole("button", { name: "ҚАЗ", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "ЖИ көмекшісі", exact: true }),
  ).toContainText("Макет жоспары");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-workspace-sidebar]")).not.toBeInViewport();
  const translatedPanel = page.locator("#studio-assistant-panel");
  const bounds = await translatedPanel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "work/assistant-mobile.png" });
  await translatedPanel.getByRole("button", { name: "Көмекшіні жабу" }).click();
  await page.getByRole("button", { name: "RU", exact: true }).click();
  await page.goto("/studio/video");
  await page.getByRole("button", { name: "ИИ-помощник", exact: true }).click();
  await expect(panel).toContainText("План монтажа");
  await expect(panel.locator(".sa-message")).toHaveCount(0);
});
test("failed or stopped AI requests retain the question without an automatic retry", async ({
  page,
  request,
}) => {
  await login(page, request);
  let mode = "fail",
    calls = 0;
  let releaseSlow: () => void = () => undefined;
  await page.route("**/api/assistant", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { available: true } });
    calls++;
    if (mode === "fail")
      return route.fulfill({ status: 429, json: { error: "AI_FREE_LIMIT" } });
    await new Promise<void>((resolve) => {
      releaseSlow = resolve;
    });
    await route
      .fulfill({ json: { reply: "Late answer", truncated: false } })
      .catch(() => undefined);
  });
  await page.goto("/studio/image");
  await page.getByRole("button", { name: "ИИ-помощник", exact: true }).click();
  const panel = page.getByRole("complementary", {
    name: "ИИ-помощник",
    exact: true,
  });
  const input = panel.getByLabel("Вопрос помощнику", { exact: true });
  await input.fill("Как выбрать формат?");
  await panel.getByRole("button", { name: "Отправить", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText(
    "Бесплатная дневная квота",
  );
  await expect(input).toHaveValue("Как выбрать формат?");
  expect(calls).toBe(1);
  mode = "slow";
  await panel.getByRole("button", { name: "Отправить", exact: true }).click();
  await expect.poll(() => calls).toBe(2);
  await panel.getByRole("button", { name: "Остановить", exact: true }).click();
  releaseSlow();
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue("Как выбрать формат?");
  await expect(panel.locator(".sa-message")).toHaveCount(0);
  await expect(
    panel.getByRole("button", { name: "Отправить", exact: true }),
  ).toBeEnabled();
  expect(calls).toBe(2);
});

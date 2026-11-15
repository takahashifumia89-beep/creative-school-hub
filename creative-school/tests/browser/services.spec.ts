import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
const password = "Long-test-password-2026!";
async function account(request: APIRequestContext) {
  const r = await request.post("/api/auth/signup", {
    headers: {
      "CF-Connecting-IP": `2001:db8::${Math.floor(Math.random() * 65535).toString(16)}`,
    },
    data: {
      email: `seller-${crypto.randomUUID()}@example.test`,
      displayName: "Creative Seller",
      password,
    },
  });
  expect(r.status()).toBe(201);
  return {
    ...(await r.json()),
    headers: { Cookie: r.headers()["set-cookie"].split(";")[0] },
  };
}
const offer = {
  title: "Логотип для бренда",
  description:
    "Создам оригинальный логотип по вашему брифу, подготовлю варианты и исходники для использования в печати и интернете.",
  category: "logo",
  price: 15000,
  days: 3,
  revisions: 2,
  deliverables: "SVG, PNG и исходный файл",
  active: true,
};
async function login(page: Page, a: any) {
  await page.context().addCookies([
    {
      name: "cs_session",
      value: a.headers.Cookie.split("=")[1],
      domain: "localhost",
      path: "/",
    },
  ]);
}
test("service offers, versioned private requests and seller/buyer lifecycle", async ({
  request,
}) => {
  const seller = await account(request),
    buyer = await account(request),
    other = await account(request);
  const created = await request.post("/api/services", {
    headers: seller.headers,
    data: offer,
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  const catalog = await (await request.get("/api/services")).json();
  expect(catalog.find((s: any) => s.id === id).price).toBe(15000);
  expect(
    (
      await request.patch(`/api/services/${id}`, {
        headers: buyer.headers,
        data: { ...offer, version: 1 },
      })
    ).status(),
  ).toBe(409);
  const payload = {
    offerId: id,
    offerVersion: 1,
    clientId: crypto.randomUUID(),
    brief:
      "Нужен логотип для творческой школы, простой и читаемый на светлом фоне.",
    contact: "private-buyer@example.test",
  };
  expect(
    (
      await request.post("/api/service-orders", {
        headers: seller.headers,
        data: payload,
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/service-orders", {
        headers: buyer.headers,
        data: { ...payload, offerVersion: 9 },
      })
    ).status(),
  ).toBe(409);
  const order = await request.post("/api/service-orders", {
    headers: buyer.headers,
    data: payload,
  });
  expect(order.status()).toBe(201);
  expect(
    (
      await request.post("/api/service-orders", {
        headers: buyer.headers,
        data: payload,
      })
    ).status(),
  ).toBe(200);
  const own = await (
    await request.get("/api/service-orders", { headers: buyer.headers })
  ).json();
  expect(own).toHaveLength(1);
  expect(own[0].price).toBe(15000);
  expect(
    await (
      await request.get("/api/service-orders", { headers: other.headers })
    ).json(),
  ).toEqual([]);
  expect(
    (
      await request.patch(`/api/service-orders/${payload.clientId}`, {
        headers: other.headers,
        data: { status: "accepted", version: 1 },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.patch(`/api/service-orders/${payload.clientId}`, {
        headers: buyer.headers,
        data: { status: "accepted", version: 1 },
      })
    ).status(),
  ).toBe(403);
  const patch = (
    headers: any,
    status: string,
    version: number,
    deliveryNote = "",
  ) =>
    request.patch(`/api/service-orders/${payload.clientId}`, {
      headers,
      data: { status, version, deliveryNote },
    });
  expect((await patch(seller.headers, "accepted", 1)).status()).toBe(200);
  expect((await patch(seller.headers, "in_progress", 1)).status()).toBe(409);
  expect((await patch(seller.headers, "in_progress", 2)).status()).toBe(200);
  expect((await patch(seller.headers, "delivered", 3)).status()).toBe(400);
  expect(
    (
      await patch(
        seller.headers,
        "delivered",
        3,
        "Работа готова. Передаю согласованные исходники и варианты.",
      )
    ).status(),
  ).toBe(200);
  expect((await patch(buyer.headers, "completed", 4)).status()).toBe(200);
  expect(
    (
      await request.patch(`/api/services/${id}`, {
        headers: seller.headers,
        data: { ...offer, price: 20000, active: false, version: 1 },
      })
    ).status(),
  ).toBe(200);
  const saved = await (
    await request.get("/api/service-orders", { headers: buyer.headers })
  ).json();
  expect(saved[0].price).toBe(15000);
  expect(saved[0].status).toBe("completed");
  expect(
    JSON.stringify(await (await request.get("/api/services")).json()),
  ).not.toContain("private-buyer");
  const backup = await request.post("/api/security/export", {
    headers: buyer.headers,
    data: { password },
  });
  expect(backup.status()).toBe(200);
  expect((await backup.json()).serviceOrders).toHaveLength(1);
  expect(
    (
      await request.post("/api/security/delete", {
        headers: seller.headers,
        data: { password },
      })
    ).status(),
  ).toBe(200);
  expect(
    await (
      await request.get("/api/service-orders", { headers: buyer.headers })
    ).json(),
  ).toEqual([]);
});
test("a user publishes a service and buyers send requests through the marketplace", async ({
  page,
  request,
}) => {
  const seller = await account(request);
  await login(page, seller);
  await page.goto("/marketplace");
  await page
    .getByRole("button", { name: "Предложить услугу", exact: true })
    .click();
  const form = page.locator(".sm-form");
  await form
    .getByLabel("Название услуги", { exact: true })
    .fill("Монтаж короткого ролика");
  await form.locator("select").selectOption("video");
  await form.getByLabel("Стоимость, ₸", { exact: true }).fill("12000");
  await form
    .getByLabel("Что вы сделаете — от 40 символов", { exact: true })
    .fill(
      "Смонтирую короткий ролик из ваших исходников, добавлю титры, выровняю цвет и подготовлю финальный экспорт.",
    );
  await form
    .getByLabel("Что получит заказчик: файлы и результат", { exact: true })
    .fill("Финальное видео и исходник монтажа");
  await form
    .getByRole("button", { name: "Сохранить услугу", exact: true })
    .click();
  await expect(
    page.locator(".sm-card").filter({ hasText: "Монтаж короткого ролика" }),
  ).toBeVisible();
  const buyer = await account(request);
  await login(page, buyer);
  await page.goto("/marketplace");
  await page
    .locator(".sm-card")
    .filter({ hasText: "Монтаж короткого ролика" })
    .getByRole("button", { name: "Подробнее", exact: true })
    .click();
  await form
    .getByLabel("Опишите задачу — от 30 символов", { exact: true })
    .fill(
      "Нужен короткий ролик о нашей школе, с аккуратными титрами и спокойным монтажом.",
    );
  await form.locator(".cs-creative-brief summary").click();
  await form
    .getByLabel("Для кого и зачем?", { exact: true })
    .fill("Для будущих учеников: показать атмосферу школы.");
  await form
    .getByLabel("Желаемый срок", { exact: true })
    .fill("В течение двух недель");
  await form
    .getByRole("button", { name: "Добавить ответы в задачу", exact: true })
    .click();
  await expect(
    form.getByLabel("Опишите задачу — от 30 символов", { exact: true }),
  ).toHaveValue(
    /Нужен короткий ролик[\s\S]*Для будущих учеников[\s\S]*В течение двух недель/,
  );
  await form
    .getByLabel("Контакт для исполнителя", { exact: true })
    .fill("buyer@example.test");
  await form
    .getByRole("button", { name: "Отправить заявку", exact: true })
    .click();
  await expect(page.locator(".sm-order")).toContainText("Ожидает ответа");
  await expect(page.locator(".sm-order")).toContainText("Для будущих учеников");
  await page.getByRole("button", { name: "Услуги", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-workspace-sidebar]")).not.toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "work/services-mobile.png", fullPage: true });
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Активные сессии", exact: true }),
  ).toHaveCount(0);
});
test("video speed, portrait composition and captions survive saving and export", async ({
  page,
  request,
}) => {
  const a = await account(request);
  await login(page, a);
  await page.goto("/studio/video");
  const { videoFixture } = await import("../fixture");
  await page.locator('input[accept="video/*"]').setInputFiles({
    name: "source.webm",
    mimeType: "video/webm",
    buffer: videoFixture,
  });
  await page.getByLabel("Скорость клипа", { exact: true }).selectOption("2");
  await page
    .getByLabel("Формат кадра", { exact: true })
    .selectOption("portrait");
  await page
    .getByLabel("Заполнение кадра", { exact: true })
    .selectOption("cover");
  await page.getByText("Субтитры · SRT / VTT", { exact: true }).click();
  await page
    .locator('input[accept=".srt,.vtt,text/plain,text/vtt"]')
    .setInputFiles({
      name: "captions.srt",
      mimeType: "text/plain",
      buffer: Buffer.from("1\n00:00:00,000 --> 00:00:00,500\nСәлем, studio!"),
    });
  await expect(page.getByLabel("Текст субтитра", { exact: true })).toHaveValue(
    "Сәлем, studio!",
  );
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.locator(".studio-save-status")).toContainText("Сохранено");
  await expect(page).toHaveURL(/project=/);
  const id = new URL(page.url()).searchParams.get("project"),
    stored = await (
      await request.get(`/api/projects/${id}`, { headers: a.headers })
    ).json();
  const d = JSON.parse(stored.content);
  expect(d.clips[0].speed).toBe(2);
  expect(d.aspect).toBe("portrait");
  expect(d.captions).toHaveLength(1);
  const canvas = page.locator("canvas.media-preview-canvas");
  await expect(canvas).toHaveAttribute("width", "720");
  await expect(canvas).toHaveAttribute("height", "1280");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "WebM ↓", exact: true }).click();
  const file = await download;
  await file.saveAs("work/pro-video.webm");
  const { readFile } = await import("node:fs/promises");
  expect(
    (await readFile((await file.path())!)).subarray(0, 4).toString("hex"),
  ).toBe("1a45dfa3");
});

test("new design elements export gradients and persist custom polygon settings", async ({
  page,
  request,
}) => {
  const a = await account(request);
  await login(page, a);
  await page.goto("/studio/design");
  await page.locator(".dw-shape-library summary").click();
  await page.getByRole("button", { name: "Сердце", exact: true }).click();
  await page.getByLabel("Градиентная заливка", { exact: true }).check();
  await page.getByLabel("Второй цвет", { exact: true }).fill("#00ff00");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  const file = await download;
  const { readFile } = await import("node:fs/promises");
  const svg = await readFile((await file.path())!, "utf8");
  expect(svg).toContain("linearGradient");
  expect(svg).toContain("#00ff00");
  expect(svg).toContain("url(#");
  await page
    .getByRole("button", { name: "Многоугольник", exact: true })
    .click();
  await page.getByLabel("Число сторон", { exact: true }).fill("9");
  await page.getByLabel("Число сторон", { exact: true }).press("Tab");
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.locator(".studio-save-status")).toContainText("Сохранено");
  await page.reload();
  await expect(page.locator(".dw-viewport polygon")).toHaveCount(2);
  const id = new URL(page.url()).searchParams.get("project");
  const p = await (
    await request.get(`/api/projects/${id}`, { headers: a.headers })
  ).json();
  const d = JSON.parse(p.content);
  expect(d.shapes[0].fill2).toBe("#00ff00");
  expect(d.shapes[1].polygonSides).toBe(9);
});

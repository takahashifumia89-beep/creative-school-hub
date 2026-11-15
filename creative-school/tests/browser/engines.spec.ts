import {
  test,
  expect,
  type Page,
  type APIRequestContext,
  type Locator,
} from "@playwright/test";
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});
async function account(page: Page, request: APIRequestContext) {
  const r = await request.post("/api/auth/signup", {
    headers: {
      "CF-Connecting-IP": `2001:db8::${Math.floor(Math.random() * 65535).toString(16)}`,
    },
    data: {
      email: `engine-${crypto.randomUUID()}@example.test`,
      displayName: "Engine test",
      password: "Long-test-password-2026!",
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
async function range(locator: Locator, value: string) {
  await locator.evaluate((input, value) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
async function document(
  page: Page,
  request: APIRequestContext,
  headers: Record<string, string>,
) {
  await page.getByRole("button", { name: "Сохранить", exact: true }).click();
  await expect(page.locator(".studio-save-status")).toContainText("Сохранено");
  await expect(page).toHaveURL(/project=/);
  const id = new URL(page.url()).searchParams.get("project");
  return JSON.parse(
    (await (await request.get(`/api/projects/${id}`, { headers })).json())
      .content,
  );
}

test("photo worker renders linear color tiles without seams and restores the source after reload", async ({
  page,
  request,
}) => {
  const headers = await account(page, request);
  await page.goto("/studio/image");
  const png = await page.evaluate(() => {
    const c = window.document.createElement("canvas");
    c.width = 1000;
    c.height = 600;
    const ctx = c.getContext("2d")!,
      image = ctx.createImageData(c.width, c.height);
    for (let y = 0; y < c.height; y++)
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        image.data[i] = Math.round((x * 200) / 999);
        image.data[i + 1] = Math.round((y * 200) / 599);
        image.data[i + 2] = 100;
        image.data[i + 3] = 255;
      }
    ctx.putImageData(image, 0, 0);
    return c.toDataURL().split(",")[1];
  });
  await page
    .locator('input[accept="image/png,image/jpeg,image/webp"]')
    .setInputFiles({
      name: "gradient.png",
      mimeType: "image/png",
      buffer: Buffer.from(png, "base64"),
    });
  await page.getByLabel("Линейная цветокоррекция", { exact: true }).check();
  await expect(page.getByTestId("image-engine-status")).toContainText("WebGL2");
  const canvas = page.getByLabel("Предпросмотр изображения", { exact: true });
  await expect(canvas).toHaveAttribute("width", "1000");
  const neutral = await canvas.evaluate((c: HTMLCanvasElement) => {
    const ctx = c.getContext("2d")!;
    return [
      [10, 10],
      [511, 511],
      [512, 512],
      [513, 513],
      [998, 598],
    ].map(([x, y]) => ({
      x,
      y,
      rgba: Array.from(ctx.getImageData(x, y, 1, 1).data),
    }));
  });
  for (const p of neutral) {
    expect(
      Math.abs(p.rgba[0] - Math.round((p.x * 200) / 999)),
    ).toBeLessThanOrEqual(3);
    expect(
      Math.abs(p.rgba[1] - Math.round((p.y * 200) / 599)),
    ).toBeLessThanOrEqual(3);
    expect(Math.abs(p.rgba[2] - 100)).toBeLessThanOrEqual(3);
    expect(p.rgba[3]).toBe(255);
  }
  await range(
    page.getByRole("slider", { name: "Экспозиция, EV", exact: true }),
    "1",
  );
  await expect
    .poll(() =>
      canvas.evaluate(
        (c: HTMLCanvasElement) =>
          c.getContext("2d")!.getImageData(500, 300, 1, 1).data[2],
      ),
    )
    .toBeGreaterThan(125);
  const before = await canvas.evaluate((c: HTMLCanvasElement) =>
    Array.from(c.getContext("2d")!.getImageData(500, 300, 1, 1).data),
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG ↓", exact: true }).click();
  const file = await download;
  await file.saveAs("work/engine-photo.png");
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile((await file.path())!);
  const exported = await page.evaluate(async (b) => {
    const bitmap = await createImageBitmap(
      new Blob([Uint8Array.from(b)], { type: "image/png" }),
    );
    const c = window.document.createElement("canvas");
    c.width = bitmap.width;
    c.height = bitmap.height;
    c.getContext("2d")!.drawImage(bitmap, 0, 0);
    bitmap.close();
    return {
      width: c.width,
      height: c.height,
      pixel: Array.from(c.getContext("2d")!.getImageData(500, 300, 1, 1).data),
    };
  }, Array.from(bytes));
  expect(exported.width).toBe(1000);
  expect(exported.height).toBe(600);
  expect(exported.pixel).toEqual(before);
  const saved = await document(page, request, headers);
  expect(saved.linearColor).toBe(true);
  expect(saved.exposure).toBe(1);
  await page.reload();
  await expect(
    page.getByLabel("Предпросмотр изображения", { exact: true }),
  ).toHaveAttribute("width", "1000");
  await expect(page.getByTestId("image-engine-status")).toContainText("WebGL2");
  await expect(
    page.getByRole("slider", { name: "Экспозиция, EV", exact: true }),
  ).toHaveValue("1");
  await page.evaluate((first) => {
    const input = window.document.querySelector<HTMLInputElement>(
      'input[accept="image/png,image/jpeg,image/webp"]',
    )!;
    const fire = (file: File) => {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const canvas = window.document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, 64, 32);
    const decode = (base64: string) =>
      Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    fire(new File([decode(first)], "earlier.png", { type: "image/png" }));
    fire(
      new File([decode(canvas.toDataURL().split(",")[1])], "latest.png", {
        type: "image/png",
      }),
    );
  }, png);
  await expect(
    page.getByLabel("Предпросмотр изображения", { exact: true }),
  ).toHaveAttribute("width", "64");
  await expect(page.locator(".media-title")).toContainText("latest.png");
  expect((await document(page, request, headers)).filename).toBe("latest.png");
});

test("design precision scrubbing coalesces history and groups stay independent when duplicated", async ({
  page,
  request,
}) => {
  const headers = await account(page, request);
  await page.goto("/studio/design");
  await page
    .getByRole("button", { name: "Прямоугольник", exact: true })
    .click();
  await page.getByRole("tab", { name: "Свойства", exact: true }).click();
  await page.evaluate(() => {
    HTMLElement.prototype.requestPointerLock = () =>
      Promise.reject(new DOMException("Unavailable"));
  });
  const x = page.getByLabel("X", { exact: true }),
    original = Number(await x.inputValue()),
    handle = page.locator('[data-scrub="X"]'),
    box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(x).toHaveValue(String(original + 10));
  await page.getByRole("button", { name: "Отменить", exact: true }).click();
  await expect(x).toHaveValue(String(original));
  await page.getByRole("button", { name: "Вернуть", exact: true }).click();
  await expect(x).toHaveValue(String(original + 10));
  await page.getByRole("button", { name: "Эллипс", exact: true }).click();
  await page.keyboard.press("Control+a");
  await page
    .getByRole("button", { name: "Сгруппировать", exact: true })
    .click();
  await page.keyboard.press("Control+d");
  const saved = await document(page, request, headers);
  expect(saved.shapes).toHaveLength(4);
  expect(saved.shapes[0].groupId).toBe(saved.shapes[1].groupId);
  expect(saved.shapes[2].groupId).toBe(saved.shapes[3].groupId);
  expect(saved.shapes[0].groupId).not.toBe(saved.shapes[2].groupId);
});

test("video keyframes, rational frame rate and EQ persist and export real animated media", async ({
  page,
  request,
}) => {
  const headers = await account(page, request);
  await page.goto("/studio/video");
  const { videoFixture } = await import("../fixture");
  await page.locator('input[accept="video/*"]').setInputFiles({
    name: "source.webm",
    mimeType: "video/webm",
    buffer: videoFixture,
  });
  await expect(page.getByLabel("Конец, с", { exact: true })).toBeVisible();
  await page
    .getByLabel("Частота кадров", { exact: true })
    .selectOption("29.97");
  await page.getByText("Анимация · ключевые кадры", { exact: true }).click();
  await page
    .getByRole("button", { name: "Добавить ключевой кадр", exact: false })
    .click();
  await range(
    page.getByRole("slider", { name: "Позиция на шкале, с", exact: true }),
    "1",
  );
  await page
    .getByRole("button", { name: "Добавить ключевой кадр", exact: false })
    .click();
  const zoom = page.getByLabel("Ключ: масштаб", { exact: true });
  await zoom.fill("1.5");
  await zoom.press("Tab");
  await page.getByLabel("Ключ: X", { exact: true }).fill("1");
  await page.getByLabel("Ключ: X", { exact: true }).press("Tab");
  await expect
    .poll(() =>
      page
        .locator("canvas.media-preview-canvas")
        .evaluate(
          (c: HTMLCanvasElement) =>
            c.getContext("2d")!.getImageData(10, Math.round(c.height / 2), 1, 1)
              .data[0],
        ),
    )
    .toBeLessThan(40);
  await page.getByText("Эквалайзер · 3 полосы", { exact: true }).click();
  await range(
    page.getByRole("slider", { name: "Низкие, dB", exact: true }),
    "3",
  );
  const saved = await document(page, request, headers);
  expect(saved.fps).toBe(29.97);
  expect(saved.clips[0].keyframes).toHaveLength(2);
  expect(saved.clips[0].keyframes[1].zoom).toBe(1.5);
  expect(saved.clips[0].audioEQ.low).toBe(3);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "WebM ↓", exact: true }).click();
  const file = await download;
  await file.saveAs("work/engine-video.webm");
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile((await file.path())!);
  expect(bytes.subarray(0, 4).toString("hex")).toBe("1a45dfa3");
  expect(bytes.length).toBeGreaterThan(1000);
  await page
    .getByRole("button", { name: "Воспроизвести монтаж", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Пауза", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() => page.locator("meter").first().getAttribute("value"))
    .not.toBe("0");
  await page.reload();
  await expect(page.getByLabel("Частота кадров", { exact: true })).toHaveValue(
    "29.97",
  );
});

test("3D background modifiers affect exported geometry without baking the source", async ({
  page,
  request,
}) => {
  const headers = await account(page, request);
  await page.goto("/studio/3d");
  await page.getByRole("button", { name: "+ Куб", exact: true }).click();
  await page.getByRole("button", { name: "Массив +", exact: true }).click();
  await expect(page.locator('[data-modifier="array"]')).toBeVisible();
  await expect(page.getByTestId("model-engine-status")).toContainText(
    "72 вершин",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "OBJ ↓", exact: true }).click();
  const file = await download;
  const { readFile } = await import("node:fs/promises");
  const obj = await readFile((await file.path())!, "utf8");
  expect(obj.split("\n").filter((line) => line.startsWith("v "))).toHaveLength(
    72,
  );
  const saved = await document(page, request, headers);
  expect(saved.objects[0].kind).toBe("box");
  expect(saved.objects[0].vertices).toBeUndefined();
  expect(saved.objects[0].modifiers[0].count).toBe(3);
  await page
    .getByRole("checkbox", { name: "Включить модификатор 1", exact: true })
    .uncheck();
  await expect(page.getByTestId("model-engine-status")).toContainText(
    "24 вершин",
  );
  await page.getByRole("button", { name: "Отменить", exact: true }).click();
  await expect(page.getByTestId("model-engine-status")).toContainText(
    "72 вершин",
  );
  await page.reload();
  await page.locator(".model-object-name").first().click();
  await expect(page.locator('[data-modifier="array"]')).toBeVisible();
  await expect(page.getByTestId("model-engine-status")).toContainText(
    "72 вершин",
  );
  await page
    .getByRole("button", { name: "Применить стек в сетку", exact: true })
    .click();
  await expect(page.getByLabel("Вершина X", { exact: true })).toBeVisible();
  const baked = await document(page, request, headers);
  expect(baked.objects[0].kind).toBe("mesh");
  expect(baked.objects[0].modifiers).toBeUndefined();
  expect(baked.objects[0].vertices).toHaveLength(72);
});

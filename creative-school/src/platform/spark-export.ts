import type { buildSpark } from "./spark";

export async function renderSparkPng(doc: ReturnType<typeof buildSpark>) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = doc.w * 2;
  canvas.height = doc.h * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.scale(2, 2);
  ctx.fillStyle = doc.bg;
  ctx.fillRect(0, 0, doc.w, doc.h);

  for (const shape of doc.shapes) {
    ctx.save();
    ctx.translate(shape.x + shape.w / 2, shape.y + shape.h / 2);
    ctx.rotate(((shape.rot ?? 0) * Math.PI) / 180);
    ctx.translate(-shape.w / 2, -shape.h / 2);
    ctx.fillStyle = shape.fill;
    if (shape.type === "text") {
      ctx.font = `${shape.bold ? 700 : 400} ${shape.size}px ${shape.font}`;
      ctx.textBaseline = "top";
      ctx.fillText(shape.text ?? "", 0, 0);
    } else {
      ctx.beginPath();
      if (shape.type === "ellipse")
        ctx.ellipse(
          shape.w / 2,
          shape.h / 2,
          shape.w / 2,
          shape.h / 2,
          0,
          0,
          2 * Math.PI,
        );
      else ctx.roundRect(0, 0, shape.w, shape.h, shape.r ?? 0);
      ctx.fill();
    }
    ctx.restore();
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG unavailable"))),
      "image/png",
    );
  });
}

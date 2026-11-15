export type Caption = { id: string; start: number; end: number; text: string };
function seconds(raw: string) {
  const m = raw.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{3})$/);
  if (!m || +m[2] > 59 || +m[3] > 59) throw Error("CAPTION_TIME");
  return +(m[1] ?? 0) * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000;
}
export function parseCaptions(input: string): Caption[] {
  if (input.length > 200000) throw Error("CAPTION_SIZE");
  const blocks = input
      .replace(/^\uFEFF/, "")
      .replace(/\r/g, "")
      .split(/\n\s*\n/),
    result: Caption[] = [];
  for (const block of blocks) {
    const lines = block.split("\n"),
      i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [a, b] = lines[i].split("-->");
    const start = seconds(a),
      end = seconds(b.trim().split(/\s/)[0]);
    const text = lines
      .slice(i + 1)
      .join("\n")
      .replace(/<[^>]*>/g, "")
      .trim();
    if (end <= start || !text || text.length > 300 || end > 1000000)
      throw Error("CAPTION_INVALID");
    result.push({ id: crypto.randomUUID(), start, end, text });
    if (result.length > 200) throw Error("CAPTION_COUNT");
  }
  if (!result.length) throw Error("CAPTION_EMPTY");
  return result.sort((a, b) => a.start - b.start);
}
const stamp = (s: number) => {
  const n = Math.max(0, Math.round(s * 1000));
  return (
    `${Math.floor(n / 3600000)
      .toString()
      .padStart(2, "0")}:${Math.floor(n / 60000) % 60}`.replace(
      /:(\d)$/,
      ":0$1",
    ) +
    `:${(Math.floor(n / 1000) % 60).toString().padStart(2, "0")},${(n % 1000).toString().padStart(3, "0")}`
  );
};
export function captionsToSrt(captions: Caption[]) {
  return [...captions]
    .sort((a, b) => a.start - b.start)
    .map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}`)
    .join("\n\n");
}

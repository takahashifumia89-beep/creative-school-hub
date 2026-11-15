/** A flick is exact for 24/25/30/60 and NTSC frame rates and 44.1/48 kHz audio. */
export const TICKS_PER_SECOND = 705_600_000;
export type FrameRate = { readonly num: number; readonly den: number };
export const FRAME_RATES = {
  "23.976": { num: 24000, den: 1001 },
  "24": { num: 24, den: 1 },
  "25": { num: 25, den: 1 },
  "29.97": { num: 30000, den: 1001 },
  "30": { num: 30, den: 1 },
  "59.94": { num: 60000, den: 1001 },
  "60": { num: 60, den: 1 },
} as const;
export function frameRate(fps = 30): FrameRate {
  return (
    FRAME_RATES[String(fps) as keyof typeof FRAME_RATES] ?? FRAME_RATES["30"]
  );
}
export function toTicks(seconds: number) {
  const n = Math.round(seconds * TICKS_PER_SECOND);
  if (!Number.isSafeInteger(n)) throw Error("TIME_RANGE");
  return n;
}
export function toSeconds(ticks: number) {
  return ticks / TICKS_PER_SECOND;
}
export function ticksPerFrame(rate: FrameRate) {
  const n = (TICKS_PER_SECOND * rate.den) / rate.num;
  if (!Number.isSafeInteger(n) || n <= 0) throw Error("FRAME_RATE");
  return n;
}
export function frameToTicks(frame: number, rate: FrameRate) {
  const n = Math.round(frame) * ticksPerFrame(rate);
  if (!Number.isSafeInteger(n)) throw Error("TIME_RANGE");
  return n;
}
export function snapToFrame(seconds: number, fps = 30) {
  const step = ticksPerFrame(frameRate(fps));
  return toSeconds(Math.round(toTicks(seconds) / step) * step);
}
/** Non-drop timecode: frame labels never pretend that 29.97 is exactly 30 fps. */
export function timecode(seconds: number, fps = 30) {
  const rate = frameRate(fps),
    frame = Math.max(0, Math.round(toTicks(seconds) / ticksPerFrame(rate)));
  const nominal = Math.ceil(rate.num / rate.den),
    s = Math.floor(frame / nominal);
  return [
    Math.floor(s / 3600),
    Math.floor(s / 60) % 60,
    s % 60,
    frame % nominal,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

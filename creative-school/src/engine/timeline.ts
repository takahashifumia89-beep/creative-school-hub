import { toTicks, toSeconds } from "./time";
export type TimedClip = { start: number; end: number; speed?: number };
export function durationTicks(c: TimedClip) {
  return Math.max(
    0,
    Math.round((toTicks(c.end) - toTicks(c.start)) / (c.speed ?? 1)),
  );
}
export type TimelineSample = { index: number; offset: number; source: number };
export class CompiledTimeline {
  readonly offsets: Float64Array;
  readonly starts: Float64Array;
  readonly ends: Float64Array;
  readonly speeds: Float64Array;
  readonly duration: number;
  constructor(clips: readonly TimedClip[]) {
    this.offsets = new Float64Array(clips.length + 1);
    this.starts = new Float64Array(clips.length);
    this.ends = new Float64Array(clips.length);
    this.speeds = new Float64Array(clips.length);
    let offset = 0;
    for (let i = 0; i < clips.length; i++) {
      this.offsets[i] = offset;
      this.starts[i] = toTicks(clips[i].start);
      this.ends[i] = toTicks(clips[i].end);
      this.speeds[i] = clips[i].speed ?? 1;
      offset += durationTicks(clips[i]);
      if (!Number.isSafeInteger(offset)) throw Error("TIME_RANGE");
    }
    this.offsets[clips.length] = offset;
    this.duration = offset;
  }
  /** Writes to caller-owned scratch state; no per-frame object allocation. */
  evaluate(tick: number, out: TimelineSample) {
    const n = this.starts.length;
    if (!n || tick < 0 || tick > this.duration) return false;
    let left = 0,
      right = n;
    while (left < right) {
      const m = (left + right) >>> 1;
      if (this.offsets[m + 1] <= tick && m < n - 1) left = m + 1;
      else right = m;
    }
    const i = Math.min(n - 1, left);
    out.index = i;
    out.offset = this.offsets[i];
    out.source = Math.min(
      this.ends[i],
      this.starts[i] + Math.round((tick - this.offsets[i]) * this.speeds[i]),
    );
    return true;
  }
}
export function timelineSeconds(clips: readonly TimedClip[]) {
  let sum = 0;
  for (let i = 0; i < clips.length; i++) sum += durationTicks(clips[i]);
  return toSeconds(sum);
}

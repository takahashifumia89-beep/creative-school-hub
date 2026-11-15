import { toTicks } from "./time";
export type VideoKeyframe = {
  id: string;
  tick: number;
  zoom: number;
  panX: number;
  panY: number;
  brightness: number;
  volume: number;
  interpolation: "linear" | "smooth" | "hold";
};
export type AnimatedClip = {
  zoom?: number;
  panX?: number;
  panY?: number;
  brightness?: number;
  volume: number;
  keyframes?: VideoKeyframe[];
};
export const ZOOM = 0,
  PAN_X = 1,
  PAN_Y = 2,
  BRIGHTNESS = 3,
  VOLUME = 4;
/** Packed structure-of-arrays, compiled once per immutable clip snapshot. */
export class KeyframeTrack {
  readonly times: Float64Array;
  private readonly values: Float64Array;
  private readonly modes: Uint8Array;
  private readonly base: Float64Array;
  constructor(clip: AnimatedClip) {
    const keys = [...(clip.keyframes ?? [])].sort((a, b) => a.tick - b.tick);
    this.times = new Float64Array(keys.length);
    this.values = new Float64Array(keys.length * 5);
    this.modes = new Uint8Array(keys.length);
    this.base = new Float64Array([
      clip.zoom ?? 1,
      clip.panX ?? 0,
      clip.panY ?? 0,
      clip.brightness ?? 100,
      clip.volume,
    ]);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      this.times[i] = k.tick;
      this.values.set([k.zoom, k.panX, k.panY, k.brightness, k.volume], i * 5);
      this.modes[i] =
        k.interpolation === "hold" ? 2 : k.interpolation === "smooth" ? 1 : 0;
    }
  }
  evaluate(tick: number, out: Float64Array) {
    const n = this.times.length;
    if (!n) {
      out.set(this.base);
      return;
    }
    let left = 0,
      right = n;
    while (left < right) {
      const m = (left + right) >>> 1;
      if (this.times[m] <= tick) left = m + 1;
      else right = m;
    }
    const a = Math.max(0, left - 1),
      b = Math.min(n - 1, left);
    let t =
      a === b
        ? 0
        : Math.max(
            0,
            Math.min(
              1,
              (tick - this.times[a]) / (this.times[b] - this.times[a]),
            ),
          );
    if (this.modes[a] === 2) t = 0;
    else if (this.modes[a] === 1) t = t * t * (3 - 2 * t);
    for (let c = 0; c < 5; c++) {
      const v = this.values[a * 5 + c];
      out[c] = v + (this.values[b * 5 + c] - v) * t;
    }
  }
  evaluateSeconds(seconds: number, out: Float64Array) {
    this.evaluate(toTicks(seconds), out);
  }
}
const tracks = new WeakMap<AnimatedClip, KeyframeTrack>();
export function keyframeTrack(clip: AnimatedClip) {
  let track = tracks.get(clip);
  if (!track) {
    track = new KeyframeTrack(clip);
    tracks.set(clip, track);
  }
  return track;
}

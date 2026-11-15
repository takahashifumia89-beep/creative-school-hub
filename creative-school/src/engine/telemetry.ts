/** Allocation-free recording. Summaries are requested outside the render loop. */
export class FrameTelemetry {
  private readonly samples = new Float32Array(120);
  private cursor = 0;
  private count = 0;
  record(ms: number) {
    this.samples[this.cursor] = ms;
    this.cursor = (this.cursor + 1) % this.samples.length;
    if (this.count < this.samples.length) this.count++;
  }
  summary() {
    if (!this.count) return { mean: 0, p95: 0, samples: 0 };
    const sorted = Array.from(this.samples.subarray(0, this.count)).sort(
      (a, b) => a - b,
    );
    return {
      mean: sorted.reduce((a, b) => a + b, 0) / this.count,
      p95: sorted[Math.min(this.count - 1, Math.floor(this.count * 0.95))],
      samples: this.count,
    };
  }
}

export type EqualizerSettings = { low: number; mid: number; high: number };
/** Browser audio nodes run on the audio rendering thread, outside React. */
export class AudioStrip {
  readonly gain: GainNode;
  private readonly filters: BiquadFilterNode[];
  constructor(
    private readonly context: AudioContext,
    source: AudioNode,
    destination: AudioNode,
    eq?: EqualizerSettings,
  ) {
    const low = context.createBiquadFilter(),
      mid = context.createBiquadFilter(),
      high = context.createBiquadFilter();
    low.type = "lowshelf";
    low.frequency.value = 200;
    mid.type = "peaking";
    mid.frequency.value = 1000;
    mid.Q.value = 0.7;
    high.type = "highshelf";
    high.frequency.value = 4000;
    low.gain.value = eq?.low ?? 0;
    mid.gain.value = eq?.mid ?? 0;
    high.gain.value = eq?.high ?? 0;
    this.filters = [low, mid, high];
    this.gain = context.createGain();
    source
      .connect(low)
      .connect(mid)
      .connect(high)
      .connect(this.gain)
      .connect(destination);
  }
  setEQ(eq?: EqualizerSettings) {
    this.filters[0].gain.value = eq?.low ?? 0;
    this.filters[1].gain.value = eq?.mid ?? 0;
    this.filters[2].gain.value = eq?.high ?? 0;
  }
  setVolume(value: number) {
    this.gain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, value)),
      this.context.currentTime,
      0.005,
    );
  }
  dispose() {
    for (const f of this.filters) f.disconnect();
    this.gain.disconnect();
  }
}
export class PreviewAudioBus {
  readonly context = new AudioContext();
  private readonly analyser = this.context.createAnalyser();
  private readonly nodes = new Map<
    HTMLMediaElement,
    { source: MediaElementAudioSourceNode; strip: AudioStrip }
  >();
  private readonly samples = new Float32Array(512);
  constructor() {
    this.analyser.fftSize = 512;
    this.analyser.connect(this.context.destination);
  }
  async resume() {
    await this.context.resume();
  }
  strip(element: HTMLMediaElement, eq?: EqualizerSettings) {
    let node = this.nodes.get(element);
    if (!node) {
      const source = this.context.createMediaElementSource(element),
        strip = new AudioStrip(this.context, source, this.analyser, eq);
      node = { source, strip };
      this.nodes.set(element, node);
    } else node.strip.setEQ(eq);
    return node.strip;
  }
  measure(out: Float64Array) {
    this.analyser.getFloatTimeDomainData(this.samples);
    let peak = 0,
      sum = 0;
    for (let i = 0; i < this.samples.length; i++) {
      const v = this.samples[i];
      peak = Math.max(peak, Math.abs(v));
      sum += v * v;
    }
    out[0] = peak;
    out[1] = Math.sqrt(sum / this.samples.length);
  }
  remove(element: HTMLMediaElement) {
    const node = this.nodes.get(element);
    if (node) {
      node.source.disconnect();
      node.strip.dispose();
      this.nodes.delete(element);
    }
  }
  dispose() {
    for (const node of this.nodes.values()) {
      node.source.disconnect();
      node.strip.dispose();
    }
    this.nodes.clear();
    this.analyser.disconnect();
    void this.context.close().catch(() => undefined);
  }
}

const TARGET_RATE = 24000;
const CROAK_RATE = 0.86;

export function floatTo16BitPCM(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export function downsample(input: Float32Array, fromRate: number, toRate = TARGET_RATE): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), input.length);
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j]!;
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

export function pcm16ToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToPcm16(b64: string): Int16Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

export function rms(buf: Float32Array | Int16Array): number {
  let s = 0;
  if (buf instanceof Float32Array) {
    for (let i = 0; i < buf.length; i++) s += buf[i]! * buf[i]!;
    return Math.sqrt(s / Math.max(1, buf.length));
  }
  for (let i = 0; i < buf.length; i++) {
    const v = buf[i]! / 32768;
    s += v * v;
  }
  return Math.sqrt(s / Math.max(1, buf.length));
}

function makeShaperCurve() {
  const n = 256;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * 1.6) * 0.92;
  }
  return curve;
}

export type ParrotNoiseKind = "squawk" | "rawk" | "click" | "rasp";

export class PcmPlayer {
  private ctx: AudioContext | null = null;
  private next = 0;
  private speechGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private croakFilter: BiquadFilterNode | null = null;
  private shaper: WaveShaperNode | null = null;
  private lastNoise = 0;

  get isPlaying() {
    const ctx = this.ctx;
    if (!ctx) return false;
    return this.next - ctx.currentTime > 0.06;
  }

  async ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    this.ctx = ctx;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2600;
    filter.Q.value = 0.7;
    const chest = ctx.createBiquadFilter();
    chest.type = "peaking";
    chest.frequency.value = 280;
    chest.gain.value = 5;
    chest.Q.value = 1.1;
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeShaperCurve();
    shaper.oversample = "2x";
    const speech = ctx.createGain();
    speech.gain.value = 1;
    const noise = ctx.createGain();
    noise.gain.value = 0.85;
    filter.connect(chest);
    chest.connect(shaper);
    shaper.connect(speech);
    speech.connect(ctx.destination);
    noise.connect(ctx.destination);
    this.croakFilter = filter;
    this.shaper = shaper;
    this.speechGain = speech;
    this.noiseGain = noise;
    if (ctx.state === "suspended") await ctx.resume();
    this.next = ctx.currentTime;
    return ctx;
  }

  async playPcm16(pcm: Int16Array) {
    const ctx = await this.ensure();
    const f32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i]! / 32768;
    const buf = ctx.createBuffer(1, f32.length, TARGET_RATE);
    buf.copyToChannel(f32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = CROAK_RATE;
    src.connect(this.croakFilter!);
    const startAt = Math.max(ctx.currentTime, this.next);
    src.start(startAt);
    this.next = startAt + buf.duration / CROAK_RATE;
  }

  async playBase64Audio(b64: string) {
    const ctx = await this.ensure();
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const audioBuf = await ctx.decodeAudioData(bytes.buffer.slice(0));
    const src = ctx.createBufferSource();
    src.buffer = audioBuf;
    src.playbackRate.value = CROAK_RATE;
    src.connect(this.croakFilter!);
    const startAt = Math.max(ctx.currentTime, this.next);
    src.start(startAt);
    this.next = startAt + audioBuf.duration / CROAK_RATE;
  }

  async insertNoise(kind?: ParrotNoiseKind, force = false) {
    const ctx = await this.ensure();
    const now = ctx.currentTime;
    if (!force && now - this.lastNoise < 0.85) return 0;
    this.lastNoise = now;
    const pick: ParrotNoiseKind =
      kind ?? (["squawk", "rawk", "click", "rasp"] as const)[Math.floor(Math.random() * 4)]!;
    const startAt = Math.max(now, this.next);
    const dur = scheduleParrotNoise(ctx, this.noiseGain!, startAt, pick);
    this.next = startAt + dur + 0.05;
    return dur;
  }

  interrupt() {
    this.next = this.ctx?.currentTime ?? 0;
  }

  async close() {
    await this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.speechGain = null;
    this.noiseGain = null;
    this.croakFilter = null;
    this.shaper = null;
  }
}

function scheduleParrotNoise(
  ctx: AudioContext,
  dest: AudioNode,
  when: number,
  kind: ParrotNoiseKind,
): number {
  const dur = kind === "click" ? 0.07 : kind === "rasp" ? 0.32 : kind === "rawk" ? 0.26 : 0.2;
  const noiseBuf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = kind === "click" ? 3100 : kind === "rasp" ? 900 : 1500;
  bp.Q.value = kind === "click" ? 10 : 2.4;
  const osc = ctx.createOscillator();
  osc.type = kind === "rasp" ? "sawtooth" : "square";
  const startF = kind === "rawk" ? 540 : kind === "click" ? 2200 : kind === "rasp" ? 320 : 780;
  const endF = kind === "rawk" ? 220 : kind === "click" ? 1400 : kind === "rasp" ? 180 : 340;
  osc.frequency.setValueAtTime(startF, when);
  osc.frequency.exponentialRampToValueAtTime(Math.max(80, endF), when + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(kind === "click" ? 0.22 : 0.38, when + 0.018);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  noise.connect(bp);
  bp.connect(g);
  osc.connect(g);
  g.connect(dest);
  noise.start(when);
  noise.stop(when + dur);
  osc.start(when);
  osc.stop(when + dur);
  return dur;
}

const WORKLET = `
class CaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) {
      const copy = new Float32Array(ch.length);
      copy.set(ch);
      this.port.postMessage(copy, [copy.buffer]);
    }
    return true;
  }
}
registerProcessor('parrot-capture', CaptureProcessor);
`;

export async function createCapture(
  onFrame: (pcmB64: string, level: number) => void,
): Promise<{ stop: () => void; stream: MediaStream }> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });
  const ctx = new AudioContext();
  const blob = new Blob([WORKLET], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  await ctx.audioWorklet.addModule(url);
  URL.revokeObjectURL(url);
  const src = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, "parrot-capture");
  const mute = ctx.createGain();
  mute.gain.value = 0;
  node.port.onmessage = (ev) => {
    const samples = ev.data as Float32Array;
    const ds = downsample(samples, ctx.sampleRate, TARGET_RATE);
    const level = Math.min(1, rms(ds) * 4);
    const pcm = floatTo16BitPCM(ds);
    onFrame(pcm16ToBase64(pcm), level);
  };
  src.connect(node);
  node.connect(mute);
  mute.connect(ctx.destination);

  return {
    stream,
    stop: () => {
      node.port.onmessage = null;
      src.disconnect();
      node.disconnect();
      mute.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    },
  };
}

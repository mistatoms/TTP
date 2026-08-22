const TARGET_RATE = 24000;

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

export class PcmPlayer {
  private ctx: AudioContext | null = null;
  private next = 0;
  private gain: GainNode | null = null;

  async ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.gain = ctx.createGain();
    this.gain.gain.value = 1;
    this.gain.connect(ctx.destination);
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
    src.connect(this.gain!);
    const startAt = Math.max(ctx.currentTime, this.next);
    src.start(startAt);
    this.next = startAt + buf.duration;
  }

  async playBase64Audio(b64: string) {
    const ctx = await this.ensure();
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const audioBuf = await ctx.decodeAudioData(bytes.buffer.slice(0));
    const src = ctx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(this.gain!);
    const startAt = Math.max(ctx.currentTime, this.next);
    src.start(startAt);
    this.next = startAt + audioBuf.duration;
  }

  interrupt() {
    this.next = this.ctx?.currentTime ?? 0;
  }

  async close() {
    await this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.gain = null;
  }
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

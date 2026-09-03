import type { SvDetection } from "./supervision";
import { nms } from "./supervision";

const MODEL_URL = "/models/yolov5n.onnx";
const SIZE = 640;
const CONF = 0.28;

export const COCO_NAMES = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush",
];

export class YoloDetector {
  private session: import("onnxruntime-web").InferenceSession | null = null;
  private inputName = "images";
  private scratch: HTMLCanvasElement | null = null;

  async init() {
    const ort = await import("onnxruntime-web");
    ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/";
    ort.env.wasm.numThreads = 1;
    this.session = await ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    this.inputName = this.session.inputNames[0] ?? "images";
  }

  async detect(video: HTMLVideoElement): Promise<SvDetection[]> {
    if (!this.session) return [];
    const ort = await import("onnxruntime-web");
    const { tensor, meta } = this.letterbox(video);
    const feeds: Record<string, InstanceType<typeof ort.Tensor>> = {
      [this.inputName]: new ort.Tensor("float32", tensor, [1, 3, SIZE, SIZE]),
    };
    const out = await this.session.run(feeds);
    const first = out[this.session.outputNames[0] ?? "output0"];
    if (!first) return [];
    return this.decode(first.data as Float32Array, first.dims, meta);
  }

  private canvas() {
    if (!this.scratch) this.scratch = document.createElement("canvas");
    return this.scratch;
  }

  private letterbox(video: HTMLVideoElement) {
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 360;
    const scale = Math.min(SIZE / vw, SIZE / vh);
    const nw = Math.round(vw * scale);
    const nh = Math.round(vh * scale);
    const padX = Math.floor((SIZE - nw) / 2);
    const padY = Math.floor((SIZE - nh) / 2);
    const canvas = this.canvas();
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(video, padX, padY, nw, nh);
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    const tensor = new Float32Array(3 * SIZE * SIZE);
    for (let i = 0; i < SIZE * SIZE; i++) {
      tensor[i] = data[i * 4]! / 255;
      tensor[SIZE * SIZE + i] = data[i * 4 + 1]! / 255;
      tensor[2 * SIZE * SIZE + i] = data[i * 4 + 2]! / 255;
    }
    return { tensor, meta: { scale, padX, padY, vw, vh } };
  }

  private decode(
    data: Float32Array,
    dims: readonly number[],
    meta: { scale: number; padX: number; padY: number; vw: number; vh: number },
  ): SvDetection[] {
    let rows: number;
    let stride: number;
    let get = (row: number, col: number) => data[row * stride + col]!;
    if (dims.length === 3 && dims[2] && dims[2] > dims[1]!) {
      rows = dims[2];
      stride = dims[1] ?? 85;
      get = (row, col) => data[col * rows + row]!;
    } else if (dims.length === 3) {
      rows = dims[1] ?? 25200;
      stride = dims[2] ?? 85;
    } else if (dims.length === 2) {
      rows = dims[0] ?? 25200;
      stride = dims[1] ?? 85;
    } else {
      rows = Math.floor(data.length / 85);
      stride = 85;
    }

    const raw: SvDetection[] = [];
    for (let i = 0; i < rows; i++) {
      const obj = stride > 84 ? get(i, 4) : 1;
      if (obj < CONF) continue;
      let best = 0;
      let bestI = 0;
      const clsOff = stride > 84 ? 5 : 4;
      const clsCount = Math.min(80, stride - clsOff);
      for (let c = 0; c < clsCount; c++) {
        const s = get(i, clsOff + c) * obj;
        if (s > best) {
          best = s;
          bestI = c;
        }
      }
      if (best < CONF) continue;
      const cx = get(i, 0);
      const cy = get(i, 1);
      const w = get(i, 2);
      const h = get(i, 3);
      const x1 = (cx - w / 2 - meta.padX) / meta.scale;
      const y1 = (cy - h / 2 - meta.padY) / meta.scale;
      const x2 = (cx + w / 2 - meta.padX) / meta.scale;
      const y2 = (cy + h / 2 - meta.padY) / meta.scale;
      raw.push({
        xyxy: [
          Math.min(Math.max(x1 / meta.vw, 0), 1),
          Math.min(Math.max(y1 / meta.vh, 0), 1),
          Math.min(Math.max(x2 / meta.vw, 0), 1),
          Math.min(Math.max(y2 / meta.vh, 0), 1),
        ],
        confidence: best,
        classId: bestI,
        label: COCO_NAMES[bestI] ?? `cls_${bestI}`,
      });
    }
    return nms(raw);
  }

  close() {
    void this.session?.release();
    this.session = null;
  }
}

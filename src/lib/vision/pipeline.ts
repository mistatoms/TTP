import { classifyScene } from "./classify";
import { YoloDetector } from "./yolo";
import type { DetectedObject, DetectedPerson, SceneContext, WeatherSnapshot } from "./types";

interface MotionSample {
  cx: number;
  cy: number;
}

export class VisionPipeline {
  private yolo = new YoloDetector();
  private lastVideoTime = -1;
  private lastRun = 0;
  private motion = new Map<number, MotionSample>();
  private weather: WeatherSnapshot | null = null;
  ready = false;
  error: string | null = null;

  setWeather(w: WeatherSnapshot | null) {
    this.weather = w;
  }

  async init() {
    try {
      await this.yolo.init();
      this.ready = true;
      this.error = null;
    } catch (err) {
      this.ready = false;
      this.error = err instanceof Error ? err.message : "YOLO failed to load";
      throw err;
    }
  }

  detect(video: HTMLVideoElement, ts: number): SceneContext | null {
    return null;
  }

  async detectAsync(video: HTMLVideoElement, ts: number): Promise<SceneContext | null> {
    if (!this.ready) return null;
    if (video.currentTime === this.lastVideoTime) return null;
    if (ts - this.lastRun < 220) return null;
    this.lastVideoTime = video.currentTime;
    this.lastRun = ts;

    const dets = await this.yolo.detect(video);
    const peopleRaw = dets.filter((d) => d.label === "person");
    const objects: DetectedObject[] = dets
      .filter((d) => d.label !== "person")
      .map((d) => ({
        label: d.label,
        score: d.confidence,
        bbox: [d.xyxy[0], d.xyxy[1], Math.max(0.01, d.xyxy[2] - d.xyxy[0]), Math.max(0.01, d.xyxy[3] - d.xyxy[1])],
      }));

    const people: DetectedPerson[] = peopleRaw.map((d, i) => {
      const w = Math.max(0.01, d.xyxy[2] - d.xyxy[0]);
      const h = Math.max(0.01, d.xyxy[3] - d.xyxy[1]);
      const cx = d.xyxy[0] + w / 2;
      const cy = d.xyxy[1] + h / 2;
      const prev = this.motion.get(i);
      const motion = prev ? Math.min(1, Math.hypot(cx - prev.cx, cy - prev.cy) / 0.08) : 0;
      this.motion.set(i, { cx, cy });
      return {
        id: i,
        bbox: [d.xyxy[0], d.xyxy[1], w, h],
        closeness: Math.min(1, h),
        motion,
        likelyChild: false,
      };
    });

    return classifyScene({ people, objects, weather: this.weather });
  }

  close() {
    this.yolo.close();
    this.ready = false;
  }
}

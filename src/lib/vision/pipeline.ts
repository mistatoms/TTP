import { classifyScene } from "./classify";
import type { DetectedObject, DetectedPerson, SceneContext } from "./types";

const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";
const POSE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const OBJECT_MODEL =
  "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.task";

type PoseLandmarker = import("@mediapipe/tasks-vision").PoseLandmarker;
type ObjectDetector = import("@mediapipe/tasks-vision").ObjectDetector;

interface MotionSample {
  xs: number[];
  ys: number[];
}

export class VisionPipeline {
  private pose: PoseLandmarker | null = null;
  private objects: ObjectDetector | null = null;
  private lastVideoTime = -1;
  private motion = new Map<number, MotionSample>();
  ready = false;
  error: string | null = null;

  async init() {
    const { FilesetResolver, PoseLandmarker, ObjectDetector } = await import(
      "@mediapipe/tasks-vision"
    );
    const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
    const tryDelegate = async (delegate: "GPU" | "CPU") => {
      this.pose = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: POSE_MODEL, delegate },
        runningMode: "VIDEO",
        numPoses: 4,
        minPoseDetectionConfidence: 0.4,
        minPosePresenceConfidence: 0.4,
        minTrackingConfidence: 0.4,
      });
      this.objects = await ObjectDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: OBJECT_MODEL, delegate },
        runningMode: "VIDEO",
        scoreThreshold: 0.35,
        maxResults: 8,
      });
    };
    try {
      await tryDelegate("GPU");
    } catch {
      await tryDelegate("CPU");
    }
    this.ready = true;
  }

  detect(video: HTMLVideoElement, ts: number): SceneContext | null {
    if (!this.pose || !this.objects) return null;
    if (video.currentTime === this.lastVideoTime) return null;
    this.lastVideoTime = video.currentTime;
    const w = video.videoWidth || 1;
    const h = video.videoHeight || 1;

    const poses = this.pose.detectForVideo(video, ts);
    const dets = this.objects.detectForVideo(video, ts);

    const people: DetectedPerson[] = (poses.landmarks ?? []).map((lms, i) => {
      const xs = lms.map((p) => p.x);
      const ys = lms.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const bw = Math.max(0.02, maxX - minX);
      const bh = Math.max(0.02, maxY - minY);
      const cy = (minY + maxY) / 2;
      const prev = this.motion.get(i);
      let motion = 0;
      if (prev && prev.xs.length === xs.length) {
        let acc = 0;
        for (let k = 0; k < xs.length; k++) acc += Math.hypot(xs[k]! - prev.xs[k]!, ys[k]! - prev.ys[k]!);
        motion = Math.min(1, acc / xs.length / 0.08);
      }
      this.motion.set(i, { xs, ys });
      const lShoulder = lms[11];
      const rShoulder = lms[12];
      const lHip = lms[23];
      const rHip = lms[24];
      let likelyChild = false;
      if (lShoulder && rShoulder && lHip && rHip) {
        const shoulderW = Math.abs(lShoulder.x - rShoulder.x);
        const torso = Math.abs((lShoulder.y + rShoulder.y) / 2 - (lHip.y + rHip.y) / 2);
        likelyChild = bh < 0.38 && shoulderW < 0.16 && torso < 0.22 && cy > 0.4;
      }
      return {
        id: i,
        bbox: [minX, minY, bw, bh],
        closeness: Math.min(1, bh),
        motion,
        likelyChild,
      };
    });

    const objects: DetectedObject[] = (dets.detections ?? [])
      .map((d) => {
        const cat = d.categories[0];
        const bb = d.boundingBox;
        if (!cat || !bb) return null;
        return {
          label: cat.categoryName.toLowerCase(),
          score: cat.score,
          bbox: [bb.originX / w, bb.originY / h, bb.width / w, bb.height / h] as [
            number,
            number,
            number,
            number,
          ],
        };
      })
      .filter((x): x is DetectedObject => !!x && x.label !== "person");

    return classifyScene({ people, objects });
  }

  close() {
    this.pose?.close();
    this.objects?.close();
    this.pose = null;
    this.objects = null;
    this.ready = false;
  }
}

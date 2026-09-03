import type { DetectedObject, DetectedPerson } from "./types";

/** Supervision-style detection box: xywh normalized 0–1. */
export interface SvDetection {
  xyxy: [number, number, number, number];
  confidence: number;
  classId: number;
  label: string;
}

export function boxIou(a: [number, number, number, number], b: [number, number, number, number]) {
  const ax2 = a[0] + a[2];
  const ay2 = a[1] + a[3];
  const bx2 = b[0] + b[2];
  const by2 = b[1] + b[3];
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a[1], b[1]));
  const inter = ix * iy;
  const union = a[2] * a[3] + b[2] * b[3] - inter;
  return union <= 0 ? 0 : inter / union;
}

export function nms(dets: SvDetection[], iouThresh = 0.45): SvDetection[] {
  const sorted = [...dets].sort((a, b) => b.confidence - a.confidence);
  const keep: SvDetection[] = [];
  for (const d of sorted) {
    const xywh: [number, number, number, number] = [
      d.xyxy[0],
      d.xyxy[1],
      d.xyxy[2] - d.xyxy[0],
      d.xyxy[3] - d.xyxy[1],
    ];
    const hits = keep.some((k) => {
      const kwh: [number, number, number, number] = [
        k.xyxy[0],
        k.xyxy[1],
        k.xyxy[2] - k.xyxy[0],
        k.xyxy[3] - k.xyxy[1],
      ];
      return boxIou(xywh, kwh) >= iouThresh && k.classId === d.classId;
    });
    if (!hits) keep.push(d);
  }
  return keep;
}

/** Greedy IoU / proximity association (Supervision match_detections_with_tracks style). */
export function associate(
  people: DetectedPerson[],
  objects: DetectedObject[],
  labels: string[],
  iouMin = 0.05,
  gapMax = 0.18,
): Map<number, DetectedObject> {
  const wanted = objects.filter((o) => labels.includes(o.label));
  const used = new Set<number>();
  const out = new Map<number, DetectedObject>();
  for (const person of people) {
    let bestI = -1;
    let bestScore = 0;
    let bestObj: DetectedObject | null = null;
    for (let i = 0; i < wanted.length; i++) {
      if (used.has(i)) continue;
      const obj = wanted[i]!;
      const iou = boxIou(person.bbox, obj.bbox);
      const pcx = person.bbox[0] + person.bbox[2] / 2;
      const pcy = person.bbox[1] + person.bbox[3] * 0.75;
      const ocx = obj.bbox[0] + obj.bbox[2] / 2;
      const ocy = obj.bbox[1] + obj.bbox[3] / 2;
      const gap = Math.hypot(pcx - ocx, pcy - ocy);
      const score = iou + (gap < gapMax ? (gapMax - gap) / gapMax : 0);
      if ((iou >= iouMin || gap < gapMax) && score > bestScore) {
        bestScore = score;
        bestI = i;
        bestObj = obj;
      }
    }
    if (bestObj && bestI >= 0) {
      used.add(bestI);
      out.set(person.id, bestObj);
    }
  }
  return out;
}

/**
 * Second model: adult vs child from relative bounding-box height.
 * A figure is a child when it is clearly shorter than the tallest adult-scale
 * person and shares a similar ground line (feet near the same baseline).
 */
export function relativeSizeChildren(people: DetectedPerson[]): DetectedPerson[] {
  if (people.length === 0) return people;
  const heights = people.map((p) => p.bbox[3]);
  const tallest = Math.max(...heights);
  if (people.length === 1) {
    return people.map((p) => ({ ...p, likelyChild: p.bbox[3] < 0.28 && p.bbox[1] > 0.42 }));
  }
  return people.map((p) => {
    const ratio = p.bbox[3] / tallest;
    const foot = p.bbox[1] + p.bbox[3];
    const tallestPerson = people.find((x) => x.bbox[3] === tallest) ?? people[0]!;
    const tallFoot = tallestPerson.bbox[1] + tallestPerson.bbox[3];
    const sameGround = Math.abs(foot - tallFoot) < 0.18;
    return { ...p, likelyChild: ratio <= 0.62 && sameGround && p.bbox[3] < 0.42 };
  });
}

export function isPramLike(obj: DetectedObject) {
  if (obj.label === "stroller" || obj.label === "pram" || obj.label === "baby_carriage") return true;
  if (obj.label === "suitcase" || obj.label === "backpack" || obj.label === "handbag") {
    const [, y, w, h] = obj.bbox;
    return y > 0.38 && w > h * 0.7;
  }
  return false;
}

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OverlayBoxes, TowpathScene } from "@/components/towpath-scene";
import { classifyScene, makeDemoDetections } from "@/lib/vision/classify";
import { DEMO_SCENES, SCENE_LABELS } from "@/lib/vision/types";
import { useParrotStore } from "@/lib/parrot/store";
import { VisionPipeline } from "@/lib/vision/pipeline";

export function WebcamPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pipelineRef = useRef<VisionPipeline | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [visionReady, setVisionReady] = useState(false);

  const cameraMode = useParrotStore((s) => s.cameraMode);
  const setCameraMode = useParrotStore((s) => s.setCameraMode);
  const demoScene = useParrotStore((s) => s.demoScene);
  const setDemoScene = useParrotStore((s) => s.setDemoScene);
  const scene = useParrotStore((s) => s.scene);
  const overlays = useParrotStore((s) => s.overlays);
  const setOverlays = useParrotStore((s) => s.setOverlays);
  const applyScene = useParrotStore((s) => s.applyScene);
  const weather = useParrotStore((s) => s.weather);

  useEffect(() => {
    if (!useParrotStore.getState().scene) {
      applyScene(classifyScene({ ...makeDemoDetections(demoScene), weather }), "demo");
    }
  }, [applyScene, demoScene, weather]);

  async function startCamera() {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraMode("live");
      const pipe = new VisionPipeline();
      pipe.setWeather(useParrotStore.getState().weather);
      pipelineRef.current = pipe;
      try {
        await pipe.init();
        setVisionReady(true);
        if (pipe.error) setCamError(pipe.error);
      } catch (err) {
        setVisionReady(false);
        setCamError(err instanceof Error ? err.message : "YOLO model unavailable — live video only");
      }
    } catch (err) {
      setCamError(err instanceof Error ? err.message : "Camera permission denied");
      setCameraMode("demo");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    pipelineRef.current?.close();
    pipelineRef.current = null;
    setVisionReady(false);
    setCameraMode("demo");
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => {
    pipelineRef.current?.setWeather(weather);
  }, [weather]);

  useEffect(() => {
    if (cameraMode !== "live") return;
    let raf = 0;
    let inflight = false;
    const loop = (t: number) => {
      const video = videoRef.current;
      const pipe = pipelineRef.current;
      if (video && pipe?.ready && video.readyState >= 2 && !inflight) {
        inflight = true;
        void pipe
          .detectAsync(video, t)
          .then((next) => {
            if (next) applyScene(next, "live");
          })
          .catch(() => undefined)
          .finally(() => {
            inflight = false;
          });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cameraMode, applyScene]);

  useEffect(() => () => stopCamera(), []);

  return (
    <Card className="flex min-h-0 flex-col p-3">
      <CardHeader className="mb-2">
        <CardTitle>Path camera</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={cameraMode === "live" ? "live" : "outline"}>
            {cameraMode === "live" ? (visionReady ? "Live + YOLO" : "Live") : "Demo patrol"}
          </Badge>
          <button
            type="button"
            className="text-[11px] text-muted underline-offset-2 hover:text-fg hover:underline"
            onClick={() => setOverlays(!overlays)}
          >
            {overlays ? "Hide boxes" : "Show boxes"}
          </button>
        </div>
      </CardHeader>
      <div className="relative aspect-video overflow-hidden rounded-md bg-bg">
        <video
          ref={videoRef}
          className={cameraMode === "live" ? "absolute inset-0 h-full w-full object-cover" : "hidden"}
          playsInline
          muted
        />
        {cameraMode !== "live" && <TowpathScene scene={scene} />}
        <OverlayBoxes />
        {camError && (
          <p className="absolute bottom-2 left-2 right-2 rounded-sm bg-bg/80 px-2 py-1 text-xs text-warn">
            {camError}
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {cameraMode === "live" ? (
          <Button variant="outline" size="sm" onClick={stopCamera}>
            <CameraOff />
            Stop camera
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => void startCamera()}>
            <Camera />
            Use webcam
          </Button>
        )}
      </div>
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {DEMO_SCENES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setDemoScene(id)}
            className={`min-h-8 shrink-0 rounded-full px-3 text-[11px] ${
              demoScene === id && cameraMode === "demo"
                ? "bg-canal/20 text-canal"
                : "bg-surface-2 text-muted hover:text-fg"
            }`}
          >
            {SCENE_LABELS[id]}
          </button>
        ))}
      </div>
    </Card>
  );
}

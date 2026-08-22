import { createFileRoute } from "@tanstack/react-router";
import { AudioMonitors } from "@/components/audio-monitors";
import { Boot } from "@/components/boot";
import { ConversationPanel } from "@/components/conversation-panel";
import { FurbyPanel } from "@/components/furby-panel";
import { HeaderBar } from "@/components/header-bar";
import { ReasoningLog } from "@/components/reasoning-log";
import { ScenePanel } from "@/components/scene-panel";
import { WebcamPanel } from "@/components/webcam-panel";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Boot />
      <HeaderBar />
      <main className="mx-auto grid max-w-[1400px] gap-3 p-3 pb-8 md:grid-cols-12 md:p-5">
        <section className="flex min-w-0 flex-col gap-3 md:col-span-7">
          <WebcamPanel />
          <AudioMonitors />
        </section>
        <section className="flex min-w-0 flex-col gap-3 md:col-span-5">
          <ScenePanel />
          <ConversationPanel />
        </section>
        <section className="min-w-0 md:col-span-7">
          <FurbyPanel />
        </section>
        <section className="min-w-0 md:col-span-5">
          <ReasoningLog />
        </section>
      </main>
    </div>
  );
}

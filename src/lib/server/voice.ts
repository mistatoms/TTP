import { createServerFn } from "@tanstack/react-start";

export const checkAiAvailable = createServerFn({ method: "GET" }).handler(async () => {
  return { ok: Boolean(process.env.XAI_API_KEY) };
});

export const createVoiceClientSecret = createServerFn({ method: "POST" }).handler(async () => {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false as const, error: "Voice is not available in this environment" };

  const res = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expires_after: { seconds: 300 } }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false as const, error: `Could not start a voice session (${res.status}) ${text}`.trim() };
  }
  const body = (await res.json()) as { value: string; expires_at?: number };
  return { ok: true as const, value: body.value, expiresAt: body.expires_at ?? null };
});

export const synthesizeSpeech = createServerFn({ method: "POST" })
  .validator((input: { text: string; voice?: string }) => ({
    text: input.text.slice(0, 320),
    voice: input.voice || "leo",
  }))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Voice is not available" };

    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: data.text,
        voice_id: data.voice,
        language: "en",
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: `TTS failed (${res.status})` };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: true as const, audio: buf.toString("base64"), mime: res.headers.get("content-type") || "audio/mpeg" };
  });

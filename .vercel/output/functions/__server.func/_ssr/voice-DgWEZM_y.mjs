import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voice-DgWEZM_y.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var checkAiAvailable_createServerFn_handler = createServerRpc({
	id: "a4112c2d35ceac63298168a200e4aca8b03490dc3f9c62f7bcba13839620dc5c",
	name: "checkAiAvailable",
	filename: "src/lib/server/voice.ts"
}, (opts) => checkAiAvailable.__executeServer(opts));
var checkAiAvailable = createServerFn({ method: "GET" }).handler(checkAiAvailable_createServerFn_handler, async () => {
	return { ok: Boolean(process.env.XAI_API_KEY) };
});
var createVoiceClientSecret_createServerFn_handler = createServerRpc({
	id: "3978122c8f0c0060ae36341090f9dc6f840e3f8f42b7fab57bf91c7559961e7b",
	name: "createVoiceClientSecret",
	filename: "src/lib/server/voice.ts"
}, (opts) => createVoiceClientSecret.__executeServer(opts));
var createVoiceClientSecret = createServerFn({ method: "POST" }).handler(createVoiceClientSecret_createServerFn_handler, async () => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Voice is not available in this environment"
	};
	const res = await fetch("https://api.x.ai/v1/realtime/client_secrets", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ expires_after: { seconds: 300 } })
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		return {
			ok: false,
			error: `Could not start a voice session (${res.status}) ${text}`.trim()
		};
	}
	const body = await res.json();
	return {
		ok: true,
		value: body.value,
		expiresAt: body.expires_at ?? null
	};
});
var synthesizeSpeech_createServerFn_handler = createServerRpc({
	id: "de7890637ee15f7c3f989b0df5a4d232434d51ee4d7bb02b1739a99da5a0160e",
	name: "synthesizeSpeech",
	filename: "src/lib/server/voice.ts"
}, (opts) => synthesizeSpeech.__executeServer(opts));
var synthesizeSpeech = createServerFn({ method: "POST" }).validator((input) => ({
	text: input.text.slice(0, 320),
	voice: input.voice || "leo"
})).handler(synthesizeSpeech_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Voice is not available"
	};
	const res = await fetch("https://api.x.ai/v1/tts", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			text: data.text,
			voice_id: data.voice,
			language: "en"
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `TTS failed (${res.status})`
	};
	return {
		ok: true,
		audio: Buffer.from(await res.arrayBuffer()).toString("base64"),
		mime: res.headers.get("content-type") || "audio/mpeg"
	};
});
//#endregion
export { checkAiAvailable_createServerFn_handler, createVoiceClientSecret_createServerFn_handler, synthesizeSpeech_createServerFn_handler };

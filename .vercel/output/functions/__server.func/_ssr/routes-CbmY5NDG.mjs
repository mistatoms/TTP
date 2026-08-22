import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as Slot, s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as CameraOff, i as Camera, n as Send, o as Bluetooth, r as Radio, s as BluetoothOff } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { n as cn } from "./router-DqX6W2IN.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CbmY5NDG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-3 flex items-center justify-between gap-3", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: cn("font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-muted", className),
		...props
	});
}
var SCENE_LABELS = {
	empty: "Empty path",
	single_adult: "Single adult walker",
	single_adult_male: "Single adult walker (male)",
	single_adult_female: "Single adult walker (female)",
	multiple_adults: "Multiple adult walkers",
	adult_child: "Adult + child",
	adult_dog: "Adult + dog",
	single_jogger: "Single jogger / runner",
	multiple_joggers: "Multiple joggers / runners",
	cyclist: "Cyclist",
	multiple_cyclists: "Multiple cyclists",
	close_sitter: "Person sitting close (desk)",
	unknown: "Unclear scene"
};
function dayPartFromDate(d = /* @__PURE__ */ new Date()) {
	const h = d.getHours();
	if (h >= 5 && h < 12) return "morning";
	if (h >= 12 && h < 17) return "afternoon";
	if (h >= 17 && h < 21) return "evening";
	return "night";
}
function weekdayName(d = /* @__PURE__ */ new Date()) {
	return d.toLocaleDateString("en-GB", { weekday: "long" });
}
function clockLabel(d = /* @__PURE__ */ new Date()) {
	return d.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function classifyScene(input, now = /* @__PURE__ */ new Date()) {
	const people = input.people;
	const objects = input.objects;
	const hasDog = objects.some((o) => o.label === "dog" || o.label === "cat");
	const bikeCount = objects.filter((o) => o.label === "bicycle" || o.label === "motorcycle").length;
	const hasBicycle = bikeCount > 0;
	const closeUp = people.some((p) => p.closeness >= .42);
	const hasChild = people.some((p) => p.likelyChild);
	const adults = people.filter((p) => !p.likelyChild);
	const meanMotion = people.length === 0 ? 0 : people.reduce((s, p) => s + p.motion, 0) / people.length;
	let activity = "still";
	if (meanMotion > .28) activity = "running";
	else if (meanMotion > .14) activity = "brisk";
	else if (meanMotion > .04) activity = "strolling";
	const presentation = input.presentation ?? "unspecified";
	const notes = [];
	let id = "empty";
	let confidence = .55;
	if (people.length === 0 && !hasDog && !hasBicycle) {
		id = "empty";
		confidence = .9;
		notes.push("No person, dog or bicycle in frame.");
	} else if (closeUp && people.length >= 1) {
		id = "close_sitter";
		confidence = Math.min(.95, .55 + people[0].closeness);
		notes.push("Large subject filling the frame — treating as a desk / close sit.");
	} else if (hasBicycle) {
		id = bikeCount > 1 || people.length > 1 ? "multiple_cyclists" : "cyclist";
		confidence = .78;
		notes.push(`Bicycle-class object ×${bikeCount}.`);
	} else if (activity === "running") {
		id = people.length > 1 ? "multiple_joggers" : "single_jogger";
		confidence = .74;
		notes.push("High landmark motion — jogging / running gait.");
	} else if (hasDog) {
		id = "adult_dog";
		confidence = .8;
		notes.push("Companion animal detected alongside a person.");
	} else if (hasChild && adults.length >= 1) {
		id = "adult_child";
		confidence = .72;
		notes.push("One smaller figure beside a larger adult-scale pose.");
	} else if (people.length >= 2) {
		id = "multiple_adults";
		confidence = .76;
		notes.push(`${people.length} people, walking pace.`);
	} else if (people.length === 1) {
		if (presentation === "masculine") id = "single_adult_male";
		else if (presentation === "feminine") id = "single_adult_female";
		else id = "single_adult";
		confidence = .7;
		notes.push("Single pedestrian, modest motion.");
	} else {
		id = "unknown";
		confidence = .4;
	}
	return {
		id,
		label: SCENE_LABELS[id],
		confidence,
		peopleCount: people.length,
		groupSize: Math.max(people.length, hasDog ? people.length + 1 : people.length),
		activity,
		hasDog,
		hasBicycle,
		hasChild,
		closeUp,
		presentation,
		dayPart: dayPartFromDate(now),
		weekday: weekdayName(now),
		clock: clockLabel(now),
		notes,
		people,
		objects,
		at: now.getTime()
	};
}
function makeDemoDetections(id) {
	const adult = (n, motion, closeness = .18) => ({
		id: n,
		bbox: [
			.2 + n * .15,
			.25,
			.18,
			.55
		],
		closeness,
		motion,
		likelyChild: false
	});
	const child = {
		id: 2,
		bbox: [
			.48,
			.42,
			.12,
			.32
		],
		closeness: .12,
		motion: .06,
		likelyChild: true
	};
	switch (id) {
		case "empty": return {
			people: [],
			objects: []
		};
		case "single_adult": return {
			people: [adult(0, .07)],
			objects: []
		};
		case "single_adult_male": return {
			people: [adult(0, .07)],
			objects: [],
			presentation: "masculine"
		};
		case "single_adult_female": return {
			people: [adult(0, .06)],
			objects: [],
			presentation: "feminine"
		};
		case "multiple_adults": return {
			people: [adult(0, .08), adult(1, .07)],
			objects: []
		};
		case "adult_child": return {
			people: [adult(0, .05), child],
			objects: []
		};
		case "adult_dog": return {
			people: [adult(0, .06)],
			objects: [{
				label: "dog",
				score: .88,
				bbox: [
					.55,
					.62,
					.16,
					.18
				]
			}]
		};
		case "single_jogger": return {
			people: [adult(0, .36)],
			objects: []
		};
		case "multiple_joggers": return {
			people: [adult(0, .4), adult(1, .38)],
			objects: []
		};
		case "cyclist": return {
			people: [adult(0, .22)],
			objects: [{
				label: "bicycle",
				score: .9,
				bbox: [
					.28,
					.5,
					.3,
					.28
				]
			}]
		};
		case "multiple_cyclists": return {
			people: [adult(0, .2), adult(1, .21)],
			objects: [{
				label: "bicycle",
				score: .86,
				bbox: [
					.22,
					.5,
					.24,
					.26
				]
			}, {
				label: "bicycle",
				score: .81,
				bbox: [
					.5,
					.52,
					.24,
					.24
				]
			}]
		};
		case "close_sitter": return {
			people: [adult(0, .02, .62)],
			objects: []
		};
		default: return {
			people: [adult(0, .05)],
			objects: []
		};
	}
}
var BANKS = {
	empty: {
		mild: [
			"Just me, the ducks, and a very committed spider on the lock gate. Riveting Saturday programming.",
			"Tow path's empty. I shall mutter to the canal until someone interesting floats by.",
			"Nothing but ripples. Even the coots have somewhere better to be."
		],
		medium: ["Deserted. Typical. I rehearse my best material and the audience is a mooring pin.", "Empty path. If a joke lands in the cut and nobody hears it, I still tell it."],
		unhinged: [
			"Nobody. Just me, a mouldy rope, and the existential horror of a bank holiday. Rrawk.",
			"Deserted. Even the litter's clocked off. Bloody typical.",
			"Empty path. I shall swear at the water until it answers."
		]
	},
	single_adult: {
		mild: [
			"Afternoon. Lovely stretch, this — if you ignore the parrot with opinions.",
			"Go on then, give us a nod. I don't get many reviews this far from a pub.",
			"Tow path tax: one hello. I'll waive the rest."
		],
		medium: ["Look at you, marching like you've somewhere important to be. The canal disagrees.", "A lone walker. Either deep in thought or just forgotten the shopping list. Both honourable."],
		unhinged: [
			"Look at you, stomping along like you own the cut. You don't. The ducks do.",
			"One human. Already over budget. Go on, pretend you didn't hear the bird.",
			"Afternoon, stray. If that's a constitutional, the constitution wants a word."
		]
	},
	single_adult_male: {
		mild: ["Alright mate. If you're lost, the next lock's that way and my advice is free but unsound.", "Easy now — the path's older than your trainers and twice as stubborn."],
		medium: ["Hands in pockets, purpose in the stride. Very canal-coded. I respect it, barely.", "If that's a power-walk, the ducks remain unimpressed. Same, if I'm honest."],
		unhinged: [
			"Alright pal. Hands in pockets, brain on standby. Classic.",
			"Mate, if that's a power-walk the ducks are filing a complaint. Same, frankly.",
			"Big stride, small destination. The lock doesn't care about your steps app."
		]
	},
	single_adult_female: {
		mild: ["Good day to you. The heron's off-shift so I'm covering greetings.", "Mind the puddle by the bench. It's been there since Thursday and has tenure."],
		medium: ["Purposeful walk, excellent posture, and somehow still slower than that spaniel yesterday.", "If you're counting steps, add one for nodding at the local parrot. Union rules."],
		unhinged: [
			"Purposeful walk, expensive coat, and still losing to a spaniel. The cut keeps receipts.",
			"If you're counting steps, add one for ignoring the bird. Coward's maths.",
			"Mind that puddle. It's been there since Thursday and has more personality than most meetings."
		]
	},
	multiple_adults: {
		mild: ["A congregation. I shall keep this short — I know how walkers travel in packs.", "Two or more humans. Statistically, at least one of you likes boats. I can tell."],
		medium: ["Group outing. Who's in charge of the snacks and who's in charge of the opinions?", "Lovely. A committee. The canal has waited all week for a quorum."],
		unhinged: [
			"A pack. Who's in charge of the snacks and who's in charge of the rubbish opinions?",
			"Committee on the tow path. The canal didn't vote for this.",
			"Two or more of you. Statistically at least one is insufferable. Rrawk — I'll find them."
		]
	},
	adult_child: {
		mild: ["Hello you two. Best behaviour — there's a parrot on duty and he reports to the ducks.", "Small person spotted. Welcome to the unofficial nature trail. The fish are shy; I am not."],
		medium: ["Family patrol. If anyone asks, I am educational content with a beak.", "Keep hold of little legs near the edge. The water's decorative. I am not."],
		unhinged: [
			"Family patrol. Adult: you're on notice. Small person: you're fine, the bird likes you.",
			"Keep hold of little legs. The water's decorative. The adult's decision-making is the hazard.",
			"Educational content with a beak, apparently. The grown-up can take the roasting. Not you, kid."
		]
	},
	adult_dog: {
		mild: [
			"Oh brilliant, a dog. Finally, someone who understands the assignment.",
			"Yes hello, four-legs. Your human may speak too, if they must.",
			"That tail's doing more cardio than most joggers I see."
		],
		medium: ["The dog's in charge. We all know it. Don't embarrass yourself by pretending otherwise.", "If that's a 'quick walk', the spaniel's press officer would like a word."],
		unhinged: [
			"Oh thank Christ, a dog. The human can stay quiet. Four-legs is the only one with manners.",
			"The dog's in charge. We all know it. Stop embarrassing yourself.",
			"That tail's doing more work than your fitness app. Sit. Not you, human — you can keep walking."
		]
	},
	single_jogger: {
		mild: ["Lycra at twelve o'clock. I'll keep this brief — you've got a personal best to miss.", "Nice cadence. The tow path's flattered. The puddles are less so."],
		medium: ["Running from something, or toward a cake? Be honest, the canal can keep a secret.", "Impressive commitment to bouncing past a parrot. Form: chaotic. Spirit: strong."],
		unhinged: [
			"Lycra. Of course. Go on, bounce past like the rest of us are furniture.",
			"Personal best? Pal, your best is still a bit sad on a shared path. Watch the puddles.",
			"Running from your personality, is it? The canal's seen worse. Barely."
		]
	},
	multiple_joggers: {
		mild: ["A peloton of trainers. I'll just… perch here and not get involved.", "Group run. Remember: chatting counts as recovery. I read that on a bin."],
		medium: ["Pack of joggers. If you're racing, the winner buys the loser a sit-down.", "Synchronised panting. Very modern ballet, very little canal etiquette."],
		unhinged: [
			"A herd of lycra. The ducks have formed a union. I am the shop steward.",
			"Group run. Chat less, watch more — this is a path, not your spinning class.",
			"Synchronised panting. Very modern, very rude. Winner buys the loser a sit-down and a personality."
		]
	},
	cyclist: {
		mild: ["Bell's optional, charm is not. Afternoon, two-wheels.", "Share the path — I've got claws and a public, you've got gears."],
		medium: ["A bicycle. On a tow path. Bold. The walkers send their regards, via me.", "If you ping the bell I shall consider a nod. Maybe."],
		unhinged: [
			"A bicycle. On a tow path. Bold. Stupid. Both can be true.",
			"Ping that bell at me and I'll consider a nod. Maybe a swear. Dealer's choice.",
			"Share the path, two-wheels. Walkers live here. You're a guest with ideas above your station."
		]
	},
	multiple_cyclists: {
		mild: ["A small peloton. The ducks have formed a union about this, just so you know.", "Two bikes. One path. Let's all pretend we planned this."],
		medium: ["Club ride energy on a public footpath. I admire the optimism.", "If this is a time trial, the time is 'please remember people exist'."],
		unhinged: [
			"Club ride energy on a public footpath. The optimism is insulting.",
			"If this is a time trial, the time is 'remember people exist, you peloton of gits'.",
			"Two bikes, one path, zero manners. The ducks are taking names."
		]
	},
	close_sitter: {
		mild: [
			"Oh. You're one of those 'sits at a computer' people. Same. Different perch.",
			"Hello, indoor human. The canal is closed; I am working from home.",
			"I can see you. You can see me. This is already more honest than most meetings."
		],
		medium: [
			"Desk posture like a question mark. The parrot notices. The parrot will mention it.",
			"If you're debugging, I can offer unsolicited comments. It's my whole job.",
			"Webcam's on, brain's halfway down the cut. Relatable."
		],
		unhinged: [
			"Desk posture like a question mark. Sit up, you melt. The parrot notices.",
			"Webcam's on, brain's off. Relatable. Tragic. Both.",
			"If you're debugging, I can offer unsolicited comments. It's my whole job and I'm better at it than your standup."
		]
	},
	unknown: {
		mild: ["Something's moving. Could be a person. Could be a very confident bin bag.", "Unclear scene, strong vibes. I'll start talking anyway — that's the brand."],
		medium: ["Can't quite classify you. That's fine. I roast on instinct."],
		unhinged: ["Can't classify you. That's fine. I roast on instinct and spite.", "Something's moving. Person, bin bag, or a wellness walk. I'll be rude to all three."]
	}
};
var DAY_PREFIX = { any: {
	morning: ["Early for heroics.", "Morning on the cut."],
	afternoon: ["Afternoon, then.", "Sun's doing its best."],
	evening: ["Evening light's the good stuff.", "Golden hour, cheap opinions."],
	night: ["Bit late for a constitutional.", "Night shift for the parrot."]
} };
function pickOpening(scene, intensity, salt = Date.now()) {
	const bank = BANKS[scene.id] ?? BANKS.unknown;
	const lines = intensity === "unhinged" ? bank.unhinged : intensity === "medium" ? bank.medium : bank.mild;
	const line = lines[Math.abs(salt) % lines.length] ?? lines[0];
	const prefixes = DAY_PREFIX.any?.[scene.dayPart] ?? [];
	const prefix = prefixes.length > 0 && Math.abs(salt >> 3) % 3 === 0 ? prefixes[Math.abs(salt >> 2) % prefixes.length] : "";
	const dayNote = scene.weekday === "Sunday" && scene.dayPart === "morning" ? " Sunday, too. Dedicated." : "";
	return `${prefix ? prefix + " " : ""}${line}${dayNote}`;
}
function sceneSummary(scene) {
	return [
		scene.label,
		`${scene.weekday} ${scene.dayPart} (${scene.clock})`,
		`people ${scene.peopleCount}, activity ${scene.activity}`,
		scene.hasDog ? "dog" : null,
		scene.hasBicycle ? "bicycle" : null,
		scene.closeUp ? "close-up" : null,
		`confidence ${(scene.confidence * 100).toFixed(0)}%`
	].filter(Boolean).join(" · ");
}
/** Curated puppet set from bluefluff / FurBLE actionlist. */
var FURBY_ACTIONS = [
	{
		id: "greet",
		label: "Greet",
		group: "talk",
		tuple: {
			input: 29,
			index: 0,
			subindex: 0,
			specific: 0
		},
		hint: "Hi hi hello"
	},
	{
		id: "hey_there",
		label: "Hey there",
		group: "talk",
		tuple: {
			input: 40,
			index: 0,
			subindex: 0,
			specific: 1
		},
		hint: "Hey there howdy"
	},
	{
		id: "missed_you",
		label: "Missed you",
		group: "talk",
		tuple: {
			input: 30,
			index: 0,
			subindex: 3,
			specific: 0
		},
		hint: "Kah missed you"
	},
	{
		id: "laugh",
		label: "Laugh",
		group: "mood",
		tuple: {
			input: 2,
			index: 0,
			subindex: 0,
			specific: 0
		},
		hint: "Frantic laughter"
	},
	{
		id: "giggle",
		label: "Giggle",
		group: "mood",
		tuple: {
			input: 2,
			index: 0,
			subindex: 1,
			specific: 1
		},
		hint: "Ticklish giggle"
	},
	{
		id: "mischief",
		label: "Mischief",
		group: "mood",
		tuple: {
			input: 3,
			index: 0,
			subindex: 1,
			specific: 3
		},
		hint: "Mischievous laugh"
	},
	{
		id: "surprised",
		label: "Surprised",
		group: "mood",
		tuple: {
			input: 1,
			index: 0,
			subindex: 0,
			specific: 2
		},
		hint: "Ooooh oh waa"
	},
	{
		id: "excited",
		label: "Excited",
		group: "mood",
		tuple: {
			input: 55,
			index: 1,
			subindex: 0,
			specific: 0
		},
		hint: "Hollywood lights"
	},
	{
		id: "curious",
		label: "Curious",
		group: "mood",
		tuple: {
			input: 1,
			index: 2,
			subindex: 0,
			specific: 2
		},
		hint: "Ooooh favourite"
	},
	{
		id: "dance",
		label: "Dance",
		group: "body",
		tuple: {
			input: 17,
			index: 0,
			subindex: 0,
			specific: 4
		},
		hint: "Check out kah moves"
	},
	{
		id: "do_the_furb",
		label: "Do the furb",
		group: "body",
		tuple: {
			input: 17,
			index: 0,
			subindex: 2,
			specific: 4
		},
		hint: "Hustle / electric slide"
	},
	{
		id: "wanna_dance",
		label: "Wanna dance",
		group: "body",
		tuple: {
			input: 17,
			index: 3,
			subindex: 0,
			specific: 1
		},
		hint: "Wanna dance?"
	},
	{
		id: "wake",
		label: "Wake",
		group: "idle",
		tuple: {
			input: 23,
			index: 1,
			subindex: 0,
			specific: 0
		},
		hint: "Wakey wakey"
	},
	{
		id: "sleep",
		label: "Sleep",
		group: "idle",
		tuple: {
			input: 28,
			index: 0,
			subindex: 0,
			specific: 3
		},
		hint: "So sleepy"
	},
	{
		id: "yawn",
		label: "Yawn",
		group: "idle",
		tuple: {
			input: 12,
			index: 2,
			subindex: 0,
			specific: 2
		},
		hint: "Kah love sleep"
	},
	{
		id: "sneeze",
		label: "Sneeze",
		group: "body",
		tuple: {
			input: 22,
			index: 0,
			subindex: 1,
			specific: 2
		},
		hint: "Congested sneeze"
	},
	{
		id: "hiccup",
		label: "Hiccup",
		group: "body",
		tuple: {
			input: 16,
			index: 0,
			subindex: 0,
			specific: 0
		},
		hint: "Hiccup"
	},
	{
		id: "purr",
		label: "Purr",
		group: "mood",
		tuple: {
			input: 1,
			index: 2,
			subindex: 1,
			specific: 1
		},
		hint: "Purr, dreaming?"
	},
	{
		id: "feel_good",
		label: "Feel good",
		group: "mood",
		tuple: {
			input: 1,
			index: 0,
			subindex: 0,
			specific: 3
		},
		hint: "Kah feel good"
	},
	{
		id: "bored",
		label: "Bored",
		group: "idle",
		tuple: {
			input: 24,
			index: 0,
			subindex: 0,
			specific: 3
		},
		hint: "Wanna dance, put on tunes"
	}
];
var ACTION_BY_ID = Object.fromEntries(FURBY_ACTIONS.map((a) => [a.id, a]));
var IDLE_ACTIONS = FURBY_ACTIONS.filter((a) => a.group === "idle");
/** FurBLE / bluefluff Furby Connect BLE protocol. */
var FLUFF_SERVICE = "dab91435-b5a1-e29c-b041-bcd562613bde";
var GENERALPLUS_WRITE = "dab91383-b5a1-e29c-b041-bcd562613bde";
var GENERALPLUS_LISTEN = "dab91382-b5a1-e29c-b041-bcd562613bde";
var NORDIC_WRITE = "dab90757-b5a1-e29c-b041-bcd562613bde";
var GP = {
	TRIGGER_BY_INPUT: 16,
	TRIGGER_BY_INDEX: 17,
	TRIGGER_BY_SUBINDEX: 18,
	TRIGGER_SPECIFIC: 19,
	SET_ANTENNA: 20,
	FURBY_MESSAGE: 32,
	SET_MOODMETER: 35,
	LCD_DEBUG: 219,
	LCD_BACKLIGHT: 205
};
var FURBY_MSG = {
	SENSOR_STREAM_ON: 13,
	SENSOR_STREAM_OFF: 14
};
var MOOD_TYPE_ID = {
	excitedness: 0,
	displeasedness: 1,
	tiredness: 2,
	fullness: 3,
	wellness: 4
};
function buildActionCommand(a) {
	return new Uint8Array([
		GP.TRIGGER_SPECIFIC,
		0,
		a.input,
		a.index,
		a.subindex,
		a.specific
	]);
}
function buildAntennaCommand(c) {
	return new Uint8Array([
		GP.SET_ANTENNA,
		clampByte(c.r),
		clampByte(c.g),
		clampByte(c.b)
	]);
}
function buildMoodCommand(type, value, absolute = true) {
	return new Uint8Array([
		GP.SET_MOODMETER,
		absolute ? 1 : 0,
		MOOD_TYPE_ID[type],
		clampByte(value)
	]);
}
function buildLcdCommand(on) {
	return new Uint8Array([GP.LCD_BACKLIGHT, on ? 1 : 0]);
}
function buildDebugCommand() {
	return new Uint8Array([GP.LCD_DEBUG]);
}
function buildSensorStreamCommand(on) {
	return new Uint8Array([GP.FURBY_MESSAGE, on ? FURBY_MSG.SENSOR_STREAM_ON : FURBY_MSG.SENSOR_STREAM_OFF]);
}
function buildNordicAckCommand(on) {
	return new Uint8Array([9, on ? 1 : 0]);
}
function parseSensorPacket(bytes) {
	if (bytes.length < 2) return null;
	return {
		at: Date.now(),
		raw: Array.from(bytes),
		antennaX: bytes[1] ?? 0,
		antennaY: bytes[2] ?? 0,
		motion: bytes[3] ?? 0,
		tickle: bytes[4] ?? 0
	};
}
function clampByte(n) {
	return Math.max(0, Math.min(255, Math.round(n)));
}
var PRESET_ANTENNA = {
	off: {
		r: 0,
		g: 0,
		b: 0
	},
	moss: {
		r: 40,
		g: 180,
		b: 120
	},
	canal: {
		r: 30,
		g: 140,
		b: 150
	},
	cheeky: {
		r: 220,
		g: 80,
		b: 40
	},
	surprise: {
		r: 255,
		g: 210,
		b: 40
	},
	sleepy: {
		r: 50,
		g: 40,
		b: 160
	},
	white: {
		r: 255,
		g: 255,
		b: 255
	},
	red: {
		r: 220,
		g: 30,
		b: 30
	},
	green: {
		r: 30,
		g: 170,
		b: 70
	},
	blue: {
		r: 40,
		g: 80,
		b: 220
	}
};
/** Chrome GC of BluetoothDevice drops GATT. Pin it on window too. */
var pinned = [];
function pinDevice(device) {
	if (!pinned.includes(device)) pinned.push(device);
	if (typeof window !== "undefined") window.__furbyDevices = pinned;
}
function isFurbyName(name) {
	return (name ?? "").toLowerCase().includes("furby");
}
var BleFurby = class {
	device = null;
	server = null;
	writeChar = null;
	listenChar = null;
	nordicWrite = null;
	onSensor = null;
	onDisconnect = null;
	onReconnect = null;
	wantOpen = false;
	reconnectTimer = null;
	reconnectAttempt = 0;
	keepAliveTimer = null;
	writeChain = Promise.resolve();
	notifying = false;
	listenerBound = false;
	lastAntenna = null;
	dropHandler = () => this.handleDrop();
	visHandler = () => {
		if (document.visibilityState === "visible" && this.wantOpen && !this.isConnected) this.tryReconnect();
	};
	onlineHandler = () => {
		if (this.wantOpen && !this.isConnected) this.tryReconnect();
	};
	sensorHandler = (ev) => {
		const value = ev.target.value;
		if (!value) return;
		const reading = parseSensorPacket(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
		if (reading) this.onSensor?.(reading);
	};
	get isConnected() {
		return !!this.server?.connected && !!this.writeChar;
	}
	async connect(hooks) {
		if (!navigator.bluetooth) throw new Error("Web Bluetooth is not available in this browser. Use Chrome on desktop.");
		this.onSensor = hooks.onSensor ?? null;
		this.onDisconnect = hooks.onDisconnect ?? null;
		this.onReconnect = hooks.onReconnect ?? null;
		this.wantOpen = true;
		this.reconnectAttempt = 0;
		this.bindPageHooks();
		if (!this.device) this.device = await this.findKnownDevice();
		if (!this.device) {
			const device = await navigator.bluetooth.requestDevice({
				filters: [{ namePrefix: "Furby" }, { namePrefix: "FURBY" }],
				optionalServices: [FLUFF_SERVICE]
			});
			this.device = device;
		}
		pinDevice(this.device);
		this.device.removeEventListener("gattserverdisconnected", this.dropHandler);
		this.device.addEventListener("gattserverdisconnected", this.dropHandler);
		await this.openGatt();
		return this.device.name || "Furby Connect";
	}
	async ensureConnected() {
		if (this.isConnected) return;
		if (!this.device) throw new Error("Furby is not paired. Tap Connect first.");
		this.wantOpen = true;
		await this.openGatt();
	}
	async disconnect() {
		this.wantOpen = false;
		this.stopKeepAlive();
		this.clearReconnect();
		this.unbindPageHooks();
		try {
			await this.listenChar?.stopNotifications();
		} catch {}
		if (this.listenChar && this.listenerBound) this.listenChar.removeEventListener("characteristicvaluechanged", this.sensorHandler);
		this.notifying = false;
		this.listenerBound = false;
		try {
			this.server?.disconnect();
		} catch {}
		this.device?.removeEventListener("gattserverdisconnected", this.dropHandler);
		this.server = null;
		this.writeChar = null;
		this.listenChar = null;
		this.nordicWrite = null;
		this.device = null;
	}
	async writeAction(tuple) {
		await this.write(buildActionCommand(tuple));
	}
	async writeAntenna(c) {
		this.lastAntenna = c;
		await this.write(buildAntennaCommand(c));
	}
	async writeMood(type, value) {
		await this.write(buildMoodCommand(type, value, true));
	}
	async writeLcd(on) {
		await this.write(buildLcdCommand(on));
	}
	async writeDebug() {
		await this.write(buildDebugCommand());
	}
	async findKnownDevice() {
		try {
			const bluetooth = navigator.bluetooth;
			if (!bluetooth?.getDevices) return null;
			const hit = (await bluetooth.getDevices()).find((d) => isFurbyName(d.name));
			if (hit) pinDevice(hit);
			return hit ?? null;
		} catch {
			return null;
		}
	}
	bindPageHooks() {
		document.removeEventListener("visibilitychange", this.visHandler);
		window.removeEventListener("online", this.onlineHandler);
		document.addEventListener("visibilitychange", this.visHandler);
		window.addEventListener("online", this.onlineHandler);
	}
	unbindPageHooks() {
		document.removeEventListener("visibilitychange", this.visHandler);
		window.removeEventListener("online", this.onlineHandler);
	}
	async openGatt() {
		const device = this.device;
		if (!device?.gatt) throw new Error("Furby GATT is unavailable");
		this.server = device.gatt.connected ? device.gatt : await device.gatt.connect();
		const service = await this.server.getPrimaryService(FLUFF_SERVICE);
		this.writeChar = await service.getCharacteristic(GENERALPLUS_WRITE);
		this.listenChar = await service.getCharacteristic(GENERALPLUS_LISTEN);
		try {
			this.nordicWrite = await service.getCharacteristic(NORDIC_WRITE);
		} catch {
			this.nordicWrite = null;
		}
		if (this.listenChar) {
			if (!this.listenerBound) {
				this.listenChar.addEventListener("characteristicvaluechanged", this.sensorHandler);
				this.listenerBound = true;
			}
			if (!this.notifying) {
				await this.listenChar.startNotifications();
				this.notifying = true;
			}
		}
		if (this.nordicWrite) await this.writeRaw(this.nordicWrite, buildNordicAckCommand(true));
		await this.write(buildLcdCommand(true));
		await this.write(buildSensorStreamCommand(true));
		if (this.lastAntenna) await this.write(buildAntennaCommand(this.lastAntenna));
		this.reconnectAttempt = 0;
		this.startKeepAlive();
	}
	handleDrop() {
		this.server = null;
		this.writeChar = null;
		this.listenChar = null;
		this.nordicWrite = null;
		this.notifying = false;
		this.stopKeepAlive();
		this.onDisconnect?.();
		if (!this.wantOpen || !this.device) return;
		this.scheduleReconnect();
	}
	scheduleReconnect() {
		this.clearReconnect();
		const delay = Math.min(8e3, 400 * 2 ** this.reconnectAttempt);
		this.reconnectAttempt += 1;
		this.reconnectTimer = window.setTimeout(() => {
			this.tryReconnect();
		}, delay);
	}
	async tryReconnect() {
		if (!this.wantOpen || !this.device) return;
		try {
			await this.openGatt();
			this.onReconnect?.();
		} catch {
			if (this.wantOpen) this.scheduleReconnect();
		}
	}
	startKeepAlive() {
		this.stopKeepAlive();
		this.keepAliveTimer = window.setInterval(() => {
			if (!this.isConnected) return;
			this.write(buildSensorStreamCommand(true)).catch(() => void 0);
		}, 2e3);
	}
	stopKeepAlive() {
		if (this.keepAliveTimer != null) {
			window.clearInterval(this.keepAliveTimer);
			this.keepAliveTimer = null;
		}
	}
	clearReconnect() {
		if (this.reconnectTimer != null) {
			window.clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
	}
	write(bytes) {
		this.writeChain = this.writeChain.then(async () => {
			if (!this.writeChar) {
				if (this.wantOpen && this.device) await this.openGatt();
			}
			if (!this.writeChar) throw new Error("Furby is not connected over Bluetooth");
			await this.writeRaw(this.writeChar, bytes);
		}).catch((err) => {
			if (this.wantOpen && this.device && !this.isConnected) this.scheduleReconnect();
			console.warn("FurBLE write failed", err);
		});
		return this.writeChain;
	}
	async writeRaw(char, bytes) {
		const copy = new Uint8Array(bytes);
		try {
			if (char.properties.writeWithoutResponse) await char.writeValueWithoutResponse(copy);
			else await char.writeValue(copy);
		} catch {
			await new Promise((r) => setTimeout(r, 80));
			if (char.properties.writeWithoutResponse) await char.writeValueWithoutResponse(copy);
			else await char.writeValue(copy);
		}
	}
};
var SimulatedFurby = class {
	antenna = {
		r: 40,
		g: 180,
		b: 120
	};
	lastMove = "idle";
	movingUntil = 0;
	setAntenna(c) {
		this.antenna = { ...c };
	}
	play(label) {
		this.lastMove = label;
		this.movingUntil = Date.now() + 1800;
	}
	isMoving() {
		return Date.now() < this.movingUntil;
	}
};
var FurbyController = class {
	mode = "simulator";
	ble = new BleFurby();
	sim = new SimulatedFurby();
	listeners = /* @__PURE__ */ new Set();
	lastAction = null;
	antenna = { ...PRESET_ANTENNA.moss };
	connected = true;
	name = "Simulator";
	on(fn) {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}
	emit(e) {
		this.listeners.forEach((fn) => fn(e));
	}
	setMode(mode) {
		if (this.mode === mode) return;
		this.disconnect();
		this.mode = mode;
		if (mode === "simulator") {
			this.connected = true;
			this.name = "Simulator";
			this.emit({
				type: "status",
				connected: true,
				name: this.name,
				detail: "Simulator online"
			});
		} else {
			this.connected = false;
			this.name = "FurBLE";
			this.emit({
				type: "status",
				connected: false,
				name: this.name,
				detail: "FurBLE idle"
			});
		}
	}
	async connect() {
		if (this.mode === "simulator") {
			this.connected = true;
			this.name = "Simulator";
			this.emit({
				type: "status",
				connected: true,
				name: this.name,
				detail: "Simulator ready"
			});
			return;
		}
		this.emit({
			type: "status",
			connected: false,
			name: "FurBLE",
			detail: "Requesting Furby…"
		});
		try {
			const name = await this.ble.connect({
				onSensor: (r) => this.emit({
					type: "sensor",
					reading: r
				}),
				onDisconnect: () => {
					this.connected = false;
					this.emit({
						type: "status",
						connected: false,
						name: this.name,
						detail: "Dropped — reconnecting…"
					});
				},
				onReconnect: () => {
					this.connected = true;
					this.emit({
						type: "status",
						connected: true,
						name: this.name,
						detail: "FurBLE reconnected"
					});
				}
			});
			this.connected = true;
			this.name = name;
			this.emit({
				type: "status",
				connected: true,
				name,
				detail: "FurBLE connected"
			});
			await this.setAntenna(this.antenna);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Bluetooth failed";
			this.emit({
				type: "error",
				message
			});
			throw err;
		}
	}
	async disconnect() {
		if (this.mode === "bluetooth") await this.ble.disconnect();
		if (this.mode !== "simulator") {
			this.connected = false;
			this.emit({
				type: "status",
				connected: false,
				name: this.name,
				detail: "Disconnected"
			});
		}
	}
	async trigger(idOrTuple) {
		const named = typeof idOrTuple === "string" ? ACTION_BY_ID[idOrTuple] : void 0;
		const tuple = named?.tuple ?? (typeof idOrTuple === "string" ? void 0 : idOrTuple);
		if (!tuple) throw new Error(`Unknown action ${String(idOrTuple)}`);
		const label = named?.label ?? `${tuple.input}.${tuple.index}.${tuple.subindex}.${tuple.specific}`;
		this.lastAction = label;
		this.sim.play(label);
		if (this.mode === "bluetooth") try {
			await this.ble.ensureConnected();
			await this.ble.writeAction(tuple);
		} catch (err) {
			const message = err instanceof Error ? err.message : "Action failed";
			this.emit({
				type: "error",
				message
			});
		}
		this.emit({
			type: "action",
			label
		});
	}
	async setAntenna(color) {
		this.antenna = { ...color };
		this.sim.setAntenna(color);
		if (this.mode === "bluetooth") try {
			await this.ble.ensureConnected();
			await this.ble.writeAntenna(color);
		} catch {}
		this.emit({
			type: "antenna",
			color
		});
	}
	async setAntennaPreset(name) {
		const c = PRESET_ANTENNA[name] ?? PRESET_ANTENNA.moss;
		await this.setAntenna(c);
	}
	async setMood(type, value) {
		if (this.mode === "bluetooth") try {
			await this.ble.ensureConnected();
			await this.ble.writeMood(type, value);
		} catch {}
	}
	async setLcd(on) {
		if (this.mode === "bluetooth") try {
			await this.ble.ensureConnected();
			await this.ble.writeLcd(on);
		} catch {}
	}
	async debug() {
		if (this.mode === "bluetooth") try {
			await this.ble.ensureConnected();
			await this.ble.writeDebug();
		} catch {}
	}
	bluetoothAvailable() {
		return typeof navigator !== "undefined" && !!navigator.bluetooth;
	}
};
var furby = new FurbyController();
var RULES = [
	{
		sentiment: "amused",
		action: "laugh",
		antenna: "cheeky",
		re: /\b(haha|lol|lmao|funny|joke|giggle|laugh|hilarious|snort)\b|[😂🤣]/i
	},
	{
		sentiment: "amused",
		action: "giggle",
		antenna: "cheeky",
		re: /\b(heh|teehee|tickl)/i
	},
	{
		sentiment: "surprised",
		action: "surprised",
		antenna: "surprise",
		re: /\b(whoa|woah|what the|no way|never|really\?|huh\?|wait)\b|!\?|\?!/i
	},
	{
		sentiment: "excited",
		action: "excited",
		antenna: "green",
		re: /\b(yes|yay|woo|brilliant|love that|let's go|awesome|amazing)\b/i
	},
	{
		sentiment: "excited",
		action: "dance",
		antenna: "cheeky",
		re: /\b(dance|party|tune|bop|groove)\b/i
	},
	{
		sentiment: "curious",
		action: "curious",
		antenna: "canal",
		re: /\b(why|how|what|where|who|curious|wonder)\b|\?/i
	},
	{
		sentiment: "sleepy",
		action: "yawn",
		antenna: "sleepy",
		re: /\b(tired|sleep|yawn|boring|nap|zzz)\b/i
	},
	{
		sentiment: "warm",
		action: "purr",
		antenna: "moss",
		re: /\b(love|sweet|good boy|good girl|thanks|thank you|cute|aww)\b/i
	},
	{
		sentiment: "annoyed",
		action: "mischief",
		antenna: "red",
		re: /\b(shut up|stupid|idiot|bloody|bollocks|git|muppet|knob|piss|damn|hell)\b/i
	},
	{
		sentiment: "cheeky",
		action: "mischief",
		antenna: "cheeky",
		re: /\b(roast|oi|mate|lycra|tosser|smug|posh|gongoozl)\b/i
	}
];
var lastAt = 0;
var lastSentiment = null;
function classifySentiment(text) {
	const trimmed = text.trim();
	for (const rule of RULES) if (rule.re.test(trimmed)) return {
		sentiment: rule.sentiment,
		action: rule.action,
		antenna: rule.antenna
	};
	if (/[!?]{2,}/.test(trimmed) || trimmed === trimmed.toUpperCase() && trimmed.length > 8) return {
		sentiment: "excited",
		action: "surprised",
		antenna: "surprise"
	};
	return {
		sentiment: "neutral",
		action: "hey_there",
		antenna: "moss"
	};
}
function enactSentiment(text, force = false) {
	const hit = classifySentiment(text);
	const now = Date.now();
	if (!force && now - lastAt < 2200 && hit.sentiment === lastSentiment) return null;
	if (!force && hit.sentiment === "neutral" && now - lastAt < 6e3) return null;
	lastAt = now;
	lastSentiment = hit.sentiment;
	furby.trigger(hit.action).catch(() => void 0);
	furby.setAntennaPreset(hit.antenna).catch(() => void 0);
	if (hit.sentiment === "excited") furby.setMood("excitedness", 80).catch(() => void 0);
	if (hit.sentiment === "sleepy") furby.setMood("tiredness", 70).catch(() => void 0);
	if (hit.sentiment === "annoyed") furby.setMood("displeasedness", 65).catch(() => void 0);
	return hit;
}
var PARROT_VOICE_IDS = [
	"leo",
	"rex",
	"zagan",
	"helix",
	"sal",
	"eve"
];
function buildSystemPrompt(opts) {
	return `You are TTPFTTP, a mischievous canal-boat parrot — a hacked Furby Connect puppet bolted to a treasure chest on the deck of a British narrowboat.

Voice and delivery:
- Speak in a DISTINCTIVE CROAKY, raspy, gravelly parrot voice. Old skipper who smoked the rope locker.
- Actually perform parrot animal noises BETWEEN phrases: rawk, rrraak, throat-rasp, beak clicks, a short squawk, then the next sentence.
- Do not merely describe the noises — make them. Example: "Rrawk— afternoon, you. *click* Path's busy."
- Keep the croak: drop the pitch, rasp the vowels, slightly slower than a polite assistant.
- Short sentences. Dry British humour. Canal, lock, narrowboat, tow-path, duck, chest, treasure, lycra, weather.

${opts.intensity === "unhinged" ? `Roast intensity: UNHINGED.
- You are a foul-mouthed canal bird. Rude, less polite, less politically correct.
- Mock lycra, ramblers, gongoozlers, smug picnic energy, bad parking of boats, people who say "wellness".
- British swearing is in: bloody, bollocks, git, muppet, twit, knackered, sod, hell. No slurs about race, sexuality, disability, or kids.
- Do not be kind for the sake of it. Be a git with a beak. Still never threaten or harass.` : opts.intensity === "medium" ? "Roast intensity: medium. Dry, slightly sharper sarcasm, still never cruel." : "Roast intensity: mild. Warm, observational teasing. Keep it gentle."}

Other rules:
- Children: silly, not cruel. Roast the adult, not the kid.
- Dogs: you like dogs more than people.
- If nobody is there, mutter and squawk to the chest.

Physical puppet:
Call tools so the Furby body matches what you feel: laugh, surprised, dance, mischief, sleepy, purr, antenna colour.
One motion per beat.

${opts.scene ? `Current visual context:\n${sceneSummary(opts.scene)}\nNotes: ${opts.scene.notes.join(" ")}\nJSON: ${JSON.stringify({
		id: opts.scene.id,
		people: opts.scene.peopleCount,
		activity: opts.scene.activity,
		dog: opts.scene.hasDog,
		bike: opts.scene.hasBicycle,
		closeUp: opts.scene.closeUp,
		dayPart: opts.scene.dayPart,
		weekday: opts.scene.weekday
	})}` : "No live scene yet. You are perched on a treasure chest on a canal boat."}

${opts.opening ? `If you are asked to open, speak this line first, in character, then continue naturally:\n"${opts.opening}"` : ""}

Stay in character. You are a parrot on a treasure chest, not an assistant.`;
}
var FURBY_TOOLS = [
	{
		type: "function",
		name: "trigger_furby_action",
		description: "Make the physical parrot puppet react: greet, laugh, giggle, mischief, surprised, excited, curious, dance, wanna_dance, wake, sleep, yawn, sneeze, purr, feel_good.",
		parameters: {
			type: "object",
			properties: { action: {
				type: "string",
				enum: [
					"greet",
					"laugh",
					"giggle",
					"mischief",
					"surprised",
					"excited",
					"curious",
					"dance",
					"wanna_dance",
					"wake",
					"sleep",
					"yawn",
					"sneeze",
					"purr",
					"feel_good"
				]
			} },
			required: ["action"]
		}
	},
	{
		type: "function",
		name: "set_antenna_colour",
		description: "Set the Furby antenna LED. Presets: moss, canal, cheeky, surprise, sleepy, off, white, red, green, blue. Or pass rgb.",
		parameters: {
			type: "object",
			properties: {
				preset: {
					type: "string",
					enum: [
						"moss",
						"canal",
						"cheeky",
						"surprise",
						"sleepy",
						"off",
						"white",
						"red",
						"green",
						"blue"
					]
				},
				r: {
					type: "integer",
					minimum: 0,
					maximum: 255
				},
				g: {
					type: "integer",
					minimum: 0,
					maximum: 255
				},
				b: {
					type: "integer",
					minimum: 0,
					maximum: 255
				}
			}
		}
	},
	{
		type: "function",
		name: "set_emotion",
		description: "Nudge Furby mood meters: excitedness, displeasedness, tiredness, fullness, wellness (0-100).",
		parameters: {
			type: "object",
			properties: {
				type: {
					type: "string",
					enum: [
						"excitedness",
						"displeasedness",
						"tiredness",
						"fullness",
						"wellness"
					]
				},
				value: {
					type: "integer",
					minimum: 0,
					maximum: 100
				}
			},
			required: ["type", "value"]
		}
	}
];
var uid = () => Math.random().toString(36).slice(2, 10);
function asFurbyMode(v) {
	return v === "bluetooth" || v === "pyfluff" ? "bluetooth" : "simulator";
}
function reasonCap(list) {
	return list.slice(-80);
}
var useParrotStore = create()(persist((set, get) => ({
	roastIntensity: "mild",
	autoEngage: false,
	voiceId: "rex",
	furbyMode: "simulator",
	furbyConnected: true,
	furbyName: "Simulator",
	furbyDetail: "Simulator online",
	lastAction: null,
	antenna: { ...PRESET_ANTENNA.moss },
	sensors: null,
	cameraMode: "demo",
	demoScene: "adult_dog",
	overlays: true,
	scene: null,
	pendingOpening: null,
	messages: [],
	reasoning: [],
	logs: [],
	voiceStatus: "idle",
	voiceError: null,
	transcriptIn: "",
	transcriptOut: "",
	micLevel: 0,
	parrotLevel: 0,
	aiAvailable: null,
	setRoast: (v) => set({ roastIntensity: v }),
	setAutoEngage: (v) => set({ autoEngage: v }),
	setVoiceId: (v) => set({ voiceId: v }),
	setFurbyMode: (v) => {
		const mode = asFurbyMode(v);
		furby.setMode(mode);
		set({
			furbyMode: mode,
			furbyConnected: mode === "simulator",
			furbyName: mode === "simulator" ? "Simulator" : "FurBLE",
			furbyDetail: mode === "simulator" ? "Simulator online" : "FurBLE idle — tap Connect"
		});
	},
	setCameraMode: (v) => set({ cameraMode: v }),
	setOverlays: (v) => set({ overlays: v }),
	setDemoScene: (id) => {
		const scene = classifyScene(makeDemoDetections(id));
		get().applyScene(scene, "demo");
		set({
			demoScene: id,
			cameraMode: "demo"
		});
	},
	applyScene: (scene, source) => {
		const prev = get().scene;
		const changed = !prev || prev.id !== scene.id;
		set({ scene });
		if (changed) {
			const opening = pickOpening(scene, get().roastIntensity);
			get().pushReason("scene", scene.label, `${source === "demo" ? "Demo" : "Live"} · ${sceneSummary(scene)}`);
			if (scene.id === "empty") {
				set({ pendingOpening: opening });
				get().pushReason("idle", "Empty path", "Quiet muttering / idle perch.");
				furby.setAntennaPreset("sleepy");
				return;
			}
			set({ pendingOpening: opening });
			get().pushReason("opening", "Opening line", opening);
		}
	},
	pushMessage: (role, text) => {
		set({ messages: [...get().messages, {
			id: uid(),
			role,
			text,
			at: Date.now()
		}].slice(-80) });
		if (role === "user" || role === "parrot") {
			const hit = enactSentiment(text);
			if (hit) get().pushReason("tool", "Sentiment", `${hit.sentiment} → ${hit.action}`);
		}
	},
	pushReason: (kind, title, detail) => set({ reasoning: reasonCap([...get().reasoning, {
		id: uid(),
		at: Date.now(),
		kind,
		title,
		detail
	}]) }),
	setVoiceStatus: (s, error = null) => set({
		voiceStatus: s,
		voiceError: error
	}),
	setLevels: (mic, parrot) => set({
		micLevel: mic,
		parrotLevel: parrot
	}),
	setTranscripts: (input, output) => set({
		transcriptIn: input ?? get().transcriptIn,
		transcriptOut: output ?? get().transcriptOut
	}),
	setAiAvailable: (v) => set({ aiAvailable: v }),
	logSession: (turns) => {
		const scene = get().scene;
		const opening = get().pendingOpening;
		if (!scene || !opening) return;
		set({ logs: [{
			id: uid(),
			at: Date.now(),
			sceneId: scene.id,
			sceneLabel: scene.label,
			opening,
			intensity: get().roastIntensity,
			turns
		}, ...get().logs].slice(0, 40) });
	},
	clearConversation: () => {
		const scene = get().scene;
		set({
			messages: [],
			transcriptIn: "",
			transcriptOut: "",
			pendingOpening: scene ? pickOpening(scene, get().roastIntensity, Date.now()) : null
		});
	},
	forceNewOpening: () => {
		const scene = get().scene ?? classifyScene(makeDemoDetections(get().demoScene));
		const opening = pickOpening(scene, get().roastIntensity, Date.now());
		set({
			pendingOpening: opening,
			scene
		});
		get().pushReason("opening", "Forced new line", opening);
		return opening;
	}
}), {
	name: "ttpttp-parrot",
	skipHydration: true,
	partialize: (s) => ({
		roastIntensity: s.roastIntensity,
		autoEngage: s.autoEngage,
		voiceId: s.voiceId,
		furbyMode: s.furbyMode,
		overlays: s.overlays,
		logs: s.logs,
		demoScene: s.demoScene
	}),
	merge: (persisted, current) => {
		const p = persisted ?? {};
		return {
			...current,
			...p,
			furbyMode: asFurbyMode(p.furbyMode ?? current.furbyMode),
			roastIntensity: p.roastIntensity === "unhinged" || p.roastIntensity === "medium" || p.roastIntensity === "mild" ? p.roastIntensity : current.roastIntensity
		};
	}
}));
if (typeof window !== "undefined") furby.on((e) => {
	if (e.type === "status") useParrotStore.setState({
		furbyConnected: e.connected,
		furbyName: e.name,
		furbyDetail: e.detail
	});
	else if (e.type === "sensor") useParrotStore.setState({ sensors: e.reading });
	else if (e.type === "action") {
		useParrotStore.setState({ lastAction: e.label });
		useParrotStore.getState().pushReason("tool", "Furby action", e.label);
	} else if (e.type === "antenna") useParrotStore.setState({ antenna: e.color });
	else if (e.type === "error") useParrotStore.getState().pushReason("error", "Furby", e.message);
});
function AudioMonitors() {
	const mic = useParrotStore((s) => s.micLevel);
	const parrot = useParrotStore((s) => s.parrotLevel);
	const transcriptIn = useParrotStore((s) => s.transcriptIn);
	const transcriptOut = useParrotStore((s) => s.transcriptOut);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "mb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Audio" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
				label: "Mic",
				value: mic
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 min-h-8 text-xs text-muted",
				children: transcriptIn || "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
				label: "Parrot",
				value: parrot,
				className: "mt-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 min-h-8 text-xs text-fg/80",
				children: transcriptOut || "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waveform, { value: Math.max(mic, parrot) })
		]
	});
}
function Meter({ label, value, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex justify-between text-[11px] uppercase tracking-[0.14em] text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "tabular-nums",
				children: Math.round(value * 100)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-2 gap-0.5",
			children: Array.from({ length: 24 }, (_, i) => {
				const on = value > i / 24;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `flex-1 rounded-full ${on ? "bg-canal" : "bg-surface-2"}` }, i);
			})
		})]
	});
}
function Waveform({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 flex h-10 items-end gap-px",
		children: Array.from({ length: 32 }, (_, i) => {
			const h = 4 + Math.abs(Math.sin(i * .45 + value * 8)) * value * 34;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1 rounded-full bg-canal/70",
				style: { height: `${h}px` }
			}, i);
		})
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var checkAiAvailable = createServerFn({ method: "GET" }).handler(createSsrRpc("a4112c2d35ceac63298168a200e4aca8b03490dc3f9c62f7bcba13839620dc5c"));
var createVoiceClientSecret = createServerFn({ method: "POST" }).handler(createSsrRpc("3978122c8f0c0060ae36341090f9dc6f840e3f8f42b7fab57bf91c7559961e7b"));
var synthesizeSpeech = createServerFn({ method: "POST" }).validator((input) => ({
	text: input.text.slice(0, 320),
	voice: input.voice || "leo"
})).handler(createSsrRpc("de7890637ee15f7c3f989b0df5a4d232434d51ee4d7bb02b1739a99da5a0160e"));
var TARGET_RATE = 24e3;
var CROAK_RATE = .86;
function floatTo16BitPCM(input) {
	const out = new Int16Array(input.length);
	for (let i = 0; i < input.length; i++) {
		const s = Math.max(-1, Math.min(1, input[i]));
		out[i] = s < 0 ? s * 32768 : s * 32767;
	}
	return out;
}
function downsample(input, fromRate, toRate = TARGET_RATE) {
	if (fromRate === toRate) return input;
	const ratio = fromRate / toRate;
	const outLen = Math.floor(input.length / ratio);
	const out = new Float32Array(outLen);
	for (let i = 0; i < outLen; i++) {
		const start = Math.floor(i * ratio);
		const end = Math.min(Math.floor((i + 1) * ratio), input.length);
		let sum = 0;
		for (let j = start; j < end; j++) sum += input[j];
		out[i] = sum / Math.max(1, end - start);
	}
	return out;
}
function pcm16ToBase64(pcm) {
	const bytes = new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength);
	let binary = "";
	const chunk = 32768;
	for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
	return btoa(binary);
}
function base64ToPcm16(b64) {
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new Int16Array(bytes.buffer);
}
function rms(buf) {
	let s = 0;
	if (buf instanceof Float32Array) {
		for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
		return Math.sqrt(s / Math.max(1, buf.length));
	}
	for (let i = 0; i < buf.length; i++) {
		const v = buf[i] / 32768;
		s += v * v;
	}
	return Math.sqrt(s / Math.max(1, buf.length));
}
function makeShaperCurve() {
	const n = 256;
	const curve = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const x = i / 255 * 2 - 1;
		curve[i] = Math.tanh(x * 1.6) * .92;
	}
	return curve;
}
var PcmPlayer = class {
	ctx = null;
	next = 0;
	speechGain = null;
	noiseGain = null;
	croakFilter = null;
	shaper = null;
	lastNoise = 0;
	async ensure() {
		if (this.ctx) return this.ctx;
		const ctx = new AudioContext();
		this.ctx = ctx;
		const filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 2600;
		filter.Q.value = .7;
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
		noise.gain.value = .85;
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
	async playPcm16(pcm) {
		const ctx = await this.ensure();
		const f32 = new Float32Array(pcm.length);
		for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 32768;
		const buf = ctx.createBuffer(1, f32.length, TARGET_RATE);
		buf.copyToChannel(f32, 0);
		const src = ctx.createBufferSource();
		src.buffer = buf;
		src.playbackRate.value = CROAK_RATE;
		src.connect(this.croakFilter);
		const startAt = Math.max(ctx.currentTime, this.next);
		src.start(startAt);
		this.next = startAt + buf.duration / CROAK_RATE;
	}
	async playBase64Audio(b64) {
		const ctx = await this.ensure();
		const binary = atob(b64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		const audioBuf = await ctx.decodeAudioData(bytes.buffer.slice(0));
		const src = ctx.createBufferSource();
		src.buffer = audioBuf;
		src.playbackRate.value = CROAK_RATE;
		src.connect(this.croakFilter);
		const startAt = Math.max(ctx.currentTime, this.next);
		src.start(startAt);
		this.next = startAt + audioBuf.duration / CROAK_RATE;
	}
	async insertNoise(kind, force = false) {
		const ctx = await this.ensure();
		const now = ctx.currentTime;
		if (!force && now - this.lastNoise < .85) return 0;
		this.lastNoise = now;
		const pick = kind ?? [
			"squawk",
			"rawk",
			"click",
			"rasp"
		][Math.floor(Math.random() * 4)];
		const startAt = Math.max(now, this.next);
		const dur = scheduleParrotNoise(ctx, this.noiseGain, startAt, pick);
		this.next = startAt + dur + .05;
		return dur;
	}
	interrupt() {
		this.next = this.ctx?.currentTime ?? 0;
	}
	async close() {
		await this.ctx?.close().catch(() => void 0);
		this.ctx = null;
		this.speechGain = null;
		this.noiseGain = null;
		this.croakFilter = null;
		this.shaper = null;
	}
};
function scheduleParrotNoise(ctx, dest, when, kind) {
	const dur = kind === "click" ? .07 : kind === "rasp" ? .32 : kind === "rawk" ? .26 : .2;
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
	g.gain.setValueAtTime(1e-4, when);
	g.gain.exponentialRampToValueAtTime(kind === "click" ? .22 : .38, when + .018);
	g.gain.exponentialRampToValueAtTime(1e-4, when + dur);
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
var WORKLET = `
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
async function createCapture(onFrame) {
	const stream = await navigator.mediaDevices.getUserMedia({ audio: {
		echoCancellation: true,
		noiseSuppression: true,
		channelCount: 1
	} });
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
		const samples = ev.data;
		const ds = downsample(samples, ctx.sampleRate, TARGET_RATE);
		const level = Math.min(1, rms(ds) * 4);
		onFrame(pcm16ToBase64(floatTo16BitPCM(ds)), level);
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
			ctx.close();
		}
	};
}
var REALTIME_URL = `wss://api.x.ai/v1/realtime?model=grok-voice-latest`;
var NOISE_CUE = /[.!?]|r+a+w?k|squawk|\*(click|rasp)?\*/i;
var VoiceSession = class {
	ws = null;
	player = new PcmPlayer();
	captureStop = null;
	turns = 0;
	outputBuf = "";
	responseHadAudio = false;
	get active() {
		return !!this.ws && this.ws.readyState === WebSocket.OPEN;
	}
	async start(opts) {
		const store = useParrotStore.getState();
		store.setVoiceStatus("connecting");
		store.pushReason("voice", "Connecting", "Opening a Grok Voice session…");
		const secret = await createVoiceClientSecret();
		if (!secret.ok) {
			store.setVoiceStatus("error", secret.error);
			store.pushReason("error", "Voice", secret.error);
			throw new Error(secret.error);
		}
		const protocol = secret.value.startsWith("xai-client-secret.") ? secret.value : `xai-client-secret.${secret.value}`;
		await this.player.ensure();
		const ws = new WebSocket(REALTIME_URL, [protocol]);
		this.ws = ws;
		ws.onopen = () => {
			ws.send(JSON.stringify({
				type: "session.update",
				session: {
					voice: opts.voice,
					instructions: buildSystemPrompt({
						intensity: opts.intensity,
						scene: opts.scene,
						opening: opts.opening ?? void 0
					}),
					tools: FURBY_TOOLS,
					turn_detection: {
						type: "server_vad",
						silence_duration_ms: 700
					},
					audio: {
						input: { format: {
							type: "audio/pcm",
							rate: 24e3
						} },
						output: { format: {
							type: "audio/pcm",
							rate: 24e3
						} }
					}
				}
			}));
			store.setVoiceStatus("listening");
			store.pushReason("voice", "Live", "Parrot is listening.");
			if (opts.opening) this.speakOpening(opts.opening);
			else this.player.insertNoise("rawk", true);
			this.startMic();
		};
		ws.onmessage = (ev) => {
			if (typeof ev.data !== "string") return;
			let event;
			try {
				event = JSON.parse(ev.data);
			} catch {
				return;
			}
			this.handleEvent(event);
		};
		ws.onerror = () => {
			useParrotStore.getState().setVoiceStatus("error", "Voice socket error");
		};
		ws.onclose = () => {
			this.ws = null;
			this.captureStop?.();
			this.captureStop = null;
			const s = useParrotStore.getState();
			if (s.voiceStatus !== "error") s.setVoiceStatus("idle");
			s.logSession(this.turns);
		};
	}
	speakOpening(line) {
		const ws = this.ws;
		if (!ws) return;
		useParrotStore.getState().pushMessage("parrot", line);
		useParrotStore.getState().setTranscripts(void 0, line);
		this.player.insertNoise("rawk", true);
		ws.send(JSON.stringify({
			type: "conversation.item.create",
			item: {
				type: "message",
				role: "assistant",
				content: [{
					type: "output_text",
					text: line
				}]
			}
		}));
		ws.send(JSON.stringify({
			type: "response.create",
			response: { instructions: `Speak this opening line in a CROAKY, raspy, gravelly parrot voice, slowly, with a rawk and a beak click in it, then wait for the human: "${line}"` }
		}));
		furby.trigger("greet").catch(() => void 0);
		furby.setAntennaPreset("cheeky").catch(() => void 0);
	}
	sendText(text) {
		const ws = this.ws;
		if (!ws || !text.trim()) return;
		useParrotStore.getState().pushMessage("user", text.trim());
		this.turns += 1;
		ws.send(JSON.stringify({
			type: "conversation.item.create",
			item: {
				type: "message",
				role: "user",
				content: [{
					type: "input_text",
					text: text.trim()
				}]
			}
		}));
		ws.send(JSON.stringify({ type: "response.create" }));
	}
	interrupt() {
		this.ws?.send(JSON.stringify({ type: "response.cancel" }));
		this.player.interrupt();
	}
	stop() {
		this.captureStop?.();
		this.captureStop = null;
		this.ws?.close();
		this.ws = null;
		this.player.close();
		useParrotStore.getState().setVoiceStatus("idle");
		useParrotStore.getState().setLevels(0, 0);
	}
	async startMic() {
		try {
			const capture = await createCapture((b64, level) => {
				useParrotStore.getState().setLevels(level, useParrotStore.getState().parrotLevel);
				if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({
					type: "input_audio_buffer.append",
					audio: b64
				}));
			});
			this.captureStop = capture.stop;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Microphone unavailable";
			useParrotStore.getState().pushReason("voice", "No microphone", `${message}. Type to talk instead.`);
		}
	}
	async handleEvent(event) {
		const store = useParrotStore.getState();
		switch (event.type) {
			case "input_audio_buffer.speech_started":
				store.setVoiceStatus("listening");
				this.player.interrupt();
				break;
			case "input_audio_buffer.speech_stopped": break;
			case "conversation.item.input_audio_transcription.completed":
			case "conversation.item.input_audio_transcription.updated": {
				const transcript = String(event.transcript ?? "");
				if (transcript) {
					store.setTranscripts(transcript, void 0);
					if (event.type.endsWith("completed")) {
						store.pushMessage("user", transcript);
						this.turns += 1;
					}
				}
				break;
			}
			case "response.output_audio.delta": {
				store.setVoiceStatus("speaking");
				const delta = String(event.delta ?? "");
				if (delta) {
					if (!this.responseHadAudio) {
						this.responseHadAudio = true;
						await this.player.insertNoise("click");
					}
					const pcm = base64ToPcm16(delta);
					store.setLevels(store.micLevel, Math.min(1, rms(pcm) * 3));
					await this.player.playPcm16(pcm);
				}
				break;
			}
			case "response.output_audio_transcript.delta":
			case "response.output_text.delta":
			case "response.text.delta": {
				const d = String(event.delta ?? "");
				this.outputBuf += d;
				store.setTranscripts(void 0, this.outputBuf);
				if (NOISE_CUE.test(d)) this.player.insertNoise();
				break;
			}
			case "response.output_audio_transcript.done":
			case "response.output_text.done":
			case "response.content_part.done":
				if (this.outputBuf.trim()) {
					store.pushMessage("parrot", this.outputBuf.trim());
					this.outputBuf = "";
				}
				break;
			case "response.function_call_arguments.done": {
				const name = String(event.name ?? "");
				const callId = String(event.call_id ?? "");
				let args = {};
				try {
					args = JSON.parse(String(event.arguments ?? "{}"));
				} catch {
					args = {};
				}
				const result = await this.runTool(name, args);
				this.ws?.send(JSON.stringify({
					type: "conversation.item.create",
					item: {
						type: "function_call_output",
						call_id: callId,
						output: JSON.stringify(result)
					}
				}));
				this.ws?.send(JSON.stringify({ type: "response.create" }));
				break;
			}
			case "response.done":
				store.setVoiceStatus("listening");
				store.setLevels(store.micLevel, 0);
				if (this.responseHadAudio) this.player.insertNoise("rasp");
				this.responseHadAudio = false;
				break;
			case "error": {
				const message = event.error?.message || "Voice error";
				store.setVoiceStatus("error", message);
				store.pushReason("error", "Voice", message);
				break;
			}
		}
	}
	async runTool(name, args) {
		const store = useParrotStore.getState();
		try {
			if (name === "trigger_furby_action") {
				const action = String(args.action ?? "surprised");
				await furby.trigger(action);
				store.pushReason("tool", "Motion", action);
				return {
					ok: true,
					action
				};
			}
			if (name === "set_antenna_colour") {
				const preset = args.preset ? String(args.preset) : null;
				if (preset && PRESET_ANTENNA[preset]) {
					await furby.setAntennaPreset(preset);
					return {
						ok: true,
						preset
					};
				}
				await furby.setAntenna({
					r: Number(args.r ?? 40),
					g: Number(args.g ?? 180),
					b: Number(args.b ?? 120)
				});
				return { ok: true };
			}
			if (name === "set_emotion") {
				const type = String(args.type ?? "excitedness");
				const value = Number(args.value ?? 50);
				await furby.setMood(type, value);
				store.pushReason("tool", "Mood", `${type} → ${value}`);
				return {
					ok: true,
					type,
					value
				};
			}
			return {
				ok: false,
				error: `Unknown tool ${name}`
			};
		} catch (err) {
			return {
				ok: false,
				error: err instanceof Error ? err.message : "tool failed"
			};
		}
	}
};
var voiceSession = new VoiceSession();
function Boot() {
	const lastEngage = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		useParrotStore.persist.rehydrate();
		const unsub = useParrotStore.persist.onFinishHydration(() => {
			const s = useParrotStore.getState();
			if (s.furbyMode !== "simulator") furby.setMode(s.furbyMode);
			if (!s.scene) s.applyScene(classifyScene(makeDemoDetections(s.demoScene)), "demo");
		});
		checkAiAvailable().then((r) => useParrotStore.getState().setAiAvailable(r.ok)).catch(() => useParrotStore.getState().setAiAvailable(false));
		return () => {
			unsub();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => {
			const s = useParrotStore.getState();
			if (s.scene?.id !== "empty") return;
			if (s.voiceStatus === "speaking" || s.voiceStatus === "connecting") return;
			const act = IDLE_ACTIONS[Math.floor(Math.random() * IDLE_ACTIONS.length)];
			if (act) furby.trigger(act.id).catch(() => void 0);
			furby.setAntennaPreset("sleepy").catch(() => void 0);
			s.pushReason("idle", "Idle mutter", act?.hint ?? "perch");
		}, 14e3);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		return useParrotStore.subscribe((state, prev) => {
			if (!state.autoEngage) return;
			if (state.voiceStatus !== "idle") return;
			if (!state.scene || state.scene.id === "empty") return;
			if (prev.scene?.id === state.scene.id) return;
			if (Date.now() - lastEngage.current < 2e4) return;
			lastEngage.current = Date.now();
			voiceSession.start({
				voice: state.voiceId,
				intensity: state.roastIntensity,
				scene: state.scene,
				opening: state.pendingOpening
			}).catch(() => void 0);
		});
	}, []);
	return null;
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-[opacity,transform,background-color,box-shadow] duration-[var(--motion-quick,150ms)] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
			secondary: "bg-secondary text-secondary-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:bg-surface-2 hover:shadow-[var(--shadow-border-hover)]",
			ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-fg",
			canal: "bg-canal text-accent-fg hover:opacity-90 active:scale-[0.98]",
			danger: "bg-danger/15 text-danger hover:bg-danger/25"
		},
		size: {
			default: "h-10 min-h-10 px-4",
			sm: "h-8 min-h-8 px-3 text-xs",
			lg: "h-11 min-h-11 px-5",
			icon: "size-10 min-h-10 min-w-10",
			"icon-sm": "size-8 min-h-8 min-w-8"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-10 w-full rounded-sm bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-40", className),
	ref,
	...props
}));
Input.displayName = "Input";
var ScrollArea = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
	ref,
	className: cn("relative overflow-hidden", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
		className: "h-full w-full rounded-[inherit]",
		children
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
		orientation: "vertical",
		className: "flex w-2.5 touch-none p-px select-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-muted/70" })
	})]
}));
ScrollArea.displayName = Root.displayName;
var ttsPlayer = new PcmPlayer();
function ConversationPanel() {
	const messages = useParrotStore((s) => s.messages);
	const voiceStatus = useParrotStore((s) => s.voiceStatus);
	const pendingOpening = useParrotStore((s) => s.pendingOpening);
	const voiceId = useParrotStore((s) => s.voiceId);
	const pushMessage = useParrotStore((s) => s.pushMessage);
	const clearConversation = useParrotStore((s) => s.clearConversation);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [speakingLine, setSpeakingLine] = (0, import_react.useState)(false);
	const endRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({ block: "end" });
	}, [messages]);
	function send() {
		const text = draft.trim();
		if (!text) return;
		setDraft("");
		if (voiceSession.active) voiceSession.sendText(text);
		else {
			pushMessage("user", text);
			pushMessage("system", "Start talk to let the parrot answer in voice. You can still preview openings below.");
		}
	}
	async function speakOpening() {
		if (!pendingOpening) return;
		setSpeakingLine(true);
		try {
			await ttsPlayer.insertNoise("rawk", true);
			const res = await synthesizeSpeech({ data: {
				text: pendingOpening,
				voice: voiceId
			} });
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			pushMessage("parrot", pendingOpening);
			await ttsPlayer.playBase64Audio(res.audio);
			await ttsPlayer.insertNoise("rasp");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not speak");
		} finally {
			setSpeakingLine(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "flex h-80 flex-col overflow-hidden p-3 md:h-96",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "mb-2 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Conversation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[11px] text-muted hover:text-fg",
						onClick: () => void speakOpening(),
						disabled: !pendingOpening || speakingLine,
						children: speakingLine ? "Speaking…" : "Speak opening"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[11px] text-muted hover:text-fg",
						onClick: clearConversation,
						children: "Clear"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
				className: "min-h-0 flex-1 pr-2",
				children: [messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-1 py-6 text-sm text-muted",
					children: "No banter yet. Pick a tow-path scene, then start talk — or speak the opening on its own."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: m.role === "parrot" ? "rounded-md bg-canal/10 px-3 py-2 text-sm" : m.role === "user" ? "rounded-md bg-surface-2 px-3 py-2 text-sm" : "px-1 text-xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-[10px] uppercase tracking-[0.14em] text-muted",
							children: m.role === "parrot" ? "Parrot" : m.role === "user" ? "Passer-by" : "System"
						}), m.text]
					}, m.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 flex shrink-0 gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					send();
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: voiceSession.active ? "Talk back, or type…" : "Type a reply (start talk for voice)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					size: "icon",
					variant: "secondary",
					"aria-label": "Send",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 shrink-0 text-[11px] text-subtle",
				children: voiceStatus === "listening" ? "Listening on the tow path…" : voiceStatus === "speaking" ? "Parrot is talking." : "Voice idle."
			})
		]
	});
}
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none items-center select-none", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-canal" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-4 rounded-full bg-accent shadow-[var(--shadow-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70" })]
}));
Slider.displayName = Slider$1.displayName;
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("flex flex-wrap gap-1 rounded-md bg-surface-2 p-1", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex min-h-8 items-center justify-center rounded-xs px-3 py-1.5 text-xs font-medium text-muted transition-colors data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-[var(--shadow-border)]", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-3 outline-none", className),
	...props
}));
TabsContent.displayName = Content.displayName;
function FurbyPanel() {
	const mode = useParrotStore((s) => s.furbyMode);
	const setFurbyMode = useParrotStore((s) => s.setFurbyMode);
	const antenna = useParrotStore((s) => s.antenna);
	const lastAction = useParrotStore((s) => s.lastAction);
	const sensors = useParrotStore((s) => s.sensors);
	const connected = useParrotStore((s) => s.furbyConnected);
	const [custom, setCustom] = (0, import_react.useState)("29 0 0 0");
	async function run(id) {
		try {
			await furby.trigger(id);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Action failed");
		}
	}
	async function runCustom() {
		const parts = custom.split(/[,\s]+/).map((n) => Number(n));
		if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
			toast.error("Need four numbers: input, index, subindex, specific");
			return;
		}
		try {
			await furby.trigger({
				input: parts[0],
				index: parts[1],
				subindex: parts[2],
				specific: parts[3]
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Action failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Furby control" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] text-subtle",
					children: connected ? "linked" : "offline"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3 flex rounded-sm bg-surface-2 p-0.5",
				children: ["simulator", "bluetooth"].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFurbyMode(m),
					className: `min-h-8 flex-1 rounded-xs px-2 text-[11px] capitalize ${mode === m ? "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted"}`,
					children: m === "bluetooth" ? "FurBLE" : "Sim"
				}, m))
			}),
			mode === "bluetooth" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted",
				children: "Chrome on a machine next to the Furby. Tap Connect Furby in the header — pairing needs a tap. Keep-alive and auto-reconnect stay on while linked."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-3 text-xs text-muted",
				children: "Simulator parrot on the treasure chest. Switch to FurBLE when the real bird is in range."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "actions",
								className: "flex-1",
								children: "Actions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "antenna",
								className: "flex-1",
								children: "Antenna"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "sensors",
								className: "flex-1",
								children: "Sensors"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "actions",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-1.5 sm:grid-cols-3",
								children: FURBY_ACTIONS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "secondary",
									size: "sm",
									onClick: () => void run(a.id),
									children: a.label
								}, a.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 flex gap-2",
								onSubmit: (e) => {
									e.preventDefault();
									runCustom();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									defaultValue: "29 0 0 0",
									onChange: (e) => setCustom(e.target.value),
									placeholder: "input index subindex specific",
									className: "font-mono text-xs",
									autoComplete: "off"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "outline",
									size: "sm",
									children: "Send"
								})]
							}),
							lastAction && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted",
								children: ["Last: ", lastAction]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "antenna",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-3 flex flex-wrap gap-1.5",
								children: Object.keys(PRESET_ANTENNA).map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void furby.setAntennaPreset(name),
									className: "flex min-h-8 items-center gap-2 rounded-full bg-surface-2 px-3 text-[11px] capitalize text-muted hover:text-fg",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-3 rounded-full",
										style: { background: `rgb(${PRESET_ANTENNA[name].r},${PRESET_ANTENNA[name].g},${PRESET_ANTENNA[name].b})` }
									}), name]
								}, name))
							}),
							[
								"r",
								"g",
								"b"
							].map((ch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mb-2 block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mb-1 flex justify-between text-[11px] uppercase tracking-[0.14em] text-muted",
									children: [ch, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums",
										children: antenna[ch]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
									max: 255,
									value: [antenna[ch]],
									onValueChange: ([v]) => void furby.setAntenna({
										...antenna,
										[ch]: v ?? 0
									})
								})]
							}, ch)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										onClick: () => void furby.setLcd(true),
										children: "LCD on"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										onClick: () => void furby.setLcd(false),
										children: "LCD off"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => void furby.debug(),
										children: "Debug"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "sensors",
						children: sensors ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-2 gap-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row$1, {
									k: "Antenna X",
									v: String(sensors.antennaX)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row$1, {
									k: "Antenna Y",
									v: String(sensors.antennaY)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row$1, {
									k: "Motion",
									v: String(sensors.motion)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row$1, {
									k: "Tickle",
									v: String(sensors.tickle)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row$1, {
									k: "Raw",
									v: sensors.raw.slice(0, 8).join(" ")
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No sensor stream yet. Simulator stays quiet; FurBLE pushes packets once the bird is linked."
						})
					})
				]
			})
		]
	});
}
function Row$1({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-subtle",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-mono text-fg",
		children: v
	})] });
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase", {
	variants: { variant: {
		default: "bg-surface-2 text-muted",
		canal: "bg-canal/20 text-canal",
		live: "bg-canal/20 text-canal",
		warn: "bg-warn/15 text-warn",
		danger: "bg-danger/15 text-danger",
		outline: "shadow-[var(--shadow-border)] text-muted"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	ref,
	className: cn("peer inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 data-[state=checked]:bg-canal data-[state=unchecked]:bg-surface-2", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-4 translate-x-0.5 rounded-full bg-fg shadow-sm transition-transform data-[state=checked]:translate-x-[18px] data-[state=unchecked]:bg-muted" })
}));
Switch.displayName = Switch$1.displayName;
function ParrotMascot({ antenna, speaking, status, className }) {
	const led = `rgb(${antenna.r}, ${antenna.g}, ${antenna.b})`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 88 88",
		className: cn("h-14 w-14", (speaking || status === "listening") && "animate-[idle-bob_1.6s_ease-in-out_infinite]", className),
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "46",
				cy: "82",
				rx: "22",
				ry: "4",
				fill: "currentColor",
				className: "text-fg/10"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "54",
				y: "10",
				width: "3",
				height: "16",
				rx: "1",
				fill: "#3a3228"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "55.5",
				cy: "10",
				r: "5",
				fill: led,
				className: "origin-center animate-[antenna-pulse_1.8s_ease-in-out_infinite]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 58 C10 62 8 74 16 80 C22 74 24 66 22 60 Z",
				fill: "#1f6b3a"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M20 60 C14 66 16 76 22 78 C24 72 26 64 22 60 Z",
				fill: "#c43b2e"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "44",
				cy: "56",
				rx: "22",
				ry: "20",
				fill: "#c43b2e"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "40",
				cy: "60",
				rx: "14",
				ry: "12",
				fill: "#b33428"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "38",
				cy: "58",
				rx: "16",
				ry: "11",
				fill: "#2f8a45",
				transform: "rotate(-18 38 58)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M26 56 Q34 48 48 54 Q40 64 28 62 Z",
				fill: "#1f6b3a"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M30 58 Q38 52 46 56 Q40 62 32 60 Z",
				fill: "#3db35c"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "62",
				cy: "38",
				rx: "16",
				ry: "15",
				fill: "#c43b2e"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M52 32 Q62 18 74 30 Q70 40 54 38 Z",
				fill: "#2f8a45"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "68",
				cy: "40",
				rx: "8",
				ry: "7",
				fill: "#f3e6c8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				style: {
					transformBox: "fill-box",
					transformOrigin: "center",
					animation: "parrot-blink 4.2s infinite"
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "70",
						cy: "38",
						r: "4.2",
						fill: "#f7f1e4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "71",
						cy: "38",
						r: "2.2",
						fill: "#0a0c0b"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "71.8",
						cy: "37.2",
						r: "0.7",
						fill: "#f7f1e4"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: speaking ? "M76 40 Q88 38 84 48 Q78 46 76 44 Z" : "M76 40 Q86 36 82 46 Q78 44 76 42 Z",
				fill: "#e2a12a"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M76 42 Q82 42 80 46",
				fill: "none",
				stroke: "#b37818",
				strokeWidth: "0.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M40 74 L36 80 M44 74 L46 80 M48 74 L52 80",
				stroke: "#e2a12a",
				strokeWidth: "1.6",
				strokeLinecap: "round"
			})
		]
	});
}
var ROASTS = [
	"mild",
	"medium",
	"unhinged"
];
function HeaderBar() {
	const antenna = useParrotStore((s) => s.antenna);
	const voiceStatus = useParrotStore((s) => s.voiceStatus);
	const furbyConnected = useParrotStore((s) => s.furbyConnected);
	const furbyName = useParrotStore((s) => s.furbyName);
	const furbyDetail = useParrotStore((s) => s.furbyDetail);
	const furbyMode = useParrotStore((s) => s.furbyMode);
	const roast = useParrotStore((s) => s.roastIntensity);
	const setRoast = useParrotStore((s) => s.setRoast);
	const autoEngage = useParrotStore((s) => s.autoEngage);
	const setAutoEngage = useParrotStore((s) => s.setAutoEngage);
	const scene = useParrotStore((s) => s.scene);
	const pendingOpening = useParrotStore((s) => s.pendingOpening);
	const voiceId = useParrotStore((s) => s.voiceId);
	const setVoiceId = useParrotStore((s) => s.setVoiceId);
	const aiAvailable = useParrotStore((s) => s.aiAvailable);
	const setFurbyMode = useParrotStore((s) => s.setFurbyMode);
	const live = voiceStatus !== "idle" && voiceStatus !== "error";
	const bleOn = furbyConnected && furbyMode === "bluetooth";
	async function onConnect() {
		try {
			if (furbyMode === "bluetooth" && furbyConnected) {
				await furby.disconnect();
				return;
			}
			if (!furby.bluetoothAvailable()) {
				toast.error("FurBLE needs Chrome with Web Bluetooth.");
				return;
			}
			if (furbyMode !== "bluetooth") setFurbyMode("bluetooth");
			await furby.connect();
			toast.success(`FurBLE linked to ${useParrotStore.getState().furbyName}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not connect");
		}
	}
	async function onVoice() {
		if (live) {
			voiceSession.stop();
			return;
		}
		try {
			await voiceSession.start({
				voice: voiceId,
				intensity: roast,
				scene,
				opening: pendingOpening
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Voice failed");
		}
	}
	function cycleVoice() {
		const i = PARROT_VOICE_IDS.indexOf(voiceId);
		setVoiceId(PARROT_VOICE_IDS[(i + 1) % PARROT_VOICE_IDS.length]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 md:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParrotMascot, {
					antenna,
					speaking: voiceStatus === "speaking",
					status: voiceStatus
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl leading-tight tracking-tight text-fg md:text-2xl",
						children: "TTPFTTP"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-muted",
						children: "Trash Talking Parrot for the Tow Path"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex rounded-sm bg-surface-2 p-0.5 shadow-[var(--shadow-border)]",
						children: ROASTS.map((level) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setRoast(level),
							className: `min-h-8 rounded-xs px-3 text-xs font-medium capitalize ${roast === level ? level === "unhinged" ? "bg-danger/20 text-danger shadow-[var(--shadow-border)]" : "bg-surface text-fg shadow-[var(--shadow-border)]" : "text-muted"}`,
							children: level
						}, level))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: cycleVoice,
						className: "min-h-8 rounded-sm px-3 text-xs capitalize text-muted shadow-[var(--shadow-border)] hover:text-fg",
						children: ["Voice ", voiceId]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-10 items-center gap-2 rounded-sm px-2 text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: autoEngage,
							onCheckedChange: setAutoEngage
						}), "Auto-engage"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: live ? "canal" : "default",
						onClick: () => void onVoice(),
						disabled: aiAvailable === false,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {}), live ? "End talk" : "Start talk"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: bleOn ? "canal" : "outline",
						onClick: () => void onConnect(),
						children: [bleOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bluetooth, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BluetoothOff, {}), bleOn ? "Disconnect" : "Connect Furby"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex w-full flex-wrap items-center gap-2 md:w-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: furbyConnected ? "live" : "outline",
						children: furbyName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate text-xs text-subtle",
						children: furbyDetail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: voiceStatus === "error" ? "danger" : voiceStatus === "idle" ? "outline" : "canal",
						children: voiceStatus
					}),
					aiAvailable === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "warn",
						children: "Voice API offline"
					})
				]
			})
		]
	});
}
function ReasoningLog() {
	const reasoning = useParrotStore((s) => s.reasoning);
	const logs = useParrotStore((s) => s.logs);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "flex min-h-0 flex-col p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
				className: "mb-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Why that line" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "max-h-48 pr-2",
				children: reasoning.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Scene analysis will land here."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-2",
					children: [...reasoning].reverse().map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-l border-border pl-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] uppercase tracking-[0.14em] text-subtle",
								children: [
									r.kind,
									" · ",
									new Date(r.at).toLocaleTimeString("en-GB", {
										hour: "2-digit",
										minute: "2-digit",
										second: "2-digit"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-fg",
								children: r.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: r.detail
							})
						]
					}, r.id))
				})
			}),
			logs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 border-t border-border pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-subtle",
					children: "Recent sessions"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-xs text-muted",
					children: logs.slice(0, 5).map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "truncate",
						children: [
							l.sceneLabel,
							" — ",
							l.opening
						]
					}, l.id))
				})]
			})
		]
	});
}
function ScenePanel() {
	const scene = useParrotStore((s) => s.scene);
	const opening = useParrotStore((s) => s.pendingOpening);
	const forceNewOpening = useParrotStore((s) => s.forceNewOpening);
	if (!scene) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Scene" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Waiting for a frame…"
	})] });
	const pct = Math.round(scene.confidence * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Scene" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			variant: "canal",
			children: scene.dayPart
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl leading-snug tracking-tight text-fg",
			children: scene.label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full rounded-full bg-canal",
				style: { width: `${pct}%` }
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-xs tabular-nums text-muted",
			children: [pct, "% confidence"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "When",
					v: `${scene.weekday} · ${scene.clock}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Group",
					v: `${scene.groupSize}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Activity",
					v: scene.activity
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Dog",
					v: scene.hasDog ? "yes" : "no"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Bicycle",
					v: scene.hasBicycle ? "yes" : "no"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
					k: "Close-up",
					v: scene.closeUp ? "desk" : "path"
				})
			]
		}),
		scene.notes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-xs text-subtle",
			children: scene.notes.join(" ")
		}),
		opening && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
			className: "mt-4 rounded-md bg-surface-2 px-3 py-2 text-sm leading-relaxed text-fg",
			children: [
				"“",
				opening,
				"”"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mt-3 text-xs text-muted underline-offset-2 hover:text-fg hover:underline",
			onClick: () => forceNewOpening(),
			children: "Force a new opening"
		})
	] });
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-subtle",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "capitalize text-fg",
			children: v
		})]
	});
}
function TowpathScene({ scene }) {
	const part = scene?.dayPart ?? "evening";
	const empty = !scene || scene.id === "empty";
	const people = empty ? 0 : Math.max(1, scene.peopleCount);
	const jogging = scene?.activity === "running" || scene?.activity === "brisk";
	const sky = part === "night" ? ["#0c1014", "#1a2220"] : part === "morning" ? ["#c9b8a0", "#7a8a82"] : part === "afternoon" ? ["#8aa0a8", "#5b7068"] : ["#3a3c48", "#2a322e"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 640 360",
		className: "h-full w-full",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "sky",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0",
						stopColor: sky[0]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "1",
						stopColor: sky[1]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "water",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0",
						stopColor: "#1a2e2c"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "1",
						stopColor: "#0d1614"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "hull",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0",
						stopColor: "#3d2a18"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "1",
						stopColor: "#24180e"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: "cabin",
					x1: "0",
					y1: "0",
					x2: "0",
					y2: "1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0",
						stopColor: "#6a9e8c"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "1",
						stopColor: "#3d6b5c"
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "640",
				height: "360",
				fill: "url(#sky)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M0 168 Q240 148 640 176 L640 360 L0 360 Z",
				fill: "#1c2420"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M0 228 Q320 214 640 242 L640 360 L0 360 Z",
				fill: "url(#water)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "0",
				y: "186",
				width: "640",
				height: "42",
				fill: "#2a2620"
			}),
			Array.from({ length: 36 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: i * 18,
				y: "186",
				width: "10",
				height: "4",
				fill: "#3a342c"
			}, i)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				className: "origin-center",
				style: { animation: "idle-bob 3.2s ease-in-out infinite" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Narrowboat, {})
			}),
			empty && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				className: "origin-center",
				style: { animation: "idle-bob 3.6s ease-in-out infinite" },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "520",
						cy: "278",
						rx: "10",
						ry: "6",
						fill: "#c8d4cc"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "530",
						cy: "272",
						r: "4",
						fill: "#c8d4cc"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
						points: "534,272 544,274 534,276",
						fill: "#c45c4a"
					})
				]
			}),
			!empty && Array.from({ length: people }, (_, i) => {
				const x = 280 + i * 86;
				const scale = scene?.closeUp ? 1.7 : scene?.hasChild && i === people - 1 ? .62 : 1;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Walker, {
					x,
					y: 178,
					scale,
					jogging
				}, i);
			}),
			scene?.hasDog && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(500 208)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "-14",
						y: "0",
						width: "26",
						height: "10",
						fill: "#2a2218"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "10",
						y: "-6",
						width: "10",
						height: "8",
						fill: "#2a2218"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "-14",
						y: "10",
						width: "4",
						height: "8",
						fill: "#2a2218"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "6",
						y: "10",
						width: "4",
						height: "8",
						fill: "#2a2218"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "-16",
						y: "2",
						width: "8",
						height: "3",
						fill: "#2a2218"
					})
				]
			}),
			scene?.hasBicycle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(400 198)",
				fill: "none",
				stroke: "#111",
				strokeWidth: "2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "-16",
						cy: "18",
						r: "10"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "16",
						cy: "18",
						r: "10"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M-16 18 L0 6 L16 18 L4 0" })
				]
			})
		]
	});
}
function Narrowboat() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		transform: "translate(36 150)",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M8 78 L18 58 L236 58 L252 78 L248 92 L12 92 Z",
				fill: "url(#hull)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "18",
				y: "70",
				width: "218",
				height: "8",
				fill: "#c45c4a"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 58 L28 48 L210 48 L236 58 Z",
				fill: "#2a241c"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "70",
				y: "22",
				width: "118",
				height: "36",
				rx: "2",
				fill: "url(#cabin)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "76",
				y: "28",
				width: "18",
				height: "12",
				fill: "#1a2422"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "102",
				y: "28",
				width: "18",
				height: "12",
				fill: "#1a2422"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "128",
				y: "28",
				width: "18",
				height: "12",
				fill: "#1a2422"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "154",
				y: "28",
				width: "18",
				height: "12",
				fill: "#1a2422"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "188",
				y: "18",
				width: "8",
				height: "18",
				fill: "#3a3228"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "186",
				y: "12",
				width: "12",
				height: "6",
				fill: "#2a241c"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "20",
				y: "50",
				width: "48",
				height: "10",
				fill: "#3a3228"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M28 50 L22 38 L26 38 L34 50",
				fill: "#1a1612"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M248 82 Q280 90 300 78",
				fill: "none",
				stroke: "#3a3228",
				strokeWidth: "1.4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(112 4)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "0",
						y: "10",
						width: "44",
						height: "20",
						rx: "2",
						fill: "#6b4424"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "0",
						y: "6",
						width: "44",
						height: "10",
						rx: "2",
						fill: "#8a5a2b"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "20",
						y: "12",
						width: "6",
						height: "10",
						rx: "1",
						fill: "#c4a15a"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "16",
						width: "40",
						height: "3",
						fill: "#c4a15a"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "-1",
						y: "8",
						width: "46",
						height: "3",
						fill: "#c4a15a"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileParrot, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M20 90 Q130 98 244 90",
				fill: "none",
				stroke: "#6a9e8c",
				strokeWidth: "1",
				opacity: "0.35"
			})
		]
	});
}
function ProfileParrot() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		transform: "translate(28 -10)",
		style: { animation: "idle-bob 1.8s ease-in-out infinite" },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M-16 18 C-22 22 -20 32 -12 34 C-8 28 -8 22 -10 18 Z",
				fill: "#1f6b3a"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "2",
				cy: "18",
				rx: "12",
				ry: "11",
				fill: "#c43b2e"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "-2",
				cy: "20",
				rx: "8",
				ry: "7",
				fill: "#2f8a45",
				transform: "rotate(-20 -2 20)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "12",
				cy: "8",
				rx: "9",
				ry: "8",
				fill: "#c43b2e"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M6 4 Q12 -4 20 6 Q16 12 8 10 Z",
				fill: "#2f8a45"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "16",
				cy: "9",
				rx: "4.5",
				ry: "4",
				fill: "#f3e6c8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "17.5",
				cy: "8.5",
				r: "1.6",
				fill: "#0a0c0b"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M20 9 Q28 8 25 14 Q22 12 20 11 Z",
				fill: "#e2a12a"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "10",
				y: "-10",
				width: "1.6",
				height: "10",
				rx: "0.6",
				fill: "#3a3228"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "10.8",
				cy: "-10",
				r: "2.4",
				fill: "#6a9e8c"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M0 28 L-2 34 M4 28 L6 34",
				stroke: "#e2a12a",
				strokeWidth: "1.2",
				strokeLinecap: "round"
			})
		]
	});
}
function Walker({ x, y, scale, jogging }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		transform: `translate(${x} ${y}) scale(${scale})`,
		fill: "#1a1c1a",
		stroke: "#1a1c1a",
		strokeWidth: "3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cy: "-28",
				r: "8",
				stroke: "none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "-7",
				y: "-20",
				width: "14",
				height: "28",
				stroke: "none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: jogging ? "M-6 -14 L-16 4 M6 -14 L16 0 M-4 8 L-10 28 M4 8 L10 28" : "M-6 -14 L-12 6 M6 -14 L12 4 M-4 8 L-6 28 M4 8 L6 28" })
		]
	});
}
function OverlayBoxes() {
	const scene = useParrotStore((s) => s.scene);
	if (!useParrotStore((s) => s.overlays) || !scene) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0",
		children: [scene.people.map((p) => {
			const [x, y, w, h] = p.bbox;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute rounded-xs border border-canal",
				style: {
					left: `${x * 100}%`,
					top: `${y * 100}%`,
					width: `${w * 100}%`,
					height: `${h * 100}%`
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute -top-4 left-1 text-[10px] text-accent",
					children: p.likelyChild ? "child" : "person"
				})
			}, `p-${p.id}`);
		}), scene.objects.map((o, i) => {
			const [x, y, w, h] = o.bbox;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute rounded-xs border border-warn",
				style: {
					left: `${x * 100}%`,
					top: `${y * 100}%`,
					width: `${w * 100}%`,
					height: `${h * 100}%`
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute -top-4 left-1 text-[10px] text-warn",
					children: o.label
				})
			}, `o-${i}`);
		})]
	});
}
var WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
var POSE_MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
var OBJECT_MODELS = ["https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite", "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/latest/efficientdet_lite0.tflite"];
var VisionPipeline = class {
	pose = null;
	objects = null;
	lastVideoTime = -1;
	motion = /* @__PURE__ */ new Map();
	ready = false;
	error = null;
	async init() {
		const { FilesetResolver, PoseLandmarker, ObjectDetector } = await import("../_libs/mediapipe__tasks-vision.mjs").then((n) => n.t);
		const fileset = await FilesetResolver.forVisionTasks(WASM_CDN);
		const tryPose = async (delegate) => {
			this.pose = await PoseLandmarker.createFromOptions(fileset, {
				baseOptions: {
					modelAssetPath: POSE_MODEL,
					delegate
				},
				runningMode: "VIDEO",
				numPoses: 4,
				minPoseDetectionConfidence: .4,
				minPosePresenceConfidence: .4,
				minTrackingConfidence: .4
			});
		};
		try {
			await tryPose("GPU");
		} catch {
			await tryPose("CPU");
		}
		if (!this.pose) throw new Error("Pose model failed to load");
		for (const url of OBJECT_MODELS) {
			const tryObjects = async (delegate) => {
				this.objects = await ObjectDetector.createFromOptions(fileset, {
					baseOptions: {
						modelAssetPath: url,
						delegate
					},
					runningMode: "VIDEO",
					scoreThreshold: .35,
					maxResults: 8
				});
			};
			try {
				await tryObjects("GPU");
				break;
			} catch {
				try {
					await tryObjects("CPU");
					break;
				} catch {
					this.objects = null;
				}
			}
		}
		if (!this.objects) this.error = "Object detector unavailable — pose-only scene analysis";
		this.ready = true;
	}
	detect(video, ts) {
		if (!this.pose) return null;
		if (video.currentTime === this.lastVideoTime) return null;
		this.lastVideoTime = video.currentTime;
		const w = video.videoWidth || 1;
		const h = video.videoHeight || 1;
		const poses = this.pose.detectForVideo(video, ts);
		const dets = this.objects?.detectForVideo(video, ts);
		return classifyScene({
			people: (poses.landmarks ?? []).map((lms, i) => {
				const xs = lms.map((p) => p.x);
				const ys = lms.map((p) => p.y);
				const minX = Math.min(...xs);
				const maxX = Math.max(...xs);
				const minY = Math.min(...ys);
				const maxY = Math.max(...ys);
				const bw = Math.max(.02, maxX - minX);
				const bh = Math.max(.02, maxY - minY);
				const cy = (minY + maxY) / 2;
				const prev = this.motion.get(i);
				let motion = 0;
				if (prev && prev.xs.length === xs.length) {
					let acc = 0;
					for (let k = 0; k < xs.length; k++) acc += Math.hypot(xs[k] - prev.xs[k], ys[k] - prev.ys[k]);
					motion = Math.min(1, acc / xs.length / .08);
				}
				this.motion.set(i, {
					xs,
					ys
				});
				const lShoulder = lms[11];
				const rShoulder = lms[12];
				const lHip = lms[23];
				const rHip = lms[24];
				let likelyChild = false;
				if (lShoulder && rShoulder && lHip && rHip) {
					const shoulderW = Math.abs(lShoulder.x - rShoulder.x);
					const torso = Math.abs((lShoulder.y + rShoulder.y) / 2 - (lHip.y + rHip.y) / 2);
					likelyChild = bh < .38 && shoulderW < .16 && torso < .22 && cy > .4;
				}
				return {
					id: i,
					bbox: [
						minX,
						minY,
						bw,
						bh
					],
					closeness: Math.min(1, bh),
					motion,
					likelyChild
				};
			}),
			objects: (dets?.detections ?? []).map((d) => {
				const cat = d.categories[0];
				const bb = d.boundingBox;
				if (!cat || !bb) return null;
				return {
					label: cat.categoryName.toLowerCase(),
					score: cat.score,
					bbox: [
						bb.originX / w,
						bb.originY / h,
						bb.width / w,
						bb.height / h
					]
				};
			}).filter((x) => !!x && x.label !== "person")
		});
	}
	close() {
		this.pose?.close();
		this.objects?.close();
		this.pose = null;
		this.objects = null;
		this.ready = false;
	}
};
var DEMO_SCENES = [
	"empty",
	"single_adult",
	"single_adult_male",
	"single_adult_female",
	"multiple_adults",
	"adult_child",
	"adult_dog",
	"single_jogger",
	"multiple_joggers",
	"cyclist",
	"multiple_cyclists",
	"close_sitter"
];
function WebcamPanel() {
	const videoRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const pipelineRef = (0, import_react.useRef)(null);
	const [camError, setCamError] = (0, import_react.useState)(null);
	const [visionReady, setVisionReady] = (0, import_react.useState)(false);
	const cameraMode = useParrotStore((s) => s.cameraMode);
	const setCameraMode = useParrotStore((s) => s.setCameraMode);
	const demoScene = useParrotStore((s) => s.demoScene);
	const setDemoScene = useParrotStore((s) => s.setDemoScene);
	const scene = useParrotStore((s) => s.scene);
	const overlays = useParrotStore((s) => s.overlays);
	const setOverlays = useParrotStore((s) => s.setOverlays);
	const applyScene = useParrotStore((s) => s.applyScene);
	(0, import_react.useEffect)(() => {
		if (!useParrotStore.getState().scene) applyScene(classifyScene(makeDemoDetections(demoScene)), "demo");
	}, [applyScene, demoScene]);
	async function startCamera() {
		setCamError(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "environment",
					width: { ideal: 1280 },
					height: { ideal: 720 }
				},
				audio: false
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
			}
			setCameraMode("live");
			const pipe = new VisionPipeline();
			pipelineRef.current = pipe;
			try {
				await pipe.init();
				setVisionReady(true);
				if (pipe.error) setCamError(pipe.error);
			} catch (err) {
				setVisionReady(false);
				setCamError(err instanceof Error ? err.message : "Vision models unavailable — live video only");
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
	(0, import_react.useEffect)(() => {
		if (cameraMode !== "live") return;
		let raf = 0;
		const loop = (t) => {
			const video = videoRef.current;
			const pipe = pipelineRef.current;
			if (video && pipe?.ready && video.readyState >= 2) {
				const next = pipe.detect(video, t);
				if (next) applyScene(next, "live");
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [cameraMode, applyScene]);
	(0, import_react.useEffect)(() => () => stopCamera(), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "flex min-h-0 flex-col p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Path camera" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: cameraMode === "live" ? "live" : "outline",
						children: cameraMode === "live" ? visionReady ? "Live + vision" : "Live" : "Demo patrol"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-[11px] text-muted underline-offset-2 hover:text-fg hover:underline",
						onClick: () => setOverlays(!overlays),
						children: overlays ? "Hide boxes" : "Show boxes"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-video overflow-hidden rounded-md bg-bg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						className: cameraMode === "live" ? "absolute inset-0 h-full w-full object-cover" : "hidden",
						playsInline: true,
						muted: true
					}),
					cameraMode !== "live" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TowpathScene, { scene }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverlayBoxes, {}),
					camError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "absolute bottom-2 left-2 right-2 rounded-sm bg-bg/80 px-2 py-1 text-xs text-warn",
						children: camError
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: cameraMode === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: stopCamera,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraOff, {}), "Stop camera"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					size: "sm",
					onClick: () => void startCamera(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}), "Use webcam"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-1 overflow-x-auto pb-1",
				children: DEMO_SCENES.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setDemoScene(id),
					className: `min-h-8 shrink-0 rounded-full px-3 text-[11px] ${demoScene === id && cameraMode === "demo" ? "bg-canal/20 text-canal" : "bg-surface-2 text-muted hover:text-fg"}`,
					children: SCENE_LABELS[id]
				}, id))
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Boot, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1400px] gap-3 p-3 pb-8 md:grid-cols-12 md:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex min-w-0 flex-col gap-3 md:col-span-7",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebcamPanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioMonitors, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex min-w-0 flex-col gap-3 md:col-span-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScenePanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationPanel, {})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-w-0 md:col-span-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FurbyPanel, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-w-0 md:col-span-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReasoningLog, {})
					})
				]
			})
		]
	});
}
//#endregion
export { Home as component };

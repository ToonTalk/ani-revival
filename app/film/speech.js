// ---------------------------------------------------------------- speech: Read aloud and Talk to Ani

// reports/chapter-x/design-young-children.md §8 and §9. Both are at every setting: at 6–11
// Read aloud is beside Play (off until turned on); at 12+ both are off at first and out of the way, in a
// small "Speech" in the header's row, so that the page looks as it was (Read aloud appears
// beside Play only once it is turned on, and at 12+ the film never waits for the voice).
// Read aloud uses the browser's own voices (speechSynthesis): nothing is sent by the page,
// and the computer's local voices work offline. It reads each new caption as the film
// plays (at 6–11 the film waits for the voice if the speech settings say so), and any box's
// "Read this".
// Talk to Ani uses the browser's speech recognition, which in Chrome sends the audio to
// Google (in Edge to Microsoft, in Safari to Apple). So it is off until a grown-up turns it
// on, on this computer, in the speech settings; a link can never turn it on (the hash sets
// only the age, app/film/ages.js). Nothing is ever sent or made by speech alone: the words
// go into a box, and the box's own button sends them. Where the browser has no recognition
// (Firefox; the claude.ai copy, whose frame has no microphone; offline), no microphone is
// shown, and the settings point to the computer's own dictation.
// The settings are kept in this browser (SPEECH_KEY): Read aloud on or off, the voice, the
// rate, whether the film waits for the voice, and Talk to Ani's opt-in with its date. No
// voice, no recording and no words heard are kept.
const SPEECH_KEY = "ani-cinderella:speech:v1";
// How the voice is to say a word, for the synthesizer only (the page's text is unchanged):
// Ken's "Ani" is AN-ee.
const SAY_AS = { Ani: "Annie" };
let SPEECH = (() => { try { const v = JSON.parse(store.get(SPEECH_KEY) || "null"); return v && typeof v === "object" && !Array.isArray(v) ? v : {}; } catch { return {}; } })();
const saveSpeech = () => store.set(SPEECH_KEY, JSON.stringify(SPEECH));
const speechSupported = () => typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance === "function";
// Read aloud: off at 6–11 unless turned on; at 12+ off unless turned on at 12+ (its own
// switch, read12, so that a child's setting doesn't carry)
const readAloudOn = () => speechSupported() && (simpleAge() ? !!SPEECH.read : !!SPEECH.read12);
// the film waits for the voice: at 6–11 only if chosen in the speech settings; never at 12+
const waitForVoice = () => simpleAge() && !!SPEECH.wait;
const speechRate = () => Number(SPEECH.rate) || 1;
const sayAs = (text) => Object.entries(SAY_AS).reduce((t, [w, said]) => t.replace(new RegExp(`\\b${w}\\b`, "g"), said), text);
// the text of some HTML, as it is to be said: no markup, no quotation marks, "s" as seconds
function sayText(html) {
  const d = document.createElement("div");
  d.innerHTML = String(html);
  d.querySelectorAll("button:not(.gl), .note, pre, .read-this").forEach((x) => x.remove());
  return d.textContent.replace(/[“”"]/g, "").replace(/(\d) s\b/g, "$1 seconds").replace(/\s+/g, " ").trim();
}
// The voice: the one the visitor chose, if this computer has it (and, offline, if it works
// offline). Else, Ken: "when possible use a female voice for text-to-speech". The Web Speech
// API says nothing of a voice's sex, so FEMALE_VOICES names the women's voices of Windows
// (Microsoft's, Natural/Online among them), Chrome (Google UK English Female; Google US
// English is a woman's), Apple and Android (whose names say "female"). Among them: the
// page's English first (en-US, or the browser's own English, such as en-GB), then a
// natural or online one, then any English one. Offline only voices that work offline count.
// With no woman's English voice here, as before: the browser's default English voice,
// else an en-US one, else any English one; with none, null (the browser's own choice).
// (Ani itself is still "it" in the page's words; this is only the voice.)
const FEMALE_VOICES = /\b(Aria|Jenny|Zira|Hazel|Susan|Libby|Sonia|Ava|Emma|Michelle|Ana|Clara|Natasha|Neerja|Maisie|Mia|Hollie|Catherine|Heera|Linda|Eva|Cora|Elizabeth|Jane|Nancy|Sara|Amber|Ashley|Monica|Samantha|Karen|Moira|Tessa|Victoria|Fiona|Serena|Allison|Kate|Veena|Zoe|Nicky|Kathy|Vicki|Agnes|Martha|Female)\b|^Google US English$/i;
const isFemaleVoice = (v) => FEMALE_VOICES.test(v.name || "") && !/\bmale\b/i.test(v.name || "");
function chooseVoice(voices, { chosen = null, online = true, lang = "en-US" } = {}) {
  const english = voices.filter((v) => /^en\b/i.test(v.lang));
  const mine = voices.find((v) => v.voiceURI === chosen);
  if (mine && (online || mine.localService)) return mine;
  const usable = english.filter((v) => online || v.localService);
  const want = String(lang).toLowerCase().replace(/_/g, "-");
  const score = (v) => (String(v.lang).toLowerCase().replace(/_/g, "-") === want ? 2 : 0) + (/\b(Natural|Online|Neural|Premium|Enhanced)\b/i.test(v.name || "") || !v.localService ? 1 : 0);
  const women = usable.filter(isFemaleVoice);
  if (women.length) return women.reduce((a, b) => (score(b) > score(a) ? b : a));
  if (!online) return usable.find((v) => /en-US/i.test(v.lang)) || usable[0] || null;
  return english.find((v) => v.default) || english.find((v) => /en-US/i.test(v.lang)) || english[0] || null;
}
// the page's English: the browser's own if it is a kind of English (en-GB, en-AU, ...), else en-US
const speechLang = () => (typeof navigator !== "undefined" && /^en-[a-z]{2}$/i.test(navigator.language || "") ? navigator.language : "en-US");
function speechVoice() {
  const voices = speechSupported() ? window.speechSynthesis.getVoices() : [];
  return chooseVoice(voices, { chosen: SPEECH.voice || null, online: navigator.onLine !== false, lang: speechLang() });
}
// Speaking: one sentence an utterance (Chrome's network voices cut off long ones); done()
// once the last has ended, or was cancelled.
let speechGen = 0, speaking = false;
function speak(text, done = null) {
  if (!speechSupported() || !text) { if (done) done(); return; }
  const gen = ++speechGen;
  window.speechSynthesis.cancel();
  const sentences = sayAs(text).match(/[^.!?]+[.!?]*\s*/g) || [text];
  speaking = true;
  let left = sentences.length;
  const voice = speechVoice();
  const finish = () => { if (gen !== speechGen) return; if (--left <= 0) { speaking = false; if (done) done(); } };
  for (const s of sentences) {
    const u = new window.SpeechSynthesisUtterance(s.trim());
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = "en-US";
    u.rate = speechRate();
    u.pitch = 1;
    u.onend = finish;
    u.onerror = finish;
    window.speechSynthesis.speak(u);
  }
}
function stopSpeaking() {
  speechGen++;
  speaking = false;
  if (speechSupported()) window.speechSynthesis.cancel();
  releaseHold();
}

// ---- reading the captions as the film plays

// The caption last said on each screen, and, when the film waits for the voice, the caption
// waiting while the last is still being said: the film holds still meanwhile (the play loop
// asks speechHolding), at most HOLD_MS.
const HOLD_MS = 15000;
let lastSaid = "", lastScene = null, heldCaption = null, holdTimer = 0, quietTimer = 0;
const speechHolding = () => heldCaption !== null;
function releaseHold() {
  clearTimeout(holdTimer);
  heldCaption = null;
}
// the screen read: the first, or in Side by side the one last tapped
let readScreen = 0;
// what a caption says, aloud: a new scene's title first ("Scene two: Kept Apart.")
function captionSay(c) {
  const scene = state.scene;
  const main = sayText(c.text) || sayText((c.more || [])[0] || "");
  const title = scene !== lastScene ? `Scene ${countWords(scene + 1)}: ${sayText(R && R.scenes && R.scenes[scene] ? R.scenes[scene].title : c.part)}. ` : "";
  return { main, say: title + main, scene };
}
// app/film.template.html's caption() calls this when a screen's caption changes
function captionHeard(r, c) {
  if (!readAloudOn() || (state.view === "both" ? r !== readScreen : r !== 0)) return;
  // nothing is read by itself while Ani is making a film
  if (RUNS.some((x) => x && x.status && x.status.running)) return;
  const x = captionSay(c);
  if (!x.main || x.main === lastSaid) return;
  if (!state.playing) {
    // stepping or scrubbing: said once the film has stood still a moment
    stopSpeaking();
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => { lastSaid = x.main; lastScene = x.scene; speak(x.say); }, 400);
    return;
  }
  if (speaking && waitForVoice()) {
    // the picture doesn't run ahead of the voice: hold until it has finished
    heldCaption = x;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(() => sayHeld(), HOLD_MS);
    return;
  }
  lastSaid = x.main;
  lastScene = x.scene;
  speak(x.say, () => sayHeld());
}
function sayHeld() {
  const x = heldCaption;
  releaseHold();
  if (!x || !readAloudOn()) return;
  lastSaid = x.main;
  lastScene = x.scene;
  speak(x.say, () => sayHeld());
}
// Pause stops the voice; Play, when the film waits for the voice, says the caption again (the
// template's play and pause)
function speechPaused() {
  clearTimeout(quietTimer);
  if (speaking || heldCaption) stopSpeaking();
}
function speechPlayed() {
  if (!readAloudOn()) return;
  if (waitForVoice()) {
    lastSaid = "";
    const el = document.getElementById(`caption-${readScreen}`);
    if (el && el.dataset.html) { const x = captionSay({ text: captionMain(el), part: "" }); lastSaid = x.main; lastScene = x.scene; speak(x.say, () => sayHeld()); }
  }
}
// the main sentences of a caption on the page, without its scene line and its other lines
const captionMain = (el) => el.dataset.html.replace(/<span class="part">[\s\S]*?<\/span>/g, "");
// a screen tapped in Side by side is the one read
document.addEventListener("click", (e) => { const fig = e.target.closest && e.target.closest(".screen-fig"); if (fig) readScreen = fig.id === "fig-1" ? 1 : 0; });

// ---- "Read this"

function readBox(el) {
  const box = el.closest(".age-box p, .who-decided, .still-box, .age-story, .lead, p, li, details") || el.parentElement;
  speak(sayText(box ? box.innerHTML : ""));
}
document.addEventListener("click", (e) => {
  const b = e.target.closest && e.target.closest("[data-read-box], [data-read-text]");
  if (!b) return;
  if (b.hasAttribute("data-read-text")) speak(sayAs(b.getAttribute("data-read-text")));
  else readBox(b);
});
// ---- Talk to Ani

// the browser's recognizer, where there is one (never in the claude.ai copy, whose frame
// has no microphone)
const recognizer = () => (ARTIFACT_BUILD ? null : window.SpeechRecognition || window.webkitSpeechRecognition || null);
const talkOn = () => !!SPEECH.talk && !!recognizer();
// whether this browser turns speech into words on this computer (Chrome's on-device
// recognition, where it offers it and has the language installed): asked once, with a
// time limit, and only after the grown-up's opt-in
let onDevice = null;
async function checkOnDevice() {
  const R0 = recognizer();
  if (!R0 || typeof R0.available !== "function") { onDevice = false; return false; }
  try {
    const got = await Promise.race([R0.available({ langs: ["en-US"], processLocally: true }), new Promise((r) => setTimeout(() => r("timeout"), 3000))]);
    onDevice = got === "available";
  } catch { onDevice = false; }
  return onDevice;
}
const TALK_ERRORS = {
  "not-allowed": "The microphone is blocked. A grown-up can allow it in the browser's settings.",
  "service-not-allowed": "The microphone is blocked. A grown-up can allow it in the browser's settings.",
  network: "Talking needs the internet in this browser.",
  "no-speech": "Ani didn't hear anything. Try again, a bit closer.",
  "audio-capture": "No microphone was found on this computer.",
};
let listening = null;
// Listen once, into a box: words in progress shown in gray beside it, the final words put in
// at the cursor; nothing is sent. done(words) for a command instead of a box.
function listen(button, { box = null, done = null } = {}) {
  if (listening) { const was = listening; listening = null; try { was.rec.stop(); } catch { /* stopped */ } if (was.button === button) return; }
  const Rec = recognizer();
  if (!Rec || !SPEECH.talk) return;
  const status = button.parentElement.querySelector(".mic-status") || button.insertAdjacentElement("afterend", Object.assign(document.createElement("span"), { className: "mic-status" }));
  const rec = new Rec();
  rec.lang = "en-US";
  rec.continuous = false;
  rec.interimResults = true;
  if (onDevice) try { rec.processLocally = true; } catch { /* not offered */ }
  let heard = "", started = false;
  const me = { rec, button };
  listening = me;
  const end = (msg = "") => {
    clearTimeout(guard);
    button.setAttribute("aria-pressed", "false");
    button.classList.remove("on");
    status.textContent = msg;
    status.classList.remove("interim");
    if (listening === me) listening = null;
  };
  // a microphone that never starts (a permission prompt left open) can't hang the button
  const guard = setTimeout(() => { if (!started) { try { rec.abort(); } catch { /* gone */ } end("The microphone didn't start. Try again."); } }, 10000);
  rec.onstart = () => { started = true; };
  rec.onaudiostart = () => { started = true; };
  rec.onresult = (e) => {
    started = true;
    let interim = "";
    for (let k = e.resultIndex; k < e.results.length; k++) {
      const res = e.results[k];
      if (res.isFinal) heard += res[0].transcript;
      else interim += res[0].transcript;
    }
    status.textContent = interim ? interim : "";
    status.classList.toggle("interim", !!interim);
  };
  rec.onerror = (e) => end(TALK_ERRORS[e.error] || `Ani couldn't hear that (${e.error}).`);
  rec.onend = () => {
    const words = heard.trim();
    if (listening === me || status.textContent === "Listening…" || status.classList.contains("interim")) end("");
    if (!words) return;
    if (box) {
      const at = typeof box.selectionStart === "number" ? box.selectionStart : box.value.length;
      const before = box.value.slice(0, at), after = box.value.slice(box.selectionEnd ?? at);
      const join = before && !/\s$/.test(before) ? " " : "";
      box.value = before + join + words + after;
      box.dispatchEvent(new Event("input", { bubbles: true }));
      box.focus();
    }
    if (done) done(words);
  };
  button.setAttribute("aria-pressed", "true");
  button.classList.add("on");
  status.textContent = "Listening…";
  try { rec.start(); } catch (err) { end(`Ani couldn't start listening (${err.message || err}).`); }
}
// The boxes that take words: a new story, "Tell Ani what's wrong", and Teach Ani's reasons
const MIC_BOXES = "#tell-story, #crq-words, input[data-tf=\"because\"]";
const micButton = (label) => `<button type="button" class="btn mic" aria-pressed="false" title="Talk instead of typing: press, speak, and press again (or stop speaking)"><span class="mic-dot" aria-hidden="true"></span>${label}</button>`;
function addMics(root = document) {
  if (!talkOn()) return;
  root.querySelectorAll(MIC_BOXES).forEach((box) => {
    if (box.dataset.mic) return;
    box.dataset.mic = "1";
    const wrap = document.createElement("span");
    wrap.className = "mic-row";
    wrap.innerHTML = micButton("Talk");
    box.insertAdjacentElement("afterend", wrap);
    wrap.querySelector("button").addEventListener("click", (e) => listen(e.currentTarget, { box }));
  });
}
new MutationObserver(() => addMics()).observe(document.getElementById("side"), { childList: true, subtree: true });
// Spoken commands at 6–11 (a microphone beside Play, once Talk to Ani is turned on): matched on the words by this list,
// never by a language model; anything else is said back with what to try.
const TALK_COMMANDS = [
  [/\b(play|start|go)\b/, () => { if (!state.playing) play(); }],
  [/\b(stop|pause|wait)\b/, () => pause()],
  [/\bwhy\b/, () => { const c = state.selected && state.selected.char; const d = document.querySelector("#side .who-decided"); if (c && d) d.open = true; else { const chip = document.querySelector("#legend [data-chip]"); if (chip) chip.click(); } }],
  [/\bnext( scene)?\b/, () => { if (state.scene < sceneCount() - 1) goScene(state.scene + 1, 0); }],
  [/\b(go )?back\b/, () => { goScene(Math.max(0, state.scene - 1), 0); }],
  [/\b(read|say) it again\b|\bagain\b/, () => { lastSaid = ""; speechPlayed(); }],
];
function heardCommand(words) {
  const said = words.toLowerCase();
  const hit = TALK_COMMANDS.find(([re]) => re.test(said));
  const note = document.getElementById("talk-heard");
  if (hit) { if (note) note.textContent = ""; hit[1](); return true; }
  if (note) note.textContent = `Ani heard: “${words}”. Try “play” or “why”.`;
  return false;
}

// ---- the controls and the settings

const DICTATION = "This browser can't turn speech into words. You can type, or use the computer's own dictation: on Windows press Windows+H; on a Mac press the Fn key twice; on an iPad, use the microphone on the keyboard.";
function speechSettings() {
  const el = document.getElementById("speech-settings");
  if (!el) return;
  const body = el.querySelector(".body");
  if (!speechSupported() && !recognizer()) { body.innerHTML = `<p class="note">This browser can't read aloud. ${esc(DICTATION)}</p>`; return; }
  const voices = speechSupported() ? window.speechSynthesis.getVoices().filter((v) => /^en\b/i.test(v.lang)).sort((a, b) => (/en-US/i.test(b.lang) - /en-US/i.test(a.lang))) : [];
  const current = speechVoice();
  const Rec = recognizer();
  const local = onDevice === true;
  body.innerHTML = `${speechSupported() && !simpleAge() ? `<p><label class="check talk-optin"><input type="checkbox" id="speech-read"${readAloudOn() ? " checked" : ""}> <span><b>Read aloud</b>: Ani reads each caption with this computer's own voice.</span></label></p>` : ""}${speechSupported() ? `
    <p><label>Voice <select id="speech-voice">${voices.map((v) => `<option value="${esc(v.voiceURI)}"${current && v.voiceURI === current.voiceURI ? " selected" : ""}>${esc(v.name)}${v.localService ? " (works offline)" : ""}</option>`).join("") || "<option value=\"\">The browser's voice</option>"}</select></label> <button type="button" class="btn" id="speech-try">Try</button></p>
    <p><label>How fast <input type="range" id="speech-rate" min="0.6" max="1.4" step="0.05" value="${speechRate()}"></label></p>
    ${simpleAge() ? `<p class="seg" role="group" aria-label="While Ani reads aloud"><button type="button" data-speech-wait="1" aria-pressed="${waitForVoice()}">Wait for the voice</button><button type="button" data-speech-wait="0" aria-pressed="${!waitForVoice()}">Keep going</button></p>` : ""}
    <p class="note">If you use a screen reader, you may prefer Read aloud off.</p>` : ""}
    ${Rec ? `<p><label class="check talk-optin"><input type="checkbox" id="speech-talk"${SPEECH.talk ? " checked" : ""}> <span><b>Talk to Ani with your voice.</b> ${local ? "This browser turns it into words on this computer; nothing is sent." : "When you press the microphone, your browser sends what you say to the company that makes it (Google for Chrome, Microsoft for Edge, Apple for Safari) to turn it into words. The page keeps only the words, in the box, and no recording. Nothing is sent until the microphone is pressed."}</span></label></p>
    <p class="note">${simpleAge() ? "For a grown-up to decide" : "Off until you turn it on"}, on this computer. A link can't turn it on.${SPEECH.talk && SPEECH.talkSince ? ` Turned on ${esc(String(SPEECH.talkSince).slice(0, 10))}.` : ""}</p>` : `<p class="note">${esc(DICTATION)}</p>`}`;
  const read = body.querySelector("#speech-read");
  if (read) read.addEventListener("change", () => { toggleReadAloud(); const again = document.getElementById("speech-read"); if (again) again.focus(); });
  const sel = body.querySelector("#speech-voice");
  if (sel) sel.addEventListener("change", () => { SPEECH.voice = sel.value; saveSpeech(); });
  const tryIt = body.querySelector("#speech-try");
  if (tryIt) tryIt.addEventListener("click", () => speak("Hello. I am Ani. Press Play, and I will read the film to you."));
  const rate = body.querySelector("#speech-rate");
  if (rate) rate.addEventListener("change", () => { SPEECH.rate = Number(rate.value); saveSpeech(); });
  body.querySelectorAll("[data-speech-wait]").forEach((b) => b.addEventListener("click", () => { SPEECH.wait = b.dataset.speechWait === "1"; saveSpeech(); speechSettings(); }));
  const talk = body.querySelector("#speech-talk");
  if (talk) talk.addEventListener("change", async () => {
    SPEECH.talk = talk.checked;
    SPEECH.talkSince = talk.checked ? new Date().toISOString() : null;
    saveSpeech();
    if (talk.checked) await checkOnDevice();
    applySpeech();
  });
}
// The Read aloud switch and the command microphone beside Play, the speech settings in their
// place (beside the controls at 6–11, the header's row at 12+), the
// captions' live region (off while Ani reads aloud, so a screen reader doesn't say each
// caption twice), and the microphones by the boxes.
function applySpeech() {
  const btn = document.getElementById("read-aloud");
  if (btn) { btn.hidden = !speechSupported() || (!simpleAge() && !readAloudOn()); btn.setAttribute("aria-pressed", String(!!readAloudOn())); }
  const cmd = document.getElementById("talk-cmd");
  if (cmd) cmd.hidden = !(talkOn() && simpleAge());
  const el = document.getElementById("speech-settings");
  const home = document.getElementById(simpleAge() ? "speech-home" : "speech-head");
  if (el && home && el.parentElement !== home) home.append(el);
  const summary = el && el.querySelector("summary");
  if (summary) summary.textContent = simpleAge() ? "Speech settings" : "Speech";
  for (const c of document.querySelectorAll(".caption")) c.setAttribute("aria-live", readAloudOn() ? "off" : "polite");
  if (!readAloudOn()) stopSpeaking();
  speechSettings();
  if (!talkOn()) document.querySelectorAll(".mic-row").forEach((x) => { const box = x.previousElementSibling; if (box) delete box.dataset.mic; x.remove(); });
  addMics();
}
function toggleReadAloud() {
  SPEECH[simpleAge() ? "read" : "read12"] = !readAloudOn();
  saveSpeech();
  applySpeech();
  if (readAloudOn()) { lastSaid = ""; lastScene = null; const el = document.getElementById(`caption-${readScreen}`); if (el && el.dataset.html) captionHeard(readScreen, { text: captionMain(el), part: "" }); }
}
document.getElementById("read-aloud").addEventListener("click", () => toggleReadAloud());
// at 12+ "Speech" opens over the page: a click elsewhere or Escape closes it
document.addEventListener("click", (e) => { const d = document.getElementById("speech-settings"); if (d && d.open && !simpleAge() && !d.contains(e.target)) d.open = false; });
document.addEventListener("keydown", (e) => { const d = document.getElementById("speech-settings"); if (e.key === "Escape" && d && d.open && !simpleAge()) { d.open = false; d.querySelector("summary").focus(); } });
document.getElementById("talk-cmd").addEventListener("click", (e) => listen(e.currentTarget, { done: heardCommand }));
if (speechSupported() && typeof window.speechSynthesis.addEventListener === "function") window.speechSynthesis.addEventListener("voiceschanged", () => speechSettings());
const onSpeechAge = () => { lastSaid = ""; lastScene = null; applySpeech(); };
if (SPEECH.talk) checkOnDevice().then(() => speechSettings());
applySpeech();
// (app/film/ages.js's setAge calls this when the age changes)
function onAgeChanged() { onSpeechAge(); }

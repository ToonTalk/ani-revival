// ---------------------------------------------------------------- telling Ken what went wrong

// On the site (toontalk.github.io/ani, whose page tools/build-site.mjs gives Ken's Sentry
// DSN), nothing is sent without the visitor's say-so (Ken, 20 October: "are there schools
// and other users that don't want anything reported without permission?"). An error the
// page doesn't catch, or a promise it leaves rejected, is kept here, and a small notice
// asks: "Ani ran into an error. Send a report to Ken, without any story, key or personal
// data?" [Send] [Don't send] [Don't ask again], with what would be sent a click away. Only
// on Send is Sentry's own browser bundle loaded (until then nothing of Sentry's is asked
// for) and the report sent: the error's message and where in the page's code it happened,
// the page's address and the browser, and nothing else: no IP address or other personal
// data (sendDefaultPii false), no breadcrumbs (so no requests or their bodies), no
// sessions, and, taken out of whatever is sent, everything this browser keeps for the page
// (the API keys among it) and any story text. "Don't ask again" is kept in this browser
// (REPORT_KEY, in "What this page keeps"), and nothing is ever asked or sent after it. A
// visitor may also send Ken a story with "Send this story to Ken", which shows exactly what
// will be sent and sends it, as one Sentry message, only when they confirm. With no DSN
// (app/film.html, and the claude.ai copies, whose CSP refuses Sentry) nothing is kept,
// asked, loaded or sent: every part of this is a no-op.
const SENTRY_DSN = /*SENTRY-DSN*/"";
// Sentry's own browser bundle (errors only), at a version months old, checked against its hash
const SENTRY_SDK = { src: "https://browser.sentry-cdn.com/10.50.0/bundle.min.js", integrity: "sha384-9cVKNfUSoIRWDL3QQHe0fgJboGyb51IyiAv8x+KeuylA5GArkSaqyGFFm14hqajd" };
const report = { on: !!SENTRY_DSN, sdk: null, consent: new Set(), held: [], open: false };
// Sentry's bundle, loaded and started the first time the visitor sends something
function sentry() {
  if (report.sdk) return report.sdk;
  report.sdk = new Promise((resolve) => {
    const s = document.createElement("script");
    Object.assign(s, { src: SENTRY_SDK.src, integrity: SENTRY_SDK.integrity, crossOrigin: "anonymous" });
    s.onload = () => {
      const S = window.Sentry;
      try {
        S.init({
          dsn: SENTRY_DSN, sendDefaultPii: false, defaultIntegrations: false, sendClientReports: false, maxBreadcrumbs: 0,
          // no handlers of its own: only what the visitor sends goes
          integrations: [S.linkedErrorsIntegration()],
          beforeBreadcrumb: () => null,
          beforeSend: scrubbed,
        });
        resolve(S);
      } catch { resolve(null); }
    };
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return report.sdk;
}
const neverAsk = () => store.get(REPORT_KEY) === "never";
if (report.on) {
  document.querySelectorAll(".reporting").forEach((p) => { p.hidden = false; });
  const keep = (err) => {
    if (neverAsk() || !err) return;
    const e = err instanceof Error ? err : new Error(typeof err === "string" ? err : (() => { try { return JSON.stringify(err); } catch { return String(err); } })());
    // the same error twice is one report
    if (report.held.some((x) => x.message === e.message && x.stack === e.stack)) return;
    report.held.push(e);
    askToReport();
  };
  window.addEventListener("error", (ev) => keep(ev.error || ev.message));
  window.addEventListener("unhandledrejection", (ev) => keep(ev.reason));
}
// What a report of an error has in it, as it will be sent (and shown before it is).
function errorReport(e) {
  const hide = secrets();
  return scrubOut({ error: `${e.name || "Error"}: ${e.message}`, where: String(e.stack || "").split("\n").slice(1, 8).map((l) => l.trim()).filter(Boolean), page: location.origin + location.pathname, browser: navigator.userAgent }, hide);
}
// The notice: small, in a corner of the screen, gone once answered.
function askToReport() {
  if (!report.held.length || neverAsk()) return;
  let box = document.getElementById("report-ask");
  if (!box) {
    box = document.createElement("div");
    box.id = "report-ask";
    box.className = "report-ask";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", "Report an error to Ken");
    document.body.appendChild(box);
  }
  const n = report.held.length;
  box.innerHTML = `<p>${n > 1 ? `Ani ran into ${n} errors.` : "Ani ran into an error."} Send a report to Ken, without any story, key or personal data?</p>
    <details><summary>What would be sent</summary><pre class="lisp">${esc(JSON.stringify(report.held.map(errorReport), null, 2))}</pre><p class="note">Sent to Ken's error reports (Sentry) only if you press Send; nothing about you, and nothing this page keeps in your browser.</p></details>
    <div class="actions"><button type="button" class="btn primary" data-report="send">Send</button><button type="button" class="btn" data-report="no">Don't send</button><button type="button" class="linkish" data-report="never">Don't ask again</button></div>`;
  box.hidden = false;
  report.open = true;
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest && e.target.closest("[data-report]");
  if (!b || !report.on) return;
  const box = document.getElementById("report-ask");
  const held = report.held.splice(0);
  report.open = false;
  if (b.dataset.report === "never") store.set(REPORT_KEY, "never");
  if (b.dataset.report !== "send") { if (box) box.hidden = true; return; }
  if (box) box.innerHTML = `<p>Sending…</p>`;
  const S = await sentry();
  let sent = false;
  if (S) {
    for (const err of held) {
      const consent = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      report.consent.add(consent);
      S.withScope((scope) => { scope.setTag("kind", "error-sent-by-visitor"); scope.setExtras({ consent }); S.captureException(err); });
    }
    sent = await S.flush(5000).catch(() => false);
  }
  // (unless another error came while it was sent, and is being asked about)
  if (box && !report.open) {
    box.innerHTML = `<p>${sent ? "Sent. Thank you: Ken will see it with Ani's other reports." : "It couldn't be sent from here just now."}</p>`;
    setTimeout(() => { if (!report.open) box.hidden = true; }, 4000);
  }
});
// What must never leave in a report: the API keys, typed or kept; each value this
// browser keeps for the page (and each string inside one kept as JSON); and every story
// here, whole and line by line; longest first. A story a visitor chose to send keeps
// everything but the keys.
function secrets({ stories = true } = {}) {
  const out = new Set();
  const add = (v, least = 16) => { if (typeof v === "string" && v.trim().length >= least) out.add(v.trim()); };
  const leaves = (x) => { if (typeof x === "string") add(x); else if (x && typeof x === "object") Object.values(x).forEach(leaves); };
  leaves(teller.keys);
  try { leaves(JSON.parse(store.get(KEYS_KEY) || "null")); } catch { /* none kept */ }
  if (stories) {
    try {
      for (let k = 0; k < localStorage.length; k++) {
        const v = localStorage.getItem(localStorage.key(k));
        add(v);
        try { leaves(JSON.parse(v)); } catch { /* not JSON */ }
      }
    } catch { /* no storage */ }
    // (and every film kept in "Your films", as far as the page has read it: its story as
    // told, what Ani was told, and the description of each one on a screen; and what was
    // typed into "Tell Ani what's wrong")
    const texts = [teller.story, editor.text, teller.draft && teller.draft.text, teller.draft && teller.draft.reply, critique.words, ...[...RUNS.slice(1), ...LIB_RUNS.values()].flatMap((r) => (r ? [r.cindy, r.told && r.told.story] : [])),
      ...library.films.flatMap((f) => [f.title, f.told && f.told.story, ...(f.about || [])])];
    for (const t of texts.filter(Boolean)) { add(t, 1); for (const piece of String(t).split(/\n|(?<=[.!?;])\s+/)) add(piece, 12); }
  }
  return [...out].sort((a, b) => b.length - a.length);
}
function scrubOut(x, hide) {
  if (typeof x === "string") return hide.reduce((s, h) => s.split(h).join("[removed]"), x);
  if (Array.isArray(x)) return x.map((y) => scrubOut(y, hide));
  if (x && typeof x === "object") { for (const k of Object.keys(x)) x[k] = scrubOut(x[k], hide); return x; }
  return x;
}
// Sentry's beforeSend: only what the visitor sent (its consent noted when they pressed
// Send), with no user, no referrer, the page's address without its query or fragment, and
// no secret or story text anywhere in it; a story a visitor confirmed sending keeps its
// story, but never a key. Anything else is dropped.
function scrubbed(event) {
  const kind = event.tags && event.tags.kind;
  const consented = (kind === "story-sent-to-ken" || kind === "error-sent-by-visitor") && event.extra && report.consent.delete(event.extra.consent);
  if (!consented) return null;
  delete event.user;
  delete event.breadcrumbs;
  delete event.extra.consent;
  event.request = { url: location.origin + location.pathname, headers: { "User-Agent": navigator.userAgent } };
  return scrubOut(event, secrets({ stories: kind !== "story-sent-to-ken" }));
}

// ---- "Send this story to Ken"

// Exactly what is sent: the story as told (if it was), the description Ani read, the
// model and provider that wrote it, the extensions, and where Ani stopped.
function storyReport(run) {
  const told = run.told || {};
  return {
    title: storyTitle(run),
    story: told.story || "(not told in English: written or changed in the editor)",
    lisp: run.cindy,
    model: told.model || "(none)", provider: told.provider || "(none)",
    extensions: runExtensions(run).length ? runExtensions(run) : "(none: Ani as in 1978)",
    stopped: stopsOf(run).map((s) => `${words(s.where)}: ${unmark(s.text)}`),
  };
}
// The button, where reporting is on and there is a story of the reader's own.
const sendStoryButton = (run) => (report.on && run && run !== RUNS[0] ? `<div class="send-story"><button type="button" class="linkish" data-send-story>Send this story to Ken</button><div class="send-box" hidden></div></div>` : "");
document.addEventListener("click", async (e) => {
  const b = e.target.closest && e.target.closest("[data-send-story], [data-send-yes], [data-send-no]");
  if (!b || !report.on || !RUNS[1]) return;
  const box = b.closest(".send-story").querySelector(".send-box");
  if (b.dataset.sendNo !== undefined) { box.hidden = true; return; }
  if (b.dataset.sendStory !== undefined) {
    box.dataset.report = JSON.stringify(storyReport(RUNS[1]), null, 2);
    box.innerHTML = `<p class="note">This is everything that will be sent to Ken, as a message to his error reports (Sentry), and nothing about you:</p><pre class="lisp">${esc(box.dataset.report)}</pre>
      <div class="actions"><button type="button" class="btn primary" data-send-yes>Send it</button><button type="button" class="linkish" data-send-no>Don't send</button></div>`;
    box.hidden = false;
    return;
  }
  const S = await sentry();
  const payload = JSON.parse(box.dataset.report);
  let sent = false;
  if (S) {
    const consent = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    report.consent.add(consent);
    S.withScope((scope) => {
      scope.setTag("kind", "story-sent-to-ken");
      scope.setExtras({ ...payload, consent });
      scope.addAttachment({ filename: "story.json", data: JSON.stringify(payload, null, 2), contentType: "application/json" });
      S.captureMessage(`A story sent to Ken: ${payload.title}`, "info");
    });
    sent = await S.flush(5000).catch(() => false);
  }
  box.innerHTML = `<p class="note">${sent ? "Sent. Thank you: Ken will see it with Ani's other reports." : "It couldn't be sent from here just now."}</p>`;
});

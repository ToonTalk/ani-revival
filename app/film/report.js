// ---------------------------------------------------------------- telling Ken what went wrong

// On the site (toontalk.github.io/ani, whose page tools/build-site.mjs gives Ken's Sentry
// DSN), an error the page doesn't catch, or a promise it leaves rejected, is reported to
// Ken's Sentry, and nothing else: no IP address or other personal data (sendDefaultPii
// false), no breadcrumbs (so no requests or their bodies), no sessions, and, taken out of
// whatever is sent, everything this browser keeps for the page (the API keys among it) and
// any story text. A visitor may also send Ken a story with "Send this story to Ken", which
// shows exactly what will be sent and sends it, as one Sentry message, only when they
// confirm. With no DSN (app/film.html, and the claude.ai copies, whose CSP refuses Sentry)
// nothing is loaded and nothing is sent: every part of this is a no-op.
const SENTRY_DSN = /*SENTRY-DSN*/"";
// Sentry's own browser bundle (errors only), at a version months old, checked against its hash
const SENTRY_SDK = { src: "https://browser.sentry-cdn.com/10.50.0/bundle.min.js", integrity: "sha384-9cVKNfUSoIRWDL3QQHe0fgJboGyb51IyiAv8x+KeuylA5GArkSaqyGFFm14hqajd" };
const report = { on: !!SENTRY_DSN, sdk: null, consent: new Set() };
if (report.on) {
  report.sdk = new Promise((resolve) => {
    const s = document.createElement("script");
    Object.assign(s, { src: SENTRY_SDK.src, integrity: SENTRY_SDK.integrity, crossOrigin: "anonymous" });
    s.onload = () => {
      const S = window.Sentry;
      try {
        S.init({
          dsn: SENTRY_DSN, sendDefaultPii: false, defaultIntegrations: false, sendClientReports: false, maxBreadcrumbs: 0,
          integrations: [S.globalHandlersIntegration({ onerror: true, onunhandledrejection: true }), S.linkedErrorsIntegration(), S.dedupeIntegration(), S.httpContextIntegration()],
          beforeBreadcrumb: () => null,
          beforeSend: scrubbed,
        });
        resolve(S);
      } catch { resolve(null); }
    };
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  document.querySelectorAll(".reporting").forEach((p) => { p.hidden = false; });
}
// What must never leave in an error report: the API keys, typed or kept; each value this
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
    const texts = [teller.story, editor.text, teller.draft && teller.draft.text, teller.draft && teller.draft.reply, ...RUNS.slice(1).flatMap((r) => (r ? [r.cindy, r.told && r.told.story] : []))];
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
// Sentry's beforeSend: an error report, with no user, no referrer, and no secret or story
// text anywhere in it; a story a visitor confirmed sending (its consent noted when they
// pressed Send) keeps its story, but never a key.
function scrubbed(event) {
  delete event.user;
  delete event.breadcrumbs;
  if (event.request && event.request.headers) delete event.request.headers.Referer;
  const consented = event.tags && event.tags.kind === "story-sent-to-ken" && event.extra && report.consent.delete(event.extra.consent);
  if (event.extra) delete event.extra.consent;
  return scrubOut(event, secrets({ stories: !consented }));
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
  const S = await report.sdk;
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

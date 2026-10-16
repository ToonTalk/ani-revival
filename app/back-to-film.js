// "Back to the film" (the code page's and the choice points' page's): the film page as the
// visitor left it (Ken, 16 October: coming back from the code "was showing the state of the
// app after a refresh"). Come from the film page in this tab, it goes back through the tab's
// history to it, past this page's own steps from one place to another, and the film page
// comes back as it was (kept whole by the browser, or put back from what it kept in this
// tab's sessionStorage, app/film/view.js); come some other way, the link opens the film page
// at film.html#view, which puts back where this tab last left it. Put in by
// tools/build-source-app.mjs and tools/build-glassbox.mjs at /*BACK-TO-FILM*/.
(() => {
  const VIEW_KEY = "ani-cinderella:view:v1:";
  // the film page: app/film.html (or a check's copy of it), or the site's folder or index.html
  const FILM = /(^|\/)(film[^/]*\.html|index\.html)?$/;
  const isFilm = (url) => {
    try { const u = new URL(url, location.href); return u.origin === location.origin && u.pathname !== location.pathname && FILM.test(u.pathname); } catch { return false; }
  };
  const st = () => { try { return history.state && typeof history.state === "object" ? history.state : {}; } catch { return {}; } };
  const put = (o) => { try { history.replaceState(Object.assign({}, st(), o), ""); } catch { /* not allowed here */ } };
  // where this page is in the tab's history since it was opened (depth: its own steps), and
  // whether it was opened from the film page: by its referrer, or, with none (a file://
  // page), the film page left in this tab a moment before
  let depth = 0, fromFilm = false;
  if (typeof st().aniDepth === "number") { depth = st().aniDepth; fromFilm = !!st().aniFromFilm; }
  else {
    let leaving = null;
    try { leaving = JSON.parse(sessionStorage.getItem(`${VIEW_KEY}leaving`) || "null"); } catch { /* none */ }
    fromFilm = isFilm(document.referrer) || (!document.referrer && !!leaving && Date.now() - leaving.at < 30000);
    put({ aniDepth: 0, aniFromFilm: fromFilm });
  }
  addEventListener("hashchange", () => {
    if (typeof st().aniDepth === "number") { depth = st().aniDepth; fromFilm = !!st().aniFromFilm; }
    else { depth += 1; put({ aniDepth: depth, aniFromFilm: fromFilm }); }
  });
  // With the Navigation API, the entry this page was opened from, if it is the film page
  // (null if it isn't; undefined where the API can't tell)
  function filmEntry() {
    const nav = window.navigation;
    if (!nav || typeof nav.entries !== "function" || !nav.currentEntry) return undefined;
    const list = nav.entries(), i = nav.currentEntry.index;
    // (a file:// page may see none of the entries before it)
    if (list.length <= 1) return history.length > 1 && location.protocol === "file:" ? undefined : null;
    for (let k = i - 1; k >= 0; k--) {
      let path;
      try { path = new URL(list[k].url).pathname; } catch { return null; }
      if (path === location.pathname) continue; // this page's own steps
      return isFilm(list[k].url) ? list[k] : null;
    }
    return null;
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("a.back-to-film");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const entry = filmEntry();
    if (entry) { e.preventDefault(); window.navigation.traverseTo(entry.key); return; }
    if (entry === undefined && fromFilm && history.length > depth + 1) { e.preventDefault(); history.go(-(depth + 1)); }
    // otherwise the link itself: the film page, put back as this tab last left it
  });
})();

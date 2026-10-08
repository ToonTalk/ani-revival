// Files the 1979 programs load that we replace with built-in behavior, and the
// lost KEN1; files that have no reconstruction yet.

import { installTvTurtle } from "../tv/tvrtle.js";

export function installStubs(fs) {
  const feature = (name) => (L) => L.features.add(name);

  // System and library files: their functions are built in, or not needed here.
  fs.addStub("KEN", "GCDEMN", { note: "garbage collector daemon; not needed", onLoad: feature("GCDEMN") });
  fs.addStub("LIBLSP", "#PRINT", { note: "Dick's printer; #PRINT and #PRIN1 are built in", onLoad: feature("DICKS-PRINTER") });
  fs.addStub("LIBLSP", "STACK", { note: "stack examiner; not needed" });
  fs.addStub("LIBLSP", "TIMER", { note: "function timer; not needed" });
  fs.addStub("LIBLSP", "APROPO", { note: "apropos; not needed" });
  fs.addStub("LIBLSP", "LISPT", { note: "editor interface; not needed" });

  // KEN1;REAMAC: Director's read macros are built into the reader.
  fs.addStub("KEN1", "REAMAC", { note: "Director read macros are built into the reader", onLoad: feature("HENRYS-READ-MACROS") });

  // LLOGO's TV turtle, black and white (TVRTLE) and color (COLORT), under any
  // second name (KEN1;DRECT loads |ai:llogo;tvrtle newio|): built in, src/tv/.
  fs.addStub("LLOGO", "TVRTLE", { note: "LLOGO's TV turtle; built in (src/tv)", onLoad: (L) => installTvTurtle(L, { color: false }) });
  fs.addStub("LLOGO", "COLORT", { note: "LLOGO's color TV turtle; built in (src/tv)", onLoad: (L) => installTvTurtle(L, { color: true }) });
}

// The lost KEN1; files, as the 1979 tags table lists them. Until a file is
// reconstructed, loading it records a warning instead of failing.
export const LOST_KEN1_FILES = [
  "COMP", "TRACE", "EXPMAC", "HMAC", "MACROS", "INCOMP", "PROP", "UTIL", "CMATCH",
  "MEMORY", "TUTIL", "COLIDE", "CMOVIE", "DL", "FWUSE", "FWMAKE", "INSTAN", "INTER", "RDTAGS",
  "RBASIC",
];

export function installLostFilePlaceholders(fs) {
  for (const f of LOST_KEN1_FILES) {
    if (fs.find({ dir: "KEN1", fn1: f, fn2: ">" })) continue; // reconstructed
    fs.addStub("KEN1", f, {
      note: "lost; not yet reconstructed",
      onLoad: (L) => L.warn(`KEN1;${f} is lost and not yet reconstructed`),
    });
  }
}

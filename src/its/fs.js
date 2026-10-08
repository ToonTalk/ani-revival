// A small ITS file system for the interpreter.
//
// ITS names a file DEV:DIR;FN1 FN2, each part at most six characters. FN2 is
// often a version number; ">" means the highest, "<" the lowest. MacLisp also
// accepts namelists: ((DEV DIR) FN1 FN2), ((DIR) FN1 FN2), (FN1 FN2), and the
// old (FN1 FN2 DEV DIR).
//
// Files come from mounted tape folders, from reconstructions, and from files
// the running programs write. Loading a FASL (PDP-10 machine code) is
// redirected to the file's source, or to a stub that installs built-in
// equivalents (the TV turtle, Dick's printer, ...).

import { Sym, Cons, LispError } from "../maclisp/types.js";
import { decodeItsText } from "./text.js";

const trunc = (s) => String(s).toUpperCase().slice(0, 6);

export class ItsFileSystem {
  constructor() {
    this.dirs = new Map(); // DIR -> Map(FN1 -> Map(FN2 -> entry))
    this.stubs = new Map(); // "DIR;FN1" -> { onLoad, note }
    this.defaultDir = "KEN";
    this.log = [];
  }

  // ---- contents

  // entry: { text } or { bytes } or { getBytes() }, plus origin
  addFile(dir, fn1, fn2, entry) {
    dir = trunc(dir);
    fn1 = trunc(fn1);
    fn2 = trunc(fn2);
    if (!this.dirs.has(dir)) this.dirs.set(dir, new Map());
    const d = this.dirs.get(dir);
    if (!d.has(fn1)) d.set(fn1, new Map());
    const e = { dir, fn1, fn2, ...entry };
    d.get(fn1).set(fn2, e);
    return e;
  }

  addStub(dir, fn1, stub) {
    this.stubs.set(`${trunc(dir)};${trunc(fn1)}`, stub);
  }

  // Source to load in place of DIR;FN1 FASL, for compiled files whose source is
  // lost but whose content we recovered (the tags FASLs). entry: { text } or { getBytes }.
  addFaslSource(dir, fn1, entry) {
    if (!this.faslSources) this.faslSources = new Map();
    this.faslSources.set(`${trunc(dir)};${trunc(fn1)}`, { dir: trunc(dir), fn1: trunc(fn1), fn2: "FASL", ...entry });
  }

  // ---- names

  // Parse a Lisp file spec into { dev, dir, fn1, fn2 } (fn2 may be null).
  parse(spec) {
    if (spec instanceof Sym) return this.parseString(spec.name);
    if (spec instanceof Cons) {
      const items = [];
      for (let p = spec; p instanceof Cons; p = p.cdr) items.push(p.car);
      const name = (x) => (x instanceof Sym ? x.name : typeof x === "number" ? String(x) : null);
      if (items[0] instanceof Cons) {
        const devdir = [];
        for (let p = items[0]; p instanceof Cons; p = p.cdr) devdir.push(name(p.car));
        const [dev, dir] = devdir.length >= 2 ? devdir : [null, devdir[0]];
        return { dev, dir: dir && trunc(dir), fn1: items[1] !== undefined ? trunc(name(items[1])) : null, fn2: items[2] !== undefined ? trunc(name(items[2])) : null };
      }
      if (items.length === 4) return { dev: name(items[2]), dir: trunc(name(items[3])), fn1: trunc(name(items[0])), fn2: trunc(name(items[1])) };
      return { dev: null, dir: null, fn1: items[0] !== undefined ? trunc(name(items[0])) : null, fn2: items[1] !== undefined ? trunc(name(items[1])) : null };
    }
    throw new LispError(`bad file name: ${String(spec)}`, spec);
  }

  parseString(s) {
    let rest = s.trim();
    let dev = null;
    let dir = null;
    const colon = rest.indexOf(":");
    if (colon > 0 && !/[;\s]/.test(rest.slice(0, colon))) {
      dev = rest.slice(0, colon).toUpperCase();
      rest = rest.slice(colon + 1).trim();
    }
    const semi = rest.indexOf(";");
    if (semi >= 0) {
      dir = trunc(rest.slice(0, semi).trim());
      rest = rest.slice(semi + 1).trim();
    }
    const parts = rest.split(/\s+/).filter(Boolean);
    return { dev, dir, fn1: parts[0] ? trunc(parts[0]) : null, fn2: parts[1] ? trunc(parts[1]) : null };
  }

  // Fill in missing parts from defaults. "*" means unspecified, in either.
  merge(name, defaults = {}) {
    const pick = (...xs) => xs.find((x) => x && x !== "*") || null;
    return {
      dev: pick(name.dev, defaults.dev) || "DSK",
      dir: pick(name.dir, defaults.dir) || this.defaultDir,
      fn1: pick(name.fn1, defaults.fn1),
      fn2: pick(name.fn2, defaults.fn2) || ">",
    };
  }

  // The entry a (merged) name refers to, or null.
  find(name) {
    const d = this.dirs.get(name.dir);
    if (!d) return null;
    const versions = d.get(name.fn1);
    if (!versions) return null;
    if (name.fn2 === ">" || name.fn2 === "<") {
      const numeric = [...versions.keys()].filter((k) => /^\d+$/.test(k)).map(Number);
      if (!numeric.length) return null;
      const v = name.fn2 === ">" ? Math.max(...numeric) : Math.min(...numeric);
      return versions.get(String(v));
    }
    return versions.get(name.fn2) || null;
  }

  // Tape files are in ITS evacuate format; our own files (reconstructions,
  // recovered sources) are plain text and supply getText.
  textOf(entry) {
    if (entry.text === undefined) {
      if (entry.getText) entry.text = entry.getText();
      else entry.text = decodeItsText(entry.bytes || entry.getBytes()).text;
    }
    return entry.text;
  }

  // What LOAD should read for a spec: { text, truename } or { stub } or null.
  resolveForLoad(spec, L) {
    const raw = this.parse(spec);
    const name = this.merge(raw, { dir: this.defaultDir });
    const stub = this.stubs.get(`${name.dir};${name.fn1}`);
    if (stub) {
      this.log.push(`load ${name.dir};${name.fn1} ${name.fn2}: built in (${stub.note || "stub"})`);
      return { stub, truename: name };
    }
    let entry = null;
    const faslSource = this.faslSources && this.faslSources.get(`${name.dir};${name.fn1}`);
    if (faslSource && (name.fn2 === "FASL" || raw.fn2 === null)) {
      this.log.push(`load ${name.dir};${name.fn1} FASL: recovered source`);
      return { text: this.textOf(faslSource), truename: { dev: "DSK", dir: name.dir, fn1: name.fn1, fn2: "FASL" }, entry: faslSource };
    }
    if (name.fn2 === "FASL" || name.fn2 === "NFASL" || name.fn2 === "QFASL" || raw.fn2 === null) {
      // We can't run PDP-10 machine code; load the source instead.
      entry = this.find({ ...name, fn2: ">" });
      if (entry && raw.fn2 !== null) this.log.push(`load ${name.dir};${name.fn1} ${name.fn2}: using source ${entry.fn2} instead`);
    } else {
      entry = this.find(name);
    }
    if (!entry) return null;
    return { text: this.textOf(entry), truename: { dev: "DSK", dir: entry.dir, fn1: entry.fn1, fn2: entry.fn2 }, entry };
  }

  probe(spec) {
    const name = this.merge(this.parse(spec), { dir: this.defaultDir });
    if (name.fn2 === "FASL" && this.faslSources && this.faslSources.has(`${name.dir};${name.fn1}`)) {
      return { dev: "DSK", dir: name.dir, fn1: name.fn1, fn2: "FASL" };
    }
    if (name.fn2 === "FASL" && !this.stubs.has(`${name.dir};${name.fn1}`)) return null; // no runnable FASLs here
    const entry = this.find(name);
    if (!entry && this.stubs.has(`${name.dir};${name.fn1}`)) {
      // a file replaced by built-ins exists under whatever second name is asked for
      return { dev: "DSK", dir: name.dir, fn1: name.fn1, fn2: name.fn2 };
    }
    return entry ? { dev: "DSK", dir: entry.dir, fn1: entry.fn1, fn2: entry.fn2 } : null;
  }

  write(name, text, origin = "written") {
    let fn2 = name.fn2;
    if (fn2 === ">" || fn2 === null) {
      const d = this.dirs.get(name.dir);
      const versions = d && d.get(name.fn1);
      const numeric = versions ? [...versions.keys()].filter((k) => /^\d+$/.test(k)).map(Number) : [];
      fn2 = String(numeric.length ? Math.max(...numeric) + 1 : 1);
    }
    this.log.push(`write ${name.dir};${name.fn1} ${fn2}`);
    return this.addFile(name.dir, name.fn1, fn2, { text, origin });
  }

  delete(name) {
    const entry = this.find(name);
    if (!entry) return false;
    this.dirs.get(entry.dir).get(entry.fn1).delete(entry.fn2);
    return true;
  }

  // A namelist ((DEV DIR) FN1 FN2) for a parsed name.
  toNamelist(L, n) {
    return L.list(L.list(L.intern(n.dev || "DSK"), L.intern(n.dir)), L.intern(n.fn1), L.intern(n.fn2));
  }
}

// Printing, files, STATUS/SSTATUS, and the system functions a 1979 MacLisp
// program expects (most are harmless no-ops here).
import { Sym, Cons, Flonum, LispError } from "../types.js";
import { EOF } from "../reader.js";

class LispFile {
  constructor(name, mode, text = "") {
    this.isLispFile = true;
    this.name = name; // parsed ITS name
    this.mode = mode; // "in", "out" or "append"
    this.buffer = mode === "append" ? text : "";
    this.text = text;
    this.stream = null;
    this.closed = false;
    this.pos = 0;
  }
}

export function install(L) {
  const { NIL, T } = L;
  const d = (name, fn) => L.defsubr(name, fn);
  const sp = (name, fn) => L.defsubr(name, fn, "fsubr");

  // ---- output
  L.ttyLine = 0;
  L.ttyColumn = 0;
  function emit(text, file) {
    if (file instanceof LispFile) {
      if (file.closed || file.mode === "in") throw new LispError(`file not open for output: ${file.name.fn1}`, NIL);
      file.buffer += text;
    } else {
      L.out(text);
      const nl = text.lastIndexOf("\n");
      if (nl < 0) L.ttyColumn += text.length;
      else {
        L.ttyLine += text.split("\n").length - 1;
        L.ttyColumn = text.length - nl - 1;
      }
    }
  }
  const fileArg = (f) => (f instanceof LispFile ? f : null);
  d("PRINC", (x, f) => {
    emit(L.print(x, false), fileArg(f));
    return x;
  });
  d("PRIN1", (x, f) => {
    emit(L.print(x, true), fileArg(f));
    return x;
  });
  d("PRINT", (x, f) => {
    emit("\n" + L.print(x, true) + " ", fileArg(f));
    return x;
  });
  d("TERPRI", (f) => {
    emit("\n", fileArg(f));
    return NIL;
  });
  d("TYO", (n, f) => {
    emit(String.fromCharCode(n), fileArg(f));
    return n;
  });
  // LIBLSP;#PRINT, Dick's pretty printer: plain printing will do.
  d("#PRINT", (x, f) => {
    emit("\n" + L.print(x, true) + " ", fileArg(f));
    return x;
  });
  d("#PRIN1", (x, f) => {
    emit(L.print(x, true), fileArg(f));
    return x;
  });
  d("#PRINC", (x, f) => {
    emit(L.print(x, false), fileArg(f));
    return x;
  });
  // (cursorpos) gives (line . column); with arguments it moves the cursor, which
  // we ignore.
  d("CURSORPOS", (...args) => (args.length === 0 ? new Cons(L.ttyLine, L.ttyColumn) : T));
  d("+DEFAULT-AUTOLOAD", (fnAndFile) => L.load(fnAndFile.cdr));
  d("+DEFAULT-UNDF-FNCTN", (arg) => {
    throw new LispError(`${L.print(arg instanceof Cons ? arg.car : arg)} undefined function`, arg);
  });
  d("FORCE-OUTPUT", () => NIL);
  d("CLEAR-INPUT", () => NIL);
  d("LISTEN", () => 0);
  d("LINEL", () => 79);

  // ---- files
  const fs = () => {
    if (!L.fs) throw new LispError("no file system", NIL);
    return L.fs;
  };
  const merged = (spec) => fs().merge(fs().parse(spec), { dir: fs().defaultDir });

  d("OPEN", (spec, mode = NIL) => {
    let m = "in";
    const modes = mode instanceof Cons ? L.toArray(mode) : [mode];
    for (const x of modes) {
      if (x instanceof Sym && (x.name === "OUT" || x.name === "PRINT")) m = "out";
      if (x instanceof Sym && x.name === "APPEND") m = "append";
    }
    const name = merged(spec);
    if (m === "in") {
      const entry = fs().find(name);
      if (!entry) throw new LispError(`open: file not found: ${L.print(spec)}`, spec);
      return new LispFile({ dev: "DSK", dir: entry.dir, fn1: entry.fn1, fn2: entry.fn2 }, "in", fs().textOf(entry));
    }
    let existing = "";
    if (m === "append") {
      const entry = fs().find(name);
      if (entry) existing = fs().textOf(entry);
    }
    return new LispFile(name, m, existing);
  });
  d("CLOSE", (f) => {
    if (f instanceof LispFile && !f.closed) {
      f.closed = true;
      if (f.mode !== "in") {
        const entry = fs().write(f.mode === "append" ? { ...f.name, fn2: f.name.fn2 } : f.name, f.buffer);
        f.name = { ...f.name, fn2: entry.fn2 };
      }
    }
    return T;
  });
  d("READ", (a, b) => {
    const file = a instanceof LispFile ? a : null;
    const eofval = file ? b : a;
    if (!file) {
      if (eofval !== undefined) return eofval;
      throw new LispError("read: no terminal input", NIL);
    }
    if (!file.stream) file.stream = L.reader(file.name.fn1).open(file.text);
    const form = file.stream.next();
    if (form === EOF) {
      if (eofval !== undefined) return eofval;
      throw new LispError(`read: end of file ${file.name.fn1}`, NIL);
    }
    return form;
  });
  d("READCH", () => NIL);
  d("READLINE", () => NIL);
  d("TYI", () => -1);
  d("TYIPEEK", () => -1);
  d("PROBEF", (spec) => {
    const t = fs().probe(spec);
    return t ? fs().toNamelist(L, t) : NIL;
  });
  d("DELETEF", (spec) => (fs().delete(merged(spec)) ? T : NIL));
  d("RENAMEF", (from, to) => {
    const e = fs().find(merged(from));
    if (!e) throw new LispError(`renamef: not found ${L.print(from)}`, from);
    const t = fs().merge(fs().parse(to), { dir: e.dir, fn1: e.fn1 });
    fs().delete(e);
    fs().addFile(t.dir, t.fn1, t.fn2, { ...e });
    return fs().toNamelist(L, t);
  });
  d("MERGEF", (spec, defaults) => {
    const n = fs().merge(fs().parse(spec), defaults === undefined || defaults === NIL ? { dir: fs().defaultDir } : fs().merge(fs().parse(defaults)));
    return fs().toNamelist(L, n);
  });
  d("NAMELIST", (spec) => fs().toNamelist(L, fs().merge(fs().parse(spec), { dir: fs().defaultDir })));
  d("NAMESTRING", (spec) => {
    const n = fs().merge(fs().parse(spec), { dir: fs().defaultDir });
    return L.intern(`${n.dev}:${n.dir};${n.fn1} ${n.fn2}`);
  });
  d("TRUENAME", (f) => (f instanceof LispFile ? fs().toNamelist(L, f.name) : NIL));
  d("LOAD", (spec) => L.load(spec));
  sp("FASLOAD", function (args) {
    return this.load(args);
  });
  sp("CRUNIT", function (args) {
    const items = this.toArray(args);
    if (items.length) fs().defaultDir = items[items.length - 1].name.toUpperCase().slice(0, 6);
    return this.list(this.intern("DSK"), this.intern(fs().defaultDir));
  });
  d("DEFAULTF", (spec) => {
    const n = fs().parse(spec);
    if (n.dir) fs().defaultDir = n.dir;
    return spec;
  });

  // ---- STATUS and SSTATUS
  const currentFile = () => {
    const top = L.loadStack[L.loadStack.length - 1];
    return top ? top.name : null;
  };
  // STATUS and SSTATUS decode their first argument by its first five characters,
  // so (status features x) is the same as (status feature x).
  sp("STATUS", function (args) {
    const key = args.car instanceof Sym ? args.car.name.slice(0, 5) : "";
    const arg = args.cdr instanceof Cons ? args.cdr.car : null;
    switch (key) {
      case "FEATU":
        if (arg === null) return this.fromArray([...this.features].map((f) => this.intern(f)));
        return this.truth(this.features.has(arg.name));
      case "NOFEA":
        return this.truth(!this.features.has(arg.name));
      case "CRFIL": {
        const f = currentFile();
        return f && f.fn1 ? this.list(this.intern(f.fn1), this.intern(f.fn2)) : NIL;
      }
      case "UNAME":
      case "USERI":
      case "UDIR":
        return this.intern("KEN");
      case "JCL":
        return NIL;
      case "TTYTY":
        return 5; // a Knight TV
      case "TTY":
        return NIL;
      case "DATE":
        return this.list(79, 1, 8);
      case "DAYTI":
        return this.list(12, 0, 0);
      default:
        return NIL;
    }
  });
  sp("SSTATUS", function (args) {
    const key = args.car instanceof Sym ? args.car.name.slice(0, 5) : "";
    const arg = args.cdr instanceof Cons ? args.cdr.car : null;
    if (key === "FEATU") this.features.add(arg.name);
    else if (key === "NOFEA") this.features.delete(arg.name);
    return T;
  });

  // ---- system
  d("TIME", () => new Flonum(L.clock() - L.startTime));
  d("RUNTIME", () => Math.round((L.clock() - L.startTime) * 1e6));
  d("SLEEP", () => NIL);
  d("GC", () => NIL);
  d("GCTWA", () => NIL);
  d("NOUUO", (x) => x);
  d("*RSET", (x) => x);
  d("VALRET", () => NIL);
  d("QUIT", () => NIL);
  d("SUSPEND", () => NIL);
  d("ALARMCLOCK", () => NIL);
  d("SYSCALL", () => NIL);
  d("ALLOC", () => NIL);
  d("SETSYNTAX", () => NIL);
  d("ECHOFILES", () => NIL);
}

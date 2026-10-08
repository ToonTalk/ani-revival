// Create a MacLisp with all built-ins installed.
import { Lisp } from "./interp.js";
import * as lists from "./builtins/lists.js";
import * as numbers from "./builtins/numbers.js";
import * as symbols from "./builtins/symbols.js";
import * as control from "./builtins/control.js";
import * as io from "./builtins/io.js";

export function createLisp(options = {}) {
  const L = new Lisp(options);
  lists.install(L);
  numbers.install(L);
  symbols.install(L);
  control.install(L);
  io.install(L);
  return L;
}

export { Lisp };

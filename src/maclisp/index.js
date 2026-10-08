// Create a MacLisp with all built-ins installed.
import { Lisp } from "./interp.js";
import * as lists from "./builtins/lists.js";
import * as numbers from "./builtins/numbers.js";
import * as symbols from "./builtins/symbols.js";
import * as control from "./builtins/control.js";
import * as io from "./builtins/io.js";
import { installMatcher } from "../director/cmatch.js";

export function createLisp(options = {}) {
  const L = new Lisp(options);
  lists.install(L);
  numbers.install(L);
  symbols.install(L);
  control.install(L);
  io.install(L);
  // Director's pattern matcher, which its 1979 runtime had compiled
  installMatcher(L);
  return L;
}

export { Lisp };

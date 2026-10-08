// Read the choices out of a pass-1 answer file: each (DEFINE name parent ...
// (SET YOUR CURRENT-CHOICE TO value) ...) gives name -> value, both printed.
import { readFileSync } from "node:fs";
import { decodeItsText } from "../src/its/text.js";
import { makeReader, printForm, Cons, Sym } from "../src/maclisp/reader.js";

export function choicesOfText(text, file = "answers") {
  const forms = makeReader({ file }).readAll(text);
  const m = new Map();
  for (const { form } of forms) {
    if (!(form instanceof Cons) || !(form.car instanceof Sym) || form.car.name !== "DEFINE") continue;
    const name = printForm(form.cdr.car);
    for (let c = form.cdr.cdr.cdr; c instanceof Cons; c = c.cdr) {
      const words = [];
      for (let p = c.car; p instanceof Cons; p = p.cdr) words.push(p.car);
      if (words[0] instanceof Sym && words[0].name === "SET" && words[2]?.name === "CURRENT-CHOICE") {
        m.set(name, printForm(words[4]));
      }
    }
  }
  return m;
}

export function choicesOfItsFile(path) {
  return choicesOfText(decodeItsText(readFileSync(path)).text, path);
}

// Compare two choice maps: { same, differ: [[name, a, b]], onlyA, onlyB }.
export function compareChoices(a, b) {
  const result = { same: 0, differ: [], onlyA: [], onlyB: [] };
  for (const [k, v] of a) {
    if (!b.has(k)) result.onlyA.push([k, v]);
    else if (b.get(k) === v) result.same++;
    else result.differ.push([k, v, b.get(k)]);
  }
  for (const [k, v] of b) if (!a.has(k)) result.onlyB.push([k, v]);
  return result;
}

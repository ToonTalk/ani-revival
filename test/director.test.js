// Director, running on the interpreter with the reconstructed KEN1; files.
// Examples in the spirit of the Director Guide (AIM-482, 1978).
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { createLisp } from "../src/maclisp/index.js";
import { makeProjectFileSystem } from "../src/its/node-fs.js";

let L;
const run = (src) => L.print(L.evalString(src));

before(() => {
  L = createLisp({ fs: makeProjectFileSystem() });
  L.breakHandler = (tag) => {
    throw new Error(`break ${L.print(tag)}`);
  };
  L.load(L.intern("KEN;LISP >"));
  L.load(L.intern("KEN;LOAD >"));
  L.evalString("(setq :print-load-messages nil)");
  L.evalString("(director '(ani direct))");
});

test("the root actor", () => {
  assert.equal(run("(ask something recall your name)"), "SOMETHING");
});

test("define an actor, with variables and a method", () => {
  run(`(define sally something
          (set your mood to happy)
          (do when receiving (good morning) '(yes it is a nice morning)))`);
  assert.equal(run("(ask sally recall your mood)"), "HAPPY");
  assert.equal(run("(ask sally good morning)"), "(YES IT IS A NICE MORNING)");
  assert.equal(run("(ask sally recall your parent)"), "SOMETHING");
});

test("pattern variables and commas", () => {
  run("(ask sally do when receiving (how are you ?person) '(very well thank you ,person))");
  assert.equal(run("(ask sally how are you ken)"), "(VERY WELL THANK YOU KEN)");
  run("(setq who 'ani)");
  assert.equal(run("(ask sally how are you ,who)"), "(VERY WELL THANK YOU ANI)");
});

test("instances inherit variables and methods", () => {
  run("(ask sally make sue)");
  assert.equal(run("(ask sue recall your mood)"), "HAPPY");
  assert.equal(run("(ask sue good morning)"), "(YES IT IS A NICE MORNING)");
  run("(ask sue set your mood to sleepy)");
  assert.equal(run("(list (ask sue recall your mood) (ask sally recall your mood))"), "(SLEEPY HAPPY)");
});

test("define-method, and asking an actor named by a variable", () => {
  run("(define-method (double ?n) sally (* 2 n))");
  assert.equal(run("(ask sue double 21)"), "42");
  run("(setq someone 'sue)");
  assert.equal(run("(ask ,someone double 4)"), "8");
});

test("macro methods: increment your variable", () => {
  run("(ask sally set your count to 1)");
  run("(ask sally increment your count by 5)");
  assert.equal(run("(ask sally recall your count)"), "6");
});

test("the database: memorize and recall", () => {
  run("(ask sally memorize (likes cats))");
  run("(ask sally memorize (likes dogs))");
  assert.equal(run("(ask sally recall an item matching (likes ?what) then what)"), "DOGS");
  assert.equal(run("(ask sally collect items memorized matching (likes ?))"), "((LIKES DOGS) (LIKES CATS))");
});

test("extend behavior: the old method still runs", () => {
  run("(ask sally set your greetings to 0)");
  run(`(ask sally extend behavior when receiving (good morning) by doing
         (ask :self increment your greetings by 1)
         (ask :self good morning))`);
  assert.equal(run("(ask sally good morning)"), "(YES IT IS A NICE MORNING)");
  assert.equal(run("(ask sally recall your greetings)"), "1");
});

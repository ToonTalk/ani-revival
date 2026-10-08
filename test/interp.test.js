import { test } from "node:test";
import assert from "node:assert/strict";
import { createLisp } from "../src/maclisp/index.js";
import { ItsFileSystem } from "../src/its/fs.js";
import { Flonum } from "../src/maclisp/types.js";

const run = (src, L = createLisp()) => L.print(L.evalString(src));

test("arithmetic keeps fixnums and flonums apart", () => {
  assert.equal(run("(+ 1 2 3)"), "6");
  assert.equal(run("(// 7 2)"), "3"); // "/" is the escape character, so division is written //
  assert.equal(run("(plus 1 2.5)"), "3.5");
  assert.equal(run("(*$ 2.0 0.5)"), "1.0");
  assert.equal(run("(\\ 7 2)"), "1");
  assert.equal(run("(list (fix 2.7) (fix -2.7) (float 3))"), "(2 -3 3.0)");
  const L = createLisp();
  assert.ok(L.evalString("(-$ 5.0 2.0 1.0)") instanceof Flonum);
  assert.equal(run("(list (= 3 3) (< 1 2) (> 1 2) (greaterp 3 2 1))"), "(T T NIL T)");
});

test("defun: exprs, lexprs, fexprs and macros", () => {
  const L = createLisp();
  run("(defun sq (x) (* x x))", L);
  assert.equal(run("(sq 7)", L), "49");
  run("(defun count-args n (list n (arg 1) (listify n)))", L);
  assert.equal(run("(count-args 'a 'b 'c)", L), "(3 A (A B C))");
  run("(defun quote-them fexpr (args) args)", L);
  assert.equal(run("(quote-them a b (c))", L), "(A B (C))");
  run("(defun my-if macro (form) (list 'cond (list (cadr form) (caddr form)) (list t (cadddr form))))", L);
  assert.equal(run("(my-if nil 1 2)", L), "2");
  run("(defun (swap macro) (form) (list 'list (caddr form) (cadr form)))", L);
  assert.equal(run("(swap 1 2)", L), "(2 1)");
  run("(defun ignore-second (a nil) a)", L);
  assert.equal(run("(ignore-second 1 2)", L), "1");
});

test("variables are dynamically bound", () => {
  const L = createLisp();
  run("(setq x 1) (defun get-x () x) (defun with-x (x) (get-x))", L);
  assert.equal(run("(list (with-x 5) x)", L), "(5 1)");
});

test("PROG, GO, RETURN and both kinds of DO", () => {
  assert.equal(run("(prog (i acc) (setq i 0) loop (cond ((= i 3) (return acc))) (setq acc (cons i acc) i (1+ i)) (go loop))"), "(2 1 0)");
  assert.equal(run("(do ((i 0 (1+ i)) (acc nil (cons i acc))) ((= i 3) acc))"), "(2 1 0)");
  assert.equal(run("(let ((acc nil)) (do i 0 (1+ i) (= i 3) (setq acc (cons i acc))) acc)"), "(2 1 0)");
  assert.equal(run("(do ((i 0 (1+ i))) ((= i 10) 'no) (cond ((= i 4) (return i))))"), "4");
});

test("LET destructures, as MacLisp's did", () => {
  assert.equal(run("(let (((a b) '(1 2)) ((c . d) '(3 4 5))) (list a b c d))"), "(1 2 3 (4 5))");
  assert.equal(run("(let* ((a 1) (b (1+ a))) (list a b))"), "(1 2)");
});

test("CATCH and THROW (old style), *CATCH, ERRSET", () => {
  assert.equal(run("(catch (progn (throw 'thrown tag) 'not) tag)"), "THROWN");
  assert.equal(run("(*catch 'k (*throw 'k 42))"), "42");
  assert.equal(run("(errset (car 'a) nil)"), "NIL");
  assert.equal(run("(errset (car '(a)))"), "(A)");
});

test("property lists, including disembodied ones", () => {
  assert.equal(run("(progn (putprop 'cindy 'green 'color) (get 'cindy 'color))"), "GREEN");
  assert.equal(run("(progn (defprop cindy star shape) (remprop 'cindy 'color) (plist 'cindy))"), "(SHAPE STAR)");
  assert.equal(run("(get '(nil description (prevents step-mother)) 'description)"), "(PREVENTS STEP-MOTHER)");
});

test("Director quotes: ' with , and !, builds the list", () => {
  assert.equal(run("(let ((x 2) (y '(3 4))) '(a ,x !,y b))"), "(A 2 3 4 B)");
  assert.equal(run("(let ((action '(go))) '((remove-current-method) !,action))"), "((REMOVE-CURRENT-METHOD) GO)");
  assert.equal(run("'(plain list)"), "(PLAIN LIST)");
});

test("read-time evaluation with #", () => {
  assert.equal(run("'#(+ 1 2)"), "3");
});

test("SORT is a stable merge sort", () => {
  assert.equal(run("(sort '(3 1 2) '<)"), "(1 2 3)");
  assert.equal(run("(sortcar '((1 . a) (0 . b) (1 . c) (0 . d)) '<)"), "((0 . B) (0 . D) (1 . A) (1 . C))");
});

test("characters: explode, implode, getcharn", () => {
  assert.equal(run("(implode (reverse (explodec 'abc)))"), "CBA");
  assert.equal(run("(getcharn '? 1)"), "63");
  assert.equal(run("(getchar 'cinderella 2)"), "I");
});

test("loading from the ITS file system", () => {
  const fs = new ItsFileSystem();
  fs.addFile("KEN", "TEST", "3", { text: "(setq loaded 'three)" });
  fs.addFile("KEN", "TEST", "12", { text: "(setq loaded 'twelve)" });
  fs.addFile("KEN", "DECLAR", "67", { text: "(setq declared t)" });
  const L = createLisp({ fs });
  run("(load '|ken;test >|)", L);
  assert.equal(run("loaded", L), "TWELVE"); // ">" is the highest version
  run("(include |ai:ken;declare >|)", L); // DECLARE is truncated to DECLAR
  assert.equal(run("declared", L), "T");
  assert.equal(run("(probef '((dsk ken) test 3))", L), "((DSK KEN) TEST |3|)"); // file name parts are symbols
  const f = run("(let ((f (open '((ken) out file) 'out))) (print '(a b) f) (close f) (probef '((ken) out file)))", L);
  assert.equal(f, "((DSK KEN) OUT FILE)");
});

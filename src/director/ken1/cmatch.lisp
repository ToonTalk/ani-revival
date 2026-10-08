;;; -*-lisp-*-
;;; KEN1;CMATCH, reconstructed: Director's patterns.
;;;
;;; The original is lost; see the header of macros.lisp for the kinds of evidence.
;;; The original also compiled patterns into efficient Lisp (compile-cases-cleverly
;;; and friends); interpreting, a pattern is matched as it stands.
;;;
;;; The pattern language (Director Guide, 1978, "Complete Description of Patterns"):
;;;   ?x           matches any one element and binds x to it
;;;   %x           matches the rest of the list (only at the end of a list)
;;;   ? and %      the same without binding
;;;   {or a b}     matches if any of a, b, ... match
;;;   {and p q}    matches if all match, with all their bindings
;;;   {expr}       any other braced expression is evaluated, after binding the ?x
;;;                in it to the element; NIL means no match. E.g. {greaterp ?n 33}
;;;   other atoms  must be EQ (numbers EQUAL); lists match element by element
;;;
;;; A method's variables are bound from :message by its own code (DRECT's
;;; define-method-body: (binding-part-of-pattern pattern '(lambda vars . action))),
;;; the variables in the reverse of their order in the pattern (DRECT's comment).

(defun pattern-variable? (x)
  (and (symbolp x) (memq (getchar x 1) '(? %))))

(defun variable-name (x)
  ;; ?foo -> foo; ? -> nil
  (cond ((= (flatc x) 1) nil)
	(t (implode (cdr (explodec x))))))

;; (devariablize-pattern pattern): ?x -> ?, %x -> %, but leave braced predicates
;; whole, since they need their variables. evidence: exp (method-pattern
;; properties such as (set your parent to ?)).
(defun devariablize-pattern (pattern)
  (cond ((pattern-variable? pattern) (implode (list (getchar pattern 1))))
	((atom pattern) pattern)
	((eq (car pattern) 'director-symbol-for-quoted-pattern) pattern)
	((memq (car pattern) '(director-symbol-for-and-pattern director-symbol-for-or-pattern))
	 (cons (car pattern) (mapcar 'devariablize-pattern (cdr pattern))))
	((eq (car pattern) 'director-symbol-for-braces) pattern)
	(t (cons (devariablize-pattern (car pattern)) (devariablize-pattern (cdr pattern))))))

;; (test-part-of-pattern pattern [actor-name] [flag]): a predicate of one argument,
;; the message, true if it matches. evidence: SOME funcalls a method's
;; method-pattern-predicate on database items.
(defun test-part-of-pattern n
  (list 'lambda '(message) (list 'match 'message (list 'quote (arg 1)))))

;; (any-variables-in-pattern? pattern): does it contain a ?variable, a %variable,
;; or a {...}? evidence: tags (CMATCH: define-form any-variables-in-pattern?).
(defun any-variables-in-pattern? (pattern)
  (cond ((pattern-variable? pattern) t)
	((atom pattern) nil)
	((memq (car pattern) '(director-symbol-for-and-pattern director-symbol-for-or-pattern
			       director-symbol-for-braces director-symbol-for-quoted-pattern))
	 t)
	(t (or (any-variables-in-pattern? (car pattern))
	       (any-variables-in-pattern? (cdr pattern))))))

;; (non-trivial-pattern? x): is x a pattern rather than a constant? Used by CHAR's
;; put-suggestion-in-source ("the element is really a pattern for if-needed demon").
;; Defined in no surviving file and not in TS D2500; rebuilt from that use.
(defun non-trivial-pattern? (x)
  (any-variables-in-pattern? x))

;; (predicate-of-pattern pattern [flag]): as test-part-of-pattern.
;; evidence: 1980 (MATCH-SAFE-DELETE calls it with the pattern and T).
(defun predicate-of-pattern n
  (test-part-of-pattern (arg 1)))

;;; Lists filtered by a pattern. evidence: 1980 compiled code, decompiled:
;;; MATCH-SAFE-DELETE = (nreverse (match-safe-delete-1 (predicate-of-pattern p t) l nil));
;;; MATCH-SAFE-DELETE-1 conses each element the predicate rejects onto the result;
;;; MATCH-MEMBER = (match-member-1 (test-part-of-pattern p) l), the tail from the
;;; first match; MATCH-DELETE calls MATCH-SAFE-DELETE and then a kernel routine on
;;; the original list and the result, here taken to copy the result into the list.

(defun match-safe-delete (pattern l)
  (nreverse (match-safe-delete-1 (predicate-of-pattern pattern t) l nil)))

(defun match-safe-delete-1 (predicate l result)
  (cond ((null l) result)
	((funcall predicate (car l)) (match-safe-delete-1 predicate (cdr l) result))
	(t (match-safe-delete-1 predicate (cdr l) (cons (car l) result)))))

(defun match-delete (pattern l)
  (let ((remaining (match-safe-delete pattern l)))
       (cond (remaining (rplaca l (car remaining))
			(rplacd l (cdr remaining))))))

(defun match-member (pattern l)
  (match-member-1 (test-part-of-pattern pattern) l))

(defun match-member-1 (predicate l)
  (cond ((null l) nil)
	((funcall predicate (car l)) l)
	(t (match-member-1 predicate (cdr l)))))

;; (find-variables-in-pattern pattern): its variable names, last first.
(defun find-variables-in-pattern (pattern)
  (let ((variables nil))
       (find-variables-1 pattern)
       variables))

(defun find-variables-1 (p)
  (cond ((pattern-variable? p)
	 (let ((v (variable-name p)))
	      (and v (not (memq v variables)) (push v variables))))
	((atom p) nil)
	((eq (car p) 'director-symbol-for-quoted-pattern) nil)
	(t (find-variables-1 (car p)) (find-variables-1 (cdr p)))))

;; (binding-part-of-pattern pattern function [ignored]): the method's definition, a
;; lambda of no arguments that applies the function to the values of the
;; pattern's variables taken from :message. evidence: exp, e.g.
;; (defun something-set-84 nil ((lambda (the-new-value) ...) (first (cddddr :message)))).
(defun binding-part-of-pattern n
  (list 'lambda nil (cons (arg 2) (binding-part-of-pattern1 ':message (arg 1) nil))))

;; (binding-part-of-pattern1 message-form pattern ignored): for each variable of the
;; pattern (in find-variables-in-pattern's order), a form computing its value from
;; message-form.
(defun binding-part-of-pattern1 (message-form pattern ignore)
  (mapcar (function (lambda (v) (list 'pattern-variable-value (list 'quote v) (list 'quote pattern) message-form)))
	  (find-variables-in-pattern pattern)))

;;; -------------------------------------------------------------- matching

;; MATCH, MATCH-BINDINGS and PATTERN-VARIABLE-VALUE are built into the interpreter
;; (src/director/cmatch.js), for speed: every message is matched against method
;; patterns until one fits, so matching is most of what Director does, and in
;; 1979 it was compiled code. They work as follows, clause for clause:
;;
;;  (match object pattern): non-NIL if the object matches the pattern. evidence:
;;    1980 (its arguments are (OBJECT PATTERN &OPTIONAL VALUES REVERSED?)); uses,
;;    all object first: SOME's (match name name-pattern), INTERF's (match variable
;;    variable-pattern), SUGREL's (match correct-element element) "I use match
;;    since element may have ?".
;;  (match-bindings pattern object): NIL if no match, else (t . bindings), an alist
;;    of each ?variable and %variable to what it matched.
;;  (pattern-variable-value v pattern message): the value v gets when the message
;;    matches, for the code binding-part-of-pattern1 writes.
;;
;; Matching an element against a pattern:
;;  - (director-symbol-for-quoted-pattern x) matches x itself, literally (SOME
;;    installs methods with such patterns for messages that themselves contain
;;    patterns, "recall each item matching ...");
;;  - ?x matches anything, and %x the rest of a list (even if empty), binding x
;;    to it; a variable already bound must match the same value again (EQUAL);
;;  - any other atom matches itself (EQ, or EQUAL numbers);
;;  - {or a b ...} matches if any alternative does, keeping its bindings;
;;  - {and a b ...} matches if every part does, in turn;
;;  - any other {expr}, a restriction, is evaluated as written, with each atom in it
;;    that begins with ? (a bare ? too) bound to the element, and matches if the
;;    value is non-NIL, binding its named variables: {greaterp ?n 33}, or CHOMET's
;;    {eq (get ? 'type) 'display}. evidence: 1980 (HANDLE-RESTRICTION binds the
;;    atom FIRST-ATOM-BEGINNING-WITH-? finds, then evaluates the restriction);
;;  - a list matches a list element by element.

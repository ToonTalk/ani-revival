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
  (list 'lambda '(message) (list 'match (list 'quote (arg 1)) 'message)))

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

;; The value of variable v when the message matches the pattern.
(defun pattern-variable-value (v pattern message)
  (let ((bindings (match-bindings pattern message)))
       (cdr (assq v (cdr bindings)))))

;;; -------------------------------------------------------------- matching

;; (match pattern x): non-NIL if x matches. Bindings are made only inside
;; braced predicates. evidence: uses (SUGREL "I use match since element may have ?").
(defun match (pattern x)
  (not (null (match-bindings pattern x))))

;; (match-bindings pattern x): NIL if no match, else (t . alist of bindings).
(defun match-bindings (pattern x)
  (let ((result (match-1 pattern x (list t))))
       result))

;; (director-symbol-for-quoted-pattern x) matches x itself, literally: no ? or {...}
;; inside it is special. evidence: SOME installs methods with such patterns for
;; messages that themselves contain patterns ("recall each item matching ...").
(defun match-1 (p x bindings)
  (cond ((null bindings) nil)
	((and (not (atom p)) (eq (car p) 'director-symbol-for-quoted-pattern))
	 (cond ((equal (cadr p) x) bindings)))
	((pattern-variable? p)
	 (cond ((eq (getchar p 1) '%) (bind-match-variable p x bindings))
	       (t (bind-match-variable p x bindings))))
	((atom p)
	 (cond ((or (eq p x) (and (numberp p) (numberp x) (equal p x))) bindings)))
	((eq (car p) 'director-symbol-for-or-pattern)
	 (do ((alternatives (cdr p) (cdr alternatives)))
	     ((null alternatives) nil)
	     (let ((b (match-1 (car alternatives) x bindings)))
		  (and b (return b)))))
	((eq (car p) 'director-symbol-for-and-pattern)
	 (do ((parts (cdr p) (cdr parts))
	      (b bindings (match-1 (car parts) x b)))
	     ((or (null parts) (null b)) b)))
	((eq (car p) 'director-symbol-for-braces)
	 (match-predicate (cdr p) x bindings))
	;; a rest variable at this position takes the remaining list, even if empty
	((and (pattern-variable? (car p)) (eq (getchar (car p) 1) '%))
	 (bind-match-variable (car p) x bindings))
	((atom x) nil)
	(t (match-1 (cdr p) (cdr x) (match-1 (car p) (car x) bindings)))))

(defun bind-match-variable (p x bindings)
  (add-binding (variable-name p) x bindings))

(defun add-binding (v x bindings)
  (cond ((null v) bindings)
	(t (let ((old (assq v (cdr bindings))))
		(cond ((null old) (cons t (cons (cons v x) (cdr bindings))))
		      ((equal (cdr old) x) bindings))))))

;; {expr}: bind its ?variables to x, then evaluate it.
(defun match-predicate (expr x bindings)
  (let ((vars (find-variables-in-pattern expr)))
       (cond ((progv vars (mapcar (function (lambda (v) x)) vars)
		     (eval (devariablize-predicate expr)))
	      (do ((v vars (cdr v)) (b bindings (add-binding (car v) x b)))
		  ((null v) b))))))

(defun devariablize-predicate (expr)
  (cond ((pattern-variable? expr) (variable-name expr))
	((atom expr) expr)
	(t (cons (devariablize-predicate (car expr)) (devariablize-predicate (cdr expr))))))

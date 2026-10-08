;;; -*-lisp-*-
;;; KEN1;MACROS, reconstructed.
;;;
;;; The original is lost. This file rebuilds the macros and small functions
;;; Director is written with, from this evidence:
;;;   tags   the 1979 tags table (KEN TAGS, tape 7005017): each name, how it was
;;;          defined (define-macro, define-do-now-macro, ...) and its order
;;;   1980   TS D2500, a Director saved in January 1980, which has compiled code
;;;          for most of these (reports/pdump/)
;;;   exp    the macro-expanded Director files of January 1979 (SOME LISP, ...)
;;;   guide  the Director Guide, AIM-482 (June 1978)
;;;   drect  how KEN1;DRECT (which survived) uses them
;;;   uses   how the surviving Director and Ani code calls them
;;; Director's read macros (, ` ! { } #) are built into the interpreter's reader.
;;;
;;; Two conventions from the originals: a quote containing , builds the list
;;; (REAMAC), and (quote ,x) is written where backquote users would write ',x,
;;; because REAMAC expands the inner quote first.

(sstatus feature director-macros)

;;; -------------------------------------------------------------- defining things

;; (define-macro name (params...) body...): the params are bound, by position and
;; with destructuring, to the arguments of the call; the body returns the expansion.
;; :whole-macro-form is the call itself. evidence: tags; drect (make-macro-receiver
;; funcalls define-macro's MACRO property on a define-macro form).
(defun (define-macro macro) (:whole-macro-form)
  (let (((name params . body) (cdr :whole-macro-form)))
       '(defun (,name macro) (:whole-macro-form)
	       (let ((,params (cdr :whole-macro-form))) !,body))))

;; (define-function name args body...): a function. evidence: tags; 1980 (expands
;; into a DEFUN wrapped in PROGN-COMPILE, which matters only to the compiler).
(define-macro define-function (name args . body)
  '(defun ,name ,args !,body))

;; (define-form (name params...) body...): a function whose later parameters may be
;; optional, written (var) or (var default). evidence: tags; 1980 (expands into a
;; DEFINE-FUNCTION); uses, e.g. DRECT's (insert-receive pattern action actor
;; (actor-name) (private-method nil)).
(define-macro define-form ((name . params) . body)
  '(define-function ,name ,(form-lambda-list params) !,body))

(defun form-lambda-list (params)
  (do ((p params (cdr p))
       (required nil)
       (optional nil))
      ((null p)
       (append (nreverse required)
	       (cond (optional (cons '&optional (nreverse optional))))))
      (cond ((atom (car p)) (push (car p) required))
	    ((cdr (car p)) (push (car p) optional))
	    (t (push (list (caar p) nil) optional)))))

;; (define-method-helper (name params...) actor body...): a function belonging to an
;; actor's methods. evidence: tags; uses (SOME).
(define-macro define-method-helper ((name . params) actor . body)
  '(define-form (,name !,params) !,body))

;; (define-alias new old): new is another name for the function old.
;; evidence: tags (replace-first, replace-rest, nth-rest are aliases).
(define-macro define-alias (new old)
  '(define-alias-1 (quote ,new) (quote ,old)))

(defun define-alias-1 (new old)
  (putprop new old 'expr)
  new)

;; (define-synonym new old): as define-alias. evidence: tags (DRECT: dload,
;; nothing-more-to-do; INSTAN: instant).
(define-macro define-synonym (new old)
  '(define-alias-1 (quote ,new) (quote ,old)))

;; (setq-if-unbound var value). evidence: tags; 1980.
(define-macro setq-if-unbound (variable value)
  '(or (boundp (quote ,variable)) (setq ,variable ,value)))

;; The "do-now" macros of the original computed their result at expansion time
;; when their arguments were constants. As functions they behave the same.
;; evidence: tags (define-do-now-macro first, rest, second, third, fourth).
(defun first (x) (car x))
(defun rest (x) (cdr x))
(defun second (x) (cadr x))
(defun third (x) (caddr x))
(defun fourth (x) (cadddr x))

(define-alias replace-first rplaca)
(define-alias replace-rest rplacd)
(define-alias nth-rest nthcdr)

(defun replace-second (l x)
  (rplaca (cdr l) x)
  l)

(defun one-long (l) (and (not (atom l)) (null (cdr l))))
(defun two-long (l) (and (not (atom l)) (one-long (cdr l))))
(defun three-long (l) (and (not (atom l)) (two-long (cdr l))))

;; (eq-many a b ...): are they all EQ? uses: (eq-many (first m1) (first m2) 'method:)
(defun eq-many n
  (do ((i 2 (1+ i)))
      ((> i n) t)
      (or (eq (arg (1- i)) (arg i)) (return nil))))

;; (append-atoms a b ...): a new uninterned symbol whose name joins the names.
;; intern-append-atoms makes the interned one. evidence: 1980 (a macro expanding
;; into (maknam (append (printer-explode a) ...))); uses: OBJECT ("it is important
;; for gc that interpolation-drawer not be interned"), SOME's "make uninterned
;; offspring" and "make interned offspring", NODES's (intern (append-atoms ...)).
;; DRECT names methods with it, so each method's name is a symbol of its own:
;; every nameless actor's first method is NAMELESS-...-2, but never the same one.
(defun append-atoms n
  (maknam (do ((i n (1- i))
	       (acc nil (append (explodec (arg i)) acc)))
	      ((zerop i) acc))))

(defun intern-append-atoms n
  (implode (mapcan 'explodec (listify n))))

(defun *append-atoms (atoms) (apply 'append-atoms atoms))

(defun round (x)
  (fix (+$ (float x) 0.5)))

;;; -------------------------------------------------------------- actors and methods

;; An actor is (director-symbol-for-actor method-count parent-method method ...).
;; A method is a symbol: its value is itself (run its function) or a cell
;; (director-symbol-for-value v) (a variable); its properties include
;; method-pattern and method-pattern-predicate. evidence: drect (make-actor,
;; add-to-actor, run-method); exp (PLACE-ACTOR-ON-NAME forms).

(defun actorp (x) (and (not (atom x)) (eq (car x) 'director-symbol-for-actor)))

;; These take an actor or its name. In 1978 :self was the receiver's name (see
;; REVIVE;BRIDGE), so DRECT's method search starts from a name.
(defun method-count+methods-of (actor) (cdr (actor-object actor)))
(defun methods-of (actor) (cddr (actor-object actor)))

(defun actor-object (x)
  (cond ((actorp x) x)
	(t (actor-of-1 x 'dont-autoload))))

;; (self-name actor): what :self is bound to, the actor's name, or the actor
;; itself if it has none.
(defun self-name (actor)
  (cond ((actorp actor) (or (name-of actor) actor))
	(t actor)))
(defun method-pattern (method-name) (get method-name 'method-pattern))
(defun method-pattern-predicate (method-name) (get method-name 'method-pattern-predicate))
(defun body-of-method (method-name) (get method-name 'expr))
(defun put-function-definition (name definition) (putprop name definition 'expr))
(defun definedp (f) (getl f '(expr fexpr macro subr lsubr fsubr)))

;; (actor-of x [option]): the actor named x (or x itself if it is an actor). The
;; option is not evaluated: DONT-AUTOLOAD gives NIL rather than loading the
;; actor's file; T loads it but returns NIL instead of complaining.
;; evidence: 1980 (a macro); drect (exists? passes the word dont-autoload,
;; eval-define passes t "this will autoload it if need be").
(define-macro actor-of (name . options)
  '(actor-of-1 ,name (quote ,(car options))))

;; An actor is never autoloaded from a file that is being loaded right now: KEN;CINDY
;; gives its own actors ACTOR-LOAD properties, so while it defines them, eval-define's
;; (actor-of name t) would otherwise load CINDY again inside itself, which DRECT's
;; director-load treats as an error ("trying to load ... within itself").
(defun actor-of-1 (x option)
  (cond ((null x) nil)
	((actorp x) x)
	((general-get x 'actor 'non-atomic-actors))
	((eq option 'dont-autoload) nil)
	((actor-load-file-being-loaded? x) nil)
	(t (actor-autoload x option))))

(defun actor-load-file-being-loaded? (x)
  (let ((file (cond ((atom x) (get x 'actor-load)) (t (get (car x) 'actor-load)))))
       (and file (+loading-file-p file))))

;; (parent-of actor [option]): the parent actor, from the value cell of the first
;; method, "recall your parent". evidence: 1980 (a macro); drect (add-to-actor
;; keeps that method first).
(define-macro parent-of (actor . options)
  '(parent-of-1 ,actor (quote ,(car options))))

(defun parent-of-1 (actor option)
  (let ((object (actor-object actor)))
       (let ((parent (and object (cadr (symeval (caddr object))))))
	    (and parent (actor-of-1 parent option)))))

;; (name-of actor): the value of its "recall your name" method; a name is its own name.
(defun name-of (actor)
  (cond ((not (actorp actor)) actor)
	(t (name-of-methods (methods-of actor)))))

(defun name-of-methods (methods)
  (do ((m methods (cdr m)))
      ((null m) nil)
      (cond ((not (atom (car m)))
	     (let ((name (name-of-methods (cdr (car m))))) ;; compiled cases
		  (and name (return name))))
	    ((equal (method-pattern (car m)) '(recall your name))
	     (return (cadr (symeval (car m))))))))

;; (method-applicable? method-name message): does the message match the method's
;; pattern? The predicate is made by test-part-of-pattern (CMATCH).
(defun method-applicable? (method-name message)
  (let ((predicate (method-pattern-predicate method-name)))
       (cond (predicate (funcall predicate message))
	     (t (match message (method-pattern method-name))))))

;; (initialize-something): make the root actor SOMETHING and give it the methods
;; that let actors receive new methods. evidence: tags; SOME ("defined in macros >").
;;
;; SOME's put-receive-methods-in-something gives it "do when receiving" and its two
;; relatives. "extend behavior when receiving ?pattern by doing %action" is used
;; (SOME, OBJECT, POLY, NODES, ELEMNT) but defined in no surviving file, so it is made
;; here. Its meaning (guide): the action runs, and if while running it the actor is
;; sent a message matching the pattern, "this new clause is ignored and the old
;; action is taken". The mechanism is DRECT's: a method whose value is NIL is passed
;; over ("temporally not around anymore"), so the new method's action runs with its
;; own name bound to NIL; run-method binds :method-being-run to that name.
(define-macro initialize-something ()
  '(let ((:self (make-actor nil 'something)))
	(place-actor-on-name :self 'something)
	(put-receive-methods-in-something)
	(insert-receive '(extend behavior when receiving ?pattern by doing %action)
			'((insert-receive pattern (list (extended-behavior-action action)) :self))
			:self)
	'something))

(defun extended-behavior-action (action)
  (cons 'progv (cons '(list :method-being-run) (cons ''(nil) action))))

;;; -------------------------------------------------------------- sending messages

;; (ask target word ...): send the message to the target. In interpreted Director
;; an ask is (ask1 (actor-of target) message nil). evidence: exp (asks the compiler
;; could not optimize became exactly that); drect (ask1). The target is evaluated
;; if it is ,x or a :variable such as :self; a list is built as a quote is. The
;; message is built as a quote is (REAMAC): , and !, anywhere are evaluated, except
;; inside script:, and `x becomes ,x for the code being built (exp: SOME's
;; "do when receiving ... `new-value" compiled that way).
(define-macro ask (target . message)
  '(ask1 (actor-of ,(ask-target target)) ,(ask-message message) nil))

(define-macro uncompiled-ask (target . message)
  '(ask1 (actor-of ,(ask-target target)) ,(ask-message message) nil))

(define-macro a (target . message)
  '(uncompiled-ask ,target !,message))

;; (ask-old target word ...): skip the method now running, so an inherited or
;; earlier method handles it. evidence: drect (ask1's third argument,
;; :skip-current-method?, and cases).
(define-macro ask-old (target . message)
  '(ask1 (actor-of ,(ask-target target)) ,(ask-message message) t))

;; Variants (guide): -if-exists gives NIL if there is no such actor,
;; -if-understood gives NIL if no method matches, -if-can either.
(define-macro ask-if-exists (target . message)
  '(and (exists? ,(ask-target target))
	(ask1 (actor-of ,(ask-target target)) ,(ask-message message) nil)))

(define-macro ask-if-understood (target . message)
  '(let ((:message-not-understood 'not-understood-so-nil))
	(ask1 (actor-of ,(ask-target target)) ,(ask-message message) nil)))

(define-macro ask-if-can (target . message)
  '(and (exists? ,(ask-target target))
	(let ((:message-not-understood 'not-understood-so-nil))
	     (ask1 (actor-of ,(ask-target target)) ,(ask-message message) nil))))

(define-macro uncompiled-ask-if-can (target . message)
  '(ask-if-can ,target !,message))

(defun not-understood-so-nil (actor message) nil)

;; (ask-each targets word ...): send the message to each; targets is a list of
;; names, or ,expression. Returns the list of answers.
(define-macro ask-each (targets . message)
  '(mapcar (function (lambda (:ask-each-target)
			     (ask1 (actor-of :ask-each-target) ,(ask-message message) nil)))
	   ,(ask-target targets)))

;; (ask-all target-pattern word ...): send the message to every actor whose
;; (non-atomic) name matches the pattern, e.g. (ask-all (comparison-of ,:self ?)
;; print comparisons). Returns the list of answers. evidence: guide; uses; drect
;; (actors-that-match).
(define-macro ask-all (target-pattern . message)
  '(mapcar (function (lambda (:ask-all-target)
			     (ask1 :ask-all-target ,(ask-message message) nil)))
	   (actors-that-match (car ,(ask-target target-pattern))
			      (cdr ,(ask-target target-pattern)))))

(defun ask-target (target)
  (cond ((atom target)
	 (cond ((and (symbolp target) (eq (getchar target 1) ':)) target)
	       (t (list 'quote target))))
	((and (eq (car target) 'director-symbol-for-eval) (one-long (cdr target)))
	 (cadr target))
	(t (quote-allowing-eval-and-unpack target))))

(defun ask-message (message)
  (quote-allowing-eval-and-unpack message))

;; (script: form ...): in a message, protects the forms' commas until the forms
;; run; when evaluated it runs them. evidence: guide ("the word script: is used to
;; protect the commas"); 1980 (a SCRIPT macro).
(define-macro script: forms
  '(progn !,forms))

;; (comma form): in code that a macro method generates, ,form, so that form is
;; evaluated when the generated code runs. evidence: exp (SOME's (make) macro
;; method generates (ask :self make an instance named nil copying ,(comma (ask
;; :self recall your variables-to-copy-upon-creation))), and its compiled normal
;; version, SOMETHING-MAKE-26, evaluates that inner ask at run time). The form
;; is built as a quote is, so commas inside it are evaluated now, as in ODIREC's
;; ,(comma (comma :new-value)). evidence: 1980 (decompiled with high confidence:
;; `(LIST 'DIRECTOR-SYMBOL-FOR-EVAL ,(QUOTE-ALLOWING-EVAL-AND-UNPACK form))).
(define-macro comma (form)
  '(list 'director-symbol-for-eval ,(quote-allowing-eval-and-unpack form)))

;; (quote-if-need-be x): x itself if it is an atom, otherwise x built as a quote
;; is, so (quote-if-need-be ,amount) is just amount. evidence: 1980 compiled code
;; (QUOTE-IF-NEED-BE MACRO: a type test, then QUOTE-ALLOWING-EVAL-AND-UNPACK).
(define-macro quote-if-need-be (x)
  (cond ((atom x) x)
	(t (quote-allowing-eval-and-unpack x))))

;; Hints to Director's compiler about which actor will receive a message; when
;; interpreting, just the form. evidence: uses; guide.
(define-macro example-of (form) form)
(define-macro compile-using (actor form) form)

;; (do-as-if-you-were actor receiver word ...): have the receiver handle the
;; message with the given actor's methods, as if it were that actor.
;; evidence: uses (SCENE, ACTION, PLACE, DISPLY, ...).
(define-macro do-as-if-you-were (actor receiver . message)
  '(let ((:self (self-name (actor-of ,(ask-target receiver))))
	 (:message ,(ask-message message)))
	(cases (actor-of ,(ask-target actor)))))

;; (define name parent message ...): make an actor and send it each message; the
;; messages are sent as written. (define-or-add-to ...) adds to an existing actor.
;; evidence: 1980 (DEFINE and DEFINE-OR-ADD-TO differ only in a final T or NIL,
;; drect's eval-define's clobber-old); guide.
(define-macro define (name parent . messages)
  '(eval-define (quote ,name) (quote ,parent) (quote ,messages) t))

(define-macro define-or-add-to (name parent . messages)
  '(eval-define (quote ,name) (quote ,parent) (quote ,messages) nil))

;; (define-method pattern actor body...) and its relatives: the actor is sent
;; (do when receiving pattern . body), as written, so the body's commas are
;; evaluated only when it runs. evidence: 1980 (DEFINE-METHOD builds the
;; message (do when receiving ...)); SOME (the "do when receiving" method calls
;; insert-receive).
(define-macro define-method (pattern actor . body)
  '(ask1 (actor-of (quote ,actor))
	 (quote (do when receiving ,pattern !,(strip-help-comments body)))
	 nil))

(define-macro define-receiver (pattern actor . body)
  '(define-method ,pattern ,actor !,body))

;; (define-receive pattern (body...) actor): an older form, with the body as one
;; list and the actor last. evidence: uses (SCENE, CONVEY: (define-receive (yield
;; most current value of ?element) ((cond ...)) subscene)).
(define-macro define-receive (pattern body actor)
  '(define-method ,pattern ,actor !,body))

(define-macro define-extension-receiver (pattern actor . body)
  '(ask1 (actor-of (quote ,actor))
	 (cons 'extend (cons 'behavior (cons 'when (cons 'receiving
	   (cons (quote ,pattern) (cons 'by (cons 'doing (quote ,(strip-help-comments body)))))))))
	 nil))

(define-macro define-extension-method (pattern actor . body)
  '(define-extension-receiver ,pattern ,actor !,body))

;; (define-macro-method pattern actor body...): the body returns code to run.
;; evidence: drect (insert-macro-receive).
(define-macro define-macro-method (pattern actor . body)
  '(insert-macro-receive (quote ,pattern) (quote ,(strip-help-comments body)) (actor-of (quote ,actor))))

;; Help comments are kept for (ask x help); here they are simply recorded.
(defun strip-help-comments (body)
  (cond ((and (not (atom (car body))) (eq (car (car body)) 'help-comments:))
	 (cdr body))
	(t body)))

;; (compile-actors): compile the actors defined so far in this file. Interpreting,
;; there is nothing to do.
(define-macro compile-actors ignore ''compile-actors)

;; define-abbreviation is in KEN;ABBREV, which survived: abbreviations are
;; expanded at read time by REAMAC's & read macro.

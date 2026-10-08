;;; -*-lisp-*-
;;; REVIVE;BRIDGE: run Ani's 1978 code on the Director of January 1979.
;;;
;;; This file is ours, not Ken's. Ani was written for the Director of the first
;;; Director Guide (AIM-482, June 1978); her compiled files on tape 7005017 date
;;; from June to October 1978, and CP 29, the pass-1 output we test against, was
;;; written on 14 September 1978. Around 21 November 1978 Ken rewrote Director (the
;;; second Guide, AIM-482B, says "much of Director has been rewritten" and demons
;;; "have been eliminated"), and the Director files that survived (DRECT, SOME 666,
;;; OBJECT 401) are that rewrite as of 8 January 1979. Three things Ani relies on
;;; changed, and this file puts them back:
;;;
;;;  1. :self is the receiver's name, as in 1978.
;;;  2. Variable demons: Ken's own bridge, ODIREC 2 (22 November 1978), verbatim.
;;;  3. Database demons: virtual items and actions on memorizing, rebuilt from the
;;;     1978 Guide, since no bridge for them survives.
;;;
;;; Load it after (director '(ani direct)) and before any of Ani's files.

;; SOME (Something, the root actor) is loaded on first use; load it now so that
;; what follows replaces its definitions rather than being replaced by them.
(actor-of 'something)

;;; -------------------------------------------------------------- 1. :self

;; In 1978 a message was sent to an actor's name, and :self was bound to that name.
;; The Guide's compiled transmission binds it to the name as written, (LET ((:SELF
;; 'MY-FIRST-FILM) ...) ...) (AIM-482 p. 56), and the compiled 1978 Ani files send
;; (ASK1 'SOMETHING '(...)). Ani builds names and data from it: CPOINT's (third
;; :self) is the element of (choice-point-of cinderella speed), a descriptor records
;; itself as a suggestion's source with ,:self, and a character comparison, which
;; has a synonym with its two characters the other way round, names a relative
;; choice point after (rest :self), the pair in the order it was addressed in. CP 29
;; has both orders, e.g. (relative-choice-point-of (prince step-mother)
;; relative-path-curvature) and (relative-choice-point-of (step-mother prince)
;; relative-path-length). In 1979 asks expand into (ask1 (actor-of target) ...)
;; and DRECT's ask1 binds :self to the actor itself (the revised Guide's (LET
;; ((MYSELF (ACTOR-OF 'MY-FIRST-FILM))) ...)).
;;
;; Here the asks give ask1 the target as written, and ask1 binds :self to it (to
;; its name, if it is an actor rather than a name) and starts the method search
;; there. The accessors in MACROS accept a name, so DRECT's search works as it
;; did, and its test for private methods, (eq actor :self), holds for the
;; receiver alone.
(defun ask1 (target :message :skip-current-method?)
  (and (actor-of target) ;;loads the actor's file if need be
       (let ((:self (self-name target)))
	    (cases :self))))

(define-macro ask (target . message)
  '(ask1 ,(ask-target target) ,(ask-message message) nil))

(define-macro uncompiled-ask (target . message)
  '(ask1 ,(ask-target target) ,(ask-message message) nil))

(define-macro ask-old (target . message)
  '(ask1 ,(ask-target target) ,(ask-message message) t))

(define-macro ask-if-exists (target . message)
  '(and (exists? ,(ask-target target))
	(ask1 ,(ask-target target) ,(ask-message message) nil)))

(define-macro ask-if-understood (target . message)
  '(let ((:message-not-understood 'not-understood-so-nil))
	(ask1 ,(ask-target target) ,(ask-message message) nil)))

(define-macro ask-if-can (target . message)
  '(and (exists? ,(ask-target target))
	(let ((:message-not-understood 'not-understood-so-nil))
	     (ask1 ,(ask-target target) ,(ask-message message) nil))))

(define-macro ask-each (targets . message)
  '(mapcar (function (lambda (:ask-each-target)
			     (ask1 :ask-each-target ,(ask-message message) nil)))
	   ,(ask-target targets)))

(define-macro do-as-if-you-were (actor receiver . message)
  '(let ((:self (self-name ,(ask-target receiver)))
	 (:message ,(ask-message message)))
	(cases (actor-of ,(ask-target actor)))))

;; DRECT's place-actor-on-name files an actor under a name. SOME hands it :self to
;; make a synonym, (synonym-for :self name), or to rename an actor (remob); given
;; a name, it must file the actor that the name stands for.
(defun place-actor-on-name (actor name)
  (general-putprop name (actor-object actor) 'actor 'non-atomic-actors))

;; SOME 666's is-any-ancestor-of, comparing actors whether given as names or not,
;; so (ask x are you a x) is true again.
(defun is-any-ancestor-of (actor other)
  (cond ((null actor) nil)
	((eq (actor-object actor) (actor-object other)) actor)
	(actor (is-any-ancestor-of (parent-of actor t) other))))

;;; -------------------------------------------------------------- 2. variable demons

;; From KEN;ODIREC 2, which follows two SCREEN methods with ";;;now for stuff to
;; make the new scheme compatible with old demon scheme". Nothing on the tapes
;; loads ODIREC, so the two methods are copied here unchanged. The 1978 Guide:
;; when a variable is recalled, the forms in (variable actions-if-recalling) are
;; evaluated and the last one's value is the answer; :old-value holds the
;; variable's own value. When it is set or changed, the forms in (variable
;; actions-if-changing) run with :new-value bound to the new value.

(define-macro-method (add ?demon to your list of (?variable actions-if-recalling)) something
 '(ask ,:self extend behavior when receiving (recall your ,variable) by doing
       (let ((:old-value (ask ,:self recall your ,variable)))
	   ,demon)))

(define-macro-method (add ?demon to your list of (?variable actions-if-changing)) something
 '(ask ,:self extend behavior when receiving ({or set change} your ,variable to ?:new-value)
       by doing
       (ask ,:self set your ,variable to ,(comma (comma :new-value)))
       ;;set it just to be compatible with old
       (let ((result ,demon))
	    (cond ((eq result no-value) :new-value)
		  (t (ask ,:self set your ,variable to ,(comma (comma result))))))))

;;; -------------------------------------------------------------- 3. database demons

;; The 1978 Guide ("Demons and Virtual Items"): the variable (first-element
;; if-recalling-items) holds (if-asked-about pattern form) entries, and (first-element
;; actions-if-memorizing) holds (if-told-about pattern form...) entries, where
;; first-element is the first element of the items concerned. Ani uses both: every
;; character memorizing that it is beautiful also memorizes that it moves
;; gracefully (CHAR), and CHAR, CONVEY, CSUMRY, PREREQ and SUGEST make virtual
;; items. In 1978 KEN1;MEMORY did this (REMEMBER, FIRE-DEMONS-THAT-MATCH,
;; POSSIBLE-VIRTUAL-ITEM, ...); it is lost, and SOME 666's database has no demons.
;;
;; The entries stay ordinary variables, as the Guide says ("Such variables can be
;; created, modified and inspected using the normal variable messages"). What
;; follows is our reading of the Guide:
;;  - if-told-about: after an item is memorized, each entry whose pattern matches
;;    it runs, with the pattern's variables bound. Storing first is what lets the
;;    Guide's pair of demons (left-of and right-of, each memorizing the other
;;    unless it is already known) stop.
;;  - if-asked-about: the entry's pattern is matched against the request (the
;;    pattern given to "recall an item matching" and the messages built on it), so
;;    its variables take the request's values, as in PREREQ's (status-of (faster ?a
;;    ?b) ?). The form then builds an item, which is used only if it matches the
;;    request ("Only items constructed that match the original request are used").
;;    Virtual items come after the real ones of the receiver and its ancestors.

;; SOME 666's memorize, with the demons fired after each item is stored, by the
;; general method and by the per-actor method it installs after the first item.
(let ((:replace-old-methods t))
     (define-method (memorize ?item) something
      (help-comments: |memorize the ITEM provided|)
      (let ((:insert-methods-at-end nil)) ;;so these go up front
	   (let ((collect-method-name
		  (ask :self do only for yourself ;;will go up the tree myself
		       when receiving (collect items)
		       (director-symbol-for-value (,item)))))
		(ask :self do only for yourself when receiving (forget item ?item)
		     (replace-second ,collect-method-name
				     (delete item (second ,collect-method-name)))
		     nil)
		(ask :self do only for yourself when receiving (memorize ?item)
		     (replace-second ,collect-method-name
				     (cons-if-not-member item (second ,collect-method-name)))
		     (fire-memorizing-demons item)
		     no-value)))
      (fire-memorizing-demons item)
      no-value))

(defun fire-memorizing-demons (item)
  (and (not (atom item))
       (mapc (function (lambda (demon)
			       (and (not (atom demon)) (eq (car demon) 'if-told-about)
				    (run-demon (cadr demon) item (cddr demon)))))
	     (ask :self recall your (,(car item) actions-if-memorizing))))
  no-value)

;; Evaluate forms with the variables of pattern bound as matching x binds them;
;; (list value) if it matched, else NIL.
(defun run-demon (pattern x forms)
  (let ((bindings (match-bindings pattern x)))
       (and bindings
	    (list (progv (mapcar 'car (cdr bindings))
			 (mapcar 'cdr (cdr bindings))
			 (do ((f forms (cdr f)) (value nil (eval (car f))))
			     ((null f) value)))))))

;; The items the receiver's if-asked-about entries make for a request.
(defun virtual-items (actor request)
  (let ((request (request-of-pattern request)))
       (cond ((or (atom request) (not (symbolp (car request))) (pattern-variable? (car request)))
	      nil)
	     (t (mapcan (function (lambda (demon)
					  (and (not (atom demon)) (eq (car demon) 'if-asked-about)
					       (run-demon (cadr demon) request (cddr demon)))))
			(ask ,actor recall your (,(car request) if-recalling-items)))))))

;; "collect items memorized matching p" asks for {and ?the-item p}.
(defun request-of-pattern (p)
  (cond ((and (not (atom p)) (eq (car p) 'director-symbol-for-and-pattern))
	 (do ((parts (cdr p) (cdr parts)))
	     ((null parts) nil)
	     (and (not (atom (car parts))) (return (request-of-pattern (car parts))))))
	(t p)))

;; SOME 666 remembers each "recall an item matching" request as a method of the
;; receiver whose pattern is the request itself, then sends the request again for
;; that method to answer. A request with a {predicate} in its pattern does not match
;; itself (COMPAR's check-the-descriptors asks for {memq ?other-descriptor ...}), so
;; it is remembered again and again without end. SOME 666's "recall each item
;; matching" avoids this by quoting the request, (director-symbol-for-quoted-pattern
;; ...), so that it matches only itself; "recall an item matching" does the same here.
;; (By August 1979, SOME 1005, both had become macro methods that remember nothing.)
(let ((:replace-old-methods t))
     (define-method {and ?the-whole-message (recall an item matching ?pattern then ?action)}
		    something
      (let ((new-actor (ask :self make)))
	   (let ((database-method-name (ask ,new-actor do when receiving ,pattern ,action)))
		(ask :self do when receiving (director-symbol-for-quoted-pattern ,the-whole-message)
		     (keep-sending-items-til-match (quote ,database-method-name) :self))
		(ask :self !,the-whole-message)))))

;; SOME 666's two database searches, each followed by the virtual items. The
;; request is the database method's pattern, with its ?variables made anonymous.
(defun keep-sending-items-til-match (database-method-name actor)
  (let ((method-predicate (method-pattern-predicate database-method-name)))
       (do ((a actor (parent-of a)))
	   ((null a)
	    (do ((i (virtual-items actor (method-pattern database-method-name)) (rest i)))
		((null i) nothing-found)
		(cond ((funcall method-predicate (first i))
		       (let ((:message (first i)))
			    (return (run-method database-method-name)))))))
	   (let ((result
		  (do ((i (ask ,a collect items) (rest i)))
		      ((null i) 'director-symbol-for-nothing-found)
		      (cond ((funcall method-predicate (first i))
			     (let ((:message (first i)))
				  (return (run-method database-method-name))))))))
		(cond ((eq result 'director-symbol-for-nothing-found)) ;;keep trying
		      (t (return result)))))))

(defun keep-sending-items-collecting-all (database-method-name actor)
  (do ((a actor (parent-of a))
       (method-predicate (method-pattern-predicate database-method-name))
       (results nil))
      ((null a)
       (do ((i (virtual-items actor (method-pattern database-method-name)) (rest i)))
	   ((null i) (nreverse results))
	   (cond ((funcall method-predicate (first i))
		  (let ((:message (first i)))
		       (push (run-method database-method-name) results))))))
      (do ((i (ask ,a collect items) (rest i)))
	  ((null i))
	  (cond ((funcall method-predicate (first i))
		 (let ((:message (first i)))
		      (push (run-method database-method-name) results)))))))

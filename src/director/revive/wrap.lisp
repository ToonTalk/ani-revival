;;; -*-lisp-*-
;;; REVIVE;WRAP: wrap one of Ken's functions, once per job, and note a repair.
;;;
;;; This file is ours, not Ken's. The revival's extensions (src/pipeline.js,
;;; EXTENSIONS) change what some of Ken's functions do by wrapping them: the new
;;; definition does its part and calls the one it replaced, as REVIVE;BRIDGE does for
;;; OBJECT's do-set-turtle-gradually (saving the old expr under a property of its
;;; own). Done by hand, that goes wrong in two ways:
;;;  - (+after-load '|ken;f >| form) evaluates form after every load of KEN;F, and at
;;;    once if KEN;F is already loaded. A hook that fires a second time without KEN;F
;;;    being loaded again (a REVIVE file loaded twice, say) would save the wrapper as
;;;    the old definition and wrap it again, and the wrapper would call itself.
;;;  - When KEN;F is loaded again, its defuns put Ken's definitions back, and the
;;;    wrapper must then go round the new one.
;;; revival-wrap handles both. Under the function's revival-wraps property it keeps
;;; an entry (id old-definition wrapper) for each wrapper, newest first; an entry is
;;; the done flag. If the function's definition is no longer the newest wrapper, its
;;; file was loaded again, and the entries are dropped.
;;;
;;; How to use it. Write the wrapper as a function of its own, with defun at top
;;; level, and wrap inside the +after-load of the Ken file that defines the function:
;;; a top-level defun of Ken's function would be undone when that file loads (and an
;;; AUTOLOAD function's file loads on first use). The wrapper is a defun, not a quoted
;;; lambda in the hook, because a quote with commas in it (the ,x of (ask ,x ...))
;;; would evaluate them when the hook runs. For example, to have INTERF's weightify
;;; read none as medium:
;;;
;;;   (defun weightify-reading-none-as-medium (value)
;;;     (funcall (revival-wrapped 'weightify 'mend2)
;;;	      (cond ((eq value 'none) 'medium) (t value))))
;;;
;;;   (+after-load '|ken;interf >|
;;;     '(revival-wrap 'weightify 'mend2 'weightify-reading-none-as-medium))
;;;
;;; (revival-wrapped 'weightify 'mend2) is the definition weightify had when mend2
;;; wrapped it: Ken's, or Ken's as wrapped by an extension loaded earlier. Wrappers of
;;; one function go round each other in the order their files are loaded, which is
;;; the registry's. The id names the wrapping; the REVIVE file's name will do.

;; Make wrapper (the name of a function) the definition of name, unless it already
;; is in this job. Only functions defined by defun (EXPRs) can be wrapped.
(defun revival-wrap (name id wrapper)
  (let ((wraps (get name 'revival-wraps))
	(current (get name 'expr)))
       (and wraps
	    (not (eq current (third (first wraps))))
	    ;;its file was loaded again, so the definition is Ken's again
	    (setq wraps nil))
       (cond ((assq id wraps) name) ;;done already
	     ((null current)
	      (shouldnt-happen 'revival-wrap (list name 'is 'not 'defined 'by 'defun)))
	     ((null (get wrapper 'expr))
	      (shouldnt-happen 'revival-wrap (list wrapper 'is 'not 'defined 'by 'defun)))
	     (t (putprop name (cons (list id current (get wrapper 'expr)) wraps) 'revival-wraps)
		(putprop name (get wrapper 'expr) 'expr)
		name))))

;; The definition name had when id wrapped it, for the wrapper to call.
(defun revival-wrapped (name id)
  (let ((entry (assq id (get name 'revival-wraps))))
       (cond (entry (second entry))
	     (t (shouldnt-happen 'revival-wrapped (list name 'was 'not 'wrapped 'by id))))))

;; What can't be wrapped this way, such as an extension of a method of one of Ken's
;; actors (define-extension-method, with ask-old) or a new actor, is done by a
;; function of its own, which revival-once calls once per job however often the hook
;; that asks for it fires:
;;
;;   (+after-load '|ken;disply >| '(revival-once 'mend6-bring-on 'extend-hits-to-bring-on))
;;
;; Once per job is once per load of the Ken file: in each job of Cinderella's run each
;; of Ken's files loads once, but DECLAR, his declarations, which loads with each.
(defun revival-once (id function)
  (cond ((get id 'revival-done) id)
	(t (putprop id t 'revival-done)
	   (funcall function)
	   id)))

;;; A repair that changes what Ken's code would have done, or does what it would
;;; have stopped on, leaves a note on the actor where it acted (a choice point, a
;;; task, a subscene): the item
;;;   (revival-repair: what W was X now Y because R)
;;; where W names the repair (narrowed, gave-up, unknown-word, ...), X is what Ken's
;;; code had or would have done, Y what the repair did instead, and R why. For
;;; instance, on (choice-point-of cinderella speed): (revival-repair: what narrowed
;;; was (not high) now medium because (variety level)). The glass box (src/pipeline.js
;;; glassBox) collects every such item of the scene, its tasks, subscenes, activities,
;;; special dynamics, choices and choice points, and of any actor noted here, under
;;; the key repairs. Memorizing an item already there adds nothing, so a repair that
;;; acts twice notes once.
(or (boundp ':revival-noted) (setq :revival-noted nil)) ;;a second load keeps the notes

(defun revival-note (note-actor note-what note-was note-now note-because)
  (ask ,note-actor memorize
       (revival-repair: what ,note-what was ,note-was now ,note-now because ,note-because))
  (or (member note-actor :revival-noted)
      (setq :revival-noted (cons note-actor :revival-noted)))
  note-actor)

;;; A helper two extensions share: APPEAR's REVIVE;LOOKS changes a look, and CHANGE's
;;; REVIVE;CHSHOW bridges how a character moves, over a time Ani gave in seconds, each a
;;; step a tick. The ticks in seconds, at least one: :frames-per-second and
;;; :ticks-per-frame are the movie's (movie.153:11, 32), as DICHAR counts them
;;; (dichar.103:105-109), so a change ends when Ani planned at 4 frames a second and at
;;; 24, and one of no seconds is a tick.
(defun ticks-in-seconds (seconds)
  (max 1 (round (*$ (float seconds) (float :frames-per-second) (float :ticks-per-frame)))))

;;; Two helpers on Director's special dynamics that CHANGE's REVIVE;CHSHOW, SLIPS'
;;; REVIVE;SLIPS8 and SLIPS9, and DETAIL's REVIVE;DTWALK share.

;; Whether dynamics take variable from ancestor, as SOME's recall your finds it
;; (some.666:115-120): none of them up to it has the variable of its own. True of the
;; ancestor itself.
(defun dynamics-have-it-from? (dynamics variable ancestor)
  (let ((ancestor (actor-of ancestor dont-autoload)))
       (do ((actor (actor-of dynamics dont-autoload) (parent-of actor t)))
	   ((null actor) nil)
	   (cond ((eq actor ancestor) (return t))
		 ((assoc variable (ask ,actor internal-recall-your-normal-variable)) (return nil))))))

;; A Director subscene a character's special dynamics are of, for a note: the subscene
;; of (special-dynamics-of c in (subscene-of s n)), or of the nearest such ancestor of
;; dynamics named otherwise (an activity's, |(special-dynamics-of c in ...)-15-1|);
;; nil if there is none, or it is no actor.
(defun subscene-of-dynamics (dynamics)
  (do ((actor dynamics (and actor (ask ,actor recall your parent))))
      ((or (null actor) (eq actor 'special-dynamics)) nil)
      (and (not (atom actor))
	   (eq (first actor) 'special-dynamics-of)
	   (return (and (actor-of (fourth actor) dont-autoload) (fourth actor))))))

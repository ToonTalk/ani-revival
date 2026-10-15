;;; -*-lisp-*-
;;; REVIVE;SLIPS1: S1, is-not looks in the task's scene; S2, is-described-as is a preference.
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged). It changes Ken's Cinderella: in the Introduction
;;; Cinderella helps her stepmother (reports/ext/slips/README.md).
;;;
;;; S1, the slip. is-not, "any sibling who meets the extra-conditions" (sugest.123:319),
;;; takes the first sibling who is part of the scene:
;;;
;;;	  (cond ((and (ask ,sibling recall if any items match
;;;			   (scene-participation: scene ,scene
;;;						 task ?)) ;;is part of the scene
;;;		      (or (null condition) ;;easy to pass the null condition
;;;			  (apply (first condition) '(,sibling !,(rest condition)))))
;;;		 (return sibling)))			(sugest.123:333-338)
;;;
;;; SCENE memorizes a character's part in the scene with the scene itself,
;;; (scene-participation: scene introduction task establish-task-1) (scene.9:463-465).
;;; But the scene is-not is given is the task: an establish task, and a convey task,
;;; asks for its suggestions with itself as the scene,
;;;
;;;	  (and (establish-suggestions (ask :self recall your task) :self)	(scene.9:380)
;;;
;;; and SUGEST hands it on as the scene through distill-suggestions, bind-convey-method
;;; and come-up-with-values to the generator (sugest.123:15-25, 91-92, 261-283). So the
;;; test never matches, and is-not always answers (no such character exists): good's
;;; helping (dscrp.17:140-145), friendly's giving (117-126) and selfish's requesting
;;; and refusing (196-206) never found anyone, in Ken's Cinderella or any story. The
;;; correction gives is-not the task's scene, which the task knows (scene.9:466).
;;;
;;; S2, the slip. good asks for (is-not ,character (is-described-as (weak good))), and
;;; is-not applies the condition's first word to the sibling, (is-described-as sibling
;;; (weak good)); but is-described-as is only the name of a generator, an actor
;;; (sugest.123:402), not a function, so with S1 alone good's helping would stop pass 2
;;; with an undefined function. And the thesis says what the condition is: "That other
;;; character should ideally be described as weak and good (and not be the character
;;; in question of course)", and "The method specifies that ideally a weak and good
;;; character should be chosen, but it will be satisfied with a character that is
;;; neither weak nor good, if need be" (AI-TR-540 p. 100, L2757-2759 and its footnote,
;;; L2768-2770). So is-not with (is-described-as words) prefers a sibling in the scene
;;; described by all of the words, then one described by any of them, then anyone in
;;; the scene. Described means the character's own description (CHAR's description:
;;; items, char.2:58-62), not a neighbor's word.
;;;
;;; What S1 newly reaches. Ken never ran is-not with a scene in it, and three methods
;;; that ask it go further now:
;;;  - friendly's giving binds a present inside the binding of the other,
;;;    (bind ((other ...)) (bind ((present (object-that-satisfies (is-desired-by
;;;    `other)))) (gives ,character `present `other))) (dscrp.17:117-126); Ken's
;;;    instaniate-convey-suggestions binds one level (sugest.123:244-255), and
;;;    evaluating the inner bind's body with only the other bound stops pass 2 ("PRESENT
;;;    unbound variable"). Here a bind inside a bind is bound in turn, the inner
;;;    bindings with the outer values, as bind-convey-method binds the outer. And no file
;;;    defines is-desired-by (SUGEST's object generators are not-owned-by and
;;;    is-described-as, sugest.123:398-402), so asking it stops pass 2 too
;;;    (NO-SUCH-ACTOR); a generator that doesn't exist comes up with no value, as one
;;;    that knows nothing does (come-up-with-values, sugest.123:276-283), and Ani gives
;;;    up the suggestion, "If Ani fails to find any character that meets the
;;;    specifications of a suggestion then the suggestion is ignored" (p. 100,
;;;    L2760-2761). Note no-such-generator.
;;;  - selfish's requesting and refusing now finds the other, and then asks
;;;    is-described-as for something valuable, which it knows nothing about: no value,
;;;    as in 1978 for hard-working's (is-described-as (difficult)) (dscrp.17:85-88), and
;;;    the suggestion is given up with Ken's warning, "cant come up with a value"
;;;    (sugest.123:271-273).
;;;  - good's helping finds someone, and becomes a convey task: (helps cinderella
;;;    step-mother) in Ken's Introduction, shown with KNOW's helps-along. Ken's
;;;    find-related-suggestions relates two convey suggestions by their verb and their
;;;    first character (convey-relationship, sugest.123:162-177), so good's helping the
;;;    stepmother and friendly's helping the Prince are "identical", and only the first,
;;;    good's, is a convey task (sugest.123:98-139, 204-210).
;;;
;;; The notes, on the task whose suggestion is being bound (the "scene" is-not is given):
;;;   (revival-repair: what is-not-in-the-scene was (no such character exists)
;;;		     now step-mother because (part-of introduction))
;;;   (revival-repair: what described-as-preferred was (weak good)
;;;		     now (step-mother anyone) because (in introduction))
;;;	 now's second word is which preference the sibling met: all, any or anyone.
;;;   (revival-repair: what no-such-generator was (is-desired-by step-mother)
;;;		     now nil because (not-defined))

;;; ------------------------------------------------- S1 and S2: is-not

;; The scene of a task, or the scene itself.
(defun scene-of-task (scene)
  (cond ((and (atom scene) scene (actor-of scene dont-autoload)
	      (ask ,scene are you a task))
	 (or (ask ,scene recall your scene) scene))
	(t scene)))

(defun first-sibling-that-satisfies-in-the-scene (condition character scene)
  (let ((ken (revival-wrapped 'first-sibling-that-satisfies 'slips1)))
       (cond ((not (slip-on? 's1)) (funcall ken condition character scene))
	     (t (let ((in (scene-of-task scene)))
		     (let ((found (cond ((described-as-condition? condition)
					 (first-sibling-described-as-preferred
					  ken character (second condition) in scene))
					(t (funcall ken condition character in)))))
			  (and (not (eq in scene))
			       (not (equal found '(no such character exists)))
			       ;;what Ken's code finds given the task, for the note
			       (let ((as-in-1978 (cond ((described-as-condition? condition)
							(funcall ken nil character scene))
						       (t (funcall ken condition character scene)))))
				    (or (equal found as-in-1978)
					(revival-note scene 'is-not-in-the-scene as-in-1978 found
						      (list 'part-of in)))))
			  found))))))

(defun described-as-condition? (condition)
  (and (not (atom condition)) (eq (first condition) 'is-described-as)))

;; S2: all of the words, then any of them, then anyone, among the siblings in scene in.
;; ken is Ken's first-sibling-that-satisfies; task is what is-not was given, for the note.
(defun first-sibling-described-as-preferred (ken character descriptors in task)
  (let ((words (cond ((atom descriptors) (list descriptors)) (t descriptors))))
       (let ((all (funcall ken (list 'described-as-all words) character in)))
	    (cond ((not (equal all '(no such character exists)))
		   (note-described-as task words all 'all in))
		  (t (let ((any (funcall ken (list 'described-as-any words) character in)))
			  (cond ((not (equal any '(no such character exists)))
				 (note-described-as task words any 'any in))
				(t (let ((anyone (funcall ken nil character in)))
					(cond ((equal anyone '(no such character exists)) anyone)
					      (t (note-described-as task words anyone 'anyone in))))))))))))

(defun note-described-as (task words sibling how in)
  (revival-note task 'described-as-preferred words (list sibling how) (list 'in in))
  sibling)

;; Conditions is-not applies to a sibling, (described-as-all sibling (weak good)).
(defun described-as-all (character words)
  (do ((w words (rest w)))
      ((null w) t)
      (or (described-as? character (first w)) (return nil))))

(defun described-as-any (character words)
  (do ((w words (rest w)))
      ((null w) nil)
      (and (described-as? character (first w)) (return t))))

;; Described as word: by the word itself, of any type, or physically by
;; physically-<word>, as DSCRP has physically-strong and its opposite physically-weak
;; (dscrp.17:232, 292). Ken's own prerequisite for stronger reads weak and strong as
;; physical descriptions (prereq.19:45-55), so a physically weak character is "described
;; as weak" (the review of stage 7: the literal word alone never matched a character
;; described (physical physically-weak)).
(defun described-as? (character word)
  (or (ask ,character recall if any items match (description: type ? descriptor ,word %))
      (ask ,character recall if any items match
	   (description: type physical
			 descriptor ,(implode (append (explodec 'physically-) (explodec word)))
			 %))))

;;; ------------------------------------------------- what S1 newly reaches

;; A bind whose body is a bind: the outer bindings come up with their values, the
;; inner bindings are made with them, and come up with theirs, and the body is made
;; with both, as bind-convey-method makes a body (sugest.123:261-274). Anything else is
;; Ken's.
(defun bind-convey-method-binding-in-turn (method bindings value scene)
  (cond ((and (slip-on? 's1) (not (atom value)) (eq (first value) 'bind))
	 (bind-in-turn method nil nil bindings value scene))
	(t (funcall (revival-wrapped 'bind-convey-method 'slips1) method bindings value scene))))

;; variables and values are those bound so far; bindings the next level's, value its body.
(defun bind-in-turn (method variables values bindings value scene)
  (let ((found (come-up-with-values (mapcar 'cadr bindings) scene)))
       (cond ((equal '(no such character exists) found) nil) ;;as Ken's, sugest.123:264
	     ((null found)
	      (warning 'bind-convey-method '(|cant come up with a value in/
| ,bindings))
	      nil)
	     (t (let ((variables (append variables (mapcar 'car bindings)))
		      (values (append values found)))
		     (cond ((and (not (atom value)) (eq (first value) 'bind))
			    (bind-in-turn method variables values
					  (eval-in-env variables values
						       (quote-allowing-eval-and-unpack (second value)))
					  (third value)
					  scene))
			   (t (replaceprop method
					   (eval-in-env variables values
							(quote-allowing-eval-and-unpack value))
					   'value))))))))

;; A generator no file defines comes up with no value.
(defun generator-defined? (condition scene)
  (cond ((or (not (slip-on? 's1)) (atom condition) (exists? (first condition))) t)
	(t (revival-note scene 'no-such-generator condition nil '(not-defined))
	   nil)))

(defun object-that-satisfies-if-defined (condition scene)
  (and (generator-defined? condition scene)
       (funcall (revival-wrapped 'object-that-satisfies 'slips1) condition scene)))

(defun activity-that-satisfies-if-defined (condition scene)
  (and (generator-defined? condition scene)
       (funcall (revival-wrapped 'activity-that-satisfies 'slips1) condition scene)))

(defun event-that-satisfies-if-defined (condition scene)
  (and (generator-defined? condition scene)
       (funcall (revival-wrapped 'event-that-satisfies 'slips1) condition scene)))

(defun character-that-satisfies-if-defined (condition scene)
  (and (generator-defined? condition scene)
       (funcall (revival-wrapped 'character-that-satisfies 'slips1) condition scene)))

;; All SUGEST's (src/director/tags/ani.lisp: AUTOLOAD from KEN;SUGEST), wrapped once it
;; has loaded. character-that-satisfies is REVIVE;MEND6's already, which this goes
;; round.
(+after-load '|ken;sugest >|
  '(progn
    (revival-wrap 'first-sibling-that-satisfies 'slips1 'first-sibling-that-satisfies-in-the-scene)
    (revival-wrap 'bind-convey-method 'slips1 'bind-convey-method-binding-in-turn)
    (revival-wrap 'object-that-satisfies 'slips1 'object-that-satisfies-if-defined)
    (revival-wrap 'activity-that-satisfies 'slips1 'activity-that-satisfies-if-defined)
    (revival-wrap 'event-that-satisfies 'slips1 'event-that-satisfies-if-defined)
    (revival-wrap 'character-that-satisfies 'slips1 'character-that-satisfies-if-defined)))

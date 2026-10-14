;;; -*-lisp-*-
;;; REVIVE;ALTER: Ani changes how a character looks during a scene, as she changes how it moves.
;;;
;;; This file is ours, not Ken's. It is part of APPEAR (src/pipeline.js, EXTENSIONS;
;;; REVIVE;APPEAR says what APPEAR does). The thesis: "The new problems for Ani, if
;;; extended in this manner, are deciding when to change a character's appearance and
;;; how the transition should be made. The first problem could be handled in much the
;;; same manner that Ani currently decides when to change the typical dynamics of
;;; character ... A dynamics change is a display method that is not treated very
;;; differently from the display methods for activities such as hitting, pushing, or
;;; chasing. For example, a suggestion for how to establish that a character is very
;;; happy is that the intensity of the colors of the character be increased"
;;; (AI-TR-540 p. 166). So a change of look is a display method, as Ken's change: and
;;; change-to: are (disply.311:1042-1132):
;;;  - look-change: (element (cinderella color-intensity), amount (positive high),
;;;    speed high): the look grows by a factor, Ken's change:'s factor for the amount
;;;    (1 + .25 times its weight, or the reciprocal for a negative amount,
;;;    disply.311:1047-1057), for a size or a color's intensity or saturation;
;;;  - look-change-to: (element (cinderella size), new-value high, speed medium): the
;;;    look becomes the new value, a size, intensity or saturation by the ratio of
;;;    their numbers (REVIVE;APPEAR's and REVIVE;COLORS's tables) as Ken's change-to:
;;;    goes by the ratio of their weights (disply.311:1063-1077), a hue round the
;;;    wheel, a shape (shape-jaggedness or shape-complexity) to the shape the experts
;;;    draw for the new value (REVIVE;SHAPES).
;;; Both are children of change-method, so SCENE runs them as it runs Ken's, without
;;; stretching them and without counting their time in the subscene's (scene.9:179-197),
;;; and CHOMET takes every one suggested, as it takes Ken's (reject-bad-value-changes,
;;; chomet.123:463-472). Their estimates are Ken's estimate-time-for-change-by
;;; (disply.311:1098-1111), and an estimate does count in its task's running time:
;;; CHOMET takes the longest of the task's methods, change methods among them
;;; (ideal-time-for-task and time-bounds-for-task, chomet.123:95-129). So a look
;;; change by an amount is planned only beside a dynamics change of the same task, by
;;; the same factor at the same speed, whose estimate it equals, as joy's is (below),
;;; and a look change to a new value, from the script, inside the activity that shows
;;; its cause (Phase 9 stage 6): it never makes a task or a subscene longer, and never
;;; stands alone, where SCENE would make the character wander around to have something
;;; to do (plan-something-if-only-changes, scene.9:211-221). The first is a rule here,
;;; not only how joy is taught: a look-change: that CHOMET leaves with no change: of
;;; its task's for the same character by the same amount at the same speed (two
;;; feelings' changes of different signs cancel each other, chomet.123:463-472) is
;;; left out, with a note (reject-bad-value-changes-looks-last, below). Running one
;;; adds what Director is to do to the
;;; subscene's (changes-for cinderella), beside Ken's (gradually change by ...):
;;;   (gradually change look by .66666667 factor for color-intensity at high speed)
;;;   (gradually change look to (look: shape star angle 144 center-offset (right 18))
;;;			       at medium speed)
;;; which REVIVE;LOOKS has Director do. Unlike Ken's run-change-to, it sets no value of
;;; the next subscene's (disply.311:1083-1086): no method asks for a look's current
;;; value there, and a look-change-to: starts from the character's look as pass 1
;;; chose it.
;;;
;;; Which looks change, and when: p. 166's example, the emotion. Joy brightens: each
;;; (establish (emotional-state cinderella (joy (positive high)))) also suggests that
;;; her colors' intensity change by the joy's amount at its speed, beside the four
;;; changes of Ken's joy that are made by the same amount at the same speed (activity
;;; level, speed, rhythmic level and acceleration, emote.9:11-36), so that the look
;;; change ends as theirs do. The thesis says it for a very happy character; that a
;;; less happy one brightens less, and a sad one, a negative joy, dims, as Ken's joy
;;; makes a sad one slower (emote.9:13-36, every amount the joy's own), is the
;;; revival's. In black and white nothing shows it; the film page paints it in color.

;;; ------------------------------------------------- the display methods

(defun define-look-change-methods ()
  (let ((:insert-methods-at-end nil))
       (define look-change: change-method
	(set your value-description to change:-package)) ;;combined as change: is
       (define look-change-to: change-method
	(set your value-description to change-to:-package))
       (define-receiver (run look-change: element ?element amount (?sign ?amount)
			     speed ?speed in ?subscene)
			look-change:
	(run-look-change element (look-change-factor sign amount) speed subscene))
       (define-receiver (estimate time for look-change: element ? amount (?sign ?amount)
				  speed ?speed in ?)
			look-change:
	;;Ken's estimate for a change: by the same amount (disply.311:1123-1130)
	(estimate-time-for-change-by (look-change-factor sign amount) speed))
       (define-receiver (run look-change-to: element ?element new-value ?new-value
			     speed ?speed in ?subscene %)
			look-change-to:
	(run-look-change-to element new-value speed subscene))
       (define-receiver (estimate time for look-change-to: element ?element new-value ?new-value
				  speed ?speed in ? %)
			look-change-to:
	(estimate-time-for-change-by (look-change-to-factor element new-value) speed))))

(+after-load '|ken;disply >| '(revival-once 'alter-methods 'define-look-change-methods))

;; Both are top-level actors of ours defined once DISPLY has loaded, so the tags give
;; them DISPLY as their file, as load.33 fills them for Ken's.
(defprop look-change: |KEN;DISPLY| actor-load)
(defprop look-change-to: |KEN;DISPLY| actor-load)

;; Ken's change:'s factor (disply.311:1052-1056).
(defun look-change-factor (sign amount)
  (cond ((eq sign 'positive) (+$ 1.0 (*$ .25 (weightify amount))))
	((eq sign 'negative) (//$ (+$ 1.0 (*$ .25 (weightify amount)))))
	(t (shouldnt-happen 'look-change: '(bad sign ,sign of ,amount)))))

;; As run-change-to adds Ken's (disply.311:1079-1096): what Director is to do, to the
;; subscene's changes for the character.
(defun run-look-change (element factor speed subscene)
  (ask ,subscene
       add (gradually change look by ,factor factor for ,(second element) at ,speed speed)
       to your list of (changes-for ,(first element)))
  nil)

;; A look-change-to: is a change by a factor for an element read as a number, and a
;; change to another look, a hue or a shape, for the others.
(defun run-look-change-to (element new-value speed subscene)
  (let ((character (first element))
	(element-name (second element)))
       (cond ((get element-name 'appearance-numbers)
	      (run-look-change element (look-change-to-factor element new-value) speed subscene))
	     (t (ask ,subscene
		     add (gradually change look to ,(look-after character element-name new-value)
				   at ,speed speed)
		     to your list of (changes-for ,character))
		nil))))

;; How much a look-change-to: changes the number of an element read as one: the ratio
;; of the new value's to the character's look's, as pass 1 chose it; for a hue or a
;; shape, e, one e-fold of Ken's, the time any change takes to grow by e at its speed
;; (interf.149:916, "takes 5 seconds to normal e times an element").
(defun look-change-to-factor (element new-value)
  (let ((numbers (get (second element) 'appearance-numbers)))
       (cond ((null numbers) (exp 1.0))
	     (t (let ((now (look-number-now (first element) (second element)))
		      (then (second (assq new-value numbers))))
		     (cond ((or (null now) (null then)) 1.0)
			   (t (//$ (float then) (float now)))))))))

;; A character's look's number for an element, as pass 1 chose it (KEN;CP's
;; (appearance-of cinderella)).
(defun look-number-now (character element-name)
  (let ((appearance '(appearance-of ,character)))
       (and (exists? appearance)
	    (cond ((eq element-name 'size) (ask ,appearance recall your ani-size))
		  ((eq element-name 'color-saturation)
		   (second (ask ,appearance recall your look-color)))
		  ((eq element-name 'color-intensity)
		   (third (ask ,appearance recall your look-color)))))))

;; The look a character is to change to: (look: hue blue), or the shape the experts
;; draw for its shape elements with the new value (REVIVE;SHAPES), (look: shape star
;; angle 144 center-offset (right 18)).
(defun look-after (character element-name new-value)
  (cond ((eq element-name 'color-hue) '(look: hue ,new-value))
	(t (let ((shape (shape-after character element-name new-value)))
		(cond ((null shape)
		       (shouldnt-happen 'look-change-to: '(no shape for ,character with ,element-name ,new-value)))
		      (t '(look: shape ,(get shape 'name)
				 angle ,(get shape 'angle)
				 center-offset ,(get shape 'center-offset))))))))

;; The first shape the experts offer for the character's shape as drawn, with the one
;; element now the new value.
(defun shape-after (character element-name new-value)
  (let ((constraints
	 (mapcar (function
		  (lambda (element)
			  '(constraint: element ,element
					value ,(cond ((eq element element-name) new-value)
						     (t (drawn-value character element)))
					justification 0
					choice-point nil)))
		 '(shape-jaggedness shape-complexity))))
       (second (first (shapes-offered constraints)))))

;; A task's look changes come after its other methods. CHOMET takes the changes
;; suggested in the order they were suggested, newest first (reject-bad-value-changes,
;; chomet.123:463-472), and joy's look change is taught after Ken's own (below), so it
;; would come first, and SCENE, which runs a task's methods in that order
;; (scene.9:170-183), would run it first. Nothing about how the subscene is planned or
;; filmed depends on the order, but what the program says does: each of the
;; subscene's variables is written in the order it was first set, and Ken's change
;; methods set its initial-actions before its (changes-for cinderella)
;; (disply.311:1087-1095). Coming last, the look change leaves the program as Ken's
;; code writes it, with its own (gradually change look ...) added to the character's
;; changes, at the front, where add puts the newest (as the last of Ken's own changes
;; run is the first written). And a look-change: is kept only beside a change: of the
;; task's own for the same character, by the same amount at the same speed, whose
;; estimate it equals (see the top of this file); one left alone, its changes all set
;; aside by CHOMET, is left out, with a note on the task:
;;   (revival-repair: what look-change-alone
;;		     was (look-change: element (cinderella color-intensity) amount (positive high)
;;				 speed high)
;;		     now left-out
;;		     because (no change of how it moves by the same amount at the same speed))
(defun reject-bad-value-changes-looks-last (suggestions task)
  (funcall (revival-wrapped 'reject-bad-value-changes 'alter) suggestions task)
  (let ((choices (ask ,task recall your current-choice)))
       (let ((looks (mapcan (function (lambda (m) (and (look-change-method? m) (list m)))) choices))
	     (others (mapcan (function (lambda (m) (and (not (look-change-method? m)) (list m))))
			     choices)))
	    (and looks
		 (ask ,task set your current-choice to
		      ,(append others
			       (mapcan (function
					(lambda (look)
						(cond ((look-change-paired? look others) (list look))
						      (t (revival-note task 'look-change-alone look 'left-out
								       '(no change of how it moves by the same amount at the same speed))
							 nil))))
				       looks)))))))

(defun look-change-method? (method)
  (and (not (atom method)) (memq (first method) '(look-change: look-change-to:))))

;; Whether a look change has a change: of the task's beside it for the same character,
;; by the same amount at the same speed. A look-change-to: is paired otherwise, with
;; the activity that shows its cause (Phase 9 stage 6), and is kept.
(defun look-change-paired? (look methods)
  (or (not (eq (first look) 'look-change:))
      (do ((m methods (rest m)))
	  ((null m) nil)
	  (let ((method (first m)))
	       (and (not (atom method))
		    (eq (first method) 'change:)
		    (eq (first (get method 'element)) (first (get look 'element)))
		    (equal (get method 'amount) (get look 'amount))
		    (eq (get method 'speed) (get look 'speed))
		    (return t))))))

(+after-load '|ken;chomet >|
  '(revival-wrap 'reject-bad-value-changes 'alter 'reject-bad-value-changes-looks-last))

;;; ------------------------------------------------- joy brightens

(defun teach-joy-to-brighten ()
  (ask joy process suggestions
       (for (establish (emotional-state ?character (joy ?joy-level)))
	    '(method: type display-value-change
		      value (look-change: element (,character color-intensity)
					  amount ,joy-level
					  speed ,(second joy-level)))
	    strength 'medium)))

(+after-load '|ken;emote >| '(revival-once 'alter-joy 'teach-joy-to-brighten))

;; Each piece of knowledge of when a look changes, for the glass box and
;; tools/check-appear.mjs: (feeling element evidence).
(setq :look-change-knowledge
      '((joy color-intensity
	 (and (thesis 166 |a suggestion for how to establish that a character is very happy is that the intensity of the colors of the character be increased|)
	      (why |a less happy character brightens less, and a sad one dims, by the joy's own amount at its speed, as each of Ken's changes for joy is made (emote.9:11-36)|)))))

;;; ------------------------------------------------- for the glass box

;; Every look change pass 2 planned in a scene: for each of its tasks whose methods
;; include one, (task subscene method change), change what the subscene's changes for
;; the character have Director do (src/pipeline.js glassBox, lookChanges).
(defun look-changes-in (scene)
  (mapcan (function
	   (lambda (task)
		   (let ((subscene (ask ,task recall your subscene)))
			(mapcan (function
				 (lambda (method)
					 (and (look-change-method? method)
					      (list (list task subscene method
							  (look-change-made subscene method))))))
				(append (ask ,task recall your current-choice) nil)))))
	  (append (ask ,scene recall your establish-tasks)
		  (ask ,scene recall your convey-tasks))))

;; What the method added to the subscene's changes for its character: the first look
;; change there for its element.
(defun look-change-made (subscene method)
  (let ((element (get method 'element)))
       (and (exists? subscene)
	    (do ((c (ask ,subscene recall your (changes-for ,(first element))) (rest c)))
		((null c) nil)
		(let ((change (first c)))
		     (and (eq (first change) 'gradually)
			  (eq (third change) 'look)
			  (or (memq (second element) change)
			      (and (eq (fourth change) 'to)
				   (not (get (second element) 'appearance-numbers))))
			  (return change)))))))

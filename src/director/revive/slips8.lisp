;;; -*-lisp-*-
;;; REVIVE;SLIPS8: S8, a character's dynamics take their parent's factors once.
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged). It changes Ken's Cinderella: in Kept Apart the
;;; standing guard no longer slows down cycle by cycle, and in Justice the stepmother's
;;; second walk is as slow as her first (reports/ext/slips/README.md).
;;;
;;; The slip. A director-character has a demon on its special dynamics: whenever they
;;; are set, each factor of the new dynamics' own, (speed factor) and the like, is
;;; multiplied by their parent's:
;;;
;;;  (add (progn
;;;	  (ask ,:new-value multiply each of your variables matching (? factor) by those in
;;;	       ,(ask ,:new-value recall your parent))
;;;	  :new-value)
;;;	 to your list of (special-dynamics actions-if-changing)))	(dichar.103:27-31)
;;;
;;; So a walk's dynamics, written in the program as a factor of their parent's, (speed
;;; factor) 0.8 under the subscene's, move at 0.8 of the subscene's speed; and a change
;;; that grows the dynamics of the character's scene is "carried forth with the help of
;;; the demon" into dynamics set later (dichar.103:112-115). But the multiplication is
;;; made into the dynamics' own factor, and the same dynamics are set again whenever an
;;; activity is repeated: the standing guard's walks in Kept Apart, the stepmother's in
;;; Justice. Each time, the factor already multiplied is multiplied by the parent's
;;; again, and a parent's factor of 0.71 slows the guard by nearly a third each cycle:
;;; in 1978 Cinderella's speed factor in the guard's first walk goes 0.34, 0.24, 0.17,
;;; 0.12 in four cycles, and the stepmother's 0.71, 0.51, 0.36, 0.26 (a probe of the
;;; demon, reports/ext/slips/README.md). The parent's factor is meant once: the thesis
;;; tells the guard's cycle as one cycle repeated (AI-TR-540 p. 66, L1890-1894), and
;;; asks how it should change as an animator would, "As the cycle of the prisoner
;;; escaping and the guard blocking is repeated how should it change? Should the
;;; movements speed up?" (p. 182, L4755-4757), knowledge Ani doesn't have.
;;;
;;; The correction. The first time dynamics are set, the demon multiplies as Ken's
;;; does, and the parent's factors it used are kept. When the same dynamics are set
;;; again, each factor is divided by the parent's factor used before and multiplied by
;;; the parent's now: the parent's factor once, as it is now, so that a change the
;;; parent has grown since is carried forth, as Ken meant, and what the dynamics' own
;;; factor has grown by meanwhile (a change carried by the character's own dynamics,
;;; dichar.103:118-121) is kept. A factor the dynamics gained after they were first set
;;; (a change made it their own) is already the parent's times the change, and is left.
;;;
;;; A change counted once. Ken's gradual change grows the factor of the special
;;; dynamics of her scene with its first repeat, so that it is carried forth, and of the
;;; dynamics she walks with now with its second (dichar.103:110-121). When her walk's
;;; parent has the factor from the scene's (REVIVE;WRAP's dynamics-have-it-from?), as a
;;; walk of the scene's own dynamics does, the one change grows the walk's own factor
;;; and its parent's alike; set again, the walk would take it twice, once in its own
;;; factor and once in the parent's now, as Ken's demon takes it. So the growth the
;;; second repeat gives dynamics whose parent the first repeat grows by the same rate is
;;; kept, and divided out when they are set again: the change once, through the parent.
;;; (In Justice the stepmother's sadness, grown into her walk and into her scene's
;;; dynamics, 0.67, made her second walk 0.45, 0.67 taken twice, as in 1978, until this
;;; was added after the review of stage 7; test/slips.test.js sets a walk again after a
;;; change grown into both.) REVIVE;CHSHOW's bridge has the same two repeats, and its
;;; second is kept the same way.
;;;
;;; The note, on the Director subscene of the dynamics (REVIVE;WRAP's
;;; subscene-of-dynamics), once for each dynamics set again whose factors Ken's demon
;;; would have multiplied again by something other than 1, the first time it would
;;; have: for each factor, what Ken's code would have taken again (the parent's factor
;;; used before, times a change the parent carries that the dynamics had grown by too),
;;; and the dynamics; and, if a change would have been taken twice, that growth:
;;;   (revival-repair: what factors-once was (((speed factor) 0.71225863))
;;;		     now once because (set-again |(special-dynamics-of ...)-12-1|))
;;;   (revival-repair: what factors-once was (((speed factor) 0.67027663))
;;;		     now once because (set-again |(special-dynamics-of ...)-3|
;;;				       (a-change-taken-twice (((speed factor) 0.67027663)))))

;; For each dynamics multiplied so far: (dynamics (variable . parent's value used) ...);
;; for each dynamics a change has grown with the parent it has the factor from, since
;; they were last set: (dynamics (variable . growth) ...); and the dynamics noted.
(or (boundp ':slips8-used) (setq :slips8-used nil))
(or (boundp ':slips8-carried) (setq :slips8-carried nil))
(or (boundp ':slips8-noted) (setq :slips8-noted nil))

(defun teach-dynamics-to-take-factors-once ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(multiply each of your variables matching ?variable-pattern by those in ?other)
	special-dynamics
	(let ((used (assoc :self :slips8-used)))
	     (cond ((or (not (slip-on? 's8)) (null used))
		    (ask-old :self multiply each of your variables matching ,variable-pattern
			     by those in ,other)
		    (and (slip-on? 's8)
			 (setq :slips8-used
			       (cons (cons :self (factors-of :self variable-pattern other))
				     :slips8-used))))
		   (t (take-factors-once :self variable-pattern other used)))))))

(+after-load '|ken;interf >| '(revival-once 'slips8-factors-once 'teach-dynamics-to-take-factors-once))

;; REVIVE;CHSHOW's bridge, when CHANGE is loaded (before SLIPS, in the registry's order,
;; so its receiver is there): its second repeat's growth is kept as the gradual
;; change's is (REVIVE;SLIPS9).
(defun teach-the-bridge-to-count-a-change-once ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (multiply your own dynamics factor for ?element by ?rate)
	director-character
	(let ((own (ask :self recall your special-dynamics))
	      (scene-dynamics (ask :self recall your special-dynamics-for-current-scene)))
	     (or (dynamics-have-it-from? own (list element 'factor) scene-dynamics)
		 (note-growth-the-parent-carries own (list element 'factor) rate
						 (list scene-dynamics)))
	     (ask-old :self multiply your own dynamics factor for ,element by ,rate)))))

(+after-load '|ken;dichar >|
  '(and (get 'define-the-bridge-for-director 'expr)
	(revival-once 'slips8-bridge-once 'teach-the-bridge-to-count-a-change-once)))

;; ((variable . other's value) ...) for each variable of dynamics' own matching pattern.
(defun factors-of (dynamics pattern other)
  (mapcan (function
	   (lambda (variable)
		   (and (match variable pattern)
			(list (cons variable (or (ask ,other recall your ,variable) 1.0))))))
	  (ask ,dynamics list all your variable names)))

;; A change's second repeat is about to grow dynamics' own variable by rate, its first
;; growing the scene's dynamics by the same rate (and S13's repeats the dynamics that
;; carry it to her walks, REVIVE;SLIP13), grown being those: if the dynamics' parent has
;; the variable from one of them, the parent's factor carries this growth too, and it
;; is kept, to be divided out when the dynamics are set again (take-factors-once).
(defun note-growth-the-parent-carries (dynamics variable rate grown)
  (and (slip-on? 's8)
       dynamics
       (assoc dynamics :slips8-used)
       (have-it-from-any? (ask ,dynamics recall your parent) variable grown)
       (let ((entry (assoc dynamics :slips8-carried)))
	    (or entry
		(setq :slips8-carried
		      (cons (setq entry (list dynamics)) :slips8-carried)))
	    (let ((growth (assoc variable (rest entry))))
		 (cond (growth (rplacd growth (*$ (rest growth) (float rate))))
		       (t (rplacd entry (cons (cons variable (float rate)) (rest entry)))))))))

;; Whether dynamics take variable from any of grown (the scene's dynamics, and S13's
;; dynamics that carry the change to her walks): REVIVE;WRAP's dynamics-have-it-from?,
;; for each.
(defun have-it-from-any? (dynamics variable grown)
  (do ((g grown (rest g)))
      ((null g) nil)
      (and (first g) (dynamics-have-it-from? dynamics variable (first g)) (return t))))

;; Set again: each factor kept as the parent's used before times the dynamics' own (and
;; a change the parent carries that they have grown by too), now the parent's now times
;; the dynamics' own; used is (dynamics . ((variable . value) ...)).
(defun take-factors-once (dynamics pattern other used)
  (let ((again nil)
	(twice nil)
	(carried (assoc dynamics :slips8-carried)))
       (mapc (function
	      (lambda (variable)
		      (and (match variable pattern)
			   (let ((before (assoc variable (rest used)))
				 (now (or (ask ,other recall your ,variable) 1.0))
				 (growth (or (rest (assoc variable (rest carried))) 1.0)))
				(cond (before
				       (let ((taken (*$ (rest before) growth)))
					    (or (= taken 1.0)
						(setq again (cons (list variable taken) again)))
					    (or (= growth 1.0)
						(setq twice (cons (list variable growth) twice)))
					    (ask ,dynamics set your ,variable to
						 ,(*$ (//$ (ask ,dynamics recall your ,variable) taken)
						      now)))
				       (rplacd before now))
				      (t (rplacd used (cons (cons variable now) (rest used)))))))))
	     (ask ,dynamics list all your variable names))
       (and carried (rplacd carried nil))
       (and again
	    (not (member dynamics :slips8-noted))
	    (subscene-of-dynamics dynamics)
	    (setq :slips8-noted (cons dynamics :slips8-noted))
	    (revival-note (subscene-of-dynamics dynamics) 'factors-once (nreverse again) 'once
			  (cond (twice (list 'set-again dynamics
					     (list 'a-change-taken-twice (nreverse twice))))
				(t (list 'set-again dynamics)))))))

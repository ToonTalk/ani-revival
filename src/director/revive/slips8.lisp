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
;;; The note, on the Director subscene of the dynamics (REVIVE;SLIPS subscene-of-dynamics),
;;; once for each dynamics set again whose factors Ken's demon would have multiplied again
;;; by something other than 1, the first time it would have: the factors Ken's code would
;;; have applied again, and the dynamics:
;;;   (revival-repair: what factors-once was (((speed factor) 0.71225863))
;;;		     now once because (set-again |(special-dynamics-of ...)-12-1|))

;; For each dynamics multiplied so far: (dynamics (variable . parent's value used) ...);
;; and the dynamics noted.
(or (boundp ':slips8-used) (setq :slips8-used nil))
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

;; ((variable . other's value) ...) for each variable of dynamics' own matching pattern.
(defun factors-of (dynamics pattern other)
  (mapcan (function
	   (lambda (variable)
		   (and (match variable pattern)
			(list (cons variable (or (ask ,other recall your ,variable) 1.0))))))
	  (ask ,dynamics list all your variable names)))

;; Set again: each factor kept as the parent's used before times the dynamics' own, now
;; the parent's now times the dynamics' own; used is (dynamics . ((variable . value) ...)).
(defun take-factors-once (dynamics pattern other used)
  (let ((again nil))
       (mapc (function
	      (lambda (variable)
		      (and (match variable pattern)
			   (let ((before (assoc variable (rest used)))
				 (now (or (ask ,other recall your ,variable) 1.0)))
				(cond (before
				       (or (= (rest before) 1.0)
					   (setq again (cons (list variable (rest before)) again)))
				       (ask ,dynamics set your ,variable to
					    ,(*$ (//$ (ask ,dynamics recall your ,variable)
						      (rest before))
						 now))
				       (rplacd before now))
				      (t (rplacd used (cons (cons variable now) (rest used)))))))))
	     (ask ,dynamics list all your variable names))
       (and again
	    (not (member dynamics :slips8-noted))
	    (subscene-of-dynamics dynamics)
	    (setq :slips8-noted (cons dynamics :slips8-noted))
	    (revival-note (subscene-of-dynamics dynamics) 'factors-once (nreverse again) 'once
			  (list 'set-again dynamics)))))

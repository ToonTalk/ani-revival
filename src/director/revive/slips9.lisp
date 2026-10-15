;;; -*-lisp-*-
;;; REVIVE;SLIPS9: S9, S10 and S11, Director's gradual change as Ani plans it.
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged). It changes Ken's Cinderella: every feeling
;;; changes how her characters move at the pace Ani planned (reports/ext/slips/README.md).
;;;
;;; Ken's gradual change, which runs every change Ani plans for how a character moves,
;;; the changes of joy among them (run-change-to, disply.311:1079-1096):
;;;
;;; (define-receiver (gradually change by ?factor factor for ?element at ?speed speed %followup)
;;;		 director-character
;;;  ;;slowly change the element factor by factor at speed (clear huh?)
;;;  (let ((ticks-to-grow-e
;;;	 (*$ (ask dynamic-constants recall your time-to-grow-e-times)
;;;	     (weightify speed)
;;;	     (float :frames-per-second)
;;;	     (float :ticks-per-frame))))
;;;       (let ((growth-rate (cond ((> factor 1.0) (expt :e (//$ ticks-to-grow-e)))
;;;				(t (expt (//$ :e) (//$ ticks-to-grow-e))))))
;;;	    (ask ,(ask :self recall your special-dynamics-for-current-scene)
;;;		 ;;so that if changing special-dynamics in the scene this change is
;;;		 ;;carried forth with the help of the demon on special-dynamics
;;;		 ;;in director-character
;;;		 repeat (multiply your (,element factor) by ,growth-rate)
;;;		 ,(round (*$ ticks-to-grow-e (abs (log factor)))) times !,followup)
;;;	    (ask ,:self
;;;		 repeat (ask your special-dynamics to
;;;			     multiply your (,element factor) by ,growth-rate)
;;;		 ,(round (*$ ticks-to-grow-e (abs (log factor)))) times))))
;;;							(dichar.103:102-121)
;;;
;;; S9, the speed. "time-to-grow-e-times ... takes 5 seconds to normal e times an
;;; element" (interf.149:916). DISPLY estimates a change's time from it, and divides by
;;; the speed's weight, so that a change at high speed is quick:
;;;
;;;	(t (let ((time-to-grow-e
;;;		 (//$ (ask dynamic-constants recall your time-to-grow-e-times)
;;;		      (weightify speed))))			(disply.311:1104-1106)
;;;
;;; and that estimate is how long the task takes, and its subscene (chomet.123:95-129).
;;; Director multiplies by the weight: a change at high speed (weight 2) runs four times
;;; as long as Ani planned, and one at low speed (weight .5) a quarter as long. The run
;;; (tools/check-slips.mjs --speed, REVIVE;SLIPS) confirms it for every change of Ken's
;;; Cinderella. The correction divides, as DISPLY does: a high speed is quick. A joy at a
;;; high level changes at high speed (emote.9:13-36), so a very happy or very sad
;;; character changes quickly and a slightly happy one slowly, as Ani planned.
;;;
;;; S10, the double growth (stage 6's finding 1, reports/ext/change/README.md). The two
;;; repeats grow the factor of the special dynamics of the character's scene, so that
;;; dynamics set later carry the change, and of the character's own dynamics. Own
;;; dynamics that have no factor of their own for the element take it from the scene's
;;; (SOME's recall your, some.666:115-120), which the first repeat has grown: the second
;;; repeat then grows it again, into a factor of their own, and they go a step ahead;
;;; and when she stands with the scene's own dynamics, both repeats grow the one factor,
;;; every tick, and the change goes twice as far, 2.718^(27/10) for a change by 4 at
;;; medium speed where 2.718^(27/20) was meant (test/change.test.js). The correction:
;;; the second repeat grows her own dynamics only if they don't take the factor from the
;;; scene's, as REVIVE;CHSHOW's bridge does.
;;;
;;; S11, the count. SOME's repeat does its message one time fewer than it counts:
;;;
;;; (define-method (repeat ?message ?number times %followup) something
;;;  (help-comments:
;;;   |do the MESSAGE and plan for the next tick to repeat one less time the MESSAGE|)
;;;   (cond ((> number 1)
;;;	  (ask :self !,message)
;;;	  (ask :self plan next repeat ,message ,(1- number) times !,followup))
;;;	 (t (cond ((eq (first followup) 'then) (ask :self !,(rest followup)))))))
;;;							(some.666:444-450)
;;;
;;; asked to repeat once it does only the followup, against its own help comment, and
;;; against its neighbor, repeat ... every so many ticks, which does the message and
;;; then counts (some.666:435-442). Ken corrected it himself: his SOME of August 1979
;;; (tape 9004336) repeats while the number is above none, so a message asked to be
;;; repeated once is done once:
;;;
;;; (define-method (sequentially (repeat ?message ?number times) %followup) something
;;;  (help-comments (pattern-is (repeat ?message ?number times))
;;;   |do the MESSAGE and when finished plan on the next tick to repeat one less time the MESSAGE|)
;;;   (let ((number (fix number)))
;;;	  (cond ((> number 0)
;;;		 (ask ,myself sequentially
;;;		      ,message
;;;		      (plan next repeat ,message ,(1- number) times)
;;;		      !,followup)))))			(9004336 some.1005:751-759)
;;;
;;; So a change of a tick, the Introduction's joys at low speed in 1978, doesn't change
;;; anything, and every other change stops a step short of its factor. Ken's Director
;;; uses this repeat only here; the correction asks it to repeat once more than the
;;; steps the change counts, so the change takes them all and reaches its factor, as his
;;; own later repeat would. (REVIVE;LOOKS and REVIVE;CHSHOW count their own steps so.)
;;;
;;; With APPEAR, a look change Ani pairs with a change of how a character moves by the
;;; same factor at the same speed takes as many ticks as it (REVIVE;LOOKS
;;; look-change-ticks, which counts as dichar.103:105-117 does); with S9 it counts the
;;; ticks as corrected, so the two still end together.
;;;
;;; The notes, on the Director subscene of the dynamics of the character's scene:
;;;   S9   (revival-repair: what change-at-its-speed
;;;		was (step-mother path-curvature by 4 at high speed in 55 ticks)
;;;		now (in 14 ticks) because (disply estimates 3.4657 seconds))
;;;   S10  (revival-repair: what grown-once was (step-mother speed twice a tick)
;;;		now (once a tick) because (has-it-from (special-dynamics-of ...)))
;;;	 once for each character and element, the first tick the second repeat is skipped
;;;   S11  (revival-repair: what change-steps was (0 steps of 1)
;;;		now (1 steps) because (step-mother speed))
;;; (Notes are left in Director's job; a scene's glass box from pass 2 has none of these.)

;; DICHAR's ticks to grow e times at a speed: as corrected (S9), or as Ken's.
(defun gradual-change-ticks-to-grow-e (speed)
  (*$ (cond ((slip-on? 's9)
	     (//$ (ask dynamic-constants recall your time-to-grow-e-times) (weightify speed)))
	    (t (*$ (ask dynamic-constants recall your time-to-grow-e-times) (weightify speed))))
      (float :frames-per-second)
      (float :ticks-per-frame)))

;; Ken's ticks, for the S9 note.
(defun kens-gradual-change-ticks (factor speed)
  (round (*$ (*$ (ask dynamic-constants recall your time-to-grow-e-times)
		 (weightify speed)
		 (float :frames-per-second)
		 (float :ticks-per-frame))
	     (abs (log factor)))))

(defun teach-gradual-change-as-planned ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (gradually change by ?factor factor for ?element at ?speed speed %followup)
			director-character
	(let ((ticks-to-grow-e (gradual-change-ticks-to-grow-e speed)))
	     (let ((growth-rate (cond ((> factor 1.0) (expt :e (//$ ticks-to-grow-e)))
				      (t (expt (//$ :e) (//$ ticks-to-grow-e)))))
		   (steps (round (*$ ticks-to-grow-e (abs (log factor)))))
		   (scene-dynamics (ask :self recall your special-dynamics-for-current-scene))
		   ;; the part the change runs in, for S13 (REVIVE;SLIP13)
		   (part (part-of-change :self)))
		  (let ((count (cond ((slip-on? 's11) (1+ steps)) (t steps)))
			;; S13: the dynamics that carry the factor to her walks of the part
			(carriers (and (slip-on? 's13)
				       (carriers-of-change :self (list element 'factor) part
							   scene-dynamics))))
		       (note-gradual-change :self scene-dynamics factor element speed steps count)
		       (note-carried-forth :self element scene-dynamics carriers part)
		       (ask ,scene-dynamics
			    repeat (multiply your (,element factor) by ,growth-rate)
			    ,count times !,followup)
		       (mapc (function
			      (lambda (carrier)
				      (ask ,carrier
					   repeat (multiply your (,element factor) by ,growth-rate)
					   ,count times)))
			     carriers)
		       (ask ,:self
			    repeat (grow your own dynamics factor for ,element by ,growth-rate
					 carried by ,carriers)
			    ,count times)))))
       ;; the second repeat's step: Ken's, unless S10 and her own dynamics take the
       ;; factor from the scene's, or S13 and they take it from dynamics that carry the
       ;; change to her walks (REVIVE;SLIP13), which grow as the scene's do; a step whose
       ;; growth her walk's parent has too is kept by S8, to be counted once when the
       ;; walk is set again (REVIVE;SLIPS8)
       (define-receiver (grow your own dynamics factor for ?element by ?growth-rate
			      carried by ?carriers)
			director-character
	(let ((own (ask :self recall your special-dynamics))
	      (scene-dynamics (ask :self recall your special-dynamics-for-current-scene))
	      (variable (list element 'factor)))
	     (cond ((and (slip-on? 's10)
			 (dynamics-have-it-from? own variable scene-dynamics))
		    (let ((subscene (subscene-of-dynamics scene-dynamics)))
			 (and subscene
			      (revival-note subscene 'grown-once
					    (list (name-of :self) element 'twice 'a 'tick)
					    '(once a tick)
					    (list 'has-it-from scene-dynamics)))))
		   ((and carriers (have-it-from-any? own variable carriers)))
		   (t (note-growth-the-parent-carries own variable growth-rate
						      (cons scene-dynamics carriers))
		      (ask :self ask your special-dynamics to
			   multiply your (,element factor) by ,growth-rate)))))))

(+after-load '|ken;dichar >| '(revival-once 'slips9-gradual-change 'teach-gradual-change-as-planned))

(defun note-gradual-change (character scene-dynamics factor element speed steps count)
  (let ((subscene (subscene-of-dynamics scene-dynamics))
	(who (name-of character)))
       (cond (subscene
	      (and (slip-on? 's9)
		   (not (= steps (kens-gradual-change-ticks factor speed)))
		   (revival-note subscene 'change-at-its-speed
				 (list who element 'by factor 'at speed 'speed 'in
				       (kens-gradual-change-ticks factor speed) 'ticks)
				 (list 'in steps 'ticks)
				 (list 'disply 'estimates
				       (*$ (//$ (ask dynamic-constants recall your time-to-grow-e-times)
						(weightify speed))
					   (abs (log factor)))
				       'seconds)))
	      (and (slip-on? 's11)
		   (revival-note subscene 'change-steps
				 (list (max 0 (1- steps)) 'steps 'of steps)
				 (list steps 'steps)
				 (list who element)))))))

;; With APPEAR, its look changes count their ticks as the dynamics' changes do.
(defun look-change-ticks-at-the-speed-planned (factor speed)
  (cond ((slip-on? 's9)
	 (round (*$ (gradual-change-ticks-to-grow-e speed) (abs (log (float factor))))))
	(t (funcall (revival-wrapped 'look-change-ticks 'slips9) factor speed))))

(and (get 'look-change-ticks 'expr)
     (revival-wrap 'look-change-ticks 'slips9 'look-change-ticks-at-the-speed-planned))

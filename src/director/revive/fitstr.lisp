;;; -*-lisp-*-
;;; REVIVE;FITSTR: S16, a stretched walk takes its stretch once; and S8 (REVIVE;SLIPS8)
;;; counting a change once in Ken's own gradual change.
;;;
;;; This file is ours, not Ken's. It is part of FIT (src/pipeline.js, EXTENSIONS; REVIVE;FIT
;;; says what FIT is), by Ken's decision 13 (17 October 2026): "yes, correct the stretch
;;; and S8 too except when in the mode of keeping it to the 1978 version". So FIT, on
;;; with the revival's extensions and never in "Ani as in 1978", also loads REVIVE;SLIPS8
;;; (S8: a character's dynamics take their parent's factors once, however often they are
;;; set, dichar.103:27-31) and this file; SLIPS, which requires FIT, has them too. Why in
;;; FIT: FIT is what makes a scene's stretches large (No Longer Kept Apart's accompanying,
;;; stretched by 2.51 to fill its 10 seconds), and a stretch taken twice, or compounded
;;; cycle by cycle by S8's slip, undoes what FIT keeps: the scene's time is kept, but the
;;; walk that fills it goes an eighth as far (reports/ext/fit/README.md).
;;;
;;; S16, the slip. SCENE stretches a part's activity by making the walks' dynamics slower
;;; or faster, with PLACE's
;;;
;;; (define-function multiply-dynamics-by-factor (special-dynamics factor)
;;;  (let ((new-dynamics (ask ,special-dynamics make interned offspring)))
;;;       (ask ,new-dynamics set your (speed factor) to
;;;	   ,(*$ factor
;;;		(or (ask ,special-dynamics recall your (speed factor)) 1.0)))
;;;       new-dynamics))						(place.45:455-461)
;;;
;;; which writes into the new dynamics' own factor its parent's too: in pass 2 a factor of
;;; one's own is the factor (SOME's recall finds it, interf.149:845-847). But Director's
;;; demon on a character's special dynamics multiplies each factor by the parent's the
;;; first time they are set (dichar.103:27-31), as a factor written for a walk is a factor
;;; of its parent's. So a walk made by multiply-dynamics-by-factor from dynamics with a
;;; factor of their own takes that factor twice: the fairy godmother's accompanying in No
;;; Longer Kept Apart, stretched by 2.51 (its dynamics 0.398, its walk 0.8 of that,
;;; 0.3184), walks at 0.3184 times 0.398, 0.13 of her speed; Kept Apart's guard walks at
;;; 0.71 squared of the speed DISPLY planned (disply.311:421-427).
;;;
;;; S16, the correction. Pass 2 writes as Ken's does, and the new dynamics also keep the
;;; parent's factor written into them, (speed from-parent) (a variable the demon's pattern,
;;; (? factor), doesn't match). In Director, the first time such dynamics are set, the
;;; parent's factor is divided out of their own before the demon multiplies it in: the
;;; stretch once. A note, on the Director subscene of the dynamics:
;;;   (revival-repair: what stretch-once was 0.3184 now 0.8
;;;		     because (the-parents-factor-in-it 0.398 |(special-dynamics-of ...)-14-1|))
;;; (was the dynamics' own factor as pass 2 wrote it, now as a factor of the parent's).
;;;
;;; S8 in Ken's gradual change. S8 counts a change once when dynamics are set again: the
;;; growth the change's second repeat gives a walk whose parent carries the change too is
;;; kept and divided out (REVIVE;SLIPS8, "A change counted once"). SLIPS' S9 to S11 write
;;; the gradual change anew (REVIVE;SLIPS9) and keep that growth there; without SLIPS
;;; Ken's gradual change runs, so it is written here as Ken's, its second repeat asking a
;;; receiver of its own that keeps the growth (when S8 is on) before it grows her
;;; dynamics, as Ken's second repeat does (dichar.103:118-121). With SLIPS, SLIPS9's
;;; replaces it.
;;;
;;; S8 and SEEN. With S8 a repeated activity keeps its pace, and SCENE's repeat that a
;;; feeling's part extends (Kept Apart's standing guard) can end before the feelings do;
;;; SEEN, which leaves a character carried by such a repeat alone, then has her wait for
;;; the repeat's part to end and wander while her changes still run (below).
;;;
;;; Each is switchable as SLIPS' corrections are: (setq :slips-off '(s16)), '(s8).

(or (boundp ':slips-off) (setq :slips-off nil))

;; As REVIVE;SLIPS has it (FIT loads before SLIPS; SLIPS defines it the same).
(defun slip-on? (id)
  (not (memq id :slips-off)))

;;; ---------------------------------------------------------------- S16, pass 2

;; Ken's multiply-dynamics-by-factor, and the new dynamics keep the parent's factor written
;; into their own, if it is not 1.
(defun multiply-dynamics-by-factor-keeping-the-parents (special-dynamics factor)
  (let ((new-dynamics (funcall (revival-wrapped 'multiply-dynamics-by-factor 'fitstr)
			       special-dynamics factor))
	(parents (ask ,special-dynamics recall your (speed factor))))
       (and (slip-on? 's16)
	    (numberp parents)
	    (not (= parents 1.0))
	    (ask ,new-dynamics set your (speed from-parent) to ,parents))
       new-dynamics))

(+after-load '|ken;place >|
  '(revival-wrap 'multiply-dynamics-by-factor 'fitstr 'multiply-dynamics-by-factor-keeping-the-parents))

;;; ---------------------------------------------------------------- S16, Director

;; Before the demon multiplies the dynamics' factors by their parent's (interf.149:830-841),
;; the first time: the parent's factor pass 2 wrote into their own divided out. (Installed
;; before REVIVE;SLIPS8's extension of the same receiver, which therefore asks this one
;; the first time dynamics are set, and keeps the parent's factor it then multiplies.)
(defun teach-dynamics-to-take-the-stretch-once ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(multiply each of your variables matching ?variable-pattern by those in ?other)
	special-dynamics
	(let ((in-it (ask :self recall your (speed from-parent))))
	     (cond ((and (slip-on? 's16) (numberp in-it))
		    (let ((own (ask :self recall your (speed factor))))
			 (ask :self forget your (speed from-parent))
			 (cond ((numberp own)
				(ask :self set your (speed factor) to ,(//$ own in-it))
				(and (subscene-of-dynamics :self)
				     (revival-note (subscene-of-dynamics :self) 'stretch-once
						   own (//$ own in-it)
						   (list 'the-parents-factor-in-it in-it :self))))))))
	     (ask-old :self multiply each of your variables matching ,variable-pattern
		      by those in ,other)))))

(+after-load '|ken;interf >| '(revival-once 'fitstr-stretch-once 'teach-dynamics-to-take-the-stretch-once))

;;; ---------------------------------------------------------------- S8 in Ken's gradual change

;; Ken's gradual change (dichar.103:102-121), its second repeat by a receiver of its own.
(defun teach-gradual-change-to-count-a-change-once ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (gradually change by ?factor factor for ?element at ?speed speed %followup)
			director-character
	(let ((ticks-to-grow-e
	       (*$ (ask dynamic-constants recall your time-to-grow-e-times)
		   (weightify speed)
		   (float :frames-per-second)
		   (float :ticks-per-frame))))
	     (let ((growth-rate (cond ((> factor 1.0) (expt :e (//$ ticks-to-grow-e)))
				      (t (expt (//$ :e) (//$ ticks-to-grow-e))))))
		  (ask ,(ask :self recall your special-dynamics-for-current-scene)
		       repeat (multiply your (,element factor) by ,growth-rate)
		       ,(round (*$ ticks-to-grow-e (abs (log factor)))) times !,followup)
		  (ask ,:self
		       repeat (grow your own dynamics factor once for ,element by ,growth-rate)
		       ,(round (*$ ticks-to-grow-e (abs (log factor)))) times))))
       (define-receiver (grow your own dynamics factor once for ?element by ?growth-rate)
			director-character
	(note-growth-the-parent-carries (ask :self recall your special-dynamics)
					(list element 'factor) growth-rate
					(list (ask :self recall your special-dynamics-for-current-scene)))
	(ask :self ask your special-dynamics to
	     multiply your (,element factor) by ,growth-rate))))

(+after-load '|ken;dichar >| '(revival-once 'fitstr-gradual-change 'teach-gradual-change-to-count-a-change-once))

;;; ---------------------------------------------------------------- S8 and SEEN

;; With SEEN (REVIVE;SEEN), a character whose part is only changes wanders while they run
;; once nothing else moves her, but not at all if a repeated activity of the part SCENE
;; extends moves her: Ken's SCENE stretches a repeat over the extended time, "so that
;; what went on there goes on" while she changes (Kept Apart's standing guard). That held
;; while S8's slip slowed the repeat down cycle by cycle, so that it outlasted the
;; feelings (or the film was cut first). With S8 the guard keeps its pace and can end
;; first: in Ken's Kept Apart with the page's set and FIT the guard's part ends at frame
;; 108 and the two feelings run on to 119, no one moving. So, with S8, the repeat is
;; waited for as the rest is: she is planned a wander, and waits until the part whose
;; repeat moves her has ended, as well as everything else that moves her.
(defun carried-by-a-repeat-unless-it-keeps-its-pace? (character subscene)
  (and (not (slip-on? 's8))
       (funcall (revival-wrapped 'carried-by-a-repeat? 'fitstr) character subscene)))

(defun nothing-moves-her-and-no-repeat-runs? (character parts)
  (and (funcall (revival-wrapped 'nothing-moves-her-in? 'fitstr) character parts)
       (or (not (slip-on? 's8))
	   (do ((p parts (rest p)))
	       ((null p) t)
	       (and (repeat-moves-her-in? character (first p))
		    (not (all-ended? (list (first p))))
		    (return nil))))))

;; Whether a plan of the part whose Lisp has her move is in a (repeat n ...) of its
;; movements (SEEN's moves-in-lisp? and repeated-in?).
(defun repeat-moves-her-in? (character part)
  (let ((movements (ask ,part recall your movements)))
       (do ((p (ask ,part recall your plans) (rest p)))
	   ((atom p) nil)
	   (and (moves-in-lisp? character (ask ,(first p) recall your plans))
		(repeated-in? (first p) movements)
		(return t)))))

(and (get 'carried-by-a-repeat? 'expr)
     (progn (revival-wrap 'carried-by-a-repeat? 'fitstr 'carried-by-a-repeat-unless-it-keeps-its-pace?)
	    (revival-wrap 'nothing-moves-her-in? 'fitstr 'nothing-moves-her-and-no-repeat-runs?)))

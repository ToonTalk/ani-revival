;;; -*-lisp-*-
;;; REVIVE;SLIP13: S13, a change is carried forth into the walks of its part.
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged), added after the review of stage 7 (its M2). It
;;; changes Ken's Cinderella: in Kept Apart the feelings show on the walks of the guard
;;; the two walk with, Cinderella slowing down and her paths straightening and
;;; lengthening, the stepmother speeding up and her paths curving more and lengthening
;;; (reports/ext/slips/README.md).
;;;
;;; Ken's intent. His gradual change grows the special dynamics of the character's
;;; scene, and says why:
;;;
;;;	    (ask ,(ask :self recall your special-dynamics-for-current-scene)
;;;		 ;;so that if changing special-dynamics in the scene this change is
;;;		 ;;carried forth with the help of the demon on special-dynamics
;;;		 ;;in director-character
;;;		 repeat (multiply your (,element factor) by ,growth-rate) ...)
;;;							(dichar.103:110-117)
;;;
;;; and grows the dynamics she has now with its second repeat (dichar.103:118-121): the
;;; change shows on the walk she walks while it runs, and is carried forth into the
;;; dynamics she is set to later, by the demon that multiplies a walk's factors by its
;;; parent's (dichar.103:27-31), or by their taking the factor from the scene's. The
;;; thesis tells what Kept Apart's feelings are to show: "To establish that Cinderella
;;; becomes very unhappy she gradually slows down and moves in long straight lines ...
;;; Concurrently, her stepmother speeds up and moves in long highly-arcing curves"
;;; (AI-TR-540 p. 66, L1897-1901), while the stepmother stands guard: in the flipbook
;;; (b), the guard, is pages 91 to 311, and (c), the feelings, 205 to 311 (L1886-1898).
;;; A part with only changes "cannot stand alone" (pp. 125-126), so SCENE extends the
;;; activity of the part before it by the changes' time, and the part of changes runs
;;; beside it, a parasite on it (extend-last-actions-of, scene.9:223-240): the changes
;;; are to be seen on that activity.
;;;
;;; The slip. Two things keep the change from the walks the characters walk with:
;;;  - The scene's dynamics his change grows are found once, as the nearest
;;;    (special-dynamics-of c in ?) of the dynamics she has when her first change
;;;    begins (dichar.103:22-26), and run-change-to has her set to her part's own
;;;    dynamics just before (disply.311:1087-1089). For a part of only changes those
;;;    are the part's own, and the walks of the activity it extends are the other
;;;    part's, which don't descend from them: Kept Apart's feelings grow
;;;    (special-dynamics-of cinderella in (subscene-of kept-apart 3)), and the guard's
;;;    walks are subscene 2's.
;;;  - The demon multiplies a walk's factor by its parent's only, and the walks of a
;;;    repeated or stretched activity are children of dynamics with a speed factor of
;;;    their own (multiply-dynamics-by-factor, place.45:452-461; the guard's,
;;;    disply.311:421-427), which no growth of the scene's dynamics reaches.
;;; So only the walk she happens to walk while a change runs takes it (the second
;;; repeat), for the ticks it runs. With SLIPS' S9 Cinderella's sadness runs four ticks,
;;; and changed one of her two walks for two of them; the stepmother's joy ran while she
;;; stood with her part's dynamics, and never reached her walks. (In 1978 the guard
;;; slowed down cycle by cycle by S8's slip, and Cinderella's sadness ran four times as
;;; long, S9's: so Cinderella slowed, by accident, and so did the stepmother, her joy
;;; never showing.)
;;;
;;; The correction, Ken's own mechanism carried through: the change's first repeat
;;; also grows the dynamics her walks of the part take the factor from, the part the
;;; change runs in (the subscene of her dynamics as it begins, run-change-to's) and the
;;; part it extends if it is a parasite. For each of her walks there (the dynamics of
;;; (special-dynamics-of c in part) with no offspring), the dynamics that carry the
;;; factor to it: if the walk has the factor of its own, the demon carries its parent's,
;;; so the nearest of the parent and its ancestors with the factor of its own;
;;; otherwise the nearest of its ancestors with it. (If none has, the part's dynamics,
;;; which then take it.) Those that already take it from the scene's dynamics the
;;; change grows are left to them. They are grown as the scene's are, once a tick, and
;;; the walks take the change, once: one that takes the factor from them, live, so the
;;; second repeat leaves it alone, as S10 leaves dynamics that take it from the scene's;
;;; one with a factor of its own when it is next set, the demon multiplying in its
;;; parent's (S8 counting the second repeat's growth of it once). The next part is not
;;; carried into: run-change-to sets the next part's value to the new one
;;; (disply.311:1083-1086).
;;;
;;; The note, on the Director subscene of the scene's dynamics the change grows, as
;;; S9's to S11's, once for each character and element: the character, the element and
;;; the scene's dynamics Ken's change grows; the dynamics that carry it now; and the
;;; parts whose walks they are:
;;;   (revival-repair: what carried-forth
;;;		     was (cinderella speed (special-dynamics-of cinderella in
;;;					     (subscene-of kept-apart 3)))
;;;		     now (|(special-dynamics-of cinderella in ...)-12| ...)
;;;		     because (walks-of (subscene-of kept-apart 3) (subscene-of kept-apart 2)))

;; The part a change of character's begins in: the subscene of her dynamics now; nil if
;; none.
(defun part-of-change (character)
  (let ((dynamics (ask ,character recall your special-dynamics)))
       (and dynamics (subscene-of-dynamics dynamics))))

;; The part a part extends, if it is a parasite on one (scene.9:228); else nil.
(defun part-extended-by (part)
  (let ((status (and part (ask ,part recall your status))))
       (and (not (atom status)) (eq (first status) 'parasite-on) (second status))))

;; The dynamics that carry variable to character's walks in part and the part it
;; extends, by name, but not scene-dynamics, nor those that take it from them.
(defun carriers-of-change (character variable part scene-dynamics)
  (let ((carriers nil))
       (mapc (function
	      (lambda (p)
		      (let ((top (list 'special-dynamics-of (name-of character) 'in p)))
			   (and (actor-of top dont-autoload)
				(mapc (function
				       (lambda (walk)
					       (let ((carrier (carrier-of walk variable top)))
						    (and carrier
							 (not (member carrier carriers))
							 (not (equal carrier (name-of scene-dynamics)))
							 (not (dynamics-have-it-from? carrier variable scene-dynamics))
							 (setq carriers (cons carrier carriers))))))
				      (walks-under top))))))
	     (delq nil (list part (part-extended-by part))))
       (nreverse carriers)))

;; Dynamics and their offspring with no offspring of their own, by name: the walks.
(defun walks-under (dynamics)
  (let ((offspring (ask ,dynamics recall your offspring)))
       (cond ((null offspring) (list dynamics))
	     (t (mapcan (function (lambda (d) (walks-under d)))
			(append offspring nil))))))

;; The dynamics, up to top, that carry variable to walk, by name: if walk has it of its
;; own, the nearest of its parent and their ancestors that has it of its own; else the
;; nearest of its ancestors that has; failing either, top.
(defun carrier-of (walk variable top)
  (do ((d (cond ((has-own? walk variable) (ask ,walk recall your parent))
		(t walk))
	  (ask ,d recall your parent)))
      ((or (null d) (eq d 'special-dynamics)) top)
      (cond ((has-own? d variable) (return d))
	    ((equal d top) (return top)))))

(defun has-own? (dynamics variable)
  (and dynamics (assoc variable (ask ,dynamics internal-recall-your-normal-variable))))

(defun note-carried-forth (character element scene-dynamics carriers part)
  (let ((subscene (subscene-of-dynamics scene-dynamics)))
       (and subscene
	    carriers
	    (revival-note subscene 'carried-forth
			  (list (name-of character) element scene-dynamics)
			  carriers
			  (cons 'walks-of (delq nil (list part (part-extended-by part))))))))

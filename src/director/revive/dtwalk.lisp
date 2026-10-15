;;; -*-lisp-*-
;;; REVIVE;DTWALK: deliberateness shapes a character's path in Director's walk.
;;;
;;; This file is ours, not Ken's. It is part of DETAIL (REVIVE;DETAIL says what DETAIL
;;; is, and where the thesis names this detail). It changes Ken's Cinderella: the
;;; stepmother, whose movements Ani makes deliberate, and the fairy godmother, whom Ani
;;; makes not deliberate, walk differently (reports/ext/detail/README.md).
;;;
;;; The detail. Ani chooses each character's deliberateness, high, medium or low, as
;;; she chooses its speed (CP 29: the stepmother high, Cinderella and the Prince medium,
;;; the fairy godmother low), and her activities' dynamics may set it (wanting to meet
;;; someone moves "deliberateness high", convey.64:199-204; being aware of something,
;;; convey.64:252-254), but Director never reads it: "Currently, the deliberateness,
;;; repetiveness, rhythmic-level, activity-level, and acceleration are not used by the
;;; extended version of Director that runs this code" (p. 276, L7416-7418). Director's
;;; walk turns a character each tick by its path (go-in-arc, dichar.103:214-256): "the
;;; path-curvature is the most it will deviate from direct on target / the
;;; path-length determines how much the curvature should change each time / the
;;; path-jaggedness is an alternating heading offset" (dichar.103:218-220). Each tick
;;; its heading changes by the jag, one way and then the other, and by the arc's
;;; curvature, which swings from one side to the other over each path-length it goes.
;;;
;;; "This should influence how often a character changes direction, how quickly it does
;;; it, and how large the change in direction is" (p. 186, L4853-4856). The revival's
;;; reading, in Director's own terms: a character d times as deliberate as one of
;;; medium deliberateness (d is the weight Director gives every three-valued element,
;;; INTERF's weightify, .5, 1 or 2, times any factor a change has grown it by,
;;; interf.149:845-847, as speed is read) goes in arcs d times as long, so that its
;;; curve turns round d times less often and swings d times more slowly ("how often" and
;;; "how quickly"), and jags 1/d as far each tick ("how large"). A deliberate character
;;; changes direction less often, more slowly and by less; one that isn't deliberate
;;; changes it more often, more quickly and by more. Medium changes nothing, so
;;; Cinderella and the Prince walk as in 1978. The arc's curvature itself, how far it
;;; deviates from going straight at the goal, is left as Ani chose it: that is
;;; path-curvature's, which she chooses beside deliberateness: in Kept Apart, wanting to
;;; meet the Prince, Cinderella "moves directly and deliberately" (p. 66, L1886-1887),
;;; low curvature and high deliberateness both (convey.64:199-204). How far and how fast a
;;; character walks are left alone too: the arc's length and the jag change only where
;;; it heads each tick, and Director's correction of the distance for an arc reads only
;;; the curvature (correction-for-longer-path, dichar.103:206-210).
;;;
;;; With CHANGE, Director now reads deliberateness, so a change of how a character moves
;;; bridges it as it bridges speed and the path (REVIVE;CHSHOW :change-director-elements).
;;;
;;; The note, on Director's subscene of the walker's special dynamics (REVIVE;SLIPS'
;;; subscene-of-dynamics, here as dtwalk-subscene-of), for each deliberateness, rounded,
;;; it walks with there:
;;;   (revival-repair: what deliberate-walk was (step-mother deliberateness high)
;;;		     now (arcs-times 2.0 jags-divided-by 2.0) because (dichar go-in-arc))

;; How deliberate a character's movements are now: the weight of its dynamics'
;; deliberateness times their factor for it, as special-dynamics yields any element's
;; value (interf.149:845-847); 1.0 if it has no dynamics.
(defun deliberateness-of (character)
  (let ((dynamics (ask ,character recall your special-dynamics)))
       (cond (dynamics (ask ,dynamics yield your deliberateness value))
	     (t 1.0))))

(defun go-in-arc-deliberately (character distance goal original-goal path-curvature
					 path-length path-jaggedness careful-of-collisions? others)
  (let ((d (cond ((detail-on? 'walk) (deliberateness-of character)) (t 1.0))))
       (cond ((= d 1.0)
	      (funcall (revival-wrapped 'go-in-arc 'dtwalk)
		       character distance goal original-goal path-curvature path-length
		       path-jaggedness careful-of-collisions? others))
	     (t (note-deliberate-walk character d)
		(funcall (revival-wrapped 'go-in-arc 'dtwalk)
			 character distance goal original-goal path-curvature
			 (*$ path-length d) (//$ path-jaggedness d)
			 careful-of-collisions? others)))))

(defun note-deliberate-walk (character d)
  (let ((dynamics (ask ,character recall your special-dynamics)))
       (let ((subscene (dtwalk-subscene-of dynamics)))
	    (and subscene
		 (actor-of subscene dont-autoload)
		 (revival-note subscene 'deliberate-walk
			       (list (name-of character) 'deliberateness
				     (or (ask ,dynamics recall your deliberateness) 'medium))
			       (list 'arcs-times (detail-rounded d)
				     'jags-divided-by (detail-rounded d))
			       '(dichar go-in-arc))))))

;; The Director subscene dynamics are of: those of (special-dynamics-of c in s), or of
;; the nearest such ancestor (an activity's dynamics, |(special-dynamics-of c in ...)-15-1|).
(defun dtwalk-subscene-of (dynamics)
  (do ((actor dynamics (and actor (ask ,actor recall your parent))))
      ((or (null actor) (eq actor 'special-dynamics)) nil)
      (and (not (atom actor))
	   (eq (first actor) 'special-dynamics-of)
	   (return (fourth actor)))))

;; DICHAR's (src/director/tags: AUTOLOAD from KEN;DICHAR), wrapped once it has loaded.
(+after-load '|ken;dichar >| '(revival-wrap 'go-in-arc 'dtwalk 'go-in-arc-deliberately))

;; With CHANGE (REVIVE;CHSHOW, loaded before DETAIL), a change bridges deliberateness.
(and (boundp ':change-director-elements)
     (not (memq 'deliberateness :change-director-elements))
     (setq :change-director-elements (append :change-director-elements '(deliberateness))))

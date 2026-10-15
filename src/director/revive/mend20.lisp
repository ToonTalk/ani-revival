;;; -*-lisp-*-
;;; REVIVE;MEND20: M20, a character shown off the stage past a corner.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The failure. When Director shows a character at the start of a part and her place
;;; is off the screen both across and up or down, past a corner, it plans to place her
;;; there again each tick until she is on the stage:
;;;
;;;	      (let ((xmax (+$ size (*$ .5 (first (turtlesize)))))
;;;		    (ymax (+$ size (*$ .5 (second (turtlesize))))))
;;;		   (cond ((and (> (abs (first position)) xmax)
;;;			       (> (abs (second position)) ymax))
;;;			  ;;is off screen so want to continually change position until on stage
;;;			  (ask :self
;;;			       plan next
;;;			       recompute position of ,location in ,subscene
;;;			       if still offstage ,xmax ymax))))))))	(dichar.103:41-49)
;;;
;;; ymax has no comma, so the plan carries the symbol YMAX, not its value, and the
;;; receiver compares her place with it (dichar.103:51-59): if she is still off the
;;; screen across, "not a number: YMAX", and the film stops. A slip, a comma left out
;;; (xmax beside it has one), but one that stops the film: Ken's Cinderella never gets
;;; there, so it is a repair here. A new story does when a scene leaves a character off
;;; the stage past a corner and the next begins with her there: GPT-6.1 Sol's Three
;;; Little Pigs, whose Friends Together leaves the first pig past the top left corner,
;;; (xy-position -0.56 0.59), and The Chase stopped as it began
;;; (test/stories/stress/offstage-corner.lisp).
;;;
;;; With the number alone, the pig stayed off the stage for good, and The Chase and Safe
;;; Together ran to the 1,000-frame cap: placing her again is for a place that moves,
;;; one relative to a character not yet on the stage (vicinity-of and the like), which
;;; she is to follow until it comes on, but a place where she was left, an xy-position,
;;; never moves, and each tick put her back there, so the walk that was to bring her on
;;; (REVIVE;MEND6's) never got her anywhere.
;;;
;;; The repair, which differs from Ken's only where his receiver would have stopped on
;;; YMAX (she is still off the screen across the tick after): at a place that
;;; moves she is placed again with ymax the number show yourself computed, her size and
;;; half the screen's height (dichar.103:42), so the plans after carry it; at a place
;;; that can't move (an xy-position or a position on or off the screen, INTERF's
;;; positions that yield themselves, interf.149:175-228) she is left where she was shown,
;;; for a walk to take her on, as from anywhere off the stage. The part notes it, the
;;; first time:
;;;   (revival-repair: what offstage-corner was (if still offstage 725.2 ymax)
;;;		     now (left-at (xy-position -0.56 0.59))
;;;		     because (first-pig at (-749.0 588.3)))
;;; or, at a place that moves, now (if still offstage 725.2 557.8).

(defun teach-the-recompute-its-ymax ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(recompute position of ?location in ?subscene if still offstage ?xmax ?ymax)
	director-character
	(cond ((numberp ymax)
	       (ask-old :self recompute position of ,location in ,subscene
			if still offstage ,xmax ,ymax))
	      ;; a place that can't move: placed as Ken's receiver places her
	      ;; (dichar.103:55-56), and left there
	      ((place-that-cant-move? location)
	       (let ((position (find-screen-coordinate-of location subscene)))
		    (ask :self set your position to ,position)
		    (and (> (abs (first position)) xmax) ;;where Ken's compares with YMAX
			 (note-offstage-corner :self subscene xmax ymax
					       (list 'left-at location)))))
	      (t (let ((ymax-as-shown (+$ (ask :self recall your size)
					   (*$ .5 (second (turtlesize))))))
		      (ask-old :self recompute position of ,location in ,subscene
			       if still offstage ,xmax ,ymax-as-shown)
		      (and (> (abs (first (ask :self recall your position))) xmax)
			   (note-offstage-corner :self subscene xmax ymax
						 (list 'if 'still 'offstage xmax ymax-as-shown)))))))))

(+after-load '|ken;dichar >| '(revival-once 'mend20-offstage-corner 'teach-the-recompute-its-ymax))

;; A place that yields itself (interf.149:175-228): a position as numbers, or an
;; xy-position, a position on or off the screen, or a stationary target.
(defun place-that-cant-move? (location)
  (or (numberp (first location))
      (memq (first location) '(xy-position screen-position off-screen-position stationary-target))))

(defun note-offstage-corner (character subscene xmax ymax now)
  (revival-note subscene 'offstage-corner
		(list 'if 'still 'offstage xmax ymax)
		now
		(list (name-of character) 'at (ask ,character recall your position))))

;;; -*-lisp-*-
;;; REVIVE;MEND12: M12, moves that never end.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. A move that has gone on for longer than the most time Ani allows for a
;;; walk that long stops where it is, as if there, and its subscene notes it. For a
;;; move to a moving target, only the time the mover spends waiting for someone to
;;; move counts.
;;;
;;; Where it never ends. Director moves a character to a place a step a tick, and the
;;; move ends when its stop condition says this step gets there (go in arc,
;;; dichar.103:158-204; stop-when-there's condition, dichar.103:411-414, 465-468).
;;; Nothing else ends it, so a move that never gets there goes on until the film's
;;; frames run out (600 at 4 a second on the page), and the subscenes after it never
;;; start. New stories meet three such moves, two of them in pushes-around
;;; (disply.311:243-328):
;;;  - Blocked. In a Hansel and Gretel, The Escape, Gretel pushes the witch towards
;;;    Hansel, who stands where the scene before left him. The witch's coast
;;;    (pushee-coasts, careful of collisions, disply.311:303-315) is to a place .1 of
;;;    the screen beyond her, right by Hansel. Every step she tries collides with him;
;;;    he is at her destination, she doesn't dominate him (no 1978 file sets a special
;;;    dynamics' dominates) and he is no part of it, so she backs up, "waiting for
;;;    hansel to move" (dichar.103:285-318). He has nowhere to go: she stands still
;;;    from frame 9 to the cap.
;;;  - Circling. In Red Riding Hood's Into the Woods (test/stories/red-riding-hood.lisp)
;;;    the wolf pushes her around four times while her joy gradually raises her path
;;;    curvature, path length and speed (emote.9:49-60; dichar.103:102-121). Each push
;;;    cycle makes her special dynamics for moving away hers again (disply.311:316-326),
;;;    and each time Director multiplies its factors by its parent's (dichar.103:27-31),
;;;    so the joy compounds: her path curvature factor is 2.5, 8, 22 and then 62, which
;;;    is 927 degrees. She spins round her goal, .15 of the screen away, and the
;;;    distance Director reckons along her arc (correction-for-longer-path,
;;;    dichar.103:171-172, 206-210) is eight times the straight one, so no step of hers
;;;    is ever long enough to get there. She wanders off past the top of the picture.
;;;  - Waiting, going to meet. Once Into the Woods ends, Red Riding Hood's last scene,
;;;    Together Again, starts from new places, and in its last subscene she and the
;;;    grandmother go to meet each other (move-to-each-other, careful of collisions,
;;;    disply.311:653-679) with the wolf, left standing from the scene before, between
;;;    them. Each stands still from frame 96, waiting for him to move; he never does.
;;;
;;; Why not repair those causes. The compounding is in Ken's Cinderella too: the
;;; Introduction's five pushes make Cinderella's and the stepmother's dynamics theirs
;;; again each cycle while their feelings change their speeds
;;; (reports/pass2/ken-introd.uction), so the 1978 film has it, and MEND must not
;;; change that. And waiting for someone at your destination to move is right when
;;; they will. What is wrong in each is that the move goes on for ever.
;;;
;;; Why the most time. Ani plans a subscene's length from her estimate of each walk in
;;; it: the distance at the character's speed (time-to-walk) and a third of a second
;;; for easing in, its ideal, with two and a half times that as the most
;;; (estimate-time-to-move-character, place.45:524-559). A move that has gone on longer
;;; than that is not going to get there as Ani planned. It stops as Ken's
;;; counting-down condition stops a move whose time is up, going no
;;; further ("done and don't go anymore", 0.0, dichar.103:492-500); go in arc then does
;;; what it does on arriving: the plans for when it is finished, and the goal
;;; forgotten (dichar.103:177-193). The time is counted as that condition counts it, in
;;; seconds a tick at a time (dichar.103:481-488), so that 4 and 24 frames a second
;;; agree. The estimate is made from what the move starts with: the distance to go
;;; that ACTION gives the condition (action.152:294-306) and the mover's speed then
;;; (yield real value for speed, as go in arc reads it, dichar.103:165-166).
;;;
;;; For a move to a stationary place, whose goal ACTION sets as (stationary-target
;;; ...) (action.152:283-293), the whole time counts. A move to a moving target, such
;;; as contact with someone, may rightly take longer, since the target may move away
;;; (Ken stops those that may not end with stop-when-there-then's plans and
;;; move-only-original-distance); so for it only the ticks in which Ken's careful step
;;; backs up to wait for someone to move count (dichar.103:317-318), for waiting gets
;;; nearer to nothing. The step is extended to note that on the mover, and does all
;;; else as before. Those of Ken's conditions that have a receiver of their own
;;; (move-only-original-distance, stop-if-either-wants-to, always-happy-condition)
;;; answer as before; through stop-if-either-wants-to, a stop-when-there inside it is
;;; held to the time too.
;;;
;;; The note, on the subscene, while filming:
;;;   (revival-repair: what overdue-move was (witch going-to <the place>)
;;;		       now stopped-as-if-there because (more-than <the most> seconds))
;;; or, for a moving target, because (waiting-for-more-than <the most> seconds).
;;; In Ken's Cinderella no move to a stationary place runs over its time, and no one
;;; waits for longer than that, at 4 frames a second or at 24 (reports/film/24fps), so
;;; in her run this only counts.

;; Ken's stop-when-there condition, which first asks if this step gets there, and
;; otherwise if the move is overdue (0.0) or not (nil). And Ken's careful step, which
;; is as it was, but notes on the mover when it waits for someone to move.
(defun extend-stop-when-there-to-stop-overdue-moves ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(should ?who stop after moving ?distance of ?distance-left to ?destination)
	arc-stop-condition
	(or (ask-old :self should ,who stop after moving ,distance of ,distance-left
		     to ,destination)
	    (overdue-move-stops :self who)))
       (define-extension-method
	(forward ?distance towards ?goal originally ?original-goal
		 dragging ?others-being-dragged along
		 avoiding ?others-on-stage ?offset degrees off target)
	director-character
	(note-if-waiting
	 :self
	 (ask-old :self forward ,distance towards ,goal originally ,original-goal
		  dragging ,others-being-dragged along
		  avoiding ,others-on-stage ,offset degrees off target)))))

;; Ken's careful step answers (waiting for <the other> to move) when it backs up to wait
;; (dichar.103:317-318). That is kept on the mover, as a property, for its stop
;; condition to read when next asked; whatever the step answered is its answer still.
(defun note-if-waiting (mover answer)
  (and (not (atom answer))
       (eq (first answer) 'waiting)
       (putprop mover t 'revival-waited))
  answer)

(defun overdue-move-stops (condition who)
  (let ((goal (ask ,who recall your current-goal))
	(most (most-time-for-move condition who))
	(waited? (waited-since-asked? who)))
       (cond ((not (or (eq (first goal) 'stationary-target) waited?)) nil)
	     (t (let ((gone (ask ,condition set your revival-seconds-gone to
				 ,(+$ (or (ask ,condition recall your revival-seconds-gone)
					  0.0)
				      (seconds-a-tick)))))
		     (cond ((and most (> gone most))
			    (revival-note (ask ,condition recall your subscene)
					  'overdue-move
					  (cond ((eq (first goal) 'stationary-target)
						 (list who 'going-to (second goal)))
						(t (list who 'going-to goal)))
					  'stopped-as-if-there
					  (cond ((eq (first goal) 'stationary-target)
						 (list 'more-than most 'seconds))
						(t (list 'waiting-for-more-than most 'seconds))))
			    0.0) ;;done and don't go anymore
			   (t nil)))))))

;; Whether the mover's last step waited for someone to move, the note taken away. Only
;; waiting counts, not going slowly or not yet going: at 24 frames a second Cinderella,
;; going to meet the Prince in Justice, stays where she is for ten frames, then goes
;; half a dot a frame, and is still on her way when the most for her walk, three
;; seconds, is up (reports/film/24fps/justice.film.json, frames 352-436).
(defun waited-since-asked? (who)
  (let ((waited? (get who 'revival-waited)))
       (remprop who 'revival-waited)
       waited?))

;; Ani's most for the walk, from the distance the move started with and the mover's
;; speed (place.45:528-559), made once, when the condition is first asked. nil if
;; ACTION gave the condition no distance (it always does, action.152:303-306).
(defun most-time-for-move (condition who)
  (or (ask ,condition recall your revival-most-time)
      (let ((distance (ask ,condition recall your original-distance))
	    (speed (ask ,(ask ,who recall your special-dynamics)
			yield real value for speed)))
	   (cond ((and (numberp distance) (numberp speed) (> speed 0.0))
		  (ask ,condition set your revival-most-time to
		       ,(*$ 2.5 ;;the most, as Ani estimates it
			    (+$ (//$ (float distance) speed)
				.33)))))))) ;;a third of a second for easing in

;; As stop-after-so-many-seconds reckons it (dichar.103:484-487), from the movie's
;; frames a second and ticks a frame, which go in arc reads (dichar.103:165-166).
(defun seconds-a-tick ()
  (//$ (*$ (float :frames-per-second) (float :ticks-per-frame))))

;; arc-stop-condition and director-character's careful step are DICHAR's, so they are
;; extended once DICHAR has loaded.
(+after-load '|ken;dichar >|
  '(revival-once 'mend12-overdue 'extend-stop-when-there-to-stop-overdue-moves))

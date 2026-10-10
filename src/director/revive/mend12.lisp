;;; -*-lisp-*-
;;; REVIVE;MEND12: M12, moves that never end.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. A move whose mover has spent longer than the most time Ani allows for
;;; the walk waiting for someone to move, or has gone that long without getting any
;;; nearer to where it is going, stops where it is, as if there, and its subscene notes
;;; it. A move that is getting there, however slowly or roundabout, is left alone.
;;;
;;; Where it never ends. Director moves a character to a place a step a tick, and the
;;; move ends when its stop condition says this step gets there (go in arc,
;;; dichar.103:158-204; stop-when-there's condition, dichar.103:411-414, 465-468).
;;; Nothing else ends it, so a move that never gets there goes on until the film's
;;; frames run out (600 at 4 a second on the page), and the subscenes after it never
;;; start. New stories meet four such moves, three of them in pushes-around
;;; (disply.311:243-328):
;;;  - Blocked. In a Hansel and Gretel, The Escape, Gretel pushes the witch towards
;;;    Hansel, who stands where the scene before left him. The witch's coast
;;;    (pushee-coasts, careful of collisions, disply.311:303-315) is to a place .1 of
;;;    the screen beyond her, right by Hansel. Every step she tries collides with him;
;;;    he is at her destination, she doesn't dominate him (no 1978 file sets a special
;;;    dynamics' dominates) and he is no part of it, so she backs up, "waiting for
;;;    hansel to move" (dichar.103:285-318). He has nowhere to go: she stands still
;;;    from frame 9 to the cap. test/stories/stress/pushee-blocked.lisp is the same.
;;;  - Circling. In Red Riding Hood's Into the Woods (test/stories/red-riding-hood.lisp)
;;;    the wolf pushes her around four times while her joy gradually raises her path
;;;    curvature, path length and speed (emote.9:49-60; dichar.103:102-121). Each push
;;;    cycle makes her special dynamics for moving away hers again (disply.311:316-326),
;;;    and each time Director multiplies its factors by its parent's (dichar.103:27-31),
;;;    so the joy compounds: her path curvature factor is 2.5, 8, 22 and then 62, which
;;;    is 927 degrees. Go in arc stops her only when a step is as long as the distance
;;;    it reckons along her arc, eight or more times the straight one
;;;    (correction-for-longer-path, dichar.103:171-172, 206-210), so she must land almost
;;;    on the spot. In the third push she loops round it for fifteen seconds, passing
;;;    within a few dots of it at frames 86, 130 and 139, and stops at 143. In the
;;;    fourth her loops drift outwards: her nearest is at frame 172, and from then on
;;;    each loop passes further off, until she wanders past the top of the picture.
;;;  - Waiting, going to meet. Once Into the Woods ends, Red Riding Hood's last scene,
;;;    Together Again, starts from new places, and in its last subscene she and the
;;;    grandmother go to meet each other (move-to-each-other, careful of collisions,
;;;    disply.311:653-679) with the wolf, left standing from the scene before, between
;;;    them. Each stands still, waiting for him to move; he never does.
;;;  - Two moves at once. A character can be the pusher of one pushes-around and the
;;;    pushee of another in the same subscene (test/stories/stress/push-mutual.lisp,
;;;    where the troll pushes the goat and the goat pushes the troll). Director then
;;;    runs two of her moves together, each tick a step of each, and they can cancel
;;;    out: the goat's coast away from the troll (pushee-coasts, from frame 12) and her
;;;    going to come in contact with him for her own next push (pusher-comes-in-contact,
;;;    disply.311:277-288, from frame 31) pull opposite ways, and she turns back and
;;;    forth on the spot to the cap, never nearer. Each of Director's moves begins by
;;;    facing the character towards where it goes (action.152:296-307), and two facings
;;;    can cancel out as well: once the moves above are stopped, the goat's facings for
;;;    her push of the troll and for her next coast turn her a fifth of a turn one way
;;;    and back again each tick, from frame 97, and neither finishes.
;;;
;;; Why not repair those causes. The compounding is in Ken's Cinderella too: the
;;; Introduction's five pushes make Cinderella's and the stepmother's dynamics theirs
;;; again each cycle while their feelings change their speeds
;;; (reports/pass2/ken-introd.uction), so the 1978 film has it, and MEND must not
;;; change that; nor the long way round it makes, which does end, as Red Riding Hood's
;;; third push does. Waiting for someone at your destination to move is right when
;;; they will, and two moves at once is how Ken's pushes are made. What is wrong in
;;; each is that the move goes on for ever.
;;;
;;; What counts. Two things, a tick at a time, each in seconds as Ken's counting-down
;;; condition counts them (dichar.103:481-488), so that 4 and 24 frames a second agree:
;;;  - The ticks in which Ken's careful step backs up "waiting for <someone> to move"
;;;    (dichar.103:317-318). The step is extended to note that on the mover, and does
;;;    all else as before. Waiting gets nearer to nothing; it is the blocked move's
;;;    whole time, and going to meet's.
;;;  - The time since the mover was last nearer to its destination than it had ever
;;;    been in this move: its straight distance, as go in arc measures it before the
;;;    correction for the arc (dichar.103:172), at least a dot (1.0, go in arc's "last
;;;    little bit", dichar.103:178) less than its nearest before. A walk that is
;;;    getting there, slowly (Cinderella at 24 frames a second in Justice goes half a
;;;    dot a frame) or the long way round (the third push), keeps coming nearer than
;;;    before; a mover that drifts away, stands still or cancels out does not.
;;; The destination is the one go in arc gives the condition each tick, the screen
;;; place of the move's own goal (dichar.103:170, 174-176), so for a moving target it
;;; moves with the target.
;;;
;;; Why the most time. Ani plans a subscene's length from her estimate of each walk in
;;; it: the distance at the character's speed (time-to-walk) and a third of a second
;;; for easing in, its ideal, with two and a half times that as the most
;;; (estimate-time-to-move-character, place.45:524-559). Ani reckons the distance
;;; straight; Director walks it along the arc, and the distance it reckons, which it
;;; gives the condition (dichar.103:171-176), is longer by the correction for the arc.
;;; The most here is Ani's, for the distance Director gives the condition when first
;;; asked, at the mover's speed then (yield real value for speed, as go in arc reads it,
;;; dichar.103:165-166). For a straight walk the two distances are the same; for Red
;;; Riding Hood's third push, Ani's most for the straight distance, two and a half
;;; seconds, is less than one of her loops, and she would be stopped going the long way
;;; round to a place she reaches.
;;;
;;; When either count passes the most, the move stops as Ken's counting-down condition
;;; stops a move whose time is up, going no further ("done and don't go anymore", 0.0,
;;; dichar.103:492-500); go in arc then does what it does on arriving: the plans for
;;; when it is finished, and the goal forgotten (dichar.103:177-193).
;;;
;;; Which conditions. Only the one go in arc itself asks, the move's own (dichar.103:
;;; 173-176): go in arc is extended to tell it the goal it is for. A stop-when-there
;;; that stop-if-either-wants-to asks for it is left to its partner, a timer in Ken's
;;; one use (goes-to-and-accompanys, disply.311:219-222) and in REVIVE;MEND9's wander.
;;; Those of Ken's conditions that have a receiver of their own
;;; (move-only-original-distance, stop-if-either-wants-to, always-happy-condition)
;;; answer as before. The goal is the condition's own, not the mover's current goal:
;;; ACTION sets that on every character of a move, those dragged along too
;;; (action.152:283, 293), so a character in two moves at once has the goal of the
;;; one that started last.
;;;
;;; The facing. ACTION's plan faces the character a turn at a time, re-sending itself
;;; each tick until the heading is reached, and then goes on to the walk (action.152:
;;; 296-322, OBJECT's do-set-turtle-gradually). A facing that has gone for longer than
;;; the most Ani allows for turning round without turning any nearer, by a degree, to
;;; the heading it is to end on is done as if turned: the plan goes on to the walk, as
;;; do-set-turtle-gradually does when the turn is done. Ani's most for a turn is three
;;; times the degrees at the character's rotational speed (time-estimates-to-turn-
;;; character, place.45:435-443); turning round is half a turn, the most a facing ever
;;; needs, since OBJECT turns the shorter way. Only these facings, the start of a move
;;; (with "then", the walk to follow); move-near-and-turn's turns towards the others
;;; (face-character-towards-others, place.45:219-237) are left as they are.
;;;
;;; The notes, on the subscene, while filming:
;;;   (revival-repair: what overdue-move was (witch going-to <the place>)
;;;		       now stopped-as-if-there because (waiting-for-more-than <the most> seconds))
;;; or, for a mover that got no nearer, because (no-nearer-for-more-than <the most>
;;; seconds); and for a facing,
;;;   (revival-repair: what overdue-turn was (goat facing <the place>)
;;;		       now faced-as-if-turned because (no-nearer-for-more-than <the most> seconds)).
;;; In Ken's Cinderella no one waits for longer than the most, no one goes that long
;;; without getting nearer, and no facing goes that long without turning, at 4 frames a
;;; second or at 24 (reports/film/24fps), so in her run this only counts.

;; go in arc, which tells its stop condition the goal it is for, once, and then goes on
;; as Ken wrote it. Ken's stop-when-there condition, which first asks if this step gets
;; there, and otherwise if the move will never end (0.0) or not (nil). And Ken's careful
;; step, which is as it was, but notes on the mover when it waits for someone to move.
(defun extend-go-in-arc-to-stop-moves-that-never-end ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(go in arc ?careful-or-regardless of collisions dragging ?others along
	    to ?goal stopping if ?condition %followup)
	director-character
	(or (ask ,condition recall your revival-goal)
	    (ask ,condition set your revival-goal to ,goal))
	(ask-old :self go in arc ,careful-or-regardless of collisions dragging ,others along
		 to ,goal stopping if ,condition !,followup))
       (define-extension-method
	(should ?who stop after moving ?distance of ?distance-left to ?destination)
	arc-stop-condition
	(or (ask-old :self should ,who stop after moving ,distance of ,distance-left
		     to ,destination)
	    (never-ending-move-stops :self who distance-left destination)))
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

;; nil, or 0.0 with a note if the mover has waited, or gone without getting nearer, for
;; longer than the most. Only for a condition go in arc asks itself (it has a goal).
(defun never-ending-move-stops (condition who distance-left destination)
  (let ((goal (ask ,condition recall your revival-goal)))
       (and goal
	    (let ((most (most-time-for-move condition who distance-left))
		  (waited (seconds-counted condition 'revival-seconds-waiting
					   (waited-since-asked? who)))
		  (not-nearer (seconds-counted condition 'revival-seconds-not-nearer
					       (not (nearer-than-ever? condition who
								       destination)))))
		 (cond ((null most) nil)
		       ((> waited most) (stopped-as-if-there condition who goal
							     'waiting-for-more-than most))
		       ((> not-nearer most) (stopped-as-if-there condition who goal
								 'no-nearer-for-more-than most))
		       (t nil))))))

(defun stopped-as-if-there (condition who goal why most)
  (revival-note (ask ,condition recall your subscene)
		'overdue-move
		(cond ((eq (first goal) 'stationary-target) (list who 'going-to (second goal)))
		      (t (list who 'going-to goal)))
		'stopped-as-if-there
		(list why most 'seconds))
  0.0) ;;done and don't go anymore

;; The condition's count, in seconds: a tick more if more?, or none if this tick
;; started it again (only the not-nearer count does: nearer than ever, so from 0.0).
(defun seconds-counted (condition variable more?)
  (ask ,condition set your ,variable to
       ,(cond (more? (+$ (or (ask ,condition recall your ,variable) 0.0) (seconds-a-tick)))
	      ((eq variable 'revival-seconds-not-nearer) 0.0)
	      (t (or (ask ,condition recall your ,variable) 0.0)))))

;; Whether the mover is now nearer to the destination than it has been before in this
;; move, by more than go in arc's last little bit (dichar.103:178); the first time it is
;; asked, it is. The distance is go in arc's own, straight (dichar.103:172).
(defun nearer-than-ever? (condition who destination)
  (let ((now (ask ,who yield distance to ,destination))
	(nearest (ask ,condition recall your revival-nearest)))
       (cond ((or (null nearest) (< now (-$ nearest 1.0)))
	      (ask ,condition set your revival-nearest to ,now)
	      t))))

;;; ------------------------------------------------- facing

;; Whether the plan's facing of character towards position (plus angle) has gone for
;; longer than the most Ani allows for turning round without turning any nearer to the
;; heading it is to end on; if so, with a note. The facing is the one ACTION's plan
;; re-sends each tick until it is done (action.152:309-322; OBJECT's
;; do-set-turtle-gradually), so what is kept of it, on the plan, is kept from one tick to
;; the next: a facing asked again after a tick or more without it is another (a later
;; push of the same cycle, say), and starts again.
(defun never-ending-turn? (plan character position angle)
  (let ((tick (let ((filming (ask movie recall your current-movie)))
		   (and filming (ask ,filming recall your frame-count))))
	(kept (ask ,plan recall your (revival-facing ,character)))
	(left (abs (make-it-less-than-180
		    (difference (+$ (do-as-if-you-were character
				     ,character yield heading to
				     ,(find-screen-coordinate-of position))
				    (eval angle))
				(ask ,character recall your heading))))))
       (cond ((not (and kept (numberp tick) (memq (- tick (first kept)) '(0 1))))
	      ;; a facing begun: (tick nearest seconds-not-nearer most)
	      (ask ,plan set your (revival-facing ,character) to
		   ,(list tick left 0.0 (most-time-to-turn-round)))
	      nil)
	     (t (let (((nil nearest not-nearer most) kept))
		     (let ((nearer? (< left (-$ nearest 1.0)))) ;;by a degree
			  (let ((nearest (cond (nearer? left) (t nearest)))
				(not-nearer (cond (nearer? 0.0)
						  (t (+$ not-nearer (seconds-a-tick))))))
			       (ask ,plan set your (revival-facing ,character) to
				    ,(list tick nearest not-nearer most))
			       (cond ((and most (> not-nearer most))
				      (ask ,plan forget your (revival-facing ,character))
				      (revival-note (or (ask ,plan recall your subscene) plan)
						    'overdue-turn
						    (list character 'facing position)
						    'faced-as-if-turned
						    (list 'no-nearer-for-more-than most 'seconds))
				      t)))))))))

;; Ani's most for a turn is three times its ideal, the degrees at the rotational speed
;; (time-estimates-to-turn-character, place.45:435-443); here for half a turn, 180
;; degrees, the most a facing needs (OBJECT turns the shorter way, with
;; make-it-less-than-180), at medium rotational speed: half of Ani's time to turn
;; around, 2 seconds (dynamic-constants, interf.149:915, 927-930), so three seconds.
;; A slower character still turns nearer every tick or two, which is all that counts.
;; (The character's own rotational speed is not asked: its special dynamics recall it
;; for OBJECT's turn, and asking them a tick early changes the film.)
(defun most-time-to-turn-round ()
  (*$ 3.0 .5 (float (ask dynamic-constants recall your time-to-turn-around))))

;; Whether the mover's last step waited for someone to move, the note taken away.
(defun waited-since-asked? (who)
  (let ((waited? (get who 'revival-waited)))
       (remprop who 'revival-waited)
       waited?))

;; Ani's most for the walk, as estimate-time-to-move-character makes it from a distance
;; and a speed (place.45:528-559): the distance go in arc gives the condition when first
;; asked, along the arc, and the mover's speed then. Made once, when the condition is
;; first asked; a step waited before this move began is no part of it. nil if there is
;; no speed to go by.
(defun most-time-for-move (condition who distance-left)
  (or (ask ,condition recall your revival-most-time)
      (let ((speed (ask ,(ask ,who recall your special-dynamics)
			yield real value for speed)))
	   (remprop who 'revival-waited)
	   (cond ((and (numberp distance-left) (numberp speed) (> speed 0.0))
		  (ask ,condition set your revival-most-time to
		       ,(*$ 2.5 ;;the most, as Ani estimates it
			    (+$ (//$ (float distance-left) speed)
				.33)))))))) ;;a third of a second for easing in

;; As stop-after-so-many-seconds reckons it (dichar.103:484-487), from the movie's
;; frames a second and ticks a frame, which go in arc reads (dichar.103:165-166).
(defun seconds-a-tick ()
  (//$ (*$ (float :frames-per-second) (float :ticks-per-frame))))

;; ACTION's plan, which faces the character at the start of a move, and is done as if
;; turned if the facing will never end.
(defun extend-facing-to-stop-turns-that-never-end ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(gradually face ?character towards ?position plus ?angle then %followup)
	plan
	(cond ((never-ending-turn? :self character position angle)
	       (ask :self !,followup)) ;;on, as if faced (do-set-turtle-gradually's end)
	      (t (ask-old :self gradually face ,character towards ,position plus ,angle
			  then !,followup))))))

;; go in arc, arc-stop-condition and director-character's careful step are DICHAR's,
;; so they are extended once DICHAR has loaded; the plan's facing is ACTION's
;; (action.152:309-322), which only the filming job loads, so it is extended once
;; ACTION has loaded.
(+after-load '|ken;dichar >|
  '(revival-once 'mend12-moves 'extend-go-in-arc-to-stop-moves-that-never-end))
(+after-load '|ken;action >|
  '(revival-once 'mend12-facing 'extend-facing-to-stop-turns-that-never-end))

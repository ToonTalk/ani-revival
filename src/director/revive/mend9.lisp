;;; -*-lisp-*-
;;; REVIVE;MEND9: M9, wander-around.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. When a character's only part in a subscene is a change of how it moves,
;;; SCENE extends the previous subscene by this one's time, so that what went on there
;;; goes on while the character changes (extend-last-actions-of, scene.9:223-240); in a
;;; scene's first subscene there is none, and SCENE plans (wander-around c) instead
;;; (plan your actions, scene.9:199-214; plan-something-if-only-changes, scene.9:216-221).
;;; No 1978 file defines wander-around, so pass 2 stopped:
;;; "WANDER-AROUND is not an actor", NO-SUCH-ACTOR. The thesis says what it is for:
;;; "If Ani cannot extend the previous subscene then the character in question will
;;; "wander around" so that the changes are apparent" (AI-TR-540 L3391-3393). It is
;;; defined here from DISPLY's parts, and a subscene that plans it notes that the plan
;;; is the revival's, named in SCENE:
;;;   (revival-repair: what defined-action was not-defined now (wander-around c)
;;;		       because (named-in scene))
;;; Cinderella never plans it: each of her characters with only changes is in a later
;;; subscene, whose previous one Ani extends (kept-apart's joy extends the standing
;;; guard, L3381-3383). reports/chapter-x/PLAN.md gives wander-around its plan receiver
;;; in CHANGE (item 3); it is here because new stories stop on it without any change
;;; of CHANGE's: a first scene that only establishes feelings (the reviewers' fox and
;;; crow), a last one (test/stories/tortoise-and-hare.lisp's the-finish).
;;;
;;; The wander. Ken's own wandering is the Prince's in Kept Apart, "the Prince wanders
;;; across the screen while Cinderella and her stepmother are performing the "standing
;;; guard" routine" (L6723-6725): make-guarding-more-interesting, a walk of one with
;;; nothing else planned, for the subscene's running time (disply.311:533-556). That
;;; walk fits the Prince's speed to the time; a wander is there so that changes of the
;;; character's speed and path show, so it keeps the dynamics Ani chose for the
;;; character in the subscene, which the changes then change as it walks (run-change-to,
;;; disply.311:1079-1096; dichar.103:102-121). So the character walks across the stage
;;; and back, to the place good-distance-from finds for it, the farthest of the middle
;;; and the corners (interf.149:595-616), as many times as fit the subscene's running
;;; time, each walk stopping when it is there or its share of the time is up, as
;;; goes-to-and-accompanys' walk together stops (disply.311:219-222). So the wander ends
;;; with the subscene's time, whatever the walks would take.

;;; ------------------------------------------------- the actor

;; SCENE's plan your actions asks the action's actor for an interned offspring and asks
;; that to plan the action in the subscene; the plan it returns goes on the subscene's
;; list of plans (scene.9:199-214), as the plans of DISACT's hit and walk do
;; (disact.7:14-47). wander-around is a display method, as REVIVE;MEND5's move-to is:
;; the subscene can then recall or estimate its time as it does any of DISPLY's
;; methods' (disply.311:12-16), here how long one walk across the stage takes.
(defun define-wander-around ()
  (let ((:insert-methods-at-end nil))
       (define wander-around display-method)
       (define-receiver (plan wander-around ?character in ?subscene) wander-around
	(revival-note subscene 'defined-action 'not-defined
		      '(wander-around ,character) '(named-in scene))
	(or (located? '(vicinity-of ,character) subscene)
	    (place-to-wander character subscene))
	(plan-to-wander character subscene))
       (define-receiver (estimate time for wander-around ?character in ?subscene)
			wander-around
	(estimate-time-to-move-character character
					 (across-the-stage)
					 '(stop-when-there (quote ,subscene))
					 (special-dynamics-of character subscene)
					 subscene))))

;; The length of a walk across the stage: the diagonal between two of the corners
;; good-distance-from picks among (interf.149:604-608), as a fraction of the screen.
(defun across-the-stage ()
  (distance-of-xy (distance-between '(screen-position upper left)
				    '(screen-position lower right)
				    nil))) ;;just the two screen positions, no subscene's places

;;; ------------------------------------------------- a place to wander from

;; One with no place yet, in a story's first scene or not on the stage when the last
;; scene ended (its POSIT file has only those who were, aninit.65:158-175), is placed
;; as PLACE places the second of two characters: a medium distance from one already
;; placed (medium-distance, place.45:499-509), or in the middle if no one is. Its
;; place's reason, as Ken's are: (so that (wander-around c)).
(defun place-to-wander (character subscene)
  (pick-location-for character
		     (let ((other (someone-placed-in subscene character)))
			  (cond (other '(medium-distance (vicinity-of ,other)))
				(t '(screen-position middle middle))))
		     '(so that (wander-around ,character))
		     subscene))

(defun someone-placed-in (subscene wanderer)
  (do ((i (ask character recall your offspring) (rest i)))
      ((null i) nil)
      (and (not (eq (first i) wanderer))
	   (located? '(vicinity-of ,(first i)) subscene)
	   (return (first i)))))

;;; ------------------------------------------------- the walks

;; The plan: its walks one after another, each planned as DISACT's walk plans a walk,
;; with plan-walk-itself (disact.7:30-37, 63-77), to the stationary target
;; (good-distance-from (vicinity-of c)), which Director works out where the walk
;; starts (action.152:285-291). The dynamics are the character's in the subscene, not
;; stretched (multiply-speed-by-factor by 1.0, as Ken's walks get their own copy to
;; print to Director, place.45:452-461).
(defun plan-to-wander (character subscene)
  (let ((plan (ask plan if new make ,(activity-name-of 'wander-around)))
	(special-dynamics (multiply-speed-by-factor character 1.0 subscene))
	(running-time (float (or (ask ,subscene recall your running-time) 0.0)))
	(walk-across
	 (get (ask wander-around recall or estimate time for (wander-around ,character)
		   in ,subscene)
	      'ideal)))
       (let ((walks (max 1 (fix (+$ .5 (//$ running-time walk-across))))))
	    (ask ,subscene add ,special-dynamics to your list of special-dynamics)
	    (ask ,plan set your begin-time to 0.0) ;;at the beginning of the subscene
	    (ask ,plan set your subscene to ,subscene)
	    (ask ,plan add (sequence: !,(walks-to-wander plan character walks
							 (//$ running-time (float walks))
							 special-dynamics subscene))
		 to your list of plans)
	    (join-the-movements plan subscene)
	    plan)))

;; walks walks, each stopping when there or after seconds.
(defun walks-to-wander (plan character walks seconds special-dynamics subscene)
  (do ((i walks (1- i))
       (plans nil
	      (cons (plan-walk-itself plan
				      (list character)
				      '(good-distance-from (vicinity-of ,character))
				      'stationary-target
				      '(stop-if-either-wants-to
					(stop-after-so-many-seconds ,seconds)
					(stop-when-there (quote ,subscene)))
				      special-dynamics
				      'careful) ;;of collisions
		    plans)))
      ((= i 0) plans)))

;; Director runs a subscene's movements and its changes together, and a subscene with
;; no movements all its plans (director-subscene, action.152:21, 41, 45-48). The plans
;; of DISPLY's methods are named in the movements their methods add (run your methods,
;; before plan your actions, scene.9:159-183; run.65:54-55); nothing names a wander, so
;; when the subscene has movements the wander joins them, to run alongside.
(defun join-the-movements (plan subscene)
  (and (ask ,subscene recall your movements)
       (ask ,subscene add ,plan to your list of movements)))

;; Unlike move-character (place.45:151-172), the wander tells the next subscene nothing
;; of where the character will be: where its last walk ends depends on where Director
;; has it then. Pass 2 goes on from where it was placed, as it does for one who stands
;; still.

;; wander-around is an actor of DISPLY's that DISPLY doesn't define, so the tags give
;; it DISPLY as its file, as they give DISPLY's own actors (src/director/tags/ani.lisp,
;; as load.33 fills them), and as REVIVE;MEND5 gives move-to: exists? then knows it
;; before DISPLY has loaded, and asking it, as plan your actions does, loads DISPLY,
;; after which it is defined.
(defprop wander-around |KEN;DISPLY| actor-load)

(+after-load '|ken;disply >| '(revival-once 'mend9-wander-around 'define-wander-around))

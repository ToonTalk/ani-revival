;;; -*-lisp-*-
;;; REVIVE;SEEN: a character whose part is only changes wanders while they run, once nothing else moves her.
;;;
;;; This file is ours, not Ken's. It is the "seen" extension (src/pipeline.js,
;;; EXTENSIONS), a repair of the revival's that Ken approved after testing the film page
;;; (15 October 2026), switched on with MEND, KNOW, APPEAR and CHANGE. It is not in MEND,
;;; because it changes Ken's own Cinderella: his Meeting ends with the two joys of
;;; Cinderella and the Prince (cindy.46:137-138), a part of changes only, which at 24
;;; frames a second runs on for six seconds after their walk to each other has ended,
;;; with no one moving (reports/ext/seen/README.md).
;;;
;;; What Ken's SCENE does. A feeling, in Ani, changes how a character moves: joy, say,
;;; makes her faster and bouncier (emote.9:11-60). "The problem with these suggestions is
;;; that they cannot stand alone. If nothing else is happening during the subscene in
;;; which these changes are to be displayed, then Ani tries to extend the length of the
;;; previous activity. It is during the extended part of the previous subscene that the
;;; dynamics of the characters changes ... If Ani cannot extend the previous subscene
;;; then the character in question will "wander around" so that the changes are
;;; apparent" (AI-TR-540 pp. 125-126, L3377-3393). So SCENE, planning a subscene in
;;; which a character has only changes (plan your actions, scene.9:199-214), extends the
;;; previous subscene by this one's time (extend-last-actions-of, scene.9:219-240), or,
;;; in a scene's first subscene, plans (wander-around c) (scene.9:216-218; REVIVE;MEND9
;;; defines it).
;;;
;;; What goes wrong. The extended activity is planned to fill the extended time, but in
;;; Director it can end before the changes do, and a character may have had no part in
;;; it at all. Director takes four times as long over a change at high speed as Ani's
;;; estimate of it (the inversion REVIVE;SLIPS9 corrects, opt-in), so a feeling's part
;;; planned for 3.5 seconds runs for 14. In Ken's Meeting at 24 frames a second, the
;;; joys run on from frame 899, when Cinderella and the Prince have met, to 1,049, and
;;; no one moves; in his cinderella-beautified scene, from frame 91, when Cinderella's
;;; wander of the transformation ends, to 135, while her joy and the fairy godmother's
;;; run, the fairy godmother having stood by since frame 4. The changes are there, but
;;; nothing shows them: a character standing still shows no change of speed or path.
;;;
;;; The repair. In every subscene in which a character has only changes, as SCENE
;;; finds them, she also wanders, so that the changes are apparent, SCENE's own reason
;;; for wander-around, applied beyond the start of the scene where SCENE asks for it:
;;;  - only once nothing else moves her: Director's plans of the subscene and of the one
;;;    it extends that move her (her walks, turns and hits, a walk of another's with her,
;;;    REVIVE;MEND9's wander-around), each ended, so that she is never moved two ways at
;;;    once (REVIVE;MEND12's "two moves at once");
;;;  - not at all if one of those is repeated: a repeated activity of the part SCENE
;;;    extends is stretched over the extended time, so that "what went on there goes
;;;    on" while she changes, and moves her until its part ends; in Ken's Kept Apart the
;;;    stepmother and Cinderella stand guard to the end, as in 1978;
;;;  - only while her changes in the subscene are still running, as ACTION's record of
;;;    what is still running has them (set-up-running-actions, action.152:148-157), so
;;;    that she stops when her feeling is done;
;;;  - each walk as REVIVE;MEND9's wander-around walks: across the stage and back, to the
;;;    place good-distance-from finds, the farthest of the middle and the corners
;;;    (interf.149:595-616), careful of collisions, stopping when she is there or her
;;;    changes have ended; with dynamics of its own, a child of hers in the subscene, as
;;;    Ken's walks have (multiply-dynamics-by-factor, place.45:452-461), so that the
;;;    changes, which grow the subscene's dynamics and hers (dichar.103:102-121), show in
;;;    how she walks;
;;;  - only if she is on the stage when the subscene begins: one who has left is not
;;;    brought back;
;;;  - and the film waits while she wanders: Director stops it when the part a part of
;;;    only changes extends ends (action.152:62-91), as it cut Ken's Meeting's joys short
;;;    at 4 frames a second; as REVIVE;CHSHOW keeps filming while a change is shown, the
;;;    film is not stopped while a wander of SEEN's waits or walks with her changes still
;;;    running;
;;;  - and nothing else of the film is moved: the part of only changes ends when its
;;;    changes do, as without SEEN, so that where your Director stops a film as a part
;;;    ends (cutting short the activity a feeling's part extends, stage 6's finding 7),
;;;    it stops it at the tick it did.
;;; Two plans do it, both the subscene's, as Ken's methods' plans are, run from its
;;; initial actions rather than among its movements: waiting-to-wander, which ends once
;;; nothing else moves her (or her changes have ended), and wandering-while-changes-run,
;;; which begins when it ends ((after (end-of ...) 0.0), as goes-to-and-accompanys begins
;;; its accompanying, disply.311:224), and walks while her changes run. The subscene
;;; notes the repair:
;;;   (revival-repair: what nothing-to-do was (stands-still cinderella)
;;;		     now (wander-while-changes-run cinderella)
;;;		     because (so that the changes are apparent thesis 126))
;;; and the wandering plan memorizes what it waits for and why, for the glass box:
;;;   (wanders: character cinderella while (changes-for cinderella)
;;;	       in (subscene-of cinderella-beautified 2) after (activity-of waiting-to-wander 7)
;;;	       once-nothing-moves-her-in ((subscene-of cinderella-beautified 2)
;;;					  (subscene-of cinderella-beautified 1))
;;;	       because (so that the changes are apparent thesis 126))
;;; With SEEN off, everything is as before: Ani as in 1978 and MEND alone make Ken's
;;; Cinderella byte for byte (node tools/check-1978.mjs, --extensions mend).

;;; ------------------------------------------------- SCENE: who has only changes

;; Ken's plan-something-if-only-changes (scene.9:216-221) gives SCENE the actions to plan
;; for a character with only changes in a subscene: (wander-around c) in the first,
;; none in a later one, whose previous subscene it extends. SEEN adds one more,
;; (wander-while-changes-run c), which SCENE plans after those, as it plans any action
;; (scene.9:203-214), if she is on the stage, and if no repeated activity moves her: a
;; (repeat n ...) of the subscene's movements, or of the one SCENE has just extended for
;; this one, is stretched over the subscene's time with the rest of its methods
;; (scene.9:159-183, 223-240), so that "what went on there goes on" while she changes,
;; and moves her until its part ends: Ken's Kept Apart, where the stepmother's and
;; Cinderella's joys extend the standing guard (L3381-3383), is left as it was.
(defun plan-something-if-only-changes-and-seen (character subscene)
  (let ((actions (funcall (revival-wrapped 'plan-something-if-only-changes 'seen)
			  character subscene)))
       (cond ((and (on-the-stage-in? character subscene)
		   (not (carried-by-a-repeat? character subscene)))
	      (append actions (list (list 'wander-while-changes-run character))))
	     (t actions))))

(+after-load '|ken;scene >|
  '(revival-wrap 'plan-something-if-only-changes 'seen 'plan-something-if-only-changes-and-seen))

;; Whether the character is on the stage as the subscene begins, where INTERF finds her
;; (find-xy-position, interf.149:172-173): an xy-position within the screen's half-widths
;; (move-from-xy-position-1's test, interf.149:111), or a symbolic one, which is somewhere
;; on the stage another character is (contact-with ..., say); not one with no place.
(defun on-the-stage-in? (character subscene)
  (let ((where (find-xy-position '(vicinity-of ,character) subscene)))
       (cond ((eq (first where) 'symbolic-position) t)
	     ((eq (first where) 'xy-position)
	      (and (< (abs (second where)) .5) (< (abs (third where)) .5)))
	     (t nil))))

;;; ------------------------------------------------- the action

;; wander-while-changes-run is a display method, as REVIVE;MEND9's wander-around is, whose
;; plan receiver SCENE asks (plan your actions, scene.9:207-210).
(defun define-wander-while-changes-run ()
  (let ((:insert-methods-at-end nil))
       (define wander-while-changes-run display-method)
       (define-receiver (plan wander-while-changes-run ?character in ?subscene)
			wander-while-changes-run
	(revival-note subscene 'nothing-to-do (list 'stands-still character)
		      (list 'wander-while-changes-run character)
		      '(so that the changes are apparent thesis 126))
	(plan-to-wander-while-changes-run character subscene))))

(+after-load '|ken;disply >| '(revival-once 'seen-wander 'define-wander-while-changes-run))

;; An actor of DISPLY's that DISPLY doesn't define, so the tags give it DISPLY as its
;; file, as they give REVIVE;MEND9's wander-around.
(defprop wander-while-changes-run |KEN;DISPLY| actor-load)

;; The two plans: waiting-to-wander, from the subscene's beginning, and
;; wandering-while-changes-run, after it. SCENE adds the plan it returns to the
;; subscene's plans (scene.9:208-210); the other is added here. They are not among the
;; subscene's movements, which Director runs with its changes and waits for before the
;; subscene ends (plan everything, action.152:23-43): the subscene ends when its changes
;; do, as without SEEN, so that Director's stopping of the film, which hangs on the tick
;; a part ends (action.152:62-91, the cut stage 6 found, its finding 7), comes when it
;; came. Director runs them from the subscene's initial actions, (run (activity-of ...)
;; then see if everybody is done) (action.152:160-166), after the subscene's own (her
;; dynamics in it), each prepared to begin on an event (action.152:214-238): the waiting
;; one when the subscene's beginning is noted, which Director does once its initial
;; actions are done and just before it runs its changes (action.152:36-43), so that her
;; changes are running when it first looks; the wandering one when the waiting one ends.
;; A subscene that had no movements of its own is given Ken's
;; default ones without them (keep-seens-plans-out-of-the-movements, below).
(defun plan-to-wander-while-changes-run (character subscene)
  (let ((parts (parts-to-watch subscene))
	(waiting (ask plan if new make ,(activity-name-of 'waiting-to-wander)))
	(wandering (ask plan if new make ,(activity-name-of 'wandering-while-changes-run))))
       ;;as the subscene begins, once its changes are running
       (ask ,waiting set your begin-time to (after (beginning-of ,subscene) 0.0))
       (ask ,waiting set your subscene to ,subscene)
       (ask ,waiting add (ask ,waiting wait until ,character is moved by nothing in ,parts
			      or ,subscene changes end)
	    to your list of plans)
       (ask ,wandering set your begin-time to (after (end-of ,waiting) 0.0))
       (ask ,wandering set your subscene to ,subscene)
       (ask ,wandering add (ask ,wandering wander ,character while changes run in ,subscene)
	    to your list of plans)
       (ask ,wandering memorize
	    (wanders: character ,character while (changes-for ,character) in ,subscene
		      after ,waiting once-nothing-moves-her-in ,parts
		      because (so that the changes are apparent thesis 126)))
       (ask ,subscene add ,waiting to your list of plans)
       ;;after the subscene's own initial actions (her dynamics in it, run-change-to,
       ;;disply.311:1087-1089)
       (ask ,subscene set your initial-actions to
	    ,(append (ask ,subscene recall your initial-actions)
		     (list (list 'run waiting 'then 'see 'if 'everybody 'is 'done)
			   (list 'run wandering 'then 'see 'if 'everybody 'is 'done))))
       wandering))

;; Director runs a subscene's movements, or all its plans if it has none
;; (director-subscene, action.152:45-48). Once SCENE has planned a subscene's actions
;; (plan your actions, scene.9:199-214), one with SEEN's plans and no movements is given
;; the movements Director would have made of its other plans, ((and p ...)), so that
;; SEEN's are run only from its initial actions.
(defun define-seens-plans-kept-out ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (plan your actions) subscene
	(ask-old :self plan your actions)
	(keep-seens-plans-out-of-the-movements :self))))

(+after-load '|ken;scene >| '(revival-once 'seen-movements 'define-seens-plans-kept-out))

(defun keep-seens-plans-out-of-the-movements (subscene)
  (let ((plans (ask ,subscene recall your plans)))
       (and (do ((p plans (rest p))) ((null p) nil) (and (seens-plan? (first p)) (return t)))
	    (null (ask ,subscene recall your movements))
	    (ask ,subscene set your movements to
		 ((and !,(mapcan (function (lambda (p) (and (not (seens-plan? p)) (list p))))
				 plans)))))))

;;; ------------------------------------------------- what else moves her

;; The parts whose plans may move her while her changes run: the subscene and, after
;; the first, the one before it, which SCENE extends for this one (extend-last-actions-of,
;; scene.9:223-240). Which of their plans move her Director reads as it runs them, from
;; the plans the program gives them (nothing-moves-her-in?, below): SCENE may plan the
;; part before again after this one is planned (it is restored and planned anew when a
;; part extends it, scene.9:229-239), and its plans are named anew.
(defun parts-to-watch (subscene)
  (let ((previous (previous-subscene-of subscene)))
       (cond (previous (list subscene previous))
	     (t (list subscene)))))

(defun previous-subscene-of (subscene)
  (and (> (ask ,subscene recall your order-in-scene) 1)
       (ask ,subscene recall your previous-subscene)))

;; Whether a plan that moves her, in the subscene or the one before it, is repeated: in a
;; (repeat n ...) of its subscene's movements (action.152:94-111).
(defun carried-by-a-repeat? (character subscene)
  (do ((s (list subscene (previous-subscene-of subscene)) (rest s)))
      ((null s) nil)
      (and (first s)
	   (let ((movements (ask ,(first s) recall your movements)))
		(do ((p (plans-that-move character (first s)) (rest p)))
		    ((null p) nil)
		    (and (repeated-in? (first p) movements) (return t))))
	   (return t))))

;; The names of the subscene's plans that move her: those of the actions SCENE plans
;; (each subscene's (actions-of c), which DISPLY's methods add before SCENE plans them,
;; place.45:151-216, and DISACT plans as walks, hits and turns, disact.7:14-91), and
;; those of the plans already made whose Lisp has her move (made by a plan receiver of
;; their own, as REVIVE;MEND9's wander-around is, or with face-character-towards-others,
;; place.45:218-236).
(defun plans-that-move (character subscene)
  (append
   (mapcan (function
	    (lambda (other)
		    (mapcan (function
			     (lambda (action)
				     (and (memq character (movers-of-action action))
					  (list (second (memq 'called action))))))
			    (ask ,subscene recall your (actions-of ,other)))))
	   (ask character recall your offspring))
   (mapcan (function
	    (lambda (plan)
		    (and (moves-in-lisp? character (ask ,plan recall your plans))
			 (list plan))))
	   (ask ,subscene recall your plans))))

;; Who an action moves: (walk of c to ...) and (walk of c with d to ...) (move-character
;; and move-characters, place.45:151-216), (turning of c ...) (turn-character,
;; place.45:212-216), (hit v by c ...) (disact.7:14-26): the walker and the one with her,
;; the one turning, the hitter.
(defun movers-of-action (action)
  (cond ((atom action) nil)
	((eq (first action) 'hit) (list (second (memq 'by action))))
	((memq (first action) '(walk turning))
	 (append (list (second (memq 'of action)))
		 (and (eq (fourth action) 'with) (list (nth 4 action)))))
	(t nil)))

;; Whether a plan's Lisp has her move: (ask p cause c to ...) or (ask p cause (c d) to
;; ...) (disact.7:14-91), or (ask p gradually face c towards ...) (place.45:218-236).
(defun moves-in-lisp? (character lisp)
  (cond ((atom lisp) nil)
	((and (eq (first lisp) 'ask) (eq (third lisp) 'cause))
	 (let ((who (fourth lisp)))
	      (cond ((atom who) (eq who character))
		    (t (memq character who)))))
	((and (eq (first lisp) 'ask) (eq (third lisp) 'gradually) (eq (fourth lisp) 'face))
	 (eq (nth 4 lisp) character))
	(t (do ((l lisp (rest l)))
	       ((atom l) nil)
	       (and (moves-in-lisp? character (first l)) (return t))))))

;; Whether a plan is within a (repeat n ...) of the movements.
(defun repeated-in? (plan movements)
  (cond ((atom movements) nil)
	((and (eq (first movements) 'repeat) (in-lisp? plan movements)) t)
	(t (do ((m movements (rest m)))
	       ((atom m) nil)
	       (and (repeated-in? plan (first m)) (return t))))))

(defun in-lisp? (x lisp)
  (cond ((equal x lisp) t)
	((atom lisp) nil)
	(t (do ((l lisp (rest l)))
	       ((atom l) nil)
	       (and (in-lisp? x (first l)) (return t))))))

;;; ------------------------------------------------- Director

;; Two messages of a plan's, as ACTION's plans have (action.152:278-390), and a stop
;; condition, in the idiom of Ken's arc stop conditions (dichar.103:401-499).
;;  - wait until c is moved by nothing in (s ...) or s changes end: done, the followup,
;;    when each plan of those parts that moves her has ended (the movie has its end, at
;;    or after its beginning, action.152:51-53), or when her changes in s have ended; otherwise
;;    asked again the next tick, as Ken's director-character asks itself again while it
;;    is still off the stage (dichar.103:51-59).
;;  - wander c while changes run in s: while her changes in s run, a walk, as
;;    REVIVE;MEND9's (plan-walk-itself, disact.7:63-77): her special dynamics a child of
;;    hers in s, her curvature sign towards the place, and the walk, careful of
;;    collisions, to the farthest of the middle and the corners (good-distance-from,
;;    interf.149:595-616), stopping when she is there or her changes have ended; then the
;;    same again. Once they have ended, the followup. Not for one not shown on the stage
;;    (her visibility, object.401:91-103).
(defun define-the-wander-for-director ()
  (let ((:insert-methods-at-end nil))
       (define-receiver
	{and ?the-whole-message
	     (wait until ?character is moved by nothing in ?parts or ?subscene changes end
		   %followup)}
	plan
	(cond ((or (not (changes-still-running? character subscene))
		   (nothing-moves-her-in? character parts))
	       (and (eq (first followup) 'then) (ask :self !,(rest followup))))
	      (t (ask :self plan next !,the-whole-message))))
       (define-receiver (wander ?character while changes run in ?subscene %followup) plan
	(cond ((and (changes-still-running? character subscene)
		    (ask ,character recall your visibility))
	       (ask ,character set your special-dynamics to
		    ,(dynamics-for-a-walk character subscene))
	       (ask ,character initialize your curvature-sign towards
		    (good-distance-from (vicinity-of ,character)))
	       (ask :self cause (,character) to gradually go in arc careful of collisions
		    to (good-distance-from (vicinity-of ,character)) as stationary-target
		    stopping if (stop-if-either-wants-to
				 (stop-when-changes-ended (quote ,character) (quote ,subscene))
				 (stop-when-there (quote ,subscene)))
		    then wander ,character while changes run in ,subscene !,followup))
	      (t ;;her changes have ended: if the film waited for her, Director is asked
		 ;;again to stop it, the tick after, as a part asks when it ends
		 ;;(action.152:77-78): nothing else may end to ask
		 (and (ask :self recall if any items match
			   (revival-repair: what film-waited-for-wander %))
		      (ask ,subscene plan next stop film if nothing running))
		 (and (eq (first followup) 'then) (ask :self !,(rest followup))))))))

(+after-load '|ken;action >| '(revival-once 'seen-director 'define-the-wander-for-director))

(defun define-stop-when-changes-ended ()
  (let ((:insert-methods-at-end nil))
       (define changes-ended-condition arc-stop-condition)
       (define-receiver (should ? stop after moving ? of ? to ?) changes-ended-condition
	(and (not (changes-still-running? (ask :self recall your character)
					  (ask :self recall your subscene)))
	     0.0)))) ;;done and don't go anymore

(+after-load '|ken;dichar >| '(revival-once 'seen-stop 'define-stop-when-changes-ended))

(defun stop-when-changes-ended (character subscene)
  (let ((condition (ask changes-ended-condition make uninterned offspring)))
       (ask ,condition set your character to ,character)
       (ask ,condition set your subscene to ,subscene)
       condition))

;; Whether any of her changes in the subscene is still running: one of ACTION's lists of
;; the actions still running there, kept under a name made by append-atoms
;; (set-up-running-actions, action.152:148-157), has one of hers, (ask cinderella
;; gradually change by 1.5 factor for speed at high speed): the subscene's changes are
;; run so (plan everything, action.152:23-43), and taken off the list as each ends. A
;; subscene with no such list yet has begun this tick and is about to run them (its
;; beginning is noted, and what waits for it runs, just before, action.152:36-43): they
;; are still to run.
(defun changes-still-running? (character subscene)
  (do ((v (ask ,subscene list all your variable names) (rest v))
       (lists nil))
      ((null v) (not lists))
      (cond ((still-running-list? (first v))
	     (setq lists t)
	     (and (has-a-change-of? character (ask ,subscene recall your ,(first v)))
		  (return t))))))

(defun still-running-list? (name)
  (and name (atom name) (symbolp name)
       (do ((c (explodec name) (rest c))
	    (p (explodec 'actions-still-running-) (rest p)))
	   ((null p) t)
	   (or (and c (eq (first c) (first p))) (return nil)))))

(defun has-a-change-of? (character actions)
  (do ((a actions (rest a)))
      ((atom a) nil)
      (and (not (atom (first a)))
	   (eq (first (first a)) 'ask)
	   (eq (second (first a)) character)
	   (return t))))

;; Whether nothing in the parts moves her: each plan of theirs whose Lisp has her move
;; (moves-in-lisp?, as the program gives it, action.152:278-322), but SEEN's own, has
;; ended. A repeated plan, which begins again after it ends (action.152:94-111), has no
;; wander planned beside it (carried-by-a-repeat?).
(defun nothing-moves-her-in? (character parts)
  (do ((p (apply 'append (mapcar (function (lambda (part) (append (ask ,part recall your plans) nil)))
				 parts))
	  (rest p)))
      ((null p) t)
      (and (not (seens-plan? (first p)))
	   (moves-in-lisp? character (ask ,(first p) recall your plans))
	   (not (all-ended? (list (first p))))
	   (return nil))))

(defun seens-plan? (plan)
  (and (not (atom plan)) (eq (first plan) 'activity-of)
       (memq (second plan) '(waiting-to-wander wandering-while-changes-run))))

;; Whether each plan has ended: the movie has its end, at or after its beginning.
(defun all-ended? (names)
  (let ((movie (ask movie recall your current-movie)))
       (do ((n names (rest n)))
	   ((null n) t)
	   (let ((began (ask ,movie recall your (beginning-of ,(first n))))
		 (ended (ask ,movie recall your (end-of ,(first n)))))
		(or (and (numberp began) (numberp ended) (not (< ended began)))
		    (return nil))))))

;;; ------------------------------------------------- the film waits for a wander

;; When a part ends, every part of the scene is told, and each tells the parts that extend
;; it that they have ended too and asks Director, the tick after, to stop the film if
;; nothing is running or planned (action.152:62-91); a part of only changes extends
;; another and is never one of the running parts (action.152:61-63), and the universe's
;; list of actors to run next is empty while the actors tick (REVIVE;BRIDGE), so when the
;; part it extends ends, the film stops with its changes still running: the end of Ken's
;; Meeting at 4 frames a second, the two joys cut short (reports/ext/appear/README.md),
;; and so the wander SEEN plans to show them. As REVIVE;CHSHOW keeps filming while a part
;; that shows a change runs, the film is not stopped while a wander SEEN planned is
;; waiting or walking with her changes still running: its waiting plan has begun, its
;; wandering plan has not ended, and her changes in its part run (changes-still-running?).
;; Otherwise Director's own rule decides, at the tick it would have without SEEN: in a
;; scene where a feeling's part ends before the activity it extends, your Director stops
;; the film there or not as it would. When a wander the film waited for ends, it asks
;; Director again, as a part does when it ends. The plan the film waited for is noted,
;; once:
;;   (revival-repair: what film-waited-for-wander was stopped now kept-filming
;;		     because (a wander at frame 175))
(defun define-the-film-waits-for-a-wander ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (stop film if nothing running) director-subscene
	(let ((plan (wander-in-progress :self)))
	     (cond (plan (note-the-film-waited-for-wander plan))
		   (t (ask-old :self stop film if nothing running)))))))

(+after-load '|ken;action >| '(revival-once 'seen-film-waits 'define-the-film-waits-for-a-wander))

;; A wandering plan of the scene's parts whose waiting plan has begun, which has not
;; ended, as the movie keeps their events (action.152:52), and whose character's changes
;; in its part still run, or nil.
(defun wander-in-progress (subscene)
  (let ((movie (ask movie recall your current-movie)))
       (do ((p (apply 'append
		      (mapcar (function (lambda (s) (append (ask ,s recall your plans) nil)))
			      (ask ,subscene ask your scene to recall your subscenes)))
	       (rest p)))
	   ((null p) nil)
	   (let ((waiting (waiting-plan-of (first p))))
		(and waiting
		     (ask ,movie recall your (beginning-of ,waiting))
		     (null (ask ,movie recall your (end-of ,(first p))))
		     (let ((wander (first (ask ,(first p) recall your plans))))
			  ;;(ask <plan> wander <character> while changes run in <part>)
			  (changes-still-running? (fourth wander) (first (last wander))))
		     (return (first p)))))))

;; The waiting plan of a wandering plan of SEEN's, from its begin time, (after (end-of
;; (activity-of waiting-to-wander n)) 0.0); nil for any other plan.
(defun waiting-plan-of (plan)
  (and (not (atom plan)) (eq (first plan) 'activity-of)
       (eq (second plan) 'wandering-while-changes-run)
       (second (second (ask ,plan recall your begin-time)))))

(defun note-the-film-waited-for-wander (plan)
  (or (ask ,plan recall if any items match (revival-repair: what film-waited-for-wander %))
      (revival-note plan 'film-waited-for-wander 'stopped 'kept-filming
		    (list 'a 'wander 'at 'frame
			  (ask movie ask your current-movie to recall your frame-count)))))

;; Dynamics for one walk: a child of hers in the subscene, (special-dynamics-of c in s),
;; with a speed factor of its own, 1.0, as Ken's walks' have (multiply-dynamics-by-
;; factor, place.45:452-461), new for each walk: Director multiplies a dynamics' factors
;; by its parent's each time it is set (dichar.103:27-31), and one set again would count
;; the changes so far twice. Hers as she is now if pass 2 made none for the subscene.
(defun dynamics-for-a-walk (character subscene)
  (let ((of-subscene (list 'special-dynamics-of character 'in subscene)))
       (let ((parent (cond ((actor-of of-subscene dont-autoload) of-subscene)
			   (t (ask ,character recall your special-dynamics)))))
	    (let ((dynamics (ask ,parent make uninterned offspring)))
		 (ask ,dynamics set your (speed factor) to 1.0)
		 dynamics))))

;;; -*-lisp-*-
;;; REVIVE;TIMELY: Director keeps to the times Ani planned, each part of a scene ending
;;; when Ani planned it to.
;;;
;;; This file is ours, not Ken's. TIMELY (src/pipeline.js, EXTENSIONS) is an opt-in
;;; repair, as SLIPS and DETAIL are: off unless ticked, never among the switch's six,
;;; never in "Ani as in 1978". Ken asked for it on 22 October 2026, after a film of his
;;; Cinderella set to (interval (minutes 1) (minutes 1)) with every scene short: Ani
;;; planned about 61 seconds and Director filmed 82 (reports/ext/timely/README.md). It
;;; requires FIT, which keeps a scene's plan within its length, and CHANGE, whose change
;;; over seconds (REVIVE;CHSHOW) it uses.
;;;
;;; Why the film can be longer than the plan. "Ani tries to constrain the film to be a
;;; (user) desired length. Ani must often arbitrate between the different activities by
;;; stretching or shortening them" (AI-TR-540 p. 126, L3394-3401). Ani does this in its
;;; plan: SCENE gives each part (subscene) a running time and stretches the speeds of
;;; its ways of showing to fill it (run your methods, scene.9:159-183, stretched-by).
;;; Director then realizes the plan as it is written, not by the clock:
;;;  - a walk goes until it gets there, or has gone its original distance (go in arc,
;;;    dichar.103:156-200, with stop-when-there and move-only-original-distance,
;;;    dichar.103:401-499); a stretch makes it faster or slower, but where the
;;;    distances, the curves of the path (correction-for-longer-path, dichar.103:203-207),
;;;    the targets that move away, or the collisions waited out differ from Ani's
;;;    estimates, it takes the time it takes;
;;;  - a change of how a character moves takes the time its speed gives it,
;;;    time-to-grow-e-times by the speed's weight by the logarithm of its factor
;;;    (gradually change, dichar.103:102-121), not the time Ani gave its part; and at
;;;    high speed four times Ani's estimate (the inversion SLIPS' S9 corrects);
;;;  - the pauses within a way of showing, a pursuer starting half a second after the one
;;;    pursued (begin-time (after (beginning-of ...) 0.5), disply.311:47-82), are
;;;    seconds written into Ken's methods, which SCENE's stretch doesn't reach.
;;; Ken's Director measures the difference itself: at the end of each part ACTION keeps
;;; how far it ran from its estimate (subtract-elapsed-from-estimated-time,
;;; action.152:59-61, 69-76, time-estimate-error-for), and nothing reads it. In a film
;;; of one minute with every scene short, the parts are squeezed to a fifth of their
;;; ideal and these differences no longer cancel.
;;;
;;; The repair. When a part begins, Director knows from Ani's plan when it is to end:
;;; its running time after its beginning (a part of only changes begins its own time
;;; after the part it extends, scene.9:223-240). Then, as the part runs:
;;;  timely-change  a change of how a character moves, or of how she looks, that would run
;;;                 past the part's planned end is made over the seconds left instead, as
;;;                 REVIVE;CHSHOW makes a change over seconds (its factor reached the same,
;;;                 faster); a change that ends in time is Ken's (or SLIPS') as it was;
;;;  timely-walk    each tick of a walk, if what is left of it (to its goal, or of its
;;;                 original distance, or of its seconds, whichever stops it first) would
;;;                 take more ticks at its speed than are left in the part, its speed that
;;;                 tick is raised by the ratio, at most four times (the most of Ken's own
;;;                 range of speeds, low to high, weightify, interf.149:899-904); a walk
;;;                 that ends in time is as it was;
;;;  timely-cut     the last resort: a walk still going when its part's time is up ends
;;;                 there, as if it had got there, its plan's finish done (the "then" of
;;;                 stop-when-there-then); a walk that begins after its part's time is up
;;;                 takes one step, at four times its speed, and ends (so that walks that
;;;                 follow each other, a wander's, go a tick at a time);
;;;  timely-turn    a facing (the turn at the start of a walk, or towards a place) is
;;;                 quickened the same way, its rotational speed raised by the ratio of
;;;                 the degrees left to the ticks left, at most four times (and four times
;;;                 once the part's time is up); DICHAR's gradual turns by so many degrees,
;;;                 OBJECT's gradually right (alternately-turn's), are not reached;
;;;  timely-pause   a step of a way of showing that is to begin after a pause that would
;;;                 end past the part's planned end begins at the end instead.
;;; A walk that is stopped by another (will-be-stopped-by-other, dichar.103:497-498) is
;;; left to the other. A hit and its retreat, and a part of no planned time, are as they
;;; were. Each piece can be turned off on its own, (setq :timely-off
;;; '(timely-walk)) before the files load.
;;;
;;; The notes, on the part, while filming:
;;;   (revival-repair: what change-kept-to-time
;;;		     was (step-mother path-curvature by 4.0 at high speed in 13.86 seconds)
;;;		     now (in 4.84 seconds) because (part-ends-in 4.84 seconds))
;;;   (revival-repair: what walk-quickened was (cinderella (needed 50 ticks of 20))
;;;		     now (speed by 2.5) because (part-ends-at-frame 301))
;;;	 once for each character in the part, with the most it was quickened by, and
;;;	 turn-quickened likewise for the turns;
;;;   (revival-repair: what walk-cut-short was (cinderella going-to <goal>)
;;;		     now stopped-as-if-there because (part-ended-at-frame 301))
;;;   (revival-repair: what pause-shortened was ((activity-of chaser-pursues 1) 0.5)
;;;		     now 0.21 because (part-ends-in 0.21 seconds))

(or (boundp ':timely-off) (setq :timely-off nil))
(or (boundp ':timely-hurry) (setq :timely-hurry nil))
;; ((part begin-frame end-frame) ...), each part as it begins
(or (boundp ':timely-parts) (setq :timely-parts nil))
;; (((part who kind) most first-frame needed left) ...), each walk or turn quickened (kind
;; walk-quickened or turn-quickened), until its part ends
(or (boundp ':timely-quickened) (setq :timely-quickened nil))
(setq :timely-most-quickening 4.0)

(defun timely-on? (id) (not (memq id :timely-off)))

;;; ---------------------------------------------------------------- the parts' times

(defun timely-frame-now ()
  (ask movie ask your current-movie to recall your frame-count))

;; As the part begins (its own note of its beginning, action.152:38-41), when it is to
;; end: its running time from now, in frames.
(defun timely-part-begins (part)
  (let ((running (ask ,part recall your running-time))
	(now (timely-frame-now)))
       (and (numberp running)
	    (numberp now)
	    (setq :timely-parts
		  (cons (list part now (+ now (round (*$ (float running) (float :frames-per-second)))))
			(timely-forget part :timely-parts))))))

(defun timely-forget (part entries)
  (mapcan (function (lambda (e) (and (not (equal (first e) part)) (list e)))) entries))

;; The frame the part is to end at, or nil.
(defun timely-end-of (part)
  (let ((entry (assoc part :timely-parts)))
       (and entry (third entry))))

;; The ticks left before the part's planned end (none or less once it is past), or nil.
(defun timely-ticks-left (part)
  (let ((end (timely-end-of part)))
       (and end (* (- end (timely-frame-now)) :ticks-per-frame))))

(defun timely-seconds-a-tick ()
  (//$ (*$ (float :frames-per-second) (float :ticks-per-frame))))

;; The part a character's dynamics are of: her special dynamics in the part, or a walk's
;; child of them (REVIVE;WRAP subscene-of-dynamics).
(defun timely-part-of (character)
  (let ((dynamics (ask ,character recall your special-dynamics)))
       (and dynamics (subscene-of-dynamics dynamics))))

;; At the part's end, a note for each walk of it quickened, and the part forgotten.
(defun timely-part-ends (part)
  (mapc (function
	 (lambda (e)
		 (and (equal (first (first e)) part)
		      (let (((nil most first needed left) e))
			   (revival-note part (third (first e))
					 (list (second (first e))
					       (list 'needed needed 'ticks 'of left 'from-frame first))
					 (list 'speed 'by most)
					 (list 'part-ends-at-frame (timely-end-of part)))))))
	(reverse :timely-quickened))
  (setq :timely-quickened
	(mapcan (function (lambda (e) (and (not (equal (first (first e)) part)) (list e))))
		:timely-quickened)))

;;; ---------------------------------------------------------------- timely-change

;; The seconds Director's gradually change takes over a change by factor at speed: as
;; SLIPS counts its ticks (REVIVE;SLIPS9) if SLIPS is loaded, else as Ken's
;; (dichar.103:105-117).
(defun timely-change-seconds (factor speed)
  (*$ (cond ((getl 'gradual-change-ticks-to-grow-e '(expr subr lsubr))
	     (gradual-change-ticks-to-grow-e speed))
	    (t (*$ (ask dynamic-constants recall your time-to-grow-e-times)
		   (weightify speed)
		   (float :frames-per-second)
		   (float :ticks-per-frame))))
      (abs (log (float factor)))
      (timely-seconds-a-tick)))

;; The seconds left in the part for a change of character's that would take seconds,
;; with a note, if it would run past the part's planned end; else nil.
(defun timely-change-in (character what seconds)
  (let ((part (timely-part-of character)))
       (let ((left (and part (timely-on? 'timely-change) (timely-ticks-left part))))
	    (and left
		 (> seconds (+$ (*$ (float left) (timely-seconds-a-tick)) (timely-seconds-a-tick)))
		 (let ((in (max (timely-seconds-a-tick) (*$ (float left) (timely-seconds-a-tick)))))
		      (revival-note part 'change-kept-to-time
				    (append (list (name-of character)) what (list 'in seconds 'seconds))
				    (list 'in in 'seconds)
				    (list 'part-ends-in in 'seconds))
		      in)))))

(defun extend-changes-to-keep-to-time ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (gradually change by ?factor factor for ?element at ?speed speed
					   %followup)
	director-character
	(let ((in (timely-change-in :self (list element 'by factor 'at speed 'speed)
				    (timely-change-seconds factor speed))))
	     (cond (in (ask :self gradually change by ,factor factor for ,element in ,in seconds
			    !,followup))
		   (t (ask-old :self gradually change by ,factor factor for ,element at ,speed speed
			       !,followup)))))
       ;; APPEAR's changes of look (REVIVE;LOOKS), which count their ticks as Ken's change
       ;; does (look-change-ticks)
       (define-extension-method (gradually change look by ?factor factor for ?element
					   at ?speed speed %followup)
	director-character
	(let ((in (timely-change-in :self (list 'look element 'by factor 'at speed 'speed)
				    (*$ (float (max 1 (look-change-ticks factor speed)))
					(timely-seconds-a-tick)))))
	     (cond (in (ask :self gradually change look by ,factor factor for ,element
			    in ,in seconds !,followup))
		   (t (ask-old :self gradually change look by ,factor factor for ,element
			       at ,speed speed !,followup)))))
       (define-extension-method (gradually change look to ?look at ?speed speed %followup)
	director-character
	(let ((in (timely-change-in :self (list 'look 'to look 'at speed 'speed)
				    (*$ (float (max 1 (look-change-ticks :e speed)))
					(timely-seconds-a-tick)))))
	     (cond (in (ask :self gradually change look to ,look in ,in seconds !,followup))
		   (t (ask-old :self gradually change look to ,look at ,speed speed
			       !,followup)))))))

;;; ---------------------------------------------------------------- timely-walk, timely-cut

;; What kind of stop condition a condition is: the first of Ken's kinds among its
;; ancestors (dichar.103:401-499).
(defun timely-kind-of (condition)
  (do ((actor condition (ask ,actor recall your parent)))
      ((or (null actor) (eq actor 'something)) nil)
      (and (memq actor '(always-happy-condition counting-down-condition stop-if-either-wants-to
			 move-only-original-distance arc-stop-condition))
	   (return actor))))

;; The ticks the condition lets the walk go on for, as far as it can tell: the distance
;; left (to the destination, along the arc, or what is left of the original distance,
;; whichever is less) at speed, or its seconds left; for a condition of several, the
;; least; nil if another stops it.
(defun timely-ticks-needed (condition distance speed)
  (let ((kind (timely-kind-of condition)))
       (cond ((eq kind 'always-happy-condition) nil)
	     ((eq kind 'counting-down-condition)
	      (//$ (float (or (ask ,condition recall your seconds-left) 0.0)) (timely-seconds-a-tick)))
	     ((eq kind 'stop-if-either-wants-to)
	      (do ((c (ask ,condition recall your stop-conditions) (rest c))
		   (least nil))
		  ((null c) least)
		  (let ((n (timely-ticks-needed (first c) distance speed)))
		       (and n (or (null least) (< n least)) (setq least n)))))
	     ((eq kind 'move-only-original-distance)
	      (let ((left (or (ask ,condition recall your distance-left)
			      (ask ,condition recall your original-distance))))
		   (//$ (cond ((numberp left) (min (float left) distance)) (t distance)) speed)))
	     (kind (//$ distance speed))
	     (t nil))))

;; How much quicker this tick of a walk to goal must be for it to end by its part's
;; planned end, if at all (nil); or 'time-up if the part's time is up.
(defun timely-hurry-for (character goal condition)
  (let ((part (timely-part-of character)))
       (let ((left (and part (timely-ticks-left part))))
	    (cond ((null left) nil)
		  ((not (> left 0)) (and (timely-on? 'timely-cut) 'time-up))
		  ((not (timely-on? 'timely-walk)) nil)
		  (t (let ((dynamics (ask ,character recall your special-dynamics))
			   (:timely-hurry nil))
			  (let ((speed (*$ (ask ,dynamics yield real value for speed)
					   (timely-seconds-a-tick)))
				(destination (find-screen-coordinate-of goal nil)))
			       (let ((distance (*$ (correction-for-longer-path
						    (ask ,dynamics yield real value for path-curvature))
						   (float (ask ,character yield distance to
							       ,destination)))))
				    (let ((needed (and (> speed 0.0)
						       (timely-ticks-needed condition distance speed))))
					 (cond ((and needed (> needed (float left)))
						(timely-quickened part (name-of character)
								  (min :timely-most-quickening
								       (//$ needed (float left)))
								  needed left 'walk-quickened))))))))))))

(defun timely-quickened (part who by needed left kind)
  (let ((entry (assoc (list part who kind) :timely-quickened)))
       (cond ((null entry)
	      (setq :timely-quickened
		    (cons (list (list part who kind) by (timely-frame-now) (round needed) left)
			  :timely-quickened)))
	     ((> by (second entry)) (rplaca (rest entry) by))))
  by)

;; A condition that stops the walk now, as if there, with what the condition it stands
;; for was to do when the walk finished (do stuff now planned for finish, dichar.103:405-409).
(defun timely-stop-now (character goal condition)
  (let ((now (ask counting-down-condition make uninterned offspring))
	(part (timely-part-of character)))
       (ask ,now set your seconds-left to 0.0)
       (ask ,now set your seconds-to-a-tick to 1.0)
       (ask ,now set your subscene to ,(ask ,condition recall your subscene))
       (ask ,now set your when-finished-stuff to ,(ask ,condition recall your when-finished-stuff))
       (revival-note part 'walk-cut-short
		     (cond ((and (not (atom goal)) (eq (first goal) 'stationary-target))
			    (list (name-of character) 'going-to (second goal)))
			   (t (list (name-of character) 'going-to goal)))
		     'stopped-as-if-there
		     (list 'part-ended-at-frame (timely-end-of part)))
       now))

(defun extend-walks-to-keep-to-time ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(go in arc ?careful-or-regardless of collisions dragging ?others along
	    to ?goal stopping if ?condition %followup)
	director-character
	(let ((hurry (timely-hurry-for :self goal condition))
	      ;;a walk takes its first step, cut or not, so that walks that follow each
	      ;;other, a wander's, say, go a tick at a time and don't follow each other
	      ;;without end within a tick
	      (stepped? (ask ,condition recall your timely-stepped)))
	     (or stepped? (ask ,condition set your timely-stepped to t))
	     (cond ((and (eq hurry 'time-up) (not stepped?))
		    (let ((:timely-hurry :timely-most-quickening))
			 (ask-old :self go in arc ,careful-or-regardless of collisions
				  dragging ,others along to ,goal stopping if ,condition
				  !,followup)))
		   ((eq hurry 'time-up)
		    (ask-old :self go in arc ,careful-or-regardless of collisions dragging
			     ,others along to ,goal stopping if
			     ,(timely-stop-now :self goal condition) !,followup))
		   (t (let ((:timely-hurry hurry))
			   (ask-old :self go in arc ,careful-or-regardless of collisions
				    dragging ,others along to ,goal stopping if ,condition
				    !,followup))))))))

;; the walk's speed this tick, or the turn's, quickened (INTERF's, interf.149:850-861)
(defun extend-speeds-to-keep-to-time ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (yield real value for ?variable) special-dynamics
	(let ((value (ask-old :self yield real value for ,variable)))
	     (cond ((and :timely-hurry (memq variable '(speed rotational-speed)))
		    (*$ value :timely-hurry))
		   (t value))))))

;;; ---------------------------------------------------------------- timely-turn

;; How much quicker this tick of a turn (and the step with it) must be for it to end by
;; the turner's part's planned end, if at all (nil): the degrees left at the rotational
;; speed, in ticks, against the ticks left; past the end, the most.
(defun timely-turn-hurry (turner heading)
  (let ((part (and (timely-on? 'timely-turn) (ask-if-exists ,turner are you a director-character)
		   (timely-part-of turner))))
       (let ((left (and part (timely-ticks-left part))))
	    (and left
		 (let ((:timely-hurry nil))
		      (let ((rotation (*$ (float (ask ,turner recall your rotational-speed))
					  (timely-seconds-a-tick)))
			    (turn (abs (float (make-it-less-than-180
					       (difference heading
							   (third (ask ,turner recall your state))))))))
			   (let ((needed (and (> rotation 0.0) (> turn 0.0) (//$ turn rotation))))
				(cond ((null needed) nil)
				      ((not (> left 0))
				       (timely-quickened part (name-of turner) :timely-most-quickening
							 needed 0 'turn-quickened))
				      ((> needed (float left))
				       (timely-quickened part (name-of turner)
							 (min :timely-most-quickening
							      (//$ needed (float left)))
							 needed left 'turn-quickened))))))))))

;; OBJECT's do-set-turtle-gradually (object.401:710-765), which turns a character towards a
;; heading (and steps it) a tick at a time at its rotational speed: ACTION's facing at the
;; start of each walk and towards a place (action.152:309-322), with the turn quickened, as REVIVE;BRIDGE calls it (its object-401-expr, :self the one
;; turning).
(defun timely-turtle-gradually (planner x y heading followup the-message)
  (let ((:timely-hurry (timely-turn-hurry :self heading)))
       (funcall (get 'do-set-turtle-gradually 'timely-object-401-expr)
		planner x y heading followup the-message)))

(defun extend-turns-to-keep-to-time ()
  (putprop 'do-set-turtle-gradually (get 'do-set-turtle-gradually 'object-401-expr)
	   'timely-object-401-expr)
  (putprop 'do-set-turtle-gradually (get 'timely-turtle-gradually 'expr) 'object-401-expr))

;;; ---------------------------------------------------------------- timely-pause

;; A step's pause, from the event it begins after (prepare yourself to run in,
;; action.152:214-238) or from its part's beginning (run yourself in, 240-256): no later
;; than the part's planned end.
(defun timely-pause (plan seconds)
  (let ((part (ask ,plan recall your subscene)))
       (let ((left (and part (timely-on? 'timely-pause) (numberp seconds)
			(timely-ticks-left part))))
	    (cond ((and left (> (float seconds) (*$ (float (max 0 left)) (timely-seconds-a-tick))))
		   (let ((now (*$ (float (max 0 left)) (timely-seconds-a-tick))))
			(revival-note part 'pause-shortened (list plan seconds) now
				      (list 'part-ends-in now 'seconds))
			now))
		  (t seconds)))))

(defun extend-pauses-to-keep-to-time ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (plan after ?number seconds %message) plan
	(ask-old :self plan after ,(timely-pause :self number) seconds !,message))
       ;; each part's times, as it begins and ends (action.152:33-61)
       (define-extension-method (note that ?event happened) director-subscene
	(and (eq (first event) 'beginning-of)
	     (equal (second event) :self)
	     (timely-part-begins :self))
	(prog1 (ask-old :self note that ,event happened)
	       (and (eq (first event) 'end-of)
		    (equal (second event) :self)
		    (timely-part-ends :self))))))

;; DICHAR's changes and walks, INTERF's speeds and ACTION's plans and parts: ACTION only
;; the filming job loads, so nothing here acts in pass 1 or 2.
(+after-load '|ken;dichar >| '(revival-once 'timely-changes 'extend-changes-to-keep-to-time))
(+after-load '|ken;dichar >| '(revival-once 'timely-walks 'extend-walks-to-keep-to-time))
(+after-load '|ken;interf >| '(revival-once 'timely-speeds 'extend-speeds-to-keep-to-time))
(+after-load '|ken;action >| '(revival-once 'timely-pauses 'extend-pauses-to-keep-to-time))
(+after-load '|ken;object >| '(revival-once 'timely-turns 'extend-turns-to-keep-to-time))

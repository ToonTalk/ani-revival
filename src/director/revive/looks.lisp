;;; -*-lisp-*-
;;; REVIVE;LOOKS: Director draws each character as Ani chose, and changes its look.
;;;
;;; This file is ours, not Ken's. It is part of APPEAR (src/pipeline.js, EXTENSIONS;
;;; REVIVE;APPEAR says what APPEAR does). Each scene's program, as pass 2 writes it
;;; with APPEAR, ends with each character's look, as REVIVE;SHAPES drew it and
;;; REVIVE;COLORS colored it:
;;;   (ask cinderella take look (look: shape circle angle 5 center-offset nil ani-size .036
;;;				  look-color (270.0 .35 .65)))
;;; ANINIT's start makes the characters as Ken drew them (initialize-characters,
;;; aninit.65:36-47), then loads the program (aninit.65:203-206), so the look given
;;; there is the one filmed. A director-character is a poly (dichar.103:9), drawn with
;;; draw-poly of its size and angle (poly.29:14-17), its center-offset a turn before
;;; drawing (object.401:159-174); its size is its ani-size times the screen's
;;; (dichar.103:13-14).
;;;
;;; OBJECT keeps how to draw an object, with its size, in how-to-draw, made again only
;;; when the appearance changes (object.401:140-157), so:
;;;  - the angle is set as OBJECT's demon for a drawing argument has it, (set your
;;;    how-to-draw to nil) and then the angle (object.401:454-461); but a visible
;;;    object redraws itself while it sets how-to-draw, before the new angle is stored,
;;;    and keeps that drawing, so how-to-draw is reset once more after;
;;;  - setting ani-size alone redraws nothing, and how-to-draw keeps the old size, so the
;;;    size goes through OBJECT's own set your size (object.401:176-188), which puts it
;;;    in how-to-draw and redraws.
;;; Its color, (hue-angle saturation value), Director keeps as look-color and never
;;; draws with: the pipeline films in black and white, and the film page paints each
;;; character in the color the filming recorded for it (src/pipeline.js recorder). It
;;; is never sent to pencolor, so a color changing a little each tick can't use up the
;;; TV's sixteen colors (AI-TR-540 p. 259, "at most 16 different colors at any one
;;; time"). For the same reason Director's own color filming (tools/run-scene.mjs
;;; --color, ANINIT's running-color, whose many-polys parts are copies made before the
;;; program loads, which would keep Ken's shapes) is not supported while APPEAR is on.
;;;
;;; A look also changes during a scene, as Ani plans it (REVIVE;ALTER): a change by a
;;; factor, of a size or of a color's intensity or saturation, and a change to another
;;; shape. "A gradual transition can be displayed using interpolation routines ...
;;; Director, the system that runs Ani's films, has a general interpolation mechanism
;;; that preserves many properties (such as symmetries, connectedness, and openness) of
;;; the initial and final appearances while making the transition" (p. 167):
;;;  - (gradually change look by 1.5 factor for color-intensity at high speed) takes as
;;;    many ticks as Ken's gradually change by a factor for an element of the dynamics
;;;    (dichar.103:102-121), his ticks-to-grow-e times the factor's logarithm, so that a
;;;    look change Ani pairs with a dynamics change by the same factor at the same speed
;;;    ends on the same tick, and its scene is no longer. Ken's repeat does the change
;;;    one tick fewer times than it counts (some.666:444-450: the last tick only runs
;;;    the followup), so his dynamics never quite reach their factor; a look does, by
;;;    taking its last step on that tick. It is carried from tick to tick by the
;;;    character's special dynamics, as Ken's change is (look-change-carrier, below),
;;;    so that it changes nothing about when or where the characters move. A size
;;;    grows through OBJECT's set your size each tick, so that each frame draws it as
;;;    large as it then is. A change too quick for a tick is made at once:
;;;    "Occasionally the transition should be instantaneous" (p. 166).
;;;  - (gradually change look to (look: shape star angle 144 center-offset (right 18))
;;;    at medium speed) in-betweens the shape with KEN1;INTER's interpolate-two-calls,
;;;    from (draw-poly 100.0 90) to (draw-poly 100.0 144), each turning through its own
;;;    heading: INTER's fix-headings repeats a square twice to turn through a star's
;;;    720 degrees. The center-offset turn, (right 18) for Ken's star, which ANINIT
;;;    gives the star and the triangle so that a point is up (aninit.65:37-47), is
;;;    in-betweened beside it, from the old turn to the new, through OBJECT's own
;;;    center-offset (object.401:198-206), so that the shape turns as it changes and
;;;    ends exactly as Ken's center-offset draws it. (In the calls themselves, as
;;;    (progn (right 18) (draw-poly 100.0 144) (right -18)), the turn makes a display
;;;    list that begins with a turn, which INTER cannot pair with one that begins with
;;;    a move: "the moves can not be paired", make-operations-correspond.) It takes the
;;;    ticks of a change by e, one e-fold, at that speed. Each tick, how much of the way
;;;    it has come is set and how-to-draw is made again, so the frame draws that
;;;    in-between, as it is drawn: a move of no length is not made, since it would draw
;;;    a dot. A change whose in-between would have more than :look-morph-moves moves
;;;    (a circle's 72 sides against a star's five come to 1,440) is made at once.
;;;  - (gradually change look to (look: hue blue) at medium speed) moves the color's hue
;;;    round the painter's wheel (REVIVE;COLORS), hue by hue, in the ticks of one
;;;    e-fold too.

;;; ------------------------------------------------- taking a look

(defun define-take-look ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (take look ?look) director-character
	(ask :self set your shape to ,(get look 'shape)) ;;its name, for the record
	(ask :self set your angle to ,(get look 'angle))
	(ask :self set your center-offset to ,(get look 'center-offset))
	(ask :self set your how-to-draw to nil) ;;again, after the angle (see above)
	(ask :self set your ani-size to ,(get look 'ani-size))
	(ask :self set your size to ,(ask :self recall your size))
	(and (get look 'look-color) ;;kept, never drawn with (see above)
	     (ask :self set your look-color to ,(get look 'look-color)))
	look)))

(+after-load '|ken;dichar >| '(revival-once 'looks-take-look 'define-take-look))

;;; ------------------------------------------------- whose ticks a change takes

(setq :look-morph-moves 400)

;; How many ticks a change by a factor at a speed takes, as dichar.103:105-117 counts
;; them for an element of the dynamics.
(defun look-change-ticks (factor speed)
  (round (*$ (*$ (ask dynamic-constants recall your time-to-grow-e-times)
		 (weightify speed)
		 (float :frames-per-second)
		 (float :ticks-per-frame))
	     (abs (log (float factor))))))

;; Who carries a look change from tick to tick: the character's special dynamics in the
;; scene, which carries Ken's gradually change ... for each element of its dynamics
;; (dichar.103:112-117), or, for a character with no special dynamics, the character.
;; Not the character, as Ken's change also has the character repeat a message
;; (dichar.103:118-121): each tick Director's universe ticks its actors in the order
;; they first planned something the tick before (REVIVE;BRIDGE), and a character asked
;; to change its look before its dynamics (the look change comes first among its
;; changes, REVIVE;ALTER) would plan before its special dynamics and so move before
;; their factors grow, every tick of the change, and go elsewhere: the hare of the
;; tortoise and the hare, very happy in its first scene, ran it in 497 frames, not 586.
;; Carried by the special dynamics, the change plans where Ken's first change would
;; have, and the order is his.
(defun look-change-carrier (character)
  (cond ((ask ,character recall your special-dynamics)
	 (ask ,character recall your special-dynamics-for-current-scene))
	(t character)))

;; A step of a look change, carried: the character takes it, and the next is planned
;; for the next tick, or, after the last, the followup is done, on the tick Ken's
;; repeat does its own (some.666:444-450). The first step is taken at once, as Ken's
;; repeat does its message at once.
(defun look-step (carrier step ticks character what followup)
  (ask ,character change your look step ,step of ,ticks doing ,what)
  (cond ((< step (1- ticks))
	 (ask ,carrier plan next look step ,(1+ step) of ,ticks for ,character doing ,what
	      !,followup))
	((eq (first followup) 'then) (ask ,carrier !,(rest followup)))))

(defun define-look-steps-for-special-dynamics ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (look step ?step of ?ticks for ?character doing ?what %followup)
			special-dynamics
	(look-step :self step ticks character what followup))))

(+after-load '|ken;interf >|
  '(revival-once 'looks-steps-special-dynamics 'define-look-steps-for-special-dynamics))

;;; ------------------------------------------------- a look changing by a factor

(defun define-look-changes ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (look step ?step of ?ticks for ?character doing ?what %followup)
			director-character
	(look-step :self step ticks character what followup))
       (define-receiver (gradually change look by ?factor factor for ?element
				   at ?speed speed %followup)
			director-character
	(let ((ticks (max 1 (look-change-ticks factor speed))))
	     (ask ,(look-change-carrier :self) look step 0 of ,ticks for ,:self
		  doing (grow ,element ,(exp (//$ (log (float factor)) (float ticks))))
		  !,followup)))
       ;; one step of a change of look, as its carrier has the character take it
       (define-receiver (change your look step ?step of ?ticks doing ?what) director-character
	(cond ((eq (first what) 'grow)
	       (ask :self grow your look ,(second what) by ,(third what)))
	      ((eq (first what) 'morph) (morph-look-step :self step ticks))
	      ((eq (first what) 'hue) (hue-look-step :self (second what) (third what) step ticks))
	      (t (shouldnt-happen 'change-your-look '(,what is not a change of look)))))
       (define-receiver (grow your look ?element by ?rate) director-character
	(cond ((eq element 'size)
	       (ask :self set your ani-size to ,(*$ (float (ask :self recall your ani-size)) rate))
	       (ask :self set your size to ,(ask :self recall your size)))
	      ((memq element '(color-intensity color-saturation))
	       (ask :self set your look-color to
		    ,(color-grown (ask :self recall your look-color) element rate)))
	      (t (shouldnt-happen 'grow-your-look '(,element is not a look that grows)))))))

(+after-load '|ken;dichar >| '(revival-once 'looks-changes 'define-look-changes))

;; A look-color with its saturation or value multiplied by rate: a saturation no more
;; than 1.0, a value no more than 1.0 and no less than REVIVE;COLORS's :darkest-look,
;; so that a dimming character is never lost on the black screen.
(defun color-grown (look-color element rate)
  (let (((hue saturation value) look-color))
       (cond ((eq element 'color-saturation)
	      (list hue (min 1.0 (*$ (float saturation) rate)) value))
	     (t (list hue saturation
		      (max :darkest-look (min 1.0 (*$ (float value) rate))))))))

;;; ------------------------------------------------- a look changing to another shape or hue

(defun define-shape-changes ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (gradually change look to ?look at ?speed speed %followup)
			director-character
	(let ((ticks (max 1 (look-change-ticks :e speed))))
	     (cond ((get look 'hue)
		    (ask ,(look-change-carrier :self) look step 0 of ,ticks for ,:self
			 doing (hue ,(hue-with-angle (first (ask :self recall your look-color)))
				    ,(get look 'hue))
			 !,followup))
		   (t (let ((morph (look-morph (ask :self recall your angle) (get look 'angle))))
			   (cond ((or (null morph) (= ticks 1))
				  (ask :self take shape of ,look) ;;at once
				  (and (eq (first followup) 'then) (ask :self !,(rest followup))))
				 (t (ask :self set your look-morph to ,morph)
				    (ask :self set your look-target to ,look)
				    (ask :self set your look-turns to
					 (,(offset-turn (ask :self recall your center-offset))
					  ,(offset-turn (get look 'center-offset))))
				    (ask :self set your draw-procedure to draw-look)
				    (ask :self set your drawing-args to (size look-morph look-amount))
				    (ask ,(look-change-carrier :self) look step 0 of ,ticks for ,:self
					 doing (morph) !,followup))))))))
       ;; the shape of a look, drawn by draw-poly again (as poly.29:16 has it)
       (define-receiver (take shape of ?look) director-character
	(ask :self set your draw-procedure to draw-poly)
	(ask :self set your drawing-args to (size angle))
	(ask :self set your look-morph to nil)
	(ask :self set your look-amount to nil)
	(ask :self set your look-turns to nil)
	(ask :self set your shape to ,(get look 'shape))
	(ask :self set your angle to ,(get look 'angle))
	(ask :self set your center-offset to ,(get look 'center-offset))
	(ask :self set your how-to-draw to nil) ;;again, after the angle (see above)
	look)))

(+after-load '|ken;dichar >| '(revival-once 'looks-shape-changes 'define-shape-changes))

;; A step of an in-between: drawn as far as it has come, its turn as far as it has
;; turned; the last, the new shape.
(defun morph-look-step (character step ticks)
  (cond ((< step (1- ticks))
	 (let ((amount (//$ (float step) (float (1- ticks))))
	       ((from-turn to-turn) (ask ,character recall your look-turns)))
	      (ask ,character set your look-amount to ,amount)
	      (ask ,character set your center-offset to
		   (right ,(+$ (float from-turn) (*$ amount (-$ (float to-turn) (float from-turn))))))
	      (ask ,character set your how-to-draw to nil))) ;;drawn as far as it has come
	(t (ask ,character take shape of ,(ask ,character recall your look-target)))))

;; A step round the wheel from one hue to another.
(defun hue-look-step (character from to step ticks)
  (ask ,character set your look-color to
       ,(cons (hue-angle-along from to (cond ((= ticks 1) 1.0)
					     (t (//$ (float step) (float (1- ticks))))))
	      (rest (ask ,character recall your look-color)))))

;; The hue (REVIVE;COLORS) whose angle is nearest an angle.
(defun hue-with-angle (angle)
  (do ((w (hue-wheel) (rest w))
       (best nil)
       (best-distance 999.0))
      ((null w) best)
      (let ((distance (abs (angle-turn (float angle) (second (first w))))))
	   (and (< distance best-distance)
		(setq best (first (first w)) best-distance distance)))))

;; The angle of the way from one hue to another at a fraction of the way: round the
;; painter's wheel (REVIVE;COLORS), each step from a hue to the next the shorter way
;; round the circle of hue angles, red to purple through magenta.
(defun hue-angle-along (from to fraction)
  (let ((place (hue-place from))
	(steps (hue-steps-signed from to)))
       (let ((along (*$ (float fraction) (float (abs steps))))
	     (direction (cond ((minusp steps) -1) (t 1))))
	    (let ((whole (fix along)))
		 (let ((from-angle (hue-angle (hue-at (+ place (* direction whole)))))
		       (to-angle (hue-angle (hue-at (+ place (* direction (min (abs steps) (1+ whole))))))))
		      (normalized-angle
		       (+$ from-angle (*$ (-$ along (float whole)) (angle-turn from-angle to-angle)))))))))

;; How many steps, and which way round the wheel, from one hue to another: -2 to 3.
(defun hue-steps-signed (from to)
  (let ((ahead (\ (+ (- (hue-place to) (hue-place from)) 6) 6)))
       (cond ((> ahead 3) (- ahead 6))
	     (t ahead))))

;; The shorter turn from one angle to another, -180 to 180.
(defun angle-turn (from to)
  (let ((turn (normalized-angle (-$ to from))))
       (cond ((> turn 180.0) (-$ turn 360.0))
	     (t turn))))

(defun normalized-angle (angle)
  (do ((a (float angle)))
      ((and (not (minusp a)) (< a 360.0)) a)
      (setq a (cond ((minusp a) (+$ a 360.0)) (t (-$ a 360.0))))))

;; The in-between from one shape to another as a program of the amount (KEN1;INTER), or
;; nil if they are the same or it would have more than :look-morph-moves moves.
(defun look-morph (from-angle to-angle)
  (and (not (equal from-angle to-angle))
       (let ((morph (interpolate-two-calls '(draw-poly 100.0 ,from-angle)
					   '(draw-poly 100.0 ,to-angle))))
	    (and (not (> (length (rest (rest morph))) :look-morph-moves))
		 morph))))

;; How far a center-offset turns right: (right 18) 18, (left 18) -18, none 0.
(defun offset-turn (center-offset)
  (cond ((null center-offset) 0.0)
	((memq (first center-offset) '(left lt)) (minus (float (second center-offset))))
	(t (float (second center-offset)))))

;; How Director draws a character in the middle of a change of shape: the in-between at
;; the amount. A move of no length is not made, since it would draw a dot.
(defun draw-look (size morph amount)
  (mapc (function
	 (lambda (move)
		 (cond ((and (eq (first move) 'forward)
			     (zerop (look-move-length move amount))))
		       (t (run-look-move move amount)))))
	(rest (rest morph))))

;; A move of the in-between, (forward (+$ a (*$ interpolation-amount b))) as INTER's
;; slow-change writes it, at the amount.
(defun look-move-length (move amount)
  (let ((form (second move)))
       (+$ (float (second form)) (*$ (float amount) (float (third (third form)))))))

(defun run-look-move (move amount)
  (cond ((eq (first move) 'invisibly)
	 (pu)
	 (mapc (function (lambda (m) (run-look-move m amount))) (rest move))
	 (pd))
	(t (funcall (first move) (look-move-length move amount)))))

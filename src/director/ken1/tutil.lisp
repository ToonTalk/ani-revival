;;; -*-lisp-*-
;;; KEN1;TUTIL, reconstructed: Director's turtle utilities.
;;;
;;; The original is lost. The 1979 tags table (KEN TAGS, tape 7005017) lists its
;;; 27 definitions and where each began in the file; they are rebuilt here in
;;; its order from this evidence:
;;;   1980   TS D2500 (tape 701431, a Director saved in January 1980), which has
;;;          compiled code for 22 of them (reports/pdump/701431_ts.d2500.code.txt).
;;;          The listing labels some link cells wrongly; the image's own atom
;;;          table names them. The calls shown as 'ERD go to THINGUP (they
;;;          pair with THINGDOWN, and PERFOR 685's source for
;;;          DRAW-SCALED-AND-CENTERED has thingup there), and THINGUP's
;;;          eraser branch calls ERASERUP, not the 'XORUP shown. SIDES-IN-POLY
;;;          calls an atom with no name in the image ('#75407, once listed as
;;;          'LDB) with two arguments; from its use it is GCD.
;;;          The image spells the special *LAST-THING-UPPED, as DECLA2 249
;;;          (August 1979) declares it; here it is :LAST-THING-UPPED, as in
;;;          DECLA2 186 (tape 7005017, January 1979).
;;;   1976   KEN;TURT 427 (tape 3100153), the 1976 Director's turtle file, where
;;;          thingup, the rocket, the flower and the polygons first appear
;;;   guide  the Director Guide (AIM-482, June 1978)
;;;   uses   how KEN;OBJECT, POLY and SCREEN call them
;;;   size   the gap to the next definition in the tags table, to compare a
;;;          candidate with the original's length
;;; In 1979 the turtle functions forward, right, penup, ... are Director's
;;; "fancy" versions (see KEN1;DL's fancify), so these drawing procedures also
;;; work while Director is measuring a drawing.
;;;
;;; Not rebuilt: draw-color-polygon (no evidence), and the diagram maker's
;;; draw-arrow-to, draw-labeled-arrow, show-text-horizontally, draw-arrow-head,
;;; mark-centered, are-vectors-crossing? and is-other-end-between-others?
;;; (the diagram maker is out of this revival's scope; 1980 has their code).

(defcomment tutil)

;;; -------------------------------------------------------------- colors

;; (color-differences colors new-colors): for each pair, how far the red, green
;; and blue intensities (0 to 511) of the new color are from the old, as flonums.
;; evidence: 1980 (both colors must be on :colors, else shouldnt-happen with
;; (either .. or .. is not a color); new minus old, floated); uses: OBJECT's
;; prepare to mix colors.
(define-function color-differences (colors new-colors)
 (mapcar (function
	  (lambda (color new-color)
		  (cond ((and (memq color :colors) (memq new-color :colors)))
			(t (shouldnt-happen 'color-differences
					    '(either ,color or ,new-color is not a color))))
		  (list (float (difference (get new-color 'red) (get color 'red)))
			(float (difference (get new-color 'green) (get color 'green)))
			(float (difference (get new-color 'blue) (get color 'blue))))))
	 colors
	 new-colors))

;; (mix-colors colors differences fraction): each color moved that fraction of
;; its differences, as a color from pencolor-rgb.
;; evidence: 1980 ((in-range 0 511 (+ intensity (fix (*$ difference fraction))))
;; for red, green and blue, then pencolor-rgb); uses: OBJECT's color-mix.
(define-function mix-colors (colors differences fraction)
 (mapcar (function
	  (lambda (color difference)
		  (pencolor-rgb
		   (in-range 0 511 (plus (get color 'red) (fix (*$ (first difference) fraction))))
		   (in-range 0 511 (plus (get color 'green) (fix (*$ (second difference) fraction))))
		   (in-range 0 511 (plus (get color 'blue) (fix (*$ (third difference) fraction)))))))
	 colors
	 differences))

;; (pencolor-rgb red green blue): the color with these intensities, an atom
;; named R<red>-G<green>-B<blue>, put on :colors the first time it is made.
;; evidence: 1980 (MAKNAM of (R ,@red - G ,@green - B ,@blue) with *nopoint
;; bound to t, interned; RED, GREEN, BLUE properties; pushed onto :colors).
(define-function pencolor-rgb (red green blue)
 (let ((color (intern (let ((*nopoint t))
			   (maknam (append '(r) (explode red) '(- g) (explode green)
					   '(- b) (explode blue)))))))
      (cond ((memq color :colors))
	    (t (putprop color red 'red)
	       (putprop color green 'green)
	       (putprop color blue 'blue)
	       (setq :colors (cons color :colors))))
      color))

;;; -------------------------------------------------------------- the turtle

;; (fix-heading heading): rounded down to a multiple of ten degrees.
;; evidence: 1980 (IDIVI by 10, IMULI by 10, on a fixnum); 1976 (fix.heading).
(define-function fix-heading (heading)
 (times 10 (quotient heading 10)))

;; (distance-to-nearest-wall): turtle steps from the turtle to the nearest edge.
;; evidence: 1980 (half of each turtlesize, less |xcor| or |ycor|, the smaller);
;; uses: OBJECT's erase by clearing area.
(define-function distance-to-nearest-wall nil
 (min (difference (quotient (fix (first (turtlesize))) 2) (abs (xcor)))
      (difference (quotient (fix (second (turtlesize))) 2) (abs (ycor)))))

(setq-if-unbound :last-thing-upped '(pendown)) ;;the pen is the default (1976)

;; (thingup): lift whatever is down, the pen, the eraser or the XOR pen, and
;; remember which, so that (thingdown) puts the same thing down again. The
;; guide: "Instead of Penup and Pendown use Thingup and Thingdown".
;; evidence: 1980 (:penstate: (pendown) remembered, LOGO-PENUP, the turtle's own
;; penup under fancify; :eraserstate: (eraserdown) remembered and the eraser
;; lifted; :xorstate: (xordown), XORUP); 1976 (thingup); DECLA2 declares
;; :last-thing-upped; size (247 characters).
(define-function thingup nil
 (cond (:penstate (setq :last-thing-upped '(pendown)) (logo-penup))
       (:eraserstate (setq :last-thing-upped '(eraserdown)) (eraserup))
       (:xorstate (setq :last-thing-upped '(xordown)) (xorup))))

;; (thingdown): put down what thingup lifted.
;; evidence: 1980 ((*eval :last-thing-upped)); 1976.
(define-function thingdown nil
 (eval :last-thing-upped))

;; evidence: 1980; 1976.
(define-function xor-point nil
 (xordown)
 (point)
 (xorup))

;;; -------------------------------------------------------------- shapes

;; (draw-arc size angle): an arc of twenty steps of size, turning angle in all.
;; evidence: 1980 (a count of 20, turning (quotient angle 20.0) after each fd).
;; The 1976 version turned 5 degrees a step until the heading had changed by angle.
(define-function draw-arc (size angle)
 (do ((i 20 (1- i))
      (turn (quotient angle 20.0)))
     ((zerop i))
     (fd size)
     (right turn)))

;; (right-tri side1 side2): a right triangle with these legs, the second to the
;; right of the first; the turtle ends where and as it began.
;; evidence: 1980 (the hypotenuse by sqrt, the turn by (+$ 90.0 (arctan s2 s1)),
;; then left the turn plus 90); 1976 (right/.tri, closing with setturtle); size.
(define-function right-tri (side1 side2)
 (let ((side1 (float side1))
       (side2 (float side2)))
      (let ((hypotenuse (sqrt (+$ (*$ side1 side1) (*$ side2 side2))))
	    (turn (+$ 90.0 (arctan side2 side1))))
	   (fd side1)
	   (right 90)
	   (fd side2)
	   (right turn)
	   (fd hypotenuse)
	   (lt (+$ 90.0 turn)))))

;; (rect a b): a rectangle a long and b wide.
;; evidence: 1976 (rect); 1980 (renamed draw-rectangle: twice (fd a) (right 90)
;; (fd b) (right 90)).
(define-function rect (a b)
 (do ((i 0 (1+ i)))
     ((= i 2))
     (fd a)
     (right 90)
     (fd b)
     (right 90)))

;; evidence: 1980 (three times fd side, right 120); 1976 (eq.tri).
(define-function eq-tri (side)
 (fd side) (right 120)
 (fd side) (right 120)
 (fd side) (right 120))

;; (draw-poly distance turnage): forward and right until the polygon closes.
;; evidence: guide (Director's example: forward distance, right turnage, until
;; the heading is back where it began); 1980 (the number of sides as 360 over
;; the gcd of the rounded turnage and 360, which is the same count for whole
;; turnages and always ends); 1976 (poly1, recursive). uses: POLY.
(define-function draw-poly (distance turnage)
 (do ((i (quotient 360 (gcd (fix (+$ (float turnage) 0.5)) 360)) (1- i)))
     ((zerop i) no-value)
     (fd distance)
     (right turnage)))

;; (draw-many-polys size angle offset): polygons inside one another, each
;; offset smaller than the last, around one center.
;; GUESSED: the tags table has it (293 characters); KEN;ANINIT makes Ani's
;; characters descendants of many-polys in color, with an offset ("since a star
;; is denser"); POLY 29's commented-out "old way" made many-polys out of polys
;; stepping their size down by offset. The 1980 image does not have it.
;; From a vertex, the center of a polygon of side s turning a is s/2 ahead and
;; s/(2 tan(a/2)) to the right, so each smaller one starts offset/2 ahead and
;; offset/(2 tan(a/2)) to the right of the last.
(define-function draw-many-polys (size angle offset)
 (let ((half-angle (*$ 0.5 (float angle))))
      (do ((size (float size) (-$ size (float offset)))
	   (sideways (//$ (*$ 0.5 (float offset) (cosine half-angle)) (sine half-angle))))
	  ((not (> size 0.0)) no-value)
	  (draw-poly size angle)
	  (thingup)
	  (fd (*$ 0.5 (float offset)))
	  (right 90)
	  (fd sideways)
	  (lt 90)
	  (thingdown))))

;; (draw-color-poly size angle colors): draw-poly with each side in the next
;; color, going round the colors.
;; evidence: 1980 (pencolor of the next color before each side, the colors
;; starting again when used up). uses: POLY's color-poly.
(define-function draw-color-poly (size angle colors)
 (do ((i (quotient 360 (gcd (fix (+$ (float angle) 0.5)) 360)) (1- i))
      (present-colors colors (or (rest present-colors) colors)))
     ((zerop i) no-value)
     (pencolor (first present-colors))
     (fd size)
     (right angle)))

;;; -------------------------------------------------------------- the flower

;; (petals size n color-list shade-pattern): n petals round the turtle, each in
;; the next color.
;; evidence: 1980 (right 45; n times pencolor, petal, right (quotient 360.0 n);
;; then lt 45); 1976 (petals, without shading).
(define-function petals (size n color-list shade-pattern)
 (right 45)
 (do ((i n (1- i))
      (turn (quotient 360.0 n))
      (present-colors color-list (or (rest present-colors) color-list)))
     ((zerop i) (lt 45))
     (pencolor (first present-colors))
     (petal size shade-pattern)
     (right turn)))

;; (petal size shade-pattern): two quarter arcs, shaded if a pattern is given
;; and the pen (or XOR pen) is down.
;; evidence: 1980 (lt 45, draw-arc, right 90, draw-arc, right 135; to shade:
;; thingup, fd 8 sizes, shade, back, thingdown); 1976 (petal).
(define-function petal (size shade-pattern)
 (lt 45)
 (draw-arc size 90)
 (right 90)
 (draw-arc size 90)
 (right 135)
 (cond ((and shade-pattern (or :penstate :xorstate))
	(thingup)
	(fd (*$ 8.0 size))
	(shade shade-pattern)
	(back (*$ 8.0 size))
	(thingdown))))

;; (draw-flower size-in-turtle-steps n color-list shade-pattern): n petals
;; in the colors after the first, and a stem with two leaves in the first.
;; evidence: 1980 (size is size-in-turtle-steps over 55.0; petals with the rest
;; of the colors; the stem: back 32, right 22, a petal .55, lt 22, back 8,
;; lt 33, a petal .9, right 33, back 13); 1976 (draw.flower: the same stem in
;; green, and a return to the start). uses: POLY's flower.
(define-function draw-flower (size-in-turtle-steps n color-list shade-pattern)
 (let ((size (quotient size-in-turtle-steps 55.0)))
      (petals size n (rest color-list) shade-pattern)
      (pencolor (first color-list))
      (back (*$ size 32.0))
      (right 22)
      (petal (*$ size 0.55) shade-pattern)
      (lt 22)
      (back (*$ size 8.0))
      (lt 33)
      (petal (*$ size 0.9) shade-pattern)
      (right 33)
      (back (*$ size 13.0))))

;;; -------------------------------------------------------------- the rocket

;; (draw-rocket size): Director's rocket, FRED in the 1976 demos.
;; evidence: 1980 (draw-rectangle .5 by .2, then the fins and nose with
;; right-tri and eq-tri, every length a fraction of size); 1976 (draw.rocket,
;; the same, with rect). uses: POLY's rocket.
(define-function draw-rocket (size)
 (rect (times size 0.5) (times size 0.2))
 (fd (times size 0.25))
 (right-tri (times size -0.25) (times size -0.15))
 (fd (times size 0.25))
 (right 30)
 (eq-tri (times size 0.2))
 (right 60)
 (fd (times size 0.2))
 (right 90)
 (fd (times size 0.25))
 (right-tri (times size 0.25) (times size -0.15)))

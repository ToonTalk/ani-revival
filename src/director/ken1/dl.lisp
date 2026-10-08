;;; -*-lisp-*-
;;; KEN1;DL, reconstructed: display lists, centering and scaling drawings,
;;; Director's "fancy" turtle commands, and starting the display.
;;;
;;; Director draws an object with a Lisp procedure of turtle commands. Before
;;; it first shows the object it runs that procedure with the pen up, while
;;; the "fancy" versions of forward, right, penup and pendown note where the
;;; turtle goes. From those positions it works out the drawing's center and its
;;; farthest point, so that any object of size 100 "will just fit inside a
;;; circle of radius 100 units" around its position (the Director Guide).
;;;
;;; The original is lost. The 1979 tags table lists 31 definitions, in this
;;; order; the evidence:
;;;   1976   KEN;DL 140 (tape 3100153), the 1976 version, with dots in its
;;;          names (display.list, fancy.forward, ...). The 1979 names are the
;;;          same with hyphens, and where the tags table gives sizes they match
;;;          the 1976 definitions, so this file follows 1976 most closely.
;;;   1980   TS D2500 (tape 701431, January 1980): compiled code for 25 of
;;;          them, in a later form (positions as rounded (x y), a scaling
;;;          factor instead of TVRTLE's SCALE, a minimum enclosing circle).
;;;          Its listing shows THINGUP's link cell as 'ERD; the image's own
;;;          atom table names it THINGUP. The image also spells Director's
;;;          specials with a star (*TVRTLE-FILE-NAME), as DECLA2 249 does;
;;;          this file keeps the colon names of DECLA2 186 and }^RSV 6 (1979).
;;;   aug79  KEN;PERFOR 685 (tape 9004336, August 1979), which calls
;;;          how-to-get-to-center-and-scale and takes the SECOND of its value.
;;;   drect  KEN1;DRECT: its autoload handler loads the turtle, then calls
;;;          director-startdisplay and fancify.
;;;   uses   KEN;OBJECT (how-to-get-to-center-and-scale), KEN;SCREEN
;;;          (director-startdisplay), KEN;ANINIT (dsd), Ani's INTERF
;;;          (make-it-less-than-180).

(defcomment dl)

(setq-if-unbound :true-penstate nil)
(setq-if-unbound :started-from nil)
(setq-if-unbound :making-display-list nil)
(setq-if-unbound :making-position-list nil)
(setq-if-unbound :display-list nil)
(setq-if-unbound :position-list nil)
(setq-if-unbound :number-of-invisiblies 0)
(setq-if-unbound :heading-change 0.0)
(setq-if-unbound :last-thing-upped '(pendown)) ;;as in TUTIL, which may load inside position-list

;;; -------------------------------------------------------------- display lists

;; (display-package call): what a drawing call does, as a list of moves with the
;; pen down (forward, right, and (invisibly ...) for moves with it up), plus
;; where the turtle ends: (display-package positions .. number-of-invisiblies ..
;; x-displacement .. y-displacement .. heading-change .. display-list ..), a
;; disembodied property list, starting from home. The list is in reverse order.
;; The turtle is left as it was found, as 1976's scratchpad turtle left it.
;; evidence: 1980 (the bindings, the property list with these indicators, run on
;; the current turtle with thingup, home, the call, thingdown); 1976 (display.list:
;; the same as an a-list, run on a scratchpad turtle).
(define-function display-package (call)
 (let ((:last-thing-upped nil)
       (state (here-without-mod)))
      (prog1 (let ((:true-penstate t)
		   (:display-list nil)
		   (:making-display-list t)
		   (:position-list nil)
		   (:making-position-list t)
		   (:started-from nil)
		   (:number-of-invisiblies 0)
		   (:heading-change 0.0))
		  (thingup)
		  (home)
		  (eval call)
		  (prog1 (list 'display-package
			       'positions :position-list
			       'number-of-invisiblies :number-of-invisiblies
			       'x-displacement (fix (+$ :xcor 0.5))
			       'y-displacement (fix (+$ :ycor 0.5))
			       'heading-change (abs :heading-change)
			       'display-list :display-list)
			 (setturtle state)))
	     (thingdown))))

;; (position-list call): where the turtle goes with the pen down, as a list of
;; ((x . y) . distance), each line's two ends weighted by its length. The call
;; runs from home with the pen up, on the current turtle as in 1980, which is
;; then put back where it was, with what was down put down again, as 1976's
;; scratchpad turtle left the current one alone (draw-centered relies on it).
;; evidence: 1976 (position.list, fancy.forward); 1980 (bindings; thingup, home,
;; the call, thingdown, all on the current turtle).
(define-function position-list (call)
 (let ((:last-thing-upped nil)
       (state (here-without-mod)))
      (prog1 (let ((:true-penstate t)
		   (:making-display-list nil)
		   (:position-list nil)
		   (:making-position-list t)
		   (:started-from nil)
		   (:number-of-invisiblies 0))
		  (thingup)
		  (home)
		  (eval call)
		  (setturtle state)
		  :position-list)
	     (thingdown))))

;; evidence: 1980 (squish of the package's display-list, put back); 1976.
(define-function squished-display-package (call)
 (let ((package (display-package call)))
      (putprop package (squish (get package 'display-list)) 'display-list)
      package))

;; (squish display-list): merge successive moves of one kind, putting the list
;; back in order; a (right 0.0) or (forward 0.0) keeps moves apart where needed.
;; evidence: 1976 (squish); 1980 (the same, with run-invisibly).
(define-function squish (display-list)
 (do ((i (rest display-list) (rest i))
      (ans (list (first display-list))))
     ((null i) ans)
     (and (eq (first (first i)) 'forward)
	  (eq (first (first ans)) 'forward)
	  (minusp (min (second (first i)) (second (first ans))))
	  (< (abs (second (first i))) (abs (second (first ans))))
	  (setq ans (cons '(right 0.0) ans)))
     (cond ((eq (first (first i)) 'invisibly)
	    (cond ((eq (first (first ans)) (first (second i)))
		   (setq ans (cons (first i)
				   (cons (cond ((eq (first (first ans)) 'forward) '(right 0.0))
					       ((eq (first (first ans)) 'right) '(forward 0.0))
					       (t (shouldnt-happen 'squish '(bad display list))))
					 ans))))
		  (t (setq ans (cons (first i) ans)))))
	   ((eq (first (first i)) (first (first ans)))
	    (setq ans (cons (list (first (first i))
				  (+$ (float (second (first i))) (float (second (first ans)))))
			    (rest ans))))
	   (t (setq ans (cons (first i) ans))))))

;;; -------------------------------------------------------------- centering and scaling

;; (how-to-get-to-center call): turtle commands from the center of the drawing
;; to where it starts. evidence: 1980; 1976.
(define-function how-to-get-to-center (call)
 (first (how-to-get-to-center-and-scale call nil)))

;; (how-to-get-to-center-and-scale call max-radius): (how-to-get-to-center
;; scale), where scale makes the drawing's farthest point max-radius from its
;; center (1.0 without max-radius).
;; evidence: 1980 (compiled: (progn (right 90) (back x) (left 90) (back y)), and
;; the two-element list: the value of %PDLNC, an NCONS, is consed onto it);
;; aug79 (the SECOND of the value is the scale); uses: OBJECT destructures it as
;; (how-to-get-to-center scale); 1976 (the same, dotted).
(define-function how-to-get-to-center-and-scale (call max-radius)
 (let (((extreme center-x center-y) (find-extreme-and-center call)))
      (list '(progn (right 90) (back ,center-x) (left 90) (back ,center-y))
	    (cond (max-radius (//$ (float max-radius) (float extreme)))
		  (t 1.0)))))

;; (draw-centered call [max-radius]): run the call centered on the turtle,
;; scaled to max-radius, and return to the center.
;; evidence: 1976 (draw.centered: scale, penup, to the start, pendown, the call,
;; penup, back by negative-eval, pendown, restore the scale); 1980 (an LSUBR);
;; tags (draw-centered and draw-centered-1).
(define-function draw-centered n
 (draw-centered-1 (arg 1) (cond ((= n 2) (arg 2)))))

(define-function draw-centered-1 (call max-radius)
 (let (((to-center scale) (how-to-get-to-center-and-scale call max-radius)))
      (unwind-protect
       (progn (scale scale)
	      (penup)
	      (eval to-center)
	      (pendown)
	      (eval call)
	      (penup)
	      (mapc 'negative-eval (reverse (rest to-center)))
	      (pendown))
       (scale (//$ (float scale))))))

;; evidence: 1976 (scale.call.simple).
(define-function scale-call-simple (call factor)
 (unwind-protect (progn (scale (float factor)) (eval call))
		 (scale (//$ (float factor)))))

;; (scale-call call (quote factor)): as scale-call-simple, unevaluated.
;; evidence: 1976 (scale.call, an FEXPR taking the factor from (quote ..)).
(defun scale-call fexpr (a)
 (scale-call-simple (first a) (second (second a))))

;; (negative-eval (command amount)): the command with minus the amount.
;; evidence: 1980; 1976.
(define-function negative-eval (exp)
 (funcall (first exp) (minus (second exp))))

;; (find-extreme-and-center call): (distance-to-the-farthest-point x y).
;; evidence: 1976; tags (find-extreme-and-center, find-center, compute-center,
;; compute-extreme, in the 1976 order).
(define-function find-extreme-and-center (call)
 (let ((positions (position-list call)))
      (compute-extreme positions (compute-center positions))))

(define-function find-center (call)
 (compute-center (position-list call)))

;; (compute-center positions): the average of the points, weighted, as (x y)
;; in whole turtle steps. evidence: 1976 (compute.center). A drawing with no
;; lines (all weights zero) has its center at home rather than dividing by zero.
(define-function compute-center (positions)
 (do ((i positions (rest i))
      (x-total 0.0)
      (y-total 0.0)
      (weight)
      (weight-total 0.0))
     ((null i)
      (cond ((zerop weight-total) (list 0 0))
	    (t (list (fix (//$ x-total weight-total))
		     (fix (//$ y-total weight-total))))))
     (setq weight (float (rest (first i))))
     (setq x-total (+$ x-total (*$ weight (float (first (first (first i)))))))
     (setq y-total (+$ y-total (*$ weight (float (rest (first (first i)))))))
     (setq weight-total (+$ weight-total weight))))

;; (compute-extreme positions center): (farthest-distance x y).
;; evidence: 1976 (compute.extreme).
(define-function compute-extreme (positions center)
 (do ((i positions (rest i))
      (center-x (float (first center)))
      (center-y (float (second center)))
      (max-so-far 0.0)
      (distance-squared))
     ((null i) (cons (sqrt max-so-far) center))
     (setq distance-squared
	   (+$ (*$ (-$ (float (first (first (first i)))) center-x)
		   (-$ (float (first (first (first i)))) center-x))
	       (*$ (-$ (float (rest (first (first i)))) center-y)
		   (-$ (float (rest (first (first i)))) center-y))))
     (and (> distance-squared max-so-far)
	  (setq max-so-far distance-squared))))

;;; -------------------------------------------------------------- the fancy turtle

;; Under fancify, forward, right, penup and pendown (and their abbreviations)
;; are these, and the TV turtle's own are logo-forward, logo-right, ....
;; Normally they just pass the command on; inside display-package and
;; position-list they also note the moves, and the pen never really goes down.
;; evidence: 1976 (fancy.forward ...); 1980 (FANCY-FORWARD ...); tags.

(define-function fancy-forward (x)
 (and :making-display-list :true-penstate
      (setq :display-list (cons (list 'forward (float x)) :display-list)))
 (and :making-position-list :true-penstate
      (setq :position-list (cons (cons (cons :xcor :ycor) (float x)) :position-list)))
 (logo-forward x)
 (and :making-position-list :true-penstate
      (setq :position-list (cons (cons (cons :xcor :ycor) (float x)) :position-list))))

(define-function fancy-right (x)
 (and :true-penstate :making-display-list
      (setq :display-list (cons (list 'right (float (make-it-less-than-180 x))) :display-list)))
 (setq :heading-change (+$ (float :heading-change) (float (make-it-less-than-180 x))))
 (logo-right x))

(define-function fancy-back (x)
 (and :true-penstate :making-display-list
      (setq :display-list (cons '(right 180.0)
				(cons (list 'forward (float x))
				      (cons '(right 180.0) :display-list)))))
 (and :making-position-list :true-penstate
      (setq :position-list (cons (cons (cons :xcor :ycor) (float x)) :position-list)))
 (logo-back x)
 (and :making-position-list :true-penstate
      (setq :position-list (cons (cons (cons :xcor :ycor) (float x)) :position-list))))

(define-function fancy-left (x)
 (and :true-penstate :making-display-list
      (setq :display-list (cons (list 'right (-$ (float (make-it-less-than-180 x)))) :display-list)))
 (setq :heading-change (-$ (float :heading-change) (float (make-it-less-than-180 x))))
 (logo-left x))

(define-function fancy-penup nil
 (or :started-from (setq :started-from (here-without-mod)))
 (setq :true-penstate nil)
 (logo-penup))

(define-function fancy-pendown nil
 (cond ((and :started-from (or :making-display-list :making-position-list))
	(setq :display-list
	      (cons (cons 'invisibly (rt-fd-rt :started-from (here-without-mod))) :display-list))
	(setq :number-of-invisiblies (1+ :number-of-invisiblies))
	(setq :started-from nil)
	(setq :true-penstate t))
       ((or :making-display-list :making-position-list)) ;;the pen stays up
       (t (logo-pendown))))

(defprop fancy-fd fancy-forward expr)
(defprop fancy-rt fancy-right expr)
(defprop fancy-bk fancy-back expr)
(defprop fancy-lt fancy-left expr)
(defprop fancy-pu fancy-penup expr)
(defprop fancy-pd fancy-pendown expr)

;; (make-it-less-than-180 angle): the same turn, between -180 and 180.
;; evidence: 1980 (compiled: while above 180.0 subtract 360.0, while below
;; -180.0 add 360.0); tags (178 characters); uses: INTERF, OBJECT. The 1976
;; version took the angle modulo 360 as a fixnum.
(define-function make-it-less-than-180 (x)
 (cond ((greaterp x 180.0) (make-it-less-than-180 (difference x 360.0)))
       ((lessp x -180.0) (make-it-less-than-180 (plus x 360.0)))
       (t x)))

;; evidence: 1976; tags (63 characters: no rounding, unlike 1980's).
(define-function here-without-mod nil
 (list :xcor :ycor :heading))

;; (invisibly command ...): the commands with the pen up. evidence: 1976.
(defun invisibly fexpr (code)
 (pu)
 (mapc 'eval code)
 (pd))

;; (rt-fd-rt begin end): the turn, move and turn from one state to another.
;; evidence: 1976 (rt.fd.rt); 1980.
(define-function rt-fd-rt (begin end)
 (let ((ans nil))
      (setturtle begin)
      (setq ans (list (list 'right (float (towards end)))
		      (list 'forward (float (range end)))
		      (list 'right (-$ (float (\ (fix (third end)) 360)) (float (towards end))))))
      (setturtle end)
      ans))

;;; -------------------------------------------------------------- fancify

;; (move-and-bind old-name new-name new-definition): new-name gets old-name's
;; definition (its whole property list), and old-name gets new-definition's.
;; evidence: 1976; 1980.
(define-function move-and-bind (old-name new-name new-definition)
 (and (plist old-name) (setplist new-name (plist old-name)))
 (and (plist new-definition) (setplist old-name (plist new-definition))))

(define-function move-and-bind-tvrtle-stuff (functions)
 (mapc (function
	(lambda (old-name)
		(move-and-bind old-name
			       (intern (append-atoms 'logo- old-name))
			       (intern (append-atoms 'fancy- old-name)))))
       functions))

(setq-if-unbound :movable-tvrtle-functions
		 '(fd forward bk back right rt lt left penup pu pendown pd))

;; (fancify): make the turtle commands Director's fancy ones. Once only: the
;; list of functions is emptied, as in 1980, since doing it twice would make
;; logo-forward the fancy one.
;; evidence: 1976 (fancify, the list of movable functions); 1980 (and setting
;; the list to nil, and starting the display first if the turtle isn't loaded);
;; drect (called after the turtle is loaded).
(define-function fancify nil
 (or (status features tvrtle) (clearscreen))
 (move-and-bind-tvrtle-stuff :movable-tvrtle-functions)
 (setq :movable-tvrtle-functions nil))

;; (unfancify): the turtle's own commands again. evidence: 1976; 1980.
(define-function unfancify nil
 (setq :movable-tvrtle-functions '(fd forward bk back right rt lt left penup pu pendown pd))
 (mapc (function
	(lambda (old-name)
		(move-and-bind (intern (append-atoms 'logo- old-name))
			       old-name
			       (intern (append-atoms 'logo- old-name)))))
       :movable-tvrtle-functions))

;; (director-startdisplay): start the TV the way Director wants it: no border,
;; wrapping, the turtle hidden, and in black and white a picture 550 dots wide
;; and 200 high above the text.
;; evidence: 1980 (startdisplay, (setq :outline nil), wrap, hideturtle,
;; (tvsize 550 200) unless running color, then fancify and wiping the stage);
;; tags (223 characters: room for the first part only; in 1979 DRECT's handler
;; calls fancify itself); 1976 (kksd: hideturtle, wrap, startdisplay).
(define-function director-startdisplay nil
 (startdisplay)
 (setq :outline nil)
 (wrap)
 (hideturtle)
 (cond ((or (status features color) (eq :tvrtle-file-name :color-tvrtle-file-name)))
       (t (tvsize 550 200))))

(define-synonym dsd director-startdisplay)

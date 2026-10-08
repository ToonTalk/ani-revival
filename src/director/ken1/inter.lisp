;;; -*-lisp-*-
;;; KEN1;INTER, reconstructed: interpolating between two drawings.
;;;
;;; Two drawing calls are turned into display lists (KEN1;DL), the lists are
;;; made to correspond move for move (repeating one if their turning differs,
;;; splitting moves so the lengths match, adding empty moves), and the result
;;; is a program of one argument, the amount: 0.0 draws the first, 1.0 the
;;; second, and anything between a blend.
;;;
;;; The original is lost. The evidence:
;;;   1976   KEN;INTER 171 (tape 3100153), with dots in its names
;;;          (interpolate.two.calls, fix.headings, ...). The 1979 tags table has
;;;          the same functions with hyphens, in the same order, and sizes that
;;;          match; what it lacks (copy.list, interpolate.equiv.programs1,
;;;          interpolate.invisiblies, dummy.invisibly) is written in line here.
;;;   1979   display-package (KEN1;DL) returns a property list rather than
;;;          1976's a-list, so its values are got with GET.
;;;   uses   KEN;OBJECT's interpolation actor: (interpolate-two-calls
;;;          to-draw-self to-draw-other), and a drawer calling
;;;          (display-interpolation amount colors color-change-frequency
;;;          interpolation).
;;; Not in TS D2500, which only has autoload pointers to DIRECT;INTER.

(defcomment inter)

(setq-if-unbound :tolerance .1)
(setq-if-unbound :noisy? t) ;;complain about calls that don't come back to their start

;; (make-interpolation name call1 call2): set name to the interpolation.
;; evidence: 1976 (make.interpolation; its three-call form isn't in the tags).
(define-function make-interpolation (name call1 call2)
 (set name (interpolate-two-calls call1 call2))
 no-value)

(define-synonym mi make-interpolation)

;; evidence: 1976; uses: OBJECT.
(define-function interpolate-two-calls (call1 call2)
 (interpolate-equiv-programs
  (equivicalize (squished-display-package call1)
		(squished-display-package call2))))

(defun equivicalize (package1 package2)
 (fix-headings (get package1 'display-list) (get package2 'display-list) package1 package2))

;; Calls that turn by different amounts and come back to their start (closed
;; figures) are repeated until they turn as much as each other.
;; evidence: 1976 (fix.headings, with copy.list in line).
(defun fix-headings (display-list1 display-list2 package1 package2)
 (let ((heading-change1 (fix (get package1 'heading-change)))
       (heading-change2 (fix (get package2 'heading-change)))
       (equal-displacements?
	(and (about-equal (float (get package1 'x-displacement))
			  (float (get package2 'x-displacement)))
	     (about-equal (float (get package1 'y-displacement))
			  (float (get package2 'y-displacement))))))
      (cond ((= heading-change1 heading-change2)
	     (fix-length display-list1 display-list2 package1 1 package2 1))
	    ((and equal-displacements?
		  (not (zerop heading-change1)) (not (zerop heading-change2)))
	     (let ((gcd (gcd heading-change1 heading-change2)))
		  (let ((copies1 (quotient heading-change2 gcd))
			(copies2 (quotient heading-change1 gcd)))
		       (fix-length (do ((i copies1 (1- i)) (ans nil (append display-list1 ans)))
				       ((zerop i) ans))
				   (do ((i copies2 (1- i)) (ans nil (append display-list2 ans)))
				       ((zerop i) ans))
				   package1 copies1 package2 copies2))))
	    (t (and :noisy?
		    (print '(one of the calls is not state transparent
				 so shouldnt expect closed curves)))
	       (fix-length display-list1 display-list2 package1 1 package2 1)))))

;; Split the moves of each list so that both have the same number.
;; evidence: 1976 (fix.length).
(defun fix-length (display-list1 display-list2 package1 copied1 package2 copied2)
 (let ((length1 (difference (length display-list1)
			    (times (get package1 'number-of-invisiblies) copied1)))
       (length2 (difference (length display-list2)
			    (times (get package2 'number-of-invisiblies) copied2))))
      (let ((gcd (gcd length1 length2)))
	   (make-operations-correspond (fatten-up display-list1 (quotient length2 gcd))
				       (fatten-up display-list2 (quotient length1 gcd))
				       package1
				       package2))))

;; evidence: tags (a short function before the long one); 1976.
(defun make-operations-correspond (display-list1 display-list2 package1 package2)
 (make-operations-correspond-1 display-list1 display-list2))

;; Pair the moves of two lists, putting an empty move or an empty invisible
;; move opposite a move with no partner. Returns (list1 . list2).
;; evidence: 1976 (make.operations.correspond, dummy.invisibly).
(defun make-operations-correspond-1 (display-list1 display-list2)
 (do ((one display-list1 (rest one))
      (two display-list2 (rest two))
      (new-one nil)
      (new-two nil))
     ((and (null one) (null two))
      (cons (nreverse new-one) (nreverse new-two)))
     (cond ((eq (first (first one)) (first (first two)))
	    (setq new-one (cons (first one) new-one))
	    (setq new-two (cons (first two) new-two)))
	   ((eq (first (first one)) 'invisibly)
	    (setq new-one (cons (first one) new-one))
	    (setq new-two (cons '(invisibly (right 0.0) (forward 0.0) (right 0.0)) new-two))
	    (setq two (cons 'dummy two)))
	   ((eq (first (first two)) 'invisibly)
	    (setq new-two (cons (first two) new-two))
	    (setq new-one (cons '(invisibly (right 0.0) (forward 0.0) (right 0.0)) new-one))
	    (setq one (cons 'dummy one)))
	   ((and (eq (first (first one)) 'forward)
		 (eq (first (first two)) 'right))
	    (setq new-one (cons (first one) new-one))
	    (setq new-two (cons '(forward 0.0) new-two))
	    (setq two (cons 'dummy two)))
	   ((and (eq (first (first one)) 'right)
		 (eq (first (first two)) 'forward))
	    (setq new-two (cons (first two) new-two))
	    (setq new-one (cons '(forward 0.0) new-one))
	    (setq one (cons 'dummy one)))
	   ((and (null one) (null (rest two)))
	    (setq new-one (cons (list (first (first two)) 0.0) new-one))
	    (setq new-two (cons (first two) new-two)))
	   ((and (null two) (null (rest one)))
	    (setq new-two (cons (list (first (first one)) 0.0) new-two))
	    (setq new-one (cons (first one) new-one)))
	   (t (shouldnt-happen 'make-operations-correspond '(the moves can not be paired))))))

;; Split each pair of moves into expansion-factor pairs. evidence: 1976.
(defun fatten-up (display-list expansion-factor)
 (do ((i display-list (cddr i))
      (ans nil))
     ((null i) ans)
     (cond ((eq (first (first i)) 'invisibly)
	    (setq ans (append ans (list (first i))))
	    (setq i (cons 'dummy i)))
	   ((eq (first (second i)) 'invisibly)
	    (setq ans (append ans (expand-pair (first i) (third i) expansion-factor (second i))))
	    (setq i (rest i)))
	   (t (setq ans (append ans (expand-pair (first i) (second i) expansion-factor nil)))))))

;; evidence: 1976.
(defun expand-pair (line1 line2 factor insert)
 (cond ((oddp factor)
	(append (expand-line (list (first line1)
				   (//$ (float (second line1)) (float (quotient (1+ factor) 2))))
			     (quotient factor 2))
		(and insert (list insert))
		(expand-line (and line2
				  (list (first line2)
					(//$ (float (second line2)) (float (quotient (1+ factor) 2)))))
			     (quotient factor 2))))
       (t (append (expand-line (list (first line1)
				     (//$ (float (second line1)) (float (quotient factor 2))))
			       (quotient (1- factor) 2))
		  (cons-insert (first line1))
		  (and insert (list insert))
		  (expand-line (and line2
				    (list (first line2)
					  (//$ (float (second line2)) (float (quotient factor 2)))))
			       (quotient (1- factor) 2))))))

;; evidence: 1976.
(defun expand-line (new-line number-of-inserts)
 (cond (new-line
	(do ((i number-of-inserts (1- i))
	     (insert (cond ((eq (first new-line) 'forward) '(right 0.0))
			   ((eq (first new-line) 'right) '(forward 0.0))
			   (t (shouldnt-happen 'expand-line '(bad display list)))))
	     (ans (list new-line)))
	    ((= i 0) ans)
	    (setq ans (cons new-line (cons insert ans)))))))

;; evidence: 1976.
(defun cons-insert (operation)
 (cond ((eq operation 'forward) '((right 0.0) (forward 0.0)))
       ((eq operation 'right) '((forward 0.0) (right 0.0)))
       (t (shouldnt-happen 'cons-insert '(bad display list)))))

;; evidence: 1976.
(defun about-equal (flonum1 flonum2)
 (< (abs (-$ flonum1 flonum2)) :tolerance))

;; (interpolate-equiv-programs (moves1 . moves2)): the program
;; (lambda (interpolation-amount) move ...), each move a blend of the two.
;; evidence: 1976 (interpolate.equiv.programs, ..programs1, interpolate.invisiblies;
;; the 1979 definition is too short for all three, so they are combined).
(defun interpolate-equiv-programs (source+destination)
 (cons 'lambda
       (cons '(interpolation-amount)
	     (mapcar (function
		      (lambda (line1 line2)
			      (cond ((and (eq (first line1) 'invisibly) (eq (first line2) 'invisibly))
				     (cons 'invisibly (mapcar 'slow-change (rest line1) (rest line2))))
				    ((eq (first line1) (first line2)) (slow-change line1 line2))
				    (t (shouldnt-happen 'interpolate-equiv-programs
							'(the programs are not equivalent))))))
		     (first source+destination)
		     (rest source+destination)))))

;; evidence: 1976.
(defun slow-change (line1 line2)
 (list (first line1)
       (list '+$
	     (float (second line1))
	     (list '*$ 'interpolation-amount (-$ (float (second line2)) (float (second line1)))))))

;; (display-interpolation amount colors color-change-frequency interpolation):
;; draw the interpolation at the amount, in one of the colors: the next one
;; each time the amount passes a multiple of color-change-frequency.
;; GUESSED from its use: OBJECT's interpolation actor sets its
;; color-change-frequency to 99999999 "default never change the color".
(define-function display-interpolation (amount colors color-change-frequency interpolation)
 (and colors
      (pencolor (nth (\ (fix (//$ (float amount) (float color-change-frequency))) (length colors))
		     colors)))
 (funcall interpolation amount))

;; (sl interpolation begin end increment [center? color1 color2]): draw the
;; interpolation at amounts from begin to end, all from the same place.
;; With no arguments, a reminder of the arguments. evidence: 1976.
(define-function sl n
 (cond ((> n 1)
	(straight-line (arg 1) (arg 2) (arg 3) (arg 4)
		       (cond ((> n 4) (arg 5)))
		       (cond ((> n 5) (arg 6)))
		       (cond ((> n 6) (arg 7)))))
       (t '(int begin end inc (center? nil) (color1 nil) (color2 nil)))))

(defun straight-line (int begin end inc center? color1 color2)
 (do ((amount (float begin) (+$ (float inc) amount))
      (start (here))
      (tempcolors)
      (colors (and color1 color2
		   (make-color-interpolation color1 color2
					     (min (1+ (fix (//$ (-$ (float end) (float begin))
								(float inc))))
						  15)))))
     ((> amount (float end)) no-value)
     (cond (tempcolors (pencolor (first tempcolors))
		       (setq tempcolors (rest tempcolors)))
	   (colors (pencolor (first colors))
		   (setq tempcolors (rest colors))))
     (cond (center? (draw-centered (list int amount) nil))
	   (t (funcall int amount)))
     (pu) (setturtle start) (pd)))

;; (slt interpolation begin end increment columns [rows filled color1 color2]):
;; the interpolations in a table, each centered in its place. evidence: 1976.
(define-function slt n
 (cond ((> n 1)
	(straight-line-table (arg 1) (arg 2) (arg 3) (arg 4) (arg 5)
			     (cond ((> n 5) (arg 6)) (t (arg 5)))
			     (cond ((> n 6) (arg 7)) (t .8))
			     (cond ((> n 7) (arg 8)))
			     (cond ((> n 8) (arg 9)))))
       (t '(int begin end inc columns (rows default=columns) (percentage-filled .8)
		(color1 nil) (color2 nil)))))

(defun straight-line-table (int begin end inc columns rows percentage-filled color1 color2)
 (cs)
 (useturtle 'logoturtle)
 (let ((xdist (//$ (first (turtlesize)) (float (1+ columns))))
       (ydist (//$ (second (turtlesize)) (float (1+ rows)))))
      (do ((amount (float begin) (+$ (float inc) amount))
	   (currentcolumn 1 (1+ currentcolumn))
	   (tempcolors)
	   (colors (and color1 color2
			(make-color-interpolation color1 color2
						  (min (1+ (fix (//$ (-$ (float end) (float begin))
								     (float inc))))
						       15))))
	   (start (list (-$ xdist (//$ (first (turtlesize)) 2.0))
			(-$ (//$ (second (turtlesize)) 2.0) ydist)
			0.0)
		  (here))
	   (max-size (*$ (max xdist ydist) .5 percentage-filled)))
	  ((> amount (float end)) no-value)
	  (pu)
	  (setturtle start)
	  (pd)
	  (cond (tempcolors (pencolor (first tempcolors))
			    (setq tempcolors (rest tempcolors)))
		(colors (pencolor (first colors))
			(setq tempcolors (rest colors))))
	  (cond ((not (zerop percentage-filled))
		 (draw-centered (list int amount) max-size))
		(t (funcall int amount)))
	  (pu)
	  (cond ((= currentcolumn columns)
		 (setq currentcolumn 0)
		 (dely (-$ ydist))
		 (setx (-$ xdist (//$ (first (turtlesize)) 2.0))))
		(t (delx xdist)))
	  (pd))))

;; (slm interpolation begin end increment [pause screen-fraction color1 color2]):
;; the interpolations one after another, wiping between them. evidence: 1976.
(define-function slm n
 (cond ((> n 1)
	(straight-line-movie (arg 1) (arg 2) (arg 3) (arg 4)
			     (cond ((> n 4) (arg 5)) (t 1.0))
			     (cond ((> n 5) (arg 6)) (t .8))
			     (cond ((> n 6) (arg 7)))
			     (cond ((> n 7) (arg 8)))))
       (t '(int begin end inc (pause 1) (percentage-of-screen .8) (color1 nil) (color2 nil)))))

(defun straight-line-movie (int begin end inc pause percentage-of-screen color1 color2)
 (do ((amount (float begin) (+$ (float inc) amount))
      (start (here))
      (tempcolors)
      (colors (and color1 color2
		   (make-color-interpolation color1 color2
					     (min (1+ (fix (//$ (-$ (float end) (float begin))
								(float inc))))
						  15)))))
     ((> amount (float end)) no-value)
     (cond ((minusp pause))
	   (t (sleep pause)
	      (wipe)))
     (cond (tempcolors (pencolor (first tempcolors))
		       (setq tempcolors (rest tempcolors)))
	   (colors (pencolor (first colors))
		   (setq tempcolors (rest colors))))
     (cond ((zerop percentage-of-screen) (funcall int amount))
	   (t (draw-centered (list int amount)
			     (*$ (second (turtlesize)) percentage-of-screen .5))))
     (pu) (setturtle start) (pd)))

;; (make-color-interpolation color1 color2 number): number new colors, from
;; color1 to color2. evidence: 1976.
(define-function make-color-interpolation (color1 color2 number)
 (do ((blue1 (bluepart color1))
      (blue2 (bluepart color2))
      (green1 (greenpart color1))
      (green2 (greenpart color2))
      (red1 (redpart color1))
      (red2 (redpart color2))
      (amount 0.0 (+$ amount (//$ (float (1- number)))))
      (i number (1- i))
      (ans nil))
     ((= i 0) (reverse ans))
     (makecolor (first (setq ans (cons (gensym) ans)))
		(+$ red1 (*$ amount (-$ red2 red1)))
		(+$ green1 (*$ amount (-$ green2 green1)))
		(+$ blue1 (*$ amount (-$ blue2 blue1))))))

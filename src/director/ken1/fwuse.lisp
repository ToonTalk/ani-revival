;;; -*-lisp-*-
;;; KEN1;FWUSE, reconstructed: writing on the TV in fonts made of turtle windows.
;;;
;;; A font is a set of LLOGO windows, one per character, saved with SAVEWINDOWS
;;; (a FONT WINDOW file) together with a FONT WINFON file of Lisp that records,
;;; on the atom named by each character's code in octal, the windows of that
;;; character in each font: (putprop '/101 (cons '(25fg 25fg101) ..) 'fonts-windows),
;;; plus each window's char-width and the font's height, in TV dots. A
;;; character is shown with its window's home (its left end, on the baseline)
;;; at the turtle, and the turtle then moves right by the char-width.
;;;
;;; The original is lost. The evidence:
;;;   1976   KEN;FWNEW 53 (tape 3100153): "The second set of functions are for
;;;          writing to the tv screen in the desired font": fontmark, fonttyo,
;;;          slashified?, fontprintcentered, text-length, delx-in-tvsteps,
;;;          dely-in-tvsteps, fontcs, fonthome, left-margin, right-margin,
;;;          top-margin, bottom-margin, fontterpri, fontprinc, fontprin1,
;;;          fontprint, and its default parameters. (The first half, reading
;;;          raster fonts and making the windows, became KEN1;FWMAKE.)
;;;   tags   the 1979 tags table: the same functions, the internal ones with
;;;          fwuse- prefixes, plus try-to-autoload-font, in the same order
;;;   uses   KEN;OBJECT's text actor: (fwuse-text-length text font) and
;;;          (fontprinc text font) after setting the pen color "since there is
;;;          no xor in color"; KEN;LOAD 33 gives fonts font-autoload-file
;;;          properties (|plasma;tvfont winfon|, ...)
;;; The 1979 fonts were on PLASMA;, which did not survive; the 1976 ones (20FG,
;;; 25FG, 40VSHD) are on tape 3100153.

(defcomment fwuse)

(setq-if-unbound *font-xor* t) ;;if nil, show the characters rather than XOR them
(setq-if-unbound *spacing* 0.0) ;;dots between characters besides their widths
(setq-if-unbound *left-margin* 20.0) ;;in dots from the edges of the picture
(setq-if-unbound *right-margin* 20.0)
(setq-if-unbound *top-margin* 20.0)
(setq-if-unbound *bottom-margin* 20.0)
(setq-if-unbound *line-spacing* 0.0) ;;dots between lines besides the font's height
(setq-if-unbound *last-fontused* '(no font given to fontmark))

;; (fontmark text [font [slashify]]): show an atom's characters in the font,
;; starting at the turtle, which ends after the text; the pen is up meanwhile.
;; evidence: 1976 (fontmark).
(defun fontmark n
 (let ((text (arg 1))
       (font (cond ((= n 2) (setq *last-fontused* (arg 2)))
		   ((equal *last-fontused* '(no font given to fontmark))
		    (break no-font-given t))
		   (t *last-fontused*)))
       (penstate :penstate)
       (eraserstate :eraserstate))
      (penup)
      (do ((i (cond ((atom text) (exploden text))
		    (t (print (list 'fontmark 'likes 'only 'atoms text 'is 'not 'one))
		       nil))
	      (rest i)))
	  ((null i) (cond (penstate (pendown))
			  (eraserstate (eraserdown))
			  (t (penup))))
	  (and (= (first i) 13.)
	       (second i)
	       (= (second i) 10.)
	       (fontterpri))
	  (and (= n 3)
	       (arg 3)
	       (fwuse-slashified? (first i))
	       (fonttyo 47. font))
	  (fonttyo (first i) font))))

;; (fonttyo code [font]): show one character and move past it, going to a new
;; line first if it would pass the right margin. XOR in black and white (so
;; the same call erases it again); shown in the pen color in color.
;; evidence: 1976 (fonttyo; its margin test adds dots to turtle steps, kept);
;; uses (OBJECT: in color the text actor sets the pen color itself).
(defun fonttyo n
 (let ((char (arg 1))
       (font (cond ((= n 2) (setq *last-fontused* (arg 2)))
		   ((equal *last-fontused* '(no font given to fontmark))
		    (break no-font-given t))
		   (t *last-fontused*))))
      (or (get font 'height) (try-to-autoload-font font))
      (let ((char-window
	     (second (assq font (get ((lambda (*nopoint base) (implode (explodec char))) t 8.)
				     'fonts-windows)))))
	   (cond ((and (null char-window) (= char 13.))
		  (fontterpri))
		 ((null char-window)
		  (print (list (ascii char) 'not 'defined 'for 'font font)))
		 (t (cond ((> (+$ :xcor (get char-window 'char-width))
			      (fwuse-right-margin))
			   (fontterpri)))
		    (cond ((and *font-xor* (not (status features color)))
			   (xorwindow char-window :xcor :ycor))
			  (t (showwindow char-window :xcor :ycor)))
		    (fwuse-delx-in-tvsteps (+$ (get char-window 'char-width) *spacing*)))))))

;; (try-to-autoload-font font): load the font's WINFON file if it isn't loaded.
;; evidence: tags; KEN;LOAD 33 (font-autoload-file properties, and an autoload
;; property for this function); OBJECT's text actor does the same inline.
(define-function try-to-autoload-font (font)
 (cond ((get font 'height))
       (t (let ((font-file (get font 'font-autoload-file)))
	       (cond (font-file (director-load font-file '(to load in ,font)))
		     (t (shouldnt-happen 'try-to-autoload-font
					 '(|dont know where to find winfon file for| ,font))))
	       (get font 'height)))))

;; (fwuse-slashified? code): does the character need a slash before it when
;; printed with slashification? 1976 asked (status syntax code); here the
;; characters with special syntax in MacLisp are listed.
(defun fwuse-slashified? (code)
 (memq code '(32. 34. 39. 40. 41. 44. 46. 47. 59. 96. 124.)))

;; (fontprintcentered text [font]): print text centered on the screen's middle.
;; evidence: 1976.
(define-function fontprintcentered n
 (let ((font (cond ((= n 2) (setq *last-fontused* (arg 2)))
		   ((equal *last-fontused* '(no font given to fontmark))
		    (break no-font-given t))
		   (t *last-fontused*))))
      (setx (*$ (fwuse-text-length (arg 1) font) :tvstep -0.5))
      (fontprinc (arg 1) font)))

;; (fwuse-text-length text font): the width of the printed text, in dots.
;; evidence: 1976 (text-length); uses: OBJECT's text actor.
(define-function fwuse-text-length (text font)
 (or (get font 'height) (try-to-autoload-font font))
 (do ((i (exploden text) (rest i))
      (sum 0.0))
     ((null i) sum)
     (setq sum
	   (+$ sum
	       (or (get (second (assq font (get ((lambda (*nopoint base) (implode (explodec (first i))))
						 t 8.)
						'fonts-windows)))
			'char-width)
		   0.0)))))

;; evidence: 1976.
(defun fwuse-delx-in-tvsteps (dots) (delx (times dots :tvstep)))

(defun fwuse-dely-in-tvsteps (dots) (dely (times dots :tvstep)))

;; (fontcs): clear the screen and put the turtle at the top left. evidence: 1976.
(defun fontcs nil
 (clearscreen)
 (fonthome))

(defun fonthome nil
 (setxy (fwuse-left-margin) (fwuse-top-margin)))

;; The margins, in turtle steps. evidence: 1976.
(defun fwuse-left-margin nil
 (-$ (*$ :tvstep *left-margin*) (*$ (first (turtlesize)) 0.5)))

(defun fwuse-right-margin nil
 (-$ (*$ (first (turtlesize)) 0.5) (*$ *right-margin* :tvstep)))

(defun fwuse-top-margin nil
 (-$ (*$ (second (turtlesize)) 0.5) (*$ :tvstep *top-margin*)))

(defun fwuse-bottom-margin nil
 (-$ (*$ :tvstep *bottom-margin*) (*$ (second (turtlesize)) 0.5)))

;; (fontterpri): down a line and back to the left margin (to the top if past
;; the bottom), erasing the new line. evidence: 1976.
(defun fontterpri nil
 (let ((fonts-height-in-turtlesteps (*$ (get *last-fontused* 'height) :tvstep)))
      (dely (-$ (+$ (*$ *line-spacing* :tvstep) fonts-height-in-turtlesteps)))
      (setx (fwuse-left-margin))
      (cond ((< :ycor (fwuse-bottom-margin))
	     (fonthome)))
      (eraserdown)
      (fillwindow 0.0
		  :ycor
		  (-$ (*$ (first (turtlesize)) 0.5) 0.5)
		  (*$ fonts-height-in-turtlesteps 0.5))
      (eraserup)))

;; (fontprinc thing [font]): print an atom or list, with its parentheses and
;; spaces, as princ would. evidence: 1976; uses: OBJECT's text actor.
(define-function fontprinc n
 (let ((thing (arg 1))
       (font (cond ((= n 2) (setq *last-fontused* (arg 2)))
		   ((equal *last-fontused* '(no font given to fontmark))
		    (break no-font-given t))
		   (t *last-fontused*))))
      (cond ((atom thing) (fontmark thing font))
	    (t (fontmark '/( font)
	       (fontmark (first thing))
	       (mapc (function (lambda (element)
				       (fontmark '/ )
				       (fontprinc element font)))
		     (rest thing))
	       (fontmark '/) font)))))

;; evidence: 1976.
(defun fontprin1 n
 (let ((thing (arg 1))
       (font (cond ((= n 2) (setq *last-fontused* (arg 2)))
		   ((equal *last-fontused* '(no font given to fontmark))
		    (break no-font-given t))
		   (t *last-fontused*))))
      (cond ((atom thing) (fontmark thing font 'slashify))
	    (t (fontmark '/( font)
	       (fontmark (first thing))
	       (mapc (function (lambda (element)
				       (fontmark '/ )
				       (fontprin1 element font)))
		     (rest thing))
	       (fontmark '/) font)))))

;; (fontprint thing [font]): a new line, then fontprinc. evidence: 1976.
(defun fontprint n
 (cond ((= n 2) (setq *last-fontused* (arg 2)))
       ((equal *last-fontused* '(no font given to fontmark))
	(break no-font-given t)))
 (fontterpri)
 (apply 'fontprinc (listify n)))

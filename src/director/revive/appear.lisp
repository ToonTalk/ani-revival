;;; -*-lisp-*-
;;; REVIVE;APPEAR: Ani chooses each character's size and shape, as she chooses how it moves.
;;;
;;; This file is ours, not Ken's. It is part of APPEAR (src/pipeline.js, EXTENSIONS),
;;; Ani choosing how her characters look (reports/chapter-x/PLAN.md, "Items 1 and 2:
;;; appearances"), with REVIVE;APSUG (where the suggestions for a look come from),
;;; REVIVE;SHAPES (the shape experts) and REVIVE;LOOKS (Director taking the look).
;;; APPEAR changes Ken's Cinderella, as it is meant to: her characters are drawn as Ani
;;; chose, where in 1978 "the appearances of the characters are not currently
;;; determined by Ani. I choose the following shapes and sizes for them" (AI-TR-540
;;; p. 17). Pass 1's 102 choices stay CP 29's: they are all made before Ani chooses
;;; any look (tools/check-ext.mjs checks them by name and value).
;;;
;;; The idea is the thesis's: "In much the same way that the typical dynamics of
;;; characters is handled, the appearance of a character would be broken down into
;;; aspects and the aspects in turn broken down into elements ... The values of these
;;; elements would be chosen by an extended Ani in much the same way that the values
;;; of the elements of a character's dynamics are currently chosen" (p. 163); her
;;; ways of choosing values "should work well for other elements such as the size,
;;; shape, color, and texture" (p. 104). So, here:
;;;  1. The elements: size ("large or small", p. 104), shape-jaggedness ("smooth or
;;;     jagged") and shape-complexity ("simple or complex", p. 163), each three-valued
;;;     like speed (elemnt.1:24-26, 46-47), so that COSUG combines, compromises and
;;;     takes the opposites of their values as it does speed's, and each with a
;;;     relative element; and the color, p. 163's "intensity, hue, and saturation":
;;;     color-intensity and color-saturation three-valued too (intensity with a
;;;     relative element), and color-hue, one of six hues on a painter's wheel, whose
;;;     combining, opposites and compromises are the revival's semantic net of hues
;;;     (REVIVE;COLORS, which also makes each character's color from the three).
;;;  2. Their choice points, (choice-point-of cinderella size) and so on, chosen by
;;;     Ken's make-choices-until-completed (chocho.19:15-19) once (z) has made the 102:
;;;     "Ani can explore the spaces of choices in either order" (p. 240), and this one,
;;;     the dynamics first, cannot move any of them. Each is an appearance-choice-point,
;;;     an absolute choice point with one more source of suggestions, the character's
;;;     own dynamics (REVIVE;APSUG).
;;;  3. Telling characters apart. Two characters the shape experts would draw alike
;;;     are hard to tell apart in a black-and-white film, and "the difference between
;;;     two similar characters should be accented by choosing divergent values for one
;;;     or two elements to help the viewer distinguish the two characters" (p. 94). So
;;;     the least justified of their shape choices is chosen again, "the least
;;;     justified value of the elements ... can be redetermined" (p. 164), with a
;;;     different-from suggestion on its relative element between the two. Ani's own
;;;     machinery makes the divergent choice, so the choice point and the drawn shape
;;;     agree, and the glass box explains it as any other choice. Only two she still
;;;     chooses alike (two whose descriptions are the same, say) are kept apart by the
;;;     experts, as a last resort, and the choice point they override says so.
;;;  4. The values. The shape experts (REVIVE;SHAPES) turn the two shape elements into
;;;     a shape; a size is a number, from APPEAR's own table (never INTERF's
;;;     weightify), whose values are ANINIT's: .05, every director-character's size
;;;     (dichar.103:10), and .07, the stepmother's (aninit.65:41), and below them .036,
;;;     as much smaller as .07 is larger. A size chosen as (not X) is drawn as one of
;;;     the two values left, picked by the film's variety as REVIVE;MEND1 picks a
;;;     movement element's in pass 2.
;;;  5. What is saved. Pass 1's answers file (KEN;CP) gains the appearance choices,
;;;     as save-answers writes every choice point (datest.56:47-58), and each
;;;     character's look, (define (appearance-of cinderella) appearance ...). Pass 2
;;;     writes into each scene's program, after Ken's, what Director is to draw each
;;;     character as: (ask cinderella take look (look: shape circle ...)).

;;; ------------------------------------------------- 1. the elements

;; ELEMNT's elements, with six more (elemnt.1:24-31, 46-49). appearance-element is
;; an element as movement-element is, not one of the movement elements, so the
;; special dynamics (char.2:63-68) and the 102 choices never meet them. The colors,
;; "the elements of the color, for example, are the intensity, hue, and saturation"
;; (p. 163), are defined first, so that they are the oldest of appearance-element's
;; offspring and each character's node takes its size and shape choices first, in the
;; order it took them before there were colors (make-appearance-node, below):
;; color-intensity and color-saturation three-valued, as size is, intensity with a
;; relative element; color-hue one of six hues, whose value description is the
;; revival's semantic net of hues, hue-net (REVIVE;COLORS; "a 'semantic net of
;; colors'", p. 240), listed round the painter's wheel as Itten drew it, yellow at
;; the top. Where nothing else suggests a hue, the film's variety picks one by that
;; order (REVIVE;COLORS says why it is Itten's).
(defun define-appearance-elements ()
  (let ((:insert-methods-at-end nil))
       (define appearance-element element
	(set your value-description to three-values-and-not)
	(set your possible-values to (high medium low))
	(do when receiving (yield a value that is ?three-value)
	    three-value)) ;;as movement-element's (elemnt.1:30-31)
       (define relative-appearance-element relative-element)
       (define color-intensity appearance-element ;;"intensity, hue, and saturation" (p. 163)
	(set your relative-element to relative-color-intensity))
       (define relative-color-intensity relative-appearance-element)
       (define color-saturation appearance-element)
       (define color-hue appearance-element
	(set your value-description to hue-net)
	(set your possible-values to (yellow orange red purple blue green)))
       (define size appearance-element
	(set your relative-element to relative-size))
       (define relative-size relative-appearance-element)
       (define shape-jaggedness appearance-element ;;"smooth or jagged" (p. 163)
	(set your relative-element to relative-shape-jaggedness))
       (define relative-shape-jaggedness relative-appearance-element)
       (define shape-complexity appearance-element ;;"simple or complex" (p. 163)
	(set your relative-element to relative-shape-complexity))
       (define relative-shape-complexity relative-appearance-element)))

(+after-load '|ken;elemnt >| '(revival-once 'appear-elements 'define-appearance-elements))

;; The tags give these two ELEMNT as their file, as load.33 fills them for Ken's actors,
;; so that exists? knows them before ELEMNT has loaded. The elements themselves get no
;; entry: size is also the name of every object's variable (object.401:9), and a tags
;; entry for it would have Director, which never loads ELEMNT, load it.
(defprop appearance-element |KEN;ELEMNT| actor-load)
(defprop relative-appearance-element |KEN;ELEMNT| actor-load)

;;; ------------------------------------------------- 2. the choice points

;; An appearance's choice point is an absolute choice point (cpoint.87:86-90): its
;; element, thing and node come from its name, and save-answers writes it with the
;; others. And the actor appearance, whose instance (appearance-of cinderella) keeps
;; what the shape experts did for her and the look Director is to draw (REVIVE;SHAPES).
;; Both are defined once CPOINT is loaded, as it is before pass 2 loads KEN;CP, which
;; names them.
(defun define-appearance-choice-point ()
  (let ((:insert-methods-at-end nil))
       (define appearance-choice-point absolute-choice-point)
       (define appearance something
	(do when receiving (yield your look for ?scene)
	    ;;the same in every scene for now: a look changes in the script (item 3);
	    ;;its color only if REVIVE;COLORS colored it
	    (append '(look: shape ,(ask :self recall your shape)
			    angle ,(ask :self recall your angle)
			    center-offset ,(ask :self recall your center-offset)
			    ani-size ,(ask :self recall your ani-size))
		    (let ((look-color (ask :self recall your look-color)))
			 (and look-color (list 'look-color look-color))))))))

(+after-load '|ken;cpoint >|
  '(revival-once 'appear-choice-point 'define-appearance-choice-point))

;; Both are top-level actors of ours named in files CPOINT doesn't load, so the tags
;; give them CPOINT as their file, as load.33 fills them for Ken's: exists? knows them
;; before CPOINT has loaded, and asking one loads it.
(defprop appearance-choice-point |KEN;CPOINT| actor-load)
(defprop appearance |KEN;CPOINT| actor-load)

;; Where an appearance choice point looks for suggestions, as FILM's focus sets them
;; for every absolute choice point (film.17:48-65): the same sources, in the same
;; order and with the same priorities, and the character's dynamics after the
;; relative suggestions, weighed as a neighbor's (REVIVE;APSUG). The same sample
;; suggestion, so the same minimum happiness, 14. Set once FILM's focus has set the
;; absolute choice point's (its sample's demon, cpoint.87:9-14, has loaded CHOOSE).
(defun set-up-appearance-choice-point ()
  (ask appearance-choice-point set your suggestion-sources to
       ((absolute-suggestions neighbors-absolute-suggestions opposites-absolute-suggestions)
	relative-suggestions dynamics-suggestions global-suggestions))
  (ask appearance-choice-point set your source-priorities to
       (default-source-priorities: absolute-suggestions 3
				   neighbors-absolute-suggestions 2
				   opposites-absolute-suggestions 1
				   relative-suggestions 4
				   dynamics-suggestions 2
				   global-suggestions 1))
  (ask appearance-choice-point set your minimally-happy-sample-suggestion to
       (suggestion: element dont-care
		    value dont-care-either
		    strength medium
		    source (and shy relative-choice-point))))

(+after-load '|ken;film >|
  '(revival-once 'appear-choice-point-sources 'set-up-appearance-choice-point))

;;; ------------------------------------------------- the order: dynamics, then looks

;; After pass 1's (z) has made the 102 choices (datest.56:26-30): a node for the
;; appearances, under it one for each character, its choices the character's
;; appearance choice points, made as NODES makes the characters' (nodes.38:60-97); then
;; Ken's make-choices-until-completed, which takes the focus's characters first
;; (chocho.19:58-69), as for the dynamics. Then the characters the experts would draw
;; alike are told apart, the sizes chosen are counted again (4, below), and the experts
;; draw each of them (REVIVE;SHAPES); then the elements read as numbers for a color are
;; counted again, and each character is given its color (REVIVE;COLORS). Run by the
;; pipeline after (z) (src/pipeline.js, EXTENSIONS: afterPass1).
(defun choose-appearances ()
  (define appearances-node top-level-node)
  (mapc 'make-appearance-node (ask character recall your offspring))
  (make-choices-until-completed 'appearances-node)
  (tell-apart-characters-drawn-alike)
  (count-appearance-choices-again 'size) ;;the element read as a number (4)
  (draw-the-characters t (not (eq (film-level-of 'variety) 'low)))
  (count-appearance-choices-again 'color-intensity)
  (count-appearance-choices-again 'color-saturation)
  (color-the-characters))

(defun make-appearance-node (character)
  (let ((node (intern (append-atoms character '-appearance-node))))
       (ask appearances-node make ,node)
       (ask ,node set your node-for to ,character)
       (mapc (function
	      (lambda (element)
		      (let ((choice-point
			     (ask appearance-choice-point
				  if new make (choice-point-of ,character ,element))))
			   (ask ,node add ,choice-point to your list of choices))))
	     (ask appearance-element recall your offspring))
       node))

;; The characters, the focus's first in the order the focus names them, then the
;; others in the order the story defines them. Cinderella's focus names Cinderella
;; (cindy.46:171-176).
(defun characters-in-focus-order ()
  (let ((characters (reverse (ask character recall your offspring)))
	(focus (ask film ask your current-film to recall your focus)))
       (let ((in-focus (mapcan (function
				(lambda (part)
					(and (memq part characters) (list part))))
			       (append (ask ,focus recall your parts-of-the-focus) nil))))
	    (append in-focus (set-minus characters in-focus)))))

;;; ------------------------------------------------- 3. telling them apart

;; p. 94: "Other times the difference between two similar characters should be
;; accented by choosing divergent values for one or two elements to help the viewer
;; distinguish the two characters." Two characters the experts would draw as the same
;; shape are told apart, unless the film wants little variety (glosug.41:61-72, where
;; low variety picks the most used value): the least justified of their four shape
;; choices, the one whose winning suggestion weighs least (total-strength, choose.198:
;; 410-416), is chosen again, "the least justified value of the elements (that it be
;; symmetrical, for example) can be redetermined (effectively changing one of the
;; constraints)" (p. 164). Their comparison memorizes
;;   (look-alike: shape circle of-who (comparison-of prince cinderella))
;; which REVIVE;APSUG makes a different-from suggestion for their relative choice
;; point on that element; that relative choice point and the choice are reset, as
;; CPOINT resets a choice point (cpoint.87:41-50), and Ken's make-choices-until-
;; completed makes them again. The choice point memorizes
;;   (redetermined: to-tell-apart-from cinderella look-alike (look-alike: ...))
;; This goes on while two characters are drawn alike and one of their shape choices
;; has not been made again ("If the problem persists ... can be applied iteratively",
;; p. 164). Each choice is redetermined at most once, so it ends. Two that Ani still
;; chooses alike, as she will two whose descriptions are the same (her comparisons
;; then tell her strongly that they move and look the same), have their comparison
;; memorize (alike-after-all: ...); the experts then draw the second of them as a shape
;; that differs from the first's on both shape elements, relaxing its shape choices,
;; the least justified first, each of which memorizes that the drawn shape overrode it
;; (REVIVE;SHAPES, draw-character).
(defun tell-apart-characters-drawn-alike ()
  (or (eq (film-level-of 'variety) 'low)
      (do ((alike (characters-drawn-alike) (characters-drawn-alike)))
	  ((null alike))
	  (redetermine-to-tell-apart (first alike) (second alike) (third alike)))))

;; The first two characters, in focus order, the experts would draw as the same shape
;; and one of whose shape choices can be made again: (first second shape).
;; draw-the-characters gives each character with its shape, ((cinderella circle) ...).
(defun characters-drawn-alike ()
  (do ((drawn (draw-the-characters nil nil) (rest drawn)))
      ((null drawn) nil)
      (let ((alike (first-drawn-alike (first drawn) (rest drawn))))
	   (and alike (return alike)))))

;; Of the others, the first drawn as the drawing's character is, if one of their shape
;; choices can be made again; any drawn alike with none left is noted.
(defun first-drawn-alike (drawing others)
  (do ((o others (rest o)))
      ((null o) nil)
      (let ((character (first drawing))
	    (other (first (first o)))
	    (shape (second drawing)))
	   (cond ((not (eq shape (second (first o)))))
		 ((shape-choices-to-redetermine character other)
		  (return (list character other shape)))
		 (t (note-alike-after-all character other shape))))))

;; Their shape choices not yet made again, the second character's first (it comes
;; later in the focus), complexity before jaggedness.
(defun shape-choices-to-redetermine (first-character second-character)
  (mapcan (function
	   (lambda (choice-point)
		   (and (not (redetermined? choice-point)) (list choice-point))))
	  (list '(choice-point-of ,second-character shape-complexity)
		'(choice-point-of ,second-character shape-jaggedness)
		'(choice-point-of ,first-character shape-complexity)
		'(choice-point-of ,first-character shape-jaggedness))))

(defun redetermined? (choice-point)
  (ask ,choice-point recall if any items match (redetermined: %)))

(defun note-alike-after-all (first-character second-character shape)
  (ask (comparison-of ,first-character ,second-character)
       memorize (alike-after-all: shape ,shape
				  of-who (comparison-of ,first-character ,second-character))))

(defun redetermine-to-tell-apart (first-character second-character shape)
  (let ((choice-point (least-justified-choice
		       (shape-choices-to-redetermine first-character second-character)))
	(comparison '(comparison-of ,first-character ,second-character))
	(look-alike '(look-alike: shape ,shape
				  of-who (comparison-of ,first-character ,second-character))))
       (let ((element (ask ,choice-point recall your element-name))
	     (character (ask ,choice-point recall your thing)))
	    (let ((other (cond ((eq character first-character) second-character)
			       (t first-character))))
		 (or (exists? comparison) (compare-two-characters first-character second-character))
		 (ask ,comparison memorize ,look-alike)
		 (setq :appear-look-alikes t) ;;REVIVE;APSUG's suggestions now look for them
		 (let ((relative-choice-point
			(ask ,comparison
			     yield your relative choice point of
			     ,(ask ,element recall your relative-element))))
		      (ask ,relative-choice-point reset all))
		 (ask ,choice-point reset all)
		 (ask ,choice-point memorize
		      (redetermined: to-tell-apart-from ,other look-alike ,look-alike))
		 (reset-node-status 'appearances-node)
		 (make-choices-until-completed 'appearances-node)))))

(or (boundp ':appear-look-alikes) (setq :appear-look-alikes nil))

;; The choice whose winning suggestion weighs least, the first of them if several.
(defun least-justified-choice (choice-points)
  (do ((c choice-points (rest c))
       (least nil)
       (least-justification nil))
      ((null c) least)
      (let ((justification (choice-justification (first c))))
	   (cond ((or (null least) (< justification least-justification))
		  (setq least (first c) least-justification justification))))))

;; How strongly a choice was justified: the total strength (choose.198:410-416) of the
;; suggestion with the value chosen, which record-choice memorized (choose.198:596-
;; 603), weighed by the choice point's own priorities; 0 if Ani gave up on it.
(defun choice-justification (choice-point)
  (let ((value (ask ,choice-point recall your current-choice))
	(priorities (ask ,choice-point recall your source-priorities)))
       (do ((s (ask ,choice-point collect items memorized matching (suggestion: %)) (rest s)))
	   ((null s) 0)
	   (and (equal (get (first s) 'value) value)
		(memq (get (first s) 'strength) '(low medium high))
		(return (total-strength (first s) priorities))))))

;;; ------------------------------------------------- 4. sizes

;; A size is a number of APPEAR's own, never one of INTERF's weights (weightify,
;; interf.149:899-904, knows only low, short, medium, long and high, and stops on
;; anything else). ANINIT's sizes: .05, every director-character's (dichar.103:10),
;; and .07, the stepmother's (aninit.65:41); small is as much smaller, .036 (.05 is
;; .07 times .714, and .036 is .05 times .72).
(defprop size ((low .036) (medium .05) (high .07)) appearance-numbers)

;; The number for a choice. A (not X) (cosug.215:395-402) is one of the two values left,
;; picked as REVIVE;MEND1 narrows a movement element's (not X) in pass 2: by GLOSUG's
;; pick-value-with-variety (glosug.41:61-74) at the film's variety level, from how often
;; each value was chosen for the element (count-of-each, glosug.41:77-84), the counts
;; counted again from the characters' choices (count-appearance-choices-again, below);
;; the value picked then counts as chosen, as record-choice would have counted it
;; (choose.198:600). So a size is always one of the three in the table, as a shape is
;; always one the experts know (REVIVE;SHAPES, where a (not X) allows either value
;; left). The choice point keeps Ani's (not X), as the CP keeps it, and notes the value
;; and number it was read as:
;;   (revival-repair: what read-as-number was (not high) now .036
;;		       because (narrowed-to low (variety level) medium
;;				(counts (1 medium) (0 low)) (middle-element ken1 reconstruction)))
;; for medium variety with REVIVE;MEND1's warning that middle-element is a KEN1
;; reconstruction (src/director/ken1/util.lisp). None, given up on (choose.198:69-73),
;; is medium's, as INTERF reads an element no one set as medium (interf.149:846):
;;   (revival-repair: what read-as-number was none now .05
;;		       because (given up so medium as interf reads an unset element))
(defun appearance-number (choice-point)
  (let ((value (ask ,choice-point recall your current-choice))
	(element (ask ,choice-point recall your element-name)))
       (let ((numbers (get element 'appearance-numbers)))
	    (cond ((and (atom value) (assq value numbers))
		   (second (assq value numbers)))
		  ((and (not (atom value)) (eq (first value) 'not) (assq (second value) numbers))
		   (let ((narrowed (narrow-appearance-value choice-point)))
			(second (assq narrowed numbers))))
		  (t (revival-note choice-point 'read-as-number value
				   (second (assq 'medium numbers))
				   '(given up so medium as interf reads an unset element))
		     (second (assq 'medium numbers)))))))

;; One of the two values a (not X) leaves, as REVIVE;MEND1's narrow-not-value picks it,
;; noted on the choice point.
(defun narrow-appearance-value (choice-point)
  (let ((value (ask ,choice-point recall your current-choice))
	(element-name (ask ,choice-point recall your element-name))
	(variety-level (film-level-of 'variety)))
       (let ((values-left (set-minus (ask ,element-name recall your possible-values)
				     (rest value))))
	    (let ((counts (cons 'counts (count-of-each values-left element-name)))
		  (narrowed (pick-value-with-variety variety-level values-left element-name)))
		 (ask ,element-name increment your (count-for ,narrowed) by 1)
		 (revival-note choice-point 'read-as-number value
			       (second (assq narrowed (get element-name 'appearance-numbers)))
			       (append (list 'narrowed-to narrowed '(variety level) variety-level counts)
				       (and (eq variety-level 'medium)
					    '((middle-element ken1 reconstruction)))))
		 narrowed))))

;; How often each of an element's values was chosen for the characters, counted again
;; from their choice points before any is read as a number, as REVIVE;MEND1's
;; count-choices-again counts them from the CP. record-choice's counts (choose.198:600)
;; would do in this job, but they also count, each time, a choice made again to tell two
;; characters apart (3, above), and a (not X) under its own name.
(defun count-appearance-choices-again (element-name)
  (let ((choices (mapcar (function
			  (lambda (character)
				  (let ((choice-point '(choice-point-of ,character ,element-name)))
				       (and (exists? choice-point)
					    (ask ,choice-point recall your current-choice)))))
			 (ask character recall your offspring))))
       (mapc (function
	      (lambda (value)
		      (let ((count (length (mapcan (function
						    (lambda (choice)
							    (and (equal choice value) (list choice))))
						   choices))))
			   (ask ,element-name set your (count-for ,value) to ,count))))
	     (ask ,element-name recall your possible-values))))

;;; ------------------------------------------------- 5. what is saved

;; Pass 1's answers file: save-answers writes every choice point (datest.56:47-58),
;; the appearance choices with them; and then each character's look, in focus order,
;; as Director is to draw it, for pass 2:
;;   (define (appearance-of cinderella) appearance
;;	     (set your shape to circle) (set your angle to 5)
;;	     (set your center-offset to nil) (set your ani-size to .036)
;;	     (set your hue to blue) (set your look-color to (240.0 .35 .65)))
;; its hue and color (hue angle, saturation, value) only if REVIVE;COLORS colored it.
(defun save-answers-and-appearances (file-name)
  (funcall (revival-wrapped 'save-answers 'appear) file-name)
  (let ((looks (appearance-definitions)))
       (and looks
	    (let ((file (open file-name 'append)))
		 (mapc (function (lambda (definition) (dicks-print definition file))) looks)
		 (close file)))))

(defun appearance-definitions ()
  (and (actor-of 'appearance dont-autoload)
       (mapcan (function
		(lambda (character)
			(let ((appearance '(appearance-of ,character)))
			     (and (exists? appearance)
				  (ask ,appearance recall your shape)
				  (list (append
					 '(define ,appearance appearance
					   (set your shape to ,(ask ,appearance recall your shape))
					   (set your angle to ,(ask ,appearance recall your angle))
					   (set your center-offset to
					    ,(ask ,appearance recall your center-offset))
					   (set your ani-size to
					    ,(ask ,appearance recall your ani-size)))
					 (and (ask ,appearance recall your look-color)
					      '((set your hue to ,(ask ,appearance recall your hue))
						(set your look-color to
						 ,(ask ,appearance recall your look-color))))))))))
	       (characters-in-focus-order))))

(+after-load '|ken;datest >|
  '(revival-wrap 'save-answers 'appear 'save-answers-and-appearances))

;; Pass 2: after RUN's save-all has written the scene's program (run.65:113-117), the
;; look of each character the answers file gave one, as Director is to take it before
;; the scene begins (ANINIT's start makes the characters as Ken drew them, then loads
;; the program, aninit.65:203-206; REVIVE;LOOKS):
;;   (ask cinderella take look (look: shape circle angle 5 center-offset nil ani-size .036))
(defun save-all-with-looks (scene file-name)
  (funcall (revival-wrapped 'save-all 'appear) scene file-name)
  (let ((looks (take-look-forms scene)))
       (and looks
	    (let ((file (open file-name 'append)))
		 (mapc (function (lambda (form) (dicks-print form file))) looks)
		 (close file)))))

(defun take-look-forms (scene)
  (and (actor-of 'appearance dont-autoload)
       (mapcan (function
		(lambda (character)
			(let ((appearance '(appearance-of ,character)))
			     (and (exists? appearance)
				  (list '(ask ,character take look
					  ,(ask ,appearance yield your look for ,scene)))))))
	       (reverse (ask character recall your offspring)))))

(+after-load '|ken;run >| '(revival-wrap 'save-all 'appear 'save-all-with-looks))

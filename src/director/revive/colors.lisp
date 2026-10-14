;;; -*-lisp-*-
;;; REVIVE;COLORS: Ani's semantic net of hues, and the color each character is drawn in.
;;;
;;; This file is ours, not Ken's. It is part of APPEAR (src/pipeline.js, EXTENSIONS;
;;; REVIVE;APPEAR says what APPEAR does). "The aspects of an appearance are the size,
;;; color, line, texture, and shape of a character. The elements of the color, for
;;; example, are the intensity, hue, and saturation" (AI-TR-540 p. 163), and the
;;; footnote: "the intensity, hue, and saturation space is conceptually easier to deal
;;; with". So a character's color is three of Ani's choices, made as she makes the
;;; others (REVIVE;APPEAR): color-intensity and color-saturation, three-valued as speed
;;; is, and color-hue, one of six hues. In 1978 "the colors were chosen by me" (p. 17
;;; footnote): ANINIT's running-color gave Cinderella green, the stepmother red, the
;;; Prince yellow and the fairy godmother orange (aninit.65:83-87).
;;;
;;; Here:
;;;  1. hue-net, the value description of color-hue. "Different styles of coloring
;;;     would result depending upon whether the system worked within a red-green-blue
;;;     space, a hue-intensity-saturation space, or a 'semantic net of colors'"
;;;     (p. 240). This is a small semantic net of six hues on a painter's wheel,
;;;     yellow, orange, red, purple, blue and green, round the wheel as Johannes
;;;     Itten drew it, yellow at the top, each opposite its complement (yellow and
;;;     purple, orange and blue, red and green). It is a child of COSUG's
;;;     normal-value-description, as three-values is (cosug.215:118-150), so that
;;;     COSUG combines any number of hue suggestions two at a time as it combines
;;;     speeds (combine-any-two-suggestions, cosug.215:678-694), with receivers of its
;;;     own for how two hues are related, what a hue's opposite is, and how two hues
;;;     are compromised, and is its own relative value description (a choice point
;;;     combines through it, cpoint.87:52-71). Two hues are:
;;;       identical, the same hue;
;;;       near-enough, two steps apart on the wheel, with a hue between them (yellow
;;;         and red, with orange between), which is what COSUG compromises as it does
;;;         two speeds a step apart (combine-two-suggestions, cosug.215:169-181);
;;;       adjacent-hues, a step apart (orange and red), with no hue between to meet
;;;         in, so a conflict, which CHOOSE resolves as any other (choose.198:313-355):
;;;         the stronger wins;
;;;       complementary, opposite each other (red and green), a conflict, as two
;;;         speeds top and bottom are.
;;;     Since Ken's decision of 14 October 2026 ("Decisions" 11), color-hue has a
;;;     relative element, and his uniqueness rule (p. 94) suggests (different-from
;;;     purple) of a unique character and one with purple. hue-net reads it as COSUG's
;;;     relative-three-values-and-not reads (different-from high), as the values left,
;;;     (not purple), any hue but purple (cosug.215:341-357, 392-402); (not purple red),
;;;     any but those, when two such meet. A hue and a (not ...) are compatible, merged
;;;     as the hue, if it is not one of those, and else a conflict, thing-and-not-thing,
;;;     as three-values-and-not has it (cosug.215:196-205); two (not ...)s merge, unless
;;;     together they leave no hue, a conflict, no-hue-left. A choice that is still a
;;;     (not ...) once Ani has made it is drawn as one of the hues left (3, below).
;;;     A compromise is Ken's compromise-three-values-different's (cosug.215:832-863)
;;;     with "the hue between" for "medium": two hues suggested equally strongly meet
;;;     between, unless the film is to be obvious, when one of them is kept, as Ken's
;;;     pick-non-medium keeps the value that isn't medium (the first, "first is as good
;;;     as second", choose.198:401); otherwise the film's originality decides, low
;;;     taking the more strongly suggested, high the less, and medium weighing the two
;;;     as average-by-strength-weights does (cosug.215:885-899). The suggestion the two
;;;     are merged into keeps Ani's record of it, for the glass box:
;;;       (compromised: hues (orange purple) sources ((variety level) magical)
;;;		     to purple because ((originality level) low))
;;;  2. Values. Each hue is drawn at the angle the TV's color of that name has, in the
;;;     hue of hue-intensity-saturation: (plist 'orange) is (BLUE 0 GREEN 256 RED 511),
;;;     30 degrees, and (plist 'purple) (BLUE 511 GREEN 0 RED 256), 270. Intensity is
;;;     the color's value, saturation its saturation; each is a number of APPEAR's own
;;;     (never INTERF's weightify), as a size is (REVIVE;APPEAR, 4). Ken's TV colors
;;;     were all at the TV's full intensity and saturation (511, the most it gave), so
;;;     a high saturation is 1.0; a high intensity is .85, short of the TV's full
;;;     intensity, so that joy can still brighten a bright character (p. 166,
;;;     REVIVE;ALTER). A low intensity is .45, not black: the film is shown on a black
;;;     screen, where a character as dark as "bad guys wear black" (p. 161) would be
;;;     lost, so a dark character is drawn darker, never invisible, and no darker than
;;;     that however sad it becomes. A low saturation is .35, a dull color that is
;;;     still its hue ("muddy, dull", p. 225); medium is halfway, .65 for both.
;;;  3. Each character's color, (appearance-of cinderella)'s hue and look-color,
;;;     (hue-angle saturation value), which REVIVE;APPEAR saves in the answers file and
;;;     writes into each scene's program, and Director keeps without drawing it
;;;     (REVIVE;LOOKS: the pipeline films in black and white, and the film page paints
;;;     the color from the look the filming recorded).

;;; ------------------------------------------------- 1. the semantic net of hues

;; The wheel, on hue-net (not on the color atoms, which carry the TV's colors): each
;; hue, in order round the wheel, with its angle. color-hue lists its possible values
;; in the same order (REVIVE;APPEAR), and that order is a choice of the revival's that
;; decides hues: where no word or relationship suggests a hue, only the film's variety
;; does, and Ken's pick-value-with-variety, for a film of medium variety, sorts the hues
;; by how often each has been chosen and takes the one in the middle (glosug.41:61-72;
;; middle-element, a KEN1 reconstruction, the nth of half the length); the sort keeps
;; the list's order among hues chosen equally often, so where none has been chosen yet,
;; as for the first character to take a hue, the list's order alone decides. Read round
;; from red, as a wheel usually is, the list gave Ken's Cinderella green, his stepmother
;; red and his Prince yellow, the hues he gave them in 1978; the list is the revival's,
;; so his decision 4 (no knowledge of the revival's may give back his 1978 looks,
;; reports/chapter-x/PLAN.md, "Decisions") drops that reading. Itten's, from yellow at
;; the top of his color circle, gave back none of them. Ken then decided (14 October
;; 2026, "Decisions" 11) to "go with the uniqueness rule for hues": his uniqueness
;; summary (p. 94) keeps characters apart in hue (color-hue's relative element,
;; REVIVE;APPEAR and REVIVE;APSUG), and the order decides only among the hues the rule
;; leaves. It is still an order chosen by what it gave, the revival's, labeled so with
;; its reason (:hue-order-knowledge, below); with the rule, it gives the fairy godmother
;; Ken's own orange (reports/ext/appear/README.md, tools/check-appear.mjs).
(defun define-hue-net ()
  (let ((:insert-methods-at-end nil))
       (define hue-net normal-value-description
	(set your relative-value-description to hue-net) ;;as relative-value is its own
	(set your wheel to ((yellow 60.0) (orange 30.0) (red 0.0)
			    (purple 270.0) (blue 240.0) (green 120.0)))
	(do when receiving (combine suggestions ?suggestion)
	    (hue-suggestion-made-absolute suggestion)) ;;as relative-three-values-and-not's
	(do when receiving (combine suggestions ?suggestion1 ?suggestion2)
	    (combine-hue-suggestions suggestion1 suggestion2))
	(do when receiving (yield relationship ?value1 ?value2 %)
	    (hue-relationship value1 value2))
	(do when receiving (yield opposite of {atom ?value}) ;;as value-description's (cosug.215:115)
	    (hue-opposite value))
	(do when receiving (compromise ?value1 in ?suggestion1 and ?value2 in ?suggestion2)
	    (compromise-hues value1 value2 suggestion1 suggestion2)))))

(+after-load '|ken;cosug >| '(revival-once 'colors-hue-net 'define-hue-net))

;; hue-net is a top-level actor of ours defined once COSUG has loaded, so the tags give
;; it COSUG as its file, as load.33 fills them for Ken's.
(defprop hue-net |KEN;COSUG| actor-load)

(defun hue-wheel () (ask hue-net recall your wheel))

;; A hue's place on the wheel, 0 to 5, or nil if it is not a hue.
(defun hue-place (hue)
  (do ((w (hue-wheel) (rest w))
       (place 0 (1+ place)))
      ((null w) nil)
      (and (eq (first (first w)) hue) (return place))))

(defun hue-at (place)
  (first (nth (\ (+ place 6) 6) (hue-wheel))))

;; A hue's place, or Ken's shouldnt-happen for something that is not a hue (an atom
;; that no hue is: a (not X) never gets this far, the receivers being for atoms).
(defun hue-place-of (hue)
  (or (hue-place hue)
      (shouldnt-happen 'hue-net '(,hue is not a hue on the wheel))))

;; How many steps apart two hues are, the short way round: 0 to 3.
(defun hue-steps (hue1 hue2)
  (let ((place1 (hue-place-of hue1))
	(place2 (hue-place-of hue2)))
       (let ((apart (abs (- place1 place2))))
	    (min apart (- 6 apart)))))

;; How two hue values are related, a relative one made absolute first (hue-absolute):
;; two hues by their steps on the wheel; a hue and a (not ...), (compatible hue) if it
;; is not one of those, else thing-and-not-thing; two (not ...)s, (compatible (not ...))
;; of every hue either leaves out, or no-hue-left if together they leave out all six;
;; a value hue-net can't read as a hue (greater-than, say: hues have no order),
;; impossible-relative-value.
(defun hue-relationship (value1 value2)
  (let ((hue1 (hue-absolute value1))
	(hue2 (hue-absolute value2)))
       (cond ((or (null hue1) (null hue2)) 'impossible-relative-value)
	     ((equal hue1 hue2) 'identical)
	     ((and (atom hue1) (atom hue2)) (hue-wheel-relationship hue1 hue2))
	     ((atom hue1) (hue-and-not-hues hue1 hue2))
	     ((atom hue2) (hue-and-not-hues hue2 hue1))
	     (t (let ((out (union (rest hue1) (rest hue2))))
		     (cond ((set-minus (hue-names) out) '(compatible (not !,out)))
			   (t 'no-hue-left)))))))

(defun hue-wheel-relationship (hue1 hue2)
  (let ((steps (hue-steps hue1 hue2)))
       (cond ((= steps 0) 'identical)
	     ((= steps 1) 'adjacent-hues)
	     ((= steps 2) 'near-enough)
	     (t 'complementary))))

(defun hue-and-not-hues (hue not-hues)
  (cond ((memq hue (rest not-hues)) 'thing-and-not-thing)
	(t '(compatible ,hue))))

(defun hue-names () (mapcar 'car (hue-wheel)))

;; A hue value made absolute, as relative-three-values-and-not makes a relative one
;; (absolute-three-value-of, cosug.215:392-402): (different-from purple), from a
;; comparison, is any hue but purple, (not purple); (same-as purple) is purple; a hue,
;; or a (not ...) of hues, is as it is. (different-from (not purple)), from someone
;; whose choice was any hue but purple, says nothing yet: (not), any hue. Anything else
;; is nil.
(defun hue-absolute (value)
  (cond ((atom value) value)
	((eq (first value) 'not) value)
	((eq (first value) 'same-as) (second value))
	((eq (first value) 'different-from)
	 (cond ((atom (second value)) '(not ,(second value)))
	       (t '(not))))
	(t nil)))

;; A suggestion of hue-net's on its own, relative made absolute, as relative-three-
;; values-and-not's combine of one suggestion does (cosug.215:341-357): (suggestion:
;; element color-hue value (different-from purple) ...) is the suggestion of (not purple).
(defun hue-suggestion-made-absolute (suggestion)
  (let ((value (get suggestion 'value)))
       (let ((hue (hue-absolute value)))
	    (cond ((null hue)
		   '(conflict: type impossible-relative-value
			       elements-involved ,(get suggestion 'element)
			       offenders (,suggestion)))
		  ((equal hue value) suggestion)
		  (t (replaceprop suggestion hue 'value))))))

;; Its complement, across the wheel.
(defun hue-opposite (hue)
  (hue-at (+ (hue-place-of hue) 3)))

;; The hue between two that are two steps apart.
(defun hue-between (hue1 hue2)
  (let ((place1 (hue-place-of hue1))
	(place2 (hue-place-of hue2)))
       (cond ((= (\ (+ (- place2 place1) 6) 6) 2) (hue-at (1+ place1)))
	     (t (hue-at (1+ place2))))))

;; Two hue suggestions combined, as combine-two-suggestions combines two speeds
;; (cosug.215:169-181): the same hue merged; two steps apart, compromised and merged,
;; with Ani's record of the compromise; a step apart or opposite, a conflict for CHOOSE
;; to resolve; and, relative ones made absolute, a hue and a (not ...) it isn't one of,
;; merged as the hue, two (not ...)s merged as one, or a conflict.
(defun combine-hue-suggestions (suggestion1 suggestion2)
  (let ((value1 (get suggestion1 'value))
	(value2 (get suggestion2 'value)))
       (let ((relationship (hue-relationship value1 value2)))
	    (cond ((eq relationship 'identical)
		   (hue-merged (hue-absolute value1) suggestion1 suggestion2 nil))
		  ((and (not (atom relationship)) (eq (first relationship) 'compatible))
		   (hue-merged (second relationship) suggestion1 suggestion2 nil))
		  ((eq relationship 'near-enough)
		   (let ((compromise (hue-compromise value1 value2 suggestion1 suggestion2)))
			(hue-merged (first compromise) suggestion1 suggestion2
				    '(compromised: hues (,value1 ,value2)
						   sources (,(get suggestion1 'source)
							    ,(get suggestion2 'source))
						   to ,(first compromise)
						   because ,(second compromise)))))
		  (t '(conflict: type ,relationship
				 elements-involved ,(get suggestion1 'element)
				 offenders (,suggestion1 ,suggestion2)))))))

;; Ken's merge-suggestions (cosug.215:778-793), and Ani's records of the compromises in
;; the two merged and in this one, if any, under compromises, and what the film's
;; variety picked from, its counts (below), if either has them: COSUG merges three hue
;; suggestions two at a time, and a merged suggestion is made anew each time.
(defun hue-merged (value suggestion1 suggestion2 record)
  (let ((merged (merge-suggestions value suggestion1 suggestion2))
	(records (append (get suggestion1 'compromises)
			 (get suggestion2 'compromises)
			 (and record (list record))))
	(counts (or (get suggestion1 'counts) (get suggestion2 'counts))))
       (append merged
	       (and records (list 'compromises records))
	       (and counts (list 'counts counts)))))

;; Two hues two steps apart compromised, as compromise-three-values-different
;; compromises two values (cosug.215:832-863), the hue between them for its medium.
(defun compromise-hues (value1 value2 suggestion1 suggestion2)
  (first (hue-compromise value1 value2 suggestion1 suggestion2)))

;; The hue two hues compromise to, and why, (purple ((originality level) low)):
;;  - equally strongly suggested, the hue between, (equally-strong); but in a film that
;;    is to be obvious, the first of the two, (equally-strong (obviousness level) high),
;;    as Ken's pick-non-medium, for a film that is to be obvious, keeps the value that
;;    isn't medium, the hue between being a hue's medium. (No two of today's hue
;;    suggestions are equally strong: magical's is medium, the variety's low.)
;;  - otherwise as the film's originality has it, ((originality level) low) and so on.
(defun hue-compromise (value1 value2 suggestion1 suggestion2)
  (let ((strength1 (get suggestion1 'strength))
	(strength2 (get suggestion2 'strength))
	(count1 (number-of-sources (get suggestion1 'source)))
	(count2 (number-of-sources (get suggestion2 'source))))
       (cond ((eq value1 value2) (list value1 '(identical)))
	     ((total-strength-equalp strength1 strength2 count1 count2)
	      (cond ((eq (film-level-of 'obviousness) 'high)
		     (list value1 '(equally-strong (obviousness level) high)))
		    (t (list (hue-between value1 value2) '(equally-strong)))))
	     (t (let ((originality (film-level-of 'originality)))
		     (list
		      (cond ((eq originality 'high)
			     (pick-lowest-strength value1 value2 strength1 strength2 count1 count2))
			    ((eq originality 'medium)
			     (hue-weighed-between value1 value2 strength1 strength2 count1 count2))
			    (t (pick-highest-strength value1 value2 strength1 strength2
						      count1 count2)))
		      '((originality level) ,originality)))))))

;; As average-by-strength-weights (cosug.215:885-899): the two hues' places, 0 and 2
;; along the short way between them, averaged by their weights and rounded.
(defun hue-weighed-between (value1 value2 strength1 strength2 count1 count2)
  (let ((weight1 (*$ (weightify strength1) (float count1)))
	(weight2 (*$ (weightify strength2) (float count2))))
       (let ((along (round (//$ (*$ 2.0 weight2) (+$ weight1 weight2)))))
	    (cond ((= along 0) value1)
		  ((= along 2) value2)
		  (t (hue-between value1 value2))))))

;; The film's variety's suggestion for a hue says what it picked from: how often each
;; hue had been chosen when it picked (count-of-each, glosug.41:77-84), in the list's
;; order, as REVIVE;MEND1 notes the counts it narrows by; for the glass box, which can
;; then say whether the counts or the list's order decided:
;;   (suggestion: element color-hue value purple strength low source (variety level)
;;		  counts ((0 yellow) (0 orange) (0 red) (0 purple) (0 blue) (0 green)))
(defun extend-variety-to-say-what-it-picked-from ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (yield suggestions for ?choice-point) (variety level)
	(hue-variety-with-counts (ask-old :self yield suggestions for ,choice-point)
				 choice-point))))

(defun hue-variety-with-counts (suggestion choice-point)
  (cond ((and suggestion (eq (ask ,choice-point recall your element-name) 'color-hue))
	 (append suggestion
		 (list 'counts (count-of-each (ask color-hue recall your possible-values)
					      'color-hue))))
	(t suggestion)))

(+after-load '|ken;glosug >|
  '(revival-once 'colors-variety-counts 'extend-variety-to-say-what-it-picked-from))

;; The order of the hues is a piece of the revival's knowledge, with its reason, for the
;; glass box and tools/check-appear.mjs (REVIVE;APSUG's appearance-knowledge): the
;; order the film's variety takes hues in where nothing else decides between them.
(setq :hue-order-knowledge
      '((order (variety level) color-hue (yellow orange red purple blue green) low
	 (why |where nothing else decides between hues, the film's variety takes them in this order, round Johannes Itten's color circle from the yellow at its top. It is read from yellow, not from red as a wheel usually is, because read from red the variety alone gave Ken's Cinderella, stepmother and Prince his own 1978 green, red and yellow (his decision 4). Since his decision 11 his uniqueness rule keeps characters apart in hue, and this order decides only among the hues the rule leaves|))))

;;; ------------------------------------------------- 2. values

;; APPEAR's own numbers for the two three-valued elements (see the top of this file).
(defprop color-intensity ((low .45) (medium .65) (high .85)) appearance-numbers)
(defprop color-saturation ((low .35) (medium .65) (high 1.0)) appearance-numbers)

;; The least intensity a character is ever drawn at, on the black screen: what a low
;; intensity is (REVIVE;LOOKS keeps a dimming character from going below it).
(setq :darkest-look .45)

;; A hue's angle.
(defun hue-angle (hue)
  (second (assq hue (hue-wheel))))

;;; ------------------------------------------------- 3. each character's color

;; After the shape experts have drawn each character (REVIVE;APPEAR choose-appearances):
;; its appearance's hue, and its look-color, (hue-angle saturation value), from its
;; three color choices. A saturation or intensity chosen as (not X) or given up on is
;; read as a size is (REVIVE;APPEAR's appearance-number, with its note). A hue chosen as
;; a (not ...), any hue but those of the others it is to differ from (1, above), is
;; drawn as one of the hues left, picked by the film's variety from how often each has
;; been chosen, as a size's (not X) is (REVIVE;APPEAR narrow-appearance-value), the
;; characters taken in focus order and each hue counted as it is picked:
;;   (revival-repair: what read-as-color was (not purple red) now orange
;;		       because (narrowed-to orange (variety level) medium (counts (0 yellow) ...)
;;				(middle-element ken1 reconstruction)))
;; A hue given up on (none), or a (not ...) that leaves no hue, gives no hue: the
;; character is drawn grey, with a note. No story reaches that today, as no story
;; reaches appearance-number's reading of a size given up on: CHOOSE gives up on a
;; choice point only when no suggestion is left (choose.198:60-73), and the film's
;; variety suggests a hue to every character. It is kept so that a hue Ani can't draw is
;; said, not a Lisp error:
;;   (revival-repair: what read-as-color was none now grey because (given up so no hue))
;; Each appearance memorizes what it was given, for the glass box:
;;   (colored: hue blue angle 240.0 saturation .35 value .65)
(defun color-the-characters ()
  (count-appearance-choices-again 'color-hue) ;;the hues chosen, a (not ...) not counted
  (mapc 'color-character (characters-in-focus-order)))

(defun color-character (character)
  (let ((appearance '(appearance-of ,character))
	(hue-choice '(choice-point-of ,character color-hue))
	(saturation-choice '(choice-point-of ,character color-saturation))
	(intensity-choice '(choice-point-of ,character color-intensity)))
       (and (exists? appearance)
	    (exists? hue-choice)
	    (let ((hue (narrowed-hue hue-choice (ask ,hue-choice recall your current-choice)))
		  (saturation (appearance-number saturation-choice))
		  (value (appearance-number intensity-choice)))
		 (let ((angle (and (atom hue) (hue-place hue) (hue-angle hue))))
		      (cond ((null angle)
			     (revival-note hue-choice 'read-as-color hue 'grey
					   (cond ((eq hue 'none) '(given up so no hue))
						 (t '(no hue left))))
			     (setq hue nil angle 0.0 saturation 0.0)))
		      (ask ,appearance set your hue to ,hue)
		      (ask ,appearance set your look-color to (,angle ,saturation ,value))
		      (ask ,appearance memorize
			   (colored: hue ,hue angle ,angle saturation ,saturation value ,value)))))))

;; A hue choice as it is drawn: a hue as it is; a (not ...), any hue but those, narrowed
;; to one of the hues left by the film's variety, counted as chosen, and noted (above);
;; a (not ...) that leaves none, as it is (drawn grey). The hues left are also not those
;; drawn already of the others its relative choice points have it differ from: when
;; Ani chose it, some of theirs may still have been a (not ...) too, which keeps nothing
;; apart (hue-absolute), and drawn in focus order each is a hue by now. If that leaves
;; none, the (not ...) alone decides.
(defun narrowed-hue (choice-point value)
  (cond ((or (atom value) (not (eq (first value) 'not))) value)
	(t (let ((values-left (set-minus (ask color-hue recall your possible-values) (rest value)))
		  (variety-level (film-level-of 'variety)))
		 (let ((apart (set-minus values-left
					 (hues-drawn-to-differ-from (ask ,choice-point recall your thing)))))
		      (and apart (setq values-left apart)))
		 (cond ((null values-left) value)
		       (t (let ((counts (cons 'counts (count-of-each values-left 'color-hue)))
				(narrowed (pick-value-with-variety variety-level values-left 'color-hue)))
			       (ask color-hue increment your (count-for ,narrowed) by 1)
			       (revival-note choice-point 'read-as-color value narrowed
					     (append (list 'narrowed-to narrowed '(variety level) variety-level counts)
						     (and (eq variety-level 'medium)
							  '((middle-element ken1 reconstruction)))))
			       narrowed)))))))

;; The hues already drawn of the others a character is to differ from in hue: those
;; whose relative hue choice point with it is different-from.
(defun hues-drawn-to-differ-from (character)
  (mapcan (function
	   (lambda (other)
		   (let ((relative '(relative-choice-point-of (,character ,other) relative-color-hue))
			 (appearance '(appearance-of ,other)))
			(and (exists? relative)
			     (eq (ask ,relative recall your current-choice) 'different-from)
			     (exists? appearance)
			     (ask ,appearance recall your hue)
			     (list (ask ,appearance recall your hue))))))
	  (ask ,character recall your siblings)))

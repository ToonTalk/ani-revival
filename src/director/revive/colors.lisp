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
;; the top of his color circle, gives back none of them (tools/check-appear.mjs). It is
;; an order chosen by what it gives, which is the revival's, labeled so with its reason
;; (:hue-order-knowledge, below), and open for Ken's decision
;; (reports/ext/appear/README.md, "Decisions for Ken" 1).
(defun define-hue-net ()
  (let ((:insert-methods-at-end nil))
       (define hue-net normal-value-description
	(set your relative-value-description to hue-net) ;;as relative-value is its own
	(set your wheel to ((yellow 60.0) (orange 30.0) (red 0.0)
			    (purple 270.0) (blue 240.0) (green 120.0)))
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

(defun hue-relationship (value1 value2)
  (let ((steps (hue-steps value1 value2)))
       (cond ((= steps 0) 'identical)
	     ((= steps 1) 'adjacent-hues)
	     ((= steps 2) 'near-enough)
	     (t 'complementary))))

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
;; to resolve.
(defun combine-hue-suggestions (suggestion1 suggestion2)
  (let ((value1 (get suggestion1 'value))
	(value2 (get suggestion2 'value)))
       (let ((relationship (hue-relationship value1 value2)))
	    (cond ((eq relationship 'identical)
		   (hue-merged value1 suggestion1 suggestion2 nil))
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
;; the two merged and in this one, if any, under compromises: COSUG merges three hue
;; suggestions two at a time, and a merged suggestion is made anew each time.
(defun hue-merged (value suggestion1 suggestion2 record)
  (let ((merged (merge-suggestions value suggestion1 suggestion2))
	(records (append (get suggestion1 'compromises)
			 (get suggestion2 'compromises)
			 (and record (list record)))))
       (cond (records (append merged (list 'compromises records)))
	     (t merged))))

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
	 (why |where nothing else decides between hues, the film's variety takes them in this order, round Johannes Itten's color circle from the yellow at its top. Read from red, as a wheel usually is, the list gave Ken's Cinderella, stepmother and Prince his own 1978 green, red and yellow, so under his decision 4 it is read from yellow, which gives back none of his hues. Which order, or another source of hues, is for Ken to decide|))))

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
;; read as a size is (REVIVE;APPEAR's appearance-number, with its note). A hue that is
;; not a hue on the wheel gives no hue: the character is drawn grey, with a note on the
;; choice point. That is a safeguard no story reaches today, as appearance-number's
;; reading of a size given up on is: CHOOSE gives up on a choice point (none) only when
;; no suggestion is left (choose.198:60-73), and the film's variety suggests a hue to
;; every character; and only a relative hue element could make a (not X), which
;; color-hue doesn't have. It is kept, not for a later stage, but so that a hue Ani
;; can't draw is said, not a Lisp error:
;;   (revival-repair: what read-as-color was none now grey because (given up so no hue))
;;   (revival-repair: what read-as-color was (not purple) now grey because (not one hue))
;; Each appearance memorizes what it was given, for the glass box:
;;   (colored: hue blue angle 240.0 saturation .35 value .65)
(defun color-the-characters ()
  (mapc 'color-character (characters-in-focus-order)))

(defun color-character (character)
  (let ((appearance '(appearance-of ,character))
	(hue-choice '(choice-point-of ,character color-hue))
	(saturation-choice '(choice-point-of ,character color-saturation))
	(intensity-choice '(choice-point-of ,character color-intensity)))
       (and (exists? appearance)
	    (exists? hue-choice)
	    (let ((hue (ask ,hue-choice recall your current-choice))
		  (saturation (appearance-number saturation-choice))
		  (value (appearance-number intensity-choice)))
		 (let ((angle (and (atom hue) (hue-place hue) (hue-angle hue))))
		      (cond ((null angle)
			     (revival-note hue-choice 'read-as-color hue 'grey
					   (cond ((eq hue 'none) '(given up so no hue))
						 (t '(not one hue))))
			     (setq hue nil angle 0.0 saturation 0.0)))
		      (ask ,appearance set your hue to ,hue)
		      (ask ,appearance set your look-color to (,angle ,saturation ,value))
		      (ask ,appearance memorize
			   (colored: hue ,hue angle ,angle saturation ,saturation value ,value)))))))

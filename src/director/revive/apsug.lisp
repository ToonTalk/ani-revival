;;; -*-lisp-*-
;;; REVIVE;APSUG: where Ani's suggestions for how a character looks come from.
;;;
;;; This file is ours, not Ken's. It is part of APPEAR (src/pipeline.js, EXTENSIONS;
;;; REVIVE;APPEAR says what APPEAR does). Ani's choice points for size, shape-
;;; jaggedness and shape-complexity take their suggestions from the thesis's sources
;;; of suggestions (AI-TR-540 pp. 91-95), as her choice points for the dynamics do:
;;;  1. Descriptors. A table of what a word suggests for a look, taught to each word
;;;     with Ken's own (process suggestions (for element value strength strength))
;;;     (char.2:93-101), as DSCRP teaches shy its speed (dscrp.17:62-74). Neighbors and
;;;     opposites then work as for the dynamics: unfriendly gets jagged from friendly's
;;;     smooth, elegant gets smooth from shabby's ragged.
;;;  2. Relationships. dominates suggests a greater relative size: Ken's own comment
;;;     on its suggestions, "even more typical would be size" (relate.22:63), and "a
;;;     version of Ani extended ... could have the dominating character ... be larger
;;;     than the other" (p. 157).
;;;  3. Comparisons. A character unique in its physical description is told to look
;;;     different from the others, "the finding that a character is unique suggests
;;;     that that character move (or appear) differently from the others" (p. 94), as
;;;     CSUMRY tells it to move differently (csumry.12:31-38). And two characters the
;;;     shape experts would draw alike are told to look different (REVIVE;APPEAR, 3).
;;;  4. The character's own dynamics, a source the thesis does not have: "the way an
;;;     image is rendered is influenced strongly by how it is to change. (For example,
;;;     a subtle color effect in a drawing of a character will be overridden if that
;;;     character moves quickly.)" (p. 175). The revival's: a character whose paths
;;;     are jagged is drawn jagged, and one that moves quickly is drawn simply, since
;;;     detail is lost in quick movement.
;;;  5. The film's levels: "size is also bigger is flashier" (Ken's comment in
;;;     (flashiness level), glosug.41:39). The revival's: a film that is not obvious
;;;     leans the looks toward medium, motivated by "if the film is supposed to be
;;;     obvious, then many aspects should be used---if subtle, then only a few"
;;;     (p. 165). Variety and originality need nothing: they suggest a value for any
;;;     element with possible values (glosug.41:43-55, 87-104). The film's complexity
;;;     suggests nothing for the shape elements: p. 164 has the experts' offers
;;;     "selected between on the basis of the desired levels of variety, simplicity,
;;;     originality", which REVIVE;SHAPES's select-shape does, and a suggestion for
;;;     shape-complexity as well would count the film's complexity twice.
;;;
;;; Every piece of knowledge here carries its evidence, which the glass box shows: the
;;; thesis's page, (thesis 161 |smooth is friendly|); a line of Ken's code,
;;; (code |relate.22:63| |even more typical would be size|); or, for knowledge the
;;; thesis doesn't state, the revival's reason, (why |...|) (Ken's decision of 9
;;; October 2026, reports/chapter-x/PLAN.md, "Decisions" 4). None of it is there to
;;; give Ken's 1978 looks back, which would be "arranging for Ani to do what I want
;;; without improving the reasoning" (p. 189 footnote); tools/check-appear.mjs flags
;;; any entry of the revival's that does.

;;; ------------------------------------------------- 1. descriptors

;; (descriptor element value strength evidence). Only friendly's smooth is the thesis's
;; own (p. 161); the rest are the revival's, each with its reason. shabby's ragged
;; outline is motivated by p. 166, where the script changes Cinderella "from being
;; shabby and ragged", which says what shabby is, not how Ani is to draw it. Two are not
;; here, since each would give back one of Ken's 1978 looks, and Ken's decision of 9
;; October 2026 drops any piece of the revival's that does (reports/chapter-x/PLAN.md,
;; "Decisions" 4):
;;  - evil's red, Ken's red stepmother;
;;  - strong's large size, the revival's generalization of p. 238, which gives a large
;;    shape to "a strong friendly ally" only as a deliberately atypical choice for a
;;    friendly character. With it Ani drew the stepmother large, as Ken drew her, and
;;    without it she doesn't (tools/check-appear.mjs, 5: Ken's own dominates,
;;    relate.22:63, loses to her looking different from the Prince). Nor does strong
;;    mean pointed: pointed is "typically an unfriendly shape", which unfriendly gets
;;    from friendly's opposite.
(setq :appearance-knowledge
      '((physically-strong size high high
	 (why |bodily strength shows most directly as bulk|))
	(shy size low medium
	 (why |a shy character keeps small and takes up little room|))
	(friendly shape-jaggedness low medium
	 (thesis 161 |smooth is friendly|))
	(graceful shape-jaggedness low medium
	 (why |graceful movement is smooth movement, and graceful already suggests smooth paths (dscrp.17:100), so a smooth outline|))
	(shabby shape-jaggedness high low
	 (why |a shabby character is ragged, so its outline is ragged too (motivated by p. 166, where the fairy godmother changes Cinderella from being shabby and ragged to being beautiful and elegant)|))
	(mean shape-jaggedness high medium
	 (why |sharp, spiky outlines read as hostile, so a mean character is drawn jagged: a convention, of the kind appearances rest on (p. 161)|))
	(shy shape-complexity low low
	 (why |a shy character draws no attention to itself, so a plain shape|))
	(magical shape-complexity high medium
	 (why |magic sparkles: a shape with many points|))))

;; Each entry goes to its descriptor as Ken's process suggestions takes it, and its
;; evidence onto the descriptor's appearance-evidence, (element value strength
;; evidence), for the glass box.
(defun teach-appearance (entries)
  (mapc (function
	 (lambda (entry)
		 (let (((descriptor element value strength evidence) entry))
		      (ask ,descriptor process suggestions (for ,element ,value strength ,strength))
		      (putprop descriptor
			       (cons (list element value strength evidence)
				     (get descriptor 'appearance-evidence))
			       'appearance-evidence))))
	entries))

(+after-load '|ken;dscrp >|
  '(revival-once 'apsug-descriptors 'teach-appearance-to-descriptors))

(defun teach-appearance-to-descriptors ()
  (teach-appearance :appearance-knowledge))

;;; ------------------------------------------------- 2. relationships

;; As dominates' own suggestion for the relative dynamics (relate.22:59-63), a pattern
;; for any two characters.
(setq :appearance-relationship-knowledge
      '((dominates relative-size greater-than medium
	 (code |relate.22:63| |even more typical would be size|)
	 (thesis 157 |could have the dominating character typically appear above the other, do things first as a rule, or be larger than the other|))))

(defun teach-relationships-about-appearance ()
  (mapc (function
	 (lambda (entry)
		 (let (((relationship element relation strength . evidence) entry))
		      (ask ,relationship process suggestions
			   (for (,element ? ?) (quote ,relation) strength (quote ,strength)))
		      (putprop relationship
			       (cons (list element relation strength (cons 'and evidence))
				     (get relationship 'appearance-evidence))
			       'appearance-evidence))))
	:appearance-relationship-knowledge))

(+after-load '|ken;relate >|
  '(revival-once 'apsug-relationships 'teach-relationships-about-appearance))

;;; ------------------------------------------------- 3. comparisons

;; CSUMRY's uniqueness summary suggests that a character unique in its physical
;; description move differently (csumry.12:31-38); here, also that it look different,
;; on each relative appearance element, as strongly as it is unique. And look-alike:,
;; a summary as uniqueness-summary: is, whose finding, two characters the experts would
;; draw alike (REVIVE;APPEAR, 3), suggests that they differ on the shape's elements.
;; Each of the two is taught by a function of its own, so that tools/check-appear.mjs
;; can leave either out when it asks what Ani would choose without it.
(defun teach-comparisons-about-appearance ()
  (teach-uniqueness-about-appearance)
  (let ((:insert-methods-at-end nil))
       (define look-alike: summary))
  (teach-look-alike-about-appearance))

(defun teach-uniqueness-about-appearance ()
  (ask uniqueness-summary: process suggestions
       (suggestion: element ({or relative-size relative-shape-jaggedness
				 relative-shape-complexity}
			     ? ?)
		    value 'different-from
		    strength level
		    source (uniqueness-summary: uniqueness-level ?level
						descriptor-type physical
						of-who ?)))
  (putprop 'uniqueness-summary:
	   '((physical (relative-size relative-shape-jaggedness relative-shape-complexity)
		       different-from level
		       (thesis 94 |the finding that a character is unique suggests that that character move (or appear) differently from the others|)))
	   'appearance-evidence))

(defun teach-look-alike-about-appearance ()
  (ask look-alike: process suggestions
       (suggestion: element ({or relative-shape-jaggedness relative-shape-complexity}
			     ? ?)
		    value 'different-from
		    strength 'high
		    source (look-alike: shape ? of-who ?)))
  (putprop 'look-alike:
	   '((drawn-alike (relative-shape-jaggedness relative-shape-complexity)
			  different-from high
			  (thesis 94 |the difference between two similar characters should be accented by choosing divergent values for one or two elements to help the viewer distinguish the two characters|)))
	   'appearance-evidence))

(+after-load '|ken;csumry >|
  '(revival-once 'apsug-comparisons 'teach-comparisons-about-appearance))

;; look-alike: is a top-level actor of ours defined once CSUMRY has loaded, so the tags
;; give it CSUMRY as its file, as load.33 fills them for Ken's.
(defprop look-alike: |KEN;CSUMRY| actor-load)

;; A comparison's suggestions for a relative element (sugrel.54:10-19), and, once two
;; characters have been drawn alike (REVIVE;APPEAR sets :appear-look-alikes), those
;; of each look-alike: finding the comparison memorized, gathered as SUGREL gathers a
;; comparison summary's (sugrel.54:120-134). Until then Ken's list, as it was.
(defun collect-relationship-comparison-and-look-alike-suggestions (element comparison)
  (let ((suggestions
	 (funcall (revival-wrapped 'collect-relationship-and-comparison-suggestions 'apsug)
		  element comparison))
	(look-alike (and :appear-look-alikes (look-alike-suggestions element comparison))))
       (cond (look-alike (append suggestions look-alike))
	     (t suggestions))))

(defun look-alike-suggestions (element comparison)
  (let ((element-name (cond ((atom element) element) (t (first element))))
	(character1 (second comparison))
	(character2 (third comparison)))
       (do ((findings (ask ,comparison collect items memorized matching (look-alike: %))
		      (rest findings))
	    (suggestions nil))
	   ((null findings) suggestions)
	   (setq suggestions
		 (append suggestions
			 (ask look-alike: collect items memorized matching
			      (suggestion: element (,element-name ,character1 ,character2)
					   value ?
					   strength ?
					   source ,(first findings))))))))

(or (boundp ':appear-look-alikes) (setq :appear-look-alikes nil))

(+after-load '|ken;sugrel >|
  '(revival-wrap 'collect-relationship-and-comparison-suggestions 'apsug
		 'collect-relationship-comparison-and-look-alike-suggestions))

;;; ------------------------------------------------- 4. the character's dynamics

;; The revival's (p. 175 is the motivation): an appearance element's suggestions from
;; the character's own chosen dynamics, (dynamics-element relation strength evidence):
;; same, the dynamics value as it is; opposite, the other way round. The dynamics are
;; all chosen before any look (REVIVE;APPEAR, 2).
(defprop shape-jaggedness
	 ((path-jaggedness same medium
	   (why |a character whose paths are jagged is drawn jagged, so its look and its movement say the same (motivated by p. 175)|)))
	 dynamics-suggestions)

(defprop shape-complexity
	 ((speed opposite low
	   (why |detail is lost on a character that moves quickly, so it is drawn simply, and a slow one can carry more (motivated by p. 175)|)))
	 dynamics-suggestions)

;; The suggestions an appearance choice point gets from its character's dynamics:
;;   (suggestion: element shape-jaggedness value medium strength medium
;;		  source (dynamics-of cinderella path-jaggedness))
;; A dynamics choice not yet made postpones it, as a relative value not yet made does
;; (choose.198:252-259); one given up on (none) suggests nothing.
(defun gather-dynamics-suggestions (choice-point)
  (let ((character (ask ,choice-point recall your thing))
	(element (ask ,choice-point recall your element-name)))
       (do ((rules (get element 'dynamics-suggestions) (rest rules))
	    (suggestions nil)
	    (missing nil))
	   ((null rules)
	    (cond ((and missing
			(ask postponer should ,choice-point postpone since ,missing
			     were needed but not yet made)))
		  (t (nreverse suggestions))))
	   (let (((moving relation strength) (first rules)))
		(let ((dynamics-choice '(choice-point-of ,character ,moving)))
		     (let ((value (and (exists? dynamics-choice)
				       (ask ,dynamics-choice recall your current-choice))))
			  (cond ((not (exists? dynamics-choice)))
				((null value) (setq missing (cons dynamics-choice missing)))
				((eq value 'none)) ;;given up on
				(t (setq suggestions
					 (cons '(suggestion: element ,element
							     value ,(dynamics-suggests value relation)
							     strength ,strength
							     source (dynamics-of ,character ,moving))
					       suggestions))))))))))

;; The value suggested: high, medium or low by the dynamics value's rank (elemnt.1:
;; 151-189), so a path-length's long is high; or the other way round.
(defun dynamics-suggests (value relation)
  (cond ((not (atom value))
	 (list (first value) (dynamics-suggests (second value) relation))) ;;(not X)
	(t (let ((rank (ask ,value recall your three-value-rank)))
		(cond ((eq rank 'middle) 'medium)
		      ((eq (eq rank 'top) (eq relation 'same)) 'high)
		      (t 'low))))))

;; CHOOSE gathers each source's suggestions by its type (choose.198:135-163), and
;; weighs each suggestion by the type of its source (choose.198:431-452). Both learn
;; the dynamics source; neither meets it in 1978, and everything else is Ken's.
(defun gather-suggestions-of-type-and-dynamics (type choice-point)
  (cond ((eq type 'dynamics-suggestions) (gather-dynamics-suggestions choice-point))
	(t (funcall (revival-wrapped 'gather-suggestions-of-type 'apsug) type choice-point))))

(defun source-type-and-dynamics (source)
  (cond ((and (not (atom source)) (eq (first source) 'dynamics-of)) 'dynamics-suggestions)
	(t (funcall (revival-wrapped 'source-type 'apsug) source))))

(+after-load '|ken;choose >|
  '(progn (revival-wrap 'gather-suggestions-of-type 'apsug 'gather-suggestions-of-type-and-dynamics)
	  (revival-wrap 'source-type 'apsug 'source-type-and-dynamics)))

;;; ------------------------------------------------- 5. the film's levels

;; Which of the film's levels suggest a value for each appearance element:
;; ((level relation strength evidence) ...). same: the level's value (flashiness low,
;; size low); medium-unless-high: medium, unless the level is high. p. 165 says how
;; many aspects a film should use, not what a look's values should be: reading "only a
;; few" as a subtle film leaving the looks it doesn't use at medium, which says
;; nothing, is the revival's. The film's complexity is not here (see the top of this
;; file): p. 164 gives it to choosing among the experts' shapes, REVIVE;SHAPES's
;; select-shape.
(defprop size
	 (((flashiness level) same medium
	   (code |glosug.41:39| |size is also bigger is flashier|))
	  ((obviousness level) medium-unless-high low
	   (why |a film that is not obvious leaves a look at medium, which says nothing, so that only a few aspects carry the characters (motivated by p. 165: if the film is supposed to be obvious, then many aspects should be used---if subtle, then only a few)|)))
	 film-level-suggestions)

(defprop shape-jaggedness
	 (((obviousness level) medium-unless-high low
	   (why |a film that is not obvious leaves a look at medium, which says nothing, so that only a few aspects carry the characters (motivated by p. 165: if the film is supposed to be obvious, then many aspects should be used---if subtle, then only a few)|)))
	 film-level-suggestions)

(defprop shape-complexity
	 (((obviousness level) medium-unless-high low
	   (why |a film that is not obvious leaves a look at medium, which says nothing, so that only a few aspects carry the characters (motivated by p. 165: if the film is supposed to be obvious, then many aspects should be used---if subtle, then only a few)|)))
	 film-level-suggestions)

;; Each of those levels answers as before (glosug.41), and, if that is nothing, with
;; its suggestion for an appearance element, as Ken's comment in (flashiness level)
;; has it: "size is also bigger is flashier".
(defun extend-film-levels-to-appearance ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (yield suggestions for ?choice-point) (flashiness level)
	(or (ask-old :self yield suggestions for ,choice-point)
	    (film-level-appearance-suggestion :self choice-point)))
       (define-extension-method (yield suggestions for ?choice-point) (obviousness level)
	(or (ask-old :self yield suggestions for ,choice-point)
	    (film-level-appearance-suggestion :self choice-point)))))

(defun film-level-appearance-suggestion (film-level choice-point)
  (let ((element (ask ,choice-point recall your element-name))
	(level (ask ,film-level recall your level)))
       (let ((rule (assoc film-level (get element 'film-level-suggestions))))
	    (and rule
		 (let ((value (cond ((eq (second rule) 'same)
				     (ask ,element yield a value that is ,level))
				    ((eq (second rule) 'medium-unless-high)
				     (and (not (eq level 'high)) 'medium)))))
		      (and value
			   '(suggestion: element ,element
					 value ,value
					 strength ,(third rule)
					 source ,film-level)))))))

(+after-load '|ken;glosug >|
  '(revival-once 'apsug-film-levels 'extend-film-levels-to-appearance))

;;; ------------------------------------------------- all of it, for the glass box

;; Every piece of knowledge above as (kind source element value strength evidence),
;; kind descriptor, relationship, comparison, dynamics or film (src/glassbox-pass1.js
;; collectAppearances; tools/check-appear.mjs).
(defun appearance-knowledge ()
  (append
   (mapcar (function
	    (lambda (entry)
		    (let (((descriptor element value strength evidence) entry))
			 (list 'descriptor descriptor element value strength evidence))))
	   :appearance-knowledge)
   (mapcar (function
	    (lambda (entry)
		    (let (((relationship element relation strength . evidence) entry))
			 (list 'relationship relationship element relation strength
			       (cons 'and evidence)))))
	   :appearance-relationship-knowledge)
   (list (list 'comparison '(uniqueness-summary: physical)
	       '(relative-size relative-shape-jaggedness relative-shape-complexity)
	       'different-from 'level
	       '(thesis 94 |the finding that a character is unique suggests that that character move (or appear) differently from the others|))
	 (list 'comparison 'look-alike:
	       '(relative-shape-jaggedness relative-shape-complexity)
	       'different-from 'high
	       '(thesis 94 |the difference between two similar characters should be accented by choosing divergent values for one or two elements to help the viewer distinguish the two characters|)))
   (mapcan (function
	    (lambda (element)
		    (mapcar (function
			     (lambda (rule)
				     (let (((moving relation strength evidence) rule))
					  (list 'dynamics moving element relation strength evidence))))
			    (get element 'dynamics-suggestions))))
	   '(size shape-jaggedness shape-complexity))
   (mapcan (function
	    (lambda (element)
		    (mapcar (function
			     (lambda (rule)
				     (let (((film-level relation strength evidence) rule))
					  (list 'film film-level element relation strength evidence))))
			    (get element 'film-level-suggestions))))
	   '(size shape-jaggedness shape-complexity))))

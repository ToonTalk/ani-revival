;;; -*-lisp-*-
;;; REVIVE;SHAPES: Ani's shape experts turn a character's chosen shape elements into a shape.
;;;
;;; This file is ours, not Ken's. It is part of APPEAR (src/pipeline.js, EXTENSIONS;
;;; REVIVE;APPEAR says what APPEAR does). The thesis: "New problems arise in actually
;;; constructing a shape for a character after the elements of the shape description
;;; have been chosen ... I envision a hierarchy of shapes where distributed throughout
;;; is the knowledge of how to construct a shape satisfying the constraints of the
;;; description. Near the top are experts corresponding to classes of shapes such as
;;; polygons, spirals, blobs, stars and the like. Each is asked if they have any
;;; suggestions for how to draw an object satisfying the description. If more than one
;;; suggestion results then they need to be combined, compared, and selected between
;;; on the basis of the desired levels of variety, simplicity, originality, etc., If
;;; no shape class can satisfy the constraints then many remedies are possible. A
;;; constraint can be eliminated or the least justified value of the elements ... can
;;; be redetermined" (AI-TR-540 p. 164).
;;;
;;; Here the experts are three: polygons, stars and blobs (Director's poly draws them
;;; all, with TUTIL's draw-poly: forward and right by the angle until the figure
;;; closes, 360/gcd(angle,360) sides; spirals it cannot draw). Each knows some shapes
;;; and where each lies on the two shape elements: how jagged it is, by how sharp its
;;; corners are, and how complex, by how many corners it has (a circle being simplest).
;;; Together they cover the nine pairs of values:
;;;
;;;   jaggedness \ complexity   low        medium      high
;;;   low                       circle     hexagon     octagon
;;;   medium                    square     pentagon    ten-pointed star
;;;   high                      triangle   star        eight-pointed star
;;;
;;; The constraints are the character's two shape choices, each with how strongly it
;;; was justified (REVIVE;APPEAR's choice-justification); a (not X) allows either of the
;;; other two values, and none, given up on, is no constraint. Each expert offers the
;;; shapes it knows that satisfy them all. If none does, the least justified
;;; constraint is relaxed ("a constraint can be eliminated"), its choice point
;;; memorizes (overridden-by: shape-experts drawn S because no-shape-fits), and the
;;; experts are asked again. Of several shapes offered, the film's variety prefers one
;;; no character earlier in the focus is drawn as (unless variety is low), its
;;; complexity the simplest (low) or the most complex (high), and its originality the
;;; experts' first, most stereotyped, shapes (low) or their last (high).
;;; Telling characters apart is first Ani's: two characters drawn alike have one of
;;; their shape choices made again (REVIVE;APPEAR, 3), so that what the choice points
;;; say and what is drawn agree. Only two she still chooses alike are kept apart here,
;;; as a last resort, by relaxing constraints until the second is drawn as a shape that
;;; differs from the first's on both elements (draw-character); its choice points then
;;; say what the experts overrode, and the glass box shows the value drawn beside the
;;; value chosen (drawn-value).
;;;
;;; What the experts did is memorized on the character's appearance, (appearance-of
;;; cinderella), for the glass box: (considered: ...), (relaxed: ...) and (chosen: ...);
;;; and its look, the variables shape, angle, center-offset (a turn before drawing,
;;; which ANINIT gives the star and the triangle so that a point is up, aninit.65:
;;; 37-47) and ani-size (REVIVE;APPEAR's appearance-number), which REVIVE;LOOKS
;;; has Director take.

;;; ------------------------------------------------- the experts

(defun define-shape-experts ()
  (let ((:insert-methods-at-end nil))
       (define shape-expert something
	(set your shapes to nil)
	(do when receiving (suggest shapes satisfying ?constraints)
	    (shapes-satisfying (ask :self recall your shapes) constraints)))
       (define polygon-expert shape-expert
	(set your shapes to
	     ((shape: name triangle angle 120 center-offset (right 30)
		      shape-jaggedness high shape-complexity low)
	      (shape: name square angle 90 center-offset nil
		      shape-jaggedness medium shape-complexity low)
	      (shape: name pentagon angle 72 center-offset (right 54)
		      shape-jaggedness medium shape-complexity medium)
	      (shape: name hexagon angle 60 center-offset nil
		      shape-jaggedness low shape-complexity medium)
	      (shape: name octagon angle 45 center-offset nil
		      shape-jaggedness low shape-complexity high))))
       (define star-expert shape-expert
	(set your shapes to
	     ((shape: name star angle 144 center-offset (right 18)
		      shape-jaggedness high shape-complexity medium)
	      (shape: name eight-pointed-star angle 135 center-offset nil
		      shape-jaggedness high shape-complexity high)
	      (shape: name ten-pointed-star angle 108 center-offset nil
		      shape-jaggedness medium shape-complexity high))))
       (define blob-expert shape-expert
	(set your shapes to
	     ((shape: name circle angle 5 center-offset nil
		      shape-jaggedness low shape-complexity low))))))

(+after-load '|ken;elemnt >| '(revival-once 'shape-experts 'define-shape-experts))

;; The experts are top-level actors of ours defined once ELEMNT has loaded, so the tags
;; give them ELEMNT as their file, as load.33 fills them for Ken's: exists? knows them
;; before, and asking one loads it.
(defprop shape-expert |KEN;ELEMNT| actor-load)
(defprop polygon-expert |KEN;ELEMNT| actor-load)
(defprop star-expert |KEN;ELEMNT| actor-load)
(defprop blob-expert |KEN;ELEMNT| actor-load)

;; The shapes that satisfy every constraint.
(defun shapes-satisfying (shapes constraints)
  (mapcan (function
	   (lambda (shape) (and (shape-satisfies? shape constraints) (list shape))))
	  (append shapes nil)))

(defun shape-satisfies? (shape constraints)
  (do ((c constraints (rest c)))
      ((null c) t)
      (let ((value (get (first c) 'value))
	    (shapes-value (get shape (get (first c) 'element))))
	   (or (cond ((atom value) (eq shapes-value value))
		     ((eq (first value) 'not) (not (eq shapes-value (second value)))))
	       (return nil)))))

;; Every expert's offer, in the experts' order, as (expert shape) pairs.
(defun shapes-offered (constraints)
  (mapcan (function
	   (lambda (expert)
		   (mapcar (function (lambda (shape) (list expert shape)))
			   (ask ,expert suggest shapes satisfying ,constraints))))
	  (shape-experts)))

;; The experts in the order they were defined: polygons, stars, blobs (offspring are
;; kept newest first).
(defun shape-experts ()
  (reverse (ask shape-expert recall your offspring)))

;;; ------------------------------------------------- the constraints

;; A character's shape choices as constraints, each
;;   (constraint: element shape-jaggedness value low justification 9
;;		  choice-point (choice-point-of cinderella shape-jaggedness))
;; none, given up on, is no constraint.
(defun shape-constraints (character)
  (mapcan (function
	   (lambda (element)
		   (let ((choice-point '(choice-point-of ,character ,element)))
			(let ((value (and (exists? choice-point)
					  (ask ,choice-point recall your current-choice))))
			     (and value (not (eq value 'none))
				  (list '(constraint: element ,element
						      value ,value
						      justification ,(choice-justification choice-point)
						      choice-point ,choice-point)))))))
	  '(shape-jaggedness shape-complexity)))

(defun least-justified-constraint (constraints)
  (do ((c constraints (rest c))
       (least nil))
      ((null c) least)
      (and (or (null least) (< (get (first c) 'justification) (get least 'justification)))
	   (setq least (first c)))))

;;; ------------------------------------------------- drawing each character

;; Each character in focus order with the shape the experts draw it as, ((cinderella
;; circle) ...). With record, what they did is memorized on its appearance, and its
;; look set there. With keep-apart, a shape a character earlier in the focus is drawn
;; as does not fit (see draw-character).
(defun draw-the-characters (record keep-apart)
  (do ((characters (characters-in-focus-order) (rest characters))
       (drawn nil))
      ((null characters) (nreverse drawn))
      (let ((shape (draw-character (first characters) drawn record keep-apart)))
	   (setq drawn (cons (list (first characters) (get shape 'name)) drawn)))))

;; The shape for a character, given those drawn so far, ((cinderella circle) ...).
;; Ani tells apart the characters drawn alike by choosing one of their shape choices
;; again (REVIVE;APPEAR, 3); if she still chooses them alike (two characters whose
;; descriptions are the same, say, which Ani's comparisons tell her to make look the
;; same), the experts draw the second as no shape the first is drawn as: in black and
;; white, two characters drawn the same, of the same size or nearly, cannot be told
;; apart at all. So, with keep-apart, a shape already drawn for another character
;; does not fit, and if no other does, the least justified constraint is relaxed as
;; when no shape fits, its choice point memorizing (overridden-by: shape-experts drawn
;; triangle because (drawn-alike-with dum)). Once a constraint has been relaxed to
;; keep the character apart from another, only a shape that differs from the other's
;; on both shape elements fits: the drawing already departs from Ani's choice, and a
;; pentagon beside a hexagon of the same size, which differ by one step on one
;; element, are told apart hardly better than two pentagons ("divergent values for one
;; or two elements to help the viewer distinguish the two characters", p. 94). If none
;; does, the next least justified constraint is relaxed too ("the 'constraint
;; relaxation' ... methods can be applied iteratively", p. 164); with none left, any
;; shape not yet drawn will do.
;; Two characters alike are kept apart even if they never share a scene: a viewer
;; knows a character from scene to scene by how it looks, and two drawn the same in
;; different scenes would be taken for one.
(defun draw-character (character drawn record keep-apart)
  (let ((appearance '(appearance-of ,character))
	(taken (mapcar 'second drawn)))
       (and record (ask appearance if new make ,appearance))
       (do ((constraints (shape-constraints character))
	    (relaxed nil)
	    (alike nil)) ;;(dum pentagon), once a constraint is relaxed to keep it apart from dum
	   (nil)
	   (let ((offered (shapes-offered constraints)))
		(let ((untaken (shapes-not-taken offered taken))
		      (apart (and alike (shapes-apart-from (shapes-not-taken offered taken)
							   (second alike)))))
		     (and record
			  (ask ,appearance memorize
			       (considered: constraints ,(mapcar 'constraint-summary constraints)
					    offered ,(mapcar 'offer-summary offered))))
		     (cond ((and offered
				 (or (not keep-apart)
				     (null constraints)
				     (cond (alike apart) (t untaken))))
			    (let ((chosen (select-shape (cond (apart apart) (t offered)) taken)))
				 (and record (record-shape character chosen offered relaxed))
				 (return (second chosen))))
			   ((null constraints)
			    (shouldnt-happen 'draw-character
					     '(no expert has any shape for ,character)))
			   (t (let ((least (least-justified-constraint constraints)))
				   (and offered (null alike)
					(setq alike (rassq-shape (get (second (first offered)) 'name)
								 drawn)))
				   (let ((because (cond (alike (list 'drawn-alike-with (first alike)))
							(t 'no-shape-fits))))
					(and record
					     (ask ,appearance memorize
						  (relaxed: element ,(get least 'element)
							    value ,(get least 'value)
							    justification ,(get least 'justification)
							    because ,because)))
					(setq relaxed (cons (list least because) relaxed))
					(setq constraints (delq least (append constraints nil))))))))))))

;; Of the offers, those whose shape differs from the shape named on both shape elements.
(defun shapes-apart-from (offered name)
  (let ((other (shape-named name)))
       (mapcan (function
		(lambda (offer)
			(and (not (eq (get (second offer) 'shape-jaggedness)
				      (get other 'shape-jaggedness)))
			     (not (eq (get (second offer) 'shape-complexity)
				      (get other 'shape-complexity)))
			     (list offer))))
	       offered)))

;; The shape an expert knows by its name.
(defun shape-named (name)
  (do ((offers (shapes-offered nil) (rest offers)))
      ((null offers) nil)
      (and (eq (get (second (first offers)) 'name) name) (return (second (first offers))))))

;; The character in drawn ((cinderella circle) ...) drawn as the shape.
(defun rassq-shape (shape drawn)
  (do ((d drawn (rest d)))
      ((null d) nil)
      (and (eq (second (first d)) shape) (return (first d)))))

(defun shapes-not-taken (offered taken)
  (mapcan (function
	   (lambda (offer)
		   (and (not (memq (get (second offer) 'name) taken)) (list offer))))
	  offered))

(defun offer-summary (offer)
  (list (first offer) (get (second offer) 'name)))

(defun constraint-summary (constraint)
  (list (get constraint 'element) (get constraint 'value) (get constraint 'justification)))

;; Of the (expert shape) offers, the one the film's levels prefer (see above).
(defun select-shape (offered taken)
  (let ((variety (film-level-of 'variety))
	(complexity (film-level-of 'complexity))
	(originality (film-level-of 'originality)))
       (let ((offers (cond ((eq originality 'high) (reverse offered)) (t offered))))
	    (let ((untaken (shapes-not-taken offers taken)))
		 (simplest-or-most-complex
		  (cond ((and untaken (not (eq variety 'low))) untaken)
			(t offers))
		  complexity)))))

(defun simplest-or-most-complex (offers complexity)
  (do ((o offers (rest o))
       (best (first offers)))
      ((null o) best)
      (let ((rank (complexity-rank (second (first o))))
	    (best-rank (complexity-rank (second best))))
	   (cond ((and (eq complexity 'low) (< rank best-rank)) (setq best (first o)))
		 ((and (eq complexity 'high) (> rank best-rank)) (setq best (first o)))))))

(defun complexity-rank (shape)
  (cdr (assq (get shape 'shape-complexity) '((low . 1) (medium . 2) (high . 3)))))

;; Its look, on its appearance: the shape and how Director draws it, and the size; and
;; on any choice point whose constraint was relaxed, (constraint because) in relaxed,
;; that the drawn shape overrode it, and why.
(defun record-shape (character offer offered relaxed)
  (let ((appearance '(appearance-of ,character))
	(shape (second offer)))
       (ask ,appearance memorize
	    (chosen: shape ,(get shape 'name)
		     by ,(first offer)
		     from ,(mapcar (function (lambda (o) (get (second o) 'name))) offered)))
       (mapc (function
	      (lambda (relaxation)
		      (ask ,(get (first relaxation) 'choice-point) memorize
			   (overridden-by: shape-experts drawn ,(get shape 'name)
					   because ,(second relaxation)))))
	     relaxed)
       (ask ,appearance set your shape to ,(get shape 'name))
       (ask ,appearance set your angle to ,(get shape 'angle))
       (ask ,appearance set your center-offset to ,(get shape 'center-offset))
       (let ((size-choice '(choice-point-of ,character size)))
	    (ask ,appearance set your ani-size to
		 ,(cond ((exists? size-choice) (appearance-number size-choice))
			(t .05))))))

;; The value a character's look, as drawn, has on an element: its shape's place on a
;; shape element (the table above), the value whose number its size, its color's
;; saturation or its color's value is (REVIVE;APPEAR's and REVIVE;COLORS's tables), or
;; its hue (REVIVE;COLORS). It differs from Ani's choice where the experts overrode it,
;; and is one value where she chose (not X); the glass box shows it beside her choice
;; (src/glassbox-pass1.js collectAppearances).
(defun drawn-value (character element)
  (let ((appearance '(appearance-of ,character)))
       (and (exists? appearance)
	    (cond ((eq element 'color-hue) (ask ,appearance recall your hue))
		  ((get element 'appearance-numbers)
		   (let ((number (drawn-number appearance element)))
			(do ((n (get element 'appearance-numbers) (rest n)))
			    ((null n) nil)
			    (and (equal (second (first n)) number) (return (first (first n)))))))
		  (t (get (shape-named (ask ,appearance recall your shape)) element))))))

;; The number an element was drawn with: the size, or a part of the color.
(defun drawn-number (appearance element)
  (cond ((eq element 'color-saturation) (second (ask ,appearance recall your look-color)))
	((eq element 'color-intensity) (third (ask ,appearance recall your look-color)))
	(t (ask ,appearance recall your ani-size))))

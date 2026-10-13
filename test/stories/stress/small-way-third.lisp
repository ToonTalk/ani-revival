;; -*-lisp-*-
;; cast: goat = the goat (she); kid = the kid (he); troll = the troll (he)
;; scenes: in-the-wood = In the Wood; at-the-house = At the House
;; A stress story for the revival's repairs (README.md here), the first two scenes of a
;; reviewer's Hansel and Gretel on the skeleton's lines. In the wood the troll pushes
;; the kid around and leaves the two alone, which puts everyone on the picture. At the
;; house the kid walks with the goat;
;; the troll, wanting to meet the kid (wants, convey.64:187-208), moves a small way
;; towards him (move-small-part-towards, disply.311:694-719), a walk to a moving target
;; that leaves him, for the rest of the scene, at (small-way-from (vicinity-of troll)
;; (vicinity-of kid)) (place.45:175-183); and then he shows he is mean. Measuring from
;; there to anyone but the troll and the kid stops pass 2: (break
;; small-way-from-cant-do-yet) (interf.149:336-342). REVIVE;MEND16 measures from the
;; place the small way from stands for.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical pretty)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical pretty)
		 (personality (and good friendly))))

(define troll character
	(process initial description
		 (physical ugly)
		 (personality (and evil mean selfish))))

(define (relationship-of goat kid) relationship
	(process initial description
		 loves))

(define (relationship-of kid goat) relationship
	(process initial description
		 loves))

(define (relationship-of troll kid) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of troll goat) relationship
	(process initial description
		 dominates))

(define (relationship-of goat troll) relationship
	(process initial description
		 hates))

(define in-the-wood scene
	(process initial description
		 (sequence: (convey (pushes troll kid))
			    (convey (alone troll kid goat))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(define at-the-house scene
	(process initial description
		 (sequence: (convey (accompanys kid goat))
			    (convey (wants troll (meets troll kid)))
			    (establish (personality troll))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define small-way-third-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 1) (minutes 2)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (goat at-the-house (relationship-of troll kid))))

(compile-actors)

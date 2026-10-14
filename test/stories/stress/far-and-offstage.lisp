;; -*-lisp-*-
;; cast: goat = the goat (she); kid = the kid (he); troll = the troll (he)
;; scenes: at-the-house = At the House
;; A stress story for the revival's repairs (README.md here), on the skeleton of
;; small-way-third, with no scene before: the kid walks with the goat, and then the troll,
;; wanting to meet the kid (wants, convey.64:187-208), moves a small way towards him
;; (move-small-part-towards, disply.311:694-726). The troll has no part before, so he has
;; no place, and the subscene doesn't start with a cut: place-large-distance-apart asks
;; for him to be placed (large-distance-and-offstage (vicinity-of kid)) (place.45:25-39,
;; 116-149), and PLACE defines small-distance-and-offstage and medium-distance-and-offstage
;; but not that (place.45:488-520): pass 2 stops, "LARGE-DISTANCE-AND-OFFSTAGE is not an
;; actor". REVIVE;MEND19 defines it as PLACE's medium-distance-and-offstage is, at INTERF's
;; good-distance-from-and-offstage (interf.149:630-654).

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

(define at-the-house scene
	(process initial description
		 (sequence: (convey (accompanys kid goat))
			    (convey (wants troll (meets troll kid)))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define far-and-offstage-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (seconds 20) (seconds 40)))
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

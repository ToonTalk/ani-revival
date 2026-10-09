;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the revival's repairs (README.md here): the kid has no
;; descriptors at all. Pass 1 compares each pair of characters and stops when two
;; have nothing to compare (sumcom.53:8-10).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define troll character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean strong))))

(define kid character)

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of goat kid) relationship
	(process initial description
		 is-protective-to))

(define (relationship-of kid goat) relationship
	(process initial description
		 is-grateful-to))

(define (relationship-of troll kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-polite-to))

(define on-the-bridge scene
	(process initial description
		 (and (establish (personality troll))
		      (establish (emotional-state goat (joy (negative low))))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define no-descriptors-film film
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
      (goat on-the-bridge (relationship-of troll goat))))

(compile-actors)

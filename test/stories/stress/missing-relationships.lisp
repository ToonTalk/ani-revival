;; -*-lisp-*-
;; cast: goat = the goat (she); kid = the kid (he); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the revival's repairs (README.md here): the goat is friendly
;; and has no relationship with the troll. Looking for a friend, Ani asks about
;; (relationship-of goat troll) (prereq.19:110-120), which doesn't exist.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good friendly))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical beautiful)
		 (personality kind)))

(define troll character
	(process initial description
		 (physical ugly)
		 (personality strong)))

(define (relationship-of goat kid) relationship
	(process initial description
		 loves))

(define (relationship-of kid goat) relationship
	(process initial description
		 loves))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of troll kid) relationship
	(process initial description
		 is-polite-to))

(define on-the-bridge scene
	(process initial description
		 (establish (personality goat)))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define missing-relationships-film film
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
      (goat on-the-bridge (relationship-of goat kid))))

(compile-actors)

;; -*-lisp-*-
;; cast: duckling = the duckling (he); mother-duck = the mother duck (she); ducks = the other ducks (they); swan = the swan (she)
;; scenes: the-hatching = The Hatching; teased = Teased; alone-in-winter = Alone in Winter; the-swans = The Swans

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define duckling character
	(process initial description
		 (physical (and ugly unkempt))
		 (personality (and shy kind good))
		 (role-in-story most-important)))

(define mother-duck character
	(process initial description
		 (physical shabby)
		 (personality kind)))

(define ducks character
	(process initial description
		 (physical pretty)
		 (personality (and mean unfriendly))))

(define swan character
	(process initial description
		 (physical (and beautiful elegant))
		 (personality (and friendly kind good))))

(define (relationship-of mother-duck duckling) relationship
	(process initial description
		 (and loves is-protective-to)))

(define (relationship-of duckling mother-duck) relationship
	(process initial description
		 loves))

(define (relationship-of ducks duckling) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of duckling ducks) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of ducks mother-duck) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of mother-duck ducks) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of swan duckling) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of duckling swan) relationship
	(process initial description
		 adores))

(define (relationship-of swan ducks) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of ducks swan) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of swan mother-duck) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of mother-duck swan) relationship
	(process initial description
		 is-polite-to))

(define the-hatching scene
	(process initial description
		 (and (establish (personality duckling))
		      (establish (relationship (relationship-of mother-duck duckling)))
		      (establish (emotional-state mother-duck (joy (positive medium))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to short))

(define teased scene
	(process initial description
		 (sequence: (establish (personality ducks))
			    (convey (pushes ducks duckling))
			    (convey (chases ducks duckling))
			    (establish (emotional-state duckling (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to medium))

(define alone-in-winter scene
	(process initial description
		 (and (convey (alone duckling mother-duck))
		      (establish (emotional-state duckling (joy (negative medium))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(define the-swans scene
	(process initial description
		 (sequence: (convey (wants duckling (meets duckling swan)))
			    (convey (accompanys swan duckling))
			    (and (establish (personality swan))
				 (establish (emotional-state duckling (joy (positive high)))))))
	(set your mood to (changes depressing joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define ugly-duckling-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 2) (minutes 4)))
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
      (duckling teased the-swans
                (relationship-of ducks duckling))))

(compile-actors)

;; -*-lisp-*-
;; cast: duckling = the duckling (he); ducks = the ducks (they); swans = the swans (they)
;; scenes: teasing = Teased by the Ducks; winter = A Lonely Winter; spring = The Swans Welcome Him

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define duckling character
	(process initial description
		 (physical ugly)
		 (personality shy)
		 (role-in-story most-important)))

(define ducks character
	(process initial description
		 (physical pretty)
		 (personality mean)))

(define (relationship-of ducks duckling) relationship
	(process initial description
		 (and dominates hates)))

(define swans character
	(process initial description
		 (physical beautiful)
		 (personality (and kind good))))

(define (relationship-of swans duckling) relationship
	(process initial description
		 is-helpful-towards))

(define teasing scene
	(process initial description
		 (and (establish (personality duckling))
		      (establish (personality ducks))
		      (establish (relationship (relationship-of ducks duckling)))
		      (convey (pushes ducks duckling))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define winter scene
	(process initial description
		 (and (convey (wants duckling (meets duckling swans)))
		      (establish (emotional-state duckling (and (joy (negative high)) (pride (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define spring scene
	(process initial description
		 (and (establish (personality swans))
		      (establish (relationship (relationship-of swans duckling)))
		      (convey (accompanys swans duckling))
		      (establish (emotional-state duckling (and (joy (positive high)) (pride (positive high)))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define ugly-duckling-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to medium)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (duckling teasing winter spring
        (relationship-of ducks duckling)
        (relationship-of swans duckling))))

(compile-actors)

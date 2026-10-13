;; -*-lisp-*-
;; cast: duckling = the duckling (he); ducks = the other ducks (they); swans = the swans (they)
;; scenes: teasing = Teasing; lonely-winter = Lonely Winter; spring-welcome = Spring Welcome

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

(define swans character
	(process initial description
		 (physical beautiful)
		 (personality (and kind friendly))))

(define (relationship-of ducks duckling) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of duckling ducks) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of swans duckling) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of duckling swans) relationship
	(process initial description
		 is-grateful-to))

(define teasing scene
	(process initial description
		 (and (establish (personality duckling))
		      (establish (personality ducks))
		      (establish (relationship (relationship-of ducks duckling)))
		      (convey (pushes ducks duckling))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define lonely-winter scene
	(process initial description
		 (and (convey (wants duckling (meets duckling swans)))
		      (establish (emotional-state duckling (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to long))

(define spring-welcome scene
	(process initial description
		 (sequence:
		  (convey (meets duckling swans))
		  (convey (accompanys swans duckling))
		  (and (establish (relationship (relationship-of swans duckling)))
		       (establish
			(emotional-state duckling
					 (and (joy (positive high))
					      (pride (positive medium))))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read)))

(define duckling-film film
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
      (duckling teasing lonely-winter spring-welcome
                 (relationship-of ducks duckling)
                 (relationship-of swans duckling))))

(compile-actors)

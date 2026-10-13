;; -*-lisp-*-
;; cast: duckling = the ugly duckling (he); ducks = the other ducks (they); swans = the swans (they)
;; scenes: unwelcome-duckling = The Unwelcome Duckling; pushed-around = Pushed Around; lonely-winter = A Lonely Winter; spring-welcome = A Welcome in Spring

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define duckling character
	(process initial description
		 (physical (and ugly physically-weak))
		 (personality (and shy good))
		 (role-in-story most-important)))

(define ducks character
	(process initial description
		 (physical (and pretty physically-strong))
		 (personality (and mean unfriendly))))

(define (relationship-of ducks duckling) relationship
	(process initial description
		 (and hates is-impolite-to)))

(define swans character
	(process initial description
		 (physical (and beautiful elegant))
		 (personality (and kind friendly))
		 (movement graceful)))

(define (relationship-of swans duckling) relationship
	(process initial description
		 (and is-helpful-towards is-polite-to)))

(define (relationship-of duckling swans) relationship
	(process initial description
		 (and is-grateful-to is-polite-to)))

(define unwelcome-duckling scene
	(process initial description
		 (sequence: (and (establish (personality duckling))
		                 (establish (personality ducks)))
		            (establish (relationship (relationship-of ducks duckling)))
		            (establish (emotional-state duckling (joy (negative medium))))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to short))

(define pushed-around scene
	(process initial description
		 (sequence: (convey (pushes ducks duckling))
		            (establish (emotional-state duckling (and (joy (negative high)) (pride (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define lonely-winter scene
	(process initial description
		 (sequence: (establish (personality duckling))
		            (establish (emotional-state duckling (and (joy (negative high)) (pride (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to long))

(define spring-welcome scene
	(process initial description
		 (sequence: (establish (personality swans))
		            (convey (meets duckling swans))
		            (establish (relationship (relationship-of swans duckling)))
		            (establish (emotional-state duckling (and (joy (positive high)) (pride (positive high)))))))
	(set your mood to (very joyous))
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
      (duckling lonely-winter spring-welcome
        (relationship-of duckling swans)
        (relationship-of swans duckling)
        (relationship-of ducks duckling))))

(compile-actors)

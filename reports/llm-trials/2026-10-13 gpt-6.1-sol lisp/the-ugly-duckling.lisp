;; -*-lisp-*-
;; cast: ugly-duckling = the ugly duckling (he); other-duck = one of the other ducks (they); swan = one of the swans (they)
;; scenes: introduction = Introduction; pushed-around = Pushed Around; lonely-winter = The Lonely Winter; spring-meeting = The Spring Meeting; welcomed = Welcomed

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define ugly-duckling character
	(process initial description
		 (physical ugly)
		 (personality shy)
		 (role-in-story most-important)))

(define other-duck character
	(process initial description
		 (physical physically-strong)
		 (personality mean)))

(define swan character
	(process initial description
		 (physical elegant)
		 (personality (and kind friendly))
		 (movement graceful)))

(define (relationship-of other-duck ugly-duckling) relationship
	(process initial description
		 (and hates dominates)))

(define (relationship-of ugly-duckling other-duck) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of swan ugly-duckling) relationship
	(process initial description
		 (and is-helpful-towards is-polite-to)))

(define (relationship-of ugly-duckling swan) relationship
	(process initial description
		 (and is-grateful-to is-polite-to)))

(define introduction scene
	(process initial description
		 (sequence:
		  (establish (personality ugly-duckling))
		  (establish (personality other-duck))
		  (establish (relationship (relationship-of other-duck ugly-duckling)))
		  (establish (emotional-state ugly-duckling (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to short))

(define pushed-around scene
	(process initial description
		 (sequence:
		  (convey (pushes other-duck ugly-duckling))
		  (establish (emotional-state ugly-duckling (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define lonely-winter scene
	(process initial description
		 (sequence:
		  (convey (wants ugly-duckling (meets ugly-duckling swan)))
		  (establish (emotional-state ugly-duckling (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to long))

(define spring-meeting scene
	(process initial description
		 (sequence:
		  (establish (personality swan))
		  (convey (meets ugly-duckling swan))
		  (establish (relationship (relationship-of swan ugly-duckling)))
		  (establish (emotional-state ugly-duckling (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define welcomed scene
	(process initial description
		 (sequence:
		  (convey (accompanys swan ugly-duckling))
		  (establish (relationship (relationship-of ugly-duckling swan)))
		  (establish (emotional-state ugly-duckling (joy (positive high))))
		  (establish (emotional-state ugly-duckling (pride (positive high))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

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
	     (ugly-duckling pushed-around lonely-winter spring-meeting welcomed
			   (relationship-of other-duck ugly-duckling)
			   (relationship-of swan ugly-duckling)
			   (relationship-of ugly-duckling swan))))

(compile-actors)

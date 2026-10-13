```lisp
;; -*-lisp-*-
;; cast: ugly-duckling = the ugly duckling (he); other-ducks = the other ducks (they); swans = the swans (they)
;; scenes: introduction = The Unhappy Duckling; pushed-around = Pushed Around; lonely-winter = The Lonely Winter; spring-welcome = The Spring Welcome; happy-and-proud = Happy and Proud

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define ugly-duckling character
	(process initial description
		 (physical ugly)
		 (personality shy)
		 (role-in-story most-important)))

(define other-ducks character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean unfriendly))))

(define swans character
	(process initial description
		 (physical (and beautiful elegant))
		 (personality (and kind friendly))
		 (movement graceful)))

(define (relationship-of other-ducks ugly-duckling) relationship
	(process initial description
		 (and hates dominates is-impolite-to)))

(define (relationship-of ugly-duckling other-ducks) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of swans ugly-duckling) relationship
	(process initial description
		 (and is-helpful-towards is-generous-towards)))

(define (relationship-of ugly-duckling swans) relationship
	(process initial description
		 (and is-grateful-to is-polite-to)))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality ugly-duckling))
		       (establish (personality other-ducks)))
		  (establish (relationship (relationship-of other-ducks ugly-duckling)))
		  (establish (emotional-state ugly-duckling (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to short))

(define pushed-around scene
	(process initial description
		 (sequence:
		  (convey (pushes other-ducks ugly-duckling))
		  (establish (emotional-state ugly-duckling (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define lonely-winter scene
	(process initial description
		 (sequence:
		  (convey (wants ugly-duckling (meets ugly-duckling swans)))
		  (establish (emotional-state ugly-duckling (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to long))

(define spring-welcome scene
	(process initial description
		 (sequence:
		  (establish (personality swans))
		  (convey (meets ugly-duckling swans))
		  (convey (accompanys swans ugly-duckling))
		  (establish (emotional-state ugly-duckling (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define happy-and-proud scene
	(process initial description
		 (sequence:
		  (and (establish (relationship (relationship-of swans ugly-duckling)))
		       (establish (relationship (relationship-of ugly-duckling swans))))
		  (and (establish (emotional-state ugly-duckling (joy (positive high))))
		       (establish (emotional-state ugly-duckling (pride (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define ugly-duckling-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to low)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (ugly-duckling introduction lonely-winter spring-welcome happy-and-proud
                     (relationship-of other-ducks ugly-duckling)
                     (relationship-of ugly-duckling other-ducks)
                     (relationship-of swans ugly-duckling)
                     (relationship-of ugly-duckling swans))))

(compile-actors)
```
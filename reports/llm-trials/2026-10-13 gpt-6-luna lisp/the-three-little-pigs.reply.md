```lisp
;; -*-lisp-*-
;; cast: pig-one = the first pig (she); pig-two = the second pig (they); pig-three = the third pig (they); wolf = the wolf (he)
;; scenes: the-wolf-chases = The Wolf Chases; pigs-stay-together = The Pigs Stay Together; wolf-kept-out = The Wolf Is Kept Out

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define pig-one character
	(process initial description
		 (physical physically-weak)
		 (personality (and good friendly))
		 (role-in-story most-important)))

(define pig-two character
	(process initial description
		 (physical physically-weak)
		 (personality (and good friendly))))

(define pig-three character
	(process initial description
		 (physical physically-weak)
		 (personality (and good friendly))))

(define wolf character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean evil))))

(define (relationship-of pig-one pig-two) relationship
	(process initial description
		 loves))

(define (relationship-of pig-two pig-one) relationship
	(process initial description
		 loves))

(define (relationship-of pig-one pig-three) relationship
	(process initial description
		 loves))

(define (relationship-of pig-three pig-one) relationship
	(process initial description
		 loves))

(define (relationship-of pig-two pig-three) relationship
	(process initial description
		 loves))

(define (relationship-of pig-three pig-two) relationship
	(process initial description
		 loves))

(define (relationship-of wolf pig-one) relationship
	(process initial description
		 hates))

(define the-wolf-chases scene
	(process initial description
		 (sequence: (establish (personality wolf))
			    (and (establish (personality pig-one))
				 (establish (relationship (relationship-of wolf pig-one)))
				 (convey (chases wolf pig-one)))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define pigs-stay-together scene
	(process initial description
		 (and (establish (personality pig-two))
		      (establish (personality pig-three))
		      (convey (accompanys pig-one pig-two))
		      (convey (accompanys pig-one pig-three))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define wolf-kept-out scene
	(process initial description
		 (sequence: (convey (prevents pig-one (meets wolf pig-one)))
			    (and (convey (undoes pig-one
						 (from-scene the-wolf-chases
							     (convey (chases wolf pig-one))))
				 (establish (emotional-state wolf (joy (negative high))))
				 (establish (emotional-state pig-one
							     (and (joy (positive high))
								  (pride (positive high))))))))
	(set your mood to joyous)
	(set your rhythm to slow)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define three-little-pigs-film film
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
      (pig-one the-wolf-chases pigs-stay-together wolf-kept-out
               (relationship-of wolf pig-one)
               (relationship-of pig-one pig-two))))

(compile-actors)
```
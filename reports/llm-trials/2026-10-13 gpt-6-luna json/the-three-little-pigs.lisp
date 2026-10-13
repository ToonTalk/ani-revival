;; -*-lisp-*-
;; cast: pig-one = the first pig (they); pig-two = the second pig (they); pig-three = the third pig (they); wolf = the wolf (he)
;; scenes: friends-and-wolf = Friends and the Wolf; the-chase = The Chase; the-wolf-is-kept-out = The Wolf Is Kept Out; the-pigs-triumph = The Pigs' Triumph

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define pig-one character
	(process initial description
		 (physical physically-weak)
		 (personality (and friendly good))
		 (role-in-story most-important)))

(define pig-two character
	(process initial description
		 (physical physically-weak)
		 (personality (and friendly good))))

(define (relationship-of pig-one pig-two) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of pig-two pig-one) relationship
	(process initial description
		 is-helpful-towards))

(define pig-three character
	(process initial description
		 (physical physically-weak)
		 (personality (and friendly good))))

(define (relationship-of pig-one pig-three) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of pig-three pig-one) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of pig-two pig-three) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of pig-three pig-two) relationship
	(process initial description
		 is-helpful-towards))

(define wolf character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean bad evil))))

(define (relationship-of wolf pig-one) relationship
	(process initial description
		 hates))

(define (relationship-of pig-one wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of pig-two wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of pig-three wolf) relationship
	(process initial description
		 is-intolerant-of))

(define friends-and-wolf scene
	(process initial description
		 (sequence: (and (establish (personality pig-one))
		                 (establish (personality pig-two))
		                 (establish (personality pig-three))
		                 (establish (personality wolf)))
		            (and (establish (relationship (relationship-of pig-one pig-two)))
		                 (establish (relationship (relationship-of pig-two pig-one)))
		                 (establish (relationship (relationship-of wolf pig-one)))
		                 (establish (relationship (relationship-of pig-one wolf))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define the-chase scene
	(process initial description
		 (sequence: (and (convey (chases wolf pig-one))
		                 (convey (accompanys pig-one pig-two))
		                 (convey (accompanys pig-two pig-three)))
		            (and (establish (emotional-state pig-one (joy (negative high))))
		                 (establish (emotional-state wolf (joy (positive medium)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define the-wolf-is-kept-out scene
	(process initial description
		 (sequence: (and (convey (prevents pig-one (meets wolf pig-one)))
		                 (convey (accompanys pig-one pig-two))
		                 (convey (accompanys pig-two pig-three)))
		            (and (establish (emotional-state wolf (joy (negative high))))
		                 (establish (emotional-state pig-one (joy (positive medium)))))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define the-pigs-triumph scene
	(process initial description
		 (and (establish (emotional-state pig-one (and (joy (positive high)) (pride (positive high)))))
		      (establish (emotional-state pig-two (and (joy (positive high)) (pride (positive high)))))
		      (establish (emotional-state pig-three (and (joy (positive high)) (pride (positive high)))))
		      (establish (emotional-state wolf (joy (negative high))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define three-little-pigs-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
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
      (pig-one the-chase the-wolf-is-kept-out the-pigs-triumph
        (relationship-of pig-one pig-two)
        (relationship-of wolf pig-one))))

(compile-actors)

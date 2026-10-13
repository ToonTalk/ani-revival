```lisp
;; -*-lisp-*-
;; cast: first-pig = the first little pig (they); second-pig = the second little pig (they); third-pig = the third little pig (they); wolf = the wolf (he)
;; scenes: friends-together = Friends Together; the-wolf-chases = The Wolf Chases; keeping-the-wolf-out = Keeping the Wolf Out; the-wolf-rebuffed = The Wolf Rebuffed; happy-together = Happy Together

(include |ai:ken;declar >|)

(defcomment cindy)

(define first-pig character
	(process initial description
		 (physical pretty)
		 (personality (and good friendly determined))
		 (role-in-story most-important)))

(define second-pig character
	(process initial description
		 (physical pretty)
		 (personality (and good friendly determined))))

(define third-pig character
	(process initial description
		 (physical pretty)
		 (personality (and good friendly determined))))

(define wolf character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean stubborn))))

(define (relationship-of first-pig second-pig) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define (relationship-of second-pig first-pig) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define (relationship-of first-pig third-pig) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define (relationship-of third-pig first-pig) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define (relationship-of second-pig third-pig) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define (relationship-of third-pig second-pig) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define (relationship-of wolf first-pig) relationship
	(process initial description
		 hates))

(define (relationship-of wolf second-pig) relationship
	(process initial description
		 hates))

(define (relationship-of wolf third-pig) relationship
	(process initial description
		 hates))

(define (relationship-of first-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of second-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of third-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define friends-together scene
	(process initial description
		 (sequence:
		  (establish (personality first-pig))
		  (establish (relationship (relationship-of first-pig second-pig)))
		  (convey (accompanys third-pig first-pig))
		  (establish (emotional-state first-pig (joy (positive medium))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define the-wolf-chases scene
	(process initial description
		 (sequence:
		  (establish (personality wolf))
		  (convey (chases wolf first-pig))
		  (and (convey (accompanys second-pig first-pig))
		       (convey (accompanys third-pig first-pig)))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define keeping-the-wolf-out scene
	(process initial description
		 (sequence:
		  (convey (prevents second-pig (meets wolf first-pig)))
		  (convey (undoes third-pig
				 (from-scene the-wolf-chases
					     (convey (chases wolf first-pig)))))
		  (convey (accompanys second-pig third-pig))
		  (establish (emotional-state first-pig (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define the-wolf-rebuffed scene
	(process initial description
		 (and (establish (emotional-state wolf (joy (negative high))))
		      (establish (emotional-state first-pig (pride (positive high))))
		      (establish (emotional-state second-pig (pride (positive high))))
		      (establish (emotional-state third-pig (pride (positive high))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to short))

(define happy-together scene
	(process initial description
		 (sequence:
		  (convey (accompanys first-pig second-pig))
		  (and (establish (emotional-state first-pig (joy (positive high))))
		       (establish (emotional-state second-pig (joy (positive high))))
		       (establish (emotional-state third-pig (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

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
	(set your order-of-character+element-type+element to
	     (characters element-types elements))
	(set your parts-of-the-focus to
	     (first-pig the-wolf-chases keeping-the-wolf-out happy-together
			(relationship-of wolf first-pig)
			(relationship-of first-pig second-pig)
			(relationship-of first-pig third-pig)
			(relationship-of second-pig third-pig))))

(compile-actors)
```
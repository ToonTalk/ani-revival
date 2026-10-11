```lisp
;; -*-lisp-*-
;; cast: first-pig = the first little pig (they); second-pig = the second little pig (they); third-pig = the third little pig (they); wolf = the wolf (he)
;; scenes: introduction = Introduction; friends-together = Friends Together; wolf-chases = The Wolf Chases; wolf-kept-out = The Wolf Is Kept Out; happy-together = Happy Together

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
		 (personality (and good friendly kind))))

(define third-pig character
	(process initial description
		 (physical pretty)
		 (personality (and good friendly strong))))

(define wolf character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean evil stubborn))))

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

(define (relationship-of first-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of wolf second-pig) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of second-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of wolf third-pig) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of third-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality first-pig))
		       (establish (personality wolf))
		       (establish (relationship (relationship-of wolf first-pig))))
		  (establish (emotional-state first-pig (joy (positive medium))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define friends-together scene
	(process initial description
		 (sequence:
		  (and (establish (personality second-pig))
		       (establish (personality third-pig)))
		  (and (convey (accompanys second-pig first-pig))
		       (convey (accompanys third-pig first-pig)))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define wolf-chases scene
	(process initial description
		 (sequence:
		  (and (convey (chases wolf first-pig))
		       (convey (chases wolf second-pig))
		       (convey (chases wolf third-pig)))
		  (establish (emotional-state first-pig (joy (negative medium))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define wolf-kept-out scene
	(process initial description
		 (sequence:
		  (and (convey (prevents first-pig (meets wolf second-pig)))
		       (convey (prevents second-pig (meets wolf third-pig)))
		       (convey (prevents third-pig (meets wolf first-pig))))
		  (establish (emotional-state wolf (joy (negative high))))))
	(set your mood to hopeful)
	(set your rhythm to (changes fast slow))
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
	(set your level of originality to low)
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
	     (first-pig friends-together wolf-chases wolf-kept-out happy-together
			(relationship-of wolf first-pig)
			(relationship-of first-pig second-pig)
			(relationship-of first-pig third-pig)
			(relationship-of second-pig third-pig))))

(compile-actors)
```
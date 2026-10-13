;; -*-lisp-*-
;; cast: first-pig = the first little pig (they); second-pig = the second little pig (they); third-pig = the third little pig (they); wolf = the wolf (he)
;; scenes: friends = Friends; the-chase = The Chase; keeping-together = Keeping Together; happy-together = Happy Together; proud-pigs = The Proud Pigs

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define first-pig character
	(process initial description
		 (physical (and pretty physically-weak))
		 (personality (and friendly good determined))
		 (role-in-story most-important)))

(define second-pig character
	(process initial description
		 (physical (and pretty physically-weak))
		 (personality (and friendly good kind))))

(define third-pig character
	(process initial description
		 (physical (and pretty physically-weak))
		 (personality (and friendly good determined))))

(define wolf character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean stubborn))))

(define (relationship-of first-pig second-pig) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of second-pig first-pig) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of first-pig third-pig) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of third-pig first-pig) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of second-pig third-pig) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of third-pig second-pig) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of wolf first-pig) relationship
	(process initial description
		 hates))

(define (relationship-of first-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define friends scene
	(process initial description
		 (and (establish (personality first-pig))
		      (establish (personality second-pig))
		      (establish (personality third-pig))
		      (establish (relationship
				  (relationship-of first-pig second-pig)))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define the-chase scene
	(process initial description
		 (sequence:
		  (establish (personality wolf))
		  (convey (chases wolf second-pig))
		  (convey (chases wolf third-pig))
		  (establish (emotional-state first-pig
					      (joy (negative medium))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to fast)
	(set your length to short))

(define keeping-together scene
	(process initial description
		 (sequence:
		  (and (convey (accompanys first-pig second-pig))
		       (convey (accompanys third-pig first-pig)))
		  (convey (prevents first-pig (meets wolf third-pig)))
		  (establish (emotional-state wolf
					      (joy (negative high))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define happy-together scene
	(process initial description
		 (sequence:
		  (convey (accompanys second-pig third-pig))
		  (and (establish (emotional-state first-pig
						   (joy (positive high))))
		       (establish (emotional-state second-pig
						   (joy (positive high))))
		       (establish (emotional-state third-pig
						   (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define proud-pigs scene
	(process initial description
		 (sequence:
		  (convey (prevents third-pig (meets wolf first-pig)))
		  (and (establish (emotional-state first-pig
						   (pride (positive high))))
		       (establish (emotional-state second-pig
						   (pride (positive high))))
		       (establish (emotional-state third-pig
						   (pride (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to short))

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
	     (first-pig the-chase keeping-together proud-pigs
			(relationship-of first-pig second-pig)
			(relationship-of first-pig third-pig)
			(relationship-of wolf first-pig)
			(relationship-of first-pig wolf))))

(compile-actors)

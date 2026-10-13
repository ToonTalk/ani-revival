;; -*-lisp-*-
;; cast: first-pig = the first little pig (they); second-pig = the second little pig (they); third-pig = the third little pig (they); wolf = the wolf (he)
;; scenes: friends-and-wolf = The Friends and the Wolf; the-chase = The Chase; keeping-the-wolf-out = Keeping the Wolf Out; happy-together = Happy Together

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
		 (personality (and friendly good determined))))

(define (relationship-of first-pig second-pig) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define (relationship-of second-pig first-pig) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define third-pig character
	(process initial description
		 (physical (and pretty physically-weak))
		 (personality (and friendly good determined))))

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

(define wolf character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality (and mean selfish stubborn))))

(define (relationship-of wolf first-pig) relationship
	(process initial description
		 hates))

(define (relationship-of wolf second-pig) relationship
	(process initial description
		 hates))

(define (relationship-of wolf third-pig) relationship
	(process initial description
		 hates))

(define friends-and-wolf scene
	(process initial description
		 (sequence: (and (establish (personality first-pig))
		                 (establish (relationship (relationship-of first-pig second-pig))))
		            (establish (personality wolf))
		            (establish (emotional-state first-pig (joy (negative low))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to normal)
	(set your length to short))

(define the-chase scene
	(process initial description
		 (sequence: (and (convey (chases wolf first-pig))
		                 (convey (accompanys second-pig first-pig))
		                 (convey (accompanys third-pig first-pig)))
		            (establish (emotional-state first-pig (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define keeping-the-wolf-out scene
	(process initial description
		 (sequence: (and (convey (prevents first-pig (meets wolf second-pig)))
		                 (convey (prevents second-pig (meets wolf third-pig))))
		            (convey (pushes third-pig wolf))
		            (establish (emotional-state wolf (and (joy (negative high)) (pride (negative high)))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define happy-together scene
	(process initial description
		 (sequence: (convey (accompanys second-pig third-pig))
		            (and (establish (emotional-state first-pig (and (joy (positive high)) (pride (positive high)))))
		                 (establish (emotional-state second-pig (and (joy (positive high)) (pride (positive high)))))
		                 (establish (emotional-state third-pig (and (joy (positive high)) (pride (positive high))))))))
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
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (first-pig keeping-the-wolf-out happy-together
        (relationship-of first-pig second-pig)
        (relationship-of first-pig third-pig)
        (relationship-of wolf first-pig))))

(compile-actors)

```lisp
;; -*-lisp-*-
;; cast: goldilocks = Goldilocks (she); father-bear = the father bear (he); mother-bear = the mother bear (she); baby-bear = the baby bear (he)
;; scenes: introduction = Introduction; bears-return = The Bears Return; chased-away = Chased Away

(include |ai:ken;declar >|)

(defcomment cindy)

(define goldilocks character
	(process initial description
		 (physical pretty)
		 (personality (and brazen forward))
		 (role-in-story most-important)))

(define father-bear character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality strong)))

(define mother-bear character
	(process initial description
		 (physical physically-strong)
		 (personality kind)))

(define baby-bear character
	(process initial description
		 (physical physically-weak)
		 (personality shy)))

(define (relationship-of goldilocks father-bear) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of father-bear goldilocks) relationship
	(process initial description
		 is-intolerant-of))

(define introduction scene
	(process initial description
		 (and (establish (personality goldilocks))
		      (establish (personality father-bear))
		      (establish (personality baby-bear))
		      (establish (relationship (relationship-of goldilocks father-bear)))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define bears-return scene
	(process initial description
		 (sequence:
		  (establish (personality mother-bear))
		  (convey (accompanys mother-bear baby-bear))
		  (convey (meets mother-bear goldilocks))
		  (convey (meets father-bear goldilocks))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to medium))

(define chased-away scene
	(process initial description
		 (sequence:
		  (establish (emotional-state father-bear (joy (negative high))))
		  (convey (chases father-bear goldilocks))
		  (and (establish (emotional-state goldilocks (joy (negative high))))
		       (establish (emotional-state baby-bear (joy (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read)))

(define goldilocks-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
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
	     (goldilocks introduction bears-return chased-away
			(relationship-of goldilocks father-bear)
			(relationship-of father-bear goldilocks))))

(compile-actors)
```
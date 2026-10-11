```lisp
;; -*-lisp-*-
;; cast: goldilocks = Goldilocks (she); father-bear = the father bear (he); mother-bear = the mother bear (she); baby-bear = the baby bear (he)
;; scenes: introduction = Introduction; bears-return = The Bears Return; chased-away = Chased Away

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goldilocks character
	(process initial description
		 (physical pretty)
		 (personality (and brazen forward unfriendly))
		 (role-in-story most-important)))

(define father-bear character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality (and strong stubborn))))

(define mother-bear character
	(process initial description
		 (physical beautiful)
		 (personality (and kind friendly))))

(define baby-bear character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy good))))

(define (relationship-of goldilocks father-bear) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of father-bear goldilocks) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of goldilocks mother-bear) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of mother-bear goldilocks) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of goldilocks baby-bear) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of baby-bear goldilocks) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of father-bear mother-bear) relationship
	(process initial description
		 loves))

(define (relationship-of mother-bear father-bear) relationship
	(process initial description
		 loves))

(define (relationship-of father-bear baby-bear) relationship
	(process initial description
		 (and loves is-protective-to)))

(define (relationship-of baby-bear father-bear) relationship
	(process initial description
		 (and loves is-obedient-to)))

(define (relationship-of mother-bear baby-bear) relationship
	(process initial description
		 (and loves is-protective-to)))

(define (relationship-of baby-bear mother-bear) relationship
	(process initial description
		 (and loves is-obedient-to)))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality goldilocks))
		       (establish (personality father-bear))
		       (establish (relationship (relationship-of goldilocks father-bear))))
		  (establish (emotional-state goldilocks (joy (positive low))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define bears-return scene
	(process initial description
		 (sequence:
		  (and (establish (personality mother-bear))
		       (establish (personality baby-bear)))
		  (convey (meets father-bear goldilocks))
		  (establish (emotional-state baby-bear (joy (negative medium))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to (changes fast slow))
	(set your length to medium))

(define chased-away scene
	(process initial description
		 (sequence:
		  (establish (emotional-state father-bear (joy (negative high))))
		  (convey (chases father-bear goldilocks))
		  (and (establish (emotional-state goldilocks (joy (negative high))))
		       (establish (emotional-state baby-bear (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define goldilocks-film film
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
	     (goldilocks bears-return chased-away
			(relationship-of goldilocks father-bear)
			(relationship-of father-bear goldilocks)
			(relationship-of goldilocks baby-bear))))

(compile-actors)
```
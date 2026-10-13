;; -*-lisp-*-
;; cast: goldilocks = Goldilocks (she); father-bear = the father bear (he); mother-bear = the mother bear (she); baby-bear = the baby bear (they)
;; scenes: the-bears-find-goldilocks = The Bears Find Goldilocks; the-father-chases-goldilocks = The Father Chases Goldilocks

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goldilocks character
	(process initial description
		 (physical pretty)
		 (personality (and brazen forward))
		 (role-in-story most-important)))

(define father-bear character
	(process initial description
		 (physical physically-strong)
		 (personality strong)))

(define mother-bear character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))))

(define baby-bear character
	(process initial description
		 (physical physically-weak)
		 (personality (and good shy))))

(define (relationship-of father-bear goldilocks) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of goldilocks father-bear) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of goldilocks mother-bear) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of goldilocks baby-bear) relationship
	(process initial description
		 is-impolite-to))

(define the-bears-find-goldilocks scene
	(process initial description
		 (and (and (establish (personality goldilocks))
			   (establish (personality father-bear))
			   (establish (personality mother-bear))
			   (establish (personality baby-bear)))
		      (and (establish (relationship (relationship-of father-bear goldilocks)))
			   (establish (relationship (relationship-of goldilocks father-bear))))
		      (and (convey (meets father-bear goldilocks))
			   (convey (meets mother-bear goldilocks))
			   (convey (meets baby-bear goldilocks)))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to medium))

(define the-father-chases-goldilocks scene
	(process initial description
		 (sequence: (convey (chases father-bear goldilocks))
			    (and (establish (emotional-state father-bear (joy (negative high))))
				 (establish (emotional-state goldilocks (joy (negative high))))
				 (establish (emotional-state baby-bear (joy (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read)))

(define goldilocks-film film
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
      (goldilocks the-bears-find-goldilocks the-father-chases-goldilocks
		  (relationship-of father-bear goldilocks)
		  (relationship-of goldilocks father-bear))))

(compile-actors)

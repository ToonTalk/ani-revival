;; -*-lisp-*-
;; cast: goldilocks = Goldilocks (she); father-bear = the father bear (he); mother-bear = the mother bear (she); baby-bear = the baby bear (he)
;; scenes: discovery = Goldilocks Is Found; the-bears-arrive = The Bears Come Home; chased-away = The Father Bear Chases Goldilocks

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goldilocks character
	(process initial description
		 (physical pretty)
		 (personality (and determined unfriendly))
		 (role-in-story most-important)))

(define father-bear character
	(process initial description
		 (physical physically-strong)
		 (personality (and strong mean))))

(define (relationship-of father-bear goldilocks) relationship
	(process initial description
		 hates))

(define (relationship-of goldilocks father-bear) relationship
	(process initial description
		 is-impolite-to))

(define mother-bear character
	(process initial description
		 (physical pretty)
		 (personality kind)))

(define baby-bear character
	(process initial description
		 (physical physically-weak)
		 (personality shy)))

(define discovery scene
	(process initial description
		 (and (establish (personality goldilocks))
		      (establish (relationship (relationship-of father-bear goldilocks)))
		      (establish (relationship (relationship-of goldilocks father-bear)))
		      (convey (meets father-bear goldilocks))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to medium))

(define the-bears-arrive scene
	(process initial description
		 (and (establish (personality mother-bear))
		      (establish (personality baby-bear))
		      (convey (meets mother-bear goldilocks))
		      (convey (meets baby-bear goldilocks))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to medium))

(define chased-away scene
	(process initial description
		 (sequence: (and (establish (personality father-bear))
		                 (convey (chases father-bear goldilocks)))
		            (and (establish (emotional-state baby-bear (joy (negative high))))
		                 (establish (emotional-state goldilocks (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

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
      (goldilocks chased-away the-bears-arrive
        (relationship-of goldilocks father-bear)
        (relationship-of father-bear goldilocks))))

(compile-actors)

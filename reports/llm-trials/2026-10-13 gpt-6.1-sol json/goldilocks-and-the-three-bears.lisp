;; -*-lisp-*-
;; cast: goldilocks = Goldilocks (she); father-bear = the father bear (he); mother-bear = the mother bear (she); baby-bear = the baby bear (he)
;; scenes: introduction = Goldilocks and the Father Bear; bears-find-goldilocks = The Bears Find Goldilocks; chased-away = Goldilocks Is Chased Away

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goldilocks character
	(process initial description
		 (physical pretty)
		 (personality (and brazen forward selfish))
		 (role-in-story most-important)))

(define father-bear character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality (and strong determined))))

(define (relationship-of goldilocks father-bear) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of father-bear goldilocks) relationship
	(process initial description
		 is-intolerant-of))

(define mother-bear character
	(process initial description
		 (physical physically-strong)
		 (personality (and kind friendly))))

(define baby-bear character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy good))))

(define (relationship-of mother-bear baby-bear) relationship
	(process initial description
		 is-protective-to))

(define (relationship-of baby-bear mother-bear) relationship
	(process initial description
		 loves))

(define introduction scene
	(process initial description
		 (sequence: (and (establish (personality goldilocks))
		                 (establish (personality father-bear)))
		            (establish (relationship (relationship-of goldilocks father-bear)))
		            (establish (emotional-state goldilocks (joy (positive low))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define bears-find-goldilocks scene
	(process initial description
		 (sequence: (and (establish (personality mother-bear))
		                 (establish (personality baby-bear)))
		            (convey (accompanys mother-bear baby-bear))
		            (convey (meets father-bear goldilocks))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to medium))

(define chased-away scene
	(process initial description
		 (sequence: (convey (chases father-bear goldilocks))
		            (and (establish (emotional-state father-bear (joy (negative medium))))
		                 (establish (emotional-state baby-bear (joy (negative high))))
		                 (establish (emotional-state goldilocks (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
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
      (goldilocks bears-find-goldilocks chased-away
        (relationship-of goldilocks father-bear)
        (relationship-of father-bear goldilocks))))

(compile-actors)

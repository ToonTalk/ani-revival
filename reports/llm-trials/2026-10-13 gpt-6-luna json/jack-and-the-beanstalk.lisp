;; -*-lisp-*-
;; cast: jack = Jack (he); mother = his mother (she); giant = the giant (he)
;; scenes: home = Jack and His Mother; chase = The Giant Chases Jack; escape-and-reunion = Jack Gets Away

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define jack character
	(process initial description
		 (physical shabby)
		 (personality (and good strong determined))
		 (role-in-story most-important)))

(define mother character
	(process initial description
		 (physical shabby)
		 (personality (and kind friendly))))

(define (relationship-of jack mother) relationship
	(process initial description
		 loves))

(define (relationship-of mother jack) relationship
	(process initial description
		 loves))

(define giant character
	(process initial description
		 (physical (and physically-strong powerful ugly))
		 (personality (and mean evil strong))))

(define (relationship-of giant jack) relationship
	(process initial description
		 hates))

(define home scene
	(process initial description
		 (sequence: (and (establish (personality jack))
		                 (establish (personality mother))
		                 (establish (relationship (relationship-of jack mother)))
		                 (establish (relationship (relationship-of mother jack))))
		            (and (establish (emotional-state jack (joy (positive low))))
		                 (establish (emotional-state mother (joy (positive low)))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define chase scene
	(process initial description
		 (and (establish (personality giant))
		      (convey (chases giant jack))
		      (establish (emotional-state jack (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define escape-and-reunion scene
	(process initial description
		 (sequence: (and (convey (undoes jack (from-scene chase (convey (chases giant jack)))))
		                 (convey (accompanys jack mother)))
		            (and (establish (emotional-state jack (joy (positive high))))
		                 (establish (emotional-state mother (joy (positive high))))
		                 (establish (emotional-state giant (joy (negative high)))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define jack-and-the-giant-film film
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
      (jack chase escape-and-reunion (relationship-of jack giant)
        (relationship-of jack mother))))

(compile-actors)

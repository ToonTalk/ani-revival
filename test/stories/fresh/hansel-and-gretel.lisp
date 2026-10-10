;; -*-lisp-*-
;; cast: hansel = Hansel (he); gretel = Gretel (she); witch = the witch (she); step-mother = the stepmother (she)
;; scenes: into-the-forest = Into the Forest; the-gingerbread-house = The Gingerbread House; the-cage = The Cage; the-escape = The Escape; home-again = Home Again

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define gretel character
	(process initial description
		 (physical pretty)
		 (personality (and good determined kind))
		 (role-in-story most-important)))

(define hansel character
	(process initial description
		 (physical shabby)
		 (personality (and good friendly))))

(define witch character
	(process initial description
		 (physical (and ugly magical))
		 (personality (and evil mean selfish))))

(define step-mother character
	(process initial description
		 (physical elegant)
		 (personality (and selfish bad))))

(define (relationship-of hansel gretel) relationship
	(process initial description
		 loves))

(define (relationship-of gretel hansel) relationship
	(process initial description
		 (and loves is-protective-to)))

(define (relationship-of witch hansel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of hansel witch) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of witch gretel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of gretel witch) relationship
	(process initial description
		 (and is-intolerant-of fears)))

(define (relationship-of step-mother hansel) relationship
	(process initial description
		 (and dominates is-intolerant-of)))

(define (relationship-of hansel step-mother) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of step-mother gretel) relationship
	(process initial description
		 (and dominates is-intolerant-of)))

(define (relationship-of gretel step-mother) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of witch step-mother) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of step-mother witch) relationship
	(process initial description
		 is-polite-to))

(define into-the-forest scene
	(process initial description
		 (sequence: (and (establish (personality step-mother))
				 (establish (relationship (relationship-of step-mother hansel))))
			    (convey (alone step-mother hansel))
			    (establish (emotional-state gretel (joy (negative medium))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define the-gingerbread-house scene
	(process initial description
		 (sequence: (convey (accompanys hansel gretel))
			    (establish (personality witch))
			    (convey (wants witch (meets witch hansel)))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to normal)
	(set your length to medium))

(define the-cage scene
	(process initial description
		 (sequence: (convey (prevents witch (meets hansel gretel)))
			    (establish (emotional-state gretel (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(define the-escape scene
	(process initial description
		 (sequence: (convey (pushes gretel witch))
			    (convey (undoes gretel
					    (from-scene the-cage
							(convey (prevents witch (meets hansel gretel))))))))
	(set your mood to (and joyous anticipatory))
	(set your rhythm to fast)
	(set your length to short))

(define home-again scene
	(process initial description
		 (sequence: (convey (getting-it-on hansel gretel))
			    (and (establish (emotional-state hansel (joy (positive high))))
				 (establish (emotional-state gretel (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define hansel-and-gretel-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 2) (minutes 4)))
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
      (gretel the-escape the-cage
              (relationship-of witch gretel)
              (relationship-of gretel hansel))))

(compile-actors)

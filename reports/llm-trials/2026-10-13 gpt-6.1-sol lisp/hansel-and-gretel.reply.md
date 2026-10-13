```lisp
;; -*-lisp-*-
;; cast: hansel = Hansel (he); gretel = Gretel (she); stepmother = the stepmother (she); witch = the witch (she)
;; scenes: family-love = Family Love; driven-away = Driven Away; held-apart = Held Apart; witch-defeated = The Witch Defeated; home-together = Home Together

(include |ai:ken;declar >|)

(defcomment cindy)

(define hansel character
	(process initial description
		 (physical pretty)
		 (personality (and kind friendly))))

(define gretel character
	(process initial description
		 (physical pretty)
		 (personality (and kind strong determined))
		 (role-in-story most-important)))

(define stepmother character
	(process initial description
		 (physical ugly)
		 (personality (and mean selfish))))

(define witch character
	(process initial description
		 (physical (and ugly magical))
		 (personality (and evil mean))))

(define (relationship-of hansel gretel) relationship
	(process initial description
		 loves))

(define (relationship-of gretel hansel) relationship
	(process initial description
		 loves))

(define (relationship-of stepmother hansel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of hansel stepmother) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of stepmother gretel) relationship
	(process initial description
		 dominates))

(define (relationship-of gretel stepmother) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of witch gretel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of gretel witch) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of witch hansel) relationship
	(process initial description
		 dominates))

(define (relationship-of hansel witch) relationship
	(process initial description
		 is-intolerant-of))

(define family-love scene
	(process initial description
		 (sequence:
		  (and (establish (personality gretel))
		       (establish (personality hansel)))
		  (and (establish (relationship (relationship-of gretel hansel)))
		       (establish (relationship (relationship-of hansel gretel))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define driven-away scene
	(process initial description
		 (sequence:
		  (convey (chases stepmother hansel))
		  (convey (accompanys gretel hansel))
		  (and (establish (emotional-state hansel (joy (negative medium))))
		       (establish (emotional-state gretel (joy (negative medium)))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to (changes fast slow))
	(set your length to short))

(define held-apart scene
	(process initial description
		 (sequence:
		  (establish (personality witch))
		  (convey (prevents witch (meets gretel hansel)))
		  (and (establish (emotional-state gretel (joy (negative high))))
		       (establish (emotional-state hansel (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(define witch-defeated scene
	(process initial description
		 (sequence:
		  (convey (pushes gretel witch))
		  (convey (undoes gretel
				 (from-scene held-apart
					     (convey (prevents witch
							       (meets gretel hansel))))))
		  (and (establish (emotional-state witch (pride (negative high))))
		       (establish (emotional-state gretel (joy (positive high)))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define home-together scene
	(process initial description
		 (sequence:
		  (convey (meets gretel hansel))
		  (convey (accompanys gretel hansel))
		  (and (establish (emotional-state gretel (joy (positive high))))
		       (establish (emotional-state hansel (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read)))

(define hansel-and-gretel-film film
	(set your level of variety to medium)
	(set your level of complexity to medium)
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
	     (gretel held-apart witch-defeated home-together
		     (relationship-of gretel hansel)
		     (relationship-of hansel gretel)
		     (relationship-of witch gretel)
		     (relationship-of stepmother hansel))))

(compile-actors)
```
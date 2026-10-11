```lisp
;; -*-lisp-*-
;; cast: hansel = Hansel (he); gretel = Gretel (she); step-mother = the stepmother (she); witch = the witch (she)
;; scenes: introduction = Introduction; driven-away = Driven Away; kept-apart = Kept Apart; breaking-free = Breaking Free; home-together = Home Together

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hansel character
	(process initial description
		 (physical pretty)
		 (personality (and kind friendly good))))

(define gretel character
	(process initial description
		 (physical pretty)
		 (personality (and kind good strong determined))
		 (role-in-story most-important)))

(define step-mother character
	(process initial description
		 (physical ugly)
		 (personality (and mean selfish evil))))

(define witch character
	(process initial description
		 (physical (and ugly magical powerful))
		 (personality (and evil mean strong))))

(define (relationship-of hansel gretel) relationship
	(process initial description
		 loves))

(define (relationship-of gretel hansel) relationship
	(process initial description
		 loves))

(define (relationship-of step-mother hansel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of hansel step-mother) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of step-mother gretel) relationship
	(process initial description
		 dominates))

(define (relationship-of gretel step-mother) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of witch hansel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of hansel witch) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of witch gretel) relationship
	(process initial description
		 dominates))

(define (relationship-of gretel witch) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of step-mother witch) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of witch step-mother) relationship
	(process initial description
		 is-polite-to))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality gretel))
		       (establish (personality hansel))
		       (establish (relationship (relationship-of gretel hansel))))
		  (establish (emotional-state gretel (joy (positive medium))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define driven-away scene
	(process initial description
		 (sequence:
		  (convey (chases step-mother hansel))
		  (convey (accompanys gretel hansel))
		  (and (establish (emotional-state hansel (joy (negative medium))))
		       (establish (emotional-state gretel (joy (negative medium)))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to fast)
	(set your length to short))

(define kept-apart scene
	(process initial description
		 (sequence:
		  (convey (chases witch hansel))
		  (convey (prevents witch (meets gretel hansel)))
		  (and (establish (emotional-state hansel (joy (negative high))))
		       (establish (emotional-state gretel (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(define breaking-free scene
	(process initial description
		 (sequence:
		  (convey (pushes gretel witch))
		  (convey (undoes gretel
				 (from-scene kept-apart
					     (convey (prevents witch
							       (meets gretel hansel))))))
		  (and (establish (emotional-state witch (joy (negative high))))
		       (establish (emotional-state gretel (joy (positive medium)))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define home-together scene
	(process initial description
		 (sequence:
		  (convey (accompanys hansel gretel))
		  (establish (relationship (relationship-of hansel gretel)))
		  (and (establish (emotional-state hansel (joy (positive high))))
		       (establish (emotional-state gretel (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define hansel-and-gretel-film film
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
	     (gretel kept-apart breaking-free home-together
		     (relationship-of gretel hansel)
		     (relationship-of hansel gretel)
		     (relationship-of witch hansel)
		     (relationship-of gretel witch))))

(compile-actors)
```
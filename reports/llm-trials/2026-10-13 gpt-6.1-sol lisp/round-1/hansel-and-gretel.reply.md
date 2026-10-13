```lisp
;; -*-lisp-*-
;; cast: gretel = Gretel (she); hansel = Hansel (he); stepmother = the stepmother (she); witch = the witch (she)
;; scenes: introduction = Introduction; sent-away = Sent Away; kept-apart = Kept Apart; witch-defeated = The Witch Defeated; home-together = Home Together

(include |ai:ken;declar >|)

(defcomment cindy)

(define gretel character
	(process initial description
		 (physical physically-weak)
		 (personality (and kind strong determined))
		 (role-in-story most-important)))

(define hansel character
	(process initial description
		 (physical physically-weak)
		 (personality (and kind friendly))))

(define stepmother character
	(process initial description
		 (physical powerful)
		 (personality (and mean selfish))))

(define witch character
	(process initial description
		 (physical (and ugly magical powerful))
		 (personality (and evil mean))))

(define (relationship-of gretel hansel) relationship
	(process initial description
		 loves))

(define (relationship-of hansel gretel) relationship
	(process initial description
		 loves))

(define (relationship-of stepmother gretel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of gretel stepmother) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of witch gretel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of gretel witch) relationship
	(process initial description
		 is-intolerant-of))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality gretel))
		       (establish (personality hansel)))
		  (and (establish (relationship (relationship-of gretel hansel)))
		       (establish (relationship (relationship-of hansel gretel))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define sent-away scene
	(process initial description
		 (sequence:
		  (establish (personality stepmother))
		  (convey (accompanys gretel hansel))
		  (and (establish (emotional-state gretel (joy (negative medium))))
		       (establish (emotional-state hansel (joy (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(define kept-apart scene
	(process initial description
		 (sequence:
		  (establish (personality witch))
		  (convey (prevents witch (meets gretel hansel)))
		  (and (establish (emotional-state gretel (joy (negative high))))
		       (establish (emotional-state hansel (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to short))

(define witch-defeated scene
	(process initial description
		 (sequence:
		  (convey (pushes gretel witch))
		  (convey (undoes gretel
				  (from-scene kept-apart
					      (convey (prevents witch (meets gretel hansel))))))
		  (and (establish (emotional-state witch (pride (negative high))))
		       (establish (emotional-state gretel (joy (positive medium)))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define home-together scene
	(process initial description
		 (sequence:
		  (establish (personality gretel))
		  (convey (accompanys gretel hansel))
		  (and (establish (emotional-state gretel (joy (positive high))))
		       (establish (emotional-state hansel (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read)))

(define hansel-and-gretel-film film
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
	     (gretel kept-apart witch-defeated home-together
		     (relationship-of gretel hansel)
		     (relationship-of hansel gretel)
		     (relationship-of stepmother gretel)
		     (relationship-of witch gretel))))

(compile-actors)
```
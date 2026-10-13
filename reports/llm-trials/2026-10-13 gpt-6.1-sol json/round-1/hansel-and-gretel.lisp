;; -*-lisp-*-
;; cast: gretel = Gretel (she); hansel = Hansel (he); step-mother = the stepmother (she); witch = the witch (she)
;; scenes: loving-siblings = A Kind Brother and Sister; sent-away = Sent Away Together; kept-apart = The Witch Keeps Them Apart; gretel-rescues-hansel = Gretel Pushes the Witch Away; home-together = Home Together

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define gretel character
	(process initial description
		 (physical physically-weak)
		 (personality (and kind good strong determined))
		 (role-in-story most-important)))

(define hansel character
	(process initial description
		 (physical physically-weak)
		 (personality (and kind good friendly))))

(define (relationship-of gretel hansel) relationship
	(process initial description
		 (and loves is-protective-to)))

(define (relationship-of hansel gretel) relationship
	(process initial description
		 loves))

(define step-mother character
	(process initial description
		 (physical powerful)
		 (personality (and mean selfish))))

(define (relationship-of step-mother gretel) relationship
	(process initial description
		 (and hates dominates)))

(define (relationship-of step-mother hansel) relationship
	(process initial description
		 dominates))

(define witch character
	(process initial description
		 (physical (and magical powerful))
		 (personality (and evil mean))))

(define (relationship-of witch hansel) relationship
	(process initial description
		 (and hates dominates)))

(define (relationship-of witch gretel) relationship
	(process initial description
		 dominates))

(define loving-siblings scene
	(process initial description
		 (sequence: (and (establish (personality gretel))
		                 (establish (personality hansel)))
		            (establish (relationship (relationship-of gretel hansel)))
		            (establish (emotional-state gretel (joy (positive medium))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define sent-away scene
	(process initial description
		 (sequence: (establish (personality step-mother))
		            (convey (accompanys gretel hansel))
		            (and (establish (emotional-state gretel (joy (negative medium))))
		                 (establish (emotional-state hansel (joy (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to short))

(define kept-apart scene
	(process initial description
		 (sequence: (establish (personality witch))
		            (convey (prevents witch (meets gretel hansel)))
		            (and (establish (emotional-state gretel (joy (negative high))))
		                 (establish (emotional-state hansel (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define gretel-rescues-hansel scene
	(process initial description
		 (sequence: (convey (pushes gretel witch))
		            (convey (undoes gretel (from-scene kept-apart (convey (prevents witch (meets gretel hansel))))))
		            (and (establish (emotional-state witch (pride (negative high))))
		                 (establish (emotional-state gretel (and (joy (positive medium)) (pride (positive high))))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define home-together scene
	(process initial description
		 (sequence: (convey (accompanys hansel gretel))
		            (establish (relationship (relationship-of hansel gretel)))
		            (and (establish (emotional-state gretel (joy (positive high))))
		                 (establish (emotional-state hansel (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define hansel-and-gretel-film film
	(set your level of variety to medium)
	(set your level of complexity to medium)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (gretel kept-apart gretel-rescues-hansel home-together
        (relationship-of gretel hansel)
        (relationship-of hansel gretel)
        (relationship-of witch hansel))))

(compile-actors)

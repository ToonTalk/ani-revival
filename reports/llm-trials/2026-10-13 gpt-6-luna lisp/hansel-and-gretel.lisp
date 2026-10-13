;; -*-lisp-*-
;; cast: hansel = Hansel (he); gretel = Gretel (she); step-mother = the stepmother (she); witch = the witch (she)
;; scenes: introduction = Introduction; sent-away = Sent Away; witch-captures = The Witch Captures Them; gretel-resists = Gretel Resists

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hansel character
	(process initial description
		 (physical pretty)
		 (personality (and good kind))))

(define gretel character
	(process initial description
		 (physical pretty)
		 (personality (and good kind determined strong))
		 (role-in-story most-important)))

(define step-mother character
	(process initial description
		 (physical ugly)
		 (personality (and evil mean selfish))))

(define witch character
	(process initial description
		 (physical ugly)
		 (personality (and evil mean))))

(define (relationship-of hansel gretel) relationship
	(process initial description
		 loves))

(define (relationship-of gretel hansel) relationship
	(process initial description
		 loves))

(define (relationship-of step-mother hansel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of step-mother gretel) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of witch gretel) relationship
	(process initial description
		 hates))

(define introduction scene
	(process initial description
		 (and (establish (personality hansel))
		      (establish (personality gretel))
		      (establish (relationship (relationship-of hansel gretel)))
		      (establish (relationship (relationship-of gretel hansel)))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define sent-away scene
	(process initial description
		 (sequence: (establish (personality step-mother))
			    (convey (chases step-mother hansel))
			    (and (establish (emotional-state hansel (joy (negative high))))
				 (establish (emotional-state gretel (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define witch-captures scene
	(process initial description
		 (sequence: (establish (personality witch))
			    (convey (chases witch gretel))
			    (convey (prevents witch (meets hansel gretel)))
			    (establish (emotional-state gretel (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define gretel-resists scene
	(process initial description
		 (sequence: (convey (pushes gretel witch))
			    (convey (undoes gretel
					    (from-scene witch-captures
							(convey (prevents witch
									  (meets hansel gretel)))))
			    (convey (accompanys hansel gretel))
			    (establish (emotional-state gretel (joy (positive high))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to short)))

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
      (gretel witch-captures gretel-resists
	      (relationship-of hansel gretel)
	      (relationship-of gretel hansel))))

(compile-actors)

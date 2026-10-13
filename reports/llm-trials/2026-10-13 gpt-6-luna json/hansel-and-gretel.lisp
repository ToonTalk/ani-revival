;; -*-lisp-*-
;; cast: hansel = Hansel (he); gretel = Gretel (she); stepmother = the stepmother (she); witch = the witch (she)
;; scenes: siblings = Hansel and Gretel; sent-away = Sent Away; witch-captures-them = The Witch Keeps Them Apart; escape = Together Again

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hansel character
	(process initial description
		 (physical physically-weak)
		 (personality (and kind friendly))))

(define gretel character
	(process initial description
		 (physical physically-strong)
		 (personality (and kind determined strong))
		 (role-in-story most-important)))

(define (relationship-of hansel gretel) relationship
	(process initial description
		 loves))

(define (relationship-of gretel hansel) relationship
	(process initial description
		 loves))

(define stepmother character
	(process initial description
		 (physical ugly)
		 (personality (and mean evil selfish))))

(define (relationship-of stepmother hansel) relationship
	(process initial description
		 (and dominates hates)))

(define witch character
	(process initial description
		 (physical (and ugly magical))
		 (personality (and mean evil strong))))

(define (relationship-of witch gretel) relationship
	(process initial description
		 hates))

(define siblings scene
	(process initial description
		 (sequence: (and (establish (personality hansel))
		                 (establish (personality gretel)))
		            (establish (relationship (relationship-of gretel hansel)))
		            (convey (accompanys hansel gretel))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define sent-away scene
	(process initial description
		 (sequence: (establish (personality stepmother))
		            (convey (chases stepmother hansel))
		            (establish (emotional-state hansel (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(define witch-captures-them scene
	(process initial description
		 (sequence: (establish (personality witch))
		            (convey (chases witch gretel))
		            (convey (prevents witch (meets hansel gretel)))
		            (establish (emotional-state gretel (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to medium))

(define escape scene
	(process initial description
		 (sequence: (convey (pushes gretel witch))
		            (convey (accompanys gretel hansel))
		            (establish (emotional-state gretel (and (joy (positive high)) (pride (positive high)))))
		            (establish (emotional-state hansel (joy (positive high))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

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
      (gretel witch-captures-them escape
        (relationship-of gretel hansel)
        (relationship-of hansel gretel))))

(compile-actors)

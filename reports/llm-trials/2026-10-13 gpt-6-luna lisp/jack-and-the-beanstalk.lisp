;; -*-lisp-*-
;; cast: jack = Jack (he); giant = the giant (he); mother = Jack's mother (she)
;; scenes: first-encounter = The First Encounter; jack-gets-away = Jack Gets Away; happy-together = Happy Together

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define jack character
	(process initial description
		 (physical strong)
		 (personality (and strong determined))
		 (role-in-story most-important)))

(define giant character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean evil))))

(define mother character
	(process initial description
		 (physical pretty)
		 (personality (and good kind))))

(define (relationship-of giant jack) relationship
	(process initial description
		 hates))

(define first-encounter scene
	(process initial description
		 (and (establish (personality jack))
		      (establish (personality giant))
		      (establish (relationship (relationship-of giant jack)))
		      (convey (chases giant jack))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define jack-gets-away scene
	(process initial description
		 (sequence:
		  (convey (undoes jack
				  (from-scene first-encounter
					      (convey (chases giant jack))))
		  (and (establish (emotional-state jack (joy (positive medium))))
		       (establish (emotional-state giant (joy (negative high)))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to fast)
	(set your length to short)))

(define happy-together scene
	(process initial description
		 (sequence:
		  (establish (personality mother))
		  (convey (accompanys jack mother))
		  (and (establish (emotional-state jack (joy (positive high))))
		       (establish (emotional-state mother (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define jack-and-the-giant-film film
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
      (jack first-encounter jack-gets-away happy-together
            (relationship-of giant jack))))

(compile-actors)

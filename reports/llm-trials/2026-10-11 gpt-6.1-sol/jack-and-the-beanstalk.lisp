;; -*-lisp-*-
;; cast: jack = Jack (he); giant = the giant (he); mother = Jack's mother (she)
;; scenes: introduction = Introduction; giant-chases-jack = The Giant Chases Jack; jack-escapes = Jack Escapes; happy-together = Happy Together

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define jack character
	(process initial description
		 (physical shabby)
		 (personality (and good strong determined))
		 (role-in-story most-important)))

(define giant character
	(process initial description
		 (physical (and physically-strong powerful ugly))
		 (personality (and mean evil))))

(define mother character
	(process initial description
		 (physical shabby)
		 (personality (and good kind))))

(define (relationship-of jack giant) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of giant jack) relationship
	(process initial description
		 hates))

(define (relationship-of jack mother) relationship
	(process initial description
		 loves))

(define (relationship-of mother jack) relationship
	(process initial description
		 (and loves is-protective-to)))

(define (relationship-of giant mother) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of mother giant) relationship
	(process initial description
		 is-polite-to))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality jack))
		       (establish (personality giant))
		       (establish (relationship (relationship-of giant jack))))
		  (establish (emotional-state jack (joy (negative low))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define giant-chases-jack scene
	(process initial description
		 (sequence:
		  (convey (chases giant jack))
		  (establish (emotional-state jack (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define jack-escapes scene
	(process initial description
		 (sequence:
		  (convey (undoes jack
				  (from-scene giant-chases-jack
					      (convey (chases giant jack)))))
		  (establish (emotional-state giant (joy (negative high))))
		  (establish (emotional-state jack (joy (positive medium))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to fast)
	(set your length to short))

(define happy-together scene
	(process initial description
		 (sequence:
		  (convey (accompanys jack mother))
		  (establish (relationship (relationship-of mother jack)))
		  (and (establish (emotional-state jack (joy (positive high))))
		       (establish (emotional-state mother (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define jack-and-the-giant-film film
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
	(set your order-of-character+element-type+element to
	     (characters element-types elements))
	(set your parts-of-the-focus to
	     (jack giant-chases-jack jack-escapes happy-together
		   (relationship-of giant jack)
		   (relationship-of jack mother)
		   (relationship-of mother jack))))

(compile-actors)

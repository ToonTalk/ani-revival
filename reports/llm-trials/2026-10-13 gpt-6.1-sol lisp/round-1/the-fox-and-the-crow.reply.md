```lisp
;; -*-lisp-*-
;; cast: crow = the crow (she); fox = the fox (he)
;; scenes: proud-crow = The Proud Crow; flattery = Flattery; tricked-crow = The Tricked Crow

(include |ai:ken;declar >|)

(defcomment cindy)

(define crow character
	(process initial description
		 (physical elegant)
		 (personality forward)
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (physical elegant)
		 (personality (and selfish determined))))

(define (relationship-of fox crow) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of crow fox) relationship
	(process initial description
		 is-grateful-to))

(define proud-crow scene
	(process initial description
		 (sequence:
		  (and (establish (personality crow))
		       (establish (personality fox)))
		  (establish (relationship (relationship-of fox crow)))
		  (establish (emotional-state crow (pride (positive medium))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define flattery scene
	(process initial description
		 (sequence:
		  (convey (meets fox crow))
		  (convey (accompanys fox crow))
		  (establish (relationship (relationship-of crow fox)))
		  (establish (emotional-state crow (pride (positive high))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define tricked-crow scene
	(process initial description
		 (sequence:
		  (convey (undoes fox
				 (from-scene flattery
					     (convey (accompanys fox crow)))))
		  (establish (emotional-state fox (joy (positive high))))
		  (and (establish (emotional-state crow (pride (negative high))))
		       (establish (emotional-state crow (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read)))

(define crow-and-fox-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
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
	     (crow proud-crow flattery tricked-crow
		   (relationship-of fox crow)
		   (relationship-of crow fox))))

(compile-actors)
```
;; -*-lisp-*-
;; cast: crow = the crow (she); fox = the fox (he)
;; scenes: proud-crow = The Proud Crow; flattery = The Fox's Flattery; tricked = The Crow Is Tricked

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define crow character
	(process initial description
		 (physical pretty)
		 (personality forward)
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (physical elegant)
		 (personality (and selfish determined))
		 (movement graceful)))

(define (relationship-of fox crow) relationship
	(process initial description
		 is-polite-to))

(define proud-crow scene
	(process initial description
		 (sequence: (and (establish (personality crow))
		                 (establish (personality fox))
		                 (establish (relationship (relationship-of fox crow))))
		            (establish (emotional-state crow (pride (positive high))))))
	(set your mood to normal)
	(set your rhythm to slow)
	(set your length to medium))

(define flattery scene
	(process initial description
		 (sequence: (convey (meets fox crow))
		            (establish (relationship (relationship-of fox crow)))
		            (establish (emotional-state crow (and (joy (positive high)) (pride (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define tricked scene
	(process initial description
		 (sequence: (convey (pushes fox crow))
		            (establish (emotional-state fox (and (joy (positive high)) (pride (positive high)))))
		            (establish (emotional-state crow (and (joy (negative high)) (pride (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define the-crow-and-the-fox-film film
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
      (crow flattery tricked (relationship-of fox crow))))

(compile-actors)

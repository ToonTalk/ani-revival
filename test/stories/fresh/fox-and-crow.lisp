;; -*-lisp-*-
;; cast: crow = the crow (she); fox = the fox (he)
;; scenes: the-cheese = The Cheese; the-flattery = The Flattery; the-trick = The Trick

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define crow character
	(process initial description
		 (physical beautiful)
		 (personality (and good shy))
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (physical (and gorgeous physically-strong))
		 (personality (and selfish mean determined))))

(define (relationship-of fox crow) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of crow fox) relationship
	(process initial description
		 is-polite-to))

(define the-cheese scene
	(process initial description
		 (and (establish (personality crow))
		      (establish (emotional-state crow (and (joy (positive medium))
							    (pride (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to short))

(define the-flattery scene
	(process initial description
		 (sequence: (convey (wants fox (meets fox crow)))
			    (establish (personality fox))
			    (establish (relationship (relationship-of crow fox)))))
	(set your mood to hopeful)
	(set your rhythm to slow)
	(set your length to medium))

(define the-trick scene
	(process initial description
		 (sequence: (convey (hurts fox crow))
			    (convey (alone fox crow))
			    (establish (emotional-state crow (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define fox-and-crow-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 1) (minutes 3)))
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
      (crow the-trick the-flattery
            (relationship-of fox crow))))

(compile-actors)

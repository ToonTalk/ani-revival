;; -*-lisp-*-
;; cast: crow = the crow (she); fox = the fox (he)
;; scenes: the-proud-crow = The Proud Crow; the-flattery = The Flattery; the-fox-escapes = The Fox Escapes

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define crow character
	(process initial description
		 (physical beautiful)
		 (personality selfish)
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (physical elegant)
		 (personality (and selfish determined))))

(define (relationship-of fox crow) relationship
	(process initial description
		 is-polite-to))

(define the-proud-crow scene
	(process initial description
		 (and (establish (personality crow))
		      (establish (emotional-state crow (pride (positive medium))))
		      (establish (personality fox))
		      (establish (relationship (relationship-of fox crow)))))
	(set your mood to normal)
	(set your rhythm to slow)
	(set your length to medium))

(define the-flattery scene
	(process initial description
		 (sequence: (convey (wants fox (meets fox crow)))
		            (and (convey (accompanys fox crow))
		                 (establish (emotional-state crow (and (joy (positive high)) (pride (positive high))))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define the-fox-escapes scene
	(process initial description
		 (sequence: (convey (chases crow fox))
		            (and (establish (emotional-state crow (and (joy (negative high)) (pride (negative high)))))
		                 (establish (emotional-state fox (and (joy (positive high)) (pride (positive high))))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define crow-and-fox-film film
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
      (crow the-flattery the-fox-escapes
        (relationship-of fox crow))))

(compile-actors)

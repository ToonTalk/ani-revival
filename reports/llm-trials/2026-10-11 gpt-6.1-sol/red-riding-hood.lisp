;; -*-lisp-*-
;; cast: red-riding-hood = Little Red Riding Hood (she); grandmother = the grandmother (she); wolf = the wolf (he); woodcutter = the woodcutter (he)
;; scenes: wanting-to-visit = Wanting to Visit; kept-apart = Kept Apart; wolf-chased-off = The Wolf Chased Off; together-again = Together Again

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define red-riding-hood character
	(process initial description
		 (physical pretty)
		 (personality (and good friendly))
		 (role-in-story most-important)))

(define grandmother character
	(process initial description
		 (physical physically-weak)
		 (personality (and good kind))))

(define wolf character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean evil))))

(define woodcutter character
	(process initial description
		 (physical physically-strong)
		 (personality (and good kind strong))))

(define (relationship-of red-riding-hood grandmother) relationship
	(process initial description
		 loves))

(define (relationship-of grandmother red-riding-hood) relationship
	(process initial description
		 loves))

(define (relationship-of red-riding-hood wolf) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of wolf red-riding-hood) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of red-riding-hood woodcutter) relationship
	(process initial description
		 (and is-polite-to is-grateful-to)))

(define (relationship-of woodcutter red-riding-hood) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of grandmother wolf) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of wolf grandmother) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of grandmother woodcutter) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of woodcutter grandmother) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of wolf woodcutter) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of woodcutter wolf) relationship
	(process initial description
		 is-polite-to))

(define wanting-to-visit scene
	(process initial description
		 (sequence:
		  (and (establish (personality red-riding-hood))
		       (establish (personality grandmother))
		       (establish
			(relationship
			 (relationship-of red-riding-hood grandmother))))
		  (establish
		   (emotional-state red-riding-hood (joy (positive low))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define kept-apart scene
	(process initial description
		 (sequence:
		  (establish (personality wolf))
		  (convey
		   (wants red-riding-hood
			  (meets red-riding-hood grandmother)))
		  (convey
		   (prevents wolf
			     (meets red-riding-hood grandmother)))
		  (establish
		   (emotional-state red-riding-hood (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to (changes fast slow))
	(set your length to medium))

(define wolf-chased-off scene
	(process initial description
		 (sequence:
		  (convey (chases woodcutter wolf))
		  (convey
		   (undoes woodcutter
			   (from-scene kept-apart
				       (convey
					(prevents wolf
						  (meets red-riding-hood grandmother))))))
		  (and
		   (establish
		    (emotional-state wolf (joy (negative high))))
		   (establish
		    (emotional-state red-riding-hood (joy (positive medium)))))))
	(set your mood to (and joyous anticipatory))
	(set your rhythm to fast)
	(set your length to short))

(define together-again scene
	(process initial description
		 (sequence:
		  (convey (meets red-riding-hood grandmother))
		  (convey (accompanys red-riding-hood grandmother))
		  (and
		   (establish
		    (emotional-state red-riding-hood (joy (positive high))))
		   (establish
		    (emotional-state grandmother (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define red-riding-hood-film film
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
	     (red-riding-hood kept-apart wolf-chased-off together-again
			      (relationship-of red-riding-hood grandmother)
			      (relationship-of grandmother red-riding-hood)
			      (relationship-of wolf red-riding-hood)
			      (relationship-of woodcutter red-riding-hood))))

(compile-actors)

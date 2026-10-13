```lisp
;; -*-lisp-*-
;; cast: red-riding-hood = Red Riding Hood (she); grandmother = the grandmother (she); wolf = the wolf (he); woodcutter = the woodcutter (he)
;; scenes: introduction = The Introduction; the-wolf-blocks = The Wolf Blocks; the-woodcutter-chases = The Woodcutter Chases; together-again = Together Again

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define red-riding-hood character
	(process initial description
		 (physical beautiful)
		 (personality (and good friendly))
		 (role-in-story most-important)))

(define grandmother character
	(process initial description
		 (physical physically-weak)
		 (personality (and kind friendly))))

(define wolf character
	(process initial description
		 (physical ugly)
		 (personality (and mean evil))))

(define woodcutter character
	(process initial description
		 (physical physically-strong)
		 (personality (and good determined))))

(define (relationship-of red-riding-hood grandmother) relationship
	(process initial description
		 loves))

(define (relationship-of wolf red-riding-hood) relationship
	(process initial description
		 hates))

(define introduction scene
	(process initial description
		 (sequence: (and (establish (personality red-riding-hood))
				 (establish (relationship (relationship-of red-riding-hood grandmother))))
			    (establish (personality wolf))
			    (convey (chases wolf red-riding-hood))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to medium))

(define the-wolf-blocks scene
	(process initial description
		 (sequence: (convey (wants red-riding-hood (meets red-riding-hood grandmother)))
			    (convey (prevents wolf (meets red-riding-hood grandmother)))
			    (and (establish (personality grandmother))
				 (establish (emotional-state red-riding-hood (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define the-woodcutter-chases scene
	(process initial description
		 (sequence: (establish (personality woodcutter))
			    (convey (chases woodcutter wolf))
			    (and (establish (emotional-state wolf (shame (negative high))))
				 (establish (emotional-state red-riding-hood (joy (positive medium)))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define together-again scene
	(process initial description
		 (sequence: (convey (undoes woodcutter
					   (from-scene the-wolf-blocks
						       (convey (prevents wolf
									 (meets red-riding-hood grandmother)))))
			    (convey (accompanys red-riding-hood grandmother))
			    (and (establish (emotional-state red-riding-hood (joy (positive high))))
				 (establish (emotional-state grandmother (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define red-riding-hood-film film
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
      (red-riding-hood the-wolf-blocks the-woodcutter-chases together-again
		       (relationship-of red-riding-hood grandmother)
		       (relationship-of wolf red-riding-hood))))

(compile-actors)
```
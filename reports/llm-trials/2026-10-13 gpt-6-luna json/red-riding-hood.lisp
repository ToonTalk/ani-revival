;; -*-lisp-*-
;; cast: red-riding-hood = Little Red Riding Hood (she); grandmother = the grandmother (she); wolf = the wolf (he); woodcutter = the woodcutter (he)
;; scenes: introduction = The Introduction; blocked-path = The Blocked Path; rescue-and-reunion = Rescue and Reunion

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define red-riding-hood character
	(process initial description
		 (physical pretty)
		 (personality (and good friendly))
		 (role-in-story most-important)))

(define grandmother character
	(process initial description
		 (physical shabby)
		 (personality (and good kind))))

(define (relationship-of red-riding-hood grandmother) relationship
	(process initial description
		 loves))

(define (relationship-of grandmother red-riding-hood) relationship
	(process initial description
		 loves))

(define wolf character
	(process initial description
		 (physical ugly)
		 (personality (and mean evil))))

(define (relationship-of wolf red-riding-hood) relationship
	(process initial description
		 (and hates dominates)))

(define woodcutter character
	(process initial description
		 (physical physically-strong)
		 (personality (and good strong))))

(define introduction scene
	(process initial description
		 (sequence: (and (establish (personality red-riding-hood))
		                 (establish (personality grandmother))
		                 (establish (personality woodcutter))
		                 (establish (relationship (relationship-of red-riding-hood grandmother)))
		                 (establish (relationship (relationship-of grandmother red-riding-hood))))
		            (convey (wants red-riding-hood (meets red-riding-hood grandmother)))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define blocked-path scene
	(process initial description
		 (sequence: (and (establish (personality wolf))
		                 (establish (relationship (relationship-of wolf red-riding-hood))))
		            (and (convey (prevents wolf (meets red-riding-hood grandmother)))
		                 (convey (chases wolf red-riding-hood)))
		            (establish (emotional-state red-riding-hood (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(define rescue-and-reunion scene
	(process initial description
		 (sequence: (and (convey (chases woodcutter wolf))
		                 (convey (undoes woodcutter (from-scene blocked-path (convey (prevents wolf (meets red-riding-hood grandmother)))))))
		            (convey (meets red-riding-hood grandmother))
		            (and (establish (emotional-state red-riding-hood (joy (positive high))))
		                 (establish (emotional-state grandmother (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define little-red-riding-hood-film film
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
      (red-riding-hood blocked-path rescue-and-reunion
        (relationship-of red-riding-hood grandmother)
        (relationship-of grandmother red-riding-hood))))

(compile-actors)

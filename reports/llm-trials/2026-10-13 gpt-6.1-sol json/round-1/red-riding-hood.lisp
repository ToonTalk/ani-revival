;; -*-lisp-*-
;; cast: red-riding-hood = Little Red Riding Hood (she); grandmother = the grandmother (she); wolf = the wolf (he); woodcutter = the woodcutter (he)
;; scenes: introduction = Little Red Riding Hood; blocked = The Wolf Blocks the Way; rescue = The Woodcutter Chases the Wolf Away; reunion = Together Again

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
		 (personality (and kind good))))

(define (relationship-of red-riding-hood grandmother) relationship
	(process initial description
		 loves))

(define (relationship-of grandmother red-riding-hood) relationship
	(process initial description
		 loves))

(define wolf character
	(process initial description
		 (physical powerful)
		 (personality (and mean evil))))

(define (relationship-of wolf red-riding-hood) relationship
	(process initial description
		 hates))

(define woodcutter character
	(process initial description
		 (physical physically-strong)
		 (personality (and strong good))))

(define (relationship-of woodcutter red-riding-hood) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of red-riding-hood woodcutter) relationship
	(process initial description
		 is-grateful-to))

(define introduction scene
	(process initial description
		 (sequence: (and (establish (personality red-riding-hood))
		                 (establish (personality wolf)))
		            (establish (relationship (relationship-of red-riding-hood grandmother)))
		            (establish (emotional-state red-riding-hood (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to short))

(define blocked scene
	(process initial description
		 (sequence: (convey (wants red-riding-hood (meets red-riding-hood grandmother)))
		            (convey (prevents wolf (meets red-riding-hood grandmother)))
		            (establish (emotional-state red-riding-hood (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to (changes fast slow))
	(set your length to short))

(define rescue scene
	(process initial description
		 (sequence: (establish (personality woodcutter))
		            (convey (chases woodcutter wolf))
		            (convey (undoes woodcutter (from-scene blocked (convey (prevents wolf (meets red-riding-hood grandmother))))))
		            (establish (emotional-state red-riding-hood (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define reunion scene
	(process initial description
		 (sequence: (establish (personality grandmother))
		            (convey (meets red-riding-hood grandmother))
		            (and (establish (emotional-state red-riding-hood (joy (positive high))))
		                 (establish (emotional-state grandmother (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define little-red-riding-hood-film film
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
      (red-riding-hood blocked rescue reunion
        (relationship-of red-riding-hood grandmother)
        (relationship-of wolf red-riding-hood))))

(compile-actors)

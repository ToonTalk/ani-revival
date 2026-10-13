;; -*-lisp-*-
;; cast: gingerbread-man = the gingerbread man (he); baker = the baker (they); fox = the fox (he)
;; scenes: introduction = Introduction; running-away = Running Away; false-friendship = False Friendship; caught = Caught

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define gingerbread-man character
	(process initial description
		 (physical (and pretty physically-weak))
		 (personality (and brazen forward))
		 (role-in-story most-important)))

(define baker character
	(process initial description
		 (physical physically-strong)
		 (personality (and industrious determined))))

(define fox character
	(process initial description
		 (physical (and elegant physically-strong))
		 (personality (and friendly selfish))
		 (movement graceful)))

(define (relationship-of gingerbread-man baker) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of baker gingerbread-man) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of gingerbread-man fox) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of fox gingerbread-man) relationship
	(process initial description
		 is-helpful-towards))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality gingerbread-man))
		       (establish (personality baker)))
		  (establish (relationship (relationship-of gingerbread-man baker)))
		  (establish (emotional-state gingerbread-man (pride (positive high))))))
	(set your mood to normal)
	(set your rhythm to fast)
	(set your length to short))

(define running-away scene
	(process initial description
		 (sequence:
		  (convey (chases baker gingerbread-man))
		  (convey (meets fox gingerbread-man))
		  (establish (emotional-state gingerbread-man (joy (positive high))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to short))

(define false-friendship scene
	(process initial description
		 (sequence:
		  (convey (accompanys fox gingerbread-man))
		  (convey (change (personality fox friendly)
				 (personality fox mean)))
		  (convey (change (relationship (relationship-of fox gingerbread-man) is-helpful-towards)
				 (relationship (relationship-of fox gingerbread-man) hates)))
		  (establish (emotional-state gingerbread-man (joy (positive high))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define caught scene
	(process initial description
		 (sequence:
		  (establish (personality fox))
		  (convey (hurts fox gingerbread-man))
		  (and (establish (emotional-state gingerbread-man (joy (negative high))))
		       (establish (emotional-state fox (joy (positive high)))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read)))

(define gingerbread-man-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to medium)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
	(set your order-of-character+element-type+element to (characters element-types elements))
	(set your parts-of-the-focus to
	     (gingerbread-man running-away false-friendship caught
			     (relationship-of gingerbread-man baker)
			     (relationship-of gingerbread-man fox)
			     (relationship-of fox gingerbread-man))))

(compile-actors)

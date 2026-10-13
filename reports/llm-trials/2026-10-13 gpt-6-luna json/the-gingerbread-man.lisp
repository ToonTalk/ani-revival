;; -*-lisp-*-
;; cast: gingerbread-man = the gingerbread man (he); baker = the baker (they); fox = the fox (he)
;; scenes: the-escape = The Great Escape; false-friend = A Sly Friend; caught = The Fox Catches Him

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define gingerbread-man character
	(process initial description
		 (physical physically-weak)
		 (personality (and brazen strong))
		 (role-in-story most-important)))

(define baker character
	(process initial description
		 (physical strong)
		 (personality (and hard-working friendly))))

(define (relationship-of gingerbread-man baker) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of baker gingerbread-man) relationship
	(process initial description
		 is-tolerant-of))

(define fox character
	(process initial description
		 (physical strong)
		 (personality (and selfish determined))))

(define (relationship-of gingerbread-man fox) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of fox gingerbread-man) relationship
	(process initial description
		 is-polite-to))

(define the-escape scene
	(process initial description
		 (sequence: (and (establish (personality gingerbread-man))
		                 (establish (personality baker))
		                 (establish (relationship (relationship-of gingerbread-man baker)))
		                 (establish (relationship (relationship-of baker gingerbread-man))))
		            (and (convey (chases baker gingerbread-man))
		                 (establish (emotional-state gingerbread-man (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to medium))

(define false-friend scene
	(process initial description
		 (sequence: (and (establish (personality fox))
		                 (establish (relationship (relationship-of fox gingerbread-man)))
		                 (establish (relationship (relationship-of gingerbread-man fox))))
		            (and (convey (accompanys fox gingerbread-man))
		                 (establish (emotional-state gingerbread-man (joy (positive medium)))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define caught scene
	(process initial description
		 (sequence: (convey (chases fox gingerbread-man))
		            (and (establish (emotional-state gingerbread-man (joy (negative high))))
		                 (establish (emotional-state fox (and (pride (positive high)) (joy (positive high))))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define gingerbread-man-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to medium)
	(set your level of flashiness to low)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (gingerbread-man the-escape false-friend caught
        (relationship-of gingerbread-man fox)
        (relationship-of fox gingerbread-man))))

(compile-actors)

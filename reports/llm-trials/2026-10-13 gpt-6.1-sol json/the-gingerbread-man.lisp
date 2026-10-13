;; -*-lisp-*-
;; cast: gingerbread-man = the gingerbread man (he); pursuers = the pursuers (they); fox = the fox (he)
;; scenes: cheeky-gingerbread-man = The Cheeky Gingerbread Man; running-away = Running Away; false-friend = A False Friend; fox-catches-him = The Fox Catches Him

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define gingerbread-man character
	(process initial description
		 (physical (and pretty physically-weak))
		 (personality (and brazen forward))
		 (movement graceful)
		 (role-in-story most-important)))

(define pursuers character
	(process initial description
		 (physical physically-strong)
		 (personality (and determined stubborn))))

(define (relationship-of gingerbread-man pursuers) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of pursuers gingerbread-man) relationship
	(process initial description
		 is-intolerant-of))

(define fox character
	(process initial description
		 (physical powerful)
		 (personality (and evil selfish))
		 (movement graceful)))

(define (relationship-of fox gingerbread-man) relationship
	(process initial description
		 (and hates is-polite-to)))

(define (relationship-of gingerbread-man fox) relationship
	(process initial description
		 is-polite-to))

(define cheeky-gingerbread-man scene
	(process initial description
		 (sequence: (and (establish (personality gingerbread-man))
		                 (establish (personality pursuers)))
		            (establish (relationship (relationship-of gingerbread-man pursuers)))
		            (establish (emotional-state gingerbread-man (pride (positive high))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to short))

(define running-away scene
	(process initial description
		 (sequence: (convey (chases pursuers gingerbread-man))
		            (and (establish (emotional-state pursuers (joy (negative medium))))
		                 (establish (emotional-state gingerbread-man (and (joy (positive high)) (pride (positive high))))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to short))

(define false-friend scene
	(process initial description
		 (sequence: (convey (meets fox gingerbread-man))
		            (convey (accompanys fox gingerbread-man))
		            (convey (causes fox (change (relationship (relationship-of gingerbread-man fox) is-polite-to) (relationship (relationship-of gingerbread-man fox) is-grateful-to))))
		            (establish (emotional-state gingerbread-man (and (joy (positive high)) (pride (positive medium)))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define fox-catches-him scene
	(process initial description
		 (sequence: (convey (chases fox gingerbread-man))
		            (convey (hurts fox gingerbread-man))
		            (and (establish (emotional-state fox (and (joy (positive high)) (pride (positive high)))))
		                 (establish (emotional-state gingerbread-man (and (joy (negative high)) (pride (negative high))))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
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
	(set your level of obviousness to high)
	(set your level of flashiness to medium)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (gingerbread-man false-friend fox-catches-him
        (relationship-of gingerbread-man fox)
        (relationship-of fox gingerbread-man))))

(compile-actors)

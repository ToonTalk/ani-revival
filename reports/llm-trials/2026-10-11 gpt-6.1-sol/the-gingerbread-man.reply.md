```lisp
;; -*-lisp-*-
;; cast: gingerbread-man = the gingerbread man (he); pursuer = the pursuer (they); fox = the fox (he)
;; scenes: introduction = Introduction; running-away = Running Away; false-friendship = False Friendship; caught = Caught

(include |ai:ken;declar >|)

(defcomment cindy)

(define gingerbread-man character
	(process initial description
		 (physical pretty)
		 (personality (and brazen forward))
		 (role-in-story most-important)
		 (movement graceful)))

(define pursuer character
	(process initial description
		 (physical physically-strong)
		 (personality (and stubborn determined))))

(define fox character
	(process initial description
		 (physical (and elegant powerful))
		 (personality (and selfish determined))
		 (movement graceful)))

(define (relationship-of gingerbread-man pursuer) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of pursuer gingerbread-man) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of gingerbread-man fox) relationship
	(process initial description
		 (and is-polite-to is-grateful-to)))

(define (relationship-of fox gingerbread-man) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of pursuer fox) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of fox pursuer) relationship
	(process initial description
		 is-polite-to))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality gingerbread-man))
		       (establish (personality fox))
		       (establish (relationship (relationship-of gingerbread-man pursuer))))
		  (establish (emotional-state gingerbread-man (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define running-away scene
	(process initial description
		 (sequence:
		  (establish (personality pursuer))
		  (convey (chases pursuer gingerbread-man))
		  (and (establish (emotional-state pursuer (joy (negative medium))))
		       (establish (emotional-state gingerbread-man (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to short))

(define false-friendship scene
	(process initial description
		 (sequence:
		  (establish (relationship (relationship-of fox gingerbread-man)))
		  (convey (meets fox gingerbread-man))
		  (convey (accompanys fox gingerbread-man))
		  (establish (emotional-state gingerbread-man (joy (positive high))))))
	(set your mood to anticipatory)
	(set your rhythm to slow)
	(set your length to medium))

(define caught scene
	(process initial description
		 (sequence:
		  (convey (chases fox gingerbread-man))
		  (convey (hurts fox gingerbread-man))
		  (and (establish (emotional-state fox (joy (positive high))))
		       (establish (emotional-state gingerbread-man (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read)))

(define gingerbread-man-film film
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
	(set your order-of-character+element-type+element to (characters element-types elements))
	(set your parts-of-the-focus to
	     (gingerbread-man running-away false-friendship caught
			      (relationship-of gingerbread-man pursuer)
			      (relationship-of fox gingerbread-man)
			      (relationship-of gingerbread-man fox))))

(compile-actors)
```
```lisp
;; -*-lisp-*-
;; cast: gingerbread-man = the gingerbread man (he); pursuer = the pursuer (they); fox = the fox (he)
;; scenes: introduction = Introduction; running-away = Running Away; false-friend = The False Friend; caught = Caught

(include |ai:ken;declar >|)

(defcomment cindy)

(define gingerbread-man character
	(process initial description
		 (physical pretty)
		 (personality (and brazen forward))
		 (role-in-story most-important)))

(define pursuer character
	(process initial description
		 (physical physically-strong)
		 (personality (and determined stubborn))))

(define fox character
	(process initial description
		 (physical elegant)
		 (personality (and friendly selfish))
		 (movement graceful)))

(define (relationship-of pursuer gingerbread-man) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of gingerbread-man pursuer) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of fox gingerbread-man) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of gingerbread-man fox) relationship
	(process initial description
		 is-polite-to))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality gingerbread-man))
		       (establish (personality pursuer))
		       (establish (relationship (relationship-of pursuer gingerbread-man))))
		  (establish (emotional-state gingerbread-man (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define running-away scene
	(process initial description
		 (sequence:
		  (convey (chases pursuer gingerbread-man))
		  (establish (relationship (relationship-of gingerbread-man pursuer)))
		  (and (establish (emotional-state pursuer (joy (negative medium))))
		       (establish (emotional-state gingerbread-man (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to short))

(define false-friend scene
	(process initial description
		 (sequence:
		  (convey (accompanys fox gingerbread-man))
		  (establish (emotional-state gingerbread-man (joy (positive high))))
		  (convey (change (personality fox friendly)
				 (personality fox mean)))
		  (convey (change (relationship (relationship-of fox gingerbread-man) is-helpful-towards)
				 (relationship (relationship-of fox gingerbread-man) hates)))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to medium))

(define caught scene
	(process initial description
		 (sequence:
		  (establish (personality fox))
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
	     (gingerbread-man running-away false-friend caught
			      (relationship-of pursuer gingerbread-man)
			      (relationship-of gingerbread-man pursuer)
			      (relationship-of fox gingerbread-man)
			      (relationship-of gingerbread-man fox))))

(compile-actors)
```
```lisp
;; -*-lisp-*-
;; cast: snow-white = Snow White (she); queen = the queen (she); dwarfs = the dwarfs (they); prince = the prince (he)
;; scenes: introduction = Introduction; chased-away = Chased Away; protection = Protection; happy-together = Happy Together

(include |ai:ken;declar >|)

(defcomment cindy)

(define snow-white character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define queen character
	(process initial description
		 (physical beautiful)
		 (personality (and selfish evil))))

(define dwarfs character
	(process initial description
		 (physical physically-strong)
		 (personality (and good kind))))

(define prince character
	(process initial description
		 (physical elegant)
		 (personality (and good kind))))

(define (relationship-of queen snow-white) relationship
	(process initial description
		 hates))

(define (relationship-of dwarfs snow-white) relationship
	(process initial description
		 (and is-protective-to is-helpful-towards)))

(define (relationship-of snow-white dwarfs) relationship
	(process initial description
		 is-grateful-to))

(define (relationship-of snow-white prince) relationship
	(process initial description
		 loves))

(define (relationship-of prince snow-white) relationship
	(process initial description
		 loves))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality snow-white))
		       (establish (personality queen))
		       (establish (relationship (relationship-of queen snow-white))))
		  (establish (emotional-state queen (pride (positive high))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define chased-away scene
	(process initial description
		 (sequence:
		  (convey (chases queen snow-white))
		  (establish (emotional-state queen (joy (positive medium))))
		  (establish (emotional-state snow-white (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(define protection scene
	(process initial description
		 (sequence:
		  (establish (personality dwarfs))
		  (establish (relationship (relationship-of dwarfs snow-white)))
		  (convey (accompanys dwarfs snow-white))
		  (establish (emotional-state snow-white (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to slow)
	(set your length to medium))

(define happy-together scene
	(process initial description
		 (sequence:
		  (convey (meets prince snow-white))
		  (convey (getting-it-on snow-white prince))
		  (and (establish (emotional-state snow-white (joy (positive high))))
		       (establish (emotional-state prince (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define snow-white-film film
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
	     (snow-white chased-away protection happy-together
			 (relationship-of queen snow-white)
			 (relationship-of dwarfs snow-white)
			 (relationship-of snow-white prince)
			 (relationship-of prince snow-white))))

(compile-actors)
```
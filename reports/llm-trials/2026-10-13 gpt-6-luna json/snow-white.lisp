;; -*-lisp-*-
;; cast: snow-white = Snow White (she); queen = the queen (she); dwarfs = the dwarfs (they); prince = the prince (he)
;; scenes: the-queens-chase = The Queen's Chase; forest-protection = The Dwarfs Protect Snow White; the-princes-arrival = Happily Together

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define snow-white character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define queen character
	(process initial description
		 (physical beautiful)
		 (personality (and evil selfish mean))))

(define (relationship-of queen snow-white) relationship
	(process initial description
		 hates))

(define (relationship-of snow-white queen) relationship
	(process initial description
		 is-tolerant-of))

(define dwarfs character
	(process initial description
		 (physical physically-strong)
		 (personality (and kind friendly))))

(define (relationship-of dwarfs snow-white) relationship
	(process initial description
		 is-protective-to))

(define (relationship-of snow-white dwarfs) relationship
	(process initial description
		 is-grateful-to))

(define prince character
	(process initial description
		 (physical (and beautiful strong))
		 (personality (and good kind determined))))

(define (relationship-of snow-white prince) relationship
	(process initial description
		 loves))

(define (relationship-of prince snow-white) relationship
	(process initial description
		 loves))

(define the-queens-chase scene
	(process initial description
		 (sequence: (and (establish (personality snow-white))
		                 (establish (personality queen)))
		            (and (establish (relationship (relationship-of queen snow-white)))
		                 (establish (relationship (relationship-of snow-white queen))))
		            (convey (chases queen snow-white))
		            (and (establish (emotional-state queen (pride (positive medium))))
		                 (establish (emotional-state snow-white (joy (negative high)))))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define forest-protection scene
	(process initial description
		 (sequence: (and (establish (personality dwarfs))
		                 (establish (relationship (relationship-of dwarfs snow-white)))
		                 (establish (relationship (relationship-of snow-white dwarfs))))
		            (convey (accompanys dwarfs snow-white))
		            (establish (emotional-state snow-white (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define the-princes-arrival scene
	(process initial description
		 (sequence: (and (establish (personality prince))
		                 (convey (meets prince snow-white)))
		            (convey (getting-it-on snow-white prince))
		            (and (establish (relationship (relationship-of snow-white prince)))
		                 (establish (relationship (relationship-of prince snow-white))))
		            (and (establish (emotional-state snow-white (joy (positive high))))
		                 (establish (emotional-state prince (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define snow-white-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (snow-white the-queens-chase forest-protection
        the-princes-arrival (relationship-of snow-white queen)
        (relationship-of dwarfs snow-white)
        (relationship-of snow-white prince))))

(compile-actors)

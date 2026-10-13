;; -*-lisp-*-
;; cast: snow-white = Snow White (she); queen = the queen (she); dwarfs = the dwarfs (they); prince = the prince (he)
;; scenes: into-the-forest = Into the Forest; dwarfs-protect-snow-white = The Dwarfs Protect Snow White; prince-meets-snow-white = The Prince Meets Snow White

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
		 (personality evil)))

(define dwarfs character
	(process initial description
		 (physical physically-strong)
		 (personality kind)))

(define prince character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))))

(define (relationship-of queen snow-white) relationship
	(process initial description
		 hates))

(define (relationship-of dwarfs snow-white) relationship
	(process initial description
		 is-protective-to))

(define (relationship-of snow-white prince) relationship
	(process initial description
		 loves))

(define (relationship-of prince snow-white) relationship
	(process initial description
		 loves))

(define into-the-forest scene
	(process initial description
		 (sequence:
		  (and (establish (personality snow-white))
		       (establish (personality queen)))
		  (establish (relationship (relationship-of queen snow-white)))
		  (convey (chases queen snow-white))
		  (establish (emotional-state snow-white (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define dwarfs-protect-snow-white scene
	(process initial description
		 (and (establish (personality dwarfs))
		      (establish (relationship (relationship-of dwarfs snow-white)))
		      (convey (accompanys dwarfs snow-white))
		      (establish (emotional-state snow-white (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define prince-meets-snow-white scene
	(process initial description
		 (sequence:
		  (convey (meets prince snow-white))
		  (convey (getting-it-on prince snow-white))
		  (and (establish (personality prince))
		       (establish (relationship (relationship-of snow-white prince)))
		       (establish (relationship (relationship-of prince snow-white)))
		       (establish (emotional-state snow-white (joy (positive high))))
		       (establish (emotional-state prince (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define snow-white-film film
	(set your level of variety to medium)
	(set your level of complexity to medium)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to medium)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to medium)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (snow-white into-the-forest dwarfs-protect-snow-white prince-meets-snow-white
                 (relationship-of queen snow-white)
                 (relationship-of dwarfs snow-white))))

(compile-actors)

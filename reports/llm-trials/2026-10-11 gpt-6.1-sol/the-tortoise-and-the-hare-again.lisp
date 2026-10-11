;; -*-lisp-*-
;; cast: hare = the hare (he); tortoise = the tortoise (they)
;; scenes: introduction = Introduction; the-race = The Race; the-hare-rests = The Hare Rests; the-tortoise-wins = The Tortoise Wins

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define tortoise character
	(process initial description
		 (physical physically-strong)
		 (personality (and hard-working determined))
		 (role-in-story most-important)))

(define hare character
	(process initial description
		 (physical elegant)
		 (personality (and mean brazen lazy))))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and hates is-impolite-to)))

(define (relationship-of tortoise hare) relationship
	(process initial description
		 is-tolerant-of))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality tortoise))
		       (establish (personality hare)))
		  (establish (relationship (relationship-of hare tortoise)))
		  (establish (emotional-state tortoise (joy (negative low))))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to medium))

(define the-race scene
	(process initial description
		 (sequence:
		  (convey (chases tortoise hare))
		  (and (establish (emotional-state hare (joy (positive high))))
		       (establish (emotional-state tortoise (joy (positive low)))))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define the-hare-rests scene
	(process initial description
		 (sequence:
		  (establish (personality hare))
		  (convey (chases tortoise hare))
		  (and (establish (emotional-state hare (joy (positive low))))
		       (establish (emotional-state tortoise (joy (positive medium)))))))
	(set your mood to hopeful)
	(set your rhythm to slow)
	(set your length to short))

(define the-tortoise-wins scene
	(process initial description
		 (sequence:
		  (convey (meets tortoise hare))
		  (establish (relationship (relationship-of tortoise hare)))
		  (and (establish (emotional-state tortoise (joy (positive high))))
		       (establish (emotional-state hare (joy (negative high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define hare-and-tortoise-film film
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
	     (tortoise the-race the-hare-rests the-tortoise-wins
		       (relationship-of hare tortoise)
		       (relationship-of tortoise hare))))

(compile-actors)

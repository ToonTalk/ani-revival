;; -*-lisp-*-
;; cast: hare = the hare (he); tortoise = the tortoise (he)
;; scenes: hare-bullies-tortoise = The Hare Bullies the Tortoise; tortoise-triumphs = The Tortoise Triumphs

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hare character
	(process initial description
		 (physical physically-strong)
		 (personality (and brazen lazy mean))))

(define tortoise character
	(process initial description
		 (physical physically-weak)
		 (personality (and hard-working determined))
		 (role-in-story most-important)))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and dominates hates)))

(define hare-bullies-tortoise scene
	(process initial description
		 (sequence: (and (establish (personality hare))
				 (establish (personality tortoise)))
			    (establish (relationship (relationship-of hare tortoise)))
			    (and (convey (pushes hare tortoise))
				 (convey (chases hare tortoise)))
			    (establish (emotional-state tortoise (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define tortoise-triumphs scene
	(process initial description
		 (and (establish (personality tortoise))
		      (establish (emotional-state tortoise
					       (and (joy (positive high))
						    (pride (positive high))))
		      (establish (emotional-state hare (shame (negative high))))))
	(set your mood to joyous)
	(set your rhythm to slow)
	(set your length to medium)))

(declare (coutput (read)))

(define hare-and-tortoise-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
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
      (tortoise hare-bullies-tortoise tortoise-triumphs
                 (relationship-of hare tortoise))))

(compile-actors)

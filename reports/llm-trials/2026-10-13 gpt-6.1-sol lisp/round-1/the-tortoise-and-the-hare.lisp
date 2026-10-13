;; -*-lisp-*-
;; cast: tortoise = the tortoise (he); hare = the hare (he)
;; scenes: introduction = Introduction; pushed-around = Pushed Around; tortoise-triumph = The Tortoise's Triumph

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define tortoise character
	(process initial description
		 (physical physically-weak)
		 (personality (and hard-working determined))
		 (role-in-story most-important)))

(define hare character
	(process initial description
		 (physical physically-strong)
		 (personality (and brazen mean lazy))))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of tortoise hare) relationship
	(process initial description
		 is-tolerant-of))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality tortoise))
		       (establish (personality hare))
		       (establish (relationship (relationship-of hare tortoise))))
		  (establish (emotional-state tortoise (joy (negative low))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to short))

(define pushed-around scene
	(process initial description
		 (sequence:
		  (convey (pushes hare tortoise))
		  (establish (personality tortoise))
		  (establish (emotional-state tortoise (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(define tortoise-triumph scene
	(process initial description
		 (sequence:
		  (convey (meets tortoise hare))
		  (and (establish (emotional-state tortoise (joy (positive high))))
		       (establish (emotional-state tortoise (pride (positive high))))
		       (establish (emotional-state hare (pride (negative high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define tortoise-and-hare-film film
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
	     (tortoise pushed-around tortoise-triumph
		       (relationship-of hare tortoise)
		       (relationship-of tortoise hare))))

(compile-actors)

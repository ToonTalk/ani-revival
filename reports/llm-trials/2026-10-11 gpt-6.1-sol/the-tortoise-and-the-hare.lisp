;; -*-lisp-*-
;; cast: tortoise = the tortoise (he); hare = the hare (he)
;; scenes: introduction = Introduction; pushed-around = Pushed Around; the-tortoise-triumphs = The Tortoise Triumphs

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define tortoise character
	(process initial description
		 (physical physically-weak)
		 (personality (and good hard-working determined))
		 (role-in-story most-important)))

(define hare character
	(process initial description
		 (physical (and physically-strong elegant))
		 (personality (and brazen mean lazy))
		 (movement graceful)))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and dominates hates is-impolite-to)))

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
	(set your length to medium))

(define pushed-around scene
	(process initial description
		 (sequence:
		  (convey (pushes hare tortoise))
		  (establish (personality tortoise))
		  (establish (emotional-state hare (joy (positive medium))))
		  (establish (emotional-state tortoise (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(define the-tortoise-triumphs scene
	(process initial description
		 (sequence:
		  (convey (meets tortoise hare))
		  (establish (emotional-state hare (joy (negative high))))
		  (establish (emotional-state tortoise (joy (positive high))))))
	(set your mood to (very joyous))
	(set your rhythm to slow)
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
      (tortoise introduction pushed-around the-tortoise-triumphs
                (relationship-of hare tortoise)
                (relationship-of tortoise hare))))

(compile-actors)

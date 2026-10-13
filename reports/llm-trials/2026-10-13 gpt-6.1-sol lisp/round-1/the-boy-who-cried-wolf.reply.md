```lisp
;; -*-lisp-*-
;; cast: shepherd-boy = the shepherd boy (he); villagers = the villagers (they); wolf = the wolf (he); sheep = the sheep (they)
;; scenes: introduction = Introduction; first-trick = The First Trick; trick-again = Another Trick; real-wolf = The Real Wolf; sheep-chased = The Sheep Are Chased

(include |ai:ken;declar >|)

(defcomment cindy)

(define shepherd-boy character
	(process initial description
		 (physical shabby)
		 (personality (and brazen lazy selfish))
		 (role-in-story most-important)))

(define villagers character
	(process initial description
		 (physical physically-strong)
		 (personality (and kind industrious))))

(define wolf character
	(process initial description
		 (physical (and physically-strong unkempt))
		 (personality (and evil determined))))

(define sheep character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy weak))))

(define (relationship-of villagers shepherd-boy) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of shepherd-boy villagers) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of wolf sheep) relationship
	(process initial description
		 hates))

(define introduction scene
	(process initial description
		 (and (establish (personality shepherd-boy))
		      (establish (personality villagers))
		      (establish (relationship (relationship-of villagers shepherd-boy)))
		      (establish (emotional-state shepherd-boy (joy (negative low))))))
	(set your mood to normal)
	(set your rhythm to slow)
	(set your length to medium))

(define first-trick scene
	(process initial description
		 (sequence:
		  (convey (meets shepherd-boy villagers))
		  (convey (accompanys villagers shepherd-boy))
		  (establish (emotional-state shepherd-boy (joy (positive high))))
		  (establish (emotional-state villagers (joy (negative medium))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to short))

(define trick-again scene
	(process initial description
		 (sequence:
		  (convey (meets shepherd-boy villagers))
		  (convey (accompanys villagers shepherd-boy))
		  (convey
		   (change
		    (relationship (relationship-of villagers shepherd-boy) is-helpful-towards)
		    (relationship (relationship-of villagers shepherd-boy) is-intolerant-of)))
		  (establish (emotional-state villagers (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to normal)
	(set your length to short))

(define real-wolf scene
	(process initial description
		 (sequence:
		  (convey (meets wolf shepherd-boy))
		  (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		  (establish (relationship (relationship-of villagers shepherd-boy)))
		  (establish (emotional-state shepherd-boy (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to medium))

(define sheep-chased scene
	(process initial description
		 (sequence:
		  (convey (chases wolf sheep))
		  (establish (emotional-state sheep (joy (negative high))))
		  (establish (emotional-state shepherd-boy (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read)))

(define boy-who-cried-wolf-film film
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
	     (shepherd-boy trick-again real-wolf sheep-chased
			   (relationship-of villagers shepherd-boy)
			   (relationship-of shepherd-boy villagers)
			   (relationship-of wolf sheep))))

(compile-actors)
```
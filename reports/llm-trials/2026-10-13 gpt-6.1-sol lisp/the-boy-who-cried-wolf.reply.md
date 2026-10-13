```lisp
;; -*-lisp-*-
;; cast: shepherd-boy = the shepherd boy (he); villagers = the villagers (they); wolf = the wolf (he); sheep = the sheep (they)
;; scenes: idle-shepherd = The Idle Shepherd; first-trick = The First Trick; second-trick = The Second Trick; wolf-arrives = The Wolf Arrives; sheep-chased = The Sheep Are Chased

(include |ai:ken;declar >|)

(defcomment cindy)

(define shepherd-boy character
	(process initial description
		 (physical pretty)
		 (personality brazen)
		 (role-in-story most-important)))

(define villagers character
	(process initial description
		 (physical physically-strong)
		 (personality (and kind friendly))))

(define wolf character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean determined))))

(define sheep character
	(process initial description
		 (physical physically-weak)
		 (personality shy)))

(define (relationship-of villagers shepherd-boy) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of shepherd-boy villagers) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of wolf sheep) relationship
	(process initial description
		 hates))

(define (relationship-of sheep wolf) relationship
	(process initial description
		 is-intolerant-of))

(define idle-shepherd scene
	(process initial description
		 (sequence:
		  (establish (personality shepherd-boy))
		  (establish (personality villagers))
		  (establish (relationship (relationship-of villagers shepherd-boy)))
		  (establish (emotional-state shepherd-boy (joy (negative low))))))
	(set your mood to normal)
	(set your rhythm to slow)
	(set your length to short))

(define first-trick scene
	(process initial description
		 (sequence:
		  (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		  (convey (meets villagers shepherd-boy))
		  (establish (emotional-state shepherd-boy (joy (positive medium))))
		  (establish (emotional-state villagers (joy (negative medium))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to normal)
	(set your length to medium))

(define second-trick scene
	(process initial description
		 (sequence:
		  (convey (meets villagers shepherd-boy))
		  (establish (emotional-state shepherd-boy (joy (positive high))))
		  (convey
		   (change
		    (relationship (relationship-of villagers shepherd-boy)
				  is-helpful-towards)
		    (relationship (relationship-of villagers shepherd-boy)
				  is-intolerant-of)))
		  (establish (emotional-state villagers (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to normal)
	(set your length to medium))

(define wolf-arrives scene
	(process initial description
		 (sequence:
		  (convey (meets wolf sheep))
		  (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		  (convey
		   (undoes villagers
			   (from-scene second-trick
				       (convey (meets villagers shepherd-boy)))))
		  (establish (emotional-state shepherd-boy (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define sheep-chased scene
	(process initial description
		 (sequence:
		  (convey (chases wolf sheep))
		  (establish (emotional-state sheep (joy (negative high))))
		  (establish (relationship (relationship-of villagers shepherd-boy)))
		  (establish (emotional-state shepherd-boy (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read)))

(define shepherd-boy-and-wolf-film film
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
	     (shepherd-boy first-trick second-trick wolf-arrives sheep-chased
			   (relationship-of villagers shepherd-boy)
			   (relationship-of shepherd-boy villagers)
			   (relationship-of wolf sheep))))

(compile-actors)
```
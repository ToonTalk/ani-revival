;; -*-lisp-*-
;; cast: shepherd-boy = the shepherd boy (he); villagers = the villagers (they); wolf = the wolf (he); sheep = the sheep (they)
;; scenes: introduction = Introduction; first-trick = The First Trick; another-trick = Another Trick; the-wolf-comes = The Wolf Comes; the-sheep-are-chased = The Sheep Are Chased

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define shepherd-boy character
	(process initial description
		 (physical physically-weak)
		 (personality (and brazen forward lazy))
		 (role-in-story most-important)))

(define villagers character
	(process initial description
		 (physical physically-strong)
		 (personality (and good industrious stubborn))))

(define wolf character
	(process initial description
		 (physical powerful)
		 (personality (and mean determined))))

(define sheep character
	(process initial description
		 (physical physically-weak)
		 (personality (and weak shy))))

(define (relationship-of shepherd-boy villagers) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of villagers shepherd-boy) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of shepherd-boy wolf) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of wolf shepherd-boy) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of shepherd-boy sheep) relationship
	(process initial description
		 is-protective-to))

(define (relationship-of sheep shepherd-boy) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of villagers wolf) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of wolf villagers) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of villagers sheep) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of sheep villagers) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of wolf sheep) relationship
	(process initial description
		 hates))

(define (relationship-of sheep wolf) relationship
	(process initial description
		 is-intolerant-of))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality shepherd-boy))
		       (establish (personality villagers))
		       (establish (relationship (relationship-of shepherd-boy villagers))))
		  (establish (emotional-state shepherd-boy (joy (negative low))))))
	(set your mood to normal)
	(set your rhythm to slow)
	(set your length to medium))

(define first-trick scene
	(process initial description
		 (sequence:
		  (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		  (convey (meets villagers shepherd-boy))
		  (establish (emotional-state shepherd-boy (joy (positive medium))))
		  (establish (emotional-state villagers (joy (negative low))))))
	(set your mood to normal)
	(set your rhythm to fast)
	(set your length to short))

(define another-trick scene
	(process initial description
		 (sequence:
		  (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		  (convey (meets villagers shepherd-boy))
		  (establish (emotional-state shepherd-boy (joy (positive high))))
		  (establish (emotional-state villagers (joy (negative high))))))
	(set your mood to normal)
	(set your rhythm to fast)
	(set your length to short))

(define the-wolf-comes scene
	(process initial description
		 (sequence:
		  (convey (meets wolf shepherd-boy))
		  (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		  (convey (prevents villagers (meets shepherd-boy villagers)))
		  (establish (emotional-state shepherd-boy (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to (changes fast slow))
	(set your length to medium))

(define the-sheep-are-chased scene
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
	     (shepherd-boy another-trick the-wolf-comes the-sheep-are-chased
			   (relationship-of shepherd-boy villagers)
			   (relationship-of villagers shepherd-boy)
			   (relationship-of shepherd-boy sheep)
			   (relationship-of wolf sheep))))

(compile-actors)

;; -*-lisp-*-
;; cast: shepherd-boy = the shepherd boy (he); villagers = the villagers (they); wolf = the wolf (he); sheep = the sheep (they)
;; scenes: introduction = Introduction; tricks = The Tricks; wolf-comes = The Wolf Comes; wolf-chases-sheep = The Wolf Chases the Sheep

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define shepherd-boy character
	(process initial description
		 (physical physically-weak)
		 (personality (and friendly brazen))
		 (role-in-story most-important)))

(define villagers character
	(process initial description
		 (physical physically-strong)
		 (personality unfriendly)))

(define (relationship-of shepherd-boy villagers) relationship
	(process initial description
		 is-impolite-to))

(define (relationship-of villagers shepherd-boy) relationship
	(process initial description
		 is-intolerant-of))

(define wolf character
	(process initial description
		 (physical powerful)
		 (personality evil)))

(define sheep character
	(process initial description
		 (physical physically-weak)
		 (personality shy)))

(define (relationship-of wolf sheep) relationship
	(process initial description
		 hates))

(define introduction scene
	(process initial description
		 (and (establish (personality shepherd-boy))
		      (establish (personality villagers))
		      (and (establish (relationship (relationship-of shepherd-boy villagers)))
			   (establish (relationship (relationship-of villagers shepherd-boy))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define tricks scene
	(process initial description
		 (sequence: (convey (pushes shepherd-boy villagers))
			    (and (establish (emotional-state shepherd-boy (joy (positive medium))))
				 (establish (emotional-state villagers (joy (negative medium)))))))
	(set your mood to (changes joyous depressing))
	(set your rhythm to fast)
	(set your length to short))

(define wolf-comes scene
	(process initial description
		 (sequence: (convey (meets shepherd-boy wolf))
			    (convey (alone shepherd-boy wolf))
			    (establish (emotional-state shepherd-boy (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define wolf-chases-sheep scene
	(process initial description
		 (sequence: (establish (personality wolf))
			    (establish (relationship (relationship-of wolf sheep)))
			    (convey (chases wolf sheep))
			    (and (establish (personality sheep))
				 (establish (emotional-state shepherd-boy (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read)))

(define shepherd-boy-film film
	(set your level of variety to medium)
	(set your level of complexity to medium)
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
      (shepherd-boy tricks wolf-comes wolf-chases-sheep
		    (relationship-of shepherd-boy villagers)
		    (relationship-of villagers shepherd-boy))))

(compile-actors)

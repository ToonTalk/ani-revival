;; -*-lisp-*-
;; cast: shepherd-boy = the shepherd boy (he); villagers = the villagers (they); wolf = the wolf (he); sheep = the sheep (they)
;; scenes: the-trick = The Trick; again-and-again = Again and Again; the-real-wolf = The Real Wolf

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define shepherd-boy character
	(process initial description
		 (physical physically-weak)
		 (personality (and hard-working brazen))
		 (role-in-story most-important)))

(define villagers character
	(process initial description
		 (physical physically-weak)
		 (personality unfriendly)))

(define (relationship-of villagers shepherd-boy) relationship
	(process initial description
		 is-intolerant-of))

(define wolf character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean evil strong))))

(define sheep character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy weak))))

(define (relationship-of wolf sheep) relationship
	(process initial description
		 hates))

(define (relationship-of sheep wolf) relationship
	(process initial description
		 is-intolerant-of))

(define the-trick scene
	(process initial description
		 (sequence: (and (establish (personality shepherd-boy))
		                 (establish (personality villagers))
		                 (establish (relationship (relationship-of villagers shepherd-boy))))
		            (convey (chases shepherd-boy villagers))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to short))

(define again-and-again scene
	(process initial description
		 (sequence: (convey (chases shepherd-boy villagers))
		            (and (establish (emotional-state shepherd-boy (joy (positive medium))))
		                 (establish (emotional-state villagers (joy (negative high)))))))
	(set your mood to normal)
	(set your rhythm to fast)
	(set your length to medium))

(define the-real-wolf scene
	(process initial description
		 (sequence: (and (establish (personality wolf))
		                 (convey (chases wolf sheep)))
		            (and (establish (emotional-state shepherd-boy (joy (negative high))))
		                 (establish (emotional-state sheep (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define shepherd-boy-and-wolf-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to medium)
	(set your level of flashiness to low)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (shepherd-boy again-and-again the-real-wolf
        (relationship-of shepherd-boy villagers)
        (relationship-of villagers shepherd-boy)
        (relationship-of wolf sheep))))

(compile-actors)

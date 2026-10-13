;; -*-lisp-*-
;; cast: shepherd-boy = the shepherd boy (he); villagers = the villagers (they); wolf = the wolf (he); sheep = the sheep (they)
;; scenes: bored-shepherd = The Bored Shepherd; first-trick = The First Trick; tricked-again = Tricked Again; real-wolf = The Real Wolf; wolf-chases-sheep = The Wolf Chases the Sheep

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define shepherd-boy character
	(process initial description
		 (physical physically-weak)
		 (personality (and brazen selfish))
		 (role-in-story most-important)))

(define villagers character
	(process initial description
		 (physical physically-strong)
		 (personality (and kind hard-working))))

(define (relationship-of villagers shepherd-boy) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of shepherd-boy villagers) relationship
	(process initial description
		 is-impolite-to))

(define wolf character
	(process initial description
		 (physical physically-strong)
		 (personality determined)))

(define sheep character
	(process initial description
		 (physical physically-weak)
		 (personality weak)))

(define bored-shepherd scene
	(process initial description
		 (sequence: (and (establish (personality shepherd-boy))
		                 (establish (personality villagers))
		                 (establish (relationship (relationship-of villagers shepherd-boy))))
		            (establish (emotional-state shepherd-boy (joy (negative low))))))
	(set your mood to normal)
	(set your rhythm to slow)
	(set your length to short))

(define first-trick scene
	(process initial description
		 (sequence: (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		            (convey (meets villagers shepherd-boy))
		            (and (establish (emotional-state shepherd-boy (joy (positive high))))
		                 (establish (emotional-state villagers (joy (negative medium)))))))
	(set your mood to normal)
	(set your rhythm to fast)
	(set your length to short))

(define tricked-again scene
	(process initial description
		 (sequence: (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		            (convey (meets villagers shepherd-boy))
		            (and (convey (causes shepherd-boy (change (relationship (relationship-of villagers shepherd-boy) is-helpful-towards) (relationship (relationship-of villagers shepherd-boy) is-intolerant-of))))
		                 (establish (emotional-state villagers (joy (negative high)))))))
	(set your mood to normal)
	(set your rhythm to fast)
	(set your length to short))

(define real-wolf scene
	(process initial description
		 (sequence: (convey (meets wolf shepherd-boy))
		            (convey (wants shepherd-boy (meets shepherd-boy villagers)))
		            (establish (relationship (relationship-of villagers shepherd-boy)))
		            (establish (emotional-state shepherd-boy (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define wolf-chases-sheep scene
	(process initial description
		 (sequence: (convey (chases wolf sheep))
		            (and (establish (emotional-state sheep (joy (negative high))))
		                 (establish (emotional-state shepherd-boy (and (joy (negative high)) (pride (negative high))))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define the-boy-who-cried-wolf-film film
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
      (shepherd-boy tricked-again real-wolf wolf-chases-sheep
        (relationship-of shepherd-boy villagers)
        (relationship-of villagers shepherd-boy))))

(compile-actors)

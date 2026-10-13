;; -*-lisp-*-
;; cast: belle = Belle (she); beast = the Beast (he); father = her father (he)
;; scenes: introduction = Belle and the Beast; kept-apart = Kept Apart; in-love = In Love

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define belle character
	(process initial description
		 (physical beautiful)
		 (personality (and kind stubborn))
		 (role-in-story most-important)))

(define beast character
	(process initial description
		 (physical (and ugly strong))
		 (personality (and mean strong))))

(define (relationship-of beast belle) relationship
	(process initial description
		 (and dominates loves)))

(define (relationship-of belle beast) relationship
	(process initial description
		 (and is-tolerant-of loves)))

(define father character
	(process initial description
		 (physical physically-weak)
		 (personality (and weak kind))))

(define introduction scene
	(process initial description
		 (and (establish (personality belle))
		      (establish (personality beast))
		      (establish (relationship (relationship-of beast belle)))
		      (convey (chases beast belle))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define kept-apart scene
	(process initial description
		 (and (establish (personality father))
		      (convey (wants father (meets father belle)))
		      (convey (prevents beast (meets father belle)))
		      (establish (emotional-state belle (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define in-love scene
	(process initial description
		 (and (convey (causes beast (change (relationship (relationship-of belle beast) is-tolerant-of) (relationship (relationship-of belle beast) loves))))
		      (convey (causes belle (change (relationship (relationship-of beast belle) dominates) (relationship (relationship-of beast belle) loves))))
		      (establish (emotional-state belle (joy (positive high))))
		      (establish (emotional-state beast (joy (positive high))))))
	(set your mood to (very joyous))
	(set your rhythm to slow)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define belle-and-the-beast-film film
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
      (belle kept-apart in-love (relationship-of belle beast)
        (relationship-of beast belle))))

(compile-actors)

;; -*-lisp-*-
;; cast: belle = Belle (she); beast = the Beast (he); father = Belle's father (he)
;; scenes: introduction = Belle and the Beast; kept-apart = Kept Apart from Her Father; love-and-kindness = Belle Comes to Love the Beast; the-beasts-love = The Beast's Kindness; happy-together = Belle and the Beast in Love

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define belle character
	(process initial description
		 (physical beautiful)
		 (personality (and kind stubborn))
		 (role-in-story most-important)))

(define beast character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and strong mean))))

(define (relationship-of beast belle) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of belle beast) relationship
	(process initial description
		 is-tolerant-of))

(define father character
	(process initial description
		 (physical physically-weak)
		 (personality (and weak kind))))

(define (relationship-of belle father) relationship
	(process initial description
		 loves))

(define (relationship-of father belle) relationship
	(process initial description
		 loves))

(define introduction scene
	(process initial description
		 (sequence: (and (establish (personality belle))
		                 (establish (personality beast))
		                 (establish (relationship (relationship-of beast belle))))
		            (establish (emotional-state belle (joy (negative medium))))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to short))

(define kept-apart scene
	(process initial description
		 (sequence: (establish (personality father))
		            (convey (wants father (meets father belle)))
		            (convey (prevents beast (meets father belle)))
		            (establish (emotional-state father (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define love-and-kindness scene
	(process initial description
		 (sequence: (convey (meets belle beast))
		            (and (convey (causes belle (change (personality beast mean) (personality beast kind))))
		                 (convey (change (relationship (relationship-of belle beast) is-tolerant-of) (relationship (relationship-of belle beast) loves))))
		            (establish (emotional-state belle (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to slow)
	(set your length to medium))

(define the-beasts-love scene
	(process initial description
		 (sequence: (establish (personality beast))
		            (and (convey (causes belle (change (relationship (relationship-of beast belle) (and dominates hates)) (relationship (relationship-of beast belle) loves))))
		                 (convey (undoes beast (from-scene kept-apart (convey (prevents beast (meets father belle)))))))
		            (establish (emotional-state father (joy (positive high))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define happy-together scene
	(process initial description
		 (sequence: (convey (getting-it-on belle beast))
		            (and (establish (emotional-state belle (joy (positive high))))
		                 (establish (emotional-state beast (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to long))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define beauty-and-the-beast-film film
	(set your level of variety to medium)
	(set your level of complexity to medium)
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
      (belle kept-apart love-and-kindness happy-together
        (relationship-of belle beast)
        (relationship-of beast belle)
        (relationship-of belle father))))

(compile-actors)

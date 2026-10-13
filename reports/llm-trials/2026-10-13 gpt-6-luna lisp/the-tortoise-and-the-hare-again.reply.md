```lisp
;; -*-lisp-*-
;; cast: hare = the hare (he); tortoise = the tortoise (he)
;; scenes: first-meeting = First Meeting; taunting = Taunting; the-race = The Race; the-finish = The Finish

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hare character
	(process initial description
		 (physical physically-strong)
		 (personality (and brazen lazy))))

(define tortoise character
	(process initial description
		 (physical physically-weak)
		 (personality (and hard-working determined))
		 (role-in-story most-important)))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and dominates is-impolite-to)))

(define (relationship-of tortoise hare) relationship
	(process initial description
		 is-tolerant-of))

(define first-meeting scene
	(process initial description
		 (and (establish (personality hare))
		      (establish (personality tortoise))
		      (establish (relationship (relationship-of hare tortoise)))
		      (establish (relationship (relationship-of tortoise hare)))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define taunting scene
	(process initial description
		 (and (convey (pushes hare tortoise))
		      (establish (emotional-state tortoise (joy (negative medium))))
		      (establish (emotional-state hare (pride (positive medium))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define the-race scene
	(process initial description
		 (sequence: (convey (chases tortoise hare))
			    (and (establish (personality hare))
				 (establish (personality tortoise)))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define the-finish scene
	(process initial description
		 (and (establish (emotional-state tortoise
						  (and (joy (positive high))
						       (pride (positive high)))))
		      (establish (emotional-state hare (shame (positive high))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define tortoise-and-hare-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
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
      (tortoise taunting the-race the-finish
		(relationship-of tortoise hare)
		(relationship-of hare tortoise))))

(compile-actors)
```
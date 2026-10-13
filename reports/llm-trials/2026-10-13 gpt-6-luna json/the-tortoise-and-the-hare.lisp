;; -*-lisp-*-
;; cast: hare = the hare (he); tortoise = the tortoise (he)
;; scenes: the-taunt = The Taunt; the-bullying = Pushed Around; the-finish = The Tortoise Triumphs

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hare character
	(process initial description
		 (physical physically-strong)
		 (personality (and brazen lazy mean))))

(define tortoise character
	(process initial description
		 (physical strong)
		 (personality (and hard-working determined))
		 (role-in-story most-important)))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of tortoise hare) relationship
	(process initial description
		 is-tolerant-of))

(define the-taunt scene
	(process initial description
		 (and (establish (personality tortoise))
		      (establish (personality hare))
		      (establish (relationship (relationship-of hare tortoise)))
		      (establish (relationship (relationship-of tortoise hare)))
		      (convey (pushes hare tortoise))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to short))

(define the-bullying scene
	(process initial description
		 (sequence: (convey (pushes hare tortoise))
		            (and (establish (emotional-state tortoise (joy (negative high))))
		                 (establish (emotional-state hare (pride (positive medium)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define the-finish scene
	(process initial description
		 (and (establish (emotional-state tortoise (and (joy (positive high)) (pride (positive high)))))
		      (establish (emotional-state hare (and (joy (negative high)) (pride (negative high)))))))
	(set your mood to (very joyous))
	(set your rhythm to slow)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define hare-and-tortoise-film film
	(set your level of variety to low)
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
      (tortoise the-bullying the-finish
        (relationship-of tortoise hare)
        (relationship-of hare tortoise))))

(compile-actors)

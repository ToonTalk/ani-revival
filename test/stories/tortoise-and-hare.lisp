;; -*-lisp-*-
;; cast: hare = the hare (he); tortoise = the tortoise (he)
;; scenes: the-boast = The Boast; the-race = The Race; the-finish = The Finish
;; A test story with only two characters and a last scene of nothing but feelings, the
;; kind a language model writes for "The Tortoise and the Hare".

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hare character
	(process initial description
		 (physical (and gorgeous physically-strong))
		 (personality (and brazen lazy mean))))

(define tortoise character
	(process initial description
		 (physical shabby)
		 (personality (and good hard-working determined))
		 (role-in-story most-important)))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of tortoise hare) relationship
	(process initial description
		 is-tolerant-of))

(define the-boast scene
	(process initial description
		 (and (establish (personality hare))
		      (establish (personality tortoise))
		      (establish (relationship (relationship-of hare tortoise)))
		      (establish (emotional-state tortoise (joy (negative medium))))))
	(set your rhythm to normal)
	(set your length to medium))

(define the-race scene
	(process initial description
		 (sequence: (convey (pushes hare tortoise))
			    (convey (chases tortoise hare))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to fast)
	(set your length to medium))

(define the-finish scene
	(process initial description
		 (and (establish (emotional-state tortoise (and (joy (positive high)) (pride (positive high)))))
		      (establish (emotional-state hare (pride (negative high))))))
	(set your mood to joyous)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define tortoise-and-hare-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 1) (minutes 2)))
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
      (tortoise the-race (relationship-of hare tortoise))))

(compile-actors)

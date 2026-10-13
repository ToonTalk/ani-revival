;; -*-lisp-*-
;; cast: crow = the crow (she); fox = the fox (he)
;; scenes: first-meeting = First Meeting; fox-tricks-crow = The Fox Tricks the Crow; crow-is-sad = The Crow Is Sad

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define crow character
	(process initial description
		 (physical (and shabby physically-weak))
		 (personality (and brazen selfish))
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (physical (and unkempt physically-strong))
		 (personality (and determined selfish))))

(define (relationship-of fox crow) relationship
	(process initial description
		 is-polite-to))

(define first-meeting scene
	(process initial description
		 (and (establish (personality crow))
		      (establish (personality fox))
		      (establish (relationship (relationship-of fox crow)))
		      (establish (emotional-state crow
						 (and (joy (positive medium))
						      (pride (positive medium)))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define fox-tricks-crow scene
	(process initial description
		 (and (convey (meets fox crow))
		      (establish (emotional-state crow
						 (and (joy (positive high))
						      (pride (positive high)))))
		      (establish (emotional-state fox
						 (joy (positive medium))))))
	(set your mood to (changes hopeful joyous))
	(set your rhythm to fast)
	(set your length to short))

(define crow-is-sad scene
	(process initial description
		 (and (establish (emotional-state crow
						 (and (joy (negative high))
						      (pride (negative high)))))
		      (establish (emotional-state fox
						 (and (joy (positive high))
						      (pride (positive high)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(declare (coutput (read)))

(define crow-and-fox-film film
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
      (crow fox-tricks-crow crow-is-sad
             (relationship-of fox crow))))

(compile-actors)

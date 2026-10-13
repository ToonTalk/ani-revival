;; -*-lisp-*-
;; cast: belle = Belle (she); beast = the Beast (he); father = her father (he)
;; scenes: first-meeting = First Meeting; kept-apart = Kept Apart; love = Love

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
		 (personality mean)))

(define father character
	(process initial description
		 (physical physically-weak)
		 (personality (and weak kind))))

(define (relationship-of beast belle) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of belle beast) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of father belle) relationship
	(process initial description
		 loves))

(define first-meeting scene
	(process initial description
		 (and (establish (personality belle))
		      (establish (personality beast))
		      (and (establish (relationship (relationship-of beast belle)))
			   (establish (relationship (relationship-of belle beast))))
		      (convey (hurts beast belle))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to short))

(define kept-apart scene
	(process initial description
		 (sequence: (establish (personality father))
			    (establish (relationship (relationship-of father belle)))
			    (convey (wants father (meets father belle)))
			    (convey (prevents beast (meets belle father)))
			    (and (establish (emotional-state belle (joy (negative medium))))
				 (establish (emotional-state father (joy (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define love scene
	(process initial description
		 (sequence: (convey (causes belle
					    (change (personality beast mean)
						    (personality beast kind))))
			    (convey (change (relationship (relationship-of belle beast)
							  is-tolerant-of)
					    (relationship (relationship-of belle beast) loves)))
			    (convey (causes belle
					    (change (relationship (relationship-of beast belle)
								  (and dominates hates))
						    (relationship (relationship-of beast belle) loves))))
			    (and (establish (personality beast))
				 (establish (relationship (relationship-of belle beast)))
				 (establish (relationship (relationship-of beast belle)))
				 (convey (getting-it-on belle beast))
				 (establish (emotional-state belle (joy (positive high))))
				 (establish (emotional-state beast (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to long))

(declare (coutput (read)))

(define beauty-and-the-beast-film film
	(set your level of variety to medium)
	(set your level of complexity to medium)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to medium)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to medium)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (belle kept-apart love
	       (relationship-of belle beast)
	       (relationship-of beast belle))))

(compile-actors)

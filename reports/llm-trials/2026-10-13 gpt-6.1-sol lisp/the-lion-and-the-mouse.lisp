;; -*-lisp-*-
;; cast: lion = the lion (he); mouse = the mouse (she)
;; scenes: introduction = Introduction; caught-and-released = Caught and Released; lion-trapped = The Lion Trapped; mouse-rescues-lion = The Mouse Rescues the Lion; happy-friends = Happy Friends

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define lion character
	(process initial description
		 (physical physically-strong)
		 (personality (and strong brazen))))

(define mouse character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy kind))
		 (role-in-story most-important)))

(define (relationship-of lion mouse) relationship
	(process initial description
		 dominates))

(define (relationship-of mouse lion) relationship
	(process initial description
		 is-obedient-to))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality lion))
		       (establish (personality mouse))
		       (establish (relationship (relationship-of lion mouse))))
		  (establish (emotional-state mouse (joy (negative low))))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to short))

(define caught-and-released scene
	(process initial description
		 (sequence:
		  (convey (chases lion mouse))
		  (convey (change
			   (relationship (relationship-of lion mouse) dominates)
			   (relationship (relationship-of lion mouse) is-tolerant-of)))
		  (and (establish (emotional-state lion (pride (positive medium))))
		       (establish (emotional-state mouse (joy (positive high)))))))
	(set your mood to (changes hopeful joyous))
	(set your rhythm to (changes fast slow))
	(set your length to short))

(define lion-trapped scene
	(process initial description
		 (sequence:
		  (convey (change
			   (physical lion physically-strong)
			   (physical lion physically-weak)))
		  (convey (change
			   (personality mouse shy)
			   (personality mouse determined)))
		  (convey (wants mouse (meets mouse lion)))
		  (establish (emotional-state lion (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define mouse-rescues-lion scene
	(process initial description
		 (sequence:
		  (convey (causes mouse
				   (change
				    (physical lion physically-weak)
				    (physical lion physically-strong))))
		  (and
		   (convey (change
			    (relationship (relationship-of lion mouse) is-tolerant-of)
			    (relationship (relationship-of lion mouse) is-helpful-towards)))
		   (convey (change
			    (relationship (relationship-of mouse lion) is-obedient-to)
			    (relationship (relationship-of mouse lion) is-helpful-towards))))
		  (establish (emotional-state lion (joy (positive high))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define happy-friends scene
	(process initial description
		 (sequence:
		  (establish (personality mouse))
		  (convey (accompanys mouse lion))
		  (and (establish (emotional-state lion (joy (positive high))))
		       (establish (emotional-state mouse (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define lion-and-mouse-film film
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
	     (mouse caught-and-released lion-trapped mouse-rescues-lion happy-friends
		    (relationship-of lion mouse)
		    (relationship-of mouse lion))))

(compile-actors)

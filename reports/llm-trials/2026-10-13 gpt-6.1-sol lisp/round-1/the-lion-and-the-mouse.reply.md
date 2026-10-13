```lisp
;; -*-lisp-*-
;; cast: lion = the lion (he); mouse = the mouse (she)
;; scenes: introduction = Introduction; caught = Caught; mercy = Mercy; trapped = Trapped; rescue-and-friendship = Rescue and Friendship

(include |ai:ken;declar >|)

(defcomment cindy)

(define lion character
	(process initial description
		 (physical (and powerful physically-strong))
		 (personality (and strong brazen))
		 (role-in-story most-important)))

(define mouse character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy kind))))

(define (relationship-of lion mouse) relationship
	(process initial description
		 dominates))

(define (relationship-of mouse lion) relationship
	(process initial description
		 is-tolerant-of))

(define introduction scene
	(process initial description
		 (sequence:
		  (establish (personality lion))
		  (establish (personality mouse))
		  (establish (relationship (relationship-of lion mouse)))
		  (establish (emotional-state lion (pride (positive high))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define caught scene
	(process initial description
		 (sequence:
		  (convey (pushes lion mouse))
		  (establish (emotional-state mouse (joy (negative high))))
		  (establish (emotional-state lion (pride (positive high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define mercy scene
	(process initial description
		 (sequence:
		  (convey (undoes lion
				 (from-scene caught
					     (convey (pushes lion mouse)))))
		  (convey (change
			   (relationship (relationship-of lion mouse) dominates)
			   (relationship (relationship-of lion mouse) is-generous-towards)))
		  (convey (change
			   (relationship (relationship-of mouse lion) is-tolerant-of)
			   (relationship (relationship-of mouse lion) is-grateful-to)))
		  (establish (emotional-state mouse (joy (positive high))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define trapped scene
	(process initial description
		 (sequence:
		  (establish (emotional-state lion (joy (negative high))))
		  (convey (wants mouse (meets mouse lion)))
		  (convey (change
			   (personality mouse shy)
			   (personality mouse determined)))
		  (establish (emotional-state mouse (joy (negative medium))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define rescue-and-friendship scene
	(process initial description
		 (sequence:
		  (establish (personality mouse))
		  (convey (accompanys mouse lion))
		  (establish (emotional-state lion (joy (positive high))))
		  (establish (emotional-state mouse (joy (positive high))))))
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
	(set your order-of-character+element-type+element to
	     (characters element-types elements))
	(set your parts-of-the-focus to
	     (lion mercy trapped rescue-and-friendship
		   (relationship-of lion mouse)
		   (relationship-of mouse lion))))

(compile-actors)
```
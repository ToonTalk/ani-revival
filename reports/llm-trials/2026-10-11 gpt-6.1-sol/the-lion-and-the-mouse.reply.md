```lisp
;; -*-lisp-*-
;; cast: lion = the lion (he); mouse = the mouse (she)
;; scenes: introduction = Introduction; caught = Caught; released = Released; trapped = Trapped; friends = Friends

(include |ai:ken;declar >|)

(defcomment cindy)

(define lion character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality (and strong brazen generous))
		 (role-in-story most-important)))

(define mouse character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy kind determined))))

(define (relationship-of lion mouse) relationship
	(process initial description
		 (and dominates is-generous-towards is-protective-to)))

(define (relationship-of mouse lion) relationship
	(process initial description
		 (and is-grateful-to is-helpful-towards)))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality lion))
		       (establish (personality mouse))
		       (establish (relationship (relationship-of lion mouse))))
		  (establish (emotional-state lion (joy (positive medium))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(define caught scene
	(process initial description
		 (sequence:
		  (convey (chases lion mouse))
		  (establish (emotional-state mouse (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define released scene
	(process initial description
		 (sequence:
		  (convey (undoes lion
				  (from-scene caught
					      (convey (chases lion mouse)))))
		  (establish (emotional-state mouse (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to short))

(define trapped scene
	(process initial description
		 (sequence:
		  (convey (wants lion (meets lion mouse)))
		  (establish (emotional-state lion (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define friends scene
	(process initial description
		 (sequence:
		  (convey (accompanys mouse lion))
		  (establish (relationship (relationship-of mouse lion)))
		  (and (establish (emotional-state lion (joy (positive high))))
		       (establish (emotional-state mouse (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read)))

(define lion-and-mouse-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 2) (minutes 5)))
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
	     (lion released trapped friends
		   (relationship-of lion mouse)
		   (relationship-of mouse lion))))

(compile-actors)
```
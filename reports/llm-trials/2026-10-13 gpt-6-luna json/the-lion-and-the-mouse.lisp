;; -*-lisp-*-
;; cast: lion = the lion (he); mouse = the mouse (she)
;; scenes: the-capture = The Capture; the-rescue = The Rescue; friends = Friends

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define lion character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality (and strong stubborn))))

(define mouse character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy determined strong))
		 (role-in-story most-important)))

(define (relationship-of lion mouse) relationship
	(process initial description
		 dominates))

(define (relationship-of mouse lion) relationship
	(process initial description
		 is-obedient-to))

(define the-capture scene
	(process initial description
		 (sequence: (establish (personality mouse))
		            (establish (personality lion))
		            (establish (relationship (relationship-of lion mouse)))
		            (convey (chases lion mouse))))
	(set your mood to normal)
	(set your rhythm to fast)
	(set your length to short))

(define the-rescue scene
	(process initial description
		 (sequence: (convey (undoes lion (from-scene the-capture (convey (chases lion mouse)))))
		            (establish (emotional-state lion (joy (negative high))))
		            (convey (pushes mouse lion))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to short))

(define friends scene
	(process initial description
		 (sequence: (convey (causes mouse (change (relationship (relationship-of lion mouse) dominates) (relationship (relationship-of lion mouse) is-tolerant-of))))
		            (convey (causes lion (change (relationship (relationship-of mouse lion) is-obedient-to) (relationship (relationship-of mouse lion) is-tolerant-of))))
		            (and (establish (emotional-state lion (joy (positive high))))
		                 (establish (emotional-state mouse (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

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
      (mouse the-rescue friends (relationship-of mouse lion)
        (relationship-of lion mouse))))

(compile-actors)

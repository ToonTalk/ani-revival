;; -*-lisp-*-
;; cast: lion = the lion (he); mouse = the mouse (she)
;; scenes: the-capture = The Lion Catches the Mouse; mercy = The Lion Lets Her Go; the-lion-trapped = The Mouse Finds the Trapped Lion; the-rescue = The Brave Mouse Helps the Lion; friends = The Lion and the Mouse Become Friends

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define lion character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality (and strong generous))
		 (role-in-story most-important)))

(define mouse character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy weak kind))))

(define (relationship-of lion mouse) relationship
	(process initial description
		 dominates))

(define (relationship-of mouse lion) relationship
	(process initial description
		 (and is-grateful-to is-helpful-towards)))

(define the-capture scene
	(process initial description
		 (sequence: (and (establish (personality lion))
		                 (establish (personality mouse)))
		            (convey (chases lion mouse))
		            (establish (relationship (relationship-of lion mouse)))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define mercy scene
	(process initial description
		 (sequence: (and (convey (undoes lion (from-scene the-capture (convey (chases lion mouse)))))
		                 (convey (change (relationship (relationship-of lion mouse) dominates) (relationship (relationship-of lion mouse) (and is-helpful-towards is-polite-to)))))
		            (and (establish (emotional-state lion (pride (positive high))))
		                 (establish (emotional-state mouse (joy (positive medium)))))))
	(set your mood to hopeful)
	(set your rhythm to slow)
	(set your length to short))

(define the-lion-trapped scene
	(process initial description
		 (sequence: (and (convey (change (physical lion (and physically-strong powerful)) (physical lion physically-weak)))
		                 (convey (change (personality mouse (and shy weak)) (personality mouse (and determined strong)))))
		            (convey (meets mouse lion))
		            (establish (emotional-state lion (and (joy (negative high)) (pride (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define the-rescue scene
	(process initial description
		 (sequence: (establish (personality mouse))
		            (and (convey (accompanys mouse lion))
		                 (convey (causes mouse (change (physical lion physically-weak) (physical lion (and physically-strong powerful))))))
		            (establish (emotional-state lion (joy (positive high))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define friends scene
	(process initial description
		 (sequence: (establish (relationship (relationship-of lion mouse)))
		            (convey (accompanys lion mouse))
		            (and (establish (emotional-state lion (joy (positive high))))
		                 (establish (emotional-state mouse (and (joy (positive high)) (pride (positive high))))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define the-lion-and-the-mouse-film film
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
      (lion mercy the-rescue friends (relationship-of lion mouse)
        (relationship-of mouse lion))))

(compile-actors)

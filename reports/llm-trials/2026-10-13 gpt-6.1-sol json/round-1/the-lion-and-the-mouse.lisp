;; -*-lisp-*-
;; cast: lion = the lion (he); mouse = the mouse (she)
;; scenes: caught = The Lion Catches the Mouse; mercy = The Lion Lets Her Go; trapped = The Lion Needs Help; rescue = The Brave Mouse Frees the Lion; friends = Two Happy Friends

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define lion character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality strong)
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
		 is-grateful-to))

(define caught scene
	(process initial description
		 (sequence: (and (establish (personality lion))
		                 (establish (personality mouse)))
		            (establish (relationship (relationship-of lion mouse)))
		            (establish (emotional-state mouse (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define mercy scene
	(process initial description
		 (sequence: (and (convey (change (relationship (relationship-of lion mouse) dominates) (relationship (relationship-of lion mouse) is-generous-towards)))
		                 (convey (undoes lion (from-scene caught (establish (relationship (relationship-of lion mouse)))))))
		            (and (establish (emotional-state lion (pride (positive high))))
		                 (establish (emotional-state mouse (joy (positive high)))))))
	(set your mood to hopeful)
	(set your rhythm to slow)
	(set your length to short))

(define trapped scene
	(process initial description
		 (sequence: (establish (emotional-state lion (and (joy (negative high)) (pride (negative high)))))
		            (convey (meets mouse lion))
		            (convey (change (personality mouse shy) (personality mouse (and determined strong))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define rescue scene
	(process initial description
		 (sequence: (establish (personality mouse))
		            (convey (undoes mouse (from-scene trapped (establish (emotional-state lion (and (joy (negative high)) (pride (negative high))))))))
		            (and (convey (causes mouse (change (relationship (relationship-of lion mouse) is-generous-towards) (relationship (relationship-of lion mouse) (and is-grateful-to is-helpful-towards)))))
		                 (convey (change (relationship (relationship-of mouse lion) is-grateful-to) (relationship (relationship-of mouse lion) is-helpful-towards))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define friends scene
	(process initial description
		 (sequence: (establish (relationship (relationship-of lion mouse)))
		            (convey (accompanys mouse lion))
		            (and (establish (emotional-state lion (joy (positive high))))
		                 (establish (emotional-state mouse (and (joy (positive high)) (pride (positive medium))))))))
	(set your mood to (very joyous))
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
      (lion mercy rescue friends (relationship-of lion mouse)
        (relationship-of mouse lion))))

(compile-actors)

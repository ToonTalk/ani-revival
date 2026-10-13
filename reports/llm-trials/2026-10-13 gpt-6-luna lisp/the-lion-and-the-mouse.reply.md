```lisp
;; -*-lisp-*-
;; cast: lion = the lion (he); mouse = the mouse (she)
;; scenes: first-meeting = The First Meeting; lion-trapped = The Lion Trapped; mouse-rescues-lion = The Mouse Rescues the Lion; friends = Friends

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define lion character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality (and strong determined))
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
		 is-obedient-to))

(define first-meeting scene
	(process initial description
		 (sequence:
		  (and (establish (personality lion))
		       (establish (personality mouse))
		       (establish (relationship (relationship-of lion mouse)))
		       (establish (emotional-state lion (pride (positive high)))))
		  (convey (chases lion mouse))
		  (establish (emotional-state mouse (joy (positive low))))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define lion-trapped scene
	(process initial description
		 (and (establish (emotional-state lion (joy (negative high))))
		      (convey (wants mouse (meets mouse lion)))
		      (establish (emotional-state mouse (joy (positive medium))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define mouse-rescues-lion scene
	(process initial description
		 (sequence:
		  (convey (accompanys mouse lion))
		  (convey (change (relationship (relationship-of lion mouse) dominates)
				  (relationship (relationship-of lion mouse)
						(and is-tolerant-of is-grateful-to))))
		  (convey (change (relationship (relationship-of mouse lion) is-obedient-to)
				  (relationship (relationship-of mouse lion)
						(and is-tolerant-of is-grateful-to))))
		  (convey (change (personality mouse (and shy kind))
				  (personality mouse (and brazen kind))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define friends scene
	(process initial description
		 (and (establish (personality mouse))
		      (establish (relationship (relationship-of lion mouse)))
		      (establish (emotional-state lion (joy (positive high))))
		      (establish (emotional-state mouse (joy (positive high))))))
	(set your mood to (very joyous))
	(set your rhythm to fast)
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
      (lion lion-trapped mouse-rescues-lion friends
	    (relationship-of lion mouse)
	    (relationship-of mouse lion))))

(compile-actors)
```
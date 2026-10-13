;; -*-lisp-*-
;; cast: gingerbread-man = the gingerbread man (he); pursuers = the pursuers (they); fox = the fox (he)
;; scenes: introduction = The Cheeky Gingerbread Man; the-chase = Everyone Chases Him; false-friend = The Fox Seems Friendly; betrayal = The Fox Turns Against Him; caught = The Fox Catches Him

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define gingerbread-man character
	(process initial description
		 (physical physically-weak)
		 (personality (and brazen forward))
		 (movement graceful)
		 (role-in-story most-important)))

(define pursuers character
	(process initial description
		 (physical physically-strong)
		 (personality (and determined stubborn))
		 (movement clumsy)))

(define (relationship-of pursuers gingerbread-man) relationship
	(process initial description
		 is-intolerant-of))

(define fox character
	(process initial description
		 (physical powerful)
		 (personality (and friendly selfish))
		 (movement graceful)))

(define (relationship-of fox gingerbread-man) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of gingerbread-man fox) relationship
	(process initial description
		 is-polite-to))

(define introduction scene
	(process initial description
		 (sequence: (and (establish (personality gingerbread-man))
		                 (establish (personality pursuers))
		                 (establish (relationship (relationship-of pursuers gingerbread-man))))
		            (establish (emotional-state gingerbread-man (pride (positive high))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to short))

(define the-chase scene
	(process initial description
		 (sequence: (convey (chases pursuers gingerbread-man))
		            (and (establish (emotional-state pursuers (joy (negative medium))))
		                 (establish (emotional-state gingerbread-man (and (joy (positive high)) (pride (positive high))))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to short))

(define false-friend scene
	(process initial description
		 (sequence: (and (establish (personality fox))
		                 (convey (meets fox gingerbread-man)))
		            (establish (relationship (relationship-of fox gingerbread-man)))
		            (establish (emotional-state gingerbread-man (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define betrayal scene
	(process initial description
		 (sequence: (and (convey (change (personality fox friendly) (personality fox (and bad determined))))
		                 (convey (change (relationship (relationship-of fox gingerbread-man) is-polite-to) (relationship (relationship-of fox gingerbread-man) dominates))))
		            (convey (chases fox gingerbread-man))
		            (establish (emotional-state gingerbread-man (and (pride (negative high)) (joy (negative medium)))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to fast)
	(set your length to short))

(define caught scene
	(process initial description
		 (sequence: (establish (personality fox))
		            (convey (pushes fox gingerbread-man))
		            (and (establish (emotional-state fox (and (joy (positive high)) (pride (positive high)))))
		                 (establish (emotional-state gingerbread-man (and (joy (negative high)) (pride (negative high))))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define gingerbread-man-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to medium)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (gingerbread-man false-friend betrayal caught
        (relationship-of gingerbread-man fox)
        (relationship-of fox gingerbread-man))))

(compile-actors)

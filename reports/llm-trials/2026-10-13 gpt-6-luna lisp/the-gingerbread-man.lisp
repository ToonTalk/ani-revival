;; -*-lisp-*-
;; cast: gingerbread-man = the Gingerbread Man (he); fox = the fox (he)
;; scenes: running-away = Running Away; false-friendship = False Friendship; caught-at-last = Caught at Last

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define gingerbread-man character
	(process initial description
		 (physical physically-weak)
		 (personality (and brazen forward))
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (physical physically-strong)
		 (personality (and friendly selfish evil))))

(define (relationship-of fox gingerbread-man) relationship
	(process initial description
		 (and hates is-polite-to)))

(define (relationship-of gingerbread-man fox) relationship
	(process initial description
		 is-polite-to))

(define running-away scene
	(process initial description
		 (sequence: (and (establish (personality gingerbread-man))
				 (establish (personality fox))
				 (establish (relationship (relationship-of fox gingerbread-man))))
			    (convey (chases fox gingerbread-man))
			    (and (establish (emotional-state gingerbread-man
							     (and (joy (positive high))
								  (pride (positive high))))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to medium))

(define false-friendship scene
	(process initial description
		 (and (convey (accompanys fox gingerbread-man))
		      (establish (relationship (relationship-of gingerbread-man fox)))
		      (establish (emotional-state gingerbread-man (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define caught-at-last scene
	(process initial description
		 (sequence: (convey (chases fox gingerbread-man))
			    (and (establish (emotional-state fox (pride (positive high))))
				 (establish (emotional-state gingerbread-man (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read)))

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
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (gingerbread-man running-away false-friendship caught-at-last
		     (relationship-of gingerbread-man fox)
		     (relationship-of fox gingerbread-man))))

(compile-actors)

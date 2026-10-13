;; -*-lisp-*-
;; cast: jack = Jack (he); giant = the giant (he); mother = Jack's mother (she)
;; scenes: introduction = Jack and the Giant; pursuit = The Giant Chases Jack; escape = Jack Gets Away; happy-together = Jack and His Mother

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define jack character
	(process initial description
		 (physical shabby)
		 (personality (and strong determined forward))
		 (role-in-story most-important)))

(define giant character
	(process initial description
		 (physical (and physically-strong powerful))
		 (personality mean)))

(define (relationship-of giant jack) relationship
	(process initial description
		 hates))

(define mother character
	(process initial description
		 (physical shabby)
		 (personality (and kind good))))

(define (relationship-of jack mother) relationship
	(process initial description
		 loves))

(define (relationship-of mother jack) relationship
	(process initial description
		 (and loves is-protective-to)))

(define introduction scene
	(process initial description
		 (sequence: (and (establish (personality jack))
		                 (establish (personality giant)))
		            (establish (relationship (relationship-of giant jack)))
		            (establish (emotional-state jack (pride (positive low))))))
	(set your mood to anticipatory)
	(set your rhythm to normal)
	(set your length to short))

(define pursuit scene
	(process initial description
		 (sequence: (convey (chases giant jack))
		            (establish (emotional-state jack (pride (positive medium))))))
	(set your mood to anticipatory)
	(set your rhythm to fast)
	(set your length to short))

(define escape scene
	(process initial description
		 (sequence: (convey (undoes jack (from-scene pursuit (convey (chases giant jack)))))
		            (and (establish (emotional-state giant (and (joy (negative high)) (pride (negative high)))))
		                 (establish (emotional-state jack (and (joy (positive high)) (pride (positive high))))))))
	(set your mood to hopeful)
	(set your rhythm to fast)
	(set your length to short))

(define happy-together scene
	(process initial description
		 (sequence: (establish (personality mother))
		            (convey (accompanys jack mother))
		            (and (establish (emotional-state jack (joy (positive high))))
		                 (establish (emotional-state mother (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define jack-and-the-giant-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (jack pursuit escape happy-together
        (relationship-of giant jack) (relationship-of jack mother))))

(compile-actors)

;; -*-lisp-*-
;; cast: first-pig = the first pig (they); second-pig = the second pig (they); third-pig = the third pig (they); wolf = the wolf (he)
;; scenes: introduction = The Pigs and the Wolf; friends-together = Three Cheerful Friends; the-chase = The Wolf Chases the Pigs; keeping-the-wolf-out = The Pigs Keep the Wolf Out; safe-together = The Wolf Gives Up
;; A stress story for the revival's repairs (README.md here): GPT-6.1 Sol's Three Little
;; Pigs (reports/llm-trials/2026-10-13 gpt-6.1-sol json/), as the model wrote it.
;; Friends Together leaves the first pig off the stage past its top left corner,
;; (xy-position -0.56 0.59), and The Chase begins with him there. Director shows him
;; there and plans to place him again each tick until he is on the stage, but with ymax
;; unevaluated, a comma left out (dichar.103:41-49), so the next tick compares his place
;; with the symbol YMAX: "not a number: YMAX", and with MEND alone (and with KNOW) the
;; film stopped as The Chase began, the two scenes after it never made. (As in 1978 the
;; pig is left elsewhere, The Chase films, and pass 2 stops on Keeping the Wolf Out,
;; BAD-MESSAGE; with APPEAR, or the page's set, he is left elsewhere too.) REVIVE;MEND20
;; places him again with the number, or, at a place that can't move, leaves him there
;; for a walk to bring on.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define first-pig character
	(process initial description
		 (physical pretty)
		 (personality (and friendly good determined))
		 (role-in-story most-important)))

(define second-pig character
	(process initial description
		 (physical pretty)
		 (personality (and friendly good determined))))

(define (relationship-of first-pig second-pig) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of second-pig first-pig) relationship
	(process initial description
		 is-helpful-towards))

(define third-pig character
	(process initial description
		 (physical pretty)
		 (personality (and friendly good determined))))

(define (relationship-of first-pig third-pig) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of third-pig first-pig) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of second-pig third-pig) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of third-pig second-pig) relationship
	(process initial description
		 is-helpful-towards))

(define wolf character
	(process initial description
		 (physical (and physically-strong ugly))
		 (personality (and mean stubborn))))

(define (relationship-of wolf first-pig) relationship
	(process initial description
		 hates))

(define (relationship-of wolf second-pig) relationship
	(process initial description
		 hates))

(define (relationship-of wolf third-pig) relationship
	(process initial description
		 hates))

(define (relationship-of first-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of second-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of third-pig wolf) relationship
	(process initial description
		 is-intolerant-of))

(define introduction scene
	(process initial description
		 (sequence: (and (establish (personality first-pig))
		                 (establish (personality wolf))
		                 (establish (relationship (relationship-of wolf first-pig))))
		            (establish (emotional-state first-pig (joy (positive medium))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to short))

(define friends-together scene
	(process initial description
		 (sequence: (and (establish (personality second-pig))
		                 (establish (personality third-pig)))
		            (and (convey (accompanys second-pig first-pig))
		                 (convey (accompanys third-pig first-pig)))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define the-chase scene
	(process initial description
		 (sequence: (and (convey (chases wolf first-pig))
		                 (convey (accompanys second-pig first-pig))
		                 (convey (accompanys third-pig first-pig)))
		            (establish (emotional-state first-pig (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to fast)
	(set your length to short))

(define keeping-the-wolf-out scene
	(process initial description
		 (sequence: (convey (prevents first-pig (meets wolf first-pig)))
		            (and (establish (emotional-state wolf (and (joy (negative high)) (pride (negative high)))))
		                 (establish (emotional-state second-pig (and (joy (positive high)) (pride (positive high)))))
		                 (establish (emotional-state third-pig (and (joy (positive high)) (pride (positive high))))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define safe-together scene
	(process initial description
		 (sequence: (convey (undoes wolf (from-scene the-chase (convey (chases wolf first-pig)))))
		            (and (convey (accompanys first-pig second-pig))
		                 (convey (accompanys first-pig third-pig)))
		            (establish (emotional-state first-pig (and (joy (positive high)) (pride (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define three-little-pigs-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
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
      (first-pig the-chase keeping-the-wolf-out safe-together
        (relationship-of first-pig wolf)
        (relationship-of first-pig second-pig)
        (relationship-of first-pig third-pig))))

(compile-actors)

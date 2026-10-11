;; -*-lisp-*-
;; cast: cinderella = Cinderella (she); step-mother = the stepmother (she); prince = the Prince (he); fairy-godmother = the fairy godmother (she)
;; scenes: at-home = At Home; change-of-heart = Change of Heart; kind-again = Kind Again
;; A mean stepmother repents (thesis p. 168: "evil characters repent and learn to lead a
;; 'good' life"). Ken's cast and descriptions (CINDY 46); the Prince causes the change,
;; written as Ken wrote his cinderella-beautified (CINDY 46:94-105). With the revival's
;; CHANGE (src/director/revive/change.lisp), Ani takes a fresh look at the stepmother
;; after Change of Heart, and she moves as a good and kind character in Kind Again.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define cinderella character
	(process initial description
		 (physical (and beautiful shabby))
		 (personality (and good friendly hard-working shy))
		 (role-in-story most-important)))

(define step-mother character
	(process initial description
		 (physical ugly)
		 (personality (and mean selfish strong evil))))

(define (relationship-of step-mother cinderella) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of cinderella step-mother) relationship
	(process initial description
		 (and is-obedient-to is-tolerant-of)))

(define fairy-godmother character
	(process initial description
		 (physical (and pretty magical))
		 (personality (and good kind strong))))

(define (relationship-of cinderella fairy-godmother) relationship
	(process initial description
		 (and is-polite-to is-grateful-to)))

(define (relationship-of fairy-godmother cinderella) relationship
	(process initial description
		 (and is-protective-of is-generous-towards is-helpful-towards)))

(define prince character
	(process initial description
		 (physical (and beautiful strong))
		 (personality (and good stubborn determined))))

(define (relationship-of cinderella prince) relationship
	(process initial description
		 loves))

(define (relationship-of prince cinderella) relationship
	(process initial description
		 loves))

(define at-home scene
	(process initial description
		 (and (establish (personality step-mother))
		      (establish (personality cinderella))
		      (establish (relationship (relationship-of step-mother cinderella)))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to medium))

(define change-of-heart scene
	(process initial description
		 (sequence:
		  (and (convey (accompanys prince step-mother))
		       (convey (causes prince
				       (change (personality step-mother (and evil mean))
					       (personality step-mother (and good kind))))))
		  (establish (emotional-state step-mother (joy (positive medium))))))
	(set your mood to (changes depressing joyous))
	(set your rhythm to normal)
	(set your length to short))

(define kind-again scene
	(process initial description
		 (and (establish (personality step-mother))
		      (convey (accompanys step-mother cinderella))
		      (establish (emotional-state cinderella (joy (positive medium))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-of-heart-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 1) (minutes 3)))
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
      (cinderella change-of-heart
		  (relationship-of cinderella step-mother)
		  (relationship-of step-mother cinderella))))

(compile-actors)

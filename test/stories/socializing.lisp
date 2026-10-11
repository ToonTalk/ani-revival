;; -*-lisp-*-
;; cast: cinderella = Cinderella (she); step-mother = the stepmother (she); prince = the Prince (he); fairy-godmother = the fairy godmother (she)
;; scenes: wallflower = The Wallflower; learning = Learning to Socialize; the-dance = The Dance
;; The shy one learns to socialize (thesis p. 168: "Shy characters learn to socialize").
;; Ken's cast and descriptions (CINDY 46); the change stands alone, with no cause, and
;; brazen is shy's own opposite in DSCRP. With the revival's CHANGE
;; (src/director/revive/change.lisp), Ani takes a fresh look at Cinderella after
;; Learning to Socialize, and she moves as a brazen character in The Dance.

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

(define wallflower scene
	(process initial description
		 (and (establish (personality cinderella))
		      (establish (emotional-state cinderella (joy (negative low))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define learning scene
	(process initial description
		 (sequence:
		  (convey (change (personality cinderella shy)
				  (personality cinderella brazen)))
		  (establish (emotional-state cinderella (joy (positive medium))))))
	(set your mood to (changes depressing joyous))
	(set your rhythm to normal)
	(set your length to short))

(define the-dance scene
	(process initial description
		 (and (establish (personality cinderella))
		      (establish (relationship (relationship-of cinderella prince)))
		      (establish (emotional-state cinderella (joy (positive high))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define socializing-film film
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
      (cinderella learning
		  (relationship-of cinderella step-mother)
		  (relationship-of step-mother cinderella))))

(compile-actors)

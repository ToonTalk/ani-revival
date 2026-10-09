;; -*-lisp-*-
;; cast: cinderella = Cinderella (she); step-mother = the stepmother (she); prince = the prince (he)
;; scenes: introduction = Introduction
;; A stress story for the revival's repairs (README.md here): a defiant Cinderella.
;; Pass 1 chooses (not high) for the stepmother's repetiveness, which pass 2's
;; WEIGHTIFY can't use (interf.149:899-904).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define cinderella character
	(process initial description
		 (physical (and beautiful shabby))
		 (personality (and determined stubborn strong))
		 (role-in-story most-important)))

(define step-mother character
	(process initial description
		 (physical ugly)
		 (personality (and mean selfish strong evil))))

(define prince character
	(process initial description
		 (physical (and beautiful strong))
		 (personality (and good stubborn determined))))

(define (relationship-of step-mother cinderella) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of cinderella step-mother) relationship
	(process initial description
		 (and hates is-impolite-to is-intolerant-of)))

(define (relationship-of cinderella prince) relationship
	(process initial description
		 loves))

(define (relationship-of prince cinderella) relationship
	(process initial description
		 loves))

(define introduction scene
	(process initial description
		 (and (establish (personality step-mother))
		      (establish (emotional-state cinderella (joy (negative low))))))
	(set your rhythm to normal)
	(set your length to long))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define not-high-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 1) (minutes 2)))
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
      (cinderella introduction
                 (relationship-of cinderella step-mother)
                 (relationship-of step-mother cinderella))))

(compile-actors)

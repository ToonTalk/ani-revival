;; -*-lisp-*-
;; cast: snow-white = Snow White (she); queen = the queen (she); hunter = the hunter (he); dwarf = the dwarf (he); prince = the prince (he); witch = the witch (she)
;; scenes: the-castle = The Castle; the-forest = The Forest
;; The reviewer's stress story for Phase 9 stage 5 (APPEAR's colors): six characters, as many
;; as SHAPES has shapes; a beautiful, magical, evil queen (dark and clear, purple: the darkest
;; a look can read on black, which the film page draws lighter), an ugly, shabby, magical
;; witch, and four others whose hues only the film's variety gives. Telling the Prince apart
;; from the hunter, the shape experts relax both of his shape constraints, which once made
;; the page's "How he looks" throw (tools/check-film-app.mjs checks it).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define snow-white character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind shy))
		 (role-in-story most-important)))

(define queen character
	(process initial description
		 (physical (and beautiful magical))
		 (personality (and evil mean selfish))))

(define hunter character
	(process initial description
		 (physical strong)
		 (personality kind)))

(define dwarf character
	(process initial description
		 (physical ugly)
		 (personality (and good friendly))))

(define prince character
	(process initial description
		 (physical (and beautiful strong))
		 (personality good)))

(define witch character
	(process initial description
		 (physical (and ugly shabby magical))
		 (personality (and evil mean))))

(define (relationship-of queen snow-white) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of snow-white queen) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of dwarf snow-white) relationship
	(process initial description
		 loves))

(define (relationship-of prince snow-white) relationship
	(process initial description
		 loves))

(define the-castle scene
	(process initial description
		 (and (establish (personality queen))
		      (establish (relationship (relationship-of queen snow-white)))
		      (establish (emotional-state snow-white (joy (negative high))))))
	(set your rhythm to normal)
	(set your length to medium))

(define the-forest scene
	(process initial description
		 (and (convey (accompanys dwarf snow-white))
		      (establish (emotional-state queen (joy (negative high))))
		      (establish (emotional-state snow-white (joy (positive high))))))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define six-colors-film film
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
      (snow-white the-castle (relationship-of queen snow-white))))

(compile-actors)

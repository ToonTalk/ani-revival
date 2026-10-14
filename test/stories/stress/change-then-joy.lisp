;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge; made-elegant = Made Elegant; later-on = Later On
;; A stress story for REVIVE;CHSHOW (README.md here), from the review of stage 6 (M3, its
;; r14): the form of Ken's cinderella-beautified, the change and then the feeling, with a
;; cause who isn't magical: the kid makes the goat elegant, gradually, and then she is very
;; happy. The joy's part, changes only, extends the transformation's (scene.9:223-240)
;; and ends first; Ken's ACTION then stopped the film in the middle of the change, her
;; colors half cleared (action.152:62-91). The film now waits for the bridges, a repair of
;; the revival's noted film-waited-for-bridge.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical (and beautiful shabby))
		 (personality (and good kind shy))
		 (role-in-story most-important)))

(define troll character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean strong))))

(define kid character
	(process initial description
		 (physical strong)
		 (personality (and good friendly))))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of kid goat) relationship
	(process initial description
		 loves))

(define (relationship-of goat kid) relationship
	(process initial description
		 loves))

(define on-the-bridge scene
	(process initial description
		 (convey (chases troll goat)))
	(set your rhythm to normal)
	(set your length to short))

(define made-elegant scene
	(process initial description
		 (sequence: (convey (causes kid (change (physical goat shabby) (physical goat elegant)))) (establish (emotional-state goat (joy (positive high))))))
	(set your rhythm to normal)
	(set your length to short))

(define later-on scene
	(process initial description
		 (establish (personality goat)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-then-joy-film film
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
      (goat made-elegant (relationship-of troll goat))))

(compile-actors)

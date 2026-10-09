;; -*-lisp-*-
;; cast: red-riding-hood = Red Riding Hood (she); wolf = the wolf (he); grandmother = the grandmother (she); woodcutter = the woodcutter (he)
;; scenes: into-the-woods = Into the Woods; the-wolf-waits = The Wolf Waits; the-woodcutter-comes = The Woodcutter Comes; together-again = Together Again
;; A new story for Ani, written in CINDY's form with only the words Ani knows: a test
;; that the pipeline can plan and film a story other than Cinderella (new characters,
;; new scenes, and a from-scene reference like no-longer-kept-apart's).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define red-riding-hood character
	(process initial description
		 (physical pretty)
		 (personality (and good friendly shy))
		 (role-in-story most-important)))

(define wolf character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and evil mean selfish))))

(define grandmother character
	(process initial description
		 (physical shabby)
		 (personality (and kind good))))

(define woodcutter character
	(process initial description
		 (physical physically-strong)
		 (personality (and good determined strong))))

(define (relationship-of wolf red-riding-hood) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of red-riding-hood wolf) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of red-riding-hood grandmother) relationship
	(process initial description
		 loves))

(define (relationship-of grandmother red-riding-hood) relationship
	(process initial description
		 loves))

(define (relationship-of woodcutter red-riding-hood) relationship
	(process initial description
		 is-protective-to))

(define (relationship-of red-riding-hood woodcutter) relationship
	(process initial description
		 is-grateful-to))

;; Ani asks how a friendly character feels about each of the others (SUGEST's
;; first-sibling-that-satisfies-relationship), so every pair is related both ways.
;; Only the wolf hates anyone: Ani gives a mean character the first one it hates or
;; is hated by as a victim, whether or not that one is in the scene.

(define (relationship-of wolf grandmother) relationship
	(process initial description
		 dominates))

(define (relationship-of grandmother wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of wolf woodcutter) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of woodcutter wolf) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of grandmother woodcutter) relationship
	(process initial description
		 is-grateful-to))

(define (relationship-of woodcutter grandmother) relationship
	(process initial description
		 is-helpful-towards))

(define into-the-woods scene
	(process initial description
		 (and (establish (personality red-riding-hood))
		      (establish (emotional-state red-riding-hood (joy (positive medium))))
		      (establish (personality wolf))
		      (establish (relationship (relationship-of wolf red-riding-hood)))))
	(set your rhythm to normal)
	(set your length to medium))

(define the-wolf-waits scene
	(process initial description
		 (sequence: (convey (wants red-riding-hood (meets red-riding-hood grandmother)))
			    (convey (prevents wolf (meets red-riding-hood grandmother)))
			    (establish (emotional-state red-riding-hood (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to (changes fast slow))
	(set your length to long))

(define the-woodcutter-comes scene
	(process initial description
		 (convey (undoes woodcutter
				 (from-scene the-wolf-waits
					     (convey (prevents wolf
							       (meets red-riding-hood grandmother)))))))
	(set your mood to (and joyous anticipatory))
	(set your rhythm to fast)
	(set your length to short))

(define together-again scene
	(process initial description
		 (sequence: (convey (accompanys red-riding-hood grandmother))
			    (and (establish (relationship (relationship-of red-riding-hood grandmother)))
				 (establish (emotional-state red-riding-hood (joy (positive high)))))))
	(set your mood to joyous)
	(set your rhythm to fast)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define red-riding-hood-film film
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
      (red-riding-hood the-woodcutter-comes the-wolf-waits
                 (relationship-of red-riding-hood wolf)
                 (relationship-of wolf red-riding-hood))))

(compile-actors)

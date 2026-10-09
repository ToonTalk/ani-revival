;; -*-lisp-*-
;; cast: hare = the hare (he); tortoise = the tortoise (he)
;; scenes: the-boast = The Boast
;; A stress story for the revival's repairs (README.md here): the hare of
;; test/stories/tortoise-and-hare.lisp, for whose activity level pass 1 gives up
;; (none), which pass 2's WEIGHTIFY can't use (interf.149:899-904).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hare character
	(process initial description
		 (physical (and gorgeous physically-strong))
		 (personality (and brazen lazy mean))))

(define tortoise character
	(process initial description
		 (physical shabby)
		 (personality (and good hard-working determined))
		 (role-in-story most-important)))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of tortoise hare) relationship
	(process initial description
		 is-tolerant-of))

(define the-boast scene
	(process initial description
		 (and (establish (personality hare))
		      (establish (emotional-state tortoise (joy (negative medium))))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define none-value-film film
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
      (tortoise the-boast (relationship-of hare tortoise))))

(compile-actors)

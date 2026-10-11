;; -*-lisp-*-
;; cast: tortoise = the tortoise (he); hare = the hare (he)
;; scenes: introduction = The Hare and the Tortoise; pushed-around = Pushed Around; tortoise-triumphant = The Tortoise Triumphs
;; A story for the revival's repairs (README.md here): Ken's own tortoise and hare, made
;; by a model on the film page on 11 October 2026, as it came. Ani as in 1978 stops in
;; pass 2 of the Introduction: the lazy hare's activity level is none (REVIVE;MEND2).
;; With MEND, the page's film of Pushed Around stopped at two and a half minutes, "never
;; ended". It does end, at frame 799 (200 seconds): its second push is stretched, since
;; the next subscene is only the tortoise's sadness, and each of the push's seven cycles
;; takes a third longer than the one before, as Director's special dynamics take their
;; parent's factors again each time a cycle sets them (dichar.103:27-31). Director as in
;; 1978 films it the same, frame for frame. MEND doesn't change a scene that ends on its
;; own (tools/check-no-change.mjs pushed-around).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define tortoise character
	(process initial description
		 (physical physically-weak)
		 (personality (and good hard-working determined))
		 (role-in-story most-important)))

(define hare character
	(process initial description
		 (physical physically-strong)
		 (personality (and brazen mean lazy))))

(define (relationship-of hare tortoise) relationship
	(process initial description
		 (and dominates hates is-impolite-to)))

(define (relationship-of tortoise hare) relationship
	(process initial description
		 is-tolerant-of))

(define introduction scene
	(process initial description
		 (and (establish (personality tortoise))
		      (establish (personality hare))
		      (establish (relationship (relationship-of hare tortoise)))
		      (establish (relationship (relationship-of tortoise hare)))
		      (establish (emotional-state hare (joy (positive high))))))
	(set your mood to normal)
	(set your rhythm to fast)
	(set your length to medium))

(define pushed-around scene
	(process initial description
		 (sequence:
		  (convey (pushes hare tortoise))
		  (convey (pushes hare tortoise))
		  (establish (emotional-state tortoise (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to medium))

(define tortoise-triumphant scene
	(process initial description
		 (sequence:
		  (and (establish (personality tortoise))
		       (establish (personality hare)))
		  (and (establish (emotional-state tortoise (joy (positive high))))
		       (establish (emotional-state hare (joy (negative high)))))))
	(set your mood to joyous)
	(set your rhythm to slow)
	(set your length to long))

(declare (coutput (read)))

(define tortoise-and-hare-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high) ;; medium-fast was here but not supported so...
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (tortoise pushed-around tortoise-triumphant
                (relationship-of hare tortoise)
                (relationship-of tortoise hare))))

(compile-actors)

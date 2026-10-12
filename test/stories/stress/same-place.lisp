;; -*-lisp-*-
;; cast: owl = the owl (she); fox = the fox (he); rabbit = the rabbit (she)
;; scenes: alone-in-the-tree = Alone in the Tree; the-games = The Games
;; A stress story for the revival's repairs (README.md here): a shy owl's story, as a
;; model wrote it on the film page, cut to its first two scenes. The fox and the rabbit
;; are in no task of the first scene, so its POSIT file has both at the picture's center
;; (ANINIT's save-positions, aninit.65:158-175), and in The Games the fox goes to the
;; rabbit to accompany her (goes-to-and-accompanys, disply.311:186-233) from where she
;; stands. Contact with someone at the same place is a division by zero
;; (move-from-xy-position, interf.149:89-106), and Director, drawing the fox facing a
;; place that is not a number, hangs before the film's first frame. Ani as in 1978
;; stops before that, in pass 1: the owl and the fox have nothing to compare
;; (REVIVE;MEND8). REVIVE;MEND13 reckons the place as Ken's turtle would.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define owl character
	(process initial description
		 (physical (and shabby beautiful))
		 (personality (and shy quiet good))
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (physical pretty)
		 (personality (and friendly determined))))

(define rabbit character
	(process initial description
		 (physical pretty)
		 (personality (and friendly kind hard-working))))

(define (relationship-of fox rabbit) relationship
	(process initial description
		 loves))

(define (relationship-of rabbit fox) relationship
	(process initial description
		 loves))

(define (relationship-of rabbit owl) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of owl rabbit) relationship
	(process initial description
		 is-polite-to))

(define alone-in-the-tree scene
	(process initial description
		 (and (establish (personality owl))
		      (establish (emotional-state owl (joy (negative medium))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to short))

(define the-games scene
	(process initial description
		 (sequence: (convey (accompanys fox rabbit))
			    (establish (emotional-state owl (joy (positive medium))))))
	(set your mood to (changes depressing joyous))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define shy-owl-film film
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
      (owl the-games
           (relationship-of owl rabbit))))

(compile-actors)

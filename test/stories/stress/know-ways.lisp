;; -*-lisp-*-
;; cast: duckling = the duckling (he); mother = the mother duck (she); cat = the cat (she)
;; scenes: by-the-pond = By the Pond; the-cat-comes = The Cat Comes
;; A stress story for the revival's knowledge (KNOW, README.md here): the relationships
;; KNOW gives a way of showing, and the display methods that show them. By the Pond:
;; the duckling is obedient to his mother and likes her (he follows her; liking is
;; shown by accompanying, a weaker suggestion), and she is helpful towards him (she
;; helps him along); the cat is not yet on the stage. The Cat Comes: the duckling fears
;; the cat and the cat dislikes him (each moves away from the other). In 1978 pass 1
;; stops: the duckling and the cat have no word in common to compare them by (MEND's
;; M8). With MEND alone, these relationships suggest nothing to show, so neither scene
;; has anything to show.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define duckling character
	(process initial description
		 (physical ugly)
		 (personality (and good shy))
		 (role-in-story most-important)))

(define mother character
	(process initial description
		 (physical beautiful)
		 (personality (and kind strong))))

(define cat character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean curious))))

(define (relationship-of duckling mother) relationship
	(process initial description
		 (and is-obedient-to likes)))

(define (relationship-of mother duckling) relationship
	(process initial description
		 is-helpful-towards))

(define (relationship-of duckling cat) relationship
	(process initial description
		 fears))

(define (relationship-of cat duckling) relationship
	(process initial description
		 dislikes))

(define by-the-pond scene
	(process initial description
		 (and (establish (relationship (relationship-of duckling mother)))
		      (establish (relationship (relationship-of mother duckling)))))
	(set your rhythm to normal)
	(set your length to medium))

(define the-cat-comes scene
	(process initial description
		 (and (establish (relationship (relationship-of duckling cat)))
		      (establish (relationship (relationship-of cat duckling)))))
	(set your rhythm to fast)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define know-ways-film film
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
      (duckling by-the-pond the-cat-comes (relationship-of duckling mother))))

(compile-actors)

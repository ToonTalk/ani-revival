;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: by-the-bridge = By the Bridge; on-the-bridge = On the Bridge
;; A stress story for the revival's repairs (README.md here): the troll and the kid are
;; alone, (convey (alone troll kid)), which sends off the goat although she has never
;; been on the stage; then the troll shows he is mean, and she is his victim. No one was
;; shown in the first scene, so its POSIT file has all three at the picture's center,
;; and placing the goat a distance away from the troll at the same place, Ani keeps
;; halving a step that is not a number (move-from-xy-position-1, interf.149:109-118):
;; pass 2 overflows the stack. REVIVE;MEND13 reckons the place as Ken's turtle would.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define troll character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean strong))))

(define kid character
	(process initial description
		 (physical beautiful)
		 (personality kind)))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of troll kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of goat kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid goat) relationship
	(process initial description
		 is-polite-to))

(define by-the-bridge scene
	(process initial description
		 (convey (alone troll kid)))
	(set your rhythm to normal)
	(set your length to short))

(define on-the-bridge scene
	(process initial description
		 (establish (personality troll)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define pushee-blocked-film film
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
      (goat on-the-bridge (relationship-of troll goat))))

(compile-actors)

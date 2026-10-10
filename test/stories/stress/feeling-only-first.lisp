;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the revival's repairs (README.md here): the scene only shows
;; how the goat and the troll feel. Each one's part in the first subscene is a change
;; of how it moves, so SCENE plans (wander-around goat) and (wander-around troll)
;; (scene.9:199-218), and no 1978 file defines wander-around. In a story's first
;; scene neither has a place yet.

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

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define on-the-bridge scene
	(process initial description
		 (and (establish (emotional-state goat (joy (negative medium))))
		      (establish (emotional-state troll (joy (positive low))))))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define feeling-only-first-film film
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

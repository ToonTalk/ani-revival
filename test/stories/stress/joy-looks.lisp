;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for APPEAR's look changes (README.md here): the goat is very happy
;; and the troll very sad, so each joy also changes its character's color intensity
;; (REVIVE;ALTER, thesis p. 166: "the intensity of the colors of the character be
;; increased"), beside joy's changes of how it moves, by the same amount at the same
;; speed, so the scene is no longer for them. The goat is good, and bright already;
;; she brightens as far as the TV's full intensity. Without APPEAR it is the skeleton
;; story with its feelings changed.

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
		 (and (establish (personality troll))
		      (establish (emotional-state goat (joy (positive high))))
		      (establish (emotional-state troll (joy (negative high))))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define joy-looks-film film
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

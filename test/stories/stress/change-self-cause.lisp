;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge; himself = Himself; later-on = Later On
;; A stress story for REVIVE;CHSHOW (README.md here), from the review of stage 6 (B1, its
;; r4): the troll makes himself kind, (causes troll (change (personality troll mean)
;; (personality troll kind))). A cause who is the one changed doesn't go to himself: he
;; wanders as he changes. His fresh look changes only how he looks (with APPEAR) and
;; what Director doesn't read, so his bridges are his look's alone, which pass 2 timed
;; before ELEMNT, where APPEAR defines a look's elements, had loaded, and stopped on
;; NO-SUCH-ACTOR (SHAPE-JAGGEDNESS is not an actor) until a look's element was sent to
;; appearance-element.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind shy))
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
		 (convey (chases troll goat)))
	(set your rhythm to normal)
	(set your length to short))

(define himself scene
	(process initial description
		 (convey (causes troll (change (personality troll mean) (personality troll kind)))))
	(set your rhythm to normal)
	(set your length to short))

(define later-on scene
	(process initial description
		 (establish (personality troll)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-self-cause-film film
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
      (goat himself (relationship-of troll goat))))

(compile-actors)

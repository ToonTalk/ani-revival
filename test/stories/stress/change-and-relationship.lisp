;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge; friends-at-last = Friends at Last; together = Together
;; A stress story for REVIVE;CHANGE (README.md here), after a model's tortoise and hare:
;; the troll chases the goat; then a scene establishes his relationship to her while it
;; changes from hates to loves. Establishing it by conveying puts its convey tasks in
;; the establish task's place, and SCENE orders the tasks again, asking every word of
;; each convey task's description if it is a character (participants-of-task,
;; scene.9:513-532). The change names (relationship-of troll goat), and relationship-of,
;; which the tags say CINDY defines, stopped pass 2: NO-SUCH-ACTOR. CHANGE counts the
;; troll and the goat as who takes part. Together establishes the relationship again,
;; as the troll has become: he loves her. Without CHANGE a change standing alone stops
;; pass 1, as CHANGE's README says.

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
		 (convey (chases troll goat)))
	(set your rhythm to normal)
	(set your length to short))

(define friends-at-last scene
	(process initial description
		 (and (establish (relationship (relationship-of troll goat)))
		      (convey (change (relationship (relationship-of troll goat) hates)
				      (relationship (relationship-of troll goat) loves)))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to short))

(define together scene
	(process initial description
		 (and (establish (relationship (relationship-of troll goat)))
		      (establish (emotional-state goat (joy (positive medium))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-and-relationship-film film
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
      (goat friends-at-last (relationship-of troll goat))))

(compile-actors)

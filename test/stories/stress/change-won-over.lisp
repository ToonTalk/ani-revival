;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge; won-over = Won Over; together = Together
;; A stress story for REVIVE;CHSHOW (README.md here), a relationship change with a
;; cause: the troll chases the goat; then the goat goes to him and he comes to love her,
;; (causes goat (change (relationship (relationship-of troll goat) hates) (relationship
;; (relationship-of troll goat) loves))). A relationship change chooses both of its
;; characters again (REVIVE;CHANGE), and how one feels about another doesn't reach
;; how either moves (CHANGE's README, "makes-up"), so there is nothing to bridge: once
;; they touch he walks across the stage, so that the change is seen. Together shows the
;; relationship as it has become. Without CHANGE the goat's task is "cant-do".

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

(define won-over scene
	(process initial description
		 (convey (causes goat
				 (change (relationship (relationship-of troll goat) hates)
					 (relationship (relationship-of troll goat) loves)))))
	(set your rhythm to normal)
	(set your length to short))

(define together scene
	(process initial description
		 (establish (relationship (relationship-of troll goat))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-won-over-film film
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
      (goat won-over (relationship-of troll goat))))

(compile-actors)

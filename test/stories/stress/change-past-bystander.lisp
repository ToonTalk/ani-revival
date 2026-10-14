;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge; brave-now = Brave Now; later-on = Later On
;; A stress story for REVIVE;CHSHOW (README.md here), from the review of stage 6 (M4, its
;; r2): the kid makes the goat brazen in Brave Now, where On the Bridge left the troll
;; standing between them. The kid walks to her regardless of collisions, as Ken's
;; goes-to-to-hit does, and touches her; walking carefully, as goes-to-to-accompany does,
;; he was kept from her by the troll until REVIVE;MEND12 stopped his walk 46 dots from
;; her, and the change began with no touch.

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

(define kid character
	(process initial description
		 (physical strong)
		 (personality (and good friendly))))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of kid goat) relationship
	(process initial description
		 loves))

(define (relationship-of goat kid) relationship
	(process initial description
		 loves))

(define on-the-bridge scene
	(process initial description
		 (convey (chases troll goat)))
	(set your rhythm to normal)
	(set your length to short))

(define brave-now scene
	(process initial description
		 (convey (causes kid (change (personality goat shy) (personality goat brazen)))))
	(set your rhythm to normal)
	(set your length to short))

(define later-on scene
	(process initial description
		 (establish (personality goat)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-past-bystander-film film
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
      (goat brave-now (relationship-of troll goat))))

(compile-actors)

;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge; repentance = Repentance
;; A stress story for REVIVE;CHSHOW (README.md here), a change in the last scene: the
;; troll chases the goat; then, in the film's last scene, she goes to him and he
;; repents, from mean and strong to good and kind, gradually, as he wanders about. Ani
;; takes her fresh look at him and shows the change, and no later scene learns who he
;; has become. Without CHANGE the goat's task is "cant-do".

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

(define repentance scene
	(process initial description
		 (convey (causes goat
				 (change (personality troll (and mean strong))
					 (personality troll (and good kind))))))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-last-scene-film film
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
      (goat repentance (relationship-of troll goat))))

(compile-actors)

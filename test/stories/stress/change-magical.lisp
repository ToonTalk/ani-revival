;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); fairy = the fairy (she)
;; scenes: on-the-bridge = On the Bridge; the-spell = The Spell; afterwards = Afterwards
;; A stress story for REVIVE;CHSHOW (README.md here), a magical cause: the troll chases
;; the goat; then the fairy, who is magical, goes to the troll and makes him beautiful,
;; the change change-alone.lisp has him make on his own, gradually; since she is magical
;; it is instantaneous ("in one frame the character has one appearance and in the next
;; frame a different appearance", thesis p. 166; that a magical cause's change is
;; instantaneous is the revival's rule), and he wanders about as he has become.
;; Afterwards he is shown as he has become. Without CHANGE the fairy's task is
;; "cant-do": Ani has no way to show a cause.

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

(define fairy character
	(process initial description
		 (physical (and pretty magical))
		 (personality (and good kind))))

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

(define the-spell scene
	(process initial description
		 (convey (causes fairy
				 (change (physical troll ugly)
					 (physical troll beautiful)))))
	(set your rhythm to normal)
	(set your length to short))

(define afterwards scene
	(process initial description
		 (establish (personality troll)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-magical-film film
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
      (goat the-spell (relationship-of troll goat))))

(compile-actors)

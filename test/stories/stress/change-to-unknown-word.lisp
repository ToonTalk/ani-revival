;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge; sour-mood = Sour Mood; later-on = Later On
;; A stress story for REVIVE;CHSHOW (README.md here), from the review of stage 6 (B1, its
;; r8): the goat becomes grumpy, a word Ani doesn't know, (change (personality goat shy)
;; (personality goat grumpy)). Without shy she is no longer small and plain: her look
;; changes, and nothing Director moves her by, so her bridges are her look's alone; pass 2
;; stopped on NO-SUCH-ACTOR (SHAPE-COMPLEXITY is not an actor) until a look's element was
;; sent to appearance-element.

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

(define sour-mood scene
	(process initial description
		 (convey (change (personality goat shy) (personality goat grumpy))))
	(set your rhythm to normal)
	(set your length to short))

(define later-on scene
	(process initial description
		 (establish (personality goat)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-to-unknown-word-film film
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
      (goat sour-mood (relationship-of troll goat))))

(compile-actors)

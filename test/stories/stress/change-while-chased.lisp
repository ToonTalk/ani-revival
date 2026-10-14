;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: first-meeting = First Meeting; the-chase = The Chase; later-on = Later On
;; A stress story for REVIVE;CHSHOW (README.md here), from the review of stage 6 (m11, its
;; r10): in The Chase the troll chases the goat while the kid makes her brazen. She runs
;; away, and her running away carries the change: she doesn't wander, which would replace
;; the chase's goal (it cut the chase at frame 5 of 61).

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

(define first-meeting scene
	(process initial description
		 (convey (accompanys kid goat)))
	(set your rhythm to normal)
	(set your length to short))

(define the-chase scene
	(process initial description
		 (and (convey (chases troll goat)) (convey (causes kid (change (personality goat shy) (personality goat brazen))))))
	(set your rhythm to normal)
	(set your length to short))

(define later-on scene
	(process initial description
		 (establish (personality goat)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-while-chased-film film
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
      (goat the-chase (relationship-of troll goat))))

(compile-actors)

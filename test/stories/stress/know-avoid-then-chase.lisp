;; -*-lisp-*-
;; cast: goat = the goat (she); kid = the kid (he); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the revival's knowledge (KNOW, README.md here), from a reviewer of
;; KNOW: the goat fears the troll, so she moves away from him (moves-away-from), and then
;; the kid chases the troll. KNOW's other-approaches, the troll's few steps towards her,
;; once walked to a moving target, (small-way-from (vicinity-of troll) (vicinity-of goat)),
;; which left the troll there for the chase, and INTERF can measure from such a place only
;; to its two anchors: the chase stopped pass 2 (break small-way-from-cant-do-yet,
;; interf.149:336-342). The walk now goes to a place fixed as it starts (REVIVE;KNOWDI).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical beautiful)
		 (personality (and good friendly))))

(define troll character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean strong))))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 fears))

(define (relationship-of kid goat) relationship
	(process initial description
		 loves))

(define (relationship-of goat kid) relationship
	(process initial description
		 loves))

(define on-the-bridge scene
	(process initial description
		 (sequence:
		  (establish (relationship (relationship-of goat troll)))
		  (convey (chases kid troll))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define avoid-then-chase-film film
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
      (goat on-the-bridge (relationship-of goat troll))))

(compile-actors)

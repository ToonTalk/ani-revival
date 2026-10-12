;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: by-the-bridge = By the Bridge; on-the-bridge = On the Bridge
;; A stress story for the revival's repairs (README.md here): the goat goes to the kid
;; and walks with him; then the kid keeps the troll from meeting the goat,
;; (convey (prevents kid (meets troll goat))). Of can-move's three ways (prereq.19:82-107),
;; the kid isn't faster than the troll, so stands-guard's prerequisite fails, and Ani
;; chooses makes-fence, which DISPLY never gives a run receiver (disply.311:18-25): pass
;; 2 stops with BAD-MESSAGE when the subscene runs its methods. REVIVE;MEND14 sets the
;; fence aside; with nothing else that can show it, the task is left undone.

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

(define kid character
	(process initial description
		 (physical beautiful)
		 (personality kind)))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of troll kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of goat kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid goat) relationship
	(process initial description
		 is-polite-to))

(define by-the-bridge scene
	(process initial description
		 (convey (accompanys goat kid)))
	(set your rhythm to normal)
	(set your length to short))

(define on-the-bridge scene
	(process initial description
		 (convey (prevents kid (meets troll goat))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define pushee-blocked-film film
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

;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the revival's repairs (README.md here): the scene establishes
;; the kid's personality, then the troll's. The kid is only kind, and kind's ways of
;; showing find no one for him, so his task can't be done; the troll's tasks are much
;; shorter than a medium scene, so Ani adjusts every task's length, and
;; adjust-task-lengths passes over the kid's, leaving it no running time
;; (chomet.123:141-160). The kid's task has the first subscene to itself, and that
;; subscene's running time is the longest of its tasks' (scene.9:137-140).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define kid character
	(process initial description
		 (physical beautiful)
		 (personality kind)))

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

(define (relationship-of troll kid) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of goat kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid goat) relationship
	(process initial description
		 is-polite-to))

(define on-the-bridge scene
	(process initial description
		 (sequence: (establish (personality kid))
			    (establish (personality troll))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define cant-do-adjusted-film film
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

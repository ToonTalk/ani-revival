;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the revival's repairs (README.md here): the scene's only task is
;; to establish how the troll feels about the goat. He dominates her, and of Ken's words
;; for a relationship dominates has one way of showing it, pushing (relate.22), so
;; CHOMET hands the establish task's place in the scene to one convey task
;; (choose-a-few-convey-methods, chomet.123:474-513). The scene's task ordering was the
;; establish task alone, an atom, and once the convey task takes its place, SCENE's
;; simplify-task-ordering takes the rest of it as of a list (scene.9:396-402, 535-538):
;; pass 2 stops, "cdr of non-list". REVIVE;MEND18 takes a lone task as the ordering it
;; is, as reorder-task-ordering-1 already does (scene.9:474). The film is 20 to 40
;; seconds long, not the skeleton's minute or two: its one scene would get the whole
;; minute, the pushing would be stretched two and a half times, and Director slows a
;; stretched push-around by a quarter each cycle (dichar.103:27-31), 659 frames.

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
		 dominates))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define on-the-bridge scene
	(process initial description
		 (establish (relationship (relationship-of troll goat))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define only-relationship-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (seconds 20) (seconds 40)))
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

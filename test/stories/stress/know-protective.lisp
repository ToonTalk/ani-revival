;; -*-lisp-*-
;; cast: troll = the troll (he); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the revival's knowledge (KNOW, README.md here): the troll is
;; protective of the kid, CINDY's word for the fairy godmother (cindy.46:36-38), which
;; RELATE doesn't know, and the scene's only task establishes it. With KNOW,
;; is-protective-of is a neighbor of RELATE's is-protective-to (Ken's decision 10), and,
;; having no way of showing itself, borrows is-protective-to's, accompanying (REVIVE;KNOW,
;; dscrp.17:183): the glass box records the borrowing (src/pipeline.js collectBorrowed),
;; and the page says it. That one way is one convey task, the scene's only task, which
;; MEND's M18 takes as the scene's whole order of tasks (scene.9:535-538). In 1978 and
;; with MEND alone is-protective-of has no way of showing, and the scene has nothing to
;; show.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define troll character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and strong kind))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy kind))))

(define (relationship-of troll kid) relationship
	(process initial description
		 is-protective-of))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-polite-to))

(define on-the-bridge scene
	(process initial description
		 (establish (relationship (relationship-of troll kid))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define know-protective-film film
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
      (troll on-the-bridge (relationship-of troll kid))))

(compile-actors)

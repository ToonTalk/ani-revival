;; -*-lisp-*-
;; cast: troll = the troll (he); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the revival's knowledge (KNOW, README.md here), the first scene of
;; a model's Lion and the Mouse on the skeleton's lines: the troll dominates the kid, is
;; generous towards him and is protective to him, and the scene establishes it, and then
;; that the kid is happy. With KNOW each of the three words has a way of showing
;; (pushing, dominates'; helping, is-helpful-towards', which its neighbor
;; is-generous-towards borrows; accompanying, is-protective-to's, Ken's decision 10), more
;; than the few CHOMET takes, and CHOMET's explore-method-suggestions, for more than a
;; few, was never written (MEND's M17). In 1978 and with MEND alone only dominates has a
;; way, and the troll pushes the kid. (The kid's joy is there so that the scene has two
;; tasks: a scene whose only task is established by one convey task stops in 1978 and
;; with MEND, in simplify-task-ordering, an open item for MEND.)

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
		 (and dominates is-generous-towards is-protective-to)))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-polite-to))

(define on-the-bridge scene
	(process initial description
		 (sequence: (establish (relationship (relationship-of troll kid)))
			    (establish (emotional-state kid (joy (positive medium))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define know-three-ways-film film
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

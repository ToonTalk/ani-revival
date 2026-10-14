;;; -*-lisp-*-
;;; REVIVE;MEND19: M19, far off and off the stage, which PLACE asks for and never defines.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The failure. Before a display method moves two characters, it places whichever has
;;; no place yet: place-small-, place-medium- and place-large-distance-apart hand
;;; initial-locations-for-two-characters a constraint for each, one if the subscene
;;; starts with a cut and one if it doesn't (place.45:9-55, 116-149). With no cut the
;;; one placed must come on from off the stage, so the constraint is
;;; (small-distance-and-offstage place), (medium-distance-and-offstage place) or
;;; (large-distance-and-offstage place), and pick-location-for asks the constraint's
;;; actor to choose the location (place.45:248-266). PLACE defines small-distance-
;;; and-offstage and medium-distance-and-offstage (place.45:488-520) but not
;;; large-distance-and-offstage, so pass 2 stops: "LARGE-DISTANCE-AND-OFFSTAGE is not
;;; an actor". place-large-distance-apart places the two for move-to-each-other and
;;; move-small-part-towards (disply.311:686-691, 721-726), the first part of getting
;;; it on and of meeting (convey.64:69-71, 216-218), and DISPLY's stands guard asks for
;;; it too, for a prisoner with no place (disply.311:573-578). In Ken's Cinderella every
;;; character those place already has one, or the subscene starts with a cut. A new
;;; story gets there when someone not yet on the stage wants to meet someone who is:
;;; the troll, wanting to meet the kid, moves a small way towards him, in a scene where
;;; the kid and the goat have walked together first and the troll has no part before
;;; (test/stories/stress/far-off.lisp).
;;;
;;; The repair. large-distance-and-offstage is a constraint as PLACE's
;;; medium-distance-and-offstage is, with a receiver of the same form (place.45:511-520),
;;; and the place PLACE's large-distance takes on the stage, good-distance-from
;;; (place.45:466-474), taken off the stage: INTERF's good-distance-from-and-offstage,
;;; "a position that is off stage and far from place" (interf.149:630-654), which
;;; Ken wrote and DISPLY uses for a chasee sent off (disply.311:388-389). If the other
;;; has no place either, it is the default medium-distance-and-offstage gives, the
;;; middle below the stage. As with Ken's offstage constraints, nothing is asked of a
;;; character that already has a place (no cut-if-true): initial-locations-for-two-
;;; characters and stands guard ask only for one that has none. The subscene notes
;;;   (revival-repair: what defined-constraint was (large-distance-and-offstage
;;;		       not-defined) now (troll at (good-distance-from-and-offstage
;;;		       (vicinity-of kid))) because (named-in place))

(defun define-large-distance-and-offstage ()
  (let ((:insert-methods-at-end nil))
       (define large-distance-and-offstage constraint)
       (define-receiver (choose location of ?character
				so that (large-distance-and-offstage (vicinity-of ?other))
				because ?reason in ?subscene)
			large-distance-and-offstage
	(choose-location-of-a-character character other reason subscene
					'(off-screen-position lower middle)
					'(good-distance-from-and-offstage (vicinity-of ,other))
					nil)
	(revival-note subscene 'defined-constraint
		      '(large-distance-and-offstage not-defined)
		      '(,character at
				   ,(get (ask ,subscene recall your (location-of ,character))
					 'where))
		      '(named-in place)))))

;; large-distance-and-offstage is a top-level actor of PLACE's that PLACE doesn't define,
;; so the tags give it PLACE as its file, as they give PLACE's own constraints
;; (src/director/tags/ani.lisp, as load.33 fills them), and as REVIVE;MEND5 gives
;; move-to DISPLY: exists? then knows it before PLACE has loaded, and asking it loads
;; PLACE, after which it is defined.
(defprop large-distance-and-offstage |KEN;PLACE| actor-load)

(+after-load '|ken;place >|
  '(revival-once 'mend19-large-distance-and-offstage 'define-large-distance-and-offstage))

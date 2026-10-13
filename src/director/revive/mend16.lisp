;;; -*-lisp-*-
;;; REVIVE;MEND16: M16, how far a small way from one place towards another is from a third.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The failure. INTERF says how far (small-way-from p1 p2), a small way from p1
;;; towards p2, is from p1 or from p2, and from any third place stops: (break
;;; small-way-from-cant-do-yet) (interf.149:336-342). Ken's move-small-part-towards
;;; walks its mover to (small-way-from (vicinity-of mover) place) as a moving target
;;; (disply.311:694-719), and a walk to a moving target leaves the mover, for the
;;; subscenes after it in the scene, at the place as written, "since its moving"
;;; (new-place-package, place.45:175-183), a symbolic place, "not looked up more"
;;; (location-of, interf.149:142-155). A later method that measures from the mover to
;;; anyone but its anchors then stops pass 2. Ken's film measures from it only to its
;;; anchors (Kept Apart, where the guard measures from Cinderella to the Prince, whom
;;; she wanted to meet). A reviewer's Hansel and Gretel stops: in The Gingerbread House
;;; the witch, wanting to meet Hansel, moves a small way towards him (wants,
;;; convey.64:187-208), and then shows that she is mean. REVIVE;KNOWDI's own short walks
;;; go to places fixed as they start, and leave none of these.
;;;
;;; The repair. The question reaches small-way-from only through INTERF's
;;; ask-positions-for-distance (interf.149:753-776), which asks the first place's actor
;;; how far it is from the second, and then the second's how far it is from the first,
;;; and records the answer on the next subscene. That is wrapped: when one of the two
;;; places is a small way from and the other is a third place, the distance is measured
;;; from the xy position the small way from stands for, worked out as INTERF works it
;;; out (position-between, interf.149:323-327), and recorded as Ken's records it. Where
;;; the small way from is the mover's own place, its first anchor is the mover, so its
;;; xy position is worked out in the subscene the walk was planned in, the latest
;;; subscene before this one where both anchors have places. If the other place's actor
;;; answers first, as Ken asks it first, its answer is kept. From p1 or p2, from another
;;; small way from, and for any other two places, Ken's function answers as he wrote it,
;;; so only a question that would have stopped is answered. One of those is asked inside
;;; Ken's own answer from an anchor: measured in a later subscene, the mover's place is
;;; the small way from itself, and how far it is from the other anchor's xy position is
;;; a third place's question.
;;; (It is a wrap, not an extension of small-way-from's receiver: loading INTERF again
;;; puts Ken's receiver back in front, and in the filming job an extension was passed
;;; over; REVIVE;WRAP wraps again whenever INTERF loads.)
;;;
;;; The note, on the subscene, as in that Hansel and Gretel:
;;;   (revival-repair: what measured-small-way-from was (small-way-from (vicinity-of
;;;		       witch) (vicinity-of hansel)) now (from (xy-position 0.10591452
;;;		       -0.0013884059) as in (subscene-of the-gingerbread-house 1)) because
;;;		       (third place (good-distance-from (contact-with gretel by hansel))))
;;; or now (nothing), with the distance nil, as INTERF answers one it can't work out
;;; (interf.149:770-775), if the anchors never had places.

(or (boundp ':revival-small-ways-being-measured) (setq :revival-small-ways-being-measured nil))

;; Ken's ask-positions-for-distance, or, for a small way from and a third place, the
;; distance from where the small way from is, recorded on the next subscene.
(defun ask-positions-for-distance-from-a-small-way (place1 place2 subscene next-subscene)
  (let ((simple-1 (simplify-position place1))
	(simple-2 (simplify-position place2)))
       (cond ((small-way-from-and-a-third-place? simple-1 simple-2)
	      (distance-from-a-small-way simple-1 simple-2 subscene next-subscene))
	     ((small-way-from-and-a-third-place? simple-2 simple-1)
	      ;;Ken asks the first place first, and keeps its answer
	      (let ((first-way (ask-if-understood ,(first simple-1)
						  how far is ,simple-1
						  from ,simple-2 in ,subscene)))
		   (cond (first-way
			  (ask ,next-subscene set your (distance-between ,simple-1 ,simple-2)
			       to (screen-fraction ,first-way)))
			 (t (distance-from-a-small-way simple-2 simple-1 subscene
						       next-subscene)))))
	     (t (funcall (revival-wrapped 'ask-positions-for-distance 'mend16)
			 place1 place2 subscene next-subscene)))))

;; Whether INTERF's small-way-from would stop on how far place is from small-way: a
;; small way from, and a place that is neither of its anchors nor another small way from,
;; whose actor exists (as Ken's function asks only then, interf.149:756-757).
(defun small-way-from-and-a-third-place? (small-way place)
  (and (not (atom small-way))
       (eq (first small-way) 'small-way-from)
       (not (atom place))
       (exists? (first place))
       (not (eq (first place) 'small-way-from))
       (not (equal place (second small-way)))
       (not (equal place (third small-way)))))

(defun distance-from-a-small-way (small-way place subscene next-subscene)
  (cond ((member small-way :revival-small-ways-being-measured) nil) ;;it leads back to itself
	(t (let ((:revival-small-ways-being-measured
		  (cons small-way :revival-small-ways-being-measured)))
		(let ((where (where-a-small-way-is small-way subscene)))
		     (revival-note subscene 'measured-small-way-from small-way
				   (cond (where (list 'from (first where)
						      'as 'in (second where)))
					 (t '(nothing)))
				   (list 'third 'place place))
		     (let ((distance (and where
					  (screen-fraction-between (first where) place subscene))))
			  (and (numberp distance)
			       (ask ,next-subscene set your (distance-between ,small-way ,place)
				    to (screen-fraction ,distance)))))))))

;; (xy-position subscene-it-was-worked-out-in) for small-way: in subscene, or the latest
;; subscene before it where its anchors have places; nil if they have none.
(defun where-a-small-way-is (small-way subscene)
  (cond ((not (exists? subscene)) nil)
	(t (let ((xy (find-xy-position small-way subscene)))
		(cond ((eq (first xy) 'xy-position) (list xy subscene))
		      (t (where-a-small-way-is
			  small-way (ask ,subscene recall your previous-subscene))))))))

;; ask-positions-for-distance is INTERF's, so it is wrapped once INTERF has loaded.
(+after-load '|ken;interf >|
  '(revival-wrap 'ask-positions-for-distance 'mend16 'ask-positions-for-distance-from-a-small-way))

;;; -*-lisp-*-
;;; REVIVE;MEND13: M13, two characters at one place.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. A place reckoned from one place towards (or away from) another that is
;;; the same place goes straight up (or down) from it, as Ken's turtle would, and the
;;; repair notes it. And a step that is not a number, however it came, is not halved
;;; for ever: the place stays where it was, as Ken's own last case has it.
;;;
;;; Where it stops. INTERF reckons a place a distance from one place towards another
;;; "based on equivalent triangles": the fraction of the way to go is the distance
;;; over the distance between them (move-from-xy-position, interf.149:89-106). Contact
;;; with someone (interf.149:291-305), a place a distance away from or towards someone
;;; (interf.149:395-457) and the rest of INTERF's places relative to two characters
;;; come to it through towards-by-distance and away-from-by-distance (interf.149:60-76).
;;; When the two places are one, the distance between them is 0.0, and the fraction is
;;; a division by zero. Here that is not a number (the revival's flonums are
;;; JavaScript's), which prints as 0.0 and is never less than anything:
;;;  - Director, going to come in contact with someone at the same place, faces the
;;;    mover towards a place that is not a number, and its turtle, drawing the mover,
;;;    steps along a line whose end it never reaches. The film hangs before its first
;;;    frame, where no cap can stop it. In a shy owl's story the games are
;;;    (convey (accompanys fox rabbit)) and neither was in the scene before; the last
;;;    scene's POSIT file has both at the picture's center (ANINIT's save-positions
;;;    writes every character's place, aninit.65:158-175, and one never shown is at
;;;    0.0 0.0), so the fox's going to the rabbit (goes-to-and-accompanys,
;;;    disply.311:186-233) starts at the rabbit.
;;;  - Ani, placing someone a distance away from another at the same place, keeps the
;;;    place on the stage by halving the step until it is (move-from-xy-position-1,
;;;    interf.149:109-118), and a step that is not a number never is: pass 2 overflows
;;;    the stack (test/stories/stress/README.md, "Other failures", 5).
;;; On the PDP-10 there is no such number, and what MacLisp did with a flonum divided by
;;; zero can't be run now; whatever it was, Ani could not have gone on for ever on it.
;;;
;;; Why straight up. Ken wrote the way he wanted it first, with the turtle, and kept it
;;; as a comment because he couldn't load the turtle into Ani (interf.149:79-87): put
;;; the turtle at the first place, set its heading to the bearing of the second, and go
;;; forward the distance. The turtle's bearing of the place it is at is 0
;;; (TVRTLE's BEARING), a heading straight up the picture. So a place towards the same
;;; place is the distance straight up, and away from it the distance straight down;
;;; for contact, whose distance is no more than the distance between them
;;; (interf.149:302), the place itself. The rest is Ken's: the step goes to his
;;; move-from-xy-position-1, which keeps it on the stage as it keeps any other.
;;;
;;; A step that is not a number. Halving a step until the place is on the stage
;;; (move-from-xy-position-1, interf.149:109-118) ends for any number: the step shrinks
;;; to the place it starts from, which is on the stage. It never ends for a step that
;;; is not a number (or is infinite), which no halving brings on the stage. The repair
;;; above takes away the one way Ken's code makes such a step; one that comes some
;;; other way stays where it was, as Ken's last case does with a place it can't move
;;; ("otherwise dont move at all", interf.149:118), with the note
;;;   (revival-repair: what no-step was (not-a-number) now <the place it stays at>
;;;		       because (halving never brings it on the stage))
;;;
;;; The note, on the subscene Ani was reckoning for, or, in Director, which reckons
;;; with no subscene, on the movie being filmed:
;;;   (revival-repair: what same-place was (from <place> towards <place>)
;;;		       now <the xy-position> because (both at <the xy-position>))
;;; with the places as INTERF was asked for them (towards-by-distance), or, when it was
;;; asked for xy-positions themselves, the xy-positions. In Ken's Cinderella no two
;;; places are ever one when one is reckoned from the other, so in her run this only
;;; compares.

;; The places towards-by-distance was asked about, for the note: (place1 place2
;; subscene), or nil.
(or (boundp ':revival-towards) (setq :revival-towards nil))

;; Ken's towards-by-distance (interf.149:60-71), with what it was asked kept for
;; move-from-xy-position below, which Ken's calls with the places as xy-positions.
(defun towards-by-distance-saying-from-where (place1 place2 subscene distance keep-on-stage?)
  (let ((:revival-towards (list place1 place2 subscene)))
       (funcall (revival-wrapped 'towards-by-distance 'mend13)
		place1 place2 subscene distance keep-on-stage?)))

;; Ken's move-from-xy-position (interf.149:89-106), or, from a place towards the same
;; place, the distance straight up (as the turtle's bearing of its own place is 0) by
;; Ken's move-from-xy-position-1.
(defun move-from-xy-position-from-the-same-place (position-1 position-2 distance keep-on-stage?)
  (cond ((same-place? position-1 position-2)
	 (let (((nil x y) position-1))
	      (let ((moved (move-from-xy-position-1 x y x (+$ y distance) 0.0 distance
						    keep-on-stage?)))
		   (note-same-place position-1 position-2 moved)
		   moved)))
	(t (funcall (revival-wrapped 'move-from-xy-position 'mend13)
		    position-1 position-2 distance keep-on-stage?))))

;; Two xy-positions at the same place: the distance between them is 0.0.
(defun same-place? (position-1 position-2)
  (and (not (atom position-1))
       (not (atom position-2))
       (eq (first position-1) 'xy-position)
       (eq (first position-2) 'xy-position)
       (= (second position-1) (second position-2))
       (= (third position-1) (third position-2))))

(defun note-same-place (position-1 position-2 moved)
  (let ((asked :revival-towards))
       (let ((place1 (cond (asked (first asked)) (t position-1)))
	     (place2 (cond (asked (second asked)) (t position-2))))
	    (revival-note (where-reckoned) 'same-place (list 'from place1 'towards place2)
			  moved (list 'both 'at position-1)))))

;; The actor a note goes on: the subscene Ani was reckoning for, or, in Director, which
;; reckons with no subscene, the movie being filmed (or, failing both, INTERF's
;; position, the kind of every place).
(defun where-reckoned ()
  (or (and :revival-towards (third :revival-towards))
      (ask movie recall your current-movie)
      'position))

;; Ken's move-from-xy-position-1 (interf.149:109-118), which halves the step until the
;; place is on the stage; or, for a step that is not a number, the place it started
;; from, as his last case keeps it.
(defun move-from-xy-position-1-only-for-numbers
       (old-x old-y new-x new-y delta-x delta-y keep-on-stage?)
  (cond ((and keep-on-stage? (not (and (a-number? new-x) (a-number? new-y))))
	 (revival-note (where-reckoned) 'no-step '(not-a-number)
		       (list 'xy-position old-x old-y)
		       '(halving never brings it on the stage))
	 (list 'xy-position old-x old-y))
	(t (funcall (revival-wrapped 'move-from-xy-position-1 'mend13)
		    old-x old-y new-x new-y delta-x delta-y keep-on-stage?))))

;; A number, finite: not the result of 0.0 over 0.0, which equals nothing, itself
;; included, nor of something over 0.0, which no halving makes smaller.
(defun a-number? (x)
  (and (= x x) (< (abs x) 1.0e30)))

;; towards-by-distance, move-from-xy-position and move-from-xy-position-1 are INTERF's
;; (src/director/tags/ani.lisp: AUTOLOAD from KEN;INTERF), so they are wrapped once
;; INTERF has loaded.
(+after-load '|ken;interf >|
  '(progn
    (revival-wrap 'towards-by-distance 'mend13 'towards-by-distance-saying-from-where)
    (revival-wrap 'move-from-xy-position 'mend13 'move-from-xy-position-from-the-same-place)
    (revival-wrap 'move-from-xy-position-1 'mend13 'move-from-xy-position-1-only-for-numbers)))

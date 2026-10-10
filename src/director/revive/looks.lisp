;;; -*-lisp-*-
;;; REVIVE;LOOKS: Director draws each character as Ani chose.
;;;
;;; This file is ours, not Ken's. It is part of APPEAR (src/pipeline.js, EXTENSIONS;
;;; REVIVE;APPEAR says what APPEAR does). Each scene's program, as pass 2 writes it
;;; with APPEAR, ends with each character's look, as REVIVE;SHAPES drew it:
;;;   (ask cinderella take look (look: shape circle angle 5 center-offset nil ani-size .036))
;;; ANINIT's start makes the characters as Ken drew them (initialize-characters,
;;; aninit.65:36-47), then loads the program (aninit.65:203-206), so the look given
;;; there is the one filmed. A director-character is a poly (dichar.103:9), drawn with
;;; draw-poly of its size and angle (poly.29:14-17), its center-offset a turn before
;;; drawing (object.401:159-174); its size is its ani-size times the screen's
;;; (dichar.103:13-14).
;;;
;;; OBJECT keeps how to draw an object, with its size, in how-to-draw, made again only
;;; when the appearance changes (object.401:140-157), so:
;;;  - the angle is set as OBJECT's demon for a drawing argument has it, (set your
;;;    how-to-draw to nil) and then the angle (object.401:454-461); but a visible
;;;    object redraws itself while it sets how-to-draw, before the new angle is stored,
;;;    and keeps that drawing, so how-to-draw is reset once more after;
;;;  - setting ani-size alone redraws nothing, and how-to-draw keeps the old size, so the
;;;    size goes through OBJECT's own set your size (object.401:176-188), which puts it
;;;    in how-to-draw and redraws.
;;; Director also loads in pass 2's job (it measures places on the TV, run.65), where
;;; take look is defined but nobody asks for it. Ani's colors are a later stage; while
;;; APPEAR is on, Director's own color filming (tools/run-scene.mjs --color, ANINIT's
;;; running-color, whose many-polys parts are copies made before the program loads) is
;;; not supported.

(defun define-take-look ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (take look ?look) director-character
	(ask :self set your shape to ,(get look 'shape)) ;;its name, for the record
	(ask :self set your angle to ,(get look 'angle))
	(ask :self set your center-offset to ,(get look 'center-offset))
	(ask :self set your how-to-draw to nil) ;;again, after the angle (see above)
	(ask :self set your ani-size to ,(get look 'ani-size))
	(ask :self set your size to ,(ask :self recall your size))
	look)))

(+after-load '|ken;dichar >| '(revival-once 'looks-take-look 'define-take-look))

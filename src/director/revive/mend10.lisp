;;; -*-lisp-*-
;;; REVIVE;MEND10: M10, alone with no one else.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. An exit-by suggestion with no one to send off is set aside with Ken's
;;; reject-suggestion, the reason (no-one-else-to-send-off), and a note on the task.
;;;
;;; Where it stops. CONVEY shows (alone a b) by sending everyone else off:
;;; (exit-by ,(set-minus (ask character recall your offspring) characters))
;;; (convey.64:236-243); "to convey that Cinderella and the Prince are alone is easy
;;; --- just arrange for all the other characters on stage to exit" (AI-TR-540
;;; L1970-1972). In a story whose only characters are the two, that list is NIL.
;;; exit-by's estimate is the longest of its characters' walks off (maximum-in-set,
;;; disply.311:1008-1020), and of no walks it is nil, so get-estimated-time-of stops:
;;; "couldn't get a time bound out of (SUGGESTION: ... (EXIT-BY NIL) ...)"
;;; (chomet.123:448-460). A Fox and the Crow, with (convey (alone fox crow)), stops
;;; there, and so does test/stories/stress/alone-two.lisp. REVIVE;MEND5's check lets
;;; it through, since exit-by exists.
;;;
;;; What becomes of the task. The two are alone already, so there is nothing to
;;; show. Ken's code has a way for a task with no method left, and only that one: no
;;; display method is chosen (chomet.123:216-238), approve-or-remake-tasks-choices
;;; finds no time fit to bring back among the rejected suggestions and makes the task
;;; cant-do, with Ken's warning "can't do" (chomet.123:23-37), and a cant-do task
;;; takes no time (ideal-time-for-task, chomet.123:95-99). There is no status for a
;;; task that is done already (Ken's tasks are cant-do or being-handled-by-convey-tasks,
;;; chomet.123:25, 34, 503), and a method that does nothing would need an estimate and
;;; a run of the revival's making. So the task is cant-do, as Cinderella's helps was
;;; in the Introduction (AI-TR-540 L1857-1859), and the note says why. (exit-by's own
;;; run already passes over anyone not on the stage, located?, disply.311:1026-1027.)
;;;
;;; The note, on the task:
;;;   (revival-repair: what already-alone was (exit-by nil) now rejected
;;;		       because no-one-else-to-send-off)
;;; Cinderella's alone (cindy.46:132) sends off the fairy godmother and the stepmother
;;; (reports/pass2/ken1-meet.mini), so in her run this does nothing but look at each
;;; display suggestion's method.

;; Ken's score-suggestions (chomet.123:257-302), with any exit-by of no one set aside
;; first, as REVIVE;MEND5 sets aside a display method that doesn't exist.
(defun score-suggestions-with-someone-to-send-off (suggestions task)
  (funcall (revival-wrapped 'score-suggestions 'mend10)
	   (mapcan (function
		    (lambda (suggestion)
			    (let ((method (get (get suggestion 'value) 'value)))
				 (cond ((no-one-to-send-off? method)
					(reject-suggestion task suggestion
							   '(no-one-else-to-send-off))
					(revival-note task 'already-alone method
						      'rejected 'no-one-else-to-send-off)
					nil)
				       (t (list suggestion))))))
		   suggestions)
	   task))

;; (exit-by nil): alone's method when the story has no one but the two.
(defun no-one-to-send-off? (method)
  (and (eq (first method) 'exit-by)
       (null (second method))))

;; score-suggestions is CHOMET's, so it is wrapped once CHOMET has loaded. MEND5 wraps
;; it too, first, so this goes round MEND5's wrapper.
(+after-load '|ken;chomet >|
  '(revival-wrap 'score-suggestions 'mend10 'score-suggestions-with-someone-to-send-off))

;;; -*-lisp-*-
;;; REVIVE;SLIPS6: S6, a method's prerequisites are read under the name they are kept by.
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged). It changes nothing in Ken's Cinderella
;;; (reports/ext/slips/README.md).
;;;
;;; The slip. Before CHOMET chooses a few convey methods for what a task establishes, it
;;; drops those whose prerequisites are not met (chomet.123:475-476):
;;;
;;;	(define-function pass-prerequisite-test (suggestion)
;;;	 (do ((p (get (get suggestion 'value) 'prerequisite) (rest p)))	(chomet.123:558-559)
;;;
;;; A method keeps its prerequisites under 'prerequisites: SUGCON puts them there, with
;;; the convey verb's own (sugcon.26:30-52), and score-suggestions and
;;; get-prerequisites-of read them there (chomet.123:277, 442-443). Under 'prerequisite
;;; there is nothing, so the test passed every method, and eliminate-by-prerequisites
;;; never eliminated one. The correction reads 'prerequisites, as its neighbor
;;; pass-best-when-test reads 'best-when (chomet.123:573-577).
;;;
;;; In Ken's Cinderella no method is dropped: the prerequisites are the convey verbs'
;;; (convey.64:62-67), that the one met is on the stage and that the other can move to
;;; it, and when CHOMET asks, none has the status not-met, the only status the test
;;; drops a method for (on-stage has no demon to find one, and can-move finds none
;;; not met). In a story with a prerequisite that is not met, the method goes, as
;;; CHOMET meant.
;;;
;;; The note, on the task, for each method dropped:
;;;   (revival-repair: what prerequisite-not-met was (accompanys troll kid)
;;;		     now dropped because ((on-stage kid)))

(or (boundp ':slips6-task) (setq :slips6-task nil))

(defun pass-prerequisite-test-reading-prerequisites (suggestion)
  (cond ((slip-on? 's6)
	 (do ((p (get (get suggestion 'value) 'prerequisites) (rest p)))
	     ((null p) t)
	     (and (ask ,(first (first p)) recall if any items match (status-of ,(first p) not-met))
		  (prog2 (and :slips6-task
			      (revival-note :slips6-task 'prerequisite-not-met
					    (get (get suggestion 'value) 'value) 'dropped
					    (list (first p))))
			 (return nil)))))
	(t (funcall (revival-wrapped 'pass-prerequisite-test 'slips6) suggestion))))

;; The task, for the note.
(defun eliminate-by-prerequisites-noting (suggestions task)
  (let ((:slips6-task task))
       (funcall (revival-wrapped 'eliminate-by-prerequisites 'slips6) suggestions task)))

;; Both CHOMET's (src/director/tags/ani.lisp: AUTOLOAD from KEN;CHOMET).
(+after-load '|ken;chomet >|
  '(progn
    (revival-wrap 'pass-prerequisite-test 'slips6 'pass-prerequisite-test-reading-prerequisites)
    (revival-wrap 'eliminate-by-prerequisites 'slips6 'eliminate-by-prerequisites-noting)))

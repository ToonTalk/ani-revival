;;; -*-lisp-*-
;;; REVIVE;MEND18: M18, a scene whose only task is shown by one convey task.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The failure. A scene's task ordering is what process-scene-description-1 makes of
;;; its description (scene.9:430-438): an (and ...) or (sequence: ...) of tasks, or, for
;;; a description that is one task, that task alone, an atom. An establish task that Ani
;;; does by conveying gives its place in the ordering to its convey tasks
;;; (choose-a-few-convey-methods, chomet.123:510-513): process-scene-description puts
;;; them where it was, with subst, and has reorder-task-ordering tidy the result
;;; (scene.9:390-410). With one convey task, the new part is that task alone, an atom
;;; (simplify-task-ordering takes (and (sequence: (and task))) down to it), and if the
;;; scene was the establish task alone, the whole ordering is now that convey task.
;;; reorder-task-ordering-1 takes an atom as it is, "including null ordering of course"
;;; (scene.9:474), but simplify-task-ordering takes the rest of it, as of a list
;;; (scene.9:535-538), and pass 2 stops: "cdr of non-list". In Ken's Cinderella every
;;; scene that establishes something is an (and ...) or a (sequence: ...) of tasks.
;;; A new story gets there with a scene that only establishes a relationship with one
;;; way of showing it, the troll dominating the goat, say, which Ani shows by pushing
;;; (test/stories/stress/only-relationship.lisp).
;;;
;;; The repair. simplify-task-ordering takes a lone task as the ordering it is, as
;;; reorder-task-ordering-1 does, and notes on the task:
;;;   (revival-repair: what one-task-ordering was (rest convey-task-1) now convey-task-1
;;;		       because (the ordering is one task))
;;; A list, and nil, which Ken's takes the rest of without stopping, go to Ken's.

(defun simplify-task-ordering-of-one-task (ordering)
  (cond ((and ordering (atom ordering)) ;;one task
	 (revival-note ordering 'one-task-ordering
		       (list 'rest ordering) ordering '(the ordering is one task))
	 ordering)
	(t (funcall (revival-wrapped 'simplify-task-ordering 'mend18) ordering))))

;; simplify-task-ordering is SCENE's (src/director/tags/ani.lisp: AUTOLOAD from
;; KEN;SCENE), so it is wrapped once SCENE has loaded.
(+after-load '|ken;scene >|
  '(revival-wrap 'simplify-task-ordering 'mend18 'simplify-task-ordering-of-one-task))

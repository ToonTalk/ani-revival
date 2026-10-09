;;; -*-lisp-*-
;;; REVIVE;MEND11: M11, a running time for a task Ani can't do.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. When the scene's tasks don't fit its length, CHOMET stretches or
;;; shortens them (redistribute-time-for-tasks, chomet.123:59-64): adjust-task-lengths
;;; sets each task's running time, but passes over a task Ani can't do or one its
;;; convey tasks handle, "do nothing then" (chomet.123:141-160), and leaves it with
;;; none. A subscene's running time is the longest of its tasks' (scene.9:137-140), so
;;; a subscene holding such a task stopped pass 2 the first time it was asked its
;;; running time: "not a number: NIL", from max. Ken's other way of giving the tasks
;;; their times, give-every-task-its-ideal-time (chomet.123:68-93), gives such a task
;;; 0.0 (ideal-time-for-task, chomet.123:95-99). After adjust-task-lengths, each task
;;; of a subscene that it passed over with no running time gets that 0.0 too, and
;;; notes
;;;   (revival-repair: what no-running-time was nil now 0.0 because (status cant-do))
;;; (or (status being-handled-by-convey-tasks)). A subscene whose tasks all read 0.0
;;; is one Ken's run your methods expects: "nothing to do in this subscene (I hope)"
;;; (scene.9:167).
;;;
;;; Only the subscenes' tasks (their convey and establish tasks, scene.9:141-143) get
;;; the 0.0, since only theirs are read: a task its convey tasks handle can have been
;;; taken out of the task ordering in favor of them, and then it is in no subscene's
;;; list, though it still names the subscene introduce-task-and-subscene first gave it
;;; (scene.9:115-120), and it keeps the NIL that does no harm.
;;; It happens when a scene's tasks don't fit its length and one that can't be done,
;;; or is handled by others, has a subscene: for instance a scene that is a sequence
;;; of establishing two personalities, the first one Ani has nothing to show with
;;; (test/stories/stress/cant-do-adjusted.lisp). Each of Cinderella's scenes fits its
;;; length, so in her run adjust-task-lengths is never called.

;; Ken's adjust-task-lengths, and then each task of a subscene that it passed over
;; given the running time ideal-time-for-task gives it.
(defun adjust-task-lengths-timing-those-passed-over (scene adjustment last-time?)
  (let ((adjusted (funcall (revival-wrapped 'adjust-task-lengths 'mend11)
			   scene adjustment last-time?)))
       (mapc (function
	      (lambda (subscene)
		      (mapc 'time-if-passed-over (ask ,subscene recall your tasks))))
	     (ask ,scene recall your subscenes))
       adjusted))

(defun time-if-passed-over (task)
  (let ((status (ask ,task recall your status)))
       (cond ((and (memq status '(cant-do being-handled-by-convey-tasks))
		   (null (ask ,task recall your running-time)))
	      (ask ,task set your running-time to 0.0)
	      (revival-note task 'no-running-time nil 0.0 (list 'status status))))))

;; adjust-task-lengths is CHOMET's (src/director/tags/ani.lisp: AUTOLOAD from
;; KEN;CHOMET), so it is wrapped once CHOMET has loaded.
(+after-load '|ken;chomet >|
  '(revival-wrap 'adjust-task-lengths 'mend11 'adjust-task-lengths-timing-those-passed-over))

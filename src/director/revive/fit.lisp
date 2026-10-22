;;; -*-lisp-*-
;;; REVIVE;FIT: S15, a scene keeps the time its length gives it (CHOMET's slips in
;;; dividing a scene's time among its tasks).
;;;
;;; This file is ours, not Ken's. FIT (src/pipeline.js, EXTENSIONS) is a repair, on with
;;; the revival's extensions and never in "Ani as in 1978": Ken's decision of 16 October
;;; 2026 ("let's not change the revival film when 'Ani as in 1978' is selected -
;;; otherwise go ahead"), settling the question left for him with SLIPS (PLAN.md, stage 7
;;; question 2). It is the correction SLIPS numbers S15 (reports/ext/slips/README.md),
;;; and SLIPS requires it. It requires MEND, whose MEND11 it keeps (below). By Ken's
;;; decision 13 (17 October) FIT also loads REVIVE;FITSTR (S16, a stretched walk takes
;;; its stretch once) and REVIVE;SLIPS8 (S8), which keep what the scene's time is filled
;;; with.
;;;
;;; Ken's plan. "Ani tries to constrain the film to be a (user) desired length. Ani must
;;; often arbitrate between the different activities by stretching or shortening them.
;;; Each activity responds to questions about how long it would ideally like to run for
;;; and also what is the minimum and maximum time that is acceptable. If a reallocation
;;; is necessary the activities themselves are asked to stretch or shrink" (AI-TR-540
;;; p. 126, L3394-3401). A scene's length (short, medium, long) gives it length-bounds
;;; (record-length-bounds-for-scenes, scene.9:346-357), each task its share of them as
;;; its allocated-time (scene.9:333-344), and once the tasks have chosen,
;;; approve-or-remake-tasks-choices (chomet.123:9-37) gives every task its ideal time
;;; within its allocation (give-every-task-its-ideal-time, chomet.123:68-116), or, if a
;;; task could choose no way of showing for want of time, brings back the rejected way
;;; whose time fits best (resurect-bad-time-fits, chomet.123:187-198) and moves the
;;; tasks' allocations by the time it asks for (redistribute-time-for-tasks,
;;; chomet.123:39-65). SCENE then stretches each part's methods to fill its time (run
;;; your methods, scene.9:159-183: stretched-by, the part's running time over the
;;; methods' ideal).
;;;
;;; The slips, in No Longer Kept Apart. The scene is short, (length-bounds (10.0 25.0)),
;;; with one task, allocated (10.0 25.0). Its only way of showing that Ani can show,
;;; goes-to-and-accompanys (ideal 3.98 s, most 6.95), is rejected by time-fit-score-1
;;;   ((< upper-estimated lower-allocated)
;;;    '(too-much-time: ideal-difference ,(-$ ideal lower-allocated)
;;;		     will-accept ,(-$ upper-estimated lower-allocated)))	(chomet.123:409-411)
;;; as (too-much-time: ideal-difference -6.02 will-accept -3.05), so approve-or-remake
;;; asks for -6.08 (-6.02 by 1.01, "to avoid round-off screws", chomet.123:31-33), and
;;; redistribute-time-for-tasks moves the allocation to (3.92 18.92), has the task
;;; choose again, and judges the scene by
;;;   (let ((new-length (+$ (*$ (+$ scene-minimum scene-maximum) .5) total-time-change)))
;;;   ...
;;;   (cond ((and (> new-length scene-minimum) (< new-length scene-maximum))
;;;	   (give-every-task-its-ideal-time scene))			(chomet.123:42, 59-60)
;;; the bounds' midpoint plus the change, 17.5 - 6.08 = 11.42, within the bounds; but
;;; that is not the length the tasks are then given: the task takes its ideal, 3.98 s,
;;; and the scene runs 3.98 s against its own least of 10 (17 frames at 4 a second):
;;; "things happen too quickly and the fairy godmother just appears and is quickly
;;; gone" (p. 69, L1956-1958). Beside it, three slips on the way there:
;;;  - resurect-bad-time-fits looks for a reason Ken's scoring never writes:
;;;      (cond ((or (eq (first reason) 'more-time-needed:)
;;;		 (eq (first reason) 'too-much-time:))			(chomet.123:193-194)
;;;    where time-fit-score-1 writes
;;;      '(need-more-time: ideal-difference ,(-$ ideal upper-allocated)
;;;			 will-accept ,(-$ lower-estimated upper-allocated))	(chomet.123:413-414)
;;;    so a task whose only way of showing needs more time is never given it;
;;;  - redistribute-time-for-tasks adjusts a scene the change makes too short by less
;;;    than nothing, and one too long by more than nothing:
;;;      ((< new-length scene-minimum)
;;;       (adjust-task-lengths scene (-$ new-length scene-minimum) last-time?))
;;;      ((> new-length scene-maximum)
;;;       (adjust-task-lengths scene (-$ new-length scene-maximum) last-time?))	(chomet.123:61-64)
;;;    while adjust-task-lengths adds the adjustment to each task's time,
;;;    (+$ ideal-time task-adjustment) (chomet.123:160);
;;;  - adjust-task-lengths gives a task whose new time falls below its least its most,
;;;    and one above its most its least:
;;;      ((> minimum-time new-time) ;;must be too large
;;;       ... set your running-time to ,maximum-time ...)
;;;      ((< maximum-time new-time) ;;must be too small
;;;       ... set your running-time to ,minimum-time ...)			(chomet.123:167-180)
;;;
;;; The correction, four pieces, each switchable as SLIPS' corrections are,
;;; (setq :slips-off '(s15-reason)) before Ken's files load; (s15) turns off all four:
;;;   s15             after approve-or-remake-tasks-choices has given the tasks their
;;;                   times, the scene's planned length, as Ken's own code computes it
;;;                   (the sum of its parts' running times, chomet.123:72-74, each part's
;;;                   the longest of its tasks', scene.9:137-140, so tasks run in
;;;                   parallel count once), is held to its length-bounds: below its least
;;;                   (or above its most), adjust-task-lengths is asked to move the tasks
;;;                   by the difference, with the sign that brings the scene to the bound
;;;                   and each task kept within its own least and most (s15-least-most).
;;;                   What that leaves (adjust-task-lengths divides the difference evenly
;;;                   among all the scene's tasks, those run in parallel and those passed
;;;                   over too; and a task can be at its most), each part's longest task
;;;                   takes in proportion to its time, past its most if need be, since the
;;;                   scene's length is the user's ("a (user) desired length", p. 126) and
;;;                   the task's way of showing was brought back by Ken's code because
;;;                   nothing fitted ("couldn't make a choice but have to so",
;;;                   chomet.123:26); SCENE's own stretch then fills the part. A note on
;;;                   the scene, scene-time-kept, gives the planned and the corrected
;;;                   lengths.
;;;   s15-reason      resurect-bad-time-fits hears need-more-time: as well as
;;;                   more-time-needed: (note need-more-time-heard on the scene, where it
;;;                   answers otherwise than Ken's).
;;;   s15-signs       redistribute-time-for-tasks adjusts by (-$ scene-minimum new-length)
;;;                   and (-$ scene-maximum new-length) (note scene-time-sign on the
;;;                   scene).
;;;   s15-least-most  adjust-task-lengths gives a task below its least its least, and one
;;;                   above its most its most, the difference it could not take left
;;;                   over as (-$ new-time <the bound>) (note task-time-bound on the
;;;                   task); and time-bounds-for-task's least is the least of its
;;;                   methods' leasts, where Ken's starts at none and so stays none,
;;;                   (min-least-time 0.0) (chomet.123:121, 129). The s15 piece asks
;;;                   adjust-task-lengths, so with this piece off it gets Ken's.
;;; Ken's line 15, which calls redistribute-time-for-tasks with the number
;;; resurect-bad-time-fits returns where a list of (change task) is wanted
;;; (chomet.123:14-21), is reached only if the first redistribution fails; it is left
;;; as it is (reports/ext/fit/README.md).
;;;
;;; In Ken's Cinderella: No Longer Kept Apart, 3.98 s planned, is held to its least,
;;; 10 s; and Kept Apart, planned 29.75 s against its least of 30, is held to 30
;;; (reports/ext/fit/README.md has the films, and SLIPS' S15 its diff with SLIPS).
;;;
;;; The note, on the scene:
;;;   (revival-repair: what scene-time-kept was (planned 3.98) now 10.0
;;;		     because ((length-bounds 10.0 25.0)
;;;			      (convey-task-3 was 3.98 now 10.0 least 2.792 most 6.95)))

(or (boundp ':slips-off) (setq :slips-off nil))
(or (boundp ':fit-scene) (setq :fit-scene nil))

;; Whether piece id of S15 (s15, s15-reason, s15-signs or s15-least-most) is to be made:
;; (s15) in :slips-off turns off all four.
(defun fit-on? (id)
  (not (or (memq 's15 :slips-off) (memq id :slips-off))))

;;; ---------------------------------------------------------------- s15: the scene's time

;; Ken's approve-or-remake-tasks-choices (chomet.123:9-37), and then the scene held to
;; its length-bounds. Ken's answer is returned.
(defun approve-or-remake-tasks-choices-keeping-the-scene-time (scene)
  (let ((answer (let ((:fit-scene scene))
		     (funcall (revival-wrapped 'approve-or-remake-tasks-choices 'fit) scene))))
       (and (fit-on? 's15) (keep-the-scene-time scene))
       answer))

;; The scene's planned length, as give-every-task-its-ideal-time sets it (chomet.123:72-74).
(defun planned-length-of (scene)
  (float (apply 'plus (ask ,scene ask each of your subscenes to recall your running-time))))

;; A scene has length-bounds once a task of it has been given its share of them
;; (compute-bounds-on-time-for, scene.9:333-344, by the task's allocated-time demon,
;; scene.9:303-306); a scene each of whose tasks either runs in parallel, given its
;; ideal (chomet.123:106-107), or can't be done, given none (chomet.123:98-99), never
;; asks, and so has none: its time was never fitted to its length, and it is left as
;; it is.
(defun keep-the-scene-time (scene)
  (let (((least most) (ask ,scene recall your length-bounds))
	(planned (planned-length-of scene)))
       (let ((bound (cond ((not (and (numberp least) (numberp most))) nil)
			  ((< planned least) least)
			  ((> planned most) most))))
	    (and bound
		 (let ((before (task-times-of scene)))
		      (adjust-task-lengths scene (-$ bound planned) nil) ;;Ken's, s15-least-most
		      (let ((within (planned-length-of scene)))
			   (or (< (abs (-$ bound within)) 0.001)
			       (fill-the-parts-to scene (-$ bound within)))
			   (let ((now (planned-length-of scene)))
				(ask ,scene set your running-time to ,now)
				;;a scene whose tasks Ani can't do has nothing to stretch
				(or (= now planned)
				    (revival-note scene 'scene-time-kept (list 'planned planned) now
						  (cons (list 'length-bounds least most)
							(task-time-changes before))))
				now)))))))

;; Each task of the scene's parts, with its running time: ((task time) ...).
(defun task-times-of (scene)
  (mapcan (function
	   (lambda (subscene)
		   (mapcar (function (lambda (task) (list task (ask ,task recall your running-time))))
			   (ask ,subscene recall your tasks))))
	  (ask ,scene recall your subscenes)))

;; Those whose time changed: ((task was w now n least l most m) ...).
(defun task-time-changes (before)
  (mapcan (function
	   (lambda (entry)
		   (let ((task (first entry))
			 (was (second entry)))
			(let ((now (ask ,task recall your running-time)))
			     (cond ((equal was now) nil)
				   (t (let (((least most) (time-bounds-for-task task)))
					   (list (list task 'was was 'now now
						       'least least 'most most)))))))))
	  before))

;; What adjust-task-lengths left: each part's longest task, of those Ani can do, takes
;; the rest in proportion to its time, so that the parts keep their proportions.
(defun fill-the-parts-to (scene rest)
  (let ((longest (mapcan 'longest-task-of (ask ,scene recall your subscenes))))
       (let ((total (apply '+$ (cons 0.0 (mapcar (function (lambda (task)
								  (ask ,task recall your running-time)))
						    longest)))))
	    (cond ((> total 0.0)
		   (let ((factor (+$ 1.0 (//$ rest total))))
			(mapc (function
			       (lambda (task)
				       (ask ,task set your running-time to
					    ,(*$ factor (ask ,task recall your running-time)))))
			      longest)))))))

;; (task), the longest of a part's tasks Ani can do with a time above none, or nil.
(defun longest-task-of (subscene)
  (do ((tasks (ask ,subscene recall your tasks) (rest tasks))
       (best nil))
      ((null tasks) (and best (list best)))
      (let ((task (first tasks)))
	   (let ((time (ask ,task recall your running-time)))
		(and (not (memq (ask ,task recall your status) '(cant-do being-handled-by-convey-tasks)))
		     (numberp time)
		     (> time 0.0)
		     (or (null best) (> time (ask ,best recall your running-time)))
		     (setq best task))))))

;;; ---------------------------------------------------------------- s15-reason

;; Ken's resurect-bad-time-fits (chomet.123:187-198), hearing need-more-time:, the name
;; time-fit-score-1 writes (chomet.123:413), as well as more-time-needed:.
(defun resurect-bad-time-fits-hearing-need-more-time (rejects what-to-accept)
  (let ((kens (funcall (revival-wrapped 'resurect-bad-time-fits 'fit) rejects what-to-accept)))
       (cond ((not (fit-on? 's15-reason)) kens)
	     (t (do ((r rejects (rest r))
		     (best-so-far nil)
		     (least-change-requested 999999.9))
		    ((null r)
		     (let ((answer (cond (best-so-far least-change-requested))))
			  (and :fit-scene best-so-far (not (equal answer kens))
			       (revival-note :fit-scene 'need-more-time-heard kens answer
					     (list what-to-accept (get best-so-far 'reason))))
			  answer))
		    (let ((reason (get (first r) 'reason)))
			 (cond ((memq (first reason) '(need-more-time: more-time-needed: too-much-time:))
				(let ((off-by (get reason what-to-accept)))
				     (cond ((< (abs off-by) (abs least-change-requested))
					    (setq best-so-far (first r)
						  least-change-requested off-by)))))))))))))

;;; ---------------------------------------------------------------- s15-signs

;; Ken's redistribute-time-for-tasks (chomet.123:39-65), the adjustment of a scene too
;; short or too long the difference to the bound it passed, so that adjust-task-lengths,
;; which adds it (chomet.123:160), moves the tasks towards the bound.
(defun redistribute-time-for-tasks-towards-the-bound (time-changes scene last-time?)
  (cond ((not (fit-on? 's15-signs))
	 (funcall (revival-wrapped 'redistribute-time-for-tasks 'fit) time-changes scene last-time?))
	(t (let ((total-time-change (apply '+$ (mapcar 'car time-changes)))
		 ((scene-minimum scene-maximum) (ask ,scene recall your length-bounds)))
		(let ((new-length (+$ (*$ (+$ scene-minimum scene-maximum) .5) total-time-change)))
		     (mapc
		      (function
		       (lambda (time-change)
			       (let (((change task) time-change))
				    (cond ((memq (ask ,task recall your status)
						 '(cant-do being-handled-by-convey-tasks)))
					  (t (ask ,task set your allocated-time to
						  ,(mapcar
						    (function (lambda (time) (+$ time change)))
						    (ask ,task recall your allocated-time)))
					     (ask ,task unchoose values)
					     (ask ,task choose values))))))
		      time-changes)
		     (cond ((and (> new-length scene-minimum) (< new-length scene-maximum))
			    (give-every-task-its-ideal-time scene))
			   ((< new-length scene-minimum)
			    (note-scene-time-sign scene new-length scene-minimum)
			    (adjust-task-lengths scene (-$ scene-minimum new-length) last-time?))
			   ((> new-length scene-maximum)
			    (note-scene-time-sign scene new-length scene-maximum)
			    (adjust-task-lengths scene (-$ scene-maximum new-length) last-time?))
			   ;;at a bound, within it (REVIVE;MEND21, which FIT's MEND loads)
			   (t (redistribute-at-a-bound scene new-length scene-minimum
						       scene-maximum))))))))

(defun note-scene-time-sign (scene new-length bound)
  (revival-note scene 'scene-time-sign (-$ new-length bound) (-$ bound new-length)
		(list 'new-length new-length 'bound bound)))

;;; ---------------------------------------------------------------- s15-least-most

;; Ken's adjust-task-lengths (chomet.123:141-184), a task below its least given its
;; least and one above its most its most; and then, as REVIVE;MEND11 does after Ken's,
;; a task of a part passed over given the time ideal-time-for-task gives it.
(defun adjust-task-lengths-within-least-and-most (scene adjustment last-time?)
  (cond ((not (fit-on? 's15-least-most))
	 (funcall (revival-wrapped 'adjust-task-lengths 'fit) scene adjustment last-time?))
	(t (prog1 (adjust-task-lengths-1 scene adjustment last-time?)
		  (mapc (function
			 (lambda (subscene)
				 (mapc 'time-if-passed-over (ask ,subscene recall your tasks))))
			(ask ,scene recall your subscenes))))))

(defun adjust-task-lengths-1 (scene adjustment last-time?)
 (let
  ((tasks (ask ,scene recall your tasks)))
  (do ((i tasks (rest i))
       (task-adjustment (//$ adjustment (float (length tasks))))
       (total 0.0)
       (extra-adjustment 0.0))
      ((null i) (cond ((zerop extra-adjustment)
		       (ask ,scene set your running-time to ,total))
		      ((not last-time?) nil) ;;this causes it to try to adjust again
		      (t (shouldnt-happen 'adjust-task-lengths
					  '(cant adjust scene ,scene lengths
						 by ,adjustment)))))
      (let
       ((task (first i)))
       (cond ((memq (ask ,task recall your status)
		    '(cant-do being-handled-by-convey-tasks))) ;;do nothing then
	     (t (let (((minimum-time maximum-time) (time-bounds-for-task task))
		      (ideal-time (ideal-time-for-task task nil)))
		     (let ((new-time (+$ ideal-time task-adjustment)))
			  (cond ((and (< minimum-time new-time)
				      (> maximum-time new-time)) ;;in range
				 (setq total
				       (+$ total
					   (ask ,task set your running-time to ,new-time))))
				((> minimum-time new-time) ;;too small: its least
				 (revival-note task 'task-time-bound maximum-time minimum-time
					       (list 'new-time new-time 'least minimum-time))
				 (setq total
				       (+$ total
					   (ask ,task set your running-time to ,minimum-time)))
				 (setq extra-adjustment
				       (+$ extra-adjustment (-$ new-time minimum-time))))
				((< maximum-time new-time) ;;too large: its most
				 (revival-note task 'task-time-bound minimum-time maximum-time
					       (list 'new-time new-time 'most maximum-time))
				 (setq total
				       (+$ total
					   (ask ,task set your running-time to ,maximum-time)))
				 (setq extra-adjustment
				       (+$ extra-adjustment (-$ new-time maximum-time))))
				(t (shouldnt-happen
				    'adjust-task-lengths
				    '(cant relate ,new-time to min ,minimum-time and
					   max ,maximum-time))))))))))))

;; Ken's time-bounds-for-task (chomet.123:118-129), the least of its methods' leasts:
;; Ken's starts the least at none, (min-least-time 0.0), and takes a method's least only
;; if it is less, so a task's least was always none.
(defun time-bounds-for-task-least-of-its-methods (task)
  (cond ((not (fit-on? 's15-least-most))
	 (funcall (revival-wrapped 'time-bounds-for-task 'fit) task))
	(t (do ((methods (ask ,task recall your current-choice) (rest methods))
		(max-most-time 0.0)
		(min-least-time nil))
	       ((null methods) (list (or min-least-time 0.0) max-most-time))
	       (let ((time-estimates
		      (uncompiled-ask ,(first (first methods)) estimate time for !,(first methods)
				      in ,(ask ,task recall your subscene))))
		    (let ((least-time (get time-estimates 'least))
			  (most-time (get time-estimates 'most)))
			 (cond ((> most-time max-most-time) (setq max-most-time most-time)))
			 (cond ((or (null min-least-time) (< least-time min-least-time))
				(setq min-least-time least-time)))))))))

;; All CHOMET's (src/director/tags/ani.lisp: AUTOLOAD from KEN;CHOMET). adjust-task-lengths
;; is MEND11's already (MEND loads first), so the corrected one does MEND11's part too.
(+after-load '|ken;chomet >|
  '(progn
    (revival-wrap 'approve-or-remake-tasks-choices 'fit 'approve-or-remake-tasks-choices-keeping-the-scene-time)
    (revival-wrap 'resurect-bad-time-fits 'fit 'resurect-bad-time-fits-hearing-need-more-time)
    (revival-wrap 'redistribute-time-for-tasks 'fit 'redistribute-time-for-tasks-towards-the-bound)
    (revival-wrap 'adjust-task-lengths 'fit 'adjust-task-lengths-within-least-and-most)
    (revival-wrap 'time-bounds-for-task 'fit 'time-bounds-for-task-least-of-its-methods)))

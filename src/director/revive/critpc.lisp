;;; -*-lisp-*-
;;; REVIVE;CRITPC: a part of the film too quick or too slow.
;;;
;;; This file is ours, not Ken's. It is part of CRITIC (src/pipeline.js, EXTENSIONS;
;;; reports/chapter-x/design-criticism.md, section 4.1), Ken's second kind of criticism
;;; in Section D: "If one says that a section of the film happened too slowly or quickly
;;; then the display methods involved could be asked to replan the activities involved
;;; shrunk or stretched respectively" (AI-TR-540 p. 190). And his own example, No Longer
;;; Kept Apart: "things happen too quickly ... User criticism could easily be applied to
;;; allocate more time for this scene" (p. 69).
;;;
;;; Ken's machinery. A task's running time is ideal-time-for-task's (chomet.123:95-116):
;;; the largest ideal estimate of its methods, picked within the time the task was
;;; allocated (pick-time-within, chomet.123:131-139), its share of the scene's length
;;; from the film description (compute-bounds-on-time-for, scene.9:332-344), unless it
;;; runs beside others (in parallel), when it is not stretched or shortened. A subscene
;;; runs as long as its longest task (scene.9:137-140), and SCENE stretches its methods
;;; by its running time over their ideal (run your methods, scene.9:159-183, stretched-by),
;;; each display method slowing its characters by that factor (as goes-to-and-accompanys'
;;; divide-speed-by-factor, disply.311:186-190).
;;;
;;; The response. The time Ken's code gives the task is multiplied by the criticism's
;;; factor (1.5 for each "too quick", 1/1.5 for each "too slow", compounding: the
;;; revival's choice, pending Ken, design question 3), and SCENE's own stretching does
;;; the rest. Ken's code gives a task its time in one of two ways
;;; (approve-or-remake-tasks-choices, chomet.123:9-36): its ideal, picked within its
;;; allocated time (give-every-task-its-ideal-time, chomet.123:68-74, through
;;; ideal-time-for-task); or, when the scene's tasks no longer fit its length, its ideal
;;; plus a share of the whole scene's adjustment (adjust-task-lengths,
;;; chomet.123:140-185). The pace is applied to the time the task ends up with, whichever
;;; way gave it. ideal-time-for-task is wrapped for the first. Inside adjust-task-lengths
;;; the pace is held off, so that Ken's adjustment works from his own ideal, as it would
;;; without the criticism; then, once approve-or-remake-tasks-choices has set every
;;; task's time, a paced task whose time is not the one the pace gave it (Ken's
;;; adjustment set it since) is paced again from the time it was given, and the scene's
;;; running time is moved by as much. Paced before Ken's adjustment, a "too quick" could
;;; come out quicker: the adjustment was subtracted from the paced time where, from Ken's
;;; own time, his code would have given the task its longest (the signs of stage 7's
;;; question 2, left for Ken).
;;;
;;; The bounds, so that a criticism never overrides the film description: the time stays
;;; within the task's allocated time, its share of the scene's length (a part already at
;;; its bound is not met, and the note says so: the scene's length in the story is the
;;; user's to change); and within SCENE's own warnings (scene.9:166-169), a stretch of 8
;;; or 1/8: no more than 8 times the ideal of the task's ways of showing as SCENE measures
;;; it (maximum-ideal-time-of, scene.9:185-198), and no less than an eighth of it. The
;;; note names the bound that held it, when one did. A task running beside others (in
;;; parallel) is given its new time too, within the same bounds, so that a part of tasks
;;; in parallel is paced as a whole (the design had a task on its own: the revival's
;;; choice, pending Ken). The task notes what was done:
;;;   (heeded-criticism: id c2 what pace was 3.98 now 5.97 because (too-quick 1.5))
;;; with held-to and the bound when a bound held it short, and after and the scene's
;;; adjustment when it was paced again after Ken's adjustment; and
;;;   (unmet-criticism: id c2 what pace was 3.98 because (too-quick 1.5 held-to ...))
;;; when the bound left nothing to do. The note's now is the time the task runs.

(or (boundp ':critic-adjusting) (setq :critic-adjusting nil)) ;;inside adjust-task-lengths

(defun ideal-time-for-task-heeding-criticism (task in-parallel?)
  (let ((time (funcall (revival-wrapped 'ideal-time-for-task 'critpc) task in-parallel?)))
       (cond ((or (null :critic-record)
		  :critic-adjusting ;;Ken's adjustment works from his own time
		  (ask ,task recall your running-time) ;;Ken's first answer, already set
		  (memq (ask ,task recall your status) '(cant-do being-handled-by-convey-tasks)))
	      time)
	     (t (let ((c (first (critic-for-task 'pace task))))
		     (cond (c (critic-paced task c time nil))
			   (t time)))))))

;; The time the criticism gives the task, from the time Ken's code gave it, bounded,
;; and the note of it; after, the scene's adjustment, if Ken's adjust-task-lengths gave
;; it that time.
(defun critic-paced (task c time after)
  (let ((factor (float (get c 'factor)))
	(bounds (ask ,task recall your allocated-time))
	(ideal (critic-ideal-of task))
	(direction (get c 'direction)))
       (let ((wanted (*$ (float time) factor))
	     (top (float (second bounds)))
	     (bottom (float (first bounds))))
	    ;;SCENE's stretch of 8 or 1/8 of the ideal, where it is nearer than the allocated time
	    (let ((by-stretch (cond ((null ideal) nil)
				    ((> factor 1.0) (< (*$ 8.0 ideal) top))
				    (t (> (//$ ideal 8.0) bottom)))))
		 (let ((most (cond ((and by-stretch (> factor 1.0)) (*$ 8.0 ideal)) (t top)))
		       (least (cond ((and by-stretch (not (> factor 1.0))) (//$ ideal 8.0)) (t bottom))))
		      (let ((new (cond ((> factor 1.0) (max time (min wanted most)))
				       (t (min time (max wanted least))))))
			   (let ((because (append (list direction factor)
						  (cond ((= new wanted) nil)
							(by-stretch
							 (list 'held-to (list 'stretch (cond ((> factor 1.0) 8.0) (t .125)))))
							(t (list 'held-to (cons 'allocated-time bounds))))
						  (cond (after (list 'after (list 'scene-adjusted after)))))))
				(putprop task new 'critic-paced-to)
				(cond ((= new time) (critic-unmet task c 'pace time because))
				      (t (critic-heeded task c 'pace time new because)))
				new)))))))

;; The ideal of the task's ways of showing, as SCENE stretches a part by it
;; (maximum-ideal-time-of, scene.9:185-198), or nil if it has none.
(defun critic-ideal-of (task)
  (let ((ideal (maximum-ideal-time-of (ask ,task recall your current-choice)
				      (ask ,task recall your subscene))))
       (and (numberp ideal) (> ideal 0.0) (float ideal))))

;; Ken's adjust-task-lengths, with the pace held off, so that his adjustment of the scene
;; works from his own times; the adjustment is kept with the scene, for the note.
(defun adjust-task-lengths-heeding-criticism (scene adjustment last-time?)
  (cond ((null :critic-record)
	 (funcall (revival-wrapped 'adjust-task-lengths 'critpc) scene adjustment last-time?))
	(t (putprop scene adjustment 'critic-adjusted-by)
	   (let ((:critic-adjusting t))
		(funcall (revival-wrapped 'adjust-task-lengths 'critpc) scene adjustment last-time?)))))

;; Ken's approve-or-remake-tasks-choices, and then each paced task whose time is not the
;; one the pace gave it paced again from the time it has, and the scene's running time
;; moved by as much.
(defun approve-or-remake-tasks-choices-heeding-criticism (scene)
  (prog1 (funcall (revival-wrapped 'approve-or-remake-tasks-choices 'critpc) scene)
	 (and :critic-record (critic-pace-the-times-set scene))))

(defun critic-pace-the-times-set (scene)
  (mapc (function
	 (lambda (task)
		 (let ((time (ask ,task recall your running-time))
		       (c (first (critic-for-task 'pace task))))
		      (cond ((or (null c)
				 (not (numberp time))
				 (memq (ask ,task recall your status) '(cant-do being-handled-by-convey-tasks))
				 (let ((paced (get task 'critic-paced-to)))
				      (and (numberp paced) (= paced time)))))
			    (t (let ((new (critic-paced task c time (get scene 'critic-adjusted-by))))
				    (cond ((not (= new time))
					   (ask ,task set your running-time to ,new)
					   (let ((total (ask ,scene recall your running-time)))
						(and (numberp total)
						     (ask ,scene set your running-time to
							  ,(+$ (float total) (-$ new time)))))))))))))
	(ask ,scene recall your tasks)))

(+after-load '|ken;chomet >|
  '(progn (revival-wrap 'ideal-time-for-task 'critpc 'ideal-time-for-task-heeding-criticism)
	  (revival-wrap 'adjust-task-lengths 'critpc 'adjust-task-lengths-heeding-criticism)
	  (revival-wrap 'approve-or-remake-tasks-choices 'critpc
			'approve-or-remake-tasks-choices-heeding-criticism)))

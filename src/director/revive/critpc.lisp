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
;;; The response. ideal-time-for-task is wrapped: for a task of a part criticized, its
;;; time is its time as Ken's code gives it times the criticism's factor (1.5 for each
;;; "too quick", 1/1.5 for each "too slow", compounding: the revival's choice, pending
;;; Ken, design question 3), and SCENE's own stretching does the rest. The bounds, so
;;; that a criticism never overrides the film description: the time stays within the
;;; task's allocated time (a part already at its bound is not met, and the note says so:
;;; the scene's length in the story is the user's to change), and the factor within
;;; SCENE's own warnings, 8 and 1/8 (scene.9:166-169). A task running beside others is
;;; given its new time too, within the same bounds, so that a part of tasks in parallel
;;; is paced as a whole. The task notes what was done:
;;;   (heeded-criticism: id c2 what pace was 3.98 now 5.97 because (too-quick 1.5))
;;; with held-to and the bound when the bound held it short, and
;;;   (unmet-criticism: id c2 what pace was 3.98 because (too-quick 1.5 held-to ...))
;;; when the bound left nothing to do.

(defun ideal-time-for-task-heeding-criticism (task in-parallel?)
  (let ((time (funcall (revival-wrapped 'ideal-time-for-task 'critpc) task in-parallel?)))
       (cond ((or (null :critic-record)
		  (ask ,task recall your running-time) ;;Ken's first answer, already set
		  (memq (ask ,task recall your status) '(cant-do being-handled-by-convey-tasks)))
	      time)
	     (t (let ((c (first (critic-for-task 'pace task))))
		     (cond (c (critic-paced task c time))
			   (t time)))))))

;; The time the criticism gives the task, bounded, and the note of it.
(defun critic-paced (task c time)
  (let ((factor (max .125 (min 8.0 (float (get c 'factor)))))
	(bounds (ask ,task recall your allocated-time))
	(direction (get c 'direction)))
       (let ((wanted (*$ (float time) factor)))
	    (let ((new (cond ((> factor 1.0) (max time (min wanted (float (second bounds)))))
			     (t (min time (max wanted (float (first bounds))))))))
		 (let ((because (cond ((not (= factor (float (get c 'factor))))
				       (list direction factor 'held-to (list 'stretch factor)))
				      ((not (= new wanted))
				       (list direction factor 'held-to (cons 'allocated-time bounds)))
				      (t (list direction factor)))))
		      (cond ((= new time) (critic-unmet task c 'pace time because))
			    (t (critic-heeded task c 'pace time new because)))
		      new)))))

(+after-load '|ken;chomet >|
  '(revival-wrap 'ideal-time-for-task 'critpc 'ideal-time-for-task-heeding-criticism))

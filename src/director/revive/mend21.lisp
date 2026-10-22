;;; -*-lisp-*-
;;; REVIVE;MEND21: M21, a scene planned exactly at its least or its most time.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The failure. A scene's least and most times are the film's shortest and longest
;;; lengths times the scene's share of the film (record-length-bounds-for-scenes,
;;; scene.9:346-357). When the tasks' times change, CHOMET moves the scene's length to
;;; the middle of the two and the change (redistribute-time-for-tasks,
;;; chomet.123:39-65), and then asks: strictly between the two, each task gets its
;;; ideal time; below the least or above the most, the tasks are adjusted towards it;
;;; anything else "shouldnt happen": (arithmetic goofed up). A length exactly at a
;;; bound is that anything else. It happens whenever the film's length is one figure,
;;; (interval (minutes 1) (minutes 1)) as "Change the story"'s menus write a film of 1
;;; to 1 minutes: every scene's least is its most, and a scene whose tasks' times come
;;; out unchanged is planned exactly at both (Ken's own Cinderella with every scene
;;; short and a film of 1 minute stops in the Introduction). Ken's films have a range
;;; (his Cinderella 2 to 5 minutes), and none is planned at a bound.
;;;
;;; The repair. A length at a bound is within the scene's bounds, as Ken's comment on
;;; the first case reads, so each task gets its ideal time (give-every-task-its-ideal-
;;; time, chomet.123:68-74), and the scene notes
;;;   (revival-repair: what scene-at-its-bound was (arithmetic goofed up) now within
;;;		       because (new-length 12.0 least 12.0 most 12.0))
;;; Any other length goes to Ken's, as it was. FIT's own reading of the cond
;;; (REVIVE;FIT, s15-signs) calls redistribute-at-a-bound in the same case.

;; Ken's redistribute-time-for-tasks, unless the scene's new length is at one of its
;; bounds: then his own lines before the cond (the tasks' allocations moved and chosen
;; again, chomet.123:43-58), and the scene taken as within them.
(defun redistribute-time-for-tasks-at-a-bound (time-changes scene last-time?)
  (let ((total-time-change (apply '+$ (mapcar 'car time-changes)))
	((scene-minimum scene-maximum) (ask ,scene recall your length-bounds)))
       (let ((new-length (+$ (*$ (+$ scene-minimum scene-maximum) .5) total-time-change)))
	    (cond ((or (and (> new-length scene-minimum) (< new-length scene-maximum))
		       (< new-length scene-minimum)
		       (> new-length scene-maximum))
		   (funcall (revival-wrapped 'redistribute-time-for-tasks 'mend21)
			    time-changes scene last-time?))
		  (t (mapc
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
		     (redistribute-at-a-bound scene new-length scene-minimum scene-maximum))))))

;; A scene whose new length is at its least or its most: within them, each task given
;; its ideal time, and the repair noted. Anything else (not a number) is Ken's
;; "arithmetic goofed up", as before.
(defun redistribute-at-a-bound (scene new-length scene-minimum scene-maximum)
  (cond ((and (not (< new-length scene-minimum)) (not (> new-length scene-maximum)))
	 (revival-note scene 'scene-at-its-bound '(arithmetic goofed up) 'within
		       (list 'new-length new-length 'least scene-minimum 'most scene-maximum))
	 (give-every-task-its-ideal-time scene))
	(t (shouldnt-happen 'redistribute-time-for-tasks '(arithmetic goofed up)))))

;; redistribute-time-for-tasks is CHOMET's (src/director/tags/ani.lisp: AUTOLOAD from
;; KEN;CHOMET), so it is wrapped once CHOMET has loaded.
(+after-load '|ken;chomet >|
  '(revival-wrap 'redistribute-time-for-tasks 'mend21 'redistribute-time-for-tasks-at-a-bound))

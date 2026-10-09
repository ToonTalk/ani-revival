;;; -*-lisp-*-
;;; REVIVE;MEND6: M6, characters in the scene first, and bringing an off-stage victim on.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. friend-of, enemy-of and stranger-of take the first sibling that fits,
;;; anywhere (sugest.123:329, 349-395). They look first among everyone named in any of
;;; the scene's task descriptions (SCENE records scene participation only for each
;;; task's subject, scene.9:463-465); if no one in the scene fits, the 1978 pick
;;; stands. And an off-stage victim of move-to-and-hits, chases-to or pushes-around is
;;; brought on with Ken's getting-on-stage step from goes-to-and-accompanys
;;; (disply.311:192-209), the walk counted in the estimate (disply.311:177-184).
;;; REVIVE;MEND5's move-to brings on the one it meets the same way.

;;; ------------------------------------------------- 1. in the scene first

;; The three generators find a character for a convey method's binding, such as mean's
;; (hurts ,character (character-that-satisfies (enemy-of ,character nil))) (dscrp.17:
;; 171-172). Ken: "of course first is a stupid way of doing it (should really take many
;; things into account)" (sugest.123:329). So, for the task being given its suggestions,
;; a character named in the scene comes first. Who is in the scene is read from the
;; scene's task descriptions: SCENE memorizes scene-participation only for a task's
;; subject, "what about other participents?" (scene.9:463-465), so the victim of
;; (accompanys troll kid) would not count.
;;
;; character-that-satisfies is given the task as its "scene": an establish task asks
;; for its suggestions with itself (scene.9:378-381), and establish-suggestions hands
;; it on through distill-suggestions and bind-convey-method to come-up-with-values
;; (sugest.123:15-25, 91-92, 261-283). The task is kept here while the generator runs.
(or (boundp ':revival-generator-task) (setq :revival-generator-task nil))

(defun character-that-satisfies-for-the-task (condition scene)
  (let ((:revival-generator-task scene))
       (funcall (revival-wrapped 'character-that-satisfies 'mend6) condition scene)))

;; Everyone named in the descriptions of the tasks of the task's scene (a task knows
;; its scene, scene.9:466; each task's description is in its task package, scene.9:
;; 459-462). Only siblings are ever looked for among these.
(defun named-in-the-scene-of (task)
  (let ((scene (or (ask ,task recall your scene) task)))
       (named-in-tasks (append (ask ,scene recall your convey-tasks)
			       (ask ,scene recall your establish-tasks)
			       (ask ,scene recall your display-tasks)))))

(defun named-in-tasks (tasks)
  (mapcan (function
	   (lambda (task)
		   (atoms-named-in (get (ask ,task recall your task) 'description))))
	  tasks))

(defun atoms-named-in (form)
  (cond ((null form) nil)
	((atom form) (list form))
	(t (append (atoms-named-in (car form)) (atoms-named-in (cdr form))))))

;; The siblings left to look at in the scene. Ken's loop has gone through the
;; character's siblings in order and stopped at its pick; any sibling in the scene
;; before the pick has failed already. So there are none left if there is no task, or
;; Ken's loop found no one, or found someone in the scene (who is then the first in
;; the scene to fit too); otherwise they are the siblings after the pick who are named
;; in the scene, in Ken's order.
(defun siblings-in-the-scene-after (character as-in-1978)
  (let ((task :revival-generator-task))
       (cond ((or (null task) (equal as-in-1978 '(no such character exists))) nil)
	     (t (let ((named (named-in-the-scene-of task)))
		     (cond ((memq as-in-1978 named) nil)
			   (t (mapcan (function
				       (lambda (sibling)
					       (and (memq sibling named) (list sibling))))
				      (rest (memq as-in-1978
						  (ask ,character recall your siblings)))))))))))

(defun picked-in-the-scene-first (as-in-1978 sibling)
  (let ((task :revival-generator-task))
       (revival-note task 'in-scene-first as-in-1978 sibling
		     (list 'named-in (or (ask ,task recall your scene) task)))
       sibling))

;; enemy-of: "either hates it or is hated by" (sugest.123:373-395). Ken's test, on the
;; siblings left in the scene.
(defun first-sibling-that-is-or-does-in-the-scene-first (descriptor character)
  (let ((as-in-1978
	 (funcall (revival-wrapped 'first-sibling-that-is-or-does 'mend6) descriptor character)))
       (do ((i (siblings-in-the-scene-after character as-in-1978) (rest i)))
	   ((null i) as-in-1978)
	   (let ((sibling (first i)))
		(cond ((or (ask-if-exists
			    (relationship-of ,character ,sibling)
			    recall if any items match (description: type ?
								    descriptor ,descriptor
								    %))
			   (ask-if-exists
			    (relationship-of ,sibling ,character)
			    recall if any items match (description: type ?
								    descriptor ,descriptor
								    %)))
		       (return (picked-in-the-scene-first as-in-1978 sibling))))))))

;; friend-of: a sibling the character likes or loves (sugest.123:357-370). likes asks
;; the relationship for its description without checking that it exists (prereq.19:
;; 57-60, 110-120), and Ken's loop may never have reached these siblings; a sibling the
;; character has no relationship with is not one it likes, which is what likes answers
;; once REVIVE;MEND4 guards meet-description-of.
(defun first-sibling-that-satisfies-relationship-in-the-scene-first (character relationship)
  (let ((as-in-1978
	 (funcall (revival-wrapped 'first-sibling-that-satisfies-relationship 'mend6)
		  character relationship)))
       (do ((i (siblings-in-the-scene-after character as-in-1978) (rest i)))
	   ((null i) as-in-1978)
	   (and (exists? '(relationship-of ,character ,(first i)))
		(ask ,relationship
		     recall if any items match (status-of (,relationship ,character ,(first i)) met))
		(return (picked-in-the-scene-first as-in-1978 (first i)))))))

;; stranger-of: "if there is no relationship then they are strangers" (sugest.123:341-354).
(defun first-sibling-that-is-not-related-in-the-scene-first (character)
  (let ((as-in-1978
	 (funcall (revival-wrapped 'first-sibling-that-is-not-related 'mend6) character)))
       (do ((i (siblings-in-the-scene-after character as-in-1978) (rest i)))
	   ((null i) as-in-1978)
	   (and (not (exists? '(relationship-of ,character ,(first i))))
		(not (exists? '(relationship-of ,(first i) ,character)))
		(return (picked-in-the-scene-first as-in-1978 (first i)))))))

;; All four are SUGEST's (src/director/tags/ani.lisp: AUTOLOAD from KEN;SUGEST), so they
;; are wrapped once SUGEST has loaded.
(+after-load '|ken;sugest >|
  '(progn
    (revival-wrap 'character-that-satisfies 'mend6 'character-that-satisfies-for-the-task)
    (revival-wrap 'first-sibling-that-is-or-does 'mend6
		  'first-sibling-that-is-or-does-in-the-scene-first)
    (revival-wrap 'first-sibling-that-satisfies-relationship 'mend6
		  'first-sibling-that-satisfies-relationship-in-the-scene-first)
    (revival-wrap 'first-sibling-that-is-not-related 'mend6
		  'first-sibling-that-is-not-related-in-the-scene-first)))

;;; ------------------------------------------------- 2. bringing on

;; When no one in the scene fits, the 1978 pick stands, and that can be someone who is
;; not on the stage. A victim not placed yet is placed, when the one who hits, chases
;; or pushes her already has a place and there is no cut, off the stage: PLACE gives
;; her the "if no cut" place, (medium-distance-and-offstage ...) (place-medium-
;; distance-apart, place.45:9-23; initial-locations-for-two-characters, place.45:137-
;; 146). The hits, the chase or the pushes then happen off the picture. The thesis:
;; "Among the prerequisites for X going to meet Y is that Y be on stage. X need not be
;; on stage since it can come on and then meet Y" (AI-TR-540 L2392-2396).
;;
;; Ken's DISPLY brings on a friend who is off the stage: goes-to-and-accompanys' first
;; step, getting-on-stage, walks the friend to (on-stage-near friend (vicinity-of
;; character)), while the character goes to meet the friend and, on contact, stops that
;; walk (disply.311:186-213). Run alongside a quick mover, as the troll of
;; test/stories/stress/offstage-victim.lisp is, the contact comes before the friend is
;; on the stage, and the hits follow off the picture (tried: the goat stopped at y
;; -513, the picture ending at 500). Run by itself, it walks the victim into the mover,
;; who is where it goes. So the victim's getting-on-stage is run first, by itself, and
;; to on-stage-near the place half way between her and the mover (INTERF's
;; half-way-between, interf.149:368-372): on-stage-near "is no op if already on the
;; stage otherwise closest place clearly on stage" (interf.149:273-287). She comes on
;; towards the mover, as Ken's friend does, and the mover's own approach in the hits,
;; the chase's pursuit or the pushes, as Ken planned them, does the rest.

;; Off the stage: placed at one of INTERF's off-stage positions, or where x or y is .5
;; or more from the middle (INTERF's test for on the stage, interf.149:111).
(defun off-the-stage? (character subscene)
  (let ((where (location-of character subscene)))
       (cond ((eq (first where) 'missing-location-of) nil)
	     ((off-stage-position? where))
	     (t (let ((xy (find-xy-position where subscene)))
		     (and (eq (first xy) 'xy-position)
			  (not (and (< (abs (second xy)) .5) (< (abs (third xy)) .5)))))))))

(defun off-stage-position? (where)
  (cond ((atom where) nil)
	((eq (first where) 'symbolic-position) (off-stage-position? (second where)))
	(t (memq (first where) '(off-screen-position
				 small-distance-from-and-offstage
				 medium-distance-from-and-offstage
				 good-distance-from-and-offstage)))))

;; Whether other starts the subscene off the stage, or will be placed off it as above.
(defun starts-off-the-stage? (other character subscene)
  (cond ((located? '(vicinity-of ,other) subscene) (off-the-stage? other subscene))
	(t (and (located? '(vicinity-of ,character) subscene)
		(not (eq (ask ,subscene recall your transition-type) 'cut))))))

;; Ken's getting-on-stage step (disply.311:192-203), planned for other coming on towards
;; character, as said above. Returns its plan. method is what needs other on the
;; stage, for the note.
(defun bring-on (other character factor subscene method)
  (let ((get-on-stage-plan (activity-name-of 'getting-on-stage)))
       (revival-note subscene 'brought-on-stage
		     (list other 'at (location-of other subscene))
		     get-on-stage-plan
		     (list 'off-the-stage 'for method))
       (move-character get-on-stage-plan
		       other
		       (getting-on-stage-place other character)
		       'stationary-target
		       '(stop-when-there (quote ,subscene))
		       0.0 ;;start right away
		       (divide-speed-by-factor other factor subscene)
		       'careful ;;of collisions
		       subscene)))

(defun getting-on-stage-place (other character)
  '(on-stage-near ,other (half-way-between (vicinity-of ,other) (vicinity-of ,character))))

;; The time that walk takes, as estimate-time-to-move-character estimates a walk
;; (place.45:524-538); the goal may be the distance itself (time-to-walk, place.45:548).
(defun time-to-get-on-stage (other character subscene)
  (estimate-time-to-move-character other
				   (cond ((located? '(vicinity-of ,other) subscene)
					  (getting-on-stage-place other character))
					 (t (half-way-from-where-place-puts character subscene)))
				   '(stop-when-there (quote ,subscene))
				   (special-dynamics-of other subscene)
				   subscene
				   (*$ .5 .33)))

;; For one with no place yet: half the way from where PLACE will put her, the
;; "if no cut" place (medium-distance-from-and-offstage (vicinity-of character))
;; (place.45:137-141, 511-520), to character. If that can't be worked out yet, half of
;; a third of the screen, the distance it aims at (interf.149:665-670).
(defun half-way-from-where-place-puts (character subscene)
  (let ((from (find-xy-position '(medium-distance-from-and-offstage (vicinity-of ,character))
				subscene))
	(to (find-xy-position '(vicinity-of ,character) subscene)))
       (cond ((and (eq (first from) 'xy-position) (eq (first to) 'xy-position))
	      (*$ .5 (xy-distance (-$ (second to) (second from)) (-$ (third to) (third from)))))
	     (t (*$ .5 .33)))))

;; A method's estimate, with the getting-on-stage first if other starts off the stage.
(defun plus-time-to-bring-on (other character subscene estimates)
  (cond ((starts-off-the-stage? other character subscene)
	 (add-time-estimates (time-to-get-on-stage other character subscene) estimates))
	(t estimates)))

;; Ani estimates while she chooses methods (get-estimated-time-of, chomet.123:448-460;
;; ideal-time-for-task, chomet.123:95-116), before any subscene is planned and before RUN
;; loads where the last scene left everyone (run.65:47-53): no one has a place then, and
;; Ken's estimates use their defaults. The subscene remembers each estimate
;; (disply.311:12-16) and stretches its methods by the time it is allotted over the
;; longest of them, when it runs them (run your methods, scene.9:159-197); by then the
;; places are known. So there a method that will bring someone on is estimated again,
;; with the walk counted, rather than remembered.
(defun maximum-ideal-time-of-counting-bringing-on (methods subscene)
  (mapc (function
	 (lambda (method)
		 (let ((who (mover-and-other-of method)))
		      (and who
			   (starts-off-the-stage? (second who) (first who) subscene)
			   (ask ,subscene forget your (time-estimates-for ,method))))))
	methods)
  (funcall (revival-wrapped 'maximum-ideal-time-of 'mend6) methods subscene))

;; Who moves and who may have to be brought on, in a method that brings someone on.
(defun mover-and-other-of (method)
  (cond ((memq (first method) '(move-to-and-hits chases-to pushes-around))
	 (list (second method) (third method)))
	((eq (first method) 'move-to)
	 (list (second method) (character-involved-in (third method))))))

(+after-load '|ken;scene >|
  '(revival-wrap 'maximum-ideal-time-of 'mend6 'maximum-ideal-time-of-counting-bringing-on))

;; Ken's run adds its movement to the subscene's movements (SOME's "add ... to your
;; list of" puts it first); the bringing on is run before it, as a sequence:.
(defun bring-on-first (plan subscene)
  (let ((movements (ask ,subscene recall your movements)))
       (ask ,subscene set your movements to
	    ((sequence: ,plan ,(first movements)) !,(rest movements)))))

;; move-to-and-hits, chases-to and pushes-around, each run as Ken wrote it, but first,
;; when the victim starts off the stage, placed by Ken's own placing (which his run
;; then finds done) and brought on; and its estimate counts the bringing on.
(defun extend-hits-chases-and-pushes-to-bring-on ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(estimate time for move-to-and-hits ?character ?victum in ?subscene) move-to-and-hits
	(plus-time-to-bring-on
	 victum character subscene
	 (ask-old :self estimate time for move-to-and-hits ,character ,victum in ,subscene)))
       (define-extension-method
	(run move-to-and-hits ?character ?victum in ?subscene stretched by ?factor) move-to-and-hits
	(cond ((starts-off-the-stage? victum character subscene)
	       (initial-locations-for-goes-to-and-hits character victum subscene)
	       (let ((plan (bring-on victum character factor subscene 'move-to-and-hits)))
		    (ask-old :self run move-to-and-hits ,character ,victum
			     in ,subscene stretched by ,factor)
		    (bring-on-first plan subscene)))
	      (t (ask-old :self run move-to-and-hits ,character ,victum
			  in ,subscene stretched by ,factor))))
       (define-extension-method
	(estimate time for chases-to ?chaser ?chasee ?destination in ?subscene) chases-to
	(plus-time-to-bring-on
	 chasee chaser subscene
	 (ask-old :self estimate time for chases-to ,chaser ,chasee ,destination in ,subscene)))
       (define-extension-method
	(run chases-to ?chaser ?chasee ?destination in ?subscene stretched by ?factor) chases-to
	(cond ((starts-off-the-stage? chasee chaser subscene)
	       (initial-locations-for-chases-to chaser chasee destination subscene)
	       (let ((plan (bring-on chasee chaser factor subscene 'chases-to)))
		    (ask-old :self run chases-to ,chaser ,chasee ,destination
			     in ,subscene stretched by ,factor)
		    (bring-on-first plan subscene)))
	      (t (ask-old :self run chases-to ,chaser ,chasee ,destination
			  in ,subscene stretched by ,factor))))
       (define-extension-method
	(estimate time for pushes-around ?pusher ?pushee in ?subscene) pushes-around
	(plus-time-to-bring-on
	 pushee pusher subscene
	 (ask-old :self estimate time for pushes-around ,pusher ,pushee in ,subscene)))
       (define-extension-method
	(run pushes-around ?pusher ?pushee in ?subscene stretched by ?factor) pushes-around
	(cond ((starts-off-the-stage? pushee pusher subscene)
	       (initial-locations-for-pushes-around pusher pushee subscene)
	       (let ((plan (bring-on pushee pusher factor subscene 'pushes-around)))
		    (ask-old :self run pushes-around ,pusher ,pushee
			     in ,subscene stretched by ,factor)
		    (bring-on-first plan subscene)))
	      (t (ask-old :self run pushes-around ,pusher ,pushee
			  in ,subscene stretched by ,factor))))))

(+after-load '|ken;disply >|
  '(revival-once 'mend6-bring-on 'extend-hits-chases-and-pushes-to-bring-on))

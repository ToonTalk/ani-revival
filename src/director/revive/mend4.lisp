;;; -*-lisp-*-
;;; REVIVE;MEND4: M4, a missing relationship.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. An exists? guard in PREREQ's meet-description-of, which asks
;;; (relationship-of a b) without checking that it exists (prereq.19:57-60, 110-120),
;;; so the answer is "don't know", as enemy-of and stranger-of already guard
;;; (sugest.123:352-353, 385-394). Its notes go on the task whose suggestion is being
;;; bound, once each: likes asks four times (prereq.19:115-118).
;;;
;;; Where it stops. friend-of goes through a character's siblings, most recently
;;; defined first, asking likes about each (sugest.123:357-370); likes asks
;;; meet-description-of about (relationship-of a b) (prereq.19:113-119). A story need
;;; not relate every pair, and an unrelated sibling stops pass 2 with NO-SUCH-ACTOR
;;; (test/stories/stress/missing-relationships.lisp: "(RELATIONSHIP-OF GOAT TROLL) is
;;; not an actor"). With the guard, likes answers dont-know (prereq.19:119) and the
;;; scan goes on to the next sibling.

;; The task to note it on. meet-description-of answers for likes and stronger
;; (prereq.19:41-55, 110-120), and they are asked (status-of) only while Ani binds a
;; convey suggestion's character, by character-that-satisfies (friend-of,
;; sugest.123:357-370), whose "scene" is the establish task (it passes itself,
;; scene.9:378-381; sugest.123:15-25, 54-92, 237-283); or while she chooses a task's
;; methods, by choose-methods-for-task (prerequisites and best-whens,
;; chomet.123:200-203, 363-387, 558-577). Each is wrapped to bind :task-at-hand.
(or (boundp ':task-at-hand) (setq :task-at-hand nil))

(defun character-that-satisfies-for-the-task-at-hand (condition scene)
  (let ((:task-at-hand scene))
       (funcall (revival-wrapped 'character-that-satisfies 'mend4) condition scene)))

(+after-load '|ken;sugest >|
  '(revival-wrap 'character-that-satisfies 'mend4
		 'character-that-satisfies-for-the-task-at-hand))

(defun choose-methods-for-the-task-at-hand (task)
  (let ((:task-at-hand task))
       (funcall (revival-wrapped 'choose-methods-for-task 'mend4) task)))

(+after-load '|ken;chomet >|
  '(revival-wrap 'choose-methods-for-task 'mend4 'choose-methods-for-the-task-at-hand))

;; A relationship the story doesn't give has no description, so it meets none, as
;; ask-if-exists makes it for enemy-of (sugest.123:385-394), and the note names it on
;; the task. An equal note is memorized once, so likes' four asks, and a scan done
;; twice (friendly's helps and accompanys both look for a friend, dscrp.17:109-132),
;; leave one note. (Asked outside both, at a listener say, there is no task to note it
;; on.) exists? finds a relationship only once its file has loaded (the
;; tags name the file under relationship-of, which exists? doesn't look at, KEN1;DRECT
;; }^rsv.6:63-65, 687-689); the story's relationships are in KEN;CINDY, with the
;; characters whose siblings are asked about, so it has.
(defun meet-description-of-what-exists (character descriptor type)
  (cond ((exists? character)
	 (funcall (revival-wrapped 'meet-description-of 'mend4) character descriptor type))
	(t (and :task-at-hand
		(revival-note :task-at-hand 'missing-relationship character
			      'dont-know 'no-such-relationship))
	   nil)))

(+after-load '|ken;prereq >|
  '(revival-wrap 'meet-description-of 'mend4 'meet-description-of-what-exists))

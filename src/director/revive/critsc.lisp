;;; -*-lisp-*-
;;; REVIVE;CRITSC: keep two characters apart in a scene, and start one far from another.
;;;
;;; This file is ours, not Ken's. It is part of CRITIC (src/pipeline.js, EXTENSIONS;
;;; reports/chapter-x/design-criticism.md, section 4.3).
;;;
;;; Keep apart. Ken's third kind of criticism: "If one says that during a particular
;;; scene two characters should not get very close to each other (as one might be
;;; tempted to say about Cinderella and the Prince in the first scene) then this
;;; post-condition could be added to all the methods in that scene and it could be
;;; remade" (AI-TR-540 p. 190); and his footnote on the Introduction's fourth part, where
;;; Cinderella goes over to the Prince: "we could say that Cinderella is not to meet the
;;; Prince until the third scene and Ani would redo this subscene (and unless necessary no
;;; other parts of the film) picking something else to establish Cinderella's
;;; personality" (p. 64). What brings two together is read from the code, not invented:
;;; the contact table below, which tools/critic-contacts.mjs writes from every way of
;;; showing's run receiver (a walk of one to (contact-with B by A), or of the two
;;; together, move-characters), and from every verb whose ways of showing all do.
;;; test/critic.test.js fails if the table and the files disagree. The post-condition is
;;; checked as Ken rules a method out, as a prerequisite not met: at both of CHOMET's
;;; levels (the lists REVIVE;CRITIC wraps for a veto), a way that would bring the two
;;; together in a scene criticized so is set aside with Ken's reject-suggestion
;;; (chomet.123:305-310) and the reason score-suggestions gives a prerequisite not met
;;; (chomet.123:253-255),
;;;   (prerequisites-not-met ((kept-apart-by-you cinderella prince c3)))
;;; rather than by adding the prerequisite to the suggestion: its structure may be
;;; DISPLY's or CONVEY's own (their suggestions are quoted forms), and changing it would
;;; carry the criticism into Ani's knowledge, the cheating of p. 189. So the
;;; Introduction's establishing of Cinderella's friendliness by going to the Prince or
;;; helping him is set aside, and Ani picks something else, or, with Ken's knowledge
;;; alone, has nothing else and the task is cant-do (approve-or-remake-tasks-choices,
;;; chomet.123:28-34). After the scene is planned, the walks of its plan are checked
;;; (src/pipeline.js contactsIn): one that still brings the two together is a way the
;;; table missed.
;;;
;;; Start far. Ken's remedy for No Longer Kept Apart, where "the fairy godmother just
;;; appears and is quickly gone": "to have the fairy godmother start far from
;;; Cinderella" (p. 69). In 1978 she was never on the stage in Kept Apart, and where she
;;; is in No Longer Kept Apart is where Kept Apart's POSIT file left her, beside
;;; Cinderella, so PLACE leaves both where they are (initial-locations-for-two-characters,
;;; place.45:116-150). PLACE's three ways of placing two characters, a small, a medium
;;; and a large distance apart (place.45:9-53), with which the ways of showing place
;;; their two (goes-to-and-accompanys a medium distance, move-small-part-towards a large
;;; one, KNOW's follows-behind a small one), are wrapped: in the first part of the
;;; criticized scene where the two are placed, and only while the one to start far is
;;; where an earlier scene left her (or nowhere), that place is forgotten and Ken's
;;; place-large-distance-apart (place.45:25-39) places her, far off and off the stage
;;; where PLACE asks for (large-distance-and-offstage ...), which REVIVE;MEND19 defines
;;; (Ken never did). The subscene notes
;;;   (heeded-criticism: id c4 what start-far was (xy-position 0.0 0.0) now <her place>
;;;		       because (far-from cinderella not place-medium-distance-apart))

;;; ------------------------------------------------- the contact table

;;; ---- the contact table, written by tools/critic-contacts.mjs (do not edit by hand)
;;; Each display method's run receiver, (method pair ...), a pair the two of its arguments it
;;; brings together (1 its first argument, (place n) the character of its n-th, a place);
;;; a method with none brings no two together. Then each verb of CONVEY's (and the
;;; revival's) whose every way of showing brings the same two of its characters together.
(setq :critic-display-contacts
      '(
	(chases-to) ;;disply.311:48
	(move-to-and-hits (1 2)) ;;disply.311:128; disply.311:138
	(goes-to-and-accompanys (1 2)) ;;disply.311:186; disply.311:206, disply.311:214
	(pushes-around (1 2)) ;;disply.311:247; disply.311:279, disply.311:289
	(stands-guard) ;;disply.311:419
	(move-to-each-other (1 2)) ;;disply.311:653; disply.311:661, disply.311:671
	(move-small-part-towards) ;;disply.311:707
	(repeatedly-come-in-contact (1 2)) ;;disply.311:759; disply.311:795, disply.311:804
	(alternately-turn) ;;disply.311:885
	(move-near-and-turn) ;;disply.311:965
	(exit-by) ;;disply.311:1022
	(change:) ;;disply.311:1047
	(change-to:) ;;disply.311:1063
	(look-change:) ;;REVIVE;ALTER:71
	(look-change-to:) ;;REVIVE;ALTER:80
	(bridge-to:) ;;REVIVE;CHSHOW:392
	(goes-to-and-transforms (1 2)) ;;REVIVE;CHSHOW:407; REVIVE;CHSHOW:563
	(changes-while-wandering) ;;REVIVE;CHSHOW:416
	(helps-along (1 2)) ;;REVIVE;KNOWDI:73; REVIVE;KNOWDI:111, REVIVE;KNOWDI:118
	(moves-away-from) ;;REVIVE;KNOWDI:158
	(follows-behind (1 2)) ;;REVIVE;KNOWDI:213; REVIVE;KNOWDI:233
	(move-to (1 (place 2))))) ;;REVIVE;MEND5:89; REVIVE;MEND5:119
(setq :critic-convey-contacts
      '(
	(meets (1 2)) ;;move-to convey.64:76
	(pushes (1 2)) ;;pushes-around convey.64:86
	(hurts (1 2)) ;;move-to-and-hits convey.64:95
	(accompanys (1 2)) ;;goes-to-and-accompanys convey.64:120
	(helps (1 2)) ;;helps-along REVIVE;KNOWCV:25
	(follows (1 2)))) ;;follows-behind REVIVE;KNOWCV:45
;;; ---- the end of the contact table

;; Whether the method's form brings a and b together, by the table: one of its pairs is
;; a and b, either way round, each a position of the form or (place n), a character
;; in the place at n.
(defun critic-together? (form a b table)
  (do ((p (rest (assq (first form) table)) (rest p)))
      ((null p) nil)
      (and (or (and (critic-is? form (first (first p)) a) (critic-is? form (second (first p)) b))
	       (and (critic-is? form (first (first p)) b) (critic-is? form (second (first p)) a)))
	   (return t))))

(defun critic-is? (form position character)
  (cond ((numberp position) (eq (nth position form) character))
	(t (critic-in? character (nth (second position) form)))))

(defun critic-in? (x tree)
  (cond ((atom tree) (eq x tree))
	(t (or (critic-in? x (car tree)) (critic-in? x (cdr tree))))))

;;; ------------------------------------------------- keep apart

;; The keep-apart criticism of the task's scene the method would break, or nil.
(defun critic-keeping-apart (task form table)
  (and (not (atom form))
       (do ((c (critic-for-scene 'keep-apart (critic-scene-of task)) (rest c)))
	   ((null c) nil)
	   (and (critic-together? form (first (get (first c) 'between))
				  (second (get (first c) 'between)) table)
		(return (first c))))))

;; The suggestions with those that would bring two kept apart together set aside, as a
;; prerequisite not met, and noted on the task.
(defun critic-kept-apart (suggestions task level method-of table)
  (do ((s suggestions (rest s))
       (kept nil))
      ((null s) (reverse kept))
      (let ((form (funcall method-of (first s))))
	   (let ((c (critic-keeping-apart task form table)))
		(cond (c (reject-suggestion
			  task (first s)
			  (list 'prerequisites-not-met
				(list (list 'kept-apart-by-you (first (get c 'between))
					    (second (get c 'between)) (get c 'id)))))
			 (critic-heeded task c 'keep-apart form 'set-aside
					(list 'brings-together (first (get c 'between))
					      (second (get c 'between)) level)))
		      (t (setq kept (cons (first s) kept))))))))

(defun get-display-method-suggestions-keeping-apart (task)
  (let ((suggestions (funcall (revival-wrapped 'get-display-method-suggestions 'critsc) task)))
       (cond ((null :critic-record) suggestions)
	     (t (critic-kept-apart suggestions task 'display 'critic-display-method-of
				   :critic-display-contacts)))))

(defun get-convey-method-suggestions-keeping-apart (task)
  (let ((suggestions (funcall (revival-wrapped 'get-convey-method-suggestions 'critsc) task)))
       (cond ((null :critic-record) suggestions)
	     (t (critic-kept-apart suggestions task 'convey 'critic-convey-method-of
				   :critic-convey-contacts)))))

(+after-load '|ken;chomet >|
  '(progn (revival-wrap 'get-display-method-suggestions 'critsc
			'get-display-method-suggestions-keeping-apart)
	  (revival-wrap 'get-convey-method-suggestions 'critsc
			'get-convey-method-suggestions-keeping-apart)))

;;; ------------------------------------------------- start far

(or (boundp ':critic-started-far) (setq :critic-started-far nil)) ;;the criticisms heeded

;; The start-far criticism of the subscene's scene for the two places, not yet heeded,
;; whose one to start far is where an earlier scene left her, or nowhere; or nil.
(defun critic-starting-far (subscene place-1 place-2)
  (do ((c (critic-for-scene 'start-far (ask ,subscene recall your scene)) (rest c)))
      ((null c) nil)
      (let ((who (get (first c) 'who))
	    (from (get (first c) 'from)))
	   (and (not (memq (get (first c) 'id) :critic-started-far))
		(or (and (critic-in? who place-1) (critic-in? from place-2))
		    (and (critic-in? who place-2) (critic-in? from place-1)))
		(critic-left-by-an-earlier-scene? subscene who)
		(return (first c))))))

;; Where the subscene has her: nowhere, or where an earlier scene's filming left her
;; ((place: where ... why (ended up here in kept-apart) ...), from its POSIT file).
(defun critic-left-by-an-earlier-scene? (subscene who)
  (let ((why (get (ask ,subscene recall your (location-of ,who)) 'why)))
       (or (null (ask ,subscene recall your (location-of ,who)))
	   (and (not (atom why)) (eq (first why) 'ended)))))

;; PLACE's placing of two, as placer (place-small-, place-medium- or
;; place-large-distance-apart) would place them, unless a start-far criticism applies:
;; then where an earlier scene left the one to start far is forgotten, and Ken's
;; place-large-distance-apart places her (through its own wrapper, which passes through,
;; the criticism being heeded).
(defun critic-place (placer action place-1 place-2 cut-distances subscene)
  (let ((c (and :critic-record (critic-starting-far subscene place-1 place-2))))
       (cond ((null c)
	      (funcall (revival-wrapped placer 'critsc) action place-1 place-2 cut-distances subscene))
	     (t (let ((who (get c 'who)))
		     (let ((was (get (ask ,subscene recall your (location-of ,who)) 'where)))
			  (setq :critic-started-far (cons (get c 'id) :critic-started-far))
			  (ask ,subscene forget your (location-of ,who))
			  (prog1 (place-large-distance-apart action place-1 place-2 cut-distances subscene)
				 (critic-heeded subscene c 'start-far was
						(get (ask ,subscene recall your (location-of ,who)) 'where)
						(list 'far-from (get c 'from) 'not placer))))))))))

(defun place-small-distance-apart-heeding-criticism (action place-1 place-2 cut-distances subscene)
  (critic-place 'place-small-distance-apart action place-1 place-2 cut-distances subscene))

(defun place-medium-distance-apart-heeding-criticism (action place-1 place-2 cut-distances subscene)
  (critic-place 'place-medium-distance-apart action place-1 place-2 cut-distances subscene))

(defun place-large-distance-apart-heeding-criticism (action place-1 place-2 cut-distances subscene)
  (critic-place 'place-large-distance-apart action place-1 place-2 cut-distances subscene))

(+after-load '|ken;place >|
  '(progn (revival-wrap 'place-small-distance-apart 'critsc
			'place-small-distance-apart-heeding-criticism)
	  (revival-wrap 'place-medium-distance-apart 'critsc
			'place-medium-distance-apart-heeding-criticism)
	  (revival-wrap 'place-large-distance-apart 'critsc
			'place-large-distance-apart-heeding-criticism)))

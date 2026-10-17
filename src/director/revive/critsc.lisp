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
;;; one, KNOW's follows-behind a small one), are wrapped: where the two are placed in
;;; the criticized scene and the one to start far is still where an earlier scene left
;;; her (or nowhere), with no part yet in this scene, that place is forgotten in the part
;;; (after Ken's own test for a cut, which his placers make first) and Ken's
;;; place-large-distance-apart (place.45:25-39) places her, far off and off the stage
;;; where PLACE asks for (large-distance-and-offstage ...), which REVIVE;MEND19 defines
;;; (Ken never did). The subscene notes
;;;   (heeded-criticism: id c4 what start-far was (xy-position 0.0 0.0) now <her place>
;;;		       because (far-from cinderella not place-medium-distance-apart))
;;; and where it can't be heeded, or needn't be, it says so (below, "Where it acts").

;;; ------------------------------------------------- the contact table

;;; ---- the contact table, written by tools/critic-contacts.mjs (do not edit by hand)
;;; Each display method's run receiver, (method pair ...), a pair the two of its arguments it
;;; brings together (1 its first argument, (place n) the character of its n-th, a place);
;;; a method with none brings no two together. Then each verb of CONVEY's (and the
;;; revival's) whose every way of showing brings the same two of its characters together,
;;; (verb pair ... by way ...), with its ways of showing: a verb counts only in a job that
;;; has one of them (helps, by KNOW's helps-along, not in a film made without KNOW).
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
	(meets (1 2) by move-to) ;;move-to convey.64:76
	(pushes (1 2) by pushes-around) ;;pushes-around convey.64:86
	(hurts (1 2) by move-to-and-hits) ;;move-to-and-hits convey.64:95
	(accompanys (1 2) by goes-to-and-accompanys) ;;goes-to-and-accompanys convey.64:120
	(helps (1 2) by helps-along) ;;helps-along REVIVE;KNOWCV:25
	(follows (1 2) by follows-behind))) ;;follows-behind REVIVE;KNOWCV:45
;;; ---- the end of the contact table

;; Whether the method's form brings a and b together, by the table: one of its pairs is
;; a and b, either way round, each a position of the form or (place n), a character
;; in the place at n. A verb's entry ends with by and its ways of showing, and counts
;; only if this job has one of them (an actor of that name; KNOW's helps-along, say, is
;; none in a film made without KNOW, where Ani has no way of showing helping at all).
(defun critic-together? (form a b table)
  (let ((entry (assq (first form) table)))
       (and (critic-shown-here? (rest (memq 'by entry)))
	    (do ((p (rest entry) (rest p)))
		((or (null p) (eq (first p) 'by)) nil)
		(and (or (and (critic-is? form (first (first p)) a) (critic-is? form (second (first p)) b))
			 (and (critic-is? form (first (first p)) b) (critic-is? form (second (first p)) a)))
		     (return t))))))

;; Whether this job has one of a verb's ways of showing (true of a display method's
;; entry, which names none).
(defun critic-shown-here? (ways)
  (or (null ways)
      (do ((w ways (rest w)))
	  ((null w) nil)
	  (and (get (first w) 'actor) (return t)))))

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
;;;
;;; Where it acts: where the one to start far is first placed in the scene, with the one
;;; to start far from, and only while she is where an earlier scene left her (her place
;;; "ended up here in" that scene, from its POSIT file) or nowhere, and has had no part
;;; yet in this scene. In a later part, a subscene with no place of hers inherits the
;;; last an earlier part had (Ken's location-package-of, interf.149:155-160); if she has
;;; had no part before it, that is still where the earlier scene left her, and she is
;;; taken as nowhere in this part (Ken's (place: where nowhere ...), as his cut-scene-here
;;; leaves a character, place.45:313-328), so that PLACE places her. Where she has already
;;; had a part in this scene (she is on the stage), placing her far would move her
;;; mid-scene, so the criticism is not heeded there, and the subscene notes
;;;   (unmet-criticism: id c4 what start-far was <her place> because (already-in-the-scene))
;;; Where Ken's own placing places her afresh, far from the other, anyway (his
;;; place-large-distance-apart, with her nowhere, or after a cut), it notes
;;; (already-far place-large-distance-apart), and PLACE places her. Each is tested afresh
;;; at each placing, so that a part SCENE redoes (extend-last-actions-of,
;;; scene.9:224-240, which puts the subscene back as it was before it ran its methods,
;;; her place and the note with it) is heeded again.

;; The start-far criticisms of the subscene's scene for the two places, in the record's
;; order: the one to start far in one place and the one to start far from in the other.
(defun critic-start-far-for (subscene place-1 place-2)
  (mapcan (function
	   (lambda (c)
		   (let ((who (get c 'who))
			 (from (get c 'from)))
			(and (or (and (critic-in? who place-1) (critic-in? from place-2))
				 (and (critic-in? who place-2) (critic-in? from place-1)))
			     (list c)))))
	  (critic-for-scene 'start-far (ask ,subscene recall your scene))))

;; Whether a part of the subscene's scene has a note of the criticism's already.
(defun critic-noted-in-scene? (subscene c)
  (let ((id (get c 'id)))
       (do ((s (ask ,(ask ,subscene recall your scene) recall your subscenes) (rest s)))
	   ((null s) nil)
	   (and (or (ask ,(first s) recall if any items match (heeded-criticism: id ,id what start-far %))
		    (ask ,(first s) recall if any items match (unmet-criticism: id ,id what start-far %)))
		(return t)))))

;; Whether she has had a part in an earlier part of the scene: an action of hers planned
;; there (actions-of, which PLACE's move-character adds to, place.45:151-216).
(defun critic-acted-before? (subscene who)
  (do ((s (ask ,subscene recall your previous-subscene) (ask ,s recall your previous-subscene)))
      ((null s) nil)
      (and (ask ,s recall your (actions-of ,who)) (return t))))

;; Whether PLACE has her where an earlier scene left her ((place: where ... why (ended up
;; here in kept-apart) ...)), or nowhere.
(defun critic-left-by-an-earlier-scene? (place)
  (let ((why (get place 'why)))
       (or (null place)
	   (and (not (atom why)) (eq (first why) 'ended)))))

;; PLACE's placing of two, as placer (place-small-, place-medium- or
;; place-large-distance-apart) would place them, unless a start-far criticism of theirs
;; applies here: then where an earlier scene left the one to start far is forgotten in
;; this part, and Ken's place-large-distance-apart places her.
(defun critic-place (placer action place-1 place-2 cut-distances subscene)
  (do ((cs (and :critic-record (critic-start-far-for subscene place-1 place-2)) (rest cs))
       (c nil))
      ((or c (null cs))
       (cond ((null c)
	      (funcall (revival-wrapped placer 'critsc) action place-1 place-2 cut-distances subscene))
	     (t (critic-place-far c placer action place-1 place-2 cut-distances subscene))))
      (let ((who (get (first cs) 'who)))
	   (let ((place (location-package-of who subscene)))
		(cond ((critic-noted-in-scene? subscene (first cs))) ;;heeded, or noted, already
		      ((or (critic-acted-before? subscene who)
			   (not (critic-left-by-an-earlier-scene? place)))
		       (critic-unmet subscene (first cs) 'start-far (get place 'where)
				     '(already-in-the-scene)))
		      (t (setq c (first cs))))))))

(defun critic-place-far (c placer action place-1 place-2 cut-distances subscene)
  (let ((who (get c 'who)))
       (let ((was (get (location-package-of who subscene) 'where)))
	    ;;as Ken's placers do first: cut, if where the two are calls for one
	    ;;(cut-if-distance-known-to-be, place.45:80-92)
	    (cut-if-distance-known-to-be cut-distances place-1 place-2 subscene)
	    (cond ((and (eq placer 'place-large-distance-apart)
			(or (null was) (eq (ask ,subscene recall your transition-type) 'cut)))
		   ;;Ken's own placer places her afresh, far from the other
		   (critic-unmet subscene c 'start-far was (list 'already-far placer))
		   (funcall (revival-wrapped placer 'critsc) action place-1 place-2 cut-distances subscene))
		  (t (ask ,subscene forget your (location-of ,who))
		     (and (location-package-of who subscene) ;;an earlier part's: nowhere in this one
			  (ask ,subscene set your (location-of ,who) to
			       (place: where nowhere why (start-far ,(get c 'id)) status undone)))
		     (prog1 (funcall (revival-wrapped 'place-large-distance-apart 'critsc)
				     action place-1 place-2 cut-distances subscene)
			    (critic-heeded subscene c 'start-far was
					   (get (ask ,subscene recall your (location-of ,who)) 'where)
					   (list 'far-from (get c 'from) 'not placer))))))))

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

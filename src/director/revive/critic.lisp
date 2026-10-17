;;; -*-lisp-*-
;;; REVIVE;CRITIC: Ani heeds a record of a user's criticism of its film.
;;;
;;; This file is ours, not Ken's. It is the "critic" extension (src/pipeline.js,
;;; EXTENSIONS), after Ken's Chapter X Section D, "Critics and Criticism" (AI-TR-540
;;; pp. 189-191): "Ani should be extended to accept criticism of the films and their
;;; justification. For many types of criticism there is an obvious response." The
;;; design is reports/chapter-x/design-criticism.md; what it did to Ken's Cinderella is
;;; reports/ext/critic/README.md.
;;;
;;; The record. Ken's footnote: "This could easily be implemented by having Ani check a
;;; record of user criticism whenever faced with several alternatives and removing those
;;; alternatives that were vetoed by the user." The record is kept with the film, not in
;;; its description (a criticism is of how Ani made the film, not of what it is to
;;; convey). The pipeline writes it, before each job of a film that has criticism, as
;;; KEN1;FILM CRITIC, one form for each criticism,
;;;   (criticism: id c1 kind another-way scene no-longer-kept-apart
;;;		 task (undoes fairy-godmother ...) level display
;;;		 vetoes goes-to-and-accompanys by you)
;;; and load-criticism reads it into :critic-record. Each kind of criticism is heeded
;;; where Ken's code chooses, by a wrapper that does nothing while :critic-record is nil:
;;;  - another way (Ken's (1), a veto): this file, at both of CHOMET's levels, how
;;;    something is shown (a display method) and what is shown (a convey method);
;;;  - too quick or too slow (Ken's (2)): REVIVE;CRITPC;
;;;  - keep two apart in a scene (Ken's (3)) and start one far from another (his remedy
;;;    for No Longer Kept Apart, p. 69): REVIVE;CRITSC.
;;; A film with no criticism never loads this file. Loaded with an empty record, every
;;; wrapper passes straight through (node tools/check-1978.mjs --extensions critic).
;;;
;;; What it leaves. Where a criticism was heeded, the actor it was heeded on (a task, a
;;; subscene) memorizes
;;;   (heeded-criticism: id C what W was X now Y because R)
;;; and where it could not be,
;;;   (unmet-criticism: id C what W was X because R)
;;; W the kind (another-way, pace, keep-apart, start-far), X what Ken's code had, Y what
;;; Ani did instead and R why. They are not revival-repair: notes, since a heeded
;;; criticism is not a repair; the glass box (src/pipeline.js glassBox) collects them
;;; under the key criticism. A criticism is per film: nothing here changes Ani's
;;; knowledge (CONVEY's or DISPLY's suggestions), which would be the cheating Ken's
;;; footnote on p. 189 rules out.

(or (boundp ':critic-record) (setq :critic-record nil))
(or (boundp ':critic-noted) (setq :critic-noted nil)) ;;the actors that memorized a note

;; The pipeline's KEN1;FILM CRITIC, read into :critic-record, in the record's order.
(defun load-criticism (file-name)
  (let ((file (open file-name 'in))
	(end (list 'end-of-file)))
       (do ((form (read file end) (read file end))
	    (forms nil (cond ((and (not (atom form)) (eq (first form) 'criticism:))
			      (cons form forms))
			     (t forms))))
	   ((eq form end) (close file) (setq :critic-record (reverse forms))))))

;; The scene a task is of, and the description that names it (its (task: description
;; d ...), scene.9:440-467), which stays the same when the film is remade, where its
;; actor's name (convey-task-3) and its subscene's number need not.
(defun critic-scene-of (task)
  (ask ,task recall your scene))

(defun critic-description-of (task)
  (get (ask ,task recall your task) 'description))

;; A task named by a criticism: by its description and, where the scene has more than
;; one task of that description, by the description of the task it came from as well
;; (its (task: ... source s), the establish task whose convey method it shows, or
;; initial-description), the record's source (sources, in a pace's, one for each of its
;; tasks, nil where one is enough). Two tasks of a scene can share a description (in
;; reports/ext/change/socializing's the-dance, Cinderella accompanies the Prince once for
;; her personality and once for their relationship), and a criticism of one is not of the
;; other. (The design had the task's place among those of its description; the scene's
;; list of tasks grows at the front as Ani chooses, so the place can shift where the
;; source does not.)
(defun critic-source-of (task)
  (let ((source (get (ask ,task recall your task) 'source)))
       (cond ((or (null source) (eq source 'initial-description)) source)
	     ((atom source) (critic-description-of source))
	     (t source))))

(defun critic-names-task? (c task description)
  (cond ((get c 'task)
	 (and (equal (get c 'task) description)
	      (or (null (get c 'source)) (equal (get c 'source) (critic-source-of task)))))
	((get c 'tasks)
	 (do ((d (get c 'tasks) (rest d))
	      (s (get c 'sources) (rest s)))
	     ((null d) nil)
	     (and (equal (first d) description)
		  (or (null (first s)) (equal (first s) (critic-source-of task)))
		  (return t))))
	(t t)))

;; The criticisms of a kind that apply to a task: of its scene (scene, or one of
;; scenes), and of it (task, or one of tasks), if they name a task. In the record's
;; order.
(defun critic-for-task (kind task)
  (let ((scene (critic-scene-of task))
	(description (critic-description-of task)))
       (mapcan (function
		(lambda (c)
			(and (eq (get c 'kind) kind)
			     (or (eq (get c 'scene) scene) (memq scene (get c 'scenes)))
			     (critic-names-task? c task description)
			     (list c))))
	       :critic-record)))

;; The criticisms of a kind of a scene, in the record's order.
(defun critic-for-scene (kind scene)
  (mapcan (function
	   (lambda (c)
		   (and (eq (get c 'kind) kind)
			(or (eq (get c 'scene) scene) (memq scene (get c 'scenes)))
			(list c))))
	  :critic-record))

;; What a heeded criticism did, memorized on the actor where it acted. A time or a
;; place is worked out again when a choice is made again (CHOMET's unchoose and choose,
;; chomet.123:51-56), so a pace or start-far note of the same criticism memorized there
;; before is forgotten first, leaving only the last; a method set aside is noted once
;; for each method (memorizing an equal item adds nothing).
(defun critic-heeded (actor criticism what was now because)
  (critic-note actor 'heeded-criticism: criticism what
	       '(was ,was now ,now because ,because)))

(defun critic-unmet (actor criticism what was because)
  (critic-note actor 'unmet-criticism: criticism what '(was ,was because ,because)))

(defun critic-note (actor head criticism what rest)
  (let ((id (get criticism 'id)))
       (cond ((memq what '(pace start-far))
	      (ask ,actor forget items matching (heeded-criticism: id ,id what ,what %))
	      (ask ,actor forget items matching (unmet-criticism: id ,id what ,what %))))
       (ask ,actor memorize (,head id ,id what ,what !,rest))
       (or (member actor :critic-noted) (setq :critic-noted (cons actor :critic-noted)))
       actor))

;;; ------------------------------------------------- 1. another way: a veto (Ken's (1))
;;;
;;; "If one says that a particular activity in a subscene was poorly chosen then Ani
;;; could redo that subscene selecting any reasonable alternatives to that activity",
;;; by "removing those alternatives that were vetoed by the user" (p. 190 and its
;;; footnote). CHOMET chooses a task's methods from two lists (choose-methods-for-task,
;;; chomet.123:200-203): its display suggestions, how it is shown
;;; (get-display-method-suggestions, chomet.123:205-207), and, for an establish task,
;;; its related convey suggestions, what is shown (get-convey-method-suggestions,
;;; chomet.123:213-214; choose-a-few-convey-methods, chomet.123:474). Each list is
;;; wrapped, and a suggestion whose method a criticism of the task vetoes is set aside
;;; by Ken's own reject-suggestion (chomet.123:305-310), with the reason
;;;   (vetoed-by-you c1)
;;; so that it is in the task's rejected-suggestions beside Ken's reasons. CHOMET then
;;; chooses among what is left as ever, and when nothing is left Ken's own path takes
;;; over (approve-or-remake-tasks-choices, chomet.123:9-36): a suggestion set aside for
;;; taking too much time may be brought back (resurect-bad-time-fits, chomet.123:187),
;;; and failing that the task is cant-do. (resurect-bad-time-fits looks for the reasons
;;; too-much-time: and more-time-needed:, but Ken's time-fit-score writes need-more-time:,
;;; chomet.123:413, so a suggestion set aside for needing more time is never brought
;;; back: a slip of Ken's, left as it is here.) A vetoed one is never brought back, since
;;; its reason is no time's. CHOMET's unchoose memorizes the set-aside suggestions back before it chooses
;;; again (scene.9:318-330), and the wrapper sets them aside again.
;;;
;;; What a veto names (the revival's choice, pending Ken: design question 2): the
;;; method's name, its first word (goes-to-and-accompanys, accompanys), as Ken's footnote
;;; vetoes "alternatives", not argument lists; in the task it was given in, not the
;;; scene or the film, since a veto that spread to other tasks would be the user
;;; arranging the film rather than criticizing a choice.

;; The method of a display suggestion, (goes-to-and-accompanys fairy-godmother ...),
;; and of a related convey suggestion, (accompanys cinderella prince): the value of the
;; suggestion's value, as choose-a-display-method and choose-a-few-convey-methods read
;; them (chomet.123:226, 517).
(defun critic-display-method-of (suggestion)
  (get (get suggestion 'value) 'value))

(defun critic-convey-method-of (related-suggestion)
  (get (get (get related-suggestion 'main-suggestion) 'value) 'value))

;; The criticism of the task that vetoes the method at the level, or nil.
(defun critic-vetoing (task level method)
  (do ((c (critic-for-task 'another-way task) (rest c)))
      ((null c) nil)
      (and (eq (get (first c) 'level) level)
	   (not (atom method))
	   (eq (get (first c) 'vetoes) (first method))
	   (return (first c)))))

;; The suggestions with those the record vetoes for the task set aside, Ken's
;; reject-suggestion giving the reason, and the veto noted on the task.
(defun critic-without-vetoed (suggestions task level method-of)
  (do ((s suggestions (rest s))
       (kept nil))
      ((null s) (reverse kept))
      (let ((c (critic-vetoing task level (funcall method-of (first s)))))
	   (cond (c (reject-suggestion task (first s) (list 'vetoed-by-you (get c 'id)))
		    (critic-heeded task c 'another-way (funcall method-of (first s)) 'set-aside
				   (list 'vetoed-by-you level)))
		 (t (setq kept (cons (first s) kept)))))))

(defun get-display-method-suggestions-heeding-criticism (task)
  (let ((suggestions (funcall (revival-wrapped 'get-display-method-suggestions 'critic) task)))
       (cond ((null :critic-record) suggestions)
	     (t (critic-without-vetoed suggestions task 'display 'critic-display-method-of)))))

(defun get-convey-method-suggestions-heeding-criticism (task)
  (let ((suggestions (funcall (revival-wrapped 'get-convey-method-suggestions 'critic) task)))
       (cond ((null :critic-record) suggestions)
	     (t (critic-without-vetoed suggestions task 'convey 'critic-convey-method-of)))))

(+after-load '|ken;chomet >|
  '(progn (revival-wrap 'get-display-method-suggestions 'critic
			'get-display-method-suggestions-heeding-criticism)
	  (revival-wrap 'get-convey-method-suggestions 'critic
			'get-convey-method-suggestions-heeding-criticism)))

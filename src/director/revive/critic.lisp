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
			     (or (and (null (get c 'task)) (null (get c 'tasks)))
				 (equal (get c 'task) description)
				 (member description (get c 'tasks)))
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


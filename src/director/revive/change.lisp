;;; -*-lisp-*-
;;; REVIVE;CHANGE: characters who change, and who they have become.
;;;
;;; This file is ours, not Ken's. It is CHANGE (src/pipeline.js, EXTENSIONS), item 3 of
;;; reports/chapter-x/PLAN.md, "characters who change", as far as its stage 3: who takes
;;; part in a change, Ani's fresh look at the one who changed, and who they have become
;;; from the next scene on. Portraying the change itself (bridging the gap, the cause
;;; going to the one it changes, wandering) is stage 6. A film description with no
;;; change in it, Ken's Cinderella among them, runs exactly as in 1978
;;; (node tools/check-1978.mjs --extensions change).
;;;
;;; The thesis: "Shy characters learn to socialize, evil characters repent and learn to
;;; lead a "good" life ... The personality, the role in the story, and the movement
;;; descriptors of the characters are assumed to be permanent. Of course it would be a
;;; minor change to Ani to recompute the elaborated descriptions of the characters at
;;; any point. If the personality of a character is supposed to change in the middle of
;;; a scene, then Ani could simply rederive the dynamics (and appearance) of the
;;; character with the new personality as if the character were brand new. This is not
;;; an ideal solution since Ani would not portray the personality change itself, the
;;; character would only move and appear differently after the change" (AI-TR-540
;;; pp. 168-169, L4389-4406).
;;;
;;; A change is a scene task written as Ken wrote one in his commented-out
;;; cinderella-beautified scene (cindy.46:94-105):
;;;   (convey (change (physical cinderella shabby) (physical cinderella elegant)))
;;; (change (TYPE WHO OLD) (TYPE WHO NEW)), alone or inside (causes CAUSER ...). TYPE is
;;; physical, personality, movement or role-in-story, and WHO a character; or TYPE is
;;; relationship and WHO (relationship-of a b). OLD and NEW are a word or (and ...), as
;;; in an initial description (char.2:73-77, 159-168).
;;;
;;; What it does:
;;;  1. Who takes part. Ken's process-task-description makes a task's second word the
;;;     one it is for and has it note its part in the scene (scene.9:458-465, "what
;;;     about other participents?"). A change standing alone would have the actor
;;;     (personality cinderella shy) note it, and stop every job that loads the film
;;;     description with NO-SUCH-ACTOR. So the changed character is who it is for, and
;;;     each changed character notes its part.
;;;  2. The fresh look, an extra pass-1 job for each scene that changes someone
;;;     (src/pipeline.js freshLook). DATEST's init, with each change of the scenes up
;;;     to and including this one made after CINDY loads and before study-descriptor-use
;;;     works out who is unique and how each descriptor is used (compar.69:127-136):
;;;     made after init, the uniqueness and usage would be the old words'. Then Ani makes
;;;     her choices again, in her own order, and every choice that isn't the changed
;;;     character's is held as it was, so that only she is chosen again (Ken's decision
;;;     of 9 October: "Ani rederives only the changed character, with everyone else held
;;;     as they were"). Her new values are written to KEN1;<scene> BECOME, as
;;;     save-answers writes KEN;CP.
;;;  3. Who they have become. In pass 2 of every later scene, RUN's to-do-before-running
;;;     (run.65:48) loads the BECOME files of the earlier scenes and makes them so: the
;;;     descriptions change and the choice points take her new values, so the scene's
;;;     establish tasks read the new words and its special dynamics carry the new
;;;     values. REVIVE;MEND, if loaded, then narrows any (not X) and reads any none as
;;;     medium, as it does the CP's.
;;; And, for the glass box only, a full recompute: pass 1 again with every choice made
;;; afresh, whose knock-on changes in the others are shown, not used.
;;;
;;; Why "held" and not "brand new" taken literally. The plan's first try was to load
;;; the story's CP, mark the others' nodes completed, reset only her choice points and
;;; run (z). Probed on Ken's Cinderella with no change at all (11 October 2026), that
;;; moves every character's own values: Cinderella's path-jaggedness, path-length,
;;; repetiveness, activity-level and attraction-towards-friends, four of the
;;; stepmother's, four of the Prince's, two of the fairy godmother's. Ken's pass 1 made
;;; each choice when the choices made before it were made and the others were not (the
;;; focus's Cinderella first, chocho.19:58-69), and the comparisons it suggests from
;;; read the others' choices as they then were; asked again with every other choice
;;; made, they answer differently. Shabby to elegant, which changes nothing in how she
;;; moves (the thesis's note, L4354-4355), would then make Cinderella move differently.
;;; Held in Ani's own order instead, each choice of hers is made again at the point
;;; where it was first made, with the others as they were then: with no change it
;;; gives CP 29 exactly (tools/check-change.mjs), and with a change only what the change
;;; brings about.

;;; ------------------------------------------------- 1. a change, as Ken wrote one

;; Every change in a task's description, each with its cause, ((change cause) ...): a
;; (change (TYPE WHO OLD) (TYPE WHO NEW)) anywhere in it, and the CAUSER of a
;; (causes CAUSER ...) around it, or nil.
(defun changes-in (form)
  (changes-in-1 form nil))

(defun changes-in-1 (form cause)
  (cond ((atom form) nil)
	((a-change? form) (list (list form cause)))
	((and (eq (first form) 'causes) (not (atom (rest form))))
	 (apply 'append
		(mapcar (function (lambda (part) (changes-in-1 part (second form))))
			(rest (rest form)))))
	(t (apply 'append
		  (mapcar (function (lambda (part) (changes-in-1 part cause)))
			  form)))))

(defun a-change? (form)
  (and (eq (first form) 'change)
       (= (length form) 3)
       (not (atom (second form)))
       (not (atom (third form)))
       (= (length (second form)) 3)
       (= (length (third form)) 3)))

(defun change-type (change) (first (second change)))
(defun change-who (change) (second (second change)))
(defun change-old (change) (third (second change)))
(defun change-new (change) (third (third change)))

;; The words of a description, (and a b) or a.
(defun words-of (description)
  (cond ((and (not (atom description)) (eq (first description) 'and)) (rest description))
	(t (list description))))

;; Who a change changes: the character, or both characters of a relationship, the
;; first, whose relationship it is, first. A relationship describes its first
;; character's attitude to its second (char.2:150-168), and Ani's relative suggestions
;; read it for both (cosug.215), so both are chosen again.
(defun characters-changed-by (change)
  (let ((who (change-who change)))
       (cond ((atom who) (list who))
	     (t (list (second who) (third who))))))

;;; ------------------------------------------------- 2. who takes part

;; process-task-description (scene.9:440-467), for a task with a change in it. Every
;; other task goes to Ken's function as before. One whose description is a change
;; standing alone, (convey (change (personality cinderella shy) ...)), is made by Ken's
;; function as the task (convey (change cinderella)), so that it is for the changed
;; character and she notes her part, and is then given its own description. Each
;; character a change changes notes its part in the scene, as the one a task is for
;; does: (scene-participation: scene learning task convey-task-2).
(defun process-task-description-with-changes (description scene source)
  (let ((changes (and (not (atom description))
		      (not (atom (rest description)))
		      (changes-in (second description)))))
       (cond ((null changes)
	      (funcall (revival-wrapped 'process-task-description 'change)
		       description scene source))
	     ((a-change? (second description))
	      (let ((character (first (characters-changed-by (second description)))))
		   (let ((task (funcall (revival-wrapped 'process-task-description 'change)
					(list (first description) (list 'change character))
					scene source)))
			(ask ,task set your task to
			     (task: description ,(second description)
				    for-who ,character
				    source ,source))
			(note-parts-in-changes changes scene task)
			task)))
	     (t (let ((task (funcall (revival-wrapped 'process-task-description 'change)
				     description scene source)))
		     (note-parts-in-changes changes scene task)
		     task)))))

(defun note-parts-in-changes (changes scene task)
  (mapc (function
	 (lambda (change+cause)
		 (mapc (function
			(lambda (character)
				(ask ,character memorize
				     (scene-participation: scene ,scene task ,task))))
		       (characters-changed-by (first change+cause)))))
	changes))

(+after-load '|ken;scene >|
  '(revival-wrap 'process-task-description 'change 'process-task-description-with-changes))

;;; ------------------------------------------------- 3. the description changed

;; A change made to the description: the old words are forgotten, and what they told
;; (graceful, told by beautiful: char.2:12-20); the new ones are memorized, as CHAR
;; memorizes an initial description (char.2:80-84, 159-168), with the change as their
;; source:
;;   (description: type personality descriptor good source (change-in change-of-heart))
;; A new beautiful tells graceful, as CHAR's demon does for an initial one (it asks for
;; source initial-description, char.2:13-16). The source is the change, so Ani's
;; records say where the word came from; and Ken's SUMCOM counts only an initial
;; description in its summaries ("i think i want to skip non initial description
;; sources", sumcom.53:28-31, 118-125). With the new words memorized as initial
;; descriptions instead, the repentant stepmother's path-curvature comes out medium,
;; not high (reports/ext/change/README.md).
(defun make-description-change (change scene)
  (let ((who (change-who change))
	(type (change-type change))
	(source (list 'change-in scene)))
       (mapc (function
	      (lambda (word)
		      (ask ,who forget items matching
			   (description: type ? descriptor ,word source ?))
		      (ask ,who forget items matching
			   (description: type ? descriptor ? source ,word))))
	     (words-of (change-old change)))
       (mapc (function
	      (lambda (word)
		      (cond ((eq type 'relationship)
			     (ask relationship-descriptor if new make ,word) ;;as char.2:164
			     (ask ,who memorize
				  (description: type ,(ask ,word recall your type)
						descriptor ,word
						source ,source)))
			    (t (ask ,who memorize
				    (description: type ,type descriptor ,word source ,source))
			       (and (eq type 'physical)
				    (eq word 'beautiful)
				    (ask ,who memorize
					 (description: type movement
						       descriptor graceful
						       source beautiful)))))))
	     (words-of (change-new change)))))

;;; ------------------------------------------------- 4. pass 1 again: the fresh look

;; DATEST's init (datest.56:4-8) as of a scene: the film description loaded, every
;; change of the scenes up to and including this one made, then study-descriptor-use.
(defun init-as-of (scene)
  (let ((:print-load-messages nil))
       (setq :load-priorities '(tryout))
       (director-load 'cindy '(to define the film as of a scene))
       (mapc (function
	      (lambda (s)
		      (mapc (function
			     (lambda (change+cause) (make-description-change (first change+cause) s)))
			    (changes-in-scene s))))
	     (scenes-up-to scene))
       (study-descriptor-use)))

;; The film's scenes in the order the film description defines them (SCENE's offspring
;; are kept newest first), up to and including scene.
(defun scenes-up-to (scene)
  (do ((s (reverse (ask scene recall your offspring)) (rest s))
       (scenes nil (cons (first s) scenes)))
      ((or (null s) (eq (first scenes) scene)) (reverse scenes))))

;; The changes of a scene's tasks, in the order the scene names them, each with its
;; cause. SCENE made the tasks when the film description loaded (scene.9:440-467);
;; its tasks are its convey tasks then its establish tasks, each kept newest first.
(defun changes-in-scene (scene)
  (apply 'append
	 (mapcar (function
		  (lambda (task) (changes-in (get (ask ,task recall your task) 'description))))
		 (reverse (ask ,scene recall your tasks)))))

;; The characters the scene's changes change, each once, in order.
(defun characters-changed-in (scene)
  (do ((c (apply 'append
		 (mapcar (function (lambda (change+cause) (characters-changed-by (first change+cause))))
			 (changes-in-scene scene)))
	  (rest c))
       (characters nil (cond ((memq (first c) characters) characters)
			     (t (cons (first c) characters)))))
      ((null c) (reverse characters))))

;; The choices as they were before the scene: pass 1's, as save-answers wrote them to
;; KEN;CP (datest.56:47-58), and any changed since, as the earlier scenes' BECOME files
;; have them. Each is (choice-point value).
(defun choices-as-they-were (answers-file)
  (let ((choices (answers-in-file answers-file)))
       (mapc (function
	      (lambda (change-of)
		      (mapc (function
			     (lambda (element+value)
				     (setq choices
					   (with-choice choices
							(list 'choice-point-of (second change-of)
							      (first element+value))
							(second element+value)))))
			    (ask ,change-of recall your new-values))
		      (mapc (function
			     (lambda (choice)
				     (setq choices (with-choice choices (first choice) (second choice)))))
			    (ask ,change-of recall your relative-values))))
	     (changes-of-earlier-scenes))
       choices))

;; The choices an answers file sets: each (define name parent ... (set your
;; current-choice to value) ...) gives (name value).
(defun answers-in-file (file-name)
  (let ((file (open file-name 'in))
	(end (list 'end-of-file)))
       (do ((form (read file end) (read file end))
	    (answers nil))
	   ((eq form end) (close file) (reverse answers))
	   (let ((value (current-choice-set-by form)))
		(and value (setq answers (cons (list (second form) (first value)) answers)))))))

(defun current-choice-set-by (form)
  (and (not (atom form))
       (eq (first form) 'define)
       (do ((s (rest (rest (rest form))) (rest s)))
	   ((null s) nil)
	   (and (not (atom (first s)))
		(eq (first (first s)) 'set)
		(eq (third (first s)) 'current-choice)
		(return (last (first s)))))))

;; choices with name's value replaced, a relative choice point's under either of its
;; names (cpoint.87:92-98).
(defun with-choice (choices name value)
  (cons (list name value)
	(do ((c choices (rest c))
	     (others nil (cond ((same-choice-point? (first (first c)) name) others)
			       (t (cons (first c) others)))))
	    ((null c) (reverse others)))))

(defun same-choice-point? (name1 name2)
  (or (equal name1 name2)
      (and (not (atom name1))
	   (eq (first name1) 'relative-choice-point-of)
	   (equal name2 (list (first name1) (reverse (second name1)) (third name1))))))

;; Is the choice point one of the character's? (choice-point-of c e), and a relative
;; one between c and another, (relative-choice-point-of (c x) e) or (x c).
(defun choice-point-of-any? (choice-point characters)
  (and (not (atom choice-point))
       (cond ((eq (first choice-point) 'choice-point-of)
	      (memq (second choice-point) characters))
	     ((eq (first choice-point) 'relative-choice-point-of)
	      (or (memq (first (second choice-point)) characters)
		  (memq (second (second choice-point)) characters))))))

;; The choices held while Ani chooses again, and the choices as they were.
(or (boundp ':change-held) (setq :change-held nil))
(or (boundp ':change-as-they-were) (setq :change-as-they-were nil))
(or (boundp ':change-held-against) (setq :change-held-against nil))

(defun hold-everyone-but (characters answers-file)
  (setq :change-as-they-were (choices-as-they-were answers-file))
  (setq :change-held
	(mapcan (function
		 (lambda (choice)
			 (and (not (choice-point-of-any? (first choice) characters))
			      (list choice))))
		(append :change-as-they-were nil)))
  (setq :change-held-against nil))

;; The value held for a choice point, as (value), or nil: a relative choice point held
;; under its other name has the value as that name reads it, as the relative choice
;; point answers yield current choice for (cpoint.87:100-108).
(defun held-value-of (choice-point)
  (do ((c :change-held (rest c)))
      ((null c) nil)
      (cond ((equal (first (first c)) choice-point) (return (rest (first c))))
	    ((same-choice-point? (first (first c)) choice-point)
	     (return (list (as-the-other-name-reads (second (first c)))))))))

(defun as-the-other-name-reads (value)
  (cond ((memq value '(same-as different-from)) value)
	(t (ask ,value recall your negative))))

;; CHOOSE's record-choice (choose.198:596-603), where every choice Ani makes is made:
;; while a fresh look holds the others, a choice of theirs that would come out
;; differently is made as it was, its winning suggestion saying so,
;;   (suggestion: element (prince deliberateness) value medium strength medium
;;		 source (held-as-it-was would-have-chosen high from ...))
;; and noted in :change-held-against for the glass box. The choice is counted as the
;; held value, as record-choice counts every choice (glosug.41:77-84 reads the counts).
;; With nothing held, in every other job, Ken's record-choice does it all.
(defun record-choice-holding-the-others (choice-point suggestion)
  (let ((held (and :change-held (held-value-of choice-point))))
       (cond ((or (null held) (equal (first held) (get suggestion 'value)))
	      (funcall (revival-wrapped 'record-choice 'change) choice-point suggestion))
	     (t (setq :change-held-against
		      (cons (list choice-point (first held) (get suggestion 'value))
			    :change-held-against))
		(funcall (revival-wrapped 'record-choice 'change)
			 choice-point
			 '(suggestion: element ,(get suggestion 'element)
				       value ,(first held)
				       strength ,(get suggestion 'strength)
				       source (held-as-it-was
					       would-have-chosen ,(get suggestion 'value)
					       from ,(get suggestion 'source))))))))

(+after-load '|ken;choose >|
  '(revival-wrap 'record-choice 'change 'record-choice-holding-the-others))

;; The fresh look after a scene that changes someone: the film description as of the
;; scene; the earlier scenes' BECOME files, for who they had become; every choice but
;; the changed characters' held; Ani's choices made again by DATEST's (z)
;; (datest.56:26-30); and the changed characters' new values written to become-file.
;; Returns what it wrote.
(defun take-a-fresh-look (scene answers-file become-files become-file)
  (init-as-of scene)
  (learn-earlier-becomes become-files)
  (hold-everyone-but (characters-changed-in scene) answers-file)
  (z)
  (let ((definitions (mapcar (function (lambda (character) (change-of-definition character scene)))
			     (characters-changed-in scene))))
       (setq :change-held nil) ;;so that nothing more is held
       (let ((file (open become-file 'out)))
	    (mapc (function (lambda (definition) (dicks-print definition file))) definitions)
	    (close file))
       definitions))

(defun learn-earlier-becomes (become-files)
  (mapc (function (lambda (file) (director-load file '(to learn who they have become))))
	become-files))

;; What a BECOME file says of one changed character, as save-answers writes a choice
;; point (datest.56:47-58):
;;   (define (change-of step-mother in change-of-heart) description-change
;;	     (set your changes to ((change (personality step-mother (and evil mean))
;;					   (personality step-mother (and good kind)))))
;;	     (set your causes to (prince))
;;	     (set your old-values to ((path-jaggedness medium) ... (attraction-towards-friends (negative high))))
;;	     (set your new-values to ((path-jaggedness low) ... (attraction-towards-friends (positive high))))
;;	     (set your relative-values to (((relative-choice-point-of (step-mother prince) relative-speed) different-from) ...)))
;; old-values are as they were, new-values as Ani chose them again, for every element
;; (her absolute choice points, which pass 2 reads: scene.9:265-275, prereq.19:31-38);
;; relative-values her relative choice points, which a later fresh look holds.
(defun change-of-definition (character scene)
  (let ((changes (changes-of-character character scene)))
       '(define (change-of ,character in ,scene) description-change
		(set your changes to ,(mapcar 'first changes))
		(set your causes to ,(mapcar 'second changes))
		(set your old-values to ,(values-as-they-were character))
		(set your new-values to ,(values-now character))
		(set your relative-values to ,(relative-values-now character)))))

(defun changes-of-character (character scene)
  (mapcan (function
	   (lambda (change+cause)
		   (and (memq character (characters-changed-by (first change+cause)))
			(list change+cause))))
	  (changes-in-scene scene)))

;; Every element a character's dynamics is chosen for: NODES' element types and their
;; elements (nodes.38:114-117), as CHAR lists a type's elements (char.2:58-68). The
;; lists are put together with append: recall gives each type's own offspring list,
;; and mapcan's nconc would splice the next type's elements into it.
(defun elements-chosen ()
  (apply 'append
	 (mapcar (function (lambda (type) (ask ,type recall your offspring)))
		 (ask element-types recall your types))))

(defun values-now (character)
  (mapcar (function
	   (lambda (element)
		   (let ((choice-point (list 'choice-point-of character element)))
			(list element
			      (and (exists? choice-point)
				   (ask ,choice-point recall your current-choice))))))
	  (elements-chosen)))

(defun values-as-they-were (character)
  (mapcar (function
	   (lambda (element)
		   (list element
			 (second (assoc (list 'choice-point-of character element)
					:change-as-they-were)))))
	  (elements-chosen)))

(defun relative-values-now (character)
  (mapcan (function
	   (lambda (choice-point)
		   (and (choice-point-of-any? choice-point (list character))
			(ask ,choice-point recall your current-choice)
			(list (list choice-point (ask ,choice-point recall your current-choice))))))
	  (reverse (ask relative-choice-point recall your offspring))))

;;; ------------------------------------------------- the full recompute, for comparison

;; Pass 1 again with every choice made afresh, as of the scene: what Ani would choose
;; for everyone. Returns each choice that differs from the choices as they were,
;; (choice-point was now). The others' differences are the knock-on changes the fresh
;; look holds back: "The personality, the role in the story, and the movement
;; descriptors of the characters are assumed to be permanent" (L4394-4396), and theirs
;; did not change.
(defun recompute-everyone-as-of (scene answers-file become-files)
  (init-as-of scene)
  (learn-earlier-becomes become-files)
  (setq :change-as-they-were (choices-as-they-were answers-file))
  (z)
  (mapcan (function
	   (lambda (choice-point)
		   (and (not (atom choice-point)) ;;not a kind of choice point with no instances
			(let ((now (ask ,choice-point recall your current-choice))
			      (was (choice-as-it-was choice-point)))
			     (and (not (equal now (first was)))
				  (list (list choice-point (first was) now)))))))
	  (reverse (ask choice-point recall your childless-descendants))))

(defun choice-as-it-was (choice-point)
  (let ((:change-held :change-as-they-were))
       (held-value-of choice-point)))

;;; ------------------------------------------------- 5. who they have become

;; The actor a BECOME file's definitions are instances of, (change-of c in scene), and
;; what makes one so in a later scene's pass 2. Defined once CHAR has loaded, as it has
;; when the film description is loaded in pass 1 and in RUN's job.
(defun define-description-change ()
  (let ((:insert-methods-at-end nil))
       (define description-change something
	(do when receiving (make it so)
	    (make-change-so :self)))))

(+after-load '|ken;char >| '(revival-once 'change-description-change 'define-description-change))

;; A top-level actor of ours named in files CHAR doesn't load (the BECOME files), so the
;; tags give it CHAR as its file, as load.33 fills them for Ken's: exists? knows it
;; before CHAR has loaded, and asking it loads CHAR.
(defprop description-change |KEN;CHAR| actor-load)

;; Pass 2, from RUN's to-do-before-running (run.65:48), after CINDY and the CP have
;; loaded (run.65:42-45) and before the scene asks for any suggestion: each earlier
;; scene's BECOME file, in film order, and each change in it made so.
(defun learn-who-they-have-become (become-files)
  (learn-earlier-becomes become-files)
  (mapc (function (lambda (change-of) (ask ,change-of make it so)))
	(changes-of-earlier-scenes))
  (mend-what-pass-2-cant-use))

;; The (change-of c in scene) actors loaded, in the order they were defined.
(defun changes-of-earlier-scenes ()
  (and (actor-of 'description-change dont-autoload)
       (reverse (ask description-change recall your offspring))))

;; Making a change so: the character's descriptions change (by the change-of actor of
;; the character each change describes, once for a relationship's two), and each of
;; its choice points takes the value Ani's fresh look chose. A choice point whose value
;; changes memorizes where its new value came from, and the change-of actor what it
;; made so:
;;   (changed-in: change-of-heart was low by (change-of step-mother in change-of-heart))
;;   (made-so: element path-curvature was low now high)
(defun make-change-so (change-of)
  (let ((character (second change-of))
	(scene (fourth change-of)))
       (mapc (function
	      (lambda (change)
		      (and (eq (first (characters-changed-by change)) character)
			   (make-description-change change scene))))
	     (ask ,change-of recall your changes))
       (mapc (function
	      (lambda (element+value)
		      (let ((choice-point (list 'choice-point-of character (first element+value)))
			    (now (second element+value)))
			   (and (exists? choice-point)
				(let ((was (ask ,choice-point recall your current-choice)))
				     (cond ((not (equal was now))
					    (ask ,choice-point memorize
						 (changed-in: ,scene was ,was by ,change-of))
					    (ask ,choice-point set your current-choice to ,now)
					    (ask ,change-of memorize
						 (made-so: element ,(first element+value)
							   was ,was now ,now)))))))))
	     (ask ,change-of recall your new-values))))

;; REVIVE;MEND narrows each (not X) and reads each none as medium when RUN loads the CP
;; (REVIVE;MEND1, MEND2). A fresh look's value can be one too, so it is narrowed and
;; read the same way, by MEND's own functions, if MEND is loaded: they act on what is
;; left after the CP's were narrowed, the values just made so.
(defun mend-what-pass-2-cant-use ()
  (and (get 'narrow-not-values-of-choice-points 'expr)
       (narrow-not-values-of-choice-points))
  (and (get 'read-given-up-values-as-medium 'expr)
       (read-given-up-values-as-medium)))

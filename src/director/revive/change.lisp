;;; -*-lisp-*-
;;; REVIVE;CHANGE: characters who change, and who they have become.
;;;
;;; This file is ours, not Ken's. It is CHANGE (src/pipeline.js, EXTENSIONS), item 3 of
;;; reports/chapter-x/PLAN.md, "characters who change": who takes part in a change, Ani's
;;; fresh look at the one who changed (with APPEAR, at how she looks too), and who they
;;; have become from the next scene on. Portraying the change itself in its scene
;;; (bridging the gap, the cause going to the one it changes, wandering) is REVIVE;CHSHOW
;;; (stage 6). A film description with no change in it, Ken's Cinderella among them, runs
;;; exactly as in 1978 (node tools/check-1978.mjs --extensions change).
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
;;; pp. 168-169, L4389-4410).
;;;
;;; A change is a scene task written as Ken wrote one in his commented-out
;;; cinderella-beautified scene (cindy.46:94-105):
;;;   (convey (change (physical cinderella shabby) (physical cinderella elegant)))
;;; (change (TYPE WHO OLD) (TYPE WHO NEW)), alone or inside (causes CAUSER ...). TYPE is
;;; physical, personality, movement or role-in-story, and WHO a character; or TYPE is
;;; relationship and WHO (relationship-of a b). OLD and NEW are a word or (and ...), as
;;; in an initial description (char.2:80-88, 160-171).
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
;;;     as they were"). With APPEAR, how she looks is chosen again too, as pass 1
;;;     chooses it after (z) ("rederive the dynamics (and appearance)", L4400-4401). Her
;;;     new values, and the look she was drawn with and is drawn with now, are written
;;;     to KEN1;<scene> BECOME, as save-answers writes KEN;CP.
;;;  3. Who they have become. In pass 2 of every later scene, RUN's to-do-before-running
;;;     (run.65:48) loads the BECOME files of the earlier scenes and makes them so: the
;;;     descriptions change and the choice points take her new values, so the scene's
;;;     establish tasks read the new words and its special dynamics carry the new
;;;     values; with APPEAR, she is drawn as the fresh look drew her. REVIVE;MEND then
;;;     narrows any (not X) and reads any none as medium, as it does the CP's.
;;;  4. In the scene of the change itself, pass 2 loads the scene's own BECOME file
;;;     without making it so, and REVIVE;CHSHOW shows the change.
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
;;; focus's Cinderella first, chocho.19:40-43, 68-79), and the comparisons it suggests from
;;; read the others' choices as they then were; asked again with every other choice
;;; made, they answer differently. Shabby to elegant, which changes nothing in how she
;;; moves (the thesis's note, L4354-4355), would then make Cinderella move differently.
;;; Held in Ani's own order instead, each choice of hers is made again at the point
;;; where it was first made, with the others as they were then: with no change it
;;; gives CP 29 exactly (tools/check-change.mjs), and with a change only what the change
;;; brings about.

;;; ------------------------------------------------- 1. a change, as Ken wrote one

;; The changes a task makes, each with its cause, ((change cause) ...): the task's own
;; description, (change (TYPE WHO OLD) (TYPE WHO NEW)), or a change inside
;; (causes CAUSER ...), as Ken wrote it in cinderella-beautified (cindy.46:96-99), its
;; cause the CAUSER (nil for a change on its own). Only a change of a lasting
;; description counts (below). A change anywhere else in a task, inside (wants x ...),
;; (prevents x ...) or (undoes x (from-scene ...)), is wanted, prevented or undone, not
;; made, and is left alone, with a note (2, below).
(defun changes-in (form)
  (changes-caused-in form nil))

(defun changes-caused-in (form cause)
  (cond ((atom form) nil)
	((a-change? form)
	 (and (lasting-description? (change-type form)) (list (list form cause))))
	((and (eq (first form) 'causes) (not (atom (rest form))))
	 (apply 'append
		(mapcar (function (lambda (part) (changes-caused-in part (second form))))
			(rest (rest form)))))))

;; Every change anywhere in a task's description, made or not.
(defun changes-anywhere (form)
  (cond ((atom form) nil)
	((a-change? form) (list form))
	(t (apply 'append (mapcar 'changes-anywhere form)))))

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

;; The descriptions a change may change, those that are "assumed to be permanent"
;; (L4394-4396): a character's physical, personality and movement descriptors and role
;; in the story, as CHAR keeps them (char.2:73-88; movement is graceful's, char.2:14-20),
;; and a relationship (char.2:157-171). An emotional state is not one: it passes, and
;; establish tasks show it (sugest.123).
(defun lasting-description? (type)
  (memq type '(physical personality movement role-in-story relationship)))

;; The words of a description, (and a b) or a.
(defun words-of (description)
  (cond ((and (not (atom description)) (eq (first description) 'and)) (rest description))
	(t (list description))))

;; Who a change changes: the character, or both characters of a relationship, the
;; first, whose relationship it is, first. A relationship describes its first
;; character's attitude to its second (char.2:157-171), and Ani's comparisons read it
;; for both (compare-relationships, compar.69:29-37), so both are chosen again.
(defun characters-changed-by (change)
  (let ((who (change-who change)))
       (cond ((atom who) (list who))
	     (t (list (second who) (third who))))))

;; A change names a character of the story, or a relationship of two. One that doesn't
;; stops the job with that said, where Ken's code would stop on the missing actor
;; (NO-SUCH-ACTOR) with nothing said about the change.
(defun check-who-a-change-names (change)
  (let ((who (change-who change)))
       (or (cond ((atom who) (a-character? who))
		 (t (and (eq (first who) 'relationship-of)
			 (= (length who) 3)
			 (a-character? (second who))
			 (a-character? (third who)))))
	   (shouldnt-happen 'change
			    (list who 'is 'not 'a 'character 'of 'the 'story 'in change)))))

(defun a-character? (who)
  (and who (atom who) (exists? who) (ask ,who are you a character)))

;;; ------------------------------------------------- 2. who takes part

;; process-task-description (scene.9:440-467), for a task with a change in it. Every
;; other task goes to Ken's function as before. One whose description is a change
;; standing alone, (convey (change (personality cinderella shy) ...)), is made by Ken's
;; function as the task (convey (change cinderella)), so that it is for the changed
;; character and she notes her part, and is then given its own description. Each
;; character a change of the task changes notes its part in the scene, as the one a
;; task is for does: (scene-participation: scene learning task convey-task-2). A change
;; counts in a convey or an establish task, the scene's tasks (scene.9:11-13); one in a
;; display task, one inside anything but causes, and one of a passing state are left
;; alone, each with a note on the task:
;;   (revival-repair: what change-not-made was (change ...) now left-alone
;;		      because (inside wants))
(defun process-task-description-with-changes (description scene source)
  (let ((anywhere (and (not (atom description))
		       (not (atom (rest description)))
		       (changes-anywhere (second description)))))
       (cond ((null anywhere)
	      (funcall (revival-wrapped 'process-task-description 'change)
		       description scene source))
	     (t (let ((changes (and (memq (first description) '(convey establish))
				    (changes-in (second description)))))
		     (mapc (function (lambda (change+cause) (check-who-a-change-names (first change+cause))))
			   changes)
		     (let ((task (cond ((a-change? (second description))
					(check-who-a-change-names (second description))
					(make-change-task description scene source))
				       (t (funcall (revival-wrapped 'process-task-description 'change)
						   description scene source)))))
			  (note-parts-in-changes changes scene task)
			  (note-changes-not-made anywhere changes description task)
			  task))))))

(defun make-change-task (description scene source)
  (let ((character (first (characters-changed-by (second description)))))
       (let ((task (funcall (revival-wrapped 'process-task-description 'change)
			    (list (first description) (list 'change character))
			    scene source)))
	    (ask ,task set your task to
		 (task: description ,(second description)
			for-who ,character
			source ,source))
	    task)))

(defun note-parts-in-changes (changes scene task)
  (mapc (function
	 (lambda (change+cause)
		 (mapc (function
			(lambda (character)
				(ask ,character memorize
				     (scene-participation: scene ,scene task ,task))))
		       (characters-changed-by (first change+cause)))))
	changes))

;; Each change of the task that isn't made, noted on the task with why.
(defun note-changes-not-made (anywhere changes description task)
  (mapc (function
	 (lambda (change)
		 (or (assq change changes)
		     (revival-note task 'change-not-made change 'left-alone
				   (cond ((not (memq (first description) '(convey establish)))
					  (list 'in 'a (first description) 'task))
					 ((not (lasting-description? (change-type change)))
					  (list (change-type change) 'is 'not 'a 'lasting 'description))
					 (t (list 'inside (first (second description)))))))))
	anywhere))

(+after-load '|ken;scene >|
  '(revival-wrap 'process-task-description 'change 'process-task-description-with-changes))

;; Who takes part in a task, when SCENE orders the tasks of an and: those with no one
;; in common may run at once (order-parallel-tasks, scene.9:487-510). It does that when
;; an establish task is done by conveying, and its convey tasks take its place in the
;; scene's ordering (reorder-task-ordering, scene.9:469-470), and it finds a convey
;; task's participants by asking each word of its description if it is a character
;; (participants-of-task, scene.9:513-532: "for now kind a stupid and just makes a list
;; of all the characters in the task"). A change of a relationship names (relationship-of
;; a b), and the tags say CINDY defines relationship-of (her (define (relationship-of
;; cinderella step-mother) relationship), an actor of two names), so asked, it is loaded
;; for and stops pass 2: NO-SUCH-ACTOR, "RELATIONSHIP-OF is not an actor". A scene that
;; establishes a relationship and changes one stopped so (a model's tortoise and hare,
;; 13 October; test/stories/stress/change-and-relationship.lisp). Those who take part in
;; (relationship-of a b) are a and b. Ken's tasks name characters, never a relationship,
;; so they are found as before.
(defun participants-of-task-1-through-relationships (part-of-task participants)
  (funcall (revival-wrapped 'participants-of-task-1 'change)
	   (cond ((and (not (atom part-of-task)) (eq (first part-of-task) 'relationship-of))
		  (rest part-of-task))
		 (t part-of-task))
	   participants))

(+after-load '|ken;scene >|
  '(revival-wrap 'participants-of-task-1 'change 'participants-of-task-1-through-relationships))

;;; ------------------------------------------------- 3. the description changed

;; A change made to the description: the old words are forgotten, and what they told
;; (graceful, told by beautiful: char.2:12-20); then the character is described with
;; the new ones by CHAR's own process initial description (char.2:21-26, 80-88;
;; a relationship's, char.2:157-171), "as if the character were brand new" (thesis
;; p. 168, L4400-4402):
;;   (description: type personality descriptor good source initial-description)
;; So everything of Ken's that reads an initial description reads the new words as it
;; reads the story's: CHAR's demon tells graceful for a new beautiful (char.2:13-20),
;; and SUMCOM counts them in the comparison and uniqueness summaries, which count only
;; an initial description ("i think i want to skip non initial description sources",
;; sumcom.53:26; sumcom.53:19-31, 118-125). Ken's decision of 11 October
;; (reports/chapter-x/PLAN.md, "Decisions", 8). Where a word came from is kept by the
;; change-of actor that makes it so (5, below) and the BECOME file. (With the change
;; as the words' source instead, SUMCOM would leave them out, and the repentant
;; stepmother's path-curvature would come out high, not medium:
;; reports/ext/change/README.md.)
;; A relationship the story never described, (relationship-of prince step-mother), is
;; made first, as CINDY's define makes one (char.2:157-158), so that it can be described.
;; Returns the old words the description didn't have, which the change took nothing
;; away for: the change-of actor and the run's record say so.
(defun make-description-change (change)
  (let ((who (change-who change))
	(type (change-type change)))
       (and (eq type 'relationship)
	    (not (exists? who))
	    (ask relationship if new make ,who))
       (let ((not-described
	      (mapcan (function
		       (lambda (word)
			       (and (not (ask ,who recall if any items match
					      (description: type ? descriptor ,word source ?)))
				    (list word))))
		      (words-of (change-old change)))))
	    (mapc (function
		   (lambda (word)
			   (ask ,who forget items matching
				(description: type ? descriptor ,word source ?))
			   (ask ,who forget items matching
				(description: type ? descriptor ? source ,word))))
		  (words-of (change-old change)))
	    (cond ((eq type 'relationship)
		   (ask ,who process initial description ,(change-new change)))
		  (t (ask ,who process initial description ,(list type (change-new change)))))
	    not-described)))

;;; ------------------------------------------------- 4. pass 1 again: the fresh look

;; DATEST's init (datest.56:4-8) as of a scene: the film description loaded, every
;; change of the scenes up to and including this one made, then study-descriptor-use.
;; Each change's old words that the description didn't have are kept in
;; :change-not-described, ((change words) ...), for the BECOME file.
(defun init-as-of (scene)
  (let ((:print-load-messages nil))
       (setq :load-priorities '(tryout))
       (director-load 'cindy '(to define the film as of a scene))
       (setq :change-not-described nil)
       (mapc (function
	      (lambda (s)
		      (mapc (function
			     (lambda (change+cause)
				     (let ((not-described (make-description-change (first change+cause))))
					  (and not-described
					       (setq :change-not-described
						     (cons (list (first change+cause) not-described)
							   :change-not-described))))))
			    (changes-in-scene s))))
	     (scenes-up-to scene))
       (study-descriptor-use)))

(or (boundp ':change-not-described) (setq :change-not-described nil))

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

;; choices with name's value replaced, a relative choice point's under either of its
;; names (cpoint.87:98-104).
(defun with-choice (choices name value)
  (cons (list name value)
	(do ((c choices (rest c))
	     (others nil (cond ((same-choice-point? (first (first c)) name) others)
			       (t (cons (first c) others)))))
	    ((null c) (reverse others)))))

;; Is the choice point one of the character's? (choice-point-of c e), and a relative
;; one between c and another, (relative-choice-point-of (c x) e) or (x c).
(defun choice-point-of-any? (choice-point characters)
  (and (not (atom choice-point))
       (cond ((eq (first choice-point) 'choice-point-of)
	      (memq (second choice-point) characters))
	     ((eq (first choice-point) 'relative-choice-point-of)
	      (or (memq (first (second choice-point)) characters)
		  (memq (second (second choice-point)) characters))))))

;; Holding choices while Ani chooses again (hold-everyone-but, held-value-of and
;; record-choice-holding-the-others, with answers-in-file and same-choice-point?) is
;; REVIVE;HOLD's, which CHANGE and CRITIC share; HOLD loads before this file.

;; The fresh look after a scene that changes someone: the film description as of the
;; scene; the earlier scenes' BECOME files, for who they had become; every choice but
;; the changed characters' held; Ani's choices made again by DATEST's (z)
;; (datest.56:26-30), then whatever the extensions do after (z) in pass 1 (after: the
;; forms of src/pipeline.js EXTENSIONS' afterPass1, REVIVE;APPEAR's (choose-appearances)
;; with APPEAR on: "rederive the dynamics (and appearance) of the character with the new
;; personality as if the character were brand new", p. 168, L4400-4402); and the changed
;; characters' new values written to become-file. Returns what it wrote.
(defun take-a-fresh-look (scene answers-file become-files become-file after)
  (init-as-of scene)
  (learn-earlier-becomes become-files)
  (hold-everyone-but (characters-changed-in scene) answers-file)
  (z)
  (mapc 'eval after)
  (let ((definitions (mapcar (function
			      (lambda (character) (change-of-definition character scene answers-file)))
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
;;	     (set your relative-values to (((relative-choice-point-of (step-mother prince) relative-speed) different-from) ...))
;;	     (set your not-described to nil))
;; old-values are as they were, new-values as Ani chose them again, for every element
;; (her absolute choice points, which pass 2 reads: scene.9:265-275, prereq.19:31-38);
;; relative-values her relative choice points, which a later fresh look holds;
;; not-described the old words her description didn't have. With APPEAR, the elements
;; include those of how she looks, and two more say how she was drawn and how she is
;; drawn now, each as REVIVE;APPEAR's (appearance-of cinderella) has it (shape, angle,
;; center-offset, ani-size, hue and look-color):
;;	     (set your old-look to ((shape hexagon) (angle 60) ... (look-color (270.0 .35 .65))))
;;	     (set your new-look to ((shape hexagon) (angle 60) ... (look-color (270.0 1.0 .65))))
;; which REVIVE;CHSHOW bridges in the scene, and later scenes draw her as.
(defun change-of-definition (character scene answers-file)
  (let ((changes (changes-of-character character scene))
	(new-look (look-of-appearance (list 'appearance-of character))))
       (append
	'(define (change-of ,character in ,scene) description-change
		 (set your changes to ,(mapcar 'first changes))
		 (set your causes to ,(mapcar 'second changes))
		 (set your old-values to ,(values-as-they-were character))
		 (set your new-values to ,(values-now character))
		 (set your relative-values to ,(relative-values-now character))
		 (set your not-described to ,(old-words-not-described character changes)))
	(and new-look
	     '((set your old-look to ,(look-as-it-was character answers-file))
	       (set your new-look to ,new-look))))))

;; How REVIVE;APPEAR draws a character, (appearance-of cinderella) (REVIVE;SHAPES,
;; REVIVE;COLORS), as (part value) lists, or nil if it doesn't (APPEAR off).
(defun look-of-appearance (appearance)
  (and (exists? appearance)
       (ask ,appearance recall your shape)
       (mapcar (function (lambda (part) (list part (ask ,appearance recall your ,part))))
	       '(shape angle center-offset ani-size hue look-color))))

;; How she was drawn before the scene: as an earlier scene's change drew her, else as
;; the story's pass 1 did, in the answers file (REVIVE;APPEAR's save-answers writes each
;; character's look there, (define (appearance-of cinderella) appearance (set your shape
;; to hexagon) ...)).
(defun look-as-it-was (character answers-file)
  (or (do ((c (reverse (changes-of-earlier-scenes)) (rest c)))
	  ((null c) nil)
	  (and (eq (second (first c)) character)
	       (ask ,(first c) recall your new-look)
	       (return (ask ,(first c) recall your new-look))))
      (look-in-answers-file character answers-file)))

(defun look-in-answers-file (character file-name)
  (let ((file (open file-name 'in))
	(end (list 'end-of-file))
	(appearance (list 'appearance-of character)))
       (do ((form (read file end) (read file end))
	    (look nil))
	   ((eq form end) (close file) look)
	   (and (not (atom form))
		(eq (first form) 'define)
		(equal (second form) appearance)
		(setq look (mapcar (function
				    (lambda (part)
					    (list part
						  (do ((s (rest (rest (rest form))) (rest s)))
						      ((null s) nil)
						      (and (eq (third (first s)) part)
							   (return (last-of (first s))))))))
				   '(shape angle center-offset ani-size hue look-color)))))))

(defun last-of (form) (first (last form)))

;; The old words of the character's changes that her description didn't have (the
;; change took nothing away for them), as init-as-of found them; for a relationship's
;; change, the first character's.
(defun old-words-not-described (character changes)
  (apply 'append
	 (mapcar (function
		  (lambda (change+cause)
			  (and (eq (first (characters-changed-by (first change+cause))) character)
			       (second (assoc (first change+cause) :change-not-described)))))
		 changes)))

(defun changes-of-character (character scene)
  (mapcan (function
	   (lambda (change+cause)
		   (and (memq character (characters-changed-by (first change+cause)))
			(list change+cause))))
	  (changes-in-scene scene)))

;; Every element a character's dynamics is chosen for: NODES' element types and their
;; elements (nodes.38:100-102), as CHAR lists a type's elements (char.2:58-68); and, if
;; REVIVE;APPEAR has chosen how the characters look, the elements of a look
;; (appearance-element's, REVIVE;APPEAR, 1). The lists are put together with append:
;; recall gives each type's own offspring list, and mapcan's nconc would splice the next
;; type's elements into it.
(defun elements-chosen ()
  (append (apply 'append
		 (mapcar (function (lambda (type) (ask ,type recall your offspring)))
			 (ask element-types recall your types)))
	  (and (actor-of 'appearance-element dont-autoload)
	       (actor-of 'appearances-node dont-autoload) ;;looks chosen (choose-appearances)
	       (reverse (ask appearance-element recall your offspring)))))

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
(defun recompute-everyone-as-of (scene answers-file become-files after)
  (init-as-of scene)
  (learn-earlier-becomes become-files)
  (setq :change-as-they-were (choices-as-they-were answers-file))
  (z)
  (mapc 'eval after)
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

;; Pass 2 of the scene that changes someone, after who they had become: its own BECOME
;; file, whose change-of actors REVIVE;CHSHOW shows the change by, not made so (the
;; scene's tasks read the description as it was when the scene began, and she moves as
;; she did until the change is shown). Each memorizes (shown-in: scene).
(defun learn-what-changes-in (scene become-file)
  (director-load become-file '(to learn what changes in the scene))
  (mapc (function
	 (lambda (change-of)
		 (and (eq (fourth change-of) scene)
		      (ask ,change-of memorize (shown-in: ,scene)))))
	(ask description-change recall your offspring)))

;; The (change-of c in scene) actors loaded, in the order they were defined, but those
;; to be shown in this scene (learn-what-changes-in).
(defun changes-of-earlier-scenes ()
  (and (actor-of 'description-change dont-autoload)
       (mapcan (function
		(lambda (change-of)
			(and (not (ask ,change-of recall if any items match (shown-in: %)))
			     (list change-of))))
	       (reverse (ask description-change recall your offspring)))))

;; Making a change so: the character's descriptions change (by the change-of actor of
;; the character each change describes, once for a relationship's two), and each of
;; her choice points the fresh look chose differently from the choices as they were
;; takes its new value. One the fresh look left as it was is left as pass 2 has it: a
;; (not X) the fresh look held, which MEND has narrowed, stays narrowed. The change-of
;; actor memorizes what it made so, each description and each value, and a choice
;; point whose value changes where its new value came from:
;;   (described-anew: type personality was (and evil mean) now (and good kind))
;;   (made-so: element path-curvature was low now medium)
;;   (changed-in: change-of-heart was low by (change-of step-mother in change-of-heart))
;; With APPEAR, a value of how she looks is made so as the others are, and if the fresh
;; look drew her otherwise, (appearance-of cinderella) takes her new look, which the
;; scene's program then has Director draw (REVIVE;APPEAR's take-look-forms):
;;   (looked-anew: was ((shape hexagon) ...) now ((shape hexagon) ...))
(defun make-change-so (change-of)
  (make-change-so-1 change-of)
  (make-look-so change-of))

(defun make-look-so (change-of)
  (let ((appearance (list 'appearance-of (second change-of)))
	(new-look (ask ,change-of recall your new-look)))
       (and new-look
	    (exists? appearance)
	    (let ((was (look-of-appearance appearance)))
		 (cond ((not (equal was new-look))
			(mapc (function
			       (lambda (part)
				       (ask ,appearance set your ,(first part) to ,(second part))))
			      new-look)
			(ask ,change-of memorize (looked-anew: was ,was now ,new-look))))))))

(defun make-change-so-1 (change-of)
  (let ((character (second change-of))
	(scene (fourth change-of))
	(old-values (ask ,change-of recall your old-values)))
       (mapc (function
	      (lambda (change)
		      (cond ((eq (first (characters-changed-by change)) character)
			     (make-description-change change)
			     (ask ,change-of memorize
				  (described-anew: type ,(change-type change)
						   was ,(change-old change)
						   now ,(change-new change)))))))
	     (ask ,change-of recall your changes))
       (mapc (function
	      (lambda (element+value)
		      (let ((choice-point (list 'choice-point-of character (first element+value)))
			    (now (second element+value)))
			   (and (not (equal now (second (assq (first element+value) old-values))))
				(exists? choice-point)
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

;;; -*-lisp-*-
;;; REVIVE;CHSHOW: Ani shows a change: she bridges the gap, and the cause goes to the one it changes.
;;;
;;; This file is ours, not Ken's. It is part of CHANGE (src/pipeline.js, EXTENSIONS;
;;; REVIVE;CHANGE says what CHANGE does), its stage 6: portraying the change in the scene
;;; where it happens (reports/chapter-x/PLAN.md, item 3, part 3, "Portraying the change").
;;; REVIVE;CHANGE gives Ani a fresh look at whoever changes, and from the next scene on she
;;; is described and moves as she has become; here, in the scene of the change itself,
;;; Ani shows it. The thesis: "Ani could be given the ability to compare the dynamics and
;;; appearance of a character before and after a change and then slowly bridge the gap
;;; between them. For example, if a character loses its shyness then it may move faster
;;; and more deliberately than previously. Rather than abruptly increase the character's
;;; speed (which could easily be misinterpreted as meaning something else) Ani would
;;; decide how long it should take to gradually increase the speed to the new value"
;;; (AI-TR-540 p. 169, L4411-4417). A film description with no change in it, Ken's
;;; Cinderella among them, runs exactly as in 1978 (node tools/check-1978.mjs
;;; --extensions change): nothing here is reached but through a change task.
;;;
;;; What Ani does with a change task (REVIVE;CHANGE, "who takes part": a task (convey
;;; (change (TYPE WHO OLD) (TYPE WHO NEW))), alone or inside (causes CAUSER ...)):
;;;  1. The verbs. CONVEY has no change and no causes: Ken named causes in EVIL's and
;;;     DOMINATES' suggestions (dscrp.17:161-167, relate.22:72-78) and wrote change in his
;;;     cinderella-beautified (cindy.46:94-105), and defined neither. Here each is an
;;;     action of CONVEY's, as helps, undoes and wants are (convey.64:127, 130, 183),
;;;     whose suggestions show the change: one display method and a bridge for each
;;;     element to bridge. A character's changes in a scene are shown once, by one of its
;;;     tasks (showing-task-of, below; the revival's rule).
;;;  2. One display method. A task gets one display method; CHOMET chooses one, and adds
;;;     every value change suggested beside it (choose-a-display-method, chomet.123:216-
;;;     240; reject-bad-value-changes, chomet.123:463-472). So the cause and the change
;;;     are one method, as Ken's move-to-and-hits is a going to and a hitting
;;;     (disply.311:113-153):
;;;      - goes-to-and-transforms: the cause goes to the one it changes, and once they
;;;        touch she changes, wandering as she does ("after two characters come in
;;;        contact they might change their shape slightly to convey the idea that they are
;;;        communicating", p. 166, L4343-4345, which says a contact may change a look; the
;;;        cause's going to her is the revival's reading of "the fairy godmother changes
;;;        Cinderella", L4346-4348). The cause walks to her regardless of collisions, as
;;;        Ken's goes-to-to-hit does (disply.311:144): a transformation is an act of
;;;        contact, as a hit is, and one walking carefully could be kept from her by a
;;;        bystander. Once they touch, the cause stands by while she changes (the
;;;        revival's choice: the thesis gives the cause nothing more to do);
;;;      - changes-while-wandering, for a change with no cause: she wanders while she
;;;        changes, "so that the changes are apparent" (p. 126, L3391-3393).
;;;     Both wander as REVIVE;MEND9's wander-around does (CHANGE requires MEND), whose
;;;     plan receiver is what SCENE asks for when a first part has only changes
;;;     (plan-something-if-only-changes, scene.9:216-221): a change task has a way of
;;;     showing of its own, so it isn't one of those, and no plan receiver is added. She
;;;     doesn't wander if another way of showing of the part moves her on her own
;;;     dynamics (a chase or a push, or one she does): that carries the change.
;;;  3. The bridges. bridge-to: is a display method, not a change method: its time counts
;;;     toward the subscene's and it is stretched with the subscene, where a change
;;;     method's is not: SCENE runs a change method unstretched and leaves its time out
;;;     of the subscene's (run your methods and maximum-ideal-time-of, scene.9:159-197,
;;;     "dont count").
;;;     Beside goes-to-and-transforms or changes-while-wandering it estimates no time of
;;;     its own (theirs counts it) and runs nothing (they run it, once the change begins).
;;;     Only what Director reads is bridged: speed and the path's curvature, length and
;;;     jaggedness (dichar.103:164-169), and, with APPEAR, how she looks. The other
;;;     elements are chosen again and noted, "director does not read it", as in 1978
;;;     (thesis X.B.3 (f), p. 186, L4853-4856, deliberateness; (d), p. 185, L4830-4836,
;;;     acceleration; the attractions only pass 1 reads; the rhythmic and activity levels
;;;     and repetiveness only pass 2, for how often an activity repeats, from the next
;;;     scene on).
;;;  4. How long. Every element changes together, over the time the largest change needs
;;;     at the rate of the change (the revival's rule: the thesis has Ani "decide how
;;;     long it should take", p. 169, L4416, and says no more): Ken's
;;;     estimate-time-for-change-by (disply.311:1098-1111), the time to grow by e times
;;;     the logarithm of the factor. Gradual by default, for "an abrupt change could
;;;     easily be misinterpreted" (p. 169, L4414-4415; "the transition should be
;;;     highlighted or gradual", L4410-4411: Ani has no way to highlight one); at low
;;;     speed, Ken's slowest, ten seconds an e-fold, which is the revival's rule: the
;;;     thesis leaves how slow to Ani. Instantaneous when the cause is magical, "in one
;;;     frame the character has one appearance and in the next frame a different
;;;     appearance" (p. 166, L4350-4352). That a magical cause makes a change
;;;     instantaneous is the revival's rule: the thesis says only that a transition is
;;;     occasionally instantaneous; magic is what changes in an instant in the stories
;;;     Ani tells. A shape Director has no in-between for changes at once, whatever the
;;;     rate (REVIVE;LOOKS's look-morph), and takes no time.
;;;  5. Director. A bridge runs as a new message, (gradually change by 4.0 factor for
;;;     path-curvature in 13.86 seconds), DICHAR's gradually change (dichar.103:102-121)
;;;     with a duration in place of a speed, so that it ends when Ani planned at any
;;;     frame rate; and, with APPEAR, a change of look in seconds (REVIVE;LOOKS). Each
;;;     element's type gives the form for its elements (normal-movement-element here,
;;;     appearance-element in REVIVE;ALTER). And Director doesn't stop the film while a
;;;     change is being shown (a repair of the revival's, 7, below): a part that extends
;;;     the change's part and ends first would otherwise stop it in the middle.
;;; The new self is shown from the next scene on: within the scene, its tasks read the
;;; description as it was when the scene began (RUN collects every suggestion before it
;;; plans, run.65:49-50), and the next scene's establish tasks read the new words
;;; (REVIVE;CHANGE, 5). There is no on-stage fallback: on-stage has no status demon
;;; (prereq.19:66), and giving it one would change how 1978's meets is scored.

;;; ------------------------------------------------- 1. the task being shown

;; CONVEY's receivers are asked for a convey task's suggestions with only its
;; description, (convey (change ...)) (gather-convey-suggestions, sugcon.26:57-58); the
;; change's are made in the task's own scene, where Ani's fresh look at whoever changes
;; is (change-of cinderella in cinderella-beautified). SUGCON's convey-suggestions is
;; given the task (sugcon.26:15-18), and while it collects its suggestions the task is
;; kept here.
(or (boundp ':change-convey-task) (setq :change-convey-task nil))

(defun convey-suggestions-knowing-the-task (task-package task-name)
  (let ((:change-convey-task task-name))
       (funcall (revival-wrapped 'convey-suggestions 'chshow) task-package task-name)))

(+after-load '|ken;sugcon >|
  '(revival-wrap 'convey-suggestions 'chshow 'convey-suggestions-knowing-the-task))

;; The change-of actor that is to be shown in a scene for a character, if its fresh
;; look was made: REVIVE;CHANGE's learn-what-changes-in loaded it for the scene's pass 2.
(defun change-of-shown (character scene)
  (let ((change-of (list 'change-of character 'in scene)))
       (and scene (exists? change-of) change-of)))

(defun change-of-shown-in (character subscene)
  (change-of-shown character (ask ,subscene recall your scene)))

;;; ------------------------------------------------- 2. the verbs

;; change shows itself, and causes shows the change it causes, each by one way of
;; showing it and the bridges (2 and 3, above), for the characters it shows the change
;; of (showing-task-of, below). A causes whose effect is not a change, as
;; EVIL's and DOMINATES' suggestions would make one (in 1978 their generators found no
;; bad thing and no task, and the suggestions were dropped before a causes was asked),
;; has no suggestions, as in 1978, when causes was not an actor; nor has a change whose
;; fresh look wasn't made, as in stage 3, when the task was "cant-do".
(defun define-the-change-verbs ()
  (let ((:insert-methods-at-end nil))
       (define change action)
       (define-receiver (yield suggestions for {and ?task (convey (change ?before ?after))})
			change
	(suggestions-to-show (changes-in (list 'change before after)) task 'change))
       (define causes action)
       (define-receiver (yield suggestions for {and ?task (convey (causes ?causer %effects))})
			causes
	(suggestions-to-show (changes-in (cons 'causes (cons causer effects))) task 'causes))))

(+after-load '|ken;convey >| '(revival-once 'chshow-verbs 'define-the-change-verbs))

;; Both are top-level actors of CONVEY's once CONVEY has loaded, so the tags give them
;; CONVEY as their file, as load.33 fills them for Ken's.
(defprop change |KEN;CONVEY| actor-load)
(defprop causes |KEN;CONVEY| actor-load)

;; The suggestions for a task's changes, ((change cause) ...) as REVIVE;CHANGE's
;; changes-in finds them: one way of showing the change of the first character it shows,
;; and the bridges of each character whose change it shows, of those whose fresh look
;; was made in the task's scene.
(defun suggestions-to-show (changes element source)
  (let ((scene (and :change-convey-task (ask ,:change-convey-task recall your scene))))
       (let ((shown (changes-of-shown changes scene :change-convey-task)))
	    (and shown
		 (cons (way-to-show-suggestion (second (first shown))
					       (cause-going-to (second (first shown)) changes)
					       element source)
		       (apply 'append
			      (mapcar (function
				       (lambda (change-of) (bridge-suggestions change-of element source)))
				      shown)))))))

;; The change-of actors of the characters the changes change, each once, whose change
;; the task shows.
(defun changes-of-shown (changes scene task)
  (do ((c (apply 'append
		 (mapcar (function (lambda (change+cause) (characters-changed-by (first change+cause))))
			 changes))
	  (rest c))
       (shown nil (let ((change-of (change-of-shown (first c) scene)))
		       (cond ((or (null change-of) (member change-of shown)
				  (not (eq (showing-task-of (first c) scene) task)))
			      shown)
			     (t (cons change-of shown))))))
      ((null c) (reverse shown))))

;; The task of a scene that shows a character's change. Her fresh look takes all her
;; changes in the scene together (REVIVE;CHANGE: one change-of actor, one BECOME file,
;; from how she was to who she becomes), so one bridge shows them, and one task: two
;; tasks that each showed her change would each bridge her from how she was, and her
;; elements would change twice over, with two wanders at once. Of the scene's tasks,
;; in the order the scene names them (changes-in-scene, REVIVE;CHANGE), the first whose
;; first change is hers, with a cause that goes to her (goes-to-and-transforms shows
;; the cause too); else the first whose first change is hers; else the first that
;; changes her. Another task that changes her shows nothing of it: if it changes no one
;; else it has no suggestions, and is "cant-do", as every change was before stage 6,
;; and the glass box has whose task shows it. The revival's rule.
(defun showing-task-of (character scene)
  (do ((tasks (reverse (ask ,scene recall your tasks)) (rest tasks))
       (first-of-hers nil)
       (changing-her nil))
      ((null tasks) (or first-of-hers changing-her))
      (let ((changes (changes-in (get (ask ,(first tasks) recall your task) 'description))))
	   (cond ((null changes))
		 ((eq (first (characters-changed-by (first (first changes)))) character)
		  (and (cause-going-to character (list (first changes)))
		       (return (first tasks)))
		  (or first-of-hers (setq first-of-hers (first tasks))))
		 ((and (null changing-her)
		       (changes-character? character changes))
		  (setq changing-her (first tasks)))))))

;; The cause who goes to a character in a task's changes: the first cause of a change of
;; hers that is someone else, and a character; nil if none.
(defun cause-going-to (character changes)
  (do ((c changes (rest c)))
      ((null c) nil)
      (let ((causer (second (first c))))
	   (and (memq character (characters-changed-by (first (first c))))
		causer (atom causer) (not (eq causer character)) (a-character? causer)
		(return causer)))))

;; Whether any of a task's changes changes the character.
(defun changes-character? (character changes)
  (do ((c changes (rest c)))
      ((null c) nil)
      (and (memq character (characters-changed-by (first (first c)))) (return t))))

;; The way of showing a character's change: the cause goes to her, if one does (a cause
;; someone else, and a character); otherwise she changes as she wanders.
(defun way-to-show-suggestion (changed causer element source)
  '(suggestion: element ,element
		value (method: type display
			       value ,(cond (causer (list 'goes-to-and-transforms causer changed))
					    (t (list 'changes-while-wandering changed))))
		strength high
		source ,source))

;; A bridge for each element to bridge, a value change suggested as joy suggests its
;; change-to: (emote.9:11-36), so that CHOMET takes every one beside the way of showing.
(defun bridge-suggestions (change-of element source)
  (let ((character (second change-of))
	(speed (rate-of-change change-of)))
       (mapcar (function
		(lambda (element+value)
			'(suggestion: element ,element
				      value (method: type display-value-change
						     value (bridge-to: element (,character ,(first element+value))
								       new-value ,(second element+value)
								       speed ,speed
								       for ,change-of))
				      strength high
				      source ,source)))
	       (elements-to-bridge change-of))))

;;; ------------------------------------------------- 3. what is bridged, and how fast

;; The elements of the dynamics Director reads (dichar.103:164-169).
(setq :change-director-elements '(speed path-curvature path-length path-jaggedness))

;; The elements to bridge, ((element new-value) ...): each element of the dynamics
;; Director reads whose new value pass 2 can weigh and weighs differently from the
;; value pass 2 has now (her choice point's, the story's CP's or an earlier scene's
;; BECOME's); with APPEAR, each element of how she looks whose look the fresh look
;; drew differently (look-elements-to-bridge). Each other element chosen again, and
;; each new value pass 2 can't weigh ((not X), none), is noted on the change-of actor:
;;   (not-bridged: element acceleration was high now medium because (director does not read it))
(defun elements-to-bridge (change-of)
  (append
   (mapcan (function
	    (lambda (element+value)
		    (movement-element-to-bridge change-of (first element+value) (second element+value))))
	   (ask ,change-of recall your new-values))
   (look-elements-to-bridge change-of)))

(defun movement-element-to-bridge (change-of element new)
  (let ((was (value-pass-2-has (second change-of) element)))
       (cond ((appearance-element? element) nil) ;;its look is bridged, if APPEAR drew it differently
	     ((or (null was) (equal was new)) nil)
	     ((not (memq element :change-director-elements))
	      (ask ,change-of memorize
		   (not-bridged: element ,element was ,was now ,new because (director does not read it)))
	      nil)
	     ((not (and (weighable? was) (weighable? new)))
	      (ask ,change-of memorize
		   (not-bridged: element ,element was ,was now ,new because (pass 2 cannot weigh it)))
	      nil)
	     ((= (weightify was) (weightify new)) nil)
	     (t (list (list element new))))))

(defun value-pass-2-has (character element)
  (let ((choice-point (list 'choice-point-of character element)))
       (and (exists? choice-point) (ask ,choice-point recall your current-choice))))

;; The values INTERF's weightify knows (interf.149:899-904).
(defun weighable? (value)
  (memq value '(low short medium long high)))

;; The elements of a look, REVIVE;APPEAR's appearance-element's (appear.lisp:89-106),
;; named here: CONVEY's receivers are asked for their suggestions before pass 2 has loaded
;; ELEMNT, where APPEAR defines them (run.65:49; loaded-files.json's order).
(setq :change-look-elements
      '(size shape-jaggedness shape-complexity color-intensity color-saturation color-hue))

(defun appearance-element? (element)
  (memq element :change-look-elements))

;; With APPEAR: how she looked and how the fresh look drew her (REVIVE;CHANGE keeps both
;; on the change-of actor, as (look-part value) lists: shape, angle, center-offset,
;; ani-size, hue, look-color), and each element of a look drawn differently, with its new
;; value: size if her size differs, color-intensity, color-saturation or color-hue if
;; her color's brightness, clarity or hue does, and, if her shape does, each shape
;; element chosen differently (the shape-complexity if neither was, the experts having
;; drawn her otherwise). Without APPEAR the change-of actor has no looks: nothing.
(defun look-elements-to-bridge (change-of)
  (let ((old (look-now (second change-of)))
	(new (ask ,change-of recall your new-look))
	(values (ask ,change-of recall your new-values)))
       (and old new
	    (append (mapcan (function
			     (lambda (element)
				     (and (not (equal (look-part-of element old) (look-part-of element new)))
					  (list (list element (second (assq element values)))))))
			    '(size color-intensity color-saturation color-hue))
		    (and (not (equal (look-part-of 'shape-complexity old)
				     (look-part-of 'shape-complexity new)))
			 (shape-elements-to-bridge change-of values))))))

;; Of a shape drawn differently, each shape element chosen differently, or the
;; shape-complexity if neither was (the experts drew her otherwise, REVIVE;SHAPES).
(defun shape-elements-to-bridge (change-of values)
  (let ((old-values (ask ,change-of recall your old-values)))
       (or (mapcan (function
		    (lambda (element)
			    (and (not (equal (assq element values) (assq element old-values)))
				 (list (list element (second (assq element values)))))))
		   '(shape-jaggedness shape-complexity))
	   (list (list 'shape-complexity (second (assq 'shape-complexity values)))))))

;; Her look as pass 2 has it now: (appearance-of cinderella), as the CP or an earlier
;; scene's change made it (REVIVE;APPEAR; REVIVE;CHANGE's look-of-appearance).
(defun look-now (character)
  (let ((appearance (list 'appearance-of character)))
       (and (exists? appearance)
	    (ask ,appearance recall your shape)
	    (look-of-appearance appearance))))

;; What a look shows of an element: its size, brightness, clarity, hue, or shape.
(defun look-part-of (element look)
  (cond ((eq element 'size) (second (assq 'ani-size look)))
	((eq element 'color-intensity) (third (second (assq 'look-color look))))
	((eq element 'color-saturation) (second (second (assq 'look-color look))))
	((eq element 'color-hue) (second (assq 'hue look)))
	(t (second (assq 'shape look)))))

;; How fast the change is made: low, gradual, by default; instantaneous if a cause of it
;; is magical. "After determining that a character's appearance will change, Ani still
;; has the problem of determining how this transition should be made. Occasionally the
;; transition should be instantaneous, i.e. in one frame the character has one
;; appearance and in the next frame a different appearance. More typically the
;; transition should be gradual" (p. 166, L4349-4353), and a change of personality as
;; well: an abrupt one "could easily be misinterpreted as meaning something else"
;; (p. 169, L4414-4415). Gradual is low, ten seconds an e-fold (disply.311:1104-1106),
;; Ken's slowest: that is the revival's rule, as the thesis leaves how long to Ani ("Ani
;; would decide how long it should take", L4416). Which transitions are instantaneous
;; the thesis doesn't say; the revival's rule is that a magical cause's are (magic
;; happens at once). Memorized on the change-of actor, for the glass box, the rule (of
;; the revival) being the gradual one's speed, or the magical one:
;;   (rate: is instantaneous because (magical fairy-godmother) rule (of the revival))
;;   (rate: is gradual because (an abrupt change could easily be misinterpreted thesis 169)
;;	    speed low rule (of the revival))
(defun rate-of-change (change-of)
  (let ((magical (magical-cause-of change-of)))
       (cond (magical
	      (ask ,change-of memorize
		   (rate: is instantaneous because (magical ,magical) rule (of the revival)))
	      'instantaneous)
	     (t (ask ,change-of memorize
		     (rate: is gradual
			    because (an abrupt change could easily be misinterpreted thesis 169)
			    speed low rule (of the revival)))
		'low))))

(defun magical-cause-of (change-of)
  (do ((c (ask ,change-of recall your causes) (rest c)))
      ((null c) nil)
      (and (first c) (atom (first c)) (a-character? (first c))
	   (ask ,(first c) recall if any items match (description: type ? descriptor magical %))
	   (return (first c)))))

;;; ------------------------------------------------- 4. the display methods

(defun define-the-ways-to-show-a-change ()
  (let ((:insert-methods-at-end nil))

       (define bridge-to: display-method)
       (define-receiver (estimate time for bridge-to: element ?element new-value ?
				   speed ? for ?change-of in ?subscene)
			bridge-to:
	(cond ((carrier-of (first element) subscene) (no-time)) ;;counted in the carrier's
	      (t (time-to-bridge change-of subscene))))
       (define-receiver (run bridge-to: element ?element new-value ? speed ? for ?change-of
			     in ?subscene stretched by ?factor)
			bridge-to:
	(or (carrier-of (first element) subscene) ;;it runs the bridges once the change begins
	    (bridge-alone (first element) change-of factor subscene)))

       (define goes-to-and-transforms display-method)
       (define-receiver (estimate time for goes-to-and-transforms ?causer ?changed in ?subscene)
			goes-to-and-transforms
	;;the walk to her, then the change: the two one after the other, as move-to-and-hits
	;;adds its walk to its cycles (disply.311:116-126); and her walk on, if she is off
	;;the stage (REVIVE;MEND6)
	(plus-time-to-bring-on changed causer subscene
			       (add-time-estimates (time-to-go-to-meet causer changed subscene)
						   (time-to-show-change-of changed subscene))))
       (define-receiver (run goes-to-and-transforms ?causer ?changed in ?subscene
			     stretched by ?factor)
			goes-to-and-transforms
	(run-goes-to-and-transforms causer changed factor subscene))

       (define changes-while-wandering display-method)
       (define-receiver (estimate time for changes-while-wandering ?character in ?subscene)
			changes-while-wandering
	(time-to-show-change-of character subscene))
       (define-receiver (run changes-while-wandering ?character in ?subscene stretched by ?factor)
			changes-while-wandering
	(run-changes-while-wandering character factor subscene))))

(+after-load '|ken;disply >| '(revival-once 'chshow-display-methods 'define-the-ways-to-show-a-change))

;; Each is a top-level actor of DISPLY's once DISPLY has loaded, so the tags give it
;; DISPLY as its file, as load.33 fills them for Ken's; REVIVE;MEND5's check that a
;; suggested display method exists then knows it before DISPLY has loaded.
(mapc (function (lambda (method) (putprop method '|KEN;DISPLY| 'actor-load)))
      '(bridge-to: goes-to-and-transforms changes-while-wandering))

;; The way of showing among the subscene's methods that carries a character's bridges:
;; goes-to-and-transforms of her, or changes-while-wandering.
(defun carrier-of (character subscene)
  (do ((m (ask ,subscene recall your methods) (rest m)))
      ((null m) nil)
      (let ((method (first m)))
	   (and (not (atom method))
		(or (and (eq (first method) 'goes-to-and-transforms) (eq (third method) character))
		    (and (eq (first method) 'changes-while-wandering) (eq (second method) character)))
		(return method)))))

(defun no-time ()
  '(time-estimates: ideal 0.0 least 0.0 most 0.0))

;; How long the bridges take: none if instantaneous; else Ken's estimate for a change by
;; the largest factor the bridges change by at the rate's speed (disply.311:1098-1111): a
;; change of hue or shape, as one e-fold (REVIVE;ALTER's look-change-to: estimates), but a
;; shape Director makes at once, none. All of them over the largest's time is the
;; revival's rule (4, above).
(defun time-to-bridge (change-of subscene)
  (let ((speed (rate-of-change change-of)))
       (cond ((eq speed 'instantaneous) (no-time))
	     (t (estimate-time-for-change-by (largest-factor-of (bridge-forms change-of 0.0 subscene)
								 (second change-of))
					     speed)))))

(defun largest-factor-of (forms character)
  (do ((f forms (rest f))
       (largest 1.0))
      ((null f) largest)
      (let ((factor (factor-of-form (first f) character)))
	   (and (> (abs (log factor)) (abs (log largest)))
		(setq largest factor)))))

;; (gradually change by F factor ...) and (gradually change look by F factor ...) change by
;; F; (gradually change look to ...) by e, one e-fold, or, a shape Director makes at
;; once, by nothing.
(defun factor-of-form (form character)
  (cond ((eq (third form) 'by) (float (fourth form)))
	((eq (fourth form) 'by) (float (nth 4 form)))
	((shape-at-once? form character) 1.0)
	(t (exp 1.0))))

;; Whether a form changes her to a shape Director changes her to at once: REVIVE;LOOKS
;; in-betweens a shape only if INTER makes an in-between of no more than
;; :look-morph-moves moves (look-morph), and otherwise draws the new shape in a tick
;; (change-look-to), whatever time it is given (an eight-pointed star into a star, say:
;; 1,440 moves). Such a change takes no time, and is said to happen at once.
(defun shape-at-once? (form character)
  (let ((look (nth 4 form))
	(now (look-now character)))
       (and (eq (fourth form) 'to)
	    (not (atom look))
	    (get look 'shape)
	    now
	    (null (look-morph (second (assq 'angle now)) (get look 'angle))))))

;; How long the change is shown: the bridges' time, or, if they take none (an
;; instantaneous change, or one with nothing Director can show), one walk across the
;; stage, so that "the changes are apparent" (p. 126, L3391-3393): REVIVE;MEND9's wander's
;; estimate of a walk (across-the-stage).
(defun time-to-show-change-of (character subscene)
  (let ((change-of (change-of-shown-in character subscene)))
       (let ((bridge (cond (change-of (time-to-bridge change-of subscene)) (t (no-time)))))
	    (cond ((> (get bridge 'ideal) 0.0) bridge)
		  (t (time-to-wander-across character subscene))))))

(defun time-to-wander-across (character subscene)
  (estimate-time-to-move-character character
				   (across-the-stage)
				   '(stop-when-there (quote ,subscene))
				   (special-dynamics-of character subscene)
				   subscene))

;; The Director forms of the change-of actor's bridges, each once: each element's type
;; asked for its form (5, below; REVIVE;ALTER for how she looks), for a change over
;; seconds in the subscene. An element whose value is already the new one gives none.
(defun bridge-forms (change-of seconds subscene)
  (do ((e (elements-to-bridge change-of) (rest e))
       (forms nil (let ((form (director-form-of-bridge (second change-of) (first (first e))
						      (second (first e)) change-of seconds subscene)))
		       (cond ((or (null form) (member form forms)) forms)
			     (t (cons form forms))))))
      ((null e) (reverse forms))))

(defun director-form-of-bridge (character element new-value change-of seconds subscene)
  (ask ,(element-type-of element)
       yield gradual change of (,character ,element) to ,new-value
       for ,change-of in ,seconds seconds in ,subscene))

;; An element's type, which gives its Director form: an element of the dynamics, its
;; parent, as ELEMNT defines it (asking the element loads ELEMNT, from the tags); an
;; element of a look, appearance-element. The elements of a look have no tags entry
;; (REVIVE;APPEAR, 1: size is every object's variable too), and ELEMNT, where APPEAR
;; defines them, may not have loaded when the time a change takes is estimated (a
;; change of how she looks alone; finding 5); appearance-element has one, and loads it
;; (B1 of the review of stage 6, where asking shape-jaggedness for its parent stopped
;; pass 2 with NO-SUCH-ACTOR).
(defun element-type-of (element)
  (cond ((appearance-element? element) 'appearance-element)
	(t (ask ,element recall your parent))))

;;; ------------------------------------------------- the ways of showing, run

;; goes-to-and-transforms, as move-to-and-hits runs (disply.311:128-153): the two placed
;; a medium distance apart (initial-locations-for-goes-to-and-hits), the one changed
;; brought on first if she starts off the stage (REVIVE;MEND6's bring-on, as MEND5's
;; move-to brings on the one it meets); the cause's walk to contact with her, regardless
;; of collisions, as goes-to-to-hit's (disply.311:132-147), its speed divided by the
;; stretch, as goes-to-and-accompanys divides it (disply.311:189-190); then, once they
;; touch, the change shown (plans-to-show-the-change), stretched the same. (Walking
;; carefully, as goes-to-to-accompany does, disply.311:204-213, the cause could be kept
;; from her by a bystander, and REVIVE;MEND12 then stopped the walk with the two apart:
;; M4 of the review of stage 6. A walk to her can still be stopped so, if she moves
;; away, and the glass box has MEND12's note.) The change
;; follows the walk in a sequence:, as move-to-and-hits' hitting follows its walk to
;; contact: a plan begun (after (end-of ...) 0.0), as goes-to-and-accompanys begins its
;; accompanying (after ... .5), is told the walk ended as it is run, if the walk ends at
;; once (the two touching already), and stops on "I'm suppose to begin at ... but
;; nothing planned" (action.152:240-255); a sequence: runs the next on the next tick.
(defun run-goes-to-and-transforms (causer changed factor subscene)
  (let ((method (list 'goes-to-and-transforms causer changed)))
       (cond ((brings-on? changed causer subscene method)
	      (initial-locations-for-goes-to-and-hits causer changed subscene)
	      (let ((get-on-stage-plan (bring-on changed causer factor subscene 'goes-to-and-transforms)))
		   (ask ,subscene add (sequence: ,get-on-stage-plan
						 ,(plans-to-transform causer changed factor method subscene))
			to your list of movements)))
	     (t (initial-locations-for-goes-to-and-hits causer changed subscene)
		(ask ,subscene add ,(plans-to-transform causer changed factor method subscene)
		     to your list of movements)))))

(defun plans-to-transform (causer changed factor method subscene)
  (let ((go-to-plan (move-character (activity-name-of 'goes-to-to-transform)
				    causer
				    '(contact-with ,changed by ,causer)
				    'moving-target
				    '(stop-when-there (quote ,subscene))
				    0.0 ;;start right away
				    (divide-speed-by-factor causer factor subscene)
				    'regardless ;;of collisions, as goes-to-to-hit
				    subscene)))
       (let ((show (plans-to-show-the-change changed factor method subscene)))
	    (ask ,(change-of-shown-in changed subscene) memorize
		 (goes-to: plan ,go-to-plan by ,causer))
	    '(sequence: ,go-to-plan !,show))))

;; REVIVE;MEND6 makes again, when the subscene runs its methods, an estimate that
;; assumed otherwise about bringing someone on; it knows who moves and who may be brought
;; on by mover-and-other-of, and here in goes-to-and-transforms: the cause, and the one
;; it changes.
(defun mover-and-other-of-ways-to-show-a-change (method)
  (cond ((eq (first method) 'goes-to-and-transforms) (list (second method) (third method)))
	(t (funcall (revival-wrapped 'mover-and-other-of 'chshow) method))))

(revival-wrap 'mover-and-other-of 'chshow 'mover-and-other-of-ways-to-show-a-change)

;; changes-while-wandering: she is placed if she has no place yet, as REVIVE;MEND9 places
;; one who wanders (place-to-wander); the change is shown from the subscene's start.
(defun run-changes-while-wandering (character factor subscene)
  (or (located? '(vicinity-of ,character) subscene)
      (place-to-wander character subscene))
  (mapc (function (lambda (movement) (ask ,subscene add ,movement to your list of movements)))
	(plans-to-show-the-change character factor (list 'changes-while-wandering character)
				  subscene)))

;; The change shown, as it is run: the bridges, all of them over the bridges' time
;; stretched as the method is (an instantaneous change in a tick), in a plan of their
;; own, bridging-the-gap; and, alongside, the one who changes wandering, for as long as
;; the change is shown (time-to-show-change-of), stretched the same, unless another way
;; of showing of the part moves her (moving-otherwise-in). Returns what Director is to
;; run, a list of nothing or one of: (and (activity-of bridging-the-gap 4) (sequence:
;; (activity-of wandering-while-changing 5) ...)), the bridges' plan alone, or the
;; wander alone. What was planned is memorized on the change-of actor for the glass box
;; (each run forgets the last: a subscene extended for one after it is run again,
;; scene.9:223-240):
;;   (shown-by: method (goes-to-and-transforms prince step-mother) in (subscene-of change-of-heart 1)
;;	       stretched-by 1.2 seconds 16.6 ideal 13.9)
;;   (bridges: plan (activity-of bridging-the-gap 4) seconds 16.6 ideal 13.9)
;;   (bridged: element (step-mother path-curvature) was low now medium
;;	      by (gradually change by 2.0 factor for path-curvature in 16.6 seconds))
;;   (wanders: plans ((activity-of wandering-while-changing 5) ...) seconds 16.6)
;;   (wanders: plans nil seconds 16.6 carried-by (chases-to troll goat ...))
(defun plans-to-show-the-change (character factor method subscene)
  (let ((change-of (change-of-shown-in character subscene)))
       (let ((bridge (time-to-bridge change-of subscene))
	     (show (time-to-show-change-of character subscene)))
	    (let ((bridge-seconds (*$ (float factor) (get bridge 'ideal)))
		  (show-seconds (*$ (float factor) (get show 'ideal)))
		  (moving (moving-otherwise-in character method subscene)))
		 (forget-how-it-was-shown change-of)
		 (ask ,change-of memorize
		      (shown-by: method ,method in ,subscene stretched-by ,factor
				 seconds ,show-seconds ideal ,(get show 'ideal)))
		 (let ((bridging-plan (plan-the-bridges character change-of bridge-seconds
							(get bridge 'ideal) subscene)))
		      (let ((wander-plans (cond (moving
						 (ask ,change-of memorize
						      (wanders: plans nil seconds ,show-seconds carried-by ,moving))
						 nil)
						(t (plan-to-wander-while-changing character change-of
										  show-seconds subscene
										  (and (> bridge-seconds 0.0)
										       bridging-plan))))))
			   (cond ((and bridging-plan wander-plans)
				  (list '(and ,bridging-plan (sequence: !,wander-plans))))
				 (bridging-plan (list bridging-plan))
				 (wander-plans (list '(sequence: !,wander-plans))))))))))

;; Another way of showing of the part that moves her on dynamics of her own: one she does
;; (its first character is its doer: move-to-and-hits' hitter, chases-to's chaser,
;; pushes-around's pusher, MEND5's move-to, MEND9's wander-around, KNOW's helps-along
;; ...), or a chase or a push of her (the one chased runs away and the one pushed coasts,
;; each on dynamics of her own, disply.311:47-82, 243-328). Then she doesn't wander: the
;; wander's goal would replace the chase's (the troll's chase of the goat, cut at frame 5
;; of 61, m11 of the review of stage 6), or the two moves pull different ways
;; (REVIVE;MEND12, "two moves at once"). That way carries the change, her bridges growing
;; the dynamics it moves her by. One accompanied (goes-to-and-accompanys' friend) is
;; moved on the other's dynamics (disply.311:214-223), so she still wanders. The
;; revival's rule. nil, or the way of showing.
(defun moving-otherwise-in (character method subscene)
  (do ((m (ask ,subscene recall your methods) (rest m)))
      ((null m) nil)
      (let ((other (first m)))
	   (and (not (atom other))
		(not (equal other method))
		(not (memq (first other) '(goes-to-and-transforms changes-while-wandering bridge-to:)))
		(or (eq (second other) character)
		    (and (memq (first other) '(chases-to pushes-around)) (eq (third other) character)))
		(return other)))))

(defun forget-how-it-was-shown (change-of)
  (mapc (function (lambda (pattern) (ask ,change-of forget items matching ,pattern)))
	'((shown-by: %) (bridges: %) (bridged: %) (wanders: %) (goes-to: %))))

;; The bridges' plan: what Director is to do for each, (ask step-mother gradually change by
;; 2.0 factor for path-curvature in 16.6 seconds), all at once, as it is run. As Ken's
;; run-change-to does (disply.311:1079-1096), the character's special dynamics are set to
;; hers for the subscene as it begins, so that the change grows those of the scene, and
;; the next subscene starts from each new value of her dynamics. A look keeps no value in
;; a subscene (REVIVE;ALTER). nil if there is nothing to bridge.
(defun plan-the-bridges (character change-of seconds ideal subscene)
  (let ((forms (bridge-forms change-of seconds subscene)))
       (and forms
	    (let ((plan (ask plan if new make ,(activity-name-of 'bridging-the-gap))))
		 (set-the-next-subscenes-values change-of subscene)
		 (ask ,subscene add (ask ,character to set your special-dynamics to
					 ,(ask ,character yield your special-dynamics in ,subscene))
		      to your list of initial-actions)
		 (ask ,plan set your begin-time to 0.0) ;;as it is run
		 (ask ,plan set your subscene to ,subscene)
		 (ask ,plan add (and !,(mapcar (function (lambda (form) '(ask ,character !,form))) forms))
		      to your list of plans)
		 (ask ,subscene add ,plan to your list of plans)
		 (ask ,change-of memorize (bridges: plan ,plan seconds ,seconds ideal ,ideal))
		 (note-the-bridges character change-of forms subscene)
		 plan))))

(defun set-the-next-subscenes-values (change-of subscene)
  (let ((next-subscene (ask ,subscene recall your next-subscene))
	(character (second change-of)))
       (and (exists? next-subscene)
	    (> (ask ,next-subscene recall your order-in-scene) 1)
	    (mapc (function
		   (lambda (element+value)
			   (or (appearance-element? (first element+value))
			       (ask ,next-subscene set your (,character ,(first element+value))
				    to ,(second element+value)))))
		  (elements-to-bridge change-of)))))

;; Each form, with the element it bridges and from what to what, on the change-of actor;
;; a shape Director changes at once (shape-at-once?) said so:
;;   (bridged: element (troll shape-jaggedness) was eight-pointed-star now star
;;	      by (gradually change look to (look: shape star ...) in 0.0 seconds)
;;	      at-once (no in-between for these shapes))
(defun note-the-bridges (character change-of forms subscene)
  (mapc (function
	 (lambda (element+value)
		 (let ((form (director-form-of-bridge character (first element+value)
						      (second element+value) change-of 0.0 subscene)))
		      (and form
			   (let ((made (do ((f forms (rest f)))
					   ((null f) nil)
					   (and (equal (but-the-seconds (first f)) (but-the-seconds form))
						(return (first f))))))
				(ask ,change-of memorize
				     (bridged: element (,character ,(first element+value))
					       was ,(bridged-from character (first element+value) subscene)
					       now ,(bridged-to (first element+value) (second element+value)
								change-of)
					       by ,made
					       !,(and made (shape-at-once? made character)
						      '(at-once (no in-between for these shapes))))))))))
	(elements-to-bridge change-of)))

(defun but-the-seconds (form)
  (let ((at (memq 'in form)))
       (cond (at (reverse (rest (memq 'in (reverse form))))) ;;up to the last in
	     (t form))))

(defun bridged-from (character element subscene)
  (cond ((appearance-element? element) (look-part-of element (look-now character)))
	(t (do-as-if-you-were subscene ,subscene yield most current value of (,character ,element)))))

(defun bridged-to (element new-value change-of)
  (cond ((appearance-element? element) (look-part-of element (ask ,change-of recall your new-look)))
	(t new-value)))

;; She wanders while the change is shown, as REVIVE;MEND9's wander-around wanders: walks
;; across the stage and back, each to the place good-distance-from finds, the farthest of
;; the middle and the corners (interf.149:595-616), each stopping when she is there or
;; its share of the time is up, with Ken's (stop-if-either-wants-to
;; (stop-after-so-many-seconds T) (stop-when-there ...)) from goes-to-and-accompanys
;; (disply.311:219-222), so that the wander ends with the change however long the walks
;; would take. Unlike MEND9's, which counts as many walks as walks across the stage fit
;; the time, enough walks to fill it however short each is: a walk from the middle to a
;; corner is half a walk across, and one that ends before its share of the time ends the
;; wander, and the part, early, so that a part after it that extends it (the beautified
;; scene's joy, which begins when the transformation was to end, scene.9:223-240) would
;; never run (action.152:62-71; tried: the fairy godmother's Cinderella got there in 11
;; of 20 seconds). And the walks are counted at the faster of her speeds before and
;; after the bridges: the estimate of a walk is made with her dynamics as the part
;; begins, and a bridge that speeds her up would have her get there sooner and the
;; wander end before the bridges (Learning to Socialize's ended 9 frames early: m2 of
;; the review of stage 6). Her dynamics are hers in the subscene, not
;; stretched (multiply-speed-by-factor by 1.0, as MEND9's are), so that the bridges
;; change them as she walks; each walk has dynamics of its own, since Director
;; multiplies a dynamics' factors by its parent's again each time it is set
;; (dichar.103:27-31), and one set again would count the change so far twice. Each walk
;; is planned with move-character, to be run one after the other in a sequence:.
;; Ken's time to walk reads only her speed (time-to-walk-1, place.45:546-562), and the
;; bridges may make her paths shorter too (smoother, less curved), so a walk can still
;; get there before its share of the time; so, while gradual bridges run, one more walk
;; follows the others, which stops when she is there or when the bridges' plan has
;; ended (stop-when-plan-ended, 6, below): if they ended already, at once, a tick. That
;; she wanders as long as the bridges run is the revival's choice (the design's decision
;; 7). Returns their plans' names.
(defun plan-to-wander-while-changing (character change-of seconds subscene bridging-plan)
  (let ((half-way-across (//$ (*$ .5 (get (time-to-wander-across character subscene) 'ideal))
			      (speeding-up-of change-of subscene))))
       (let ((walks (max 1 (fix (+$ .999 (//$ seconds half-way-across))))))
	    (do ((i walks (1- i))
		 (plans nil))
		((= i 0)
		 (and bridging-plan
		      (setq plans (cons (wander-walk character
						     '(stop-if-either-wants-to
						       (stop-when-plan-ended (quote ,bridging-plan))
						       (stop-when-there (quote ,subscene)))
						     subscene)
					plans)))
		 (ask ,change-of memorize (wanders: plans ,(reverse plans) seconds ,seconds))
		 (reverse plans))
		(setq plans (cons (wander-walk character
					       '(stop-if-either-wants-to
						 (stop-after-so-many-seconds ,(//$ seconds (float walks)))
						 (stop-when-there (quote ,subscene)))
					       subscene)
				  plans))))))

;; A walk of her wander, to the farthest of the middle and the corners, stopping as the
;; condition says.
(defun wander-walk (character stop-condition subscene)
  (move-character (activity-name-of 'wandering-while-changing)
		  character
		  '(good-distance-from (vicinity-of ,character))
		  'stationary-target
		  stop-condition
		  0.0 ;;as it is run
		  (multiply-speed-by-factor character 1.0 subscene)
		  'careful ;;of collisions
		  subscene))

;; How much faster the bridges make her, at least 1.0: the ratio of the weights of her new
;; speed and her speed in the subscene, as the speed's bridge changes it (define-movement-
;; bridge, 5, below).
(defun speeding-up-of (change-of subscene)
  (let ((speed (assq 'speed (elements-to-bridge change-of))))
       (cond ((null speed) 1.0)
	     (t (max 1.0 (//$ (weightify (second speed))
			      (weightify (do-as-if-you-were subscene ,subscene
							    yield most current value of
							    (,(second change-of) speed)))))))))

;; A bridge with no way of showing it beside it (the way rejected, say): the change runs
;; from the subscene's start, as Ken's run-change-to runs one (disply.311:1079-1096), over
;; the bridges' time stretched; she has a part only in changes, so SCENE extends the
;; subscene before or has her wander (plan-something-if-only-changes, scene.9:211-221;
;; REVIVE;MEND9). All of a character's bridges are made by the first of them run. As
;; Ken's run-change-to does (disply.311:1083-1089), and plan-the-bridges, her special
;; dynamics are set to hers for the subscene as it begins whether or not there is a next
;; subscene to set the new values of.
(defun bridge-alone (character change-of factor subscene)
  (or (bridged-already? character subscene)
      (let ((bridge (time-to-bridge change-of subscene)))
	   (let ((seconds (*$ (float factor) (get bridge 'ideal))))
		(let ((forms (bridge-forms change-of seconds subscene)))
		     (forget-how-it-was-shown change-of)
		     (ask ,change-of memorize
			  (shown-by: method alone in ,subscene stretched-by ,factor
				     seconds ,seconds ideal ,(get bridge 'ideal)))
		     (cond (forms
			    (set-the-next-subscenes-values change-of subscene)
			    (ask ,subscene add (ask ,character to set your special-dynamics to
						    ,(ask ,character yield your special-dynamics in ,subscene))
				 to your list of initial-actions)))
		     (mapc (function
			    (lambda (form)
				    (ask ,subscene add ,form to your list of (changes-for ,character))))
			   forms)
		     (note-the-bridges character change-of forms subscene)))))
  nil)

;; Whether the subscene's changes for the character have a change in seconds already, as
;; the first of her bridges run adds them. A subscene run again, extended for one after
;; it (scene.9:223-240), is restored first, and has none.
(defun bridged-already? (character subscene)
  (do ((c (ask ,subscene recall your (changes-for ,character)) (rest c)))
      ((null c) nil)
      (and (not (atom (first c)))
	   (eq (first (last (first c))) 'seconds)
	   (return t))))

;;; ------------------------------------------------- 5. each element type's Director form

;; A bridge of an element of the dynamics: Director changes its factor by the ratio of
;; the weights of its new value and the value it has in the subscene, as Ken's
;; change-to: does (disply.311:1063-1077), over seconds; none if they weigh the same.
(defun define-movement-bridge ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (yield gradual change of ?element to ?new-value for ? in ?seconds seconds
			       in ?subscene)
			normal-movement-element
	(let ((factor (//$ (weightify new-value)
			   (weightify (do-as-if-you-were subscene ,subscene
							 yield most current value of ,element)))))
	     (and (not (= factor 1.0))
		  '(gradually change by ,factor factor for ,(second element) in ,seconds seconds))))))

(+after-load '|ken;elemnt >| '(revival-once 'chshow-movement-bridge 'define-movement-bridge))

;;; ------------------------------------------------- 6. Director

;; DICHAR's gradually change (dichar.103:102-121), over seconds Ani chose instead of at a
;; speed: the same two repeats, of the special dynamics of the character's scene (so that
;; dynamics set later in the scene carry the change, by DICHAR's demon) and of the
;; character's own, each multiplying the element's factor by a rate. The rate is the
;; factor's root for the ticks the seconds make at the film's frame rate, so that the
;; change ends when Ani planned at 4 frames a second and at 24. Ken's ticks are his
;; ticks-to-grow-e times the factor's logarithm, ticks-to-grow-e being DISPLY's time to
;; grow by e multiplied by the speed's weight, where DISPLY's estimate divides it
;; (disply.311:1104-1106), so that a change at high speed runs four times longer than Ani
;; planned and one at low speed a quarter as long; and his repeat makes one step fewer
;; than it counts (some.666:444-450, the last only does the followup), so his change
;; never quite reaches its factor. Here the repeat counts one more than the steps, and
;; the change reaches its factor on its last step, at the tick before the followup. An
;; instantaneous change is a tick. And the second repeat multiplies the character's own
;; dynamics only if they don't have the factor from the scene's, which the first has
;; multiplied already. In Ken's, a walk's dynamics, which have only their speed factor of
;; their own (multiply-dynamics-by-factor, place.45:452-461) and so the scene's for the
;; others (SOME's recall your, some.666:115-120), take the first tick's step twice, from
;; the scene's already grown, and go a step ahead; and when she stands with the scene's
;; own dynamics (special-dynamics-for-current-scene, dichar.103:22-26), every step is
;; taken twice, and his change goes as far again (test/change.test.js shows both).
(defun define-the-bridge-for-director ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (gradually change by ?factor factor for ?element in ?seconds seconds
				  %followup)
			director-character
	(let ((ticks (ticks-in-seconds seconds)))
	     (let ((rate (expt (float factor) (//$ 1.0 (float ticks)))))
		  (ask ,(ask :self recall your special-dynamics-for-current-scene)
		       repeat (multiply your (,element factor) by ,rate) ,(1+ ticks) times !,followup)
		  (ask ,:self
		       repeat (multiply your own dynamics factor for ,element by ,rate)
		       ,(1+ ticks) times))))
       (define-receiver (multiply your own dynamics factor for ?element by ?rate) director-character
	(let ((own (ask :self recall your special-dynamics)))
	     (or (dynamics-have-it-from? own (list element 'factor)
					 (ask :self recall your special-dynamics-for-current-scene))
		 (ask ,own multiply your (,element factor) by ,rate))))))

(+after-load '|ken;dichar >| '(revival-once 'chshow-director-bridge 'define-the-bridge-for-director))

;; A stop condition for a walk of her wander, in the idiom of Ken's arc stop conditions
;; (dichar.103:401-499): stop when a plan has ended, as the movie keeps its events
;; (action.152:52), and otherwise go on (nil). The wander's last walk stops so when the
;; bridges end (plan-to-wander-while-changing, above).
(defun define-stop-when-plan-ended ()
  (let ((:insert-methods-at-end nil))
       (define plan-ended-condition arc-stop-condition)
       (define-receiver (should ? stop after moving ? of ? to ?) plan-ended-condition
	(and (ask movie ask your current-movie to recall your (end-of ,(ask :self recall your plan)))
	     0.0))))

(+after-load '|ken;dichar >| '(revival-once 'chshow-plan-ended 'define-stop-when-plan-ended))

(defun stop-when-plan-ended (plan)
  (let ((condition (ask plan-ended-condition make uninterned offspring)))
       (ask ,condition set your plan to ,plan)
       condition))

;; The ticks in seconds are REVIVE;WRAP's ticks-in-seconds, which REVIVE;LOOKS counts a
;; look's change in seconds by too.

;;; ------------------------------------------------- 7. the film waits for a change shown

;; A repair of the revival's (M3 of the review of stage 6). When a part ends, every part
;; of the scene is told, and each tells its own parasites (the parts that extend it) they
;; have ended too, and asks Director, the tick after, to stop the film if nothing is
;; running or planned (action.152:62-78, 88-91). A part that extends another
;; (extend-last-actions-of, scene.9:223-240) begins when the part it extends was to end
;; before it was extended, and is never one of the running parts (action.152:61-63), so
;; when it ends first, and the universe's list of actors to run next is empty, as it is
;; while the actors tick (REVIVE;BRIDGE), the film stops with the part it extends still
;; running. A change and then a feeling, the form of Ken's cinderella-beautified, made
;; gradually, stopped so in the middle of the transformation, the goat's colors half
;; cleared, her bridges never ending. So the film is not stopped while a part that shows
;; a change is still running: while a plan of a part with a change's bridges or her
;; wander in it (a bridging-the-gap or wandering-while-changing plan) has begun and not
;; ended, whether it is one of those or the part's other plans (the Prince's
;; accompanying the repentant stepmother, at 24 frames a second); the part, ending, asks
;; again, as every part does. Ken's scenes show no change and stop as they did (node
;; tools/check-1978.mjs --extensions change); a part of Ken's that a feeling's part
;; extends is still cut short when that part ends first (his accompanying, say), as in
;; 1978. The repair leaves a note on the plan it waited for, once:
;;   (revival-repair: what film-waited-for-change was stopped now kept-filming
;;		     because (a change shown at frame 64))
(defun define-the-film-waits-for-a-change ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (stop film if nothing running) director-subscene
	(let ((plan (change-shown-in-progress :self)))
	     (cond (plan (note-the-film-waited plan))
		   (t (ask-old :self stop film if nothing running)))))))

(+after-load '|ken;action >| '(revival-once 'chshow-film-waits 'define-the-film-waits-for-a-change))

;; A plan of the scene's parts that show a change (a part with a change's bridges or her
;; wander among its plans) that has begun and not ended, as the movie keeps their events
;; (action.152:52), or nil.
(defun change-shown-in-progress (subscene)
  (let ((movie (ask movie recall your current-movie)))
       (do ((p (apply 'append
		      (mapcar (function (lambda (s) (plans-of-a-part-showing-a-change s)))
			      (ask ,subscene ask your scene to recall your subscenes)))
	       (rest p)))
	   ((null p) nil)
	   (and (ask ,movie recall your (beginning-of ,(first p)))
		(null (ask ,movie recall your (end-of ,(first p))))
		(return (first p))))))

;; A part's plans, if a change is shown in it; else none.
(defun plans-of-a-part-showing-a-change (subscene)
  (let ((plans (append (ask ,subscene recall your plans) nil)))
       (and (do ((p plans (rest p)))
		((null p) nil)
		(and (change-showing-plan? (first p)) (return t)))
	    plans)))

(defun change-showing-plan? (plan)
  (and (not (atom plan)) (eq (first plan) 'activity-of)
       (memq (second plan) '(bridging-the-gap wandering-while-changing))))

(defun note-the-film-waited (plan)
  (or (ask ,plan recall if any items match (revival-repair: what film-waited-for-change %))
      (revival-note plan 'film-waited-for-change 'stopped 'kept-filming
		    (list 'a 'change 'shown 'at 'frame
			  (ask movie ask your current-movie to recall your frame-count)))))

;;; ------------------------------------------------- 8. for the glass box

;; The change-of actors shown in a scene: REVIVE;CHANGE's learn-what-changes-in marks
;; them (shown-in: scene) when it loads them (src/pipeline.js glassBox, changesShown).
(defun changes-shown-in (scene)
  (and (actor-of 'description-change dont-autoload)
       (mapcan (function
		(lambda (change-of)
			(and (ask ,change-of recall if any items match (shown-in: ,scene))
			     (list change-of))))
	       (reverse (ask description-change recall your offspring)))))

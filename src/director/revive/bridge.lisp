;;; -*-lisp-*-
;;; REVIVE;BRIDGE: run Ani's 1978 code on the Director of January 1979.
;;;
;;; This file is ours, not Ken's. Ani was written for the Director of the first
;;; Director Guide (AIM-482, June 1978); her compiled files on tape 7005017 date
;;; from June to October 1978, and CP 29, the pass-1 output we test against, was
;;; written on 14 September 1978. Around 21 November 1978 Ken rewrote Director (the
;;; second Guide, AIM-482B, says "much of Director has been rewritten" and demons
;;; "have been eliminated"), and the Director files that survived (DRECT, SOME 666,
;;; OBJECT 401) are that rewrite as of 8 January 1979. Four things Ani relies on
;;; changed, and this file puts them back:
;;;
;;;  1. :self is the name a message was sent to, as in 1978.
;;;  2. Variable demons, kept in variables as the 1978 Guide says, so that a save
;;;     keeps them; Ken's own bridge, ODIREC 2 (22 November 1978), says how a set
;;;     uses their answer.
;;;  3. Database demons: virtual items and actions on memorizing, rebuilt from the
;;;     1978 Guide, since no bridge for them survives.
;;;  4. INTERSECT's order, which decides the order Ani makes her choices in.
;;;
;;; With them, pass 1 writes CP 29 exactly: the same 102 choices, in the same order.
;;;
;;; Load it after (director '(ani direct)) and before any of Ani's files.

;; SOME (Something, the root actor) is loaded on first use; load it now so that
;; what follows replaces its definitions rather than being replaced by them.
(actor-of 'something)

;;; -------------------------------------------------------------- 1. :self

;; In 1978 a message was sent to an actor's name, and :self was bound to that name.
;; The Guide's compiled transmission binds it to the name as written, (LET ((:SELF
;; 'MY-FIRST-FILM) ...) ...) (AIM-482 p. 56), and the compiled 1978 Ani files send
;; (ASK1 'SOMETHING '(...)). Ani builds names and data from it: CPOINT's (third
;; :self) is the element of (choice-point-of cinderella speed), a descriptor records
;; itself as a suggestion's source with ,:self, and a character comparison, which
;; has a synonym with its two characters the other way round, names a relative
;; choice point after (rest :self), the pair in the order it was addressed in. CP 29
;; has both orders, e.g. (relative-choice-point-of (prince step-mother)
;; relative-path-curvature) and (relative-choice-point-of (step-mother prince)
;; relative-path-length). In 1979 asks expand into (ask1 (actor-of target) ...)
;; and DRECT's ask1 binds :self to the actor itself (the revised Guide's (LET
;; ((MYSELF (ACTOR-OF 'MY-FIRST-FILM))) ...)).
;;
;; Here the asks give ask1 the target as written, and ask1 binds :self to it (to
;; its name, if it is an actor rather than a name) and starts the method search
;; there. The accessors in MACROS accept a name, so DRECT's search works as it
;; did, and its test for private methods, (eq actor :self), holds for the
;; receiver alone.
(defun ask1 (target :message :skip-current-method?)
  (and (actor-of target) ;;loads the actor's file if need be
       (let ((:self (self-name target)))
	    (cases :self))))

(define-macro ask (target . message)
  '(ask1 ,(ask-target target) ,(ask-message message) nil))

(define-macro uncompiled-ask (target . message)
  '(ask1 ,(ask-target target) ,(ask-message message) nil))

(define-macro ask-old (target . message)
  '(ask1 ,(ask-target target) ,(ask-message message) t))

(define-macro ask-if-exists (target . message)
  '(and (exists? ,(ask-target target))
	(ask1 ,(ask-target target) ,(ask-message message) nil)))

(define-macro ask-if-understood (target . message)
  '(let ((:message-not-understood 'not-understood-so-nil))
	(ask1 ,(ask-target target) ,(ask-message message) nil)))

(define-macro ask-if-can (target . message)
  '(and (exists? ,(ask-target target))
	(let ((:message-not-understood 'not-understood-so-nil))
	     (ask1 ,(ask-target target) ,(ask-message message) nil))))

(define-macro ask-each (targets . message)
  '(mapcar (function (lambda (:ask-each-target)
			     (ask1 :ask-each-target ,(ask-message message) nil)))
	   ,(ask-target targets)))


;; DRECT's place-actor-on-name files an actor under a name. SOME hands it :self to
;; make a synonym, (synonym-for :self name), or to rename an actor (remob); given
;; a name, it must file the actor that the name stands for.
(defun place-actor-on-name (actor name)
  (general-putprop name (actor-object actor) 'actor 'non-atomic-actors))

;; SOME 666's internal-recall-your-normal-variable, which gives an actor its own
;; list of variables, now put in front of its methods, as SOME's memorize and its
;; "set your" for private variables already do ("so these go up front"). Files that
;; actors autoload from are read with :insert-methods-at-end bound to T (DRECT's
;; director-load), and Something keeps the general method among its own, so a list
;; made for Something while a file loads went behind it and was never found again:
;; SOME's own (ask something set your universe to default-universe) was lost, and
;; Director's movies filmed nothing. That setting is made again here.
(let ((:replace-old-methods t))
     (define-method (internal-recall-your-normal-variable) something
      ;;if I get here then the guy doesn't have any normal variables yet so make them as follows
      (let ((the-alist (list nil))
	    (:insert-methods-at-end nil))
	   (ask :self do only for yourself when receiving
		(internal-recall-your-normal-variable)
		(director-symbol-for-value ,the-alist))
	   the-alist)))

(ask something set your universe to default-universe)

;; The universe's tick: do what is planned for the universe itself, then tick each
;; actor that has something planned. SOME 666 does this inside an UNWIND-PROTECT
;; whose cleanup sets actors-to-run-next back to the list it started with, every
;; time; so an actor that first plans something during a tick (each activity a
;; subscene starts) is dropped, and the list never empties, though ACTION stops the
;; film when it does ("stop film if nothing running"). By August 1979 (SOME 1005,
;; tape 9004336) the clock's tick is just this, without the cleanup.
;;
;; The list is empty while the actors tick, so a subscene that checks it then can
;; stop the film with actors still to tick. That is what the 1978 film did: in the
;; thesis's flipbook Kept Apart ends 113 frames in (lower left, pages 84-310), just
;; after its third subscene, with the stepmother still standing guard; and its
;; second and third subscenes start at frames 4 and 61, as ours do. (Keeping the
;; list true during the tick, as the 1978 Guide describes it, "a list of all actors
;; in that universe with anything planned", runs Kept Apart to 188 frames.)
(let ((:replace-old-methods t))
     (define-extension-method (tick) universe
      (help-comments: |besides doing a normal tick I ask each of my actors-to-run-next to tick|)
      (ask-old :self tick) ;;do anything planned too
      (let ((actors-to-run (ask :self recall your actors-to-run-next)))
	   (ask :self set your actors-to-run-next to nil)
	   (ask-each ,actors-to-run tick))))

;; ACTION (October 1978) calls OBJECT's do-set-turtle-gradually with the performer
;; as well as the planner: (planner performer x y heading followup message). OBJECT
;; 401 (January 1979) has (planner x y heading followup message), the performer
;; being :self ("typically the planner and the object performing are the same but
;; Ani needs it otherwise"). After OBJECT loads, the old call is accepted too.
(+after-load '|ken;object >|
  '(progn
    (putprop 'do-set-turtle-gradually (get 'do-set-turtle-gradually 'expr) 'object-401-expr)
    (defun do-set-turtle-gradually n
      (cond ((= n 7)
	     (let ((:self (arg 2)))
		  (funcall (get 'do-set-turtle-gradually 'object-401-expr)
			   (arg 1) (arg 3) (arg 4) (arg 5) (arg 6) (arg 7))))
	    (t (apply (get 'do-set-turtle-gradually 'object-401-expr) (listify n)))))))

;; "forget your ?variable". SOME 666 removes the methods that recall and set the
;; variable, which is where private variables (things-to-do-next, offspring, ...)
;; live; ordinary variables are in the actor's own list (internal-recall-your-
;; normal-variable) and stayed. So a plan never forgot its to-do-when-over, and
;; ACTION's "clean up since just finished" ran it again and again. As SOME 1005
;; (August 1979) does, the variable is also taken out of the actor's own list.
;;
;; The 1978 Guide also forgets by pattern: "If variable-pattern is a list containing
;; question marks then all those variables which match are forgotten" (AIM-482 p.
;; 17). SOME 666 has no such case, and Ani relies on it: a subscene saved for
;; Director first forgets (actions-of ?), (distance-between ? ?) and (time-estimates-
;; for ?) (SCENE's "send yourself to director via"), and a subscene asked to stretch
;; makes the next one forget the (location-of ?) and (distance-between ? ?) it told
;; it (SCENE's extend-last-actions-of).
(defun has-question-mark? (pattern)
  (cond ((symbolp pattern) (= (getcharn pattern 1) #(getcharn '? 1)))
	((atom pattern) nil)
	(t (or (has-question-mark? (car pattern)) (has-question-mark? (cdr pattern))))))

(let ((:replace-old-methods t))
     (define-method (forget your ?variable) something
      (help-comments:
       |forget I ever heard about VARIABLE, if it is "?" then I forget all my variables|)
      (cond ((eq variable '?) ;;clears all
	     (do ((i (ask :self list all your variable names) (rest i)))
		 ((null i))
		 (let ((variable-name (first i)))
		      (cond ((memq variable-name '(parent name))) ;;leave it alone
			    ((= (getcharn variable-name 1) #(getcharn '? 1)))
			    ((= (getcharn variable-name 1) #(getcharn '% 1)))
			    (t (ask :self forget your ,variable-name))))))
	    ((and (not (atom variable)) (has-question-mark? variable))
	     (mapc (function (lambda (variable-name)
				     (and (not (atom variable-name))
					  (match variable-name variable)
					  (ask :self forget your ,variable-name))))
		   (ask :self list all your variable names)))
	    (t (let ((own-variables (ask :self internal-recall-your-normal-variable)))
		    (let ((pair (assoc variable (cdr own-variables))))
			 (and pair (delq pair own-variables))))
	       (ask :self remove clause for recall your ,variable)
	       (ask :self remove clause for set your ,variable to anything)))
      no-value))

;; DRECT's collect-all-variable-names, which "list all your variable names" and a save
;; use, gives an actor's own variables newest first, after a NIL: SOME 666 heads the
;; actor's list of variables with NIL, and the car of NIL is NIL, so every saved
;; actor ended (SET YOUR NIL TO NIL). Ani's saves in Appendix VI list them oldest
;; first, the special dynamics in exactly the reverse of DRECT's order, and have no
;; NIL; so here.
(define-form (collect-all-variable-names actor (methods nil) (answer nil))
 (do ((i (or methods (methods-of actor)) (rest i)))
     ((null i)
      (append (nreverse answer)
	      (mapcar 'car (rest (ask :self internal-recall-your-normal-variable)))))
     (let ((method-name (first i)))
	  (cond ((atom method-name)
		 (let (((first second variable-name . rest)
			(method-pattern method-name)))
		      (cond ((and (eq first 'recall) (eq second 'your) (null rest))
			     (push variable-name answer)))))
		(t (return (collect-all-variable-names actor (rest method-name) answer)))))))

;; INTERF's quadrant-of-xy, given a symbolic position such as (symbolic-position
;; (good-distance-from (current-goal-of prince))), compares (third xy), NIL, and
;; (second xy), a list, with 0.0. Interpreted MacLisp would stop there, but Ani ran
;; INTERF compiled (INTERF FASL, 14 October 1978), and its compiled code (reports/
;; fasl/code) loads the word each pointer points at and tests its sign, checking no
;; types: NIL is location 0, which holds 0, so "lower"; a list's word holds its car's
;; address, and Ani's own atoms lie high in memory (user atoms are at 6xxxxx-7xxxxx
;; octal in the 1980 dump), so it reads as negative: "left". So a coordinate that
;; is not a number counts as not above, and not right of, the middle. Pass 2 meets
;; this in Kept Apart, when the stepmother stands guard and the Prince, still on
;; his way somewhere, is to move far from both.
(+after-load '|ken;interf >|
  '(defun quadrant-of-xy (xy-position)
     (cond ((eq (first xy-position) 'missing-location-of)
	    (shouldnt-happen 'quadrant-of-xy
			     '(,xy-position not a good position)))
	   (t (list (cond ((and (numberp (third xy-position)) (> (third xy-position) 0.0)) 'upper)
			  (t 'lower))
		    (cond ((and (numberp (second xy-position)) (> (second xy-position) 0.0)) 'right)
			  (t 'left)))))))

;; ANINIT (October 1978) films in color by giving the movie a form to evaluate after
;; each new frame is made: show the frame at 550 by 413 dots and click the camera
;; ("is saved on film instead"). MOVIE 153 (January 1979) has no such variable: each
;; new frame goes to a frame handler, which redisplays the screen and stores the
;; frame. So once MOVIE is loaded, the frame handler also evaluates the movie's
;; after-new-frame-made, with :self the movie, as the 1978 movie did. (MOVIE is still
;; loading then, with :insert-methods-at-end bound to T, which would put the new
;; method behind the old one.)
(defun run-after-new-frame-made-too ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (just made frame number ?frame-number for ?movie) frame-handler
	(ask-old :self just made frame number ,frame-number for ,movie)
	(let ((form (ask ,movie recall your after-new-frame-made)))
	     (and form (let ((:self movie)) (eval form)))))))

(+after-load '|ken;movie >| '(run-after-new-frame-made-too))

;; SCREEN's "silent running" and "normal running", which ANINIT's color filming sends
;; around each click. They are the first two methods of KEN;ODIREC 2 (22 November
;; 1978), before its demon methods, and are copied here unchanged; SCREEN 86 has
;; neither.
(defun define-silent-and-normal-running ()
  (let ((:insert-methods-at-end nil))
       (define-method (silent running) screen
	(help-comments: |do everything but dont let you see it until normal running is restored|)
	(ask :self set your mode to silent))
       (define-method (normal running) screen
	(help-comments: |restore normal running and redisplay the screen|)
	(ask :self set your mode to normal)
	(ask :self wipe))))

(+after-load '|ken;screen >| '(define-silent-and-normal-running))

;; MANY-POLYS. ANINIT's running-color, which set up the color filming, makes the
;; characters polys of this kind: "(ask director-character set your parent to
;; many-polys) ;;sorry about that", then "(ask cinderella set your offset to 20.0)
;; ;;since a star is denser" and "make your parts". POLY 29 (January 1979) keeps the
;; definition only in a comment, as the "old way of doing parts-whole": each part is
;; a copy of the poly OFFSET dots smaller than the last, down to nothing, drawn with
;; it, so on the color screen the shape looks filled. Defined here, as that comment
;; has it, once POLY is loaded.
(defun define-many-polys ()
  (let ((:insert-methods-at-end nil))
       (define many-polys poly
	(set your size to 100)
	(set your angle to 60)
	(set your offset to 10.0)
	(extend behavior when receiving (display) by doing
	 (let ((state (ask :self recall your state))
	       (parts (ask :self recall your parts)))
	      (ask :self display) ;;display myself
	      (ask-each ,parts do the following: (set your state to ,state) (display))))
	(do when receiving (make your parts)
	 (let ((offset (float (ask :self recall your offset)))
	       (size (ask :self recall your size)))
	      (do ((size (-$ (float size) offset) (-$ size offset))
		   (polys nil))
		  ((< size 0.0) (ask :self set your parts to ,polys))
		  (let ((poly (ask :self make copy ,(append-atoms :self '- (gen-number :self)))))
		       (ask ,poly set your parent to poly) ;;should be a normal poly
		       (push poly polys)
		       (ask ,poly set your size to ,size))))))))

(+after-load '|ken;poly >| '(define-many-polys))

;; ACTION's subtract-elapsed-from-estimated-time, for a subscene that has not begun,
;; subtracts NIL from a frame count. That happens to each parasite: when any subscene
;; ends, every subscene of the scene is told, and each tells its own parasites that
;; they have ended ("note that ?event happened" asks the receiver's parasites, not
;; those of the subscene that ended), so in Kept Apart the end of subscene 1 reaches
;; subscene 3 before it begins. Director ran ACTION compiled (ACTION FASL), whose
;; code subtracts the words the two pointers point at, checking no types (reports/
;; fasl/code: MOVE TT,@(P) then SUB TT,(A)); NIL is location 0, which holds 0. So a
;; subscene that has not begun counts as beginning at frame 0. (The error recorded
;; is overwritten when the subscene really ends.)
(defun subtract-elapsed-from-estimated-time-as-compiled (subscene movie)
  (let ((elapsed (//$ (float (- (number-as-compiled (ask ,movie recall your (end-of ,subscene)))
				(number-as-compiled (ask ,movie recall your (beginning-of ,subscene)))))
		      (float (ask ,movie recall your frames-per-second))))
	(estimated (ask ,subscene recall your running-time)))
       (cond (estimated (list (-$ elapsed estimated) 'out 'of elapsed 'seconds))
	     (t 'no-estimate-found-so-cant))))

;; What compiled fixnum arithmetic sees: NIL as 0. (Other non-numbers do not arise.)
(defun number-as-compiled (x)
  (cond ((numberp x) x)
	((null x) 0)
	(t (shouldnt-happen 'number-as-compiled (list x 'is 'not 'a 'number)))))

(+after-load '|ken;action >|
  '(putprop 'subtract-elapsed-from-estimated-time
	    (get 'subtract-elapsed-from-estimated-time-as-compiled 'expr)
	    'expr))

;; "make copy". The 1978 Guide: "The only differences between the new actor
;; -sibling- and the recipient are their names and that the newly created actor has
;; no offspring", and "if you change a twin its sibling is not affected" (AIM-482 p.
;; 9). SCENE relies on both: each subscene saves a copy of itself before planning
;; and is restored from it if it must stretch, and is saved for Director through a
;; copy it renames and prunes. SOME 666 copies :self, the actor in 1979 (a copy of
;; a name, displacing the new actor, ruins it), and replaces the name wherever it
;; occurs (EQ) in the copy; in 1979 that was only the name, but a 1978 :self also
;; ends up in the actor's variables, (placed by ,:self) in a location and
;; (special-dynamics-of cinderella in ,subscene) in an action, which a save then
;; wrote with (director-subscene-of kept-apart 3) in them. So the copy is the
;; actor's, made by COPY (which gives it methods and variables of its own), and only
;; its name and offspring are changed.
(let ((:replace-old-methods t))
     (define-method (make copy ?sibling) something
      (help-comments: |make an identical copy of myself except for its name and offspring|)
      (ask :self ask your parent to make ,sibling) ;;makes one for parent's sake
      (displace (actor-of sibling) (copy (actor-object :self)))
      (ask ,sibling set your name to ,sibling)
      (ask ,sibling forget your offspring)
      sibling))

;; SOME 666's is-any-ancestor-of, comparing actors whether given as names or not,
;; so (ask x are you a x) is true again.
(defun is-any-ancestor-of (actor other)
  (cond ((null actor) nil)
	((eq (actor-object actor) (actor-object other)) actor)
	(actor (is-any-ancestor-of (parent-of actor t) other))))

;;; -------------------------------------------------------------- 2. variable demons

;; The 1978 Guide ("Demons for Variables", AIM-482 pp. 18-19): a variable's demons
;; are kept in a variable named by it and actions-if-recalling or actions-if-
;; changing, and "such variables can be created, modified and inspected using the
;; normal variable messages". When the variable is recalled, each demon is evaluated
;; with :old-value bound to the variable's value, and the last one's value is the
;; answer. When it is set or changed, the demons are evaluated with :new-value bound
;; to the new value.
;;
;; Ken's own bridge, KEN;ODIREC 2 (22 November 1978, ";;;now for stuff to make the
;; new scheme compatible with old demon scheme"), made each demon an extension of
;; the recall or set method instead. That runs Ani's demons as they ran, and this
;; file used it at first, but the demons are then methods, not variables: forgetting
;; one (ACTION's wait lists forget theirs when they empty) leaves it, and a save runs
;; it and drops it, since DRECT's definize-actor saves the value of each variable an
;; actor has a recall method for. Ani counts on a saved demon reaching Director:
;; DISPLY's move-character-in-place-guarded gives a character kept away from a guard
;; a demon that sets its speed when the film first asks for it, from where the
;; character is then ("set speed so that it takes" the Prince the subscene's running
;; time "to go to" a place far from both; INTERF measures the distance "in director",
;; with no subscene). In Ani, where that place is still symbolic, it cannot run. So
;; the demons are kept as the Guide says, and SOME 666's general recall and set run
;; them.
;;
;; ODIREC 2 shows how the old scheme finished a set: the variable is set, the demons
;; run, and it is set to the last one's value unless that is no-value ("set it just
;; to be compatible with old"). Ani's demons are written for that: ACTION's wait
;; list demon answers :new-value, "otherwise dont change the wait-list", and DICHAR's
;; special-dynamics demon answers :new-value too.

;; Only the variables that have had demons look for them. A symbol keeps the kinds on
;; its property list; a list such as (speed factor) is kept in *variables-with-demons*.
(setq *variables-with-demons* nil)

(defun note-variable-demons (variable kind)
  (cond ((symbolp variable)
	 (or (memq kind (get variable 'demon-kinds))
	     (putprop variable (cons kind (get variable 'demon-kinds)) 'demon-kinds)))
	(t (let ((entry (assoc variable *variables-with-demons*)))
		(cond ((null entry)
		       (setq *variables-with-demons*
			     (cons (list variable kind) *variables-with-demons*)))
		      ((not (memq kind (rest entry)))
		       (rplacd entry (cons kind (rest entry)))))))))

(defun may-have-demons? (variable kind)
  (cond ((symbolp variable) (memq kind (get variable 'demon-kinds)))
	((atom variable) nil)
	(t (memq kind (rest (assoc variable *variables-with-demons*))))))

;; Each demon is evaluated in turn; the last one's value is the answer.
(defun evaluate-demons (demons)
  (do ((d demons (rest d))
       (result nil (eval (first d))))
      ((null d) result)))

(defun run-recalling-demons (variable :old-value)
  (let ((demons (ask :self recall your (,variable actions-if-recalling))))
       (cond (demons (evaluate-demons demons))
	     (t :old-value))))

(defun run-changing-demons (variable :new-value)
  (let ((demons (ask :self recall your (,variable actions-if-changing))))
       (cond ((null demons) :new-value)
	     (t (let ((result (evaluate-demons demons)))
		     (cond ((eq result no-value) :new-value)
			   (t (set-variable-of-self variable result)
			      result)))))))

;; SOME 666's "set your ?variable to ?value", without its demons.
(defun set-variable-of-self (variable value)
  (let ((non-inheritable (member variable (ask :self recall your private-variable-names))))
       (cond (non-inheritable
	      (let ((:replace-old-methods t) ;;try to reuse old guys otherwise
		    (:insert-methods-at-end nil)) ;;be sure they go up front
		   (let ((recall-method-name
			  (ask :self do only for yourself when receiving
			       (recall your ,variable)
			       ;;dont need internal-recall-your
			       (director-symbol-for-value ,value))))
			(ask :self do only for yourself when receiving
			     (set your ,variable to ?the-new-value)
			     (set-director-symbol-for-value ,recall-method-name
							    the-new-value)))))
	     (t (maintain-value-assoc-list (ask :self internal-recall-your-normal-variable)
					   variable
					   value)))))

;; SOME 666's general set and recall, running the demons.
(let ((:replace-old-methods t))
     (define-method (set your ?variable to ?value) something
      (help-comments: |when asked "recall your" VARIABLE return VALUE|)
      (set-variable-of-self variable value)
      (and (not (atom variable))
	   (memq (second variable) '(actions-if-recalling actions-if-changing))
	   (null (rest (rest variable)))
	   (note-variable-demons (first variable) (second variable)))
      (cond ((may-have-demons? variable 'actions-if-changing)
	     (run-changing-demons variable value))
	    (t value)))
     (define-method (recall your ?variable) something
      (help-comments: |recall the value of my VARIABLE|)
      (let ((value (do ((actor :self (parent-of actor t)))
		       ((null actor) nil) ;;nil is default value for no value found
		       (let ((pair (assoc variable (ask ,actor internal-recall-your-normal-variable))))
			    (and pair (return (rest pair)))))))
	   (cond ((may-have-demons? variable 'actions-if-recalling)
		  (run-recalling-demons variable value))
		 (t value)))))

;;; -------------------------------------------------------------- 3. database demons

;; The 1978 Guide ("Demons and Virtual Items"): the variable (first-element
;; if-recalling-items) holds (if-asked-about pattern form) entries, and (first-element
;; actions-if-memorizing) holds (if-told-about pattern form...) entries, where
;; first-element is the first element of the items concerned. Ani uses both: every
;; character memorizing that it is beautiful also memorizes that it moves
;; gracefully (CHAR), and CHAR, CONVEY, CSUMRY, PREREQ and SUGEST make virtual
;; items. In 1978 KEN1;MEMORY did this (REMEMBER, FIRE-DEMONS-THAT-MATCH,
;; POSSIBLE-VIRTUAL-ITEM, ...); it is lost, and SOME 666's database has no demons.
;;
;; The entries stay ordinary variables, as the Guide says ("Such variables can be
;; created, modified and inspected using the normal variable messages"). What
;; follows is our reading of the Guide:
;;  - if-told-about: after an item is memorized, each entry whose pattern matches
;;    it runs, with the pattern's variables bound. Storing first is what lets the
;;    Guide's pair of demons (left-of and right-of, each memorizing the other
;;    unless it is already known) stop.
;;  - if-asked-about: the entry's pattern is matched against the request (the
;;    pattern given to "recall an item matching" and the messages built on it), so
;;    its variables take the request's values, as in PREREQ's (status-of (faster ?a
;;    ?b) ?). The form then builds an item, which is used only if it matches the
;;    request ("Only items constructed that match the original request are used").
;;    Virtual items come after the real ones of the receiver and its ancestors.

;; SOME 666's memorize, with the demons fired after each item is stored, by the
;; general method and by the per-actor method it installs after the first item.
(let ((:replace-old-methods t))
     (define-method (memorize ?item) something
      (help-comments: |memorize the ITEM provided|)
      (let ((:insert-methods-at-end nil)) ;;so these go up front
	   (let ((collect-method-name
		  (ask :self do only for yourself ;;will go up the tree myself
		       when receiving (collect items)
		       (director-symbol-for-value (,item)))))
		(ask :self do only for yourself when receiving (forget item ?item)
		     (replace-second ,collect-method-name
				     (delete item (second ,collect-method-name)))
		     nil)
		(ask :self do only for yourself when receiving (memorize ?item)
		     (replace-second ,collect-method-name
				     (cons-if-not-member item (second ,collect-method-name)))
		     (fire-memorizing-demons item)
		     no-value)))
      (fire-memorizing-demons item)
      no-value))

(defun fire-memorizing-demons (item)
  (and (not (atom item))
       (mapc (function (lambda (demon)
			       (and (not (atom demon)) (eq (car demon) 'if-told-about)
				    (run-demon (cadr demon) item (cddr demon)))))
	     (ask :self recall your (,(car item) actions-if-memorizing))))
  no-value)

;; Evaluate forms with the variables of pattern bound as matching x binds them;
;; (list value) if it matched, else NIL.
(defun run-demon (pattern x forms)
  (let ((bindings (match-bindings pattern x)))
       (and bindings
	    (list (progv (mapcar 'car (cdr bindings))
			 (mapcar 'cdr (cdr bindings))
			 (do ((f forms (cdr f)) (value nil (eval (car f))))
			     ((null f) value)))))))

;; The items the receiver's if-asked-about entries make for a request.
(defun virtual-items (actor request)
  (let ((request (request-of-pattern request)))
       (cond ((or (atom request) (not (symbolp (car request))) (pattern-variable? (car request)))
	      nil)
	     (t (mapcan (function (lambda (demon)
					  (and (not (atom demon)) (eq (car demon) 'if-asked-about)
					       (run-demon (cadr demon) request (cddr demon)))))
			(ask ,actor recall your (,(car request) if-recalling-items)))))))

;; "collect items memorized matching p" asks for {and ?the-item p}.
(defun request-of-pattern (p)
  (cond ((and (not (atom p)) (eq (car p) 'director-symbol-for-and-pattern))
	 (do ((parts (cdr p) (cdr parts)))
	     ((null parts) nil)
	     (and (not (atom (car parts))) (return (request-of-pattern (car parts))))))
	(t p)))

;; SOME 666 remembers each "recall an item matching" request as a method of the
;; receiver whose pattern is the request itself, then sends the request again for
;; that method to answer. A request with a {predicate} in its pattern does not match
;; itself (COMPAR's check-the-descriptors asks for {memq ?other-descriptor ...}), so
;; it is remembered again and again without end. SOME 666's "recall each item
;; matching" avoids this by quoting the request, (director-symbol-for-quoted-pattern
;; ...), so that it matches only itself; "recall an item matching" does the same here.
;; (By August 1979, SOME 1005, both had become macro methods that remember nothing.)
(let ((:replace-old-methods t))
     (define-method {and ?the-whole-message (recall an item matching ?pattern then ?action)}
		    something
      (let ((new-actor (ask :self make)))
	   (let ((database-method-name (ask ,new-actor do when receiving ,pattern ,action)))
		(ask :self do when receiving (director-symbol-for-quoted-pattern ,the-whole-message)
		     (keep-sending-items-til-match (quote ,database-method-name) :self))
		(ask :self !,the-whole-message)))))

;; SOME 666's two database searches, each followed by the virtual items. The
;; request is the database method's pattern, with its ?variables made anonymous.
(defun keep-sending-items-til-match (database-method-name actor)
  (let ((method-predicate (method-pattern-predicate database-method-name)))
       (do ((a actor (parent-of a)))
	   ((null a)
	    (do ((i (virtual-items actor (method-pattern database-method-name)) (rest i)))
		((null i) nothing-found)
		(cond ((funcall method-predicate (first i))
		       (let ((:message (first i)))
			    (return (run-method database-method-name)))))))
	   (let ((result
		  (do ((i (ask ,a collect items) (rest i)))
		      ((null i) 'director-symbol-for-nothing-found)
		      (cond ((funcall method-predicate (first i))
			     (let ((:message (first i)))
				  (return (run-method database-method-name))))))))
		(cond ((eq result 'director-symbol-for-nothing-found)) ;;keep trying
		      (t (return result)))))))

(defun keep-sending-items-collecting-all (database-method-name actor)
  (do ((a actor (parent-of a))
       (method-predicate (method-pattern-predicate database-method-name))
       (results nil))
      ((null a)
       (do ((i (virtual-items actor (method-pattern database-method-name)) (rest i)))
	   ((null i) (nreverse results))
	   (cond ((funcall method-predicate (first i))
		  (let ((:message (first i)))
		       (push (run-method database-method-name) results))))))
      (do ((i (ask ,a collect items) (rest i)))
	  ((null i))
	  (cond ((funcall method-predicate (first i))
		 (let ((:message (first i)))
		      (push (run-method database-method-name) results)))))))

;;; -------------------------------------------------------------- 4. INTERSECT

;; (intersect a b): the members of a that b also has, in b's order. The 1980
;; INTERSECT (TS D2500) keeps a's order, but CP 29 shows 1978's. The postponer
;; (POSTPO) takes (first (intersect choices unmade-but-needed-choice-points)), the
;; choice most recently found to be needed. With b's order, Ani works through the
;; prince's and the fairy godmother's dynamics from speed to path jaggedness, as
;; CP 29's relative choice points (named after whoever first needed them, and
;; listed newest first) record; with a's order, the other way round. The members
;; are a's own, since CHOCHO removes the chosen one from the choices with DELQ.
(defun intersect n
  (repeatedly-apply-binary-function 'intersect-two (listify n)))

(defun intersect-two (a b)
  (do ((l b (cdr l))
       (result nil))
      ((null l) (nreverse result))
      (let ((in-a (member (car l) a)))
	   (and in-a (not (memq (car in-a) result))
		(setq result (cons (car in-a) result))))))

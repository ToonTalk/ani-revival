;;; -*-lisp-*-
;;; REVIVE;TEACH: the helpers a learner's own knowledge uses ("Teach Ani").
;;;
;;; This file is ours, not Ken's. Ken's 1977 paper planned a system whose knowledge
;;; would be "as modular and simply represented as possible", so that "the child, with
;;; the help of the system, will be able to define new characters for the stories,
;;; change the system's vocabulary, add a reasonable default course of action and so
;;; on" ("Three Interactions between AI and Education", Machine Intelligence 8, p. 428);
;;; and of Ani, "a student of animation could learn much by observing the effects of
;;; altering Ani's knowledge and rules" (AI-TR-540 pp. 149-150, L3953-3973). TEACH
;;; (src/pipeline.js, EXTENSIONS; reports/chapter-x/design-teaching.md;
;;; reports/ext/teach/README.md) loads what a learner taught Ani on the film page: a
;;; notebook of pieces, each with the learner's reason, which src/teach.js writes as a
;;; Lisp file in Ken's notation, YOURS;N1 KNOW (N2 and so on for more notebooks), the
;;; same forms Ken's DSCRP, RELATE, CONVEY and EMOTE use and REVIVE;KNOW's files use.
;;; Each such file is loaded after the extensions (src/pipeline.js boot), and each of its
;;; pieces is read in after the Ken file it extends has loaded, once, as KNOW's are.
;;;
;;; TEACH is loaded only into the jobs of a film made with a learner's knowledge, and
;;; never otherwise; the switch never turns it on. Loaded with no notebook, or an empty
;;; one, it changes nothing (node tools/check-1978.mjs --extensions teach): the wrapper
;;; below passes straight through when no way of showing was added.
;;;
;;; Like KNOW, a learner's knowledge only adds: a word, a link, a suggestion, a way of
;;; showing, a feeling, a verb. It never removes or weakens one of Ken's (his footnote on
;;; cheating, AI-TR-540 p. 189, L4952-4954), and src/teach.js never writes a define of a
;;; word Ani already knows, which would replace it.

;;; ------------------------------------------------- loading a notebook

;; A notebook's file, YOURS;N1 KNOW, as src/pipeline.js boot writes it. Its pieces wait,
;; each in an +after-load of the Ken file it extends (as KNOW's do), so loading it only
;; arranges for them.
(defun load-your-knowledge (file)
  (load file))

;;; ------------------------------------------------- another way of showing a verb

;; (also-show helps (helper helped)
;;	      (goes-to-and-accompanys helper helped (good-distance-from (vicinity-of helper)))
;;	      medium)
;; One more way of showing a verb, beside Ken's and the revival's, never in place of
;; them. The roles name the verb's two characters, and the display method uses them; a
;; task (convey (helps cinderella prince)) gets the method with cinderella for helper and
;; prince for helped. Kept in :your-ways, (verb roles method strength), and added by the
;; wrapper on SUGCON's gather-convey-suggestions below.
(or (boundp ':your-ways) (setq :your-ways nil))

(defun also-show fexpr (args)
  (or (member args :your-ways)
      (setq :your-ways (append :your-ways (list args))))
  (first args))

;; The suggestions of the learner's ways for a task (verb a b), as CONVEY's receivers
;; make theirs (convey.64:102-111): element (convey task), a display method, the way's
;; strength, and the source (yours verb), which tells the glass box they are the
;; learner's.
(defun your-ways-for (task)
  (mapcan (function
	   (lambda (way)
		   (let (((verb roles form strength) way))
			(and (eq verb (first task))
			     (= (length roles) (length (rest task)))
			     (list (list 'suggestion: 'element (list 'convey task)
					 'value (list 'method: 'type 'display
						      'value (sublis (mapcar (function cons)
									     roles
									     (rest task))
								     form))
					 'strength strength
					 'source (list 'yours verb)))))))
	  :your-ways))

;; SUGCON asks every verb for its ways of showing in one place, gather-convey-suggestions
;; (sugcon.26:57-58). A second define-receiver for a verb would stand in front of Ken's
;; and hide it; this wrapper only adds the learner's after whatever Ken's (and KNOW's)
;; receivers give, and CHOMET chooses among them all with its own scores, so a
;; learner's way can lose. With no ways it passes straight through.
(defun gather-convey-suggestions-with-yours (task)
  (let ((theirs (funcall (revival-wrapped 'gather-convey-suggestions 'teach) task)))
       (cond (:your-ways (append theirs (your-ways-for task)))
	     (t theirs))))

(+after-load '|ken;sugcon >|
  '(revival-wrap 'gather-convey-suggestions 'teach 'gather-convey-suggestions-with-yours))

;;; ------------------------------------------------- feelings

;; A learner's feeling is written as KNOW's are (REVIVE;KNOWEM), after Ken's joy
;; (emote.9:11-72), with KNOWEM's two helpers: whether a level is one a feeling takes,
;; (positive low) or low, say, and how strongly it is felt. Without KNOW, these are
;; TEACH's copies of them, under the same names; with KNOW (loaded first, in the
;; registry's order), KNOWEM's own.
(defun teach-a-felt-level? (level)
  (cond ((atom level) (memq level '(low medium high)))
	(t (and (eq (first level) 'positive)
		(memq (second level) '(low medium high))))))

(defun teach-felt-level (level)
  (cond ((atom level) level)
	(t (second level))))

(or (get 'a-felt-level? 'expr) (putprop 'a-felt-level? (get 'teach-a-felt-level? 'expr) 'expr))
(or (get 'felt-level 'expr) (putprop 'felt-level (get 'teach-felt-level 'expr) 'expr))

;;; ------------------------------------------------- Ani's checks

;; The trial job's questions (src/pipeline.js checkKnowledge), one for each word, verb,
;; way and feeling a notebook teaches or adds to, each answered as Ani knows it once
;; the Ken files it extends have loaded:
;;   (word w)          (word w exists e parent p type ty neighbors (...) opposites (...)
;;                      suggestions (...) shows (...))
;;   (relationship w)  as a word's, its shows the ways of establishing (w a b)
;;   (verb v)          (verb v exists e parent p shows (...)): what CONVEY suggests for a
;;                     task (convey (v a b)), through every receiver and the learner's ways
;;   (feeling f)       (feeling f exists e shows (...)): its changes for
;;                     (emotional-state a (f (positive medium)))
;; e is t if the actor exists (exists?, which ask-if-exists asks), the lists nil if not.
(defun check-your-knowledge (questions)
  (mapcar (function check-a-piece-of-your-knowledge) questions))

(defun check-a-piece-of-your-knowledge (question)
  (let (((what name) question))
       (let ((there (and (exists? name) t)))
	    (cond ((null there) (list what name 'exists nil))
		  ((memq what '(word relationship))
		   (list what name 'exists t
			 'parent (ask ,name recall your parent)
			 'type (ask ,name recall your type)
			 'neighbors (ask ,name recall your neighbors)
			 'opposites (ask ,name recall your opposites)
			 'suggestions (ask ,name collect items memorized matching
					   (suggestion: element ? value ? strength ? source ?))
			 'shows (cond ((eq what 'word)
				       (ask ,name collect items memorized matching
					    (suggestion: element (establish your-a ,name)
							 value ? strength ? source ?)))
				      (t (ask ,name collect items memorized matching
					      (suggestion: element (establish (,name your-a your-b))
							   value ? strength ? source ?))))
			 'relative (and (eq what 'relationship)
					(mapcan (function
						 (lambda (element)
							 (ask ,name collect items memorized matching
							      (suggestion: element (,element your-a your-b)
									   value ? strength ? source ?))))
						'(relative-speed relative-acceleration relative-activity-level
						  relative-rhythmic-level relative-deliberateness
						  relative-path-length relative-path-curvature
						  relative-path-jaggedness)))))
		  ((eq what 'verb)
		   (list what name 'exists t
			 'parent (ask ,name recall your parent)
			 'shows (gather-convey-suggestions (list name 'your-a 'your-b))))
		  ((eq what 'feeling)
		   (list what name 'exists t
			 'parent (ask ,name recall your parent)
			 'shows (ask ,name collect items memorized matching
				     (suggestion: element (establish (emotional-state your-a (,name (positive medium))))
						  value ? strength ? source ?))))
		  (t (list what name 'exists there))))))

;;; -*-lisp-*-
;;; YOURS;N1 KNOW: "Every kind of piece", knowledge taught to Ani on the film page (Teach Ani).
;;; Written from the notebook's pieces by src/teach.js notebookToLisp, in Ken's own
;;; notation: words as his DSCRP writes them, relationships as RELATE, verbs as CONVEY,
;;; feelings as EMOTE. Each ";;yours" line is the learner's own reason for the piece
;;; under it. REVIVE;TEACH loads this file; nothing in it removes or weakens Ken's
;;; knowledge, and nothing in it is loaded unless a film is made with it.

;;; Your words for characters, and what words suggest, written as Ken's DSCRP writes
;;; his (dscrp.17:49-295). This function holds them; the line after it waits until Ani
;;; has read Ken's words (DSCRP), then teaches yours, once.
;;; A look is sent through APPEAR's own teach-appearance (REVIVE;APSUG), with your
;;; reason as its evidence.
(defun teach-yours-n1-words ()
  (let ((:insert-methods-at-end nil))

;;yours k1: a grumpy character is a mean one
;;yours k2: a grumpy character drags its feet: it can't be bothered to hurry
;;yours k12: grumpy shoves
(define grumpy personality-character-descriptor
 (process suggestions
	  (for speed low strength medium)
	  (for (establish ?character grumpy)
	       '(method: type convey
			 value (bind ((other
				       (character-that-satisfies
					(enemy-of ,character nil))))
				     (pushes ,character `other)))
	       strength 'low)))

;;yours k3: a jealous character keeps a close watch, darting about
;;yours k4: a jealous character keeps a close watch, darting about
(define jealous personality-character-descriptor
 (process suggestions
	  (for path-jaggedness high strength low)))

;;yours k11: a shy character keeps its eyes down
(uncompiled-ask shy process suggestions
		(for path-curvature high strength low))

;;yours k5: “green is jealous”, a convention the thesis names (AI-TR-540 p. 161) | a bar and a / slash
(teach-appearance '((jealous color-hue green medium (yours n1 k5 |“green is jealous”, a convention the thesis names (AI-TR-540 p. 161) /| a bar and a // slash|))))

;;; The links, as Ken's are written at the end of DSCRP (dscrp.17:273-295). Ani
;;; spreads each to the neighbors' neighbors and the opposites' opposites (char.2:111-131).
(progn
;;yours k1: a grumpy character is a mean one
 (ask mean add grumpy to your list of neighbors))))

(+after-load '|ken;dscrp >| '(revival-once 'yours-n1-words 'teach-yours-n1-words))

;;; Your words for how one character is to another, written as Ken's RELATE writes his
;;; (relate.22:20-102). This function holds them; the line after it waits until Ani has
;;; read Ken's relationships (RELATE), then teaches yours, once.
(defun teach-yours-n1-relationships ()
  (let ((:insert-methods-at-end nil))

;;yours k6: one who is jealous of another follows it about
;;yours k7: one who is jealous of another follows it about, to keep an eye on it
;;yours k14: jealous ones hurry
(define is-jealous-of affection-relationship-descriptor
 (process suggestions
	  (for (establish (is-jealous-of ?character ?other-character))
	       '(method: type convey
			 value (follows ,character ,other-character))
	       strength 'medium)
	  (for (relative-speed ? ?)
	       'greater-than
	       strength 'low)))

;;yours k13: polite ones keep company
(uncompiled-ask is-polite-to process suggestions
		(for (establish (is-polite-to ?character ?other-character))
		       '(method: type convey
				 value (accompanys ,character ,other-character)
				 best-when ((not (dominates ,character ,other-character))))
		       strength 'low))))

(+after-load '|ken;relate >| '(revival-once 'yours-n1-relationships 'teach-yours-n1-relationships))

;;; Your verbs, written as Ken's CONVEY writes his (convey.64:60-125): each is a kind
;;; of one of Ani's verbs, as chasing is a kind of moving, (define chases moves)
;;; (convey.64:100), and takes its prerequisites. This function holds them; the line after
;;; it waits until Ani has read Ken's verbs (CONVEY), then teaches yours, once.
(defun teach-yours-n1-verbs ()
  (let ((:insert-methods-at-end nil))

;;yours k10: teasing is a kind of chasing
(define teases chases)
;;; shown as chases is shown: a task (convey (teases x y)) is conveyed as (chases x y)
(define-receiver (yield suggestions for {and ?task (convey (teases ?one ?other))}) teases
 '((suggestion: element ,task
		value (method: type convey
			       value (chases ,one ,other))
		strength high
		source teases)))))

(+after-load '|ken;convey >| '(revival-once 'yours-n1-verbs 'teach-yours-n1-verbs))

;;; Other ways of showing a verb. REVIVE;TEACH's also-show adds each beside Ken's ways
;;; (and the revival's), never in place of them, where SUGCON asks a verb for its ways
;;; (sugcon.26:57); Ani's CHOMET then chooses among them all, so yours can lose.
;;yours k8: you can help someone by staying with them
(also-show helps (helper helped)
	   (goes-to-and-accompanys helper helped (good-distance-from (vicinity-of helper)))
	   medium)

;;; Your feelings, written as Ken's joy is (emote.9:11-72) and the revival's are
;;; (REVIVE;KNOWEM): each changes how a character moves by as much as the feeling, at the
;;; feeling's speed. a-felt-level? and felt-level are KNOWEM's (or REVIVE;TEACH's copies):
;;; a feeling is felt at (positive low), medium or high, or plainly low, medium or high.
;;; This function holds them; the line after it waits until Ani has read Ken's feelings
;;; (EMOTE), then teaches yours, once.
(defun teach-yours-n1-feelings ()
  (let ((:insert-methods-at-end nil))

;;yours k9: a grumpy mood takes the bounce out of you
(define grumpiness emotion
 (process suggestions
	  (for (establish (emotional-state ?character (grumpiness {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character speed)
					amount (negative ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'medium)
	  (for (establish (emotional-state ?character (grumpiness {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change-to: element (,character path-length)
					   new-value short
					   speed ,(felt-level level)))
	       strength 'medium)))))

(+after-load '|ken;emote >| '(revival-once 'yours-n1-feelings 'teach-yours-n1-feelings))

;;; These lines tell Ani which of Ken's files each of your new words belongs with, so
;;; that Ani knows it exists before that file has loaded, and asking it loads the file.
(mapc (function (lambda (word) (putprop word '|KEN;DSCRP| 'actor-load))) '(grumpy jealous))
(mapc (function (lambda (word) (putprop word '|KEN;RELATE| 'actor-load))) '(is-jealous-of))
(mapc (function (lambda (word) (putprop word '|KEN;CONVEY| 'actor-load))) '(teases))
(mapc (function (lambda (word) (putprop word '|KEN;EMOTE| 'actor-load))) '(grumpiness))

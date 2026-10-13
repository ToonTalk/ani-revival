;;; -*-lisp-*-
;;; REVIVE;KNOWEM: feelings Ken could have added, written as EMOTE.
;;;
;;; This file is ours, not Ken's. It is part of KNOW (src/pipeline.js, EXTENSIONS;
;;; REVIVE;KNOW says what KNOW is and how each piece is judged). Ani knows one feeling,
;;; joy (emote.9:11-72), and passes over any other in silence (ask-if-exists,
;;; sugest.123:33-49): Ken's Kept Apart makes the stepmother "happy and proud" (AI-TR-540
;;; p. 65, L1863-1866; cindy.46:70-72), and her pride was never shown. Five feelings are
;;; defined here as joy is, once EMOTE has loaded: pride, anticipation and loneliness,
;;; which Ken's own scenes name (cindy.46:72, 121, 124; the last two in his pre-meeting
;;; scene, cindy.46:119-125, which is commented out and never ran), and fear and anger,
;;; the two the thesis's sources describe most plainly. Each, as joy, suggests changes in how the
;;; character moves, with change: (and change-to:), which DISPLY's change methods run
;;; (disply.311:1042-1132). Each is the revival's, with a ";;why:" line that
;;; tools/know-index.mjs reads for the glass box.
;;;
;;; A feeling's level is written as joy's: (pride (positive medium)). That is the one
;;; form to teach (the film page's prompt does), since Ken's joy takes only a signed level:
;;; (joy high) stops pass 2, joy's (second joy-level) being taken of an atom
;;; (emote.9:13-17). These feelings take a plain level too, as Ken wrote his pre-meeting
;;; scene, (anticipation high). A (negative ...) level suggests nothing: a negative pride
;;; is shame, not pride reversed, and is not here; the task gets a note that the feeling
;;; is not shown (below). Each change is as large as the feeling and made at the
;;; feeling's speed, as joy's are (emote.9:13-36).
;;;
;;; Two feelings at once, or a feeling with joy, may suggest changes to the same element
;;; of the same character. SUGEST has COSUG combine them (sugest.123:213-234), which
;;; REVIVE;MEND7 repairs (Ken's COSUG reads them in an older format, cosug.215:449-477).
;;; Changes with different signs conflict, and CHOMET makes neither: it takes only
;;; suggestions, "hopefully all conflicting ones are so noted for now rather than
;;; resolving them I'll reject" (chomet.123:463-472), a stopgap, where pass 1's
;;; heuristics would have picked the stronger (AI-TR-540 pp. 108-109). So pride does not
;;; change speed (Ken's decision 9, 13 October 2026, reports/chapter-x/PLAN.md,
;;; "Decisions"): with it, the stepmother's (and (joy (positive medium)) (pride (positive
;;; medium))) in Kept Apart (cindy.46:70-72) lost the speeding up her joy gave her in
;;; 1978. Pride keeps her paths smoother and her movements more deliberate.

;; Whether a feeling's level is one these feelings take: (positive low), say, or low.
(defun a-felt-level? (level)
  (cond ((atom level) (memq level '(low medium high)))
	(t (and (eq (first level) 'positive)
		(memq (second level) '(low medium high))))))

;; How strongly it is felt: low, medium or high.
(defun felt-level (level)
  (cond ((atom level) level)
	(t (second level))))

(defun teach-the-revivals-feelings ()
  (let ((:insert-methods-at-end nil))

;;why: a proud character carries itself with dignity: it moves smoothly and deliberately, as an animator would have a proud character strut; Ken's Kept Apart makes the stepmother proud (cindy.46:72). It doesn't change her speed (Ken's decision 9: a slower pride only cancelled her joy's speeding up, by CHOMET's stopgap for conflicts)
(define pride emotion
 (process suggestions
	  (for (establish (emotional-state ?character (pride {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character path-jaggedness)
					amount (negative ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'medium)
	  (for (establish (emotional-state ?character (pride {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character deliberateness)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'low)))

;;why: eager expectation is restless: a character looking forward to something does more, in a livelier rhythm, and fidgets; Ken's pre-meeting scene gives Cinderella (anticipation high) (cindy.46:121)
(define anticipation emotion
 (process suggestions
	  (for (establish (emotional-state ?character (anticipation {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character activity-level)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'high)
	  (for (establish (emotional-state ?character (anticipation {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character rhythmic-level)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'medium)
	  (for (establish (emotional-state ?character (anticipation {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character path-jaggedness)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'low)))

;;why: a lonely character drifts: it moves slowly, does little, and wanders the long way round, as Ken's sad joy lengthens paths (emote.9:61-66); Ken's pre-meeting scene makes the Prince lonely (cindy.46:123-124)
(define loneliness emotion
 (process suggestions
	  (for (establish (emotional-state ?character (loneliness {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character speed)
					amount (negative ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'medium)
	  (for (establish (emotional-state ?character (loneliness {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character activity-level)
					amount (negative ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'medium)
	  (for (establish (emotional-state ?character (loneliness {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change-to: element (,character path-length)
					   new-value long
					   speed low))
	       strength 'low)))

;;why: Michotte: "Sudden and repeated variations of direction, or even merely of speed, give the impression of "nervousness" or "agitation"" (AI-TR-540 p. 103, L2823-2825), and his viewers saw a rectangle that ran off as afraid (p. 158, L4157): a frightened character moves fast, starts and stops suddenly, and jags
(define fear emotion
 (process suggestions
	  (for (establish (emotional-state ?character (fear {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character speed)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'high)
	  (for (establish (emotional-state ?character (fear {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character acceleration)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'high)
	  (for (establish (emotional-state ?character (fear {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character path-jaggedness)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'medium)))

;;why: Michotte: "Rapid movement gives the impression of "violence"" (AI-TR-540 p. 103, L2821-2822): an angry character moves fast, with sudden starts, straight at what it is angry with
(define anger emotion
 (process suggestions
	  (for (establish (emotional-state ?character (anger {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character speed)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'high)
	  (for (establish (emotional-state ?character (anger {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character acceleration)
					amount (positive ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'high)
	  (for (establish (emotional-state ?character (anger {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character path-curvature)
					amount (negative ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'medium)))))

(+after-load '|ken;emote >| '(revival-once 'know-feelings 'teach-the-revivals-feelings))

;; Each is a top-level actor of EMOTE's once EMOTE has loaded, so the tags give it EMOTE
;; as its file, as load.33 fills them for Ken's: ask-if-exists (sugest.123:38) then
;; knows a feeling before EMOTE has loaded, in a story with no joy, and asking it loads
;; EMOTE, which defines it.
(mapc (function (lambda (feeling) (putprop feeling '|KEN;EMOTE| 'actor-load)))
      '(pride anticipation loneliness fear anger))

;;; ------------------------------------------------- a feeling not shown

;; A feeling of these five with a level they don't take, a (negative ...) one, say,
;; suggests nothing, as Ken's SUGEST passes over a feeling it doesn't know
;; (ask-if-exists, sugest.123:33-49); the task gets a note that says so, for the glass
;; box:
;;   (revival-repair: what feeling-not-shown was (pride (negative high)) now nothing
;;		       because (a level the feeling does not take))
;; establish-suggestions is given the task's package and the task, which an establish
;; task passes as its scene (scene.9:378-381).
(setq :know-feelings '(pride anticipation loneliness fear anger))

(defun establish-suggestions-noting-feelings-not-shown (task scene)
  (let ((result (funcall (revival-wrapped 'establish-suggestions 'knowem) task scene)))
       (note-feelings-not-shown (get task 'description) scene)
       result))

(defun note-feelings-not-shown (description scene)
  (and (not (atom description))
       (eq (first description) 'emotional-state)
       (mapc (function
	      (lambda (feeling)
		      (and (not (atom feeling))
			   (memq (first feeling) :know-feelings)
			   (not (a-felt-level? (second feeling)))
			   (revival-note scene 'feeling-not-shown feeling 'nothing
					 '(a level the feeling does not take)))))
	     (let ((states (third description)))
		  (cond ((and (not (atom states)) (eq (first states) 'and)) (rest states))
			(t (list states)))))))

(+after-load '|ken;sugest >|
  '(revival-wrap 'establish-suggestions 'knowem 'establish-suggestions-noting-feelings-not-shown))

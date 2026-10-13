;;; -*-lisp-*-
;;; REVIVE;KNOWEM: feelings Ken could have added, written as EMOTE.
;;;
;;; This file is ours, not Ken's. It is part of KNOW (src/pipeline.js, EXTENSIONS;
;;; REVIVE;KNOW says what KNOW is and how each piece is judged). Ani knows one feeling,
;;; joy (emote.9:11-72), and passes over any other in silence (ask-if-exists,
;;; sugest.123:33-49): Ken's Kept Apart makes the stepmother "happy and proud" (AI-TR-540
;;; p. 65, L1863-1866; cindy.46:70-72), and her pride was never shown. Five feelings are
;;; defined here as joy is, once EMOTE has loaded: pride, anticipation and loneliness,
;;; which Ken's own scenes name (cindy.46:72, 121, 124), and fear and anger, the two the
;;; thesis's sources describe most plainly. Each, as joy, suggests changes in how the
;;; character moves, with change: (and change-to:), which DISPLY's change methods run
;;; (disply.311:1042-1132). Each is the revival's, with a ";;why:" line that
;;; tools/know-index.mjs reads for the glass box.
;;;
;;; A feeling's level is written as joy's, (positive low) and so on, or, as Ken wrote
;;; his pre-meeting scene's (cindy.46:121-124), just low, medium or high: (anticipation
;;; high). A (negative ...) level suggests nothing: a negative pride is shame, not pride
;;; reversed, and is not here. Each change is as large as the feeling and made at the
;;; feeling's speed, as joy's are (emote.9:13-36).
;;;
;;; Two feelings at once, or a feeling with joy, may suggest changes to the same element
;;; of the same character. SUGEST has COSUG combine them (sugest.123:213-234), which
;;; REVIVE;MEND7 repairs (Ken's COSUG reads them in an older format, cosug.215:449-477);
;;; changes with different signs conflict, and CHOMET takes only suggestions, so neither
;;; is made (chomet.123:463-472). The stepmother's (and (joy (positive medium)) (pride
;;; (positive medium))) in Kept Apart is so: joy speeds her and pride slows her, and she
;;; keeps the speed she had; pride's smoother path is made (reports/ext/know/README.md).

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

;;why: a proud character carries itself with dignity: it moves slowly, smoothly and deliberately, as an animator would have a proud character strut; Ken's Kept Apart makes the stepmother proud (cindy.46:72)
(define pride emotion
 (process suggestions
	  (for (establish (emotional-state ?character (pride {a-felt-level? ?level})))
	       '(method: type display-value-change
			 value (change: element (,character speed)
					amount (negative ,(felt-level level))
					speed ,(felt-level level)))
	       strength 'medium)
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

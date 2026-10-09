;;; -*-lisp-*-
;;; REVIVE;MEND8: M8, two characters with nothing to compare.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; M8 is not one of the plan's M1-M7. The plan expected a character with no
;;; descriptors to be given up on (none), which M2 reads as medium; running it
;;; (test/stories/stress/no-descriptors.lisp) showed that pass 1 stops earlier, here.
;;;
;;; The repair. When two characters have nothing to compare, pass 1 goes on with an
;;; empty comparison of them, as it goes on with one whose findings are too slight to
;;; summarize, and notes it on the comparison.
;;;
;;; Where it stops. Ani compares each character with its siblings when she first
;;; needs a relative value (find-relative-choice-points, choose.198:184-198):
;;; compare-two-characters looks for the same, opposite and neighboring descriptors,
;;; and words in their relationships both ways (compar.69:16-38), then summarizes
;;; (comparison-of a b) (compar.69:26). That actor is made only by the first finding
;;; recorded (record-comparison, compar.69:112-119), so for two characters with none,
;;; summarize-comparison stops: "shouldnt happen ... (comparison-of goat kid) does not
;;; exist" (sumcom.53:8-10). It happens whenever two characters share no descriptor,
;;; opposite or neighbor, and their relationships share no word either: a character
;;; with no descriptors (no-descriptors.lisp), or the stress stories' goat "shabby"
;;; instead of "beautiful" (test/stories/stress/README.md).
;;;
;;; Why an empty comparison. The thesis: Ani "finds out how often the characters have
;;; similar descriptors and how often they have opposite descriptors" (AI-TR-540
;;; L2574-2580), and for two with none, that is never. Ken's own summary of a comparison
;;; whose findings are slight records nothing: no summary of a type with no findings
;;; (sumcom.53:33-41), and none for a similarity under .1 (similarity-three-value,
;;; sumcom.53:85, 96-99). An empty comparison summarizes the same way, and then yields
;;; its relative choice points as any comparison does (elemnt.1:122-124), which is what
;;; find-relative-choice-points asks of it next (choose.198:191-194). It is made as
;;; record-comparison makes one (compar.69:118), so (comparison-of b a) names it too
;;; (elemnt.1:118-121), and the pair is not compared again. "If parts are missing Ani
;;; manages to go on rather than stop" (L2733-2737).
;;;
;;; The note, on the comparison:
;;;   (revival-repair: what nothing-to-compare was stopped now empty
;;;		       because (no same opposite or neighboring descriptors))
;;; Pass 1 hands its notes on with its choices (src/pipeline.js pass1's repairs).
;;; Cinderella's characters all share some word, so in her run this does nothing but
;;; ask whether each comparison exists.

;; Ken's summarize-comparison, with the comparison made first if nothing made it.
(defun summarize-comparison-even-of-nothing (comparison)
  (cond ((not (exists? comparison))
	 (ask character-comparison if new make ,comparison)
	 (revival-note comparison 'nothing-to-compare 'stopped 'empty
		       '(no same opposite or neighboring descriptors))))
  (funcall (revival-wrapped 'summarize-comparison 'mend8) comparison))

;; summarize-comparison is SUMCOM's (src/director/tags/ani.lisp: AUTOLOAD from
;; KEN;SUMCOM), so it is wrapped once SUMCOM has loaded.
(+after-load '|ken;sumcom >|
  '(revival-wrap 'summarize-comparison 'mend8 'summarize-comparison-even-of-nothing))

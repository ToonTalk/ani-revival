;;; -*-lisp-*-
;;; REVIVE;MEND17: M17, more than a few ways to convey what a task establishes.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The failure. An establish task that Ani does by conveying, a relationship shown by
;;; what the characters do, takes "a few" of the convey suggestions its words make
;;; (choose-a-few-convey-methods, chomet.123:474-513): a few is a third of one plus the
;;; film's complexity and obviousness and the scene's length, as numbers, two for most
;;; films. Ken's elimination methods take away those whose prerequisites or best-whens
;;; are not met, those suggested along with their opposites, those not related to the
;;; others, and all but the strongest of each source (eliminate-convey-suggestions,
;;; chomet.123:516-547). If more than a few are still left, it calls
;;; explore-method-suggestions, which Ken never wrote, and pass 2 stops: "undefined
;;; function". In Ken's Cinderella no relationship has more than two words with ways
;;; of showing. A model's Lion and the Mouse (reports/llm-trials/2026-10-11
;;; gpt-6.1-sol/) gets there with KNOW: the lion dominates, is generous towards and is
;;; protective to the mouse, three sources, once is-protective-to has its accompanying
;;; (your decision 10, REVIVE;KNOWRL).
;;;
;;; The repair. explore-method-suggestions keeps the strongest few, by Ken's own way of
;;; choosing among the suggestions of one source, "for now just using strength"
;;; (pick-strongest-related-suggestion, chomet.123:598-623): the strongest, then the
;;; strongest of the rest, the first of equals winning, until a few are kept. They are
;;; kept in the order they came, and the note, on the task, says which were left:
;;;   (revival-repair: what explored was ((pushes-around lion mouse) ...) now
;;;		       ((pushes-around lion mouse) ...) because (a few is 2))

(defun explore-method-suggestions (related-suggestions task elimination-methods-used
					       how-many-is-a-few)
  elimination-methods-used ;;Ken passes them; the strongest are kept whichever were used
  (let ((kept (strongest-few-related-suggestions related-suggestions how-many-is-a-few)))
       (revival-note task 'explored
		     (mapcar 'value-of-related-suggestion related-suggestions)
		     (mapcar 'value-of-related-suggestion kept)
		     (list 'a 'few 'is how-many-is-a-few))
       kept))

;; The how-many strongest of related-suggestions, in their order.
(defun strongest-few-related-suggestions (related-suggestions how-many)
  (do ((left related-suggestions)
       (chosen nil)
       (n how-many (1- n)))
      ((or (not (> n 0)) (null left))
       (mapcan (function (lambda (s) (and (memq s chosen) (list s)))) related-suggestions))
      (let ((strongest (pick-strongest-related-suggestion left)))
	   (setq chosen (cons strongest chosen))
	   (setq left (delq strongest (append left nil))))))

(defun value-of-related-suggestion (related-suggestion)
  (get (get (get related-suggestion 'main-suggestion) 'value) 'value))

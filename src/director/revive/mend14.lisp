;;; -*-lisp-*-
;;; REVIVE;MEND14: M14, a fence no one can make.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. When the way of showing Ani would choose for a task is one that DISPLY
;;; gives no way to run, makes-fence, it is set aside with Ken's reject-suggestion, the
;;; reason (no-run-receiver makes-fence), and a note on the task, and Ani chooses among
;;; the others as she would have had it never been suggested.
;;;
;;; Where it stops. To prevent X from meeting Y, CONVEY asks what would undo Y's being
;;; able to move to X, and can-move suggests three ways (prereq.19:82-107): the one who
;;; prevents it makes a fence between them, stands guard, or kills Y. DISPLY defines
;;; makes-fence as a display method, with two prerequisites, one of them "dummy too"
;;; (pen-down-for, prereq.19:64), and an estimate that "should really be lots smarter
;;; but ok for now" (disply.311:18-25); it never gives it a run receiver, as it gives
;;; stands-guard (disply.311:419-457). Ken's Cinderella has it suggested in Kept Apart,
;;; and stands-guard is chosen: "The 'stands guard' method was chosen over the 'makes
;;; fence' method because of a better time fit ... Besides having a better time fit
;;; the 'stands guard' method was more successful in determining that its
;;; prerequisites were met" (AI-TR-540, Kept Apart). In a new story makes-fence can
;;; score best, and when the subscene runs its methods (scene.9:159-183) Director has
;;; no way to run it: "(RUN MAKES-FENCE WOLF (BETWEEN (VICINITY-OF RED-RIDING-HOOD)
;;; (VICINITY-OF GRANDMOTHER)) IN (SUBSCENE-OF KEPT-APART 4) STRETCHED BY 1.0) is not
;;; understood", BAD-MESSAGE. Five of fifteen stories a model wrote on 11 October stop
;;; there (reports/llm-trials/2026-10-11 gpt-6.1-sol/).
;;;
;;; Why set it aside, and not make it. The thesis says what a fence is: the one who
;;; makes it "moves leaving behind her a trail that Cinderella is unable to cross"
;;; (AI-TR-540, Kept Apart). Nothing of DISPLY's or Director's leaves a trail: each frame
;;; is wiped and every character drawn afresh, the pen-down-for prerequisite that would
;;; have said so is a dummy, and no walk of DISPLY's is stopped by a line. Making one
;;; would be the revival's invention, not Ken's parts put together, as M5's move-to
;;; and M9's wander-around are. What Ken's code and the thesis do give is the choice
;;; among the three ways, the one his film makes: stands guard, which DISPLY runs.
;;; chases-off is the other of DISPLY's display methods with no run receiver
;;; (disply.311:617-627), but nothing suggests it.
;;;
;;; How. Ken's choose-a-display-method takes the best of the scores score-suggestions
;;; gives, weighing each by the film's levels (chomet.123:216-255). Once Ken's scores
;;; are made, the one it would take is found the same way; if that is makes-fence, it
;;; is rejected, and the rest are scored again, as score-suggestions would have scored
;;; them without it. Only then: a scene where makes-fence is suggested but not the
;;; best, as in Cinderella's Kept Apart, is scored once, as in 1978.
;;;
;;; The note, on the task:
;;;   (revival-repair: what never-runs was (makes-fence wolf (between ...))
;;;		       now rejected because (no-run-receiver in disply))
;;;
;;; And a guard with no one else to walk. stands-guard, chosen in makes-fence's place,
;;; keeps the prisoner from the place being guarded, and if that place is away from a
;;; third character who has nothing else to do, has that one walk across meanwhile
;;; (move-place-being-guarded-if-can, disply.311:519-531; the Prince in Kept Apart). It
;;; adds that walk to the subscene's movements whether there is one or not
;;; (disply.311:434-439), and when there is none (the place is away from the guard
;;; himself, as in (prevents villagers (meets shepherd-boy villagers)), or the third is
;;; busy) it adds nil. Director can't run nil: "(RUN NIL THEN REMOVE NIL FROM YOUR LIST
;;; OF ACTIONS-STILL-RUNNING-6) is not understood", BAD-MESSAGE, while filming. The
;;; nil is taken out of the movements once stands-guard has run (the stop-plan of no
;;; one that follows the guarding, (note that (end-of nil) happened), does nothing),
;;; and the subscene notes
;;;   (revival-repair: what nothing-to-run was nil now dropped
;;;		       because (no-one-else-walks (stands-guard villagers shepherd-boy ...)))
;;; In Ken's Cinderella the Prince walks across, so there is always someone.

;; Ken's score-suggestions (chomet.123:257-302), and then, if what Ani would choose
;; can't be run, that set aside and the rest scored again.
(defun score-suggestions-choosing-what-runs (suggestions task)
  (let ((scores (funcall (revival-wrapped 'score-suggestions 'mend14) suggestions task)))
       (let ((best (best-of-scores scores)))
	    (cond ((or (null best) (runs-in-director? (method-of-score best))) scores)
		  (t (let ((suggestion (get best 'suggestion))
			   (method (method-of-score best)))
			  (reject-suggestion task suggestion
					     (list 'no-run-receiver (first method)))
			  (revival-note task 'never-runs method 'rejected
					'(no-run-receiver in disply))
			  (score-suggestions-choosing-what-runs
			   (mapcan (function
				    (lambda (score)
					    (and (not (eq score best))
						 (list (get score 'suggestion)))))
				   scores)
			   task)))))))

;; The score choose-a-display-method would take: the first with the highest weighted
;; sum, if more than 0 (chomet.123:220-255).
(defun best-of-scores (scores)
  (do ((s scores (rest s))
       (best nil)
       (best-score -1))
      ((null s) (and (> best-score 0) best))
      (let ((score (weighted-score (first s))))
	   (cond ((> score best-score)
		  (setq best (first s))
		  (setq best-score score))))))

(defun weighted-score (score-package)
  (+ (* (get score-package 'strength) (numberify (film-level-of 'obviousness)))
     (* (get score-package 'prerequisite) (numberify (film-level-of 'coherence)))
     (* (get score-package 'best-when) (numberify (film-level-of 'coherence)))
     (* (get score-package 'time-fit) (numberify (film-level-of 'coherence)))
     (* (get score-package 'originality) (numberify (film-level-of 'originality)))
     (* (get score-package 'variety) (numberify (film-level-of 'variety)))))

(defun method-of-score (score-package)
  (get (get (get score-package 'suggestion) 'value) 'value))

;; DISPLY's display methods have run receivers, but for makes-fence and chases-off.
(defun runs-in-director? (method)
  (not (memq (first method) '(makes-fence chases-off))))

;; Ken's stands-guard, and then any nil it added to the subscene's movements taken out.
(defun extend-stands-guard-to-add-only-walks ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method
	(run stands-guard ?guard ?prisoner ?place in ?subscene stretched by ?factor)
	stands-guard
	(let ((answer (ask-old :self run stands-guard ,guard ,prisoner ,place
			       in ,subscene stretched by ,factor)))
	     (drop-nothing-to-run subscene (list 'stands-guard guard prisoner place))
	     answer))))

(defun drop-nothing-to-run (subscene method)
  (let ((movements (ask ,subscene recall your movements)))
       (cond ((memq nil movements)
	      (ask ,subscene set your movements to
		   ,(mapcan (function (lambda (m) (and m (list m)))) movements))
	      (revival-note subscene 'nothing-to-run nil 'dropped
			    (list 'no-one-else-walks method))))))

;; score-suggestions is CHOMET's, so it is wrapped once CHOMET has loaded. MEND5 and
;; MEND10 wrap it first, so this goes round theirs. stands-guard is DISPLY's, so it is
;; extended once DISPLY has loaded.
(+after-load '|ken;chomet >|
  '(revival-wrap 'score-suggestions 'mend14 'score-suggestions-choosing-what-runs))
(+after-load '|ken;disply >|
  '(revival-once 'mend14-stands-guard 'extend-stands-guard-to-add-only-walks))

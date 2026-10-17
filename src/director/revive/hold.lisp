;;; -*-lisp-*-
;;; REVIVE;HOLD: holding Ani's pass-1 choices while it chooses again.
;;;
;;; This file is ours, not Ken's. It was REVIVE;CHANGE's (stage 2, the fresh look: Ken's
;;; decision of 9 October, "Ani rederives only the changed character, with everyone
;;; else held as they were"), moved here unchanged so that REVIVE;CRITIC can share it
;;; without requiring CHANGE (reports/chapter-x/design-criticism.md, section 3; PLAN.md,
;;; "Criticism (CRITIC)"). CHANGE and CRITIC both list it (src/pipeline.js EXTENSIONS),
;;; before their own files. With nothing held, in every job but a fresh look's, Ken's
;;; record-choice does it all, so loading it changes nothing
;;; (node tools/check-1978.mjs --extensions change, and --extensions critic).
;;;
;;; What it has:
;;;  - answers-in-file: the choices an answers file (KEN;CP, a BECOME file) sets;
;;;  - same-choice-point?: a relative choice point under either of its names;
;;;  - hold-everyone-but (CHANGE's fresh look) and hold-all-but-choice-points (CRITIC's
;;;    criticism of a pass-1 choice, stage C6): what to hold;
;;;  - held-value-of and record-choice-holding-the-others: CHOOSE's record-choice
;;;    (choose.198:596-603) wrapped, so that a held choice is made as it was.
;;; hold-everyone-but reads the choices as they were with CHANGE's choices-as-they-were
;;; (the CP and the earlier scenes' BECOME files) and picks by CHANGE's
;;; choice-point-of-any?, so it is called only with CHANGE loaded.

;; The choices an answers file sets: each (define name parent ... (set your
;; current-choice to value) ...) gives (name value).
(defun answers-in-file (file-name)
  (let ((file (open file-name 'in))
	(end (list 'end-of-file)))
       (do ((form (read file end) (read file end))
	    (answers nil))
	   ((eq form end) (close file) (reverse answers))
	   (let ((value (current-choice-set-by form)))
		(and value (setq answers (cons (list (second form) (first value)) answers)))))))

(defun current-choice-set-by (form)
  (and (not (atom form))
       (eq (first form) 'define)
       (do ((s (rest (rest (rest form))) (rest s)))
	   ((null s) nil)
	   (and (not (atom (first s)))
		(eq (first (first s)) 'set)
		(eq (third (first s)) 'current-choice)
		(return (last (first s)))))))

(defun same-choice-point? (name1 name2)
  (or (equal name1 name2)
      (and (not (atom name1))
	   (eq (first name1) 'relative-choice-point-of)
	   (equal name2 (list (first name1) (reverse (second name1)) (third name1))))))

;; The choices held while Ani chooses again, and the choices as they were.
(or (boundp ':change-held) (setq :change-held nil))
(or (boundp ':change-as-they-were) (setq :change-as-they-were nil))
(or (boundp ':change-held-against) (setq :change-held-against nil))

(defun hold-everyone-but (characters answers-file)
  (setq :change-as-they-were (choices-as-they-were answers-file))
  (setq :change-held
	(mapcan (function
		 (lambda (choice)
			 (and (not (choice-point-of-any? (first choice) characters))
			      (list choice))))
		(append :change-as-they-were nil)))
  (setq :change-held-against nil))

;; Every choice of an answers file held but those of the choice points given (each
;; under either of its names): CRITIC's criticism of a pass-1 choice (stage C6), where
;; only the criticized choice point is chosen afresh. With none given, every choice is
;; held, and Ani's choices come out as the file has them.
(defun hold-all-but-choice-points (choice-points answers-file)
  (setq :change-as-they-were (answers-in-file answers-file))
  (setq :change-held
	(mapcan (function
		 (lambda (choice)
			 (and (not (do ((c choice-points (rest c)))
				       ((null c) nil)
				       (and (same-choice-point? (first choice) (first c))
					    (return t))))
			      (list choice))))
		(append :change-as-they-were nil)))
  (setq :change-held-against nil))

;; The value held for a choice point, as (value), or nil: a relative choice point held
;; under its other name has the value as that name reads it, as the relative choice
;; point answers yield current choice for (cpoint.87:106-114).
(defun held-value-of (choice-point)
  (do ((c :change-held (rest c)))
      ((null c) nil)
      (cond ((equal (first (first c)) choice-point) (return (rest (first c))))
	    ((same-choice-point? (first (first c)) choice-point)
	     (return (list (as-the-other-name-reads (second (first c)))))))))

(defun as-the-other-name-reads (value)
  (cond ((memq value '(same-as different-from)) value)
	(t (ask ,value recall your negative))))

;; CHOOSE's record-choice (choose.198:596-603), where every choice Ani makes is made:
;; while a fresh look holds the others, a choice of theirs that would come out
;; differently is made as it was, its winning suggestion saying so,
;;   (suggestion: element (prince deliberateness) value medium strength medium
;;		 source (held-as-it-was would-have-chosen high from ...))
;; and noted in :change-held-against for the glass box. The choice is counted as the
;; held value, as record-choice counts every choice (glosug.41:77-84 reads the counts).
;; With nothing held, in every other job, Ken's record-choice does it all.
(defun record-choice-holding-the-others (choice-point suggestion)
  (let ((held (and :change-held (held-value-of choice-point))))
       (cond ((or (null held) (equal (first held) (get suggestion 'value)))
	      (funcall (revival-wrapped 'record-choice 'hold) choice-point suggestion))
	     (t (setq :change-held-against
		      (cons (list choice-point (first held) (get suggestion 'value))
			    :change-held-against))
		(funcall (revival-wrapped 'record-choice 'hold)
			 choice-point
			 '(suggestion: element ,(get suggestion 'element)
				       value ,(first held)
				       strength ,(get suggestion 'strength)
				       source (held-as-it-was
					       would-have-chosen ,(get suggestion 'value)
					       from ,(get suggestion 'source))))))))

(+after-load '|ken;choose >|
  '(revival-wrap 'record-choice 'hold 'record-choice-holding-the-others))

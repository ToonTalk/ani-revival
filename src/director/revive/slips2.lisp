;;; -*-lisp-*-
;;; REVIVE;SLIPS2: S12, a high variety picks the least used value, and a low the most used.
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged). It changes nothing in Ken's Cinderella, whose
;;; level of variety is medium (cindy.46:157) (reports/ext/slips/README.md).
;;;
;;; The slip. The film's level of variety suggests a value for each choice by how often
;;; each value has been chosen:
;;;
;;; (define-function pick-value-with-variety (variety-level possible-values element-name)
;;; ;;this picks a value as follows
;;; ;;if variety level is high it picks the least chosen value or the first one if a tie
;;; ;;if variety level is low it picks the most chosen value or the first
;;; ;;if variety level is medium it picks the middle-most chosen one
;;;  (let ((count-value-pairs (count-of-each possible-values element-name)))
;;;       (cond ((eq variety-level 'high)
;;;	      (second (first (sortcar count-value-pairs '>))))
;;;	     ((eq variety-level 'low)
;;;	      (second (first (sortcar count-value-pairs '<))))	(glosug.41:61-70)
;;;
;;; sortcar with > puts the most chosen first, so high picks the most chosen value and
;;; low the least, the other way round from Ken's comment and from the thesis: "It
;;; weakly suggests that if the variety level is high pick the least used value for
;;; that element, if it is low pick the most used value, and if medium pick the median"
;;; (AI-TR-540 p. 85, L2384-2387), with its example, three characters already fast and
;;; medium, and a high variety suggesting low. The correction sorts the other way for
;;; high and low; medium is Ken's. A tie goes to the first, as the comment says
;;; (sortcar keeps the order of equals).
;;;
;;; GLOSUG's own (variety level) suggestion asks it (glosug.41:43-55), and so do the
;;; film's originality (glosug.41:106-122), REVIVE;MEND1 narrowing a (not X), and
;;; REVIVE;APPEAR's hues. Ken's Cinderella has medium variety, so nothing differs; a story
;;; with a high or low level of variety picks as the thesis says.
;;;
;;; The note, on the element's actor (speed, say), the first time a pick of it differs
;;; from Ken's:
;;;   (revival-repair: what variety-pick was (high medium) now low because (counts ...))
;;; was is the level and Ken's pick, now the pick, because the counts, as count-of-each
;;; gives them, ((count value) ...).

(defun pick-value-with-variety-as-the-thesis-says (variety-level possible-values element-name)
  (let ((kens (funcall (revival-wrapped 'pick-value-with-variety 'slips2)
		       variety-level possible-values element-name)))
       (cond ((or (not (slip-on? 's12)) (not (memq variety-level '(high low)))) kens)
	     (t (let ((counts (count-of-each possible-values element-name)))
		     (let ((picked (second (first (sortcar (append counts nil)
							   (cond ((eq variety-level 'high) '<)
								 (t '>)))))))
			  (and (not (equal picked kens))
			       element-name
			       (actor-of element-name dont-autoload)
			       (not (ask ,element-name recall if any items match
					 (revival-repair: what variety-pick %)))
			       (revival-note element-name 'variety-pick (list variety-level kens)
					     picked (list 'counts counts)))
			  picked))))))

;; GLOSUG's (src/director/tags/ani.lisp: AUTOLOAD from KEN;GLOSUG).
(+after-load '|ken;glosug >|
  '(revival-wrap 'pick-value-with-variety 'slips2 'pick-value-with-variety-as-the-thesis-says))

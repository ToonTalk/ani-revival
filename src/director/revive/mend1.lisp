;;; -*-lisp-*-
;;; REVIVE;MEND1: M1, (not X) is narrowed in pass 2, not pass 1.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. (not X) is a value of Ken's own (elemnt.1:24-26, 145-146; AI-TR-540
;;; L2658-2659), so pass 1 and the CP file it writes stay as his code makes them. In
;;; pass 2, an +after-load on KEN;CP narrows each movement element's (not X) to one of
;;; the two values left, with GLOSUG's pick-value-with-variety (glosug.41:61-74) and
;;; counts rebuilt from the CP, and notes it on the choice point. With medium variety
;;; this relies on middle-element, a KEN1 reconstruction (src/director/ken1/
;;; util.lisp), and the note says so.
;;;
;;; Why it is needed. COSUG answers (not X) when a relative suggestion leaves two of
;;; an element's three values (cosug.215:395-402), and record-choice keeps it
;;; (choose.198:596-603). Pass 2 hands the value on: a character's special dynamics
;;; take each movement element's most current value, which is the choice point's
;;; (char.2:63-68, scene.9:265-275), and every time estimate weighs it with INTERF's
;;; weightify (interf.149:845-847), which knows only low, short, medium, long and high
;;; (interf.149:899-904) and stops on anything else. faster's prerequisite compares
;;; two speed choices themselves (prereq.19:31-38). Director, which runs the program
;;; pass 2 writes, needs one of three values too. So the choice point itself is
;;; narrowed, and everything after reads the one value.
;;;
;;; How it picks. RUN loads the choices once per job, (director-load 'cp), before the
;;; scene asks for any of them (run.65:44-45). The film's variety level then picks
;;; between the two values left, as it picks among all three when it suggests a value
;;; in pass 1 (glosug.41:43-55; "if the variety level is high pick the least used value
;;; for that element, if it is low pick the most used value, and if medium pick the
;;; median", AI-TR-540 L2384-2387). pick-value-with-variety reads how often each value
;;; has been chosen for the element, the counts record-choice kept in pass 1
;;; (choose.198:600). Pass 2 is a new job and the CP file has no counts, so they are
;;; counted again from the CP's choices; a value narrowed here counts as chosen, as
;;; record-choice would have counted it. GLOSUG's function is used as Ken wrote it.
;;; For two values and medium variety it takes the middle-element of the two sorted
;;; with the most used first (glosug.41:71-72), the less used one; middle-element
;;; is rebuilt from its uses (src/director/ken1/util.lisp), not Ken's own code. (As
;;; written, high takes the first of that order, the most used, though its comment,
;;; glosug.41:63, and the thesis say the least used; low the least used. MEND does
;;; not change that.)
;;;
;;; Only in pass 2. The hook fires whenever KEN;CP loads. RUN loads it, once per job,
;;; and keeps that it has in :choice-points-loaded, which RUN sets when it loads
;;; (run.65:29, 44-45). A pass-1 job may load it too, as CHANGE's fresh look is to
;;; (reports/chapter-x/PLAN.md, item 3: load the story's CP, reset one character's
;;; choice points, and choose again), and there a (not X) is pass 1's own value, which
;;; later pass-1 reasoning reads as Ken's code made it. So the choices are narrowed
;;; only in RUN's job: only when :choice-points-loaded is bound.
;;;
;;; Only normal movement elements are narrowed: they are the ones the special
;;; dynamics carry (char.2:68). A (not X) of any other element, or of a value the
;;; element doesn't have, is left as it is; REVIVE;MEND2's guard on weightify reads
;;; whatever is left as medium.
;;;
;;; The note, on the choice point:
;;;   (revival-repair: what narrowed was (not high) now low
;;;		       because ((variety level) medium (counts (2 medium) (0 low))
;;;				(middle-element ken1 reconstruction)))
;;; the variety level, then the counts of the two values left as count-of-each gives
;;; them (glosug.41:77-84), and for medium variety the warning. Cinderella's CP 29 has
;;; no (not X), so in her run this does nothing but read each choice.

;; Narrow every (not X) of a movement element among the choice points pass 1 made.
(defun narrow-not-values-of-choice-points ()
  (let ((choice-points (cond ((actor-of 'absolute-choice-point dont-autoload)
			      ;;newest first, so reversed into the CP's order
			      (reverse (ask absolute-choice-point recall your offspring))))))
       (let ((to-narrow (mapcan (function
				 (lambda (choice-point)
					 (and (narrowable-not-value? choice-point)
					      (list choice-point))))
				choice-points)))
	    (mapc (function
		   (lambda (element-name)
			   (count-choices-again element-name choice-points)))
		  (elements-of-choice-points to-narrow))
	    (mapc 'narrow-not-value to-narrow))))

;; Is the choice point's value (not X), X one of a normal movement element's values?
;; The value is read first, so that a choice point with any other value is only read.
(defun narrowable-not-value? (choice-point)
  (let ((value (ask ,choice-point recall your current-choice)))
       (and (not (atom value))
	    (eq (first value) 'not)
	    (let ((element-name (ask ,choice-point recall your element-name)))
		 (and (ask ,element-name are you a normal-movement-element)
		      (member (second value) (ask ,element-name recall your possible-values)))))))

(defun elements-of-choice-points (choice-points)
  (do ((c choice-points (rest c))
       (elements nil))
      ((null c) (reverse elements))
      (let ((element-name (ask ,(first c) recall your element-name)))
	   (or (memq element-name elements)
	       (setq elements (cons element-name elements))))))

;; How often each of the element's values was chosen, counted from the choices as
;; record-choice counted them in pass 1 (choose.198:600), kept where count-of-each
;; reads them (glosug.41:81).
(defun count-choices-again (element-name choice-points)
  (mapc (function
	 (lambda (value)
		 (let ((count (do ((c choice-points (rest c))
				   (count 0))
				  ((null c) count)
				  (and (eq (ask ,(first c) recall your element-name) element-name)
				       (equal (ask ,(first c) recall your current-choice) value)
				       (setq count (1+ count))))))
		      (ask ,element-name set your (count-for ,value) to ,count))))
	(ask ,element-name recall your possible-values)))

;; The variety level picks one of the two values left, which becomes the choice. It
;; is asked for as pick-value-with-originality asks for it (glosug.41:113-114).
(defun narrow-not-value (choice-point)
  (let ((value (ask ,choice-point recall your current-choice))
	(element-name (ask ,choice-point recall your element-name))
	(variety-level (ask film ask your current-film to recall your (variety level))))
       (let ((values-left (set-minus (ask ,element-name recall your possible-values)
				     (rest value))))
	    (let ((counts (cons 'counts (count-of-each values-left element-name)))
		  (narrowed (pick-value-with-variety variety-level values-left element-name)))
		 (ask ,choice-point set your current-choice to ,narrowed)
		 (ask ,element-name increment your (count-for ,narrowed) by 1)
		 (revival-note choice-point 'narrowed value narrowed
			       (cond ((eq variety-level 'medium)
				      (list '(variety level) variety-level counts
					    '(middle-element ken1 reconstruction)))
				     (t (list '(variety level) variety-level counts))))))))

;; Only in pass 2, RUN's job (see above).
(+after-load '|ken;cp >|
  '(and (boundp ':choice-points-loaded) (narrow-not-values-of-choice-points)))

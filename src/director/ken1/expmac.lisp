;;; -*-lisp-*-
;;; KEN1;EXPMAC, reconstructed as no-ops.
;;;
;;; EXPMAC kept the expansions of Director's ask-type macros so the compiler could
;;; reuse them ("expansion:"), and removed them when the compiler was switched
;;; off. Interpreting, there are no expansions to keep.

(sstatus feature macro-expansion)

;; (KEN;LISP loads EXPMAC before MACROS, so setq-if-unbound isn't defined yet.)
(or (boundp ':ask-type-macros)
    (setq :ask-type-macros
	  '(ask uncompiled-ask ask-old ask-if-exists ask-if-understood ask-if-can
		uncompiled-ask-if-can ask-each ask-all)))

(defun remove-expansions (macro-name) nil)
(defun make-expansion n (arg 2))

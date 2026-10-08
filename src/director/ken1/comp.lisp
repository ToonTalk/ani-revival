;;; -*-lisp-*-
;;; KEN1;COMP, reconstructed in part.
;;;
;;; COMP compiled actors and movies into Lisp for the Lisp compiler. Interpreting,
;;; actors run as they are. What the surviving code still needs:
;;;   compile-and-print-actor, which DRECT's save-actor-on-file uses to save an
;;;   actor; here it prints the actor's definition (DRECT's definize-actor).
;;;   defunize, used by OBJECT; here it returns its argument.

(defun compile-and-print-actor n
  (let ((actor (arg 1)) (file (cond ((> n 1) (arg 2)))))
       (save-by-printing (definize-actor actor) file)))

(defun defunize n (arg 1))

(defun *compile-actors n nil)

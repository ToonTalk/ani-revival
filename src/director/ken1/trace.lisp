;;; -*-lisp-*-
;;; KEN1;TRACE, reconstructed in part.
;;;
;;; TRACE printed the messages an actor received and the answers it gave
;;; ((ask sally trace) in the Director Guide). Here tracing just records what is
;;; traced; the interpreter's own tracing does the rest.

(setq-if-unbound :actors-currently-traced nil)

(defun director-trace n
  (push (listify n) :actors-currently-traced)
  no-value)

(defun director-untrace n
  (setq :actors-currently-traced
	(delete (listify n) :actors-currently-traced))
  no-value)

(defun director-untrace-all n
  (setq :actors-currently-traced nil)
  no-value)

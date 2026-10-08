;;; -*-lisp-*-
;;; KEN1;PROP, reconstructed: property lists keyed by lists.
;;;
;;; Actors can have list names, such as (relationship-of step-mother cinderella).
;;; DRECT's general-putprop keeps them under the first word's property
;;; NON-ATOMIC-ACTORS, in a structure that place-property builds and changes in
;;; place, keyed by the rest of the name (here (step-mother cinderella)).
;;;
;;; The original is lost (TS D2500 has 20 of its 21 definitions compiled, to
;;; check against). This version keeps entries in the order they were added.
;;; VERIFY: the original's order, which ask-all's answers follow.

;; The structure: (director-property-list (key-list . value) ...)

(defun place-property (plists value keys)
  (cond ((null plists) (list 'director-property-list (cons keys value)))
	(t (let ((entry (assoc keys (cdr plists))))
		(cond (entry (rplacd entry value))
		      (t (nconc plists (list (cons keys value)))))
		plists))))

(defun get-property (plists keys)
  (cdr (assoc keys (cdr plists))))

;; (get-property-all plists pattern): the values of every entry whose key list
;; matches the pattern (? for any element).
(defun get-property-all (plists pattern)
  (mapcan (function (lambda (entry)
			    (and (match (car entry) pattern) (list (cdr entry)))))
	  (cdr plists)))

(defun remove-property (plists keys)
  (let ((entry (assoc keys (cdr plists))))
       (and entry (rplacd plists (delq entry (cdr plists))))
       plists))

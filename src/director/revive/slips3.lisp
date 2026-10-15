;;; -*-lisp-*-
;;; REVIVE;SLIPS3: S3, friendly's attractions are named as the elements are.
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged). It changes no choice of Ken's Cinderella, and her
;;; pass 1 still writes CP 29; it changes what three of her choice points hear
;;; (reports/ext/slips/README.md).
;;;
;;; The slip. friendly suggests how a friendly character is drawn to others:
;;;
;;;	  (for attraction-to-friends (positive high) strength high)
;;;	  (for attraction-to-strangers (positive medium) strength medium)
;;;	  (for attraction-to-enemies (positive low) strength low)	(dscrp.17:106-108)
;;;
;;; ELEMNT's elements are attraction-towards-strangers, attraction-towards-enemies and
;;; attraction-towards-friends (elemnt.1:101-105), and every other word that suggests
;;; them names them so: shy, kind and mean (dscrp.17:65-67, 210-211, 249-251). No
;;; element is named attraction-to-friends, so pass 1 never asks friendly for one, and
;;; a friendly character's tendencies were chosen as if she weren't friendly. The
;;; correction gives friendly the same three suggestions under the elements' names, and
;;; takes away the three no element asks for.
;;;
;;; In Ken's Cinderella, Cinderella is friendly (cindy.46:10). Her three tendencies are
;;; chosen as in 1978: towards friends (positive high), as friendly suggests; towards
;;; strangers (negative high) and towards enemies (negative medium), shy's, strongly
;;; suggested, against friendly's (positive medium) and (positive low), which conflict
;;; with them and lose as much less strongly suggested (cosug's conflict resolution, as
;;; kind's, borrowed through good, lost to shy in 1978). Nothing in pass 2 reads a
;;; tendency (thesis X.B.3 (c), L4827-4829); REVIVE;DETAIL has the best-when scores
;;; read them.
;;;
;;; The note, after pass 1 has chosen (REVIVE;SLIPS's afterPass1, src/pipeline.js), on
;;; each choice point of a tendency of a character described as friendly, or by a
;;; neighbor or opposite of friendly (unfriendly takes friendly's suggestions reversed,
;;; cosug.215:68-83):
;;;   (revival-repair: what friendly-attraction was attraction-to-strangers
;;;		     now attraction-towards-strangers because (friendly (positive medium) medium))

(setq :friendly-attractions
      '((attraction-to-friends attraction-towards-friends)
	(attraction-to-strangers attraction-towards-strangers)
	(attraction-to-enemies attraction-towards-enemies)))

(defun name-friendlys-attractions-as-the-elements ()
  (cond ((slip-on? 's3)
	 (mapc (function
		(lambda (pair)
			(mapc (function
			       (lambda (s)
				       (ask friendly forget items matching ,s)
				       (put-suggestion-in-source 'friendly (second pair)
								 (get s 'value) (get s 'strength))))
			      (reverse (friendlys-suggestions-for (first pair))))))
	       :friendly-attractions))))

(defun friendlys-suggestions-for (element)
  (ask friendly collect items memorized matching
       (suggestion: element ,element value ? strength ? source ?)))

(+after-load '|ken;dscrp >| '(revival-once 'slips3-friendly 'name-friendlys-attractions-as-the-elements))

;; The notes, after (z).
(defun note-friendlys-attractions ()
  (cond ((and (slip-on? 's3) (actor-of 'friendly dont-autoload))
	 (mapc (function
		(lambda (character)
			(and (friendly-or-linked? character)
			     (mapc (function
				    (lambda (pair)
					    (let ((cp (list 'choice-point-of character (second pair)))
						  (s (first (friendlys-suggestions-for (second pair)))))
						 (and s
						      (actor-of cp dont-autoload)
						      (revival-note cp 'friendly-attraction
								    (first pair) (second pair)
								    (list 'friendly (get s 'value)
									  (get s 'strength)))))))
				   :friendly-attractions))))
	       (ask character recall your offspring)))))

(defun friendly-or-linked? (character)
  (let ((linked (cons 'friendly (append (ask friendly recall your neighbors)
				       (ask friendly recall your opposites)))))
       (do ((d linked (rest d)))
	   ((null d) nil)
	   (and (ask ,character recall if any items match
		     (description: type ? descriptor ,(first d) %))
		(return t)))))

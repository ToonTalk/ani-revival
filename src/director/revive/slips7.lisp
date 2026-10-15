;;; -*-lisp-*-
;;; REVIVE;SLIPS7: S7, MIDDLE compares itself with (not bottom).
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged). It changes nothing in Ken's Cinderella
;;; (reports/ext/slips/README.md).
;;;
;;; The slip. A three-value compares itself with another through its rank: high and
;;; long are top, medium middle, low and short bottom, and (not low) is asked as
;;; (not bottom) (elemnt.1:135-148, 159-197). MIDDLE answers greater-than with ranks,
;;; and less-than with a value:
;;;
;;;  (do when receiving (are you greater-than ?value)
;;;      (cond ((eq value 'bottom))
;;;	       ((member value '((not top) (not middle))) 'bottom)))
;;;  (do when receiving(are you less-than ?value)
;;;      (cond ((eq value 'top))
;;;	       ((member value '((not low) (not middle))) 'top))))	(elemnt.1:165-171)
;;;
;;; What reaches it is (not bottom), never (not low), so medium was never less than
;;; (not low) or (not short), "high or medium", as it is greater than (not high)
;;; ("medium or low"), which is answered. The correction reads (not bottom), as
;;; greater-than reads (not top).
;;;
;;; In Ken's Cinderella no medium value is ever asked whether it is less than anything
;;; (the correction's receiver, run with her pass 1 and pass 2, is never reached), and
;;; CP 29 has no (not X) choice. It matters
;;; where a choice is (not X), which pass 1 makes and keeps (REVIVE;MEND1 narrows it
;;; only in pass 2), and a relative suggestion compares a medium with it.
;;;
;;; The note, on MIDDLE, whenever the correction answers otherwise than Ken's line (an
;;; item memorized again adds nothing):
;;;   (revival-repair: what middle-less-than was nil now top because ((not bottom)))

(defun teach-middle-less-than-not-bottom ()
  (let ((:insert-methods-at-end nil))
       (define-receiver (are you less-than ?value) middle
	(cond ((not (slip-on? 's7))
	       (cond ((eq value 'top))
		     ((member value '((not low) (not middle))) 'top)))
	      ((eq value 'top))
	      ((member value '((not bottom) (not middle)))
	       (and (equal value '(not bottom))
		    (revival-note 'middle 'middle-less-than nil 'top (list value)))
	       'top)))))

(+after-load '|ken;elemnt >| '(revival-once 'slips7-middle 'teach-middle-less-than-not-bottom))

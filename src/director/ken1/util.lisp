;;; -*-lisp-*-
;;; KEN1;UTIL, reconstructed: "generally useful extensions of Lisp" (DRECT).
;;;
;;; The original is lost; see the header of macros.lisp for the kinds of evidence.
;;; Each definition here follows how the surviving code uses it. TS D2500 (1980)
;;; has compiled code for 59 of UTIL's 67 definitions; those marked VERIFY are to
;;; be checked against it (copying versus modifying in place, argument order).

(sstatus feature kens-utilities)

;;; -------------------------------------------------------------- warnings

(setq-if-unbound :dont-want-to-see-warnings-from nil)
(setq-if-unbound :warning-break nil)
(setq-if-unbound :director-warnings t)

;; (warning who message ...): print a warning from who, unless who has been shut up.
;; evidence: 1980 (an LSUBR); uses (who is a function name, message a list).
(defun warning n
  (let ((who (arg 1))
	(message (cond ((> n 1) (arg 2)))))
       (cond ((memq who :dont-want-to-see-warnings-from) nil)
	     (t (terpri)
		(princ '|;warning from |)
		(princ who)
		(princ '|: |)
		(cond ((atom message) (princ message))
		      (t (print-without-parens message)))
		(and :warning-break (break warning t))
		nil))))

;; (shouldnt-happen who message): an internal error. In 1979 this printed the
;; warning and stopped in a break loop; here it signals an error.
;; evidence: 1980 (an LSUBR that calls WARNING).
(defun shouldnt-happen n
  (let ((who (arg 1))
	(message (cond ((> n 1) (arg 2)))))
       (warning who message)
       (error '|shouldnt happen| (list who message))))

(defun shut-up (who)
  (or (memq who :dont-want-to-see-warnings-from)
      (push who :dont-want-to-see-warnings-from))
  who)

(defun unshut-up (who)
  (setq :dont-want-to-see-warnings-from (delq who :dont-want-to-see-warnings-from))
  who)

;; (ask-if question): ask the user yes or no. With no one at the keyboard, the
;; answer comes from :ask-if-answer (default T).
(setq-if-unbound :ask-if-answer t)
(defun ask-if (question)
  (terpri)
  (cond ((atom question) (princ question)) (t (print-without-parens question)))
  (princ '| (yes or no) |)
  (princ (cond (:ask-if-answer 'yes) (t 'no)))
  :ask-if-answer)

;; (type x [file]): print x on a line of its own, without parentheses.
(defun type n
  (let ((x (arg 1)) (file (cond ((> n 1) (arg 2)))))
       (terpri file)
       (cond ((atom x) (princ x file)) (t (print-without-parens x file)))
       x))

(defun print-without-parens n
  (let ((l (arg 1)) (file (cond ((> n 1) (arg 2)))))
       (do ((i l (cdr i)))
	   ((null i))
	   (princ (car i) file)
	   (and (cdr i) (princ '| | file)))
       l))

;;; -------------------------------------------------------------- sets and lists

;; Sets are lists compared with EQUAL; results keep the order of the first set.
;; VERIFY: EQ or EQUAL.
(defun union n
  (do ((i 2 (1+ i))
       (result (arg 1)))
      ((> i n) result)
      (do ((l (arg i) (cdr l)))
	  ((null l))
	  (or (member (car l) result) (setq result (append result (list (car l))))))))

(defun intersect n
  (do ((i 2 (1+ i))
       (result (arg 1)))
      ((> i n) result)
      (setq result (mapcan (function (lambda (x) (and (member x (arg i)) (list x)))) result))))

(defun set-minus (set1 set2)
  (mapcan (function (lambda (x) (and (not (member x set2)) (list x)))) set1))

(defun cons-if-not-member (x l)
  (cond ((member x l) l) (t (cons x l))))

;; (safe-delete x l): l without x, leaving l itself alone.
(defun safe-delete (x l)
  (cond ((null l) nil)
	((equal x (car l)) (safe-delete x (cdr l)))
	(t (cons (car l) (safe-delete x (cdr l))))))

(defun occurences-of (x l)
  (do ((i l (cdr i)) (count 0 (cond ((equal x (car i)) (1+ count)) (t count))))
      ((null i) count)))

;; (up-til x l): the elements of l before the first x.
(defun up-til (x l)
  (do ((i l (cdr i)) (acc nil (cons (car i) acc)))
      ((or (null i) (equal x (car i))) (nreverse acc))))

(defun splice-on-end (x l)
  (nconc l (list x)))

;; (replace-nth n l x): a copy of l with its nth element (from 0) replaced by x.
;; VERIFY: copy or in place.
(defun replace-nth (n l x)
  (cond ((zerop n) (cons x (cdr l)))
	(t (cons (car l) (replace-nth (1- n) (cdr l) x)))))

;; (copy x): a copy of the list structure. VERIFY: depth.
(defun copy n
  (subst nil nil (arg 1)))

(defun repeatedly-apply-binary-function (f l)
  (do ((result (car l) (funcall f result (car i)))
       (i (cdr l) (cdr i)))
      ((null i) result)))

(defun middle-element (l)
  (nth (// (length l) 2) l))

;; (list-beginning-with head x): the first list in x, at any depth, whose car is head.
(defun list-beginning-with (head x)
  (cond ((atom x) nil)
	((eq (car x) head) x)
	(t (or (list-beginning-with head (car x))
	       (list-beginning-with head (cdr x))))))

(defun maximum-in-set (l)
  (do ((i (cdr l) (cdr i)) (best (car l)))
      ((null i) best)
      (and (greaterp (car i) best) (setq best (car i)))))

(defun integer-average (l)
  (round (quotient (float (apply 'plus l)) (length l))))

(defun fractional-part (x)
  (-$ (float x) (float (fix x))))

(defun in-range (least most x)
  (max least (min most x)))

;; (circular-list-of x): (x x x ...).
(defun circular-list-of (x)
  (let ((l (list x)))
       (rplacd l l)))

;;; -------------------------------------------------------------- property lists

;; (replaceprop plist value indicator): a copy of the disembodied property list
;; with indicator's value replaced. VERIFY: copy or in place.
(defun replaceprop (plist value indicator)
  (let ((new (copy-top-level plist)))
       (putprop new value indicator)
       new))

(defun copy-top-level (l)
  (append l nil))

;; (equal-get plist indicator): get, comparing indicators with EQUAL.
(defun equal-get (plist indicator)
  (do ((p (cdr plist) (cddr p)))
      ((null p) nil)
      (and (equal (car p) indicator) (return (cadr p)))))

;; (maintain-alist alist key value): add value to the end of key's entry, or add a
;; new entry (key value) to the end of the alist; changes it in place.
;; evidence: 1980 compiled code (MAINTAIN-ALIST, a SUBR: an ASSQ or ASSOC, then
;; NCONC of (value) onto the entry or of ((key value)) onto the alist).
(defun maintain-alist (alist key value)
  (let ((entry (assq key alist)))
       (cond (entry (nconc entry (list value)) alist)
	     (alist (nconc alist (list (list key value))))
	     (t (list (list key value))))))

;; (maintain-value-assoc-list alist variable value): set variable's value in an
;; actor's alist of normal variables, which starts with a NIL header (SOME's
;; internal-recall-your-normal-variable); a new pair goes at the end.
;; evidence: 1980 compiled code (MAINTAIN-VALUE-ASSOC-LIST, a SUBR: look the
;; variable up; RPLACD its pair, or NCONC ((variable . value)) onto the alist).
;; It is not in the 1979 tags table, but SOME 666 (8 January 1979) calls it.
(defun maintain-value-assoc-list (alist variable value)
  (let ((pair (assoc variable alist)))
       (cond (pair (rplacd pair value) pair)
	     (t (nconc alist (list (cons variable value)))))))

;;; -------------------------------------------------------------- symbols and numbers

;; (gen-number [name]): 1, 2, 3, ... separately for each name.
(defun gen-number n
  (let ((name (cond ((> n 0) (arg 1)) (t 'gen-number))))
       (putprop name (1+ (or (get name 'gen-number) 0)) 'gen-number)))

;; (generate-symbol prefix): a new interned symbol prefix-n. VERIFY.
(defun generate-symbol (prefix)
  (intern-append-atoms prefix '- (gen-number prefix)))

(defun internedp (s) (+internedp s))

(defun eval-in-env (variables values form)
  (progv variables values (eval form)))

;; (move-file from to [dont-ask]): rename a file into another directory.
(defun move-file n
  (let ((from (arg 1)) (to (arg 2)))
       (and (probef from) (renamef from to))))

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

;; Sets are lists compared with EQUAL (MEMBER). evidence: 1980 (read from the
;; machine code; the decompiler stops at loops). UNION and INTERSECT fold their
;; two-set versions over their arguments from the left. (union-two a b) is the
;; elements of a that b lacks, in a's order, in front of b: it walks (reverse a)
;; (a kernel routine between *APPEND and NREVERSE, surely REVERSE), consing each
;; new element onto b. INTERSECT-TWO and SET-MINUS keep the first set's order.
(defun union n
  (repeatedly-apply-binary-function 'union-two (listify n)))

(defun union-two (a b)
  (do ((l (reverse a) (cdr l))
       (result b))
      ((null l) result)
      (or (member (car l) result) (setq result (cons (car l) result)))))

(defun intersect n
  (repeatedly-apply-binary-function 'intersect-two (listify n)))

(defun intersect-two (a b)
  (do ((l a (cdr l))
       (result nil))
      ((null l) (nreverse result))
      (and (member (car l) b) (setq result (cons (car l) result)))))

(defun set-minus (set1 set2)
  (do ((l set1 (cdr l))
       (result nil))
      ((null l) (nreverse result))
      (or (member (car l) set2) (setq result (cons (car l) result)))))

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

;; (copy tree [user-alist alist atomic-alist]): a copy of tree. A part found (EQ) in
;; user-alist becomes its value there; a list is copied once, so the copy shares what
;; tree shares; an interned symbol or a number stays; an uninterned symbol is copied
;; too, with a copy of its value and of its property list. An actor's methods are
;; uninterned symbols that hold the methods' bodies, its variables among them, so a
;; copy of an actor gets methods and variables of its own; SOME's "make copy" relies
;; on that, as does SCENE, restoring a subscene from the copy it saved before
;; planning ("save a copy incase I have to be redone"). evidence: TS D2500 (COPY,
;; an LSUBR (TREE &OPTIONAL (*USER-ALIST* NIL) (*ALIST* NIL) (*ATOMIC-ALIST* NIL))
;; that binds the three and calls COPY-1, whose compiled code is followed here).
(defun copy n
  (let ((*user-alist* (cond ((> n 1) (arg 2))))
	(*alist* (cond ((> n 2) (arg 3))))
	(*atomic-alist* (cond ((> n 3) (arg 4)))))
       (copy-1 (arg 1))))

(defun copy-1 (x)
  (cond ((cdr (assq x *user-alist*)))
	((atom x)
	 (cond ((cdr (assq x *atomic-alist*)))
	       ((internedp x) x)
	       (t (let ((new (copysymbol x nil)))
		       (setq *atomic-alist* (cons (cons x new) *atomic-alist*))
		       (and (boundp x)
			    (set new (copy (symeval x) *user-alist* nil *atomic-alist*)))
		       (setplist new (copy (plist x) *user-alist* nil *atomic-alist*))
		       new))))
	((cdr (assq x *alist*)))
	(t (let ((new (ncons nil)))
		(setq *alist* (cons (cons x new) *alist*))
		(rplaca new (copy-1 (car x)))
		(rplacd new (copy-1 (cdr x)))
		new))))

;; (repeatedly-apply-binary-function f l): (f (f (f l1 l2) l3) ...). evidence: 1980
;; (it applies f to the first two at once, so one element gives (f l1 nil)).
(defun repeatedly-apply-binary-function (f l)
  (do ((result (funcall f (car l) (cadr l)) (funcall f result (car i)))
       (i (cddr l) (cdr i)))
      ((null i) result)))

(defun middle-element (l)
  (nth (// (length l) 2) l))

;; (list-beginning-with head x): the first list in x, at any depth, whose car is head.
(defun list-beginning-with (head x)
  (cond ((atom x) nil)
	((eq (car x) head) x)
	(t (or (list-beginning-with head (car x))
	       (list-beginning-with head (cdr x))))))

;; (maximum-in-set l relationship): the best of l, starting with its first element
;; and taking each later one x for which (relationship x best) is true.
;; (minimum-in-set l relationship) takes x when (relationship best x) is true.
;; evidence: TS D2500 (both SUBRs of two arguments). DISPLY's exit-by passes
;; PLACE's maximum-ideal-time, which returns the larger of two estimates, never NIL,
;; so it gets the last character's estimate.
(defun maximum-in-set (l relationship)
  (do ((i (cdr l) (cdr i)) (best (car l)))
      ((null i) best)
      (and (funcall relationship (car i) best) (setq best (car i)))))

(defun minimum-in-set (l relationship)
  (do ((i (cdr l) (cdr i)) (best (car l)))
      ((null i) best)
      (and (funcall relationship best (car i)) (setq best (car i)))))

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

;; (gen-number [name]): 1, 2, 3, ... separately for each name; with no name, one
;; count for everything. A list name such as (special-dynamics-of cinderella in
;; ...) counts under its first symbol, and the list itself is left alone (SOME's
;; "make interned offspring" passes an actor's name). evidence: 1980 (the count is
;; a *GEN-NUMBER-VALUE property of the name, of the list's car, or of
;; ANY-OLD-ATOM-HERE-WILL-DO; with no argument, the special *GEN-NUMBER-VALUE).
(setq-if-unbound *gen-number-value 0)

(defun gen-number n
  (cond ((= n 0) (setq *gen-number-value (1+ *gen-number-value)))
	(t (let ((key (cond ((atom (arg 1)) (arg 1))
			    ((atom (car (arg 1))) (car (arg 1)))
			    (t 'any-old-atom-here-will-do))))
		(putprop key (1+ (or (get key '*gen-number-value) 0)) '*gen-number-value)))))

;; (generate-symbol prefix): a new interned symbol prefix-n. VERIFY.
(defun generate-symbol (prefix)
  (intern-append-atoms prefix '- (gen-number prefix)))

;; (internedp x): is the symbol x on the obarray? Anything that is not a symbol
;; counts as interned. evidence: TS D2500, INTERNEDP returns T at once when its
;; argument is not a symbol, so SOME's make tells a parent about offspring with
;; non-atomic names such as (choice-point-of cinderella speed).
(defun internedp (s)
  (cond ((symbolp s) (+internedp s))
	(t t)))

(defun eval-in-env (variables values form)
  (progv variables values (eval form)))

;; (move-file from to [dont-ask]): rename a file into another directory.
(defun move-file n
  (let ((from (arg 1)) (to (arg 2)))
       (and (probef from) (renamef from to))))

;;; -*-lisp-*-
;;; REVIVE;MEND7: M7, COSUG's combine for change suggestions.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. COSUG's combine for two change: suggestions on one element reads the
;;; old 'display key (cosug.215:449-477) and calls shouldnt-happen; the change-to:
;;; combine merges into a nil value (cosug.215:499-520). Under today's
;;; (method: type display-value-change value (change: ...)) the repair reads
;;; (get (get s 'value) 'value) when that key is absent. Cinderella never reaches this
;;; code; every new feeling that shares an element with joy does.

;; A feeling suggests a change in how a character moves as a method of type
;; display-value-change, with the change under value. For (joy (positive low)):
;;   (method: type display-value-change
;;	      value (change: element (goat speed) amount (positive low) speed low))
;; (emote.9:19-24). CHOMET takes the change from there, (get (get suggestion 'value)
;; 'value) (chomet.123:471). SUGEST groups a task's change suggestions by kind and
;; element, and has COSUG combine each group and record the result on the task
;; (sugest.123:213-234, through record+combine-suggestions, cosug.215:93-97). COSUG
;; combines change: and change-to: suggestions with change:-package and
;; change-to:-package (disply.311:1044-1045, 1060-1061), which, with the functions they
;; call, read the change under display (cosug.215:455-634), the format of Ken's
;; comments there (cosug.215:449-453, 491-495). They find nil. Two change: suggestions
;; stop pass 2 (shouldnt-happen, cosug.215:464-467). Two change-to: suggestions, nil
;; and nil being equal, merge into a value of nil (cosug.215:508-509), which CHOMET
;; passes over (chomet.123:209-211), so both changes are lost.
;;
;; Cinderella never combines two. Each group SUGEST hands COSUG in her five scenes
;; holds one suggestion, which value-description's combine returns as it is
;; (cosug.215:110-111). The one task with two feelings, the stepmother's in Kept Apart
;; (cindy.46:70-72), has one feeling Ani knows: ask-if-exists passes over pride
;; (sugest.123:38-45).
;;
;; So when COSUG is to combine two or more change suggestions with the change under
;; value, it is handed them with that change under display, where it reads it: what it
;; reads there is then (get (get s 'value) 'value). All of Ken's combine runs as he
;; wrote it: change:-package and change-to:-package, their relationships for three or
;; more (cosug.215:478-489, 521-536, 714-762), and the merges into a copy of the
;; method (cosug.215:548-634). What it makes of them is given back with the change
;; under value again and recorded on the task, as Ken's record+combine-suggestions
;; records it. A note on the task says what COSUG made.

;; record+combine-suggestions (cosug.215:93-97) for change suggestions with the change
;; under value: Ken's two steps, combine and record, with COSUG's format in between.
;; Anything else, and fewer than two suggestions, go to Ken's.
(defun record+combine-suggestions-reading-changes-under-value (suggestions element choice-point)
  (cond ((changes-under-value-to-combine? suggestions)
	 (let ((for-cosug (mapcar 'change-suggestion-for-cosug suggestions)))
	      (let ((combined
		     (changes-combined-in-todays-format
		      (example-of
		       (ask ,element ask your value-description to combine suggestions !,for-cosug)
		       something)
		      (mapcar 'cons for-cosug suggestions))))
		   (revival-note choice-point
				 'combined-changes
				 (cond ((eq element 'change:) 'stopped) ;;cosug.215:464-467
				       (t 'lost)) ;;cosug.215:508-509
				 (what-combining-made combined)
				 '(change under value not display))
		   (record-combined-suggestion combined choice-point))))
	(t (funcall (revival-wrapped 'record+combine-suggestions 'mend7)
		    suggestions element choice-point))))

(+after-load '|ken;cosug >|
  '(revival-wrap 'record+combine-suggestions 'mend7
		 'record+combine-suggestions-reading-changes-under-value))

;; Whether these are two or more suggestions to combine, and one of them a change with
;; the change under value, where COSUG would find nil.
(defun changes-under-value-to-combine? (suggestions)
  (and (rest suggestions)
       (do ((s suggestions (rest s)))
	   ((null s) nil)
	   (and (change-under-value? (get (first s) 'value))
		(return t)))))

(defun change-under-value? (method)
  (and (not (atom method))
       (eq (first method) 'method:)
       (eq (get method 'type) 'display-value-change)
       (null (get method 'display))
       (get method 'value)))

;; The suggestion with its change under display in place of value, for COSUG: a new
;; suggestion, so that the one SUGEST collected is left as it was, and the pairs below
;; tell them apart. The change itself is the same list, not a copy.
(defun change-suggestion-for-cosug (suggestion)
  (cond ((change-under-value? (get suggestion 'value))
	 (property-replaced-in-a-copy suggestion
				      (indicator-renamed (get suggestion 'value) 'value 'display)
				      'value))
	(t suggestion)))

;; What COSUG made of the suggestions, with the change under value again: a merged
;; suggestion, a conflict, or an (and ...) of them (cosug.215:119-134, 943-954). Each
;; suggestion it was handed and gives back (a conflict's offenders) is the one it was
;; made from (pairs is ((for-cosug . suggestion) ...)).
(defun changes-combined-in-todays-format (combined pairs)
  (cond ((atom combined) combined)
	((eq (first combined) 'and)
	 (cons 'and
	       (mapcar (function (lambda (c) (changes-combined-in-todays-format c pairs)))
		       (rest combined))))
	((eq (first combined) 'conflict:)
	 (property-replaced-in-a-copy
	  combined
	  (mapcar (function (lambda (s) (change-suggestion-in-todays-format s pairs)))
		  (get combined 'offenders))
	  'offenders))
	((eq (first combined) 'suggestion:)
	 (change-suggestion-in-todays-format combined pairs))
	(t combined)))

;; One that COSUG made has its change under value again. change-to:-package merges two
;; equal changes into the change alone, not its method (cosug.215:508-509, where
;; change:-package merges the method, cosug.215:468-469); that change goes back in a
;; method, as EMOTE makes them (emote.9:39-42).
(defun change-suggestion-in-todays-format (suggestion pairs)
  (let ((value (get suggestion 'value)))
       (cond ((cdr (assq suggestion pairs)))
	     ((atom value) suggestion)
	     ((eq (first value) 'method:)
	      (property-replaced-in-a-copy suggestion
					   (indicator-renamed value 'display 'value)
					   'value))
	     ((eq (first value) 'change-to:)
	      (property-replaced-in-a-copy suggestion
					   '(method: type display-value-change value ,value)
					   'value))
	     (t suggestion))))

;; A copy of plist (a name, then indicators and values, as Ani's items are) with
;; indicator's value replaced by value, in the same place; plist is left as it was.
;; Ken's code has replaceprop for this (cosug.215:74-81, 88; sugest.123:266-270), but
;; KEN1's replaceprop is rebuilt from those uses and may not be his on this point
;; (src/director/ken1/util.lisp: "VERIFY: copy or in place"), and these must be copies.
(defun property-replaced-in-a-copy (plist value indicator)
  (do ((p (rest plist) (rest (rest p)))
       (copy (list (first plist))))
      ((null p) (nreverse copy))
      (setq copy (cons (cond ((eq (first p) indicator) value) (t (second p)))
		       (cons (first p) copy)))))

;; A copy of plist with the indicator old renamed new, in the same place.
(defun indicator-renamed (plist old new)
  (do ((p (rest plist) (rest (rest p)))
       (copy (list (first plist))))
      ((null p) (nreverse copy))
      (setq copy (cons (second p)
		       (cons (cond ((eq (first p) old) new) (t (first p))) copy)))))

;; For the note: the changes COSUG made, and for each conflict (conflict type element),
;; the element as its first offender's change names it (a note on each element's
;; group, since a task memorizes an item only once).
(defun what-combining-made (combined)
  (cond ((atom combined) nil)
	((eq (first combined) 'and) (mapcan 'what-combining-made (rest combined)))
	((eq (first combined) 'suggestion:) (list (get (get combined 'value) 'value)))
	((eq (first combined) 'conflict:)
	 (list (list 'conflict
		     (get combined 'type)
		     (get (get (get (first (get combined 'offenders)) 'value) 'value) 'element))))))

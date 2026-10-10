;; -*-lisp-*-
;; cast: dum = Dum (he); dee = Dee (he)
;; scenes: the-meeting = The Meeting
;; A test story for REVIVE;APPEAR (test/appear.test.js): two characters whose words
;; would have the shape experts draw both as a circle (friendly is smooth, shy is plain),
;; but who are not so alike that Ani's comparisons tell her to keep them so, since
;; only Dee is hard-working. Ani tells them apart by choosing the least justified of
;; their shape choices again.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define dum character
	(process initial description
		 (personality (and friendly shy))))

(define dee character
	(process initial description
		 (personality (and friendly shy hard-working))))

(define the-meeting scene
	(process initial description
		 (and (establish (personality dum))
		      (establish (personality dee))))
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define alike-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 1) (minutes 2)))
	(set your level of obviousness to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to (dum)))

(compile-actors)

```lisp
;; -*-lisp-*-
;; cast: belle = Belle (she); beast = the Beast (he); father = Belle's father (he)
;; scenes: introduction = Introduction; kept-apart = Kept Apart; growing-love = Growing Love; kindness = Kindness; together = Together

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define belle character
	(process initial description
		 (physical beautiful)
		 (personality (and kind stubborn))
		 (role-in-story most-important)))

(define beast character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and strong mean))))

(define father character
	(process initial description
		 (physical physically-weak)
		 (personality (and weak kind))))

(define (relationship-of beast belle) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of belle beast) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of father belle) relationship
	(process initial description
		 loves))

(define (relationship-of belle father) relationship
	(process initial description
		 loves))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality belle))
		       (establish (personality beast))
		       (establish (relationship (relationship-of beast belle))))
		  (establish (emotional-state belle (joy (negative low))))))
	(set your mood to depressing)
	(set your rhythm to normal)
	(set your length to short))

(define kept-apart scene
	(process initial description
		 (sequence:
		  (convey (wants father (meets father belle)))
		  (convey (prevents beast (meets father belle)))
		  (and (establish (emotional-state father (joy (negative medium))))
		       (establish (emotional-state belle (joy (negative high)))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to slow)
	(set your length to medium))

(define growing-love scene
	(process initial description
		 (sequence:
		  (convey (accompanys belle beast))
		  (and (convey (change (personality beast mean)
				       (personality beast kind)))
		       (convey (change
				(relationship (relationship-of belle beast) is-tolerant-of)
				(relationship (relationship-of belle beast) loves))))
		  (establish (emotional-state belle (joy (positive medium))))))
	(set your mood to hopeful)
	(set your rhythm to slow)
	(set your length to medium))

(define kindness scene
	(process initial description
		 (sequence:
		  (establish (personality beast))
		  (convey (accompanys beast belle))
		  (convey (change
			   (relationship (relationship-of beast belle) (and dominates hates))
			   (relationship (relationship-of beast belle) loves)))
		  (establish (emotional-state beast (joy (positive medium))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define together scene
	(process initial description
		 (sequence:
		  (convey (alone belle beast))
		  (convey (getting-it-on belle beast))
		  (and (establish (emotional-state belle (joy (positive high))))
		       (establish (emotional-state beast (joy (positive high)))))))
	(set your mood to (very joyous))
	(set your rhythm to normal)
	(set your length to long))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define beauty-and-the-beast-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to medium)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
	(set your order-of-character+element-type+element to (characters element-types elements))
	(set your parts-of-the-focus to
	     (belle kept-apart growing-love kindness together
		    (relationship-of belle beast)
		    (relationship-of beast belle)
		    (relationship-of father belle)
		    (relationship-of belle father))))

(compile-actors)
```
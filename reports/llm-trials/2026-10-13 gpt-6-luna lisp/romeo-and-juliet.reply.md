```lisp
;; -*-lisp-*-
;; cast: romeo = Romeo (he); juliet = Juliet (she); montague-family = the Montague family (they); capulet-family = the Capulet family (they); tybalt = Tybalt (he)
;; scenes: introduction = Introduction; kept-apart = Kept Apart; tybalt-fights-romeo = Tybalt Fights Romeo; the-lovers-together = The Lovers Together

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define romeo character
	(process initial description
		 (physical beautiful)
		 (personality (and good determined))
		 (role-in-story most-important)))

(define juliet character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind shy))))

(define montague-family character
	(process initial description
		 (physical physically-strong)
		 (personality (and strong stubborn))))

(define capulet-family character
	(process initial description
		 (physical physically-strong)
		 (personality (and strong stubborn))))

(define tybalt character
	(process initial description
		 (physical physically-strong)
		 (personality (and strong brazen))))

(define (relationship-of romeo juliet) relationship
	(process initial description
		 loves))

(define (relationship-of juliet romeo) relationship
	(process initial description
		 loves))

(define (relationship-of montague-family capulet-family) relationship
	(process initial description
		 hates))

(define (relationship-of capulet-family montague-family) relationship
	(process initial description
		 hates))

(define (relationship-of tybalt romeo) relationship
	(process initial description
		 hates))

(define introduction scene
	(process initial description
		 (and (establish (personality romeo))
		      (establish (personality juliet))
		      (establish (relationship (relationship-of romeo juliet)))
		      (establish (relationship (relationship-of juliet romeo)))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define kept-apart scene
	(process initial description
		 (sequence:
		  (and (establish (relationship (relationship-of montague-family capulet-family)))
		       (establish (relationship (relationship-of capulet-family montague-family))))
		  (convey (wants romeo (meets romeo juliet)))
		  (and (convey (prevents capulet-family (meets romeo juliet)))
		       (convey (prevents montague-family (meets romeo juliet))))
		  (and (establish (emotional-state romeo (joy (negative high))))
		       (establish (emotional-state juliet (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to long))

(define tybalt-fights-romeo scene
	(process initial description
		 (sequence:
		  (establish (personality tybalt))
		  (establish (relationship (relationship-of tybalt romeo)))
		  (convey (pushes tybalt romeo))
		  (and (establish (emotional-state tybalt (pride (positive medium))))
		       (establish (emotional-state romeo (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define the-lovers-together scene
	(process initial description
		 (sequence:
		  (and (convey (undoes romeo
				       (from-scene kept-apart
						   (convey (prevents capulet-family
								     (meets romeo juliet)))))
		       (convey (undoes romeo
				       (from-scene kept-apart
						   (convey (prevents montague-family
								     (meets romeo juliet))))))
		  (convey (alone romeo juliet))
		  (convey (getting-it-on romeo juliet))
		  (and (establish (emotional-state romeo (joy (negative high))))
		       (establish (emotional-state juliet (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define romeo-and-juliet-film film
	(set your level of variety to medium)
	(set your level of complexity to medium)
	(set your level of originality to high)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to medium)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to medium)
	(set your level of energy to medium)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (romeo kept-apart tybalt-fights-romeo the-lovers-together
                 (relationship-of romeo juliet)
                 (relationship-of juliet romeo)
                 (relationship-of montague-family capulet-family)
                 (relationship-of capulet-family montague-family))))

(compile-actors)
```
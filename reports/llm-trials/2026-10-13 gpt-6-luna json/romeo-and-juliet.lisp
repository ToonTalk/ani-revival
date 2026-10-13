;; -*-lisp-*-
;; cast: romeo = Romeo (he); juliet = Juliet (she); tybalt = Tybalt (he)
;; scenes: the-lovers = The Lovers; kept-apart = Kept Apart; the-fight = The Fight; together = Together

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
		 (personality (and good kind))))

(define (relationship-of romeo juliet) relationship
	(process initial description
		 loves))

(define (relationship-of juliet romeo) relationship
	(process initial description
		 loves))

(define tybalt character
	(process initial description
		 (physical strong)
		 (personality (and mean strong))))

(define (relationship-of tybalt romeo) relationship
	(process initial description
		 hates))

(define (relationship-of romeo tybalt) relationship
	(process initial description
		 hates))

(define the-lovers scene
	(process initial description
		 (sequence: (and (establish (personality romeo))
		                 (establish (personality juliet)))
		            (and (establish (relationship (relationship-of romeo juliet)))
		                 (establish (relationship (relationship-of juliet romeo))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define kept-apart scene
	(process initial description
		 (sequence: (convey (wants romeo (meets romeo juliet)))
		            (convey (prevents tybalt (meets romeo juliet)))
		            (and (establish (emotional-state romeo (joy (negative high))))
		                 (establish (emotional-state juliet (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(define the-fight scene
	(process initial description
		 (sequence: (and (establish (personality tybalt))
		                 (convey (hurts tybalt romeo)))
		            (and (establish (emotional-state tybalt (joy (negative high))))
		                 (establish (emotional-state romeo (joy (negative medium)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define together scene
	(process initial description
		 (sequence: (convey (undoes romeo (from-scene kept-apart (convey (prevents tybalt (meets romeo juliet))))))
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
      (romeo kept-apart the-fight together
        (relationship-of romeo juliet)
        (relationship-of juliet romeo))))

(compile-actors)

;; -*-lisp-*-
;; cast: romeo = Romeo (he); juliet = Juliet (she); romeo-family = Romeo's family (they); juliet-family = Juliet's family (they); tybalt = Tybalt (he)
;; scenes: young-love = Young Love; family-feud = The Family Feud; kept-apart = Kept Apart; the-fight = The Fight; together-in-sadness = Together in Sadness

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define romeo character
	(process initial description
		 (physical beautiful)
		 (personality (and good friendly))
		 (role-in-story most-important)))

(define juliet character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))))

(define romeo-family character
	(process initial description
		 (physical powerful)
		 (personality (and mean stubborn))))

(define juliet-family character
	(process initial description
		 (physical powerful)
		 (personality (and mean stubborn))))

(define tybalt character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean brazen))))

(define (relationship-of romeo juliet) relationship
	(process initial description
		 loves))

(define (relationship-of juliet romeo) relationship
	(process initial description
		 loves))

(define (relationship-of romeo-family juliet-family) relationship
	(process initial description
		 hates))

(define (relationship-of juliet-family romeo-family) relationship
	(process initial description
		 hates))

(define (relationship-of tybalt romeo) relationship
	(process initial description
		 hates))

(define young-love scene
	(process initial description
		 (and (establish (personality romeo))
		      (establish (personality juliet))
		      (establish (relationship (relationship-of romeo juliet)))
		      (establish (relationship (relationship-of juliet romeo)))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define family-feud scene
	(process initial description
		 (and (establish (personality romeo-family))
		      (establish (personality juliet-family))
		      (establish (relationship (relationship-of romeo-family juliet-family)))
		      (establish (relationship (relationship-of juliet-family romeo-family)))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define kept-apart scene
	(process initial description
		 (sequence:
		  (convey (prevents romeo-family (meets romeo juliet)))
		  (convey (prevents juliet-family (meets juliet romeo)))
		  (and (establish (emotional-state romeo (joy (negative high))))
		       (establish (emotional-state juliet (joy (negative high)))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to (changes fast slow))
	(set your length to medium))

(define the-fight scene
	(process initial description
		 (sequence:
		  (establish (personality tybalt))
		  (convey (pushes romeo tybalt))
		  (and (establish (emotional-state romeo (joy (negative high))))
		       (establish (emotional-state tybalt (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define together-in-sadness scene
	(process initial description
		 (sequence:
		  (convey (alone romeo juliet))
		  (convey (getting-it-on romeo juliet))
		  (and (establish (emotional-state romeo (joy (negative high))))
		       (establish (emotional-state juliet (joy (negative high)))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to long))

(declare (coutput (read)))

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
	     (romeo young-love kept-apart together-in-sadness
		    (relationship-of romeo juliet)
		    (relationship-of juliet romeo)
		    (relationship-of romeo-family juliet-family)
		    (relationship-of juliet-family romeo-family))))

(compile-actors)

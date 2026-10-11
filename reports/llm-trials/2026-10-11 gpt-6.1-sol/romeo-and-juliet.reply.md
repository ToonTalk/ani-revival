```lisp
;; -*-lisp-*-
;; cast: romeo = Romeo (he); juliet = Juliet (she); romeo-family = Romeo's family (they); juliet-family = Juliet's family (they); tybalt = Tybalt (he)
;; scenes: lovers = The Lovers; kept-apart = Kept Apart; the-fight = The Fight; together-in-sadness = Together in Sadness

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define romeo character
	(process initial description
		 (physical beautiful)
		 (personality (and good friendly determined))
		 (role-in-story most-important)))

(define juliet character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind determined))))

(define romeo-family character
	(process initial description
		 (physical powerful)
		 (personality (and stubborn strong unfriendly))))

(define juliet-family character
	(process initial description
		 (physical powerful)
		 (personality (and stubborn strong unfriendly))))

(define tybalt character
	(process initial description
		 (physical physically-strong)
		 (personality (and mean strong unfriendly))))

(define (relationship-of romeo juliet) relationship
	(process initial description
		 loves))

(define (relationship-of juliet romeo) relationship
	(process initial description
		 loves))

(define (relationship-of romeo romeo-family) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of romeo-family romeo) relationship
	(process initial description
		 (and dominates is-protective-to)))

(define (relationship-of romeo juliet-family) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of juliet-family romeo) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of romeo tybalt) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of tybalt romeo) relationship
	(process initial description
		 (and hates is-impolite-to)))

(define (relationship-of juliet romeo-family) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of romeo-family juliet) relationship
	(process initial description
		 is-intolerant-of))

(define (relationship-of juliet juliet-family) relationship
	(process initial description
		 is-obedient-to))

(define (relationship-of juliet-family juliet) relationship
	(process initial description
		 (and dominates is-protective-to)))

(define (relationship-of juliet tybalt) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of tybalt juliet) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of romeo-family juliet-family) relationship
	(process initial description
		 hates))

(define (relationship-of juliet-family romeo-family) relationship
	(process initial description
		 hates))

(define (relationship-of romeo-family tybalt) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of tybalt romeo-family) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of juliet-family tybalt) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of tybalt juliet-family) relationship
	(process initial description
		 is-polite-to))

(define lovers scene
	(process initial description
		 (sequence:
		  (establish (personality romeo))
		  (establish (personality juliet))
		  (establish (relationship (relationship-of romeo juliet)))
		  (establish (emotional-state romeo (joy (positive high))))))
	(set your mood to joyous)
	(set your rhythm to normal)
	(set your length to medium))

(define kept-apart scene
	(process initial description
		 (sequence:
		  (convey (prevents romeo-family (meets romeo juliet)))
		  (convey (prevents juliet-family (meets juliet romeo)))
		  (establish (emotional-state romeo (joy (negative high))))
		  (establish (emotional-state juliet (joy (negative high))))))
	(set your mood to (changes hopeful depressing))
	(set your rhythm to (changes fast slow))
	(set your length to medium))

(define the-fight scene
	(process initial description
		 (sequence:
		  (establish (personality tybalt))
		  (convey (hurts tybalt romeo))
		  (establish (emotional-state tybalt (joy (negative high))))
		  (establish (emotional-state romeo (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to fast)
	(set your length to short))

(define together-in-sadness scene
	(process initial description
		 (sequence:
		  (convey (alone romeo juliet))
		  (convey (getting-it-on romeo juliet))
		  (establish (emotional-state romeo (joy (negative high))))
		  (establish (emotional-state juliet (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to slow)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define romeo-and-juliet-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
	(set your order-of-character+element-type+element to
	     (characters element-types elements))
	(set your parts-of-the-focus to
	     (romeo lovers kept-apart the-fight together-in-sadness
		    (relationship-of romeo juliet)
		    (relationship-of juliet romeo)
		    (relationship-of romeo-family juliet-family)
		    (relationship-of juliet-family romeo-family)
		    (relationship-of tybalt romeo))))

(compile-actors)
```
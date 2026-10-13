```lisp
;; -*-lisp-*-
;; cast: crow = the crow (she); fox = the fox (he)
;; scenes: proud-crow = The Proud Crow; flattery = Flattery; shame = Shame

(include |ai:ken;declar >|)

(defcomment cindy)

(define crow character
	(process initial description
		 (physical pretty)
		 (personality brazen)
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (physical elegant)
		 (personality (and selfish forward determined))
		 (movement graceful)))

(define (relationship-of fox crow) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of crow fox) relationship
	(process initial description
		 is-grateful-to))

(define proud-crow scene
	(process initial description
		 (sequence:
		  (and (establish (personality crow))
		       (establish (personality fox))
		       (establish (relationship (relationship-of fox crow))))
		  (establish (emotional-state crow (pride (positive high))))))
	(set your mood to normal)
	(set your rhythm to slow)
	(set your length to medium))

(define flattery scene
	(process initial description
		 (sequence:
		  (convey (meets fox crow))
		  (establish (relationship (relationship-of crow fox)))
		  (establish (emotional-state crow (joy (positive high))))
		  (establish (emotional-state crow (pride (positive high))))))
	(set your mood to hopeful)
	(set your rhythm to normal)
	(set your length to medium))

(define shame scene
	(process initial description
		 (sequence:
		  (convey (hurts fox crow))
		  (establish (emotional-state fox (joy (positive high))))
		  (establish (emotional-state crow (pride (negative high))))
		  (establish (emotional-state crow (joy (negative high))))))
	(set your mood to depressing)
	(set your rhythm to (changes fast slow))
	(set your length to short))

(declare (coutput (read)))

(define crow-and-fox-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to medium)
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
	     (crow proud-crow flattery shame
		   (relationship-of fox crow)
		   (relationship-of crow fox))))

(compile-actors)
```
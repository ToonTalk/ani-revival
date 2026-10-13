;; -*-lisp-*-
;; cast: hen = the hen (she); fox = the fox (he); chick = the chick (she)
;; scenes: the-yard = The Yard
;; A stress story for the revival's knowledge (KNOW, README.md here): every character
;; is described only with words KNOW adds. The hen is old, gentle and timid (timid
;; borrows shy's way of showing itself, avoiding a stranger); the fox is rough, cruel
;; and brave (cruel borrows mean's, chasing or hurting an enemy, and brave goes after
;; one); the chick is young, curious, playful and clever (curious meets a stranger).
;; In 1978 Ani knows none of these words, and pass 1 stops: the hen and the chick have
;; no word in common to compare them by (MEND's M8). With MEND alone, every one is
;; left out as unknown (M3), and the scene has nothing to show.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hen character
	(process initial description
		 (physical old)
		 (personality (and gentle timid))
		 (role-in-story most-important)))

(define fox character
	(process initial description
		 (personality (and rough cruel brave))))

(define chick character
	(process initial description
		 (physical young)
		 (personality (and curious playful clever))))

(define (relationship-of fox hen) relationship
	(process initial description
		 hates))

(define the-yard scene
	(process initial description
		 (and (establish (personality hen))
		      (establish (personality fox))
		      (establish (personality chick))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define know-words-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 1) (minutes 2)))
	(set your level of rhythm to high)
	(set your mood to scene-dependent)
	(set your level of coherence to high)
	(set your level of obviousness to high)
	(set your level of flashiness to low)
	(set your level of energy to high)
	(set your focus to the-films-focus))

(define the-films-focus focus
 (set your order-of-character+element-type+element to (characters element-types elements))
 (set your parts-of-the-focus to
      (hen the-yard (relationship-of fox hen))))

(compile-actors)

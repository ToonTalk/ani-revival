(include |ai:ken;declar >|)
(defcomment cindy) ;for tags
(define belle character
	(process initial description
		 (physical beautiful)
		 (personality (and stubborn good strong kind))
		 (role-in-story most-important)))
(define beast character
  (process initial description
    (physical ugly physically-strong)
    (personality (and mean selfish stubborn))))
(define (relationship-of beast belle) relationship
  (process initial description (and dominates hates)))
(define (relationship-of belle beast) relationship
  (process initial description
    (and is-grateful-to is-tolerant-of)))
(define father character
  (process initial description
    (physical physically-weak)
    (personality (and kind weak good))))
(define (relationship-of father belle) relationship
  (process initial description
    (and loves is-protective-to)))
(define (relationship-of belle father) relationship
  (process initial description
    (and is-grateful-to is-protective-to)))
(define prince character
	(process initial description
		 (physical beautiful)
		 (personality (and good stubborn determined strong))))
(define (relationship-of belle prince) relationship
  (process initial description
    (and loves is-protective-to)))
(define (relationship-of prince belle) relationship
  (process initial description
    (and loves is-protective-to)))

;; how the others feel about each other (filled in: Ani asks about every pair)

(define (relationship-of beast father) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of beast prince) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of father beast) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of father prince) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of prince beast) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of prince father) relationship
	(process initial description
		 is-polite-to))
(define introduction scene
	(process initial description
		 (and (establish (personality belle))
		      (establish (emotional-state belle (joy (positive low))))
		      (establish (personality beast))
		      (establish (emotional-state beast (joy (positive low))))
		      (establish (relationship (relationship-of beast belle)))
		      (establish (relationship (relationship-of belle beast)))))
	(set your rhythm to normal);this is relative to the film's rhythm
	(set your length to long))
(define kept-apart scene
  (process initial description
    (sequence:
      (convey (prevents beast (meets belle father)))
      (convey (prevents beast (meets belle)))
      (and
        (establish
          (emotional-state belle (joy (negative high))))
        (establish
          (emotional-state beast
            (and (joy (positive medium))
              (pride (positive medium))))))))
  (set your mood to (changes hopeful depressing))
  (set your rhythm to (changes fast slow))
  (set your length to long))
(define relationship-develop scene
  (process initial description
    (convey
      (undoes father
        (from-scene kept-apart
          (convey
            (prevents beast (meets belle father)))))))
  (set your mood to (and joyous anticipatory))
  (set your rhythm to fast)
  (set your length to short))
(define meeting scene
  (process initial description
    (sequence: (convey (alone belle beast))
      (convey (getting-it-on belle beast))
      (and
        (establish
          (relationship (relationship-of beast belle)))
        (establish
          (relationship (relationship-of belle beast))))
      (and
        (establish
          (emotional-state belle (joy (positive high))))
        (establish
          (emotional-state beast (joy (positive high)))))))
  (set your mood to (very joyous))
  (set your rhythm to fast)
  (set your length to long))
 
(define justice scene
  (process initial description
    (and (convey (aware belle (getting-it-on beast)))
      (convey (getting-it-on belle beast))
      (establish
        (emotional-state beast (joy (negative high))))))
  (set your mood to joyous)
  (set your length to medium))
(declare (coutput (read)))
(define belfie-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 2) (minutes 5)))
	(set your level of rhythm to high) ;; medium-fast was here but not supported so...
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
    (belle relationship-of belle beast
      (relationship-of beast belle)
      (relationship-of father belle))))
						  
(compile-actors)

;; -*-lisp-*-
;; cast: hare = the hare (he); tortoise = the tortoise (she); narrator = the narrator (he); crowd = the crowd (they)
;; scenes: boast = The Boast; push = The Push; determined-scene = Determined; ashamed = Ashamed; crowd = The Crowd

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hare character
  (process initial description
    (physical (and physically-strong beautiful))
    (personality
      (and brave lazy forward selfish mean brazen))
    (movement (and quick clumsy clody))))

(define tortoise character
  (process initial description
    (physical (and physically-weak ugly))
    (personality
      (and determined hard-working industrious shy
        calm unfriendly stubborn))
    (movement (and slow clumsy))
    (role-in-story most-important)))

(define (relationship-of hare tortoise) relationship
  (process initial description
    (and dislikes is-impolite-to)))

(define (relationship-of tortoise hare) relationship
  (process initial description
    (and is-protective-to is-grateful-to)))

(define narrator character
  (process initial description (physical ugly)
    (personality calm) (movement slow)))

(define (relationship-of narrator tortoise) relationship
  (process initial description is-protective-of))

(define crowd character
  (process initial description (physical ugly)
    (personality cheerful) (movement quick)))

(define (relationship-of hare crowd) relationship
  (process initial description is-polite-to))

(define (relationship-of crowd hare) relationship
  (process initial description is-polite-to))

(define (relationship-of crowd tortoise) relationship
  (process initial description is-polite-to))

(define (relationship-of tortoise crowd) relationship
  (process initial description is-polite-to))

(define boast scene
  (process initial description
    (and (establish (personality hare))
      (establish
        (emotional-state hare (pride (positive high))))
      (establish (personality tortoise))
      (establish
        (emotional-state tortoise
          (loneliness (positive low))))))
  (set your mood to normal)
  (set your rhythm to normal)
  (set your length to short))

(define push scene
  (process initial description
    (and
      (establish
        (relationship (relationship-of hare tortoise)))
      (establish
        (emotional-state hare (joy (negative high))))
      (convey (pushes hare tortoise))
      (establish
        (emotional-state tortoise
          (fear (positive medium))))
      (establish
        (relationship (relationship-of tortoise hare)))
      (establish
        (emotional-state hare (joy (negative low))))
      (establish
        (emotional-state tortoise
          (fear (positive high))))))
  (set your mood to (changes hopeful depressing))
  (set your rhythm to (changes fast slow))
  (set your length to medium))

(define determined-scene scene
  (process initial description
    (and (establish (personality tortoise))
      (establish
        (emotional-state tortoise
          (pride (positive low))))))
  (set your mood to normal)
  (set your rhythm to slow)
  (set your length to short))

(define ashamed scene
  (process initial description
    (and
      (establish
        (emotional-state hare (anger (positive high))))
      (establish
        (emotional-state tortoise
          (joy (positive high))))
      (establish
        (relationship (relationship-of hare tortoise)))
      (establish
        (emotional-state hare (anger (positive low))))))
  (set your mood to (changes hopeful depressing))
  (set your rhythm to fast)
  (set your length to medium))

(define crowd scene
  (process initial description
    (establish
      (emotional-state crowd (joy (positive high)))))
  (set your mood to joyous)
  (set your rhythm to fast)
  (set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define tortoise-film film
  (set your level of variety to medium)
  (set your level of complexity to low)
  (set your level of originality to low)
  (set your film-length to
    (interval (minutes 2) (minutes 5)))
  (set your level of rhythm to medium)
  (set your mood to scene-dependent)
  (set your level of coherence to high)
  (set your level of obviousness to high)
  (set your level of flashiness to low)
  (set your level of energy to medium)
  (set your focus to the-films-focus))

(define the-films-focus focus
  (set your order-of-character+element-type+element to
    (characters element-types elements))
  (set your parts-of-the-focus to
    (tortoise ashamed determined-scene
      (relationship-of tortoise hare))))

(compile-actors)

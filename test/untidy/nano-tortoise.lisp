;; -*-lisp-*-
;; cast: hare = the hare (he); tortoise = the tortoise (he); narrator = the narrator (they)
;; scenes: boast = The Boast; push = The Push; determination = Determination; ashamed = Ashamed; aftermath = Aftermath; end = The End
;; Gemini Nano's Tortoise and the Hare, as it wrote it (as JSON, which the page put into
;; Ken's notation) in Chrome with the revival's extensions on, 13 October 2026: in its
;; scene The Push, an undoes in the scene it undoes, which Ani can't plan and the page's
;; tidy step leaves out (tools/check-film-app.mjs).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define hare character
  (process initial description
    (physical (and beautiful physically-strong))
    (personality
      (and brazen lazy mean forward selfish))
    (movement clumsy)))

(define tortoise character
  (process initial description
    (physical (and shabby physically-weak))
    (personality
      (and determined good industrious shy unfriendly))
    (movement graceful) (role-in-story most-important)))

(define (relationship-of hare tortoise) relationship
  (process initial description hates))

(define (relationship-of tortoise hare) relationship
  (process initial description hates))

(define narrator character
  (process initial description (physical elegant)
    (personality good) (movement graceful)))

(define (relationship-of tortoise narrator) relationship
  (process initial description loves))

(define (relationship-of narrator tortoise) relationship
  (process initial description loves))

(define boast scene
  (process initial description
    (and (establish (personality hare))
      (establish (personality tortoise))
      (establish
        (relationship (relationship-of hare tortoise)))
      (establish
        (emotional-state hare (pride (positive high))))
      (establish
        (emotional-state tortoise (joy (negative low))))))
  (set your mood to normal)
  (set your rhythm to normal)
  (set your length to short))

(define push scene
  (process initial description
    (and
      (establish
        (relationship (relationship-of hare tortoise)))
      (establish
        (emotional-state tortoise
          (joy (negative medium))))
      (establish
        (emotional-state hare (pride (positive low))))
      (convey
        (undoes tortoise
          (from-scene push
            (convey (pushes hare tortoise)))))))
  (set your mood to (changes hopeful depressing))
  (set your rhythm to (changes fast slow))
  (set your length to medium))

(define determination scene
  (process initial description
    (and (establish (personality tortoise))
      (establish
        (emotional-state tortoise
          (joy (positive medium))))
      (convey
        (causes hare
          (change
            (personality tortoise (and shy unfriendly))
            (personality tortoise
              (and determined good)))))))
  (set your mood to (changes hopeful depressing))
  (set your rhythm to (changes fast slow))
  (set your length to short))

(define ashamed scene
  (process initial description
    (and
      (establish
        (emotional-state tortoise
          (joy (positive high))))
      (establish
        (emotional-state hare (pride (negative high))))))
  (set your mood to joyous)
  (set your rhythm to normal)
  (set your length to short))

(define aftermath scene
  (process initial description
    (and
      (establish
        (emotional-state hare (joy (negative low))))
      (establish
        (emotional-state tortoise
          (pride (positive high))))))
  (set your mood to normal)
  (set your rhythm to normal)
  (set your length to short))

(define end scene
  (process initial description
    (and
      (establish
        (relationship (relationship-of hare tortoise)))
      (convey
        (causes tortoise
          (change
            (relationship
              (relationship-of hare tortoise) hates)
            (relationship
              (relationship-of hare tortoise) loves))))))
  (set your mood to normal)
  (set your rhythm to normal)
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
    (tortoise determination ashamed
      (relationship-of tortoise hare)
      (relationship-of hare tortoise))))

(compile-actors)

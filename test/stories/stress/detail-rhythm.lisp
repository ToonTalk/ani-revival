;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: by-the-bridge = By the Bridge; on-the-bridge = On the Bridge; under-the-bridge = Under the Bridge
;; A stress story for a few of the "myriad details" (DETAIL, README.md here): three
;; scenes, each with a rhythm CINDY's scenes don't use, slow, picking-up and
;; (changes slow fast) (cindy.46:81, 90, 104 use slow and picking-up in scenes Ken
;; commented out). In each the troll chases the goat and she is sad. With DETAIL the
;; rhythm suggests changes of speed (REVIVE;DTRHYM): By the Bridge slows both of them in
;; each subscene, On the Bridge speeds up whoever moves in its last subscene (picking-up
;; is (changes normal fast)), and Under the Bridge slows them in its first and speeds
;; them up in its last; each a note, rhythm-speed, on the subscene. In 1978, and with
;; MEND, a scene's rhythm is never read.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define troll character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean strong))))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define by-the-bridge scene
	(process initial description
		 (sequence: (convey (chases troll goat))
			    (establish (emotional-state goat (joy (negative low))))))
	(set your rhythm to slow)
	(set your length to short))

(define on-the-bridge scene
	(process initial description
		 (sequence: (convey (chases troll goat))
			    (establish (emotional-state goat (joy (negative low))))))
	(set your rhythm to picking-up)
	(set your length to short))

(define under-the-bridge scene
	(process initial description
		 (sequence: (convey (chases troll goat))
			    (establish (emotional-state goat (joy (negative low))))))
	(set your rhythm to (changes slow fast))
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define detail-rhythm-film film
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
      (goat on-the-bridge (relationship-of troll goat))))

(compile-actors)

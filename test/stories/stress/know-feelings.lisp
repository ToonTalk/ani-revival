;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge; after = After
;; A stress story for the revival's knowledge (KNOW, README.md here): the feelings KNOW
;; adds, on the goat-and-troll skeleton. In On the Bridge the troll is proud, with no
;; joy (so nothing but pride loads EMOTE), and the goat is sad and afraid at once (joy
;; and fear both change her speed and acceleration, with opposite signs, so COSUG's
;; combine, as REVIVE;MEND7 repairs it, finds them in conflict). In After the troll is
;; angry and the goat lonely and, as Ken wrote his pre-meeting scene (cindy.46:121),
;; anticipating, with plain levels. In 1978 Ani passes over every feeling but joy
;; (ask-if-exists, sugest.123:38), and pass 2 stops on Ken's wander-around, which a
;; scene of feelings alone asks for (MEND's M9); with MEND alone, joy is shown and the
;; rest are passed over.

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

(define on-the-bridge scene
	(process initial description
		 (and (establish (emotional-state troll (pride high)))
		      (establish (emotional-state goat (and (joy (negative high)) (fear high))))))
	(set your rhythm to normal)
	(set your length to medium))

(define after scene
	(process initial description
		 (and (establish (emotional-state troll (anger (positive medium))))
		      (establish (emotional-state goat (and (loneliness high) (anticipation low))))))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define know-feelings-film film
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
      (goat on-the-bridge after (relationship-of troll goat))))

(compile-actors)

;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); wizard = the wizard (he); witch = the witch (she)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for APPEAR's colors (README.md here): two magical characters, so two
;; suggest purple (REVIVE;APSUG), and the film's variety, which suggests a hue no one
;; has yet for each, meets the second's purple in the semantic net of hues
;; (REVIVE;COLORS hue-net: a step apart, a conflict CHOOSE resolves; two steps apart,
;; a compromise; opposite, a conflict); the evil witch is drawn dark, as "bad guys wear
;; black" (p. 161). Without APPEAR it is the skeleton story with two more characters.

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

(define wizard character
	(process initial description
		 (physical magical)
		 (personality (and good kind))))

(define witch character
	(process initial description
		 (physical (and ugly magical))
		 (personality (and evil mean))))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define on-the-bridge scene
	(process initial description
		 (and (establish (personality troll))
		      (establish (emotional-state goat (joy (negative medium))))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define appear-hues-film film
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

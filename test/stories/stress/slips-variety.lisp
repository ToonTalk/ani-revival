;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the corrections of slips in Ken's files (SLIPS, README.md here):
;; the film's level of variety is high, where every story so far, Ken's Cinderella
;; among them, has medium. The variety suggests a value for each choice, "if the
;; variety level is high pick the least used value for that element" (thesis p. 85,
;; L2384-2387), but Ken's pick-value-with-variety sorts the counts so that high picks
;; the most used (glosug.41:61-70). With SLIPS (S12) high picks the least used, as his
;; comment and the thesis say, and each element whose pick differs is noted
;; (variety-pick). In 1978, and with MEND, high picks the most used.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical physically-weak)
		 (personality (and shy kind))))

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
		 (sequence: (convey (chases troll goat))
			    (establish (emotional-state goat (joy (negative low))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define slips-variety-film film
	(set your level of variety to high)
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

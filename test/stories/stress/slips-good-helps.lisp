;; -*-lisp-*-
;; cast: goat = the goat (she); kid = the kid (he); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for the corrections of slips in Ken's files (SLIPS, README.md here):
;; the goat is good and friendly, and the scene establishes her personality, with the
;; kid, who is weak and good, and the troll, who is neither, taking part in it. good's
;; helping asks is-not for someone "ideally ... described as weak and good" (thesis
;; p. 100, L2757-2770; dscrp.17:140-145). In 1978, and with MEND, is-not is given the
;; task as its scene and finds no one (sugest.123:333-335, scene.9:380), so neither
;; good's helping nor friendly's giving finds anyone to help or give to, and she shows
;; her goodness by nothing. With SLIPS, is-not looks in the scene (S1) and prefers
;; the kid, weak and good both (S2, "all"), so the goat helps him (KNOW's helps-along);
;; friendly's giving now finds the other too, and then asks is-desired-by, which no
;; file defines: no present, and the suggestion is given up (no-such-generator).

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good friendly))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical physically-weak)
		 (personality (and weak good))))

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

(define (relationship-of goat kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid goat) relationship
	(process initial description
		 is-polite-to))

(define on-the-bridge scene
	(process initial description
		 (and (establish (personality goat))
		      (establish (emotional-state kid (joy (negative low))))
		      (establish (emotional-state troll (joy (positive low))))))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define slips-good-helps-film film
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

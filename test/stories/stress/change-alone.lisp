;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he)
;; scenes: on-the-bridge = On the Bridge; made-over = Made Over; afterwards = Afterwards
;; A stress story for REVIVE;CHSHOW (README.md here), a change with no cause: the troll
;; chases the goat; then he becomes beautiful, by himself, so Ani shows the change as
;; he wanders about, changing gradually (thesis p. 169: an abrupt change "could easily
;; be misinterpreted"): beautiful tells graceful (char.2:13-20), so how he moves changes,
;; and with APPEAR how he looks. Afterwards he is shown as he has become. Without CHANGE
;; a change standing alone stops pass 1, as CHANGE's README says.

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
		 (convey (chases troll goat)))
	(set your rhythm to normal)
	(set your length to short))

(define made-over scene
	(process initial description
		 (convey (change (physical troll ugly)
				 (physical troll beautiful))))
	(set your rhythm to normal)
	(set your length to short))

(define afterwards scene
	(process initial description
		 (establish (personality troll)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define change-alone-film film
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
      (goat made-over (relationship-of troll goat))))

(compile-actors)

;; -*-lisp-*-
;; cast: goat = the goat (she); troll = the troll (he); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge; reunion = Reunion
;; A stress story for the revival's repairs (README.md here): the goat walks her kid
;; over the bridge and the troll sends her off, (alone troll kid); in the next scene
;; the kid meets her again. CONVEY shows (meets a b) with the display method move-to
;; (convey.64:73-80), which DISPLY never defines, so pass 2 of the Reunion stops with
;; NO-SUCH-ACTOR. With REVIVE;MEND5's move-to, the goat starts the Reunion where the
;; last scene left her, off the stage, and is brought on first; Ani has to know that
;; while she chooses, from the POSIT file, or the meeting is allotted only the kid's
;; walk and filmed in a second.

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

(define kid character
	(process initial description
		 (physical beautiful)
		 (personality kind)))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 is-tolerant-of))

(define (relationship-of troll kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid troll) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of goat kid) relationship
	(process initial description
		 is-polite-to))

(define (relationship-of kid goat) relationship
	(process initial description
		 is-polite-to))

(define on-the-bridge scene
	(process initial description
		 (sequence: (convey (accompanys goat kid))
			    (convey (alone troll kid))))
	(set your rhythm to normal)
	(set your length to medium))

(define reunion scene
	(process initial description
		 (convey (meets kid goat)))
	(set your rhythm to normal)
	(set your length to short))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define meets-offstage-film film
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

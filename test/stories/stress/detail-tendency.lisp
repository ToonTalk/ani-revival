;; -*-lisp-*-
;; cast: goat = the goat (she); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for a few of the "myriad details" (DETAIL, README.md here): the goat
;; is shy and the kid friendly, and they have no relationship, so each is a stranger to
;; the other (stranger-of, sugest.123:341-354). The scene conveys their getting it on,
;; which CONVEY shows by alternately turning or by repeatedly coming in contact
;; (convey.64:220-232). With DETAIL, coming in contact is at its best only if each is
;; drawn to the other (REVIVE;DTTEND): shy has the goat strongly avoid strangers
;; (dscrp.17:66), the kid's friendly draws him to them (with SLIPS' S3; without it his
;; tendency comes from his other words), so one clause is not met and the other met, and
;; the score of each way, and each tendency's note, says so. In 1978, and with MEND,
;; the tendencies are never read after pass 1.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and shy good))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical physically-weak)
		 (personality (and friendly kind))))

(define on-the-bridge scene
	(process initial description
		 (convey (getting-it-on goat kid)))
	(set your mood to normal)
	(set your rhythm to normal)
	(set your length to long))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define detail-tendency-film film
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
      (goat on-the-bridge kid)))

(compile-actors)

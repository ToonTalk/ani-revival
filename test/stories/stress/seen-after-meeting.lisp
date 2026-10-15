;; -*-lisp-*-
;; cast: goat = the goat (she); kid = the kid (he)
;; scenes: on-the-bridge = On the Bridge
;; A stress story for REVIVE;SEEN (README.md here), the form of the end of Ken's Meeting
;; (cindy.46:129-138): the kid meets the goat, and then both are happy. The joys' part has
;; only changes, so SCENE extends the meeting by its time (scene.9:216-240); the kid's walk
;; to her (REVIVE;MEND5's move-to) ends before the joys do, Director running a change at
;; high speed four times longer than Ani planned (dichar.103:102-121), and without SEEN no
;; one moves while they run. With SEEN each wanders, once the walk has ended, until her
;; joy has.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical strong)
		 (personality (and good friendly))))

(define (relationship-of kid goat) relationship
	(process initial description
		 loves))

(define (relationship-of goat kid) relationship
	(process initial description
		 loves))

(define on-the-bridge scene
	(process initial description
		 (sequence: (convey (meets kid goat))
			    (and (establish (emotional-state goat (joy (positive high))))
				 (establish (emotional-state kid (joy (positive high)))))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read))) ;;dont want the side effects upon (... level) lost

(define seen-after-meeting-film film
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
      (goat on-the-bridge (relationship-of kid goat))))

(compile-actors)
;; -*-lisp-*-
;; cast: giant = the giant (he); girl = the girl (she); ogre = the ogre (he)
;; scenes: introduction = Introduction
;; A stress story for the revival's knowledge (KNOW, README.md here), the first scene of
;; a reviewer's gentle giant, every character described with KNOW's words. The girl is
;; friendly and brave: she helps the giant, whom she likes (helps-along), and goes after
;; the ogre, her enemy (chases-to); the giant, helpful towards her, helps her along too.
;; KNOW's trying-alone, the few slow steps of the one helped, once walked to a moving
;; target, (small-way-from (vicinity-of girl) (good-distance-from (vicinity-of girl))),
;; which left her there for the chase; INTERF can measure from a small-way-from only to
;; its two anchors, so the chase's estimate stopped pass 2 (break
;; small-way-from-cant-do-yet, interf.149:336-342). The walk now goes to a place fixed
;; as it starts (REVIVE;KNOWDI).
(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define giant character
	(process initial description
		 (physical (and physically-strong old))
		 (personality (and gentle kind timid))
		 (role-in-story most-important)))

(define girl character
	(process initial description
		 (physical (and young pretty))
		 (personality (and curious brave friendly))))

(define ogre character
	(process initial description
		 (physical ugly)
		 (personality (and cruel rough wicked))))

(define (relationship-of giant girl) relationship
	(process initial description
		 (and is-helpful-towards is-protective-to)))

(define (relationship-of girl giant) relationship
	(process initial description
		 (and likes is-grateful-to)))

(define (relationship-of ogre girl) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of girl ogre) relationship
	(process initial description
		 fears))

(define (relationship-of giant ogre) relationship
	(process initial description
		 dislikes))

(define introduction scene
	(process initial description
		 (sequence:
		  (and (establish (personality giant))
		       (establish (personality girl)))
		  (establish (relationship (relationship-of giant girl)))))
	(set your mood to normal)
	(set your rhythm to slow)
	(set your length to medium))

(declare (coutput (read)))

(define help-then-chase-film film
	(set your level of variety to medium)
	(set your level of complexity to low)
	(set your level of originality to low)
	(set your film-length to (interval (minutes 2) (minutes 5)))
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
	     (giant introduction (relationship-of giant girl))))

(compile-actors)

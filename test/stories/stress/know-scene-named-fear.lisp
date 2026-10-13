;; -*-lisp-*-
;; cast: goat = the goat (she); kid = the kid (he); troll = the troll (he)
;; scenes: fear = Fear
;; A stress story for the revival's knowledge (KNOW, README.md here), from a reviewer of
;; KNOW: a scene called fear. With KNOW, fear is a feeling EMOTE defines once it loads,
;; and the feeling's definition replaced the scene, which stopped pass 2. The story's
;; scene is renamed fear-scene before Ani reads it (src/pipeline.js storyWithoutClashes),
;; its title kept. As in 1978, with no feeling called fear, nothing is renamed.

(include |ai:ken;declar >|)

(defcomment cindy) ;for tags

(define goat character
	(process initial description
		 (physical beautiful)
		 (personality (and good kind))
		 (role-in-story most-important)))

(define kid character
	(process initial description
		 (physical beautiful)
		 (personality (and good friendly))))

(define troll character
	(process initial description
		 (physical (and ugly physically-strong))
		 (personality (and mean strong))))

(define (relationship-of troll goat) relationship
	(process initial description
		 (and dominates hates)))

(define (relationship-of goat troll) relationship
	(process initial description
		 fears))

(define (relationship-of kid goat) relationship
	(process initial description
		 loves))

(define (relationship-of goat kid) relationship
	(process initial description
		 loves))

(define fear scene
	(process initial description
		 (sequence:
		  (establish (emotional-state goat (joy (negative high))))
		  (convey (chases troll goat))))
	(set your rhythm to normal)
	(set your length to medium))

(declare (coutput (read)))

(define scene-named-fear-film film
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
      (goat fear (relationship-of goat troll))))

(compile-actors)

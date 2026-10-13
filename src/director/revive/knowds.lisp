;;; -*-lisp-*-
;;; REVIVE;KNOWDS: words for characters Ken could have added, written as DSCRP.
;;;
;;; This file is ours, not Ken's. It is part of KNOW (src/pipeline.js, EXTENSIONS;
;;; REVIVE;KNOW says what KNOW is and how each piece is judged). The words are defined
;;; as DSCRP defines Ken's (dscrp.17:62-269), once DSCRP has loaded, and linked as his
;;; are (dscrp.17:273-295). Every word here is the revival's, and each says why above
;;; its definition, in a ";;why:" line that tools/know-index.mjs reads for the glass box.
;;;
;;; Two kinds of word:
;;;  - Words that borrow. timid, wicked and cruel are a neighbor of one of Ken's words
;;;    and have no suggestions of their own. Pass 1 gives a timid character shy's
;;;    suggestions for how it moves, with the source (neighbor-of timid shy), as it gives
;;;    an industrious one hard-working's (cosug.215:22-65); and with KNOW pass 2 gives it
;;;    shy's ways of showing it (REVIVE;KNOW). "The descriptors are linked to each other
;;;    by "opposite" and "similar" links and these are used for both comparisons and
;;;    indirect sources of suggestions" (AI-TR-540 p. 83, L2342-2344).
;;;  - Words with suggestions of their own, in pairs of opposites as Ken pairs shy and
;;;    brazen (dscrp.17:274): one word of each pair has the suggestions, and its opposite
;;;    takes them, reversed, through Ken's opposite links, as brazen takes shy's
;;;    (cosug.215:68-83). Some have a way of establishing themselves too (pass 2).
;;;
;;; The words linked to words CINDY uses (timid, wicked and cruel here, and KNOWRL's
;;; dislikes) have no suggestions of their own, and none with suggestions of its own is
;;; linked to any word CINDY uses, so Ken's Cinderella makes the same 102 choices in
;;; pass 1 (CP 29): her words' neighbors and opposites suggest nothing new. DESCRIPTOR
;;; spreads a link to the neighbors' neighbors and the opposites' opposites
;;; (char.2:111-131), so wicked, a neighbor of evil, becomes an opposite of good and kind
;;; too, and timid an opposite of brazen and forward; test/know.test.js checks the rule
;;; on the live links. Physical
;;; words for how a character looks belong to REVIVE;APSUG, not here; old and young are
;;; here for how a character moves.

(defun teach-the-revivals-words ()
  (let ((:insert-methods-at-end nil))

;;; ------------------------------------------------- words with suggestions of their own

;;why: Michotte found that "slow motion conveyed gentleness" and rapid movement violence (AI-TR-540 p. 159, L4189-4190; and p. 103, L2821-2822): a gentle character moves slowly, eases into moving and keeps its paths smooth
(define gentle personality-character-descriptor
 (process suggestions
	  (for speed low strength medium)
	  (for acceleration low strength medium)
	  (for path-jaggedness low strength medium)))

;;why: Michotte: "Sudden and repeated variations of direction, or even merely of speed, give the impression of "nervousness" or "agitation"" (AI-TR-540 p. 103, L2823-2825; p. 159, L4191-4192): a nervous character jags and lurches, and doesn't act deliberately
(define nervous personality-character-descriptor
 (process suggestions
	  (for path-jaggedness high strength high)
	  (for acceleration high strength medium)
	  (for deliberateness low strength low)))

;;why: cheerfulness is joy that lasts: Ken's joy raises how active and rhythmic a character is (emote.9:11-30), and great joy curves its paths (emote.9:37-48); a cheerful character moves so all the time
(define cheerful personality-character-descriptor
 (process suggestions
	  (for activity-level high strength medium)
	  (for rhythmic-level high strength medium)
	  (for path-curvature high strength low)))

;;why: the thesis names clever as a word that could be added (AI-TR-540 p. 19, L660-662); a clever character knows what it is doing, so it acts deliberately and goes straight to what it wants
(define clever personality-character-descriptor
 (process suggestions
	  (for deliberateness high strength medium)
	  (for path-curvature low strength low)))

;;why: a brave character is drawn towards danger, not away from it, as shy is drawn away from strangers (dscrp.17:65-66), and acts deliberately; it shows it by going after its enemy, as mean does (dscrp.17:252-259)
(define brave personality-character-descriptor
 (process suggestions
	  (for attraction-towards-enemies (positive low) strength high)
	  (for deliberateness high strength medium)
	  (for (establish ?character brave)
	       '(method: type convey
			 value (bind ((other
				       (character-that-satisfies
					(enemy-of ,character nil))))
				     (chases ,character `other)))
	       strength 'medium)))

;;why: a coward runs from its enemy: Michotte's viewers saw it "as though B was afraid when A approached, and ran off" (AI-TR-540 p. 158, L4157); how it moves it takes from brave, its opposite
(define cowardly personality-character-descriptor
 (process suggestions
	  (for (establish ?character cowardly)
	       '(method: type convey
			 value (bind ((other
				       (character-that-satisfies
					(enemy-of ,character nil))))
				     (avoids ,character `other)))
	       strength 'high)))

;;why: a curious character is drawn to what it doesn't know, the other way from shy's strong avoidance of strangers (dscrp.17:66, 68-74), and shows it by going to meet a stranger
(define curious personality-character-descriptor
 (process suggestions
	  (for attraction-towards-strangers (positive high) strength high)
	  (for (establish ?character curious)
	       '(method: type convey
			 value (bind ((other
				       (character-that-satisfies
					(stranger-of ,character nil))))
				     (meets ,character `other)))
	       strength 'medium)))

;;why: play is lively, bouncy and roundabout: a playful character moves in rhythm, does a lot and takes curved paths
(define playful personality-character-descriptor
 (process suggestions
	  (for rhythmic-level high strength medium)
	  (for path-curvature high strength medium)
	  (for activity-level high strength low)))

;;why: Ken lets a physical word decide how a character moves, as beautiful makes it graceful (char.2:13-20); an old character moves slowly, eases into moving and does less
(define old physical-character-descriptor
 (process suggestions
	  (for speed low strength low)
	  (for acceleration low strength medium)
	  (for activity-level low strength medium)))

;;why: Ani had no word for a character that moves slowly, and her words for one that works hard or holds on, hard-working and determined, suggest that it be not slow (dscrp.17:78, 241), so a slow, plodding character came out fast (as the film page's tortoise did); a word for how a character moves, as graceful is (dscrp.17:91-100)
(define slow movement-character-descriptor
 (process suggestions
	  (for speed low strength high)))

;;; ------------------------------------------------- words that take another's

;; Each is defined, as Ken defines bad, "(define bad personality-character-descriptor)
;; ;;should get most from its neighbor" (dscrp.17:183), and takes its suggestions from
;; the word it is linked to below: an opposite's reversed, a neighbor's as they are.

;;why: the opposite of gentle: Michotte found that "rapid movement gives an impression of violence" (AI-TR-540 p. 159, L4189-4190), so a rough character moves fast, lurches into moving and jags
(define rough personality-character-descriptor)

;;why: the opposite of nervous: steady, unhurried and deliberate
(define calm personality-character-descriptor)

;;why: the opposite of cheerful: joy that has gone, for good
(define gloomy personality-character-descriptor)

;;why: the opposite of old: lively and quick to move
(define young physical-character-descriptor)

;;why: the opposite of slow, for a character such as the hare
(define quick movement-character-descriptor)

;;why: a timid character is a shy one, so it takes shy's suggestions, as industrious takes hard-working's (dscrp.17:277)
(define timid personality-character-descriptor)

;;why: a wicked character is an evil one, so it takes evil's suggestions
(define wicked personality-character-descriptor)

;;why: a cruel character is a mean one, so it takes mean's suggestions
(define cruel personality-character-descriptor)

;;; ------------------------------------------------- links

;; As DSCRP's (dscrp.17:273-295). DESCRIPTOR spreads each to the neighbors' neighbors
;; and the opposites' opposites (char.2:111-131).
(progn
 (ask gentle add rough to your list of opposites)
 (ask nervous add calm to your list of opposites)
 (ask cheerful add gloomy to your list of opposites)
 (ask brave add cowardly to your list of opposites)
 (ask old add young to your list of opposites)
 (ask slow add quick to your list of opposites)
 (ask shy add timid to your list of neighbors)
 (ask evil add wicked to your list of neighbors)
 (ask mean add cruel to your list of neighbors))))

(+after-load '|ken;dscrp >| '(revival-once 'know-words 'teach-the-revivals-words))

;; Each is a top-level actor of DSCRP's once DSCRP has loaded, so the tags give it DSCRP
;; as its file, as load.33 fills them for Ken's (src/director/tags/ani.lisp): exists?
;; then knows the word before DSCRP has loaded (REVIVE;MEND3 leaves out a word that
;; doesn't exist), and asking it loads DSCRP, which defines it.
(mapc (function (lambda (word) (putprop word '|KEN;DSCRP| 'actor-load)))
      '(gentle rough nervous calm cheerful gloomy clever brave cowardly curious playful
	old young slow quick timid wicked cruel))

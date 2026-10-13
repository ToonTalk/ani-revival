;;; -*-lisp-*-
;;; REVIVE;KNOW: knowledge Ken could have added, and a word's neighbors sharing theirs.
;;;
;;; This file is ours, not Ken's. KNOW (src/pipeline.js, EXTENSIONS; reports/chapter-x/
;;; PLAN.md, "Item 4, part 2: KNOW") adds knowledge to Ani, each piece in the idiom of
;;; the file of Ken's it extends, read in after that file loads:
;;;   REVIVE;KNOWDS  words for characters, written as DSCRP;
;;;   REVIVE;KNOWRL  relationships, written as RELATE (and likes, PREREQ's);
;;;   REVIVE;KNOWCV  ways of showing helps, avoids and follows, written as CONVEY;
;;;   REVIVE;KNOWDI  the display methods those show them by, written as DISPLY;
;;;   REVIVE;KNOWEM  feelings, written as EMOTE.
;;; This file holds what they share: a word that has no way of showing itself borrows
;;; its neighbors' (below).
;;;
;;; "There is no reason to think that similar words not currently known to Ani, such as
;;; "clever", "fears", "textured", or "helps" could not be added" (AI-TR-540 p. 19,
;;; L660-662). Ken's test for each addition is his own: "The only legitimate changes
;;; that can be made so that Ani makes choices more to my liking are to add obvious
;;; information that was lacking or was too inaccurate ... The only other change that
;;; is legitimate to make to Ani is to take factors into consideration that obviously
;;; should have been but weren't"; anything else "would constitute cheating in that I
;;; would be arranging for Ani to do what I want without improving the reasoning"
;;; (p. 189, L4939-4944 and its footnote, L4952-4954). So nothing here removes or
;;; penalizes an option of Ken's, and nothing is here to make Cinderella come out one
;;; way. Each piece says where it comes from: the thesis (with its page and line in
;;; sources/text/AITR-540.txt) or Ken's code, or, for knowledge the thesis doesn't
;;; state, a ";;why:" line with the revival's reason (Ken's decision of 9 October 2026,
;;; reports/chapter-x/PLAN.md, "Decisions" 4). tools/know-index.mjs reads those lines,
;;; so the glass box can mark each suggestion that comes from the revival's knowledge.
;;;
;;; What KNOW does to Ken's Cinderella. Pass 1 makes CP 29's 102 choices, as in 1978:
;;; none of KNOW's words with suggestions of their own for how a character moves is a
;;; neighbor or opposite of a word CINDY uses, even after DESCRIPTOR spreads each link
;;; to the neighbors' neighbors and the opposites' opposites (char.2:111-131), and KNOW
;;; adds to CINDY's own words only ways of showing them (test/know.test.js checks the
;;; live links). Pass 2 changes, as reports/ext/know/README.md says: Ani now pulls off
;;; things her knowledge didn't let her in 1978.
;;;
;;; KNOW needs MEND (src/pipeline.js, requires): its display methods bring on a
;;; character who starts off the stage with REVIVE;MEND6's bring-on, as MEND5's move-to
;;; does; and its feelings, each changing how a character moves as joy does, are
;;; combined with joy by MEND7's repair of COSUG's combine (cosug.215:449-477).

;;; ------------------------------------------------- sharing with neighbors

;; "bad ... should get most from its neighbor" (dscrp.17:183). Pass 1 already lets a
;; word with no suggestions for how a character moves take its neighbors': CHAR asks
;; the character's descriptors for suggestions, then their neighbors, then their
;; opposites (cosug.215:22-65), and a neighbor's comes with the source (neighbor-of
;; word neighbor) and its own strength (cosug.215:84-88). Pass 2 asks only the words
;; themselves for a way of establishing them (sugest.123:54-85), so a word with none,
;; such as Ken's bad or kind, or KNOW's timid, suggests nothing to show. Here such a
;; word borrows each neighbor's way of establishing it, as pass 1 borrows: at the same
;; strength, with the source (neighbor-of word neighbor), and the element the task's
;; own, (establish goat timid) for shy's (establish goat shy). A word with any way of
;; its own borrows nothing, so CINDY's words, each of which either has its own (good,
;; friendly, hard-working, shy, mean, selfish, strong, evil, hates, dominates, loves,
;; and KNOW's is-obedient-to) or has no neighbor with any (is-tolerant-of, Cinderella's
;; other word for her stepmother), borrow nothing in her Introduction. (The fairy
;; godmother's kind would borrow good's, and the Prince's stubborn has determined, which
;; has none; but no scene of CINDY establishes their personalities.)
;;
;; This is narrower than pass 1's sharing, where every word's neighbors are a further
;; source of suggestions, whether the word has its own or not: a word here borrows only
;; if it has no way of its own. Ken's comment is about such a word, bad, which "should get
;; most from its neighbor" (dscrp.17:183), having none; and a word that has its own
;; already shows itself, so borrowing its neighbors' too would only put more convey tasks
;; in competition for the few CHOMET keeps (chomet.123:474-490), changing what Ken's
;; knowledge chose (in his Introduction, the stepmother's hates would gain dislikes'
;; avoiding).
;;
;; The borrowed suggestions come after the words' own, as pass 1 gathers neighbors'
;; after the words' own (film.17:47-49 orders the sources so; choose.198:134-150
;; gathers them). Ken's establish functions gather the words' own and hand them to
;; distill-suggestions (sugest.123:54-92), which has neither the descriptions nor the
;; character; so
;; the borrowed ones are worked out here, kept in :know-borrowed while Ken's function
;; runs, and added by distill-suggestions. An unknown word (REVIVE;MEND3 leaves it out)
;; has no neighbors to ask.

(or (boundp ':know-borrowed) (setq :know-borrowed nil))

(defun establish-personality-suggestions-borrowing (descriptions scene character)
  (let ((:know-borrowed (personality-suggestions-borrowed descriptions character)))
       (funcall (revival-wrapped 'establish-personality-suggestions 'know)
		descriptions scene character)))

(defun establish-relationship-suggestions-borrowing (descriptions scene relationship)
  (let ((:know-borrowed (relationship-suggestions-borrowed descriptions relationship)))
       (funcall (revival-wrapped 'establish-relationship-suggestions 'know)
		descriptions scene relationship)))

(defun distill-suggestions-with-borrowed (suggestions scene)
  (let ((borrowed :know-borrowed))
       (setq :know-borrowed nil) ;;once only, for the call it was worked out for
       (funcall (revival-wrapped 'distill-suggestions 'know)
		(cond (borrowed (append suggestions borrowed)) (t suggestions))
		scene)))

;; For a personality: each word with no way of establishing it of its own, (establish
;; character word), borrows its neighbors', (establish character neighbor).
(defun personality-suggestions-borrowed (descriptions character)
  (mapcan (function
	   (lambda (description)
		   (let ((word (get description 'descriptor)))
			(and (exists? word)
			     (null (establish-suggestions-of word (list 'establish character word)))
			     (mapcan (function
				      (lambda (neighbor)
					      (borrowed-suggestions
					       word neighbor
					       (list 'establish character word)
					       (list 'establish character neighbor))))
				     (ask ,word recall your neighbors))))))
	  descriptions))

;; For a relationship, (relationship-of a b): (establish (word a b)) borrows
;; (establish (neighbor a b)).
(defun relationship-suggestions-borrowed (descriptions relationship)
  (let ((character1 (second relationship))
	(character2 (third relationship)))
       (mapcan (function
		(lambda (description)
			(let ((word (get description 'descriptor)))
			     (and (exists? word)
				  (null (establish-suggestions-of
					 word (list 'establish (list word character1 character2))))
				  (mapcan (function
					   (lambda (neighbor)
						   (borrowed-suggestions
						    word neighbor
						    (list 'establish (list word character1 character2))
						    (list 'establish
							  (list neighbor character1 character2)))))
					  (ask ,word recall your neighbors))))))
	       descriptions)))

;; A word's suggestions for element, as Ken's establish functions ask for them
;; (sugest.123:59-64, 76-83).
(defun establish-suggestions-of (word element)
  (ask ,word collect items memorized matching
       (suggestion: element ,element value ? strength ? source ?)))

;; neighbor's suggestions for its-element, as word's for element: the same value and
;; strength, the source (neighbor-of word neighbor), one list for all of them, as one
;; source (CHOMET groups suggestions by source with assq, chomet.123:598-612).
(defun borrowed-suggestions (word neighbor element its-element)
  (and (exists? neighbor)
       (let ((source (list 'neighbor-of word neighbor)))
	    (mapcar (function
		     (lambda (suggestion)
			     (list 'suggestion: 'element element
				   'value (get suggestion 'value)
				   'strength (get suggestion 'strength)
				   'source source)))
		    (establish-suggestions-of neighbor its-element)))))

;; SUGEST's, wrapped once it has loaded (src/director/tags/ani.lisp: AUTOLOAD from
;; KEN;SUGEST); REVIVE;MEND3's wrapper of establish-personality-suggestions, which
;; leaves out unknown words, is inside this one.
(+after-load '|ken;sugest >|
  '(progn
    (revival-wrap 'establish-personality-suggestions 'know
		  'establish-personality-suggestions-borrowing)
    (revival-wrap 'establish-relationship-suggestions 'know
		  'establish-relationship-suggestions-borrowing)
    (revival-wrap 'distill-suggestions 'know 'distill-suggestions-with-borrowed)))

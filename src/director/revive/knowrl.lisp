;;; -*-lisp-*-
;;; REVIVE;KNOWRL: relationships Ken could have added, written as RELATE.
;;;
;;; This file is ours, not Ken's. It is part of KNOW (src/pipeline.js, EXTENSIONS;
;;; REVIVE;KNOW says what KNOW is and how each piece is judged). Two new relationship
;;; words, dislikes and fears, defined as RELATE defines Ken's (relate.22:20-102), once
;;; RELATE has loaded; ways of establishing two of Ken's own that had none,
;;; is-obedient-to and is-helpful-towards (relate.22:88, 102); and one for likes, which
;;; is Ken's prerequisite (prereq.19:110-120), once PREREQ has loaded. Each is the
;;; revival's, with a ";;why:" line above it that tools/know-index.mjs reads for the
;;; glass box.
;;;
;;; None has suggestions for the relative dynamics, as loves and dominates have
;;; (relate.22:21-27, 58-63), so none can move a choice of pass 1. Each is a way of
;;; showing the relationship, which pass 2 asks for (sugest.123:69-85). Cinderella's
;;; Introduction establishes her relationship to her stepmother, (and is-obedient-to
;;; is-tolerant-of) (cindy.46:22-24), where in 1978 "Ani has no idea how to establish
;;; that Cinderella is obedient towards and tolerant of her stepmother" (AI-TR-540
;;; p. 65, L1855-1857); with KNOW she follows her (reports/ext/know/README.md).

(defun teach-the-revivals-relationships ()
  (let ((:insert-methods-at-end nil))

;;why: the thesis names fears as a word that could be added (AI-TR-540 p. 19, L660-662); one who fears another keeps away from it, "as though B was afraid when A approached, and ran off" (p. 158, L4157), more surely than one who hates it (relate.22:42-45)
(define fears affection-relationship-descriptor
 (process suggestions
	  (for (establish (fears ?character ?other-character))
	       '(method: type convey
			 value (avoids ,character ,other-character))
	       strength 'high)))

;;why: PREREQ already reads dislikes as the other side of likes (prereq.19:117-118); one who dislikes another keeps away from it, as one who hates it may (relate.22:42-45)
(define dislikes affection-relationship-descriptor
 (process suggestions
	  (for (establish (dislikes ?character ?other-character))
	       '(method: type convey
			 value (avoids ,character ,other-character))
	       strength 'medium)))

;;why: in 1978 "Ani has no idea how to establish that Cinderella is obedient towards ... her stepmother" (AI-TR-540 p. 65, L1855-1857); one who obeys another goes where it goes, following it
(uncompiled-ask is-obedient-to process suggestions
		(for (establish (is-obedient-to ?character ?other-character))
		     '(method: type convey
			       value (follows ,character ,other-character))
		     strength 'medium))

;;why: one who is helpful towards another shows it by helping it, which REVIVE;KNOWCV shows (thesis: "helps" could be added, p. 19, L660-662)
(uncompiled-ask is-helpful-towards process suggestions
		(for (establish (is-helpful-towards ?character ?other-character))
		     '(method: type convey
			       value (helps ,character ,other-character))
		     strength 'medium))

(progn
 ;;why: to dislike is to hate, less
 (uncompiled-ask hates add dislikes to your list of neighbors))))

(+after-load '|ken;relate >| '(revival-once 'know-relationships 'teach-the-revivals-relationships))

;; likes is PREREQ's, a prerequisite friend-of looks for (sugest.123:357-363; prereq.19:
;; 110-120), not a relationship descriptor, so it has no process suggestions. Its way of
;; being established is given it as DESCRIPTOR's put-suggestion-in-source gives a
;; descriptor one (char.2:134-149): an if-asked-about item among its suggestion:
;; if-recalling-items.
(defun teach-likes-a-way-of-showing ()
  (let ((:insert-methods-at-end nil))

;;why: likes is what friend-of looks for, and loves, which likes counts (prereq.19:115-116), shows itself by accompanying (relate.22:28-32); liking is less, so a weaker suggestion
(uncompiled-ask likes add
		(if-asked-about
		 (suggestion: element {and ?the-full-element
					   (establish (likes ?character ?other-character))}
			      value ?
			      strength ?
			      source ?)
		 '(suggestion: element ,the-full-element
			       value (method: type convey
					      value (accompanys ,character ,other-character))
			       strength low
			       source likes))
		to your list of (suggestion: if-recalling-items))))

(+after-load '|ken;prereq >| '(revival-once 'know-likes 'teach-likes-a-way-of-showing))

;; dislikes and fears are top-level actors of RELATE's once RELATE has loaded, so the
;; tags give them RELATE as their file, as load.33 fills them for Ken's.
(mapc (function (lambda (word) (putprop word '|KEN;RELATE| 'actor-load)))
      '(dislikes fears))

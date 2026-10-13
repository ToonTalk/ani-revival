;;; -*-lisp-*-
;;; REVIVE;KNOWCV: ways of showing helps, avoids and follows, written as CONVEY.
;;;
;;; This file is ours, not Ken's. It is part of KNOW (src/pipeline.js, EXTENSIONS;
;;; REVIVE;KNOW says what KNOW is and how each piece is judged). CONVEY says how to show
;;; an action with a display method (convey.64:73-125); helps and avoids are Ken's, with
;;; none, and follows is new. Each suggests one of REVIVE;KNOWDI's display methods, as
;;; CONVEY's receivers suggest DISPLY's, once CONVEY has loaded; each is the revival's,
;;; with a ";;why:" line that tools/know-index.mjs reads for the glass box.
;;;
;;; kills is left out. Ken's footnote: "If the "kill" actor had been completed and It
;;; could run in the allotted time then it might be chosen" (AI-TR-540 p. 99, L2733-
;;; 2738), and leaving knowledge out is no cheating; but the reason here is that Ani
;;; has no notion of a character leaving a story for good (nor of the resurrection the
;;; footnote has the fairy godmother perform). gives, does, moves, takes, requests and
;;; refuses need things to give and take, which Ani doesn't have (char.2:11), and causes
;;; belongs to REVIVE;CHANGE.

(defun teach-the-revivals-ways-of-showing ()
  (let ((:insert-methods-at-end nil))

;;why: "Ani had decided to have Cinderella help the Prince (to show that she was friendly) but didn't know enough to pull it off and canceled it" (AI-TR-540 p. 65, L1857-1859); CONVEY has "for now don't have an suggestions as to how to convey this" (convey.64:127)
(define-receiver (yield suggestions for {and ?task (convey (helps ?helper ?helped))}) helps
 '((suggestion: element ,task
		value (method: type display
			       value (helps-along ,helper ,helped
						  (good-distance-from (vicinity-of ,helped))))
		strength high
		source helps)))

;;why: avoids is defined as a kind of prevents (convey.64:181), whose receiver asks for (prevents ...) by name (convey.64:167-179), so a task to show (avoids a b) had no way of being shown: shy's avoiding a stranger was dropped (AI-TR-540 p. 65, L1859-1860)
(define-receiver (yield suggestions for {and ?task (convey (avoids ?who ?other))}) avoids
 '((suggestion: element ,task
		value (method: type display
			       value (moves-away-from ,who ,other))
		strength high
		source avoids)))

;;why: following is moving after someone, a kind of moving as chasing is (convey.64:100)
(define follows moves)

;;why: one who follows another goes where it goes, keeping behind it
(define-receiver (yield suggestions for {and ?task (convey (follows ?follower ?leader))}) follows
 '((suggestion: element ,task
		value (method: type display
			       value (follows-behind ,follower ,leader))
		strength high
		source follows)))))

(+after-load '|ken;convey >| '(revival-once 'know-ways-of-showing 'teach-the-revivals-ways-of-showing))

;; follows is a top-level actor of CONVEY's once CONVEY has loaded, so the tags give it
;; CONVEY as its file, as load.33 fills them for Ken's.
(defprop follows |KEN;CONVEY| actor-load)

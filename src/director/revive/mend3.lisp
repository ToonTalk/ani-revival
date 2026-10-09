;;; -*-lisp-*-
;;; REVIVE;MEND3: M3, unknown words are skipped and named.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. A word Ani doesn't know (no actor of that name) is skipped, and named
;;; in a note on the task, as ask-if-exists already passes over an unknown emotion
;;; (sugest.123:38). "If parts are missing Ani manages to go on rather than stop"
;;; (AI-TR-540 L2733-2737).
;;;
;;; Where it stops. CHAR memorizes a character's personality words as the story gives
;;; them, known or not (char.2:80-84). Pass 1 makes a word it doesn't know a new
;;; descriptor, with nothing to suggest (cosug.215:28), so its choices are as if the
;;; word weren't there. Pass 2 starts afresh from the CP file, and
;;; establish-personality-suggestions asks each word for its suggestions
;;; (sugest.123:54-66): a word that is no actor stops it with NO-SUCH-ACTOR
;;; (test/stories/stress/unknown-word.lisp: "GRUMPY is not an actor"). Skipped, the word
;;; suggests nothing in pass 2 either.
;;;
;;; Relationship words need no repair: CHAR makes a relationship descriptor of any
;;; word it hasn't met (char.2:162-168), so establish-relationship-suggestions
;;; (sugest.123:69-85) always finds an actor. (Checked: a story whose troll "scorns"
;;; the goat films in 1978.)

;; The words that exist go to Ken's function; each that doesn't is named on the task.
;; exists? is what ask-if-exists asks (KEN1;DRECT, }^rsv.6:63-65): an actor, or a word
;; whose file the tags name, which the ask then loads. The "scene" here is the task:
;; an establish task passes itself (scene.9:378-381).
(defun establish-personality-suggestions-of-known-words (descriptions scene character)
  (funcall (revival-wrapped 'establish-personality-suggestions 'mend3)
	   (mapcan (function
		    (lambda (description)
			    (cond ((exists? (get description 'descriptor)) (list description))
				  (t (revival-note scene 'unknown-word (get description 'descriptor)
						   'skipped 'no-such-word)
				     nil))))
		   descriptions)
	   scene
	   character))

(+after-load '|ken;sugest >|
  '(revival-wrap 'establish-personality-suggestions 'mend3
		 'establish-personality-suggestions-of-known-words))

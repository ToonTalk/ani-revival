;;; -*-lisp-*-
;;; REVIVE;MEND15: M15, two goals that lead to each other.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. Finding where a character's current goal is, a goal that leads back to a
;;; character whose goal is already being found is taken as that character's own place,
;;; and the repair notes it.
;;;
;;; Where it stops. A place can be someone's current goal: (current-goal-of c) is
;;; where c is going, its goal found again (interf.149:259-271). Ken saw that a goal
;;; can mention its own character and made it stop there: "so I dont loop", the goal's
;;; (current-goal-of c) is taken as (vicinity-of c). Two characters' goals can lead to
;;; each other too. stands-guard plans a prisoner's escape away from the guarded place's
;;; goal and the guard's return to near the prisoner's goal (plan-stands-guard-cycle,
;;; disply.311:459-516); when the place being guarded is away from the guard himself,
;;; as in (prevents villagers (meets shepherd-boy villagers)), the prisoner's goal is
;;; reckoned from the guard's (interf.149:383-385) and the guard's from the prisoner's,
;;; and Director, finding either, finds the other for ever: the stack overflows while
;;; filming. A model's The Boy Who Cried Wolf (reports/llm-trials/2026-10-11
;;; gpt-6.1-sol/) gets there once REVIVE;MEND14 has set its fence aside for
;;; stands-guard.
;;;
;;; Why the character's own place. It is Ken's answer for a goal that leads to its own
;;; character, kept for one that leads there by way of another: what a goal is found
;;; from can't be the goal itself, and where the character is, is what (vicinity-of c)
;;; says. Only a goal that would be found for ever is touched; a chain of goals that
;;; ends, as in Ken's Cinderella's Kept Apart, is found as before.
;;;
;;; The note, on the subscene, or, in Director, which finds goals with no subscene, on
;;; the movie being filmed:
;;;   (revival-repair: what goal-loop was (current-goal-of villagers)
;;;		       now (vicinity-of villagers) because (its goal leads back to it))

;; The characters whose current goals are being found, outermost last.
(or (boundp ':revival-goals-being-found) (setq :revival-goals-being-found nil))

;; Ken's find-xy-position (interf.149:172-173), or, for the current goal of a character
;; whose goal is already being found, its own place. (find-xy-position is wrapped, not
;; current-goal-of's receiver extended: the goal found inside a goal is current-goal-of's
;; receiver asked again, and an extension's ask-old would pass over it there too.)
(defun find-xy-position-not-going-round (place subscene)
  (let ((character (and (not (atom place))
			(eq (first place) 'current-goal-of)
			(atom (second place))
			(second place))))
       (cond ((null character)
	      (funcall (revival-wrapped 'find-xy-position 'mend15) place subscene))
	     ((memq character :revival-goals-being-found)
	      (revival-note (or subscene (ask movie recall your current-movie) 'position)
			    'goal-loop
			    place
			    (list 'vicinity-of character)
			    '(its goal leads back to it))
	      (funcall (revival-wrapped 'find-xy-position 'mend15)
		       (list 'vicinity-of character) subscene))
	     (t (let ((:revival-goals-being-found (cons character :revival-goals-being-found)))
		     (funcall (revival-wrapped 'find-xy-position 'mend15) place subscene))))))

;; find-xy-position is INTERF's, so it is wrapped once INTERF has loaded.
(+after-load '|ken;interf >|
  '(revival-wrap 'find-xy-position 'mend15 'find-xy-position-not-going-round))

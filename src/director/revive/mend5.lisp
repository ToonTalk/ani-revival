;;; -*-lisp-*-
;;; REVIVE;MEND5: M5, missing display methods, and move-to.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. A suggested display method that doesn't exist is rejected with the
;;; reason no-such-display-method, as an unconveyable convey method is (sugcon.26:
;;; 69-74); variety-score asked the missing actor regardless (chomet.123:436-439).
;;; And CONVEY suggests move-to for (meets a b) (convey.64:73-80), which DISPLY never
;;; defines: it is defined here from DISPLY's own parts, with a time estimate that
;;; includes any walk onto the stage (AI-TR-540 L2392-2396).

;;; ------------------------------------------------- 1. no such display method

;; choose-a-display-method scores each display method suggested for a task
;; (chomet.123:216-255). score-suggestions asks for the method's time estimate only if
;; the method exists (get-estimated-time-of, chomet.123:448-460), but variety-score
;; asks the method for the tasks it was used in regardless (chomet.123:436-439), and a
;; method no file defines stops pass 2 with NO-SUCH-ACTOR. A convey method Ani has no
;; idea how to convey is set aside as a rejected suggestion with its reason
;; (sugcon.26:69-74); a display method that doesn't exist is set aside the same way,
;; with Ken's reject-suggestion (chomet.123:305-309), before the scoring.
;; exists? counts an actor whose file hasn't loaded yet as existing if the tags know
;; it (KEN1;DRECT), as they know each of DISPLY's (src/director/tags/ani.lisp) and
;; move-to below.
(defun score-suggestions-that-exist (suggestions task)
  (funcall (revival-wrapped 'score-suggestions 'mend5)
	   (mapcan (function
		    (lambda (suggestion)
			    (let ((method (get (get suggestion 'value) 'value)))
				 (cond ((exists? (first method)) (list suggestion))
				       (t (reject-suggestion
					   task suggestion
					   (list 'no-such-display-method (first method)))
					  (revival-note task 'no-such-display-method method
							'rejected 'not-defined)
					  nil)))))
		   suggestions)
	   task))

(+after-load '|ken;chomet >|
  '(revival-wrap 'score-suggestions 'mend5 'score-suggestions-that-exist))

;;; ------------------------------------------------- 2. move-to

;; CONVEY shows (meets a b) by (move-to a (vicinity-of b)) (convey.64:73-80); meeting is
;; "a special case of moving" (convey.64:65), and DISPLY, which has Ani's display
;; methods, has no move-to. It is made here from DISPLY's parts. Like
;; move-small-part-towards (disply.311:694-726) but all the way: to contact, as
;; goes-to-and-accompanys' goes-to-to-accompany goes (disply.311:204-213).
;;  - Its prerequisite, as move-small-part-towards', is that the mover can move there
;;    (disply.311:694-696; meets' own, convey.64:67).
;;  - The two are placed medium distance apart, as for hits and accompanying
;;    (disply.311:162-167, 235-240). So a mover with no place yet, when the other has
;;    one, comes on from off the stage: "X need not be on stage since it can come on
;;    and then meet Y" (AI-TR-540 L2392-2396).
;;  - "Among the prerequisites for X going to meet Y is that Y be on stage" (L2392-2396;
;;    meets' prerequisite on-stage, convey.64:66). One who starts off the stage first
;;    gets on it, with Ken's getting-on-stage step (REVIVE;MEND6's bring-on), and the
;;    mover then goes to meet them.
;;  - The estimate is the mover's walk to contact (estimate-time-to-move-character,
;;    place.45:524-538), from wherever the two start, so it includes any walk of the
;;    mover onto the stage; a third of the screen if they have no places yet, as for
;;    hits (disply.311:120-124); and the other's getting on the stage before it, if
;;    any (MEND6's plus-time-to-bring-on). Ani makes it while she chooses, before
;;    anyone has a place (run.65:49-53); whether the other will start off the stage is
;;    then read from where the last scene left her (MEND6's where-the-last-scene-left),
;;    so that the task is allotted time for her walk on. Allotted only the walk to
;;    contact, the Reunion of test/stories/stress/meets-offstage.lisp, where the kid
;;    meets the goat the last scene sent off, was given a second and filmed in five
;;    frames, the goat crossing a fifth of the screen in one.
;;  - At the end they are in contact: two characters' sizes apart, .05 each
;;    (dichar.103:10), for the next subscene (record-distance-estimates, as each of
;;    DISPLY's methods does).
;; Without move-to, Ani stopped on (meets a b); a subscene that uses it notes that the
;; method is the revival's, named in CONVEY.
(defun define-move-to ()
  (let ((:insert-methods-at-end nil))
       (define move-to display-method
	(add prerequisite for (move-to ?who ?where) (can-move ,who ,where)))
       (define-receiver (estimate time for move-to ?character ?place in ?subscene) move-to
	(let ((other (character-involved-in place)))
	     (plus-time-to-bring-on other character subscene
				    (time-to-go-to-meet character other subscene))))
       (define-receiver (run move-to ?character ?place in ?subscene stretched by ?factor) move-to
	(let ((other (character-involved-in place)))
	     (revival-note subscene 'defined-display-method 'not-defined
			   '(move-to ,character ,place) '(named-in convey))
	     (cond ((brings-on? other character subscene '(move-to ,character ,place))
		    (initial-locations-for-move-to character place subscene)
		    (let ((get-on-stage-plan (bring-on other character factor subscene 'move-to)))
			 (ask ,subscene
			      add (sequence: ,get-on-stage-plan
					     ,(go-to-meet character other factor subscene))
			      to your list of movements)))
		   (t (initial-locations-for-move-to character place subscene)
		      (ask ,subscene add ,(go-to-meet character other factor subscene)
			   to your list of movements)))
	     (record-distance-estimates '(distance-between (vicinity-of ,character)
							   (vicinity-of ,other))
					'(screen-fraction .1)
					subscene)))))

(defun initial-locations-for-move-to (character place subscene)
  (place-medium-distance-apart 'move-to
			       '(vicinity-of ,character)
			       place
			       nil ;;no need to cut
			       subscene))

;; The mover's walk to contact, as goes-to-to-accompany's (disply.311:204-213).
(defun go-to-meet (character other factor subscene)
  (move-character (activity-name-of 'goes-to-meet)
		  character
		  '(contact-with ,other by ,character)
		  'moving-target
		  '(stop-when-there (quote ,subscene))
		  0.0 ;;start right away
		  (divide-speed-by-factor character factor subscene)
		  'careful ;;of collisions
		  subscene))

(defun time-to-go-to-meet (character other subscene)
  (estimate-time-to-move-character character
				   '(contact-with ,other by ,character)
				   '(stop-when-there (quote ,subscene))
				   (special-dynamics-of character subscene)
				   subscene
				   .33))

;; move-to is a top-level actor of DISPLY's that DISPLY doesn't define, so the tags
;; give it DISPLY as its file, as they give DISPLY's own actors (src/director/tags/
;; ani.lisp, as load.33 fills them): exists? then knows it before DISPLY has loaded,
;; and asking it loads DISPLY, after which it is defined.
(defprop move-to |KEN;DISPLY| actor-load)

(+after-load '|ken;disply >| '(revival-once 'mend5-move-to 'define-move-to))

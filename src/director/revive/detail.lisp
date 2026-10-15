;;; -*-lisp-*-
;;; REVIVE;DETAIL: a few of the "myriad details".
;;;
;;; This file is ours, not Ken's. DETAIL (src/pipeline.js, EXTENSIONS; reports/chapter-x/
;;; PLAN.md, "Item 4, part 2: KNOW, SLIPS and DETAIL") attends to three of the low-level
;;; details the thesis names as left undone. "Even a charitable view of Ani reveals many
;;; low-level deficiencies. ... Here is a sample of real (but relatively minor)
;;; deficiencies of Ani" (AI-TR-540 p. 185, L4813-4817, "Attending to Myriad Details",
;;; X.B.3), and "Any one of these problems can fairly easily be rectified. The
;;; difficulty is that there are very many such minor problems each one of which takes
;;; a fair amount of programming" (p. 187, L4879-4881). It changes Ken's Cinderella, and
;;; is opt-in, as SLIPS is (Ken's decision 3 of 9 October 2026): the page's switch turns
;;; on MEND, KNOW, APPEAR and CHANGE. The written diff is reports/ext/detail/README.md.
;;;
;;; The details, each in a file of its own:
;;;   REVIVE;DTWALK  (f) "The degree of deliberateness of the movements of each of the
;;;           characters is determined by Ani. This should influence how often a
;;;           character changes direction, how quickly it does it, and how large the
;;;           change in direction is" (p. 186, L4853-4856); "Ani carefully determines how
;;;           "deliberate" a character's movements should be and then never takes that
;;;           into account in later decisions. It should at least influence things such
;;;           as how often, how quickly and to what extent the character in question
;;;           changes direction" (p. 83-84, L2346-2353). Director's walk now reads it.
;;;   REVIVE;DTTEND  (c) "The movement tendencies such as the tendency to avoid strangers,
;;;           should be used in the prerequisite and "best when" clauses of methods"
;;;           (p. 185, L4827-4829). The twelve tendencies pass 1 chooses, never read after
;;;           it, now decide whether a way of showing that brings one character to another
;;;           (or takes it away) is at its best, and so feed CHOMET's best-when scores.
;;;   REVIVE;DTRHYM  "Ani was built out of many actors that have very suggestive names such
;;;           as "level of subtlety", "deliberate", "rhythmic", "graceful", and so on. ...
;;;           The truth is that the meaning these words have to Ani is a pale reflection of
;;;           what they mean to people. There are three ways in which this can be improved
;;;           somewhat. (a) Add to each one the ability to suggest values and activities
;;;           (some do already)" (p. 183-184, L4778-4791). A scene's rhythm, which CINDY
;;;           gives four of the five scenes ("relative to the film's rhythm", cindy.46:61)
;;;           and which only its length beside it is read of today (scene.9:346-364),
;;;           suggests changes of speed, as an emotional state does. This one is not
;;;           among the sample of myriad details (X.B.3), but the first of the three
;;;           improvements X.B.2, "A Better Knowledge Base", names just before them; the
;;;           first design put it with DETAIL, and so does the plan.
;;;
;;; How each acts is the revival's reading of the thesis's sentence, and is labeled so
;;; where it is defined; the reasons are there. Each detail can be turned off on its own,
;;; for a diff of one at a time: (setq :detail-off '(walk tend rhythm)) before Ken's files
;;; load. Where a detail acts it leaves a note, through REVIVE;WRAP's revival-note, as
;;; MEND's repairs and SLIPS' corrections do:
;;;   deliberate-walk  on Director's subscene: Director's walk has no actor of its own,
;;;                    so the subscene of the walker's dynamics memorizes what DETAIL
;;;                    did to her walks there (the film's notes);
;;;   tendency         on the task whose ways of showing are scored, for each tendency
;;;                    that decided a best-when clause (the scene's glass box);
;;;   rhythm-speed     on the subscene, for each change of speed the rhythm suggested
;;;                    (the scene's glass box).
;;;
;;; DETAIL requires MEND (the design's rule for SLIPS, KNOW and DETAIL alike): a
;;; tendency or a deliberateness pass 1 leaves as (not X) or none is read as MEND reads
;;; it, and a new story needs MEND's repairs anyway. With CHANGE, a change of how a
;;; character moves now bridges her deliberateness too, since Director reads it
;;; (REVIVE;DTWALK); with SLIPS, the rhythm's changes run at the speed Ani planned, as
;;; every other change does.

(or (boundp ':detail-off) (setq :detail-off nil))

;; Whether detail id (walk, tend or rhythm) is to be attended to.
(defun detail-on? (id)
  (not (memq id :detail-off)))

;; A number rounded to two decimals, for a note.
(defun detail-rounded (x)
  (//$ (float (round (*$ (float x) 100.0))) 100.0))

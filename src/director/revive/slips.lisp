;;; -*-lisp-*-
;;; REVIVE;SLIPS: corrections of slips in Ken's files.
;;;
;;; This file is ours, not Ken's. SLIPS (src/pipeline.js, EXTENSIONS; reports/chapter-x/
;;; PLAN.md, "Item 4, part 2: KNOW, SLIPS and DETAIL") corrects slips in Ken's files:
;;; places where his code does something other than what the code beside it, his
;;; comments or his thesis say it is to do. Unlike MEND's repairs, which leave Ken's
;;; Cinderella byte for byte as it was, these change it. So SLIPS is a switch of its own,
;;; off by default (Ken's decision 2 of 9 October 2026): "Each correction quotes the line
;;; it corrects and comes with a written Cinderella diff; the DICHAR/DISPLY speed
;;; inversion goes in only if a run confirms it." The diffs are in
;;; reports/ext/slips/README.md. The site opens in 1978 mode, and the page's switch
;;; turns on MEND, KNOW, APPEAR and CHANGE; SLIPS is opt-in (decision 3).
;;;
;;; The legitimacy rule is Ken's own: "The only legitimate changes that can be made so
;;; that Ani makes choices more to my liking are to add obvious information that was
;;; lacking or was too inaccurate ... The only other change that is legitimate to make
;;; to Ani is to take factors into consideration that obviously should have been but
;;; weren't" (AI-TR-540 p. 189, L4939-4944). A slip corrected does what Ken's own code,
;;; comments or thesis say his code is to do; nothing here is there to make Cinderella
;;; come out one way.
;;;
;;; SLIPS requires KNOW (and MEND, which KNOW requires). S1 has good's helping find
;;; someone to help, and without KNOW's way of showing helping (REVIVE;KNOWCV) the
;;; helping is chosen and dropped, "no idea how to convey" it (sugcon.26:69-74).
;;;
;;; The corrections, each in a file of its own, each with Ken's line and the evidence:
;;;   S1, S2  REVIVE;SLIPS1  is-not looks in the task's scene, not in the task, and
;;;           is-described-as is a preference: all of the descriptors, then any of them,
;;;           then anyone (sugest.123:328-338, scene.9:373-381, sugest.123:402; thesis
;;;           L2757-2770); with what S1 newly reaches, a bind inside a bind and a
;;;           generator no file defines
;;;   S12     REVIVE;SLIPS2  a high level of variety picks the least used value, and a low
;;;           the most used (glosug.41:61-70; thesis L2384-2387)
;;;   S3      REVIVE;SLIPS3  friendly's attraction-to-* are attraction-towards-*
;;;           (dscrp.17:106-108; elemnt.1:101-105)
;;;   S6      REVIVE;SLIPS6  pass-prerequisite-test reads 'prerequisites (chomet.123:559;
;;;           sugcon.26:51, chomet.123:277)
;;;   S7      REVIVE;SLIPS7  MIDDLE's less-than reads (not bottom) (elemnt.1:171; 168)
;;;   S8      REVIVE;SLIPS8  Director multiplies a character's dynamics by their parent's
;;;           factors once, not again each time the same dynamics are set
;;;           (dichar.103:27-31)
;;;   S9      REVIVE;SLIPS9  Director's gradual change runs at the speed DISPLY estimates
;;;           it at: a high speed is quick (dichar.103:105-109; disply.311:1104-1106)
;;;   S10     REVIVE;SLIPS9  ... grows a factor once a tick, not twice where the dynamics
;;;           have it from the scene's (dichar.103:112-121; finding 1 of stage 6)
;;;   S11     REVIVE;SLIPS9  ... takes as many steps as it counts (dichar.103:117,
;;;           some.666:444-450)
;;;
;;; What SLIPS leaves alone, and why (reports/ext/slips/README.md has each):
;;;   S4      CINDY's is-protective-of (cindy.46:38), which RELATE doesn't know, is a
;;;           neighbor of RELATE's is-protective-to (relate.22:100). Ken's decision 10
;;;           (13 October) made this KNOW's knowledge (REVIVE;KNOWRL), so it is there
;;;           whenever SLIPS is, and SLIPS adds nothing to it.
;;;   S5      Parenthesis slips that change nothing until the knowledge they need is
;;;           added, documented with their corrected forms and not changed:
;;;            - good's prevents (dscrp.17:146-150) and selfish's takes (dscrp.17:189-194)
;;;              are second bindings with an empty body: (bind ((bad-thing ...)
;;;              (prevents ,character `bad-thing))) is meant as (bind ((bad-thing ...))
;;;              (prevents ,character `bad-thing)). Their generators, is-considered-bad-by
;;;              and not-owned-by, have no knowledge (sugest.123:400-406), so the
;;;              corrected forms would find nothing either.
;;;            - alone's and aware's strength and source sit inside method:
;;;              (convey.64:236-243, 247-256), so the suggestion has neither. Each is the
;;;              only suggestion for its task (the Meeting's and Justice's), and CHOMET
;;;              reads a missing strength as medium (chomet.123:276), so the choice is
;;;              the same; corrected, the printouts and glass boxes would differ.
;;;            - CINDY gives the Prince the personality word strong as a physical
;;;              description, (physical (and beautiful strong)) (cindy.46:42); DSCRP has
;;;              physically-strong for that (dscrp.17:232). No scene establishes his
;;;              personality, and the comparisons take strong as his, so nothing is lost.
;;;            - (relate.22:79, named in the first design, is not a slip: its strength
;;;              is at the depth of line 70's, outside method:, only indented oddly.)
;;;   CHOMET's redistribution of a scene's time, which changes nothing in Ken's
;;;   Cinderella (no task of hers is left without a way of showing for want of time):
;;;            - resurect-bad-time-fits looks for the reason more-time-needed:
;;;              (chomet.123:193), and time-fit-score-1 writes need-more-time:
;;;              (chomet.123:413), so a task whose only display method needs more time
;;;              is never given it. Cinderella's one such method (the Meeting's
;;;              repeatedly-come-in-contact) has another beside it, and the task takes
;;;              that.
;;;            - redistribute-time-for-tasks, for a scene the redistribution makes too
;;;              short, adjusts by (-$ new-length scene-minimum), less than nothing, and
;;;              for one too long by more than nothing (chomet.123:61-64); and
;;;              adjust-task-lengths gives a task whose time falls below its least its
;;;              most, ";;must be too large", and one above its most its least
;;;              (chomet.123:167-180). Read together the signs may be one convention, or
;;;              two slips; correcting the name alone would send more scenes into them.
;;;              Not corrected: for Ken (reports/ext/slips/README.md). Found by the stage
;;;              before this one (PLAN.md, "Still open with MEND").
;;;            - change-to:-package merges a change without its method (cosug.215:509):
;;;              REVIVE;MEND7 puts the method back, which leaves Cinderella as it was.
;;;   And one in Director, which changes nothing in Ken's Cinderella:
;;;            - The special dynamics a character's changes carry forth are found once
;;;              and kept (dichar.103:22-26, "or :old-value"), so in a later subscene a
;;;              change grows the dynamics of the subscene where her first change was,
;;;              which no longer move her; the change reaches her through its second
;;;              repeat, on her own dynamics. Ken's Cinderella has each character's changes
;;;              in one subscene of a scene (each scene is a job of its own), so nothing
;;;              differs; with DETAIL's rhythm she changes in several. Not corrected.
;;;
;;; The DICHAR/DISPLY speed inversion, run: tools/check-slips.mjs --speed films Ken's
;;; Cinderella as in 1978 and, for every gradual change Director runs, sets the ticks
;;; DICHAR gives it beside the time DISPLY estimated for it. At high speed every change
;;; runs four times as long as Ani planned (Kept Apart's stepmother's path-curvature by 4,
;;; 55 ticks, 13.75 seconds, against 3.47; the Meeting's and Justice's joys 16 ticks
;;; against 4.1), at low speed a quarter as long (the Introduction's joys 1 tick against
;;; 4.7, Cinderella's path-curvature in Kept Apart 14 ticks against 55.5), at medium the
;;; same. The run confirms it, so S9 is in (reports/ext/slips/README.md).
;;;
;;; Each correction can be turned off on its own, for a diff of one at a time
;;; (tools/check-slips.mjs): (setq :slips-off '(s9 s10)) before Ken's files load. A
;;; correction that acts leaves a note where it acted, through REVIVE;WRAP's
;;; revival-note: (revival-repair: what W was X now Y because R), W naming the
;;; correction (below each file says which), as MEND's repairs do. The glass box
;;; collects them: pass 1's (the choice points), each scene's glass box (its tasks),
;;; and the film's (Director's subscenes, where the corrections in Director act).

(or (boundp ':slips-off) (setq :slips-off nil))

;; Whether correction id (s1, s3, s6, s7, s8, s9, s10 or s11) is to be made.
(defun slip-on? (id)
  (not (memq id :slips-off)))

;; A Director subscene a character's special dynamics are of, for a note: the subscene
;; of (special-dynamics-of c in (subscene-of s n)), or of the nearest such ancestor of
;; dynamics named otherwise (an activity's, |(special-dynamics-of c in ...)-15-1|);
;; nil if there is none, or it is no actor.
(defun subscene-of-dynamics (dynamics)
  (do ((actor dynamics (and actor (ask ,actor recall your parent))))
      ((or (null actor) (eq actor 'special-dynamics)) nil)
      (and (not (atom actor))
	   (eq (first actor) 'special-dynamics-of)
	   (return (and (actor-of (fourth actor) dont-autoload) (fourth actor))))))

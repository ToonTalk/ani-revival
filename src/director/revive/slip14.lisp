;;; -*-lisp-*-
;;; REVIVE;SLIP14: S14, the film is not stopped while the part a part of changes
;;; extends is still running.
;;;
;;; This file is ours, not Ken's. It is part of SLIPS (REVIVE;SLIPS says what SLIPS is,
;;; and how each correction is judged), added after the review of stage 7 (its M4). It
;;; changes stories with SLIPS where a feeling's part ends before the activity it
;;; extends (reports/ext/slips/README.md); in Ken's Cinderella with SLIPS the part a
;;; feeling's part extends ends first, so nothing differs there.
;;;
;;; Ken's plan. A part with only changes "cannot stand alone" (AI-TR-540 pp. 125-126):
;;; SCENE extends the activity of the part before it by the changes' time, and has the
;;; part of changes begin when that part was to end before it was extended, a parasite
;;; on it (extend-last-actions-of, scene.9:223-240). The two are planned to end
;;; together: in the thesis's Kept Apart (b), the stepmother standing guard, is pages 91
;;; to 311, and (c), the two feelings, 205 to 311 (p. 66, L1886-1898).
;;;
;;; The slip. When a part ends, ACTION has Director stop the film the tick after, if
;;; nothing is running:
;;;
;;; (define-receiver (stop film if nothing running) director-subscene
;;;  (cond ((and (null (ask :self ask your scene to recall your running-subscenes))
;;;	      (null (ask default-universe recall your actors-to-run-next)))
;;;	 (ask movie ask your current-movie to stop filming))))	(action.152:88-91)
;;;
;;; asked by every part told a part has ended, with the comment ";;wait a tick so
;;; something can start now" (action.152:67-78). But neither list says what is running.
;;; A part's beginning is told to it and to the parts after it (action.152:39-40); told
;;; of its own beginning, a part places the characters, and only a later part that is
;;; not a parasite puts it on running-subscenes (action.152:54-66). So the part a part
;;; of changes extends, when that is the scene's last, is never on the list; and the
;;; universe's list of actors to run next is empty while the actors tick (REVIVE;BRIDGE,
;;; as SOME 1005 has it), so whether anything is planned depends on the order they
;;; tick in (stage 6's finding 6, reports/ext/change/README.md). So when the part of
;;; changes ends first, the film stops with the activity it extends still running:
;;; Jack's giant still pursuing him (11 frames, the chase running to frame 107 when the
;;; pride ends a tick earlier, as with KNOW), and in 1978 Kept Apart's guard, cut at
;;; frame 116 (the flipbook's Kept Apart, too, ends with the stepmother still standing
;;; guard). With SLIPS' S9 and S11 the feelings end at other ticks, and in more stories
;;; before the activity they extend (the review of stage 7's M4).
;;;
;;; The correction, in the way REVIVE;CHSHOW keeps the film going while a part that
;;; shows a change runs (stage 6's finding 7): the film is not stopped at the request of
;;; a part of changes while the part it extends has begun and not ended, as the movie
;;; keeps their events (action.152:53); that part, ending, asks again, as every part
;;; does (action.152:67-78). Only a parasite's request waits, and only for its own
;;; host, so Ken's other stops are as they were; and a part of changes cut short when
;;; the part it extends ends first (finding 6) is as it was.
;;;
;;; The note, on the part the film waited for, once:
;;;   (revival-repair: what film-waited-for-activity was stopped now kept-filming
;;;		     because ((subscene-of pursuit 2) ended at frame 9))

(defun teach-the-film-to-wait-for-the-part-extended ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (stop film if nothing running) director-subscene
	(let ((host (and (slip-on? 's14) (part-extended-still-running :self))))
	     (cond (host (note-the-film-waited-for-the-part host :self))
		   (t (ask-old :self stop film if nothing running)))))))

(+after-load '|ken;action >| '(revival-once 'slip14-film-waits 'teach-the-film-to-wait-for-the-part-extended))

;; If subscene is a part of changes that has ended, the part it extends (its status,
;; (parasite-on part), scene.9:228), if that part has begun and not ended, as the movie
;; keeps their events (action.152:53); else nil. (A part told a part has ended tells its
;; own parasites they have ended too, action.152:73-76, whichever part it was: a part of
;; changes is so told it has ended when the parts before it end, before it begins; its
;; request then is not its own end, and is Ken's.)
(defun part-extended-still-running (subscene)
  (let ((host (part-extended-by subscene))
	(movie (ask movie recall your current-movie)))
       (and host
	    (let ((began (ask ,movie recall your (beginning-of ,subscene)))
		  (ended (ask ,movie recall your (end-of ,subscene))))
		 (and began ended (not (< ended began))))
	    (ask ,movie recall your (beginning-of ,host))
	    (null (ask ,movie recall your (end-of ,host)))
	    host)))

(defun note-the-film-waited-for-the-part (host parasite)
  (or (ask ,host recall if any items match (revival-repair: what film-waited-for-activity %))
      (revival-note host 'film-waited-for-activity 'stopped 'kept-filming
		    (list (list parasite 'ended 'at 'frame
				(ask movie ask your current-movie to recall your
				     (end-of ,parasite)))))))

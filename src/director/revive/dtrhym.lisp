;;; -*-lisp-*-
;;; REVIVE;DTRHYM: a scene's rhythm suggests changes of speed, as an emotional state does.
;;;
;;; This file is ours, not Ken's. It is part of DETAIL (REVIVE;DETAIL says what DETAIL
;;; is, and where the thesis names this detail). It changes Ken's Cinderella: Kept Apart
;;; starts quicker and ends slower, and No Longer Kept Apart and the Meeting are quicker
;;; (reports/ext/detail/README.md).
;;;
;;; The detail. CINDY gives four scenes a rhythm: the Introduction normal, "this is
;;; relative to the film's rhythm" (cindy.46:61), Kept Apart (changes fast slow), No
;;; Longer Kept Apart and the Meeting fast (cindy.46:74, 114, 140); the commented-out
;;; scenes have slow and picking-up (cindy.46:81, 90, 104). The film's level of rhythm is
;;; high (cindy.46:161). Nothing reads a scene's rhythm: of what CINDY sets beside it,
;;; only the length is read (scene.9:346-364), and (rhythm level) is a global descriptor
;;; with no suggestions (glosug.41:150). The thesis names the gap: "Ani currently has
;;; practically no conception of rhythm, for example, and so could not respond to
;;; criticisms of the film's rhythm" (p. 191, L5006-5007); and the way to fill it: "The
;;; truth is that the meaning these words have to Ani is a pale reflection of what they
;;; mean to people. ... (a) Add to each one the ability to suggest values and activities
;;; (some do already)" (p. 183-184, L4778-4792).
;;;
;;; Beside a feeling. The rhythm's change is a part's, not a task's, run as the part
;;; runs a change: method of its own beside its tasks' (below). CHOMET's rule against
;;; conflicting changes, "hopefully all conflicting ones are so noted for now rather than
;;; resolving them I'll reject" (chomet.123:464), is among one task's suggestions: COSUG
;;; combines a task's change suggestions for each element, noting a conflict, and the
;;; task makes neither (Ken's decision 9, reports/ext/know/README.md). So the rule never
;;; sees the rhythm's change, and Director runs it beside a feeling's change of the same
;;; character's speed: in Kept Apart's last part the stepmother's joy (1.25 at medium
;;; speed) and the rhythm's slowing (0.8 at medium speed) run together and cancel tick
;;; by tick. To go through the rule the rhythm would have to be one of a task's
;;; suggestions, which a scene's rhythm is not; whether it should give way to a
;;; feeling, or both be dropped as the rule drops a task's, is a decision for Ken
;;; (reports/ext/detail/README.md).
;;;
;;; Here a scene's rhythm suggests how fast its characters move, as an emotional state
;;; does: with DISPLY's change: method, which joy's changes are made with (emote.9:19-24;
;;; disply.311:1047-1057), so that Director changes each character's speed gradually and
;;; carries it forth as it carries joy's. The revival's reading, each choice its own:
;;;  - The rhythm is relative to the film's (Ken's comment, cindy.46:61): a scene of
;;;    normal rhythm moves as the film moves, and changes nothing; fast and slow move a
;;;    quarter faster or slower, a change: of (positive medium) or (negative medium),
;;;    which DISPLY reads as 25% ("this has a new interpreation that low means increase
;;;    by 12.5%, medium 25% and high 50%", disply.311:1050), at medium speed.
;;;  - fast or slow holds for the whole scene, so each subscene suggests its change: a
;;;    subscene's dynamics start from the choices again (scene.9:265-275, char.2:58-68),
;;;    and a change made in one is carried forth only within its own (dichar.103:22-26,
;;;    112-117). (changes fast slow) starts fast and ends slow: the first subscene's
;;;    change is fast's, the last's slow's, and those between have none. picking-up is
;;;    (changes normal fast). Any other word suggests nothing.
;;;  - A subscene's change is for each character who does something in it, an action or
;;;    a change Ani planned there already, once its methods have run (scene.9:159-183):
;;;    a character with only changes and nothing to do in a subscene is made to wander or
;;;    has another subscene extended (plan-something-if-only-changes, scene.9:216-221),
;;;    which a scene's rhythm should not do.
;;;  - It is run as the subscene runs a change: method of its own (scene.9:179-180),
;;;    after its own methods, and like them it adds no time to the subscene (a change
;;;    "dont count", scene.9:190).
;;; Ken's Cinderella: the Introduction is normal and Justice has no rhythm; Kept Apart
;;; speeds Cinderella up as she sets off to meet the Prince, and slows Cinderella and
;;; the stepmother down at its end, with their feelings; No Longer Kept Apart and every
;;; subscene of the Meeting speed up whoever moves in them.
;;;
;;; The note, on the subscene, for each change of speed the rhythm suggested:
;;;   (revival-repair: what rhythm-speed was (cinderella speed)
;;;		     now (change: amount (positive medium) speed medium)
;;;		     because (rhythm (changes fast slow) beginning))
;;; where is beginning, end or throughout.

;; The amount a rhythm word suggests, relative to the film's: (sign medium), or nil.
(defun rhythm-amount (word)
  (cond ((eq word 'fast) '(positive medium))
	((eq word 'slow) '(negative medium))))

;; What a subscene of a scene with this rhythm is to change by: (amount where), or nil.
(defun rhythm-for-subscene (subscene rhythm)
  (let ((rhythm (cond ((eq rhythm 'picking-up) '(changes normal fast)) (t rhythm))))
       (cond ((atom rhythm)
	      (and (rhythm-amount rhythm) (list (rhythm-amount rhythm) 'throughout)))
	     ((and (eq (first rhythm) 'changes) (= (length rhythm) 3))
	      (let ((order (ask ,subscene recall your order-in-scene))
		    (last (last-order-in-scene (ask ,subscene recall your scene))))
		   (cond ((and (= order 1) (rhythm-amount (second rhythm)))
			  (list (rhythm-amount (second rhythm)) 'beginning))
			 ((and (= order last) (> order 1) (rhythm-amount (third rhythm)))
			  (list (rhythm-amount (third rhythm)) 'end))))))))

(defun last-order-in-scene (scene)
  (do ((s (ask ,scene recall your subscenes) (rest s))
       (most 0))
      ((null s) most)
      (let ((order (ask ,(first s) recall your order-in-scene)))
	   (and (numberp order) (> order most) (setq most order)))))

(defun follow-the-scenes-rhythm (subscene)
  (let ((rhythm (and (detail-on? 'rhythm)
		     (ask ,(ask ,subscene recall your scene) recall your rhythm))))
       (let ((change (and rhythm (rhythm-for-subscene subscene rhythm))))
	    (and change
		 (mapc (function
			(lambda (character)
				(and (or (ask ,subscene recall your (actions-of ,character))
					 (ask ,subscene recall your (changes-for ,character)))
				     (rhythm-change character (first change) subscene
						    (list 'rhythm rhythm (second change))))))
		       (ask character recall your offspring))))))

;; DISPLY's change: (disply.311:1047-1057), as the subscene runs one (scene.9:179-180).
(defun rhythm-change (character amount subscene because)
  (ask change: run change: element ,(list character 'speed) amount ,amount speed medium
       in ,subscene)
  (revival-note subscene 'rhythm-speed (list character 'speed)
		(list 'change: 'amount amount 'speed 'medium) because))

(defun teach-subscenes-the-scenes-rhythm ()
  (let ((:insert-methods-at-end nil))
       (define-extension-method (run your methods) subscene
	(ask-old :self run your methods)
	(follow-the-scenes-rhythm :self))))

(+after-load '|ken;scene >| '(revival-once 'dtrhym-rhythm 'teach-subscenes-the-scenes-rhythm))

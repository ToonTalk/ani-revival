;;; -*-lisp-*-
;;; REVIVE;KNOWDI: helps-along, moves-away-from and follows-behind, written as DISPLY.
;;;
;;; This file is ours, not Ken's. It is part of KNOW (src/pipeline.js, EXTENSIONS;
;;; REVIVE;KNOW says what KNOW is and how each piece is judged). Three display methods,
;;; for REVIVE;KNOWCV's helps, avoids and follows, made only from DISPLY's and PLACE's
;;; parts, as Ken made his (disply.311:113-328, 629-726): characters placed with
;;; place-...-distance-apart, walks planned with move-character and move-characters,
;;; each walk named for what it shows (the glass box's activities), and a time estimate
;;; from estimate-time-to-move-character, which CHOMET uses to choose a method and the
;;; subscene to stretch it (chomet.123:95-116, 448-460; scene.9:159-197). Each is the
;;; revival's, with a ";;why:" line that tools/know-index.mjs reads for the glass box.
;;;
;;; Each brings on the other character if it starts the subscene off the stage, with
;;; REVIVE;MEND6's bring-on, Ken's getting-on-stage step from goes-to-and-accompanys
;;; (disply.311:192-203), as MEND5's move-to does; and its estimate counts that walk
;;; (MEND6's plus-time-to-bring-on), so the time the task is allotted includes it. "X
;;; need not be on stage since it can come on and then meet Y" (AI-TR-540 L2392-2396).
;;; In Ken's Introduction the Prince, whom Cinderella helps, has no place yet when her
;;; helping comes (her accompanying him, which comes after, brings him on in 1978,
;;; disply.311:192-203), so helping him brings him on.

(defun define-the-revivals-display-methods ()
  (let ((:insert-methods-at-end nil))

;;; ------------------------------------------------- helps-along

;;why: helping is shown as Michotte's launching: the one helped sets off towards where it is going, slowly, on its own; the helper comes up to it and, with no pause (a pause would make it accompanying, and with none "observers perceived the first square as causing the other to move", AI-TR-540 pp. 158-159, L4168-4178), they go on together at the helper's pace, the one helped in front, as a pushee is moved with its pusher's dynamics (disply.311:303-315)
(define helps-along display-method
 (add prerequisite for (helps-along ? ?helped ?place) (can-move ,helped ,place)))

(define-receiver (estimate time for helps-along ?helper ?helped ?place in ?subscene)
		 helps-along
 (plus-time-to-bring-on
  helped helper subscene
  (add-to-estimates
   .5 ;;the helper sets off half a second after the one it helps
   (add-time-estimates
    (estimate-time-to-move-character helper
				     (where-contact-is helped helper subscene)
				     '(stop-when-there (quote ,subscene))
				     (special-dynamics-of helper subscene)
				     subscene
				     .33) ;;a third of the screen if not placed yet
    (estimate-time-to-move-character helped
				     place
				     '(stop-when-there (quote ,subscene))
				     (multiply-speed-by-factor helper .8 subscene)
				     subscene
				     .6))))) ;;good-distance-from is far (interf.149:595-626)

(define-receiver (run helps-along ?helper ?helped ?place in ?subscene stretched by ?factor)
		 helps-along
 (initial-locations-for-helps-along helper helped subscene)
 (let ((get-on-stage-plan
	(and (brings-on? helped helper subscene '(helps-along ,helper ,helped ,place))
	     (bring-on helped helper factor subscene 'helps-along)))
       (helper-special-dynamics (divide-speed-by-factor helper factor subscene))
       (helped-special-dynamics (divide-speed-by-factor helped factor subscene))
       (tries-alone-plan (activity-name-of 'trying-alone))
       (go-to-plan (activity-name-of 'goes-to-help))
       (help-plan (activity-name-of 'helping-along)))
      (move-character tries-alone-plan
		      helped
		      '(small-way-from (vicinity-of ,helped) ,place)
		      'moving-target
		      '(move-only-original-distance (quote ,subscene))
		      0.0 ;;at the beginning of the subscene
		      (multiply-dynamics-by-factor helped-special-dynamics .5) ;;struggling
		      'careful ;;of collisions
		      subscene)
      (move-character go-to-plan
		      helper
		      '(contact-with ,helped by ,helper)
		      'moving-target
		      '(stop-when-there-then (quote ,subscene)
					     (stop-plan (quote ,tries-alone-plan)))
		      0.5 ;;start half a second after it begins
		      helper-special-dynamics
		      'careful ;;of collisions
		      subscene)
      (move-characters help-plan
		       helped ;;in front
		       helper
		       place
		       'stationary-target
		       '(stop-if-either-wants-to
			 (stop-after-so-many-seconds
			  ,(-$ (ask ,subscene recall your running-time) 1.0))
			 (stop-when-there (quote ,subscene)))
		       '(after (end-of ,go-to-plan) .05) ;;no pause, as pushing has none
		       (multiply-dynamics-by-factor helper-special-dynamics .8)
		       'careful ;;of collisions but not themselves of course
		       subscene)
      (cond (get-on-stage-plan
	     (ask ,subscene add (sequence: ,get-on-stage-plan
					   (and ,tries-alone-plan ,go-to-plan ,help-plan))
		  to your list of movements))
	    (t (ask ,subscene add (and ,tries-alone-plan ,go-to-plan ,help-plan)
		    to your list of movements))))
 (record-distance-estimates '(distance-between (vicinity-of ,helper) (vicinity-of ,helped))
			    '(screen-fraction .05) ;;they end together
			    subscene))

;;; ------------------------------------------------- moves-away-from

;;why: avoiding shown as Michotte's viewers saw it: "as though B was afraid when A approached, and ran off" (AI-TR-540 p. 158, L4157): the other comes a small part of the way towards the one who avoids it, which, half a second later, goes off the other way, to Ken's away-from position (interf.149:374-388)
(define moves-away-from display-method
 (add prerequisite for (moves-away-from ?who ?other)
		       (can-move ,who (away-from (vicinity-of ,who) (vicinity-of ,other)))))

(define-receiver (estimate time for moves-away-from ?who ?other in ?subscene) moves-away-from
 (plus-time-to-bring-on
  other who subscene
  (add-to-estimates
   .5 ;;it goes off half a second after the other comes towards it
   (estimate-time-to-move-character who
				    '(away-from (vicinity-of ,who) (vicinity-of ,other))
				    '(stop-when-there (quote ,subscene))
				    (special-dynamics-of who subscene)
				    subscene
				    .33)))) ;;as far as the other is, a third if not placed

(define-receiver (run moves-away-from ?who ?other in ?subscene stretched by ?factor)
		 moves-away-from
 (initial-locations-for-moves-away-from who other subscene)
 (let ((get-on-stage-plan
	(and (brings-on? other who subscene '(moves-away-from ,who ,other))
	     (bring-on other who factor subscene 'moves-away-from)))
       (approach-plan (activity-name-of 'other-approaches))
       (away-plan (activity-name-of 'moves-away)))
      (move-character approach-plan
		      other
		      '(small-way-from (vicinity-of ,other) (vicinity-of ,who))
		      'moving-target
		      '(move-only-original-distance (quote ,subscene))
		      0.0 ;;at the beginning of the subscene
		      (divide-speed-by-factor other factor subscene)
		      'careful ;;of collisions
		      subscene)
      (move-character away-plan
		      who
		      '(away-from (vicinity-of ,who) (vicinity-of ,other))
		      'stationary-target
		      '(stop-when-there (quote ,subscene))
		      '(after (beginning-of ,approach-plan) .5)
		      (divide-speed-by-factor who factor subscene)
		      'careful ;;of collisions
		      subscene)
      (cond (get-on-stage-plan
	     (ask ,subscene add (sequence: ,get-on-stage-plan (and ,approach-plan ,away-plan))
		  to your list of movements))
	    (t (ask ,subscene add (and ,approach-plan ,away-plan) to your list of movements))))
 (record-distance-estimates '(distance-between (vicinity-of ,who) (vicinity-of ,other))
			    '(screen-fraction .5) ;;further apart than they started
			    subscene))

;;; ------------------------------------------------- follows-behind

;;why: following shown as the leader going a good way off and the follower setting off after it half a second later, as a chaser after its chasee (disply.311:48-85), at a little less than its pace, as a pushee is moved with its pusher's dynamics (disply.311:303-315), so that it keeps behind, until the leader stops and it closes up to it, as goes-to-to-accompany walks to contact (disply.311:204-213)
(define follows-behind display-method
 (add prerequisite for (follows-behind ?follower ?leader)
		       (can-move ,follower (vicinity-of ,leader))))

(define-receiver (estimate time for follows-behind ?follower ?leader in ?subscene) follows-behind
 (let ((pace (multiply-speed-by-factor leader .9 subscene)))
      (plus-time-to-bring-on
       leader follower subscene
       (add-to-estimates
	(+$ .5 ;;the follower sets off half a second later
	    (time-to-walk follower .15 pace subscene)) ;;and is a small way behind
	(estimate-time-to-move-character follower
					 '(good-distance-from (vicinity-of ,leader))
					 '(stop-when-there (quote ,subscene))
					 pace
					 subscene
					 .6))))) ;;good-distance-from is far (interf.149:595-626)

(define-receiver (run follows-behind ?follower ?leader in ?subscene stretched by ?factor)
		 follows-behind
 (initial-locations-for-follows-behind follower leader subscene)
 (let ((get-on-stage-plan
	(and (brings-on? leader follower subscene '(follows-behind ,follower ,leader))
	     (bring-on leader follower factor subscene 'follows-behind)))
       (leader-special-dynamics (divide-speed-by-factor leader factor subscene))
       (lead-plan (activity-name-of 'leading))
       (follow-plan (activity-name-of 'following)))
      (move-character lead-plan
		      leader
		      '(good-distance-from (vicinity-of ,leader))
		      'stationary-target
		      '(stop-when-there (quote ,subscene))
		      0.0 ;;at the beginning of the subscene
		      leader-special-dynamics
		      'careful ;;of collisions
		      subscene)
      (move-character follow-plan
		      follower
		      '(contact-with ,leader by ,follower)
		      'moving-target
		      '(stop-if-either-wants-to
			(stop-after-so-many-seconds
			 ,(-$ (ask ,subscene recall your running-time) .5))
			(stop-when-there (quote ,subscene)))
		      '(after (beginning-of ,lead-plan) .5)
		      ;;a little less than the leader's pace, so as to keep behind
		      (multiply-dynamics-by-factor leader-special-dynamics .9)
		      'careful ;;of collisions, the leader's too
		      subscene)
      (cond (get-on-stage-plan
	     (ask ,subscene add (sequence: ,get-on-stage-plan (and ,lead-plan ,follow-plan))
		  to your list of movements))
	    (t (ask ,subscene add (and ,lead-plan ,follow-plan) to your list of movements))))
 (record-distance-estimates '(distance-between (vicinity-of ,follower) (vicinity-of ,leader))
			    '(screen-fraction .1) ;;close behind
			    subscene))))

;; Where a walk to contact with who by other goes, for an estimate. INTERF works out
;; (contact-with who by other) from the distance between the two (interf.149:291-305),
;; which, when one has a place in the subscene and the other none yet, is nil (with a
;; warning, interf.149:744-748), and its min of the sizes and nil stops pass 2. That
;; happens when the subscene runs its methods and REVIVE;MEND6 makes again an estimate
;; that didn't count bringing someone on: Cinderella has a place from the hits before,
;; the Prince none. So an estimate then takes a third of the screen, as Ken's estimates
;; take when the characters are not placed (disply.311:120-124); when neither has a
;; place, Ken's form gives that too.
(defun where-contact-is (who other subscene)
  (cond ((and (located? '(vicinity-of ,who) subscene)
	      (located? '(vicinity-of ,other) subscene))
	 '(contact-with ,who by ,other))
	(t .33)))

(defun initial-locations-for-helps-along (helper helped subscene)
  (place-medium-distance-apart 'helps-along
			       '(vicinity-of ,helper)
			       '(vicinity-of ,helped)
			       nil ;;no need to cut
			       subscene))

(defun initial-locations-for-moves-away-from (who other subscene)
  (place-medium-distance-apart 'moves-away-from
			       '(vicinity-of ,who)
			       '(vicinity-of ,other)
			       nil ;;no need to cut
			       subscene))

(defun initial-locations-for-follows-behind (follower leader subscene)
  (place-small-distance-apart 'follows-behind
			      '(vicinity-of ,follower)
			      '(vicinity-of ,leader)
			      nil ;;no need to cut
			      subscene))

(+after-load '|ken;disply >| '(revival-once 'know-display-methods 'define-the-revivals-display-methods))

;; REVIVE;MEND6 makes again, when the subscene runs its methods, an estimate that
;; assumed otherwise about bringing someone on (maximum-ideal-time-of-counting-bringing-
;; on); it knows who moves and who may be brought on in Ken's methods and MEND5's
;; move-to by mover-and-other-of, and here in these three too.
(defun mover-and-other-of-the-revivals-methods (method)
  (cond ((eq (first method) 'helps-along) (list (second method) (third method)))
	((eq (first method) 'moves-away-from) (list (second method) (third method)))
	((eq (first method) 'follows-behind) (list (second method) (third method)))
	(t (funcall (revival-wrapped 'mover-and-other-of 'knowdi) method))))

(revival-wrap 'mover-and-other-of 'knowdi 'mover-and-other-of-the-revivals-methods)

;; Each is a top-level actor of DISPLY's once DISPLY has loaded, so the tags give it
;; DISPLY as its file, as load.33 fills them for Ken's; REVIVE;MEND5's check that a
;; suggested display method exists then knows it before DISPLY has loaded.
(mapc (function (lambda (method) (putprop method '|KEN;DISPLY| 'actor-load)))
      '(helps-along moves-away-from follows-behind))

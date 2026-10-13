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

;;why: helping is shown as Michotte's launching, which Ken's pushing is made of: the one helped sets off towards where it is going, slowly, on its own; the helper goes round behind it and comes up against it, as a pusher comes in contact (disply.311:277-288), and with no pause (with none "observers perceived the first square as causing the other to move", and a pause would make it accompanying, AI-TR-540 pp. 158-159, L4168-4178) they go on together to where it was going, the one helped in front and the helper behind, at the helper's pace, as a pushee is moved with its pusher's dynamics (disply.311:289-315)
(define helps-along display-method
 (add prerequisite for (helps-along ? ?helped ?place) (can-move ,helped ,place)))

(define-receiver (estimate time for helps-along ?helper ?helped ?place in ?subscene)
		 helps-along
 (plus-time-to-bring-on
  helped helper subscene
  (add-to-estimates
   (+$ .5 ;;the helper sets off half a second after the one it helps
       (time-to-walk helper .075 (special-dynamics-of helper subscene) subscene)) ;;to contact
   (add-time-estimates
    (estimate-time-to-move-character helper
				     (where-behind-is helped place helper subscene)
				     '(stop-when-there (quote ,subscene))
				     (special-dynamics-of helper subscene)
				     subscene
				     .4) ;;a third of the screen and round, if not placed yet
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
       (go-to-plan (activity-name-of 'goes-behind-to-help))
       (contact-plan (activity-name-of 'comes-in-contact-to-help))
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
      ;;to a small distance behind it, on the other side from where it is going
      ;;(interf.149:395-402)
      (move-character go-to-plan
		      helper
		      '(a-small-distance-away-from (vicinity-of ,helped) ,place)
		      'moving-target
		      '(stop-when-there-then (quote ,subscene)
					     (stop-plan (quote ,tries-alone-plan)))
		      0.5 ;;start half a second after it begins
		      helper-special-dynamics
		      'careful ;;of collisions
		      subscene)
      (move-character contact-plan
		      helper
		      '(contact-with ,helped by ,helper)
		      'moving-target
		      '(stop-when-there (quote ,subscene))
		      '(after (end-of ,go-to-plan) 0.0)
		      helper-special-dynamics
		      'regardless ;;of collisions, as a pusher comes in contact
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
		       '(after (end-of ,contact-plan) .05) ;;no pause, as pushing has none
		       (multiply-dynamics-by-factor helper-special-dynamics .8)
		       'careful ;;of collisions but not themselves of course
		       subscene)
      (cond (get-on-stage-plan
	     (ask ,subscene add (sequence: ,get-on-stage-plan
					   (and ,tries-alone-plan ,go-to-plan
						,contact-plan ,help-plan))
		  to your list of movements))
	    (t (ask ,subscene add (and ,tries-alone-plan ,go-to-plan ,contact-plan ,help-plan)
		    to your list of movements))))
 (record-distance-estimates '(distance-between (vicinity-of ,helper) (vicinity-of ,helped))
			    '(screen-fraction .05) ;;they end together
			    subscene))

;;; ------------------------------------------------- moves-away-from

;;why: avoiding shown as Michotte's viewers saw it: "as though B was afraid when A approached, and ran off" (AI-TR-540 p. 158, L4157): the other comes a small part of the way towards the one who avoids it, which, half a second later, runs off the other way, as far as Ken's chasee runs from its chaser, a quarter of the screen (convey.64:102-111), regardless of anyone in its way, as Ken's exit-by "just get[s] out of there" (disply.311:1022-1040)
(define moves-away-from display-method
 (add prerequisite for (moves-away-from ?who ?other)
		       (can-move ,who (distance-away-from (vicinity-of ,who) (vicinity-of ,other) .25))))

(define-receiver (estimate time for moves-away-from ?who ?other in ?subscene) moves-away-from
 (plus-time-to-bring-on
  other who subscene
  (add-to-estimates
   .5 ;;it goes off half a second after the other comes towards it
   (estimate-time-to-move-character who
				    .25 ;;a quarter of the screen, whether placed or not
				    '(stop-when-there (quote ,subscene))
				    (special-dynamics-of who subscene)
				    subscene))))

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
		      '(distance-away-from (vicinity-of ,who) (vicinity-of ,other) .25)
		      'stationary-target
		      '(stop-when-there (quote ,subscene))
		      '(after (beginning-of ,approach-plan) .5)
		      (divide-speed-by-factor who factor subscene)
		      'regardless ;;just get out of there, as exit-by does
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

;; Where the helper's walk round behind the one it helps goes, for an estimate: a place
;; only if both have one in the subscene. When one has a place and the other none yet,
;; INTERF's distance between them is nil (with a warning, interf.149:744-748), and
;; working out a place from it can stop pass 2: contact-with takes the min of the sizes
;; and that nil (interf.149:291-305). That happens when the subscene runs its methods and
;; REVIVE;MEND6 makes again an estimate that didn't count bringing someone on: in Ken's
;; Introduction Cinderella has a place from the hits before, the Prince none. So an
;; estimate then takes a distance, a third of the screen and a little more to go round,
;; as Ken's estimates take a third when the characters are not placed
;; (disply.311:120-124).
(defun where-behind-is (helped place helper subscene)
  (cond ((and (located? '(vicinity-of ,helped) subscene)
	      (located? '(vicinity-of ,helper) subscene))
	 '(a-small-distance-away-from (vicinity-of ,helped) ,place))
	(t .4)))

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

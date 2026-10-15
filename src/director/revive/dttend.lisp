;;; -*-lisp-*-
;;; REVIVE;DTTEND: a character's tendencies feed the best-when scores of ways of showing.
;;;
;;; This file is ours, not Ken's. It is part of DETAIL (REVIVE;DETAIL says what DETAIL
;;; is, and where the thesis names this detail). In Ken's Cinderella it decides no choice
;;; (reports/ext/detail/README.md says why), and it marks the best-when scores where it
;;; acts.
;;;
;;; The detail. Pass 1 chooses, for each character, how it is drawn to its friends, its
;;; enemies and strangers: "tendencies (e.g. to avoid strangers, to be attracted to
;;; strangers)" (p. 106, L2868-2869), movement-tendency-elements whose values are
;;; positive or negative, high, medium or low (elemnt.1:96-105); shy "strongly suggests
;;; strong tendency to avoid strangers" (p. 264, L6967-6968). Nothing after pass 1 reads
;;; them ("(c) The movement tendencies such as the tendency to avoid strangers, should
;;; be used in the prerequisite and "best when" clauses of methods", p. 185, L4827-4829).
;;;
;;; Here they are used as Ken's best-when clauses are: a status, met, not met or don't
;;; know, which CHOMET's score of a way of showing counts (best-when-score,
;;; chomet.123:376-387: one more for each met, one less for each not met), weighed by the
;;; film's coherence (chomet.123:245-246), among the ways of showing of one task. A new
;;; prerequisite, drawn-to, written as PREREQ's are (faster reads two speed choices,
;;; prereq.19:27-39; likes reads a relationship, 110-120): (drawn-to a b) is met if a's
;;; tendency towards what b is to a is positive, not met if it is negative, and don't
;;; know otherwise. What b is to a is read with Ken's own tests for SUGEST's generators:
;;; an enemy if either hates the other (enemy-of, sugest.123:373-395), else a friend if a
;;; likes or loves b (friend-of, through what PREREQ's likes reads, sugest.123:357-370,
;;; prereq.19:110-120), else a stranger if neither has a relationship with the other
;;; (stranger-of, sugest.123:341-354); otherwise, as when a dominates b, Ani has no
;;; tendency to read.
;;;
;;; Which ways of showing take one character to another is the revival's reading of
;;; DISPLY's methods, each by what its activities do (disply.311 and KNOW's KNOWDI):
;;;   to the other   move-to-and-hits (goes-to-to-hit), chases-to (chaser-pursues),
;;;                  pushes-around (pusher-comes-in-contact), goes-to-and-accompanys
;;;                  (goes-to-to-accompany), helps-along (goes-behind-to-help, KNOW),
;;;                  follows-behind (following, KNOW), goes-to-and-transforms (CHANGE):
;;;                  best when (drawn-to a b);
;;;   to each other  move-to-each-other, repeatedly-come-in-contact: best when
;;;                  (drawn-to a b) and (drawn-to b a);
;;;   away           moves-away-from (moves-away, KNOW): best when (not (drawn-to a b)),
;;;                  through PREREQ's own not (prereq.19:12-22).
;;; Each is given as Ken gives a method a best-when clause, (ask method add best-when
;;; for pattern clause) (convey.64:29-33), so SUGCON adds it to every suggestion of the
;;; method (sugcon.26:30-55) and CHOMET scores it with the others. The other ways of
;;; showing (alternately-turn, stands-guard, makes-fence, move-near-and-turn, exit-by,
;;; move-small-part-towards and move-to, whose second is a place) take no clause.
;;;
;;; The thesis's methods include the convey methods, where a best-when not met drops a
;;; method when more than a few are left (eliminate-not-best-whens, chomet.123:474-490,
;;; 565-577). The same clauses on the convey verbs (meets and its kinds, chases,
;;; follows, helps; avoids away) are here behind :detail-tendencies-of-convey-methods,
;;; nil, off: given to the verbs as their best-when clauses, which SUGCON adds to a
;;; convey task's convey suggestions (sugcon.26:20-28), and added to the convey methods
;;; an establish task chooses among (SUGEST's instaniate-convey-suggestions, which adds
;;; none, sugest.123:237-258). Run so, Ken's Introduction has the stepmother avoid
;;; Cinderella instead of pushing her around: mean has her strongly avoid her enemies
;;; (dscrp.17:249; CP 29: (negative high)), so hurting and pushing her are not at their
;;; best, and eliminate-not-best-whens leaves avoiding. A decision for Ken
;;; (reports/ext/detail/README.md).
;;;
;;; The note, on the task whose ways of showing are being scored (or chosen among, for
;;; the convey verbs), for each tendency that decided a clause:
;;;   (revival-repair: what tendency was (drawn-to step-mother cinderella) now not-met
;;;		     because ((choice-point-of step-mother attraction-towards-enemies) (negative high)))

(or (boundp ':detail-tendencies-of-convey-methods) (setq :detail-tendencies-of-convey-methods nil))
(or (boundp ':detail-task) (setq :detail-task nil))

;; drawn-to is PREREQ's kind of actor, defined once PREREQ has loaded; the tags say
;; where, so that asking it loads PREREQ, as asking likes or faster does.
(defprop drawn-to |KEN;PREREQ| actor-load)

(defun define-drawn-to ()
  (let ((:insert-methods-at-end nil))
       (define drawn-to prerequisite
	(add (if-asked-about
	      (status-of (drawn-to ?a ?b) ?)
	      '(status-of (drawn-to ,a ,b) ,(tendency-status a b)))
	     to your list of (status-of if-recalling-items)))))

(+after-load '|ken;prereq >| '(revival-once 'dttend-drawn-to 'define-drawn-to))

;; What b is to a: enemies, friends, strangers, or nil.
(defun what-other-is-to (a b)
  (cond ((or (relationship-described-as a b 'hates) (relationship-described-as b a 'hates))
	 'enemies)
	((or (relationship-described-as a b 'likes) (relationship-described-as a b 'loves))
	 'friends)
	((and (not (exists? (list 'relationship-of a b)))
	      (not (exists? (list 'relationship-of b a))))
	 'strangers)))

(defun relationship-described-as (a b word)
  (ask-if-exists (relationship-of ,a ,b)
		 recall if any items match (description: type ? descriptor ,word %)))

;; met, not-met or dont-know, from a's tendency towards what b is to a.
(defun tendency-status (a b)
  (let ((kind (and (detail-on? 'tend) (what-other-is-to a b))))
       (let ((choice-point (and kind (list 'choice-point-of a
					     (cdr (assq kind '((enemies . attraction-towards-enemies)
							       (friends . attraction-towards-friends)
							       (strangers . attraction-towards-strangers))))))))
	    (let ((value (and choice-point (exists? choice-point)
			      (ask ,choice-point recall your current-choice))))
		 (let ((status (cond ((and (not (atom value)) (eq (first value) 'positive)) 'met)
				     ((and (not (atom value)) (eq (first value) 'negative)) 'not-met)
				     (t 'dont-know))))
		      (and :detail-task
			   (not (eq status 'dont-know))
			   (revival-note :detail-task 'tendency (list 'drawn-to a b) status
					 (list choice-point value)))
		      status)))))

;; The ways of showing and their clauses, a and b the characters the pattern binds.
(setq :detail-tendency-best-whens
      '((move-to-and-hits (move-to-and-hits ?a ?b) (drawn-to a b))
	(chases-to (chases-to ?a ?b %) (drawn-to a b))
	(pushes-around (pushes-around ?a ?b) (drawn-to a b))
	(goes-to-and-accompanys (goes-to-and-accompanys ?a ?b %) (drawn-to a b))
	(helps-along (helps-along ?a ?b %) (drawn-to a b))
	(follows-behind (follows-behind ?a ?b) (drawn-to a b))
	(goes-to-and-transforms (goes-to-and-transforms ?a ?b) (drawn-to a b))
	(move-to-each-other (move-to-each-other ?a ?b) (drawn-to a b))
	(move-to-each-other (move-to-each-other ?a ?b) (drawn-to b a))
	(repeatedly-come-in-contact (repeatedly-come-in-contact ?a ?b) (drawn-to a b))
	(repeatedly-come-in-contact (repeatedly-come-in-contact ?a ?b) (drawn-to b a))
	(moves-away-from (moves-away-from ?a ?b) (not (drawn-to a b)))))

;; ... and the convey verbs', off unless :detail-tendencies-of-convey-methods.
(setq :detail-tendency-convey-best-whens
      '((meets (meets ?a ?b) (drawn-to a b))
	(pushes (pushes ?a ?b) (drawn-to a b))
	(hurts (hurts ?a ?b) (drawn-to a b))
	(accompanys (accompanys ?a ?b) (drawn-to a b))
	(getting-it-on (getting-it-on ?a ?b) (drawn-to a b))
	(getting-it-on (getting-it-on ?a ?b) (drawn-to b a))
	(chases (chases ?a ?b) (drawn-to a b))
	(follows (follows ?a ?b) (drawn-to a b))
	(helps (helps ?a ?b) (drawn-to a b))
	(avoids (avoids ?a ?b) (not (drawn-to a b)))))

;; A clause as Ken writes one in a method's best-when, its a and b to be the pattern's:
;; (drawn-to a b) as (drawn-to ,a ,b), whose commas are Director's director-symbol-for-eval
;; (KEN1;MACROS comma).
(defun clause-with-commas (clause)
  (cond ((memq clause '(a b)) (list 'director-symbol-for-eval clause))
	((atom clause) clause)
	(t (mapcar 'clause-with-commas clause))))

(defun teach-tendency-best-whens (entries)
  (cond ((detail-on? 'tend)
	 (mapc (function
		(lambda (entry)
			(let ((method (first entry)) (pattern (second entry))
			      (clause (clause-with-commas (third entry))))
			     (and (actor-of method dont-autoload)
				  (ask ,method add best-when for ,pattern ,clause)))))
	       entries))))

(defun teach-display-tendency-best-whens ()
  (teach-tendency-best-whens :detail-tendency-best-whens))

(defun teach-convey-tendency-best-whens ()
  (and :detail-tendencies-of-convey-methods
       (teach-tendency-best-whens :detail-tendency-convey-best-whens)))

;; With :detail-tendencies-of-convey-methods, an establish task's convey methods take
;; their verbs' best-when clauses, as SUGCON gives a convey task's (sugcon.26:30-55),
;; the best-when clauses only.
(defun instaniate-convey-suggestions-with-best-whens (suggestions scene)
  (let ((made (funcall (revival-wrapped 'instaniate-convey-suggestions 'dttend) suggestions scene)))
       (cond ((and :detail-tendencies-of-convey-methods (detail-on? 'tend))
	      (mapcar 'with-the-verbs-best-whens made))
	     (t made))))

(defun with-the-verbs-best-whens (suggestion)
  (let ((method (get suggestion 'value)))
       (let ((more (and (not (atom method)) (eq (first method) 'method:)
			(ask-if-exists ,(first (get method 'value))
				       collect best-when of ,(get method 'value)))))
	    (cond (more (replaceprop suggestion
				     (replaceprop method (union more (get method 'best-when)) 'best-when)
				     'value))
		  (t suggestion)))))

(+after-load '|ken;sugest >|
  '(revival-wrap 'instaniate-convey-suggestions 'dttend 'instaniate-convey-suggestions-with-best-whens))

;; After DISPLY (and KNOW's and CHANGE's methods, defined when it loads, before these
;; hooks fire), and after CONVEY.
(+after-load '|ken;disply >| '(revival-once 'dttend-display 'teach-display-tendency-best-whens))
(+after-load '|ken;convey >| '(revival-once 'dttend-convey 'teach-convey-tendency-best-whens))

;; The task, for the notes: while CHOMET scores a task's ways of showing, and while it
;; chooses among the convey methods of one.
(defun score-suggestions-noting-tendencies (suggestions task)
  (let ((:detail-task task))
       (funcall (revival-wrapped 'score-suggestions 'dttend) suggestions task)))

(defun eliminate-not-best-whens-noting-tendencies (suggestions task)
  (let ((:detail-task task))
       (funcall (revival-wrapped 'eliminate-not-best-whens 'dttend) suggestions task)))

(+after-load '|ken;chomet >|
  '(progn
    (revival-wrap 'score-suggestions 'dttend 'score-suggestions-noting-tendencies)
    (revival-wrap 'eliminate-not-best-whens 'dttend 'eliminate-not-best-whens-noting-tendencies)))

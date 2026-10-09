;;; -*-lisp-*-
;;; REVIVE;MEND6: M6, characters in the scene first, and bringing an off-stage victim on.
;;;
;;; This file is ours, not Ken's. It is part of MEND (src/pipeline.js, EXTENSIONS),
;;; the repairs for failures new stories meet and Cinderella never does
;;; (reports/chapter-x/PLAN.md, "Item 4, part 1: MEND"). With MEND loaded, Ken's
;;; Cinderella must come out byte for byte as without it
;;; (node tools/check-1978.mjs --extensions mend).
;;;
;;; The repair. friend-of, enemy-of and stranger-of take the first sibling that fits,
;;; anywhere (sugest.123:329, 349-395). They look first among everyone named in any of
;;; the scene's task descriptions (SCENE records scene participation only for each
;;; task's subject, scene.9:463-465); if no one in the scene fits, the 1978 pick
;;; stands. And an off-stage victim of move-to-and-hits, chases-to or pushes-around is
;;; brought on with Ken's getting-on-stage step from goes-to-and-accompanys
;;; (disply.311:192-209), the walk counted in the estimate (disply.311:177-184).
;;;
;;; The code goes here. Wrap Ken's functions with REVIVE;WRAP's revival-wrap, inside
;;; the +after-load of the Ken file that defines them, and leave a note with
;;; revival-note where the repair acts. Nothing here yet: the file loads and does
;;; nothing.

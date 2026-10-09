# Ani chooses how her characters look, and when their looks change (thesis Chapter X.A.1–A.2), as the switchable REVIVE;APPEAR and REVIVE;LOOKS extensions

*One of four designs behind [PLAN.md](PLAN.md), written by a design agent on 9 October 2026 and then reviewed adversarially. Where the review below finds an error, the plan's corrected version is the one to follow.*

## Summary

Appearance becomes more of Ani's own elements: size, shape-jaggedness, shape-complexity, color-hue, color-intensity and color-saturation. They are chosen by her unchanged choice-point machinery from descriptors, relationships, comparisons, her own chosen dynamics and the film's global levels, and they are made after the 102 dynamics choices, so CP 29's choices cannot move. Ken's hierarchy of shape experts, with constraint relaxation, then turns the chosen element values into a Director polygon or star, a size and an HIS color. Mid-film changes are display methods (look-change:, look-change-to:), children of Ken's change-method, planned by pass 2 like his dynamics changes and played by Director with gradual growth and with its own in-betweening (KEN1;INTER). Everything lives in two REVIVE files loaded only when "Ani with the revival's extensions" is on, and every new choice and change is explained in the glass box beside "Ken drew her as a green star in 1978."

## The design

THE IDEA IN KEN'S TERMS
Appearance is split into aspects and elements (p. 163). The elements are chosen exactly as dynamics are (Ch. V). A hierarchy of shape experts turns those values into something Director can draw (p. 164). Changes of look are display methods planned like dynamics changes, and they are in-betweened by Director's interpolation (pp. 166-167). Two new files hold all of it. The original files are untouched. The 1978 boot never loads the new files.

1. FILES AND SWITCH
- src/director/revive/appear.lisp, which loads as REVIVE;APPEAR. This is Ani's side, for pass 1 and pass 2.
- src/director/revive/looks.lisp, which loads as REVIVE;LOOKS. This is Director's side, for filming.
- Both file names are 6 characters or fewer and stay unique after ITS truncation.
- Each file opens with the bridge's header ("This file is ours, not Ken's", thesis pp. 163-167). Each change cites its evidence.
- All patching uses the bridge idioms:
  - +after-load on the Ani file it extends (ELEMNT, COSUG, CPOINT, FILM, GLOSUG, DSCRP, RELATE, CSUMRY, CHOOSE, DATEST, RUN, DISPLY, EMOTE, DICHAR);
  - a putprop of the original expr, then a wrapper that delegates to it;
  - :insert-methods-at-end bound to nil inside hooks.
- A hook fires only when its host file loads. So both files can be loaded in all three steps: the Ani hooks never fire while filming, and the Director hooks never fire in pass 1.
- In src/pipeline.js, extend the shared registry with: EXTENSIONS.appear = { files: ["appear", "looks"], afterPass1: "(choose-appearances)", recorder: { looks: true } }.
- appear-plan (sizes used in planning, stage 6) and appear-order (interleaved, stage 6) are separate entries for experiments.
- The page has one switch, "Ani as in 1978 / Ani with the revival's extensions", shared with the other Chapter X items.

2. PASS 1: THE ELEMENTS ARE ANI'S OWN CHOICE POINTS

2.1 Elements (ELEMNT hook)
- appearance-element is a child of element. It uses value-description three-values-and-not and possible-values (high medium low), the same as speed. So COSUG combines, compromises and flips its values unchanged, and the (variety level) global applies automatically.
- The elements, with their thesis wording:
  - size: large or small (p. 104);
  - shape-jaggedness: smooth or jagged;
  - shape-complexity: simple or complex;
  - color-intensity and color-saturation;
  - color-hue (p. 163: "intensity, hue, and saturation").
- Relative elements: relative-size, relative-shape-jaggedness, relative-shape-complexity and relative-color-intensity.
- color-hue is unordered. It gets a new value-description, hue-net (COSUG hook). This is Ken's "semantic net of colors" (p. 240), with six hues: red, orange, yellow, green, blue, purple.
  - Opposites are complements, kept on the plist: red/green, orange/blue, yellow/purple.
  - Hues one or two steps apart are near-enough, and the compromise is the hue between them.
  - Complements conflict, with type complementary.
  - hue-net has its own combine, because COSUG's combine-two-suggestions calls compromise-three-values directly.
- No actors are named after colors, so the TV's color plists are never touched.
- Kept out for now:
  - Line, which the TV cannot vary.
  - Texture. It is set per shape from Ken's own ANINIT rule, offset 20 "since a star is denser".
  - Long/short, open/closed and symmetrical/asymmetrical. These need new Director draw procedures (a spiral expert, a stretched oval) and come in a later stage.

2.2 Choice points, dynamics first (DATEST, then afterPass1)
- After DATEST's (z) has completed characters-node, (choose-appearances) builds appearances-node.
- Under it, each character gets a <character>-appearance-node. Its choices are (choice-point-of <character> <element>), made as instances of appearance-choice-point, a child of absolute-choice-point.
- It then runs Ken's own make-choices-until-completed on appearances-node.
- This is one of the two decision orders the thesis names (p. 240: "colors ..., then their dynamics, then their shapes"). It cannot touch the 102 dynamics choices, because they are all made before any appearance choice point exists. The element count-for tallies are per element, and the comparisons it reuses already exist.
- appearance-choice-point has its own settings (FILM hook):
  - suggestion-sources: ((absolute neighbors opposites) relative dynamics-suggestions global);
  - source-priorities: the same as absolute choice points, plus dynamics-suggestions 2;
  - minimally-happy-sample-suggestion: the same sample as absolute choice points, which gives a minimum happiness of 14.
- save-answers already writes every leaf choice point. So the CP file gains (define (choice-point-of cinderella size) appearance-choice-point (set your current-choice to low)) with no change to DATEST.

2.3 Where the suggestions come from (the thesis's sources, pp. 91-92)

(a) Descriptors
- A knowledge table, (teach-appearance '((descriptor element value strength evidence) ...)), sends Ken's own (process suggestions (for size low strength medium)) to each descriptor.
- It also files the evidence on the descriptor's plist as appearance-evidence. The glass box can then quote, for example, "thesis p. 161: smooth is friendly", or say "the revival's: a shy character takes up little room".
- First entries:

  | Descriptor | Suggestion (strength) | Evidence |
  |---|---|---|
  | strong | size high (medium) | p. 238: "a large pointed shape" for a strong ally |
  | strong | shape-jaggedness high (low) | p. 238 |
  | mean | shape-jaggedness high | p. 238 |
  | physically-strong | size high (high) | revival |
  | shy | size low (medium) | revival |
  | shy | shape-complexity low (low) | revival |
  | friendly | shape-jaggedness low | p. 161: "smooth is friendly" |
  | graceful | shape-jaggedness low | revival; Cinderella gets graceful from beautiful through char.2:13-20 |
  | evil | color-intensity low (high) | p. 161: "bad guys wear black" |
  | evil | color-hue red (low) | revival |
  | beautiful | color-saturation high | p. 225: "bright and harmonious colors" |
  | pretty | color-saturation high | p. 225 |
  | shabby | color-saturation low (high) | p. 225: "muddy, dull"; p. 166: "shabby and ragged" |
  | shabby | shape-jaggedness high (low) | p. 166: "ragged" |
  | magical | shape-complexity high | revival |
  | magical | color-hue purple | revival |

- Opposites and neighbors then work as they do for dynamics. elegant (shabby's opposite) automatically suggests saturated and smooth, which is what cinderella-beautified needs.
- Nothing in the table is tuned to reproduce Ken's star and square. Ken's legitimacy rule (p. 189) applies: tuning would be "cheating".

(b) Relationships (RELATE hook)
- dominates gains (for (relative-size ? ?) 'greater-than strength 'medium).
- This fulfills Ken's comment at relate.22:63, "even more typical would be size", and p. 157, "be larger than the other".

(c) Comparisons (CSUMRY hook)
- Physical uniqueness also suggests different-from for the relative appearance elements. p. 94: a unique character should "move (or appear) differently".
- The (? ? ?) patterns for "all" and "personality" uniqueness already reach any relative element.

(d) Dynamics: a new source type
- This follows p. 175: "the way an image is rendered is influenced strongly by how it is to change ... a subtle color effect ... will be overridden if that character moves quickly".
- A rule table on each element's plist:
  - shape-jaggedness: path-jaggedness same, path-curvature opposite;
  - shape-complexity: speed opposite.
- These read the character's chosen dynamics choice points. The source is (dynamics-of cinderella path-jaggedness).
- CHOOSE gets two wrappers:
  - gather-suggestions-of-type handles 'dynamics-suggestions;
  - source-type maps dynamics-of to 'dynamics-suggestions.
- Neither input ever occurs in 1978.

(e) Global levels (GLOSUG hook)
- (flashiness level) extends to size, color-intensity and color-saturation. This is Ken's own glosug.41:39-40 note: "size is also bigger is flashier / color is many and bright is flashier".
- (complexity level) extends to shape-complexity. This is the experts' "simplicity" (p. 164).
- (obviousness level), when low or medium, pulls appearance elements toward medium (p. 165: "if the film is supposed to be obvious, then many aspects should be used---if subtle, then only a few").
- Variety comes free from possible-values.
- Each extension delegates to the 1978 receiver first and adds a suggestion only for appearance elements.

2.4 Values
- Choosing, conflicts, postponement and given-up are Ken's code, unchanged.
- An appearance value is never passed to weightify. APPEAR has its own appearance-number tables:
  - size: low .036, medium .05, high .07 (ANINIT's .05 default and the stepmother's .07);
  - color-intensity and color-saturation get similar tables.
- A (not X) value becomes the middle of the two values left, so the (not high) failure that stops pass 2 cannot happen here.

3. THE SHAPE EXPERTS (p. 164)
- shape-expert has three children: polygon-expert, star-expert and blob-expert. Each holds (shape: name angle center-offset shape-jaggedness shape-complexity) entries for shapes Director's poly can draw (TUTIL draw-poly, sides = 360/gcd(angle,360)).
- Together they cover the nine (jaggedness, complexity) cells:

  | Jaggedness \ complexity | low | medium | high |
  |---|---|---|---|
  | low | circle (angle 5) | hexagon (60) | octagon (45) |
  | medium | square (90) | pentagon (72) | ten-pointed star (108) |
  | high | triangle (120) | star (144) | eight-pointed star (135) |

- (choose shapes) runs once, after the appearance choices, for each character in focus order (Cinderella first). It works like this:
  1. Constraints. Each shape element's current-choice becomes a constraint, with its justification: Ken's total-strength of the winning suggestion the choice point memorized (choose.198:410).
  2. Ask the experts. Every expert is asked for shapes that satisfy all the constraints. (not X) means any value but X.
  3. Tell them apart. Unless the film's variety is low, a shape already taken by another character is removed. This is p. 94's "divergent values ... to help the viewer distinguish". In black and white, shape is what tells characters apart.
  4. Relax if nothing is left. Drop the least justified constraint, record (relaxed: element shape-complexity value low justification 2 because no-shape-fits), and try again.
  5. Select. Among the survivors, select by the film's levels: originality low takes the expert's stereotypes first, high takes them last; complexity low takes fewer sides first.
  6. Record. Each step is memorized on the actor (appearance-of <character>) as items: considered:, rejected:, relaxed:, tell-apart:, chosen:.
- Redetermination (choosing the least justified value again) is noted as stage 6.
- (appearance-of c) also holds:
  - ani-size, from size;
  - look-color (hue-angle saturation value), from hue, saturation and intensity: HIS, "conceptually easier" (p. 163);
  - offset: 20 for star-expert shapes, after ANINIT's "since a star is denser", and 10 otherwise.
- A save-answers wrapper appends the (define (appearance-of c) appearance ...) forms to the CP file.
- (choose-appearance-for stand-in descriptions) is exported for item (3), so an "after" description (Cinderella elegant) gets its own look the same way.

4. PASS 2: THE LOOK INTO THE PROGRAM, AND WHEN LOOKS CHANGE

4.1 Starting looks
- A RUN save-all wrapper (run.65:113) appends to each scene program (ask <c> take look <look>), with <look> taken from (ask (appearance-of c) yield your look for <scene>).
- That defaults to the pass-1 look. Item (3) can memorize a later one for scenes after a transformation.
- ANINIT's start runs initialize-characters before it loads the program (aninit.65:203-206), so the program's look overrides Ken's defaults.

4.2 Look changes are display methods
- They are defined in a DISPLY hook:
  - look-change: (element (c e), amount (sign level), speed): the factor is 1 + .25 × weightify(level), or its reciprocal, copied from change: (disply.311:1054);
  - look-change-to: (element, new-value, speed): the factor is the ratio of appearance-numbers. A hue goes along the wheel. A shape goes to the expert's new shape.
- Each has run ... in ?subscene and estimate time for receivers.
- The estimates reuse Ken's estimate-time-for-change-by. So an emotion's look change lasts exactly as long as its dynamics changes, and no parasite subscene ends later (action.152:41 waits for both).
- run-look-change adds (gradually change look by F factor for size at S speed), or (change look to shape triangle in N ticks), to (changes-for c). It also sets the next subscene's (c e) value, as run-change-to does, so "yield most current value of" works.
- Both are children of change-method, so scene.9:179 and 190 run them without stretching and don't count their time. chomet.123:463 accepts display-value-change suggestions wholesale, as it does Ken's.

4.3 When looks change: Ken's three sources (p. 166)
- Emotional states. An EMOTE hook teaches joy (look-change: element (,character color-intensity) amount ,joy-level speed ,(second joy-level)). This is p. 166: "the intensity of the colors of the character be increased". The revival adds a small size change for (positive high) and (negative high), marked as the revival's.
- Inside a display method (stage 6). After contact in repeatedly-come-in-contact and move-to-each-other, each character's shape is briefly in-betweened 20% toward the other's and back, triggered by DICHAR's collision test. p. 166: "change their shape slightly to convey the idea that they are communicating".
- The script. Item (3)'s causes/change methods emit look-change-to: suggestions for the appearance elements whose values differ between the before and after descriptions (shabby to elegant). Mechanism and interface come from here.

4.4 How (p. 167)
- Size and intensity follow Ken's e-fold rule: 5 seconds per e-fold at medium speed (interf.149:916, dichar.103:105-117).
- Hue and saturation move along the HIS path.
- Shape is in-betweened by Director's own interpolation, KEN1;INTER: interpolate-two-calls on (draw-poly 100.0 old-angle) and (draw-poly 100.0 new-angle).
- A transition shorter than one frame is instantaneous. p. 166: "Occasionally the transition should be instantaneous".
- There is no easing, as in Ken's "for now dont do any easing out" (dichar.103:396).

4.5 Transient changes reset per scene
- Changes last until the scene ends, like dynamics changes (scene.9:271, run.65:42, aninit.65:203).

5. DIRECTOR SIDE (LOOKS, DICHAR hook)
- (take look ?look) sets ani-size, angle, center-offset, look-color and offset. Then it does (set your how-to-draw to nil) once more. This is because OBJECT's shape-arg demon hides and shows before it stores (object.401:458-460; verified that the angle otherwise lags).
- (gradually change look by ?f factor for ?e at ?s speed) repeats (grow your look e by rate) for round(ticks-to-grow-e × |ln f|) ticks, with dichar's formula and its quirks.
- (change look to shape ?s in ?n ticks) sets look-morph to the interpolation and runs look-amount from 0 to 1, then takes the new angle.
- director-character draws with (when drawing use draw-look of size angle look-morph look-amount). draw-look calls draw-poly, or the interpolation at the given amount.
- Colors are never sent to pencolor, so a 16-color palette can't run out.

6. RECORDING AND THE PAGE
- recorder(L, { looks: true }) reads at each CLICK: ani-size, angle, center-offset, look-color, offset and look-amount.
- They are stored as a new top-level film.looks of [frame, character, look], changes only. This holds only when appear is on.
- frames[].chars is untouched, and packFilm and FILM_FORMAT 2 carry looks and extensions.
- Black and white needs no change: the recorded segments already show the shapes, sizes and in-betweens.
- In drawFrame, color mode takes the frame's look (look-color converted from HSV to RGB, ani-size × ROOT, offset) and falls back to SHAPE_LOOK.
- icon() draws from the angle by TUTIL's rule (turn by the angle, 360/gcd sides), so the legend shows Ani's shapes.
- The cast cap of 6 (SHAPES) is lifted when appear is on.

7. THE GLASS BOX
- whyPanel gets a section "How she looks", collapsed by default. Its first line is plain, for example: "Ani made her a small circle: small because she is shy and the stepmother dominates her; smooth because she is friendly and graceful and moves along smooth paths; simple because she is shy and the film's complexity is low."
- Each aspect opens the existing choicePointBox for its choice point: suggestions, sources, conflicts, rejections, plus the evidence quote from appearance-evidence.
- "Ani's shape experts" lists:
  - what each expert offered;
  - what tell-apart removed ("The fairy godmother would also have been a circle ...");
  - any relaxation and why ("simple was her least supported choice: only the film's variety suggested it").
- The section always ends: "In 1978 Ken drew her himself as a green star (ANINIT's initialize-characters; thesis p. 17, 'I choose the following shapes and sizes'; p. 163, 'not conceived or chosen by Ani')."
- In a 1978 run the section shows only that last line.
- caption(): look-change: and look-change-to: join the "changes" branch, so captions read like "and Cinderella's colors dim". A note says color changes show only in color mode.
- prepScene learns these patterns: (ask x take look, gradually change look, change look to shape.
- ACTIVITY and FAMILY name the look changes. methodText reads them aloud.
- app/pass1.html gains a Looks group in ELEMENTS and RELATIVE, and an experts panel.
- codeIndex and build-source-app index the REVIVE files, so every code link reaches the extension.

8. THE 1978 FILM STAYS EXACTLY REPRODUCIBLE
- With extensions [], the boot, recorder, glassBox keys and page data are byte-for-byte today's.
- tools/check-1978.mjs (shared stage 0) asserts:
  - CP 29 102/102, in place;
  - every KEN; program byte-equal to reports/pass2;
  - each scene's frames and events equal to reports/film/*.film.json.
- In extended mode, the dynamics-first order keeps the original 102 choices by construction (asserted by name).
- Pass 2 of Cinderella is planned the same: removing the take-look forms and the look-change entries gives the 1978 programs. The look estimates equal the dynamics ones, and pass 2 still sees ani-size 0 (interf.149:131-135) until appear-plan is turned on.
- The film itself may differ, because Director's collisions use size (dichar.103). That is recorded as an extension golden and explained.

9. STAGES (each ends with something Ken can look at)
- Stage 0 (shared with items 3 and 4): EXTENSIONS, the switch, check-1978, provenance in saved runs and films.
- Stage 1: size in pass 1 (4 absolute and 6 relative choice points), the knowledge table, dominates and comparisons, pass1.html Looks rows.
- Stage 2: looks into the film: take look, recorder looks, the page draws them, "How she looks".
- Stage 3: shape elements, the dynamics source, the experts with relaxation and tell-apart, icons.
- Stage 4: color: hue-net, intensity, saturation, HIS, color mode.
- Stage 5: look-change methods, joy, Director growth and INTER morphs, captions.
- Stage 6:
  - contact morphs inside display methods;
  - the item (3) interface;
  - appear-plan: ani-size on pass 2's characters, and the bigger prerequisite read like faster (prereq.19:27-39, 62; disply.311:621), per interf.149:134 "for now";
  - appear-order: interleaved, the style experiment;
  - redetermination.

## Alternatives considered

- - **name:** A. Recommended: appearance inside Ani, in Lisp (REVIVE;APPEAR for pass 1 and 2, REVIVE;LOOKS for Director)
- **why_not_or_why:** This is what the thesis says, nearly word for word. p. 163: "in much the same way that the typical dynamics of characters is handled". p. 104: the value mechanisms "should work well for other elements such as the size, shape, color". p. 164: a hierarchy of shape experts with relaxation. p. 166: "A dynamics change is a display method". p. 167: "Director's interpolation capability is adequate". The suggestions, conflicts, postponements and rejections then come from Ani's own code, so the existing pass-1 glass box explains them with no new reasoning code in JS. Cost: more Lisp, and care with Director's load order and demon order.
- - **name:** B. A JavaScript look layer around Ani (descriptor table to look in JS, plus look changes injected at emotion events in the recorded film)
- **why_not_or_why:** Rejected. It is quick, but it is not Ani choosing. Conflicts, relative values, variety and postponement would all need a second implementation. The changes could not take part in planning: their durations must match the dynamics changes, or a parasite subscene ends later (action.152:41 runs movements and changes together). The glass box would explain the revival's code, not Ani's, and Ken would not recognize it as his Chapter X.
- - **name:** C. Appearance as a third element type under each character ("character by character" order, the code report's in-memory prototype)
- **why_not_or_why:** Kept as an experiment, not the default. Interleaving puts appearance choice points into the same postponer queue as the 102 dynamics ones (postpo.28:78-105). The order then can, in principle, move CP 29's choices; the prototype kept them only for size. The thesis names this exact contrast as a style experiment never run (p. 240: "a system that completely determined the description of each character one at a time would have a different style"; footnote: "Ani can explore the spaces of choices in either order. Experiments ... have yet to be made"). So it is offered as appear-order: interleaved.
- - **name:** D. Shape as one unordered choice point per character, with the experts as a suggestion source
- **why_not_or_why:** Deferred. It would need a shape-net value description: combine, compromise, opposites. Ken describes the experts as a separate step that is "combined, compared, and selected between on the basis of the desired levels of variety, simplicity, originality", with relaxation when nothing fits (p. 164). A separate step, recorded as items, is clearer in the glass box.
- - **name:** E. Reuse change: and change-to: for appearance elements by wrapping run-change-to
- **why_not_or_why:** Rejected. run change-to: calls weightify on the current and new values before run-change-to (disply.311:1069-1070), so a (not high) appearance value would stop pass 2, the same failure as WEIGHTIFY in PLAN.md. Its effect, multiplying (E factor) in special-dynamics, is read by no drawing code. New look-change: and look-change-to: children of change-method are still treated as change methods by scene.9:179 and 190 (run without stretching, time not counted) and are labeled distinctly in the glass box.
- - **name:** F. Decide look changes in Director only (demons on emotion events)
- **why_not_or_why:** Rejected. The thesis puts "when to change" in Ani's planning, "in much the same manner that Ani currently decides when to change the typical dynamics" (p. 166), so the change must be a planned method with a task, a source and a time estimate.
- - **name:** G. Swap in a new actor for a new look (say cinderella-elegant), or interpolate Director's angle variable
- **why_not_or_why:** Rejected. The recorder files segments under the new name, and the page draws only run.cast. Interpolating angle makes draw-poly draw 360/gcd(angle,360) sides, up to 360 segments a frame. Shape changes instead use KEN1;INTER on the same actor (fix-headings matches a square's 360 degrees to a star's 720).
- - **name:** H. Color through Director's own colors (set your colors to, change your colors to ... in N ticks)
- **why_not_or_why:** Rejected for the pipeline. The pipeline films in black and white, and the page paints color mode. Gradual mixing makes a new R-G-B color every tick (TUTIL pencolor-rgb), which would exhaust a 16-color palette. Ani's color is kept as a look-color (hue, saturation, value) variable that LOOKS interpolates and the recorder records, along the HIS path the thesis calls "conceptually easier" (p. 163 footnote).
- - **name:** I. Generate initialize-characters in pipeline.js from the CP file (the SHAPES route)
- **why_not_or_why:** Rejected as the main route. RUN's save-all instead writes each character's starting look into the scene program, which is then Ani's own record of what Director was told. Filming needs no new channel, and item (3) can give later scenes a different starting look. SHAPES stays as the 1978-mode default.

## Changes, file by file

- - **file:** src/director/revive/appear.lisp (new, REVIVE;APPEAR)
- **what:** Ani's side. In ELEMNT: appearance-element and its six elements with their relative elements. In COSUG: hue-net. In FILM: appearance-choice-point with sources, priorities and sample. (choose-appearances): appearances-node, then Ken's make-choices-until-completed, then the shape experts. teach-appearance and the knowledge table with evidence (DSCRP, RELATE, CSUMRY, EMOTE hooks). The dynamics-suggestions source (CHOOSE wrappers for gather-suggestions-of-type and source-type). Extensions of GLOSUG's flashiness, complexity and obviousness. Shape experts with relaxation and tell-apart, recorded on (appearance-of c). appearance-number tables. A save-answers wrapper (DATEST) that appends appearances to the CP file. A save-all wrapper (RUN) that writes take-look forms. look-change: and look-change-to: methods with run and estimate receivers (DISPLY). choose-appearance-for, exported for item (3).
- - **file:** src/director/revive/looks.lisp (new, REVIVE;LOOKS)
- **what:** Director's side, as a DICHAR hook: the take look receiver (with the second how-to-draw reset); gradually change look by F factor (dichar.103:102-121's timing); change look to shape via KEN1;INTER interpolate-two-calls and look-amount; draw-look as director-character's drawing procedure; look-color kept off the palette.
- - **file:** src/pipeline.js
- **what:** Add EXTENSIONS.appear (files appear, looks; afterPass1 (choose-appearances); recorder looks) plus the appear-plan and appear-order entries. boot loads extensions after the bridge. pass1 runs afterPass1 and returns appearances. glassBox adds an appearances key, only when on. film passes looks:true to recorder; recorder records film.looks as changes only. storyPlan lifts the 6-character cap when appear is on.
- - **file:** src/glassbox-pass1.js
- **what:** collectAppearances(L): each (appearance-of c) with its variables and its considered:, relaxed:, tell-apart: and chosen: items, plus the appearance-evidence of every descriptor the character has.
- - **file:** app/film.template.html
- **what:** The shared switch. drawFrame uses the per-frame look in color mode, with SHAPE_LOOK as fallback. icon() and the legend draw from the angle by TUTIL's rule. whyPanel gets the 'How she looks' section, with Ken's 1978 line always present. caption() treats look-change methods as changes. prepScene gets the new regexes. ACTIVITY, FAMILY and methodText cover look changes. comparePanel shows looks side by side. packFilm carries looks.
- - **file:** app/film/save.js
- **what:** FILM_FORMAT 2: extensions and looks are saved and restored. Version 1 files read as 1978.
- - **file:** app/pass1.template.html
- **what:** Add the Looks group to ELEMENTS and RELATIVE, the experts panel, and evidence quotes beside appearance suggestions.
- - **file:** app/film/llm.js
- **what:** When the switch is on, tell the model that physical words (beautiful, shabby, magical, strong, ...) now decide how characters look.
- - **file:** tools/build-film-app.mjs
- **what:** codeIndex includes the REVIVE files. vocabulary() marks words that have appearance suggestions, parsed from appear.lisp's teach-appearance table, when the switch is on.
- - **file:** tools/build-source-app.mjs
- **what:** List every file in src/director/revive/, so the code links reach APPEAR and LOOKS.
- - **file:** tools/build-ani-bundle.mjs
- **what:** Also run with extensions on and compare the project files with the bundle, so the REVIVE files are guaranteed in the manifest.
- - **file:** tools/check-1978.mjs (new, shared stage 0)
- **what:** The golden test: CP 29 102/102 in place, programs byte-equal, and frames and events equal at 4 fps (optionally 24). run-pass1.mjs exits non-zero on a mismatch.
- - **file:** tools/check-appear.mjs (new)
- **what:** Conservative and extension goldens. With appear on: the original 102 choice points by name and value; the new choice points listed; Cinderella's programs equal to 1978's after stripping look forms; the films of Cinderella and red-riding-hood against reports/ext/appear/; and a printed Ken-vs-Ani look table with reasons.
- - **file:** test/appear.test.mjs (new, fast node:test)
- **what:** Lisp-level tests of APPEAR and LOOKS, listed under tests.
- - **file:** reports/ext/appear/
- **what:** Committed goldens: CP file, programs, films and the pass-1 glass box for Cinderella and red-riding-hood with appear on.
- - **file:** PLAN.md
- **what:** A Phase 9 (Chapter X) entry: what Ani chose for Cinderella against Ken's 1978 shapes, the relaxations she needed, how the film changed, and the stage status.

## Lisp sketch

```lisp
;;; -*-lisp-*-
;;; REVIVE;APPEAR: Ani chooses how her characters look, and when their looks change.
;;; This file is ours, not Ken's. AI-TR-540 pp. 163-167: "In much the same way that the
;;; typical dynamics of characters is handled, the appearance of a character would be
;;; broken down into aspects and the aspects in turn broken down into elements."
;;; Loaded only for "Ani with the revival's extensions", after REVIVE;BRIDGE.

;;; ------------------------------------------------ 1. elements (p. 163; p. 104)
(+after-load '|ken;elemnt >|
 '(let ((:insert-methods-at-end nil))
   (define appearance-element element          ;;three-valued like speed, so COSUG
    (set your value-description to three-values-and-not) ;;combines them unchanged
    (set your possible-values to (high medium low))       ;;and (variety level) applies
    (do when receiving (yield a value that is ?three-value) three-value))
   (define relative-appearance-element relative-element)
   (define size appearance-element (set your relative-element to relative-size))
   (define shape-jaggedness appearance-element            ;;"smooth or jagged"
    (set your relative-element to relative-shape-jaggedness))
   (define shape-complexity appearance-element            ;;"simple or complex"
    (set your relative-element to relative-shape-complexity))
   (define color-intensity appearance-element
    (set your relative-element to relative-color-intensity))
   (define color-saturation appearance-element)
   (define color-hue appearance-element                   ;;"a semantic net of colors" (p. 240)
    (set your value-description to hue-net)
    (set your possible-values to (red orange yellow green blue purple)))
   (mapc (function (lambda (r) (eval '(define ,r relative-appearance-element))))
	 '(relative-size relative-shape-jaggedness relative-shape-complexity
	   relative-color-intensity))))

;;; ------------------------------------------------ 2. choice points, dynamics first
(+after-load '|ken;film >|
 '(progn
   (actor-of 'absolute-choice-point)
   (define appearance-choice-point absolute-choice-point)
   (ask appearance-choice-point set your suggestion-sources to
	((absolute-suggestions neighbors-absolute-suggestions opposites-absolute-suggestions)
	 relative-suggestions dynamics-suggestions global-suggestions))
   (ask appearance-choice-point set your source-priorities to
	(default-source-priorities: absolute-suggestions 3 neighbors-absolute-suggestions 2
				    opposites-absolute-suggestions 1 relative-suggestions 4
				    dynamics-suggestions 2 global-suggestions 1))
   (ask appearance-choice-point set your minimally-happy-sample-suggestion to
	(suggestion: element dont-care value dont-care-either strength medium
		     source (and shy relative-choice-point)))))

(define-function choose-appearances nil
 ;;p. 240: "Ani can explore the spaces of choices in either order"; this order (dynamics,
 ;;then looks) leaves the 102 choices of CP 29 untouched since they are all made already
 (define appearances-node top-level-node)
 (mapc (function
	(lambda (character)
		(let ((node (intern (append-atoms character '-appearance-node))))
		     (ask appearances-node make ,node)
		     (ask ,node set your node-for to ,character)
		     (mapc (function
			    (lambda (element)
				    (ask ,node add (ask appearance-choice-point
							if new make (choice-point-of ,character ,element))
					 to your list of choices)))
			   (ask appearance-element recall your offspring)))))
       (ask character recall your offspring))
 (make-choices-until-completed 'appearances-node)   ;;Ken's own loop, unchanged
 (ask shape-expert choose shapes for ,(characters-in-focus-order)))

;;; ------------------------------------------------ 3. what suggests a look
;; Ken's rule (p. 189): add obvious knowledge, never arrange the answer. Each entry
;; carries its evidence, which the glass box quotes.
(define-function teach-appearance (entries)
 (mapc (function
	(lambda (entry)
		(let (((descriptor element value strength evidence) entry))
		     (ask ,descriptor process suggestions (for ,element ,value strength ,strength))
		     (putprop descriptor (cons (list element value evidence)
					       (get descriptor 'appearance-evidence))
			      'appearance-evidence))))
       entries))

(+after-load '|ken;dscrp >|
 '(teach-appearance
   '((friendly shape-jaggedness low medium (thesis 161 "smooth is friendly"))
     (evil color-intensity low high (thesis 161 "bad guys wear black"))
     (strong size high medium (thesis 238 "a large pointed shape" for "a strong friendly ally"))
     (strong shape-jaggedness high low (thesis 238 "pointed shape (typically an unfriendly shape)"))
     (shabby color-saturation low high (thesis 225 "muddy, dull"))
     (shabby shape-jaggedness high low (thesis 166 "shabby and ragged"))
     (beautiful color-saturation high medium (thesis 225 "bright and harmonious colors"))
     (shy size low medium (revival "a shy character takes up little room"))
     (magical shape-complexity high medium (revival "magic sparkles: many points")))))

(+after-load '|ken;relate >|   ;;relate.22:63 "even more typical would be size"; p. 157
 '(ask dominates process suggestions (for (relative-size ? ?) 'greater-than strength 'medium)))

;; p. 175: "the way an image is rendered is influenced strongly by how it is to change"
(defprop shape-jaggedness ((path-jaggedness same medium) (path-curvature opposite low))
	 dynamics-suggestions)
(defprop shape-complexity ((speed opposite low)) dynamics-suggestions)

(define-function gather-dynamics-suggestions (choice-point)
 (let ((thing (ask ,choice-point recall your thing))
       (element (ask ,choice-point recall your element)))
      (mapcan
       (function
	(lambda (rule)
		(let (((moving relation strength) rule))
		     (let ((value (ask (choice-point-of ,thing ,moving) recall your current-choice)))
			  (and value (not (eq value 'none))
			       (list '(suggestion: element ,element
						   value ,(cond ((eq relation 'same) value)
								(t (example-of (ask ,element ask your value-description
										    to yield opposite of ,value)
									       something)))
						   strength ,strength
						   source (dynamics-of ,thing ,moving))))))))
       (get element 'dynamics-suggestions))))

(+after-load '|ken;choose >|   ;;both wrappers only add cases 1978 never meets
 '(progn
   (putprop 'gather-suggestions-of-type (get 'gather-suggestions-of-type 'expr) 'choose-198-expr)
   (defun gather-suggestions-of-type (type choice-point)
     (cond ((eq type 'dynamics-suggestions) (gather-dynamics-suggestions choice-point))
	   (t (funcall (get 'gather-suggestions-of-type 'choose-198-expr) type choice-point))))
   (putprop 'source-type (get 'source-type 'expr) 'choose-198-expr)
   (defun source-type (source)
     (cond ((and (not (atom source)) (eq (first source) 'dynamics-of)) 'dynamics-suggestions)
	   (t (funcall (get 'source-type 'choose-198-expr) source))))))

(+after-load '|ken;glosug >|   ;;glosug.41:39 "size is also bigger is flashier"
 '(let ((:insert-methods-at-end nil))
   (define-extension-method (yield suggestions for ?choice-point) (flashiness level)
     (or (ask-old :self yield suggestions for ,choice-point)
	 (let ((element (ask ,choice-point recall your element-name)))
	      (and (memq element '(size color-intensity color-saturation))
		   '(suggestion: element ,element value ,(ask :self recall your level)
				 strength medium source ,:self)))))))

;;; ------------------------------------------------ 4. shape experts (p. 164)
(define shape-expert something
 (do when receiving (suggest shapes satisfying ?constraints)
     (mapcan (function (lambda (shape) (and (shape-satisfies? shape constraints) (list shape))))
	     (ask :self recall your shapes))))

(define polygon-expert shape-expert   ;;Director's poly: 360/gcd(angle,360) sides (TUTIL)
 (set your shapes to
  ((shape: name triangle angle 120 center-offset (right 30) shape-jaggedness high shape-complexity low)
   (shape: name square angle 90 center-offset nil shape-jaggedness medium shape-complexity low)
   (shape: name pentagon angle 72 center-offset nil shape-jaggedness medium shape-complexity medium)
   (shape: name hexagon angle 60 center-offset nil shape-jaggedness low shape-complexity medium)
   (shape: name octagon angle 45 center-offset nil shape-jaggedness low shape-complexity high))))
(define star-expert shape-expert
 (set your offset to 20.0)            ;;ANINIT: "since a star is denser"
 (set your shapes to
  ((shape: name star angle 144 center-offset (right 18) shape-jaggedness high shape-complexity medium)
   (shape: name ten-pointed-star angle 108 center-offset nil shape-jaggedness medium shape-complexity high)
   (shape: name eight-pointed-star angle 135 center-offset nil shape-jaggedness high shape-complexity high))))
(define blob-expert shape-expert
 (set your shapes to
  ((shape: name circle angle 5 center-offset nil shape-jaggedness low shape-complexity low))))

(define-receiver (choose shapes for ?characters) shape-expert
 (do ((c characters (rest c)) (taken nil))
     ((null c) no-value)
     (let ((shape (choose-shape (first c) (shape-constraints (first c)) taken)))
	  (setq taken (cons shape taken))
	  (ask (appearance-of ,(first c)) take shape ,shape))))

(define-function choose-shape (character constraints taken)
 ;;"If no shape class can satisfy the constraints ... A constraint can be eliminated" (p. 164)
 (let ((appearance '(appearance-of ,character)))
      (do ((cs constraints (relax-least-justified cs appearance)))
	  (nil)
	  (let ((offered (mapcan (function (lambda (e) (ask ,e suggest shapes satisfying ,cs)))
				 (ask shape-expert recall your offspring))))
	       (ask ,appearance memorize (considered: constraints ,cs shapes ,(names-of offered)))
	       (let ((left (tell-apart offered taken appearance)))   ;;p. 94: help the viewer
		    (cond (left (return (select-by-film-levels left appearance))) ;;variety, simplicity, originality
			  ((null cs) (return (first offered)))))))))

;;; ------------------------------------------------ 5. look changes (pp. 166-167)
(+after-load '|ken;disply >|
 '(progn
   (define look-change: change-method (set your value-description to change:-package))
   (define look-change-to: change-method (set your value-description to change-to:-package))
   (define-receiver (run look-change: element ?element amount (?sign ?amount)
			 speed ?speed in ?subscene) look-change:
     (run-look-change element (change:-factor sign amount) speed subscene))
   (define-receiver (estimate time for look-change: element ? amount (?sign ?amount)
			      speed ?speed in ?) look-change:
     ;;Ken's estimate, so a joy's look change lasts exactly as long as its dynamics changes
     (estimate-time-for-change-by (change:-factor sign amount) speed))))

(define-function run-look-change (element factor speed subscene)
 ;;as run-change-to (disply.311:1079) but what changes is the look, not special-dynamics
 (let ((next-subscene (ask ,subscene recall your next-subscene)))
      (cond ((and (exists? next-subscene) (> (ask ,next-subscene recall your order-in-scene) 1))
	     (ask ,next-subscene set your ,element to
		  ,(look-value-after element factor subscene))))
      (ask ,subscene add (gradually change look by ,factor factor for ,(second element)
				    at ,speed speed)
	   to your list of (changes-for ,(first element)))))

(+after-load '|ken;emote >|   ;;p. 166: "the intensity of the colors ... be increased"
 '(ask joy process suggestions
       (for (establish (emotional-state ?character (joy ?joy-level)))
	    '(method: type display-value-change
		      value (look-change: element (,character color-intensity)
					  amount ,joy-level speed ,(second joy-level)))
	    strength 'medium)))

;;; ================================================ REVIVE;LOOKS (Director's side)
(+after-load '|ken;dichar >|
 '(let ((:insert-methods-at-end nil))
   (define-receiver (take look ?look) director-character
     (ask :self set your ani-size to ,(get look 'ani-size))
     (ask :self set your angle to ,(get look 'angle))
     (ask :self set your center-offset to ,(get look 'center-offset))
     (ask :self set your look-color to ,(get look 'color)) ;;HIS; never pencolor (16 colors)
     (ask :self set your offset to ,(get look 'offset))
     (ask :self set your how-to-draw to nil)) ;;again: OBJECT's demon redraws before it stores
   (define-receiver (gradually change look by ?factor factor for ?element at ?speed speed %followup)
		    director-character
     (let ((ticks (round (*$ (look-ticks-to-grow-e speed) (abs (log factor))))))  ;;dichar.103:105
	  (ask :self repeat (grow your look ,element by ,(expt factor (//$ (float (max ticks 1)))))
	       ,(max ticks 1) times !,followup)))
   (define-receiver (change look to shape ?shape in ?ticks ticks %followup) director-character
     ;;p. 167: Director's interpolation "preserves ... symmetries, connectedness, and openness"
     (ask :self set your look-morph to
	  ,(interpolate-two-calls '(draw-poly 100.0 ,(ask :self recall your angle))
				  '(draw-poly 100.0 ,(get shape 'angle))))
     (ask :self set your look-amount to 0.0)
     (ask :self set your (look-amount speed) to ,(//$ (float :frames-per-second) (float ticks)))
     (ask :self gradually set your look-amount to 1.0 then take shape ,shape !,followup))
   (ask director-character when drawing use draw-look of size angle look-morph look-amount)))

(defun draw-look (size angle morph amount)
 (cond (morph (funcall morph (float amount)))   ;;an in-between (KEN1;INTER)
       (t (draw-poly size angle))))
```

## Tests

- check-1978 (shared, stage 0). Run tools/check-1978.mjs with extensions []. It asserts: CP 29 is 102/102 with every choice in place; all five KEN; programs are byte-equal to reports/pass2/ken-*; each scene's frames and events are equal to reports/film/*.film.json at 4 fps (192, 116, 17, 179, 84 frames); optionally the same at 24 fps. Also make run-pass1.mjs exit non-zero on a mismatch.
- Pass 1 conservativeness. With appear on, every one of the original 102 choice points keeps its value, by name. New choice points are only (choice-point-of c e) for the six appearance elements and relative choice points for the four relative appearance elements: 24 + 24 for Cinderella at stage 4, 4 + 6 at stage 1. The test prints the new choices with their sources.
- Pass 2 conservativeness (appear on, appear-plan off). For each of Cinderella's five scenes, removing the appended (ask c take look ...) forms, the look-change entries in (changes-for c) and the subscene (c <appearance-element>) variables leaves a program byte-equal to 1978's. This proves the running times, methods and places are unchanged, because the look-change estimates equal the dynamics-change estimates.
- Extension goldens (reports/ext/appear/). These cover Cinderella and test/stories/red-riding-hood.lisp: the CP file, the programs, the films with looks, and the pass-1 glass box. Frame counts may differ from 1978 because Director's collisions use size; the differences are recorded in PLAN.md.
- Fast Lisp tests (test/appear.test.mjs) of the knowledge table. Use boot(fs, { extensions: ['appear'] }) and check: APPEAR and LOOKS load; each +after-load hook fires; (ask shy collect items memorized matching (suggestion: element size %)) gives low; every teach-appearance entry has appearance-evidence.
- Fast Lisp tests of hue-net and the shape experts. hue-net: red with yellow combines to orange, red with green is a complementary conflict, and (yield opposite of red) is green. Shape experts: (high low) gives triangle, (low low) gives circle, and (not high) excludes the stars. Tell-apart plus relaxation: two characters that both want (low low) at the same size get a circle and a hexagon, with a (relaxed: ...) item that names the least-justified element.
- Fast Director tests of growth and morphing. Growth: (gradually change look by 1.5 factor for size at medium speed) widens the recorded segment span by 1.5 in exactly round(ticks-to-grow-e × ln 1.5) ticks. Morph: (change look to shape star in 8 ticks) from a square draws closed figures, and the first and last frames' segments equal (draw-poly s 90) and (draw-poly s 144).
- Duration guard. In Kept Apart with appear on, subscene 3 (the joy changes, a parasite) ends on the same frame whether or not the look changes are present, so action.152's (run (and movements changes)) is not lengthened.
- Weightify guard. A story whose pass 1 gives an appearance element (not high) or none plans and films without WEIGHTIFY errors, using APPEAR's appearance-number tables.
- Bundle completeness. build-ani-bundle also runs with all extensions on and checks that the bundle alone makes the same frames as the project files.
- Page end to end (check-film-app.mjs). Turn the switch on and make Cinderella's film in the page; its frame counts match Node's. Clicking Cinderella shows 'How she looks' with an appearance choice point, the experts' record and Ken's 1978 line. Color mode paints Ani's look-color. A look-change caption appears in Kept Apart. A saved film file carries extensions ['appear'] and looks, and reopens. The switch survives a reload. With the switch off the page is unchanged.
- Ken-versus-Ani report. tools/check-appear.mjs prints, for each character, Ken's 1978 look against Ani's look with one-line reasons, for PLAN.md. This is a human check against the legitimacy rule (p. 189): no entry was tuned to reproduce Ken's star and square.

## Risks

- Choice order. The dynamics-first tree guarantees CP 29's choices by construction. The interleaved experiment (appear-order) can reorder the postponer's queue and move some of the 102 choices; it must be labeled as such in the glass box and in PLAN.md.
- Director's demon order. OBJECT 401's shape-arg demon hides and shows, which redraws, before it stores the new value (object.401:458-460; verified that the angle lags). take look therefore resets how-to-draw a second time. Per-tick look-amount changes may still lag by one tick inside a morph.
- KEN1;INTER is a reconstruction. Its use on draw-poly calls with different turning (a square's 360 degrees against a star's 720) is untested. fix-headings repeats a call by gcd, so some pairs could produce many moves; cap the move count, or fall back to an instantaneous change.
- The element name size is also a Director variable name. speed already coexists as both an Ani element and an object variable, but this needs checking in pass 2, where both Ani and Director actors are loaded.
- Size changes motion. Director's collisions and offstage checks use size (dichar.103:41-49 and 348-358), so an extended Cinderella films differently from 1978 even when the plans are identical. Tests compare plans exactly and films against extension goldens.
- The knowledge base's legitimacy. Appearance conventions are cultural (thesis p. 225 footnote; p. 161 on social conventions), and several entries are the revival's own. Each entry carries evidence that the page shows, and none may be tuned to reproduce Ken's 1978 shapes (p. 189).
- Visibility. In black and white only size and shape show. Color-intensity and saturation changes, including the thesis's own joy example, are visible only in color mode, so captions must say so.
- Durations. If a look-change estimate ever exceeds the dynamics changes of the same task (for instance a look-change-to: shape over one e-fold), a parasite subscene ends later and Kept Apart's ending frame moves. The duration-guard test watches for this.
- Hue-net needs its own combine path, because COSUG's combine-two-suggestions calls compromise-three-values directly for near-enough values. CHOOSE's try-to-compromise handles only top-bottom conflicts, so complementary hue conflicts fall through to strength.
- Item (3) depends on this design: the before and after looks through choose-appearance-for and (appearance-of c) yield your look for scene, and the look-change-to: method. The names must be agreed with that design before stage 6.
- Page budget and duplicated code. The claude.ai copy must stay under 950 KB with scripts under 800 KB. The looks data is small and the code is about 25 KB. Before adding the looks option, move run-scene.mjs's copied recorder onto pipeline.recorder so the two can't drift.
- ITS truncation. Future REVIVE files must not truncate to APPEAR or LOOKS.

## Effort

About 15 working days in 7 stages. Size works from end to end (stages 0 to 2) in about 4 to 5 days. Each stage ends with something Ken can look at, and check-1978 stays green throughout.
- Stage 0: switch, check-1978 golden and provenance, shared with items 3 and 4. 1 day.
- Stage 1: size as a pass-1 element, with knowledge table, dominates, comparisons and pass1.html rows. 1.5 days.
- Stage 2: take look in the scene programs, the recorder's looks, page drawing and the 'How she looks' section. 2 days.
- Stage 3: shape elements, the dynamics source, shape experts with relaxation and tell-apart, and icons. 3 days.
- Stage 4: color (hue-net, intensity, saturation, HIS) in color mode. 2.5 days.
- Stage 5: look-change methods, joy, Director growth and INTER morphs, and captions. 3 days.
- Stage 6: contact morphs inside display methods, the item (3) interface, appear-plan (sizes in planning, bigger), the appear-order experiment and redetermination. 2 to 3 days.

## Thesis references

- AI-TR-540 p. 17 (L615-632): 'The appearances of the characters are not currently determined by Ani. I choose the following shapes and sizes'; footnote: the colors 'were chosen by me'
- p. 163 (L4264-4280), X.A.1 Adding Appearances: aspects (size, color, line, texture, shape) and elements; HIS 'conceptually easier'; 'in much the same way that the typical dynamics of characters is handled'
- p. 164 (L4286-4305): a hierarchy of shape experts (polygons, spirals, blobs, stars); 'combined, compared, and selected between on the basis of ... variety, simplicity, originality'; constraint relaxation and redetermination; 'a large database rather than a very smart system'
- p. 165 (L4313-4321): which aspects to use ('obvious ... many aspects ... subtle, then only a few'); interference between aspects
- pp. 165-167 (L4322-4377), X.A.2 Changing Appearances: when (like dynamics changes: 'A dynamics change is a display method'), the three sources (emotion: 'intensity of the colors ... increased'; inside a display method on contact; the script, cinderella-beautified), how (instantaneous vs gradual, interpolation path and dynamics, 'Director's interpolation capability is adequate')
- pp. 103-104 (L2818-2846): Ch. V's mechanisms 'should work well for other elements such as the size, shape, color, and texture'; 'Should it appear large or small, rounded or pointed?'
- p. 94 (L2604-2612): a unique character should 'move (or appear) differently'; diverge on one or two elements to help viewers distinguish similar characters
- pp. 125-126 (L3370-3393): dynamics-change methods, a new value or factor plus how fast the change should be, suggested by emotional states, run alongside other activity
- p. 143 (L3809-3814): an extended Ani choosing 'shapes, sizes, colors, and textures (and the changes in these aspects)', and the new problem of interactions between aspects
- p. 157 (L4130-4132): a dominating character could 'appear above the other ... or be larger than the other'
- p. 161 (L4225-4229): social conventions matter more for appearances: 'bad guys wear black', 'smooth is friendly', 'green is jealous'
- p. 175 (L4579-4581): 'the way an image is rendered is influenced strongly by how it is to change'; subtle color 'overridden if that character moves quickly'
- p. 189 (L4939-4954): legitimate changes add obvious knowledge; arranging the outcome 'would constitute cheating'
- p. 225 (L5855-5861): 'bright and harmonious colors' more pleasant than 'muddy, dull, or clashing'
- pp. 238-239 (L6229-6242): a strong friendly ally given 'a large pointed shape', other aspects overriding its connotation
- p. 240 (L6270-6290): color spaces (RGB, HIS, a 'semantic net of colors') and the order of decisions as style; 'Ani can explore the spaces of choices in either order. Experiments ... have yet to be made'
- Code markers fulfilled: choose.198:290-294 (last-ditch-default 'eg size'), glosug.41:39-40 ('size is also bigger is flashier'), relate.22:63 ('even more typical would be size'), prereq.19:62 (bigger 'for now just a dummy'), interf.149:134 (sizes 'for now they don't change'), dichar.103:2 ('the dummy appearance stuff'), aninit.65:36-47 and 76-100 (Ken's hand-chosen shapes, sizes and colors), object.401:532-563 and KEN1;INTER (Director's interpolation)

## The review

**Verdict:** sound with fixes  
**Fidelity:** 4  
**Feasibility:** 3  
**Value:** 4

### Errors found

- The claim that look changes' time is 'not counted' (scene.9:179, 190) is only half right. scene.9:185-197 does skip change methods when it computes the subscene's stretch factor. But chomet.123:95-116 (ideal-time-for-task) and 118-129 (time-bounds-for-task) take the maximum over every method of a task, change methods included. So a look-change estimate feeds the emotion task's running time. Equal estimates keep the plans the same; a larger one changes them.
- 'The Director hooks never fire in pass 1' is true, but they do fire in pass 2. I ran pipeline.pass2 and checked L.loadedFiles: RUN's pass 2 loads KEN;DICHAR, KEN;OBJECT and KEN;POLY. LOOKS' DICHAR hook, including (ask director-character when drawing use draw-look ...), therefore runs in pass 2 and has to be safe there. Filming loads no Ani file (only ACTION, ANIMOV, DICHAR, DISACT and INTERF), so that half of the claim holds.
- 'Code markers fulfilled: choose.198:290-294 (last-ditch-default, eg size)' is not true. The design never sets a last-ditch-default. gather-global-suggestions reaches it only when the film gives no suggestion (choose.198:291-292), and (variety level) always suggests something for an element that has possible-values (glosug.41:43-55). So it could never fire for these elements anyway.
- Thesis p. 238 (AITR-540.txt L6229-6242) is used as evidence for 'strong suggests shape-jaggedness high'. It doesn't support that. The passage offers 'a large pointed shape (typically an unfriendly shape)' as a deliberately atypical 'odd distinguishing feature', whose connotations the other aspects must override. It is evidence that pointed means unfriendly (which friendly's opposite, unfriendly, already gets through opposites). It is not evidence for a strong-means-pointed stereotype.
- The sketch's draw-look and growth assume that changing ani-size redraws the character. It doesn't. size on director-character is a virtual variable, ani-size times the square root of turtlesize (dichar.103:13-14). OBJECT caches the float size inside how-to-draw (object.401:141-160), and only OBJECT's own 'set your size to' rewrites it (object.401:177-189). Setting ani-size invalidates nothing, so a gradual size change would alter collisions (are-they-colliding reads size live, dichar.103:348-352) but not the picture.
- Sketch bug in choose-appearances: (ask ,node add (ask appearance-choice-point if new make ...) to your list of choices) has no comma before the inner ask. As written it adds the literal ask form as a choice. Ken computes the choice point first and adds ,choice-point (nodes.38:85-96).
- Version naming is wrong. FILM_FORMAT is the string "ani-film", with a separate version field that the reader requires to be 1 (app/film/save.js:157, 160, 165), so the change is version 2, not 'FILM_FORMAT 2'. packFilm is in tools/build-film-app.mjs:95 and packs only the bundled 1978 films; the page has only unpackFilm (film.template.html:346).
- The build-ani-bundle change claims to 'guarantee' the REVIVE files are in the manifest. They already are: build-ani-bundle.mjs:71-74 keeps every KEN1; and REVIVE; file whether or not it was read. Only the extended-mode frame check is new.
- Two tests contradict the design's own table or KEN1;INTER. (1) '(not high) excludes the stars' is false: the ten-pointed star (angle 108) has jaggedness medium. (2) In the morph test the first frame does not equal (draw-poly s 90). fix-headings repeats the square twice to match the star's 720 degrees (src/director/ken1/inter.lisp:57-68), so amount 0 draws the square twice (8 segments). Separately, 'at the same size' plays no part in tell-apart as specified.
- Two statements about the color atoms contradict each other: 'No actors are named after colors, so the TV's color plists are never touched' and 'Opposites are complements, kept on the plist'. The color atoms already carry TV properties ((plist 'red) gives (BLUE 0 GREEN 0 RED 511)), so storing complements on them does touch those plists.
- The pass-2 conservativeness test can't hold for scenes 2 to 5 as specified. Each later scene's pass 2 loads the POSIT file written by filming the scene before (run.65:52-53, 74-83). With appear on, sizes change Director's collision and offstage checks (dichar.103:41-49, 348-358), so the characters start from other places and the later programs differ in locations and times, not just in look forms.
- The 1978 glass-box line names the wrong code for green. initialize-characters (aninit.65:36-47) sets only angle, center-offset and ani-size. Green comes from running-color (aninit.65:83).

### Gaps

- hue-net will fail as soon as two hue suggestions are combined. value-description sets its relative-value-description to value-description itself (cosug.215:107), and every child inherits that. The choice point's 'combine suggestions' and 'first combine ... then' go to the relative-value-description when there is one (cpoint.87:52-71). So color-hue's combines would reach the root value-description, which handles only zero or one suggestion (cosug.215:108-111), and get 'not understood'. Separately, the default 'yield opposite of' asks the value as an actor (cosug.215:115-116), and red isn't one, so opposites-absolute-suggestions would put value nil into a suggestion.
- Size growth and per-tick morphs won't show unless how-to-draw is reset every tick (see the size error above). The shape-arg demon also redraws with the old value before it stores the new one (object.401:458-460), so even a look-amount change lags a tick unless it is followed by a second reset.
- The design writes '(change look to shape S in N ticks)' into the program. The same program is filmed at 4 and at 24 frames a second (pipeline.film's fps option, and the page's 24 fps default), so N ticks would last six times longer at 4 than at 24. Ken's changes carry only a speed; dichar converts it to ticks at run time with :frames-per-second and :ticks-per-frame (dichar.103:105-109). The 'shorter than one frame is instantaneous' test has to happen in Director for the same reason.
- A look change with no other activity for that character creates new plans. scene.9:211-221 (plan-something-if-only-changes) makes the character wander around, or extends the previous subscene as a parasite, whenever it has changes but no actions; thesis pp. 125-126 describes exactly this. Joy's look changes are always paired with Ken's change: entries, so they are safe. Item (3)'s script look-change-to: and any unpaired change are not. A color-only change filmed in black and white would also lengthen the scene with nothing visible.
- Black on black: the page's TV screen is #000 or #0a0c0b (film.template.html:22, 38, 46). 'evil gives color-intensity low (high strength)' would paint the stepmother almost invisibly in color mode. The value needs a floor, or 'black' has to mean darker but still visible.
- Tell-apart and relaxation happen outside the choice points, and redetermination is deferred, so the choice point and the drawn shape can disagree. (choice-point-of c shape-jaggedness) can read low while the drawn shape is a square. pass1.html and choicePointBox show the choice point's value, so the override has to be flagged at the choice point, and the 'How she looks' sentence must be generated from the final shape's cell, not from the choice values.
- Stage 6's contact morphs, 'triggered by DICHAR's collision test', bring back the rejected alternative F (Director deciding). Thesis p. 166 places the change 'as part of a display method', so it belongs in DISPLY's method and plan, waiting on the contact event. Then the glass box can explain it.
- center-offset is a rotation applied before scaling ((right 18) for the star, (right 30) for the triangle; object.401:163-176). A morph that sets the new center-offset only when it finishes will make the shape jump by 18 or 30 degrees at the end.
- Color filming inside Director (run-scene.mjs --color, ANINIT's running-color) makes director-character a many-polys whose parts are plain polys copied at 'make your parts' (bridge.lisp, define-many-polys). Those parts keep the old angle and size and won't follow take look or morphs.
- Lifting the six-character cap is not enough. film() defines initialize-characters from plan.cast[].lisp, which comes from SHAPES (pipeline.js:200-206, 324-326), so a seventh character needs a neutral default. The page also gives each shape its own CSS tone, and the new shapes have none.
- hue-net's color model is underspecified. Neighbors one step apart on six hues have no hue between them to compromise to. The complements (red/green, orange/blue, yellow/purple) are an artist's red-yellow-blue wheel, while the page renders HSV, where red's complement is cyan. 'A hue goes along the wheel' needs to say which wheel.
- prepScene works from the glass box (film.template.html:861-894), not from program text. The take-look forms exist only in the program, so glassBox has to expose them before prepScene can 'learn' them.
- +after-load hooks run every time their host file loads (io.js:168-175). If a host is ever reloaded in one job, teach-appearance entries, appearance-evidence and the joy, dominates and summary demons will be added twice, unless they are made idempotent.
- Each scene's summary file, KEN1;<scene> MINI (choices-made-in), will also gain the look-change methods. RUN loads KEPT MINI for no-longer-kept-apart (run.65:46-47), so the conservativeness check should include the MINI files.
- Legitimacy (p. 189): 'evil suggests red' reproduces Ken's own red stepmother, which is the kind of entry the design forbids. check-appear should flag every entry whose result matches Ken's 1978 look.

### Fixes

- Define hue-net as a child of normal-value-description, so it inherits 'first combine ... then' and the n-ary combine. Give it (set your relative-value-description to hue-net). Give it its own receivers for 'yield opposite of', 'yield relationship' and 'compromise'. Keep the wheel as an alist on hue-net, not on the color atoms.
- In LOOKS, apply each tick of 'grow your look size' through OBJECT's (set your size to ...) path, or reset how-to-draw after multiplying ani-size. Use the same second (set your how-to-draw to nil) after every per-tick look-amount set. Add a test that the recorded segment span grows tick by tick.
- Write look changes with a speed or a time in seconds, e.g. (gradually change look to shape S at SPEED speed), and compute ticks in Director exactly as dichar.103:105-117 does. Run the duration-guard test at both 4 and 24 frames a second.
- Pair every look change with a dynamics change in the same task, or deliberately rely on plan-something-if-only-changes and say so (thesis pp. 125-126). For item (3), plan look-change-to: inside the activity that shows the cause (the fairy godmother's), so it never stands alone. Don't plan color-only changes for black-and-white runs.
- Run the pass-2 conservativeness test with the 1978 POSIT files mounted (reports/pass2/ken1-*.posit) for every scene, comparing both the programs and the MINI files after stripping. Compare against extension goldens only for chained runs.
- Fix the sketch: in choose-appearances, add ,(ask appearance-choice-point if new make (choice-point-of ,character ,element)). In LOOKS, make 'take shape' accept %followup and chain it as Director's gradually-set expects.
- Either set last-ditch-default on size and the shape elements (and note it is unreachable while variety suggests), or drop choose.198:290-294 from the list of markers fulfilled. Specify that none and (not X) map to the middle value with a glass-box note, and that none imposes no shape constraint.
- Cite p. 238 only for 'strong suggests size high', and only as the thesis's deliberately atypical example. Take 'pointed' from friendly's opposite (unfriendly), or mark strong-means-pointed as the revival's own. Mark the dynamics-to-shape rules as the revival's, with p. 175 as the motivation. Drop or re-source 'evil suggests red'.
- Give look-color a value floor on the black screen (for example V of at least 0.45), and let a low color-intensity read as 'darker' in the glass box.
- Record tell-apart and relaxation as items on the choice point itself (e.g. overridden-by: shape-experts), or implement tell-apart as relative different-from suggestions on relative-shape-* between similar characters (p. 94). Then Ani's own machinery makes the divergent choice and the glass box shows one consistent value.
- Put contact morphs in DISPLY's repeatedly-come-in-contact and move-to-each-other plans (the Ani side), triggered by the contact event that the plan's stop condition already detects.
- Include the orientation in the interpolated calls, e.g. (progn (right 18) (draw-poly 100.0 144)), so the morph ends exactly on Ken's center-offset. Cap the move count from fix-headings, and fall back to an instantaneous change.
- After take look, remake the many-polys parts ('make your parts') in Director color mode, or declare Director color filming unsupported when appear is on and say so in run-scene.mjs.
- For casts beyond SHAPES, give initialize-characters a neutral default such as (set your angle to 60) and let take look override it. Generate tones for the new shapes from look-color.
- Make teach-appearance and the demon additions idempotent: skip an entry that is already present.
- Bump save.js's version field to 2, have the reader accept 1 and 2, and put looks in the saved film. Leave packFilm alone, since the 1978 films have no looks.
- Correct the tests: the ten-pointed star survives (not high); the morph's first frame equals the square drawn twice; drop 'at the same size' from tell-apart. Note that 1978's run-pass1.mjs already fails on step errors but not on a CP 29 mismatch, so the change to it is still needed.

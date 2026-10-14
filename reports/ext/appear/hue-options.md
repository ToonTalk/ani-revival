# Where hues come from: main before and after Ken's uniqueness rule

*14 October 2026. A record of the hues Ani gives on `main` before and after Ken's decision 11 ([PLAN.md](../../chapter-x/PLAN.md), "Decisions" 11: "go with the uniqueness rule for hues"), so that Ken can see what changed. Each story's pass 1 was run with the page's set of extensions (MEND, KNOW, APPEAR, CHANGE), before at `c52a8bf` and after on `main` with the rule.*

## Why it changed

The review of stage 5 found that three of Cinderella's four hues were decided by the order of the revival's list of hues: where no word suggests a hue, the film's variety picks one by how often each has been used, and where all are used as often (none, for the first character), the list's order alone decides (`glosug.41:61-72`). That order, Itten's wheel read from yellow, was chosen because read from red it gave back Ken's green, red and yellow. An order chosen for what it gives is a weak source of hues. Ken chose his own uniqueness summary instead: "the finding that a character is unique suggests that that character move (or appear) differently from the others" (AI-TR-540 p. 94).

So `color-hue` has a relative element, as size, the shape elements and brightness have. Ken's CSUMRY summaries already suggest a relation for every relative element (uniqueness of all and of personality: different-from; likeness: same-as, or different-from for characters unlike each other), and the revival adds physical uniqueness for hue as it does for the other looks, labeled Ken's rule applied by the revival. `hue-net` reads `(different-from purple)` as COSUG reads a relative three-value, as the values left, "any hue but purple". A hue chosen so is drawn as one of the hues left, picked by the film's variety. The revival's order still breaks the ties the rule leaves, and is labeled the revival's.

## Each character's hue, before and after

Ken's 1978 hues: Cinderella green, the stepmother red, the fairy godmother orange, the Prince yellow. A hue in **bold** is Ken's 1978 hue for that character. "Any hue but ..." is the choice Ani made, drawn as the hue after it.

| Story | Character | Before | After | Why, after |
|---|---|---|---|---|
| Ken's Cinderella | Cinderella | purple | purple | first to take a hue, so no one to keep apart from; the middle of the revival's list |
| | the stepmother | orange | blue (any hue but orange, purple and red) | apart from the fairy godmother, Cinderella and the Prince; the variety's middle of the three left |
| | the fairy godmother | purple | **orange** | apart from Cinderella (purple) and the Prince (red), so magical's purple is set aside; the variety takes orange of the hues left, in the revival's order |
| | the Prince | red | red | apart from Cinderella (purple); the variety's red is allowed |
| six-colors (review) | Snow White | purple | purple | first |
| | the queen (magical) | purple | orange | apart from the others; magical's purple set aside |
| | the hunter | yellow | purple | apart only from the witch and the dwarf; Ken's comparisons find him like Snow White |
| | the dwarf | orange | blue (any hue but purple and red) | apart from the witch, Snow White and the Prince |
| | the Prince | red | purple | apart only from the witch |
| | the witch (magical) | purple | red | apart from Snow White; magical's purple set aside |
| opposite-hues (review) | the ant | purple | purple | first |
| | the bee | yellow | blue (any hue but purple and red) | |
| | the cat | orange | orange (any hue but purple and red) | not the bee's blue, drawn by then |
| | the owl | red | green (any hue but purple and red) | |
| | the fox (magical) | purple | red | apart from the ant; magical's purple set aside |
| joy-sad, joy-sad-medium, only-feelings (review) | the goat, the troll | purple, red | purple, red | the troll apart from the goat |
| beautified (review) | the girl, the fairy (magical), the sister | purple, purple, red | purple, orange, red | the fairy apart from the girl |
| appear-hues (stress) | the goat, the troll, the wizard (magical), the witch (magical) | purple, red, purple, purple | purple, blue, orange, red | both magical ones apart from the goat; the troll from all three |
| joy-looks (stress) | the goat, the troll | purple, red | purple, red | |
| appear-alike (twins) | Tweedledum, Tweedledee | purple, red | purple, purple | Ken's comparisons find the twins alike: same-as |
| Red Riding Hood | Red Riding Hood, the wolf, the grandmother, the woodcutter | purple, orange, red, yellow | purple, red, blue, orange | |
| tortoise and hare | the tortoise, the hare | purple, red | purple, red | |
| change-of-heart, socializing (Cinderella's cast) | as Ken's Cinderella | purple, orange, purple, red | purple, blue, **orange**, red | as in Ken's Cinderella |

**Does any give back Ken's 1978 hues?** Before the rule, none did. After it, one: **the fairy godmother is orange**, the hue Ken gave her in 1978, in Ken's Cinderella and in the two stories with his cast. It is not tuned away, as Ken asked. What makes it: his rule keeps her apart from Cinderella's purple and the Prince's red, which sets magical's purple aside, and the revival's order of the hues breaks the tie among the four left. Without the revival's physical row for hue she is orange all the same, since Ken's own CSUMRY summaries keep her apart; without magical's purple too. `tools/check-appear.mjs` flags it, and the decision in its `REVIEWED` says it is reported to Ken. No one else is drawn in one of Ken's hues: Cinderella is purple, the stepmother blue, the Prince red.

What else the rule does:
- **The villains differ from the heroine.** In the reviewer's story of six, Snow White, the queen and the witch were all purple; now the queen is orange and the witch red. (The review's m2.)
- **Alike characters may share a hue.** Ken's comparisons find Snow White, the hunter and the Prince alike, and the twins alike, so the rule doesn't keep them apart, and a same-as can even bring them together (the twins are both purple). Their shapes and sizes tell them apart.
- **Magical's purple gives way** where a magical character is to differ from someone already purple (the fairy godmother, the queen, the witch, the fox, the wizard): the relative suggestion is stronger than the word.
- **Frames and events are as they were** in every story: colors don't reach Director's motion.

## The order that breaks the rule's ties

The film's variety still takes the hues in the revival's order where the rule and the words leave a choice. With the rule in place, each reading of the same wheel gives, in Ken's Cinderella (pass 1 with APPEAR, `review5/hue-orders.mjs` from the review):

| Reading | Cinderella | Stepmother | Fairy godmother | Prince | Ken's hues given back |
|---|---|---|---|---|---|
| **yellow orange red purple blue green** (the revival's) | purple | blue | **orange** | red | fairy godmother |
| yellow green blue purple red orange | purple | **red** | green | blue | stepmother |
| orange red purple blue green yellow | blue | green | red | purple | none |
| orange yellow green blue purple red | blue | yellow | purple | green | none |
| red purple blue green yellow orange | **green** | yellow | purple | blue | Cinderella |
| red orange yellow green blue purple | **green** | orange | purple | **yellow** | Cinderella, Prince |
| purple blue green yellow orange red | yellow | orange | purple | green | none |
| purple red orange yellow green blue | yellow | green | purple | orange | none |
| blue green yellow orange red purple | orange | green | purple | **yellow** | Prince |
| blue purple red orange yellow green | orange | yellow | purple | red | none |
| green yellow orange red purple blue | red | yellow | purple | orange | none |
| green blue purple red orange yellow | red | orange | blue | purple | none |

7 of the 12 readings give back none of Ken's hues; the revival's reading, Itten's wheel from yellow, gives back one (the fairy godmother's orange), as three others do, and the reading from red gives back two. Before the rule, 7 of the 12 gave back none, the revival's among them (the review's table). Choosing a reading again by what it gives would be the same act as before, so the order is left as it was, and the choice is Ken's.

## The alternatives Ken passed over

- **Relationships: enemies at complements, friends near each other.** The stepmother, who dominates Cinderella and is hostile to her, would be drawn across the wheel from her, in yellow if Cinderella is purple, and friends a step apart. It follows Ken's relationship knowledge as `dominates` gives size (`relate.22:63`), but CINDY has few relationships, so most hues would still come from the variety's order.
- **Grey, with a sentence.** A hue no word suggests left grey, and the glass box saying "nothing suggests a hue for her, so Ani gives her none". The most honest, and the least colorful: three of Ken's four would be grey.

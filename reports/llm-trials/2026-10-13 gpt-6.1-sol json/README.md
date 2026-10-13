# JSON or Lisp? An A/B test of how a model drafts Ani's film descriptions

Ken asked (13 October 2026): "I'm wondering if models are much better at generating JSON
than Lisp. Would it help to have them generate JSON and the app translates it to Lisp?"

The film page's "Tell Ani a new story" now has both ways, as one setting ("The model
writes: JSON / Ken's Lisp"):

- **Lisp**: the model writes Ken's notation itself (the way it was).
- **JSON**: the model writes JSON to a schema (`storySchema` in `app/film/json.js`) whose
  word lists are Ani's words for each slot and whose task objects have the fields of
  each of Ken's task forms; where the provider enforces it (OpenAI's strict
  `json_schema`, here) the model can't use a word Ani doesn't know or a task of the wrong
  shape. The page puts the JSON into Ken's notation (`lispFromJson`), in his forms, and
  tidies and checks that as it does a Lisp draft. The prompt is the Lisp prompt's
  guidance with the task forms as JSON and Ken's CINDY as JSON for the example.

Same 15 stories both ways (the page's three examples and `test/stories/trial-stories.json`),
GPT-6.1 Sol, `tools/try-stories.mjs --format json|lisp --extensions mend,appear,change,know
--fix-rounds 2`, and Ani on every result at the page's 1,000-frame cap, with MEND, APPEAR,
CHANGE and KNOW (KNOW had landed: Ani ran from a snapshot of commit b8a46b0, Phase 9 stage
4). KNOW's own words aren't in the page's vocabulary yet, so neither prompt offers them.

This folder is the JSON arm; `../2026-10-13 gpt-6.1-sol lisp/` is the Lisp arm. Each
has the final round at the top and the first round in `round-1/`.

## Round 2 (the page as it now is), GPT-6.1 Sol

|                                        | Lisp        | JSON        |
|----------------------------------------|-------------|-------------|
| replies read as JSON                   | –           | 15 of 15    |
| drafts whose parentheses the page balanced | 0       | 0           |
| drafts with problems (checks, before the tidy) | 1   | 0           |
| drafts the tidy changed                | 0           | 0           |
| fix rounds needed                      | 1           | 0           |
| problems left                          | 0           | 0           |
| words Ani doesn't know / in another kind's slot | 0 / 0 | 0 / 0     |
| characters (mean), scenes, tasks       | 3.3, 64, 245 | 3.3, 63, 231 |
| reply seconds / completion tokens (mean) | 36 / 1,541 | 33 / 1,748 |
| Ani: scenes filmed to their end        | 55 of 64    | 56 of 63    |
| Ani: stories with every scene filmed   | 13 of 15    | 13 of 15    |
| Ani: stops of her own (pass 1 / pass 2) | 1 / 1      | 1 / 1       |
| Ani: scenes never ending at the cap    | 0           | 0           |

Task forms used (Lisp / JSON): establish emotional-state 97 / 86, personality 46 / 49,
relationship 25 / 23; accompanys 15 / 13, meets 13 / 12, chases 10 / 11, change 11 / 4 and
causes 1 / 5 (12 / 9 changes in all), prevents 6 / 6, wants 6 / 5, undoes 4 / 6, pushes
3 / 5, hurts 3 / 2, getting-it-on 3 / 3, alone 2 / 1. The JSON drafts more often put two
feelings in one establish task, `(and (joy ...) (pride ...))`.

The one Lisp problem (The Lion and the Mouse) was an undoes of a change, which the checks
refuse and the schema can't even say; one fix round mended it. Ani's stops were the same
kinds both ways and come from the stories, not the notation: Snow White stopped pass 1 both
ways (ABSOLUTE-THREE-VALUE-OF, too many values left), and SMALL-WAY-FROM-CANT-DO-YET
stopped the Three Little Pigs (Lisp; JSON's filmed 5 of 5) and Goldilocks (JSON; Lisp's
filmed 3 of 3), the scenes after a stop not being made.

## Round 1, and what it changed

Round 1 (in `round-1/`) had no checker problems either way, but each way had a fault the
checks didn't catch:

- **Lisp**: The Tortoise and the Hare, again, had one `)` too many in a scene's tasks. The
  page's balancing took the extra `)` off the scene's last line, so its three
  `(set your ...)` lines stood on their own, and Ani stopped in pass 1 ("YOUR unbound
  variable"). Now the extra `)` comes out where it closed the form too soon, and a form
  that stands on its own is a problem the model is asked to fix.
- **JSON**: the schema let a task undo an earlier *establish* task, and in two stories (The
  Fox and the Crow, The Lion and the Mouse) the model did; Ani can undo only how something
  was shown (convey.64:130-160), and stopped. Now the schema's undone task is only a convey
  task, both prompts say so, and the checks refuse an undone establish.

With those, round 1's Ani results (Lisp 55 of 64 scenes, 13 stories whole; JSON 46 of
63, 10 whole) became round 2's (55 of 64 and 56 of 63, 13 and 13). (Round 1's summaries
don't count the drafts whose parentheses the page balanced; that one Lisp draft was the
only one.)

## A cheaper model: GPT-6 Luna, drafts only

The same 15 stories with GPT-6 Luna (`../2026-10-13 gpt-6-luna json/` and `.../lisp/`,
`--no-ani`), to see what the schema does for a weaker model:

|                                        | Lisp     | JSON     |
|----------------------------------------|----------|----------|
| drafts whose parentheses the page balanced | 6    | 0        |
| drafts with problems                   | 3 (5 problems) | 0  |
| fix rounds needed                      | 5        | 0        |
| problems left after two fix rounds     | 3 (Romeo and Juliet) | 0 |
| reply seconds / completion tokens (mean) | 36 / 3,371 | 24 / 2,569 |

Its Lisp problems: a feeling Ani doesn't have ("shame", twice; fixed after one and two
rounds), and Romeo and Juliet, where a missing `)` inside the last scene's tasks left the
scene open, so the page closed it after its settings and read `(set your mood to
depressing)` and the rest as tasks; the model sent the same slip back twice. (The checks
now say so in those words: a ")" is missing among the tasks before the settings.)

## How well each tells its story

Read side by side, the drafts tell the stories equally well; the notation doesn't change
what the model makes of a story. In both, the tortoise ends proud and happy and the hare
ashamed (pride negative high); the Beast changes from mean to kind, Belle comes to love
him, and he undoes his keeping her from her father (JSON) or they end alone together
(Lisp); the lion lets the mouse go (undoing his chase, in the JSON draft) and changes how
he feels about her, and the mouse becomes determined and rescues him; the ugly duckling is
pushed around, lonely, then welcomed and proud; the woodcutter chases the wolf off, undoing
his keeping Red Riding Hood from her grandmother, and the two end very happy. The
Gingerbread Man's fox is evil and only polite in the JSON draft, and friendly until a
change makes him mean in the Lisp one.

## Recommendation

JSON is the default. With the strongest model the two ways are equally valid and tell
their stories equally well, but every fault left in a Lisp draft was one of notation (a
parenthesis out of place, a form the checks refuse), and JSON can't make those; with a
cheaper model the difference is large (6 of 15 Lisp drafts unbalanced, 5 fix rounds, one
story still broken; none of that as JSON), and JSON was faster and shorter. Ken's Lisp
stays one click away, and is still what the reader sees, edits and saves.

Not tested here: Claude (output_config.format), Gemini (responseJsonSchema) and Gemini
Nano (Chrome's responseConstraint) take the same schema in the page, each in the form it
accepts, and a provider that refuses it is asked again without it; the page's own check
(`tools/check-film-app.mjs`) stands in for their replies. Gemini Nano is left for Ken to
try in Chrome.

Run again with, for each format:

    node tools/build-film-app.mjs
    node tools/try-stories.mjs --format json --extensions mend,appear,change,know \
      --stories examples,test/stories/trial-stories.json --fix-rounds 2 --jobs 3 [--ani <snapshot>]

(`summary.json` has every number above for each story; `schema.json` is the schema as
sent; `prompt-example.txt` the prompt.)

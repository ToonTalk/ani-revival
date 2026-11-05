# Ani, revived

**Try it: [toontalk.github.io/ani](https://toontalk.github.io/ani/)**

Ani is the program in Ken Kahn's MIT thesis, *Creation of Computer Animation from Story
Descriptions* ([AI-TR-540](https://dspace.mit.edu/entities/publication/6abb311d-b27d-4829-9fc2-46baf6491077),
1979). Given a short description of a story in Lisp, it decided how each character should
move and what each scene should show, and planned the film; Director, Ken's actor
language, animated it. Its Cinderella was filmed in 1978
([on YouTube](https://www.youtube.com/watch?v=ji7lL9wRTT4)).

This repository brings Ani back from the files recovered from the MIT AI Lab's backup
tapes. It runs Ken's 1978–79 MacLisp code unchanged, on a MacLisp interpreter and a
Director runtime rebuilt for the revival, in Node and in the browser. Given Ken's
Cinderella description, it makes the same 102 choices the thesis records, and films it.

## What is here

| Path | What it holds |
|---|---|
| `original/` | Ken's files from the tapes, as recovered (`MANIFEST.json` lists each with its tape and date). Never edited. |
| `src/maclisp/`, `src/its/` | The MacLisp reader and interpreter, and an ITS file system. |
| `src/director/` | Director, with the lost `KEN1;` runtime rebuilt from the evidence. |
| `src/tv/` | LLOGO's TV turtle, ported from its public source. |
| `src/pipeline.js` | Runs Ani: pass 1, each scene's plan, and Director filming it. |
| `src/director/revive/` | The revival's additions in Ken's idiom (MEND, KNOW, APPEAR, CHANGE, SEEN, FIT, TIMELY, ...), each switchable; "Ani as in 1978" runs none of them. |
| `app/` | The web page: the film, the glass box, changing the story, new stories, criticism, Teach Ani. |
| `site/` | The site's other pages and `tools/build-site.mjs`, which builds [ToonTalk/ani](https://github.com/ToonTalk/ani). |
| `reports/` | Cross-references, decoded formats, goldens, and the design notes for each stage (`reports/chapter-x/PLAN.md`). |
| `sources/` | OCR text of the thesis and memos, and frames from the film and flipbook. |
| `PLAN.md`, `INVENTORY.md` | How the revival went, phase by phase, and what the tapes held. |

## Running it

Node 24 or later.

```bash
npm test
```

```bash
node tools/check-1978.mjs
```

`npm test` runs the unit tests; `check-1978` checks that Ani as in 1978 still makes its
1978 choices and films. `tools/build-film-app.mjs` builds the page into `app/film.html`,
and `tools/check-film-app.mjs` drives it end to end in headless Chrome.

## How it was made

Ken directed the revival with Claude, in October and November 2026:
[How this was made](https://toontalk.github.io/ani/making-of.html).

## License

MIT, see [LICENSE](LICENSE).

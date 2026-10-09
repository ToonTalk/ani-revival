# Ani's Cinderella

**[Open it: toontalk.github.io/ani](https://toontalk.github.io/ani/)**

Ani is the program in Ken Kahn's MIT thesis (*Creation of Computer Animation from Story
Descriptions*, AI-TR-540, 1979). Given a short description of a story in Lisp, it
decided how each character should move and what each scene should show, and planned
the film; Director, Ken's actor language, then animated it. Its Cinderella was filmed in
1978.

This site runs Ani again: its 1978 MacLisp files, recovered from the MIT AI Lab's backup
tapes, on Director and a MacLisp interpreter rebuilt for the revival, in your browser.

- **Watch the film** and click any character to see what Ani decided it should do, and
  why: the tasks behind it, the methods Ani weighed, its plans and its choices of how
  each character moves.
- **Change the story** (a kind stepmother, a shy Prince, ...) and have Ani make the
  film again, side by side with 1978's.
- **Tell Ani a new story**: a language model (Claude, ChatGPT or Gemini with your own
  key, or Gemini Nano built into Chrome) puts it into Ken's notation, using only the
  words Ani knows, and Ani plans and films it.
- **Save films** as videos, or as film files that open here again with all of Ani's
  reasons.
- **Read the code**: [Ani's Code](https://toontalk.github.io/ani/source.html), every
  name linked to its definition, and
  [Ani's Choice Points](https://toontalk.github.io/ani/pass1.html), the 102 decisions of
  its first pass, step by step.

`ani-cinderella-claude-artifact.html` is the same page made to run as a claude.ai
artifact: upload it to a claude.ai chat and ask Claude to copy it, exactly as it is, into
an HTML artifact.

The pages here are built by the revival project's `tools/build-site.mjs`; each is one
self-contained file. They carry Ani's and Director's code and the Cinderella film
description, nothing else from the tapes.

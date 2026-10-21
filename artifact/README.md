# Ani's Cinderella for claude.ai

`ani-cinderella-claude-artifact.html` is the film page (`app/film.html`) made to run as a
claude.ai artifact. Build it with:

    node tools/build-film-app.mjs --claude-artifact artifact/ani-cinderella-claude-artifact.html [--site URL]

To make the artifact, upload the file to a claude.ai chat and ask Claude to copy it,
exactly as it is, into an HTML artifact.

How it differs from the page itself:

- **Telling Ani a new story** uses Claude through claude.ai, on the viewer's own account
  and with no key (the chat's proxy, or the `sample` capability where the artifact is
  published with it), or Gemini Nano where Chrome has it. A claude.ai artifact can't
  reach other sites, so Claude, ChatGPT and Gemini with your own keys are left out.
- **Ani runs on the page itself**, a step at a time, because a chat artifact refuses
  workers. The page is unresponsive while each step runs (up to a minute) and comes back
  between steps.
- **The code and choice-point pages** are separate pages, which a one-page artifact
  doesn't have. With `--site URL` (where `source.html` and `pass1.html` are on the web)
  the links go there; without it they are left out.
- **Saving** goes through claude.ai's downloads capability where the artifact declares
  it, and is an ordinary download otherwise.

Like the page itself, it opens in 1978 mode: the films made in it are made by Ani as
Ken left her, unless the switch beside the frame rate ("Ani as in 1978 / Ani with the
revival's extensions") turns on MEND, KNOW, APPEAR, CHANGE and SEEN, or the ticks under it,
in "Which extensions", turn on the ones a visitor chooses, SLIPS and DETAIL among them
(opt-in, Ken's decision 3). It carries their files with Ken's, and the in-page runner
loads them as the page's worker does.

It stays under claude.ai's limits: the build refuses a page over 950,000 bytes or a
script over 800 KB. To keep well under, the revival's own Lisp goes in its bundle
without comments (every line kept, and checked to read back as the same forms on the
same lines; Ken's files go as they are), and the page's script goes minified (terser,
a dev dependency only: its names shortened, but for those a check hooks by name, its
comments and spaces left out; Ani's runtime with its local names shortened and nothing
else; the style sheet without comments), gzipped and written as text, as the page's data is, in a block of its own that a small
module script unpacks and puts on the page as a module script of its own. Nothing on
the page needs `eval`: the in-page runner puts Ani's runtime on the page as a classic
script in the same way, so the copy starts, and Ani runs, where a page may run inline
scripts but refuses `eval` (a CSP without `'unsafe-eval'`; `tools/check-film-app.mjs`
serves it so). Before 15 October the page script ran as the body of an async function
made with `new Function`, and the copy showed nothing at all where `eval` was refused
(the review of stage 7, M3). Built on 15 October 2026, with SEEN and Ken's testing's
changes (why they act as they do, the filming's progress), it is about 767 KB.
Since 21 October 2026 it is minified (Ken: "The code won't be viewed since the nice code
will be hosted on GitHub Pages"), with a note at its top pointing to the readable page,
https://toontalk.github.io/ani/, and its code, https://github.com/ToonTalk/ani: 910,802
bytes, where without minifying it had reached 953,064, over the limit; with the age
setting's 9–11 sentences, Read aloud and Talk to Ani (which is never offered here: the
frame has no microphone), 923,235; with Read aloud offered at 12+ too, 923,723.

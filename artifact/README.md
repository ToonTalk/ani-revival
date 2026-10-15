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
revival's extensions") turns on MEND, KNOW, APPEAR and CHANGE, or the ticks under it,
in "Which extensions", turn on the ones a visitor chooses, SLIPS and DETAIL among them
(opt-in, Ken's decision 3). It carries their files with Ken's, and the in-page runner
loads them as the page's worker does.

It stays under claude.ai's limits: the build refuses a page over 950,000 bytes or a
script over 800 KB. To keep well under, the revival's own Lisp goes in its bundle
without comments (every line kept, and checked to read back as the same forms on the
same lines; Ken's files go as they are), and the page's script goes without comments,
gzipped and written as text, as the page's data is, in a block of its own that a small
module script unpacks and runs (as the body of an async function made with
`new Function`, as the in-page runner makes Ani's runtime). Built so on 15 October
2026, with SLIPS and DETAIL on the page, it is about 732 KB.

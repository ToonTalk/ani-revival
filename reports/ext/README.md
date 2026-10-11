# What the revival's extensions make of Ken's Cinderella

The extensions that leave Ken's Cinderella as it was (MEND) are checked against the 1978 goldens themselves, by `node tools/check-1978.mjs --extensions mend`. Those that are meant to change it each have a folder here, with the files a run makes and a README that explains each difference from 1978. `tools/check-ext.mjs` checks them.

- [appear/](appear/README.md): Ani chooses her characters' sizes and shapes (Phase 9, stage 2), at 4 frames a second and, in `appear/24fps/`, at 24. `npm run test:ext` and `npm run test:ext24`.

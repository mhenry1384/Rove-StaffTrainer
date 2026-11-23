# Agent instructions

## Git: work only on `main`

- Do all work directly on the `main` branch. Never create other branches, locally or on GitHub.
- If any other branch turns up, merge it into `main` and delete it, both locally and on GitHub.
- When asked to commit and push, push `main` to GitHub. The website (GitHub Pages) is published from `main`, so pushing `main` is what puts a change live.

## Version number

The app version is a plain integer shown at the top of the app, after the title, in the
`<span class="version">` element inside the `<h1>` in [index.html](index.html) (e.g. `v1`).

Whenever you change anything in the app, increment that number by 1 (e.g. `v1` → `v2`).
Increment it once per set of changes, not once per file edited.

# RANK UP

An RPG-styled workout app. Daily quests built for your rank and your kit,
levels, ranks, parameters, and a library of 155 movements with animated
demonstrations and muscle maps.

**Live:** https://system-hunter.vercel.app

---

## Get it on a new machine

```bash
git clone https://github.com/fonzohdz/system-hunter.git
cd system-hunter
```

That is the whole setup. There is no `npm install`, no build step and no
dependencies — the app is one HTML file with its CSS and JS inline.

## Run it

Open `index.html` in a browser and it works.

The one exception: the sound pack and the exercise art are separate files, and a
browser will not `fetch` them from a `file://` page. To see the app exactly as it
is live, serve the folder over HTTP — any of these, from inside the repo:

```bash
python -m http.server 8000      # then open http://localhost:8000
npx serve .                     # if you have node
php -S localhost:8000           # if you have php
```

VS Code's Live Server extension does the same thing.

## Deploy

Push to `main`. Vercel is connected to this repository and serves the files
as-is — it builds nothing, so a push is live in a few seconds.

```bash
git add -A
git commit -m "what changed"
git push
```

## What is where

| Path | What it is |
| --- | --- |
| `index.html` | The entire app. HTML, CSS and JS inline. |
| `art/ex/` | 360 exercise demonstration frames, 3 per movement (CC BY-SA 4.0) |
| `art/body/` | Licence and notice for the anatomical muscle figures (Apache 2.0) |
| `sfx/` | 8 interface sounds and their manifest (CC0) |
| `manifest.json`, `icon*.svg` | PWA install files, so it adds to a phone home screen |
| `proto.html` | An earlier motion prototype, kept for reference |
| `CLAUDE.md` | The project's rules — read this before changing anything |
| `PRODUCT.md` | What the app is for and who it is for |
| `scratchpad/` | Throwaway tooling from past sessions. Nothing here ships. |

## Before you change anything

Read `CLAUDE.md`. It records the decisions that are easy to undo by accident —
the storage key and its migrations, why progression has two axes, why the
economy was cut, why exercise figures are drawn art rather than generated, and
the licence obligations that come with the artwork.

The one that matters most: **saved progress lives under the `asc:hunter:v4` key
in `localStorage`.** Do not rename it, remove fields or reshape the saved object
without a migration. There is no server backup — if you break it, people lose
their level, streak and records.

## Third-party assets

| What | Who | Licence |
| --- | --- | --- |
| Exercise demonstrations | Bryl Lim, after Everkinetic | CC BY-SA 4.0 |
| Muscle figures | Ivan Vulović (Body Muscles) | Apache 2.0 |
| Interface sounds | Kenney | CC0 |

CC BY-SA requires visible credit, which is shown in the app under **Status →
Credits**. That has to stay. Full licences and notices are in `art/ex/`,
`art/body/` and `sfx/`.

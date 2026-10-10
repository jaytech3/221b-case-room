# The 221B Case Room

**Live:** https://jaytech3.github.io/221b-case-room/

An interactive Victorian detective evidence board. A sapphire vanished from a locked case during a
four-minute blackout at a midsummer masquerade. Five suspects, five alibis, five clues — and one liar.

## What's inside

- **Landing** — the case in one breath, with the missing stone under glass.
- **Case Board, Suspect Profiles, Deduction** — the three screens the brief asked for, detailed below.
- **Interrogation** — three questions per suspect; the answers hide the contradictions a careful reader will catch.
- **Real photographs** — public-domain / CC0 portraits and scenes from open-access museum and library collections, fetched by a GitHub Action and credited in `assets/CREDITS.md`. Hand-drawn SVG cameos remain underneath as a fallback.

## The three screens

| Screen | What the detective does |
| --- | --- |
| **Case Board** | A cork board of polaroids and index cards. Drag a clue's red pin onto a suspect to pull a string between them. Cards can be rearranged; strings follow. The status stamp (Open → In Progress → Case Closed) updates automatically or by hand. |
| **Suspect Profile** | A dossier per suspect: portrait, statement (alibi), who corroborates it, the evidence against them, their movements that night, a suspicion gauge and a handwritten notes field. |
| **Deduction** | The drawing room at midnight. Pick a suspect from the lineup, review the chain of reasoning you built, and press-and-hold to accuse. A typewritten verdict reveals whether the alibi holds or the case is closed. |

## Details worth noticing

- The puzzle is genuinely solvable: the case notes and timeline contain the one fact that breaks a single alibi.
- Loose knots: a string tied to the wrong suspect turns amber and dashed; the right one snaps taut and red.
- Everything persists in `localStorage` — board layout, strings, notes, suspicion, verdicts.
- Press-and-hold accusation: two full seconds with a filling ring, no accidental verdicts.
- Keyboard: `B` board · `S` suspects · `D` deduction · `N` notes · `1–5` jump to a suspect · `Esc` cancel.
- Gaslight (dark) and daylight themes, optional foley sound, reduced-motion support, responsive down to phones (list mode).
- No build step, no framework, no dependencies: `index.html` + `styles.css` + `app.js` + `data.js` + `portraits.js`.

## Fetching the photographs

`.github/workflows/fetch-assets.yml` is a manual workflow with two modes. `search` queries the Art Institute of Chicago, Cleveland Museum of Art, Library of Congress and Wikimedia Commons APIs and prints candidates; `fetch` downloads a chosen list, crops and resizes with ImageMagick, writes `assets/CREDITS.md` and commits the result.

## Run locally

Open `index.html` in a browser, or serve the folder: `python3 -m http.server 8080`.

## Write your own case

All content lives in `data.js` — suspects, alibis, clues, timeline and verdicts. Change the `answer` on each clue and the `guilty` flag on one suspect and the board becomes a new mystery.

# Kalie Ching — personal website

A static website published with GitHub Pages. `.nojekyll` disables Jekyll;
no build step or external frontend dependencies are required.

- `index.html`: introduction and work.
- `media.html`: favorite reading, films, and music, arranged on a desk.
- `css/portfolio.css` and `assets/portfolio.js`: shared styling, the starry sky,
  the work toggle, and the EgoX preview.
- `css/scrapbook.css` and `assets/scrapbook.js`: the media desk, draggable
  pieces, detail views, and the CRT/VHS player.
- `assets/media/`: media images, textures, and image provenance in `sources.json`.
- `assets/fonts/`: self-hosted fonts with their licenses; `assets/favicon.svg` is the tab icon.

Preview through a local HTTP server, for example `python3 -m http.server`.
YouTube embeds need the referrer a server provides; opening the file directly
shows a notice instead of playing. Reduced-motion preferences disable the
animations.

## Work

Only the first project shows by default; “Show all work” reveals the rest
(projects marked `data-other-work`). Without JavaScript, every project is visible.
The EgoX animation loads only when its play button is pressed.

## Media desk

Each piece is an `<article class="scrap">` in `media.html`. The desk scatters
them like a cluttered tabletop: overlap density rises with the collection, so
the desk grows with roughly the square root of the piece count rather than
linearly, and every piece keeps at least 40% of itself visible. Placement is
seeded from each piece's `data-piece` name, so the default layout is stable
between visits; later pieces in the file land on top. Without JavaScript the
pieces form a simple grid with every text and link visible.

- **Films and series** (`photo-print`): a still with a handwritten title.
  Selecting one opens the still with its credit (`data-credit`, `data-credit-url`).
- **Poems** (`data-kind="Poem"`): folded papers that unfold into the excerpt.
  `data-excerpt` labels the detail view as an excerpt.
- **Books** (`book-paper`): a paperback cover whose detail view is a torn page
  with the `<blockquote>` quote highlighted. `data-note` adds a label such as
  “currently reading”, and a `<span class="bookmark">` adds a ribbon bookmark.
- **Music** (`tape-piece`): VHS tapes labeled with `--tape-color`. Drag one onto
  the TV to load it, then press Play; keyboard users can press Enter on a tape.
  The YouTube privacy-enhanced embed is created only after Play, and loaded
  tapes are not restored on reload.

Drag a piece (or its corner grip on touch screens), or focus its Move button and
use the arrow keys; Shift moves farther. Arrangements are saved in local storage
separately for phone, medium, and wide desks, and the reset button restores the
default layout.

Handwriting uses two fonts set at the top of `css/scrapbook.css`: `--hand`
(Modernline) and `--title` (Derathea). Both are personal-use licenses. To add an
image, put it in `assets/media/`, set its dimensions, alt text, and credit in
`media.html`, and record its source in `sources.json`. Quoted texts are short
excerpts with attribution and links to the full works.

The source resume and internal employer details are not included. Retired pages
and projects, including GenForce, remain in Git history; `assets/expert-force-trace.png`
is kept for GenForce's return.

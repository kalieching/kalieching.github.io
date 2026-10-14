# Kalie Ching — personal website

A static website published with GitHub Pages. `.nojekyll` disables Jekyll;
no build step or external frontend dependencies are required.

- `index.html`: introduction and selected work.
- `media.html`: favorite reading, films, and music.
- `css/scrapbook.css` and `assets/scrapbook.js`: painted wooden desk, draggable
  pieces, CRT/VHS player, keyboard controls, and enlarged detail views.
- `assets/media/`: media images, paper texture, and image provenance in `sources.json`.
- `css/portfolio.css`: shared styling and responsive layouts.
- `assets/portfolio.js`: figure viewer, scroll cue, and star dimming.
- `assets/`: project images and self-hosted fonts with their licenses.

Open either HTML file in a browser to preview locally. The figure viewer also
provides direct image links without JavaScript. Reduced-motion preferences
disable star animations.

The scrapbook keeps all twelve selections and their source links accessible
without JavaScript. With JavaScript, drag a piece (or its corner grip on touch screens),
or focus its Move button and use arrow keys; Shift moves farther. Arrangements
are saved in local storage separately for phone, medium, and wide desk sizes.
The initial arrangement uses smaller pieces at staggered positions with light
edge overlaps rather than fixed columns.
Reset arrangement restores the initial positions. Select a piece to enlarge it.
Poems appear as folded papers: click the center to unfold the excerpt in the
reading dialog; dragging only moves them. Without JavaScript, the excerpts
remain visible. Tuesdays with Morrie is styled as a paperback, and the
tapes show only their labels, with the insertion control in the expanded view.

The five music selections are labeled VHS tapes. Drop one on the right-hand TV
or open a tape and choose Insert into the VHS player, then Play. A YouTube privacy-enhanced embed is created
inside the CRT screen only after Play is pressed; Stop, Eject, or inserting
another tape removes it. Screen reflections and scan lines appear only in standby;
brief insertion static respects reduced-motion preferences.
Original YouTube links remain available if an embed cannot play. On narrow screens,
the player sits above the collection and Insert tape brings it into view. Tape
loading is not restored on reload, so returning visitors never start playback
automatically. Preview through a local HTTP server (for example,
`python3 -m http.server`) to supply the referrer YouTube requires for embeds.
Direct-file previews show a helpful message and a YouTube link instead of
attempting an embed without a referrer.

Film images are representative stills. To swap in a favorite scene, replace its
image in `assets/media/` and update the image dimensions, alt text, and credit
attributes in `media.html`, plus its entry in `assets/media/sources.json`.
The Summer Day and Birthdays show short excerpts with attribution and links
to the full works.

The source resume and internal employer details are not included. Retired blog
pages, layouts, styles, and images have been removed; Git history retains them.

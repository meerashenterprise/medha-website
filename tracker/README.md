# Medhaan Tracker — static build for medha-website

This is the React tracker converted into plain HTML/JS files — no build
step, no Node required. It works the same way as the rest of your
medha-website repo: upload the files, commit, and it's live.

## Files in this folder

- `index.html` — the page shell. Loads React, Babel, the icon library,
  and Excel export library from public CDNs, then loads `app.jsx`.
- `app.jsx` — the entire tracker application (all screens, all logic).
- `icon-shim.js` — small helper that makes the icon library work the
  same way the original React source expected.

## How to add this to your GitHub repo

1. Go to your repo:
   `https://github.com/meerashenterprise/medha-website`
2. Create a new folder called `tracker` (GitHub lets you do this
   directly when uploading — just type `tracker/` at the start of the
   file path when adding files, or create the folder first via
   **Add file → Create new file** and typing `tracker/index.html`).
3. Upload all three files (`index.html`, `app.jsx`, `icon-shim.js`)
   into that `tracker` folder.
4. Commit the changes (a commit message like "Add project tracker" is
   fine).
5. Once your usual deployment step runs (whoever pulls changes to the
   VPS), the tracker will be reachable at:
   `https://medhaan.com/tracker/`

   (Note the trailing slash and `index.html` — this works the same as
   any other folder of HTML files on your site.)

## Connecting Google Sheets

Nothing extra needed here — once the page is live on the real internet
(not just previewed locally), go to the **Projects** page inside the
tracker and paste your Google Apps Script Web App URL into the
"Google Sheets connection" card, same as described in the
`Google_Sheets_Setup_Guide.md` from earlier.

## A note on how this differs from the original build

The original source was written as a modern React app meant for a
bundler (Next.js/Vite). To make it work as plain files like the rest
of your site, this version:

- Loads React, the icon library, and the Excel export library from
  public CDNs instead of npm packages
- Compiles the JSX in the browser on page load (via Babel) instead of
  ahead of time

This is a completely normal way to ship a small React tool without a
build pipeline. The trade-off: the page does a brief bit of extra work
in the visitor's browser on load (compiling JSX, fetching a few CDN
scripts) — for an internal team tool with a handful of daily users,
that's a non-issue. If this ever needs to feel instant for a larger
audience, converting it to a proper Vite/Next.js build later is a
clean, incremental upgrade — nothing here needs to be thrown away.

## Testing before you commit (optional but recommended)

You can preview this folder locally before uploading:

1. Make sure all three files are together in one folder.
2. Open a terminal in that folder and run (if you have Python
   installed): `python -m http.server 8000`
3. Open `http://localhost:8000` in your browser.

If double-clicking `index.html` directly doesn't work (some browsers
block local file loading of scripts), the local server step above
fixes that.

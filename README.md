# The Microbialist

- `index.html` – home page. The Articles tab lists everything in `articles/`.
- `articles/*.html` – one standalone HTML file per article.
- `articles/manifest.json` – generated list of articles (don't edit by hand).

## Adding an article
1. Drop a new `.html` file into `articles/` (copy `read-mapping.html` as a template).
2. Add `<script src="../assets/nav.js" defer></script>` to the `<head>` so the article gets the site navbar (Home + Articles dropdown).
3. Optional metadata in `<head>`: `<title>My Post | The Microbialist</title>`,
   `<meta name="description" content="One-line summary">`,
   `<meta name="tag" content="Interactive · D3">`, `<meta name="date" content="2026-11-01">`.
4. Commit and push. A GitHub Action regenerates `articles/manifest.json` automatically.
   To preview locally: `python3 scripts/build_manifest.py` then `python3 -m http.server`.

Files starting with `_` are ignored. Newest `date` appears first.

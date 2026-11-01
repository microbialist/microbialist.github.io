#!/usr/bin/env python3
"""Scan articles/*.html and write articles/manifest.json for the home page.

Per-article metadata is read from the HTML itself (all optional):
  <title>Name | The Microbialist</title>     -> title
  <meta name="description" content="...">    -> summary
  <meta name="tag" content="Interactive">    -> small label above the title
  <meta name="date" content="2026-10-01">    -> sort order (newest first)
Fallbacks: <h1>, .tagline, file modified time. Files starting with _ are skipped.
"""
import html, json, re, sys
from datetime import datetime, timezone
from pathlib import Path

root = Path(__file__).resolve().parent.parent
art = root / "articles"

def meta(src, name):
    for m in re.finditer(r"<meta\s+[^>]*>", src, re.I):
        t = m.group(0)
        if re.search(r'name\s*=\s*["\']%s["\']' % name, t, re.I):
            c = re.search(r'content\s*=\s*"([^"]*)"|content\s*=\s*\'([^\']*)\'', t, re.I)
            if c: return html.unescape(c.group(1) or c.group(2)).strip()
    return ""

def text(s): return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()

items = []
for f in sorted(art.glob("*.html")):
    if f.name.startswith("_"): continue
    src = f.read_text(encoding="utf-8", errors="replace")
    t = re.search(r"<title>(.*?)</title>", src, re.S | re.I)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S | re.I)
    title = text(t.group(1)) if t else (text(h1.group(1)) if h1 else f.stem)
    title = re.sub(r"\s*[|–—-]\s*The Microbialist\s*$", "", title)
    tag = re.search(r'class="tagline"[^>]*>(.*?)</', src, re.S)
    summary = meta(src, "description") or (text(tag.group(1)) if tag else "")
    date = meta(src, "date") or datetime.fromtimestamp(f.stat().st_mtime, timezone.utc).strftime("%Y-%m-%d")
    items.append({"file": f.name, "title": title, "summary": summary, "tag": meta(src, "tag"), "date": date})

items.sort(key=lambda i: (i["date"], i["title"]), reverse=True)
(art / "manifest.json").write_text(json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Wrote articles/manifest.json with {len(items)} article(s)", file=sys.stderr)

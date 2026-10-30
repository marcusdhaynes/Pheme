# PHEME — The Daily Chronicle

A responsive, installable vintage newspaper app inspired by historic printed papers. This inaugural edition is **deliberately fictional**; all section headings are temporary.

## Live edition

Once GitHub Pages is enabled (Settings → Pages → Source → GitHub Actions), visit:

https://marcusdhaynes.github.io/Pheme/

## Features

- Desktop: a wide lead story framed by mirrored illustrated newspaper columns.
- Tablet: a large lead story followed by paired side columns.
- Phone: a readable feature and a compact grid of smaller articles.
- Authentic newsprint texture, monochrome engraved drawings and historic typography.
- Paper settings: Newsprint (default), Parchment, Rag Paper, Linen and Recycled Stock.
- Adjustable type size and ink density. Preferences persist locally.
- Search, sections, archive, bookmarks, full-story reader, and print formatting.
- Progressive web app: install from a compatible browser and read the cached edition offline.
- No build system or framework dependencies.

## Deployment

GitHub Actions workflow: .github/workflows/deploy-pages.yml

The workflow deploys on every push to the main branch. A repository administrator may need to select GitHub Actions as the publishing source once in GitHub Settings → Pages.

## Local development

Open index.html, or serve the directory with:

    python -m http.server 8080

Then visit http://localhost:8080/.

## Contents

- index.html — masthead, editorial layout, engraved SVG drawings, sample previews.
- styles.css — responsive styles, paper textures, print rules.
- app.js — temporary article content and app interactions.
- icon.svg, manifest.webmanifest, sw.js — installation and offline caching.

All article facts and quotes are playful movie-related **placeholder fiction** and must be replaced with real editorial content before use as a news source.
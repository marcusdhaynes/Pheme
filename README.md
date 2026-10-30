# PHEME — The Daily Chronicle

A responsive, installable vintage newspaper app inspired by historic printed papers. The original inaugural edition was fictional; the new opt-in country edition leaves the front page empty until countries and a verified news feed are provided.

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
- Country-based subscriptions: all 195 countries, grouped by continent and region, **none selected by default**. Selection persists locally.
- Arbitrary political group count per event: A, B, C, D, and beyond, each with moderate / mainstream / hardline coverage positions backed by source URLs.
- A single event can combine incremental reports by event ID; duplicate claim and publication records are deduplicated, with the original sources retained.
- Seven structured story sections: Facts, Doubts, Unknowns, Parties, Locations, Agendas, Impacts.
- No mock news is displayed as real reporting. The verified feed is currently empty and must be populated by a separate editorial service.
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
- app.js — paper settings, navigation, and legacy sample content (not shown in the new edition).
- news-engine.js — selected countries, arbitrary political group coverage, story mergers, evidence reader.
- news/stories.json — **empty** curated event feed. See docs/news-feed-schema.md to connect verified ingestion.
- icon.svg, manifest.webmanifest, sw.js — installation and offline caching.

The original movie articles remain in the source as an archive of prototype layout code but are not displayed in the newspaper. Until an editorial ingestion/verification backend is connected, selecting a country shows an empty verified news edition rather than invented articles.
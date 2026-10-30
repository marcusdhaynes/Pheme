# PHEME — The Daily Chronicle

A responsive, installable vintage newspaper app inspired by historic printed papers. The original inaugural edition was fictional; the current three-column vintage newspaper is dynamically filled by attributed global reports. No countries are preselected.

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
- A single event combines reports by canonical URL and conservative headline clustering. Publisher links and source-update history are retained; duplicated syndications are not counted as independent verification.
- Seven structured story sections: Facts, Doubts, Unknowns, Parties, Locations, Agendas, Impacts.
- Original source headlines are collected from GDELT GAL RSS every 15 minutes. GDELT GAL metadata provides descriptions, source language, publisher, author and images; GKG enriches machine-extracted actors, organizations, places and topics.
- Articles default to English. Settings lets readers choose other **original reporting languages**; this is not full-machine translation of every report. Only publication content matching the selected language is displayed.
- Publisher descriptions are presented as *attributed unverified reports*, not original PHEME fact claims. Explicitly documented objectives, disputes and possible consequences are extracted conservatively with source links; independently verified Facts remain empty without stronger evidence.
- The full symmetrical newspaper is displayed even without selected countries, using newspaper placeholders instead of invented real-world news.
- Independent fact verification, deduplicated semantic claim reconciliation and impartial synthesis are still not complete.
- Users can enable/disable 13 newspaper sections, or assign any story to another section.
- A source update timeline preserves publication references; repeated wire stories are not treated as independent confirmation.
- No build system or framework dependencies.

## Deployment

GitHub Actions workflows: .github/workflows/deploy-pages.yml, .github/workflows/news-refresh.yml, .github/workflows/source-audit.yml

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
- news/stories.json — periodically populated country-topic news feed; see docs/news-feed-schema.md for limitations.
- scripts/gal_feed.py — fetch and parse GDELT GAL RSS.
- scripts/article_enrichment.py — match GAL metadata, derive publication excerpts and carefully attributed evidence fields.
- scripts/gkg_enrichment.py — join article references to GDELT GKG machine-indexed entities and topics.
- scripts/build_news.py — deduplicate linked news and build the edition.
- scripts/test_news.py — offline news collector checks.
- icon.svg, manifest.webmanifest, sw.js — installation and offline caching.

The original movie articles remain in the source as an archive of prototype layout code but are not displayed in the newspaper. Country selections display attributed linked reports that mention those countries. Underlying claims are explicitly unverified; full evidence-based article synthesis and per-party source verification remain future work.
# PHEME — news pipeline: current verified status

## Running collection

Production uses the **GDELT Article List (GAL) RSS feed**, https://data.gdeltproject.org/gdeltv3/gal/feed.rss, to discover links, then joins downloadable GAL JSONL records for descriptions, original language, author, publisher and image metadata. GDELT documents this feed for news article discovery: https://blog.gdeltproject.org/announcing-the-gdelt-article-list-rss-feed/.

A live GitHub Actions probe returned HTTP 200 and parsed real article links. The first successfully populated production run on October 30, 2026 scanned 3,446 feed items, yielding 196 matched publications in 175 provisional clusters. The collector runs every 15 minutes via the news-refresh GitHub Actions workflow.

Not used:
- GDELT DOC JSON search API, which returned HTTP 429 to GitHub Actions, confirmed by an isolated live probe.
- Google News RSS, excluded due to uncertain permission for syndication and published personal/noncommercial usage conditions.

Article metadata includes titles, short publisher-provided descriptions, links, original-language tags, authors, publisher names and image URLs. PHEME does NOT scrape publishers' full articles or claim permission to reproduce them.

## Country filtering and its limits

All 195 countries appear in Settings, none preselected. 194 countries (except the United States) are eligible for automatic topic matching. The GAL RSS stream is matched against names and common demonyms in article HEADLINES; this does not prove the event took place in that country. A headline without a country reference may not be included; all 194 countries are not guaranteed coverage in any run.

Selection is device-local and persisted. A story mentioning several selected countries appears once.

## Political groups

Any number of groups per country is supported; each group can have Moderate, Mainstream and Hardline publication classifications. The party catalog is NONEXHAUSTIVE. Political orientation is marked only when data/outlets.json contains evidenceUrl and the exact matching group, country, level and publisher. That verified outlet directory remains empty; there are NOT 1,164 verified publisher-category sources. Do not infer a political classification from article tone or country of origin.

## Newspaper sections

Users can enable/disable World, Politics, Business, Technology, Science, Health, Sports, Entertainment, Culture, Environment, Education, Crime & Justice, and Travel. Each story can be assigned to a different section, saved locally. Initial classification is headline keyword-based and may need corrections.

## Reporting quality and verification

One event cluster stores multiple original publication links, not duplicate article cards. URLs are deduplicated, similar headlines are grouped heuristically, and event country labels are combined. A repeated wire story on ten websites is not ten independent confirmations. Unique headline variants and source-by-source revisions are tracked separately.

Article records are marked unverified-headline-aggregation. PHEME extracts short, attributed publisher descriptions and uses GDELT Global Knowledge Graph metadata to list explicitly labeled machine-indexed people, organizations, places and topical themes. The seven sections — Facts, Doubts, Unknowns, Parties, Locations, Agendas, Impacts — exist in the UI and schema. Automated evidence-verified story synthesis, a full claims graph, and verified attribution of factual motives/impacts are NOT complete. In the current feed, substantive Facts remain empty without independent confirmation. Objectives, disputes and possible impacts are filled only when explicitly mentioned in a publisher description, and always labeled as unverified attributed assertions. Unknowns explain the gaps in verification.

## Operations and checks

Source: scripts/gal_feed.py
Event builder: scripts/build_news.py
Frontend: news-engine.js
Output: news/stories.json
Scheduler: .github/workflows/news-refresh.yml
Source test: .github/workflows/source-audit.yml
Country and outlet configuration: data/countries.json, data/political-groups.json, data/outlets.json
Tests: python3 -m unittest discover -s scripts -p test_*.py -v
JS validation: node --check app.js && node --check news-engine.js && node --check sw.js

## Article language and full newspaper

The reader defaults to English, saved locally under pheme.articleLanguage. It filters publications to their detected **original language** (from GAL `lang` metadata, with an English-headline heuristic for older RSS-only records). Readers can choose another available source language in Settings. **This is not automatic translation.** A country with no reports in the selected source language displays a clear empty-state explanation.

The entire three-column paper layout remains visible on desktop, tablet, mobile, and print—including when no country is selected. A full center lead, center briefs and balanced side rails display actual attributed excerpts and source illustrations where available. Placeholders never claim fabricated events took place.

Enrichment logic: scripts/article_enrichment.py and scripts/gkg_enrichment.py. GAL description data and GKG NLP entities are machine-indexed, can be incomplete or wrong, and MUST NOT be presented as independently established facts. GKG location mentions are not proof of event location. Source-dependent excerpts and repeated syndicated headlines are not independent corroboration.

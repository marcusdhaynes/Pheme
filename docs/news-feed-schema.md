# PHEME — news pipeline: current verified status

## Running collection

Production uses the **GDELT Article List (GAL) RSS feed**, https://data.gdeltproject.org/gdeltv3/gal/feed.rss, as a link-and-headline source. GDELT documents this feed for news article discovery: https://blog.gdeltproject.org/announcing-the-gdelt-article-list-rss-feed/.

A live GitHub Actions probe returned HTTP 200 and parsed real article links. The first successfully populated production run on October 30, 2026 scanned 3,446 feed items, yielding 196 matched publications in 175 provisional clusters. The collector runs every 15 minutes via the news-refresh GitHub Actions workflow.

Not used:
- GDELT DOC JSON search API, which returned HTTP 429 to GitHub Actions, confirmed by an isolated live probe.
- Google News RSS, excluded due to uncertain permission for syndication and published personal/noncommercial usage conditions.

Article metadata is limited to titles, publication links, outlet domains, and dates; PHEME does NOT scrape publishers' full articles or claim permission to reproduce them.

## Country filtering and its limits

All 195 countries appear in Settings, none preselected. 194 countries (except the United States) are eligible for automatic topic matching. The GAL RSS stream is matched against names and common demonyms in article HEADLINES; this does not prove the event took place in that country. A headline without a country reference may not be included; all 194 countries are not guaranteed coverage in any run.

Selection is device-local and persisted. A story mentioning several selected countries appears once.

## Political groups

Any number of groups per country is supported; each group can have Moderate, Mainstream and Hardline publication classifications. The party catalog is NONEXHAUSTIVE. Political orientation is marked only when data/outlets.json contains evidenceUrl and the exact matching group, country, level and publisher. That verified outlet directory remains empty; there are NOT 1,164 verified publisher-category sources. Do not infer a political classification from article tone or country of origin.

## Newspaper sections

Users can enable/disable World, Politics, Business, Technology, Science, Health, Sports, Entertainment, Culture, Environment, Education, Crime & Justice, and Travel. Each story can be assigned to a different section, saved locally. Initial classification is headline keyword-based and may need corrections.

## Reporting quality and verification

One event cluster stores multiple original publication links, not duplicate article cards. URLs are deduplicated, similar headlines are grouped heuristically, and event country labels are combined. A repeated wire story on ten websites is not ten independent confirmations. Unique headline variants and source-by-source revisions are tracked separately.

Article records are marked unverified-headline-aggregation. The seven sections — Facts, Doubts, Unknowns, Parties, Locations, Agendas, Impacts — exist in the UI and schema. Automated evidence-verified story synthesis, a full claims graph, and verified attribution of factual motives/impacts are NOT complete. In the current feed, empty Fact/Agenda/Impact fields are intentional, and an Unknown warns that claims were not independently verified.

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

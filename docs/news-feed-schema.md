# PHEME verified news feed contract

The live newspaper reads `news/stories.json`. Its starting value is `{"events":[]}`, which intentionally displays no fictional or unverified news.

## Country subscription

Users choose countries from a list of all 195. **No countries are preselected** and no browser location is used. Settings persist on the device in `pheme.selectedCountries`. A story is visible when at least one of its `countries` matches a selected country. An event affecting multiple countries may appear for any of those selected, **but only once**.

## Event schema

```json
{
  "events": [
    {
      "eventId": "stable-global-event-id",
      "title": "Neutral, evidence-based headline",
      "summary": "Summary with qualified uncertainty",
      "updatedAt": "2026-10-29T20:15:00Z",
      "countries": ["Canada", "France"],
      "groups": [
        {"id": "group-a", "name": "Actual political movement name"},
        {"id": "group-b", "name": "Another political movement"},
        {"id": "group-c", "name": "Third influential movement"},
        {"id": "group-d", "name": "Fourth influential movement"}
      ],
      "coverage": [
        {
          "country": "Canada",
          "groupId": "group-a",
          "level": "mainstream",
          "sources": ["https://publisher.example/story"]
        }
      ],
      "facts": [
        {
          "text": "A verifiable claim, confirmed by cited primary or independent evidence.",
          "sources": [{"name": "Primary record", "url": "https://records.example/document"}]
        }
      ],
      "doubts": [
        {"text": "An attributed dispute or substantiated weakness in the evidence.", "sources": []}
      ],
      "unknowns": ["An unanswered factual question"],
      "parties": ["Government ministry", "Civic organization"],
      "locations": ["A geographic area"],
      "agendas": [
        {"text": "A documented stated objective, with attribution.", "sources": []}
      ],
      "impacts": [
        {"text": "An established consequence, or an explicitly labelled possibility.", "sources": []}
      ],
      "publications": [
        {"title": "Article headline", "name": "Publisher", "url": "https://publisher.example/story"}
      ]
    }
  ]
}
```

The example domains above are illustrative only and **must not be used as actual news sources**.

## Group model

Political groups form an **unbounded array** of objects, not fixed `left`/`right` fields. Each group may have 0–3 political source categories (`moderate`, `mainstream`, `hardline`), with multiple source publications per category. Different countries can have different group counts. Groups represent documented influence, not an ideological truth scale. Source coverage is marked only when an actual public source URL is supplied. Empty categories show as unverified, **not** as evidence the source was silent.

## Event reconciliation and editorial requirements

- The ingestion service must assign a stable event ID to all genuine duplicates of the same underlying event.
- The browser merges event records sharing that stable ID. It deduplicates repeated fields and consolidates source coverage by country/group/level; this is not a substitute for semantic similarity or full fact checking.
- An independent editorial pipeline must resolve paraphrases, conflicting evidence, source-dependency, corroboration, corrections, and contradictions. **Do not classify a statement as Fact simply because multiple newspapers repeat it.**
- Separate documented facts, credible doubts, and unknowns. Agendas are included only when explicitly evidenced. Distinguish actual impacts from forecasts.
- Maintain provenance and article timestamps. Maintain versions and corrections on the **backend**, not in local browser state.
- Keep publishers' content within licensing/usage terms. PHEME stores event summaries, citations and links; it does not presume rights to republish full articles.
- Geographical filters represent countries *relevant to the event*, not merely the publisher's country.
- The US can be selected but its political source mapping remains pending separate later work.

## Production status

GitHub Pages is static; there is **no automatic worldwide ingestion, evidence verification, editorial LLM or permanent version-history backend attached yet**. The UI is ready to consume a future verified `news/stories.json` output or receive in-memory event records via `window.PHEME_NEWS.ingest(events)`.

No frontend-only implementation can guarantee political impartiality or exhaustive sourcing. Editorial verification and provenance controls must accompany any production data pipeline.

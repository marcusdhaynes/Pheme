#!/usr/bin/env python3
"""PHEME evidence-aware news intake.

Ingest GDELT DOC 2.0 (JSON) without API keys.
This is a discovery/attribution pipeline, NOT independent fact verification.
Country names in searches are topic mentions; never assume event location.
Political coverage is counted ONLY for outlets with manually evidenced mappings.
"""
from __future__ import annotations

import argparse
import datetime as dt
import difflib
import hashlib
import html
import json
import logging
from pathlib import Path
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from gal_feed import fetch_gal

ROOT = Path(__file__).resolve().parents[1]
COUNTRIES = ROOT / "data/countries.json"
GROUPS = ROOT / "data/political-groups.json"
OUTLETS = ROOT / "data/outlets.json"
OUTPUT = ROOT / "news/stories.json"
UTC = dt.timezone.utc
NOW = dt.datetime.now(UTC)
SECTIONS = ["World","Politics","Business","Technology","Science","Health","Sports",
            "Entertainment","Culture","Environment","Education","Crime & Justice","Travel"]
CUES = {
  "Politics": ["election","parliament","president","minister","cabinet","government","legislation","congress","senate","political","ballot","party","vote","prime minister","court ruling"],
  "Business": ["business","economy","economic","inflation","finance","stock market","bank","trade","recession","interest rate","investor","tariff","merger","industry","oil price"],
  "Technology": ["technology","software","artificial intelligence","ai model","semiconductor","cyber","startup","smartphone","data center","chipmaker","internet","robot"],
  "Science": ["science","research","scientist","spacecraft","astronomy","discovery","nasa","physics","space station","laboratory"],
  "Health": ["health","hospital","medical","disease","vaccine","virus","outbreak","patient","doctor","public health"],
  "Sports": ["sports","football","soccer","rugby","cricket","olympic","athlete","tournament","world cup","basketball","tennis","formula one","match"],
  "Entertainment": ["entertainment","film","movie","actor","actress","box office","concert","celebrity","television","music awards"],
  "Culture": ["culture","museum","literature","art exhibition","heritage","religious festival","theatre","theater"],
  "Environment": ["environment","climate","emissions","wildfire","flood","drought","wildlife","deforestation","conservation","carbon"],
  "Education": ["education","school","university","student","curriculum","teacher","scholarship"],
  "Crime & Justice": ["arrest","convicted","trial","police","prosecutor","criminal","murder","fraud","court case","judiciary"],
  "Travel": ["travel","tourist","tourism","flight","airline","airport","passport","railway","hotel"],
}
STOP = set(("the a an and or of for to in on at by from with as is are was were be been has have had "
            "will this that its their his her new says said after before amid over about more into "
            "news live update latest reported reports breaking today yesterday how why what where "
            "world country region states state government").split())
ALIAS = {
  "Côte d’Ivoire": "Ivory Coast", "Türkiye":"Turkey",
  "Republic of the Congo":"Republic of Congo",
  "Democratic Republic of the Congo":"DR Congo",
  "Federated States of Micronesia":"Micronesia",
  "São Tomé and Príncipe":"Sao Tome and Principe",
  "Vatican City":"Vatican",
  "Timor-Leste":"East Timor",
}
AGENT = "PHEME-NewsCollector/1.0 (+https://github.com/marcusdhaynes/Pheme; attribution-only)"
log = logging.getLogger("pheme")

def read_json(path, fallback):
    try:
        with open(path,encoding="utf-8") as f: return json.load(f)
    except (OSError, ValueError): return fallback

def write_json(path, obj):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_suffix(".tmp")
    temp.write_text(json.dumps(obj,ensure_ascii=False,sort_keys=True,indent=2)+"\n",encoding="utf-8")
    temp.replace(path)

def tidy(text):
    text=html.unescape(re.sub(r"<[^>]*>", " ",str(text or "")))
    return " ".join(text.split())[:500]

def words(title):
    # Preserve distinguishing words, not boilerplate or an editorial assessment.
    cleaned=re.sub(r"[^\w\s-]"," ",title.lower())
    return {t for t in cleaned.split() if len(t)>2 and t not in STOP and not t.isnumeric()}

def similarity(a,b):
    wa,wb=words(a),words(b)
    if len(wa)<3 or len(wb)<3:return 0
    overlap=len(wa & wb) / max(1,len(wa | wb))
    seq=difflib.SequenceMatcher(None,a.lower(),b.lower()).ratio()
    return .6*overlap+.4*seq

def section_for(title):
    s=" "+tidy(title).lower()+" "
    ranks=[]
    for sec,terms in CUES.items():
        score=sum(2 if (" "+term+" ") in s else 0 for term in terms)
        if score:ranks.append((score,sec))
    return max(ranks)[1] if ranks else "World"

def fetch(url,timeout=18):
    req=urllib.request.Request(url,headers={"User-Agent":AGENT,
      "Accept":"application/json, application/rss+xml, application/xml;q=0.9, */*;q=0.1"})
    with urllib.request.urlopen(req,timeout=timeout) as response:
        if response.status!=200:raise RuntimeError("HTTP "+str(response.status))
        return response.read(3_000_000)

def gdelt_json(country):
    q='"'+ALIAS.get(country,country)+'"'
    params=urllib.parse.urlencode({"query":q,"mode":"artlist","format":"json",
                                    "maxrecords":35,"sort":"DateDesc","timespan":"1d"})
    raw=json.loads(fetch("https://api.gdeltproject.org/api/v2/doc/doc?"+params).decode("utf-8"))
    rows=[]
    for item in raw.get("articles",[])[:35]:
        title=tidy(item.get("title"))
        url=item.get("url")
        if not title or not url:continue
        seen=str(item.get("seendate") or "")
        try:created=dt.datetime.strptime(seen[:15],"%Y%m%dT%H%M%S").replace(tzinfo=UTC)
        except ValueError:
            try:created=dt.datetime.strptime(seen[:14],"%Y%m%d%H%M%S").replace(tzinfo=UTC)
            except ValueError:continue
        if created < NOW-dt.timedelta(days=3):continue
        domain=str(item.get("domain") or "").lower()
        rows.append(dict(title=title,url=url,publisher=domain or "Unknown publisher",
                         domain=domain,published=created.isoformat(),country=country,api="GDELT DOC 2.0"))
    return rows

def canonical_url(url):
    u=urllib.parse.urlparse(url or "")
    # Do not fetch third-party article bodies or assume permission.
    path=re.sub(r"/+$","",u.path)
    return (u.netloc.lower()+path+"?"+u.query).strip("?")

def event_id(title,existing):
    # Merge only highly similar headlines with at least three meaningful words.
    # This conservatively favors separate events over joining unrelated stories.
    best=None
    for ev in existing:
        if similarity(title,ev.get("reportHeadline",ev.get("title","")))>=.79:
            best=ev["eventId"];break
    if best:return best
    norm=" ".join(sorted(words(title)))
    return "event-"+hashlib.sha256(norm.encode()).hexdigest()[:18]

def publication_for(article):
    return dict(title=article["title"],name=article["publisher"],url=article["url"],
                domain=article.get("domain",""),publishedAt=article["published"],api=article["api"],
                countryMention=article["country"],countryMentions=article.get("countries",[article["country"]]))

def group_catalog(country, catalog):
    return catalog.get(country,[])

def add_coverage(ev,publication,outlet_index,group_catalogs):
    domain=publication.get("domain","").removeprefix("www.")
    publisher=publication.get("name","").lower()
    for entry in outlet_index:
        if entry.get("country") not in ev.get("countries",[]):continue
        identifier=str(entry.get("domain","")).lower().removeprefix("www.")
        named=str(entry.get("name","")).lower()
        if not ((identifier and domain==identifier) or (named and publisher==named)):continue
        # Every political affiliation requires a documented source, not an automated guess.
        evidence=entry.get("evidenceUrl")
        level=entry.get("level")
        group=entry.get("groupId")
        if not evidence or level not in ("moderate","mainstream","hardline") or not group:continue
        allowed={g["id"] for g in group_catalogs.get(entry["country"],[])}
        if group not in allowed:continue
        key=(entry["country"],group,level)
        found=next((x for x in ev["coverage"] if (x.get("country"),x.get("groupId"),x.get("level"))==key),None)
        if found is None:
            found=dict(country=entry["country"],groupId=group,level=level,sources=[],evidenceUrl=evidence)
            ev["coverage"].append(found)
        if publication["url"] not in found["sources"]:found["sources"].append(publication["url"])

def make_event(article,group_catalogs):
    title=article["title"]
    country=article["country"]
    return dict(eventId=event_id(title,[]),title="Reports: "+title,reportHeadline=title,
        summary="News organizations have published reports about this event. PHEME has not independently verified the underlying claims.",
        section=section_for(title),countries=list(article.get("countries",[country])),
        groups=[dict(g,country=country) for g in group_catalog(country,group_catalogs)],
        coverage=[],facts=[],doubts=[],
        unknowns=[{"text":"The underlying claims have not been independently verified by PHEME; consult the original reporting."}],
        parties=[],locations=[],agendas=[],impacts=[],
        publications=[],updatedAt=article["published"],firstPublishedAt=article["published"],
        reviewStatus="unverified-headline-aggregation",revisions=[])

def merge_articles(articles,old,groups,outlets,max_events=1400):
    # Preserve original reports across runs. Never convert headlines into verified facts.
    old_events=[v for v in old if isinstance(v,dict) and v.get("eventId")]
    cutoff=(NOW-dt.timedelta(days=7)).isoformat()
    result=[v for v in old_events if str(v.get("updatedAt") or "")>=cutoff]
    by_id={v["eventId"]:v for v in result}
    seen=set()
    for ev in result:
        for pub in ev.get("publications",[]):seen.add(canonical_url(pub.get("url","")))
    # Freshest observations first, so titles and sections reflect the latest reports.
    articles.sort(key=lambda a:a["published"],reverse=True)
    count=0
    for article in articles:
        urlkey=canonical_url(article["url"])
        if not urlkey or urlkey in seen:continue
        seen.add(urlkey)
        pub=publication_for(article)
        # Candidate comparisons limited to recent items for performance.
        candidates=[e for e in result if str(e.get("updatedAt") or "")>=(NOW-dt.timedelta(days=3)).isoformat()]
        key=event_id(article["title"],candidates)
        if key in by_id:ev=by_id[key]
        else:
            ev=make_event(article,groups)
            ev["eventId"]=key
            result.append(ev);by_id[key]=ev
        for country in article.get("countries",[article["country"]]):
            if country not in ev["countries"]:ev["countries"].append(country)
        existing_groups={(g.get("country"),g.get("id")) for g in ev["groups"]}
        for country in ev["countries"]:
            for g in group_catalog(country,groups):
                if (country,g["id"]) not in existing_groups:
                    ev["groups"].append(dict(g,country=country)); existing_groups.add((country,g["id"]))
        ev["publications"].append(pub)
        ev.setdefault("revisions",[]).append({
            "at":article["published"],"type":"source-added",
            "text":"A publisher's report was added to this event cluster; underlying claims remain unverified.",
            "url":article["url"],"title":article["title"]
        })
        if article["published"]>str(ev.get("updatedAt") or ""):
            ev["updatedAt"]=article["published"]
        add_coverage(ev,pub,outlets,groups)
        count+=1
    for ev in result:
        pubs=ev["publications"]
        ev["publications"]=sorted(pubs,key=lambda x:x.get("publishedAt",""),reverse=True)[:75]
        ev["countries"]=sorted(set(ev.get("countries",[])))
        ev["summary"]=str(len(pubs))+" attributed publication(s) reported related headlines. These reports have not been independently fact-checked by PHEME."
        ev["sourceCount"]=len(pubs)
        ev["headlineVariantCount"]=len({
            " ".join(sorted(words(p.get("title","")))) or p.get("title","").casefold()
            for p in pubs
        })
        ev["revisions"]=sorted(ev.get("revisions",[]),key=lambda x:x.get("at",""),reverse=True)[:80]
        ev["section"]=section_for(ev.get("reportHeadline",ev.get("title","")))
        ev["reviewStatus"]="unverified-headline-aggregation"
        ev["facts"]=[]  # Crucial: publication count != evidence that an event claim is true.
        ev["doubts"]=[]
        ev["agendas"]=[]
        ev["impacts"]=[]
        ev["locations"]=[]
        ev["parties"]=[]
        ev["unknowns"]=[{"text":"Independent verification of the event's underlying claims is not yet available in this edition."}]
    result.sort(key=lambda e:e.get("updatedAt",""),reverse=True)
    return result[:max_events],count

def collect(countries,slot,all_countries=False,disable_network=False,max_workers=4):
    """Scan a single publicly documented global RSS feed against all 194 country-topic labels."""
    selected=[c["name"] for c in countries if c["name"]!="United States"]
    if disable_network:return [],selected,[],{"gal_ok":0,"gal_scanned":0}
    try:
        reports,examined=fetch_gal(countries,limit=1500)
        return reports,selected,[],{"gal_ok":1,"gal_scanned":examined}
    except (urllib.error.URLError,ValueError,TimeoutError,RuntimeError) as exc:
        return [],selected,[{"provider":"GDELT GAL RSS","country":"Global","error":str(exc)[:240]}],{"gal_ok":0,"gal_scanned":0}

def main(argv=None):
    parser=argparse.ArgumentParser()
    parser.add_argument("--all",action="store_true",help="Search every country; intended for occasional manual refreshes")
    parser.add_argument("--offline",action="store_true",help="Test without external network access")
    parser.add_argument("--max-events",type=int,default=1400)
    args=parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO,format="%(levelname)s %(message)s")
    countries=read_json(COUNTRIES,[])
    if len(countries)!=195 or len({c["name"] for c in countries})!=195:
        raise SystemExit("Country database must contain 195 unique countries")
    group_doc=read_json(GROUPS,{"countries":{}})
    group_catalogs=group_doc.get("countries",{})
    outlets=read_json(OUTLETS,{"outlets":[]}).get("outlets",[])
    previous=read_json(OUTPUT,{"events":[]})
    # Eight distinct three-hour slots each day, covering 194 non-US countries daily.
    slot=NOW.hour//3
    articles,selected,errors,counts=collect(countries,slot,args.all,args.offline)
    events,added=merge_articles(articles,previous.get("events",[]),group_catalogs,outlets,max_events=args.max_events)
    diagnostic=dict(status=("ok" if articles else "no-matching-country-headlines") if counts["gal_ok"] else "no-provider-success",
        searchedCountries=len(selected),receivedArticles=len(articles),
        addedPublications=added,providers=counts,errors=errors[:35],
        policy="Article headlines are attributed reports, not verified facts. Political affiliations require documented outlet mappings.",
        note="GDELT GAL RSS monitored for a rolling 15-minute global article-list window; title mentions determine country-topic relevance across 194 countries. US deferred. This does not establish event location or verify an article claim.")
    write_json(OUTPUT,dict(updatedAt=NOW.isoformat(),events=events,diagnostics=diagnostic))
    log.info("Country catalog=%s source reports=%s new publications=%s events=%s provider results=%s",
             len(selected),len(articles),added,len(events),counts)
    if errors:log.warning("Some provider calls failed; %s errors recorded in diagnostics.",len(errors))

if __name__=="__main__":
    main()

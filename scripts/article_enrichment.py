"""Attribution-only enrichment from open GDELT GAL metadata files.

GDELT Article List metadata contains article URL, title, desc, lang, author, and image.
No publisher article body is fetched, no ungrounded article claims are synthesized.
"""
from __future__ import annotations
import datetime as dt
import gzip
import html
import json
import re
import urllib.error
import urllib.parse
import urllib.request

ROOT="https://data.gdeltproject.org/gdeltv3/gal/"
USER_AGENT="PHEME/1.2 (+https://github.com/marcusdhaynes/Pheme; metadata and source links)"
SUPPORTED={'en','es','fr','de','pt','it','ar','hi','id','zh','ja','ko','ru','tr','nl','sv','pl','uk','bn','ur','th','vi','ms','fa'}
LANG_ALIASES={'eng':'en','spa':'es','fra':'fr','fre':'fr','ger':'de','deu':'de','por':'pt',
              'ita':'it','ara':'ar','hin':'hi','ind':'id','zho':'zh','chi':'zh','jpn':'ja',
              'kor':'ko','rus':'ru','tur':'tr','nld':'nl','dut':'nl','pol':'pl','ukr':'uk'}

def clean(s,max_chars=460):
    s=html.unescape(re.sub(r'<[^>]*>',' ',str(s or '')))
    s=' '.join(s.split())
    return s[:max_chars].rsplit(' ',1)[0]+'…' if len(s)>max_chars else s

def safe_web_url(uri):
    try:
        u=urllib.parse.urlparse(str(uri or ''))
        return uri if u.scheme=='https' and u.netloc else ''
    except (TypeError,ValueError):
        return ''

def canonical(uri):
    try:
        p=urllib.parse.urlparse(uri or '')
        return p.netloc.lower().removeprefix('www.')+p.path.rstrip('/')
    except ValueError:return ''

def norm_lang(raw):
    raw=str(raw or '').lower().split('-',1)[0]
    code=LANG_ALIASES.get(raw,raw)
    return code if code in SUPPORTED else None

def english_heuristic(text):
    """Backstop for older RSS-only headlines; require actual English function words."""
    text=' '+re.sub(r'[^a-z]',' ',str(text or '').lower())+' '
    if not re.search(r'\b(?:the|and|with|from|after|will|that|this|over|against|into|for|says|was|have|has)\b',text):
        return None
    return 'en'

def parse_gal_jsonl(blob, max_records=10000):
    result={}
    try:
        if blob[:2]==b'\x1f\x8b':blob=gzip.decompress(blob)
        for line in blob.splitlines()[:max_records]:
            try:data=json.loads(line)
            except (json.JSONDecodeError,UnicodeDecodeError):continue
            if not isinstance(data,dict) or not data.get('url'):continue
            url=str(data['url'])
            desc=clean(data.get('desc',''),420)
            title=clean(data.get('title',''),220)
            result[canonical(url)]={
                'url':url,'title':title,'description':desc,'lang':norm_lang(data.get('lang')),
                'publisher':clean(data.get('outletName'),85),
                'author':clean(data.get('author'),110),
                'image':safe_web_url(data.get('image')),
                'logo':safe_web_url(data.get('outletLogo')),
                'published':str(data.get('date') or '')
            }
    except (OSError,EOFError,ValueError):return {}
    return result

def download_recent_metadata(now=None,lookback=52,maximum_success=12):
    """Small bounded requests; sparse minute files (404) are expected."""
    now=(now or dt.datetime.now(dt.timezone.utc)).replace(second=0,microsecond=0)
    records={};stats={'checked':0,'success':0,'records':0,'errors':[]}
    for age in range(2,lookback+1):
        if stats['success']>=maximum_success:break
        stamp=(now-dt.timedelta(minutes=age)).strftime('%Y%m%d%H%M')+'00'
        uri=ROOT+stamp+'.gal.json.gz'
        stats['checked']+=1
        try:
            req=urllib.request.Request(uri,headers={'User-Agent':USER_AGENT,'Accept':'application/gzip'})
            with urllib.request.urlopen(req,timeout=9) as res:
                if res.status!=200:continue
                blob=res.read(8_000_001)
                if len(blob)>8_000_000:continue
            parsed=parse_gal_jsonl(blob)
            if parsed:
                stats['success']+=1;stats['records']+=len(parsed)
                # Newest metadata wins.
                for key,value in parsed.items():
                    if key not in records:records[key]=value
        except urllib.error.HTTPError as exc:
            if exc.code not in (404,403):stats['errors'].append(f"{stamp}: HTTP {exc.code}")
            if exc.code==429:break
        except Exception as exc:
            stats['errors'].append(f"{stamp}: {type(exc).__name__}")
        if len(stats['errors'])>8:break
    return records,stats

def attach_metadata(article,metadata):
    result=dict(article)
    m=metadata.get(canonical(article.get('url',''))) or {}
    result['description']=m.get('description','')
    result['lang']=m.get('lang') or english_heuristic(article.get('title',''))
    result['langSource']='GDELT GAL metadata' if m.get('lang') else 'heuristic-title' if result['lang'] else 'undetermined'
    result['author']=m.get('author','')
    result['image']=m.get('image','')
    result['logo']=m.get('logo','')
    if m.get('publisher'):result['publisher']=m['publisher']
    return result

ROLE=re.compile(r'\b(?:President|Prime Minister|Governor|Senator|Minister|Chancellor|King|Queen|CEO|Mayor|Chairman|Chairwoman|Director)\s+((?:[A-Z][\w\-\']+\s+){0,3}[A-Z][\w\-\']+)\b')
PROPER=re.compile(r'\b([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+){1,2})\b')
ORG=re.compile(r'\b(?:NATO|UNICEF|WHO|UNESCO|United Nations|European Union|European Commission|World Bank|International Monetary Fund|Supreme Court)\b',re.I)
SKIP={'The Guardian','The Daily','The New','New York','South Korea','North Korea','United States','United Kingdom','Prime Minister','Breaking News','Associated Press','The Times','Reuters News','Wall Street','White House'}

def actor_mentions(title,desc,max_count=10):
    """Named text mentions only, never infer that they *participated* in the event."""
    text=(title or '')+' . '+(desc or '')
    found=[]
    for regex in (ROLE,ORG,PROPER):
        for m in regex.finditer(text):
            name=clean(m.group(1) if regex is not ORG else m.group(0),80)
            if name not in SKIP and name not in found and len(name)>3:
                found.append(name)
            if len(found)>=max_count:return found
    return found

def excerpt_claims(publications,maximum=5):
    """Return short, attributed publisher descriptions, never 'verified facts'."""
    claims=[];seen=set()
    for pub in publications:
        text=clean(pub.get('description',''),240)
        if not text or len(text)<28:continue
        key=re.sub(r'\W','',text.lower())[:150]
        if key in seen:continue
        seen.add(key)
        claims.append({'text':text,'attribution':pub.get('name') or pub.get('domain') or 'Source',
                       'sources':[{'name':pub.get('name') or 'Original report','url':pub['url']}],
                       'language':pub.get('lang'),'status':'reported-not-verified'})
        if len(claims)>=maximum:break
    return claims

def enrich_event(event):
    pubs=event.get('publications') or []
    # Non-generative excerpts are kept in source language and attributed.
    claims=excerpt_claims(pubs)
    event['reportedClaims']=claims
    event['availableLanguages']=sorted({p.get('lang') for p in pubs if p.get('lang')})
    event['featuredImage']=next((p.get('image') for p in pubs if p.get('image')),None)
    actors=[];sources=[]
    for pub in pubs[:18]:
        gkg_mentions=list(pub.get('persons',[])[:8])+list(pub.get('organizations',[])[:8])
        for name in gkg_mentions+actor_mentions(pub.get('title'),pub.get('description')):
            if not any(a['text']==name for a in actors):
                actors.append({'text':name,'sources':[{'name':pub.get('name') or 'Publisher','url':pub['url']}],
                               'status':'text-mention-unverified'})
        if pub.get('description') and pub.get('url'):sources.append(pub['url'])
    event['parties']=actors[:14]
    # Locations are AUTOMATED TEXT MENTIONS; none proves the site of an event.
    loc=[{'text':c+' (headline topic mention; not verified geolocation)',
          'status':'country-topic-mention'} for c in event.get('countries',[])]
    seen={x['text'].lower() for x in loc}
    for pub in pubs[:16]:
        for place in pub.get('places',[])[:12]:
            title=clean(place,115)
            if title and title.lower() not in seen and len(loc)<20:
                loc.append({'text':title+' (machine-indexed article mention; not confirmed event location)',
                            'sources':[{'url':pub['url'],'name':pub.get('name') or 'Publisher'}],
                            'status':'machine-indexed-text-mention'})
                seen.add(title.lower())
    event['locations']=loc
    topics=[]
    for pub in pubs[:10]:
        for theme in pub.get('themes',[])[:20]:
            if theme not in topics and len(topics)<20:topics.append(theme)
    event['topics']=topics
    # Very cautious rule-based signals: these are attributed source claims, NOT established truths.
    event['facts']=[]
    event['doubts']=[]
    event['agendas']=[]
    event['impacts']=[]
    agenda_pattern=re.compile(r'\b(?:aims? to|seeks? to|goal is to|intended to|in order to|plans? to)\b',re.I)
    impact_pattern=re.compile(r'\b(?:could|may|expected to|would)\b.{0,95}\b(?:affect|impact|cost|increase|reduce|jobs|prices|health|services|communities|schools|households)\b',re.I)
    dispute_pattern=re.compile(r'\b(?:disputes?|denies|denied|contradicts?|rejects? (?:the )?claim|contested|no evidence)\b',re.I)
    for pub in pubs:
        desc=clean(pub.get('description',''),260)
        if not desc or not pub.get('url'):continue
        src=[{'name':pub.get('name') or 'Original publisher','url':pub['url']}]
        for pattern,field,label in (
            (agenda_pattern,'agendas','Source-reported objective (unverified): '),
            (impact_pattern,'impacts','Source-reported potential impact (unverified): '),
            (dispute_pattern,'doubts','Source describes a dispute (unverified): ')
        ):
            if pattern.search(desc) and len(event[field])<3 and not any(x.get('text','').endswith(desc) for x in event[field]):
                event[field].append({'text':label+desc,'sources':src,'status':'attributed-unverified'})

    event['unknowns']=[
        {'text':'The underlying event claims have not been independently verified against primary records.'},
        {'text':'The precise event location, motives and societal impacts may not be established by the available source metadata.'}
    ]
    desc=next((c for c in claims if c.get('language')=='en'),claims[0] if claims else None)
    if desc:
        event['summary']='According to '+desc['attribution']+': '+desc['text']
        event['summaryLanguage']=desc.get('language')
    else:
        event['summary']='Source headlines have been collected; no publisher description is available for an independently supported summary.'
        event['summaryLanguage']='en'
    return event

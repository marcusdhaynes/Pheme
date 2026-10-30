"""Stream open GDELT Article List RSS headlines with conservative country-topic matching.

GDELT documents this as a link/title RSS feed for news monitoring:
https://blog.gdeltproject.org/announcing-the-gdelt-article-list-rss-feed/
"""
from __future__ import annotations
import datetime as dt
import email.utils
import html
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

FEED = "https://data.gdeltproject.org/gdeltv3/gal/feed.rss"
ALIASES = {
    "United Kingdom": ["Britain", "British", "UK", "England", "English", "Scotland", "Scottish", "Wales", "Welsh", "Northern Ireland"],
    "Canada": ["Canadian"], "Mexico": ["Mexican"], "Brazil": ["Brazilian"],
    "India": ["Indian"], "China": ["Chinese"], "Japan": ["Japanese"], "South Korea": ["South Korean"],
    "North Korea": ["North Korean"], "Russia": ["Russian"], "Ukraine": ["Ukrainian"],
    "France": ["French"], "Germany": ["German"], "Italy": ["Italian"],
    "Spain": ["Spanish"], "Portugal": ["Portuguese"], "Greece": ["Greek"],
    "Türkiye": ["Turkey", "Turkish"], "Iran": ["Iranian"], "Iraq": ["Iraqi"],
    "Israel": ["Israeli"], "Palestine": ["Palestinian"], "Saudi Arabia": ["Saudi"],
    "Egypt": ["Egyptian"], "Nigeria": ["Nigerian"], "Kenya": ["Kenyan"],
    "South Africa": ["South African"], "Ethiopia": ["Ethiopian"],
    "Pakistan": ["Pakistani"], "Bangladesh": ["Bangladeshi"],
    "Indonesia": ["Indonesian"], "Malaysia": ["Malaysian"], "Singapore": ["Singaporean"],
    "Philippines": ["Philippine", "Filipino"], "Thailand": ["Thai"],
    "Vietnam": ["Vietnamese"], "Australia": ["Australian"], "New Zealand": ["New Zealander"],
    "Argentina": ["Argentine", "Argentinian"], "Chile": ["Chilean"],
    "Colombia": ["Colombian"], "Venezuela": ["Venezuelan"],
    "Peru": ["Peruvian"], "Bolivia": ["Bolivian"], "Ecuador": ["Ecuadorian"],
    "Honduras": ["Honduran"], "Cuba": ["Cuban"], "Jamaica": ["Jamaican"],
}
AMBIGUOUS_BARE = {
    # Ordinary people's names, places, food or common terms. Match stronger terms if available.
    "Georgia","Jordan","Chad","Oman","Mali","Niger","Turkey","Dominica","Guinea"
}
def text(s):
    return " ".join(html.unescape(re.sub(r"<[^>]+>"," ",s or "")).split())[:500]

def detect_countries(title,countries):
    title=text(title)
    result=[]
    for country in countries:
        name=country["name"]
        if name=="United States":continue
        terms=list(ALIASES.get(name,[]))
        if name not in AMBIGUOUS_BARE:terms.insert(0,name)
        if name=="Türkiye":terms.append("Türkiye")
        if name=="Côte d’Ivoire":terms+=["Ivory Coast","Ivorian"]
        if name=="Cabo Verde":terms+=["Cape Verde"]
        if name=="Timor-Leste":terms+=["East Timor"]
        if name=="Eswatini":terms+=["Swaziland"]
        if name=="Czechia":terms+=["Czech Republic","Czech"]
        if name=="Vatican City":terms+=["Vatican"]
        if name=="Myanmar":terms+=["Burma"]
        if name=="North Macedonia":terms+=["Macedonian"]
        for term in terms:
            if re.search(r"(?<!\w)"+re.escape(term)+r"(?!\w)",title,re.IGNORECASE):
                result.append(name)
                break
    return result

def parse_rss_items(xml_input,countries,limit=1200):
    """Accept bytes or file-like; stream XML without loading an oversized feed."""
    if isinstance(xml_input,bytes):
        import io
        xml_input=io.BytesIO(xml_input)
    records=[]
    seen=set()
    count=0
    for _,element in ET.iterparse(xml_input,events=("end",)):
        if element.tag.rsplit("}",1)[-1]!="item":continue
        count+=1
        raw_title=element.findtext("title") or ""
        title=text(raw_title)
        url=(element.findtext("link") or "").strip()
        if not title or not url.startswith(("https://","http://")):
            element.clear()
            continue
        country_matches=detect_countries(title,countries)
        if not country_matches:
            element.clear()
            continue
        parsed=urllib.parse.urlparse(url)
        if parsed.scheme not in ("http","https") or not parsed.netloc:
            element.clear()
            continue
        if url in seen:
            element.clear()
            continue
        seen.add(url)
        raw_date=element.findtext("pubDate") or ""
        try:published=email.utils.parsedate_to_datetime(raw_date).astimezone(dt.timezone.utc).isoformat()
        except (ValueError,TypeError,OverflowError):published=dt.datetime.now(dt.timezone.utc).isoformat()
        source=element.find("source")
        publisher=text(source.text) if source is not None else parsed.netloc.lower()
        records.append(dict(title=title,url=url,publisher=publisher,domain=parsed.netloc.lower().removeprefix("www."),
            published=published,country=country_matches[0],countries=country_matches,
            api="GDELT GAL RSS"))
        element.clear()
        if len(records)>=limit:break
    return records,count

def fetch_gal(countries,limit=1200,timeout=45):
    req=urllib.request.Request(FEED,headers={"User-Agent":"PHEME/1.0 (https://github.com/marcusdhaynes/Pheme; links and metadata only)",
        "Accept":"application/rss+xml, application/xml;q=0.9, */*;q=0.1"})
    with urllib.request.urlopen(req,timeout=timeout) as response:
        if response.status!=200:raise RuntimeError("GAL HTTP "+str(response.status))
        return parse_rss_items(response,countries,limit)

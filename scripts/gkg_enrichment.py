"""Enrich GDELT GAL articles with GKG 2.1's machine-indexed names, locations and themes.

Records are automatically detected mentions, not proof of an actor's involvement,
a motive, an effect, or an event location.
"""
import io
import re
import urllib.error
import urllib.request
import zipfile
from article_enrichment import canonical,clean

BASE="https://data.gdeltproject.org/gdeltv2/"
AGENT="PHEME/1.2 (https://github.com/marcusdhaynes/Pheme; metadata links and mentions only)"
def split_values(s,delimiter=';',max_items=20):
    result=[]
    for fragment in str(s or '').split(delimiter):
        v=clean(fragment,100)
        if v and v not in result:result.append(v)
        if len(result)>=max_items:break
    return result

def gkg_places(text):
    names=[]
    for fragment in str(text or '').split(';'):
        fields=fragment.split('#')
        if len(fields)<3:continue
        full=clean(fields[1],120)
        if full and full not in names:names.append(full)
        if len(names)>=14:break
    return names

def parse_gkg(blob,needed=None,max_rows=150000):
    """Tab-delimited GKG 2.1 zip; Article URL at col 4; 7 themes, 9 locs, 11 people, 13 orgs."""
    lookup={}
    needed=set(needed or [])
    with zipfile.ZipFile(io.BytesIO(blob)) as archive:
        names=[x for x in archive.namelist() if x.endswith(('.csv','.txt'))]
        if not names:return {}
        with archive.open(names[0]) as file:
            for i,raw in enumerate(file):
                if i>=max_rows:break
                parts=raw.decode('utf-8','replace').rstrip('\r\n').split('\t')
                if len(parts)<15:continue
                key=canonical(parts[4])
                if needed and key not in needed:continue
                lookup[key]={
                    'themes':split_values(parts[7],';',18),
                    'places':gkg_places(parts[9]),
                    'persons':split_values(parts[11],';',12),
                    'organizations':split_values(parts[13],';',12),
                    'source':'GDELT GKG 2.1 machine-indexed metadata'
                }
    return lookup

def fetch_gkg(needed,timeout=30):
    stats={'ok':0,'matches':0,'errors':[]}
    try:
        with urllib.request.urlopen(urllib.request.Request(BASE+'lastupdate.txt',headers={'User-Agent':AGENT}),timeout=timeout) as response:
            pointer=response.read(12000).decode('utf-8','replace')
        line=next((ln for ln in pointer.splitlines() if '.gkg.csv.zip' in ln),None)
        if not line:raise ValueError('No current GKG data listed')
        url=line.split()[-1].replace('http://','https://')
        if not url.startswith(BASE):raise ValueError('Unexpected GKG pointer URL')
        with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':AGENT}),timeout=timeout) as response:
            data=response.read(15_000_000)
        if len(data)>=15_000_000:raise ValueError('GKG download too large')
        matches=parse_gkg(data,needed=needed)
        stats['ok']=1;stats['matches']=len(matches)
        return matches,stats
    except Exception as exc:
        stats['errors'].append(type(exc).__name__+': '+str(exc)[:120])
        return {},stats

def annotate_publications(publications,lookup):
    for pub in publications:
        g=lookup.get(canonical(pub.get('url')))
        if g:
            for key in ('persons','organizations','places','themes'):
                pub[key]=g[key]
            pub['entitySource']=g['source']
    return publications

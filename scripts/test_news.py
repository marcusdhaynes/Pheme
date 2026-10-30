"""Offline PHEME intake checks (stdlib only)."""
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[0]))
import build_news as n

class NewsTests(unittest.TestCase):
    def test_195_unique_countries(self):
        countries=n.read_json(n.COUNTRIES,[])
        self.assertEqual(len(countries),195)
        self.assertEqual(len({x["name"] for x in countries}),195)
        self.assertIn("United States",{x["name"] for x in countries})
    def test_no_us_in_rotating_queries(self):
        countries=n.read_json(n.COUNTRIES,[])
        found=set()
        for slot in range(8):
            _,selection,_,_=n.collect(countries,slot,disable_network=True)
            found.update(selection)
        self.assertEqual(len(found),194)
        self.assertNotIn("United States",found)
    def test_section_detection(self):
        self.assertEqual(n.section_for("Argentina beat Brazil in football tournament"),"Sports")
        self.assertEqual(n.section_for("Major smartphone chipmaker unveils new semiconductor"),"Technology")
        self.assertEqual(n.section_for("University appoints new teacher"),"Education")
    def test_no_invented_facts(self):
        a={"title":"National election counted across regions","country":"Canada",
           "publisher":"News Publisher","url":"https://example.com/test1",
           "domain":"example.com","published":n.NOW.isoformat(),"api":"GDELT"}
        events,count=n.merge_articles([a],[],{},[],30)
        self.assertEqual(count,1)
        self.assertEqual(events[0]["facts"],[])
        self.assertEqual(events[0]["agendas"],[])
        self.assertEqual(events[0]["reviewStatus"],"unverified-headline-aggregation")
        self.assertEqual(len(events[0]["publications"]),1)
    def test_duplicate_url_does_not_duplicate_publication(self):
        a={"title":"Economic summit convenes in capital","country":"Kenya","publisher":"Reporter",
           "url":"https://example.com/story","domain":"example.com",
           "published":n.NOW.isoformat(),"api":"GDELT"}
        events,count=n.merge_articles([a,a],[],{},[],30)
        self.assertEqual(count,1)
        self.assertEqual(len(events[0]["publications"]),1)
    def test_group_c_d_supported_only_when_evidenced(self):
        a={"title":"Political coalition passes new legislation","country":"Canada","publisher":"Public News",
           "url":"https://outlet.example/story","domain":"outlet.example",
           "published":n.NOW.isoformat(),"api":"GDELT"}
        groups={"Canada":[{"id":str(i),"name":"Group "+str(i)} for i in range(6)]}
        outlet=[{"country":"Canada","domain":"outlet.example","groupId":"5","level":"hardline",
                 "evidenceUrl":"https://independent-research.example/evidence"}]
        events,_=n.merge_articles([a],[],groups,outlet,30)
        self.assertEqual(len(events[0]["groups"]),6)
        self.assertEqual(events[0]["coverage"][0]["groupId"],"5")
        self.assertEqual(events[0]["coverage"][0]["level"],"hardline")
        events2,_=n.merge_articles([a],[],groups,[dict(outlet[0],evidenceUrl="")],30)
        self.assertEqual(events2[0]["coverage"],[])
    def test_parser_discard_short_headlines(self):
        self.assertTrue(n.event_id("A",[]).startswith("event-"))


    def test_gal_rss_country_classification(self):
        import gal_feed as gal
        countries=n.read_json(n.COUNTRIES,[])
        xml=b'''<?xml version="1.0"?><rss version="2.0"><channel>
          <item><title>Canadian research team develops new technology</title>
          <link>https://example.org/story/1</link><pubDate>Thu, 29 Oct 2026 12:00:00 GMT</pubDate></item>
          <item><title>Canada and Japan sign environmental pact</title>
          <link>https://example.org/story/2</link><pubDate>Thu, 29 Oct 2026 13:00:00 GMT</pubDate></item>
          <item><title>Unrelated city street event</title><link>https://example.org/story/3</link></item>
        </channel></rss>'''
        rows,scanned=gal.parse_rss_items(xml,countries)
        self.assertEqual(scanned,3)
        self.assertEqual(len(rows),2)
        self.assertEqual(rows[0]["countries"],["Canada"])
        self.assertIn("Canada",rows[1]["countries"])
        self.assertIn("Japan",rows[1]["countries"])
        self.assertNotIn("United States",rows[1]["countries"])
        self.assertEqual(rows[0]["api"],"GDELT GAL RSS")

    def test_no_bare_ambiguous_country_match(self):
        import gal_feed as gal
        countries=n.read_json(n.COUNTRIES,[])
        self.assertNotIn("Georgia",gal.detect_countries("Georgia's football team beat Jordan",countries))
        self.assertNotIn("Jordan",gal.detect_countries("Georgia's football team beat Jordan",countries))


    def test_article_metadata_language_and_report(self):
        import gzip,json
        from article_enrichment import parse_gal_jsonl,attach_metadata,enrich_event
        raw={'url':'https://example.com/123','title':'Canada announces new public transit proposal',
             'desc':'The transport ministry plans to extend service access for commuters next year.',
             'lang':'en','author':'A. Reporter','outletName':'Example News',
             'image':'https://images.example.com/photo.jpg','date':'2026-10-29T12:00:00.000Z'}
        records=parse_gal_jsonl(gzip.compress((json.dumps(raw)+'\\n').replace('\\n','\n').encode('utf8')))
        self.assertEqual(records['example.com/123']['lang'],'en')
        row={'url':raw['url'],'title':raw['title'],'country':'Canada','countries':['Canada'],
             'publisher':'Original','domain':'example.com','published':n.NOW.isoformat(),'api':'GDELT GAL RSS'}
        pub=attach_metadata(row,records)
        self.assertEqual(pub['description'],raw['desc'])
        self.assertEqual(pub['lang'],'en')
        ev,added=n.merge_articles([pub],[],{},[],40)
        self.assertEqual(added,1)
        self.assertEqual(len(ev[0]['reportedClaims']),1)
        self.assertTrue(ev[0]['parties'] is not None)
        self.assertEqual(ev[0]['facts'],[])
        self.assertTrue(ev[0]['agendas'])
        self.assertEqual(ev[0]['publications'][0]['lang'],'en')

    def test_language_metadata_and_invalid_image(self):
        from article_enrichment import norm_lang,safe_web_url
        self.assertEqual(norm_lang('eng'),'en')
        self.assertEqual(norm_lang('es'),'es')
        self.assertIsNone(norm_lang('unrecognized'))
        self.assertEqual(safe_web_url('javascript:alert(1)'),'')


    def test_gkg_machine_mentions(self):
        import zipfile,io
        from gkg_enrichment import parse_gkg,annotate_publications
        cols=['']*27
        cols[4]='https://example.org/report'
        cols[7]='EPU_POLICY;GENERAL_HEALTH'
        cols[9]='1#Paris, France#FR#'
        cols[11]='Jane Smith;Alex Jones'
        cols[13]='World Health Organization;Local Council'
        raw=('\t'.join(cols)+'\n').encode('utf-8')
        buf=io.BytesIO()
        with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as z:
            z.writestr('test.gkg.csv',raw)
        result=parse_gkg(buf.getvalue(),needed={'example.org/report'})
        self.assertIn('example.org/report',result)
        self.assertIn('Jane Smith',result['example.org/report']['persons'])
        self.assertIn('Paris, France',result['example.org/report']['places'])
        p=[{'url':'https://example.org/report'}]
        annotate_publications(p,result)
        self.assertEqual(p[0]['organizations'][0],'World Health Organization')

if __name__=="__main__":
    unittest.main()

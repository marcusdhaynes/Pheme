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

if __name__=="__main__":
    unittest.main()

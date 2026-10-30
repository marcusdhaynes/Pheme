/* PHEME country filtering + verified story presentation.
 * News content must arrive through a separately verified editorial feed.
 * This client does not fabricate news, determine truth, or auto-label outlets.
 */
(function () {
  'use strict';
  const COUNTRIES = [{"name":"Algeria","continent":"Africa","region":"Northern Africa"},{"name":"Egypt","continent":"Africa","region":"Northern Africa"},{"name":"Libya","continent":"Africa","region":"Northern Africa"},{"name":"Morocco","continent":"Africa","region":"Northern Africa"},{"name":"Sudan","continent":"Africa","region":"Northern Africa"},{"name":"Tunisia","continent":"Africa","region":"Northern Africa"},{"name":"Benin","continent":"Africa","region":"Western Africa"},{"name":"Burkina Faso","continent":"Africa","region":"Western Africa"},{"name":"Cabo Verde","continent":"Africa","region":"Western Africa"},{"name":"Côte d’Ivoire","continent":"Africa","region":"Western Africa"},{"name":"Gambia","continent":"Africa","region":"Western Africa"},{"name":"Ghana","continent":"Africa","region":"Western Africa"},{"name":"Guinea","continent":"Africa","region":"Western Africa"},{"name":"Guinea-Bissau","continent":"Africa","region":"Western Africa"},{"name":"Liberia","continent":"Africa","region":"Western Africa"},{"name":"Mali","continent":"Africa","region":"Western Africa"},{"name":"Mauritania","continent":"Africa","region":"Western Africa"},{"name":"Niger","continent":"Africa","region":"Western Africa"},{"name":"Nigeria","continent":"Africa","region":"Western Africa"},{"name":"Senegal","continent":"Africa","region":"Western Africa"},{"name":"Sierra Leone","continent":"Africa","region":"Western Africa"},{"name":"Togo","continent":"Africa","region":"Western Africa"},{"name":"Angola","continent":"Africa","region":"Central Africa"},{"name":"Cameroon","continent":"Africa","region":"Central Africa"},{"name":"Central African Republic","continent":"Africa","region":"Central Africa"},{"name":"Chad","continent":"Africa","region":"Central Africa"},{"name":"Republic of the Congo","continent":"Africa","region":"Central Africa"},{"name":"Democratic Republic of the Congo","continent":"Africa","region":"Central Africa"},{"name":"Equatorial Guinea","continent":"Africa","region":"Central Africa"},{"name":"Gabon","continent":"Africa","region":"Central Africa"},{"name":"São Tomé and Príncipe","continent":"Africa","region":"Central Africa"},{"name":"Burundi","continent":"Africa","region":"Eastern Africa"},{"name":"Comoros","continent":"Africa","region":"Eastern Africa"},{"name":"Djibouti","continent":"Africa","region":"Eastern Africa"},{"name":"Eritrea","continent":"Africa","region":"Eastern Africa"},{"name":"Ethiopia","continent":"Africa","region":"Eastern Africa"},{"name":"Kenya","continent":"Africa","region":"Eastern Africa"},{"name":"Madagascar","continent":"Africa","region":"Eastern Africa"},{"name":"Malawi","continent":"Africa","region":"Eastern Africa"},{"name":"Mauritius","continent":"Africa","region":"Eastern Africa"},{"name":"Mozambique","continent":"Africa","region":"Eastern Africa"},{"name":"Rwanda","continent":"Africa","region":"Eastern Africa"},{"name":"Seychelles","continent":"Africa","region":"Eastern Africa"},{"name":"Somalia","continent":"Africa","region":"Eastern Africa"},{"name":"South Sudan","continent":"Africa","region":"Eastern Africa"},{"name":"Tanzania","continent":"Africa","region":"Eastern Africa"},{"name":"Uganda","continent":"Africa","region":"Eastern Africa"},{"name":"Zambia","continent":"Africa","region":"Eastern Africa"},{"name":"Zimbabwe","continent":"Africa","region":"Eastern Africa"},{"name":"Botswana","continent":"Africa","region":"Southern Africa"},{"name":"Eswatini","continent":"Africa","region":"Southern Africa"},{"name":"Lesotho","continent":"Africa","region":"Southern Africa"},{"name":"Namibia","continent":"Africa","region":"Southern Africa"},{"name":"South Africa","continent":"Africa","region":"Southern Africa"},{"name":"Kazakhstan","continent":"Asia","region":"Central Asia"},{"name":"Kyrgyzstan","continent":"Asia","region":"Central Asia"},{"name":"Tajikistan","continent":"Asia","region":"Central Asia"},{"name":"Turkmenistan","continent":"Asia","region":"Central Asia"},{"name":"Uzbekistan","continent":"Asia","region":"Central Asia"},{"name":"China","continent":"Asia","region":"Eastern Asia"},{"name":"Japan","continent":"Asia","region":"Eastern Asia"},{"name":"Mongolia","continent":"Asia","region":"Eastern Asia"},{"name":"North Korea","continent":"Asia","region":"Eastern Asia"},{"name":"South Korea","continent":"Asia","region":"Eastern Asia"},{"name":"Brunei","continent":"Asia","region":"Southeastern Asia"},{"name":"Cambodia","continent":"Asia","region":"Southeastern Asia"},{"name":"Indonesia","continent":"Asia","region":"Southeastern Asia"},{"name":"Laos","continent":"Asia","region":"Southeastern Asia"},{"name":"Malaysia","continent":"Asia","region":"Southeastern Asia"},{"name":"Myanmar","continent":"Asia","region":"Southeastern Asia"},{"name":"Philippines","continent":"Asia","region":"Southeastern Asia"},{"name":"Singapore","continent":"Asia","region":"Southeastern Asia"},{"name":"Thailand","continent":"Asia","region":"Southeastern Asia"},{"name":"Timor-Leste","continent":"Asia","region":"Southeastern Asia"},{"name":"Vietnam","continent":"Asia","region":"Southeastern Asia"},{"name":"Afghanistan","continent":"Asia","region":"Southern Asia"},{"name":"Bangladesh","continent":"Asia","region":"Southern Asia"},{"name":"Bhutan","continent":"Asia","region":"Southern Asia"},{"name":"India","continent":"Asia","region":"Southern Asia"},{"name":"Iran","continent":"Asia","region":"Southern Asia"},{"name":"Maldives","continent":"Asia","region":"Southern Asia"},{"name":"Nepal","continent":"Asia","region":"Southern Asia"},{"name":"Pakistan","continent":"Asia","region":"Southern Asia"},{"name":"Sri Lanka","continent":"Asia","region":"Southern Asia"},{"name":"Armenia","continent":"Asia","region":"Western Asia"},{"name":"Azerbaijan","continent":"Asia","region":"Western Asia"},{"name":"Bahrain","continent":"Asia","region":"Western Asia"},{"name":"Cyprus","continent":"Asia","region":"Western Asia"},{"name":"Georgia","continent":"Asia","region":"Western Asia"},{"name":"Iraq","continent":"Asia","region":"Western Asia"},{"name":"Israel","continent":"Asia","region":"Western Asia"},{"name":"Jordan","continent":"Asia","region":"Western Asia"},{"name":"Kuwait","continent":"Asia","region":"Western Asia"},{"name":"Lebanon","continent":"Asia","region":"Western Asia"},{"name":"Oman","continent":"Asia","region":"Western Asia"},{"name":"Palestine","continent":"Asia","region":"Western Asia"},{"name":"Qatar","continent":"Asia","region":"Western Asia"},{"name":"Saudi Arabia","continent":"Asia","region":"Western Asia"},{"name":"Syria","continent":"Asia","region":"Western Asia"},{"name":"Türkiye","continent":"Asia","region":"Western Asia"},{"name":"United Arab Emirates","continent":"Asia","region":"Western Asia"},{"name":"Yemen","continent":"Asia","region":"Western Asia"},{"name":"Denmark","continent":"Europe","region":"Northern Europe"},{"name":"Estonia","continent":"Europe","region":"Northern Europe"},{"name":"Finland","continent":"Europe","region":"Northern Europe"},{"name":"Iceland","continent":"Europe","region":"Northern Europe"},{"name":"Ireland","continent":"Europe","region":"Northern Europe"},{"name":"Latvia","continent":"Europe","region":"Northern Europe"},{"name":"Lithuania","continent":"Europe","region":"Northern Europe"},{"name":"Norway","continent":"Europe","region":"Northern Europe"},{"name":"Sweden","continent":"Europe","region":"Northern Europe"},{"name":"United Kingdom","continent":"Europe","region":"Northern Europe"},{"name":"Austria","continent":"Europe","region":"Western Europe"},{"name":"Belgium","continent":"Europe","region":"Western Europe"},{"name":"France","continent":"Europe","region":"Western Europe"},{"name":"Germany","continent":"Europe","region":"Western Europe"},{"name":"Liechtenstein","continent":"Europe","region":"Western Europe"},{"name":"Luxembourg","continent":"Europe","region":"Western Europe"},{"name":"Monaco","continent":"Europe","region":"Western Europe"},{"name":"Netherlands","continent":"Europe","region":"Western Europe"},{"name":"Switzerland","continent":"Europe","region":"Western Europe"},{"name":"Belarus","continent":"Europe","region":"Eastern Europe"},{"name":"Bulgaria","continent":"Europe","region":"Eastern Europe"},{"name":"Czechia","continent":"Europe","region":"Eastern Europe"},{"name":"Hungary","continent":"Europe","region":"Eastern Europe"},{"name":"Moldova","continent":"Europe","region":"Eastern Europe"},{"name":"Poland","continent":"Europe","region":"Eastern Europe"},{"name":"Romania","continent":"Europe","region":"Eastern Europe"},{"name":"Russia","continent":"Europe","region":"Eastern Europe"},{"name":"Slovakia","continent":"Europe","region":"Eastern Europe"},{"name":"Ukraine","continent":"Europe","region":"Eastern Europe"},{"name":"Albania","continent":"Europe","region":"Southern Europe"},{"name":"Andorra","continent":"Europe","region":"Southern Europe"},{"name":"Bosnia and Herzegovina","continent":"Europe","region":"Southern Europe"},{"name":"Croatia","continent":"Europe","region":"Southern Europe"},{"name":"Greece","continent":"Europe","region":"Southern Europe"},{"name":"Vatican City","continent":"Europe","region":"Southern Europe"},{"name":"Italy","continent":"Europe","region":"Southern Europe"},{"name":"Malta","continent":"Europe","region":"Southern Europe"},{"name":"Montenegro","continent":"Europe","region":"Southern Europe"},{"name":"North Macedonia","continent":"Europe","region":"Southern Europe"},{"name":"Portugal","continent":"Europe","region":"Southern Europe"},{"name":"San Marino","continent":"Europe","region":"Southern Europe"},{"name":"Serbia","continent":"Europe","region":"Southern Europe"},{"name":"Slovenia","continent":"Europe","region":"Southern Europe"},{"name":"Spain","continent":"Europe","region":"Southern Europe"},{"name":"Canada","continent":"North America","region":"Northern America"},{"name":"United States","continent":"North America","region":"Northern America"},{"name":"Mexico","continent":"North America","region":"Northern America"},{"name":"Belize","continent":"North America","region":"Central America"},{"name":"Costa Rica","continent":"North America","region":"Central America"},{"name":"El Salvador","continent":"North America","region":"Central America"},{"name":"Guatemala","continent":"North America","region":"Central America"},{"name":"Honduras","continent":"North America","region":"Central America"},{"name":"Nicaragua","continent":"North America","region":"Central America"},{"name":"Panama","continent":"North America","region":"Central America"},{"name":"Antigua and Barbuda","continent":"North America","region":"Caribbean"},{"name":"Bahamas","continent":"North America","region":"Caribbean"},{"name":"Barbados","continent":"North America","region":"Caribbean"},{"name":"Cuba","continent":"North America","region":"Caribbean"},{"name":"Dominica","continent":"North America","region":"Caribbean"},{"name":"Dominican Republic","continent":"North America","region":"Caribbean"},{"name":"Grenada","continent":"North America","region":"Caribbean"},{"name":"Haiti","continent":"North America","region":"Caribbean"},{"name":"Jamaica","continent":"North America","region":"Caribbean"},{"name":"Saint Kitts and Nevis","continent":"North America","region":"Caribbean"},{"name":"Saint Lucia","continent":"North America","region":"Caribbean"},{"name":"Saint Vincent and the Grenadines","continent":"North America","region":"Caribbean"},{"name":"Trinidad and Tobago","continent":"North America","region":"Caribbean"},{"name":"Colombia","continent":"South America","region":"Northern South America"},{"name":"Guyana","continent":"South America","region":"Northern South America"},{"name":"Suriname","continent":"South America","region":"Northern South America"},{"name":"Venezuela","continent":"South America","region":"Northern South America"},{"name":"Bolivia","continent":"South America","region":"Andean South America"},{"name":"Ecuador","continent":"South America","region":"Andean South America"},{"name":"Peru","continent":"South America","region":"Andean South America"},{"name":"Argentina","continent":"South America","region":"Southern Cone"},{"name":"Chile","continent":"South America","region":"Southern Cone"},{"name":"Paraguay","continent":"South America","region":"Southern Cone"},{"name":"Uruguay","continent":"South America","region":"Southern Cone"},{"name":"Brazil","continent":"South America","region":"Eastern South America"},{"name":"Australia","continent":"Oceania","region":"Australia and New Zealand"},{"name":"New Zealand","continent":"Oceania","region":"Australia and New Zealand"},{"name":"Fiji","continent":"Oceania","region":"Melanesia"},{"name":"Papua New Guinea","continent":"Oceania","region":"Melanesia"},{"name":"Solomon Islands","continent":"Oceania","region":"Melanesia"},{"name":"Vanuatu","continent":"Oceania","region":"Melanesia"},{"name":"Kiribati","continent":"Oceania","region":"Micronesia"},{"name":"Marshall Islands","continent":"Oceania","region":"Micronesia"},{"name":"Federated States of Micronesia","continent":"Oceania","region":"Micronesia"},{"name":"Nauru","continent":"Oceania","region":"Micronesia"},{"name":"Palau","continent":"Oceania","region":"Micronesia"},{"name":"Samoa","continent":"Oceania","region":"Polynesia"},{"name":"Tonga","continent":"Oceania","region":"Polynesia"},{"name":"Tuvalu","continent":"Oceania","region":"Polynesia"}];
  const LEVELS = ['moderate','mainstream','hardline'];
  const KEY = 'pheme.selectedCountries';
  const SECTIONS = ['World','Politics','Business','Technology','Science','Health','Sports','Entertainment','Culture','Environment','Education','Crime & Justice','Travel'];
  const SECTION_KEY = 'pheme.enabledSections';
  const OVERRIDE_KEY = 'pheme.sectionAssignments';
  function storedJson(key,fallback) { try { const raw=localStorage.getItem(key);return raw==null?fallback:JSON.parse(raw); } catch(_) {return fallback;} }
  let enabledSections = new Set((() => { const v=storedJson(SECTION_KEY,SECTIONS);return Array.isArray(v)?v.filter(s=>SECTIONS.includes(s)):SECTIONS; })());
  let sectionAssignments = storedJson(OVERRIDE_KEY,{});
  if(!sectionAssignments || Array.isArray(sectionAssignments) || typeof sectionAssignments!=='object')sectionAssignments={};
  let selectedSection = 'All';
  let feedUpdatedAt = null;
  let feedDiagnostics = null;
  function sectionOf(story){ return SECTIONS.includes(sectionAssignments[story.id])?sectionAssignments[story.id]:(SECTIONS.includes(story.section)?story.section:'World'); }
  function persistSections() {
    try {localStorage.setItem(SECTION_KEY,JSON.stringify([...enabledSections])); localStorage.setItem(OVERRIDE_KEY,JSON.stringify(sectionAssignments));}catch(_){}
  }
  const panel = document.getElementById('settings-panel');
  const grid = document.querySelector('.edition-grid');
  const search = document.getElementById('search-input');
  const dialog = document.getElementById('reader-dialog');
  const body = document.getElementById('dialog-body');
  const ed = document.querySelector('.edition-line span:nth-child(2)');
  const footer = document.querySelector('.paper-footer span:nth-child(2)');
  const supported = new Set(COUNTRIES.map(c => c.name));
  function el(tag, cls, text) {
    const x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text != null) x.textContent = String(text);
    return x;
  }
  function readSelection() {
    try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v.filter(x => supported.has(x)) : []; }
    catch (_) { return []; }
  }
  let selected = new Set(readSelection()); // NEVER guess the user's location or preselect countries.
  let feed = [];
  let bookmarkOnly = false;
  let selectedStory = null;
  function urlSafe(s) {
    try { const u = new URL(s); return ['https:','http:'].includes(u.protocol) ? u.href : null; }
    catch (_) { return null; }
  }
  function uniqueStrings(list) {
    const seen = new Set();
    return (Array.isArray(list) ? list : []).filter(x => {
      const k = typeof x === 'string' ? x.trim().toLowerCase() : JSON.stringify(x);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  function asText(item) { return typeof item === 'string' ? item : String(item && item.text || ''); }
  function normalise(story) {
    if (!story || typeof story !== 'object' || !(story.eventId || story.id)) return null;
    return {
      id: String(story.eventId || story.id),
      title: String(story.title || 'Untitled event'),
      summary: String(story.summary || ''),
      section: SECTIONS.includes(story.section)?story.section:'World',
      reviewStatus: String(story.reviewStatus || ''),
      revisions: Array.isArray(story.revisions)?story.revisions:[],
      countries: uniqueStrings(story.countries).filter(x => supported.has(x)),
      groups: Array.isArray(story.groups) ? story.groups : [],
      coverage: Array.isArray(story.coverage) ? story.coverage : [],
      facts: Array.isArray(story.facts) ? story.facts : [],
      doubts: Array.isArray(story.doubts) ? story.doubts : [],
      unknowns: Array.isArray(story.unknowns) ? story.unknowns : [],
      parties: Array.isArray(story.parties) ? story.parties : [],
      locations: Array.isArray(story.locations) ? story.locations : [],
      agendas: Array.isArray(story.agendas) ? story.agendas : [],
      impacts: Array.isArray(story.impacts) ? story.impacts : [],
      publications: Array.isArray(story.publications) ? story.publications : [],
      updatedAt: story.updatedAt || null
    };
  }
  function mergeStories(records) {
    const output = new Map();
    (Array.isArray(records) ? records : []).forEach(raw => {
      const story = normalise(raw);
      if (!story) return;
      if (!output.has(story.id)) { output.set(story.id, story); return; }
      const old = output.get(story.id);
      ['countries','facts','doubts','unknowns','parties','locations','agendas','impacts','publications']
        .forEach(key => { old[key] = uniqueStrings(old[key].concat(story[key])); });
      const groupIndex = new Map();
      old.groups.concat(story.groups).forEach(g => { if (g && (g.id || g.name)) groupIndex.set(String(g.id || g.name), g); });
      old.groups = Array.from(groupIndex.values());
      const coverageIndex = new Map();
      old.coverage.concat(story.coverage).forEach(c => {
        if (!c) return;
        const key = [c.country || '',c.groupId || c.group || '', String(c.level || '').toLowerCase()].join('::');
        const prev = coverageIndex.get(key);
        coverageIndex.set(key, Object.assign({}, prev || {}, c, {sources:uniqueStrings((prev && prev.sources || []).concat(c.sources || []))}));
      });
      old.coverage = Array.from(coverageIndex.values());
      if (story.updatedAt && (!old.updatedAt || story.updatedAt > old.updatedAt)) { old.updatedAt=story.updatedAt; old.title=story.title; old.summary=story.summary; }
    });
    return Array.from(output.values()).sort((a,b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(Array.from(selected))); } catch (_) {} }
  const sectionBox = el('section','pheme-sections-setting');
  sectionBox.innerHTML='<div class="pheme-country-head"><h3>Newspaper sections</h3><span id="pheme-sections-count"></span></div>'+
    '<p class="setting-caption">Choose which types of news appear. Assign any story to a section from its full report.</p>'+
    '<div class="pheme-country-actions"><button type="button" id="pheme-sections-all">Show all</button><button type="button" id="pheme-sections-none">Hide all</button></div>'+
    '<div class="pheme-section-checkboxes" id="pheme-section-checkboxes"></div>';
  panel.querySelector('.settings-head').after(sectionBox);
  const sectionChecks=document.getElementById('pheme-section-checkboxes');
  const sectionMenu=document.getElementById('sections-menu');
  const sectionButton=document.getElementById('sections-button');
  sectionButton.hidden=false;
  function renderSectionSettings(){
    sectionChecks.replaceChildren();
    SECTIONS.forEach(name=>{
      const label=el('label','pheme-country-option');
      const input=el('input');input.type='checkbox';input.checked=enabledSections.has(name);
      input.addEventListener('change',()=>{
        if(input.checked)enabledSections.add(name);else enabledSections.delete(name);
        persistSections();renderSectionSettings();renderSectionMenu();renderEdition();
      });
      label.append(input,document.createTextNode(name));
      sectionChecks.appendChild(label);
    });
    document.getElementById('pheme-sections-count').textContent=enabledSections.size+' / '+SECTIONS.length;
  }
  function renderSectionMenu(){
    sectionMenu.replaceChildren();
    ['All',...SECTIONS.filter(name=>enabledSections.has(name))].forEach(name=>{
      const link=el('a',null,name);
      link.href='#top';
      if(selectedSection===name)link.setAttribute('aria-current','page');
      link.addEventListener('click',event=>{
        event.preventDefault();selectedSection=name;renderSectionMenu();renderEdition();
        sectionMenu.hidden=true;sectionButton.setAttribute('aria-expanded','false');
        window.scrollTo({top:0,behavior:'smooth'});
      });
      sectionMenu.appendChild(link);
    });
  }
  document.getElementById('pheme-sections-all').addEventListener('click',()=>{enabledSections=new Set(SECTIONS);persistSections();renderSectionSettings();renderSectionMenu();renderEdition();});
  document.getElementById('pheme-sections-none').addEventListener('click',()=>{enabledSections.clear();persistSections();renderSectionSettings();renderSectionMenu();renderEdition();});
  renderSectionSettings();renderSectionMenu();
  const countryBox = el('section','pheme-countries');
  countryBox.innerHTML =
    '<div class="pheme-country-head"><h3>Countries in your edition</h3><span id="pheme-country-count"></span></div>' +
    '<p class="setting-caption">Choose which countries you want news about. None are selected by default.</p>' +
    '<label class="pheme-country-search-label" for="pheme-country-search">Find a country</label>' +
    '<input id="pheme-country-search" type="search" placeholder="Search 195 countries…">' +
    '<div class="pheme-country-actions"><button type="button" id="pheme-select-none">Clear all</button><button type="button" id="pheme-select-all">Select all</button></div>' +
    '<div class="pheme-country-list" id="pheme-country-list"></div>';
  panel.querySelector('.settings-head').after(countryBox);
  const list = document.getElementById('pheme-country-list');
  function renderCountries(filter) {
    list.replaceChildren();
    const q = String(filter || '').trim().toLowerCase();
    const continents = [...new Set(COUNTRIES.map(c => c.continent))];
    continents.forEach(continent => {
      const rows = COUNTRIES.filter(c => c.continent===continent && (!q || (c.name+' '+c.region+' '+c.continent).toLowerCase().includes(q)));
      if (!rows.length) return;
      const details = el('details','pheme-continent');
      details.open = !!q;
      const summary = el('summary',null,continent+' · '+rows.length);
      details.appendChild(summary);
      const subregions = [...new Set(rows.map(c => c.region))];
      subregions.forEach(region => {
        const heading = el('h4',null,region);
        details.appendChild(heading);
        rows.filter(c=>c.region===region).forEach(c => {
          const label = el('label','pheme-country-option');
          const input = el('input'); input.type='checkbox'; input.value=c.name; input.checked=selected.has(c.name);
          input.addEventListener('change', () => {
            if (input.checked) selected.add(c.name); else selected.delete(c.name);
            save(); updateCount(); renderEdition();
          });
          label.append(input,document.createTextNode(c.name)); details.appendChild(label);
        });
      });
      list.appendChild(details);
    });
  }
  function updateCount() {
    document.getElementById('pheme-country-count').textContent = selected.size+' / '+COUNTRIES.length+' selected';
  }
  document.getElementById('pheme-country-search').addEventListener('input', e=>renderCountries(e.target.value));
  document.getElementById('pheme-select-none').addEventListener('click',()=>{ selected.clear(); save(); renderCountries(document.getElementById('pheme-country-search').value); updateCount(); renderEdition(); });
  document.getElementById('pheme-select-all').addEventListener('click',()=>{ selected=new Set(COUNTRIES.map(c=>c.name)); save(); renderCountries(document.getElementById('pheme-country-search').value); updateCount(); renderEdition(); });
  function coverageCount(story) {
    // A mark exists only when a source URL is attached to the political perspective.
    const slots = new Set();
    story.coverage.forEach(c=>{
      if (!c || !LEVELS.includes(String(c.level||'').toLowerCase()) || !urlSafe(c.evidenceUrl) || !(c.sources||[]).some(s=>urlSafe(typeof s==='string'?s:s && s.url))) return;
      slots.add([c.country,c.groupId||c.group,String(c.level).toLowerCase()].join('::'));
    });
    return slots.size;
  }
  function storyCard(story,lead) {
    const article = el('article',lead?'pheme-story-card pheme-feature':'pheme-story-card');
    const section = el('div','section-label',sectionOf(story).toUpperCase()+' · '+(story.countries.join(' · ')||'WORLD'));
    const heading = el(lead?'h2':'h3',lead?'lead-title':'side-title',story.title);
    const copy = el('p','pheme-card-copy',story.summary || 'Open this story to inspect the available evidence.');
    const covered = coverageCount(story);
    const info = el('p','pheme-card-metadata',covered+' sourced political slots · '+story.publications.length+' publications'+(story.reviewStatus==='unverified-headline-aggregation'?' · Not independently fact-checked':''));
    const actions=el('div','story-footer');
    const read=el('button','read-link','Read report ↗'); read.type='button'; read.addEventListener('click',()=>openStory(story));
    actions.appendChild(read);
    const saved=bookmarkIds().includes(story.id);
    const mark=el('button','bookmark-button',saved?'★':'☆');
    mark.type='button';mark.setAttribute('aria-label',(saved?'Remove bookmark':'Bookmark story')+': '+story.title);
    mark.setAttribute('aria-pressed',String(saved));
    mark.addEventListener('click',()=>{
      let ids=bookmarkIds();
      ids=saved?ids.filter(id=>id!==story.id):uniqueStrings(ids.concat(story.id));
      try{localStorage.setItem('pheme.newsBookmarks',JSON.stringify(ids));}catch(_){}
      renderEdition();
    });
    actions.appendChild(mark);
    article.append(section,heading,copy,info,actions);
    return article;
  }
  function addSection(container,title,items) {
    const section=el('section','pheme-evidence-section');
    section.appendChild(el('h3',null,title));
    const vals = uniqueStrings(items);
    if (!vals.length) section.appendChild(el('p','pheme-no-evidence','Nothing established or reported in this section.'));
    vals.forEach(item=>{
      const row=el('div','pheme-evidence-item');
      row.appendChild(el('p',null,asText(item)));
      const sources=Array.isArray(item && item.sources)?item.sources:[];
      sources.forEach(source=>{
        const uri=urlSafe(typeof source==='string'?source:source.url);
        if (!uri) return;
        const a=el('a',null,(source && source.name)||'Source'); a.href=uri;a.target='_blank';a.rel='noopener noreferrer';
        row.appendChild(a);
      });
      section.appendChild(row);
    });
    container.appendChild(section);
  }
  function renderCoverage(container,story) {
    const section=el('section','pheme-evidence-section');
    section.appendChild(el('h3',null,'Political coverage'));
    const groups=new Map();
    story.groups.forEach(g=>{
      if(!g || !(g.id || g.name))return;
      const country=String(g.country || story.countries[0] || '');
      const id=String(g.id || g.name);
      groups.set(country+'::'+id,{country,id,name:String(g.name || g.id)});
    });
    story.coverage.forEach(c=>{
      if(!c || !(c.groupId || c.group))return;
      const country=String(c.country || story.countries[0] || '');
      const id=String(c.groupId || c.group);
      if(!groups.has(country+'::'+id))groups.set(country+'::'+id,{country,id,name:id});
    });
    if(!groups.size)section.appendChild(el('p','pheme-no-evidence','No verified political-group source mapping available.'));
    const wrap=el('div','pheme-coverage-grid');
    groups.forEach(groupInfo=>{
      const group=el('div','pheme-coverage-group');
      group.appendChild(el('h4',null,groupInfo.name+' · '+groupInfo.country));
      LEVELS.forEach(level=>{
        const matched=story.coverage.filter(c=>c && String(c.country||story.countries[0]||'')===groupInfo.country
          && String(c.groupId||c.group)===groupInfo.id && String(c.level).toLowerCase()===level && urlSafe(c.evidenceUrl));
        const urls=uniqueStrings(matched.flatMap(c=>c.sources||[])).map(s=>typeof s==='string'?s:s&&s.url).filter(urlSafe);
        group.appendChild(el('div','pheme-coverage-level',(urls.length?'✓ ':'○ ')+level[0].toUpperCase()+level.slice(1)+' · '+urls.length+' source'+(urls.length===1?'':'s')));
      });
      wrap.appendChild(group);
    });
    section.appendChild(wrap);
    container.appendChild(section);
  }
  function openStory(story) {
    selectedStory=story;
    document.getElementById('dialog-kicker').textContent=story.countries.join(' · ')||'WORLD';
    document.getElementById('dialog-title').textContent=story.title;
    body.replaceChildren();
    if(story.summary)body.appendChild(el('p',null,story.summary));
    const sectionControl=el('div','pheme-story-section-control');
    const sectionLabel=el('label',null,'Newspaper section: ');
    const select=el('select');
    select.setAttribute('aria-label','Assign this story to a newspaper section');
    SECTIONS.forEach(name=>{const option=el('option',null,name);option.value=name;option.selected=name===sectionOf(story);select.appendChild(option);});
    select.addEventListener('change',()=>{sectionAssignments[story.id]=select.value;persistSections();renderEdition();});
    sectionLabel.appendChild(select);sectionControl.appendChild(sectionLabel);body.appendChild(sectionControl);
    if(story.reviewStatus==='unverified-headline-aggregation'){
      body.appendChild(el('p','pheme-review-notice','HEADLINE-LEVEL REPORTING — PHEME has not independently verified these claims. Facts, Doubts and Impacts remain unfilled until supported by evidence.'));
    }
    addSection(body,'Facts',story.facts);
    addSection(body,'Doubts',story.doubts);
    addSection(body,'Unknowns',story.unknowns);
    addSection(body,'Parties',story.parties);
    addSection(body,'Locations',story.locations);
    addSection(body,'Agendas',story.agendas);
    addSection(body,'Impacts',story.impacts);
    renderCoverage(body,story);
    addSection(body,'Source publications',story.publications.map(p=>({text:(p.title||p.name||p.url||'Source'),sources:[{url:p.url,name:'Open original'}]})));
    if(!dialog.open)dialog.showModal();
  }
  function bookmarkIds() {
    try {const v=JSON.parse(localStorage.getItem('pheme.newsBookmarks')); return Array.isArray(v)?v:[];}catch(_){return [];}
  }
  function renderEdition() {
    document.getElementById('bookmark-count').textContent=bookmarkIds().length||'';
    document.getElementById('bookmarks-button').classList.toggle('nav-active',bookmarkOnly);
    grid.replaceChildren();
    const note=document.getElementById('search-empty'); if(note)note.remove();
    ed.textContent='YOUR SELECTED COUNTRIES · ONE EVOLVING ACCOUNT';
    footer.textContent='EVIDENCE FIRST · ORIGINAL SOURCES PRESERVED';
    const active=feed.filter(s=>s.countries.some(c=>selected.has(c)));
    const q=String(search && search.value || '').trim().toLowerCase();
    const filtered=active.filter(s=>enabledSections.has(sectionOf(s))&&(selectedSection==='All'||sectionOf(s)===selectedSection)&&(!bookmarkOnly||bookmarkIds().includes(s.id))&&(!q||[s.title,s.summary,s.countries.join(' '),s.facts.map(asText).join(' ')].join(' ').toLowerCase().includes(q)));
    if(!selected.size) {
      const empty=el('div','pheme-empty-edition');
      empty.appendChild(el('h2',null,'Your edition awaits'));
      empty.appendChild(el('p',null,'No countries are selected. Choose countries in Settings to build your personal newspaper.'));
      const choose=el('button','pheme-empty-button','Choose countries');
      choose.addEventListener('click',()=>document.getElementById('settings-toggle').click());
      empty.appendChild(choose);grid.appendChild(empty); return;
    }
    if(!filtered.length) {
      const empty=el('div','pheme-empty-edition');
      empty.appendChild(el('h2',null,active.length?'No matching reports':'No verified stories available'));
      empty.appendChild(el('p',null,!enabledSections.size?'Every section is hidden. Enable sections in Settings.':active.length?'Adjust the section filter, enabled sections, search or bookmarks.':feedDiagnostics && feedDiagnostics.status==='no-provider-success'?'The sources have not returned new reports. Existing reports will remain available when collected.':'Your selected countries are saved. Reports appear after the scheduled news intake collects articles for those countries. No invented headlines are displayed.'));
      grid.appendChild(empty);return;
    }
    const left=el('aside','story-rail left-rail');
    const center=el('section','lead-column');
    const right=el('aside','story-rail right-rail');
    center.appendChild(storyCard(filtered[0],true));
    filtered.slice(1).forEach((s,i)=>(i%2===0?left:right).appendChild(storyCard(s,false)));
    grid.append(left,center,right);
  }
  window.PHEME_NEWS = {
    ingest(records) { feed=mergeStories(feed.concat(Array.isArray(records)?records:[]));renderEdition();return feed.length; },
    replace(records) { feed=mergeStories(records);renderEdition();return feed.length; },
    getSelectedCountries() {return Array.from(selected);},
    applyFilters(options) {if(options && typeof options.bookmarksOnly==='boolean')bookmarkOnly=options.bookmarksOnly;renderEdition();},
    toggleBookmarks() {bookmarkOnly=!bookmarkOnly;renderEdition();return bookmarkOnly;},
    showAll() {bookmarkOnly=false;selectedSection='All';renderSectionMenu();renderEdition();},
    getEnabledSections() {return [...enabledSections];},
    getCurrentSection() {return selectedSection;},
    getStoryCount() {return feed.length;}
  };
  // The prior cinema mock edition and its navigation are intentionally retired.
  const oldSections=document.getElementById('sections-button');
  const oldArchive=document.getElementById('archive-button');
  if(oldSections)oldSections.hidden=true;
  if(oldArchive)oldArchive.hidden=true;
  const colophon=document.querySelector('.dialog-colophon');
  if(colophon)colophon.textContent='PHEME · EVIDENCE-BASED NEWS · ORIGINAL SOURCES CITED';
  renderCountries('');
  updateCount();
  renderEdition();
  // The feed must be produced by a separate news verification/ingestion system.
  // No backend and no publisher API is represented as connected here.
  fetch('./news/stories.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Feed unavailable');return r.json();})
    .then(data=>{const records=Array.isArray(data)?data:(data && data.events)||[];
      feedUpdatedAt=data && data.updatedAt || null;feedDiagnostics=data && data.diagnostics || null;
      window.PHEME_NEWS.replace(records);})
    .catch(()=>renderEdition());
  const style=el('style');style.textContent="\n.pheme-sections-setting{padding:17px 0;border-top:2px solid #4c3520;}\n.pheme-section-checkboxes{display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;}\n.pheme-section-checkboxes .pheme-country-option{font-size:.7rem;border-bottom:1px solid #76583d50;}\n.pheme-story-section-control{border-bottom:1px solid #76583d;padding:12px 0;margin-bottom:12px;font:700 .75rem var(--font-body);}\n.pheme-story-section-control select{background:#f0dcba;border:1px solid #6b4c31;padding:7px;color:#25160b;max-width:100%;font:inherit;}\n.pheme-review-notice{background:#e6d0a6;border-left:3px solid #60442c;padding:12px;font:.75rem/1.65 var(--font-body)!important;}\n.sections-menu [aria-current=\"page\"]{font-weight:bold;text-decoration:underline;}\n"+"\n.pheme-countries{margin:20px 0 4px;border-top:2px solid #4c3520;padding:17px 0;}\n.pheme-country-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}\n.pheme-country-head h3{font:900 1.35rem var(--font-display);margin:0;}\n.pheme-country-head span{font:.66rem var(--font-body);white-space:nowrap;}\n.pheme-country-search-label{font:700 .69rem var(--font-body);display:block;margin:11px 0 5px;}\n#pheme-country-search{width:100%;border:1px solid #755638;background:#fff3d8;color:#2b1c0d;padding:10px;font:.75rem var(--font-body);}\n.pheme-country-actions{display:flex;gap:9px;margin:9px 0;}\n.pheme-country-actions button,.pheme-empty-button{border:1px solid currentColor;background:transparent;color:inherit;padding:9px 13px;font:700 .69rem var(--font-body);}\n.pheme-country-list{max-height:300px;overflow:auto;border:1px solid #876845;background:#e6d0aa;padding:4px 10px;}\n.pheme-continent{margin:3px 0 6px;border-bottom:1px solid #76583d66;padding:4px 0;}\n.pheme-continent summary{cursor:pointer;font:700 .85rem var(--font-body);padding:9px 3px;}\n.pheme-continent h4{font:700 .65rem var(--font-body);text-transform:uppercase;margin:13px 0 3px;letter-spacing:.05em;}\n.pheme-country-option{font:.75rem var(--font-body);padding:6px 3px;display:flex;align-items:center;gap:8px;cursor:pointer;}\n.pheme-country-option input{accent-color:#2b1c0d;width:16px;height:16px;flex-shrink:0;}\n.pheme-empty-edition{grid-column:1/-1;text-align:center;padding:clamp(65px,14vw,170px) 20px;max-width:650px;margin:auto;}\n.pheme-empty-edition h2{font:900 clamp(2rem,6vw,4rem) var(--font-display);letter-spacing:-.05em;margin:0 0 16px;}\n.pheme-empty-edition p{font:.9rem/1.8 var(--font-body);}\n.pheme-empty-button{font-size:.83rem;margin-top:12px;}\n.pheme-story-card{padding:18px 15px;border-bottom:2px solid var(--line);display:flex;flex-direction:column;gap:12px;min-width:0;}\n.pheme-story-card:last-child{border-bottom:0;}\n.pheme-feature{padding:20px 25px;}\n.pheme-card-copy{font:calc(.83rem * var(--article-scale))/1.75 var(--font-body);text-align:justify;hyphens:auto;}\n.pheme-card-metadata{font:.65rem var(--font-body);letter-spacing:.02em;border-top:1px solid var(--line);padding-top:12px;}\n.pheme-story-card .story-footer{margin-top:auto;}\n.pheme-evidence-section{border-top:1px solid #6d5037;padding-top:16px;margin:20px 0;}\n.pheme-evidence-section h3{font:900 1.3rem var(--font-display);margin:0 0 9px;}\n.pheme-evidence-item{font:.82rem/1.7 var(--font-body);margin-bottom:12px;}\n.pheme-evidence-item p{margin:0 0 5px!important;}\n.pheme-evidence-item a{font-size:.66rem;text-decoration:underline;margin:0 8px 0 0;}\n.pheme-no-evidence{font:.78rem/1.5 var(--font-body);opacity:.7;}\n.pheme-coverage-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px;}\n.pheme-coverage-group{border:1px solid #705032;padding:12px;}\n.pheme-coverage-group h4{font:bold .82rem var(--font-body);margin:0 0 8px;}\n.pheme-coverage-level{font:.74rem/1.7 var(--font-body);text-transform:capitalize;}\n@media(max-width:620px){.pheme-feature{padding:15px 12px;}.pheme-story-card{padding:13px 10px;}.pheme-empty-edition{padding:95px 15px;}}\n";document.head.appendChild(style);
})();
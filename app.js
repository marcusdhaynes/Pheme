/* PHEME — offline-friendly, dependency-free newspaper interactions */
(function () {
  'use strict';
  var $ = function (selector) { return document.querySelector(selector); };
  var $$ = function (selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); };
  var store = {
    get: function (key, fallback) { try { var value = localStorage.getItem('pheme.' + key); return value === null ? fallback : JSON.parse(value); } catch (e) { return fallback; } },
    set: function (key, value) { try { localStorage.setItem('pheme.' + key, JSON.stringify(value)); } catch (e) {} }
  };

  var stories = {
    '01': {
      title: 'The Magic Lives On',
      paragraphs: [
        'It was observed on Wednesday evening that a most extraordinary number of respectable citizens had assembled outside the Old Royal Picture House to see a motion picture containing neither a spoken sentence nor a single fashionable automobile. The crowd was undeterred. Indeed, several spectators appeared considerably relieved.',
        'Miss Elena Marlowe, curator of the celebrated Silent Film Cabinet, declared that silence had at last returned to its proper place in public entertainment. “The faces do the talking,” she explained, “and, in this case, the eyebrows do most of the shouting.”',
        'The audience rose to applaud a daring sequence in which the leading man mislaid his hat, discovered another hat, and subsequently discovered that the second hat belonged to a rather severe gentleman. Three members of the public requested an encore for the hat.',
        'The management promises an entire season of moving-picture marvels, accompanied by a pianist, two violinists, and a sign requesting that patrons kindly refrain from explaining the plot.'
      ]
    },
    '02': {
      title: 'A Brighter World on the Big Screen',
      paragraphs: [
        'The grand Rivoli Theatre threw wide its gilded doors this week, and all the city seemed to have arranged to arrive at precisely the same moment. Motorcars stood in orderly confusion, gentlemen adjusted their collars, and no fewer than nineteen people argued amicably over the correct way to queue for a programme.',
        'With its glittering marquee and magnificent orchestra pit, the new picture palace promises every comfort of the modern age, including upholstered chairs, a handsome clock, and a notably ambitious selection of refreshments. The manager insists that an entire afternoon may be spent inside without once consulting the weather.',
        '“The moving picture permits us all to dream in a single room,” announced its director, Miss Clara Bennett. “The chief miracle is that nobody need agree about the dream afterward.” Her remarks were received with unusual enthusiasm by a gentleman who claimed to have misunderstood the preceding film entirely.',
        'Opening night featured a spectacular adventure in which an earnest inventor builds a machine capable of projecting tomorrow upon a wall. Critics praised the scenery, questioned the machine, and unanimously approved the intermission.',
        'Further exhibitions shall include foreign pictures, forgotten comedies, and a documentary devoted to the extraordinary social life of an ordinary umbrella. All accounts in this inaugural paper are whimsical placeholder stories, not actual news.'
      ]
    },
    '03': {
      title: 'Stars, Stories & Second Acts',
      paragraphs: [
        'Miss Clara Vance, whose expressions have stirred the hearts of theatre-goers for a remarkable number of years, has resolved to exchange her place before the camera for a more commanding position just behind it.',
        'At the first morning rehearsal she asked for absolute quiet, then remembered that the production was a talking picture. A second request, this time for relative quiet, was much more successful.',
        'Her forthcoming film concerns an unlikely friendship between a retired illusionist, a young cartographer, and a clock that refuses to agree with the other clocks in town. The screenplay is said to contain seven extraordinary coincidences and one entirely ordinary sandwich.',
        'When asked whether the director’s chair was a comfortable one, Miss Vance replied, “I have not yet sat in it. There is altogether too much directing to be done.”'
      ]
    },
    '04': {
      title: 'Reel Curiosities',
      paragraphs: [
        'A committee of cinematic historians has renewed the ancient dispute over whether the moon can legitimately be considered a motion-picture performer. The celestial body has appeared in countless pictures and, according to some authorities, has never been heard to complain.',
        'One archivist has gone so far as to demand that the moon receive a star upon the famous boulevard, although the logistics of inviting it to a dedication ceremony are said to be considerable.',
        'Among other curiosities is the discovery of a film reel labeled “THE END” which, when played, proved to contain only a beginning. The remainder of the picture may, it is suggested, have gone to lunch.',
        'Readers possessing any knowledge of misplaced endings, disappearing top hats, or unusually photogenic planets are requested to send a letter to the editorial office.'
      ]
    },
    '05': {
      title: 'Cinema Around the World',
      paragraphs: [
        'Reports reaching our offices from far-flung towns suggest that the picture house has become an institution of universal importance. Beneath desert stars, upon snowy mountains, and beside the busiest harbours, audiences gather to follow strangers through extraordinary adventures.',
        'In one tiny village a travelling projectionist was persuaded to show a comedy three times in succession. On the third occasion the entire audience recited the dialogue, although the film itself was silent.',
        'A mountain festival claims to have the finest view from any cinema in the world, owing principally to the fact that the rear wall has not yet been constructed.',
        'Across the globe one principle seems to unite all admirers of moving pictures: the best seat in the house was reserved by somebody else.'
      ]
    },
    '06': {
      title: 'The Talkies Are Talking Again',
      paragraphs: [
        'Sound engineers have announced a great step forward in the science of recorded speech: a microphone so sensitive that it has captured a whispered complaint concerning the quality of the studio biscuits.',
        'The recording is to be preserved in the archives as a testament to mankind’s determination to make itself heard. The biscuits have declined to comment.',
        'One eminent critic has proposed that every talking picture ought to include a moment of silence, if only to give the audience an opportunity to remember how quiet a theatre once was.'
      ]
    },
    '07': {
      title: 'The Great Popcorn Question',
      paragraphs: [
        'The Annual Society of Cinematic Refreshments met last evening to settle the vexed question of whether a motion picture can begin before the last kernel of corn has finished popping.',
        'Arguments were presented on both sides. A professor of mathematics produced a formidable chart. A confectioner presented a very large bowl. The bowl proved considerably more persuasive.',
        'Proceedings concluded with a unanimous resolution that every good story deserves an attentive audience, and every attentive audience deserves a respectable interval for refreshments.'
      ]
    }
  };

  var reader = $('#reader-dialog');
  var archive = $('#archive-dialog');
  var settings = $('#settings-panel');
  var scrim = $('#scrim');
  var search = $('#search-bar');
  var searchInput = $('#search-input');
  var sectionMenu = $('#sections-menu');
  var nav = $('#main-nav');
  var activeBookmarksOnly = false;
  var bookmarks = store.get('bookmarks', []);
  if (!Array.isArray(bookmarks)) bookmarks = [];
  var toastTimeout = 0;

  function toast(message) {
    var target = $('#toast');
    target.textContent = message;
    target.classList.add('show');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(function () { target.classList.remove('show'); }, 2500);
  }

  function paperName(name) {
    return {newsprint:'Newsprint',parchment:'Parchment',rag:'Rag Paper',linen:'Linen',recycled:'Recycled Stock'}[name] || 'Newsprint';
  }

  function setPaper(name, notify) {
    if (!['newsprint','parchment','rag','linen','recycled'].includes(name)) name = 'newsprint';
    document.body.setAttribute('data-paper', name);
    var input = $('input[name="paper"][value="' + name + '"]');
    if (input) input.checked = true;
    store.set('paper', name);
    if (notify) toast('Printed on ' + paperName(name));
  }

  function setFontSize(value) {
    var n = Math.max(90, Math.min(125, Number(value) || 100));
    document.documentElement.style.setProperty('--article-scale', String(n / 100));
    $('#font-range').value = String(n);
    $('#font-output').textContent = n + '%';
    store.set('fontSize', n);
  }

  function setInk(value) {
    var n = Math.max(70, Math.min(100, Number(value) || 100));
    document.documentElement.style.setProperty('--ink-strength', String(.7 + (n / 100) * .3));
    $('#ink-range').value = String(n);
    $('#ink-output').textContent = n + '%';
    store.set('ink', n);
  }

  function toggleSettings(force) {
    var open = typeof force === 'boolean' ? force : !settings.classList.contains('is-open');
    settings.classList.toggle('is-open', open);
    settings.setAttribute('aria-hidden', String(!open));
    settings.inert = !open;
    $('#settings-toggle').setAttribute('aria-expanded', String(open));
    scrim.hidden = !open;
    if (open) { hideSections(); hideNav(); $('#settings-close').focus(); }
  }

  function hideSections() {
    sectionMenu.hidden = true;
    $('#sections-button').setAttribute('aria-expanded', 'false');
  }

  function hideNav() {
    nav.classList.remove('mobile-open');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
  }

  function toggleSearch(force) {
    var open = typeof force === 'boolean' ? force : search.hidden;
    search.hidden = !open;
    $('#search-toggle').setAttribute('aria-expanded', String(open));
    if (open) { hideSections(); hideNav(); searchInput.focus(); }
    else { searchInput.value = ''; applyFilters(); }
  }

  function setBookmarksUI() {
    $$('.bookmark-button').forEach(function (button) {
      var saved = bookmarks.includes(button.dataset.bookmark);
      button.classList.toggle('saved', saved);
      button.textContent = saved ? '★' : '☆';
      button.setAttribute('aria-label', (saved ? 'Remove bookmark for' : 'Bookmark') + ' Section ' + button.dataset.bookmark);
      button.setAttribute('aria-pressed', String(saved));
    });
    $('#bookmark-count').textContent = bookmarks.length ? String(bookmarks.length) : '';
  }

  function applyFilters() {
    if (window.PHEME_NEWS) { window.PHEME_NEWS.applyFilters(); return; }
    var q = searchInput.value.trim().toLowerCase();
    var count = 0;
    $$('[data-story]').forEach(function (card) {
      var id = card.dataset.story;
      var s = stories[id];
      var searchable = (card.textContent + ' ' + s.title + ' ' + s.paragraphs.join(' ')).toLowerCase();
      var show = (!activeBookmarksOnly || bookmarks.includes(id)) && (!q || searchable.includes(q));
      card.classList.toggle('search-hidden', !show);
      if (show) count++;
    });
    var existing = $('#search-empty');
    if (existing) existing.remove();
    if (!count) {
      var note = document.createElement('p');
      note.id = 'search-empty';
      note.className = 'search-empty';
      note.textContent = activeBookmarksOnly ? 'No saved stories match your search.' : 'No stories match your search.';
      $('.edition-grid').after(note);
    }
  }

  function openStory(id) {
    var s = stories[id];
    if (!s) return;
    $('#dialog-kicker').textContent = 'SECTION ' + id;
    $('#dialog-title').textContent = s.title;
    var text = $('#dialog-body');
    text.replaceChildren();
    s.paragraphs.forEach(function (paragraph) {
      var p = document.createElement('p');
      p.textContent = paragraph;
      text.appendChild(p);
    });
    reader.showModal();
  }

  $$('[data-open]').forEach(function (button) { button.addEventListener('click', function () { openStory(button.dataset.open); }); });
  $$('[data-bookmark]').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.dataset.bookmark;
      if (bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(function (x) { return x !== id; });
        toast('Section ' + id + ' removed from bookmarks');
      } else {
        bookmarks.push(id);
        toast('Section ' + id + ' saved');
      }
      store.set('bookmarks', bookmarks);
      setBookmarksUI();
      applyFilters();
    });
  });
  $('#dialog-close').addEventListener('click', function () { reader.close(); });
  $$('[data-close-dialog]').forEach(function (button) { button.addEventListener('click', function () { document.getElementById(button.dataset.closeDialog).close(); }); });
  [reader,archive].forEach(function (dialog) {
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  });
  $('#archive-button').addEventListener('click', function () { hideNav(); archive.showModal(); });
  $('#archive-open').addEventListener('click', function () { archive.close(); window.scrollTo({top:0,behavior:'smooth'}); });
  $('#sections-button').addEventListener('click', function () {
    var open = sectionMenu.hidden;
    sectionMenu.hidden = !open;
    $('#sections-button').setAttribute('aria-expanded', String(open));
    if (open) hideNav();
  });
  $$('.sections-menu a').forEach(function (link) { link.addEventListener('click', function () { hideSections(); }); });
  $('#menu-toggle').addEventListener('click', function () {
    var open = nav.classList.toggle('mobile-open');
    $('#menu-toggle').setAttribute('aria-expanded', String(open));
  });
  $('#today-link').addEventListener('click', function () {
    if (window.PHEME_NEWS) window.PHEME_NEWS.showAll();
    activeBookmarksOnly = false;
    applyFilters();
    hideNav();
  });
  $('#bookmarks-button').addEventListener('click', function () {
    hideNav();
    if (window.PHEME_NEWS) { window.PHEME_NEWS.toggleBookmarks(); return; }
    if (!bookmarks.length && !activeBookmarksOnly) { toast('Bookmark a story to save it here.'); return; }
    activeBookmarksOnly = !activeBookmarksOnly;
    $('#bookmarks-button').classList.toggle('nav-active', activeBookmarksOnly);
    if (activeBookmarksOnly) window.scrollTo({top:0,behavior:'smooth'});
    applyFilters();
    toast(activeBookmarksOnly ? 'Showing your saved stories' : 'Showing the complete edition');
  });
  $('#search-toggle').addEventListener('click', function () { toggleSearch(); });
  $('#search-close').addEventListener('click', function () { toggleSearch(false); });
  searchInput.addEventListener('input', applyFilters);
  $('#print-button').addEventListener('click', function () { window.print(); });
  $('#settings-toggle').addEventListener('click', function () { toggleSettings(); });
  $('#settings-close').addEventListener('click', function () { toggleSettings(false); });
  scrim.addEventListener('click', function () { toggleSettings(false); });
  $$('input[name="paper"]').forEach(function (input) { input.addEventListener('change', function () { if (input.checked) setPaper(input.value,true); }); });
  $('#font-range').addEventListener('input', function (event) { setFontSize(event.target.value); });
  $('#ink-range').addEventListener('input', function (event) { setInk(event.target.value); });
  $('#reset-settings').addEventListener('click', function () {
    setPaper('newsprint', false);
    setFontSize(100);
    setInk(100);
    toast('Traditional newsprint settings restored');
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { toggleSettings(false);hideSections();hideNav();if (!search.hidden) toggleSearch(false); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault();toggleSearch(true); }
  });

  var editionDate = new Date();
  var dateLabel = $('#date-label');
  dateLabel.textContent = new Intl.DateTimeFormat('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(editionDate).toUpperCase();
  dateLabel.setAttribute('datetime',editionDate.toISOString().slice(0,10));
  setPaper(store.get('paper','newsprint'), false);
  setFontSize(store.get('fontSize',100));
  setInk(store.get('ink',100));
  setBookmarksUI();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js', {scope:'./'}).catch(function () {/* Online app remains fully functional. */});
    });
  }
})();
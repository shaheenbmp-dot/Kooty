/* Kooty prototype interactions.
   Each screen sets <body data-page="…">; only that screen's handler runs.
   The HTML already contains the starting state, so every screen still reads
   correctly with JavaScript turned off. */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var pages = {};

  /* Reminder calendar: category filter + tap a day to see its reminders */
  pages.calendar = function () {
    var TODAY = 19;
    var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var dow = function (d) { return DOW[(3 + d) % 7]; }; // 1 Oct 2026 is a Thursday
    var cat = 'all';
    var sel = null;
    var chips = $$('.chip[data-cat]');
    var days = $$('.cal-day[data-day]');
    var items = $$('[data-agenda] > li');
    var title = $('[data-agenda-title]');
    var empty = $('[data-agenda-empty]');

    function render() {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.cat === cat)); });
      $$('.cal-day .dot').forEach(function (dot) { dot.hidden = !(cat === 'all' || dot.dataset.cat === cat); });
      days.forEach(function (d) { d.setAttribute('aria-pressed', String(Number(d.dataset.day) === sel)); });
      var shown = 0;
      items.forEach(function (li) {
        var d = Number(li.dataset.day);
        var show = (cat === 'all' || li.dataset.cat === cat) && (sel ? d === sel : d >= TODAY) && shown < 4;
        li.hidden = !show;
        if (show) shown++;
      });
      title.textContent = sel ? dow(sel) + ' ' + sel + ' October' : 'Coming up';
      empty.hidden = shown > 0;
    }

    chips.forEach(function (c) { c.addEventListener('click', function () { cat = c.dataset.cat; render(); }); });
    days.forEach(function (d) {
      d.addEventListener('click', function () {
        var n = Number(d.dataset.day);
        sel = sel === n ? null : n;
        render();
      });
    });
  };

  /* Gas tracker: auto-book switch */
  pages.gas = function () {
    var sw = $('[data-auto-switch]');
    sw.addEventListener('click', function () {
      var on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(on));
      $('[data-auto-on]').hidden = !on;
      $('[data-auto-off]').hidden = on;
    });
  };

  /* AI booking call: steps advance on their own, then show the result */
  pages['gas-call'] = function () {
    var doneLabels = ['Dialled your distributor', 'Shared consumer no. •••• 4412', 'Delivery date: Thu 22 Oct', 'Booking confirmed'];
    var steps = $$('[data-steps] > li');
    var step = 2;

    function render() {
      steps.forEach(function (li, i) {
        var state = i < step ? 'done' : (i === step ? 'current' : 'waiting');
        li.dataset.state = state;
        if (state === 'done') $('[data-step-label]', li).textContent = doneLabels[i];
        $('[data-step-sr]', li).textContent = ', ' + (state === 'done' ? 'done' : state === 'current' ? 'in progress' : 'waiting');
      });
      var finished = step >= 4;
      $('[data-call-reply]').hidden = step < 3;
      $('[data-call-actions]').hidden = finished;
      $('[data-call-done]').hidden = !finished;
      $('[data-call-status]').dataset.done = String(finished);
      $('[data-call-status-text]').textContent = finished
        ? 'Booked · call ended after 1:05'
        : (step === 3 ? 'Connected · 0:58' : 'Connected · 0:42');
    }

    var timer = setInterval(function () {
      step++;
      render();
      if (step >= 4) clearInterval(timer);
    }, 2800);
  };

  /* Services: category + filter chips narrow the list of pros */
  pages.services = function () {
    var cat = 'elec';
    var f = { licensed: true, top: false, today: false, near: false };
    var cats = $$('.cat[data-cat]');
    var chips = $$('.chip[data-filter]');
    var pros = $$('.pro[data-cat]');
    var title = $('[data-pros-title]');
    var count = $('[data-pros-count]');
    var note = $('[data-licence-note]');
    var empty = $('[data-pros-empty]');

    function render() {
      var current = cats.filter(function (c) { return c.dataset.cat === cat; })[0];
      var needsLicence = current.dataset.licence === 'true';
      cats.forEach(function (c) { c.setAttribute('aria-pressed', String(c === current)); });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(!!f[c.dataset.filter])); });
      var n = 0;
      pros.forEach(function (p) {
        var ok = p.dataset.cat === cat;
        if (ok && f.licensed && needsLicence && p.dataset.licensed !== 'true') ok = false;
        if (ok && f.top && Number(p.dataset.rating) < 4.7) ok = false;
        if (ok && f.today && p.dataset.today !== 'true') ok = false;
        if (ok && f.near && Number(p.dataset.km) >= 2) ok = false;
        p.hidden = !ok;
        if (ok) n++;
      });
      title.textContent = current.dataset.plural + ' near you';
      count.textContent = n + (n === 1 ? ' pro' : ' pros');
      note.textContent = current.dataset.plural + " don't usually hold a government licence, so we show pros whose ID and skills Kooty has checked.";
      note.hidden = !(f.licensed && !needsLicence);
      empty.hidden = n > 0;
    }

    cats.forEach(function (c) { c.addEventListener('click', function () { cat = c.dataset.cat; render(); }); });
    chips.forEach(function (c) {
      c.addEventListener('click', function () { f[c.dataset.filter] = !f[c.dataset.filter]; render(); });
    });
  };

  /* Pro profile: the Book button names the chosen slot */
  pages.pro = function () {
    var cta = $('[data-book-cta]');
    $$('input[name="slot"]').forEach(function (r) {
      r.addEventListener('change', function () {
        cta.textContent = 'Book ' + r.dataset.day.toLowerCase() + ', ' + r.dataset.time;
      });
    });
  };

  /* Home: grocery count and the "I'm at the store" ping */
  pages.home = function () {
    var boxes = $$('[data-grocery] input[type="checkbox"]');
    var left = $('[data-left]');
    boxes.forEach(function (b) {
      b.addEventListener('change', function () {
        var n = boxes.filter(function (x) { return !x.checked; }).length;
        left.textContent = n === 0 ? 'All done' : n + ' left';
      });
    });
    var store = $('[data-store]');
    var label = $('[data-store-label]');
    store.addEventListener('click', function () {
      var on = store.getAttribute('aria-pressed') !== 'true';
      store.setAttribute('aria-pressed', String(on));
      label.textContent = on ? 'Family notified. Add items now' : "I'm at the store";
    });
  };

  /* Groups: RSVP updates the player count; food vote updates the bars */
  pages.groups = function () {
    var me = $('[data-me]');
    var count = $('[data-count]');
    var need = $('[data-need]');
    var bar = $('[data-count-bar]');
    $$('input[name="rsvp"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var n = 6 + (r.value === 'in' ? 1 : 0);
        me.hidden = r.value !== 'in';
        count.textContent = n + ' of 10 in';
        need.textContent = 'Need ' + (10 - n) + ' more';
        bar.setAttribute('aria-label', n + ' of 10 players confirmed');
        $('.progress__bar', bar).style.width = n * 10 + '%';
      });
    });
    var votes = $$('input[name="food"]');
    votes.forEach(function (v) {
      v.addEventListener('change', function () {
        var counts = votes.map(function (x) { return Number(x.dataset.base) + (x.checked ? 1 : 0); });
        var max = Math.max.apply(null, counts);
        votes.forEach(function (x, i) {
          var box = x.nextElementSibling;
          $('.vote__fill', box).style.width = Math.round(counts[i] / max * 100) + '%';
          $('.vote__count', box).textContent = counts[i] + ' votes';
        });
      });
    });
  };

  /* Vault: tabs (click or arrow keys) */
  pages.vault = function () {
    var tabs = $$('[role="tab"]');
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        select(next, true);
      });
    });
  };

  var run = pages[document.body.dataset.page];
  if (run) run();
})();

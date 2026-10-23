(function(){
  var section = document.getElementById('journey');
  if (!section) return;

  var slotA    = document.getElementById('jrnMsA');
  var slotB    = document.getElementById('jrnMsB');
  var panel    = document.getElementById('jrnPanel');
  var panelBody= document.querySelector('.jrn-panel__body');
  var rail     = document.getElementById('jrnRail');
  var railHead = document.getElementById('jrnRailHead');
  var railFill = document.getElementById('jrnRailFill');
  var yearEl   = document.getElementById('jrnYear');
  var binEl    = document.getElementById('jrnBin');
  var entryEl  = document.getElementById('jrnEntry');
  var logEl    = document.getElementById('jrnLog');
  var countEl  = document.getElementById('jrnCount');
  var fillEl   = document.getElementById('jrnFill');
  var markEl   = document.getElementById('jrnMark');

  if (!slotA || !slotB || !panelBody) return;

  /* ── Chronicle data ─────────────────────────────────────────── */
  var ITEMS = [
    {date:'2023 · AUG',     tag:'Origin',      title:'The Beginning',                                     desc:'First line of code. Curiosity turned obsession & hunger.'},
    {date:'2024 · JAN',     tag:'Learning',    title:'Dived into Security Engineering & Intelligent Automation', desc:'Cloud security, agentic security & RPA. The rabbit hole had no bottom.'},
    {date:'2025 · MAR',     tag:'CTF',         title:'Pentathon 2025 Finale',                             desc:'National level cybersecurity competition finalist.'},
    {date:'2025 · APR',     tag:'Ranking',     title:'TryHackMe Top 1%',                                  desc:'Global ranking. Among the elite on the platform.'},
    {date:'2025 · MAY',     tag:'Recognition', title:'TryHackMe Wall of Fame',                            desc:'Officially recognised. Name on the board.'},
    {date:'2025 · JUN–AUG', tag:'Internship',  title:'Cyber Crime Internship',                            desc:'Real-world threat analysis and forensic investigation.'},
    {date:'2025 · AUG',     tag:'Recognition', title:'Latvia Govt. Letter of Appreciation',               desc:'Secured Latvijas Banka. Recognised by a sovereign government.'},
    {date:'2025 · AUG',     tag:'CTF',         title:'UST GenCys CTF — Special Winner',                   desc:'International CTF. Stood out among top teams.'},
    {date:'2025 · DEC',     tag:'CTF',         title:'Yukti CTF Finale — Top Finisher',                   desc:'Consistent. Relentless. Always in the final round.'},
    {date:'2026 · JAN',     tag:'CTF',         title:'IITM ISEA ISAP CTF — Top Finisher',                 desc:'IIT Madras. Top 5 teams.'},
    {date:'2026 · JAN',     tag:'Internship',  title:'Crepsilon Technologies Intern',                     desc:'Developing a Sales Agent and working as a Web Developer.'},
    {date:'2026 · FEB',     tag:'Training',    title:'RPA Trainer — 180+ Students',                       desc:'Taught automation to a generation of engineers.'},
    {date:'2026 · MAR',     tag:'Summit',      title:'Dx-Edge @ CII Southern Zone Summit',                desc:'Represented at a national industry summit.'},
    {date:'2026 · APR',     tag:'Recognition', title:'UiPath Student Developer Champion',                 desc:'Global recognition. Top student developer of UiPath.'}
  ];
  var N = ITEMS.length;

  function pad(n){ return (n < 10 ? '0' : '') + n; }

  function renderHTML(item, i){
    return '<span class="jrn-num" aria-hidden="true">' + pad(i + 1) + '</span>' +
           '<p class="jrn-meta">' +
             '<span class="jrn-date">' + item.date + '</span>' +
             '<span class="jrn-tag">' + item.tag + '</span>' +
             '<span class="jrn-rule"></span>' +
           '</p>' +
           '<h3 class="jrn-title">' + item.title + '</h3>' +
           '<p class="jrn-desc">' + item.desc + '</p>';
  }

  function randomBinary(){
    var s = '';
    for (var i = 0; i < 6; i++) {
      for (var j = 0; j < 8; j++) s += Math.random() < .5 ? '0' : '1';
      if (i < 5) s += ' ';
    }
    return s;
  }

  var staticMode = window.matchMedia('(prefers-reduced-motion:reduce)').matches ||
                   window.innerWidth < 768;

  /* ── Static chronicle: mobile / reduced motion ──────────────── */
  if (staticMode) {
    panelBody.innerHTML = '';
    ITEMS.forEach(function(item, i){
      var d = document.createElement('div');
      d.className = 'jrn-slot is-static';
      d.innerHTML = renderHTML(item, i);
      panelBody.appendChild(d);
    });
    panel.classList.add('is-static');
    if (entryEl) entryEl.textContent = 'Chronicle / ' + N + ' entries';
    if (logEl)   logEl.textContent   = 'log:0x00';
    return;
  }

  /* ── Build the timeline rail ────────────────────────────────── */
  var ticks = [];
  for (var t = 0; t < N; t++) {
    var tickEl = document.createElement('span');
    tickEl.className = 'jrn-tick';
    if (t === 0 || ITEMS[t].date.slice(0, 4) !== ITEMS[t - 1].date.slice(0, 4)) {
      tickEl.className += ' is-year';
    }
    tickEl.style.top = (N === 1 ? 50 : (t / (N - 1)) * 100) + '%';
    rail.appendChild(tickEl);
    ticks.push(tickEl);
  }

  /* ── Panel state ────────────────────────────────────────────── */
  var activeSlot = slotA;
  var idleSlot   = slotB;
  var curIdx     = 0;
  var pendingIdx = null;
  var animating  = false;

  /* Screen-reader chronicle: the visual slots are decorative. */
  var srList = document.createElement('div');
  srList.className = 'u-sr-only';
  srList.innerHTML = '<h3>Milestones</h3><ol>' +
    ITEMS.map(function(item){
      return '<li>' + item.date + ' — ' + item.title + '. ' + item.desc + '</li>';
    }).join('') + '</ol>';
  if (panel) panel.appendChild(srList);

  function paintUI(idx){
    var item = ITEMS[idx];

    if (entryEl) entryEl.textContent = 'Entry ' + pad(idx + 1) + ' / ' + N;
    if (logEl)   logEl.textContent   = 'log:0x' + pad(idx + 1);
    if (countEl) countEl.textContent = pad(idx + 1);

    var year = item.date.slice(0, 4);
    if (yearEl && yearEl.textContent !== year) {
      yearEl.textContent = year;
      yearEl.classList.remove('is-flip');
      void yearEl.offsetWidth;
      yearEl.classList.add('is-flip');
    }

    for (var i = 0; i < ticks.length; i++) {
      ticks[i].classList.toggle('is-past', i < idx);
      ticks[i].classList.toggle('is-active', i === idx);
    }
    if (railHead) railHead.style.top = (N === 1 ? 50 : (idx / (N - 1)) * 100) + '%';
    if (railFill) railFill.style.height = (N === 1 ? 100 : (idx / (N - 1)) * 100) + '%';

    if (panel) panel.classList.toggle('is-end', idx === N - 1);
    if (binEl) binEl.textContent = randomBinary();
  }

  function swapTo(idx){
    if (idx === curIdx) return;
    if (animating) { pendingIdx = idx; return; }

    animating  = true;
    pendingIdx = null;
    curIdx     = idx;

    idleSlot.innerHTML = renderHTML(ITEMS[idx], idx);
    idleSlot.className = 'jrn-slot is-entering';
    activeSlot.className = 'jrn-slot is-exiting';

    panel.classList.remove('is-swapping');
    void panel.offsetWidth;
    panel.classList.add('is-swapping');

    var exiting = activeSlot;

    function done(ev){
      if (ev && ev.target !== exiting) return;
      exiting.removeEventListener('animationend', done);
      exiting.className = 'jrn-slot';
      idleSlot.className = 'jrn-slot is-active';

      var tmp = activeSlot;
      activeSlot = idleSlot;
      idleSlot = tmp;

      animating = false;
      if (pendingIdx !== null && pendingIdx !== curIdx) swapTo(pendingIdx);
    }

    exiting.addEventListener('animationend', done);
    /* safety net in case the animation never reports back */
    setTimeout(function(){
      if (animating && curIdx === idx) done(null);
    }, 900);

    paintUI(idx);
  }

  /* ── Scroll → progress ──────────────────────────────────────── */
  function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

  function progress(){
    var r = section.getBoundingClientRect();
    var span = section.offsetHeight - window.innerHeight;
    return clamp01(-r.top / (span || 1));
  }

  function update(){
    var p = progress();

    if (fillEl) fillEl.style.width = (p * 100) + '%';
    if (markEl) markEl.style.left  = (p * 100) + '%';

    var idx = Math.min(N - 1, Math.floor(p * N));
    swapTo(idx);
  }

  /* Seed the first entry before the observer starts. */
  activeSlot.innerHTML = renderHTML(ITEMS[0], 0);
  activeSlot.className = 'jrn-slot is-active';
  paintUI(0);

  /* Frame loop only while the section is on screen. */
  var ticking = false;
  function frame(){
    update();
    if (ticking) requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries){
      var visible = entries[0].isIntersecting;
      if (visible && !ticking) { ticking = true; frame(); }
      else if (!visible) { ticking = false; }
    }, { rootMargin: '300px 0px' }).observe(section);
  } else {
    ticking = true;
    frame();
  }
})();

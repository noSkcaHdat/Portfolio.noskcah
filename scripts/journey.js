(function(){
  var section  = document.getElementById('journey');
  var portrait = document.getElementById('jrnPortrait');
  var card     = document.getElementById('jrnCard');
  var slotA    = document.getElementById('jrnMsA');
  var slotB    = document.getElementById('jrnMsB');
  var teaser   = document.getElementById('jrnTeaser');
  var sticky   = document.getElementById('jrnSticky');
  var strikeCooldown = false;
  var lockUntil = 0; /* timestamp until which forward scroll is held */

  /* ── Scroll lock: prevent scrolling past section during shockwave ─ */
  window.addEventListener('wheel', function(e){
    if(Date.now() < lockUntil && e.deltaY > 0) e.preventDefault();
  }, {passive:false});
  var _ty = 0;
  window.addEventListener('touchstart', function(e){_ty = e.touches[0].clientY;}, {passive:true});
  window.addEventListener('touchmove', function(e){
    if(Date.now() < lockUntil && (e.touches[0].clientY - _ty) < 0) e.preventDefault();
  }, {passive:false});

  function triggerShockwave(){
    if(strikeCooldown) return;
    strikeCooldown = true;
    /* hold scroll for 2.7s — shockwave (1.8s) + teaser glow-up (.9s) */
    lockUntil = Date.now() + 2700;
    sticky.classList.remove('is-striking');
    void sticky.offsetWidth; /* force reflow so animation restarts cleanly */
    sticky.classList.add('is-striking');
    setTimeout(function(){
      sticky.classList.remove('is-striking');
      strikeCooldown = false;
    }, 2200);
  }

  /* ── Milestone data ─────────────────────────────────────────────── */
  var ITEMS = [
    {date:'2023 · AUG',     title:'The Beginning',                                     desc:'First line of code. Curiosity turned obsession & hunger.'},
    {date:'2024 · JAN',     title:'Dived into Security Engineering & Intelligent Automation', desc:'Cloudsecurity, Agentic security & RPA. The rabbit hole had no bottom.'},
    {date:'2025 · MAR',     title:'Pentathon 2025 Finale',                             desc:'National level cybersecurity competition finalist.'},
    {date:'2025 · APR',     title:'TryHackMe Top 1%',                                  desc:'Global ranking. Among the elite on the platform.'},
    {date:'2025 · MAY',     title:'TryHackMe Wall of Fame',                            desc:'Officially recognised. Name on the board.'},
    {date:'2025 · JUN–AUG', title:'Cyber Crime Internship',                            desc:'Real-world threat analysis and forensic investigation.'},
    {date:'2025 · AUG',     title:'Latvia Govt. Letter of Appreciation',               desc:'Secured Latvijas Banka. Recognised by a sovereign government.'},
    {date:'2025 · AUG',     title:'UST GenCys CTF — Special Winner',                   desc:'International CTF. Stood out among Top teams.'},
    {date:'2025 · DEC',     title:'Yukti CTF Finale — Top Finisher',                   desc:'Consistent. Relentless. Always in the final round.'},
    {date:'2026 · JAN',     title:'IITM ISEA ISAP CTF — Top Finisher',                 desc:'IIT Madras. Top 5 teams.'},
    {date:'2026 · JAN',     title:'Crepsilon Technologies Intern',                     desc:'Developing Sales Agent and Web Developer'},
    {date:'2026 · FEB',     title:'RPA Trainer — 180+ Students',                       desc:'Taught automation to a generation of engineers.'},
    {date:'2026 · MAR',     title:'Dx-Edge @ CII Southern Zone Summit',                desc:'Represented at a national industry summit.'},
    {date:'2026 · APR',     title:'UiPath Student Developer Champion',                 desc:'Global recognition. Top student developer of UiPath.'}
  ];
  var N = ITEMS.length;

  function renderHTML(item) {
    return '<div class="jrn-ms-date">' + item.date + '</div>' +
           '<div class="jrn-ms-rule"></div>' +
           '<div class="jrn-ms-title">' + item.title + '</div>' +
           '<div class="jrn-ms-desc">'  + item.desc  + '</div>';
  }

  /* Seed first item before any scroll or early-return */
  slotA.innerHTML = renderHTML(ITEMS[0]);

  /* Mobile / reduced-motion: build static list, skip scroll JS */
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches ||
      window.innerWidth < 768) {
    var wrap = document.querySelector('.jrn-ms-wrap');
    wrap.innerHTML = '';
    ITEMS.forEach(function(it) {
      var div = document.createElement('div');
      div.className = 'jrn-ms active';
      div.innerHTML = renderHTML(it);
      wrap.appendChild(div);
    });
    return;
  }

  /* ── A/B slot swap ─────────────────────────────────────────── */
  var activeSlot   = slotA;
  var inactiveSlot = slotB;
  var curIdx       = 0;
  var pendingIdx   = null;
  var animating    = false;

  function swapTo(idx) {
    if (idx === curIdx) return;
    if (animating) { pendingIdx = idx; return; }

    animating  = true;
    pendingIdx = null;
    curIdx     = idx;

    inactiveSlot.innerHTML  = renderHTML(ITEMS[idx]);
    inactiveSlot.className  = 'jrn-ms entering';
    activeSlot.className    = 'jrn-ms exiting';

    var exiting = activeSlot;
    function done(ev) {
      if (ev.target !== exiting) return;
      exiting.removeEventListener('animationend', done);
      exiting.className      = 'jrn-ms idle';
      inactiveSlot.className = 'jrn-ms active';
      var tmp    = activeSlot;
      activeSlot = inactiveSlot;
      inactiveSlot = tmp;
      animating = false;
      teaser.classList.toggle('is-visible', curIdx === N - 1);
      if(curIdx === N - 1) triggerShockwave();
      if (pendingIdx !== null && pendingIdx !== curIdx) swapTo(pendingIdx);
    }
    exiting.addEventListener('animationend', done);
  }

  /* ── Scroll helpers ────────────────────────────────────────── */
  function clamp(v,lo,hi){return v<lo?lo:v>hi?hi:v;}
  function mapRange(v,a,b,c,d){return c+(d-c)*clamp((v-a)/(b-a),0,1);}
  function eio(t){return t<.5?2*t*t:-1+(4-2*t)*t;}

  function getP(){
    var rect = section.getBoundingClientRect();
    return clamp(-rect.top/(section.offsetHeight-window.innerHeight),0,1);
  }

  function update(){
    var p = getP();
    var e = eio(p);    /* 0 at start → 1 at end, eased */
    var inv = 1 - e;   /* 1 at start → 0 at end         */

    /* Portrait: starts left-angled, settles to stable position */
    var xStart = window.innerWidth * 0.22;
    var xEnd   = window.innerWidth * 0.16;
    var xPx    = xStart + (xEnd - xStart) * e;
    portrait.style.opacity   = (0.85 + 0.15 * e).toFixed(3);
    portrait.style.transform =
      'translate(calc(-50% - ' + xPx.toFixed(1) + 'px),-50%)';

    /* Card: starts left 3D-angled pose, rotates into straight settled front */
    var rotY = -28 * inv;        /* -28deg → 0deg */
    var rotX =   6 * inv;        /*   6deg → 0deg */
    var sc   = 1.08 - 0.08 * e; /*   1.08 → 1.0  */
    card.style.transform =
      'rotateY(' + rotY.toFixed(2) + 'deg)' +
      ' rotateX(' + rotX.toFixed(2) + 'deg)' +
      ' scale(' + sc.toFixed(3) + ')';

    /* Carousel index */
    var idx = Math.min(N-1, Math.floor(p*N));
    swapTo(idx);
  }

  function tick(){update();requestAnimationFrame(tick);}
  tick();
})();

/* ══════════════════════════════════════════════════════════════
   THE 221B CASE ROOM — application
   Hash routes: #/board · #/suspect/:id · #/deduce
   ══════════════════════════════════════════════════════════════ */
(() => {
  "use strict";
  const C = window.CASE, PORTRAITS = window.PORTRAITS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const suspect = id => C.suspects.find(s => s.id === id);
  const clue = id => C.clues.find(c => c.id === id);

  const BOARD_W = 1240, BOARD_H = 860;
  const KEY = "case-room:" + C.id;

  /* ── State ──────────────────────────────────────────────── */
  const defaultPositions = () => {
    const pos = {};
    C.suspects.forEach((s, i) => { pos[s.id] = { x: 70 + i * 228, y: 60, rot: [-2.5, 1.5, -1, 2, -1.8][i] }; });
    C.clues.forEach((c, i) => {
      const row = i < 4 ? 0 : 1, col = row ? i - 4 : i;
      pos[c.id] = { x: (row ? 190 : 40) + col * 300, y: row ? 640 : [410, 445, 400, 450][col], rot: [1.5, -2, 2.5, -1, 1, -1.5, 2][i % 7] };
    });
    return pos;
  };
  const fresh = () => ({
    status: "open", ties: {}, notes: {}, suspicion: {}, pos: defaultPositions(),
    cleared: [], accused: null, solved: false, attempts: 0, introSeen: false,
    theme: "gaslight", sound: false
  });
  let S = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) {}
  { const d = defaultPositions(); for (const k in d) if (!S.pos[k]) S.pos[k] = d[k]; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  /* ── Sound (tiny WebAudio foley) ─────────────────────────── */
  let AC;
  const snd = {
    ctx() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); return AC; },
    play(kind) {
      if (!S.sound) return;
      try {
        const ac = this.ctx(), t = ac.currentTime, g = ac.createGain(); g.connect(ac.destination);
        if (kind === "pin" || kind === "tick") {
          const buf = ac.createBuffer(1, ac.sampleRate * .05, ac.sampleRate), d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
          const src = ac.createBufferSource(); src.buffer = buf; const f = ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = kind === "tick" ? 2500 : 900;
          src.connect(f); f.connect(g); g.gain.value = kind === "tick" ? .15 : .5; src.start(t);
        } else if (kind === "snap") {
          const o = ac.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(140, t + .18);
          g.gain.setValueAtTime(.25, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); o.start(t); o.stop(t + .22);
        } else if (kind === "stamp") {
          const o = ac.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + .25);
          g.gain.setValueAtTime(.8, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(g); o.start(t); o.stop(t + .32);
          const buf = ac.createBuffer(1, ac.sampleRate * .08, ac.sampleRate), d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
          const src = ac.createBufferSource(); src.buffer = buf; const g2 = ac.createGain(); g2.gain.value = .4; src.connect(g2); g2.connect(ac.destination); src.start(t);
        } else if (kind === "win") {
          [523, 659, 784, 1047].forEach((f, i) => { const o = ac.createOscillator(); const gg = ac.createGain(); o.type = "triangle"; o.frequency.value = f;
            gg.gain.setValueAtTime(0, t + i * .12); gg.gain.linearRampToValueAtTime(.18, t + i * .12 + .03); gg.gain.exponentialRampToValueAtTime(.001, t + i * .12 + .6);
            o.connect(gg); gg.connect(ac.destination); o.start(t + i * .12); o.stop(t + i * .12 + .65); });
        }
      } catch (e) {}
    }
  };

  /* ── Toast ──────────────────────────────────────────────── */
  let toastT;
  const toast = (msg, ms = 2600) => { const el = $("#toast"); el.textContent = msg; el.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("is-on"), ms); };

  /* ── Status ─────────────────────────────────────────────── */
  const STATUS_LABEL = { open: "Open", progress: "In Progress", solved: "Case Closed" };
  function setStatus(st, { silent } = {}) {
    if (S.status === st) return;
    S.status = st; save();
    const el = $("#statusStamp"); el.dataset.status = st; $(".status-stamp__label", el).textContent = STATUS_LABEL[st];
    el.classList.remove("is-bump"); void el.offsetWidth; el.classList.add("is-bump");
    if (!silent) { snd.play("stamp"); toast(`Case status: ${STATUS_LABEL[st]}`); }
    $$(".segmented button").forEach(b => { const on = b.dataset.status === st; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", on); });
  }
  const bumpProgress = () => { if (S.status === "open") setStatus("progress"); };
  const renderStatus = () => { const el = $("#statusStamp"); el.dataset.status = S.status; $(".status-stamp__label", el).textContent = STATUS_LABEL[S.status]; };

  /* ── Ties ───────────────────────────────────────────────── */
  const tieCount = sid => Object.values(S.ties).filter(v => v === sid).length;
  const correctTies = () => C.clues.filter(c => S.ties[c.id] === c.answer).length;
  function tie(cid, sid) {
    const was = S.ties[cid];
    if (was === sid) { untie(cid); return; }
    S.ties[cid] = sid; if (!S.startedAt) S.startedAt = Date.now(); save(); bumpProgress();
    const c = clue(cid), s = suspect(sid);
    if (sid === c.answer) { snd.play("snap"); toast(`Exhibit ${c.exhibit} tied to ${s.short}. The thread holds.`); }
    else { snd.play("pin"); toast(`Exhibit ${c.exhibit} tied to ${s.short}… but the knot feels loose. Re-read the clue.`, 3400); }
    if (correctTies() === C.clues.length) setTimeout(() => toast("Every thread is tied. The Deduction room awaits.", 3600), 1200);
    if (route.name === "board") renderBoardState({ newTie: cid });
  }
  function untie(cid) { delete S.ties[cid]; save(); snd.play("tick"); if (route.name === "board") renderBoardState(); }

  /* ── Router ─────────────────────────────────────────────── */
  let route = { name: "board" };
  function parse() {
    const h = location.hash.replace(/^#\/?/, "");
    const [name, arg] = h.split("/");
    if (name === "suspect") return { name: "suspect", id: arg && suspect(arg) ? arg : C.suspects[0].id };
    if (name === "deduce") return { name: "deduce", pick: arg };
    if (name === "board") return { name: "board" };
    return { name: "home" };
  }
  function navigate() {
    route = parse();
    $$(".tab").forEach(t => t.classList.toggle("is-active", t.dataset.route === route.name));
    const v = $("#view"); v.innerHTML = "";
    document.body.classList.toggle("is-home", route.name === "home");
    if (route.name === "home") renderLanding(v);
    else if (route.name === "board") renderBoard(v);
    else if (route.name === "suspect") renderSuspect(v, route.id);
    else renderDeduce(v, route.pick);
    window.scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", navigate);

  /* ══ LANDING ════════════════════════════════════════════ */
  const GEM = `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9cc1ff"/><stop offset=".5" stop-color="#2f6fd6"/><stop offset="1" stop-color="#0b1f52"/></linearGradient><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dbe8ff"/><stop offset="1" stop-color="#4f86e8"/></linearGradient></defs>
    <polygon points="100,12 150,42 180,100 150,160 100,188 50,160 20,100 50,42" fill="url(#g1)"/>
    <polygon points="100,12 150,42 100,70 50,42" fill="url(#g2)" opacity=".9"/>
    <polygon points="150,42 180,100 100,70" fill="#6fa0ff" opacity=".55"/><polygon points="20,100 50,42 100,70" fill="#1d4fb8" opacity=".7"/>
    <polygon points="100,70 180,100 150,160 100,188 50,160 20,100" fill="#2b63cc" opacity=".55"/>
    <polygon points="100,70 150,160 100,188 50,160" fill="#163f9e" opacity=".5"/>
    <path d="M62 50 q38 -22 76 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/></svg>`;
  function renderLanding(root) {
    const started = Object.keys(S.ties).length || Object.keys(S.notes).length || S.attempts;
    const sec = document.createElement("section"); sec.className = "landing";
    sec.innerHTML = `
      <div class="landing__bg" aria-hidden="true"></div>
      <div class="landing__inner">
        <div>
          <div class="eyebrow">Case file ${esc(C.number)} · ${esc(C.date)}</div>
          <h1>The <em>Ashcombe</em><br>Sapphire</h1>
          <p class="lede">${esc(C.brief)}</p>
          <div class="cta">
            <a class="btn btn--wax" href="#/board">${started ? "Return to the board" : "Open the case file"}</a>
            <a class="btn btn--outline-light" href="#/suspect">Meet the suspects</a>
            ${S.solved ? `<span class="resume">Case closed — ${S.attempts} accusation${S.attempts > 1 ? "s" : ""}.</span>` : started ? `<span class="resume">${Object.keys(S.ties).length} of ${C.clues.length} threads tied — resume where you left off.</span>` : ""}
          </div>
          <div class="landing__facts">
            <div class="fact"><b>5</b><span>Suspects</span></div>
            <div class="fact"><b>4<small style="font-size:.5em"> min</small></b><span>of darkness</span></div>
            <div class="fact"><b>48<small style="font-size:.5em"> ct</small></b><span>Sapphire, missing</span></div>
          </div>
        </div>
        <div class="evidence-bag" aria-hidden="true">
          <div class="tag"><b>EVIDENCE</b>Item 1 · Display case<br>Long Gallery · 11:10 pm</div>
          <div class="frame"><div class="gem">${GEM}</div></div>
          <span class="stamp stamp--guilty">Missing</span>
        </div>
      </div>
      <nav class="landing__screens" aria-label="Screens">
        <a class="screen-card" href="#/board"><div class="k">01 · Case Board</div><h3>Pin. String. Connect.</h3><p>Every clue and every suspect on one cork board. Pull red string from evidence to the person it implicates.</p></a>
        <a class="screen-card" href="#/suspect"><div class="k">02 · Suspect Profiles</div><h3>Alibis under the lamp.</h3><p>Statements, witnesses, movements, interrogation. Rate your suspicion and keep notes in your own hand.</p></a>
        <a class="screen-card" href="#/deduce"><div class="k">03 · Deduction</div><h3>Name the thief.</h3><p>Assemble the household at midnight. Press and hold to accuse. One alibi will not survive it.</p></a>
      </nav>
      <p class="credits-line">Hand-built with HTML, CSS and vanilla JavaScript · <a href="https://github.com/jaytech3/221b-case-room">source</a></p>`;
    root.appendChild(sec);
    if (!S.introSeen) setTimeout(openTelegram, 600);
  }

  /* ══ BOARD ══════════════════════════════════════════════ */
  let boardEl, stringsEl, scrollEl, scale = 1, stringing = null;

  function renderBoard(root) {
    const sec = document.createElement("section");
    sec.className = "board-wrap";
    sec.innerHTML = `
      <aside class="dock">
        <div class="folder">
          <div>
            <div class="folder__num">CASE FILE · ${esc(C.number)}</div>
            <h2 class="folder__title">${esc(C.title)}</h2>
            <div class="folder__sub">${esc(C.subtitle)}</div>
            <div class="folder__date">${esc(C.date)}</div>
            <p class="folder__brief">${esc(C.brief)}</p>
          </div>
          <div>
            <label class="fieldlabel">Case status</label>
            <div class="segmented" role="radiogroup" aria-label="Case status">
              ${["open", "progress", "solved"].map(k => `<button role="radio" aria-checked="${S.status === k}" data-status="${k}" class="${S.status === k ? "is-on" : ""}">${STATUS_LABEL[k]}</button>`).join("")}
            </div>
            <div class="progress">
              <div class="progress__bar"><div class="progress__fill" id="progFill"></div></div>
              <div class="progress__text"><span id="progText"></span><span id="progHint"></span></div>
            </div>
          </div>
          <div>
            <label class="fieldlabel">How to work the board</label>
            <ol class="howto">
              <li><b>Pull the string.</b> Drag a clue's red pin onto a suspect — or click the pin, then the suspect.</li>
              <li><b>Examine.</b> Click a clue to read it in full; open a suspect's dossier for alibi and movements.</li>
              <li><b>Deduce.</b> When the threads are tied, name the culprit in the Deduction room.</li>
            </ol>
            <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
              <button class="btn btn--ghost" data-action="notes" style="flex:1">📓 Case notes</button>
              <a class="btn btn--wax" href="#/deduce" style="flex:1">Deduce →</a>
            </div>
          </div>
        </div>
      </aside>
      <div class="board-scroll" id="boardScroll">
        <div class="board-sizer">
          <div class="board" id="board" style="--board-w:${BOARD_W}px;--board-h:${BOARD_H}px">
            <svg class="strings" id="strings" aria-hidden="true"></svg>
          </div>
        </div>
        <div class="board-frame"></div>
        <div class="board-hint" id="boardHint"></div>
      </div>`;
    root.appendChild(sec);
    scrollEl = $("#boardScroll"); boardEl = $("#board"); stringsEl = $("#strings");
    scrollEl.style.setProperty("--board-w", BOARD_W + "px"); scrollEl.style.setProperty("--board-h", BOARD_H + "px");

    $$(".segmented button", sec).forEach(b => b.addEventListener("click", () => {
      setStatus(b.dataset.status);
      if (b.dataset.status === "solved" && !S.solved) toast("Marked solved by hand — name the culprit in the Deduction room to close the file properly.", 4200);
    }));
    $("[data-action=notes]", sec).addEventListener("click", openNotes);

    const listMode = window.innerWidth < 760;
    sec.classList.toggle("list-mode", listMode);

    if (listMode) {
      const label = document.createElement("div"); label.className = "row-label"; label.textContent = "The suspects — swipe";
      const row = document.createElement("div"); row.className = "row";
      C.suspects.forEach(s => row.appendChild(suspectCard(s)));
      const label2 = document.createElement("div"); label2.className = "row-label"; label2.textContent = "The evidence — tap a clue to tie it";
      boardEl.append(label, row, label2);
      C.clues.forEach(c => boardEl.appendChild(clueCard(c)));
    } else {
      C.suspects.forEach(s => boardEl.appendChild(suspectCard(s)));
      C.clues.forEach(c => boardEl.appendChild(clueCard(c)));
      fitBoard();
      window.removeEventListener("resize", onResize); window.addEventListener("resize", onResize);
    }
    renderBoardState();
    if (!S.introSeen) setTimeout(openTelegram, 350);
  }

  function onResize() {
    if (route.name !== "board") { window.removeEventListener("resize", onResize); return; }
    if ((window.innerWidth < 760) !== $(".board-wrap").classList.contains("list-mode")) navigate(); else { fitBoard(); drawStrings(); }
  }
  function fitBoard() {
    const w = scrollEl.clientWidth - 36;
    scale = Math.min(1, Math.max(.45, w / BOARD_W));
    boardEl.style.setProperty("--scale", scale);
    $(".board-sizer").style.setProperty("--scale", scale);
    $(".board-sizer").style.setProperty("--board-w", BOARD_W + "px"); $(".board-sizer").style.setProperty("--board-h", BOARD_H + "px");
  }

  function portrait(id) { return PORTRAITS[suspect(id).portrait] || ""; }

  function suspectCard(s) {
    const p = S.pos[s.id];
    const el = document.createElement("article");
    el.className = "card card--suspect"; el.dataset.id = s.id; el.dataset.kind = "suspect";
    el.style.cssText = `--x:${p.x}px;--y:${p.y}px;--rot:${p.rot}deg`;
    el.innerHTML = `
      <span class="pin pin--brass" aria-hidden="true"></span>
      <div class="photo">${portrait(s.id)}<span class="stampslot"></span></div>
      <span class="tally" aria-label="clues tied"></span>
      <div class="name">${esc(s.name)}</div>
      <div class="role">${esc(s.role)}</div>
      <a class="btn btn--light open" href="#/suspect/${s.id}">Open dossier</a>`;
    makeDraggable(el);
    el.addEventListener("click", e => {
      if (e.target.closest("a")) return;
      if (stringing) { finishString(s.id); return; }
      if (el.dataset.moved === "1") return;
      location.hash = `#/suspect/${s.id}`;
    });
    el.tabIndex = 0;
    el.addEventListener("keydown", e => { if (e.key === "Enter") location.hash = `#/suspect/${s.id}`; });
    return el;
  }

  function clueCard(c) {
    const p = S.pos[c.id];
    const el = document.createElement("article");
    el.className = "card card--clue"; el.dataset.id = c.id; el.dataset.kind = "clue";
    el.style.cssText = `--x:${p.x}px;--y:${p.y}px;--rot:${p.rot}deg`;
    el.innerHTML = `
      <span class="pin pin--handle" role="button" tabindex="0" aria-label="Pull string from exhibit ${c.exhibit}"></span>
      <span class="exhibit">Exhibit ${c.exhibit}</span>
      <h3 class="title">${esc(c.title)}</h3>
      <p class="summary">${esc(c.summary)}</p>
      <div class="tied"><span class="who"></span><button class="mini" data-tie>Tie to…</button></div>`;
    makeDraggable(el);
    const pin = $(".pin", el);
    pin.addEventListener("pointerdown", e => { e.stopPropagation(); e.preventDefault(); startString(c.id, e); });
    pin.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openExamine(c.id); } });
    $("[data-tie]", el).addEventListener("click", e => { e.stopPropagation(); openExamine(c.id); });
    el.tabIndex = 0; el.setAttribute("aria-label", `Exhibit ${c.exhibit}: ${c.title}`);
    el.addEventListener("keydown", e => { if (e.key === "Enter" && e.target === el) openExamine(c.id); });
    el.addEventListener("click", e => {
      if (e.target.closest(".pin") || e.target.closest("[data-tie]")) return;
      if (stringing) { cancelString(); return; }
      if (el.dataset.moved === "1") return;
      openExamine(c.id);
    });
    return el;
  }

  function renderBoardState({ newTie } = {}) {
    // suspect tallies + stamps
    C.suspects.forEach(s => {
      const el = $(`.card--suspect[data-id="${s.id}"]`); if (!el) return;
      const n = tieCount(s.id); const t = $(".tally", el); t.textContent = n; t.classList.toggle("is-on", n > 0);
      const slot = $(".stampslot", el);
      slot.innerHTML = S.solved && s.verdict.guilty ? `<span class="stamp stamp--guilty">Guilty</span>` : S.cleared.includes(s.id) ? `<span class="stamp stamp--cleared">Alibi holds</span>` : "";
      el.classList.toggle("is-culprit", S.solved && s.verdict.guilty);
    });
    C.clues.forEach(c => {
      const el = $(`.card--clue[data-id="${c.id}"]`); if (!el) return;
      const sid = S.ties[c.id];
      el.classList.toggle("is-tied", !!sid); el.classList.toggle("is-doubt", !!sid && sid !== c.answer);
      $(".who", el).innerHTML = sid ? `→ <b>${esc(suspect(sid).short)}</b>` : "Untied";
      $("[data-tie]", el).textContent = sid ? "Change" : "Tie to…";
    });
    const n = Object.keys(S.ties).length, ok = correctTies();
    const coach = $(`.card--clue .pin`); $$(".pin.is-coach").forEach(p => p.classList.remove("is-coach"));
    if (coach && n === 0 && S.introSeen && !S.solved) coach.classList.add("is-coach");
    const fill = $("#progFill"); if (fill) fill.style.width = (ok / C.clues.length * 100) + "%";
    const pt = $("#progText"); if (pt) pt.textContent = `${n} of ${C.clues.length} clues tied`;
    const ph = $("#progHint"); if (ph) ph.textContent = ok === C.clues.length ? "Threads hold ✓" : n > ok ? `${n - ok} loose knot${n - ok > 1 ? "s" : ""}` : "";
    let banner = $(".closed-banner");
    if (S.solved && !banner) { banner = document.createElement("div"); banner.className = "closed-banner"; banner.innerHTML = `<span class="stamp stamp--closed">Case Closed</span>`; scrollEl.appendChild(banner); }
    if (!S.solved && banner) banner.remove();
    drawStrings(newTie);
  }

  /* strings */
  const pinPoint = el => { const p = S.pos[el.dataset.id]; const w = el.offsetWidth; return { x: p.x + w / 2, y: p.y + 1 }; };
  // rotation moves the pin slightly; compute from the actual pin element for accuracy
  const pinXY = el => {
    const pin = $(".pin", el), b = boardEl.getBoundingClientRect(), r = pin.getBoundingClientRect();
    return { x: (r.left + r.width / 2 - b.left) / scale, y: (r.top + r.height / 2 - b.top) / scale };
  };
  const pathBetween = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
    const sag = 18 + dist * .07;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + sag;
    return { d: `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`, mid: { x: mx, y: (a.y + b.y) / 2 + sag / 2 } };
  };
  const pinHead = (p, kind) => `<g class="pinhead" transform="translate(${p.x},${p.y})"><circle r="11" fill="${kind === "wax" ? "url(#gWax)" : "url(#gBrass)"}"/><circle r="11" fill="none" stroke="rgba(0,0,0,.35)"/></g>`;
  const DEFS = `<defs><radialGradient id="gWax" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff8a8a"/><stop offset=".4" stop-color="#9b2226"/><stop offset="1" stop-color="#5a0d10"/></radialGradient><radialGradient id="gBrass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".45" stop-color="#c9a24e"/><stop offset="1" stop-color="#5e4612"/></radialGradient></defs>`;
  function drawStrings(newTie) {
    if (!stringsEl || $(".board-wrap").classList.contains("list-mode")) return;
    let html = "";
    for (const [cid, sid] of Object.entries(S.ties)) {
      const ce = $(`.card--clue[data-id="${cid}"]`), se = $(`.card--suspect[data-id="${sid}"]`); if (!ce || !se) continue;
      const a = pinXY(ce), b = pinXY(se), { d, mid } = pathBetween(a, b);
      const cls = S.solved && suspect(sid).verdict.guilty && clue(cid).answer === sid ? "string--gold" : sid !== clue(cid).answer ? "string--doubt" : "";
      html += `<g class="string-g" data-cid="${cid}">
        <path class="string string--shadow" d="${d}"/>
        <path class="string ${cls} ${newTie === cid ? "string-draw" : ""}" d="${d}"/>
        <g class="cut" data-cut="${cid}" transform="translate(${mid.x},${mid.y})"><title>Cut this string</title><circle r="11"/><text>✂</text></g>
        ${pinHead(a, "wax")}${pinHead(b, "brass")}
      </g>`;
    }
    stringsEl.innerHTML = DEFS + html + (stringing ? `<path class="string string--temp" id="tempString" d=""/>` : "");
    $$("[data-cut]", stringsEl).forEach(g => g.addEventListener("click", e => { e.stopPropagation(); untie(g.dataset.cut); toast("String cut."); }));
    $$(".string-g path.string:not(.string--shadow)", stringsEl).forEach(p => p.addEventListener("click", e => { e.stopPropagation(); const cid = p.parentNode.dataset.cid; openExamine(cid); }));
  }

  /* dragging cards */
  function makeDraggable(el) {
    let start, orig, moved = false, pid;
    el.addEventListener("pointerdown", e => {
      if ($(".board-wrap").classList.contains("list-mode")) return;
      if (e.button !== 0 || e.target.closest("a,button")) return;
      pid = e.pointerId; el.setPointerCapture(pid);
      start = { x: e.clientX, y: e.clientY }; orig = { ...S.pos[el.dataset.id] }; moved = false; el.dataset.moved = "0";
      el.classList.add("is-dragging"); bringToFront(el);
    });
    el.addEventListener("pointermove", e => {
      if (!start) return;
      const dx = (e.clientX - start.x) / scale, dy = (e.clientY - start.y) / scale;
      if (!moved && Math.hypot(dx, dy) > 3) moved = true;
      if (!moved) return;
      el.dataset.moved = "1";
      const w = el.offsetWidth, h = el.offsetHeight;
      const x = Math.max(8, Math.min(BOARD_W - w - 8, orig.x + dx)), y = Math.max(16, Math.min(BOARD_H - h - 8, orig.y + dy));
      S.pos[el.dataset.id] = { ...orig, x, y };
      el.style.setProperty("--x", x + "px"); el.style.setProperty("--y", y + "px");
      drawStrings();
    });
    const end = () => { if (!start) return; start = null; el.classList.remove("is-dragging"); if (moved) { save(); snd.play("tick"); setTimeout(() => el.dataset.moved = "0", 50); } };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
  }
  let z = 10; const bringToFront = el => { el.style.zIndex = ++z; };

  /* stringing (pin → suspect) */
  function startString(cid, e) {
    stringing = { cid, sticky: false, downAt: Date.now(), start: { x: e.clientX, y: e.clientY } };
    scrollEl.classList.add("is-stringing");
    $("#boardHint").textContent = `Exhibit ${clue(cid).exhibit} — drop the string on a suspect (Esc to cancel)`; $("#boardHint").classList.add("is-on");
    drawStrings(); moveTemp(e);
    snd.play("pin");
    window.addEventListener("pointermove", onStringMove); window.addEventListener("pointerup", onStringUp, { once: true });
  }
  function moveTemp(e) {
    if (!stringing) return;
    const ce = $(`.card--clue[data-id="${stringing.cid}"]`), a = pinXY(ce), b = boardEl.getBoundingClientRect();
    const p = { x: (e.clientX - b.left) / scale, y: (e.clientY - b.top) / scale };
    const t = $("#tempString"); if (t) t.setAttribute("d", pathBetween(a, p).d);
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(".card--suspect");
    $$(".card--suspect").forEach(c => c.classList.toggle("is-target", c === over));
  }
  function onStringMove(e) { moveTemp(e); }
  function onStringUp(e) {
    window.removeEventListener("pointermove", onStringMove);
    if (!stringing) return;
    const dist = Math.hypot(e.clientX - stringing.start.x, e.clientY - stringing.start.y);
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(".card--suspect");
    if (over) { finishString(over.dataset.id); return; }
    if (dist < 6) { // a click → sticky mode: next click on a suspect ties
      stringing.sticky = true;
      $("#boardHint").textContent = `Now click a suspect to tie Exhibit ${clue(stringing.cid).exhibit} — or press Esc`;
      window.addEventListener("pointermove", onStringMove);
      return;
    }
    cancelString();
  }
  function finishString(sid) { const cid = stringing.cid; cleanupString(); tie(cid, sid); }
  function cancelString() { cleanupString(); drawStrings(); }
  function cleanupString() {
    stringing = null; window.removeEventListener("pointermove", onStringMove);
    scrollEl?.classList.remove("is-stringing"); $("#boardHint")?.classList.remove("is-on");
    $$(".card--suspect").forEach(c => c.classList.remove("is-target"));
  }

  /* ══ SUSPECT PROFILE ════════════════════════════════════ */
  const SUS_LABELS = ["Beyond suspicion", "Unlikely", "Worth watching", "Suspicious", "Prime suspect"];
  function renderSuspect(root, id) {
    const s = suspect(id), i = C.suspects.indexOf(s);
    const prev = C.suspects[(i + 4) % 5], next = C.suspects[(i + 1) % 5];
    const tied = C.clues.filter(c => S.ties[c.id] === s.id);
    const sus = S.suspicion[s.id] ?? 2;
    const sec = document.createElement("section"); sec.className = "dossier";
    sec.innerHTML = `
      <nav class="dossier__nav" aria-label="Suspects">
        <a class="btn btn--outline-light" href="#/board">← Case board</a>
        <div class="steps">${C.suspects.map((x, k) => `<a href="#/suspect/${x.id}" class="${x.id === s.id ? "is-on" : ""}" title="${esc(x.name)}" aria-label="${esc(x.name)}">${k + 1}</a>`).join("")}</div>
        <div style="display:flex;gap:8px">
          <a class="btn btn--outline-light" href="#/suspect/${prev.id}" aria-label="Previous suspect">‹ ${esc(prev.short)}</a>
          <a class="btn btn--outline-light" href="#/suspect/${next.id}" aria-label="Next suspect">${esc(next.short)} ›</a>
        </div>
      </nav>
      <aside class="mugshot">
        <div class="photo">${portrait(s.id)}
          ${S.solved && s.verdict.guilty ? `<span class="stamp stamp--guilty">Guilty</span>` : S.cleared.includes(s.id) ? `<span class="stamp stamp--cleared">Alibi holds</span>` : ""}
        </div>
        <div class="name">${esc(s.name)}</div>
        <div class="role">${esc(s.role)} · AGE ${s.age}</div>
        <div class="chips">${s.traits.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
        <div class="gauge">
          <label class="fieldlabel" for="sus">Your suspicion</label>
          <input id="sus" type="range" min="0" max="4" step="1" value="${sus}" aria-valuetext="${SUS_LABELS[sus]}">
          <div class="gauge__scale"><span>Innocent</span><span>Guilty</span></div>
          <div class="gauge__read" id="susRead">${SUS_LABELS[sus]}</div>
        </div>
        <div class="actions">
          <a class="btn btn--wax btn--block" href="#/deduce/${s.id}">Accuse ${esc(s.short)}</a>
          <button class="btn btn--ghost btn--block" data-action="notes">📓 Case notes</button>
        </div>
      </aside>
      <article class="sheet">
        <header class="sheet__head">
          <div><div class="meta">Dossier ${i + 1} of 5 · ${esc(C.number)}</div><h1>${esc(s.name)}</h1></div>
          <div class="meta" style="text-align:right">Suspect<br>No. ${String(i + 1).padStart(2, "0")}</div>
        </header>
        <section>
          <h3>Statement — the alibi</h3>
          <blockquote class="quote">“${esc(s.alibi.quote)}”</blockquote>
          <p>${esc(s.alibi.detail)}</p>
        </section>
        <section>
          <h3>Corroborated by</h3>
          <ul class="witnesses">${s.alibi.witnesses.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
        </section>
        <section>
          <h3>Evidence against</h3>
          <div class="evidence-list">
            ${evidenceRow(clue(s.clueId), s, true)}
            ${tied.filter(c => c.id !== s.clueId).map(c => evidenceRow(c, s, false)).join("")}
          </div>
          ${tied.length === 0 ? `<p class="empty" style="margin-top:10px">You have not yet tied any thread to ${esc(s.short)} on the board.</p>` : ""}
        </section>
        <section>
          <h3>Interrogation</h3>
          <div class="qa">${(s.questions || []).map(x => `<details><summary>${esc(x.q)}</summary><div class="a">“${esc(x.a)}”</div></details>`).join("")}</div>
        </section>
        <section>
          <h3>Movements that night</h3>
          <ul class="movements">${s.movements.map(([t, x]) => `<li class="${/10:4|10:5/.test(t) ? "is-key" : ""}"><span class="t">${esc(t)}</span><span>${esc(x)}</span></li>`).join("")}</ul>
        </section>
        <section>
          <h3>Detective's notes</h3>
          <textarea class="notes" id="notes" placeholder="Jot what troubles you about ${esc(s.short)}…" spellcheck="false">${esc(S.notes[s.id] || "")}</textarea>
        </section>
      </article>`;
    root.appendChild(sec);
    const range = $("#sus", sec);
    range.addEventListener("input", () => { const v = +range.value; S.suspicion[s.id] = v; $("#susRead").textContent = SUS_LABELS[v]; range.setAttribute("aria-valuetext", SUS_LABELS[v]); save(); snd.play("tick"); bumpProgress(); });
    let nt; $("#notes", sec).addEventListener("input", e => { S.notes[s.id] = e.target.value; clearTimeout(nt); nt = setTimeout(() => { save(); if (e.target.value.trim()) bumpProgress(); }, 300); });
    $("[data-action=notes]", sec).addEventListener("click", openNotes);
    $$(".evidence button", sec).forEach(b => b.addEventListener("click", () => openExamine(b.dataset.ex)));
    $$(".qa details", sec).forEach(d => d.addEventListener("toggle", () => { if (d.open) { snd.play("tick"); bumpProgress(); } }));
  }
  function evidenceRow(c, s, canonical) {
    const sid = S.ties[c.id];
    const tag = sid === s.id ? (c.answer === s.id ? "✓ tied on your board" : "tied — but does it fit?") : canonical ? "the clue that points here" : "";
    return `<div class="evidence ${sid === s.id && c.answer !== s.id ? "is-doubt" : ""}">
      <span class="exhibit">Ex. ${c.exhibit}</span>
      <div><div class="t">${esc(c.title)}</div><div class="d">${esc(canonical ? c.detail : c.summary)}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px"><span class="tag">${tag}</span><button class="mini btn btn--ghost" style="padding:4px 10px;font-size:10px" data-ex="${c.id}">Examine</button></div></div>
    </div>`;
  }

  /* ══ DEDUCTION ══════════════════════════════════════════ */
  function renderDeduce(root, pick) {
    let sel = pick && suspect(pick) ? pick : null;
    const n = Object.keys(S.ties).length;
    const sec = document.createElement("section"); sec.className = "deduce";
    sec.innerHTML = `
      <header class="deduce__head">
        <div class="eyebrow">The Drawing Room · Midnight</div>
        <h1>Name the thief.</h1>
        <p>The household is assembled. The lamps are lit. Every eye is on you, detective — and only one accusation will survive the morning.</p>
        ${n < C.clues.length && !S.solved ? `<div class="warn">⚠ Only ${n} of ${C.clues.length} clues are tied on the board. You may still accuse — but a careful detective finishes the string.</div>` : ""}
      </header>
      <div class="lineup" role="radiogroup" aria-label="Choose a suspect">
        ${C.suspects.map(s => `<button class="figure ${S.cleared.includes(s.id) ? "is-cleared" : ""}" role="radio" aria-checked="false" data-id="${s.id}">
          <div class="photo">${portrait(s.id)}</div>
          ${S.solved && s.verdict.guilty ? `<span class="stamp stamp--guilty">Guilty</span>` : S.cleared.includes(s.id) ? `<span class="stamp stamp--cleared">Alibi holds</span>` : ""}
          <div class="n">${esc(s.name)}</div><div class="r">${esc(s.role)}</div>
          <div class="tie">${tieCount(s.id) ? `${tieCount(s.id)} thread${tieCount(s.id) > 1 ? "s" : ""} tied` : ""}</div>
        </button>`).join("")}
      </div>
      <div class="reasoning">
        <article class="sheet" id="chainSheet"></article>
        <aside class="accuse-box">
          <h3>Your accusation</h3>
          <div class="who" id="who">—</div>
          <div class="sus" id="whoSus"></div>
          <button class="hold" id="hold" disabled aria-label="Press and hold to accuse"><span>Press<br>&amp; hold<br>to accuse</span></button>
          <div class="hint-line">Hold for two seconds. There is no taking it back.</div>
          <div class="attempts" id="attempts"></div>
        </aside>
      </div>`;
    root.appendChild(sec);

    const figures = $$(".figure", sec);
    const renderSel = () => {
      figures.forEach(f => { f.classList.toggle("is-on", f.dataset.id === sel); f.setAttribute("aria-checked", f.dataset.id === sel); });
      const s = sel ? suspect(sel) : null;
      $("#who").textContent = s ? s.name : "—";
      $("#whoSus").textContent = s ? SUS_LABELS[S.suspicion[s.id] ?? 2] : "";
      $("#hold").disabled = !s || S.solved;
      $("#attempts").textContent = S.solved ? "The file is closed." : S.attempts ? `${S.attempts} accusation${S.attempts > 1 ? "s" : ""} made so far. ${S.cleared.length ? "Cleared: " + S.cleared.map(id => suspect(id).short).join(", ") + "." : ""}` : "";
      const sheet = $("#chainSheet");
      if (!s) { sheet.innerHTML = `<h2>Your chain of reasoning</h2><p class="empty" style="margin-top:12px">Select a suspect from the lineup to review the threads you tied to them, your notes, and your suspicion.</p>`; return; }
      const tied = C.clues.filter(c => S.ties[c.id] === s.id);
      sheet.innerHTML = `<h2>The case against ${esc(s.short)}</h2>
        <p style="margin:6px 0 0;color:var(--paper-muted);font-style:italic">${esc(s.role)} · claims: “${esc(s.alibi.quote.split(". ")[0])}.”</p>
        <ul class="chain">
          ${tied.length ? tied.map(c => `<li><span class="exhibit">Ex. ${c.exhibit}</span><span>${esc(c.title)} — ${esc(c.summary)}</span></li>`).join("") : `<li class="empty">No threads tied to ${esc(s.short)} yet.</li>`}
          ${S.notes[s.id] ? `<li><span class="exhibit">Notes</span><span class="note">${esc(S.notes[s.id])}</span></li>` : ""}
          <li><span class="exhibit">Alibi</span><span>Vouched for by ${esc(s.alibi.witnesses.join(", "))}.</span></li>
        </ul>
        <div style="margin-top:16px"><a class="btn btn--ghost" href="#/suspect/${s.id}">Re-read the dossier</a></div>`;
    };
    figures.forEach(f => f.addEventListener("click", () => { sel = f.dataset.id; snd.play("tick"); renderSel(); }));
    renderSel();

    // hold-to-accuse
    const hold = $("#hold", sec); let raf, t0, holding = false;
    const HOLD_MS = 2000;
    const step = () => {
      if (!holding) return;
      const p = Math.min(100, (performance.now() - t0) / HOLD_MS * 100);
      hold.style.setProperty("--p", p);
      if (p % 10 < 1.5) snd.play("tick");
      if (p >= 100) { holding = false; hold.classList.remove("is-holding"); hold.style.setProperty("--p", 0); accuse(sel); return; }
      raf = requestAnimationFrame(step);
    };
    const down = e => { if (hold.disabled) return; e.preventDefault(); holding = true; t0 = performance.now(); hold.classList.add("is-holding"); hold.setPointerCapture?.(e.pointerId); raf = requestAnimationFrame(step); };
    const up = () => { if (!holding) return; holding = false; cancelAnimationFrame(raf); hold.classList.remove("is-holding"); hold.style.setProperty("--p", 0); toast("You hesitated. Hold the button to make the accusation."); };
    hold.addEventListener("pointerdown", down); hold.addEventListener("pointerup", up); hold.addEventListener("pointercancel", up); hold.addEventListener("pointerleave", up);
    hold.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && !holding) { e.preventDefault(); holding = true; t0 = performance.now(); hold.classList.add("is-holding"); raf = requestAnimationFrame(step); } });
    hold.addEventListener("keyup", up);
  }

  function accuse(sid) {
    const s = suspect(sid); S.attempts++; S.accused = sid;
    const win = s.verdict.guilty;
    if (win) { S.solved = true; setStatus("solved", { silent: true }); snd.play("stamp"); setTimeout(() => snd.play("win"), 500); }
    else { if (!S.cleared.includes(sid)) S.cleared.push(sid); bumpProgress(); snd.play("stamp"); }
    save();
    const ov = document.createElement("div"); ov.className = "reveal" + (win ? " reveal--win" : "");
    ov.innerHTML = `<div class="reveal__card" role="dialog" aria-modal="true" aria-labelledby="revealTitle">
      <span class="exhibit">${win ? "Verdict · Case closed" : "Verdict · Accusation " + S.attempts}</span>
      <h2 id="revealTitle">${win ? `${esc(s.name)} is the thief.` : `${esc(s.short)} is not your thief.`}</h2>
      <span class="stamp stamp--big ${win ? "stamp--closed" : "stamp--cleared"}">${win ? "Case Closed" : "Alibi Holds"}</span>
      <p class="reveal__text" id="revealText"><span class="caret"></span></p>
      ${win ? `<div class="stats"><div><b>${correctTies()}/${C.clues.length}</b><span>threads true</span></div><div><b>${S.attempts}</b><span>accusation${S.attempts > 1 ? "s" : ""}</span></div><div><b>${elapsed()}</b><span>on the case</span></div></div>` : ""}
      <div class="reveal__actions" id="revealActions" style="opacity:0;transition:opacity .4s"></div>
    </div>`;
    document.body.appendChild(ov);
    const txt = $("#revealText", ov), words = s.verdict.text.split(" "); let k = 0;
    const type = () => {
      if (k < words.length) { txt.innerHTML = esc(words.slice(0, ++k).join(" ")) + ' <span class="caret"></span>'; if (k % 2 === 0) snd.play("tick"); setTimeout(type, 55 + Math.random() * 40); }
      else {
        txt.textContent = s.verdict.text;
        const a = $("#revealActions", ov);
        a.innerHTML = win
          ? `<a class="btn btn--wax" href="#/board" data-close>See the closed board</a><button class="btn btn--ghost" data-share>Copy case summary</button><button class="btn btn--ghost" data-reset>Open a fresh file</button>`
          : `<button class="btn btn--wax" data-close>Back to the drawing room</button><a class="btn btn--ghost" href="#/suspect/${s.id}" data-close>Re-read the dossier</a><a class="btn btn--ghost" href="#/board" data-close>Back to the board</a>`;
        a.style.opacity = 1;
        $("[data-close]", a)?.focus();
        $$("[data-close]", a).forEach(b => b.addEventListener("click", () => { ov.remove(); if (route.name === "deduce") navigate(); }));
        $("[data-share]", a)?.addEventListener("click", () => {
          const t = summaryText();
          (navigator.clipboard?.writeText(t) || Promise.reject()).then(() => toast("Case summary copied."), () => { window.prompt("Copy your case summary:", t); });
        });
        $("[data-reset]", a)?.addEventListener("click", () => { ov.remove(); confirmReset(); });
      }
    };
    setTimeout(type, 700);
    ov.addEventListener("click", e => { if (e.target === ov && k >= words.length) { ov.remove(); navigate(); } });
  }
  const elapsed = () => { if (!S.startedAt) return "—"; const m = Math.max(1, Math.round((Date.now() - S.startedAt) / 60000)); return m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60) + "m"; };
  const summaryText = () => `THE 221B CASE ROOM — ${C.title}\nStatus: ${STATUS_LABEL[S.status]} · Accusations: ${S.attempts}\nThreads: ${C.clues.map(c => `Ex.${c.exhibit} → ${S.ties[c.id] ? suspect(S.ties[c.id]).short : "untied"}`).join(", ")}\nCulprit: ${S.solved ? suspect(S.accused).name : "unknown"}\n${location.href.split("#")[0]}`;

  /* ══ MODALS ═════════════════════════════════════════════ */
  function openModal(html, { onClose } = {}) {
    const m = $("#modal"), card = $("#modalCard"), opener = document.activeElement;
    card.innerHTML = `<button class="icon-btn modal__close" aria-label="Close">✕</button>` + html; m.hidden = false;
    const close = () => { m.hidden = true; card.innerHTML = ""; document.removeEventListener("keydown", onKey); onClose?.(); if (opener && document.contains(opener)) opener.focus?.(); };
    const onKey = e => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    $(".modal__close", card).addEventListener("click", close);
    m.onclick = e => { if (e.target === m) close(); };
    setTimeout(() => ($("[autofocus]", card) || $(".modal__close", card)).focus(), 30);
    return close;
  }
  function openTelegram() {
    if (!S.startedAt) { S.startedAt = Date.now(); save(); }
    const close = openModal(`<div class="telegram">
      <div class="telegram__head"><b>Post Office Telegraphs</b><span>Baker St. W. · 11.42 pm</span></div>
      <h2>Urgent. Come at once.</h2>
      <p>Sapphire stolen Ravensworth House during blackout <em>stop</em> Five guests had motive <em>stop</em> Each swears an alibi <em>stop</em> No forced lock, no broken glass <em>stop</em> Lady A. frantic — Scotland Yard baffled as usual <em>stop</em> Board is set in the case room <em>stop</em> Tie your threads carefully <em>stop</em></p>
      <div class="sig">— Lestrade</div>
      <div class="actions"><button class="btn btn--wax" autofocus data-begin>Begin the investigation</button><button class="btn btn--ghost" data-notes>Read the case notes first</button></div>
    </div>`);
    S.introSeen = true; save();
    $("#modalCard [data-begin]").addEventListener("click", close);
    $("#modalCard [data-notes]").addEventListener("click", () => { close(); openNotes(); });
  }
  function openExamine(cid) {
    const c = clue(cid), sid = S.ties[cid];
    const close = openModal(`<div class="examine">
      <span class="exhibit">Exhibit ${c.exhibit} · Evidence</span>
      <h2 class="title">${esc(c.title)}</h2>
      <p class="detail">${esc(c.detail)}</p>
      <div class="suggests">${esc(c.suggests)}</div>
      <h3>Tie this thread to…</h3>
      <div class="chooser">${C.suspects.map(s => `<button data-s="${s.id}" class="${sid === s.id ? "is-on" : ""}"><span class="mini-photo">${portrait(s.id)}</span><span><div class="nm">${esc(s.short)}</div><div class="rl">${esc(s.role)}</div></span></button>`).join("")}</div>
      ${sid ? `<div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:10px"><span style="font-family:var(--f-hand);font-size:18px;color:var(--wax)">Currently tied to ${esc(suspect(sid).short)}</span><button class="btn btn--ghost" data-untie>✂ Cut the string</button></div>` : ""}
    </div>`);
    $$("#modalCard [data-s]").forEach(b => b.addEventListener("click", () => { close(); tie(cid, b.dataset.s); if (route.name !== "board") toast(`Exhibit ${c.exhibit} tied to ${suspect(b.dataset.s).short}.`); }));
    $("#modalCard [data-untie]")?.addEventListener("click", () => { close(); untie(cid); toast("String cut."); });
  }
  function openHelp() {
    openModal(`<div class="confirm">
      <span class="exhibit">Field manual</span>
      <h2>How to work the case</h2>
      <p><b>Tie a thread.</b> On the board, drag a clue's red pin onto a suspect — or click the pin, then the suspect. Click a clue card to read it in full and tie it from there (this is the way on phones). Click a string's scissors to cut it.</p>
      <p><b>Read the room.</b> Each dossier holds the alibi, who vouches for it, the suspect's movements and an interrogation. The case notes (📓) hold the timeline — one line in it breaks one alibi.</p>
      <p><b>Accuse.</b> In the Deduction room pick a suspect and press and hold for two seconds. A wrong name stamps them “Alibi holds” and the case stays open.</p>
      <p style="font-family:var(--f-type);font-size:13px;line-height:2"><span class="kbd">B</span> board &nbsp; <span class="kbd">S</span> suspects &nbsp; <span class="kbd">D</span> deduction &nbsp; <span class="kbd">N</span> notes &nbsp; <span class="kbd">1</span>–<span class="kbd">5</span> dossier &nbsp; <span class="kbd">?</span> this manual &nbsp; <span class="kbd">Esc</span> close / cancel</p>
      <div class="actions"><button class="btn btn--wax" data-ok autofocus>Back to work</button></div>
    </div>`);
    $("#modalCard [data-ok]").addEventListener("click", () => $("#modalCard .modal__close").click());
  }
  function confirmReset() {
    const close = openModal(`<div class="confirm">
      <h2>Burn the file?</h2>
      <p>Every string, note and verdict on this case will be lost. The board is reset to the night of the theft.</p>
      <div class="actions"><button class="btn btn--ghost" data-no autofocus>Keep the file</button><button class="btn btn--wax" data-yes>Burn it</button></div>
    </div>`);
    $("#modalCard [data-no]").addEventListener("click", close);
    $("#modalCard [data-yes]").addEventListener("click", () => { const keep = { theme: S.theme, sound: S.sound }; S = Object.assign(fresh(), keep, { introSeen: true }); save(); close(); renderStatus(); location.hash = "#/board"; navigate(); toast("A fresh file. The sapphire is missing once more."); snd.play("stamp"); });
  }

  /* notes drawer */
  function openNotes() {
    $("#notesBody").innerHTML = `
      <p style="margin:0;font-size:16px;line-height:32px">${esc(C.brief)}</p>
      <h3>Established facts</h3><ul class="facts">${C.facts.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
      <h3>Timeline of the night</h3>
      <ul class="timeline">${C.timeline.map(t => `<li><span class="t ${/10:4|10:5/.test(t.t) ? "is-key" : ""}">${esc(t.t)}</span><span>${esc(t.text)}</span></li>`).join("")}</ul>
      <h3>Your threads</h3>
      <ul class="facts">${C.clues.map(c => `<li>Exhibit ${c.exhibit} — ${S.ties[c.id] ? "tied to <b>" + esc(suspect(S.ties[c.id]).short) + "</b>" : "<i>untied</i>"}</li>`).join("")}</ul>`;
    $("#notesDrawer").setAttribute("aria-hidden", "false"); $("#scrim").hidden = false;
    $("#notesDrawer .icon-btn").focus();
  }
  const closeNotes = () => { $("#notesDrawer").setAttribute("aria-hidden", "true"); $("#scrim").hidden = true; };
  $("[data-close-drawer]").addEventListener("click", closeNotes); $("#scrim").addEventListener("click", closeNotes);

  /* menu */
  const menuBtn = $("#menuBtn"), menuPanel = $("#menuPanel");
  const setMenu = open => { menuPanel.hidden = !open; menuBtn.setAttribute("aria-expanded", open); };
  menuBtn.addEventListener("click", e => { e.stopPropagation(); setMenu(menuPanel.hidden); });
  document.addEventListener("click", e => { if (!e.target.closest(".menu")) setMenu(false); });
  const applyTheme = () => { document.documentElement.dataset.theme = S.theme; $("#themeLabel").textContent = S.theme === "gaslight" ? "☀️ Daylight theme" : "🕯️ Gaslight theme"; $('meta[name=theme-color]').content = S.theme === "gaslight" ? "#15100c" : "#e9dfcc"; };
  const applySound = () => { $("#soundLabel").textContent = S.sound ? "🔔 Sound: on" : "🔕 Sound: off"; };
  menuPanel.addEventListener("click", e => {
    const a = e.target.closest("[data-action]")?.dataset.action; if (!a) return; setMenu(false);
    if (a === "notes") openNotes();
    if (a === "brief") openTelegram();
    if (a === "help") openHelp();
    if (a === "theme") { S.theme = S.theme === "gaslight" ? "daylight" : "gaslight"; save(); applyTheme(); }
    if (a === "sound") { S.sound = !S.sound; save(); applySound(); if (S.sound) snd.play("snap"); }
    if (a === "tidy") { S.pos = defaultPositions(); save(); if (route.name === "board") navigate(); toast("Board tidied."); }
    if (a === "reset") confirmReset();
  });

  /* keyboard */
  document.addEventListener("keydown", e => {
    if (e.target.matches("input,textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") { if (stringing) cancelString(); closeNotes(); setMenu(false); return; }
    const k = e.key.toLowerCase();
    if (k === "b") location.hash = "#/board";
    if (k === "s") location.hash = "#/suspect";
    if (k === "d") location.hash = "#/deduce";
    if (k === "n") openNotes();
    if (e.key === "?") openHelp();
    if (/^[1-5]$/.test(k)) location.hash = `#/suspect/${C.suspects[+k - 1].id}`;
  });

  /* boot */
  applyTheme(); applySound(); renderStatus();
  if (!location.hash) location.hash = "#/";
  navigate();
})();

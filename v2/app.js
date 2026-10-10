/* 221B Case Room · v2 */
(() => {
"use strict";
const C = window.CASE;
const S_BY = Object.fromEntries(C.suspects.map(s => [s.id, s]));
const C_BY = Object.fromEntries(C.clues.map(c => [c.id, c]));
const R_BY = Object.fromEntries(C.rooms.map(r => [r.id, r]));
const FACT_TOTAL = Object.keys(C.facts).length;
const img = n => `img/${n}.webp`;
const face = id => img(id + "-face");
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ICON = {
  eye:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
  lens:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="m15 15 6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  hand:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5v-6a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V13m0-3.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.6-2.2L4.2 15a1.6 1.6 0 0 1 2.4-2l1.4 1.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

/* ---------------- state ---------------- */
const KEY = "221b-v2";
const fresh = () => ({ seenIntro:false, links:{}, examined:[], asked:{}, facts:[], log:[], notes:{}, hints:0, attempts:0,
  solved:false, startedAt:Date.now(), solvedAt:null, pick:{ s:null, m:null, c:null }, step:0, unread:0 });
let st;
try { st = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { st = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };

const linkCount = () => Object.keys(st.links).length;
const cluesFor = sid => C.clues.filter(c => st.links[c.id] === sid);
const knows = f => st.facts.includes(f);
const score = () => Math.max(0, 100 - st.attempts * 15 - st.hints * 10);
const status = () => st.solved ? "solved" : (linkCount() || st.examined.length || st.facts.length || st.attempts || Object.keys(st.asked).length) ? "progress" : "open";
const STATUS = { open:"Case Open", progress:"In Progress", solved:"Case Solved" };
function alibi(s){
  if (s.contradict){
    const n = s.contradict.filter(knows).length;
    return n >= 2 ? "broken" : (n === 1 || knows("f_julian_unseen")) ? "shaky" : "none";
  }
  return s.exonerate.some(knows) ? "holds" : "none";
}
const ALIBI = { none:"Unverified", holds:"Holds up", shaky:"Shaky", broken:"Broken" };
const tested = () => C.suspects.filter(s => alibi(s) !== "none").length;

/* ---------------- feedback ---------------- */
let toastT;
function toast(msg, good){
  const t = $("#toast");
  t.className = "toast" + (good ? " good" : "");
  t.innerHTML = `<span class="tico">${good ? "✓" : "•"}</span><span>${msg}</span>`;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
}
function log(type, title, text){
  st.log.unshift({ type, title, text });
  st.unread++; save(); updateChrome();
  const b = $("#noteBadge"); b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
}
function addFact(f){
  if (!f || knows(f)) return false;
  st.facts.push(f); save();
  log("fact", "New fact", C.facts[f]);
  toast(`New fact: ${C.facts[f]}`, true);
  return true;
}
function updateChrome(view){
  if (view) document.body.dataset.view = view;
  view = document.body.dataset.view;
  const s = status(), p = $("#statusPill");
  p.dataset.s = s; p.textContent = STATUS[s];
  $$(".tabs a").forEach(a => a.dataset.tab === view ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current"));
  const b = $("#noteBadge"); b.hidden = !st.unread; b.textContent = st.unread;
}

function link(cid, sid){
  const prev = st.links[cid]; st.links[cid] = sid; save();
  fresh_link = cid;
  toast(prev && prev !== sid ? `Clue ${C_BY[cid].no} moved to ${S_BY[sid].short}` : `Clue ${C_BY[cid].no} pinned to ${S_BY[sid].short}`);
  if (linkCount() === 5 && !prev) setTimeout(() => toast("Every clue is on the board. Time for a deduction.", true), 900);
}
function unlink(cid){ delete st.links[cid]; save(); toast(`Clue ${C_BY[cid].no} unpinned`); }
let fresh_link = null;

/* ---------------- modal ---------------- */
let lastFocus = null;
function openModal(html, cls = ""){
  lastFocus = document.activeElement;
  const m = $("#modal"), card = $("#modalCard");
  card.className = "modal-card " + cls;
  card.innerHTML = `<button class="x" data-close aria-label="Close">✕</button>` + html;
  m.hidden = false;
  $$("[data-close]", card).forEach(b => b.addEventListener("click", closeModal));
  setTimeout(() => ($(".focus-me", card) || $("[data-close]", card)).focus(), 30);
}
function closeModal(){
  const m = $("#modal"); if (m.hidden) return;
  m.hidden = true; $("#modalCard").innerHTML = "";
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  rerender();
}
$("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

function examine(cid){
  const c = C_BY[cid];
  const first = !st.examined.includes(cid);
  if (first){ st.examined.push(cid); save(); log("evidence", `Examined clue ${c.no}`, c.detail); }
  addFact(c.fact);
  const to = st.links[cid];
  openModal(`
    <div class="exam">
      <div class="lens" id="lens"><img src="${img(c.img)}" alt="${esc(c.title)}"><div class="glass" id="glass"></div><span class="lens-tip">Hover to magnify</span></div>
      <div class="exam-body">
        <div class="eyebrow" style="color:var(--red)">Clue ${c.no} · Evidence</div>
        <h2 id="modalTitle">${esc(c.title)}</h2>
        <div class="where">Found: ${esc(c.where)}</div>
        <p class="desc">${esc(c.text)}</p>
        <div class="finding"><b>${ICON.lens.replace("<svg", '<svg width="14" height="14" style="vertical-align:-2px"')} Closer inspection</b>${esc(c.detail)}</div>
        <div class="pin-to"><div class="lbl">Pin this clue to</div>
          <div class="pin-faces">${C.suspects.map(s => `<button data-pin="${s.id}" aria-pressed="${to === s.id}"><img src="${face(s.id)}" alt="">${esc(s.short)}</button>`).join("")}</div>
        </div>
      </div>
    </div>`);
  const lens = $("#lens"), glass = $("#glass"), im = $("img", lens);
  lens.addEventListener("mousemove", e => {
    const r = lens.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, z = 2.4;
    glass.style.left = x + "px"; glass.style.top = y + "px";
    glass.style.backgroundImage = `url(${im.src})`;
    glass.style.backgroundSize = `${r.width * z}px ${r.height * z}px`;
    glass.style.backgroundPosition = `${-(x * z - 75)}px ${-(y * z - 75)}px`;
  });
  $$("[data-pin]", $("#modalCard")).forEach(b => b.addEventListener("click", () => {
    link(cid, b.dataset.pin);
    $$("[data-pin]", $("#modalCard")).forEach(x => x.setAttribute("aria-pressed", x === b));
  }));
}

function openRoom(rid){
  const r = R_BY[rid];
  const people = C.suspects.filter(s => s.room === rid);
  addFact(r.fact);
  openModal(`<div class="room-modal">
    <img src="${img(r.img)}" alt="">
    <div class="in">
      <div class="eyebrow" style="color:var(--red)">${r.crime ? "Scene of the crime" : "Floor plan · Ground floor"}</div>
      <h2 id="modalTitle" style="font-size:28px;margin:6px 0 8px">${esc(r.name)}</h2>
      <p style="margin:0;font-size:15.5px">${esc(r.text)}</p>
      ${people.length ? `<div class="people">${people.map(s => `<a href="#/suspect/${s.id}" data-close><img src="${face(s.id)}" alt="">${esc(s.short)} claims to be here</a>`).join("")}</div>` : ""}
    </div></div>`, "sm");
}

function help(){
  openModal(`<div class="plain">
    <div class="eyebrow" style="color:var(--red)">Field manual</div>
    <h2 id="modalTitle">How to work the case</h2>
    <ol>
      <li><b>Examine</b> each piece of evidence. A closer look often reveals something new.</li>
      <li><b>Pin</b> every clue to the suspect it points against: drag it onto a photo, or tap the clue and then the suspect.</li>
      <li><b>Interrogate</b> suspects in their dossiers and click rooms on the floor plan. New facts go into your notebook.</li>
      <li>Watch the <b>alibi meters</b>. When an alibi breaks, you have your thief.</li>
      <li>On the <b>Deduction</b> screen, name the culprit, how they got in, and the proof. False accusations and hints cost points.</li>
    </ol>
    <p style="color:var(--paper-mute);font-size:14px">Shortcuts: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> switch screens, <kbd>N</kbd> notebook, <kbd>Esc</kbd> closes or cancels, <kbd>?</kbd> this help.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><button class="btn primary focus-me" data-close>Back to work</button><button class="btn paper" id="resetBtn">Start the case over</button></div>
  </div>`, "sm");
  $("#resetBtn").addEventListener("click", () => {
    if (confirm("Start over? Your board, notes and score will be cleared.")){ st = fresh(); st.seenIntro = true; save(); closeModal(); location.hash = "#/board"; route(); toast("Fresh case file opened."); }
  });
}
function credits(){
  openModal(`<div class="plain"><div class="eyebrow" style="color:var(--red)">Archive</div><h2 id="modalTitle">Image credits</h2>
    <p style="color:var(--paper-mute);font-size:14px;margin-top:0">All photographs are public domain or CC0. Portrait sitters are unidentified and appear here as fictional characters.</p>
    ${C.credits.map(([t, d, u]) => `<div class="credit"><b>${esc(t)}</b><br>${esc(d)} <a href="${u}" target="_blank" rel="noopener">Source</a></div>`).join("")}</div>`, "sm");
}

/* ---------------- notebook drawer ---------------- */
let dtab = "facts";
function openDrawer(){
  st.unread = 0; save(); updateChrome();
  const d = $("#drawer");
  renderDrawer();
  d.classList.add("open"); d.setAttribute("aria-hidden","false"); d.inert = false;
  $("#scrim").hidden = false;
  setTimeout(() => $(".x", d).focus(), 50);
}
function closeDrawer(){
  const d = $("#drawer"); if (!d.classList.contains("open")) return;
  d.classList.remove("open"); d.setAttribute("aria-hidden","true"); d.inert = true; $("#scrim").hidden = true;
  $("#notebookBtn").focus();
}
function renderDrawer(){
  const d = $("#drawer");
  const body = {
    facts: `<p style="margin:0 0 10px;color:var(--paper-mute);font-size:14px">${st.facts.length} of ${FACT_TOTAL} facts uncovered.</p>` +
      Object.entries(C.facts).map(([k, v]) => knows(k)
        ? `<div class="entry"><span class="ico">✓</span><div><b>Fact</b><p>${esc(v)}</p></div></div>`
        : `<div class="entry" style="opacity:.45"><span class="ico">?</span><div><b>Undiscovered</b><p>Keep investigating.</p></div></div>`).join(""),
    log: st.log.length ? st.log.map(e => `<div class="entry"><span class="ico">${{ fact:"★", evidence:"🔍", statement:"💬" }[e.type] || "•"}</span><div><b>${esc(e.title)}</b><p>${esc(e.text)}</p></div></div>`).join("")
      : `<div class="empty">Nothing yet. Examine evidence and question suspects.</div>`,
    witnesses: C.witnesses.map(w => `<div class="witness"><img src="${img(w.id + "-face")}" alt=""><div><b>${esc(w.name)}</b><small>${esc(w.role)}</small><p>“${esc(w.says)}”</p></div></div>`).join("") +
      `<h3 style="margin:20px 0 10px;font-size:18px">Timeline</h3><ol class="timeline" style="border-color:var(--paper-line)">${C.timeline.map(e => `<li class="${e.key ? "key" : ""}" style="color:var(--paper-ink)"><time>${e.t} pm</time>${esc(e.d)}</li>`).join("")}</ol>`,
  }[dtab];
  d.innerHTML = `<div class="drawer-h"><h2>Notebook</h2><button class="x" aria-label="Close notebook">✕</button></div>
    <div class="dtabs" role="toolbar" aria-label="Notebook sections">${[["facts","Facts"],["log","Case log"],["witnesses","Witnesses"]].map(([k, l]) => `<button data-dt="${k}" aria-pressed="${dtab === k}">${l}</button>`).join("")}</div>
    <div class="drawer-body">${body}</div>`;
  $(".x", d).addEventListener("click", closeDrawer);
  $$("[data-dt]", d).forEach(b => b.addEventListener("click", () => { dtab = b.dataset.dt; renderDrawer(); $(`[data-dt="${dtab}"]`, d).focus(); }));
}
$("#notebookBtn").addEventListener("click", openDrawer);
$("#scrim").addEventListener("click", closeDrawer);

/* ---------------- intro ---------------- */
const WIRE = "BLUE DUCHESS SAPPHIRE STOLEN FROM ASHWORTH HOUSE BETWEEN NINE AND HALF PAST STOP NO FORCED ENTRY STOP FIVE GUESTS FIVE ALIBIS STOP THE YARD IS BAFFLED STOP COME AT ONCE STOP";
function renderIntro(){
  main.className = "bleed";
  main.innerHTML = `
  <section class="intro">
    <div class="intro-bg" aria-hidden="true"></div>
    <div class="intro-inner">
      <div class="fadeup">
        <div class="eyebrow">Scotland Yard · Case ${C.number}</div>
        <h1>The <em>Blue</em><br>Duchess</h1>
        <p class="lede">${esc(C.summary)} Examine the evidence, question the guests, and pull the red string tight.</p>
        <div class="intro-cta">
          <a class="btn primary focus-me" href="#/board" id="enter">Open the case file <span class="arrow">→</span></a>
          <button class="btn ghost" data-open="help">How it works</button>
        </div>
        <div class="intro-stats"><div><b>5</b><span>Suspects</span></div><div><b>5</b><span>Clues</span></div><div><b>${FACT_TOTAL}</b><span>Hidden facts</span></div><div><b>1</b><span>Thief</span></div></div>
      </div>
      <article class="telegram" aria-label="Telegram from Inspector Lestrade">
        <div class="head"><span>POST OFFICE TELEGRAPHS</span><span>RECD 9:52 PM</span></div>
        <p id="wire" aria-hidden="true"></p><p class="sr">${WIRE}</p>
        <div class="sig">— Insp. Lestrade</div>
      </article>
    </div>
  </section>
  <section class="how">
    <div><span class="n">01</span><b>Examine</b><p>Look closely at each piece of evidence. Details hide in plain sight.</p></div>
    <div><span class="n">02</span><b>Connect</b><p>Pin every clue to a suspect with red string on the case board.</p></div>
    <div><span class="n">03</span><b>Interrogate</b><p>Question the five guests and walk the floor plan of the house.</p></div>
    <div><span class="n">04</span><b>Accuse</b><p>Name the thief, how they got in, and the proof. Choose wisely.</p></div>
  </section>`;
  $("#enter").addEventListener("click", () => { st.seenIntro = true; save(); });
  const w = $("#wire");
  if (reduced){ w.textContent = WIRE; return; }
  let i = 0; const tick = () => {
    if (!document.contains(w)) return;
    w.innerHTML = esc(WIRE.slice(0, i)) + `<span class="caret"></span>`;
    if (i++ < WIRE.length) setTimeout(tick, WIRE[i - 1] === " " ? 40 : 26);
  };
  setTimeout(tick, 700);
}

/* ---------------- board ---------------- */
let selected = null, pointer = null;
function meter(v, max, label){ return `<div class="meter"><b>${v}<small> / ${max}</small></b><span>${label}</span><i style="--p:${v / max * 100}%"></i></div>`; }
function plan(){
  const known = knows("f_door");
  const pos = { library:[70,64], billiard:[100,212], conservatory:[295,212], drawing:[330,64] };
  return `<svg viewBox="0 0 400 260" role="group" aria-label="Floor plan of Ashworth House">
    <defs><clipPath id="cf"><circle r="14"/></clipPath></defs>
    ${C.rooms.map(r => `<g class="room ${r.crime ? "crime" : ""} ${r.fact && knows(r.fact) ? "found" : ""}" data-room="${r.id}" tabindex="0" role="button" aria-label="${esc(r.name)}">
      <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="3"/>
      <text x="${r.x + 8}" y="${r.y + 17}">${esc(r.name)}</text></g>`).join("")}
    <rect class="door-r" x="186" y="108" width="28" height="12" fill="#4a3d31" pointer-events="none"/>
    <rect x="56" y="108" width="28" height="12" fill="#4a3d31" pointer-events="none"/>
    <rect x="316" y="108" width="28" height="12" fill="#4a3d31" pointer-events="none"/>
    <rect x="86" y="152" width="28" height="12" fill="#4a3d31" pointer-events="none"/>
    <rect x="281" y="152" width="28" height="12" fill="#4a3d31" pointer-events="none"/>
    <line x1="175" y1="10" x2="225" y2="10" stroke="#8fb0ff" stroke-width="4" pointer-events="none"/>
    ${known ? `<rect x="258" y="46" width="14" height="26" fill="#ecd27c" pointer-events="none"><animate attributeName="opacity" values="1;.4;1" dur="1.6s" repeatCount="3"/></rect>` : ""}
    <g pointer-events="none"><path d="M200 52 l12 12 -12 22 -12 -22z" fill="#3a6ee8" stroke="#ecd27c" stroke-width="1.5"/><text x="200" y="100" text-anchor="middle" fill="#de4a3d" style="font:700 9px var(--mono)">SAFE</text></g>
    ${Object.entries(pos).map(([room, [x, y]]) => { const s = C.suspects.find(v => v.room === room);
      return s ? `<g class="who" transform="translate(${x},${y})" pointer-events="none"><image href="${face(s.id)}" x="-14" y="-14" width="28" height="28" clip-path="url(#cf)" preserveAspectRatio="xMidYMid slice"/><circle r="14"/></g>` : ""; }).join("")}
  </svg>
  <div class="plan-legend"><span><i style="background:#8fb0ff"></i>Window</span><span><i style="background:#4a3d31"></i>Door</span>${known ? `<span><i></i>Connecting door</span>` : ""}<span>Lang: left by cab, 8:45</span></div>`;
}
function stepsPanel(){
  const n = linkCount(), s = status();
  const steps = [
    { l:"Case opened", d:true },
    { l:`Pin every clue (${n}/5)`, d:n === 5, now:n < 5 && s !== "solved" },
    { l:`Test the alibis (${tested()}/5)`, d:tested() === 5, now:n === 5 && tested() < 5 && !st.solved },
    { l:"Name the culprit", d:st.solved, now:n === 5 && tested() === 5 && !st.solved },
    { l:"Case solved", d:st.solved },
  ];
  return `<ol class="steps">${steps.map((x, i) => `<li class="${x.d ? "done" : ""} ${x.now ? "now" : ""}"><span class="dot">${x.d ? "✓" : i + 1}</span>${x.l}</li>`).join("")}</ol>`;
}
function renderBoard(){
  main.className = "";
  main.innerHTML = `
  <div class="fadeup">
    <div class="board-head">
      <div>
        <div class="eyebrow">Case ${C.number} · ${C.title}</div>
        <h1>The Case Board</h1>
        <p class="lede">Pin each clue to the suspect it points against. Examine evidence and test every alibi before you accuse.</p>
      </div>
      <div class="meters">
        ${meter(linkCount(), 5, "Clues pinned")}${meter(st.examined.length, 5, "Examined")}${meter(st.facts.length, FACT_TOTAL, "Facts")}${meter(tested(), 5, "Alibis tested")}
      </div>
    </div>
    <div class="layout">
      <section class="cork" id="cork" aria-label="Detective board">
        <svg id="strings" aria-hidden="true"></svg>
        <div class="zone"><span class="zone-label">The suspects</span><span class="zone-note">Who had the chance?</span></div>
        <div class="row suspects">${C.suspects.map(s => { const n = cluesFor(s.id).length, a = alibi(s);
          return `<button class="suspect ${n ? "has" : ""} ${st.solved && s.id === C.culprit ? "guilty" : ""}" data-sid="${s.id}" aria-label="${esc(s.name)}. Alibi ${ALIBI[a]}. ${n} clue${n === 1 ? "" : "s"} pinned.">
            <span class="pin"></span><span class="pin b"></span><span class="count">${n}</span>
            <span class="photo"><img src="${face(s.id)}" alt="" loading="lazy"></span>
            <span class="nm">${esc(s.name)}</span><span class="rl">${esc(s.role)}</span>
            <span class="alibi-chip" data-a="${a}">${ALIBI[a]}</span>
          </button>`; }).join("")}</div>
        <div class="zone"><span class="zone-label">The evidence</span><span class="zone-note">Found in the study</span></div>
        <div class="row clues">${C.clues.map(c => { const to = st.links[c.id], seen = st.examined.includes(c.id);
          return `<div class="clue ${to ? "linked" : ""} ${selected === c.id ? "selected" : ""}" draggable="true" data-cid="${c.id}" tabindex="0" role="button" aria-pressed="${selected === c.id}"
            aria-label="Clue ${c.no}, ${esc(c.title)}. ${to ? "Pinned to " + esc(S_BY[to].short) : "Not pinned"}. Press Enter to select, then choose a suspect.">
            <span class="pin"></span>
            <div class="shot"><img src="${img(c.img)}" alt="" loading="lazy" draggable="false"><span class="tagno">No. ${c.no}</span>${seen ? `<span class="seen" title="Examined">${ICON.eye}</span>` : ""}</div>
            <div class="body"><span class="where">${esc(c.where)}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p>
              <span class="to">${to ? `Pinned to <b>${esc(S_BY[to].short)}</b>` : "Not pinned yet"}</span>
              <div class="foot-row"><button class="mini-btn grow" data-exam="${c.id}">${ICON.lens}Examine</button>${to ? `<button class="mini-btn" data-unlink="${c.id}" aria-label="Unpin clue ${c.no}" title="Unpin">✕</button>` : ""}</div>
            </div></div>`; }).join("")}</div>
        <div class="board-hint" id="hint">${ICON.hand}<span>${hintText()}</span></div>
      </section>
      <aside class="side">
        <section class="panel"><div class="panel-h"><h2>Case status</h2><span class="chip" style="background:var(--ink-3);color:var(--brass-2)">Score ${score()}</span></div>${stepsPanel()}
          <a class="btn primary" href="#/deduce" style="width:100%;margin-top:14px">${st.solved ? "View the verdict" : "Make a deduction"} <span class="arrow">→</span></a></section>
        <section class="panel plan"><div class="panel-h"><h2>Ashworth House</h2><span style="font-size:12px;color:var(--mute)">Tap a room</span></div>${plan()}</section>
        <section class="panel"><div class="panel-h"><h2>The evening</h2></div><ol class="timeline">${C.timeline.map(e => `<li class="${e.key ? "key" : ""}"><time>${e.t} pm</time>${esc(e.d)}</li>`).join("")}</ol></section>
        <section class="panel hints"><div class="panel-h"><h2>Need a nudge?</h2></div>
          ${C.hints.slice(0, st.hints).map(h => `<div class="hint">${esc(h)}</div>`).join("")}
          ${st.hints < C.hints.length && !st.solved ? `<button class="btn sm" id="hintBtn">Reveal hint ${st.hints + 1} of ${C.hints.length}</button><div class="cost">Each hint costs 10 points.</div>` : st.hints ? "" : `<div class="cost">No hints used.</div>`}
        </section>
      </aside>
    </div>
  </div>`;
  bindBoard();
  requestAnimationFrame(() => drawStrings(true));
}
function hintText(){
  return selected ? `Clue ${C_BY[selected].no} selected. Now tap the suspect it points to. <kbd>Esc</kbd> to cancel.`
    : "Drag a clue onto a suspect, or tap a clue then a suspect. Tap a photo to open the dossier.";
}
function anchor(el, box, top){ const r = el.getBoundingClientRect(); return { x:r.left - box.left + r.width / 2, y:(top ? r.top : r.bottom) - box.top }; }
function curve(a, b){ const sag = Math.min(70, Math.abs(a.x - b.x) * .18 + 22); return `M${a.x},${a.y} Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 + sag} ${b.x},${b.y}`; }
function drawStrings(animate){
  const cork = $("#cork"), svg = $("#strings"); if (!cork) return;
  const box = cork.getBoundingClientRect(); let d = "";
  for (const [cid, sid] of Object.entries(st.links)){
    const ce = $(`.clue[data-cid="${cid}"]`, cork), se = $(`.suspect[data-sid="${sid}"]`, cork);
    if (ce && se) d += `<path data-c="${cid}" d="${curve(anchor(ce, box, true), anchor(se, box, false))}"/>`;
  }
  if (selected && pointer){ const ce = $(`.clue[data-cid="${selected}"]`, cork); if (ce) d += `<path class="ghost" d="${curve(anchor(ce, box, true), pointer)}"/>`; }
  svg.innerHTML = d;
  if (animate && fresh_link && !reduced){
    const p = $(`path[data-c="${fresh_link}"]`, svg);
    if (p){ p.style.setProperty("--len", p.getTotalLength()); p.classList.add("new"); }
    fresh_link = null;
  }
}
function select(cid){
  selected = selected === cid ? null : cid;
  if (!selected) pointer = null;
  $$(".clue").forEach(el => { const on = el.dataset.cid === selected; el.classList.toggle("selected", on); el.setAttribute("aria-pressed", on); });
  $$(".suspect").forEach(el => el.classList.toggle("target", !!selected));
  const h = $("#hint span"); if (h) h.innerHTML = hintText();
  drawStrings();
}
function bindBoard(){
  const cork = $("#cork");
  $$(".clue", cork).forEach(el => {
    el.addEventListener("click", e => { if (!e.target.closest("button")) select(el.dataset.cid); });
    el.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target === el){ e.preventDefault(); select(el.dataset.cid); } });
    el.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", el.dataset.cid); el.classList.add("dragging"); selected = null; select(el.dataset.cid); });
    el.addEventListener("dragend", () => { el.classList.remove("dragging"); if (selected) select(null); });
  });
  $$("[data-exam]", cork).forEach(b => b.addEventListener("click", () => examine(b.dataset.exam)));
  $$("[data-unlink]", cork).forEach(b => b.addEventListener("click", () => { unlink(b.dataset.unlink); selected = null; renderBoard(); updateChrome(); }));
  $$(".suspect", cork).forEach(el => {
    el.addEventListener("click", () => {
      if (selected){ link(selected, el.dataset.sid); selected = null; renderBoard(); updateChrome(); }
      else location.hash = "#/suspect/" + el.dataset.sid;
    });
    el.addEventListener("dragover", e => { e.preventDefault(); el.classList.add("drop"); });
    el.addEventListener("dragleave", () => el.classList.remove("drop"));
    el.addEventListener("drop", e => { e.preventDefault(); const cid = e.dataTransfer.getData("text/plain"); if (cid){ link(cid, el.dataset.sid); selected = null; renderBoard(); updateChrome(); } });
  });
  const move = e => { if (!selected) return; const b = cork.getBoundingClientRect(); pointer = { x:e.clientX - b.left, y:e.clientY - b.top }; drawStrings(); };
  cork.addEventListener("pointermove", move); cork.addEventListener("dragover", move);
  $$("[data-room]").forEach(g => {
    g.addEventListener("click", () => openRoom(g.dataset.room));
    g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); openRoom(g.dataset.room); } });
  });
  const hb = $("#hintBtn");
  if (hb) hb.addEventListener("click", () => { st.hints++; save(); log("fact", `Hint ${st.hints}`, C.hints[st.hints - 1]); renderBoard(); updateChrome(); });
}

/* ---------------- dossier ---------------- */
function renderDossier(sid){
  main.className = "";
  const s = S_BY[sid] || C.suspects[0];
  const i = C.suspects.indexOf(s), prev = C.suspects[(i + 4) % 5], next = C.suspects[(i + 1) % 5];
  const a = alibi(s), asked = st.asked[s.id] || [], pinned = cluesFor(s.id), free = C.clues.filter(c => !st.links[c.id]);
  const meterText = { none:"Not yet tested. Question them, examine the evidence.", holds:"Corroborated by independent facts.", shaky:"Something doesn't add up.", broken:"The alibi is a lie." }[a];
  main.innerHTML = `
  <div class="fadeup">
    <div class="dossier-top"><a href="#/board" class="btn ghost sm">← Case board</a><span style="font:13px var(--mono);color:var(--mute)">Suspect ${i + 1} of 5</span></div>
    <nav class="lineup-nav" aria-label="All suspects">${C.suspects.map(x => `<a href="#/suspect/${x.id}" ${x.id === s.id ? 'aria-current="true"' : ""}><img src="${face(x.id)}" alt="">${esc(x.short)}<span class="dotst" data-a="${alibi(x)}" title="Alibi: ${ALIBI[alibi(x)]}"></span></a>`).join("")}</nav>
    <div class="dossier">
      <div class="cabinet">
        <div class="frame"><img src="${img(s.id + "-card")}" alt="Cabinet-card photograph of ${esc(s.name)}"></div>
        <div class="cap">Cabinet card · ${esc(s.short)} · c. 1880s</div>
        <div class="pager"><a class="btn sm" href="#/suspect/${prev.id}">← ${esc(prev.short)}</a><a class="btn sm" href="#/suspect/${next.id}">${esc(next.short)} →</a></div>
      </div>
      <article class="file">
        <span class="stamp-c">CONFIDENTIAL</span>
        <div class="eyebrow" style="color:var(--red)">Suspect dossier</div>
        <h1>${esc(s.name)}</h1>
        <div class="sub">${esc(s.role)}</div>
        <dl class="facts"><div><dt>Age</dt><dd>${s.age}</dd></div><div><dt>Connection</dt><dd>${esc(s.relation)}</dd></div><div><dt>Possible motive</dt><dd>${esc(s.motive)}</dd></div></dl>

        <section class="sec"><div class="sec-h"><h2>Alibi</h2><span class="chip">Statement</span></div>
          <blockquote class="quote">“${esc(s.alibi)}”</blockquote>
          <div class="alibi-meter" data-a="${a}"><span class="bars"><i></i><i></i><i></i></span><div><b>${ALIBI[a]}.</b> <span>${meterText}</span></div></div>
        </section>

        <section class="sec"><div class="sec-h"><h2>Interrogation</h2><span class="chip">${asked.length} / ${s.questions.length} asked</span></div>
          <div class="chat" id="chat" aria-live="polite">${asked.map(qi => bubbles(s, qi)).join("")}</div>
          <div class="asks">${s.questions.map((q, qi) => asked.includes(qi) ? "" : `<button class="ask" data-q="${qi}">“${esc(q.q)}”</button>`).join("") || `<span style="font-size:14px;color:var(--paper-mute)">You've asked everything. Cross-check the answers against the evidence.</span>`}</div>
        </section>

        <section class="sec"><div class="sec-h"><h2>Evidence pinned</h2><span class="chip">${pinned.length}</span></div>
          <div class="ev-list">${pinned.length ? pinned.map(c => `<div class="ev"><img src="${img(c.img)}" alt=""><div class="t"><b>${esc(c.title)}</b><span>${esc(c.text)}</span></div>
            <button class="btn sm paper" data-exam="${c.id}">Examine</button><button class="btn sm paper" data-unlink="${c.id}" aria-label="Unpin ${esc(c.title)}">✕</button></div>`).join("")
            : `<div class="empty">No clues pinned to ${esc(s.short)} yet.</div>`}</div>
          ${free.length ? `<div class="pin-row">Pin a loose clue: ${free.map(c => `<button class="mini-btn" data-pin="${c.id}">+ ${c.no} ${esc(c.title)}</button>`).join("")}</div>` : ""}
        </section>

        <section class="sec notes"><div class="sec-h"><h2><label for="notes">Your notes</label></h2></div>
          <textarea id="notes" placeholder="What doesn't add up about ${esc(s.short)}?">${esc(st.notes[s.id] || "")}</textarea></section>

        <div class="file-actions"><a class="btn paper" href="#/board">Back to the board</a><span class="grow"></span>
          ${st.solved ? "" : `<a class="btn danger" href="#/deduce" data-accuse="${s.id}">Accuse ${esc(s.short)}</a>`}</div>
      </article>
    </div>
  </div>`;
  $$(".ask").forEach(b => b.addEventListener("click", () => ask(s, +b.dataset.q)));
  $$("[data-exam]").forEach(b => b.addEventListener("click", () => examine(b.dataset.exam)));
  $$("[data-unlink]").forEach(b => b.addEventListener("click", () => { unlink(b.dataset.unlink); renderDossier(s.id); updateChrome(); }));
  $$("[data-pin]").forEach(b => b.addEventListener("click", () => { link(b.dataset.pin, s.id); renderDossier(s.id); updateChrome(); }));
  const acc = $("[data-accuse]"); if (acc) acc.addEventListener("click", () => { st.pick.s = s.id; st.step = 1; save(); });
  let t; $("#notes").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => { st.notes[s.id] = e.target.value; save(); }, 300); });
}
function bubbles(s, qi){
  const q = s.questions[qi];
  return `<div class="bubble q">${esc(q.q)}</div><div class="bubble a"><img src="${face(s.id)}" alt=""><div>${esc(q.a)}${q.fact ? `<span class="fact-tag">★ ${esc(C.facts[q.fact])}</span>` : ""}</div></div>`;
}
let asking = false;
function ask(s, qi){
  if (asking) return; asking = true;
  $$(".ask").forEach(b => b.disabled = true);
  const chat = $("#chat"), q = s.questions[qi];
  chat.insertAdjacentHTML("beforeend", `<div class="bubble q">${esc(q.q)}</div><div class="bubble a" id="typing"><img src="${face(s.id)}" alt=""><span class="typing"><i></i><i></i><i></i></span></div>`);
  $("#typing").scrollIntoView({ block:"nearest", behavior:"smooth" });
  setTimeout(() => {
    (st.asked[s.id] = st.asked[s.id] || []).push(qi); save();
    log("statement", `${s.short}: “${q.q}”`, q.a);
    addFact(q.fact);
    asking = false;
    renderDossier(s.id); updateChrome();
    const last = $$(".bubble.a").pop(); if (last) last.scrollIntoView({ block:"nearest" });
  }, reduced ? 50 : 1100);
}

/* ---------------- deduction ---------------- */
let lastResult = null;
function renderDeduce(){
  main.className = "";
  if (st.solved) return renderSolved();
  const p = st.pick, step = st.step || 0;
  const names = ["Who", "How", "Proof"], subs = ["Name the thief", "How they got in", "Evidence that breaks the alibi"];
  const done = [!!p.s, !!p.m, !!p.c];
  const blank = t => `<span class="blank">${t}</span>`;
  const sentence = `I accuse ${p.s ? `<em>${esc(S_BY[p.s].name)}</em>` : blank("the culprit")}. They entered the study ${p.m ? `<em>${esc(C.methods.find(m => m.id === p.m).label.toLowerCase())}</em>` : blank("by some route")}, and the proof is ${p.c ? `<em>${esc(C_BY[p.c].title.toLowerCase())}</em>` : blank("the key evidence")}.`;
  let stage = "";
  if (step === 0) stage = `<h2>Who took the Blue Duchess?</h2><p class="lede">Choose carefully. Every false accusation costs 15 points.</p>
    <div class="lineup" role="radiogroup" aria-label="Suspects">${C.suspects.map(s => `<label class="pick"><input type="radio" name="s" value="${s.id}" ${p.s === s.id ? "checked" : ""}><span class="tick">✓</span>
      <span class="photo"><img src="${face(s.id)}" alt=""></span><div class="nm">${esc(s.name)}</div><div class="meta">Alibi: ${ALIBI[alibi(s)]}</div></label>`).join("")}</div>`;
  if (step === 1) stage = `<h2>How did they reach the safe?</h2><p class="lede">The study has a window, a hall door, and a safe that was opened, not broken. Check the floor plan.</p>
    <div class="opts" role="radiogroup" aria-label="Method">${C.methods.map(m => `<label class="opt"><input type="radio" name="m" value="${m.id}" ${p.m === m.id ? "checked" : ""}><div><b>${esc(m.label)}</b></div></label>`).join("")}</div>`;
  if (step === 2) stage = `<h2>What proves it?</h2><p class="lede">Pick the single piece of evidence that destroys the culprit's alibi.</p>
    <div class="opts" role="radiogroup" aria-label="Evidence">${C.clues.map(c => { const to = st.links[c.id];
      return `<label class="opt"><input type="radio" name="c" value="${c.id}" ${p.c === c.id ? "checked" : ""}><img src="${img(c.img)}" alt=""><div><span class="who">Clue ${c.no} · ${to ? "pinned to " + esc(S_BY[to].short) : "unpinned"}</span><b>${esc(c.title)}</b><span>${esc(st.examined.includes(c.id) ? c.detail : c.text)}</span></div></label>`; }).join("")}</div>`;
  main.innerHTML = `
  <div class="fadeup">
    <div class="eyebrow">Final step</div>
    <h1>The Deduction</h1>
    <div class="wsteps" role="tablist" aria-label="Deduction steps">${names.map((n, i) => `<button role="tab" data-step="${i}" class="${done[i] ? "done" : ""}" ${i === step ? 'aria-current="step" aria-selected="true"' : 'aria-selected="false"'}><span class="n">${done[i] ? "✓" : i + 1}</span><span><b>${n}</b>${subs[i]}</span></button>`).join("")}</div>
    <div class="wizard">
      <div class="stage" id="stage">${stage}
        <div class="stage-nav">${step > 0 ? `<button class="btn" data-go="${step - 1}">← Back</button>` : "<span></span>"}${step < 2 ? `<button class="btn primary" data-go="${step + 1}" ${done[step] ? "" : "disabled"}>Next <span class="arrow">→</span></button>` : ""}</div>
      </div>
      <aside class="verdict" aria-live="polite">
        <div class="eyebrow" style="color:var(--red)">Statement to Scotland Yard</div>
        <h2>Your accusation</h2>
        <div class="sentence">${sentence}</div>
        <button class="btn danger" id="accuse" ${done.every(Boolean) ? "" : "disabled"}>Make the accusation</button>
        <small>${linkCount() < 5 || tested() < 5 ? `You've pinned ${linkCount()}/5 clues and tested ${tested()}/5 alibis. Finishing the board first helps.` : "Your board is complete. Trust your reasoning."}</small>
        ${lastResult ? `<div class="result ${lastResult.cls}">${lastResult.html}</div>` : ""}
        <div class="score-line"><span>Score ${score()}</span><span>False accusations ${st.attempts} · Hints ${st.hints}</span></div>
      </aside>
    </div>
  </div>`;
  $$("input[type=radio]", main).forEach(r => r.addEventListener("change", () => {
    st.pick[r.name] = r.value; save(); lastResult = null;
    renderDeduce(); const el = $(`input[name="${r.name}"][value="${r.value}"]`); if (el) el.focus();
  }));
  $$("[data-go]").forEach(b => b.addEventListener("click", () => { st.step = +b.dataset.go; save(); renderDeduce(); $("#stage h2").focus?.(); }));
  $$("[data-step]").forEach(b => b.addEventListener("click", () => { st.step = +b.dataset.step; save(); renderDeduce(); }));
  $("#accuse").addEventListener("click", accuse);
}
function accuse(){
  const p = st.pick;
  if (p.s === C.culprit && p.m === C.method && p.c === C.proof){
    st.solved = true; st.solvedAt = Date.now(); save(); lastResult = null; updateChrome();
    return reveal();
  }
  st.attempts++; save();
  if (p.s !== C.culprit) lastResult = { cls:"bad", html:`<b>The accusation collapses.</b> ${esc(S_BY[p.s].rebuttal)} <br><br>−15 points.` };
  else if (p.m !== C.method) lastResult = { cls:"warn", html:`<b>Right suspect, wrong route.</b> ${esc(C.methods.find(m => m.id === p.m).rebut)} −15 points.` };
  else lastResult = { cls:"warn", html:`<b>The Yard won't charge on that.</b> "${esc(C_BY[p.c].title)}" doesn't break Julian's alibi. What made it look like he was at the piano? −15 points.` };
  log("fact", "False accusation", lastResult.html.replace(/<[^>]+>/g, ""));
  updateChrome(); renderDeduce();
}
function reveal(){
  const s = S_BY[C.culprit];
  const ov = document.createElement("div");
  ov.className = "reveal"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Case solved");
  ov.innerHTML = `<div class="reveal-inner"><div class="face"><img src="${face(s.id)}" alt="${esc(s.name)}"><span class="stamp">GUILTY</span></div>
    <h2>${esc(s.name)}</h2><p>The pianola played on. The nephew did not.</p><button class="btn primary">Read the case report <span class="arrow">→</span></button></div>`;
  document.body.appendChild(ov);
  const go = () => { ov.remove(); renderSolved(); window.scrollTo(0, 0); };
  $("button", ov).addEventListener("click", go);
  setTimeout(() => $("button", ov).focus(), reduced ? 0 : 2600);
}
function renderSolved(){
  main.className = "";
  const s = S_BY[C.culprit];
  const right = C.clues.filter(c => st.links[c.id] === c.truth).length;
  const mins = Math.max(1, Math.round(((st.solvedAt || Date.now()) - st.startedAt) / 60000));
  const sc = score(), rank = sc >= 90 ? "Consulting Detective" : sc >= 70 ? "Detective Inspector" : sc >= 40 ? "Detective Sergeant" : "Promising Constable";
  main.innerHTML = `<div class="solved fadeup">
    <article class="report">
      <div class="report-hero"><img src="${img(s.id + "-card")}" alt="${esc(s.name)}">
        <div><span class="big-stamp">SOLVED</span><div class="eyebrow" style="color:var(--paper-mute)">Case ${C.number} · Culprit</div><h1 style="margin:6px 0">${esc(s.name)}</h1><div style="color:var(--paper-mute)">${esc(s.role)}</div></div></div>
      <div class="report-body">
        <p>Julian swore he played the piano from nine until half past, and every guest heard music. Nobody saw him. That morning he had bought a pianola roll that plays itself for exactly thirty minutes.</p>
        <div class="chain">
          <div><b>Opportunity</b><span>While the pianola played, he slipped through the hidden connecting door from the drawing room into the study.</span></div>
          <div><b>Means</b><span>As family, he knew the safe's combination. No force, no damage, no witness in the hall.</span></div>
          <div><b>Motive</b><span>A new will, to be signed on Monday, would have cut him out of the Ashworth estate.</span></div>
        </div>
        <div class="score"><div><b>${sc}</b><span>Score</span></div><div><b>${right}/5</b><span>Clues placed right</span></div><div><b>${st.facts.length}/${FACT_TOTAL}</b><span>Facts found</span></div><div><b>${mins}m</b><span>On the case</span></div></div>
        <p class="rank">Rank awarded: ${rank}</p>
      </div>
    </article>
    <div class="center-actions"><a class="btn" href="#/board">Back to the board</a><button class="btn primary" id="again">Reopen a fresh case</button></div>
  </div>`;
  $("#again").addEventListener("click", () => { st = fresh(); st.seenIntro = true; save(); location.hash = "#/board"; route(); toast("Fresh case file opened."); });
}

/* ---------------- router ---------------- */
const main = $("#main");
let current = "";
function route(){
  const h = location.hash.replace(/^#\/?/, "");
  const [view, arg] = h.split("/");
  selected = null; pointer = null; closeDrawer();
  if (!$("#modal").hidden){ $("#modal").hidden = true; }
  if (!view) return st.seenIntro ? (location.hash = "#/board") : (renderIntro(), updateChrome("intro"));
  if (view === "intro"){ renderIntro(); updateChrome("intro"); }
  else if (view === "suspect"){ st.seenIntro = true; save(); renderDossier(arg); updateChrome("suspect"); }
  else if (view === "deduce"){ st.seenIntro = true; save(); renderDeduce(); updateChrome("deduce"); }
  else { st.seenIntro = true; save(); renderBoard(); updateChrome("board"); }
  if (current !== h){ window.scrollTo(0, 0); main.focus({ preventScroll:true }); }
  current = h;
}
function rerender(){
  const v = document.body.dataset.view;
  if (v === "board") renderBoard();
  else if (v === "suspect") renderDossier(location.hash.split("/")[2]);
  updateChrome();
}
window.addEventListener("hashchange", route);
window.addEventListener("resize", () => requestAnimationFrame(() => drawStrings()));
document.addEventListener("click", e => {
  const o = e.target.closest("[data-open]"); if (!o) return;
  ({ help, credits, brief:() => { location.hash = "#/intro"; } })[o.dataset.open]();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape"){ if (!$("#modal").hidden) return closeModal(); if ($("#drawer").classList.contains("open")) return closeDrawer(); if (selected) return select(null); }
  if (e.target.matches("input,textarea") || e.metaKey || e.ctrlKey || e.altKey || !$("#modal").hidden) return;
  if (e.key === "1") location.hash = "#/board";
  else if (e.key === "2") location.hash = "#/suspect/" + (location.hash.split("/")[2] || "hayes");
  else if (e.key === "3") location.hash = "#/deduce";
  else if (e.key.toLowerCase() === "n") openDrawer();
  else if (e.key === "?") help();
});
document.fonts && document.fonts.ready.then(() => drawStrings());
route();
})();

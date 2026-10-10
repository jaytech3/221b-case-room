/* 221B Case Room: a digital detective board */
(() => {
"use strict";

/* ---------------- case data ---------------- */
const SUSPECTS = [
  { id:"hayes", name:"Col. Reginald Hayes", short:"Hayes", role:"Retired army officer", age:61, relation:"Old friend of the host",
    alibi:"I was in the billiard room from nine until the alarm. Ask Barnaby the butler, he racked every frame for me.",
    alibiCheck:"Confirmed by the butler and two other guests.",
    motive:"Heavy gambling debts at his club.",
    rebuttal:"The Colonel's alibi is solid. The butler and two guests place him at the billiard table the whole time. Cigar ash only proves he smoked by the study window earlier in the evening.",
    look:{skin:"#e2b48f",hair:"#d9d4cc",style:"short",hat:"none",coat:"#4a3a2a",extra:["mustache","monocle"]} },
  { id:"marsh", name:"Miss Evelyn Marsh", short:"Marsh", role:"Governess to the household", age:29, relation:"Employed by the host",
    alibi:"I was reading alone in the library. I heard nothing until the commotion.",
    alibiCheck:"No witnesses. The library connects to the study only through the main hall.",
    motive:"Recently given notice of dismissal.",
    rebuttal:"Miss Marsh had no witness, but the gemstone book only shows curiosity. The hall footman would have seen her cross to the study, and he saw no one between nine and half past.",
    look:{skin:"#f0cbab",hair:"#6b3a1f",style:"bun",hat:"none",coat:"#2e3f56",extra:["glasses"]} },
  { id:"lang", name:"Mr. Victor Lang", short:"Lang", role:"Jeweller, Hatton Garden", age:47, relation:"Valued the sapphire last spring",
    alibi:"I left the party at a quarter to nine. My cab driver took me straight home to Hampstead.",
    alibiCheck:"Cab driver and the Hampstead night porter confirm the 8:45 departure.",
    motive:"A rival offered him a fortune for the stone.",
    rebuttal:"Mr. Lang was in a cab to Hampstead before the sapphire was last seen at 9:00. The loupe was dropped during his valuation visit the week before.",
    look:{skin:"#d9a27c",hair:"#2a221c",style:"slick",hat:"bowler",coat:"#22262c",extra:["beard"]} },
  { id:"pell", name:"Dr. Arthur Pell", short:"Pell", role:"Family physician", age:54, relation:"Guest of the host",
    alibi:"At ten past nine a guest fainted in the conservatory. I tended her until the alarm was raised.",
    alibiCheck:"The fainted guest and her husband confirm he never left her side.",
    motive:"His practice is near bankrupt.",
    rebuttal:"Dr. Pell was kneeling beside a fainted guest from 9:10 with two witnesses. The conservatory mud came from the gardener's boots, tracked in that afternoon.",
    look:{skin:"#c98d68",hair:"#8a8580",style:"bald",hat:"none",coat:"#3b3b3b",extra:["glasses","stethoscope"]} },
  { id:"julian", name:"Julian Ashworth", short:"Julian", role:"The host's nephew", age:26, relation:"Heir to the Ashworth estate",
    alibi:"I was playing the piano in the drawing room all evening. Everyone heard me.",
    alibiCheck:"Guests heard music from the drawing room. Nobody actually saw him at the keys.",
    motive:"Disinherited in a new will, to be signed on Monday.",
    rebuttal:"",
    look:{skin:"#f2c9a6",hair:"#c08a3e",style:"wave",hat:"top",coat:"#5a1e22",extra:["cravat"]} },
];

const CLUES = [
  { id:"ash", no:"01", title:"Havana cigar ash", text:"Fresh ash on the study windowsill. Only one guest smokes Havanas.", where:"Study window", truth:"hayes" },
  { id:"book", no:"02", title:"A borrowed book", text:"'A Treatise on Precious Stones' left open on the study desk. Library stamp inside.", where:"Study desk", truth:"marsh" },
  { id:"loupe", no:"03", title:"Jeweller's loupe", text:"A brass 10x loupe under the desk, engraved with the initials V.L.", where:"Under the desk", truth:"lang" },
  { id:"mud", no:"04", title:"Conservatory mud", text:"Damp red soil on the study carpet. It matches the conservatory beds.", where:"Study carpet", truth:"pell" },
  { id:"roll", no:"05", title:"Pianola roll receipt", text:"A receipt for a 30-minute player-piano roll, bought this morning, found in a coat pocket.", where:"Cloakroom", truth:"julian" },
];

const CULPRIT = "julian", KEY_CLUE = "roll";

const TIMELINE = [
  { t:"8:30 pm", d:"Lady Ashworth shows the Blue Duchess sapphire to her guests." },
  { t:"8:45 pm", d:"Mr. Lang leaves by cab." },
  { t:"9:00 pm", d:"Butler sees the sapphire in the study safe, door locked.", key:true },
  { t:"9:00 pm", d:"Piano music begins in the drawing room." },
  { t:"9:10 pm", d:"A guest faints in the conservatory." },
  { t:"9:30 pm", d:"Music stops. Safe found open, sapphire gone.", key:true },
];

/* ---------------- portraits ---------------- */
function portrait(s){
  const L = s.look, id = "p" + s.id;
  const hair = {
    short:`<path d="M33 38c0-12 8-19 17-19s17 7 17 19c-3-6-9-9-17-9s-14 3-17 9z" fill="${L.hair}"/>`,
    bun:`<circle cx="50" cy="18" r="8" fill="${L.hair}"/><path d="M32 42c-1-14 8-22 18-22s19 8 18 22c-3-9-10-13-18-13s-15 4-18 13z" fill="${L.hair}"/>`,
    slick:`<path d="M33 37c0-11 8-17 17-17s17 6 17 17c-6-7-28-7-34 0z" fill="${L.hair}"/>`,
    bald:`<path d="M33 40c0-3 1-5 2-6v8zM67 40c0-3-1-5-2-6v8z" fill="${L.hair}"/>`,
    wave:`<path d="M32 40c-2-14 7-21 18-21 12 0 20 7 18 21-2-5-6-9-11-9-3 3-8 4-12 3-6 0-11 2-13 6z" fill="${L.hair}"/>`,
  }[L.style];
  const hat = {
    none:"",
    top:`<rect x="36" y="4" width="28" height="22" rx="2" fill="#151515"/><rect x="36" y="20" width="28" height="4" fill="#5a1e22"/><ellipse cx="50" cy="26" rx="22" ry="4" fill="#111"/>`,
    bowler:`<path d="M35 26c0-11 7-16 15-16s15 5 15 16z" fill="#1b1b1b"/><ellipse cx="50" cy="26" rx="21" ry="3.6" fill="#111"/>`,
  }[L.hat];
  const ex = L.extra.map(e => ({
    mustache:`<path d="M41 54c3-3 6-3 9-1 3-2 6-2 9 1-3 2-6 2-9 0-3 2-6 2-9 0z" fill="${L.hair}"/>`,
    monocle:`<circle cx="57" cy="42" r="5" fill="rgba(255,255,255,.25)" stroke="#c9a227" stroke-width="1.4"/><path d="M62 44q4 10 2 22" stroke="#c9a227" stroke-width=".8" fill="none"/>`,
    glasses:`<g fill="rgba(255,255,255,.18)" stroke="#2b2b2b" stroke-width="1.3"><circle cx="43" cy="43" r="4.5"/><circle cx="57" cy="43" r="4.5"/></g><path d="M47.5 43h5" stroke="#2b2b2b" stroke-width="1.3"/>`,
    beard:`<path d="M35 46c1 14 7 20 15 20s14-6 15-20c-2 5-6 7-8 7-2-2-5-3-7-3s-5 1-7 3c-2 0-6-2-8-7z" fill="${L.hair}"/>`,
    stethoscope:`<path d="M40 70c0 10 4 16 10 16s10-6 10-16" stroke="#9aa3ad" stroke-width="2" fill="none"/><circle cx="50" cy="87" r="3" fill="#9aa3ad"/>`,
    cravat:`<path d="M44 68l6 8 6-8-6 3z" fill="#f1e6cf"/><circle cx="50" cy="75" r="1.6" fill="#c9a227"/>`,
  }[e])).join("");
  return `<svg viewBox="0 0 100 100" role="img" aria-label="Portrait of ${s.name}">
  <defs><radialGradient id="${id}" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#e9dcc0"/><stop offset="1" stop-color="#a8987a"/></radialGradient></defs>
  <rect width="100" height="100" fill="url(#${id})"/>
  <path d="M14 100c2-20 16-31 36-31s34 11 36 31z" fill="${L.coat}"/>
  <path d="M43 64h14v8l-7 5-7-5z" fill="${L.skin}"/>
  <path d="M42 70l8 10 8-10" fill="none" stroke="#f1e6cf" stroke-width="2.5"/>
  <ellipse cx="50" cy="44" rx="16" ry="19" fill="${L.skin}"/>
  <ellipse cx="34" cy="46" rx="2.5" ry="4" fill="${L.skin}"/><ellipse cx="66" cy="46" rx="2.5" ry="4" fill="${L.skin}"/>
  <circle cx="43.5" cy="43" r="1.6" fill="#2a1d14"/><circle cx="56.5" cy="43" r="1.6" fill="#2a1d14"/>
  <path d="M40 38.5q3.5-2 7 0M53 38.5q3.5-2 7 0" stroke="${L.hair === "#d9d4cc" ? "#9c968d" : L.hair}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M50 45v6l-2 1" stroke="rgba(0,0,0,.25)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M45 57q5 2.5 10 0" stroke="#8a4f3c" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  ${hair}${ex}${hat}
  <rect width="100" height="100" fill="#704214" opacity=".12"/>
  </svg>`;
}
const gemSVG = `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7aa2ff"/><stop offset="1" stop-color="#1a3a9c"/></linearGradient></defs><path d="M32 4 54 22 32 60 10 22Z" fill="url(#gm)" stroke="#c9a227" stroke-width="2"/><path d="M10 22h44M22 22l10-18 10 18-10 38" fill="none" stroke="#dbe5ff" stroke-width="1.2" opacity=".6"/></svg>`;

/* ---------------- state ---------------- */
const KEY = "221b-case-room-v1";
const fresh = () => ({ links:{}, notes:{}, attempts:0, solved:false, accused:null, startedAt:Date.now(), solvedAt:null });
let state;
try { state = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { state = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

const sById = id => SUSPECTS.find(s => s.id === id);
const cById = id => CLUES.find(c => c.id === id);
const linkCount = () => Object.keys(state.links).length;
const cluesFor = sid => CLUES.filter(c => state.links[c.id] === sid);
const status = () => state.solved ? "solved" : (linkCount() || state.attempts) ? "progress" : "open";
const STATUS_LABEL = { open:"Open", progress:"In Progress", solved:"Solved" };

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const main = $("#main");

let toastT;
function toast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2400);
}
function updateChrome(view){
  const s = status(), pill = $("#statusPill");
  pill.dataset.s = s; pill.textContent = "Case " + STATUS_LABEL[s];
  $$(".tabs a").forEach(a => { if (a.dataset.tab === view) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
}

function link(clueId, suspectId){
  const prev = state.links[clueId];
  state.links[clueId] = suspectId; save();
  const c = cById(clueId), s = sById(suspectId);
  toast(prev && prev !== suspectId ? `Clue ${c.no} moved to ${s.short}` : `Clue ${c.no} pinned to ${s.short}`);
}
function unlink(clueId){ delete state.links[clueId]; save(); toast(`Clue ${cById(clueId).no} unpinned`); }

/* ---------------- shared bits ---------------- */
function stepsPanel(){
  const s = status(), n = linkCount();
  const steps = [
    { label:"Case opened", done:true },
    { label:`Connect clues (${n}/5)`, done:n === 5, now:s !== "solved" && n < 5 },
    { label:"Name the culprit", done:state.solved, now:n === 5 && !state.solved },
    { label:"Case solved", done:state.solved },
  ];
  return `<section class="panel"><h2>Case status</h2><ol class="steps">${steps.map((st,i) =>
    `<li class="${st.done ? "done" : ""} ${st.now ? "now" : ""}"><span class="dot">${st.done ? "✓" : i + 1}</span>${st.label}</li>`).join("")}</ol></section>`;
}
function timelinePanel(){
  return `<section class="panel"><h2>Timeline of the evening</h2><ol class="timeline">${TIMELINE.map(e =>
    `<li class="${e.key ? "key" : ""}"><time>${e.t}</time>${esc(e.d)}</li>`).join("")}</ol></section>`;
}

/* ---------------- screen 1: case board ---------------- */
let selected = null, pointer = null;

function renderBoard(){
  const n = linkCount();
  main.innerHTML = `
  <div class="fade">
    <div class="board-head">
      <div>
        <div class="eyebrow">Case No. 221B · The Blue Duchess</div>
        <h1>The Case Board</h1>
        <p class="lede">A sapphire vanished from Lady Ashworth's study between 9:00 and 9:30 pm. Five guests, five alibis, five clues. Pin each clue to the suspect it points against.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-end">
        <div class="progress"><span>${n}/5 connected</span><div class="bar"><i style="width:${n * 20}%"></i></div></div>
        <a class="btn primary" href="#/deduce">${state.solved ? "View verdict" : "Make a deduction"} →</a>
      </div>
    </div>
    <div class="layout">
      <section class="cork" id="cork" aria-label="Detective board">
        <svg id="strings" aria-hidden="true"></svg>
        <span class="zone-label">Suspects</span>
        <div class="suspects">${SUSPECTS.map(s => {
          const c = cluesFor(s.id).length;
          return `<button class="suspect ${c ? "has" : ""} ${state.solved && s.id === CULPRIT ? "accused" : ""}" data-sid="${s.id}"
            aria-label="${esc(s.name)}, ${c} clue${c === 1 ? "" : "s"} pinned. Open profile">
            <span class="pin"></span><span class="pin bottom"></span>
            <span class="count">${c}</span>
            <span class="photo">${portrait(s)}</span>
            <div class="name">${esc(s.name)}</div><div class="role">${esc(s.role)}</div>
          </button>`; }).join("")}</div>
        <span class="zone-label">Evidence</span>
        <div class="clues">${CLUES.map(c => {
          const to = state.links[c.id];
          return `<div class="clue ${to ? "linked" : ""}" draggable="true" data-cid="${c.id}" tabindex="0" role="button"
            aria-pressed="false" aria-label="Clue ${c.no}: ${esc(c.title)}. ${to ? "Pinned to " + esc(sById(to).short) : "Not pinned"}. Press to select, then choose a suspect">
            <span class="pin"></span>
            <button class="unlink" data-unlink="${c.id}" aria-label="Unpin clue ${c.no}" title="Unpin">×</button>
            <span class="no">CLUE ${c.no} · ${esc(c.where.toUpperCase())}</span>
            <h3>${esc(c.title)}</h3>
            <p>${esc(c.text)}</p>
            <span class="tag">${to ? `Pinned to <b>${esc(sById(to).short)}</b>` : "Drag onto a suspect"}</span>
          </div>`; }).join("")}</div>
        <div class="hint" id="hint">Drag a clue onto a suspect, or tap a clue then tap a suspect. Tap a photo to open the dossier.</div>
      </section>
      <aside class="side">
        <section class="panel brief"><div class="gem">${gemSVG}<div><div class="eyebrow">Stolen</div><h2 style="margin:0">The Blue Duchess</h2></div></div>
          <p>A 42-carat Kashmir sapphire, kept in the study safe. No forced entry. Only family knew the combination.</p></section>
        ${stepsPanel()}
        ${timelinePanel()}
        <button class="btn ghost" id="reset">Reset case</button>
      </aside>
    </div>
  </div>`;
  bindBoard();
  updateChrome("board");
  requestAnimationFrame(drawStrings);
}

function anchor(el, cork, where){
  const r = el.getBoundingClientRect(), c = cork.getBoundingClientRect();
  return { x:r.left - c.left + r.width / 2, y:(where === "top" ? r.top : r.bottom) - c.top };
}
function curve(a, b){
  const sag = Math.min(60, Math.abs(a.x - b.x) * .15 + 20);
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + sag;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
}
function drawStrings(){
  const cork = $("#cork"), svg = $("#strings");
  if (!cork || !svg) return;
  let d = "";
  for (const [cid, sid] of Object.entries(state.links)){
    const ce = $(`.clue[data-cid="${cid}"]`, cork), se = $(`.suspect[data-sid="${sid}"]`, cork);
    if (ce && se) d += `<path d="${curve(anchor(ce, cork, "top"), anchor(se, cork, "bottom"))}"/>`;
  }
  if (selected && pointer){
    const ce = $(`.clue[data-cid="${selected}"]`, cork);
    if (ce) d += `<path class="ghost" d="${curve(anchor(ce, cork, "top"), pointer)}"/>`;
  }
  svg.innerHTML = d;
}

function select(cid){
  selected = selected === cid ? null : cid;
  $$(".clue").forEach(el => { const on = el.dataset.cid === selected; el.classList.toggle("selected", on); el.setAttribute("aria-pressed", on); });
  $$(".suspect").forEach(el => el.classList.toggle("target", !!selected));
  const hint = $("#hint");
  if (hint) hint.innerHTML = selected
    ? `Clue ${cById(selected).no} selected. Now choose the suspect it points to. <kbd>Esc</kbd> to cancel`
    : "Drag a clue onto a suspect, or tap a clue then tap a suspect. Tap a photo to open the dossier.";
  if (!selected) pointer = null;
  drawStrings();
}

function bindBoard(){
  const cork = $("#cork");
  $$(".clue", cork).forEach(el => {
    el.addEventListener("click", e => {
      if (e.target.closest("[data-unlink]")) return;
      select(el.dataset.cid);
    });
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); select(el.dataset.cid); } });
    el.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", el.dataset.cid); e.dataTransfer.effectAllowed = "link"; el.classList.add("dragging"); select(el.dataset.cid); });
    el.addEventListener("dragend", () => { el.classList.remove("dragging"); if (selected) select(null); });
  });
  $$("[data-unlink]", cork).forEach(b => b.addEventListener("click", e => { e.stopPropagation(); unlink(b.dataset.unlink); selected = null; renderBoard(); }));
  $$(".suspect", cork).forEach(el => {
    el.addEventListener("click", () => {
      if (selected){ link(selected, el.dataset.sid); selected = null; renderBoard(); }
      else location.hash = "#/suspect/" + el.dataset.sid;
    });
    el.addEventListener("dragover", e => { e.preventDefault(); el.classList.add("drop"); });
    el.addEventListener("dragleave", () => el.classList.remove("drop"));
    el.addEventListener("drop", e => {
      e.preventDefault(); const cid = e.dataTransfer.getData("text/plain");
      if (cid){ link(cid, el.dataset.sid); selected = null; renderBoard(); }
    });
  });
  cork.addEventListener("pointermove", e => {
    if (!selected) return;
    const c = cork.getBoundingClientRect(); pointer = { x:e.clientX - c.left, y:e.clientY - c.top }; drawStrings();
  });
  cork.addEventListener("dragover", e => {
    if (!selected) return;
    const c = cork.getBoundingClientRect(); pointer = { x:e.clientX - c.left, y:e.clientY - c.top }; drawStrings();
  });
  $("#reset").addEventListener("click", () => {
    if (confirm("Reset the case? All pinned clues, notes and accusations will be cleared.")){ state = fresh(); save(); selected = null; renderBoard(); updateChrome("board"); toast("Case reset. Fresh start, detective."); }
  });
}

/* ---------------- screen 2: suspect profile ---------------- */
function renderProfile(sid){
  const s = sById(sid) || SUSPECTS[0];
  const pinned = cluesFor(s.id), idx = SUSPECTS.indexOf(s);
  const prev = SUSPECTS[(idx + 4) % 5], next = SUSPECTS[(idx + 1) % 5];
  const unpinned = CLUES.filter(c => !state.links[c.id]);
  main.innerHTML = `
  <div class="fade">
    <a href="#/board" class="btn ghost">← Back to board</a>
    <nav class="profile-nav" aria-label="All suspects">${SUSPECTS.map(x =>
      `<a href="#/suspect/${x.id}" ${x.id === s.id ? 'aria-current="true"' : ""}><span class="mini">${portrait(x)}</span>${esc(x.short)}${cluesFor(x.id).length ? ` · ${cluesFor(x.id).length}` : ""}</a>`).join("")}</nav>
    <div class="dossier">
      <div>
        <div class="polaroid"><div class="photo">${portrait(s)}</div><div class="cap">Suspect ${idx + 1} of 5 · ${esc(s.short)}</div></div>
      </div>
      <article class="file">
        <div class="eyebrow" style="color:var(--red)">Suspect dossier</div>
        <h1>${esc(s.name)}</h1>
        <div class="role">${esc(s.role)}</div>
        <dl class="facts">
          <div><dt>Age</dt><dd>${s.age}</dd></div>
          <div><dt>Connection</dt><dd>${esc(s.relation)}</dd></div>
          <div><dt>Possible motive</dt><dd>${esc(s.motive)}</dd></div>
        </dl>
        <div class="section">
          <h2>Alibi <span class="chip">STATEMENT</span></h2>
          <blockquote class="quote">“${esc(s.alibi)}”</blockquote>
          <p style="margin:10px 0 0;font-size:14px;color:var(--paper-mute)"><b style="color:var(--paper-ink)">Verified:</b> ${esc(s.alibiCheck)}</p>
        </div>
        <div class="section">
          <h2>Clues pinned <span class="chip">${pinned.length}</span></h2>
          <div class="evidence">${pinned.length ? pinned.map(c =>
            `<div class="ev"><span class="no">CLUE ${c.no}</span><div><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>
             <button class="btn" data-unlink="${c.id}">Unpin</button></div>`).join("")
            : `<div class="empty">No clues pinned to ${esc(s.short)} yet.</div>`}
          </div>
          ${unpinned.length ? `<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span style="font-size:13px;color:var(--paper-mute)">Pin an unassigned clue:</span>
            ${unpinned.map(c => `<button class="btn ghost" style="color:var(--paper-ink);border-color:#cbb994;padding:6px 10px;font-size:12px" data-pin="${c.id}">+ ${c.no} ${esc(c.title)}</button>`).join("")}
          </div>` : ""}
        </div>
        <div class="section notes">
          <h2><label for="notes">Detective's notes</label></h2>
          <textarea id="notes" placeholder="What doesn't add up about ${esc(s.short)}?">${esc(state.notes[s.id] || "")}</textarea>
        </div>
        <div class="file-actions">
          <a class="btn ghost" href="#/suspect/${prev.id}">← ${esc(prev.short)}</a>
          <a class="btn ghost" href="#/suspect/${next.id}">${esc(next.short)} →</a>
          <a class="btn primary" style="margin-left:auto" href="#/deduce?s=${s.id}">Accuse ${esc(s.short)}</a>
        </div>
      </article>
    </div>
  </div>`;
  $$("[data-unlink]").forEach(b => b.addEventListener("click", () => { unlink(b.dataset.unlink); renderProfile(s.id); updateChrome("suspect"); }));
  $$("[data-pin]").forEach(b => b.addEventListener("click", () => { link(b.dataset.pin, s.id); renderProfile(s.id); updateChrome("suspect"); }));
  let nt; $("#notes").addEventListener("input", e => { clearTimeout(nt); nt = setTimeout(() => { state.notes[s.id] = e.target.value; save(); }, 300); });
}

/* ---------------- screen 3: deduction ---------------- */
let pick = { s:null, c:null }, lastResult = null;

function renderDeduce(pre){
  if (state.solved) return renderSolved();
  if (pre && sById(pre)) pick.s = pre;
  const n = linkCount();
  const sentence = `I accuse <${pick.s ? "em" : "span class='blank'"}>${pick.s ? esc(sById(pick.s).name) : "the culprit"}</${pick.s ? "em" : "span"}> of stealing the Blue Duchess. The proof is <${pick.c ? "em" : "span class='blank'"}>${pick.c ? esc(cById(pick.c).title.toLowerCase()) : "the key evidence"}</${pick.c ? "em" : "span"}>.`;
  main.innerHTML = `
  <div class="fade">
    <div class="eyebrow">Final step</div>
    <h1>The Deduction</h1>
    <p class="lede">Choose the thief and the single piece of evidence that breaks their alibi. A false accusation is recorded on the file.</p>
    <div class="deduce">
      <div>
        <h2 class="step-h"><span class="n">1</span>Who took the sapphire?</h2>
        <div class="lineup" role="radiogroup" aria-label="Choose a suspect">${SUSPECTS.map(s => `
          <label class="pick"><input type="radio" name="s" value="${s.id}" ${pick.s === s.id ? "checked" : ""}>
            <span class="tick">✓</span><span class="photo">${portrait(s)}</span>
            <div class="nm">${esc(s.name)}</div><div class="meta">${cluesFor(s.id).length} clue${cluesFor(s.id).length === 1 ? "" : "s"} pinned</div></label>`).join("")}
        </div>
        <h2 class="step-h"><span class="n">2</span>Which evidence breaks the alibi?</h2>
        <div class="ev-pick" role="radiogroup" aria-label="Choose the key evidence">${CLUES.map(c => {
          const to = state.links[c.id];
          return `<label><input type="radio" name="c" value="${c.id}" ${pick.c === c.id ? "checked" : ""}>
            <div><span class="who">Clue ${c.no} · ${to ? "pinned to " + esc(sById(to).short) : "unpinned"}</span><b>${esc(c.title)}</b><span>${esc(c.text)}</span></div></label>`; }).join("")}
        </div>
      </div>
      <aside class="verdict" aria-live="polite">
        <div class="eyebrow" style="color:var(--red)">Statement to Scotland Yard</div>
        <h2>Name the culprit</h2>
        <div class="sentence">${sentence}</div>
        <button class="btn danger" id="accuse" ${pick.s && pick.c ? "" : "disabled"}>Make the accusation</button>
        <small>${n < 5 ? `Tip: you've connected ${n} of 5 clues. Finish the board first for a clearer picture.` : "All clues are on the board. Trust your reasoning."}</small>
        ${lastResult ? `<div class="result bad">${lastResult}</div>` : ""}
        ${state.attempts ? `<div class="attempts">False accusations on file: ${state.attempts}</div>` : ""}
      </aside>
    </div>
  </div>`;
  $$('input[name="s"]').forEach(i => i.addEventListener("change", () => { pick.s = i.value; lastResult = null; renderDeduce(); $(`input[name="s"][value="${i.value}"]`).focus(); }));
  $$('input[name="c"]').forEach(i => i.addEventListener("change", () => { pick.c = i.value; lastResult = null; renderDeduce(); $(`input[name="c"][value="${i.value}"]`).focus(); }));
  $("#accuse").addEventListener("click", accuse);
}

function accuse(){
  if (pick.s === CULPRIT && pick.c === KEY_CLUE){
    state.solved = true; state.accused = CULPRIT; state.solvedAt = Date.now(); save();
    lastResult = null; updateChrome("deduce"); renderSolved(); window.scrollTo({ top:0, behavior:"smooth" }); return;
  }
  state.attempts++; save();
  if (pick.s === CULPRIT) lastResult = `<b>Right instinct, wrong proof.</b> "${esc(cById(pick.c).title)}" doesn't break Julian's alibi. Ask yourself: did anyone actually <i>see</i> him at the piano?`;
  else lastResult = `<b>The accusation collapses.</b> ${esc(sById(pick.s).rebuttal)}`;
  updateChrome("deduce"); renderDeduce();
}

function renderSolved(){
  const s = sById(CULPRIT);
  const correct = CLUES.filter(c => state.links[c.id] === c.truth).length;
  const mins = Math.max(1, Math.round(((state.solvedAt || Date.now()) - state.startedAt) / 60000));
  const rank = state.attempts === 0 && correct === 5 ? "Consulting Detective" : state.attempts <= 1 ? "Detective Inspector" : "Promising Constable";
  main.innerHTML = `
  <div class="solved fade">
    <div class="eyebrow">Case No. 221B</div>
    <div class="stamp">SOLVED</div>
    <article class="report">
      <div class="row"><span class="photo">${portrait(s)}</span>
        <div><div class="eyebrow" style="color:var(--red)">Culprit</div><h2 style="margin:2px 0">${esc(s.name)}</h2><div style="color:var(--paper-mute)">${esc(s.role)}</div></div></div>
      <p><b>The alibi:</b> Julian claimed he played piano in the drawing room all evening, and every guest heard music.</p>
      <p><b>The flaw:</b> the receipt shows he bought a 30-minute player-piano roll that morning. The music started at 9:00 and stopped at 9:30, exactly the window of the theft. The piano played itself while Julian, who as family knew the safe combination, slipped into the study.</p>
      <p><b>The motive:</b> a new will, to be signed on Monday, would have cut him out of the estate.</p>
      <div class="score">
        <div><b>${correct}/5</b><span>Clues placed right</span></div>
        <div><b>${state.attempts}</b><span>False accusations</span></div>
        <div><b>${mins} min</b><span>Time on case</span></div>
      </div>
      <p style="text-align:center;margin:0">Rank awarded: <b>${rank}</b></p>
    </article>
    <div class="center-actions">
      <a class="btn" href="#/board">Back to the board</a>
      <button class="btn primary" id="again">Reopen a fresh case</button>
    </div>
  </div>`;
  $("#again").addEventListener("click", () => { state = fresh(); save(); pick = { s:null, c:null }; location.hash = "#/board"; route(); toast("New case opened."); });
}

/* ---------------- router ---------------- */
function route(){
  const h = location.hash.replace(/^#\/?/, "") || "board";
  const [path, query] = h.split("?");
  const [view, arg] = path.split("/");
  selected = null; pointer = null;
  if (view === "suspect"){ renderProfile(arg); updateChrome("suspect"); }
  else if (view === "deduce"){ renderDeduce(new URLSearchParams(query || "").get("s")); updateChrome("deduce"); }
  else { renderBoard(); updateChrome("board"); }
  main.focus({ preventScroll:true });
  if (view !== "deduce" || !query) window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route);
window.addEventListener("resize", () => requestAnimationFrame(drawStrings));
document.addEventListener("keydown", e => { if (e.key === "Escape" && selected) select(null); });
document.fonts && document.fonts.ready.then(() => drawStrings());
route();
})();

/* Egerton Connect - demo in plain JavaScript.
   Profiles show photos, details and current location. Contact numbers are locked until unlocked.
   Data is saved in this browser only, and the people you see are samples.
   A real launch needs a backend (for example Supabase) for accounts, photos and payments. */

const KEY = "egertonConnect.v2";
const GENDERS = [["woman", "Woman"], ["man", "Man"], ["nonbinary", "Non-binary"]];

const ZONES = ["Egerton main campus", "Egerton area", "Njoro town", "Njoro, near the market", "Nakuru town", "Elsewhere nearby"];

const PROFILES = [
  { id: "p1", name: "Sunrise", gender: "woman", loc: "Njoro town", bio: "Early riser, loves sunrise walks and a good chapati.", interests: ["Hiking", "Cooking", "Gospel music"], contact: "0700 000 001" },
  { id: "p2", name: "Pixel", gender: "man", loc: "Egerton main campus", bio: "Building small apps and losing at FIFA. Looking for good conversation.", interests: ["Coding", "Football", "Chess"], contact: "0700 000 002", blur: true },
  { id: "p3", name: "Mara", gender: "woman", loc: "Njoro, near the market", bio: "Cheerful and always up for a movie night.", interests: ["Movies", "Dancing", "Volunteering"], contact: "0700 000 003" },
  { id: "p4", name: "Kito", gender: "man", loc: "Nakuru town", bio: "Gym in the morning, busy at night. Serious about kind people.", interests: ["Gym", "Cars", "Afrobeats"], contact: "0700 000 004" },
  { id: "p5", name: "Zuri", gender: "woman", loc: "Egerton main campus", bio: "Still finding my way around. Show me the best food spots.", interests: ["Reading", "Poetry", "Food"], contact: "0700 000 005", blur: true },
  { id: "p6", name: "Maestro", gender: "man", loc: "Njoro town", bio: "Lab rat with a guitar. Free time is rare but real.", interests: ["Guitar", "Science", "Coffee"], contact: "0700 000 006" },
  { id: "p7", name: "Nia", gender: "woman", loc: "Nakuru town", bio: "Budget spreadsheets and bubble tea. Honest people only.", interests: ["Finance", "Travel", "Photography"], contact: "0700 000 007" },
  { id: "p8", name: "Greenthumb", gender: "man", loc: "Egerton area", bio: "Tree planter and weekend footballer.", interests: ["Nature", "Football", "Photography"], contact: "0700 000 008" },
  { id: "p9", name: "Echo", gender: "nonbinary", loc: "Njoro town", bio: "Podcasts, thrift finds and long talks about nothing.", interests: ["Podcasts", "Fashion", "Writing"], contact: "0700 000 009", blur: true },
  { id: "p10", name: "Cupcake", gender: "woman", loc: "Egerton main campus", bio: "I bake on weekends and share the results.", interests: ["Baking", "Netflix", "Running"], contact: "0700 000 010" },
  { id: "p11", name: "Dusk", gender: "man", loc: "Njoro, near the market", bio: "Calm, likes quiet evenings and good music.", interests: ["Music", "Farming", "Cycling"], contact: "0700 000 011" },
  { id: "p12", name: "Puzzle", gender: "nonbinary", loc: "Egerton area", bio: "Puzzles, board games and kind people. Say hi.", interests: ["Board games", "Puzzles", "Anime"], contact: "0700 000 012" },
];

/* ---------- State ---------- */

function fresh() { return { me: null, unlocked: [] }; }
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.me ? Object.assign(fresh(), s) : fresh(); }
  catch (e) { return fresh(); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked */ } }

let state = load();
let view = state.me ? "browse" : "welcome";
let step = 1;
const STEPS = 3;
let draftPhotos = [];
let unlockId = null;

const app = document.getElementById("app");
const byId = (id) => PROFILES.find((p) => p.id === id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hue = (id) => (id.split("").reduce((a, c) => a + c.charCodeAt(0) * 17, 0) % 360);
const avatar = (p, cls) => `<div class="avatar ${cls || ""}" style="--h:${hue(p.id || p.name)}" aria-hidden="true">${esc(p.name[0])}</div>`;
const genderLabel = (g) => (GENDERS.find((x) => x[0] === g) || [g, g])[1];
const mask = (c) => c.slice(0, 2) + " •• ••• •••";
const tel = (c) => c.replace(/[^\d+]/g, "");
const photoOf = (p, blurred) => (p.photos && p.photos[0] ? `<img class="photo${blurred ? " blurred" : ""}" src="${esc(p.photos[0])}" alt="Photo of ${esc(p.name)}" />` : avatar(p));

function svgAvatar(p) {
  const h = hue(p.id);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 55% 62%)"/><stop offset="1" stop-color="hsl(${(h + 50) % 360} 55% 35%)"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="200" cy="120" r="52" fill="rgba(255,255,255,0.85)"/><path d="M80 300c0-72 54-112 120-112s120 40 120 112z" fill="rgba(255,255,255,0.85)"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
PROFILES.forEach((p) => { p.photos = [svgAvatar(p)]; });

/* ---------- Views ---------- */

function welcomeView() {
  const mini = (id, line) => { const p = byId(id); return `<div class="fc fc-${id}">${avatar(p, "sm")}<div><strong>${esc(p.name)}</strong><span>${esc(line)}</span></div></div>`; };
  return `
  <main class="landing-page">
    <header class="l-top"><span class="brand">Egerton Connect</span><button class="btn sun small" data-act="start">Join free</button></header>
    <section class="hero">
      <div class="hero-in">
        <div class="hero-copy">
          <span class="pill reveal" style="--d:0s">For the whole Egerton community, 18+</span>
          <h1 class="reveal" style="--d:.1s">Meet someone <em>around Egerton.</em></h1>
          <p class="lead reveal" style="--d:.2s">Create a profile with your photos and where you are. Browse people nearby and unlock their contact when you're ready.</p>
          <button class="btn sun big reveal" style="--d:.3s" data-act="start">Create my profile</button>
          <p class="fine reveal" style="--d:.4s">Free to join. Just 3 quick steps.</p>
        </div>
        <div class="hero-art reveal" style="--d:.35s" aria-hidden="true">
          ${mini("p1", "Now in Njoro town")}
          ${mini("p2", "Now at Egerton main campus")}
          <div class="fc fc-match"><strong>Contact unlocked</strong></div>
          ${mini("p7", "Now in Nakuru town")}
        </div>
      </div>
    </section>
    <section class="how">
      <h2>How it works</h2>
      <div class="steps3">
        <div class="how-card"><span class="num">1</span><h3>Create your profile</h3><p>Add photos, where you are and a few words about you.</p></div>
        <div class="how-card"><span class="num">2</span><h3>Browse people</h3><p>See who is around Egerton and read their profiles.</p></div>
        <div class="how-card"><span class="num">3</span><h3>Unlock contact</h3><p>Found someone you like? Unlock their contact and reach out yourself.</p></div>
      </div>
    </section>
    <section class="final">
      <h2>Ready to meet someone?</h2>
      <button class="btn sun big" data-act="start">Create my profile</button>
      <p class="fine">Early preview: sample profiles are shown until more people join.</p>
    </section>
    <div class="sticky-cta"><button class="btn sun" data-act="start">Create my profile</button></div>
  </main>`;
}

function thumbsHtml() {
  return draftPhotos.map((src, i) => `<div class="th"><img src="${esc(src)}" alt="Your photo ${i + 1}" /><button type="button" data-act="rmphoto" data-i="${i}" aria-label="Remove photo ${i + 1}">&times;</button></div>`).join("");
}

function formView() {
  const me = state.me || {};
  const editing = !!state.me;
  const seeking = me.seeking || [];
  const chip = (type, name, g, on) => `<label class="chip"><input type="${type}" name="${name}" value="${g[0]}" ${on ? "checked" : ""} /><span>${g[1]}</span></label>`;
  const nameF = `<div class="field"><label for="name">Choose a nickname</label><input id="name" name="name" type="text" maxlength="30" autocomplete="off" placeholder="e.g. Sunrise" value="${esc(me.name || "")}" /><div class="hint">Shown to everyone, so please do not use your real name.</div></div>`;
  const genderF = `<div class="field"><fieldset><legend>I am</legend><div class="chips">${GENDERS.map((g) => chip("radio", "gender", g, me.gender === g[0])).join("")}</div></fieldset></div>`;
  const seekF = `<div class="field"><fieldset><legend>I want to meet</legend><div class="chips">${GENDERS.map((g) => chip("checkbox", "seeking", g, seeking.includes(g[0]))).join("")}</div><div class="hint">Pick one or more.</div></fieldset></div>`;
  const locF = `<div class="field"><label for="location">Current area</label><select id="location" name="location"><option value="">Choose an area</option>${ZONES.map((z) => `<option ${me.location === z ? "selected" : ""}>${z}</option>`).join("")}</select><div class="hint">A general area only, so nobody can find your exact spot.</div></div>`;
  const bioF = `<div class="field"><label for="bio">About me <span class="hint">(optional)</span></label><textarea id="bio" name="bio" maxlength="200" placeholder="A line or two about you">${esc(me.bio || "")}</textarea></div>`;
  const intF = `<div class="field"><label for="interests">Interests <span class="hint">(optional)</span></label><input id="interests" name="interests" type="text" placeholder="Football, Movies, Coding" value="${esc((me.interests || []).join(", "))}" /><div class="hint">Separate with commas. Up to 4.</div></div>`;
  const photoF = `<div class="field"><label for="photos">Photos <span class="hint">(optional, up to 3)</span></label><input id="photos" type="file" accept="image/*" multiple /><div class="thumbs" id="thumbs">${thumbsHtml()}</div></div>`;
  const contactF = `<div class="field"><label for="contact">Phone or WhatsApp number</label><input id="contact" name="contact" type="tel" maxlength="20" placeholder="07XX XXX XXX" value="${esc(me.contact || "")}" /><div class="hint">Hidden from everyone until they unlock it.</div></div>`;
  const consentF = `<label class="check"><input type="checkbox" name="consent" /> <span>I am 18 or older and I will treat people with respect.</span></label>`;
  const blurF = `<label class="check"><input type="checkbox" name="blur" ${me.blur ? "checked" : ""} /> <span>Blur my photos until someone unlocks my contact.</span></label>`;
  const errBox = `<div class="error" id="formError" role="alert" hidden></div>`;

  if (editing) {
    return `<div class="topbar"><h2>Edit profile</h2></div>
    <form class="form" data-form="profile" novalidate>${errBox}${nameF}${genderF}${seekF}${locF}${bioF}${intF}${photoF}${blurF}${contactF}
      <button class="btn" type="submit">Save changes</button>
      <button class="btn ghost" type="button" data-act="nav" data-to="profile">Cancel</button></form>`;
  }
  return `<div class="topbar"><h2>Create your profile</h2><span class="tag" id="stepLabel">Step 1 of 3</span></div>
  <div class="progress" aria-hidden="true"><div id="bar"></div></div>
  <form class="form" data-form="profile" novalidate>${errBox}
    <section class="step" data-step="1"><h3 class="step-title">First, the basics</h3>${nameF}${genderF}${seekF}</section>
    <section class="step" data-step="2" hidden><h3 class="step-title">About you</h3>${locF}${bioF}${intF}</section>
    <section class="step" data-step="3" hidden><h3 class="step-title">Photos and contact</h3>${photoF}${blurF}${contactF}${consentF}</section>
    <div class="step-nav">
      <button class="btn ghost" type="button" data-act="prev">Back</button>
      <button class="btn" type="button" id="nextBtn" data-act="next">Next</button>
      <button class="btn sun" type="submit" id="doneBtn" hidden>Publish my profile</button>
    </div>
  </form>`;
}

function cardHtml(p) {
  const open = state.unlocked.includes(p.id);
  const contact = open
    ? `<a class="contact" href="tel:${esc(tel(p.contact))}">${esc(p.contact)}</a>`
    : `<div class="lock"><span>${esc(mask(p.contact))}</span><button class="btn small sun" data-act="unlock" data-id="${p.id}">Unlock contact</button></div>`;
  return `<article class="card">${photoOf(p, p.blur && !open)}<div class="body">
    <h3>${esc(p.name)}</h3><p class="loc">Now in ${esc(p.loc)}</p>${p.blur && !open ? `<p class="hint">Photo is blurred until you unlock contact.</p>` : ""}
    ${p.bio ? `<p>${esc(p.bio)}</p>` : ""}
    <div class="tags">${(p.interests || []).map((i) => `<span>${esc(i)}</span>`).join("")}</div>${contact}</div></article>`;
}

function browseView() {
  const list = PROFILES.filter((p) => state.me.seeking.includes(p.gender));
  return `<div class="topbar"><h2>Browse</h2><span class="tag">18+</span></div>
    ${list.length ? `<div class="cards">${list.map(cardHtml).join("")}</div>` : `<div class="empty"><h3>No profiles yet</h3><p>More people will appear as more members join.</p></div>`}`;
}

function profileView() {
  const m = state.me;
  return `<div class="topbar"><h2>My profile</h2></div>
  <div class="profile">
    <div class="card">${photoOf(m)}<div class="body">
      <h3>${esc(m.name)}</h3><p class="loc">Now in ${esc(m.location)}</p>
      <p class="meta">${esc(genderLabel(m.gender))}. Meeting: ${m.seeking.map(genderLabel).join(", ")}</p>
      ${m.bio ? `<p>${esc(m.bio)}</p>` : ""}
      <div class="tags">${(m.interests || []).map((i) => `<span>${esc(i)}</span>`).join("")}</div>
      <p class="hint" style="margin-top:14px">Your contact (${esc(m.contact)}) stays hidden from others until they unlock it.</p>
    </div></div>
    <button class="btn" data-act="edit">Edit profile</button>
    <div class="box"><h3>Stay safe</h3><ul>
      <li>Meet in public places first.</li>
      <li>Tell a friend where you are going.</li>
      <li>Never send money to someone you met here.</li>
      <li>Share only a general location, never your exact address.</li></ul></div>
    <button class="btn danger" data-act="delete">Delete my account</button>
  </div>`;
}

function navView() {
  const tab = (to, label) => `<button data-act="nav" data-to="${to}" ${view === to ? 'aria-current="page"' : ""}>${label}</button>`;
  return `<nav class="nav" aria-label="Main">${tab("browse", "Browse")}${tab("profile", "My profile")}</nav>`;
}

function unlockModal() {
  if (!unlockId) return "";
  const p = byId(unlockId);
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Unlock contact"><div class="modal">
    ${avatar(p, "sm")}<h2>Unlock ${esc(p.name)}'s contact</h2>
    <p>In the live version, contact access will be a paid feature. Payments are not switched on in this preview, so you can unlock for free.</p>
    <button class="btn sun" data-act="confirmunlock">Unlock (demo)</button>
    <button class="btn ghost" data-act="closeunlock">Not now</button></div></div>`;
}

/* ---------- Sign-up steps ---------- */

function validate(data, editing) {
  const digits = (data.get("contact") || "").toString().replace(/\D/g, "");
  if (!(data.get("name") || "").toString().trim()) return ["Choose a nickname.", 1];
  if (!data.get("gender")) return ["Choose who you are.", 1];
  if (!data.getAll("seeking").length) return ["Choose who you want to meet.", 1];
  if (!(data.get("location") || "").toString().trim()) return ["Choose your current area.", 2];
  if (digits.length < 9) return ["Enter a valid phone number.", 3];
  if (!editing && !data.get("consent")) return ["Please confirm you are 18 or older.", 3];
  return null;
}

function showError(msg) {
  const box = document.getElementById("formError");
  if (box) { box.textContent = msg; box.hidden = false; }
}

function showStep(n) {
  step = n;
  const next = document.getElementById("nextBtn");
  if (!next) return;
  document.querySelectorAll(".step").forEach((el) => { el.hidden = Number(el.dataset.step) !== n; });
  document.getElementById("bar").style.width = (n / STEPS) * 100 + "%";
  document.getElementById("stepLabel").textContent = "Step " + n + " of " + STEPS;
  next.hidden = n === STEPS;
  document.getElementById("doneBtn").hidden = n !== STEPS;
  const box = document.getElementById("formError");
  if (box) box.hidden = true;
}

function stepNav(dir) {
  if (dir === "prev") {
    if (step === 1) { view = "welcome"; render(); } else showStep(step - 1);
    return;
  }
  const err = validate(new FormData(document.querySelector('form[data-form="profile"]')), false);
  if (err && err[1] <= step) { showError(err[0]); return; }
  showStep(step + 1);
}

function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const r = Math.min(1, 640 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * r);
      c.height = Math.round(img.height * r);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function addPhotos(files) {
  for (const f of Array.from(files)) {
    if (draftPhotos.length >= 3) break;
    try { draftPhotos.push(await shrink(f)); } catch (e) { /* skip unreadable file */ }
  }
  const box = document.getElementById("thumbs");
  if (box) box.innerHTML = thumbsHtml();
}

/* ---------- Render ---------- */

function render() {
  if (!state.me && view !== "welcome" && view !== "signup") view = "welcome";
  let html = "";
  if (view === "welcome") html = welcomeView();
  else if (view === "signup" || view === "edit") html = formView();
  else if (view === "browse") html = browseView() + navView();
  else if (view === "profile") html = profileView() + navView();
  app.innerHTML = html + unlockModal();
  document.body.classList.toggle("landing", view === "welcome");
  if (view === "signup") showStep(1);
  window.scrollTo(0, 0);
}

/* ---------- Actions ---------- */

const actions = {
  start: () => { view = "signup"; step = 1; draftPhotos = []; },
  nav: (d) => { view = d.to; },
  edit: () => { view = "edit"; draftPhotos = (state.me.photos || []).slice(); },
  unlock: (d) => { unlockId = d.id; },
  closeunlock: () => { unlockId = null; },
  confirmunlock: () => { if (!state.unlocked.includes(unlockId)) state.unlocked.push(unlockId); unlockId = null; save(); },
  delete: () => {
    if (confirm("Delete your profile and all your data from this device?")) {
      state = fresh();
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      view = "welcome";
    }
  },
};

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act;
  if (act === "next" || act === "prev") { stepNav(act); return; }
  if (act === "rmphoto") { draftPhotos.splice(Number(el.dataset.i), 1); document.getElementById("thumbs").innerHTML = thumbsHtml(); return; }
  if (actions[act]) { actions[act](el.dataset); render(); }
});

app.addEventListener("change", (e) => {
  if (e.target.id === "photos") { addPhotos(e.target.files); e.target.value = ""; }
});

app.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const editing = !!state.me;
  if (!editing && step < STEPS) { stepNav("next"); return; }
  const err = validate(data, editing);
  if (err) { if (!editing) showStep(err[1]); showError(err[0]); return; }
  state.me = {
    name: data.get("name").toString().trim(),
    gender: data.get("gender"),
    seeking: data.getAll("seeking"),
    location: data.get("location").toString().trim(),
    bio: (data.get("bio") || "").toString().trim(),
    interests: (data.get("interests") || "").toString().split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4),
    contact: data.get("contact").toString().trim(),
    photos: draftPhotos.slice(),
    blur: !!data.get("blur"),
  };
  save();
  view = editing ? "profile" : "browse";
  render();
});

render();

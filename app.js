/* Egerton Connect - real accounts with Supabase.
   The publishable key below is meant to be public. Never put a secret or service_role key in this file. */

const SUPABASE_URL = "https://hfezzmtvngspvvmnpswy.supabase.co";
const SUPABASE_KEY = "sb_publishable_o0HidjHmVXfXzy7cPLq5Hw_cyAagOWf";

if (!window.supabase) {
  document.getElementById("app").innerHTML = '<p style="padding:24px">Could not load the login service. Check your connection and refresh the page.</p>';
  throw new Error("Supabase library missing");
}
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const GENDERS = [["woman", "Woman"], ["man", "Man"], ["nonbinary", "Non-binary"]];
const INTEREST = { woman: "Women", man: "Men", nonbinary: "Non-binary people" };
const ZONES = ["Egerton main campus", "Egerton area", "Njoro town", "Njoro, near the market", "Nakuru town", "Elsewhere nearby"];

/* Sample profiles, shown only until real people join */
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

const SKEY = "egertonConnect.sampleUnlocks";
let sampleUnlocked = [];
try { sampleUnlocked = JSON.parse(localStorage.getItem(SKEY)) || []; } catch (e) { /* ignore */ }

let user = null;
let me = null;
let people = [];
let unlockedIds = new Set();
let revealed = {};
let view = "welcome";
let authMode = "signup";
let step = 1;
const STEPS = 3;
let unlockId = null;
let notice = "";
let busy = false;
let photoList = [];
let areaFilter = "all";
let justJoined = false;
let query = "";
let interestFilter = "all";
const SAVEKEY = "egertonConnect.saved";
let savedIds = new Set();
try { savedIds = new Set(JSON.parse(localStorage.getItem(SAVEKEY)) || []); } catch (e) { /* ignore */ }
const HKEY = "egertonConnect.hidden";
const loadHidden = () => { try { return new Set(JSON.parse(localStorage.getItem(HKEY)) || []); } catch (e) { return new Set(); } };
let hiddenIds = loadHidden();
let blockedList = [];
let reportId = null;
function toggleSave(id) {
  if (savedIds.has(id)) savedIds.delete(id); else savedIds.add(id);
  try { localStorage.setItem(SAVEKEY, JSON.stringify([...savedIds])); } catch (e) { /* ignore */ }
}

const app = document.getElementById("app");
const byId = (id) => PROFILES.find((p) => p.id === id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hue = (id) => (id.split("").reduce((a, c) => a + c.charCodeAt(0) * 17, 0) % 360);
const avatar = (p, cls) => `<div class="avatar ${cls || ""}" style="--h:${hue(String(p.id || p.name))}" aria-hidden="true">${esc(p.name[0])}</div>`;
const genderLabel = (g) => (GENDERS.find((x) => x[0] === g) || [g, g])[1];
const mask = (c) => (c ? c.slice(0, 2) : "07") + " •• ••• •••";
const tel = (c) => c.replace(/[^\d+]/g, "");
const photoOf = (p, blurred) => (p.photos && p.photos[0] ? `<img class="photo${blurred ? " blurred" : ""}" src="${esc(p.photos[0])}" alt="Photo of ${esc(p.name)}" />` : avatar(p));

function svgAvatar(p) {
  const h = hue(p.id);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 55% 62%)"/><stop offset="1" stop-color="hsl(${(h + 50) % 360} 55% 35%)"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="200" cy="120" r="52" fill="rgba(255,255,255,0.85)"/><path d="M80 300c0-72 54-112 120-112s120 40 120 112z" fill="rgba(255,255,255,0.85)"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
PROFILES.forEach((p) => { p.photos = [svgAvatar(p)]; p.sample = true; });

function stripHtml(urls, name) {
  return `<div class="strip">${urls.map((u, i) => `<img class="photo" src="${esc(u)}" alt="Photo ${i + 1} of ${esc(name)}" loading="lazy" />`).join("")}</div>`;
}
const photoBlock = (p, blurred) => (p.sample ? photoOf(p, blurred) : p.photoUrls && p.photoUrls.length ? stripHtml(p.photoUrls, p.name) : avatar(p));
const myPhotos = () => { const u = (me.blur ? me.blurUrls : me.clearUrls).filter(Boolean); return u.length ? stripHtml(u, me.name) : avatar(me); };

function thumbsHtml() {
  return photoList.map((x, i) => `<div class="th"><img src="${esc(x.preview)}" alt="Photo ${i + 1}" /><button type="button" data-act="rmphoto" data-i="${i}" aria-label="Remove photo ${i + 1}">&times;</button></div>`).join("");
}

function noticeHtml() {
  const n = notice;
  notice = "";
  return n ? `<div class="notice" role="status">${esc(n)}</div>` : "";
}

/* ---------- Data ---------- */

async function signUrls(paths) {
  if (!paths.length) return [];
  const { data } = await sb.storage.from("photos").createSignedUrls(paths, 3600);
  return (data || []).map((d) => d.signedUrl || "");
}

async function loadMe() {
  const { data: p } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!p) { me = null; return; }
  const { data: c } = await sb.from("contacts").select("phone").eq("profile_id", user.id).maybeSingle();
  me = { id: p.id, name: p.nickname, gender: p.gender, seeking: p.seeking, loc: p.area, bio: p.bio || "", interests: p.interests || [], contact: c ? c.phone : "", blur: !!p.blur_photos, photos: p.photos || [] };
  me.clearUrls = await signUrls(me.photos.map((n) => `${user.id}/${n}.jpg`));
  me.blurUrls = await signUrls(me.photos.map((n) => `${user.id}/${n}-blur.jpg`));
}

async function signPeople(list) {
  const paths = [];
  list.forEach((p) => {
    const ok = !p.blur || unlockedIds.has(p.id);
    p.paths = p.photos.map((n) => `${p.id}/${n}${ok ? "" : "-blur"}.jpg`);
    paths.push(...p.paths);
  });
  const urls = await signUrls(paths);
  let i = 0;
  list.forEach((p) => { p.photoUrls = p.paths.map(() => urls[i++] || "").filter(Boolean); });
}

async function getContact(id) {
  const { data } = await sb.rpc("get_contact", { target: id });
  return data || "";
}

async function loadPeople() {
  const { data } = await sb.from("profiles").select("id,nickname,gender,area,bio,interests,blur_photos,photos").neq("id", user.id).in("gender", me.seeking);
  people = (data || []).map((r) => ({ id: r.id, name: r.nickname, gender: r.gender, loc: r.area, bio: r.bio || "", interests: r.interests || [], blur: r.blur_photos, photos: r.photos || [] }));
  const u = await sb.from("unlocks").select("profile_id");
  unlockedIds = new Set((u.data || []).map((x) => x.profile_id));
  const bl = await sb.from("blocks").select("blocked_id,blocked_name");
  blockedList = (bl.data || []).map((x) => ({ id: x.blocked_id, name: x.blocked_name }));
  for (const id of unlockedIds) { if (!revealed[id]) revealed[id] = await getContact(id); }
  await signPeople(people);
}

async function afterLogin() {
  await loadMe();
  if (me) { await loadPeople(); view = "browse"; } else { view = "create"; }
  step = 1;
}

async function doAuth(data) {
  const email = (data.get("email") || "").toString().trim();
  const password = (data.get("password") || "").toString();
  if (!email || password.length < 8) { showError("Enter your email and a password of at least 8 characters."); return; }
  if (busy) return;
  busy = true;
  try {
    if (authMode === "signup") {
      const { data: r, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) { showError(error.message); return; }
      if (r.session) { user = r.user; await afterLogin(); }
      else { notice = "Check your email to confirm your account, then log in."; authMode = "login"; view = "auth"; }
    } else {
      const { data: r, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { showError(error.message); return; }
      user = r.user;
      await afterLogin();
    }
    render();
  } finally { busy = false; }
}

async function saveProfile(data, editing) {
  if (busy) return;
  busy = true;
  try {
    const bucket = sb.storage.from("photos");
    const keep = photoList.map((x) => x.name);
    const removed = (me ? me.photos : []).filter((n) => !keep.includes(n));
    for (const item of photoList.filter((x) => x.isNew)) {
      const a = await bucket.upload(`${user.id}/${item.name}.jpg`, item.clear, { contentType: "image/jpeg", upsert: true });
      const b = await bucket.upload(`${user.id}/${item.name}-blur.jpg`, item.blur, { contentType: "image/jpeg", upsert: true });
      const bad = a.error || b.error;
      if (bad) { showError("Could not upload a photo: " + bad.message); return; }
    }
    if (removed.length) await bucket.remove(removed.flatMap((n) => [`${user.id}/${n}.jpg`, `${user.id}/${n}-blur.jpg`]));
    const row = {
      id: user.id,
      nickname: data.get("name").toString().trim(),
      gender: data.get("gender"),
      seeking: data.getAll("seeking"),
      area: data.get("location").toString(),
      bio: (data.get("bio") || "").toString().trim(),
      interests: (data.get("interests") || "").toString().split(",").map((x) => x.trim()).filter(Boolean).slice(0, 4),
      photos: keep,
      blur_photos: !!data.get("blur"),
      adult_confirmed: true,
    };
    const r1 = await sb.from("profiles").upsert(row);
    if (r1.error) { showError(r1.error.message); return; }
    const r2 = await sb.from("contacts").upsert({ profile_id: user.id, phone: data.get("contact").toString().trim() });
    if (r2.error) { showError(r2.error.message); return; }
    await loadMe();
    await loadPeople();
    if (!editing) justJoined = true;
    view = editing ? "profile" : "browse";
    render();
  } finally { busy = false; }
}

/* ---------- Views ---------- */

function welcomeView() {
  const mini = (id, line) => { const p = byId(id); return `<div class="fc fc-${id}">${avatar(p, "sm")}<div><strong>${esc(p.name)}</strong><span>${esc(line)}</span></div></div>`; };
  const head = user
    ? `<button class="btn sun small" data-act="start">Open</button>`
    : `<span><button class="link" data-act="tologin">Log in</button> <button class="btn sun small" data-act="start">Join free</button></span>`;
  return `
  <main class="landing-page">
    <header class="l-top"><span class="brand">Egerton Connect</span>${head}</header>
    <section class="hero">
      <div class="hero-in">
        <div class="hero-copy">
          <span class="pill reveal" style="--d:0s">For the whole Egerton community, 18+</span>
          <h1 class="reveal" style="--d:.1s">Meet someone nearby, <em>privately.</em></h1>
          <p class="lead reveal" style="--d:.2s">Join with just a nickname. Browse people around Egerton, and keep your number private until someone unlocks it.</p>
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
    <section class="trust"><div class="trust-in">
      <div><strong>Nicknames, not real names</strong><span>Profiles show a nickname and a general area.</span></div>
      <div><strong>Private numbers</strong><span>Hidden until someone unlocks them.</span></div>
      <div><strong>Adults only</strong><span>Everyone confirms they are 18 or older.</span></div>
    </div></section>
    <section class="how">
      <h2>How it works</h2>
      <div class="steps3">
        <div class="how-card"><span class="num">1</span><h3>Create your profile</h3><p>Pick a nickname, your area and a few words about you.</p></div>
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

function authView() {
  const signup = authMode === "signup";
  return `<div class="topbar"><h2>${signup ? "Create your account" : "Log in"}</h2></div>
  <form class="form" data-form="auth" novalidate>
    ${noticeHtml()}
    <div class="error" id="formError" role="alert" hidden></div>
    <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" /><div class="hint">Used only to log in. It is never shown on your profile.</div></div>
    <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="${signup ? "new-password" : "current-password"}" /><div class="hint">At least 8 characters.</div></div>
    <button class="btn" type="submit">${signup ? "Continue" : "Log in"}</button>
    <button class="btn ghost" type="button" data-act="${signup ? "tologin" : "tosignup"}">${signup ? "I already have an account" : "Create a new account"}</button>
    <button class="btn ghost" type="button" data-act="nav" data-to="welcome">Back</button>
  </form>`;
}

function formView() {
  const editing = view === "edit";
  const m = editing ? me : {};
  const seeking = m.seeking || [];
  const chip = (type, name, g, on) => `<label class="chip"><input type="${type}" name="${name}" value="${g[0]}" ${on ? "checked" : ""} /><span>${g[1]}</span></label>`;
  const nameF = `<div class="field"><label for="name">Choose a nickname</label><input id="name" name="name" type="text" maxlength="30" autocomplete="off" placeholder="e.g. Sunrise" value="${esc(m.name || "")}" /><div class="hint">Shown to everyone, so please do not use your real name.</div></div>`;
  const genderF = `<div class="field"><fieldset><legend>Gender</legend><div class="chips">${GENDERS.map((g) => chip("radio", "gender", g, m.gender === g[0])).join("")}</div></fieldset></div>`;
  const seekF = `<div class="field"><fieldset><legend>Interested in</legend><div class="chips">${GENDERS.map((g) => chip("checkbox", "seeking", [g[0], INTEREST[g[0]]], seeking.includes(g[0]))).join("")}</div><div class="hint">Pick one or more.</div></fieldset></div>`;
  const locF = `<div class="field"><label for="location">Current area</label><select id="location" name="location"><option value="">Choose an area</option>${ZONES.map((z) => `<option ${m.loc === z ? "selected" : ""}>${z}</option>`).join("")}</select><div class="hint">A general area only, so nobody can find your exact spot.</div></div>`;
  const bioF = `<div class="field"><label for="bio">About me <span class="hint">(optional)</span></label><textarea id="bio" name="bio" maxlength="200" placeholder="A line or two about you">${esc(m.bio || "")}</textarea></div>`;
  const intF = `<div class="field"><label for="interests">Interests <span class="hint">(optional)</span></label><input id="interests" name="interests" type="text" placeholder="Football, Movies, Coding" value="${esc((m.interests || []).join(", "))}" /><div class="hint">Separate with commas. Up to 4.</div></div>`;
  const contactF = `<div class="field"><label for="contact">Phone or WhatsApp number</label><input id="contact" name="contact" type="tel" maxlength="20" placeholder="07XX XXX XXX" value="${esc(m.contact || "")}" /><div class="hint">Hidden from everyone until they unlock it.</div></div>`;
  const consentF = `<label class="check"><input type="checkbox" name="consent" /> <span>I am 18 or older and I will treat people with respect.</span></label>`;
  const photoF = `<div class="field"><label for="photos">Photos <span class="hint">(optional, up to 3)</span></label><input id="photos" type="file" accept="image/*" multiple /><div class="thumbs" id="thumbs">${thumbsHtml()}</div><div class="hint">A blurred copy is made for you automatically.</div></div>`;
  const blurF = `<label class="check"><input type="checkbox" name="blur" ${m.blur ? "checked" : ""} /> <span>Blur my photos until someone unlocks my contact.</span></label>`;
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

const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

function cardHtml(p, i) {
  const open = p.sample ? sampleUnlocked.includes(p.id) : unlockedIds.has(p.id);
  const number = p.sample ? p.contact : revealed[p.id];
  const contact = open
    ? (number ? `<a class="contact" href="tel:${esc(tel(number))}">${esc(number)}</a>` : `<p class="hint">Contact unlocked.</p>`)
    : `<div class="lock"><span>${esc(mask(p.contact))}</span><button class="btn small sun" data-act="unlock" data-id="${esc(p.id)}">Unlock contact</button></div>`;
  const saved = savedIds.has(p.id);
  return `<article class="card" style="--i:${i || 0}">
    <div class="media">${photoBlock(p, p.blur && !open)}
      <button class="heart${saved ? " on" : ""}" data-act="save" data-id="${esc(p.id)}" aria-pressed="${saved}" aria-label="Save ${esc(p.name)}">${HEART}</button>
      <div class="cap"><h3>${esc(p.name)}</h3><span class="loc">Now in ${esc(p.loc)}</span></div>
    </div>
    <div class="body">${p.blur && !open ? `<p class="hint">Photo is blurred until you unlock contact.</p>` : ""}
      ${p.bio ? `<p>${esc(p.bio)}</p>` : ""}
      <div class="tags">${(p.interests || []).map((x) => `<span>${esc(x)}</span>`).join("")}</div>${contact}<button class="reportlink" data-act="report" data-id="${esc(p.id)}">Report or block</button></div></article>`;
}

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const baseList = () => (people.length ? people : PROFILES.filter((p) => me.seeking.includes(p.gender))).filter((p) => !hiddenIds.has(p.id));

function appHead() {
  const tab = (to, label) => `<button data-act="nav" data-to="${to}" ${view === to ? 'aria-current="page"' : ""}>${label}</button>`;
  return `<header class="app-head"><button class="brandbtn" data-act="nav" data-to="welcome" aria-label="Back to the home page">Egerton Connect</button>
    <nav class="topnav" aria-label="Main">${tab("browse", "Browse")}${tab("saved", "Saved")}${tab("profile", "My profile")}</nav>
    <button class="me-chip" data-act="nav" data-to="profile" aria-label="My profile">${avatar(me, "sm")}</button></header>`;
}

function footerHtml() {
  return `<footer class="site-foot"><strong>Egerton Connect</strong><span>Made for the Egerton community. Adults only (18+).</span></footer>`;
}

function completeCard() {
  const checks = [true, me.photos.length > 0, !!me.bio, me.interests.length > 0];
  const done = checks.filter(Boolean).length;
  if (done === 4) return "";
  const todo = [!checks[1] && "a photo", !checks[2] && "a short bio", !checks[3] && "your interests"].filter(Boolean).join(", ");
  const pct = Math.round((done / 4) * 100);
  return `<div class="complete"><div><strong>Your profile is ${pct}% complete</strong><span>Add ${todo} to stand out.</span><div class="meter"><i style="width:${pct}%"></i></div></div><button class="btn sun small" data-act="edit">Complete it</button></div>`;
}

function filtered() {
  let list = baseList();
  if (areaFilter !== "all") list = list.filter((p) => p.loc === areaFilter);
  if (interestFilter !== "all") list = list.filter((p) => (p.interests || []).includes(interestFilter));
  const q = query.trim().toLowerCase();
  if (q) list = list.filter((p) => [p.name, p.bio, p.loc].concat(p.interests || []).join(" ").toLowerCase().includes(q));
  return list;
}

function resultsHtml() {
  const list = filtered();
  const head = `<div class="results-head"><strong>${list.length} ${list.length === 1 ? "profile" : "profiles"}</strong><span>${areaFilter === "all" ? "across Egerton" : "in " + esc(areaFilter)}</span></div>`;
  return head + (list.length ? `<div class="cards">${list.map(cardHtml).join("")}</div>` : `<div class="empty"><h3>No matches</h3><p>Try a different area, interest or search.</p></div>`);
}

function browseView() {
  const base = baseList();
  const counts = {};
  base.forEach((p) => (p.interests || []).forEach((x) => { counts[x] = (counts[x] || 0) + 1; }));
  const top = Object.keys(counts).sort((x, y) => counts[y] - counts[x]).slice(0, 8);
  const achips = ["all"].concat(ZONES).map((z) => `<button class="fchip" data-act="area" data-z="${esc(z)}" aria-pressed="${areaFilter === z}">${z === "all" ? "Everyone" : esc(z)}</button>`).join("");
  const ichips = ["all"].concat(top).map((x) => `<button class="fchip alt" data-act="interest" data-i="${esc(x)}" aria-pressed="${interestFilter === x}">${x === "all" ? "All interests" : esc(x)}</button>`).join("");
  const welcome = justJoined
    ? `<div class="welcome-card"><div class="confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><h3>You're in, ${esc(me.name)}!</h3><p>Your profile is live. Have a look around, and unlock a contact when you find someone you like.</p><button class="btn sun small" data-act="closewelcome">Got it</button></div>`
    : "";
  return `${appHead()}
    <section class="b-hero">
      <p class="eyebrow">${greeting()}</p>
      <h2>${esc(me.name)}, who will you meet today?</h2>
      <div class="stats"><span><b>${base.length}</b> profiles</span><span><b>${new Set(base.map((p) => p.loc)).size}</b> areas</span><span><b>18+</b> only</span></div>
      <label class="search"><span class="sr">Search profiles</span><input id="q" type="search" placeholder="Search by nickname or interest" value="${esc(query)}" autocomplete="off" /></label>
      <div class="fchips" role="group" aria-label="Filter by area">${achips}</div>
    </section>
    ${welcome}${noticeHtml()}${completeCard()}
    <section class="interests"><h3>Browse by interest</h3><div class="fchips" role="group" aria-label="Filter by interest">${ichips}</div></section>
    ${!people.length ? `<p class="hint pad">Early preview: these are sample profiles until more people join.</p>` : ""}
    <div id="results">${resultsHtml()}</div>
    ${footerHtml()}`;
}

function savedView() {
  const list = people.concat(PROFILES).filter((p) => savedIds.has(p.id) && !hiddenIds.has(p.id));
  return `${appHead()}
    ${noticeHtml()}
    <section class="b-hero slim"><h2>Saved</h2><p>Profiles you have kept for later.</p></section>
    ${list.length ? `<div class="cards">${list.map(cardHtml).join("")}</div>` : `<div class="empty"><h3>Nothing saved yet</h3><p>Tap the heart on a profile to keep it here.</p><button class="btn ghost" data-act="nav" data-to="browse">Browse profiles</button></div>`}
    ${footerHtml()}`;
}

function profileView() {
  return `${appHead()}<div class="topbar"><h2>My profile</h2></div>
  <div class="profile">
    <div class="card">${myPhotos()}<div class="body">
      <h3>${esc(me.name)}</h3>
      <dl class="facts">
        <div><dt>Gender</dt><dd>${esc(genderLabel(me.gender))}</dd></div>
        <div><dt>Interested in</dt><dd>${esc(me.seeking.map((g) => INTEREST[g]).join(", "))}</dd></div>
        <div><dt>Current area</dt><dd>${esc(me.loc)}</dd></div>
      </dl>
      ${me.bio ? `<p>${esc(me.bio)}</p>` : ""}
      <div class="tags">${me.interests.map((i) => `<span>${esc(i)}</span>`).join("")}</div>
      <p class="hint" style="margin-top:14px">Your contact (${esc(me.contact)}) stays hidden from others until they unlock it.</p>
    </div></div>
    ${me.photos.length ? `<div class="box"><h3>Photo privacy</h3><p class="hint">${me.blur ? "Your photos are blurred. Others see them blurred until they unlock your contact." : "Your photos are visible to everyone browsing."}</p><button class="btn ${me.blur ? "sun" : "ghost"}" data-act="toggleblur">${me.blur ? "Show my photos" : "Blur my photos"}</button></div>` : ""}
    <button class="btn" data-act="edit">Edit profile</button>
    ${blockedList.length ? `<div class="box"><h3>Blocked people</h3>${blockedList.map((b) => `<div class="blk"><span>${esc(b.name)}</span><button class="btn small ghost" data-act="unblock" data-id="${esc(b.id)}">Unblock</button></div>`).join("")}</div>` : ""}
    <button class="btn ghost" data-act="logout">Log out</button>
    <button class="btn danger" data-act="delete">Delete my profile</button>
  </div>`;
}

function navView() {
  const tab = (to, label) => `<button data-act="nav" data-to="${to}" ${view === to ? 'aria-current="page"' : ""}>${label}</button>`;
  return `<nav class="nav" aria-label="Main">${tab("browse", "Browse")}${tab("saved", "Saved")}${tab("profile", "My profile")}</nav>`;
}

function unlockModal() {
  if (!unlockId) return "";
  const p = byId(unlockId) || people.find((x) => x.id === unlockId);
  if (!p) return "";
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Unlock contact"><div class="modal">
    ${avatar(p, "sm")}<h2>Unlock ${esc(p.name)}'s contact</h2>
    <p>In the live version, contact access will be a paid feature. Payments are not switched on in this preview, so you can unlock for free.</p>
    <button class="btn sun" data-act="confirmunlock">Unlock (demo)</button>
    <button class="btn ghost" data-act="closeunlock">Not now</button></div></div>`;
}

/* ---------- Report and block ---------- */

const findPerson = (id) => people.find((x) => x.id === id) || byId(id);

function hide(id) {
  hiddenIds.add(id);
  if (byId(id)) { try { localStorage.setItem(HKEY, JSON.stringify([...hiddenIds].filter((x) => byId(x)))); } catch (e) { /* ignore */ } }
}

function reportModal() {
  if (!reportId) return "";
  const p = findPerson(reportId);
  if (!p) return "";
  const reasons = ["Fake profile or scam", "Harassment or abuse", "Looks under 18", "Inappropriate photos", "Asking for money", "Something else"];
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Report or block"><form class="modal report" data-form="report">
    <h2>Report ${esc(p.name)}</h2>
    <p class="hint">Tell us what is wrong. Reports are private.</p>
    <div class="error" id="reportError" role="alert" hidden></div>
    <fieldset class="reasons">${reasons.map((r) => `<label class="check"><input type="radio" name="reason" value="${esc(r)}" /> <span>${esc(r)}</span></label>`).join("")}</fieldset>
    <textarea name="details" maxlength="500" placeholder="Anything else we should know? (optional)"></textarea>
    <label class="check"><input type="checkbox" name="alsoblock" checked /> <span>Also block ${esc(p.name)}</span></label>
    <button class="btn sun" type="submit">Send</button>
    <button class="btn ghost" type="button" data-act="closereport">Cancel</button></form></div>`;
}

async function sendReport(data) {
  const err = document.getElementById("reportError");
  const fail = (m) => { err.textContent = m; err.hidden = false; };
  const reason = data.get("reason");
  if (!reason) { fail("Choose a reason."); return; }
  if (busy) return;
  busy = true;
  try {
    const p = findPerson(reportId);
    const block = !!data.get("alsoblock");
    if (p && !p.sample) {
      const r = await sb.from("reports").insert({ reporter_id: user.id, reported_id: p.id, reason: reason.toString(), details: (data.get("details") || "").toString().trim().slice(0, 500) });
      if (r.error) { fail("Could not send: " + r.error.message); return; }
      if (block) {
        const b = await sb.from("blocks").insert({ blocker_id: user.id, blocked_id: p.id, blocked_name: p.name });
        if (b.error && b.error.code !== "23505") { fail("Could not block: " + b.error.message); return; }
        if (!blockedList.some((x) => x.id === p.id)) blockedList.push({ id: p.id, name: p.name });
      }
    }
    if (block && p) hide(p.id);
    reportId = null;
    notice = block ? "Thank you. We will review your report, and you will no longer see this profile." : "Thank you. We will review your report.";
    render();
  } finally { busy = false; }
}

/* ---------- Sign-up steps ---------- */

function validate(data, editing) {
  const digits = (data.get("contact") || "").toString().replace(/\D/g, "");
  if (!(data.get("name") || "").toString().trim()) return ["Choose a nickname.", 1];
  if (!data.get("gender")) return ["Choose your gender.", 1];
  if (!data.getAll("seeking").length) return ["Choose who you are interested in.", 1];
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

const toBlob = (c) => new Promise((res) => c.toBlob(res, "image/jpeg", 0.78));

function readImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

async function processPhoto(file) {
  const img = await readImage(file);
  const r = Math.min(1, 720 / Math.max(img.width, img.height));
  const w = Math.round(img.width * r);
  const h = Math.round(img.height * r);
  const canvas = (cw, ch) => { const c = document.createElement("canvas"); c.width = Math.max(1, cw); c.height = Math.max(1, ch); return c; };
  const clear = canvas(w, h);
  clear.getContext("2d").drawImage(img, 0, 0, w, h);
  const tiny = canvas(Math.round(w / 26), Math.round(h / 26));
  tiny.getContext("2d").drawImage(clear, 0, 0, tiny.width, tiny.height);
  const blur = canvas(w, h);
  const bx = blur.getContext("2d");
  bx.imageSmoothingEnabled = true;
  bx.imageSmoothingQuality = "high";
  bx.drawImage(tiny, 0, 0, w, h);
  return { clear: await toBlob(clear), blur: await toBlob(blur), preview: clear.toDataURL("image/jpeg", 0.6) };
}

/* ---------- Render ---------- */

function render(keep) {
  if (!user && view !== "welcome" && view !== "auth") view = "welcome";
  if (user && !me && ["browse", "saved", "profile", "edit"].includes(view)) view = "create";
  let html = "";
  if (view === "welcome") html = welcomeView();
  else if (view === "auth") html = authView();
  else if (view === "create" || view === "edit") html = formView();
  else if (view === "browse") html = browseView() + navView();
  else if (view === "saved") html = savedView() + navView();
  else if (view === "profile") html = profileView() + navView();
  app.innerHTML = html + unlockModal() + reportModal();
  document.body.classList.toggle("landing", view === "welcome");
  if (view === "create") showStep(1);
  if (!keep) window.scrollTo(0, 0);
}

/* ---------- Actions ---------- */

const actions = {
  start: () => {
    step = 1;
    photoList = [];
    if (user) view = me ? "browse" : "create";
    else { authMode = "signup"; view = "auth"; }
  },
  report: (d) => { reportId = d.id; },
  closereport: () => { reportId = null; },
  unblock: async (d) => {
    const { error } = await sb.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", d.id);
    if (error) { notice = "Could not unblock: " + error.message; return; }
    hiddenIds.delete(d.id);
    await loadPeople();
  },
  area: (d) => { areaFilter = d.z; },
  interest: (d) => { interestFilter = d.i; },
  closewelcome: () => { justJoined = false; },
  tologin: () => { authMode = "login"; view = "auth"; },
  tosignup: () => { authMode = "signup"; view = "auth"; },
  nav: (d) => { view = d.to; },
  edit: () => { view = "edit"; photoList = me.photos.map((n, i) => ({ name: n, preview: me.clearUrls[i] || "" })); },
  toggleblur: async () => {
    const { error } = await sb.from("profiles").update({ blur_photos: !me.blur }).eq("id", user.id);
    if (error) { notice = "Could not update: " + error.message; return; }
    me.blur = !me.blur;
  },
  unlock: (d) => { unlockId = d.id; },
  closeunlock: () => { unlockId = null; },
  confirmunlock: async () => {
    const id = unlockId;
    unlockId = null;
    const real = people.find((x) => x.id === id);
    if (!real) {
      if (!sampleUnlocked.includes(id)) sampleUnlocked.push(id);
      try { localStorage.setItem(SKEY, JSON.stringify(sampleUnlocked)); } catch (e) { /* ignore */ }
      return;
    }
    const { error } = await sb.rpc("unlock_for_testing", { target: id });
    if (error) { notice = "Could not unlock: " + error.message; return; }
    unlockedIds.add(id);
    revealed[id] = await getContact(id);
    await signPeople([real]);
  },
  logout: async () => {
    await sb.auth.signOut();
    user = null; me = null; people = []; unlockedIds = new Set(); revealed = {}; hiddenIds = loadHidden(); blockedList = [];
    view = "welcome";
  },
  delete: async () => {
    if (!confirm("Delete your profile and contact number? Your login email stays until you ask us to remove it.")) return;
    if (me.photos.length) await sb.storage.from("photos").remove(me.photos.flatMap((n) => [`${user.id}/${n}.jpg`, `${user.id}/${n}-blur.jpg`]));
    const { error } = await sb.from("profiles").delete().eq("id", user.id);
    if (error) { notice = "Could not delete: " + error.message; return; }
    await sb.auth.signOut();
    user = null; me = null; people = []; unlockedIds = new Set(); revealed = {}; hiddenIds = loadHidden(); blockedList = [];
    view = "welcome";
  },
};

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act;
  if (act === "next" || act === "prev") { stepNav(act); return; }
  if (act === "save") {
    toggleSave(el.dataset.id);
    el.classList.toggle("on");
    el.setAttribute("aria-pressed", String(el.classList.contains("on")));
    if (view === "saved") render(true);
    return;
  }
  if (act === "rmphoto") { photoList.splice(Number(el.dataset.i), 1); document.getElementById("thumbs").innerHTML = thumbsHtml(); return; }
  if (!actions[act]) return;
  Promise.resolve(actions[act](el.dataset)).then(() => render(act === "area" || act === "interest"));
});

app.addEventListener("input", (e) => {
  if (e.target.id === "q") { query = e.target.value; document.getElementById("results").innerHTML = resultsHtml(); }
});

app.addEventListener("change", async (e) => {
  if (e.target.id !== "photos") return;
  const files = Array.from(e.target.files);
  e.target.value = "";
  for (const f of files) {
    if (photoList.length >= 3) break;
    try { photoList.push({ name: Math.random().toString(36).slice(2, 10), isNew: true, ...(await processPhoto(f)) }); } catch (err) { /* skip unreadable file */ }
    const box = document.getElementById("thumbs");
    if (box) box.innerHTML = thumbsHtml();
  }
});

app.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  if (form.dataset.form === "auth") { await doAuth(data); return; }
  if (form.dataset.form === "report") { await sendReport(data); return; }
  const editing = view === "edit";
  if (!editing && step < STEPS) { stepNav("next"); return; }
  const err = validate(data, editing);
  if (err) { if (!editing) showStep(err[1]); showError(err[0]); return; }
  await saveProfile(data, editing);
});

/* ---------- Start ---------- */

render();
(async () => {
  try {
    const { data } = await sb.auth.getSession();
    if (data.session) { user = data.session.user; await afterLogin(); render(); }
  } catch (e) { /* stay on the landing page */ }
})();

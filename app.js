/* Egerton Connect - real accounts with Supabase.
   The publishable key below is meant to be public. Never put a secret or service_role key in this file. */

const SUPABASE_URL = "https://hfezzmtvngspvvmnpswy.supabase.co";
const SUPABASE_KEY = "sb_publishable_o0HidjHmVXfXzy7cPLq5Hw_cyAagOWf";

if (!window.supabase) {
  document.getElementById("app").innerHTML = '<p style="padding:24px">Could not load the login service. Check your connection and refresh the page.</p>';
  throw new Error("Supabase library missing");
}
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const LEGALKEYS = ["about", "terms", "privacy"];
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
let viewedIds = new Set();
let revealed = {};
let view = "welcome";
let authMode = "signup";
let step = 1;
const STEPS = 3;
let status = { payments_enabled: false, weekly_price: 99, monthly_price: 399, daily_view_limit: 30, has_access: true, access_until: null };
let payOpen = false;
let payPlan = "weekly";
let payWaiting = false;
let payError = "";
let chats = [];
let activeChat = null;
let chatMsgs = [];
let chatStatusShown = "";
let sayHiId = null;
let reportConv = null;
let channel = null;
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
let pwOpen = false;
let recovering = false;
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
  me = { id: p.id, name: p.nickname, gender: p.gender, seeking: p.seeking, loc: p.area, bio: p.bio || "", interests: p.interests || [], contact: c ? c.phone : "", blur: !!p.blur_photos, paused: !!p.paused, photos: p.photos || [] };
  me.clearUrls = await signUrls(me.photos.map((n) => `${user.id}/${n}.jpg`));
  me.blurUrls = await signUrls(me.photos.map((n) => `${user.id}/${n}-blur.jpg`));
}

async function signPeople(list) {
  const paths = [];
  list.forEach((p) => {
    const ok = !p.blur || viewedIds.has(p.id);
    p.paths = p.photos.map((n) => `${p.id}/${n}${ok ? "" : "-blur"}.jpg`);
    paths.push(...p.paths);
  });
  const urls = await signUrls(paths);
  let i = 0;
  list.forEach((p) => { p.photoUrls = p.paths.map(() => urls[i++] || "").filter(Boolean); });
}

async function loadStatus() {
  const { data } = await sb.rpc("get_app_status");
  if (data) status = data;
}

async function getContact(id) {
  const { data } = await sb.rpc("get_contact", { target: id });
  return data || "";
}

async function loadPeople() {
  const { data } = await sb.from("profiles").select("id,nickname,gender,area,bio,interests,blur_photos,photos").neq("id", user.id).in("gender", me.seeking);
  people = (data || []).map((r) => ({ id: r.id, name: r.nickname, gender: r.gender, loc: r.area, bio: r.bio || "", interests: r.interests || [], blur: r.blur_photos, photos: r.photos || [] }));
  const u = await sb.from("contact_views").select("profile_id");
  viewedIds = new Set((u.data || []).map((x) => x.profile_id));
  const bl = await sb.from("blocks").select("blocked_id,blocked_name");
  blockedList = (bl.data || []).map((x) => ({ id: x.blocked_id, name: x.blocked_name }));
  await signPeople(people);
}

async function afterLogin() {
  await loadStatus();
  await loadMe();
  if (me) { await loadPeople(); await loadChats(); startRealtime(); view = "browse"; } else { view = "create"; }
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
          <h1 class="reveal" style="--d:.1s">Real people. <em>Real connections.</em></h1>
          <p class="lead reveal" style="--d:.2s">Join with just a nickname. Browse members around Egerton, and start a conversation when you are ready.</p>
          <button class="btn sun big reveal" style="--d:.3s" data-act="start">Create my profile</button>
          <p class="fine reveal" style="--d:.4s">Free to join. Just 3 quick steps.</p>
        </div>
        <div class="hero-art reveal" style="--d:.35s" aria-hidden="true">
          ${mini("p1", "Now in Njoro town")}
          ${mini("p2", "Now at Egerton main campus")}
          <div class="fc fc-match"><strong>Contact shown</strong></div>
          ${mini("p7", "Now in Nakuru town")}
        </div>
      </div>
    </section>
    <section class="trust"><div class="trust-in">
      <div><strong>Nicknames, not real names</strong><span>Profiles show a nickname and a general area.</span></div>
      <div><strong>Private numbers</strong><span>Only shown to members with an active plan.</span></div>
      <div><strong>Adults only</strong><span>Everyone confirms they are 18 or older.</span></div>
    </div></section>
    <section class="how">
      <h2>How it works</h2>
      <div class="steps3">
        <div class="how-card"><span class="num">1</span><h3>Create your profile</h3><p>Pick a nickname, your area and a few words about you.</p></div>
        <div class="how-card"><span class="num">2</span><h3>Browse people</h3><p>See who is around Egerton and read their profiles.</p></div>
        <div class="how-card"><span class="num">3</span><h3>Start talking</h3><p>Send a chat request. Once they accept, chat right here. A plan also shows contact numbers.</p></div>
      </div>
    </section>
    <section class="final">
      <h2>Ready to meet someone?</h2>
      <button class="btn sun big" data-act="start">Create my profile</button>
      <p class="fine">Early preview: sample profiles are shown until more people join.</p>
      <nav class="foot-links light" aria-label="Site information"><a href="#about">About</a><a href="#terms">Terms</a><a href="#privacy">Privacy</a></nav>
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
    ${signup ? "" : `<button class="link dark" type="button" data-act="forgot">Forgot your password?</button>`}
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
  const contactF = `<div class="field"><label for="contact">Phone or WhatsApp number</label><input id="contact" name="contact" type="tel" maxlength="20" placeholder="07XX XXX XXX" value="${esc(m.contact || "")}" /><div class="hint">Only shown to members with an active plan.</div></div>`;
  const consentF = `<label class="check"><input type="checkbox" name="consent" /> <span>I am 18 or older, I agree to the <a href="#terms" target="_blank" rel="noopener">Terms</a> and <a href="#privacy" target="_blank" rel="noopener">Privacy Policy</a>, and I will treat people with respect.</span></label>`;
  const photoF = `<div class="field"><label for="photos">Photos <span class="hint">(optional, up to 3)</span></label><input id="photos" type="file" accept="image/*" multiple /><div class="thumbs" id="thumbs">${thumbsHtml()}</div><div class="hint">A blurred copy is made for you automatically.</div></div>`;
  const blurF = `<label class="check"><input type="checkbox" name="blur" ${m.blur ? "checked" : ""} /> <span>Blur my photos until a member views my contact number.</span></label>`;
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
    <section class="step" data-step="3" hidden><h3 class="step-title">Last step</h3>${contactF}${consentF}</section>
    <div class="step-nav">
      <button class="btn ghost" type="button" data-act="prev">Back</button>
      <button class="btn" type="button" id="nextBtn" data-act="next">Next</button>
      <button class="btn sun" type="submit" id="doneBtn" hidden>Publish my profile</button>
    </div>
  </form>`;
}

const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

function cardHtml(p, i) {
  const open = p.sample ? sampleUnlocked.includes(p.id) : viewedIds.has(p.id);
  const number = p.sample ? (open ? p.contact : "") : revealed[p.id];
  const contact = number
    ? `<a class="contact" href="tel:${esc(tel(number))}">${esc(number)}</a>`
    : status.has_access
      ? `<div class="lock"><span>${esc(mask(p.contact))}</span><button class="btn small sun" data-act="reveal" data-id="${esc(p.id)}">Show number</button></div>`
      : `<div class="lock"><span>${esc(mask(p.contact))}</span><button class="btn small sun" data-act="nav" data-to="plans">Get access</button></div>`;
  const conv = chats.find((c) => c.other_id === p.id);
  const hi = p.sample || (conv && conv.status === "declined") ? ""
    : conv ? `<button class="btn small ghost hibtn" data-act="openchat" data-id="${esc(p.id)}">${conv.status === "accepted" ? "Open chat" : conv.initiated_by_me ? "Request sent" : "Reply"}</button>`
    : `<button class="btn small hibtn" data-act="sayhi" data-id="${esc(p.id)}">Say hi</button>`;
  const saved = savedIds.has(p.id);
  return `<article class="card" style="--i:${i || 0}">
    <div class="media">${photoBlock(p, p.blur && !open)}
      <button class="heart${saved ? " on" : ""}" data-act="save" data-id="${esc(p.id)}" aria-pressed="${saved}" aria-label="Save ${esc(p.name)}">${HEART}</button>
      <div class="cap"><h3>${esc(p.name)}</h3><span class="loc">Now in ${esc(p.loc)}</span></div>
    </div>
    <div class="body">${p.blur && !open ? `<p class="hint">Photo is blurred until you view their number.</p>` : ""}
      ${p.bio ? `<p>${esc(p.bio)}</p>` : ""}
      <div class="tags">${(p.interests || []).map((x) => `<span>${esc(x)}</span>`).join("")}</div>${hi}${contact}<button class="reportlink" data-act="report" data-id="${esc(p.id)}">Report or block</button></div></article>`;
}

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const baseList = () => (people.length ? people : PROFILES.filter((p) => me.seeking.includes(p.gender))).filter((p) => !hiddenIds.has(p.id));

function appHead() {
  const n = unreadTotal();
  const tab = (to, label, extra) => `<button data-act="nav" data-to="${to}" ${view === to ? 'aria-current="page"' : ""}>${label}${extra || ""}</button>`;
  const badge = `<span class="badge chatbadge" ${n ? "" : "hidden"}>${n}</span>`;
  return `<header class="app-head"><button class="brandbtn" data-act="nav" data-to="welcome" aria-label="Back to the home page">Egerton Connect</button>
    <nav class="topnav" aria-label="Main">${tab("browse", "Browse")}${tab("saved", "Saved")}${tab("chats", "Chats", badge)}${tab("plans", "Plans")}${tab("profile", "My profile")}</nav>
    <button class="me-chip" data-act="nav" data-to="profile" aria-label="My profile">${avatar(me, "sm")}</button></header>`;
}

function legalView(key) {
  const page = LEGAL[key];
  return `<main class="legal"><button class="link dark" data-act="legalback">&larr; Back</button><h1>${page.title}</h1><p class="updated">Last updated: 18 November 2026</p>${page.html}
    <nav class="foot-links" aria-label="Site information"><a href="#about">About</a><a href="#terms">Terms</a><a href="#privacy">Privacy</a></nav></main>`;
}

function footerHtml() {
  return `<footer class="site-foot"><strong>Egerton Connect</strong><span>Made for the Egerton community. Adults only (18+).</span><nav class="foot-links" aria-label="Site information"><a href="#about">About</a><a href="#terms">Terms</a><a href="#privacy">Privacy</a></nav></footer>`;
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
    ? `<div class="welcome-card"><div class="confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><h3>You're in, ${esc(me.name)}!</h3><p>Your profile is live. Have a look around, and add photos any time from My profile.</p><button class="btn sun small" data-act="closewelcome">Got it</button></div>`
    : "";
  return `${appHead()}
    <section class="b-hero">
      <p class="eyebrow">${greeting()}</p>
      <h2>${esc(me.name)}, who will you meet today?</h2>
      <div class="stats"><span><b>${base.length}</b> profiles</span><span><b>${new Set(base.map((p) => p.loc)).size}</b> areas</span><span><b>18+</b> only</span></div>
      <label class="search"><span class="sr">Search profiles</span><input id="q" type="search" placeholder="Search by nickname or interest" value="${esc(query)}" autocomplete="off" /></label>
      <div class="fchips" role="group" aria-label="Filter by area">${achips}</div>
    </section>
    ${me.paused ? `<div class="notice paused"><span>Your profile is paused, so nobody can see it.</span><button class="btn sun small" data-act="togglepause">Show it again</button></div>` : ""}
    ${!status.payments_enabled ? `<p class="notice freebar">Free preview: contact numbers are open to all members while we test. Paid plans start later.</p>` : status.has_access ? "" : `<div class="notice paused"><span>Get a plan to see contact numbers.</span><button class="btn sun small" data-act="nav" data-to="plans">See plans</button></div>`}
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
  return `${appHead()}${noticeHtml()}<div class="topbar"><h2>My profile</h2></div>
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
      <p class="hint" style="margin-top:14px">Your number (${esc(me.contact)}) is only shown to members with an active plan.</p>
    </div></div>
    ${me.photos.length ? `<div class="box"><h3>Photo privacy</h3><p class="hint">${me.blur ? "Your photos are blurred. Others see them blurred until they view your contact number." : "Your photos are visible to everyone browsing."}</p><button class="btn ${me.blur ? "sun" : "ghost"}" data-act="toggleblur">${me.blur ? "Show my photos" : "Blur my photos"}</button></div>` : ""}
    <button class="btn" data-act="edit">Edit profile</button>
    <div class="box"><h3>Membership</h3><p class="hint">${!status.payments_enabled ? "Free during testing." : status.has_access && status.access_until ? "Active until " + fmtDate(status.access_until) + "." : "No active plan."}</p><button class="btn ghost" data-act="nav" data-to="plans">See plans</button></div>
    <div class="box"><h3>Profile visibility</h3><p class="hint">${me.paused ? "Your profile is paused. Nobody can see it or your contact number." : "Your profile is visible to other members."}</p><button class="btn ${me.paused ? "sun" : "ghost"}" data-act="togglepause">${me.paused ? "Show my profile again" : "Pause my profile"}</button></div>
    <div class="box"><h3>Account</h3><p class="hint">Signed in as ${esc(user.email)}. Only you can see this.</p><div class="acct"><button class="btn ghost" data-act="changepw">Change password</button><button class="btn ghost" data-act="exportdata">Download my data</button></div></div>
    ${blockedList.length ? `<div class="box"><h3>Blocked people</h3>${blockedList.map((b) => `<div class="blk"><span>${esc(b.name)}</span><button class="btn small ghost" data-act="unblock" data-id="${esc(b.id)}">Unblock</button></div>`).join("")}</div>` : ""}
    <button class="btn ghost" data-act="logout">Log out</button>
    <button class="btn danger" data-act="delete">Delete my account</button>
  </div>`;
}

function navView() {
  const n = unreadTotal();
  const tab = (to, label, extra) => `<button data-act="nav" data-to="${to}" ${view === to ? 'aria-current="page"' : ""}>${label}${extra || ""}</button>`;
  const badge = `<span class="badge chatbadge" ${n ? "" : "hidden"}>${n}</span>`;
  return `<nav class="nav" aria-label="Main">${tab("browse", "Browse")}${tab("chats", "Chats", badge)}${tab("saved", "Saved")}${tab("profile", "My profile")}</nav>`;
}

/* ---------- Chat ---------- */

const unreadTotal = () => chats.reduce((n, c) => n + (c.status === "pending" && !c.initiated_by_me ? 1 : c.unread || 0), 0);

function updateBadges() {
  const n = unreadTotal();
  document.querySelectorAll(".chatbadge").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
}

async function loadChats() {
  const { data } = await sb.rpc("my_chats");
  chats = data || [];
  updateBadges();
}

async function loadMessages() {
  const { data } = await sb.from("messages").select("id,sender_id,body,created_at").eq("conversation_id", activeChat).order("id", { ascending: true }).limit(300);
  chatMsgs = data || [];
}

async function markRead() {
  if (!activeChat) return;
  await sb.rpc("mark_read", { conv: activeChat });
  await loadChats();
}

async function openChat(cid) {
  if (!cid) return;
  activeChat = cid;
  sayHiId = null;
  view = "chat";
  await loadMessages();
  await markRead();
}

function chatError(e) {
  const m = (e && e.message) || "";
  if (m.includes("plan_required")) return "Starting a chat needs a plan. Replying to a request is always free.";
  if (m.includes("daily_limit")) return "You have reached today's limit of new chat requests. Try again tomorrow.";
  if (m.includes("declined")) return "This person has declined, so you cannot message them.";
  if (m.includes("already_sent")) return "You already sent a request. Please wait for a reply.";
  if (m.includes("slow_down")) return "You are sending messages too fast. Please wait a moment.";
  if (m.includes("bad_message")) return "Your message is empty or too long.";
  return "Could not do that right now. Please try again.";
}

const msgsHtml = () => chatMsgs.map((m) => `<div class="msg ${m.sender_id === user.id ? "me" : "them"}">${esc(m.body)}</div>`).join("");

function updateMsgsDom() {
  const box = document.getElementById("msgs");
  if (!box) return;
  box.innerHTML = msgsHtml();
  window.scrollTo(0, document.body.scrollHeight);
}

function chatsView() {
  const incoming = chats.filter((c) => c.status === "pending" && !c.initiated_by_me);
  const active = chats.filter((c) => c.status === "accepted");
  const sent = chats.filter((c) => c.status === "pending" && c.initiated_by_me);
  const row = (c, line) => `<button class="item" data-act="openchat" data-cid="${esc(c.id)}">${avatar({ id: c.other_id, name: c.other_name }, "sm")}<div><strong>${esc(c.other_name)}${c.unread ? ` <span class="badge">${c.unread}</span>` : ""}</strong><span class="sub">${esc(line || c.last_body || "")}</span></div></button>`;
  const section = (title, list, line) => (list.length ? `<h3 class="sec">${title}</h3><div class="list">${list.map((c) => row(c, line)).join("")}</div>` : "");
  const empty = !incoming.length && !active.length && !sent.length;
  return `${appHead()}${noticeHtml()}
    <section class="b-hero slim"><h2>Chats</h2><p>Message people once they accept your request.</p></section>
    ${section("Requests", incoming)}${section("Chats", active)}${section("Waiting for a reply", sent, "Request sent")}
    ${empty ? `<div class="empty"><h3>No chats yet</h3><p>Tap Say hi on a profile to send a request.</p><button class="btn ghost" data-act="nav" data-to="browse">Browse profiles</button></div>` : ""}
    ${footerHtml()}`;
}

function chatView() {
  const c = chats.find((x) => x.id === activeChat);
  if (!c) return `${appHead()}<div class="empty"><h3>Chat not found</h3><button class="btn ghost" data-act="nav" data-to="chats">Back to chats</button></div>`;
  chatStatusShown = c.status;
  const incoming = c.status === "pending" && !c.initiated_by_me;
  const note = incoming
    ? `<div class="req-actions"><p class="hint">${esc(c.other_name)} would like to chat. You can accept, decline or block.</p><button class="btn sun" data-act="accept">Accept</button><button class="btn ghost" data-act="decline">Decline</button></div>`
    : c.status === "pending" ? `<p class="hint pad">Waiting for ${esc(c.other_name)} to accept. You can send more messages once they do.</p>`
    : c.status === "declined" ? `<p class="hint pad">${esc(c.other_name)} declined this request.</p>` : "";
  const composer = c.status === "accepted"
    ? `<form class="composer" data-form="chat" autocomplete="off"><input name="text" type="text" maxlength="1000" placeholder="Write a message" aria-label="Message" /><button class="btn" type="submit">Send</button></form>` : "";
  return `<div class="chatwrap">
    <div class="chat-head"><button class="back" data-act="nav" data-to="chats" aria-label="Back to chats">&larr;</button>${avatar({ id: c.other_id, name: c.other_name }, "sm")}<strong>${esc(c.other_name)}</strong>
      <span class="chat-menu"><button class="link" data-act="reportchat">Report</button><button class="link" data-act="blockchat">Block</button></span></div>
    ${noticeHtml()}
    <div class="msgs" id="msgs">${msgsHtml()}</div>${note}${composer}</div>`;
}

function sayHiModal() {
  if (!sayHiId) return "";
  const p = findPerson(sayHiId);
  if (!p) return "";
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Say hi"><form class="modal report" data-form="sayhi">
    <h2>Say hi to ${esc(p.name)}</h2>
    <p class="hint">Send one short message. ${esc(p.name)} can accept, decline or block, and you can chat once they accept.</p>
    <div class="error" id="hiError" role="alert" hidden></div>
    <textarea name="text" maxlength="300" placeholder="Hi! I liked your profile..."></textarea>
    <button class="btn sun" type="submit">Send request</button>
    <button class="btn ghost" type="button" data-act="closesayhi">Cancel</button></form></div>`;
}

async function sendSayHi(data) {
  const text = (data.get("text") || "").toString().trim();
  const box = document.getElementById("hiError");
  const fail = (m) => { box.textContent = m; box.hidden = false; };
  if (!text) { fail("Write a short hello first."); return; }
  if (busy) return;
  busy = true;
  try {
    const { data: cid, error } = await sb.rpc("start_chat", { target: sayHiId, first_message: text });
    if (error) {
      if (error.message.includes("plan_required")) { sayHiId = null; notice = chatError(error); view = "plans"; render(); return; }
      fail(chatError(error));
      return;
    }
    await loadChats();
    await openChat(cid);
    render();
  } finally { busy = false; }
}

async function onChatEvent() {
  if (!user || !me) return;
  await loadChats();
  if (view === "chats") { render(true); return; }
  if (view === "chat") {
    const before = chatMsgs.length;
    await loadMessages();
    updateMsgsDom();
    if (chatMsgs.length > before) await markRead();
    const c = chats.find((x) => x.id === activeChat);
    if (c && c.status !== chatStatusShown) render(true);
  }
}

function startRealtime() {
  if (channel || !user) return;
  channel = sb.channel("chat-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, onChatEvent)
    .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, onChatEvent)
    .subscribe();
}

/* ---------- Plans and payments ---------- */

const money = (n) => "KSh " + Number(n).toLocaleString("en-KE");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function plansView() {
  const free = !status.payments_enabled;
  const plan = (key, title, price, days) => `<div class="plan${key === "monthly" ? " best" : ""}">
    <h3>${title}</h3><p class="price">${money(price)}</p><p class="hint">${days} days, about ${money(Math.round(price / days))} a day</p>
    <ul><li>See every member's contact number</li><li>Up to ${status.daily_view_limit} numbers a day</li><li>Pay with M-Pesa, no auto-renewal</li></ul>
    <button class="btn ${key === "monthly" ? "sun" : ""}" data-act="choosepay" data-plan="${key}" ${free ? "disabled" : ""}>${free ? "Free during testing" : "Choose " + title.toLowerCase()}</button></div>`;
  const lead = free ? "Everything is free while we test. Paid plans start later."
    : status.has_access && status.access_until ? "Your access is active until " + fmtDate(status.access_until) + "."
    : "Pick a plan to see contact numbers.";
  return `${appHead()}${noticeHtml()}
    <section class="b-hero slim"><h2>Plans</h2><p>${lead}</p></section>
    <div class="plans">${plan("weekly", "Weekly", status.weekly_price, 7)}${plan("monthly", "Monthly", status.monthly_price, 30)}</div>
    <p class="hint pad">You pay with M-Pesa: a prompt appears on your phone and you enter your PIN. Plans do not renew by themselves.</p>
    ${footerHtml()}`;
}

function payModal() {
  if (!payOpen) return "";
  const price = payPlan === "weekly" ? status.weekly_price : status.monthly_price;
  const name = payPlan === "weekly" ? "Weekly plan" : "Monthly plan";
  if (payWaiting) {
    return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Waiting for payment"><div class="modal"><h2>Check your phone</h2><p>Enter your M-Pesa PIN to pay ${money(price)}. This page updates by itself when the payment arrives.</p><button class="btn ghost" data-act="closepay">Close</button></div></div>`;
  }
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Pay with M-Pesa"><form class="modal report" data-form="pay">
    <h2>${name}: ${money(price)}</h2>
    ${payError ? `<div class="error" role="alert">${esc(payError)}</div>` : ""}
    <div class="field"><label for="payphone">M-Pesa number</label><input id="payphone" name="phone" type="tel" placeholder="07XX XXX XXX" value="${esc(me ? me.contact : "")}" /><div class="hint">You will get a payment prompt on this phone.</div></div>
    <button class="btn sun" type="submit">Send M-Pesa prompt</button>
    <button class="btn ghost" type="button" data-act="closepay">Cancel</button></form></div>`;
}

async function startPayment(data) {
  if (busy) return;
  busy = true;
  try {
    const { data: r, error } = await sb.functions.invoke("pay-start", { body: { plan: payPlan, phone: (data.get("phone") || "").toString() } });
    if (error || !r || !r.ok) { payError = (r && r.error) || "Could not start the payment. Please try again."; render(); return; }
    payError = "";
    payWaiting = true;
    render();
    pollPayment(r.paymentId);
  } finally { busy = false; }
}

async function pollPayment(id) {
  for (let i = 0; i < 30; i++) {
    await new Promise((res) => setTimeout(res, 3000));
    const { data } = await sb.from("payments").select("status").eq("id", id).maybeSingle();
    if (data && data.status === "paid") {
      await loadStatus();
      payOpen = false; payWaiting = false;
      notice = "Payment received. Your access is active.";
      render();
      return;
    }
    if (data && data.status === "failed") { payWaiting = false; payError = "The payment was not completed."; render(); return; }
  }
  payWaiting = false;
  payError = "We have not received a confirmation yet. If money was taken, your access will switch on shortly.";
  render();
}

/* ---------- Password ---------- */

function pwModal() {
  if (!pwOpen) return "";
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Change password"><form class="modal report" data-form="password">
    <h2>${recovering ? "Set a new password" : "Change password"}</h2>
    <div class="error" id="pwError" role="alert" hidden></div>
    <div class="field"><label for="pw1">New password</label><input id="pw1" name="pw1" type="password" autocomplete="new-password" /></div>
    <div class="field"><label for="pw2">Repeat it</label><input id="pw2" name="pw2" type="password" autocomplete="new-password" /></div>
    <button class="btn sun" type="submit">Save password</button>
    <button class="btn ghost" type="button" data-act="closepw">Cancel</button></form></div>`;
}

async function changePassword(data) {
  const box = document.getElementById("pwError");
  const fail = (m) => { box.textContent = m; box.hidden = false; };
  const a = (data.get("pw1") || "").toString();
  const b = (data.get("pw2") || "").toString();
  if (a.length < 8) { fail("Use at least 8 characters."); return; }
  if (a !== b) { fail("The two passwords do not match."); return; }
  if (busy) return;
  busy = true;
  try {
    const { error } = await sb.auth.updateUser({ password: a });
    if (error) { fail(error.message); return; }
    pwOpen = false;
    recovering = false;
    notice = "Your password has been updated.";
    render();
  } finally { busy = false; }
}

/* ---------- Report and block ---------- */

const findPerson = (id) => people.find((x) => x.id === id) || byId(id) || (() => { const c = chats.find((x) => x.other_id === id); return c ? { id, name: c.other_name } : null; })();

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
      const details = (data.get("details") || "").toString().trim().slice(0, 500);
      const r = reportConv ? await sb.rpc("report_chat", { conv: reportConv, reason: reason.toString(), details }) : await sb.from("reports").insert({ reporter_id: user.id, reported_id: p.id, reason: reason.toString(), details });
      if (r.error) { fail("Could not send: " + r.error.message); return; }
      if (block) {
        const b = await sb.from("blocks").insert({ blocker_id: user.id, blocked_id: p.id, blocked_name: p.name });
        if (b.error && b.error.code !== "23505") { fail("Could not block: " + b.error.message); return; }
        if (!blockedList.some((x) => x.id === p.id)) blockedList.push({ id: p.id, name: p.name });
      }
    }
    if (block && p) hide(p.id);
    reportId = null;
    const wasChat = !!reportConv;
    reportConv = null;
    if (wasChat) { await loadChats(); if (block) view = "chats"; }
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
  if (!editing && !data.get("consent")) return ["Please confirm you are 18 or older and agree to the Terms and Privacy Policy.", 3];
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
  if (!user && view !== "welcome" && view !== "auth" && !LEGALKEYS.includes(view)) view = "welcome";
  if (user && !me && ["browse", "saved", "plans", "chats", "chat", "profile", "edit"].includes(view)) view = "create";
  let html = "";
  if (view === "welcome") html = welcomeView();
  else if (LEGALKEYS.includes(view)) html = legalView(view);
  else if (view === "auth") html = authView();
  else if (view === "create" || view === "edit") html = formView();
  else if (view === "browse") html = browseView() + navView();
  else if (view === "saved") html = savedView() + navView();
  else if (view === "plans") html = plansView() + navView();
  else if (view === "chats") html = chatsView() + navView();
  else if (view === "chat") html = chatView();
  else if (view === "profile") html = profileView() + navView();
  app.innerHTML = html + reportModal() + pwModal() + payModal() + sayHiModal();
  document.body.classList.toggle("landing", view === "welcome");
  if (view === "create") showStep(1);
  if (view === "chat") window.scrollTo(0, document.body.scrollHeight);
  if (!keep && view !== "chat") window.scrollTo(0, 0);
}

/* ---------- Actions ---------- */

const actions = {
  start: () => {
    step = 1;
    photoList = [];
    if (user) view = me ? "browse" : "create";
    else { authMode = "signup"; view = "auth"; }
  },
  legalback: () => { history.replaceState(null, "", window.location.pathname); view = user ? (me ? "browse" : "create") : "welcome"; },
  changepw: () => { pwOpen = true; },
  closepw: () => { pwOpen = false; recovering = false; },
  togglepause: async () => {
    const { error } = await sb.from("profiles").update({ paused: !me.paused }).eq("id", user.id);
    if (error) { notice = "Could not update: " + error.message; return; }
    me.paused = !me.paused;
  },
  forgot: async () => {
    const email = ((document.getElementById("email") || {}).value || "").trim();
    if (!email) { notice = "Type your email above first, then tap Forgot your password."; return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    notice = error ? "Could not send the link: " + error.message : "If that email has an account, we have sent a link to reset the password.";
  },
  exportdata: () => {
    const out = { email: user.email, nickname: me.name, gender: me.gender, interested_in: me.seeking, area: me.loc, bio: me.bio, interests: me.interests, contact_number: me.contact, photos: me.photos.length, photos_blurred: me.blur, profile_paused: !!me.paused, blocked_people: blockedList.map((b) => b.name), contacts_viewed: viewedIds.size, downloaded_at: new Date().toISOString() };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }));
    a.download = "my-egerton-connect-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  },
  report: (d) => { reportId = d.id; },
  closereport: () => { reportId = null; reportConv = null; },
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
  sayhi: (d) => { sayHiId = d.id; },
  closesayhi: () => { sayHiId = null; },
  openchat: async (d) => { await openChat(d.cid || (chats.find((c) => c.other_id === d.id) || {}).id); },
  accept: async () => {
    const { error } = await sb.rpc("respond_chat", { conv: activeChat, approve: true });
    if (error) { notice = chatError(error); return; }
    await loadChats();
    await loadMessages();
  },
  decline: async () => {
    await sb.rpc("respond_chat", { conv: activeChat, approve: false });
    await loadChats();
    view = "chats";
  },
  blockchat: async () => {
    const c = chats.find((x) => x.id === activeChat);
    if (!c) return;
    if (!confirm("Block " + c.other_name + "? You will not be able to see or message each other.")) return;
    const b = await sb.from("blocks").insert({ blocker_id: user.id, blocked_id: c.other_id, blocked_name: c.other_name });
    if (b.error && b.error.code !== "23505") { notice = "Could not block: " + b.error.message; return; }
    if (!blockedList.some((x) => x.id === c.other_id)) blockedList.push({ id: c.other_id, name: c.other_name });
    hide(c.other_id);
    await loadChats();
    view = "chats";
  },
  reportchat: () => { const c = chats.find((x) => x.id === activeChat); if (c) { reportId = c.other_id; reportConv = c.id; } },
  reveal: async (d) => {
    const real = people.find((x) => x.id === d.id);
    if (!status.has_access) { view = "plans"; return; }
    if (!real) {
      if (!sampleUnlocked.includes(d.id)) sampleUnlocked.push(d.id);
      try { localStorage.setItem(SKEY, JSON.stringify(sampleUnlocked)); } catch (e) { /* ignore */ }
      return;
    }
    const { data, error } = await sb.rpc("get_contact", { target: d.id });
    if (error) { notice = error.message.includes("daily_limit") ? "You have reached today's limit of " + status.daily_view_limit + " numbers. Try again tomorrow." : "Could not show the number: " + error.message; return; }
    if (!data) { notice = "This number is not available."; return; }
    revealed[d.id] = data;
    viewedIds.add(d.id);
    await signPeople([real]);
  },
  choosepay: (d) => { payPlan = d.plan; payOpen = true; payError = ""; payWaiting = false; },
  closepay: () => { payOpen = false; payWaiting = false; },
  logout: async () => {
    await sb.auth.signOut();
    user = null; me = null; people = []; viewedIds = new Set(); revealed = {}; hiddenIds = loadHidden(); blockedList = []; chats = []; if (channel) { sb.removeChannel(channel); channel = null; }
    view = "welcome";
  },
  delete: async () => {
    if (!confirm("Permanently delete your account? This removes your profile, photos, contact number and login. It cannot be undone.")) return;
    if (me && me.photos.length) await sb.storage.from("photos").remove(me.photos.flatMap((n) => [`${user.id}/${n}.jpg`, `${user.id}/${n}-blur.jpg`]));
    const { error } = await sb.rpc("delete_my_account");
    if (error) { notice = "Could not delete: " + error.message; return; }
    await sb.auth.signOut({ scope: "local" });
    user = null; me = null; people = []; viewedIds = new Set(); revealed = {}; hiddenIds = loadHidden(); blockedList = []; chats = []; if (channel) { sb.removeChannel(channel); channel = null; }
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
  if (form.dataset.form === "password") { await changePassword(data); return; }
  if (form.dataset.form === "pay") { await startPayment(data); return; }
  if (form.dataset.form === "sayhi") { await sendSayHi(data); return; }
  if (form.dataset.form === "chat") {
    const text = (data.get("text") || "").toString().trim();
    if (!text) return;
    form.reset();
    const { error } = await sb.rpc("send_message", { conv: activeChat, body: text });
    if (error) { notice = chatError(error); render(true); return; }
    await loadMessages();
    updateMsgsDom();
    return;
  }
  const editing = view === "edit";
  if (!editing && step < STEPS) { stepNav("next"); return; }
  const err = validate(data, editing);
  if (err) { if (!editing) showStep(err[1]); showError(err[0]); return; }
  await saveProfile(data, editing);
});

/* ---------- Start ---------- */

{ const h = window.location.hash.slice(1); if (LEGALKEYS.includes(h)) view = h; }
sb.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") { recovering = true; pwOpen = true; render(); }
});
window.addEventListener("hashchange", () => {
  const h = window.location.hash.slice(1);
  if (LEGALKEYS.includes(h)) { view = h; render(); }
  else if (LEGALKEYS.includes(view)) { view = user ? (me ? "browse" : "create") : "welcome"; render(); }
});
render();
(async () => {
  try {
    const { data } = await sb.auth.getSession();
    if (data.session) { const keep = LEGALKEYS.includes(view) ? view : null; user = data.session.user; await afterLogin(); if (keep) view = keep; render(); }
  } catch (e) { /* stay on the landing page */ }
})();

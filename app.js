/* Egerton Connect - real accounts with Supabase.
   The publishable key below is meant to be public. Never put a secret or service_role key in this file. */

const SUPABASE_URL = "https://hfezzmtvngspvvmnpswy.supabase.co";
const SUPABASE_KEY = "sb_publishable_o0HidjHmVXfXzy7cPLq5Hw_cyAagOWf";

if (!window.supabase) {
  document.getElementById("app").innerHTML = '<p style="padding:24px">Could not load the login service. Check your connection and refresh the page.</p>';
  throw new Error("Supabase library missing");
}
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------- Lists used in profiles ---------- */

const LEGALKEYS = ["about", "terms", "privacy"];
const GENDERS = [["woman", "Woman"], ["man", "Man"], ["nonbinary", "Non-binary"]];
const INTEREST = { woman: "Women", man: "Men", nonbinary: "Non-binary people" };
const LOCATION_GROUPS = [
  ["campus", "Around the university", ["Egerton main campus"]],
  ["environs", "University environs", ["Egerton area"]],
  ["njoro", "Njoro town", ["Njoro town", "Njoro, near the market"]],
  ["nakuru", "Nakuru City", ["Nakuru town"]],
  ["other", "Elsewhere nearby", ["Elsewhere nearby"]],
];
const ZONES = LOCATION_GROUPS.flatMap((g) => g[2]);
const LOOKING = [["friends", "New friends"], ["dating", "Dating"], ["serious", "A serious relationship"], ["open", "Open to seeing"]];
const lookingLabel = (k) => (LOOKING.find((x) => x[0] === k) || [k, ""])[1];

const PROMPTS = [
  "The way to my heart is...",
  "My ideal weekend is...",
  "A fun fact about me is...",
  "The best advice I have received is...",
  "I get way too excited about...",
  "Two truths and a lie...",
  "My go-to karaoke song is...",
  "I am happiest when...",
  "A small thing that makes my day is...",
  "The first thing I would do with a free day is...",
];

const TAGS = [
  ["Music", ["Gospel", "Afrobeats", "Bongo", "Gengetone", "Hip hop", "R&B", "Rock", "Jazz", "Amapiano", "Live music"]],
  ["Screen and books", ["Movies", "Series", "Anime", "Comedy", "Reading", "Poetry", "Podcasts"]],
  ["Active", ["Football", "Basketball", "Running", "Gym", "Cycling", "Dancing", "Hiking", "Swimming"]],
  ["Food and drink", ["Cooking", "Baking", "Street food", "Coffee", "Trying new food"]],
  ["Outdoors", ["Nature", "Travel", "Photography", "Gardening", "Road trips"]],
  ["Creative", ["Art", "Writing", "Fashion", "Singing", "Playing an instrument"]],
  ["Tech and learning", ["Tech", "Gaming", "Chess", "Board games", "Languages"]],
  ["Community", ["Volunteering", "Entrepreneurship", "Farming", "Environment"]],
];

const VIBES = [
  ["social", "Going out or staying in", [["out", "Out and about"], ["home", "Homebody"], ["both", "A bit of both"]]],
  ["rhythm", "Daily rhythm", [["early", "Early bird"], ["night", "Night owl"], ["either", "Either"]]],
  ["personality", "Personality", [["intro", "Introvert"], ["extro", "Extrovert"], ["ambi", "Ambivert"]]],
  ["pets", "Pets", [["dog", "Dog person"], ["cat", "Cat person"], ["both", "Both"], ["none", "No pets"]]],
];
const LANGS = ["English", "Kiswahili", "Sheng", "Other"];
const STARS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const REJECT = ["Nudity or sexual content", "Not clearly you", "Contains text or contact details", "Minor or unclear age", "Not a real photo", "Other"];

/* Sample profiles, shown only until real people join */
const PROFILES = [
  { id: "p1", name: "Sunrise", gender: "woman", loc: "Njoro town", looking: "dating", bio: "Early riser, loves sunrise walks and a good chapati.", interests: ["Hiking", "Cooking", "Gospel"], prompts: [{ q: PROMPTS[0], a: "A long walk and fresh mandazi." }], vibe: { rhythm: "early", social: "both" } },
  { id: "p2", name: "Pixel", gender: "man", loc: "Egerton main campus", looking: "friends", bio: "Building small apps and losing at FIFA. Looking for good conversation.", interests: ["Tech", "Football", "Chess"], prompts: [{ q: PROMPTS[2], a: "I once fixed a laptop with a toothpick." }], vibe: { personality: "intro", pets: "dog" } },
  { id: "p3", name: "Mara", gender: "woman", loc: "Njoro, near the market", looking: "dating", bio: "Cheerful and always up for a movie night.", interests: ["Movies", "Dancing", "Volunteering"], prompts: [{ q: PROMPTS[1], a: "Movies, popcorn and zero alarms." }], vibe: { social: "home" } },
  { id: "p4", name: "Kito", gender: "man", loc: "Nakuru town", looking: "serious", bio: "Gym in the morning, busy at night. Serious about kind people.", interests: ["Gym", "Afrobeats", "Road trips"], prompts: [{ q: PROMPTS[4], a: "A perfectly planned road trip." }], vibe: { rhythm: "early" } },
  { id: "p5", name: "Zuri", gender: "woman", loc: "Egerton main campus", looking: "friends", bio: "Still finding my way around. Show me the best food spots.", interests: ["Reading", "Poetry", "Street food"], prompts: [{ q: PROMPTS[0], a: "Good books and honest conversations." }], vibe: { personality: "ambi" } },
  { id: "p6", name: "Maestro", gender: "man", loc: "Njoro town", looking: "open", bio: "Lab rat with a guitar. Free time is rare but real.", interests: ["Playing an instrument", "Coffee", "Jazz"], prompts: [{ q: PROMPTS[6], a: "Anything with a good guitar solo." }], vibe: { rhythm: "night" } },
  { id: "p7", name: "Nia", gender: "woman", loc: "Nakuru town", looking: "dating", bio: "Budget spreadsheets and bubble tea. Honest people only.", interests: ["Travel", "Photography", "Coffee"], prompts: [{ q: PROMPTS[7], a: "Exploring somewhere I have never been." }], vibe: { social: "out" } },
  { id: "p8", name: "Greenthumb", gender: "man", loc: "Egerton area", looking: "friends", bio: "Tree planter and weekend footballer.", interests: ["Nature", "Football", "Environment"], prompts: [{ q: PROMPTS[8], a: "Seeing a seedling finally sprout." }], vibe: { pets: "dog" } },
  { id: "p9", name: "Echo", gender: "nonbinary", loc: "Njoro town", looking: "friends", bio: "Podcasts, thrift finds and long talks about nothing.", interests: ["Podcasts", "Fashion", "Writing"], prompts: [{ q: PROMPTS[5], a: "I can juggle, I hate mangoes, I met a president." }], vibe: { personality: "intro" } },
  { id: "p10", name: "Cupcake", gender: "woman", loc: "Egerton main campus", looking: "dating", bio: "I bake on weekends and share the results.", interests: ["Baking", "Series", "Running"], prompts: [{ q: PROMPTS[0], a: "A warm slice of anything I baked." }], vibe: { social: "home", pets: "cat" } },
  { id: "p11", name: "Dusk", gender: "man", loc: "Njoro, near the market", looking: "open", bio: "Calm, likes quiet evenings and good music.", interests: ["Live music", "Farming", "Cycling"], prompts: [{ q: PROMPTS[1], a: "Cycling, then a quiet evening." }], vibe: { rhythm: "night" } },
  { id: "p12", name: "Puzzle", gender: "nonbinary", loc: "Egerton area", looking: "friends", bio: "Puzzles, board games and kind people. Say hi.", interests: ["Board games", "Chess", "Anime"], prompts: [{ q: PROMPTS[2], a: "I finished a 2000-piece puzzle in a weekend." }], vibe: { social: "home" } },
];

/* ---------- State ---------- */

const SAVEKEY = "egertonConnect.saved";
const HKEY = "egertonConnect.hidden";
const readSet = (k) => { try { return new Set(JSON.parse(localStorage.getItem(k)) || []); } catch (e) { return new Set(); } };
let savedIds = readSet(SAVEKEY);
const loadHidden = () => readSet(HKEY);
let hiddenIds = loadHidden();

let user = null;
let me = null;
let people = [];
let myPhotos = [];
let blockedList = [];
let chats = [];
let cfg = { payments_enabled: false, daily_chat_limit: 10, request_days: 10, retry_days: 30, credits: 0, packs: [], is_admin: false };
let adminData = { photos: [], reports: [] };

let view = "welcome";
let authMode = "signup";
let step = 1;
const STEPS = 3;
let notice = "";
let busy = false;
let areaFilter = "all";
let interestFilter = "all";
let lookFilter = "all";
let query = "";
let justJoined = false;
let reportId = null;
let reportConv = null;
let pwOpen = false;
let recovering = false;
let payOpen = false;
let payPack = "";
let payWaiting = false;
let payError = "";
let activeChat = null;
let chatMsgs = [];
let chatStatusShown = "";
let sayHiId = null;
let channel = null;

const app = document.getElementById("app");
const byId = (id) => PROFILES.find((p) => p.id === id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hue = (id) => (String(id).split("").reduce((a, c) => a + c.charCodeAt(0) * 17, 0) % 360);
const avatar = (p, cls) => `<div class="avatar ${cls || ""}" style="--h:${hue(p.id || p.name)}" aria-hidden="true">${esc(String(p.name || "?")[0])}</div>`;
const genderLabel = (g) => (GENDERS.find((x) => x[0] === g) || [g, g])[1];
const money = (n) => "KSh " + Number(n).toLocaleString("en-KE");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const daysLeft = (d) => Math.max(1, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));
const withinDays = (d, n) => !!d && Date.now() - new Date(d).getTime() < n * 86400000;

function svgAvatar(p) {
  const h = hue(p.id);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 55% 62%)"/><stop offset="1" stop-color="hsl(${(h + 50) % 360} 55% 35%)"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><circle cx="200" cy="120" r="52" fill="rgba(255,255,255,0.85)"/><path d="M80 300c0-72 54-112 120-112s120 40 120 112z" fill="rgba(255,255,255,0.85)"/></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
PROFILES.forEach((p) => { p.photoUrls = [svgAvatar(p)]; p.sample = true; });

function stripHtml(urls, name) {
  return `<div class="strip">${urls.map((u, i) => `<img class="photo" src="${esc(u)}" alt="Photo ${i + 1} of ${esc(name)}" loading="lazy" />`).join("")}</div>`;
}
const photoBlock = (p) => (p.photoUrls && p.photoUrls.length ? stripHtml(p.photoUrls, p.name) : avatar(p));
const myApprovedUrls = () => myPhotos.filter((x) => x.status === "approved" && x.url).map((x) => x.url);

function noticeHtml() {
  const n = notice;
  notice = "";
  return n ? `<div class="notice" role="status">${esc(n)}</div>` : "";
}

function toggleSave(id) {
  if (savedIds.has(id)) savedIds.delete(id); else savedIds.add(id);
  try { localStorage.setItem(SAVEKEY, JSON.stringify([...savedIds])); } catch (e) { /* ignore */ }
}

function hide(id) {
  hiddenIds.add(id);
  if (byId(id)) { try { localStorage.setItem(HKEY, JSON.stringify([...hiddenIds].filter((x) => byId(x)))); } catch (e) { /* ignore */ } }
}

function vibeBits(v) {
  v = v || {};
  const out = [];
  VIBES.forEach(([k, , opts]) => { const o = opts.find((x) => x[0] === v[k]); if (o) out.push(o[1]); });
  (v.languages || []).forEach((l) => out.push(l));
  if (v.star) out.push(v.star);
  return out;
}

/* ---------- Data ---------- */

async function signUrls(paths) {
  if (!paths.length) return [];
  const { data } = await sb.storage.from("photos").createSignedUrls(paths, 3600);
  return (data || []).map((d) => d.signedUrl || "");
}

async function loadStatus() {
  const { data } = await sb.rpc("get_app_status");
  if (data) cfg = data;
}

async function loadMe() {
  const { data: p } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!p) { me = null; return; }
  me = { id: p.id, name: p.nickname, gender: p.gender, seeking: p.seeking || [], loc: p.area, looking: p.looking_for || "", bio: p.bio || "", interests: p.interests || [], prompts: p.prompts || [], vibe: p.vibe || {}, paused: !!p.paused };
}

async function loadMyPhotos() {
  const { data } = await sb.from("profile_photos").select("id,path,is_main,status,reject_reason,created_at").eq("user_id", user.id).order("is_main", { ascending: false }).order("created_at", { ascending: true });
  myPhotos = data || [];
  const urls = await signUrls(myPhotos.map((x) => x.path));
  myPhotos.forEach((x, i) => { x.url = urls[i] || ""; });
}

async function loadPeople() {
  const { data } = await sb.rpc("browse_profiles");
  people = (data || []).map((r) => ({ id: r.id, name: r.nickname, gender: r.gender, loc: r.area, looking: r.looking_for || "", bio: r.bio || "", interests: r.interests || [], prompts: r.prompts || [], vibe: r.vibe || {}, paths: r.photos || [], last_active: r.last_active, created_at: r.created_at }));
  const urls = await signUrls(people.flatMap((p) => p.paths));
  let i = 0;
  people.forEach((p) => { p.photoUrls = p.paths.map(() => urls[i++] || "").filter(Boolean); });
  const bl = await sb.from("blocks").select("blocked_id,blocked_name");
  blockedList = (bl.data || []).map((x) => ({ id: x.blocked_id, name: x.blocked_name }));
}

async function loadAdmin() {
  const ph = await sb.rpc("admin_pending_photos");
  const rp = await sb.rpc("admin_reports");
  adminData.photos = ph.data || [];
  adminData.reports = rp.data || [];
  const urls = await signUrls(adminData.photos.map((x) => x.path));
  adminData.photos.forEach((x, i) => { x.url = urls[i] || ""; });
}

async function afterLogin() {
  await loadStatus();
  await loadMe();
  await loadMyPhotos();
  if (me) {
    await loadPeople();
    await loadChats();
    startRealtime();
    sb.rpc("touch_active");
    view = "browse";
  } else {
    view = "create";
  }
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
    const val = (k) => (data.get(k) || "").toString();
    const prompts = [1, 2, 3].map((i) => ({ q: val("pq" + i), a: val("pa" + i).trim().slice(0, 140) })).filter((x) => x.q && x.a);
    const vibe = {};
    VIBES.forEach(([k]) => { if (val("v_" + k)) vibe[k] = val("v_" + k); });
    const langs = data.getAll("langs");
    if (langs.length) vibe.languages = langs;
    if (val("star")) vibe.star = val("star");
    const row = {
      id: user.id,
      nickname: val("name").trim(),
      gender: val("gender"),
      seeking: data.getAll("seeking"),
      area: val("location"),
      looking_for: val("looking") || null,
      bio: val("bio").trim(),
      interests: data.getAll("tags").slice(0, 8),
      adult_confirmed: true,
    };
    if (editing) { row.prompts = prompts; row.vibe = vibe; }
    const r = await sb.from("profiles").upsert(row);
    if (r.error) { showError(r.error.message); return; }
    await loadMe();
    await loadPeople();
    await loadChats();
    startRealtime();
    if (!editing) justJoined = true;
    view = editing ? "profile" : "browse";
    render();
  } finally { busy = false; }
}

/* ---------- Photos ---------- */

const toBlob = (c) => new Promise((res) => c.toBlob(res, "image/jpeg", 0.8));

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
  const r = Math.min(1, 900 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.width * r));
  c.height = Math.max(1, Math.round(img.height * r));
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return toBlob(c);
}

function photoGridHtml() {
  const label = { approved: "Approved", pending: "Waiting for approval", rejected: "Not approved" };
  const slots = myPhotos.map((p) => `<div class="pm">${p.url ? `<img src="${esc(p.url)}" alt="Your photo" />` : `<div class="pm-empty"></div>`}
      ${p.is_main ? `<span class="tagmain">Main</span>` : ""}
      <span class="st ${esc(p.status)}">${label[p.status] || p.status}</span>
      ${p.status === "rejected" && p.reject_reason ? `<small class="why">${esc(p.reject_reason)}</small>` : ""}
      <div class="pm-actions">${p.status === "approved" && !p.is_main ? `<button type="button" class="link dark" data-act="mainphoto" data-id="${esc(p.id)}">Make main</button>` : ""}<button type="button" class="link dark" data-act="rmphoto" data-id="${esc(p.id)}">Remove</button></div></div>`).join("");
  const add = myPhotos.length < 6 ? `<label class="pm add"><input id="photos" class="vh" type="file" accept="image/*" multiple /><span>+ Add photo</span></label>` : "";
  return slots + add;
}

function photoFieldHtml() {
  return `<div class="field"><label>Photos <span class="hint">(your main photo plus up to 5 more)</span></label>
    <p class="hint">Photo rules: only you, clothed, nothing sexual. No minors, weapons or drugs. No phone numbers, social handles or other writing on photos. New photos are checked before other members can see them.</p>
    <div class="pmgrid" id="pmgrid">${photoGridHtml()}</div><div class="hint" id="photoMsg" role="status"></div></div>`;
}

function refreshPhotoGrid(msg) {
  const g = document.getElementById("pmgrid");
  if (g) g.innerHTML = photoGridHtml();
  const m = document.getElementById("photoMsg");
  if (m) m.textContent = msg || "";
}

async function addPhotos(files) {
  for (const f of files) {
    if (myPhotos.length >= 6) break;
    refreshPhotoGrid("Uploading...");
    try {
      const blob = await processPhoto(f);
      const path = `${user.id}/${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}.jpg`;
      const up = await sb.storage.from("photos").upload(path, blob, { contentType: "image/jpeg" });
      if (up.error) throw up.error;
      const { error } = await sb.rpc("add_photo", { p_path: path });
      if (error) { await sb.storage.from("photos").remove([path]); throw error; }
      await loadMyPhotos();
      refreshPhotoGrid("Photo added. It will be visible to others once it is approved.");
    } catch (e) {
      refreshPhotoGrid("Could not add that photo. Please try another image.");
    }
  }
}

async function removePhoto(id) {
  const { data, error } = await sb.rpc("remove_photo", { p_id: id });
  if (error) { refreshPhotoGrid("Could not remove that photo."); return; }
  if (data) await sb.storage.from("photos").remove([data]);
  await loadMyPhotos();
  refreshPhotoGrid("");
}

async function makeMain(id) {
  const { error } = await sb.rpc("set_main_photo", { p_id: id });
  if (error) { refreshPhotoGrid("Could not change the main photo."); return; }
  await loadMyPhotos();
  refreshPhotoGrid("");
}

/* ---------- Views: landing and sign-in ---------- */

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
          <p class="lead reveal" style="--d:.2s">A respectful community for adults around Egerton to meet and connect. Join with a nickname, and share only what you choose.</p>
          <button class="btn sun big reveal" style="--d:.3s" data-act="start">Create my profile</button>
          <p class="fine reveal" style="--d:.4s">Free to join. Just 3 quick steps.</p>
        </div>
        <div class="hero-art reveal" style="--d:.35s" aria-hidden="true">
          ${mini("p1", "Now in Njoro town")}
          ${mini("p2", "Now at Egerton main campus")}
          <div class="fc fc-match"><strong>Say hi</strong></div>
          ${mini("p7", "Now in Nakuru town")}
        </div>
      </div>
    </section>
    <section class="trust"><div class="trust-in">
      <div><strong>Nicknames, no phone numbers</strong><span>Join without giving your real name or number.</span></div>
      <div><strong>Photos checked first</strong><span>Every photo is reviewed before other members see it.</span></div>
      <div><strong>Adults only</strong><span>Everyone confirms they are 18 or older.</span></div>
    </div></section>
    <section class="how">
      <h2>Join in three simple steps</h2>
      <div class="steps3">
        <div class="how-card"><span class="num">1</span><h3>Create your account</h3><p>Sign up with your email and a password. It takes less than a minute.</p></div>
        <div class="how-card"><span class="num">2</span><h3>Set up your profile</h3><p>Choose a nickname, your area and a few things you enjoy. Add your photos.</p></div>
        <div class="how-card"><span class="num">3</span><h3>Start connecting</h3><p>Browse members, say hi, and chat once they accept.</p></div>
      </div>
    </section>
    <section class="final">
      <h2>Ready when you are</h2>
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

/* ---------- Views: profile form ---------- */

function formView() {
  const editing = view === "edit";
  const m = editing ? me : {};
  const seeking = m.seeking || [];
  const tags = m.interests || [];
  const vibe = m.vibe || {};
  const prompts = m.prompts || [];
  const chip = (type, name, g, on) => `<label class="chip"><input type="${type}" name="${name}" value="${esc(g[0])}" ${on ? "checked" : ""} /><span>${esc(g[1])}</span></label>`;
  const nameF = `<div class="field"><label for="name">Choose a nickname</label><input id="name" name="name" type="text" maxlength="30" autocomplete="off" placeholder="e.g. Sunrise" value="${esc(m.name || "")}" /><div class="hint">Shown to everyone, so please do not use your real name.</div></div>`;
  const genderF = `<div class="field"><fieldset><legend>Gender</legend><div class="chips">${GENDERS.map((g) => chip("radio", "gender", g, m.gender === g[0])).join("")}</div></fieldset></div>`;
  const seekF = `<div class="field"><fieldset><legend>Interested in</legend><div class="chips">${GENDERS.map((g) => chip("checkbox", "seeking", [g[0], INTEREST[g[0]]], seeking.includes(g[0]))).join("")}</div><div class="hint">Pick one or more.</div></fieldset></div>`;
  const locF = `<div class="field"><label for="location">Current area</label><select id="location" name="location"><option value="">Choose an area</option>${LOCATION_GROUPS.map(([k, label, zs]) => `<optgroup label="${esc(label)}">${zs.map((z) => `<option ${m.loc === z ? "selected" : ""}>${esc(z)}</option>`).join("")}</optgroup>`).join("")}</select><div class="hint">A general area only, so nobody can find your exact spot.</div></div>`;
  const lookF = `<div class="field"><fieldset><legend>Looking for <span class="hint">(optional)</span></legend><div class="chips">${LOOKING.map((l) => chip("radio", "looking", l, m.looking === l[0])).join("")}</div></fieldset></div>`;
  const bioF = `<div class="field"><label for="bio">About me <span class="hint">(optional)</span></label><textarea id="bio" name="bio" maxlength="200" placeholder="A line or two about you. Please do not include phone numbers or social media handles.">${esc(m.bio || "")}</textarea></div>`;
  const tagsF = `<div class="field"><fieldset><legend>Interests <span class="hint">(pick up to 8)</span></legend>${TAGS.map(([g, list]) => `<p class="taggroup">${esc(g)}</p><div class="chips">${list.map((t) => chip("checkbox", "tags", [t, t], tags.includes(t))).join("")}</div>`).join("")}<div class="hint" id="tagcount">${tags.length} of 8 chosen</div></fieldset></div>`;
  const promptsF = `<div class="field"><fieldset><legend>Prompts <span class="hint">(optional, up to 3)</span></legend>${[0, 1, 2].map((i) => { const x = prompts[i] || {}; return `<div class="promptrow"><select name="pq${i + 1}" aria-label="Prompt ${i + 1}"><option value="">Choose a prompt</option>${PROMPTS.map((q) => `<option ${x.q === q ? "selected" : ""}>${esc(q)}</option>`).join("")}</select><input name="pa${i + 1}" type="text" maxlength="140" placeholder="Your answer" aria-label="Answer ${i + 1}" value="${esc(x.a || "")}" /></div>`; }).join("")}</fieldset></div>`;
  const vibeF = `<div class="field"><fieldset><legend>Your vibe <span class="hint">(optional)</span></legend><div class="vibegrid">${VIBES.map(([k, label, opts]) => `<div><label for="v_${k}">${esc(label)}</label><select id="v_${k}" name="v_${k}"><option value="">Skip</option>${opts.map(([v, l]) => `<option value="${v}" ${vibe[k] === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></div>`).join("")}<div><label for="star">Star sign</label><select id="star" name="star"><option value="">Skip</option>${STARS.map((z) => `<option ${vibe.star === z ? "selected" : ""}>${z}</option>`).join("")}</select></div></div><p class="taggroup">Languages</p><div class="chips">${LANGS.map((l) => chip("checkbox", "langs", [l, l], (vibe.languages || []).includes(l))).join("")}</div></fieldset></div>`;
  const consentF = `<label class="check"><input type="checkbox" name="consent" /> <span>I am 18 or older, I agree to the <a href="#terms" target="_blank" rel="noopener">Terms</a> and <a href="#privacy" target="_blank" rel="noopener">Privacy Policy</a>, and I will treat people with respect.</span></label>`;
  const errBox = `<div class="error" id="formError" role="alert" hidden></div>`;

  if (editing) {
    return `${appHead()}<div class="topbar"><h2>Edit profile</h2></div>
    <form class="form" data-form="profile" novalidate>${errBox}${nameF}${genderF}${seekF}${locF}${lookF}${bioF}${promptsF}${tagsF}${vibeF}${photoFieldHtml()}
      <button class="btn" type="submit">Save changes</button>
      <button class="btn ghost" type="button" data-act="nav" data-to="profile">Cancel</button></form>`;
  }
  return `<div class="topbar"><h2>Create your profile</h2><span class="tag" id="stepLabel">Step 1 of 3</span></div>
  <div class="progress" aria-hidden="true"><div id="bar"></div></div>
  <form class="form" data-form="profile" novalidate>${errBox}
    <section class="step" data-step="1"><h3 class="step-title">First, the basics</h3>${nameF}${genderF}${seekF}</section>
    <section class="step" data-step="2" hidden><h3 class="step-title">About you</h3>${locF}${lookF}${bioF}${tagsF}</section>
    <section class="step" data-step="3" hidden><h3 class="step-title">Photos and finish</h3>${photoFieldHtml()}${consentF}<p class="hint">You can add prompts and more about yourself later from My profile.</p></section>
    <div class="step-nav">
      <button class="btn ghost" type="button" data-act="prev">Back</button>
      <button class="btn" type="button" id="nextBtn" data-act="next">Next</button>
      <button class="btn sun" type="submit" id="doneBtn" hidden>Complete Sign Up</button>
    </div>
  </form>`;
}

/* ---------- Views: cards and browsing ---------- */

const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

const commonOf = (p) => (p.interests || []).filter((t) => me && (me.interests || []).includes(t));

function cardHtml(p, i) {
  const common = commonOf(p);
  const badges = [
    withinDays(p.last_active, 7) ? `<span class="bdg act">Active this week</span>` : "",
    withinDays(p.created_at, 7) ? `<span class="bdg new">New here</span>` : "",
    p.looking ? `<span class="bdg">${esc(lookingLabel(p.looking))}</span>` : "",
    common.length ? `<span class="bdg com">${common.length} in common</span>` : "",
  ].join("");
  const prompts = (p.prompts || []).map((x) => `<div class="prompt"><small>${esc(x.q)}</small><p>${esc(x.a)}</p></div>`).join("");
  const tags = (p.interests || []).map((t) => `<span${common.includes(t) ? ' class="tag-common"' : ""}>${esc(t)}</span>`).join("");
  const vibe = vibeBits(p.vibe).map((t) => `<span class="soft">${esc(t)}</span>`).join("");
  const conv = chats.find((c) => c.other_id === p.id);
  const hi = p.sample ? ""
    : conv && conv.status === "declined" ? `<p class="hint">Not available right now.</p>`
    : conv ? `<button class="btn small ghost hibtn" data-act="openchat" data-id="${esc(p.id)}">${conv.status === "accepted" ? "Open chat" : conv.initiated_by_me ? "Request sent" : "Reply"}</button>`
    : `<button class="btn small hibtn" data-act="sayhi" data-id="${esc(p.id)}">Say hi</button>`;
  const saved = savedIds.has(p.id);
  return `<article class="card" style="--i:${i || 0}">
    <div class="media">${photoBlock(p)}
      <button class="heart${saved ? " on" : ""}" data-act="save" data-id="${esc(p.id)}" aria-pressed="${saved}" aria-label="Save ${esc(p.name)}">${HEART}</button>
      <div class="cap"><h3>${esc(p.name)}</h3><span class="loc">Now in ${esc(p.loc)}</span></div>
    </div>
    <div class="body">
      ${badges ? `<div class="badges">${badges}</div>` : ""}
      ${p.bio ? `<p>${esc(p.bio)}</p>` : ""}
      ${prompts}
      ${tags ? `<div class="tags">${tags}</div>` : ""}
      ${vibe ? `<div class="tags soft">${vibe}</div>` : ""}
      ${hi}
      <button class="reportlink" data-act="report" data-id="${esc(p.id)}">Report or block</button>
    </div></article>`;
}

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const baseList = () => (people.length ? people : PROFILES.filter((p) => me.seeking.includes(p.gender))).filter((p) => !hiddenIds.has(p.id));

function appHead() {
  const n = unreadTotal();
  const tab = (to, label, extra) => `<button data-act="nav" data-to="${to}" ${view === to ? 'aria-current="page"' : ""}>${label}${extra || ""}</button>`;
  const badge = `<span class="badge chatbadge" ${n ? "" : "hidden"}>${n}</span>`;
  return `<header class="app-head"><button class="brandbtn" data-act="nav" data-to="welcome" aria-label="Back to the home page">Egerton Connect</button>
    <nav class="topnav" aria-label="Main">${tab("browse", "Browse")}${tab("saved", "Saved")}${tab("chats", "Chats", badge)}${cfg.payments_enabled ? tab("credits", "Credits") : ""}${tab("profile", "My profile")}${cfg.is_admin ? tab("admin", "Moderator") : ""}</nav>
    <button class="me-chip" data-act="nav" data-to="profile" aria-label="My profile">${avatar(me, "sm")}</button></header>`;
}

function navView() {
  const n = unreadTotal();
  const tab = (to, label, extra) => `<button data-act="nav" data-to="${to}" ${view === to ? 'aria-current="page"' : ""}>${label}${extra || ""}</button>`;
  const badge = `<span class="badge chatbadge" ${n ? "" : "hidden"}>${n}</span>`;
  return `<nav class="nav" aria-label="Main">${tab("browse", "Browse")}${tab("chats", "Chats", badge)}${tab("saved", "Saved")}${tab("profile", "Me")}</nav>`;
}

function legalView(key) {
  const page = LEGAL[key];
  return `<main class="legal"><button class="link dark" data-act="legalback">&larr; Back</button><h1>${page.title}</h1><p class="updated">Last updated: 23 November 2026</p>${page.html}
    <nav class="foot-links" aria-label="Site information"><a href="#about">About</a><a href="#terms">Terms</a><a href="#privacy">Privacy</a></nav></main>`;
}

function footerHtml() {
  return `<footer class="site-foot"><strong>Egerton Connect</strong><span>Made for the Egerton community. Adults only (18+).</span><nav class="foot-links" aria-label="Site information"><a href="#about">About</a><a href="#terms">Terms</a><a href="#privacy">Privacy</a></nav></footer>`;
}

function completeCard() {
  const approved = myPhotos.some((x) => x.status === "approved");
  const checks = [true, approved, !!me.bio, me.prompts.length > 0, me.interests.length >= 3];
  const done = checks.filter(Boolean).length;
  if (done === checks.length) return "";
  const todo = [!checks[1] && "an approved photo", !checks[2] && "a short bio", !checks[3] && "a prompt", !checks[4] && "at least 3 interests"].filter(Boolean).join(", ");
  const pct = Math.round((done / checks.length) * 100);
  return `<div class="complete"><div><strong>Your profile is ${pct}% complete</strong><span>Add ${todo} to stand out.</span><div class="meter"><i style="width:${pct}%"></i></div></div><button class="btn sun small" data-act="edit">Complete it</button></div>`;
}

function filtered() {
  let list = baseList();
  if (areaFilter !== "all") { const g = LOCATION_GROUPS.find((x) => x[0] === areaFilter); if (g) list = list.filter((p) => g[2].includes(p.loc)); }
  if (interestFilter !== "all") list = list.filter((p) => (p.interests || []).includes(interestFilter));
  if (lookFilter !== "all") list = list.filter((p) => p.looking === lookFilter);
  const q = query.trim().toLowerCase();
  if (q) list = list.filter((p) => [p.name, p.bio, p.loc].concat(p.interests || [], (p.prompts || []).map((x) => x.a)).join(" ").toLowerCase().includes(q));
  return list;
}

function resultsHtml() {
  const list = filtered();
  const head = `<div class="results-head"><strong>${list.length} ${list.length === 1 ? "profile" : "profiles"}</strong><span>${areaFilter === "all" ? "everywhere" : "in " + esc((LOCATION_GROUPS.find((x) => x[0] === areaFilter) || ["", areaFilter])[1])}</span></div>`;
  return head + (list.length ? `<div class="cards">${list.map(cardHtml).join("")}</div>` : `<div class="empty"><h3>No matches</h3><p>Try a different area, interest or search.</p></div>`);
}

function browseView() {
  const base = baseList();
  const counts = {};
  base.forEach((p) => (p.interests || []).forEach((x) => { counts[x] = (counts[x] || 0) + 1; }));
  const top = Object.keys(counts).sort((x, y) => counts[y] - counts[x]).slice(0, 8);
  const achips = `<button class="fchip" data-act="area" data-z="all" aria-pressed="${areaFilter === "all"}">Everywhere <span class="cnt">${base.length}</span></button>` + LOCATION_GROUPS.map((g) => `<button class="fchip" data-act="area" data-z="${g[0]}" aria-pressed="${areaFilter === g[0]}">${esc(g[1])} <span class="cnt">${base.filter((p) => g[2].includes(p.loc)).length}</span></button>`).join("");
  const lchips = [["all", "Anything"]].concat(LOOKING).map((l) => `<button class="fchip alt" data-act="look" data-l="${l[0]}" aria-pressed="${lookFilter === l[0]}">${esc(l[1])}</button>`).join("");
  const ichips = ["all"].concat(top).map((x) => `<button class="fchip alt" data-act="interest" data-i="${esc(x)}" aria-pressed="${interestFilter === x}">${x === "all" ? "All interests" : esc(x)}</button>`).join("");
  const approved = myPhotos.some((x) => x.status === "approved");
  const pending = myPhotos.some((x) => x.status === "pending");
  const photoBanner = approved ? ""
    : pending ? `<div class="notice paused"><span>Your photo is waiting for approval. You will appear in Browse once it is approved.</span></div>`
    : `<div class="notice paused"><span>Add a photo so other members can see you in Browse.</span><button class="btn sun small" data-act="edit">Add a photo</button></div>`;
  const welcome = justJoined
    ? `<div class="welcome-card"><div class="confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><h3>You're in, ${esc(me.name)}!</h3><p>Your profile is live. Have a look around, and add prompts and more about yourself any time from My profile.</p><button class="btn sun small" data-act="closewelcome">Got it</button></div>`
    : "";
  return `${appHead()}
    <section class="b-hero">
      <p class="eyebrow">${greeting()}</p>
      <h2>${esc(me.name)}, who will you meet today?</h2>
      <div class="stats"><span><b>${base.length}</b> profiles</span><span><b>${new Set(base.map((p) => p.loc)).size}</b> areas</span><span><b>18+</b> only</span></div>
      <label class="search"><span class="sr">Search profiles</span><input id="q" type="search" placeholder="Search by nickname or interest" value="${esc(query)}" autocomplete="off" /></label>
      <p class="chiplabel">Browse by location</p>
      <div class="fchips" role="group" aria-label="Browse by location">${achips}</div>
    </section>
    ${me.paused ? `<div class="notice paused"><span>Your profile is paused, so nobody can see it.</span><button class="btn sun small" data-act="togglepause">Show it again</button></div>` : ""}
    ${photoBanner}${welcome}${noticeHtml()}${completeCard()}
    <section class="interests"><h3>Looking for</h3><div class="fchips" role="group" aria-label="Filter by what people are looking for">${lchips}</div></section>
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

/* ---------- Views: chats ---------- */

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
  if (m.includes("credits_required")) return "You need a credit to send a new request. Replying to a request is always free.";
  if (m.includes("daily_limit")) return "You have reached today's limit of new chat requests. Try again tomorrow.";
  if (m.includes("declined")) return "This person declined recently. You can ask again after " + cfg.retry_days + " days.";
  if (m.includes("already_sent")) return "You already sent a request. Please wait for a reply.";
  if (m.includes("slow_down")) return "You are sending messages too fast. Please wait a moment.";
  if (m.includes("bad_message")) return "Your message is empty or too long.";
  if (m.includes("suspended")) return "Your account is suspended. Please contact support.";
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
  const section = (title, list, lineFn) => (list.length ? `<h3 class="sec">${title}</h3><div class="list">${list.map((c) => row(c, lineFn ? lineFn(c) : "")).join("")}</div>` : "");
  const left = (c) => (c.expires_at ? "Expires in " + daysLeft(c.expires_at) + (daysLeft(c.expires_at) === 1 ? " day" : " days") : "");
  const empty = !incoming.length && !active.length && !sent.length;
  return `${appHead()}${noticeHtml()}
    <section class="b-hero slim"><h2>Chats</h2><p>Message people once they accept your request.</p></section>
    ${section("Requests", incoming, left)}${section("Chats", active)}${section("Waiting for a reply", sent, (c) => "Request sent. " + left(c))}
    ${empty ? `<div class="empty"><h3>No chats yet</h3><p>Tap Say hi on a profile to send a request.</p><button class="btn ghost" data-act="nav" data-to="browse">Browse profiles</button></div>` : ""}
    ${footerHtml()}`;
}

function chatView() {
  const c = chats.find((x) => x.id === activeChat);
  if (!c) return `${appHead()}<div class="empty"><h3>Chat not found</h3><button class="btn ghost" data-act="nav" data-to="chats">Back to chats</button></div>`;
  chatStatusShown = c.status;
  const incoming = c.status === "pending" && !c.initiated_by_me;
  const note = incoming
    ? `<div class="req-actions"><p class="hint">${esc(c.other_name)} would like to chat. You can accept, decline or block. This request expires in ${c.expires_at ? daysLeft(c.expires_at) : cfg.request_days} days.</p><button class="btn sun" data-act="accept">Accept</button><button class="btn ghost" data-act="decline">Decline</button></div>`
    : c.status === "pending" ? `<p class="hint pad">Waiting for ${esc(c.other_name)} to accept. This request expires in ${c.expires_at ? daysLeft(c.expires_at) : cfg.request_days} days. You can send more messages once they accept.</p>`
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
  const cost = cfg.payments_enabled
    ? `<p class="hint">This uses 1 credit (you have ${cfg.credits}). Credits are not refunded if the request is declined or not answered within ${cfg.request_days} days.</p>`
    : `<p class="hint">Chat requests are free while we test.</p>`;
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Say hi"><form class="modal report" data-form="sayhi">
    <h2>Say hi to ${esc(p.name)}</h2>
    <p class="hint">Send one short message. ${esc(p.name)} can accept, decline or block, and you can chat once they accept.</p>
    ${cost}
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
      if (error.message.includes("credits_required")) { sayHiId = null; notice = chatError(error); view = "credits"; await loadStatus(); render(); return; }
      fail(chatError(error));
      return;
    }
    await loadStatus();
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

/* ---------- Views: credits and payment ---------- */

function creditsView() {
  const packs = cfg.packs.map((k) => `<div class="plan${k.id === "plus" ? " best" : ""}">
    <h3>${esc(k.name)}</h3><p class="price">${money(k.price)}</p><p class="hint">${k.credits} chat requests, about ${money(Math.round(k.price / k.credits))} each</p>
    <ul><li>Each request starts one new chat</li><li>Replying to requests is always free</li><li>Pay with M-Pesa</li></ul>
    <button class="btn ${k.id === "plus" ? "sun" : ""}" data-act="choosepay" data-pack="${esc(k.id)}">Buy ${esc(k.name)}</button></div>`).join("");
  return `${appHead()}${noticeHtml()}
    <section class="b-hero slim"><h2>Credits</h2><p>You have <b>${cfg.credits}</b> chat ${cfg.credits === 1 ? "request" : "requests"} left.</p></section>
    <div class="plans">${packs}</div>
    <p class="hint pad">A request that is declined, or not answered within ${cfg.request_days} days, is not refunded and disappears. You can pay again to send a new one. After a decline, you can ask the same person again after ${cfg.retry_days} days.</p>
    ${footerHtml()}`;
}

function payModal() {
  if (!payOpen) return "";
  const k = cfg.packs.find((x) => x.id === payPack);
  if (!k) return "";
  if (payWaiting) {
    return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Waiting for payment"><div class="modal"><h2>Check your phone</h2><p>Enter your M-Pesa PIN to pay ${money(k.price)}. This page updates by itself when the payment arrives.</p><button class="btn ghost" data-act="closepay">Close</button></div></div>`;
  }
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Pay with M-Pesa"><form class="modal report" data-form="pay">
    <h2>${esc(k.name)}: ${money(k.price)}</h2>
    <p class="hint">${k.credits} chat requests. Credits are not refunded if a request is declined or not answered within ${cfg.request_days} days.</p>
    ${payError ? `<div class="error" role="alert">${esc(payError)}</div>` : ""}
    <div class="field"><label for="payphone">M-Pesa number</label><input id="payphone" name="phone" type="tel" placeholder="07XX XXX XXX" /><div class="hint">You will get a payment prompt on this phone. We keep it only for the payment record.</div></div>
    <button class="btn sun" type="submit">Send M-Pesa prompt</button>
    <button class="btn ghost" type="button" data-act="closepay">Cancel</button></form></div>`;
}

async function startPayment(data) {
  if (busy) return;
  busy = true;
  try {
    const { data: r, error } = await sb.functions.invoke("pay-start", { body: { pack_id: payPack, phone: (data.get("phone") || "").toString() } });
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
      notice = "Payment received. Your credits have been added.";
      render();
      return;
    }
    if (data && data.status === "failed") { payWaiting = false; payError = "The payment was not completed."; render(); return; }
  }
  payWaiting = false;
  payError = "We have not received a confirmation yet. If money was taken, your credits will appear shortly.";
  render();
}

/* ---------- Views: my profile and moderator ---------- */

function profileView() {
  const urls = myApprovedUrls();
  const count = (s) => myPhotos.filter((x) => x.status === s).length;
  const prompts = me.prompts.map((x) => `<div class="prompt"><small>${esc(x.q)}</small><p>${esc(x.a)}</p></div>`).join("");
  const tags = me.interests.map((t) => `<span>${esc(t)}</span>`).join("");
  const vibe = vibeBits(me.vibe).map((t) => `<span class="soft">${esc(t)}</span>`).join("");
  return `${appHead()}${noticeHtml()}<div class="topbar"><h2>My profile</h2></div>
  <div class="profile">
    <div class="card">${urls.length ? stripHtml(urls, me.name) : avatar(me)}<div class="body">
      <h3>${esc(me.name)}</h3>
      <dl class="facts">
        <div><dt>Gender</dt><dd>${esc(genderLabel(me.gender))}</dd></div>
        <div><dt>Interested in</dt><dd>${esc(me.seeking.map((g) => INTEREST[g]).join(", "))}</dd></div>
        ${me.looking ? `<div><dt>Looking for</dt><dd>${esc(lookingLabel(me.looking))}</dd></div>` : ""}
        <div><dt>Current area</dt><dd>${esc(me.loc)}</dd></div>
      </dl>
      ${me.bio ? `<p>${esc(me.bio)}</p>` : ""}${prompts}
      ${tags ? `<div class="tags">${tags}</div>` : ""}${vibe ? `<div class="tags soft">${vibe}</div>` : ""}
    </div></div>
    <div class="box"><h3>Photos</h3><p class="hint">${myPhotos.length ? count("approved") + " approved, " + count("pending") + " waiting for approval, " + count("rejected") + " not approved." : "You have not added any photos yet. Members only appear in Browse once a photo is approved."}</p><button class="btn ghost" data-act="edit">Manage photos and profile</button></div>
    <button class="btn" data-act="edit">Edit profile</button>
    ${cfg.payments_enabled ? `<div class="box"><h3>Chat credits</h3><p class="hint">You have ${cfg.credits} chat ${cfg.credits === 1 ? "request" : "requests"} left.</p><button class="btn ghost" data-act="nav" data-to="credits">Buy credits</button></div>` : ""}
    <div class="box"><h3>Profile visibility</h3><p class="hint">${me.paused ? "Your profile is paused. Nobody can see it." : "Your profile is visible to other members."}</p><button class="btn ${me.paused ? "sun" : "ghost"}" data-act="togglepause">${me.paused ? "Show my profile again" : "Pause my profile"}</button></div>
    <div class="box"><h3>Account</h3><p class="hint">Signed in as ${esc(user.email)}. Only you can see this.</p><div class="acct"><button class="btn ghost" data-act="changepw">Change password</button><button class="btn ghost" data-act="exportdata">Download my data</button></div></div>
    ${blockedList.length ? `<div class="box"><h3>Blocked people</h3>${blockedList.map((b) => `<div class="blk"><span>${esc(b.name)}</span><button class="btn small ghost" data-act="unblock" data-id="${esc(b.id)}">Unblock</button></div>`).join("")}</div>` : ""}
    <button class="btn ghost" data-act="logout">Log out</button>
    <button class="btn danger" data-act="delete">Delete my account</button>
  </div>${footerHtml()}`;
}

function adminView() {
  const photos = adminData.photos.map((p) => `<div class="mod-card">${p.url ? `<img src="${esc(p.url)}" alt="Photo waiting for review" />` : ""}<div>
      <strong>${esc(p.nickname)}</strong><div class="hint">${esc(new Date(p.created_at).toLocaleString("en-GB"))}</div>
      <select id="rr-${esc(p.id)}" aria-label="Reason if not approved">${REJECT.map((r) => `<option>${esc(r)}</option>`).join("")}</select>
      <div class="mod-actions"><button class="btn small sun" data-act="approvephoto" data-id="${esc(p.id)}">Approve</button><button class="btn small ghost" data-act="rejectphoto" data-id="${esc(p.id)}">Reject</button></div></div></div>`).join("");
  const reports = adminData.reports.map((r) => `<div class="mod-report${r.status === "open" ? "" : " done"}">
      <strong>${esc(r.reason)}</strong> <span class="hint">${esc(r.reporter_name)} reported ${esc(r.reported_name)} on ${esc(new Date(r.created_at).toLocaleDateString("en-GB"))} (${esc(r.status)})</span>
      ${r.details ? `<p>${esc(r.details)}</p>` : ""}
      ${r.evidence && r.evidence.length ? `<div class="evid">${r.evidence.map((m) => `<div><b>${m.from === "reporter" ? "Reporter" : "Reported"}:</b> ${esc(m.text)}</div>`).join("")}</div>` : ""}
      <div class="mod-actions">${r.status === "open" ? `<button class="btn small ghost" data-act="resolvereport" data-id="${esc(r.id)}">Mark resolved</button>` : ""}
      <button class="btn small ${r.suspended ? "sun" : "danger"}" data-act="suspend" data-id="${esc(r.reported_id)}" data-flag="${r.suspended ? "0" : "1"}">${r.suspended ? "Unsuspend" : "Suspend member"}</button></div></div>`).join("");
  return `${appHead()}${noticeHtml()}
    <section class="b-hero slim"><h2>Moderator</h2><p>Approve photos and review reports.</p></section>
    <h3 class="sec">Photos waiting (${adminData.photos.length})</h3>
    <div class="modlist">${photos || `<p class="hint pad">Nothing waiting.</p>`}</div>
    <h3 class="sec">Reports (${adminData.reports.length})</h3>
    <div class="modlist">${reports || `<p class="hint pad">No reports.</p>`}</div>
    ${footerHtml()}`;
}

/* ---------- Password, report and block ---------- */

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

const findPerson = (id) => people.find((x) => x.id === id) || byId(id) || (() => { const c = chats.find((x) => x.other_id === id); return c ? { id, name: c.other_name } : null; })();

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
      const r = reportConv
        ? await sb.rpc("report_chat", { conv: reportConv, reason: reason.toString(), details })
        : await sb.from("reports").insert({ reporter_id: user.id, reported_id: p.id, reason: reason.toString(), details });
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
  const val = (k) => (data.get(k) || "").toString().trim();
  if (!val("name")) return ["Choose a nickname.", 1];
  if (!data.get("gender")) return ["Choose your gender.", 1];
  if (!data.getAll("seeking").length) return ["Choose who you are interested in.", 1];
  if (!val("location")) return ["Choose your current area.", 2];
  if (data.getAll("tags").length > 8) return ["Pick up to 8 interests.", 2];
  for (let i = 1; i <= 3; i++) { if (val("pa" + i) && !val("pq" + i)) return ["Choose a prompt for each answer.", 3]; }
  if (!editing && !data.get("consent")) return ["Please confirm you are 18 or older and agree to the Terms and Privacy Policy.", 3];
  return null;
}

function showError(msg) {
  const box = document.getElementById("formError");
  if (box) { box.textContent = msg; box.hidden = false; box.scrollIntoView({ block: "center" }); }
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

/* ---------- Render ---------- */

function render(keep) {
  if (!user && view !== "welcome" && view !== "auth" && !LEGALKEYS.includes(view)) view = "welcome";
  if (user && !me && ["browse", "saved", "credits", "chats", "chat", "profile", "edit", "admin"].includes(view)) view = "create";
  let html = "";
  if (view === "welcome") html = welcomeView();
  else if (LEGALKEYS.includes(view)) html = legalView(view);
  else if (view === "auth") html = authView();
  else if (view === "create" || view === "edit") html = formView();
  else if (view === "browse") html = browseView() + navView();
  else if (view === "saved") html = savedView() + navView();
  else if (view === "credits") html = creditsView() + navView();
  else if (view === "chats") html = chatsView() + navView();
  else if (view === "chat") html = chatView();
  else if (view === "admin") html = adminView() + navView();
  else if (view === "profile") html = profileView() + navView();
  app.innerHTML = html + reportModal() + pwModal() + payModal() + sayHiModal();
  document.body.classList.toggle("landing", view === "welcome");
  if (view === "create") showStep(1);
  if (view === "chat") window.scrollTo(0, document.body.scrollHeight);
  if (!keep && view !== "chat") window.scrollTo(0, 0);
}

/* ---------- Actions ---------- */

function resetSession() {
  user = null; me = null; people = []; myPhotos = []; blockedList = []; chats = [];
  hiddenIds = loadHidden();
  cfg = { payments_enabled: false, daily_chat_limit: 10, request_days: 10, retry_days: 30, credits: 0, packs: [], is_admin: false };
  if (channel) { sb.removeChannel(channel); channel = null; }
  view = "welcome";
}

const KEEP = new Set(["area", "interest", "look", "approvephoto", "rejectphoto", "resolvereport", "suspend"]);

const actions = {
  start: () => {
    step = 1;
    if (user) view = me ? "browse" : "create";
    else { authMode = "signup"; view = "auth"; }
  },
  tologin: () => { authMode = "login"; view = "auth"; },
  tosignup: () => { authMode = "signup"; view = "auth"; },
  nav: async (d) => {
    view = d.to;
    if (view === "admin") await loadAdmin();
    if (view === "chats") await loadChats();
    if (view === "credits") await loadStatus();
  },
  edit: async () => { await loadMyPhotos(); view = "edit"; },
  closewelcome: () => { justJoined = false; },
  area: (d) => { areaFilter = d.z; },
  interest: (d) => { interestFilter = d.i; },
  look: (d) => { lookFilter = d.l; },
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
  report: (d) => { reportId = d.id; reportConv = null; },
  closereport: () => { reportId = null; reportConv = null; },
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
    const out = { email: user.email, nickname: me.name, gender: me.gender, interested_in: me.seeking, area: me.loc, looking_for: me.looking, bio: me.bio, interests: me.interests, prompts: me.prompts, vibe: me.vibe, photos: myPhotos.length, profile_paused: !!me.paused, blocked_people: blockedList.map((b) => b.name), chat_credits: cfg.credits, downloaded_at: new Date().toISOString() };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: "application/json" }));
    a.download = "my-egerton-connect-data.json";
    a.click();
    URL.revokeObjectURL(a.href);
  },
  unblock: async (d) => {
    const { error } = await sb.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", d.id);
    if (error) { notice = "Could not unblock: " + error.message; return; }
    hiddenIds.delete(d.id);
    await loadPeople();
  },
  choosepay: (d) => { payPack = d.pack; payOpen = true; payError = ""; payWaiting = false; },
  closepay: () => { payOpen = false; payWaiting = false; },
  logout: async () => { await sb.auth.signOut(); resetSession(); },
  delete: async () => {
    if (!confirm("Permanently delete your account? This removes your profile, photos, messages and login. It cannot be undone.")) return;
    const paths = myPhotos.map((x) => x.path);
    if (paths.length) await sb.storage.from("photos").remove(paths);
    const { error } = await sb.rpc("delete_my_account");
    if (error) { notice = "Could not delete: " + error.message; return; }
    await sb.auth.signOut({ scope: "local" });
    resetSession();
  },
  approvephoto: async (d) => { await sb.rpc("admin_review_photo", { p_id: d.id, approve: true, reason: "" }); await loadAdmin(); },
  rejectphoto: async (d) => {
    const sel = document.getElementById("rr-" + d.id);
    await sb.rpc("admin_review_photo", { p_id: d.id, approve: false, reason: sel ? sel.value : "" });
    await loadAdmin();
  },
  resolvereport: async (d) => { await sb.rpc("admin_resolve_report", { p_id: d.id }); await loadAdmin(); },
  suspend: async (d) => {
    const on = d.flag === "1";
    if (on && !confirm("Suspend this member? They will be hidden and cannot chat.")) return;
    await sb.rpc("admin_set_suspended", { target: d.id, flag: on, why: "Moderator action" });
    await loadAdmin();
  },
};

/* ---------- Events ---------- */

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act;
  if (act === "next" || act === "prev") { stepNav(act); return; }
  if (act === "rmphoto") { removePhoto(el.dataset.id); return; }
  if (act === "mainphoto") { makeMain(el.dataset.id); return; }
  if (act === "save") {
    toggleSave(el.dataset.id);
    el.classList.toggle("on");
    el.setAttribute("aria-pressed", String(el.classList.contains("on")));
    if (view === "saved") render(true);
    return;
  }
  if (!actions[act]) return;
  Promise.resolve(actions[act](el.dataset)).then(() => render(KEEP.has(act)));
});

app.addEventListener("input", (e) => {
  if (e.target.id === "q") { query = e.target.value; document.getElementById("results").innerHTML = resultsHtml(); }
});

app.addEventListener("change", (e) => {
  if (e.target.id === "photos") {
    const files = Array.from(e.target.files);
    e.target.value = "";
    addPhotos(files);
    return;
  }
  if (e.target.name === "tags") {
    const boxes = Array.from(document.querySelectorAll('input[name="tags"]'));
    const n = boxes.filter((b) => b.checked).length;
    if (n > 8) { e.target.checked = false; }
    const c = document.getElementById("tagcount");
    if (c) c.textContent = Math.min(n, 8) + " of 8 chosen" + (n > 8 ? ". That is the maximum." : "");
  }
});

app.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const kind = form.dataset.form;
  if (kind === "auth") { await doAuth(data); return; }
  if (kind === "report") { await sendReport(data); return; }
  if (kind === "password") { await changePassword(data); return; }
  if (kind === "pay") { await startPayment(data); return; }
  if (kind === "sayhi") { await sendSayHi(data); return; }
  if (kind === "chat") {
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
  if (err) { if (!editing) showStep(Math.min(err[1], STEPS)); showError(err[0]); return; }
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
    if (data.session) {
      const keep = LEGALKEYS.includes(view) ? view : null;
      user = data.session.user;
      await afterLogin();
      if (keep) view = keep;
      render();
    }
  } catch (e) { /* stay on the landing page */ }
})();

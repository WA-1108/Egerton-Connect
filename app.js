/* Egerton Connect - simple demo app in plain JavaScript.
   Data is saved in the browser (localStorage). The people you see are sample profiles.
   A real launch needs a backend (for example Supabase) for accounts, real users and messages. */

const KEY = "egertonConnect.v1";

const GENDERS = [
  ["woman", "Woman"],
  ["man", "Man"],
  ["nonbinary", "Non-binary"],
];

const PROFILES = [
  { id: "p1", name: "Wanjiru", age: 21, gender: "woman", course: "BSc Agribusiness", year: 3, bio: "Early riser, loves the Njoro sunrise walks and a good chapati.", interests: ["Hiking", "Cooking", "Gospel music"], likesBack: true, replies: ["Hey! Nice to meet you.", "Which hostel are you in?", "Let's grab tea at the Student Centre sometime."] },
  { id: "p2", name: "Brian", age: 22, gender: "man", course: "BSc Computer Science", year: 4, bio: "Building small apps and losing at FIFA. Looking for good conversation.", interests: ["Coding", "Football", "Chess"], likesBack: true, replies: ["Hi! Good to match.", "What are you studying?", "I can show you the best study spots on campus."] },
  { id: "p3", name: "Achieng", age: 20, gender: "woman", course: "BSc Nursing", year: 2, bio: "Tired but cheerful. Will always say yes to a movie night.", interests: ["Movies", "Dancing", "Volunteering"], likesBack: false, replies: ["Hello!", "How is your week going?"] },
  { id: "p4", name: "Kevin", age: 23, gender: "man", course: "BSc Mechanical Engineering", year: 4, bio: "Gym in the morning, assignments at night. Serious about kind people.", interests: ["Gym", "Cars", "Afrobeats"], likesBack: false, replies: ["Hey there!", "What do you do for fun?"] },
  { id: "p5", name: "Faith", age: 19, gender: "woman", course: "BEd Arts", year: 1, bio: "New on campus and still learning my way around. Show me the best food spots.", interests: ["Reading", "Poetry", "Food"], likesBack: true, replies: ["Hi! I'm still finding my way around.", "Where do you usually eat?", "I would love a campus tour."] },
  { id: "p6", name: "Mwangi", age: 24, gender: "man", course: "BSc Biochemistry", year: 4, bio: "Lab rat with a guitar. Final year, so free time is rare but real.", interests: ["Guitar", "Science", "Coffee"], likesBack: true, replies: ["Hey! Nice to connect.", "Do you play any instrument?", "Coffee after my lab on Friday?"] },
  { id: "p7", name: "Njeri", age: 22, gender: "woman", course: "BCom Finance", year: 3, bio: "Budget spreadsheets and bubble tea. Honest people only.", interests: ["Finance", "Travel", "Photography"], likesBack: false, replies: ["Hi!", "Tell me something about you."] },
  { id: "p8", name: "Otieno", age: 21, gender: "man", course: "BSc Environmental Science", year: 3, bio: "Tree planter and weekend footballer. Let's go on a walk to Egerton Castle.", interests: ["Nature", "Football", "Photography"], likesBack: true, replies: ["Hi! Great to match.", "Have you been to the Castle yet?", "I can take you on a walk this weekend."] },
  { id: "p9", name: "Sam", age: 22, gender: "nonbinary", course: "BA Communication", year: 3, bio: "Podcasts, thrift finds and long talks about nothing.", interests: ["Podcasts", "Fashion", "Writing"], likesBack: true, replies: ["Hey, so glad we matched.", "What podcasts are you into?", "We should swap recommendations."] },
  { id: "p10", name: "Mercy", age: 20, gender: "woman", course: "BSc Food Science", year: 2, bio: "I bake on weekends and share the results. Kind and curious.", interests: ["Baking", "Netflix", "Running"], likesBack: true, replies: ["Hi there!", "Do you have a sweet tooth?", "I owe you a slice of cake."] },
  { id: "p11", name: "Dennis", age: 25, gender: "man", course: "MSc Soil Science", year: 2, bio: "Postgrad, calm, likes quiet evenings and good music.", interests: ["Music", "Farming", "Cycling"], likesBack: false, replies: ["Hello!", "How is your semester?"] },
  { id: "p12", name: "Zawadi", age: 21, gender: "nonbinary", course: "BSc Mathematics", year: 3, bio: "Puzzles, board games and kind people. Say hi.", interests: ["Board games", "Puzzles", "Anime"], likesBack: true, replies: ["Hi! Nice to meet you.", "Do you like board games?", "I have a few we can play."] },
];

/* ---------- State ---------- */

function fresh() { return { me: null, liked: [], passed: [], matches: [], chats: {} }; }

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || fresh(); }
  catch (e) { return fresh(); }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
}

let state = load();
let view = state.me ? "discover" : "welcome";
let chatId = null;
let justMatched = null;
let formError = "";

const app = document.getElementById("app");
const byId = (id) => PROFILES.find((p) => p.id === id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hue = (id) => (id.split("").reduce((a, c) => a + c.charCodeAt(0) * 17, 0) % 360);
const avatar = (p, cls) => `<div class="avatar ${cls || ""}" style="--h:${hue(p.id)}" aria-hidden="true">${esc(p.name[0])}</div>`;
const genderLabel = (g) => (GENDERS.find((x) => x[0] === g) || [g, g])[1];

function candidates() {
  const seeking = state.me.seeking;
  return PROFILES.filter((p) => !state.liked.includes(p.id) && !state.passed.includes(p.id) && seeking.includes(p.gender));
}

/* ---------- Views ---------- */

function welcomeView() {
  const mini = (id, line) => { const p = byId(id); return `<div class="fc fc-${id}">${avatar(p, "sm")}<div><strong>${esc(p.name)}, ${p.age}</strong><span>${esc(line)}</span></div></div>`; };
  return `
  <main class="landing-page">
    <header class="l-top"><span class="brand">Egerton Connect</span><button class="btn sun small" data-act="start">Join free</button></header>
    <section class="hero">
      <div class="hero-in">
        <div class="hero-copy">
          <span class="pill reveal" style="--d:0s">For Egerton students, 18+</span>
          <h1 class="reveal" style="--d:.1s">Your next favourite person is <em>on campus.</em></h1>
          <p class="lead reveal" style="--d:.2s">Make a profile in under a minute. Swipe, match and chat with students from your own university.</p>
          <button class="btn sun big reveal" style="--d:.3s" data-act="start">Create my profile</button>
          <p class="fine reveal" style="--d:.4s">Free to join. Just 3 quick steps.</p>
        </div>
        <div class="hero-art reveal" style="--d:.35s" aria-hidden="true">
          ${mini("p1", "BSc Agribusiness")}
          ${mini("p2", "BSc Computer Science")}
          <div class="fc fc-match"><strong>It's a match!</strong></div>
          ${mini("p5", "BEd Arts")}
        </div>
      </div>
    </section>
    <section class="how">
      <h2>How it works</h2>
      <div class="steps3">
        <div class="how-card"><span class="num">1</span><h3>Create your profile</h3><p>Your name, course and who you'd like to meet. It takes a minute.</p></div>
        <div class="how-card"><span class="num">2</span><h3>Swipe</h3><p>Browse students and tap Like on the people you'd want to talk to.</p></div>
        <div class="how-card"><span class="num">3</span><h3>Match and chat</h3><p>When you both say yes, you can start a conversation.</p></div>
      </div>
    </section>
    <section class="final">
      <h2>Ready to meet someone?</h2>
      <button class="btn sun big" data-act="start">Create my profile</button>
      <p class="fine">Early preview: sample profiles are shown until more students join.</p>
    </section>
    <div class="sticky-cta"><button class="btn sun" data-act="start">Create my profile</button></div>
  </main>`;
}

function formView() {
  const me = state.me || {};
  const editing = !!state.me;
  const seeking = me.seeking || [];
  const chip = (type, name, g, on) => `<label class="chip"><input type="${type}" name="${name}" value="${g[0]}" ${on ? "checked" : ""} /><span>${g[1]}</span></label>`;
  const nameF = `<div class="field"><label for="name">What should we call you?</label><input id="name" name="name" type="text" maxlength="30" autocomplete="given-name" placeholder="First name" value="${esc(me.name || "")}" /></div>`;
  const ageF = `<div class="field"><label for="age">Age</label><input id="age" name="age" type="number" min="18" max="60" value="${esc(me.age || "")}" /><div class="hint">You must be 18 or over.</div></div>`;
  const genderF = `<div class="field"><fieldset><legend>I am</legend><div class="chips">${GENDERS.map((g) => chip("radio", "gender", g, me.gender === g[0])).join("")}</div></fieldset></div>`;
  const courseF = `<div class="field"><label for="course">Course</label><input id="course" name="course" type="text" maxlength="60" placeholder="e.g. BSc Computer Science" value="${esc(me.course || "")}" /></div>`;
  const yearF = `<div class="field"><label for="year">Year of study</label><select id="year" name="year">${[1, 2, 3, 4, 5, 6].map((y) => `<option value="${y}" ${me.year == y ? "selected" : ""}>Year ${y}</option>`).join("")}</select></div>`;
  const seekF = `<div class="field"><fieldset><legend>I want to meet</legend><div class="chips">${GENDERS.map((g) => chip("checkbox", "seeking", g, seeking.includes(g[0]))).join("")}</div><div class="hint">Pick one or more.</div></fieldset></div>`;
  const bioF = `<div class="field"><label for="bio">About me <span class="hint">(optional)</span></label><textarea id="bio" name="bio" maxlength="160" placeholder="A line or two about you">${esc(me.bio || "")}</textarea></div>`;
  const intF = `<div class="field"><label for="interests">Interests <span class="hint">(optional)</span></label><input id="interests" name="interests" type="text" placeholder="Football, Movies, Coding" value="${esc((me.interests || []).join(", "))}" /><div class="hint">Separate with commas. Up to 4.</div></div>`;
  const consentF = `<label class="check"><input type="checkbox" name="consent" /> <span>I am 18 or older and I will treat people with respect.</span></label>`;
  const errBox = `<div class="error" id="formError" role="alert" hidden></div>`;

  if (editing) {
    return `<div class="topbar"><h2>Edit profile</h2></div>
    <form class="form" data-form="profile" novalidate>${errBox}${nameF}<div class="row">${ageF}${yearF}</div>${courseF}${genderF}${seekF}${bioF}${intF}
      <button class="btn" type="submit">Save changes</button>
      <button class="btn ghost" type="button" data-act="nav" data-to="profile">Cancel</button></form>`;
  }
  return `<div class="topbar"><h2>Create your profile</h2><span class="tag" id="stepLabel">Step 1 of 3</span></div>
  <div class="progress" aria-hidden="true"><div id="bar"></div></div>
  <form class="form" data-form="profile" novalidate>${errBox}
    <section class="step" data-step="1"><h3 class="step-title">First, the basics</h3>${nameF}${ageF}${genderF}</section>
    <section class="step" data-step="2" hidden><h3 class="step-title">Your campus life</h3>${courseF}${yearF}${seekF}</section>
    <section class="step" data-step="3" hidden><h3 class="step-title">Make it yours</h3>${bioF}${intF}${consentF}</section>
    <div class="step-nav">
      <button class="btn ghost" type="button" data-act="prev">Back</button>
      <button class="btn" type="button" id="nextBtn" data-act="next">Next</button>
      <button class="btn sun" type="submit" id="doneBtn" hidden>Start meeting people</button>
    </div>
  </form>`;
}

function discoverView() {
  const list = candidates();
  const p = list[0];
  let body;
  if (!p) {
    body = `<div class="empty"><h3>You have seen everyone for now</h3>
      <p>More people will appear as more students join. Check your matches, or start over with the sample profiles.</p>
      <button class="btn ghost" data-act="resetseen">See the sample profiles again</button></div>`;
  } else {
    body = `
    <div class="deck">
      <article class="card" id="card">
        ${avatar(p)}
        <div class="body">
          <h3>${esc(p.name)}, ${p.age}</h3>
          <p class="meta">${esc(p.course)}, year ${p.year}</p>
          <p>${esc(p.bio)}</p>
          <div class="tags">${p.interests.map((i) => `<span>${esc(i)}</span>`).join("")}</div>
        </div>
      </article>
    </div>
    <div class="actions">
      <button class="btn ghost" data-act="pass" data-id="${p.id}">Pass</button>
      <button class="btn" data-act="like" data-id="${p.id}">Like</button>
    </div>`;
  }
  return `<div class="topbar"><h2>Discover</h2><span class="tag">18+</span></div>${body}`;
}

function matchesView() {
  const items = state.matches.map((id) => {
    const p = byId(id);
    const chat = state.chats[id] || [];
    const last = chat.length ? chat[chat.length - 1].t : "You matched. Say hi!";
    return `<button class="item" data-act="openchat" data-id="${id}">${avatar(p, "sm")}<div><strong>${esc(p.name)}</strong><span class="sub">${esc(last)}</span></div></button>`;
  });
  return `<div class="topbar"><h2>Matches</h2></div>
    ${items.length ? `<div class="list">${items.join("")}</div>` : `<div class="empty"><h3>No matches yet</h3><p>When you and someone else like each other, they show up here.</p><button class="btn ghost" data-act="nav" data-to="discover">Go to Discover</button></div>`}`;
}

function chatView() {
  const p = byId(chatId);
  const chat = state.chats[chatId] || [];
  return `
  <div class="chat-head"><button class="back" data-act="nav" data-to="matches" aria-label="Back to matches">&larr;</button>${avatar(p, "sm")}<strong>${esc(p.name)}</strong></div>
  <div class="msgs" id="msgs">
    ${chat.length ? chat.map((m) => `<div class="msg ${m.from}">${esc(m.t)}</div>`).join("") : `<p class="meta" style="text-align:center">Say hi to ${esc(p.name)}.</p>`}
  </div>
  <form class="composer" data-form="chat" autocomplete="off">
    <input name="text" type="text" maxlength="500" placeholder="Write a message" aria-label="Message" />
    <button class="btn" type="submit">Send</button>
  </form>`;
}

function profileView() {
  const m = state.me;
  return `
  <div class="topbar"><h2>My profile</h2></div>
  <div class="profile">
    <div class="box">
      <h3>${esc(m.name)}, ${m.age}</h3>
      <p class="meta">${esc(m.course)}, year ${m.year}. ${esc(genderLabel(m.gender))}.</p>
      <p>${esc(m.bio || "No bio yet.")}</p>
      <div class="tags">${(m.interests || []).map((i) => `<span>${esc(i)}</span>`).join("")}</div>
      <p class="hint" style="margin-top:12px">Meeting: ${m.seeking.map(genderLabel).join(", ")}</p>
    </div>
    <button class="btn" data-act="edit">Edit profile</button>
    <div class="box">
      <h3>Stay safe</h3>
      <ul>
        <li>Meet in public places on campus first.</li>
        <li>Tell a friend where you are going.</li>
        <li>Never send money to someone you met here.</li>
        <li>Leave any chat that makes you uncomfortable.</li>
      </ul>
    </div>
    <button class="btn danger" data-act="delete">Delete my account</button>
  </div>`;
}

function navView() {
  const tab = (to, label, extra) => `<button data-act="nav" data-to="${to}" ${view === to ? 'aria-current="page"' : ""}>${label}${extra || ""}</button>`;
  return `<nav class="nav" aria-label="Main">${tab("discover", "Discover")}${tab("matches", "Matches", state.matches.length ? `<span class="badge">${state.matches.length}</span>` : "")}${tab("profile", "Profile")}</nav>`;
}

function matchModal() {
  if (!justMatched) return "";
  const p = byId(justMatched);
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="New match"><div class="modal">
    ${avatar(p, "sm")}<h2>It's a match!</h2><p>You and ${esc(p.name)} like each other.</p>
    <button class="btn sun" data-act="openchat" data-id="${p.id}">Say hi</button>
    <button class="btn ghost" data-act="closematch">Keep swiping</button></div></div>`;
}

/* ---------- Sign-up steps ---------- */

let step = 1;
const STEPS = 3;

function validate(data, editing) {
  const age = parseInt(data.get("age"), 10);
  if (!(data.get("name") || "").toString().trim()) return ["Enter your first name.", 1];
  if (!age || age < 18) return ["You must be 18 or older to use Egerton Connect.", 1];
  if (age > 60) return ["Enter a valid age.", 1];
  if (!data.get("gender")) return ["Choose who you are.", 1];
  if (!(data.get("course") || "").toString().trim()) return ["Enter your course.", 2];
  if (!data.getAll("seeking").length) return ["Choose who you want to meet.", 2];
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
  const data = new FormData(document.querySelector('form[data-form="profile"]'));
  const err = validate(data, false);
  if (err && err[1] <= step) { showError(err[0]); return; }
  showStep(step + 1);
}

/* ---------- Render ---------- */

function render() {
  if (!state.me && view !== "welcome" && view !== "signup") view = "welcome";
  let html = "";
  if (view === "welcome") html = welcomeView();
  else if (view === "signup" || view === "edit") html = formView();
  else if (view === "discover") html = discoverView() + navView();
  else if (view === "matches") html = matchesView() + navView();
  else if (view === "profile") html = profileView() + navView();
  else if (view === "chat") html = chatView();
  app.innerHTML = html + matchModal();
  document.body.classList.toggle("landing", view === "welcome");
  if (view === "signup") showStep(1);
  window.scrollTo(0, 0);
  if (view === "chat") {
    const box = document.getElementById("msgs");
    if (box) box.lastElementChild && box.lastElementChild.scrollIntoView();
    const input = document.querySelector(".composer input");
    if (input) input.focus();
  }
}

/* ---------- Actions ---------- */

function swipe(id, liked) {
  const card = document.getElementById("card");
  const finish = () => {
    if (liked) {
      state.liked.push(id);
      if (byId(id).likesBack && !state.matches.includes(id)) {
        state.matches.push(id);
        justMatched = id;
      }
    } else {
      state.passed.push(id);
    }
    save();
    render();
  };
  if (card) {
    card.classList.add(liked ? "out-right" : "out-left");
    setTimeout(finish, 240);
  } else {
    finish();
  }
}

function sendMessage(text) {
  const id = chatId;
  state.chats[id] = state.chats[id] || [];
  state.chats[id].push({ from: "me", t: text });
  save();
  render();
  setTimeout(() => {
    const p = byId(id);
    const theirCount = state.chats[id].filter((m) => m.from === "them").length;
    state.chats[id].push({ from: "them", t: p.replies[theirCount % p.replies.length] });
    save();
    if (view === "chat" && chatId === id) render();
  }, 1200);
}

const actions = {
  start: () => { view = "signup"; formError = ""; step = 1; },
  nav: (d) => { view = d.to; },
  edit: () => { view = "edit"; formError = ""; },
  like: (d) => swipe(d.id, true),
  pass: (d) => swipe(d.id, false),
  closematch: () => { justMatched = null; },
  openchat: (d) => { justMatched = null; chatId = d.id; view = "chat"; },
  resetseen: () => { state.passed = []; state.liked = state.liked.filter((id) => state.matches.includes(id)); save(); },
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
  if (el.dataset.act === "next" || el.dataset.act === "prev") { stepNav(el.dataset.act); return; }
  const fn = actions[el.dataset.act];
  if (!fn) return;
  const result = fn(el.dataset);
  if (el.dataset.act === "like" || el.dataset.act === "pass") return; // swipe renders itself
  render();
  return result;
});

app.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const type = form.dataset.form;
  const data = new FormData(form);

  if (type === "chat") {
    const text = (data.get("text") || "").toString().trim();
    if (text) sendMessage(text);
    return;
  }

  if (type === "profile") {
    const editing = !!state.me;
    if (!editing && step < STEPS) { stepNav("next"); return; }
    const err = validate(data, editing);
    if (err) { if (!editing) showStep(err[1]); showError(err[0]); return; }
    const name = data.get("name").toString().trim();
    const age = parseInt(data.get("age"), 10);
    const course = data.get("course").toString().trim();
    const gender = data.get("gender");
    const seeking = data.getAll("seeking");

    state.me = {
      name, age, course, gender, seeking,
      year: parseInt(data.get("year"), 10) || 1,
      bio: (data.get("bio") || "").toString().trim(),
      interests: (data.get("interests") || "").toString().split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4),
    };
    save();
    view = editing ? "profile" : "discover";
    render();
  }
});

render();

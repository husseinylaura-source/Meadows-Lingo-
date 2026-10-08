/* Meadows Lingo data layer.
   One API used by every page. It talks to Firebase (Auth + Firestore) when js/config.js has a
   Firebase apiKey, and otherwise to a demo store kept in this browser's localStorage.

   Database layout (Firestore):
     staff/{email}                         {name, role:"admin"|"teacher", active, classIds[]}
     classes/{classId}                     {name, year, teacherEmails[]}
     classes/{classId}/students/{code}     {name, years, active, createdAt}
     classes/{classId}/homework/{id}       {title, activity, unit, level, count, due, note, createdBy, createdAt}
     classes/{classId}/attempts/{id}       {code, name, kind, title, unit, hwId, score, total, pct, skills, missed, secs, level, at}
     codes/{code}                          {classId, active}            (lets a student code find its class)
     progress/{code}                       {classId, name, stats, done, profile, updatedAt}
     units/{unitId}                        {year, en, ar, words[], sentences[], hidden, order}
     resources/{id}                        {title, url, year, kind, note, createdBy, createdAt}
   Student codes are stored lower-case and shown upper-case.
*/
const CFG = window.ML_CONFIG || {};
export const DEMO = !(CFG.firebase && CFG.firebase.apiKey);
export const OWNER = String(CFG.ownerEmail || "").trim().toLowerCase();
const SDOMAIN = String(CFG.studentDomain || "students.meadowslingo.app").toLowerCase();
const FB_VER = "10.14.1";

const CODE_ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
export function newCode() { const a = new Uint32Array(6); crypto.getRandomValues(a); return Array.from(a, x => CODE_ALPHA[x % CODE_ALPHA.length]).join(""); }
export function normCode(c) { return String(c || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
export function showCode(c) { return String(c || "").toUpperCase(); }
const studentEmail = code => code + "@" + SDOMAIN;
const studentPw = code => "ML-" + code + "-arabic";
const isStudentEmail = e => String(e || "").toLowerCase().endsWith("@" + SDOMAIN);
export const normEmail = e => String(e || "").trim().toLowerCase();

export class AppError extends Error { constructor(code, msg) { super(msg || code); this.code = code; } }

/* ====================================================================== stores */
let store, auth;

async function firebaseBackend() {
  const base = `https://www.gstatic.com/firebasejs/${FB_VER}/`;
  const [A, U, F] = await Promise.all([
    import(base + "firebase-app.js"), import(base + "firebase-auth.js"), import(base + "firebase-firestore.js")]);
  const app = A.initializeApp(CFG.firebase);
  const a = U.getAuth(app);
  const db = F.initializeFirestore(app, { ignoreUndefinedProperties: true });
  const withId = s => s.exists() ? { id: s.id, ...s.data() } : null;
  store = {
    async get(path) { return withId(await F.getDoc(F.doc(db, path))); },
    async set(path, data, merge) { await F.setDoc(F.doc(db, path), data, merge ? { merge: true } : {}); },
    async del(path) { await F.deleteDoc(F.doc(db, path)); },
    async add(col, data) { const r = await F.addDoc(F.collection(db, col), data); return r.id; },
    async list(col, filters = []) {
      const q = filters.length ? F.query(F.collection(db, col), ...filters.map(f => F.where(f[0], f[1], f[2]))) : F.collection(db, col);
      const s = await F.getDocs(q); return s.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async batch(ops) {
      // the owner's batches need no rule lookups; other admins' do, and rules allow ~20 per batch
      const size = (a.currentUser && normEmail(a.currentUser.email) === OWNER) ? 450 : 8;
      for (let i = 0; i < ops.length; i += size) {
        const b = F.writeBatch(db);
        ops.slice(i, i + size).forEach(o => o.type === "delete" ? b.delete(F.doc(db, o.path)) : b.set(F.doc(db, o.path), o.data, o.merge ? { merge: true } : {}));
        await b.commit();
      }
    }
  };
  auth = {
    onChange(cb) { return U.onAuthStateChanged(a, u => cb(u ? { email: normEmail(u.email), verified: !!u.emailVerified } : null)); },
    current() { const u = a.currentUser; return u ? { email: normEmail(u.email), verified: !!u.emailVerified } : null; },
    async signIn(email, pw) { await U.signInWithEmailAndPassword(a, email, pw); },
    async create(email, pw) { await U.createUserWithEmailAndPassword(a, email, pw); },
    async sendVerify() { if (a.currentUser) await U.sendEmailVerification(a.currentUser); },
    async reload() { if (a.currentUser) { await a.currentUser.reload(); await a.currentUser.getIdToken(true); } return this.current(); },
    async reset(email) { await U.sendPasswordResetEmail(a, email); },
    async signOut() { await U.signOut(a); }
  };
}

/* ---------- demo: everything in localStorage, same shape as Firestore ---------- */
const DKEY = "ml-demo-db-v1", AKEY = "ml-demo-auth-v1";
function dload(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
function dsave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
const clone = x => x == null ? x : JSON.parse(JSON.stringify(x));
function deepMerge(a, b) { const o = { ...(a || {}) }; for (const k in b) { o[k] = b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && o[k] && typeof o[k] === "object" && !Array.isArray(o[k]) ? deepMerge(o[k], b[k]) : b[k]; } return o; }
function match(v, op, x) { return op === "==" ? v === x : op === ">=" ? v >= x : op === "<=" ? v <= x : op === ">" ? v > x : op === "<" ? v < x : op === "array-contains" ? Array.isArray(v) && v.includes(x) : op === "in" ? x.includes(v) : false; }

function demoBackend() {
  let db = dload(DKEY, null);
  if (!db) { db = demoSeed(); dsave(DKEY, db); }
  const put = () => dsave(DKEY, db);
  const wait = () => new Promise(r => setTimeout(r, 60));
  store = {
    async get(path) { await wait(); return db.docs[path] ? { id: path.split("/").pop(), ...clone(db.docs[path]) } : null; },
    async set(path, data, merge) { db.docs[path] = merge ? deepMerge(db.docs[path], clone(data)) : clone(data); put(); },
    async del(path) { delete db.docs[path]; put(); },
    async add(col, data) { const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7); db.docs[col + "/" + id] = clone(data); put(); return id; },
    async list(col, filters = []) {
      await wait(); const pre = col + "/";
      return Object.keys(db.docs).filter(p => p.startsWith(pre) && !p.slice(pre.length).includes("/"))
        .map(p => ({ id: p.slice(pre.length), ...clone(db.docs[p]) }))
        .filter(d => filters.every(f => match(d[f[0]], f[1], f[2])));
    },
    async batch(ops) { ops.forEach(o => { if (o.type === "delete") delete db.docs[o.path]; else db.docs[o.path] = o.merge ? deepMerge(db.docs[o.path], clone(o.data)) : clone(o.data); }); put(); }
  };
  let listeners = [];
  const st = () => dload(AKEY, { user: null, accounts: {} });
  const emit = () => { const u = st().user; listeners.forEach(cb => cb(u ? { email: u, verified: true } : null)); };
  const err = c => { const e = new Error(c); e.code = c; return e; };
  auth = {
    onChange(cb) { listeners.push(cb); setTimeout(() => { const u = st().user; cb(u ? { email: u, verified: true } : null); }, 0); return () => { listeners = listeners.filter(x => x !== cb); }; },
    current() { const u = st().user; return u ? { email: u, verified: true } : null; },
    async signIn(email, pw) { await wait(); const s = st(); if (!s.accounts[email] || s.accounts[email] !== pw) throw err("auth/invalid-credential"); s.user = email; dsave(AKEY, s); emit(); },
    async create(email, pw) { await wait(); const s = st(); if (s.accounts[email]) throw err("auth/email-already-in-use"); if (String(pw).length < 6) throw err("auth/weak-password"); s.accounts[email] = pw; s.user = email; dsave(AKEY, s); emit(); },
    async sendVerify() { },
    async reload() { return this.current(); },
    async reset(email) { const s = st(); if (s.accounts[email]) { delete s.accounts[email]; dsave(AKEY, s); } },
    async signOut() { const s = st(); s.user = null; dsave(AKEY, s); emit(); }
  };
}
export function resetDemo() { localStorage.removeItem(DKEY); localStorage.removeItem(AKEY); }

function demoSeed() {
  const docs = {}, now = Date.now(), day = 864e5;
  const T = "demo.teacher@school.ae";
  docs["staff/" + OWNER] = { name: "Admin", role: "admin", active: true, classIds: ["c7a"] };
  docs["staff/" + T] = { name: "Ms Mariam (demo)", role: "teacher", active: true, classIds: ["c7a", "c9b"] };
  docs["classes/c7a"] = { name: "7A Arabic B", year: "7", teacherEmails: [T, OWNER] };
  docs["classes/c9b"] = { name: "9B Arabic B", year: "9", teacherEmails: [T] };
  const kids = { c7a: [["sara77", "Sara Ahmed", 1], ["omar77", "Omar Khan", 2], ["lina77", "Lina Haddad", 1], ["zayd77", "Zayd Ali", 3]], c9b: [["maya99", "Maya Roy", 4], ["adam99", "Adam Noor", 5], ["hana99", "Hana Saleh", 3]] };
  const hw = { c7a: [{ id: "hw1", title: "Family words quiz", activity: "vocab", unit: "y7-family", level: "A", count: 10, due: new Date(now + 3 * day).toISOString().slice(0, 10), note: "Learn the family words first, then take the quiz." }, { id: "hw2", title: "Greetings: listening", activity: "listen", unit: "y7-greetings", level: "A", count: 8, due: new Date(now - day).toISOString().slice(0, 10), note: "" }],
    c9b: [{ id: "hw3", title: "IBT practice (Level C)", activity: "ibt", unit: "", level: "C", count: 12, due: new Date(now + 5 * day).toISOString().slice(0, 10), note: "Timed practice test." }] };
  const skillsFor = k => k === "ibt" ? ["Reading", "Grammar", "Spelling", "Vocabulary"] : k === "listen" ? ["Listening"] : ["Vocabulary", "Listening", "Writing"];
  let n = 0;
  for (const cid in kids) {
    hw[cid].forEach(h => { docs[`classes/${cid}/homework/${h.id}`] = { ...h, createdBy: T, createdAt: now - 6 * day }; });
    kids[cid].forEach(([code, name, years], ki) => {
      docs[`classes/${cid}/students/${code}`] = { name, years, active: true, createdAt: now - 20 * day };
      docs["codes/" + code] = { classId: cid, active: true };
      const days = {}, nodes = {}, done = {}; let xp = 0;
      const strength = [0.9, 0.62, 0.78, 0.45, 0.85, 0.7, 0.55][(n++) % 7];
      for (let d = 13; d >= 0; d--) {
        if ((d + ki) % 3 === 2 && d > 1) continue;
        const at = now - d * day - (ki * 37 + d * 11) % 300 * 60e3;
        const total = 10, score = Math.max(2, Math.min(10, Math.round(total * (strength + ((d * 7 + ki * 3) % 5 - 2) * 0.05))));
        const sk = skillsFor(cid === "c9b" && d % 4 === 0 ? "ibt" : "lesson"), skills = {};
        sk.forEach((s, i) => { const nn = Math.ceil(total / sk.length); skills[s] = { n: nn, ok: Math.max(0, Math.min(nn, Math.round(nn * (strength + (i % 2 ? -0.1 : 0.05))))) }; });
        docs[`classes/${cid}/attempts/s${code}${d}`] = { code, name, kind: "lesson", title: "Lesson practice", unit: "", hwId: "", score, total, pct: Math.round(score / total * 100), skills, missed: [], secs: 240, level: "A", at };
        days[new Date(at).toISOString().slice(0, 10)] = score * 10; xp += score * 10;
      }
      const yr = cid === "c7a" ? "y7-greetings" : "y9-clothing";
      const nn = Math.round(strength * 8); for (let k = 0; k < nn; k++) nodes[(k < 5 ? yr : (cid === "c7a" ? "y7-family" : "y9-weather")) + ":" + (k % 5)] = 80;
      if (ki % 2 === 0) { const h = hw[cid][0]; const sc = Math.round(h.count * strength); done[h.id] = { score: sc, total: h.count, at: now - day }; docs[`classes/${cid}/attempts/h${code}`] = { code, name, kind: "homework", title: h.title, unit: h.unit, hwId: h.id, score: sc, total: h.count, pct: Math.round(sc / h.count * 100), skills: { Vocabulary: { n: h.count, ok: sc } }, missed: [{ answer: "أخت", meaning: "sister", given: "أخ" }], secs: 300, level: "A", at: now - day }; }
      docs["progress/" + code] = { classId: cid, name, stats: { xp, sessions: Object.keys(days).length, seen: {}, letters: {}, days, nodes }, done, profile: { years }, updatedAt: now - (ki % 3) * day };
    });
  }
  docs["resources/r1"] = { title: "IBT Arabic B: sample paper (link)", url: "https://example.org/", year: "all", kind: "Past paper", note: "Replace this with your own past papers in the Content area.", createdBy: OWNER, createdAt: now };
  // demo logins: owner + teacher both use password demo123
  dsave(AKEY, { user: null, accounts: { [OWNER]: "demo123", [T]: "demo123" } });
  return { docs };
}

/* ====================================================================== init */
let ready;
export function init() {
  if (!ready) ready = (DEMO ? Promise.resolve(demoBackend()) : firebaseBackend());
  return ready;
}

/* ====================================================================== auth + session */
export function onAuth(cb) { return init().then(() => auth.onChange(cb)); }
export function friendlyError(e) {
  const c = (e && e.code) || "";
  return ({
    "auth/invalid-credential": "That email and password don't match. Check them, or use 'Forgot password'.",
    "auth/wrong-password": "That email and password don't match.",
    "auth/user-not-found": "There's no account with that email yet. Use 'First time here?' to set a password.",
    "auth/email-already-in-use": "This email already has a password. Sign in instead, or use 'Forgot password'.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "auth/invalid-email": "That doesn't look like an email address.",
    "auth/too-many-requests": "Too many tries. Wait a few minutes, then try again.",
    "auth/network-request-failed": "No internet connection. Check the connection and try again.",
    "permission-denied": "You don't have permission to do that.",
    "unavailable": "Can't reach the server. Check the internet connection.",
    "code-not-found": "That code wasn't recognised. Check it with your teacher.",
    "code-locked": "This code can't sign in right now. Ask your teacher for help.",
    "not-staff": "This email isn't on the staff list yet. Ask the admin to add you.",
    "bad-code": "A code has 6 letters and numbers, like K7M2QP."
  })[c] || (e && e.message) || "Something went wrong. Try again.";
}

export async function studentLogin(raw) {
  await init();
  const code = normCode(raw);
  if (code.length !== 6) throw new AppError("bad-code");
  // The code is checked after signing in (the rules only let a student read their own code),
  // so Firebase's sign-in rate limits protect codes from guessing.
  try { await auth.signIn(studentEmail(code), studentPw(code)); }
  catch (e) {
    if (["auth/invalid-credential", "auth/user-not-found", "auth/invalid-login-credentials"].includes(e.code)) {
      try { await auth.create(studentEmail(code), studentPw(code)); }
      catch (e2) { if (e2.code === "auth/email-already-in-use") throw new AppError("code-locked"); throw e2; }
    } else throw e;
  }
}
export async function staffLogin(email, pw) { await init(); await auth.signIn(normEmail(email), pw); }
export async function staffCreatePassword(email, pw) {
  await init(); email = normEmail(email);
  await auth.create(email, pw);
  try { await auth.sendVerify(); } catch (e) { }
}
export async function resendVerify() { await init(); await auth.sendVerify(); }
export async function recheckVerify() { await init(); return auth.reload(); }
export async function resetPassword(email) { await init(); await auth.reset(normEmail(email)); }
export async function signOut() { await init(); await auth.signOut(); }

/* Works out who is signed in and what they can see. */
export async function resolveSession(u) {
  if (!u) return null;
  if (isStudentEmail(u.email)) {
    const code = u.email.split("@")[0];
    const c = await store.get("codes/" + code);
    if (!c) { await auth.signOut(); throw new AppError("code-not-found"); }
    if (c.active === false) { await auth.signOut(); throw new AppError("code-locked"); }
    const [cls, roster, progress] = await Promise.all([store.get("classes/" + c.classId), store.get(`classes/${c.classId}/students/${code}`), store.get("progress/" + code)]);
    if (!cls || !roster) { await auth.signOut(); throw new AppError("code-locked"); }
    return { kind: "student", code, name: roster.name, years: roster.years || 1, classId: c.classId, className: cls.name, year: cls.year, progress };
  }
  if (!u.verified && !DEMO) return { kind: "unverified", email: u.email };
  let s = await store.get("staff/" + u.email).catch(e => { if (e && e.code === "permission-denied") return null; throw e; });
  if (!s && u.email === OWNER) { s = { name: "Admin", role: "admin", active: true, classIds: [] }; await store.set("staff/" + u.email, s); }
  if (!s || (s.active === false && u.email !== OWNER)) return { kind: "nostaff", email: u.email };
  const role = u.email === OWNER ? "admin" : (s.role === "admin" ? "admin" : "teacher");
  return { kind: "staff", email: u.email, name: s.name || u.email, role, classIds: s.classIds || [] };
}

/* ====================================================================== data API */
const now = () => Date.now();
export const db = {
  /* staff */
  listStaff: () => store.list("staff"),
  getStaff: email => store.get("staff/" + normEmail(email)),
  async saveStaff(email, data) { email = normEmail(email); const cur = await store.get("staff/" + email); await store.set("staff/" + email, { name: data.name, role: data.role === "admin" ? "admin" : "teacher", active: data.active !== false, classIds: cur ? cur.classIds || [] : [] }); },
  async removeStaff(email) {
    email = normEmail(email);
    const s = await store.get("staff/" + email); const ops = [{ type: "delete", path: "staff/" + email }];
    for (const cid of (s && s.classIds) || []) { const c = await store.get("classes/" + cid); if (c) ops.push({ type: "set", path: "classes/" + cid, data: { ...strip(c), teacherEmails: (c.teacherEmails || []).filter(x => x !== email) } }); }
    await store.batch(ops);
  },

  /* classes */
  async listClasses(session) {
    if (session.role === "admin") return sortBy(await store.list("classes"), "name");
    const s = await store.get("staff/" + session.email); const ids = (s && s.classIds) || [];
    return sortBy((await Promise.all(ids.map(id => store.get("classes/" + id).catch(() => null)))).filter(Boolean), "name");
  },
  getClass: id => store.get("classes/" + id),
  async saveClass(c) {
    const id = c.id || ("c" + now().toString(36) + Math.random().toString(36).slice(2, 5));
    const old = c.id ? await store.get("classes/" + id) : null;
    const before = new Set((old && old.teacherEmails) || []), after = new Set((c.teacherEmails || []).map(normEmail));
    const ops = [{ type: "set", path: "classes/" + id, data: { name: c.name, year: c.year, teacherEmails: [...after] } }];
    const touched = new Set([...before, ...after]);
    for (const e of touched) {
      const s = await store.get("staff/" + e); if (!s) continue;
      const ids = new Set(s.classIds || []); if (after.has(e)) ids.add(id); else ids.delete(id);
      ops.push({ type: "set", path: "staff/" + e, data: { ...strip(s), classIds: [...ids] } });
    }
    await store.batch(ops); return id;
  },
  async deleteClass(id) {
    const kids = await store.list(`classes/${id}/students`);
    if (kids.length) throw new AppError("class-not-empty", "Move or remove the students in this class first.");
    const c = await store.get("classes/" + id); const ops = [];
    for (const e of (c && c.teacherEmails) || []) { const s = await store.get("staff/" + e); if (s) ops.push({ type: "set", path: "staff/" + e, data: { ...strip(s), classIds: (s.classIds || []).filter(x => x !== id) } }); }
    for (const h of await store.list(`classes/${id}/homework`)) ops.push({ type: "delete", path: `classes/${id}/homework/${h.id}` });
    ops.push({ type: "delete", path: "classes/" + id });
    await store.batch(ops);
  },

  /* students */
  listStudents: async cid => sortBy(await store.list(`classes/${cid}/students`), "name").map(s => ({ ...s, code: s.id })),
  async addStudents(cid, people) {
    const ops = [], made = [];
    for (const p of people) {
      let code; for (let t = 0; t < 20; t++) { code = newCode(); if (!(await store.get("codes/" + code))) break; }
      ops.push({ type: "set", path: `classes/${cid}/students/${code}`, data: { name: p.name, years: +p.years || 1, active: true, createdAt: now() } });
      ops.push({ type: "set", path: "codes/" + code, data: { classId: cid, active: true } });
      made.push({ code, name: p.name });
    }
    await store.batch(ops); return made;
  },
  async updateStudent(cid, code, patch) {
    const cur = await store.get(`classes/${cid}/students/${code}`); if (!cur) return;
    const next = { ...strip(cur), ...patch };
    const ops = [{ type: "set", path: `classes/${cid}/students/${code}`, data: next }];
    if ("active" in patch) ops.push({ type: "set", path: "codes/" + code, data: { classId: cid, active: !!patch.active } });
    await store.batch(ops);
  },
  async moveStudent(code, from, to) {
    const cur = await store.get(`classes/${from}/students/${code}`); if (!cur || from === to) return;
    await store.batch([
      { type: "set", path: `classes/${to}/students/${code}`, data: strip(cur) },
      { type: "delete", path: `classes/${from}/students/${code}` },
      { type: "set", path: "codes/" + code, data: { classId: to, active: cur.active !== false } },
      { type: "set", path: "progress/" + code, data: { classId: to }, merge: true }]);
  },
  async newCodeFor(cid, code) {
    const cur = await store.get(`classes/${cid}/students/${code}`); if (!cur) return null;
    const p = await store.get("progress/" + code);
    let nc; for (let t = 0; t < 20; t++) { nc = newCode(); if (!(await store.get("codes/" + nc))) break; }
    const ops = [
      { type: "set", path: `classes/${cid}/students/${nc}`, data: { ...strip(cur), prevCodes: [...(cur.prevCodes || []), code].slice(-10) } },
      { type: "delete", path: `classes/${cid}/students/${code}` },
      { type: "set", path: "codes/" + nc, data: { classId: cid, active: cur.active !== false } },
      { type: "delete", path: "codes/" + code }];
    if (p) { ops.push({ type: "set", path: "progress/" + nc, data: strip(p) }); ops.push({ type: "delete", path: "progress/" + code }); }
    await store.batch(ops); return nc;
  },
  async removeStudent(cid, code) {
    await store.batch([{ type: "delete", path: `classes/${cid}/students/${code}` }, { type: "delete", path: "codes/" + code }, { type: "delete", path: "progress/" + code }]);
  },

  /* progress */
  getProgress: code => store.get("progress/" + code).catch(() => null),
  codeInfo: code => store.get("codes/" + code),
  saveProgress: (code, data) => store.set("progress/" + code, { ...data, updatedAt: now() }),

  /* results */
  addAttempt: (cid, a) => store.add(`classes/${cid}/attempts`, { ...a, at: now() }),
  listAttempts: async (cid, since = 0) => (await store.list(`classes/${cid}/attempts`, since ? [["at", ">=", since]] : [])).sort((a, b) => b.at - a.at),

  /* homework */
  listHomework: async cid => (await store.list(`classes/${cid}/homework`)).sort((a, b) => (a.due || "9").localeCompare(b.due || "9")),
  async saveHomework(cid, h) { const id = h.id || ("hw" + now().toString(36) + Math.random().toString(36).slice(2, 5)); const d = { ...h }; delete d.id; await store.set(`classes/${cid}/homework/${id}`, d); return id; },
  deleteHomework: (cid, id) => store.del(`classes/${cid}/homework/${id}`),

  /* content */
  listUnits: () => store.list("units").catch(() => []),
  saveUnit: u => { const d = { ...u }; delete d.id; return store.set("units/" + u.id, d); },
  deleteUnit: id => store.del("units/" + id),
  listResources: async () => (await store.list("resources").catch(() => [])).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
  saveResource: r => { const id = r.id || ("r" + now().toString(36)); const d = { ...r }; delete d.id; return store.set("resources/" + id, d); },
  deleteResource: id => store.del("resources/" + id)
};
function strip(d) { const o = { ...d }; delete o.id; delete o.code; return o; }
function sortBy(a, k) { return a.sort((x, y) => String(x[k] || "").localeCompare(String(y[k] || ""))); }

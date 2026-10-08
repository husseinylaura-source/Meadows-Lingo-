/* Meadows Lingo · staff area (teachers and admin) */
import * as B from "./backend.js";

const $ = s => document.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const DAY = 864e5;
function toast(m) { const t = $("#toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3000); }
const yearLabel = id => (CURRICULUM.find(y => y.id === id) || { label: id || "—" }).label;
const fmtDay = ms => ms ? new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—";
const fmtDT = ms => ms ? new Date(ms).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
function ago(ms) { if (!ms) return "Never"; const d = Math.floor((Date.now() - ms) / DAY); return d <= 0 ? "Today" : d === 1 ? "Yesterday" : d < 7 ? d + " days ago" : fmtDay(ms); }
function fmtDue(d) { if (!d) return "No due date"; const x = new Date(d + "T12:00:00"); return isNaN(x) ? d : x.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }); }
const pctCls = p => p == null ? "none" : p >= 75 ? "hi" : p >= 50 ? "mid" : "lo";
const pctHtml = p => `<span class="pct ${pctCls(p)}">${p == null ? "–" : p + "%"}</span>`;
const P = a => Math.round((a.score || 0) / Math.max(1, a.total || 1) * 100);
const codesOf = s => [s.code, ...((s && s.prevCodes) || [])];
const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null;
function levelOf(years) { const y = +years || 1; return y <= 2 ? "A" : y <= 4 ? "B" : y <= 6 ? "C" : y <= 8 ? "D" : "E"; }
function dayKey(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function streakOf(days) { days = days || {}; let n = 0; const d = new Date(); if (!days[dayKey(d)]) d.setDate(d.getDate() - 1); while (days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }
const KIND = { lesson: "Lesson", vocab: "Meaning quiz", listening: "Listening quiz", writing: "Writing", reading: "Reading", ibt: "IBT practice", homework: "Homework", practice: "Practice" };

/* ---------- state ---------- */
const ST = { me: null, tab: "classes", classes: [], cid: null, cache: {}, staff: null, units: null, resources: null, range: 30, ctab: "students" };

/* ---------- dialogs ---------- */
function openDlg(html, bind) { const d = $("#dlg"); $("#dlgBody").innerHTML = html; bind && bind($("#dlgBody")); if (!d.open) d.showModal(); $$("[data-close]", d).forEach(b => b.onclick = () => d.close()); }
function closeDlg() { $("#dlg").close(); }
async function confirmDlg(title, msg, okLabel = "Yes") {
  return new Promise(res => {
    openDlg(`<h2>${esc(title)}</h2><p>${msg}</p><div class="row"><button class="btn primary" id="cy">${esc(okLabel)}</button><button class="btn" id="cn">Cancel</button></div>`, r => {
      $("#cy", r).onclick = () => { closeDlg(); res(true); }; $("#cn", r).onclick = () => { closeDlg(); res(false); };
    });
    $("#dlg").addEventListener("close", () => res(false), { once: true });
  });
}
async function run(btn, fn, ok) {
  const t = btn && btn.textContent; if (btn) { btn.disabled = true; btn.textContent = "Saving…"; }
  try { await fn(); if (ok) toast(ok); return true; }
  catch (e) { console.error(e); toast(B.friendlyError(e)); return false; }
  finally { if (btn) { btn.disabled = false; btn.textContent = t; } }
}

/* ---------- csv ---------- */
function csvCell(v) { let s = String(v ?? ""); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
function download(name, rows) {
  const blob = new Blob(["﻿" + rows.map(r => r.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const stamp = () => new Date().toISOString().slice(0, 10);

/* ---------- data per class ---------- */
async function loadClass(cid, force) {
  if (!force && ST.cache[cid] && Date.now() - ST.cache[cid].at < 60e3) return ST.cache[cid];
  const [students, homework, attempts] = await Promise.all([B.db.listStudents(cid), B.db.listHomework(cid), B.db.listAttempts(cid, Date.now() - 120 * DAY)]);
  const progress = {};
  await Promise.all(students.map(async s => { progress[s.code] = await B.db.getProgress(s.code); }));
  return (ST.cache[cid] = { students, homework, attempts, progress, at: Date.now() });
}
function studentRows(C) {
  const since14 = Date.now() - 14 * DAY, since30 = Date.now() - 30 * DAY;
  return C.students.map(s => {
    const p = C.progress[s.code] || {}, st = p.stats || {};
    const cs = codesOf(s); const mine = C.attempts.filter(a => cs.includes(a.code));
    const last = Math.max(p.updatedAt || 0, mine[0] ? mine[0].at : 0);
    const skills = {};
    mine.filter(a => a.at >= since30).forEach(a => Object.entries(a.skills || {}).forEach(([k, v]) => { skills[k] = skills[k] || { ok: 0, n: 0 }; skills[k].ok += v.ok || 0; skills[k].n += v.n || 0; }));
    const weak = Object.entries(skills).filter(([, v]) => v.n >= 4).map(([k, v]) => [k, Math.round(v.ok / v.n * 100)]).sort((a, b) => a[1] - b[1])[0];
    const hwDone = C.homework.filter(h => hwResult(C, s, h.id)).length;
    return {
      ...s, last, streak: streakOf(st.days), xp: st.xp || 0, lessons: Object.keys(st.nodes || {}).length,
      hwDone, hwTotal: C.homework.length, avg14: avg(mine.filter(a => a.at >= since14).map(a => P(a))), n14: mine.filter(a => a.at >= since14).length,
      skills, weak, level: levelOf((p.profile && p.profile.years) || s.years)
    };
  });
}
function hwResult(C, st, hwId) {
  const cs = codesOf(st), code = st.code;
  const a = C.attempts.filter(x => cs.includes(x.code) && x.hwId === hwId);
  if (a.length) { const best = a.reduce((m, x) => P(x) > P(m) ? x : m, a[0]); return { pct: P(best), score: best.score, total: best.total, at: a[0].at, tries: a.length }; }
  const d = ((C.progress[code] || {}).done || {})[hwId];
  return d ? { pct: Math.round(d.score / Math.max(1, d.total) * 100), score: d.score, total: d.total, at: d.at, tries: 1 } : null;
}

/* ====================================================================== shell */
function tabsFor() {
  return ST.me.role === "admin"
    ? [["overview", "Overview"], ["classes", "Classes"], ["teachers", "Teachers"], ["manage", "Students"], ["content", "Content"], ["reports", "Reports"]]
    : [["classes", "My classes"], ["reports", "Reports"]];
}
function nav() {
  $("#tabs").innerHTML = tabsFor().map(([id, l]) => `<button data-tab="${id}" ${ST.tab === id ? 'aria-current="page"' : ""}>${l}</button>`).join("");
  $("#acct").innerHTML = `<span class="pill role-pill">${ST.me.role === "admin" ? "Admin" : "Teacher"}</span>${ST.me.name && ST.me.name !== "Admin" ? `<span class="pill">${esc(ST.me.name)}</span>` : ""}<span class="small muted">${esc(ST.me.email)}</span><button class="btn sm" id="signout">Sign out</button>`;
  $("#signout").onclick = () => B.signOut();
}
$("#tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) go(b.dataset.tab); });
function go(tab, extra) { ST.tab = tab; Object.assign(ST, extra || {}); nav(); render(); window.scrollTo({ top: 0 }); }
function render() {
  const v = $("#view"); v.innerHTML = `<div class="card muted">Loading…</div>`;
  const views = { overview: vOverview, classes: vClasses, teachers: vTeachers, manage: vManage, content: vContent, reports: vReports };
  Promise.resolve((views[ST.tab] || vClasses)(v)).catch(e => { console.error(e); v.innerHTML = `<div class="card stack"><h3>Couldn't load this page</h3><p class="muted">${esc(B.friendlyError(e))}</p><button class="btn" id="retry" style="align-self:flex-start">Try again</button></div>`; $("#retry").onclick = render; });
}
const head = (eyebrow, title, sub, right = "") => `<div class="row" style="justify-content:space-between;align-items:flex-end"><div class="stack" style="gap:4px"><div class="eyebrow">${eyebrow}</div><h2>${title}</h2>${sub ? `<p class="muted" style="max-width:72ch">${sub}</p>` : ""}</div><div class="row">${right}</div></div>`;

/* ====================================================================== overview (admin) */
async function vOverview(v) {
  ST.classes = await B.db.listClasses(ST.me);
  const since7 = Date.now() - 7 * DAY, since30 = Date.now() - 30 * DAY;
  const rows = await Promise.all(ST.classes.map(async c => {
    const [students, homework, attempts] = await Promise.all([B.db.listStudents(c.id), B.db.listHomework(c.id), B.db.listAttempts(c.id, since30)]);
    const active = new Set(attempts.filter(a => a.at >= since7).map(a => a.code));
    const live = students.filter(s => s.active !== false);
    const due = homework;
    const doneCount = due.reduce((n, h) => n + new Set(attempts.filter(a => a.hwId === h.id).map(a => a.code)).size, 0);
    return { c, students: live.length, active: active.size, avg: avg(attempts.map(a => P(a))), hw: homework.length, hwRate: due.length && live.length ? Math.round(doneCount / (due.length * live.length) * 100) : null, n: attempts.length };
  }));
  const tot = k => rows.reduce((n, r) => n + r[k], 0);
  const allAvg = avg(rows.filter(r => r.avg != null).map(r => r.avg));
  v.innerHTML = `<div class="stack">
   ${head("Admin", "School overview", "Every class at a glance. Activity and scores cover the last 30 days.", `<button class="btn" data-go="manage">Add students</button><button class="btn primary" data-go="teachers">Add teachers</button>`)}
   <div class="kpis">
    <div class="kpi"><b>${ST.classes.length}</b><span>classes</span></div>
    <div class="kpi"><b>${tot("students")}</b><span>students</span></div>
    <div class="kpi"><b>${tot("active")}</b><span>active this week</span></div>
    <div class="kpi"><b>${tot("n")}</b><span>activities done (30 days)</span></div>
    <div class="kpi"><b>${allAvg == null ? "–" : allAvg + "%"}</b><span>average score</span></div>
   </div>
   <div class="card stack"><h3>Classes</h3>
    ${rows.length ? `<div class="scroll"><table class="data"><thead><tr><th>Class</th><th>Year</th><th>Teachers</th><th>Students</th><th>Active this week</th><th>Avg score</th><th>Homework set</th><th>Homework done</th></tr></thead><tbody>
     ${rows.map(r => `<tr><td class="name"><button class="linkish" data-cid="${esc(r.c.id)}">${esc(r.c.name)}</button></td><td>${esc(yearLabel(r.c.year))}</td><td class="small">${(r.c.teacherEmails || []).map(esc).join("<br>") || '<span class="muted">None</span>'}</td><td class="num">${r.students}</td><td class="num">${r.active}</td><td>${pctHtml(r.avg)}</td><td class="num">${r.hw}</td><td>${pctHtml(r.hwRate)}</td></tr>`).join("")}
    </tbody></table></div>` : `<div class="empty">No classes yet. Create one in <b>Students</b>.</div>`}
   </div></div>`;
  $$("[data-go]", v).forEach(b => b.onclick = () => go(b.dataset.go));
  $$("[data-cid]", v).forEach(b => b.onclick = () => go("classes", { cid: b.dataset.cid, ctab: "students" }));
}

/* ====================================================================== classes dashboard (teacher + admin) */
async function vClasses(v) {
  ST.classes = await B.db.listClasses(ST.me);
  if (!ST.classes.length) {
    v.innerHTML = `<div class="stack">${head(ST.me.role === "admin" ? "Classes" : "Teacher", "No classes yet", "")}
     <div class="card">${ST.me.role === "admin" ? `Create a class and add students in <b>Students</b>, then assign a teacher to it.` : `You haven't been added to a class yet. Ask the admin to assign you to your classes.`}</div></div>`;
    return;
  }
  if (!ST.classes.find(c => c.id === ST.cid)) ST.cid = ST.classes[0].id;
  const cls = ST.classes.find(c => c.id === ST.cid);
  v.innerHTML = `<div class="stack">
   ${head(ST.me.role === "admin" ? "Classes" : "My classes", esc(cls.name), `${esc(yearLabel(cls.year))} · ${(cls.teacherEmails || []).map(esc).join(", ") || "no teacher assigned"}`,
    `<button class="btn" id="refresh">Refresh</button><button class="btn primary" id="newhw">Set homework</button>`)}
   <div class="ctabs no-print">${ST.classes.map(c => `<button data-c="${esc(c.id)}" aria-pressed="${c.id === ST.cid}">${esc(c.name)}</button>`).join("")}</div>
   <div id="cbody"><div class="card muted">Loading class…</div></div></div>`;
  $$("[data-c]", v).forEach(b => b.onclick = () => { ST.cid = b.dataset.c; vClasses(v); });
  $("#refresh").onclick = () => { delete ST.cache[ST.cid]; vClasses(v); };
  $("#newhw").onclick = () => homeworkDlg(null);
  const C = await loadClass(ST.cid);
  if (ST.cid !== cls.id) return;
  drawClass(C, cls);
}
function drawClass(C, cls) {
  const body = $("#cbody"); if (!body) return;
  const rows = studentRows(C).filter(r => r.active !== false);
  const active7 = rows.filter(r => r.last >= Date.now() - 7 * DAY).length;
  const avgAll = avg(rows.filter(r => r.avg14 != null).map(r => r.avg14));
  const hwRate = C.homework.length && rows.length ? Math.round(rows.reduce((n, r) => n + r.hwDone, 0) / (C.homework.length * rows.length) * 100) : null;
  const skillAgg = {}; rows.forEach(r => Object.entries(r.skills).forEach(([k, s]) => { skillAgg[k] = skillAgg[k] || { ok: 0, n: 0 }; skillAgg[k].ok += s.ok; skillAgg[k].n += s.n; }));
  const ct = ST.ctab;
  body.innerHTML = `<div class="stack">
   <div class="kpis">
    <div class="kpi"><b>${rows.length}</b><span>students</span></div>
    <div class="kpi"><b>${active7}</b><span>active this week</span></div>
    <div class="kpi"><b>${avgAll == null ? "–" : avgAll + "%"}</b><span>average score, 14 days</span></div>
    <div class="kpi"><b>${hwRate == null ? "–" : hwRate + "%"}</b><span>homework completed</span></div>
   </div>
   ${Object.keys(skillAgg).length ? `<div class="card stack"><h3>Class skills <span class="small muted" style="font-weight:400">last 30 days</span></h3>${Object.entries(skillAgg).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).map(([k, s]) => `<div class="skillbar"><span>${esc(k)}</span><div class="progress"><span style="width:${Math.round(s.ok / s.n * 100)}%"></span></div><span class="small" style="font-variant-numeric:tabular-nums">${Math.round(s.ok / s.n * 100)}%</span></div>`).join("")}</div>` : ""}
   <div class="ctabs"><button data-ct="students" aria-pressed="${ct === "students"}">Students</button><button data-ct="homework" aria-pressed="${ct === "homework"}">Homework (${C.homework.length})</button><button data-ct="activity" aria-pressed="${ct === "activity"}">Recent activity</button></div>
   <div id="ctbody"></div></div>`;
  $$("[data-ct]", body).forEach(b => b.onclick = () => { ST.ctab = b.dataset.ct; drawClass(C, cls); });
  const t = $("#ctbody");
  if (ct === "students") {
    t.innerHTML = `<div class="card stack">
     <div class="row" style="justify-content:space-between"><h3>Students</h3><div class="row"><button class="btn sm" id="xs">Download as spreadsheet</button>${ST.me.role === "admin" ? `<button class="btn sm" data-go="manage">Manage students</button>` : ""}</div></div>
     ${rows.length ? `<div class="scroll"><table class="data"><thead><tr><th>Name</th><th>Code</th><th>Level</th><th>Last active</th><th>Streak</th><th>Points</th><th>Lessons</th><th>Homework</th><th>Avg (14 days)</th><th>Needs work</th></tr></thead><tbody>
      ${rows.map(r => `<tr><td class="name"><button class="linkish" data-st="${esc(r.code)}">${esc(r.name)}</button></td><td class="codecell">${esc(B.showCode(r.code))}</td><td>${r.level}</td><td>${ago(r.last)}</td><td class="num">${r.streak}</td><td class="num">${r.xp}</td><td class="num">${r.lessons}</td><td class="num">${r.hwDone}/${r.hwTotal}</td><td>${pctHtml(r.avg14)} <span class="small muted">${r.n14 ? r.n14 + " done" : ""}</span></td><td>${r.weak ? `${esc(r.weak[0])} ${pctHtml(r.weak[1])}` : '<span class="muted">–</span>'}</td></tr>`).join("")}
     </tbody></table></div>` : `<div class="empty">No students in this class yet.</div>`}</div>`;
    $$("[data-st]", t).forEach(b => b.onclick = () => studentDlg(C, cls, b.dataset.st));
    $("#xs").onclick = () => download(`${cls.name} students ${stamp()}.csv`, [["Name", "Code", "Level", "Last active", "Streak", "Points", "Lessons done", "Homework done", "Homework set", "Average % (14 days)", "Activities (14 days)", "Weakest skill", "Weakest skill %"],
      ...rows.map(r => [r.name, B.showCode(r.code), r.level, r.last ? new Date(r.last).toISOString().slice(0, 10) : "", r.streak, r.xp, r.lessons, r.hwDone, r.hwTotal, r.avg14 ?? "", r.n14, r.weak ? r.weak[0] : "", r.weak ? r.weak[1] : ""])]);
    $$("[data-go]", t).forEach(b => b.onclick = () => go(b.dataset.go, { mcid: cls.id }));
  } else if (ct === "homework") {
    const hws = C.homework;
    t.innerHTML = `<div class="card stack">
     <div class="row" style="justify-content:space-between"><h3>Homework</h3><div class="row">${hws.length ? `<button class="btn sm" id="xg">Download gradebook</button>` : ""}<button class="btn sm primary" id="nh">Set homework</button></div></div>
     ${hws.length ? `<div class="scroll"><table class="data hwgrid"><thead><tr><th>Student</th>${hws.map(h => `<th title="${esc(h.title)}">${esc(h.title.length > 22 ? h.title.slice(0, 21) + "…" : h.title)}<div class="small muted" style="text-transform:none;letter-spacing:0">${h.due ? "Due " + fmtDue(h.due) : ""}</div></th>`).join("")}</tr></thead><tbody>
       ${rows.map(r => `<tr><td class="name">${esc(r.name)}</td>${hws.map(h => { const x = hwResult(C, r, h.id); return `<td class="c">${x ? pctHtml(x.pct) : h.due && new Date(h.due + "T23:59:59") < new Date() ? '<span class="miss small">Missing</span>' : '<span class="muted">–</span>'}</td>`; }).join("")}</tr>`).join("")}
       <tr><td class="small muted">Done</td>${hws.map(h => `<td class="c small">${rows.filter(r => hwResult(C, r, h.id)).length}/${rows.length}</td>`).join("")}</tr>
      </tbody></table></div>
      <div class="stack" style="gap:8px">${hws.map(h => `<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:8px"><div style="min-width:0"><b>${esc(h.title)}</b><div class="small muted">${esc((ACTIVITIES[h.activity] || {}).en || h.activity)}${UNITS[h.unit] ? " · " + esc(UNITS[h.unit].en) : ""}${h.activity === "ibt" || h.activity === "reading" ? " · Level " + esc(h.level) : ""} · ${h.count} questions · ${esc(fmtDue(h.due))}</div>${h.note ? `<div class="small">${esc(h.note)}</div>` : ""}</div><div class="row"><button class="btn sm" data-eh="${esc(h.id)}">Edit</button><button class="btn sm ghost" data-dh="${esc(h.id)}">Delete</button></div></div>`).join("")}</div>`
      : `<div class="empty">No homework set for this class yet.</div>`}</div>`;
    $("#nh").onclick = () => homeworkDlg(null);
    if ($("#xg")) $("#xg").onclick = () => download(`${cls.name} gradebook ${stamp()}.csv`, [["Student", "Code", ...hws.map(h => h.title + (h.due ? ` (due ${h.due})` : ""))],
      ...rows.map(r => [r.name, B.showCode(r.code), ...hws.map(h => { const x = hwResult(C, r, h.id); return x ? x.pct + "%" : "Not done"; })])]);
    $$("[data-eh]", t).forEach(b => b.onclick = () => homeworkDlg(C.homework.find(h => h.id === b.dataset.eh)));
    $$("[data-dh]", t).forEach(b => b.onclick = async () => {
      const h = C.homework.find(x => x.id === b.dataset.dh);
      if (!(await confirmDlg("Delete homework?", `“${esc(h.title)}” will disappear for students. Scores already handed in are kept in reports.`, "Delete"))) return;
      if (await run(null, () => B.db.deleteHomework(cls.id, h.id), "Homework deleted")) { delete ST.cache[cls.id]; render(); }
    });
  } else {
    const recent = C.attempts.slice(0, 60);
    t.innerHTML = `<div class="card stack"><h3>Recent activity</h3>
     ${recent.length ? `<div class="scroll"><table class="data"><thead><tr><th>When</th><th>Student</th><th>Activity</th><th>Score</th></tr></thead><tbody>
      ${recent.map(a => `<tr><td class="small">${esc(fmtDT(a.at))}</td><td class="name">${esc(a.name)}</td><td>${esc(KIND[a.kind] || a.kind)}: ${esc(a.title)}${a.ended ? ` <span class="pill red">${esc(a.ended)}</span>` : ""}</td><td>${a.score}/${a.total} ${pctHtml(P(a))}</td></tr>`).join("")}
     </tbody></table></div>` : `<div class="empty">Nothing yet. Activity shows up here as soon as students finish a lesson or quiz.</div>`}</div>`;
  }
}

function studentDlg(C, cls, code) {
  const r = studentRows(C).find(x => x.code === code); if (!r) return;
  const mine = C.attempts.filter(a => codesOf(r).includes(a.code));
  const missed = {}; mine.forEach(a => (a.missed || []).forEach(m => { const k = m.answer; missed[k] = missed[k] || { ...m, n: 0 }; missed[k].n++; }));
  const topMiss = Object.values(missed).sort((a, b) => b.n - a.n).slice(0, 12);
  openDlg(`<div class="row" style="justify-content:space-between"><div><div class="eyebrow">${esc(cls.name)}</div><h2>${esc(r.name)}</h2><div class="small muted">Code <span class="codecell">${esc(B.showCode(code))}</span> · Level ${r.level} · last active ${ago(r.last).toLowerCase()}</div></div><button class="btn sm" data-close>Close</button></div>
   <div class="kpis"><div class="kpi"><b>${r.streak}</b><span>day streak</span></div><div class="kpi"><b>${r.xp}</b><span>points</span></div><div class="kpi"><b>${r.lessons}</b><span>lessons</span></div><div class="kpi"><b>${r.hwDone}/${r.hwTotal}</b><span>homework</span></div></div>
   ${Object.keys(r.skills).length ? `<div class="stack" style="gap:6px"><h3>Skills (30 days)</h3>${Object.entries(r.skills).map(([k, s]) => `<div class="skillbar"><span>${esc(k)}</span><div class="progress"><span style="width:${Math.round(s.ok / s.n * 100)}%"></span></div><span class="small">${s.ok}/${s.n}</span></div>`).join("")}</div>` : ""}
   ${C.homework.length ? `<div class="stack" style="gap:6px"><h3>Homework</h3>${C.homework.map(h => { const x = hwResult(C, r, h.id); return `<div class="row" style="justify-content:space-between"><span>${esc(h.title)}</span><span>${x ? `${x.score}/${x.total} ${pctHtml(x.pct)} <span class="small muted">${fmtDay(x.at)}${x.tries > 1 ? ` · ${x.tries} tries` : ""}</span>` : '<span class="muted small">Not done</span>'}</span></div>`; }).join("")}</div>` : ""}
   ${topMiss.length ? `<div class="stack" style="gap:6px"><h3>Often wrong</h3><div class="chips">${topMiss.map(m => `<span class="chip"><span class="ar" style="color:var(--ink);font-size:1.1rem">${esc(m.answer)}</span>${m.meaning ? `<span class="small muted">${esc(m.meaning)}</span>` : ""}${m.n > 1 ? `<span class="pill red">×${m.n}</span>` : ""}</span>`).join("")}</div></div>` : ""}
   <div class="stack" style="gap:6px"><h3>All activity <span class="small muted" style="font-weight:400">(last 4 months)</span></h3>
    ${mine.length ? `<div class="scroll"><table class="data"><thead><tr><th>When</th><th>Activity</th><th>Score</th><th>Time</th></tr></thead><tbody>${mine.map(a => `<tr><td class="small">${esc(fmtDT(a.at))}</td><td>${esc(KIND[a.kind] || a.kind)}: ${esc(a.title)}</td><td>${a.score}/${a.total} ${pctHtml(P(a))}</td><td class="small">${a.secs ? Math.max(1, Math.round(a.secs / 60)) + " min" : ""}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">No activity yet.</p>`}
   </div>`);
}

/* ---------- homework dialog ---------- */
function homeworkDlg(h) {
  const editing = !!h;
  h = h || { title: "", activity: "vocab", unit: "", level: "A", count: 10, due: "", note: "" };
  const unitOpts = CURRICULUM.map(y => `<optgroup label="${esc(y.label)}">${y.units.map(u => `<option value="${esc(u.id)}" ${u.id === h.unit ? "selected" : ""}>${esc(u.en)}</option>`).join("")}</optgroup>`).join("");
  const cls = ST.classes.find(c => c.id === ST.cid);
  if (!h.unit && cls) { const y = CURRICULUM.find(y => y.id === cls.year); if (y && y.units[0]) h.unit = y.units[0].id; }
  openDlg(`<h2>${editing ? "Edit homework" : "Set homework"}</h2>
   <form id="hf" class="stack">
    <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
     <label class="field">Activity<select id="hf-act">${Object.entries(ACTIVITIES).map(([k, a]) => `<option value="${k}" ${k === h.activity ? "selected" : ""}>${esc(a.en)}</option>`).join("")}</select></label>
     <label class="field" id="hf-unit-wrap">Topic<select id="hf-unit">${unitOpts}</select></label>
     <label class="field" id="hf-level-wrap">Level<select id="hf-level">${Object.entries(LEVELS).map(([k, L]) => `<option value="${k}" ${k === h.level ? "selected" : ""}>${L.name} · ${L.years}</option>`).join("")}</select></label>
     <label class="field">Questions<input type="number" id="hf-count" min="3" max="30" value="${+h.count || 10}"></label>
     <label class="field">Due date<input type="date" id="hf-due" value="${esc(h.due)}"></label>
    </div>
    <label class="field">Title (optional)<input type="text" id="hf-title" maxlength="80" value="${esc(h.title)}" placeholder="Made from the activity and topic if left empty"></label>
    <label class="field">Instructions for students (optional)<input type="text" id="hf-note" maxlength="200" value="${esc(h.note)}"></label>
    ${editing ? `<p class="small muted">Changes apply to ${esc(cls ? cls.name : "this class")} only.</p>` : `<div class="field">Classes<div class="chk-list">${ST.classes.map(c => `<label><input type="checkbox" value="${esc(c.id)}" ${c.id === ST.cid ? "checked" : ""}> ${esc(c.name)} <span class="small muted">${esc(yearLabel(c.year))}</span></label>`).join("")}</div></div>`}
    <div class="row"><button class="btn primary" id="hf-save">${editing ? "Save changes" : "Set homework"}</button><button class="btn" type="button" data-close>Cancel</button></div>
   </form>`, r => {
    const act = $("#hf-act", r); const sync = () => { const a = ACTIVITIES[act.value]; $("#hf-unit-wrap", r).hidden = !a.needsUnit; $("#hf-level-wrap", r).hidden = a.needsUnit && act.value !== "dictation"; }; act.onchange = sync; sync();
    $("#hf", r).onsubmit = async e => {
      e.preventDefault();
      const a = act.value, u = UNITS[$("#hf-unit", r).value], lvl = $("#hf-level", r).value;
      const title = $("#hf-title", r).value.trim() || (ACTIVITIES[a].needsUnit ? `${u.en}: ${ACTIVITIES[a].en}` : `${ACTIVITIES[a].en} (${LEVELS[lvl].name})`);
      const data = { title, activity: a, unit: ACTIVITIES[a].needsUnit ? u.id : "", level: lvl, count: Math.max(3, Math.min(30, +$("#hf-count", r).value || 10)), due: $("#hf-due", r).value, note: $("#hf-note", r).value.trim(), createdBy: h.createdBy || ST.me.email, createdAt: h.createdAt || Date.now() };
      const targets = editing ? [ST.cid] : $$(".chk-list input:checked", r).map(x => x.value);
      if (!targets.length) { toast("Choose at least one class"); return; }
      const ok = await run($("#hf-save", r), async () => { for (const cid of targets) { await B.db.saveHomework(cid, editing ? { ...data, id: h.id } : data); delete ST.cache[cid]; } }, editing ? "Homework updated" : `Homework set for ${targets.length} class${targets.length > 1 ? "es" : ""}`);
      if (ok) { closeDlg(); ST.ctab = "homework"; if (ST.tab === "classes") render(); }
    };
  });
}

/* ====================================================================== teachers (admin) */
async function vTeachers(v) {
  const [staff, classes] = await Promise.all([B.db.listStaff(), B.db.listClasses(ST.me)]);
  ST.staff = staff.sort((a, b) => (a.name || "").localeCompare(b.name || "")); ST.classes = classes;
  const cname = id => (classes.find(c => c.id === id) || {}).name;
  v.innerHTML = `<div class="stack">
   ${head("Admin", "Teachers and admins", "Add a teacher's school email here. They then open this site, choose <b>First time here?</b> under Staff sign in, and set their own password.", `<button class="btn primary" id="addT">Add teacher</button>`)}
   <div class="card stack"><div class="scroll"><table class="data"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Classes</th><th>Status</th><th></th></tr></thead><tbody>
    ${ST.staff.map(s => `<tr><td class="name">${esc(s.name)}</td><td>${esc(s.id)}</td><td>${s.id === B.OWNER ? "Owner (admin)" : s.role === "admin" ? "Admin" : "Teacher"}</td><td class="small">${(s.classIds || []).map(cname).filter(Boolean).map(esc).join(", ") || '<span class="muted">None</span>'}</td><td>${s.active === false ? '<span class="pill red">Off</span>' : '<span class="pill good">Active</span>'}</td><td><button class="btn sm" data-edit="${esc(s.id)}">Edit</button></td></tr>`).join("")}
   </tbody></table></div></div></div>`;
  $("#addT").onclick = () => teacherDlg(null);
  $$("[data-edit]", v).forEach(b => b.onclick = () => teacherDlg(ST.staff.find(s => s.id === b.dataset.edit)));
}
function teacherDlg(s) {
  const isNew = !s, owner = s && s.id === B.OWNER;
  s = s || { id: "", name: "", role: "teacher", active: true, classIds: [] };
  openDlg(`<h2>${isNew ? "Add teacher" : "Edit " + esc(s.name)}</h2>
   <form id="tf" class="stack">
    <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
     <label class="field">Name<input type="text" id="tf-name" required maxlength="60" value="${esc(s.name)}" placeholder="e.g. Ms Mariam Saeed"></label>
     <label class="field">School email<input type="email" id="tf-email" required value="${esc(s.id)}" ${isNew ? "" : "disabled"} placeholder="name@school.ae"></label>
     <label class="field">Role<select id="tf-role" ${owner ? "disabled" : ""}><option value="teacher" ${s.role !== "admin" ? "selected" : ""}>Teacher: sees their own classes</option><option value="admin" ${s.role === "admin" ? "selected" : ""}>Admin: controls everything</option></select></label>
     <label class="field">Status<select id="tf-active" ${owner ? "disabled" : ""}><option value="1" ${s.active !== false ? "selected" : ""}>Active</option><option value="0" ${s.active === false ? "selected" : ""}>Switched off (can't sign in)</option></select></label>
    </div>
    <div class="field">Classes they teach<div class="chk-list">${ST.classes.length ? ST.classes.map(c => `<label><input type="checkbox" value="${esc(c.id)}" ${(s.classIds || []).includes(c.id) ? "checked" : ""}> ${esc(c.name)}</label>`).join("") : '<span class="muted small">No classes yet</span>'}</div></div>
    <div class="row"><button class="btn primary" id="tf-save">Save</button><button class="btn" type="button" data-close>Cancel</button>${!isNew && !owner ? `<button class="btn ghost" type="button" id="tf-del" style="margin-inline-start:auto;color:var(--bad)">Remove</button>` : ""}</div>
   </form>`, r => {
    $("#tf", r).onsubmit = async e => {
      e.preventDefault();
      const email = B.normEmail($("#tf-email", r).value);
      if (!/^[^@\s\/]+@[^@\s\/]+\.[^@\s\/]+$/.test(email)) { toast("Enter a valid email"); return; }
      if (email.endsWith("@" + (window.ML_CONFIG.studentDomain || ""))) { toast("That's a student address"); return; }
      if (isNew && ST.staff.some(x => x.id === email)) { toast("That email is already on the list"); return; }
      const want = new Set($$(".chk-list input:checked", r).map(x => x.value));
      const ok = await run($("#tf-save", r), async () => {
        await B.db.saveStaff(email, { name: $("#tf-name", r).value.trim(), role: owner ? "admin" : $("#tf-role", r).value, active: owner ? true : $("#tf-active", r).value === "1" });
        for (const c of ST.classes) {
          const has = (c.teacherEmails || []).includes(email);
          if (want.has(c.id) !== has) await B.db.saveClass({ ...c, teacherEmails: want.has(c.id) ? [...(c.teacherEmails || []), email] : (c.teacherEmails || []).filter(x => x !== email) });
        }
      }, "Saved");
      if (ok) { closeDlg(); ST.cache = {}; render(); }
    };
    if ($("#tf-del", r)) $("#tf-del", r).onclick = async () => {
      if (!(await confirmDlg("Remove teacher?", `${esc(s.name)} won't be able to see any classes. Their homework and students' results stay.`, "Remove"))) return;
      if (await run(null, () => B.db.removeStaff(s.id), "Removed")) render();
    };
  });
}

/* ====================================================================== students + classes management (admin) */
async function vManage(v) {
  ST.classes = await B.db.listClasses(ST.me);
  if (!ST.classes.find(c => c.id === ST.mcid)) ST.mcid = ST.classes[0] && ST.classes[0].id;
  const cls = ST.classes.find(c => c.id === ST.mcid);
  v.innerHTML = `<div class="stack">
   ${head("Admin", "Classes and students", "Create classes, add students and print their login codes. Each student gets a 6-character code they type to sign in.", `<button class="btn primary" id="newC">New class</button>`)}
   ${ST.classes.length ? `<div class="ctabs no-print">${ST.classes.map(c => `<button data-m="${esc(c.id)}" aria-pressed="${c.id === ST.mcid}">${esc(c.name)}</button>`).join("")}</div><div id="mbody"><div class="card muted">Loading…</div></div>` : `<div class="card empty">No classes yet. Press <b>New class</b> to start.</div>`}
  </div>`;
  $("#newC").onclick = () => classDlg(null);
  $$("[data-m]", v).forEach(b => b.onclick = () => { ST.mcid = b.dataset.m; vManage(v); });
  if (!cls) return;
  const students = await B.db.listStudents(cls.id);
  const live = students.filter(s => s.active !== false);
  if (!$("#mbody") || ST.tab !== "manage") return;
  $("#mbody").innerHTML = `<div class="stack">
   <div class="card stack">
    <div class="row" style="justify-content:space-between"><div><h3>${esc(cls.name)}</h3><div class="small muted">${esc(yearLabel(cls.year))} · ${students.length} students · ${(cls.teacherEmails || []).map(esc).join(", ") || "no teacher"}</div></div>
     <div class="row"><button class="btn sm" id="editC">Edit class</button><button class="btn sm" id="cards" ${live.length ? "" : "disabled"}>Print login cards</button><button class="btn sm" id="codes" ${students.length ? "" : "disabled"}>Download codes</button></div></div>
   </div>
   <div class="card stack">
    <h3>Add students</h3>
    <form id="af" class="stack">
     <label class="field">Names, one per line<textarea id="af-names" style="font-family:var(--f-ui);font-size:.95rem;min-height:110px" placeholder="Aisha Khan&#10;Omar Saleh&#10;Sara Ahmed"></textarea></label>
     <div class="row"><label class="field" style="max-width:240px">Years studying Arabic (sets level)<select id="af-years">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}">${n === 10 ? "10 or more" : n}${n === 1 ? " year" : " years"} · Level ${levelOf(n)}</option>`).join("")}</select></label>
      <button class="btn primary" id="af-go" style="align-self:flex-end">Add and make codes</button></div>
     <p class="small muted">Tip: you can paste a column of names straight from a spreadsheet. Students can change their years of Arabic later.</p>
    </form>
   </div>
   <div class="card stack"><h3>Students (${students.length})</h3>
    ${students.length ? `<div class="scroll"><table class="data"><thead><tr><th>Name</th><th>Code</th><th>Level</th><th>Status</th><th></th></tr></thead><tbody>
     ${students.map(s => `<tr><td class="name">${esc(s.name)}</td><td class="codecell">${esc(B.showCode(s.code))}</td><td>${levelOf(s.years)}</td><td>${s.active === false ? '<span class="pill red">Off</span>' : '<span class="pill good">Active</span>'}</td><td><button class="btn sm" data-ms="${esc(s.code)}">Options</button></td></tr>`).join("")}
    </tbody></table></div>` : `<div class="empty">No students yet. Add some above.</div>`}</div></div>`;
  $("#editC").onclick = () => classDlg(cls);
  $("#cards").onclick = () => printCards(cls, live);
  $("#codes").onclick = () => download(`${cls.name} login codes ${stamp()}.csv`, [["Name", "Class", "Code", "Status"], ...students.map(s => [s.name, cls.name, B.showCode(s.code), s.active === false ? "Off" : "Active"])]);
  $("#af").onsubmit = async e => {
    e.preventDefault();
    const names = $("#af-names").value.split(/\r?\n/).map(x => x.split("\t")[0].replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 200);
    if (!names.length) { toast("Type at least one name"); return; }
    const years = $("#af-years").value;
    let made = [];
    if (await run($("#af-go"), async () => { made = await B.db.addStudents(cls.id, names.map(n => ({ name: n.slice(0, 60), years }))); }, `${names.length} student${names.length > 1 ? "s" : ""} added`)) {
      delete ST.cache[cls.id]; await vManage(v);
      openDlg(`<h2>New codes</h2><p class="small muted">Give each student their code. You can print cards for the whole class any time.</p>
       <div class="scroll"><table class="data"><tbody>${made.map(m => `<tr><td class="name">${esc(m.name)}</td><td class="codecell">${esc(B.showCode(m.code))}</td></tr>`).join("")}</tbody></table></div>
       <div class="row"><button class="btn primary" id="pc">Print cards</button><button class="btn" data-close>Done</button></div>`, r => { $("#pc", r).onclick = () => { closeDlg(); printCards(cls, made); }; });
    }
  };
  $$("[data-ms]", v).forEach(b => b.onclick = () => studentOptions(cls, students.find(s => s.code === b.dataset.ms)));
}
function studentOptions(cls, s) {
  openDlg(`<div class="row" style="justify-content:space-between"><div><h2>${esc(s.name)}</h2><div class="small muted">${esc(cls.name)} · code <span class="codecell">${esc(B.showCode(s.code))}</span></div></div><button class="btn sm" data-close>Close</button></div>
   <form id="so" class="stack">
    <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
     <label class="field">Name<input type="text" id="so-name" maxlength="60" value="${esc(s.name)}"></label>
     <label class="field">Years studying Arabic<select id="so-years">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}" ${+s.years === n ? "selected" : ""}>${n} · Level ${levelOf(n)}</option>`).join("")}</select></label>
    </div>
    <button class="btn primary" id="so-save" style="align-self:flex-start">Save</button>
   </form>
   <div class="stack" style="gap:10px;border-top:1px solid var(--line);padding-top:14px">
    <div class="row"><label class="field" style="flex:1;min-width:200px">Move to another class<select id="so-move">${ST.classes.map(c => `<option value="${esc(c.id)}" ${c.id === cls.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label><button class="btn" id="so-mv" style="align-self:flex-end">Move</button></div>
    <div class="row"><button class="btn" id="so-code">Give a new code</button><button class="btn" id="so-act">${s.active === false ? "Switch on" : "Switch off (can't sign in)"}</button><button class="btn ghost" id="so-del" style="color:var(--bad)">Delete student</button></div>
    <p class="small muted">A new code stops the old one working, and keeps the student's progress. Moving keeps progress too; their old results stay in the old class's reports.</p>
   </div>`, r => {
    const done = msg => { toast(msg); closeDlg(); ST.cache = {}; render(); };
    $("#so", r).onsubmit = async e => { e.preventDefault(); if (await run($("#so-save", r), () => B.db.updateStudent(cls.id, s.code, { name: $("#so-name", r).value.trim() || s.name, years: +$("#so-years", r).value }))) done("Saved"); };
    $("#so-mv", r).onclick = async () => { const to = $("#so-move", r).value; if (to === cls.id) return; if (await run($("#so-mv", r), () => B.db.moveStudent(s.code, cls.id, to))) done("Moved"); };
    $("#so-act", r).onclick = async () => { if (await run($("#so-act", r), () => B.db.updateStudent(cls.id, s.code, { active: s.active === false }))) done(s.active === false ? "Switched on" : "Switched off"); };
    $("#so-code", r).onclick = async () => {
      if (!(await confirmDlg("Give a new code?", `The code ${esc(B.showCode(s.code))} will stop working.`, "New code"))) return;
      let nc; if (await run(null, async () => { nc = await B.db.newCodeFor(cls.id, s.code); })) { ST.cache = {}; render(); openDlg(`<h2>New code for ${esc(s.name)}</h2><div class="lcard"><div class="c">${esc(B.showCode(nc))}</div></div><button class="btn" data-close style="align-self:flex-start">Done</button>`); }
    };
    $("#so-del", r).onclick = async () => { if (!(await confirmDlg("Delete student?", `This deletes ${esc(s.name)}'s code and progress. Their past results stay in reports.`, "Delete"))) return; if (await run(null, () => B.db.removeStudent(cls.id, s.code))) done("Deleted"); };
  });
}
function classDlg(c) {
  const isNew = !c; c = c || { name: "", year: "7", teacherEmails: [] };
  const staffP = ST.staff ? Promise.resolve(ST.staff) : B.db.listStaff().then(x => (ST.staff = x));
  staffP.then(staff => {
    openDlg(`<h2>${isNew ? "New class" : "Edit class"}</h2>
     <form id="cf" class="stack">
      <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
       <label class="field">Class name<input type="text" id="cf-name" required maxlength="40" value="${esc(c.name)}" placeholder="e.g. 7A Arabic B"></label>
       <label class="field">Year group (sets the topics)<select id="cf-year">${CURRICULUM.map(y => `<option value="${y.id}" ${y.id === c.year ? "selected" : ""}>${y.label}</option>`).join("")}</select></label>
      </div>
      <div class="field">Teachers<div class="chk-list">${staff.filter(s => s.active !== false).map(s => `<label><input type="checkbox" value="${esc(s.id)}" ${(c.teacherEmails || []).includes(s.id) ? "checked" : ""}> ${esc(s.name)} <span class="small muted">${esc(s.id)}</span></label>`).join("") || '<span class="muted small">Add teachers first in the Teachers tab.</span>'}</div></div>
      <div class="row"><button class="btn primary" id="cf-save">${isNew ? "Create class" : "Save"}</button><button class="btn" type="button" data-close>Cancel</button>${!isNew ? `<button class="btn ghost" type="button" id="cf-del" style="margin-inline-start:auto;color:var(--bad)">Delete class</button>` : ""}</div>
     </form>`, r => {
      $("#cf", r).onsubmit = async e => {
        e.preventDefault(); let id;
        if (await run($("#cf-save", r), async () => { id = await B.db.saveClass({ id: c.id, name: $("#cf-name", r).value.trim(), year: $("#cf-year", r).value, teacherEmails: $$(".chk-list input:checked", r).map(x => x.value) }); }, "Saved")) { closeDlg(); ST.mcid = id; ST.staff = null; ST.cache = {}; render(); }
      };
      if ($("#cf-del", r)) $("#cf-del", r).onclick = async () => { if (!(await confirmDlg("Delete class?", "Only empty classes can be deleted. Its homework is deleted too.", "Delete"))) return; if (await run(null, () => B.db.deleteClass(c.id), "Class deleted")) { closeDlg(); ST.staff = null; render(); } };
    });
  });
}
function printCards(cls, list) {
  const site = location.href.replace(/staff\.html.*$/, "");
  $("#view").innerHTML = `<div class="stack">
   <div class="row no-print" style="justify-content:space-between"><h2>Login cards · ${esc(cls.name)}</h2><div class="row"><button class="btn primary" id="pr">Print</button><button class="btn" id="bk">Back</button></div></div>
   <div class="cards-print">${list.map(s => `<div class="lcard"><div class="small muted">Meadows Lingo · ${esc(cls.name)}</div><b>${esc(s.name)}</b><div class="c">${esc(B.showCode(s.code))}</div><div class="small">Go to <b>${esc(site)}</b> and type your code.</div></div>`).join("")}</div></div>`;
  $("#pr").onclick = () => window.print(); $("#bk").onclick = () => render();
}

/* ====================================================================== content (admin) */
async function vContent(v) {
  const [units, resources] = await Promise.all([B.db.listUnits(), B.db.listResources()]);
  ST.units = units; ST.resources = resources; applyContent(units);
  const byId = Object.fromEntries(units.map(u => [u.id, u]));
  const yr = ST.cyear || "7"; ST.cyear = yr;
  const builtin = (BUILTIN_CURRICULUM.find(y => y.id === yr) || { units: [] }).units;
  const list = [...builtin.map(u => ({ id: u.id, en: (byId[u.id] && byId[u.id].en) || u.en, ar: u.ar, n: ((byId[u.id] && byId[u.id].words) || u.words).length, status: byId[u.id] ? (byId[u.id].hidden ? "Hidden" : "Edited") : "Built-in", builtin: true })),
    ...units.filter(u => u.year === yr && !builtin.some(b => b.id === u.id)).map(u => ({ id: u.id, en: u.en, ar: u.ar, n: (u.words || []).length, status: u.hidden ? "Hidden" : "Custom", builtin: false }))];
  v.innerHTML = `<div class="stack">
   ${head("Admin", "Lessons and resources", "Edit the words and sentences in each topic, add new topics, and share past papers and links with students.")}
   <div class="card stack">
    <div class="row" style="justify-content:space-between"><h3>Topics</h3><button class="btn sm primary" id="newU">New topic</button></div>
    <div class="seg" role="group">${CURRICULUM.map(y => `<button data-cy="${y.id}" aria-pressed="${y.id === yr}">${y.label}</button>`).join("")}</div>
    <div class="scroll"><table class="data"><thead><tr><th>Topic</th><th></th><th>Words</th><th>Status</th><th></th></tr></thead><tbody>
     ${list.map(u => `<tr><td class="name">${esc(u.en)}</td><td class="ar">${esc(u.ar)}</td><td class="num">${u.n}</td><td><span class="pill ${u.status === "Hidden" ? "red" : u.status === "Built-in" ? "" : "acc"}">${u.status}</span></td><td><div class="row"><button class="btn sm" data-eu="${esc(u.id)}">Edit</button>
       ${u.status === "Hidden" ? `<button class="btn sm" data-show="${esc(u.id)}">Show</button>` : `<button class="btn sm ghost" data-hide="${esc(u.id)}">Hide</button>`}
       ${u.builtin && byId[u.id] ? `<button class="btn sm ghost" data-reset="${esc(u.id)}">Restore original</button>` : ""}${!u.builtin ? `<button class="btn sm ghost" data-delu="${esc(u.id)}" style="color:var(--bad)">Delete</button>` : ""}</div></td></tr>`).join("")}
    </tbody></table></div>
    <p class="small muted">Each topic needs at least 5 words and 1 sentence. Students see changes next time they open the site. Built-in words have recorded audio; new words use the device's Arabic voice.</p>
   </div>
   <div class="card stack">
    <div class="row" style="justify-content:space-between"><h3>Past papers and resources</h3><button class="btn sm primary" id="newR">Add resource</button></div>
    ${resources.length ? `<div class="scroll"><table class="data"><thead><tr><th>Title</th><th>Type</th><th>For</th><th>Link</th><th></th></tr></thead><tbody>
     ${resources.map(r => `<tr><td class="name">${esc(r.title)}</td><td>${esc(r.kind || "")}</td><td>${esc(r.year && r.year !== "all" ? yearLabel(r.year) : "All years")}</td><td class="small" style="max-width:260px;overflow:hidden;text-overflow:ellipsis">${esc(r.url)}</td><td><div class="row"><button class="btn sm" data-er="${esc(r.id)}">Edit</button><button class="btn sm ghost" data-dr="${esc(r.id)}" style="color:var(--bad)">Delete</button></div></td></tr>`).join("")}
    </tbody></table></div>` : `<div class="empty">No resources yet.</div>`}
    <p class="small muted">Upload papers to Google Drive or OneDrive, set sharing to "anyone with the link can view", then paste the link here.</p>
   </div></div>`;
  $$("[data-cy]", v).forEach(b => b.onclick = () => { ST.cyear = b.dataset.cy; render(); });
  $("#newU").onclick = () => unitDlg(null, yr);
  $$("[data-eu]", v).forEach(b => b.onclick = () => unitDlg(b.dataset.eu, yr));
  $$("[data-hide]", v).forEach(b => b.onclick = async () => { const base = byId[b.dataset.hide] || { year: yr }; if (await run(null, () => B.db.saveUnit({ ...base, id: b.dataset.hide, year: base.year || yr, hidden: true }), "Hidden from students")) render(); });
  $$("[data-show]", v).forEach(b => b.onclick = async () => { const d = byId[b.dataset.show]; const isB = builtin.some(x => x.id === d.id) && !(d.words && d.words.length); if (await run(null, () => isB ? B.db.deleteUnit(d.id) : B.db.saveUnit({ ...d, hidden: false }), "Visible again")) render(); });
  $$("[data-reset]", v).forEach(b => b.onclick = async () => { if (!(await confirmDlg("Restore original?", "Your edits to this topic will be removed.", "Restore"))) return; if (await run(null, () => B.db.deleteUnit(b.dataset.reset), "Restored")) render(); });
  $$("[data-delu]", v).forEach(b => b.onclick = async () => { if (!(await confirmDlg("Delete topic?", "Homework set on this topic will stop working.", "Delete"))) return; if (await run(null, () => B.db.deleteUnit(b.dataset.delu), "Deleted")) render(); });
  $("#newR").onclick = () => resourceDlg(null);
  $$("[data-er]", v).forEach(b => b.onclick = () => resourceDlg(resources.find(r => r.id === b.dataset.er)));
  $$("[data-dr]", v).forEach(b => b.onclick = async () => { if (!(await confirmDlg("Delete resource?", "Students won't see it any more.", "Delete"))) return; if (await run(null, () => B.db.deleteResource(b.dataset.dr), "Deleted")) render(); });
}
function builtinDoc(id) {
  for (const y of BUILTIN_CURRICULUM) for (const u of y.units) if (u.id === id) return { id, year: y.id, en: u.en, ar: u.ar, words: u.words.map(w => ({ ar: w[0], tr: w[1], en: w[2] })), sentences: u.sentences.map(s => ({ ar: s[0], en: s[1] })) };
  return null;
}
function unitDlg(id, yr) {
  const saved = id && ST.units.find(u => u.id === id);
  const base = builtinDoc(id);
  const u = saved && saved.words && saved.words.length ? { ...saved } : base ? { ...base, hidden: saved ? saved.hidden : false } : { id: "", year: yr, en: "", ar: "", words: [], sentences: [] };
  while (u.words.length < 5) u.words.push({ ar: "", tr: "", en: "" });
  if (!u.sentences.length) u.sentences.push({ ar: "", en: "" });
  const wrow = w => `<div class="wordrow"><input class="ar" dir="rtl" lang="ar" placeholder="العربية" value="${esc(w.ar)}"><input placeholder="transliteration" value="${esc(w.tr)}"><input placeholder="English" value="${esc(w.en)}"><button type="button" class="icon-btn" data-rm aria-label="Remove">×</button></div>`;
  const srow = s => `<div class="wordrow s"><input class="ar" dir="rtl" lang="ar" placeholder="الجملة" value="${esc(s.ar)}"><input placeholder="English" value="${esc(s.en)}"><button type="button" class="icon-btn" data-rm aria-label="Remove">×</button></div>`;
  openDlg(`<h2>${id ? "Edit topic" : "New topic"}</h2>
   <form id="uf" class="stack">
    <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">
     <label class="field">Topic (English)<input type="text" id="uf-en" required maxlength="60" value="${esc(u.en)}"></label>
     <label class="field">Topic (Arabic)<input type="text" id="uf-ar" class="ar" dir="rtl" maxlength="60" value="${esc(u.ar)}"></label>
     <label class="field">Year<select id="uf-year" ${base ? "disabled" : ""}>${CURRICULUM.map(y => `<option value="${y.id}" ${y.id === u.year ? "selected" : ""}>${y.label}</option>`).join("")}</select></label>
    </div>
    <div class="field">Words (Arabic · transliteration · English)<div class="wordrows" id="uf-words">${u.words.map(wrow).join("")}</div><button type="button" class="btn sm" id="uf-addw" style="align-self:flex-start">Add word</button></div>
    <div class="field">Example sentences (Arabic · English)<div class="wordrows" id="uf-sents">${u.sentences.map(srow).join("")}</div><button type="button" class="btn sm" id="uf-adds" style="align-self:flex-start">Add sentence</button></div>
    <div class="row"><button class="btn primary" id="uf-save">Save topic</button><button class="btn" type="button" data-close>Cancel</button></div>
   </form>`, r => {
    const bindRm = () => $$("[data-rm]", r).forEach(b => b.onclick = () => b.parentElement.remove());
    bindRm();
    $("#uf-addw", r).onclick = () => { $("#uf-words", r).insertAdjacentHTML("beforeend", wrow({ ar: "", tr: "", en: "" })); bindRm(); };
    $("#uf-adds", r).onclick = () => { $("#uf-sents", r).insertAdjacentHTML("beforeend", srow({ ar: "", en: "" })); bindRm(); };
    $("#uf", r).onsubmit = async e => {
      e.preventDefault();
      const words = $$("#uf-words .wordrow", r).map(x => { const i = $$("input", x); return { ar: i[0].value.trim(), tr: i[1].value.trim(), en: i[2].value.trim() }; }).filter(w => w.ar && w.en);
      const sentences = $$("#uf-sents .wordrow", r).map(x => { const i = $$("input", x); return { ar: i[0].value.trim(), en: i[1].value.trim() }; }).filter(s => s.ar);
      if (words.length < 5) { toast("Add at least 5 words with Arabic and English"); return; }
      if (!sentences.length) { toast("Add at least 1 sentence"); return; }
      const year = base ? base.year : $("#uf-year", r).value;
      const newId = id || ("x-" + year + "-" + Date.now().toString(36));
      const order = id ? (saved && saved.order) : 900 + Date.now() % 1000;
      const doc = { id: newId, year, en: $("#uf-en", r).value.trim(), ar: $("#uf-ar", r).value.trim(), words, sentences, hidden: !!u.hidden };
      if (order != null) doc.order = order;
      if (await run($("#uf-save", r), () => B.db.saveUnit(doc), "Topic saved")) { closeDlg(); render(); }
    };
  });
}
function resourceDlg(res) {
  res = res || { title: "", url: "", year: "all", kind: "Past paper", note: "" };
  openDlg(`<h2>${res.id ? "Edit resource" : "Add resource"}</h2>
   <form id="rf" class="stack">
    <label class="field">Title<input type="text" id="rf-title" required maxlength="100" value="${esc(res.title)}" placeholder="e.g. DP Arabic B Paper 1, May 2024"></label>
    <label class="field">Link<input type="text" id="rf-url" required value="${esc(res.url)}" placeholder="https://drive.google.com/…"></label>
    <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">
     <label class="field">Type<select id="rf-kind">${["Past paper", "Mark scheme", "Listening audio", "Worksheet", "Video", "Website", "Other"].map(k => `<option ${k === res.kind ? "selected" : ""}>${k}</option>`).join("")}</select></label>
     <label class="field">For<select id="rf-year"><option value="all">All years</option>${CURRICULUM.map(y => `<option value="${y.id}" ${y.id === res.year ? "selected" : ""}>${y.label}</option>`).join("")}</select></label>
    </div>
    <label class="field">Note for students (optional)<input type="text" id="rf-note" maxlength="200" value="${esc(res.note)}"></label>
    <div class="row"><button class="btn primary" id="rf-save">Save</button><button class="btn" type="button" data-close>Cancel</button></div>
   </form>`, r => {
    $("#rf", r).onsubmit = async e => {
      e.preventDefault(); const url = $("#rf-url", r).value.trim();
      if (!/^https?:\/\//i.test(url)) { toast("The link must start with https://"); return; }
      if (await run($("#rf-save", r), () => B.db.saveResource({ id: res.id, title: $("#rf-title", r).value.trim(), url, kind: $("#rf-kind", r).value, year: $("#rf-year", r).value, note: $("#rf-note", r).value.trim(), createdBy: res.createdBy || ST.me.email, createdAt: res.createdAt || Date.now() }), "Saved")) { closeDlg(); render(); }
    };
  });
}

/* ====================================================================== reports */
async function vReports(v) {
  ST.classes = await B.db.listClasses(ST.me);
  v.innerHTML = `<div class="stack">
   ${head("Reports", "Download reports", "Spreadsheets open in Excel or Google Sheets. Arabic text is kept.")}
   <div class="card stack">
    <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
     <label class="field">Time period<select id="rp-range"><option value="7">Last 7 days</option><option value="30" selected>Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last year</option><option value="0">Everything</option></select></label>
    </div>
    <div class="field">Classes<div class="chk-list">${ST.classes.map(c => `<label><input type="checkbox" value="${esc(c.id)}" checked> ${esc(c.name)}</label>`).join("") || '<span class="muted small">No classes</span>'}</div></div>
    <div class="stack" style="gap:10px">
     <div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:10px"><div><b>Student summary</b><div class="small muted">One row per student: average score, activities done, homework completed, skills.</div></div><button class="btn primary" data-rep="summary">Download</button></div>
     <div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:10px"><div><b>Homework gradebook</b><div class="small muted">Students down the side, homework across the top, best score in each cell.</div></div><button class="btn" data-rep="gradebook">Download</button></div>
     <div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:10px"><div><b>Every result</b><div class="small muted">Every lesson, quiz, test and homework finished, with skill scores.</div></div><button class="btn" data-rep="all">Download</button></div>
    </div>
   </div></div>`;
  $$("[data-rep]", v).forEach(b => b.onclick = () => run(b, () => report(b.dataset.rep, +$("#rp-range").value, $$(".chk-list input:checked", v).map(x => x.value))));
}
async function report(kind, days, cids) {
  if (!cids.length) { toast("Choose at least one class"); return; }
  const since = days ? Date.now() - days * DAY : 0;
  const skillsAll = ["Vocabulary", "Listening", "Writing", "Reading", "Grammar", "Spelling"];
  const out = [];
  for (const cid of cids) {
    const cls = ST.classes.find(c => c.id === cid);
    const [students, homework, attempts] = await Promise.all([B.db.listStudents(cid), B.db.listHomework(cid), B.db.listAttempts(cid, since)]);
    if (kind === "all") attempts.forEach(a => out.push([new Date(a.at).toISOString().replace("T", " ").slice(0, 16), cls.name, a.name, B.showCode(a.code), KIND[a.kind] || a.kind, a.title, a.score, a.total, P(a), a.level || "", a.secs ? Math.round(a.secs / 60) : "", ...skillsAll.map(k => a.skills && a.skills[k] ? `${a.skills[k].ok}/${a.skills[k].n}` : ""), a.ended || ""]));
    else if (kind === "summary") {
      const progress = {}; await Promise.all(students.map(async s => { progress[s.code] = await B.db.getProgress(s.code); }));
      students.forEach(s => {
        const mine = attempts.filter(a => codesOf(s).includes(a.code)), p = progress[s.code] || {}, st = p.stats || {};
        const sk = {}; mine.forEach(a => Object.entries(a.skills || {}).forEach(([k, x]) => { sk[k] = sk[k] || { ok: 0, n: 0 }; sk[k].ok += x.ok; sk[k].n += x.n; }));
        const hwDone = homework.filter(h => mine.some(a => a.hwId === h.id) || (p.done || {})[h.id]).length;
        out.push([cls.name, s.name, B.showCode(s.code), levelOf((p.profile && p.profile.years) || s.years), mine.length, avg(mine.map(a => P(a))) ?? "", hwDone, homework.length, st.xp || 0, streakOf(st.days), Object.keys(st.nodes || {}).length, mine[0] ? new Date(mine[0].at).toISOString().slice(0, 10) : "", ...skillsAll.map(k => sk[k] && sk[k].n ? Math.round(sk[k].ok / sk[k].n * 100) : ""), s.active === false ? "Off" : "Active"]);
      });
    } else {
      out.push([cls.name, "", ...homework.map(h => h.title + (h.due ? ` (due ${h.due})` : ""))]);
      const all = await B.db.listAttempts(cid, 0);
      students.forEach(s => out.push(["", s.name, ...homework.map(h => { const a = all.filter(x => codesOf(s).includes(x.code) && x.hwId === h.id); return a.length ? Math.max(...a.map(x => P(x))) + "%" : "Not done"; })]));
      out.push([]);
    }
  }
  const heads = {
    all: ["Date", "Class", "Student", "Code", "Activity", "Title", "Score", "Out of", "%", "Level", "Minutes", ...skillsAll, "Note"],
    summary: ["Class", "Student", "Code", "Level", "Activities done", "Average %", "Homework done", "Homework set", "Points", "Streak", "Lessons done", "Last activity", ...skillsAll.map(k => k + " %"), "Status"],
    gradebook: null
  };
  const rows = heads[kind] ? [heads[kind], ...out] : [["Class", "Student", "Homework →"], ...out];
  download(`Meadows Lingo ${kind === "all" ? "results" : kind} ${stamp()}.csv`, rows);
  toast("Downloaded");
}

/* ====================================================================== boot */
if (B.DEMO) {
  const d = $("#demo"); d.hidden = false;
  d.innerHTML = `<div><b>Demo mode.</b> Firebase isn't connected yet, so changes are saved only in this browser. Follow SETUP.md to go live.</div>`;
}
let booted = false;
B.onAuth(async u => {
  if (!u) { location.replace("index.html"); return; }
  let s; try { s = await B.resolveSession(u); } catch (e) { location.replace("index.html"); return; }
  if (!s || s.kind !== "staff") { location.replace(s && s.kind === "student" ? "app.html" : "index.html"); return; }
  ST.me = s;
  if (booted) return; booted = true;
  try { applyContent(await B.db.listUnits()); } catch (e) { }
  ST.tab = s.role === "admin" ? "overview" : "classes";
  const t = location.hash.slice(1); if (tabsFor().some(x => x[0] === t)) ST.tab = t;
  nav(); render();
}).catch(e => { $("#view").innerHTML = `<div class="card">Couldn't connect. ${esc(B.friendlyError(e))}</div>`; });

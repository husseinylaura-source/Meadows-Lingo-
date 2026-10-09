/* ============================== STATE ============================== */
import * as B from "./backend.js";
let SESSION=null, CODE=null, CLASS_ID=null;
const S = {
 tab:"home",
 profile:null,
 stats:{xp:0,sessions:0,seen:{},letters:{},days:{},nodes:{}},
 done:{},
 hw:{assignments:[],updated:""}, hwLoaded:false, resources:[], resLoaded:false,
 vocabYear:null, vocabUnit:null, writeMode:null, writeUnit:null, readLevel:null, ibtLevel:null
};
/* progress is kept in memory and saved to the database shortly after each change */
let saveTimer=null, unsaved=false;
function persist(){unsaved=true;clearTimeout(saveTimer);saveTimer=setTimeout(flush,1500)}
async function flush(){
 if(!unsaved||!CODE)return;unsaved=false;
 try{await B.db.saveProgress(CODE,{classId:CLASS_ID,name:S.profile.name,stats:S.stats,done:S.done,profile:{years:String(S.profile.years)}})}
 catch(e){unsaved=true;console.warn("save failed",e);if(e&&e.code==="permission-denied"&&await recheckClass())return flush();clearTimeout(saveTimer);saveTimer=setTimeout(flush,15000)}
}
/* if an admin moves or switches off this student while they're signed in */
async function recheckClass(){
 try{const c=await B.db.codeInfo(CODE);
  if(!c||c.active===false){await B.signOut();return false}
  if(c.classId!==CLASS_ID){CLASS_ID=c.classId;loadHomework();return true}
 }catch(e){}
 return false}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flush()});
window.addEventListener("pagehide",flush);
function saveStats(){persist()}
function profileLevel(){return S.profile?levelFromYears(S.profile.years):"A"}
function profileYear(){return S.profile?S.profile.year:"7"}

/* ============================== UTILITIES ============================== */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sample=(a,n)=>shuffle(a).slice(0,n);
const TASHKEEL=/[ً-ْٰـ]/g;
function norm(s){return String(s).replace(TASHKEEL,"").replace(/[أإآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[؟?!.،,«»:]/g,"").replace(/\s+/g," ").trim()}
function plain(s){return String(s).replace(TASHKEEL,"")}
function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,2600)}
function fmtDate(d){if(!d)return"";const x=new Date(d+"T12:00:00");return isNaN(x)?d:x.toLocaleDateString(undefined,{weekday:"short",day:"numeric",month:"short"})}
function daysUntil(d){const x=new Date(d+"T23:59:59");return Math.ceil((x-new Date())/864e5)}
const ICON_SPEAK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const ICON_SLOW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
function speakBtn(text,label,slow){return `<button class="icon-btn" data-speak="${esc(text)}" ${slow?'data-slow="1"':""} aria-label="${esc(label||"Listen")}" title="${slow?"Listen slowly":"Listen"}">${slow?ICON_SLOW:ICON_SPEAK}</button>`}

/* speech: recorded clips shipped with the page (audio/<group>.json), browser voice only as a fallback */
const LETTER_NAMES=["ألف","باء","تاء","ثاء","جيم","حاء","خاء","دال","ذال","راء","زاي","سين","شين","صاد","ضاد","طاء","ظاء","عين","غين","فاء","قاف","كاف","لام","ميم","نون","هاء","واو","ياء"];
function akey(t){t=plain(String(t)).trim();let h=2166136261;for(const c of t){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16)}
const KEY2GROUP={};
CURRICULUM.forEach(y=>y.units.forEach(u=>{u.words.forEach(w=>KEY2GROUP[akey(w[0])]=u.id);u.sentences.forEach(x=>KEY2GROUP[akey(x[0])]=u.id)}));
LETTERS.forEach((l,k)=>{KEY2GROUP[akey(LETTER_NAMES[k])]="letters";KEY2GROUP[akey(l[2])]=KEY2GROUP[akey(l[2])]||"letters"});
Object.values(PASSAGES).forEach(p=>KEY2GROUP[akey(p.text)]="passages");
const AUDIO={};let CUR_AUDIO=null,SPEAK_SEQ=0;
function loadGroup(g){if(!g)return Promise.resolve({});if(!AUDIO[g])AUDIO[g]=fetch("audio/"+g+".json").then(r=>r.ok?r.json():{}).catch(()=>({}));return AUDIO[g]}
function preloadFor(texts){new Set(texts.filter(Boolean).map(t=>KEY2GROUP[akey(t)])).forEach(g=>loadGroup(g))}
let AR_VOICE=null;
function pickVoice(){try{const v=speechSynthesis.getVoices();AR_VOICE=v.find(x=>/^ar/i.test(x.lang))||null}catch(e){}}
if("speechSynthesis" in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
function browserSpeak(text,slow){
 if(!("speechSynthesis" in window)){toast("Sound isn't available for this one on this device.");return}
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(plain(text));u.lang=AR_VOICE?AR_VOICE.lang:"ar-SA";if(AR_VOICE)u.voice=AR_VOICE;u.rate=slow?0.6:0.9;speechSynthesis.speak(u)}catch(e){}
}
/* Teacher recordings: audio/voice/manifest.json maps a text key to a file in audio/voice/.
   Made with recorder.html. A recording always wins over the built-in clips and the browser voice. */
let VOICE=null;
function loadVoice(){if(!VOICE)VOICE=fetch("audio/voice/manifest.json",{cache:"no-cache"}).then(r=>r.ok?r.json():{}).then(m=>m&&m.files?m.files:{}).catch(()=>({}));return VOICE}
loadVoice();
async function speak(text,slow){
 const seq=++SPEAK_SEQ;
 try{if(CUR_AUDIO){CUR_AUDIO.pause();CUR_AUDIO=null}speechSynthesis&&speechSynthesis.cancel()}catch(e){}
 const k=akey(text);
 const vm=await loadVoice();if(seq!==SPEAK_SEQ)return;
 if(vm[k]){const a=new Audio("audio/voice/"+encodeURIComponent(vm[k]));try{a.preservesPitch=true;a.mozPreservesPitch=true;a.webkitPreservesPitch=true}catch(e){}
  a.playbackRate=slow?0.75:1;CUR_AUDIO=a;try{await a.play();return}catch(e){if(e&&e.name==="NotAllowedError"){toast("Tap the speaker button to hear it");return}}}
 const g=KEY2GROUP[k];
 if(!g){browserSpeak(text,slow);return}
 const data=await loadGroup(g);if(seq!==SPEAK_SEQ)return;
 if(!data[k]){browserSpeak(text,slow);return}
 const a=new Audio("data:audio/mpeg;base64,"+data[k]);
 try{a.preservesPitch=true;a.mozPreservesPitch=true;a.webkitPreservesPitch=true}catch(e){}
 a.playbackRate=slow?0.7:1;CUR_AUDIO=a;
 try{await a.play()}catch(e){if(e&&e.name==="NotAllowedError")toast("Tap the speaker button to hear it");else browserSpeak(text,slow)}
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-speak]");if(b){e.stopPropagation();speak(b.dataset.speak,b.dataset.slow==="1")}},true);

async function copyText(t){try{await navigator.clipboard.writeText(t);toast("Copied")}catch(e){toast("Select the text and copy it")}}

/* ============================== NAV ============================== */
const TABS=[["home","Learn"],["vocab","Words"],["writing","Writing"],["reading","Reading & listening"],["ibt","IBT Practice"],["homework","Homework"],["resources","Resources"]];
function dueCount(){return S.hw.assignments.filter(a=>!S.done[a.id]&&forMe(a)).length}
function forMe(a){return true}
function renderNav(){
 const show=TABS;
 $("#tabs").innerHTML=show.map(([id,l])=>`<button data-tab="${id}" ${S.tab===id||(S.tab==="theme"&&id==="home")?'aria-current="page"':""}>${l}${id==="homework"&&dueCount()?`<span class="badge">${dueCount()}</span>`:""}</button>`).join("");
 const p=S.profile;
 $("#who").innerHTML=p?`<span class="hstat flame" title="Day streak">${ICON_FLAME}${streak()}</span><span class="hstat gem" title="Points">${S.stats.xp} pts</span><span class="pill acc">${LEVELS[profileLevel()].name}</span>`:"";
}
$("#tabs").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b)go(b.dataset.tab)});
function go(tab){S.tab=tab;R=null;hideFooter();try{speechSynthesis.cancel()}catch(e){}try{if(CUR_AUDIO){CUR_AUDIO.pause();CUR_AUDIO=null}}catch(e){}render();window.scrollTo({top:0})}
/* each theme tints the pages and lessons that belong to it */
function applyTheme(u){const t=u&&window.ART?ART.theme(u.art):null;document.body.classList.toggle("themed",!!t);if(t)document.body.style.setProperty("--t",t.ui);else document.body.style.removeProperty("--t")}
function artFor(u,label){const ph=window.ART?ART.photo(u.id):"";if(ph)return `<img class="art-svg" src="${ph}" alt="${esc(label||"")}" loading="lazy">`;return window.ART?ART.scene(u.art||"meadow",{label}):""}
function fmtText(t){return esc(t).replace(/\n/g,"<br>")}
function render(){renderNav();applyTheme(S.tab==="theme"?UNITS[S.themeId]:null);const v=$("#view");({home:vHome,theme:vTheme,vocab:vVocab,writing:vWriting,reading:vReading,ibt:vIbt,homework:vHomework,resources:vResources}[S.tab]||vHome)(v)}

/* ============================== LEARN PATH (home) ============================== */
const NODE_ICONS={
 star:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z"/></svg>',
 book:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16H6.5a1.5 1.5 0 0 0 0 3H20v1H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>',
 ear:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 13a9 9 0 0 1 18 0v5a3 3 0 0 1-3 3h-2v-8h3a7 7 0 0 0-14 0h3v8H6a3 3 0 0 1-3-3z"/></svg>',
 pen:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.2 3.3a2 2 0 0 1 2.8 0l2.7 2.7a2 2 0 0 1 0 2.8L9 20.5l-5.5 1 1-5.5z"/></svg>',
 cup:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 2h12v3h3v3a5 5 0 0 1-4.6 5A6 6 0 0 1 13 16.9V19h4v3H7v-3h4v-2.1A6 6 0 0 1 7.6 13 5 5 0 0 1 3 8V5h3zm0 5H5v1a3 3 0 0 0 1.4 2.5A6 6 0 0 1 6 8zm12 0v1c0 .9-.1 1.7-.4 2.5A3 3 0 0 0 19 8V7z"/></svg>',
 lock:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>',
 phones:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h2v-8H5v-1a7 7 0 0 1 14 0v1h-3v8h2a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z"/></svg>',
 read:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 5.5C4.8 4 8.2 4 11 5.6V20c-2.8-1.4-6.2-1.4-9 0zM13 5.6C15.8 4 19.2 4 22 5.5V20c-2.8-1.4-6.2-1.4-9 0z"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 5v2h10V9zm0 4v2h7v-2z"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};
const ICON_FLAME='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2s5 4.6 5 10a5 5 0 0 1-10 0c0-2 1-3.6 1-3.6S8.8 11 10.5 11C10 7 12 2 12 2zm0 20a7 7 0 0 1-7-7c0-1.6.5-3.1 1.3-4.4.2 1.5 1.3 3 3.2 3.4-.3 1.8.9 4 2.5 4s2.8-1.4 2.8-3.4c0-1 .7-1.8 1.3-2.6.6 1.1 1 2.3 1 3.6A5 5 0 0 1 12 22z" opacity=".9"/></svg>';
const ICON_HEART='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-8-5.2-8-11.2A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8 3.2C20 15.8 12 21 12 21z"/></svg>';
const DAILY_GOAL=30;
function dayKey(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function todayXp(){return (S.stats.days||{})[dayKey(new Date())]||0}
function streak(){const days=S.stats.days||{};let n=0;const d=new Date();if(!days[dayKey(d)])d.setDate(d.getDate()-1);while(days[dayKey(d)]){n++;d.setDate(d.getDate()-1)}return n}
function addXp(x){S.stats.xp+=x;S.stats.days=S.stats.days||{};const k=dayKey(new Date());S.stats.days[k]=(S.stats.days[k]||0)+x;saveStats()}
function nodeId(u,k){return u.id+":"+k}
/* A theme's stages: its words in small groups, then listening, reading and writing when the
   theme has them, and a review to finish. */
function wordChunks(u){const W=u.words.map(W3),n=W.length;if(n<=10){const h=Math.ceil(n/2);return [W.slice(0,h),W.slice(h)]}
 const parts=Math.ceil(n/8),size=Math.ceil(n/parts),out=[];for(let i=0;i<n;i+=size)out.push(W.slice(i,i+size));return out}
function unitNodes(u){
 const ch=wordChunks(u),out=[];
 ch.forEach((c,i)=>out.push({k:"w"+i,label:ch.length===2&&u.words.length<=10?(i?"More words":"New words"):`Words ${i+1}`,icon:i?"book":"star",desc:`${c.length} words: ${c.slice(0,3).map(w=>w.en).join(", ")}…`}));
 out.push({k:"spell",label:"Listen & spell",icon:"ear",desc:"Hear the words and build them from letters"});
 out.push({k:"sent",label:"Sentences",icon:"chat",desc:"Put the theme's sentences together"});
 if(u.listening)out.push({k:"listening",label:"Listening",icon:"phones",desc:u.listening.title||"Listen to a short text and answer the questions",ar:!!u.listening.title});
 if(u.reading)out.push({k:"reading",label:"Reading",icon:"read",desc:u.reading.title||"Read a text and answer the questions",ar:!!u.reading.title});
 if(u.writing)out.push({k:"writing",label:"Writing task",icon:"pen",desc:u.writing.en||"Write your own text about the theme"});
 out.push({k:"review",label:"Theme review",icon:"cup",desc:"Mixed questions to finish the theme"});
 return out.map(x=>({...x,id:nodeId(u,x.k)}));
}
function nodeStates(u){const ns=unitNodes(u);const next=ns.find(n=>!S.stats.nodes[n.id]);return ns.map(n=>({...n,st:S.stats.nodes[n.id]!=null?"done":"open",now:next&&n.id===next.id}))}
function unitProgress(u){const ns=unitNodes(u);const d=ns.filter(n=>S.stats.nodes[n.id]!=null).length;return {done:d,total:ns.length,pct:Math.round(d/ns.length*100),next:ns.find(n=>S.stats.nodes[n.id]==null)}}
function skillDots(u){return [["Words","star"],["Listening","phones",!!u.listening],["Reading","read",!!u.reading],["Writing","pen",!!u.writing]].filter(x=>x[2]!==false).map(x=>`<span class="sk" title="${x[0]}">${NODE_ICONS[x[1]]}</span>`).join("")}
function startNode(u,k){if(!S.profile){toast("Add your name first");return}
 const node=unitNodes(u).find(n=>n.k===k);if(!node){toast("This stage isn't available");return}
 S.themeId=u.id;const lvl=profileLevel();const gen=()=>genLesson(u,k,lvl);
 runSession({title:`${u.en} · ${node.label}`,items:gen(),regen:gen,back:"theme",node:nodeId(u,k),hearts:k==="writing"?null:3,kind:k==="writing"?"writing":"lesson",unit:u.id})}

function vHome(v){
 const p=S.profile;
 if(!p){v.innerHTML=`<div class="stack" style="max-width:720px">
  <div class="card stack">
   <div class="hero-ar ar">أهلا وسهلا</div>
   <h2>Welcome to Meadows Lingo</h2>
   <p class="muted">Learn Arabic one theme at a time: words, listening, reading and writing from your course. Keep your streak going, earn points and finish the homework your teacher sets.</p>
   ${profileForm()}
  </div></div>`;bindProfile();return}
 const lvl=profileLevel(), L=LEVELS[lvl];
 if(!S.learnYear)S.learnYear=p.year;
 const yr=CURRICULUM.find(y=>y.id===S.learnYear)||CURRICULUM[0];
 const all=yr.units.map(u=>({u,pr:unitProgress(u)}));
 const doneCount=all.reduce((a,x)=>a+x.pr.done,0),totalCount=all.reduce((a,x)=>a+x.pr.total,0);
 const last=UNITS[S.stats.lastTheme];const resume=last&&last.year===yr.id&&unitProgress(last).next?last:(all.find(x=>x.pr.done>0&&x.pr.next)||{}).u;
 const due=S.hw.assignments.filter(a=>!S.done[a.id]&&forMe(a)).sort((a,b)=>(a.due||"9").localeCompare(b.due||"9"));
 const tx=todayXp(),st=streak();
 const cards=all.map(({u,pr},i)=>{const t=ART.theme(u.art);
  return `<button class="theme-card${pr.pct===100?" complete":""}" data-theme="${u.id}" style="--t:${t.ui}" aria-label="Theme ${i+1}: ${esc(u.en)}, ${pr.done} of ${pr.total} stages done">
   <span class="tc-art">${artFor(u)}</span>
   ${pr.pct===100?`<span class="tc-badge">${NODE_ICONS.check}</span>`:pr.done?`<span class="tc-badge part">${pr.pct}%</span>`:""}
   <span class="tc-copy"><span class="tc-kicker">Theme ${i+1}</span><span class="tc-title">${esc(u.en)}</span><span class="tc-ar ar">${u.ar}</span>
    <span class="tc-foot"><span class="tc-skills">${skillDots(u)}</span><span class="tc-bar"><span style="width:${pr.pct}%"></span></span></span></span>
  </button>`}).join("");
 v.innerHTML=`<div class="stack home">
  <section class="hero">
   <div class="hero-art">${ART.scene("hero")}</div><div class="hero-shade"></div>
   <div class="hero-copy"><div class="hero-kicker ar">تعلّم العربية</div><h1>Meadows Lingo</h1>
    <p class="hero-sub">${yr.label} Arabic · ${yr.units.length} themes</p>
    <p class="hero-tag">Every theme is a journey: learn the words, then listen, read and write about it.</p></div>
  </section>
  ${resume?`<div class="resume"><div style="min-width:0"><b>${esc(p.name)}</b>, carry on with <b>${esc(resume.en)}</b> · ${esc(unitProgress(resume).next.label)}</div><button class="btn primary" data-theme="${resume.id}">Continue</button></div>`:""}
  <div class="learn">
   <aside class="side stack">
    <div class="card stack" style="gap:14px">
     <div class="row" style="justify-content:space-between"><div><div class="eyebrow">Marhaban</div><h3>${esc(p.name)}</h3><div class="small muted">${L.name} · ${L.years}</div></div><button class="btn sm ghost" id="editProfile">Edit</button></div>
     <div class="trio">
      <div class="stat"><span class="flame">${ICON_FLAME}<b>${st}</b></span><span class="small muted">day streak</span></div>
      <div class="stat"><b>${S.stats.xp}</b><span class="small muted">total points</span></div>
      <div class="stat"><b>${doneCount}<span class="small muted">/${totalCount}</span></b><span class="small muted">stages</span></div>
     </div>
     <div class="stack" style="gap:6px"><div class="row" style="justify-content:space-between"><span style="font-weight:600">Daily goal</span><span class="small muted" style="font-variant-numeric:tabular-nums">${Math.min(tx,DAILY_GOAL)} / ${DAILY_GOAL} points</span></div>
      <div class="progress goal"><span style="width:${Math.min(100,tx/DAILY_GOAL*100)}%"></span></div>
      <div class="small muted">${tx>=DAILY_GOAL?"Goal reached today. ممتاز!":"About one stage to reach today's goal."}</div></div>
    </div>
    <div class="card stack">
     <div class="row" style="justify-content:space-between"><h3>Homework</h3>${due.length?`<span class="pill red">${due.length} to do</span>`:`<span class="pill good">All done</span>`}</div>
     ${due.length?due.slice(0,3).map(a=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div style="min-width:0"><div style="font-weight:500">${esc(a.title)}</div><div class="small muted">${a.due?"Due "+fmtDate(a.due):ACTIVITIES[a.activity]?.en||""}</div></div><button class="btn sm primary" data-starthw="${esc(a.id)}">Start</button></div>`).join(""):`<p class="small muted">Nothing waiting. Keep your streak going with a theme.</p>`}
     <button class="btn ghost sm" data-tab-go="homework" style="align-self:flex-start">All homework</button>
    </div>
   </aside>
   <div class="stack main-path">
    <div class="seg" role="group" aria-label="Year">${CURRICULUM.map(y=>`<button data-ly="${y.id}" aria-pressed="${y.id===yr.id}">${y.label}</button>`).join("")}</div>
    <div class="theme-grid">${cards}</div>
    <div class="card row" style="justify-content:space-between"><div><h3>Finished ${yr.label}?</h3><p class="small muted">Test yourself with an IBT practice test at your level.</p></div><button class="btn primary" data-tab-go="ibt">IBT practice</button></div>
   </div></div></div>`;
 $("#editProfile").onclick=()=>{v.innerHTML=`<div class="card stack" style="max-width:720px"><h2>Your details</h2>${profileForm()}</div>`;bindProfile()};
 v.querySelectorAll("[data-ly]").forEach(b=>b.onclick=()=>{S.learnYear=b.dataset.ly;vHome(v)});
 v.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>openTheme(b.dataset.theme));
 bindCommon(v);
}
function openTheme(id){if(!UNITS[id])return;S.themeId=id;S.stats.lastTheme=id;persist();go("theme")}

function vTheme(v){
 const u=UNITS[S.themeId];if(!u){S.tab="home";return vHome(v)}
 const yr=CURRICULUM.find(y=>y.id===u.year)||CURRICULUM[0];const idx=yr.units.indexOf(u);
 const ns=nodeStates(u),pr=unitProgress(u);
 const nxt=yr.units[idx+1];
 const stage=(n,i)=>`<button class="stage ${n.st}${n.now?" now":""}" data-node="${n.k}">
   <span class="stage-ic">${NODE_ICONS[n.st==="done"?"check":n.icon]}</span>
   <span class="stage-txt"><span class="stage-n">Stage ${i+1}</span><b>${esc(n.label)}</b><span class="small muted${n.ar?" ar":""}">${esc(n.desc)}</span></span>
   ${n.now?`<span class="pill acc">${pr.done?"Next":"Start"}</span>`:n.st==="done"?`<span class="pill good">${S.stats.nodes[n.id]}%</span>`:""}</button>`;
 v.innerHTML=`<div class="stack">
  <section class="theme-hero">
   <div class="hero-art">${artFor(u,u.en)}</div><div class="hero-shade"></div>
   <button class="btn sm th-back" id="thBack">← All ${esc(yr.label)} themes</button>
   <div class="th-copy"><div class="tc-kicker">${esc(yr.label)} · Theme ${idx+1}</div><h1>${esc(u.en)}</h1><div class="th-ar ar">${u.ar}</div>
    <div class="th-prog"><span class="tc-bar"><span style="width:${pr.pct}%"></span></span><span>${pr.done} of ${pr.total} stages</span></div></div>
  </section>
  <div class="theme-body">
   <div class="stack stages" aria-label="Stages">${ns.map(stage).join("")}</div>
   <aside class="stack">
    <div class="card stack">
     <div class="row" style="justify-content:space-between"><h3>Theme words</h3><span class="pill">${u.words.length}</span></div>
     <div class="wordmini">${u.words.slice(0,8).map(w=>`<div class="wm-row">${speakBtn(w[0],"Listen to "+w[2])}<span class="ar wm-ar">${w[0]}</span><span class="small muted wm-en">${esc(w[2])}</span></div>`).join("")}</div>
     <button class="btn sm" id="allWords" style="align-self:flex-start">All ${u.words.length} words and flashcards</button>
    </div>
    ${nxt?`<button class="next-theme" data-theme="${nxt.id}" style="--t:${ART.theme(nxt.art).ui}"><span class="tc-art">${artFor(nxt)}</span><span class="tc-shade"></span><span class="tc-copy"><span class="tc-kicker">Next theme</span><span class="tc-title">${esc(nxt.en)}</span><span class="tc-ar ar">${nxt.ar}</span></span></button>`:""}
   </aside></div></div>`;
 $("#thBack").onclick=()=>{S.learnYear=u.year;go("home")};
 $("#allWords").onclick=()=>{S.vocabYear=u.year;S.vocabUnit=u.id;go("vocab")};
 v.querySelectorAll("[data-node]").forEach(b=>b.onclick=()=>startNode(u,b.dataset.node));
 v.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>openTheme(b.dataset.theme));
}
function bindCommon(v){
 v.querySelectorAll("[data-tab-go]").forEach(b=>b.onclick=()=>go(b.dataset.tabGo));
 v.querySelectorAll("[data-starthw]").forEach(b=>b.onclick=()=>startHomework(b.dataset.starthw));
}

/* ============================== UNIT PICKER ============================== */
function unitPicker(yearKey,unitKey,onChange){
 const yid=S[yearKey]||profileYear(); const yr=CURRICULUM.find(y=>y.id===yid)||CURRICULUM[0];
 if(!S[unitKey]||!yr.units.find(u=>u.id===S[unitKey]))S[unitKey]=yr.units[0].id;
 S[yearKey]=yr.id;
 const html=`<div class="stack" style="gap:10px">
  <div class="seg" role="group" aria-label="Year">${CURRICULUM.map(y=>`<button data-py="${y.id}" aria-pressed="${y.id===yr.id}">${y.label}</button>`).join("")}</div>
  <div class="chips">${yr.units.map(u=>`<button class="chip" data-pu="${u.id}" aria-pressed="${u.id===S[unitKey]}"><span>${esc(u.en)}</span><span class="ar">${u.ar}</span></button>`).join("")}</div></div>`;
 const bind=root=>{root.querySelectorAll("[data-py]").forEach(b=>b.onclick=()=>{S[yearKey]=b.dataset.py;S[unitKey]=null;onChange()});
  root.querySelectorAll("[data-pu]").forEach(b=>b.onclick=()=>{S[unitKey]=b.dataset.pu;onChange()})};
 return {html,bind,unit:UNITS[S[unitKey]]};
}

/* ============================== VOCAB ============================== */
function vVocab(v){
 const P=unitPicker("vocabYear","vocabUnit",()=>vVocab(v)); const u=P.unit; loadGroup(u.id);
 v.innerHTML=`<div class="stack">
  <div class="stack" style="gap:4px"><div class="eyebrow">Words</div><h2>Key words by topic</h2><p class="muted">Tap the speaker to hear each word. Then test yourself.</p></div>
  ${P.html}
  <div class="card stack">
   <div class="row" style="justify-content:space-between"><div><h3>${esc(u.en)} <span class="ar muted" style="font-weight:400">· ${u.ar}</span></h3><div class="small muted">${u.yearLabel} · ${u.words.length} words</div></div>
    <div class="row"><button class="btn" id="fc">Flashcards</button><button class="btn" id="lq">Listening quiz</button><button class="btn primary" id="mq">Meaning quiz</button></div></div>
  </div>
  <div class="grid">${u.words.map(w=>`<div class="card word">${speakBtn(w[0],"Listen to "+w[2])}<span class="ar">${w[0]}</span><span class="tr">${esc(w[1])}</span><span class="en">${esc(w[2])}</span></div>`).join("")}</div>
  <div class="card"><h3 style="margin-bottom:6px">Example sentences</h3>${u.sentences.map(s=>`<div class="sent">${speakBtn(s[0],"Listen to sentence")}<div style="min-width:0;flex:1"><div class="ar" style="text-align:right">${s[0]}</div><div class="small muted">${esc(s[1])}</div></div></div>`).join("")}</div>
 </div>`;
 P.bind(v);
 $("#fc").onclick=()=>flashcards(v,u);
 $("#mq").onclick=()=>runSession({title:u.en+" · Meaning quiz",items:genVocab(u,10),back:"vocab",kind:"vocab",unit:u.id});
 $("#lq").onclick=()=>runSession({title:u.en+" · Listening quiz",items:genListen(u,8),back:"vocab",kind:"listening",unit:u.id});
}
function flashcards(v,u){
 let i=0,flip=false; const ws=shuffle(u.words);
 const draw=()=>{const w=ws[i];
  v.innerHTML=`<div class="stack" style="max-width:640px;margin:0 auto">
   <div class="row" style="justify-content:space-between"><h2>${esc(u.en)} flashcards</h2><button class="btn sm" id="fx">Close</button></div>
   <div class="progress"><span style="width:${(i+1)/ws.length*100}%"></span></div>
   <div class="card flash" id="card" role="button" tabindex="0" aria-label="Flip card">
    ${flip?`<div class="eyebrow">Meaning</div><div style="font-size:1.6rem;font-weight:600">${esc(w[2])}</div><div class="tr muted"><i>${esc(w[1])}</i></div><div class="ar" style="font-size:1.6rem">${w[0]}</div>`
          :`<div class="eyebrow">Card ${i+1} of ${ws.length}</div><div class="ar big">${w[0]}</div><div class="small muted">Tap to see the meaning</div>`}
   </div>
   <div class="row" style="justify-content:center">${speakBtn(w[0],"Listen")}${speakBtn(w[0],"Listen slowly",true)}</div>
   <div class="row" style="justify-content:space-between"><button class="btn" id="fp" ${i?"":"disabled"}>Previous</button><button class="btn primary" id="fn">${i<ws.length-1?"Next":"Finish"}</button></div></div>`;
  ws.forEach(()=>{}); S.stats.seen[w[0]]=1; saveStats();
  const c=$("#card");c.onclick=()=>{flip=!flip;draw()};c.onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();flip=!flip;draw()}};
  $("#fp").onclick=()=>{i--;flip=false;draw()};$("#fn").onclick=()=>{if(i<ws.length-1){i++;flip=false;draw()}else vVocab(v)};$("#fx").onclick=()=>vVocab(v);
  speak(w[0]);
 };draw();
}

/* ============================== GENERATORS ============================== */
function distract(pool,correct,n,key){const c=pool.filter(x=>x[key]!==correct[key]);return sample(c,n).map(x=>x[key])}
function poolFor(u){const own=u.words.map(w=>({ar:w[0],tr:w[1],en:w[2]}));if(own.length>=6)return own;return own.concat(ALL_WORDS.filter(w=>w.unit!==u.id).slice(0,8))}
function genVocab(u,n){const pool=poolFor(u);const pick=[];while(pick.length<n)pick.push(...shuffle(pool));
 return pick.slice(0,n).map((w,k)=>k%2===0
  ?{type:"mcq",skill:"Vocabulary",prompt:"What does this word mean?",ar:w.ar,say:w.ar,options:shuffle([w.en,...distract(pool,w,3,"en")]),answer:w.en,word:w.ar}
  :{type:"mcq",skill:"Vocabulary",prompt:`Which word means <b>${esc(w.en)}</b>?`,options:shuffle([w.ar,...distract(pool,w,3,"ar")]),answer:w.ar,arabicOpts:true,word:w.ar})}
function genListen(u,n){const pool=poolFor(u);const pick=[];while(pick.length<n)pick.push(...shuffle(pool));
 return pick.slice(0,n).map(w=>({type:"mcq",skill:"Listening",prompt:"Listen, then choose the word you hear.",say:w.ar,autoSay:true,options:shuffle([w.ar,...distract(pool,w,3,"ar")]),answer:w.ar,arabicOpts:true,word:w.ar}))}
function genWords(u,n){let ws=u.words.filter(w=>!plain(w[0]).includes(" ")&&!/[؟?]/.test(w[0])&&Array.from(plain(w[0])).length<=9);
 if(ws.length<3)ws=ws.concat(ALL_WORDS.filter(w=>w.unit!==u.id&&!w.ar.includes(" ")).slice(0,6).map(w=>[w.ar,w.tr,w.en]));
 const pick=[];while(pick.length<n)pick.push(...shuffle(ws));
 return pick.slice(0,n).map(w=>{const letters=Array.from(plain(w[0]));let tiles=shuffle(letters);if(tiles.join("")===letters.join("")&&letters.length>1)tiles=tiles.reverse();
  return {type:"build",skill:"Writing",prompt:`Build the word for <b>${esc(w[2])}</b>`,hint:w[1],say:w[0],target:plain(w[0]),tiles,joiner:"",word:w[0]}})}
function genSentences(u,n){let ss=u.sentences.slice();if(ss.length<n){const more=shuffle(CURRICULUM.find(y=>y.id===u.year).units.filter(x=>x.id!==u.id).flatMap(x=>x.sentences));ss=ss.concat(more)}
 return shuffle(ss).slice(0,n).map(s=>{const words=plain(s[0]).split(" ");let tiles=shuffle(words);if(tiles.join(" ")===words.join(" ")&&words.length>1)tiles=tiles.reverse();
  return {type:"build",skill:"Writing",prompt:`Build the sentence: <i>${esc(s[1])}</i>`,say:s[0],target:words.join(" "),tiles,joiner:" "}})}
function genDictation(u,n,level){const items=u.words.map(w=>({ar:w[0],en:w[2]}));if(level>="C")u.sentences.forEach(s=>{if(plain(s[0]).split(" ").length<=5)items.push({ar:s[0],en:s[1]})});
 const pick=[];while(pick.length<n)pick.push(...shuffle(items));
 return pick.slice(0,n).map(it=>({type:"type",skill:"Writing",prompt:"Listen and write what you hear.",say:it.ar,autoSay:true,answer:it.ar,meaning:it.en,word:it.ar}))}
function genReading(level){const P=PASSAGES[level];return P.qs.map(q=>({type:"mcq",skill:"Reading",passage:P,prompt:q.q,hint:q.h,arPrompt:true,options:shuffle(q.o),answer:q.o[0],arabicOpts:true}))}
function genIbt(level,n){
 const reading=genReading(level);
 const bank=BANK[level].map(b=>({type:"mcq",skill:b.s,prompt:b.q,hint:b.h,arPrompt:true,options:shuffle(b.o),answer:b.o[0],arabicOpts:true}));
 const nR=Math.min(reading.length,Math.max(3,Math.round(n*0.35)));
 const rest=sample(bank,Math.min(bank.length,n-nR));
 const extra=n-nR-rest.length>0?sample(BANK[level==="A"?"A":String.fromCharCode(level.charCodeAt(0)-1)].map(b=>({type:"mcq",skill:b.s,prompt:b.q,hint:b.h,arPrompt:true,options:shuffle(b.o),answer:b.o[0],arabicOpts:true})),n-nR-rest.length):[];
 return reading.slice(0,nR).concat(shuffle(rest.concat(extra)));
}

/* lesson building blocks (Duolingo-style mix) */
const W3=w=>Array.isArray(w)?{ar:w[0],tr:w[1],en:w[2]}:w;
function introItem(w){w=W3(w);return {type:"intro",ar:w.ar,tr:w.tr,en:w.en,say:w.ar,autoSay:true}}
function mcqMeaning(w,pool){w=W3(w);return {type:"mcq",skill:"Vocabulary",prompt:"What does this mean?",ar:w.ar,say:w.ar,options:shuffle([w.en,...distract(pool,w,3,"en")]),answer:w.en,word:w.ar,meaning:w.en}}
function mcqWord(w,pool){w=W3(w);return {type:"mcq",skill:"Vocabulary",prompt:`Select the word for <b>“${esc(w.en)}”</b>`,options:shuffle([w.ar,...distract(pool,w,3,"ar")]),answer:w.ar,arabicOpts:true,word:w.ar,sayAfter:w.ar,meaning:w.en}}
function listenItem(w,pool){w=W3(w);return {type:"mcq",skill:"Listening",prompt:"Tap what you hear",say:w.ar,autoSay:true,options:shuffle([w.ar,...distract(pool,w,3,"ar")]),answer:w.ar,arabicOpts:true,word:w.ar,meaning:w.en}}
function matchItem(ws){return {type:"match",skill:"Vocabulary",pairs:ws.map(W3).slice(0,5).map(w=>[w.ar,w.en])}}
function genLesson(u,k,lvl){
 const pool=poolFor(u),W=u.words.map(W3);
 if(/^w\d+$/.test(k)){const ch=wordChunks(u),i=+k.slice(1),ws=ch[i]||ch[0],out=[];
  ws.forEach((w,j)=>{out.push(introItem(w));out.push(j%2?mcqWord(w,pool):mcqMeaning(w,pool))});
  out.push(listenItem(sample(ws,1)[0],pool));if(ws.length>=2)out.push(matchItem(shuffle(ws).slice(0,5)));
  if(i>0&&ch[i-1].length)out.push(mcqMeaning(sample(ch[i-1],1)[0],pool));
  return out}
 if(k==="spell"){const ws=shuffle(W);return [listenItem(ws[0],pool),...genWords(u,2),listenItem(ws[1],pool),matchItem(shuffle(W).slice(0,5)),...genWords(u,1),listenItem(ws[2],pool),mcqWord(ws[3],pool)]}
 if(k==="sent"){const out=genSentences(u,Math.min(4,Math.max(2,u.sentences.length)));out.splice(1,0,listenItem(sample(W,1)[0],pool));
  out.push(...(lvl==="A"?genWords(u,2):genDictation(u,2,lvl)));return out}
 if(k==="listening"&&u.listening)return genStoryListen(u);
 if(k==="reading"&&u.reading)return genThemeReading(u);
 if(k==="writing"&&u.writing)return genWritingTask(u,lvl);
 const ws=shuffle(W);
 return [matchItem(shuffle(W).slice(0,5)),...shuffle([mcqMeaning(ws[0],pool),mcqWord(ws[1],pool),listenItem(ws[2],pool),listenItem(ws[3],pool),mcqMeaning(ws[4],pool),...genSentences(u,1),...(lvl==="A"?genWords(u,2):genDictation(u,2,lvl))])];
}
function textMcq(block,q,skill,extra){return {type:"mcq",skill,prompt:q.q,hint:q.h,arPrompt:true,options:shuffle(q.o.slice(0,4)),answer:q.o[0],arabicOpts:true,...extra}}
function genStoryListen(u){const L=u.listening;return L.qs.map(q=>textMcq(L,q,"Listening",{listen:L}))}
function genThemeReading(u){const P=u.reading,passage={title:P.title,en:P.en,text:P.text};return P.qs.map(q=>textMcq(P,q,"Reading",{passage}))}
const WRITE_MIN={A:8,B:15,C:25,D:40,E:60};
function genWritingTask(u,lvl){const warm=u.sentences.length>=2?genSentences(u,2):[];return [...warm,{type:"write",skill:"Writing",task:u.writing,unit:u.id,min:WRITE_MIN[lvl]||15}]}
function wordCount(t){return String(t||"").trim().split(/\s+/).filter(Boolean).length}

/* ============================== SESSION RUNNER ============================== */
let R=null;
const PRAISE=["Correct! أحسنت","Great! ممتاز","Nice! رائع","Well done! برافو","Excellent! جميل"];
const ICON_X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function runSession(cfg){
 R={...cfg,i:0,score:0,log:[],start:Date.now(),timeLimit:cfg.timeLimit||0,hearts:cfg.hearts??null};
 S.tabBefore=cfg.back||S.tab; preloadFor(R.items.map(x=>x.say||x.sayAfter||(x.passage&&x.passage.text)||(x.pairs&&x.pairs[0]&&x.pairs[0][0]))); drawQ();
}
function heartsHtml(){return R.hearts==null?"":`<span class="hearts" id="hearts" aria-label="${R.hearts} hearts left">${ICON_HEART}${R.hearts}</span>`}
function drawQ(){
 const v=$("#view"); const it=R.items[R.i]; R.answered=false;R.sel=null;R.built=[];R.mm={a:null,e:null,done:0,mist:0};
 const pct=R.i/R.items.length*100;
 let body="";
 if(it.passage){body+=`<details class="card" ${R.lastPassage===it.passage?"":"open"} style="padding:14px 18px"><summary style="cursor:pointer;font-weight:600">Reading text: <span class="ar">${it.passage.title}</span></summary>
   <div class="row" style="margin-block:10px">${speakBtn(it.passage.text,"Listen to the text")}${speakBtn(it.passage.text,"Listen slowly",true)}</div>
   <div class="passage ar">${fmtText(it.passage.text)}</div></details>`;R.lastPassage=it.passage}
 if(it.listen){const first=R.lastListen!==it.listen;R.lastListen=it.listen;
  body+=`<div class="card listen-card stack"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="eyebrow">Listening</div>${it.listen.title?`<div class="ar" style="font-size:1.3rem;font-weight:700">${esc(it.listen.title)}</div>`:""}</div><span class="listen-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div>
   <div class="row" style="justify-content:center;gap:16px"><button class="big-speak" data-speak="${esc(it.listen.text)}" aria-label="Play the recording">${ICON_SPEAK}</button><button class="big-speak slow" data-speak="${esc(it.listen.text)}" data-slow="1" aria-label="Play slowly">${ICON_SLOW}</button></div>
   <div class="small muted" style="text-align:center">${first?"Listen to the whole text first, then answer. Play it again whenever you need to.":"Play it again if you need to."}</div>
   <details><summary class="small" style="cursor:pointer">Show the text</summary><div class="passage ar">${fmtText(it.listen.text)}</div></details></div>`}
 if(it.type==="write"){const w=it.task;
  body+=`<div class="stack"><div class="row" style="justify-content:space-between"><span class="eyebrow">Writing task${w.type?" · "+esc(w.type):""}</span><span class="pill">Aim for ${it.min}+ words</span></div>
   <div class="q-ar ar" style="text-align:right">${esc(w.ar)}</div>${w.en?`<div class="small muted">${esc(w.en)}</div>`:""}
   ${w.starters&&w.starters.length?`<div class="stack" style="gap:6px"><span class="small muted">Tap a phrase to add it to your writing:</span><div class="starters">${w.starters.map((x,k)=>`<button type="button" class="chip" data-st="${k}"><span class="ar">${esc(x)}</span></button>`).join("")}</div></div>`:""}
   <textarea id="wtext" class="ar wtext" dir="rtl" lang="ar" rows="7" placeholder="اكتب هنا…" aria-label="Your writing"></textarea>
   <div class="small muted" id="wcount">0 words</div>
   ${keyboard()}<div id="wmodel"></div></div>`;
 } else if(it.type==="intro"){
  body+=`<div class="card stack intro-card"><span class="pill acc">New word</span><div class="ar intro-ar">${it.ar}</div><div class="tr muted"><i>${esc(it.tr)}</i></div><div style="font-size:1.25rem;font-weight:600">${esc(it.en)}</div>
   <div class="row" style="justify-content:center">${speakBtn(it.say,"Listen")}${speakBtn(it.say,"Listen slowly",true)}</div></div>`;
 } else {
  body+=`<div class="stack">`;
  body+=`<div class="row" style="justify-content:space-between"><span class="eyebrow">${it.skill}</span>${it.say&&!it.ar?`<div class="row">${speakBtn(it.say,"Listen")}${speakBtn(it.say,"Listen slowly",true)}</div>`:""}</div>`;
  if(it.type==="match")body+=`<h2>Tap the matching pairs</h2>`;
  else body+= it.arPrompt?`<div class="q-ar ar" style="text-align:right">${esc(it.prompt)}</div>${it.hint?`<div class="small muted">${esc(it.hint)}</div>`:""}`:`<h2 class="q-prompt">${it.prompt}</h2>`;
  if(it.type==="mcq"&&it.autoSay&&!it.ar)body+=`<div class="row" style="justify-content:center;gap:16px;padding-block:6px"><button class="big-speak" data-speak="${esc(it.say)}" aria-label="Play again">${ICON_SPEAK}</button><button class="big-speak slow" data-speak="${esc(it.say)}" data-slow="1" aria-label="Play slowly">${ICON_SLOW}</button></div>`;
  if(it.ar)body+=`<div class="row" style="justify-content:center;gap:12px">${speakBtn(it.say,"Listen")}<div class="q-ar ar" style="font-size:clamp(2.2rem,8vw,3.4rem)">${it.ar}</div></div>`;
  if(it.type==="mcq"){
   body+=`<div class="opts">${it.options.map((o,k)=>`<button class="opt ${it.arabicOpts?"arabic":""}" data-o="${k}"><span class="k">${k+1}</span><span>${esc(o)}</span></button>`).join("")}</div>`;
  } else if(it.type==="build"){
   if(it.hint)body+=`<div class="small muted">Sounds like: <i>${esc(it.hint)}</i></div>`;
   body+=`<div class="answer-slot" id="slot"></div><div class="tiles" id="tiles">${it.tiles.map((t,k)=>`<button class="tile" data-t="${k}">${esc(t)}</button>`).join("")}</div>
    <div class="row"><button class="btn sm" id="undo">Undo</button><button class="btn sm" id="clear">Clear</button></div>`;
  } else if(it.type==="type"){
   body+=`<input type="text" id="typed" class="ar typed" dir="rtl" lang="ar" autocomplete="off" spellcheck="false" placeholder="اكتب هنا">${keyboard()}`;
  } else if(it.type==="match"){
   const L=shuffle(it.pairs.map((p,k)=>k)),E=shuffle(it.pairs.map((p,k)=>k));
   body+=`<div class="match"><div class="col">${L.map(k=>`<button class="mbtn ar" data-ma="${k}">${esc(it.pairs[k][0])}</button>`).join("")}</div><div class="col">${E.map(k=>`<button class="mbtn" data-me="${k}">${esc(it.pairs[k][1])}</button>`).join("")}</div></div>`;
  }
  body+=`</div>`;
 }
 const timer=R.timeLimit?`<span class="pill" id="timer"></span>`:"";
 const tu=R.unit&&UNITS[R.unit];applyTheme(tu||null);
 const strip=tu&&window.ART?`<div class="lesson-strip"><span class="ls-art">${artFor(tu)}</span><span class="small"><b>${esc(tu.en)}</b> <span class="ar">${tu.ar}</span></span></div>`:"";
 v.innerHTML=`<div class="stack lesson">${strip}
  <div class="lesson-top"><button class="icon-btn plain" id="quit" aria-label="Exit">${ICON_X}</button><div class="progress fat" aria-label="Progress"><span style="width:${pct}%"></span></div>${timer}${heartsHtml()}</div>
  <div class="small muted">${esc(R.title)}</div>${body}</div>`;
 $("#quit").onclick=()=>{clearInterval(R&&R.tick);R=null;go(S.tabBefore||"home")};
 if(R.timeLimit)startTimer();
 if(it.type==="intro"){setFooter("continue")}
 else if(it.type==="write"){setFooter("check");bindWrite(it)}
 else if(it.type==="match"){setFooter("check");bindMatch(it)}
 else {setFooter("check");
  if(it.type==="mcq")v.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{if(R.answered)return;R.sel=+b.dataset.o;v.querySelectorAll(".opt").forEach(x=>x.classList.toggle("sel",x===b));setReady(true)});
  if(it.type==="build")bindBuild(it);
  if(it.type==="type")bindType(it);}
 if(it.autoSay)setTimeout(()=>speak(it.say),250);
}
function setFooter(mode,ok,msg){
 const f=$("#fbar");f.hidden=false;document.body.classList.add("in-lesson");
 if(mode==="result"){f.className="fbar "+(ok?"ok":"no");
  f.innerHTML=`<div class="wrap fb-in"><div class="stack" style="gap:2px;min-width:0"><div class="fb-msg">${ok?PRAISE[Math.floor(Math.random()*PRAISE.length)]:"Correct answer:"}</div>${msg?`<div class="fb-detail">${msg}</div>`:""}</div><button class="btn big ${ok?"go":"bad"}" id="fbtn">Continue</button></div>`;
  $("#fbtn").onclick=nextQ;setTimeout(()=>$("#fbtn")&&$("#fbtn").focus(),30);return}
 f.className="fbar";
 f.innerHTML=`<div class="wrap fb-in" style="justify-content:flex-end"><button class="btn big go" id="fbtn" ${mode==="continue"?"":"disabled"}>${mode==="continue"?"Continue":"Check"}</button></div>`;
 $("#fbtn").onclick=mode==="continue"?nextQ:checkCurrent;
}
function setReady(on){const b=$("#fbtn");if(b&&!R.answered)b.disabled=!on}
function hideFooter(){const f=$("#fbar");if(f){f.hidden=true;f.innerHTML=""}document.body.classList.remove("in-lesson")}
document.addEventListener("keydown",e=>{if(!R||e.key!=="Enter"||e.target.tagName==="BUTTON"||e.target.tagName==="TEXTAREA")return;const b=$("#fbtn");if(b&&!b.disabled){e.preventDefault();b.click()}});
function startTimer(){clearInterval(R.tick);const upd=()=>{if(!R)return;const left=Math.max(0,R.timeLimit-Math.floor((Date.now()-R.start)/1000));const t=$("#timer");if(t)t.textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`;if(left<=0){clearInterval(R.tick);toast("Time is up");finish()}};upd();R.tick=setInterval(upd,1000)}
function record(ok,it,given){R.log.push({skill:it.skill,ok,given,answer:it.answer||it.target||"",meaning:it.meaning||""});if(ok)R.score++;if(it.word){S.stats.seen[it.word]=1}
 if(!ok&&R.hearts!=null){R.hearts=Math.max(0,R.hearts-1);const h=$("#hearts");if(h){h.outerHTML=heartsHtml();const n=$("#hearts");n.classList.add("hit")}}}
function checkCurrent(){
 if(R.answered)return;const it=R.items[R.i];let given="",ok=false;
 if(it.type==="write")return checkWrite(it);
 if(it.type==="mcq"){if(R.sel==null)return;given=it.options[R.sel];ok=given===it.answer;
  document.querySelectorAll(".opt").forEach((b,j)=>{b.disabled=true;b.classList.remove("sel");if(it.options[j]===it.answer)b.classList.add("right");else if(j===R.sel)b.classList.add("wrong")})}
 else if(it.type==="build"){if(R.built.length<it.tiles.length)return;given=R.built.map(k=>it.tiles[k]).join(it.joiner);ok=norm(given)===norm(it.target);
  document.querySelectorAll("#tiles .tile,#undo,#clear").forEach(b=>b.disabled=true)}
 else if(it.type==="type"){const inp=$("#typed");given=inp.value.trim();if(!given)return;ok=norm(given)===norm(it.answer);inp.disabled=true;document.querySelectorAll(".kbd button").forEach(b=>b.disabled=true)}
 R.answered=true;record(ok,it,given);
 const ans=it.answer||it.target;
 const mean=it.meaning&&it.type!=="mcq"||it.meaning&&it.arabicOpts?`<span class="muted"> · ${esc(it.meaning)}</span>`:"";
 const isAr=it.type!=="mcq"||it.arabicOpts;const ansHtml=isAr?`<span class="ar" style="font-size:1.35rem">${esc(ans)}</span>${mean}`:`<b>${esc(ans)}</b>`;
 setFooter("result",ok,ok?(isAr?ansHtml:""):ansHtml);
 if(ok&&(it.say||it.sayAfter))speak(it.sayAfter||it.say);
}
function nextQ(){if(R.hearts===0)return outOfHearts();if(R.i<R.items.length-1){R.i++;drawQ();window.scrollTo({top:0})}else finish()}
function bindMatch(it){
 const v=$("#view");
 const tryPair=()=>{const m=R.mm;if(m.a==null||m.e==null)return;const A=v.querySelector(`[data-ma="${m.a}"]`),E=v.querySelector(`[data-me="${m.e}"]`);
  if(m.a===m.e){[A,E].forEach(b=>{b.classList.remove("sel");b.classList.add("ok");b.disabled=true});speak(it.pairs[m.a][0]);m.done++;
   if(m.done===it.pairs.length){const ok=m.mist<=1;R.answered=true;record(ok,{...it,answer:""},"");setFooter("result",ok,ok?(m.mist?"One slip, still matched.":"All pairs matched."):`Matched with ${m.mist} mistakes. <span class="muted">Review these words on the Words tab.</span>`);if(!ok)$("#fbar .fb-msg").textContent="Keep practising"}}
  else{m.mist++;[A,E].forEach(b=>{b.classList.remove("sel");b.classList.add("bad")});setTimeout(()=>[A,E].forEach(b=>b.classList.remove("bad")),500)}
  m.a=m.e=null};
 v.querySelectorAll("[data-ma]").forEach(b=>b.onclick=()=>{if(b.disabled)return;v.querySelectorAll("[data-ma]").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");R.mm.a=+b.dataset.ma;speak(it.pairs[+b.dataset.ma][0]);tryPair()});
 v.querySelectorAll("[data-me]").forEach(b=>b.onclick=()=>{if(b.disabled)return;v.querySelectorAll("[data-me]").forEach(x=>x.classList.remove("sel"));b.classList.add("sel");R.mm.e=+b.dataset.me;tryPair()});
}
function bindBuild(it){
 const slot=$("#slot");
 const draw=()=>{slot.innerHTML=R.built.length?(it.joiner===""?`<span class="joined">${esc(R.built.map(k=>it.tiles[k]).join(""))}</span>`:R.built.map(k=>`<span class="tile in" style="box-shadow:none">${esc(it.tiles[k])}</span>`).join("")):`<span class="small muted" style="font-family:var(--f-ui);direction:ltr">Tap the ${it.joiner===""?"letters":"words"} in order (right to left)</span>`;
  document.querySelectorAll("#tiles .tile").forEach(b=>b.disabled=R.answered||R.built.includes(+b.dataset.t));setReady(R.built.length===it.tiles.length)};
 document.querySelectorAll("#tiles .tile").forEach(b=>b.onclick=()=>{if(R.answered)return;R.built.push(+b.dataset.t);draw()});
 $("#undo").onclick=()=>{if(!R.answered){R.built.pop();draw()}};$("#clear").onclick=()=>{if(!R.answered){R.built=[];draw()}};
 draw();
}
function keyboard(){const rows=["ض ص ث ق ف غ ع ه خ ح ج د","ش س ي ب ل ا ت ن م ك ط ذ","ئ ء ؤ ر ى ة و ز ظ أ إ آ"];
 return `<div class="kbd" aria-label="Arabic keyboard">${rows.map(r=>`<div class="krow">${r.split(" ").map(c=>`<button type="button" data-k="${c}">${c}</button>`).join("")}</div>`).join("")}
  <div class="krow"><button type="button" class="wide" data-k="⌫">Delete</button><button type="button" class="wide" data-k=" ">Space</button></div></div>`}
function bindType(it){const inp=$("#typed");
 const upd=()=>setReady(!!inp.value.trim());inp.oninput=upd;
 document.querySelectorAll(".kbd [data-k]").forEach(b=>b.onclick=()=>{if(R.answered)return;const k=b.dataset.k;inp.value=k==="⌫"?Array.from(inp.value).slice(0,-1).join(""):inp.value+k;upd()});
}
function bindWrite(it){const ta=$("#wtext"),key="ml-draft-"+(it.unit||"");
 try{const d=localStorage.getItem(key);if(d)ta.value=d}catch(e){}
 const upd=()=>{const n=wordCount(ta.value);$("#wcount").textContent=`${n} ${n===1?"word":"words"}${n<it.min?` · aim for ${it.min}+`:" · great length"}`;setReady(n>=3);try{localStorage.setItem(key,ta.value)}catch(e){}};
 const insert=t=>{if(R.answered)return;const a=ta.selectionStart??ta.value.length,b=ta.selectionEnd??a;const pre=ta.value.slice(0,a),post=ta.value.slice(b);
  const add=(pre&&!/\s$/.test(pre)&&t!==" "&&t!=="⌫"?" ":"")+t;ta.value=pre+add+post;const c=(pre+add).length;ta.focus();ta.setSelectionRange(c,c);upd()};
 ta.oninput=upd;
 document.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>insert(it.task.starters[+b.dataset.st].replace(/\s*(\.\.\.|…)\s*$/,"").replace(/^\s*(\.\.\.|…)\s*/,"")+" "));
 document.querySelectorAll(".kbd [data-k]").forEach(b=>b.onclick=()=>{if(R.answered)return;const k=b.dataset.k;
  if(k==="⌫"){const a=ta.selectionStart,e=ta.selectionEnd;if(a!==e){ta.value=ta.value.slice(0,a)+ta.value.slice(e);ta.setSelectionRange(a,a)}else if(a>0){const arr=Array.from(ta.value.slice(0,a));arr.pop();const pre=arr.join("");ta.value=pre+ta.value.slice(a);ta.setSelectionRange(pre.length,pre.length)}upd()}
  else{const a=ta.selectionStart??ta.value.length;ta.value=ta.value.slice(0,a)+k+ta.value.slice(ta.selectionEnd??a);ta.setSelectionRange(a+k.length,a+k.length);upd()}});
 upd();
}
function checkWrite(it){const ta=$("#wtext"),text=ta.value.trim(),n=wordCount(text);if(n<3)return;
 R.answered=true;ta.disabled=true;document.querySelectorAll(".kbd button,[data-st]").forEach(b=>b.disabled=true);
 const ok=n>=it.min;R.writing=text;record(ok,{...it,answer:""},text);
 try{localStorage.removeItem("ml-draft-"+(it.unit||""))}catch(e){}
 const w=it.task;
 $("#wmodel").innerHTML=`<div class="card stack" style="background:var(--accent-soft);border-color:transparent">
   <h3>Check your writing</h3>
   <ul class="checklist small"><li>Did you answer every part of the task?</li><li>Did you use words from this theme?</li><li>Did you join ideas with و، لكن، لأن، ثم؟</li><li>Read it once more for spelling, ة and ال.</li></ul>
   ${w.model?`<details open><summary style="cursor:pointer;font-weight:600">A model answer to compare with</summary><div class="row" style="margin-block:8px">${speakBtn(w.model,"Listen to the model answer")}</div><div class="passage ar">${fmtText(w.model)}</div></details>`:""}</div>`;
 setFooter("result",ok,ok?"Your writing is saved"+(CODE?" and your teacher can read it.":"."):`You wrote ${n} words. Next time aim for ${it.min} or more.`);
 const m=$("#fbar .fb-msg");if(m)m.textContent=ok?"Well done! أحسنت":"Handed in. Keep building it up";
 setTimeout(()=>$("#wmodel")&&$("#wmodel").scrollIntoView({block:"start",behavior:"smooth"}),150);
}
function cfgAgain(){return {title:R.title,items:R.regen?R.regen():R.items,back:R.back,regen:R.regen,timeLimit:R.timeLimit,hw:R.hw,node:R.node,hearts:R.node?3:undefined,kind:R.kind,unit:R.unit}}
function outOfHearts(){
 hideFooter();clearInterval(R.tick);const xp=R.score*5;if(xp)addXp(xp);sendResult({ended:"out of hearts"});const again=cfgAgain();if(R.unit)S.stats.lastTheme=R.unit;
 $("#view").innerHTML=`<div class="stack lesson" style="text-align:center;align-items:center;padding-top:24px">
  <div class="hearts big-hearts">${ICON_HEART}0</div><h2>Out of hearts</h2>
  <p class="muted" style="max-width:46ch">You made three mistakes in this lesson. Look at the words again, then have another go. You still earned ${xp} points.</p>
  <div class="row" style="justify-content:center"><button class="btn big go" id="again">Try again</button><button class="btn" id="back">Back to path</button></div></div>`;
 $("#again").onclick=()=>runSession(again);$("#back").onclick=()=>{R=null;go(again.back||"home")};renderNav();
}
function finish(){
 hideFooter();clearInterval(R.tick);const total=R.log.length||1,score=R.score,pct=Math.round(score/total*100);
 const perfect=score===total;const xp=score*10+(perfect&&R.node?10:0);addXp(xp);S.stats.sessions++;
 if(R.node){S.stats.nodes[R.node]=Math.max(S.stats.nodes[R.node]||0,pct)}saveStats();
 const skills={};R.log.forEach(l=>{skills[l.skill]=skills[l.skill]||{ok:0,n:0};skills[l.skill].n++;if(l.ok)skills[l.skill].ok++});
 let codeHtml="";
 if(R.hw){S.done[R.hw.id]={score,total,at:Date.now()};persist();
  codeHtml=`<div class="card stack"><h3>Homework handed in</h3><p class="small muted" id="hwsent">Sending your score to your teacher…</p></div>`}
 sendResult(R.writing?{writing:R.writing.slice(0,4000),unit:R.unit||""}:{},R.hw?(ok=>{const el=$("#hwsent");if(el)el.innerHTML=ok?`<span class="pill good">Sent</span> Your teacher can see your score.`:`<span class="pill red">Not sent yet</span> Check your internet, then press <b>Practise again</b> or try later.`}):null);
 const head=pct>=90?["ممتاز!","Excellent work."]:pct>=70?["أحسنت!","Well done."]:pct>=50?["جيد","Good effort. Keep practising."]:["حاول مرة أخرى","Try again to improve."];
 const missed=R.log.filter(l=>!l.ok&&l.answer);const st=streak();
 const again=cfgAgain();
 $("#view").innerHTML=`<div class="stack lesson">
  <div class="card stack done-card">
   <div class="hero-ar">${head[0]}</div><h2>${R.node?"Lesson complete":esc(R.title)}</h2><p class="muted">${head[1]}</p>
   <div class="trio" style="width:100%">
    <div class="stat tile-stat xp"><span class="small">Points</span><b>+${xp}</b></div>
    <div class="stat tile-stat acc"><span class="small">Accuracy</span><b>${pct}%</b></div>
    <div class="stat tile-stat fl"><span class="small">Streak</span><b>${st} ${st===1?"day":"days"}</b></div>
   </div>
  </div>
  ${Object.keys(skills).length>1?`<div class="card stack"><h3>By skill</h3>${Object.entries(skills).map(([k,s])=>`<div class="skillbar"><span>${k}</span><div class="progress"><span style="width:${s.ok/s.n*100}%"></span></div><span class="small" style="font-variant-numeric:tabular-nums">${s.ok}/${s.n}</span></div>`).join("")}</div>`:""}
  ${codeHtml}
  ${missed.length?`<div class="card stack"><h3>Review these</h3>${missed.map(l=>`<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:8px"><span><span class="ar" style="font-size:1.3rem">${esc(l.answer)}</span>${l.meaning?` <span class="small muted">${esc(l.meaning)}</span>`:""}</span>${l.given?`<span class="small muted">You answered: <span class="ar">${esc(l.given)}</span></span>`:""}</div>`).join("")}</div>`:""}
  <div class="row"><button class="btn big go" id="cont">${R.node?"Continue":"Done"}</button><button class="btn" id="again">Practise again</button></div></div>`;
 $("#again").onclick=()=>runSession(again);$("#cont").onclick=()=>{R=null;go(again.back||"home")};
 renderNav();
}

/* ============================== WRITING ============================== */
function vWriting(v){
 const lvl=profileLevel(),rec=LEVELS[lvl].write;
 if(!S.writeMode)S.writeMode=rec[0];
 const modes=[["letters","Letters","Trace each letter and its forms"],["words","Word builder","Spell words from letter tiles"],["sentences","Sentence builder","Put words in order"],["dictation","Dictation","Listen and type"]];
 v.innerHTML=`<div class="stack">
  <div class="stack" style="gap:4px"><div class="eyebrow">Writing</div><h2>Letters, words and sentences</h2><p class="muted">Recommended for ${LEVELS[lvl].name} (${LEVELS[lvl].years}): ${rec.map(r=>modes.find(m=>m[0]===r)[1]).join(" and ")}.</p></div>
  <div class="seg" role="group">${modes.map(m=>`<button data-wm="${m[0]}" aria-pressed="${S.writeMode===m[0]}">${m[1]}${rec.includes(m[0])?" ★":""}</button>`).join("")}</div>
  <div id="wbody"></div></div>`;
 v.querySelectorAll("[data-wm]").forEach(b=>b.onclick=()=>{S.writeMode=b.dataset.wm;vWriting(v)});
 const wb=$("#wbody");
 if(S.writeMode==="letters")return lettersView(wb);
 const P=unitPicker("vocabYear","writeUnit",()=>vWriting(v));const u=P.unit;
 const m=modes.find(x=>x[0]===S.writeMode);
 wb.innerHTML=`<div class="stack">${P.html}<div class="card row" style="justify-content:space-between"><div><h3>${m[1]}: ${esc(u.en)}</h3><p class="small muted">${m[2]}. Uses words and sentences from ${esc(u.en)} (${u.yearLabel}).</p></div><button class="btn primary" id="go">Start</button></div></div>`;
 P.bind(wb);
 $("#go").onclick=()=>{const gen=S.writeMode==="words"?()=>genWords(u,8):S.writeMode==="sentences"?()=>genSentences(u,4):()=>genDictation(u,8,lvl);
  runSession({title:`${m[1]} · ${u.en}`,items:gen(),regen:gen,back:"writing",kind:"writing",unit:u.id})};
}
let LET={i:1,form:0};
function letterForms(l,joins){const Z="‍";return joins?[l,l+Z,Z+l+Z,Z+l]:[l,l,Z+l,Z+l]}
function lettersView(wb){
 loadGroup("letters");const L=LETTERS[LET.i],forms=letterForms(L[0],L[4]),fnames=["Alone","Start","Middle","End"];
 wb.innerHTML=`<div class="grid2">
  <div class="card stack"><h3>Choose a letter</h3><div class="letters">${LETTERS.map((l,k)=>`<button data-li="${k}" aria-pressed="${k===LET.i}" title="${l[1]}">${l[0]}${S.stats.letters[l[0]]?'<span style="display:block;font-size:.6rem;color:var(--gold)">●</span>':""}</button>`).join("")}</div>
   <p class="small muted">A dot means you have traced that letter. Letters ا د ذ ر ز و never join to the letter after them.</p></div>
  <div class="card stack">
   <div class="row" style="justify-content:space-between"><div><h3>${L[1]} <span class="ar" style="font-size:1.4rem">${L[0]}</span></h3><div class="small muted">Example: <span class="ar" style="font-size:1.2rem">${L[2]}</span> (${L[3]})</div></div>
    <div class="row">${speakBtn(LETTER_NAMES[LET.i],"Hear the letter name")}${speakBtn(L[2],"Hear the example word")}</div></div>
   <div class="forms">${forms.map((f,k)=>`<button data-fi="${k}" aria-pressed="${k===LET.form}"><span class="ar">${f}</span><span>${fnames[k]}</span></button>`).join("")}</div>
   <div class="pad" id="pad"><canvas id="guide"></canvas><canvas id="ink"></canvas></div>
   <div class="row"><button class="btn" id="clr">Clear</button><button class="btn" id="hide">Hide guide</button><button class="btn primary" id="chk">Check my letter</button></div>
   <div id="lres" class="row"></div>
  </div></div>`;
 wb.querySelectorAll("[data-li]").forEach(b=>b.onclick=()=>{LET.i=+b.dataset.li;LET.form=0;lettersView(wb)});
 wb.querySelectorAll("[data-fi]").forEach(b=>b.onclick=()=>{LET.form=+b.dataset.fi;lettersView(wb)});
 setupPad(forms[LET.form],L[0]);
}
async function setupPad(glyph,letter){
 const pad=$("#pad"),g=$("#guide"),ink=$("#ink");const dpr=Math.min(2,window.devicePixelRatio||1);
 const size=pad.clientWidth||300;[g,ink].forEach(c=>{c.width=size*dpr;c.height=size*dpr});
 const gc=g.getContext("2d"),ic=ink.getContext("2d");gc.scale(dpr,dpr);ic.scale(dpr,dpr);
 const font=`700 ${Math.round(size*0.5)}px "Noto Naskh Arabic"`;
 try{await document.fonts.load(font,glyph)}catch(e){}
 const cs=getComputedStyle(document.documentElement);
 let showGuide=true;
 const drawGuide=()=>{gc.clearRect(0,0,size,size);if(!showGuide)return;gc.font=font;gc.textAlign="center";gc.direction="rtl";gc.fillStyle=cs.getPropertyValue("--accent-soft").trim()||"#d3f0f3";gc.strokeStyle=cs.getPropertyValue("--accent").trim()||"#0a9fb1";gc.lineWidth=1.5;gc.setLineDash([5,5]);gc.fillText(glyph,size/2,size*0.66);gc.strokeText(glyph,size/2,size*0.66);gc.setLineDash([])};
 drawGuide();
 ic.lineCap="round";ic.lineJoin="round";ic.lineWidth=size*0.055;ic.strokeStyle=cs.getPropertyValue("--ink").trim()||"#0f2a33";
 let drawing=false,last=null,any=false;
 const pos=e=>{const r=ink.getBoundingClientRect();return[(e.clientX-r.left)*size/r.width,(e.clientY-r.top)*size/r.height]};
 ink.onpointerdown=e=>{drawing=true;any=true;last=pos(e);ink.setPointerCapture(e.pointerId);ic.beginPath();ic.arc(last[0],last[1],ic.lineWidth/2,0,7);ic.fillStyle=ic.strokeStyle;ic.fill()};
 ink.onpointermove=e=>{if(!drawing)return;const p=pos(e);ic.beginPath();ic.moveTo(last[0],last[1]);ic.lineTo(p[0],p[1]);ic.stroke();last=p};
 ink.onpointerup=ink.onpointercancel=()=>{drawing=false};
 $("#clr").onclick=()=>{ic.clearRect(0,0,size,size);any=false;$("#lres").innerHTML=""};
 $("#hide").onclick=e=>{showGuide=!showGuide;e.target.textContent=showGuide?"Hide guide":"Show guide";drawGuide()};
 $("#chk").onclick=()=>{
  if(!any){toast("Trace the letter first");return}
  const N=120,off=document.createElement("canvas");off.width=off.height=N;const o=off.getContext("2d");
  o.font=`700 ${Math.round(N*0.5)}px "Noto Naskh Arabic"`;o.textAlign="center";o.direction="rtl";o.fillStyle="#000";o.fillText(glyph,N/2,N*0.66);
  const mask=o.getImageData(0,0,N,N).data;o.clearRect(0,0,N,N);o.lineWidth=N*0.07;o.strokeStyle="#000";o.fillText(glyph,N/2,N*0.66);o.strokeText(glyph,N/2,N*0.66);
  const wide=o.getImageData(0,0,N,N).data;o.clearRect(0,0,N,N);o.drawImage(ink,0,0,N,N);const inkd=o.getImageData(0,0,N,N).data;
  let L=0,cov=0,I=0,stray=0;for(let p=3;p<mask.length;p+=4){const m=mask[p]>100,w=wide[p]>40,k=inkd[p]>60;if(m){L++;if(k)cov++}if(k){I++;if(!w)stray++}}
  const c=L?cov/L:0,s=I?stray/I:1;const stars=c>=0.65&&s<=0.25?3:c>=0.45&&s<=0.4?2:c>=0.25&&s<=0.6?1:0;
  const tips=stars===3?"ممتاز! That letter looks great.":stars===2?"Good. Try to follow the shape more closely.":stars===1?"Nearly. Go slowly and stay inside the shape.":"Try again. Trace over the dotted shape.";
  $("#lres").innerHTML=`<span class="stars" aria-label="${stars} of 3 stars">${[0,1,2].map(k=>k<stars?"★":'<span class="off">★</span>').join("")}</span><span>${tips}</span>`;
  if(stars>=2){S.stats.letters[letter]=1;addXp(5);renderNav()}
 };
}

/* ============================== READING ============================== */
function vReading(v){
 if(!S.readMode)S.readMode="themes";
 const head=`<div class="stack" style="gap:4px"><div class="eyebrow">Reading & listening</div><h2>Texts from your themes</h2><p class="muted">Read or listen to each theme's text, then answer the questions. IBT-style passages are in the second tab.</p></div>
  <div class="seg" role="group"><button data-rm="themes" aria-pressed="${S.readMode==="themes"}">Theme texts</button><button data-rm="ibt" aria-pressed="${S.readMode==="ibt"}">IBT passages</button></div>`;
 if(S.readMode==="themes"){
  const yid=S.readYear||profileYear();const yr=CURRICULUM.find(y=>y.id===yid)||CURRICULUM[0];S.readYear=yr.id;
  const list=yr.units.filter(u=>u.reading||u.listening);
  v.innerHTML=`<div class="stack">${head}
   <div class="seg" role="group" aria-label="Year">${CURRICULUM.map(y=>`<button data-ry="${y.id}" aria-pressed="${y.id===yr.id}">${y.label}</button>`).join("")}</div>
   ${list.length?`<div class="text-grid">${list.map(u=>`<div class="text-card" style="--t:${ART.theme(u.art).ui}"><span class="tx-art">${artFor(u)}</span>
     <div class="stack" style="gap:8px;padding:14px 16px"><div><div class="eyebrow">${esc(u.en)}</div><div class="ar" style="font-size:1.15rem;font-weight:700">${u.ar}</div></div>
     <div class="row">${u.reading?`<button class="btn sm primary" data-rt="${u.id}|reading">${NODE_ICONS.read} Read · ${u.reading.qs.length} questions</button>`:""}${u.listening?`<button class="btn sm" data-rt="${u.id}|listening">${NODE_ICONS.phones} Listen · ${u.listening.qs.length} questions</button>`:""}</div></div></div>`).join("")}</div>`
   :`<div class="card muted">No theme texts for ${esc(yr.label)} yet. Try the IBT passages.</div>`}</div>`;
  v.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{S.readMode=b.dataset.rm;vReading(v)});
  v.querySelectorAll("[data-ry]").forEach(b=>b.onclick=()=>{S.readYear=b.dataset.ry;vReading(v)});
  v.querySelectorAll("[data-rt]").forEach(b=>b.onclick=()=>{const [id,k]=b.dataset.rt.split("|");const u=UNITS[id];const gen=()=>k==="reading"?genThemeReading(u):genStoryListen(u);
   runSession({title:`${k==="reading"?"Reading":"Listening"} · ${u.en}`,items:gen(),regen:gen,back:"reading",kind:k==="reading"?"reading":"listening",unit:u.id})});
  return}
 if(!S.readLevel)S.readLevel=profileLevel();const P=PASSAGES[S.readLevel];loadGroup("passages");
 v.innerHTML=`<div class="stack">${head}
  <div class="seg" role="group">${Object.keys(LEVELS).map(k=>`<button data-rl="${k}" aria-pressed="${k===S.readLevel}">${LEVELS[k].name}</button>`).join("")}</div>
  <div class="card stack">
   <div class="row" style="justify-content:space-between"><div><h3 class="ar" style="font-size:1.6rem">${P.title}</h3><div class="small muted">${esc(P.en)} · ${LEVELS[S.readLevel].desc} · ${LEVELS[S.readLevel].years}</div></div>
    <div class="row">${speakBtn(P.text,"Listen to the text")}${speakBtn(P.text,"Listen slowly",true)}</div></div>
   <div class="passage ar" style="max-height:none">${P.text}</div>
   <button class="btn primary" id="rq" style="align-self:flex-start">Answer ${P.qs.length} questions</button>
  </div></div>`;
 v.querySelectorAll("[data-rm]").forEach(b=>b.onclick=()=>{S.readMode=b.dataset.rm;vReading(v)});
 v.querySelectorAll("[data-rl]").forEach(b=>b.onclick=()=>{S.readLevel=b.dataset.rl;vReading(v)});
 $("#rq").onclick=()=>{const gen=()=>genReading(S.readLevel);runSession({title:"Reading · "+P.en,items:gen(),regen:gen,back:"reading",kind:"reading"})};
}

/* ============================== IBT ============================== */
function vIbt(v){
 if(!S.ibtLevel)S.ibtLevel=profileLevel();
 v.innerHTML=`<div class="stack">
  <div class="stack" style="gap:4px"><div class="eyebrow">IBT Arabic B</div><h2>IBT practice tests</h2>
   <p class="muted" style="max-width:68ch">The IBT Arabic tests for non-native speakers are multiple choice. They check reading, grammar, spelling and vocabulary, with students placed by how many years they have studied Arabic. These practice tests follow the same pattern.</p></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">${Object.entries(LEVELS).map(([k,L])=>`<button class="card" data-il="${k}" style="text-align:start;${k===S.ibtLevel?"border:2px solid var(--accent)":""}"><div class="eyebrow">${L.name}</div><div style="font-weight:600">${L.desc}</div><div class="small muted">${L.years}</div>${k===profileLevel()?'<span class="pill acc" style="margin-top:8px">Your level</span>':""}</button>`).join("")}</div>
  <div class="card stack">
   <h3>${LEVELS[S.ibtLevel].name} test</h3>
   <div class="row small muted"><span class="pill">Reading</span><span class="pill">Grammar</span><span class="pill">Spelling</span><span class="pill">Vocabulary</span></div>
   <div class="row">
    <button class="btn" id="t1">Quick practice · 8 questions</button>
    <button class="btn primary" id="t2">Full practice · 15 questions, 20 min</button>
   </div>
   <p class="small muted">Tip: in the real test, read the whole text first, then go back to it for each question.</p>
  </div></div>`;
 v.querySelectorAll("[data-il]").forEach(b=>b.onclick=()=>{S.ibtLevel=b.dataset.il;vIbt(v)});
 const lv=S.ibtLevel;
 $("#t1").onclick=()=>{const gen=()=>genIbt(lv,8);runSession({title:`IBT ${LEVELS[lv].name} · Quick`,items:gen(),regen:gen,back:"ibt",kind:"ibt"})};
 $("#t2").onclick=()=>{const gen=()=>genIbt(lv,15);runSession({title:`IBT ${LEVELS[lv].name} · Full`,items:gen(),regen:gen,back:"ibt",timeLimit:1200,kind:"ibt"})};
}

/* ============================== HOMEWORK ============================== */
function hwItems(a){const u=UNITS[a.unit];const n=Math.max(1,Math.min(30,+a.count||8));const lv=a.level||profileLevel();
 switch(a.activity){case"vocab":return genVocab(u,n);case"listen":return genListen(u,n);case"words":return genWords(u,n);case"sentence":return genSentences(u,Math.min(n,6));case"dictation":return genDictation(u,n,lv);case"reading":return genReading(lv);case"storyListening":return u&&u.listening?genStoryListen(u):genListen(u,n);case"themeReading":return u&&u.reading?genThemeReading(u):genReading(lv);case"writingTask":return u&&u.writing?genWritingTask(u,lv):genSentences(u,Math.min(n,6));default:return genIbt(lv,n)}}
function startHomework(id){const a=S.hw.assignments.find(x=>x.id===id);if(!a)return;
 if(ACTIVITIES[a.activity]?.needsUnit&&!UNITS[a.unit]){toast("This homework's topic is missing. Ask your teacher.");return}
 S.tabBefore="homework";const gen=()=>hwItems(a);
 runSession({title:a.title,items:gen(),regen:gen,back:"homework",hw:a,kind:"homework",unit:a.unit||"",timeLimit:a.activity==="ibt"?Math.round((+a.count||12)*80):0});S.tab="homework";renderNav()}
function vHomework(v){
 const list=S.hw.assignments.slice().sort((a,b)=>(a.due||"9").localeCompare(b.due||"9"));
 const mine=list.filter(forMe),others=list.filter(a=>!forMe(a));
 const card=a=>{const d=S.done[a.id];const u=UNITS[a.unit];const dl=a.due?daysUntil(a.due):null;
  const status=d?`<span class="pill good">Done · ${d.score}/${d.total}</span>`:dl!==null&&dl<0?`<span class="pill red">Overdue</span>`:dl!==null&&dl<=2?`<span class="pill red">Due ${dl===0?"today":dl===1?"tomorrow":"in 2 days"}</span>`:"";
  return `<div class="card hw"><div class="stack" style="gap:6px;min-width:0">
   <div class="meta"><h3>${esc(a.title)}</h3>${status}</div>
   <div class="meta small muted"><span>${ACTIVITIES[a.activity]?.en||a.activity}${u?" · "+esc(u.en):""}${a.activity==="ibt"||a.activity==="reading"?" · "+(LEVELS[a.level]?.name||""):""}</span>${a.due?`<span>Due ${fmtDate(a.due)}</span>`:""}</div>
   ${a.note?`<p class="small">${esc(a.note)}</p>`:""}
  </div><button class="btn ${d?"":"primary"}" data-starthw="${esc(a.id)}">${d?"Do again":"Start"}</button></div>`};
 v.innerHTML=`<div class="stack">
  <div class="stack" style="gap:4px"><div class="eyebrow">Homework</div><h2>Your assignments</h2><p class="muted" style="max-width:68ch">When you finish, your score goes straight to your teacher.</p></div>
  ${!S.hwLoaded?`<div class="card muted">Loading homework…</div>`:list.length?`${mine.length?`<div class="stack">${mine.map(card).join("")}</div>`:`<div class="card muted">No homework for your class right now.</div>`}
`
   :`<div class="card stack"><h3>No homework set yet</h3><p class="muted">Your teacher will add homework here. Meanwhile, practise vocabulary or try an IBT practice test.</p></div>`}
 </div>`;
 bindCommon(v);
}

/* ============================== RESULTS → TEACHER ============================== */
function sendResult(extra,cb){
 if(!R||!CODE)return;
 const total=Math.max(1,R.log.length),score=Math.min(R.score,total);
 const skills={};R.log.forEach(l=>{const k=l.skill||"Other";skills[k]=skills[k]||{ok:0,n:0};skills[k].n++;if(l.ok)skills[k].ok++});
 const missed=R.log.filter(l=>!l.ok&&l.answer).slice(0,10).map(l=>({answer:String(l.answer).slice(0,120),given:String(l.given||"").slice(0,120),meaning:String(l.meaning||"").slice(0,80)}));
 const a={code:CODE,name:S.profile.name,kind:R.kind||"practice",title:String(R.title||"").slice(0,120),unit:R.unit||"",hwId:R.hw?R.hw.id:"",
  score,total,pct:Math.round(score/total*100),skills,missed,secs:Math.round((Date.now()-R.start)/1000),level:profileLevel(),...extra};
 if(!R.log.length&&!extra.ended){cb&&cb(true);return}
 const attempt=(n)=>B.db.addAttempt(CLASS_ID,a).then(()=>cb&&cb(true)).catch(async e=>{console.warn(e);if(e&&e.code==="permission-denied")await recheckClass();if(n<2)setTimeout(()=>attempt(n+1),4000);else cb&&cb(false)});
 attempt(0);flush();
}

/* ============================== RESOURCES ============================== */
function safeUrl(u){u=String(u||"").trim();return /^https?:\/\//i.test(u)?u:""}
function vResources(v){
 const mine=S.resources.filter(r=>!r.year||r.year==="all"||r.year===S.profile.year);
 const yl=id=>(CURRICULUM.find(y=>y.id===id)||{}).label||"All years";
 v.innerHTML=`<div class="stack">
  <div class="stack" style="gap:4px"><div class="eyebrow">Resources</div><h2>Past papers and resources</h2><p class="muted" style="max-width:68ch">Practice papers, mark schemes and links your teachers have shared for your year.</p></div>
  ${!S.resLoaded?`<div class="card muted">Loading…</div>`:mine.length?`<div class="stack">${mine.map(r=>{const url=safeUrl(r.url);return `<div class="card hw"><div class="stack" style="gap:6px;min-width:0">
    <div class="meta"><h3>${esc(r.title)}</h3>${r.kind?`<span class="pill acc">${esc(r.kind)}</span>`:""}<span class="pill">${esc(r.year&&r.year!=="all"?yl(r.year):"All years")}</span></div>
    ${r.note?`<p class="small">${esc(r.note)}</p>`:""}</div>
    ${url?`<a class="btn primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open</a>`:""}</div>`}).join("")}</div>`
   :`<div class="card muted">No resources for your year yet.</div>`}
 </div>`;
}

/* ============================== BOOT ============================== */
async function loadHomework(){try{S.hw={assignments:await B.db.listHomework(CLASS_ID),updated:""}}catch(e){console.warn(e);S.hw={assignments:[],updated:""}}S.hwLoaded=true;if(!R)render();else renderNav()}
async function loadResources(){try{S.resources=await B.db.listResources()}catch(e){S.resources=[]}S.resLoaded=true;if(!R&&S.tab==="resources")render()}
function header(){
 const a=$("#acct");if(!a)return;
 a.innerHTML=`<span class="pill" title="${esc(S.profile.cls)}">${esc(S.profile.name)}</span><button class="btn sm" id="signout">Sign out</button>`;
 $("#signout").onclick=async()=>{await flush();await B.signOut()};
}
B.onAuth(async u=>{
 if(!u){location.replace("index.html");return}
 if(SESSION)return;
 let s=null;try{s=await B.resolveSession(u)}catch(e){location.replace("index.html");return}
 if(!s||s.kind!=="student"){location.replace(s&&s.kind==="staff"?"staff.html":"index.html");return}
 SESSION=s;CODE=s.code;CLASS_ID=s.classId;
 const p=s.progress||{};
 S.stats=Object.assign({xp:0,sessions:0,seen:{},letters:{},days:{},nodes:{}},p.stats||{});
 ["seen","letters","days","nodes"].forEach(k=>{if(!S.stats[k]||typeof S.stats[k]!=="object")S.stats[k]={}});
 S.done=p.done||{};
 S.profile={name:s.name,cls:s.className,year:CURRICULUM.some(y=>y.id===s.year)?s.year:"7",years:String((p.profile&&p.profile.years)||s.years||1)};
 try{applyContent(await B.db.listUnits())}catch(e){}
 const t=location.hash.slice(1);if(TABS.some(x=>x[0]===t))S.tab=t;
 header();render();loadHomework();loadResources();
 if(!s.progress)persist();
}).catch(e=>{$("#view").innerHTML=`<div class="card">Couldn't connect. ${esc(B.friendlyError(e))}</div>`});

/* Meadows Lingo · theme artwork
   Every theme has an illustrated scene, drawn as SVG so it stays sharp on any screen.
   ART.scene(key) returns the picture; ART.theme(key) returns its colours, used to tint the
   theme's pages and lessons.
   To use a painted picture instead, put it in img/themes/<unit-id>.jpg and list the id in
   ART_PHOTOS below: the site then shows the photo and keeps these colours. */
window.ART_PHOTOS = window.ART_PHOTOS || [];

window.ART = (() => {
  let N = 0;
  const rnd = seed => { let a = 0; for (const c of seed) a = (a * 31 + c.charCodeAt(0)) | 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  /* ------------------------------------------------------------ palettes */
  const PAL = {
    sunset:  { ui: "#d8572a", sky: ["#2a1d5c", "#7b3f8f", "#f0884c"], glow: "#ffd27a", far: "#8a3f6e", mid: "#c45a4a", near: "#e7894f", ground: "#f2b46a", ink: "#3a1440", accent: "#f07a3a", stars: true },
    dusk:    { ui: "#c94a6e", sky: ["#141d4f", "#3d3a8a", "#e9708a"], glow: "#ffc38a", far: "#3a3478", mid: "#2a2763", near: "#1d1b4a", ground: "#2c2a5e", ink: "#1a1840", accent: "#e9708a", stars: true },
    morning: { ui: "#2f8f3f", sky: ["#3aa0e6", "#7cc8f2", "#d7f0ff"], glow: "#fff4c2", far: "#9fd3a6", mid: "#62b86a", near: "#3f9a4c", ground: "#7fc66d", ink: "#1d4a2a", accent: "#2f9b47", clouds: true },
    desert:  { ui: "#c0621d", sky: ["#3c8fd8", "#8fd0f5", "#ffe6b8"], glow: "#fff1c4", far: "#e6b273", mid: "#d9944f", near: "#c97b3b", ground: "#f0c27e", ink: "#5a3418", accent: "#d97a2b", clouds: true },
    sea:     { ui: "#0f86ad", sky: ["#2c8fd6", "#69c3ef", "#d4f2ff"], glow: "#fff6cf", far: "#7fd0e8", mid: "#2aa3c9", near: "#1b84ad", ground: "#f5d9a0", ink: "#0f3e57", accent: "#14a0c8", clouds: true },
    night:   { ui: "#6b5bd6", sky: ["#060b2a", "#16206a", "#3b2f8a"], glow: "#fff0b8", far: "#1d2560", mid: "#141a4a", near: "#0d1236", ground: "#141a4a", ink: "#0b1030", accent: "#f2c14e", stars: true },
    clinic:  { ui: "#138a82", sky: ["#d9f3f2", "#bfe8e6", "#a9dcd8"], glow: "#ffffff", far: "#9fd4d0", mid: "#7fc4be", near: "#58aaa3", ground: "#e9f6f3", ink: "#14524c", accent: "#18a39a", indoor: true },
    school:  { ui: "#c96a12", sky: ["#ffe9b8", "#ffd590", "#ffc46e"], glow: "#fff7dc", far: "#f2b35c", mid: "#e19a3e", near: "#c97f2b", ground: "#f7dcae", ink: "#5b3410", accent: "#e8872b", indoor: true },
    cinema:  { ui: "#d43a55", sky: ["#1a0b2e", "#3a1250", "#7a1d4f"], glow: "#ffcf6e", far: "#4a1650", mid: "#2b0e3d", near: "#1c0a2b", ground: "#2b0e3d", ink: "#12051f", accent: "#ff5a6e", stars: true },
    spring:  { ui: "#c23a82", sky: ["#59b8f0", "#a6dcfa", "#f6fbe9"], glow: "#fffbe0", far: "#bfe3a2", mid: "#8fcf74", near: "#5fb45a", ground: "#9bd67a", ink: "#21502b", accent: "#e0559a", clouds: true },
    lilac:   { ui: "#8a44c4", sky: ["#3b2a7a", "#8a5cc2", "#ffc3d6"], glow: "#fff0d6", far: "#a77fcf", mid: "#7c58b5", near: "#5b3f94", ground: "#c9a6e6", ink: "#2c1a55", accent: "#a45cd6", stars: true },
    teal:    { ui: "#148f7b", sky: ["#0f4c5c", "#1f8a8a", "#a6e3d2"], glow: "#eaffd6", far: "#4fb39a", mid: "#2f927c", near: "#1d7462", ground: "#7fcf9f", ink: "#0c3a33", accent: "#1fb39a", clouds: true },
    ramadan: { ui: "#6b4fc8", sky: ["#071338", "#1b2a72", "#6b3fa0"], glow: "#ffe6a3", far: "#24307a", mid: "#182360", near: "#101848", ground: "#1b2560", ink: "#0a1035", accent: "#f2c14e", stars: true },
    tech:    { ui: "#2a6fd6", sky: ["#0a1640", "#16307e", "#2f7fd6"], glow: "#9ff1ff", far: "#1d3a8a", mid: "#152c6e", near: "#0e1f52", ground: "#13265e", ink: "#08133a", accent: "#35d0ff", stars: true },
  };

  /* -------------------------------------------- scene recipes (key → parts) */
  const SCENES = {
    greetings:   { pal: "morning", land: "hills",  m: ["people2", "bubbleHi"] },
    nations:     { pal: "sea",     land: "sea",    m: ["globe", "bunting"] },
    family:      { pal: "sunset",  land: "dunes",  m: ["family"] },
    home:        { pal: "morning", land: "hills",  m: ["house", "tree"] },
    area:        { pal: "desert",  land: "town",   m: ["mosque", "palm", "parkBench"] },
    dubai:       { pal: "sunset",  land: "city",   m: ["burj", "frame", "metro"] },
    activities:  { pal: "spring",  land: "hills",  m: ["pencil", "football", "booksSmall"] },
    school:      { pal: "morning", land: "hills",  m: ["schoolBuilding", "bus"] },
    routine:     { pal: "school",  land: "indoor", m: ["alarm", "backpack"] },
    hobbies:     { pal: "lilac",   land: "hills",  m: ["palette", "guitar", "football"] },
    intlday:     { pal: "spring",  land: "hills",  m: ["globe", "bunting", "balloons"] },
    freetime:    { pal: "sea",     land: "beach",  m: ["football", "goggles"] },
    camel:       { pal: "desert",  land: "dunes",  m: ["camel", "horse"] },
    beach:       { pal: "sea",     land: "beach",  m: ["umbrella", "ball"] },
    food:        { pal: "school",  land: "indoor", m: ["plate", "apple", "carrot"] },
    habits:      { pal: "spring",  land: "hills",  m: ["dumbbell", "apple", "water"] },
    doctor:      { pal: "clinic",  land: "indoor", m: ["clinicSign", "stethoscope", "pills"] },
    seasons:     { pal: "morning", land: "seasons", m: ["hangerShirt", "snow", "sunSmall"] },
    cinema:      { pal: "cinema",  land: "curtain", m: ["clapper", "reel", "popcorn"] },
    fashion:     { pal: "lilac",   land: "indoor", m: ["hangerShirt", "kandura"] },
    weather:     { pal: "morning", land: "hills",  m: ["cloudSun", "rain"] },
    education:   { pal: "school",  land: "indoor", m: ["gradCap", "booksSmall", "pencil"] },
    jobs:        { pal: "teal",    land: "city",   m: ["briefcase", "hardhat", "booksSmall"] },
    festival:    { pal: "night",   land: "city",   m: ["fireworks", "lantern", "crescent"] },
    globalvillage:{pal: "dusk",    land: "town",   m: ["globe", "lanternsRow", "fireworks"] },
    tech:        { pal: "tech",    land: "grid",   m: ["laptop", "phone", "wifi"] },
    travel:      { pal: "sea",     land: "sea",    m: ["plane", "suitcase"] },
    friends:     { pal: "spring",  land: "hills",  m: ["people2", "heartBubble"] },
    phone:       { pal: "tech",    land: "grid",   m: ["phone", "chat"] },
    ramadan:     { pal: "ramadan", land: "dunes",  m: ["crescent", "lantern", "basket"] },
    environment: { pal: "teal",    land: "hills",  m: ["earth", "recycle", "leaf"] },
    healthy:     { pal: "spring",  land: "hills",  m: ["runner", "apple", "water"] },
    meadow:      { pal: "morning", land: "hills",  m: ["letterAin"] },
    hero:        { pal: "sunset",  land: "city",   m: ["burj", "palmTall", "camelSmall"] },
  };

  /* ---------------------------------------------------------- svg helpers */
  function make(key) {
    const S = SCENES[key] || SCENES.meadow, P = PAL[S.pal], id = "ml" + (++N) + "_", defs = [];
    const R = rnd(key);
    const lg = (name, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => { defs.push(`<linearGradient id="${id + name}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map((c, i) => `<stop offset="${Array.isArray(c) ? c[1] : i / (stops.length - 1)}" stop-color="${Array.isArray(c) ? c[0] : c}"/>`).join("")}</linearGradient>`); return `url(#${id + name})`; };
    const rg = (name, stops, cx = .5, cy = .5, r = .5) => { defs.push(`<radialGradient id="${id + name}" cx="${cx}" cy="${cy}" r="${r}">${stops.map((c, i) => `<stop offset="${Array.isArray(c) ? c[1] : i / (stops.length - 1)}" stop-color="${Array.isArray(c) ? c[0] : c}" ${Array.isArray(c) && c[2] != null ? `stop-opacity="${c[2]}"` : ""}/>`).join("")}</radialGradient>`); return `url(#${id + name})`; };
    defs.push(`<filter id="${id}soft" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>`);
    defs.push(`<filter id="${id}blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>`);
    const shadow = (x, y, w, o = .28) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * .16}" fill="#000" opacity="${o}" filter="url(#${id}blur2)"/>`;
    return { S, P, id, defs, lg, rg, R, shadow };
  }

  /* --------------------------------------------------------- backgrounds */
  function sky(C) {
    const { P, lg, rg, R } = C; let s = `<rect width="1200" height="640" fill="${lg("sky", P.sky)}"/>`;
    if (!P.indoor && !C.S.m.includes("crescent")) s += `<circle cx="${P.stars ? 930 : 980}" cy="${P.stars ? 150 : 130}" r="230" fill="${rg("glow", [[P.glow, 0, .95], [P.glow, .25, .45], [P.glow, 1, 0]])}"/>` +
      `<circle cx="${P.stars ? 930 : 980}" cy="${P.stars ? 150 : 130}" r="${P.stars ? 58 : 66}" fill="${P.glow}" opacity=".95"/>`;
    if (P.stars) for (let i = 0; i < 70; i++) { const x = R() * 1200, y = R() * 330, r = R() * 1.8 + .4; s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(.35 + R() * .6).toFixed(2)}"/>`; }
    if (P.clouds) for (let i = 0; i < 4; i++) { const x = 80 + R() * 1000, y = 60 + R() * 140, k = .6 + R() * .7; s += cloud(x, y, k, .75); }
    return s;
  }
  const cloud = (x, y, k, o = .85, c = "#fff") => `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${k.toFixed(2)})" opacity="${o}"><ellipse cx="0" cy="20" rx="90" ry="26" fill="${c}"/><circle cx="-34" cy="6" r="30" fill="${c}"/><circle cx="8" cy="-8" r="40" fill="${c}"/><circle cx="48" cy="10" r="26" fill="${c}"/></g>`;

  function ridge(R, y, amp, n, rough = .5) { let d = `M0 640 L0 ${y}`; const step = 1200 / n; for (let i = 0; i <= n; i++) { const x = i * step, yy = y - Math.sin(i * 1.3 + R() * 2) * amp - R() * amp * rough; d += ` Q${(x - step / 2).toFixed(0)} ${(yy - amp * .6).toFixed(0)} ${x.toFixed(0)} ${yy.toFixed(0)}`; } return d + " L1200 640 Z"; }
  function skylinePath(R, base, h, n, tower) { let d = `M0 640 L0 ${base}`, x = 0; while (x < 1200) { const w = 30 + R() * 60, hh = h * (.35 + R() * .75); if (tower && x > 520 && x < 640) { x += w; continue; } d += ` L${x.toFixed(0)} ${(base - hh).toFixed(0)} L${(x + w).toFixed(0)} ${(base - hh).toFixed(0)}`; if (R() > .7) d += ` L${(x + w).toFixed(0)} ${(base - hh - 20).toFixed(0)} L${(x + w + 6).toFixed(0)} ${(base - hh - 20).toFixed(0)} L${(x + w + 6).toFixed(0)} ${(base - hh).toFixed(0)}`; x += w + R() * 8; d += ` L${x.toFixed(0)} ${base}`; } return d + " L1200 640 Z"; }

  function land(C) {
    const { S, P, lg, R } = C, L = S.land;
    if (L === "indoor") {
      return `<rect y="430" width="1200" height="210" fill="${lg("floor", [P.ground, P.mid])}"/><rect y="424" width="1200" height="10" fill="${P.near}" opacity=".5"/>` +
        `<g opacity=".55"><rect x="70" y="80" width="230" height="200" rx="14" fill="#fff" opacity=".55"/><rect x="82" y="92" width="206" height="176" rx="8" fill="${lg("win", [P.sky[0], "#ffffff"])}"/><path d="M185 92v176M82 180h206" stroke="#fff" stroke-width="8"/></g>` +
        `<g opacity=".35">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 140 - 20}" y="440" width="130" height="200" fill="${P.near}" opacity="${i % 2 ? .12 : .04}"/>`).join("")}</g>`;
    }
    if (L === "curtain") {
      let s = `<rect y="470" width="1200" height="170" fill="${lg("stage", ["#3a0f2c", "#160616"])}"/>`;
      for (let i = 0; i < 12; i++) s += `<path d="M${i * 50} 0 q25 240 0 470 h50 q-25 -230 0 -470z" fill="${i % 2 ? "#a3123a" : "#c41c4a"}"/>` + `<path d="M${1200 - i * 50} 0 q-25 240 0 470 h-50 q25 -230 0 -470z" fill="${i % 2 ? "#a3123a" : "#c41c4a"}"/>`;
      return s + `<path d="M0 0h1200v60q-600 50 -1200 0z" fill="#7e0d2e"/><path d="M0 52q600 50 1200 0" stroke="#f2c14e" stroke-width="6" fill="none"/>`;
    }
    if (L === "grid") {
      let s = `<path d="M0 640 L0 470 L1200 470 L1200 640Z" fill="${lg("gfloor", [P.far, P.near])}"/>`;
      for (let i = -12; i <= 24; i++) s += `<path d="M${600 + i * 60} 470 L${600 + i * 220} 640" stroke="${P.accent}" stroke-opacity=".35" stroke-width="2"/>`;
      for (let j = 0; j < 6; j++) { const y = 470 + j * j * 6 + j * 8; s += `<path d="M0 ${y}H1200" stroke="${P.accent}" stroke-opacity=".3" stroke-width="2"/>`; }
      s += `<path d="${skylinePath(R, 470, 150, 0)}" fill="${P.far}" opacity=".6"/>`;
      return s;
    }
    if (L === "sea" || L === "beach") {
      let s = `<rect y="400" width="1200" height="240" fill="${lg("sea", [P.far, P.mid, P.near])}"/>`;
      for (let i = 0; i < 14; i++) { const y = 420 + i * 14 + R() * 6, x = R() * 1100; s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q20 -6 40 0 t40 0" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none"/>`; }
      if (L === "beach") s += `<path d="M0 640 L0 540 Q300 500 640 528 T1200 500 L1200 640Z" fill="${lg("sand", [P.ground, "#e9b86e"])}"/><path d="M0 540 Q300 500 640 528 T1200 500" stroke="#fff" stroke-width="7" stroke-opacity=".7" fill="none"/>`;
      else s += `<path d="M0 640 L0 590 Q420 560 800 586 T1200 576 L1200 640Z" fill="${P.ground}"/>`;
      return s;
    }
    if (L === "city" || L === "town") {
      const tower = S.m.includes("burj");
      return `<path d="${skylinePath(R, 480, L === "city" ? 230 : 120, 0, tower)}" fill="${P.far}" opacity=".75"/>` +
        `<path d="${skylinePath(R, 520, L === "city" ? 150 : 90, 0, tower)}" fill="${P.mid}" opacity=".9"/>` +
        `<path d="M0 640 L0 540 Q400 520 800 536 T1200 528 L1200 640Z" fill="${P.near}"/>` +
        (L === "town" ? domeRow(P) : "") +
        `<path d="M0 640 L0 590 Q500 570 1200 586 L1200 640Z" fill="${P.ground}" opacity=".9"/>`;
    }
    if (L === "seasons") {
      return `<path d="${ridge(R, 470, 30, 6)}" fill="${P.far}"/><path d="M0 640 V520 Q300 480 600 520 V640Z" fill="#f4f8ff"/><path d="M600 640 V520 Q900 480 1200 520 V640Z" fill="${P.near}"/>` +
        `<path d="M600 640 V500" stroke="#fff" stroke-width="5" stroke-dasharray="10 12" opacity=".7"/>`;
    }
    // hills / dunes
    const dunes = L === "dunes";
    return `<path d="${ridge(R, dunes ? 430 : 440, dunes ? 40 : 34, dunes ? 4 : 6)}" fill="${P.far}"/>` +
      `<path d="${ridge(R, dunes ? 490 : 495, dunes ? 34 : 28, dunes ? 3 : 5)}" fill="${P.mid}"/>` +
      `<path d="${ridge(R, 560, 22, 4, .2)}" fill="${lg("near", [P.near, P.ground])}"/>`;
  }
  function domeRow(P) {
    let s = ""; [[140, 1], [380, .8], [760, .9], [1020, 1.1]].forEach(([x, k]) => {
      s += `<g transform="translate(${x} 540) scale(${k})" fill="${P.near}"><rect x="-50" y="-60" width="100" height="60"/><path d="M-40 -60 a40 40 0 0 1 80 0z"/><rect x="58" y="-130" width="14" height="130"/><path d="M58 -130 l7 -18 l7 18z"/></g>`;
    }); return s;
  }

  /* -------------------------------------------------------------- motifs */
  const M = {};
  // small drawing helpers
  const T = (x, y, k, inner) => `<g transform="translate(${x} ${y}) scale(${k})">${inner}</g>`;

  M.burj = C => { const { lg, shadow } = C; const body = lg("burj", ["#e8eef7", "#9fb3cf", "#5c6f92"], 0, 0, 1, 0);
    return shadow(600, 560, 120) + `<g transform="translate(600 0)">
      <path d="M-70 560 L-62 380 L-44 380 L-40 250 L-26 250 L-22 150 L-12 150 L-9 70 L-4 70 L0 -10 L4 70 L9 70 L12 150 L22 150 L26 250 L40 250 L44 380 L62 380 L70 560 Z" fill="${body}"/>
      <path d="M0 -10 L4 70 L9 70 L12 150 L22 150 L26 250 L40 250 L44 380 L62 380 L70 560 L0 560Z" fill="#203255" opacity=".22"/>
      ${Array.from({ length: 22 }, (_, i) => `<path d="M${-58 + i * 0.6} ${540 - i * 22}h${116 - i * 4.4}" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`).join("")}
      <path d="M-2 0 L0 -40 L2 0" stroke="#dde6f2" stroke-width="3"/></g>`; };
  M.frame = C => { const { lg, shadow } = C; const gold = lg("gold", ["#ffe08a", "#e2a83a", "#a86a12"], 0, 0, 1, 1);
    return shadow(890, 565, 110) + `<g transform="translate(820 290)"><path d="M0 0 h140 v270 h-40 v-220 h-60 v220 h-40z" fill="${gold}"/><rect x="0" y="0" width="140" height="34" fill="#ffefb3" opacity=".7"/><path d="M8 40 v220 M132 40 v220" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
      ${Array.from({ length: 8 }, (_, i) => `<path d="M6 ${60 + i * 26} h26 M108 ${60 + i * 26} h26" stroke="#7a4a08" stroke-opacity=".35" stroke-width="3"/>`).join("")}</g>`; };
  M.metro = C => { const { lg } = C; return `<g transform="translate(130 470)"><path d="M-160 40 H520" stroke="#3a3a5a" stroke-width="10"/><path d="M0 0 h300 q40 0 50 30 l6 14 H-6 Z" fill="${lg("metro", ["#ffffff", "#c9d3e6"])}"/>
      <path d="M8 6 h280 q20 0 32 14 H8z" fill="#2b3d6b"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${16 + i * 44}" y="10" width="34" height="14" rx="3" fill="#8fd3ff" opacity=".9"/>`).join("")}<path d="M-6 34 H356" stroke="#e2364a" stroke-width="6"/></g>`; };
  M.palm = (C, x = 960, y = 560, k = 1) => T(x, y, k, `<path d="M0 0 q-12 -110 10 -230" stroke="#6b4423" stroke-width="18" fill="none" stroke-linecap="round"/>
      ${[[-110, 20], [-60, -30], [0, -45], [60, -25], [110, 25], [-30, 40], [40, 45]].map(([dx, dy]) => `<path d="M10 -230 q${dx * .5} ${dy - 40} ${dx} ${dy + 30}" stroke="#2f8a3c" stroke-width="16" fill="none" stroke-linecap="round"/>`).join("")}
      <circle cx="4" cy="-222" r="10" fill="#7a4a1a"/><circle cx="18" cy="-218" r="9" fill="#8a5420"/>`);
  M.palmTall = C => M.palm(C, 180, 600, 1.3) + M.palm(C, 1080, 610, 1.05);
  M.camelBody = (fill, shade) => `<path d="M-120 -40 q10 -70 70 -80 q30 -50 70 -5 q30 -40 60 5 q40 10 40 60 l0 10 q30 -10 40 -60 q6 -30 34 -30 q24 2 26 18 l-14 8 q-10 50 -50 90 l-6 20 v120 h-18 v-110 l-50 0 v110 h-18 v-110 h-70 v110 h-18 v-110 l-30 0 v110 h-18 v-120 q-20 -10 -20 -38z" fill="${fill}"/><path d="M-120 -40 q10 -70 70 -80 q30 -50 70 -5 q30 -40 60 5 q40 10 40 60 v20 q-120 30 -240 0z" fill="${shade}" opacity=".18"/><circle cx="152" cy="-112" r="5" fill="#2a1406"/>`;
  M.camel = C => C.shadow(420, 572, 190) + T(420, 410, 1, M.camelBody(C.lg("camel", ["#d49a5a", "#a8692f"]), "#fff") + `<path d="M-40 -110 q40 -30 80 0 l-6 30 h-68z" fill="#c4262e"/><path d="M-36 -86 h70" stroke="#f2c14e" stroke-width="6"/>`);
  M.camelSmall = C => T(1000, 560, .45, `<g fill="#3a1d36" opacity=".8">${M.camelBody("#3a1d36", "#000")}</g>`);
  M.horse = C => C.shadow(860, 572, 160) + T(860, 400, .95, `<path d="M-130 30 q0 -80 90 -80 h100 q40 -60 80 -110 q20 -20 40 0 l20 30 q10 20 -10 30 q-30 10 -40 40 q-10 30 -20 80 l20 150 h-20 l-30 -120 q-60 20 -120 0 l-30 120 h-20 l10 -150 q-30 -20 -30 -40 l-40 120 h-20 z" fill="${C.lg("horse", ["#8a4a24", "#4e260e"])}"/>
      <path d="M100 -170 q-40 20 -60 120" stroke="#2a1406" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M-130 30 q-40 10 -60 70" stroke="#2a1406" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="150" cy="-150" r="5" fill="#110600"/>`);

  M.person = (x, y, k, shirt, skin = "#c98d63", hair = "#2b1a12", extra = "") => T(x, y, k, `
      <path d="M-46 210 q-6 -120 46 -130 q52 10 46 130z" fill="${shirt}"/><path d="M-46 210 q-6 -120 46 -130 v130z" fill="#000" opacity=".08"/>
      <rect x="-12" y="60" width="24" height="28" rx="8" fill="${skin}"/>
      <circle cx="0" cy="30" r="42" fill="${skin}"/><path d="M-44 26 q4 -52 44 -54 q42 2 46 54 q-14 -26 -46 -28 q-30 2 -44 28z" fill="${hair}"/>
      <circle cx="-14" cy="34" r="4.5" fill="#2a1406"/><circle cx="14" cy="34" r="4.5" fill="#2a1406"/><path d="M-12 52 q12 10 24 0" stroke="#7a2a1a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="-24" cy="46" r="7" fill="#ff8a8a" opacity=".35"/><circle cx="24" cy="46" r="7" fill="#ff8a8a" opacity=".35"/>${extra}`);
  M.people2 = C => C.shadow(560, 572, 100) + C.shadow(800, 572, 100) + M.person(560, 340, 1.05, C.lg("p1", ["#3fa9f5", "#1f6fc0"]), "#c98d63", "#2b1a12", `<path d="M40 110 q40 -40 30 -90" stroke="#c98d63" stroke-width="20" stroke-linecap="round" fill="none"/>`) +
      M.person(800, 340, 1.05, C.lg("p2", ["#ff8a5c", "#e0483a"]), "#e2b08a", "#5b2a12", `<path d="M-46 30 q-10 -40 50 -60 q56 20 44 60 q-4 50 -10 90 q-6 -60 -34 -76 q-28 16 -36 76 q-8 -40 -14 -90z" fill="#5b2a12"/><path d="M-40 110 q-40 -40 -30 -90" stroke="#e2b08a" stroke-width="20" stroke-linecap="round" fill="none"/>`);
  M.family = C => C.shadow(640, 576, 260) + M.person(470, 330, 1.1, C.lg("f1", ["#4f8ff0", "#2a5cc0"])) + M.person(820, 340, 1.05, C.lg("f2", ["#d65a8a", "#9c2f60"]), "#e2b08a", "#3a1a0a", `<path d="M-48 34 q-6 -64 48 -66 q54 2 48 66 q-2 70 -8 120 q-8 -90 -40 -106 q-32 16 -40 106 q-6 -50 -8 -120z" fill="#3a1a0a"/>`) +
      M.person(650, 420, .72, C.lg("f3", ["#ffd166", "#f0a020"]), "#d9a07a") + M.person(1000, 440, .6, C.lg("f4", ["#5ccf8a", "#2b9a5a"]), "#c98d63");
  M.bubble = (x, y, text, fill = "#fff", ink = "#1d2b4a", k = 1) => T(x, y, k, `<path d="M-110 -60 h220 q24 0 24 24 v60 q0 24 -24 24 h-140 l-30 30 l4 -30 h-54 q-24 0 -24 -24 v-60 q0 -24 24 -24z" fill="${fill}" filter="drop-shadow(0 6px 10px rgba(0,0,0,.18))"/><text x="0" y="12" text-anchor="middle" font-family="Noto Naskh Arabic, serif" font-weight="700" font-size="46" fill="${ink}" direction="rtl">${text}</text>`);
  M.bubbleHi = C => M.bubble(430, 210, "مرحبا!") + M.bubble(930, 170, "أهلا وسهلا", "#fff7d6", "#5a3a08", .9);
  M.heartBubble = C => M.bubble(680, 160, "صديقي ❤", "#fff", "#c2185b", 1);
  M.globe = (C, x = 700, y = 330, k = 1) => C.shadow(x, y + 200, 120 * k) + T(x, y, k, `<circle r="170" fill="${C.rg("ocean", ["#7fd6ff", "#2a8fd6", "#145a9e"], .35, .3, .8)}"/>
      <path d="M-120 -90 q40 -40 90 -30 q20 30 -10 60 q-30 10 -40 50 q-30 10 -40 -20 q-20 -30 0 -60z M20 -150 q60 0 90 40 q-10 30 -50 30 q-30 -10 -40 -70z M30 -10 q60 -20 100 20 q20 40 -10 90 q-30 40 -60 60 q-20 -30 -10 -70 q-30 -40 -20 -100z M-150 40 q30 0 40 30 q-10 40 -30 50 q-20 -40 -10 -80z" fill="${C.lg("land", ["#7ee08a", "#2f9b47"])}"/>
      <ellipse cx="-60" cy="-80" rx="70" ry="40" fill="#fff" opacity=".25" transform="rotate(-30)"/><circle r="170" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4"/>`);
  M.bunting = C => { const cols = ["#e53945", "#ffd166", "#06d6a0", "#118ab2", "#f78c6b", "#9b5de5", "#00bbf9", "#f15bb5"]; let s = `<path d="M0 70 Q600 190 1200 60" stroke="#fff" stroke-opacity=".8" stroke-width="4" fill="none"/>`;
    for (let i = 0; i < 18; i++) { const t = i / 17, x = t * 1200, y = 70 + Math.sin(t * Math.PI) * 120 - t * 10; s += `<path d="M${x - 24} ${y} L${x + 24} ${y} L${x} ${y + 50}Z" fill="${cols[i % cols.length]}"/>`; } return s; };
  M.balloons = C => [[220, 230, "#e53945"], [300, 190, "#ffd166"], [260, 290, "#06d6a0"]].map(([x, y, c]) => `<path d="M${x} ${y + 70} q-10 80 20 160" stroke="#fff" stroke-width="2" fill="none"/><ellipse cx="${x}" cy="${y}" rx="48" ry="60" fill="${c}"/><ellipse cx="${x - 16}" cy="${y - 22}" rx="10" ry="16" fill="#fff" opacity=".45"/>`).join("");
  M.house = C => C.shadow(640, 568, 230) + `<g transform="translate(640 330)"><rect x="-200" y="0" width="400" height="240" fill="${C.lg("wall", ["#fff3df", "#f1d3a8"])}"/><path d="M-240 10 L0 -170 L240 10z" fill="${C.lg("roof", ["#e4583e", "#a8301e"])}"/><path d="M-240 10 L0 -170 L0 10z" fill="#fff" opacity=".1"/>
      <rect x="-40" y="100" width="80" height="140" rx="10" fill="#7a4a24"/><circle cx="24" cy="174" r="6" fill="#f2c14e"/>${[-140, 70].map(x => `<rect x="${x}" y="50" width="70" height="70" rx="6" fill="#8fd3ff" stroke="#fff" stroke-width="8"/><path d="M${x + 35} 50v70M${x} 85h70" stroke="#fff" stroke-width="5"/>`).join("")}<rect x="110" y="-120" width="40" height="90" fill="#a8301e"/></g>`;
  M.tree = (C, x = 300, y = 570, k = 1) => T(x, y, k, `<rect x="-14" y="-120" width="28" height="120" fill="#7a4a24"/><circle cy="-170" r="80" fill="${C.lg("leaf", ["#7ed36b", "#2f8a3c"])}"/><circle cx="-60" cy="-130" r="50" fill="#3f9a4c"/><circle cx="60" cy="-130" r="55" fill="#4fae55"/><circle cx="-20" cy="-200" r="30" fill="#9fe08a" opacity=".6"/>`);
  M.mosque = C => C.shadow(640, 570, 230) + `<g transform="translate(640 560)"><rect x="-170" y="-170" width="340" height="170" fill="${C.lg("mw", ["#ffffff", "#e7dcc8"])}"/><path d="M-110 -170 a110 110 0 0 1 220 0z" fill="${C.lg("dome", ["#ffe08a", "#d99a2b"])}"/><path d="M0 -280 v-30" stroke="#d99a2b" stroke-width="6"/><path d="M-8 -318 a10 10 0 1 0 16 0 a7 7 0 1 1 -16 0" fill="#d99a2b"/>
      ${[-220, 220].map(x => `<rect x="${x - 16}" y="-330" width="32" height="330" fill="#fff"/><path d="M${x - 22} -330 l22 -50 l22 50z" fill="#d99a2b"/><rect x="${x - 22}" y="-250" width="44" height="12" fill="#e7dcc8"/>`).join("")}
      ${[-110, -40, 40].map(x => `<path d="M${x} 0 v-80 a35 35 0 0 1 70 0 v80z" fill="#3a6aa0" opacity=".85"/>`).join("")}</g>`;
  M.parkBench = C => `<g transform="translate(1020 540)"><rect x="-80" y="-40" width="160" height="12" rx="4" fill="#8a5424"/><rect x="-80" y="-70" width="160" height="12" rx="4" fill="#a8692f"/><path d="M-70 -28 v40 M70 -28 v40" stroke="#333" stroke-width="8"/></g>`;
  M.schoolBuilding = C => C.shadow(640, 570, 280) + `<g transform="translate(640 560)"><rect x="-260" y="-230" width="520" height="230" fill="${C.lg("sch", ["#ffd9a8", "#f2b06a"])}"/><rect x="-80" y="-330" width="160" height="110" fill="#f7c58a"/><path d="M-100 -330 L0 -400 L100 -330z" fill="#d9534a"/>
      <circle cy="-285" r="32" fill="#fff"/><path d="M0 -285 v-20 M0 -285 h14" stroke="#333" stroke-width="5" stroke-linecap="round"/><path d="M0 -400 v-60" stroke="#666" stroke-width="5"/><path d="M0 -460 h60 v36 h-60z" fill="${C.lg("flag", [["#00843D", 0], ["#00843D", .33], ["#ffffff", .33], ["#ffffff", .66], ["#000", .66], ["#000", 1]])}"/><rect x="-12" y="-460" width="12" height="36" fill="#ff0000"/>
      ${[-220, -150, 80, 150].flatMap(x => [-190, -110].map(y => `<rect x="${x}" y="${y}" width="56" height="52" rx="5" fill="#8fd3ff" stroke="#fff" stroke-width="5"/>`)).join("")}<rect x="-50" y="-110" width="100" height="110" rx="8" fill="#7a4a24"/><text y="-20" x="0" text-anchor="middle" font-family="Noto Naskh Arabic, serif" font-size="34" font-weight="700" fill="#fff" transform="translate(0 -160)">مدرستي</text></g>`;
  M.bus = C => C.shadow(1040, 572, 150) + `<g transform="translate(900 450)"><rect x="0" y="0" width="290" height="110" rx="18" fill="${C.lg("bus", ["#ffd84a", "#f2a900"])}"/><path d="M250 0 q40 0 40 40 v70 h-40z" fill="#f2a900"/>${[16, 76, 136, 196].map(x => `<rect x="${x}" y="16" width="48" height="40" rx="6" fill="#8fd3ff"/>`).join("")}<rect x="0" y="66" width="290" height="8" fill="#222" opacity=".6"/><circle cx="60" cy="112" r="24" fill="#222"/><circle cx="230" cy="112" r="24" fill="#222"/><circle cx="60" cy="112" r="9" fill="#999"/><circle cx="230" cy="112" r="9" fill="#999"/></g>`;
  M.alarm = C => C.shadow(560, 560, 150) + `<g transform="translate(560 360)"><path d="M-110 150 l-30 50 M110 150 l30 50" stroke="#a3123a" stroke-width="16" stroke-linecap="round"/><circle r="160" fill="${C.lg("clk", ["#ff6b6b", "#c41c4a"])}"/><circle r="128" fill="#fffaf0"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 -112 v18" stroke="#3a2a2a" stroke-width="${i % 3 ? 4 : 8}" transform="rotate(${i * 30})"/>`).join("")}
      <path d="M0 0 v-80 M0 0 l60 30" stroke="#3a2a2a" stroke-width="10" stroke-linecap="round"/><circle r="12" fill="#c41c4a"/><circle cx="-110" cy="-130" r="44" fill="#ffd166"/><circle cx="110" cy="-130" r="44" fill="#ffd166"/><path d="M-160 -150 q-20 -20 -10 -50 M160 -150 q20 -20 10 -50" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/></g>`;
  M.backpack = C => C.shadow(890, 566, 110) + `<g transform="translate(890 380)"><path d="M-60 -110 q0 -50 60 -50 q60 0 60 50" stroke="#2a5cc0" stroke-width="16" fill="none"/><rect x="-110" y="-110" width="220" height="290" rx="50" fill="${C.lg("bp", ["#4f8ff0", "#2a5cc0"])}"/><rect x="-80" y="40" width="160" height="110" rx="24" fill="#3a74d8"/><path d="M-60 70 h120" stroke="#ffd166" stroke-width="8" stroke-linecap="round"/><rect x="-90" y="-90" width="40" height="80" rx="16" fill="#fff" opacity=".18"/></g>`;
  M.football = (C, x = 330, y = 470, k = 1) => C.shadow(x, y + 90, 80 * k) + T(x, y, k, `<circle r="90" fill="${C.rg("fb", ["#ffffff", "#d7dde6"], .35, .3, .8)}"/><path d="M0 -34 l32 23 -12 38 h-40 l-12 -38z" fill="#1d1d2b"/>${[0, 72, 144, 216, 288].map(a => `<path d="M0 -34 L0 -88" stroke="#1d1d2b" stroke-width="5" transform="rotate(${a})"/><path d="M-22 -86 l22 -8 l22 8 l-6 -4z" fill="#1d1d2b" transform="rotate(${a + 36})"/>`).join("")}<circle r="90" fill="none" stroke="#1d1d2b" stroke-opacity=".2" stroke-width="3"/>`);
  M.ball = C => T(860, 520, 1, `<circle r="60" fill="#fff"/><path d="M-60 0 a60 60 0 0 1 120 0z" fill="#e53945"/><path d="M-40 -44 a60 60 0 0 1 80 0 l-40 44z" fill="#ffd166"/><circle cx="-20" cy="-26" r="10" fill="#fff" opacity=".6"/>`);
  M.palette = (C, x = 700, y = 330, k = 1) => C.shadow(x, y + 190, 150 * k) + T(x, y, k, `<path d="M-180 0 q0 -150 180 -160 q180 10 180 140 q0 90 -110 90 q-50 0 -40 50 q8 50 -50 50 q-160 -10 -160 -170z" fill="${C.lg("pal", ["#fff1d6", "#e9c99a"])}"/><ellipse cx="40" cy="70" rx="34" ry="24" fill="${C.P.sky[0]}" opacity=".9"/>
      ${[["#e53945", -110, -40], ["#ffd166", -50, -100], ["#06d6a0", 40, -110], ["#118ab2", 110, -60], ["#9b5de5", -120, 50]].map(([c, a, b]) => `<circle cx="${a}" cy="${b}" r="30" fill="${c}"/><circle cx="${a - 9}" cy="${b - 9}" r="8" fill="#fff" opacity=".4"/>`).join("")}
      <path d="M150 140 L320 -140" stroke="#8a5424" stroke-width="18" stroke-linecap="round"/><path d="M305 -120 q30 -60 40 -40 q4 30 -26 54z" fill="#e53945"/>`);
  M.guitar = C => C.shadow(1000, 566, 100) + T(1000, 420, .9, `<path d="M0 -330 v260" stroke="#5a2e10" stroke-width="22"/><rect x="-20" y="-380" width="40" height="60" rx="8" fill="#3a1a06"/><path d="M0 -80 q-110 0 -100 90 q-90 40 -40 130 q60 70 140 0 q80 70 140 0 q50 -90 -40 -130 q10 -90 -100 -90z" fill="${C.lg("gt", ["#f2a24a", "#b85a12"])}"/><circle cy="40" r="34" fill="#3a1a06"/><path d="M-6 -320 V160 M6 -320 V160" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>`);
  M.booksSmall = (C, x = 950, y = 520, k = 1) => C.shadow(x, y + 44, 120 * k) + T(x, y, k, [["#e53945", 0, 220], ["#118ab2", -42, 200], ["#ffd166", -84, 230], ["#06d6a0", -126, 190]].map(([c, d, w], i) => `<rect x="${-w / 2 + (i % 2) * 16}" y="${d}" width="${w}" height="40" rx="6" fill="${c}"/><rect x="${-w / 2 + (i % 2) * 16 + w - 26}" y="${d + 4}" width="18" height="32" rx="3" fill="#fff" opacity=".85"/><rect x="${-w / 2 + (i % 2) * 16 + 10}" y="${d + 8}" width="${w - 60}" height="6" rx="3" fill="#fff" opacity=".45"/>`).join(""));
  M.pencil = C => T(520, 300, 1, `<g transform="rotate(35)"><rect x="-24" y="-200" width="48" height="300" fill="${C.lg("pc", ["#ffd84a", "#f2a900"], 0, 0, 1, 0)}"/><path d="M-24 100 L0 160 L24 100z" fill="#f1d3a8"/><path d="M-8 140 L0 160 L8 140z" fill="#333"/><rect x="-24" y="-240" width="48" height="40" rx="8" fill="#ff8a8a"/><rect x="-24" y="-210" width="48" height="14" fill="#c0c0c0"/></g>`);
  M.gradCap = C => C.shadow(620, 520, 160) + T(620, 330, 1, `<path d="M-230 0 L0 -100 L230 0 L0 100z" fill="${C.lg("cap", ["#3a3f6e", "#151838"])}"/><path d="M-130 44 v90 q130 70 260 0 v-90 l-130 56z" fill="#22264f"/><path d="M0 0 L180 30 v100" stroke="#f2c14e" stroke-width="6" fill="none"/><circle cx="180" cy="140" r="16" fill="#f2c14e"/>`);
  M.umbrella = C => C.shadow(560, 560, 170) + T(560, 300, 1, `<path d="M0 0 v260" stroke="#6b4423" stroke-width="10"/><path d="M-230 20 q230 -230 460 0z" fill="${C.lg("umb", ["#ff7a7a", "#e53945"])}"/>${[-138, -46, 46, 138].map((x, i) => `<path d="M${x - 46} 20 q46 -${150 - Math.abs(x) / 3} 92 0" fill="${i % 2 ? "#fff" : "#ffd166"}" opacity=".9"/>`).join("")}<path d="M-230 20 q30 -20 46 0 q46 -20 92 0 q46 -20 92 0 q46 -20 92 0 q46 -20 92 0 q16 -20 46 0" fill="none" stroke="#a3123a" stroke-width="4"/>`);
  M.goggles = C => T(820, 480, 1, `<path d="M-120 0 h240" stroke="#1d84ad" stroke-width="12"/><rect x="-110" y="-40" width="100" height="70" rx="34" fill="#69c3ef" stroke="#0f3e57" stroke-width="10"/><rect x="10" y="-40" width="100" height="70" rx="34" fill="#69c3ef" stroke="#0f3e57" stroke-width="10"/><path d="M-90 -20 l30 -6 M30 -20 l30 -6" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`);
  M.plate = C => C.shadow(620, 520, 230) + T(620, 430, 1, `<ellipse rx="260" ry="90" fill="#fff"/><ellipse rx="200" ry="66" fill="#f4f1ea"/><ellipse cx="-70" cy="-10" rx="90" ry="40" fill="${C.lg("rice", ["#fffbe8", "#f2e2b8"])}"/><path d="M30 -30 q60 -40 120 0 q-10 40 -60 40 q-50 0 -60 -40z" fill="${C.lg("chk", ["#e9a24a", "#b8621c"])}"/><circle cx="-10" cy="30" r="20" fill="#e53945"/><circle cx="30" cy="34" r="16" fill="#06a04a"/><circle cx="-130" cy="20" r="14" fill="#06a04a"/><path d="M-330 -10 v100 M-340 -10 v40 M-320 -10 v40 M330 -10 v100" stroke="#b8c2cc" stroke-width="10" stroke-linecap="round"/>`);
  M.apple = (C, x = 960, y = 380, k = 1) => C.shadow(x, y + 120, 70 * k) + T(x, y, k, `<path d="M0 -60 q-40 -40 -90 -10 q-60 40 -30 140 q30 70 70 50 q20 -10 50 0 q40 20 70 -50 q30 -100 -30 -140 q-50 -30 -90 10z" fill="${C.rg("ap", ["#ff7a6b", "#e53945", "#9c1c26"], .35, .3, .8)}"/><path d="M0 -60 q4 -40 24 -60" stroke="#6b4423" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M14 -90 q40 -30 70 -10 q-30 30 -70 10z" fill="#3f9a4c"/><ellipse cx="-50" cy="-10" rx="16" ry="30" fill="#fff" opacity=".35"/>`);
  M.carrot = C => T(330, 420, 1, `<g transform="rotate(-30)"><path d="M-30 -120 q30 -10 60 0 l-26 260 q-4 10 -8 0z" fill="${C.lg("car", ["#ffa04a", "#e8650a"], 0, 0, 1, 0)}"/>${[-80, -40, 0, 40].map(y => `<path d="M-24 ${y} h22" stroke="#b84a06" stroke-width="4" stroke-linecap="round"/>`).join("")}<path d="M0 -120 q-40 -70 -20 -110 M0 -120 q0 -70 10 -120 M0 -120 q40 -70 30 -110" stroke="#3f9a4c" stroke-width="14" fill="none" stroke-linecap="round"/></g>`);
  M.dumbbell = C => C.shadow(560, 540, 200) + T(560, 470, 1, `<rect x="-170" y="-14" width="340" height="28" rx="12" fill="#9aa4b2"/>${[-1, 1].map(s => `<rect x="${s * 150 - 30}" y="-80" width="60" height="160" rx="16" fill="${C.lg("db" + s, ["#4a5568", "#1d2433"])}"/><rect x="${s * 210 - 22}" y="-56" width="44" height="112" rx="14" fill="#2d3748"/>`).join("")}`);
  M.water = (C, x = 330, y = 380, k = 1) => C.shadow(x, y + 170, 60 * k) + T(x, y, k, `<rect x="-50" y="-120" width="100" height="290" rx="30" fill="${C.lg("wtr", ["#bfeaff", "#6ac2f0"])}" opacity=".95"/><rect x="-36" y="-170" width="72" height="56" rx="12" fill="#1f6fc0"/><rect x="-50" y="0" width="100" height="70" fill="#fff" opacity=".7"/><text x="0" y="48" font-size="34" text-anchor="middle" font-family="Noto Naskh Arabic, serif" font-weight="700" fill="#1f6fc0">ماء</text><rect x="-34" y="-100" width="16" height="220" rx="8" fill="#fff" opacity=".45"/>`);
  M.clinicSign = C => T(330, 240, 1, `<rect x="-130" y="-130" width="260" height="260" rx="40" fill="#fff" filter="drop-shadow(0 10px 18px rgba(0,0,0,.15))"/><path d="M-36 -96 h72 v60 h60 v72 h-60 v60 h-72 v-60 h-60 v-72 h60z" fill="${C.lg("cross", ["#ff6b6b", "#d62839"])}"/>`) +
      `<g transform="translate(330 470)"><rect x="-150" y="-30" width="300" height="100" rx="20" fill="#18a39a"/><text y="34" text-anchor="middle" font-family="Noto Naskh Arabic, serif" font-size="44" font-weight="700" fill="#fff">عيادة</text></g>`;
  M.stethoscope = C => C.shadow(800, 560, 200) + T(800, 300, 1, `<path d="M-120 -120 v90 q0 120 120 120 q120 0 120 -120 v-90" stroke="${C.lg("st", ["#3a4a6a", "#1d2433"])}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M0 90 v80 q0 80 90 80 q80 0 80 -70" stroke="#1d2433" stroke-width="20" fill="none" stroke-linecap="round"/><circle cx="170" cy="170" r="54" fill="${C.rg("bell", ["#ffffff", "#aab6c8", "#6a7a94"], .35, .3, .8)}"/><circle cx="170" cy="170" r="30" fill="#4a5a78"/>${[-120, 120].map(x => `<circle cx="${x}" cy="-130" r="16" fill="#9aa4b2"/>`).join("")}`);
  M.stethoscopeSmall = C => T(330, 380, .55, M.stethoscope(C).replace(/<ellipse[^>]*>/, ""));
  M.pills = C => T(1030, 470, 1, `<rect x="-60" y="-120" width="120" height="170" rx="20" fill="#ff9f43"/><rect x="-70" y="-150" width="140" height="44" rx="12" fill="#fff"/><rect x="-60" y="-60" width="120" height="60" fill="#fff"/><path d="M-20 -30 h40 M0 -50 v40" stroke="#d62839" stroke-width="10"/><g transform="translate(-120 60) rotate(-30)"><rect x="-40" y="-16" width="80" height="32" rx="16" fill="#fff"/><rect x="0" y="-16" width="40" height="32" rx="16" fill="#18a39a"/></g>`);
  M.hangerShirt = (C, x = 400, y = 220, k = 1) => T(x, y, k, `<path d="M0 -60 q0 -30 20 -30 q20 0 20 20 q0 16 -20 22 L-140 30 h280 L20 -48" stroke="#8a8f99" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-130 40 l-90 70 l50 70 l50 -36 v220 h240 v-220 l50 36 l50 -70 l-90 -70 q-40 30 -90 30 q-50 0 -90 -30z" fill="${C.lg("shirt", ["#5cc8ff", "#1f8ad6"])}"/><path d="M-50 40 q50 50 100 0" stroke="#fff" stroke-width="8" fill="none" opacity=".7"/>`);
  M.kandura = C => C.shadow(860, 570, 120) + T(860, 230, 1, `<path d="M-60 -10 q60 -30 120 0 l90 80 l-40 60 l-40 -30 v350 h-140 v-350 l-40 30 l-40 -60z" fill="${C.lg("kn", ["#ffffff", "#e3e6ee"])}"/><path d="M0 -10 v160" stroke="#c9cfdb" stroke-width="6"/><path d="M0 40 q-6 50 -20 70" stroke="#c9cfdb" stroke-width="4" fill="none"/><path d="M-30 -14 q30 20 60 0" stroke="#c9cfdb" stroke-width="6" fill="none"/>`);
  M.snow = C => T(260, 220, 1, `${[0, 60, 120].map(a => `<path d="M0 -90 V90" stroke="#ffffff" stroke-width="12" stroke-linecap="round" transform="rotate(${a})"/>${[-1, 1].map(s => `<path d="M0 ${s * 55} l-22 ${s * 22} M0 ${s * 55} l22 ${s * 22}" stroke="#fff" stroke-width="10" stroke-linecap="round" transform="rotate(${a})"/>`).join("")}`).join("")}`) + `<g fill="#fff">${[[130, 360], [380, 140], [470, 300], [180, 470]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10"/>`).join("")}</g>`;
  M.sunSmall = C => T(960, 220, 1, `<circle r="80" fill="${C.rg("sun", ["#fff6b0", "#ffcc33", "#ff9f1c"], .4, .35, .8)}"/>${Array.from({ length: 12 }, (_, i) => `<path d="M0 -110 v-34" stroke="#ffb703" stroke-width="12" stroke-linecap="round" transform="rotate(${i * 30})"/>`).join("")}`);
  M.cloudSun = C => M.sunSmall(C).replace("translate(960 220)", "translate(760 220)") + cloud(640, 290, 1.9, 1) + cloud(980, 230, 1.2, .9);
  M.rain = C => `<g stroke="#2a8fd6" stroke-width="8" stroke-linecap="round">${Array.from({ length: 14 }, (_, i) => `<path d="M${520 + (i % 7) * 40} ${380 + Math.floor(i / 7) * 60 + (i % 2) * 20} l-12 30"/>`).join("")}</g>` + `<g transform="translate(300 470)"><path d="M0 0 v100" stroke="#333" stroke-width="8"/><path d="M-120 0 q120 -130 240 0z" fill="#ffd166"/><path d="M-120 0 q30 -20 60 0 q30 -20 60 0 q30 -20 60 0 q30 -20 60 0" fill="none" stroke="#f2a900" stroke-width="4"/></g>`;
  M.clapper = C => C.shadow(450, 560, 180) + T(450, 380, 1, `<rect x="-180" y="-60" width="360" height="230" rx="16" fill="${C.lg("clp", ["#2b2b3a", "#0f0f18"])}"/><g transform="rotate(-14 -180 -60)"><rect x="-180" y="-130" width="360" height="66" rx="10" fill="#1d1d2b"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${-160 + i * 76} -130 l40 0 l-30 66 l-40 0z" fill="#fff"/>`).join("")}</g>${[0, 1, 2, 3, 4].map(i => `<path d="M${-160 + i * 76} -60 l40 0 l-30 50 l-40 0z" fill="#fff"/>`).join("")}<text y="100" text-anchor="middle" font-family="Noto Naskh Arabic, serif" font-size="56" font-weight="700" fill="#fff">فيلمي</text>`);
  M.reel = C => T(900, 250, 1, `<circle r="130" fill="${C.lg("reel", ["#c0c7d6", "#6a7487"])}"/><circle r="30" fill="#2b2b3a"/>${[0, 60, 120, 180, 240, 300].map(a => `<circle cx="0" cy="-78" r="30" fill="#2b2b3a" transform="rotate(${a})"/>`).join("")}<path d="M130 0 q60 140 -40 240 q-80 70 -160 40" stroke="#2b2b3a" stroke-width="40" fill="none"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${110 + i * 4}" y="${40 + i * 30}" width="12" height="10" fill="#fff" opacity=".6"/>`).join("")}`);
  M.popcorn = C => C.shadow(1040, 570, 90) + T(1040, 470, 1, `<g fill="#fff8e1">${[[-50, -110], [0, -130], [50, -110], [-25, -150], [25, -150], [-70, -80], [70, -80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="32"/><circle cx="${x + 10}" cy="${y - 8}" r="14" fill="#ffe08a"/>`).join("")}</g><path d="M-90 -80 h180 l-24 180 h-132z" fill="#fff"/>${[-60, -10, 40].map(x => `<path d="M${x} -80 h28 l-6 180 h-24z" fill="#e53945"/>`).join("")}`);
  M.briefcase = C => C.shadow(640, 560, 170) + T(640, 420, 1, `<rect x="-60" y="-140" width="120" height="70" rx="20" fill="none" stroke="#5a3a1a" stroke-width="20"/><rect x="-190" y="-90" width="380" height="230" rx="26" fill="${C.lg("bc", ["#a8692f", "#6b3e16"])}"/><rect x="-190" y="-10" width="380" height="16" fill="#4a2a0a" opacity=".5"/><rect x="-30" y="-24" width="60" height="44" rx="8" fill="#f2c14e"/>`);
  M.hardhat = C => T(330, 470, 1, `<path d="M-130 30 q0 -150 130 -150 q130 0 130 150z" fill="${C.lg("hh", ["#ffd84a", "#f2a900"])}"/><rect x="-160" y="20" width="320" height="34" rx="16" fill="#f2a900"/><path d="M0 -120 v140" stroke="#fff" stroke-opacity=".5" stroke-width="20"/>`);
  M.fireworks = C => { const { R } = C; let s = ""; [[300, 170, "#ffd166"], [620, 110, "#ff5a8a"], [960, 200, "#6ee7ff"]].forEach(([x, y, c]) => { for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, r1 = 22, r2 = 90 + R() * 30; s += `<path d="M${(x + Math.cos(a) * r1).toFixed(0)} ${(y + Math.sin(a) * r1).toFixed(0)} L${(x + Math.cos(a) * r2).toFixed(0)} ${(y + Math.sin(a) * r2).toFixed(0)}" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity=".9"/><circle cx="${(x + Math.cos(a) * (r2 + 10)).toFixed(0)}" cy="${(y + Math.sin(a) * (r2 + 10)).toFixed(0)}" r="5" fill="${c}"/>`; } s += `<circle cx="${x}" cy="${y}" r="10" fill="#fff"/>`; }); return s; };
  M.lantern = (C, x = 330, y = 230, k = 1) => T(x, y, k, `<path d="M0 -200 v80" stroke="#f2c14e" stroke-width="5"/><circle cx="0" cy="-120" r="16" fill="none" stroke="#f2c14e" stroke-width="6"/><path d="M-50 -100 h100 l20 30 h-140z" fill="#c8961e"/><path d="M-70 -70 h140 q20 110 -10 200 h-120 q-30 -90 -10 -200z" fill="${C.rg("lan", ["#fff3b0", "#ffb703", "#b86a04"], .5, .5, .7)}"/>${[-35, 0, 35].map(x => `<path d="M${x} -70 q${x / 3} 100 0 200" stroke="#7a4a04" stroke-width="5" fill="none"/>`).join("")}<path d="M-60 130 h120 l-20 30 h-80z" fill="#c8961e"/><circle cy="40" r="140" fill="#ffd166" opacity=".14"/>`);
  M.lanternsRow = C => [180, 420, 780, 1020].map((x, i) => M.lantern(C, x, 200 + (i % 2) * 40, .5)).join("") + `<path d="M0 30 Q600 120 1200 20" stroke="#f2c14e" stroke-width="3" fill="none"/>`;
  M.crescent = C => T(900, 170, 1, `<path d="M40 -100 a110 110 0 1 0 0 200 a90 90 0 1 1 0 -200z" fill="${C.lg("cres", ["#fff4c2", "#f2c14e"])}"/><path d="M110 -40 l10 24 26 2 -20 16 6 26 -22 -14 -22 14 6 -26 -20 -16 26 -2z" fill="#fff4c2"/>`);
  M.basket = C => C.shadow(640, 570, 220) + T(640, 440, 1, `<path d="M-180 -40 q180 -230 360 0" stroke="#a8692f" stroke-width="18" fill="none"/>${[[-90, -60, "#7a3a12"], [-20, -80, "#5a2a0a"], [60, -66, "#7a3a12"], [120, -50, "#3f9a4c"], [-140, -40, "#e53945"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="34" ry="44" fill="${c}"/>`).join("")}<path d="M-200 -40 h400 l-40 180 h-320z" fill="${C.lg("bsk", ["#e8b06a", "#a8692f"])}"/>${[-20, 30, 80].map(y => `<path d="M-190 ${y} h380" stroke="#8a5424" stroke-width="6" opacity=".6"/>`).join("")}<rect x="-80" y="0" width="160" height="60" rx="10" fill="#fff"/><text y="44" text-anchor="middle" font-family="Noto Naskh Arabic, serif" font-size="36" font-weight="700" fill="#5a2a0a">رمضان</text>`);
  M.laptop = C => C.shadow(560, 560, 260) + T(560, 400, 1, `<rect x="-220" y="-190" width="440" height="280" rx="18" fill="#1d2433"/><rect x="-200" y="-172" width="400" height="244" rx="8" fill="${C.lg("scr", ["#35d0ff", "#2a5cc0", "#6b3fa0"])}"/><path d="M-260 96 h520 l-30 50 h-460z" fill="#c0c7d6"/>${[0, 1, 2].map(i => `<rect x="-170" y="${-140 + i * 50}" width="${220 - i * 40}" height="22" rx="11" fill="#fff" opacity=".7"/>`).join("")}<circle cx="130" cy="-60" r="40" fill="#fff" opacity=".25"/>`);
  M.phone = (C, x = 900, y = 340, k = 1) => C.shadow(x, y + 220, 100 * k) + T(x, y, k, `<rect x="-110" y="-210" width="220" height="420" rx="36" fill="#11162a"/><rect x="-96" y="-180" width="192" height="360" rx="20" fill="${C.lg("ph", ["#6ee7ff", "#2a5cc0"])}"/><rect x="-30" y="-200" width="60" height="12" rx="6" fill="#2b3150"/>${[0, 1, 2].map(i => `<rect x="${i % 2 ? -10 : -80}" y="${-150 + i * 80}" width="90" height="50" rx="16" fill="${i % 2 ? "#fff" : "#9ff1ff"}"/>`).join("")}`);
  M.wifi = C => T(300, 300, 1, `${[160, 110, 60].map(r => `<path d="M${-r} 0 a${r} ${r} 0 0 1 ${r * 2} 0" stroke="#9ff1ff" stroke-width="22" fill="none" stroke-linecap="round" transform="rotate(-0)"/>`).join("")}<circle cy="30" r="20" fill="#9ff1ff"/>`).replace("translate(300 300)", "translate(260 330)");
  M.chat = C => M.bubble(420, 230, "مرحبا 👋", "#fff", "#2a5cc0", .95) + M.bubble(520, 400, "كيف حالك؟", "#9ff1ff", "#08133a", .85);
  M.plane = C => T(700, 230, 1, `<g transform="rotate(-12)"><path d="M-260 0 q0 -30 40 -30 h360 q80 0 110 30 q-30 30 -110 30 h-360 q-40 0 -40 -30z" fill="${C.lg("pl", ["#ffffff", "#c9d3e6"])}"/><path d="M-40 0 l-60 -150 h50 l110 150z" fill="#1f6fc0"/><path d="M-40 10 l-60 140 h50 l110 -140z" fill="#2a8fd6"/><path d="M-240 -20 l-30 -80 h40 l60 70z" fill="#1f6fc0"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${-150 + i * 34}" cy="-6" r="7" fill="#2a5cc0"/>`).join("")}</g><path d="M-300 70 q-200 40 -400 20" stroke="#fff" stroke-width="6" stroke-dasharray="20 14" fill="none" opacity=".8"/>`);
  M.suitcase = C => C.shadow(330, 570, 120) + T(330, 420, 1, `<rect x="-40" y="-170" width="80" height="50" rx="14" fill="none" stroke="#5a2e10" stroke-width="14"/><rect x="-130" y="-130" width="260" height="280" rx="30" fill="${C.lg("sc", ["#ff7a5c", "#c4361e"])}"/>${[-60, 0, 60].map(x => `<rect x="${x - 8}" y="-130" width="16" height="280" fill="#a32a14" opacity=".5"/>`).join("")}<circle cx="-50" cy="-40" r="26" fill="#ffd166"/><rect x="20" y="20" width="80" height="50" rx="10" fill="#fff" opacity=".9"/>`);
  M.earth = C => M.globe(C, 640, 320, .95);
  M.recycle = C => T(320, 360, 1, `${[0, 120, 240].map(a => `<g transform="rotate(${a})"><path d="M-30 -110 L50 -110 L80 -60" stroke="#2f9b47" stroke-width="30" fill="none" stroke-linejoin="round"/><path d="M60 -90 l50 -10 l-20 60z" fill="#2f9b47"/></g>`).join("")}`);
  M.leaf = C => T(990, 300, 1, `<path d="M0 160 q-160 -120 -60 -300 q120 -60 200 -40 q40 200 -140 340z" fill="${C.lg("lf", ["#9fe08a", "#2f9b47"])}"/><path d="M0 160 q30 -160 110 -300" stroke="#1d6a2e" stroke-width="8" fill="none"/>`);
  M.runner = C => C.shadow(660, 572, 130) + M.person(660, 300, 1.15, C.lg("rn", ["#ff8a5c", "#e0483a"]), "#c98d63", "#2b1a12", `<path d="M-30 200 l-70 80 M30 200 l60 70" stroke="#1d2433" stroke-width="26" stroke-linecap="round"/><path d="M-40 110 l-70 50 M40 110 l70 -40" stroke="#c98d63" stroke-width="20" stroke-linecap="round"/>`);
  M.letterAin = C => T(640, 330, 1, `<circle r="190" fill="#fff" opacity=".85"/><text y="70" text-anchor="middle" font-family="Reem Kufi, sans-serif" font-size="260" font-weight="700" fill="${C.P.accent}">ع</text>`);

  /* -------------------------------------------------------------- public */
  function scene(key, opt = {}) {
    const C = make(key);
    let body = sky(C) + land(C);
    for (const m of C.S.m) { const f = M[m]; if (f) { try { body += f(C); } catch (e) { console.warn("art", m, e); } } }
    const label = opt.label ? ` role="img" aria-label="${String(opt.label).replace(/"/g, "&quot;")}"` : ` aria-hidden="true"`;
    return `<svg class="art-svg" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"${label}><defs>${C.defs.join("")}</defs>${body}</svg>`;
  }
  function theme(key) { const S = SCENES[key] || SCENES.meadow, P = PAL[S.pal]; return { ui: P.ui, accent: P.accent, ink: P.ink, sky: P.sky, glow: P.glow, dark: !!(P.stars) }; }
  function photo(unitId) { return window.ART_PHOTOS.includes(unitId) ? `img/themes/${unitId}.jpg` : ""; }
  return { scene, theme, photo, keys: Object.keys(SCENES) };
})();

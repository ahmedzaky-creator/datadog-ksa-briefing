/* Datadog deck — shared slide helpers.
   DD.data holds every headline number in the deck. Refresh here after each earnings print
   (current values: Q2 FY26, quarter ended 30 Jun 2026; Q3 FY26 reports 4 Nov 2026). */
(function(){
const DD = window.DD = {};

DD.data = {
  asOf: 'Q2 FY26 · quarter ended 30 Jun 2026',
  arr: 4,              // $B, ARR passed $4B (Q1 FY26 call)
  q2Rev: 1.12,         // $B
  q2Growth: 36,        // % YoY
  customers: 33400,
  k100: 4720,          // $100k+ ARR customers
  k100Share: 91,       // % of ARR from $100k+ customers
  k100Growth: 23,      // % YoY
  guideLo: 4.45, guideHi: 4.47, // FY26 revenue guide, $B
  multi: [['2+',85],['4+',58],['6+',37],['8+',22],['10+',13]],
  multi8YearAgo: 14,
  nrr: 'low-120s', grr: 'mid-to-high 90s',
  grossMargin: 80,     // non-GAAP %
  rpo: 3.47, rpoGrowth: 43,
  rdPct: 43,           // GAAP R&D as % of revenue, Q2 FY26
  cash: 5.0,           // $B
  fcfMargin: 25,
  integrations: 1000,
  products: 30,
  aiNative: 750,
  mqYears: 6
};

/* ---------- DOM ---------- */
const NS = 'http://www.w3.org/2000/svg';
DD.el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
DD.ease = t => 1 - Math.pow(1 - t, 3);
DD.rand = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* frame loop; fn(tSeconds) */
DD.loop = fn => { const t0 = performance.now(); const f = now => { fn((now - t0) / 1000); requestAnimationFrame(f); }; requestAnimationFrame(f); };

/* count-up: <span data-count="4720" data-dec="0" data-pre="$" data-post="B" data-delay=".4"> */
DD.count = root => (root || document).querySelectorAll('[data-count]').forEach(e => {
  const to = parseFloat(e.dataset.count), dec = +(e.dataset.dec || 0);
  const pre = e.dataset.pre || '', post = e.dataset.post || '', dur = +(e.dataset.dur || 1.4), delay = +(e.dataset.delay || .2);
  const fmt = v => pre + v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec}) + post;
  e.textContent = fmt(0);
  const t0 = performance.now() + delay * 1000;
  const f = now => { const k = Math.min(1, Math.max(0, (now - t0) / (dur * 1000))); e.textContent = fmt(to * DD.ease(k)); if (k < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
});

/* data-d="n" → animation-delay n × .12s */
DD.stagger = () => document.querySelectorAll('[data-d]').forEach(e => e.style.animationDelay = (+e.dataset.d * .12) + 's');

/* dot field backdrop on an absolutely-positioned svg */
DD.dots = (o = {}) => {
  const {x = 640, y = 0, w = 640, h = 720, gap = 18, r = 1.6, seed = 3, color = '#632CA6', max = .55} = o;
  const svg = DD.el('svg', {width: w, height: h, viewBox: `0 0 ${w} ${h}`, style: `position:absolute;left:${x}px;top:${y}px;z-index:0;pointer-events:none`});
  document.body.appendChild(svg);
  const rnd = DD.rand(seed), blobs = Array.from({length: 5}, () => [rnd() * w, rnd() * h, 120 + rnd() * 200]);
  const pts = [];
  for (let i = gap / 2; i < w; i += gap) for (let j = gap / 2; j < h; j += gap) {
    let v = 0; blobs.forEach(([bx, by, br]) => { const d = Math.hypot(i - bx, j - by); v = Math.max(v, 1 - d / br); });
    if (v > .05) pts.push([DD.el('circle', {cx: i, cy: j, r: r, fill: color, opacity: 0}, svg), v, rnd()]);
  }
  DD.loop(t => pts.forEach(([c, v, p]) => c.setAttribute('opacity', (Math.min(1, t * 1.2 - p * .6) > 0 ? max * v * (.65 + .35 * Math.sin(t * 1.3 + p * 9)) : 0).toFixed(3))));
  return svg;
};

/* ---------- isometric scene ----------
   const sc = DD.iso(svg, {ox, oy, s}); sc.box({x,y,z,w,d,h,c,delay,float}); sc.label({...}); */
const PAL = {
  purple: ['#8A55D0', '#632CA6', '#4B1F82'],
  violet: ['#C9B2F2', '#A47CE8', '#8460C9'],
  ink:    ['#4A3A6A', '#2E2148', '#1F1533'],
  slate:  ['#F1EEF6', '#DCD5E8', '#C6BDD8'],
  teal:   ['#7BEBD6', '#2FD3B5', '#1FA88F'],
  amber:  ['#FFD27A', '#FFB52E', '#D9921A'],
  glass:  ['rgba(201,178,242,.22)', 'rgba(164,124,232,.16)', 'rgba(99,44,166,.12)']
};
DD.iso = (svg, o = {}) => {
  const ox = o.ox || 300, oy = o.oy || 300, s = o.s || 1, c30 = Math.cos(Math.PI / 6), s30 = .5;
  const P = (x, y, z = 0) => [ox + (x - y) * c30 * s, oy + (x + y) * s30 * s - z * s];
  const pts = a => a.map(p => p.join(',')).join(' ');
  const items = [];
  const api = {P,
    box(b) {
      const {x = 0, y = 0, z = 0, w = 40, d = 40, h = 40, c = 'purple', delay = 0, drop = 80, float = 0, floatSpeed = 1, stroke = 'rgba(23,11,43,.18)', wire = false} = b;
      const [top, left, right] = PAL[c] || PAL.purple;
      const g = DD.el('g', {opacity: 0}, svg);
      const T = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
      const L = [P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)];
      const R = [P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)];
      const sw = wire ? 1.2 : .8, dash = wire ? '4 3' : '';
      DD.el('polygon', {points: pts(L), fill: left, stroke, 'stroke-width': sw, 'stroke-dasharray': dash}, g);
      DD.el('polygon', {points: pts(R), fill: right, stroke, 'stroke-width': sw, 'stroke-dasharray': dash}, g);
      DD.el('polygon', {points: pts(T), fill: top, stroke, 'stroke-width': sw, 'stroke-dasharray': dash}, g);
      items.push({g, delay, drop, float, floatSpeed});
      return {g};
    },
    label(l) {
      const {at, side = 'r', len = 50, title, sub, delay = 0, dark = false} = l;
      const [ax, ay] = P(...at), dx = side === 'r' ? len : -len;
      const g = DD.el('g', {opacity: 0}, svg);
      const col = dark ? 'rgba(255,255,255,.55)' : '#A39DB5';
      DD.el('circle', {cx: ax, cy: ay, r: 3, fill: dark ? '#C9B2F2' : '#632CA6'}, g);
      DD.el('line', {x1: ax, y1: ay, x2: ax + dx, y2: ay, stroke: col, 'stroke-width': 1}, g);
      const anchor = side === 'r' ? 'start' : 'end', tx = ax + dx + (side === 'r' ? 8 : -8);
      const t = DD.el('text', {x: tx, y: ay + 4, 'text-anchor': anchor, fill: dark ? '#fff' : '#170B2B', style: 'font:600 14px Inter,sans-serif'}, g); t.textContent = title;
      [].concat(sub || []).forEach((sl, i) => { const u = DD.el('text', {x: tx, y: ay + 22 + i * 15, 'text-anchor': anchor, fill: dark ? 'rgba(255,255,255,.55)' : '#6E6784', style: 'font:400 11px "JetBrains Mono",monospace'}, g); u.textContent = sl; });
      items.push({g, delay, drop: 0, float: 0, label: true});
    },
    run() {
      DD.loop(t => items.forEach(it => {
        const k = Math.min(1, Math.max(0, (t - it.delay) / .7)), e = DD.ease(k);
        const fy = it.float && t > it.delay + .7 ? Math.sin((t - it.delay) * it.floatSpeed * 1.6) * it.float : 0;
        it.g.setAttribute('opacity', e.toFixed(3));
        it.g.setAttribute('transform', `translate(0,${(-(1 - e) * it.drop + fy).toFixed(2)})`);
      }));
    }
  };
  return api;
};

/* particles travelling along svg paths: DD.flow(svg, [pathEl...], {n, r, color, speed}) */
DD.flow = (svg, paths, o = {}) => {
  const {n = 4, r = 3, color = '#632CA6', speed = .35, delay = .8} = o;
  const dots = [];
  paths.forEach((p, pi) => {
    const len = p.getTotalLength();
    for (let i = 0; i < n; i++) dots.push({p, len, off: i / n + pi * .13, c: DD.el('circle', {r, fill: [].concat(color)[pi % [].concat(color).length], opacity: 0}, svg)});
  });
  DD.loop(t => { if (t < delay) return; dots.forEach(d => {
    const k = ((t - delay) * speed + d.off) % 1, pt = d.p.getPointAtLength(k * d.len);
    d.c.setAttribute('cx', pt.x); d.c.setAttribute('cy', pt.y);
    d.c.setAttribute('opacity', (Math.sin(k * Math.PI) * .95).toFixed(2));
  }); });
};

/* jump to another slide by file name (no-op when opened standalone) */
DD.go = file => { if (window.parent !== window) parent.postMessage({type: 'goto', file}, '*'); else location.href = file; };

/* path "draw-on": sets --len so .draw animates the stroke */
DD.drawOn = root => (root || document).querySelectorAll('.draw').forEach(p => { if (p.getTotalLength) p.style.setProperty('--len', Math.ceil(p.getTotalLength())); });

/* persona chips from <body data-who="exec,cio,..."> */
const WHO = {exec: 'Executives', cio: 'CIO / CTO', ciso: 'CISO', sre: 'SRE & Platform', dev: 'Developers', digital: 'Digital & Product'};
const addWho = () => {
  const w = document.body.dataset.who; if (!w) return;
  const d = document.createElement('div'); d.className = 'who';
  d.innerHTML = w.split(',').map((k, i) => `<span class="${k}" style="animation-delay:${.5 + i * .07}s">${WHO[k] || k}</span>`).join('');
  document.body.appendChild(d);
};

/* ---------- footer ---------- */
const addFoot = () => {
  if (document.body.dataset.nofoot !== undefined) return;
  const f = document.createElement('div'); f.className = 'foot';
  f.innerHTML = `<span class="wm"><i></i>Competitive briefing · third-party analysis, not affiliated with Datadog</span><span>${document.body.dataset.foot || ''}</span>`;
  document.body.appendChild(f);
};

/* ---------- shell bridge ----------
   The shell (index.html) drives density and steps over postMessage; keys pressed inside the
   slide are forwarded so the shell's shortcuts keep working after a click in the slide. */
DD.steps = 0; DD.onStep = null;
const setStep = i => {
  document.querySelectorAll('[data-step]').forEach(e => e.classList.toggle('on', +e.dataset.step <= i));
  if (DD.onStep) DD.onStep(i);
};
window.addEventListener('message', e => {
  const m = e.data || {};
  if (m.type === 'density') document.documentElement.dataset.density = m.v;
  if (m.type === 'step') setStep(m.i);
});
document.addEventListener('keydown', e => {
  if (window.parent !== window) { parent.postMessage({type: 'key', key: e.key, shift: e.shiftKey, meta: e.metaKey || e.ctrlKey}, '*'); e.preventDefault(); }
});
document.addEventListener('DOMContentLoaded', () => {
  DD.stagger(); addFoot(); addWho(); DD.count(); DD.drawOn();
  const n = Math.max(0, ...[...document.querySelectorAll('[data-step]')].map(e => +e.dataset.step));
  DD.steps = +(document.body.dataset.steps || n);
  if (window.parent !== window) parent.postMessage({type: 'ready', steps: DD.steps}, '*');
  else if (DD.steps) { let i = 0; setStep(0); document.addEventListener('keydown', e => { if (e.key === 'ArrowRight') setStep(++i); if (e.key === 'ArrowLeft') setStep(i = Math.max(0, i - 1)); }); }
});
})();

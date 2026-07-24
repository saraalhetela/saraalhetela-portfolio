/* ═══════════════════════════════════════════════════
   HERO CANVAS — animated neural-network node field
═══════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes, animId;

  const ACCENT    = '139,154,113';
  const ACCENT2   = '195,205,173';
  const NODE_COUNT = 55;
  const MAX_DIST   = 160;
  const SPEED      = 0.28;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeNode() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.8 + 0.8,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy; n.pulse += 0.018;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${ACCENT},${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      const pulse = 0.5 + 0.5 * Math.sin(n.pulse);
      const alpha = 0.35 + pulse * 0.45;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + pulse * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT2},${alpha})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { cancelAnimationFrame(animId); init(); draw(); });
  init(); draw();
})();

/* ═══════════════════════════════════════════════════
   SCROLL-AWAY SHRINK — shared by project cards and now
   every other section, so the whole site shares one motion
   language. Each element's scale/opacity is a continuous
   function of how far its top has scrolled past the viewport
   top — reversible and jitter-free by construction (no phases,
   no "release"). Offsets/heights are measured once (not
   mid-scroll) to avoid forcing layout reflow every frame.
═══════════════════════════════════════════════════ */
function makeScrollShrink(els, { minScale = 0.9, minOpacity = 0.6, distanceFrac = 0.85 } = {}) {
  els = Array.isArray(els) ? els : Array.from(els);
  if (!els.length) return;

  els.forEach(el => {
    el.style.willChange = 'transform, opacity';
    el.style.transformOrigin = 'top center';
    el.style.backfaceVisibility = 'hidden';
  });

  function naturalDocTop(el) {
    let top = 0, node = el;
    while (node) { top += node.offsetTop || 0; node = node.offsetParent; }
    return top;
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  let tops = [], heights = [];

  function measure() {
    tops = els.map(naturalDocTop);
    heights = els.map(e => e.offsetHeight);
  }

  function update() {
    const sy = window.scrollY;
    els.forEach((el, i) => {
      const top = tops[i];
      const h = heights[i] || 400;
      const past = sy - top;
      const progress = clamp01(past / (h * distanceFrac));
      const scale = 1 - progress * (1 - minScale);
      const opacity = 1 - progress * (1 - minOpacity);
      el.style.transform = `scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }

  function onResize() { measure(); update(); }

  measure();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onResize);
}

// Project cards — the original, more pronounced version
makeScrollShrink(document.querySelectorAll('#projects .project-card'), {
  minScale: 0.88, minOpacity: 0.55, distanceFrac: 0.85
});

// Every other section — same idea, gentler, applied at the section level
const otherSectionInners = Array.from(document.querySelectorAll('.section-inner'))
  .filter(el => !el.closest('#projects'));
makeScrollShrink(otherSectionInners, { minScale: 0.94, minOpacity: 0.78, distanceFrac: 1.0 });
makeScrollShrink(document.querySelectorAll('.metrics-section'), { minScale: 0.94, minOpacity: 0.78, distanceFrac: 1.0 });


/* ═══════════════════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
═══════════════════════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

// Trigger pipeline + chart when projects section enters view
const projectsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      startPipeline();
      drawTradingChart();
      startGpuCluster();
      projectsObs.unobserve(e.target);
    }
  });
}, { threshold: 0.05 });
const projectsSection = document.getElementById('projects');
if (projectsSection) projectsObs.observe(projectsSection);

// Also observe metrics section for counters
const metricsObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounters(); metricsObs.unobserve(e.target); }
  });
}, { threshold: 0.1 });
const metricsEl = document.querySelector('.metrics-section');
if (metricsEl) metricsObs.observe(metricsEl);

/* ═══════════════════════════════════════════════════
   COUNTERS
═══════════════════════════════════════════════════ */
let countersFired = false;
function animateCounters() {
  if (countersFired) return; countersFired = true;
  document.querySelectorAll('.counter-val').forEach(counter => {
    const target = parseFloat(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    const isFloat = String(target).includes('.');
    const steps = 40; const inc = target / steps;
    let cur = 0; let step = 0;
    const iv = setInterval(() => {
      step++; cur = Math.min(cur + inc, target);
      counter.innerText = (isFloat ? cur.toFixed(1) : Math.ceil(cur)) + (step >= steps ? suffix : '');
      if (step >= steps) clearInterval(iv);
    }, 40);
  });
}

/* ═══════════════════════════════════════════════════
   PIPELINE ANIMATION
═══════════════════════════════════════════════════ */
let pipelineFired = false;
function startPipeline() {
  if (pipelineFired) return; pipelineFired = true;
  const steps = [0,1,2,3,4];
  let i = 0;
  function activateNext() {
    if (i > 0) {
      document.getElementById('pp'+(i-1)).classList.remove('active');
      document.getElementById('pp'+(i-1)).classList.add('done');
    }
    if (i < steps.length) {
      document.getElementById('pp'+i).classList.add('active');
      i++;
      setTimeout(activateNext, 800);
    } else {
      document.getElementById('ppAccVal').innerText = '99.5%';
      setTimeout(() => {
        steps.forEach(s => { document.getElementById('pp'+s).classList.remove('active','done'); });
        document.getElementById('ppAccVal').innerText = '—';
        i = 0;
        setTimeout(() => { pipelineFired = false; startPipeline(); }, 1200);
      }, 3000);
    }
  }
  activateNext();
}

/* ═══════════════════════════════════════════════════
   TRADING CHART
═══════════════════════════════════════════════════ */
let chartFired = false;
function drawTradingChart() {
  if (chartFired) return; chartFired = true;
  const c = document.getElementById('tradingCanvas');
  if (!c) return;
  const parent = c.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const cssW = parent.offsetWidth, cssH = parent.offsetHeight;
  c.width = cssW * dpr; c.height = cssH * dpr;
  c.style.width = cssW + 'px'; c.style.height = cssH + 'px';
  const cx = c.getContext('2d');
  cx.scale(dpr, dpr);
  const W = cssW, H = cssH;

  const rawProfit = [
    0,0,0,0.3,0.3,5.6,5.6,5.6,7.4,7.4,7.4,7.4,7.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,
    5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,
    5.6,5.6,5.6,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,
    3.1,3.1,9.6,9.6,9.6,9.7,9.7,10.1,10.1,10.1,13.6,13.6,14.6,14.6,15.0,15.0,15.0,15.0,15.0,15.0,
    15.0,15.0,15.0,18.4,18.4,18.4,18.4,18.4,18.4,18.4,18.4,18.4,18.4,18.4,18.4,18.4,19.7,18.5,18.4,18.4,
    18.4,18.4,18.4,18.4,18.4,18.4,18.4,18.4,21.0,21.0,20.9,20.9,20.9,20.9,20.9,22.0,22.0,22.0,22.0,22.0,
    22.0,18.2,18.2,18.2,18.2,18.2,18.2,18.2
  ];
  const pts = rawProfit.length;
  const pad = { top: 28, right: 20, bottom: 36, left: 48 };
  const cW = W - pad.left - pad.right, cH = H - pad.top - pad.bottom;
  const profMin = 0, profMax = 25;
  function px(i) { return pad.left + (i / (pts - 1)) * cW; }
  function py(v) { return pad.top + cH - ((v - profMin) / (profMax - profMin)) * cH; }

  cx.clearRect(0, 0, W, H);
  cx.fillStyle = '#0c0d0b'; cx.fillRect(0, 0, W, H);

  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * cH;
    const val = Math.round(profMax - (i / 4) * (profMax - profMin));
    cx.beginPath(); cx.strokeStyle = 'rgba(251,250,245,0.08)'; cx.lineWidth = 1;
    cx.moveTo(pad.left, y); cx.lineTo(pad.left + cW, y); cx.stroke();
    cx.fillStyle = 'rgba(251,250,245,0.4)'; cx.font = '10px monospace';
    cx.textAlign = 'right'; cx.fillText(val + '%', pad.left - 6, y + 3);
  }
  [0, 20, 40, 60, 80, 100, 120].forEach(v => {
    const i = Math.round((v / 138) * (pts - 1));
    cx.fillStyle = 'rgba(251,250,245,0.4)'; cx.font = '10px monospace';
    cx.textAlign = 'center'; cx.fillText(v, px(i), H - 8);
  });

  const bhY = py(3.85);
  cx.beginPath(); cx.setLineDash([4, 4]);
  cx.strokeStyle = 'rgba(248,113,113,0.6)'; cx.lineWidth = 1.2;
  cx.moveTo(pad.left, bhY); cx.lineTo(pad.left + cW, bhY); cx.stroke();
  cx.setLineDash([]);
  cx.fillStyle = 'rgba(248,113,113,0.8)'; cx.font = '9px monospace';
  cx.textAlign = 'left'; cx.fillText('Buy & Hold 3.8%', pad.left + 4, bhY - 4);

  const grad = cx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0, 'rgba(139,154,113,0.18)');
  grad.addColorStop(1, 'rgba(139,154,113,0)');
  cx.beginPath(); cx.moveTo(px(0), py(rawProfit[0]));
  for (let i = 1; i < pts; i++) cx.lineTo(px(i), py(rawProfit[i]));
  cx.lineTo(px(pts-1), pad.top+cH); cx.lineTo(px(0), pad.top+cH);
  cx.closePath(); cx.fillStyle = grad; cx.fill();

  cx.beginPath(); cx.moveTo(px(0), py(rawProfit[0]));
  for (let i = 1; i < pts; i++) cx.lineTo(px(i), py(rawProfit[i]));
  cx.strokeStyle = '#8B9A71'; cx.lineWidth = 1.5; cx.lineJoin = 'round'; cx.stroke();

  const lastX = px(pts-1), lastY = py(rawProfit[pts-1]);
  cx.beginPath(); cx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  cx.fillStyle = '#8B9A71'; cx.fill();
  cx.strokeStyle = '#0c0d0b'; cx.lineWidth = 1.5; cx.stroke();
  cx.fillStyle = '#8B9A71'; cx.font = '600 11px monospace';
  cx.textAlign = 'right'; cx.fillText('+18.2%', lastX - 8, lastY - 10);
  cx.fillStyle = 'rgba(251,250,245,0.42)'; cx.font = '10px monospace';
  cx.textAlign = 'left'; cx.fillText('Test Set: Cumulative Reward vs Buy & Hold', pad.left, 16);
}
window.addEventListener('resize', () => { chartFired = false; drawTradingChart(); });

/* ═══════════════════════════════════════════════════
   GPU CLUSTER SCHEDULER — DUAL-RING COMPARISON
═══════════════════════════════════════════════════ */
let gpuFired = false;
function startGpuCluster() {
  if (gpuFired) return; gpuFired = true;

  const agentArc = document.getElementById('agentArc');
  const baseArc = document.getElementById('baseArc');
  const agentPct = document.getElementById('agentPct');
  const basePct = document.getElementById('basePct');
  const agentCost = document.getElementById('agentCost');
  const baseCost = document.getElementById('baseCost');
  const savedVal = document.getElementById('gpuSavedVal');
  if (!agentArc || !baseArc) return;

  const CIRCUMFERENCE = 389.6;
  const AGENT_SUCCESS = 87.0;
  const BASE_SUCCESS = 70.0;
  const AGENT_COST = 584.62;
  const BASE_COST = 626.11;
  const SAVED = BASE_COST - AGENT_COST;

  function animateArc(el, target) {
    el.style.strokeDashoffset = CIRCUMFERENCE - (target / 100) * CIRCUMFERENCE;
  }
  function animateNum(el, target, fmt, duration) {
    const steps = 40, inc = target / steps, interval = duration / steps;
    let cur = 0;
    const iv = setInterval(() => {
      cur = Math.min(cur + inc, target);
      el.textContent = fmt(cur);
      if (cur >= target) clearInterval(iv);
    }, interval);
  }

  animateArc(agentArc, AGENT_SUCCESS);
  animateArc(baseArc, BASE_SUCCESS);
  animateNum(agentPct, AGENT_SUCCESS, v => Math.round(v) + '%', 1200);
  animateNum(basePct, BASE_SUCCESS, v => Math.round(v) + '%', 1200);
  animateNum(agentCost, AGENT_COST, v => '$' + v.toFixed(2), 1400);
  animateNum(baseCost, BASE_COST, v => '$' + v.toFixed(2), 1400);
  animateNum(savedVal, SAVED, v => '$' + v.toFixed(2), 1600);
}

/* ═══════════════════════════════════════════════════
   EMAILJS
═══════════════════════════════════════════════════ */
if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: 'Mw90fut9b6KqLmFHz' });
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('contactForm').addEventListener('submit', submitForm);
});
function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const originalText = btn.innerText;
  if (typeof emailjs === 'undefined') {
    btn.innerText = 'Preview mode — form disabled';
    setTimeout(() => { btn.innerText = originalText; }, 2200);
    return;
  }
  btn.disabled = true; btn.innerText = 'Sending...';
  emailjs.send('service_0jkfvtw','template_kprmpn7',{
    name: document.getElementById('senderName').value,
    email: document.getElementById('senderEmail').value,
    message: document.getElementById('senderMessage').value
  }).then(() => {
    btn.innerText = '✓ Message Sent!'; btn.style.background = '#55794a';
    document.getElementById('contactForm').reset();
    setTimeout(() => { btn.disabled = false; btn.innerText = originalText; btn.style.background = ''; }, 4000);
  }).catch(err => {
    console.error('EmailJS Error:', err);
    alert('Sorry, your message couldn\'t be sent. Please try again.');
    btn.disabled = false; btn.innerText = originalText; btn.style.background = '';
  });
}

/* ═══════════════════════════════════════════════════
   TYPEWRITER
═══════════════════════════════════════════════════ */
var TxtType = function(el, toRotate, period) {
  this.toRotate = toRotate; this.el = el;
  this.loopNum = 0; this.period = parseInt(period, 10) || 2000;
  this.txt = ''; this.isDeleting = false; this.tick();
};
TxtType.prototype.tick = function() {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];
  this.txt = this.isDeleting
    ? fullTxt.substring(0, this.txt.length - 1)
    : fullTxt.substring(0, this.txt.length + 1);
  this.el.querySelector('.wrap').textContent = this.txt;
  let delta = 25;
  if (!this.isDeleting && this.txt === fullTxt) { delta = this.period; this.isDeleting = true; }
  else if (this.isDeleting && this.txt === '') { this.isDeleting = false; this.loopNum++; delta = 500; }
  setTimeout(() => this.tick(), delta);
};
window.addEventListener('load', () => {
  document.querySelectorAll('.typewrite').forEach(el => {
    const toRotate = el.getAttribute('data-type');
    const period   = el.getAttribute('data-period');
    if (toRotate) new TxtType(el, JSON.parse(toRotate), period);
  });
});

/* ═══════════════════════════════════════════════════
   NAV SCROLL STATE
═══════════════════════════════════════════════════ */
const navEl = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ═══════════════════════════════════════════════════
   MAGNETIC BUTTONS
═══════════════════════════════════════════════════ */
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width  / 2;
    const y = e.clientY - r.top  - r.height / 2;
    btn.style.transform = `translate(${x * 0.16}px, ${y * 0.3}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

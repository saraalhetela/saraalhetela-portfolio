// ── MATRIX RAIN ─────────────────────────────────────────────────────────
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
let cols, drops, speeds;
function setupCanvas() {
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / 15);
  drops = Array(cols).fill(0).map(() => Math.random() * -30);
  speeds = Array(cols).fill(0).map(() => 1 + Math.random() * 2);
}
setupCanvas(); window.addEventListener('resize', setupCanvas);
function stream() {
  ctx.fillStyle = 'rgba(6,9,19,0.16)'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.font = '13px monospace';
  for (let i = 0; i < drops.length; i++) {
    const char = Math.random() > 0.5 ? '1' : '0';
    const x = i*15, y = drops[i]*15;
    ctx.fillStyle = drops[i] < 5 ? '#ffffff' : '#38bdf8';
    ctx.fillText(char, x, y);
    if (y > canvas.height && Math.random() > 0.98) { drops[i]=0; speeds[i]=1+Math.random()*2; }
    drops[i] += speeds[i] * 0.35;
  }
}
setInterval(stream, 33);



// ── MOBILE NAV TOGGLE ────────────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ── SCROLL REVEAL ───────────────────────────────────────────────────────
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      if (e.target.id === 'projects') { animateCounters(); startPipeline(); drawTradingChart(); }
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('section').forEach(s => obs.observe(s));

// ── COUNTERS ─────────────────────────────────────────────────────────────
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

// ── PIPELINE ANIMATION ───────────────────────────────────────────────────
function startPipeline() {
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
        steps.forEach(s => {
          document.getElementById('pp'+s).classList.remove('active','done');
        });
        document.getElementById('ppAccVal').innerText = '—';
        i = 0;
        setTimeout(startPipeline, 1200);
      }, 3000);
    }
  }
  activateNext();
}

// ── TRADING CHART ────────────────────────────────────────────────────────
function drawTradingChart() {
  const c = document.getElementById('tradingCanvas');
  if (!c) return;
    const parent = c.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const cssW = parent.offsetWidth;
    const cssH = parent.offsetHeight;
    c.width = cssW * dpr;
    c.height = cssH * dpr;
    c.style.width = cssW + 'px';
    c.style.height = cssH + 'px';
    const cx = c.getContext('2d');
    cx.scale(dpr, dpr);
    const W = cssW;
    const H = cssH;
  // Real test-set cumulative reward curve shape (held-out data, 138 steps)
  // Staircase pattern: flat while holding, jumps on profitable closes
  const rawProfit = [
    0,0,0,0.3,0.3,5.6,5.6,5.6,7.4,7.4,
    7.4,7.4,7.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,
    5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,
    5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,5.6,
    5.6,5.6,5.6,3.1,3.1,3.1,3.1,3.1,3.1,3.1,
    3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,3.1,
    3.1,3.1,9.6,9.6,9.6,9.7,9.7,10.1,10.1,10.1,
    13.6,13.6,14.6,14.6,15.0,15.0,15.0,15.0,15.0,15.0,
    15.0,15.0,15.0,18.4,18.4,18.4,18.4,18.4,18.4,18.4,
    18.4,18.4,18.4,18.4,18.4,18.4,19.7,18.5,18.4,18.4,
    18.4,18.4,18.4,18.4,18.4,18.4,18.4,18.4,21.0,21.0,
    20.9,20.9,20.9,20.9,20.9,22.0,22.0,22.0,22.0,22.0,
    22.0,18.2,18.2,18.2,18.2,18.2,18.2,18.2
  ];
  const pts = rawProfit.length;
  const pad = { top: 28, right: 20, bottom: 36, left: 48 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const profMin = 0;
  const profMax = 25;
  function px(i) { return pad.left + (i / (pts - 1)) * cW; }
  function py(v) { return pad.top + cH - ((v - profMin) / (profMax - profMin)) * cH; }
  cx.clearRect(0, 0, W, H);
  // Background
  cx.fillStyle = '#030711';
  cx.fillRect(0, 0, W, H);
  // Grid lines
  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const y = pad.top + (i / gridCount) * cH;
    const val = Math.round(profMax - (i / gridCount) * (profMax - profMin));
    cx.beginPath();
    cx.strokeStyle = 'rgba(255,255,255,0.05)';
    cx.lineWidth = 1;
    cx.moveTo(pad.left, y);
    cx.lineTo(pad.left + cW, y);
    cx.stroke();
    cx.fillStyle = 'rgba(148,163,184,0.5)';
    cx.font = '10px monospace';
    cx.textAlign = 'right';
    cx.fillText(val + '%', pad.left - 6, y + 3);
  }
  // X axis labels (test steps, 0–138)
  const xLabels = [0, 20, 40, 60, 80, 100, 120];
  xLabels.forEach(v => {
    const i = Math.round((v / 138) * (pts - 1));
    const x = px(i);
    cx.fillStyle = 'rgba(148,163,184,0.5)';
    cx.font = '10px monospace';
    cx.textAlign = 'center';
    cx.fillText(v, x, H - 8);
  });
  // Buy & hold reference line (3.85%)
  const bhY = py(3.85);
  cx.beginPath();
  cx.setLineDash([4, 4]);
  cx.strokeStyle = 'rgba(248,113,113,0.6)';
  cx.lineWidth = 1.2;
  cx.moveTo(pad.left, bhY);
  cx.lineTo(pad.left + cW, bhY);
  cx.stroke();
  cx.setLineDash([]);
  cx.fillStyle = 'rgba(248,113,113,0.8)';
  cx.font = '9px monospace';
  cx.textAlign = 'left';
  cx.fillText('Buy & Hold 3.8%', pad.left + 4, bhY - 4);
  // Profit area fill
  const grad = cx.createLinearGradient(0, pad.top, 0, pad.top + cH);
  grad.addColorStop(0, 'rgba(56,189,248,0.18)');
  grad.addColorStop(1, 'rgba(56,189,248,0)');
  cx.beginPath();
  cx.moveTo(px(0), py(rawProfit[0]));
  for (let i = 1; i < pts; i++) cx.lineTo(px(i), py(rawProfit[i]));
  cx.lineTo(px(pts - 1), pad.top + cH);
  cx.lineTo(px(0), pad.top + cH);
  cx.closePath();
  cx.fillStyle = grad;
  cx.fill();
  // Profit line
  cx.beginPath();
  cx.moveTo(px(0), py(rawProfit[0]));
  for (let i = 1; i < pts; i++) cx.lineTo(px(i), py(rawProfit[i]));
  cx.strokeStyle = '#38bdf8';
  cx.lineWidth = 1.5;
  cx.lineJoin = 'round';
  cx.stroke();
  // Final value marker
  const lastIdx = pts - 1;
  const lastX = px(lastIdx);
  const lastY = py(rawProfit[lastIdx]);
  cx.beginPath();
  cx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  cx.fillStyle = '#38bdf8';
  cx.fill();
  cx.strokeStyle = '#030711';
  cx.lineWidth = 1.5;
  cx.stroke();
  // Final value label
  cx.fillStyle = '#38bdf8';
  cx.font = '600 11px monospace';
  cx.textAlign = 'right';
  cx.fillText('+18.2%', lastX - 8, lastY - 10);
  // Chart title
  cx.fillStyle = 'rgba(148,163,184,0.6)';
  cx.font = '10px monospace';
  cx.textAlign = 'left';
  cx.fillText('Test Set: Cumulative Reward vs Buy & Hold', pad.left, 16);
}
window.addEventListener('resize', drawTradingChart);

// ── IMPORTING EMAILJS ────────────────────────────────────────────────────────
emailjs.init({
    publicKey: "Mw90fut9b6KqLmFHz"
});
// ── CONTACT FORM ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("contactForm")
        .addEventListener("submit", submitForm);
});

function submitForm(e) {
    e.preventDefault();

    const btn = document.getElementById("submitBtn");
    const originalText = btn.innerText;

    btn.disabled = true;
    btn.innerText = "Sending...";

    emailjs.send(
        "service_0jkfvtw",
        "template_kprmpn7",
        {
            name: document.getElementById("senderName").value,
            email: document.getElementById("senderEmail").value,
            message: document.getElementById("senderMessage").value
        }
    )
    .then(() => {
        btn.innerText = "✓ Message Sent!";
        btn.style.background = "#10b981";

        document.getElementById("contactForm").reset();

        setTimeout(() => {
            btn.disabled = false;
            btn.innerText = originalText;
            btn.style.background = "";
        }, 4000);
    })
    .catch((error) => {
        console.error("EmailJS Error:", error);

        alert("Sorry, your message couldn't be sent. Please try again.");

        btn.disabled = false;
        btn.innerText = originalText;
        btn.style.background = "";
    });
}
// ── Typewriter Effect ─────────────────────────────────────────────────────────
var TxtType = function(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.isDeleting = false;
    this.tick();
};

TxtType.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];

    if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.querySelector('.wrap').textContent = this.txt;

    let delta = this.isDeleting ? 25 : 25;

    if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
    }

    setTimeout(() => this.tick(), delta);
};

window.addEventListener('load', () => {
    const elements = document.getElementsByClassName('typewrite');

    for (let i = 0; i < elements.length; i++) {
        const toRotate = elements[i].getAttribute('data-type');
        const period = elements[i].getAttribute('data-period');

        if (toRotate) {
            new TxtType(
                elements[i],
                JSON.parse(toRotate),
                period
            );
        }
    }
});

// -- CERT TABS
function switchCertTab(btn, panelId) {
  document.querySelectorAll(".cert-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".cert-panel").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(panelId).classList.add("active");
}

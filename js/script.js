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
      document.getElementById('ppAccVal').innerText = '99.4%';
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
  c.width = parent.offsetWidth;
  c.height = parent.offsetHeight;
  const cx = c.getContext('2d');
  const W = c.width, H = c.height;

  // Real profit curve shape from your results plot (870% peak, upward trend)
  const rawProfit = [
    100,230,160,250,200,170,220,180,110,100,
    200,190,260,280,220,210,230,300,250,220,
    210,230,220,300,310,290,400,380,460,420,
    390,460,400,380,430,410,390,450,470,420,
    440,510,480,430,490,540,520,500,550,530,
    480,510,490,560,540,510,560,480,510,540,
    590,620,600,660,640,680,720,660,640,650,
    600,580,420,560,540,640,810,850,660,800,
    830,860,840,850,870,820,860,840,750,700,
    860,830,700,320,700,870,840,810,750,870
  ];

  const pts = rawProfit.length;
  const pad = { top: 28, right: 20, bottom: 36, left: 48 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;

  const profMin = 0;
  const profMax = 950;

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

  // X axis labels
  const xLabels = [0, 25, 50, 75, 100, 125, 150, 175];
  xLabels.forEach(v => {
    const i = Math.round((v / 175) * (pts - 1));
    const x = px(i);
    cx.fillStyle = 'rgba(148,163,184,0.5)';
    cx.font = '10px monospace';
    cx.textAlign = 'center';
    cx.fillText(v, x, H - 8);
  });

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

  // Peak marker
  const peakIdx = rawProfit.indexOf(Math.max(...rawProfit));
  const peakX = px(peakIdx);
  const peakY = py(Math.max(...rawProfit));
  cx.beginPath();
  cx.arc(peakX, peakY, 4, 0, Math.PI * 2);
  cx.fillStyle = '#38bdf8';
  cx.fill();
  cx.strokeStyle = '#030711';
  cx.lineWidth = 1.5;
  cx.stroke();

  // Peak label
  cx.fillStyle = '#38bdf8';
  cx.font = '600 11px monospace';
  cx.textAlign = 'center';
  cx.fillText('+870%', peakX, peakY - 10);

  // Chart title
  cx.fillStyle = 'rgba(148,163,184,0.6)';
  cx.font = '10px monospace';
  cx.textAlign = 'left';
  cx.fillText('Cumulative Profit (%)', pad.left, 16);
}
window.addEventListener('resize', drawTradingChart);


// ── CONTACT FORM ─────────────────────────────────────────────────────────
function submitForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const orig = btn.innerText;
  btn.disabled = true; btn.innerText = 'Sending...';
  setTimeout(() => {
    btn.innerText = '✓ Message Sent!';
    btn.style.background = '#10b981';
    document.getElementById('contactForm').reset();
    setTimeout(() => { btn.disabled=false; btn.innerText=orig; btn.style.background=''; }, 4000);
  }, 1200);
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

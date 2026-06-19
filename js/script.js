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
  c.width = parent.offsetWidth; c.height = parent.offsetHeight;
  const cx = c.getContext('2d');
  const W = c.width, H = c.height;
  const pts = 80;

  // Generate fake price + profit data
  let price = 180, profit = 0;
  const prices = [], profits = [], actions = [];
  for (let i = 0; i < pts; i++) {
    price += (Math.random() - 0.48) * 3;
    price = Math.max(160, Math.min(220, price));
    prices.push(price);
    const act = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'buy' : 'sell') : 'hold';
    actions.push(act);
    if (act === 'buy') profit -= 2;
    else if (act === 'sell') profit += 4;
    profits.push(profit);
  }

  const pad = 32;
  const priceMin = Math.min(...prices) - 5, priceMax = Math.max(...prices) + 5;
  const profMin = Math.min(...profits) - 2, profMax = Math.max(...profits) + 2;

  function px(i) { return pad + (i/(pts-1)) * (W - pad*2); }
  function py(v, mn, mx) { return H - pad - ((v-mn)/(mx-mn)) * (H - pad*2); }

  // Background
  cx.fillStyle = '#030711'; cx.fillRect(0,0,W,H);

  // Grid lines
  cx.strokeStyle = 'rgba(30,41,59,0.5)'; cx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const y = pad + g * (H - pad*2) / 4;
    cx.beginPath(); cx.moveTo(pad, y); cx.lineTo(W-pad, y); cx.stroke();
  }

  // Labels
  cx.font = '10px DM Mono, monospace';
  cx.fillStyle = '#94a3b8';
  cx.fillText('PRICE', pad, 18);
  cx.fillStyle = '#38bdf8';
  cx.fillText('PROFIT', W/2, 18);

  // Price line
  cx.beginPath(); cx.strokeStyle = 'rgba(100,160,200,0.5)'; cx.lineWidth = 1.5;
  prices.forEach((p,i) => {
    i===0 ? cx.moveTo(px(i), py(p, priceMin, priceMax)) : cx.lineTo(px(i), py(p, priceMin, priceMax));
  });
  cx.stroke();

  // Profit line with gradient
  const grad = cx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0, 'rgba(56,189,248,0.8)');
  grad.addColorStop(1, 'rgba(56,189,248,0.1)');
  cx.beginPath(); cx.strokeStyle = '#38bdf8'; cx.lineWidth = 2;
  profits.forEach((p,i) => {
    i===0 ? cx.moveTo(px(i), py(p, profMin, profMax)) : cx.lineTo(px(i), py(p, profMin, profMax));
  });
  cx.stroke();

  // Buy/sell dots
  actions.forEach((a,i) => {
    if (a === 'buy') {
      cx.beginPath(); cx.arc(px(i), py(prices[i], priceMin, priceMax), 3, 0, Math.PI*2);
      cx.fillStyle = '#10b981'; cx.fill();
    } else if (a === 'sell') {
      cx.beginPath(); cx.arc(px(i), py(prices[i], priceMin, priceMax), 3, 0, Math.PI*2);
      cx.fillStyle = '#f59e0b'; cx.fill();
    }
  });

  // Legend
  cx.fillStyle = '#10b981'; cx.fillRect(pad, H-18, 8, 8);
  cx.fillStyle = '#94a3b8'; cx.font = '9px DM Mono, monospace'; cx.fillText('BUY', pad+12, H-11);
  cx.fillStyle = '#f59e0b'; cx.fillRect(pad+50, H-18, 8, 8);
  cx.fillStyle = '#94a3b8'; cx.fillText('SELL', pad+62, H-11);
  cx.fillStyle = '#38bdf8'; cx.fillRect(pad+108, H-18, 8, 8);
  cx.fillStyle = '#94a3b8'; cx.fillText('PROFIT', pad+120, H-11);
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
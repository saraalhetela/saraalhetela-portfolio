// ─────────────────────────────
// MATRIX RAIN (RESPONSIVE FIX)
// ─────────────────────────────
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

let cols, drops;

function setupCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  cols = Math.floor(canvas.width / 15);
  drops = Array(cols).fill(0).map(() => Math.random() * -30);
}

setupCanvas();
window.addEventListener("resize", setupCanvas);

function drawMatrix() {
  ctx.fillStyle = "rgba(6,9,19,0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "13px monospace";

  for (let i = 0; i < drops.length; i++) {
    const char = Math.random() > 0.5 ? "1" : "0";
    const x = i * 15;
    const y = drops[i] * 15;

    ctx.fillStyle = "#38bdf8";
    ctx.fillText(char, x, y);

    if (y > canvas.height && Math.random() > 0.98) {
      drops[i] = 0;
    }

    drops[i] += 0.4;
  }
}

setInterval(drawMatrix, 33);

// ─────────────────────────────
// COUNTERS
// ─────────────────────────────
let fired = false;

function animateCounters() {
  if (fired) return;
  fired = true;

  document.querySelectorAll(".counter-val").forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    let current = 0;

    const step = target / 40;

    const interval = setInterval(() => {
      current += step;
      el.innerText = Math.min(current, target).toFixed(1) + suffix;

      if (current >= target) clearInterval(interval);
    }, 40);
  });
}

// ─────────────────────────────
// TYPEWRITER (UNCHANGED LOGIC)
// ─────────────────────────────
class TypeWriter {
  constructor(el) {
    this.el = el;
    this.words = JSON.parse(el.dataset.type);
    this.index = 0;
    this.txt = "";
    this.isDeleting = false;
    this.type();
  }

  type() {
    const full = this.words[this.index];

    if (this.isDeleting) {
      this.txt = full.substring(0, this.txt.length - 1);
    } else {
      this.txt = full.substring(0, this.txt.length + 1);
    }

    this.el.querySelector(".wrap").innerText = this.txt;

    let speed = 80;

    if (this.isDeleting) speed /= 2;

    if (!this.isDeleting && this.txt === full) {
      this.isDeleting = true;
      speed = 1200;
    } else if (this.isDeleting && this.txt === "") {
      this.isDeleting = false;
      this.index++;
      speed = 300;
    }

    setTimeout(() => this.type(), speed);
  }
}

window.onload = () => {
  document.querySelectorAll(".typewrite").forEach(el => new TypeWriter(el));
};

/* ==================================================
   VOID CODEX — DIGITAL RAIN
   Движущиеся линии и световые частицы
   ================================================== */

(() => {
  const background = document.querySelector(".world-background");

  if (!background || background.querySelector("canvas")) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  canvas.setAttribute("aria-hidden", "true");

  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "2",
  });

  background.appendChild(canvas);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0;
  let height = 0;
  let animationId = 0;
  let lastTime = 0;

  const particles = [];
  const streaks = [];

  const random = (min, max) => Math.random() * (max - min) + min;

  function resize() {
    const rect = background.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles.length = 0;
    streaks.length = 0;

    const particleCount = Math.min(
      90,
      Math.max(35, Math.floor((width * height) / 14000)),
    );

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: random(0, width),
        y: random(0, height),
        radius: random(1.2, 2.7),
        phase: random(0, Math.PI * 2),
        speed: random(1.2, 2.8),
      });
    }

    for (let i = 0; i < 13; i++) {
      streaks.push(createStreak(true));
    }
  }

  function createStreak(initial = false) {
    const angle = random(-Math.PI * 0.85, Math.PI * 0.85);

    return {
      x: random(0, width),
      y: initial ? random(0, height) : random(-100, height + 100),
      length: random(45, 125),
      thickness: random(1.3, 2.4),
      speed: random(100, 240),
      angle,
      alpha: random(0.55, 1),
      hue: Math.random() < 0.78 ? "yellow" : "white",
      delay: initial ? random(0, 2.5) : 0,
    };
  }

  function draw(time) {
    if (reducedMotion.matches) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 0;

    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    // Светящиеся частицы
    for (const p of particles) {
      p.phase += delta * p.speed;

      const glow = 0.45 + (Math.sin(p.phase) + 1) * 0.275;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(231, 255, 50, ${glow})`;
      ctx.shadowColor = "#e7ff32";
      ctx.shadowBlur = 9;
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Продолговатые импульсы
    for (let i = 0; i < streaks.length; i++) {
      const s = streaks[i];

      if (s.delay > 0) {
        s.delay -= delta;
        continue;
      }

      s.x += Math.cos(s.angle) * s.speed * delta;
      s.y += Math.sin(s.angle) * s.speed * delta;

      const dx = Math.cos(s.angle) * s.length;
      const dy = Math.sin(s.angle) * s.length;

      const color = s.hue === "yellow" ? "231, 255, 50" : "210, 225, 245";

      const gradient = ctx.createLinearGradient(s.x - dx, s.y - dy, s.x, s.y);

      gradient.addColorStop(0, `rgba(${color}, 0)`);
      gradient.addColorStop(0.7, `rgba(${color}, ${s.alpha * 0.55})`);
      gradient.addColorStop(1, `rgba(${color}, ${s.alpha})`);

      ctx.beginPath();
      ctx.moveTo(s.x - dx, s.y - dy);
      ctx.lineTo(s.x, s.y);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = s.thickness;
      ctx.shadowColor = s.hue === "yellow" ? "#e7ff32" : "#d2e1f5";
      ctx.shadowBlur = 12;
      ctx.stroke();

      if (s.x < -160 || s.x > width + 160 || s.y < -160 || s.y > height + 160) {
        streaks[i] = createStreak();
      }
    }

    ctx.shadowBlur = 0;
    animationId = requestAnimationFrame(draw);
  }

  function updateMotion() {
    cancelAnimationFrame(animationId);
    lastTime = 0;

    if (reducedMotion.matches) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    animationId = requestAnimationFrame(draw);
  }

  resize();
  updateMotion();

  window.addEventListener("resize", resize);
  reducedMotion.addEventListener("change", updateMotion);
})();

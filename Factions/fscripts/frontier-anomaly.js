/* ==================================================
   VOID CODEX — FRONTIER COSMIC ANOMALY
   Прозрачная туманность • Яркая звёздная пыль
   ================================================== */

(() => {
  const card = document.querySelector(".faction-card--frontier");

  if (!card) return;

  const canvas = document.createElement("canvas");
  canvas.className = "frontier-space-canvas";
  canvas.setAttribute("aria-hidden", "true");

  card.prepend(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let width = 0;
  let height = 0;
  let frame = 0;
  let lastFrame = 0;
  let elapsed = 0;

  const clouds = [];
  const particles = [];

  const random = (min, max) => min + Math.random() * (max - min);

  /* ---------- ОБЛАЧНАЯ ТУМАННОСТЬ ---------- */

  function createClouds() {
    clouds.length = 0;

    const count = Math.max(5, Math.min(9, Math.round(width / 90)));

    const palette = [
      [120, 55, 220],
      [164, 90, 255],
      [90, 65, 190],
      [190, 130, 255],
      [75, 95, 210],
    ];

    for (let i = 0; i < count; i++) {
      clouds.push({
        x: random(-0.1, 1.1) * width,
        y: random(-0.15, 1.15) * height,

        radius: random(45, 100),
        stretchX: random(1.2, 2.1),
        stretchY: random(0.65, 1.25),

        color: palette[i % palette.length],
        alpha: random(0.055, 0.13),

        phase: random(0, Math.PI * 2),
        speed: random(0.12, 0.32),
        driftX: random(4, 12),
        driftY: random(3, 8),

        lobes: Array.from({ length: 9 }, () => ({
          angle: random(0, Math.PI * 2),
          distance: random(0.15, 0.65),
          size: random(0.35, 0.8),
        })),
      });
    }
  }

  function drawCloud(cloud) {
    const wave = Math.sin(elapsed * cloud.speed + cloud.phase);

    const x = cloud.x + Math.sin(elapsed * 0.16 + cloud.phase) * cloud.driftX;

    const y = cloud.y + Math.cos(elapsed * 0.13 + cloud.phase) * cloud.driftY;

    const pulse = 0.88 + (wave + 1) * 0.08;
    const radius = cloud.radius * pulse;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(cloud.stretchX, cloud.stretchY);

    /* Рассеянное свечение облака */

    const halo = ctx.createRadialGradient(
      0,
      0,
      radius * 0.05,
      0,
      0,
      radius * 1.65,
    );

    halo.addColorStop(
      0,
      `rgba(${cloud.color.join(",")}, ${cloud.alpha * 0.7})`,
    );
    halo.addColorStop(
      0.42,
      `rgba(${cloud.color.join(",")}, ${cloud.alpha * 0.45})`,
    );
    halo.addColorStop(
      0.75,
      `rgba(${cloud.color.join(",")}, ${cloud.alpha * 0.12})`,
    );
    halo.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.65, 0, Math.PI * 2);
    ctx.fill();

    /* Неровные облачные образования */

    for (const lobe of cloud.lobes) {
      const lx = Math.cos(lobe.angle) * radius * lobe.distance;

      const ly = Math.sin(lobe.angle) * radius * lobe.distance;

      const lr = radius * lobe.size;

      const gradient = ctx.createRadialGradient(
        lx - lr * 0.18,
        ly - lr * 0.2,
        lr * 0.04,
        lx,
        ly,
        lr,
      );

      gradient.addColorStop(0, `rgba(205, 170, 255, ${cloud.alpha * 0.4})`);
      gradient.addColorStop(
        0.35,
        `rgba(${cloud.color.join(",")}, ${cloud.alpha * 0.6})`,
      );
      gradient.addColorStop(
        0.72,
        `rgba(${cloud.color.join(",")}, ${cloud.alpha * 0.25})`,
      );
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Едва заметная светлая сердцевина */

    if (cloud.alpha > 0.09) {
      const core = ctx.createRadialGradient(
        -radius * 0.12,
        -radius * 0.08,
        0,
        0,
        0,
        radius * 0.65,
      );

      core.addColorStop(0, "rgba(202, 169, 255, 0.07)");
      core.addColorStop(0.55, "rgba(145, 95, 235, 0.035)");
      core.addColorStop(1, "rgba(145, 95, 235, 0)");

      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /* ---------- ЗВЁЗДНЫЕ ЧАСТИЦЫ ---------- */

  function createParticles() {
    particles.length = 0;

    const count = Math.max(
      65,
      Math.min(140, Math.round((width * height) / 3000)),
    );

    for (let i = 0; i < count; i++) {
      const bright = Math.random() < 0.28;

      particles.push({
        x: random(0, width),
        y: random(0, height),

        size: bright ? random(1.6, 2.5) : random(0.7, 1.35),

        alpha: bright ? random(0.85, 1) : random(0.48, 0.8),

        speedX: random(-3.5, 3.5),
        speedY: random(-2.5, 2.5),

        phase: random(0, Math.PI * 2),
        bright,
      });
    }
  }

  function drawParticles() {
    for (const particle of particles) {
      const shimmer = 0.72 + Math.sin(elapsed * 1.8 + particle.phase) * 0.28;

      const alpha = particle.alpha * shimmer;

      /* Светящийся ореол крупных частиц */

      if (particle.bright) {
        const glow = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 4,
        );

        glow.addColorStop(0, `rgba(205, 185, 255, ${alpha * 0.48})`);
        glow.addColorStop(0.4, `rgba(175, 145, 255, ${alpha * 0.2})`);
        glow.addColorStop(1, "rgba(175, 145, 255, 0)");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Контрастное ядро звезды */

      ctx.beginPath();
      ctx.fillStyle = particle.bright
        ? `rgba(250, 244, 255, ${alpha})`
        : `rgba(220, 210, 255, ${alpha})`;

      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);

      ctx.fill();
    }
  }

  /* ---------- РАЗМЕРЫ ХОЛСТА ---------- */

  function resize() {
    const rect = card.getBoundingClientRect();

    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createClouds();
    createParticles();
    render();
  }

  /* ---------- ОТРИСОВКА ---------- */

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (const cloud of clouds) {
      drawCloud(cloud);
    }

    drawParticles();
  }

  function update(delta) {
    elapsed += delta / 1000;

    for (const particle of particles) {
      particle.x += (particle.speedX * delta) / 1000;
      particle.y += (particle.speedY * delta) / 1000;

      if (particle.x < -3) particle.x = width + 3;
      if (particle.x > width + 3) particle.x = -3;
      if (particle.y < -3) particle.y = height + 3;
      if (particle.y > height + 3) particle.y = -3;
    }
  }

  /* ---------- АНИМАЦИЯ ---------- */

  function animate(timestamp) {
    if (reducedMotion.matches) {
      render();
      frame = 0;
      return;
    }

    if (timestamp - lastFrame >= 33) {
      const delta = lastFrame ? Math.min(timestamp - lastFrame, 80) : 33;

      lastFrame = timestamp;

      update(delta);
      render();
    }

    frame = requestAnimationFrame(animate);
  }

  function start() {
    if (frame) cancelAnimationFrame(frame);

    frame = 0;
    lastFrame = 0;

    if (reducedMotion.matches) {
      render();
      return;
    }

    frame = requestAnimationFrame(animate);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(card);

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener("change", start);
  } else {
    reducedMotion.addListener(start);
  }

  resize();
  start();
})();

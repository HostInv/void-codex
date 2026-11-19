/* ==================================================
   VOID CODEX — VEYRON NEURAL GRID
   Ветви данных • Узлы • Световые импульсы
   ================================================== */

(() => {
  const cards = document.querySelectorAll(".faction-card--veyron");

  const labels = [
    "SYNC_OK",
    "NODE_07",
    "MEM.CORE",
    "SIGNAL",
    "DATA_FLOW",
    "SYS.ACTIVE",
    "LINK_STABLE",
    "0xA71C",
    "BUFFER",
    "PROCESS",
  ];

  const random = (min, max) => Math.random() * (max - min) + min;

  cards.forEach((card) => {
    const canvas = document.createElement("canvas");
    canvas.className = "veyron-code-canvas";
    canvas.setAttribute("aria-hidden", "true");

    card.prepend(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let branches = [];
    let nodes = [];
    let labelsOnGrid = [];
    let pulses = [];
    let frameId = null;
    let lastFrame = 0;
    let elapsed = 0;

    // Создаёт ветвь из прямых горизонтальных
    // и вертикальных сегментов.
    function makeBranch(startX, startY, depth = 0) {
      const points = [{ x: startX, y: startY }];

      let x = startX;
      let y = startY;
      let direction = Math.random() < 0.5 ? 1 : -1;

      const segments = Math.floor(random(2, 5));

      for (let i = 0; i < segments; i++) {
        const horizontal = Math.random() < 0.5;
        const distance = random(16, 42);

        if (horizontal) {
          x += distance * direction;
          direction *= -1;
        } else {
          y += distance * direction;
          direction *= -1;
        }

        // Не выходим далеко за края карточки.
        x = Math.max(4, Math.min(width - 4, x));
        y = Math.max(4, Math.min(height - 4, y));

        points.push({ x, y });
      }

      const branch = {
        points,
        opacity: random(0.12, 0.34),
        width: random(0.7, 1.15),
      };

      branches.push(branch);

      // Узлы на местах соединения сегментов.
      for (const point of points.slice(1)) {
        nodes.push({
          x: point.x,
          y: point.y,
          size: random(1.1, 2.2),
          phase: random(0, Math.PI * 2),
          active: Math.random() < 0.3,
        });
      }

      // Иногда от ветви отходит ещё одна ветка.
      if (depth < 2 && Math.random() < 0.65) {
        const point = points[Math.floor(random(1, points.length))];

        makeBranch(point.x, point.y, depth + 1);
      }
    }

    function buildNetwork() {
      branches = [];
      nodes = [];
      labelsOnGrid = [];
      pulses = [];

      const spacing = 65;

      // Несколько независимых точек входа.
      for (let x = 12; x < width; x += spacing) {
        for (let y = 12; y < height; y += spacing) {
          if (Math.random() < 0.48) {
            makeBranch(x + random(-12, 12), y + random(-12, 12));
          }
        }
      }

      // Короткие технические подписи.
      const labelCount = Math.max(3, Math.floor((width * height) / 10500));

      for (let i = 0; i < labelCount; i++) {
        labelsOnGrid.push({
          x: random(8, Math.max(9, width - 65)),
          y: random(12, Math.max(13, height - 8)),
          text: labels[Math.floor(Math.random() * labels.length)],
          opacity: random(0.22, 0.48),
          size: random(7, 9),
        });
      }

      // Световые импульсы распределяются по ветвям.
      const pulseCount = Math.min(7, Math.max(2, Math.floor(width / 65)));

      for (let i = 0; i < pulseCount; i++) {
        if (branches.length === 0) break;

        pulses.push({
          branch: Math.floor(Math.random() * branches.length),
          segment: 0,
          progress: random(0, 1),
          speed: random(0.002, 0.008),
          length: random(0.12, 0.32),
        });
      }
    }

    function resize() {
      const rect = card.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildNetwork();
      draw();
    }

    function drawBranch(branch) {
      const points = branch.points;

      if (points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (const point of points.slice(1)) {
        ctx.lineTo(point.x, point.y);
      }

      ctx.strokeStyle = `rgba(145, 190, 220, ${branch.opacity})`;

      ctx.lineWidth = branch.width;
      ctx.stroke();
    }

    function drawNodes() {
      for (const node of nodes) {
        const flicker = node.active
          ? 0.35 + Math.sin(elapsed * 0.0015 + node.phase) * 0.2
          : 0.18;

        ctx.fillStyle = `rgba(190, 226, 255, ${flicker})`;

        ctx.fillRect(
          node.x - node.size / 2,
          node.y - node.size / 2,
          node.size,
          node.size,
        );
      }
    }

    function drawLabels() {
      ctx.textAlign = "left";

      for (const item of labelsOnGrid) {
        ctx.font = `${item.size}px monospace`;
        ctx.fillStyle = `rgba(170, 210, 238, ${item.opacity})`;

        ctx.fillText(item.text, item.x, item.y);
      }
    }

    function drawPulses() {
      for (const pulse of pulses) {
        const branch = branches[pulse.branch];

        if (!branch || branch.points.length < 2) {
          continue;
        }

        const points = branch.points;
        const segment = Math.min(pulse.segment, points.length - 2);

        const a = points[segment];
        const b = points[segment + 1];

        const x = a.x + (b.x - a.x) * pulse.progress;
        const y = a.y + (b.y - a.y) * pulse.progress;

        // Светящаяся точка импульса.
        ctx.beginPath();
        ctx.arc(x, y, 2.1, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(220, 244, 255, 0.95)";
        ctx.shadowColor = "rgba(130, 200, 255, 0.9)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Короткий световой след.
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(x, y);

        ctx.strokeStyle = "rgba(180, 225, 255, 0.35)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (const branch of branches) {
        drawBranch(branch);
      }

      drawNodes();
      drawLabels();
      drawPulses();
    }

    function updatePulses() {
      for (const pulse of pulses) {
        const branch = branches[pulse.branch];

        if (!branch || branch.points.length < 2) {
          continue;
        }

        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.segment++;

          if (pulse.segment >= branch.points.length - 1) {
            pulse.segment = 0;

            // Иногда импульс выбирает другую ветвь.
            if (Math.random() < 0.45 && branches.length > 0) {
              pulse.branch = Math.floor(Math.random() * branches.length);
            }
          }
        }
      }
    }

    function animate(timestamp = 0) {
      frameId = null;

      if (reducedMotion.matches) {
        draw();
        return;
      }

      if (timestamp - lastFrame < 33) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const delta = lastFrame ? Math.min(timestamp - lastFrame, 50) : 33;

      lastFrame = timestamp;
      elapsed += delta;

      updatePulses();
      draw();

      frameId = requestAnimationFrame(animate);
    }

    function start() {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      lastFrame = 0;

      if (reducedMotion.matches) {
        draw();
        return;
      }

      frameId = requestAnimationFrame(animate);
    }

    resize();
    start();

    const observer = new ResizeObserver(resize);
    observer.observe(card);

    reducedMotion.addEventListener("change", start);
  });
})();

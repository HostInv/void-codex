/* ==================================================
   VOID CODEX — CORRUPT BLACK RAIN
   Crimson rain • Five glitch emojis • Infection
   ================================================== */

(() => {
  const cards = document.querySelectorAll(".faction-card--corrupt");

  cards.forEach((card) => {
    if (card.querySelector(".corrupt-rain-canvas")) return;

    const canvas = document.createElement("canvas");
    canvas.className = "corrupt-rain-canvas";
    canvas.setAttribute("aria-hidden", "true");
    card.prepend(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const random = (min, max) => Math.random() * (max - min) + min;

    let width = 0;
    let height = 0;
    let drops = [];
    let symbols = [];
    let frameId = null;
    let lastFrame = 0;
    let elapsed = 0;
    let lastBurst = -1;

    /*
      Синхронизация с corrupt-glitch-burst в CSS.
      Длительность CSS-цикла: 5.2 секунды.
      Символы возникают в моменты появления полос.
    */

    const glitchCycle = 5200;

    const glitchMoments = [0.122, 0.342, 0.612, 0.842];

    const symbolDuration = 0.095;

    /* ---------- КРАСНЫЙ ДОЖДЬ ---------- */

    function createDrop(randomY = true) {
      const bright = Math.random() < 0.23;

      return {
        x: random(0, width),
        y: randomY ? random(-height, height) : random(-100, -10),

        length: bright ? random(14, 35) : random(8, 25),
        speed: bright ? random(6, 12) : random(4, 9),
        thickness: bright ? random(1.2, 2.2) : random(0.65, 1.4),
        drift: random(-0.8, 2.2),

        opacity: bright ? random(0.65, 1) : random(0.3, 0.68),
        bright,
      };
    }

    function drawDrop(drop) {
      const x2 = drop.x + drop.drift;
      const y2 = drop.y + drop.length;

      // Тёмное тело
      ctx.beginPath();
      ctx.strokeStyle = `rgba(5, 0, 2, ${drop.opacity})`;
      ctx.lineWidth = drop.thickness + 1.1;
      ctx.lineCap = "round";
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Красный край
      ctx.beginPath();
      ctx.strokeStyle = drop.bright
        ? `rgba(255, 55, 70, ${drop.opacity})`
        : `rgba(190, 24, 42, ${drop.opacity * 0.7})`;

      ctx.lineWidth = drop.bright ? 1.15 : 0.65;
      ctx.moveTo(drop.x + 0.5, drop.y);
      ctx.lineTo(x2 + 0.5, y2 * 0.96);
      ctx.stroke();

      // Редкие светлые импульсы
      if (drop.bright && Math.random() < 0.035) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 115, 125, ${drop.opacity})`;
        ctx.arc(x2, y2, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ---------- ПЯТЬ ОДИНАКОВЫХ 👾 ---------- */

    function createSymbolSprite(size) {
      const sprite = document.createElement("canvas");
      const spriteSize = Math.ceil(size * 2);

      sprite.width = spriteSize;
      sprite.height = spriteSize;

      const spriteCtx = sprite.getContext("2d");
      if (!spriteCtx) return sprite;

      spriteCtx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;

      spriteCtx.textAlign = "center";
      spriteCtx.textBaseline = "middle";

      // Рисуем обычный эмодзи.
      spriteCtx.fillText("👾", spriteSize / 2, spriteSize / 2);

      // Перекрашиваем только непрозрачные пиксели в цвет Коррапта.
      spriteCtx.globalCompositeOperation = "source-in";
      spriteCtx.fillStyle = "#ed414b";
      spriteCtx.fillRect(0, 0, spriteSize, spriteSize);

      return sprite;
    }

    function triggerSymbols() {
      symbols = [];

      // Пять символов, случайные места по бокам.
      for (let i = 0; i < 5; i++) {
        const size = random(18, 27);
        const side = Math.random() < 0.5 ? "left" : "right";

        symbols.push({
          sprite: createSymbolSprite(size),
          size,

          x:
            side === "left"
              ? random(width * 0.04, width * 0.23)
              : random(width * 0.77, width * 0.96),

          y: random(height * 0.12, height * 0.88),

          born: elapsed,
          phase: random(0, Math.PI * 2),
          offsetX: random(-3, 3),
          offsetY: random(-3, 3),
        });
      }
    }

    function drawSymbol(symbol) {
      const age = elapsed - symbol.born;

      if (age < 0 || age > symbolDuration) return;

      // Быстрое появление и исчезновение.
      const progress = age / symbolDuration;
      const fade = Math.min(1, progress * 12, (1 - progress) * 12);

      // Затемнённый эмодзи, без яркого свечения.
      ctx.save();
      ctx.globalAlpha = Math.max(0, fade) * 0.58;

      const jitterX = Math.sin(elapsed * 90 + symbol.phase) * 1.5;

      const jitterY = Math.cos(elapsed * 75 + symbol.phase) * 1.2;

      const x = symbol.x + symbol.offsetX + jitterX;
      const y = symbol.y + symbol.offsetY + jitterY;

      ctx.drawImage(
        symbol.sprite,
        x - symbol.size,
        y - symbol.size,
        symbol.size * 2,
        symbol.size * 2,
      );

      ctx.restore();
    }

    /* ---------- РАЗМЕРЫ ---------- */

    function resize() {
      const rect = card.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(
        150,
        Math.min(320, Math.round((width * height) / 800)),
      );

      drops = Array.from({ length: count }, () => createDrop(true));

      symbols = [];
      draw();
    }

    /* ---------- ОТРИСОВКА ---------- */

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (const drop of drops) {
        drawDrop(drop);
      }

      for (const symbol of symbols) {
        drawSymbol(symbol);
      }
    }

    /* ---------- ОБНОВЛЕНИЕ ---------- */

    function update(delta) {
      elapsed += delta / 1000;

      for (const drop of drops) {
        drop.x += (drop.drift * 0.35 * delta) / 16.67;
        drop.y += (drop.speed * delta) / 16.67;

        if (drop.y > height + drop.length) {
          Object.assign(drop, createDrop(false));
          drop.x = random(0, width);
        }

        if (drop.x > width + 5) drop.x = -5;
        if (drop.x < -5) drop.x = width + 5;
      }

      /*
        Повторяем временные отметки CSS-анимации.
        На каждую вспышку создаётся новая пятёрка.
      */

      const cyclePosition = (elapsed * 1000) % glitchCycle;
      const cycleNumber = Math.floor((elapsed * 1000) / glitchCycle);

      const burstIndex = glitchMoments.findIndex((moment) => {
        const start = moment * glitchCycle;

        return (
          cyclePosition >= start &&
          cyclePosition < start + symbolDuration * 1000
        );
      });

      const burstId =
        burstIndex === -1
          ? -1
          : cycleNumber * glitchMoments.length + burstIndex;

      if (burstId !== -1 && burstId !== lastBurst) {
        triggerSymbols();
        lastBurst = burstId;
      }

      // Удаляем символы сразу после окончания вспышки.
      symbols = symbols.filter(
        (symbol) => elapsed - symbol.born < symbolDuration,
      );
    }

    /* ---------- АНИМАЦИЯ ---------- */

    function animate(timestamp) {
      if (reducedMotion.matches) {
        draw();
        frameId = null;
        return;
      }

      if (timestamp - lastFrame >= 33) {
        const delta = lastFrame ? Math.min(timestamp - lastFrame, 80) : 33;

        lastFrame = timestamp;
        update(delta);
        draw();
      }

      frameId = requestAnimationFrame(animate);
    }

    function start() {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      lastFrame = 0;

      if (reducedMotion.matches) {
        symbols = [];
        draw();
        return;
      }

      frameId = requestAnimationFrame(animate);
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
  });
})();

/* ==================================================
   VOID CODEX — CENTRON OBSERVER
   Precision scan / quiet observation
   ================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".faction-card--centron");

  if (!card || card.dataset.centronInitialized === "true") {
    return;
  }

  const emblem = card.querySelector(".faction-emblem");
  const toggle = card.querySelector(".faction-toggle");

  if (!emblem || !toggle) {
    return;
  }

  card.dataset.centronInitialized = "true";

  /* ---------- PRECISION FIELD ---------- */

  const field = document.createElement("div");
  field.className = "centron-precision-field";
  field.setAttribute("aria-hidden", "true");

  const outerDial = document.createElement("div");
  outerDial.className = "centron-dial centron-dial--outer";

  const middleDial = document.createElement("div");
  middleDial.className = "centron-dial centron-dial--middle";

  const innerDial = document.createElement("div");
  innerDial.className = "centron-dial centron-dial--inner";

  field.append(outerDial, middleDial, innerDial);

  for (let i = 0; i < 3; i++) {
    const marker = document.createElement("span");
    marker.className = `centron-marker centron-marker--${
      ["one", "two", "three"][i]
    }`;

    field.appendChild(marker);
  }

  card.appendChild(field);

  /* ---------- SCANNER ---------- */

  const scan = document.createElement("div");
  scan.className = "centron-scan";
  scan.setAttribute("aria-hidden", "true");

  card.appendChild(scan);

  /* ---------- OBSERVER INSIDE THE EMBLEM ---------- */

  const observer = document.createElement("span");
  observer.className = "centron-observer";
  observer.setAttribute("aria-hidden", "true");

  const ring = document.createElement("span");
  ring.className = "centron-observer__ring";

  const arm = document.createElement("span");
  arm.className = "centron-observer__arm";

  const hub = document.createElement("span");
  hub.className = "centron-observer__hub";

  observer.append(ring, arm, hub);
  emblem.appendChild(observer);

  /* ---------- RESPONSIVE POSITIONING ---------- */

  function positionField() {
    const cardRect = card.getBoundingClientRect();
    const emblemRect = emblem.getBoundingClientRect();

    if (!cardRect.width || !emblemRect.width) {
      return;
    }

    const centerX = emblemRect.left + emblemRect.width / 2 - cardRect.left;

    const centerY = emblemRect.top + emblemRect.height / 2 - cardRect.top;

    const fieldSize = Math.min(
      Math.max(emblemRect.width * 2.8, cardRect.width * 0.9),
      620,
    );

    field.style.left = `${centerX}px`;
    field.style.top = `${centerY}px`;
    field.style.width = `${fieldSize}px`;
  }

  positionField();

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(positionField);
    resizeObserver.observe(card);
    resizeObserver.observe(emblem);
  } else {
    window.addEventListener("resize", positionField);
  }

  /* ---------- PERIODIC SCAN ---------- */

  let scanTimer;
  let confirmationTimer;

  function runScan() {
    scan.classList.remove("is-active");
    field.classList.remove("is-confirmed");
    observer.classList.add("is-alert");

    // Restart the animation cleanly.
    void scan.offsetWidth;
    scan.classList.add("is-active");

    window.clearTimeout(confirmationTimer);

    confirmationTimer = window.setTimeout(() => {
      field.classList.add("is-confirmed");
    }, 850);

    window.setTimeout(() => {
      scan.classList.remove("is-active");
      observer.classList.remove("is-alert");
      field.classList.remove("is-confirmed");
    }, 1400);

    scheduleScan();
  }

  function scheduleScan(delay = 3000 + Math.random() * 2000) {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(runScan, delay);
  }

  // First scan shortly after the card appears.
  scheduleScan(1500 + Math.random() * 1000);

  /* ---------- THE OBSERVER TRACKS THE CURSOR ---------- */

  let returnTimer;
  let observationTimer;

  function setArmAngle(angle) {
    arm.style.transform = `rotate(${angle}deg)`;
  }

  function scheduleIdleObservation() {
    window.clearTimeout(observationTimer);

    observationTimer = window.setTimeout(
      () => {
        // A small correction, not a frantic spin.
        setArmAngle(Math.random() * 100 - 50);
        observer.classList.add("is-alert");

        window.setTimeout(() => {
          setArmAngle(0);
          observer.classList.remove("is-alert");
        }, 700);

        scheduleIdleObservation();
      },
      5000 + Math.random() * 5000,
    );
  }

  emblem.addEventListener("pointerenter", () => {
    window.clearTimeout(returnTimer);
    window.clearTimeout(observationTimer);
  });

  emblem.addEventListener("pointermove", (event) => {
    const rect = emblem.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

    setArmAngle(angle);
    observer.classList.add("is-alert");
  });

  emblem.addEventListener("pointerleave", () => {
    window.clearTimeout(returnTimer);

    returnTimer = window.setTimeout(() => {
      setArmAngle(0);
      observer.classList.remove("is-alert");
      scheduleIdleObservation();
    }, 450);
  });

  scheduleIdleObservation();
});

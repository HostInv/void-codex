/* ==================================================
   VOID CODEX — FACTIONS
   Раскрытие описаний фракций
   ================================================== */

const factionToggles = document.querySelectorAll(".faction-toggle");

factionToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const card = toggle.closest(".faction-card");
    const detailsId = toggle.getAttribute("aria-controls");
    const details = document.getElementById(detailsId);

    if (!card || !details) return;

    const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

    // Закрываем остальные фракции
    factionToggles.forEach((otherToggle) => {
      const otherId = otherToggle.getAttribute("aria-controls");

      const otherDetails = document.getElementById(otherId);
      const otherCard = otherToggle.closest(".faction-card");

      otherToggle.setAttribute("aria-expanded", "false");

      if (otherDetails) {
        otherDetails.hidden = true;
      }

      if (otherCard) {
        otherCard.classList.remove("is-open");
      }
    });

    // Открываем выбранную, если она была закрыта
    if (shouldOpen) {
      toggle.setAttribute("aria-expanded", "true");
      details.hidden = false;
      card.classList.add("is-open");
    }
  });
});

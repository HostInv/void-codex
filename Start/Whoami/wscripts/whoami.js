/* ========================================
   VOID CODEX — WHOAMI
   Uniform modal
======================================== */

const openButton = document.querySelector("#open-uniform-modal");
const modal = document.querySelector("#uniform-modal");
const closeButtons = document.querySelectorAll("[data-close-modal]");

if (openButton && modal) {
  let previousFocus = null;

  function openModal() {
    previousFocus = document.activeElement;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const closeButton = modal.querySelector(".uniform-modal-close");
    closeButton?.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    previousFocus?.focus();
  }

  openButton.addEventListener("click", openModal);

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

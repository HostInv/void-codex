
/* ========================================
   VOID CODEX — START ANIMATION
   Последовательность активации страницы
======================================== */

const emblemPulse = document.querySelector(
    ".emblem-final-pulse"
);

const startInterface = document.querySelector(
    ".start-interface"
);

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);


/* Открытие навигации */

function activateNavigation() {
    if (!startInterface) return;

    startInterface.classList.add(
        "is-navigation-ready"
    );
}


/* Если пользователь отключил анимации */

if (reducedMotion.matches || !emblemPulse) {

    activateNavigation();

} else {

    emblemPulse.addEventListener(
        "animationend",
        (event) => {

            if (event.animationName === "final-pulse") {
                activateNavigation();
            }

        },
        { once: true }
    );

}

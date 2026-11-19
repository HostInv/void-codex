// ==================================================
// VOID CODEX — ГЛАВНЫЙ ЗАГРУЗЧИК
// ==================================================

// ===== 01. СПИСОК СКРИПТОВ =====

const menuScripts = [
  // Новые скрипты добавляем сюда:
  // "./mscripts/navigation.js",
  // "./mscripts/animations.js"
];

// ===== 02. ПОСЛЕДОВАТЕЛЬНАЯ ЗАГРУЗКА =====

function loadMenuScripts(scripts) {
  let chain = Promise.resolve();

  scripts.forEach((src) => {
    chain = chain.then(() => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src = src;
        script.async = false;

        script.onload = resolve;

        script.onerror = () => {
          reject(new Error(`Не удалось загрузить скрипт: ${src}`));
        };

        document.head.appendChild(script);
      });
    });
  });

  chain.catch((error) => {
    console.error("[Void Codex]", error);
  });
}

// ===== 03. ЗАПУСК ЗАГРУЗЧИКА =====

loadMenuScripts(menuScripts);

const DEFAULT_THEME = "system";
let mediaQuery = null;
let mediaListener = null;

function resolveTheme(theme) {
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function applyTheme(theme) {
  const selectedTheme = ["light", "dark", "system"].includes(theme) ? theme : DEFAULT_THEME;
  const root = document.documentElement;

  if (mediaQuery && mediaListener) {
    mediaQuery.removeEventListener("change", mediaListener);
    mediaQuery = null;
    mediaListener = null;
  }

  const applyResolved = () => {
    const resolved = resolveTheme(selectedTheme);
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-preference", selectedTheme);
    root.style.colorScheme = resolved;
  };

  applyResolved();
  if (selectedTheme === "system" && window.matchMedia) {
    mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    mediaListener = applyResolved;
    mediaQuery.addEventListener("change", mediaListener);
  }

  localStorage.setItem("theme", selectedTheme);
  return selectedTheme;
}

export function getSavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  return ["light", "dark", "system"].includes(savedTheme) ? savedTheme : DEFAULT_THEME;
}

export function initializeTheme() {
  return applyTheme(getSavedTheme());
}

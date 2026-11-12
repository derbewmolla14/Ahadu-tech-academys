
const DEFAULT_THEME = "dark";

export function applyTheme(theme) {
  const selectedTheme = theme === "light" ? "light" : "dark";

  // Apply theme to the entire HTML document
  document.documentElement.setAttribute(
    "data-theme",
    selectedTheme
  );

  // Update browser color scheme
  document.documentElement.style.colorScheme = selectedTheme;

  // Save preference
  localStorage.setItem("theme", selectedTheme);

  return selectedTheme;
}

export function getSavedTheme() {
  const savedTheme = localStorage.getItem("theme");

  return savedTheme === "light" ? "light" : DEFAULT_THEME;
}

export function initializeTheme() {
  return applyTheme(getSavedTheme());
}

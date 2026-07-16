/**
 * Light / dark theme toggle with localStorage persistence.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "theme";

  function getPreferredTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {
      /* ignore */
    }
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    var next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignore */
    }
    syncControls(next);
    try {
      document.documentElement.dispatchEvent(
        new CustomEvent("themechange", { detail: { theme: next } })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function syncControls(theme) {
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    var isDark = theme === "dark";
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
      btn.title = isDark ? "Light theme" : "Dark theme";
      var label = btn.querySelector(".theme-toggle-label");
      if (label) label.textContent = isDark ? "Light mode" : "Dark mode";
    }
  }

  function toggleTheme() {
    var current =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function init() {
    applyTheme(getPreferredTheme());

    document.addEventListener("click", function (e) {
      var target = e.target;
      if (!target || !target.closest) return;
      var btn = target.closest("[data-theme-toggle]");
      if (btn) {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

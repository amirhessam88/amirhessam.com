/**
 * Testimonials: pointer glow on quote cards + gentle enter polish.
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function init() {
    var section = document.getElementById("testimonials");
    if (!section) return;

    var items = Array.prototype.slice.call(
      section.querySelectorAll(".testimonial-item")
    );
    if (!items.length) return;

    if (prefersReducedMotion()) return;

    items.forEach(function (item) {
      var quote = item.querySelector("p");
      if (!quote) return;

      item.addEventListener("pointermove", function (e) {
        var rect = quote.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var px = ((e.clientX - rect.left) / rect.width) * 100;
        var py = ((e.clientY - rect.top) / rect.height) * 100;
        quote.style.setProperty("--glow-x", px + "%");
        quote.style.setProperty("--glow-y", py + "%");
        quote.classList.add("is-lit");
        item.classList.add("is-lit");
      });

      item.addEventListener("pointerleave", function () {
        quote.classList.remove("is-lit");
        item.classList.remove("is-lit");
        quote.style.setProperty("--glow-x", "50%");
        quote.style.setProperty("--glow-y", "30%");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

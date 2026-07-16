/**
 * Academic Portfolio: motion between cards.
 * Dense colored links + traveling particles through the gaps between cards.
 */
(function () {
  "use strict";

  // Site-adjacent palette that cycles along each link
  var PALETTE = [
    { r: 20, g: 157, b: 221 }, // brand blue
    { r: 56, g: 189, b: 248 }, // sky
    { r: 99, g: 102, b: 241 }, // indigo
    { r: 168, g: 85, b: 247 }, // violet
    { r: 236, g: 72, b: 153 }, // pink
    { r: 34, g: 197, b: 94 }, // green
    { r: 245, g: 158, b: 11 }, // amber
    { r: 14, g: 165, b: 233 }, // cyan
  ];

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function rgba(c, a) {
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
  }

  function lerpColor(a, b, t) {
    return {
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
    };
  }

  function colorAt(hueShift, t) {
    var n = PALETTE.length;
    var x = ((hueShift + t) % 1 + 1) % 1;
    var scaled = x * n;
    var i0 = Math.floor(scaled) % n;
    var i1 = (i0 + 1) % n;
    var f = scaled - Math.floor(scaled);
    return lerpColor(PALETTE[i0], PALETTE[i1], f);
  }

  function isVisible(item) {
    if (!item || item.style.display === "none") return false;
    var style = window.getComputedStyle(item);
    if (style.display === "none" || style.visibility === "hidden") return false;
    if (parseFloat(style.opacity) < 0.05) return false;
    return true;
  }

  function cardBox(item, networkRect) {
    var wrap = item.querySelector(".portfolio-wrap") || item;
    var r = wrap.getBoundingClientRect();
    return {
      x: r.left - networkRect.left,
      y: r.top - networkRect.top,
      w: r.width,
      h: r.height,
      cx: r.left - networkRect.left + r.width / 2,
      cy: r.top - networkRect.top + r.height / 2,
    };
  }

  function edgePoint(a, b) {
    var dx = b.cx - a.cx;
    var dy = b.cy - a.cy;
    var pad = 4;
    if (Math.abs(dx) * a.h > Math.abs(dy) * a.w) {
      var sx = dx > 0 ? 1 : -1;
      return {
        x: a.cx + sx * (a.w / 2 + pad),
        y: a.cy + (dy / Math.abs(dx || 1)) * (a.w / 2) * 0.35,
      };
    }
    var sy = dy > 0 ? 1 : -1;
    return {
      x: a.cx + (dx / Math.abs(dy || 1)) * (a.h / 2) * 0.35,
      y: a.cy + sy * (a.h / 2 + pad),
    };
  }

  function buildLinks(boxes) {
    var links = [];
    var seen = {};
    var n = boxes.length;
    // Dense mesh: each card connects to several nearest neighbors
    var maxN = n <= 3 ? n - 1 : n <= 6 ? 4 : 5;

    for (var i = 0; i < n; i++) {
      var dists = [];
      for (var j = 0; j < n; j++) {
        if (i === j) continue;
        var dx = boxes[i].cx - boxes[j].cx;
        var dy = boxes[i].cy - boxes[j].cy;
        dists.push({ j: j, d: dx * dx + dy * dy });
      }
      dists.sort(function (a, b) {
        return a.d - b.d;
      });

      for (var k = 0; k < Math.min(maxN, dists.length); k++) {
        var a = Math.min(i, dists[k].j);
        var b = Math.max(i, dists[k].j);
        var key = a + "-" + b;
        if (seen[key]) continue;
        seen[key] = true;

        var particleCount = 2 + Math.floor(Math.random() * 2); // 2–3
        var particles = [];
        for (var p = 0; p < particleCount; p++) {
          particles.push({
            t: Math.random(),
            speed: 0.004 + Math.random() * 0.007,
            phase: Math.random() * Math.PI * 2,
            size: 3 + Math.random() * 2.5,
          });
        }

        links.push({
          a: a,
          b: b,
          hue: Math.random(),
          hueSpeed: 0.0012 + Math.random() * 0.002,
          pulse: Math.random() * Math.PI * 2,
          particles: particles,
        });
      }
    }
    return links;
  }

  function initNetwork(section) {
    var network = section.querySelector("#portfolio-network");
    var canvas = section.querySelector("#portfolio-links-canvas");
    if (!network || !canvas) return null;

    var ctx = canvas.getContext("2d");
    if (!ctx) return null;

    var items = Array.prototype.slice.call(
      section.querySelectorAll(".portfolio-item")
    );
    var boxes = [];
    var links = [];
    var visible = true;
    var raf = 0;
    var reduceMotion = prefersReducedMotion();

    function resize() {
      var rect = network.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      rebuild();
    }

    function rebuild() {
      var rect = network.getBoundingClientRect();
      boxes = [];
      items.forEach(function (item) {
        if (!isVisible(item)) return;
        boxes.push(cardBox(item, rect));
      });
      links = boxes.length > 1 ? buildLinks(boxes) : [];
    }

    function draw() {
      var rect = network.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (boxes.length < 2) return;

      // Slight additive feel via lighter blend for particles
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var b0 = boxes[link.a];
        var b1 = boxes[link.b];
        if (!b0 || !b1) continue;

        var p0 = edgePoint(b0, b1);
        var p1 = edgePoint(b1, b0);
        var cStart = colorAt(link.hue, 0);
        var cEnd = colorAt(link.hue, 0.45);
        var pulse = 0.7 + 0.3 * Math.sin(link.pulse);

        // Glow underlay
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        var under = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        under.addColorStop(0, rgba(cStart, 0.22 * pulse));
        under.addColorStop(0.5, rgba(cEnd, 0.35 * pulse));
        under.addColorStop(1, rgba(cStart, 0.22 * pulse));
        ctx.strokeStyle = under;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.stroke();

        // Bright core stroke
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        var core = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
        core.addColorStop(0, rgba(cStart, 0.75));
        core.addColorStop(0.5, rgba(cEnd, 0.95));
        core.addColorStop(1, rgba(colorAt(link.hue, 0.85), 0.75));
        ctx.strokeStyle = core;
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Traveling particles
        for (var p = 0; p < link.particles.length; p++) {
          var part = link.particles[p];
          var t = part.t;
          var x = p0.x + (p1.x - p0.x) * t;
          var y = p0.y + (p1.y - p0.y) * t;
          var pc = colorAt(link.hue, t);
          var pPulse = 0.55 + 0.45 * Math.sin(part.phase);
          var radius = part.size * (1.1 + 0.35 * pPulse);

          var grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 3.2);
          grad.addColorStop(0, rgba(pc, 0.95 * pPulse));
          grad.addColorStop(0.35, rgba(pc, 0.45 * pPulse));
          grad.addColorStop(1, rgba(pc, 0));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius * 3.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.92)";
          ctx.fill();
        }
      }
    }

    function tick() {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      if (!reduceMotion) {
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          link.hue = (link.hue + link.hueSpeed) % 1;
          link.pulse += 0.04;
          for (var p = 0; p < link.particles.length; p++) {
            var part = link.particles[p];
            part.t += part.speed;
            if (part.t > 1) part.t = 0;
            part.phase += 0.06;
          }
        }
      }
      draw();
    }

    var io = new IntersectionObserver(
      function (entries) {
        visible = !!(entries[0] && entries[0].isIntersecting);
      },
      { threshold: 0.05 }
    );
    io.observe(network);

    window.addEventListener("resize", resize);

    var $container = window.jQuery
      ? window.jQuery(section).find(".portfolio-container")
      : null;
    if ($container && $container.length && $container.on) {
      $container.on("arrangeComplete", rebuild);
      $container.on("layoutComplete", rebuild);
    }

    section.querySelectorAll("#portfolio-flters li").forEach(function (filter) {
      filter.addEventListener("click", function () {
        window.setTimeout(rebuild, 280);
      });
    });

    section.querySelectorAll(".portfolio-wrap img").forEach(function (img) {
      if (!img.complete) {
        img.addEventListener("load", rebuild);
      }
    });

    window.addEventListener("load", function () {
      window.setTimeout(resize, 80);
    });

    resize();
    tick();

    return {
      rebuild: rebuild,
      destroy: function () {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener("resize", resize);
      },
    };
  }

  function initSpotlight(wraps) {
    if (prefersReducedMotion()) return;
    wraps.forEach(function (wrap) {
      wrap.addEventListener("pointermove", function (e) {
        var rect = wrap.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        wrap.style.setProperty("--glow-x", px * 100 + "%");
        wrap.style.setProperty("--glow-y", py * 100 + "%");
        wrap.classList.add("is-lit");
        wrap.style.setProperty("--tilt-x", ((0.5 - py) * 8).toFixed(2) + "deg");
        wrap.style.setProperty("--tilt-y", ((px - 0.5) * 10).toFixed(2) + "deg");
      });
      wrap.addEventListener("pointerleave", function () {
        wrap.classList.remove("is-lit");
        wrap.style.setProperty("--tilt-x", "0deg");
        wrap.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  function init() {
    var section = document.getElementById("portfolio");
    if (!section) return;

    var wraps = Array.prototype.slice.call(
      section.querySelectorAll(".portfolio-wrap")
    );
    initSpotlight(wraps);
    initNetwork(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

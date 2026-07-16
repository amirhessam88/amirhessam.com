/**
 * Particle streams for Focus Areas.
 * Four colored particle paths flow from the corners into the center hub.
 */
(function () {
  "use strict";

  function initFocusFabric(container) {
    if (!container || typeof THREE === "undefined") return null;

    var probe = document.createElement("canvas");
    if (!probe.getContext("webgl") && !probe.getContext("experimental-webgl")) {
      console.warn("WebGL not supported, skipping focus fabric");
      return null;
    }

    var visible = false;
    var observer = new IntersectionObserver(
      function (entries) {
        visible = !!(entries[0] && entries[0].isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    var onVisibility = function () {
      if (document.hidden) visible = false;
    };
    document.addEventListener("visibilitychange", onVisibility);

    var scene = new THREE.Scene();
    var width = container.clientWidth;
    var height = container.clientHeight;
    var camera = new THREE.PerspectiveCamera(50, width / Math.max(height, 1), 0.1, 1000);
    camera.position.z = 20;

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Corner origins: TL blue, BL purple, TR orange, BR green
    var streams = [];
    var groups = [
      { x: -6, y: 4, color: 0x3b82f6, n: 3 },
      { x: -6, y: -4, color: 0xc084fc, n: 3 },
      { x: 6, y: 4, color: 0xffb02e, n: 3 },
      { x: 6, y: -4, color: 0x34d399, n: 3 },
    ];

    function makeStream(ox, oy, color) {
      var path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(ox, oy, 0),
        new THREE.Vector3(ox * 0.4, oy * 0.8, 2),
        new THREE.Vector3(ox * 0.1, oy * 0.1, -1),
        new THREE.Vector3(0, 0, 0),
      ]);

      var count = 80;
      var geometry = new THREE.BufferGeometry();
      var positions = new Float32Array(count * 3);
      var progress = new Float32Array(count);
      for (var i = 0; i < count; i++) progress[i] = Math.random();

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("progress", new THREE.BufferAttribute(progress, 1));

      var material = new THREE.PointsMaterial({
        color: color,
        size: 0.22,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      var points = new THREE.Points(geometry, material);
      scene.add(points);

      return {
        points: points,
        path: path,
        geometry: geometry,
        material: material,
        speed: 0.002 + 0.003 * Math.random(),
      };
    }

    groups.forEach(function (g) {
      for (var i = 0; i < g.n; i++) {
        var jitterY = (Math.random() - 0.5) * 0.8;
        streams.push(makeStream(g.x, g.y + jitterY, g.color));
      }
    });

    var raf = 0;
    var animate = function () {
      raf = requestAnimationFrame(animate);
      if (!visible) return;

      streams.forEach(function (stream) {
        var pos = stream.geometry.attributes.position.array;
        var prog = stream.geometry.attributes.progress.array;
        for (var i = 0; i < prog.length; i++) {
          prog[i] += stream.speed;
          if (prog[i] > 1) prog[i] = 0;
          var p = stream.path.getPoint(prog[i]);
          pos[i * 3] = p.x;
          pos[i * 3 + 1] = p.y;
          pos[i * 3 + 2] = p.z;
        }
        stream.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    var onResize = function () {
      if (!container) return;
      var w = container.clientWidth;
      var h = container.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    setTimeout(function () {
      container.classList.add("is-ready");
    }, 100);

    animate();

    return {
      destroy: function () {
        cancelAnimationFrame(raf);
        observer.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("resize", onResize);
        streams.forEach(function (s) {
          s.geometry.dispose();
          s.material.dispose();
          scene.remove(s.points);
        });
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      },
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var el = document.getElementById("focus-fabric-canvas");
    // Desktop only — mobile uses the stacked fallback
    if (el && window.matchMedia("(min-width: 992px)").matches) {
      initFocusFabric(el);
    }
  });
})();

/* figures.js - shared animation module for article figures. Vanilla, no requests, no inline handlers.

   CONTRACT
   Markup: <figure class="fig" data-fig="NAME"> containing an inline <svg viewBox> (width 100%) or HTML,
   a <figcaption>, and optional controls. Load figures.css + figures.js once per page.
   - data-step="N" on an element: revealed in ascending N (fade + rise); gap = figure data-step-ms (default 450).
     Descendants with .grow scale in from 0 on X (bars). Static markup is the FINAL frame (no-JS safe).
   - path[data-draw] (with its own data-step): draws itself (stroke-dashoffset). Arrow heads: .head + same data-step.
   - [data-count="N"] (optional data-count-ms): counts up from 0 when its step element is revealed.
   - [data-pop]: left hidden until figure code adds .on (markers driven by a custom entry).
   - g[data-flow="PATH_ID"] (data-flow-color="gold|muted", data-flow-period ms, default 3500): after the entry,
     three calm dots travel along that path.
   - Entry starts once when 35% of the figure is visible. A text "Replay" button is added under the figure.
     A figure narrower than 480 px gets .fig-fast and runs its entry at double speed (stagger, draws, count-up).
   - Mechanism loops: Figures.register(name, {entry(el,done), final(el), reset(el), start(el), stop(el)}).
     entry runs beside the steps (call done() when finished); start runs after the entry while the figure is visible
     and not hovered (may return a cleanup function); stop runs when it leaves view or on hover.
     Fragments may queue early: (window.FigureQ = window.FigureQ || []).push([name, hooks]).
   - Figures.tween(el, ms, fn(p), done), Figures.count(node), Figures.stepper(figureEl, {steps, interval}).
   - prefers-reduced-motion: reduce, or #final in the URL: every figure renders its final frame, no loops, no Replay. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINAL = location.hash === '#final';
  var hooks = {}, ready = false, io = null;

  function all(el, sel) { return Array.prototype.slice.call(el.querySelectorAll(sel)); }
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

  /* ---------- helpers ---------- */
  function tween(el, ms, fn, done) {
    var st = el._f, run = st && st.run, t0 = null;
    function f(t) {
      if (st && st.run !== run) return;
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / ms);
      fn(p);
      if (p < 1) requestAnimationFrame(f); else if (done) done();
    }
    requestAnimationFrame(f);
  }

  function countOne(fig, node) {
    var to = +node.getAttribute('data-count'), ms = (+node.getAttribute('data-count-ms') || 1200) / (fig && fig.classList.contains('fig-fast') ? 2 : 1);
    node.textContent = '0';
    tween(fig, ms, function (p) { node.textContent = fmt(to * (1 - Math.pow(1 - p, 3))); },
      function () { node.textContent = fmt(to); });
  }
  function count(node) {
    var fig = node.closest('.fig');
    var list = all(node, '[data-count]');
    if (node.hasAttribute('data-count')) list.push(node);
    list.forEach(function (n) { countOne(fig, n); });
  }

  function register(name, h) {
    hooks[name] = h;
    if (ready) all(document, '.fig[data-fig="' + name + '"]').forEach(function (el) { if (!el._f) setup(el); });
  }

  /* ---------- figure state ---------- */
  function drawPrep(el, drawn) {
    all(el, '[data-draw]').forEach(function (p) {
      var len = p.getTotalLength ? p.getTotalLength() : 0;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = drawn ? 0 : len;
    });
  }

  function final(st) {
    var el = st.el;
    st.run++;
    el.classList.add('fig-reset');
    all(el, '[data-step],[data-pop]').forEach(function (n) { n.classList.add('on'); });
    drawPrep(el, true);
    if (st.h.final) st.h.final(el);
    void el.offsetWidth;
    el.classList.remove('fig-reset');
  }

  function stopAll(st) {
    st.timers.forEach(clearTimeout);
    st.timers = [];
    if (st.looping) {
      st.looping = false;
      if (st.h.stop) st.h.stop(st.el);
      if (st.cleanup) { st.cleanup(); st.cleanup = null; }
      if (st.flowStop) { st.flowStop(); st.flowStop = null; }
    }
  }

  function reset(st) {
    var el = st.el;
    stopAll(st);
    st.run++;
    el.classList.add('fig-reset');
    all(el, '[data-step],[data-pop]').forEach(function (n) { n.classList.remove('on'); });
    drawPrep(el, false);
    if (st.h.reset) st.h.reset(el);
    void el.offsetWidth;
    el.classList.remove('fig-reset');
  }

  function enter(st) {
    var el = st.el;
    reset(st);
    st.state = 'entering';
    var fast = el.getBoundingClientRect().width < 480;
    el.classList.toggle('fig-fast', fast);
    var run = st.run, gap = (+el.getAttribute('data-step-ms') || 450) / (fast ? 2 : 1);
    var nodes = all(el, '[data-step]');
    var steps = [];
    nodes.forEach(function (n) { var s = +n.getAttribute('data-step'); if (steps.indexOf(s) < 0) steps.push(s); });
    steps.sort(function (a, b) { return a - b; });
    var pending = 1 + (st.h.entry ? 1 : 0);
    function part() {
      if (st.run !== run) return;
      if (--pending === 0) { st.state = 'live'; sync(st); }
    }
    steps.forEach(function (s, i) {
      st.timers.push(setTimeout(function () {
        nodes.forEach(function (n) {
          if (+n.getAttribute('data-step') !== s) return;
          n.classList.add('on');
          if (n.hasAttribute('data-draw')) n.style.strokeDashoffset = 0;
          all(n, '[data-draw]').forEach(function (d) { d.style.strokeDashoffset = 0; });
          count(n);
        });
      }, i * gap + 60));
    });
    st.timers.push(setTimeout(part, steps.length * gap + (fast ? 350 : 700)));
    if (st.h.entry) st.timers.push(setTimeout(function () { st.h.entry(el, part); }, 60));
  }

  /* ---------- flow dots along paths ---------- */
  function startFlows(st) {
    var items = [];
    all(st.el, '[data-flow]').forEach(function (g) {
      var path = st.el.querySelector('#' + g.getAttribute('data-flow'));
      if (!path) return;
      var cls = g.getAttribute('data-flow-color') === 'gold' ? 'flow-gold' : 'flow-muted';
      var dots = [];
      for (var i = 0; i < 3; i++) {
        var c = document.createElementNS(g.namespaceURI, 'circle');
        c.setAttribute('r', 5); c.setAttribute('class', cls); c.setAttribute('opacity', 0);
        g.appendChild(c); dots.push(c);
      }
      items.push({ path: path, len: path.getTotalLength(), dots: dots, period: +g.getAttribute('data-flow-period') || 3500 });
    });
    if (!items.length) return null;
    var raf, t0 = performance.now();
    function tick(t) {
      items.forEach(function (it) {
        it.dots.forEach(function (c, i) {
          var p = (((t - t0) / it.period) + i / it.dots.length) % 1, pt = it.path.getPointAtLength(p * it.len);
          c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y);
          c.setAttribute('opacity', (Math.sin(Math.PI * p) * 0.6).toFixed(2));
        });
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function () {
      cancelAnimationFrame(raf);
      items.forEach(function (it) { it.dots.forEach(function (c) { c.setAttribute('opacity', 0); }); });
    };
  }

  /* start/stop loops: only live + visible + not hovered + tab visible */
  function sync(st) {
    var should = st.state === 'live' && st.vis && !st.hover && !document.hidden;
    if (should && !st.looping) {
      st.looping = true;
      var r = st.h.start && st.h.start(st.el);
      if (typeof r === 'function') st.cleanup = r;
      st.flowStop = startFlows(st);
    } else if (!should && st.looping) {
      stopAll(st);
    }
  }

  function setup(el) {
    var st = el._f = { el: el, h: hooks[el.getAttribute('data-fig')] || {}, run: 0, state: 'idle',
      vis: false, hover: false, looping: false, timers: [], started: false };
    el.classList.add('js');
    if (reduce || FINAL) { st.state = 'final'; final(st); return; }
    drawPrep(el, false);
    var cap = el.querySelector('figcaption');
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'fig-replay'; btn.textContent = 'Replay';
    btn.addEventListener('click', function () { st.started = true; enter(st); });
    if (cap && cap.parentNode === el) cap.parentNode.insertBefore(btn, cap.nextSibling); else el.appendChild(btn);
    el.addEventListener('mouseenter', function () { st.hover = true; sync(st); });
    el.addEventListener('mouseleave', function () { st.hover = false; sync(st); });
    if (io) io.observe(el);
    else { st.started = true; enter(st); }
  }

  function init() {
    ready = true;
    if ('IntersectionObserver' in window && !(reduce || FINAL)) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var st = e.target._f;
          if (!st) return;
          st.vis = e.isIntersecting;
          if (!st.started && e.intersectionRatio >= 0.35) { st.started = true; enter(st); }
          sync(st);
        });
      }, { threshold: [0, 0.35] });
    }
    all(document, '.fig[data-fig]').forEach(function (el) { if (!el._f) setup(el); });
    document.addEventListener('visibilitychange', function () {
      all(document, '.fig').forEach(function (el) { if (el._f) sync(el._f); });
    });
  }

  /* ---------- stepper: dots + arrow keys for guided figures ---------- */
  function stepper(el, opts) {
    var steps = opts.steps, n = typeof steps === 'number' ? steps : steps.length, i = 0, timer = null;
    var box = document.createElement('div');
    box.className = 'fig-dots'; box.tabIndex = 0;
    box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Figure steps');
    var btns = [];
    for (var k = 0; k < n; k++) {
      (function (k) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', 'Step ' + (k + 1));
        b.addEventListener('click', function () { go(k); });
        box.appendChild(b); btns.push(b);
      })(k);
    }
    var cap = el.querySelector('figcaption');
    el.insertBefore(box, cap || null);
    function go(k) {
      i = (k + n) % n;
      btns.forEach(function (b, j) { b.classList.toggle('on', j === i); });
      if (typeof steps[i] === 'function') steps[i](i);
    }
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
    });
    if (reduce || FINAL) { go(n - 1); return { go: go }; }
    go(0);
    if (opts.interval) {
      var run = function () { if (!timer) timer = setInterval(function () { go(i + 1); }, opts.interval); };
      var halt = function () { clearInterval(timer); timer = null; };
      el.addEventListener('mouseenter', halt); el.addEventListener('mouseleave', run);
      box.addEventListener('focus', halt); box.addEventListener('blur', run);
      run();
    }
    return { go: go };
  }

  window.Figures = { register: register, tween: tween, count: count, stepper: stepper };
  var q = window.FigureQ || [];
  window.FigureQ = { push: function (a) { register(a[0], a[1]); } };
  q.forEach(function (a) { register(a[0], a[1]); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ============================================
   IMADUDDIN ZANGI — PORTFOLIO INTERACTIONS
   ============================================ */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  // ============================================
  // LOADER — count up to 100, then dismiss
  // ============================================
  function initLoader() {
    const loader = document.getElementById('loader');
    const count = document.getElementById('loaderCount');
    if (!loader || !count) return;

    if (prefersReducedMotion) {
      loader.classList.add('is-done');
      document.body.dispatchEvent(new CustomEvent('loaderDone'));
      return;
    }

    let n = 0;
    const total = 100;
    const duration = 2400;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      n = Math.floor(eased * total);
      count.textContent = String(n).padStart(2, '0');

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        count.textContent = '100';
        setTimeout(() => {
          loader.classList.add('is-done');
          document.body.dispatchEvent(new CustomEvent('loaderDone'));
        }, 280);
      }
    }
    requestAnimationFrame(tick);
  }

  // ============================================
  // CUSTOM CURSOR — ring follows lazy, dot follows tight
  // ============================================
  function initCursor() {
    if (isTouch) return;

    const ring = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    if (!ring || !dot) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      // dot follows immediately
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    function loop() {
      // ring lerps for that "trailing" feel
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    // hover state on links/buttons
    const hoverables = document.querySelectorAll('a, button, [data-project], .project, .stack__card, .magnetic, .bio__stat, .contact__channels a');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
    });
  }

  // ============================================
  // MAGNETIC BUTTONS — buttons that lean toward your cursor
  // ============================================
  function initMagnetic() {
    if (isTouch || prefersReducedMotion) return;

    const elements = document.querySelectorAll('.magnetic');
    elements.forEach(el => {
      const strength = 0.25;
      const radius = 100;

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius * 2) {
          el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
        }
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform 0.6s cubic-bezier(.22,1,.36,1)';
        setTimeout(() => { el.style.transition = ''; }, 600);
      });
    });
  }

  // ============================================
  // LIVE CLOCK — Pakistan time (UTC+5)
  // ============================================
  function initClock() {
    const el = document.getElementById('liveTime');
    if (!el) return;
    function update() {
      const now = new Date();
      // Show in PKT (UTC+5)
      const opts = { timeZone: 'Asia/Karachi', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
      el.textContent = now.toLocaleTimeString('en-GB', opts) + ' PKT';
    }
    update();
    setInterval(update, 1000);
  }

  // ============================================
  // SCROLL REVEAL — projects fade in as they enter
  // ============================================
  function initScrollReveal() {
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      document.querySelectorAll('[data-project]').forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('[data-project]').forEach(el => observer.observe(el));

    // Safety net: any element above the current viewport on first paint
    // gets revealed immediately so deep-links (#contact etc.) don't land on
    // invisible content if the user jumps past projects.
    requestAnimationFrame(() => {
      document.querySelectorAll('[data-project]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-visible');
        }
      });
    });
  }

  // ============================================
  // STAT COUNTERS — count from 0 to target on view
  // ============================================
  function initCounters() {
    const stats = document.querySelectorAll('.bio__stat-num');
    if (!stats.length) return;

    if (prefersReducedMotion) {
      stats.forEach(el => { el.textContent = el.dataset.count; });
      return;
    }

    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const eased = 1 - Math.pow(1 - progress, 4);
        const value = Math.round(eased * target);
        el.textContent = value;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      stats.forEach(animateCount);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(el => observer.observe(el));
  }

  // ============================================
  // TERMINAL — type-on script with prompts/output
  // ============================================
  function initTerminal() {
    const terminal = document.getElementById('terminal');
    if (!terminal) return;

    // The "process" script — comments + commands + output
    const lines = [
      { type: 'comment', text: 'Engineering process — distilled' },
      { type: 'prompt', text: 'cat <span class="accent">requirements.md</span>' },
      { type: 'output', text: '> Listen. Map the actual constraint, not the stated one.' },
      { type: 'prompt', text: 'init <span class="accent">schema.sql</span>' },
      { type: 'output', text: '> 17 tables · 4 enums · 12 indexes · 0 over-engineering' },
      { type: 'success', text: '✓ migrations: clean' },
      { type: 'prompt', text: 'nest g module <span class="ink">core</span>' },
      { type: 'output', text: '> CREATE   src/core/core.module.ts' },
      { type: 'output', text: '> CREATE   src/core/core.controller.ts' },
      { type: 'output', text: '> CREATE   src/core/core.service.ts' },
      { type: 'prompt', text: 'jest --coverage' },
      { type: 'output', text: '> Tests: <span class="accent">142 passed</span>, 142 total' },
      { type: 'output', text: '> Coverage: <span class="accent">87.4%</span> · threshold met' },
      { type: 'success', text: '✓ ready to ship' },
      { type: 'prompt', text: 'deploy --prod', cursor: true },
    ];

    function appendLine(line, idx) {
      const div = document.createElement('div');
      div.className = `term-line is-${line.type}`;
      div.style.animationDelay = `${idx * 0.18}s`;
      div.innerHTML = line.text + (line.cursor ? '<span class="term-cursor"></span>' : '');
      terminal.appendChild(div);
    }

    function startTerminal() {
      terminal.innerHTML = '';
      lines.forEach((line, i) => appendLine(line, i));
    }

    // Trigger when terminal scrolls into view
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      startTerminal();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startTerminal();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(terminal);
  }

  // ============================================
  // NAV BACKGROUND — solidify on scroll
  // ============================================
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let last = 0;
    function onScroll() {
      const y = window.scrollY;
      if (y > 60) {
        nav.style.background = 'rgba(13,12,10,0.92)';
        nav.style.borderBottom = '1px solid var(--line-soft)';
      } else {
        nav.style.background = '';
        nav.style.borderBottom = '';
      }
      last = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ============================================
  // PARALLAX HERO GRID — subtle drift on mouse
  // ============================================
  function initHeroParallax() {
    if (isTouch || prefersReducedMotion) return;

    const grid = document.querySelector('.hero__grid');
    if (!grid) return;

    let tx = 0, ty = 0;
    let cx = 0, cy = 0;

    document.addEventListener('mousemove', (e) => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      tx = ((e.clientX / cw) - 0.5) * -40;
      ty = ((e.clientY / ch) - 0.5) * -40;
    });

    function loop() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      grid.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    }
    loop();
  }

  // ============================================
  // BOOT
  // ============================================
  function boot() {
    initLoader();
    initCursor();
    initMagnetic();
    initClock();
    initScrollReveal();
    initCounters();
    initTerminal();
    initNavScroll();
    initHeroParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

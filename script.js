/* ═══════════════════════════════════════════════════════════
   SIDHANSU KESHRI PORTFOLIO — INTERACTIONS
   ═══════════════════════════════════════════════════════════
   Pure vanilla JS. No jQuery, no Owl Carousel, no Typed.js.
   Using: native DOM, Intersection Observer, Canvas API,
          requestAnimationFrame, pointer events.
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── Utility: respect reduced motion preference ───────────────
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const isSmallScreen = window.innerWidth < 640;

// ════════════════════════════════════════════════════════════
// 1. SCROLL PROGRESS BAR
// ════════════════════════════════════════════════════════════
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollY  = window.scrollY;
    const docH     = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docH > 0 ? (scrollY / docH) * 100 : 0;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

// ════════════════════════════════════════════════════════════
// 2. NAVBAR — scroll state & active section indicator
// ════════════════════════════════════════════════════════════
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sections = ['hero', 'work', 'about', 'credentials', 'contact'];
  if (!navbar) return;

  // Scroll sticky
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active section via IntersectionObserver
  const sectionEls = sections
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sectionEls.forEach(el => observer.observe(el));
})();

// ════════════════════════════════════════════════════════════
// 3. MOBILE MENU
// ════════════════════════════════════════════════════════════
(function initMobileMenu() {
  const toggle    = document.getElementById('mobile-menu-toggle');
  const menu      = document.getElementById('mobile-menu');
  const closeBtn  = document.getElementById('mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  if (!toggle || !menu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Enable tabbing inside
    mobileLinks.forEach(l => l.removeAttribute('tabindex'));
  }

  function closeMenu() {
    isOpen = false;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Disable tabbing inside
    mobileLinks.forEach(l => l.setAttribute('tabindex', '-1'));
  }

  toggle.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
  closeBtn && closeBtn.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (isOpen && e.key === 'Escape') closeMenu();
  });
})();

// ════════════════════════════════════════════════════════════
// 4. CUSTOM CURSOR (desktop only)
// ════════════════════════════════════════════════════════════
(function initCursor() {
  if (isTouchDevice || prefersReducedMotion) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const label = document.getElementById('cursor-label');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  // Update dot immediately
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left  = `${mouseX}px`;
    dot.style.top   = `${mouseY}px`;
  });

  // Ring follows with lerp
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = `${ringX}px`;
    ring.style.top  = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Cursor states
  function setCursorState(state, text) {
    document.body.classList.remove('cursor-view', 'cursor-open');
    if (state) document.body.classList.add(`cursor-${state}`);
    label.textContent = text || '';
  }

  // Project cards → VIEW
  document.querySelectorAll('.project-card').forEach(el => {
    el.addEventListener('mouseenter', () => setCursorState('view', 'View'));
    el.addEventListener('mouseleave', () => setCursorState(null));
  });

  // External links → OPEN
  document.querySelectorAll('a[target="_blank"]').forEach(el => {
    el.addEventListener('mouseenter', () => setCursorState('open', 'Open'));
    el.addEventListener('mouseleave', () => setCursorState(null));
  });

  // Click feedback
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  // Hide on leave
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

// ════════════════════════════════════════════════════════════
// 5. MAGNETIC BUTTONS
// ════════════════════════════════════════════════════════════
(function initMagnetic() {
  if (isTouchDevice || prefersReducedMotion) return;

  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    const strength = 0.3;

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * strength;
      const dy   = (e.clientY - cy) * strength;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

// ════════════════════════════════════════════════════════════
// 6. SCROLL REVEAL — Intersection Observer
// ════════════════════════════════════════════════════════════
(function initReveal() {
  const elements = document.querySelectorAll('.reveal-fade, .reveal-slide');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px', threshold: 0.05 }
  );

  elements.forEach(el => observer.observe(el));

  // Fallback: If elements are still hidden after 2 seconds (e.g. observer failed or they didn't scroll), show them
  setTimeout(() => {
    elements.forEach(el => el.classList.add('visible'));
  }, 2000);
})();

// ════════════════════════════════════════════════════════════
// 7. HERO CANVAS — Dense Interactive Star Cloud + Neural Constellation
// ════════════════════════════════════════════════════════════
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  if (isSmallScreen) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H;
  let animId = null;
  let isVisible = true;

  // Mouse/cursor state
  let mx = -9999, my = -9999;
  let prevMx = -9999, prevMy = -9999;
  let cursorVelX = 0, cursorVelY = 0;

  // ── Configuration ──────────────────────────────────────────
  const NODE_COUNT      = 300;   // interactive constellation nodes
  const STAR_COUNT      = 840;   // pure background twinkling stars
  const MAX_DIST        = 160;   // connection draw distance
  const CURSOR_RADIUS   = 220;   // attraction radius
  const CURSOR_PULL     = 0.032; // pull strength
  const REPULSE_RADIUS  = 90;    // click-burst repulsion radius
  const REPULSE_FORCE   = 6;     // click-burst strength

  // Accent colors
  const ACCENT_R = 124, ACCENT_G = 106, ACCENT_B = 247;

  // ── Background twinkling stars ─────────────────────────────
  class Star {
    constructor() { this.init(); }
    init() {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.2 + 0.2;
      this.base  = Math.random() * 0.6 + 0.1;
      this.alpha = this.base;
      this.phase = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.022 + 0.005;
      this.hue   = Math.random() < 0.2 ? 220 : 260; // some warm-blue tint
    }
    update() {
      this.phase += this.speed;
      this.alpha  = this.base + Math.sin(this.phase) * 0.35;
      this.alpha  = Math.max(0.02, Math.min(1, this.alpha));

      // Very subtle cursor attraction for background stars too
      const dx = mx - this.x;
      const dy = my - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 180 && d > 0) {
        const f = (180 - d) / 180;
        this.x += dx * 0.004 * f;
        this.y += dy * 0.004 * f;
      }
    }
    draw() {
      // Glow halo for larger stars
      if (this.r > 0.9) {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 4);
        g.addColorStop(0, `hsla(${this.hue},90%,85%,${this.alpha * 0.35})`);
        g.addColorStop(1, `hsla(${this.hue},90%,85%,0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      // Core
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},90%,92%,${this.alpha})`;
      ctx.fill();
    }
  }

  // ── Interactive constellation nodes ────────────────────────
  class Node {
    constructor() { this.reset(); }
    reset() {
      this.x   = Math.random() * W;
      this.y   = Math.random() * H;
      this.ox  = this.x;
      this.oy  = this.y;
      this.vx  = (Math.random() - 0.5) * 0.35;
      this.vy  = (Math.random() - 0.5) * 0.35;
      this.r   = Math.random() * 1.8 + 0.6;
      this.opacity = Math.random() * 0.55 + 0.3;
      this.twPhase = Math.random() * Math.PI * 2;
      this.twSpeed = Math.random() * 0.025 + 0.005;
    }

    update() {
      // Twinkle opacity
      this.twPhase  += this.twSpeed;
      this.opacity   = 0.3 + Math.sin(this.twPhase) * 0.25 + 0.15;

      // Drift
      this.x += this.vx;
      this.y += this.vy;

      // Cursor gravity
      const dx   = mx - this.x;
      const dy   = my - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CURSOR_RADIUS && dist > 0) {
        const force = (CURSOR_RADIUS - dist) / CURSOR_RADIUS;
        // Also add cursor velocity "dragging" effect
        this.x += (dx * CURSOR_PULL + cursorVelX * 0.06) * force;
        this.y += (dy * CURSOR_PULL + cursorVelY * 0.06) * force;
      }

      // Soft spring back
      this.x += (this.ox - this.x) * 0.004;
      this.y += (this.oy - this.y) * 0.004;

      // Boundary wrap
      if (this.x < -20)    { this.x = W + 20; this.ox = this.x; }
      if (this.x > W + 20) { this.x = -20;    this.ox = this.x; }
      if (this.y < -20)    { this.y = H + 20; this.oy = this.y; }
      if (this.y > H + 20) { this.y = -20;    this.oy = this.y; }
    }

    draw() {
      // Glow halo
      if (this.r > 1.2) {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5);
        g.addColorStop(0, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${this.opacity * 0.4})`);
        g.addColorStop(1, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      // Core dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${this.opacity})`;
      ctx.fill();
    }
  }

  let stars = [];
  let nodes = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    stars = Array.from({ length: STAR_COUNT }, () => new Star());
    nodes = Array.from({ length: NODE_COUNT  }, () => new Node());
  }

  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a  = nodes[i];
        const b  = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  function drawCursorGlow() {
    if (mx < 0 || my < 0) return;
    // Inner bright glow
    const g1 = ctx.createRadialGradient(mx, my, 0, mx, my, 120);
    g1.addColorStop(0, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.10)`);
    g1.addColorStop(1, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0)`);
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    // Outer soft halo
    const g2 = ctx.createRadialGradient(mx, my, 0, mx, my, 320);
    g2.addColorStop(0, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.04)`);
    g2.addColorStop(1, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0)`);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  let lastTime = 0;
  const TARGET_FPS = 50;
  const FRAME_MS   = 1000 / TARGET_FPS;

  function render(timestamp) {
    if (!isVisible) { animId = requestAnimationFrame(render); return; }

    const elapsed = timestamp - lastTime;
    if (elapsed < FRAME_MS) { animId = requestAnimationFrame(render); return; }
    lastTime = timestamp - (elapsed % FRAME_MS);

    ctx.clearRect(0, 0, W, H);

    // Update cursor velocity
    cursorVelX = mx - prevMx;
    cursorVelY = my - prevMy;
    prevMx = mx;
    prevMy = my;

    drawCursorGlow();

    // Draw background stars first (underneath everything)
    stars.forEach(s => { s.update(); s.draw(); });

    // Draw constellation nodes + connections on top
    nodes.forEach(n => { n.update(); n.draw(); });
    drawConnections();

    animId = requestAnimationFrame(render);
  }

  // Track mouse relative to canvas
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
  }, { passive: true });

  document.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  // Click burst — repulse nearby nodes outward
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    nodes.forEach(n => {
      const dx = n.x - cx;
      const dy = n.y - cy;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < REPULSE_RADIUS && d > 0) {
        const force = (REPULSE_RADIUS - d) / REPULSE_RADIUS;
        n.vx += (dx / d) * REPULSE_FORCE * force;
        n.vy += (dy / d) * REPULSE_FORCE * force;
        // Clamp velocity so nodes don't fly off screen
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > 8) { n.vx = (n.vx / spd) * 8; n.vy = (n.vy / spd) * 8; }
      }
    });
  });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    isVisible = document.visibilityState === 'visible';
  });

  // Resize handling (debounced)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 200);
  });

  resize();

  if (!prefersReducedMotion) {
    animId = requestAnimationFrame(render);
  }
})();

// ════════════════════════════════════════════════════════════
// 8. MAZE CANVAS VISUAL — Procedural mini-maze
// ════════════════════════════════════════════════════════════
// 8. MAZE CANVAS VISUAL — Procedural maze generator & solver
// ════════════════════════════════════════════════════════════
(function initMazeCanvas() {
  const canvas = document.querySelector('.maze-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W   = canvas.width  || 320;
  const H   = canvas.height || 200;
  const CELL = 20;
  const COLS  = Math.floor(W / CELL);
  const ROWS  = Math.floor(H / CELL);

  let walls; // walls[r][c] = { N: bool, E: bool, S: bool, W: bool }
  let path = [];
  let pathProgress = 0;
  let pauseTimer = 0;
  const PATH_SPEED = 0.45; // cells per frame

  // Generate perfect maze using Randomized DFS (Recursive Backtracker)
  function generateMaze() {
    walls = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ N: true, E: true, S: true, W: true, visited: false }))
    );

    const stack = [[0, 0]];
    walls[0][0].visited = true;

    const neighbors = [
      [-1, 0, 'N', 'S'],
      [0,  1, 'E', 'W'],
      [1,  0, 'S', 'N'],
      [0, -1, 'W', 'E']
    ];

    while (stack.length > 0) {
      const [cr, cc] = stack[stack.length - 1];
      const unvisited = [];

      for (const [dr, dc, dir, oppDir] of neighbors) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !walls[nr][nc].visited) {
          unvisited.push([nr, nc, dir, oppDir]);
        }
      }

      if (unvisited.length > 0) {
        const [nr, nc, dir, oppDir] = unvisited[Math.floor(Math.random() * unvisited.length)];
        walls[cr][cc][dir] = false;
        walls[nr][nc][oppDir] = false;
        walls[nr][nc].visited = true;
        stack.push([nr, nc]);
      } else {
        stack.pop();
      }
    }
  }

  // Solve maze using BFS to find exact shortest path from (0,0) to (ROWS-1, COLS-1)
  function solveMaze() {
    const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
    const parent  = Array.from({ length: ROWS }, () => new Array(COLS).fill(null));
    const queue   = [[0, 0]];
    visited[0][0] = true;

    const dirs = [
      [-1, 0, 'N'],
      [0,  1, 'E'],
      [1,  0, 'S'],
      [0, -1, 'W']
    ];

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      if (r === ROWS - 1 && c === COLS - 1) break;

      for (const [dr, dc, dir] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        // Check boundaries & walls
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (!visited[nr][nc] && !walls[r][c][dir]) {
            visited[nr][nc] = true;
            parent[nr][nc]  = [r, c];
            queue.push([nr, nc]);
          }
        }
      }
    }

    // Reconstruct path
    path = [];
    let curr = [ROWS - 1, COLS - 1];
    while (curr) {
      path.unshift(curr);
      curr = parent[curr[0]][curr[1]];
    }
  }

  function resetMazeAndSolver() {
    generateMaze();
    solveMaze();
    pathProgress = 0;
    pauseTimer = 0;
  }

  resetMazeAndSolver();

  const ACCENT_COLOR = 'rgba(124,106,247,0.95)';
  const GLOW_COLOR   = 'rgba(124,106,247,0.4)';
  const WALL_COLOR   = 'rgba(124,106,247,0.2)';

  function render() {
    ctx.clearRect(0, 0, W, H);

    // 1. Draw Maze Walls
    ctx.strokeStyle = WALL_COLOR;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * CELL;
        const y = r * CELL;
        if (walls[r][c].N) { ctx.moveTo(x, y); ctx.lineTo(x + CELL, y); }
        if (walls[r][c].E) { ctx.moveTo(x + CELL, y); ctx.lineTo(x + CELL, y + CELL); }
        if (walls[r][c].S) { ctx.moveTo(x, y + CELL); ctx.lineTo(x + CELL, y + CELL); }
        if (walls[r][c].W) { ctx.moveTo(x, y); ctx.lineTo(x, y + CELL); }
      }
    }
    ctx.stroke();

    // Start & End indicator dots
    ctx.fillStyle = '#3d9e6e'; // Green start
    ctx.beginPath();
    ctx.arc(CELL / 2, CELL / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7c6af7'; // Purple end
    ctx.beginPath();
    ctx.arc((COLS - 0.5) * CELL, (ROWS - 0.5) * CELL, 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Animated Path Trail
    if (path.length > 1) {
      if (pathProgress < path.length - 1) {
        pathProgress += PATH_SPEED;
      } else {
        pauseTimer++;
        if (pauseTimer > 90) { // Pause ~1.5s then regenerate fresh maze
          resetMazeAndSolver();
        }
      }

      const drawCount = Math.min(Math.floor(pathProgress), path.length - 1);

      // Glow backing
      ctx.strokeStyle = GLOW_COLOR;
      ctx.lineWidth   = 4;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.beginPath();
      for (let i = 0; i <= drawCount; i++) {
        const [r, c] = path[i];
        const px = c * CELL + CELL / 2;
        const py = r * CELL + CELL / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Sharp accent path line
      ctx.strokeStyle = ACCENT_COLOR;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      for (let i = 0; i <= drawCount; i++) {
        const [r, c] = path[i];
        const px = c * CELL + CELL / 2;
        const py = r * CELL + CELL / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Active runner head
      const headIdx = Math.min(drawCount, path.length - 1);
      const [hr, hc] = path[headIdx];
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hc * CELL + CELL / 2, hr * CELL + CELL / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (!prefersReducedMotion) {
    (function loop() {
      render();
      requestAnimationFrame(loop);
    })();
  } else {
    render();
  }
})();

// ════════════════════════════════════════════════════════════
// 9. CREDENTIALS STRIP — drag to scroll
// ════════════════════════════════════════════════════════════
(function initCredsStrip() {
  const wrap = document.querySelector('.creds-strip-wrap');
  if (!wrap) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  wrap.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX     = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
    wrap.style.userSelect = 'none';
  });

  wrap.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x  = e.pageX - wrap.offsetLeft;
    const dx = (x - startX) * 1.2;
    wrap.scrollLeft = scrollLeft - dx;
  });

  ['mouseup', 'mouseleave'].forEach(ev => {
    wrap.addEventListener(ev, () => {
      isDragging = false;
      wrap.style.userSelect = '';
    });
  });
})();

// ════════════════════════════════════════════════════════════
// 10. SMOOTH ANCHOR SCROLLING
// ════════════════════════════════════════════════════════════
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-h') || '72'
      );
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ════════════════════════════════════════════════════════════
// 11. 3D CARD TILT ON HOVER
// ════════════════════════════════════════════════════════════
(function initCardTilt() {
  if (isTouchDevice || prefersReducedMotion) return;

  const cards = document.querySelectorAll('.project-card, .cap-group');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      const cx   = rect.width / 2;
      const cy   = rect.height / 2;
      const rx   = ((cy - y) / cy) * 6; // Max 6 deg tilt X
      const ry   = ((x - cx) / cx) * 6; // Max 6 deg tilt Y
      card.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ════════════════════════════════════════════════════════════
// 12. GLOBAL STARFIELD — Full-page dense interactive star cloud
//
//  Visual layers (back → front):
//    1. Cursor glow         — dual-ring radial purple halo around mouse
//    2. Shooting stars      — autonomous diagonal streaks, random interval
//    3. Background stars    — 840 twinkling dots with parallax depth
//    4. Constellation nodes — 120 purple nodes pulled by cursor
//    5. Connection lines    — fade by distance between nearby nodes
//
//  Scroll behaviour:
//    - Stars have a `depth` value (0.3–1.0). On scroll, each star shifts
//      by scrollDelta × (1 − depth) × PARALLAX, creating a subtle multi-
//      layer parallax rather than jarring velocity streaks.
//    - New stars spawn (with fade-in) at the leading viewport edge every
//      scroll event — so the sky stays fully populated as you scroll.
//
//  Cursor behaviour:
//    - Stars softly attract toward cursor within 200px.
//    - Nodes strongly attract within 220px; they also inherit cursor drag
//      velocity so fast sweeps leave a visible ripple.
//    - Click anywhere → nearby nodes burst outward.
// ════════════════════════════════════════════════════════════
(function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H; // canvas dimensions, updated on resize

  // ── Pointer / cursor tracking ──────────────────────────────
  let mouseX = -9999, mouseY = -9999; // current cursor position (viewport px)
  let prevMX = -9999, prevMY = -9999; // previous frame cursor position
  let mVelX  = 0,     mVelY  = 0;    // cursor velocity (for drag effect)

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });
  document.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  // ── Scroll tracking ────────────────────────────────────────
  // scrollDelta: pixels scrolled since last frame — decays each frame
  let lastScrollY = window.scrollY;
  let scrollDelta = 0; // signed scroll amount applied per-frame for parallax

  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    scrollDelta += (cur - lastScrollY); // accumulate between frames
    lastScrollY  = cur;
    spawnScrollStars(cur - lastScrollY || 0);
  }, { passive: true });

  // ── Resize ─────────────────────────────────────────────────
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initParticles(); // reinitialize all particles on resize
  }
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(resize, 200);
  }, { passive: true });

  // ── Constants ──────────────────────────────────────────────
  const STAR_COUNT    = 840;   // background twinkling stars
  const NODE_COUNT    = 120;   // interactive purple constellation nodes
  const MAX_CONN_DIST = 150;   // max px between nodes to draw a line
  const CURSOR_RAD    = 220;   // node cursor-attraction radius (px)
  const PULL_STR      = 0.028; // node pull strength per frame
  const REP_RAD       = 100;   // click-burst repulsion radius (px)
  const REP_FORCE     = 5;     // click-burst impulse magnitude
  const PARALLAX      = 0.14;  // scroll parallax factor — lower = subtler shift
  const STAR_CUR_RAD  = 200;   // star cursor-attraction radius (px)

  // Shooting-star spawn timing
  const SHOOT_MIN_MS  = 2200;  // min gap between shooting stars (ms)
  const SHOOT_MAX_MS  = 5500;  // max gap
  let   nextShootTime = 0;     // timestamp (ts) when next shoot is allowed

  // Accent purple in RGB
  const ACCENT_R = 124, ACCENT_G = 106, ACCENT_B = 247;

  // ══════════════════════════════════════════════════════════
  // CLASS: Star — background twinkling star
  //
  //  Each star has a `depth` (0.3–0.95) used for parallax scroll.
  //  Depth ≈ 1  → foreground, scrolls faster (slightly)
  //  Depth ≈ 0.3 → deep background, barely shifts on scroll
  //
  //  `fadeIn` goes 0→1 over ~40 frames, used for stars that
  //  spawn mid-scroll so they don't pop in abruptly.
  // ══════════════════════════════════════════════════════════
  class Star {
    /**
     * @param {number|undefined} spawnY - if set, place star at this Y
     *   (used when spawning at viewport edges during scroll)
     */
    constructor(spawnY) { this.init(spawnY); }

    init(spawnY) {
      this.x     = Math.random() * W;
      this.y     = spawnY !== undefined ? spawnY : Math.random() * H;
      this.depth = Math.random() * 0.65 + 0.3; // parallax depth layer
      this.r     = Math.random() * 1.6 + 0.25;
      this.base  = Math.random() * 0.6 + 0.1;  // base opacity
      this.alpha = this.base;
      this.twSpeed = Math.random() * 0.02  + 0.004; // twinkle oscillation speed
      this.twPhase = Math.random() * Math.PI * 2;
      this.vx    = (Math.random() - 0.5) * 0.06; // slow random drift
      this.vy    = (Math.random() - 0.5) * 0.06;
      this.hue   = Math.random() < 0.25 ? 220 : 260; // warm-blue or purple tint
      // Stars spawned at scroll edges fade in so they don't pop
      this.fadeIn = spawnY !== undefined ? 0 : 1;
    }

    update() {
      // ── Fade in (scroll-spawned stars only) ────────────────
      if (this.fadeIn < 1) this.fadeIn = Math.min(1, this.fadeIn + 0.03);

      // ── Twinkle: sinusoidal opacity oscillation ─────────────
      this.twPhase += this.twSpeed;
      this.alpha = (this.base + Math.sin(this.twPhase) * 0.32) * this.fadeIn;
      this.alpha = Math.max(0.02, Math.min(1, this.alpha));

      // ── Gentle random drift ─────────────────────────────────
      this.x += this.vx;
      this.y += this.vy;

      // ── Parallax scroll shift ───────────────────────────────
      // Deeper stars move less per scroll pixel → layered depth feel.
      // scrollDelta is consumed here; it decays in the render loop.
      this.y -= scrollDelta * (1 - this.depth) * PARALLAX;

      // ── Cursor soft attraction ──────────────────────────────
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < STAR_CUR_RAD && d > 0) {
        const f = (STAR_CUR_RAD - d) / STAR_CUR_RAD;
        // Attract toward cursor + inherit a fraction of cursor velocity
        this.x += (dx * 0.016 + mVelX * 0.04) * f;
        this.y += (dy * 0.016 + mVelY * 0.04) * f;
      }

      // ── Viewport wrap ───────────────────────────────────────
      if (this.x < -8)   this.x = W + 8;
      if (this.x > W + 8) this.x = -8;
      if (this.y < -20)  this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }

    draw() {
      // Soft radial glow halo for larger stars
      if (this.r > 1.0) {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
        g.addColorStop(0, `hsla(${this.hue},80%,80%,${this.alpha * 0.18})`);
        g.addColorStop(1, `hsla(${this.hue},80%,80%,0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      // Core dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue},80%,93%,${this.alpha})`;
      ctx.fill();
    }
  }

  // ══════════════════════════════════════════════════════════
  // CLASS: Node — interactive purple constellation node
  //
  //  Nodes exist in viewport space and spring back to their
  //  home (ox, oy) with a soft stiffness. They react strongly
  //  to cursor attraction and click-burst repulsion.
  //  Connection lines are drawn between nearby node pairs.
  // ══════════════════════════════════════════════════════════
  class Node {
    constructor() { this.reset(); }

    reset() {
      this.x   = Math.random() * W;
      this.y   = Math.random() * H;
      this.ox  = this.x; // home X — node springs back here
      this.oy  = this.y; // home Y
      this.vx  = (Math.random() - 0.5) * 0.3;
      this.vy  = (Math.random() - 0.5) * 0.3;
      this.r   = Math.random() * 1.8 + 0.6;
      this.twPhase = Math.random() * Math.PI * 2;
      this.twSpeed = Math.random() * 0.022 + 0.005;
      this.opacity = 0.4;
    }

    update() {
      // ── Twinkle ─────────────────────────────────────────────
      this.twPhase += this.twSpeed;
      this.opacity  = 0.3 + Math.sin(this.twPhase) * 0.25 + 0.15;

      // ── Drift ───────────────────────────────────────────────
      this.x += this.vx;
      this.y += this.vy;

      // ── Strong cursor attraction + velocity drag ─────────────
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < CURSOR_RAD && d > 0) {
        const f = (CURSOR_RAD - d) / CURSOR_RAD;
        // Pull toward cursor; mVel drag makes fast sweeps create ripples
        this.x += (dx * PULL_STR + mVelX * 0.07) * f;
        this.y += (dy * PULL_STR + mVelY * 0.07) * f;
      }

      // ── Soft spring back to home position ───────────────────
      this.x += (this.ox - this.x) * 0.004;
      this.y += (this.oy - this.y) * 0.004;

      // ── Boundary wrap (update home to avoid abrupt snapping) ─
      if (this.x < -20)    { this.x = W + 20; this.ox = this.x; }
      if (this.x > W + 20) { this.x = -20;    this.ox = this.x; }
      if (this.y < -20)    { this.y = H + 20; this.oy = this.y; }
      if (this.y > H + 20) { this.y = -20;    this.oy = this.y; }
    }

    draw() {
      // Soft radial glow halo for larger nodes
      if (this.r > 1.2) {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5);
        g.addColorStop(0, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${this.opacity * 0.45})`);
        g.addColorStop(1, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      // Core node dot
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${this.opacity})`;
      ctx.fill();
    }
  }

  // ══════════════════════════════════════════════════════════
  // CLASS: ShootingStar — autonomous diagonal streak
  //
  //  Spawns randomly from the top or right edge, flies at a
  //  diagonal angle, then fades out. Completely independent of
  //  scroll and cursor — triggers every 2–5 seconds at random.
  //
  //  The gradient tail (transparent → bright head) gives the
  //  classic comet look. A subtle radial glow at the head adds
  //  depth without being garish.
  // ══════════════════════════════════════════════════════════
  class ShootingStar {
    constructor() { this.spawn(); }

    spawn() {
      // ── Entry point ─────────────────────────────────────────
      // 70% enter from top edge (y = -20), 30% from right edge
      const fromTop = Math.random() > 0.3;
      const speed   = Math.random() * 4.5 + 3.5; // 3.5–8 px/frame
      const angle   = (20 + Math.random() * 40) * Math.PI / 180; // 20–60° below horiz

      if (fromTop) {
        this.x  = Math.random() * W * 1.3; // allow right portion of top edge
        this.y  = -15;
        this.vx = -Math.cos(angle) * speed; // leftward
        this.vy =  Math.sin(angle) * speed; // downward
      } else {
        this.x  = W + 15;
        this.y  = Math.random() * H * 0.5; // upper half of right edge
        this.vx = -speed;                  // leftward
        this.vy =  Math.sin(angle) * speed * 0.6;
      }

      this.speed    = speed;
      this.trailLen = Math.random() * 110 + 55; // 55–165 px tail
      this.r        = Math.random() * 0.8 + 0.35;
      this.maxAlpha = Math.random() * 0.5 + 0.3;
      this.alpha    = 0; // fade in from 0
      this.done     = false;
    }

    update() {
      // Fade in quickly at start
      this.alpha = Math.min(this.alpha + 0.07, this.maxAlpha);

      this.x += this.vx;
      this.y += this.vy;

      // Fade out and mark done once fully off-screen
      if (this.x < -this.trailLen || this.y > H + this.trailLen) {
        this.alpha -= 0.04;
        if (this.alpha <= 0) this.done = true;
      }
    }

    draw() {
      if (this.alpha <= 0) return;

      // Unit vector along travel direction for tail offset
      const mag  = Math.hypot(this.vx, this.vy);
      const ux   = this.vx / mag;
      const uy   = this.vy / mag;
      const tailX = this.x - ux * this.trailLen;
      const tailY = this.y - uy * this.trailLen;

      // ── Gradient tail: transparent at end → bright at head ──
      const g = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      g.addColorStop(0,   `rgba(255,255,255,0)`);
      g.addColorStop(0.6, `rgba(210,200,255,${this.alpha * 0.45})`);
      g.addColorStop(1,   `rgba(255,255,255,${this.alpha})`);

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = g;
      ctx.lineWidth   = this.r * 1.6;
      ctx.lineCap     = 'round';
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      ctx.restore();

      // ── Bright radial glow at the head ──────────────────────
      const headG = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5);
      headG.addColorStop(0, `rgba(255,255,255,${this.alpha})`);
      headG.addColorStop(1, `rgba(200,190,255,0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = headG;
      ctx.fill();
    }
  }

  // ── Particle arrays ────────────────────────────────────────
  let stars         = [];
  let nodes         = [];
  let shootingStars = []; // active ShootingStar instances

  /** Re-create all particle arrays (called on init and resize). */
  function initParticles() {
    stars         = Array.from({ length: STAR_COUNT }, () => new Star());
    nodes         = Array.from({ length: NODE_COUNT  }, () => new Node());
    shootingStars = [];
  }

  // ── Scroll star spawning ───────────────────────────────────
  /**
   * Spawn new stars at the leading viewport edge when scrolling,
   * so the sky always appears fully populated in new sections.
   * Stars fade in (fadeIn: 0→1) to avoid a jarring pop.
   *
   * @param {number} delta - scroll distance this event (signed, px)
   */
  function spawnScrollStars(delta) {
    if (Math.abs(delta) < 2) return; // ignore micro-scroll jitter
    const count  = Math.min(Math.ceil(Math.abs(delta) * 0.2), 8);
    const edgeY  = delta > 0 ? H + 15 : -15; // bottom edge if scrolling down
    for (let i = 0; i < count; i++) {
      stars.push(new Star(edgeY + (Math.random() - 0.5) * 40));
    }
    // Trim array to avoid unbounded memory growth
    if (stars.length > STAR_COUNT + 100) {
      stars.splice(0, stars.length - STAR_COUNT);
    }
  }

  // ── Draw constellation connections ─────────────────────────
  /** O(n²) pair check — draw fading lines between nearby nodes. */
  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a  = nodes[i];
        const b  = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_CONN_DIST) {
          // Alpha fades to 0 as distance approaches MAX_CONN_DIST
          const alpha = (1 - d / MAX_CONN_DIST) * 0.22;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }
  }

  // ── Cursor glow ────────────────────────────────────────────
  /**
   * Paint a dual-ring radial glow centred on the mouse.
   * Inner ring (130px): bright purple at 9% opacity.
   * Outer ring (340px): wider, dimmer halo at 3.5% opacity.
   */
  function drawCursorGlow() {
    if (mouseX < 0 || mouseY < 0) return;
    // Inner bright ring
    const g1 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 130);
    g1.addColorStop(0, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.09)`);
    g1.addColorStop(1, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0)`);
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    // Outer soft halo
    const g2 = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 340);
    g2.addColorStop(0, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.035)`);
    g2.addColorStop(1, `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0)`);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Click burst ────────────────────────────────────────────
  /**
   * On any click, repulse nearby constellation nodes outward
   * with an impulse proportional to how close they are.
   * Nodes spring back to their home positions naturally.
   */
  document.addEventListener('click', (e) => {
    const cx = e.clientX;
    const cy = e.clientY;
    nodes.forEach(n => {
      const dx = n.x - cx;
      const dy = n.y - cy;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < REP_RAD && d > 0) {
        const force = (REP_RAD - d) / REP_RAD;
        n.vx += (dx / d) * REP_FORCE * force;
        n.vy += (dy / d) * REP_FORCE * force;
        // Clamp velocity so nodes don't fly off screen permanently
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > 8) { n.vx = (n.vx / spd) * 8; n.vy = (n.vy / spd) * 8; }
      }
    });
  });

  // ── Render loop ────────────────────────────────────────────
  let raf;
  let lastTs = 0;

  function render(ts) {
    // Throttle to ~70 fps max
    if (ts - lastTs < 14) { raf = requestAnimationFrame(render); return; }
    lastTs = ts;

    // ── Cursor velocity (drag effect) ────────────────────────
    mVelX = mouseX - prevMX;
    mVelY = mouseY - prevMY;
    prevMX = mouseX;
    prevMY = mouseY;

    // ── Decay scrollDelta so parallax shift smoothly dies off ─
    // Stars consume this value in their update(); leftover decays here.
    scrollDelta *= 0.75;

    ctx.clearRect(0, 0, W, H);

    // ── 1. Cursor glow (painted first, below all particles) ───
    drawCursorGlow();

    // ── 2. Shooting stars — spawn on timer, then animate ──────
    if (ts >= nextShootTime) {
      shootingStars.push(new ShootingStar());
      // Random gap between SHOOT_MIN_MS and SHOOT_MAX_MS
      nextShootTime = ts + SHOOT_MIN_MS + Math.random() * (SHOOT_MAX_MS - SHOOT_MIN_MS);
    }
    // Remove finished shooting stars to avoid memory growth
    shootingStars = shootingStars.filter(s => !s.done);
    shootingStars.forEach(s => { s.update(); s.draw(); });

    // ── 3. Background twinkling stars ─────────────────────────
    stars.forEach(s => { s.update(); s.draw(); });

    // ── 4. Interactive constellation nodes + connections ───────
    nodes.forEach(n => { n.update(); n.draw(); });
    drawConnections();

    raf = requestAnimationFrame(render);
  }

  // Pause animation when tab is hidden to save CPU/GPU
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      raf = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(raf);
    }
  });

  // Bootstrap
  resize();
  raf = requestAnimationFrame(render);
})();

// ════════════════════════════════════════════════════════════
// 13. CREDENTIALS LIGHTBOX — click any .cred-item to view full image
// ════════════════════════════════════════════════════════════
(function initLightbox() {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbClose   = document.getElementById('lightbox-close');
  const credItems = document.querySelectorAll('.cred-item');
  if (!lightbox || !lbImg) return;

  function openLightbox(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || 'Credential';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  }

  credItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const img = item.querySelector('img');
      const src = img ? img.src : item.getAttribute('href');
      const alt = img ? img.alt  : 'Credential';
      openLightbox(src, alt);
    });
  });

  lbClose && lbClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();

// ════════════════════════════════════════════════════════════
// 15. TYPEWRITER ANIMATION — dynamic roles in hero section
// ════════════════════════════════════════════════════════════
(function initTypewriter() {
  const twElement = document.getElementById('typewriter');
  if (!twElement) return;

  const roles = [
    "Decision Scientist",
    "Data Builder",
    "Entrepreneur",
    "Developer"
  ];
  
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      twElement.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // delete faster
    } else {
      twElement.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    // If word is fully typed
    if (!isDeleting && charIndex === currentRole.length) {
      typingSpeed = 2000; // pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 400; // pause before typing new word
    }

    setTimeout(type, typingSpeed);
  }

  // Start typewriter after a short initial delay
  setTimeout(type, 1500);
})();

// ════════════════════════════════════════════════════════════
// 14. MOBILE TOUCH RIPPLE — sexy tap effect for touch screens
// ════════════════════════════════════════════════════════════
(function initTouchRipples() {
  if (!isTouchDevice) return;

  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) return; // ignore multi-touch
    
    const touch = e.touches[0];
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    
    // Position ripple exactly at touch point
    ripple.style.left = `${touch.clientX}px`;
    ripple.style.top = `${touch.clientY}px`;
    
    document.body.appendChild(ripple);
    
    // Animate and remove
    requestAnimationFrame(() => {
      ripple.classList.add('active');
      setTimeout(() => {
        ripple.remove();
      }, 800); // matches CSS animation duration
    });
  }, { passive: true });
})();

// ════════════════════════════════════════════════════════════
// 15. RANDOM FUNVILLE — DYNAMIC DICE ROLL & FEATURE TICKER
// ════════════════════════════════════════════════════════════
(function initRandomFunvilleVisual() {
  const diceEl = document.getElementById('game-dice');
  const diceNum = document.getElementById('dice-num');
  const dicePips = document.getElementById('dice-pips');
  const tickerBadges = document.querySelectorAll('#game-ticker .ticker-badge');

  if (!diceEl || (!diceNum && !dicePips)) return;

  const diceFaces = [1, 4, 6, 2, 5, 3];
  let faceIdx = 0;
  let badgeIdx = 0;

  setInterval(() => {
    // 1. Roll dice & change number
    faceIdx = (faceIdx + 1) % diceFaces.length;
    const currentVal = diceFaces[faceIdx];

    diceEl.classList.add('rolling');
    setTimeout(() => {
      if (diceNum) diceNum.textContent = currentVal;
      if (dicePips) dicePips.setAttribute('data-face', currentVal);
      diceEl.classList.remove('rolling');
    }, 250);

    // 2. Cycle mini-game feature badges (Dice Roller -> Number Guesser -> Password Gen)
    if (tickerBadges.length > 0) {
      tickerBadges.forEach(b => b.classList.remove('active'));
      badgeIdx = (badgeIdx + 1) % tickerBadges.length;
      tickerBadges[badgeIdx].classList.add('active');
    }
  }, 2200);
})();

// ════════════════════════════════════════════════════════════
// 16. CREDENTIALS SLIDER (MULTI-ITEM)
// ════════════════════════════════════════════════════════════
(function initCredentialsSlider() {
  const track = document.getElementById('creds-track');
  const slides = document.querySelectorAll('.cred-slide');
  const dotsContainer = document.getElementById('slider-dots');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  
  if (!track || slides.length === 0) return;

  let currentGroup = 0;
  let autoSlideInterval;
  let itemsPerView = window.innerWidth >= 768 ? 3 : 1;
  let totalGroups = Math.ceil(slides.length / itemsPerView);

  function initDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalGroups; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === currentGroup) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToGroup(i);
        resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateSlider() {
    // Translate the track by full viewport percentages (-100% per group)
    let translateX = currentGroup * 100;
    track.style.transform = `translateX(-${translateX}%)`;
    
    // Update dots
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentGroup);
    });
    
    // Update active class on slides for dimming effect
    slides.forEach((slide, index) => {
      const isVisible = index >= currentGroup * itemsPerView && index < (currentGroup + 1) * itemsPerView;
      slide.classList.toggle('active', isVisible);
    });
  }

  function goToGroup(index) {
    currentGroup = index;
    if (currentGroup < 0) currentGroup = totalGroups - 1;
    if (currentGroup >= totalGroups) currentGroup = 0;
    updateSlider();
  }

  function nextSlide() {
    goToGroup(currentGroup + 1);
  }

  function prevSlide() {
    goToGroup(currentGroup - 1);
  }

  // Event listeners for buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoSlide();
    });
  }

  // Auto sliding
  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    const newItemsPerView = window.innerWidth >= 768 ? 3 : 1;
    if (newItemsPerView !== itemsPerView) {
      itemsPerView = newItemsPerView;
      totalGroups = Math.ceil(slides.length / itemsPerView);
      currentGroup = 0;
      initDots();
      updateSlider();
    }
  });

  // Pause on hover
  const sliderWrap = document.querySelector('.creds-slider-wrap');
  if (sliderWrap) {
    sliderWrap.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    sliderWrap.addEventListener('mouseleave', startAutoSlide);
  }

  initDots();
  updateSlider();
  startAutoSlide();
})();


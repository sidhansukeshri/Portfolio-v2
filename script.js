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
// 7. HERO CANVAS — Interactive Neural Constellation
// ════════════════════════════════════════════════════════════
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Disable expensive canvas on mobile for performance
  if (isSmallScreen) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H;
  let animId = null;
  let isVisible = true;

  // Mouse position
  let mx = -9999, my = -9999;

  // Node configuration
  const NODE_COUNT    = 55;
  const MAX_DIST      = 140;
  const CURSOR_RADIUS = 160;
  const CURSOR_PULL   = 0.018;

  // Accent color in RGB
  const ACCENT_R = 124, ACCENT_G = 106, ACCENT_B = 247;

  // Node class
  class Node {
    constructor() { this.reset(); }

    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.ox = this.x; // original x
      this.oy = this.y; // original y
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.5 + 0.5;
      this.opacity = Math.random() * 0.5 + 0.3;
    }

    update() {
      // Gentle drift
      this.x += this.vx;
      this.y += this.vy;

      // Cursor gravity
      const dx  = mx - this.x;
      const dy  = my - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < CURSOR_RADIUS && dist > 0) {
        const force = (CURSOR_RADIUS - dist) / CURSOR_RADIUS;
        this.x += dx * CURSOR_PULL * force;
        this.y += dy * CURSOR_PULL * force;
      }

      // Soft return to origin
      this.x += (this.ox - this.x) * 0.003;
      this.y += (this.oy - this.y) * 0.003;

      // Boundary wrap
      if (this.x < -20) { this.x = W + 20; this.ox = this.x; }
      if (this.x > W + 20) { this.x = -20; this.ox = this.x; }
      if (this.y < -20) { this.y = H + 20; this.oy = this.y; }
      if (this.y > H + 20) { this.y = -20; this.oy = this.y; }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${this.opacity})`;
      ctx.fill();
    }
  }

  let nodes = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    nodes = Array.from({ length: NODE_COUNT }, () => new Node());
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
          const alpha = (1 - d / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function drawCursorGlow() {
    if (mx < 0 || my < 0) return;
    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 200);
    grad.addColorStop(0,   `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0.04)`);
    grad.addColorStop(1,   `rgba(${ACCENT_R},${ACCENT_G},${ACCENT_B},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  let lastTime = 0;
  const TARGET_FPS = 40;
  const FRAME_MS   = 1000 / TARGET_FPS;

  function render(timestamp) {
    if (!isVisible) { animId = requestAnimationFrame(render); return; }

    const elapsed = timestamp - lastTime;
    if (elapsed < FRAME_MS) { animId = requestAnimationFrame(render); return; }
    lastTime = timestamp - (elapsed % FRAME_MS);

    ctx.clearRect(0, 0, W, H);
    drawCursorGlow();
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
// 12. GLOBAL STARFIELD — twinkling, cursor-reactive, scroll-velocity streaks
// ════════════════════════════════════════════════════════════
(function initStarfield() {
  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;

  // Mouse tracking
  let mouseX = -9999, mouseY = -9999;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });
  document.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

  // Scroll velocity tracking
  let lastScrollY = window.scrollY;
  let scrollVelY  = 0;
  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    scrollVelY = (cur - lastScrollY) * 0.6;
    lastScrollY = cur;
  }, { passive: true });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(resize, 200);
  }, { passive: true });

  // ── Star class ─────────────────────────────────────────────
  const STAR_COUNT = 260;

  class Star {
    constructor() { this.init(true); }

    init(randomY) {
      this.x  = Math.random() * W;
      this.y  = randomY ? Math.random() * H : Math.random() * H;
      this.ox = this.x;
      this.oy = this.y;
      this.r  = Math.random() * 1.5 + 0.3;           // radius 0.3–1.8
      this.baseAlpha = Math.random() * 0.55 + 0.15;  // 0.15–0.7
      this.alpha = this.baseAlpha;
      this.twinkleSpeed = Math.random() * 0.018 + 0.004;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.vx = (Math.random() - 0.5) * 0.07;
      this.vy = (Math.random() - 0.5) * 0.07;
      this.starVelY = 0;  // per-star scroll streak velocity
    }

    update() {
      // Twinkle
      this.twinklePhase += this.twinkleSpeed;
      this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.28;
      this.alpha = Math.max(0.02, Math.min(1, this.alpha));

      // Gentle drift
      this.x += this.vx;
      this.y += this.vy;

      // Cursor attraction — stars within 150px softly pull toward cursor
      const dx   = mouseX - this.x;
      const dy   = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const force = (150 - dist) / 150;
        this.x += dx * 0.014 * force;
        this.y += dy * 0.014 * force;
      }

      // Soft spring back toward home
      this.x += (this.ox - this.x) * 0.004;
      this.y += (this.oy - this.y) * 0.004;

      // Scroll streak — each star lerps toward scroll velocity
      // Bigger stars react slightly more (heavier feel, like parallax depth)
      const reactivity = 0.4 + (this.r / 1.8) * 0.6;
      this.starVelY += (scrollVelY * reactivity - this.starVelY) * 0.2;
      this.y += this.starVelY;

      // Wrap edges
      if (this.x < -8)  { this.x = W + 8; this.ox = this.x; }
      if (this.x > W+8) { this.x = -8;    this.ox = this.x; }
      if (this.y < -8)  { this.y = H + 8; this.oy = this.y; }
      if (this.y > H+8) { this.y = -8;    this.oy = this.y; }
    }

    draw() {
      const velAbs = Math.abs(this.starVelY);

      if (velAbs > 1.2) {
        // ── Shooting-star streak ──
        const len = Math.min(velAbs * 2.5, 35);
        const dir = this.starVelY > 0 ? 1 : -1;
        const g   = ctx.createLinearGradient(this.x, this.y, this.x, this.y + dir * len);
        g.addColorStop(0, `rgba(255,255,255,${Math.min(this.alpha + 0.2, 1)})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.strokeStyle = g;
        ctx.lineWidth   = this.r * 1.1;
        ctx.lineCap     = 'round';
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + dir * len);
        ctx.stroke();
      } else {
        // ── Normal twinkling star ──
        // Optional glow halo for larger stars
        if (this.r > 1.0) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180,170,255,${this.alpha * 0.12})`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,238,255,${this.alpha})`;
        ctx.fill();
      }
    }
  }

  let stars = Array.from({ length: STAR_COUNT }, () => new Star());

  let raf;
  let lastTs = 0;

  function render(ts) {
    // Throttle to ~60fps
    if (ts - lastTs < 14) { raf = requestAnimationFrame(render); return; }
    lastTs = ts;

    ctx.clearRect(0, 0, W, H);

    // Decay scroll velocity so streaks fade naturally after scrolling stops
    scrollVelY *= 0.85;

    stars.forEach(s => { s.update(); s.draw(); });

    raf = requestAnimationFrame(render);
  }

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      raf = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(raf);
    }
  });

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

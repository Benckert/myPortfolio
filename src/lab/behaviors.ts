// JS-driven specimens. initBehaviors() scans the rendered DOM for data-*
// hooks and wires listeners; it returns a cleanup that removes all of them.

type Cleanup = () => void;

export function initBehaviors(root: HTMLElement): Cleanup {
  const cleanups: Cleanup[] = [];
  const on = (el: EventTarget, ev: string, fn: EventListener) => {
    el.addEventListener(ev, fn);
    cleanups.push(() => el.removeEventListener(ev, fn));
  };

  // — Magnetic: element drifts toward the cursor, springs back on leave —
  root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const pull = parseFloat(el.dataset.magnetic || '0.3');
    on(el, 'mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = (e as MouseEvent).clientX - (r.left + r.width / 2);
      const my = (e as MouseEvent).clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * pull}px, ${my * pull}px)`;
    });
    on(el, 'mouseleave', () => { el.style.transform = ''; });
  });

  // — 3D tilt: surface tips based on cursor position over the element —
  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const max = parseFloat(el.dataset.tilt || '10');
    const target = (el.querySelector('.port') as HTMLElement) || el;
    target.style.transition = 'transform 0.1s ease';
    on(el, 'mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = ((e as MouseEvent).clientX - r.left) / r.width - 0.5;
      const py = ((e as MouseEvent).clientY - r.top) / r.height - 0.5;
      target.style.transform = `perspective(600px) rotateY(${px * max}deg) rotateX(${-py * max}deg) scale(1.03)`;
    });
    on(el, 'mouseleave', () => { target.style.transform = ''; });
  });

  // — Spotlight: expose cursor position as --mx/--my (px) for radial gradients —
  root.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((el) => {
    on(el, 'mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${(e as MouseEvent).clientX - r.left}px`);
      el.style.setProperty('--my', `${(e as MouseEvent).clientY - r.top}px`);
    });
  });

  // — Ripple: ink circle expands from the click point —
  root.querySelectorAll<HTMLElement>('[data-ripple]').forEach((el) => {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';
    on(el, 'click', (e) => {
      const r = el.getBoundingClientRect();
      const d = Math.max(r.width, r.height);
      const ink = document.createElement('span');
      ink.className = 'ripple-ink';
      ink.style.width = ink.style.height = `${d}px`;
      ink.style.left = `${(e as MouseEvent).clientX - r.left - d / 2}px`;
      ink.style.top = `${(e as MouseEvent).clientY - r.top - d / 2}px`;
      el.appendChild(ink);
      setTimeout(() => ink.remove(), 650);
    });
  });

  // — Char stagger: split into spans, animate on mount + replay on hover —
  root.querySelectorAll<HTMLElement>('[data-stagger]').forEach((el) => {
    const text = el.textContent || '';
    const run = () => {
      el.innerHTML = '';
      [...text].forEach((ch, i) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        s.style.animationDelay = `${i * 45}ms`;
        el.appendChild(s);
      });
    };
    run();
    on(el, 'mouseenter', run);
  });

  // — Scramble: random glyphs settle into the real word on hover —
  root.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    const text = el.textContent || '';
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@';
    let raf = 0;
    const scramble = () => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const dur = 700;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const reveal = Math.floor(p * text.length);
        el.textContent = text
          .split('')
          .map((ch, i) => (i < reveal || ch === ' ' ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]))
          .join('');
        if (p < 1) raf = requestAnimationFrame(tick);
        else el.textContent = text;
      };
      raf = requestAnimationFrame(tick);
    };
    on(el, 'mouseenter', scramble);
    cleanups.push(() => cancelAnimationFrame(raf));
  });

  return () => cleanups.forEach((fn) => fn());
}

// Cursor followers — chosen from the rail. Each returns its own cleanup.
export type CursorMode = 'ring' | 'trail' | 'dust' | 'comet';

export function initCursor(mode: CursorMode): Cleanup {
  if (mode === 'ring') return cursorRing();
  if (mode === 'trail') return cursorTrail();
  return cursorCanvas(mode); // 'dust' | 'comet'
}

// Dot + lagging ring that swells over interactive elements.
function cursorRing(): Cleanup {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let rx = 0, ry = 0, x = 0, y = 0, raf = 0;
  const move = (e: MouseEvent) => {
    x = e.clientX; y = e.clientY;
    dot.style.left = `${x}px`; dot.style.top = `${y}px`;
    const t = e.target as HTMLElement;
    const hot = !!t.closest('button, a, .chip, .card, .spec');
    ring.style.width = ring.style.height = hot ? '48px' : '34px';
    ring.style.borderColor = hot ? 'rgba(94,234,212,0.9)' : 'rgba(94,234,212,0.5)';
  };
  const loop = () => { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; raf = requestAnimationFrame(loop); };
  window.addEventListener('mousemove', move);
  raf = requestAnimationFrame(loop);
  return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); dot.remove(); ring.remove(); };
}

// A chain of dots, each easing toward the one ahead — a tapering snake tail.
function cursorTrail(): Cleanup {
  const N = 18;
  const dots = Array.from({ length: N }, () => {
    const d = document.createElement('div');
    d.className = 'trail-dot';
    document.body.appendChild(d);
    return d;
  });
  let mx = window.innerWidth / 2, my = window.innerHeight / 2, raf = 0;
  const xs = new Array(N).fill(mx), ys = new Array(N).fill(my);
  const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
  const loop = () => {
    let px = mx, py = my;
    for (let i = 0; i < N; i++) {
      xs[i] += (px - xs[i]) * 0.4;
      ys[i] += (py - ys[i]) * 0.4;
      const s = (N - i) / N;
      dots[i].style.transform = `translate(${xs[i]}px, ${ys[i]}px) translate(-50%, -50%) scale(${s})`;
      dots[i].style.opacity = `${s * 0.9}`;
      px = xs[i]; py = ys[i];
    }
    raf = requestAnimationFrame(loop);
  };
  window.addEventListener('mousemove', move);
  raf = requestAnimationFrame(loop);
  return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); dots.forEach((d) => d.remove()); };
}

// Canvas-based: 'dust' spawns fading particles; 'comet' draws a fading smear.
function cursorCanvas(kind: 'dust' | 'comet'): Cleanup {
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  const resize = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset + scale in one step
  };
  resize();
  const accent = '#5eead4', indigo = '#818cf8';
  type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number };
  const parts: P[] = [];
  const pts: { x: number; y: number }[] = [];
  let mx = window.innerWidth / 2, my = window.innerHeight / 2, pmx = mx, pmy = my, raf = 0;
  const move = (e: MouseEvent) => {
    mx = e.clientX; my = e.clientY;
    if (kind === 'dust') {
      for (let i = 0; i < 2; i++)
        parts.push({ x: mx, y: my, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2 - 0.3, life: 0, max: 38 + Math.random() * 30, c: Math.random() < 0.5 ? accent : indigo, r: 2 + Math.random() * 2 });
      if (parts.length > 400) parts.splice(0, parts.length - 400);
    } else {
      pts.push({ x: mx, y: my });
      if (pts.length > 22) pts.shift();
    }
  };
  const loop = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (kind === 'dust') {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++; p.x += p.vx; p.y += p.vy;
        const t = 1 - p.life / p.max;
        if (t <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = t; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * t, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        const t = i / pts.length;
        ctx.strokeStyle = accent; ctx.globalAlpha = t * 0.8; ctx.lineWidth = t * 8;
        ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = accent;
      ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
      if (pts.length && Math.hypot(mx - pmx, my - pmy) < 0.5) pts.shift(); // bleed tail when idle
    }
    pmx = mx; pmy = my;
    raf = requestAnimationFrame(loop);
  };
  window.addEventListener('mousemove', move);
  window.addEventListener('resize', resize);
  raf = requestAnimationFrame(loop);
  return () => { window.removeEventListener('mousemove', move); window.removeEventListener('resize', resize); cancelAnimationFrame(raf); canvas.remove(); };
}

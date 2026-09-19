import { useEffect, useRef } from 'react';
import { VERT, FRAG } from './fluidShader';

export interface FluidCanvasProps {
  /** Three colours, slow flow to fast. */
  colors: [string, string, string];
  /** Render scale, 0.1–1. Below 1 the canvas is drawn smaller and stretched;
   *  the effect is soft enough that this costs nothing visually. */
  renderScale: number;
  /** Spatial frequency of the noise — higher means more, smaller shapes. */
  scale: number;
  /** How hard the domain is warped. Higher folds the flow more tightly. */
  warp: number;
  /** Animation rate. */
  speed: number;
  /** How sharply the flow fades out into the page background. */
  contrast: number;
  /** Radius of the pointer's influence. */
  pointerRadius: number;
  /** How far the pointer pushes the flow. */
  pointerStrength: number;
  /** Seconds for the pointer swell to fade once the pointer stops. */
  pointerFade: number;
  /** Render a single frame and stop. Used for reduced motion. */
  still?: boolean;
}

/** Longest simulated step, in seconds. Frame gaps are clamped to this, so a
 *  stall, a throttled background tab or a breakpoint advances the animation by
 *  at most one ordinary frame instead of lurching forward. */
const MAX_STEP = 1 / 30;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return [1, 1, 1];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`shader compile failed: ${log}`);
  }
  return sh;
}

/**
 * The animated background, drawn with a single full-screen fragment shader.
 *
 * Written in place of a fluid simulation on purpose. A simulation keeps a
 * velocity field between frames, so it is only correct if the frame loop is
 * continuous — and it is not: a backgrounded tab keeps requestAnimationFrame
 * alive at roughly 1fps without reliably firing any event, so the field ends up
 * either wildly integrated or frozen and stale. This draws each frame from
 * scratch out of time and pointer position, so there is no state to corrupt,
 * and the clamped step above bounds how far a single frame can move.
 */
export function FluidCanvas({
  colors,
  renderScale,
  scale,
  warp,
  speed,
  contrast,
  pointerRadius,
  pointerStrength,
  pointerFade,
  still = false,
}: FluidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Props are read through a ref inside the render loop so that changing one
  // (a theme switch, say) never restarts the animation or the GL context.
  const propsRef = useRef({
    colors, renderScale, scale, warp, speed, contrast, pointerRadius, pointerStrength, pointerFade, still,
  });
  propsRef.current = {
    colors, renderScale, scale, warp, speed, contrast, pointerRadius, pointerStrength, pointerFade, still,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false }) ??
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return; // no WebGL: the layer just stays empty

    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link failed');
    } catch {
      return; // degrade to nothing rather than a broken canvas
    }
    gl.useProgram(program);

    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program!, name);
    const uRes = u('uRes'), uTime = u('uTime'), uPointer = u('uPointer');
    const uPointerAmt = u('uPointerAmt'), uCol0 = u('uCol0'), uCol1 = u('uCol1'), uCol2 = u('uCol2');
    const uScale = u('uScale'), uWarp = u('uWarp'), uContrast = u('uContrast');
    const uPointerRadius = u('uPointerRadius'), uPointerStrength = u('uPointerStrength');

    // Pointer state: a target the events write, and a value the loop eases
    // toward it. Easing means fast cursor movement cannot inject a spike, and
    // there is no velocity to accumulate.
    const target = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };
    let amount = 0;
    let lastMove = -Infinity;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      target.x = (e.clientX - rect.left) / rect.width;
      // GL's Y axis runs upward; the DOM's runs down.
      target.y = 1 - (e.clientY - rect.top) / rect.height;
      lastMove = performance.now();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let width = 0, height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const s = Math.max(0.1, Math.min(1, propsRef.current.renderScale));
      const w = Math.max(1, Math.floor(rect.width * dpr * s));
      const h = Math.max(1, Math.floor(rect.height * dpr * s));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // A driver can drop the context on its own (GPU reset, tab discard).
    // Accepting the event keeps the browser willing to restore it.
    const onLost = (e: Event) => e.preventDefault();
    canvas.addEventListener('webglcontextlost', onLost);

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let drawnOnce = false;

    const frame = (now: number) => {
      const p = propsRef.current;
      // Clamped step: however long the gap really was, advance by at most one
      // ordinary frame. This is what makes a backgrounded tab harmless.
      const dt = Math.min((now - last) / 1000, MAX_STEP);
      last = now;

      // While still (reduced motion, or the page in the background) keep the
      // loop ticking but do no work: the canvas holds its last frame, so there
      // is nothing to draw and nothing to blink when it resumes. The loop is
      // never torn down, so resuming needs no restart logic.
      if (p.still && drawnOnce) {
        raf = requestAnimationFrame(frame);
        return;
      }
      drawnOnce = true;
      elapsed += dt * p.speed;

      // Ease the pointer, and fade its influence out once it stops moving.
      const k = Math.min(1, dt * 8);
      current.x += (target.x - current.x) * k;
      current.y += (target.y - current.y) * k;
      const idle = (now - lastMove) / 1000;
      const wanted = idle < p.pointerFade ? 1 - idle / p.pointerFade : 0;
      amount += (wanted - amount) * Math.min(1, dt * 3);

      resize();
      gl.uniform2f(uRes, width, height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uPointer, current.x, current.y);
      gl.uniform1f(uPointerAmt, amount);
      gl.uniform3fv(uCol0, hexToRgb(p.colors[0]));
      gl.uniform3fv(uCol1, hexToRgb(p.colors[1]));
      gl.uniform3fv(uCol2, hexToRgb(p.colors[2]));
      gl.uniform1f(uScale, p.scale);
      gl.uniform1f(uWarp, p.warp);
      gl.uniform1f(uContrast, p.contrast);
      gl.uniform1f(uPointerRadius, p.pointerRadius);
      gl.uniform1f(uPointerStrength, p.pointerStrength);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Deliberately NOT calling WEBGL_lose_context here. Forcing the context
      // to be lost poisons the canvas element permanently: getContext() on it
      // afterwards returns the same dead context, so the remount that
      // StrictMode performs in development (mount, clean up, mount again)
      // came back to a lost context and rendered nothing. Dropping the
      // program and buffer is enough; the context goes with the canvas.
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

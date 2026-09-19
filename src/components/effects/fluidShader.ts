/**
 * Fragment shader for the animated background.
 *
 * Deliberately *stateless*: every pixel is a pure function of time, the pointer
 * position and the palette. There is no velocity field, no feedback buffer and
 * nothing that accumulates between frames — which is the whole point. A
 * simulation that carries state is corrupted by any interruption to its frame
 * loop (a backgrounded tab, a throttled window, a long GPU stall) and comes
 * back wrong. This cannot: skip a thousand frames and the next one is simply
 * drawn at a later `uTime`.
 *
 * The look is domain-warped fractal noise — noise used to distort the
 * coordinates fed to more noise, twice — which produces the slow folding,
 * marbled flow. Two independent warp fields are also used to pick the colour,
 * so neighbouring regions drift through different hues and it reads as
 * iridescent rather than as one tinted cloud.
 */
export const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = `
precision highp float;

uniform vec2  uRes;          // canvas size in px
uniform float uTime;         // seconds, advanced with a clamped delta
uniform vec2  uPointer;      // 0..1 across the canvas, already smoothed
uniform float uPointerAmt;   // 0..1, fades in with pointer activity
uniform vec3  uCol0;         // three palette colours, slow -> fast
uniform vec3  uCol1;
uniform vec3  uCol2;
uniform float uScale;        // spatial frequency of the noise
uniform float uWarp;         // how hard the domain is distorted
uniform float uContrast;     // how sharply the field fades to nothing
uniform float uPointerRadius;
uniform float uPointerStrength;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

/** Value noise with a smoothstep fade — continuous, so no banding. */
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

/** Five octaves is enough for soft, organic shapes at background scale. */
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = p * 2.02 + 17.3;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = (uv - 0.5) * aspect * uScale;
  float t = uTime;

  // The pointer is a local swell in the field rather than an injected force:
  // it bulges the flow outward around the cursor and fades with distance. No
  // force means no momentum, so nothing can build up or overshoot.
  vec2 m = (uPointer - 0.5) * aspect * uScale;
  vec2 toM = p - m;
  float d2 = dot(toM, toM);
  float swell = uPointerAmt * exp(-d2 / max(uPointerRadius, 0.0001));

  // First warp: two noise fields drifting in different directions.
  vec2 q = vec2(fbm(p + 0.15 * t), fbm(p + vec2(3.7, 1.9) - 0.11 * t));
  // Second warp, fed by the first — this is what makes it fold rather than slide.
  vec2 r = vec2(
    fbm(p + uWarp * q + vec2(1.7, 9.2) + 0.13 * t),
    fbm(p + uWarp * q + vec2(8.3, 2.8) - 0.09 * t)
  );
  r += normalize(toM + vec2(1e-4)) * swell * uPointerStrength;

  float f = fbm(p + uWarp * r);

  // Density of the visible flow, and a second axis used only for hue so the
  // colours vary across the frame instead of tracking brightness.
  float density = clamp((f - 0.34) * uContrast, 0.0, 1.0);
  float hueMix = clamp(length(r) * 0.85, 0.0, 1.0);

  vec3 col = mix(uCol0, uCol1, smoothstep(0.0, 1.0, hueMix));
  col = mix(col, uCol2, smoothstep(0.3, 1.0, density));

  float alpha = density * (0.55 + 0.45 * hueMix) + swell * 0.2;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

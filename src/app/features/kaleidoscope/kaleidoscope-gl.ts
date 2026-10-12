export interface FrameStats {
  fps: number;
  frameTimeMs: number;
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

#define PI 3.14159265359
#define TAU 6.28318530718

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 foldPolar(vec2 p, float segments, float spin) {
  float angle = atan(p.y, p.x) + spin;
  float radius = length(p);
  float segAngle = TAU / segments;
  angle = mod(angle, segAngle);
  angle = abs(angle - segAngle * 0.5);
  return radius * vec2(cos(angle), sin(angle));
}

float sakuraBlossomSDF(vec2 p, float radius) {
  float a = atan(p.y, p.x);
  float r = length(p);
  float wave = cos(5.0 * a);
  float petalBody = 0.58 + 0.42 * smoothstep(-0.65, 0.95, wave);
  float tipNotch = 0.13 * pow(max(0.0, wave), 10.0);
  float targetR = radius * (petalBody - tipNotch);
  return r - targetR;
}

float floralWaveSDF(vec2 p, float radius, float petals) {
  float a = atan(p.y, p.x);
  float r = length(p);
  float lobe = 0.66 + 0.34 * cos(petals * a) + 0.10 * cos(petals * 2.0 * a);
  return r - radius * lobe;
}

vec3 blendedPalette(float t, float moodPhase) {
  vec3 palSakura = vec3(0.66, 0.36, 0.58) + vec3(0.42, 0.38, 0.42) * cos(TAU * (vec3(1.0, 0.85, 0.95) * t + vec3(0.92, 0.18, 0.48)));
  vec3 palPrism = hsv2rgb(vec3(fract(t), 0.82, 1.0));
  vec3 palLotus = vec3(0.55, 0.48, 0.62) + vec3(0.45, 0.42, 0.45) * cos(TAU * (vec3(1.0, 1.0, 0.85) * t + vec3(0.10, 0.42, 0.68)));
  vec3 palCyber = vec3(0.52, 0.32, 0.68) + vec3(0.48, 0.46, 0.48) * cos(TAU * (vec3(0.85, 1.0, 1.15) * t + vec3(0.78, 0.12, 0.45)));

  float c = mod(moodPhase, 4.0);
  float idx = floor(c);
  float f = smoothstep(0.0, 1.0, fract(c));

  if (idx < 0.5) return mix(palSakura, palPrism, f);
  if (idx < 1.5) return mix(palPrism, palLotus, f);
  if (idx < 2.5) return mix(palLotus, palCyber, f);
  return mix(palCyber, palSakura, f);
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec2 uv0 = uv;

  float breath = 1.0 + 0.08 * sin(u_time * 0.09);
  uv *= breath;

  float spin = u_time * 0.16 + 0.25 * sin(u_time * 0.05);

  float symCycle = mod(u_time * 0.032, 4.0);
  float symIdx = floor(symCycle);
  float symBlend = smoothstep(0.0, 1.0, fract(symCycle));

  vec2 uv6  = foldPolar(uv, 6.0, spin);
  vec2 uv8  = foldPolar(uv, 8.0, spin);
  vec2 uv10 = foldPolar(uv, 10.0, spin);
  vec2 uv12 = foldPolar(uv, 12.0, spin);

  if (symIdx < 0.5) {
    uv = mix(uv8, uv10, symBlend);
  } else if (symIdx < 1.5) {
    uv = mix(uv10, uv12, symBlend);
  } else if (symIdx < 2.5) {
    uv = mix(uv12, uv6, symBlend);
  } else {
    uv = mix(uv6, uv8, symBlend);
  }

  float wSakura = 0.35 + 0.30 * (0.5 + 0.5 * sin(u_time * 0.063));
  float wLotus  = 0.25 + 0.30 * (0.5 + 0.5 * sin(u_time * 0.047 + 2.1));
  float wCyber  = 0.20 + 0.28 * (0.5 + 0.5 * sin(u_time * 0.053 + 4.2));

  float bloomFactor = 1.02 + 0.22 * sin(u_time * 0.085) + 0.10 * cos(u_time * 0.051);
  float moodPhase = u_time * 0.038;

  vec3 finalColor = vec3(0.0);

  float foldScale = 1.25 + 0.08 * sin(u_time * 0.043);
  for (float i = 0.0; i < 4.0; i++) {
    uv = (abs(fract(uv * foldScale - 0.5) - 0.5) * 2.0 - 0.5);
    uv *= rot(u_time * 0.22 + i * PI * 0.22);

    float radialDecay = exp(-length(uv0) * 0.85);
    float dRing = length(uv) * radialDecay;

    vec2 blossomPos = uv * rot(-u_time * 0.32 + i * 1.1);
    float dSakura = abs(sakuraBlossomSDF(blossomPos, 0.26 + 0.05 * sin(u_time * 0.7 + i)));
    float dLotus = abs(floralWaveSDF(blossomPos, 0.28, 6.0 + i * 2.0));

    vec2 auv = abs(uv);
    float dCrystal = max(auv.x + auv.y * 0.577, auv.y * 1.154) * radialDecay;

    float dCombined = dRing;
    dCombined = mix(dCombined, dSakura, wSakura * 0.55);
    dCombined = mix(dCombined, dLotus, wLotus * 0.45);
    dCombined = mix(dCombined, dCrystal, wCyber * 0.40);

    float hueIndex = u_time * 0.08 + i * 0.19 + length(uv0) * 0.36;
    vec3 col = blendedPalette(hueIndex, moodPhase + i * 0.18);

    float waveFreq = 8.0 + 1.5 * sin(u_time * 0.06);
    float wave = sin(dCombined * waveFreq + u_time * 1.4) / waveFreq;
    wave = abs(wave);

    float glow = pow((0.011 * bloomFactor) / (wave + 0.0012), 1.18);
    finalColor += col * glow;

    float petalRim = smoothstep(0.032, 0.0, dSakura) * radialDecay;
    vec3 sakuraTint = vec3(1.0, 0.64, 0.84);
    finalColor += sakuraTint * petalRim * (0.28 + 0.38 * wSakura) * bloomFactor;
  }

  vec2 coreUv = uv0 * rot(-u_time * 0.11);
  float coreBlossom = abs(sakuraBlossomSDF(coreUv, 0.42 + 0.06 * sin(u_time * 0.65)));
  float coreGlow = smoothstep(0.045, 0.0, coreBlossom) * exp(-length(uv0) * 1.6);
  finalColor += vec3(1.0, 0.72, 0.88) * coreGlow * (0.25 + 0.45 * wSakura) * bloomFactor;

  finalColor = 1.0 - exp(-finalColor * 0.92);
  finalColor = pow(max(finalColor, vec3(0.0)), vec3(1.0 / 2.2));

  float vignette = 1.0 - smoothstep(0.45, 2.45, length(uv0));
  finalColor *= mix(0.25, 1.0, vignette);

  finalColor += (hash21(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.022;

  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;

export class KaleidoscopeEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext | WebGL2RenderingContext | null;
  private program: WebGLProgram | null = null;
  private uniformLocations: {
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
  } = {
    time: null,
    resolution: null,
  };

  private simTime = 3.2;
  private lastFrameTimestamp = 0;
  private rafId = 0;
  private readonly onStatsCallback?: (stats: FrameStats) => void;
  private frameCount = 0;
  private statsAccumMs = 0;
  private readonly timeScale: number;

  constructor(canvas: HTMLCanvasElement, onStats?: (stats: FrameStats) => void) {
    this.canvas = canvas;
    this.onStatsCallback = onStats;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.timeScale = prefersReducedMotion ? 0.25 : 1.0;

    const contextAttributes: WebGLContextAttributes = {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    };

    this.gl =
      (canvas.getContext('webgl2', contextAttributes) as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl', contextAttributes) as WebGLRenderingContext | null);

    if (this.gl) {
      this.initWebGL(this.gl);
    }

    this.resize();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(window.innerWidth * dpr));
    const height = Math.max(1, Math.floor(window.innerHeight * dpr));

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    if (this.gl) {
      this.gl.viewport(0, 0, width, height);
    }

    this.draw();
  }

  start(): void {
    if (this.rafId) return;
    this.lastFrameTimestamp = performance.now();
    const tick = (now: number) => {
      const dtMs = Math.min(100, Math.max(0, now - this.lastFrameTimestamp));
      this.lastFrameTimestamp = now;

      this.frameCount++;
      this.statsAccumMs += dtMs;
      if (this.statsAccumMs >= 250 && this.onStatsCallback) {
        const avgMs = this.statsAccumMs / this.frameCount;
        const fps = avgMs > 0 ? Math.round(1000 / avgMs) : 60;
        this.onStatsCallback({
          fps: Math.min(240, fps),
          frameTimeMs: Number(avgMs.toFixed(1)),
        });
        this.frameCount = 0;
        this.statsAccumMs = 0;
      }

      const tempoMod = 0.92 + 0.16 * Math.sin(this.simTime * 0.07);
      this.simTime += (dtMs / 1000) * this.timeScale * tempoMod;

      this.draw();
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  destroy(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    if (this.gl && this.program) {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
  }

  private initWebGL(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    const vert = this.compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const frag = this.compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program link error:', gl.getProgramInfoLog(program));
      return;
    }

    this.program = program;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    this.uniformLocations = {
      time: gl.getUniformLocation(program, 'u_time'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
    };
  }

  private compileShader(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    type: number,
    source: string,
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private draw(): void {
    const gl = this.gl;
    if (!gl || !this.program) {
      this.drawFallback2D();
      return;
    }

    gl.useProgram(this.program);
    gl.uniform1f(this.uniformLocations.time, this.simTime);
    gl.uniform2f(this.uniformLocations.resolution, this.canvas.width, this.canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private drawFallback2D(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = this.canvas;
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      10,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.6,
    );
    grad.addColorStop(0, '#ff8ab5');
    grad.addColorStop(0.5, '#7e22ce');
    grad.addColorStop(1, '#090514');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

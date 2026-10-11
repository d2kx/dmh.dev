export type KaleidoscopeModeId = 'sakura' | 'prism' | 'lotus' | 'cyber';

export interface KaleidoscopeState {
  mode: KaleidoscopeModeId;
  speed: number;
  segments: number;
  bloom: number;
  paused: boolean;
  interactiveTilt: boolean;
}

const MODE_INDEX: Record<KaleidoscopeModeId, number> = {
  sakura: 0,
  prism: 1,
  lotus: 2,
  cyber: 3,
};

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
uniform float u_segments;
uniform float u_bloom;
uniform float u_mode;
uniform vec2 u_pointer;

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

// Signed distance approximation to a 5-petal notched Sakura cherry blossom
float sakuraBlossomSDF(vec2 p, float radius) {
  float a = atan(p.y, p.x);
  float r = length(p);
  float wave = cos(5.0 * a);
  float petalBody = 0.58 + 0.42 * smoothstep(-0.65, 0.95, wave);
  // Characteristic sakura cleft notch at the tip of each of the 5 petals
  float tipNotch = 0.13 * pow(max(0.0, wave), 10.0);
  float targetR = radius * (petalBody - tipNotch);
  return r - targetR;
}

// Multi-petal lotus/flower contour
float floralWaveSDF(vec2 p, float radius, float petals) {
  float a = atan(p.y, p.x);
  float r = length(p);
  float lobe = 0.65 + 0.35 * cos(petals * a) + 0.10 * cos(petals * 2.0 * a);
  return r - radius * lobe;
}

// Palette helper curated for Sakura / Psychedelic modes
vec3 sakuraPalette(float t, float mode) {
  if (mode < 0.5) {
    // Mode 0: Sakura Bloom (cherry blossom pink, magenta, warm gold, deep violet, cyan)
    vec3 a = vec3(0.66, 0.36, 0.58);
    vec3 b = vec3(0.42, 0.38, 0.42);
    vec3 c = vec3(1.0, 0.85, 0.95);
    vec3 d = vec3(0.92, 0.18, 0.48);
    return a + b * cos(TAU * (c * t + d));
  } else if (mode < 1.5) {
    // Mode 1: Classic Prism Fractal (vibrant full-spectrum HSV rainbow)
    return hsv2rgb(vec3(fract(t), 0.84, 1.0));
  } else if (mode < 2.5) {
    // Mode 2: Lotus Mandala (rose, emerald-jade, royal violet, warm amber)
    vec3 a = vec3(0.55, 0.48, 0.62);
    vec3 b = vec3(0.45, 0.42, 0.45);
    vec3 c = vec3(1.0, 1.0, 0.85);
    vec3 d = vec3(0.10, 0.42, 0.68);
    return a + b * cos(TAU * (c * t + d));
  } else {
    // Mode 3: Neon Cyber (electric magenta, laser cyan, ultraviolet)
    vec3 a = vec3(0.52, 0.32, 0.68);
    vec3 b = vec3(0.48, 0.46, 0.48);
    vec3 c = vec3(0.85, 1.0, 1.15);
    vec3 d = vec3(0.78, 0.12, 0.45);
    return a + b * cos(TAU * (c * t + d));
  }
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Subtle interactive prism shift from pointer/touch
  uv += u_pointer * 0.16;
  vec2 uv0 = uv;

  // Kaleidoscope polar folding
  float segments = floor(max(3.0, u_segments) + 0.5);
  float angle = atan(uv.y, uv.x);
  float radius = length(uv);

  angle += u_time * 0.18;

  float segmentAngle = TAU / segments;
  angle = mod(angle, segmentAngle);
  angle = abs(angle - segmentAngle * 0.5);

  uv = radius * vec2(cos(angle), sin(angle));

  vec3 finalColor = vec3(0.0);
  float bloomFactor = clamp(u_bloom, 0.25, 2.2);

  // Iterative fractal + blossom folding
  for (float i = 0.0; i < 4.0; i++) {
    float scale = (u_mode > 2.5) ? 1.62 : 1.48;
    uv = fract(uv * scale) - 0.5;
    uv *= rot(u_time * 0.26 + i * PI * 0.22);

    float radialDecay = exp(-length(uv0) * 0.85);
    float dRing = length(uv) * radialDecay;

    // Blend in procedural Sakura / Floral geometry
    vec2 blossomPos = uv * rot(-u_time * 0.35 + i * 1.1);
    float dSakura = sakuraBlossomSDF(blossomPos, 0.26 + 0.05 * sin(u_time + i));
    float dLotus = floralWaveSDF(blossomPos, 0.28, 6.0 + i * 2.0);

    float dCombined = dRing;
    if (u_mode < 0.5) {
      // Sakura Bloom: weave notched cherry blossom contours into the fractal rings
      dCombined = mix(dRing, abs(dSakura), 0.46);
    } else if (u_mode > 1.5 && u_mode < 2.5) {
      // Lotus Mandala: strong botanical petal harmonics
      dCombined = mix(dRing, abs(dLotus), 0.58);
    } else if (u_mode > 2.5) {
      // Neon Cyber: faceted Chebyshev/octagonal crystal distance
      vec2 auv = abs(uv);
      float crystal = max(auv.x + auv.y * 0.577, auv.y * 1.154) * radialDecay;
      dCombined = mix(dRing, crystal, 0.55);
    } else {
      // Prism Fractal: subtle sakura harmonic over classic rings
      dCombined = mix(dRing, abs(dSakura), 0.18);
    }

    float hueIndex = u_time * 0.09 + i * 0.19 + length(uv0) * 0.38;
    vec3 col = sakuraPalette(hueIndex, u_mode);

    float waveFreq = (u_mode > 2.5) ? 10.0 : 8.0;
    float wave = sin(dCombined * waveFreq + u_time * 1.45) / waveFreq;
    wave = abs(wave);

    float glow = pow((0.011 * bloomFactor) / (wave + 0.0012), 1.18);
    finalColor += col * glow;

    // Add delicate glowing sakura petal highlights on modes 0 & 2
    if (u_mode < 0.5 || (u_mode > 1.5 && u_mode < 2.5)) {
      float petalRim = smoothstep(0.032, 0.0, abs(dSakura)) * radialDecay;
      vec3 sakuraTint = vec3(1.0, 0.62, 0.82);
      finalColor += sakuraTint * petalRim * 0.55 * bloomFactor;
    }
  }

  // Central macro Sakura mandala core (subtle emblem at the heart of the kaleidoscope)
  vec2 coreUv = uv0 * rot(-u_time * 0.12);
  float coreBlossom = sakuraBlossomSDF(coreUv, 0.42 + 0.06 * sin(u_time * 0.8));
  float coreGlow = smoothstep(0.045, 0.0, abs(coreBlossom)) * exp(-length(uv0) * 1.6);
  finalColor += vec3(1.0, 0.72, 0.88) * coreGlow * (u_mode < 0.5 ? 0.65 : 0.22) * bloomFactor;

  // Smooth exponential tone mapping and gamma correction
  finalColor = 1.0 - exp(-finalColor * 0.92);
  finalColor = pow(max(finalColor, vec3(0.0)), vec3(1.0 / 2.2));

  // Soft radial vignette
  float vignette = 1.0 - smoothstep(0.45, 2.45, length(uv0));
  finalColor *= mix(0.25, 1.0, vignette);

  // Subtle dithering noise to prevent gradient banding
  finalColor += (hash21(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.022;

  gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`;

export interface FrameStats {
  fps: number;
  frameTimeMs: number;
}

export class KaleidoscopeEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext | WebGL2RenderingContext | null;
  private program: WebGLProgram | null = null;
  private uniformLocations: {
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
    segments: WebGLUniformLocation | null;
    bloom: WebGLUniformLocation | null;
    mode: WebGLUniformLocation | null;
    pointer: WebGLUniformLocation | null;
  } = {
    time: null,
    resolution: null,
    segments: null,
    bloom: null,
    mode: null,
    pointer: null,
  };

  private state: KaleidoscopeState;
  private simTime = 2.4; // Start at an immediately rich visual frame
  private lastFrameTimestamp = 0;
  private rafId = 0;
  private pointerTarget = { x: 0, y: 0 };
  private pointerCurrent = { x: 0, y: 0 };
  private onStatsCallback?: (stats: FrameStats) => void;
  private frameCount = 0;
  private statsAccumMs = 0;

  constructor(
    canvas: HTMLCanvasElement,
    initialState: KaleidoscopeState,
    onStats?: (stats: FrameStats) => void,
  ) {
    this.canvas = canvas;
    this.state = { ...initialState };
    this.onStatsCallback = onStats;

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

  public updateState(partial: Partial<KaleidoscopeState>): void {
    this.state = { ...this.state, ...partial };
    if (!this.state.interactiveTilt) {
      this.pointerTarget = { x: 0, y: 0 };
    }
    this.renderSingleFrame();
  }

  public getState(): Readonly<KaleidoscopeState> {
    return this.state;
  }

  public setPointer(normX: number, normY: number): void {
    if (!this.state.interactiveTilt) return;
    this.pointerTarget.x = Math.max(-1, Math.min(1, normX));
    this.pointerTarget.y = Math.max(-1, Math.min(1, normY));
  }

  public resize(): void {
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

    this.renderSingleFrame();
  }

  public start(): void {
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

      if (!this.state.paused) {
        this.simTime += (dtMs / 1000) * this.state.speed;
      }

      // Smooth pointer damping
      this.pointerCurrent.x += (this.pointerTarget.x - this.pointerCurrent.x) * 0.08;
      this.pointerCurrent.y += (this.pointerTarget.y - this.pointerCurrent.y) * 0.08;

      this.draw();
      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  public renderSingleFrame(): void {
    this.draw();
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

    // Fullscreen quad (2 triangles)
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
      segments: gl.getUniformLocation(program, 'u_segments'),
      bloom: gl.getUniformLocation(program, 'u_bloom'),
      mode: gl.getUniformLocation(program, 'u_mode'),
      pointer: gl.getUniformLocation(program, 'u_pointer'),
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
    gl.uniform1f(this.uniformLocations.segments, this.state.segments);
    gl.uniform1f(this.uniformLocations.bloom, this.state.bloom);
    gl.uniform1f(this.uniformLocations.mode, MODE_INDEX[this.state.mode]);
    gl.uniform2f(this.uniformLocations.pointer, this.pointerCurrent.x, this.pointerCurrent.y);

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

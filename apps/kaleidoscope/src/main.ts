import './style.css';
import {
  FrameStats,
  KaleidoscopeEngine,
  KaleidoscopeModeId,
} from './kaleidoscope-gl.ts';

const canvas = document.getElementById('kaleidoscope-canvas') as HTMLCanvasElement;
const hudTop = document.getElementById('hud-top') as HTMLElement;
const hudBottom = document.getElementById('hud-bottom') as HTMLElement;

const perfPill = document.getElementById('perf-pill') as HTMLElement;
const perfFps = document.getElementById('perf-fps') as HTMLElement;
const perfMs = document.getElementById('perf-ms') as HTMLElement;
const sparklineLine = document.getElementById('perf-sparkline-line') as unknown as SVGPolylineElement;
const sparklineFill = document.getElementById('perf-sparkline-fill') as unknown as SVGPolylineElement;

const segmentsSlider = document.getElementById('segments-slider') as HTMLInputElement;
const segmentsValue = document.getElementById('segments-value') as HTMLElement;
const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
const speedValue = document.getElementById('speed-value') as HTMLElement;
const bloomSlider = document.getElementById('bloom-slider') as HTMLInputElement;
const bloomValue = document.getElementById('bloom-value') as HTMLElement;

const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const statsBtn = document.getElementById('stats-btn') as HTMLButtonElement;
const fullscreenBtn = document.getElementById('fullscreen-btn') as HTMLButtonElement;
const modeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.mode-btn'));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fpsHistory: number[] = new Array(24).fill(60);
let statsVisible = false;

function updateSparkline(stats: FrameStats): void {
  if (!statsVisible) return;
  perfFps.textContent = `${stats.fps} FPS`;
  perfMs.textContent = `${stats.frameTimeMs.toFixed(1)} ms`;

  fpsHistory.push(Math.max(10, Math.min(120, stats.fps)));
  if (fpsHistory.length > 24) {
    fpsHistory.shift();
  }

  const width = 72;
  const height = 22;
  const maxFps = Math.max(65, ...fpsHistory);
  const points = fpsHistory.map((val, idx) => {
    const x = (idx / (fpsHistory.length - 1)) * width;
    const norm = Math.min(1, Math.max(0, val / maxFps));
    const y = height - 3 - norm * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePts = points.join(' ');
  sparklineLine.setAttribute('points', linePts);
  sparklineFill.setAttribute('points', `0,${height} ${linePts} ${width},${height}`);
}

const engine = new KaleidoscopeEngine(
  canvas,
  {
    mode: 'sakura',
    speed: prefersReducedMotion ? 0.3 : 1.0,
    segments: 8,
    bloom: 1.0,
    paused: prefersReducedMotion,
    interactiveTilt: true,
  },
  updateSparkline,
);

if (prefersReducedMotion) {
  speedSlider.value = '0.3';
  speedValue.textContent = '0.3x';
  pauseBtn.setAttribute('aria-pressed', 'true');
  pauseBtn.textContent = 'Resume';
}

// Mode selection
for (const btn of modeButtons) {
  btn.addEventListener('click', () => {
    const mode = (btn.dataset['mode'] as KaleidoscopeModeId) || 'sakura';
    for (const other of modeButtons) {
      other.setAttribute('aria-pressed', String(other === btn));
    }
    engine.updateState({ mode });
  });
}

// Sliders
segmentsSlider.addEventListener('input', () => {
  const segments = Number.parseInt(segmentsSlider.value, 10);
  segmentsValue.textContent = String(segments);
  engine.updateState({ segments });
});

speedSlider.addEventListener('input', () => {
  const speed = Number.parseFloat(speedSlider.value);
  speedValue.textContent = `${speed.toFixed(1)}x`;
  engine.updateState({ speed });
});

bloomSlider.addEventListener('input', () => {
  const bloom = Number.parseFloat(bloomSlider.value);
  bloomValue.textContent = bloom.toFixed(1);
  engine.updateState({ bloom });
});

// Pause / Resume
function togglePause(): void {
  const nextPaused = !engine.getState().paused;
  engine.updateState({ paused: nextPaused });
  pauseBtn.setAttribute('aria-pressed', String(nextPaused));
  pauseBtn.textContent = nextPaused ? 'Resume' : 'Pause';
}

pauseBtn.addEventListener('click', togglePause);

// Optional Performance HUD toggle
function toggleStats(): void {
  statsVisible = !statsVisible;
  perfPill.hidden = !statsVisible;
  statsBtn.setAttribute('aria-pressed', String(statsVisible));
}

statsBtn.addEventListener('click', toggleStats);

// Fullscreen toggle
function toggleFullscreen(): void {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {
      // Ignore fullscreen rejection
    });
  } else if (document.exitFullscreen) {
    document.exitFullscreen().catch(() => {
      // Ignore exit rejection
    });
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

document.addEventListener('fullscreenchange', () => {
  fullscreenBtn.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
});

// Keyboard shortcuts (Space = Pause, P = Stats, F = Fullscreen, 1-4 = Modes)
window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLInputElement) return;
  if (event.code === 'Space') {
    event.preventDefault();
    togglePause();
  } else if (event.key === 'p' || event.key === 'P') {
    toggleStats();
  } else if (event.key === 'f' || event.key === 'F') {
    toggleFullscreen();
  } else if (['1', '2', '3', '4'].includes(event.key)) {
    const index = Number(event.key) - 1;
    modeButtons[index]?.click();
  }
});

// Interactive pointer prism tilt & auto-hide UI
let hideTimer = 0;
let pointerInsideHud = false;

function showHudAndScheduleHide(): void {
  hudTop.classList.remove('is-idle');
  hudBottom.classList.remove('is-idle');
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    const hasFocusInside =
      hudTop.matches(':focus-within') || hudBottom.matches(':focus-within');
    if (!pointerInsideHud && !hasFocusInside) {
      hudTop.classList.add('is-idle');
      hudBottom.classList.add('is-idle');
    }
  }, 3500);
}

for (const el of [hudTop, hudBottom]) {
  el.addEventListener('pointerenter', () => {
    pointerInsideHud = true;
    showHudAndScheduleHide();
  });
  el.addEventListener('pointerleave', () => {
    pointerInsideHud = false;
    showHudAndScheduleHide();
  });
  el.addEventListener('focusin', showHudAndScheduleHide);
}

window.addEventListener(
  'pointermove',
  (event) => {
    const normX = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const normY = -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    engine.setPointer(normX, normY);
    showHudAndScheduleHide();
  },
  { passive: true },
);

window.addEventListener('touchstart', showHudAndScheduleHide, { passive: true });
window.addEventListener('resize', () => engine.resize(), { passive: true });

showHudAndScheduleHide();
engine.start();

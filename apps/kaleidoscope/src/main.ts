import './style.css';
import { FrameStats, KaleidoscopeEngine } from './kaleidoscope-gl.ts';

const canvas = document.getElementById('kaleidoscope-canvas') as HTMLCanvasElement;
const hudBar = document.getElementById('hud-bar') as HTMLElement;

const perfSegment = document.getElementById('perf-segment') as HTMLElement;
const perfFps = document.getElementById('perf-fps') as HTMLElement;
const perfMs = document.getElementById('perf-ms') as HTMLElement;
const sparklineLine = document.getElementById('perf-sparkline-line') as unknown as SVGPolylineElement;
const sparklineFill = document.getElementById('perf-sparkline-fill') as unknown as SVGPolylineElement;

const statsBtn = document.getElementById('stats-btn') as HTMLButtonElement;
const fullscreenBtn = document.getElementById('fullscreen-btn') as HTMLButtonElement;

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

  const width = 64;
  const height = 20;
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

const engine = new KaleidoscopeEngine(canvas, updateSparkline);

function toggleStats(): void {
  statsVisible = !statsVisible;
  perfSegment.hidden = !statsVisible;
  statsBtn.setAttribute('aria-pressed', String(statsVisible));
}

statsBtn.addEventListener('click', toggleStats);

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

window.addEventListener('keydown', (event) => {
  if (event.key === 's' || event.key === 'S' || event.key === 'p' || event.key === 'P') {
    toggleStats();
  } else if (event.key === 'f' || event.key === 'F') {
    toggleFullscreen();
  }
});

// Auto-hide unified HUD pill after 3 seconds of pointer inactivity
let hideTimer = 0;
let pointerInsideHud = false;

function showHudAndScheduleHide(): void {
  hudBar.classList.remove('is-idle');
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    const hasFocusInside = hudBar.matches(':focus-within');
    if (!pointerInsideHud && !hasFocusInside) {
      hudBar.classList.add('is-idle');
    }
  }, 3000);
}

hudBar.addEventListener('pointerenter', () => {
  pointerInsideHud = true;
  showHudAndScheduleHide();
});

hudBar.addEventListener('pointerleave', () => {
  pointerInsideHud = false;
  showHudAndScheduleHide();
});

hudBar.addEventListener('focusin', showHudAndScheduleHide);

window.addEventListener('pointermove', showHudAndScheduleHide, { passive: true });
window.addEventListener('touchstart', showHudAndScheduleHide, { passive: true });
window.addEventListener('resize', () => engine.resize(), { passive: true });

showHudAndScheduleHide();
engine.start();

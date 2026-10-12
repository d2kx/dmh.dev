import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { ShellContextService } from '../../core/shell-context';
import { KaleidoscopeEngine } from './kaleidoscope-gl';

@Component({
  selector: 'app-kaleidoscope',
  template: `
    <div class="kaleidoscope-stage">
      <h1 class="sr-only">Kaleidoscope · Interactive WebGL Sakura and Fractal Shader</h1>
      <canvas
        #glCanvas
        class="kaleidoscope-canvas"
        aria-label="Continuously evolving WebGL fractal and cherry blossom kaleidoscope"
      ></canvas>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100vw;
      height: 100dvh;
      overflow: hidden;
      background-color: #090514;
    }

    .kaleidoscope-stage {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .kaleidoscope-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `,
  host: {
    '(window:resize)': 'onResize()',
    '(window:pointermove)': 'onActivity()',
    '(window:touchstart)': 'onActivity()',
    '(window:keydown)': 'onKeydown($event)',
  },
})
export class Kaleidoscope {
  private readonly shell = inject(ShellContextService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('glCanvas');

  private engine: KaleidoscopeEngine | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    afterNextRender(() => {
      const canvas = this.canvasRef().nativeElement;
      this.engine = new KaleidoscopeEngine(canvas, (stats) => {
        this.shell.updateKaleidoscopeStats(stats.fps, stats.frameTimeMs);
      });
      this.engine.start();
      this.onActivity();
    });

    this.destroyRef.onDestroy(() => {
      this.engine?.destroy();
      this.engine = null;
      if (this.idleTimer) {
        clearTimeout(this.idleTimer);
      }
      this.shell.kaleidoscopeIdle.set(false);
    });
  }

  protected onResize(): void {
    this.engine?.resize();
  }

  protected onActivity(): void {
    this.shell.kaleidoscopeIdle.set(false);
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    this.idleTimer = setTimeout(() => {
      this.shell.kaleidoscopeIdle.set(true);
    }, 3000);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 's' || event.key === 'S' || event.key === 'p' || event.key === 'P') {
      this.shell.toggleKaleidoscopeStats();
      this.onActivity();
    } else if (event.key === 'f' || event.key === 'F') {
      this.shell.toggleFullscreen();
      this.onActivity();
    }
  }
}

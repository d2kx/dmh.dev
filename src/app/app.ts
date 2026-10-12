import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { filter } from 'rxjs/operators';
import { SeoService } from './core/seo';
import { ShellContextService } from './core/shell-context';
import { ThemeService } from './core/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbar, MatButton, MatIconButton],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeProjectsMenu()',
  },
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly shell = inject(ShellContextService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);

  protected readonly title = signal('dmh.dev');
  protected readonly projectsMenuOpen = signal(false);
  protected readonly projectsNavContainer = viewChild<ElementRef<HTMLElement>>('projectsNavItem');

  private closeMenuTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.seo.init();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeProjectsMenu();
      });
  }

  protected openProjectsMenu(): void {
    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
      this.closeMenuTimer = null;
    }
    this.projectsMenuOpen.set(true);
  }

  protected scheduleCloseProjectsMenu(): void {
    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
    }
    this.closeMenuTimer = setTimeout(() => {
      this.projectsMenuOpen.set(false);
    }, 150);
  }

  protected toggleProjectsMenu(event: Event): void {
    event.stopPropagation();
    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
      this.closeMenuTimer = null;
    }
    this.projectsMenuOpen.update((open) => !open);
  }

  protected closeProjectsMenu(): void {
    if (this.closeMenuTimer) {
      clearTimeout(this.closeMenuTimer);
      this.closeMenuTimer = null;
    }
    this.projectsMenuOpen.set(false);
  }

  protected onDocumentClick(event: Event): void {
    if (!this.projectsMenuOpen()) {
      return;
    }
    const container = this.projectsNavContainer()?.nativeElement;
    if (container && event.target instanceof Node && !container.contains(event.target)) {
      this.closeProjectsMenu();
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { ThemeService } from './core/theme';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly exact: boolean;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbar, MatButton, MatIconButton],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly title = signal('dmh.dev');
  protected readonly navItems = signal<readonly NavItem[]>([
    { path: '/', label: 'Home', exact: true },
    { path: '/projects', label: 'Projects', exact: false },
    { path: '/blog', label: 'Blog', exact: false },
    { path: '/about', label: 'About', exact: false },
  ]);
}

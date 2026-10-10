import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly exact: boolean;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('dmh.dev');
  protected readonly navItems = signal< readonly NavItem[]>([
    { path: '/', label: 'Home', exact: true },
    { path: '/projects', label: 'Projects & Apps', exact: false },
    { path: '/blog', label: 'Blog', exact: false },
    { path: '/about', label: 'About', exact: false },
  ]);
}

import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

interface HighlightCard {
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly linkText: string;
}

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
  ],
  template: `
    <section class="hero" aria-labelledby="hero-heading">
      <span class="sakura-pill">Software · Web · Projects</span>
      <h1 id="hero-heading">Hi, I’m Dennis Martin Herbers.</h1>
      <p class="lead">
        Welcome to my personal space on the web — a home for my software engineering work,
        side projects, interactive tools, and technical notes.
      </p>
      <div class="hero-actions">
        <a mat-flat-button routerLink="/projects" class="cta-primary">Explore Projects</a>
        <a mat-stroked-button routerLink="/about" class="cta-secondary">About Me</a>
      </div>
    </section>

    <section class="grid-section" aria-label="Featured sections">
      <div class="card-grid">
        @for (card of highlights(); track card.title) {
          <mat-card appearance="outlined" class="feature-card">
            <mat-card-header>
              <mat-card-title class="card-title">{{ card.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content class="card-body">
              <p>{{ card.description }}</p>
            </mat-card-content>
            <mat-card-actions class="card-footer">
              <a mat-button [routerLink]="card.route" class="card-link">
                {{ card.linkText }} →
              </a>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </section>
  `,
  styles: `
    .hero {
      padding: 1.25rem 0 2.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .sakura-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      background-color: var(--accent-subtle);
      color: var(--accent-on-subtle);
      border: 1px solid var(--accent-border);
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      margin-bottom: 1rem;
    }

    h1 {
      font-size: clamp(2.125rem, 4.5vw, 3rem);
      line-height: 1.12;
      margin: 0 0 1rem;
      letter-spacing: -0.03em;
    }

    .lead {
      font-size: 1.15rem;
      color: var(--text-muted);
      max-width: 42rem;
      margin: 0 0 1.75rem;
    }

    .hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .cta-primary,
    .cta-secondary {
      text-decoration: none;
      font-weight: 600;
    }

    .grid-section {
      padding-top: 2.5rem;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16.5rem, 1fr));
      gap: 1.25rem;
    }

    .feature-card {
      background-color: var(--surface-card);
      border-color: var(--border-subtle);
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition:
        border-color 150ms ease,
        transform 150ms ease;
    }

    .feature-card:hover {
      border-color: var(--accent-border);
    }

    .card-title {
      font-size: 1.2rem;
      font-weight: 650;
    }

    .card-body {
      padding-top: 0.5rem;
      flex: 1;
    }

    .card-body p {
      margin: 0;
      color: var(--text-muted);
    }

    .card-footer {
      padding: 0.5rem 1rem 1rem;
    }

    .card-link {
      font-weight: 600;
      text-decoration: none;
    }
  `,
})
export class Home {
  protected readonly highlights = signal<readonly HighlightCard[]>([
    {
      title: 'Projects & Tools',
      description:
        'Selected software projects, experiments, and small web utilities I am building and maintaining.',
      route: '/projects',
      linkText: 'Browse projects',
    },
    {
      title: 'Blog & Notes',
      description:
        'Articles and practical notes on software engineering, web interfaces, and hobby topics.',
      route: '/blog',
      linkText: 'Read the blog',
    },
    {
      title: 'About & Contact',
      description:
        'A bit of background on who I am, what I enjoy working on, and how to get in touch.',
      route: '/about',
      linkText: 'More about me',
    },
  ]);
}

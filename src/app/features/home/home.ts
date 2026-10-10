import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HighlightCard {
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly linkText: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="hero" aria-labelledby="hero-heading">
      <p class="eyebrow">dmh.dev</p>
      <h1 id="hero-heading">Hi, I’m Dennis Martin Herbers.</h1>
      <p class="lead">
        Welcome to my personal corner of the web — a hub for my software engineering work,
        side projects, standalone mini-apps, and technical notes.
      </p>
      <div class="hero-actions">
        <a routerLink="/projects" class="btn-primary">Explore Projects &amp; Apps</a>
        <a routerLink="/about" class="btn-secondary">About Me</a>
      </div>
    </section>

    <section class="grid-section" aria-label="Site sections">
      <div class="card-grid">
        @for (card of highlights(); track card.title) {
          <article class="card">
            <h2>{{ card.title }}</h2>
            <p>{{ card.description }}</p>
            <a [routerLink]="card.route" class="card-link">{{ card.linkText }} →</a>
          </article>
        }
      </div>
    </section>
  `,
  styles: `
    .hero {
      padding: 1.5rem 0 2.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .eyebrow {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin: 0 0 0.5rem;
    }

    h1 {
      font-size: clamp(2rem, 4vw, 2.75rem);
      line-height: 1.15;
      margin: 0 0 1rem;
      letter-spacing: -0.025em;
    }

    .lead {
      font-size: 1.125rem;
      color: var(--text-muted);
      max-width: 42rem;
      margin: 0 0 1.75rem;
    }

    .hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      padding: 0.625rem 1.125rem;
      border-radius: 0.5rem;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
    }

    .btn-primary {
      background-color: var(--accent);
      color: #ffffff;
    }

    @media (prefers-color-scheme: dark) {
      .btn-primary {
        color: #0b0f19;
      }
    }

    .btn-secondary {
      background-color: var(--surface-card);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
    }

    .grid-section {
      padding-top: 2.5rem;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
      gap: 1.25rem;
    }

    .card {
      background-color: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 0.75rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .card h2 {
      font-size: 1.2rem;
      margin: 0;
    }

    .card p {
      margin: 0;
      color: var(--text-muted);
      flex: 1;
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
      title: 'Projects & Mini-Apps',
      description:
        'Experiments, utilities, and standalone web apps hosted under *.dmh.dev subdomains.',
      route: '/projects',
      linkText: 'View projects',
    },
    {
      title: 'Blog & Notes',
      description:
        'Thoughts on software architecture, modern web development, Angular, and hobby projects.',
      route: '/blog',
      linkText: 'Read the blog',
    },
    {
      title: 'About & Work',
      description: 'Background on my work, engineering interests, and hobbies.',
      route: '/about',
      linkText: 'Learn more',
    },
  ]);
}

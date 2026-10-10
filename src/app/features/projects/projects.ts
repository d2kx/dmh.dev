import { Component, signal } from '@angular/core';

interface ProjectEntry {
  readonly name: string;
  readonly status: 'Live' | 'Planned';
  readonly subdomain: string;
  readonly summary: string;
}

@Component({
  selector: 'app-projects',
  template: `
    <section aria-labelledby="projects-heading">
      <h1 id="projects-heading">Projects &amp; Mini-Apps</h1>
      <p class="intro">
        This monorepo powers both <code>dmh.dev</code> and standalone mini-apps deployed on
        dedicated subdomains (<code>app1.dmh.dev</code>, <code>app2.dmh.dev</code>, etc.).
      </p>

      <div class="project-list">
        @for (project of projects(); track project.name) {
          <article class="project-card">
            <div class="project-header">
              <h2>{{ project.name }}</h2>
              <span class="badge" [class.badge-live]="project.status === 'Live'">
                {{ project.status }}
              </span>
            </div>
            <p class="subdomain">{{ project.subdomain }}</p>
            <p class="summary">{{ project.summary }}</p>
          </article>
        }
      </div>
    </section>
  `,
  styles: `
    h1 {
      font-size: 2rem;
      margin: 0 0 0.75rem;
    }

    .intro {
      color: var(--text-muted);
      max-width: 42rem;
      margin: 0 0 2rem;
    }

    .project-list {
      display: grid;
      gap: 1rem;
    }

    .project-card {
      background-color: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 0.75rem;
      padding: 1.5rem;
    }

    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .project-header h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      background-color: var(--accent-subtle);
      color: var(--accent);
    }

    .subdomain {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875rem;
      color: var(--accent);
      margin: 0.375rem 0 0.75rem;
    }

    .summary {
      margin: 0;
      color: var(--text-muted);
    }
  `,
})
export class Projects {
  protected readonly projects = signal<readonly ProjectEntry[]>([
    {
      name: 'dmh.dev Main Site',
      status: 'Live',
      subdomain: 'dmh.dev',
      summary:
        'Personal website and hub built with Angular 22 using hybrid build-time prerendering (SSG) and Server-Side Rendering (SSR) on Railway.',
    },
    {
      name: 'Future Mini-Apps',
      status: 'Planned',
      subdomain: '*.dmh.dev / apps/',
      summary:
        'Upcoming self-contained mini-apps and experiments hosted from the /apps directory of the dmh.dev monorepo.',
    },
  ]);
}

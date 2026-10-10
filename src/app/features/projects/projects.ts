import { Component, signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatChip, MatChipSet } from '@angular/material/chips';

interface ProjectEntry {
  readonly name: string;
  readonly status: 'Live' | 'In Progress';
  readonly tags: readonly string[];
  readonly summary: string;
}

@Component({
  selector: 'app-projects',
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatChipSet, MatChip],
  template: `
    <section aria-labelledby="projects-heading">
      <p class="eyebrow">Work &amp; Experiments</p>
      <h1 id="projects-heading">Projects</h1>
      <p class="intro">
        A growing collection of personal software projects, interactive web applications, and tools.
      </p>

      <div class="project-list">
        @for (project of projects(); track project.name) {
          <mat-card appearance="outlined" class="project-card">
            <mat-card-header class="project-header">
              <mat-card-title class="project-title">{{ project.name }}</mat-card-title>
              <span class="status-badge" [class.status-live]="project.status === 'Live'">
                {{ project.status }}
              </span>
            </mat-card-header>
            <mat-card-content class="project-body">
              <p class="summary">{{ project.summary }}</p>
              <mat-chip-set aria-label="Project tags">
                @for (tag of project.tags; track tag) {
                  <mat-chip>{{ tag }}</mat-chip>
                }
              </mat-chip-set>
            </mat-card-content>
          </mat-card>
        }
      </div>
    </section>
  `,
  styles: `
    .eyebrow {
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin: 0 0 0.375rem;
    }

    h1 {
      font-size: clamp(1.75rem, 3.5vw, 2.25rem);
      margin: 0 0 0.75rem;
    }

    .intro {
      color: var(--text-muted);
      max-width: 42rem;
      margin: 0 0 2rem;
    }

    .project-list {
      display: grid;
      gap: 1.25rem;
    }

    .project-card {
      background-color: var(--surface-card);
      border-color: var(--border-subtle);
      border-radius: 1rem;
    }

    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 0.5rem;
    }

    .project-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 650;
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      background-color: var(--accent-subtle);
      color: var(--accent-on-subtle);
      border: 1px solid var(--accent-border);
      margin-left: auto;
    }

    .project-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
      name: 'dmh.dev',
      status: 'Live',
      tags: ['TypeScript', 'Angular', 'Material Design'],
      summary:
        'My personal website and blog featuring a custom Sakura-accented light and dark theme, accessible typography, and space for writing and experiments.',
    },
    {
      name: 'Upcoming Web Tools & Mini-Projects',
      status: 'In Progress',
      tags: ['Web Apps', 'Utilities', 'Side Projects'],
      summary:
        'Small, focused web applications and hobby utilities currently in development. New projects will be listed here as they launch.',
    },
  ]);
}

import { Component, signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';

interface BlogPostPreview {
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly excerpt: string;
}

@Component({
  selector: 'app-blog',
  imports: [MatCard, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardContent],
  template: `
    <section aria-labelledby="blog-heading">
      <p class="eyebrow">Writing &amp; Notes</p>
      <h1 id="blog-heading">Blog</h1>
      <p class="intro">
        Articles and notes on software development, web design, and personal projects.
      </p>

      <div class="post-list">
        @for (post of posts(); track post.slug) {
          <mat-card appearance="outlined" class="post-card">
            <mat-card-header>
              <mat-card-subtitle class="post-date">
                <time [attr.datetime]="post.date">{{ post.date }}</time>
              </mat-card-subtitle>
              <mat-card-title class="post-title">{{ post.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="post-excerpt">{{ post.excerpt }}</p>
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

    .post-list {
      display: grid;
      gap: 1.25rem;
    }

    .post-card {
      background-color: var(--surface-card);
      border-color: var(--border-subtle);
      border-radius: 1rem;
    }

    .post-date {
      font-size: 0.85rem;
      color: var(--accent);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-bottom: 0.25rem;
    }

    .post-title {
      font-size: 1.25rem;
      font-weight: 650;
      margin-bottom: 0.5rem;
    }

    .post-excerpt {
      margin: 0;
      color: var(--text-muted);
    }
  `,
})
export class Blog {
  protected readonly posts = signal<readonly BlogPostPreview[]>([
    {
      slug: 'welcome-to-dmh-dev',
      title: 'Welcome to dmh.dev — Notes on Software, Design & Side Projects',
      date: '2026-10-10',
      excerpt:
        'A fresh space to share thoughts on software engineering, clean interfaces, and the projects I am working on.',
    },
  ]);
}

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
    <section aria-labelledby="blog-heading" class="blog-section">
      <header class="blog-header">
        <p class="eyebrow">Writing &amp; Notes</p>
        <h1 id="blog-heading">Blog</h1>
        <p class="intro">
          Articles and notes on software development, web design, and personal projects.
        </p>
      </header>

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
        } @empty {
          <div class="empty-state" role="status">
            <div class="empty-icon-wrap" aria-hidden="true">
              <div class="empty-icon-glow"></div>
              <div class="empty-icon-badge">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
            </div>
            <span class="coming-soon-pill">Coming Soon</span>
            <h2 class="empty-title">No articles published yet</h2>
            <p class="empty-description">
              First articles and technical notes are in progress and will be published here once
              they are ready.
            </p>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .blog-header {
      margin-bottom: 2rem;
    }

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
      margin: 0 0 0.65rem;
      letter-spacing: -0.02em;
    }

    .intro {
      color: var(--text-muted);
      max-width: 42rem;
      margin: 0;
      font-size: 1.02rem;
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

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 3.25rem 1.75rem;
      border-radius: 1.15rem;
      background-color: var(--surface-card);
      border: 1px dashed var(--accent-border);
    }

    .empty-icon-wrap {
      position: relative;
      margin-bottom: 1.1rem;
    }

    .empty-icon-glow {
      position: absolute;
      inset: -0.6rem;
      border-radius: 50%;
      background: var(--accent-subtle);
      filter: blur(14px);
      opacity: 0.7;
      pointer-events: none;
    }

    .empty-icon-badge {
      position: relative;
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 0.9rem;
      background-color: var(--accent-subtle);
      border: 1px solid var(--accent-border);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .coming-soon-pill {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      background-color: var(--accent-subtle);
      color: var(--accent-on-subtle);
      border: 1px solid var(--accent-border);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    .empty-title {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.015em;
      color: var(--text-primary);
    }

    .empty-description {
      margin: 0;
      max-width: 28rem;
      font-size: 0.95rem;
      line-height: 1.55;
      color: var(--text-muted);
    }
  `,
})
export class Blog {
  protected readonly posts = signal<readonly BlogPostPreview[]>([]);
}

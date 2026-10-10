import { Component, signal } from '@angular/core';

interface BlogPostPreview {
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly excerpt: string;
}

@Component({
  selector: 'app-blog',
  template: `
    <section aria-labelledby="blog-heading">
      <h1 id="blog-heading">Blog</h1>
      <p class="intro">
        Articles and notes on software development, web architecture, and personal projects.
      </p>

      <div class="post-list">
        @for (post of posts(); track post.slug) {
          <article class="post-card">
            <time class="post-date" [attr.datetime]="post.date">{{ post.date }}</time>
            <h2>{{ post.title }}</h2>
            <p>{{ post.excerpt }}</p>
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

    .post-list {
      display: grid;
      gap: 1rem;
    }

    .post-card {
      background-color: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 0.75rem;
      padding: 1.5rem;
    }

    .post-date {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .post-card h2 {
      margin: 0.375rem 0 0.5rem;
      font-size: 1.25rem;
    }

    .post-card p {
      margin: 0;
      color: var(--text-muted);
    }
  `,
})
export class Blog {
  protected readonly posts = signal<readonly BlogPostPreview[]>([
    {
      slug: 'hello-dmh-dev',
      title: 'Setting up dmh.dev with Angular 22 Hybrid Rendering & Railway',
      date: '2026-10-10',
      excerpt:
        'Laying the foundation for dmh.dev: a single monorepo combining an Angular 22 hybrid SSR/prerendered site with room for standalone mini-apps on subdomains.',
    },
  ]);
}

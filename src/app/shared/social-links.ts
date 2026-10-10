import { Component } from '@angular/core';

@Component({
  selector: 'app-social-links',
  template: `
    <ul class="social-list" aria-label="Social and contact links">
      <li>
        <a
          href="https://github.com/d2kx"
          target="_blank"
          rel="noopener noreferrer"
          class="social-pill social-github"
          aria-label="GitHub profile (d2kx)"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12c0 4.64 3.01 8.57 7.18 9.96.53.1.72-.23.72-.5v-1.77c-2.92.64-3.54-1.41-3.54-1.41-.48-1.21-1.17-1.53-1.17-1.53-.95-.65.07-.64.07-.64 1.05.08 1.61 1.08 1.61 1.08.94 1.6 2.46 1.14 3.06.87.09-.68.37-1.14.67-1.4-2.33-.26-4.78-1.17-4.78-5.19 0-1.15.41-2.09 1.08-2.82-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.89 1.08a10.02 10.02 0 0 1 5.26 0c2.01-1.36 2.89-1.08 2.89-1.08.57 1.45.21 2.52.1 2.79.67.73 1.08 1.67 1.08 2.82 0 4.03-2.46 4.92-4.8 5.18.38.33.71.97.71 1.96v2.91c0 .28.19.61.73.5A10.51 10.51 0 0 0 22.5 12c0-5.8-4.7-10.5-10.5-10.5Z"
            />
          </svg>
          <span>GitHub</span>
        </a>
      </li>

      <li>
        <a
          href="https://www.linkedin.com/in/dennis-martin-herbers-085058156"
          target="_blank"
          rel="noopener noreferrer"
          class="social-pill social-linkedin"
          aria-label="LinkedIn profile (Dennis Martin Herbers)"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path
              d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"
            />
          </svg>
          <span>LinkedIn</span>
        </a>
      </li>

      <li>
        <a
          href="https://x.com/D2KX_"
          target="_blank"
          rel="noopener noreferrer"
          class="social-pill social-x"
          aria-label="X (Twitter) profile (@D2KX_)"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            />
          </svg>
          <span>X</span>
        </a>
      </li>

      <li>
        <a
          href="mailto:dennis@dmh.dev"
          class="social-pill social-email"
          aria-label="Send email to dennis@dmh.dev"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span>dennis&#64;dmh.dev</span>
        </a>
      </li>
    </ul>
  `,
  styles: `
    .social-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .social-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.425rem;
      padding: 0.325rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 500;
      text-decoration: none;
      background-color: var(--surface-card);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      transition:
        background-color 150ms ease,
        border-color 150ms ease,
        color 150ms ease,
        transform 150ms ease;
    }

    .social-pill svg {
      flex-shrink: 0;
    }

    /* GitHub brand scheme */
    .social-github svg {
      color: light-dark(#24292f, #f0f6fc);
    }

    .social-github:hover {
      background-color: light-dark(#f3f4f6, #21262d);
      border-color: light-dark(#afb8c1, #484f58);
      color: light-dark(#111318, #ffffff);
      text-decoration: none;
    }

    /* LinkedIn brand scheme */
    .social-linkedin svg {
      color: light-dark(#0a66c2, #58a6ff);
    }

    .social-linkedin:hover {
      background-color: light-dark(#eef6ff, #13253a);
      border-color: light-dark(#9ec8f5, #2a5585);
      color: light-dark(#084c91, #9ecbff);
      text-decoration: none;
    }

    /* X (Twitter) brand scheme */
    .social-x svg {
      color: light-dark(#0f1419, #e7e9ea);
    }

    .social-x:hover {
      background-color: light-dark(#f1f2f4, #1e232a);
      border-color: light-dark(#b9c0c7, #454d59);
      color: light-dark(#0f1419, #ffffff);
      text-decoration: none;
    }

    /* Email (Sakura accent) scheme */
    .social-email svg {
      color: var(--accent);
    }

    .social-email:hover {
      background-color: var(--accent-subtle);
      border-color: var(--accent-border);
      color: var(--accent-on-subtle);
      text-decoration: none;
    }
  `,
})
export class SocialLinks {}

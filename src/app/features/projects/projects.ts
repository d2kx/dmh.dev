import { Component, signal } from '@angular/core';

interface ProjectCard {
  readonly id: 'kaleidoscope' | 'dmh-dev';
  readonly name: string;
  readonly url: string;
  readonly urlLabel: string;
  readonly description: string;
  readonly tags: readonly string[];
}

@Component({
  selector: 'app-projects',
  template: `
    <section aria-labelledby="projects-heading" class="projects-page">
      <header class="projects-header">
        <p class="eyebrow">Apps &amp; Experiments</p>
        <h1 id="projects-heading">Projects</h1>
        <p class="intro">
          Interactive web apps, visual experiments, and software projects built around dmh.dev.
        </p>
      </header>

      <div class="projects-section-label" aria-hidden="true">
        <span class="section-dot"></span>
        <span class="section-title">Featured &amp; Live</span>
        <span class="section-line"></span>
      </div>

      <div class="project-grid">
        @for (project of projects(); track project.id) {
          <article class="project-card-item">
            <a
              [href]="project.url"
              target="_blank"
              rel="noopener noreferrer"
              class="project-card-link"
              [attr.aria-label]="project.name + ': ' + project.description"
            >
              <div class="logo-wrapper" aria-hidden="true">
                <div
                  class="logo-glow"
                  [class.logo-glow-prism]="project.id === 'kaleidoscope'"
                ></div>
                <div class="logo-box">
                  @if (project.id === 'kaleidoscope') {
                    <!-- Custom Sakura Kaleidoscope Octagonal Prism Logo -->
                    <svg
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="project-svg"
                    >
                      <polygon
                        points="32,3 52.5,11.5 61,32 52.5,52.5 32,61 11.5,52.5 3,32 11.5,11.5"
                        fill="#13091c"
                        stroke="#f43f85"
                        stroke-width="2.2"
                      />
                      <g opacity="0.92">
                        <polygon points="32,32 32,5 50.5,13.5" fill="#f43f85" opacity="0.88" />
                        <polygon points="32,32 50.5,13.5 59,32" fill="#8b5cf6" opacity="0.88" />
                        <polygon points="32,32 59,32 50.5,50.5" fill="#22d3ee" opacity="0.78" />
                        <polygon points="32,32 50.5,50.5 32,59" fill="#f43f85" opacity="0.88" />
                        <polygon points="32,32 32,59 13.5,50.5" fill="#8b5cf6" opacity="0.88" />
                        <polygon points="32,32 13.5,50.5 5,32" fill="#22d3ee" opacity="0.78" />
                        <polygon points="32,32 5,32 13.5,13.5" fill="#f43f85" opacity="0.88" />
                        <polygon points="32,32 13.5,13.5 32,5" fill="#8b5cf6" opacity="0.88" />
                      </g>
                      <polygon
                        points="32,11 46.8,17.2 53,32 46.8,46.8 32,53 17.2,46.8 11,32 17.2,17.2"
                        fill="#190b28"
                        fill-opacity="0.62"
                        stroke="#ffffff"
                        stroke-opacity="0.4"
                        stroke-width="1.2"
                      />
                      <g transform="translate(32 32)">
                        <path
                          d="M 0 -2 C -4.5 -8 -6.5 -15 -2.6 -18.5 L 0 -15.2 L 2.6 -18.5 C 6.5 -15 4.5 -8 0 -2 Z"
                          fill="#ffd6e7"
                        />
                        <path
                          d="M 0 -2 C -4.5 -8 -6.5 -15 -2.6 -18.5 L 0 -15.2 L 2.6 -18.5 C 6.5 -15 4.5 -8 0 -2 Z"
                          fill="#ffb3d1"
                          transform="rotate(72)"
                        />
                        <path
                          d="M 0 -2 C -4.5 -8 -6.5 -15 -2.6 -18.5 L 0 -15.2 L 2.6 -18.5 C 6.5 -15 4.5 -8 0 -2 Z"
                          fill="#ffd6e7"
                          transform="rotate(144)"
                        />
                        <path
                          d="M 0 -2 C -4.5 -8 -6.5 -15 -2.6 -18.5 L 0 -15.2 L 2.6 -18.5 C 6.5 -15 4.5 -8 0 -2 Z"
                          fill="#ffb3d1"
                          transform="rotate(216)"
                        />
                        <path
                          d="M 0 -2 C -4.5 -8 -6.5 -15 -2.6 -18.5 L 0 -15.2 L 2.6 -18.5 C 6.5 -15 4.5 -8 0 -2 Z"
                          fill="#ffd6e7"
                          transform="rotate(288)"
                        />
                      </g>
                      <circle cx="32" cy="32" r="3.2" fill="#fffbeb" />
                    </svg>
                  } @else {
                    <!-- Custom dmh.dev Sakura Blossom Logo -->
                    <svg
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      class="project-svg"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="56"
                        height="56"
                        rx="16"
                        fill="var(--accent-subtle)"
                        stroke="var(--accent-border)"
                        stroke-width="2"
                      />
                      <g transform="translate(32 32) scale(1.75)" fill="var(--accent)">
                        <path
                          d="M 0 -1.6 C -3.8 -5.5 -5.2 -10.8 -2.1 -13.4 L 0 -11.0 L 2.1 -13.4 C 5.2 -10.8 3.8 -5.5 0 -1.6 Z"
                        />
                        <path
                          d="M 0 -1.6 C -3.8 -5.5 -5.2 -10.8 -2.1 -13.4 L 0 -11.0 L 2.1 -13.4 C 5.2 -10.8 3.8 -5.5 0 -1.6 Z"
                          transform="rotate(72)"
                        />
                        <path
                          d="M 0 -1.6 C -3.8 -5.5 -5.2 -10.8 -2.1 -13.4 L 0 -11.0 L 2.1 -13.4 C 5.2 -10.8 3.8 -5.5 0 -1.6 Z"
                          transform="rotate(144)"
                        />
                        <path
                          d="M 0 -1.6 C -3.8 -5.5 -5.2 -10.8 -2.1 -13.4 L 0 -11.0 L 2.1 -13.4 C 5.2 -10.8 3.8 -5.5 0 -1.6 Z"
                          transform="rotate(216)"
                        />
                        <path
                          d="M 0 -1.6 C -3.8 -5.5 -5.2 -10.8 -2.1 -13.4 L 0 -11.0 L 2.1 -13.4 C 5.2 -10.8 3.8 -5.5 0 -1.6 Z"
                          transform="rotate(288)"
                        />
                      </g>
                      <circle cx="32" cy="32" r="3.6" fill="var(--surface-card)" />
                    </svg>
                  }
                </div>
              </div>

              <div class="card-content">
                <div class="card-title-row">
                  <h2 class="project-name">{{ project.name }}</h2>
                  <span class="project-url-badge">
                    {{ project.urlLabel }}
                    <span class="launch-arrow" aria-hidden="true">↗</span>
                  </span>
                </div>

                <p class="project-description">{{ project.description }}</p>

                <div class="project-tags" aria-label="Technologies">
                  @for (tag of project.tags; track tag) {
                    <span class="tag-pill">{{ tag }}</span>
                  }
                </div>
              </div>
            </a>
          </article>
        }
      </div>
    </section>
  `,
  styles: `
    .projects-header {
      margin-bottom: 2.25rem;
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
      max-width: 40rem;
      margin: 0;
      font-size: 1.02rem;
    }

    .projects-section-label {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 1.25rem;
    }

    .section-dot {
      width: 0.42rem;
      height: 0.42rem;
      border-radius: 50%;
      background-color: var(--accent);
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .section-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(to right, var(--accent-border), transparent);
    }

    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
      gap: 1.25rem;
    }

    .project-card-item {
      display: flex;
    }

    .project-card-link {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      width: 100%;
      padding: 1.5rem;
      border-radius: 1.15rem;
      background-color: var(--surface-card);
      border: 1px solid var(--border-subtle);
      text-decoration: none;
      color: inherit;
      transition:
        border-color 200ms ease,
        box-shadow 200ms ease,
        transform 200ms ease;
    }

    .project-card-link:hover {
      border-color: var(--accent-border);
      box-shadow: 0 12px 32px -12px rgba(184, 29, 92, 0.22);
      transform: translateY(-2px);
    }

    .logo-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .logo-glow {
      position: absolute;
      inset: -0.65rem;
      border-radius: 50%;
      background: var(--accent-subtle);
      filter: blur(16px);
      opacity: 0.65;
      pointer-events: none;
      transition: opacity 200ms ease;
    }

    .logo-glow-prism {
      background: radial-gradient(circle, rgba(244, 63, 133, 0.35), rgba(139, 92, 246, 0.25));
    }

    .project-card-link:hover .logo-glow {
      opacity: 1;
    }

    .logo-box {
      position: relative;
      width: 3.5rem;
      height: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .project-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }

    .card-title-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .project-name {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.015em;
      color: var(--text-primary);
    }

    .project-url-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      transition: color 150ms ease;
    }

    .project-card-link:hover .project-url-badge {
      color: var(--accent);
    }

    .launch-arrow {
      display: inline-block;
      transition: transform 150ms ease;
    }

    .project-card-link:hover .launch-arrow {
      transform: translate(2px, -2px);
    }

    .project-description {
      margin: 0.45rem 0 0.9rem;
      font-size: 0.92rem;
      line-height: 1.55;
      color: var(--text-muted);
    }

    .project-tags {
      margin-top: auto;
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .tag-pill {
      font-size: 0.675rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.2rem 0.58rem;
      border-radius: 999px;
      background-color: var(--accent-subtle);
      color: var(--accent-on-subtle);
      border: 1px solid var(--accent-border);
    }
  `,
})
export class Projects {
  protected readonly projects = signal<readonly ProjectCard[]>([
    {
      id: 'kaleidoscope',
      name: 'Kaleidoscope',
      url: 'https://kaleidoscope.dmh.dev',
      urlLabel: 'kaleidoscope.dmh.dev',
      description:
        'Interactive WebGL shader kaleidoscope blending psychedelic fractal symmetry with sakura cherry blossom geometry and harmonic color palettes.',
      tags: ['WebGL', 'GLSL Shader', 'Interactive'],
    },
    {
      id: 'dmh-dev',
      name: 'dmh.dev',
      url: 'https://github.com/d2kx/dmh.dev',
      urlLabel: 'github.com/d2kx/dmh.dev',
      description:
        'Personal website, blog, and monorepo platform featuring a custom Sakura-accented light and dark theme and accessible typography.',
      tags: ['TypeScript', 'Angular', 'Material 3'],
    },
  ]);
}

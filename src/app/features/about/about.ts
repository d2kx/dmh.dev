import { Component, inject, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { SocialLinks } from '../../shared/social-links';

@Component({
  selector: 'app-about',
  imports: [MatCard, MatCardContent, MatButton, SocialLinks],
  template: `
    <section aria-labelledby="about-heading" class="about-section">
      <p class="eyebrow">Profile</p>
      <h1 id="about-heading">About Me</h1>

      <mat-card appearance="outlined" class="about-card">
        <mat-card-content class="about-content">
          <p>
            I’m <strong>Dennis Martin Herbers</strong>, a software engineer based in Germany. I
            enjoy designing and building modern web applications, exploring clean user interfaces,
            and tinkering with side projects.
          </p>
          <p>
            <code>dmh.dev</code> is my personal corner of the internet, a place to share what I am
            working on, publish occasional articles, and host small interactive projects.
          </p>

          <div class="contact-box">
            <div class="contact-header">
              <div>
                <h2>Connect &amp; Get in Touch</h2>
                <p class="contact-sub">
                  Find me on GitHub, LinkedIn, or X, or reach out directly via email at
                  <a href="mailto:dennis@dmh.dev">dennis&#64;dmh.dev</a>.
                </p>
              </div>
              <button mat-stroked-button type="button" (click)="copyEmail()">
                {{ copied() ? 'Copied dennis@dmh.dev ✓' : 'Copy Email Address' }}
              </button>
            </div>
            <app-social-links />
          </div>
        </mat-card-content>
      </mat-card>
    </section>
  `,
  styles: `
    .about-section {
      max-width: 44rem;
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
      margin: 0 0 1.5rem;
    }

    .about-card {
      background-color: var(--surface-card);
      border-color: var(--border-subtle);
      border-radius: 1rem;
    }

    .about-content {
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
      padding: 1.75rem !important;
    }

    p {
      color: var(--text-muted);
      font-size: 1.05rem;
      margin: 0;
    }

    strong {
      color: var(--text-primary);
    }

    .contact-box {
      margin-top: 0.5rem;
      padding: 1.25rem;
      border-radius: 0.75rem;
      background-color: var(--surface-subtle);
      border: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contact-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .contact-box h2 {
      font-size: 1.1rem;
      margin: 0 0 0.25rem;
    }

    .contact-sub {
      font-size: 0.95rem;
    }
  `,
})
export class About {
  private readonly clipboard = inject(Clipboard);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  protected readonly copied = signal(false);

  protected copyEmail(): void {
    const ok = this.clipboard.copy('dennis@dmh.dev');
    if (ok) {
      this.copied.set(true);
      void this.liveAnnouncer.announce('Email address dennis@dmh.dev copied to clipboard', 'polite');
    }
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <section aria-labelledby="about-heading" class="about-section">
      <h1 id="about-heading">About Me</h1>
      <p>
        I’m <strong>Dennis Martin Herbers</strong>. I build software, explore modern web
        technologies, and tinker with side projects.
      </p>
      <p>
        <code>dmh.dev</code> is my personal domain and playground — designed to host information
        about my work and hobbies, a technical blog, and a growing collection of mini-apps.
      </p>
    </section>
  `,
  styles: `
    .about-section {
      max-width: 42rem;
    }

    h1 {
      font-size: 2rem;
      margin: 0 0 1rem;
    }

    p {
      color: var(--text-muted);
      font-size: 1.05rem;
      margin: 0 0 1rem;
    }

    strong {
      color: var(--text-primary);
    }
  `,
})
export class About {}

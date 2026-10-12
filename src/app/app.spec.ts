import { provideHttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render brand link, primary navigation with Projects trigger, theme toggle, and legal footer links', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('dmh');
    expect(compiled.querySelectorAll('nav[aria-label="Primary"] a').length).toBe(2);
    expect(compiled.querySelector('.projects-trigger')?.textContent).toContain('Projects');
    expect(compiled.querySelector('.theme-toggle')).toBeTruthy();
    expect(compiled.querySelectorAll('.footer-links a').length).toBe(2);
  });

  it('should open the Projects flyout menu when clicking the Projects trigger', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const trigger = compiled.querySelector<HTMLButtonElement>('.projects-trigger');
    expect(trigger).toBeTruthy();

    trigger?.click();
    fixture.detectChanges();

    const flyout = compiled.querySelector('#projects-flyout-panel');
    expect(flyout).toBeTruthy();
    expect(flyout?.querySelectorAll('.flyout-item').length).toBe(2);
  });

  it('should switch top navigation to Voynich context when navigating to /voynich', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/voynich');
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.back-home-pill')?.textContent).toContain('dmh.dev');
    expect(compiled.querySelectorAll('nav[aria-label="Voynich sections"] a').length).toBe(6);
  });

  it('should update Open Graph, Twitter Card, and canonical tags on route navigation', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const meta = TestBed.inject(Meta);
    const doc = TestBed.inject(DOCUMENT);

    await router.navigateByUrl('/blog');
    await fixture.whenStable();

    expect(meta.getTag('property="og:title"')?.content).toBe('Blog | dmh.dev');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://www.dmh.dev/blog');
    expect(meta.getTag('property="og:image"')?.content).toBe('https://www.dmh.dev/og-image.png');
    expect(meta.getTag('name="twitter:card"')?.content).toBe('summary_large_image');
    expect(doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      'https://www.dmh.dev/blog',
    );
    expect(
      doc.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')?.getAttribute('href'),
    ).toBe('/favicon.svg');

    await router.navigateByUrl('/voynich');
    await fixture.whenStable();

    expect(meta.getTag('property="og:title"')?.content).toBe('Voynich | dmh.dev');
    expect(meta.getTag('property="og:image"')?.content).toBe('https://www.dmh.dev/og-voynich.png');
    expect(meta.getTag('name="twitter:image"')?.content).toBe('https://www.dmh.dev/og-voynich.png');
    expect(
      doc.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')?.getAttribute('href'),
    ).toBe('/favicon-voynich.svg');
    expect(
      doc.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/x-icon"]')?.getAttribute('href'),
    ).toBe('/favicon-voynich.ico');

    await router.navigateByUrl('/voynich/walkthroughs');
    await fixture.whenStable();

    expect(meta.getTag('property="og:title"')?.content).toBe('Voynich Walkthroughs | dmh.dev');
    expect(meta.getTag('property="og:image"')?.content).toBe('https://www.dmh.dev/og-voynich.png');

    await router.navigateByUrl('/kaleidoscope');
    await fixture.whenStable();

    expect(meta.getTag('property="og:title"')?.content).toBe('Kaleidoscope | dmh.dev');
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://www.dmh.dev/og-kaleidoscope.png',
    );
    expect(meta.getTag('name="twitter:image"')?.content).toBe(
      'https://www.dmh.dev/og-kaleidoscope.png',
    );
    expect(
      doc.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')?.getAttribute('href'),
    ).toBe('/favicon-kaleidoscope.svg');
    expect(
      doc.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/x-icon"]')?.getAttribute('href'),
    ).toBe('/favicon-kaleidoscope.ico');
  });
});

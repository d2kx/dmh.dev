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
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render brand link, primary navigation, theme toggle, and legal footer links', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('dmh');
    expect(compiled.querySelectorAll('nav[aria-label="Primary"] a').length).toBe(2);
    expect(compiled.querySelector('.theme-toggle')).toBeTruthy();
    expect(compiled.querySelectorAll('.footer-links a').length).toBe(2);
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
    expect(meta.getTag('name="twitter:card"')?.content).toBe('summary_large_image');
    expect(doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      'https://www.dmh.dev/blog',
    );
  });
});

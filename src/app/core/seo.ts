import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface RouteSectionSeo {
  readonly title: string;
  readonly description: string;
}

export interface RouteSeoData {
  readonly description: string;
  readonly ogType?: 'website' | 'article' | 'profile';
  readonly ogImage?: string;
  readonly ogImageAlt?: string;
  readonly locale?: string;
  readonly robots?: string;
  readonly sectionSeo?: Readonly<Record<string, RouteSectionSeo>>;
}

export interface SeoUpdateOptions extends RouteSeoData {
  readonly title: string;
  readonly path: string;
}

const SITE_ORIGIN = 'https://www.dmh.dev';
const DEFAULT_TITLE = 'dmh.dev | Dennis Martin Herbers';
const DEFAULT_DESCRIPTION =
  'Personal website, software engineering projects, and technical blog of Dennis Martin Herbers (dmh.dev).';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;
const DEFAULT_OG_IMAGE_ALT = 'dmh.dev | Dennis Martin Herbers';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private initialized = false;

  init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const leaf = this.getLeafRoute(this.router.routerState.snapshot.root);
        const seoData = leaf.data['seo'] as RouteSeoData | undefined;
        const sectionParam = leaf.paramMap.get('section');
        const sectionOverride =
          sectionParam && seoData?.sectionSeo ? seoData.sectionSeo[sectionParam] : undefined;
        const baseRouteTitle =
          typeof leaf.routeConfig?.title === 'string' ? leaf.routeConfig.title : DEFAULT_TITLE;
        const resolvedTitle = sectionOverride?.title ?? baseRouteTitle;
        const resolvedDescription =
          sectionOverride?.description ?? seoData?.description ?? DEFAULT_DESCRIPTION;
        const cleanPath = event.urlAfterRedirects.split('?')[0].split('#')[0] || '/';

        if (sectionOverride?.title) {
          this.title.setTitle(resolvedTitle);
        }

        this.update({
          title: resolvedTitle,
          path: cleanPath,
          description: resolvedDescription,
          ogType: seoData?.ogType ?? 'website',
          ogImage: seoData?.ogImage,
          ogImageAlt: seoData?.ogImageAlt,
          locale: seoData?.locale ?? 'en_US',
          robots: seoData?.robots ?? 'index, follow',
        });
      });
  }

  update(options: SeoUpdateOptions): void {
    const canonicalUrl =
      options.path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${options.path}`;
    const ogImage = options.ogImage ?? DEFAULT_OG_IMAGE;
    const ogImageAlt = options.ogImageAlt ?? DEFAULT_OG_IMAGE_ALT;

    this.meta.updateTag({ name: 'description', content: options.description });
    this.meta.updateTag({ name: 'robots', content: options.robots ?? 'index, follow' });
    this.meta.updateTag({ name: 'author', content: 'Dennis Martin Herbers' });

    // Open Graph tags (used by Discord, Slack, LinkedIn, WhatsApp, iMessage, Bluesky, X, etc.)
    this.meta.updateTag({ property: 'og:title', content: options.title });
    this.meta.updateTag({ property: 'og:description', content: options.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: options.ogType ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'dmh.dev' });
    this.meta.updateTag({ property: 'og:locale', content: options.locale ?? 'en_US' });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/png' });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: ogImageAlt });

    // X / Twitter card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:creator', content: '@D2KX_' });
    this.meta.updateTag({ name: 'twitter:title', content: options.title });
    this.meta.updateTag({ name: 'twitter:description', content: options.description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });
    this.meta.updateTag({ name: 'twitter:image:alt', content: ogImageAlt });

    this.updateCanonicalLink(canonicalUrl);
  }

  private updateCanonicalLink(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private getLeafRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}

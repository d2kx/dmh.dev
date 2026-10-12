import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, Injectable, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  RouteReuseStrategy,
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';

@Injectable()
export class AppRouteReuseStrategy extends BaseRouteReuseStrategy {
  override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    if (future.routeConfig === curr.routeConfig) {
      return true;
    }
    const futureParent = future.parent?.routeConfig?.path;
    const currParent = curr.parent?.routeConfig?.path;
    return Boolean(futureParent === 'voynich' && currParent === 'voynich');
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'top' }),
    ),
    { provide: RouteReuseStrategy, useClass: AppRouteReuseStrategy },
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig): string => {
        const src = config.src;
        if (src.startsWith('/pages/')) {
          const widthParam = config.width ? `&w=${config.width}` : '';
          return `${src}?format=webp${widthParam}`;
        }
        return src;
      },
    },
    {
      provide: IMAGE_CONFIG,
      useValue: {
        breakpoints: [240, 320, 384, 480, 640, 750, 828, 960, 1080, 1200, 1600],
        disableImageSizeWarning: true,
      },
    },
    provideClientHydration(withEventReplay()),
  ],
};


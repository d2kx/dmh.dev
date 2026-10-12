import { ApplicationConfig, Injectable, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ActivatedRouteSnapshot,
  BaseRouteReuseStrategy,
  RouteReuseStrategy,
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

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
    provideClientHydration(withEventReplay()),
  ],
};

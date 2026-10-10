import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Privacy } from './privacy';
import { LegalInfoService } from '../../core/legal-info';

describe('Privacy', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Privacy],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should render German Datenschutzerklärung by default and switch to English', async () => {
    const fixture = TestBed.createComponent(Privacy);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Datenschutzerklärung');
    expect(compiled.textContent).toContain('Datenschutz auf einen Blick');

    const legalService = TestBed.inject(LegalInfoService);
    legalService.setLanguage('en');
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toContain('Privacy Policy');
    expect(compiled.textContent).toContain('Privacy at a Glance');
  });
});

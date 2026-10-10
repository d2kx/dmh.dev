import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Impressum } from './impressum';
import { LegalInfoService } from '../../core/legal-info';

describe('Impressum', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Impressum],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should render German Impressum by default and switch to English', async () => {
    const fixture = TestBed.createComponent(Impressum);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Impressum');
    expect(compiled.textContent).toContain('Angaben gemäß § 5 DDG');

    const legalService = TestBed.inject(LegalInfoService);
    legalService.setLanguage('en');
    await fixture.whenStable();
    expect(compiled.querySelector('h1')?.textContent).toContain('Legal Notice (Impressum)');
    expect(compiled.textContent).toContain('Information pursuant to Section 5 DDG');
  });
});

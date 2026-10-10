import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatDivider } from '@angular/material/divider';
import { LegalInfoService, LegalLanguage } from '../../core/legal-info';

@Component({
  selector: 'app-impressum',
  imports: [
    RouterLink,
    MatCard,
    MatCardContent,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatDivider,
  ],
  template: `
    <section
      class="legal-page"
      [attr.lang]="legal.lang()"
      aria-labelledby="impressum-heading"
    >
      <div class="legal-header">
        <div>
          <p class="eyebrow">
            {{ legal.lang() === 'de' ? 'Rechtliche Angaben' : 'Legal Disclosure' }}
          </p>
          <h1 id="impressum-heading">
            {{ legal.lang() === 'de' ? 'Impressum' : 'Legal Notice (Impressum)' }}
          </h1>
        </div>

        <mat-button-toggle-group
          [value]="legal.lang()"
          (change)="onLanguageChange($event.value)"
          aria-label="Select language / Sprache wählen"
          hideSingleSelectionIndicator
        >
          <mat-button-toggle value="de">Deutsch</mat-button-toggle>
          <mat-button-toggle value="en">English</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      @if (legal.lang() === 'de') {
        <mat-card appearance="outlined" class="legal-card">
          <mat-card-content class="legal-content">
            <h2>Angaben gemäß § 5 DDG</h2>
            <address class="contact-block">
              <strong>{{ legal.info().name }}</strong><br />
              @if (legal.info().street) {
                {{ legal.info().street }}<br />
              } @else {
                <span class="pending-note">[Straße &amp; Hausnummer – siehe Hinweis unten]</span><br />
              }
              @if (legal.info().postalCity) {
                {{ legal.info().postalCity }}<br />
              } @else {
                <span class="pending-note">[PLZ &amp; Ort – siehe Hinweis unten]</span><br />
              }
              {{ legal.info().countryDe }}
            </address>

            <mat-divider />

            <h2>Kontakt</h2>
            <p>
              <strong>E-Mail:</strong>
              <a [href]="'mailto:' + legal.info().email">{{ legal.info().email }}</a>
              @if (legal.info().phone) {
                <br />
                <strong>Telefon:</strong> {{ legal.info().phone }}
              }
            </p>

            <mat-divider />

            <h2>Redaktionell verantwortlich</h2>
            <p>
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV (Medienstaatsvertrag):<br />
              <strong>{{ legal.info().name }}</strong>
              @if (legal.info().street && legal.info().postalCity) {
                <br />{{ legal.info().street }}, {{ legal.info().postalCity }}
              } @else {
                (Anschrift wie oben)
              }
            </p>

            <mat-divider />

            <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
            <p>
              Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle im Sinne des Verbraucherstreitbeilegungsgesetzes (VSBG)
              teilzunehmen. Dieses Angebot richtet sich als persönliche Website und technischer Blog
              nicht an Verbraucher im Rahmen entgeltlicher Rechtsgeschäfte.
            </p>

            <mat-divider />

            <h2>Haftung für Inhalte und Links</h2>
            <p>
              Als Diensteanbieter bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Unberührt hiervon bleibt die
              Verpflichtung zur Entfernung oder Sperrung der Nutzung von Informationen nach den
              allgemeinen Gesetzen ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung.
            </p>
            <p>
              Diese Website enthält ggf. Links zu externen Websites Dritter, auf deren Inhalte ich
              keinen Einfluss habe. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
              Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden von
              Rechtsverletzungen werde ich derartige Links umgehend entfernen.
            </p>

            <mat-divider />

            <h2>Urheberrecht</h2>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Soweit der Quellcode einzelner Projekte unter
              einer Open-Source-Lizenz veröffentlicht wird, gelten die jeweiligen Lizenzbedingungen
              im zugehörigen Repository.
            </p>

            <p class="related-link">
              Informationen zur Verarbeitung personenbezogener Daten finden Sie in der
              <a routerLink="/privacy">Datenschutzerklärung</a>.
            </p>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined" class="legal-card">
          <mat-card-content class="legal-content">
            <h2>Information pursuant to Section 5 DDG (German Digital Services Act)</h2>
            <address class="contact-block">
              <strong>{{ legal.info().name }}</strong><br />
              @if (legal.info().street) {
                {{ legal.info().street }}<br />
              } @else {
                <span class="pending-note">[Street address – pending configuration]</span><br />
              }
              @if (legal.info().postalCity) {
                {{ legal.info().postalCity }}<br />
              } @else {
                <span class="pending-note">[Postal code &amp; city – pending configuration]</span><br />
              }
              {{ legal.info().countryEn }}
            </address>

            <mat-divider />

            <h2>Contact</h2>
            <p>
              <strong>Email:</strong>
              <a [href]="'mailto:' + legal.info().email">{{ legal.info().email }}</a>
              @if (legal.info().phone) {
                <br />
                <strong>Phone:</strong> {{ legal.info().phone }}
              }
            </p>

            <mat-divider />

            <h2>Editorial Responsibility</h2>
            <p>
              Person responsible for content in accordance with Section 18 (2) MStV (German State
              Media Treaty):<br />
              <strong>{{ legal.info().name }}</strong>
              @if (legal.info().street && legal.info().postalCity) {
                <br />{{ legal.info().street }}, {{ legal.info().postalCity }}
              } @else {
                (address as stated above)
              }
            </p>

            <mat-divider />

            <h2>Consumer Dispute Resolution</h2>
            <p>
              I am neither willing nor obliged to participate in dispute resolution proceedings
              before a consumer arbitration board within the meaning of the German Consumer Dispute
              Resolution Act (VSBG). As a personal website and technical blog, this site does not
              offer commercial goods or paid services to consumers.
            </p>

            <mat-divider />

            <h2>Liability for Content and External Links</h2>
            <p>
              As a service provider, I am responsible for my own content on these pages in
              accordance with general laws pursuant to Section 7 (1) DDG. Obligations to remove or
              block the use of information under general laws remain unaffected from the time a
              specific legal infringement becomes known.
            </p>
            <p>
              This website may contain links to external third-party websites over whose content I
              have no control. The respective provider or operator of the linked pages is always
              responsible for their content. Upon notification of legal violations, such links will
              be removed promptly.
            </p>

            <mat-divider />

            <h2>Copyright</h2>
            <p>
              The content and works created by the site operator on these pages are subject to
              German copyright law. Where source code of specific projects is published under an
              open-source license, the respective license terms in the corresponding repository
              apply.
            </p>

            <p class="related-link">
              For details on how personal data is processed, please refer to the
              <a routerLink="/privacy">Privacy Policy (Datenschutzerklärung)</a>.
            </p>
          </mat-card-content>
        </mat-card>
      }
    </section>
  `,
  styles: `
    .legal-page {
      max-width: 48rem;
    }

    .legal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.75rem;
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
      margin: 0;
      line-height: 1.2;
    }

    .legal-card {
      background-color: var(--surface-card);
      border-color: var(--border-subtle);
      border-radius: 1rem;
    }

    .legal-content {
      display: flex;
      flex-direction: column;
      gap: 1.125rem;
      padding: 1.75rem !important;
    }

    h2 {
      font-size: 1.15rem;
      margin: 0;
    }

    p,
    address {
      margin: 0;
      color: var(--text-muted);
      font-style: normal;
      line-height: 1.65;
    }

    strong {
      color: var(--text-primary);
    }

    .pending-note {
      color: var(--text-muted);
      font-size: 0.925rem;
    }

    .related-link {
      padding-top: 0.25rem;
    }
  `,
})
export class Impressum implements OnInit {
  protected readonly legal = inject(LegalInfoService);

  ngOnInit(): void {
    this.legal.ensureLoaded();
  }

  protected onLanguageChange(language: LegalLanguage): void {
    if (language === 'de' || language === 'en') {
      this.legal.setLanguage(language);
    }
  }
}

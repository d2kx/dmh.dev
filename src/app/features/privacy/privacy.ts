import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatDivider } from '@angular/material/divider';
import { LegalInfoService, LegalLanguage } from '../../core/legal-info';

@Component({
  selector: 'app-privacy',
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
      aria-labelledby="privacy-heading"
    >
      <div class="legal-header">
        <div>
          <p class="eyebrow">
            {{ legal.lang() === 'de' ? 'Datenschutz gemäß DSGVO' : 'GDPR Privacy Disclosure' }}
          </p>
          <h1 id="privacy-heading">
            {{ legal.lang() === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy' }}
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
            <h2>1. Datenschutz auf einen Blick</h2>
            <p>
              Der Schutz Ihrer persönlichen Daten ist mir wichtig. Diese Website verzichtet auf
              Tracking-Cookies, Werbenetzwerke und externe Analyse-Dienste. Personenbezogene Daten
              werden auf dieser Website nur im technisch notwendigen Umfang zur Bereitstellung der
              Seite verarbeitet.
            </p>

            <mat-divider />

            <h2>2. Verantwortlicher (Art. 4 Nr. 7 DSGVO)</h2>
            <address class="contact-block">
              <strong>{{ legal.info().name }}</strong><br />
              @if (legal.info().street) {
                {{ legal.info().street }}<br />
              }
              @if (legal.info().postalCity) {
                {{ legal.info().postalCity }}<br />
              }
              {{ legal.info().countryDe }}<br />
              <strong>E-Mail:</strong>&nbsp;<a [href]="'mailto:' + legal.info().email">{{
                legal.info().email
              }}</a>
              @if (legal.info().phone) {
                <br />
                <strong>Telefon:</strong>&nbsp;{{ legal.info().phone }}
              }
            </address>

            <mat-divider />

            <h2>3. Hosting und Server-Log-Dateien</h2>
            <p>
              Diese Website wird bei einem externen Dienstleister gehostet (Railway Corp., 548
              Market St PMB 68956, San Francisco, CA 94104, USA). Beim Aufruf dieser Website erfasst
              das System automatisch technische Informationen in sogenannten Server-Log-Dateien, die
              Ihr Browser übermittelt. Dies sind insbesondere:
            </p>
            <ul>
              <li>IP-Adresse des anfragenden Endgeräts</li>
              <li>Datum und Uhrzeit der Serveranfrage</li>
              <li>Aufgerufene Seite bzw. Datei (URL) und HTTP-Statuscode</li>
              <li>Browsertyp, Browserversion und verwendetes Betriebssystem (User-Agent)</li>
              <li>Referrer-URL (zuvor besuchte Seite, sofern übermittelt)</li>
            </ul>
            <p>
              Die Verarbeitung dieser Daten erfolgt auf Grundlage von
              <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes Interesse an der technisch
              fehlerfreien Darstellung, Stabilität und Sicherheit der Website sowie der Abwehr von
              Angriffen). Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
              vorgenommen. Soweit Daten in den USA verarbeitet werden, stützt sich die Übermittlung
              auf das EU-U.S. Data Privacy Framework (Art. 45 DSGVO) bzw.
              Standardvertragsklauseln der EU-Kommission (Art. 46 DSGVO).
            </p>

            <mat-divider />

            <h2>4. SSL- bzw. TLS-Verschlüsselung</h2>
            <p>
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung eine SSL-
              bzw. TLS-Verschlüsselung (HTTPS). Damit können Daten, die Sie an diese Website
              übermitteln, nicht von Dritten im Klartext mitgelesen werden.
            </p>

            <mat-divider />

            <h2>5. Lokal eingebundene Schriftarten (Web Fonts)</h2>
            <p>
              Zur einheitlichen und ansprechenden Darstellung verwendet diese Website die
              Open-Source-Schriftart <em>Google Sans Flex</em> (SIL Open Font License 1.1). Die
              Schriftdateien sind <strong>lokal auf dem eigenen Webserver</strong> installiert. Beim
              Aufruf der Seiten wird <strong>keine Verbindung zu Servern von Google</strong>
              (insbesondere nicht zu <code>fonts.googleapis.com</code> oder
              <code>fonts.gstatic.com</code>) hergestellt, sodass hierbei keine IP-Adressen an Dritte
              übertragen werden.
            </p>

            <mat-divider />

            <h2>6. Lokale Speicherung der Darstellungseinstellung (Local Storage)</h2>
            <p>
              Diese Website setzt keine Tracking- oder Marketing-Cookies ein. Nur wenn Sie aktiv den
              Schalter für das helle oder dunkle Farbschema (Light-/Dark-Mode) betätigen, wird Ihre
              Auswahl lokal in Ihrem Browser (<code>localStorage</code> unter dem Schlüssel
              <code>color-scheme</code>) gespeichert. Dieser Wert wird nicht an den Server
              übertragen und dient ausschließlich dazu, die von Ihnen ausdrücklich gewünschte
              Darstellung gemäß <strong>§ 25 Abs. 2 Nr. 2 TDDDG</strong> sowie
              <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> bereitzustellen.
            </p>

            <mat-divider />

            <h2>7. Kontaktaufnahme per E-Mail</h2>
            <p>
              Wenn Sie mich per E-Mail kontaktieren, werden Ihre Angaben inklusive der von Ihnen
              dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von
              Anschlussfragen verarbeitet. Rechtsgrundlage ist
              <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes Interesse an der
              Beantwortung Ihres Anliegens) bzw. <strong>Art. 6 Abs. 1 lit. b DSGVO</strong>, sofern
              Ihre Anfrage auf den Abschluss eines Vertrags abzielt. Die Daten werden gelöscht,
              sobald sie für die Erreichung des Zwecks ihrer Erhebung nicht mehr erforderlich sind
              und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>

            <mat-divider />

            <h2>8. Ihre Rechte als betroffene Person</h2>
            <p>Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf:</p>
            <ul>
              <li><strong>Auskunft</strong> über Ihre gespeicherten personenbezogenen Daten (Art. 15 DSGVO)</li>
              <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
              <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
              <li><strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
              <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
              <li><strong>Widerspruch</strong> gegen die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21 DSGVO)</li>
              <li><strong>Beschwerde</strong> bei einer zuständigen Datenschutz-Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>

            <p class="related-link">
              Weitere rechtliche Anbieterkennzeichnungen finden Sie im
              <a routerLink="/impressum">Impressum</a>.
            </p>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card appearance="outlined" class="legal-card">
          <mat-card-content class="legal-content">
            <h2>1. Privacy at a Glance</h2>
            <p>
              Protecting your personal data is important to me. This website does not use tracking
              cookies, advertising networks, or third-party analytics services. Personal data is
              processed only to the extent technically required to deliver this website securely.
            </p>

            <mat-divider />

            <h2>2. Data Controller (Art. 4 (7) GDPR)</h2>
            <address class="contact-block">
              <strong>{{ legal.info().name }}</strong><br />
              @if (legal.info().street) {
                {{ legal.info().street }}<br />
              }
              @if (legal.info().postalCity) {
                {{ legal.info().postalCity }}<br />
              }
              {{ legal.info().countryEn }}<br />
              <strong>Email:</strong>&nbsp;<a [href]="'mailto:' + legal.info().email">{{
                legal.info().email
              }}</a>
              @if (legal.info().phone) {
                <br />
                <strong>Phone:</strong>&nbsp;{{ legal.info().phone }}
              }
            </address>

            <mat-divider />

            <h2>3. Hosting and Server Log Files</h2>
            <p>
              This website is hosted by an external cloud infrastructure provider (Railway Corp.,
              548 Market St PMB 68956, San Francisco, CA 94104, USA). When you visit this website,
              the server automatically records technical access data transmitted by your browser in
              server log files, specifically:
            </p>
            <ul>
              <li>IP address of the requesting device</li>
              <li>Date and time of the server request</li>
              <li>Requested URL/resource and HTTP status code</li>
              <li>Browser type, version, and operating system (User-Agent)</li>
              <li>Referrer URL (previously visited page, if transmitted)</li>
            </ul>
            <p>
              This data is processed on the legal basis of
              <strong>Art. 6 (1) (f) GDPR</strong> (legitimate interest in the secure, stable, and
              error-free provision of the website and protection against abuse). Log data is not
              merged with other data sources. Where data is processed in the United States, transfers
              rely on the EU-U.S. Data Privacy Framework (Art. 45 GDPR) and/or EU Standard
              Contractual Clauses (Art. 46 GDPR).
            </p>

            <mat-divider />

            <h2>4. SSL / TLS Encryption</h2>
            <p>
              For security reasons and to protect the transmission of data, this website uses SSL /
              TLS encryption (HTTPS). Data transmitted between your browser and this server cannot
              be read in plain text by third parties.
            </p>

            <mat-divider />

            <h2>5. Locally Hosted Web Fonts</h2>
            <p>
              This website uses the open-source typeface <em>Google Sans Flex</em> (SIL Open Font
              License 1.1). All font files are <strong>self-hosted directly on our own server</strong>.
              Visiting this website establishes <strong>no connection to Google servers</strong>
              (such as <code>fonts.googleapis.com</code> or <code>fonts.gstatic.com</code>), ensuring
              that no visitor IP addresses are shared with third-party font providers.
            </p>

            <mat-divider />

            <h2>6. Local Storage for Theme Preference</h2>
            <p>
              This website does not set tracking or marketing cookies. Only if you actively toggle
              the light/dark color scheme switch is your preference saved locally in your browser’s
              <code>localStorage</code> (key <code>color-scheme</code>). This value is never
              transmitted to the server and is strictly necessary to provide the display setting
              explicitly requested by you pursuant to <strong>Section 25 (2) No. 2 TDDDG</strong>
              and <strong>Art. 6 (1) (f) GDPR</strong>.
            </p>

            <mat-divider />

            <h2>7. Contact via Email</h2>
            <p>
              If you contact me by email, the details you provide will be processed for the purpose
              of handling your inquiry and any follow-up questions. Processing is based on
              <strong>Art. 6 (1) (f) GDPR</strong> (legitimate interest in responding to inquiries)
              or <strong>Art. 6 (1) (b) GDPR</strong> if your inquiry relates to pre-contractual
              measures. Data is deleted once it is no longer required for the purpose for which it
              was collected, provided no statutory retention obligations apply.
            </p>

            <mat-divider />

            <h2>8. Your Rights under the GDPR</h2>
            <p>Under applicable data protection law, you have the right at any time to:</p>
            <ul>
              <li><strong>Access</strong> your personal data processed by us (Art. 15 GDPR)</li>
              <li><strong>Rectification</strong> of inaccurate personal data (Art. 16 GDPR)</li>
              <li><strong>Erasure</strong> of your personal data (Art. 17 GDPR)</li>
              <li><strong>Restriction of processing</strong> (Art. 18 GDPR)</li>
              <li><strong>Data portability</strong> (Art. 20 GDPR)</li>
              <li><strong>Object</strong> to processing based on Art. 6 (1) (f) GDPR (Art. 21 GDPR)</li>
              <li><strong>Lodge a complaint</strong> with a data protection supervisory authority (Art. 77 GDPR)</li>
            </ul>

            <p class="related-link">
              For statutory provider identification details, please see the
              <a routerLink="/impressum">Legal Notice</a>.
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
    address,
    ul {
      margin: 0;
      color: var(--text-muted);
      font-style: normal;
      line-height: 1.65;
    }

    ul {
      padding-left: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    strong {
      color: var(--text-primary);
    }

    .related-link {
      padding-top: 0.25rem;
    }
  `,
})
export class Privacy implements OnInit {
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

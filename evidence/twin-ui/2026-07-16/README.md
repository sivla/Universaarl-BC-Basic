# Project-Twin-Bildkatalog 2026-07-16

Dieser Evidence-Satz dokumentiert die sichtbare, strikt lesende Project-Twin-Darstellung des validierten Katalogreleases `UABC-CUSTOMER-001-CATALOG-20260715-V4-FINAL`. Die Bilder enthalten ausschliesslich synthetische Universaarl-Pilotdaten und wurden einzeln visuell auf Vollstaendigkeit, Lesbarkeit und unbeabsichtigte Authentifizierungs- oder Geheimnisinhalte geprueft.

## Umfang

- alle elf erreichbaren Hauptansichten: Portfolio, neun Projektbereiche und Supportstand;
- ein dunkler Desktop-Zustand;
- zwei dunkle Mobilzustaende mit 390 Pixel Breite;
- je ein repraesentativer Ticket- und Besprechungsdetailzustand.

Die Screenshots wurden mit einem realen Chromium-Browser gegen `http://127.0.0.1:4173` erzeugt. Diese Loopback-Adresse ist nur Aufnahmekontext und keine dauerhafte Laufzeitbindung. Die fachliche Quelle blieb waehrend der Aufnahme unveraendert; der Twin schrieb nicht zurueck.

## Bindung

- Kundenprojekt vor Aufnahme: `3e16b301d53b6729666a32435a2d297ae601ed90`
- Project Twin: `177a86171b835751af23fdc7c677bb2f92368844`
- Katalogrelease: `UABC-CUSTOMER-001-CATALOG-20260715-V4-FINAL`
- Browser: Chromium ueber Playwright CLI
- Dateiliste, Abmessungen und SHA-256: `manifest.json`

## Beobachteter technischer Befund

Beim wiederholten Oeffnen des Ticketdetails meldete React doppelte Listen-Keys fuer `project/bc-basic/setup-wave-1-matrix.yaml` und `project/bc-basic/setup-parameter-baseline.yaml`. Die Anzeige blieb bedienbar und alle Screens konnten aufgenommen werden; der Befund ist keine fachliche Freigabe und muss im Twin separat behoben werden.

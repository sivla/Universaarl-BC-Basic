# Lieferplan: BC Basic Kundenprojekt

## Wellen

### Phase 1 - Vorbereitung, Anforderungen und Datenbereitschaft

Circa drei Kalenderwochen ab bestaetigtem Projektauftakt, 20 Planstunden. Projektauftakt, Finanz-/Steuerarbeitsrunde, Prozessarbeitsrunde fuer Einkauf/Verkauf/Lager, Datenpaket und Loesungs-/Abnahmeplan werden abgeschlossen. Die Phase endet nur, wenn Umfang, Verantwortliche, Datenqualitaet, Zielgesellschaft und offene Freigaben sichtbar sind.

### Phase 2 - Einrichtung und Schulung in genau einer Woche

Genau fuenf aufeinanderfolgende Arbeitstage nach bestandenem Bereitschaftspruefpunkt, exakt 40 Planstunden. Reihenfolge: Ziel- und Sicherheitspruefung, Grundeinrichtung, Finanzwesen, Stammdaten, Einkauf, Verkauf, einfaches Lager, Ende-zu-Ende-Pruefung, fachlicher Abnahmetest, Schulung und kontrollierte Sandbox-Uebergabe. Offene Anforderungsklaerung wird nicht still in diese Woche verschoben.

### Phase 3 - Begrenzte Stabilisierungsphase bis Abschlussprobe und UStVA-Pruefung

Circa zwei Kalenderwochen bis zur ersten Monatsabschlussprobe, 16 Planstunden. Pilotbefunde werden priorisiert, der Monatsabschlussprozess wird in der Sandbox geprobt und abgestimmt, die UStVA-Vorschau samt lokalem XML ohne Test- oder Produktivuebermittlung wird fachlich geprueft, und beide Handbuecher sowie die Projektdokumentation werden uebergeben. Danach endet die Stabilisierungsphase; offene Erweiterungswuensche gehoeren in ein eigenes Folgepaket.

Alle Kalenderdaten in Jira und strukturiertem Plan sind ausschliesslich eine synthetische Terminachse fuer die Simulation (`scheduleSynthetic: true`, `customerConfirmed: false`). Sie sind keine Kundenzusage und werden nach einem echten Projektauftakt neu bestaetigt.

## Abhaengigkeiten

Projektauftakt -> Facharbeitsrunden -> Datenbereitschaft -> Loesungs- und Abnahmefreigabe -> Sandbox-Schreibfreigabe -> Grundeinrichtung -> Finanzwesen und Stammdaten -> Einkauf/Verkauf/Lager -> Ende-zu-Ende-Pruefung und fachlicher Abnahmetest -> Sandbox-Pilot -> begrenzte Stabilisierungsphase -> Monatsabschlussprobe -> lokale UStVA-Pruefung -> Uebergabe.

Keine spaetere Aktivitaet darf eine fehlende menschliche Freigabe als technische Annahme ersetzen. Fehlende Daten oder Steuerentscheidungen blockieren den abhaengigen Pfad.

## Verantwortungen

- Beratung und Projektleitung: P-002 als synthetische Ausfuehrungsrolle fuer Plan, Konfiguration, Nachweise und Uebergabe.
- Finanz-Schluesselanwender: P-005 fuer Konten, Buchungsgruppen, Abstimmung und Monatsabschlussprobe.
- Datenverantwortung: P-016 fuer Format, Vollstaendigkeit und Freigabe der synthetischen Daten.
- Einkauf/Verkauf-Schluesselanwender: P-011 fuer P2P- und O2C-Abnahme.
- Lager-Schluesselanwender: P-019 fuer Artikel, Bestand und einfachen Lagerprozess.
- Sponsorrolle: P-001 fuer Umfang, Budgetreserve, Sandbox-Pilot, dokumentierte Produktionsbereitschaft und Abschluss der Stabilisierungsphase; synthetische Rollen sind keine echte Freigabe.

## Nachweise

- Pruefung der Projektablage und OpenSpec: `UABC-VER-BCB-LOCAL-001`.
- Datenbereitschaft und Umfangspruefpunkt: `UABC-VER-BCB-READINESS-001`.
- Konfiguration und E2E-Playwright-Katalog: `UABC-VER-BCB-E2E-001`.
- Rollenbezogene Schulung und fachlicher Abnahmetest: `UABC-VER-BCB-TRAINING-001`.
- Monatsabschlussprozess in der Sandbox geprobt und Abstimmungen dokumentiert: `UABC-VER-BCB-CLOSE-001`.
- UStVA-Vorschau/XML und Steuerfreigabe, ohne Uebermittlung: `UABC-VER-BCB-VAT-001`.
- Handbuecher, Confluence und Uebergabe: `UABC-VER-BCB-HANDOVER-001`.
- Automatisierter Archivpruefpunkt der Projektablage: `UABC-VER-BCB-POLICY-GATE-001`; er ersetzt keine fachliche Freigabe.

Alle IDs sind geplant. In diesem Auftragsschritt wurde kein Nachweis ausgefuehrt.

## Pruefpunkte

1. **Umfangspruefpunkt:** Standardumfang, eine Gesellschaft, Budget und Nicht-Ziele menschlich bestaetigt.
2. **Datenpruefpunkt:** Pflichtfelder, Formate, Eigentuemer, Qualitaetsprotokoll und Freigabe liegen vor.
3. **Schreibpruefpunkt:** Exakte `playthru`-Zielbindung, Ruecksetzplan und mutierender Testumfang sind projektspezifisch autorisiert.
4. **Finanz-/Steuerpruefpunkt:** Konten, Buchungsgruppen, MwSt.-Matrix und UStVA-Zuordnung fachlich freigegeben.
5. **Sandbox-Uebergang/Stopp:** Fachlicher Abnahmetest, Trainingsanwesenheit, offene Fehler, Abstimmung und Unterstuetzungsbereitschaft fuer die Simulation sind akzeptiert; ein Produktivstart ist ausgeschlossen.
6. **Abschluss der Stabilisierungsphase:** Abschlussprobe und lokale UStVA-Pruefung bestanden, kritische Pilotbefunde geschlossen, Dokumentation uebergeben und offener Folgeumfang getrennt.

## Abschlusskriterien

Das Projekt ist nur abgeschlossen, wenn alle Jira-Akzeptanzkriterien erfuellt, alle erforderlichen Lieferergebnisse vorhanden, jedes Ticket mit mindestens einem realen oder klar simulierten Transkript verknuepft, 80 Stunden nicht ueberschritten, alle benoetigten Fachfreigaben dokumentiert, Ende-zu-Ende-Szenarien mit referenzierbarem Nachweis ausgefuehrt, Schulungen protokolliert, Monatsabschlussprozess in der Sandbox geprobt, Abstimmungen dokumentiert und UStVA-Vorschau samt lokalem XML fachlich geprueft sowie Kunden- und Beratungshandbuch und Confluence-Struktur uebergeben sind. Eine Test- oder Produktivuebermittlung und ein Produktivstart sind ausdruecklich keine Abschlusskriterien.

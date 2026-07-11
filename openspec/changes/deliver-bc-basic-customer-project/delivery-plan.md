# Lieferplan: BC Basic Einrichtung

## Wellen

### Phase 1 - Vorbereitung, Anforderungen und Datenbereitschaft

Circa drei Kalenderwochen ab bestaetigtem Projektauftakt, 18 Planstunden. Projektauftakt, Finanz-/Steuerarbeitsrunde, Prozessarbeitsrunde fuer Einkauf/Verkauf/einfachen Bestand, acht getrennte Blanko-/Beispielpaare, maschinenlesbarer Datenbereitschaftscheck, Konfigurationspaketplan sowie Loesungs-/Abnahmeplan mit genau sieben geplanten UAT-Pflichtfaellen werden abgeschlossen. Die Phase endet nur, wenn Umfang, Verantwortliche, Datenqualitaet, Zielgesellschaft, Kundenmitwirkung und offene Freigaben sichtbar sind.

### Phase 2 - Einrichtung und Schulung in genau einer Woche

Genau fuenf aufeinanderfolgende Arbeitstage nach bestandenem Bereitschaftspruefpunkt, exakt 40 Planstunden. Reihenfolge: Ziel- und Sicherheitspruefung, Konfigurationspakete vorbereiten, Grundeinrichtung, Finanzwesen, Stammdaten, Einkauf, Verkauf, einfacher Bestand, Ende-zu-Ende-Pflichtfaelle, fachlicher Abnahmetest, UAT-Begleitung und Schulung. Offene Anforderungsklaerung wird nicht still in diese Woche verschoben.

### Phase 3 - Einwoechige Hypercare, Abschlussprobe und UStVA-Vorschau

Eine Kalenderwoche nach der Einrichtungswoche, hoechstens 10 Planstunden. UAT- und Hypercare-Befunde werden priorisiert, der Monatsabschlussprozess wird in der Sandbox geprobt und abgestimmt, die UStVA-Vorschau ohne Uebermittlung wird fachlich geprueft, und Projektdokumentation sowie Schulungsunterlagen werden uebergeben. Danach endet P001; weitere Taetigkeiten sind Support oder ein eigenes modulares Folgeprojekt.

Alle Kalenderdaten in Jira und strukturiertem Plan sind ausschliesslich eine synthetische Terminachse fuer die Simulation (`scheduleSynthetic: true`, `customerConfirmed: false`). Sie sind keine Kundenzusage und werden nach einem echten Projektauftakt neu bestaetigt.

## Abhaengigkeiten

Projektauftakt -> Facharbeitsrunden -> Daten- und Konfigurationspaketbereitschaft -> Loesungs- und Abnahmefreigabe -> Sandbox-Schreibfreigabe -> Grundeinrichtung -> Finanzwesen und Stammdaten -> Einkauf/Verkauf/einfacher Bestand -> Ende-zu-Ende-Pflichtfaelle und fachlicher Abnahmetest -> UAT-Begleitung -> einwoechige Hypercare -> Monatsabschlussprobe -> UStVA-Vorschau -> Uebergabe.

Keine spaetere Aktivitaet darf eine fehlende menschliche Freigabe als technische Annahme ersetzen. Fehlende Daten oder Steuerentscheidungen blockieren den abhaengigen Pfad.

## Verantwortungen

- Dienstleister: P-002 als synthetische One-Man-Show fuer Projektleitung, Solution Architecture, Beratung, Einrichtung, Test, Training, Dokumentation und abrechenbare Arbeit.
- Finanz-Schluesselanwender: P-005 als Kundenrolle fuer Konten, Buchungsgruppen, Abstimmung, Monatsabschlussprobe und UStVA-Vorschau.
- Datenverantwortung: P-016 als Kundenrolle fuer Vollstaendigkeit und fachliche Freigabe der synthetischen Daten.
- Einkauf/Verkauf-Schluesselanwender: P-011 als Kundenrolle fuer P2P- und O2C-Abnahme.
- Lager-Schluesselanwender: P-019 als Kundenrolle fuer Artikel, Bestand und einfachen Lagerprozess.
- Sponsorrolle: P-001 fuer Umfang, Budgetentscheidung, UAT-Ergebnis, Abnahme und Abschluss der Hypercare; synthetische Rollen sind keine echte Freigabe.

## Nachweise

- Pruefung der Projektablage und OpenSpec: `UABC-VER-BCB-LOCAL-001`.
- Datenbereitschaft und Umfangspruefpunkt: `UABC-VER-BCB-READINESS-001`.
- Konfiguration und E2E-Playwright-Katalog: `UABC-VER-BCB-E2E-001`.
- Rollenbezogene Schulung und fachlicher Abnahmetest: `UABC-VER-BCB-TRAINING-001`.
- Monatsabschlussprozess in der Sandbox geprobt und Abstimmungen dokumentiert: `UABC-VER-BCB-CLOSE-001`.
- UStVA-Vorschau und Steuerfreigabe, ohne Uebermittlung: `UABC-VER-BCB-VAT-001`.
- Handbuecher, Confluence und Uebergabe: `UABC-VER-BCB-HANDOVER-001`.
- Automatisierter Archivpruefpunkt der Projektablage: `UABC-VER-BCB-POLICY-GATE-001`; er ersetzt keine fachliche Freigabe.

Alle IDs sind geplant. In diesem Auftragsschritt wurde kein Nachweis ausgefuehrt.

## Pruefpunkte

1. **Umfangspruefpunkt:** Standardumfang, eine Gesellschaft, genau ein Lagerort, Tagessatz, Planstunden, Kundenmitwirkung und Nicht-Ziele menschlich bestaetigt; ein Budgetlimit bleibt offen, falls es nicht entschieden wird.
2. **Datenpruefpunkt:** Acht getrennte Blanko-/Beispielpaare sind parsebar, Pflichtfelder, Referenzen und Summen sind geprueft, und der Datenbereitschaftscheck zeigt Eigentuemer, offene Freigaben und Blocker.
3. **Schreibpruefpunkt:** Exakte `playthru`-Zielbindung, Ruecksetzplan und mutierender Testumfang sind projektspezifisch autorisiert.
4. **Finanz-/Steuerpruefpunkt:** Konten, Buchungsgruppen, MwSt.-Matrix und UStVA-Zuordnung fachlich freigegeben.
5. **UAT-/Abnahmestopp:** Genau sieben vorbereitete UAT-Pflichtfaelle, fachlicher Abnahmetest, Trainingsanwesenheit, offene Fehler, Abstimmung und Unterstuetzungsweg fuer die Simulation sind akzeptiert; ein Produktivstart ist ausgeschlossen.
6. **Abschluss der Hypercare:** Abschlussprobe und UStVA-Vorschau dokumentiert, relevante UAT-/Hypercare-Befunde bearbeitet, Dokumentation uebergeben und offener Folgeumfang getrennt.

## Abschlusskriterien

Das Projekt ist nur abgeschlossen, wenn alle Jira-Akzeptanzkriterien erfuellt, alle erforderlichen Lieferergebnisse vorhanden, jedes Ticket mit mindestens einem realen oder klar simulierten Transkript verknuepft, alle benoetigten Fachfreigaben dokumentiert, Ende-zu-Ende-Pflichtszenarien mit referenzierbarem Nachweis ausgefuehrt, Schulungen protokolliert, vorbereitete UAT-Faelle ausgefuehrt oder nachvollziehbar blockiert, UAT-Ergebnisse geprueft, relevante Fehler bearbeitet, Monatsabschlussprozess in der Sandbox geprobt, Abstimmungen dokumentiert, UStVA-Vorschau fachlich geprueft, Projektdokumentation und Schulungsunterlagen uebergeben und die einwoechige Hypercare mit hoechstens 10 Stunden beendet sind. Eine Test- oder Produktivuebermittlung und ein Produktivstart sind ausdruecklich keine Abschlusskriterien.

# Angebot UABC-BCB-001 – BC Basic Fast-Track

## Aktuelle Produktbaseline

Das aktuelle Standardangebot ist **Version 2.0: 80 Stunden zu 120 EUR, insgesamt 9.600 EUR netto**. Es führt eine Gesellschaft mit einem einfachen Lagerort in einem standardnahen Fast-Track von der Vorbereitung bis durch Hypercare. Die repositorybasierte Referenzsimulation ist vollständig abgeschlossen; bei einem echten Kunden werden dieselben Schritte in dessen freigegebener BC-Sandbox ausgeführt und belegt.

Die frühere Kalkulation mit 68 Stunden zu 162,50 EUR und 11.050 EUR netto ist ausschließlich eine historische Planungsbaseline. Sie wurde vor dem vollständigen UAT-, Cutover-, Hypercare- und Handoverumfang erstellt und ist **kein parallel wählbares Angebot**. Version 2.0 ersetzt sie kommerziell; Angebot und synthetischer Ist-Abschluss stimmen mit 80 Stunden und 9.600 EUR überein.

## Kundennutzen und Leistungsumfang

Geliefert wird ein wiederholbares BC-Basic-Einführungspaket für eine Gesellschaft und einen Lagerort:

- Projektstart, drei Fit-to-Standard-Workshops und verbindliches Solution Design;
- Finance-Grundeinrichtung, Konten-/Buchungsmatrix, VAT, Dimensionen und Perioden;
- Einkauf, Verkauf, Zahlung/Ausgleich, eine einfache Mahnstufe und Bankabstimmung;
- einfache Artikel- und Lagerführung ohne Lagerplätze, Chargen oder Seriennummern;
- acht Datenvorlagen, drei Migrationswellen, Probeladung und Abstimmung;
- sieben UAT-Pflichtfälle, rollenbezogene Schulung und Befähigungsnachweis;
- Mock-Cutover, Go-live-Begleitung, eine Woche Hypercare und Supportübergabe.

Standard vor Sonderlösung: Eine Abweichung wird nur übernommen, wenn der Geschäftsnutzen die zusätzliche Umsetzung, Prüfung und Betriebsverantwortung rechtfertigt.

## Nichtleistungen und Grenzen

Nicht enthalten sind Produktion, Service, Projekte, Anlagenbuchhaltung, Intercompany, Konsolidierung, erweitertes Lager, Erweiterungsentwicklung, Dataverse, E-Rechnung, produktive Bankanbindung, Zahlungsdateiübertragung, E-Mail-Versand, ELSTER-Übermittlung, Steuer- oder Rechtsberatung sowie ein historischer Vollimport gebuchter Bewegungen. Kundenspezifische Reports, Dokumentlayouts und Integrationen benötigen einen Change.

## Rollen und minimale Mitwirkung

- `P-001` ist die synthetische Sponsor-/Entscheiderrolle und bestätigt Scope, UAT, Cutover und Abschluss.
- `P-002` ist Projektleitung und Solution-Verantwortung; diese Rolle moderiert, konfiguriert und steuert.
- `P-005` verantwortet Finance, VAT, Bank und Monatsabschluss.
- `P-011` verantwortet Einkauf, Verkauf, Forderungen und Verbindlichkeiten.
- `P-016` koordiniert Datenlieferung und Datenqualität.
- `P-019` verantwortet Artikel, Lager und Inventur.

Der Kunde stellt diese Rollen oder benannte Vertretungen, liefert die acht kontrollierten Datenvorlagen, entscheidet die sieben Bereiche aus `UABC-BCBDISCOVERY`, stellt eine rücksetzbare Sandbox bereit und nimmt an drei Workshops, UAT, Schulung und Cutover-GO teil.

## Kürzester realistischer Einführungsweg

**Angebot → Kundenvorbereitung → 3 Workshops → Setup/Migration → UAT → Mock-Cutover → Go-live/Hypercare**

| Schritt | Kundenbeitrag | Ergebnis |
|---|---|---|
| Angebot und Start | Sponsor, Rollen und Termine benennen | Produktbaseline und Projektkalender bestätigt |
| Kundenvorbereitung | Unternehmenssteckbrief, Finanz-/Steuervorgaben, Partner-/Artikelbeispiele, Salden und Rollen liefern | Workshop- und Datenpaket vollständig |
| Drei Workshops | Entscheidungen treffen und offene Abweichungen priorisieren | Scope, Solution Design und Entry-Gate |
| Setup/Migration | Ergebnisse prüfen, Datenkorrekturen freigeben | abgestimmte Konfiguration und Probeladung |
| UAT/Schulung | sieben Pflichtfälle und Rollenübungen durchführen | fachlicher Sign-off und Befähigung |
| Mock-Cutover | Freeze, Abschlusskontrollen, Rollback und Wiederanlauf entscheiden | Cutover-GO |
| Go-live/Hypercare | Tagesstatus und Defects priorisieren | stabiler Betrieb und Supportübergabe |

## Stunden und Preis

| Phase | Stunden | Kosten netto | Kundenergebnis |
|---|---:|---:|---|
| Auftrag und Scope | 6 | 720 EUR | Rollen, Termine und Produktgrenze |
| Discovery und Daten | 18 | 2.160 EUR | Entscheidungen, Solution Design und Datenbereitschaft |
| Setup und Prozesse | 28 | 3.360 EUR | Konfiguration, Migration und E2E-Kontrollen |
| UAT, Training und Cutover | 16 | 1.920 EUR | Sign-off, Befähigung und Cutover-GO |
| Hypercare und Handover | 12 | 1.440 EUR | Stabilisierung und Supportübergabe |
| **Gesamt** | **80** | **9.600 EUR** | **vollständiges BC-Basic-Paket** |

Änderungen werden als Ticket mit Scope-, Kosten- und Abnahmewirkung bewertet. Es gibt keine echte Unterschrift, Rechnung, Zahlung oder Produktivleistung in der Referenzsimulation.

## Versionen und Nachweisgrenze

- **Baseline 1.0, 20.08.2026:** synthetisches Projekt von Discovery bis Hypercare.
- **Fortschreibung 1.1, 21.08.2026:** Playthrough, Restart und vollständige Hypercare ergänzt.
- **Standardangebot 2.0, 03.09.2026:** 80 Stunden/9.600 EUR, Angebot und synthetischer Ist-Abschluss abgeglichen.

Referenzen: `evidence/simulation/project-story.json`, `evidence/simulation/project-reconciliation.json`. Spectra- und Twin-Provenienz sind technische Integritätsnachweise und keine zusätzliche Kundenleistung.

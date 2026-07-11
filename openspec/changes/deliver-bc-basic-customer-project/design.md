# Loesungsdesign: BC Basic Einrichtung

## Faktenbasis

- Die kanonische Baseline weist `playthru` und die sichtbare Gesellschaft `Universaarl GmbH` nur lesend nach; sie erteilt keine Schreibfreigabe.
- Die Projektablage besitzt OpenSpec-, Jira-, Confluence-, Playwright- und Nachweisstrukturen, aber noch keine ausgefuehrte BC-Basic-Einrichtung.
- **BC Basic Einrichtung** ist ein internes Standardprodukt. Die tatsaechliche Microsoft-Lizenz- und Tenantentscheidung bleibt menschlich freizugeben und kostenextern.
- Microsoft beschreibt Standardpfade fuer Grundeinrichtung, Finanzwesen, Verkauf/Einkauf, einfaches Lager, Konfigurationspakete, Periodenabschluss und deutsche UStVA-Funktionalitaet. Die konkrete Verfuegbarkeit wird erst im Zielzustand geprueft; aus der Planung wird keine Feature-Verfuegbarkeit abgeleitet.

## Annahmen

- Die synthetische Zielgesellschaft ist nach expliziter Freigabe genau `Universaarl GmbH` in `playthru`; ein stiller Wechsel auf eine zweite Gesellschaft ist unzulaessig.
- Der Umfang soll mit Standardfunktion ohne Premium-spezifische Bereiche wie Produktion oder Service auskommen. Ergibt die Lizenzpruefung etwas anderes, wird der Umfang gestoppt und neu entschieden.
- Die Kundenseite liefert Entscheidungen, Daten und Abnahmen; sie wird nicht als eigener Projektaufwand simuliert. Der Dienstleister arbeitet als One-Man-Show ueber Planung, Beratung, Einrichtung, Test, Schulung und Dokumentation.
- Der entschiedene Tagessatz betraegt 1.300 EUR netto bei 8 Stunden pro Tag; der rechnerische Stundensatz betraegt 162,50 EUR netto. Ein verbindliches Budgetlimit ist offen und wird nicht erfunden.

## Architektur

### Eine Quelle, zwei Sichten

OpenSpec fuehrt Anforderungen und Pruefpunkte. Jira fuehrt Arbeit, Aufwand und abrechenbare Istzeit. Confluence fuehrt erklaerenden Projektkontext, Besprechungen und Entscheidungen. Strukturierte Projektartefakte fuehren Plan, Datenpaket, Schulung und Abrechnung. `exports/project-data/v1/index.yaml` enthaelt nur stabile IDs, relative Pfade und verbindliche Selektoren fuer gemeinsam genutzte Quellen. Der Projekt-Twin liest ausschliesslich diesen Index, folgt keinen nicht positivgelisteten Verweisen und bleibt ohne eigene Projektdaten oder Schreibfunktion.

### Liefermodell

Die folgenden Zeitfenster sind relative Planannahmen und keine Kundenzusage. Kalenderdaten in Jira dienen nur der technisch erforderlichen, als `scheduleSynthetic: true` markierten Simulation.

| Phase | Relatives Zeitfenster | Planstunden | Ergebnis |
| --- | --- | ---: | --- |
| `UABC-PHASE-01` | circa drei Kalenderwochen ab bestaetigtem Projektauftakt | 18 | Umfang, Anforderungen, Entscheidungen, Daten und Abnahmeplan sind bereit |
| `UABC-PHASE-02` | genau fuenf aufeinanderfolgende Arbeitstage nach Bereitschaftspruefpunkt | 40 | Standardkonfiguration, Daten, Schulung, fachlicher Abnahmetest und Sandbox-Uebergang sind abgeschlossen |
| `UABC-PHASE-03` | eine Kalenderwoche nach Einrichtung | 10 | Hypercare, Monatsabschlussprobe, UStVA-Vorschau und Uebergabe sind abgeschlossen |

Die 68 Planstunden sind eine Kalkulationsbasis. Es gibt keine Reserve, keine harte Budgetgrenze und keine vorab erfundene Budgetobergrenze; abgerechnet wird nur genehmigte, tatsaechlich geleistete Dienstleisterzeit.

### Fachlicher Zuschnitt

- **Grundeinrichtung:** Unternehmensdaten, Sprache/Region, Arbeitsdatumkonzept, SKR04, Nummernserien, Buchungsperioden und minimale Berechtigungsrollen.
- **Finanzwesen:** Sachkonten, Buchungsmatrix, Debitoren-/Kreditoren-/Bestandsbuchungsgruppen, MwSt.-Buchungsgruppen, Zahlungsbedingungen, Bankkonten als Stammdaten, Bankersatz-/Journalkonzept, zwei Dimensionen und Basisberichte.
- **Konfigurationspakete:** bevorzugter Einrichtungs- und Importweg fuer Setupdaten, Stammdaten und kontrollierte offene Posten; gebuchte Daten werden nicht historisch voll importiert. Manuelle BC-Schritte bleiben dokumentierte Ausnahmen.
- **Einkauf:** Lieferant, Bestellung, Wareneingang, Eingangsrechnung und begrenzter Zahlungsvorbereitungstest.
- **Verkauf:** Kunde, Angebot oder Auftrag, Lieferung, Verkaufsrechnung und begrenzter Zahlungseingangstest.
- **Einfacher Bestand:** ein Lagerort, keine verpflichtenden Lagerplaetze, Artikelanlage, Einheit, Zugang, Bestand und einfache Inventur.

### Nachweis- und Ruecksetzmodell

Jedes spaetere Playwright-Szenario bindet Umgebung, Gesellschaft, Rolle, Arbeitsdatum, synthetische Datensatz-IDs, Jira-Key, Anforderungs-/Szenario-ID und geplante Nachweis-ID. Mutierende Schritte benoetigen eine separate menschliche Schreibfreigabe. Szenarien werden in einer definierten Reihenfolge ausgefuehrt; ein dokumentierter Ruecksetzpunkt verhindert, dass ein Wiederholungslauf bereits gebuchte Belege als neuen Erfolg wertet.

## Entscheidungen

- `UABC-DEC-BCB-001`: Genau eine synthetische Gesellschaft und ein Lagerort.
- `UABC-DEC-BCB-002`: Standard vor Anpassung; keine Erweiterungen oder Integrationen.
- `UABC-DEC-BCB-003`: Drei Phasen mit genau fuenf aufeinanderfolgenden Arbeitstagen fuer die Umsetzung; konkrete Kundentermine sind offen.
- `UABC-DEC-BCB-004`: 68 Planstunden als Kalkulationsbasis; kein verbindliches Budgetlimit ist entschieden.
- `UABC-DEC-BCB-005`: Woechentliche Rechnung nur aus freigegebenen, abrechenbaren Jira-Istzeiten auf unterster Ticketebene zu 162,50 EUR netto pro Stunde; Schaetzungen und Elternsummen sind nicht abrechenbar.
- `UABC-DEC-BCB-006`: UStVA nur als Vorschau ohne Uebermittlung; Steuerfreigabe ist extern.
- `UABC-DEC-BCB-007`: Der Twin ist ein rein lesender Renderer des versionierten Blueprint-Projektindex.

## Alternativen

- Mehrere Gesellschaften: verworfen, weil sie das wiederverwendbare Grundpaket unnoetig vergroessern.
- Breite Vorabkonfiguration ohne Datenbereitschaft: verworfen, weil sie Nacharbeit in die Umsetzungswoche verschiebt.
- Rechnung nach Schaetzung: verworfen; nur genehmigte Istzeit ist abrechenbar.
- UStVA-Test- oder Produktivuebermittlung: ausgeschlossen, weil Simulation keine steuerliche Mandatierung ersetzt; ELSTER-Zugangsdaten werden nicht verwendet.
- Schulung zur Erstellung von Konfigurationspaketen: ausgeschlossen, weil die Pakete in P001 ein Dienstleisterwerkzeug und kein Kundenlernziel sind.
- Twin mit eigener Datenbank: ausgeschlossen, weil dies eine zweite Wahrheit erzeugt.

## Offene Punkte

1. Echte Bestaetigung, dass `Universaarl GmbH` die einzig erlaubte Schreibzielgesellschaft ist und zurueckgesetzt werden darf.
2. Menschliche Lizenzentscheidung Essentials/Premium einschliesslich externer Kosten.
3. Steuerberaterfreigabe fuer Konten, MwSt.-Buchungsmatrix, UStVA-Kennzeichen und UStVA-Vorschau.
4. Benannte reale Abnehmer fuer Daten, fachlichen Abnahmetest, UAT, Monatsabschlussprobe, UStVA-Vorschau, Uebergabe und Abschluss der einwoechigen Hypercare.
5. Projektspezifische Autorisierung eines spaeteren mutierenden Playwright-Laufs.
6. Menschliche Entscheidung, ob es ein Budgetlimit gibt; bis dahin bleiben Budgetobergrenzen `unknown`.

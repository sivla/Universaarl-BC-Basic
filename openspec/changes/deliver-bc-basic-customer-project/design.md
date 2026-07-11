# Loesungsdesign: BC Basic Kundenprojekt

## Faktenbasis

- Die kanonische Baseline weist `playthru` und die sichtbare Gesellschaft `Universaarl GmbH` nur lesend nach; sie erteilt keine Schreibfreigabe.
- Die Projektablage besitzt OpenSpec-, Jira-, Confluence-, Playwright- und Nachweisstrukturen, aber noch keine aktive BC-Basic-Lieferaenderung.
- **BC Basic** ist ein internes Standardpaket. Die tatsaechliche Microsoft-Lizenz- und Tenantentscheidung bleibt menschlich freizugeben und budgetextern.
- Microsoft beschreibt Standardpfade fuer Grundeinrichtung, Finanzwesen, Verkauf/Einkauf, einfaches Lager, Konfigurationspakete, Periodenabschluss und deutsche UStVA-Funktionalitaet. Die konkrete Verfuegbarkeit wird erst im Zielzustand geprueft.

## Annahmen

- Die synthetische Zielgesellschaft ist nach expliziter Freigabe genau `Universaarl GmbH` in `playthru`; ein stiller Wechsel auf eine zweite Gesellschaft ist unzulaessig.
- Der Umfang benoetigt keine Premium-Funktion. Ergibt die Lizenzpruefung etwas anderes, wird der Umfang gestoppt und neu entschieden.
- Kunde und Beratung liefern Entscheidungen und Daten in Phase 1 so weit, dass die Einrichtungswoche nicht fuer nachtraegliche Anforderungsklaerung verbraucht wird.
- 120 EUR netto pro genehmigter Ist-Stunde ist die Planannahme; externe Kosten werden separat behandelt.

## Architektur

### Eine Quelle, zwei Sichten

OpenSpec fuehrt Anforderungen und Pruefpunkte. Jira fuehrt Arbeit, Aufwand und abrechenbare Istzeit. Confluence fuehrt erklaerenden Projektkontext, Besprechungen und Entscheidungen. Strukturierte Projektartefakte fuehren Plan, Datenpaket, Schulung und Abrechnung. `exports/project-data/v1/index.yaml` enthaelt nur stabile IDs, relative Pfade und verbindliche Selektoren fuer gemeinsam genutzte Quellen. Der Projekt-Twin liest ausschliesslich diesen Index, folgt keinen nicht positivgelisteten Verweisen und bleibt ohne eigene Projektdaten oder Schreibfunktion.

### Liefermodell

Die folgenden Zeitfenster sind relative Planannahmen und keine Kundenzusage. Kalenderdaten in Jira dienen nur der technisch erforderlichen, als `scheduleSynthetic: true` markierten Simulation.

| Phase | Relatives Zeitfenster | Planstunden | Ergebnis |
| --- | --- | ---: | --- |
| `UABC-PHASE-01` | circa drei Kalenderwochen ab bestaetigtem Projektauftakt | 20 | Umfang, Anforderungen, Entscheidungen, Daten und Abnahmeplan sind bereit |
| `UABC-PHASE-02` | genau fuenf aufeinanderfolgende Arbeitstage nach Bereitschaftspruefpunkt | 40 | Standardkonfiguration, Daten, Schulung, fachlicher Abnahmetest und Sandbox-Uebergang sind abgeschlossen |
| `UABC-PHASE-03` | circa zwei Kalenderwochen bis zur ersten Abschlussprobe | 16 | Begrenzte Stabilisierungsphase, Monatsabschlussprobe, lokale UStVA-Pruefung und Uebergabe sind abgeschlossen |

Die 4-Stunden-Reserve ist weder Ticket noch vorab abrechenbar. Aktivierung erfordert einen dokumentierten Risikofall, Sponsorfreigabe und unveraenderten Maximalaufwand von 80 Stunden.

### Fachlicher Zuschnitt

- **Grundeinrichtung:** Unternehmensdaten, Sprache/Region, Arbeitsdatumkonzept, Nummernserien, Buchungsperioden und minimale Berechtigungsrollen.
- **Finanzwesen:** Sachkonten, Buchungsmatrix, Debitoren-/Kreditoren-/Bestandsbuchungsgruppen, MwSt.-Buchungsgruppen, Zahlungsbedingungen, Bank-/Journalkonzept, zwei Dimensionen und Basisberichte.
- **Einkauf:** Lieferant, Anfrage ausserhalb des Pflichtumfangs, Bestellung, Wareneingang, Rechnung, Gutschrift und Zahlungsvorbereitung.
- **Verkauf:** Kunde, Angebot optional, Auftrag, Lieferung, Rechnung, Gutschrift und Zahlungseingang.
- **Einfaches Lager:** ein Lagerort, keine verpflichtenden Lagerplaetze, Artikel, Einheit, Bestand, Zu- und Abgang sowie Inventurkontrolle.

### Nachweis- und Ruecksetzmodell

Jedes spaetere Playwright-Szenario bindet Umgebung, Gesellschaft, Rolle, Arbeitsdatum, synthetische Datensatz-IDs, Jira-Key, Anforderungs-/Szenario-ID und geplante Nachweis-ID. Mutierende Schritte benoetigen eine separate menschliche Schreibfreigabe. Szenarien werden in einer definierten Reihenfolge ausgefuehrt; ein dokumentierter Ruecksetzpunkt verhindert, dass ein Wiederholungslauf bereits gebuchte Belege als neuen Erfolg wertet.

## Entscheidungen

- `UABC-DEC-BCB-001`: Genau eine synthetische Gesellschaft und ein Lagerort.
- `UABC-DEC-BCB-002`: Standard vor Anpassung; keine Erweiterungen oder Integrationen.
- `UABC-DEC-BCB-003`: Drei Phasen mit genau fuenf aufeinanderfolgenden Arbeitstagen fuer die Umsetzung; konkrete Kundentermine sind offen.
- `UABC-DEC-BCB-004`: 76 Planstunden plus 4 Stunden genehmigungspflichtige Reserve; 80 Stunden harte Grenze.
- `UABC-DEC-BCB-005`: Woechentliche Rechnung nur aus freigegebenen, abrechenbaren Jira-Istzeiten auf unterster Ticketebene; Schaetzungen und Elternsummen sind nicht abrechenbar.
- `UABC-DEC-BCB-006`: UStVA nur Vorschau/XML-Pruefung, keine Uebermittlung; Steuerfreigabe ist extern.
- `UABC-DEC-BCB-007`: Der Twin ist ein rein lesender Renderer des versionierten Blueprint-Projektindex.

## Alternativen

- Mehrere Gesellschaften: verworfen, weil sie den ersten Standardauftrag und das Budget unnoetig vergroessern.
- Breite Vorabkonfiguration ohne Datenbereitschaft: verworfen, weil sie Nacharbeit in die Umsetzungswoche verschiebt.
- Rechnung nach Schaetzung: verworfen; nur genehmigte Istzeit ist abrechenbar.
- UStVA-Test- oder Produktivuebermittlung: ausgeschlossen, weil Simulation keine steuerliche Mandatierung ersetzt; ELSTER-Zugangsdaten werden nicht verwendet.
- Twin mit eigener Datenbank: ausgeschlossen, weil dies eine zweite Wahrheit erzeugt.

## Offene Punkte

1. Echte Bestaetigung, dass `Universaarl GmbH` die einzig erlaubte Schreibzielgesellschaft ist und zurueckgesetzt werden darf.
2. Menschliche Lizenzentscheidung Essentials/Premium einschliesslich externer Kosten.
3. Steuerberaterfreigabe fuer Konten, MwSt.-Buchungsmatrix, UStVA-Kennzeichen und XML-Pruefweg.
4. Benannte reale Abnehmer fuer Daten, fachlichen Abnahmetest, Sandbox-Pilot, dokumentierte Produktionsbereitschaft, Monatsabschlussprobe und Abschluss der Stabilisierungsphase.
5. Projektspezifische Autorisierung eines spaeteren mutierenden Playwright-Laufs.

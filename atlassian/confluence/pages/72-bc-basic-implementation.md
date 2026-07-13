---
id: UABC-BCBIMPLEMENTATION
title: 02.3 Loesung und Einrichtung
parent: UABC-BCBDELIVERABLES
owners:
  - P-002
  - P-004
  - P-005
  - P-011
  - P-019
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 8
storyPageId: PAGE-UABC-110
purpose: Erklärt die kundenspezifische Standardkonfiguration, Reihenfolge,
  Prüfungen und Rollenabgrenzung.
audience:
  - Consultant
  - Solution Architect
  - Key User
jiraRefs:
  - UABC-39
  - UABC-40
  - UABC-41
  - UABC-42
  - UABC-43
  - UABC-44
  - UABC-46
referenceIds:
  - UABC-REQ-BCB-001
  - UABC-REQ-BCB-003
  - UABC-REQ-BCB-006
  - UABC-REQ-BCB-008
  - UABC-REQ-BCB-009
lastReviewed: 2026-09-03
version: 5
---

# 02.3 Loesung und Einrichtung

## Lösungsziel

Die Seite beschreibt das Soll für `UABC-BASIC-DE`. Der aktuelle Istzustand ist eine unveränderte Microsoft-Standard-CRONUS-Demo-Baseline; `pilotConfigured=false`, `writesApplied=false` und der Readback steht aus.

Technischer Firmenname, URL und sichtbarer Firmenname belegen keine eingerichtete Kundeninstanz. Vor jedem Setup-Write muss Wave 0 interne Company-ID, Name, Display Name, Standard-CRONUS-Provenienz, Zielentscheidung und Resetpunkt nachweisen.

Das Consultant-Muster ersetzt weder die Prüfung der Sandbox noch steuerliche oder rechtliche Entscheidungen.

## Einrichtungsstatus und Wahrheitsgrenze

Setupfolge, Feldwerte, Buchungsmatrizen und Rollenproben sind in der Referenzsimulation synthetisch geprüft. Vor jeder realen Konfiguration müssen Zielgesellschaft, Schreibfreigabe, Rücksetzpunkt und bestätigte Kundenparameter vorliegen.

## Setupfolge, Konfiguration und Berechtigungen

### Setup-Reihenfolge

1. **Zielkontext binden:** Company Information, Sprache, Region, Basiswährung und `UABC-BASIC-DE` prüfen.
2. **Finanzrahmen setzen:** General Ledger Setup, Accounting Periods und erlaubte Buchungszeiträume festlegen.
3. **Konten und Buchungslogik:** Kontenrollen, `General Posting Setup`, `VAT Posting Setup` und Nebenbuchgruppen aufbauen.
4. **Steuernde Stammdaten:** Dimensionen, Nummernserien, Zahlungsbedingungen, Zahlungsformen und Mahnlogik anlegen.
5. **Prozesssetup:** Purchases & Payables, Sales & Receivables, Inventory, Bank und Lagerort `HAUPT` konfigurieren.
6. **Daten laden:** Setup-, Stamm- und Eröffnungswelle in dieser Reihenfolge prüfen, laden, abstimmen und bei Fehlern kontrolliert wiederholen.
7. **Berechtigungen und UAT:** Rollenproben durchführen, positive und verweigerte Aktionen dokumentieren und an UAT übergeben.

Jeder Abschnitt endet erst, wenn Pflichtfelder, Referenzen, erwartete Wirkung, Rücksetzbarkeit und zugeordneter UAT-Fall geprüft sind.

### Konfigurationsbaseline

| Bereich | Synthetischer Standardwert | Erwartete Wirkung |
|---|---|---|
| Gesellschaft | `UABC-BASIC-DE`, DE, EUR, Kalenderjahr | eindeutiger Buchungs- und Berichtsrahmen |
| Konten | 11 SKR04-orientierte Kontenrollen | alle Referenzbuchungen lösen auf |
| Allgemeine Gruppen | `INLAND` und `HANDEL` | Einkauf, Verkauf und Wareneinsatz werden kontiert |
| VAT | `INLAND` und `MWST19`, 19 Prozent | Vor- und Umsatzsteuer werden getrennt geführt |
| Dimensionen | `KOSTENSTELLE`, `GESCHAEFT` | GuV-relevante Belege sind auswertbar |
| Lager | `HAUPT`, `STK`, FIFO | Menge, Wert und Sachkonto bleiben abstimmbar |
| Bank | synthetische EUR-Bankgruppe | Zahlungen und Abstimmung ohne externe Anbindung |

Die Kontenrollen umfassen Bank, Debitoren- und Kreditorensammelkonto, Warenbestand, Eröffnungsclearing, Einkauf, Erlös, Vorsteuer, Umsatzsteuer, Wareneinsatz und Inventurdifferenz.

### Buchungs- und Kontrolllogik

- `INLAND` plus `HANDEL` führt Verkauf auf die Erlösrolle.
- Der synthetische Artikelbezug aktiviert die Eingangsrechnung auf `BESTAND-HANDEL`; der spätere Abgang belastet `WARENEINSATZ-HANDEL`.
- `EINKAUF-HANDEL` ist für nicht bestandsgeführte Beschaffung vorgesehen und wird im Referenzfall nicht bebucht.
- Die tatsächliche BC-Verrechnung über Bestands-, Wareneinsatz- und Direct-Cost-Applied-Mechanik wird in der Kundensandbox per Posting Preview bestätigt.
- `INLAND` plus `MWST19` führt Vorsteuer und Umsatzsteuer auf getrennte Rollen; der Prozentsatz beträgt in der Simulation 19 Prozent.
- Debitoren- und Kreditorengruppe `INLAND` stimmen mit den jeweiligen Sammelkonten überein.
- Lagergruppe `HANDEL` verbindet Artikelwert, Bestandskonto und Inventurdifferenz.
- Bankgruppe `EUR-BANK` verbindet Zahlungsposten und Bankkonto mit der Kontenrolle `BANK`.

### Feldnahe Prüfung

Der Consultant öffnet jeweils die relevante BC-Seite über die Suche, vergleicht den bestätigten Wert, prüft Abhängigkeiten und führt eine kleine kontrollierte Probe aus.
Beispiele sind Posting Preview, Dimensionsvalidierung, Nummernserienvorschau, Rollenprobe und Navigate/Find Entries.

Unbekannte Seiten, Felder, Permission Sets oder Lokalisierungsfunktionen werden nicht geraten. Sie werden als Sandboxbefund mit Owner, Auswirkung und Entscheidung dokumentiert.

### Rollen und Funktionstrennung

**Administration `P-004`:** bereitet Gesellschaft und Rollen vor. Die Probe erlaubt das Lesen des Setups, verweigert aber operative Buchung und eigene fachliche Freigabe.

**Finance `P-005`:** bearbeitet Zahlung, Abstimmung und Abschluss. Die Probe erlaubt die Journalprüfung, verweigert aber Benutzeradministration und alleinige Steuerentscheidung.

**Handel `P-011`:** bearbeitet Einkauf und Verkauf. Die Probe erlaubt die Belegerfassung, verweigert aber eine Änderung des Buchungssetups.

**Lager `P-019`:** bearbeitet Bestand und Inventur. Die Probe erlaubt die Zählerfassung, verweigert aber eine Änderung der Bewertungsmethode.

Die Datenrolle `P-016` prüft Vorlagen und übergibt sie kontrolliert. Sponsor `P-001` entscheidet Gates und liest Status, erhält aber kein künstliches Endanwendertraining.

### DE-Lokalisierung

Vor Setup werden BC-Version, Country/Region, Sprache, installierte Apps und verfügbare deutsche Funktionen read-only erfasst.
Danach werden Konten, VAT Posting Setup, VAT Entries, VAT Statement beziehungsweise VAT Return und UStVA-Zuordnung fachlich geprüft.

Die Referenzsimulation erstellt nur eine VAT-Vorschau. Sie behauptet keine ELSTER-Übermittlung, Steuerberatung oder rechtliche Freigabe.

## Abweichungen und Bestätigungspunkte

- **Synthetisch entschieden:** Konfigurationsbaseline, Setup-Reihenfolge, sechs Buchungsmatrizen, FIFO, zwei Dimensionen und SoD-Grundsatz.
- **In einer realen Sandbox zu bestätigen:** konkrete Seiten und Felder, installierte Apps, Permission Sets, Nummernserien, Buchungszeiträume und Rücksetzung.
- **Fachlich zu bestätigen:** Kontonummern, VAT-/UStVA-Kennzeichen, Bank- und Mahnverfahren, Freigabegrenzen und Standardreports.
- Jede Abweichung wird als Standardübernahme, Parametrisierung, Change oder Out-of-Scope dokumentiert.

## Referenzen

- [Konfigurationswerte](../../../project/bc-basic/customer-templates/example/company-setup.example.yaml)
- [Setup- und Datenfolge](../../../project/bc-basic/data-package.yaml)
- [BC-Seiten, Aktionen und Retests](../../../project/bc-basic/bc-playthrough-catalog.yaml)
- [Rollen- und Trainingsproben](../../../project/bc-basic/training-plan.yaml)
- [Offizielles Quellenregister](../../../docs/research/source-register.md)
- [Maschinenlesbare Quellenzuordnung](../../../docs/research/sources.yaml)

<!-- story-metadata {"id":"PAGE-UABC-110","title":"02.3 Loesung und Einrichtung","parent":"PAGE-UABC-130","version":5,"status":"published"} -->

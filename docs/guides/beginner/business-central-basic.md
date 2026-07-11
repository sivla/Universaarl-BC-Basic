---
documentId: UABC-HANDBOOK-BCB-CUSTOMER-001
projectId: UABC-BC-BASIC-001
version: 0.1-plan
status: Entwurf
simulation: true
deliverableRef: UABC-DEL-BCB-009
---

# Einsteigerunterlage: BC Basic Einrichtung

Diese Unterlage ist ein geplanter Lieferentwurf fuer die synthetische Sandbox-Simulation. Sie beschreibt den vorgesehenen Standardumfang **BC Basic Einrichtung**, aber keine bereits eingerichtete oder produktionsbereite Kundenloesung. Offene Werte, Ergebnisse und Freigaben bleiben leer.

## 1. Projektgrenze

- Umgebung: `playthru`.
- Gesellschaft: genau eine synthetische `Universaarl GmbH` mit ID `UABC-BASIC-DE`.
- Umfang: SKR04, Grundeinrichtung, Finanzwesen/Buchhaltung, Einkauf, Verkauf und einfacher Bestand am Lagerort `HAUPT`.
- Daten: ausschliesslich synthetische Datensaetze mit kontrollierten Kennungen.
- Betriebsziel: arbeitsfaehige Sandbox-Grundeinrichtung fuer Pflichtszenarien, kein Produktivstart.

Nicht enthalten sind Erweiterungen in AL, eigene Berichte oder Layouts, Integrationen, Power Platform, Dataverse, produktive Bankanbindung oder PSD2, mehrere Firmen, Waehrungen, Banken oder Lagerorte, erweitertes Lager, Chargen oder Seriennummern, Varianten-/Attributkomplexitaet ohne Pflichtgrund, Produktion, Service, Projekte, Anlagenbuchhaltung, Konsolidierung, Intercompany, Lohnabrechnung, historische Bewegungsdaten, E-Rechnung, Schulung zur Konfigurationspaketpflege, Steuer- oder Rechtsberatung und eine GoBD-Garantie.

## 2. Rollen und Freigaben

Die synthetischen Rollen P-001 bis P-019 dienen nur der Simulation. Echte Verantwortliche muessen spaeter Zielgesellschaft, Daten, Lizenz, Finanz-/Steuerdesign, Sandbox-Schreibumfang, fachlichen Abnahmetest, UAT-Ergebnisse, Monatsabschlussprobe, UStVA-Vorschau, Hypercare-Abschluss und Uebergabe freigeben. Eine synthetische Rolle oder automatisierte Pruefung der Projektablage kann das nicht ersetzen.

## 3. Grundeinrichtung

Vor jedem Schreibvorgang werden Umgebung, Gesellschaft, Rolle, Arbeitsdatum und Ruecksetzpunkt kontrolliert. Unternehmensdaten, Nummernserien, Buchungsperioden und minimale Rollen werden nur nach Freigabe eingerichtet. Grundlage sind `UABC-PW-BCB-001` und `UABC-PW-BCB-002`; beide Szenarien sind noch nicht ausgefuehrt.

Quelle: `SRC-BC-052` fuer Sandbox-Grenzen und `SRC-BC-053` fuer die Unternehmensgrundeinrichtung.

## 4. Finanzwesen und Buchhaltung

Der Plan umfasst Konten, Debitoren-, Kreditoren-, Bestands- und Mehrwertsteuerbuchungsgruppen, Zahlungsbedingungen, Bankkonten als Stammdaten, zwei Dimensionen, Journale und Basisberichte. Buchungsgruppen duerfen erst nach fachlicher Freigabe verwendet werden. `UABC-PW-BCB-003` prueft spaeter eine synthetische Journalbuchung und ihre Abstimmung.

Quelle: `SRC-BC-016` fuer Buchungsgruppen, `SRC-BC-055` fuer Bankabstimmung und `SRC-BC-056` fuer Periodenabschlussprozesse.

## 5. Einkauf, Verkauf und einfacher Bestand

Der Einkaufsablauf umfasst Bestellung, Wareneingang, Eingangsrechnung und optional begrenzte Zahlungsvorbereitung. Der Verkaufsablauf umfasst Angebot oder Auftrag, Lieferung, Verkaufsrechnung und optional begrenzten Zahlungseingang. Der Bestand verwendet wenige Artikel und genau einen Lagerort ohne verpflichtende Lagerplaetze. Die geplanten Szenarien sind `UABC-PW-BCB-004` bis `UABC-PW-BCB-006`.

Quelle: `SRC-BC-054` fuer die einfache Bestandseinrichtung.

## 6. Monatsabschlussprozess in der Sandbox

In der Sandbox wird der Monatsabschlussprozess geprobt. Debitoren, Kreditoren, Bankersatz, Bestand, Steuer- und Sachkonten, Perioden sowie Basisberichte werden abgestimmt und dokumentiert. Das ist kein echter Monatsabschluss. Fehlende Abstimmungen oder offene Differenzen blockieren `UABC-PW-BCB-007`.

## 7. UStVA-Vorschau

Nach fachlicher Freigabe der Kennzeichen wird die UStVA-Vorschau gegen die Abstimmung geprueft. Es erfolgt weder eine Test-, Produktiv- noch ELSTER-Uebermittlung. Das Projekt speichert keine ELSTER-Zugangsdaten und bietet keine Steuerberatung. Das geplante Szenario ist `UABC-PW-BCB-008`.

Quellen: `SRC-BC-057`, `SRC-LAW-001` und `SRC-ELSTER-001`.

## 8. Schulung und Unterstuetzung

Vier Schulungseinheiten decken Navigation/Rollencenter/Tell Me, Finanzwesen, Einkauf/Verkauf und Bestand ab. Ein Termin gilt erst mit Ausfuehrungstranskript, Anwesenheit, Uebungsergebnis, offenen Fragen und Kompetenzpruefung als abgeschlossen. Schulung zur Erstellung oder Pflege von Konfigurationspaketen ist ausgeschlossen. Die Hypercare ist auf eine Woche und hoechstens 10 Stunden begrenzt; offene oder neue Anforderungen werden nicht unbegrenzt aufgenommen.

## 9. Nachweise und Versionsbezug

| Bereich | Szenarien | Geplanter Nachweis | Aktueller Stand |
| --- | --- | --- | --- |
| Einrichtung und Prozesse | `UABC-PW-BCB-001` bis `UABC-PW-BCB-006` | `UABC-VER-BCB-E2E-001` | nicht ausgefuehrt |
| Schulung und Fachabnahme | `UABC-PW-BCB-009` | `UABC-VER-BCB-TRAINING-001` | nicht ausgefuehrt |
| Abschlussprobe | `UABC-PW-BCB-007` | `UABC-VER-BCB-CLOSE-001` | nicht ausgefuehrt |
| UStVA-Pruefung | `UABC-PW-BCB-008` | `UABC-VER-BCB-VAT-001` | nicht ausgefuehrt |
| Uebergabe | `UABC-38` | `UABC-VER-BCB-HANDOVER-001` | nicht ausgefuehrt |

Die verbindlichen Quellen und der aktuelle Stand werden ausschliesslich ueber `exports/project-data/v1/index.yaml` aufgeloest. Bei gemeinsam genutzten Dateien gilt nur der dort deklarierte Selektor; Verweise innerhalb einer Quelle erweitern den Leseumfang nicht. Fehlende Werte bleiben leer.

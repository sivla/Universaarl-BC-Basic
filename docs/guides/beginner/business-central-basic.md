---
documentId: UABC-HANDBOOK-BCB-CUSTOMER-001
projectId: UABC-BC-BASIC-001
version: 1.0-reference
status: Kundenbereit
simulation: true
deliverableRef: UABC-DEL-BCB-009
---

# Einsteigerunterlage: BC Basic Einrichtung

Diese Unterlage erklaert das kundenbereite BC-Basic-Standardpaket. Der Universaarl-Referenzfall ist mit synthetischen Daten repositorybasiert vollstaendig durchgespielt und abgestimmt; er beweist weder eine reale BC-Ausfuehrung noch eine produktionsbereite Kundenloesung. Fuer einen neuen Kunden bleiben die gekennzeichneten Vorlagen und Sandboxnachweise neu auszufuellen beziehungsweise auszufuehren.

## 1. Projektgrenze

- Umgebung: `playthru`.
- Gesellschaft: genau eine synthetische `Universaarl GmbH` mit ID `UABC-BASIC-DE`.
- Umfang: SKR04, Grundeinrichtung, Finanzwesen/Buchhaltung, Einkauf, Verkauf und einfacher Bestand am Lagerort `HAUPT`.
- Daten: ausschliesslich synthetische Datensaetze mit kontrollierten Kennungen.
- Betriebsziel: arbeitsfaehige Sandbox-Grundeinrichtung fuer Pflichtszenarien, kein Produktivstart.

Nicht enthalten sind Erweiterungen in AL, eigene Berichte oder Layouts, Integrationen, Power Platform, Dataverse, produktive Bankanbindung oder PSD2, mehrere Firmen, Waehrungen, Banken oder Lagerorte, erweitertes Lager, Chargen oder Seriennummern, Varianten-/Attributkomplexitaet ohne Pflichtgrund, Produktion, Service, Projekte, Anlagenbuchhaltung, Konsolidierung, Intercompany, Lohnabrechnung, historische Bewegungsdaten, E-Rechnung, Schulung zur Konfigurationspaketpflege, Steuer- oder Rechtsberatung und eine GoBD-Garantie.

## 2. Rollen und Freigaben

Die synthetischen Rollen P-001 bis P-019 haben alle Referenzgates innerhalb der Simulation durchlaufen. In einer neuen Kundeninstanz werden diese Rollen durch echte Verantwortliche ersetzt; Zielgesellschaft, Daten, Lizenz, Finanz-/Steuerdesign, Sandbox-Schreibumfang und Benutzerergebnisse werden dort neu bestaetigt. Die synthetische Abnahme bleibt Demonstrationsnachweis und wird nicht als reale Kundenfreigabe ausgegeben.

## 3. Grundeinrichtung

Vor jedem Schreibvorgang werden Umgebung, Gesellschaft, Rolle, Arbeitsdatum und Ruecksetzpunkt kontrolliert. Unternehmensdaten, Nummernserien, Buchungsperioden und minimale Rollen werden nur nach Freigabe eingerichtet. `UABC-PW-BCB-001` und `UABC-PW-BCB-002` sind im Referenzfall synthetisch abgeschlossen; im echten Kundensandboxlauf bleiben sie bis zum Benutzer- und UI-Nachweis geplant.

Quelle: `SRC-BC-052` fuer Sandbox-Grenzen und `SRC-BC-053` fuer die Unternehmensgrundeinrichtung.

## 4. Finanzwesen und Buchhaltung

Der Standard umfasst Konten, Debitoren-, Kreditoren-, Bestands- und Mehrwertsteuerbuchungsgruppen, Zahlungsbedingungen, Bankkonten als Stammdaten, zwei Dimensionen, Journale und Basisberichte. Die Referenzbaseline verwendet 11 synthetische Kontenrollen, sechs Buchungsmatrizen, `INLAND`, `HANDEL`, `MWST19`, `KOSTENSTELLE`, `GESCHAEFT` und FIFO. `UABC-PW-BCB-003` ist synthetisch abgestimmt; reale Konten und Steuerkennzeichen werden vor Kundennutzung neu bestaetigt.

Quelle: `SRC-BC-016` fuer Buchungsgruppen, `SRC-BC-055` fuer Bankabstimmung und `SRC-BC-056` fuer Periodenabschlussprozesse.

## 5. Einkauf, Verkauf und einfacher Bestand

Der Einkaufsablauf umfasst Bestellung, Wareneingang, Eingangsrechnung, Zahlung und Ausgleich. Der Verkaufsablauf umfasst Auftrag, Lieferung, Verkaufsrechnung, Mahnvorschau, Zahlung und Ausgleich. Der Bestand verwendet wenige Artikel und genau einen Lagerort ohne verpflichtende Lagerplaetze. `UABC-PW-BCB-004` bis `UABC-PW-BCB-006` sind im Referenzfall mit `A-1000`, 42 EUR Einstand und 79 EUR Verkaufspreis synthetisch abgeschlossen.

Quelle: `SRC-BC-054` fuer die einfache Bestandseinrichtung.

## 6. Monatsabschlussprozess in der Sandbox

In der Sandbox wird der Monatsabschlussprozess geprobt. Debitoren, Kreditoren, Bankersatz, Bestand, Steuer- und Sachkonten, Perioden sowie Basisberichte werden abgestimmt und dokumentiert. Das ist kein echter Monatsabschluss. Fehlende Abstimmungen oder offene Differenzen blockieren `UABC-PW-BCB-007`.

## 7. UStVA-Vorschau

Nach fachlicher Freigabe der Kennzeichen wird die UStVA-Vorschau gegen die Abstimmung geprueft. Es erfolgt weder eine Test-, Produktiv- noch ELSTER-Uebermittlung. Das Projekt speichert keine ELSTER-Zugangsdaten und bietet keine Steuerberatung. Das geplante Szenario ist `UABC-PW-BCB-008`.

Quellen: `SRC-BC-057`, `SRC-LAW-001` und `SRC-ELSTER-001`.

## 8. Schulung und Unterstuetzung

Vier Schulungseinheiten decken Navigation/Rollencenter/Tell Me, Finanzwesen, Einkauf/Verkauf und Bestand ab. Ein Termin gilt erst mit Ausfuehrungstranskript, Anwesenheit, Uebungsergebnis, offenen Fragen und Kompetenzpruefung als abgeschlossen. Schulung zur Erstellung oder Pflege von Konfigurationspaketen ist ausgeschlossen. Die Hypercare ist auf eine Woche und hoechstens 10 Stunden begrenzt; offene oder neue Anforderungen werden nicht unbegrenzt aufgenommen.

## 9. Nachweise und Versionsbezug

| Bereich | Szenarien | Referenzsimulation | Neue Kundeninstanz |
| --- | --- | --- | --- |
| Einrichtung und Prozesse | `UABC-PW-BCB-001` bis `UABC-PW-BCB-006` | synthetisch abgeschlossen und abgestimmt | Sandboxlauf mit echten Parametern geplant |
| Schulung und Fachabnahme | `UABC-PW-BCB-009` | vier Rollen synthetisch bestanden | Benutzer fuehren Kompetenznachweis neu durch |
| Abschlussprobe | `UABC-PW-BCB-007` | Schlussbilanz 11.080,20 EUR je Seite; Differenz 0,00 EUR | reale Salden und Perioden neu abstimmen |
| UStVA-Pruefung | `UABC-PW-BCB-008` | 150,10 EUR Ausgangssteuer minus 79,80 EUR Vorsteuer gleich 70,30 EUR Vorschau | Steuerkennzeichen bestaetigen; keine Uebermittlung im Paket |
| Uebergabe | `UABC-50` | synthetisch abgenommen | reale Betriebsannahme nach Kundensandbox |

Die verbindlichen Quellen und der aktuelle Stand werden ausschliesslich ueber `exports/project-data/v1/index.yaml` aufgeloest. Bei gemeinsam genutzten Dateien gilt nur der dort deklarierte Selektor; Verweise innerhalb einer Quelle erweitern den Leseumfang nicht. Fehlende Werte bleiben leer.

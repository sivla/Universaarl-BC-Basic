---
documentId: UABC-HANDBOOK-BCB-CUSTOMER-001
projectId: UABC-BC-BASIC-001
version: 1.1
status: Kundenprozessunterlage-fuer-spaetere-Pilotnutzung
simulation: true
deliverableRef: UABC-DEL-BCB-009
---

# Einsteigerunterlage: BC Basic Einrichtung

Diese Unterlage erklaert die spaeteren Kundenprozesse des BC-Basic-Standardpakets. `UABC-BASIC-DE` enthaelt aktuell Standard-CRONUS-Demodaten und ist nicht als BC-Basic-Pilot eingerichtet. Der CORE-FINANCE-Payload ist nur fuer einen kontrollierten Consultant-Lauf vorbereitet; er wurde nicht in Business Central angewendet.

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

Der vorbereitete Standard umfasst 11 synthetische Kontenrollen, allgemeine und VAT-Buchungsgruppen, Zahlungsbedingungen `14T` und `30T`, die Dimensionen `KOSTENSTELLE` und `GESCHAEFT`, Nummernserien sowie den Lagerort `HAUPT`. Die 19-Prozent-VAT ist eine synthetische Projektannahme und muss vor Anwendung fachlich beziehungsweise steuerlich bestaetigt werden. Ein reales Bankkonto, IBAN/BIC oder Zahlungsdatei-Export ist nicht Teil von CORE-FINANCE.

Nach einer spaeter belegten Einrichtung arbeitet der Kunde nur mit den freigegebenen Prozessen: Dimensionen auf Belegen auswaehlen, Zahlungsbedingungen pruefen und den Lagerort `HAUPT` verwenden. Paketdefinition, Excelimport, Validierung, Fehlerbereinigung und `Apply Package` verbleiben beim Consultant.

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
## Kanonischer Abschluss und Arbeitsfolge

Die BC-Basic-Einführung ist im Projektkatalog als `simulated-complete` dokumentiert. Diese Kennzeichnung beschreibt eine realitätsnahe Repository-Simulation, keine echte Mandanten- oder Steuerfreigabe. Für einen kontrollierten echten Lauf sind zuerst Tenant, Lizenz, Security, UAT, Cutover, First Close, VAT und Support separat zu bestätigen.

### Einrichtung, Prüfung und Nachweis

1. Öffne **Einrichtung > Unternehmensdaten** und prüfe Firmenname, Adresse, Sprache und lokale Währung. Werte aus der Blankovorlage sind Eingaben, keine Live-Beobachtung.
2. Öffne **Finanzbuchhaltung > Einrichtung > Finanzbuchhaltung Einrichtung** und prüfe Kontenplan, Buchungsmatrix, Buchungsgruppen, Dimensionen und Nummernserien. Nutze **Buchungsvorschau**, bevor ein Beleg gebucht wird.
3. Erfasse einen synthetischen Einkaufs- und Verkaufsbeleg. Prüfe Dokumentstatus, MwSt.-Betrag, Debitoren-/Kreditorensaldo und die erzeugten Sachposten.
4. Öffne **Sachposten** beziehungsweise **Posten suchen**, dokumentiere Dokumentnummer, Buchungsdatum, Betrag und Gegenkonto. Eine Kontrollsumme muss im Beleg, der Vorschau und dem Ledger übereinstimmen.
5. Bei einem Defect korrigiere die Eingabe oder Einrichtung, führe denselben Nachweis erneut aus und verknüpfe Defect, Korrektur und Retest im Projekt-Evidence.

### Übergabe

Schulung, UAT, Cutover-Rehearsal, Hypercare und Supportübergabe werden als synthetische Nachweise geführt. Der aktuelle Kundenkatalog ist read-only; acht reale Folgegates bleiben pending.

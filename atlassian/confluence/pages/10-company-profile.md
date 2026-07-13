---
id: UABC-COMPANY
title: 01 Unternehmen
parent: null
owners:
  - P-001
  - P-005
  - P-011
  - P-019
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 1
storyPageId: PAGE-UABC-010
purpose: Trennt den aktuellen Standard-CRONUS-Demo-Inhalt vom geplanten synthetischen BC-Basic-Unternehmensmodell.
audience:
  - Sponsor
  - Projektleitung
  - Fachbereich
jiraRefs:
  - UABC-32
  - UABC-34
  - UABC-35
  - UABC-36
  - UABC-37
  - UABC-38
referenceIds:
  - UABC-REQ-BCB-001
  - UABC-REQ-BCB-003
  - UABC-REQ-BCB-006
  - UABC-REQ-BCB-009
lastReviewed: 2026-07-13
version: 6
---

# 01 Unternehmen

## Unternehmensprofil

### Aktueller BC-Iststand

Die Gesellschaft `UABC-BASIC-DE` enthält aktuell Microsoft-Standard-CRONUS-Demodaten. Dieser Zustand ist `standard-cronus-demo`, nicht die unten beschriebene Universaarl-Ausprägung.

Technischer Gesellschaftsname, URL oder sichtbarer Anzeigename sind kein Einrichtungsnachweis; `pilotConfigured=false`, `writesApplied=false` und `readbackStatus=pending` bleiben verbindlich.

Die interne Company-ID, die vollständige Baseline-Inventur und ein belastbarer Reset-/Wiederanlaufpunkt fehlen noch. Deshalb ist die Zielstrategie `blocked-pending-wave0-and-reset-evidence`; ausgewählt ist weder kontrollierte Weiterverwendung noch Neuanlage beziehungsweise Kopie.

Der nächste zulässige BC-Schritt lautet ausschließlich `W0-01-read-company-identity` und ist nur lesend.

### Geplanter BC-Basic-Sollstand

Der Status `bc-basic-target-not-applied` beschreibt eine kleine synthetische deutsche Handelsgesellschaft. Das Unternehmensmodell ist absichtlich schlank, damit Finance, Einkauf, Verkauf, Zahlung, Lager und Monatsabschluss später ohne kundenspezifische Erweiterung Ende zu Ende geprüft werden können.

Noch kein Sollwert gilt als angewendet.

## Betriebsmodell und Gültigkeit

Das Betriebsmodell ist ein geplantes synthetisches Standardmuster, keine Aussage über den aktuellen CRONUS-Datenbestand und keine Aussage über eine reale Universaarl-Gesellschaft. Nur spätere feldgenaue Readbacks dürfen eine tatsächlich angewendete Abweichung belegen.

## Organisation, Wertströme und Volumina

### Geschäftsmodell und Organisation

Im Pilot-Soll handelt die synthetische Gesellschaft technische Standardartikel in Euro. Verwaltung und Buchhaltung arbeiten am Hauptsitz; Waren sollen über den einfachen Lagerort `HAUPT` ohne Lagerplätze, Chargen oder Seriennummern geführt werden.

| Merkmal | Synthetische Ausprägung | Projektwirkung |
|---|---|---|
| Gesellschaft | eine deutsche Handelsgesellschaft | keine Konsolidierung oder Intercompany-Prozesse |
| Geschäftsjahr | Kalenderjahr, Basiswährung EUR | einfacher Monats- und Periodenabschluss |
| Stammdatenziel | 20 Debitoren, 12 Kreditoren, 12 Artikel | schlanke, kontrollierbare Migration |
| Monatsvolumen | 55 Verkaufs- und 35 Einkaufsrechnungen | BC-Standardbelege ohne EDI reichen aus |
| Zahlungen | 40 Eingänge und 30 Ausgänge | manuelle Abstimmung als Standardweg |
| Lagerbewegungen | etwa 150 pro Monat | Basislager ohne erweitertes Warehouse |

### Wertströme

1. **Purchase-to-Pay:** Bestellung, Wareneingang, Eingangsrechnung, Zahlung und Kreditorenausgleich.
2. **Order-to-Cash:** Verkaufsauftrag, Lieferung, Ausgangsrechnung, Mahnprobe, Zahlung und Debitorenausgleich.
3. **Cash und Bank:** synthetischer Kontoauszug, Zuordnung, Differenzbehandlung und Abstimmung.
4. **Lager:** Zugang, Abgang, Zählung, Inventurdifferenz und Wertabgleich.
5. **Finance:** Nebenbuchkontrollen, Hauptbuch, VAT-Vorschau und Periodenprüfung.

### Referenzgeschäftsfälle und Kontrollwerte

- Der Einkaufsfall umfasst zehn Stück zu 42,00 EUR: 420,00 EUR netto, 79,80 EUR Vorsteuer und 499,80 EUR brutto.
- Der Verkaufsfall umfasst zehn Stück zu 79,00 EUR: 790,00 EUR netto, 150,10 EUR Umsatzsteuer und 940,10 EUR brutto.
- Der Endbestand beträgt nach Zugang, Abgang und Inventurdifferenz 99 Stück beziehungsweise 4.158,00 EUR.
- Der synthetische Bankschlusssaldo beträgt 5.440,30 EUR; die VAT-Zahllast der Prozessfälle beträgt 70,30 EUR.

### Verantwortungsmodell

Finance kontrolliert Haupt- und Nebenbücher, Handel verantwortet Belege und Partnerposten, Lager kontrolliert Mengen und Werte.
Die Datenrolle liefert und bereinigt Vorlagen. Sponsor und Projektleitung entscheiden Gates, ohne operative Aufgaben in Personalunion zu übernehmen.

## Kundenspezifisch zu bestätigen

- **Synthetisch entschieden:** eine Gesellschaft, ein Lagerort, EUR, Kalenderjahr, FIFO, einfache Zahlungs- und Mahnlogik sowie Standardreporting.
- **Kundenspezifisch zu bestätigen:** reales Geschäftsmodell, Volumina, Standorte, Rollen, Freigabegrenzen, Bankverfahren, Reporting und gesetzliche Anforderungen.
- Erweiterte Lagerlogik, Fremdwährung, Produktion, Projekte, Service, Konsolidierung und Integrationen bleiben außerhalb des BC-Basic-Standards.

## Referenzen

- [Synthetische Gesellschaftsbaseline](../../../project/bc-basic/customer-templates/example/company-setup.example.yaml)
- [Volumina, Migrationsobjekte und Datenregeln](../../../project/bc-basic/data-package.yaml)
- [Beleg- und Postenketten](../../../evidence/simulation/bc-playthrough-ledger.yaml)
- Der Prozessumfang ist mit den Tickets `UABC-34` und `UABC-35, UABC-36, UABC-37` verbunden.

<!-- story-metadata {"id":"PAGE-UABC-010","title":"01 Unternehmen","parent":null,"version":6,"status":"published"} -->

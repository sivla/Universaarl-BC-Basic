---
id: UABC-PROCESSES
storyPageId: PAGE-UABC-040
title: 01 Prozess- und Konfigurationsstandard
parent: UABC-BCBPROJECT
spaceId: UABC-SPACE-PRODUCT
spaceType: standard-product
order: 1
purpose: Wiederverwendbare Prozess- und Einrichtungsvorgaben für BC Basic
audience: Consultant, Solution Architecture und Key User
owners: [P-002]
version: 5
status: published
jiraRefs: [UABC-3]
referenceIds: [UABC-CAP-CATALOG-001, UABC-REQ-CAP-002]
lastReviewed: 2026-07-12
---

# 01 Prozess- und Konfigurationsstandard

## Zweck des Standards

Diese Seite beschreibt die fachliche Baseline des Produkts. Sie ist kein Kunden-Solution-Design: konkrete Konten, Nummernserien, Bankparameter, Steuerkennzeichen und Verantwortliche werden in der jeweiligen Kundeninstanz entschieden.

## Prozess- und Konfigurationsprinzip

BC Basic verwendet durchgängige Standardprozesse mit prüfbarer Beleg-, Posten- und Abstimmungskette.

Die Konfiguration wird in fester Reihenfolge aufgebaut und erst nach bestandener Feld-, Prozess- und Berechtigungsprüfung an UAT übergeben.

## End-to-End-Prozesse, Kontrollen und Baseline

### Prozessstandard

**Finance und Monatsabschluss**

- Geschäftsvorfälle werden über Haupt- und Nebenbücher nachvollziehbar gebucht.
- Debitoren, Kreditoren, Bank, Bestand und VAT/USt werden vor Periodenabschluss abgestimmt.
- Eine VAT-/UStVA-Vorschau dient der Kontrolle; produktive Übermittlung ist nicht Bestandteil des Standards.

**Purchase-to-Pay**

- Bedarf und Bestellung führen über Wareneingang oder Leistung zur Rechnung.
- Buchung erzeugt nachvollziehbare Kreditoren-, Sachkonto-, VAT- und gegebenenfalls Lagerposten.
- Zahlung und Ausgleich schließen die Verbindlichkeit; Abweichungen werden vor Buchung geklärt.

**Order-to-Cash**

- Angebot oder Auftrag führt über Lieferung zur Rechnung.
- Buchung erzeugt nachvollziehbare Debitoren-, Umsatz-, VAT- und Lagerposten.
- Zahlungseingang und Ausgleich schließen die Forderung; Rückgabe und Gutschrift folgen dem Standardkorrekturweg.

**Cash, Bank und Mahnung**

- Zahlungsjournale und Ausgleich verknüpfen Bankbewegung und offenen Posten.
- Bankabstimmung erklärt jede Differenz oder übergibt sie als offenen Klärfall.
- Mahnläufe verwenden kundenspezifisch bestätigte Fristen, Gebühren und Kommunikationsregeln.

**Lager und Inventur**

- Zu- und Abgänge werden je Artikel, Einheit und Lagerort geführt.
- Inventur vergleicht berechnete und gezählte Menge; Differenzen werden geprüft und nachvollziehbar gebucht.
- Negativbestand und nicht freigegebene Lagerorte werden nach Projektregel blockiert oder eskaliert.

### Konfigurationsbaseline

Die Einrichtung folgt dieser Reihenfolge:

1. Gesellschaft, Finanzbuchhaltung, Buchungsperioden und Kontenplan.
2. allgemeine und VAT-/USt-Buchungsgruppen samt Matrizen.
3. Nummernserien, Zahlungsbedingungen, Zahlungsformen und Dimensionen.
4. Debitoren-, Kreditoren-, Bank- und Einkaufs-/Verkaufseinrichtung.
5. Lager, Artikel, Einheiten und Bestandsbuchungsgruppen.
6. Rollen, Funktionstrennung, Berechtigungsproben und UAT-Übergabe.

Jeder Abschnitt benötigt ein Entry-Kriterium, eine feldnahe Kontrolle, einen positiven Prozessfall und einen verweigerten oder eskalierten Negativfall.

### Reportingstandard

Zum Basispaket gehören Standardauswertungen für Sachkonten, offene Posten, Bankabstimmung, Bestand und VAT/USt.

Individuelle BI-Modelle, gesetzlich nicht bestätigte Auswertungen oder kundenspezifische Layoutentwicklung werden separat bewertet.

## Projektparameter und Erweiterungsgrenzen

- Die Kundeninstanz bestätigt Buchungsmatrizen, Dimensionen und Konten vor Datenmigration.
- VAT-/USt- und Lokalisierungswerte benötigen fachliche beziehungsweise steuerliche Bestätigung.
- Ein Gap wird nur übernommen, wenn Standardparametrisierung den belegten Bedarf nicht erfüllt.

## Referenzen

- [BC Basic Standardprodukt](70-bc-basic-project.md)
- [Lieferpaket, Tests und Standardtraining](81-bc-basic-handover.md)
- [Consultant: Umgebung, Einrichtung, Daten und Testdurchführung](60-environment-baseline.md)

<!-- story-metadata {"id":"PAGE-UABC-040","parent":"PAGE-UABC-090","version":5,"status":"published"} -->

---
id: UABC-HYPERCARE
title: 04 Handbuecher
parent: null
owners:
  - P-002
  - P-005
  - P-011
  - P-019
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 4
storyPageId: PAGE-UABC-170
purpose: Befähigt operative Rollen für Alltag, Kontrolle, Fehlerdiagnose und Eskalation.
audience:
  - Key User
  - Endanwender
  - Trainer
  - Support
jiraRefs:
  - UABC-45
  - UABC-46
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-007
  - UABC-REQ-BCB-010
lastReviewed: 2026-09-03
version: 5
---

# 04 Handbuecher

## Zielgruppen und Lernziele

Die Schulung übersetzt den BC-Playthrough in tägliche, wöchentliche und monatliche Arbeit. Sie nutzt dieselben synthetischen Daten wie UAT und Handover, damit Belege, Fehlerbilder, Kontrollen und Supportinformationen zusammenpassen.

## Lernergebnis der Referenzsimulation

Vier Rollenpfade sind in der Referenzsimulation synthetisch bestanden.
Ein echter Kunde wiederholt die Übungen mit benannten Benutzern, bestätigten Berechtigungen und rücksetzbarer Sandbox; dies blockiert die abgeschlossene Simulation nicht.

## Einheitliche Lernfolge

1. Der Trainer macht den vollständigen Fall vor und erklärt die Kontrolle.
2. Die Rolle führt denselben Fall begleitet aus.
3. Die Rolle wiederholt den Fall ohne Hilfe.
4. Die Rolle diagnostiziert einen realistischen Fehler und führt den Retest aus.
5. Die Rolle wählt den richtigen Eskalationsausgang und liefert ein vollständiges Diagnosepaket.

## Übung: Administration – `P-004`

- **Täglich:** Zielgesellschaft, Rolle, Buchungsdatum und offene Störungen prüfen.
- **Wöchentlich:** Nummernserien, erlaubte Buchungszeiträume und Rollenänderungen kontrollieren.
- **Monatlich:** Periodenwechsel und Zugriffsmatrix gemeinsam mit Finance vorbereiten.
- **Positiver Fall:** Setup-Preflight lesen, Benutzerrolle zuordnen und operative Buchung bewusst nicht ausführen.
- **Fehlerfall:** falsche Gesellschaft oder fehlende Nummernserie erkennen; Kontext korrigieren beziehungsweise Buchungsstopp auslösen.
- **Ohne-Hilfe-Regel:** Zielkontext und Zugriffsgrenze erklären, die erlaubte Aktion durchführen und die fachliche Buchung korrekt verweigern.

## Übung: Finance – `P-005`

- **Täglich:** Zahlungsvorschläge, offene Posten, Bankdifferenzen und gesperrte Belege prüfen.
- **Wöchentlich:** Debitoren-, Kreditoren- und Bankabstimmung sowie überfällige Posten kontrollieren.
- **Monatlich:** Hauptbuch, Nebenbücher, Lagerwert, VAT Entries, Zahllast und Periodenstatus abstimmen.
- **Positiver Fall:** Zahlungen anwenden, Bank auf 5.440,30 EUR abstimmen und VAT-Vorschau von 70,30 EUR erklären.
- **Fehlerfall:** Zahlung ohne Ausgleichsreferenz diagnostizieren, `SYN-AR-002` zuordnen und den Retest durchführen.
- **Ohne-Hilfe-Regel:** Betrag, VAT, offene Posten, Bankdifferenz und Periodenwirkung korrekt erklären; keine Steuerentscheidung oder Übermittlung behaupten.

## Übung: Handel – `P-011`

- **Täglich:** offene Einkaufs- und Verkaufsbelege, Mengen, Preise, VAT-Gruppen, Fälligkeiten und Mahnstatus prüfen.
- **Wöchentlich:** nicht fakturierte Lieferungen, offene Wareneingänge und überfällige Debitoren nachverfolgen.
- **Monatlich:** Belegvollständigkeit und offene Partnerposten an Finance übergeben.
- **Positiver Fall:** P2P über 499,80 EUR und O2C über 940,10 EUR bis Zahlung und Ausgleich nachvollziehen.
- **Fehlerfall:** fehlende VAT-Gruppe oder doppelte externe Belegnummer erkennen, Beleg vor Buchung korrigieren und Preview erneut prüfen.
- **Ohne-Hilfe-Regel:** Belegstatus, Menge, Preis, VAT und Partnerposten erklären; Setupänderungen werden an Consultant/Support eskaliert.

## Übung: Lager – `P-019`

- **Täglich:** offene Zugänge und Abgänge, Lagerort, Menge und negative Bestände prüfen.
- **Wöchentlich:** Artikelposten und Wertposten stichprobenartig gegen Belege abstimmen.
- **Monatlich:** Inventurzählung, Differenz und Lagerwert gemeinsam mit Finance kontrollieren.
- **Positiver Fall:** Zugang und Abgang von je zehn Stück sowie Differenz von minus einem Stück bis zum Schlussbestand 99 Stück nachvollziehen.
- **Fehlerfall:** falschen Lagerort erkennen, `HAUPT` korrigieren und Item/Value Entries im Retest prüfen.
- **Ohne-Hilfe-Regel:** Menge, Lagerort, Artikelposten, Wertposten und 4.158,00 EUR Schlusswert erklären; Bewertungsparameter nicht eigenmächtig ändern.

## Vierstufige Eskalation

1. **Selbst korrigieren:** reversibler Eingabefehler innerhalb der eigenen Rolle, noch ohne Buchungswirkung.
2. **Key User:** fachliche Prozess-, Stamm- oder Belegfrage.
3. **Consultant/Support:** Setup-, Berechtigungs- oder reproduzierbarer Systembefund.
4. **Sofortiger Buchungsstopp:** falsche Gesellschaft oder unklare Finanz-, VAT-, Bestands-, Berechtigungs- oder Datenschutzwirkung.

## Operator-Smoke-Test

Am ersten Arbeitstag und zu jedem Hypercare-Tagesstart prüft jede Rolle Zielkontext, Rolle, Pflichtarbeitsliste, einen bekannten Beleg und den Supportweg.
Navigate/Find Entries und ein kontrolliert wiederholter Fehlerfall ergänzen den Smoke-Test.

Ein Supportticket enthält Rolle, Umgebung, Version, Zeitpunkt, Seite/Aktion, Belegnummer, letzten erfolgreichen Schritt, Soll/Ist, Fehlertext, Kontrollwerte, Reproduktionsweg, sichere Evidence, Rücksetzpunkt und Auswirkung.

## Nachbereitung und reale Kundendurchführung

- **Synthetisch bestanden:** vier Rollenpfade, positiver Fall, Fehler, Retest, Ohne-Hilfe-Regel, Eskalation und Smoke-Test.
- **Im Kundenprojekt zu belegen:** echte Teilnehmer, Rollen, Permission Sets, Seiten, Buchungen, Reset, Lernergebnis und Trainer-Sign-off.
- Datenrolle `P-016` und Sponsor `P-001` unterstützen Mitwirkung und Gates, erhalten aber kein künstliches Endanwendertraining.

## Referenzen

- [Rollenpfade und Übungen](../../../project/bc-basic/training-plan.yaml)
- [UAT-/Trainingsdurchführung](../../../project/bc-basic/uat-training-run.yaml)
- [Bedienfälle und Fehlerbilder](../../../project/bc-basic/bc-playthrough-catalog.yaml)
- [Support- und Handover-Regeln](../../../docs/handover/bc-basic-handover.md)

<!-- story-metadata {"id":"PAGE-UABC-170","title":"04 Handbuecher","parent":null,"version":5,"status":"published"} -->

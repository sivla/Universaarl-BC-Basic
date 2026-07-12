---
id: UABC-BCBHYPERCARE
title: Einwoechige Hypercare, Monatsabschlussprobe und UStVA-Vorschau
parent: UABC-BCBPROJECT
owners: [P-002, P-005]
status: Synthetisch abgeschlossen
jiraRefs: [UABC-21, UABC-35, UABC-36, UABC-37, UABC-38]
referenceIds: [UABC-REQ-BCB-002, UABC-REQ-BCB-009, UABC-REQ-BCB-010]
lastReviewed: 2026-07-11
---

# Einwoechige Hypercare, Monatsabschlussprobe und UStVA-Vorschau

Phase 3 bleibt eine wiederverwendbare Vorlage mit höchstens 10 Stunden innerhalb einer Kalenderwoche. Die Referenzsimulation hat Monatsabschluss, VAT-Vorschau, Restart und drei Hypercaretage abgeschlossen; ein echter Kunde wiederholt sie nach UAT in seiner Sandbox.

## Begrenzte Hypercare

`UABC-35` fuehrt UAT- und Hypercare-Befunde, Prioritaet, Verantwortliche und Tagesstatus. Relevante Befunde muessen bearbeitet sein oder den Abschluss blockieren. Synthetische Beispieldaten duerfen nicht als echte Unterstuetzungsfaelle erscheinen. Nach der einwoechigen Hypercare werden weitere Taetigkeiten als Support oder neues modulares Projekt behandelt.

## Monatsabschlussprobe in der Sandbox

`UABC-36` probt den Monatsabschlussprozess in der Sandbox und dokumentiert die Abstimmung von Debitoren, Kreditoren, Bankersatz, Bestand, Steuer- und Sachkonten, Perioden sowie Basisberichten. Abweichungen bleiben bis zur Klaerung blockierend. Das ist kein echter Monatsabschluss. Das Lieferergebnis ist `UABC-DEL-BCB-007`.

## UStVA-Vorschau

`UABC-37` prüft Periode, Beträge und Kennzeichen gegen die Abstimmung. Die Referenzvorschau ist synthetisch bestanden; beim Kunden werden Konten/Kennzeichen steuerlich bestätigt. Test-, Produktiv- oder ELSTER-Übermittlung bleiben ausgeschlossen.

## Uebergabe

`UABC-38` hat die Referenzdokumentation, Schulungsunterlagen und den Index synthetisch übergeben. In einer Kundeninstanz bestätigen echte Entscheider den Hypercare-Exit und Betriebsübergang erneut.

<!-- story-metadata {"id":"PAGE-UABC-120","parent":"PAGE-UABC-000","version":3,"status":"published"} -->

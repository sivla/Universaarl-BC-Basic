---
id: UABC-BCBHCSTORY
title: 09 Hypercare und Übergabe
parent: UABC-PROJECT
owners: [P-002, P-005]
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 9
storyPageId: PAGE-UABC-160
purpose: Dokumentiert drei Hypercaretage, Defects, Retests, Restart, Exit und Supportübergabe.
audience: [Projektleitung, Key User, Support]
jiraRefs: [UABC-35, UABC-36, UABC-37, UABC-38]
referenceIds: [UABC-REQ-BCB-002, UABC-REQ-BCB-009, UABC-REQ-BCB-010]
lastReviewed: 2026-09-03
---

# 09 Hypercare und Übergabe

## Betriebslog und Zweck

Hypercare wurde über drei synthetische Tage mit Tagesstart, Tickettriage, Diagnose, Korrektur, Retest und Tagesentscheidung durchgeführt. Die Seite fasst den Verlauf und den Übergang in den Support zusammen.

## Hypercare-Exit

Hypercare ist synthetisch abgeschlossen. Am Exit waren P1 = 0 und P2 = 0 offen, der Operator-Smoke-Test war wiederholbar und Restart sowie Handover waren bestanden.

## Tag 1 – Zahlungseingang

- **Lage:** Zahlungseingang konnte nicht automatisch dem Debitorenposten zugeordnet werden.
- **Ticket:** `TKT-UABC-35`, Priorität P2; Tages-Evidence `SIM-HC-001`.
- **Diagnose:** Ausgleichsreferenz auf `SYN-AR-002` fehlte; Betrag und Bankbewegung waren korrekt.
- **Korrektur:** Applies-to-Referenz ergänzen und Ausgleich erneut prüfen.
- **Retest:** Debitorenposten geschlossen, Bank- und Sachkontowirkung abgestimmt.
- **Tagesentscheidung:** GO für Tag 2.

## Tag 2 – Inventurdifferenz

- **Lage:** Die Zählung wich um eine Einheit vom erwarteten Lagerbestand ab.
- **Ticket:** `TKT-UABC-32`, Priorität P2; Tages-Evidence `SIM-HC-002`.
- **Diagnose:** Falscher Lagerort im Erfassungsschritt; Artikel und Einstandspreis waren korrekt.
- **Korrektur:** Lagerort auf `HAUPT` setzen und Differenz `SYN-INV-001` buchen.
- **Retest:** Schlussbestand 99 Stück, Lagerwert 4.158,00 EUR, Item und Value Entries konsistent.
- **Tagesentscheidung:** GO für Tag 3.

## Tag 3 – VAT-Kennzeichnung

- **Lage:** Der Hinweis auf die synthetische Steuerentscheidung fehlte in der VAT-Abnahme.
- **Ticket:** `TKT-UABC-36`, Priorität P1 wegen unklarer Wahrheitsgrenze; Tages-Evidence `SIM-HC-003`.
- **Diagnose:** Berechnung war mit 70,30 EUR korrekt, aber die Nichtübermittlung und fehlende Steuerberatung waren nicht deutlich genug markiert.
- **Korrektur:** synthetischen Status, Reviewgrenze und Nichtübermittlung in Evidence und Handover ergänzen.
- **Retest:** VAT-Vorschau, Referenzen und Wahrheitshinweis vollständig; keine externe Übermittlung.
- **Tagesentscheidung:** Hypercare-Exit und Supportübergabe.

## Tagessteuerung

Jeder Tag beginnt mit `UABC-SMOKE-BCB-OPERATOR-001`. Geprüft werden Zielkontext, Rollen, bekannte Belege, offene Tickets, Hauptkontrollwerte und Supportweg. Das Tages-GO ist nur bei vollständiger Evidence und ohne offene P1/P2 zulässig.

## Restart und Wiederanlauf

Die Wiederanlaufprobe stellte den dokumentierten synthetischen Ausgangspunkt wieder her und prüfte IDs, Belege, offene Posten, Bank, Bestand und VAT.
Danach wurde der betroffene Smoke-Test wiederholt. Dies ist ein Dateirehearsal und keine behauptete Wiederherstellung eines BC-Tenants.

## Supportübergabe

Übergeben wurden Rollen- und Eskalationsweg, Operator-Smoke-Test, Supportticket-Pflichtfelder, abgeschlossene Defects, Kontrollsummen und Dokumentation.
Bekannte Grenzen und Lessons Learned sind enthalten. Der optionale reale BC-Lauf ist kein offener Simulationsdefect.

## Supportannahme und Restpunkte

- **Synthetisch abgeschlossen:** drei Tages-Gates, drei Defects, Korrekturen, Retests, Restart, P1/P2-Exit und Handover.
- **Für eine reale Kundeninstanz zu parametrisieren:** Supportkontakte, Servicezeiten, Tenant, Monitoring, Backup/Restore, Datenschutzweg und produktiver Incident-Prozess.
- Es wird weder produktiver Support noch reale Leistungserbringung, Rechnung, Zahlung oder Kundenfreigabe behauptet.

## Referenzen

- [Tages- und Abschlussstatus](../../../evidence/simulation/project-completion.yaml)
- [Ticket-, Kommentar- und Hypercarechronik](../../../evidence/simulation/project-story.json)
- [Finanz-, Bank-, Lager- und VAT-Kontrollen](../../../evidence/simulation/phase-3-cash-inventory-close.yaml)
- [Support-Handover](../../../docs/handover/bc-basic-handover.md)
- [Operator-Smoke-Test](../../../project/bc-basic/training-plan.yaml)

<!-- story-metadata {"id":"PAGE-UABC-160","title":"09 Hypercare und Übergabe","parent":"PAGE-UABC-000","version":3,"status":"published"} -->

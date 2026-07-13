---
id: UABC-BCBHCSTORY
title: 03.3 Hypercare und Uebergabe
parent: UABC-BCBSTORY
owners:
  - P-002
  - P-005
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 11
storyPageId: PAGE-UABC-160
purpose: Plant Hypercare, Defectbehandlung, Retest, Exit und Supportübergabe
  für den laufenden Pilot.
audience:
  - Projektleitung
  - Key User
  - Support
jiraRefs:
  - UABC-47
  - UABC-48
  - UABC-49
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-002
  - UABC-REQ-BCB-009
  - UABC-REQ-BCB-010
lastReviewed: 2026-07-13
version: 5
---

# 03.3 Hypercare und Uebergabe

## Aktueller Status

Hypercare ist **nicht gestartet**. Es gibt im aktuellen Pilot keine beobachteten Hypercare-Defects, keine Fixes, keine Retests und keinen Exit. Historische Simulationsevidence erfüllt diese Gates nicht.

## Geplante Szenarien

| Szenario | Geplanter Prüfpunkt | Abschlussbedingung |
|---|---|---|
| Zahlungseingang | Zuordnung, Debitorenposten, Bank- und Sachkontowirkung | reale Beobachtung oder fehlerfreier Readback, dokumentierter Retest |
| Inventur | Lagerort, Menge, Bewertung, Item-/Value-Entry-Readback | differenzfreie Mengen- und Wertabstimmung |
| VAT-Wahrheitsgrenze | Kennzeichen, Bemessungsgrundlagen, Vorschau, Nichtübermittlung | fachlicher Readback ohne externe Übermittlung |

Ein Defect darf erst nach einer tatsächlichen Beobachtung entstehen. Die Szenarien sind Planung und keine vorweggenommenen Supportfälle.

## Tagessteuerung

Jeder spätere Hypercaretag beginnt mit `UABC-SMOKE-BCB-OPERATOR-001`. Zielkontext, Rollen, bekannte Belege, offene Tickets, Kontrollwerte, Resetpunkt und Supportweg müssen prüfbar sein. Ein Tages-GO ist nur mit aktueller Evidence und ohne offenen P1/P2 zulässig.

## Restart und Supportübergabe

Restart, Retro und Supportübergabe bleiben offen. Die spätere Übergabe umfasst Rollen, Eskalationsweg, Supportticket-Pflichtfelder, Kontrollsummen, offene Restpunkte, Servicezeiten und Runbook. Sie setzt belegten Cutover, Hypercare-Exit und Simulationsabnahme voraus.

## Grenzen

- `writesAuthorized=false`; keine BC-Schreibfreigabe wird aus dieser Seite abgeleitet.
- Reale Supportkontakte, Monitoring, Backup/Restore, Datenschutzweg und Incident-Prozess bleiben zu parametrisieren.
- Es wird weder produktiver Support noch reale Leistung, Rechnung, Zahlung oder Kundenfreigabe behauptet.

## Referenzen

- [Aktuelle Ticket- und Hypercareplanung](../../../evidence/simulation/project-story.json)
- [Handover-Plan](../../../docs/handover/bc-basic-handover.md)
- [Operator-Smoke-Test](../../../project/bc-basic/training-plan.yaml)
- [Historische Referenzsimulation](99-archive.md)

<!-- story-metadata {"id":"PAGE-UABC-160","title":"03.3 Hypercare und Uebergabe","parent":"PAGE-UABC-150","version":5,"status":"published"} -->

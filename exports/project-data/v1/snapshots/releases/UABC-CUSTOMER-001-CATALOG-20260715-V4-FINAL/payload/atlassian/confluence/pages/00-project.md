---
id: UABC-PROJECT
title: 00 Hilfe und Projektumgebung
parent: null
owners: [P-002, P-005]
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 0
storyPageId: PAGE-UABC-000
purpose: Zentraler Einstieg in Projektumgebung, Supportweg und Wahrheitsgrenzen.
audience: [Projektleitung, Key User, Support]
jiraRefs: [UABC-32, UABC-33, UABC-47, UABC-50]
referenceIds: [UABC-REQ-BCB-001, UABC-REQ-BCB-002, UABC-REQ-BCB-010, UABC-REQ-BCB-011]
lastReviewed: 2026-07-15
version: 5
---

# 00 Hilfe und Projektumgebung

## Aktueller Projektstatus

Der V3-Referenzlauf fuer **Saarblick Handel & Service GmbH** besitzt den Status `synthetic-closed-v3`: 50
UABC-Tickets, zwoelf Transkripte, 78 Task-Iststunden und 9360 EUR Simulations-Ist. Dies ist kein Live-Tenant-Nachweis.
Reale UAT, Cutover, erster Abschluss, UStVA und Supportannahme bleiben offen.

## Umgebung und Zugriff

| Bereich | Simulationsstand | Reale Anforderung |
|---|---|---|
| Gesellschaft | Saarblick-Handelsmodell | Tenant- und Company-ID per Readback pruefen |
| Module | Finance, Einkauf, Verkauf, einfaches Lager | Lizenz und Berechtigung bestaetigen |
| Integrationen | keine | separat beauftragen und pruefen |
| Continia | out of scope | separates Projekt |
| Reset | Restart synthetisch geprobt | realen Wiederanlaufpunkt nachweisen |

Zugangsdaten, Cookies, Tokens, Browserprofile sowie reale Bank- oder Personendaten duerfen nicht in Projektartefakten
stehen.

## Ansprechpartner und Eskalation

Kajetan Kalicki ist reale Projektleitung und Lead BC Consultant. Dr. Lena Hartmann (Sponsorin), Miriam Becker
(Finance/UAT), Tobias Klein (Einkauf), Julia Brandt (Verkauf), Mehmet Yilmaz (Lager), Nora Schmitt (IT) und Paul Weber
(Support) sind ausdruecklich simulierte Rollen. P1 stoppt das Gate sofort, P2 wird innerhalb vier Stunden triagiert,
P3 im naechsten Daily.

## Supportweg

Ein Supportfall nennt Umgebung, Rolle, Zeitpunkt, Seite und Aktion, Soll/Ist, Fehlertext, letzten erfolgreichen
Schritt, reproduzierbaren Weg, Korrektur und Retest. Finanz-, VAT- oder Bestandsabweichungen werden nicht durch
manuelle Gegenbuchungen verdeckt.

## Naechster realer Schritt

Ein kontrollierter Nur-Lese-Onboardingtermin prueft Tenant, Gesellschaft, Lizenzen, Rollen und Baseline. Erst danach
duerfen Setup, Datenuebernahme und UAT in einer echten Kundenumgebung autorisiert werden. Der Repository-Lauf liefert
Runbook und Erwartungswerte, aber keine reale Freigabe.

## Referenzen

- [Projektstory](../../../evidence/simulation/project-story.json)
- [V3-Pilotmodell](../../../project/bc-basic/pilot-v3.yaml)
- [Projektplan](../../../project/bc-basic/project-plan.yaml)
- [Billing](../../../project/bc-basic/billing.yaml)
- [Meetingindex](../meetings/index.yaml)
- [Readiness-Vertrag](../../../governance/production-readiness.json)

<!-- story-metadata {"id":"PAGE-UABC-000","title":"00 Hilfe und Projektumgebung","parent":null,"version":5,"status":"published"} -->

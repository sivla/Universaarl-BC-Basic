---
id: UABC-PROJECT
title: 00 Hilfe und Projektumgebung
parent: null
owners:
  - P-002
  - P-005
status: published
spaceId: UABC-SPACE-CUSTOMER
spaceType: customer-project
order: 0
storyPageId: PAGE-UABC-000
purpose: Zentraler Einstieg in Projektumgebung, Supportweg und Wahrheitsgrenzen.
audience:
  - Projektleitung
  - Key User
  - Support
jiraRefs:
  - UABC-32
  - UABC-33
  - UABC-47
  - UABC-50
referenceIds:
  - UABC-REQ-BCB-001
  - UABC-REQ-BCB-002
  - UABC-REQ-BCB-010
  - UABC-REQ-BCB-011
lastReviewed: 2026-07-13
version: 7
---

# 00 Hilfe und Projektumgebung

## Aktueller Projektstatus

Der Playthru-Pilot läuft auf `UABC-BASIC-DE`. Die Gesellschaft enthält eine Microsoft-CRONUS-Demo-Ausgangsbasis; ihr Anzeigename allein belegt keine eingerichtete BC-Basic-Kundeninstanz. `pilotConfigured=false`, `writesApplied=false`, `readbackStatus=pending` und `writesAuthorized=false` sind der aktuelle Stand.

Der Angebotsplan umfasst 80 Stunden und 9.600 EUR. Das aus aktiven Task-Worklogs abgeleitete Ist beträgt 0 Stunden und 0 EUR.

Setup, Datenmigration, Prozesse, Training, UAT, Cutover, Hypercare, Retro und Supportübergabe sind offen. Die frühere abgeschlossene Referenzsimulation ist abgelöst und ausschließlich im [Archiv](99-archive.md) nachvollziehbar.

## Projektumgebung

| Bereich | Beobachteter Iststand | Noch zu belegender Pilotsollstand |
|---|---|---|
| Umgebung | Playthru-Sandbox | vor jedem Lauf erneut lesen |
| Gesellschaft | `UABC-BASIC-DE`, unveränderte Standard-CRONUS-Demo-Baseline | interne Company-ID, technischer Name, Name und Display Name per Wave-0 belegen |
| Pilotname | beobachtet `Universaarl GmbH` | Ziel `Universaarl GmbH (BC Basic Pilot)` erst im autorisierten Lauf |
| Daten | CRONUS-Standarddaten | freigegebene Pilotabweichungen mit Readback |
| Setup-Pakete | je 0 Tabellen / 0 Datensätze / 0 Fehler | kontrollierte CORE-FINANCE-Ausführung erst nach Freigabe |
| Reset | Entscheidung offen | konkreter Resetpunkt, Erstellzeit und Wiederanlaufweg belegen |
| Externe Dienste | nicht autorisiert | Bank-, E-Mail- und Steuerübermittlung bleiben ausgeschlossen |

Wave-0 entscheidet anhand der Evidence zwischen kontrollierter Weiterverwendung der dedizierten CRONUS-Kopie und Neuanlage beziehungsweise Kopie. Eine bloße Umbenennung macht aus der Baseline keinen eingerichteten Pilot.

## Rollen und Verantwortung

- **Vendor-Projektleitung (`P-PILOT-LEAD-001`)** steuert Scope, Evidence, Gate-Entscheidungen und Eskalation.
- **Sponsorrolle (`P-001`)** ist eine typisierte Kundenrolle; eine reale Person oder Kundenfreigabe wird nicht erfunden.
- **Finance (`P-005`)**, **Handel (`P-011`)**, **Daten (`P-016`)** und **Lager (`P-019`)** bleiben typisierte Kundenrollen für spätere fachliche Prüfungen.

## Support- und Eskalationsweg

| Ausgang | Wann anwenden | Erwartete Reaktion |
|---|---|---|
| selbst korrigieren | reversibler Eingabefehler ohne Buchungswirkung | Wert korrigieren und Kontrolle wiederholen |
| Key User | Prozess- oder Stammdatenfrage | fachlich prüfen und dokumentieren |
| Consultant/Support | Setup-, Rollen- oder reproduzierbarer Systembefund | Diagnosepaket übernehmen und Retest steuern |
| sofortiger Stopp | falsche Gesellschaft, fehlender Resetpunkt oder unklare Finanz-/VAT-/Bestandswirkung | nichts schreiben, Zustand sichern, eskalieren |

Ein Supportfall nennt Rolle, Umgebung, Zeitpunkt, Seite/Aktion, Soll/Ist, Fehlertext, letzten erfolgreichen Schritt, Reproduktionsweg und bereinigte Evidence. Zugangsdaten, Cookies, Tokens, Browserprofile sowie reale Bank- oder Personengeheimnisse gehören nicht in Projektartefakte.

## Nächster zulässiger Schritt

`W0-01-read-company-identity` ausführen: interne Company-ID und technischen Namen ausschließlich lesend erfassen und bereinigt zurückgeben.

Danach folgen die übrige CRONUS-Inventur, Fremdmandantengrenze und Reset-/Wiederanlaufprüfung. Erst auf vollständiger Evidence darf zwischen kontrollierter Weiterverwendung und sauberer Neuanlage beziehungsweise Kopie entschieden werden. RUN-06 bis RUN-22 bleiben NO-GO.

## Referenzen

- [Aktuelle Projektstory](../../../evidence/simulation/project-story.json)
- [Nur-Lese-Vorprüfung](../../../evidence/playthru-uabc-basic-de/setup-wave-1-read-only-preflight.yaml)
- [Kontrollierter Run-Plan](../../../evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml)
- [Projektstatus und Ticketwahrheit](bc-basic-project-story.md)
- [Historische Referenzsimulation](99-archive.md)

<!-- story-metadata {"id":"PAGE-UABC-000","title":"00 Hilfe und Projektumgebung","parent":null,"version":7,"status":"published"} -->

---
id: UABC-DISCOVERY
storyPageId: PAGE-UABC-020
title: 01 Discovery und Fit-to-Standard
parent: null
spaceId: UABC-SPACE-CONSULTANT
spaceType: consultant-internal
order: 1
purpose: Interne Moderationsanleitung für schnelle, belastbare Kundenentscheidungen
audience: Consultant, Projektleitung und Solution Architecture
owners:
  - P-002
version: 4
status: published
jiraRefs:
  - UABC-1
  - UABC-10
referenceIds:
  - UABC-ARCH-ENTERPRISE-001
  - UABC-REQ-CAP-001
lastReviewed: 2026-07-12
---

# 01 Discovery und Fit-to-Standard

## Workshopziel und Vorbereitung

Discovery soll nicht möglichst viele Dokumente erzeugen, sondern die wenigen Entscheidungen sichern, die Setup, Datenmigration und UAT steuern.

Diese Seite ist eine interne Anleitung; Ergebnisse und Freigaben werden im Kundenprojekt-Space erfasst.

## Moderationsprinzip und Ergebnis

Drei vorbereitete Workshops reichen für den BC-Basic-Standard, wenn der Kunde die Datenübersicht, Rollen und offenen Entscheidungen vorab liefert. Jeder Workshop endet mit eindeutigen Entscheidungen, Ownern und UAT-relevanten Auswirkungen.

## Fragen, Ablauf und Entscheidungshilfen

### Vorbereitung durch den Kunden

Vor Workshop eins fordert der Consultant folgende Informationen an:

- Gesellschaft, Standorte, Rollen und Verantwortungsgrenzen;
- Konten, Buchungs- und VAT-/USt-Logik sowie Periodenanforderungen;
- Debitoren, Kreditoren, Artikel, Preise, Lagerbestände und offene Posten;
- Bank-, Zahlungs-, Mahn- und Abstimmverfahren;
- Belegvolumen, Varianten, Ausnahmen, Berichte und externe Abhängigkeiten;
- verfügbare Sandbox, Benutzer, Lizenzen und Resetmöglichkeit.

### Workshop 1: Finance, Steuerannahmen und Daten

Teilnehmerrollen sind Sponsor, Finance Key User, Datenverantwortung und Consultant. Der Workshop entscheidet Konten- und Buchungslogik, VAT-/USt-Annahmen, Dimensionen, Perioden, Bankverfahren, Datenobjekte und Abstimmkriterien.

Done ist der Workshop, wenn jede Entscheidung dokumentiert, jede Steuer- oder Rechtsfrage klar gekennzeichnet und jede Datenlieferung mit Owner und Termin versehen ist.

### Workshop 2: Einkauf, Verkauf und Lager

Teilnehmerrollen sind Einkauf, Verkauf, Lager, Finance und Consultant. Der Workshop führt P2P, O2C und Bestand vom Auslöser bis zur Abstimmung durch.

Er grenzt Varianten ein und entscheidet Nummernserien, Zahlungsbedingungen, Lagerorte, Einheiten und Buchungsgruppen.

Done ist der Workshop, wenn Standardfälle, zulässige Ausnahmen, Kontrollpunkte und UAT-Szenarien bestätigt sind.

### Workshop 3: Rollen, UAT, Cutover und Betrieb

Teilnehmerrollen sind Sponsor, Key User, Support, Datenverantwortung und Consultant. Der Workshop entscheidet Rollen und Funktionstrennung, Training, UAT-Verantwortung, Cutoverfenster, Restart, Hypercare und Supportübergabe.

Done ist der Workshop, wenn das Entry-Gate für Setup und UAT, der Eskalationsweg und die GO-/NO-GO-Kriterien eindeutig sind.

### Fit-to-Standard-Moderation

Für jede Anforderung dokumentiert der Consultant Ist-Bedarf, BC-Standardabbildung, Fit oder Gap, Optionen, Empfehlung, Entscheidung, Auswirkung und Owner. Die Auswahl folgt dieser Reihenfolge:

1. Standard unverändert übernehmen.
2. Standard kundenspezifisch parametrisieren.
3. Begründeten Change prüfen.
4. Nicht tragfähigen Bedarf als Out-of-Scope kennzeichnen.

## Qualitätschecks und Eskalation

- Ungeklärte fachliche oder steuerliche Fragen erhalten Owner und Fälligkeit; sie werden nicht durch Annahmen geschlossen.
- Ein Workshop darf nur beendet werden, wenn der nächste Umsetzungsschritt ohne Interpretationslücke möglich ist.
- Zusätzliche Workshops sind nur bei belegtem Gap oder fehlender Entscheidungsfähigkeit sinnvoll.

## Referenzen

- [Consultant-Handbuch und Fast-Track](30-blueprint.md)
- [Umgebung, Einrichtung, Daten und Testdurchführung](60-environment-baseline.md)
- [Produkt: Prozess- und Konfigurationsstandard](31-processes.md)

<!-- story-metadata {"id":"PAGE-UABC-020","title":"01 Discovery und Fit-to-Standard","parent":null,"version":4,"status":"published"} -->

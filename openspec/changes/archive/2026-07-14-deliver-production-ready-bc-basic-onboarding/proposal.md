# Proposal: BC Basic onboarding- und delivery-bereit machen

## Why

Die Kundeninstanz besitzt eine umfangreiche Referenzsimulation und einen validierten Snapshot, trennt aber Plattformbereitschaft, wiederverwendbares Onboarding und reale Kunden-Go-live-Bereitschaft noch nicht in einem einzigen fail-closed Vertrag. Ein neuer Kunde soll ohne Sucharbeit qualifiziert, eingerichtet, migriert, getestet, befähigt und bis zum ersten Abschluss begleitet werden können, ohne synthetische Evidence als reale Freigabe auszugeben.

## What Changes

- Eine maschinenlesbare Readiness-Matrix trennt `platformReady`, `onboardingReady` und `customerGoLiveReady`.
- Ein ausführbares, deutschsprachiges Onboarding-/Delivery-Runbook konsolidiert Qualifizierung, Daten, Sicherheit, Fit-to-Standard, Migration, SIT/UAT, Training, Cutover, Hypercare, Abschluss, VAT und Restore.
- Sanitisierte Eingangsvorlagen und bestehende drei Wissensräume werden verbindlich referenziert.
- Validator und Negativtests prüfen Budget, Wochenabrechnung, Jira-Hierarchie, Deliverables, Transkripte, Spaces, Sicherheit, Daten, Cutover, Abschluss, VAT und Wahrheitsgrenzen.
- Nach fachlichem Commit entsteht ein neuer unveränderlicher Snapshot; ältere Releases bleiben bytegleich.

## Grenzen

Keine BC-Live-Ausführung, keine Kunden-, Steuer- oder Produktivfreigabe, keine externe Bank-, E-Mail-, ELSTER- oder sonstige Übermittlung. Continia bleibt außerhalb des Pilots. Atlassian/Rovo wird nur repositorybasiert simuliert beziehungsweise später manuell materialisiert.

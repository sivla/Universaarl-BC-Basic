# Handover und Abschluss UABC-BCB-001

Produktstatus: **V1_STANDARDPRODUCT_READY**. Neun Lieferobjekte, sieben UAT-Fälle, vier Operatorpfade, Cutover, Restart und drei Hypercaretage sind in der Referenzsimulation abgeschlossen. Der Branchvertrag ist mit Spectra 0.10 validiert und für den rein lesenden Twin vorbereitet.

## Spectra-0.10-Abschluss

Der Abschluss bindet `evidence/simulation/project-reconciliation.json`, `evidence/simulation/adapter-provenance.json`, `exports/project-data/v1/twin-export-map.json`, `evidence/simulation/reference-graph-coverage.json`, `exports/project-data/v1/reference-graph-native.json`, `exports/project-data/v1/reference-graph-mapping.json` und `exports/project-data/v1/reference-graph-portable.json`. Damit kann der Twin Baseline, Angebot, Ist und die Differenz zwischen 252 nativen Relationen und 328 portablen Kanten erklaeren. Eine produktive Leistung, Rechnung, Zahlung, Schreibberechtigung oder 1:1-Vollstaendigkeitsbehauptung wird nicht abgeleitet.

**Page-ID:** PAGE-UABC-180 · **Version:** 2 · **Status:** published · **Datum:** 03.09.2026

Synthetisch übergeben wurden Datenpaket, Setup- und Playthrough-Katalog, UAT-/Trainingsnachweis, Cutover-Generalprobe, Hypercare-Dailies, Restart-Checkpoint und Entry-Ledger. Der wiederholbare Smoke-Test besteht aus `npm run validate:project-story`, `npm run validate:bc-playthrough` und `npm run validate:snapshot-contract`.

Der Support-Backlog enthält nur den optionalen realen BC-Lauf. P1/P2-Simulationsdefects sind geschlossen. Lessons Learned: Freigaben vor Konfiguration, Kontrollsummen vor Buchung, Rücksetzung vor Mutation und Evidence direkt am Ticket. Eine produktive Übergabe oder echte Kundenabnahme wird nicht behauptet.

## Kundenbefähigung und Betriebsübergabe

Die Referenzsimulation hat die vier Rollenpfade aus `project/bc-basic/training-plan.yaml` vollständig durchgespielt. In einem echten Kundenprojekt ist die Übergabe erst abgeschlossen, wenn die benannten Benutzer ihre UAT-Fälle und Übungen selbst wiederholt haben, Navigation und Fehlerweg beherrschen, Beleg- und Entry-Ketten erklären können und der Kompetenzcheck durch Trainer und Teilnehmerrolle bestätigt ist.

`P-001` bestätigt den Betriebsübergang, `P-002` übergibt Runbook und Supportbestand, `P-005` übernimmt Finance/Abschluss, `P-011` Einkauf/Verkauf, `P-016` Datenqualität und `P-019` Lager/Inventur. Der Mindestübergang umfasst Benutzer-/Berechtigungsliste, freigegebene Perioden, Cutoverkontrollsummen, offene Posten, Lagerbestand, Supportweg, Prioritätsdefinition, Tageskontrolle und Wiederanlaufpunkt. Reale Benutzerbefähigung, Sandboxbuchung und produktive Betriebsannahme werden im Kundenprojekt separat belegt.

Der Operator-Smoke-Test `UABC-SMOKE-BCB-OPERATOR-001` wird am ersten Arbeitstag und während Hypercare täglich wiederholt. Support übernimmt einen Fall nur mit Rolle, Umgebung, Version, Seite/Aktion, Belegnummer, letztem erfolgreichen Schritt, Fehlertext, Soll/Ist, Kontrollwerten, sicherer Evidence, Reproduktionsweg, Rücksetzpunkt, Auswirkung und Eskalationsausgang. Damit bleibt die Diagnose reproduzierbar und frei von Zugangsdaten oder realen Bank-/Personengeheimnissen.

Der finale Handover enthält außerdem den Spectra-konformen Abgleich `evidence/simulation/project-reconciliation.json`, die read-only Herkunftsbindung `evidence/simulation/adapter-provenance.json` und die daraus erzeugte Allowlistprojektion `exports/project-data/v1/twin-export-map.json`. Damit kann der Twin Baseline, Angebot, Ist und Exportherkunft darstellen, ohne BC Basic zu überschreiben oder eine produktive Leistung, Rechnung, Buchung oder Zahlung abzuleiten.

Für eine reale Kundeninstanz bleiben exakt zu parametrisieren: Sponsor/Owner und Termine; Tenant, Zielgesellschaft, Lizenz, BC-Version und deutsche Lokalisierung; Benutzer, Profile und Permission Sets; Konten, VAT-/UStVA-Kennzeichen und Steuerberaterentscheidung; Datenquellen, Volumina, Anfangssalden und offene Posten; Bank-, Zahlungs-, Mahn- und Dokumentparameter; Sandbox-Schreibrecht, Rücksetz-/Wiederanlaufpunkt; echte UAT-, Cutover-, Hypercare- und Betriebsannahme. Diese Parameter durchlaufen das bestehende Entry-Gate und ändern das V1-Produkt nicht.

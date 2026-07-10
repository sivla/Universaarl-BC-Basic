# Delivery Plan

## Wellen

| Welle | Ergebnis | Detailgrad jetzt | Eintrittsgate | Austrittsnachweis |
| --- | --- | --- | --- | --- |
| W0 Blueprint | Freigegebenes Unternehmens-, Prozess- und Architekturzielbild | detailliert | V2-Repo und Quellenbaseline | OpenSpec/Referenzen gruen, fachlicher Review, menschliche Freigabe |
| W1 Foundation & Strategy | Lizenzen, deutsche Finance, Administration, Security, Dimensionen, lokale Financial Reports; IC-Partner-/Konten-/Dimensionsmapping fuer UAS->UAD; Migrationsstrategie, Dateninventar/Owner/Vorlagen, Teststrategie und Trainings-/Adoptionsplan | naechste Welle: Epics/Stories erst nach W0-Freigabe detaillieren | Sandbox-/Versions-/Lokalisierungsnachweis sowie Legal-/Tax-/Licensing-Entscheidungen | kontrollierte Setup-Evidence, R2R-Smoke-Test, lokaler Report-/Dimensionscheck, freigegebene Workstream-Plaene und Dateninventar |
| W2 Trade, Basic Logistics & Mock 1 | Einkauf, Verkauf, Preise/Rabatte, Retouren, Vorauszahlungen, Artikel, Planung, Bestand, Basic Warehouse und produktiver Designnachweis UAS->UAD IC; Datenmapping/-bereinigung, Mock Load 1 und fruehe Key-User-Tests | Roadmap | W1 Finance/Dimensionen/IC-Mapping stabil, Datenowner und kontrollierte Vorlagen bereit | P2P/O2C/Returns/Inventory/Basic-Warehouse/IC-E2E sowie Mock-1-Counts, Fehler und Reconciliation |
| W3 Operations, Mock 2 & Integration | Advanced-Warehouse-PoC, Manufacturing, Projects, Service Items/Orders, Anlagen; Mock Load 2, integrierte Prozess-/IC-Tests und Trainingsentwicklung | Roadmap | W2 Stamm-/Bestandsqualitaet, UAS->UAD IC-Grundroute und Premium-Lizenzentscheidung | Modul-E2E, Mock-2-Reconciliation, integrierte Testergebnisse, Trainingsentwuerfe und Advanced-Go/No-Go |
| W4 UAT, Group Close & Rehearsal | UAT-Datenlauf, fachliche UAT-Abnahme, Train-the-Trainer und Cutover-Probe; Service Contracts; UAD/UAS->UAP- und UAM->Gruppe-Belegfluesse vor vollstaendiger IC-Abstimmung, Konsolidierung und Konzernreporting | Roadmap | integrierte Tests bestanden, kritische Defekte dispositioniert, lokale Abschluesse, UAS->UAD-Grundroute und Servicebasis stabil | Business-Owner-UAT, Reconciliation, Cutover-Zeitplan/-Probe, alle geplanten IC-Gegenbelege, IC-Abstimmung, Konsolidierung, Contract Billing und Group-Report-Drilldown |
| W5 Go-live & Hypercare | finaler Load, Endanwendertraining, Cutover, Hypercare und optional Power BI | Roadmap | UAT-/Daten-/Training-/Support-Readiness und geprobter Cutover; menschliches Go/No-Go | Final-Reconciliation, Trainingsnachweis, Cutover-Sign-off, Hypercare-Metriken/-Exit; Power-BI-Go/No-Go separat |

## Abhaengigkeiten und Reihenfolge

Legal-/Lizenz-/Lokalisierungsentscheidungen -> Konten/Buchungsgruppen/Dimensionen/Sicherheit und lokale Financial Reports -> Stammdaten-/Synchronisationsgrenzen plus IC-Partner-/Konten-/Dimensionsmapping -> UAS->UAD IC-Grundroute und Trade/Bestand/Basic Warehouse -> Advanced Warehouse und modulare Operations -> vollstaendige IC-Abstimmung/Konsolidierung/Konzernreporting -> Cutover und Hypercare -> optional Power BI. Datenmigration, Tests, UAT-Vorbereitung, Training und Adoption laufen dabei als W1-W5-Workstreams und nicht als nachgelagerter Block. Projekte und Service duerfen fachlich vorbereitet werden, aber keine Produktions- oder Servicebuchung vor stabilen Finance-/Artikel-/Bestandsgrundlagen.

## Projektbegleitende Workstreams

| Workstream | W1 | W2 | W3 | W4 | W5 |
| --- | --- | --- | --- | --- | --- |
| Daten & Konfiguration | Strategie, Inventar, Owner, Objektklassen, Configuration Worksheet/Packages/Templates und kontrollierte Excel-Vorlagen | Mapping, Bereinigung, Mock Load 1 | Mock Load 2 und integrierte Reconciliation | UAT-Datenlauf, Reconciliation und Cutover-Probe | finaler Load und Final-Reconciliation |
| Testing & UAT | Teststrategie, Prozesse, Rollen, Umgebungen, Exitkriterien | fruehe Key-User- und Komponententests | integrierte E2E-/IC-Tests mit Mock-2-Daten | formale UAT durch jeweilige Business Owner | Cutover-Smoke-Test und Hypercare-Regression |
| Training & Adoption | Zielgruppen, Lernziele, Trainer, Kommunikation und Messung planen | Key User einbinden und Prozessdeltas pflegen | Materialien aus verifizierten Szenarien entwickeln | Train-the-Trainer und Readiness pruefen | Endanwendertraining, Floor Support und Adoption messen |
| Cutover & Support | Strategie, Rollen und erste Runbook-Struktur | Objektfolge und Zeitannahmen pflegen | Supportmodell, Monitoring und Eskalation konkretisieren | Dress Rehearsal, Go/No-Go-Kriterien und Supportuebergabe | Cutover, Hypercare mit Exitkriterien und Uebergabe |

Standard-first-Datenroute: Setupdaten werden ueber Configuration Worksheet und reviewte Configuration Packages organisiert; Stammdaten ueber kontrollierte Excel-Dateien/Packages mit Configuration Templates fuer freigegebene Defaults; offene Posten und Anfangsbestaende objektbezogen mit Nebenbuch-/Sachbuch- und Mengen-/Wertabgleich; gebuchte Historie wird nicht als scheinbar operative Historie per Configuration Package nachgebaut, sondern verbleibt in einem zugreifbaren Altarchiv oder wird nur nach eigener Scope- und Auditentscheidung uebernommen.

## Verantwortungen

- Sponsor/Freigabe: P-001
- Finance/Group Design Authority: P-003
- Solution/Change Owner: P-002
- Platform/Security: P-004
- Data Governance/Migration: P-016; Reconciliation P-005/P-017/P-018, Produktions-/Bestandswert P-006
- Training/Adoption: P-015 koordiniert; modulare Key User entwickeln und liefern Fachtraining
- Testing/UAT: P-002 koordiniert; jeweilige Business Process Owner nehmen fachlich ab
- Process Owner: gemaess Personen- und Capability-Matrix in `design.md`

## Nachweisstrategie

- W0: CLI-Validierung, Referenzpruefung, Quellenregister und dokumentiertes Review.
- Spaetere Writes: unmittelbar vorher Environment + BC-Unternehmen + Zielseite verifizieren.
- Geschaeftsprozesse: sichtbarer UI-Weg plus gebuchte Daten-/Postenkette; API/Paket nur transparent fuer Arrange/Cleanup.
- High-impact: Zweck, Sollzustand, Akzeptanzkriterium und Reset/Backup vor Ausfuehrung im Change.
- Jeder Lauf: synthetischer Datensatz, eindeutige Run-ID, chronologische Screenshots, Ergebnis und Resetstatus.

## Gates

1. Blueprint Gate: Architektur, Scope, offene Entscheidungen und Wellen akzeptiert.
2. Environment Gate: `playthru`, Unternehmen, Version, Sprache, Apps und Rollen belegt.
3. Configuration Gate: Reviewfaehiger Change mit Reset und Testfall freigegeben.
4. Process Gate: E2E-Szenario fachlich und technisch verifiziert.
5. Release Gate: UAT, Migration, Training, Cutover-Rehearsal und Support-Readiness menschlich freigegeben.

Waehrend aktiver Delivery bleibt WIP=1. Nach regelkonformer Archivierung ist WIP=0 zulaessig, bis der naechste Change bewusst gestartet wird. Ein neuer Change startet erst nach Review, Verifikation, Freigabe und Archivierung des aktuellen Changes.

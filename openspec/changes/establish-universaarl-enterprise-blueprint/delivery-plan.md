# Delivery Plan

## Wellen

| Welle | Ergebnis | Detailgrad jetzt | Eintrittsgate | Austrittsnachweis |
| --- | --- | --- | --- | --- |
| W0 Blueprint | Freigegebenes Unternehmens-, Prozess- und Architekturzielbild | detailliert | V2-Repo und Quellenbaseline | OpenSpec/Referenzen gruen, fachlicher Review, menschliche Freigabe |
| W1 Foundation | Unternehmen, Finance, Administration, Security, Kernstammdatenrahmen | naechste Welle: Epics/Stories erst nach W0-Freigabe detaillieren | Sandbox-/Versionsnachweis, DEC/OQ Finance geklaert | kontrollierte Setup-Evidence und R2R-Smoke-Test |
| W2 Trade & Logistics | Einkauf, Verkauf, Artikel, Bestand, Basic/Advanced Warehouse | Roadmap | W1 stabil, Datenowner bereit | P2P/O2C/Inventory/Warehouse E2E-Evidence |
| W3 Operations | Produktion, Projekte, Service, Anlagen | Roadmap | W2 Stamm-/Bestandsqualitaet | je Modul ein gebuchtes E2E-Szenario und Reset |
| W4 Group & Insight | Intercompany, Konsolidierung, Reporting, optionale Integrationen | Roadmap | lokale Abschluesse und IC-Mapping | IC-Abstimmung, Konsolidierung und Drilldown |
| W5 Adoption & Cutover | Migration, UAT, Training, Cutover, Hypercare | Roadmap | Prozess- und Datenfreigabe | Reconciliation, UAT/Training Sign-off, Cutover-Rehearsal |

## Abhaengigkeiten und Reihenfolge

Organisations-/Konten-/Dimensionsmodell -> Sicherheit und Kernsetup -> Stammdaten -> Trade/Bestand -> modulare Operations -> IC/Konsolidierung/Reporting -> Migration/UAT/Training/Cutover. Projekte und Service duerfen fachlich vorbereitet werden, aber keine Produktionsbuchung vor stabilen Finance-/Artikel-/Bestandsgrundlagen.

## Verantwortungen

- Sponsor/Freigabe: P-001
- Finance/Group Design Authority: P-003
- Solution/Change Owner: P-002
- Platform/Security: P-004
- Data Governance: P-016
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
5. Release Gate: UAT, Migration, Training und Cutover-Rehearsal freigegeben.

Waehrend aktiver Delivery bleibt WIP=1. Nach regelkonformer Archivierung ist WIP=0 zulaessig, bis der naechste Change bewusst gestartet wird. Ein neuer Change startet erst nach Review, Verifikation, Freigabe und Archivierung des aktuellen Changes.

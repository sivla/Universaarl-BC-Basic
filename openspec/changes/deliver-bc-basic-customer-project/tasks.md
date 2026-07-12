# Aufgaben

## 0. Versionierter Uebergabevertrag

- [x] 0.1 BCProjectOS-Releasebindung, BC-Basic-Consumerbindung, zweistufigen Snapshotvertrag, Schema, Generator, Validator und deterministische Negativpruefungen fail-closed synchronisieren; diese technische Aufgabe erteilt keine operative oder menschliche Freigabe.
- [x] 0.2 Lokale Repository-Inventur und Migrationsvertrag fuer `Universaarl-BC-Basic` dokumentieren: aktuelle Remote-/Branch-/Commit-/Tree-Identitaet erhalten, Zielbranch `main` und Arbeitsbranches `codex/...` festlegen, spaeteren Agenten-Push/PR auf den eigenen Arbeitsbranch begrenzen und Merge/Tag/Release beim Kontrollzentrum belassen; keine fachlichen Daten, IDs, Spectra- oder Snapshotfelder aendern.

## 1. Phase 1 - Vorbereitung, Anforderungen und Datenbereitschaft

- [x] 1.1 Projektauftakt, Umfang, Rollen, Tagessatz und Besprechungsrhythmus bestaetigen (`UABC-22`, 2 h). Evidence: `project/bc-basic/project-plan.yaml`, `evidence/simulation/project-story.json`.
- [x] 1.2 Finanz- und Steuerarbeitsrunde mit offenen Freigaben dokumentieren (`UABC-23`, 4 h). Evidence: `project/bc-basic/decision-register.yaml`, `project/bc-basic/bc-playthrough-catalog.yaml`.
- [x] 1.3 Einkauf-, Verkauf- und Lagerprozess standardnah entscheiden (`UABC-24`, 4 h). Evidence: `project/bc-basic/bc-playthrough-catalog.yaml`, `evidence/simulation/bc-playthrough-ledger.yaml`.
- [x] 1.4 Acht getrennte Blanko-/Beispielpaare und den Datenbereitschaftscheck liefern; Konfigurationspakete als Dienstleisterwerkzeug planen (`UABC-25`, 5 h). Evidence: `project/bc-basic/customer-templates/`, `project/bc-basic/data-readiness-check.yaml`.
- [x] 1.5 Loesungs-, Pruef- und Abnahmeplan mit genau sieben geplanten UAT-Pflichtfaellen freigeben lassen (`UABC-26`, 3 h). Evidence: `project/bc-basic/uat-catalog.yaml`, `project/bc-basic/uat-training-run.yaml`, `evidence/simulation/project-story.json`.

## 2. Phase 2 - Einrichtung und Schulung in einer Woche

- [x] 2.1 Exakte Gesellschaft binden, Grundeinrichtung und minimale Rollen konfigurieren (`UABC-27`, 4 h). Evidence: `project/bc-basic/customer-templates/example/company-setup.example.yaml`, `evidence/simulation/bc-playthrough-ledger.yaml`.
- [x] 2.2 Finanzwesen, SKR04, Konten, Buchungsgruppen, MwSt. und Dimensionen konfigurieren (`UABC-28`, 10 h). Evidence: `project/bc-basic/customer-templates/example/`, `evidence/simulation/phase-2-p2p-o2c.yaml`.
- [x] 2.3 Konfigurationspakete erstellen, freigegebene Stammdaten kontrolliert importieren und abstimmen (`UABC-29`, 4 h). Evidence: `project/bc-basic/data-package.yaml`, `project/bc-basic/data-readiness-check.yaml`.
- [x] 2.4 Einkaufsprozess konfigurieren und durchspielen (`UABC-30`, 5 h). Evidence: `evidence/simulation/phase-2-p2p-o2c.yaml`, `evidence/simulation/bc-playthrough-ledger.yaml`.
- [x] 2.5 Verkaufsprozess konfigurieren und durchspielen (`UABC-31`, 5 h). Evidence: `evidence/simulation/phase-2-p2p-o2c.yaml`, `evidence/simulation/bc-playthrough-ledger.yaml`.
- [x] 2.6 Einfaches Lager und Bestand konfigurieren und durchspielen (`UABC-32`, 5 h). Evidence: `evidence/simulation/phase-3-cash-inventory-close.yaml`, `evidence/simulation/bc-playthrough-ledger.yaml`.
- [x] 2.7 Rollenbezogene Schulungen protokollieren (`UABC-33`, 4 h). Evidence: `project/bc-basic/training-plan.yaml`, `project/bc-basic/uat-training-run.yaml`.
- [x] 2.8 Playwright-Ende-zu-Ende-Pflichtfaelle, fachlichen Abnahmetest, UAT-Begleitung und Nachweise durchfuehren (`UABC-34`, 3 h). Evidence: `playwright/scenarios/bc-basic-e2e.yaml`, `project/bc-basic/uat-training-run.yaml`, `evidence/simulation/project-story.json`.

## 3. Phase 3 - Einwoechige Hypercare

- [x] 3.1 UAT- und Hypercare-Befunde priorisieren und begrenzt bearbeiten (`UABC-35`, 2 h). Evidence: `atlassian/confluence/pages/bc-basic-hypercare.md`, `evidence/simulation/project-story.json`.
- [x] 3.2 Monatsabschlussprozess in der Sandbox proben und Abstimmungen dokumentieren (`UABC-36`, 3 h). Evidence: `evidence/simulation/phase-3-cash-inventory-close.yaml`.
- [x] 3.3 UStVA-Vorschau fachlich pruefen, aber nicht uebermitteln (`UABC-37`, 2 h). Evidence: `evidence/simulation/phase-3-cash-inventory-close.yaml`, `project/bc-basic/uat-catalog.yaml`.
- [x] 3.4 Schulungsunterlagen, Projektdokumentation und Uebergabe abschliessen (`UABC-38`, 3 h). Evidence: `docs/handover/bc-basic-handover.md`, `docs/reports/bc-basic-project-chronicle.md`, `evidence/simulation/project-story.json`.

## 4. Steuerung und Abschluss

Diese Kontrollhandlungen erzeugen keine zusaetzlichen abrechenbaren Stunden, kein eigenes Jira-Arbeitsprotokoll und keine reale Rechnungszeile. Die historische 68-Stunden-Kalkulation bleibt nachvollziehbar; der abgeschlossene synthetische Angebots-/Ist-Abgleich verwendet versioniert 80 Stunden und 9.600 EUR.

- [x] 4.1 Genehmigte Jira-Istzeiten der Arbeitspakete `UABC-22` bis `UABC-38` im synthetischen Playthrough woechentlich pruefen und den Ticket-/Angebotsabgleich durchführen; Schaetzungen, Elternsummen und nicht entschiedene Budgetlimits nicht fakturieren. Evidence: `evidence/simulation/billing-reconciliation.yaml`. Die Evidence ist ausdrücklich synthetisch und erzeugt keine reale Rechnung oder Freigabe.
- [x] 4.2 Innerhalb von `UABC-34`, `UABC-36`, `UABC-37` und `UABC-38` alle geplanten Verifikationen ausfuehren und fachliche Freigaben von technischen Nachweisen trennen. Evidence: `scripts/validate-project-story.mjs`, `scripts/validate-bc-playthrough.mjs`, `scripts/validate-simulation-evidence.mjs`, `tests/governance/`.
- [x] 4.3 Innerhalb von `UABC-38` den Projektindex und die Konsumentenbindung aus den Quellartefakten validieren; der Twin bleibt ausschliesslich lesender Konsument. Eine Bereitstellung setzt eine separat nachgewiesene Twin-Identitaet sowie einen validierten, versionierten Snapshot voraus. Evidence: `exports/project-data/v1/index.yaml`, `governance/consumer-bindings.yaml`, `scripts/validate-snapshot-contract.mjs`.
- [x] 4.4 Innerhalb von `UABC-38` nach vollstaendigem Abschlusspruefpunkt die Aenderung zur Archivierung und den Projektstatus zur Abnahme vorlegen. Evidence: `evidence/verification-register.yaml`, `openspec/changes/deliver-bc-basic-customer-project/verification.md`. Eine tatsaechliche externe Archivierungsfreigabe wird nicht behauptet.

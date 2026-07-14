---
classification: historical-reference-simulation
currentAuthority: false
archivedAt: 2026-07-13
supersededBy: evidence/simulation/project-story.json
currentRollupContribution: false
---

# Historischer Demo- und Abnahmeleitfaden der abgelösten Referenzsimulation

## Zweck und Wahrheitsgrenze

Dieser Leitfaden bewahrt ausschließlich den am 13.07.2026 abgelösten repositorybasierten Referenzlauf. Er verwendet synthetische Daten und Dateien. Sein internes `GO_SIMULATION` ist weder aktueller Pilotstatus noch produktive BC-Ausführung, Kundenfreigabe oder UStVA- beziehungsweise sonstige Übermittlung und trägt zu keinem aktuellen Rollup bei.

## Eingangskontrolle

1. Branch `codex/universaarl-projekt` und ein sauberer Arbeitsbaum werden geprüft.
2. `npm run validate:snapshot-contract` muss den aktuellen Branch-Index erfolgreich validieren.
3. Die Spectra-Bindung muss `BOUND` mit Release `spectra-v0.1.0-alpha.2` und Evidence `evidence/spectra-release-0.1.0-alpha.2.yaml` sein.
4. Die Simulationsevidence muss `classification: synthetic-only`, `realBcExecution: false` und die synthetischen Gates als abgeschlossen ausweisen.

## Vorführung in sechs Stationen

| Station | Quelle | Nachweis des Laufs | Gate |
| --- | --- | --- | --- |
| 1. Projekt und Daten | `project/bc-basic/data-package.yaml`, `project/bc-basic/data-readiness-check.yaml` | acht synthetische Datenbereiche, Referenz- und Summenprüfung | synthetisch bereit |
| 2. P2P/O2C | `evidence/simulation/phase-2-p2p-o2c.yaml` | Belegfolge, Konten-/MwSt.-Wirkung, Defect und Re-Test | synthetisch abgenommen |
| 3. Cash/Lager/Abschluss | `evidence/simulation/phase-3-cash-inventory-close.yaml` | Zahlungen, Bankabstimmung, Inventur, Abschluss und UStVA-Vorschau | synthetisch abgenommen |
| 4. UAT und Schulung | `project/bc-basic/uat-training-run.yaml`, `project/bc-basic/training-plan.yaml` | sieben UAT-Fälle, vier Rollenläufe, Coverage | synthetisch abgenommen |
| 5. Cutover/Hypercare | `evidence/simulation/project-completion.yaml` | Freeze, Rollback, Wiederanlauf, drei Hypercare-Tage | `GO_SIMULATION` |
| 6. Übergabe | `project/bc-basic/traceability-matrix.yaml`, `project/bc-basic/deliverables.yaml` | Rückverfolgbarkeit und Deliverable-Register | synthetisch abgenommen |

## Abnahmeausgabe

Die historische synthetische Abnahme war nur grün, wenn alle sechs Stationen und der damalige Indexvalidator grün waren. Für diesen abgelösten Referenzstand lautete die Ausgabe `GO_SIMULATION`: Alle damaligen Projektgates waren innerhalb der Simulation durchgeführt und bestanden; diese Aussage ist kein aktueller Pilotstatus und belegt keinen realen BC-Lauf.

## Nicht zulässige Schlussfolgerungen

Aus dieser Demo dürfen weder produktive Buchungen, echte Benutzerfreigaben, Steuerfreigaben noch ein abgeschlossener Go-live abgeleitet werden. Ein späterer realer Lauf muss die gleichen Stationen mit echter Umgebung, echter Evidence und menschlicher Entscheidung wiederholen.

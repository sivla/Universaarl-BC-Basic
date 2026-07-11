# Demo- und Abnahmeleitfaden: synthetischer BC-Basic-Projektstand

## Zweck und Wahrheitsgrenze

Dieser Leitfaden führt einen unabhängigen Leser durch die vollständig repositorybasierte Generalprobe. Er verwendet ausschließlich synthetische Daten und Dateien. Die Ausgabe `GO_SIMULATION` ist keine produktive BC-Ausführung, keine Kundenfreigabe und keine UStVA- oder sonstige Übermittlung.

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

Die synthetische Abnahme ist nur dann grün, wenn alle sechs Stationen und der Indexvalidator grün sind. Für den aktuellen Stand lautet die zulässige Ausgabe `GO_SIMULATION`: Alle Projektgates sind innerhalb der Simulation durchgeführt und bestanden; ein realer BC-Lauf ist nicht Teil dieser Aussage.

## Nicht zulässige Schlussfolgerungen

Aus dieser Demo dürfen weder produktive Buchungen, echte Benutzerfreigaben, Steuerfreigaben noch ein abgeschlossener Go-live abgeleitet werden. Ein späterer realer Lauf muss die gleichen Stationen mit echter Umgebung, echter Evidence und menschlicher Entscheidung wiederholen.

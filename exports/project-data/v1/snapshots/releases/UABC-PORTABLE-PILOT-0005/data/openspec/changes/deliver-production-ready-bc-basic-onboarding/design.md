# Design: Produktionsreifes BC-Basic-Onboarding

## Führende Quellen

`governance/production-readiness.json` ist der kanonische Readiness-Vertrag. Er referenziert bestehende Projekt-, Jira-, Confluence-, Daten-, Test-, Trainings- und Evidence-Quellen, ohne sie zu duplizieren. `docs/runbooks/bc-basic-onboarding-delivery.md` ist die lesbare Ausführungsprojektion.

## Wahrheitsmodell

- `platformReady.status=passed`: Repository, Verträge, Validatoren und Werkzeuge sind reproduzierbar verfügbar.
- `onboardingReady.status=passed`: Eingaben, Rollen, Vorlagen, Entscheidungen, Runbooks und Prüfpunkte sind für einen neuen Kunden vorbereitet.
- `customerGoLiveReady.status=pending`: bleibt offen, bis alle acht realen Evidence-Arten vorliegen.
- `simulationReference=SIMULATED_COMPLETE`: beweist ausschließlich die synthetische Referenzgeschichte.

## Ablauf

Der Delivery-Pfad folgt drei Phasen: ausführliche Vorbereitung und Discovery, eine standardisierte Einrichtungswoche, danach Go-live/Hypercare bis zur ersten Abschluss- und UStVA-Vorschau. Task-Worklogs sind die einzige Abrechnungsquelle. Jede reale Freigabe besitzt ein eigenes Gate und darf nicht aus historischer oder synthetischer Evidence abgeleitet werden.

## Snapshot

Nach dem fachlichen Commit wird ein neuer unveränderlicher portabler Snapshot aus dessen sauberem Commit erzeugt. Die Releases `UABC-PORTABLE-PILOT-0001` bis `0004` bleiben bytegleich. Der Snapshot ist Auditprojektion, keine zweite Projektwahrheit.

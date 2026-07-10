# Universaarl Business Central Blueprint V2

Greenfield-Planungsrepository fuer eine evidence-basierte Microsoft Dynamics 365 Business Central Implementierung. OpenSpec ist fuehrend; Jira und Confluence werden lokal simuliert.

## Arbeitsregeln

- Null oder ein aktiver Change unter `openspec/changes/`; waehrend Delivery gilt WIP=1, nach Archivierung bis zum naechsten Start WIP=0.
- `openspec/specs/` enthaelt nur freigegebene und nachgewiesene Wahrheit. Der Blueprint v0.1 liegt bis zur menschlichen Freigabe im aktiven Change.
- Zielsystem fuer spaetere Ausfuehrung ist ausschliesslich die Sandbox `playthru` mit synthetischen Daten.
- Kein BC-Livezugriff und keine Playwright-Ausfuehrung im Blueprint-Change.
- Jira/Confluence referenzieren stabile fachliche IDs; deren Lebenszyklusaufloesung steht in `governance/reference-lifecycle.yaml`.
- Dauerhafte Architektur, Capabilities und Verification liegen strukturiert unter `architecture/`, `capabilities/` und `evidence/`.

## Reproduzierbarer Einstieg

Voraussetzung: Node.js >= 20.19.

```powershell
npm ci
npm test
```

OpenSpec ist als exakte Dev-Dependency gepinnt. Direkte Aufrufe erfolgen mit `npm exec openspec -- <command>`.

## Aktiver Change

`establish-universaarl-enterprise-blueprint`

# Referenzlebenszyklus

Jira und Confluence referenzieren ausschliesslich stabile fachliche IDs wie `UABC-REQ-ENT-001`, `UABC-CAP-FIN-R2R` oder `UABC-VER-LOCAL-001`. Pfade unter `openspec/changes` sind Arbeitsorte und keine dauerhaften Schnittstellen.

Aufloesungsreihenfolge:

1. **Freigegeben:** `openspec/specs/**/spec.md` ist die aktuelle normative Wahrheit.
2. **Aktiv:** Solange keine freigegebene Fassung derselben ID existiert, wird maximal ein aktiver Change unter `openspec/changes/*/specs` als vorgeschlagene Wahrheit aufgeloest.
3. **Archiviert:** `openspec/changes/archive/*/specs` ist nur historischer Fallback und Auditspur, nie bevorzugte aktuelle Wahrheit.

Dauerhafte Architektur, Capabilities und Verification-Nachweise liegen in strukturierten kanonischen Dateien ausserhalb des Change-Ordners. Vor einer echten Archivierung muessen menschliche Freigabe, Statuswechsel `proposed -> approved`, alle als archivierungsrelevant markierten Verifications und die semantische Synchronisation der OpenSpec-Specs nachgewiesen sein. `npm run validate:archive-ready` erzwingt dieses Gate. Der rohe OpenSpec-Archive-Befehl allein erteilt keine fachliche Freigabe.

Bei einem spaeteren Change bleiben IDs stabil. Aendert sich die Bedeutung inkompatibel, entsteht eine neue ID; die alte wird `superseded` und verweist auf den Nachfolger.

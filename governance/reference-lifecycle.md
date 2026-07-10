# Referenzlebenszyklus

Jira und Confluence referenzieren ausschliesslich stabile fachliche IDs wie `UABC-REQ-ENT-001`, `UABC-CAP-FIN-R2R` oder `UABC-VER-LOCAL-001`. Pfade unter `openspec/changes` sind Arbeitsorte und keine dauerhaften Schnittstellen.

Aufloesungsreihenfolge:

1. **Freigegeben:** `openspec/specs/**/spec.md` ist die aktuelle normative Wahrheit.
2. **Aktiv:** Solange keine freigegebene Fassung derselben ID existiert, wird maximal ein aktiver Change unter `openspec/changes/*/specs` als vorgeschlagene Wahrheit aufgeloest.
3. **Archiviert:** `openspec/changes/archive/*/specs` ist nur historischer Fallback und Auditspur, nie bevorzugte aktuelle Wahrheit.

Dauerhafte Architektur, Capabilities und Verification-Nachweise liegen in strukturierten kanonischen Dateien ausserhalb des Change-Ordners. Vor einer echten Archivierung muessen das im aktiven Change explizit deklarierte Approval-Policy-Gate, der Statuswechsel `proposed -> approved`, alle archivierungsrelevanten Verifications, strict-valide Delta-Specs und ein semantisch passender kanonischer Zustand nachgewiesen sein. Die Main-Spec entsteht beziehungsweise aendert sich ausschliesslich durch den OpenSpec-Archivierungs-/Merge-Weg. Fuer neue Universaarl-Changes ist das Gate ausdruecklich automatisiert; historische menschliche Freigaben bleiben als Audit-Historie erhalten. Nach Archivierung prueft die Normalvalidierung erhaltene Policy-Metadaten, Pflichtnachweise und den weiterhin governing kanonischen Zustand. `npm run validate:archive-ready` umfasst Schema, OpenSpec strict und Custom Validator; der rohe OpenSpec-Archive-Befehl allein erteilt keine Freigabe.

Bei einem spaeteren Change bleiben IDs stabil. Aendert sich die Bedeutung inkompatibel, entsteht eine neue ID; die alte wird `superseded` und verweist auf den Nachfolger.

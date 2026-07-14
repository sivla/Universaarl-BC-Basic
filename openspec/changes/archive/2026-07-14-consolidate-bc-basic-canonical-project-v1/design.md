# Design

1. `evidence/simulation/project-story.json` und die daran gebundenen Projektvertraege werden zur einzigen aktuellen Fachwahrheit.
2. `simulationStatus=simulated-complete`, `currentAuthority=true` und `realExecution=false` werden als fail-closed Vertrag modelliert.
3. Der bestehende historische offene Pilotstand bleibt nur als klar markierte Provenienz ausserhalb des aktuellen Rollups bestehen.
4. Ein neuer Validator prueft Status-, Kosten-, Ticket-, Worklog-, Gate- und Truth-Boundary-Konsistenz sowie Negativfaelle.
5. Generatoren, Confluence-Index, Dokumentkatalog und Twin-Allowlist werden aus den kanonischen Quellen aktualisiert. Der moderne Snapshot bleibt der saubere Branch-Commit; historische Portable-Evidence bleibt separat.

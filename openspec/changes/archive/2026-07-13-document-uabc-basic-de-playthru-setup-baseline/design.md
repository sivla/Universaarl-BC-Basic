# Design

## Eine Beobachtung und eine Zielbaseline

`evidence/playthru-uabc-basic-de/setup-baseline.yaml` bewahrt ausschliesslich die beobachtete reale Pilotaktion. `project/bc-basic/pilot-setup-baseline.yaml` definiert die daraus abgeleitete Ziel- und Reihenfolgebaseline. Beobachtung und Plan duerfen einander nicht hochstufen.

## Sicherheitsgrenze

Der Bedienakteur ist technische Browser-/Codex-Automation. Kajetan Kalicki traegt fachliche Verantwortung und Review, wird aber nicht als automatischer Klickakteur ausgegeben. Secrets, Authentisierung, URLs, Sessions und Telemetrie sind ausgeschlossen.

## Abhaengigkeiten

PRESEED und CORE-FINANCE gehen TRADE-MASTER voraus; TRADE-MASTER geht OPENING-DATA voraus. Gebuchte Ledger-Tabellen sind nie Paketinhalt. Eroeffnungswerte und offene Posten entstehen spaeter kontrolliert ueber Journals und Buchungen.

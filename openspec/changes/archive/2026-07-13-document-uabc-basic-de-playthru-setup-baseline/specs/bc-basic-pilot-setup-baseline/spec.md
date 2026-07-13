# BC-Basic-Pilot-Setup-Baseline

## ADDED Requirements

### Requirement: Reale Pilotbeobachtung bleibt begrenzt

Das System MUST die beobachtete Gesellschaftserstellung, Versionen, Zuordnung und Paketgerueste getrennt von Zielsetup und Datenwirkung dokumentieren.

#### Scenario: Leeres Paketgeruest

- **WHEN** ein Paket 0 Tabellen und 0 Datensaetze besitzt
- **THEN** darf weder Setup- noch Datenwirkung behauptet werden

### Requirement: Firmenstammdaten bleiben synthetisch und abhaengig

Das System MUST synthetische Firmenwerte, leere Steuer-/Bankkennungen und den offenen Country/Region-Seed als explizite Ziel- und Defectwahrheit fuehren.

#### Scenario: Country/Region fehlt

- **WHEN** Country/Region DE im leeren Mandanten nicht existiert
- **THEN** bleibt Company Information ohne DE und ein Seed-/Retestschritt offen

### Requirement: Paketwellen sind fail-closed geordnet

Das System MUST PRESEED/CORE-FINANCE vor TRADE-MASTER und TRADE-MASTER vor OPENING-DATA verlangen und gebuchte Ledger-Tabellen ausschliessen.

#### Scenario: Offene Daten vor Stammdaten

- **WHEN** `UABC-03-OPENING-DATA` vor einem bestandenen Exit von `UABC-02-TRADE-MASTER` freigegeben wird
- **THEN** blockiert der Validator die Ausfuehrung

### Requirement: Akteurswahrheit ist aufloesbar

Das System MUST technischen Bedienakteur und menschliche fachliche Verantwortung getrennt ausweisen.

#### Scenario: Automation klickt

- **WHEN** die Browserautomation eine technische Aktion ausfuehrt
- **THEN** wird sie nicht Kajetan Kalicki als manueller Klick zugeschrieben

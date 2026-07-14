# Kanonische BC-Basic-Projektsimulation

## Purpose

Die Kundeninstanz besitzt eine einzige aktuelle synthetische Projektsimulation als fachliche Source of Truth.

## ADDED Requirements

### Requirement: Eine aktuelle synthetische Wahrheit
Die aktuellen Projektvertraege MUESSEN `simulated-complete` und synthetische Abnahme ausweisen, ohne reale Ausfuehrung zu behaupten.

#### Scenario: Vollstaendiger Abschluss
- **WHEN** der kanonische Vertrag validiert wird
- **THEN** stimmen Tickets, Worklogs, Kosten, Timeline, Deliverables, Gates und Truth-Boundary ueberein.

### Requirement: Reale Folgegrenzen bleiben offen
Die acht realen Live-Gates MUESSEN als pending sichtbar bleiben und duerfen den synthetischen Abschluss nicht zuruecksetzen.

#### Scenario: Kein Realclaim
- **WHEN** ein Realclaim, eine konkurrierende currentAuthority oder eine widerspruechliche Kosten-/Statuskombination eingebracht wird
- **THEN** lehnt der Validator die Projektion fail-closed ab.

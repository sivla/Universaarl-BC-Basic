# Bewiesene Legacy-Erfahrungen

Stand: 2026-07-10. Quelle ist der schreibgeschuetzte Legacy-Worktree `C:\Users\kkali\.codex\worktrees\b8d6\FiBu`. Uebernommen werden nur nachpruefbare Arbeitsprinzipien, keine Cases, Runner, States, Skills oder Buchstruktur.

| Evidence im Legacy-Repository | Beobachtung | Verbindliche V2-Folge |
| --- | --- | --- |
| `playwright/core/bc/step-timeline.ts` | Relevante Aktionen wurden mit Vorher-/Nachher-Screenshot, URL, sichtbarem Zustand, Claim, Verdict und Stop-Grund zeitlich gekoppelt. | Spaetere Szenarien erhalten eine chronologische Evidence-Kette; ein Screenshot allein beweist keinen Prozessuebergang. |
| `playwright/core/bc/visual-state-capture.ts` | Vordergrundzustand und Hintergrund koennen gleichzeitig sichtbar sein; Sidepane ueber Role Center ist ein gueltiger Zielzustand. Suchoverlay und Dialog muessen vor Seitenaussagen klassifiziert werden. | Seite, Dialog, Overlay, Sidepane, Fokus und Hintergrund werden nach relevanten Uebergaengen gemeinsam beobachtet. |
| `playwright/core/bc/visual-proof-skills.ts` | Sichtbare Sollwerte und akzeptierte Oberflaechenklassifikation waren Voraussetzung fuer Evidence; falsche Oberflaechen wurden abgelehnt. | Evidence-Akzeptanzkriterien nennen sichtbare Werte und Zieloberflaeche. Nicht sichtbare Behauptungen bleiben `not proven`. |
| `.agent/state/rejected_route_register.json` | Wiederholte Grid-, Tell-Me- und Dialogrouten erzeugten Screenshots, aber keinen sicheren, wiedergeoeffneten Zielzustand. Wiederholung war nur mit neuer Hypothese erlaubt. | Nach zwei vergleichbaren Fehlschlaegen wird die Route geparkt; Wiederaufnahme braucht neue Quelle, UI-Erkenntnis oder Oberflaeche. |
| `.agent/skills/bc-navigation.md` | Instanz-, Unternehmens- und Seitenkontext wurden vor Writes getrennt geprueft; mehrdeutiges Tell Me war ein Stop-Zustand. | Jeder spaetere Write prueft `playthru`, BC-Unternehmen und Zielseite unmittelbar vorher. |
| `.agent/SKILL-SYSTEM.md` | Vorrats-Skills und parallele Projektwahrheiten vergroesserten Kontext und Pflegeaufwand. | Ein V2-Skill entsteht erst nach zwei erfolgreichen Anwendungen und konkretem Wiederverwendungsfall. |

Grenze der Uebernahme: Die Legacy-Artefakte belegen Arbeitsprobleme und Schutzmechanismen, nicht die fachliche Richtigkeit des neuen Universaarl-Blueprints.


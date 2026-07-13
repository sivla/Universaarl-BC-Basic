# Proposal: Sandbox Setup Wave 1 vorbereiten

## Problem

Die drei in `UABC-BASIC-DE` vorhandenen Konfigurationspakete besitzen weiterhin null Tabellen, null Datensaetze und null Fehler. Technischer Gesellschaftsname, URL und sichtbarer Firmenname belegen jedoch keinen eingerichteten Piloten: Der aktuelle Inhalt ist eine unveränderte Microsoft-Standard-CRONUS-Demo-Ausgangsbasis. Ohne Wave-0-Readback, feldnahe Matrix und fail-closed Zielentscheidung waere ein Pilotaufbau weder wahrheitsgetreu noch sicher.

## Ziel

Dieser Change bindet eine pruefbare Tabellen-/Feldmatrix, einen konkreten Wave-0-, Apply-, Readback- und Rollbackplan sowie einen spaeter ausfuehrbaren Kontrollzentrum-Lauf fuer `Playthru / UABC-BASIC-DE`. Er trennt strukturiert `standard-cronus-demo`-Baseline, Pilot-Soll und tatsaechlich gelesene Abweichung. `UABC-01-CORE-FINANCE` bleibt nur planseitig `prepared-for-controlled-live-run`, `UABC-02-TRADE-MASTER` bleibt `prepared-not-executed`, `UABC-03-OPENING-DATA` bleibt `designed-not-executed`.

Der kanonische Projektplan fuehrt zusaetzlich eine durchgaengige, noch nicht
ausgefuehrte Bereitschaftsfolge von der CRONUS-Bestandsaufnahme ueber
Demodatenentscheidung, Grundeinrichtung, Pakete, Stammdaten, Prozesse, Tests,
Schulung und Cutover bis Hypercare und Ready-to-Prod-Gate. Die Folge verwendet
ausschliesslich bestehende UABC-Tickets und darf keinen Live-, Kundenabnahme-
oder Produktionsreifeclaim erzeugen.

Die Wahl zwischen kontrollierter Weiterverwendung von `UABC-BASIC-DE` und einer sauberen CRONUS-Neuanlage beziehungsweise -Kopie wird als ein einziger source-driven Entscheidungsvertrag in der Pilot-Setup-Baseline geführt. Solange interne Company-ID, Baseline-Inventur und ein belastbarer Resetpunkt fehlen, bleibt die Wahl ungetroffen und jeder CORE-FINANCE-Write gesperrt.

## Wahrheitsgrenze

- Kein Live-BC-Write in diesem Change.
- Keine Tabellen wurden den drei Paketgeruesten hinzugefuegt; alle drei bleiben bei `0/0/0`.
- Keine Paketanwendung, kein Import, keine Buchung und keine externe Uebermittlung.
- `pilotConfigured=false`, `writesApplied=false`, `readbackStatus=pending`; der sichtbare Firmenname ist kein Einrichtungsnachweis.
- `UABC-BASIC-DE` ist kein realisierter Kundenstand. Die Nutzerinformation belegt `standard-cronus-demo`; ob die Gesellschaft kopiert, umbenannt oder anders erzeugt wurde, bleibt bis zum DOM-/Feld-Readback eine unbestätigte Herkunftshypothese.
- Der aktive Jira-/Twin-Stand ist eine dynamische Materialisierung der einzigen kanonischen Projektstory. Historische Simulation, Planbudget und aktuelles Task-Worklog-Ist bleiben getrennt.
- Gebuchte Posten-, Ledger- und Posted-Document-Tabellen sowie Continia sind ausgeschlossen.
- Fruehere Country-/Company-Evidence bleibt als historische Provenienz erhalten, ist aber keine aktuelle Readiness-Wahrheit.

## Ergebnis

Ein Consultant kann die erste Welle nach sicherer Runtime-Bindung ohne erneute Designrunde feldnah anlegen, validieren, stoppen oder zuruecksetzen. Der spaetere Live-Nachweis bleibt ein eigener Ausfuehrungsblock.

Der aktive Jira-Boardvertrag bildet zusätzlich jeden tatsächlich verwendeten Ticketstatus genau einmal auf eine sichtbare Producer-Spalte ab. Blockierte Tickets bleiben dadurch ohne Twin-Sonderlogik sichtbar.

Kundenprojekt, Produkt-Space und Consulting-Handbuch erklären denselben Stand ohne konkurrierende Wahrheit: Das Kundenprojekt führt Ist, Soll und Gate; das Produkt beschreibt Scope und Nicht-Scope; das Consulting-Handbuch ausschließlich die wiederverwendbare Methode.

Der erste reale W0-01-Zugriffsversuch darf auch als fachlich relevanter Blockerstand zurückgegeben werden. Wenn die Browser-Sicherheitsrichtlinie vor jeder DOM- und Screenshot-Lektüre stoppt, werden nur der sichtbare Tabtitel, die bereinigten URL-Parameter, Zeitpunkt, Rolle und die fehlende Lesbarkeit dokumentiert. Daraus dürfen weder interne Company-ID noch CRONUS-Provenienz, Company Information, Gesellschaftsliste oder Zielstrategie abgeleitet werden.

Auch die vom Nutzer bestätigte inhaltliche Standard-CRONUS-Baseline realisiert noch keinen BC-Basic-Kundenstand. `customerTargetRealized=false` und `originMechanismStatus=unbekannt-bis-wave0-readback` bleiben bis zum sichtbaren W0-01-Readback verbindlich; eine vermutete Kopie oder Umbenennung ist keine Ausführungsevidence.

CORE-FINANCE wird zusätzlich als konkreter, source-driven Payload mit Paketmanifest vorbereitet. Er konsolidiert PRESEED, elf Kontenrollen, Buchungsgruppen, VAT, Dimensionen, Nummernserien, Zahlungsbedingungen, Periodenannahmen, Lagerort und eine Bank-Buchungsgruppenbaseline ohne Bankkonto oder reale Bankkennung. Jeder Datensatz ist an Tabelle, natürlichen Schlüssel, Importreihenfolge, Fremdschlüssel, Kontrollwert, Rollback und Evidenceziel gebunden. Der Status bleibt `prepared-for-controlled-live-run`; `applied`, `completed`, `accepted` und jede Write-Freigabe bleiben ausgeschlossen.

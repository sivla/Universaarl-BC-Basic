# Aenderungsvorschlag: BC Basic Kundenprojekt

## Metadaten

- OpenSpec-Aenderung: `deliver-bc-basic-customer-project`
- Projekt: `UABC-BC-BASIC-001`
- Servicepaket: **BC Basic** als Universaarl-Standardleistung, nicht als behaupteter Microsoft-Lizenzname
- Ziel: eine synthetische Einfuehrung in genau einer Gesellschaft der Sandbox `playthru`
- Zeitmodell: Phase 1 Vorbereitung und Anforderungen circa drei Kalenderwochen ab noch unbestaetigtem Projektauftakt, Phase 2 genau fuenf aufeinanderfolgende Arbeitstage nach Bereitschaftspruefpunkt, Phase 3 begrenzte Stabilisierungsphase circa zwei Kalenderwochen bis zur ersten Monatsabschlussprobe in der Sandbox
- Liefergrenze: 76 geplante abrechenbare Stunden plus 4 Stunden nicht vorab abrechenbare Reserve; maximal 80 Stunden
- Planpreis: 76 Stunden zu 120 EUR netto = 9.120 EUR; absolute Leistungsgrenze 9.600 EUR netto

## Problem und Zweck

Der bisherige Blueprint beschreibt ein breites Mehrgesellschaftsprogramm, liefert aber noch kein fokussiertes, realistisch durchfuehrbares erstes Kundenprojekt. Diese Aenderung richtet die Arbeit auf ein standardnahes BC-Basic-Paket aus: Anforderungen und Daten werden vorab geklaert, Einrichtung und Schulung erfolgen in einer Arbeitswoche, und die begrenzte Stabilisierungsphase endet nach einer nachvollziehbaren Monatsabschlussprobe in der Sandbox sowie einer fachlich geprueften deutschen UStVA-Vorschau samt lokalem XML ohne Test- oder Produktivuebermittlung.

## Ergebnisse

1. Ein verbindlicher Drei-Phasen-Projektplan mit Abschlusskriterien, Abhaengigkeiten und menschlichen Pruefpunkten.
2. Ein Jira-Sammelvorgang mit drei Phasentickets und kleinen abrechenbaren Arbeitspaketen; jedes Ticket hat Aufwand, Akzeptanzkriterien, Lieferergebnisse und mindestens eine Besprechungstranskript-Referenz.
3. Ein sauberer Confluence-Seitenbaum mit Besprechungen, Entscheidungen, Daten, Schulung, Abrechnung und Uebergabe.
4. Ein synthetisches Datenpaket fuer genau eine Gesellschaft sowie ein rollenbezogener Trainingsplan.
5. Gliederungen fuer ein Kundenhandbuch und ein Beratungshandbuch.
6. Ein nicht ausgefuehrter Playwright-Szenariokatalog fuer Grundeinrichtung, Finanzwesen, Einkauf, Verkauf, einfaches Lager, Monatsabschlussprobe und UStVA-Vorschau.
7. Ein versionierter, nur lesbarer Projektindex als einzige Einstiegskante fuer den Projekt-Twin; er verweist auf Blueprint-Quellen und dupliziert keine fachlichen Daten.

## Umfang

- Grundeinrichtung einer einzigen synthetischen Gesellschaft in `playthru`, Zielbindung `Universaarl GmbH`, erst nach expliziter Schreibfreigabe.
- Finanzwesen und Buchhaltung: Kontenplan, Buchungsgruppen, Nummernserien, Zahlungsbedingungen, Dimensionen, MwSt.-Einrichtung, Journale, Abstimmung und Basisberichte.
- Einkauf, Verkauf, Artikel und einfacher Bestand an einem Lagerort ohne verpflichtende Lagerplaetze.
- Synthetische Stammdaten, Anfangsbestands- und Eroeffnungsdaten in kontrollierten Vorlagen.
- Rollenbasierte Schulungen, fachlicher Abnahmetest, Sandbox-Pilot mit dokumentierter Produktionsbereitschaft, begrenzte Stabilisierungsphase, Monatsabschlussprobe und lokale UStVA-Vorschau/XML-Pruefung.
- Woechentliche Abrechnung ausschliesslich aus freigegebenen Jira-Istzeiten.

## Nicht-Ziele

- Keine AL-Entwicklung, eigenen Berichte oder Layouts, Integrationen, Power Platform, Dataverse oder andere Fremdsystemanbindung.
- Keine produktive Bankanbindung, PSD2, mehreren Firmen, Waehrungen, Banken oder Lagerorte.
- Kein erweitertes Lager, keine Chargen oder Seriennummern, Produktion, Kundendienst, Projekte, Anlagenbuchhaltung, Intercompany, Konsolidierung oder Lohnabrechnung.
- Keine historischen Bewegungsdaten, E-Rechnung, echte Steueruebermittlung, ELSTER-Zugangsdaten, Rechts- oder Steuerberatung und keine GoBD-Garantie.
- Kein Produktivstart, kein echter Monatsabschluss und keine offene oder unbegrenzte Stabilisierungsphase.
- Keine echte Kunden-, Personen-, Bank-, Steuer- oder Zugangsdaten.
- Keine Behauptung, **BC Basic** sei eine Microsoft-Lizenz. Lizenz-, Tenant- und sonstige externe Kosten sind nicht im Leistungsbudget enthalten.
- In diesem Planungsschritt keine BC-Schreibvorgaenge, fachlichen Tests, Erstellungsvorgaenge, Browserlaeufe oder Erfolgsaussagen.

## Risiken und Kontrollen

- **Budgetueberschreitung:** 76 Stunden werden auf Tickets geplant; 4 Stunden Reserve duerfen nur nach dokumentierter Begruendung und Sponsorfreigabe aktiviert werden. Bei 80 Stunden stoppt die Arbeit.
- **Unklare Daten:** Phase 2 beginnt nur mit bestandenem Datenbereitschaftspruefpunkt; fehlende Pflichtdaten fuehren zu Verschiebung oder dokumentierter Umfangsreduktion.
- **Steuerliche Fehlkonfiguration:** MwSt.-Buchungsgruppen, UStVA-Zuordnungen und Schluessel benoetigen fachliche Freigabe durch Finanzverantwortung und Steuerberatung.
- **Unkontrollierter Sandbox-Schreibvorgang:** Jeder spaetere Schreibvorgang braucht eine projektspezifische Autorisierung, Zielbindung, Ruecksetzplan und begrenzten Playwright-Umfang.
- **Scheinerfolg:** `Nicht ausgefuehrt`, fehlende Werte und Simulation gelten nie als bestanden oder produktionsreif.
- **Twin-Drift:** Der Twin darf nur den positivgelisteten Projektindex lesen und keine eigenen Projektinhalte pflegen.

## Freigabe

Dieser Vorschlag gibt ausschliesslich die Planung und Struktur der Projektablage frei. Vor operativer Ausfuehrung bleiben mindestens folgende echte Entscheidungen offen: Sandbox-Schreibfreigabe, Zielgesellschaft, Lizenzzuordnung, Datenpaket, Finanz-/Steuerdesign, fachlicher Abnahmetest, Sandbox-Pilot und Produktionsbereitschaft, Monatsabschlussprobe, UStVA-Pruefung und Abschluss der Stabilisierungsphase. Keine dieser Freigaben darf automatisiert oder synthetischen Personen zugeschrieben werden.

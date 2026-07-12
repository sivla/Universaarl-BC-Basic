# Aenderungsvorschlag: BC Basic Einrichtung

## Metadaten

- OpenSpec-Aenderung: `deliver-bc-basic-customer-project`
- Projekt: `UABC-BC-BASIC-001`
- Produkt: **BC Basic Einrichtung** als kleinste wiederverwendbare Universaarl-Standardleistung, nicht als behaupteter Microsoft-Lizenzname
- Ziel: arbeitsfaehige Grundeinrichtung fuer genau eine kleine deutsche Gesellschaft in der Sandbox `playthru`
- Liefermodell: Vorbereitung und Datenbereitschaft, eine Einrichtungs- und Schulungswoche, danach eine Woche Hypercare mit hoechstens 10 Stunden
- Planaufwand: 68 geplante abrechenbare Dienstleisterstunden; ein verbindliches Budgetlimit ist noch nicht menschlich entschieden
- Abrechnungssatz: 1.300 EUR netto pro Arbeitstag, 8 Stunden pro Arbeitstag, rechnerisch 162,50 EUR netto pro Stunde
- Synthetischer Abschlussstand: Angebotsversion 2.0 mit 80 Stunden zu 120 EUR und 9.600 EUR netto; die Abweichung zur historischen Kalkulationsbasis ist in `evidence/simulation/billing-reconciliation.yaml` nachvollziehbar und erzeugt keine reale Rechnung

## Problem und Zweck

Der bisherige P001-Entwurf war fuer ein erstes Kundenprodukt noch zu breit und vermischte Projektgrenze, Budgetgrenze und Pilot-/Produktionssprache. Diese Aenderung richtet P001 auf das wiederverwendbare Produkt **BC Basic Einrichtung** aus: eine kleine deutsche Firma wird in `playthru` mit SKR04, grundlegendem Finanzwesen, Einkauf, Verkauf, einfachem Bestand und minimaler Schulung arbeitsfaehig gemacht. Es gibt keinen Produktivstart, keine E-Rechnung, keine produktive Bankanbindung und keine UStVA- oder ELSTER-Uebermittlung.

## Ergebnisse

1. Ein verbindlicher Drei-Phasen-Projektplan mit Abschlusskriterien, Abhaengigkeiten, Kundenmitwirkung und menschlichen Pruefpunkten.
2. Ein Jira-Sammelvorgang mit drei Phasentickets und sinnvollen abrechenbaren Dienstleisterarbeitspaketen; jedes abrechenbare Paket hat Aufwand, Akzeptanzkriterien und Jira-Bezug, ohne kuenstliche Mikrotickets.
3. Ein sauberer Confluence-Seitenbaum mit Besprechungen, Entscheidungen, Daten, Schulung, Abrechnung und Uebergabe.
4. Ein synthetisches Datenpaket fuer genau eine Gesellschaft, Konfigurationspaket-Plan, minimale Stammdaten und rollenbezogener Trainingsplan.
5. Gliederungen fuer ein Kundenhandbuch und ein Beratungshandbuch.
6. Ein nicht ausgefuehrter Playwright-Szenariokatalog fuer Grundeinrichtung, Finanzwesen, Einkauf, Verkauf, einfachen Bestand, Monatsabschlussprobe, UStVA-Vorschau und begrenzten Zahlungstest.
7. Ein `proposed` Projektindex und eine zugehoerige, fail-closed Project-Twin-Konsumentenbindung als einzige geplante Einstiegskante. Erst ein spaeter validierter und versionierter Snapshot darf auf Blueprint-Quellen verweisen; bis dahin wird keine Twin-Bereitstellung behauptet und keine fachliche Wahrheit dupliziert.
8. Ein expliziter versionierter Uebergabevertrag in der Reihenfolge Spectra-Releasebindung im technischen BCProjectOS-Repository -> BC-Basic-Consumerbindung -> commitgebundenes Snapshotmanifest -> ausschliesslich lesender Project Twin. Die bekannte Repository-Identitaet von BCProjectOS ersetzt keinen Releasebeweis.
9. Ein kleiner, rein lokaler Migrationsvertrag fuer die spaetere Trennung aus dem gemeinsam genutzten `sivla/FiBu`-Repository in ein eigenes Repository `Universaarl-BC-Basic`, ohne fachliche Daten, IDs, Spectra-Bindung oder Snapshotfelder zu aendern.
10. Eine Spectra-0.9-konforme Reconciliation von historischer Baseline, synthetischem Angebot und Ist sowie eine read-only Adapter-Provenienz fuer die deterministische Projektion des einzigen Branch-Index. Beide Nachweise bleiben Teil der Kundeninstanz, erzeugen keine Rechnung oder produktive Leistungsbehauptung und geben dem Twin kein Schreibrecht.

## Umfang

- Grundeinrichtung einer einzigen synthetischen deutschen Gesellschaft in `playthru`, Zielbindung `Universaarl GmbH`, erst nach expliziter Schreibfreigabe.
- Genau ein Lagerort `HAUPT` mit einfachster Standardkonfiguration ohne verpflichtende Lagerplaetze.
- SKR04, grundlegendes Finanzwesen, erforderliche Konten, Buchungsgruppen, MwSt.-Einrichtung, Zahlungsbedingungen, Nummernserien, minimale Dimensionen, Journale, Abstimmung und Basisberichte.
- Debitoren, Kreditoren, wenige realitaetsnahe Artikel, Einheiten, Preise und einfache Rabatte.
- Einkauf, Verkauf und einfacher Bestand mit je einem repraesentativen Pflichtfall; Zahlungsprozesse nur als begrenzter Sandbox-Test, falls fachlich und technisch sinnvoll.
- Konfigurationspakete als bevorzugter Einrichtungs- und Importweg fuer Setupdaten, Stammdaten und kontrollierte offene Posten; manuelle BC-Schritte werden begruendet dokumentiert.
- Grundlegende BC- und Prozessschulungen, UAT-Begleitung, Projektdokumentation, Schulungsunterlagen und eine Woche Hypercare mit hoechstens 10 Stunden.
- Woechentliche Abrechnung ausschliesslich aus freigegebenen Jira-Istzeiten auf Dienstleisterseite.

## Nicht-Ziele

- Keine AL-Entwicklung, eigenen Berichte oder Layouts, Integrationen, Power Platform, Dataverse oder andere Fremdsystemanbindung.
- Keine produktive Bankanbindung, PSD2, mehreren Firmen, Waehrungen, Banken oder Lagerorte.
- Kein erweitertes Lager, keine Chargen oder Seriennummern, keine Varianten-/Attributkomplexitaet ausser bei zwingendem Grundszenario, Produktion, Service, Projekte, Anlagenbuchhaltung, Intercompany, Konsolidierung oder Lohnabrechnung.
- Keine historischen Bewegungsdaten, E-Rechnung, echte UStVA- oder ELSTER-Uebermittlung, ELSTER-Zugangsdaten, Rechts- oder Steuerberatung und keine GoBD-Garantie.
- Keine Schulung zur Erstellung oder Pflege von Konfigurationspaketen.
- Kein Produktivstart, kein echter Monatsabschluss und kein Support nach Ende der einwoechigen Hypercare.
- Keine echte Kunden-, Personen-, Bank-, Steuer- oder Zugangsdaten.
- Keine Behauptung, **BC Basic** sei eine Microsoft-Lizenz. Lizenz-, Tenant- und sonstige externe Kosten sind nicht im Leistungsbudget enthalten.
- In diesem Planungsschritt keine BC-Schreibvorgaenge, fachlichen Tests, Erstellungsvorgaenge, Browserlaeufe oder Erfolgsaussagen.
- Die Repository-Trennung wird nur inventarisiert und vertraglich vorbereitet: Zielbranch `main`, Arbeitsbranches `codex/...`, Push/PR spaeter nur durch den Projekt-Agenten auf einem eigenen Arbeitsbranch; Merge, Tag und Release bleiben beim Kontrollzentrum. Kein Repository wird angelegt oder umbenannt.

## Risiken und Kontrollen

- **Unklare Abrechnung:** Der Tagessatz ist entschieden, ein Budgetlimit jedoch nicht; Planstunden sind eine Kalkulationsbasis und duerfen nicht als genehmigte Budgetobergrenze dargestellt werden.
- **Unklare Daten:** Phase 2 beginnt nur mit bestandenem Datenbereitschaftspruefpunkt; fehlende Pflichtdaten fuehren zu einem blockierten Dienstleisterticket, Terminverschiebung oder dokumentierter Umfangsentscheidung.
- **Konfigurationspaket-Luecke:** Nicht jeder BC-Einrichtungsschritt ist per Konfigurationspaket sinnvoll oder moeglich; manuelle Schritte werden als Ausnahme mit Grund, Pruefung und Wiederholungsweg dokumentiert.
- **Steuerliche Fehlkonfiguration:** MwSt.-Buchungsgruppen, UStVA-Zuordnungen und Schluessel benoetigen fachliche Freigabe durch Finanzverantwortung und Steuerberatung.
- **Unkontrollierter Sandbox-Schreibvorgang:** Jeder spaetere Schreibvorgang braucht eine projektspezifische Autorisierung, Zielbindung, Ruecksetzplan und begrenzten Playwright-Umfang.
- **Scheinerfolg:** `Nicht ausgefuehrt`, fehlende Werte und Simulation gelten nie als bestanden, produktionsreif oder abgenommen.
- **Twin-Drift:** Der Twin darf als nachgewiesener Leser unter `https://github.com/sivla/FiBu.git` auf `codex/universaarl-projekt-twin` ausschliesslich einen validierten, versionierten Snapshot des positivgelisteten Projektindex lesen, keine eigenen Projektinhalte pflegen und niemals in die Kundeninstanz zurueckschreiben. Die Leseridentitaet autorisiert keinen Snapshot und hebt kein vorgelagertes Gate auf.
- **Release-Scheinnachweis:** Die bekannte BCProjectOS-Repository-URL reicht nicht aus. Solange Spectra-Produkt-ID, Release-Version, ein annotierter Tag im Muster `spectra-v<SemVer>`, extern aufgeloester Tag-Commit, finales installierbares Manifest, Manifest-Quellcommit, unveraenderter Produktumfang und passender SHA-256-Payload-Digest nicht gemeinsam nachgewiesen sind, bleibt die Bindung `PENDING_BCPROJECTOS_RELEASE` und die Snapshotausgabe blockiert.

## Freigabe

Dieser Vorschlag gibt ausschliesslich die Planung und Struktur der Projektablage frei. Vor operativer Ausfuehrung bleiben mindestens folgende echte Entscheidungen offen: Sandbox-Schreibfreigabe, Zielgesellschaft, Lizenzzuordnung, Datenpaket, Finanz-/Steuerdesign, fachlicher Abnahmetest, UAT-Ergebnisse, Monatsabschlussprobe, UStVA-Vorschau, Abschluss der einwoechigen Hypercare und ein eventuell gewuenschtes Budgetlimit. Keine dieser Freigaben darf automatisiert oder synthetischen Personen zugeschrieben werden.

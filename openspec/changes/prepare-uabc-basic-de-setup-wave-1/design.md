# Design: Sandbox Setup Wave 1

## Reihenfolge

1. Wave 0 liest interne Company-ID, technischen Namen, Name, Display Name, unveränderte Standard-CRONUS-Demodaten und Abgrenzung zu Referenzgesellschaften.
2. Auf dieser Evidence wird zwischen kontrollierter Weiterverwendung der aktuellen Standard-CRONUS-Demo-Ausgangsbasis und sauberer Neuanlage oder Kopie entschieden; zugleich wird ein eindeutiger Resetpunkt dokumentiert. Technischer Firmenname und URL sind kein Einrichtungsnachweis.
3. CORE-FINANCE-Tabellen in der Matrixreihenfolge aufnehmen; Feldliste vor jedem Tabellen-Add pruefen.
4. Paket pruefen, ohne es anzuwenden.
5. Erst nach separater authentisierter Laufentscheidung freigegebene Setupzeilen anwenden und jede Wirkung read-back pruefen.
6. Paket `UABC-02-TRADE-MASTER` erst nach bestandenem CORE-Abschluss vorbereiten; Paket `UABC-03-OPENING-DATA` weder importieren noch anwenden.

Die kanonische Pilot-Setup-Baseline besitzt dafür ein Entscheidungsobjekt mit genau zwei erlaubten Optionen, einer leeren Auswahl, der noch fehlenden Evidence, dem Owner und `W0-01` als nächstem ausführbaren Nur-Lese-Schritt. Matrix, Run-Plan, Projektstory und Twin-Projektion übernehmen nur diese Gate-Wahrheit. Eine Option darf erst nach dokumentierter Company-ID, CRONUS-Inventur, Fremdmandantenabgrenzung und Reset-/Wiederanlaufnachweis ausgewählt werden.

## Matrixvertrag

Jeder Eintrag nennt Paket, Tabelle, belastbare Tabellen-ID oder `sandbox-confirmation-required`, Felder, Include-/Exclude-Entscheidung, Abhaengigkeit, Reihenfolge, Mandant, Quelle, Validierung, Wirkung, Ausschlussgrund, Owner und Evidence. Unbestaetigte Feld-IDs werden nicht erfunden. Singleton-Setup und komplexe UI-Logik duerfen als manueller Schritt klassifiziert werden.

## Sicherheitsvertrag

Der Live-Lauf stoppt vor dem ersten Write bei fehlendem Wave-0-Readback, unbekannter Standard-CRONUS-Provenienz, fehlender Zielentscheidung, falschem Environment, falscher Gesellschaft, abweichender BC-Version/Lokalisierung/Rolle, fehlendem Resetpunkt, nicht leerem Paketgeruest, unbekannter Tabellen-ID, Schemaabweichung oder fehlender direkter Berechtigung. Eine blosse Umbenennung darf nie `pilotConfigured=true` setzen. Teilanwendungen werden nicht blind wiederholt. Die Ausgangs- und Nachkontrolle erfolgt ueber BC-Seiten sowie Paketfehler/Datensatzzaehler, nicht ueber importierte Ledger-Tabellen.

CORE-FINANCE ist damit planseitig vorbereitet, aber nicht ausführbar. Der erste spätere BC-Schritt ist ausschließlich `W0-01`: interne Company-ID und technischen Namen lesend erfassen. Erst nach vollständigem Wave 0, ausgewählter Zielstrategie, Resetpunkt und separater Schreibfreigabe können RUN-06 bis RUN-22 neu bewertet werden.

Ein vor der DOM-Lektüre blockierter W0-01-Versuch wird als `blocked-before-dom-readback` modelliert. Die Versuchsevidence enthält keine BC-Feldwerte und keine Screenshotreferenz, darf aber den bereits sichtbaren Tabtitel sowie eine tenantbereinigte URL mit Environment- und Company-Query dokumentieren. UABC-39 erhält dafür einen Arbeitskommentar, einen tatsächlichen Task-Worklog und Status `blocked`, jedoch keinen Abschlusskommentar. Der nächste Schritt bleibt W0-01 in einem manuell freigegebenen read-only Termin.

Die Herkunft der technisch benannten Gesellschaft wird getrennt von ihrem fachlichen Datenstand modelliert. Der Nutzerbeleg setzt `contentBaseline=standard-cronus-demo` und `customerTargetRealized=false`; die Formulierung „offenbar kopiert/umbenannt“ wird ausschließlich als `nutzerhinweis-unbestaetigt` mit `originMechanismStatus=unbekannt-bis-wave0-readback` geführt. Weder Generator noch Twin dürfen daraus einen realisierten Kundenstand, einen ausgeführten Setup-Schritt oder eine Zielstrategie ableiten.

## Projektstory- und Twin-Vertrag

`evidence/simulation/project-story.json` bleibt die einzige aktive Ticketquelle. Jira, Spectra-0.10, Index und Twin werden deterministisch daraus erzeugt. Die Ticketmenge ist dynamisch; nur `UABC-1`, `UABC-2` und `UABC-3` sind feste Phase-Roots. Plan 80 Stunden/9.600 EUR bleibt im Angebots-/Billingvertrag, aktuelles Ist wird ausschliesslich aus Task-Worklogs abgeleitet. Twin-Ticketlisten enthalten keine Geldfelder oder Geldbetraege.

`TICKET_VIEWS` im Spectra-0.10-Generator ist die einzige Board-/Spaltenquelle. `blocked` wird genau einmal der sichtbaren Spalte `In Bearbeitung` zugeordnet. Der Jira-Erzeuger übernimmt dieselbe Definition; Validatoren lehnen fehlende, doppelte und unbekannte Statuszuordnungen fail-closed ab.

## Rollback

Vor dem ersten Apply wird ein eindeutiger Resetpunkt dokumentiert. Vorbereitete, noch nicht angewandte Paketzeilen koennen aus dem Paket entfernt werden. Nach einem Teil-Apply wird nicht massenhaft geloescht: Abbruch, Readback der betroffenen Setupcodes, kontrollierte Ruecknahme nur der im Lauf erzeugten synthetischen Codes oder Reset der eindeutig markierten Pilotgesellschaft. Altgesellschaften bleiben unveraendert.

## CORE-FINANCE-Payload und Paketmanifest

Ein kanonischer Payload führt alle vorbereiteten CORE-Datensätze. Paketfähige Tabellen und begründete manuelle UI-Schritte werden getrennt modelliert; Table 270 `Bank Account`, Ledger-, Posted-, Audit-, FlowField- und Systemfelder sind ausgeschlossen. Eine Bankbaseline darf ausschließlich Table 277 `Bank Account Posting Group` mit synthetischem Verrechnungskonto enthalten und niemals IBAN, BIC, Bankkonto oder Übertragungsformat.

Das Paketmanifest bindet Payload-Digest, Importreihenfolge, natürliche Schlüssel, Pflichtfelder, Fremdschlüssel, erwartete Operation, Vorbedingungen, Kontrollsummen, Rollback, Fehlerkorrektur, Retest und Evidenceziel. Die Finanzreferenzen werden graphartig geprüft: jede Buchungsgruppe, VAT-Kombination, Dimensionsreferenz und Nummernserie muss auf einen vorhandenen Payload-Datensatz oder eine explizite manuelle Singleton-Baseline auflösen. Die 19-Prozent-VAT-Kombination bleibt `synthetic-project-assumption-tax-confirmation-required`.

W0-01, Zielstrategie, Resetpunkt und separate Schreibfreigabe bleiben vor jeder Paketaktion zwingend. Der Payload ist ausführungsbereit, aber nicht ausgeführt; er ändert weder Paketnullstand noch `writesAuthorized=false`.

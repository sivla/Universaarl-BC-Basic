---
documentId: UABC-HANDBOOK-BCB-CONSULTANT-001
projectId: UABC-BC-BASIC-001
version: 1.1
status: Kundenbereites Standardmuster
simulation: true
deliverableRef: UABC-DEL-BCB-009
---

# Beratungshandbuch: BC Basic Einrichtung

Diese Betriebsanleitung beschreibt den wiederverwendbaren Ziel- und Referenzprozess für BC Basic. Sie ist eine Produkt-/Consultant-Anleitung und **kein aktueller Kundenprojektstatus**. Im laufenden Universaarl-Pilot ist `UABC-BASIC-DE` eine CRONUS-Demo-Ausgangsbasis; Setup, Playthrough, Hypercare und Handover stehen aus. Erst projektspezifische Entry-Gates und eine getrennte Schreibfreigabe autorisieren Sandboxschritte.

## 1. Vorbedingungen

1. Versionsstand der Projektablage, aktive OpenSpec-Aenderung und Projektindex sind festgehalten.
2. Zielgesellschaft, erlaubte Schreibvorgaenge, Arbeitsdatum und Ruecksetzplan sind projektspezifisch freigegeben.
3. Datenpaket und Finanz-/Steuerdesign haben benannte echte Pruefer.
4. Alle verwendeten Datensaetze sind synthetisch; keine `.env`, Browserprofile, Tokens, Bank- oder ELSTER-Zugangsdaten werden in Projektartefakte uebernommen.
5. Das aktuelle Standardangebot umfasst 80 Stunden zu 120 EUR und 9.600 EUR netto. Die historische 68-Stunden-Kalkulation ist kein paralleles Angebot.

Scheitert eine Vorbedingung, endet der Lauf vor der ersten Mutation.

## 2. Lieferfolge

### Phase 1: Vorbereitung und Anforderungen

`UABC-32` bis `UABC-33` klaeren Umfang, Finanz-/Steuerdesign, Handels- und Lagerprozesse, Datenbereitschaft und Abnahmeplan. Die Einrichtungswoche darf nicht fuer nachtraegliche Anforderungsklaerung verbraucht werden.

### Phase 2: Einrichtungswoche

`UABC-39` bindet das Ziel. Danach folgen Finanzwesen, Konfigurationspakete, Daten, Einkauf, Verkauf und einfacher Bestand in der Reihenfolge `UABC-40` bis `UABC-44`. `UABC-45` schult die Rollen. `UABC-46` dokumentiert Ende-zu-Ende-Pflichtfaelle, fachlichen Abnahmetest, vorbereitete UAT-Faelle und offene Fehler.

### Phase 3: einwoechige Hypercare

`UABC-47` nimmt nur priorisierte UAT- und Hypercare-Befunde auf. `UABC-48` probt den Monatsabschlussprozess in der Sandbox und dokumentiert Abstimmungen. `UABC-49` prueft die UStVA-Vorschau; Test-, Produktiv- und ELSTER-Uebermittlung bleiben gesperrt. `UABC-50` uebergibt Projektdokumentation und Schulungsunterlagen. Nach der einwoechigen Hypercare oder dem dokumentierten Abschluss werden weitere Taetigkeiten als Support oder eigenes Folgepaket bewertet.

## 3. Technische Ausfuehrungsgrenze

- Szenariokatalog: `playwright/scenarios/bc-basic-e2e.yaml`.
- Zulassung: nur exakt positivgelistete Szenarien und synthetische Datensatz-IDs.
- Abbruch: unbekannter Dialog, falsche Gesellschaft, unerklaerbare Buchungswirkung, fehlender Ruecksetzpunkt oder nicht freigegebene Aktion.
- Nachweis je Szenario: Lauf-ID, Szenario, Jira-Key, Anforderungsreferenz, Schrittereignisse, Screenshots, Datensatz-IDs, erwartete Buchungswirkung, beobachtetes Ergebnis und Pruefer.
- Aufbewahrung: Rohartefakte bleiben temporaer und werden erst nach Datenschutz- und Inhaltspruefung kuratiert.

Der Katalog beschreibt einen historisch erprobten Referenzprozess. Im aktuellen Kundenprojekt bleibt jeder Fall `planned`, bis Benutzer, Berechtigung, UI-Antwort, Buchung und Reset in der Sandbox mit aktueller Evidence belegt sind.

## 4. Datenkontrolle

`project/bc-basic/data-package.yaml` beschreibt die Datengrundlage des Zielprozesses. Vorlagen und Wellen sind im aktuellen Pilot nicht geladen. Freigegebene Quellen, Pflichtfelder, Eindeutigkeit, Referenzen und Summen werden vor jedem Import erneut geprüft.

### CORE-FINANCE-Consultant-Checkliste

Der kanonische Payload liegt in `project/bc-basic/core-finance-payload.yaml`, das gebundene Ausführungsmanifest in `project/bc-basic/core-finance-package-manifest.yaml`. Der Consultant prüft vor der Paketdefinition Wave 0, Zielgesellschaft, Resetpunkt und separate Schreibfreigabe. Anschließend werden 19 Pakettabellen mit 51 synthetischen Datensätzen in Manifestreihenfolge vorbereitet; 7 PRESEED-/Singleton-/Periodentabellen mit 18 Sollwerten folgen als manuelle, feldgenaue UI-Schritte.

1. Paket `UABC-01-CORE-FINANCE` auf der Konfigurationspaketkarte öffnen und die Tabelle-/Namensbindung gegen das Manifest prüfen.
2. Je Tabelle ausschließlich `requiredFields` und bewusst freigegebene `optionalFields` aktivieren; alle `excludedFields` bleiben draußen.
3. Die von BC erzeugte Excelvorlage verwenden, die 51 Payloaddatensätze übertragen, `Import from Excel` und anschließend `Validate Package` ausführen.
4. Bei Dublette, fehlendem Fremdschlüssel oder nicht editierbarem Feld stoppen, Istzeile beziehungsweise Feldvertrag korrigieren und erneut validieren. Ein Fehler wird niemals durch blindes `Apply Package` übergangen.
5. `Apply Package` bleibt bis Wave 0, Resetpunkt, separater Write-Freigabe, Vier-Augen-Prüfung und Steuerbestätigung gesperrt. Danach werden alle 69 Paket-/manuellen Werte und unveränderte Postenbestände gelesen.

Konfigurationspakete sind Consultant-Werkzeug. Kundinnen und Kunden werden nicht in Paketdefinition, Excelimport oder Paketbereinigung geschult.

## 5. Abrechnung

Das Standardangebot beträgt 80 Stunden/9.600 EUR. Nur genehmigte Arbeitsprotokolle der untersten Ticketebene zählen zum Ist; Elternsummen, Schätzungen und Kundenaufwand werden nicht doppelt erfasst. Die Referenzsimulation erzeugt keine Rechnung oder Zahlung.

## 6. Fachliche Abschlusskontrollen

- UAT: Referenzfälle beschreiben den Zielumfang; im aktuellen Pilot bleiben sie bis zur Ausführung durch die typisierten Key-User-Rollen offen.
- Monatsabschluss: Referenzprozess und Abstimmungen sind synthetisch bestanden; kein echter Monatsabschluss.
- UStVA: Referenzvorschau ist abgestimmt; keine Test-, Produktiv- oder ELSTER-Übermittlung.
- Steuergrenze: keine Steuer- oder Rechtsberatung und keine GoBD-Garantie.
- Handbuecher: Quellen, Version, Szenarien und Nachweise sind nachvollziehbar; fehlende Werte bleiben leer.

## 7. Ausschluesse unterhalb der Paketgrenze

Ausgeschlossen sind AL-Entwicklung, eigene Berichte oder Layouts, Integrationen, Power Platform, Dataverse, produktive Bankanbindung und PSD2, mehrere Firmen, Waehrungen, Banken oder Lagerorte, erweitertes Lager, Chargen, Seriennummern, Varianten-/Attributkomplexitaet ohne Pflichtgrund, Produktion, Service, Projekte, Anlagenbuchhaltung, Konsolidierung, Intercompany, Lohnabrechnung, historische Bewegungsdaten, E-Rechnung, Schulung zur Konfigurationspaketpflege, produktiver ELSTER-Versand, Support nach Hypercare sowie offene oder unbegrenzte Stabilisierungsphase.

## 8. Quellen und Nachweise

Die fachliche Grundlage bilden `SRC-BC-016`, `SRC-BC-052` bis `SRC-BC-084`, `SRC-LAW-001` und `SRC-ELSTER-001`. Historische Referenznachweise erfüllen keine aktuellen Gates. Die Evidence-IDs bleiben im Kundenprojekt offen, bis die tatsächliche Sandboxausführung belegt ist.

## 9. V1-Exit und Kundenstart

Das wiederverwendbare Produktmuster reicht als Zielprozess bis Hypercare und Handover. Dieser Produktumfang sagt nichts über den Status des aktuellen Kundenpiloten aus. Der Consultant beginnt mit Angebot, Entscheidungen, Datenvorlagen, Konfigurations-/SoD-Baseline und Entry-Gate; jede Ausführung benötigt aktuelle Evidence, und jede Abweichung wird als Standard, Parametrisierung, Change oder außerhalb des Pakets behandelt.

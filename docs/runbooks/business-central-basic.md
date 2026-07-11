---
documentId: UABC-HANDBOOK-BCB-CONSULTANT-001
projectId: UABC-BC-BASIC-001
version: 0.1-plan
status: Entwurf
simulation: true
deliverableRef: UABC-DEL-BCB-009
---

# Beratungshandbuch: BC Basic Einrichtung

Diese Betriebsanleitung ist ein Planungs- und Kontrollvertrag fuer die spaetere Sandbox-Grundeinrichtung. Sie autorisiert keinen Browserlauf, keinen BC-Schreibvorgang und keine fachliche Freigabe. Jede Ausfuehrung muss an einen unveraenderten Versionsstand, `playthru`, genau `UABC-BASIC-DE` und eine separate menschliche Autorisierung gebunden sein.

## 1. Vorbedingungen

1. Versionsstand der Projektablage, aktive OpenSpec-Aenderung und Projektindex sind festgehalten.
2. Zielgesellschaft, erlaubte Schreibvorgaenge, Arbeitsdatum und Ruecksetzplan sind projektspezifisch freigegeben.
3. Datenpaket und Finanz-/Steuerdesign haben benannte echte Pruefer.
4. Alle verwendeten Datensaetze sind synthetisch; keine `.env`, Browserprofile, Tokens, Bank- oder ELSTER-Zugangsdaten werden in Projektartefakte uebernommen.
5. Der Abrechnungssatz von 1.300 EUR netto pro Tag beziehungsweise 162,50 EUR netto pro Stunde ist verwendet; ein Budgetlimit wird nur angewendet, wenn es menschlich entschieden wurde.

Scheitert eine Vorbedingung, endet der Lauf vor der ersten Mutation.

## 2. Lieferfolge

### Phase 1: Vorbereitung und Anforderungen

`UABC-22` bis `UABC-26` klaeren Umfang, Finanz-/Steuerdesign, Handels- und Lagerprozesse, Datenbereitschaft und Abnahmeplan. Die Einrichtungswoche darf nicht fuer nachtraegliche Anforderungsklaerung verbraucht werden.

### Phase 2: Einrichtungswoche

`UABC-27` bindet das Ziel. Danach folgen Finanzwesen, Konfigurationspakete, Daten, Einkauf, Verkauf und einfacher Bestand in der Reihenfolge `UABC-28` bis `UABC-32`. `UABC-33` schult die Rollen. `UABC-34` dokumentiert Ende-zu-Ende-Pflichtfaelle, fachlichen Abnahmetest, vorbereitete UAT-Faelle und offene Fehler.

### Phase 3: einwoechige Hypercare

`UABC-35` nimmt nur priorisierte UAT- und Hypercare-Befunde auf. `UABC-36` probt den Monatsabschlussprozess in der Sandbox und dokumentiert Abstimmungen. `UABC-37` prueft die UStVA-Vorschau; Test-, Produktiv- und ELSTER-Uebermittlung bleiben gesperrt. `UABC-38` uebergibt Projektdokumentation und Schulungsunterlagen. Nach der einwoechigen Hypercare oder dem dokumentierten Abschluss werden weitere Taetigkeiten als Support oder eigenes Folgepaket bewertet.

## 3. Technische Ausfuehrungsgrenze

- Szenariokatalog: `playwright/scenarios/bc-basic-e2e.yaml`.
- Zulassung: nur exakt positivgelistete Szenarien und synthetische Datensatz-IDs.
- Abbruch: unbekannter Dialog, falsche Gesellschaft, unerklaerbare Buchungswirkung, fehlender Ruecksetzpunkt oder nicht freigegebene Aktion.
- Nachweis je Szenario: Lauf-ID, Szenario, Jira-Key, Anforderungsreferenz, Schrittereignisse, Screenshots, Datensatz-IDs, erwartete Buchungswirkung, beobachtetes Ergebnis und Pruefer.
- Aufbewahrung: Rohartefakte bleiben temporaer und werden erst nach Datenschutz- und Inhaltspruefung kuratiert.

Der aktuelle Katalog ist geplant, aber nicht ausgefuehrt. Kein Szenario ist bestanden.

## 4. Datenkontrolle

`project/bc-basic/data-package.yaml` ist die einzige geplante Datengrundlage. Jede Vorlage wird gegen Pflichtfelder, Eindeutigkeit, synthetische Kennzeichnung und Summen geprueft. Konfigurationspakete sind der bevorzugte Dienstleisterweg fuer Setupdaten, Stammdaten und kontrollierte offene Posten; manuelle BC-Schritte werden als Ausnahme begruendet. Historische Bewegungsdaten, reale offene Posten, Bankverbindungen, Steuerkennungen und Personendaten sind ausgeschlossen.

## 5. Abrechnung

Nur Arbeitsprotokolle zu `UABC-22` bis `UABC-38` koennen abrechenbar sein. Epic `UABC-18` und Stories `UABC-19` bis `UABC-21` sind reine Summen. Eine Rechnungszeile entsteht erst aus einer tatsaechlich geleisteten, genehmigten und noch nicht fakturierten Jira-Istzeit. Schaetzungen, Elternsummen, doppelte Arbeitsprotokolle, Kundenaufwaende und nicht entschiedene Budgetlimits sind ausgeschlossen.

## 6. Fachliche Abschlusskontrollen

- UAT: vorbereitete Faelle konnten ausgefuehrt werden oder blockieren nachvollziehbar; kein produktiver Start.
- Monatsabschluss: Prozess in der Sandbox geprobt und Abstimmungen dokumentiert, kein echter Monatsabschluss.
- UStVA: Vorschau fachlich geprueft, keine Test-, Produktiv- oder ELSTER-Uebermittlung.
- Steuergrenze: keine Steuer- oder Rechtsberatung und keine GoBD-Garantie.
- Handbuecher: Quellen, Version, Szenarien und Nachweise sind nachvollziehbar; fehlende Werte bleiben leer.

## 7. Ausschluesse unterhalb der Paketgrenze

Ausgeschlossen sind AL-Entwicklung, eigene Berichte oder Layouts, Integrationen, Power Platform, Dataverse, produktive Bankanbindung und PSD2, mehrere Firmen, Waehrungen, Banken oder Lagerorte, erweitertes Lager, Chargen, Seriennummern, Varianten-/Attributkomplexitaet ohne Pflichtgrund, Produktion, Service, Projekte, Anlagenbuchhaltung, Konsolidierung, Intercompany, Lohnabrechnung, historische Bewegungsdaten, E-Rechnung, Schulung zur Konfigurationspaketpflege, produktiver ELSTER-Versand, Support nach Hypercare sowie offene oder unbegrenzte Stabilisierungsphase.

## 8. Quellen und Nachweise

Die fachliche Grundlage bilden `SRC-BC-016`, `SRC-BC-052` bis `SRC-BC-057`, `SRC-LAW-001` und `SRC-ELSTER-001`. Projektanforderungen stehen in `UABC-REQ-BCB-001` bis `UABC-REQ-BCB-011`. Ausfuehrungsnachweise `UABC-VER-BCB-E2E-001`, `UABC-VER-BCB-TRAINING-001`, `UABC-VER-BCB-CLOSE-001`, `UABC-VER-BCB-VAT-001` und `UABC-VER-BCB-HANDOVER-001` bleiben bis zur echten Ausfuehrung `pending`.

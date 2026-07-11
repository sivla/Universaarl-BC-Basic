---
documentId: UABC-HANDBOOK-BCB-CONSULTANT-001
projectId: UABC-BC-BASIC-001
version: 0.1-plan
status: Entwurf
simulation: true
deliverableRef: UABC-DEL-BCB-009
---

# Beratungshandbuch: Business Central Basic

Diese Betriebsanleitung ist ein Planungs- und Kontrollvertrag fuer einen spaeteren Sandbox-Pilot. Sie autorisiert keinen Browserlauf, keinen BC-Schreibvorgang und keine fachliche Freigabe. Jede Ausfuehrung muss an einen unveraenderten Versionsstand, `playthru`, genau `UABC-BASIC-DE` und eine separate menschliche Autorisierung gebunden sein.

## 1. Vorbedingungen

1. Versionsstand der Projektablage, aktive OpenSpec-Aenderung und Projektindex sind festgehalten.
2. Zielgesellschaft, erlaubte Schreibvorgaenge, Arbeitsdatum und Ruecksetzplan sind projektspezifisch freigegeben.
3. Datenpaket und Finanz-/Steuerdesign haben benannte echte Pruefer.
4. Alle verwendeten Datensaetze sind synthetisch; keine `.env`, Browserprofile, Tokens, Bank- oder ELSTER-Zugangsdaten werden in Projektartefakte uebernommen.
5. Die 80-Stunden- und 9.600-EUR-Grenze ist vor jedem weiteren Arbeitspaket geprueft.

Scheitert eine Vorbedingung, endet der Lauf vor der ersten Mutation.

## 2. Lieferfolge

### Phase 1: Vorbereitung und Anforderungen

`UABC-22` bis `UABC-26` klaeren Umfang, Finanz-/Steuerdesign, Handels- und Lagerprozesse, Datenbereitschaft und Abnahmeplan. Die Einrichtungswoche darf nicht fuer nachtraegliche Anforderungsklaerung verbraucht werden.

### Phase 2: Einrichtungswoche

`UABC-27` bindet das Ziel. Danach folgen Finanzwesen, Daten, Einkauf, Verkauf und einfacher Bestand in der Reihenfolge `UABC-28` bis `UABC-32`. `UABC-33` schult die Rollen. `UABC-34` dokumentiert Ende-zu-Ende-Pruefung, fachlichen Abnahmetest und die Entscheidung ueber den Sandbox-Pilot mit dokumentierter Produktionsbereitschaft.

### Phase 3: begrenzte Stabilisierungsphase

`UABC-35` nimmt nur priorisierte Pilotbefunde auf. `UABC-36` probt den Monatsabschlussprozess in der Sandbox und dokumentiert Abstimmungen. `UABC-37` erzeugt UStVA-Vorschau und optionales XML lokal; Test- und Produktivuebermittlung bleiben gesperrt. `UABC-38` uebergibt Handbuecher und Projektdokumentation. Nach dem geplanten Enddatum oder dem dokumentierten Abschluss endet die Stabilisierungsphase; offene Erweiterungswuensche werden als eigenes Folgepaket bewertet.

## 3. Technische Ausfuehrungsgrenze

- Szenariokatalog: `playwright/scenarios/bc-basic-e2e.yaml`.
- Zulassung: nur exakt positivgelistete Szenarien und synthetische Datensatz-IDs.
- Abbruch: unbekannter Dialog, falsche Gesellschaft, unerklaerbare Buchungswirkung, fehlender Ruecksetzpunkt oder nicht freigegebene Aktion.
- Nachweis je Szenario: Lauf-ID, Szenario, Jira-Key, Anforderungsreferenz, Schrittereignisse, Screenshots, Datensatz-IDs, erwartete Buchungswirkung, beobachtetes Ergebnis und Pruefer.
- Aufbewahrung: Rohartefakte bleiben temporaer und werden erst nach Datenschutz- und Inhaltspruefung kuratiert.

Der aktuelle Katalog ist geplant, aber nicht ausgefuehrt. Kein Szenario ist bestanden.

## 4. Datenkontrolle

`project/bc-basic/data-package.yaml` ist die einzige geplante Datengrundlage. Jede Vorlage wird gegen Pflichtfelder, Eindeutigkeit, synthetische Kennzeichnung und Summen geprueft. Historische Bewegungsdaten, reale offene Posten, Bankverbindungen, Steuerkennungen und Personendaten sind ausgeschlossen.

## 5. Abrechnung

Nur Arbeitsprotokolle zu `UABC-22` bis `UABC-38` koennen abrechenbar sein. Epic `UABC-18` und Stories `UABC-19` bis `UABC-21` sind reine Summen. Eine Rechnungszeile entsteht erst aus einer tatsaechlich geleisteten, genehmigten und noch nicht fakturierten Jira-Istzeit. Schaetzungen, Elternsummen, doppelte Arbeitsprotokolle und die nicht aktivierte Reserve sind ausgeschlossen.

## 6. Fachliche Abschlusskontrollen

- Sandbox-Pilot: dokumentierte Produktionsbereitschaft, kein produktiver Start.
- Monatsabschluss: Prozess in der Sandbox geprobt und Abstimmungen dokumentiert, kein echter Monatsabschluss.
- UStVA: Vorschau und XML lokal erzeugt und fachlich geprueft, keine Test- oder Produktivuebermittlung.
- Steuergrenze: keine Steuer- oder Rechtsberatung und keine GoBD-Garantie.
- Handbuecher: Quellen, Version, Szenarien und Nachweise sind nachvollziehbar; fehlende Werte bleiben leer.

## 7. Ausschluesse unterhalb der Paketgrenze

Ausgeschlossen sind AL-Entwicklung, eigene Berichte oder Layouts, Integrationen, Power Platform, Dataverse, produktive Bankanbindung und PSD2, mehrere Firmen, Waehrungen, Banken oder Lagerorte, erweitertes Lager, Chargen, Seriennummern, Produktion, Kundendienst, Projekte, Anlagenbuchhaltung, Konsolidierung, Intercompany, Lohnabrechnung, historische Bewegungsdaten, E-Rechnung, produktiver ELSTER-Versand sowie offene oder unbegrenzte Stabilisierungsphase.

## 8. Quellen und Nachweise

Die fachliche Grundlage bilden `SRC-BC-016`, `SRC-BC-052` bis `SRC-BC-057`, `SRC-LAW-001` und `SRC-ELSTER-001`. Projektanforderungen stehen in `UABC-REQ-BCB-001` bis `UABC-REQ-BCB-011`. Ausfuehrungsnachweise `UABC-VER-BCB-E2E-001`, `UABC-VER-BCB-TRAINING-001`, `UABC-VER-BCB-CLOSE-001`, `UABC-VER-BCB-VAT-001` und `UABC-VER-BCB-HANDOVER-001` bleiben bis zur echten Ausfuehrung `pending`.

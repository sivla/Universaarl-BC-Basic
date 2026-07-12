---
documentId: UABC-HANDBOOK-BCB-CONSULTANT-001
projectId: UABC-BC-BASIC-001
version: 1.0
status: Kundenbereites Standardmuster
simulation: true
deliverableRef: UABC-DEL-BCB-009
---

# Beratungshandbuch: BC Basic Einrichtung

Diese Betriebsanleitung führt den Consultant durch das kundenbereite BC-Basic-V1-Muster. Die Referenzsimulation ist vollständig abgeschlossen. Für eine reale Kundeninstanz werden Ziel, Daten, Benutzer und Entscheidungen neu gebunden; erst das Entry-Gate autorisiert Sandboxschritte.

## 1. Vorbedingungen

1. Versionsstand der Projektablage, aktive OpenSpec-Aenderung und Projektindex sind festgehalten.
2. Zielgesellschaft, erlaubte Schreibvorgaenge, Arbeitsdatum und Ruecksetzplan sind projektspezifisch freigegeben.
3. Datenpaket und Finanz-/Steuerdesign haben benannte echte Pruefer.
4. Alle verwendeten Datensaetze sind synthetisch; keine `.env`, Browserprofile, Tokens, Bank- oder ELSTER-Zugangsdaten werden in Projektartefakte uebernommen.
5. Das aktuelle Standardangebot umfasst 80 Stunden zu 120 EUR und 9.600 EUR netto. Die historische 68-Stunden-Kalkulation ist kein paralleles Angebot.

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

Der Katalog ist in der Referenzsimulation synthetisch bestanden. In einer realen Kundeninstanz bleibt jeder Fall `planned`, bis Benutzer, Berechtigung, UI-Antwort, Buchung und Reset in der Sandbox belegt sind.

## 4. Datenkontrolle

`project/bc-basic/data-package.yaml` ist die einzige Datengrundlage. Acht kundenbereite Vorlagen und drei Wellen wurden synthetisch geprüft. Der Kunde ersetzt ausschließlich die synthetischen Werte durch freigegebene Quellen; Pflichtfelder, Eindeutigkeit, Referenzen und Summen werden vor jedem Import erneut geprüft.

## 5. Abrechnung

Das Standardangebot beträgt 80 Stunden/9.600 EUR. Nur genehmigte Arbeitsprotokolle der untersten Ticketebene zählen zum Ist; Elternsummen, Schätzungen und Kundenaufwand werden nicht doppelt erfasst. Die Referenzsimulation erzeugt keine Rechnung oder Zahlung.

## 6. Fachliche Abschlusskontrollen

- UAT: sieben Referenzfälle sind synthetisch bestanden; reale Key User wiederholen sie in der Kundensandbox.
- Monatsabschluss: Referenzprozess und Abstimmungen sind synthetisch bestanden; kein echter Monatsabschluss.
- UStVA: Referenzvorschau ist abgestimmt; keine Test-, Produktiv- oder ELSTER-Übermittlung.
- Steuergrenze: keine Steuer- oder Rechtsberatung und keine GoBD-Garantie.
- Handbuecher: Quellen, Version, Szenarien und Nachweise sind nachvollziehbar; fehlende Werte bleiben leer.

## 7. Ausschluesse unterhalb der Paketgrenze

Ausgeschlossen sind AL-Entwicklung, eigene Berichte oder Layouts, Integrationen, Power Platform, Dataverse, produktive Bankanbindung und PSD2, mehrere Firmen, Waehrungen, Banken oder Lagerorte, erweitertes Lager, Chargen, Seriennummern, Varianten-/Attributkomplexitaet ohne Pflichtgrund, Produktion, Service, Projekte, Anlagenbuchhaltung, Konsolidierung, Intercompany, Lohnabrechnung, historische Bewegungsdaten, E-Rechnung, Schulung zur Konfigurationspaketpflege, produktiver ELSTER-Versand, Support nach Hypercare sowie offene oder unbegrenzte Stabilisierungsphase.

## 8. Quellen und Nachweise

Die fachliche Grundlage bilden `SRC-BC-016`, `SRC-BC-052` bis `SRC-BC-084`, `SRC-LAW-001` und `SRC-ELSTER-001`. Die Referenznachweise sind synthetisch abgeschlossen. Dieselben Evidence-IDs bleiben in einer realen Kundeninstanz offen, bis die echte Sandboxausführung belegt ist.

## 9. V1-Exit und Kundenstart

Das wiederverwendbare Produkt hat `V1_STANDARDPRODUCT_READY`. Der Consultant beginnt eine Kundeninstanz mit Angebot, sieben Entscheidungen, acht Datenvorlagen, Konfigurations-/SoD-Baseline und Entry-Gate. Er konfiguriert, prüft, dokumentiert, übergibt an UAT und behandelt jede Abweichung als Standard, Parametrisierung, Change oder außerhalb des Pakets.

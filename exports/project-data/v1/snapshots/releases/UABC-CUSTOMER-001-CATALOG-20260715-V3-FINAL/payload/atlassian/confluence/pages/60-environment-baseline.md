---
id: UABC-ENVBASELINE
storyPageId: PAGE-UABC-070
title: 03 BC-Einrichtung und Konfigurationspakete
parent: null
spaceId: UABC-SPACE-CONSULTANT
spaceType: consultant-internal
order: 3
purpose: Interne Schrittfolge für sichere Vorbereitung, Konfiguration, Migration
  und Prüfung
audience: Consultant, Solution Architecture, Datenverantwortung und Testleitung
owners:
  - P-002
version: 5
status: published
jiraRefs:
  - UABC-11
  - UABC-12
  - UABC-13
  - UABC-14
referenceIds:
  - UABC-REQ-ENV-001
  - UABC-REQ-ENV-002
  - UABC-REQ-ENV-003
  - UABC-REQ-ENV-004
  - UABC-REQ-ENV-005
  - UABC-VER-ENV-POLICY-GATE-001
lastReviewed: 2026-07-13
---

# 03 BC-Einrichtung und Konfigurationspakete

## Einsatzvoraussetzungen

Diese interne Anleitung verbindet Umgebungskontrolle, BC-Konfiguration, Datenmigration und Testübergabe.
Sie enthält keine Zugangsdaten, keine Kundenevidence und keine Behauptung über eine konkrete Kundenumgebung.

## Sicherheits- und Qualitätsprinzip

Der Consultant arbeitet fail-closed: Umgebung und Gesellschaft identifizieren, Schreibumfang und Reset prüfen.
Danach werden abhängige Setup-Bereiche konfiguriert, Datenwellen abgestimmt und erst nach bestandenen Kontrollen an UAT übergeben.

## Umgebung, Einrichtung, Daten und Testdurchführung

### 1. Umgebung vorbereiten

Vor jeder schreibenden Tätigkeit werden Tenant, Umgebung, Gesellschaft, Region, BC-Version, Lokalisierungsfunktionen und Benutzerrolle sichtbar geprüft.

Auch erlaubte Operation und Rücksetzbarkeit müssen feststehen. Abweichungen stoppen die Ausführung, bis der Owner sie geklärt hat.

Secrets, Tokens und persönliche Zugangsdaten gehören weder in das Repository noch in Confluence oder Tickets.
Beobachtete UI-Werte werden nur mit Zeitpunkt, Rolle und Wahrheitsgrenze dokumentiert.

### 2. Standard konfigurieren

Die Einrichtung folgt den Abhängigkeiten des Produktstandards:

1. Company Information, General Ledger Setup und Accounting Periods.
2. `G/L Accounts` und allgemeine `Posting Groups` samt `General Posting Setup`.
3. `VAT Business/Product Posting Groups` und `VAT Posting Setup`.
4. Customer-, Vendor- und Inventory Posting Groups.
5. `No. Series`, `Dimensions`, `Payment Terms` und `Payment Methods`.
6. Purchases, Sales, Bank, Locations, Units of Measure und Inventory Setup.
7. Rollen, Funktionstrennung und Berechtigungsproben.

Zu jedem Parameter dokumentiert der Consultant BC-Seite, Feld, freigegebenen Wert, Owner, Abhängigkeit, erwartete Wirkung und Prüfschritt.
Nicht bestätigte Kunden- oder Steuerwerte bleiben als Parameter offen.

### 3. Daten migrieren

Die Datenarbeit wird in drei Wellen organisiert:

- **Welle 1:** Konten, Dimensionen, Buchungsgruppen und weitere Konfigurationsgrundlagen.
- **Welle 2:** Debitoren, Kreditoren, Artikel, Preise, Lagerorte und Einheiten.
- **Welle 3:** Anfangssalden, offene Posten und Anfangsbestände.

Jede Welle benötigt Quelle, Mapping, Transformation, Pflichtfeld- und Dublettenprüfung, Owner, Probeladung und fachliche Kontrollsumme.

Fehlerliste, Korrektur und Wiederholung bleiben nachvollziehbar. Leere, unbekannte oder widersprüchliche Werte werden nicht stillschweigend ergänzt.

### 4. Einrichtung und Daten prüfen

Nach jedem Setup-Abschnitt führt der Consultant einen feldnahen Check und einen passenden Prozessfall aus. Die zentrale Exit-Prüfung umfasst:

- vollständige und konsistente Posting-Matrizen;
- gültige VAT-/USt-, Dimensions- und Nummernserienlogik;
- abgestimmte Datenmengen, Salden, offene Posten und Bestände;
- positive und verweigerte Berechtigungsprobe je operativer Rolle;
- ausführbare P2P-, O2C-, Cash-, Bank-, Lager- und Abschlussfälle;
- dokumentierten Reset- und Wiederanlaufweg.

### 5. An UAT übergeben

UAT beginnt erst, wenn Entscheidungen, Datenqualität, Rollen, Sandboxvoraussetzungen und P1-/P2-Status das Entry-Gate erfüllen.
Die Übergabe umfasst Baseline, Testdaten, bekannte Einschränkungen, Evidencepfad, Defectweg und Retestregel.

### 6. Gesellschaft neu anlegen oder kopieren

Voraussetzung laut Microsoft Learn ist eine fuer die Mandantenverwaltung geeignete Berechtigung.
Im Zielsystem wird `SUPER` sichtbar bestaetigt und nicht aus einer Rollenanmutung abgeleitet.

- **Neu erstellen - Keine Daten:** leerer Pilot oder kontrollierter Neuaufbau; die Eignung wird je Kundenprojekt entschieden.
- **Neu erstellen - Nur Produktionssetupdaten:** nur wenn Standardsetupdaten fachlich geeignet und deren Herkunft geprueft sind.
- **Evaluation:** ausschliesslich Evaluierungszweck, nie still als Kundenbaseline.
- **Kopie:** nur bei ausdruecklicher Quelle-/Zielentscheidung, Datenschutzpruefung und Stillstandsfenster; keine Backupstrategie.

Auf Seite 357 `Mandanten` beziehungsweise `Companies` wird **Neu** gewaehlt und der Wizard gestartet.
Name, Erstelloption und Benutzerzuordnung werden geprueft; danach wird die Erstellung bestaetigt und Status `Completed` abgewartet.
Anschliessend wird die Zielgesellschaft erneut gelesen.
Bei Fehler wird keine zweite Gesellschaft blind angelegt; Status, Fehlermeldung und Rollbackentscheidung werden dokumentiert.

Fuer eine Kopie werden Quelle und neuer Zielname vorab dokumentiert sowie aktive Sessions und Sperren geklaert.
Personenbezogene oder produktive Daten sind ausgeschlossen.
Nach dem Wizard werden Company Information, Nummernserien, Buchungsgruppen, Benutzer, Integrationen und Jobqueues geprueft.
Loeschen ist eine separate freigabepflichtige Aktion. Eine Kopie ersetzt kein Backup.

### 7. Paketabhaengigkeiten vor Tabellenaufnahme

1. PRESEED: Country/Region `DE` bereitstellen und aufloesen.
2. `UABC-01-CORE-FINANCE`: Kernsetup, Posting/VAT, Nummernserien, Zahlungsbedingungen/-methoden und Dimensionen; Bankkonten gehören nicht in CORE.
3. `UABC-02-TRADE-MASTER`: Debitoren, Kreditoren, Artikel, Lager, Einheiten und Preise.
4. `UABC-03-OPENING-DATA`: Anfangssalden, offene Posten und Bestand ausschliesslich ueber kontrollierte Journals und Buchungen.

Jeder Schritt besitzt Entry, Exit, Owner, Validierung und gegebenenfalls Defect/Retest.
Gebuchte G/L-, Debitoren-, Kreditoren-, VAT-, Item-, Value- oder Bank-Ledger-Tabellen werden nie als Paketinhalt aufgenommen.

### 8. Kundenspezifische Anwendung der Methode

Der Consulting-Space führt keine ausgeführte Country-, Company- oder Paketwirkung. Das Kundenprojekt dokumentiert seinen Iststand, die Zielstrategie, den Resetpunkt, jede Schreibfreigabe und die späteren Readbacks in der dort kanonischen Baseline und Evidence.

Ein historischer Referenzlauf darf nur als abgelöste Methodenprovenienz verwendet werden. Er erfüllt kein aktuelles Kundengate. Ohne belegte Zielgesellschaft, Reset-/Wiederanlaufweg und getrennte Ist-/Soll-/Applied-Sicht bleibt jede schreibende Konfiguration gesperrt.

## Stopkriterien, Evidence und Übergabe

- Reale Permission Sets werden im Tenant identifiziert und nicht aus generischen Namen abgeleitet.
- VAT-/USt- und Lokalisierungsparameter benötigen Kunden- und gegebenenfalls Steuerberaterbestätigung.
- Integrationen, E-Rechnung, externe Bankkanäle und individuelle Reports werden separat bewertet.

## Referenzen

- [Consultant-Handbuch und Fast-Track](30-blueprint.md)
- [Discovery, Workshops und Fit-to-Standard](20-discovery.md)
- [Produkt: Prozess- und Konfigurationsstandard](31-processes.md)
- [Produkt: Lieferpaket, Tests und Standardtraining](81-bc-basic-handover.md)

<!-- story-metadata {"id":"PAGE-UABC-070","title":"03 BC-Einrichtung und Konfigurationspakete","parent":null,"version":5,"status":"published"} -->

---
id: UABC-BCBIMPLEMENTATION
title: Einrichtungswoche
parent: UABC-BCBPROJECT
owners: [P-002, P-004, P-005]
status: Kundenbereites Standardmuster
jiraRefs: [UABC-20, UABC-27, UABC-28, UABC-29, UABC-30, UABC-31, UABC-32, UABC-33, UABC-34]
referenceIds: [UABC-REQ-BCB-003, UABC-REQ-BCB-007, UABC-REQ-BCB-008, SRC-BC-077, SRC-BC-078, SRC-BC-079, SRC-BC-080, SRC-BC-081, SRC-BC-082, SRC-BC-083, SRC-BC-084]
lastReviewed: 2026-07-11
---

# Einrichtungswoche

Phase 2 ist als wiederverwendbare Fünf-Tage-Vorlage geplant und in der Referenzsimulation synthetisch abgeschlossen. Eine reale Kundeninstanz startet sie erst nach bestandenem Entry-Gate; jeder Schreibvorgang benötigt Zielbindung, Freigabe und Rücksetzpunkt.

## Reihenfolge

1. `UABC-27`: Zielgesellschaft lesen und binden, Grundeinrichtung sowie minimale Rollen pruefen.
2. `UABC-28`: Finanzwesen, SKR04, Buchungsmatrix, Mehrwertsteuer und Dimensionen einrichten.
3. `UABC-29`: Konfigurationspakete erstellen, ausschliesslich freigegebene synthetische Stammdaten laden und abstimmen.
4. `UABC-30` bis `UABC-32`: Einkauf, Verkauf und einfacher Bestand an Lagerort `HAUPT` mit den benannten Pflichtfaellen pruefen.
5. `UABC-33`: rollenbezogene Schulungen protokollieren.
6. `UABC-34`: Ende-zu-Ende-Pflichtfaelle, fachlichen Abnahmetest, UAT-Begleitung und offene Fehler dokumentieren.

## Lieferergebnisse

- `UABC-DEL-BCB-004`: gepruefte Standardkonfiguration.
- `UABC-DEL-BCB-005`: Schulungs- und Kompetenzpaket.
- `UABC-DEL-BCB-006`: fachlicher Abnahmetest und UAT-Begleitung.

Alle drei Lieferergebnisse sind in der Referenzsimulation `simulated-complete`. Für eine reale Kundeninstanz bleiben die Vorlagen `planned`, bis echte Benutzer, Sandboxausführung und Freigaben belegt sind. Keine simulierte Evidence wird als reale BC-Ausführung ausgegeben.

## Ausführbare Standardbaseline

Die Tabelle ist die feldnahe Consultant-Reihenfolge. „Standard“ beschreibt dokumentiertes BC-Verhalten, „synthetisch“ den Referenzwert, „bestätigen“ einen echten Kunden-/Sandboxpunkt. Keine Zeile behauptet eine reale Konfiguration.

| Abschnitt / BC-Seite über Suche | Feld oder Parameter | Synthetischer Standardwert | Owner | Abhängigkeit / erwartete Wirkung | Feldnahe Prüfung / Übergabe |
|---|---|---|---|---|---|
| 1 · **Company Information** | Name, Country/Region Code, Base Currency | `Universaarl-Simulation`, `DE`, `EUR` | `P-002`/`P-005` | freigegebene Zielgesellschaft; bindet Unternehmenskontext | Werte lesen, Gesellschaftskopf prüfen; `UABC-UAT-BCB-001` |
| 1 · **Finanzbuchhaltung Einrichtung** | Buchung erlaubt ab/bis, Mandantenwährung, globale Dimensionen | August 2026, `EUR`, `KOSTENSTELLE`, `GESCHAEFTSBEREICH` | `P-005` | Unternehmensdaten und Dimensionen; steuert Buchungszeitraum/Auswertung | erlaubtes und gesperrtes Datum prüfen; `UABC-UAT-BCB-001/006` |
| 1 · **Accounting Periods** | Starting Date, New Fiscal Year, Closed | Monatsperioden, Kalenderjahr | `P-005` | G/L Setup; steuert Abschluss und Sperre | Periode öffnen, Sperrwirkung nur als Sandboxprobe; `UABC-UAT-BCB-006` |
| 2 · **Chart of Accounts** | No., Name, Account Type, Direct Posting | reduzierter SKR04-orientierter Satz | `P-005` | steuerlich bestätigte Kontenliste; Grundlage aller Buchungsmatrizen | Rollen-/Sammelkonten auflösen, Trial Balance prüfen; `UABC-UAT-BCB-005` |
| 2 · **General Posting Setup** | Gen. Bus./Prod. Posting Group und Konten | `INLAND` × `HANDEL`/`DIENST` | `P-005` | Kontenplan und Gruppen; erzeugt Einkaufs-, Erlös-, Bestands-/Wareneinsatzwirkung | Preview Posting P2P/O2C ohne fehlendes Konto; `UABC-UAT-BCB-002/003` |
| 2 · **VAT Posting Setup** | VAT Bus./Prod. Posting Group, VAT %, Konten | `DE` × `VAT19` = 19 %, `VAT0` nur begründet | `P-005` | Konten/steuerliche Bestätigung; erzeugt VAT Entries | 79,80 EUR Vorsteuer und 140,10 EUR Umsatzsteuer nachvollziehen; `UABC-UAT-BCB-005/007` |
| 2 · **Customer/Vendor/Inventory Posting Groups** | Receivables, Payables, Inventory/Interim Accounts | `INLAND`, `HANDEL` | `P-005` | Kontenplan; bindet Nebenbücher und Lagerwert | Sammelkonten gegen Ledger Entries abstimmen; `UABC-UAT-BCB-002–005` |
| 3 · **Dimensions / Default Dimensions** | Code, Value Code, Value Posting | zwei globale Dimensionen, auf GuV-Belegen Pflicht | `P-005` | G/L Setup und Werte; verhindert unklassifizierte Buchung | fehlenden Wert blockieren, Default/Combination prüfen; `UABC-UAT-BCB-002/003/005` |
| 3 · **No. Series** | Code, Starting No., Manual Nos. | getrennte `SYN-`-Reihen je Belegart; manuell nur Eröffnung | `P-002` | Belegarten entschieden; sichert eindeutige Ketten | je Beleg genau nächste Nummer, Dublette ablehnen; `UABC-UAT-BCB-001–003` |
| 3 · **Payment Terms / Payment Methods** | Due Date Calculation, Code, Bal. Account | `14T`, `30T`, Überweisung | `P-005` | Partnerstamm/Bank; steuert Fälligkeit/Zahlungsweg | Fälligkeitsdatum und Applies-to-Bezug prüfen; `UABC-UAT-BCB-002/003/005` |
| 3 · **Reminder Terms** | Levels, Grace Period, Fees/Interest | eine Stufe, keine Gebühr/Zinsen/Übermittlung | `P-005`/`P-011` | Zahlungsbedingungen und rechtlicher Mahntext | Vorschlag erzeugen, keine externe Ausgabe/Buchung; O2C-UAT |
| 4 · **Bank Account Card / Bank Acc. Reconciliation** | Currency, Posting Group, Statement No. | ein synthetisches EUR-Konto, manuelle Abstimmung | `P-005` | Kontenplan/Zahlungsmethoden; bildet Cash-Kontrolle | 5.000 + 940,10 − 499,80 = 5.440,30 und Differenz 0; `UABC-UAT-BCB-005` |
| 4 · **Purchases & Payables / Sales & Receivables Setup** | Nummernserien, Pflichtreferenzen, Standardwerte | getrennte Bestell-/Rechnungs-/Auftrags-/Lieferreihen | `P-011` | Nummernserien/Partner/Artikel; steuert Belegfluss | Receive/Invoice und Ship/Invoice getrennt prüfen; `UABC-UAT-BCB-002/003` |
| 4 · **Inventory Setup / Locations / Units of Measure** | Location, Base Unit, Costing Method, Prevent Negative Inventory | `HAUPT`, `STK`, gleitender Durchschnitt, Negativbestand verhindern | `P-019` | Posting Groups/Artikel; steuert Menge und Wert | 100 STK/4.200 EUR, Inventurdifferenz und Entries prüfen; `UABC-UAT-BCB-004` |
| 5 · **Users / Permission Sets / User Groups** | Benutzer, Firma, zugewiesene Rechte | Rollenbedarf gemäß SoD-Matrix; keine erfundenen Setnamen | `P-004`/`P-001` | echte Benutzer/Lizenzen/Tenant-Sets; begrenzt Ausführung | positive und verweigerte Aktion je Rolle; `UABC-UAT-BCB-001–007` |
| 6 · **Trial Balance, Aged Accounts, Bank Reconciliation, Inventory Valuation, VAT Statement** | Filter, Periode, Dimensionen | Standardberichte ohne Anpassung | `P-005`/`P-019` | gebuchte Testkette; macht Kontrollen sichtbar | Summen, Filter und Drill-down gegen Ledger abstimmen; `UABC-UAT-BCB-004–007` |

Quellenzuordnung: Unternehmensdaten `SRC-BC-077`; Buchungsgruppen `SRC-BC-078`; Dimensionen `SRC-BC-079`; granulare Berechtigungen `SRC-BC-080`; VAT `SRC-BC-081`; deutsche Lokalisierung `SRC-BC-082`; Benutzer/Rollen `SRC-BC-083`; Perioden `SRC-BC-084`. Synthetische Werte und konkrete Konten bleiben Projektannahmen, keine Microsoft-Vorgaben.

### Entry und Exit je Abschnitt

| Abschnitt | Entry | Exit |
|---|---|---|
| 1 · Gesellschaft/Periode | Ziel, Lizenz, Rücksetzpunkt und Owner bestätigt | Gesellschaft, Währung, Datum und Periodenstatus geprüft |
| 2 · Finance/VAT | Konten- und Steuerentwurf bestätigt | jede verwendete Buchungsgruppenkombination besitzt gültige Konten; Preview Posting ohne Lücke |
| 3 · Steuernde Stammdaten | Dimensionen, Belegarten, Zahlungs-/Mahnpolitik entschieden | Pflichtdimension, Nummernfolge, Fälligkeit und Mahnvorschlag geprüft |
| 4 · Prozesse/Lager/Bank | Partner, Artikel, Bank und Lagerdaten qualitätsgeprüft | P2P/O2C/Bank/Lagerkontrollen mit Differenz null oder erklärtem Befund |
| 5 · Berechtigungen | echte Benutzer, Lizenz und Tenant-Berechtigungssätze sichtbar | je Rolle positive und verweigerte Aktion dokumentiert; kein unzulässiger SoD-Konflikt |
| 6 · Reporting/UAT | repräsentative Testbuchungen und UAT-Rollen vorhanden | Standardberichte/Drill-downs abgestimmt und an UAT übergeben |

## Rollen- und SoD-Matrix

Permission-Set-Namen werden nicht erfunden. Der Consultant ermittelt im echten Tenant die kleinste Standardberechtigungsfunktion und dokumentiert Abweichungen.

| Rolle | Erlaubte Aufgabe | Zu prüfender Berechtigungsbedarf | Verbotene Kombination | Positive / verweigerte Probe |
|---|---|---|---|---|
| `P-004` Administration | Benutzer/Firma/Rolle zuweisen, Setup lesen | Benutzer-/Berechtigungsverwaltung für Zielgesellschaft | eigene Prozessbelege buchen oder fachlich freigeben | Benutzerkontext prüfen / Einkaufsrechnung buchen wird verweigert oder eskaliert |
| `P-005` Finance | Journale, Zahlung, Abstimmung, Abschluss, VAT-Vorschau | Finance-Buchung und Standardberichte | eigene Zahlung allein vorbereiten und freigeben; Permission Sets administrieren | Journal/Abstimmung ausführen / Benutzerrechte ändern wird verweigert |
| `P-011` Handel | Einkauf/Verkauf erfassen, empfangen/liefern, prozessbezogen buchen | Einkaufs-/Verkaufsbelege und Partner lesen | Konten, VAT, Buchungsmatrix oder Zahlung ändern | P2P/O2C ausführen / VAT Posting Setup ändern wird verweigert |
| `P-019` Lager | Artikel/Lager lesen, Mengen buchen, Inventur | Artikel-/Lagerbuchungen und Lagerberichte | Bewertungskonten, VAT oder Zahlungsjournal ändern | Inventurdifferenz buchen / G/L Setup ändern wird verweigert |
| `P-016` Daten | Vorlagen prüfen und Import an Consultant übergeben | Leserechte und kontrollierter Importbedarf nur falls freigegeben | Setup/Buchung/Freigabe in Personalunion | Datenfehler protokollieren / unfreigegebenen Import ausführen wird verweigert |
| `P-001` Sponsor | Gates entscheiden und Evidence lesen | Leserechte auf Status/Reports nach Bedarf | operative Buchung oder Administration | UAT-/Cutoverstatus lesen / Buchung durchführen wird verweigert |

## DE-Lokalisierungscheck

Vor Setup werden BC-Version/Build aus **Help & Support**, Country/Region aus **Company Information**, Sprache/Region, installierte Extensions/Apps und verfügbare deutsche Funktionen nur lesend erfasst. `DE` allein beweist keine vollständige Lokalisierung. Danach werden VAT Posting Setup, VAT Entries/Statement, UStVA-Funktion, Konten und Kennzeichen gegen Kunden-/Steuerberaterentscheidung geprüft. Die Simulation berechnet nur die Vorschau; keine ELSTER-, Bank- oder sonstige externe Übermittlung ist zulässig.

## Abweichung und Consultant-Handlung

Jeder Befund erhält genau eine Behandlung: **Standard übernehmen** (dokumentiertes Verhalten passt), **kundenspezifisch parametrisieren** (Wert variiert ohne Produktänderung), **Change** (zusätzlicher Nutzen/Umfang/Test/Betrieb) oder **Out-of-Scope** (nicht Teil von BC Basic). Der Consultant arbeitet immer: **vorbereiten → konfigurieren → prüfen → dokumentieren → an UAT übergeben → Abweichung behandeln**. Unbekannte Seiten, Felder, Permission Sets oder Lokalisierungsfunktionen werden nicht geraten, sondern als Sandboxbefund mit Owner und Entscheidung geführt.

<!-- story-metadata {"id":"PAGE-UABC-110","parent":"PAGE-UABC-000","version":3,"status":"published"} -->

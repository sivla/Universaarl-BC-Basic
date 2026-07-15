# Business Central Basic – Consultant-Handbuch V4

## Einsatzregel

Dieses Runbook materialisiert den repositorybasierten V4-Betriebszyklus. Die kanonische Quelle ist `project/bc-basic/operating-cycle-v4.yaml`; Handbuch, Evidence und Katalog duerfen keine abweichenden Werte enthalten. Live-Tenant, Bank, ELSTER und reale Kundenkommunikation sind nicht Teil dieses Nachweises.

## Vorbereitung und Kontrollpunkte

1. Projekt-, Gesellschafts-, Rollen- und Periodenkontext lesen.
2. Anfangskontrollen sichern: Bank 5000,00 EUR, Lager 50 Stück/2100,00 EUR, Debitoren und Kreditoren 0,00 EUR, Trial Balance 7738,40 EUR beidseitig.
3. P2P, O2C, Zahlung, Bank und Lager nur mit den kanonischen Belegnummern durchspielen.
4. Pro Vorgang Buchungsvorschau, Beleg, Nebenbuch, Sachposten, MwSt.-Posten, Artikelposten und Wertposten zuruecklesen.
5. Kein Folgetor bei Differenz ungleich null oder offenem P1/P2.

## Buchungswirkungen

| Vorgang | Soll | Haben | Kontrolle |
| --- | --- | --- | --- |
| P2P | Bestand 420,00; Vorsteuer 79,80 | Kreditor 499,80 | Differenz 0,00 |
| O2C | Debitor 940,10; Wareneinsatz 420,00 | Umsatz 790,00; Umsatzsteuer 150,10; Bestand 420,00 | Differenz 0,00 |
| Kundenzahlung | Bank 940,10 | Debitor 940,10 | Restbetrag 0,00 |
| Lieferantenzahlung | Kreditor 499,80 | Bank 499,80 | Restbetrag 0,00 |
| Inventurdifferenz | Inventurdifferenzen 42,00 | Bestand 42,00 | 49 Stück/2058,00 EUR |

## Incident- und Retestverfahren

| ID | Klasse | Befund | Korrektur | Status |
| --- | --- | --- | --- | --- |
| UABC-V4-DEF-001 | P2 | USt.-Produktbuchungsgruppe war in der Einkaufszeile leer. | MWST19 am Artikel gesetzt und die noch ungebuchte Einkaufszeile neu validiert. | closed-synthetic |
| UABC-V4-DEF-002 | P2 | Verkaufspreis war 75,00 statt 79,00 EUR. | Preiszeile entfernt und 79,00 EUR aus der freigegebenen Baseline neu gelesen. | closed-synthetic |
| UABC-V4-DEF-003 | P2 | Zahlungsreferenz SINV-260510 konnte nicht ausgeglichen werden. | Referenz auf SINV-260501 korrigiert. | closed-synthetic |
| UABC-V4-DEF-004 | P2 | Eine Bankzeile enthielt keine Dokumentreferenz. | Bankzeile manuell gegen CPAY-260519 gematcht. | closed-synthetic |
| UABC-V4-DEF-005 | P2 | Inventurmenge 49 STK wich um 1 STK vom Buchbestand ab. | Inventurdifferenz minus 1 STK zu 42,00 EUR ueber ADJ-260527 gebucht. | closed-synthetic |

Zeitfolge je P2: melden, reagieren, Ursache sichern, korrigieren, dieselbe Ausgangslage retesten, Kontrollsummen lesen, Entscheidung dokumentieren, erst dann schliessen. Das Reaktions- und Abschlussziel betraegt im V4-Fall höchstens 240 Minuten.

## Restart

Der operative Restart am 2026-05-26 verwendet `UABC-V4-DAY-012` als letzte differenzfreie Baseline. Benutzer, Rollen, Buchungsperiode, Kernprozesse und Ledgerkontrollen werden gelesen. Bei Abweichung gilt: Zur differenzfreien Hypercare-Exit-Baseline vom 22. Mai zurueckkehren.

## Monatsabschluss

1. Buchungsstichtag und Periode kontrollieren.
2. Debitoren und Kreditoren gegen Sachbuch abstimmen.
3. Bankauszug 5440,30 EUR gegen Bankledger 5440,30 EUR abstimmen.
4. 49 Stück/2058,00 EUR aus Artikel-/Wertposten gegen Sachbuch abstimmen.
5. Umsatzsteuer 150,10 EUR und Vorsteuer 79,80 EUR gegen MwSt.-Posten abstimmen.
6. Trial Balance Soll/Haben 11080,20 EUR und Differenz null nachweisen.
7. UStVA nur als Vorschau erzeugen; keine Übermittlung und keine Steuerfreigabe behaupten.

## Abrechnung und Abschluss

V3: 78 Stunden/9360,00 EUR. V4-Aufgaben `UABC-51` bis `UABC-53`: 5 Stunden/600,00 EUR. Kumuliert: 83 Stunden/9960,00 EUR. Nur Task-Worklogs sind fakturierbar; alle Rechnungsprojektionen bleiben nicht versendet.

## Katalogübergabe

Der Generator schreibt relative Payloadpfade, Einzelhashes, Bundle- und Katalog-Aggregatdigest. Erst nach Stagingvalidierung wird `exports/project-data/v1/snapshots/current.json` atomar auf V4 gesetzt. Runtime: nur lesend, `requiresGit=false`.

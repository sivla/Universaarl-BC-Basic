# Business Central Basic – Kundenhandbuch V4

## Zweck und Wahrheitsgrenze

Dieses Handbuch beschreibt den synthetisch durchgespielten ersten Betriebszyklus der Saarblick Handel & Service GmbH vom 11. Mai bis 1. Juni 2026. Es ist aus `project/bc-basic/operating-cycle-v4.yaml` erzeugt. Es belegt weder eine produktive Business-Central-Buchung noch eine reale Bankbestaetigung, Steueruebermittlung oder Kundenabnahme.

## Taeglicher Arbeitsweg

1. Vor dem Buchen Gesellschaft, Arbeitsdatum, Buchungsperiode und eigene Rolle pruefen.
2. Beleg vollstaendig erfassen und vor der Buchung Nummer, Menge, Preis, Lagerort und MwSt.-Buchungsgruppe kontrollieren.
3. Buchungsvorschau lesen; nach der simulierten Buchung Beleg, Nebenbuch, Sachposten, Artikelposten und Wertposten per Drill-down abstimmen.
4. Eine Differenz sofort als Incident erfassen. Erst nach Ursache, Korrektur und identischem Retest weiterarbeiten.
5. Tagesabschluss mit verantwortlicher und kontrollierender Rolle dokumentieren.

## Einkauf

- Bestellung `PO-260501`, Wareneingang `PRE-260501`, Rechnung `PINV-260501`.
- 10 Stück zu 42,00 EUR ergeben 420,00 EUR netto, 79,80 EUR Vorsteuer und 499,80 EUR Kreditor.
- Kontrolle: Bestand und Vorsteuer im Soll, Kreditor im Haben; Tagesdifferenz 0,00 EUR.

## Verkauf

- Auftrag `SO-260501`, Lieferung `SHP-260501`, Rechnung `SINV-260501`.
- 10 Stück zu 79,00 EUR ergeben 790,00 EUR netto, 150,10 EUR Umsatzsteuer und 940,10 EUR Debitor.
- Der Wareneinsatz beträgt 420,00 EUR; Menge und Wert werden im Lager kontrolliert.

## Zahlungen und Bank

- Kundenzahlung `CPAY-260519`: 940,10 EUR, Debitor danach 0,00 EUR.
- Lieferantenzahlung `VPAY-260520`: 499,80 EUR, Kreditor danach 0,00 EUR.
- Kontoauszug `BSTMT-260531`: Bankanfang 5000,00 EUR, Endbestand 5440,30 EUR, Differenz 0,00 EUR.

## Lager und Inventur

Die Inventur `PHY-260527` ergab 49 statt 50 Stück. Mit `ADJ-260527` wurde ein Stück zu 42,00 EUR korrigiert. Endbestand: 49 Stück und 2058,00 EUR; Mengen- und Wertdifferenz jeweils null.

## Hypercare und Support

| Datum | Status | Incident | Entscheidung | Tagesabschluss |
| --- | --- | --- | --- | --- |
| 2026-05-12 | geschlossen-synthetisch | keiner | Buchungsbereitschaft differenzfrei; Folgetag freigegeben | Keine offene Aktion; Tageskontrollen null |
| 2026-05-13 | geschlossen-synthetisch | UABC-V4-DEF-001 | P2P nach identischem Retest und Differenz null fortgesetzt | Kreditor 499,80 EUR und Vorsteuer 79,80 EUR abgestimmt |
| 2026-05-14 | geschlossen-synthetisch | UABC-V4-DEF-002 | O2C nach Preis-Retest und Differenz null fortgesetzt | Debitor 940,10 EUR, Umsatzsteuer 150,10 EUR und Lagerwert abgestimmt |
| 2026-05-15 | geschlossen-synthetisch | keiner | Warenfluss ohne neue Abweichung bestaetigt | Artikel- und Wertposten differenzfrei |
| 2026-05-16 | geschlossen-synthetisch | keiner | Keine Eskalation erforderlich | Wochenendmonitoring ohne Aenderung |
| 2026-05-17 | geschlossen-synthetisch | keiner | Keine Eskalation erforderlich | Defectstatus kontrolliert; keine offene P1/P2 |
| 2026-05-18 | geschlossen-synthetisch | keiner | Zahlungsausgleich vorbereitet | Offene Posten und Referenzen kontrolliert |
| 2026-05-19 | geschlossen-synthetisch | UABC-V4-DEF-003 | Kundenzahlung nach Referenzkorrektur vollstaendig ausgeglichen | Debitoren offen 0,00 EUR; Bank 5.940,10 EUR |
| 2026-05-20 | geschlossen-synthetisch | keiner | Lieferantenzahlung synthetisch gebucht | Kreditoren offen 0,00 EUR; Bank 5.440,30 EUR |
| 2026-05-21 | geschlossen-synthetisch | UABC-V4-DEF-004 | Manuelles Matching nach Differenz-null-Retest angenommen | Auszug und Bankposten 5.440,30 EUR; Differenz 0,00 EUR |
| 2026-05-22 | exit-bestanden-synthetisch | keiner | Hypercare-Exit ohne offene P1/P2 | Elf Tagesabschluesse vollstaendig; Support uebernimmt Nachsorge |

Support nimmt einen Vorgang mit Belegnummer, Datum, Rolle, beobachtetem Ergebnis, Erwartung, Betrag oder Menge und Screenshot-/Evidence-Referenz an. P1 stoppt sofort; P2 blockiert den betroffenen Prozess bis zum identischen Retest; P3 wird im naechsten Daily entschieden.

## Monatsabschluss und UStVA-Vorschau

- Debitoren: Nebenbuch 0,00 EUR, Sachbuch 0,00 EUR, Differenz 0,00 EUR.
- Kreditoren: Nebenbuch 0,00 EUR, Sachbuch 0,00 EUR, Differenz 0,00 EUR.
- Bank: 5440,30 EUR laut Auszug und 5440,30 EUR im Ledger.
- Lager: 49 Stück und 2058,00 EUR.
- Summen- und Saldenliste: Soll und Haben jeweils 11080,20 EUR.
- UStVA-Vorschau: 150,10 EUR Umsatzsteuer minus 79,80 EUR Vorsteuer gleich 70,30 EUR Zahllast.

Die Vorschau wurde nicht übermittelt und ist keine Steuerberatung oder reale Steuerfreigabe.

## Weiterhin offene reale Gates

- REAL-GATE-01: Reale Zielgesellschaft und Lizenzen bestaetigen – **offen**
- REAL-GATE-02: Reale Finanz- und Steuerkonzeption freigeben – **offen**
- REAL-GATE-03: Reale Kundenstamm- und Eroeffnungsdaten abnehmen – **offen**
- REAL-GATE-04: Reale Rollen und Berechtigungen pruefen – **offen**
- REAL-GATE-05: Reale UAT durch Kundenrollen abnehmen – **offen**
- REAL-GATE-06: Reales Cutover-GO erteilen – **offen**
- REAL-GATE-07: Produktivstart und Hypercare real bestaetigen – **offen**
- REAL-GATE-08: UStVA pruefen und externe Uebermittlung separat autorisieren – **offen**

## Referenzen

`UABC-51`, `UABC-52`, `UABC-53`, `UABC-MTG-012`, `evidence/simulation/operating-cycle-v4.json`.

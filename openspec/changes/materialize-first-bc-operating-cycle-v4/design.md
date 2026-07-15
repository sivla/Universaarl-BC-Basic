# Design

## 1. Wahrheits- und Baselinevertrag

V3 bleibt historische, unveraenderliche Source of Truth bis ein vollstaendiger V4-Katalog alle Gates bestanden hat. V4 ist waehrend der Umsetzung ausschliesslich der eine aktive OpenSpec-Change; es entsteht weder ein zweiter Jira-Baum noch ein zweiter Confluence-Seitenbaum oder ein alternativer Projektindex.

| Baselinewert | Unveraenderlicher Wert |
| --- | --- |
| Ausgangscommit | `9d669bf14fc82d4056c20e7c555ec67720a4ddbd` |
| V3-Release | `UABC-CUSTOMER-001-CATALOG-20260715-V3-FINAL` |
| Manifest-SHA-256 | `ce92caf9d612bf8fff8fd84cc12c5e13fd20bc8ec3535b13ac4ba0b931cb7c8f` |
| Payload-Bundle-Digest | `bc691ce634b38e782280016bf3e34ac683d70f705a3bb4be46f995ef37e2e57b` |
| V3-Release-Dateien | 125 |
| M1-Kontrollhash ueber relative Dateipfade und Datei-SHA-256 | `981a56d7ba9956a61b90d01b6dc5f1982b6f1163ebcbf5c0aa61f8b9a2b76507` |
| Tickets | 50 bestehende IDs `UABC-1` bis `UABC-50` |
| Abrechnung | 78 Stunden, 9.360 EUR netto, 19 Task-Worklogs, 9 nicht versendete Rechnungsprojektionen |

Der Kontrollhash ist ein M1-Zusatznachweis; Manifest- und Payload-Digest bleiben die fachlich autoritativen Katalogwerte. Kein V3-Payload, Manifest, `current.json` oder bestehender fachlicher Identifier wird fuer M1 geaendert.

## 2. V4-Kalender und Tagesverantwortung

Jeder Kalendertag vom Cutover bis zum Handover besitzt einen Zustand. Wochenenden und Feiertage werden als kontrollierte Tage ohne geplante Buchung ausgewiesen und nicht stillschweigend ausgelassen. Der V3-Eintrag `restart: 2026-05-25` bleibt historisch bestehen. Da der 25. Mai 2026 Pfingstmontag ist, bezeichnet V4 diesen Tag als vorbereitenden Ruhe- und Monitoringtag; der operative Restart erfolgt am naechsten Arbeitstag, dem 26. Mai. Diese Konkretisierung erzeugt weder eine neue Rechnung noch eine rueckwirkende V3-Aenderung.

| Datum | V4-Tag | Fuehrende Verantwortung | Verbindliche Aktivitaet und Tageskontrolle | Ticketanker |
| --- | --- | --- | --- | --- |
| 2026-05-11 | Cutover | `P-PILOT-LEAD-001`, `ROLE-CUSTOMER-IT`, `ROLE-CUSTOMER-FINANCE` | Cutover-Checkliste, Anfangssalden, Smoke-Test, synthetisches GO/NO-GO | `UABC-44`, `UABC-MTG-010` |
| 2026-05-12 | Hypercare 01 | `ROLE-CUSTOMER-FINANCE` | Rollen-, Perioden- und Buchungsbereitschaft; Tagesjournal ohne Differenz | `UABC-46`, `UABC-47` |
| 2026-05-13 | Hypercare 02 | `ROLE-CUSTOMER-PURCHASE` | P2P Bestellung, Wareneingang und Rechnung; Beleg- und Kreditorenkontrolle | `UABC-37`, `UABC-47` |
| 2026-05-14 | Hypercare 03 | `ROLE-CUSTOMER-SALES` | O2C Auftrag, Lieferung und Rechnung; Debitoren-, Umsatz- und Bestandskontrolle | `UABC-38`, `UABC-47` |
| 2026-05-15 | Hypercare 04 | `ROLE-CUSTOMER-WAREHOUSE` | Bestandsbewegungen und offener Warenfluss; Menge und Wert abstimmen | `UABC-39`, `UABC-47` |
| 2026-05-16 | Hypercare 05 | `ACTOR-KUNDEN-SUPPORT` | Wochenendmonitoring, keine geplante Buchung, Ereignis- und Erreichbarkeitsstatus | `UABC-47` |
| 2026-05-17 | Hypercare 06 | `ACTOR-KUNDEN-SUPPORT` | Wochenendmonitoring, keine geplante Buchung, offene Defects pruefen | `UABC-47` |
| 2026-05-18 | Hypercare 07 | `ROLE-CUSTOMER-FINANCE` | Offene Posten und Zahlungsreferenzen fuer den Ausgleich vorbereiten | `UABC-46`, `UABC-47` |
| 2026-05-19 | Hypercare 08 | `ROLE-CUSTOMER-SALES`, `ROLE-CUSTOMER-FINANCE` | Kundenzahlung `CPAY-260519`, Ausgleich und Hypercare-Triage | `UABC-47`, `UABC-MTG-011` |
| 2026-05-20 | Hypercare 09 | `ROLE-CUSTOMER-PURCHASE`, `ROLE-CUSTOMER-FINANCE` | Lieferantenzahlung `VPAY-260520` und Kreditorenausgleich | `UABC-47` |
| 2026-05-21 | Hypercare 10 | `ROLE-CUSTOMER-FINANCE` | Bankmatching, Defectkorrektur und Retest; Bank-/Ledgerdifferenz null | `UABC-47` |
| 2026-05-22 | Hypercare 11 | `P-PILOT-LEAD-001`, `ACTOR-KUNDEN-SUPPORT` | Exitpruefung, keine offenen P1/P2, Restpunkte mit Owner und Termin | `UABC-46`, `UABC-47` |
| 2026-05-23 | Nachsorge 01 | `ACTOR-KUNDEN-SUPPORT` | Monitoring ohne geplante Aenderung; LKG und Eskalationsbereitschaft | `UABC-47` |
| 2026-05-24 | Nachsorge 02 | `ACTOR-KUNDEN-SUPPORT` | Monitoring ohne geplante Aenderung; Restart-Voraussetzungen pruefen | `UABC-47` |
| 2026-05-25 | Restart-Vorbereitung | `ACTOR-KUNDEN-SUPPORT` | Pfingstmontag, keine operative Buchung; V3-Meilenstein und Verschiebungsgrund dokumentieren | `UABC-47` |
| 2026-05-26 | Operativer Restart | `ROLE-CUSTOMER-IT`, `ROLE-CUSTOMER-FINANCE` | Benutzer-, Berechtigungs-, Perioden- und Prozess-Smoke-Test; keine Differenz | `UABC-47` |
| 2026-05-27 | Abschluss 01 | `ROLE-CUSTOMER-WAREHOUSE`, `ROLE-CUSTOMER-FINANCE` | Inventur `PHY-260527`, Korrektur `ADJ-260527`, Lager-/Sachbuchabgleich | `UABC-47` |
| 2026-05-28 | Abschluss 02 | `ROLE-CUSTOMER-FINANCE` | Nebenbuecher, Bank, Lager, Sachbuch und VAT abstimmen; UStVA-Vorschau ohne Uebermittlung | `UABC-47`, `UABC-48` |
| 2026-05-29 | Retro | `P-PILOT-LEAD-001`, `ROLE-CUSTOMER-SPONSOR` | Defecttrend, Lessons Learned und Abschlussbereitschaft synthetisch entscheiden | `UABC-49` |
| 2026-05-30 | Abschlussmonitoring 01 | `ACTOR-KUNDEN-SUPPORT` | Keine geplante Buchung; nur P1/P2-Eskalationsbereitschaft | `UABC-50` |
| 2026-05-31 | Periodenstichtag | `ROLE-CUSTOMER-FINANCE`, `ACTOR-KUNDEN-SUPPORT` | Kontoauszug `BSTMT-260531` als unveraenderlichen Stichtagsinput sichern; keine externe Bankaktion | `UABC-48`, `UABC-50` |
| 2026-06-01 | Handover | `ACTOR-KUNDEN-SUPPORT`, `P-PILOT-LEAD-001` | Supportannahme, Restpunkteliste, Handbuecher, Katalog und synthetischer Projektabschluss | `UABC-50`, `UABC-MTG-012` |

## 3. Anfangssalden und Rechenvertrag

Die V4-Anfangssalden sind Kontrollwerte der synthetischen Betriebszyklussimulation, keine reale Eroeffnungsbilanz und keine produktive Buchung.

| Kontrollobjekt zum 2026-05-11 | Anfangswert | Herleitung und Folgekontrolle |
| --- | ---: | --- |
| Bank | 5.000,00 EUR | V3-Bankfall; nach +940,10 EUR und -499,80 EUR muss 5.440,30 EUR entstehen. |
| Bestand Artikel `A100` am Lagerort `HAUPT` | 50 STK / 2.100,00 EUR | Einkauf +10 und Verkauf -10 veraendern den Ausgangsbestand netto nicht; Inventurdifferenz -1 fuehrt zu 49 STK / 2.058,00 EUR. |
| Debitoren offen | 0,00 EUR | `SINV-260501` erzeugt 940,10 EUR; `CPAY-260519` gleicht vollstaendig aus. |
| Kreditoren offen | 0,00 EUR | `PINV-260501` erzeugt 499,80 EUR; `VPAY-260520` gleicht vollstaendig aus. |
| Vorsteuer des Betriebszyklus | 0,00 EUR | P2P erzeugt 79,80 EUR Vorsteuer. |
| Umsatzsteuer des Betriebszyklus | 0,00 EUR | O2C erzeugt 150,10 EUR Umsatzsteuer. |
| Sachbuch-Sollsumme und -Habensumme | je 7.738,40 EUR | Aus V3-Abschlusssumme 11.080,20 EUR abzueglich 3.341,80 EUR beidseitiger Zyklusbewegungen; Kontenaufloesung wird in M2 materialisiert und muss diese Summe unveraendert bestaetigen. |

Die beidseitigen Zyklusbewegungen sind P2P 499,80 EUR, O2C 1.360,10 EUR, Kundenzahlung 940,10 EUR, Lieferantenzahlung 499,80 EUR und Inventurdifferenz 42,00 EUR. Jede spaetere Materialisierung muss die Formel, die Einzelposten und den Endwert `trialBalanceDebit = trialBalanceCredit = 11080.20` reproduzieren. Eine unbekannte oder abweichende Kontenaufloesung stoppt M2; sie darf nicht durch einen erfundenen Ausgleichswert geschlossen werden.

## 4. Tageskontrollen und Evidence

Jeder operative Tag benoetigt genau einen Tagesrecord mit Datum, Status, verantwortlicher und kontrollierender Rolle, Eingangsbestand, Belegen, Ledgerwirkungen, Kontrollsummen, Defects, Entscheidungen, Retests, Ticket-, Meeting-, Prozess-, Test- und Evidence-Referenzen sowie Tagesabschluss. Tage ohne geplante Buchung benoetigen trotzdem Monitoringstatus, Erreichbarkeit und die ausdrueckliche Bestaetigung, dass keine Aenderung erfolgte.

Fuer einen Tagesabschluss gelten mindestens:

1. jeder Beleg besitzt eindeutige Nummer, Zeitpunkt und Prozessbezug;
2. Soll und Haben, Nebenbuch und Sachbuch sowie Lagerbewegung und Wertposten sind differenzfrei;
3. offener Defect besitzt Klasse, Owner, Reaktionsfrist, Entscheidung und naechste Aktion;
4. eine Korrektur wird nur mit identischer Ausgangslage retestet;
5. kein Ticket ist vor seiner Tages-Evidence geschlossen;
6. sichtbare synthetische Abnahme und reale Freigabe bleiben getrennte Felder.

## 5. Defectklassen und Stopregeln

Die bestehenden Klassen P1 bis P3 werden unveraendert verwendet; M1 fuehrt keine zweite Prioritaetslogik ein.

| Klasse | Einstufung | Reaktion und Owner | Gatewirkung |
| --- | --- | --- | --- |
| P1 | Datenverlust, unkontrollierte Buchungswirkung, falsche Gesellschaft, Sicherheits- oder Wahrheitsbruch | sofortiger Stopp; `P-PILOT-LEAD-001` und `ROLE-CUSTOMER-SPONSOR`; Reset-/LKG-Entscheidung | Tagesabschluss und alle Folgegates blockiert |
| P2 | Finanz-, Steuer-, Nebenbuch-, Lager- oder Berechtigungsdifferenz; Kernprozess nicht reproduzierbar | innerhalb vier Stunden; fachlicher Owner und Projektleitung; Ursache, Korrektur, identischer Retest | betroffener Prozess sowie Hypercare-, Restart-, Abschluss- und Handovergate blockiert |
| P3 | Bedien-, Dokumentations- oder Komfortabweichung ohne falsche Buchungswirkung | im naechsten Daily; `ACTOR-KUNDEN-SUPPORT` routet zum Owner | einzeln nicht blockierend; kumulierte Kontroll- oder Befaehigungswirkung kann zu P2 hochgestuft werden |

Jede finanzielle Kontrolldifferenz ungleich null ist mindestens P2. Ein fehlender Owner, eine fehlende Frist oder ein nicht reproduzierbarer Retest laesst den Defect offen. Reale Produktions- oder Steuerfreigaben koennen in der Simulation weder erteilt noch durch einen Defectstatus ersetzt werden.

## 6. Gate- und Abnahmekriterien

| Gate | Entscheidungskriterium | Verantwortliche synthetische Entscheidung | Stopregel |
| --- | --- | --- | --- |
| `UABC-V4-GATE-001` Baseline | V3-Digests, 50 bestehende IDs und 78 Stunden unveraendert | Projektleitung und Repositoryvalidator | jede Abweichung stoppt V4 |
| `UABC-V4-GATE-002` Cutover | Anfangssalden, Smoke-Test, Resetweg, Rollen und offene Defects belegt | Sponsorin nach Finance-/IT-Konsultation | P1/P2 oder Differenz ergibt synthetisches NO-GO |
| `UABC-V4-GATE-003` Tagesabschluss | Tagesrecord vollstaendig und alle Pflichtkontrollen null | fachlicher Tagesowner plus Finance | fehlende Evidence sperrt den Folgetag |
| `UABC-V4-GATE-004` Hypercare-Exit | alle elf Tage belegt, kein offener P1/P2, Restpunkte mit Owner und Termin | Projektleitung und Support | Hypercare wird sichtbar nicht beendet |
| `UABC-V4-GATE-005` Restart | Rollen-, Berechtigungs-, Perioden- und Kernprozess-Smoke-Test bestanden | IT und Finance | Fehler fuehrt zum dokumentierten LKG-/Resetweg |
| `UABC-V4-GATE-006` Monatsabschluss | Bank, AR, AP, Lager, VAT und Sachbuch rechnerisch geschlossen | Finance | Differenz oder ungepruefte Buchung stoppt Abschluss |
| `UABC-V4-GATE-007` UStVA-Vorschau | 150,10 EUR Umsatzsteuer minus 79,80 EUR Vorsteuer = 70,30 EUR Vorschau; keine Uebermittlung | Finance; reale Steuerfreigabe bleibt offen | jede externe Uebermittlung oder Steuerbehauptung stoppt V4 |
| `UABC-V4-GATE-008` Handover/Katalog | Supportannahme, Handbuecher, Restpunkte, Referenzen, Manifest und Digests validiert | Support und Projektleitung | current-Zeiger bleibt auf V3 |

## 7. V3-zu-V4-Mapping ohne parallele Wahrheit

| V3-Quelle | V4-Erweiterung | Regel |
| --- | --- | --- |
| `project/bc-basic/pilot-v3.yaml` und `UABC-PILOT-V3-001` | spaeter genau ein V4-Betriebszyklusmodell | V3 bleibt bytegleich; V4 referenziert, ersetzt aber nicht die Historie. |
| `UABC-44`, `UABC-MTG-010` | Cutovertag und `UABC-V4-GATE-002` | keine neue Abrechnung fuer bereits belegte Cutoverarbeit |
| `UABC-46`, `UABC-47`, `UABC-MTG-011` | elf einzelne Hypercaretage | bestehende 3 Stunden `WL-UABC-46-V3` bleiben einmalig; Detail-Evidence ist nicht erneut fakturierbar |
| `UABC-V3-P2P-001`, `UABC-V3-O2C-001` | Tagesbelege am 13. und 14. Mai | Belegnummern, Betraege und Ledgerwirkungen bleiben unveraendert |
| `UABC-V3-PAY-001`, `UABC-V3-BANK-001` | Zahlungstage und Bankabstimmung | bestehende Zahlungs- und Kontoauszugsreferenzen bleiben erhalten |
| `UABC-V3-INV-001`, `UABC-47` | Inventur am 27. Mai | 49 STK und 2.058,00 EUR bleiben Endkontrolle |
| `UABC-V3-CLOSE-001`, `UABC-47` | Abschluss am 27./28. Mai | 11.080,20 EUR Soll und Haben bleiben Abschlusskontrolle |
| `UABC-V3-VAT-001`, `UABC-48` | UStVA-Vorschau am 28. Mai | 70,30 EUR Vorschau, keine Uebermittlung |
| `UABC-49` | Retro am 29. Mai | keine neue Kundenfreigabe behaupten |
| `UABC-50`, `UABC-MTG-012`, `UABC-DEL-BCB-009` | Handover am 1. Juni | dieselben Kunden-, Produkt- und Consultant-Unterlagen referenzieren |

M1 erzeugt keine neuen Jira-Tickets, Worklogs, Rechnungen, Confluence-Seiten oder Projektfakten. In M2 duerfen neue Tickets nur im bestehenden `UABC-*`-Namensraum und innerhalb der vorhandenen Phase-Epic-Story-Task-Hierarchie angelegt werden. Sie muessen eine ausdrueckliche Erweiterungsrelation besitzen und duerfen keine V3-ID umdeuten. Der kanonische Generator bleibt die einzige Quelle fuer Jira-, Confluence-, Evidence- und Katalogprojektionen.

## 8. Budget- und Aktivierungsregel

- V3 bleibt bei 78 Stunden und 9.360 EUR netto.
- M1 ist eine nicht fakturierte Planungs- und Vertragsfortschreibung und erzeugt 0 neue Kundenstunden.
- Spaetere V4-Arbeit ist nur mit neuem Task-Worklog, Leistungsdatum, eindeutiger Leistung, synthetischer Genehmigung und Wochenrechnungszeile zulaessig.
- Elternrollups, Detail-Evidence fuer bereits fakturierte Arbeit und reine Generator-/Validatorlaeufe sind nicht fakturierbar.
- Maximal 5 neue Stunden zu 120 EUR beziehungsweise 600 EUR sind zulaessig; kumuliert hoechstens 83 Stunden und 9.960 EUR netto.
- Ein sechste zusaetzliche Stunde, eine Doppelreferenz oder ein kumulierter Betrag ab 10.000 EUR stoppt die Materialisierung fail-closed.
- `current.json` bleibt auf V3, bis M2 bis M4, OpenSpec strict, ID-/Budget-/Referenztests und der V4-Katalog vollstaendig bestanden sind.

## 9. M2-Materialisierung

`project/bc-basic/operating-cycle-v4.yaml` ist die einzige kanonische Quelle des M2-Deltas. Der Generator
`scripts/materialize-bc-operating-cycle-v4.mjs` leitet daraus genau das Betriebsjournal
`evidence/simulation/operating-cycle-v4.json` ab. Das Journal umfasst alle 22 Kalendertage, die V4-Bewegungen,
laufende Nebenbuch-, Lager-, Bank-, VAT- und Sachbuchkontrollen sowie bidirektionale Rueckverweise. Es ist bis M4
nicht Twin-sichtbar und schaltet den aktuellen V3-Katalog nicht um.

Die einzige neue Jira-Arbeit ist `UABC-51` mit dem Kurztitel `Betriebsjournal` als Task unter der bestehenden Story
`UABC-31`. Das Worklog `WL-UABC-51-V4` umfasst am 1. Juni 2026 genau 3 Stunden zu 120 EUR beziehungsweise 360 EUR.
Damit betraegt die kumulierte Projektion 81 Stunden und 9.720 EUR netto. Die Rechnungszeile bleibt nicht versendet;
die dokumentierte Annahme ist ausschliesslich synthetisch. Bestehende V3-Arbeit wird nicht erneut fakturiert.

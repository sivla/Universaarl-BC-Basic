# Solution Design: Universaarl Enterprise Blueprint v0.1

## 1. Faktenbasis, Annahmen und Leitentscheidung

Kanonische dauerhafte Inhalte liegen in `architecture/enterprise-blueprint.yaml` und `capabilities/catalog.yaml`. Dieses Design dokumentiert Herleitung und Alternativen, ist aber nach einer Archivierung nicht die alleinige Quelle aktueller Architekturwahrheit.

### Belegte Produktfakten

- Business Central unterstuetzt getrennte Unternehmen, unternehmensbezogene Berechtigungszuweisungen, Dimensionen, Lagerorte und Lagerplaetze, Intercompany-Prozesse sowie ein eigenes Konsolidierungsunternehmen. Quellen: `SRC-BC-003` bis `SRC-BC-009` im Quellenregister.
- Ein Lagerplatz ist die feinere physische Struktur innerhalb eines Lagerorts; `Bin Mandatory` und Warehouse-Funktionen werden pro Lagerort festgelegt.
- Dimensionen kennzeichnen Buchungen zur Analyse. Sie sind keine rechtlichen Einheiten und kein Ersatz fuer Lagerorte, Projekte oder Berechtigungsgrenzen.

### Planungsreferenz und tatsaechliche Baseline

- `planningReference = 2026 Release Wave 1` strukturiert den fachlichen Rechercheumfang.
- `actualSandboxBaseline = unknown`; vor jedem Implementierungsentscheid werden Version, Lokalisierung, Apps und Featurezustand in `playthru` direkt belegt.
- Aus der Planungsreferenz wird keine Feature-Verfuegbarkeit abgeleitet.

### Annahmen fuer v0.1

- Alle vier Gesellschaften sind deutsche Rechtstraeger mit EUR, deutschem Konten-/Steuerrahmen und Kalendergeschaeftsjahr.
- Der spaetere Tenant und die Sandbox `playthru` koennen alle V2-Unternehmen aufnehmen; Kapazitaet, Lizenzierung und installierte Apps sind noch nicht nachgewiesen.
- Produktkonfiguration bleibt bewusst standardnah. Barcode/WMS, PLM, Reisekosten, Payroll und Field-Service-Mobile-App sind Entscheidungspunkte, keine zugesagten Integrationen.
- Alle Personen und Daten sind synthetisch; Namensgleichheit mit realen Personen waere zufaellig.

### Leitentscheidung DEC-001

Status `approved` am 2026-07-10 durch ausdrueckliche Entscheidung des realen Repository-Nutzers; dieser ist keine synthetische Jira-Person und nicht P-001.

Vier rechtliche operative Gesellschaften erhalten je ein BC-Unternehmen; ein fuenftes, nicht operatives BC-Unternehmen dient der Konsolidierung. UAM-DE ist eine substanzielle Holding-/Shared-Service-Gesellschaft mit Beteiligungen, HQ-Assets, eigenen Mitarbeitern, Bank-/Steuerstruktur sowie Finance-, IT- und Data-Governance-Leistungen auf Basis dokumentierter Servicevereinbarungen und Umlageschluessel. UAP-DE schliesst eigene Projektvertraege, beschaeftigt eigene Ressourcen und traegt Projekt-, WIP-, Forderungs- und Subunternehmerrisiken sowie eine eigene Bank-/Steuerstruktur. Reale Steuer-IDs, Bankdaten und Rechtsauskuenfte sind nicht Bestandteil des synthetischen Blueprints.

## 2. Geschaeftsmodell

Universaarl entwickelt, fertigt, vertreibt und betreut modulare Energie- und Gebaeudeautomationsloesungen fuer mittelstaendische Industrie, kommunale Betreiber und technische Gebaeudedienstleister im DACH-Raum.

| Erloesstrom | Angebot | Vertrags-/Buchungscharakter | Primaere Einheit |
| --- | --- | --- | --- |
| Serienprodukte | Sensor Hubs, Edge Controller, Schaltschranke | Artikelverkauf, teilweise Serien-/Chargennachverfolgung | UAS-DE / UAD-DE |
| Ersatzteile | Netzteile, I/O-Module, Kabelsaetze | Lagerverkauf mit hoher Verfuegbarkeit | UAD-DE |
| Projektloesungen | Engineering, Installation, Inbetriebnahme | BC-Projekt mit Ressourcen, Artikeln, Fremdleistung und Meilensteinen | UAP-DE |
| Service | Wartungsvertrag, Stoerung, Reparatur | Serviceartikel, Serviceauftrag, Ersatzteilverbrauch und Faktura | UAD-DE |
| Shared Services | Finance, IT, HR-Administration | Konzerninterne Umlage/Servicefaktura | UAM-DE |

Produktfamilien: `SENSE` (Sensorik), `EDGE` (Steuerungen), `PANEL` (kundenspezifische Schaltschranke), `SPARE` (Ersatzteile). Dienstleistungen: `ENG` Engineering, `INSTALL` Montage, `COMM` Inbetriebnahme, `CARE` Wartung, `REPAIR` Reparatur, `ACADEMY` Kundenschulung.

## 3. Konzern, BC-Unternehmen und Organisation

| Rechtstraeger / Einheit | BC-Unternehmen | Zweck | Operativ? | Hauptsitz / Buchungswaehrung |
| --- | --- | --- | --- | --- |
| Universaarl Management GmbH | `UAM-DE` | Holdingnahe Shared Services, zentrale Finance/IT-Kosten, Anlagen HQ | Ja | Saarbruecken / EUR |
| Universaarl Automation Systems GmbH | `UAS-DE` | Entwicklung, Einkauf und Fertigung | Ja | Neunkirchen / EUR |
| Universaarl Distribution & Service GmbH | `UAD-DE` | Vertrieb, Distribution, Ersatzteile und technischer Service | Ja | Saarlouis / EUR |
| Universaarl Projects GmbH | `UAP-DE` | Engineering-, Installations- und Inbetriebnahmeprojekte | Ja | St. Ingbert / EUR |
| Universaarl Group Consolidation | `UAC-CONS` | Finanzkonsolidierung und Eliminierung; kein Rechtstraeger | Nein | Saarbruecken / EUR |

`UAM-DE` besitzt die Beteiligungen und erbringt vertraglich definierte Shared Services. UAS verkauft Fertigprodukte konzernintern an UAD; UAP bezieht Material von UAD und Engineering-Komponenten von UAS; UAM berechnet Finance-, IT- und Data-Governance-Leistungen nach dokumentierten Umlageschluesseln. Externe Serienproduktkunden werden grundsaetzlich durch UAD bedient, projektbezogene Kunden durch UAP.

## 4. Begriffs- und Architekturtrennung

| Begriff | Universaarl-Ausgestaltung | Was es nicht ist |
| --- | --- | --- |
| Entra-Tenant | Identitaets-, Gruppen- und Lizenzgrenze der Universaarl-Gruppe; exakter Tenant ist offen. | Kein BC-Unternehmen und keine Buchungsgrenze. |
| BC-Umgebung | Spaeter ausschliesslich Sandbox `playthru` fuer Projektarbeit; Production ist ausserhalb des aktuellen Auftrags. | Kein Mandant je Gesellschaft. Eine Umgebung kann mehrere BC-Unternehmen enthalten. |
| BC-Unternehmen / Mandant | Separater Buchungs- und Stammdatenkontext je Rechtstraeger; `UAC-CONS` ist Reporting-Ausnahme. | Kein Standort und keine Dimension. |
| Physischer Standort | Reale Adresse oder Betriebsstaette, etwa Werk Neunkirchen. | Nicht automatisch ein BC-Lagerort; ein Buero ohne Bestand braucht keinen. |
| Lagerort (Location) | Bestands- und Logistikknoten innerhalb eines BC-Unternehmens, etwa `NK-WERK`. | Kein Rechtstraeger. Derselbe Code in zwei Unternehmen ist technisch getrennt. |
| Lagerplatz (Bin) | Unterteilung innerhalb eines Lagerorts, etwa Zone/Regal/Fach `PICK-A-01`. | Kein Lagerort; ohne aktivierte Lagerplatzlogik nicht verwendet. |
| Verantwortungszentrum | Operative Zuordnung und Default-/Filterkontext fuer Verkaufs-/Einkaufsverantwortung, etwa `RC-SALES-DACH`. | Kein vollwertiger Berechtigungsmechanismus und kein Finanzanalyseersatz. |
| Dimension | Analytisches Merkmal auf Buchungen, etwa Kostenstelle oder Produktlinie. | Kein Projektobjekt, Lagerbestand oder Unternehmensschutz. |

Entscheidung DEC-002: Physischer Standort, Lagerort und Verantwortungszentrum werden nur angelegt, wenn ein eigener Prozess-, Bestands- oder Steuerungsbedarf besteht. So wird das Organisationsmodell nicht durch spiegelbildliche Codes aufgeblasen.

## 5. Standorte und Lagerkonzepte

| Gesellschaft | Standort | Lagerort | Konzept | Prozessgrund und Zielkontrolle |
| --- | --- | --- | --- | --- |
| UAS-DE | Werk Neunkirchen | `NK-WERK` | Advanced Warehouse, Lagerplatzpflicht, Wareneingang/-ausgang, Put-away/Pick, Zonen | Hohe Teilezahl, getrennte Wareneingangs-/QS-/Produktions-/Versandflaechen; Scan-Erweiterung offen. |
| UAS-DE | Werk Neunkirchen | `NK-PROD` | Produktionsnaher Lagerort mit Bins, Umlagerung zu/von `NK-WERK` | WIP-Transparenz und kontrollierte Materialbereitstellung. |
| UAS-DE | Extern Saarbruecken | `SB-3PL` | Einfacher Lagerort ohne interne Bins | Seltene Fremdlagerbestaende; monatliche Abstimmung mit 3PL-Datei. |
| UAD-DE | Distribution Saarlouis | `SLS-DC` | Basic Warehouse mit Bins, Inventory Put-away/Pick | Mittleres Volumen, Ersatzteil-Schnellpick ohne unnoetige Advanced-Warehouse-Komplexitaet. |
| UAD-DE | Service Trier | `TR-SVC` | Einfacher Lagerort ohne Bins | Kleines Reparatur- und Austauschgeraetelager, gefuehrte Umlagerungen. |
| UAD-DE | Mobile Techniker | `VAN-01`, `VAN-02` | Je Fahrzeug einfacher Lagerort | Verantwortlicher Techniker, Mindestbestand und periodische Inventur; keine Bins. |
| UAP-DE | Projektlager St. Ingbert | `IGB-PROJ` | Einfacher Lagerort, projektbezogene Reservierung | Kurzzeitige Baustellenbereitstellung; Projekt ist BC-Projekt, nicht Dimension allein. |
| UAM-DE | HQ Saarbruecken | kein regulaerer Lagerort | Verbrauchsmaterial direkt als Aufwand; Anlagen separat | Kein kuenstlicher Lagerprozess fuer Bueroverbrauch. |

Entscheidung DEC-003: Unterschiedliche Warehouse-Level bleiben bewusst parallel, weil Volumen und Kontrollbedarf verschieden sind. Alternative "Advanced Warehouse ueberall" wird wegen Schulungs-, Einrichtungs- und Prozessaufwand verworfen.

## 6. Personen, Rollen und Doppelverantwortung

Alle Beispielpersonen sind synthetisch.

| Person-ID | Name | Arbeitgeber | Hauptrolle | Doppelverantwortung / Grenze |
| --- | --- | --- | --- | --- |
| P-001 | Dr. Lena Hartmann | UAM-DE | Geschaeftsfuehrerin, Sponsor | Gibt Blueprint/Cutover frei; keine operative Buchung. |
| P-002 | Jonas Weber | UAM-DE | Programmleiter / Solution Owner | Change Owner und Architekturkoordination; kein Zahlungsfreigeber. |
| P-003 | Miriam Schaefer | UAM-DE | Group CFO / Konsolidierung | Freigabe Zahlungslaeufe und Konzernabschluss; keine Lieferantenanlage. |
| P-004 | Tobias Klein | UAM-DE | BC Administrator | SUPER nur Sandbox/Break-glass; keine fachliche Freigabe eigener Aenderung. |
| P-005 | Aylin Demir | UAM-DE | Finanzbuchhalterin | Debitoren/Kreditoren UAM und UAP; bereitet Zahlungen vor, gibt sie nicht frei. |
| P-006 | Felix Braun | UAS-DE | Werkscontroller | Kostenrechnung und Produktionscontrolling; Leserechte Fertigung, keine Lagerbuchung. |
| P-007 | Katharina Vogel | UAS-DE | Strategischer Einkauf | Lieferanten- und Bestellprozess; Lieferantenbankdaten nur Vier-Augen-Workflow. |
| P-008 | Marco Stein | UAS-DE | Produktionsplaner | Planung und Fertigungsauftraege; keine Buchungsmatrixpflege. |
| P-009 | Svenja Roth | UAS-DE | Warehouse Lead Werk | Advanced Warehouse und Inventur; keine Einkaufsfreigabe. |
| P-010 | David Nguyen | UAD-DE | Vertriebsleiter DACH | Preis-/Rabattfreigabe und Verantwortungszentrum `RC-SALES-DACH`. |
| P-011 | Nina Becker | UAD-DE | Customer & Supply Operations | Angebote/Auftraege und operative Ersatzteilbestellung; Preis- und Einkaufsfreigaben bleiben bei P-010 bzw. Limits/Workflow. |
| P-012 | Cem Yildiz | UAD-DE | Serviceleiter | Servicevertraege und Eskalation; verantwortet `TR-SVC`, keine FiBu-Buchung. |
| P-013 | Paula Hoffmann | UAD-DE | Servicetechnikerin / Service Data Custodian | Serviceauftraege, `VAN-01` und operative Pflege gepruefter Serviceartikeldaten; P-012 bleibt fachlich accountable. |
| P-014 | Leon Wagner | UAP-DE | Projektleiter | Projektbudget, Ressourcen und Meilensteine; bestaetigt Leistung, fakturiert nicht final. |
| P-015 | Sophie Martin | UAP-DE | Project Accountant / Training Coordinator | Projektfaktura und Trainingskoordination; trainiert Projects, nimmt aber weder fremde Module noch UAT allein ab. |
| P-016 | Erik Schneider | UAM-DE | Data Steward | Kunden/Lieferanten-Governance gruppenweit; keine Zahlungen oder Belege. |
| P-017 | Julia Koenig | UAS-DE | Finanzbuchhalterin / Finance Key User | Operative UAS-FiBu und Reconciliation; P-006 kontrolliert Kosten, P-003 gibt Zahlungen frei. |
| P-018 | Martin Reuter | UAD-DE | Finanzbuchhalter / Finance Key User | Operative UAD-FiBu und Reconciliation; keine Preis-/Kreditfreigabe. |
| P-019 | Selin Acar | UAD-DE | Distribution Warehouse Coordinator / Key User | Verantwortet `SLS-DC`, Inventur und Basic-Warehouse-Training; keine Einkaufs- oder FiBu-Freigabe. |

Kleine-Gesellschaft-Ausnahme: Aylin Demir betreut UAM und UAP operativ. Kompensierende Kontrollen sind unternehmensspezifische Rechte, CFO-Freigabe fuer Zahlungen und monatliche Aenderungspruefung kritischer Stammdaten. UAS und UAD erhalten mit P-017 und P-018 eigene operative Finance-Verantwortung; P-006 bleibt Controller und ersetzt keine Kreditoren-/Debitorenverarbeitung.

## 7. Prozess- und Capability-Matrix

Die folgende Tabelle ist eine kompakte Review-Sicht. Der kanonische, hierarchische und maschinenpruefbare Katalog ist `UABC-CAP-CATALOG-001` mit 17 Domaenen unter `capabilities/catalog.yaml`; seine Anzahl ist kein Zielwert und Jira erzeugt daraus keine Tickets.

Wellen: W0 Blueprint; W1 Foundation plus Workstream-Strategien; W2 Trade/Basic Logistics plus Mock Load 1; W3 Operations plus Mock Load 2/Integration; W4 UAT/Group Close/Cutover-Probe; W5 finaler Load/Training/Cutover/Hypercare. Daten, Tests, Training und Adoption laufen projektbegleitend durch W1-W5.

| Capability / E2E | Geschaeftszweck | Zielgesellschaft / Standort | Primaere Rolle | Abhaengigkeiten | Welle | Geplanter Nachweis |
| --- | --- | --- | --- | --- | --- | --- |
| Finance / Record-to-Report | Lokalisierte, pruefbare Haupt- und Nebenbuecher, Periodenabschluss | alle operativen; UAM HQ | P-005 UAM/UAP, P-017 UAS, P-018 UAD; P-003 Freigabe | Kontenplan, Buchungsgruppen, Dimensionen, Steuern | W1 | `UABC-SCN-FIN-001`: Beleg -> Nebenbuch -> Sachposten -> Abschlusscheck, UI+Posten-Evidence |
| Cash & Bank / Pay-to-Reconcile | Sichere Zahlungen und Bankabstimmung | alle operativen | P-005 UAM/UAP, P-017 UAS, P-018 UAD; P-003 getrennte Freigabe | Banken, Zahlungsformate, Genehmigung, SoD | W1 | `UABC-SCN-FIN-002`: Zahlungsvorschlag, Freigabe, Export-Simulation, Abstimmung |
| Einkauf / Procure-to-Pay | Material und Leistung bedarfsgerecht beschaffen und Rechnungen gesellschaftsrichtig matchen | UAS Werk; UAD DC; UAP Projekte | P-007/P-017 UAS, P-011/P-018 UAD, P-014/P-005 UAP | Lieferanten, Artikel/Ressourcen, Genehmigungen, Finance | W2 | `UABC-SCN-P2P-001`: Bestellung -> Wareneingang -> Rechnung -> Zahlung |
| Verkauf / Order-to-Cash | Produkte mit Preis-, Verfuegbarkeits- und Kreditkontrolle verkaufen | UAD SLS-DC; UAP Projekte | P-011, P-010 | Kunden, Preise, Bestand, Finance | W2 | `UABC-SCN-O2C-001`: Angebot -> Auftrag -> Lieferung -> Rechnung -> Zahlung |
| Artikelmodell | Einheitliche Produkte, Varianten, UoM, Tracking und Kosten | UAS/UAD/UAP | P-016, P-006 | Nummern, Kategorien, Produktlinien, Costing-Entscheid | W2 | `UABC-SCN-ITEM-001`: Stammdatenreview plus Buchungskette Artikelposten/Wertposten |
| Bestand | Verfuegbarkeit, Umlagerung, Inventur und Bewertung | UAS/UAD/UAP-Lagerorte | P-009 UAS, P-019 UAD Distribution, P-013 Service/VAN, P-014 UAP | Artikel, Lagerorte, Posting Setup | W2 | `UABC-SCN-INV-001`: Umlagerung + Inventurdifferenz + Bewertungsabgleich |
| Lager | Standortgerechter Empfang, Einlagerung, Pick und Versand | NK-WERK/NK-PROD/SLS-DC/TR-SVC/VAN | P-009 UAS, P-019 SLS-DC, P-013 Service/VAN | Bestand, Bins, Rollen, Belegprozesse | W2 Basic; W3 Advanced-PoC | `UABC-SCN-WHS-002`: je Lagerklasse eigener UI-Weg und Bestandsnachweis |
| Produktion / Plan-to-Produce | Sensor-/Controllerfertigung mit Material, Kapazitaet und Istkosten | UAS NK-WERK/NK-PROD | P-008, P-006 | Artikel, BOM/Routing, Work/Machine Centers, Lager | W3 | `UABC-SCN-MFG-001`: Planung -> Fertigungsauftrag -> Verbrauch/Output -> Kosten |
| Projekte / Project-to-Cash | Engineering- und Installationsprojekte budgetieren und fakturieren | UAP IGB-PROJ/Kundenbaustelle | P-014, P-015 | Ressourcen, Artikel, Dimensionen, Verkauf | W3 | `UABC-SCN-PRJ-001`: Budget -> Zeit/Material -> WIP -> Meilensteinrechnung |
| Service / Service-to-Cash | Installierte Basis, Wartung, Reparatur und Ersatzteile steuern | UAD TR-SVC/VAN | P-012, P-013 | Premium, Serviceartikel, Bestand, Ressourcen, Verkauf | W3 Orders; W4 Contracts | `UABC-SCN-SVC-001`: Call -> Auftrag -> Verbrauch -> Faktura; Vertrag separat |
| Anlagen / Acquire-to-Retire | Maschinen, Pruefmittel, Fahrzeuge und IT-Anlagen abschreiben | UAM/UAS/UAD | P-005, P-006 | Finance, Anlagenklassen, AfA-Buecher | W3 | `UABC-SCN-FA-001`: Zugang -> AfA-Vorschlag -> Buchung -> Abgang |
| Intercompany / IC-to-Reconcile | Produkte, Projektmaterial und Shared Services ohne Doppelerfassung austauschen | W2 UAS->UAD; W4 UAD/UAS->UAP und UAM->Gruppe | P-017, P-018, P-005, P-014, P-015; P-003 Abstimmung | IC-Partner, Konten-/Dimensionsmapping, Masterdaten, Project Execution | W1 Mapping; W2 Grundroute; W4 weitere Belegfluesse vor Vollabstimmung | `UABC-SCN-IC-001`: UAS->UAD; `UABC-SCN-IC-004`: UAD/UAS->UAP und UAM->Gruppe; `UABC-SCN-IC-003`: Vollabstimmung |
| Konsolidierung | Konzernabschluss und Eliminierungen nachvollziehbar erstellen | UAC-CONS / HQ | P-003 | abgeschlossene Perioden, Mapping, IC-Abstimmung | W4 | `UABC-SCN-CONS-001`: Testimport -> Konsolidierung -> Eliminierung -> Bericht |
| Reporting | Lokale Abschluesse frueh pruefen; Konzern-, Produkt-, Projekt- und Serviceprofitabilitaet spaeter konsolidieren | konzernweit | P-003, P-005, P-017, P-018, P-006, Bereichsleiter | Datenqualitaet, Dimensionen, IC/Konsolidierung | W1 lokal; W4 Konzern; W5 optional Power BI | `UABC-SCN-RPT-001`: lokaler Bericht/Dimensionscheck; `UABC-SCN-RPT-004`: Konzernbericht -> Drilldown |
| Administration & Security | Least Privilege, Jobs, E-Mail und auditierbare Aenderungen | Umgebung + alle Unternehmen | P-004 | Entra, Lizenzen, Permission Sets, Monitoring | W1 | `UABC-SCN-SEC-002`: Rollenlogin, erlaubte/verbotene Aktion, Audit-Evidence |
| Datenmigration | Setup, Stamm-, offene und historische Daten kontrolliert klassifizieren, wiederholt laden und abstimmen | alle operativen | P-016 koordiniert; P-005/P-017/P-018/P-006 reconciliieren | Inventar, Owner, Mapping, Bereinigung, Standardwerkzeuge, Reconciliation | W1-W5 | Strategie -> Mock 1 -> Mock 2 -> UAT-Lauf -> finaler Load mit objektbezogenen Counts/Totals |
| Testing, UAT, Training & Adoption | Prozesse frueh pruefen, durch Business Owner abnehmen und Rollen fuer Go-live befaehigen | alle Rollen/Standorte | P-002 Testkoordination; P-015 Trainingskoordination; modulare Key User/Owner | representative Daten, verifizierte Szenarien, Defect-Gates, Lernziele | W1-W5 | Testplan -> integrierte Tests -> UAT -> Train-the-Trainer -> Endanwendercheck/Adoption |

## 8. Dimensionen und Reporting

Entscheidung DEC-004: konzernweit gleiche Codes und Bedeutungen; Pflegeowner P-016, fachliche Freigabe P-003.

| Rang | Dimension | Beispielwerte | Zweck / Regel |
| --- | --- | --- | --- |
| Global 1 | `COSTCENTER` | FIN, IT, SALES, WHS, MFG, ENG, SERVICE | Organisationsverantwortung; Pflicht auf GuV-relevanten Buchungen. |
| Global 2 | `BUSINESSUNIT` | PRODUCTS, PROJECTS, SERVICE, SHARED | Geschaeftsmodellvergleich ueber Gesellschaften. |
| Shortcut 3 | `PRODUCTLINE` | SENSE, EDGE, PANEL, SPARE | Produktprofitabilitaet; Default von Artikel/Kategorie, pruefbare Ueberschreibung. |
| Shortcut 4 | `PROJECT` | synthetische Projektcodes | Querschnittsanalyse; das BC-Projekt bleibt fuehrendes operatives Objekt. |
| Shortcut 5 | `CHANNEL` | DIRECT, PARTNER, IC | Vertriebsweg und IC-Abgrenzung. |
| Shortcut 6 | `REGION` | DE-SW, DE-NW, AT, CH | Markt-/Serviceauswertung, nicht Lagerort. |
| Shortcut 7 | `ICPARTNER` | UAM, UAS, UAD, UAP | IC-Abstimmung und Eliminierungsunterstuetzung. |
| Shortcut 8 | `CUSTOMERSEG` | INDUSTRY, MUNICIPAL, FM | Marktsegment. |

Reporting-Ziel: Financial Reports, Dimensionspruefung und Analysis Views beginnen in W1 als lokale Finance-Kontrolle; Konzernreporting folgt in W4 nach IC-Abstimmung und Konsolidierung. Power BI bleibt eine optionale lesende Managementschicht nach Datenqualitaetsnachweis. Jede Kennzahl benennt Owner, Definition, Refresh, Berechtigungsniveau und Drilldown bis BC-Beleg/Posten.

## 9. Sicherheit und interne Kontrollen

### Zielmodell

1. Entra Security Groups steuern Umgebungszugang und rollenbasierte Gruppierung.
2. BC Permission Sets geben die kleinste erforderliche Funktion; Zuweisung je BC-Unternehmen, falls nicht gruppenweit erforderlich.
3. Profile/Role Center verbessern Bedienung, gelten aber nicht als Sicherheitskontrolle.
4. `SUPER` bleibt P-004 in Sandbox und einem getrennten Break-glass-Prinzip vorbehalten.

Geplante Gruppen: `UABC-FINANCE-POST`, `UABC-FINANCE-APPROVE`, `UABC-PURCHASING`, `UABC-SALES`, `UABC-WAREHOUSE-BASIC`, `UABC-WAREHOUSE-ADV`, `UABC-MANUFACTURING`, `UABC-PROJECTS`, `UABC-SERVICE`, `UABC-REPORTING`, `UABC-DATA-STEWARDS`, `UABC-BC-ADMINS`.

Kontrollpunkte: Lieferantenbankdaten-Vier-Augen-Pruefung, Bestell-/Rabatt-/Kreditlimits, Zahlungstrennung, Periodensperre, Inventurfreigabe, IC-Abstimmung vor Konsolidierung, Change-Evidence fuer Setup-Aenderungen.

## 10. Integrationen

| Integration | Zweck | Datenowner | Entscheidung v0.1 | Nachweis/Reset spaeter |
| --- | --- | --- | --- | --- |
| Microsoft 365 / Outlook, Excel, Teams, Word | Kommunikation, Analyse, Beleglayouts | P-004/P-016 | Standardintegration einplanen, Tenant-Details offen | Testkonto, synthetische Datei, Widerruf/Loeschung dokumentieren |
| Bank / SEPA / Kontoauszug | Zahlung und Abstimmung | P-003 | Deutsches Format nach Bankworkshop | Testdatei ohne reale IBAN, Kontrollsummen, kein Bankversand |
| E-Rechnung | gesetzes-/kundenkonformer Austausch | P-003 | Lokalisierungs- und Providerentscheidung offen | Validator und synthetischer Empfaenger |
| Power BI | Konzern- und Bereichsreporting | P-003/P-006 | Erst nach Dimensions-/Datenqualitaetsgate | Dataset-Refresh und Drilldown-Evidence |
| Dataverse/Dynamics 365 Sales | Lead-to-Order bei spaeterem CRM-Bedarf | P-010 | Alternative, noch nicht entschieden | PoC in eigener Change-Welle |
| 3PL-Datei | Monatsbestand und Bewegungen `SB-3PL` | P-009 | Zunaechst kontrollierte Datei statt API | Idempotenter Import, Summenabgleich, Rollback-Datei |
| Barcode/WMS-App | Scanunterstuetzung `NK-WERK` | P-009 | Make-or-buy offen; BC Standardprozess zuerst beweisen | Sandbox-PoC und uninstall/reset plan |

Keine Integration erhaelt im Blueprint eine technische Erfolgsbehauptung.

## 11. Datenverantwortung

| Domaene | Accountable | Responsible | Qualitaetsregel |
| --- | --- | --- | --- |
| Konten, Steuern, Buchungsgruppen | P-003 | P-005/P-017/P-018 je Gesellschaft | Freigegebenes Mapping, Vier-Augen-Pruefung, Testbuchung |
| Kunden/Lieferanten | P-010/P-007 | P-016 | Dublettencheck, Steuer-/Adressvalidierung, Bankdatenkontrolle |
| Artikel/BOM/Routing | P-006 | P-016/P-008 | Version, UoM, Costing, Tracking und Freigabestatus vollstaendig |
| Lager/Bins/Bestand | P-009 UAS / P-019 UAD | lokale Warehouse Key User; P-012/P-013 fuer Service/Fahrzeug | Physischer Count und BC-Menge abstimmbar |
| Projekte/Ressourcen | P-014 | P-015 | Vertrag, Budget, Billing Method und Dimensionen freigegeben |
| Serviceartikel/Vertraege | P-012 | P-013 als Service Data Custodian | Seriennummer, Kunde, Standort und SLA konsistent |
| Rollen/Berechtigungen | P-004 | P-004 | Owner-Genehmigung, Least Privilege, SoD-Test |

Migration folgt ueber alle Wellen Extract -> Profile -> Cleanse -> Map -> Mock Load 1 -> Mock Load 2/integrated test -> UAT data run -> Reconcile -> Approve -> Cutover rehearsal -> final load. Standard-first werden Configuration Worksheet, Configuration Packages, Configuration Templates und kontrollierte Excel-Dateien geplant; APIs bleiben nur eine spaeter explizit genehmigte Alternative fuer belegte Volumen- oder Automatisierungsluecken. UAM-DE ist die einzige geplante Source Company fuer Standardsynchronisation: Parteienidentitaet, gemeinsame Dictionaries und kommerzieller Artikelkern liegen dort. UAS ergaenzt Production BOMs, Routings, Kapazitaeten und Engineering-Felder ausschliesslich lokal; Steuer-, Posting-, Kredit-, Preis-, Einkaufs-, Standort- und Planungsfelder bleiben je Gesellschaft lokal. Aktivierung setzt W1-Feldmatrix und `playthru`-PoC voraus.

| Datenklasse | Standard-first-Werkzeug und Grenze | Kontrolle |
| --- | --- | --- |
| Setupdaten | Configuration Worksheet strukturiert Tabellen; reviewte Configuration Packages transportieren freigegebenes Setup. | Unternehmen, Reihenfolge, Abhaengigkeiten, Paketversion, Sollwerte und Rerun protokollieren. |
| Stammdaten | Kontrollierte Excel-Dateien/Packages; Configuration Templates setzen nur freigegebene Defaults fuer neue/importierte Records. | Objektowner, Feldmapping, Dubletten-, Pflichtfeld- und gesellschaftsspezifische Pruefung. |
| Offene Posten/Anfangsbestaende | Objektbezogene Vorlagen oder Journale statt pauschalem Tabellenimport. | Debitor/Kreditor zu Sachkonto, Alterung, Belegbezug, Menge/Wert, Projekt-WIP und Anlagenbuch abstimmen. |
| Gebuchte Historie | Nicht als scheinbar operative Historie per Configuration Package nachbauen. Altarchiv zugreifbar halten oder nur nach eigener Audit-/Scope-Entscheidung migrieren. | Vollstaendigkeit, Aufbewahrung, Datenschutz und Audit-Trail durch Legal/Finance bestaetigen. |

## 12. Trainingsgruppen

| Gruppe | Teilnehmer | Lernziel | Format / Exit-Kriterium |
| --- | --- | --- | --- |
| Executives | P-001, P-003 | Steuerungsmodell, Freigaben, KPIs | 90-min Workshop; Entscheidungsfragen beantwortet |
| Finance | P-003, P-005, P-006, P-017, P-018 | R2R, P2P/O2C-Buchungswirkung, Abschluss und Reconciliation je Gesellschaft | P-005/P-017/P-018 liefern lokale Labs; P-003/P-006 pruefen Kontrolle und Abschluss |
| Sales & Customer Service | P-010, P-011 | Quote-to-Cash, Preise, Verfuegbarkeit, Kredit | Rollenlab; Auftrag fehlerfrei abgeschlossen |
| Warehouse & Supply | P-007, P-009, P-019 | Beschaffung, Receive/Put-away/Pick/Ship, Inventur | P-009 trainiert UAS Advanced; P-019 UAD Basic; Standortlabs getrennt |
| Manufacturing | P-008, P-006 | Planung, Verbrauch, Output, Kosten | Fertigungsfall mit Soll/Ist-Erklaerung |
| Projects | P-014, P-015 | Budget, Zeit/Material, WIP, Faktura | P-014 Prozess/P-015 Finance; Projektfall und Monatsabschluss |
| Service | P-012, P-013 | Installed Base, Auftrag, Teile, Faktura | Servicefall inkl. Fahrzeuglager |
| Admin & Data | P-004, P-016, P-005, P-017, P-018 | Rechte, Monitoring, Datenqualitaet, Migration und Reconciliation | Runbook-Uebung, Mock-Load-Fehlerbehebung und Summenabgleich |

P-015 fuehrt den Trainingskalender, die Methodik und Materialqualitaet. Sie ist weder alleinige Fachtrainerin noch UAT-Abnehmerin: Finance, Einkauf, Sales, Warehouse, Manufacturing, Projects, Service und Administration werden jeweils von den oben benannten Process Ownern/Key Usern trainiert und fachlich abgenommen.

## 13. Entscheidungen, Alternativen und offene Punkte

### Architekturentscheidungen mit Status `approved`

- DEC-001: vier operative BC-Unternehmen plus `UAC-CONS`.
- DEC-002: Organisationsobjekte nur bei eigenem Prozess-/Steuerungszweck.
- DEC-003: standortabhaengig Basic und Advanced Warehouse.
- DEC-004: `COSTCENTER` und `BUSINESSUNIT` als globale Dimensionen.
- DEC-005: Standard-first; Erweiterungen erst nach belegter Standardluecke und eigenem Change.
- DEC-006: Jira/Confluence sind Navigations- und Kollaborationssicht, OpenSpec bleibt normativ.
- DEC-007: Dataverse/Dynamics 365 Sales ist nicht Teil des Kernprojekts; ein spaeterer Einsatz braucht positiven Business Case und separaten OpenSpec-Change. Native BC-nahe Vertriebsfunktionen duerfen im Sales-Scope geprueft werden.
- DEC-008: UAM-DE ist alleinige Source Company fuer die geplante Standardsynchronisation; gemeinsamer kommerzieller Kern in UAM, Production Engineering in UAS und transaktionale/rechtliche Felder lokal.

### Verworfene Alternativen

- Eine einzige BC-Gesellschaft mit Legal-Entity-Dimension: verworfen, da keine rechtliche Buchungs-/Berechtigungsgrenze und keine glaubwuerdige Konsolidierung.
- Ein BC-Unternehmen pro Standort: verworfen, da Standorte keine Rechtstraeger sind und Intercompany kuenstlich aufblasen wuerde.
- Advanced Warehouse an jedem Lagerort: verworfen, da Komplexitaet den Kontrollnutzen bei Depot/Fahrzeug uebersteigt.
- Power BI als primaere Datenkorrekturschicht: verworfen; Datenqualitaet wird an der Quelle behoben.

### Entscheidungen und verbleibende offene Punkte

| ID | Status | Kategorie | Frage | Owner | Gate / Evidence |
| --- | --- | --- | --- | --- | --- |
| UABC-OQ-001 | open | `later-playthru-technical-fact` | Exakte BC-Version, Land, Apps und Kapazitaet? | P-004 | vor W1 Write; Environment-/Company-Evidence |
| UABC-OQ-002 | open | `legal-tax-licensing-review` | Kontenplan, Tax-Mapping und gesetzliche Reports? | P-003 | W1 Finance-/Tax-Review |
| UABC-OQ-003 | open | `synthetic-universaarl-business-fact` | Costing je Produktfamilie und Standardkostenprozess? | P-006 | vor W2; Margenmodell und Simulation |
| UABC-OQ-004 | open | `synthetic-universaarl-business-fact` | Serien-/Chargenpflicht je Produkt? | P-012 | vor W2; Gewaehrleistungs-/Traceability-Policy |
| UABC-OQ-005 | open | `later-playthru-technical-fact` | Advanced Warehouse Standard ausreichend oder Scanner-App? | P-009 | nach Standard-PoC |
| UABC-OQ-006 | decided via `UABC-DEC-007` | `sponsor-decision` | CRM/Dataverse im Business Scope? | P-010 | ausserhalb Kernprojekt; separater Change nach positivem Business Case |
| UABC-OQ-007 | open | `legal-tax-licensing-review` | E-Rechnungsformat, Provider und Aufbewahrung? | P-003 | Legal-/Tax-/Provider-Review und Sandboxnachweis |
| UABC-OQ-008 | open | `synthetic-universaarl-business-fact` | Projekt-WIP und Fakturierung je synthetischem Vertragstyp? | P-014 | vor W3; Vertragsmuster und Abschlussregel |
| UABC-OQ-009 | open | `legal-tax-licensing-review` | Essentials/Premium/Team Member/Device je Person? | P-003 | vor Security Setup; Licensing Assessment |
| UABC-OQ-010 | open | `legal-tax-licensing-review` | VAT, E-Rechnung, Payment und Retention je Gesellschaft/Dokument? | P-003 | W1/W2 Tax-/Legal-/Bank-/Provider-Review |
| UABC-OQ-011 | decided via `UABC-DEC-008` | `sponsor-decision` | Welche Felder sind shared/company-specific und welche Quellgesellschaft fuehrt sie? | P-016 | Policy entschieden; W1-Feldmatrix und Synchronisations-PoC bleiben Gate |
| UABC-OQ-012 | open | `synthetic-universaarl-business-fact` | Purchase/Assembly/Manufacturing je Produkt? | P-008 | vor W3; Produkt-/Costing-Matrix |
| UABC-OQ-013 | open | `legal-tax-licensing-review` | IC-Transferpreise, Markups, Eigentumsuebergang, Lead Contractor, Garantie und Abstimmung? | P-003 | vor W2 IC-Belegen; Legal-/Tax-/Commercial-Modell |
| UABC-OQ-014 | open | `synthetic-universaarl-business-fact` | Migrationsumfang, Volumen, Historie, Qualitaet, Privacy und Reconciliation je Objekt? | P-016 | W1 Datenkatalog plus Privacy Review |

## 14. Cross-funktionaler Fachreview 2026-07-10

Status: Consultant Review abgeschlossen. Der reale Repository-Nutzer hat am 2026-07-10 mit der Entscheidung `Empfehlungen uebernehmen` die W0-Architektur bedingt freigegeben; dies ist keine Freigabe durch die synthetische Person P-001. `actualSandboxBaseline` bleibt `unknown`.

Die Freigabe umfasst Unternehmens-/Loesungsarchitektur, Capability-Plan, W1-W5-Delivery-Modell, Rollen/Kontrollen und offene Fragen mit Gates. Sie bestaetigt keine tatsaechliche `playthru`-Version oder Featureverfuegbarkeit, keine Legal-/Tax-Detailauslegung, keine finale Lizenzzuweisung, keine einzelne Capability-Validierung, keine W1-Writes und kein Go-live.

### Findings nach Schweregrad

#### Hoch

1. **Rechtstraegermodell synthetisch festgelegt, Detailreview offen.** UAM ist als substanzielle Holding-/Shared-Service-Gesellschaft und UAP als eigenstaendige Projektvertragsgesellschaft beschlossen. Reale gesellschafts-, steuer- und bankrechtliche Ausgestaltung bleibt Legal-/Tax-Gate; `UAC-CONS` bleibt nicht-operatives BC-Unternehmen und kein Rechtstraeger.
2. **Premium ist eine Architekturabhaengigkeit.** UAS-DE benoetigt Premium fuer Manufacturing, UAD-DE fuer Service Management. Essentials-Nutzer koennen nicht in Premium-Unternehmen arbeiten. Die Lizenzmatrix muss deshalb personen- und unternehmensbezogen vor dem Security Design entschieden werden; SUPER oder Permission Sets erweitern keine Lizenz-Entitlements.
3. **Deutsche Compliance ist noch nicht entscheidungsreif.** VAT, ELSTER-nahe Lokalisierungsfunktionen, XRechnung/Peppol/ZUGFeRD, Service-E-Rechnungen, SEPA und Bankformate haengen von Version, installierten Apps, Dokumenttyp, Hausbank und Steuerentscheidung ab. Release-Plan-Information ist kein Sandbox-Nachweis.
4. **Stammdatenpolicy beschlossen, Feldnachweis offen.** UAM ist einzige Source Company fuer Parteienidentitaet, gemeinsame Dictionaries und den kommerziellen Artikelkern. UAS fuehrt Production BOMs, Routings, Kapazitaeten und Engineering lokal; Gesellschaften fuehren Steuer-, Posting-, Kredit-, Preis-, Einkaufs-, Standort- und Planungsfelder. Feldmatrix und `playthru`-PoC bleiben W1-Gates.
5. **Trade-Scope war unvollstaendig.** Kunden-/Lieferantenretouren, Preis-/Rabattgovernance und Vorauszahlungen waren nicht als eigenstaendige Capability erkennbar. Vorauszahlungen sind fuer kundenspezifische PANEL-Auftraege und ausgewaehlte Projektvertraege jetzt `planned`; sie ersetzen weder Project WIP noch Meilensteinfakturierung.
6. **Intercompany benoetigt ein kaufmaennisches Operating Model.** UAS -> UAD Produktlieferung, UAD -> UAP Material und UAM -> Gruppe Shared Services sind plausibel. Offen sind Transferpreise, Markups, Leistungsnachweis, Eigentumsuebergang, Gegenkonten, IC-Artikelnummern, Retouren/Garantie und Abstimmung. Composite Deals brauchen eine eindeutige Lead-Contractor- und Fakturagrenze zwischen UAD und UAP.

#### Mittel

1. **W2 war ueberladen.** Einkauf, Verkauf, Artikel, Bestand, Basic und Advanced Warehouse gleichzeitig ist fuer ein evidence-basiertes Projekt unrealistisch. W2 endet mit Basic Warehouse; Advanced Warehouse wird nach Layout-/Volumen-/Rollen-PoC in W3 entschieden.
2. **Assembly und Manufacturing muessen produktweise getrennt werden.** Assembly bleibt `deferred` fuer noch zu bestaetigende Retrofit-, Kabel- und Servicekits ohne Routing/Kapazitaet. PANEL und EDGE benoetigen weiterhin Production BOM, Routing, Kapazitaet, Output und Varianz; Assembly ist keine parallele Alternativroute.
3. **Projekt-WIP ist vertragsabhaengig.** Ressourcen und Planning Lines sind plausibel; WIP-Methode, Erlosrealisierung und Fakturatrigger duerfen erst nach Vertragsmustern festgelegt werden.
4. **Service-Vertraege folgen der installierten Basis.** Service Items und Service Orders muessen vor wiederkehrenden Contract Orders/Billing stabil sein. Service Contracts bleiben wegen `CARE` fuer W4 geplant. Subscription Billing bleibt getrennt `deferred`: Es kann wiederkehrende kommerzielle Kunden-/Lieferantenlinien und Abgrenzungen abbilden, ersetzt aber keine Installed Base, Service Orders oder Wartungsdeckung.
5. **Dimensionsmodell braucht Buchungsregeln.** `COSTCENTER` und `BUSINESSUNIT` bleiben empfohlen. Default Dimensions, Prioritaeten, Pflichtwerte und erlaubte Kombinationen muessen je Stammdatentyp festgelegt werden. `PROJECT` dient nur Querschnittsanalyse und ersetzt nie BC Projects.
6. **3PL ist eine Schnittstellen- und Abstimmungsgrenze.** `SB-3PL` bleibt UAS-Bestand in externer Verwahrung. Eigentum, Cut-off, Bewegungsdatei, Inventur, Fehlermeldung und Summenabgleich muessen vertraglich und technisch definiert werden.
7. **Funktionstrennung braucht transaktionsspezifische Tests.** P-003 darf Zahlungslaeufe freigeben, aber nicht denselben Lauf vorbereiten oder eigene Stammdaten-/Setup-Aenderungen genehmigen. P-004 administriert Rechte, darf aber keine fachliche Eigenfreigabe erteilen. Lieferantenbankdaten, Preis-Ausnahmen, Gutschriften und Produktionskostenupdates brauchen eigene Kontrollfaelle.
8. **Migrationsanforderungen sind noch nicht quantifiziert.** Der Delivery-Ansatz ist nun W1-W5 mit Inventar, Mock 1, Mock 2, UAT-Lauf und finalem Load. Volumen, Historientiefe, offene Posten, Bestandsbewertung, Seriennummern, Projekt-WIP, Service-Installed-Base, Anlagenbuecher, Beleganhaenge und Datenschutz-/Aufbewahrungsregeln bleiben als bewusst festzulegende Datenanforderung offen.
9. **Delivery-Workstreams waren unrealistisch spaet.** Daten, Tests, UAT, Training, Adoption, Cutover und Hypercare sind jetzt projektbegleitend. W4 enthaelt Reconciliation, formale Business-Owner-UAT, Train-the-Trainer und Cutover-Probe; nur finaler Load, Endanwendertraining, Ausfuehrung und Hypercare bleiben W5.

#### Niedrig

1. Power BI ist sinnvoll, aber erst nach abgestimmten Financial Reports, Analysis Views, Dimensionsdefinitionen und Drilldown. Status deshalb `deferred`.
2. Zwei AfA-Buecher koennen Handels-/Steueranforderungen abbilden, sind aber keine automatische Empfehlung ohne Tax Review.
3. Fahrzeuglager ohne Bins sind plausibel; Mindestbestand, Technikerverantwortung, Umlagerung und zyklische Inventur bleiben Pflichtkontrollen.

### Uebernommene Architekturentscheidungen

- Vier substanzielle Rechtstraeger plus nicht-operatives `UAC-CONS` beibehalten; reale Legal-/Tax-Details separat pruefen.
- UAS-DE und UAD-DE als Premium-Unternehmen planen; UAM-DE, UAP-DE und UAC-CONS zunaechst Essentials. Benutzer mit Zugriff auf Premium-Unternehmen als Premium-Kandidaten behandeln.
- Einen harmonisierten Gruppen-Kontenrahmen mit gleichen Kontenbedeutungen und dokumentierten lokalen Abweichungen verwenden; Konsolidierungsmapping nicht als Ersatz fuer saubere lokale Konten nutzen.
- `COSTCENTER` und `BUSINESSUNIT` als globale Dimensionen beibehalten; Pflicht-/Default-/Kombinationsregeln vor erster Buchung designen.
- UAM als einzige Standardsynchronisationsquelle fuer Parteienidentitaet, gemeinsame Dictionaries und kommerziellen Artikelkern verwenden; Produktionsengineering in UAS und gesetzliche/transaktionale Felder lokal fuehren.
- Native Approval Workflows fuer Einkauf, Verkauf, Zahlungsjournale, Kunden- und Artikelanlage zuerst einsetzen; Bankdatenanderung durch zusaetzliche Vier-Augen-Kontrolle absichern.
- NK-WERK Advanced Warehouse als W3-Zielhypothese nach Basic-Trade-Stabilisierung behandeln; SLS-DC Basic, Depot/Fahrzeuge/Projektlager simple belassen.
- PANEL/EDGE ueber Premium Manufacturing planen; Assembly erst bei einem nachgewiesenen einfachen Kit-Geschaeftsfall neu bewerten.
- Native Financial Reports/Analysis Views vor Power BI und lokale Abschluesse/IC-Abstimmung vor Konsolidierung etablieren.

### Verworfen oder zurueckgestellt

- Ein BC-Unternehmen fuer alle Rechtstraeger mit Legal-Entity-Dimension: verworfen.
- Ein BC-Unternehmen pro Standort: verworfen.
- Vollstaendig identische Stammdaten in allen Unternehmen: verworfen.
- Bidirektionale Standard-Master-Data-Synchronisation: verworfen.
- Advanced Warehouse ab W2 oder an jedem Lagerort: zurueckgestellt/verworfen.
- Assembly und Manufacturing fuer dasselbe Produkt als frei austauschbare Routen: verworfen.
- Power BI als erste Reporting- oder Datenkorrekturschicht: verworfen.
- E-Rechnungs- oder Service-Invoice-Verfuegbarkeit allein aus Releaseplaenen: verworfen.

### Weiterhin offene W1-Gates

1. Legal-/Tax-Pruefung der synthetisch festgelegten Gesellschaftsstruktur, Servicevereinbarungen und Umlageschluessel; keine realen VAT IDs oder Bankdaten im Blueprint.
2. Personenbezogene Lizenzmatrix Premium/Essentials/Team Member/Device und Company Experience.
3. SKR03, SKR04 oder eigener Gruppen-Kontenrahmen; Handels-/Steuerbilanz und AfA-Buecher.
4. VAT-Faelle, E-Rechnungsformate je Dokumenttyp/Partner, Provider und Aufbewahrung.
5. Hausbank, SEPA pain-Version, Freigabeweg und Kontoauszugsformat.
6. Feldgenaue Master-Data-Ownership-/Synchronisationsmatrix und `playthru`-PoC vor Aktivierung; die UAM-Source-Company-Policy selbst ist entschieden.
7. Produktfamilienentscheidung Purchase/Assembly/Manufacturing, Costing und Tracking.
8. Lagerprozessvolumen, Layout, Directed Put-away and Pick und Scannerentscheidung.
9. Projektvertragstypen, WIP-/Revenue-Recognition- und Billing-Methode.
10. Service-SLA, Disposition, Contract Billing, mobile Zeit-/Teileerfassung und Service-E-Rechnung.
11. IC-Transferpreise, Leistungsnachweise, Lead Contractor, Retouren/Garantie und Abstimmungsprozess.
12. Migration Scope je Datenobjekt: Quelle, Volumen, Historie, Qualitaet, Transformation, Reconciliation und Aufbewahrung.

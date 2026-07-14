import fs from 'node:fs';

const storyPath = 'evidence/simulation/project-story.json';
const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));

const summaries = [
  'Projektstart', 'Einrichtung', 'Übergabe', 'Projektauftrag', 'Prozessbild', 'Datenbereitschaft',
  'Grundeinrichtung', 'Kernprozesse', 'Prozessnachweise', 'Schulungsnachweis', 'Stabilisierung',
  'Abschlusssteuerung', 'Supportübergabe', 'Kickoff vorbereiten', 'Discovery durchführen',
  'Kontenplan abstimmen', 'Stammdaten prüfen', 'Datenmapping klären', 'Migrationsprobe', 'Rollenmodell',
  'Finanzsetup', 'Einkauf einrichten', 'Verkauf einrichten', 'Lager einrichten', 'Zahlungen prüfen',
  'Bankabstimmung', 'Periodenabschluss', 'UStVA prüfen', 'UAT planen', 'UAT durchführen',
  'Defects korrigieren', 'Datenworkshop', 'Prozessdesign', 'Fit-Gap bewerten', 'Konfiguration prüfen',
  'Testdaten laden', 'P2P testen', 'O2C testen', 'Lager testen', 'Close testen', 'Schulungsplan',
  'Key User schulen', 'Cutover planen', 'Go-live proben', 'Hypercare planen', 'Hypercare begleiten',
  'Monatsabschluss', 'VAT-Vorschau', 'Retro durchführen', 'Handover abschließen'
];

const focus = [
  'Projektauftrag, Rollen und Entscheidungswege für die Kundeninstanz',
  'Einrichtungswelle mit kontrollierter Übergabe zwischen den Projektphasen',
  'Abschlussbild und Supportübergabe nach der simulierten Hypercare',
  'Scope, Abnahmekriterien und Eskalationsweg mit Sponsor und Projektleitung',
  'End-to-end-Prozessbild von Einkauf, Verkauf, Lager und Finanzabschluss',
  'Datenverantwortung, Bereinigung und Freigabe für die Simulationswellen',
  'Grundparameter, Nummernserien, Dimensionen und Buchungslogik',
  'Fachliche Durchgängigkeit der vereinbarten Kernprozesse',
  'Nachweisführung für Posting, Kontrollen, Defects und Retests',
  'Befähigung der Key User mit rollenbezogenen Übungen',
  'Defectsteuerung und offene Restpunkte in der simulierten Hypercare',
  'Entscheidungen, Restpunkte und Abnahmevoraussetzungen zum Projektabschluss',
  'Betriebsrollen, Supportweg und Handover-Unterlagen',
  'Agenda, Teilnehmer und Entscheidungsbedarf für den Projektauftakt',
  'Discovery-Fragen zu Organisation, Stammdaten und Prozessen',
  'Kontenplan, Buchungsmatrix und deutsche Finanzanforderungen',
  'Kundenstammdaten, Lieferanten, Artikel und Pflegeverantwortung',
  'Feldmapping, Transformationsregeln und Prüfsummen der Datenwelle',
  'Wiederholbare Migrationsprobe mit Fehlerliste und Retest',
  'Rollen, Berechtigungen, Trennung von Aufgaben und offene Live-Gates',
  'Finanzparameter mit kontrollierter Posting- und Drill-down-Prüfung',
  'Bestellprozess von Bedarf bis Eingangsrechnung',
  'Verkaufsprozess von Auftrag bis Zahlungseingang',
  'Einfaches Lager mit Bestand, Bewegung und Inventurkontrolle',
  'Zahlungsjournal, Ausgleich und Referenzprüfung',
  'Bankabstimmung, Differenzen und dokumentierter Korrekturpfad',
  'Periodensperre, Monatsabschluss und Kontrollsummen',
  'Deutsche MwSt.-Einrichtung und synthetische UStVA-Vorschau',
  'UAT-Scope, Rollen, Testdaten und erwartete Readbacks',
  'Durchführung der UAT-Szenarien mit Akzeptanzprotokoll',
  'Defectklassifizierung, Korrekturmaßnahme und Wiederholungstest',
  'Datenworkshop mit Verantwortlichen, Quellen und Freigabepunkten',
  'Sollprozesse, Standardnähe und dokumentierte Kundenentscheidungen',
  'Fit-Gap-Bewertung mit Priorität, Entscheidung und Folgeaktion',
  'Konfigurationsreview anhand von Checkliste und Posting Preview',
  'Kontrollierte Testdatenbereitstellung ohne echte Kundensysteme',
  'P2P-Nachweis von Bestellung bis Zahlungsausgleich',
  'O2C-Nachweis von Auftrag bis Zahlungseingang',
  'Lager-Nachweis für Bewegung, Bestand und Inventur',
  'Close-Nachweis für Abstimmung, Periodensteuerung und Abschluss',
  'Schulungsplanung nach Rollen, Szenarien und Nachbereitung',
  'Key-User-Übungen für wiederholbare Standardabläufe',
  'Cutover-Checkliste, Rückfallpunkt und Verantwortungsübergabe',
  'Go-live-Rehearsal mit Posting, Kontrolle, Defect und Retest',
  'Hypercare-Kadenz, Triage und Supportkommunikation',
  'Begleitung der simulierten Hypercare mit Defect- und Retest-Log',
  'Erster synthetischer Monatsabschluss mit Kontrollsummen',
  'Synthetische VAT-Vorschau mit offenem Lokalisierungs-Live-Gate',
  'Retrospektive zu Entscheidungen, Risiken und Verbesserungen',
  'Kundenlesbare Übergabe von Unterlagen, Rollen und Supportweg'
];

if (story.classification !== 'synthetic-canonical-project-v1' || story.status !== 'simulated-complete') {
  throw new Error('Kanonische abgeschlossene Story ist nicht der erwartete V1-Ausgang.');
}
if (story.tickets.length !== 50) throw new Error(`Erwartet 50 Tickets, gefunden ${story.tickets.length}.`);

const requiredSections = [
  'Ausgangslage und Ziel', 'In Scope', 'Nicht im Umfang', 'Voraussetzungen und Rollen',
  'Durchführung', 'Ergebnis und Akzeptanz', 'Lieferung und Referenzen',
  'Evidence, Test und Readback', 'Aufwand und Abrechnung', 'Abhängigkeiten, Risiken und Übergabe'
];
const fallbackTranscript = { P1: 'UABC-MTG-001', P2: 'UABC-MTG-002', P3: 'UABC-MTG-003' };
const specialDetails = {
  'UABC-16': { customerInputs: 'Kontenplan, Sachkonten, Kontenkategorien, Buchungsmatrix, Dimensionen und deutsche MwSt.-Entscheidungen', customerRoles: 'ROLE-CUSTOMER-FINANCE als Finance Key User', consultantRoles: 'Finance Consultant und Solution Architect', concreteSteps: 'Sachkonten und Kontenkategorien prüfen, Direkte Buchung kontrollieren, Buchungsmatrix abstimmen, Dimensionen zuordnen, Posting Preview lesen und Kontrollsummen festlegen', agenda: 'Sachkonten, Kontenkategorien, Direkte Buchung, Gruppen, Dimensionen, MwSt., Posting Preview und Freigabe', expectedResult: 'Das synthetische Finanzsetup verbindet Sachkonten, Kontenkategorien, Direkte Buchung, Buchungsmatrix, Dimensionen und deutsche MwSt.-Regeln mit prüfbaren Kontrollsummen.', specificRisk: 'Eine falsche Buchungsmatrix oder Direkte Buchung würde Finance-Postings und den späteren Monatsabschluss verfälschen.', handoff: 'Finanzdesign an die Einrichtungs- und P2P/O2C-Tests', evidenceReadback: 'Sachkontenprüfung, Kontenkategorien, Direkte-Buchung-Kontrolle, Posting Preview und Entscheidungsregister', control: 'Sachkonten, Kontenkategorien und Direkte Buchung sind gegen Buchungsmatrix und Kontrollsumme geprüft.' },
  'UABC-22': { customerInputs: 'Lieferanten, Bestellarten, Freigabegrenzen, Wareneingang und Eingangsrechnungsbeispiel', customerRoles: 'ROLE-CUSTOMER-PURCHASE als Einkauf Key User', consultantRoles: 'Purchase-to-Pay Consultant und Finance Consultant', concreteSteps: 'Lieferant anlegen, Bestellung erfassen, Wareneingang kontrollieren, Rechnung zuordnen und Zahlungsvorbereitung prüfen', agenda: 'Bedarf, Bestellung, Wareneingang, Rechnung, Posting Preview und Kontrolle', expectedResult: 'Der simulierte Einkaufslauf verbindet Bestellung, Wareneingang und Eingangsrechnung ohne ungeprüfte Live-Buchung.', specificRisk: 'Fehlende Freigabegrenzen oder falsche Buchungsgruppen erzeugen einen nicht erklärbaren Rechnungssaldo.', handoff: 'P2P-Einrichtung an P2P-Test und Key-User-Schulung', evidenceReadback: 'P2P-Szenario, Posting-Kontrolle, Defect- und Retest-Referenz' },
  'UABC-23': { customerInputs: 'Kunden, Artikel, Preislogik, Lieferbedingungen und Zahlungseingangsbeispiel', customerRoles: 'ROLE-CUSTOMER-SALES als Verkauf Key User', consultantRoles: 'Order-to-Cash Consultant und Finance Consultant', concreteSteps: 'Kundenauftrag erfassen, Lieferung prüfen, Rechnung simulieren, Zahlungseingang zuordnen und offene Posten abstimmen', agenda: 'Auftrag, Lieferung, Rechnung, Zahlungseingang und Kontrollsummen', expectedResult: 'Der simulierte Verkaufslauf verbindet Auftrag, Lieferung, Rechnung und Zahlungseingang mit nachvollziehbarem Readback.', specificRisk: 'Unklare Preis- oder Zahlungskonditionen würden Umsatz und offene Posten widersprüchlich darstellen.', handoff: 'O2C-Einrichtung an O2C-Test und Finance-Abstimmung', evidenceReadback: 'O2C-Szenario, Ledger-Kontrolle, Defect- und Retest-Referenz' },
  'UABC-24': { customerInputs: 'Artikel, Lagerorte, Anfangsbestände, Bewegungsarten und Inventurkontrollsumme', customerRoles: 'ROLE-CUSTOMER-WAREHOUSE als Lager Key User', consultantRoles: 'Warehouse Consultant und Finance Consultant', concreteSteps: 'Artikelbestand prüfen, Lagerbewegung simulieren, Inventurabweichung markieren und Bestandskontrolle durchführen', agenda: 'Stammdaten, Lagerort, Bewegung, Inventur und Bestandsabgleich', expectedResult: 'Der simulierte Lagerprozess weist Bestand, Bewegung und Inventurkontrolle mit einer konsistenten Kontrollsumme nach.', specificRisk: 'Nicht bereinigte Anfangsbestände würden Lagerwert und Monatsabschluss verfälschen.', handoff: 'Lager-Einrichtung an Lager-Test und Monatsabschluss', evidenceReadback: 'Lager-Szenario, Bestandskontrolle, Abweichung und Retest' },
  'UABC-29': { customerInputs: 'UAT-Scope, Testdaten, Rollen, erwartete Ledger Entries und Abnahmekriterien', customerRoles: 'ROLE-CUSTOMER-FINANCE und benannte Key User als UAT-Verantwortliche', consultantRoles: 'UAT Lead und fachliche Prozessberater', concreteSteps: 'Szenarien priorisieren, Daten und Rollen zuordnen, Readbacks definieren, Abnahmeprotokoll vorbereiten und Defectweg festlegen', agenda: 'Scope, Testdaten, Rollen, Expected Result, Readback, Defect und Abnahme', expectedResult: 'Der UAT-Katalog besitzt sieben geplante Szenarien mit Rollen, Testdaten, Expected Result und offenem Realgate-Hinweis.', specificRisk: 'Ein unvollständiger UAT-Scope würde synthetische Abnahme und reale UAT-Freigabe vermischen.', handoff: 'UAT-Plan an UAT-Durchführung und Defectsteuerung', evidenceReadback: 'UAT-Katalog, Szenario-Matrix und Abnahmekriterien' },
  'UABC-42': { customerInputs: 'Rollenprofile, Schulungstermine, Übungsfälle und Teilnehmerfragen', customerRoles: 'ROLE-CUSTOMER-FINANCE und ROLE-CUSTOMER-PURCHASE als Key User', consultantRoles: 'Training Lead und fachliche Prozessberater', concreteSteps: 'Lernziele erklären, Einkauf/Verkauf/Close üben, Posting Preview zeigen, Fragen aufnehmen und Nachschulung planen', agenda: 'Rolle, Navigation, FastTabs, Übung, Kontrollsumme, Fragen und Nachbereitung', expectedResult: 'Die synthetische Key-User-Schulung weist rollenbezogene Übungen, Kontrollfragen und dokumentierte Nachbereitung nach.', specificRisk: 'Ungeklärte Rollenfragen würden die Supportübergabe und die spätere UAT-Ausführung schwächen.', handoff: 'Schulungsnachweis an UAT, Cutover und Supportübergabe', evidenceReadback: 'Schulungsagenda, Teilnehmernachweis, Übungsfall und Fragenlog' },
  'UABC-44': { customerInputs: 'Cutover-Checkliste, Resetpunkt, Postingfälle, Kontrollsummen und Defectweg', customerRoles: 'ROLE-CUSTOMER-IT, Sponsor und Key User für Cutover-Entscheidungen', consultantRoles: 'Cutover Lead, BC Functional Lead und Projektleitung', concreteSteps: 'Cutover-Sequenz durchspielen, Posting kontrollieren, Defect erfassen, Korrektur retesten und Go-live-Rehearsal dokumentieren', agenda: 'Entry Gate, Daten, Rollen, Posting, Kontrolle, Defect, Retest und Exit', expectedResult: 'Die synthetische Go-live-Probe weist Posting, Kontrolle, Defect, Korrektur und Retest nach, ohne einen realen Go-live zu behaupten.', specificRisk: 'Ein fehlender Resetpunkt würde eine fehlerhafte Simulation unkontrolliert fortschreiben.', handoff: 'Rehearsal-Nachweis an Hypercare-Plan und Realgate-Register', evidenceReadback: 'Rehearsal-Protokoll, Posting-Kontrolle, Defect und Retest' },
  'UABC-47': { customerInputs: 'Periodenstatus, Abstimmkonten, Kontrollsummen, offene Posten und Abschlussfragen', customerRoles: 'ROLE-CUSTOMER-FINANCE als Monatsabschlussverantwortung', consultantRoles: 'Finance Close Lead und VAT Consultant', concreteSteps: 'Periodenstatus prüfen, Bank und Nebenbücher abstimmen, Kontrollsummen vergleichen, Drill-down ausführen und Abschlussprotokoll erstellen', agenda: 'Periodensteuerung, Abstimmung, Kontrollsumme, Drill-down, Abweichung und Abschluss', expectedResult: 'Der erste synthetische Monatsabschluss verbindet Abstimmung, Kontrollsummen, Drill-down und dokumentierte Abweichungen.', specificRisk: 'Ungeklärte Differenzen würden den Abschluss als nicht belastbar erscheinen lassen.', handoff: 'Close-Protokoll an VAT-Vorschau und Supportübergabe', evidenceReadback: 'Close-Checkliste, Abstimmnachweis, Kontrollsummen und Retest' },
  'UABC-48': { customerInputs: 'MwSt.-Codes, Buchungsmatrix, Bemessungsgrundlagen, UStVA-Vorschau und offene Lokalisierungsfragen', customerRoles: 'ROLE-CUSTOMER-FINANCE als fachliche VAT-Rolle', consultantRoles: 'VAT Consultant und Finance Close Lead', concreteSteps: 'MwSt.-Codes prüfen, Buchungsmatrix abgleichen, Vorschau synthetisch berechnen, Differenzen erklären und Live-Gate markieren', agenda: 'MwSt.-Setup, Buchung, Bemessung, UStVA-Vorschau, Kontrollsumme und offene Steuerfreigabe', expectedResult: 'Die synthetische UStVA-Vorschau ist mit MwSt.-Codes, Kontrollsummen und offenem realem Lokalisierungs-Gate dokumentiert.', specificRisk: 'Die Vorschau darf nicht als reale Steuerberatung oder übermittelte UStVA missverstanden werden.', handoff: 'VAT-Vorschau an Abschlussdokumentation und Realgate-Register', evidenceReadback: 'VAT-Setup, Vorschau, Kontrollsummen und offene Lokalisierungsfrage' },
  'UABC-32': {
    customerInputs: 'Datenquellen, Feldlisten, Dateiformate, Daten-Owner, Ausgangsprüfsummen und Freigabefrist',
    customerRoles: 'ROLE-CUSTOMER-IT und ROLE-CUSTOMER-FINANCE als Daten-Owner',
    consultantRoles: 'Data Migration Lead und Finance Consultant',
    concreteSteps: 'Quelleninventar führen, Feldmapping abstimmen, Transformationsregeln markieren, Qualitätschecks definieren und Freigabe protokollieren',
    agenda: 'Quellen, Pflichtfelder, Format, Dubletten, Prüfsummen, Fehlerweg und Freigabeentscheidung',
    expectedResult: 'Das Datenpaket besitzt zu jeder Quelle Feldmapping, Formatregel, Owner, Qualitätscheck und dokumentierte synthetische Freigabe.',
    specificRisk: 'Unklare Herkunft oder fehlende Pflichtfelder verfälschen die Migrationsprobe.',
    handoff: 'Freigegebenes Datenmapping an die Migrationsprobe und die Finance-Abstimmung',
    evidenceReadback: 'Datenquellenregister, Mappingtabelle, Prüfsummen und Freigabenachweis'
  },
  'UABC-46': {
    customerInputs: 'Hypercare-Tagebuch, Incident-Prioritäten, gewünschte Reaktionszeiten, Restart-Entscheidung und Exit-Kriterien',
    customerRoles: 'ACTOR-KUNDEN-SUPPORT und ROLE-CUSTOMER-IT als Support- und Eskalationsrollen',
    consultantRoles: 'Hypercare Lead, BC Functional Lead und Support Transition Lead',
    concreteSteps: 'Incident-Triage simulieren, Priorität und Reaktion prüfen, Fix dokumentieren, Retest ausführen, Restart bewerten und Exit abnehmen',
    agenda: 'Tageslage, Incident, Priorität, Reaktion, Fix, Retest, Restart, offene Risiken und Exit-Entscheidung',
    expectedResult: 'Die synthetische Hypercare weist Incident-Priorität, Reaktion, Fix, Retest, Restart-Entscheidung und Exit-Kriterium nachvollziehbar nach.',
    specificRisk: 'Fehlende Triage oder ein unklarer Exit würde einen offenen Defect fälschlich als stabilen Betrieb darstellen.',
    handoff: 'Hypercare-Log und Exit-Entscheidung an Support und Monatsabschluss',
    evidenceReadback: 'Hypercare-Tagebuch, Incident-/Defect-Log, Fix- und Retest-Referenz'
  },
  'UABC-50': {
    customerInputs: 'Abschlussliste, Supportkontakte, Restpunktregister, Handover-Fragen und synthetische Abnahmebestätigung',
    customerRoles: 'ACTOR-KUNDEN-SUPPORT und ROLE-CUSTOMER-SPONSOR für Supportannahme und Abschluss',
    consultantRoles: 'Projektleitung, Support Transition Lead und Lead BC Consultant',
    concreteSteps: 'Deliverables abgleichen, Restpunkte und acht reale Gates trennen, Supportweg erklären, Handover-Protokoll schließen und Retro-Ergebnis sichern',
    agenda: 'Lieferobjekte, offene reale Gates, Supportweg, Rollen, Rückfragen, Retro und Abschlussentscheidung',
    expectedResult: 'Die synthetische Handover-Abnahme ist abgeschlossen; ausschließlich die acht realen Kundengates bleiben als Folgegrenze offen.',
    specificRisk: 'Eine Vermischung von synthetischer Abnahme und echtem Go-live würde die reale Freigabegrenze verschleiern.',
    handoff: 'Abgeschlossenes Handover-Paket an die Supportrolle mit separatem Realgate-Register',
    evidenceReadback: 'Handover-Protokoll, Supportübergabe, Abschlussregister und Retro-Nachweis'
  }
};
specialDetails['UABC-22'].control = 'Kreditor, Artikel, Wareneingang, Eingangsrechnung und Ausgleich sind über die synthetischen Posten kontrolliert.';
specialDetails['UABC-23'].control = 'Debitor, Artikel, Lieferung, Rechnung, Zahlung und Ausgleich sind über die synthetischen Posten kontrolliert.';
specialDetails['UABC-24'].control = 'Lagerort, Artikelkarte, Bewegung, Inventur und Bestandskontrolle stimmen zur Kontrollsumme.';
specialDetails['UABC-29'].control = 'Die sieben UAT-Szenarien besitzen zugeordnete Rollen, Daten, Expected Results und einen Sign-off-Status.';
specialDetails['UABC-32'].control = 'Jede Datenquelle besitzt Feldmapping, Format, Owner, Qualitätscheck und Freigabestatus.';
specialDetails['UABC-42'].control = 'Jede Key-User-Rolle weist Lernziel, Übungsfall, Readback und dokumentierte Wissenslücke oder Bestätigung nach.';
specialDetails['UABC-44'].control = 'Cutover-Sequenz, Freeze, Rückfallpunkt, Entry/Exit und Rehearsal-Resultat sind im Protokoll abgeglichen.';
specialDetails['UABC-46'].control = 'Incident-Priorität, Reaktion, Fix, Retest, Restart und Exit sind im Hypercare-Log jeweils belegt.';
specialDetails['UABC-47'].control = 'Offene Posten, Bank, Lagerkontrolle, Buchungsperioden und Kontrollsummen tragen eine Abschlussentscheidung.';
specialDetails['UABC-48'].control = 'MwSt.-Gruppen, Matrix, MwSt.-Posten, Vorschau und Abstimmung sind mit offenem Lokalisierungs-/Elster-Gate getrennt.';
specialDetails['UABC-50'].control = 'Deliverables, Supportweg, Restpunkte und acht reale Folgegates sind im Handover-Register getrennt bestätigt.';
const d = (customerInputs, customerRoles, consultantRoles, concreteSteps, agenda, expectedResult, specificRisk, handoff, evidenceReadback, control) => ({ customerInputs, customerRoles, consultantRoles, concreteSteps, agenda, expectedResult, specificRisk, handoff, evidenceReadback, control });
const detailCatalog = {
  'UABC-1': d('Sponsorauftrag, Scopegrenzen, Rollenliste und Entscheidungsweg', 'ROLE-CUSTOMER-SPONSOR und Projektleitung', 'Projektleitung und Solution Architect', 'Auftrag prüfen, Rollen benennen, Scope-Baseline ablegen und Eintrittsgate protokollieren', 'Auftrag, Scope, Rollen, Budget, Risiken und Gateentscheidung', 'Phase 1 besitzt einen entschiedenen Scope, benannte Rollen und ein prüfbares Eintrittsgate.', 'Unklare Entscheidungsrechte verzögern Discovery und Datenfreigabe.', 'Phase 1 an Discovery und Datenbereitschaft', 'Projektauftrag, Rollenregister und Gateprotokoll', 'Scope und Rollen sind im Projektauftrag gegen das Register abgeglichen.'),
  'UABC-2': d('Ergebnisse aus Phase 1, Konfigurationsbaseline und Testvoraussetzungen', 'ROLE-CUSTOMER-SPONSOR, Finance und Key User', 'Projektleitung, Solution Architect und Test Lead', 'Einrichtungspakete priorisieren, Testwellen ordnen, Schulungsbedarf prüfen und Eintritt für Phase 2 sichern', 'Baseline, Einrichtung, Prozesse, Test, Schulung und Austrittsnachweis', 'Phase 2 bündelt die Einrichtung, Tests und Schulungsnachweise der Simulation.', 'Fehlende Vorbedingungen würden Einrichtung und UAT vermischen.', 'Phase 2 an Prozessnachweise und UAT', 'Phasenplan, Testwellen und Schulungsregister', 'Alle Unterstränge besitzen einen Eintritt, eine Evidence und ein Austrittskriterium.'),
  'UABC-3': d('Hypercare-Log, Abschlussregister, VAT-Vorschau und Supportfragen', 'ACTOR-KUNDEN-SUPPORT und ROLE-CUSTOMER-SPONSOR', 'Projektleitung, Close Lead und Support Transition Lead', 'Restpunkte triagieren, Abschluss kontrollieren, Supportannahme simulieren und Realgate-Register übergeben', 'Hypercare, Close, VAT, Retro, Support und Abschluss', 'Phase 3 dokumentiert die simulierte Stabilisierung und den abgeschlossenen Handover.', 'Reale Kundengates dürfen nicht durch die Simulation verdeckt werden.', 'Phase 3 an Support und acht reale Folgegates', 'Hypercare-Log, Close-Nachweis und Handover-Paket', 'Synthetischer Abschluss und reale Folgegrenze sind getrennt ausgewiesen.'),
  'UABC-4': d('Projektauftrag, Discovery-Fragen, Sponsorentscheidungen und Rollenregister', 'ROLE-CUSTOMER-SPONSOR und Prozessverantwortliche', 'Projektleitung und Solution Architect', 'Kickoff vorbereiten, Entscheidungsrechte festlegen und Discovery-Fragen in den Plan übernehmen', 'Zielbild, Scope, Rollen, Termine, Risiken und Changeweg', 'Projektinitiierung und Discovery liefern einen abgestimmten Arbeitsrahmen.', 'Ein nicht entschiedener Scope erzeugt spätere Change-Konflikte.', 'Projektauftrag an Discovery und Prozessdesign', 'Kickoff-Transkript, Projektauftrag und Entscheidungsregister', 'Scope, Rollen und Changeweg sind als drei getrennte Akzeptanzpunkte dokumentiert.'),
  'UABC-5': d('Finance-, Einkauf-, Verkauf-, Lager- und Supportrollen mit Prozessverantwortung', 'Finance, Einkauf, Verkauf und Lager Key User', 'Business Central Functional Lead', 'Prozessowner interviewen, Übergaben markieren, Kontrollpunkte sammeln und Prozesslandkarte freigeben', 'Organisation, Prozess, Rolle, Eingang, Ausgang und Kontrollpunkt', 'Die Discovery beschreibt die relevanten Prozessketten und ihre Owner.', 'Unklare Übergaben führen zu Lücken im UAT-Scope.', 'Prozesslandkarte an Lösungsdesign und UAT-Katalog', 'Discovery-Transkript, Prozesslandkarte und Rollenreferenzen', 'Jede Prozesskette besitzt Owner, Eingang, Ausgang und Kontrollpunkt.'),
  'UABC-6': d('Stammdatenquellen, Migrationswellen, Prüfsummen und Datenverantwortliche', 'ROLE-CUSTOMER-IT und ROLE-CUSTOMER-FINANCE', 'Data Migration Lead und Finance Consultant', 'Datenquellen inventarisieren, Bereinigung markieren, Wellen planen und Qualitätsgates definieren', 'Quelle, Owner, Feld, Format, Qualität, Freigabe und Welle', 'Die Datenbereitschaft ist für die Simulation mit Quellen und Prüfungen belastbar beschrieben.', 'Fehlende Datenowner gefährden jede Migrationsprobe.', 'Datenbereitschaft an Mapping und Migrationsprobe', 'Datenregister, Mappingvorlage und Prüfsummen', 'Jede Datenwelle besitzt Quelle, Owner, Formatregel und Qualitätscheck.'),
  'UABC-7': d('Firmendaten, Geschäftsjahr, Perioden, MwSt., Nummernserien und Dimensionen', 'ROLE-CUSTOMER-FINANCE und ROLE-CUSTOMER-IT', 'BC Setup Consultant und Security Lead', 'Firmendaten prüfen, Perioden setzen, Buchungsmatrix abstimmen, Nummernserien und Dimensionen kontrollieren', 'Firma, Perioden, MwSt., Nummernserien, Dimensionen und Rollen', 'Die Grundeinrichtung bildet die synthetische Finanz- und Sicherheitsbaseline.', 'Ein Setup ohne Kontrollsummen würde Folgeprozesse unprüfbar machen.', 'Grundsetup an Kernprozesse und Testdaten', 'Setup-Parameter, Kontrollen und Konfigurationscheckliste', 'Firma, Perioden, Serien, Dimensionen und Buchungsmatrix sind einzeln geprüft.'),
  'UABC-8': d('Kunden-, Lieferanten-, Artikel- und Zahlungsstammdaten mit Buchungsgruppen', 'Finance, Einkauf, Verkauf und Lager Key User', 'Master-Data Lead und Functional Consultants', 'Stammdatenfelder prüfen, Buchungsgruppen zuordnen, Pflichtfelder markieren und Testbelege vorbereiten', 'Stammdaten, Gruppen, Pflichtfelder, Nummerierung und Testbeleg', 'Die Kernstammdaten sind für die Prozesssimulation referenziell geschlossen.', 'Falsche Gruppen verschieben Postings und erschweren Drill-downs.', 'Stammdaten an P2P, O2C und Lager', 'Stammdatenregister, Mapping und Testbelegliste', 'Jeder Stammdatentyp besitzt Pflichtfelder, Gruppe und Testbeleg.'),
  'UABC-9': d('Posting-Szenarien, Kontrollsummen, UAT-Fälle und Defectklassen', 'Key User aus Finance, Einkauf, Verkauf und Lager', 'Test Lead und Functional Consultants', 'Szenarien priorisieren, Expected Results definieren, Ledger-Checks hinterlegen und Retestweg planen', 'Szenario, Daten, Rolle, Posting, Kontrollsumme und Retest', 'Die Prozessnachweise verbinden Belegketten mit prüfbaren Kontrollen.', 'Fehlende Ledger-Referenzen lassen Defects nicht reproduzierbar werden.', 'Testkatalog an UAT und Schulung', 'Testkatalog, Kontrollmatrix und Defectregister', 'Jedes Szenario besitzt Eingang, Expected Result, Kontrollsumme und Retest.'),
  'UABC-10': d('Rollenprofile, Lernziele, Übungsbelege und Wissenstestfragen', 'ROLE-CUSTOMER-FINANCE, PURCHASE, SALES und WAREHOUSE', 'Training Lead und Functional Consultants', 'Rollenübungen durchführen, Navigation erklären, Belege kontrollieren und Wissenslücken nachhalten', 'Rolle, Navigation, Übung, Posting Preview, Readback und Frage', 'Die Key User können die vereinbarten simulierten Standardabläufe nachvollziehen.', 'Nicht erkannte Wissenslücken erhöhen die Supportlast.', 'Schulung an UAT, Cutover und Support', 'Schulungsagenda, Übungsfälle und Wissenslückenlog', 'Jede Rolle hat Lernziel, Übung, Readback und Nachbereitung.'),
  'UABC-11': d('Defectlog, Prioritäten, Retests, Restartpunkt und Hypercare-Kadenz', 'ACTOR-KUNDEN-SUPPORT und ROLE-CUSTOMER-IT', 'Hypercare Lead und Functional Leads', 'Triage simulieren, Korrekturen bewerten, Retests führen und Exitkriterien abgleichen', 'Lage, Incident, Priorität, Fix, Retest, Restart und Exit', 'Die Stabilisierung weist einen kontrollierten synthetischen Defect- und Retestweg nach.', 'Ein übersprungener Retest erzeugt einen falschen Stabilitätsclaim.', 'Stabilisierung an Close und Handover', 'Hypercare-Log, Defectregister und Retestnachweis', 'P1/P2 sind im Simulationsregister geschlossen und Realgates separat offen.'),
  'UABC-12': d('Abschlusscheckliste, Kostenabgleich, Deliverables und Restpunktregister', 'ROLE-CUSTOMER-SPONSOR und Projektleitung', 'Project Manager und Quality Lead', 'Deliverables abgleichen, Kosten prüfen, Restpunkte klassifizieren und Abschlussentscheidung dokumentieren', 'Lieferobjekt, Kosten, Restpunkt, Entscheidung und Folgegate', 'Die Abschlusssteuerung belegt die synthetische Vollständigkeit des Projekts.', 'Ein fehlender Kosten- oder Restpunktabgleich schwächt die Abnahme.', 'Abschlusssteuerung an Handover und Support', 'Billing, Deliverable-Register und Abschlussprotokoll', 'Alle Lieferobjekte und Kostenwerte stimmen mit der kanonischen Story überein.'),
  'UABC-13': d('Supportweg, Ansprechpartner, Handover-Unterlagen und acht reale Folgegates', 'ACTOR-KUNDEN-SUPPORT und ROLE-CUSTOMER-SPONSOR', 'Support Transition Lead und Projektleitung', 'Supportweg erklären, Unterlagen übergeben, Rückfragen sammeln und Realgate-Liste bestätigen', 'Support, Eskalation, Dokumente, Rollen und reale Folgegrenze', 'Die Supportübergabe ist synthetisch abgeschlossen und klar von echtem Betrieb getrennt.', 'Ein fehlender Supportowner erschwert die spätere reale Übergabe.', 'Supportübergabe an Handover und Realgate-Register', 'Supporthandbuch, Handover-Transkript und Kontaktregister', 'Supportowner, Eskalation und acht offene Realgates sind getrennt bestätigt.'),
  'UABC-14': d('Kickoff-Termin, Teilnehmerrollen, Projektauftrag und offene Entscheidungsfragen', 'ROLE-CUSTOMER-SPONSOR und benannte Key User', 'Projektleitung und Lead BC Consultant', 'Agenda versenden, Eingaben einsammeln, Zielbild besprechen, Entscheidungen protokollieren und Folgeaufgaben verteilen', 'Ziel, Scope, Rollen, Termine, Risiken, Entscheidungen und Aufgaben', 'Der Kickoff erzeugt ein nachvollziehbares gemeinsames Projektverständnis.', 'Nicht protokollierte Entscheidungen erzeugen spätere Scopeabweichungen.', 'Kickoff an Discovery und Projektauftrag', 'UABC-MTG-001, Kickoff-Protokoll und Aufgabenliste', 'Teilnehmer, Entscheidungen und Folgeaufgaben sind im Transkript auffindbar.'),
  'UABC-15': d('Prozessfragen, Ist-Abläufe, Ausnahmen und Standardnähe der Kundenrollen', 'Finance, Einkauf, Verkauf und Lager Key User', 'Discovery Lead und Process Consultant', 'Ist-Abläufe aufnehmen, Ausnahmen markieren, Standardprozesse zuordnen und offene Fragen entscheiden', 'Ist, Soll, Ausnahme, Standard, Entscheidung und Folgeaktion', 'Die Discovery liefert pro Kernprozess eine fachliche Ausgangslage und ein Zielbild.', 'Ungeklärte Ausnahmen werden später als unpriorisierte Gaps sichtbar.', 'Discovery an Prozessdesign und Fit-Gap', 'Discovery-Transkript, Prozesslandkarte und Fragebogen', 'Jeder Kernprozess besitzt Istbild, Sollrichtung und offene Entscheidung.'),
  'UABC-17': d('Kunden-, Lieferanten- und Artikelstammdaten mit Pflichtfeld- und Dublettenliste', 'ROLE-CUSTOMER-FINANCE, PURCHASE, SALES und WAREHOUSE', 'Stammdatenberater', 'Stammdatenquellen abgleichen, Pflichtfelder prüfen, Dubletten kennzeichnen und Owner bestätigen', 'Quelle, Pflichtfeld, Dublette, Owner, Bereinigung und Freigabe', 'Die Stammdatenprüfung liefert bereinigte synthetische Testdaten für alle Prozessketten.', 'Dubletten verfälschen Belege und Ausgleich.', 'Stammdatenprüfung an Mapping und Testdaten', 'Stammdatenliste, Dublettenlog und Freigabe', 'Pflichtfelder und Dubletten sind mit Owner und Korrekturstatus dokumentiert.'),
  'UABC-18': d('Feldmapping, Transformationsregeln, Datumsformate und Kontrollsummen', 'ROLE-CUSTOMER-IT und Daten-Owner', 'Data Migration Lead', 'Mappingfelder definieren, Transformationsregeln abstimmen, Formate prüfen und Kontrollsummen vergleichen', 'Quelle, Zielfeld, Regel, Format, Prüfsumme und Freigabe', 'Die Migrationslogik ist reproduzierbar und für die Probe prüfbar.', 'Uneindeutige Transformationen erzeugen stille Datenverluste.', 'Mapping an Migrationsprobe und UAT-Daten', 'Mappingtabelle, Formatregeln und Kontrollsummen', 'Jedes Pflichtfeld besitzt Quelle, Zielfeld und Transformation.'),
  'UABC-19': d('Bereinigte Stammdaten, Mappingversion und Probeimport-Kontrollsummen', 'ROLE-CUSTOMER-IT und ROLE-CUSTOMER-FINANCE', 'Data Migration Lead und Quality Lead', 'Probeimport simulieren, Fehlerliste erstellen, Korrekturen einarbeiten und Kontrollsummen erneut prüfen', 'Import, Fehler, Korrektur, Reimport, Prüfsumme und Sign-off', 'Die Migrationsprobe zeigt eine kontrollierte Fehler- und Retestschleife.', 'Ein nicht reproduzierbarer Fehler blockiert die UAT-Datenbasis.', 'Migrationsprobe an UAT und Cutover-Plan', 'Probeimport, Fehlerlog und Retest', 'Fehlerliste und zweite Prüfsumme sind auf dieselbe Mappingversion bezogen.'),
  'UABC-20': d('Rollen, Berechtigungsprofile, SoD-Fragen und synthetische Security-Evidence', 'ROLE-CUSTOMER-IT und ROLE-CUSTOMER-SPONSOR', 'Security Lead und Solution Architect', 'Rollenmodell prüfen, Aufgaben trennen, Zugriffsmatrix abgleichen und offene Live-Security-Gates markieren', 'Rolle, Aufgabe, Zugriff, SoD, Freigabe und offenes Realgate', 'Das Rollenmodell trennt simulierte Einrichtung von realer Tenantfreigabe.', 'Ein übersehener Konflikt würde spätere Security-Abnahme gefährden.', 'Rollenmodell an Schulung, UAT und Realgates', 'Berechtigungsmatrix, SoD-Prüfung und Gate-Register', 'Jede Rolle besitzt Zweck, Zugriff und getrennte Freigabegrenze.'),
  'UABC-21': d('Firmendaten, Geschäftsjahr, Buchungsperioden, MwSt.-/Buchungsmatrix, Nummernserien und Dimensionen', 'ROLE-CUSTOMER-FINANCE und ROLE-CUSTOMER-IT', 'BC Setup Consultant und Finance Consultant', 'Firmendaten prüfen, Geschäftsjahr und Perioden abgleichen, MwSt.-/Buchungsmatrix setzen, Nummernserien und Dimensionen testen, Posting Preview und Belegnavigation kontrollieren', 'Firma, Jahr, Perioden, MwSt., Serien, Dimensionen, Posting Preview und Find Entries', 'Die synthetische Grundeinrichtung ist mit Firmendaten, Perioden, Matrix, Serien, Dimensionen und Belegnavigation belegt.', 'Fehlende Perioden- oder Serienkontrolle verschiebt Posting und Drill-down.', 'Grundeinrichtung an Finanzsetup und Prozessbelege', 'Setup-Checkliste, Posting Preview und Belegnavigation', 'Alle genannten Setupobjekte besitzen einen dokumentierten Kontrollschritt.'),
  'UABC-25': d('Zahlungsarten, Zahlungsjournal, Ausgleichsregeln und offene Posten', 'ROLE-CUSTOMER-FINANCE und ROLE-CUSTOMER-SALES', 'Finance Consultant', 'Zahlung erfassen, offene Posten anzeigen, Ausgleich simulieren und Differenz kontrollieren', 'Zahlungsart, Journal, Posten, Ausgleich, Differenz und Retest', 'Der synthetische Zahlungslauf zeigt Beleg, Zahlung und Ausgleich nachvollziehbar.', 'Falsche Ausgleichslogik verfälscht offene Posten.', 'Zahlungen an Bankabstimmung und Monatsabschluss', 'Zahlungsjournal, Debitoren-/Kreditorenposten und Ausgleich', 'Zahlung und Ausgleich referenzieren denselben synthetischen Beleg.'),
  'UABC-26': d('Bankkonten als Platzhalter, Abstimmregeln, Zahlungsjournal und Differenzliste', 'ROLE-CUSTOMER-FINANCE und ROLE-CUSTOMER-IT', 'Bank Reconciliation Consultant', 'Zahlungsjournal vorbereiten, Bankabstimmregel anwenden, Differenz markieren und Korrekturweg dokumentieren', 'Journal, Bankzeile, Match, Differenz, Korrektur und Kontrolle', 'Die Bankabstimmung bleibt synthetisch und enthält keine reale Bankkennung.', 'Eine ungeklärte Differenz würde den Close-Nachweis entwerten.', 'Bankabstimmung an Monatsabschluss und Support', 'Abstimmprotokoll, Differenzliste und Retest', 'Keine reale Bankkennung wird als Evidence oder Laufzeitwert verwendet.'),
  'UABC-27': d('Periodenstatus, Buchungsperioden, Abstimmkonten und Close-Kontrollsummen', 'ROLE-CUSTOMER-FINANCE', 'Finance Close Lead', 'Periodenstatus prüfen, Sperrlogik simulieren, Abstimmkonten vergleichen und Close-Fragen protokollieren', 'Periode, Sperre, Abstimmung, Kontrollsumme und Entscheidung', 'Die Periodensteuerung ist für den synthetischen Monatsabschluss nachvollziehbar.', 'Ein falscher Periodenstatus kann spätere Korrekturen verdecken.', 'Periodensteuerung an Close und VAT-Vorschau', 'Periodencheck, Kontrollsummen und Entscheidungsregister', 'Periodenstatus und Kontrollsumme sind im selben Close-Fall verknüpft.'),
  'UABC-28': d('MwSt.-Buchungsgruppen, MwSt.-Matrix, MwSt.-Posten und deutsche UStVA-Vorschau', 'ROLE-CUSTOMER-FINANCE', 'VAT Consultant und Finance Close Lead', 'MwSt.-Gruppen prüfen, Matrix abgleichen, MwSt.-Posten lesen, Vorschau abstimmen und Elster-/Lokalisierungsgrenze markieren', 'Code, Gruppe, Matrix, Posten, Vorschau, Abstimmung und offenes Realgate', 'Die synthetische MwSt.-Prüfung verbindet Gruppen, Matrix, Posten und Vorschau ohne reale UStVA-Übermittlung.', 'Die reale Lokalisierungs-, Elster- und Anmeldeprüfung bleibt offen.', 'MwSt.-Setup an VAT-Vorschau und Realgate-Register', 'MwSt.-Matrix, MwSt.-Posten und Vorschaukontrollsumme', 'Die Vorschau ist als synthetisch klassifiziert und trägt das offene reale Steuer-Gate.'),
  'UABC-30': d('UAT-Szenarien für P2P, O2C, Lager, Close und VAT mit Testrollen und Beispieldaten', 'Finance, Einkauf, Verkauf, Lager und UAT-Verantwortliche', 'UAT Lead und Functional Consultants', 'Szenarien ausführen, erwartete Ledger Entries und Kontrollsummen vergleichen, Defect klassifizieren und Retest dokumentieren', 'Szenario, Rolle, Daten, Expected Result, Ledger, Defect, Retest und Sign-off', 'Die synthetische UAT weist die vereinbarten Prozessketten mit Readback und Sign-off nach.', 'Ein Sign-off ohne Defect- und Retestspur wäre nicht belastbar.', 'UAT an Cutover-Rehearsal und Handover', 'UAT-Protokoll, Ledger-Kontrollen, Defect- und Retestlog', 'Jedes UAT-Szenario besitzt Rolle, Daten, Expected Result und Sign-offstatus.'),
  'UABC-31': d('Offene Defects, Priorität, Ursache, Korrektur und Retestdatum', 'Key User und ACTOR-KUNDEN-SUPPORT', 'Defect Lead und Functional Consultants', 'Defects klassifizieren, Korrekturmaßnahme zuordnen, Retest durchführen und Restpunktstatus aktualisieren', 'Defect, Priorität, Ursache, Fix, Retest und Abschluss', 'Die Defectsteuerung schließt die synthetische Prozessprüfung ohne reale Produktivfreigabe.', 'Eine falsche Priorität kann ein kritisches Problem verschleiern.', 'Defectlog an UAT, Hypercare und Handover', 'Defectregister, Fixnachweis und Retest', 'Jeder Defect besitzt Ursache, Fix, Retest und Abschlussstatus.'),
  'UABC-33': d('Sollprozesse, BC-Standardfunktionen, Kundenabweichungen und Entscheidungsliste', 'Prozessowner aus Finance, Einkauf, Verkauf und Lager', 'Solution Architect und Process Consultants', 'Sollprozess modellieren, Standardfunktion zuordnen, Abweichung begründen und Entscheidung protokollieren', 'Standard, Abweichung, Nutzen, Risiko, Entscheidung und Folgeaktion', 'Das Prozessdesign trennt BC-Standard, Kundenentscheidung und offene Frage.', 'Unbegründete Abweichungen vergrößern den Scope.', 'Prozessdesign an Fit-Gap und Einrichtung', 'Solution Design, Prozessmodell und Entscheidungsregister', 'Jede Abweichung besitzt Nutzen, Risiko und Entscheidung.'),
  'UABC-34': d('Fit-Gap-Kandidaten, Standardreferenz, Priorität und Sponsorentscheidung', 'ROLE-CUSTOMER-SPONSOR und Prozessowner', 'Solution Architect und Functional Lead', 'Gaps bewerten, Standardoption prüfen, Priorität vergeben und Folgeaktion bestätigen', 'Gap, Standard, Priorität, Option, Entscheidung und Owner', 'Die Fit-Gap-Liste liefert priorisierte Entscheidungen statt ungeprüfter Entwicklung.', 'Ein unpriorisiertes Gap würde den Cutover-Scope destabilisieren.', 'Fit-Gap an Konfiguration und Realgate-Register', 'Fit-Gap-Matrix, Entscheidung und Folgeaktion', 'Jeder Gap besitzt Priorität, Owner und dokumentierte Option.'),
  'UABC-35': d('Konfigurationspakete, Buchungsgruppen, Nummernserien, Dimensionen und Reviewcheckliste', 'ROLE-CUSTOMER-FINANCE und ROLE-CUSTOMER-IT', 'Configuration Lead und Finance Consultant', 'Pakete prüfen, Werte gegen Baseline abgleichen, Posting Preview nutzen und Abweichungen dokumentieren', 'Paket, Feld, Wert, Quelle, Preview, Abweichung und Retest', 'Die Konfigurationsprüfung bindet Werte an Quelle und Kontrollresultat.', 'Ein unreferenzierter Wert könnte versehentlich als Kundenfreigabe gelten.', 'Konfigurationsreview an Testdaten und UAT', 'Reviewcheckliste, Paketregister und Abweichungslog', 'Jede kritische Konfiguration besitzt Quelle, Preview und Reviewstatus.'),
  'UABC-36': d('Testdatenpaket, Stammdatenreferenzen, Belegnummern und Resetpunkt', 'ROLE-CUSTOMER-IT und Key User', 'Test Data Lead', 'Testdaten laden, Referenzen prüfen, Belegnummern kontrollieren und Resetpunkt dokumentieren', 'Quelle, Import, Referenz, Nummer, Reset und Freigabe', 'Die Testdaten sind für die synthetischen Prozessketten reproduzierbar vorbereitet.', 'Ein fehlender Resetpunkt vermischt Testfälle.', 'Testdaten an P2P, O2C, Lager und UAT', 'Testdatenregister, Resetpunkt und Importkontrolle', 'Jeder Testfall verweist auf Datenquelle und Resetpunkt.'),
  'UABC-37': d('P2P-Belegkette: Kreditor, Artikel, Bestellung, Wareneingang, Eingangsrechnung und Posten', 'ROLE-CUSTOMER-PURCHASE und ROLE-CUSTOMER-FINANCE', 'P2P Consultant und Finance Consultant', 'Kreditor und Artikel auswählen, Bestellung simulieren, Wareneingang prüfen, Rechnung buchen, Kreditoren- und Sachposten lesen und Ausgleich markieren', 'Bedarf, Bestellung, Wareneingang, Rechnung, Kreditorenposten, Sachposten und Retest', 'Die P2P-Kette weist Belege, Ledger Entries und Kontrollsummen mit Defect/Fix/Retest nach.', 'Abweichende Buchungsgruppen würden Kreditoren- und Sachposten trennen.', 'P2P-Test an Defectlog und Monatsabschluss', 'P2P-Posting, Kreditorenposten, Sachposten, Defect und Retest', 'Belegkette und Ledger-Kontrollsumme stimmen nach Retest überein.'),
  'UABC-38': d('O2C-Belegkette: Debitor, Artikel, Auftrag, Lieferung, Rechnung und Zahlung', 'ROLE-CUSTOMER-SALES und ROLE-CUSTOMER-FINANCE', 'O2C Consultant und Finance Consultant', 'Debitor und Artikel auswählen, Auftrag simulieren, Lieferung prüfen, Rechnung erstellen, Debitorenposten lesen und Zahlung ausgleichen', 'Auftrag, Lieferung, Rechnung, Debitorenposten, Zahlung und Retest', 'Die O2C-Kette zeigt Belegfluss, Posten, Kontrollsumme und korrigierten Defect.', 'Unklare Liefer- oder Zahlungsreferenzen verfälschen Umsatz und OP.', 'O2C-Test an Defectlog und Monatsabschluss', 'O2C-Posting, Debitorenposten, Ausgleich, Defect und Retest', 'Die Zahlung gleicht den synthetischen Debitorenposten nach Retest aus.'),
  'UABC-39': d('Lagerort, Artikelkarte, Bestand, Zu-/Abgang, einfache Umlagerung und Inventur', 'ROLE-CUSTOMER-WAREHOUSE und ROLE-CUSTOMER-FINANCE', 'Warehouse Consultant', 'Artikelkarte prüfen, Lagerort wählen, Zu- und Abgang simulieren, Umlagerung begrenzen, Inventur kontrollieren und Defect retesten', 'Artikel, Lagerort, Bestand, Bewegung, Inventur, Differenz und Retest', 'Der Lager-Test weist Bestandsbewegung und Kontrollsumme im einfachen Lagerumfang nach.', 'Nicht passende Lagerorte würden Bestand und Bewertung auseinanderziehen.', 'Lager-Test an Close und Support', 'Lagerbewegung, Bestandskontrolle, Defect und Retest', 'Bestand vor/nach Bewegung und Inventurdifferenz sind dokumentiert.'),
  'UABC-40': d('Close-Belegkette: offene Posten, Bank, Lagerkontrolle, Perioden und Kontrollsummen', 'ROLE-CUSTOMER-FINANCE und ROLE-CUSTOMER-WAREHOUSE', 'Finance Close Lead und Warehouse Consultant', 'Offene Posten abstimmen, Bankdifferenz prüfen, Lagerkontrolle lesen, Periode schließen simulieren und Retest durchführen', 'OP, Bank, Lager, Periode, Kontrollsumme, Defect und Retest', 'Der Close-Test verbindet Nebenbücher, Bank, Lager und Periodensteuerung.', 'Ungeklärte Differenzen würden die Abschlussentscheidung blockieren.', 'Close-Test an Monatsabschluss und VAT-Vorschau', 'Close-Checkliste, Abstimmungen, Defect und Retest', 'Alle Kontrollsummen besitzen eine Abweichungsentscheidung und Retestspur.'),
  'UABC-41': d('Rollen, Lernziele, Übungsfälle, Handbuchseiten und Schulungstermine', 'Key User aus Finance, Einkauf, Verkauf und Lager', 'Training Lead', 'Lernziele je Rolle planen, Übungen zuordnen, Handbuchseiten verlinken und Nachbereitung terminieren', 'Rolle, Lernziel, Übung, Quelle, Readback und Termin', 'Der Schulungsplan ist je Rolle und Prozess nachvollziehbar.', 'Nicht passende Übungen lassen Prozessrisiken unentdeckt.', 'Schulungsplan an Key-User-Schulung und Support', 'Schulungsplan, Handbuchreferenzen und Teilnehmerliste', 'Jede Rolle besitzt Lernziel, Übung, Readback und Nachbereitung.'),
  'UABC-43': d('Cutover-Reihenfolge, Owner, Freeze-Fenster, Resetpunkt und Entry/Exit-Kriterien', 'ROLE-CUSTOMER-IT, Sponsor und alle Key User', 'Cutover Lead und Project Manager', 'Owner zuordnen, Freeze und Rückfallpunkt markieren, Entry/Exit prüfen und Rehearsal-Ergebnis aufnehmen', 'Sequenz, Owner, Freeze, Reset, Entry, Exit und Entscheidung', 'Der Cutover-Plan trennt synthetische Rehearsal von realer Go-live-Freigabe.', 'Fehlender Rückfallpunkt erhöht das Risiko einer unkontrollierten Ausführung.', 'Cutover-Plan an Rehearsal, Hypercare und Realgates', 'Cutover-Checkliste, Owner-Matrix und Entry/Exit-Register', 'Jeder Schritt besitzt Owner, Entry, Exit und Rückfallpunkt.'),
  'UABC-45': d('Hypercare-Kadenz, Incidentkanal, Prioritäten, Reaktionszeiten und Support-FAQ', 'ACTOR-KUNDEN-SUPPORT und ROLE-CUSTOMER-IT', 'Hypercare Lead und Support Transition Lead', 'Kadenz planen, Incidentkanal definieren, Prioritäten und Reaktionszeiten abstimmen und FAQ verknüpfen', 'Lage, Kanal, Priorität, Reaktion, FAQ und Übergabe', 'Die Hypercare-Planung bildet den Supportprozess vor der Begleitung ab.', 'Ein unklarer Incidentkanal verzögert die spätere Triage.', 'Hypercare-Plan an Begleitung und Handover', 'Hypercare-Plan, Support-FAQ und Eskalationsmatrix', 'Kanal, Priorität, Reaktionszeit und Owner sind getrennt ausgewiesen.'),
  'UABC-49': d('Retro-Entscheidungen, Verbesserungen, Restpunkte und Support-Lernfelder', 'ROLE-CUSTOMER-SPONSOR und ACTOR-KUNDEN-SUPPORT', 'Projektleitung und Quality Lead', 'Ergebnisse reflektieren, Ursachen sortieren, Verbesserungen priorisieren und Restpunkte an Support übergeben', 'Was lief, Defect, Ursache, Verbesserung, Owner und Folgegate', 'Die Retro sichert Lernpunkte der Simulation ohne eine reale Betriebsfreigabe.', 'Unpriorisierte Verbesserungen verlieren ihren Owner nach Handover.', 'Retro an Handover und Supportregister', 'Retro-Transkript, Verbesserungslog und Restpunktregister', 'Jeder Lernpunkt besitzt Ursache, Owner und Folgegate.'),
};
for (const [id, detail] of Object.entries(specialDetails)) detailCatalog[id] = { ...detail, control: detail.control ?? `${detail.evidenceReadback} ist als eigener Kontrollpunkt dokumentiert.` };

for (const [index, ticket] of story.tickets.entries()) {
  const summary = summaries[index];
  const ticketFocus = focus[index];
  if (!summary || !ticketFocus) throw new Error(`Kein V2-Redaktionsdatensatz für ${ticket.id}.`);
  if (ticket.id === 'UABC-46') { ticket.phase = 'P3'; ticket.phaseId = 'UABC-3'; ticket.phaseRefs = ['UABC-3']; ticket.dependencies = ['UABC-44', 'UABC-45']; }
  const detail = detailCatalog[ticket.id];
  if (!detail) throw new Error(`Kein expliziter V2-Fachdatenblock für ${ticket.id}.`);
  ticket.customerInputs = detail.customerInputs;
  ticket.customerRoles = detail.customerRoles;
  ticket.consultantRoles = detail.consultantRoles;
  ticket.concreteSteps = detail.concreteSteps;
  ticket.agenda = detail.agenda;
  ticket.expectedResult = detail.expectedResult;
  ticket.specificRisk = detail.specificRisk;
  ticket.handoff = detail.handoff;
  ticket.evidenceReadback = detail.evidenceReadback;
  ticket.acceptanceCriteria = [
    { criterion: detail.control, fulfilled: true },
    { criterion: `Readback-Nachweis: ${detail.evidenceReadback} ist mit dem Ticket verknüpft und reproduzierbar auffindbar.`, fulfilled: true }
  ];
  const evidence = ticket.evidenceRefs?.length ? ticket.evidenceRefs : ['evidence/simulation/project-story.json'];
  const deliverables = ticket.deliverableRefs?.length ? ticket.deliverableRefs : [ticket.deliverable || 'docs/reports/bc-basic-project-chronicle.md'];
  const pages = ticket.pageRefs?.length ? ticket.pageRefs : ['atlassian/confluence/pages/80-bc-basic-project-overview.md'];
  const meetings = ticket.meetingTranscriptRefs?.length ? ticket.meetingTranscriptRefs : [fallbackTranscript[ticket.phase] || 'UABC-MTG-001'];
  const ticketKey = `${summary} (${ticket.id})`;
  const customerRole = ['ROLE-CUSTOMER-FINANCE', 'ROLE-CUSTOMER-PURCHASE', 'ROLE-CUSTOMER-SALES', 'ROLE-CUSTOMER-WAREHOUSE'][index % 4];
  const consultantRole = ticket.type === 'task' ? 'Lead BC Consultant und fachlich zuständige Beratung' : 'Projektleitung und Solution Architecture';
  const executionMode = ticket.type === 'task' ? 'Agenda, Vorbereitung, Durchführung, Kontrollpunkt und Nachbereitung' : ticket.type === 'epic' ? 'Scope- und Ergebnisrahmen mit den untergeordneten Nachweisen' : ticket.type === 'story' ? 'Prozesssicht mit Nutzen, Entscheidung und Übergabekriterium' : 'Phasensteuerung mit Eintritt, Austritt und Abhängigkeiten';
  ticket.summary = summary;
  ticket.title = summary;
  ticket.description = [
    'Ausgangslage und Ziel',
    `${ticketKey}: ${ticketFocus}. Die Kundeninstanz wird als realitätsnahe repositorybasierte Simulation betrachtet; Ziel ist ein nachvollziehbarer fachlicher Nachweis, keine Behauptung eines echten Tenant- oder Produktivzugriffs.`,
    '',
    'In Scope',
    `${ticketKey}: ${ticket.type === 'task' ? 'Ausführbare Kundenleistung' : ticket.type === 'epic' ? 'Ergebnisrahmen des fachlichen Arbeitsstrangs' : ticket.type === 'story' ? 'Fachlicher Nutzen und Prozesszusammenhang' : 'Phasensteuerung und Abhängigkeiten'} für ${ticketFocus}.`,
    '',
    'Nicht im Umfang',
    `${ticketKey}: Kein echter Business-Central-Tenant, kein Live-Posting, keine reale Steueranmeldung, keine produktive Kundenfreigabe und keine Änderung außerhalb der dokumentierten Simulation.`,
    '',
    'Voraussetzungen und Rollen',
    `${ticketKey}: Kundeneingaben sind ${detail.customerInputs}. Kundenrollen: ${detail.customerRoles}. Consultantrollen: ${detail.consultantRoles}.`,
    '',
    'Durchführung',
    `${ticketKey}: ${executionMode} in Phase ${ticket.phase}. Konkrete Schritte: ${detail.concreteSteps}. Agenda: ${detail.agenda}.`,
    '',
    'Ergebnis und Akzeptanz',
    `${ticketKey}: ${detail.expectedResult} Die Akzeptanz gilt für die synthetische Simulation und nicht für ein reales Kundensystem.`,
    '',
    'Lieferung und Referenzen',
    `${ticketKey}: Evidence ${evidence.join(', ')}; Lieferobjekte ${deliverables.join(', ')}; Confluence ${pages.join(', ')}; Meetingtranskript ${meetings.join(', ')}.`,
    '',
    'Evidence, Test und Readback',
    `${ticketKey}: Evidence wird aus dem Repository gelesen. Readback: ${detail.evidenceReadback}. Posting-Kontrolle, Defect, Korrektur und Retest werden nur als synthetische Schritte ausgewiesen. Acht reale Kundengates bleiben außerhalb der Simulation offen.`,
    '',
    'Aufwand und Abrechnung',
    `${ticketKey}: ${ticket.billable ? 'Abrechenbare Task-Leistung über Worklogs.' : 'Nicht separat abrechenbar; Aufwand rollt fachlich aus untergeordneten Tasks hoch.'} Die Abrechnung folgt ausschließlich der bestehenden Task-Worklog-Logik.`,
    '',
    'Abhängigkeiten, Risiken und Übergabe',
    `${ticketKey}: Abhängigkeiten ${(ticket.dependencies || ticket.dependencyRefs || []).join(', ') || 'keine direkte Vorgängerabhängigkeit'}. Risiko: ${detail.specificRisk} Übergabe: ${detail.handoff}.`
  ].join('\n');
  ticket.evidenceRefs = evidence;
  ticket.deliverableRefs = deliverables;
  ticket.pageRefs = pages;
  ticket.meetingTranscriptRefs = meetings;
}

story.ticketQuality = {
  version: 'pilot-v2',
  summaryWordLimit: { min: 1, max: 7 },
  descriptionSections: requiredSections,
  canonicalTicketCount: story.tickets.length,
  realExecutionClaim: false,
  realLiveGatesPending: 8
};
story.generatedAt = '2026-07-14T00:00:00.000Z';
fs.writeFileSync(storyPath, `${JSON.stringify(story, null, 2)}\n`, 'utf8');
console.log(`V2-Ticketredaktion erzeugt: ${story.tickets.length} Tickets, ${requiredSections.length} Pflichtabschnitte je Beschreibung.`);

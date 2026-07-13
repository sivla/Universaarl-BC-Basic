import fs from 'node:fs';
import YAML from 'yaml';
import { TICKET_VIEWS } from './generate-spectra-0.10-integration.mjs';

const sourcePath = 'evidence/simulation/project-story.json';
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const today = '2026-07-13';
const lead = 'P-PILOT-LEAD-001';
const leadRole = 'Kajetan Kalicki – Projektleitung, Lead BC Consultant und Solution Architect';
const wave0AttemptPath = 'evidence/playthru-uabc-basic-de/wave-0-company-identity-readback.yaml';
const wave0Attempt = YAML.parse(fs.readFileSync(wave0AttemptPath, 'utf8'));
const pilotSetupBaseline = YAML.parse(fs.readFileSync('project/bc-basic/pilot-setup-baseline.yaml', 'utf8'));
const readOnlyPreflight = YAML.parse(fs.readFileSync('evidence/playthru-uabc-basic-de/setup-wave-1-read-only-preflight.yaml', 'utf8'));
const coreFinancePayload = YAML.parse(fs.readFileSync('project/bc-basic/core-finance-payload.yaml', 'utf8'));
const companyState = pilotSetupBaseline.companyInformation.currentState;
const companyTarget = pilotSetupBaseline.companyInformation.targetState;
const companyStrategy = pilotSetupBaseline.companyInformation.companyStrategyDecision;
const evidence = [
  'project/bc-basic/setup-wave-1-matrix.yaml',
  'project/bc-basic/setup-parameter-baseline.yaml',
  'evidence/playthru-uabc-basic-de/setup-wave-1-read-only-preflight.yaml',
  'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml',
  'project/bc-basic/pilot-setup-baseline.yaml'
];
const taskEvidence = {
  'UABC-32': ['docs/offers/bc-basic-offer.md', 'project/bc-basic/project-plan.yaml'],
  'UABC-33': ['project/bc-basic/project-plan.yaml', 'project/bc-basic/decision-register.yaml'],
  'UABC-34': ['project/bc-basic/posting-setup-matrix.yaml', 'project/bc-basic/solution-blueprint.yaml'],
  'UABC-35': ['atlassian/confluence/pages/71-bc-basic-discovery.md', 'project/bc-basic/decision-register.yaml'],
  'UABC-36': ['atlassian/confluence/pages/71-bc-basic-discovery.md', 'project/bc-basic/decision-register.yaml'],
  'UABC-37': ['atlassian/confluence/pages/71-bc-basic-discovery.md', 'project/bc-basic/decision-register.yaml'],
  'UABC-38': ['project/bc-basic/data-package.yaml', 'project/bc-basic/data-readiness-check.yaml'],
  'UABC-39': [...evidence, wave0AttemptPath],
  'UABC-40': ['project/bc-basic/core-finance-payload.yaml', 'project/bc-basic/core-finance-package-manifest.yaml', 'project/bc-basic/setup-wave-1-matrix.yaml', 'project/bc-basic/posting-setup-matrix.yaml', 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml'],
  'UABC-41': ['project/bc-basic/data-package.yaml', 'project/bc-basic/data-readiness-check.yaml'],
  'UABC-42': ['atlassian/confluence/pages/31-processes.md', 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml'],
  'UABC-43': ['atlassian/confluence/pages/31-processes.md', 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml'],
  'UABC-44': ['atlassian/confluence/pages/31-processes.md', 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml'],
  'UABC-45': ['project/bc-basic/training-plan.yaml', 'atlassian/confluence/pages/80-bc-basic-training.md'],
  'UABC-46': ['project/bc-basic/uat-catalog.yaml', 'atlassian/confluence/pages/50-tests.md'],
  'UABC-47': ['atlassian/confluence/pages/bc-basic-hypercare.md', 'docs/handover/bc-basic-handover.md'],
  'UABC-48': ['atlassian/confluence/pages/bc-basic-hypercare.md', 'docs/handover/bc-basic-handover.md'],
  'UABC-49': ['project/bc-basic/decision-register.yaml', 'atlassian/confluence/pages/bc-basic-hypercare.md'],
  'UABC-50': ['docs/handover/bc-basic-handover.md', 'atlassian/confluence/pages/81-bc-basic-handover.md']
};
const taskAcceptance = {
  'UABC-32': ['Projektauftrag, Scope, Rollen, Phasen und Change-Regel sind im Projektplan nachvollziehbar miteinander verknüpft.', 'Angebotsplanung und aktuelles Ist sind getrennt; Iststunden und Istkosten entsprechen ausschließlich den aktiven Task-Worklogs.'],
  'UABC-33': ['Entry- und Exit-Kriterien nennen Datenqualität, Rollen, Steuerfragen, Resetpunkt und eindeutige Stopbedingungen.', 'Jedes Gate verweist auf eine verantwortliche Rolle, eine prüfbare Evidence und den nächsten zulässigen Schritt.'],
  'UABC-34': ['Konten-, Buchungs-, VAT-, Dimensions- und Nummernseriensoll sind in Posting-Matrix und Solution Blueprint widerspruchsfrei aufgelöst.', 'Unbestätigte Steuerwerte bleiben als offene Entscheidung markiert und erzeugen keine Live- oder Buchungsbehauptung.'],
  'UABC-35': ['Der Einkaufsstandard beschreibt Bestellung, Wareneingang, Rechnung, Abweichung, Zahlung und Ausgleich in fachlicher Reihenfolge.', 'Offene Abweichungen besitzen einen Entscheider, einen dokumentierten Sollzustand und eine prüfbare Discovery-Referenz.'],
  'UABC-36': ['Der Verkaufsstandard beschreibt Auftrag, Lieferung, Rechnung, Korrektur, Zahlungseingang und Ausgleich in fachlicher Reihenfolge.', 'Forderungs-, Umsatz-, VAT- und Bestandswirkung sind als Soll beschrieben und noch nicht als ausgeführt markiert.'],
  'UABC-37': ['Lagerort, Basiseinheit, Bewertungsmethode, Inventur und Negativbestandsregel sind als fachliches Soll dokumentiert.', 'Mengen- und Wertfluss besitzen eindeutige Kontrollpunkte, ohne eine ausgeführte Lagerbewegung zu behaupten.'],
  'UABC-38': ['Jedes Migrationsobjekt besitzt Owner, Quelle, Pflichtfelder, Referenzregeln und eine definierte Kontrollsumme.', 'Datenwellen bleiben bis zu ausgeführter Prüfung und differenzfreiem Readback offen; Alt-Simulationsevidence zählt nicht als aktuelles Ist.'],
  'UABC-39': ['Wave 0 liefert interne Company-ID, technische und sichtbare Namen, Standard-CRONUS-Inventur, Fremdmandantengrenze sowie Paketnullstand als bereinigte Nur-Lese-Evidence.', 'Der Resetpunkt mit Wiederanlaufweg liegt vor und genau eine Zielstrategie ist begründet ausgewählt; solange Evidence fehlt, bleibt das Gate blockiert und W0-01 der nächste Schritt.'],
  'UABC-40': ['CORE-FINANCE beginnt erst nach bestandener Wave 0, ausgewählter Zielstrategie, dokumentiertem Resetpunkt und separater Schreibfreigabe; TRADE-MASTER und OPENING-DATA bleiben gesperrt.', 'Alle freigegebenen CORE-Felder besitzen Soll-/Ist-Readback, Finance-Abnahme und den Negativnachweis ohne Ledger-, Posted-, Continia-, Bankkonto- oder Übermittlungswirkung.'],
  'UABC-41': ['Jede Datenvorlage besteht Pflichtfeld-, Referenz-, Dubletten- und Kontrollsummenprüfung vor einem Import.', 'Importfehler, Korrektur und Retest werden pro Welle dokumentiert; ohne differenzfreien Readback bleibt die Aufgabe offen.'],
  'UABC-42': ['Der P2P-Testfall nennt Sollbelege, erwartete Kontenwirkung, Mengen-/Preisabweichung und Abstimmkontrollen.', 'Bestellung bis Zahlung wird erst nach ausgeführtem Lauf, Ledger-Readback und dokumentiertem Retest als bestanden markiert.'],
  'UABC-43': ['Der O2C-Testfall nennt Sollbelege, erwartete Umsatz-/VAT-/Bestandswirkung und Korrekturweg.', 'Auftrag bis Zahlungseingang wird erst nach ausgeführtem Lauf, Readback und dokumentiertem Retest als bestanden markiert.'],
  'UABC-44': ['Lagerprobe definiert Bewegung, Inventur, Differenz und Bewertung mit erwarteten Mengen und Werten.', 'Artikel-, Wert- und Sachkontoreadbacks müssen differenzfrei sein; bis dahin bleibt der Prozessstatus offen.'],
  'UABC-45': ['Jede operative Rolle besitzt positiven Prozess, Fehlerfall, Kontrollpunkt und Eskalationsweg im Schulungsplan.', 'Teilnahme, eigenständige Durchführung und Verständnis werden erst mit konkretem Schulungsnachweis bestätigt.'],
  'UABC-46': ['Alle sieben UAT-Fälle besitzen erwartete Ergebnisse, Rollen, Evidence und Defect-/Retest-Regel.', 'Mock-Cutover und UAT bleiben offen, bis echte Ergebnisse vorliegen und kein ungeklärter P1/P2-Befund besteht.'],
  'UABC-47': ['Das geplante Hypercare-Szenario enthält Reproduktionsschritte und Soll-Readbacks für eine möglicherweise nicht zugeordnete Zahlung.', 'Ein Defect und Retest dürfen erst nach realer Beobachtung entstehen; aktuell bleiben Diagnose, Fix und Retest ausdrücklich nicht ausgeführt.'],
  'UABC-48': ['Monatsabschlusskontrollen nennen Sachkonto, Nebenbücher, Bank, Lager, offene Belege und Periodenstatus.', 'Der Abschluss bleibt offen, bis alle Soll-/Ist-Abstimmungen ausgeführt und mit differenzfreien Readbacks belegt sind.'],
  'UABC-49': ['VAT-Prüfung definiert Bemessungsgrundlagen, Vorsteuer, Umsatzsteuer und UStVA-Vorschau als kontrollierbare Sollwerte.', 'Eine externe ELSTER-Übermittlung bleibt verboten; Abschluss erfordert lokale Readbacks und eine dokumentierte Freigabeentscheidung.'],
  'UABC-50': ['Handover-Paket nennt Deliverables, offene Restpunkte, Retro-Ergebnis, Supportweg und verantwortliche Rollen.', 'Übergabe bleibt bis zu belegtem Cutover, Hypercare-Abschluss und belegter Simulationsabnahme offen; historische Simulation gilt nicht als aktuelle Erfüllung.']
};
const epicSummaryOverrides = {
  'UABC-4': 'Projektauftrag, Scope, Rollen, Discovery und Gate-Verantwortung für den Pilotstart abstimmen.',
  'UABC-5': 'Finance-, Einkaufs-, Verkaufs- und Lagerstandard vor jeder Einrichtung fachlich entscheiden.',
  'UABC-6': 'Migrationsobjekte, Datenwellen, Owner, Qualitätsregeln und Kontrollsummen planbar machen.',
  'UABC-7': 'Gesellschaftsbasis, Perioden, Nummernserien, Finance, VAT und Funktionstrennung kontrolliert planen.',
  'UABC-8': 'Stamm-, Eröffnungs- und Bestandsdaten mit Fehlerkorrektur und Abstimmung für spätere Importe vorbereiten.',
  'UABC-9': 'Einkauf, Verkauf, Zahlung und Lager als getrennte Ende-zu-Ende-Proben mit Readbacks planen.',
  'UABC-10': 'Rollenbefähigung, SIT, UAT und Mock-Cutover für eine spätere Simulationsentscheidung vorbereiten.',
  'UABC-11': 'Hypercare-Triage und Retestregeln für mögliche Zahlungsreferenzabweichungen vorbereiten.',
  'UABC-12': 'Monatsabschluss- und VAT-Abstimmungen ohne externe Übermittlung als kontrollierbares Soll planen.',
  'UABC-13': 'Retro, Restpunkte, Supportweg und Handover für den noch offenen Pilotabschluss vorbereiten.'
};
const ticketSummaryOverrides = {
  'UABC-1': 'Phase 1 – Vorbereitung und Lösungsdesign',
  'UABC-2': 'Phase 2 – Einrichtung und Erprobung',
  'UABC-3': 'Phase 3 – Stabilisierung und Übergabe',
  'UABC-4': 'Projektinitiierung und Discovery',
  'UABC-5': 'Fit-to-Standard und Lösungsdesign',
  'UABC-6': 'Datenbereitschaft und Migrationsplanung',
  'UABC-7': 'Grundeinrichtung und Finance',
  'UABC-8': 'Stammdaten und Migration',
  'UABC-9': 'Kernprozesse P2P, O2C und Lager',
  'UABC-10': 'Test, UAT und Schulung',
  'UABC-11': 'Hypercare und Stabilisierung',
  'UABC-12': 'Monatsabschluss und Umsatzsteuer',
  'UABC-13': 'Projektabschluss und Betriebsübergabe',
  'UABC-14': 'Projektauftrag und Scope abstimmen',
  'UABC-15': 'Setup-, UAT- und Cutover-Gates definieren',
  'UABC-16': 'Finance-Design festlegen',
  'UABC-17': 'Einkaufsprozess festlegen',
  'UABC-18': 'Verkaufsprozess festlegen',
  'UABC-19': 'Lagerprozess festlegen',
  'UABC-20': 'Datenwellen freigeben',
  'UABC-21': 'Pilotgesellschaft und Resetstrategie festlegen',
  'UABC-22': 'CORE-FINANCE einrichten und prüfen',
  'UABC-23': 'Migrationsdaten abstimmen',
  'UABC-24': 'P2P-Prozess nachweisen',
  'UABC-25': 'O2C-Prozess nachweisen',
  'UABC-26': 'Lager und Inventur abstimmen',
  'UABC-27': 'Rollenkompetenz nachweisen',
  'UABC-28': 'SIT, UAT und Mock-Cutover vorbereiten',
  'UABC-29': 'Hypercare-Fehlerszenario vorbereiten',
  'UABC-30': 'Monatsabschluss und UStVA-Vorschau abstimmen',
  'UABC-31': 'Projektabschluss und Supportübergabe',
  'UABC-32': 'Projektauftrag und Scope ausarbeiten',
  'UABC-33': 'Setup-, UAT- und Cutover-Gates dokumentieren',
  'UABC-34': 'Finance-Baseline festlegen',
  'UABC-35': 'P2P-Standard festlegen',
  'UABC-36': 'O2C-Standard festlegen',
  'UABC-37': 'Lagerstandard festlegen',
  'UABC-38': 'Datenwellen prüfen und freigeben',
  'UABC-39': 'Pilotgesellschaft und Resetpunkt prüfen',
  'UABC-40': 'CORE-FINANCE ausführen und nachprüfen',
  'UABC-41': 'Migrationsdaten laden und abstimmen',
  'UABC-42': 'P2P-Kette durchführen und retesten',
  'UABC-43': 'O2C-Kette durchführen und retesten',
  'UABC-44': 'Inventur und Lagerbewertung abstimmen',
  'UABC-45': 'Rollenkompetenz praktisch nachweisen',
  'UABC-46': 'UAT und Mock-Cutover vorbereiten',
  'UABC-47': 'Hypercare-Fehlerszenario ausarbeiten',
  'UABC-48': 'Monatsabschluss abstimmen',
  'UABC-49': 'UStVA-Vorschau vorbereiten',
  'UABC-50': 'Retro und Supportübergabe vorbereiten'
};
const epicAcceptance = {
  'UABC-4': ['Projektauftrag nennt In-/Out-Scope, Rollen, Entscheidungsrechte und Change-Weg.', 'Discovery- und Gate-Eintritt besitzen Owner, Abhängigkeiten und prüfbare Nachweise.'],
  'UABC-5': ['Finance-, Einkaufs-, Verkaufs- und Lagerentscheidungen sind je Sollprozess dokumentiert.', 'Unbestätigte Kunden- oder Steuerfragen bleiben sichtbar offen und blockieren die betroffene Einrichtung.'],
  'UABC-6': ['Jedes Migrationsobjekt besitzt Datenowner, Quelle, Mapping, Pflichtfelder und Qualitätsregel.', 'Jede Datenwelle definiert Kontrollsumme, Fehlerkorrektur und differenzfreien Readback als Austritt.'],
  'UABC-7': ['Wave 0, Gesellschaftsbasis und Setup-Reihenfolge sind vor Finance- oder VAT-Writes belegt.', 'Nummernserien, Posting- und SoD-Soll sind widerspruchsfrei und ohne Ledger-/Posted-Write geplant.'],
  'UABC-8': ['Stamm-, Eröffnungs- und Bestandsdaten sind von historischen Bewegungsdaten abgegrenzt.', 'Import, Fehlerkorrektur und Abstimmung bleiben bis zu aktuellen Kontrollsummen und Readbacks offen.'],
  'UABC-9': ['P2P, O2C, Zahlung und Lager besitzen getrennte Testfälle mit erwarteter Beleg- und Kontenwirkung.', 'Jede Prozessprobe verlangt Readback, Abweichungsbehandlung und Retest vor einer Simulationsabnahme.'],
  'UABC-10': ['Vier operative Rollen besitzen Lernziel, positiven Fall, Fehlerfall und Eskalationsweg.', 'SIT, sieben UAT-Fälle und Mock-Cutover bleiben ohne aktuelle Evidence und P1/P2-Prüfung offen.'],
  'UABC-11': ['Hypercare-Triage definiert Symptomaufnahme, Priorität, Owner und Diagnose-Readbacks.', 'Defect und Retest entstehen nur nach realer Beobachtung; eine historische Zahlungsevidence erfüllt das Epic nicht.'],
  'UABC-12': ['Sachkonto, Nebenbücher, Bank, Lager und VAT besitzen geplante Abstimmkontrollen.', 'UStVA bleibt Vorschau ohne externe Übermittlung und darf erst nach lokalen Readbacks bewertet werden.'],
  'UABC-13': ['Handover nennt Deliverables, Restpunkte, Betriebsrollen, Supportweg und Wiederanlauf.', 'Retro und Simulationsabnahme benötigen aktuelle Cutover- und Hypercare-Evidence; eine Kundenfreigabe wird nicht behauptet.']
};
const storyAcceptance = {
  'UABC-14': ['Projektauftrag nennt Scope, Nicht-Scope, Rollen, Phasen, Planbudget und Change-Regel.', 'Angebotsplanung und aktuelles Task-Worklog-Ist sind getrennt; eine Kundenannahme wird nicht behauptet.'],
  'UABC-15': ['Entry und Exit für Setup, UAT und Mock-Cutover nennen Pflichtnachweise und verantwortliche Rollen.', 'Offene Daten-, Rollen-, Steuer- oder Resetfragen erzeugen einen eindeutigen Stopzustand.'],
  'UABC-16': ['Konten, Buchungsgruppen, VAT, Dimensionen und Perioden sind in einer konsistenten Entscheidungsmatrix verbunden.', 'Steuerliche Annahmen bleiben bis zur fachlichen Bestätigung offen und erzeugen keine Buchungsbehauptung.'],
  'UABC-17': ['Bestellung, Wareneingang, Rechnung, Abweichung, Zahlung und Ausgleich sind als P2P-Sollfolge beschrieben.', 'Jede Einkaufsabweichung besitzt Owner, Entscheidung und erwartete Beleg-, VAT- und Lagerwirkung.'],
  'UABC-18': ['Auftrag, Lieferung, Rechnung, Korrektur, Zahlungseingang und Ausgleich sind als O2C-Sollfolge beschrieben.', 'Forderungs-, Umsatz-, VAT- und Bestandswirkung besitzen eindeutige Sollkontrollen.'],
  'UABC-19': ['Lagerort, Einheit, Bewertungsmethode, Inventur und Negativbestandsregel sind entschieden oder als offen markiert.', 'Mengen-, Wert- und Sachkontowirkung besitzen getrennte Soll-Readbacks.'],
  'UABC-20': ['Jede Datenwelle besitzt Owner, Mapping, Pflichtfelder, Dublettenregel und Kontrollsumme.', 'Fehlerkorrektur und Retest sind definiert; ohne differenzfreie Prüfung bleibt die Welle offen.'],
  'UABC-21': ['Ist-Baseline, Pilot-Soll und angewendete Differenz sind strukturiert getrennt; der Gesellschaftsname allein kann keinen konfigurierten Pilot belegen.', 'Company-ID, CRONUS-Inventur, Fremdmandantengrenze, Resetpunkt und Zielstrategie schließen das Gate nachvollziehbar oder lassen es sichtbar blockiert.'],
  'UABC-22': ['CORE-FINANCE besitzt eine konkrete Allowlist, Reihenfolge, Sollwerte, Rollback- und Readbackkette ohne Bankkonto oder Ledger-Tabellen.', 'Fachliche Finance-Abnahme bleibt offen, bis jeder aktuelle Readback passt und unzulässige SoD- oder Kontenwirkung ausgeschlossen ist.'],
  'UABC-23': ['Stammdaten, offene Posten, Bestand und Eröffnungsbilanz besitzen getrennte Import- und Kontrollsummen.', 'Fehlerkorrekturen werden je Welle erneut geprüft; historische Simulationswerte zählen nicht als aktueller Readback.'],
  'UABC-24': ['P2P-Probe definiert Sollbelege, Preis-/Mengenabweichung, Verbindlichkeit, VAT, Lager und Zahlung.', 'Bestellung bis Ausgleich gilt erst nach aktuellen Ledger-Readbacks und dokumentiertem Retest als nachgewiesen.'],
  'UABC-25': ['O2C-Probe definiert Sollbelege, Korrektur, Forderung, Umsatz, VAT, Bestand und Zahlungseingang.', 'Auftrag bis Ausgleich gilt erst nach aktuellen Readbacks und dokumentiertem Retest als nachgewiesen.'],
  'UABC-26': ['Lagerprobe definiert Bewegung, Inventur, Differenz und Bewertung mit erwarteten Mengen und Werten.', 'Artikel-, Wert- und Sachkontoeinträge müssen nach einem späteren Lauf dieselbe Bestandswahrheit zeigen.'],
  'UABC-27': ['Jede Key-User-Rolle führt später einen positiven Fall und einen Fehlerfall mit Eskalation aus.', 'Kompetenz gilt erst mit dokumentierter eigenständiger Durchführung, Kontrolle und Retest als belegt.'],
  'UABC-28': ['SIT, sieben UAT-Fälle und Mock-Cutover besitzen Rollen, Sollwerte, Evidence und P1/P2-Regel.', 'Eine Simulationsentscheidung bleibt bis zu ausgeführten Fällen, aktuellen Readbacks und geschlossenem P1/P2-Gate offen.'],
  'UABC-29': ['Das geplante Hypercare-Szenario definiert Referenzabweichung, Diagnosewerte, Korrekturregel und erwarteten Retest.', 'Ein tatsächlicher Defect darf erst nach Beobachtung entstehen; historische Zahlungsevidence erfüllt die Story nicht.'],
  'UABC-30': ['Monatsabschlusskontrollen stimmen Sachkonto, Nebenbücher, Bank, Lager und Periodenstatus ab.', 'VAT-/UStVA-Vorschau bleibt lokal, ohne externe Übermittlung, und benötigt differenzfreie aktuelle Readbacks.'],
  'UABC-31': ['Handover-Paket nennt Deliverables, Restpunkte, Retro-Ergebnis, Supportweg und Verantwortungen.', 'Übergabe bleibt bis zu aktueller Cutover-, Hypercare- und Simulationsabnahme-Evidence offen.']
};
const deliverableOverrides = {
  'UABC-21': 'Prüfbares Sollbild für Gesellschaft, Rollen und Basis',
  'UABC-22': 'Prüfbares Finance-, VAT- und SoD-Sollbild',
  'UABC-39': 'Wave-0-Readback und begründete Pilot-Zielentscheidung',
  'UABC-40': 'CORE-FINANCE-Einrichtung, Readback und fachliche Finance-Abnahme',
  'UABC-46': 'Geplante UAT-, Retest- und Mock-Cutover-Abnahme',
  'UABC-47': 'Geplantes Hypercare-Fehlerszenario mit Retest-Regel',
  'UABC-50': 'Plan für Abschluss, Supportstart und Handover-Paket'
};
const presentations = {
  phase: { typeLabel: 'Phase', displayIconKey: 'jira-phase', displayColorToken: 'teal' },
  epic: { typeLabel: 'Epic', displayIconKey: 'jira-epic', displayColorToken: 'purple' },
  story: { typeLabel: 'Story', displayIconKey: 'jira-story', displayColorToken: 'green' },
  task: { typeLabel: 'Aufgabe', displayIconKey: 'jira-task', displayColorToken: 'blue' }
};

function currentStatus(ticket) {
  if (ticket.id === 'UABC-1') return 'in-progress';
  if (ticket.id === 'UABC-2' || ticket.id === 'UABC-3' || ticket.id === 'UABC-39') return 'blocked';
  if (ticket.id === 'UABC-40') return 'in-progress';
  return 'created';
}

function decisionRefForTicket(ticket) {
  const numericId = Number(String(ticket.id).split('-')[1]);
  if (numericId === 32) return 'UABC-DEC-BCB-010';
  if (numericId === 39) return 'UABC-DEC-BCB-009';
  if (numericId <= 33) return 'UABC-DEC-BCB-003';
  if (numericId <= 40) return 'UABC-DEC-BCB-002';
  if (numericId === 49) return 'UABC-DEC-BCB-006';
  return 'UABC-DEC-BCB-010';
}

function rebaseline(ticket) {
  const status = currentStatus(ticket);
  const presentation = presentations[ticket.type] ?? {};
  const focus = ticket.type === 'phase' ? 'Die Phase steuert Eintritt, Abhängigkeiten und Exit-Gates.' : ticket.type === 'epic' ? 'Das fachliche Gebiet wird vorbereitet und in prüfbare Arbeitspakete gegliedert.' : ticket.type === 'task' ? 'Die konkrete Arbeit wird geplant, ohne einen ausgeführten BC-Schreibvorgang zu behaupten.' : 'Das erwartete fachliche Ergebnis wird beschrieben und erst nach passender Evidence abgenommen.';
  const clean = value => String(value ?? '')
    .replace(/(?:\s*Status im aktuellen Playthru-Pilot:\s*[^.]+\.)+\s*$/gi, '')
    .replace(/\s*Aktueller Playthru-Pilot:[\s\S]*$/gi, '')
    .trim();
  let original = clean(ticket.description)
    .replace(/soll geprüft werdener/gi, 'zu prüfender')
    .replace(/historischn/gi, 'geplanten')
    .replace(/synthetisch(?:e|er|es)?/gi, 'historisch');
  if (status !== 'done') original = original.replace(/\bwurden\b/g, 'werden').replace(/\bwurde\b/g, 'wird').replace(/\bbestanden\b/g, 'erfolgreich geprüft').replace(/\bdurchgespielt\b/g, 'für den Lauf geplant').replace(/\babgeschlossen\b/g, 'für die spätere Abnahme vorbereitet').replace(/\bwar\b/g, 'ist als geplantes Szenario');
  if (ticket.id === 'UABC-32') original = 'Projektauftrag, In- und Out-Scope, Angebotsplanung, Rollen, Phasen, Gate-Matrix und Change-Regel werden aus Angebot und Discovery zusammengeführt und gegen die vorgesehenen Lieferobjekte geprüft.';
  if (ticket.id === 'UABC-21') original = 'Als Projektleitung möchte ich Ist-Baseline, BC-Basic-Soll, angewendete Differenz und Zielstrategie getrennt entscheiden, damit ein Gesellschaftsname niemals als Konfigurationsnachweis gilt und der nächste zulässige Schritt eindeutig bleibt.';
  if (ticket.id === 'UABC-22') original = 'Als Finance-Verantwortung möchte ich CORE-FINANCE erst nach geschlossenem Ziel- und Resetgate feldgenau einrichten, lesen und fachlich abnehmen, damit Konten-, VAT-, Dimensions- und Nummernserienwirkung ohne Ledger- oder Bankkontowrite nachvollziehbar bleibt.';
  if (ticket.id === 'UABC-39') original = 'W0-01 wurde ausschließlich lesend begonnen. Ein angemeldeter Browser-Tab zeigte Titel sowie bereinigte Playthru- und Company-Parameter; die Browser-Sicherheitsrichtlinie blockierte jedoch vor DOM, Screenshot und BC-Feldlektüre. Deshalb bleiben interne Company-ID, sichtbare Namen, CRONUS-Inventur, Fremdmandantengrenze, Resetpunkt und Zielstrategie offen.';
  if (ticket.id === 'UABC-40') original = 'Der deterministische CORE-FINANCE-Payload mit 19 Pakettabellen, 51 Paketdatensätzen, 7 manuellen Tabellen und 18 Sollwerten ist als Consultant-Arbeitsgrundlage vorbereitet. Die Ausführung beginnt erst nach bestandenem Wave 0, Zielstrategie, Resetpunkt und separater Schreibfreigabe; TRADE-MASTER, OPENING-DATA, Bankkonten, Ledger-, Posted-, Continia- und Übermittlungswirkung bleiben ausgeschlossen.';
  if (ticket.id === 'UABC-28') original = 'SIT, UAT und Mock-Cutover werden mit aktueller Evidence geplant. Eine Simulationsabnahme darf erst ohne offene P1/P2 und nach ausgeführten Readbacks entschieden werden.';
  if (ticket.id === 'UABC-46') original = 'UAT-Fälle, Defect-Retests, Rollenkompetenz, Datenkontrollen und Mock-Cutover werden für eine spätere belegte Simulationsabnahme geplant; aktuell sind sie nicht ausgeführt.';
  if (ticket.id === 'UABC-47') original = 'Ein geplantes Hypercare-Szenario beschreibt die spätere Prüfung einer nicht automatisch zugeordneten Zahlung. Ein Defect entsteht erst nach Beobachtung im ausgeführten Lauf; aktuell werden Reproduktionsschritte und Abnahmekriterien vorbereitet.';
  if (ticket.id === 'UABC-49') original = 'VAT-Entries, Bemessungsgrundlagen, Vorsteuer und Umsatzsteuer werden als Soll für die geplante UStVA-Vorschau vorbereitet. Eine externe ELSTER-Übermittlung bleibt verboten; Ausführung und Readback stehen noch aus.';
  if (ticket.id === 'UABC-50') original = 'Retro, Restpunkte und Supportübergabe werden für den aktuellen Piloten vorbereitet. Die spätere Übergabe benötigt echte Cutover-, Hypercare- und belegte Simulationsabnahme-Evidence und ist noch nicht abgeschlossen.';
  if (epicSummaryOverrides[ticket.id]) original = epicSummaryOverrides[ticket.id];
  if (ticket.id === 'UABC-29') original = 'Ein geplantes Hypercare-Szenario beschreibt eine mögliche Zahlungsreferenzabweichung mit Diagnosewerten, Korrekturregel und erwartetem Retest. Ein tatsächlicher Defect entsteht erst nach Beobachtung im ausgeführten Lauf.';
  const description = original.length >= 40 ? original : `${focus} ${ticket.title}.`;
  let summary = clean(ticket.summary ?? ticket.title).replace(/soll geprüft werdener/gi, 'zu prüfender').replace(/historischn/gi, 'geplanten').replace(/synthetisch(?:e|er|es)?/gi, 'historisch').replace(/\bwurden\b/g, 'werden').replace(/\bwurde\b/g, 'wird').replace(/\bbestanden\b/g, 'erfolgreich geprüft').replace(/\babgeschlossen\b/g, 'für die spätere Abnahme vorbereitet').replace(/Aktueller Playthru-Pilot:/g, '').trim();
  if (ticket.id === 'UABC-32') summary = 'Projektauftrag, Scope, Angebotsplanung, Rollen, Phasen und Change-Regel abstimmen.';
  if (ticket.id === 'UABC-21') summary = 'CRONUS-Ist, BC-Basic-Soll und Gesellschaftsstrategie nachvollziehbar entscheiden.';
  if (ticket.id === 'UABC-22') summary = 'CORE-FINANCE feldgenau einrichten, lesen und fachlich abnehmen.';
  if (ticket.id === 'UABC-39') summary = 'CRONUS-Baseline inventarisieren, Resetpunkt belegen und Zielstrategie entscheiden.';
  if (ticket.id === 'UABC-40') summary = 'CORE-FINANCE nach geschlossenem Gate ausführen, read-back prüfen und abnehmen.';
  if (ticket.id === 'UABC-28') summary = 'SIT, UAT und Mock-Cutover für eine spätere Simulationsabnahme planen.';
  if (ticket.id === 'UABC-46') summary = 'UAT, Retests und Mock-Cutover mit aktueller Evidence vorbereiten.';
  if (ticket.id === 'UABC-47') summary = 'Geplantes Hypercare-Szenario für eine mögliche nicht zugeordnete Zahlung vorbereiten.';
  if (ticket.id === 'UABC-49') summary = 'Geplante VAT- und UStVA-Abstimmung ohne externe Übermittlung vorbereiten.';
  if (ticket.id === 'UABC-50') summary = 'Retro, Restpunkte und Supportübergabe für den aktuellen Piloten vorbereiten.';
  if (epicSummaryOverrides[ticket.id]) summary = epicSummaryOverrides[ticket.id];
  if (ticket.id === 'UABC-29') summary = 'Hypercare-Diagnose und Retestregel für eine mögliche Zahlungsreferenzabweichung planen.';
  if (ticketSummaryOverrides[ticket.id]) summary = ticketSummaryOverrides[ticket.id];
  const label = ticket.title ?? ticket.summary ?? ticket.id;
  const criteriaByType = {
    phase: [
      `Eintritt für ${ticket.id} ist mit Rollen, Abhängigkeiten und freigegebenen Vorarbeiten zu „${label}“ dokumentiert.`,
      `Austritt für ${ticket.id} ist erst erreicht, wenn die untergeordneten Epics von „${label}“ fachlich abgenommen und belegt sind.`
    ],
    epic: epicAcceptance[ticket.id] ?? [
      `„${label}“ besitzt einen abgestimmten fachlichen Umfang und nachvollziehbare Abhängigkeiten.`,
      `Die Ergebnisse von ${ticket.id} sind über untergeordnete Stories und passende Evidence prüfbar.`
    ],
    story: storyAcceptance[ticket.id] ?? [
      `„${label}“ ist fachlich mit der verantwortlichen Rolle abgestimmt und als überprüfbares Ergebnis beschrieben.`,
      `Akzeptanz und Abweichungen von ${ticket.id} sind mit Page-, Deliverable- oder Evidence-Referenzen nachvollziehbar.`
    ],
    task: taskAcceptance[ticket.id] ?? [
      `${ticket.id} besitzt ein konkretes Prüfergebnis mit Sollwert, Istwert und zugehöriger Evidence.`,
      `${ticket.id} bleibt bis zum bestandenen Readback und zur erfüllten Stopbedingung offen.`
    ]
  };
  const criteria = (criteriaByType[ticket.type] ?? criteriaByType.story).map(criterion => ({ criterion, fulfilled: status === 'done' }));
  const evidenceByType = ticket.type === 'task' ? (taskEvidence[ticket.id] ?? evidence) : ticket.type === 'phase' ? evidence.slice(2) : evidence.slice(0, 2);
  const statusHistory = [{ status: 'created', time: today, actorRef: lead, actorType: 'human', actionRole: leadRole }];
  if (status !== 'created') statusHistory.push({ status, time: today, actorRef: lead, actorType: 'human', actionRole: leadRole });
  const isWave0Attempt = ticket.id === 'UABC-39';
  const isCorePreparation = ticket.id === 'UABC-40';
  const worklogs = isWave0Attempt ? wave0Attempt.worklogs.map((worklog) => structuredClone(worklog)) : isCorePreparation ? [structuredClone(coreFinancePayload.preparationWorklog)] : [];
  const actualHours = worklogs.reduce((sum, worklog) => sum + Number(worklog.hours ?? 0), 0);
  const netAmount = worklogs.reduce((sum, worklog) => sum + Number(worklog.netAmount ?? 0), 0);
  const comments = isWave0Attempt ? [
    { id: 'COM-UABC-39-W0-01-START', type: 'status', time: today, role: 'Projektleitung', actorRef: lead, actorType: 'human', actionRole: leadRole, text: 'W0-01 wurde am 2026-07-13 im ausdrücklich freigegebenen Nur-Lese-Modus gestartet. Ziel war ausschließlich die sichtbare Gesellschaftsidentität; Schreib-, Speicher-, Kopier-, Umbenennungs- und Setup-Aktionen waren ausgeschlossen.', evidenceRef: wave0AttemptPath },
    { id: 'COM-UABC-39-W0-01-BLOCKED', type: 'status', time: today, role: 'Projektleitung', actorRef: lead, actorType: 'human', actionRole: leadRole, text: 'Der vorhandene Tab zeigte nur den Titel Dynamics 365 Business Central sowie bereinigte Playthru- und Company-Parameter. Die Browser-Sicherheitsrichtlinie blockierte vor DOM, Screenshot und BC-Feldlektüre; es wurden keine Company-ID, Firmendaten, CRONUS-Indizien oder Gesellschaftslistenwerte gelesen und keine Writes ausgeführt. Die Zielstrategie bleibt offen.', evidenceRef: wave0AttemptPath },
    { id: 'COM-UABC-39-W0-01-RETRY-BLOCKED', type: 'status', time: today, role: 'Projektleitung', actorRef: lead, actorType: 'human', actionRole: leadRole, text: 'Der zweite ausdrücklich lesende Zugriffsversuch über die vorhandene angemeldete Registerkarte wurde erneut durch die Unternehmensrichtlinie vor DOM, Screenshot und BC-Feldlektüre blockiert. Es wurden weder Authdaten noch BC-Feldwerte gelesen und keine Writes ausgeführt; W0-01 und die Zielstrategie bleiben offen.', evidenceRef: wave0AttemptPath }
  ] : isCorePreparation ? [
    { id: 'COM-UABC-40-CORE-PREPARED-20260713', type: 'status', time: today, role: 'Lead BC Consultant', actorRef: lead, actorType: 'human', actionRole: leadRole, text: 'CORE-FINANCE ist source-driven als 19 Pakettabellen mit 51 Datensätzen sowie 7 manuellen Tabellen mit 18 Sollwerten vorbereitet und fail-closed validiert. Es wurde weder Business Central gelesen oder beschrieben noch eine Schreibfreigabe erteilt; W0-01, Zielstrategie, Resetpunkt und Steuerbestätigung bleiben vorgelagert.', evidenceRef: 'project/bc-basic/core-finance-package-manifest.yaml' }
  ] : [{
    id: `COM-${ticket.id}-CURRENT-PLAN`, type: 'status', time: today,
    role: 'Projektleitung', actorRef: lead, actorType: 'human', actionRole: leadRole,
    text: `${ticket.id} – ${summary}: Pilotstand am ${today} ist ${status}. Nur vorbereitende Arbeit ist belegt; Live-Schritte bleiben offen.`,
    evidenceRef: evidenceByType[0]
  }];
  return {
    ...ticket,
    ...presentation,
    classification: 'current-pilot-planning',
    status,
    start: today,
    end: null,
    createdAt: today,
    startedAt: status === 'created' ? null : today,
    testedAt: null,
    closedAt: null,
    actualHours,
    remainingHours: Math.max(0, Number(ticket.estimateHours ?? 0) - actualHours),
    netAmount,
    deliverable: deliverableOverrides[ticket.id] ?? ticket.deliverable,
    description,
    summary,
    title: summary,
    acceptanceCriteria: criteria,
    evidenceRefs: evidenceByType,
    worklogs,
    worklogHours: actualHours,
    comments,
    reporter: lead,
    assignee: lead,
    reporterRole: leadRole,
    assigneeRole: leadRole,
    statusHistory,
    statusReason: isWave0Attempt ? 'W0-01 ist vor DOM-, Screenshot- und BC-Feldlektüre durch die Browser-Sicherheitsrichtlinie blockiert; die Zielstrategie bleibt ohne Company-ID-, CRONUS-, Fremdmandanten- und Reset-Evidence offen.' : status === 'blocked' ? `Abhängig von ${ticket.id === 'UABC-2' ? 'UABC-1' : 'UABC-2'}; die vorherige Phase ist fachlich noch nicht abgeschlossen und keine Live-Ausführung ist freigegeben.` : `${ticket.id} ist ${status}; „${summary}“ darf nur mit ticket-spezifischer Evidence abgeschlossen werden.`,
    dependencies: ticket.id === 'UABC-2' ? ['UABC-1'] : ticket.id === 'UABC-3' ? ['UABC-2'] : [...(ticket.dependencies ?? [])],
    decisionRefs: [...new Set([...(ticket.decisionRefs ?? []).filter((ref) => ref !== 'UABC-DEC-BCB-008'), decisionRefForTicket(ticket)])],
    meetingTranscriptRefs: [],
    pageRefs: [...(ticket.pageRefs ?? [])],
    deliverableRefs: [...(ticket.deliverableRefs ?? [])]
  };
}

const currentTickets = source.tickets.map(rebaseline);
const currentTicketById = new Map(currentTickets.map((ticket) => [ticket.id, ticket]));
for (const parentTicket of currentTickets.filter((ticket) => ticket.type !== 'task')) {
  const descendantTasks = currentTickets.filter((candidate) => {
    if (candidate.type !== 'task') return false;
    let parentId = candidate.parent;
    while (parentId) {
      if (parentId === parentTicket.id) return true;
      parentId = currentTicketById.get(parentId)?.parent ?? null;
    }
    return false;
  });
  parentTicket.actualHours = descendantTasks.reduce((sum, task) => sum + task.actualHours, 0);
  parentTicket.worklogHours = parentTicket.actualHours;
  parentTicket.netAmount = descendantTasks.reduce((sum, task) => sum + task.netAmount, 0);
  parentTicket.remainingHours = Math.max(0, Number(parentTicket.estimateHours ?? 0) - parentTicket.actualHours);
}
const pendingDecision = 'UABC-DEC-PILOT-PENDING';
const businessDate = (offset) => {
  const date = new Date(Date.UTC(2026, 6, 13));
  let remaining = offset;
  while (remaining > 0) { date.setUTCDate(date.getUTCDate() + 1); if (![0, 6].includes(date.getUTCDay())) remaining -= 1; }
  return date.toISOString().slice(0, 10);
};
const timelineEvidenceByPhase = {
  Angebot: 'docs/offers/bc-basic-offer.md',
  Projektstart: 'project/bc-basic/project-plan.yaml',
  Discovery: 'project/bc-basic/decision-register.yaml',
  Setup: 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml',
  Migration: 'project/bc-basic/data-readiness-check.yaml',
  P2P: 'atlassian/confluence/pages/31-processes.md',
  O2C: 'atlassian/confluence/pages/31-processes.md',
  Cash: 'atlassian/confluence/pages/31-processes.md',
  Lager: 'atlassian/confluence/pages/31-processes.md',
  UAT: 'project/bc-basic/uat-catalog.yaml',
  Cutover: 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml',
  'Go-live': 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml',
  Hypercare: 'atlassian/confluence/pages/bc-basic-hypercare.md',
  Handover: 'docs/handover/bc-basic-handover.md'
};
const currentTimeline = (source.timeline ?? []).map((event, index) => ({
  ...event,
  time: `${businessDate(index)}T10:00:00+02:00`,
  sessions: [],
  evidence: timelineEvidenceByPhase[event.phase] ?? 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml',
  decision: pendingDecision,
  action: `${event.phase} als offenen Planungsschritt vorbereiten`,
  result: 'offen-geplant',
  nextStep: `Freigabe und belastbare Evidence für ${event.phase} abwarten.`
}));
const currentHypercare = (source.hypercare ?? []).map((day) => ({
  ...day,
  comment: `COM-${day.ticket}-CURRENT-PLAN`,
  diagnosis: `Geplantes Szenario: ${String(day.diagnosis ?? '').replace(/^Geplantes Szenario:\s*/i, '')}`,
  fix: `Noch nicht ausgeführt; geplanter Prüfpunkt für ${day.ticket}.`,
  retest: 'not-executed',
  status: 'planned',
  decision: pendingDecision,
  evidence: 'atlassian/confluence/pages/bc-basic-hypercare.md'
}));
const currentCatalogs = {
  sessions: [],
  decisions: [...new Set([...currentTickets.flatMap((ticket) => ticket.decisionRefs ?? []), 'UABC-DEC-BCB-009', 'UABC-DEC-BCB-010', pendingDecision])],
  deliverables: [...new Set(currentTickets.flatMap((ticket) => ticket.deliverableRefs ?? []))],
  evidenceRefs: [...new Set([...evidence, ...Object.values(taskEvidence).flat(), ...currentTimeline.map((event) => event.evidence), ...currentHypercare.map((day) => day.evidence)])]
};
const buildCurrentRelations = () => {
  const relations = []; const keys = new Set();
  const add = (type, from, to) => { if (!from || !to || from === to) return; const key = `${type}|${from}|${to}`; if (!keys.has(key)) { keys.add(key); relations.push({ type, from, to }); } };
  const reference = (from, to) => { add('references', from, to); add('references', to, from); };
  const dependency = (from, to) => { add('depends-on', from, to); add('required-by', to, from); };
  for (const ticket of currentTickets) {
    if (ticket.parent) reference(ticket.id, ticket.parent);
    for (const target of [...(ticket.pageRefs ?? []), ...(ticket.deliverableRefs ?? []), ...(ticket.evidenceRefs ?? []), ...(ticket.decisionRefs ?? [])]) reference(ticket.id, target);
    for (const target of ticket.dependencies ?? []) dependency(ticket.id, target);
    for (const comment of ticket.comments ?? []) { reference(comment.id, ticket.id); reference(comment.id, comment.evidenceRef); }
  }
  for (const page of source.pages ?? []) for (const target of page.references ?? []) if (currentTickets.some((ticket) => ticket.id === target)) reference(page.id, target);
  for (const event of currentTimeline) for (const target of [...(event.tickets ?? []), ...(event.pages ?? []), ...(event.sessions ?? []), event.evidence, event.decision, event.deliverable]) reference(event.id, target);
  for (const day of currentHypercare) for (const target of [day.dailyPage, day.ticket, day.comment, day.evidence, day.decision]) reference(`HYPERCARE-${day.day}`, target);
  return relations.sort((left, right) => `${left.type}|${left.from}|${left.to}`.localeCompare(`${right.type}|${right.from}|${right.to}`, 'de'));
};
const records = currentTickets.map(({ hourlyRate: _hourlyRate, netAmount: _netAmount, ...ticket }) => ({
  ...ticket,
  canonicalType: ticket.type,
  visibilityRole: 'customer-visible',
  countingScope: 'active-project',
  projectId: 'UABC-BC-BASIC-001'
}));

const currentWorklogs = currentTickets.flatMap(ticket => ticket.worklogs ?? []);
const actualHours = currentWorklogs.reduce((sum, worklog) => sum + Number(worklog.hours ?? 0), 0);
const actualNetAmount = currentWorklogs.reduce((sum, worklog) => sum + Number(worklog.netAmount ?? 0), 0);
const typeCounts = Object.fromEntries(['phase', 'epic', 'story', 'task'].map(type => [type, currentTickets.filter(ticket => ticket.type === type).length]));
const currentPages = (source.pages ?? []).map((page) => {
  const text = fs.readFileSync(page.sourcePath, 'utf8');
  const marker = text.match(/<!-- story-metadata (\{.*\}) -->/);
  if (!marker) throw new Error(`${page.sourcePath}: story-metadata fehlt`);
  const metadata = JSON.parse(marker[1]);
  return { ...page, title: metadata.title, parent: metadata.parent ?? null, version: metadata.version, status: metadata.status };
});
const currentSource = { ...source, classification: 'current-pilot-planning', status: 'in-progress', generatedAt: today,
  historicalClassification: 'archived-in-git-history', pages: currentPages, tickets: currentTickets, timeline: currentTimeline, hypercare: currentHypercare, relations: buildCurrentRelations(), catalogs: currentCatalogs,
  businessCentralPilotState: { baselineKind: companyState.baselineKind, baselineProvenance: companyState.baselineProvenance, customerTargetRealized: companyState.customerTargetRealized, originMechanismStatus: companyState.originMechanismStatus, copyRenameHypothesis: companyState.copyRenameHypothesis, setupStatus: companyState.setupStatus, pilotConfigured: companyState.pilotConfigured, writesApplied: companyState.writesApplied, readbackStatus: companyState.readbackStatus, technicalCompanyName: companyState.technicalCompanyName, internalCompanyId: companyState.internalCompanyId, observedDisplayName: readOnlyPreflight.configurationState.baseline.observedDisplayName, targetDisplayName: companyTarget.displayName, targetDecision: companyState.targetDecision, resetDecision: companyState.resetDecision, targetState: companyTarget.classification, appliedDifferenceStatus: pilotSetupBaseline.companyInformation.appliedDifference.status, wave0ReadbackAttempt: { status: wave0Attempt.status, evidencePath: wave0AttemptPath, attemptCount: wave0Attempt.attemptCount, latestAttemptId: wave0Attempt.latestAttemptId, latestAttemptAt: wave0Attempt.attempts.at(-1).recordedAt, bcReadbackAuthority: wave0Attempt.bcReadbackAuthority, bcFieldValuesRead: !wave0Attempt.accessResult.blockedBeforeBcFieldRead, screenshotCaptured: wave0Attempt.accessResult.screenshotPerformed, writesPerformed: wave0Attempt.effects.writesPerformed }, companyStrategyGate: { status: companyStrategy.status, selectedOption: companyStrategy.selectedOption, nextExecutableStep: companyStrategy.nextExecutableStep, authority: companyStrategy.decisionAuthority }, sourceEvidence: wave0AttemptPath, planningEvidence: 'evidence/playthru-uabc-basic-de/setup-wave-1-read-only-preflight.yaml' },
  offer: { ...Object.fromEntries(Object.entries(source.offer ?? {}).filter(([key]) => key !== 'versions')), currentVersion: 'pilot-rebaseline-2026-07-13', status: 'active-planning', currentStatus: 'active-planning', actual_hours: actualHours, actual_cost: actualNetAmount },
  historicalOfferVersions: structuredClone(source.historicalOfferVersions ?? source.offer?.versions ?? []),
  activeOffer: { status: 'planned-not-accepted', plannedHours: source.offer?.planned_hours ?? 80, plannedNetAmount: source.offer?.planned_cost ?? 9600, actualHours, actualNetAmount, customerAcceptanceClaimed: false },
  controls: { ...Object.fromEntries(Object.entries(source.controls ?? {}).filter(([key]) => !['netAmount', 'phaseHours', 'phaseCount', 'epicCount', 'storyCount', 'taskCount', 'billableTicketCount', 'transcriptCoverage', 'confluencePageCount', 'confluenceRootCount', 'confluenceRootDistribution', 'confluenceMigrationCount'].includes(key))), activeTicketCount: currentTickets.length, activeTicketIdRange: 'dynamisch-aus-kanonischer-Quelle', phaseCount: typeCounts.phase, epicCount: typeCounts.epic, storyCount: typeCounts.story, taskCount: typeCounts.task, billableTicketCount: currentTickets.filter(ticket => ticket.type === 'task' && ticket.billable === true).length, confluencePageCount: currentPages.length, confluenceRootCount: currentPages.filter((page) => page.parent === null).length, plannedPhaseHours: source.controls?.plannedPhaseHours ?? source.controls?.phaseHours ?? null, actualHours, actualNetAmount, plannedNetAmount: source.offer?.planned_cost ?? source.controls?.plannedNetAmount ?? null, worklogHours: actualHours, worklogCost: actualNetAmount }
};
fs.writeFileSync(sourcePath, JSON.stringify(currentSource, null, 2) + '\n');

const doc = {
  schemaVersion: 1,
  projectId: 'UABC-BC-BASIC-001',
  classification: 'current-pilot-planning',
  sourceContract: sourcePath,
  historicalSource: 'git-history-before-pilot-rebaseline',
  generated: true,
  generatedAt: today,
  derivedFrom: [sourcePath, ...evidence],
  canonicalTypes: ['phase', 'epic', 'story', 'task'],
  typePresentations: presentations,
  liveIconPolicy: { sourceMode: 'local-allowlist-only', allowlistedAssets: [], allowedOrigins: [], digestAlgorithm: 'SHA-256', digestRequired: true },
  views: structuredClone(TICKET_VIEWS),
  recordCount: records.length,
  customerStoryCount: records.length,
  internalTraceabilityCount: 0,
  records,
  ticketRecords: records
};
fs.writeFileSync('atlassian/jira/issues/bc-basic-story-tickets.yaml', YAML.stringify(doc));
console.log(`Aktiver Jira-Export erzeugt: ${records.length} Tickets aus der kanonischen Projektstory, aktueller Pilotstand.`);

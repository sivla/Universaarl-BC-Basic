import fs from 'node:fs';
import YAML from 'yaml';
import { TICKET_VIEWS } from './generate-spectra-0.10-integration.mjs';

const sourcePath = 'evidence/simulation/project-story.json';
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const today = '2026-07-13';
const lead = 'P-PILOT-LEAD-001';
const leadRole = 'Kajetan Kalicki – Projektleitung, Lead BC Consultant und Solution Architect';
const evidence = [
  'project/bc-basic/setup-wave-1-matrix.yaml',
  'project/bc-basic/setup-parameter-baseline.yaml',
  'evidence/playthru-uabc-basic-de/setup-wave-1-read-only-preflight.yaml',
  'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml'
];
const taskEvidence = {
  'UABC-32': ['docs/offers/bc-basic-offer.md', 'project/bc-basic/project-plan.yaml'],
  'UABC-33': ['project/bc-basic/project-plan.yaml', 'project/bc-basic/decision-register.yaml'],
  'UABC-34': ['project/bc-basic/posting-setup-matrix.yaml', 'project/bc-basic/solution-blueprint.yaml'],
  'UABC-35': ['atlassian/confluence/pages/71-bc-basic-discovery.md', 'project/bc-basic/decision-register.yaml'],
  'UABC-36': ['atlassian/confluence/pages/71-bc-basic-discovery.md', 'project/bc-basic/decision-register.yaml'],
  'UABC-37': ['atlassian/confluence/pages/71-bc-basic-discovery.md', 'project/bc-basic/decision-register.yaml'],
  'UABC-38': ['project/bc-basic/data-package.yaml', 'project/bc-basic/data-readiness-check.yaml'],
  'UABC-39': [...evidence],
  'UABC-40': ['project/bc-basic/posting-setup-matrix.yaml', 'project/bc-basic/solution-blueprint.yaml'],
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
  'UABC-39': ['Wave-0-Readback belegt interne Company-ID, technischen Namen, Name, Display Name und die Standard-CRONUS-Demo-Ausgangsprovenienz von UABC-BASIC-DE.', 'Resetpunkt sowie die evidenzbasierte Entscheidung kontrollierte Weiterverwendung versus Neuanlage oder Kopie sind dokumentiert; ohne beides bleiben alle Writes gesperrt.'],
  'UABC-40': ['CORE-FINANCE-Allowlist, Feldumfang, Abhängigkeiten und Singleton-Sollwerte bestehen die Setup-Wave-Validatoren.', 'Spätere Readbacks müssen Konten- und VAT-Matrix auflösen und zugleich 0 neu erzeugte Ledger-, Posted- oder Continia-Wirkungen belegen.'],
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
  'UABC-21': ['Wave 0 belegt Company-ID, Namen, Standard-CRONUS-Provenienz, Resetpunkt und die Zielentscheidung für UABC-BASIC-DE.', 'Perioden, Nummernserien und Rollenbaseline besitzen konkrete Sollwerte und bleiben bis zu feldgenauen Readbacks unkonfiguriert.'],
  'UABC-22': ['Finance-, VAT- und Buchungsmatrizen lösen Konten und Buchungsgruppen ohne Widerspruch auf.', 'Unzulässige Rollenkombinationen sind als SoD-Befund sichtbar und blockieren die betroffene Freigabe.'],
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
  if (ticket.id === 'UABC-2' || ticket.id === 'UABC-3') return 'blocked';
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
  if (ticket.id === 'UABC-39') original = 'UABC-BASIC-DE wird zunächst als unveränderte Microsoft-Standard-CRONUS-Demo-Baseline gelesen. Interne Company-ID, technischer Name, Name, Display Name, Ausgangsdaten, CRONUS-Provenienz, Resetpunkt und die Entscheidung zur kontrollierten Weiterverwendung oder Neuanlage beziehungsweise Kopie müssen belegt sein, bevor irgendeine Pilotabweichung angewendet wird.';
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
  if (ticket.id === 'UABC-39') summary = 'Standard-CRONUS-Demo-Ausgangsbasis, Wave-0-Zielentscheidung und Resetpunkt für den Pilotaufbau belegen.';
  if (ticket.id === 'UABC-28') summary = 'SIT, UAT und Mock-Cutover für eine spätere Simulationsabnahme planen.';
  if (ticket.id === 'UABC-46') summary = 'UAT, Retests und Mock-Cutover mit aktueller Evidence vorbereiten.';
  if (ticket.id === 'UABC-47') summary = 'Geplantes Hypercare-Szenario für eine mögliche nicht zugeordnete Zahlung vorbereiten.';
  if (ticket.id === 'UABC-49') summary = 'Geplante VAT- und UStVA-Abstimmung ohne externe Übermittlung vorbereiten.';
  if (ticket.id === 'UABC-50') summary = 'Retro, Restpunkte und Supportübergabe für den aktuellen Piloten vorbereiten.';
  if (epicSummaryOverrides[ticket.id]) summary = epicSummaryOverrides[ticket.id];
  if (ticket.id === 'UABC-29') summary = 'Hypercare-Diagnose und Retestregel für eine mögliche Zahlungsreferenzabweichung planen.';
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
    actualHours: 0,
    remainingHours: ticket.estimateHours ?? 0,
    netAmount: 0,
    deliverable: deliverableOverrides[ticket.id] ?? ticket.deliverable,
    description,
    summary,
    acceptanceCriteria: criteria,
    evidenceRefs: evidenceByType,
    worklogs: [],
    worklogHours: 0,
    comments: [{
      id: `COM-${ticket.id}-CURRENT-PLAN`, type: 'status', time: today,
      role: 'Projektleitung', actorRef: lead, actorType: 'human', actionRole: leadRole,
      text: `${ticket.id} – ${summary}: Pilotstand am ${today} ist ${status}. Nur vorbereitende Arbeit ist belegt; Live-Schritte bleiben offen.`,
      evidenceRef: evidenceByType[0]
    }],
    reporter: lead,
    assignee: lead,
    reporterRole: leadRole,
    assigneeRole: leadRole,
    statusHistory,
    statusReason: status === 'blocked' ? `Abhängig von ${ticket.id === 'UABC-2' ? 'UABC-1' : 'UABC-2'}; die vorherige Phase ist fachlich noch nicht abgeschlossen und keine Live-Ausführung ist freigegeben.` : `${ticket.id} ist ${status}; „${summary}“ darf nur mit ticket-spezifischer Evidence abgeschlossen werden.`,
    dependencies: ticket.id === 'UABC-2' ? ['UABC-1'] : ticket.id === 'UABC-3' ? ['UABC-2'] : [...(ticket.dependencies ?? [])],
    decisionRefs: [...new Set([...(ticket.decisionRefs ?? []).filter((ref) => ref !== 'UABC-DEC-BCB-008'), decisionRefForTicket(ticket)])],
    meetingTranscriptRefs: [],
    pageRefs: [...(ticket.pageRefs ?? [])],
    deliverableRefs: [...(ticket.deliverableRefs ?? [])]
  };
}

const currentTickets = source.tickets.map(rebaseline);
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
  businessCentralPilotState: { baselineKind: 'standard-cronus-demo', pilotConfigured: false, writesApplied: false, readbackStatus: 'pending', technicalCompanyName: 'UABC-BASIC-DE', internalCompanyId: null, observedDisplayName: 'Universaarl GmbH', targetDisplayName: 'Universaarl GmbH (BC Basic Pilot)', targetDecision: 'pending-wave-0-evidence', resetDecision: 'pending-resetpoint-evidence', sourceEvidence: 'evidence/playthru-uabc-basic-de/setup-wave-1-read-only-preflight.yaml' },
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

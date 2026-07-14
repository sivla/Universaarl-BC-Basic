import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

const OPEN = new Set(['created', 'ready', 'in-progress', 'blocked']);
const HISTORICAL_REFS = new Set([
  'project/bc-basic/bc-playthrough-catalog.yaml',
  'evidence/simulation/bc-playthrough-ledger.yaml',
  'evidence/simulation/project-completion.yaml'
]);

export function validateActiveBcPlaythrough(story, runPlan, projection) {
  const errors = [];
  const fail = (message) => errors.push(message);
  const state = story?.businessCentralPilotState ?? {};
  if (story?.classification === 'synthetic-canonical-project-v1' && story?.status === 'simulated-complete') {
    if (state.simulationStatus !== 'simulated-complete' || state.realBcExecution !== false || state.writesApplied !== false) fail('Kanonische Simulation muss synthetisch und schreibgesperrt bleiben.');
    const tickets = story.tickets ?? [];
    if (tickets.length !== 50 || tickets.some((ticket) => !['closed', 'completed', 'done'].includes(ticket.status))) fail('Alle 50 Tickets muessen synthetisch abgeschlossen sein.');
    const worklogs = tickets.filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs ?? []);
    const hours = worklogs.reduce((sum, item) => sum + Number(item.hours ?? 0), 0);
    const amount = worklogs.reduce((sum, item) => sum + Number(item.netAmount ?? 0), 0);
    if (hours !== 80 || amount !== 9600 || story.offer?.actual_hours !== 80 || story.offer?.actual_cost !== 9600) fail('Kanonische Worklogs muessen 80 Stunden und 9.600 EUR ergeben.');
    if (runPlan?.execution?.performed !== false || runPlan?.authorization?.writesAuthorized !== false) fail('Run-Plan muss unausgefuehrt und schreibgesperrt bleiben.');
    if (projection?.writesAuthorized !== false || projection?.writeGate?.writesAuthorized !== false) fail('Twin-Projektion muss schreibgesperrt bleiben.');
    return errors;
  }
  if (story?.classification !== 'current-pilot-planning' || story?.status !== 'in-progress') fail('Aktive Projektstory ist nicht der laufende Pilot.');
  if (state.baselineKind !== 'standard-cronus-demo' || state.pilotConfigured !== false || state.writesApplied !== false || state.customerTargetRealized !== false || state.originMechanismStatus !== 'unbekannt-bis-wave0-readback' || state.copyRenameHypothesis !== 'nutzerhinweis-unbestaetigt' || state.setupStatus !== 'blockiert-bis-dom-readback-und-zielkonfiguration' || state.readbackStatus !== 'pending') fail('Aktiver BC-Zustand muss Standard-CRONUS-Demo-Baseline mit unbekannter Gesellschaftsherkunft und offenem Pilotaufbau sein.');
  const worklogs = (story?.tickets ?? []).filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs ?? []);
  const hours = worklogs.reduce((sum, worklog) => sum + Number(worklog.hours ?? 0), 0);
  const amount = worklogs.reduce((sum, worklog) => sum + Number(worklog.netAmount ?? 0), 0);
  if (story?.offer?.actual_hours !== hours || story?.offer?.actual_cost !== amount) fail('Aktuelle Iststunden und Istkosten müssen ausschließlich aus aktiven Task-Worklogs abgeleitet werden.');
  const futureTickets = (story?.tickets ?? []).filter((ticket) => Number(ticket.id?.split('-')[1]) >= 39);
  if (!futureTickets.length || futureTickets.some((ticket) => !OPEN.has(ticket.status))) fail('Setup-, Playthrough-, UAT-, Hypercare- und Handover-Tickets müssen offen bleiben.');
  if (futureTickets.some((ticket) => /GO_SIMULATION|V1_STANDARDPRODUCT_READY|\bBestandene\b|\bAbgeschlossene\b|\bErfolgreiche\b/i.test(`${ticket.summary} ${ticket.description} ${ticket.deliverable}`))) fail('Aktive Tickets enthalten eine historische Erfolgs- oder GO-Behauptung.');
  if (futureTickets.some((ticket) => (ticket.evidenceRefs ?? []).some((ref) => HISTORICAL_REFS.has(ref)))) fail('Historische Simulationsevidence darf kein aktives Ticketgate erfüllen.');
  if (runPlan?.execution?.performed !== false || runPlan?.authorization?.writesAuthorized !== false || runPlan?.wave0Preflight?.status !== 'blocked-before-dom-readback' || runPlan?.wave0Preflight?.selectedDecision !== null) fail('Run-Plan muss unausgeführt, schreibgesperrt und mit blockiertem W0-01-Readback offen bleiben.');
  const writeSteps = (runPlan?.steps ?? []).filter((step) => step.write === true);
  if (!writeSteps.length || writeSteps.some((step) => step.performed !== false || step.observedResult !== null)) fail('Kein Schreibschritt darf ausgeführt oder mit Ergebnis belegt sein.');
  if (projection?.writesAuthorized !== false || projection?.writeGate?.writesAuthorized !== false || projection?.configurationState?.pilotConfigured !== false || projection?.configurationState?.writesApplied !== false || projection?.configurationState?.customerTargetRealized !== false || projection?.configurationState?.originMechanismStatus !== 'unbekannt-bis-wave0-readback') fail('Twin-Projektion muss den nicht realisierten, schreibgesperrten Pilot mit offener Herkunft zeigen.');
  if ((projection?.packages ?? []).length !== 3 || projection.packages.some((entry) => entry.tables !== 0 || entry.records !== 0 || entry.errors !== 0)) fail('Alle drei Pakete müssen in der aktuellen Projektion 0/0/0 bleiben.');
  return errors;
}

export function validateHistoricalBcPlaythrough(catalog, ledger, company, phase2, phase3, candidates) {
  const errors = [];
  if (catalog) {
    if (catalog.classification !== 'historical-reference-simulation' || catalog.currentAuthority !== false || catalog.status !== 'synthetic-closed-superseded') errors.push('Historischer Katalog ist nicht eindeutig abgelöst.');
    if (catalog.sessions?.length !== 7) errors.push(`Historischer Katalog erwartet 7 Kern-Sitzungen, gefunden ${catalog.sessions?.length ?? 0}.`);
    const required = ['id','date','role','goal','navigation','steps','preview','documents','entries','controls','negative','result','references'];
    for (const session of catalog.sessions ?? []) {
      for (const key of required) if (session[key] === undefined) errors.push(`${session.id}: historisches Pflichtfeld ${key} fehlt.`);
      if (session.result !== 'synthetisch-abgenommen') errors.push(`${session.id}: historisches Simulationsresultat fehlt.`);
      if (!session.negative?.defect || session.negative.retest !== 'bestanden-synthetisch') errors.push(`${session.id}: historischer Defect/Retest fehlt.`);
      if (!session.references?.evidence || !session.references?.sources?.length) errors.push(`${session.id}: historische Evidence-/Quellenreferenz fehlt.`);
      if ((session.documents?.length ?? 0) === 0 || (session.entries?.length ?? 0) === 0) errors.push(`${session.id}: historische Dokument- oder Entry-Kette fehlt.`);
    }
    if (catalog.gate !== 'GO_SIMULATION') errors.push('Historischer Katalog enthält kein internes GO_SIMULATION.');
  }
  if (ledger) {
    if (ledger.classification !== 'historical-reference-simulation' || ledger.currentAuthority !== false || ledger.status !== 'synthetic-closed-superseded' || ledger.result !== 'GO_SIMULATION') errors.push('Historisches Ledger ist nicht eindeutig abgelöst oder intern unvollständig.');
    const ids = new Set();
    for (const entry of ledger.ledgerEntries ?? []) { if (ids.has(entry.id)) errors.push(`Doppelte historische Entry-ID: ${entry.id}`); ids.add(entry.id); }
    const documents = new Map((ledger.documents ?? []).map((document) => [document.id, document]));
    const salesInvoice = documents.get('SYN-AR-002');
    if (salesInvoice?.net !== 790 || salesInvoice?.vat !== 150.10 || salesInvoice?.gross !== 940.10) errors.push('Historische O2C-Rechnung ist inkonsistent.');
    if (documents.get('SYN-SO-001')?.status !== 'fully-shipped-and-invoiced' || documents.get('SYN-PO-001')?.status !== 'fully-received-and-invoiced') errors.push('Historische Auftragsstatus sind inkonsistent.');
    const glEntries = (ledger.ledgerEntries ?? []).filter((entry) => entry.ledger === 'G/L');
    const glDebit = Math.round(glEntries.reduce((sum, entry) => sum + Number(entry.debit ?? 0), 0) * 100) / 100;
    const glCredit = Math.round(glEntries.reduce((sum, entry) => sum + Number(entry.credit ?? 0), 0) * 100) / 100;
    if (glDebit !== ledger.controls?.glDebit || glCredit !== ledger.controls?.glCredit || glDebit !== glCredit || ledger.controls?.glDifference !== 0) errors.push('Historisches G/L-Soll-Haben ist nicht ausgeglichen.');
    const trial = ledger.controls?.closingTrialBalance ?? [];
    const trialDebit = Math.round(trial.reduce((sum, entry) => sum + Number(entry.debitBalance ?? 0), 0) * 100) / 100;
    const trialCredit = Math.round(trial.reduce((sum, entry) => sum + Number(entry.creditBalance ?? 0), 0) * 100) / 100;
    if (trialDebit !== 11080.20 || trialCredit !== 11080.20 || ledger.controls?.closingTrialBalanceDifference !== 0) errors.push('Historische Schlussbilanz ist inkonsistent.');
    if (ledger.controls?.newCustomerInvoiceOpenAfterApply !== 0 || ledger.controls?.newVendorInvoiceOpenAfterApply !== 0 || ledger.controls?.customerOpenAfterApply !== 940.10 || ledger.controls?.vendorOpenAfterApply !== 499.80) errors.push('Historische Nebenbuchkontrollen sind inkonsistent.');
    const configuredRoles = new Set(company?.values?.syntheticConfigurationBaseline?.accountRoles?.map((entry) => entry.role) ?? []);
    if (configuredRoles.size !== 11 || company?.values?.syntheticConfigurationBaseline?.postingMatrices?.length !== 6) errors.push('Historische Konten-/Buchungsmatrix ist unvollständig.');
    const historicalRoleAliases = new Map([['BANK', 'BANK-CLEARING']]);
    for (const entry of glEntries) if (!configuredRoles.has(entry.accountRole) && !configuredRoles.has(historicalRoleAliases.get(entry.accountRole))) errors.push(`${entry.id}: historische Kontenrolle fehlt.`);
    if (phase2?.orderToCash?.controls?.net !== 790 || phase2?.orderToCash?.controls?.vat !== 150.10 || phase2?.orderToCash?.controls?.gross !== 940.10) errors.push('Historische Phase-2-O2C-Kontrollsumme weicht ab.');
    if (phase3?.monthClose?.closingTrialBalance?.debit !== 11080.20 || phase3?.monthClose?.closingTrialBalance?.credit !== 11080.20 || phase3?.monthClose?.closingTrialBalance?.difference !== 0) errors.push('Historische Phase-3-Schlussbilanz weicht ab.');
    if (ledger.controls?.allDefectsRetested !== true) errors.push('Historische Defects sind nicht vollständig retestet.');
  }
  if (candidates) {
    if (candidates.classification !== 'anonymized-product-candidates') errors.push('Kandidatenregister ist nicht anonymisiert.');
    for (const candidate of candidates.candidates ?? []) {
      if (!['proposed','accepted','partially-adopted','released','bound'].includes(candidate.status)) errors.push(`${candidate.findingId}: ungültiger Kandidatenstatus.`);
      if (candidate.anonymization !== 'bestanden-keine-kundenwerte') errors.push(`${candidate.findingId}: Anonymisierungsprüfung fehlt.`);
    }
    const status = new Map((candidates.candidates ?? []).map((candidate) => [candidate.findingId, candidate.status]));
    for (const id of ['UABC-FINDING-BCB-PLANACTUAL-001','UABC-FINDING-BCB-ADAPTER-001','UABC-FINDING-BCB-GRAPH-COVERAGE-001','PROJECT-STORY-VALIDATION-001']) if (status.get(id) !== 'bound') errors.push(`${id}: veröffentlichte Kandidatenentscheidung ist nicht gebunden.`);
    if (candidates.currentReleaseBinding?.status !== 'bound' || candidates.currentReleaseBinding?.release !== 'spectra-v0.10.0-alpha.1') errors.push('Spectra-0.10-Bindung ist inkonsistent.');
  }
  return errors;
}

const loadYaml = (file, errors) => { const full=path.join(process.cwd(),file); if(!existsSync(full)){errors.push(`Datei fehlt: ${file}`);return null;} try{return YAML.parse(readFileSync(full,'utf8'));}catch(error){errors.push(`YAML unlesbar ${file}: ${error.message}`);return null;} };

if (process.argv[1]?.endsWith('validate-bc-playthrough.mjs')) {
  const historical = process.argv.includes('--historical'); const loadErrors=[];
  let errors;
  if (historical) errors = validateHistoricalBcPlaythrough(loadYaml('project/bc-basic/bc-playthrough-catalog.yaml',loadErrors),loadYaml('evidence/simulation/bc-playthrough-ledger.yaml',loadErrors),loadYaml('project/bc-basic/customer-templates/example/company-setup.example.yaml',loadErrors),loadYaml('evidence/simulation/phase-2-p2p-o2c.yaml',loadErrors),loadYaml('evidence/simulation/phase-3-cash-inventory-close.yaml',loadErrors),loadYaml('project/bc-basic/blueprint-candidates.yaml',loadErrors));
  else errors = validateActiveBcPlaythrough(JSON.parse(readFileSync('evidence/simulation/project-story.json','utf8')),loadYaml('evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml',loadErrors),JSON.parse(readFileSync('exports/project-data/v1/setup-wave-1-projection.json','utf8')));
  errors=[...loadErrors,...errors];
  if(errors.length){console.error(`${historical?'Historische BC-Referenz':'Aktiver BC-Playthrough'}-Pruefung fehlgeschlagen (${errors.length}):`);errors.forEach((error)=>console.error(`- ${error}`));process.exit(1);}
  if (historical) console.log('Historische BC-Referenzpruefung bestanden: 7 Sitzungen, Dokument-/Entry-Ketten, Kontrollen und internes GO_SIMULATION konsistent; currentAuthority=false.');
  else {
    const activeStory = JSON.parse(readFileSync('evidence/simulation/project-story.json','utf8'));
    const worklogs = activeStory.tickets.filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs ?? []);
    const hours = worklogs.reduce((sum, worklog) => sum + Number(worklog.hours ?? 0), 0);
    const amount = worklogs.reduce((sum, worklog) => sum + Number(worklog.netAmount ?? 0), 0);
    console.log(`Aktiver BC-Playthrough bestanden: unveränderte Standard-CRONUS-Demo-Baseline, W0-01 vor DOM-Readback blockiert, Setup/Prozesse/UAT/Hypercare offen, Ist ${hours}/${amount}, writesAuthorized=false und Pakete 0/0/0.`);
  }
}

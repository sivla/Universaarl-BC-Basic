import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = process.cwd();
const file = (relative) => path.join(root, relative);
const exists = (relative) => fs.existsSync(file(relative)) && fs.statSync(file(relative)).isFile();
const load = (relative) => JSON.parse(fs.readFileSync(file(relative), 'utf8'));

export function validateReferenceSimulation(contract, exportData, story, fileExists = exists) {
  const errors = [];
  const fail = (code, detail) => errors.push(`${code}: ${detail}`);
  const exact = (object, allowed, label, code) => {
    if (!object || typeof object !== 'object' || Array.isArray(object)) { fail(code, `${label} muss ein Objekt sein.`); return; }
    const unexpected = Object.keys(object).filter((key) => !allowed.includes(key));
    if (unexpected.length) fail(code, `${label} enthält unerwartete Properties: ${unexpected.join(', ')}`);
    for (const key of unexpected) if (object[key] === null) fail(code, `${label}.${key} ist null; beschädigtes unquoted Flow-Mapping.`);
  };
  const phaseKeys = ['id', 'code', 'title', 'plannedHours', 'syntheticResult'];
  const meetingKeys = ['id', 'path', 'phase'];
  const playthroughKeys = ['id', 'title', 'evidence', 'navigation', 'input', 'documents', 'postings', 'controls', 'defect', 'correction', 'retest'];
  const ticketKeys = ['id', 'type', 'summary', 'description', 'deliverable', 'phaseId', 'phase', 'phaseRefs', 'code', 'title', 'order', 'start', 'end', 'epicIds', 'billable', 'billingSource', 'estimateHours', 'actualHours', 'remainingHours', 'hourlyRate', 'netAmount', 'status', 'reporter', 'assignee', 'reporterRole', 'assigneeRole', 'priority', 'parent', 'dependencies', 'labels', 'components', 'createdAt', 'startedAt', 'testedAt', 'closedAt', 'statusHistory', 'acceptanceCriteria', 'evidenceRefs', 'comments', 'worklogs', 'category', 'participants', 'meetingTranscriptRefs', 'statusReason', 'decisionRefs', 'pageRefs', 'deliverableRefs', 'childTicketIds', 'typeLabel', 'displayIconKey', 'displayColorToken', 'classification', 'worklogHours', 'customerInputs', 'customerRoles', 'consultantRoles', 'concreteSteps', 'agenda', 'expectedResult', 'specificRisk', 'handoff', 'evidenceReadback'];
  for (const [index, phase] of (contract?.phases ?? []).entries()) exact(phase, phaseKeys, `phases[${index}]`, 'STRUCTURED-PROPERTY');
  for (const [index, meeting] of (contract?.meetings ?? []).entries()) exact(meeting, meetingKeys, `meetings[${index}]`, 'STRUCTURED-PROPERTY');
  for (const [index, playthrough] of (contract?.playthroughs ?? []).entries()) exact(playthrough, playthroughKeys, `playthroughs[${index}]`, 'STRUCTURED-PROPERTY');
  for (const [index, ticket] of (story?.tickets ?? []).entries()) exact(ticket, ticketKeys, `story.tickets[${index}]`, 'STORY-STRUCTURED-PROPERTY');
  const exportPhaseKeys = phaseKeys;
  for (const [index, phase] of (exportData?.phases ?? []).entries()) exact(phase, exportPhaseKeys, `export.phases[${index}]`, 'EXPORT-STRUCTURED-PROPERTY');
  if (contract?.classification !== 'synthetic-canonical-project-v1' || contract.currentAuthority !== true || contract.simulationOnly !== true) fail('CONTRACT-KLASSIFIKATION', 'Kanonische Simulation muss synthetic-canonical-project-v1, currentAuthority=true und simulationOnly=true tragen.');
  if (!contract?.truthBoundary || Object.values(contract.truthBoundary).some((value) => value === true && value !== 'pending')) fail('WAHRHEITSGRENZE', 'Live-/Freigabe-/Übermittlungsbehauptungen müssen false bleiben.');
  if (contract.truthBoundary.continia !== 'out-of-scope' || contract.truthBoundary.liveGates !== 'pending') fail('CONTINIA-LIVE-GATE', 'Continia und echte Live-Gates müssen offen beziehungsweise out-of-scope bleiben.');
  for (const source of [contract.sourceStory, ...(contract.sourceHistoricalEvidence ?? []), ...(contract.meetings ?? []).map((meeting) => meeting.path)]) if (!fileExists(source)) fail('QUELLE-FEHLT', source);
  if (contract.offer?.plannedHours !== 80 || contract.offer?.hourlyRate !== 120 || contract.offer?.plannedNetAmount !== 9600 || contract.offer?.ceilingNetAmount !== 10000) fail('BUDGET-VERTRAG', '80 Stunden, 120 EUR, 9.600 EUR und 10.000 EUR Ceiling erforderlich.');
  if ((contract.phases ?? []).length !== 3 || (contract.phases ?? []).reduce((sum, phase) => sum + Number(phase.plannedHours), 0) !== 80 || (contract.phases ?? []).some((phase) => phase.syntheticResult !== 'completed')) fail('PHASEN-VERTRAG', 'Drei synthetisch abgeschlossene Phasen mit 80 Stunden erforderlich.');
  const sourceTickets = story?.tickets ?? [];
  const exportTickets = exportData?.tickets ?? [];
  if (sourceTickets.length !== 50 || exportTickets.length !== 50) fail('TICKET-ANZAHL', `Erwartet 50/50, gefunden ${sourceTickets.length}/${exportTickets.length}.`);
  const sourceIds = new Set(sourceTickets.map((ticket) => ticket.id));
  const exportIds = new Set(exportTickets.map((ticket) => ticket.id));
  if (sourceIds.size !== 50 || exportIds.size !== 50 || [...sourceIds].some((id) => !exportIds.has(id))) fail('TICKET-ID-ABDECKUNG', 'Export muss exakt die aktiven Story-IDs abdecken.');
  let hours = 0; let amount = 0;
  for (const ticket of exportTickets) {
    if (ticket.simulationStatus !== 'completed' || ticket.liveStatus === 'completed' || ticket.liveStatus === 'done') fail('TICKET-WAHRHEIT', `${ticket.id} vermischt synthetischen und echten Abschlussstatus.`);
    if (!ticket.meetingTranscriptRefs?.length || !ticket.evidenceRefs?.length || !ticket.deliverableRefs?.length) fail('TICKET-REFERENZEN', ticket.id);
    if (!Array.isArray(ticket.acceptanceCriteria) || ticket.acceptanceCriteria.length < 2 || ticket.acceptanceCriteria.some((criterion) => criterion.fulfilled !== true)) fail('TICKET-ABNAHME', ticket.id);
    if (!ticket.syntheticLifecycle?.createdAt || !ticket.syntheticLifecycle?.testedAt || !ticket.syntheticLifecycle?.closedAt) fail('TICKET-LEBENSZYKLUS', ticket.id);
    if (ticket.type === 'task') {
      if (!ticket.worklog || ticket.worklog.hours <= 0 || ticket.worklog.hourlyRate !== 120 || ticket.worklog.netAmount !== ticket.worklog.hours * 120) fail('TASK-WORKLOG', ticket.id);
      hours += ticket.worklog.hours; amount += ticket.worklog.netAmount;
    } else if (ticket.worklog !== null) fail('ELTERN-WORKLOG', ticket.id);
  }
  if (hours !== 78 || amount !== 9360 || exportData.reconciliation?.actualHours !== 78 || exportData.reconciliation?.actualNetAmount !== 9360) fail('RECONCILIATION', `${hours}/${amount}`);
  const requiredPlaythroughFields = ['navigation', 'input', 'documents', 'postings', 'controls', 'defect', 'correction', 'retest', 'evidence'];
  if ((exportData.playthroughs ?? []).length !== 7) fail('PLAYTHROUGH-ANZAHL', String(exportData.playthroughs?.length ?? 0));
  for (const playthrough of exportData.playthroughs ?? []) {
    for (const field of requiredPlaythroughFields) if (playthrough[field] === undefined || (Array.isArray(playthrough[field]) && playthrough[field].length === 0)) fail('PLAYTHROUGH-FELD', `${playthrough.id}/${field}`);
    if (playthrough.retest !== 'bestanden-synthetisch' || !fileExists(playthrough.evidence)) fail('PLAYTHROUGH-RETEST', playthrough.id);
  }
  if (exportData.gates?.syntheticDecision !== 'GO_SIMULATION' || exportData.gates?.syntheticStatus !== 'completed' || exportData.gates?.realGateStatus !== 'pending' || exportData.gates?.openP1 !== 0 || exportData.gates?.openP2 !== 0 || exportData.gates?.requiredLiveGates?.length !== 8) fail('GATE-TRENNUNG', 'Synthetische Gates und echte Live-Gates sind inkonsistent.');
  return errors;
}

if (process.argv[1]?.endsWith('validate-reference-simulation.mjs')) {
  const contract = YAML.parse(fs.readFileSync(file('project/bc-basic/reference-simulation.yaml'), 'utf8'));
  const exportData = load('exports/project-data/v1/reference-simulation.json');
  const story = JSON.parse(fs.readFileSync(file('evidence/simulation/project-story.json'), 'utf8'));
  const errors = validateReferenceSimulation(contract, exportData, story);
  if (errors.length) { console.error(`Referenzsimulationsprüfung fehlgeschlagen (${errors.length}):`); errors.forEach((error) => console.error(`- ${error}`)); process.exit(1); }
  console.log('Referenzsimulationsprüfung bestanden: 50 Tickets, 19 Worklogs/78 Stunden/9.360 EUR, 7 Playthroughs, GO_SIMULATION; echte Live-Gates pending.');
}

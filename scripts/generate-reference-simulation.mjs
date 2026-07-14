import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = process.cwd();
const sourcePath = 'project/bc-basic/reference-simulation.yaml';
const storyPath = 'evidence/simulation/project-story.json';
const outputPath = 'exports/project-data/v1/reference-simulation.json';
const readYaml = (file) => YAML.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const story = JSON.parse(fs.readFileSync(path.join(root, storyPath), 'utf8'));
const source = readYaml(sourcePath);
const assertExact = (object, allowed, label) => {
  if (!object || typeof object !== 'object' || Array.isArray(object)) throw new Error(`${label} muss ein Objekt sein.`);
  const unexpected = Object.keys(object).filter((key) => !allowed.includes(key));
  if (unexpected.length) throw new Error(`${label} enthält unerwartete Properties: ${unexpected.join(', ')}`);
  for (const key of unexpected) if (object[key] === null) throw new Error(`${label}.${key} ist null und sieht nach beschädigtem Flow-Mapping aus.`);
};
const rejectNullSplitKeys = (object, allowed, label) => {
  for (const [key, value] of Object.entries(object ?? {})) if (!allowed.includes(key) && value === null) throw new Error(`${label}.${key} ist ein null-valued Unexpected-Property; mögliches unquoted Flow-Mapping.`);
};
const phaseKeys = ['id', 'code', 'title', 'plannedHours', 'syntheticResult'];
const meetingKeys = ['id', 'path', 'phase'];
const playthroughKeys = ['id', 'title', 'evidence', 'navigation', 'input', 'documents', 'postings', 'controls', 'defect', 'correction', 'retest'];
const ticketKeys = ['id', 'type', 'summary', 'description', 'deliverable', 'phaseId', 'phase', 'phaseRefs', 'code', 'title', 'order', 'start', 'end', 'epicIds', 'billable', 'billingSource', 'estimateHours', 'actualHours', 'remainingHours', 'hourlyRate', 'netAmount', 'status', 'reporter', 'assignee', 'reporterRole', 'assigneeRole', 'priority', 'parent', 'dependencies', 'labels', 'components', 'createdAt', 'startedAt', 'testedAt', 'closedAt', 'statusHistory', 'acceptanceCriteria', 'evidenceRefs', 'comments', 'worklogs', 'category', 'participants', 'meetingTranscriptRefs', 'statusReason', 'decisionRefs', 'pageRefs', 'deliverableRefs', 'childTicketIds', 'typeLabel', 'displayIconKey', 'displayColorToken', 'classification', 'worklogHours', 'customerInputs', 'customerRoles', 'consultantRoles', 'concreteSteps', 'agenda', 'expectedResult', 'specificRisk', 'handoff', 'evidenceReadback'];
const truthKeys = ['liveExecutionClaimed', 'customerApprovalClaimed', 'taxApprovalClaimed', 'productionUseClaimed', 'externalTransmissionAllowed', 'contina', 'continia', 'liveGates'];
for (const [index, phase] of (source.phases ?? []).entries()) { assertExact(phase, phaseKeys, `phases[${index}]`); rejectNullSplitKeys(phase, phaseKeys, `phases[${index}]`); }
for (const [index, meeting] of (source.meetings ?? []).entries()) { assertExact(meeting, meetingKeys, `meetings[${index}]`); rejectNullSplitKeys(meeting, meetingKeys, `meetings[${index}]`); }
for (const [index, playthrough] of (source.playthroughs ?? []).entries()) { assertExact(playthrough, playthroughKeys, `playthroughs[${index}]`); rejectNullSplitKeys(playthrough, playthroughKeys, `playthroughs[${index}]`); }
for (const [index, ticket] of (story.tickets ?? []).entries()) { assertExact(ticket, ticketKeys, `tickets[${index}]`); rejectNullSplitKeys(ticket, ticketKeys, `tickets[${index}]`); }
assertExact(source.truthBoundary, truthKeys, 'truthBoundary');
const phaseDates = { P1: ['2026-04-06', '2026-04-24'], P2: ['2026-04-27', '2026-05-22'], P3: ['2026-05-25', '2026-05-29'] };
const meetingByPhase = { P1: 'UABC-MTG-001', P2: 'UABC-MTG-002', P3: 'UABC-MTG-003' };
const pageByPhase = { P1: 'PAGE-UABC-030', P2: 'PAGE-UABC-050', P3: 'PAGE-UABC-070' };
const deliverableByPhase = { P1: 'UABC-DEL-BCB-001', P2: 'UABC-DEL-BCB-004', P3: 'UABC-DEL-BCB-009' };
const tickets = story.tickets.map((ticket) => {
  const [start, end] = phaseDates[ticket.phase] ?? phaseDates.P1;
  const task = ticket.type === 'task';
  const hours = task ? Number(ticket.estimateHours) : 0;
  const evidence = ticket.evidenceRefs?.length ? ticket.evidenceRefs : ['evidence/simulation/project-completion.yaml'];
  const pageRefs = ticket.pageRefs?.length ? ticket.pageRefs : [pageByPhase[ticket.phase] ?? 'PAGE-UABC-000'];
  const deliverableRefs = ticket.deliverableRefs?.length ? ticket.deliverableRefs : [deliverableByPhase[ticket.phase] ?? 'UABC-DEL-BCB-001'];
  const acceptance = (ticket.acceptanceCriteria ?? []).map((criterion) => ({ criterion: criterion.criterion, fulfilled: true }));
  return {
    id: ticket.id,
    type: ticket.type,
    title: ticket.title ?? ticket.summary,
    phase: ticket.phase,
    phaseId: ticket.phaseId,
    parent: ticket.parent,
    liveStatus: ticket.status,
    simulationStatus: 'completed',
    syntheticLifecycle: { createdAt: start, startedAt: start, testedAt: end, closedAt: end },
    meetingTranscriptRefs: [meetingByPhase[ticket.phase] ?? 'UABC-MTG-001'],
    pageRefs,
    deliverableRefs,
    evidenceRefs: evidence,
    acceptanceCriteria: acceptance,
    closingComment: `Synthetische Referenzsimulation für ${ticket.id}: Evidence verknüpft, Test und Retest bestanden; keine Live-Ausführung behauptet.`,
    worklog: task ? { id: `WL-${ticket.id}-SIM-20260714`, taskId: ticket.id, hours, hourlyRate: 120, netAmount: hours * 120, billable: true, source: 'ticket-estimate-simulation' } : null
  };
});
const output = {
  schemaVersion: 1,
  projectId: source.projectId,
  classification: source.classification,
  currentAuthority: source.currentAuthority,
  simulationOnly: source.simulationOnly,
  sourceContract: sourcePath,
  sourceStory: storyPath,
  truthBoundary: source.truthBoundary,
  offer: source.offer,
  phases: source.phases,
  meetings: source.meetings,
  tickets,
  playthroughs: source.playthroughs,
  gates: source.gates,
  reconciliation: {
    ticketCount: tickets.length,
    taskCount: tickets.filter((ticket) => ticket.type === 'task').length,
    worklogCount: tickets.filter((ticket) => ticket.worklog).length,
    plannedHours: source.offer.plannedHours,
    actualHours: tickets.reduce((sum, ticket) => sum + Number(ticket.worklog?.hours ?? 0), 0),
    plannedNetAmount: source.offer.plannedNetAmount,
    actualNetAmount: tickets.reduce((sum, ticket) => sum + Number(ticket.worklog?.netAmount ?? 0), 0)
  },
  generatedFrom: { commitBound: false, note: 'Nach dem finalen Fachcommit neu erzeugen und commitgebunden snapshotten.' }
};
fs.mkdirSync(path.dirname(path.join(root, outputPath)), { recursive: true });
fs.writeFileSync(path.join(root, outputPath), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Referenzsimulation erzeugt: ${output.reconciliation.ticketCount} Tickets, ${output.reconciliation.worklogCount} Worklogs, ${output.reconciliation.actualHours} Stunden/${output.reconciliation.actualNetAmount} EUR, ${output.playthroughs.length} Playthroughs.`);

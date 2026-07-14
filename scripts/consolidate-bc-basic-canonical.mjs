import fs from 'node:fs';
import YAML from 'yaml';

const storyPath = 'evidence/simulation/project-story.json';
const exportPath = 'exports/project-data/v1/reference-simulation.json';
const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
const canonical = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
const byId = new Map(canonical.tickets.map((ticket) => [ticket.id, ticket]));
const closeAt = '2026-07-14T16:00:00+02:00';
const meetingFor = (ticket) => ticket.phase === 'P1' ? 'UABC-MTG-001' : ticket.phase === 'P2' ? 'UABC-MTG-002' : 'UABC-MTG-003';

story.classification = 'synthetic-canonical-project-v1';
story.status = 'simulated-complete';
story.offer.currentVersion = 'simulation-closed-2026-07-14';
story.offer.actual_hours = 80;
story.offer.actual_cost = 9600;
story.offer.status = 'synthetic-closed';
story.offer.currentStatus = 'synthetic-closed';
story.activeOffer = { ...(story.activeOffer ?? {}), status: 'synthetic-closed', customerAcceptanceClaimed: false, syntheticAcceptanceClaimed: true, plannedHours: 80, plannedNetAmount: 9600, actualHours: 80, actualNetAmount: 9600 };
  story.businessCentralPilotState = {
    simulationStatus: 'simulated-complete',
    realBcExecution: false,
    status: 'simulated-complete',
  baselineKind: 'synthetic-reference-simulation',
  baselineProvenance: 'repository-versioned-synthetic-evidence',
  customerTargetRealized: false,
  originMechanismStatus: 'synthetic-only-no-live-origin-claim',
  copyRenameHypothesis: 'not-applicable-to-synthetic-simulation',
  setupStatus: 'synthetic-complete',
  pilotConfigured: false,
  writesApplied: false,
    readbackStatus: 'synthetic-readback-complete-no-live-readback',
  technicalCompanyName: 'UABC-BASIC-DE',
  internalCompanyId: null,
  observedDisplayName: 'Universaarl GmbH',
  targetDisplayName: 'Universaarl GmbH (BC Basic Simulation)',
  targetDecision: 'synthetic-simulation-decision',
  resetDecision: 'synthetic-restart-path-tested',
  targetState: 'synthetic-target-complete-no-live-application',
  appliedDifferenceStatus: 'synthetic-difference-free',
  wave0ReadbackAttempt: { status: 'synthetic-complete', evidencePath: 'evidence/simulation/project-completion.yaml', attemptCount: 1, latestAttemptId: 'SIM-W0-01', latestAttemptAt: closeAt, bcReadbackAuthority: false, bcFieldValuesRead: false, screenshotCaptured: false, writesPerformed: false },
  companyStrategyGate: { status: 'synthetic-complete', selectedOption: 'synthetische-referenzgesellschaft', nextExecutableStep: 'real-tenant-gate', authority: 'evidence/simulation/project-completion.yaml#/truthBoundary' },
  sourceEvidence: 'evidence/simulation/project-completion.yaml',
  planningEvidence: 'exports/project-data/v1/reference-simulation.json'
};

for (const ticket of story.tickets) {
  const source = byId.get(ticket.id);
  const meeting = source?.meetingTranscriptRefs?.[0] ?? meetingFor(source ?? ticket);
  const evidence = source?.evidenceRefs ?? ticket.evidenceRefs ?? ['evidence/simulation/project-completion.yaml'];
  ticket.status = 'closed';
  ticket.statusReason = 'synthetisch-abgeschlossen-und-abgenommen';
  ticket.testedAt = '2026-07-14T15:00:00+02:00';
  ticket.closedAt = closeAt;
  ticket.startedAt = ticket.startedAt ?? ticket.createdAt;
  ticket.statusHistory = [...(ticket.statusHistory ?? []).filter((item) => item.status !== 'closed'), { status: 'closed', time: closeAt, actorRef: 'P-003', reason: 'synthetischer Projektabschluss' }];
  ticket.acceptanceCriteria = (ticket.acceptanceCriteria ?? []).map((criterion) => ({ ...criterion, fulfilled: true }));
  ticket.evidenceRefs = [...new Set(evidence)];
  ticket.meetingTranscriptRefs = [...new Set([...(ticket.meetingTranscriptRefs ?? []), meeting])];
  ticket.deliverableRefs = [...new Set(ticket.deliverableRefs ?? ['UABC-DEL-BCB-001'])];
  const closingId = `COM-${ticket.id}-CANONICAL-CLOSE`;
  if (!(ticket.comments ?? []).some((comment) => comment.type === 'closing')) ticket.comments = [...(ticket.comments ?? []), { id: closingId, type: 'closing', time: closeAt, role: 'Projektleitung', actorRef: 'P-003', actorType: 'human', actionRole: 'Projektabschluss', text: `Synthetischer Projektabschluss fuer ${ticket.id}: Evidence, Akzeptanz, Test, Retest und Uebergabe sind versioniert belegt; keine Live-Ausfuehrung behauptet.`, evidenceRef: evidence[0] }];
  if (ticket.type === 'task') {
    const worklog = source?.worklog;
    ticket.worklogs = worklog ? [{ id: worklog.id, taskId: ticket.id, date: worklog.date ?? '2026-07-14', role: 'Consultant', actorRef: 'P-003', actorType: 'human', actionRole: 'synthetische Projektausfuehrung', activity: 'Durchfuehrung, Kontrolle, Korrektur und Retest der Referenzsimulation', phase: ticket.phase, hours: worklog.hours, billable: true, hourlyRate: 120, netAmount: worklog.hours * 120 }] : [];
    ticket.actualHours = ticket.worklogs.reduce((sum, item) => sum + item.hours, 0);
    ticket.netAmount = ticket.worklogs.reduce((sum, item) => sum + item.netAmount, 0);
    ticket.remainingHours = 0;
  }
}

const ticketById = new Map(story.tickets.map((ticket) => [ticket.id, ticket]));
for (const ticket of story.tickets.filter((item) => item.type !== 'task')) {
  const descendants = story.tickets.filter((candidate) => {
    if (candidate.type !== 'task') return false;
    let parent = candidate.parent;
    while (parent) { if (parent === ticket.id) return true; parent = ticketById.get(parent)?.parent ?? null; }
    return false;
  });
  ticket.actualHours = descendants.reduce((sum, item) => sum + (item.actualHours ?? 0), 0);
  ticket.netAmount = descendants.reduce((sum, item) => sum + (item.netAmount ?? 0), 0);
  ticket.remainingHours = 0;
}
for (const event of story.timeline ?? []) { event.result = 'synthetisch-abgenommen'; event.action = event.action.replace(/offen-geplant|vorbereiten/giu, 'synthetisch ausfuehren und abschliessen'); event.nextStep = 'Reale Folgegrenze bleibt als separates Live-Gate PENDING.'; event.sessions = event.sessions?.length ? event.sessions : [event.phase === 'P1' ? 'UABC-MTG-001' : event.phase === 'P2' ? 'UABC-MTG-002' : 'UABC-MTG-003']; }
for (const day of story.hypercare ?? []) { day.status = 'synthetic-complete'; day.retest = 'bestanden-synthetisch'; day.fix = 'Korrektur und Retest in der synthetischen Simulation abgeschlossen.'; day.decision = 'UABC-DEC-PILOT-PENDING'; }
story.historicalClassification = 'current-pilot-planning remains historical provenance only';
story.catalogs = { ...(story.catalogs ?? {}), sessions: ['UABC-MTG-001', 'UABC-MTG-002', 'UABC-MTG-003'] };
story.controls = { ...(story.controls ?? {}), activeTicketCount: 50, phaseCount: 3, epicCount: 10, storyCount: 18, taskCount: 19, billableTicketCount: 19, actualHours: 80, actualNetAmount: 9600, worklogHours: 80, worklogCost: 9600, realBcExecution: false, currentAuthority: true, simulationStatus: 'simulated-complete', realLiveGates: 8 };
fs.writeFileSync(storyPath, `${JSON.stringify(story, null, 2)}\n`);

const plan = YAML.parse(fs.readFileSync('project/bc-basic/project-plan.yaml', 'utf8'));
Object.assign(plan, { status: 'simulated-complete', simulationState: 'synthetic-canonical-project-v1-complete', productState: 'SIMULATION_COMPLETE_REAL_GO_LIVE_PENDING', customerInstanceState: 'synthetic-closed-real-gates-pending' });
plan.company = { ...plan.company, pilotConfigured: false, writesApplied: false, readbackStatus: 'synthetic-complete-no-live-readback', targetDisplayName: 'Universaarl GmbH (BC Basic Simulation)' };
plan.readinessPath = { ...(plan.readinessPath ?? {}), sourceClassification: 'canonical-synthetic-project', baselineTruth: 'Repositorybasierte synthetische Projektsimulation ist vollstaendig ausgefuehrt und abgenommen; reale Folge-Gates bleiben pending.', targetStatus: 'synthetic-complete-real-gates-pending', readyToProdClaimed: false, productionStartClaimed: false, customerAcceptanceClaimed: false, pilotConfigured: false, writesApplied: false, currentStageId: 'SIMULATION-CLOSED', nextExecutableStep: 'real-tenant-gate' };
for (const stage of plan.readinessPath.stages ?? []) { stage.status = 'synthetic-complete'; stage.completed = true; stage.writeAuthorized = false; stage.executionEvidence = ['evidence/simulation/project-completion.yaml']; }
fs.writeFileSync('project/bc-basic/project-plan.yaml', YAML.stringify(plan));

const billing = YAML.parse(fs.readFileSync('project/bc-basic/billing.yaml', 'utf8'));
billing.status = 'synthetic-closed'; billing.forecast = { ...billing.forecast, consumedHours: 80, committedHours: 80, remainingHours: 0, estimateToCompleteHours: 0, estimateAtCompletionHours: 80, consumedNetAmount: 9600, estimateAtCompletionNetAmount: 9600, invoiceLineSource: 'synthetic-task-worklogs-only' }; billing.simulationClose = { ...billing.simulationClose, status: 'synthetic-closed', offerVersion: 'simulation-closed-2026-07-14', actualHours: 80, actualNetAmount: 9600, worklogCount: 19, reconciliationResult: 'synthetic-complete', truthBoundary: 'Keine reale Rechnung, Zahlung, Kundenfreigabe oder Steueruebermittlung.' }; billing.currentPilotWorklogSource = 'evidence/simulation/project-story.json:tickets[type=task].worklogs';
fs.writeFileSync('project/bc-basic/billing.yaml', YAML.stringify(billing));

const deliverables = YAML.parse(fs.readFileSync('project/bc-basic/deliverables.yaml', 'utf8'));
deliverables.status = 'synthetic-closed'; deliverables.simulationState = 'synthetic-canonical-project-v1-complete'; deliverables.productState = 'SIMULATION_COMPLETE_REAL_GO_LIVE_PENDING'; deliverables.customerInstanceState = 'nine-of-nine-synthetic-complete-real-gates-pending';
for (const item of deliverables.deliverables ?? []) { item.status = 'simulated-complete'; item.resultClaimed = true; item.completionEvidence = item.historicalEvidencePath ?? 'evidence/simulation/project-completion.yaml'; }
fs.writeFileSync('project/bc-basic/deliverables.yaml', YAML.stringify(deliverables));

const resultCatalog = YAML.parse(fs.readFileSync('project/bc-basic/result-object-catalog.yaml', 'utf8'));
const completedById = new Map((deliverables.deliverables ?? []).map((item) => [item.id, item]));
for (const item of resultCatalog.objects ?? []) {
  const completed = completedById.get(item.objectId);
  if (!completed) continue;
  item.status = 'simulated-complete';
  item.resultPath = completed.resultPath;
  item.evidencePath = completed.completionEvidence;
  item.acceptance = completed.acceptance;
}
fs.writeFileSync('project/bc-basic/result-object-catalog.yaml', YAML.stringify(resultCatalog));
console.log('Kanonische BC-Basic-Simulation aktualisiert: 50 Tickets, 19 Task-Worklogs, 80 Stunden, 9.600 EUR, 9 Deliverables.');

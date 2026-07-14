import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = (code, message) => { const error = new Error(`${code}: ${message}`); error.code = code; throw error; };
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const unique = (values) => new Set(values).size === values.length;

export function loadCanonical() {
  return {
    readiness: JSON.parse(fs.readFileSync(path.join(root, 'governance/production-readiness.json'), 'utf8')),
    story: JSON.parse(fs.readFileSync(path.join(root, 'evidence/simulation/project-story.json'), 'utf8')),
    spaces: YAML.parse(fs.readFileSync(path.join(root, 'project/bc-basic/confluence-three-space-v1.yaml'), 'utf8')),
  };
}

export function validateProductionReadiness({ readiness, story, spaces }) {
  if (readiness?.schemaVersion !== 1 || readiness?.kind !== 'universaarl-component-production-readiness' || readiness?.projectId !== 'blueprint' || readiness?.deploymentBoundary !== 'customer-source-of-truth') fail('READINESS-CONTRACT', 'Unbekannter Readiness-Vertrag.');
  if (readiness.governingChange !== 'deliver-production-ready-bc-basic-onboarding') fail('READINESS-CHANGE', 'Falscher OpenSpec-Change.');
  const r = readiness.assessments;
  const allowedKinds = {
    platformReady: ['test-report', 'operator-guide', 'release-evidence', 'security-boundary', 'platform-matrix'],
    onboardingReady: ['onboarding-runbook', 'input-contract', 'profile-proof', 'recovery-proof', 'source-register', 'readiness-validation'],
    customerGoLiveReady: ['real-tenant', 'real-licenses', 'real-permissions', 'real-uat', 'real-cutover', 'real-first-close', 'real-vat-submission', 'real-support-handover'],
  };
  const safePath = /^(?![A-Za-z]:)(?![\\/])(?!.*(?:^|[\\/])\.\.(?:[\\/]|$))(?!.*\.env)(?!.*(?:key|pem|pfx|authstate|browser-profile))[A-Za-z0-9._/ -]+$/i;
  const allowedTextPath = /\.(?:md|ya?ml|json|txt|csv)$/i;
  for (const name of Object.keys(allowedKinds)) {
    const assessment = r?.[name];
    if (!assessment || !['passed', 'pending', 'failed'].includes(assessment.status) || !['repository', 'real', 'none'].includes(assessment.evidenceMode) || !Array.isArray(assessment.evidence) || !Array.isArray(assessment.blockers)) fail('READINESS-ASSESSMENT', `${name} ist unvollständig.`);
    for (const evidence of assessment.evidence) {
      if (!allowedKinds[name].includes(evidence.kind)) fail('READINESS-EVIDENCE-KIND', `${name} enthält einen unzulässigen Evidence-Kind.`);
      if (evidence.path === 'governance/production-readiness.json') fail('READINESS-EVIDENCE-SELF', `${name} darf den Readiness-Vertrag nicht als eigene Evidence verwenden.`);
      if (!safePath.test(evidence.path) || !exists(evidence.path) || !fs.statSync(path.join(root, evidence.path)).isFile()) fail('READINESS-EVIDENCE-PATH', `${name} enthält einen unsicheren oder fehlenden Evidence-Pfad.`);
      if (name === 'customerGoLiveReady' && !allowedTextPath.test(evidence.path)) fail('READINESS-EVIDENCE-BINARY', 'Reale Kunden-Evidence muss eine freigegebene Textdatei sein.');
    }
  }
  for (const name of ['platformReady', 'onboardingReady']) if (r[name].status !== 'passed' || r[name].evidenceMode !== 'repository' || !r[name].evidence.length || r[name].blockers.length) fail('READINESS-PREPARED', `${name} muss belegt und blockerfrei passed sein.`);
  const realKinds = allowedKinds.customerGoLiveReady;
  const realEvidenceKinds = new Set(r.customerGoLiveReady.evidence.map((item) => item.kind));
  const completeRealEvidence = realKinds.every((kind) => realEvidenceKinds.has(kind));
  if (r.customerGoLiveReady.status === 'passed' && (r.customerGoLiveReady.evidenceMode !== 'real' || !completeRealEvidence || r.customerGoLiveReady.blockers.length)) fail('READINESS-LIVE-TRUTH', 'Passed/real benötigt alle acht realen Evidence-Arten und null Blocker.');
  if (r.customerGoLiveReady.status !== 'passed' && (!['pending', 'failed'].includes(r.customerGoLiveReady.status) || r.customerGoLiveReady.blockers.length === 0)) fail('READINESS-LIVE-TRUTH', 'Ohne vollständige reale Evidence muss Kunden-Go-live pending/failed mit Blockern bleiben.');
  const distribution = readiness.distribution;
  if (!distribution || !['internal-only', 'public'].includes(distribution.status) || !['pending', 'approved', 'rejected'].includes(distribution.licenseDecision) || !Array.isArray(distribution.evidence)) fail('READINESS-DISTRIBUTION', 'Distribution ist strukturell ungültig.');
  if (distribution.licenseDecision === 'pending' && (distribution.status !== 'internal-only' || distribution.evidence.length !== 0)) fail('READINESS-DISTRIBUTION', 'Ohne Lizenzentscheidung ist nur internal-only ohne Distribution-Evidence zulässig.');
  if (readiness.referenceSimulation?.status !== 'SIMULATED_COMPLETE') fail('READINESS-SIMULATION', 'Referenzsimulation muss explizit abgeschlossen sein.');
  for (const key of ['liveExecutionClaimed', 'customerApprovalClaimed', 'taxApprovalClaimed', 'productionUseClaimed', 'externalTransmissionAllowed']) if (readiness.truthBoundary?.[key] !== false) fail('READINESS-TRUTH', `${key} muss false sein.`);
  if (readiness.truthBoundary?.continia !== 'out-of-scope') fail('READINESS-CONTINIA', 'Continia muss außerhalb des Pilots bleiben.');

  const commercial = readiness.commercial;
  if (commercial?.plannedBillableHours !== 80 || commercial?.hourlyRate !== 120 || commercial?.plannedNetAmount !== 9600) fail('READINESS-BUDGET', 'Plan muss 80 Stunden zu 120 EUR und 9.600 EUR netto betragen.');
  if (commercial.plannedNetAmount >= commercial.ceilingNetAmount || commercial.ceilingNetAmount !== 10000) fail('READINESS-BUDGET', 'Der Plan muss strikt unter 10.000 EUR bleiben.');
  if (commercial.billingSource !== 'billable-task-worklogs-only' || commercial.billingCadence !== 'ISO-Woche') fail('READINESS-BILLING', 'Abrechnung muss wöchentlich und ausschließlich aus Task-Worklogs entstehen.');
  if ((readiness.phases || []).reduce((sum, phase) => sum + phase.plannedHours, 0) !== 80) fail('READINESS-PHASE-HOURS', 'Phasenstunden müssen 80 ergeben.');

  const tickets = story?.tickets || [];
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  if (!unique(tickets.map((ticket) => ticket.id)) || tickets.some((ticket) => !/^UABC-\d+$/.test(ticket.id))) fail('READINESS-TICKET-ID', 'Tickets brauchen eindeutige UABC-IDs.');
  for (const ticket of tickets) {
    const worklogs = ticket.worklogs || [];
    if (ticket.type === 'task') {
      if (ticket.billable !== true) fail('READINESS-TASK-BILLABLE', `${ticket.id} muss abrechenbar sein.`);
      if (!ticket.parent || !['story', 'bug'].includes(byId.get(ticket.parent)?.type)) fail('READINESS-TASK-PARENT', `${ticket.id} braucht eine Story oder einen Fehler als Parent.`);
      if (!ticket.deliverableRefs?.length) fail('READINESS-DELIVERABLE', `${ticket.id} braucht ein Deliverable.`);
    } else if (ticket.billable !== false || worklogs.length) fail('READINESS-PARENT-WORKLOG', `${ticket.id} darf kein fakturierbares Worklog besitzen.`);
    if (ticket.type === 'phase' && ticket.parent !== null) fail('READINESS-PHASE-PARENT', `${ticket.id} darf keinen Parent besitzen.`);
    if (ticket.type === 'epic' && byId.get(ticket.parent)?.type !== 'phase') fail('READINESS-EPIC-PARENT', `${ticket.id} braucht eine Phase.`);
    if (ticket.type === 'story' && byId.get(ticket.parent)?.type !== 'epic') fail('READINESS-STORY-PARENT', `${ticket.id} braucht ein Epic.`);
  }
  const worklogs = tickets.flatMap((ticket) => (ticket.worklogs || []).map((worklog) => ({ ticket, worklog })));
  if (!unique(worklogs.map(({ worklog }) => worklog.worklogId || worklog.id))) fail('READINESS-WORKLOG-DUPLICATE', 'Worklogs dürfen nicht doppelt sein.');
  const actualHours = worklogs.reduce((sum, { worklog }) => sum + Number(worklog.hours || 0), 0);
  if (actualHours < 0 || actualHours > 80) fail('READINESS-ACTUAL-HOURS', 'Iststunden müssen aus Task-Worklogs stammen.');
  const coverage = readiness.ticketTranscriptCoverage || [];
  const coveredIds = coverage.flatMap((group) => group.ticketIds || []);
  if (!unique(coveredIds) || coveredIds.length !== tickets.length || tickets.some((ticket) => !coveredIds.includes(ticket.id))) fail('READINESS-TRANSCRIPT', 'Jedes Ticket braucht genau eine fachlich begründete Transkriptabdeckung.');
  for (const group of coverage) if (!group.rationale || !exists(group.transcriptPath) || !group.ticketIds.every((id) => byId.get(id)?.phaseId === group.phaseId || id === group.phaseId)) fail('READINESS-TRANSCRIPT', 'Transkriptabdeckung ist fachlich oder referenziell unvollständig.');

  const requiredGates = ['UABC-GATE-LIVE-TENANT', 'UABC-GATE-LIVE-LICENSES', 'UABC-GATE-LIVE-SECURITY', 'UABC-GATE-LIVE-UAT', 'UABC-GATE-LIVE-CUTOVER', 'UABC-GATE-LIVE-CLOSE', 'UABC-GATE-LIVE-TAX', 'UABC-GATE-LIVE-SUPPORT'];
  const gates = new Map((readiness.deliveryGates || []).map((gate) => [gate.id, gate]));
  for (const id of requiredGates) if (gates.get(id)?.status !== 'PENDING' || !realKinds.includes(gates.get(id)?.evidenceKind)) fail('READINESS-LIVE-GATE', `${id} muss beweispflichtig offen bleiben.`);
  if (!readiness.businessContinuity?.restoreProbeRequired || readiness.businessContinuity.checksAfterRestore?.length < 6) fail('READINESS-RESTORE', 'Restore-Probe und Nachkontrollen fehlen.');
  if (!readiness.security?.controls?.includes('Least Privilege') || !readiness.security?.controls?.includes('Notfallzugang')) fail('READINESS-SECURITY', 'Least Privilege und Notfallzugang fehlen.');
  if (!readiness.customerInputs?.protectedTransferRequired || readiness.customerInputs?.publicRepositoryDataAllowed !== false) fail('READINESS-DATA-TRANSFER', 'Kundendaten brauchen einen geschützten Weg.');
  if (!readiness.migration?.prohibitedImports?.includes('G/L Entry') || !readiness.migration?.controlledPosting?.includes('Lageranfangsbestand')) fail('READINESS-MIGRATION', 'Ledger-Ausschluss und kontrollierte Eröffnung fehlen.');

  if (spaces?.spaceCount !== 3 || spaces?.spaces?.length !== 3) fail('READINESS-SPACES', 'Genau drei Wissensräume sind erforderlich.');
  const customerRoots = (spaces.roots || []).filter((item) => item.spaceId === 'UABC-SPACE-CUSTOMER').map((item) => item.title);
  for (const title of ['00 Hilfe und Projektumgebung', '01 Unternehmen', '02 Business Central', '03 Projekte', '04 Handbuecher', '99 Archiv']) if (!customerRoots.includes(title)) fail('READINESS-SPACE-ROOT', `Kundenroot ${title} fehlt.`);

  const a = readiness.artifacts;
  const artifactPaths = [readiness.customerInputs.templatePath, a.deliverableRegister, ...a.transcripts, ...a.acceptance, ...a.training, ...a.cutover, ...a.hypercare, ...a.support, a.customerHandbook, a.consultantHandbook, a.weeklyBillingBasis, a.deliveryEvidenceTemplate, ...readiness.referenceSimulation.evidence];
  for (const relativePath of artifactPaths) if (!relativePath || !exists(relativePath)) fail('READINESS-ARTIFACT', `Artefakt fehlt: ${relativePath}`);
  const deliverables = YAML.parse(fs.readFileSync(path.join(root, a.deliverableRegister), 'utf8'));
  if (deliverables.deliverables?.length !== a.requiredDeliverableCount) fail('READINESS-DELIVERABLE-COUNT', 'Neun Lieferobjekte müssen referenziert sein.');

  const categories = new Set(readiness.sources?.truthCategories || []);
  for (const category of ['BC-Standard', 'Projektentscheidung', 'synthetischer Wert', 'offene Steuer-/Lokalisierungsentscheidung']) if (!categories.has(category)) fail('READINESS-SOURCE-CATEGORY', `Quellenkategorie fehlt: ${category}`);
  const urls = new Set((readiness.sources?.primary || []).map((source) => source.url));
  for (const url of ['https://learn.microsoft.com/en-us/dynamics365/business-central/setup','https://learn.microsoft.com/en-us/dynamics365/business-central/finance-posting-groups','https://learn.microsoft.com/en-us/dynamics365/business-central/finance-setup-vat','https://learn.microsoft.com/en-us/dynamics365/business-central/finance-how-report-vat','https://learn.microsoft.com/en-us/dynamics365/business-central/ui-how-users-permissions','https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/environment-types','https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/tenant-admin-center-backup-restore','https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/set-up-standard-company-configuration-packages']) if (!urls.has(url)) fail('READINESS-SOURCE', `Primärquelle fehlt: ${url}`);

  return { ticketCount: tickets.length, taskCount: tickets.filter((ticket) => ticket.type === 'task').length, worklogCount: worklogs.length, actualHours, plannedHours: 80, plannedNetAmount: 9600, deliverableCount: deliverables.deliverables.length, transcriptCount: a.transcripts.length, spaceCount: spaces.spaceCount, liveGateCount: requiredGates.length, sourceCount: readiness.sources.primary.length };
}

if (process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  try { const x = validateProductionReadiness(loadCanonical()); console.log(`BC-Basic-Readiness gültig: ${x.ticketCount} Tickets, ${x.taskCount} Tasks, ${x.worklogCount} Worklogs/${x.actualHours} h Ist, ${x.plannedHours} h/${x.plannedNetAmount} EUR Plan, ${x.deliverableCount} Deliverables, ${x.transcriptCount} Transkripte, ${x.spaceCount} Spaces, ${x.liveGateCount} offene Live-Gates, ${x.sourceCount} Primärquellen.`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

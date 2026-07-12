import crypto from 'node:crypto';
import fs from 'node:fs';
import YAML from 'yaml';

const CONFIG = 'project/bc-basic/atlassian-materialization-v1.yaml';
const STORY = 'evidence/simulation/project-story.json';
const TICKETS = 'atlassian/jira/issues/bc-basic-story-tickets.yaml';
const RESULT_OBJECTS = 'project/bc-basic/result-object-catalog.yaml';
const DELIVERABLES = 'project/bc-basic/deliverables.yaml';
const PLAN = 'project/bc-basic/project-plan.yaml';
const BILLING = 'project/bc-basic/billing.yaml';
const OUTPUT = 'evidence/simulation/atlassian-materialization-dry-run.json';

const canonical = (value) => `${JSON.stringify(value, null, 2)}\n`;
const digest = (value) => crypto.createHash('sha256').update(canonical(value)).digest('hex');
const fail = (errors, code, detail) => errors.push(`${code}: ${detail}`);

export function buildMaterialization({ config, story, ticketCatalog, resultCatalog, deliverables, projectPlan, billing }) {
  const errors = [];
  if (config?.sourceMode !== 'repository-quelle' || config?.executionMode !== 'nur-trockenlauf' || config?.liveMutationAuthorized !== false || config?.rovoAuthorized !== false) fail(errors, 'MATERIALISIERUNG-LIVE-VERBOT', 'nur lokaler Trockenlauf aus der Repositoryquelle ist zulaessig');
  const spaces = config?.targets?.confluence?.spaces ?? [];
  if (spaces.length !== 3 || new Set(spaces.map((space) => space.spaceId)).size !== 3) fail(errors, 'MATERIALISIERUNG-SPACE', 'exakt drei eindeutige Zielspaces sind erforderlich');
  if (spaces.some((space) => space.spaceKey !== null)) fail(errors, 'MATERIALISIERUNG-EXTERN-ID', 'unbelegte Space-Keys sind unzulaessig');
  const pages = story?.pages ?? [];
  const tickets = ticketCatalog?.ticketRecords ?? [];
  if (JSON.stringify((projectPlan?.phases ?? []).map((phase) => phase.id)) !== JSON.stringify(['UABC-1','UABC-2','UABC-3']) || (projectPlan?.phases ?? []).some((phase) => phase.id !== phase.jiraRef)) fail(errors, 'PROJEKTPLAN-PHASE', 'Projektplan und Jira muessen dieselben Phase-Tickets UABC-1/2/3 verwenden');
  if (projectPlan?.schedule?.timelineAuthority !== 'reference-simulation-april-may-2026' || projectPlan?.schedule?.customerTemplateStatus !== 'illustrative-not-current') fail(errors, 'PROJEKTPLAN-ZEITACHSE', 'Referenzsimulation und illustratives Kundenfenster sind nicht eindeutig getrennt');
  const taskHours = tickets.filter((ticket) => ticket.type === 'task').reduce((sum, ticket) => sum + Number(ticket.worklogHours ?? 0), 0);
  const forecast = billing?.forecast;
  if (taskHours !== 80 || forecast?.countingRule !== 'billable-task-worklogs-only' || forecast?.plannedHours !== 80 || forecast?.consumedHours !== taskHours || forecast?.remainingHours !== 0 || forecast?.estimateToCompleteHours !== 0 || forecast?.estimateAtCompletionHours !== 80 || forecast?.plannedNetAmount !== 9600 || forecast?.consumedNetAmount !== 9600 || forecast?.estimateAtCompletionNetAmount !== 9600 || forecast?.parentBillingLines !== false) fail(errors, 'BUDGET-FORECAST', 'Forecast muss ausschliesslich 80 Taskstunden und 9.600 EUR ohne Elternabrechnung ausweisen');
  const customerDeliverables = (resultCatalog?.objects ?? []).filter((item) => item.classification === 'customer-deliverable');
  if (customerDeliverables.length !== 9 || deliverables?.deliverables?.length !== 9) fail(errors, 'ERGEBNISOBJEKT-ABDECKUNG', 'exakt neun Kundendeliverables muessen klassifiziert sein');
  const resultById = new Map(customerDeliverables.map((item) => [item.objectId, item]));
  for (const deliverable of deliverables?.deliverables ?? []) {
    const result = resultById.get(deliverable.id);
    if (!result || deliverable.objectClass !== 'customer-deliverable' || !deliverable.resultPath || !deliverable.acceptance || result.resultPath !== deliverable.resultPath || result.evidencePath !== deliverable.completionEvidence) fail(errors, 'ERGEBNISOBJEKT-VERTRAG', `${deliverable.id}: lesbares Ergebnis, Evidence oder Abnahme fehlt`);
  }
  if ((resultCatalog?.objects ?? []).some((item) => item.classification === 'technical-source' && item.objectId.startsWith('UABC-DEL-'))) fail(errors, 'ERGEBNISOBJEKT-KLASSIFIKATION', 'technische Quelle darf kein Kundendeliverable sein');
  const pageIds = new Set();
  const ticketIds = new Set();
  for (const page of pages) {
    if (pageIds.has(page.id)) fail(errors, 'MATERIALISIERUNG-DUPLIKAT', page.id);
    pageIds.add(page.id);
  }
  for (const ticket of tickets) {
    if (ticketIds.has(ticket.id)) fail(errors, 'MATERIALISIERUNG-DUPLIKAT', ticket.id);
    ticketIds.add(ticket.id);
  }
  for (const page of pages) if (page.parent !== null && !pageIds.has(page.parent)) fail(errors, 'MATERIALISIERUNG-PARENT', `${page.id} -> ${page.parent}`);
  for (const ticket of tickets) if (ticket.parent !== null && !ticketIds.has(ticket.parent)) fail(errors, 'MATERIALISIERUNG-PARENT', `${ticket.id} -> ${ticket.parent}`);
  const decisions = ['create', 'update', 'skip', 'conflict'];
  const operations = [
    ...pages.map((page) => ({ objectType: 'confluence-page', sourceId: page.id, sourcePath: page.sourcePath, targetContainerId: page.spaceId, parentSourceId: page.parent, externalId: null, decision: 'create', sourceDigest: digest(page) })),
    ...tickets.map((ticket) => ({ objectType: 'jira-ticket', sourceId: ticket.id, sourcePath: TICKETS, targetContainerId: config.targets.jira.projectKey, parentSourceId: ticket.parent, externalId: null, decision: 'create', sourceDigest: digest(ticket) }))
  ];
  if (operations.some((item) => !decisions.includes(item.decision))) fail(errors, 'MATERIALISIERUNG-ENTSCHEIDUNG', 'unbekannte Entscheidung');
  if (operations.length !== pages.length + tickets.length) fail(errors, 'MATERIALISIERUNG-ABDECKUNG', 'nicht alle Quellen wurden projiziert');
  const sourceIds = new Set(operations.map((item) => item.sourceId));
  if (sourceIds.size !== operations.length) fail(errors, 'MATERIALISIERUNG-DUPLIKAT', 'Quell-ID ist ueber Domains nicht eindeutig');
  if (errors.length) return { errors, output: null };
  const payload = {
    schemaVersion: 1,
    matrixId: config.matrixId,
    projectId: config.projectId,
    generatedFrom: [CONFIG, STORY, TICKETS, RESULT_OBJECTS, DELIVERABLES, PLAN, BILLING],
    mode: 'nur-trockenlauf',
    executable: false,
    blocker: 'Atlassian-Ziel-IDs, Secret-Referenz und ausdrueckliche Live-Freigabe fehlen.',
    counts: { spaces: spaces.length, pages: pages.length, tickets: tickets.length, operations: operations.length, create: operations.length, update: 0, skip: 0, conflict: 0 },
    operations,
    projectionDigest: digest(operations),
    validationStatus: 'validated'
  };
  return { errors: [], output: payload };
}

export function loadSources() {
  return {
    config: YAML.parse(fs.readFileSync(CONFIG, 'utf8')),
    story: JSON.parse(fs.readFileSync(STORY, 'utf8')),
    ticketCatalog: YAML.parse(fs.readFileSync(TICKETS, 'utf8'))
    ,resultCatalog: YAML.parse(fs.readFileSync(RESULT_OBJECTS, 'utf8'))
    ,deliverables: YAML.parse(fs.readFileSync(DELIVERABLES, 'utf8'))
    ,projectPlan: YAML.parse(fs.readFileSync(PLAN, 'utf8'))
    ,billing: YAML.parse(fs.readFileSync(BILLING, 'utf8'))
  };
}

if (process.argv[1]?.endsWith('generate-atlassian-materialization.mjs')) {
  const { errors, output } = buildMaterialization(loadSources());
  if (errors.length) {
    console.error(`Atlassian-Materialisierungs-Dry-run fehlgeschlagen (${errors.length}):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  if (process.argv.includes('--write')) fs.writeFileSync(OUTPUT, canonical(output), 'utf8');
  console.log(`Atlassian-Materialisierungs-Dry-run bestanden: ${output.counts.spaces} Spaces, ${output.counts.pages} Seiten, ${output.counts.tickets} Tickets, ${output.counts.operations} Create-Entscheidungen, 0 Live-Mutationen.`);
}

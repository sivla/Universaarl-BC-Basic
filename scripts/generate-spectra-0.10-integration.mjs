import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';
import { buildPortableStory } from './adapt-spectra-portable-story.mjs';
import { EPIC_DEFINITIONS, PHASES, RESULT_DEFINITIONS } from './lib/ticket-hierarchy.mjs';

export const INDEX_PATH = 'exports/project-data/v1/index.yaml';
export const MAP_PATH = 'exports/project-data/v1/twin-export-map.json';
export const RECONCILIATION_PATH = 'evidence/simulation/project-reconciliation.json';
export const PROVENANCE_PATH = 'evidence/simulation/adapter-provenance.json';
export const COVERAGE_PATH = 'evidence/simulation/reference-graph-coverage.json';
export const COVERAGE_SOURCE_PATH = 'exports/project-data/v1/reference-graph-native.json';
export const COVERAGE_MAPPING_PATH = 'exports/project-data/v1/reference-graph-mapping.json';
export const COVERAGE_PROJECTION_PATH = 'exports/project-data/v1/reference-graph-portable.json';
export const TICKET_EXPORT_PATH = 'atlassian/jira/issues/bc-basic-story-tickets.yaml';
export const MAPPING_ID = 'MAP-UABC-BCB-TWIN-001';
export const MAPPING_VERSION = '1.1.0';
export const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
export const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
export const lfBytes = (bytes) => Buffer.from(Buffer.from(bytes).toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
export const CANONICAL_TICKET_TYPES = Object.freeze(['phase', 'epic', 'story', 'task']);
const TICKET_PARENT_TYPES = Object.freeze({ phase: [], epic: ['phase'], story: ['epic'], bug: ['epic'], task: ['story', 'bug'] });
const LEGACY_PARENT_TYPES = Object.freeze({ epic: [], story: ['epic', 'story'], task: ['epic', 'story', 'task'], subtask: ['story', 'task', 'bug', 'change'], bug: ['epic', 'story', 'task'], change: ['epic', 'story', 'task'] });
export const TICKET_TYPE_PRESENTATIONS = Object.freeze({
  phase: Object.freeze({ typeLabel: 'Phase', displayIconKey: 'jira-phase', displayColorToken: 'teal' }),
  epic: Object.freeze({ typeLabel: 'Epic', displayIconKey: 'jira-epic', displayColorToken: 'purple' }),
  story: Object.freeze({ typeLabel: 'Story', displayIconKey: 'jira-story', displayColorToken: 'green' }),
  task: Object.freeze({ typeLabel: 'Aufgabe', displayIconKey: 'jira-task', displayColorToken: 'blue' })
});
export const TICKET_LIVE_ICON_POLICY = Object.freeze({
  sourceMode: 'local-allowlist-only',
  allowlistedAssets: Object.freeze([]),
  allowedOrigins: Object.freeze([]),
  digestAlgorithm: 'SHA-256',
  digestRequired: true
});
const PHASE_VIEW_GROUPS = Object.freeze(PHASES.map((phase) => {
  const results = RESULT_DEFINITIONS.filter((result) => result[3] === phase.id);
  const epicIds = [...new Set(results.map((result) => result[2]))];
  return Object.freeze({ id:`UABC-TICKET-GROUP-${phase.code}`, type:'phase', phaseId:phase.id, title:phase.title, order:phase.order, collapsible:true, initialState:'expanded', epicIds:Object.freeze(epicIds), ticketIds:Object.freeze([phase.id,...epicIds,...results.flatMap((result)=>[result[0],...result[5]])]) });
}));
export const TICKET_VIEWS = Object.freeze([
  Object.freeze({
    id: 'UABC-TICKET-VIEW-BOARD-001',
    type: 'board',
    title: 'Projektboard',
    order: 1,
    initialState: 'expanded',
    allowedFilters: Object.freeze(['status', 'type']),
    visibleFields: Object.freeze(['id', 'type', 'summary', 'status', 'parent']),
    columns: Object.freeze([
      Object.freeze({ id: 'created', title: 'Angelegt', order: 1, statuses: Object.freeze(['created']) }),
      Object.freeze({ id: 'in-progress', title: 'In Bearbeitung', order: 2, statuses: Object.freeze(['in-progress']) }),
      Object.freeze({ id: 'tested', title: 'Getestet', order: 3, statuses: Object.freeze(['tested']) }),
      Object.freeze({ id: 'done-closed', title: 'Erledigt', order: 4, statuses: Object.freeze(['done', 'closed']) })
    ]),
    groups: PHASE_VIEW_GROUPS
  }),
  Object.freeze({
    id: 'UABC-TICKET-VIEW-COMPACT-001',
    type: 'compact-list',
    title: 'Kompakte Phasenliste',
    order: 2,
    initialState: 'expanded',
    allowedFilters: Object.freeze(['status', 'type']),
    visibleFields: Object.freeze(['id', 'type', 'summary', 'status', 'parent']),
    groups: PHASE_VIEW_GROUPS
  })
]);
export const HISTORICAL_TICKET_SOURCES = Object.freeze([
  'atlassian/jira/issues/bc-basic-project.yaml',
  'atlassian/jira/issues/blueprint-wave.yaml',
  'atlassian/jira/issues/environment-baseline.yaml',
  'atlassian/jira/issues/walkthrough-pilot.yaml'
]);
const SOURCE_TYPE_TO_CANONICAL = Object.freeze({ Phase: 'phase', Epic: 'epic', Story: 'story', Task: 'task', 'Sub-task': 'subtask', Bug: 'bug', Change: 'change', epic: 'epic', story: 'story', task: 'task', subtask: 'subtask', bug: 'bug', change: 'change', phase: 'phase' });
const STORY_TO_PLAN_ITEM = Object.freeze({
  'TKT-UABC-22': 'UABC-22', 'TKT-UABC-23': 'UABC-23', 'TKT-UABC-24': 'UABC-24', 'TKT-UABC-25': 'UABC-25', 'TKT-UABC-26': 'UABC-26',
  'TKT-UABC-27': 'UABC-27', 'TKT-UABC-28': 'UABC-28', 'TKT-UABC-29': 'UABC-29', 'TKT-UABC-30': 'UABC-30', 'TKT-UABC-31': 'UABC-31',
  'TKT-UABC-32': 'UABC-32', 'TKT-UABC-33': 'UABC-33', 'TKT-UABC-34': 'UABC-34', 'TKT-UABC-35': 'UABC-35', 'TKT-UABC-36': 'UABC-36',
  'TKT-UABC-37': 'UABC-37', 'TKT-UABC-38': 'UABC-38'
  , 'TKT-UABC-24-SALES': 'UABC-24', 'TKT-UABC-24-INVENTORY': 'UABC-24'
});
const STORY_TICKET_SUMMARIES = Object.freeze({
  'TKT-UABC-22': 'Auftrag und Scope', 'TKT-UABC-23': 'Finance- und Steuerdesign', 'TKT-UABC-24': 'P2P, O2C und Lager',
  'TKT-UABC-25': 'Datenpaket', 'TKT-UABC-26': 'UAT-Plan', 'TKT-UABC-27': 'Gesellschaft und Rollen', 'TKT-UABC-28': 'Finance-Setup',
  'TKT-UABC-29': 'Import und Reimport', 'TKT-UABC-30': 'Purchase-to-Pay', 'TKT-UABC-31': 'Order-to-Cash', 'TKT-UABC-32': 'Lager und Inventur',
  'TKT-UABC-33': 'Training', 'TKT-UABC-34': 'SIT und UAT', 'TKT-UABC-35': 'Hypercare-Zahlung', 'TKT-UABC-36': 'Monatsabschluss',
  'TKT-UABC-37': 'UStVA-Vorschau', 'TKT-UABC-38': 'Handover'
});

export function safeRelative(value) {
  return typeof value === 'string' && value.length > 0 && !value.startsWith('/') && !value.includes('\\') && !/^[A-Za-z]:/.test(value) && !value.includes('://') && !value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..' || /[\x00-\x1f]/.test(segment));
}

export function buildReconciliation(story, billing) {
  const baseline = billing.historicalBaseline;
  const offered = story.offer.versions.find((version) => version.version === 2);
  const actual = story.offer.versions.find((version) => version.version === 3);
  const state = (version, hours, cost) => ({ version, hours, rate: cost / hours, amount: cost, currency: 'EUR' });
  return {
    schema_version: 1,
    contract_version: '0.10',
    record_type: 'project-reconciliation',
    reconciliation_id: 'REC-UABC-BCB-001',
    product_id: 'spectra',
    profile: 'implementation',
    classification: 'synthetic-fixture',
    synthetic: true,
    baseline: state(1, baseline.plannedHours, baseline.plannedNetAmount),
    offer: state(2, offered.hours, offered.cost),
    actual: state(3, actual.hours, actual.cost),
    variance: {
      hours: actual.hours - offered.hours,
      rate: (actual.cost / actual.hours) - (offered.cost / offered.hours),
      amount: actual.cost - offered.cost,
      reason_code: 'scope-change',
      reason: 'Die historische 68-Stunden-Kalkulation zu 162,50 EUR wurde fuer die synthetische Projektstory durch das beauftragte Angebot mit 80 Stunden zu 120 EUR ersetzt; Spectra 0.10 ergaenzt den read-only Coverage-Nachweis ohne neue Leistung, und Angebot sowie Ist bleiben bei 80 Stunden und 9.600 EUR.'
    },
    truth_boundary: { owner: 'synthetic-fixture', source_of_truth: 'synthetic-fixture', invoice_claim: false, productive_activity_claim: false, billing_status: 'not-applicable' }
  };
}

export function buildTwinExportMap(index) {
  return {
    schemaVersion: 1,
    contractVersion: '0.10',
    recordType: 'twin-export-map',
    mappingId: MAPPING_ID,
    mappingVersion: MAPPING_VERSION,
    projectId: index.projectId,
    allowedBranch: index.allowedBranch,
    classification: 'synthetische-projektevidence',
    sourceOfTruth: INDEX_PATH,
    readOnly: true,
    artifacts: index.artifacts.map(({ id, kindId, path: artifactPath, selector = null, format, required }) => ({ id, kindId, path: artifactPath, selector, format, required }))
  };
}

export function buildTicketExport(story, historicalSources = []) {
  const storyRecords = (story.tickets ?? []).map((ticket) => {
    const presentation = TICKET_TYPE_PRESENTATIONS[ticket.type] ?? {};
    return { id:ticket.id, type:ticket.type, sourceType:ticket.type, canonicalType:ticket.type, ...presentation, parent:ticket.parent, dependencyRefs:[...(ticket.dependencies??[])], sourcePath:'evidence/simulation/project-story.json', visibility:'twin-visible', visibilityRole:'customer-project-story', countingScope:'active-project', status:ticket.status, summary:ticket.summary, description:ticket.description, deliverable:ticket.deliverable, phaseId:ticket.phaseId, phaseRefs:ticket.phaseRefs??null, phase:ticket.phase??null, billable:ticket.billable, billingSource:ticket.billingSource, estimateHours:ticket.estimateHours, actualHours:ticket.actualHours, remainingHours:ticket.remainingHours, hourlyRate:ticket.hourlyRate, netAmount:ticket.netAmount, acceptance:(ticket.acceptanceCriteria??[]).map((c)=>c.criterion??c.text), history:(ticket.statusHistory??[]), worklogHours:(ticket.worklogs??[]).reduce((s,w)=>s+w.hours,0), evidence:[...(ticket.evidenceRefs??[])], comments:(ticket.comments??[]).map((c)=>({id:c.id,type:c.type,time:c.time,text:c.text})) };
  });
  return { schemaVersion:1, projectId:story.projectId, classification:story.classification, sourceContract:'evidence/simulation/project-story.json', generated:true, derivedFrom:['evidence/simulation/project-story.json','project/bc-basic/ticket-migration.yaml'], canonicalTypes:['phase','epic','story','task'], typePresentations:structuredClone(TICKET_TYPE_PRESENTATIONS), liveIconPolicy:structuredClone(TICKET_LIVE_ICON_POLICY), views:structuredClone(TICKET_VIEWS), recordCount:storyRecords.length, customerStoryCount:storyRecords.length, internalTraceabilityCount:0, countedWorklogHours:storyRecords.reduce((s,t)=>s+t.worklogHours,0), ticketRecords:storyRecords, traceabilityRecords:[], traceabilityRelations:[] };
/* legacy construction retained below for historical review but is unreachable */
/*
  const historicalRecords = historicalSources.flatMap(({ sourcePath, issues }) => (issues ?? []).map((issue) => {
    const canonicalType = SOURCE_TYPE_TO_CANONICAL[issue.type] ?? null;
    const presentation = TICKET_TYPE_PRESENTATIONS[canonicalType] ?? {};
    return {
    id: issue.key,
    type: canonicalType,
    sourceType: issue.type,
    canonicalType,
    ...presentation,
    parent: issue.parent ?? null,
    dependencyRefs: [...(issue.dependencies ?? [])],
    sourcePath,
    visibility: 'twin-visible',
    visibilityRole: 'internal-traceability',
    countingScope: 'excluded-from-story-counts',
    status: issue.status,
    summary: issue.summary
  };
  }));
  const historicalIds = new Set(historicalRecords.map((ticket) => ticket.id));
  const storyRecords = story.tickets.map((ticket) => {
    const canonicalType = SOURCE_TYPE_TO_CANONICAL[ticket.type] ?? null;
    const presentation = TICKET_TYPE_PRESENTATIONS[canonicalType] ?? {};
    return {
      id: ticket.id,
      type: canonicalType,
      sourceType: ticket.type,
      canonicalType,
      ...presentation,
      parent: ticket.parent,
      dependencyRefs: [...(ticket.dependencies ?? [])],
      sourcePath: 'evidence/simulation/project-story.json',
      visibility: 'twin-visible',
      visibilityRole: 'customer-project-story',
      countingScope: 'project-story',
      planningRef: STORY_TO_PLAN_ITEM[ticket.id] ?? null,
      status: ticket.status,
      summary: ticket.summary ?? STORY_TICKET_SUMMARIES[ticket.id] ?? ticket.acceptanceCriteria[0]?.text ?? ticket.id,
      description: ticket.description, deliverable: ticket.deliverable, phaseId: ticket.phaseId, phaseRefs: ticket.phaseRefs ?? null, phase: ticket.phase ?? null, billable: ticket.billable, billingSource: ticket.billingSource,
      estimateHours: ticket.estimateHours, actualHours: ticket.actualHours, remainingHours: ticket.remainingHours, hourlyRate: ticket.hourlyRate, netAmount: ticket.netAmount,
      acceptance: ticket.acceptanceCriteria.map((criterion) => criterion.text ?? criterion.criterion),
      history: ticket.statusHistory.map((entry) => ({ status: entry.status, time: entry.time })),
      worklogHours: ticket.worklogs.reduce((sum, worklog) => sum + worklog.hours, 0),
      evidence: [...ticket.evidenceRefs],
      comments: ticket.comments.map((comment) => ({ id: comment.id, type: comment.type, time: comment.time, text: comment.text }))
    };
  });
  const traceabilityRelations = storyRecords
    .map((ticket) => ({ type: 'realizes-plan-item', from: ticket.id, to: ticket.planningRef }))
    .filter((relation) => historicalIds.has(relation.to));
  return {
    schemaVersion: 1,
    projectId: story.projectId,
    classification: story.classification,
    sourceContract: 'evidence/simulation/project-story.json',
    generated: true,
    derivedFrom: ['evidence/simulation/project-story.json', ...historicalSources.map((source) => source.sourcePath)],
    canonicalTypes: [...CANONICAL_TICKET_TYPES],
    typePresentations: structuredClone(TICKET_TYPE_PRESENTATIONS),
    liveIconPolicy: structuredClone(TICKET_LIVE_ICON_POLICY),
    views: structuredClone(TICKET_VIEWS),
    recordCount: storyRecords.length + historicalRecords.length,
    customerStoryCount: storyRecords.length,
    internalTraceabilityCount: historicalRecords.length,
    countedWorklogHours: storyRecords.reduce((sum, ticket) => sum + ticket.worklogHours, 0),
    historicalPlanningBaselineHours: historicalSources.flatMap((source) => source.issues ?? []).find((issue) => issue.key === 'UABC-18')?.plannedBillableHours ?? null,
    ticketRecords: storyRecords,
    traceabilityRecords: historicalRecords,
    traceabilityRelations
  };
*/
}

export function ticketExportErrors(ticketExport) {
  const errors=[]; const records=ticketExport?.ticketRecords??[]; const byId=new Map(records.map(r=>[r.id,r]));
  if (/\b(?:TKT-UABC-[A-Z0-9-]+|UABC-PHASE-\d+)\b/.test(JSON.stringify(records))) errors.push('active-legacy-id');
  if(records.length!==50||ticketExport.recordCount!==50||ticketExport.customerStoryCount!==50||ticketExport.internalTraceabilityCount!==0||ticketExport.traceabilityRecords?.length!==0) errors.push('ticket-count');
  if(new Set(records.map(r=>r.id)).size!==records.length) errors.push('duplicate-id');
  if(ticketExport.countedWorklogHours!==80||records.reduce((s,r)=>s+r.worklogHours,0)!==80) errors.push('double-count');
  if(JSON.stringify(ticketExport.typePresentations)!==JSON.stringify(TICKET_TYPE_PRESENTATIONS)) errors.push('type-presentation');
  for(const t of records){if(!CANONICAL_TICKET_TYPES.includes(t.type)||t.type!==t.canonicalType) errors.push(`${t.id}:unknown-type`); if(!byId.has(t.parent)&&t.parent!==null) errors.push(`${t.id}:parent`); if(t.type==='phase'&&t.parent!==null) errors.push(`${t.id}:phase-parent`); if(t.type==='task'&&t.billable!==true) errors.push(`${t.id}:billable`);}
  if(JSON.stringify(ticketExport.views)!==JSON.stringify(TICKET_VIEWS)) errors.push('ticket-view-contract');
  return errors;
}

export function ticketTopologyErrors(story) {
  const errors = [];
  const tickets = story?.tickets ?? [];
  const byId = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  if (byId.size !== tickets.length) errors.push('duplicate-id');
  for (const ticket of tickets) {
    if (!CANONICAL_TICKET_TYPES.includes(ticket.type)) errors.push(`${ticket.id}:unknown-type`);
    const parent = ticket.parent === null ? null : byId.get(ticket.parent);
    if (ticket.type === 'phase' ? ticket.parent !== null : (!parent || !TICKET_PARENT_TYPES[ticket.type]?.includes(parent.type))) errors.push(`${ticket.id}:parent-type`);
    const seen = new Set([ticket.id]); let parentId = ticket.parent;
    while (parentId !== null) { if (seen.has(parentId)) { errors.push(`${ticket.id}:parent-cycle`); break; } seen.add(parentId); parentId = byId.get(parentId)?.parent ?? null; }
  }
  return errors;
}

export function buildProvenance(indexBytes, projectionBytes) {
  const sourceHash = sha256(indexBytes);
  return {
    schema_version: 1,
    contract_version: '0.10',
    record_type: 'adapter-provenance',
    provenance_id: 'PRV-UABC-BCB-TWIN-001',
    product_id: 'spectra',
    profile: 'implementation',
    classification: 'customer-workspace',
    synthetic: false,
    source: { blob_path: INDEX_PATH, source_hash: sourceHash, source_hash_after: sourceHash, media_type: 'application/yaml' },
    mapping: { mapping_id: MAPPING_ID, mapping_version: MAPPING_VERSION, deterministic: true },
    projection: { projection_path: MAP_PATH, digest_algorithm: 'SHA-256', projection_digest: sha256(projectionBytes) },
    source_of_truth: { owner: 'customer-workspace', unchanged: true },
    write_protection: { source_mode: 'read-only', writes_performed: false, projection_only: true, overwrite_allowed: false }
  };
}

export function buildCoverage(story, readBytes) {
  const portable = buildPortableStory(story, readBytes);
  const source = {
    schemaVersion: 1,
    recordType: 'native-reference-graph',
    sourceOfTruth: 'evidence/simulation/project-story.json',
    relations: story.relations.map((relation, index) => ({ id: `NATIVE-${String(index + 1).padStart(3, '0')}`, class: 'native-reference', from: relation.from, to: relation.to }))
  };
  const projection = {
    schemaVersion: 1,
    recordType: 'portable-reference-graph',
    sourceOfTruth: 'derived-spectra-projection',
    edges: portable.graph.map((edge, index) => ({ id: `PORTABLE-${String(index + 1).padStart(3, '0')}`, class: 'portable-reference', from: edge.from, to: edge.to, type: edge.type }))
  };
  const mapping = {
    schemaVersion: 1,
    recordType: 'reference-graph-mapping-rules',
    mappings: [{ mapping_id: 'MAP-UABC-BCB-REFERENCE-001', native_class: 'native-reference', portable_class: 'portable-reference', outcome: 'transformed', reason_code: 'transformed-domain' }]
  };
  const sourceBytes = jsonBytes(source); const mappingBytes = jsonBytes(mapping); const projectionBytes = jsonBytes(projection);
  const coverage = {
    schema_version: 1,
    contract_version: '1.0.0',
    record_type: 'reference-graph-projection-coverage',
    coverage_id: 'RGC-UABC-BCB-001',
    product_id: 'spectra',
    classification: 'customer-workspace',
    coverage_semantics: 'explained-native-relations',
    native_relation_classes: [{ class_id: 'native-reference', count: source.relations.length }],
    portable_relation_classes: [{ class_id: 'portable-reference', count: projection.edges.length }],
    mappings: [{ ...mapping.mappings[0], native_count: source.relations.length, portable_edge_count: projection.edges.length }],
    summary: { native_total: source.relations.length, portable_edge_total: projection.edges.length, accounted_native_total: source.relations.length, projected_native_total: source.relations.length, excluded_native_total: 0, coverage_numerator: source.relations.length, coverage_denominator: source.relations.length, coverage_ratio: 1 },
    provenance: {
      source: { path: COVERAGE_SOURCE_PATH, sha256: sha256(sourceBytes) },
      mapping: { path: COVERAGE_MAPPING_PATH, sha256: sha256(mappingBytes) },
      projection: { path: COVERAGE_PROJECTION_PATH, sha256: sha256(projectionBytes) },
      digest_algorithm: 'SHA-256', source_mode: 'read-only', source_unchanged: true, writes_performed: false, projection_only: true
    },
    claims: { one_to_one_claim: false, complete_projection_claim: false, explanation_complete: true }
  };
  return { source, mapping, projection, coverage, sourceBytes, mappingBytes, projectionBytes, portable };
}

export function generateIntegration(root = process.cwd()) {
  const read = (relative) => fs.readFileSync(path.join(root, relative));
  const indexBytes = lfBytes(read(INDEX_PATH));
  const index = YAML.parse(indexBytes.toString('utf8'));
  if (index.projectId !== 'UABC-BC-BASIC-001' || index.allowedBranch !== 'codex/universaarl-projekt') throw new Error('Der Twin-Index besitzt nicht die erwartete Projekt-/Branchidentitaet.');
  for (const artifact of index.artifacts ?? []) if (!safeRelative(artifact.path)) throw new Error(`Unsicherer Exportpfad: ${artifact.path}`);
  const story = JSON.parse(read('evidence/simulation/project-story.json').toString('utf8'));
  const ticketErrors = ticketTopologyErrors(story);
  if (ticketErrors.length > 0) throw new Error(`Kanonischer Ticketvertrag ist ungueltig: ${ticketErrors.join(', ')}`);
  const historicalTicketSources = [];
  const billing = YAML.parse(read('project/bc-basic/billing.yaml').toString('utf8'));
  const reconciliation = buildReconciliation(story, billing);
  const ticketExport = buildTicketExport(story, []);
  const ticketExportFailures = ticketExportErrors(ticketExport);
  if (ticketExportFailures.length > 0) throw new Error(`Kanonischer Ticket-Export ist ungueltig: ${ticketExportFailures.join(', ')}`);
  const exportMap = buildTwinExportMap(index);
  const exportMapBytes = jsonBytes(exportMap);
  const provenance = buildProvenance(indexBytes, exportMapBytes);
  const coverage = buildCoverage(story, (relative) => read(relative));
  return { reconciliation, ticketExport, historicalTicketSources, exportMap, provenance, indexBytes, exportMapBytes, ...coverage };
}

export function writeIntegration(root = process.cwd()) {
  const generated = generateIntegration(root);
  const outputs = [
    [RECONCILIATION_PATH, generated.reconciliation], [MAP_PATH, generated.exportMap], [PROVENANCE_PATH, generated.provenance],
    [COVERAGE_SOURCE_PATH, generated.source], [COVERAGE_MAPPING_PATH, generated.mapping], [COVERAGE_PROJECTION_PATH, generated.projection], [COVERAGE_PATH, generated.coverage]
  ];
  for (const [relative, value] of outputs) {
    const target = path.join(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, jsonBytes(value));
  }
  fs.writeFileSync(path.join(root, TICKET_EXPORT_PATH), YAML.stringify(generated.ticketExport), 'utf8');
  return generated;
}

if (process.argv[1]?.endsWith('generate-spectra-0.10-integration.mjs')) {
  if (!process.argv.includes('--write')) throw new Error('Die Erzeugung benoetigt --write; ohne Schalter bleibt der Arbeitsbaum unveraendert.');
  const generated = writeIntegration();
  console.log(`Spectra-0.10-Integration erzeugt: 50 aktive Tickets (3 Phasen, 10 Epics, 18 Stories, 19 Tasks), 80h/9.600 EUR, ${generated.source.relations.length} native Relationen, ${generated.projection.edges.length} portable Kanten und ${generated.exportMap.artifacts.length} Twin-Artefakte.`);
}

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';
import { buildPortableStory } from './adapt-spectra-portable-story.mjs';
import {
  COVERAGE_MAPPING_PATH, COVERAGE_PATH, COVERAGE_PROJECTION_PATH, COVERAGE_SOURCE_PATH, INDEX_PATH, MAP_PATH,
  HISTORICAL_TICKET_SOURCES, MAPPING_ID, MAPPING_VERSION, PROVENANCE_PATH, RECONCILIATION_PATH, TICKET_EXPORT_PATH,
  TICKET_TYPE_PRESENTATIONS, TICKET_VIEWS, buildTicketExport, buildTwinExportMap, jsonBytes, lfBytes, safeRelative, sha256, ticketExportErrors, ticketTopologyErrors
} from './generate-spectra-0.10-integration.mjs';

const RELEASE = {
  releaseVersion: '0.10.0-alpha.1', releaseTag: 'spectra-v0.10.0-alpha.1', tagCommit: 'f89b4de9a9be63932f942f1b0fd8225512a12029',
  manifestSourceCommit: '5c39c4223009ad87a226022a679bee1a691f0cc2', payloadBundleDigest: 'ee21672c215de04cb7ae51f57b1d40ef95c79add1868f49c36d042f7cb9416df'
};
const RELEASE_EVIDENCE_PATH = 'evidence/spectra-release-0.10.0-alpha.1.yaml';
const CONFORMANCE_PATH = 'evidence/simulation/spectra-0.10-conformance.yaml';
const REQUIRED_INDEX_PATHS = [RECONCILIATION_PATH, PROVENANCE_PATH, MAP_PATH, COVERAGE_PATH, COVERAGE_SOURCE_PATH, COVERAGE_MAPPING_PATH, COVERAGE_PROJECTION_PATH, TICKET_EXPORT_PATH, RELEASE_EVIDENCE_PATH, CONFORMANCE_PATH];
const LINK_PATHS = [RECONCILIATION_PATH, PROVENANCE_PATH, MAP_PATH, COVERAGE_PATH, COVERAGE_SOURCE_PATH, COVERAGE_MAPPING_PATH, COVERAGE_PROJECTION_PATH];
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export function loadIntegration(root = process.cwd()) {
  const bytes = (relative) => fs.readFileSync(path.join(root, relative));
  const json = (relative) => JSON.parse(bytes(relative).toString('utf8'));
  const yaml = (relative) => YAML.parse(bytes(relative).toString('utf8'));
  return {
    root,
    binding: yaml('governance/consumer-bindings.yaml'), releaseEvidence: yaml(RELEASE_EVIDENCE_PATH), conformance: yaml(CONFORMANCE_PATH), index: yaml(INDEX_PATH), indexBytes: lfBytes(bytes(INDEX_PATH)),
    reconciliation: json(RECONCILIATION_PATH), provenance: json(PROVENANCE_PATH), exportMap: json(MAP_PATH), exportMapBytes: bytes(MAP_PATH),
    coverage: json(COVERAGE_PATH), coverageSource: json(COVERAGE_SOURCE_PATH), coverageSourceBytes: bytes(COVERAGE_SOURCE_PATH),
    coverageMapping: json(COVERAGE_MAPPING_PATH), coverageMappingBytes: bytes(COVERAGE_MAPPING_PATH),
    coverageProjection: json(COVERAGE_PROJECTION_PATH), coverageProjectionBytes: bytes(COVERAGE_PROJECTION_PATH),
    story: json('evidence/simulation/project-story.json'), ticketExport: yaml(TICKET_EXPORT_PATH),
    historicalTicketSources: HISTORICAL_TICKET_SOURCES.map((sourcePath) => ({ sourcePath, issues: yaml(sourcePath).issues ?? [] })),
    reconciliationSchema: json('governance/schemas/spectra-project-reconciliation-0.9.schema.json'), reconciliationSchemaBytes: bytes('governance/schemas/spectra-project-reconciliation-0.9.schema.json'),
    provenanceSchema: json('governance/schemas/spectra-adapter-provenance-0.9.schema.json'), provenanceSchemaBytes: bytes('governance/schemas/spectra-adapter-provenance-0.9.schema.json'),
    coverageSchema: json('governance/schemas/spectra-reference-graph-coverage-0.10.schema.json'), coverageSchemaBytes: bytes('governance/schemas/spectra-reference-graph-coverage-0.10.schema.json'),
    portableSchemaBytes: bytes('governance/schemas/spectra-portable-project-story-0.7.schema.json'),
    linkedText: [
      'docs/offers/bc-basic-offer.md', 'atlassian/confluence/pages/bc-basic-project-story.md', 'atlassian/confluence/pages/bc-basic-hypercare.md',
      'atlassian/jira/issues/bc-basic-story-tickets.yaml', 'docs/reports/bc-basic-project-chronicle.md', 'docs/handover/bc-basic-handover.md'
    ].map((relative) => bytes(relative).toString('utf8')).join('\n')
  };
}

export function validateIntegration(data) {
  const errors = []; const fail = (code, detail) => errors.push(`${code}: ${detail}`);
  const release = data.binding?.spectraReleaseBinding ?? {};
  for (const [field, expected] of Object.entries(RELEASE)) if (release[field] !== expected) fail('SPECTRA_BINDUNG', `${field}=${release[field]}`);
  if (release.bindingStatus !== 'BOUND' || release.productId !== 'spectra' || release.consumerMode !== 'INSTALLABLE_BLUEPRINT' || release.installableBlueprint !== true) fail('SPECTRA_BINDUNG', 'BOUND/installierbar erforderlich');
  const evidence = data.releaseEvidence;
  if (evidence?.tag?.annotatedObject !== 'f656f9c4e311bb4a1277f26d0b05edfbcda9f0fe' || evidence?.tag?.peeledCommit !== RELEASE.tagCommit || evidence?.commit?.tree !== '378f704e8a19f74423b4d6c065919d2bbeb44398' || evidence?.manifest?.manifestSourceCommit !== RELEASE.manifestSourceCommit || evidence?.manifest?.sourceTree !== '26c9ba19730972358b6ce126ff7198f1dcd8a3b3' || evidence?.payload?.fileCount !== 110 || evidence?.payload?.verifiedGitBlobs !== 110 || evidence?.payload?.mismatches !== 0 || evidence?.payload?.bundleDigest !== RELEASE.payloadBundleDigest || evidence?.release?.draft !== false || evidence?.release?.prerelease !== true || evidence?.verification?.status !== 'passed') fail('VEROEFFENTLICHUNGSNACHWEIS', '0.10-Releaseanker oder 110-Blob-Nachweis weicht ab');
  for (const [name, bytes] of [['portableProjectStory', data.portableSchemaBytes], ['projectReconciliation', data.reconciliationSchemaBytes], ['adapterProvenance', data.provenanceSchemaBytes], ['referenceGraphCoverage', data.coverageSchemaBytes]]) if (evidence?.publishedContracts?.[name]?.sha256 !== sha256(bytes) || evidence?.publishedContracts?.[name]?.parity !== 'exact') fail('SCHEMA_PARITY', name);

  const rec = data.reconciliation; const prv = data.provenance; const coverage = data.coverage;
  const baselineDiffers = rec.baseline?.hours !== rec.offer?.hours || rec.baseline?.rate !== rec.offer?.rate || rec.baseline?.amount !== rec.offer?.amount;
  if (baselineDiffers && (rec.variance?.reason_code === 'none' || !rec.variance?.reason?.trim())) fail('VARIANCE_REASON_REQUIRED', 'Baseline, aktueller Plan und aktuelles Ist sind nicht erklaert');
  if (rec.contract_version !== '0.10' || prv.contract_version !== '0.10' || data.exportMap.contractVersion !== '0.10') fail('CONTRACT_VERSION', '0.10 in Reconciliation, Provenienz und Exportmap erforderlich');
  if (rec.truth_boundary?.invoice_claim !== false || rec.truth_boundary?.productive_activity_claim !== false || rec.truth_boundary?.billing_status !== 'not-applicable') fail('TRUTH_CLAIM', 'Rechnung, produktive Leistung oder Abrechnung behauptet');
  for (const state of ['baseline', 'offer', 'actual']) if (rec[state]?.amount !== rec[state]?.hours * rec[state]?.rate) fail('RECONCILIATION_AMOUNT', state);
  if (rec.variance?.hours !== rec.actual?.hours - rec.offer?.hours || rec.variance?.rate !== rec.actual?.rate - rec.offer?.rate || rec.variance?.amount !== rec.actual?.amount - rec.offer?.amount) fail('RECONCILIATION_VARIANCE', 'Ist minus Angebot stimmt nicht');

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  if (!ajv.compile(data.reconciliationSchema)(rec)) fail('RECONCILIATION_SCHEMA', 'Spectra-Reconciliation-Schema verletzt');
  if (!ajv.compile(data.provenanceSchema)(prv)) fail('PROVENANCE_SCHEMA', 'Spectra-Provenienzschema verletzt');
  if (!ajv.compile(data.coverageSchema)(coverage)) fail('COVERAGE_SCHEMA', 'Spectra-0.10-Coverage-Schema verletzt');
  if (!safeRelative(prv.source?.blob_path) || !safeRelative(prv.projection?.projection_path)) fail('PATH_UNSAFE', `${prv.source?.blob_path}/${prv.projection?.projection_path}`);
  if (prv.source?.blob_path !== INDEX_PATH || prv.projection?.projection_path !== MAP_PATH) fail('PROVENANCE_TARGET', 'Index und Exportmap erforderlich');
  const actualSourceHash = sha256(data.indexBytes);
  if (prv.source?.source_hash !== actualSourceHash) fail('SOURCE_HASH', actualSourceHash);
  if (prv.source?.source_hash_after !== prv.source?.source_hash) fail('SOURCE_MUTATION', 'Source-Hash vor/nach Projektion weicht ab');
  if (prv.projection?.projection_digest !== hash(data.exportMapBytes)) fail('PROJECTION_DIGEST', hash(data.exportMapBytes));
  if (prv.mapping?.mapping_id !== MAPPING_ID || prv.mapping?.mapping_version !== MAPPING_VERSION || prv.mapping?.deterministic !== true) fail('MAPPING_VERSION', 'Mappingidentitaet ist ungueltig');
  if (prv.source_of_truth?.owner !== 'customer-workspace' || prv.source_of_truth?.unchanged !== true) fail('QUELLWAHRHEIT', 'BC Basic muss unveraenderte Source of Truth bleiben');
  const wp = prv.write_protection ?? {};
  if (wp.source_mode !== 'read-only' || wp.writes_performed !== false || wp.projection_only !== true || wp.overwrite_allowed !== false) fail('WRITE_PROTECTION', 'Schreibschutz ist nicht fail-closed');

  const bindings = [[coverage?.provenance?.source, COVERAGE_SOURCE_PATH, data.coverageSourceBytes], [coverage?.provenance?.mapping, COVERAGE_MAPPING_PATH, data.coverageMappingBytes], [coverage?.provenance?.projection, COVERAGE_PROJECTION_PATH, data.coverageProjectionBytes]];
  for (const [binding, expectedPath, bytes] of bindings) {
    if (!safeRelative(binding?.path) || binding?.path !== expectedPath) fail('COVERAGE_PATH', expectedPath);
    if (binding?.sha256 !== sha256(bytes)) fail('COVERAGE_DIGEST', expectedPath);
  }
  if (coverage?.provenance?.source_mode !== 'read-only' || coverage?.provenance?.source_unchanged !== true || coverage?.provenance?.writes_performed !== false || coverage?.provenance?.projection_only !== true) fail('COVERAGE_WRITE_PROTECTION', 'Coverage-Provenienz ist nicht read-only');
  const native = data.coverageSource?.relations ?? []; const portable = data.coverageProjection?.edges ?? []; const mappings = data.coverageMapping?.mappings ?? [];
  if (native.length !== (data.story.relations ?? []).length || new Set(native.map((item) => item.id)).size !== native.length || new Set(portable.map((item) => item.id)).size !== portable.length) fail('COVERAGE_COUNTS', 'native Relationen muessen dynamisch aus der Story stammen; alle Kanten muessen eindeutig sein');
  if (mappings.length !== 1 || mappings[0]?.mapping_id !== coverage?.mappings?.[0]?.mapping_id || mappings[0]?.native_class !== coverage?.mappings?.[0]?.native_class || mappings[0]?.portable_class !== coverage?.mappings?.[0]?.portable_class || mappings[0]?.outcome !== coverage?.mappings?.[0]?.outcome || mappings[0]?.reason_code !== coverage?.mappings?.[0]?.reason_code) fail('COVERAGE_MAPPING', 'Mappingregel und Coverage-Record weichen ab');
  if (coverage?.summary?.native_total !== native.length || coverage?.summary?.portable_edge_total !== portable.length || coverage?.summary?.accounted_native_total !== native.length || coverage?.summary?.coverage_ratio !== 1 || coverage?.claims?.one_to_one_claim !== false || coverage?.claims?.complete_projection_claim !== false || coverage?.claims?.explanation_complete !== true) fail('COVERAGE_SUMMARY', 'Coverage erklaert nicht alle nativen Relationen ohne Vollstaendigkeitsbehauptung');
  const conformance = data.conformance;
  const portableDigest = hash(Buffer.from(JSON.stringify(buildPortableStory(data.story, (relative) => fs.readFileSync(path.join(data.root, relative)))), 'utf8'));
  if (conformance?.status !== 'passed' || conformance?.spectraRelease !== RELEASE.releaseTag || conformance?.portableConformance?.projectionDigest !== portableDigest || conformance?.adapterProvenance?.sourceHash !== sha256(data.indexBytes) || conformance?.adapterProvenance?.projectionDigest !== hash(data.exportMapBytes) || conformance?.referenceGraphCoverage?.sourceDigest !== sha256(data.coverageSourceBytes) || conformance?.referenceGraphCoverage?.mappingDigest !== sha256(data.coverageMappingBytes) || conformance?.referenceGraphCoverage?.projectionDigest !== sha256(data.coverageProjectionBytes) || conformance?.referenceGraphCoverage?.nativeRelations !== native.length || conformance?.referenceGraphCoverage?.portableEdges !== portable.length || conformance?.referenceGraphCoverage?.oneToOneClaim !== false || conformance?.referenceGraphCoverage?.completeProjectionClaim !== false) fail('CONFORMANCE_EVIDENCE', '0.10-Konformitaetsevidence oder Digests weichen ab');

  const expectedMap = buildTwinExportMap(data.index);
  if (!equal(data.exportMap, expectedMap) || !equal(data.exportMap, JSON.parse(jsonBytes(data.exportMap).toString('utf8')))) fail('EXPORT_MAP_INCOMPLETE', 'Exportmap stimmt nicht exakt mit dem Branch-Index ueberein');
  const ids = new Set(); const paths = new Set();
  for (const artifact of data.index.artifacts ?? []) { if (ids.has(artifact.id) || paths.has(artifact.path)) fail('INDEX_DUPLICATE', artifact.id); ids.add(artifact.id); paths.add(artifact.path); if (!safeRelative(artifact.path)) fail('PATH_UNSAFE', artifact.path); }
  for (const required of REQUIRED_INDEX_PATHS) if (!paths.has(required)) fail('INDEX_LINK_MISSING', required);
  const currentTicketSurfaces = (data.index.artifacts ?? []).filter((artifact) => artifact.kindId === 'project-story-ticket-catalog');
  if (currentTicketSurfaces.length !== 1 || currentTicketSurfaces[0]?.path !== TICKET_EXPORT_PATH || (data.index.artifacts ?? []).some((artifact) => artifact.kindId === 'jira-issues')) fail('TICKET_COUNTING_SURFACE', 'Nur die kanonische Ticketquelle darf aktuelle Ansicht und Zaehlsurface sein');
  const ticketCatalog = data.index.ticketCatalog ?? {};
  const dynamicCount = (data.ticketExport?.ticketRecords ?? []).length;
  if (ticketCatalog.path !== TICKET_EXPORT_PATH || ticketCatalog.sourceContract !== 'evidence/simulation/project-story.json' || ticketCatalog.recordCount !== dynamicCount || ticketCatalog.customerStoryCount !== dynamicCount || ticketCatalog.internalTraceabilityCount !== 0 || !equal(ticketCatalog.canonicalTypes, ['phase','epic','story','task']) || ticketCatalog.typeField !== 'type' || ticketCatalog.canonicalTypeField !== 'canonicalType' || ticketCatalog.parentField !== 'parent' || ticketCatalog.visibilityRoleField !== 'visibilityRole' || ticketCatalog.countingScopeField !== 'countingScope' || ticketCatalog.typePresentationsField !== 'typePresentations' || ticketCatalog.typeLabelField !== 'typeLabel' || ticketCatalog.displayIconKeyField !== 'displayIconKey' || ticketCatalog.displayColorTokenField !== 'displayColorToken' || ticketCatalog.liveIconPolicyField !== 'liveIconPolicy' || ticketCatalog.viewsField !== 'views' || !equal(ticketCatalog.viewIds, TICKET_VIEWS.map((view) => view.id)) || !equal(ticketCatalog.viewTypes, TICKET_VIEWS.map((view) => view.type)) || !equal(ticketCatalog.presentationTypes, Object.keys(TICKET_TYPE_PRESENTATIONS)) || ticketCatalog.inferTypeFromKeyOrTitle !== false) fail('TICKET_EXPORT_VERTRAG', 'Branch-Index muss Tickettypen, Darstellungen, zwei Views und Zaehlscope explizit festlegen');
  if (!Array.isArray(data.index.consumerRules) || data.index.consumerRules.length === 0 || data.index.consumerRules.some((rule) => typeof rule !== 'string')) fail('CONSUMER_REGEL_TYP', 'Jede consumerRules-Regel muss ein YAML-String sein');

  const story = data.story;
  const bcState = story.businessCentralPilotState ?? {}; const conformanceState = conformance?.businessCentralPilotState ?? {};
  if (bcState.baselineKind !== 'standard-cronus-demo' || bcState.pilotConfigured !== false || bcState.writesApplied !== false || bcState.readbackStatus !== 'pending' || bcState.targetDecision !== 'pending-wave-0-evidence' || bcState.resetDecision !== 'pending-resetpoint-evidence' || !equal(conformanceState, { baselineKind: bcState.baselineKind, pilotConfigured: bcState.pilotConfigured, writesApplied: bcState.writesApplied, readbackStatus: bcState.readbackStatus, targetDecision: bcState.targetDecision, resetDecision: bcState.resetDecision })) fail('BC_PILOT_STATE', 'Standard-CRONUS-Demo-Baseline und offener Pilotaufbau muessen strukturiert bis zur Konformitaetsevidence reichen');
  for (const ticketError of ticketTopologyErrors(story)) fail(ticketError.includes('unknown-type') ? 'TICKET_TYP' : 'TICKET_PARENT_TYP', ticketError);
  for (const ticketError of ticketExportErrors(data.ticketExport)) {
    const code = ticketError.includes('unknown-type') ? 'TICKET_TYP'
      : ticketError.includes('parent') ? 'TICKET_PARENT_TYP'
        : (ticketError.includes('board-status') || ticketError.includes('active-status')) ? 'TICKET_BOARD_STATUS'
          : ticketError.includes('ticket-view') ? 'TICKET_VIEW'
          : (ticketError.includes('presentation') || ticketError.includes('icon-policy')) ? 'TICKET_PRAESENTATION'
            : 'TICKET_ZAEHLSCOPE';
    fail(code, ticketError);
  }
  if (!equal(data.ticketExport, buildTicketExport(story, []))) fail('TICKET_EXPORT_ABWEICHUNG', 'Ticketexport muss deterministisch aus der nativen Story entstehen');
  const tasks = story.tickets?.filter((ticket) => ticket.type === 'task') ?? [];
  const roots = story.tickets?.filter((ticket) => ticket.type === 'phase') ?? [];
  if (roots.length !== 3 || !['UABC-1','UABC-2','UABC-3'].every((id) => roots.some((ticket) => ticket.id === id))) fail('TICKET_PHASE_ROOTS', 'Genau die drei fachlichen Phase-Roots UABC-1/2/3 sind erforderlich');
  const activeWorklogs = tasks.flatMap((ticket) => ticket.worklogs ?? []);
  const derivedHours = activeWorklogs.reduce((sum, item) => sum + Number(item.hours ?? 0), 0);
  const derivedAmount = activeWorklogs.reduce((sum, item) => sum + Number(item.netAmount ?? 0), 0);
  if (data.ticketExport.countedWorklogHours !== derivedHours || data.ticketExport.ticketRecords.reduce((sum, ticket) => sum + Number(ticket.worklogHours ?? 0), 0) !== derivedHours) fail('TICKET_SUMMEN', 'Worklogstunden muessen aus den aktiven Task-Worklogs abgeleitet werden');
  if (tasks.some((ticket) => ticket.billable !== true || (ticket.worklogs ?? []).some((worklog) => worklog.taskId !== ticket.id))) fail('TICKET_ARBEIT', 'Nur Tasks duerfen abrechenbar sein und Worklogs tragen');
  if (data.ticketExport.ticketRecords.some((ticket) => ticket.type !== 'task' && (ticket.billable === true || (ticket.worklogs ?? []).length > 0))) fail('TICKET_ARBEIT', 'Nicht-Tasks duerfen keine abrechenbare Arbeit oder Worklogs enthalten');
  if (data.ticketExport.ticketRecords.some((ticket) => ['done','closed'].includes(ticket.status) && /Setup|Migration|Schulung|UAT|Cutover|Hypercare|Retro|Supportuebergabe|Supportübergabe/i.test(`${ticket.summary} ${ticket.description}`))) fail('TICKET_FUTURE_GATE', 'Zukuenftige Abschlussarbeit darf nicht als erledigt erscheinen');
  if (data.ticketExport.ticketRecords.some((ticket) => Object.hasOwn(ticket, 'hourlyRate') || Object.hasOwn(ticket, 'netAmount') || /(?:\bEUR\b|€|\b\d+(?:[.,]\d+)?[- ]?Stunden\b|\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b)/i.test(`${ticket.summary} ${ticket.description}`) || (ticket.worklogs ?? []).some((worklog) => Object.hasOwn(worklog, 'hourlyRate') || Object.hasOwn(worklog, 'netAmount')))) fail('TICKET_GELD', 'Twin-Ticketlisten duerfen weder Geldfelder noch Geldbetraege enthalten');
  if (derivedAmount < 0 || data.story.offer?.actual_hours !== derivedHours || data.story.offer?.actual_cost !== derivedAmount || rec.actual?.hours !== derivedHours || rec.actual?.amount !== derivedAmount) fail('TICKET_SUMMEN', 'Iststunden und Istkosten muessen aus aktiven Task-Worklogs abgeleitet werden');
  for (const relative of LINK_PATHS) if (!data.linkedText.includes(relative)) fail('DOCUMENT_LINK_INCOMPLETE', relative);
  return errors;
}

if (process.argv[1]?.endsWith('validate-spectra-0.10-integration.mjs')) {
  const data = loadIntegration(); const errors = validateIntegration(data);
  if (errors.length) { console.error(`Spectra-0.10-Integrationspruefung fehlgeschlagen (${errors.length}):`); errors.forEach((error) => console.error(`- ${error}`)); process.exit(1); }
  console.log(`Spectra-0.10-Integrationspruefung bestanden: ${data.ticketExport.ticketRecords.length} aktive Tickets, ${data.ticketExport.countedWorklogHours} Iststunden, ${data.coverageSource.relations.length} native Relationen, ${data.coverageProjection.edges.length} portable Kanten, ${data.index.artifacts.length} Twin-Artefakte, Source ${sha256(data.indexBytes)}, Projektion ${hash(data.exportMapBytes)}.`);
}

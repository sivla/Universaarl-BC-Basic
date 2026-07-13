import crypto from 'node:crypto';
import fs from 'node:fs';
import YAML from 'yaml';
import { buildPortableStory } from './adapt-spectra-portable-story.mjs';

const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const read = (file) => fs.readFileSync(file);
const story = JSON.parse(read('evidence/simulation/project-story.json'));
const reconciliation = JSON.parse(read('evidence/simulation/project-reconciliation.json'));
const indexBytes = read('exports/project-data/v1/index.yaml');
const mapBytes = read('exports/project-data/v1/twin-export-map.json');
const coverage = JSON.parse(read('evidence/simulation/reference-graph-coverage.json'));
const native = JSON.parse(read('exports/project-data/v1/reference-graph-native.json'));
const portable = JSON.parse(read('exports/project-data/v1/reference-graph-portable.json'));
const conformancePath = 'evidence/simulation/spectra-0.10-conformance.yaml';
const conformance = YAML.parse(read(conformancePath).toString());
const taskWorklogs = story.tickets.filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs ?? []);
const actualHours = taskWorklogs.reduce((sum, worklog) => sum + Number(worklog.hours ?? 0), 0);
const actualNetAmount = taskWorklogs.reduce((sum, worklog) => sum + Number(worklog.netAmount ?? 0), 0);
const typeCount = (type) => story.tickets.filter((ticket) => ticket.type === type).length;

conformance.classification = 'current-pilot-planning';
conformance.businessCentralPilotState = {
  baselineKind: story.businessCentralPilotState.baselineKind,
  pilotConfigured: story.businessCentralPilotState.pilotConfigured,
  writesApplied: story.businessCentralPilotState.writesApplied,
  readbackStatus: story.businessCentralPilotState.readbackStatus,
  targetDecision: story.businessCentralPilotState.targetDecision,
  resetDecision: story.businessCentralPilotState.resetDecision
};
conformance.portableConformance.projectionDigest = hash(Buffer.from(JSON.stringify(buildPortableStory(story, (relative) => read(relative)))));
conformance.reconciliation = {
  path: 'evidence/simulation/project-reconciliation.json',
  baselineHours: reconciliation.baseline.hours,
  baselineAmount: reconciliation.baseline.amount,
  offerHours: reconciliation.offer.hours,
  offerAmount: reconciliation.offer.amount,
  actualHours: reconciliation.actual.hours,
  actualAmount: reconciliation.actual.amount,
  invoiceClaim: reconciliation.truth_boundary.invoice_claim,
  productiveActivityClaim: reconciliation.truth_boundary.productive_activity_claim
};
conformance.adapterProvenance.sourceHash = hash(indexBytes);
conformance.adapterProvenance.projectionDigest = hash(mapBytes);
conformance.referenceGraphCoverage.nativeRelations = native.relations.length;
conformance.referenceGraphCoverage.portableEdges = portable.edges.length;
conformance.referenceGraphCoverage.accountedNativeRelations = coverage.summary.accounted_native_total;
conformance.referenceGraphCoverage.coverageRatio = coverage.summary.coverage_ratio;
conformance.referenceGraphCoverage.sourceDigest = hash(read('exports/project-data/v1/reference-graph-native.json'));
conformance.referenceGraphCoverage.mappingDigest = hash(read('exports/project-data/v1/reference-graph-mapping.json'));
conformance.referenceGraphCoverage.projectionDigest = hash(read('exports/project-data/v1/reference-graph-portable.json'));
conformance.counts = {
  offerVersions: story.historicalOfferVersions.length,
  pages: story.pages.length,
  phaseTickets: typeCount('phase'),
  tickets: story.tickets.length,
  epics: typeCount('epic'),
  stories: typeCount('story'),
  bugs: typeCount('bug'),
  tasks: typeCount('task'),
  comments: story.tickets.flatMap((ticket) => ticket.comments ?? []).length,
  worklogs: taskWorklogs.length,
  actualHours,
  actualNetAmount,
  timelineEvents: story.timeline.length,
  projectPhases: new Set(story.timeline.map((event) => event.phase)).size,
  hypercareRecords: story.hypercare.length,
  nativeRelations: native.relations.length,
  portableEdges: portable.edges.length
};
conformance.truthBoundary = 'Unveränderte Standard-CRONUS-Demo-Ausgangsbasis; der BC-Basic-Pilotaufbau steht aus. Technischer Firmenname und URL beweisen keine Einrichtung. Keine BC-Schreibfreigabe, keine produktive Leistung, keine Rechnung und keine erfundene Kundenabnahme. Istwerte stammen ausschliesslich aus aktiven Task-Worklogs.';
fs.writeFileSync(conformancePath, YAML.stringify(conformance));
console.log(`Konformitätsevidence aktualisiert: ${story.tickets.length} aktive Tickets, ${taskWorklogs.length} Worklogs, ${portable.edges.length} portable Kanten.`);

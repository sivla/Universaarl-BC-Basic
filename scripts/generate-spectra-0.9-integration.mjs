import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

export const INDEX_PATH = 'exports/project-data/v1/index.yaml';
export const MAP_PATH = 'exports/project-data/v1/twin-export-map.json';
export const RECONCILIATION_PATH = 'evidence/simulation/project-reconciliation.json';
export const PROVENANCE_PATH = 'evidence/simulation/adapter-provenance.json';
export const MAPPING_ID = 'MAP-UABC-BCB-TWIN-001';
export const MAPPING_VERSION = '1.0.0';
export const HISTORICAL_PROVENANCE_ONLY = true;
export const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
export const jsonBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
export const lfBytes = (bytes) => Buffer.from(Buffer.from(bytes).toString('utf8').replace(/\r\n/g, '\n'), 'utf8');

export function safeRelative(value) {
  return typeof value === 'string' && value.length > 0 && !value.startsWith('/') && !value.includes('\\') && !/^[A-Za-z]:/.test(value) && !value.includes('://') && !value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..' || /[\x00-\x1f]/.test(segment));
}

export function buildReconciliation(story, billing) {
  const baseline = billing.historicalBaseline;
  const offered = story.historicalOfferVersions.find((version) => version.version === 2);
  const worklogs = (story.tickets ?? []).filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs ?? []);
  const actual = { hours: worklogs.reduce((sum, worklog) => sum + Number(worklog.hours ?? 0), 0), cost: worklogs.reduce((sum, worklog) => sum + Number(worklog.netAmount ?? 0), 0) };
  const actualRate = actual.hours === 0 ? 120 : actual.cost / actual.hours;
  const state = (version, hours, cost) => ({ version, hours, rate: hours === 0 ? 120 : cost / hours, amount: cost, currency: 'EUR' });
  return {
    schema_version: 1,
    contract_version: '0.9',
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
      rate: actualRate - (offered.cost / offered.hours),
      amount: actual.cost - offered.cost,
      reason_code: 'scope-change',
      reason: 'Die historische 68-Stunden-Kalkulation und die 80-Stunden-Angebotsplanung bleiben getrennte Provenienz. Das aktuelle Ist wird ausschliesslich aus aktiven Task-Worklogs abgeleitet und betraegt im neu gestarteten Piloten derzeit 0 Stunden und 0 EUR.'
    },
    truth_boundary: { owner: 'synthetic-fixture', source_of_truth: 'synthetic-fixture', invoice_claim: false, productive_activity_claim: false, billing_status: 'not-applicable' }
  };
}

export function buildTwinExportMap(index) {
  return {
    schemaVersion: 1,
    contractVersion: '0.9',
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

export function buildProvenance(indexBytes, projectionBytes) {
  const sourceHash = sha256(indexBytes);
  return {
    schema_version: 1,
    contract_version: '0.9',
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

export function generateIntegration(root = process.cwd()) {
  const read = (relative) => fs.readFileSync(path.join(root, relative));
  const indexBytes = lfBytes(read(INDEX_PATH));
  const index = YAML.parse(indexBytes.toString('utf8'));
  if (index.projectId !== 'UABC-BC-BASIC-001' || !['codex/universaarl-projekt','codex/bc-basic-three-space-v1'].includes(index.allowedBranch)) throw new Error('Der Twin-Index besitzt nicht die erwartete Projekt-/Branchidentitaet.');
  for (const artifact of index.artifacts ?? []) if (!safeRelative(artifact.path)) throw new Error(`Unsicherer Exportpfad: ${artifact.path}`);
  const story = JSON.parse(read('evidence/simulation/project-story.json').toString('utf8'));
  const billing = YAML.parse(read('project/bc-basic/billing.yaml').toString('utf8'));
  const reconciliation = buildReconciliation(story, billing);
  const exportMap = buildTwinExportMap(index);
  const exportMapBytes = jsonBytes(exportMap);
  const provenance = buildProvenance(indexBytes, exportMapBytes);
  return { reconciliation, exportMap, provenance, indexBytes, exportMapBytes };
}

export function writeIntegration(root = process.cwd()) {
  void root;
  throw new Error('Spectra 0.9 ist ausschließlich historische Provenienz. Der Generator darf keine aktiven 0.10-Artefakte überschreiben.');
}

if (process.argv[1]?.endsWith('generate-spectra-0.9-integration.mjs')) {
  if (process.argv.includes('--write')) writeIntegration();
  console.log('Spectra 0.9 ist historische Provenienz; es wurden keine aktiven Artefakte geschrieben.');
}

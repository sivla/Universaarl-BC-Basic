import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';
import { INDEX_PATH, MAP_PATH, MAPPING_ID, MAPPING_VERSION, PROVENANCE_PATH, RECONCILIATION_PATH, buildTwinExportMap, jsonBytes, lfBytes, safeRelative, sha256 } from './generate-spectra-0.9-integration.mjs';

const RELEASE = {
  releaseVersion: '0.9.0-alpha.1', releaseTag: 'spectra-v0.9.0-alpha.1', tagCommit: '8e991afe455406280610a98f15dd776444fb81ef',
  manifestSourceCommit: 'ad60be1257fc436b623e71cbc6feb0d49addc1fb', payloadBundleDigest: '9fa838b6950ea16f074f438a2476c15661a47567c217e3f60c6e64669d567706'
};
const REQUIRED_INDEX_PATHS = [RECONCILIATION_PATH, PROVENANCE_PATH, MAP_PATH, 'evidence/spectra-release-0.9.0-alpha.1.yaml', 'evidence/simulation/spectra-0.9-conformance.yaml'];
const LINK_PATHS = [RECONCILIATION_PATH, PROVENANCE_PATH, MAP_PATH];
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);
export const HISTORICAL_PROVENANCE_ONLY = true;

export function loadIntegration(root = process.cwd()) {
  const bytes = (relative) => fs.readFileSync(path.join(root, relative));
  const json = (relative) => JSON.parse(bytes(relative).toString('utf8'));
  const yaml = (relative) => YAML.parse(bytes(relative).toString('utf8'));
  return {
    root,
    binding: yaml('governance/consumer-bindings.yaml'), index: yaml(INDEX_PATH), indexBytes: lfBytes(bytes(INDEX_PATH)),
    reconciliation: json(RECONCILIATION_PATH), provenance: json(PROVENANCE_PATH), exportMap: json(MAP_PATH), exportMapBytes: bytes(MAP_PATH),
    story: json('evidence/simulation/project-story.json'),
    reconciliationSchema: json('governance/schemas/spectra-project-reconciliation-0.9.schema.json'),
    provenanceSchema: json('governance/schemas/spectra-adapter-provenance-0.9.schema.json'),
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

  const rec = data.reconciliation; const prv = data.provenance;
  const baselineDiffers = rec.baseline?.hours !== rec.offer?.hours || rec.baseline?.rate !== rec.offer?.rate || rec.baseline?.amount !== rec.offer?.amount;
  if (baselineDiffers && (rec.variance?.reason_code === 'none' || !rec.variance?.reason?.trim())) fail('VARIANCE_REASON_REQUIRED', 'Baseline und Angebot weichen ohne Grund ab');
  if (rec.truth_boundary?.invoice_claim !== false || rec.truth_boundary?.productive_activity_claim !== false || rec.truth_boundary?.billing_status !== 'not-applicable') fail('TRUTH_CLAIM', 'Rechnung, produktive Leistung oder Abrechnung behauptet');
  for (const state of ['baseline', 'offer', 'actual']) if (rec[state]?.amount !== rec[state]?.hours * rec[state]?.rate) fail('RECONCILIATION_AMOUNT', state);
  if (rec.variance?.hours !== rec.actual?.hours - rec.offer?.hours || rec.variance?.rate !== rec.actual?.rate - rec.offer?.rate || rec.variance?.amount !== rec.actual?.amount - rec.offer?.amount) fail('RECONCILIATION_VARIANCE', 'Ist minus Angebot stimmt nicht');

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  if (!ajv.compile(data.reconciliationSchema)(rec)) fail('RECONCILIATION_SCHEMA', 'Spectra-0.9-Schema verletzt');
  if (!ajv.compile(data.provenanceSchema)(prv)) fail('PROVENANCE_SCHEMA', 'Spectra-0.9-Schema verletzt');
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

  const expectedMap = buildTwinExportMap(data.index);
  if (!equal(data.exportMap, expectedMap) || !equal(data.exportMap, JSON.parse(jsonBytes(data.exportMap).toString('utf8')))) fail('EXPORT_MAP_INCOMPLETE', 'Exportmap stimmt nicht exakt mit dem Branch-Index ueberein');
  const ids = new Set(); const paths = new Set();
  for (const artifact of data.index.artifacts ?? []) { if (ids.has(artifact.id) || paths.has(artifact.path)) fail('INDEX_DUPLICATE', artifact.id); ids.add(artifact.id); paths.add(artifact.path); if (!safeRelative(artifact.path)) fail('PATH_UNSAFE', artifact.path); }
  for (const required of REQUIRED_INDEX_PATHS) if (!paths.has(required)) fail('INDEX_LINK_MISSING', required);

  const story = data.story;
  const historicalVersions = story.historicalOfferVersions ?? [];
  if (!historicalVersions.length || historicalVersions.some((version) => typeof version.version !== 'number' || typeof version.hours !== 'number' || typeof version.cost !== 'number')) fail('STORY_HISTORY', 'historische 0.9-Angebotsprovenienz fehlt');
  const activeWorklogs = story.tickets?.filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs ?? []) ?? [];
  const activeHours = activeWorklogs.reduce((sum, worklog) => sum + Number(worklog.hours ?? 0), 0); const activeAmount = activeWorklogs.reduce((sum, worklog) => sum + Number(worklog.netAmount ?? 0), 0);
  if (story.offer?.actual_hours !== activeHours || story.offer?.actual_cost !== activeAmount) fail('ACTIVE_TRUTH_MIX', 'historische 0.9-Provenienz darf aktive Istwerte nicht überschreiben');
  for (const relative of LINK_PATHS) if (!(story.catalogs?.evidenceRefs ?? []).includes(relative) || !data.linkedText.includes(relative)) fail('STORY_LINK_INCOMPLETE', relative);
  return errors;
}

if (process.argv[1]?.endsWith('validate-spectra-0.9-integration.mjs')) {
  const errors = validateIntegration(loadIntegration());
  if (errors.length) { console.error(`Spectra-0.9-Integrationspruefung fehlgeschlagen (${errors.length}):`); errors.forEach((error) => console.error(`- ${error}`)); process.exit(1); }
  const data = loadIntegration();
  console.log(`Historische Spectra-0.9-Provenienzprüfung bestanden: keine aktive Ticket-/Istbehauptung, ${data.index.artifacts.length} read-only Artefaktreferenzen, Source ${sha256(data.indexBytes)}, Projektion ${hash(data.exportMapBytes)}.`);
}

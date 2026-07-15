import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {canonicalBundleDigest, sha256} from './lib/twin-catalog-digest.mjs';
import {buildOperatingCycle, readOperatingCycleSource} from './materialize-bc-operating-cycle-v4.mjs';
import {aggregateDigest, buildV4Documents} from './finalize-bc-operating-cycle-v4.mjs';

const root = process.cwd();
const errors = [];
const fail = (code, detail) => errors.push(`${code}: ${detail}`);
const safe = value => typeof value === 'string' && !path.isAbsolute(value) && !value.includes('\\') && value.split('/').every(part => part && part !== '.' && part !== '..');
const source = readOperatingCycleSource();
const journal = buildOperatingCycle(source);
const expectedDocuments = buildV4Documents(source, journal);
const pointerPath = 'exports/project-data/v1/snapshots/current.json';
const candidatePath = 'exports/project-data/v1/snapshots/current-v4.candidate.json';
const pointer = JSON.parse(fs.readFileSync(pointerPath, 'utf8'));
const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
const index = YAML.parse(fs.readFileSync('exports/project-data/v1/index.yaml', 'utf8'));
const v3Dir = 'exports/project-data/v1/snapshots/releases/UABC-CUSTOMER-001-CATALOG-20260715-V3-FINAL';
const v3ManifestPath = `${v3Dir}/manifest.json`;
const countFiles = directory => fs.readdirSync(directory, {withFileTypes: true}).reduce((count, entry) => count + (entry.isDirectory() ? countFiles(path.join(directory, entry.name)) : 1), 0);

if (JSON.stringify(pointer) !== JSON.stringify(candidate)) fail('CURRENT-KANDIDAT', 'current und V4-Kandidat weichen ab.');
if (pointer.currentReleaseId !== source.catalog.releaseId || pointer.requiresGit !== false || pointer.readOnly !== true || pointer.releasePath.includes('..') || !safe(pointer.releasePath) || !safe(pointer.manifestPath)) fail('CURRENT-VERTRAG', JSON.stringify(pointer));
const releaseDir = pointer.releasePath;
const manifest = JSON.parse(fs.readFileSync(pointer.manifestPath, 'utf8'));
const manifestBytes = fs.readFileSync(pointer.manifestPath);
if (sha256(manifestBytes) !== pointer.manifestSha256 || manifest.releaseId !== pointer.currentReleaseId || manifest.immutable !== true || manifest.readOnly !== true || manifest.runtime?.requiresGit !== false) fail('MANIFEST-VERTRAG', manifest.releaseId);
if (manifest.producerHandoff?.runtimeCommitRequired !== false || manifest.producerHandoff?.projectId !== 'blueprint') fail('PRODUCER-HANDOFF', JSON.stringify(manifest.producerHandoff));
for (const [name, relative] of [['projectIndex', manifest.projectIndexPath], ['resourceCatalog', manifest.resourceCatalogPath]]) {
  const binding = manifest[name];
  const file = path.join(releaseDir, relative);
  if (!safe(relative) || binding?.path !== relative || !fs.existsSync(file)) fail('KATALOG-BINDUNG', `${name}/${relative}`);
  else { const content = fs.readFileSync(file); if (content.length !== binding.sizeBytes || sha256(content) !== binding.sha256) fail('KATALOG-DIGEST', name); }
}
const resourceCatalog = JSON.parse(fs.readFileSync(path.join(releaseDir, manifest.resourceCatalogPath), 'utf8'));
if (resourceCatalog.requiresGit !== false || resourceCatalog.readOnly !== true || resourceCatalog.customerId !== source.catalog.customerId) fail('RESSOURCEN-VERTRAG', resourceCatalog.catalogId);
if (manifest.records.length !== manifest.artifactCount || pointer.artifactCount !== manifest.artifactCount || resourceCatalog.resources.length !== manifest.artifactCount || index.artifactCount !== index.artifacts.length) fail('ARTEFAKT-MENGE', `${manifest.records.length}/${manifest.artifactCount}/${pointer.artifactCount}/${resourceCatalog.resources.length}/${index.artifactCount}`);
const seenIds = new Set(); const seenPaths = new Set();
for (const record of manifest.records) {
  if (seenIds.has(record.id) || seenPaths.has(record.payloadPath) || !safe(record.sourcePath) || !safe(record.payloadPath)) fail('PAYLOAD-IDENTITAET', `${record.id}/${record.payloadPath}`);
  seenIds.add(record.id); seenPaths.add(record.payloadPath);
  const file = path.join(releaseDir, record.payloadPath);
  if (!fs.existsSync(file)) fail('PAYLOAD-FEHLT', record.payloadPath);
  else { const content = fs.readFileSync(file); if (content.length !== record.sizeBytes || sha256(content) !== record.sha256) fail('PAYLOAD-DIGEST', record.id); }
}
const actualBundle = canonicalBundleDigest(manifest.records);
const actualAggregate = aggregateDigest(manifest.projectIndex.sha256, manifest.resourceCatalog.sha256, actualBundle);
if (actualBundle !== manifest.payloadBundleDigest || actualBundle !== pointer.payloadBundleDigest) fail('BUNDLE-DIGEST', actualBundle);
if (actualAggregate !== manifest.catalogAggregateDigest || actualAggregate !== pointer.catalogAggregateDigest) fail('AGGREGAT-DIGEST', actualAggregate);

for (const [relative, expected] of expectedDocuments) {
  if (!fs.existsSync(relative) || fs.readFileSync(relative, 'utf8').replace(/\r\n/gu, '\n') !== expected.replace(/\r\n/gu, '\n')) fail('DOKUMENT-DETERMINISMUS', relative);
  const artifact = source.catalog.generatedArtifacts.find(item => item.path === relative);
  const record = manifest.records.find(item => item.sourcePath === relative);
  if (!artifact || !record || !artifact.references?.length || JSON.stringify(record.references) !== JSON.stringify(artifact.references)) fail('DOKUMENT-REFERENZEN', relative);
}
for (const artifact of source.catalog.generatedArtifacts) {
  if (!index.artifacts.some(item => item.id === artifact.id && item.path === artifact.path) || !manifest.records.some(item => item.id === artifact.id && item.sourcePath === artifact.path)) fail('V4-ARTEFAKT-FEHLT', artifact.id);
}
for (const id of ['UABC-51', 'UABC-52', 'UABC-53']) if (!index.referenceDefinitions.jiraRefs.includes(id)) fail('V4-TICKET-REFERENZ', id);
if (index.runtime?.requiresGit !== false || index.runtime?.readOnly !== true || index.catalogModel.projects?.[0]?.sourcePath !== 'evidence/simulation/operating-cycle-v4.json' || index.catalogModel.supportEngagements?.[0]?.sourcePath !== 'docs/handover/bc-basic-v4-support-handover.md') fail('INDEX-LAUFZEIT', JSON.stringify(index.runtime));
if (manifest.projects?.[0]?.sourcePath !== 'evidence/simulation/operating-cycle-v4.json' || manifest.supportEngagements?.[0]?.sourcePath !== 'docs/handover/bc-basic-v4-support-handover.md') fail('MANIFEST-REFERENZEN', 'Projekt oder Support zeigt nicht auf V4.');
if (journal.ticketProjections.find(item => item.id === 'UABC-53')?.worklog.hours !== 1 || journal.billing.cumulativeHours !== 83 || journal.billing.cumulativeNetAmount !== 9960 || journal.billing.cumulativeNetAmount >= 10000) fail('M4-BUDGET', JSON.stringify(journal.billing));
if (journal.truthBoundary.realCustomerApprovalClaimed !== false || journal.truthBoundary.vatTransmitted !== false || journal.projectClosure.customerAcceptanceClaimed !== false || journal.projectClosure.productionStartClaimed !== false || journal.projectClosure.realGates.some(item => item.status !== 'offen')) fail('REALE-GATES', 'Reale Freigabe oder Uebermittlung behauptet.');
const v3ManifestSha = sha256(fs.readFileSync(v3ManifestPath));
const v3Manifest = JSON.parse(fs.readFileSync(v3ManifestPath, 'utf8'));
if (v3ManifestSha !== 'ce92caf9d612bf8fff8fd84cc12c5e13fd20bc8ec3535b13ac4ba0b931cb7c8f' || v3Manifest.payloadBundleDigest !== 'bc691ce634b38e782280016bf3e34ac683d70f705a3bb4be46f995ef37e2e57b' || countFiles(v3Dir) !== 125) fail('V3-UNVERAENDERT', `${v3ManifestSha}/${v3Manifest.payloadBundleDigest}/${countFiles(v3Dir)}`);
if (fs.readdirSync('exports/project-data/v1/snapshots/releases').some(name => name.startsWith('.staging-')) || fs.existsSync(`${pointerPath}.tmp`) || fs.existsSync(`${candidatePath}.tmp`)) fail('ATOMARITAET', 'Staging- oder temporaere Zeigerdatei vorhanden.');

if (errors.length) {
  console.error(`V4-Katalogpruefung fehlgeschlagen (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`V4-Katalogpruefung bestanden: ${manifest.artifactCount} Payloads, Manifest ${pointer.manifestSha256}, Bundle ${pointer.payloadBundleDigest}, Aggregat ${pointer.catalogAggregateDigest}, requiresGit=false, V3 unveraendert.`);

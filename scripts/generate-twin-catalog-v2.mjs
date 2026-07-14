import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { canonicalBundleDigest, sha256 } from './lib/twin-catalog-digest.mjs';

const root = process.cwd();
const base = path.join(root, 'exports/project-data/v1/snapshots');
const releaseId = process.env.TWIN_V2_RELEASE_ID || 'UABC-CUSTOMER-001-CATALOG-20260714-V2-FINAL';
const releaseDir = path.join(base, 'releases', releaseId);
const sourceIndex = YAML.parse(fs.readFileSync(path.join(root, 'exports/project-data/v1/index.yaml'), 'utf8'));
const safe = value => typeof value === 'string' && !path.isAbsolute(value) && !value.includes('\\') && value.split('/').every(part => part && part !== '.' && part !== '..');
const internal = new Set(['docs/research/sources.yaml', 'evidence/simulation/adapter-provenance.json', 'evidence/simulation/reference-graph-coverage.json', 'evidence/verification-register.yaml', 'exports/project-data/v1/document-catalog.json', 'exports/project-data/v1/reference-graph-mapping.json', 'exports/project-data/v1/reference-simulation.json', 'governance/production-readiness.json', 'project/bc-basic/reference-simulation.yaml']);
const artifacts = (sourceIndex.artifacts ?? []).filter(artifact => safe(artifact.path) && !internal.has(artifact.path) && !/^(scripts|tests|openspec|governance\/schemas)\//.test(artifact.path) && !/^exports\/project-data\/v1\/snapshots\//.test(artifact.path) && !/^(package\.json|package-lock\.json|REVIEW\.md)$/.test(artifact.path));
if (!artifacts.length) throw new Error('V2-Index enthält keine sichtbaren Artefakte.');
fs.rmSync(releaseDir, { recursive: true, force: true });
fs.mkdirSync(releaseDir, { recursive: true });
const indexYaml = YAML.stringify({ ...sourceIndex, artifacts, artifactCount: artifacts.length, runtime: { ...(sourceIndex.runtime ?? {}), requiresGit: false, readOnly: true, entryPoint: 'exports/project-data/v1/snapshots/current.json' } });
fs.writeFileSync(path.join(releaseDir, 'project-index.yaml'), indexYaml, 'utf8');
const records = [];
for (const artifact of artifacts) {
  const source = path.join(root, artifact.path);
  if (!fs.existsSync(source)) continue;
  const bytes = Buffer.from(fs.readFileSync(source).toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  const payloadPath = `payload/${artifact.path}`;
  const target = path.join(releaseDir, payloadPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  records.push({ id: artifact.id, kind: artifact.kind ?? 'fachartefakt', sourcePath: artifact.path, payloadPath, sizeBytes: bytes.length, sha256: sha256(bytes), visibility: 'nur-lesend', references: artifact.references ?? [] });
}
const resourceCatalog = { schemaVersion: 1, catalogId: 'UABC-RESOURCE-CATALOG-V2', customerId: 'UABC-CUSTOMER-001', projectId: 'UABC-BC-BASIC-001', readOnly: true, resources: records.map(record => ({ resourceId: record.id, relativePath: record.payloadPath, type: record.kind, title: record.sourcePath, digest: record.sha256, sizeBytes: record.sizeBytes, references: record.references, visibility: record.visibility })) };
const resourceBytes = Buffer.from(`${JSON.stringify(resourceCatalog, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(releaseDir, 'resource-catalog.json'), resourceBytes);
const indexBytes = fs.readFileSync(path.join(releaseDir, 'project-index.yaml'));
const payloadBundleDigest = canonicalBundleDigest(records);
const manifest = { schemaVersion: 1, manifestContract: 'uabc-customer-catalog-release-v1', releaseId, immutable: true, readOnly: true, customerId: 'UABC-CUSTOMER-001', projects: sourceIndex.catalogModel.projects, supportEngagements: sourceIndex.catalogModel.supportEngagements, projectIndexPath: 'project-index.yaml', resourceCatalogPath: 'resource-catalog.json', projectIndex: { path: 'project-index.yaml', sizeBytes: indexBytes.length, sha256: sha256(indexBytes) }, resourceCatalog: { path: 'resource-catalog.json', sizeBytes: resourceBytes.length, sha256: sha256(resourceBytes) }, artifactCount: records.length, records, payloadBundleDigest, digestAlgorithm: 'SHA-256', spectraBinding: { productId: 'spectra', repositoryUrl: 'https://github.com/sivla/BCProjectOS.git', releaseVersion: '1.0.0', releaseTag: 'spectra-v1.0.0', bindingStatus: 'BOUND' }, producerCommitProvenance: null, runtime: { requiresGit: false, readOnly: true, currentPointer: 'exports/project-data/v1/snapshots/current.json' } };
fs.writeFileSync(path.join(releaseDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
const candidate = { schemaVersion: 1, pointerContract: 'uabc-customer-catalog-current-v1', customerId: 'UABC-CUSTOMER-001', currentReleaseId: releaseId, releasePath: `exports/project-data/v1/snapshots/releases/${releaseId}`, manifestPath: `exports/project-data/v1/snapshots/releases/${releaseId}/manifest.json`, manifestSha256: sha256(fs.readFileSync(path.join(releaseDir, 'manifest.json'))), payloadBundleDigest, artifactCount: records.length, readOnly: true, requiresGit: false, bindingStatus: 'BOUND_BCPROJECTOS_RELEASE', updatedAt: '2026-07-14T18:00:00+02:00' };
fs.writeFileSync(path.join(base, 'current-v2.candidate.json'), `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
console.log(`V2-Katalogrelease erzeugt: ${releaseId}; ${records.length} Artefakte; kanonischer Bundle-Digest ${payloadBundleDigest}.`);

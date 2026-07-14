import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = process.cwd();
const indexPath = path.join(root, 'exports/project-data/v1/index.yaml');
const releaseId = 'UABC-CUSTOMER-001-CATALOG-20260714-V1';
const base = path.join(root, 'exports/project-data/v1/snapshots');
const releaseDir = path.join(base, 'releases', releaseId);
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const safe = (relative) => typeof relative === 'string' && !path.isAbsolute(relative) && !relative.includes('\\') && relative.split('/').every((part) => part && part !== '.' && part !== '..');
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const index = YAML.parse(readFileSync(indexPath, 'utf8'));
const visible = (artifact) => {
  const p = artifact.path;
  const internal = new Set(['docs/research/sources.yaml', 'evidence/simulation/adapter-provenance.json', 'evidence/simulation/reference-graph-coverage.json', 'evidence/verification-register.yaml', 'exports/project-data/v1/document-catalog.json', 'exports/project-data/v1/reference-graph-mapping.json', 'exports/project-data/v1/reference-simulation.json', 'governance/production-readiness.json', 'project/bc-basic/reference-simulation.yaml']);
  return safe(p) && !internal.has(p) && !/^(scripts|tests|openspec|governance\/schemas)\//.test(p) && !/^exports\/project-data\/v1\/snapshots\//.test(p) && !/^(package\.json|package-lock\.json|REVIEW\.md)$/.test(p);
};
index.artifacts = (index.artifacts ?? []).filter(visible);
const canonicalDocumentArtifacts = [
  ['UABC-SRC-BCB-DPLAN-001', 'delivery-plan', 'docs/guides/bc-basic-delivery-plan.md'],
  ['UABC-SRC-BCB-DESIGN-001', 'solution-design', 'docs/guides/bc-basic-solution-design.md'],
  ['UABC-SRC-BCB-OPENSPEC-001', 'openspec-change', 'docs/guides/bc-basic-change-record.md'],
  ['UABC-SRC-BCB-SPEC-001', 'requirements', 'docs/guides/bc-basic-requirements.md'],
  ['UABC-SRC-BCB-TASKS-001', 'delivery-tasks', 'docs/guides/bc-basic-delivery-tasks.md'],
  ['UABC-SRC-BCB-VPLAN-001', 'verification-plan', 'docs/guides/bc-basic-verification-plan.md']
];
for (const [id, kindId, artifactPath] of canonicalDocumentArtifacts) {
  if (!index.artifacts.some((artifact) => artifact.id === id)) index.artifacts.push({ id, kindId, kind: kindId, path: artifactPath, format: 'markdown', required: true });
}
index.governingChange = 'consolidate-bc-basic-canonical-project-v1';
index.sourceOfTruth = 'kundenprojekt';
index.contractRole = 'dateisystem-katalog-index';
index.snapshotManifestIncluded = true;
index.catalogModel = {
  model: 'customer-catalog-v1',
  customerId: 'UABC-CUSTOMER-001',
  projects: [{ projectId: 'UABC-BC-BASIC-001', projectType: 'implementation', status: 'simulated-complete', sourcePath: 'evidence/simulation/project-story.json' }],
  supportEngagements: [{ engagementId: 'UABC-SUPPORT-HANDOVER-001', mode: 'simulated-handover', status: 'simulated-complete', projectId: 'UABC-BC-BASIC-001', sourcePath: 'project/bc-basic/handover.yaml' }],
  isolation: { crossCustomerReferences: false, customerScope: 'UABC-CUSTOMER-001' },
  allowedProjectTypes: ['implementation', 'fit-gap', 'migration', 'upgrade', 'enhancement']
};
index.runtime = { reader: 'project-twin', requiresGit: false, readOnly: true, entryPoint: 'exports/project-data/v1/snapshots/current.json' };
index.artifactCount = index.artifacts.length;
rmSync(releaseDir, { recursive: true, force: true });
mkdirSync(releaseDir, { recursive: true });
const indexYaml = YAML.stringify(index).replaceAll('customer-onboarding', 'kundenaufnahme');
const indexBytes = Buffer.from(indexYaml, 'utf8');
writeFileSync(path.join(releaseDir, 'project-index.yaml'), indexBytes);

const records = [];
for (const artifact of index.artifacts) {
  const source = artifact.path;
  if (!existsSync(path.join(root, source))) continue;
  const original = readFileSync(path.join(root, source));
  const bytes = Buffer.from(original.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
  const payloadPath = `payload/${source}`;
  const target = path.join(releaseDir, payloadPath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  records.push({ id: artifact.id, kind: artifact.kind ?? 'fachartefakt', sourcePath: source, payloadPath, sizeBytes: bytes.length, sha256: sha(bytes), visibility: 'nur-lesend', references: artifact.references ?? [] });
}
const resourceCatalog = { schemaVersion: 1, catalogId: 'UABC-RESOURCE-CATALOG-V1', customerId: 'UABC-CUSTOMER-001', projectId: 'UABC-BC-BASIC-001', readOnly: true, resources: records.map((r) => ({ resourceId: r.id, relativePath: r.payloadPath, type: r.kind, title: r.sourcePath, digest: r.sha256, sizeBytes: r.sizeBytes, references: r.references, visibility: r.visibility })) };
writeJson(path.join(releaseDir, 'resource-catalog.json'), resourceCatalog);
const payloadBundleDigest = sha(Buffer.from(records.map((r) => `${r.payloadPath}\0${r.sizeBytes}\0${r.sha256}`).join('\n'), 'utf8'));
const manifest = { schemaVersion: 1, manifestContract: 'uabc-customer-catalog-release-v1', releaseId, immutable: true, readOnly: true, customerId: 'UABC-CUSTOMER-001', projects: index.catalogModel.projects, supportEngagements: index.catalogModel.supportEngagements, projectIndexPath: 'project-index.yaml', resourceCatalogPath: 'resource-catalog.json', artifactCount: records.length, records, payloadBundleDigest, digestAlgorithm: 'SHA-256', spectraBinding: { productId: 'spectra', repositoryUrl: 'https://github.com/sivla/BCProjectOS.git', releaseVersion: '1.0.0', releaseTag: 'spectra-v1.0.0', bindingStatus: 'BOUND' }, producerCommitProvenance: null, runtime: { requiresGit: false, readOnly: true, currentPointer: 'exports/project-data/v1/snapshots/current.json' } };
writeJson(path.join(releaseDir, 'manifest.json'), manifest);
const manifestBytes = readFileSync(path.join(releaseDir, 'manifest.json'));
writeJson(path.join(base, 'current.json'), { schemaVersion: 1, pointerContract: 'uabc-customer-catalog-current-v1', customerId: 'UABC-CUSTOMER-001', currentReleaseId: releaseId, releasePath: `exports/project-data/v1/snapshots/releases/${releaseId}`, manifestPath: `exports/project-data/v1/snapshots/releases/${releaseId}/manifest.json`, manifestSha256: sha(manifestBytes), payloadBundleDigest, artifactCount: records.length, readOnly: true, requiresGit: false, bindingStatus: 'BOUND_BCPROJECTOS_RELEASE', updatedAt: '2026-07-14T16:00:00+02:00' });
writeFileSync(indexPath, indexYaml, 'utf8');
console.log(`Twin-Katalogrelease erzeugt: ${releaseId}; ${records.length} Artefakte; Payload-Digest ${payloadBundleDigest}.`);

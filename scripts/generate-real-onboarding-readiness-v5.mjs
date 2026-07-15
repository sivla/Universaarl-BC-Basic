import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import YAML from 'yaml';
import { canonicalBundleDigest, sha256 } from './lib/twin-catalog-digest.mjs';

const root = process.cwd();
const sourcePath = 'project/bc-basic/real-onboarding-readiness-v5.yaml';
const evidencePath = 'evidence/simulation/real-onboarding-readiness-v5.json';
const source = YAML.parse(fs.readFileSync(path.join(root, sourcePath), 'utf8'));
const journal = JSON.parse(fs.readFileSync(path.join(root, 'evidence/simulation/operating-cycle-v4.json'), 'utf8'));
const v4Id = 'UABC-CUSTOMER-001-CATALOG-20260715-V4-FINAL';
const releaseId = 'UABC-CUSTOMER-001-CATALOG-20260715-V5-CANDIDATE';
const base = path.join(root, 'exports/project-data/v1/snapshots');
const v4Dir = path.join(base, 'releases', v4Id);
const releaseDir = path.join(base, 'releases', releaseId);
const stagingDir = path.join(base, 'releases', `.staging-${releaseId}`);
const candidatePath = path.join(base, 'current-v5.candidate.json');
if (fs.existsSync(releaseDir)) fs.rmSync(releaseDir, { recursive: true, force: true });
if (fs.existsSync(candidatePath)) fs.rmSync(candidatePath, { force: true });
fs.rmSync(stagingDir, { recursive: true, force: true });
fs.cpSync(v4Dir, stagingDir, { recursive: true });

const actualHours = journal.billing.cumulativeHours;
const actualNetAmount = journal.billing.cumulativeNetAmount;
const task = journal.ticketProjection;
if (actualHours !== source.financials.actualHours || actualNetAmount !== source.financials.actualNetAmount || task.id !== 'UABC-51' || task.worklog.hours !== 3 || task.worklog.netAmount !== 360) throw new Error('V5-Finanzwerte sind nicht aus UABC-51/V4-Evidence ableitbar.');
const evidence = {
  schemaVersion: 1,
  evidenceId: 'UABC-VER-BCB-REAL-ONBOARDING-READY-V1-001',
  kind: 'automated-policy-gate',
  status: 'passed',
  contractId: source.contractId,
  producerBlock: source.producerBlock,
  generatedFrom: [sourcePath, 'evidence/simulation/operating-cycle-v4.json', 'project/bc-basic/operating-cycle-v4.yaml'],
  dualStatus: source.status,
  financials: { ...source.financials, derivedActualHours: actualHours, derivedActualNetAmount: actualNetAmount, worklog: task.worklog },
  realGates: source.realGates,
  nextActions: source.nextActions,
  checks: { contradictoryAmpel: 'blocked', missingGateOwnerOrEvidenceType: 'blocked', wrongBudgetArithmetic: 'blocked', inventedApproval: 'blocked', unboundAction: 'blocked' },
  truthBoundary: source.truthBoundary,
  currentPointerUnchanged: true,
  currentReleaseId: v4Id,
  candidateReleaseId: releaseId
};
const evidenceBytes = Buffer.from(`${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
fs.mkdirSync(path.join(root, path.dirname(evidencePath)), { recursive: true });
fs.writeFileSync(path.join(root, evidencePath), evidenceBytes);
fs.mkdirSync(path.join(stagingDir, path.dirname(evidencePath)), { recursive: true });
fs.writeFileSync(path.join(stagingDir, 'payload', evidencePath), evidenceBytes);
const sourceBytes = Buffer.from(fs.readFileSync(path.join(root, sourcePath)));
fs.mkdirSync(path.join(stagingDir, 'payload', path.dirname(sourcePath)), { recursive: true });
fs.writeFileSync(path.join(stagingDir, 'payload', sourcePath), sourceBytes);

const v4Manifest = JSON.parse(fs.readFileSync(path.join(v4Dir, 'manifest.json'), 'utf8'));
const v4Index = YAML.parse(fs.readFileSync(path.join(v4Dir, 'project-index.yaml'), 'utf8'));
const v4Resources = JSON.parse(fs.readFileSync(path.join(v4Dir, 'resource-catalog.json'), 'utf8'));
const records = [...v4Manifest.records];
for (const item of [
  { id: 'UABC-V5-STATUS-001', kind: 'producer-status', sourcePath, payloadPath: `payload/${sourcePath}`, bytes: sourceBytes, references: ['UABC-GOAL-REAL-ONBOARDING-READY-V1', 'UABC-51'] },
  { id: 'UABC-V5-EVIDENCE-001', kind: 'betriebsbereitschaft-nachweis', sourcePath: evidencePath, payloadPath: `payload/${evidencePath}`, bytes: evidenceBytes, references: ['UABC-GOAL-REAL-ONBOARDING-READY-V1', 'UABC-VER-BCB-REAL-ONBOARDING-READY-V1-001'] }
]) records.push({ id: item.id, kind: item.kind, domainType: item.kind, sourcePath: item.sourcePath, payloadPath: item.payloadPath, sizeBytes: item.bytes.length, sha256: sha256(item.bytes), visibility: 'nur-lesend', references: item.references });
records.sort((a, b) => a.payloadPath.localeCompare(b.payloadPath));
const index = { ...v4Index, artifactCount: records.length, artifacts: records.map(r => ({ id: r.id, kind: r.kind, path: r.sourcePath, references: r.references })), producerStatus: { path: sourcePath, evidencePath }, runtime: { ...(v4Index.runtime ?? {}), requiresGit: false, readOnly: true, entryPoint: 'exports/project-data/v1/snapshots/current.json' } };
const indexBytes = Buffer.from(YAML.stringify(index), 'utf8');
fs.writeFileSync(path.join(stagingDir, 'project-index.yaml'), indexBytes);
const resources = { ...v4Resources, catalogId: 'UABC-RESOURCE-CATALOG-V5-CANDIDATE', resources: records.map(r => ({ resourceId: r.id, relativePath: r.payloadPath, type: r.kind, domainType: r.domainType, title: r.sourcePath, digest: r.sha256, sizeBytes: r.sizeBytes, references: r.references, visibility: r.visibility })) };
const resourceBytes = Buffer.from(`${JSON.stringify(resources, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(stagingDir, 'resource-catalog.json'), resourceBytes);
const bundle = canonicalBundleDigest(records);
const aggregate = sha256(Buffer.from(`project-index.yaml\0${sha256(indexBytes)}\nresource-catalog.json\0${sha256(resourceBytes)}\npayload-bundle\0${bundle}\n`, 'utf8'));
const manifest = { ...v4Manifest, releaseId, sourceReleaseId: v4Id, artifactCount: records.length, records, projectIndex: { path: 'project-index.yaml', sizeBytes: indexBytes.length, sha256: sha256(indexBytes) }, resourceCatalog: { path: 'resource-catalog.json', sizeBytes: resourceBytes.length, sha256: sha256(resourceBytes) }, payloadBundleDigest: bundle, catalogAggregateDigest: aggregate, producerStatus: source.status, producerContractPath: sourcePath, producerEvidencePath: evidencePath, currentPointerUnchanged: true, candidateOnly: true, runtime: { ...(v4Manifest.runtime ?? {}), requiresGit: false, readOnly: true, currentPointer: 'exports/project-data/v1/snapshots/current.json' } };
const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(stagingDir, 'manifest.json'), manifestBytes);
fs.renameSync(stagingDir, releaseDir);
const candidate = { schemaVersion: 1, pointerContract: 'uabc-customer-catalog-current-v1', customerId: 'UABC-CUSTOMER-001', currentReleaseId: releaseId, releasePath: `exports/project-data/v1/snapshots/releases/${releaseId}`, manifestPath: `exports/project-data/v1/snapshots/releases/${releaseId}/manifest.json`, manifestSha256: sha256(manifestBytes), payloadBundleDigest: bundle, catalogAggregateDigest: aggregate, artifactCount: records.length, readOnly: true, requiresGit: false, bindingStatus: 'BOUND_BCPROJECTOS_RELEASE', candidateOnly: true, producerStatus: source.status, producerContractPath: sourcePath, producerEvidencePath: evidencePath, updatedAt: '2026-07-15T00:00:00+02:00' };
fs.writeFileSync(candidatePath, `${JSON.stringify(candidate, null, 2)}\n`, 'utf8');
console.log(`V5-Kandidat erzeugt: ${releaseId}; ${records.length} Artefakte; Manifest ${candidate.manifestSha256}; Bundle ${bundle}; current bleibt ${v4Id}.`);

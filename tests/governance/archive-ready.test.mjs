import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const repositoryRoot = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const activeChange = 'establish-playthru-environment-baseline';
const bcBasicChange = 'deliver-bc-basic-customer-project';
const pilotSetupChange = 'document-uabc-basic-de-playthru-setup-baseline';
const countryCompanyExecutionChange = 'record-uabc-basic-de-country-company-information-execution';
const portableSnapshotChange = 'prepare-portable-snapshot-pilot';
const npmCli = process.env.npm_execpath ?? path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
const openSpecCli = path.join(repositoryRoot, 'node_modules', '@fission-ai', 'openspec', 'bin', 'openspec.js');
const allowedReadOnlyRequestClasses = ['GET', 'HEAD', 'OPTIONS'].flatMap((method) => ['document', 'script', 'stylesheet', 'image', 'font', 'xhr', 'fetch'].map((resourceType) => `${method}:${resourceType}`)).sort();

async function readYaml(root, relative) {
  return YAML.parse(await fs.readFile(path.join(root, relative), 'utf8'));
}

async function writeYaml(root, relative, value) {
  await fs.writeFile(path.join(root, relative), YAML.stringify(value), 'utf8');
}

async function readJson(root, relative) {
  return JSON.parse(await fs.readFile(path.join(root, relative), 'utf8'));
}

async function writeJson(root, relative, value) {
  await fs.writeFile(path.join(root, relative), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function collectEvidenceIds(value, result = new Set()) {
  if (Array.isArray(value)) for (const item of value) collectEvidenceIds(item, result);
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'evidenceIds' && Array.isArray(item)) for (const id of item) result.add(id);
      else collectEvidenceIds(item, result);
    }
  }
  return result;
}

function execute(root, command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  return { ...result, output: `${result.stdout ?? ''}\n${result.stderr ?? ''}` };
}

const npmRun = (root, script) => execute(root, process.execPath, [npmCli, 'run', script]);

function openSpecArchive(root) {
  return execute(root, process.execPath, [openSpecCli, 'archive', activeChange, '--yes', '--json']);
}

function compareBaselineRuns(root) {
  return execute(root, process.execPath, ['tests/playwright/helpers/bc-evidence.mjs', 'compare']);
}

function schema2TargetBinding() {
  return {
    targetId: '[redacted-target-id]',
    verified: true,
    fingerprintAlgorithm: 'hmac-sha256',
    protocol: 'https:',
    host: 'businesscentral.dynamics.com',
    port: 443,
    environment: 'playthru',
    tenant: '[redacted-tenant]',
    basePath: '/[redacted-tenant]/playthru'
  };
}

function upgradeManifestToSchema2(manifest, overrides = {}) {
  const targetBinding = schema2TargetBinding();
  const readOnlyGuard = {
    mode: 'businesscentral-network-read-only-fail-closed',
    installation: { httpRoute: true, webSocketRoute: true, serviceWorkers: 'block' },
    observedBusinessCentralRequests: 1,
    allowedRequests: 1,
    observedRequestClasses: ['GET:document'],
    allowedRequestClasses: [...allowedReadOnlyRequestClasses],
    blockedMutationAttempts: 0,
    blockedRequests: [],
    targetBinding: structuredClone(targetBinding),
    targetBoundaryVerified: true,
    limit: 'Synthetische, vollstaendig redigierte Nur-Lese-Projektion fuer Regressionen.'
  };
  return { ...manifest, schemaVersion: 2, targetBinding, readOnlyGuard, ...overrides };
}

async function disposableRepository(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'uabc-archive-ready-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.cp(repositoryRoot, root, {
    recursive: true,
    filter(source) {
      const relative = path.relative(repositoryRoot, source);
      const first = relative.split(path.sep)[0];
      return !['.git', '.tmp', 'node_modules'].includes(first);
    }
  });
  await fs.symlink(path.join(repositoryRoot, 'node_modules'), path.join(root, 'node_modules'), 'junction');
  const changesRoot = path.join(root, 'openspec', 'changes');
  for (const entry of await fs.readdir(changesRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'archive' && entry.name !== activeChange) {
      await fs.rm(path.join(changesRoot, entry.name), { recursive: true, force: true });
    }
  }
  const activePath = path.join(changesRoot, activeChange);
  try {
    await fs.access(activePath);
  } catch {
    const archiveRoot = path.join(changesRoot, 'archive');
    const archivedName = (await fs.readdir(archiveRoot)).filter((name) => name.endsWith(`-${activeChange}`)).sort().at(-1);
    assert.ok(archivedName, `archivierte Fixture-Quelle fuer ${activeChange} fehlt`);
    await fs.cp(path.join(archiveRoot, archivedName), activePath, { recursive: true });
    await fs.rm(path.join(archiveRoot, archivedName), { recursive: true, force: true });
  }
  for (const relative of [
    'atlassian/jira/issues/walkthrough-pilot.yaml',
    'atlassian/confluence/pages/61-walkthrough-pilot.md',
    'artifacts/walkthrough',
    'exports/project-artifacts',
    'atlassian/jira/issues/bc-basic-project.yaml',
    'atlassian/confluence/meetings',
    'atlassian/confluence/pages/70-bc-basic-project.md',
    'atlassian/confluence/pages/71-bc-basic-discovery.md',
    'atlassian/confluence/pages/72-bc-basic-implementation.md',
    'atlassian/confluence/pages/73-bc-basic-hypercare.md',
    'atlassian/confluence/pages/74-bc-basic-deliverables.md',
    'atlassian/confluence/pages/75-bc-basic-meetings-decisions.md',
    'docs/guides/beginner/business-central-basic.md',
    'docs/runbooks/business-central-basic.md',
    'exports/project-data',
    'playwright/scenarios/bc-basic-e2e.yaml',
    'project/bc-basic'
  ]) await fs.rm(path.join(root, relative), { recursive: true, force: true });
  for (const name of await fs.readdir(path.join(changesRoot, 'archive'))) {
    if (name.endsWith('-establish-project-artifact-walkthrough-pilot') || name.endsWith(`-${bcBasicChange}`) || name.endsWith('-migrate-bc-basic-to-three-space-confluence-v1') || name.endsWith('-make-bc-basic-jira-story-human-readable-v1') || name.endsWith(`-${pilotSetupChange}`) || name.endsWith(`-${countryCompanyExecutionChange}`) || name.endsWith(`-${portableSnapshotChange}`)) await fs.rm(path.join(changesRoot, 'archive', name), { recursive: true, force: true });
  }
  const verificationPath = 'evidence/verification-register.yaml';
  const register = await readYaml(root, verificationPath);
  const removedFixtureChanges = new Set([
    'establish-project-artifact-walkthrough-pilot',
    bcBasicChange,
    'migrate-bc-basic-to-three-space-confluence-v1',
    'make-bc-basic-jira-story-human-readable-v1',
    pilotSetupChange,
    countryCompanyExecutionChange,
    portableSnapshotChange
  ]);
  register.verifications = register.verifications.filter((item) => !removedFixtureChanges.has(item.changeRef));
  await writeYaml(root, verificationPath, register);
  return root;
}

async function setPolicyGate(root, status) {
  const register = await readYaml(root, 'evidence/verification-register.yaml');
  const policyGate = register.verifications.find((item) => item.id === 'UABC-VER-ENV-POLICY-GATE-001');
  policyGate.status = status;
  policyGate.executedAt = status === 'passed' ? '2026-07-10' : null;
  policyGate.evidence = status === 'passed' ? 'Wegwerfbares automatisiertes Policy-Gate; nie in das echte Repository kopiert.' : null;
  await writeYaml(root, 'evidence/verification-register.yaml', register);
}

async function prepareAppliedPolicyState(root) {
  const changePath = `openspec/changes/${activeChange}/.openspec.yaml`;
  const change = await readYaml(root, changePath);
  change.proposedCanonicalUpdate.status = 'applied';
  await writeYaml(root, changePath, change);
  await setPolicyGate(root, 'passed');

  const architecturePath = 'architecture/enterprise-blueprint.yaml';
  const architecture = await readYaml(root, architecturePath);
  const factEvidenceIds = collectEvidenceIds(change.proposedCanonicalUpdate.facts);
  architecture.actualSandboxBaseline = {
    status: 'approved',
    governingChange: activeChange,
    policyGateEvidenceId: change.proposedCanonicalUpdate.policyGateEvidenceId,
    facts: structuredClone(change.proposedCanonicalUpdate.facts),
    unknowns: structuredClone(change.proposedCanonicalUpdate.unknowns),
    evidenceIds: [...factEvidenceIds, change.proposedCanonicalUpdate.policyGateEvidenceId].sort()
  };
  await writeYaml(root, architecturePath, architecture);
}

async function removeEnvironmentMainSpec(root) {
  await fs.rm(path.join(root, 'openspec/specs/environment-baseline'), { recursive: true, force: true });
}

test('W0-Freigabe ersetzt das aktive automatisierte W1-Policy-Gate nicht', async (t) => {
  const root = await disposableRepository(t);
  const register = await readYaml(root, 'evidence/verification-register.yaml');
  assert.equal(register.verifications.find((item) => item.id === 'UABC-VER-BLUEPRINT-APPROVAL-001').status, 'passed');
  await setPolicyGate(root, 'pending');
  const result = npmRun(root, 'validate:archive-ready');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /erfordert ein passed automatisiertes Policy-Gate des aktiven Changes/);
  assert.match(result.output, /UABC-VER-ENV-POLICY-GATE-001.*pending/);
});

test('nicht adressierter Capability-Katalog wird nicht neu freigabepflichtig', async (t) => {
  const root = await disposableRepository(t);
  await setPolicyGate(root, 'pending');
  const result = npmRun(root, 'validate:archive-ready');
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.output, /capability-catalog/);
});

test('semantisch abweichende kanonische Fakten werden abgelehnt', async (t) => {
  const root = await disposableRepository(t);
  await prepareAppliedPolicyState(root);
  const architecturePath = 'architecture/enterprise-blueprint.yaml';
  const architecture = await readYaml(root, architecturePath);
  architecture.actualSandboxBaseline.facts.environment.value = 'different-environment';
  await writeYaml(root, architecturePath, architecture);
  const result = npmRun(root, 'validate:archive-ready');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /facts weichen semantisch vom proposedCanonicalUpdate ab/);
});

test('gemeinsam manipulierte Architektur und archiviertes Update scheitern gegen Roh-Evidence', async (t) => {
  const root = await disposableRepository(t);
  await prepareAppliedPolicyState(root);
  await removeEnvironmentMainSpec(root);
  const archive = openSpecArchive(root);
  assert.equal(archive.status, 0, archive.output);
  const archiveRoot = path.join(root, 'openspec', 'changes', 'archive');
  const archivedName = (await fs.readdir(archiveRoot)).find((name) => name.endsWith(`-${activeChange}`));
  assert.ok(archivedName, 'archivierte Baseline-Fixture fehlt');

  const architecturePath = 'architecture/enterprise-blueprint.yaml';
  const architecture = await readYaml(root, architecturePath);
  architecture.actualSandboxBaseline.facts.environment.value = 'gemeinsam-manipuliert';
  await writeYaml(root, architecturePath, architecture);

  const archivedManifestPath = `openspec/changes/archive/${archivedName}/.openspec.yaml`;
  const archivedManifest = await readYaml(root, archivedManifestPath);
  archivedManifest.proposedCanonicalUpdate.facts.environment.value = 'gemeinsam-manipuliert';
  await writeYaml(root, archivedManifestPath, archivedManifest);

  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /Roh-Evidence-Projektion/);
});

test('gemeinsam manipulierte Run-Manifeste mit writesPerformed true scheitern in Vergleich und Validator', async (t) => {
  const root = await disposableRepository(t);
  for (const run of ['run-1', 'run-2']) {
    const relative = `evidence/playthru-environment-baseline/${run}/manifest.json`;
    const manifest = await readJson(root, relative);
    manifest.writesPerformed = true;
    await writeJson(root, relative, manifest);
  }
  const compare = compareBaselineRuns(root);
  assert.notEqual(compare.status, 0);
  assert.match(compare.output, /writesPerformed muss fuer die read-only Baseline exakt false sein/);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /writesPerformed muss fuer die read-only Baseline exakt false sein/);
});

test('historische writesPerformed-Werte null und String scheitern typstreng', async (t) => {
  const root = await disposableRepository(t);
  const relative = 'evidence/playthru-environment-baseline/run-1/manifest.json';
  for (const value of [null, 'false']) {
    const manifest = await readJson(repositoryRoot, relative);
    manifest.writesPerformed = value;
    await writeJson(root, relative, manifest);
    const compare = compareBaselineRuns(root);
    assert.notEqual(compare.status, 0);
    assert.match(compare.output, /writesPerformed muss boolean sein/);
    const result = npmRun(root, 'validate:references');
    assert.notEqual(result.status, 0);
    assert.match(result.output, /writesPerformed muss boolean sein/);
  }
});

test('legacy-absent akzeptiert nur die exakten historischen Manifestbytes am gebundenen Pfad', async (t) => {
  const root = await disposableRepository(t);
  const relative = 'evidence/playthru-environment-baseline/run-1/manifest.json';
  const manifestPath = path.join(root, relative);
  const original = await fs.readFile(manifestPath, 'utf8');
  await fs.writeFile(manifestPath, `${original} `, 'utf8');
  const compare = compareBaselineRuns(root);
  assert.notEqual(compare.status, 0);
  assert.match(compare.output, /SHA-256|Originalbytes/);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /SHA-256.*Originalbytes/);

  const withoutFact = JSON.parse(original);
  delete withoutFact.facts.environment;
  await writeJson(root, relative, withoutFact);
  const removedFieldComparison = compareBaselineRuns(root);
  assert.notEqual(removedFieldComparison.status, 0);
  assert.match(removedFieldComparison.output, /SHA-256|Originalbytes/);
  const removedFieldValidation = npmRun(root, 'validate:references');
  assert.notEqual(removedFieldValidation.status, 0);
  assert.match(removedFieldValidation.output, /SHA-256.*Originalbytes/);
});

test('neue Schema-2-Manifeste verlangen Guard und Zielbindung', async (t) => {
  const root = await disposableRepository(t);
  for (const run of ['run-1', 'run-2']) {
    const relative = `evidence/playthru-environment-baseline/${run}/manifest.json`;
    const manifest = await readJson(root, relative);
    manifest.schemaVersion = 2;
    await writeJson(root, relative, manifest);
  }
  const compare = compareBaselineRuns(root);
  assert.notEqual(compare.status, 0);
  assert.match(compare.output, /Schema 2 erfordert Guard und Zielbindung/);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /Schema 2 erfordert Guard und Zielbindung/);
});

test('vollstaendig redigierte Schema-2-Manifeste bestehen Vergleich und Rohprojektion', async (t) => {
  const root = await disposableRepository(t);
  for (const run of ['run-1', 'run-2']) {
    const relative = `evidence/playthru-environment-baseline/${run}/manifest.json`;
    await writeJson(root, relative, upgradeManifestToSchema2(await readJson(root, relative)));
  }
  const compare = compareBaselineRuns(root);
  assert.equal(compare.status, 0, compare.output);
  const result = npmRun(root, 'validate:references');
  assert.equal(result.status, 0, result.output);
});

test('gemeinsam manipulierte Run-Manifeste mit blockiertem Guard scheitern in Vergleich und Validator', async (t) => {
  const root = await disposableRepository(t);
  for (const run of ['run-1', 'run-2']) {
    const relative = `evidence/playthru-environment-baseline/${run}/manifest.json`;
    const manifest = upgradeManifestToSchema2(await readJson(root, relative));
    manifest.readOnlyGuard.observedBusinessCentralRequests = 1;
    manifest.readOnlyGuard.allowedRequests = 0;
    manifest.readOnlyGuard.observedRequestClasses = ['POST:xhr'];
    manifest.readOnlyGuard.blockedMutationAttempts = 1;
    manifest.readOnlyGuard.blockedRequests = [{ method: 'POST', url: 'https://businesscentral.dynamics.com/[tenant]/playthru', resourceType: 'xhr', reason: 'simulierter blockierter Versuch' }];
    await writeJson(root, relative, manifest);
  }
  const compare = compareBaselineRuns(root);
  assert.notEqual(compare.status, 0);
  assert.match(compare.output, /Mutationsindikatoren/);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /Mutationsversuche/);
});

test('Schema-2-Manifeste binden Guard, Ziel und unverfaelschte Zaehler', async (t) => {
  const root = await disposableRepository(t);
  for (const run of ['run-1', 'run-2']) {
    const relative = `evidence/playthru-environment-baseline/${run}/manifest.json`;
    const manifest = upgradeManifestToSchema2(await readJson(root, relative));
    manifest.readOnlyGuard.allowedRequests = 99;
    manifest.readOnlyGuard.targetBinding.basePath = '/[redacted-tenant]/anderes-ziel';
    await writeJson(root, relative, manifest);
  }
  const compare = compareBaselineRuns(root);
  assert.notEqual(compare.status, 0);
  assert.match(compare.output, /Zielbindung|targetBinding|Zaehler/);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /nicht exakt miteinander verbunden|manipulierte Zaehler/);
});

test('Schema-2-Manifeste lehnen kollusiv eingefuegte rohe Ziel- und URL-Felder ab', async (t) => {
  const root = await disposableRepository(t);
  for (const run of ['run-1', 'run-2']) {
    const relative = `evidence/playthru-environment-baseline/${run}/manifest.json`;
    const manifest = upgradeManifestToSchema2(await readJson(root, relative));
    manifest.targetBinding.rawTargetId = 'UABC-BC-TARGET-ROH';
    manifest.targetBinding.rawUrl = 'https://businesscentral.dynamics.com/roher-tenant/playthru';
    manifest.readOnlyGuard.targetBinding = structuredClone(manifest.targetBinding);
    await writeJson(root, relative, manifest);
  }
  const compare = compareBaselineRuns(root);
  assert.notEqual(compare.status, 0);
  assert.match(compare.output, /unerlaubte oder fehlende Felder|nicht redigierte Ziel-/);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /targetBinding enthaelt unerlaubte oder fehlende Felder|nicht redigierte Ziel-/);
});

test('Schema-2-Manifeste lehnen rohe Ziel-, URL- und HMAC-Werte in erlaubten Evidence-Feldern ab', async (t) => {
  const root = await disposableRepository(t);
  for (const run of ['run-1', 'run-2']) {
    const relative = `evidence/playthru-environment-baseline/${run}/manifest.json`;
    const manifest = upgradeManifestToSchema2(await readJson(root, relative));
    manifest.facts.environment.reason = `UABC-BC-TARGET-ROH https://businesscentral.dynamics.com/tenant-rohwert0123456789/playthru hex:${'ab'.repeat(32)}`;
    await writeJson(root, relative, manifest);
  }
  const compare = compareBaselineRuns(root);
  assert.notEqual(compare.status, 0);
  assert.match(compare.output, /nicht redigierte Ziel-, URL-, Tenant- oder Fingerprintdaten/);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /nicht redigierte Ziel-, URL-, Tenant-, HMAC- oder Fingerprintdaten/);
});

test('Schema-2-Manifeste lehnen kollusiv erweiterte Nur-Lese-Requestklassen ab', async (t) => {
  const root = await disposableRepository(t);
  for (const run of ['run-1', 'run-2']) {
    const relative = `evidence/playthru-environment-baseline/${run}/manifest.json`;
    const manifest = upgradeManifestToSchema2(await readJson(root, relative));
    manifest.readOnlyGuard.allowedRequestClasses.push('POST:xhr');
    manifest.readOnlyGuard.observedRequestClasses = ['POST:xhr'];
    await writeJson(root, relative, manifest);
  }
  const compare = compareBaselineRuns(root);
  assert.notEqual(compare.status, 0);
  assert.match(compare.output, /Nur-Lese-Klassenvertrag/);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /Nur-Lese-Klassenvertrag|beobachtete Requestklassen/);
});

test('rohes Archiv bleibt ungueltig wenn das automatisierte Policy-Gate nicht erfuellt war', async (t) => {
  const root = await disposableRepository(t);
  await removeEnvironmentMainSpec(root);
  const changePath = `openspec/changes/${activeChange}/.openspec.yaml`;
  const change = await readYaml(root, changePath);
  change.proposedCanonicalUpdate.status = 'unapplied';
  await writeYaml(root, changePath, change);
  await setPolicyGate(root, 'pending');

  const archive = openSpecArchive(root);
  assert.equal(archive.status, 0, archive.output);
  const strict = npmRun(root, 'validate:openspec');
  assert.equal(strict.status, 0, strict.output);
  const custom = npmRun(root, 'validate:references');
  assert.notEqual(custom.status, 0);
  assert.match(custom.output, /archiviertes automatisiertes Policy-Gate erfordert proposedCanonicalUpdate-Status applied/);
  assert.match(custom.output, /archiviertes automatisiertes Policy-Gate UABC-VER-ENV-POLICY-GATE-001 muss passed bleiben und Evidence besitzen/);
});

test('Post-Archive-Validierung lehnt kanonische Drift gegenueber dem archivierten Update ab', async (t) => {
  const root = await disposableRepository(t);
  await prepareAppliedPolicyState(root);
  await removeEnvironmentMainSpec(root);
  const archive = openSpecArchive(root);
  assert.equal(archive.status, 0, archive.output);

  const architecturePath = 'architecture/enterprise-blueprint.yaml';
  const architecture = await readYaml(root, architecturePath);
  architecture.actualSandboxBaseline.facts.environment.value = 'post-archive-drift';
  await writeYaml(root, architecturePath, architecture);
  const custom = npmRun(root, 'validate:references');
  assert.notEqual(custom.status, 0);
  assert.match(custom.output, /archivierte Architektur-Baseline-Fakten weichen semantisch vom proposedCanonicalUpdate ab/);
});

test('positive Wegwerf-Lifecycle nutzt echten OpenSpec-Merge und besteht die Post-Archive-Validierung', async (t) => {
  const root = await disposableRepository(t);
  await prepareAppliedPolicyState(root);
  await removeEnvironmentMainSpec(root);

  const archiveReady = npmRun(root, 'validate:archive-ready');
  assert.equal(archiveReady.status, 0, archiveReady.output);
  assert.match(archiveReady.output, /Schema 'universaarl-delivery' is valid/);
  assert.match(archiveReady.output, /change\/establish-playthru-environment-baseline/);
  assert.match(archiveReady.output, /Projektvalidierung bestanden \(archive-ready\)/);

  const archive = openSpecArchive(root);
  assert.equal(archive.status, 0, archive.output);
  await assert.rejects(fs.access(path.join(root, `openspec/changes/${activeChange}`)));
  const archiveDirectories = await fs.readdir(path.join(root, 'openspec/changes/archive'));
  assert.ok(archiveDirectories.some((name) => name.endsWith(`-${activeChange}`)), 'echtes OpenSpec-Archivverzeichnis fehlt');

  const mergedSpec = await fs.readFile(path.join(root, 'openspec/specs/environment-baseline/spec.md'), 'utf8');
  assert.match(mergedSpec, /## Purpose/);
  assert.match(mergedSpec, /## Requirements/);
  assert.doesNotMatch(mergedSpec, /## ADDED Requirements/);
  assert.match(mergedSpec, /TBD/);
  await fs.writeFile(
    path.join(root, 'openspec/specs/environment-baseline/spec.md'),
    mergedSpec.replace(/## Purpose\s+[\s\S]*?(?=\s+## Requirements)/, '## Purpose\nDefiniert die evidenzbasierte technische Baseline der playthru-Sandbox.\n'),
    'utf8'
  );

  for (const script of ['validate:openspec-schema', 'validate:openspec', 'validate:references']) {
    const postArchive = npmRun(root, script);
    assert.equal(postArchive.status, 0, `${script}\n${postArchive.output}`);
  }
});

test('veroeffentlichte Main-Specs lehnen provisorischen Purpose ab', async (t) => {
  const root = await disposableRepository(t);
  const specPath = path.join(root, 'openspec/specs/project-governance/spec.md');
  const content = await fs.readFile(specPath, 'utf8');
  await fs.writeFile(specPath, content.replace(/## Purpose\s+[\s\S]*?(?=\s+## Requirements)/, '## Purpose\nTBD - Zweck nach der Archivierung aktualisieren.\n'), 'utf8');
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /provisorischer Purpose ist unzulaessig/);
});

test('Architekturentscheidungen lehnen nicht deklarierte Felder ab', async (t) => {
  const root = await disposableRepository(t);
  const architecturePath = 'architecture/enterprise-blueprint.yaml';
  const architecture = await readYaml(root, architecturePath);
  architecture.decisions[0].unexpected = 'not allowed';
  await writeYaml(root, architecturePath, architecture);
  const result = npmRun(root, 'validate:references');
  assert.notEqual(result.status, 0);
  assert.match(result.output, /Decision-Objekt darf nur id, status, decidedAt und statement enthalten/);
});

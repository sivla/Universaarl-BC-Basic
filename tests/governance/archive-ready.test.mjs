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
const npmCli = process.env.npm_execpath ?? path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
const openSpecCli = path.join(repositoryRoot, 'node_modules', '@fission-ai', 'openspec', 'bin', 'openspec.js');

async function readYaml(root, relative) {
  return YAML.parse(await fs.readFile(path.join(root, relative), 'utf8'));
}

async function writeYaml(root, relative, value) {
  await fs.writeFile(path.join(root, relative), YAML.stringify(value), 'utf8');
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
    'exports/project-artifacts'
  ]) await fs.rm(path.join(root, relative), { recursive: true, force: true });
  for (const name of await fs.readdir(path.join(changesRoot, 'archive'))) {
    if (name.endsWith('-establish-project-artifact-walkthrough-pilot')) await fs.rm(path.join(changesRoot, 'archive', name), { recursive: true, force: true });
  }
  const verificationPath = 'evidence/verification-register.yaml';
  const register = await readYaml(root, verificationPath);
  register.verifications = register.verifications.filter((item) => item.changeRef !== 'establish-project-artifact-walkthrough-pilot');
  await writeYaml(root, verificationPath, register);
  return root;
}

async function setPolicyGate(root, status) {
  const register = await readYaml(root, 'evidence/verification-register.yaml');
  const policyGate = register.verifications.find((item) => item.id === 'UABC-VER-ENV-POLICY-GATE-001');
  policyGate.status = status;
  policyGate.executedAt = status === 'passed' ? '2026-07-10' : null;
  policyGate.evidence = status === 'passed' ? 'Disposable automated policy gate; never copied to the real repository.' : null;
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
  assert.match(result.output, /requires passed active-change automated policy gate/);
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
  assert.match(result.output, /facts differ semantically from proposedCanonicalUpdate/);
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
  assert.match(custom.output, /archived automated policy gate requires proposedCanonicalUpdate status applied/);
  assert.match(custom.output, /archived automated policy gate UABC-VER-ENV-POLICY-GATE-001 must remain passed with evidence/);
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
  assert.match(custom.output, /archived architecture baseline facts differ semantically from proposedCanonicalUpdate/);
});

test('positive Wegwerf-Lifecycle nutzt echten OpenSpec-Merge und besteht die Post-Archive-Validierung', async (t) => {
  const root = await disposableRepository(t);
  await prepareAppliedPolicyState(root);
  await removeEnvironmentMainSpec(root);

  const archiveReady = npmRun(root, 'validate:archive-ready');
  assert.equal(archiveReady.status, 0, archiveReady.output);
  assert.match(archiveReady.output, /Schema 'universaarl-delivery' is valid/);
  assert.match(archiveReady.output, /change\/establish-playthru-environment-baseline/);
  assert.match(archiveReady.output, /Project validation passed \(archive-ready\)/);

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
  await fs.writeFile(specPath, content.replace(/## Purpose\s+[\s\S]*?(?=\s+## Requirements)/, '## Purpose\nTBD - Update Purpose after archive.\n'), 'utf8');
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

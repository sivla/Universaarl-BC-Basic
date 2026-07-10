import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { createWalkthroughValidator } from '../../scripts/validate-walkthrough-manifest.mjs';

const root = process.cwd();
const outputDir = path.join(root, 'artifacts/walkthrough/generated/UABC-WT-ENV-001');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const source = YAML.parse(fs.readFileSync(path.join(root, 'artifacts/walkthrough/instances/UABC-WT-ENV-001.yaml'), 'utf8'));
const validate = createWalkthroughValidator();

test('real Draft 2020-12 schema accepts pilot and a minimally filled blank', () => {
  assert.doesNotThrow(() => validate(source, 'pilot'));
  const blank = YAML.parse(fs.readFileSync(path.join(root, 'artifacts/walkthrough/templates/walkthrough-package.blank.yaml'), 'utf8'));
  const filled = structuredClone(source);
  filled.artifactId = 'UABC-WT-MINIMAL-001';
  filled.steps = [structuredClone(source.steps[0])];
  filled.steps[0].stepId = 'STEP-01';
  assert.deepEqual(Object.keys(blank).sort(), Object.keys(filled).sort());
  assert.doesNotThrow(() => validate(filled, 'filled blank'));
});

test('schema rejects unknown fields, absent non-evidence semantics and invalid stable IDs', () => {
  assert.throws(() => validate({ ...source, unexpected: true }), /additional properties/);
  const missing = structuredClone(source); delete missing.evidenceSemantics;
  assert.throws(() => validate(missing), /evidenceSemantics/);
  assert.throws(() => validate({ ...source, artifactId: 'not-stable' }), /artifactId/);
});

test('resolved walkthrough preserves non-evidence semantics and source provenance', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.evidenceSemantics.artifactProvidesBusinessEvidence, false);
  assert.equal(manifest.evidenceSemantics.sourceEvidenceRetainedAsProvenance, true);
  assert.deepEqual(manifest.steps.map((step) => step.stepId), ['ENV-00', 'ENV-01', 'ENV-02', 'ENV-03', 'ENV-04', 'ENV-05', 'ENV-06']);
  for (const [file, expected] of Object.entries(manifest.resolvedProvenance.sourceChecksums)) assert.equal(hash(path.join(root, file)), expected, file);
});

test('consumer resolves every declared source, manifest and output path within repository and verifies hashes', () => {
  const index = YAML.parse(fs.readFileSync(path.join(root, 'exports/project-artifacts/v0.1/index.yaml'), 'utf8'));
  assert.equal(index.relativePathBase, 'repository-root');
  const resolveDeclared = (relative) => {
    assert.equal(path.isAbsolute(relative), false, relative);
    const resolved = path.resolve(root, relative);
    assert.ok(resolved === root || resolved.startsWith(`${root}${path.sep}`), relative);
    assert.ok(fs.existsSync(resolved), relative);
    return resolved;
  };
  for (const type of index.artifactTypes) resolveDeclared(type.schemaPath);
  for (const artifact of index.artifacts) {
    const sourceFile = resolveDeclared(artifact.sourceManifestPath);
    const manifestFile = resolveDeclared(artifact.resolvedManifestPath);
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    for (const file of [...manifest.provenance.sourceManifests, ...manifest.provenance.sourceEventLogs, ...manifest.steps.flatMap((s) => s.screenshotRefs.map((r) => r.path))]) resolveDeclared(file);
    assert.ok(sourceFile); assert.equal(hash(manifestFile), artifact.checksums.manifest);
    for (const [kind, file] of Object.entries(artifact.outputs)) assert.equal(hash(resolveDeclared(file)), artifact.checksums[kind]);
    assert.equal(artifact.evidenceSemantics.artifactProvidesBusinessEvidence, false);
  }
  assert.ok(index.consumerRules.allowedPackageOutputs.includes('video'));
  assert.ok(index.consumerRules.forbiddenInputs.includes('raw-browser-video'));
});

test('HTML and media are compact and controllable', () => {
  const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
  assert.match(html, /id="evidence-semantics"/);
  assert.match(html, /Source-Evidence bleibt Provenienz/);
  assert.ok(fs.statSync(path.join(outputDir, 'walkthrough.webm')).size < 10_000_000);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name:format=duration', '-of', 'json', path.join(outputDir, 'walkthrough.webm')], { encoding: 'utf8' });
  assert.equal(probe.status, 0, probe.stderr);
});

test('baseline pilot rebuild is byte-stable and sanitized', () => {
  const files = ['captions.vtt', 'index.html', 'manifest.json', 'preview.webp', 'walkthrough.webm'];
  const before = Object.fromEntries(files.map((file) => [file, hash(path.join(outputDir, file))]));
  const build = spawnSync(process.execPath, ['scripts/build-walkthrough.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr || build.stdout);
  assert.deepEqual(Object.fromEntries(files.map((file) => [file, hash(path.join(outputDir, file))])), before);
});

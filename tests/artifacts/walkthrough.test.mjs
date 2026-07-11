import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { createWalkthroughValidator, formatAjvError } from '../../scripts/validate-walkthrough-manifest.mjs';
import { resolveMediaToolchain } from '../../scripts/media-toolchain.mjs';

const root = process.cwd();
const outputDir = path.join(root, 'artifacts/walkthrough/generated/UABC-WT-ENV-001');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const textSourcePattern = /\.(?:css|html|js|json|jsonl|md|mjs|vtt|ya?ml)$/i;
const sourceHash = (file) => {
  const bytes = fs.readFileSync(file);
  return crypto.createHash('sha256').update(textSourcePattern.test(file) ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'), 'utf8') : bytes).digest('hex');
};
const source = YAML.parse(fs.readFileSync(path.join(root, 'artifacts/walkthrough/instances/UABC-WT-ENV-001.yaml'), 'utf8'));
const validate = createWalkthroughValidator();

test('echtes Draft-2020-12-Schema akzeptiert Pilot und minimal ausgefuelltes Blanko', () => {
  assert.doesNotThrow(() => validate(source, 'pilot'));
  const blank = YAML.parse(fs.readFileSync(path.join(root, 'artifacts/walkthrough/templates/walkthrough-package.blank.yaml'), 'utf8'));
  const filled = structuredClone(blank);
  filled.artifactId = 'UABC-WT-MINIMAL-001';
  filled.phase = 'W1 lokaler Artefakttest';
  filled.owner = 'P-002';
  filled.reviewers = ['P-004'];
  filled.createdAt = '2026-07-10';
  filled.sourceScenarioRefs = ['UABC-SCN-WT-001'];
  filled.requirementRefs = ['UABC-REQ-WT-001'];
  filled.jiraRefs = ['UABC-16'];
  filled.evidenceRefs = ['UABC-VER-WT-BUILD-001'];
  filled.sourceRunRefs = ['run-1'];
  filled.history = [{ at: '2026-07-10', actor: 'P-002', action: 'aus ausgefuelltem Blanko erstellt' }];
  filled.audiences = ['Artefaktpruefer'];
  filled.learningObjective = 'Eine minimal ausgefuellte Walkthrough-Autorenvorlage validieren.';
  filled.prerequisites = ['Bereinigte lokale Quellnachweise'];
  const step = structuredClone(blank.steps[0]);
  Object.assign(step, {
    stepId: 'STEP-01', title: 'Lokales Artefakt pruefen', bcSurface: 'Generiertes HTML',
    userAction: 'Das generierte lokale HTML oeffnen.', expectedResult: 'Der erste Schritt ist sichtbar.',
    businessRationale: 'Ein minimal verfasstes Paket muss strukturell reproduzierbar bleiben.',
    screenshotRefs: [{ runRef: 'run-1', path: 'evidence/example/step-01.png' }],
    caption: 'Schritt 1. Das generierte lokale Artefakt pruefen.', safetyNotes: ['Kein BC-Zugriff']
  });
  filled.steps = [step];
  filled.securityAndRedaction.personalData = 'none';
  filled.provenance.sourceManifests = ['evidence/example/manifest.json'];
  filled.provenance.sourceEventLogs = ['evidence/example/events.jsonl'];
  filled.provenance.derivation = 'Aus einem bereinigten lokalen Screenshot und Ereignismanifest abgeleitet.';
  assert.doesNotMatch(JSON.stringify(filled), /REPLACE-ME|REPLACE-WITH|YYYY-MM-DD|DURCH /);
  assert.doesNotThrow(() => validate(filled, 'ausgefuelltes Blanko'));
});

test('Schema lehnt unbekannte Felder, fehlende Nicht-Evidence-Semantik und ungueltige stabile IDs ab', () => {
  assert.throws(() => validate({ ...source, unexpected: true }), /nicht erlaubte zusaetzliche Feld unexpected/);
  const missing = structuredClone(source); delete missing.evidenceSemantics;
  assert.throws(() => validate(missing), /evidenceSemantics/);
  assert.throws(() => validate({ ...source, artifactId: 'not-stable' }), /artifactId/);
  const unknown = formatAjvError({ instancePath: '/pilot', keyword: 'customRule', message: 'must expose raw upstream diagnostics' });
  assert.match(unknown, /nicht eigens uebersetzte Schemaregel/);
  assert.match(unknown, /keyword=customRule/);
  assert.doesNotMatch(unknown, /raw upstream diagnostics/);
});

test('aufgeloester Walkthrough bewahrt Nicht-Evidence-Semantik und Quellprovenienz', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.evidenceSemantics.artifactProvidesBusinessEvidence, false);
  assert.equal(manifest.evidenceSemantics.sourceEvidenceRetainedAsProvenance, true);
  assert.deepEqual(manifest.steps.map((step) => step.stepId), ['ENV-00', 'ENV-01', 'ENV-02', 'ENV-03', 'ENV-04', 'ENV-05', 'ENV-06']);
  for (const [file, expected] of Object.entries(manifest.resolvedProvenance.sourceChecksums)) assert.equal(sourceHash(path.join(root, file)), expected, file);
});

test('Konsument loest alle deklarierten Quell-, Manifest- und Ausgabepfade im Repository auf und prueft Hashes', () => {
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

test('HTML und Medien sind kompakt und steuerbar', () => {
  const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
  assert.match(html, /id="evidence-semantics"/);
  assert.match(html, /Quellnachweis bleibt Provenienz/);
  assert.ok(fs.statSync(path.join(outputDir, 'walkthrough.webm')).size < 10_000_000);
  const toolchain = resolveMediaToolchain({ cwd: root });
  const probe = toolchain.run(toolchain.ffprobe, ['-v', 'error', '-show_entries', 'stream=codec_name:format=duration', '-of', 'json', path.join(outputDir, 'walkthrough.webm')]);
  assert.match(probe, /"codec_name"/);
  const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.generation.mediaToolchain.buildIdentifier, '2025-07-23-git-829680f96a-full_build-www.gyan.dev');
});

test('Neubau des Baseline-Piloten ist bytestabil und bereinigt', () => {
  const files = ['captions.vtt', 'index.html', 'manifest.json', 'preview.webp', 'walkthrough.webm'];
  const before = Object.fromEntries(files.map((file) => [file, hash(path.join(outputDir, file))]));
  const build = spawnSync(process.execPath, ['scripts/build-walkthrough.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr || build.stdout);
  assert.deepEqual(Object.fromEntries(files.map((file) => [file, hash(path.join(outputDir, file))])), before);
});

test('fehlgeschlagener Medien-Preflight laesst vorhandene Walkthrough-Ausgaben unveraendert', () => {
  const files = ['captions.vtt', 'index.html', 'manifest.json', 'preview.webp', 'walkthrough.webm'];
  const before = Object.fromEntries(files.map((file) => [file, hash(path.join(outputDir, file))]));
  const build = spawnSync(process.execPath, ['scripts/build-walkthrough.mjs'], { cwd: root, encoding: 'utf8', env: { ...process.env, UABC_FFMPEG_COMMAND: 'uabc-missing-ffmpeg' } });
  assert.notEqual(build.status, 0);
  assert.match(`${build.stderr}${build.stdout}`, /Medienwerkzeug-Preflight fehlgeschlagen/);
  assert.deepEqual(Object.fromEntries(files.map((file) => [file, hash(path.join(outputDir, file))])), before);
});

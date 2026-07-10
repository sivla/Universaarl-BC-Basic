import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';

const root = process.cwd();
const outputDir = path.join(root, 'artifacts/walkthrough/generated/UABC-WT-ENV-001');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('resolved walkthrough preserves one truth and source provenance', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(outputDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.artifactId, 'UABC-WT-ENV-001');
  assert.equal(manifest.status, 'in-review');
  assert.equal(manifest.simulationOnly, true);
  assert.deepEqual(Object.keys(manifest.playbackModes).sort(), ['beginner', 'consultant', 'evidence-review']);
  assert.equal(manifest.steps.length, 7);
  assert.deepEqual(manifest.steps.map((step) => step.stepId), ['ENV-00', 'ENV-01', 'ENV-02', 'ENV-03', 'ENV-04', 'ENV-05', 'ENV-06']);
  for (const [file, expected] of Object.entries(manifest.resolvedProvenance.sourceChecksums)) assert.equal(hash(path.join(root, file)), expected, file);
});

test('export contract resolves every declared output and checksum', () => {
  const index = YAML.parse(fs.readFileSync(path.join(root, 'exports/project-artifacts/v0.1/index.yaml'), 'utf8'));
  assert.equal(index.access, 'read-only');
  assert.equal(index.artifacts.length, 1);
  const artifact = index.artifacts[0];
  for (const [kind, file] of Object.entries(artifact.outputs)) {
    const absolute = path.join(root, file);
    assert.ok(fs.existsSync(absolute), `${kind}: ${file}`);
    assert.equal(hash(absolute), artifact.checksums[kind]);
  }
  assert.equal(hash(path.join(root, artifact.resolvedManifestPath)), artifact.checksums.manifest);
});

test('HTML and media are accessible, compact and controllable', () => {
  const html = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
  assert.match(html, /<video controls/);
  assert.match(html, /kind="captions"/);
  assert.match(html, /prefers-reduced-motion/);
  assert.match(html, /evidence-review/);
  assert.ok(fs.statSync(path.join(outputDir, 'walkthrough.webm')).size < 10_000_000);
  assert.ok(fs.statSync(path.join(outputDir, 'preview.webp')).size < 3_000_000);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height:format=duration', '-of', 'json', path.join(outputDir, 'walkthrough.webm')], { encoding: 'utf8' });
  assert.equal(probe.status, 0, probe.stderr);
  const media = JSON.parse(probe.stdout);
  assert.equal(media.streams[0].codec_name, 'vp9');
  assert.ok(Number(media.format.duration) > 0);
});

test('rebuild is byte-stable and generated text contains no target secret', () => {
  const files = ['captions.vtt', 'index.html', 'manifest.json', 'preview.webp', 'walkthrough.webm'];
  const before = Object.fromEntries(files.map((file) => [file, hash(path.join(outputDir, file))]));
  const build = spawnSync(process.execPath, ['scripts/build-walkthrough.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr || build.stdout);
  const after = Object.fromEntries(files.map((file) => [file, hash(path.join(outputDir, file))]));
  assert.deepEqual(after, before);
  for (const file of ['index.html', 'manifest.json', 'captions.vtt']) {
    const content = fs.readFileSync(path.join(outputDir, file), 'utf8');
    assert.doesNotMatch(content, /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i);
    assert.doesNotMatch(content, /https:\/\/businesscentral\.dynamics\.com\/(?!\[tenant\])[^/\s]+\/playthru/i);
  }
});

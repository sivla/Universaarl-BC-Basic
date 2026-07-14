import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const pointerPath = fs.existsSync('exports/project-data/v1/snapshots/current-v2.candidate.json') ? 'exports/project-data/v1/snapshots/current-v2.candidate.json' : 'exports/project-data/v1/snapshots/current.json';
const pointer = JSON.parse(fs.readFileSync(pointerPath, 'utf8'));
const manifestPath = `exports/project-data/v1/snapshots/releases/${pointer.currentReleaseId}/manifest.json`;
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

test('V2 bindet Index und Ressourcenkatalog separat mit Größe und Digest', () => {
  assert.match(pointer.currentReleaseId, /-V2-FINAL(?:-QUALITY(?:-2)?)?$/);
  for (const key of ['projectIndex', 'resourceCatalog']) {
    assert.equal(manifest[key].path, manifest[key === 'projectIndex' ? 'projectIndexPath' : 'resourceCatalogPath']);
    const bytes = fs.readFileSync(`exports/project-data/v1/snapshots/releases/${pointer.currentReleaseId}/${manifest[key].path}`);
    assert.equal(bytes.length, manifest[key].sizeBytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest[key].sha256);
  }
});

test('Manipulierter V2-Index oder Ressourcenkatalog scheitert', () => {
  assert.match(pointer.currentReleaseId, /-V2-FINAL(?:-QUALITY(?:-2)?)?$/);
  const root = `exports/project-data/v1/snapshots/releases/${pointer.currentReleaseId}`;
  for (const key of ['projectIndex', 'resourceCatalog']) {
    const file = `${root}/${manifest[key].path}`;
    const original = fs.readFileSync(file);
    try {
      fs.appendFileSync(file, Buffer.from('x'));
      const result = spawnSync(process.execPath, ['scripts/validate-twin-catalog.mjs'], { encoding: 'utf8', env: { ...process.env, TWIN_POINTER_PATH: pointerPath } });
      assert.notEqual(result.status, 0, key);
    } finally { fs.writeFileSync(file, original); }
  }
});

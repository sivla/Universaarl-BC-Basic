import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { buildProjection, INDEX_PATH, MAP_PATH, PROVENANCE_PATH } from '../../scripts/generate-setup-wave-1-export.mjs';
import { lfBytes } from '../../scripts/generate-spectra-0.10-integration.mjs';
import { validateAdapterProvenance, validateExport, validateProjection } from '../../scripts/validate-setup-wave-1-export.mjs';
test('Setup-Wave-1-Projektion ist deterministisch und positivgelistet', () => { const one = buildProjection(); const two = buildProjection(); assert.deepEqual(one, two); assert.deepEqual(validateExport(), []); });
test('Projektion bleibt schreibgeschuetzt', () => { const projection = buildProjection(); assert.equal(projection.writesAuthorized, false); assert.equal(projection.writeGate.noGoSteps.length, 17); assert.equal(projection.provenance.some(({ path }) => /(?:[A-Za-z]:|^\/|\\)/.test(path)), false); });
test('Projektion enthaelt keine Geheimnis- oder Authfelder', () => { const text = JSON.stringify(buildProjection()); assert.doesNotMatch(text, /password|token|secret|session|authorization/i); });
test('Manipulierte Schreibfreigabe wird fail-closed abgelehnt', () => { const projection = buildProjection(); const schema = JSON.parse(fs.readFileSync('governance/schemas/setup-wave-1-projection.schema.json', 'utf8')); projection.writesAuthorized = true; assert.ok(validateProjection(projection, schema).includes('SCHREIBSPERRE')); });
test('Veraltete Adapter-Provenienz gegen geaenderte Exportmap wird fail-closed abgelehnt', () => {
  const indexBytes = lfBytes(fs.readFileSync(INDEX_PATH));
  const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
  const provenance = JSON.parse(fs.readFileSync(PROVENANCE_PATH, 'utf8'));
  const changedMapBytes = Buffer.from(`${JSON.stringify({ ...map, artifacts: map.artifacts.map((artifact, index) => index === 0 ? { ...artifact, selector: 'gezielt-veraendert' } : artifact) }, null, 2)}\n`, 'utf8');
  const errors = validateAdapterProvenance({ provenance, indexBytes, mapBytes: changedMapBytes });
  assert.ok(errors.some((error) => error.startsWith('ADAPTER_PROJEKTIONS_DIGEST:')), errors.join('\n'));
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { loadIntegration, validateIntegration } from '../../scripts/validate-spectra-0.10-integration.mjs';

test('historische Spectra-Integration bleibt als Evidence validierbar', () => { const data = loadIntegration(); assert.deepEqual(validateIntegration(data), []); });
test('stale Alpha-Bindung wird nicht zur aktuellen Runtime-Bindung', () => { const pointer = JSON.parse(readFileSync('exports/project-data/v1/snapshots/current.json', 'utf8')); assert.equal(pointer.requiresGit, false); assert.equal(pointer.currentReleaseId, 'UABC-CUSTOMER-001-CATALOG-20260714-V1'); });

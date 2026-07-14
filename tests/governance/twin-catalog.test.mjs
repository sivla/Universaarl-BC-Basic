import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = readFileSync(path.join(root, 'scripts/validate-twin-catalog.mjs'), 'utf8');
const pointer = JSON.parse(readFileSync(path.join(root, 'exports/project-data/v1/snapshots/current.json'), 'utf8'));
test('Twin-Validator benoetigt kein Git oder Child-Process', () => { assert.doesNotMatch(source, /child_process|execFileSync|git\s+(show|cat-file|rev-parse)/i); });
test('Current-Zeiger bindet genau einen Kundenrelease', () => { assert.equal(pointer.customerId, 'UABC-CUSTOMER-001'); assert.equal(pointer.readOnly, true); assert.equal(pointer.requiresGit, false); assert.match(pointer.releasePath, /^exports\/project-data\/v1\/snapshots\/releases\/[^/]+$/); });
test('Current-Zeiger ist nicht von einer Selbst-SHA abhaengig', () => { assert.equal(Object.hasOwn(pointer, 'sourceCommitSha'), false); });

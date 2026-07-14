import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateStory } from '../../scripts/validate-project-story.mjs';

const source = JSON.parse(readFileSync('evidence/simulation/project-story.json', 'utf8'));
const errors = (fn) => { const copy = structuredClone(source); fn(copy); return validateStory(copy, { checkFiles: false }); };
test('positive Vollstory besteht', () => assert.deepEqual(validateStory(source), []));
test('konkurrierender Pilotstatus wird abgelehnt', () => assert.ok(errors((s) => { s.status = 'in-progress'; }).length > 0));
test('falsche Kosten werden abgelehnt', () => assert.ok(errors((s) => { s.offer.actual_cost = 300; }).length > 0));
test('fehlender Abschlusskommentar wird abgelehnt', () => assert.ok(errors((s) => { s.tickets[0].comments.pop(); }).length > 0));
test('reale Ausfuehrung wird abgelehnt', () => assert.ok(errors((s) => { s.controls.realBcExecution = true; }).length > 0));
test('unbekannte Timeline-Evidence wird abgelehnt', () => assert.ok(errors((s) => { s.timeline[0].evidence = 'EVIDENCE-NOT-FOUND'; }).length > 0));

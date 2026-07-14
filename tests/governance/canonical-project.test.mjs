import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { validateStory } from '../../scripts/validate-project-story.mjs';

const root = process.cwd();
const story = JSON.parse(readFileSync(path.join(root, 'evidence/simulation/project-story.json'), 'utf8'));
test('kanonische Story besteht', () => assert.deepEqual(validateStory(story), []));
test('konkurrierende Pilot-Wahrheit wird abgelehnt', () => { const mutant = structuredClone(story); mutant.classification = 'current-pilot-planning'; assert.ok(validateStory(mutant).length > 0); });
test('falsche Kosten werden abgelehnt', () => { const mutant = structuredClone(story); mutant.offer.actual_cost = 300; assert.ok(validateStory(mutant).length > 0); });
test('fehlender Abschlusskommentar wird abgelehnt', () => { const mutant = structuredClone(story); mutant.tickets[0].comments.pop(); assert.ok(validateStory(mutant).length > 0); });
test('reale Ausfuehrung bleibt ausgeschlossen', () => { const mutant = structuredClone(story); mutant.controls.realBcExecution = true; assert.ok(validateStory(mutant).length > 0); });

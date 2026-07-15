import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import YAML from 'yaml';
import { validateActiveBcPlaythrough, validateHistoricalBcPlaythrough } from '../../scripts/validate-bc-playthrough.mjs';
import { validateActiveSimulation, validateHistoricalSimulation } from '../../scripts/validate-simulation-evidence.mjs';

const yaml = (file) => YAML.parse(fs.readFileSync(file, 'utf8'));
const story = JSON.parse(fs.readFileSync('evidence/simulation/project-story.json', 'utf8'));
const runPlan = yaml('evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml');
const projection = JSON.parse(fs.readFileSync('exports/project-data/v1/setup-wave-1-projection.json', 'utf8'));
test('kanonische Simulation bleibt synthetisch abgeschlossen', () => { assert.deepEqual(validateActiveSimulation(story, runPlan, projection), []); assert.deepEqual(validateActiveBcPlaythrough(story, runPlan, projection), []); assert.equal(story.offer.actual_hours, 78); assert.equal(story.offer.actual_cost, 9360); });
test('abweichende Istwerte werden abgelehnt', () => { const changed = structuredClone(story); changed.offer.actual_hours = 0; assert.ok(validateActiveSimulation(changed, runPlan, projection).length > 0); });
test('historischer Referenzlauf bleibt currentAuthority-frei', () => { const register = yaml('evidence/simulation/phase-gate-register.yaml'); const completion = yaml('evidence/simulation/project-completion.yaml'); const demo = yaml('evidence/simulation/demo-readiness.yaml'); const index = yaml('exports/project-data/v1/index.yaml'); assert.deepEqual(validateHistoricalSimulation(register, completion, demo, index, () => true), []); });
test('historische currentAuthority wird abgelehnt', () => { const completion = yaml('evidence/simulation/project-completion.yaml'); completion.currentAuthority = true; const errors = validateHistoricalSimulation(yaml('evidence/simulation/phase-gate-register.yaml'), completion, yaml('evidence/simulation/demo-readiness.yaml'), yaml('exports/project-data/v1/index.yaml'), () => true); assert.ok(errors.some((error) => /currentAuthority/.test(error))); });

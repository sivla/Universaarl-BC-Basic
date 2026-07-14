import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import YAML from 'yaml';
import { validateReferenceSimulation } from '../../scripts/validate-reference-simulation.mjs';

const contract = YAML.parse(fs.readFileSync('project/bc-basic/reference-simulation.yaml', 'utf8'));
const exportData = JSON.parse(fs.readFileSync('exports/project-data/v1/reference-simulation.json', 'utf8'));
const story = JSON.parse(fs.readFileSync('evidence/simulation/project-story.json', 'utf8'));
const valid = () => validateReferenceSimulation(contract, exportData, story, () => true);

test('vollständige Referenzsimulation besteht', () => assert.deepEqual(valid(), []));
test('fehlendes Ticket scheitert fail-closed', () => {
  const broken = structuredClone(exportData); broken.tickets = broken.tickets.slice(1);
  assert.ok(validateReferenceSimulation(contract, broken, story, () => true).some((error) => error.startsWith('TICKET-ANZAHL')));
});
test('Live-Abschlussbehauptung scheitert fail-closed', () => {
  const broken = structuredClone(exportData); broken.tickets[0].liveStatus = 'done';
  assert.ok(validateReferenceSimulation(contract, broken, story, () => true).some((error) => error.startsWith('TICKET-WAHRHEIT')));
});
test('abweichende Reconciliation scheitert fail-closed', () => {
  const broken = structuredClone(exportData); broken.reconciliation.actualHours = 79;
  assert.ok(validateReferenceSimulation(contract, broken, story, () => true).some((error) => error.startsWith('RECONCILIATION')));
});
test('unquoted Flow-Mapping mit null Split-Key scheitert fail-closed', () => {
  const broken = structuredClone(contract);
  broken.phases[1] = { id: 'UABC-2', code: 'P2', title: 'Einrichtung', 'Tests und Schulung': null, plannedHours: 40, syntheticResult: 'completed' };
  assert.ok(validateReferenceSimulation(broken, exportData, story, () => true).some((error) => error.startsWith('STRUCTURED-PROPERTY')));
});
test('unerwartete Export-Property scheitert fail-closed', () => {
  const broken = structuredClone(exportData);
  broken.phases[1]['Tests und Schulung'] = null;
  assert.ok(validateReferenceSimulation(contract, broken, story, () => true).some((error) => error.startsWith('EXPORT-STRUCTURED-PROPERTY')));
});

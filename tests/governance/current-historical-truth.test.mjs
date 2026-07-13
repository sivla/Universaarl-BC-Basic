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
const historical = {
  catalog: yaml('project/bc-basic/bc-playthrough-catalog.yaml'),
  ledger: yaml('evidence/simulation/bc-playthrough-ledger.yaml'),
  company: yaml('project/bc-basic/customer-templates/example/company-setup.example.yaml'),
  phase2: yaml('evidence/simulation/phase-2-p2p-o2c.yaml'),
  phase3: yaml('evidence/simulation/phase-3-cash-inventory-close.yaml'),
  candidates: yaml('project/bc-basic/blueprint-candidates.yaml'),
  register: yaml('evidence/simulation/phase-gate-register.yaml'),
  completion: yaml('evidence/simulation/project-completion.yaml'),
  demo: yaml('evidence/simulation/demo-readiness.yaml'),
  index: yaml('exports/project-data/v1/index.yaml')
};

test('aktiver Pilot bleibt CRONUS-basiert offen, schreibgesperrt und ohne Ist', () => {
  assert.deepEqual(validateActiveSimulation(story, runPlan, projection), []);
  assert.deepEqual(validateActiveBcPlaythrough(story, runPlan, projection), []);
});

test('historischer Referenzlauf bleibt intern konsistent und currentAuthority false', () => {
  assert.deepEqual(validateHistoricalSimulation(historical.register, historical.completion, historical.demo, historical.index, () => true), []);
  assert.deepEqual(validateHistoricalBcPlaythrough(historical.catalog, historical.ledger, historical.company, historical.phase2, historical.phase3, historical.candidates), []);
});

test('historisches GO darf nicht in ein offenes aktives Ticket gelangen', () => {
  const changed=structuredClone(story);const ticket=changed.tickets.find((entry)=>entry.id==='UABC-46');ticket.deliverable='Bestandene UAT- und Mock-Cutover-Entscheidung GO_SIMULATION';
  assert.ok(validateActiveSimulation(changed,runPlan,projection).some((error)=>/Historischer Abschluss/.test(error)));
  assert.ok(validateActiveBcPlaythrough(changed,runPlan,projection).some((error)=>/Erfolgs- oder GO-Behauptung/.test(error)));
});

test('historischer Referenzlauf mit currentAuthority true wird abgelehnt', () => {
  const completion=structuredClone(historical.completion);completion.currentAuthority=true;
  assert.ok(validateHistoricalSimulation(historical.register,completion,historical.demo,historical.index,()=>true).some((error)=>/currentAuthority/.test(error)));
});

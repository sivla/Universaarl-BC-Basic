import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import YAML from 'yaml';
import { execFileSync } from 'node:child_process';
import { validateReadiness } from '../../scripts/lib/real-onboarding-readiness-v5.mjs';

const source = YAML.parse(fs.readFileSync('project/bc-basic/real-onboarding-readiness-v5.yaml', 'utf8'));
const current = JSON.parse(fs.readFileSync('exports/project-data/v1/snapshots/current.json', 'utf8'));
const candidate = JSON.parse(fs.readFileSync('exports/project-data/v1/snapshots/current-v5.candidate.json', 'utf8'));

test('dualer Projektstatus bleibt bei offenen Realgates gelb', () => {
  assert.equal(source.status.simulationStatus, 'synthetischer Betriebszyklus abgeschlossen');
  assert.equal(source.status.realDeploymentReadiness, 'gelb/offen');
  assert.equal(source.status.summaryGreenRealAmpel, false);
  assert.equal(source.realGates.filter(g => g.status === 'pending').length, 8);
});

test('V4 bleibt current und V5 ist nur Kandidat', () => {
  assert.match(current.currentReleaseId, /-V4-FINAL$/);
  assert.equal(current.artifactCount, 128);
  assert.equal(candidate.candidateOnly, true);
  assert.match(candidate.currentReleaseId, /-V5-CANDIDATE$/);
});

test('Budgetabweichung ist an UABC-51 gebunden', () => {
  assert.deepEqual({ plan: source.financials.plannedHours, ist: source.financials.actualHours, forecast: source.financials.forecastHours, delta: source.financials.varianceHours }, { plan: 80, ist: 83, forecast: 83, delta: 3 });
  assert.match(source.financials.varianceReason, /UABC-51/);
});

test('Negativvertrag blockiert widersprüchliche Ampel, Budget und Freigabe', () => {
  const script = execFileSync(process.execPath, ['scripts/validate-real-onboarding-readiness-v5.mjs'], { encoding: 'utf8' });
  assert.match(script, /bestanden/);
  for (const gate of source.realGates) {
    assert.equal(gate.status, 'pending');
    assert.equal(gate.evidenceType.length > 0, true);
    assert.equal(gate.evidencePath.startsWith('evidence/real/'), true);
    assert.equal(gate.ownerRole.length > 0, true);
    assert.equal(gate.escalationLogic.length > 0, true);
    assert.equal(gate.closureLogic.length > 0, true);
  }
  assert.equal(source.truthBoundary.realCustomerApprovalClaimed, false);
});

test('drei Aktionen binden Abhängigkeit, Zielgate und Evidenceziel', () => {
  assert.equal(source.nextActions.length, 3);
  for (const action of source.nextActions) {
    assert.ok(action.dependsOn.length > 0);
    assert.ok(action.gateRefs.includes(action.targetGate));
    assert.match(action.evidenceExpectedPath, /^evidence\/real\//);
  }
});

test('Negativfälle für Owner, Termin, Evidenceziel, Budget, Aktionen und Current sind fail-closed', () => {
  const load = () => ({ source: structuredClone(source), journal: JSON.parse(fs.readFileSync('evidence/simulation/operating-cycle-v4.json', 'utf8')), current: JSON.parse(fs.readFileSync('exports/project-data/v1/snapshots/current.json', 'utf8')), candidate: structuredClone(candidate), manifest: JSON.parse(fs.readFileSync(candidate.manifestPath, 'utf8')), root: process.cwd() });
  for (const mutate of [
    fixture => { delete fixture.source.realGates[0].ownerRole; },
    fixture => { fixture.source.realGates[0].due = '2026-08-01'; },
    fixture => { delete fixture.source.nextActions[0].evidenceExpectedPath; },
    fixture => { fixture.source.financials.actualHours = 82; },
    fixture => { fixture.source.nextActions.pop(); },
    fixture => { fixture.current.currentReleaseId = 'UABC-CUSTOMER-001-CATALOG-20260715-V5-CANDIDATE'; }
  ]) {
    const fixture = load();
    mutate(fixture);
    assert.ok(validateReadiness(fixture).length > 0);
  }
});

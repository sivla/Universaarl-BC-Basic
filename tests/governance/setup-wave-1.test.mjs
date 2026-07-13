import assert from 'node:assert/strict';
import test from 'node:test';
import { loadSetupWave1, validateSetupWave1 } from '../../scripts/validate-setup-wave-1.mjs';

const baseline = loadSetupWave1();
const run = (change) => { const fixture = structuredClone(baseline); change(fixture); return validateSetupWave1(fixture); };
const has = (errors, code) => assert.ok(errors.some((error) => error.startsWith(`${code}:`)), `${code} fehlt: ${errors.join(', ')}`);

test('kanonische CORE-Allowlist, Quellen und Run-Plan bestehen', () => assert.deepEqual(validateSetupWave1(baseline), []));
test('abweichende CORE-Tabellen-ID oder Name wird abgelehnt', () => has(run(({ matrix }) => { matrix.matrix.find((row) => row.tableId === 348).tableName = 'Dimension Value'; }), 'CORE_ALLOWLIST'));
test('TRADE-MASTER kann keinen Write-Step erzeugen', () => has(run(({ runPlan }) => { runPlan.steps.find((step) => step.id === 'RUN-06').packageId = 'UABC-02-TRADE-MASTER'; }), 'WRITE_STEPS'));
test('OPENING-DATA kann keinen Write-Step erzeugen', () => has(run(({ runPlan }) => { runPlan.steps.push({ id: 'RUN-23', packageId: 'UABC-03-OPENING-DATA', write: true, readbackStepIds: ['RUN-21'], performed: false, observedResult: null }); }), 'WRITE_STEPS'));
test('Payment Method darf nicht von einem Bankkonto abhaengen', () => has(run(({ matrix }) => { matrix.matrix.find((row) => row.tableId === 289).dependsOn = [270]; }), 'DEPENDENCY_ORDER'));
test('ungeordnete Abhaengigkeit wird abgelehnt', () => has(run(({ matrix }) => { matrix.matrix.find((row) => row.tableId === 349).dependsOn = [7000]; }), 'DEPENDENCY_ORDER'));
test('ueberlappende Feldlisten werden abgelehnt', () => has(run(({ matrix }) => { matrix.matrix[0].optionalFields.push('Code'); }), 'FIELD_DISJOINT'));
test('nicht aufloesbare Microsoft-Learn-Quelle wird abgelehnt', () => has(run(({ sources }) => { sources.sources.find((source) => source.id === 'UABC-SRC-BCB-DIMENSIONS-001').url = 'https://example.invalid'; }), 'SOURCE_RESOLUTION'));
test('fehlende Wahrheitsklasse wird abgelehnt', () => has(run(({ sources }) => { delete sources.sources.find((source) => source.id === 'UABC-SRC-BCB-TRADE-SETUP-001').truthClass; }), 'SOURCE_RESOLUTION'));
test('manipulierte Singleton-Sollwerte werden abgelehnt', () => has(run(({ runPlan }) => { runPlan.steps.find((step) => step.id === 'RUN-16').expectedValues['Local Currency Symbol'] = '$'; }), 'SINGLETON_VALUES'));
test('RUN-22 darf nur die CORE-Allowlist korrigieren', () => has(run(({ runPlan }) => { runPlan.steps.find((step) => step.id === 'RUN-22').correctionScope = 'all-packages'; }), 'CORRECTION_SCOPE'));
test('Write ohne Readback wird abgelehnt', () => has(run(({ runPlan }) => { delete runPlan.steps.find((step) => step.id === 'RUN-11').readbackStepIds; }), 'WRITE_STEPS'));
test('falscher eindeutiger Stopcode wird abgelehnt', () => has(run(({ runPlan }) => { runPlan.stopCodes[7].code = 'UABC-STOP-09'; }), 'STOP_CODES'));
test('gebuchte Ledger-Tabelle wird fail-closed abgelehnt', () => has(run(({ matrix }) => { matrix.matrix[0].tableName = 'G/L Entry'; }), 'PROHIBITED_TABLE'));

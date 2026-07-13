import assert from 'node:assert/strict';
import test from 'node:test';
import { loadSetupWave1, validateSetupWave1 } from '../../scripts/validate-setup-wave-1.mjs';

const baseline = loadSetupWave1();
const run = (change) => { const fixture = structuredClone(baseline); change(fixture); return validateSetupWave1(fixture); };
const has = (errors, code) => assert.ok(errors.some((error) => error.startsWith(`${code}:`)), `${code} fehlt: ${errors.join(', ')}`);

test('kanonische CORE-Allowlist, Quellen und Run-Plan bestehen', () => assert.deepEqual(validateSetupWave1(baseline), []));
test('Matrix bindet Nutzerfakt und unbestaetigte Herkunftshypothese getrennt', () => { const state = baseline.matrix.target.configurationState; assert.deepEqual({ customerTargetRealized: state.customerTargetRealized, originMechanismStatus: state.originMechanismStatus, copyRenameHypothesis: state.copyRenameHypothesis, setupStatus: state.setupStatus }, { customerTargetRealized: false, originMechanismStatus: 'unbekannt-bis-wave0-readback', copyRenameHypothesis: 'nutzerhinweis-unbestaetigt', setupStatus: 'blockiert-bis-dom-readback-und-zielkonfiguration' }); });
test('Matrix darf den Kundenstand nicht allein aus dem Gesellschaftsnamen realisieren', () => has(run(({ matrix }) => { matrix.target.configurationState.customerTargetRealized = true; }), 'CRONUS_BASELINE'));
test('Run-Plan darf Kopieren oder Umbenennen nicht ohne DOM-Readback bestaetigen', () => has(run(({ runPlan }) => { runPlan.wave0Preflight.originMechanismStatus = 'kopie-und-umbenennung-bestaetigt'; }), 'WAVE0_PREFLIGHT'));
test('umbenannte CRONUS-Baseline darf keinen eingerichteten Pilot behaupten', () => has(run(({ readOnlyPreflight }) => { readOnlyPreflight.configurationState.baseline.configuredPilotClaimed = true; readOnlyPreflight.configurationState.baseline.observedDisplayName = readOnlyPreflight.configurationState.pilotTarget.displayName; }), 'CRONUS_BASELINE'));
test('fehlender Wave-0-Readback wird vor jedem Write abgelehnt', () => has(run(({ runPlan }) => { runPlan.wave0Preflight.status = 'passed'; runPlan.wave0Preflight.selectedDecision = 'controlled-reuse-of-dedicated-cronus-copy'; runPlan.wave0Preflight.evidencePath = null; }), 'WAVE0_PREFLIGHT'));
test('Zielstrategie bleibt ohne Wave-0- und Reset-Evidence unausgewaehlt', () => has(run(({ pilotSetupBaseline }) => { pilotSetupBaseline.companyInformation.companyStrategyDecision.selectedOption = 'controlled-reuse-of-dedicated-cronus-copy'; }), 'COMPANY_STRATEGY_GATE'));
test('Wave 0 beginnt exakt mit dem lesenden Company-Identity-Schritt', () => has(run(({ runPlan }) => { runPlan.wave0Preflight.nextExecutableStep = 'RUN-06'; }), 'WAVE0_PREFLIGHT'));
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

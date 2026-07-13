import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { buildProvenance, buildTwinExportMap, jsonBytes, lfBytes } from './generate-spectra-0.10-integration.mjs';

export const PROJECTION_PATH = 'exports/project-data/v1/setup-wave-1-projection.json';
export const SCHEMA_PATH = 'governance/schemas/setup-wave-1-projection.schema.json';
export const INDEX_PATH = 'exports/project-data/v1/index.yaml';
export const MAP_PATH = 'exports/project-data/v1/twin-export-map.json';
export const PROVENANCE_PATH = 'evidence/simulation/adapter-provenance.json';
export const CONFORMANCE_PATH = 'evidence/simulation/spectra-0.10-conformance.yaml';
const readYaml = (file) => YAML.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sources = ['project/bc-basic/setup-wave-1-matrix.yaml', 'project/bc-basic/setup-parameter-baseline.yaml', 'project/bc-basic/pilot-setup-baseline.yaml', 'project/bc-basic/posting-setup-matrix.yaml', 'project/bc-basic/solution-blueprint.yaml', 'evidence/playthru-uabc-basic-de/setup-wave-1-read-only-preflight.yaml', 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml', 'evidence/playthru-uabc-basic-de/wave-0-company-identity-readback.yaml', 'project/bc-basic/core-finance-payload.yaml', 'project/bc-basic/core-finance-package-manifest.yaml'];

export function buildProjection() {
  const matrix = readYaml(sources[0]);
  const parameterBaseline = readYaml(sources[1]);
  const pilotBaseline = readYaml(sources[2]);
  const preflight = readYaml(sources[5]);
  const plan = readYaml(sources[6]);
  const wave0Attempt = readYaml(sources[7]);
  const corePayload = readYaml(sources[8]);
  const coreManifest = readYaml(sources[9]);
  const companyState = pilotBaseline.companyInformation;
  const strategy = companyState.companyStrategyDecision;
  return {
    schemaVersion: 1,
    exportId: 'UABC-EXP-SETUP-WAVE1-001',
    recordType: 'setup-wave-1-projection',
    readOnly: true,
    writesAuthorized: false,
    target: { environment: matrix.target.environment, companyId: matrix.target.companyId, platform: matrix.target.businessCentral.platform, application: matrix.target.businessCentral.application, pilotName: matrix.target.futureVisibleCompanyNames['UABC-BASIC-DE'], legacyName: matrix.target.futureVisibleCompanyNames['UNIVERSAARL-DE'] },
    configurationState: {
      baselineKind: 'standard-cronus-demo',
      baselineProvenance: companyState.currentState.baselineProvenance,
      customerTargetRealized: companyState.currentState.customerTargetRealized,
      originMechanismStatus: companyState.currentState.originMechanismStatus,
      copyRenameHypothesis: companyState.currentState.copyRenameHypothesis,
      setupStatus: companyState.currentState.setupStatus,
      pilotConfigured: false,
      writesApplied: false,
      readbackStatus: 'pending',
      technicalCompanyName: preflight.configurationState.baseline.technicalCompanyName,
      internalCompanyId: null,
      observedDisplayName: preflight.configurationState.baseline.observedDisplayName,
      targetDisplayName: preflight.configurationState.pilotTarget.displayName,
      targetDecision: preflight.configurationState.pilotTarget.targetDecision,
      resetDecision: 'pending-resetpoint-evidence',
      targetState: { classification: companyState.targetState.classification, displayName: companyState.targetState.displayName, configurationScope: companyState.targetState.configurationScope, laterLockedWaves: companyState.targetState.laterLockedWaves },
      appliedDifference: { status: companyState.appliedDifference.status, readbackStatus: companyState.appliedDifference.readbackStatus, readbackEvidenceCount: companyState.appliedDifference.readbackEvidence.length },
      wave0ReadbackAttempt: { status: wave0Attempt.status, evidencePath: sources[7], bcReadbackAuthority: wave0Attempt.bcReadbackAuthority, bcFieldValuesRead: !wave0Attempt.accessResult.blockedBeforeBcFieldRead, screenshotCaptured: wave0Attempt.accessResult.screenshotPerformed, writesPerformed: wave0Attempt.effects.writesPerformed, visibleTabTarget: { title: wave0Attempt.visibleTabMetadata.title, environmentParameter: wave0Attempt.visibleTabMetadata.environmentParameter, companyParameter: wave0Attempt.visibleTabMetadata.companyParameter } },
      companyStrategyGate: { status: strategy.status, selectedOption: strategy.selectedOption, allowedOptions: strategy.allowedOptions, requiredEvidence: strategy.requiredEvidence, decisionEvidenceCount: strategy.decisionEvidence.length, decisionAuthority: strategy.decisionAuthority, nextExecutableStep: strategy.nextExecutableStep, writesAuthorized: strategy.writesAuthorized }
    },
    packages: matrix.packages.map(({ packageId, status, liveState }) => ({ packageId, status, tables: liveState.tables, records: liveState.records, errors: liveState.errors })),
    coreFinancePreparation: {
      packageId: corePayload.packageId,
      status: corePayload.status,
      packageTableCount: coreManifest.controlTotals.packageTableCount,
      packageRecordCount: coreManifest.controlTotals.packageRecordCount,
      manualTableCount: coreManifest.controlTotals.manualTableCount,
      manualRecordCount: coreManifest.controlTotals.manualRecordCount,
      accountRoleCount: coreManifest.controlTotals.accountRoleCount,
      dimensionCount: coreManifest.controlTotals.dimensionCount,
      dimensionValueCount: coreManifest.controlTotals.dimensionValueCount,
      numberSeriesCount: coreManifest.controlTotals.numberSeriesCount,
      numberSeriesLineCount: coreManifest.controlTotals.numberSeriesLineCount,
      paymentTermsCount: coreManifest.controlTotals.paymentTermsCount,
      realBankIdentifierCount: coreManifest.controlTotals.realBankIdentifierCount,
      payloadDigest: coreManifest.payload.digest,
      financeReferenceDigest: coreManifest.controlDigests.financeReferencesSha256,
      taxAssumption: { percent: corePayload.taxAssumption.standardVatPercent, truthClass: corePayload.taxAssumption.truthClass, confirmationStatus: corePayload.taxAssumption.confirmationStatus },
      performed: false,
      applied: false,
      accepted: false,
      requiredGatesClosed: false
    },
    preflight: { status: preflight.status, wave0Status: plan.wave0Preflight.status, workingDate: preflight.workingDate, operator: { userId: preflight.operator.userId, permissionSet: preflight.operator.permissionSet }, locale: preflight.locale, resetPoint: { status: preflight.resetPoint.status, requiredBeforeAnyWrite: preflight.resetPoint.requiredBeforeAnyWrite } },
    writeGate: { writesAuthorized: plan.authorization.writesAuthorized, noGoSteps: plan.authorization.noGoWriteSteps, nextAllowedStep: strategy.nextExecutableStep },
    provenance: sources.map((file, index) => ({ path: file, role: ['Tabellen- und Paketvertrag', 'Singleton-Parameterbaseline', 'Kanonischer CRONUS-Zielstrategieentscheid', 'Buchungsmatrix', 'Nummernserien und Lösungssollwerte', 'Read-only-Vorprüfung', 'Run-Plan und Schreibsperre', 'Blockierter W0-01-Zugriffsversuch', 'Kanonischer CORE-FINANCE-Payload', 'Digest- und Reihenfolgemanifest'][index] }))
  };
}

export function updateAllowlist(root = process.cwd()) {
  const index = readYaml(path.join(root, INDEX_PATH));
  index.governingChange = 'prepare-uabc-basic-de-setup-wave-1';
  const historicalPlaythruPaths = new Set(['evidence/playthru-uabc-basic-de/setup-baseline.yaml', 'evidence/playthru-uabc-basic-de/country-company-information-execution.yaml']);
  index.artifacts = index.artifacts.filter((item) => !historicalPlaythruPaths.has(item.path));
  const artifacts = [{ id: 'UABC-SRC-BCB-SETUP-WAVE1-PROJECTION-001', kindId: 'setup-wave-1-projection', path: PROJECTION_PATH, format: 'json', required: true }, { id: 'UABC-SRC-BCB-SETUP-WAVE1-SCHEMA-001', kindId: 'setup-wave-1-projection-schema', path: SCHEMA_PATH, format: 'json-schema', required: true }, { id: 'UABC-SRC-BCB-SETUP-WAVE1-GEN-001', kindId: 'setup-wave-1-projection-generator', path: 'scripts/generate-setup-wave-1-export.mjs', format: 'javascript', required: true }, { id: 'UABC-SRC-BCB-SETUP-WAVE1-VAL-001', kindId: 'setup-wave-1-projection-validator', path: 'scripts/validate-setup-wave-1-export.mjs', format: 'javascript', required: true }, { id: 'UABC-SRC-BCB-SETUP-WAVE1-TEST-001', kindId: 'setup-wave-1-projection-tests', path: 'tests/governance/setup-wave-1-export.test.mjs', format: 'javascript', required: true }, { id: 'UABC-SRC-BCB-W0-01-ATTEMPT-001', kindId: 'current-read-only-attempt', path: sources[7], format: 'yaml', required: true }, { id: 'UABC-SRC-BCB-CORE-FINANCE-PAYLOAD-001', kindId: 'core-finance-payload', path: sources[8], format: 'yaml', required: true }, { id: 'UABC-SRC-BCB-CORE-FINANCE-MANIFEST-001', kindId: 'core-finance-package-manifest', path: sources[9], format: 'yaml', required: true }, { id: 'UABC-SRC-BCB-CORE-FINANCE-SCHEMA-001', kindId: 'core-finance-payload-schema', path: 'governance/schemas/core-finance-payload.schema.json', format: 'json-schema', required: true }, { id: 'UABC-SRC-BCB-CORE-FINANCE-GEN-001', kindId: 'core-finance-package-generator', path: 'scripts/generate-core-finance-package.mjs', format: 'javascript', required: true }, { id: 'UABC-SRC-BCB-CORE-FINANCE-VAL-001', kindId: 'core-finance-package-validator', path: 'scripts/validate-core-finance-package.mjs', format: 'javascript', required: true }, { id: 'UABC-SRC-BCB-CORE-FINANCE-TEST-001', kindId: 'core-finance-package-tests', path: 'tests/governance/core-finance-package.test.mjs', format: 'javascript', required: true }];
  for (const artifact of artifacts) if (!index.artifacts.some((item) => item.path === artifact.path)) index.artifacts.push(artifact);
  const indexPath = path.join(root, INDEX_PATH);
  fs.writeFileSync(indexPath, YAML.stringify(index), 'utf8');
  const indexBytes = lfBytes(fs.readFileSync(indexPath));
  const mapBytes = jsonBytes(buildTwinExportMap(index));
  fs.writeFileSync(path.join(root, MAP_PATH), mapBytes);
  writeJson(path.join(root, PROVENANCE_PATH), buildProvenance(indexBytes, mapBytes));
  execFileSync(process.execPath, [path.join(root, 'scripts', 'update-uabc-conformance.mjs')], { cwd: root, stdio: 'ignore' });
}

if (process.argv[1]?.endsWith('generate-setup-wave-1-export.mjs')) { const root = process.cwd(); writeJson(path.join(root, PROJECTION_PATH), buildProjection()); updateAllowlist(root); console.log('Setup-Wave-1-Projektion erzeugt und positivgelistet.'); }

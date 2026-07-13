import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';
import { PROJECTION_PATH, SCHEMA_PATH, INDEX_PATH, MAP_PATH, PROVENANCE_PATH, CONFORMANCE_PATH, buildProjection } from './generate-setup-wave-1-export.mjs';
import { buildTwinExportMap, lfBytes } from './generate-spectra-0.10-integration.mjs';
import { validateCoreFinance } from './validate-core-finance-package.mjs';
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const READINESS_STAGE_IDS = ['R0-BASELINE-INVENTORY','R1-DEMO-DATA-DECISION','R2-FOUNDATION-SETUP','R3-CONFIGURATION-PACKAGES','R4-MASTER-AND-OPENING-DATA','R5-PROCESS-PLAYTHROUGH','R6-TEST-AND-UAT','R7-TRAINING','R8-CUTOVER','R9-HYPERCARE-READY-GATE'];
const READINESS_TICKETS = [['UABC-39'],['UABC-39'],['UABC-40'],['UABC-40'],['UABC-41'],['UABC-42','UABC-43','UABC-44'],['UABC-45','UABC-46'],['UABC-45','UABC-46'],['UABC-46'],['UABC-47','UABC-48','UABC-49','UABC-50']];
export function validateProjection(projection, schema) {
  const errors = [];
  const valid = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (!valid(projection)) errors.push(...(valid.errors ?? []).map((error) => `${error.instancePath} ${error.message}`));
  if (projection.writesAuthorized !== false || projection.writeGate?.noGoSteps?.length !== 17) errors.push('SCHREIBSPERRE');
  const state = projection.configurationState ?? {};
  if (state.baselineKind !== 'standard-cronus-demo' || state.baselineProvenance !== 'microsoft-standard-cronus-demo-data' || state.pilotConfigured !== false || state.writesApplied !== false || state.customerTargetRealized !== false || state.originMechanismStatus !== 'unbekannt-bis-wave0-readback' || state.copyRenameHypothesis !== 'nutzerhinweis-unbestaetigt' || state.setupStatus !== 'blockiert-bis-dom-readback-und-zielkonfiguration' || state.readbackStatus !== 'pending' || state.internalCompanyId !== null || state.targetDecision !== 'pending-wave-0-evidence' || state.resetDecision !== 'pending-resetpoint-evidence' || state.observedDisplayName === state.targetDisplayName || state.targetState?.classification !== 'bc-basic-target-not-applied' || state.appliedDifference?.status !== 'none-evidenced' || state.appliedDifference?.readbackEvidenceCount !== 0) errors.push('CRONUS-PILOT-TRENNUNG');
  const gate = state.companyStrategyGate ?? {};
  if (gate.status !== 'blocked-pending-wave0-and-reset-evidence' || gate.selectedOption !== null || gate.allowedOptions?.join('|') !== 'controlled-reuse-of-dedicated-cronus-copy|clean-new-company-or-copy' || gate.requiredEvidence?.length !== 6 || gate.decisionEvidenceCount !== 0 || gate.decisionAuthority !== 'project/bc-basic/pilot-setup-baseline.yaml#/companyInformation/companyStrategyDecision' || gate.nextExecutableStep !== 'W0-01-read-company-identity' || gate.writesAuthorized !== false || projection.writeGate?.nextAllowedStep !== gate.nextExecutableStep) errors.push('CRONUS-ZIELSTRATEGIE-GATE');
  const attempt = state.wave0ReadbackAttempt ?? {};
  if (attempt.status !== 'blocked-before-dom-readback' || attempt.evidencePath !== 'evidence/playthru-uabc-basic-de/wave-0-company-identity-readback.yaml' || attempt.attemptCount !== 2 || attempt.latestAttemptId !== 'UABC-W0-01-ATTEMPT-002' || attempt.latestAttemptAt !== '2026-07-13T14:11:07.3935478+02:00' || attempt.bcReadbackAuthority !== false || attempt.bcFieldValuesRead !== false || attempt.screenshotCaptured !== false || attempt.writesPerformed !== false || attempt.visibleTabTarget?.title !== 'Dynamics 365 Business Central' || attempt.visibleTabTarget?.environmentParameter !== 'Playthru' || attempt.visibleTabTarget?.companyParameter !== 'UABC-BASIC-DE') errors.push('W0-01-VERSUCHSWAHRHEIT');
  const core = projection.coreFinancePreparation ?? {};
  if (core.packageId !== 'UABC-01-CORE-FINANCE' || core.status !== 'prepared-for-controlled-live-run' || core.packageTableCount !== 19 || core.packageRecordCount !== 51 || core.manualTableCount !== 7 || core.manualRecordCount !== 18 || core.accountRoleCount !== 11 || core.dimensionCount !== 2 || core.dimensionValueCount !== 5 || core.numberSeriesCount !== 9 || core.numberSeriesLineCount !== 9 || core.paymentTermsCount !== 2 || core.realBankIdentifierCount !== 0 || core.taxAssumption?.percent !== 19 || core.taxAssumption?.truthClass !== 'synthetic-project-assumption' || core.taxAssumption?.confirmationStatus !== 'open' || core.performed !== false || core.applied !== false || core.accepted !== false || core.requiredGatesClosed !== false) errors.push('CORE-FINANCE-VORBEREITUNGSWAHRHEIT');
  const readiness = projection.readinessPath ?? {};
  const stages = readiness.stages ?? [];
  if (readiness.sourcePath !== 'project/bc-basic/project-plan.yaml' || readiness.baselineKind !== 'standard-cronus-demo' || readiness.targetGate !== 'BC-BASIC-READY-TO-PROD' || readiness.targetStatus !== 'geplant-nicht-erreicht' || readiness.currentStageId !== READINESS_STAGE_IDS[0] || readiness.nextExecutableStep !== 'W0-01-read-company-identity' || readiness.readyToProdClaimed !== false || readiness.productionStartClaimed !== false || readiness.customerAcceptanceClaimed !== false || readiness.pilotConfigured !== false || readiness.writesApplied !== false) errors.push('CRONUS-READY-TRUTH');
  if (stages.length !== READINESS_STAGE_IDS.length || stages.some((stage, index) => stage.stageId !== READINESS_STAGE_IDS[index] || stage.order !== index || stage.dependencyStageIds?.join('|') !== (index === 0 ? '' : READINESS_STAGE_IDS[index - 1]) || stage.ticketRefs?.join('|') !== READINESS_TICKETS[index].join('|') || stage.writeAuthorized !== false || stage.completed !== false || stage.executionEvidenceCount !== 0 || Number(stage.entryCriteriaCount ?? 0) < 1 || Number(stage.plannedActionCount ?? 0) < 1 || Number(stage.exitCriteriaCount ?? 0) < 1 || Number(stage.evidenceTargetCount ?? 0) < 1 || stage.stopOrRollbackDefined !== true)) errors.push('CRONUS-READY-SEQUENZ');
  const expectedWriteRequired = [false,false,true,true,true,true,true,false,true,true];
  if (stages.some((stage, index) => stage.bcWriteRequired !== expectedWriteRequired[index]) || stages[0]?.status !== 'blocked-before-dom-readback' || stages[1]?.status !== 'geplant-blockiert-durch-R0' || stages[2]?.status !== 'prepared-blocked-by-gates' || stages.slice(3).some((stage) => stage.status !== 'planned')) errors.push('CRONUS-READY-GATES');
  return errors;
}
export function validateAdapterProvenance({ provenance, indexBytes, mapBytes, conformance = null }) {
  const errors = [];
  if (provenance?.source?.blob_path !== INDEX_PATH || provenance?.projection?.projection_path !== MAP_PATH) errors.push('ADAPTER_ZIELBINDUNG');
  if (provenance?.source?.source_hash !== sha256(indexBytes)) errors.push(`ADAPTER_QUELL_DIGEST: ${sha256(indexBytes)}`);
  if (provenance?.source?.source_hash_after !== provenance?.source?.source_hash) errors.push('ADAPTER_QUELL_MUTATION');
  if (provenance?.projection?.digest_algorithm !== 'SHA-256' || provenance?.projection?.projection_digest !== sha256(mapBytes)) errors.push(`ADAPTER_PROJEKTIONS_DIGEST: ${sha256(mapBytes)}`);
  if (conformance && (conformance.adapterProvenance?.sourceHash !== provenance?.source?.source_hash || conformance.adapterProvenance?.projectionDigest !== provenance?.projection?.projection_digest)) errors.push('KONFORMITAET_ADAPTER_DIGEST');
  return errors;
}
export function validateCurrentAuthoritySurface(index, map) {
  const errors = [];
  const historicalPlaythruPaths = new Set(['evidence/playthru-uabc-basic-de/setup-baseline.yaml', 'evidence/playthru-uabc-basic-de/country-company-information-execution.yaml']);
  if ((index?.artifacts ?? []).some((item) => historicalPlaythruPaths.has(item.path)) || (map?.artifacts ?? []).some((item) => historicalPlaythruPaths.has(item.path))) errors.push('HISTORISCHE-AUSFUEHRUNG-IN-AKTIVER-PROJEKTION');
  return errors;
}
export function validateExport(root = process.cwd()) {
  const projection = JSON.parse(fs.readFileSync(path.join(root, PROJECTION_PATH), 'utf8'));
  const schema = JSON.parse(fs.readFileSync(path.join(root, SCHEMA_PATH), 'utf8'));
  const errors = validateProjection(projection, schema);
  errors.push(...validateCoreFinance(root).map((error) => `CORE-FINANCE ${error}`));
  if (JSON.stringify(projection) !== JSON.stringify(buildProjection())) errors.push('PROJEKTION-QUELLBINDUNG');
  const indexBytes = lfBytes(fs.readFileSync(path.join(root, INDEX_PATH)));
  const index = YAML.parse(indexBytes.toString('utf8'));
  const map = JSON.parse(fs.readFileSync(path.join(root, MAP_PATH), 'utf8'));
  const mapBytes = fs.readFileSync(path.join(root, MAP_PATH));
  const provenance = JSON.parse(fs.readFileSync(path.join(root, PROVENANCE_PATH), 'utf8'));
  const conformance = YAML.parse(fs.readFileSync(path.join(root, CONFORMANCE_PATH), 'utf8'));
  if (JSON.stringify(map) !== JSON.stringify(buildTwinExportMap(index))) errors.push('EXPORTMAP_INDEX_BINDUNG');
  errors.push(...validateCurrentAuthoritySurface(index, map));
  errors.push(...validateAdapterProvenance({ provenance, indexBytes, mapBytes, conformance }));
  for (const file of [PROJECTION_PATH, SCHEMA_PATH, 'scripts/generate-setup-wave-1-export.mjs', 'scripts/validate-setup-wave-1-export.mjs', 'tests/governance/setup-wave-1-export.test.mjs', 'evidence/playthru-uabc-basic-de/wave-0-company-identity-readback.yaml', 'project/bc-basic/core-finance-payload.yaml', 'project/bc-basic/core-finance-package-manifest.yaml', 'governance/schemas/core-finance-payload.schema.json', 'scripts/generate-core-finance-package.mjs', 'scripts/validate-core-finance-package.mjs', 'tests/governance/core-finance-package.test.mjs']) { if (!index.artifacts.some((item) => item.path === file) || !map.artifacts.some((item) => item.path === file)) errors.push(`POSITIVLISTE ${file}`); }
  return errors;
}
if (process.argv[1]?.endsWith('validate-setup-wave-1-export.mjs')) { const errors = validateExport(); if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log('Setup-Wave-1-Export bestanden.'); }

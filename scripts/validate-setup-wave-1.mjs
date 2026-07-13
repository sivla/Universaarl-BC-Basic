import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

export const MATRIX_PATH = 'project/bc-basic/setup-wave-1-matrix.yaml';
export const RUN_PLAN_PATH = 'evidence/playthru-uabc-basic-de/setup-wave-1-control-center-run-plan.yaml';
export const SOURCE_CATALOG_PATH = 'docs/research/sources.yaml';
export const SOURCE_REGISTER_PATH = 'docs/research/source-register.md';
export const PARAMETER_BASELINE_PATH = 'project/bc-basic/setup-parameter-baseline.yaml';
export const PREFLIGHT_EVIDENCE_PATH = 'evidence/playthru-uabc-basic-de/setup-wave-1-read-only-preflight.yaml';

const CORE = 'UABC-01-CORE-FINANCE';
const PACKAGE_STATES = new Map([[CORE, 'prepared-for-controlled-live-run'], ['UABC-02-TRADE-MASTER', 'prepared-not-executed'], ['UABC-03-OPENING-DATA', 'designed-not-executed']]);
const CORE_ALLOWLIST = [[348, 'Dimension'], [349, 'Dimension Value'], [15, 'G/L Account'], [250, 'Gen. Business Posting Group'], [251, 'Gen. Product Posting Group'], [323, 'VAT Business Posting Group'], [324, 'VAT Product Posting Group'], [252, 'General Posting Setup'], [325, 'VAT Posting Setup'], [92, 'Customer Posting Group'], [93, 'Vendor Posting Group'], [94, 'Inventory Posting Group'], [308, 'No. Series'], [309, 'No. Series Line'], [3, 'Payment Terms'], [289, 'Payment Method'], [14, 'Location']];
const SINGLETON_ALLOWLIST = [[98, 'General Ledger Setup'], [311, 'Sales & Receivables Setup'], [312, 'Purchases & Payables Setup'], [313, 'Inventory Setup']];
const WRITE_STEP_IDS = ['RUN-06', 'RUN-07', 'RUN-09', 'RUN-11', 'RUN-16', 'RUN-17', 'RUN-18', 'RUN-19', 'RUN-22'];
const REQUIRED_SOURCE_IDS = ['UABC-SRC-BCB-CONFIG-PACKAGES-001', 'UABC-SRC-BCB-COMPANY-INFO-001', 'UABC-SRC-BCB-SETUP-OVERVIEW-001', 'UABC-SRC-BCB-NUMBER-SERIES-001', 'UABC-SRC-BCB-FINANCE-SETUP-001', 'UABC-SRC-BCB-DIMENSIONS-001', 'UABC-SRC-BCB-INVENTORY-SETUP-001', 'UABC-SRC-BCB-TRADE-SETUP-001'];
const CORE_SOURCE_PATHS = ['project/bc-basic/customer-templates/dimensions.example.csv', 'project/bc-basic/customer-templates/gl-accounts.example.csv', 'project/bc-basic/posting-setup-matrix.yaml', 'project/bc-basic/solution-blueprint.yaml'];
const REQUIRED_SERIES = ['CUST', 'S-ORD', 'S-INV', 'S-CR', 'VEND', 'P-ORD', 'P-INV', 'P-CR', 'ITEM'];
const PROHIBITED_NAME = /(?:G\/L Entry|Ledger Entry|Value Entry|VAT Entry|Register|Posted (?:Sales|Purchase)|Continia)/i;
const SAFE_RELATIVE = /^(?![A-Za-z]:)(?!\/)(?!.*\\)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]+$/;
const pairs = (items) => items.map(({ tableId, tableName }) => `${tableId}:${tableName}`).join('|');
const expectedPairs = (items) => items.map(([id, name]) => `${id}:${name}`).join('|');

export function validateSetupWave1({ matrix, runPlan, sources, sourceRegister, parameterBaseline, coreSourceData, readOnlyPreflight }) {
  const errors = [];
  const fail = (code, detail) => errors.push(`${code}: ${detail}`);
  if (matrix?.schemaVersion !== 1 || matrix?.matrixId !== 'UABC-SETUP-WAVE1-MATRIX-001' || matrix?.status !== 'prepared-for-controlled-live-run') fail('MATRIX_ID', 'Matrixvertrag oder Status weicht ab');
  if (matrix?.target?.environment !== 'Playthru' || matrix?.target?.companyId !== 'UABC-BASIC-DE' || matrix?.target?.legalCompanyName !== 'Universaarl GmbH' || matrix?.target?.legacyCompanyId !== 'UNIVERSAARL-DE') fail('TARGET_BINDING', 'Ziel-, Rechtsnamen- oder Legacybindung weicht ab');
  if (matrix?.target?.businessCentral?.platform !== '28.0.52286.0') fail('VERSION_BINDING', 'aktuelle Plattformbindung fehlt');
  const configurationState = matrix?.target?.configurationState ?? {};
  if (configurationState.baselineClass !== 'standard-cronus-demo-baseline' || configurationState.appliedDifferenceStatus !== 'none-evidenced' || configurationState.configuredPilotClaimed !== false || configurationState.decisionStatus !== 'wave-0-read-only-preflight-required' || !/Standard-CRONUS/.test(configurationState.baselineTruth ?? '')) fail('CRONUS_BASELINE', 'Standard-CRONUS-Demo-Ausgangsbasis muss vom noch nicht konfigurierten Pilot-Soll getrennt sein');
  if (matrix?.target?.futureVisibleCompanyNames?.['UABC-BASIC-DE'] !== 'Universaarl GmbH (BC Basic Pilot)' || matrix?.target?.futureVisibleCompanyNames?.['UNIVERSAARL-DE'] !== 'Universaarl GmbH (Legacy)' || !/kein freigegebener Live-Write/.test(matrix?.target?.visibleNameChange ?? '')) fail('SICHTBARE_NAMENSANFORDERUNG', 'sichtbare Namensanforderung fehlt oder behauptet einen Write');
  if (matrix?.truthBoundary?.liveTablesAdded !== 0 || matrix?.truthBoundary?.liveRecordsApplied !== 0 || matrix?.truthBoundary?.liveErrors !== 0 || matrix?.truthBoundary?.postingPerformed !== false || matrix?.truthBoundary?.externalTransmissionPerformed !== false || matrix?.truthBoundary?.continiaUsed !== false || matrix?.truthBoundary?.productiveClaim !== false) fail('TRUTH_BOUNDARY', 'Live-, Buchungs- oder Produktivwirkung wird behauptet');
  for (const [packageId, status] of PACKAGE_STATES) { const pkg = matrix?.packages?.find((item) => item.packageId === packageId); if (!pkg || pkg.status !== status || pkg.liveState?.tables !== 0 || pkg.liveState?.records !== 0 || pkg.liveState?.errors !== 0) fail('PACKAGE_STATE', packageId); }

  const rows = matrix?.matrix ?? []; const seenOrders = new Set(); const earlierIds = new Set();
  for (const [index, row] of rows.entries()) {
    if (!PACKAGE_STATES.has(row?.packageId) || !Number.isInteger(row?.tableId) || !row?.tableName || seenOrders.has(row?.order)) fail('ROW_BINDING', `Zeile ${index + 1}`);
    seenOrders.add(row?.order);
    const fieldLists = [row?.requiredFields, row?.optionalFields, row?.excludedFields];
    if (!fieldLists.every(Array.isArray) || !fieldLists[0]?.length || new Set(fieldLists.flat()).size !== fieldLists.flat().length) fail('FIELD_DISJOINT', `${row?.tableId}:${row?.tableName}`);
    if (!Array.isArray(row?.dependsOn) || !row.dependsOn.every((dependency) => typeof dependency === 'string' ? dependency === 'Country/Region DE' || PACKAGE_STATES.has(dependency) : earlierIds.has(dependency))) fail('DEPENDENCY_ORDER', `${row?.tableId}:${row?.tableName}`);
    if (row?.include === true && PROHIBITED_NAME.test(row.tableName)) fail('PROHIBITED_TABLE', row.tableName);
    if (typeof row?.source !== 'string' || !SAFE_RELATIVE.test(row.source)) fail('QUELLPFAD', `${row?.tableId}:${row?.tableName}`);
    earlierIds.add(row?.tableId);
  }
  const coreRows = rows.filter((row) => row.packageId === CORE && row.include === true);
  if (pairs(coreRows) !== expectedPairs(CORE_ALLOWLIST) || coreRows.some((row) => /Bank Account/i.test(row.tableName))) fail('CORE_ALLOWLIST', 'CORE-Tabellenbindung oder Bankausschluss weicht ab');
  const payment = coreRows.find((row) => row.tableId === 289);
  if (!payment || payment.dependsOn.length !== 0 || payment.optionalFields.includes('Bal. Account No.') || payment.optionalFields.includes('Bal. Account Type')) fail('PAYMENT_METHOD_DEPENDENCY', 'Payment Method darf keinen Bankbezug tragen');
  for (const row of coreRows) {
    if (!CORE_SOURCE_PATHS.includes(row.source)) { fail('CORE_SOURCE_PATH', `${row.tableId}:${row.source}`); continue; }
    const sourceTable = coreSourceData?.[row.source]?.find((item) => item.tableId === row.tableId && item.tableName === row.tableName);
    if (!sourceTable || !Array.isArray(sourceTable.records) || !sourceTable.records.length) fail('CORE_SOURCE_CONTENT', `${row.tableId}:${row.tableName}`);
  }
  const series = coreSourceData?.['project/bc-basic/solution-blueprint.yaml']?.find((item) => item.tableId === 308)?.records ?? [];
  const lines = coreSourceData?.['project/bc-basic/solution-blueprint.yaml']?.find((item) => item.tableId === 309)?.records ?? [];
  if (series.map((item) => item.Code).join('|') !== REQUIRED_SERIES.join('|') || lines.map((item) => item['Series Code']).join('|') !== REQUIRED_SERIES.join('|') || lines.some((item) => !item['Starting No.'] || item.Open !== true)) fail('NUMBER_SERIES_SOURCE', 'No.-Series oder Lines sind nicht vollstaendig aufloesbar');

  const catalog = new Map((sources?.sources ?? []).map((source) => [source.id, source]));
  if (pairs((matrix?.officialSourceRefs ?? []).map((id) => ({ tableId: id, tableName: '' }))) !== '') { /* Matrix-Referenzen werden unten einzeln geprueft. */ }
  for (const id of REQUIRED_SOURCE_IDS) { const source = catalog.get(id); if (!source || source.kind !== 'microsoft-learn' || !/^https:\/\/learn\.microsoft\.com\//.test(source.url ?? '') || source.retrievedAt !== '2026-07-13' || source.truthClass !== 'methodenquelle-kein-live-nachweis' || !sourceRegister?.includes(id) || !sourceRegister.includes(`(${source.url})`)) fail('SOURCE_RESOLUTION', id); }
  if ((matrix?.officialSourceRefs ?? []).join('|') !== REQUIRED_SOURCE_IDS.join('|')) fail('QUELLENBINDUNG', 'Matrixquellen weichen ab');

  if (parameterBaseline?.baselineId !== 'UABC-SETUP-WAVE1-PARAMETERS-001' || parameterBaseline?.status !== 'designed-not-executed' || parameterBaseline?.truthBoundary?.liveWriteApproved !== false) fail('PARAMETER_BASELINE', 'Parameterbaseline fehlt oder behauptet Ausfuehrung');
  const parameterRows = parameterBaseline?.singletonValues ?? [];
  if (pairs(parameterRows) !== expectedPairs(SINGLETON_ALLOWLIST)) fail('PARAMETER_ALLOWLIST', 'Singleton-Allowlist weicht ab');

  if (runPlan?.runPlanId !== 'UABC-RUN-SETUP-WAVE1-001' || runPlan?.status !== 'ready-for-control-center-not-executed' || runPlan?.execution?.performed !== false || runPlan?.parameterBaselinePath !== PARAMETER_BASELINE_PATH || runPlan?.observedReadOnlyPreflightEvidencePath !== PREFLIGHT_EVIDENCE_PATH) fail('RUN_PLAN_ID', 'Run-Plan oder Parameterbindung weicht ab');
  const authorization = runPlan?.authorization;
  const expectedReadOnly = ['PRE-01', 'PRE-02', 'PRE-03', 'PRE-04', 'PRE-05', 'PRE-06', 'PRE-07', 'PRE-08', 'PRE-09', 'PRE-10', 'PRE-11', 'PRE-12', 'RUN-01', 'RUN-02', 'RUN-03', 'RUN-04', 'RUN-05'];
  const expectedNoGo = ['RUN-06', 'RUN-07', 'RUN-08', 'RUN-09', 'RUN-10', 'RUN-11', 'RUN-12', 'RUN-13', 'RUN-14', 'RUN-15', 'RUN-16', 'RUN-17', 'RUN-18', 'RUN-19', 'RUN-20', 'RUN-21', 'RUN-22'];
  if (authorization?.status !== 'lesevorpruefung-freigegeben-schreibschritte-gesperrt' || authorization?.writesAuthorized !== false || authorization?.goReadOnlySteps?.join('|') !== expectedReadOnly.join('|') || authorization?.noGoWriteSteps?.join('|') !== expectedNoGo.join('|')) fail('AUSFUEHRUNGSGRENZE', 'nur PRE-01..12 und RUN-01..05 duerfen lesend freigegeben sein');
  if (runPlan?.target?.environment !== 'Playthru' || runPlan?.target?.companyId !== 'UABC-BASIC-DE' || runPlan?.target?.platform !== '28.0.52286.0' || runPlan?.target?.legalCompanyName !== 'Universaarl GmbH' || runPlan?.target?.futureVisibleCompanyNames?.['UABC-BASIC-DE'] !== 'Universaarl GmbH (BC Basic Pilot)' || runPlan?.target?.futureVisibleCompanyNames?.['UNIVERSAARL-DE'] !== 'Universaarl GmbH (Legacy)') fail('RUN_TARGET', 'Run-Ziel oder Namensanforderung weicht ab');
  if (readOnlyPreflight?.status !== 'beobachtet-nur-lesend' || readOnlyPreflight?.target?.environment !== 'Playthru' || readOnlyPreflight?.target?.companyId !== 'UABC-BASIC-DE' || readOnlyPreflight?.target?.platform !== '28.0.52286.0' || readOnlyPreflight?.target?.application !== '28.2.50931.52241' || readOnlyPreflight?.target?.alRuntime !== '17.0' || readOnlyPreflight?.operator?.userId !== 'KAJETAN.KALICKI' || readOnlyPreflight?.operator?.permissionSet !== 'SUPER' || readOnlyPreflight?.workingDate !== '2026-07-13' || readOnlyPreflight?.locale !== 'German (Germany)' || readOnlyPreflight?.resetPoint?.status !== 'missing-blocker') fail('VORPRUEFUNG_LESEND', 'beobachtete Vorpruefung oder offener Resetpunkt weicht ab');
  const observedState = readOnlyPreflight?.configurationState ?? {}; const baselineState = observedState.baseline ?? {}; const pilotTarget = observedState.pilotTarget ?? {}; const appliedDifference = observedState.appliedDifference ?? {};
  if (baselineState.classification !== 'standard-cronus-demo-baseline' || baselineState.technicalCompanyName !== 'UABC-BASIC-DE' || baselineState.internalCompanyId !== 'unknown-required-before-write' || baselineState.configuredPilotClaimed !== false || pilotTarget.status !== 'pilot-build-pending' || pilotTarget.targetDecision !== 'pending-wave-0-evidence' || appliedDifference.status !== 'none-evidenced' || appliedDifference.readbackEvidence?.length !== 0) fail('CRONUS_BASELINE', 'read-only Standard-CRONUS-Demo-Baseline, Pilot-Soll und angewendete Differenz sind nicht fail-closed getrennt');
  if (runPlan?.wave0Preflight?.status !== 'required-not-executed' || runPlan?.wave0Preflight?.currentBaseline !== 'standard-cronus-demo-baseline' || runPlan?.wave0Preflight?.configuredPilotClaimed !== false || runPlan?.wave0Preflight?.checks?.map((item) => item.id).join('|') !== 'W0-01|W0-02|W0-03|W0-04|W0-05|W0-06' || runPlan?.wave0Preflight?.selectedDecision !== null || runPlan?.wave0Preflight?.evidencePath !== null) fail('WAVE0_PREFLIGHT', 'Wave-0 muss vor jedem Write vollstaendig und noch offen dokumentiert sein');
  if (readOnlyPreflight?.packages?.map((item) => `${item.packageId}:${item.tables}/${item.records}/${item.errors}`).join('|') !== 'UABC-01-CORE-FINANCE:0/0/0|UABC-02-TRADE-MASTER:0/0/0|UABC-03-OPENING-DATA:0/0/0') fail('VORPRUEFUNG_LESEND', 'Paketnullstand weicht ab');
  const writes = runPlan?.allowedWrites;
  if (writes?.packageId !== CORE || writes?.packageName !== 'Kern und Finanzwesen' || pairs(writes?.tableAllowlist ?? []) !== expectedPairs(CORE_ALLOWLIST) || pairs(writes?.singletonAllowlist ?? []) !== expectedPairs(SINGLETON_ALLOWLIST) || !/TRADE-MASTER und OPENING-DATA sind ausgeschlossen/.test(writes?.correctionScope ?? '')) fail('WRITE_ALLOWLIST', 'Write-Allowlist weicht ab');
  const steps = runPlan?.steps ?? []; const writeSteps = steps.filter((step) => step.write === true);
  if (writeSteps.map((step) => step.id).join('|') !== WRITE_STEP_IDS.join('|') || writeSteps.some((step) => step.packageId !== CORE || !Array.isArray(step.readbackStepIds) || !step.readbackStepIds.length || step.performed === true || step.observedResult != null)) fail('WRITE_STEPS', 'Write-Schritte oder Readbacks weichen ab');
  for (const step of writeSteps.filter((step) => ['RUN-16', 'RUN-17', 'RUN-18', 'RUN-19'].includes(step.id))) { const baseline = parameterRows.find((item) => item.tableId === step.tableId); if (!baseline || JSON.stringify(step.expectedValues) !== JSON.stringify(baseline.values)) fail('SINGLETON_VALUES', step.id); }
  const correction = steps.find((step) => step.id === 'RUN-22'); if (correction?.correctionScope !== 'core-allowlist-only') fail('CORRECTION_SCOPE', 'RUN-22 darf nur CORE-Allowlistfelder korrigieren');
  if ((runPlan?.stopCodes ?? []).map((item) => item.code).join('|') !== ['UABC-STOP-01', 'UABC-STOP-02', 'UABC-STOP-03', 'UABC-STOP-04', 'UABC-STOP-05', 'UABC-STOP-06', 'UABC-STOP-07', 'UABC-STOP-08'].join('|')) fail('STOP_CODES', 'Stopcodes muessen exakt UABC-STOP-01 bis UABC-STOP-08 sein');
  return errors;
}

export function loadSetupWave1(root = process.cwd()) {
  const readYaml = (relative) => YAML.parse(fs.readFileSync(path.join(root, ...relative.split('/')), 'utf8'));
  const readCsv = (relative) => { const [header, ...rows] = fs.readFileSync(path.join(root, ...relative.split('/')), 'utf8').trim().split(/\r?\n/); const fields = header.split(','); return rows.map((line) => Object.fromEntries(fields.map((field, index) => [field, line.split(',')[index] ?? '']))); };
  const tableData = (relative) => {
    if (!relative.endsWith('.csv')) return readYaml(relative).tableData;
    const records = readCsv(relative);
    const groups = new Map();
    for (const record of records) {
      const key = `${record.TableId}:${record.TableName}`;
      if (!groups.has(key)) groups.set(key, { tableId: Number(record.TableId), tableName: record.TableName, records: [] });
      groups.get(key).records.push(record);
    }
    return [...groups.values()];
  };
  return { matrix: readYaml(MATRIX_PATH), runPlan: readYaml(RUN_PLAN_PATH), sources: readYaml(SOURCE_CATALOG_PATH), sourceRegister: fs.readFileSync(path.join(root, ...SOURCE_REGISTER_PATH.split('/')), 'utf8'), parameterBaseline: readYaml(PARAMETER_BASELINE_PATH), readOnlyPreflight: readYaml(PREFLIGHT_EVIDENCE_PATH), coreSourceData: Object.fromEntries(CORE_SOURCE_PATHS.map((relative) => [relative, tableData(relative)])) };
}

if (process.argv[1]?.endsWith('validate-setup-wave-1.mjs')) {
  const errors = validateSetupWave1(loadSetupWave1());
  if (errors.length) { console.error(`Setup-Wave-1-Pruefung fehlgeschlagen (${errors.length}):\n- ${errors.join('\n- ')}`); process.exitCode = 1; }
  else console.log('Setup-Wave-1-Pruefung bestanden: unveränderte Standard-CRONUS-Demo-Baseline und Pilot-Soll getrennt, Wave-0 offen, exakte CORE-Allowlist und fail-closed Write-Schritte; kein Live-Run.');
}

import crypto from 'node:crypto';
import fs from 'node:fs';
import YAML from 'yaml';

export const PAYLOAD_PATH = 'project/bc-basic/core-finance-payload.yaml';
export const MANIFEST_PATH = 'project/bc-basic/core-finance-package-manifest.yaml';
export const SCHEMA_PATH = 'governance/schemas/core-finance-payload.schema.json';

const lfBytes = (value) => Buffer.from(String(value).replace(/\r\n/g, '\n'), 'utf8');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const canonical = (value) => JSON.stringify(value);

export function readCoreFinancePayload(root = process.cwd()) {
  const text = fs.readFileSync(`${root}/${PAYLOAD_PATH}`, 'utf8');
  return { payload: YAML.parse(text), payloadBytes: lfBytes(text) };
}

export function deriveControlTotals(payload) {
  const packageRecordCount = payload.packageTables.reduce((sum, table) => sum + table.records.length, 0);
  const manualRecordCount = payload.manualSteps.reduce((sum, table) => sum + table.records.length, 0);
  const count = (tableId, group = payload.packageTables) => group.find((table) => table.tableId === tableId)?.records.length ?? 0;
  return {
    packageTableCount: payload.packageTables.length,
    packageRecordCount,
    manualTableCount: payload.manualSteps.length,
    manualRecordCount,
    totalTableCount: payload.packageTables.length + payload.manualSteps.length,
    totalRecordCount: packageRecordCount + manualRecordCount,
    accountRoleCount: payload.accountRoles.length,
    dimensionCount: count(348),
    dimensionValueCount: count(349),
    numberSeriesCount: count(308),
    numberSeriesLineCount: count(309),
    paymentTermsCount: count(3),
    realBankIdentifierCount: 0
  };
}

function tableManifest(table) {
  return {
    order: table.order,
    tableId: table.tableId,
    tableName: table.tableName,
    page: table.page,
    mode: table.mode,
    recordCount: table.records.length,
    naturalKey: table.naturalKey,
    requiredFields: table.requiredFields,
    optionalFields: table.optionalFields,
    excludedFields: table.excludedFields,
    dependsOn: table.dependsOn,
    expectedOperations: [...new Set(table.records.map((record) => record.expectedOperation))],
    controlKeys: table.records.map((record) => ({ recordId: record.recordId, key: record.key })),
    expectedEffect: table.expectedEffect,
    rollback: table.rollback,
    evidenceTarget: table.evidenceTarget
  };
}

export function buildCoreFinanceManifest(payload, payloadBytes) {
  const allTables = [...payload.packageTables, ...payload.manualSteps];
  const postingRecords = payload.packageTables
    .filter((table) => [15, 92, 93, 94, 250, 251, 252, 277, 323, 324, 325, 5813].includes(table.tableId))
    .map((table) => ({ tableId: table.tableId, records: table.records }));
  const referenceRecords = allTables.map((table) => ({ tableId: table.tableId, records: table.records.map((record) => ({ key: record.key, fields: record.fields, foreignKeys: record.foreignKeys })) }));
  return {
    schemaVersion: 1,
    manifestId: 'UABC-MANIFEST-CORE-FINANCE-001',
    projectId: payload.projectId,
    packageId: payload.packageId,
    packageName: payload.packageName,
    status: payload.status,
    payload: { path: PAYLOAD_PATH, schemaPath: SCHEMA_PATH, digestAlgorithm: 'SHA-256', digest: sha256(payloadBytes) },
    truthBoundary: payload.truthBoundary,
    gates: payload.gates,
    taxAssumption: payload.taxAssumption,
    controlTotals: deriveControlTotals(payload),
    controlDigests: {
      accountRolesSha256: sha256(lfBytes(canonical(payload.accountRoles))),
      financeReferencesSha256: sha256(lfBytes(canonical(postingRecords))),
      allRecordReferencesSha256: sha256(lfBytes(canonical(referenceRecords)))
    },
    importSequence: [...payload.packageTables].sort((a, b) => a.order - b.order).map(tableManifest),
    manualSequence: [...payload.manualSteps].sort((a, b) => a.order - b.order).map(tableManifest),
    executionContract: payload.executionContract,
    worklogBinding: { ticketId: payload.preparationWorklog.taskId, worklogId: payload.preparationWorklog.id, hours: payload.preparationWorklog.hours, netAmount: payload.preparationWorklog.netAmount },
    generatedFrom: [PAYLOAD_PATH, SCHEMA_PATH]
  };
}

export function generateCoreFinancePackage(root = process.cwd()) {
  const { payload, payloadBytes } = readCoreFinancePayload(root);
  const manifest = buildCoreFinanceManifest(payload, payloadBytes);
  fs.writeFileSync(`${root}/${MANIFEST_PATH}`, YAML.stringify(manifest), 'utf8');
  return manifest;
}

if (process.argv[1]?.endsWith('generate-core-finance-package.mjs')) {
  const manifest = generateCoreFinancePackage();
  console.log(`CORE-FINANCE-Manifest erzeugt: ${manifest.controlTotals.packageTableCount} Pakettabellen/${manifest.controlTotals.packageRecordCount} Paketdatensätze, ${manifest.controlTotals.manualTableCount} manuelle Tabellen/${manifest.controlTotals.manualRecordCount} Werte.`);
}

import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';
import { PAYLOAD_PATH, MANIFEST_PATH, SCHEMA_PATH, buildCoreFinanceManifest, deriveControlTotals, readCoreFinancePayload } from './generate-core-finance-package.mjs';

const PACKAGE_TABLES = [
  [348, 'Dimension', 100], [349, 'Dimension Value', 110], [15, 'G/L Account', 120],
  [250, 'Gen. Business Posting Group', 130], [251, 'Gen. Product Posting Group', 140],
  [323, 'VAT Business Posting Group', 150], [324, 'VAT Product Posting Group', 160],
  [92, 'Customer Posting Group', 170], [93, 'Vendor Posting Group', 180], [94, 'Inventory Posting Group', 190],
  [3, 'Payment Terms', 200], [289, 'Payment Method', 210], [14, 'Location', 220],
  [308, 'No. Series', 230], [309, 'No. Series Line', 240], [252, 'General Posting Setup', 250],
  [325, 'VAT Posting Setup', 260], [277, 'Bank Account Posting Group', 270], [5813, 'Inventory Posting Setup', 280]
];
const MANUAL_TABLES = [
  [9, 'Country/Region', 10], [79, 'Company Information', 20], [98, 'General Ledger Setup', 290],
  [50, 'Accounting Period', 300], [311, 'Sales & Receivables Setup', 310],
  [312, 'Purchases & Payables Setup', 320], [313, 'Inventory Setup', 330]
];
const ACCOUNT_ROLES = new Map([
  ['BANK-CLEARING', '12000'], ['RECEIVABLES-CONTROL', '14000'], ['INPUT-VAT-19', '15760'],
  ['INVENTORY-TRADE', '16000'], ['EQUITY-CLEARING', '29000'], ['PAYABLES-CONTROL', '33000'],
  ['OUTPUT-VAT-19', '38000'], ['SALES-TRADE', '44000'], ['PURCHASE-TRADE', '50000'],
  ['COGS-TRADE', '50100'], ['INVENTORY-DIFFERENCE', '69000']
]);
const SERIES = ['CUST', 'S-ORD', 'S-INV', 'S-CR', 'VEND', 'P-ORD', 'P-INV', 'P-CR', 'ITEM'];
const LEDGER_TABLE_IDS = new Set([17, 21, 25, 32, 45, 46, 110, 111, 112, 113, 114, 115, 120, 121, 122, 123, 124, 125, 169, 271, 272, 379, 380, 5802]);
const keyText = (value) => JSON.stringify(value, Object.keys(value).sort());
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function loadCoreFinance(root = process.cwd()) {
  const { payload, payloadBytes } = readCoreFinancePayload(root);
  return {
    payload,
    payloadBytes,
    manifest: YAML.parse(fs.readFileSync(`${root}/${MANIFEST_PATH}`, 'utf8')),
    schema: JSON.parse(fs.readFileSync(`${root}/${SCHEMA_PATH}`, 'utf8'))
  };
}

export function validateCoreFinanceData({ payload, payloadBytes = Buffer.from(YAML.stringify(payload), 'utf8'), manifest, schema }) {
  const errors = [];
  const fail = (code, detail) => errors.push(`${code}: ${detail}`);

  if (payload.packageId !== 'UABC-01-CORE-FINANCE' || payload.packageName !== 'Kern und Finanzwesen') fail('PAKET-ID', 'Paket-ID oder Name weicht ab');
  const truth = payload.truthBoundary ?? {};
  if (payload.status !== 'prepared-for-controlled-live-run' || truth.bcReadbackAuthority !== false || truth.customerTargetRealized !== false || truth.pilotConfigured !== false || truth.writesApplied !== false || truth.writesAuthorized !== false || truth.packageApplied !== false || truth.customerAccepted !== false || !same(truth.liveEvidence, { tables: 0, records: 0, errors: 0 })) fail('WRITE-CLAIM', 'Payload behauptet Anwendung, Freigabe, Abnahme oder Live-Evidence');
  if (payload.target?.baselineKind !== 'standard-cronus-demo' || payload.gates?.status !== 'blocked-before-dom-readback' || !payload.gates?.requiredBeforePackageDefinition?.includes('W0-01-read-company-identity') || !payload.gates?.requiredBeforePackageDefinition?.includes('W0-05-prove-resetpoint') || !payload.gates?.requiredBeforeImport?.includes('separate-write-authorization')) fail('W0-GATE', 'Wave-0-, Reset- oder Write-Gate wird umgangen');
  if (payload.taxAssumption?.standardVatPercent !== 19 || payload.taxAssumption?.truthClass !== 'synthetic-project-assumption' || payload.taxAssumption?.confirmationStatus !== 'open' || payload.taxAssumption?.confirmationRequiredBeforeApply !== true || payload.taxAssumption?.legalOrTaxAdviceClaimed !== false) fail('STEUERCLAIM', '19-Prozent-Annahme ist nicht offen und steuerlich bestätigungspflichtig');

  if (schema) {
    const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
    if (!validate(payload)) for (const error of validate.errors ?? []) fail('SCHEMA', `${error.instancePath || '/'} ${error.message}`);
  }

  const pairCheck = (tables, expected, mode) => {
    if (tables.length !== expected.length) fail('TABELLENBINDUNG', `${mode}: ${tables.length} statt ${expected.length}`);
    expected.forEach(([tableId, tableName, order], index) => {
      const table = tables[index];
      if (table?.tableId !== tableId || table?.tableName !== tableName || table?.order !== order || table?.mode !== mode) fail('TABELLENBINDUNG', `${mode}: erwartet ${tableId}/${tableName}/${order}`);
    });
  };
  pairCheck(payload.packageTables ?? [], PACKAGE_TABLES, 'configuration-package');
  pairCheck(payload.manualSteps ?? [], MANUAL_TABLES, 'manual-ui-readback');

  const allTables = [...(payload.packageTables ?? []), ...(payload.manualSteps ?? [])];
  const tableById = new Map();
  const recordIds = new Set();
  const targetIndex = new Set();
  for (const table of allTables) {
    if (tableById.has(table.tableId)) fail('DOPPELTER-SCHLUESSEL', `Tabelle ${table.tableId}`);
    tableById.set(table.tableId, table);
    if (table.tableId === 270 || LEDGER_TABLE_IDS.has(table.tableId) || /(^|\s)(Entry|Posted)(\s|$)|Ledger Entry|Continia/i.test(table.tableName)) fail('VERBOTENE-TABELLE', `${table.tableId}/${table.tableName}`);
    const required = new Set(table.requiredFields ?? []), optional = new Set(table.optionalFields ?? []), excluded = new Set(table.excludedFields ?? []);
    for (const field of required) if (optional.has(field) || excluded.has(field)) fail('FELDMENGEN', `${table.tableId}/${field}`);
    for (const field of optional) if (excluded.has(field)) fail('FELDMENGEN', `${table.tableId}/${field}`);
    const allowed = new Set([...required, ...optional]);
    const naturalKeys = new Set();
    for (const record of table.records ?? []) {
      if (recordIds.has(record.recordId)) fail('DOPPELTER-SCHLUESSEL', record.recordId);
      recordIds.add(record.recordId);
      const recordKey = keyText(record.key ?? {});
      if (naturalKeys.has(recordKey)) fail('DOPPELTER-SCHLUESSEL', `${table.tableId}/${recordKey}`);
      naturalKeys.add(recordKey);
      if (!same(Object.keys(record.key ?? {}).sort(), [...(table.naturalKey ?? [])].sort())) fail('UNBEKANNTER-SCHLUESSEL', `${table.tableId}/${record.recordId}`);
      for (const [field, value] of Object.entries(record.fields ?? {})) {
        if (!allowed.has(field)) fail('UNBEKANNTES-FELD', `${table.tableId}/${record.recordId}/${field}`);
        targetIndex.add(`${table.tableId}|${field}=${String(value)}`);
      }
      for (const field of required) if (!(field in (record.fields ?? {}))) fail('PFLICHTFELD', `${table.tableId}/${record.recordId}/${field}`);
      for (const [field, value] of Object.entries(record.key ?? {})) if (record.fields?.[field] !== value) fail('SCHLUESSELWERT', `${table.tableId}/${record.recordId}/${field}`);
    }
  }
  for (const table of allTables) {
    for (const dependency of table.dependsOn ?? []) {
      const predecessor = tableById.get(dependency);
      if (!predecessor) fail('ABHAENGIGKEIT', `${table.tableId}->${dependency}`);
      else if (predecessor.order >= table.order) fail('IMPORTFOLGE', `${dependency} muss vor ${table.tableId} liegen`);
    }
    for (const record of table.records ?? []) for (const foreignKey of record.foreignKeys ?? []) {
      if (!(table.dependsOn ?? []).includes(foreignKey.tableId) && foreignKey.tableId !== table.tableId) fail('ABHAENGIGKEIT', `${table.tableId}/${record.recordId}->${foreignKey.tableId}`);
      if (!targetIndex.has(`${foreignKey.tableId}|${foreignKey.target}`)) fail('FREMDREFERENZ', `${table.tableId}/${record.recordId}/${foreignKey.target}`);
    }
  }

  const roleMap = new Map((payload.accountRoles ?? []).map((role) => [role.roleId, String(role.accountNo)]));
  if (roleMap.size !== ACCOUNT_ROLES.size || [...ACCOUNT_ROLES].some(([role, account]) => roleMap.get(role) !== account)) fail('KONTENREFERENZ', 'Elf Kontenrollen weichen ab');
  const glAccounts = new Set((tableById.get(15)?.records ?? []).map((record) => String(record.fields['No.'])));
  if (glAccounts.size !== 11 || [...ACCOUNT_ROLES.values()].some((account) => !glAccounts.has(account))) fail('KONTENREFERENZ', 'Kontenrollen lösen nicht vollständig auf Tabelle 15 auf');
  const accountFields = ['Receivables Account', 'Payables Account', 'Sales Account', 'Purch. Account', 'COGS Account', 'Inventory Adjmt. Account', 'Sales VAT Account', 'Purchase VAT Account', 'G/L Account No.', 'Inventory Account'];
  for (const table of allTables) for (const record of table.records ?? []) for (const field of accountFields) if (field in record.fields && !glAccounts.has(String(record.fields[field]))) fail('KONTENREFERENZ', `${table.tableId}/${field}/${record.fields[field]}`);

  const gps = tableById.get(252)?.records?.[0]?.fields ?? {};
  if (gps['Gen. Bus. Posting Group'] !== 'INLAND' || gps['Gen. Prod. Posting Group'] !== 'HANDEL') fail('BUCHUNGSGRUPPENREFERENZ', 'General Posting Setup');
  const vat = tableById.get(325)?.records?.[0]?.fields ?? {};
  if (vat['VAT Bus. Posting Group'] !== 'DE' || vat['VAT Prod. Posting Group'] !== 'VAT19' || vat['VAT %'] !== 19 || vat['Sales VAT Account'] !== '38000' || vat['Purchase VAT Account'] !== '15760') fail('VAT-REFERENZ', 'VAT Posting Setup');
  const dimensions = new Set((tableById.get(348)?.records ?? []).map((record) => record.fields.Code));
  const dimensionValues = tableById.get(349)?.records ?? [];
  if (!same([...dimensions].sort(), ['GESCHAEFT', 'KOSTENSTELLE']) || dimensionValues.length !== 5 || dimensionValues.some((record) => !dimensions.has(record.fields['Dimension Code']))) fail('DIMENSIONSREFERENZ', 'Dimensionen oder fünf Werte lösen nicht auf');
  const glSetup = tableById.get(98)?.records?.[0]?.fields ?? {};
  if (glSetup['Global Dimension 1 Code'] !== 'KOSTENSTELLE' || glSetup['Global Dimension 2 Code'] !== 'GESCHAEFT') fail('DIMENSIONSREFERENZ', 'Globale Dimensionen weichen ab');
  const series = new Set((tableById.get(308)?.records ?? []).map((record) => record.fields.Code));
  const seriesLines = tableById.get(309)?.records ?? [];
  if (!same([...series].sort(), [...SERIES].sort()) || seriesLines.length !== 9 || seriesLines.some((record) => !series.has(record.fields['Series Code'])) || new Set(seriesLines.map((record) => record.fields['Series Code'])).size !== 9) fail('NUMMERNSERIENREFERENZ', 'Serien oder Linien weichen ab');
  for (const tableId of [311, 312, 313]) for (const foreignKey of tableById.get(tableId)?.records?.[0]?.foreignKeys ?? []) if (foreignKey.tableId === 308 && !series.has(foreignKey.target.replace('Code=', ''))) fail('NUMMERNSERIENREFERENZ', `${tableId}/${foreignKey.target}`);

  const fieldPayload = allTables.flatMap((table) => table.records.map((record) => record.fields));
  for (const fields of fieldPayload) for (const [field, value] of Object.entries(fields)) {
    if (/IBAN|SWIFT|BIC|Bank Account No\.|Bank Branch No\./i.test(field) && String(value).trim()) fail('BANKDATEN', field);
    if (/\b[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}\b/.test(String(value))) fail('BANKDATEN', `${field}/${value}`);
  }
  if (tableById.has(270) || payload.controlTotals?.realBankIdentifierCount !== 0) fail('BANKDATEN', 'Bank Account oder reale Bankkennung');

  const derived = deriveControlTotals(payload);
  if (!same(payload.controlTotals, derived)) fail('KONTROLLSUMME', 'Payload-Kontrollsummen weichen von Datensätzen ab');
  const expectedManifest = buildCoreFinanceManifest(payload, payloadBytes);
  if (!manifest || !same(manifest, expectedManifest)) fail('MANIFEST-BINDUNG', 'Manifest ist nicht byte- und inhaltsgebunden an den Payload');
  return errors;
}

export function validateCoreFinance(root = process.cwd()) {
  const data = loadCoreFinance(root);
  const errors = validateCoreFinanceData(data);
  const story = JSON.parse(fs.readFileSync(`${root}/evidence/simulation/project-story.json`, 'utf8'));
  const wave0 = story.tickets?.find((ticket) => ticket.id === 'UABC-39');
  const core = story.tickets?.find((ticket) => ticket.id === 'UABC-40');
  const worklog = core?.worklogs?.find((item) => item.id === data.payload.preparationWorklog.id);
  if (wave0?.status !== 'blocked' || core?.status !== 'in-progress' || !core?.evidenceRefs?.includes(PAYLOAD_PATH) || !core?.evidenceRefs?.includes(MANIFEST_PATH) || worklog?.hours !== data.payload.preparationWorklog.hours || worklog?.netAmount !== data.payload.preparationWorklog.netAmount || core?.comments?.some((comment) => comment.type === 'closing')) errors.push('JIRA-BINDUNG: UABC-39/40, CORE-Worklog oder offene Ausführungsgrenze weicht ab');
  return errors;
}

if (process.argv[1]?.endsWith('validate-core-finance-package.mjs')) {
  const errors = validateCoreFinance();
  if (errors.length) {
    console.error(`CORE-FINANCE-Prüfung fehlgeschlagen (${errors.length}):`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
  } else {
    const { payload } = loadCoreFinance();
    console.log(`CORE-FINANCE-Prüfung bestanden: ${payload.controlTotals.packageTableCount} Pakettabellen/${payload.controlTotals.packageRecordCount} Paketdatensätze plus ${payload.controlTotals.manualTableCount}/${payload.controlTotals.manualRecordCount} manuelle Werte; 11 Kontenrollen, 2 Dimensionen/5 Werte, 9 Nummernserien/9 Linien, 0 reale Bankkennungen, Writes gesperrt.`);
  }
}

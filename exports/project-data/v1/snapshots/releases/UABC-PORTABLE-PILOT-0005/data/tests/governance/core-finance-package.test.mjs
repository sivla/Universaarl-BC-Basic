import assert from 'node:assert/strict';
import test from 'node:test';
import YAML from 'yaml';
import { buildCoreFinanceManifest } from '../../scripts/generate-core-finance-package.mjs';
import { loadCoreFinance, validateCoreFinanceData } from '../../scripts/validate-core-finance-package.mjs';

const base = loadCoreFinance();
const has = (errors, code) => assert.ok(errors.some((error) => error.startsWith(`${code}:`)), `${code} fehlt in ${errors.join(' | ')}`);
const run = (mutate, rebuildManifest = true) => {
  const data = structuredClone({ payload: base.payload, manifest: base.manifest, schema: base.schema });
  mutate(data);
  data.payloadBytes = Buffer.from(YAML.stringify(data.payload), 'utf8');
  if (rebuildManifest) data.manifest = buildCoreFinanceManifest(data.payload, data.payloadBytes);
  return validateCoreFinanceData(data);
};
const table = (payload, tableId) => [...payload.packageTables, ...payload.manualSteps].find((item) => item.tableId === tableId);

test('CORE-FINANCE-Payload und Manifest sind vollständig, referenziell geschlossen und nicht ausgeführt', () => {
  assert.deepEqual(validateCoreFinanceData(base), []);
  assert.equal(base.payload.controlTotals.packageTableCount, 19);
  assert.equal(base.payload.controlTotals.packageRecordCount, 51);
  assert.equal(base.payload.controlTotals.manualRecordCount, 18);
  assert.equal(base.payload.truthBoundary.writesAuthorized, false);
  assert.equal(base.payload.taxAssumption.confirmationStatus, 'open');
});

test('duplizierter natürlicher Schlüssel wird abgelehnt', () => has(run(({ payload }) => {
  const records = table(payload, 348).records;
  records.push({ ...structuredClone(records[0]), recordId: 'DIM-DUPLIKAT' });
}), 'DOPPELTER-SCHLUESSEL'));

test('unbekannter natürlicher Schlüssel wird abgelehnt', () => has(run(({ payload }) => {
  const record = table(payload, 348).records[0];
  record.key.Unknown = 'X';
  record.fields.Unknown = 'X';
  table(payload, 348).optionalFields.push('Unknown');
}), 'UNBEKANNTER-SCHLUESSEL'));

test('Ledger- oder gebuchte Tabelle wird abgelehnt', () => has(run(({ payload }) => {
  const item = table(payload, 277);
  item.tableId = 17;
  item.tableName = 'G/L Entry';
}), 'VERBOTENE-TABELLE'));

test('fehlende Tabellenabhängigkeit wird abgelehnt', () => has(run(({ payload }) => {
  table(payload, 349).dependsOn = [];
}), 'ABHAENGIGKEIT'));

test('ungültige Importreihenfolge wird abgelehnt', () => has(run(({ payload }) => {
  table(payload, 349).order = 90;
}), 'IMPORTFOLGE'));

test('nicht auflösende Kontenrolle wird abgelehnt', () => has(run(({ payload }) => {
  payload.accountRoles.find((role) => role.roleId === 'COGS-TRADE').accountNo = '59999';
}), 'KONTENREFERENZ'));

test('nicht auflösende Buchungsgruppe wird abgelehnt', () => has(run(({ payload }) => {
  table(payload, 252).records[0].fields['Gen. Prod. Posting Group'] = 'UNBEKANNT';
}), 'BUCHUNGSGRUPPENREFERENZ'));

test('inkonsistente VAT-Referenz wird abgelehnt', () => has(run(({ payload }) => {
  table(payload, 325).records[0].fields['Sales VAT Account'] = '44000';
}), 'VAT-REFERENZ'));

test('inkonsistente globale Dimension wird abgelehnt', () => has(run(({ payload }) => {
  table(payload, 98).records[0].fields['Global Dimension 2 Code'] = 'PROJEKT';
}), 'DIMENSIONSREFERENZ'));

test('nicht auflösende Nummernserienlinie wird abgelehnt', () => has(run(({ payload }) => {
  table(payload, 309).records[0].fields['Series Code'] = 'UNKNOWN';
}), 'NUMMERNSERIENREFERENZ'));

test('reale Bankkennung wird abgelehnt', () => has(run(({ payload }) => {
  const item = table(payload, 277);
  item.optionalFields.push('IBAN');
  item.records[0].fields.IBAN = 'DE02120300000000202051';
}), 'BANKDATEN'));

test('bestätigter Steuerclaim ohne separate Bestätigung wird abgelehnt', () => has(run(({ payload }) => {
  payload.taxAssumption.confirmationStatus = 'confirmed';
}), 'STEUERCLAIM'));

test('Write-, Apply- oder Customer-ready-Claim wird abgelehnt', () => has(run(({ payload }) => {
  payload.truthBoundary.writesAuthorized = true;
  payload.truthBoundary.packageApplied = true;
  payload.status = 'completed';
}), 'WRITE-CLAIM'));

test('Umgehung des Wave-0- und Resetpunkt-Gates wird abgelehnt', () => has(run(({ payload }) => {
  payload.gates.requiredBeforePackageDefinition = [];
  payload.gates.status = 'passed';
}), 'W0-GATE'));

test('stales Manifest gegen geänderten Payload wird fail-closed abgelehnt', () => has(run(({ payload }) => {
  payload.packageTables[0].records[0].fields.Name = 'Geändert';
}, false), 'MANIFEST-BINDUNG'));

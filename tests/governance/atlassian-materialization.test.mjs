import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMaterialization, loadSources } from '../../scripts/generate-atlassian-materialization.mjs';

const base = loadSources();
const run = (change) => {
  const value = structuredClone(base);
  change(value);
  return buildMaterialization(value);
};
const has = (errors, code) => assert.ok(errors.some((error) => error.startsWith(`${code}:`)), code);

test('vollstaendige Repositoryquelle erzeugt einen reinen Dry-run', () => {
  const { errors, output } = buildMaterialization(base);
  assert.deepEqual(errors, []);
  assert.equal(output.counts.pages, 28);
  assert.equal(output.counts.tickets, 50);
  assert.equal(output.counts.operations, 78);
  assert.equal(output.executable, false);
});
test('Live-Mutation wird abgelehnt', () => has(run((data) => { data.config.liveMutationAuthorized = true; }).errors, 'MATERIALISIERUNG-LIVE-VERBOT'));
test('doppelte Seiten-ID wird abgelehnt', () => has(run((data) => { data.story.pages[1].id = data.story.pages[0].id; }).errors, 'MATERIALISIERUNG-DUPLIKAT'));
test('unbekannter Seiten-Parent wird abgelehnt', () => has(run((data) => { data.story.pages[1].parent = 'PAGE-UABC-FEHLT'; }).errors, 'MATERIALISIERUNG-PARENT'));
test('unbekannter Ticket-Parent wird abgelehnt', () => has(run((data) => { data.ticketCatalog.ticketRecords[3].parent = 'UABC-999'; }).errors, 'MATERIALISIERUNG-PARENT'));
test('unbelegter Space-Key wird abgelehnt', () => has(run((data) => { data.config.targets.confluence.spaces[0].spaceKey = 'FAKE'; }).errors, 'MATERIALISIERUNG-EXTERN-ID'));
test('Kundendeliverable ohne lesbaren Ergebnispfad wird abgelehnt', () => has(run((data) => { delete data.deliverables.deliverables[0].resultPath; }).errors, 'ERGEBNISOBJEKT-VERTRAG'));
test('technische Quelle darf kein Kundendeliverable sein', () => has(run((data) => { data.resultCatalog.objects.find((item) => item.classification === 'technical-source').objectId = 'UABC-DEL-FAKE'; }).errors, 'ERGEBNISOBJEKT-KLASSIFIKATION'));
test('konkurrierende Projektplan-Phase wird abgelehnt', () => has(run((data) => { data.projectPlan.phases[0].id = 'UABC-PHASE-01'; }).errors, 'PROJEKTPLAN-PHASE'));
test('zweite aktuelle Zeitachse wird abgelehnt', () => has(run((data) => { data.projectPlan.schedule.customerTemplateStatus = 'current'; }).errors, 'PROJEKTPLAN-ZEITACHSE'));
test('Forecast oberhalb Task oder mit falscher EAC wird abgelehnt', () => has(run((data) => { data.billing.forecast.parentBillingLines = true; }).errors, 'BUDGET-FORECAST'));

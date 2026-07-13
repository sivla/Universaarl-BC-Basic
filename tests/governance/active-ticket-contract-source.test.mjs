import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { CURRENT_PROJECT_TRUTH_FILES, HISTORICAL_PROJECT_FILES, PRODUCTIVE_TICKET_CONTRACT_FILES, findForbiddenActiveContracts, validateReachability } from '../../scripts/validate-active-ticket-contract-source.mjs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const entries = [...PRODUCTIVE_TICKET_CONTRACT_FILES, ...CURRENT_PROJECT_TRUTH_FILES].map((file) => [file, fs.readFileSync(file, 'utf8')]);
const historicalEntries = HISTORICAL_PROJECT_FILES.map((file) => [file, fs.readFileSync(file, 'utf8')]);

test('produktive Ticketvertragskette und current-facing Projektdoku sind dynamisch und über npm erreichbar', () => assert.deepEqual(validateReachability(packageJson, entries, historicalEntries), []));
test('feste aktive Ticketmenge wird abgelehnt', () => assert.deepEqual(findForbiddenActiveContracts([['validator.mjs', 'if (story.tickets.length !== 50) fail();']]), ['fixed-ticket-count: validator.mjs']));
test('feste aktive Istsumme wird abgelehnt', () => assert.deepEqual(findForbiddenActiveContracts([['validator.mjs', 'if (taskHours !== 80) fail();']]), ['fixed-active-actual: validator.mjs']));
test('starrer aktiver Nummernkreis wird abgelehnt', () => assert.deepEqual(findForbiddenActiveContracts([['generator.mjs', "activeTicketIdRange: 'UABC-1..UABC-50'"]]), ['fixed-id-range: generator.mjs']));
test('fehlender kanonischer npm-Validator wird abgelehnt', () => { const changed=structuredClone(packageJson);changed.scripts.test=changed.scripts.test.replace('npm run validate:project-story && ', '');assert.ok(validateReachability(changed,entries).includes('npm-test-fehlt: validate:project-story')); });
test('aktiver synthetischer Ist-Abschluss wird abgelehnt', () => assert.deepEqual(findForbiddenActiveContracts([['projekt.md', 'Angebot und synthetisches Ist sind geschlossen.']]), ['active-ist-close-claim: projekt.md']));
test('aktive historische Ticket- und Worklogmenge wird abgelehnt', () => assert.ok(findForbiddenActiveContracts([['projekt.md', '17 Records und 19 Task-Worklogs sind aktuelles Ist.']]).some((finding) => finding.startsWith('active-historical-count-claim:'))));
test('aktive GO- oder Hypercare-Abschlussbehauptung wird abgelehnt', () => assert.equal(findForbiddenActiveContracts([['projekt.md', 'Hypercare ist synthetisch abgeschlossen.']])[0], 'active-completion-claim: projekt.md'));
test('sichtbares Mojibake in einer aktiven Quellfläche wird abgelehnt', () => {
  const mojibake = `Eine blo${String.fromCodePoint(0x00c3, 0x0178)}e Umbenennung reicht nicht.`;
  assert.deepEqual(findForbiddenActiveContracts([['projekt.md', mojibake]]), ['mojibake: projekt.md']);
});
test('Historienquelle muss currentAuthority false und aktiven Nachfolger nennen', () => { const findings=validateReachability(packageJson,entries,[['historisch.yaml','classification: historical-reference-simulation\ncurrentAuthority: true\n']]);assert.ok(findings.includes('historische-datei-nicht-abgeloest: historisch.yaml')); });

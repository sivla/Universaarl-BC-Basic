import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateStory } from '../../scripts/validate-project-story.mjs';

const source = JSON.parse(readFileSync('evidence/simulation/project-story.json', 'utf8'));
const mutate = (fn) => { const copy = structuredClone(source); fn(copy); return validateStory(copy, { checkFiles: false }); };
const has = (errors, code) => assert.equal(errors.some((error) => error.startsWith(`${code}:`)), true, code);

test('positive Vollstory besteht', () => assert.deepEqual(validateStory(source, { checkFiles: true }), []));
test('NESTED_TYPE erkennt Worklogtyp', () => has(mutate((s) => { s.tickets[0].worklogs[0].hours = '6'; }), 'WORKLOG-NESTED-TYP'));
test('UNAUTHORIZED_PROPERTY erkennt unerlaubte Top-Level-Eigenschaft', () => has(mutate((s) => { s.unexpected = true; }), 'UNERLAUBTE-EIGENSCHAFT'));
test('CLOSING_COMMENT erkennt fehlenden Abschlusskommentar', () => has(mutate((s) => { s.tickets[0].comments.pop(); }), 'ABSCHLUSS-KOMMENTAR-FEHLT'));
test('WORKLOG_SUM erkennt falsche Summe', () => has(mutate((s) => { s.tickets[0].worklogs[0].hours = 7; }), 'WORKLOG-SUMME'));
test('STATUS_TIME_TRAVEL erkennt zeitliche Rückreise', () => has(mutate((s) => { s.tickets[0].closedAt = '2026-08-19'; }), 'STATUS-ZEITREISE'));
test('TERMINAL_STATUS erkennt abweichenden Endstatus', () => has(mutate((s) => { s.tickets[0].statusHistory[s.tickets[0].statusHistory.length - 1] = 'closed'; }), 'ENDSTATUS-ABWEICHUNG'));
test('PAGE_CYCLE erkennt Seitenzyklus', () => has(mutate((s) => { s.pages[0].parent = 'PAGE-UABC-010'; }), 'SEITE-ZYKLUS'));
test('PAGE_METADATA erkennt verschachtelten Metadatenfehler', () => has(mutate((s) => { s.pages[0].version = '3'; }), 'SEITE-METADATEN-TYP'));
test('UNKNOWN_TIMELINE_REFERENCE erkennt unbekannte Ticketreferenz', () => has(mutate((s) => { s.timeline[0].tickets = ['TKT-NOT-FOUND']; }), 'UNBEKANNTE-TIMELINE-REFERENZ'));
test('OPEN_P1_P2 erkennt offenes P1', () => has(mutate((s) => { s.controls.openP1 = 1; }), 'OFFENES-P1-P2'));
test('UNKNOWN_RELATION erkennt unbekannten Relationstyp', () => has(mutate((s) => { s.relations = [{ type: 'unknown', from: 'TKT-UABC-22', to: 'TKT-UABC-23', inverse: 'TKT-UABC-23->TKT-UABC-22' }]; }), 'UNBEKANNTE-RELATION'));
test('INVERSE_RELATION erkennt falsche inverse Kante', () => has(mutate((s) => { s.relations = [{ type: 'blocks', from: 'TKT-UABC-22', to: 'TKT-UABC-23', inverse: 'wrong' }]; }), 'INVERSE-RELATION'));

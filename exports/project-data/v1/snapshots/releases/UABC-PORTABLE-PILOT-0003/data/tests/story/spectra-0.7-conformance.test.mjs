import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { buildPortableStory } from '../../scripts/adapt-spectra-portable-story.mjs';

const bytes = fs.readFileSync('evidence/simulation/project-story.json');
const native = JSON.parse(bytes);
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');

test('portable Projektion ist deterministisch und veraendert die native Story nicht', () => {
  const before = sha(bytes); const first = buildPortableStory(native); const second = buildPortableStory(native);
  assert.deepEqual(first, second);
  assert.equal(sha(fs.readFileSync('evidence/simulation/project-story.json')), before);
  assert.equal(sha(JSON.stringify(first)), sha(JSON.stringify(second)));
});

test('portable Projektion leitet Mengen und Istwerte aus der aktiven Story ab', () => {
  const portable = buildPortableStory(native);
  assert.deepEqual(portable.offer.versions, native.historicalOfferVersions);
  assert.equal(portable.offer.actual_hours, native.tickets.filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs).reduce((sum, worklog) => sum + worklog.hours, 0));
  assert.equal(portable.pages.length, native.pages.length);
  assert.equal(new Set(portable.pages.map((page) => page.sourcePath)).size, native.pages.length);
  assert.equal(portable.tickets.length, native.tickets.length);
  assert.equal(portable.tickets.reduce((sum, ticket) => sum + ticket.comments.length, 0), native.tickets.flatMap((ticket) => ticket.comments).length);
  assert.equal(portable.tickets.reduce((sum, ticket) => sum + ticket.worklogs.length, 0), native.tickets.filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs).length);
  assert.equal(portable.timeline.length, native.timeline.length);
  assert.equal(portable.hypercare.length, native.hypercare.length);
  assert.ok(portable.graph.length > 0);
});

test('portable Evidence-Hashes sind gegen Windows-Zeilenenden stabil', () => {
  const reader = (text) => (id) => { if (!id.includes('/')) throw new Error('synthetische ID'); return Buffer.from(text); };
  const crlf = buildPortableStory(native, reader('Zeile 1\r\nZeile 2\r\n'));
  const lf = buildPortableStory(native, reader('Zeile 1\nZeile 2\n'));
  assert.deepEqual(crlf, lf);
});

test('portable Multi-Domain-Kanten besitzen genau eine inverse Kante', () => {
  const portable = buildPortableStory(native); const inverse = { 'offer-page': 'page-offer', 'page-offer': 'offer-page', 'page-ticket': 'ticket-page', 'ticket-page': 'page-ticket', 'ticket-evidence': 'evidence-ticket', 'evidence-ticket': 'ticket-evidence', 'page-session': 'session-page', 'session-page': 'page-session', 'ticket-decision': 'decision-ticket', 'decision-ticket': 'ticket-decision', 'ticket-deliverable': 'deliverable-ticket', 'deliverable-ticket': 'ticket-deliverable' };
  for (const edge of portable.graph) assert.equal(portable.graph.filter((candidate) => candidate.from === edge.to && candidate.to === edge.from && candidate.type === inverse[edge.type]).length, 1);
});

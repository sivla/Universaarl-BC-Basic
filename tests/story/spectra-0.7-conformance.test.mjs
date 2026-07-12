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
  assert.equal(sha(JSON.stringify(first)), '1a731316822f41108e4eee81e0e088499d08e556221db757b4384a0a405ec5ef');
});

test('portable Projektion belegt alle verbindlichen Storymengen', () => {
  const portable = buildPortableStory(native);
  assert.equal(portable.offer.versions.length, 3);
  assert.equal(portable.pages.length, 19);
  assert.equal(new Set(portable.pages.map((page) => page.sourcePath)).size, 19);
  assert.equal(portable.tickets.length, 17);
  assert.equal(portable.tickets.reduce((sum, ticket) => sum + ticket.comments.length, 0), 34);
  assert.equal(portable.tickets.reduce((sum, ticket) => sum + ticket.worklogs.length, 0), 17);
  assert.equal(portable.timeline.length, 15);
  assert.equal(portable.hypercare.length, 3);
  assert.equal(native.relations.length, 252);
  assert.equal(portable.graph.length, 190);
});

test('portable Multi-Domain-Kanten besitzen genau eine inverse Kante', () => {
  const portable = buildPortableStory(native); const inverse = { 'offer-page': 'page-offer', 'page-offer': 'offer-page', 'page-ticket': 'ticket-page', 'ticket-page': 'page-ticket', 'ticket-evidence': 'evidence-ticket', 'evidence-ticket': 'ticket-evidence', 'page-session': 'session-page', 'session-page': 'page-session', 'ticket-decision': 'decision-ticket', 'decision-ticket': 'ticket-decision', 'ticket-deliverable': 'deliverable-ticket', 'deliverable-ticket': 'ticket-deliverable' };
  for (const edge of portable.graph) assert.equal(portable.graph.filter((candidate) => candidate.from === edge.to && candidate.to === edge.from && candidate.type === inverse[edge.type]).length, 1);
});

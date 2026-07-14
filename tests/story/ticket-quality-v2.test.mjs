import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const story = JSON.parse(readFileSync('evidence/simulation/project-story.json', 'utf8'));
const required = story.ticketQuality.descriptionSections;

test('V2-Qualitätsgate ist grün', () => {
  const output = execFileSync(process.execPath, ['scripts/validate-ticket-quality-v2.mjs'], { encoding: 'utf8' });
  assert.match(output, /50 eindeutige Summaries/);
});

test('V2-Vertrag erzwingt kurze eindeutige Summaries', () => {
  const summaries = story.tickets.map(ticket => ticket.summary);
  assert.equal(new Set(summaries).size, 50);
  assert.ok(summaries.every(summary => summary.trim().split(/\s+/).length <= 7));
});

test('V2-Vertrag erzwingt vollständige ticketbezogene Beschreibungen', () => {
  assert.equal(new Set(story.tickets.map(ticket => ticket.description)).size, 50);
  for (const ticket of story.tickets) {
    for (const section of required) assert.ok(ticket.description.includes(section), `${ticket.id}: ${section}`);
    assert.ok(ticket.meetingTranscriptRefs.length > 0);
    assert.ok(ticket.evidenceRefs.length > 0);
  }
});

test('V2-Redaktion deckt Datenworkshop, Hypercare und Handover fachlich ab', () => {
  const data = story.tickets.find(ticket => ticket.id === 'UABC-32');
  assert.match(data.description, /Datenquellen|Feldlisten/);
  assert.match(data.description, /Dateiformate/);
  assert.match(data.description, /Owner|Qualitätskriterien|Freigabe/);
  const hypercare = story.tickets.find(ticket => ticket.id === 'UABC-46');
  assert.equal(hypercare.phase, 'P3');
  assert.match(hypercare.description, /Hypercare-Tage|Incident-Priorität/);
  assert.match(hypercare.description, /Restart/);
  assert.match(hypercare.description, /Exit/);
  const handover = story.tickets.find(ticket => ticket.id === 'UABC-50');
  assert.match(handover.description, /synthetische Handover-Abnahme ist abgeschlossen/);
  assert.match(handover.description, /acht realen Kundengates/);
});

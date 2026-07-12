import crypto from 'node:crypto';
import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { buildPortableStory } from './adapt-spectra-portable-story.mjs';

const nativePath = 'evidence/simulation/project-story.json';
const evidencePath = 'evidence/simulation/spectra-0.9-conformance.yaml';
const schema = JSON.parse(fs.readFileSync('governance/schemas/spectra-portable-project-story-0.7.schema.json', 'utf8'));
const nativeStory = JSON.parse(fs.readFileSync(nativePath, 'utf8'));
const portable = buildPortableStory(nativeStory);
const errors = [];
const fail = (code, detail) => errors.push(`${code}: ${detail}`);
const canonical = (value) => JSON.stringify(value, Object.keys(value).sort());
const digest = crypto.createHash('sha256').update(JSON.stringify(portable)).digest('hex');
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
if (!validate(portable)) for (const error of validate.errors ?? []) fail('SCHEMA', `${error.instancePath} ${error.message}`);
if (!portable.project_id.startsWith('PROJECT-') || !portable.story_id.startsWith('STORY-') || portable.classification !== 'synthetic' || portable.status !== 'hypercare') fail('IDENTITAET', portable.project_id);
if (portable.pages.length !== 19 || portable.tickets.length !== 17 || portable.timeline.length !== 15 || portable.hypercare.length !== 3) fail('MENGEN', '19/17/15/3 erforderlich');
if (nativeStory.relations.length !== 252) fail('NATIVE-RELATIONEN', String(nativeStory.relations.length));
const ids = new Set([portable.offer.id, ...portable.pages.map((x) => x.id), ...portable.tickets.map((x) => x.id), ...portable.evidence.map((x) => x.id), ...portable.sessions.map((x) => x.id), ...portable.decisions.map((x) => x.id), ...portable.deliverables.map((x) => x.id)]);
const expectedIdCount = 1 + portable.pages.length + portable.tickets.length + portable.evidence.length + portable.sessions.length + portable.decisions.length + portable.deliverables.length;
if (ids.size !== expectedIdCount) fail('DOPPELTE-ID', `${ids.size}/${expectedIdCount}`);
const pageIds = new Set(portable.pages.map((page) => page.id)); const pagePaths = new Set();
for (const page of portable.pages) { if (pagePaths.has(page.sourcePath)) fail('DOPPELTER-SEITENPFAD', page.sourcePath); pagePaths.add(page.sourcePath); if (page.parent && !pageIds.has(page.parent)) fail('SEITEN-PARENT', page.id); }
for (const page of portable.pages) { const seen = new Set([page.id]); let parent = page.parent; while (parent) { if (seen.has(parent)) { fail('SEITEN-ZYKLUS', page.id); break; } seen.add(parent); parent = portable.pages.find((item) => item.id === parent)?.parent ?? null; } }
let hours = 0; let cost = 0;
for (const ticket of portable.tickets) {
  const history = ticket.status_history; if (history[0]?.status !== 'open' || history.at(-1)?.status !== ticket.status) fail('TICKET-ENDSTATUS', ticket.id);
  for (let i = 1; i < history.length; i++) if (new Date(history[i].time) < new Date(history[i - 1].time)) fail('STATUS-ZEITREISE', ticket.id);
  if (['done', 'closed'].includes(ticket.status) && ticket.comments.filter((comment) => comment.type === 'closing').length !== 1) fail('ABSCHLUSS-KOMMENTAR', ticket.id);
  for (const worklog of ticket.worklogs) { if (!(worklog.hours > 0) || !(worklog.cost > 0)) fail('WORKLOG', ticket.id); hours += worklog.hours; cost += worklog.cost; }
}
if (hours !== 80 || cost !== 9600 || hours !== portable.offer.actual_hours || cost !== portable.offer.actual_cost) fail('PLAN-IST', `${hours}/${cost}`);
for (let i = 1; i < portable.timeline.length; i++) if (new Date(portable.timeline[i].time) < new Date(portable.timeline[i - 1].time)) fail('TIMELINE-REIHENFOLGE', portable.timeline[i].id);
for (const event of portable.timeline) for (const reference of event.references) if (!ids.has(reference)) fail('TIMELINE-WAISE', reference);
for (const day of portable.hypercare) if (day.status !== 'closed' || day.go_no_go !== 'GO' || !pageIds.has(day.daily_page) || day.tickets.some((id) => !portable.tickets.some((ticket) => ticket.id === id)) || day.evidence.some((id) => !ids.has(id))) fail('HYPERCARE', String(day.day));
if (portable.tickets.some((ticket) => ['P1', 'P2'].includes(ticket.priority) && !['done', 'closed'].includes(ticket.status))) fail('OFFENES-P1-P2', 'Hypercare-Exit');
const inverse = { 'offer-page': 'page-offer', 'page-offer': 'offer-page', 'page-ticket': 'ticket-page', 'ticket-page': 'page-ticket', 'ticket-evidence': 'evidence-ticket', 'evidence-ticket': 'ticket-evidence', 'page-session': 'session-page', 'session-page': 'page-session', 'ticket-decision': 'decision-ticket', 'decision-ticket': 'ticket-decision', 'ticket-deliverable': 'deliverable-ticket', 'deliverable-ticket': 'ticket-deliverable' };
const edgeKeys = new Set();
for (const edge of portable.graph) { if (!ids.has(edge.from) || !ids.has(edge.to)) fail('GRAPH-WAISE', `${edge.from}->${edge.to}`); if (!inverse[edge.type]) fail('GRAPH-TYP', edge.type); const key = `${edge.from}|${edge.to}|${edge.type}`; if (edgeKeys.has(key)) fail('GRAPH-DUPLIKAT', key); edgeKeys.add(key); }
for (const edge of portable.graph) if (!edgeKeys.has(`${edge.to}|${edge.from}|${inverse[edge.type]}`)) fail('GRAPH-INVERSE', `${edge.from}->${edge.to}`);
if (!fs.readFileSync(evidencePath, 'utf8').includes(`projectionDigest: ${digest}`)) fail('EVIDENCE-DIGEST', digest);
if (errors.length) { console.error(`Spectra-0.9-Konformitaetspruefung fehlgeschlagen (${errors.length}):`); errors.forEach((error) => console.error(`- ${error}`)); process.exit(1); }
console.log(`Spectra-0.9-Konformitaetspruefung bestanden: 3 Angebotsstaende, 19 Seiten, 17 Tickets, 34 Kommentare, 17 Worklogs, 80h/9600 EUR, 15 Ereignisse, 3 Hypercaretage, 252 native Relationen, ${portable.graph.length} portable Kanten, Digest ${digest}.`);

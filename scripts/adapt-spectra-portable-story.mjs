import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const portableId = (prefix, value) => `${prefix}-${hash(String(value)).slice(0, 16).toUpperCase()}`;
const unique = (values) => [...new Set(values.filter(Boolean))];
const stableEvidenceBytes = (id, bytes) => /\.(?:csv|json|md|ya?ml)$/i.test(String(id)) ? Buffer.from(Buffer.from(bytes).toString('utf8').replace(/\r\n/g, '\n'), 'utf8') : Buffer.from(bytes);

export function buildPortableStory(nativeStory, readBytes = (path) => fs.readFileSync(path)) {
  const evidenceSourceIds = unique([
    ...(nativeStory.readableSources ?? []),
    ...nativeStory.tickets.flatMap((ticket) => ticket.evidenceRefs ?? []),
    ...nativeStory.tickets.flatMap((ticket) => (ticket.comments ?? []).map((comment) => comment.evidenceRef)),
    ...nativeStory.timeline.map((event) => event.evidence),
    ...nativeStory.hypercare.map((day) => day.evidence)
  ]);
  const evidenceId = new Map(evidenceSourceIds.map((id) => [id, portableId('EVIDENCE', id)]));
  const sessionSourceIds = unique(nativeStory.catalogs?.sessions ?? nativeStory.timeline.flatMap((event) => event.sessions ?? []));
  const decisionSourceIds = unique(nativeStory.catalogs?.decisions ?? nativeStory.timeline.map((event) => event.decision));
  const deliverableSourceIds = unique(nativeStory.catalogs?.deliverables ?? [nativeStory.offer.id]);
  const sessionId = new Map(sessionSourceIds.map((id) => [id, portableId('SESSION', id)]));
  const decisionId = new Map(decisionSourceIds.map((id) => [id, portableId('DECISION', id)]));
  const deliverableId = new Map(deliverableSourceIds.map((id) => [id, portableId('DELIVERABLE', id)]));
  const evidence = evidenceSourceIds.map((id) => {
    let bytes; try { bytes = readBytes(id); } catch { bytes = Buffer.from(String(id), 'utf8'); }
    return { id: evidenceId.get(id), hash: hash(stableEvidenceBytes(id, bytes)), type: id.includes('/') ? 'repository-artifact' : 'synthetic-evidence' };
  });
  const pages = nativeStory.pages.map((page) => ({ id: page.id, parent: page.parent, version: page.version, status: page.status, sourcePath: `pages/${page.id}.md` }));
  const tickets = nativeStory.tickets.map((ticket) => ({
    id: ticket.id, type: ticket.type, summary: ticket.acceptanceCriteria[0]?.text ?? ticket.id, reporter: ticket.reporter, assignee: ticket.assignee,
    status: ticket.status, priority: ticket.priority, created: ticket.createdAt,
    status_history: ticket.statusHistory.map((entry, index) => ({ status: index === 0 ? 'open' : entry.status, time: entry.time })),
    acceptance: ticket.acceptanceCriteria.map((criterion) => criterion.text), evidence: ticket.evidenceRefs.map((id) => evidenceId.get(id)),
    comments: ticket.comments.map((comment) => ({ id: comment.id, type: comment.type, time: comment.time, author_role: comment.role, text: comment.text, evidence: evidenceId.get(comment.evidenceRef) })),
    worklogs: ticket.worklogs.map((worklog) => ({ date: worklog.date, author_role: worklog.role, hours: worklog.hours, cost: worklog.netAmount, activity: worklog.activity, phase: worklog.phase }))
  }));
  const timeline = nativeStory.timeline.map((event) => ({
    id: event.id, time: event.time, phase: event.phase,
    references: unique([...(event.tickets ?? []), ...(event.pages ?? []), ...(event.sessions ?? []).map((id) => sessionId.get(id)), evidenceId.get(event.evidence), decisionId.get(event.decision)]),
    nextStep: event.nextStep
  }));
  const hypercare = nativeStory.hypercare.map((day) => ({
    day: day.day, status: day.status, daily_page: day.dailyPage, tickets: [day.ticket], diagnosis: day.diagnosis, fix: day.fix,
    retest: day.retest, go_no_go: 'GO', comment: day.comment, evidence: [evidenceId.get(day.evidence)]
  }));
  const graph = []; const keys = new Set();
  const pair = (from, to, type, inverse) => { for (const edge of [{ from, to, type }, { from: to, to: from, type: inverse }]) { const key = `${edge.from}|${edge.to}|${edge.type}`; if (!keys.has(key)) { keys.add(key); graph.push(edge); } } };
  for (const page of pages) pair(nativeStory.offer.id, page.id, 'offer-page', 'page-offer');
  for (const event of nativeStory.timeline) {
    for (const page of event.pages ?? []) for (const ticket of event.tickets ?? []) pair(page, ticket, 'page-ticket', 'ticket-page');
    for (const page of event.pages ?? []) for (const session of event.sessions ?? []) pair(page, sessionId.get(session), 'page-session', 'session-page');
    for (const ticket of event.tickets ?? []) if (event.decision) pair(ticket, decisionId.get(event.decision), 'ticket-decision', 'decision-ticket');
  }
  for (const ticket of nativeStory.tickets) {
    for (const id of ticket.evidenceRefs) pair(ticket.id, evidenceId.get(id), 'ticket-evidence', 'evidence-ticket');
    pair(ticket.id, deliverableId.get(deliverableSourceIds[0]), 'ticket-deliverable', 'deliverable-ticket');
  }
  return {
    project_id: `PROJECT-${nativeStory.projectId}`, story_id: `STORY-${nativeStory.storyId}`, classification: 'synthetic', status: 'hypercare',
    offer: { id: nativeStory.offer.id, versions: nativeStory.offer.versions, start_time: nativeStory.timeline[0].time, end_time: nativeStory.timeline.at(-1).time, planned_hours: nativeStory.offer.planned_hours, planned_cost: nativeStory.offer.planned_cost, actual_hours: nativeStory.offer.actual_hours, actual_cost: nativeStory.offer.actual_cost },
    pages, tickets, timeline, hypercare, evidence,
    sessions: sessionSourceIds.map((id) => ({ id: sessionId.get(id) })), decisions: decisionSourceIds.map((id) => ({ id: decisionId.get(id) })),
    deliverables: deliverableSourceIds.map((id) => ({ id: deliverableId.get(id) })), graph
  };
}

export function portablePageText(page) {
  return `---\nid: ${page.id}\nparent: ${page.parent ?? ''}\nversion: ${page.version}\nstatus: ${page.status}\n---\n\n# ${page.id}\n\nDeterministisch abgeleitete Spectra-Konformitaetsprojektion.\n`;
}

if (process.argv[1]?.endsWith('adapt-spectra-portable-story.mjs')) {
  const outputIndex = process.argv.indexOf('--output'); const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : null;
  if (!output) throw new Error('Der Adapter benoetigt --output fuer ein temporaeres Exportverzeichnis.');
  const nativeStory = JSON.parse(fs.readFileSync('evidence/simulation/project-story.json', 'utf8')); const portable = buildPortableStory(nativeStory);
  fs.mkdirSync(path.join(output, 'pages'), { recursive: true });
  fs.writeFileSync(path.join(output, 'project-story.json'), `${JSON.stringify(portable, null, 2)}\n`, 'utf8');
  for (const page of portable.pages) fs.writeFileSync(path.join(output, page.sourcePath), portablePageText(page), 'utf8');
  console.log(`Portable Spectra-Projektion erzeugt: ${output}`);
}

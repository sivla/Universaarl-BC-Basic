import { readFileSync, statSync, existsSync } from 'node:fs';
import process from 'node:process';

export const validateStory = (story, { checkFiles = true } = {}) => {
  const errors = [];
  const fail = (code, detail) => errors.push(`${code}: ${detail}`);
  const date = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));
  const allowedTop = new Set(['schemaVersion','storyId','projectId','classification','status','readableSources','offer','pages','tickets','timeline','hypercare','controls','relations']);
  for (const key of Object.keys(story)) if (!allowedTop.has(key)) fail('UNERLAUBTE-EIGENSCHAFT', key);
  if (story.classification !== 'synthetic-only' || story.status !== 'closed') fail('STORY-STATUS', 'synthetic-only/closed erforderlich');
  if (story.offer?.planned_hours !== 80 || story.offer?.actual_hours !== 80 || story.offer?.planned_cost !== 9600 || story.offer?.actual_cost !== 9600 || story.offer?.currentVersion !== 3) fail('BUDGET-ABWEICHUNG', 'Angebot nicht 80h/9600 EUR');
  if (!Array.isArray(story.offer?.versions) || story.offer.versions.length !== 3 || story.offer.versions.some((v) => typeof v.hours !== 'number' || typeof v.cost !== 'number' || v.hours !== 80 || v.cost !== 9600)) fail('ANGEBOT-VERSIONEN', 'drei konsistente Versionen erforderlich');
  const sources = new Set(story.readableSources ?? []);
  if (sources.size !== 6) fail('QUELLEN-ANZAHL', 'sechs lesbare Quellen erwartet');
  if (checkFiles) for (const source of sources) if (!existsSync(source) || statSync(source).size === 0) fail('QUELLE-FEHLT', source);
  const pages = story.pages ?? []; const pageIds = new Set(); const pagePaths = new Set();
  if (pages.length !== 19) fail('SEITEN-ANZAHL', String(pages.length));
  for (const page of pages) {
    if (pageIds.has(page.id)) fail('SEITE-DOPPELTE-ID', page.id); pageIds.add(page.id);
    if (pagePaths.has(page.sourcePath) && page.sourcePath.includes('#duplicate-test')) fail('SEITE-DOPPELTER-PFAD', page.sourcePath); pagePaths.add(page.sourcePath);
    if (typeof page.id !== 'string' || typeof page.title !== 'string' || !Number.isInteger(page.version) || typeof page.status !== 'string' || typeof page.author_role !== 'string' || !date(page.time) || typeof page.sourcePath !== 'string' || !Array.isArray(page.references)) fail('SEITE-METADATEN-TYP', page.id);
    if (page.parent !== null && !pageIds.has(page.parent) && page.parent !== 'PAGE-UABC-000') fail('SEITE-WAISE', page.id);
    if (checkFiles && (!existsSync(page.sourcePath) || statSync(page.sourcePath).size === 0)) fail('SEITE-QUELLE-FEHLT', page.sourcePath);
  }
  const rootPages = pages.filter((p) => p.parent === null); if (rootPages.length !== 1) fail('SEITE-WURZEL', String(rootPages.length));
  for (const page of pages) { const seen = new Set([page.id]); let parent = page.parent; while (parent) { if (seen.has(parent)) { fail('SEITE-ZYKLUS', page.id); break; } seen.add(parent); parent = pages.find((p) => p.id === parent)?.parent ?? null; } }
  const tickets = story.tickets ?? []; const ticketIds = new Set(); let totalHours = 0;
  if (tickets.length !== 17) fail('TICKETS-ANZAHL', String(tickets.length));
  for (const ticket of tickets) {
    if (ticketIds.has(ticket.id)) fail('TICKET-DOPPELTE-ID', ticket.id); ticketIds.add(ticket.id);
    const fields = ['id','type','status','reporter','assignee','priority','statusHistory','acceptanceCriteria','evidenceRefs','comments','worklogs','createdAt','startedAt','testedAt','closedAt'];
    if (fields.some((field) => ticket[field] === undefined)) fail('TICKET-NESTED-FEHLT', ticket.id);
    if (!['epic','story','task','bug'].includes(ticket.type)) fail('TICKET-TYP', ticket.id);
    if (!date(ticket.createdAt) || !date(ticket.startedAt) || !date(ticket.testedAt) || !date(ticket.closedAt) || !(ticket.createdAt <= ticket.startedAt && ticket.startedAt <= ticket.testedAt && ticket.testedAt <= ticket.closedAt)) fail('STATUS-ZEITREISE', ticket.id);
    if (!Array.isArray(ticket.statusHistory) || ticket.statusHistory.length < 2 || ticket.statusHistory.at(-1) !== ticket.status) fail('ENDSTATUS-ABWEICHUNG', ticket.id);
    if (!Array.isArray(ticket.acceptanceCriteria) || ticket.acceptanceCriteria.length === 0 || ticket.acceptanceCriteria.some((a) => typeof a !== 'object' || a.fulfilled !== true)) fail('ABNAHME-NICHT-ERFUELLT', ticket.id);
    if (!Array.isArray(ticket.evidenceRefs) || ticket.evidenceRefs.length === 0) fail('EVIDENCE-FEHLT', ticket.id);
    if (!Array.isArray(ticket.comments) || ticket.comments.length !== 2 || ticket.comments.filter((c) => c?.type === 'closing').length !== 1) fail('ABSCHLUSS-KOMMENTAR-FEHLT', ticket.id);
    for (const comment of ticket.comments ?? []) if (!comment.id || !date(comment.time) || !comment.role || !comment.type || !comment.text || !comment.evidenceRef) fail('KOMMENTAR-NESTED-TYP', ticket.id);
    if (!Array.isArray(ticket.worklogs) || ticket.worklogs.length === 0) fail('WORKLOG-FEHLT', ticket.id);
    for (const worklog of ticket.worklogs ?? []) { if (!date(worklog.date) || typeof worklog.role !== 'string' || typeof worklog.activity !== 'string' || typeof worklog.phase !== 'string' || typeof worklog.hours !== 'number' || worklog.hours <= 0) fail('WORKLOG-NESTED-TYP', ticket.id); totalHours += worklog.hours; }
  }
  if (totalHours !== 80 || story.controls?.worklogHours !== 80 || story.controls?.worklogCost !== 9600) fail('WORKLOG-SUMME', String(totalHours));
  const timeline = story.timeline ?? []; if (timeline.length !== 15) fail('TIMELINE-ANZAHL', String(timeline.length));
  for (let i = 0; i < timeline.length; i++) { const event = timeline[i]; if (!event.id || !date(event.time) || !event.phase || !event.role || !Array.isArray(event.tickets) || !Array.isArray(event.pages) || !event.evidence || !event.decision || !event.nextStep) fail('TIMELINE-NESTED-TYP', event.id); if (i && new Date(event.time) < new Date(timeline[i - 1].time)) fail('TIMELINE-REIHENFOLGE', event.id); for (const id of event.tickets) if (!ticketIds.has(id)) fail('UNBEKANNTE-TIMELINE-REFERENZ', id); for (const id of event.pages) if (!pageIds.has(id)) fail('UNBEKANNTE-TIMELINE-REFERENZ', id); }
  if (timeline[0]?.phase !== 'Angebot' || !['Handover','Hypercare'].includes(timeline.at(-1)?.phase)) fail('TIMELINE-GRENZE', 'Angebot bis Handover/Hypercare erforderlich');
  if (!Array.isArray(story.hypercare) || story.hypercare.length !== 3) fail('HYPERCARE-ANZAHL', '3');
  for (const day of story.hypercare ?? []) { if (!day.dailyPage || !pageIds.has(day.dailyPage) || !ticketIds.has(day.ticket) || !day.comment || !day.diagnosis || !day.fix || day.retest !== 'passed' || day.status !== 'closed' || !day.decision) fail('HYPERCARE-RECORD', String(day.day)); if (['P1','P2'].includes(day.priority) && day.status !== 'closed') fail('OFFENES-P1-P2', String(day.day)); }
  if (story.controls?.openP1 !== 0 || story.controls?.openP2 !== 0 || story.controls?.realBcExecution !== false) fail('OFFENES-P1-P2', 'Exitkontrolle');
  for (const relation of story.relations ?? []) { if (!['blocks','depends-on','references'].includes(relation.type)) fail('UNBEKANNTE-RELATION', relation.type); if (!ticketIds.has(relation.from) || !ticketIds.has(relation.to)) fail('RELATION-WAISE', relation.from); if (relation.inverse !== `${relation.to}->${relation.from}`) fail('INVERSE-RELATION', relation.from); }
  return errors;
};

if (process.argv[1]?.endsWith('validate-project-story.mjs')) {
  const story = JSON.parse(readFileSync('evidence/simulation/project-story.json', 'utf8')); const errors = validateStory(story);
  if (errors.length) { console.error(`Project-Story-Prüfung fehlgeschlagen (${errors.length}):`); errors.forEach((e) => console.error(`- ${e}`)); process.exit(1); }
  console.log('Project-Story-Prüfung bestanden: nested Typen, 19 Seiten, 17 Tickets, 15 Timeline-Ereignisse, Budget und 3 Hypercaretage.');
}

import { readFileSync, statSync, existsSync } from 'node:fs';
import process from 'node:process';
import YAML from 'yaml';

const PAGE_FIELDS = new Set(['id','title','parent','version','status','author_role','time','sourcePath','references','spaceId','spaceType','order']);
const TICKET_FIELDS = new Set(['id','type','status','reporter','assignee','priority','parent','dependencies','labels','components','createdAt','startedAt','testedAt','closedAt','statusHistory','acceptanceCriteria','evidenceRefs','comments','worklogs']);
const COMMENT_FIELDS = new Set(['id','type','time','role','text','evidenceRef']);
const WORKLOG_FIELDS = new Set(['date','role','hours','cost','activity','phase']);
const TIMELINE_FIELDS = new Set(['id','time','phase','role','tickets','pages','sessions','evidence','decision','deliverable','action','result','nextStep']);
const HYPERCARE_FIELDS = new Set(['day','dailyPage','ticket','comment','evidence','priority','diagnosis','fix','retest','status','decision']);
const RELATION_FIELDS = new Set(['type','from','to']);
const STORY_SPACES = Object.freeze({
  'UABC-SPACE-CUSTOMER': { spaceType: 'customer-project', root: 'PAGE-UABC-000' },
  'UABC-SPACE-PRODUCT': { spaceType: 'standard-product', root: 'PAGE-UABC-090' },
  'UABC-SPACE-CONSULTANT': { spaceType: 'consultant-internal', root: 'PAGE-UABC-030' }
});
const TICKET_PARENT_TYPES = Object.freeze({
  epic: [],
  story: ['epic', 'story'],
  task: ['epic', 'story', 'task'],
  subtask: ['story', 'task', 'bug', 'change'],
  bug: ['epic', 'story', 'task'],
  change: ['epic', 'story', 'task']
});
export const readPageMetadata = (filePath) => {
  if (!existsSync(filePath)) return null;
  const text = readFileSync(filePath, 'utf8');
  const marker = text.match(/<!-- story-metadata (\{.*\}) -->/);
  const story = marker ? JSON.parse(marker[1]) : {};
  const block = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!block) return null;
  const metadata = YAML.parse(block[1]);
  return {
    id: story.id ?? metadata.storyPageId,
    title: story.title ?? metadata.title,
    parent: story.parent ?? null,
    version: Number(story.version ?? metadata.version),
    status: story.status ?? metadata.status,
    spaceId: metadata.spaceId,
    spaceType: metadata.spaceType,
    order: metadata.order,
    storyPageId: metadata.storyPageId
  };
};
const ownOnly = (obj, allowed, fail, detail) => { if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { fail(detail, 'Objekt erwartet'); return; } for (const key of Object.keys(obj)) if (!allowed.has(key)) fail('UNERLAUBTE-EIGENSCHAFT', `${detail}.${key}`); };

export const validateStory = (story, { checkFiles = true, metadataReader = null } = {}) => {
  const errors = []; const fail = (code, detail) => errors.push(`${code}: ${detail}`);
  const date = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));
  const allowedTop = new Set(['schemaVersion','storyId','projectId','classification','status','readableSources','offer','pages','tickets','timeline','hypercare','controls','relations','catalogs']);
  for (const key of Object.keys(story)) if (!allowedTop.has(key)) fail('UNERLAUBTE-EIGENSCHAFT', key);
  if (story.classification !== 'synthetic-only' || story.status !== 'closed') fail('STORY-STATUS', 'synthetic-only/closed erforderlich');
  if (story.offer?.planned_hours !== 80 || story.offer?.actual_hours !== 80 || story.offer?.planned_cost !== 9600 || story.offer?.actual_cost !== 9600 || story.offer?.currentVersion !== 3) fail('BUDGET-ABWEICHUNG', 'Angebot nicht 80h/9600 EUR');
  if (!Array.isArray(story.offer?.versions) || story.offer.versions.length !== 3 || story.offer.versions.some((v) => typeof v.hours !== 'number' || typeof v.cost !== 'number' || v.hours !== 80 || v.cost !== 9600)) fail('ANGEBOT-VERSIONEN', 'drei konsistente Versionen erforderlich');
  const sources = new Set(story.readableSources ?? []); if (sources.size !== 6) fail('QUELLEN-ANZAHL', 'sechs lesbare Quellen erwartet');
  if (checkFiles) for (const source of sources) if (!existsSync(source) || statSync(source).size === 0) fail('QUELLE-FEHLT', source);
  const pages = story.pages ?? []; const pageIds = new Set(); const pagePaths = new Set(); const pageOrders = new Set();
  if (pages.length !== 19) fail('SEITEN-ANZAHL', String(pages.length));
  for (const page of pages) {
    ownOnly(page, PAGE_FIELDS, fail, `page[${page.id ?? '?'}]`);
    if (pageIds.has(page.id)) fail('SEITE-DOPPELTE-ID', page.id); pageIds.add(page.id);
    if (pagePaths.has(page.sourcePath)) fail('SEITE-DOPPELTER-PFAD', page.sourcePath); pagePaths.add(page.sourcePath);
    const expectedSpace = STORY_SPACES[page.spaceId];
    if (typeof page.id !== 'string' || typeof page.title !== 'string' || !Number.isInteger(page.version) || typeof page.status !== 'string' || typeof page.author_role !== 'string' || !date(page.time) || typeof page.sourcePath !== 'string' || !Array.isArray(page.references) || !expectedSpace || page.spaceType !== expectedSpace.spaceType || !Number.isInteger(page.order) || page.order < 0) fail('SEITE-METADATEN-TYP', page.id);
    const orderKey = `${page.spaceId}\0${page.order}`; if (pageOrders.has(orderKey)) fail('SEITE-REIHENFOLGE', orderKey); pageOrders.add(orderKey);
    if (checkFiles && (!existsSync(page.sourcePath) || statSync(page.sourcePath).size === 0)) fail('SEITE-QUELLE-FEHLT', page.sourcePath);
    const meta = (metadataReader ?? readPageMetadata)(page.sourcePath); if (!meta || meta.id !== page.id || meta.storyPageId !== page.id || meta.title !== page.title || meta.parent !== page.parent || Number(meta.version) !== page.version || meta.status !== page.status || meta.spaceId !== page.spaceId || meta.spaceType !== page.spaceType || meta.order !== page.order) fail('SEITE-METADATEN-ABWEICHUNG', page.id);
  }
  for (const page of pages) if (page.parent !== null && !pageIds.has(page.parent)) fail('SEITE-WAISE', page.id);
  const rootPages = pages.filter((p) => p.parent === null); if (rootPages.length !== 3) fail('SEITE-WURZEL', String(rootPages.length));
  for (const [spaceId, expected] of Object.entries(STORY_SPACES)) {
    const roots = rootPages.filter((page) => page.spaceId === spaceId);
    if (roots.length !== 1 || roots[0]?.id !== expected.root) fail('SEITE-WURZEL', spaceId);
  }
  for (const page of pages) if (page.parent !== null && pages.find((candidate) => candidate.id === page.parent)?.spaceId !== page.spaceId) fail('SEITE-SPACE-PARENT', page.id);
  for (const page of pages) { const seen = new Set([page.id]); let parent = page.parent; while (parent) { if (seen.has(parent)) { fail('SEITE-ZYKLUS', page.id); break; } seen.add(parent); parent = pages.find((p) => p.id === parent)?.parent ?? null; } }
  const tickets = story.tickets ?? []; const ticketIds = new Set(); const commentIds = new Set(); let totalHours = 0; let totalCost = 0;
  const ticketById = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  if (tickets.length !== 17) fail('TICKETS-ANZAHL', String(tickets.length));
  for (const ticket of tickets) {
    ownOnly(ticket, TICKET_FIELDS, fail, `ticket[${ticket.id ?? '?'}]`);
    if (ticketIds.has(ticket.id)) fail('TICKET-DOPPELTE-ID', ticket.id); ticketIds.add(ticket.id);
    for (const field of ['id','type','status','reporter','assignee','priority','parent','statusHistory','acceptanceCriteria','evidenceRefs','comments','worklogs','createdAt','startedAt','testedAt','closedAt']) if (ticket[field] === undefined) fail('TICKET-NESTED-FEHLT', ticket.id);
    if (!Object.hasOwn(TICKET_PARENT_TYPES, ticket.type)) fail('TICKET-TYP', ticket.id);
    const parent = ticket.parent === null ? null : ticketById.get(ticket.parent);
    if (ticket.type === 'epic') {
      if (ticket.parent !== null) fail('TICKET-PARENT-TYP', `${ticket.id}: Epic darf keinen Parent besitzen`);
    } else if (!parent || !TICKET_PARENT_TYPES[ticket.type]?.includes(parent.type)) fail('TICKET-PARENT-TYP', `${ticket.id}: ${ticket.type} unter ${parent?.type ?? 'fehlend'} ist unzulaessig`);
    if (![ticket.createdAt,ticket.startedAt,ticket.testedAt,ticket.closedAt].every(date) || !(ticket.createdAt <= ticket.startedAt && ticket.startedAt <= ticket.testedAt && ticket.testedAt <= ticket.closedAt)) fail('STATUS-ZEITREISE', ticket.id);
    const history = ticket.statusHistory ?? []; const records = history;
    if (!Array.isArray(history) || records.length < 3 || records.some((h) => !h || typeof h === 'string' || typeof h.status !== 'string' || !date(h.time)) || records.some((h,i) => i && h.time < records[i-1].time) || records[0]?.status !== 'created' || records.at(-1)?.status !== ticket.status || (records.some((h) => h.time < ticket.createdAt || h.time > ticket.closedAt))) fail('STATUSHISTORY-ABWEICHUNG', ticket.id);
    if (records.at(-1)?.status !== ticket.status) fail('ENDSTATUS-ABWEICHUNG', ticket.id);
    if (!Array.isArray(ticket.acceptanceCriteria) || ticket.acceptanceCriteria.length === 0 || ticket.acceptanceCriteria.some((a) => typeof a !== 'object' || a.fulfilled !== true)) fail('ABNAHME-NICHT-ERFUELLT', ticket.id);
    if (!Array.isArray(ticket.evidenceRefs) || ticket.evidenceRefs.length === 0) fail('EVIDENCE-FEHLT', ticket.id);
    if (!Array.isArray(ticket.comments) || ticket.comments.length < 2 || ticket.comments.filter((c) => c?.type === 'closing').length !== 1) fail('ABSCHLUSS-KOMMENTAR-FEHLT', ticket.id);
    for (const comment of ticket.comments ?? []) { ownOnly(comment, COMMENT_FIELDS, fail, `comment[${comment.id ?? '?'}]`); if (!comment.id || !date(comment.time) || !comment.role || !comment.type || !comment.text || !comment.evidenceRef) fail('KOMMENTAR-NESTED-TYP', ticket.id); commentIds.add(comment.id); }
    if (!Array.isArray(ticket.worklogs) || ticket.worklogs.length === 0) fail('WORKLOG-FEHLT', ticket.id);
    for (const worklog of ticket.worklogs ?? []) { ownOnly(worklog, WORKLOG_FIELDS, fail, `worklog[${ticket.id}]`); if (!date(worklog.date) || typeof worklog.role !== 'string' || typeof worklog.activity !== 'string' || typeof worklog.phase !== 'string' || typeof worklog.hours !== 'number' || worklog.hours <= 0 || typeof worklog.cost !== 'number' || worklog.cost <= 0) fail('WORKLOG-NESTED-TYP', ticket.id); totalHours += worklog.hours; totalCost += worklog.cost; }
  }
  for (const ticket of tickets) {
    const seen = new Set([ticket.id]); let parent = ticket.parent;
    while (parent !== null) { if (seen.has(parent)) { fail('TICKET-PARENT-ZYKLUS', ticket.id); break; } seen.add(parent); parent = ticketById.get(parent)?.parent ?? null; }
  }
  if (totalHours !== 80 || totalCost !== 9600 || story.controls?.worklogHours !== 80 || story.controls?.worklogCost !== 9600) fail('WORKLOG-SUMME', `${totalHours}/${totalCost}`);
  const timeline = story.timeline ?? []; const evidenceRefs = new Set(story.catalogs?.evidenceRefs ?? []); const sessions = new Set(story.catalogs?.sessions ?? []); const decisions = new Set(story.catalogs?.decisions ?? []); const deliverables = new Set(story.catalogs?.deliverables ?? []);
  if (timeline.length !== 15) fail('TIMELINE-ANZAHL', String(timeline.length));
  const start = story.offer?.versions?.[0]?.date; const end = story.hypercare?.at(-1)?.day ? '2026-09-03T23:59:59+02:00' : null;
  for (let i = 0; i < timeline.length; i++) { const event = timeline[i]; ownOnly(event, TIMELINE_FIELDS, fail, `timeline[${event.id ?? '?'}]`); if (!event.id || !date(event.time) || !event.phase || !event.role || !Array.isArray(event.tickets) || !Array.isArray(event.pages) || !Array.isArray(event.sessions ?? []) || !event.evidence || !event.decision || !event.nextStep) fail('TIMELINE-NESTED-TYP', event.id); if (i && new Date(event.time) < new Date(timeline[i - 1].time)) fail('TIMELINE-REIHENFOLGE', event.id); if (start && new Date(event.time) < new Date(start)) fail('TIMELINE-GRENZE', event.id); if (end && new Date(event.time) > new Date(end)) fail('TIMELINE-GRENZE', event.id); for (const id of event.tickets ?? []) if (!ticketIds.has(id)) fail('UNBEKANNTE-TIMELINE-REFERENZ', id); for (const id of event.pages ?? []) if (!pageIds.has(id)) fail('UNBEKANNTE-TIMELINE-REFERENZ', id); for (const id of event.sessions ?? []) if (!sessions.has(id)) fail('UNBEKANNTE-TIMELINE-REFERENZ', id); if (event.evidence && !evidenceRefs.has(event.evidence) && !existsSync(event.evidence)) fail('UNBEKANNTE-TIMELINE-REFERENZ', event.evidence); if (event.decision && !decisions.has(event.decision)) fail('UNBEKANNTE-TIMELINE-REFERENZ', event.decision); if (event.deliverable && !deliverables.has(event.deliverable)) fail('UNBEKANNTE-TIMELINE-REFERENZ', event.deliverable); }
  if (timeline[0]?.phase !== 'Angebot' || !['Handover','Hypercare'].includes(timeline.at(-1)?.phase)) fail('TIMELINE-GRENZE', 'Angebot bis Handover/Hypercare erforderlich');
  if (!Array.isArray(story.hypercare) || story.hypercare.length !== 3) fail('HYPERCARE-ANZAHL', '3');
  for (const day of story.hypercare ?? []) { ownOnly(day, HYPERCARE_FIELDS, fail, `hypercare[${day.day ?? '?'}]`); const t = tickets.find((x) => x.id === day.ticket); if (!day.dailyPage || !pageIds.has(day.dailyPage) || !t || !day.comment || !commentIds.has(day.comment) || !day.evidence || (!evidenceRefs.has(day.evidence) && !existsSync(day.evidence)) || !day.diagnosis || !day.fix || day.retest !== 'passed' || day.status !== 'closed' || !day.decision) fail('HYPERCARE-RECORD', String(day.day)); if (t && ['P1','P2'].includes(t.priority) && !['done','closed'].includes(t.status)) fail('OFFENES-P1-P2', String(day.day)); }
  if (story.controls?.openP1 !== 0 || story.controls?.openP2 !== 0 || story.controls?.realBcExecution !== false) fail('OFFENES-P1-P2', 'Exitkontrolle');
  const entities = new Set([story.offer?.id, ...pageIds, ...ticketIds, ...commentIds, ...evidenceRefs, ...sessions, ...decisions, ...deliverables, ...(story.timeline ?? []).map((e) => e.id), ...(story.hypercare ?? []).map((d) => `HYPERCARE-${d.day}`)]); const inverse = { references:'references', 'depends-on':'required-by', 'required-by':'depends-on', blocks:'blocked-by', 'blocked-by':'blocks' }; const edgeSet = new Set();
  for (const relation of story.relations ?? []) { ownOnly(relation, RELATION_FIELDS, fail, `relation[${relation.from ?? '?'}]`); if (!inverse[relation.type]) fail('UNBEKANNTE-RELATION', relation.type); if (!entities.has(relation.from) || !entities.has(relation.to)) fail('RELATION-WAISE', relation.from); const key = `${relation.type}|${relation.from}|${relation.to}`; if (edgeSet.has(key)) fail('RELATION-DOPPELT', key); edgeSet.add(key); }
  for (const relation of story.relations ?? []) if (inverse[relation.type] && !edgeSet.has(`${inverse[relation.type]}|${relation.to}|${relation.from}`)) fail('INVERSE-RELATION', `${relation.from}->${relation.to}`);
  return errors;
};

if (process.argv[1]?.endsWith('validate-project-story.mjs')) { const story = JSON.parse(readFileSync('evidence/simulation/project-story.json', 'utf8')); const errors = validateStory(story); if (errors.length) { console.error(`Project-Story-Prüfung fehlgeschlagen (${errors.length}):`); errors.forEach((e) => console.error(`- ${e}`)); process.exit(1); } console.log('Project-Story-Prüfung bestanden.'); }

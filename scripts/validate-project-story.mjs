import { readFileSync, statSync, existsSync } from 'node:fs';
import process from 'node:process';
import YAML from 'yaml';

const PAGE_FIELDS = new Set(['id','title','parent','version','status','author_role','time','sourcePath','references','spaceId','spaceType','order']);
const TICKET_FIELDS = new Set(['id','type','summary','description','deliverable','phaseId','phase','phaseRefs','code','title','order','start','end','epicIds','billable','billingSource','estimateHours','actualHours','remainingHours','hourlyRate','netAmount','status','reporter','assignee','reporterRole','assigneeRole','priority','parent','dependencies','labels','components','createdAt','startedAt','testedAt','closedAt','statusHistory','acceptanceCriteria','evidenceRefs','comments','worklogs','category','participants','meetingTranscriptRefs','statusReason','decisionRefs','pageRefs','deliverableRefs','childTicketIds','typeLabel','displayIconKey','displayColorToken','classification','worklogHours']);
const COMMENT_FIELDS = new Set(['id','type','time','role','actorRef','actorType','actionRole','text','evidenceRef']);
const WORKLOG_FIELDS = new Set(['id','taskId','date','role','actorRef','actorType','actionRole','hours','activity','phase','billable','hourlyRate','netAmount']);
const TIMELINE_FIELDS = new Set(['id','time','phase','role','actorRef','actorType','actionRole','tickets','pages','sessions','evidence','decision','deliverable','action','result','nextStep']);
const HYPERCARE_FIELDS = new Set(['day','dailyPage','ticket','comment','evidence','priority','diagnosis','fix','retest','status','decision','actorRef','actorType','actionRole']);
const RELATION_FIELDS = new Set(['type','from','to']);
const STORY_SPACES = Object.freeze({
  'UABC-SPACE-CUSTOMER': { spaceType: 'customer-project', home: 'PAGE-UABC-000', roots: 6 },
  'UABC-SPACE-PRODUCT': { spaceType: 'standard-product', home: 'PAGE-UABC-090', roots: 8 },
  'UABC-SPACE-CONSULTANT': { spaceType: 'consultant-internal', home: 'PAGE-UABC-030', roots: 8 }
});
const TICKET_PARENT_TYPES = Object.freeze({
  phase: [],
  epic: ['phase'],
  story: ['epic'],
  bug: ['epic'],
  task: ['story', 'bug']
});
const OPEN_TICKET_STATUSES = new Set(['created','ready','in-progress','blocked']);
const CLOSED_TICKET_STATUSES = new Set(['done','closed']);
const PHASE_ROOT_IDS = Object.freeze(['UABC-1','UABC-2','UABC-3']);
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
  const legacyActiveId = /\b(?:TKT-UABC-[A-Z0-9-]+|UABC-PHASE-\d+)\b/;
  const rejectLegacyActiveIds = (value, location = 'story') => {
    if (Array.isArray(value)) value.forEach((item, index) => rejectLegacyActiveIds(item, `${location}[${index}]`));
    else if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) rejectLegacyActiveIds(item, `${location}.${key}`);
    else if (typeof value === 'string' && legacyActiveId.test(value)) fail('AKTIVE-ALT-ID', `${location}: ${value.match(legacyActiveId)?.[0]}`);
  };
  rejectLegacyActiveIds(Object.fromEntries(Object.entries(story).filter(([key]) => key !== 'ticketMigration')));
  const bcState = story.businessCentralPilotState ?? {};
  const companyGate = bcState.companyStrategyGate ?? {};
  if (bcState.baselineKind !== 'standard-cronus-demo' || bcState.baselineProvenance !== 'microsoft-standard-cronus-demo-data' || bcState.pilotConfigured !== false || bcState.writesApplied !== false || bcState.readbackStatus !== 'pending' || bcState.technicalCompanyName !== 'UABC-BASIC-DE' || bcState.internalCompanyId !== null || bcState.targetDecision !== 'pending-wave-0-evidence' || bcState.resetDecision !== 'pending-resetpoint-evidence' || bcState.targetState !== 'bc-basic-target-not-applied' || bcState.appliedDifferenceStatus !== 'none-evidenced' || companyGate.status !== 'blocked-pending-wave0-and-reset-evidence' || companyGate.selectedOption !== null || companyGate.nextExecutableStep !== 'W0-01-read-company-identity' || companyGate.authority !== 'project/bc-basic/pilot-setup-baseline.yaml#/companyInformation/companyStrategyDecision' || !bcState.sourceEvidence || (bcState.observedDisplayName === bcState.targetDisplayName && bcState.targetDisplayName)) fail('BC-PILOT-ZUSTAND', 'Standard-CRONUS-Demo-Baseline, Pilot-Soll, angewendete Differenz und Zielstrategie-Gate muessen strukturiert getrennt bleiben');
  const date = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));
  const allowedTop = new Set(['schemaVersion','storyId','projectId','classification','status','readableSources','offer','activeOffer','historicalOfferVersions','pages','tickets','ticketMigration','timeline','hypercare','controls','relations','catalogs','actors','generatedAt','historicalClassification','businessCentralPilotState']);
  for (const key of Object.keys(story)) if (!allowedTop.has(key)) fail('UNERLAUBTE-EIGENSCHAFT', key);
  if (story.classification !== 'current-pilot-planning' || story.status !== 'in-progress') fail('STORY-STATUS', 'current-pilot-planning/in-progress erforderlich');
  if (story.offer?.planned_hours !== 80 || story.offer?.planned_cost !== 9600 || story.activeOffer?.plannedHours !== 80 || story.activeOffer?.plannedNetAmount !== 9600) fail('BUDGET-ABWEICHUNG', 'Angebotsplan muss 80 Stunden und 9.600 EUR ausweisen');
  if (story.offer?.currentVersion !== 'pilot-rebaseline-2026-07-13' || story.offer?.currentStatus !== 'active-planning' || story.activeOffer?.status !== 'planned-not-accepted' || story.activeOffer?.customerAcceptanceClaimed !== false) fail('ANGEBOT-AKTIV', 'aktiver Rebaseline-Stand ohne Kundenabschluss erforderlich');
  if (!Array.isArray(story.historicalOfferVersions) || story.historicalOfferVersions.length === 0 || story.historicalOfferVersions.some((version) => typeof version.hours !== 'number' || typeof version.cost !== 'number')) fail('ANGEBOT-VERSIONEN', 'historische Angebotsversionen muessen getrennt und numerisch erhalten bleiben');
  const sources = new Set(story.readableSources ?? []); if (sources.size !== 6) fail('QUELLEN-ANZAHL', 'sechs lesbare Quellen erwartet');
  if (checkFiles) for (const source of sources) if (!existsSync(source) || statSync(source).size === 0) fail('QUELLE-FEHLT', source);
  const pages = story.pages ?? []; const pageIds = new Set(); const pagePaths = new Set(); const pageOrders = new Set();
  if (pages.length !== 28) fail('SEITEN-ANZAHL', String(pages.length));
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
  const rootPages = pages.filter((p) => p.parent === null); if (rootPages.length !== 22) fail('SEITE-WURZEL', String(rootPages.length));
  for (const [spaceId, expected] of Object.entries(STORY_SPACES)) {
    const roots = rootPages.filter((page) => page.spaceId === spaceId);
    if (roots.length !== expected.roots || !roots.some((root) => root.id === expected.home)) fail('SEITE-WURZEL', spaceId);
  }
  for (const page of pages) if (page.parent !== null && pages.find((candidate) => candidate.id === page.parent)?.spaceId !== page.spaceId) fail('SEITE-SPACE-PARENT', page.id);
  for (const page of pages) { const seen = new Set([page.id]); let parent = page.parent; while (parent) { if (seen.has(parent)) { fail('SEITE-ZYKLUS', page.id); break; } seen.add(parent); parent = pages.find((p) => p.id === parent)?.parent ?? null; } }
  const tickets = story.tickets ?? []; const ticketIds = new Set(); const commentIds = new Set(); const criteriaSignatures = new Set(); let totalHours = 0; let totalCost = 0;
  const ticketById = new Map(tickets.map((ticket) => [ticket.id, ticket]));
  if (tickets.length === 0 || story.controls?.activeTicketCount !== tickets.length) fail('TICKETS-ANZAHL', `aktive Menge ${tickets.length} muss dynamisch gebunden sein`);
  const phases=tickets.filter((ticket)=>ticket.type==='phase'); const phaseIds=new Set(phases.map((phase)=>phase.id));
  if(phases.length!==3||PHASE_ROOT_IDS.some((id)=>!phaseIds.has(id))||phases.some((phase)=>phase.order!==Number(phase.id.split('-')[1])||phase.parent!==null||phase.billable!==false||phase.worklogs.length!==0||!Array.isArray(phase.epicIds))) fail('PHASE-VERTRAG','genau UABC-1/2/3 als geordnete Phase-Roots erforderlich');
  for (const ticket of tickets) {
    ownOnly(ticket, TICKET_FIELDS, fail, `ticket[${ticket.id ?? '?'}]`);
    if (ticketIds.has(ticket.id)) fail('TICKET-DOPPELTE-ID', ticket.id); ticketIds.add(ticket.id);
    for (const field of ['id','type','summary','description','deliverable','billable','billingSource','estimateHours','actualHours','remainingHours','hourlyRate','netAmount','status','reporter','assignee','priority','parent','statusHistory','acceptanceCriteria','evidenceRefs','comments','worklogs','createdAt','startedAt','testedAt','closedAt']) if (ticket[field] === undefined) fail('TICKET-NESTED-FEHLT', ticket.id);
    if (!Object.hasOwn(TICKET_PARENT_TYPES, ticket.type)) fail('TICKET-TYP', ticket.id);
    if(ticket.type==='phase'){ if(ticket.parent!==null||ticket.phaseId!==ticket.id) fail('PHASE-VERTRAG',ticket.id); }
    else if(ticket.type==='epic'){ if(!phaseIds.has(ticket.phaseId)||ticket.parent!==ticket.phaseId||!Array.isArray(ticket.phaseRefs)||ticket.phaseRefs.length!==1||ticket.phaseRefs[0]!==ticket.phaseId||/^Phase [123]/i.test(ticket.summary)) fail('EPIC-PHASE',ticket.id); }
    else if(!phaseIds.has(ticket.phaseId)||ticket.phase!==phases.find((phase)=>phase.id===ticket.phaseId)?.code) fail('TICKET-PHASE',ticket.id);
    const parent = ticket.parent === null ? null : ticketById.get(ticket.parent);
    if (ticket.type === 'phase') {
      if (ticket.parent !== null) fail('TICKET-PARENT-TYP', `${ticket.id}: Phase darf keinen Parent besitzen`);
    } else if (!parent || !TICKET_PARENT_TYPES[ticket.type]?.includes(parent.type)) fail('TICKET-PARENT-TYP', `${ticket.id}: ${ticket.type} unter ${parent?.type ?? 'fehlend'} ist unzulaessig`);
    if (typeof ticket.summary !== 'string' || typeof ticket.description !== 'string' || ticket.description.length < 80 || /Status im aktuellen Playthru-Pilot|Aktueller Playthru-Pilot:|soll geprüft werdener|historischn/i.test(`${ticket.summary} ${ticket.description}`) || (OPEN_TICKET_STATUSES.has(ticket.status) && /wurden entschieden|wurden geladen|wurde durchgespielt|Retest bestanden|als Handover abgeschlossen|synthetisch abgeschlossen|erfolgreich durchgeführt|erfolgreich abgeschlossen/i.test(ticket.description))) fail('TICKET-TEXT', ticket.id);
    if (OPEN_TICKET_STATUSES.has(ticket.status) && /^(?:Bestandene|Abgeschlossene|Erfolgreiche)\b/i.test(ticket.deliverable ?? '')) fail('TICKET-LIEFERERGEBNIS-STATUS', ticket.id);
    if (/(?:\bEUR\b|€|\b\d+(?:[.,]\d+)?[- ]?Stunden\b|\b\d{1,3}(?:\.\d{3})+(?:,\d+)?\b)/i.test(`${ticket.summary} ${ticket.description}`)) fail('TWIN-TICKET-GELD', ticket.id);
    const lifecycleDates = [ticket.createdAt,ticket.startedAt,ticket.testedAt,ticket.closedAt].filter((value) => value !== null);
    if (!date(ticket.createdAt) || lifecycleDates.some((value) => !date(value)) || lifecycleDates.some((value,index) => index > 0 && value < lifecycleDates[index-1]) || (OPEN_TICKET_STATUSES.has(ticket.status) && (ticket.testedAt !== null || ticket.closedAt !== null)) || (CLOSED_TICKET_STATUSES.has(ticket.status) && !date(ticket.closedAt))) fail('STATUS-ZEITREISE', ticket.id);
    const history = ticket.statusHistory ?? []; const records = history;
    if (!Array.isArray(history) || records.length < 1 || records.some((h) => !h || typeof h === 'string' || typeof h.status !== 'string' || !date(h.time)) || records.some((h,i) => i && h.time < records[i-1].time) || records[0]?.status !== 'created' || records.at(-1)?.status !== ticket.status || records.some((h) => h.time < ticket.createdAt || (ticket.closedAt && h.time > ticket.closedAt))) fail('STATUSHISTORY-ABWEICHUNG', ticket.id);
    if (records.at(-1)?.status !== ticket.status) fail('ENDSTATUS-ABWEICHUNG', ticket.id);
    if (!Array.isArray(ticket.acceptanceCriteria) || ticket.acceptanceCriteria.length < 2 || ticket.acceptanceCriteria.some((criterion) => typeof criterion !== 'object' || typeof criterion.criterion !== 'string' || criterion.criterion.trim().length < 20 || typeof criterion.fulfilled !== 'boolean') || new Set(ticket.acceptanceCriteria.map((criterion) => criterion.criterion)).size !== ticket.acceptanceCriteria.length || (OPEN_TICKET_STATUSES.has(ticket.status) && ticket.acceptanceCriteria.some((criterion) => criterion.fulfilled)) || (CLOSED_TICKET_STATUSES.has(ticket.status) && ticket.acceptanceCriteria.some((criterion) => !criterion.fulfilled))) fail('ABNAHME-NICHT-ERFUELLT', ticket.id);
    if (ticket.type === 'task' && ticket.acceptanceCriteria.some((criterion) => /gemäß Beschreibung|gemaess Beschreibung|Page-, Deliverable- und Evidence-Referenzen .* aktualisiert/i.test(criterion.criterion))) fail('TASK-ABNAHME-KONKRET', ticket.id);
    if (['epic','story'].includes(ticket.type) && ticket.acceptanceCriteria.some((criterion) => /besitzt einen abgestimmten fachlichen Umfang und nachvollziehbare Abhängigkeiten|ist fachlich mit der verantwortlichen Rolle abgestimmt und als überprüfbares Ergebnis beschrieben|Akzeptanz und Abweichungen von UABC-|über untergeordnete Stories und passende Evidence prüfbar/i.test(criterion.criterion))) fail('ABNAHME-KONKRET', ticket.id);
    const criteriaSignature = JSON.stringify((ticket.acceptanceCriteria ?? []).map((criterion) => criterion.criterion));
    if (criteriaSignatures.has(criteriaSignature)) fail('ABNAHME-SCHABLONE', ticket.id); else criteriaSignatures.add(criteriaSignature);
    if (!Array.isArray(ticket.evidenceRefs) || (ticket.type === 'task' && ticket.evidenceRefs.length === 0)) fail('EVIDENCE-FEHLT', ticket.id);
    const closingComments = (ticket.comments ?? []).filter((comment) => comment?.type === 'closing');
    if (!Array.isArray(ticket.comments) || ticket.comments.length === 0 || (ticket.type === 'task' && CLOSED_TICKET_STATUSES.has(ticket.status) && closingComments.length !== 1) || (OPEN_TICKET_STATUSES.has(ticket.status) && closingComments.length !== 0)) fail('ABSCHLUSS-KOMMENTAR-FEHLT', ticket.id);
    for (const comment of ticket.comments ?? []) { ownOnly(comment, COMMENT_FIELDS, fail, `comment[${comment.id ?? '?'}]`); if (!comment.id || !date(comment.time) || !comment.role || !comment.type || !comment.text || !comment.evidenceRef) fail('KOMMENTAR-NESTED-TYP', ticket.id); commentIds.add(comment.id); }
    if (!Array.isArray(ticket.worklogs) || (ticket.type === 'task' ? ticket.actualHours > 0 && ticket.worklogs.length === 0 : ticket.worklogs.length !== 0)) fail(ticket.type === 'task' ? 'WORKLOG-FEHLT' : 'ELTERN-WORKLOG', ticket.id);
    const ticketWorklogHours = (ticket.worklogs ?? []).reduce((sum, worklog) => sum + Number(worklog?.hours ?? 0), 0);
    const ticketWorklogCost = (ticket.worklogs ?? []).reduce((sum, worklog) => sum + Number(worklog?.netAmount ?? 0), 0);
    if (ticket.type === 'task') {
      if (ticket.billable !== true || ticket.billingSource !== 'task-worklogs' || ticket.hourlyRate !== 120 || ticket.actualHours !== ticketWorklogHours || ticket.netAmount !== ticketWorklogCost) fail('TASK-ABRECHNUNG', ticket.id);
    } else if (ticket.billable !== false || ticket.billingSource !== 'task-rollup-only' || ticket.hourlyRate !== null) fail('ELTERN-ABRECHNUNG', ticket.id);
    for (const worklog of ticket.worklogs ?? []) { ownOnly(worklog, WORKLOG_FIELDS, fail, `worklog[${ticket.id}]`); if (!worklog || typeof worklog !== 'object') { fail('WORKLOG-NESTED-TYP', ticket.id); continue; } if (!worklog.id || worklog.taskId !== ticket.id || !date(worklog.date) || typeof worklog.role !== 'string' || typeof worklog.activity !== 'string' || worklog.phase !== ticket.phase || typeof worklog.hours !== 'number' || worklog.hours <= 0 || worklog.billable !== true || worklog.hourlyRate !== 120 || worklog.netAmount !== worklog.hours * 120) fail('WORKLOG-NESTED-TYP', ticket.id); totalHours += Number(worklog.hours ?? 0); totalCost += Number(worklog.netAmount ?? 0); }
  }
  for (const ticket of tickets) {
    const seen = new Set([ticket.id]); let parent = ticket.parent;
    while (parent !== null) { if (seen.has(parent)) { fail('TICKET-PARENT-ZYKLUS', ticket.id); break; } seen.add(parent); parent = ticketById.get(parent)?.parent ?? null; }
    const visitDependency = (dependency, path) => { if (path.has(dependency)) { fail('TICKET-ABHAENGIGKEITS-ZYKLUS', ticket.id); return; } const nextPath = new Set(path).add(dependency); for (const nested of ticketById.get(dependency)?.dependencies ?? []) visitDependency(nested, nextPath); };
    for (const dependency of ticket.dependencies ?? []) visitDependency(dependency, new Set([ticket.id]));
  }
  if (story.offer?.actual_hours !== totalHours || story.offer?.actual_cost !== totalCost || story.activeOffer?.actualHours !== totalHours || story.activeOffer?.actualNetAmount !== totalCost || story.controls?.actualHours !== totalHours || story.controls?.actualNetAmount !== totalCost || story.controls?.worklogHours !== totalHours || story.controls?.worklogCost !== totalCost) fail('WORKLOG-SUMME', `${totalHours}/${totalCost}`);
  const tasks = tickets.filter((ticket) => ticket.type === 'task'); const epics = tickets.filter((ticket) => ticket.type === 'epic');
  const stories = tickets.filter((ticket)=>ticket.type==='story' || ticket.type === 'bug');
  if (!tasks.length || !epics.length || !stories.length || phases.length !== 3 || story.controls?.phaseCount !== phases.length || story.controls?.epicCount !== epics.length || story.controls?.storyCount !== stories.length || story.controls?.taskCount !== tasks.length || story.controls?.billableTicketCount !== tasks.filter((ticket) => ticket.billable).length) fail('TICKET-HIERARCHIE', 'Typmengen muessen aus dem aktiven fachlichen Bestand abgeleitet sein');
  for (const parentTicket of tickets.filter((ticket) => ticket.type !== 'task')) { const descendants = tasks.filter((task) => { let current = task.parent; while (current) { if (current === parentTicket.id) return true; current = ticketById.get(current)?.parent ?? null; } return false; }); const hours = descendants.reduce((sum, task) => sum + task.actualHours, 0); const amount = descendants.reduce((sum, task) => sum + task.netAmount, 0); if (parentTicket.actualHours !== hours || parentTicket.netAmount !== amount) fail('ROLLUP-ABWEICHUNG', parentTicket.id); }
  const phaseHours = Object.fromEntries(phases.map((phase) => [phase.code,tasks.filter((task) => task.phaseId === phase.id).reduce((sum,task) => sum + task.actualHours,0)]));
  if (Object.values(phaseHours).reduce((sum, hours) => sum + hours, 0) !== totalHours) fail('PHASEN-SUMME', JSON.stringify(phaseHours));
  for(const phase of phases){const hours=phaseHours[phase.code]; if(phase.actualHours!==hours||phase.netAmount!==tasks.filter((task)=>task.phaseId===phase.id).reduce((sum,task)=>sum+task.netAmount,0)||new Set(phase.epicIds).size!==phase.epicIds.length||phase.epicIds.some((id)=>!epics.some((epic)=>epic.id===id&&epic.phaseId===phase.id&&Array.isArray(epic.phaseRefs)&&epic.phaseRefs.includes(phase.id)))) fail('PHASE-ROLLUP',phase.id);}
  for(const task of tasks){const result=ticketById.get(task.parent); const epic=ticketById.get(result?.parent); if(!result||!epic||result.phaseId!==task.phaseId||!Array.isArray(epic.phaseRefs)||!epic.phaseRefs.includes(task.phaseId)) fail('TASK-VERERBUNG',task.id);}
  if (tasks.filter((task) => /Hypercare/i.test(`${task.summary} ${task.description}`)).some((task) => task.actualHours > task.estimateHours)) fail('HYPERCARE-GRENZE','Hypercare-Ist darf die ticketbezogene Schaetzung nicht ohne Plananpassung ueberschreiten');
  if (!Array.isArray(story.ticketMigration) || story.ticketMigration.length !== 86) fail('MIGRATIONSMAP','86 eindeutige Provenienzrecords erforderlich');
  else {
    const sources = new Set();
    const activeIds = new Set(tickets.map((ticket) => ticket.id));
    for (const row of story.ticketMigration) {
      if (!row?.sourceId || sources.has(row.sourceId)) fail('MIGRATIONSMAP', `doppelte oder fehlende Quell-ID ${row?.sourceId ?? ''}`);
      sources.add(row?.sourceId);
      if (row.targetKind === 'active-ticket' && !activeIds.has(row.targetId)) fail('MIGRATIONSMAP', `${row.sourceId} verweist nicht auf ein aktives Ticket`);
      if (row.targetKind === 'non-ticket-provenance' && (typeof row.targetId !== 'string' || !row.targetId.includes('/'))) fail('MIGRATIONSMAP', `${row.sourceId} besitzt kein Provenienzziel`);
    }
    for (const [sourceId, targetId] of [['UABC-PHASE-1','UABC-1'],['UABC-PHASE-2','UABC-2'],['UABC-PHASE-3','UABC-3']]) {
      const row = story.ticketMigration.find((entry) => entry.sourceId === sourceId);
      if (row?.targetKind !== 'active-ticket' || row?.targetId !== targetId) fail('MIGRATIONSMAP', `${sourceId} muss auf ${targetId} zeigen`);
    }
  }
  if (tickets.some((ticket)=>!/^UABC-[1-9]\d*$/.test(ticket.id)) || new Set(tickets.map((ticket)=>ticket.id)).size!==tickets.length) fail('TICKET-ID-VERTRAG','aktive UABC-IDs muessen eindeutig sein; die Menge ist fachlich dynamisch');
  const timeline = story.timeline ?? []; const evidenceRefs = new Set(story.catalogs?.evidenceRefs ?? []); const sessions = new Set(story.catalogs?.sessions ?? []); const decisions = new Set(story.catalogs?.decisions ?? []); const deliverables = new Set(story.catalogs?.deliverables ?? []);
  if (existsSync('project/bc-basic/deliverables.yaml')) for (const deliverable of YAML.parse(readFileSync('project/bc-basic/deliverables.yaml', 'utf8')).deliverables ?? []) deliverables.add(deliverable.id);
  for (const ticket of tickets) {
    for (const dependency of ticket.dependencies ?? []) if (!ticketIds.has(dependency)) fail('UNBEKANNTE-TICKET-REFERENZ', `${ticket.id}/${dependency}`);
    for (const pageRef of ticket.pageRefs ?? []) if (!pageIds.has(pageRef)) fail('UNBEKANNTE-TICKET-REFERENZ', `${ticket.id}/${pageRef}`);
    for (const deliverableRef of ticket.deliverableRefs ?? []) if (!deliverables.has(deliverableRef)) fail('UNBEKANNTE-TICKET-REFERENZ', `${ticket.id}/${deliverableRef}`);
    for (const decisionRef of ticket.decisionRefs ?? []) if (!decisions.has(decisionRef)) fail('UNBEKANNTE-TICKET-REFERENZ', `${ticket.id}/${decisionRef}`);
    for (const evidenceRef of ticket.evidenceRefs ?? []) if (!evidenceRefs.has(evidenceRef) && !existsSync(evidenceRef)) fail('UNBEKANNTE-TICKET-REFERENZ', `${ticket.id}/${evidenceRef}`);
    for (const childId of ticket.childTicketIds ?? []) if (!ticketIds.has(childId) || ticketById.get(childId)?.parent !== ticket.id) fail('UNBEKANNTE-TICKET-REFERENZ', `${ticket.id}/${childId}`);
    if (ticket.type === 'task' && (!(ticket.pageRefs ?? []).length || !(ticket.deliverableRefs ?? []).length || !(ticket.evidenceRefs ?? []).length)) fail('EVIDENCE-FEHLT', ticket.id);
    if (CLOSED_TICKET_STATUSES.has(ticket.status) && /Setup|Migration|Schulung|UAT|Cutover|Hypercare|Retro|Supportuebergabe|Supportübergabe/i.test(`${ticket.summary} ${ticket.description}`)) fail('FUTURE-GATE-STATUS', ticket.id);
  }
  if (!Array.isArray(timeline)) fail('TIMELINE-ANZAHL', 'Timeline muss als dynamische Liste vorliegen');
  const start = '2026-07-13T00:00:00+02:00';
  for (let i = 0; i < timeline.length; i++) { const event = timeline[i]; ownOnly(event, TIMELINE_FIELDS, fail, `timeline[${event.id ?? '?'}]`); if (!event.id || !date(event.time) || !event.phase || !event.role || !Array.isArray(event.tickets) || !Array.isArray(event.pages) || !Array.isArray(event.sessions ?? []) || !event.evidence || !event.decision || !event.nextStep) fail('TIMELINE-NESTED-TYP', event.id); if (i && new Date(event.time) < new Date(timeline[i - 1].time)) fail('TIMELINE-REIHENFOLGE', event.id); if (new Date(event.time) < new Date(start)) fail('TIMELINE-GRENZE', event.id); for (const id of event.tickets ?? []) if (!ticketIds.has(id)) fail('UNBEKANNTE-TIMELINE-REFERENZ', id); for (const id of event.pages ?? []) if (!pageIds.has(id)) fail('UNBEKANNTE-TIMELINE-REFERENZ', id); for (const id of event.sessions ?? []) if (!sessions.has(id)) fail('UNBEKANNTE-TIMELINE-REFERENZ', id); if (event.evidence && !evidenceRefs.has(event.evidence) && !existsSync(event.evidence)) fail('UNBEKANNTE-TIMELINE-REFERENZ', event.evidence); if (event.decision && !decisions.has(event.decision)) fail('UNBEKANNTE-TIMELINE-REFERENZ', event.decision); if (event.deliverable && !deliverables.has(event.deliverable)) fail('UNBEKANNTE-TIMELINE-REFERENZ', event.deliverable); if (/abgenommen|bestanden|retest|go_simulation|simuliert/i.test(`${event.result} ${event.action}`)) fail('FUTURE-GATE-STATUS', event.id); }
  if (!Array.isArray(story.hypercare)) fail('HYPERCARE-ANZAHL', 'Hypercare muss als dynamische Liste vorliegen');
  for (const day of story.hypercare ?? []) { ownOnly(day, HYPERCARE_FIELDS, fail, `hypercare[${day.day ?? '?'}]`); const t = tickets.find((x) => x.id === day.ticket); if (!day.dailyPage || !pageIds.has(day.dailyPage) || !t || !day.comment || !commentIds.has(day.comment) || !day.evidence || (!evidenceRefs.has(day.evidence) && !existsSync(day.evidence)) || !day.diagnosis || !day.fix || !day.retest || !day.status || !day.decision || !decisions.has(day.decision)) fail('HYPERCARE-RECORD', String(day.day)); if (['passed','closed','done'].includes(day.retest) || ['closed','done'].includes(day.status) || (t && CLOSED_TICKET_STATUSES.has(t.status))) fail('FUTURE-GATE-STATUS', `Hypercare ${day.day}`); }
  if (story.controls?.realBcExecution !== false) fail('OFFENES-P1-P2', 'reale BC-Ausfuehrung darf nicht behauptet werden');
  const entities = new Set([story.offer?.id, ...pageIds, ...ticketIds, ...commentIds, ...evidenceRefs, ...sessions, ...decisions, ...deliverables, ...(story.timeline ?? []).map((e) => e.id), ...(story.hypercare ?? []).map((d) => `HYPERCARE-${d.day}`)]); const inverse = { references:'references', 'depends-on':'required-by', 'required-by':'depends-on', blocks:'blocked-by', 'blocked-by':'blocks' }; const edgeSet = new Set();
  for (const relation of story.relations ?? []) { ownOnly(relation, RELATION_FIELDS, fail, `relation[${relation.from ?? '?'}]`); if (!inverse[relation.type]) fail('UNBEKANNTE-RELATION', relation.type); if (!entities.has(relation.from) || !entities.has(relation.to)) fail('RELATION-WAISE', relation.from); const key = `${relation.type}|${relation.from}|${relation.to}`; if (edgeSet.has(key)) fail('RELATION-DOPPELT', key); edgeSet.add(key); }
  for (const relation of story.relations ?? []) if (inverse[relation.type] && !edgeSet.has(`${inverse[relation.type]}|${relation.to}|${relation.from}`)) fail('INVERSE-RELATION', `${relation.from}->${relation.to}`);
  return errors;
};

if (process.argv[1]?.endsWith('validate-project-story.mjs')) { const story = JSON.parse(readFileSync('evidence/simulation/project-story.json', 'utf8')); const errors = validateStory(story); if (errors.length) { console.error(`Project-Story-Prüfung fehlgeschlagen (${errors.length}):`); errors.forEach((e) => console.error(`- ${e}`)); process.exit(1); } const taskWorklogs = story.tickets.filter((ticket) => ticket.type === 'task').flatMap((ticket) => ticket.worklogs ?? []); const hours = taskWorklogs.reduce((sum, worklog) => sum + Number(worklog.hours ?? 0), 0); const amount = taskWorklogs.reduce((sum, worklog) => sum + Number(worklog.netAmount ?? 0), 0); console.log(`Project-Story-Prüfung bestanden: ${story.tickets.length} aktive Tickets, ${hours} Iststunden, ${amount} EUR Istkosten; Plan ${story.offer.planned_hours} Stunden/${story.offer.planned_cost} EUR.`); }

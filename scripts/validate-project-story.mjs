import { readFileSync, statSync, existsSync } from 'node:fs';
import process from 'node:process';
const story = JSON.parse(readFileSync('evidence/simulation/project-story.json', 'utf8'));
const errors = [];
for (const source of story.readableSources ?? []) if (!existsSync(source) || statSync(source).size === 0) errors.push(`Lesbare Quelle fehlt: ${source}`);
if (story.classification !== 'synthetic-only' || story.status !== 'closed') errors.push('Story nicht synthetisch geschlossen.');
if (story.offer?.planned_hours !== 80 || story.offer?.actual_hours !== 80 || story.offer?.planned_cost !== 9600 || story.offer?.actual_cost !== 9600 || story.offer?.currentVersion !== 3) errors.push('Angebot/Abschlussabgleich inkonsistent.');
if (story.offer?.versions?.length !== 3 || story.offer.versions.some((v) => v.hours !== 80 || v.cost !== 9600)) errors.push('Angebotsversionen unvollständig.');
if (story.pages?.length !== 19) errors.push('Seitenzahl nicht 19.');
for (const page of story.pages ?? []) if (!page.id || !page.title || !page.parent && page.id !== 'PAGE-UABC-000' || !page.version || !page.status || !page.author_role || !page.time || !page.sourcePath || !page.references?.length || !existsSync(page.sourcePath) || statSync(page.sourcePath).size === 0) errors.push(`Seite unvollständig: ${page.id}`);
if (story.tickets?.length !== 17) errors.push('Ticketzahl nicht 17.');
const ticketIds = new Set();
for (const ticket of story.tickets ?? []) {
  if (ticketIds.has(ticket.id)) errors.push(`Doppeltes Ticket: ${ticket.id}`); ticketIds.add(ticket.id);
  if (!ticket.reporter || !ticket.assignee || !ticket.priority || !ticket.statusHistory?.length || !ticket.acceptanceCriteria?.every((a) => a.fulfilled) || !ticket.evidenceRefs?.length || !ticket.worklogs?.length || ticket.comments?.length !== 2) errors.push(`Ticketstruktur unvollständig: ${ticket.id}`);
  if (['done','closed'].includes(ticket.status) && ticket.comments?.[1]?.type !== 'closing') errors.push(`Abschlusskommentar fehlt: ${ticket.id}`);
}
if (story.worklogRecords || story.commentRecords || story.timelineEvents || story.pageSources) errors.push('Parallele abgeleitete Listen sind unzulässig.');
const readableTicketText = readFileSync('atlassian/jira/issues/bc-basic-story-tickets.yaml', 'utf8');
if (!readableTicketText.includes('generated: true') || !readableTicketText.includes('derivedFrom: evidence/simulation/project-story.json')) errors.push('Lesbarer Ticket-Export ist nicht als abgeleitet gekennzeichnet.');
const worklogHours = story.tickets.reduce((sum, t) => sum + t.worklogs.reduce((s, w) => s + w.hours, 0), 0);
if (worklogHours !== 80) errors.push(`Worklogs ergeben ${worklogHours} statt 80 Stunden.`);
if (story.timeline?.length !== 15 || story.timeline.some((e) => !e.id || !e.time || !e.phase || !e.role || !e.tickets?.length || !e.pages?.length || !e.evidence || !e.decision || !e.nextStep)) errors.push('Timeline unvollständig.');
for (const event of story.timeline ?? []) if (Number.isNaN(Date.parse(event.time))) errors.push(`Ungültige Timeline-Zeit: ${event.id}`);
if (story.hypercare?.length !== 3 || story.hypercare.some((d) => !d.dailyPage || !d.ticket || !d.comment || !d.diagnosis || !d.fix || d.retest !== 'passed' || d.status !== 'closed' || !d.decision)) errors.push('Hypercare unvollständig.');
if (story.controls?.openP1 !== 0 || story.controls?.openP2 !== 0 || story.controls?.worklogHours !== 80 || story.controls?.worklogCost !== 9600 || story.controls?.realBcExecution !== false) errors.push('Kontrollsummen oder Wahrheitsgrenze verletzt.');
if (errors.length) { console.error(`Project-Story-Prüfung fehlgeschlagen (${errors.length}):`); errors.forEach((e) => console.error(`- ${e}`)); process.exit(1); }
console.log('Project-Story-Prüfung bestanden: Angebot, 19 Seiten, 17 Tickets, 15 Timeline-Ereignisse und 3 Hypercaretage geschlossen.');

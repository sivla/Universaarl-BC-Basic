import fs from 'node:fs';

const story = JSON.parse(fs.readFileSync('evidence/simulation/project-story.json', 'utf8'));
const required = story.ticketQuality?.descriptionSections ?? [
  'Ausgangslage und Ziel', 'In Scope', 'Nicht im Umfang', 'Voraussetzungen und Rollen',
  'Durchführung', 'Ergebnis und Akzeptanz', 'Lieferung und Referenzen',
  'Evidence, Test und Readback', 'Aufwand und Abrechnung', 'Abhängigkeiten, Risiken und Übergabe'
];
const errors = [];
const fail = (code, detail) => errors.push(`${code}: ${detail}`);
const tickets = story.tickets ?? [];
if (tickets.length !== 50) fail('TICKET-COUNT', `erwartet 50, gefunden ${tickets.length}`);
if (story.status !== 'simulated-complete' || story.classification !== 'synthetic-canonical-project-v1') fail('CANONICAL-STATUS', 'aktive Story muss synthetisch abgeschlossen bleiben');
const ids = new Set(tickets.map(ticket => ticket.id));
const summaries = new Set();
const descriptions = new Set();
const sectionVariants = new Map(required.map(section => [section, new Map()]));
const normalize = (value, ticket) => {
  const escapedSummary = String(ticket.summary ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return value.toLowerCase()
    .replace(new RegExp(escapedSummary, 'g'), '')
    .replace(/uabc-\d+/g, '')
    .replace(/\b(?:phase|p)[ -]?\d\b/g, '')
    .replace(/\b(?:phase|epic|story|task)\b/g, '')
    .replace(/die kundeninstanz wird als realitätsnahe repositorybasierte simulation betrachtet/g, '')
    .replace(/synthet(?:ische|ischen|ischer|isch) simulation/g, '')
    .replace(/acht reale kundengates bleiben außerhalb der simulation offen/g, '')
    .replace(/\d+/g, '#').replace(/\s+/g, ' ').trim();
};
for (const ticket of tickets) {
  const words = ticket.summary?.trim().split(/\s+/) ?? [];
  if (words.length < 1 || words.length > 7 || /[.!?]/.test(ticket.summary) || /UABC-\d+/.test(ticket.summary)) fail('SUMMARY', `${ticket.id}: kurze eindeutige Summary erwartet`);
  if (summaries.has(ticket.summary)) fail('SUMMARY-DUPLICATE', ticket.id); else summaries.add(ticket.summary);
  if (!ticket.description || ticket.description.length < 900) fail('DESCRIPTION-SUBSTANCE', ticket.id);
  if (descriptions.has(ticket.description)) fail('DESCRIPTION-DUPLICATE', ticket.id); else descriptions.add(ticket.description);
  for (const section of required) if (!ticket.description.includes(section)) fail('DESCRIPTION-SECTION', `${ticket.id}: ${section}`);
  for (const field of ['customerInputs', 'customerRoles', 'consultantRoles', 'concreteSteps', 'agenda', 'expectedResult', 'specificRisk', 'handoff', 'evidenceReadback']) if (typeof ticket[field] !== 'string' || ticket[field].trim().length < 5) fail('STRUCTURED-DETAIL', `${ticket.id}: ${field}`);
  for (const [index, section] of required.entries()) {
    const next = required[index + 1];
    const start = ticket.description.indexOf(section) + section.length;
    const end = next ? ticket.description.indexOf(next, start) : ticket.description.length;
    const variant = normalize(ticket.description.slice(start, end), ticket);
    const variants = sectionVariants.get(section);
    variants.set(variant, (variants.get(variant) ?? 0) + 1);
  }
  if (!ticket.evidenceRefs?.length || !ticket.deliverableRefs?.length || !ticket.pageRefs?.length || !ticket.meetingTranscriptRefs?.length) fail('TRACEABILITY', ticket.id);
  if (!ticket.acceptanceCriteria?.length || ticket.acceptanceCriteria.some(criteria => criteria.fulfilled !== true)) fail('ACCEPTANCE', ticket.id);
  if (ticket.acceptanceCriteria.length < 2 || ticket.acceptanceCriteria.some(criteria => criteria.criterion.startsWith(ticket.expectedResult) || criteria.criterion.includes(ticket.expectedResult))) fail('ACCEPTANCE-REDUNDANT', ticket.id);
  for (const child of ticket.childTicketIds ?? []) if (!ids.has(child)) fail('CHILD-REFERENCE', `${ticket.id}->${child}`);
  for (const parent of ticket.dependencies ?? []) if (!ids.has(parent)) fail('DEPENDENCY-REFERENCE', `${ticket.id}->${parent}`);
  if (/(echter|reale[rn]?|produktiver) (Tenant|Go-live|Posting|Kundenfreigabe)/i.test(ticket.description) && !/kein echter|keine echte|keine produktive/i.test(ticket.description)) fail('REAL-CLAIM', ticket.id);
}
const tasks = tickets.filter(ticket => ticket.type === 'task');
const worklogs = tasks.flatMap(ticket => ticket.worklogs ?? []);
const hours = worklogs.reduce((sum, log) => sum + Number(log.hours ?? 0), 0);
const cost = worklogs.reduce((sum, log) => sum + Number(log.netAmount ?? 0), 0);
if (tasks.length !== 19) fail('TASK-COUNT', `erwartet 19, gefunden ${tasks.length}`);
if (worklogs.length !== 19) fail('WORKLOG-COUNT', `erwartet 19, gefunden ${worklogs.length}`);
if (hours !== 80 || cost !== 9600) fail('BILLING', `${hours} Stunden / ${cost} EUR`);
if (tickets.filter(ticket => ticket.status === 'closed').length !== 50) fail('CLOSED-COUNT', 'alle 50 Tickets müssen closed sein');
for (const [section, variants] of sectionVariants) for (const [variant, count] of variants) if (count > 3) fail('BOILERPLATE', `${section}: identischer Abschnitt ${count}-mal`);
const dataWorkshop = tickets.find(ticket => ticket.id === 'UABC-32');
const sectionText = (ticket, section) => { const index = required.indexOf(section); const next = required[index + 1]; const start = ticket.description.indexOf(section) + section.length; const end = next ? ticket.description.indexOf(next, start) : ticket.description.length; return ticket.description.slice(start, end); };
if (!/Datenquellen|Feldlisten|Dateiformate|Owner/.test(sectionText(dataWorkshop, 'Voraussetzungen und Rollen')) || !/Feldmapping|Qualitätschecks|Freigabe/.test(sectionText(dataWorkshop, 'Durchführung')) || !/Freigabe/.test(sectionText(dataWorkshop, 'Ergebnis und Akzeptanz'))) fail('SEMANTICS-DATAWORKSHOP', 'UABC-32 benötigt in passenden Abschnitten Datenquellen, Felder, Format, Owner, Qualität und Freigabe');
const hypercare = tickets.find(ticket => ticket.id === 'UABC-46');
if (hypercare?.phase !== 'P3' || !/Hypercare-Tage|Incident-Priorität|Reaktionszeit|Fix|Retest/.test(sectionText(hypercare, 'Durchführung')) || !/Restart|Exit/.test(sectionText(hypercare, 'Abhängigkeiten, Risiken und Übergabe'))) fail('SEMANTICS-HYPERCARE', 'UABC-46 muss in passenden Abschnitten Hypercare-Tage, Incident, Reaktion, Fix/Retest, Restart und Exit beschreiben');
const handover = tickets.find(ticket => ticket.id === 'UABC-50');
if (!/synthetische Handover-Abnahme ist abgeschlossen/.test(sectionText(handover, 'Ergebnis und Akzeptanz')) || !/acht realen Kundengates/.test(sectionText(handover, 'Ergebnis und Akzeptanz')) || !/acht reale Kundengates/i.test(sectionText(handover, 'Evidence, Test und Readback'))) fail('SEMANTICS-HANDOVER', 'UABC-50 muss den synthetischen Abschluss und nur die acht realen Gates offen ausweisen');
if (errors.length) { console.error(`V2-Ticketqualitätsprüfung fehlgeschlagen (${errors.length}):`); errors.forEach(error => console.error(`- ${error}`)); process.exit(1); }
console.log(`V2-Ticketqualitätsprüfung bestanden: ${tickets.length} eindeutige Summaries, ${descriptions.size} projektspezifische Beschreibungen, ${tasks.length} Tasks, ${hours} Stunden, ${cost} EUR.`);

import fs from 'node:fs';
import YAML from 'yaml';

const story = JSON.parse(fs.readFileSync('evidence/simulation/project-story.json', 'utf8'));
const path = 'atlassian/jira/issues/bc-basic-story-tickets.yaml';
const exportData = YAML.parse(fs.readFileSync(path, 'utf8'));
const byId = new Map(story.tickets.map(ticket => [ticket.id, ticket]));
const records = exportData.ticketRecords ?? [];
if (records.length !== story.tickets.length) throw new Error(`Jira-Projektion ${records.length} und Story ${story.tickets.length} weichen ab.`);

for (const record of records) {
  const ticket = byId.get(record.id);
  if (!ticket) throw new Error(`Jira-Projektion enthält unbekanntes Ticket ${record.id}.`);
  Object.assign(record, {
    type: ticket.type,
    sourceType: ticket.type,
    canonicalType: ticket.type,
    parent: ticket.parent ?? null,
    childTicketIds: ticket.childTicketIds ?? [],
    dependencyRefs: ticket.dependencies ?? ticket.dependencyRefs ?? [],
    sourcePath: 'evidence/simulation/project-story.json',
    status: ticket.status,
    statusReason: ticket.statusReason,
    summary: ticket.summary,
    title: ticket.title,
    description: ticket.description,
    deliverable: ticket.deliverable,
    deliverableRefs: ticket.deliverableRefs ?? [],
    pageRefs: ticket.pageRefs ?? [],
    decisionRefs: ticket.decisionRefs ?? [],
    meetingTranscriptRefs: ticket.meetingTranscriptRefs ?? [],
    phaseId: ticket.phaseId,
    phaseRefs: ticket.phaseRefs ?? [],
    phase: ticket.phase,
    billable: ticket.billable === true,
    billingSource: ticket.billingSource,
    estimateHours: ticket.estimateHours,
    actualHours: ticket.actualHours,
    remainingHours: ticket.remainingHours,
    acceptance: ticket.acceptanceCriteria ?? [],
    history: ticket.statusHistory ?? [],
    worklogs: ticket.worklogs ?? [],
    worklogHours: (ticket.worklogs ?? []).reduce((sum, log) => sum + Number(log.hours ?? 0), 0),
    evidence: ticket.evidenceRefs ?? [],
    comments: ticket.comments ?? []
  });
}
exportData.classification = 'synthetic-canonical-project-v2';
exportData.sourceContract = 'evidence/simulation/project-story.json';
exportData.generated = true;
exportData.generatedAt = '2026-07-14T00:00:00.000Z';
exportData.recordCount = records.length;
exportData.customerStoryCount = records.length;
exportData.countedWorklogHours = records.reduce((sum, ticket) => sum + Number(ticket.worklogHours ?? 0), 0);
fs.writeFileSync(path, YAML.stringify(exportData), 'utf8');
console.log(`Jira-V2-Projektion erzeugt: ${records.length} Tickets, ${exportData.countedWorklogHours} Worklogstunden.`);

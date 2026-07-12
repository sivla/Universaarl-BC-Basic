import fs from 'node:fs';
import YAML from 'yaml';

const storyPath = 'evidence/simulation/project-story.json';
const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
const oldTickets = structuredClone(story.tickets);
const byId = new Map(oldTickets.map((t) => [t.id, t]));
const phases = [
  ['UABC-1', 'P1', 'Phase 1 – Vorbereitung und Datenbereitschaft', 1, '2026-04-06', '2026-04-24'],
  ['UABC-2', 'P2', 'Phase 2 – Einrichtung, Tests und Schulung', 2, '2026-04-27', '2026-05-22'],
  ['UABC-3', 'P3', 'Phase 3 – Hypercare und Abschluss', 3, '2026-05-25', '2026-05-29']
];
const epicDefs = [
  ['UABC-4', 'P1', 'Projektinitiierung und Discovery'], ['UABC-5', 'P1', 'Finance- und Lösungsdesign'], ['UABC-6', 'P1', 'Datenbereitschaft'],
  ['UABC-7', 'P2', 'BC-Grundeinrichtung und Finance'], ['UABC-8', 'P2', 'Stammdaten und Migration'], ['UABC-9', 'P2', 'Einkaufs-, Verkaufs- und Lagerprozesse'], ['UABC-10', 'P2', 'Schulung und Abnahme'],
  ['UABC-11', 'P3', 'Hypercare und Stabilisierung'], ['UABC-12', 'P3', 'Finance-Abschluss'], ['UABC-13', 'P3', 'Dokumentation und Betriebsübergabe']
];
const storyMap = {
  'TKT-UABC-STORY-P1-PROJECT':['UABC-14','UABC-4'], 'TKT-UABC-STORY-P1-ACCEPTANCE':['UABC-15','UABC-4'], 'TKT-UABC-STORY-P1-FINANCE':['UABC-16','UABC-5'],
  'TKT-UABC-STORY-P1-PURCHASING':['UABC-17','UABC-5'], 'TKT-UABC-STORY-P1-SALES':['UABC-18','UABC-5'], 'TKT-UABC-STORY-P1-INVENTORY':['UABC-19','UABC-5'], 'TKT-UABC-STORY-P1-DATA':['UABC-20','UABC-6'],
  'TKT-UABC-STORY-P2-FOUNDATION':['UABC-21','UABC-7'], 'TKT-UABC-STORY-P2-FINANCE':['UABC-22','UABC-7'], 'TKT-UABC-STORY-P2-DATA':['UABC-23','UABC-8'],
  'TKT-UABC-STORY-P2-PURCHASING':['UABC-24','UABC-9'], 'TKT-UABC-STORY-P2-SALES':['UABC-25','UABC-9'], 'TKT-UABC-STORY-P2-INVENTORY':['UABC-26','UABC-9'],
  'TKT-UABC-STORY-P2-TRAINING':['UABC-27','UABC-10'], 'TKT-UABC-STORY-P2-UAT':['UABC-28','UABC-10'], 'TKT-UABC-BUG-P3-PAYMENT':['UABC-29','UABC-11'],
  'TKT-UABC-STORY-P3-CLOSE':['UABC-30','UABC-12'], 'TKT-UABC-STORY-P3-HANDOVER':['UABC-31','UABC-13']
};
const taskMap = {
  'TKT-UABC-22':['UABC-32','UABC-14'], 'TKT-UABC-26':['UABC-33','UABC-15'], 'TKT-UABC-23':['UABC-34','UABC-16'],
  'TKT-UABC-24':['UABC-35','UABC-17'], 'TKT-UABC-24-SALES':['UABC-36','UABC-18'], 'TKT-UABC-24-INVENTORY':['UABC-37','UABC-19'], 'TKT-UABC-25':['UABC-38','UABC-20'],
  'TKT-UABC-27':['UABC-39','UABC-21'], 'TKT-UABC-28':['UABC-40','UABC-22'], 'TKT-UABC-29':['UABC-41','UABC-23'], 'TKT-UABC-30':['UABC-42','UABC-24'],
  'TKT-UABC-31':['UABC-43','UABC-25'], 'TKT-UABC-32':['UABC-44','UABC-26'], 'TKT-UABC-33':['UABC-45','UABC-27'], 'TKT-UABC-34':['UABC-46','UABC-28'],
  'TKT-UABC-35':['UABC-47','UABC-29'], 'TKT-UABC-36':['UABC-48','UABC-30'], 'TKT-UABC-37':['UABC-49','UABC-30'], 'TKT-UABC-38':['UABC-50','UABC-31']
};
const oldEpicToNew = {
  'TKT-UABC-EPIC-PROJECT':'UABC-4', 'TKT-UABC-EPIC-FINANCE':'UABC-5', 'TKT-UABC-EPIC-PURCHASING':'UABC-9', 'TKT-UABC-EPIC-SALES':'UABC-9',
  'TKT-UABC-EPIC-INVENTORY':'UABC-9', 'TKT-UABC-EPIC-DATA':'UABC-8', 'TKT-UABC-EPIC-ENABLEMENT':'UABC-10', 'TKT-UABC-EPIC-TRANSITION':'UABC-11'
};
const phaseByCode = new Map(phases.map(([id, code, title, order, start, end]) => [code, { id, code, title, order, start, end }]));
const targetStories = [];
for (const [oldId, [id, epic]] of Object.entries(storyMap)) {
  const src = byId.get(oldId); if (!src) throw new Error(`fehlende Storyquelle ${oldId}`);
  const phase = phaseByCode.get(src.phase);
  targetStories.push({ ...src, id, type:'story', parent:epic, phaseId:phase.id, phase:phase.code, phaseRefs:undefined, billable:false, billingSource:'task-rollup-only', worklogs:[], comments:[], estimateHours:0, actualHours:0, remainingHours:0, netAmount:0, deliverable:src.deliverable || src.summary });
}
const targetTasks = [];
for (const [oldId, [id, parent]] of Object.entries(taskMap)) {
  const src = byId.get(oldId); if (!src) throw new Error(`fehlende Taskquelle ${oldId}`);
  const phase = phaseByCode.get(src.phase);
  const cloned = { ...src, id, parent, phaseId:phase.id, phase:phase.code, billable:true, billingSource:'task-worklogs', hourlyRate:120, netAmount:(src.actualHours||0)*120,
    category: src.category || 'fachliche BC-Basic-Leistung', participants: src.participants || ['P-002','P-003'], dependencies: src.dependencies || [],
    meetingTranscriptRefs: src.meetingTranscriptRefs || ['UABC-MTG-001'], deliverable: src.deliverable || src.summary };
  cloned.worklogs = (src.worklogs || []).map((w,i)=>({...w,id:`WL-${id}-${String(i+1).padStart(2,'0')}`,taskId:id}));
  cloned.comments = (src.comments || []).map((c,i)=>({...c,id:`COM-${id}-${c.type==='closing'?'C':'W'}-${i+1}`}));
  targetTasks.push(cloned);
}
const taskForOld = new Map(Object.entries(taskMap).map(([old,[id]])=>[old,id]));
const targetEpics = epicDefs.map(([id, code, summary]) => {
  const children = targetStories.filter(s => s.parent === id);
  const src = oldTickets.find(t => t.type === 'epic' && oldEpicToNew[t.id] === id) || oldTickets.find(t => t.type === 'epic');
  const phase = phaseByCode.get(code);
  const hours = children.reduce((n,s)=>n+targetTasks.filter(t=>t.parent===s.id).reduce((m,t)=>m+(t.actualHours||0),0),0);
  return { ...(src||{}), id, type:'epic', summary, description:`Fachlicher Arbeitsstrang: ${summary}.`, parent:phase.id, phaseId:phase.id, phase:code, phaseRefs:[phase.id], billable:false, billingSource:'task-rollup-only', estimateHours:hours, actualHours:hours, remainingHours:0, hourlyRate:null, netAmount:hours*120, worklogs:[], comments:[], deliverable:summary };
});
const phaseTickets = phases.map(([id,code,title,order,start,end]) => ({ ...((byId.get(`UABC-PHASE-${order}`))||{}), id, type:'phase', code, title, order, summary:title, description:`Phasenticket ${title}.`, deliverable:title, phaseId:id, phase:code, parent:null, billable:false, billingSource:'task-rollup-only', hourlyRate:null, worklogs:[], comments:[], start, end,
  estimateHours:targetTasks.filter(t=>t.phase===code).reduce((n,t)=>n+(t.estimateHours||0),0), actualHours:targetTasks.filter(t=>t.phase===code).reduce((n,t)=>n+(t.actualHours||0),0), remainingHours:0, netAmount:targetTasks.filter(t=>t.phase===code).reduce((n,t)=>n+(t.actualHours||0)*120,0), epicIds:targetEpics.filter(e=>e.parent===id).map(e=>e.id) }));
for (const t of [...targetStories,...targetEpics]) { const children=targetTasks.filter(x=>x.parent===t.id); t.estimateHours=children.reduce((n,x)=>n+(x.estimateHours||0),0); t.actualHours=children.reduce((n,x)=>n+(x.actualHours||0),0); t.netAmount=t.actualHours*120; }
const active = [...phaseTickets,...targetEpics,...targetStories,...targetTasks];
if (active.length !== 50 || new Set(active.map(t=>t.id)).size !== 50) throw new Error('aktiver Bestand nicht 50');
const oldIds = oldTickets.map(t=>t.id);
const historical = ['UABC-18','UABC-19','UABC-20','UABC-21','UABC-22','UABC-23','UABC-24','UABC-25','UABC-26','UABC-27','UABC-28','UABC-29','UABC-30','UABC-31','UABC-32','UABC-33','UABC-34','UABC-35','UABC-36','UABC-37','UABC-38','UABC-1','UABC-2','UABC-3','UABC-4','UABC-5','UABC-6','UABC-7','UABC-8','UABC-9','UABC-10','UABC-11','UABC-12','UABC-13','UABC-14','UABC-15','UABC-16','UABC-17'];
const targetFor = new Map([...Object.entries(storyMap).map(([k,v])=>[k,v[0]]),...Object.entries(taskMap).map(([k,v])=>[k,v[0]]),...Object.entries(oldEpicToNew)]);
targetFor.set('UABC-PHASE-1', 'UABC-1');
targetFor.set('UABC-PHASE-2', 'UABC-2');
targetFor.set('UABC-PHASE-3', 'UABC-3');
const migration = [...oldIds.map(sourceId => ({ sourceId, sourceKind:'previous-active-ticket', targetId:targetFor.get(sourceId) || (sourceId.startsWith('TKT-UABC-EPIC-') ? oldEpicToNew[sourceId] : null), targetKind:'active-ticket', decision:'fachliche Migration mit erhaltener Evidence' })),
  ...historical.map(sourceId => ({ sourceId, sourceKind:'historical-traceability', targetId: sourceId==='UABC-18'?'project/bc-basic/billing.yaml':(sourceId==='UABC-1'?'atlassian/confluence/pages/30-blueprint.md':'project/bc-basic/ticket-migration.yaml'), targetKind: sourceId==='UABC-18'?'non-ticket-provenance':'non-ticket-provenance', decision:'historische Provenienz, keine aktive Ticketquelle' }))];
if (migration.length !== 86) throw new Error(`Migration ${migration.length} statt 86`);
story.tickets = active;
story.ticketMigration = migration;
story.controls = { ...story.controls, activeTicketCount:50, activeTicketIdRange:'UABC-1..UABC-50', phaseCount:3, epicCount:10, storyCount:18, taskCount:19, internalTraceabilityCount:0, billableTicketCount:19, planHours:80, actualHours:80, netAmount:9600, phaseHours:{P1:22,P2:40,P3:18}, ticketSource:'evidence/simulation/project-story.json', historicalTicketSource:'provenance-only' };
story.classification = 'synthetic-only';
const activeMigrationMap = new Map(migration.filter((row) => row.targetKind === 'active-ticket').map((row) => [row.sourceId, row.targetId]));
const legacyPattern = /\b(?:TKT-UABC-[A-Z0-9-]+|UABC-PHASE-\d+)\b/g;
const migrateActive = (value) => {
  if (Array.isArray(value)) { for (let index = 0; index < value.length; index++) value[index] = typeof value[index] === 'object' && value[index] !== null ? (migrateActive(value[index]), value[index]) : migrateString(value[index]); return; }
  if (value && typeof value === 'object') for (const key of Object.keys(value)) value[key] = typeof value[key] === 'object' && value[key] !== null ? (migrateActive(value[key]), value[key]) : migrateString(value[key]);
};
const migrateString = (value) => typeof value === 'string' ? value.replace(legacyPattern, (sourceId) => {
  const targetId = activeMigrationMap.get(sourceId);
  if (!targetId) throw new Error(`Aktive Alt-ID ${sourceId} besitzt kein Migrationsziel`);
  return targetId;
}) : value;
for (const [key, value] of Object.entries(story)) if (key !== 'ticketMigration') migrateActive(value);
fs.writeFileSync(storyPath, JSON.stringify(story,null,2)+'\n');
fs.writeFileSync('project/bc-basic/ticket-migration.yaml', YAML.stringify({ schemaVersion:1, migrationId:'UABC-TICKET-MIGRATION-2026-07-12', sourceCount:86, activeTargetRange:'UABC-1..UABC-50', activeTargetCount:50, policy:'alte IDs nur in dieser Provenienzmatrix; keine parallele Ticket-/Billingwahrheit', records:migration }));
console.log(`UABC-Migration erzeugt: ${active.length} Tickets, ${migration.length} Provenienzrecords, 80h/9600 EUR.`);

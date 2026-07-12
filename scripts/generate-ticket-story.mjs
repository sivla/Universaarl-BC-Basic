import fs from 'node:fs';
import { EPIC_DEFINITIONS, PHASES, RESULT_DEFINITIONS, TASK_PARENT } from './lib/ticket-hierarchy.mjs';

const path = 'evidence/simulation/project-story.json';
const story = JSON.parse(fs.readFileSync(path, 'utf8'));
const priorTasks = new Map(story.tickets.filter((ticket) => /^TKT-UABC-(2[2-9]|3[0-8])$/.test(ticket.id)).map((ticket) => [ticket.id, ticket]));
const original24 = priorTasks.get('TKT-UABC-24');
if (!original24) throw new Error('TKT-UABC-24 fehlt als Migrationsquelle');
const split24 = [
  ['TKT-UABC-24',1.5,'Einkaufs-Fit-to-Standard entscheiden','Einkaufsstandard und Ausnahmen sind entschieden'],
  ['TKT-UABC-24-SALES',1.5,'Verkaufs-Fit-to-Standard entscheiden','Verkaufsstandard und Ausnahmen sind entschieden'],
  ['TKT-UABC-24-INVENTORY',1,'Lager-Fit-to-Standard entscheiden','Lagerstandard und Ausnahmen sind entschieden']
];
for (const [id,hours,summary,deliverable] of split24) {
  const task = structuredClone(original24);
  task.id=id; task.summary=summary; task.description=`Abrechenbare Kundenleistung: ${summary}.`; task.deliverable=deliverable;
  task.actualHours=hours; task.estimateHours=hours; task.remainingHours=0; task.netAmount=hours*120; task.parent=TASK_PARENT[id];
  task.worklogs=[{...task.worklogs[0],id:`WL-${id}-01`,taskId:id,hours,netAmount:hours*120,activity:summary}];
  task.comments=task.comments.map((comment,index)=>({...comment,id:`COM-${id.replace('TKT-UABC-','')}-${index?'C':'W'}`,text:index?`${deliverable}. Ergebnis synthetisch abgenommen; Evidence und nächster Bezug dokumentiert.`:`${summary} bearbeitet.`}));
  priorTasks.set(id,task);
}
priorTasks.get('TKT-UABC-24').worklogs[0].phase='P1';
const resultById=new Map(RESULT_DEFINITIONS.map((item)=>[item[0],item]));
for (const task of priorTasks.values()) { const result=resultById.get(TASK_PARENT[task.id]); task.parent=TASK_PARENT[task.id]; task.phaseId=result[3]; task.phase=PHASES.find((phase)=>phase.id===result[3]).code; }
const taskHours=(ids)=>ids.reduce((sum,id)=>sum+(priorTasks.get(id)?.actualHours??0),0);
const results=RESULT_DEFINITIONS.map(([id,type,parent,phaseId,summary,tasks])=>{ const hours=taskHours(tasks); const phase=PHASES.find((item)=>item.id===phaseId); return {id,type,summary,description:`Nicht fakturierbare fachliche Ergebnisklammer: ${summary}.`,deliverable:summary,phaseId,phase:phase.code,billable:false,billingSource:'task-rollup-only',estimateHours:hours,actualHours:hours,remainingHours:0,hourlyRate:null,netAmount:hours*120,status:'done',reporter:'P-002',assignee:type==='bug'?'P-005':'P-003',priority:type==='bug'?'P2':'P1',parent,dependencies:[],labels:['kundenprojekt',phase.code.toLowerCase(),type],components:['BC Basic'],createdAt:phase.start,startedAt:phase.start,testedAt:phase.end,closedAt:phase.end,statusHistory:[{status:'created',time:phase.start},{status:'in-progress',time:phase.start},{status:'tested',time:phase.end},{status:'done',time:phase.end}],acceptanceCriteria:[{criterion:`${summary}.`,fulfilled:true}],evidenceRefs:tasks.flatMap((task)=>priorTasks.get(task)?.evidenceRefs??[]).filter((value,index,array)=>array.indexOf(value)===index),comments:[],worklogs:[]}; });
const resultMap=new Map(results.map((item)=>[item.id,item]));
const epics=EPIC_DEFINITIONS.map(([id,summary])=>{ const children=results.filter((result)=>result.parent===id); const hours=children.reduce((sum,result)=>sum+result.actualHours,0); const phaseRefs=[...new Set(children.map((result)=>result.phaseId))]; return {id,type:'epic',summary,description:`Nicht fakturierbarer fachlicher Arbeitsstrang: ${summary}.`,deliverable:summary,phaseId:null,phaseRefs,billable:false,billingSource:'task-rollup-only',estimateHours:hours,actualHours:hours,remainingHours:0,hourlyRate:null,netAmount:hours*120,status:'done',reporter:'P-002',assignee:'P-003',priority:'P1',parent:phaseRefs[0],dependencies:[],labels:['kundenprojekt','fachlicher-arbeitsstrang'],components:['BC Basic'],createdAt:PHASES.find((phase)=>phase.id===phaseRefs[0]).start,startedAt:PHASES.find((phase)=>phase.id===phaseRefs[0]).start,testedAt:PHASES.find((phase)=>phase.id===phaseRefs.at(-1)).end,closedAt:PHASES.find((phase)=>phase.id===phaseRefs.at(-1)).end,statusHistory:[{status:'created',time:PHASES.find((phase)=>phase.id===phaseRefs[0]).start},{status:'in-progress',time:PHASES.find((phase)=>phase.id===phaseRefs[0]).start},{status:'tested',time:PHASES.find((phase)=>phase.id===phaseRefs.at(-1)).end},{status:'done',time:PHASES.find((phase)=>phase.id===phaseRefs.at(-1)).end}],acceptanceCriteria:[{criterion:`Alle fachlichen Ergebnisse für ${summary} sind synthetisch abgenommen.`,fulfilled:true}],evidenceRefs:children.flatMap((child)=>child.evidenceRefs).filter((value,index,array)=>array.indexOf(value)===index),comments:[],worklogs:[]}; });
const phaseTickets=PHASES.map((phase)=>({...phase,type:'phase',summary:phase.title,description:`Nicht fakturierbares Phasen-Ticket fuer ${phase.title}.`,deliverable:phase.title,phaseId:phase.id,phase:phase.code,phaseRefs:[phase.id],billable:false,billingSource:'task-rollup-only',hourlyRate:null,parent:null,reporter:'P-002',assignee:'P-003',priority:'P1',dependencies:[],labels:['kundenprojekt','phase'],components:['BC Basic'],createdAt:phase.start,startedAt:phase.start,testedAt:phase.end,closedAt:phase.end,statusHistory:[{status:'created',time:phase.start},{status:'in-progress',time:phase.start},{status:'tested',time:phase.end},{status:'done',time:phase.end}],acceptanceCriteria:[{criterion:`${phase.title} ist synthetisch abgeschlossen.`,fulfilled:true}],evidenceRefs:[],comments:[],worklogs:[],epicIds:epics.filter((epic)=>epic.phaseRefs.includes(phase.id)).map((epic)=>epic.id)}));
delete story.phases;
story.tickets=[...phaseTickets,...epics,...results,...priorTasks.values()];
story.ticketMigration=[...priorTasks.values()].map((task)=>({legacyTicketId:task.id.startsWith('TKT-UABC-24-')?'TKT-UABC-24':task.id,legacyType:task.id.startsWith('TKT-UABC-24')?'story':task.type,newTicketId:task.id,newType:'task',parentId:task.parent,phaseId:task.phaseId,worklogId:task.worklogs[0].id,hours:task.actualHours}));
fs.writeFileSync(path,`${JSON.stringify(story,null,2)}\n`);
console.log(`Ticketstory erzeugt: ${phaseTickets.length} Phase-Tickets, ${epics.length} fachliche Epics, ${results.length} Stories/Bugs, ${priorTasks.size} Tasks, 80 Stunden.`);

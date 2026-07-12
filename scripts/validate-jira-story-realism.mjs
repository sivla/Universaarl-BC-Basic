import fs from 'node:fs';
import YAML from 'yaml';

const ALLOWED=new Set(['human','simulated-customer-role','codex-spectra','playwright','system-automation']);
const GENERIC=[/^Phasenticket /,/^Fachlicher Arbeitsstrang:/,/^Nicht fakturierbare fachliche Ergebnisklammer:/,/^Abrechenbare Kundenleistung:/,/ bearbeitet$/];
export function validateRealism(story,register,context={}){
 const errors=[];const fail=(code,detail)=>errors.push(`${code}: ${detail}`);
 const actors=register?.actors??[];const actorById=new Map(actors.map(a=>[a.personId,a]));
 if(actors.length<5||actorById.size!==actors.length||actors.some(a=>!ALLOWED.has(a.actorType)||!a.displayName||!a.organization||!a.activeRoles?.length||!Array.isArray(a.allowedApprovalRoles)))fail('AKTEUR-REGISTER','Akteure sind unvollstaendig oder besitzen unbekannten Typ');
 const lead=actorById.get('P-PILOT-LEAD-001');if(!lead||lead.displayName!=='Kajetan Kalicki'||lead.actorType!=='human'||!['Projektleitung','Lead BC Consultant','Solution Architect'].every(r=>lead.activeRoles.includes(r)))fail('PILOT-LEAD','reale Projektverantwortung ist nicht eindeutig');
 const known=new Set(actorById.keys()); const meetings=new Map((context.meetings?.meetings??[]).map(m=>[m.id,m]));const decisions=new Set([context.decisions?.registerId,...(context.decisions?.decisions??[]).map(d=>d.id)].filter(Boolean));const deliverables=new Map((context.deliverables?.deliverables??[]).map(d=>[d.id,d]));const resultObjects=new Map((context.resultCatalog?.objects??[]).map(o=>[o.objectId,o]));
 const action=(record,where)=>{if(!known.has(record?.actorRef))fail('AKTEUR-UNBEKANNT',where);if(!ALLOWED.has(record?.actorType)||record.actorType!==actorById.get(record?.actorRef)?.actorType)fail('AKTEUR-TYP',where);if(!record?.actionRole)fail('AKTIONSROLLE-FEHLT',where);if(record.actorType!=='human'&&/(freigegeben|abgenommen|entschieden)/i.test(record.text??record.result??''))fail('AUTOMATION-ALS-MENSCH',where);};
 if((story?.tickets??[]).length!==50)fail('TICKET-ANZAHL','50 erforderlich');
 for(const ticket of story?.tickets??[]){
  if(!known.has(ticket.reporter)||!known.has(ticket.assignee)||!ticket.reporterRole||!ticket.assigneeRole)fail('TICKET-AKTEUR',ticket.id);
  if(!ticket.description||ticket.description.length<120||GENERIC.some(p=>p.test(ticket.description)))fail('TICKET-TEXT-GENERISCH',ticket.id);
  if(!ticket.statusReason||!ticket.decisionRefs?.length||!Array.isArray(ticket.childTicketIds))fail('TICKET-KONTEXT-FEHLT',ticket.id);
  if(ticket.type!=='task'&&(/ist mit erfuellten Akzeptanzkriterien und referenziertem Nachweis synthetisch abgeschlossen/.test(ticket.statusReason)||ticket.comments?.[0]?.text===`${ticket.deliverable} ist mit erfuellten Akzeptanzkriterien und referenziertem Nachweis synthetisch abgeschlossen.`))fail('ELTERN-STATUS-SCHABLONE',ticket.id);
  if(decisions.size&&ticket.decisionRefs.some(id=>!decisions.has(id)))fail('ENTSCHEIDUNG-UNBEKANNT',ticket.id);
  const times=[ticket.createdAt,ticket.startedAt,ticket.testedAt,ticket.closedAt];if(times.some(t=>t<'2026-04-01'||t>'2026-05-31')||times.some((t,i)=>i&&t<times[i-1]))fail('TICKET-CHRONOLOGIE',ticket.id);
  for(const record of ticket.statusHistory??[])action(record,`${ticket.id}.statusHistory`);
  for(const record of ticket.comments??[])action(record,`${ticket.id}.comments`);
  for(const record of ticket.worklogs??[])action(record,`${ticket.id}.worklogs`);
  if(ticket.type==='task'){
   if(!ticket.billable||ticket.worklogs?.length!==1||ticket.comments?.filter(c=>c.type==='closing').length!==1||ticket.evidenceRefs?.length===0||ticket.deliverableRefs?.length===0||ticket.pageRefs?.length===0||ticket.meetingTranscriptRefs?.length===0)fail('TASK-MINDESTVERTRAG',ticket.id);
   if(meetings.size&&ticket.meetingTranscriptRefs.some(id=>!meetings.has(id)))fail('TRANSKRIPT-UNBEKANNT',ticket.id);
   if(deliverables.size&&ticket.deliverableRefs.some(id=>!deliverables.has(id)))fail('LIEFEROBJEKT-UNBEKANNT',ticket.id);
   const close=ticket.comments.find(c=>c.type==='closing');if(!/Evidence|Retest|Test/.test(close?.text??'')||!close?.evidenceRef)fail('TASK-CLOSING',ticket.id);
  }else if(ticket.worklogs?.length)fail('ELTERN-WORKLOG',ticket.id);
 }
 const taskHours=story.tickets.filter(t=>t.type==='task').flatMap(t=>t.worklogs).reduce((s,w)=>s+w.hours,0);const taskCost=story.tickets.filter(t=>t.type==='task').flatMap(t=>t.worklogs).reduce((s,w)=>s+w.netAmount,0);if(taskHours!==80||taskCost!==9600)fail('ABRECHNUNG',`${taskHours}/${taskCost}`);
 const payStory=story.tickets.find(t=>t.id==='UABC-29');const payTask=story.tickets.find(t=>t.id==='UABC-47');if(!/Symptom|symptom/.test(payStory?.description??'')||!['Ursache','Referenz','Retest'].every(k=>(payTask?.description??'').includes(k)))fail('ZAHLUNGSREFERENZ','Symptom, Ursache, Fix und Retest fehlen');
 for(const item of deliverables.values()){const result=resultObjects.get(item.id);const exists=item.resultPath&&fs.existsSync(item.resultPath);const readable=exists&&fs.statSync(item.resultPath).isFile()&&fs.statSync(item.resultPath).size>200;if(!result||result.classification!=='customer-deliverable'||!item.resultPath||item.resultPath!==result.resultPath||/^(evidence|exports|scripts)\//.test(item.resultPath)||!readable)fail('LIEFERERGEBNIS-NICHT-LESBAR',item.id);}
 return errors;
}
if(process.argv[1]?.endsWith('validate-jira-story-realism.mjs')){const read=y=>YAML.parse(fs.readFileSync(y,'utf8'));const story=JSON.parse(fs.readFileSync('evidence/simulation/project-story.json','utf8'));const register=read('project/bc-basic/actor-register.yaml');const errors=validateRealism(story,register,{meetings:read('atlassian/confluence/meetings/index.yaml'),decisions:read('project/bc-basic/decision-register.yaml'),deliverables:read('project/bc-basic/deliverables.yaml'),resultCatalog:read('project/bc-basic/result-object-catalog.yaml')});if(errors.length){console.error(`Jira-Realismuspruefung fehlgeschlagen (${errors.length}):`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1)}console.log(`Jira-Realismuspruefung bestanden: ${story.tickets.length} Tickets, ${register.actors.length} Akteure, 19 Task-Worklogs, 80h/9.600 EUR.`);}

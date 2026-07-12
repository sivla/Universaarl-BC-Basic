import fs from 'node:fs';
const path='evidence/simulation/project-story.json'; const story=JSON.parse(fs.readFileSync(path,'utf8'));
const map=new Map((story.ticketMigration||[]).filter(x=>x.targetKind==='active-ticket'&&x.targetId).map(x=>[x.sourceId,x.targetId]));
for(const [oldId,newId] of [['UABC-PHASE-1','UABC-1'],['UABC-PHASE-2','UABC-2'],['UABC-PHASE-3','UABC-3']]) map.set(oldId,newId);
const tickets=story.tickets; const by=new Map(tickets.map(t=>[t.id,t]));
const phases=tickets.filter(t=>t.type==='phase'); const epics=tickets.filter(t=>t.type==='epic'); const stories=tickets.filter(t=>t.type==='story'); const tasks=tickets.filter(t=>t.type==='task');
for(const p of phases){ const old=`UABC-PHASE-${p.order}`; p.phaseId=p.id; p.phaseRefs=[p.id]; p.epicIds=epics.filter(e=>e.phaseId===p.id).map(e=>e.id); p.actualHours=tasks.filter(t=>t.phase===p.code).reduce((n,t)=>n+t.actualHours,0); p.estimateHours=p.actualHours; p.netAmount=p.actualHours*120; }
for(const e of epics){ e.phaseRefs=[e.phaseId]; const children=stories.filter(s=>s.parent===e.id); e.actualHours=children.reduce((n,s)=>n+tasks.filter(t=>t.parent===s.id).reduce((m,t)=>m+t.actualHours,0),0); e.estimateHours=e.actualHours; e.netAmount=e.actualHours*120; }
for(const s of stories){ const children=tasks.filter(t=>t.parent===s.id); s.actualHours=children.reduce((n,t)=>n+t.actualHours,0); s.estimateHours=s.actualHours; s.netAmount=s.actualHours*120; }
for(const t of tasks){ t.phaseId=by.get(t.parent)?.phaseId ?? t.phaseId; t.phase=by.get(t.parent)?.phase ?? t.phase; t.billingSource='task-worklogs'; t.worklogs=(t.worklogs||[]).map((w,i)=>({...w,taskId:t.id,id:`WL-${t.id}-${String(i+1).padStart(2,'0')}`})); }
const legacyPattern=/\b(?:TKT-UABC-[A-Z0-9-]+|UABC-PHASE-\d+)\b/g;
const replace=(value)=>typeof value==='string'?value.replace(legacyPattern,(sourceId)=>{const targetId=map.get(sourceId);if(!targetId)throw new Error(`Aktive Alt-ID ${sourceId} besitzt kein Migrationsziel`);return targetId;}):value;
const migrateActive=(value)=>{if(Array.isArray(value)){for(let index=0;index<value.length;index++)value[index]=typeof value[index]==='object'&&value[index]!==null?(migrateActive(value[index]),value[index]):replace(value[index]);return;}if(value&&typeof value==='object')for(const key of Object.keys(value))value[key]=typeof value[key]==='object'&&value[key]!==null?(migrateActive(value[key]),value[key]):replace(value[key]);};
for(const event of story.timeline||[]) event.tickets=(event.tickets||[]).map(replace);
for(const day of story.hypercare||[]){ day.ticket=replace(day.ticket); const ticket=by.get(day.ticket); day.comment=ticket?.comments?.find(c=>c.type==='closing')?.id ?? day.comment; }
for(const relation of story.relations||[]){ relation.from=replace(relation.from); relation.to=replace(relation.to); }
for(const row of story.ticketMigration||[]) if(map.has(row.sourceId)) { row.targetId=map.get(row.sourceId); row.targetKind='active-ticket'; }
for(const [key,value] of Object.entries(story))if(key!=='ticketMigration')story[key]=typeof value==='object'&&value!==null?(migrateActive(value),value):replace(value);
fs.writeFileSync(path,JSON.stringify(story,null,2)+'\n'); console.log('UABC-Story normalisiert: Phasenrollups, Task-Referenzen, Timeline, Hypercare und Relationen.');

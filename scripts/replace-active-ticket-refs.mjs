import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(); const map=new Map([['UABC-PHASE-1','UABC-1'],['UABC-PHASE-2','UABC-2'],['UABC-PHASE-3','UABC-3']]);
const story=JSON.parse(fs.readFileSync('evidence/simulation/project-story.json','utf8'));
for(const row of story.ticketMigration||[]) if(row.targetKind==='active-ticket'&&row.targetId) map.set(row.sourceId,row.targetId);
const skip=new Set(['atlassian/jira/issues/bc-basic-project.yaml','atlassian/jira/issues/blueprint-wave.yaml','atlassian/jira/issues/environment-baseline.yaml','atlassian/jira/issues/walkthrough-pilot.yaml','project/bc-basic/ticket-migration.yaml','evidence/simulation/project-story.json','atlassian/jira/issues/bc-basic-story-tickets.yaml']);
const files=[]; const walk=(dir)=>{for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.relative(root,path.join(dir,ent.name)).replaceAll('\\','/'); if(ent.name==='node_modules'||ent.name==='.git'||p.startsWith('openspec/changes/archive/')) continue; if(ent.isDirectory()) walk(path.join(dir,ent.name)); else if(/\.(md|yaml|yml|json)$/.test(ent.name)&&!skip.has(p)) files.push(p);}}; walk(root);
for(const p of files){let text=fs.readFileSync(p,'utf8'); let next=text; for(const [oldId,newId] of [...map.entries()].sort((a,b)=>b[0].length-a[0].length)) next=next.split(oldId).join(newId); if(next!==text) fs.writeFileSync(p,next);}
console.log(`Aktive Referenzen aktualisiert: ${files.length} Dateien geprüft.`);

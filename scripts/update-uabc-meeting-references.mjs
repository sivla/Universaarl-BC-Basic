import fs from 'node:fs';
const path='evidence/simulation/project-story.json';
const story=JSON.parse(fs.readFileSync(path,'utf8'));
const tasks=story.tickets.filter(t=>t.type==='task');
for(const task of tasks){
  const n=Number(task.id.slice(5));
  task.meetingTranscriptRefs = n<=38 ? ['UABC-MTG-001','UABC-MTG-002'] : n<=46 ? ['UABC-MTG-002'] : ['UABC-MTG-003'];
  task.worklogs = (task.worklogs||[]).map((w,i)=>({...w,taskId:task.id,id:`WL-${task.id}-${String(i+1).padStart(2,'0')}`}));
  task.billingSource='task-worklogs';
}
story.controls={...story.controls, transcriptCoverage:{'UABC-MTG-001':'Discovery/Fit-to-Standard','UABC-MTG-002':'Setup/Migration/Prozesse/SIT/UAT/Schulung','UABC-MTG-003':'Go-live/Hypercare/Finance-Abschluss/Handover'}};
fs.writeFileSync(path,JSON.stringify(story,null,2)+'\n');
console.log(`Transkriptverweise aktualisiert: ${tasks.length} Tasks.`);

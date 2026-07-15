import fs from 'node:fs';
import YAML from 'yaml';

const readJson = file => JSON.parse(fs.readFileSync(file,'utf8'));
const readYaml = file => YAML.parse(fs.readFileSync(file,'utf8'));
const story=readJson('evidence/simulation/project-story.json');
const pilot=readYaml('project/bc-basic/pilot-v3.yaml');
const billing=readYaml('project/bc-basic/billing.yaml');
const meetings=readYaml('atlassian/confluence/meetings/index.yaml');
const ledger=readJson('evidence/simulation/pilot-v3-finance-ledger.json');
const view=readJson('exports/project-data/v1/pilot-v3-view.json');
const index=readYaml('exports/project-data/v1/index.yaml');
const errors=[]; const fail=(code,detail)=>errors.push(`${code}: ${detail}`);
const stamp=value=>Number(new Date(value));
const requiredSections=['Ausgangslage und Ziel','Im Umfang','Nicht im Umfang','Voraussetzungen und Rollen','Durchführung','Ergebnis und Akzeptanz','Lieferung und Referenzen','Nachweis, Test und Rücklesekontrolle','Aufwand und Abrechnung','Abhängigkeiten, Risiken und Übergabe'];

const tickets=story.tickets??[]; const byId=new Map(tickets.map(ticket=>[ticket.id,ticket]));
if(tickets.length!==50||new Set(tickets.map(ticket=>ticket.id)).size!==50||tickets.some(ticket=>!/^UABC-[1-9]\d*$/.test(ticket.id)))fail('TICKET-MENGE','50 eindeutige UABC-IDs erforderlich');
const expected={phase:3,epic:10,story:18,task:19}; for(const [type,count] of Object.entries(expected))if(tickets.filter(ticket=>ticket.type===type).length!==count)fail('HIERARCHIE',`${type}=${tickets.filter(ticket=>ticket.type===type).length}`);
for(const ticket of tickets){
 const parent=ticket.parent?byId.get(ticket.parent):null; const allowed={phase:[],epic:['phase'],story:['epic'],task:['story']};
 if(ticket.type==='phase'&&ticket.parent!==null)fail('PARENT',ticket.id); else if(ticket.type!=='phase'&&!allowed[ticket.type]?.includes(parent?.type))fail('PARENT',`${ticket.id}->${parent?.type}`);
 const words=ticket.summary.trim().split(/\s+/); if(words.length>3||words.length<1||ticket.title!==ticket.summary)fail('SUMMARY',ticket.id);
 if(ticket.description.length<1400||requiredSections.some(section=>!ticket.description.includes(section)))fail('BESCHREIBUNG',ticket.id);
 for(const phrase of ['offenen Planungsschritt synthetisch ausfuehren und abschliessen','zu bestaetigen','zu bestätigen'])if(ticket.description.toLowerCase().includes(phrase.toLowerCase()))fail('ALTTEXT',`${ticket.id}/${phrase}`);
 for(const field of ['customerInputs','customerRoles','consultantRoles','concreteSteps','expectedResult','specificRisk','handoff','evidenceReadback'])if(typeof ticket[field]!=='string'||ticket[field].length<20)fail('DETAIL',`${ticket.id}/${field}`);
 const lifecycle=[ticket.createdAt,ticket.startedAt,ticket.testedAt,ticket.closedAt].map(stamp); if(lifecycle.some(Number.isNaN)||lifecycle.some((value,i)=>i&&value<lifecycle[i-1]))fail('CHRONOLOGIE',ticket.id);
 if(ticket.statusHistory?.some((item,i,all)=>i&&stamp(item.time)<stamp(all[i-1].time))||ticket.statusHistory?.at(-1)?.status!=='closed')fail('STATUSHISTORIE',ticket.id);
 if(!ticket.meetingTranscriptRefs?.length||ticket.meetingTranscriptRefs.some(id=>!meetings.meetings.some(meeting=>meeting.id===id)))fail('TRANSKRIPT',ticket.id);
 if(!ticket.deliverableRefs?.length||!ticket.evidenceRefs?.length)fail('TRACEABILITY',ticket.id);
 for(const ref of ticket.meetingTranscriptRefs){const meeting=meetings.meetings.find(item=>item.id===ref);if(stamp(meeting.time)>stamp(ticket.closedAt))fail('MEETING-NACH-CLOSE',`${ticket.id}/${ref}`);if(!fs.existsSync(meeting.transcriptPath)||fs.statSync(meeting.transcriptPath).size<1000)fail('TRANSKRIPT-SUBSTANZ',ref);}
 for(const log of ticket.worklogs??[]){if(ticket.type!=='task')fail('ELTERN-WORKLOG',ticket.id);if(stamp(`${log.date}T00:00:00+02:00`)>stamp(ticket.closedAt)||log.taskId!==ticket.id||log.netAmount!==log.hours*120)fail('WORKLOG',ticket.id);}
}
if(new Set(tickets.map(ticket=>ticket.summary)).size!==50)fail('SUMMARY-DOPPELT','Summaries muessen eindeutig sein');
for(const phase of tickets.filter(ticket=>ticket.type==='phase'))if(!phase.start||!phase.end||stamp(phase.end)<stamp(phase.start))fail('PHASENENDE',phase.id);
const week=pilot.calendar?.implementationWeek; if(JSON.stringify(week?.businessDays)!==JSON.stringify(['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'])||week.start!=='2026-05-04'||week.end!=='2026-05-08')fail('EINRICHTUNGSWOCHE','exakt fuenf Arbeitstage erforderlich');

const actors=pilot.actors??[]; const kajetan=actors.find(actor=>actor.personId==='P-PILOT-LEAD-001'); if(kajetan?.actorType!=='human'||kajetan?.organization!=='Universaarl')fail('CONSULTANTROLLE','Kajetan muss reale Universaarl-Rolle bleiben');
const customerActors=actors.filter(actor=>actor.organization===pilot.customer.name); if(customerActors.length!==7||customerActors.some(actor=>actor.actorType!=='simulated-customer-role'||/bestaetigen/i.test(actor.displayName)||!actor.availabilityStatus||!actor.allowedApprovalRoles?.length))fail('KUNDENROLLEN','sieben benannte simulierte Rollen erwartet');
if((pilot.raci??[]).length<6||pilot.raci.some(row=>!row.accountable||!row.responsible)||!pilot.escalation?.P1)fail('RACI','RACI oder Eskalation unvollstaendig');
const requiredMeetings=['Kickoff','Discovery Finance','Prozessworkshop','Datenübernahme','Konfiguration','SIT-Triage','UAT','Finanzschulung','Prozessschulung','Cutover-GO','Hypercare','Handover'];
if(meetings.meetings?.length!==12||requiredMeetings.some(title=>!meetings.meetings.some(meeting=>meeting.title===title)))fail('MEETING-MENGE','12 fachlich notwendige Transkripte erwartet');
if(story.timeline?.length!==15||story.timeline.some((event,i,all)=>i&&stamp(event.time)<stamp(all[i-1].time))||new Set(story.timeline.map(event=>event.action)).size!==15)fail('TIMELINE','15 unterschiedliche chronologische Ereignisse erwartet');

const tasks=tickets.filter(ticket=>ticket.type==='task'); const worklogs=tasks.flatMap(ticket=>ticket.worklogs??[]); const hours=worklogs.reduce((sum,log)=>sum+log.hours,0); const amount=worklogs.reduce((sum,log)=>sum+log.netAmount,0);
if(worklogs.length!==19||hours!==78||amount!==9360||story.offer.planned_hours!==80||story.offer.planned_cost!==9600||hours===story.offer.planned_hours||amount>=10000)fail('PLAN-IST',`${worklogs.length}/${hours}/${amount}`);
const invoiceLines=(billing.invoices??[]).flatMap(invoice=>invoice.lines??[]); if(billing.invoices?.length!==9||invoiceLines.length!==19||new Set(invoiceLines.map(line=>line.worklogId)).size!==19||invoiceLines.reduce((sum,line)=>sum+line.netAmount,0)!==amount||invoiceLines.reduce((sum,line)=>sum+line.approvedHours,0)!==hours)fail('WOCHENRECHNUNG','Rechnungen stimmen nicht zu Task-Worklogs');
if(invoiceLines.some(line=>byId.get(line.jiraKey)?.type!=='task'))fail('DOPPELFAKTURA','Nur Tasks duerfen Rechnungszeilen erzeugen');

if(ledger.cases?.length!==7)fail('FINANZFAELLE','sieben Kernfaelle erwartet');
for(const item of ledger.cases??[]){if(!item.documents?.length||!item.pages?.length||!item.exception?.finding||item.exception.retest!=='bestanden-synthetisch')fail('FINANZSUBSTANZ',item.caseId);const differences=Object.entries(item.control??{}).filter(([key])=>/difference/i.test(key));if(differences.some(([,value])=>value!==0))fail('KONTROLLDIFFERENZ',item.caseId);}
const p2p=ledger.cases.find(item=>item.process==='P2P'); if(p2p.amounts.net+p2p.amounts.inputVat!==p2p.amounts.gross||p2p.control.debit!==p2p.control.credit)fail('P2P-RECHNUNG','P2P driftet');
const o2c=ledger.cases.find(item=>item.process==='O2C'); if(o2c.amounts.net+o2c.amounts.outputVat!==o2c.amounts.gross||o2c.control.debit!==o2c.control.credit)fail('O2C-RECHNUNG','O2C driftet');
const bank=ledger.cases.find(item=>item.process==='Bankabstimmung'); if(Number((bank.amounts.openingBalance+bank.amounts.customerPayment+bank.amounts.vendorPayment).toFixed(2))!==bank.amounts.closingBalance)fail('BANK-RECHNUNG','Bank driftet');
const vat=ledger.cases.find(item=>item.process==='UStVA-Vorschau'); if(Number((vat.amounts.outputVat-vat.amounts.inputVat).toFixed(2))!==vat.amounts.payable||!vat.limitation)fail('VAT-RECHNUNG','UStVA driftet');

const requiredView=['offerScope','roles','meetingsTrainings','tickets','weeklyInvoices','decisionsRisksDefects','spacesPages','useCasesBcSessions','tests','deliverables','evidence','hypercare','handover'];for(const field of requiredView)if(!(field in view))fail('TWIN-TYP',field);
if(view.runtime?.requiresGit!==false||view.runtime?.readOnly!==true||pilot.truthBoundary?.liveBcExecuted!==false||pilot.truthBoundary?.simulationStoreComplete!==true||pilot.truthBoundary?.continia!=='out-of-scope')fail('WAHRHEITSGRENZE','Git-free/read-only/Simulation/Continia inkonsistent');
const activePaths=new Set(index.artifacts.map(item=>item.path)); for(const path of ['atlassian/jira/issues/bc-basic-project.yaml','atlassian/jira/people.yaml'])if(activePaths.has(path))fail('ALTE-AKTIVSTRUKTUR',path);for(const path of ['project/bc-basic/pilot-v3.yaml','evidence/simulation/pilot-v3-finance-ledger.json','exports/project-data/v1/pilot-v3-view.json'])if(!activePaths.has(path))fail('V3-INDEX',path);
if(index.artifactCount!==index.artifacts.length||index.runtime?.requiresGit!==false||index.runtime?.readOnly!==true)fail('INDEX-VERTRAG','Artifactcount oder Runtime driftet');

if(errors.length){console.error(`Pilot-V3-Pruefung fehlgeschlagen (${errors.length}):`);for(const error of errors)console.error(`- ${error}`);process.exit(1);}
console.log(`Pilot-V3-Pruefung bestanden: 50 Tickets, 12 Meetings, 19 Worklogs, 9 Wochenrechnungen, 78 Stunden/9.360 EUR, 7 rechenbare BC-Faelle.`);

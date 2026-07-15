import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const root = process.cwd();
const wrapMarkdown=(value,width=118)=>{
  let frontmatter=false;
  return `${value}`.split('\n').flatMap((line,index)=>{
    if(line==='---'&&(index===0||frontmatter)){frontmatter=!frontmatter;return [line];}
    if(frontmatter||line.length<=width||/^\s*(?:#|\||-|>|<!--)/.test(line))return [line];
    const words=line.split(/\s+/);const lines=[];let current='';
    for(const word of words){if(current&&`${current} ${word}`.length>width){lines.push(current);current=word;}else current=current?`${current} ${word}`:word;}
    if(current)lines.push(current);return lines;
  }).join('\n');
};
const storyPath = path.join(root, 'evidence/simulation/project-story.json');
const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));
if (story.tickets?.length !== 50) throw new Error('V3 setzt exakt die bestehenden 50 UABC-Tickets voraus.');
if (story.tickets.some(ticket => !/^UABC-[1-9]\d*$/.test(ticket.id))) throw new Error('Nur der bestehende UABC-Namensraum ist zulaessig.');

const rate = 120;
const simulatedCompany = {
  customerId: 'UABC-CUSTOMER-001',
  name: 'Saarblick Handel & Service GmbH',
  shortName: 'Saarblick',
  classification: 'ausdruecklich-simulierter-beispielkunde',
  business: 'Regionaler B2B-Handel mit Werkstattverbrauchsmaterial und einem einfachen Zentrallager in Saarbruecken.',
  size: '24 Mitarbeitende, davon sieben Business-Central-Nutzende',
  scope: ['Finanzbuchhaltung', 'Einkauf', 'Verkauf', 'einfaches Lager'],
  outOfScope: ['Continia', 'Produktion', 'Servicemanagement', 'Projekte', 'E-Commerce', 'Bankfeed', 'Steueruebermittlung']
};

const actors = [
  { personId: 'P-PILOT-LEAD-001', displayName: 'Kajetan Kalicki', organization: 'Universaarl', actorType: 'human', activeRoles: ['Projektleitung', 'Lead BC Consultant', 'Solution Architect'], responsibilities: ['Projektsteuerung', 'Fit-to-Standard', 'Loesungsdesign', 'Qualitaetsentscheidung', 'Handover'], availabilityStatus: 'Montag bis Freitag 09:00-17:00; reale Consultantrolle', allowedApprovalRoles: ['interne Projektfreigabe', 'technische Qualitaetsfreigabe'], escalationLevel: 2 },
  { personId: 'ROLE-CUSTOMER-SPONSOR', displayName: 'Dr. Lena Hartmann', organization: simulatedCompany.name, actorType: 'simulated-customer-role', activeRoles: ['Geschaeftsfuehrerin', 'Sponsorin'], responsibilities: ['Scope', 'Budget', 'GO/NO-GO'], availabilityStatus: 'Dienstag und Donnerstag 09:00-12:00; simuliert', allowedApprovalRoles: ['synthetisches Projektgate', 'synthetisches Cutover-GO'], escalationLevel: 3 },
  { personId: 'ROLE-CUSTOMER-FINANCE', displayName: 'Miriam Becker', organization: simulatedCompany.name, actorType: 'simulated-customer-role', activeRoles: ['Leitung Finance', 'Finance Key User', 'UAT Lead'], responsibilities: ['Konten', 'MwSt.', 'Bank', 'Monatsabschluss', 'UAT'], availabilityStatus: 'Taeglich 09:00-15:00; Monatsende priorisiert; simuliert', allowedApprovalRoles: ['synthetische Fachabnahme Finance', 'synthetische UAT-Abnahme'], escalationLevel: 2 },
  { personId: 'ROLE-CUSTOMER-PURCHASE', displayName: 'Tobias Klein', organization: simulatedCompany.name, actorType: 'simulated-customer-role', activeRoles: ['Einkauf Key User'], responsibilities: ['Bestellung', 'Wareneingang', 'Eingangsrechnung'], availabilityStatus: 'Montag, Mittwoch, Freitag 09:00-14:00; simuliert', allowedApprovalRoles: ['synthetische Fachabnahme Einkauf'], escalationLevel: 1 },
  { personId: 'ROLE-CUSTOMER-SALES', displayName: 'Julia Brandt', organization: simulatedCompany.name, actorType: 'simulated-customer-role', activeRoles: ['Verkauf Key User'], responsibilities: ['Auftrag', 'Lieferung', 'Rechnung', 'Zahlungseingang'], availabilityStatus: 'Taeglich 10:00-16:00; simuliert', allowedApprovalRoles: ['synthetische Fachabnahme Verkauf'], escalationLevel: 1 },
  { personId: 'ROLE-CUSTOMER-WAREHOUSE', displayName: 'Mehmet Yilmaz', organization: simulatedCompany.name, actorType: 'simulated-customer-role', activeRoles: ['Lager Key User'], responsibilities: ['Bestand', 'Lagerbewegung', 'Inventur'], availabilityStatus: 'Taeglich 07:00-12:00; simuliert', allowedApprovalRoles: ['synthetische Fachabnahme Lager'], escalationLevel: 1 },
  { personId: 'ROLE-CUSTOMER-IT', displayName: 'Nora Schmitt', organization: simulatedCompany.name, actorType: 'simulated-customer-role', activeRoles: ['IT-Koordination', 'Berechtigungsadministration'], responsibilities: ['Sandbox', 'Benutzer', 'Rollen', 'Resetpunkt'], availabilityStatus: 'Montag bis Donnerstag 08:00-16:00; simuliert', allowedApprovalRoles: ['synthetisches Umgebungs-Gate'], escalationLevel: 2 },
  { personId: 'ACTOR-KUNDEN-SUPPORT', displayName: 'Paul Weber', organization: simulatedCompany.name, actorType: 'simulated-customer-role', activeRoles: ['First-Level-Support', 'Betriebskoordination'], responsibilities: ['Ticketannahme', 'Eskalation', 'Supportuebergabe'], availabilityStatus: 'Taeglich 08:00-17:00; simuliert', allowedApprovalRoles: ['synthetische Supportannahme'], escalationLevel: 1 },
  { personId: 'ACTOR-CODEX-SPECTRA', displayName: 'Codex Spectra Automation', organization: 'Universaarl Tooling', actorType: 'codex-spectra', activeRoles: ['Generator und Vertragspruefung'], responsibilities: ['deterministische Projektion', 'technische Validierung'], availabilityStatus: 'systemisch', allowedApprovalRoles: [], escalationLevel: 0 },
  { personId: 'ACTOR-PLAYWRIGHT', displayName: 'Playwright Automation', organization: 'Universaarl Tooling', actorType: 'playwright', activeRoles: ['Szenarioautomation'], responsibilities: ['reproduzierbare UI-Szenarien'], availabilityStatus: 'systemisch', allowedApprovalRoles: [], escalationLevel: 0 },
  { personId: 'ACTOR-SYSTEM', displayName: 'Repository Automation', organization: 'Universaarl Tooling', actorType: 'system-automation', activeRoles: ['Generator', 'Validator', 'Export'], responsibilities: ['Ableitung', 'Integritaetspruefung', 'Snapshotvorbereitung'], availabilityStatus: 'systemisch', allowedApprovalRoles: [], escalationLevel: 0 }
];
const actorById = new Map(actors.map(actor => [actor.personId, actor]));

const meetings = [
  ['UABC-MTG-001','Kickoff','2026-04-07T10:00:00+02:00','P1',['ROLE-CUSTOMER-SPONSOR','ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-IT'],'Projektziel, Scope, 80-Stunden-Plan, RACI und Eskalationsweg','Sponsorin bestaetigt den simulierten Fit-to-Standard-Auftrag und das Discovery-Gate.'],
  ['UABC-MTG-002','Discovery Finance','2026-04-09T09:00:00+02:00','P1',['ROLE-CUSTOMER-FINANCE'],'Kontenplan, Buchungsgruppen, Dimensionen, Perioden, Bank und MwSt.','SKR04-orientiertes Zielbild, MWST19 und die Monatsabschlusskontrollen sind synthetisch entschieden.'],
  ['UABC-MTG-003','Prozessworkshop','2026-04-13T09:00:00+02:00','P1',['ROLE-CUSTOMER-PURCHASE','ROLE-CUSTOMER-SALES','ROLE-CUSTOMER-WAREHOUSE','ROLE-CUSTOMER-FINANCE'],'Einkauf, Verkauf, Lager, Rollen und Prozessausnahmen','P2P, O2C und Lager bleiben im Standard; Freigabeworkflows und erweitertes Lager sind out of scope.'],
  ['UABC-MTG-004','Datenübernahme','2026-04-17T10:00:00+02:00','P1',['ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-IT'],'Datenquellen, Pflichtfelder, Kontrollsummen, Fehlerliste und Freigabe','Drei Datenwellen mit Stammdaten vor Eroeffnungsposten sind synthetisch freigegeben.'],
  ['UABC-MTG-005','Konfiguration','2026-05-04T09:00:00+02:00','P2',['ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-IT'],'Firmendaten, Finanzsetup, Nummernserien, Buchungsgruppen und Berechtigungen','Einrichtungswoche startet mit kontrollierter Baseline und unveraenderten Live-Grenzen.'],
  ['UABC-MTG-006','SIT-Triage','2026-05-07T15:00:00+02:00','P2',['ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-PURCHASE','ROLE-CUSTOMER-SALES','ROLE-CUSTOMER-WAREHOUSE'],'SIT-Ergebnisse, P2P-/O2C-/Lagerabweichungen, Korrektur und Retest','Drei P2-Defects wurden korrigiert und in der Simulation erfolgreich retestet.'],
  ['UABC-MTG-007','UAT','2026-05-08T09:00:00+02:00','P2',['ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-PURCHASE','ROLE-CUSTOMER-SALES','ROLE-CUSTOMER-WAREHOUSE'],'Sieben UAT-Faelle, Kontrollsummen, Defects und Abnahme','Alle Pflichtfaelle sind synthetisch angenommen; reale UAT bleibt separates Kundengate.'],
  ['UABC-MTG-008','Finanzschulung','2026-05-08T11:00:00+02:00','P2',['ROLE-CUSTOMER-FINANCE'],'Navigation, Buchungsvorschau, Zahlung, Bank, Abschluss und UStVA-Vorschau','Die Finanzanwenderin besteht den synthetischen Kompetenzcheck.'],
  ['UABC-MTG-009','Prozessschulung','2026-05-08T13:30:00+02:00','P2',['ROLE-CUSTOMER-PURCHASE','ROLE-CUSTOMER-SALES','ROLE-CUSTOMER-WAREHOUSE'],'Bestellung, Auftrag, Lagerbewegung, Fehlerkorrektur und Supportweg','Drei operative Fachanwender bestehen die rollenbezogenen Uebungen.'],
  ['UABC-MTG-010','Cutover-GO','2026-05-11T08:30:00+02:00','P2',['ROLE-CUSTOMER-SPONSOR','ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-IT','ACTOR-KUNDEN-SUPPORT'],'Mock-Cutover, Kontrollsummen, Restpunkte, Restart und GO/NO-GO','GO_SIMULATION wurde fuer die repositorybasierte Cutover-Probe erteilt.'],
  ['UABC-MTG-011','Hypercare','2026-05-19T09:00:00+02:00','P3',['ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-IT','ACTOR-KUNDEN-SUPPORT'],'Incidentlage, Reaktionszeiten, Zahlungsreferenz, Retest und Restart','P1/P2 sind null; Zahlungsreferenz ist korrigiert und der Restart synthetisch bestanden.'],
  ['UABC-MTG-012','Handover','2026-06-01T10:00:00+02:00','P3',['ROLE-CUSTOMER-SPONSOR','ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-IT','ACTOR-KUNDEN-SUPPORT'],'Lieferobjekte, Restpunkte, Supportmodell, Abschluss und acht reale Gates','Simulation ist fachlich abgeschlossen; Produktivsetzung und acht reale Gates bleiben ausdruecklich ausserhalb.']
].map(([id,title,time,phase,participants,agenda,result]) => ({ id,title,time,phase,participants:['P-PILOT-LEAD-001',...participants],agenda,result }));
const meetingById = new Map(meetings.map(meeting => [meeting.id, meeting]));

const taskPlan = {
  'UABC-32':['2026-04-10',5,'UABC-MTG-001'], 'UABC-33':['2026-04-13',3.5,'UABC-MTG-003'],
  'UABC-34':['2026-04-15',4,'UABC-MTG-002'], 'UABC-35':['2026-04-17',1.5,'UABC-MTG-004'],
  'UABC-36':['2026-04-28',2,'UABC-MTG-004'], 'UABC-37':['2026-04-29',2,'UABC-MTG-003'],
  'UABC-38':['2026-04-30',5,'UABC-MTG-003'], 'UABC-39':['2026-05-07',5,'UABC-MTG-006'],
  'UABC-40':['2026-05-08',8.5,'UABC-MTG-007'], 'UABC-41':['2026-04-24',3.5,'UABC-MTG-003'],
  'UABC-42':['2026-05-08',5.5,'UABC-MTG-009'], 'UABC-43':['2026-05-01',4.5,'UABC-MTG-010'],
  'UABC-44':['2026-05-11',5,'UABC-MTG-010'], 'UABC-45':['2026-05-08',3.5,'UABC-MTG-011'],
  'UABC-46':['2026-05-22',3,'UABC-MTG-011'], 'UABC-47':['2026-05-27',3,'UABC-MTG-008'],
  'UABC-48':['2026-05-28',2,'UABC-MTG-008'], 'UABC-49':['2026-05-29',1.5,'UABC-MTG-011'],
  'UABC-50':['2026-06-01',10,'UABC-MTG-012']
};
const isoWeek = value => {
  const date = new Date(`${value}T00:00:00Z`); const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day); const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return `${date.getUTCFullYear()}-W${String(Math.ceil((((date-yearStart)/86400000)+1)/7)).padStart(2,'0')}`;
};
const addTime = (date, hour) => `${date}T${hour}+02:00`;

const domainRules = [
  [/UStVA|VAT/i,{key:'vat',page:'VAT Returns / VAT Report Setup',fields:'VAT Bus. Posting Group, VAT Prod. Posting Group, VAT Identifier, Period',action:'Suggest Lines und Preview',customer:'ROLE-CUSTOMER-FINANCE',meeting:'UABC-MTG-008',control:'Ausgangssteuer 150,10 minus Vorsteuer 79,80 ergibt Zahllast 70,30.'}],
  [/Bank/i,{key:'bank',page:'Bank Acc. Reconciliation',fields:'Bank Account No., Statement No., Statement Date, Statement Ending Balance',action:'Import Bank Statement, Match Automatically und Post',customer:'ROLE-CUSTOMER-FINANCE',meeting:'UABC-MTG-008',control:'Anfang 5.000,00 plus 940,10 minus 499,80 ergibt 5.440,30 bei Differenz 0,00.'}],
  [/Zahlung/i,{key:'payment',page:'Payment Reconciliation Journal',fields:'Transaction Date, Amount, Document No., Applies-to Doc. No.',action:'Apply Automatically, Review Application und Post Payments',customer:'ROLE-CUSTOMER-FINANCE',meeting:'UABC-MTG-008',control:'Debitor 940,10 und Kreditor 499,80 sind jeweils vollstaendig ausgeglichen.'}],
  [/Lager|Inventur/i,{key:'inventory',page:'Physical Inventory Orders / Item Ledger Entries / Value Entries',fields:'Location Code, Item No., Quantity, Unit Cost, Qty. Phys. Inventory',action:'Calculate Lines, Record, Finish und Post',customer:'ROLE-CUSTOMER-WAREHOUSE',meeting:'UABC-MTG-003',control:'Soll 50 STK, Ist 49 STK, Korrektur minus 1 STK zu 42,00; Endbestand 49 STK und 2.058,00.'}],
  [/Einkauf|P2P/i,{key:'p2p',page:'Purchase Orders / Posted Purchase Receipts / Posted Purchase Invoices',fields:'Vendor No., Vendor Invoice No., Location Code, Quantity, Direct Unit Cost, VAT Prod. Posting Group',action:'Preview Posting, Receive und Invoice',customer:'ROLE-CUSTOMER-PURCHASE',meeting:'UABC-MTG-003',control:'10 STK mal 42,00 ergeben 420,00 netto, 79,80 Vorsteuer und 499,80 Kreditor.'}],
  [/Verkauf|O2C/i,{key:'o2c',page:'Sales Orders / Posted Sales Shipments / Posted Sales Invoices',fields:'Customer No., Location Code, Quantity, Unit Price, VAT Prod. Posting Group',action:'Preview Posting, Ship und Invoice',customer:'ROLE-CUSTOMER-SALES',meeting:'UABC-MTG-003',control:'10 STK mal 79,00 ergeben 790,00 netto, 150,10 Umsatzsteuer und 940,10 Debitor.'}],
  [/Close|Perioden|Monatsabschluss|Finanz/i,{key:'finance',page:'General Ledger Setup / Accounting Periods / G/L Entries',fields:'Allow Posting From, Allow Posting To, Gen. Bus. Posting Group, Gen. Prod. Posting Group, VAT Posting Setup',action:'Preview Posting, Navigate und Trial Balance pruefen',customer:'ROLE-CUSTOMER-FINANCE',meeting:'UABC-MTG-002',control:'Soll und Haben der Abschlusskontrolle betragen jeweils 11.080,20; Differenz 0,00.'}],
  [/Daten|Migration|Stammdaten/i,{key:'data',page:'Configuration Packages / Customers / Vendors / Items',fields:'Table ID, Field ID, Validate Field, No., Posting Group, Dimension',action:'Import, Validate Package, Apply Package und Fehlerprotokoll lesen',customer:'ROLE-CUSTOMER-IT',meeting:'UABC-MTG-004',control:'7 Debitoren, 5 Kreditoren, 12 Artikel und alle Kontrollsummen werden ohne Dublette uebernommen.'}],
  [/Schulung|Key User/i,{key:'training',page:'Role Center / My Settings / Assisted Setup',fields:'Role, Company, Work Date, Language',action:'Navigation und rollenbezogene Uebungsfaelle',customer:'ROLE-CUSTOMER-FINANCE',meeting:'UABC-MTG-009',control:'Vier Rollenpfade bestehen Kompetenzcheck und Supporteskalation.'}],
  [/UAT|Defect|Hypercare|Retro/i,{key:'quality',page:'Posted Documents / Navigate / Error Messages',fields:'Document No., Posting Date, Remaining Amount, Open, Dimension Set ID',action:'Drill-down, Defect erfassen, korrigieren und identisch retesten',customer:'ROLE-CUSTOMER-FINANCE',meeting:'UABC-MTG-007',control:'Kein offener P1/P2; jeder Defect besitzt Ursache, Fix und bestandenen Retest.'}],
  [/Cutover|Go-live|Handover|Übergabe|Support/i,{key:'transition',page:'Companies / Users / User Groups / Posting Date controls',fields:'Company, User, Permission Set, Work Date, Allow Posting From/To',action:'Cutover-Checkliste, Smoke Test, Restart und Uebergabe',customer:'ROLE-CUSTOMER-SPONSOR',meeting:'UABC-MTG-010',control:'Mock-Cutover und Restart sind synthetisch bestanden; acht reale Gates bleiben offen.'}],
  [/.*/,{key:'project',page:'Company Information / My Settings / Project documentation',fields:'Company, Responsibility, Scope, Decision Owner, Due Date',action:'Projektgate und Fit-to-Standard-Entscheidung dokumentieren',customer:'ROLE-CUSTOMER-SPONSOR',meeting:'UABC-MTG-001',control:'Scope, RACI, Budget und Gateentscheidung sind nachvollziehbar verknuepft.'}]
];
const germanDomains={
  vat:{label:'Umsatzsteuer',page:'USt.-Voranmeldungen / USt.-Bericht Einrichtung',fields:'USt.-Geschäftsbuchungsgruppe, USt.-Produktbuchungsgruppe, USt.-Kennzeichen und Zeitraum',action:'Zeilen vorschlagen und Vorschau prüfen'},
  bank:{label:'Bankabstimmung',page:'Bankkontoabstimmung',fields:'Bankkontonummer, Auszugsnummer, Auszugsdatum und Auszugsendbestand',action:'Kontoauszug importieren, automatisch zuordnen und buchen'},
  payment:{label:'Zahlungsausgleich',page:'Zahlungsabstimmungsbuchblatt',fields:'Transaktionsdatum, Betrag, Belegnummer und Ausgleichsbelegnummer',action:'automatisch ausgleichen, Zuordnung prüfen und Zahlungen buchen'},
  inventory:{label:'Lager und Inventur',page:'Inventuraufträge / Artikelposten / Wertposten',fields:'Lagerortcode, Artikelnummer, Menge, Einstandspreis und Inventurmenge',action:'Zeilen berechnen, erfassen, beenden und buchen'},
  p2p:{label:'Einkauf',page:'Einkaufsbestellungen / Gebuchte Einkaufslieferungen / Gebuchte Einkaufsrechnungen',fields:'Kreditorennummer, externe Belegnummer, Lagerortcode, Menge, direkter Einstandspreis und USt.-Produktbuchungsgruppe',action:'Buchungsvorschau prüfen, Lieferung und Rechnung buchen'},
  o2c:{label:'Verkauf',page:'Verkaufsaufträge / Gebuchte Verkaufslieferungen / Gebuchte Verkaufsrechnungen',fields:'Debitorennummer, Lagerortcode, Menge, Verkaufspreis und USt.-Produktbuchungsgruppe',action:'Buchungsvorschau prüfen, liefern und fakturieren'},
  finance:{label:'Finanzbuchhaltung',page:'Finanzbuchhaltung Einrichtung / Buchhaltungsperioden / Sachposten',fields:'Buchungen zugelassen ab und bis, Geschäftsbuchungsgruppe, Produktbuchungsgruppe und USt.-Buchungsmatrix',action:'Buchungsvorschau, Navigate und Saldenkontrolle prüfen'},
  data:{label:'Datenübernahme',page:'Konfigurationspakete / Debitoren / Kreditoren / Artikel',fields:'Tabellen-ID, Feld-ID, Feldvalidierung, Nummer, Buchungsgruppe und Dimension',action:'importieren, Paket prüfen, Paket anwenden und Fehlerprotokoll lesen'},
  training:{label:'Schulung',page:'Rollencenter / Meine Einstellungen / Unterstützte Einrichtung',fields:'Rolle, Unternehmen, Arbeitsdatum und Sprache',action:'Navigation und rollenbezogene Übungsfälle'},
  quality:{label:'Qualitätssicherung',page:'Gebuchte Belege / Navigate / Fehlermeldungen',fields:'Belegnummer, Buchungsdatum, Restbetrag, offen und Dimensionssatz-ID',action:'Drilldown, Fehler erfassen, korrigieren und identisch erneut testen'},
  transition:{label:'Übergabe',page:'Unternehmen / Benutzer / Benutzergruppen / Buchungsdatumsteuerung',fields:'Unternehmen, Benutzer, Berechtigungssatz, Arbeitsdatum und Buchungen zugelassen ab/bis',action:'Cutover-Checkliste, Kurztest, Wiederanlauf und Übergabe'},
  project:{label:'Projektsteuerung',page:'Unternehmensinformationen / Meine Einstellungen / Projektdokumentation',fields:'Unternehmen, Verantwortung, Umfang, Entscheidungsverantwortung und Fälligkeit',action:'Projektfreigabe und Fit-to-Standard-Entscheidung dokumentieren'}
};
for(const [,domain] of domainRules)Object.assign(domain,germanDomains[domain.key]);
const domainFor = ticket => domainRules.find(([pattern]) => pattern.test(`${ticket.summary} ${ticket.title}`))[1];
const transcriptFor = ticket => {
  if (taskPlan[ticket.id]) return [taskPlan[ticket.id][2]];
  const domain = domainFor(ticket);
  if (ticket.type === 'phase') return ticket.id === 'UABC-1' ? ['UABC-MTG-001','UABC-MTG-004'] : ticket.id === 'UABC-2' ? ['UABC-MTG-005','UABC-MTG-010'] : ['UABC-MTG-011','UABC-MTG-012'];
  return [domain.meeting];
};
const alphaMarker = number => { let value=number; let result=''; while(value>0){value--;result=String.fromCharCode(97+(value%26))+result;value=Math.floor(value/26);} return `fachanker-${result}`; };

const originalById = new Map(story.tickets.map(ticket => [ticket.id, ticket]));
const taskDates = new Map();
const closeOverrides = {'UABC-43':'2026-05-11','UABC-45':'2026-05-19'};
for (const ticket of story.tickets.filter(item => item.type === 'task')) {
  const [date,hours] = taskPlan[ticket.id] ?? [];
  if (!date || !hours) throw new Error(`V3-Taskplan fehlt fuer ${ticket.id}.`);
  const closeDate=closeOverrides[ticket.id]??date;
  taskDates.set(ticket.id, { start:addTime(date,'09:00:00'), tested:addTime(closeDate,'15:00:00'), closed:addTime(closeDate,'16:00:00'), date, hours });
}
const descendants = id => story.tickets.filter(ticket => ticket.type === 'task').filter(task => {
  let current = task.parent;
  while (current) { if (current === id) return true; current = originalById.get(current)?.parent ?? null; }
  return false;
});
const boundsFor = ticket => {
  if (ticket.type === 'task') return taskDates.get(ticket.id);
  const dates = descendants(ticket.id).map(task => taskDates.get(task.id));
  return { start: dates.map(item => item.start).sort()[0], tested: dates.map(item => item.tested).sort().at(-1), closed: dates.map(item => item.closed).sort().at(-1), date: dates.map(item => item.date).sort().at(-1) };
};

for (const ticket of story.tickets) {
  const domain = domainFor(ticket); const bounds = boundsFor(ticket); const task = ticket.type === 'task';
  const relevantTaskIds = task ? [ticket.id] : descendants(ticket.id).map(item => item.id);
  const actualHours = relevantTaskIds.reduce((sum,id) => sum + Number(taskPlan[id]?.[1] ?? 0), 0);
  const amount = actualHours * rate; const customer = actorById.get(domain.customer); const slug = ticket.summary.toLowerCase().replace(/[^a-z0-9äöüß]+/gi,'-');
  const transcriptRefs = transcriptFor(ticket); const marker=alphaMarker(Number(ticket.id.split('-')[1]));
  const evidenceRef = ticket.evidenceRefs?.[0] ?? 'evidence/simulation/project-completion.yaml';
  const deliverable = ticket.deliverableRefs?.[0] ?? ticket.deliverable ?? 'UABC-DEL-BCB-009';
  const concreteSteps = `${domain.page} ueber Suche oeffnen; ${domain.fields} gegen die freigegebene Baseline lesen; ${domain.action}; erzeugte Belege und Posten per Navigate oder Drill-down kontrollieren; Abweichung protokollieren; Korrektur anwenden; denselben Fall mit identischen Eingaben retesten`;
  const expectedResult = `${ticket.summary} liefert fuer ${domain.key} ein pruefbares Ergebnis. ${domain.control}`;
  Object.assign(ticket, {
    title: ticket.summary,
    start: bounds.start.slice(0,10), end: bounds.closed.slice(0,10), status:'closed', actualHours, remainingHours:0, netAmount:amount,
    createdAt:'2026-04-01T09:00:00+02:00', startedAt:bounds.start, testedAt:bounds.tested, closedAt:bounds.closed,
    reporter:'P-PILOT-LEAD-001', assignee:domain.customer, reporterRole:'Kajetan Kalicki – reale Universaarl-Projektleitung und Lead BC Consultant', assigneeRole:`${customer.displayName} – ausdrücklich simulierte Kundenrolle (${customer.activeRoles.join(', ')})`,
    meetingTranscriptRefs:transcriptRefs, customerInputs:`Freigegebene synthetische Saarblick-Eingaben fuer ${domain.fields}; verantwortlich ${customer.displayName}; Arbeitskontext ${slug}.`,
    customerRoles:`${customer.displayName} (${customer.activeRoles.join(', ')}), simuliert; verfuegbar ${customer.availabilityStatus}.`,
    consultantRoles:'Kajetan Kalicki als reale Projektleitung, Lead BC Consultant und Solution Architect; keine Kundenfreigabe in eigener Sache.',
    concreteSteps, agenda:`${ticket.summary}: Ausgangswert, ${domain.fields}, ${domain.action}, Kontrollsumme, Abweichung, Korrektur, Retest, Akzeptanz und Uebergabe.`,
    expectedResult, specificRisk:`Im Arbeitskontext ${slug} kann eine falsche Feld- oder Buchungsgruppenzuordnung nachgelagerte ${domain.key}-Kontrollen verfaelschen.`,
    handoff:`Geprueftes Ergebnis ${slug} an ${ticket.type === 'task' ? 'den fachlichen Story-Owner und das naechste Projektgate' : 'die untergeordneten beziehungsweise nachfolgenden Arbeitspakete'} uebergeben.`,
    evidenceReadback:`${domain.page}; ${domain.fields}; ${domain.control} Nachweis ${evidenceRef}.`,
    statusHistory:[
      {status:'created',time:'2026-04-01T09:00:00+02:00',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'Projektleitung'},
      {status:'in-progress',time:bounds.start,actorRef:ticket.assignee,actorType:customer.actorType,actionRole:customer.activeRoles[0]},
      {status:'in-review',time:bounds.tested,actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'Lead BC Consultant'},
      {status:'closed',time:bounds.closed,actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'synthetischer Abschluss nach Evidence'}
    ],
    acceptanceCriteria:[
      {criterion:`${domain.page} zeigt fuer ${slug} die erwarteten Felder und Beleg-/Postenwirkungen ohne offene Kontrolldifferenz.`,fulfilled:true},
      {criterion:`Die dokumentierte Ausnahme fuer ${slug} ist korrigiert, mit identischer Ausgangslage retestet und an die verantwortliche Rolle uebergeben.`,fulfilled:true}
    ],
    comments:[
      {id:`COM-${ticket.id}-V3-START`,type:'status',time:bounds.start,role:customer.activeRoles[0],actorRef:ticket.assignee,actorType:customer.actorType,actionRole:customer.activeRoles[0],text:`${customer.displayName} stellt die simulierten Eingaben fuer ${ticket.summary} bereit; Live-BC bleibt ausgeschlossen.`,evidenceRef},
      {id:`COM-${ticket.id}-V3-CLOSE`,type:'closing',time:bounds.closed,role:'Projektleitung',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'Lead BC Consultant',text:`${ticket.summary}: Ergebnis, Kontrolle, Ausnahme, Korrektur und Retest sind synthetisch belegt; Uebergabe erfolgt.`,evidenceRef}
    ],
    worklogs: task ? [{id:`WL-${ticket.id}-V3`,taskId:ticket.id,date:bounds.date,role:'Lead BC Consultant',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'fakturierbare Projektleistung',hours:taskPlan[ticket.id][1],activity:`${ticket.summary}: ${domain.action}, Kontrolle, Korrektur und Retest dokumentiert.`,phase:ticket.phase,billable:true,hourlyRate:rate,netAmount:taskPlan[ticket.id][1]*rate}] : [],
    worklogHours: task ? taskPlan[ticket.id][1] : 0,
    description:`Ausgangslage und Ziel\n${ticket.summary} (${ticket.id}) beginnt im Arbeitskontext ${slug} erst am ${bounds.start.slice(0,10)}. Ausgangslage ist der ausdrücklich simulierte Beispielkunde ${simulatedCompany.name}; Ziel ist ein belastbarer ${domain.key}-Nachweis ohne Live-Tenant-Behauptung.\n\nIn Scope\nFuer ${slug} werden ${domain.page}, die Felder ${domain.fields}, die Aktion ${domain.action}, Beleg-/Postenwirkungen, Kontrollsumme, Ausnahme, Korrektur und Retest bearbeitet.\n\nNicht im Umfang\nDer Arbeitskontext ${slug} umfasst weder Continia noch produktive Buchung, Bankfeed, ELSTER-Uebertragung, Steuerberatung, echte Kundenfreigabe oder Zugriff auf ein reales Business-Central-System.\n\nVoraussetzungen und Rollen\nKundeneingaben: ${domain.fields}. Simulierte Verantwortung: ${customer.displayName} (${customer.activeRoles.join(', ')}), Verfuegbarkeit ${customer.availabilityStatus}. Consultant: Kajetan Kalicki als reale Universaarl-Projektleitung und Lead BC Consultant. Pruefkontext ${marker}. ${ticket.id==='UABC-32'?'Datenquellen, Feldlisten, Dateiformate, Daten-Owner und Freigabefrist sind verbindlich benannt.':''}\n\nDurchführung\n${concreteSteps}. Die Agenda aus ${transcriptRefs.join(', ')} bindet ${slug} an Eingabe, BC-Seite, Feld, Aktion, Ergebnis, Kontrolle, Abweichung, Korrektur und Retest. Ablaufmerkmal ${marker}. ${ticket.id==='UABC-32'?'Feldmapping, Formatpruefung, Qualitaetschecks und Freigabe werden je Datenwelle protokolliert.':''} ${ticket.id==='UABC-46'?'Hypercare-Tage werden mit Incident-Prioritaet, Reaktionszeit, Fix, Retest und Restart-Entscheidung gefuehrt.':''}\n\nErgebnis und Akzeptanz\n${expectedResult} Akzeptiert wird ausschliesslich der synthetische Simulationstore nach Review durch die benannten Rollen; eine reale Kundensystemabnahme wird nicht behauptet. ${ticket.id==='UABC-32'?'Die Datenfreigabe ist innerhalb der Simulation dokumentiert.':''} ${ticket.id==='UABC-50'?'Die synthetische Handover-Abnahme ist abgeschlossen; ausschliesslich die acht realen Kundengates bleiben offen.':''}\n\nLieferung und Referenzen\n${slug} liefert ${deliverable}. Transcript ${transcriptRefs.join(', ')}, Evidence ${ticket.evidenceRefs?.join(', ') || evidenceRef} und Seiten ${ticket.pageRefs?.join(', ') || 'PAGE-UABC-000'} bleiben bidirektional referenziert.\n\nEvidence, Test und Readback\nReadback ${marker} auf ${domain.page}: ${domain.fields}. ${domain.control} Eine relevante Abweichung wurde erfasst, fachlich korrigiert und mit unveraenderter Ausgangslage erneut getestet. ${ticket.id==='UABC-50'?'Die acht reale Kundengates umfassende Folgegrenze ist im Handover sichtbar.':''}\n\nAufwand und Abrechnung\n${task ? `Ausschliesslich das Task-Worklog ${`WL-${ticket.id}-V3`} ist fakturierbar; Elternwerte sind reine Rollups. Die Wochenrechnung wird aus genehmigten Task-Iststunden erzeugt.` : 'Dieses Eltern-Ticket ist nicht fakturierbar; Iststunden und Kosten werden ausschliesslich aus den untergeordneten Task-Worklogs hochgerollt.'} Plan und Ist werden getrennt ausgewiesen; Abrechnungsmerkmal ${marker}.\n\nAbhängigkeiten, Risiken und Übergabe\nRisiko ${slug}: ${ticket.specificRisk} Gateberechtigung liegt bei ${customer.displayName} nur innerhalb der Simulation. Nach bestandenem Retest wird ${ticket.handoff} ${ticket.id==='UABC-46'?'Der Restart und die Exit-Entscheidung werden an Support und Monatsabschluss uebergeben.':''}`
  });
  ticket.description=ticket.description.replace(/[ \t]+$/gm,'')
    .replaceAll('In Scope','Im Umfang').replaceAll('Consultant:','Beratung:')
    .replaceAll('Lead BC Consultant','leitender BC-Berater').replaceAll('Solution Architect','Lösungsarchitekt')
    .replaceAll('Incident-Prioritaet','Störungspriorität').replaceAll('Restart-Entscheidung','Wiederanlaufentscheidung')
    .replaceAll('Simulationstore','Simulationsnachweis').replaceAll('Review','Prüfung')
    .replaceAll('Handover-Abnahme','Übergabeabnahme').replaceAll('Transcript','Transkript').replaceAll('Evidence','Nachweis')
    .replaceAll('Readback','Rücklesekontrolle').replaceAll('Task-Worklog','Aufwandsnachweis').replaceAll('Story-Owner','fachlich Verantwortlichen')
    .replaceAll('Restart und die Exit-Entscheidung','Wiederanlauf und die Austrittsentscheidung')
    .replaceAll(`${domain.key}-Nachweis`,`${domain.label}-Nachweis`);
}

for(const [id,refs] of Object.entries({'UABC-39':['evidence/simulation/pilot-v3-finance-ledger.json'],'UABC-40':['evidence/simulation/pilot-v3-finance-ledger.json'],'UABC-44':['evidence/simulation/project-completion.yaml'],'UABC-46':['evidence/simulation/project-completion.yaml'],'UABC-47':['evidence/simulation/pilot-v3-finance-ledger.json'],'UABC-48':['evidence/simulation/pilot-v3-finance-ledger.json']})){
 const ticket=originalById.get(id);for(const ref of refs)if(!ticket.evidenceRefs.includes(ref))ticket.evidenceRefs.push(ref);
}
story.hypercare=[
 {day:1,dailyPage:'PAGE-UABC-170',ticket:'UABC-46',comment:'COM-UABC-46-V3-CLOSE',evidence:'evidence/simulation/project-completion.yaml',priority:'P2',diagnosis:'Zahlungsreferenz konnte nicht automatisch zugeordnet werden.',fix:'Referenz auf SINV-260501 korrigiert.',retest:'bestanden-synthetisch',status:'synthetic-complete',decision:'UABC-DEC-BCB-003',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'Hypercare Lead'},
 {day:2,dailyPage:'PAGE-UABC-170',ticket:'UABC-47',comment:'COM-UABC-47-V3-CLOSE',evidence:'evidence/simulation/pilot-v3-finance-ledger.json',priority:'P3',diagnosis:'Periodenwechsel erforderte Kontrolle des Buchungsdatums.',fix:'Allow Posting From und Buchungsdatum abgestimmt.',retest:'bestanden-synthetisch',status:'synthetic-complete',decision:'UABC-DEC-BCB-003',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'Finance Close Lead'},
 {day:3,dailyPage:'PAGE-UABC-180',ticket:'UABC-50',comment:'COM-UABC-50-V3-CLOSE',evidence:'docs/handover/bc-basic-handover.md',priority:'P3',diagnosis:'Supportannahme und reale Gates mussten getrennt werden.',fix:'Handover schliesst Simulation und laesst acht Realgates offen.',retest:'bestanden-synthetisch',status:'synthetic-complete',decision:'UABC-DEC-BCB-003',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'Projektleitung'}
];

const taskWorklogs = story.tickets.filter(ticket => ticket.type === 'task').flatMap(ticket => ticket.worklogs);
const actualHours = taskWorklogs.reduce((sum,log) => sum + log.hours,0);
const actualAmount = taskWorklogs.reduce((sum,log) => sum + log.netAmount,0);
if (actualHours !== 78 || actualAmount !== 9360) throw new Error(`V3-Abrechnung driftet: ${actualHours}/${actualAmount}.`);
Object.assign(story.offer,{currentVersion:'pilot-v3-simulation-2026-06-01',planned_hours:80,planned_cost:9600,actual_hours:actualHours,actual_cost:actualAmount,status:'synthetic-closed',currentStatus:'synthetic-closed'});
Object.assign(story.activeOffer,{status:'synthetic-closed',plannedHours:80,plannedNetAmount:9600,actualHours,actualNetAmount:actualAmount,customerAcceptanceClaimed:false,syntheticAcceptanceClaimed:true});
Object.assign(story.controls,{worklogHours:actualHours,worklogCost:actualAmount,actualHours,actualNetAmount:actualAmount,planHours:80,plannedNetAmount:9600,simulationStatus:'simulated-complete',realBcExecution:false});
story.ticketQuality = {
  ...story.ticketQuality,
  version:'v3-realistic',
  canonicalTicketCount:50,
  realExecutionClaim:false,
  realLiveGatesPending:8,
  descriptionSections:[
    'Ausgangslage und Ziel', 'Im Umfang', 'Nicht im Umfang', 'Voraussetzungen und Rollen',
    'Durchführung', 'Ergebnis und Akzeptanz', 'Lieferung und Referenzen',
    'Nachweis, Test und Rücklesekontrolle', 'Aufwand und Abrechnung',
    'Abhängigkeiten, Risiken und Übergabe'
  ]
};
story.actors = actors;
story.generatedAt = '2026-07-15T12:00:00+02:00';

const page = id => story.pages.find(item => item.id === id)?.id ?? story.pages[0].id;
const timelineDefs = [
 ['STORY-01','2026-04-01T11:00:00+02:00','Angebot',['UABC-1'],[], 'docs/offers/bc-basic-offer.md','80-Stunden-Angebot mit 10.000-EUR-Obergrenze erstellt','Plan freigegeben, Auftrag simuliert angenommen'],
 ['STORY-02','2026-04-07T10:00:00+02:00','Kickoff',['UABC-14','UABC-32'],['UABC-MTG-001'],'project/bc-basic/project-plan.yaml','Scope, RACI, Kalender und Eskalation entschieden','Discovery gestartet'],
 ['STORY-03','2026-04-09T09:00:00+02:00','Finance Discovery',['UABC-16','UABC-34'],['UABC-MTG-002'],'project/bc-basic/decision-register.yaml','Konten, Gruppen, Dimensionen, Bank und MwSt. abgestimmt','Finanzdesign angenommen'],
 ['STORY-04','2026-04-13T09:00:00+02:00','Prozess Discovery',['UABC-15','UABC-33'],['UABC-MTG-003'],'atlassian/confluence/pages/31-processes.md','P2P, O2C und Lager im Standard modelliert','Fit-to-Standard angenommen'],
 ['STORY-05','2026-04-17T10:00:00+02:00','Daten',['UABC-18','UABC-35'],['UABC-MTG-004'],'project/bc-basic/data-readiness-check.yaml','Drei Datenwellen, Owner und Kontrollsummen festgelegt','Datenbereitschaft bedingt angenommen'],
 ['STORY-06','2026-05-04T09:00:00+02:00','Einrichtungswoche',['UABC-21'],['UABC-MTG-005'],'project/bc-basic/setup-parameter-baseline.yaml','Fuenftaegige Einrichtung mit Finance-Baseline gestartet','Setup-Tag 1 kontrolliert'],
 ['STORY-07','2026-05-07T15:00:00+02:00','SIT',['UABC-39','UABC-40'],['UABC-MTG-006'],'evidence/simulation/pilot-v3-finance-ledger.json','P2P, O2C und Lager inklusive Ausnahmen korrigiert','P2-Defects retestet'],
 ['STORY-08','2026-05-08T09:00:00+02:00','UAT',['UABC-29','UABC-30','UABC-40'],['UABC-MTG-007'],'project/bc-basic/uat-catalog.yaml','Sieben UAT-Faelle gegen Kontrollsummen ausgefuehrt','UAT synthetisch angenommen'],
 ['STORY-09','2026-05-08T13:30:00+02:00','Training',['UABC-41','UABC-42'],['UABC-MTG-008','UABC-MTG-009'],'project/bc-basic/training-plan.yaml','Finance und Operations rollenbezogen geschult','Kompetenzchecks bestanden'],
 ['STORY-10','2026-05-11T08:30:00+02:00','Cutover',['UABC-43','UABC-44'],['UABC-MTG-010'],'evidence/simulation/project-completion.yaml','Mock-Cutover, Smoke Test und Rueckfallpunkt geprobt','GO_SIMULATION'],
 ['STORY-11','2026-05-12T09:00:00+02:00','Hypercare Start',['UABC-45','UABC-46'],['UABC-MTG-011'],'atlassian/confluence/pages/bc-basic-hypercare.md','Triage gestartet und Zahlungsreferenz als P2 aufgenommen','Fix in Arbeit'],
 ['STORY-12','2026-05-19T09:00:00+02:00','Hypercare Triage',['UABC-46'],['UABC-MTG-011'],'evidence/simulation/project-completion.yaml','Zahlungsreferenz korrigiert und identisch retestet','P1/P2 null'],
 ['STORY-13','2026-05-25T09:00:00+02:00','Restart',['UABC-46'],['UABC-MTG-011'],'evidence/simulation/project-completion.yaml','Restartpunkt wiederhergestellt und Operator-Smoke-Test wiederholt','Restart bestanden'],
 ['STORY-14','2026-05-28T14:00:00+02:00','Abschluss',['UABC-47','UABC-48'],['UABC-MTG-008'],'evidence/simulation/pilot-v3-finance-ledger.json','Monatsabschluss und UStVA-Vorschau rechnerisch abgestimmt','Differenz null, externe Uebermittlung gesperrt'],
 ['STORY-15','2026-06-01T10:00:00+02:00','Handover',['UABC-49','UABC-50'],['UABC-MTG-012'],'docs/handover/bc-basic-handover.md','Lieferobjekte, Supportweg, Restpunkte und reale Gates uebergeben','Simulation geschlossen']
];
story.timeline = timelineDefs.map(([id,time,phase,tickets,sessions,evidence,action,result],index) => ({id,time,phase,role:'Projektleitung',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'Projektleitung und Lead BC Consultant',tickets,pages:[page(index < 5 ? 'PAGE-UABC-020' : index < 10 ? 'PAGE-UABC-150' : 'PAGE-UABC-160')],sessions,evidence,decision:'UABC-DEC-BCB-003',action,result:'synthetisch-abgenommen',nextStep:index === timelineDefs.length-1 ? 'Acht reale Kundengates bleiben vor einem echten Go-live separat offen.' : result}));
story.catalogs.sessions = meetings.map(meeting => meeting.id);

const invoicesByWeek = new Map();
for (const log of taskWorklogs) {
  const week = isoWeek(log.date); if (!invoicesByWeek.has(week)) invoicesByWeek.set(week,[]);
  invoicesByWeek.get(week).push({worklogId:log.id,jiraKey:log.taskId,summary:story.tickets.find(ticket=>ticket.id===log.taskId).summary,workDate:log.date,approvedHours:log.hours,hourlyRate:rate,netAmount:log.netAmount,approvalStatus:'synthetisch-genehmigt',approverRef:'ROLE-CUSTOMER-FINANCE'});
}
const invoices = [...invoicesByWeek.entries()].sort().map(([week,lines],index) => ({invoiceId:`UABC-INV-V3-${String(index+1).padStart(3,'0')}`,isoWeek:week,status:'synthetisch-gestellt-nicht-versendet',lines,hours:lines.reduce((s,l)=>s+l.approvedHours,0),netAmount:lines.reduce((s,l)=>s+l.netAmount,0),currency:'EUR',sourceRule:'billable-task-worklogs-only'}));

const financeCases = [
 {caseId:'UABC-V3-P2P-001',process:'P2P',pages:['Purchase Orders','Posted Purchase Receipts','Posted Purchase Invoices','Vendor Ledger Entries'],documents:['PO-260501','PRE-260501','PINV-260501','VPAY-260520'],masterData:{vendor:'K10000 Werkzeughandel Saar',item:'A100 Schraubenset',location:'HAUPT',quantity:10,unitCost:42},amounts:{net:420,inputVat:79.8,gross:499.8},entries:[['Bestand',420,0],['Vorsteuer 19%',79.8,0],['Kreditoren',0,499.8]],control:{debit:499.8,credit:499.8,difference:0},exception:{finding:'VAT Prod. Posting Group leer',correction:'MWST19 gesetzt',retest:'bestanden-synthetisch'}},
 {caseId:'UABC-V3-O2C-001',process:'O2C',pages:['Sales Orders','Posted Sales Shipments','Posted Sales Invoices','Customer Ledger Entries'],documents:['SO-260501','SHP-260501','SINV-260501','CPAY-260519'],masterData:{customer:'D10000 Saarland Montage GmbH',item:'A100 Schraubenset',location:'HAUPT',quantity:10,unitPrice:79,unitCost:42},amounts:{net:790,outputVat:150.1,gross:940.1,cogs:420},entries:[['Debitoren',940.1,0],['Umsatzerloese',0,790],['Umsatzsteuer 19%',0,150.1],['Wareneinsatz',420,0],['Bestand',0,420]],control:{debit:1360.1,credit:1360.1,difference:0},exception:{finding:'Unit Price 75,00 statt 79,00',correction:'Preis auf 79,00 gesetzt',retest:'bestanden-synthetisch'}},
 {caseId:'UABC-V3-PAY-001',process:'Zahlung und Ausgleich',pages:['Payment Reconciliation Journal','Customer Ledger Entries','Vendor Ledger Entries'],documents:['CPAY-260519','VPAY-260520'],amounts:{customerPayment:940.1,vendorPayment:499.8},control:{customerRemaining:0,vendorRemaining:0,difference:0},exception:{finding:'Zahlungsreferenz SINV-260510 nicht gefunden',correction:'Referenz auf SINV-260501 korrigiert',retest:'bestanden-synthetisch'}},
 {caseId:'UABC-V3-BANK-001',process:'Bankabstimmung',pages:['Bank Acc. Reconciliation','Bank Account Ledger Entries'],documents:['BSTMT-260531'],amounts:{openingBalance:5000,customerPayment:940.1,vendorPayment:-499.8,closingBalance:5440.3},control:{statementBalance:5440.3,ledgerBalance:5440.3,difference:0},exception:{finding:'Bankzeile ohne Dokumentreferenz',correction:'manuell gegen CPAY-260519 gematcht',retest:'bestanden-synthetisch'}},
 {caseId:'UABC-V3-INV-001',process:'Lager und Inventur',pages:['Physical Inventory Orders','Item Ledger Entries','Value Entries'],documents:['PHY-260527','ADJ-260527'],amounts:{expectedQuantity:50,countedQuantity:49,adjustmentQuantity:-1,unitCost:42,endingQuantity:49,endingValue:2058},control:{quantityDifference:0,valueDifference:0},exception:{finding:'Zaehlliste 49 gegen Buchbestand 50',correction:'Inventurdifferenz minus 1 gebucht',retest:'bestanden-synthetisch'}},
 {caseId:'UABC-V3-CLOSE-001',process:'Monatsabschluss',pages:['Accounting Periods','G/L Entries','Trial Balance','Aged Accounts Receivable','Aged Accounts Payable'],documents:['CLOSE-2026-05'],amounts:{trialBalanceDebit:11080.2,trialBalanceCredit:11080.2,customerOpen:0,vendorOpen:0,bank:5440.3,inventory:2058},control:{debit:11080.2,credit:11080.2,difference:0},exception:{finding:'Posting Date 2026-04-30 nach Periodenwechsel',correction:'Buchungsdatum auf 2026-05-28 und Allow Posting From angepasst',retest:'bestanden-synthetisch'}},
 {caseId:'UABC-V3-VAT-001',process:'UStVA-Vorschau',pages:['VAT Entries','VAT Returns','VAT Report Setup'],documents:['VAT-2026-05-PREVIEW'],amounts:{taxableSales:790,outputVat:150.1,taxablePurchases:420,inputVat:79.8,payable:70.3},control:{outputMinusInput:70.3,previewPayable:70.3,difference:0},exception:{finding:'Einkaufszeile zunaechst ohne MWST19',correction:'VAT Product Posting Group korrigiert und Beleg neu simuliert',retest:'bestanden-synthetisch'},limitation:'Keine ELSTER-Uebermittlung und keine steuerliche Beratung oder Freigabe.'}
];

const raci = [
 ['Projektauftrag','ROLE-CUSTOMER-SPONSOR','P-PILOT-LEAD-001',['ROLE-CUSTOMER-FINANCE'],['ROLE-CUSTOMER-IT','ACTOR-KUNDEN-SUPPORT']],
 ['Finanzdesign','ROLE-CUSTOMER-FINANCE','P-PILOT-LEAD-001',['ROLE-CUSTOMER-SPONSOR'],['ROLE-CUSTOMER-IT']],
 ['Datenuebernahme','ROLE-CUSTOMER-IT','P-PILOT-LEAD-001',['ROLE-CUSTOMER-FINANCE'],['ROLE-CUSTOMER-SPONSOR']],
 ['UAT','ROLE-CUSTOMER-FINANCE','P-PILOT-LEAD-001',['ROLE-CUSTOMER-PURCHASE','ROLE-CUSTOMER-SALES','ROLE-CUSTOMER-WAREHOUSE'],['ROLE-CUSTOMER-SPONSOR']],
 ['Cutover-GO','ROLE-CUSTOMER-SPONSOR','P-PILOT-LEAD-001',['ROLE-CUSTOMER-FINANCE','ROLE-CUSTOMER-IT'],['ACTOR-KUNDEN-SUPPORT']],
 ['Supportuebergabe','ACTOR-KUNDEN-SUPPORT','P-PILOT-LEAD-001',['ROLE-CUSTOMER-IT','ROLE-CUSTOMER-FINANCE'],['ROLE-CUSTOMER-SPONSOR']]
].map(([activity,accountable,responsible,consulted,informed])=>({activity,accountable,responsible,consulted,informed}));
const pilotV3 = {schemaVersion:1,modelId:'UABC-PILOT-V3-001',classification:'synthetic-complete-no-live-bc',customer:simulatedCompany,calendar:{discoveryStart:'2026-04-01',discoveryEnd:'2026-05-01',implementationWeek:{start:'2026-05-04',end:'2026-05-08',businessDays:['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08']},cutover:'2026-05-11',hypercare:{start:'2026-05-12',end:'2026-05-22'},restart:'2026-05-25',monthEnd:'2026-05-27/2026-05-28',handover:'2026-06-01'},actors,raci,escalation:{P1:'sofort an Sponsorin und Projektleitung; Projektstopp',P2:'innerhalb 4 Stunden an Finance/IT und Projektleitung; Gate blockiert',P3:'naechster Daily; Gate nur bei kumuliertem Risiko blockiert'},meetings,billing:{plannedHours:80,actualHours,varianceHours:actualHours-80,hourlyRate:rate,plannedNetAmount:9600,actualNetAmount:actualAmount,varianceNetAmount:actualAmount-9600,ceilingNetAmount:10000,worklogCount:taskWorklogs.length,invoiceCount:invoices.length,invoices},financeCases,spaces:[{spaceId:'UABC-SPACE-CUSTOMER',roots:['00 Support','01 Unternehmen','02 Business Central','03 Projekte','04 Handbuecher','99 Archiv']},{spaceId:'UABC-SPACE-PRODUCT',purpose:'BC-Basic-Produkt, Scope und Vertrieb'},{spaceId:'UABC-SPACE-CONSULTANT',purpose:'Consultant-Anleitungen und Wissen'}],truthBoundary:{liveBcExecuted:false,customerApprovalReal:false,taxSubmission:false,continia:'out-of-scope',simulationStoreComplete:true,realGatesPending:8}};

const v3View = {schemaVersion:1,viewContract:'uabc-pilot-v3-typed-view-v1',customer:{id:simulatedCompany.customerId,name:simulatedCompany.name,classification:simulatedCompany.classification},project:{id:story.projectId,name:'BC Basic Einrichtung',status:'synthetisch-abgeschlossen',currentPhase:'Handover abgeschlossen',nextGate:'Realer Tenant- und Kunden-Onboarding-Start',scope:simulatedCompany.scope,outOfScope:simulatedCompany.outOfScope},offerScope:{plannedHours:80,actualHours,plannedNetAmount:9600,actualNetAmount:actualAmount,ceilingNetAmount:10000,currency:'EUR'},roles:actors,meetingsTrainings:meetings,tickets:story.tickets.map(ticket=>({id:ticket.id,type:ticket.type,parent:ticket.parent,summary:ticket.summary,status:ticket.status,statusHistory:ticket.statusHistory,comments:ticket.comments,worklogs:ticket.worklogs,transcriptRefs:ticket.meetingTranscriptRefs,deliverableRefs:ticket.deliverableRefs,evidenceRefs:ticket.evidenceRefs,pageRefs:ticket.pageRefs})),weeklyInvoices:invoices,decisionsRisksDefects:{decisions:story.catalogs.decisions,risks:[{id:'UABC-RISK-V3-001',title:'Steuerliche Kundenfreigabe',status:'real-gate-pending'},{id:'UABC-RISK-V3-002',title:'Produktivberechtigungen',status:'real-gate-pending'}],defects:financeCases.map(item=>({id:`DEF-${item.caseId}`,process:item.process,...item.exception}))},spacesPages:{spaces:pilotV3.spaces,pages:story.pages},useCasesBcSessions:financeCases,tests:{uat:'project/bc-basic/uat-catalog.yaml',sit:'evidence/simulation/pilot-v3-finance-ledger.json',retests:financeCases.map(item=>({caseId:item.caseId,result:item.exception.retest}))},deliverables:story.catalogs.deliverables,evidence:story.catalogs.evidenceRefs,hypercare:{start:'2026-05-12',end:'2026-05-22',restart:'2026-05-25',openP1:0,openP2:0},handover:{date:'2026-06-01',status:'synthetisch-abgeschlossen',supportOwner:'ACTOR-KUNDEN-SUPPORT',realGatesPending:8},runtime:{requiresGit:false,readOnly:true}};

fs.writeFileSync(storyPath,`${JSON.stringify(story,null,2)}\n`,'utf8');
fs.writeFileSync(path.join(root,'project/bc-basic/pilot-v3.yaml'),YAML.stringify(pilotV3),'utf8');
fs.writeFileSync(path.join(root,'evidence/simulation/pilot-v3-finance-ledger.json'),`${JSON.stringify({schemaVersion:1,evidenceId:'UABC-EV-PILOT-V3-FINANCE-001',classification:'synthetic-complete-no-live-bc',sourceSupport:'Microsoft Learn; siehe docs/research/sources.yaml',cases:financeCases,overallControl:{allDifferencesZero:financeCases.every(item=>Object.values(item.control).filter(value=>typeof value==='number'&&String(Object.keys(item.control).find(key=>item.control[key]===value)).toLowerCase().includes('difference')).every(value=>value===0)),externalTransmission:false}},null,2)}\n`,'utf8');
fs.writeFileSync(path.join(root,'exports/project-data/v1/pilot-v3-view.json'),`${JSON.stringify(v3View,null,2)}\n`,'utf8');

const jiraPath = path.join(root,'atlassian/jira/issues/bc-basic-story-tickets.yaml');
const jira = YAML.parse(fs.readFileSync(jiraPath,'utf8')); const ticketMap = new Map(story.tickets.map(ticket=>[ticket.id,ticket]));
for (const record of jira.ticketRecords ?? []) {
  const ticket=ticketMap.get(record.id);
  Object.assign(record,ticket,{
    history:ticket.statusHistory,
    acceptance:ticket.acceptanceCriteria,
    evidence:ticket.evidenceRefs,
    meetingTranscriptRefs:ticket.meetingTranscriptRefs,
    worklogs:ticket.worklogs,
    comments:ticket.comments
  });
  delete record.statusHistory;
  delete record.acceptanceCriteria;
}
Object.assign(jira,{classification:'synthetic-canonical-project-v3',actorProfiles:actors,generated:true,generatedAt:'2026-07-15T12:00:00+02:00',recordCount:50,customerStoryCount:50,countedWorklogHours:actualHours});
fs.writeFileSync(jiraPath,YAML.stringify(jira),'utf8');

const actorRegister={schemaVersion:2,registerId:'UABC-ACTOR-REGISTER-001',projectId:story.projectId,truthPolicy:'Kajetan Kalicki ist die reale Consultantrolle. Alle benannten Saarblick-Personen sind ausdruecklich simulierte Kundenrollen.',allowedActorTypes:['human','simulated-customer-role','codex-spectra','playwright','system-automation'],customer:simulatedCompany,raci,escalation:pilotV3.escalation,actors};
fs.writeFileSync(path.join(root,'project/bc-basic/actor-register.yaml'),YAML.stringify(actorRegister),'utf8');

const meetingIndex={schemaVersion:2,projectId:story.projectId,simulation:true,classification:'synthetic-current-pilot-v3',currentAuthority:true,truthBoundary:'Alle Personen, Termine, Aussagen und Entscheidungen sind Bestandteile der Simulation und keine realen Kundentermine oder BC-Ausfuehrung.',meetings:[]};
for(const meeting of meetings){
  const ticketRefs=story.tickets.filter(ticket=>ticket.meetingTranscriptRefs.includes(meeting.id)).map(ticket=>ticket.id);
  const participantNames=meeting.participants.map(id=>`${actorById.get(id)?.displayName} (${actorById.get(id)?.actorType==='human'?'reale Consultantrolle':'simulierte Kundenrolle'})`).join(', ');
  const file=`atlassian/confluence/meetings/${meeting.id}.md`;
  const body=`---\nid: ${meeting.id}\ntitle: ${meeting.title}\ndate: ${meeting.time.slice(0,10)}\nstatus: simulated-complete\nclassification: synthetic-current-pilot-v3\nprojectId: ${story.projectId}\nparticipantRefs: [${meeting.participants.join(', ')}]\nticketRefs: [${ticketRefs.join(', ')}]\nevidenceClaimed: false\n---\n\n# ${meeting.title}\n\n> Ausdruecklich simuliertes Meeting der ${simulatedCompany.name}; keine reale Kundenbesprechung und keine Live-BC-Ausfuehrung. Kajetan Kalicki handelt als reale Consultantrolle, alle Saarblick-Ansprechpartner als simulierte Rollen.\n\n## Teilnehmer und Ziel\n\n${participantNames}. Ziel: ${meeting.agenda}.\n\n## Transkript\n\n**Kajetan Kalicki:** Wir pruefen heute ${meeting.title} gegen Scope, Zeit, Verantwortlichkeit und die dokumentierte Business-Central-Wirkung. Live-Buchungen bleiben ausgeschlossen.\n\n**${actorById.get(meeting.participants[1]).displayName}:** Fuer Saarblick sind die synthetischen Eingaben vorbereitet. Offene Annahmen werden als Entscheidung oder Defect festgehalten und nicht stillschweigend uebernommen.\n\n**Kajetan Kalicki:** Wir dokumentieren je Punkt die BC-Seite, relevante Felder, Aktion, erwartete Postenwirkung, Kontrollsumme und den Retest.\n\n**${actorById.get(meeting.participants.at(-1)).displayName}:** Die Gateentscheidung gilt nur fuer die Simulation. Produktivberechtigung, Steuerfreigabe und echte Kundenabnahme bleiben separate reale Gates.\n\n## Beschluesse\n\n- ${meeting.result}\n- Agenda: ${meeting.agenda}.\n- Zugeordnete Tickets: ${ticketRefs.join(', ')}.\n- Jede Abweichung erhaelt Owner, Korrektur und identischen Retest; offene P1/P2 blockieren das Folgegate.\n\n## Actions\n\n| Action | Verantwortlich | Termin | Ergebnis |\n|---|---|---|---|\n| Evidence und Kontrollsummen an Tickets verlinken | Kajetan Kalicki | ${meeting.time.slice(0,10)} | abgeschlossen-synthetisch |\n| Fachliche Eingaben und Gategrenze bestaetigen | ${actorById.get(meeting.participants[1]).displayName} | ${meeting.time.slice(0,10)} | abgeschlossen-synthetisch |\n| Offene reale Gates im Handover fortschreiben | Dr. Lena Hartmann | 2026-06-01 | offen-real, abgeschlossen-synthetisch |\n`;
  fs.writeFileSync(path.join(root,file),body.replaceAll('Scope','Umfang').replaceAll('Live-Buchungen','Produktivbuchungen').replaceAll('Defect','Fehler').replaceAll('Gates','Freigaben').replaceAll('Gateentscheidung','Freigabeentscheidung').replaceAll('Folgegate','Folgefreigabe').replaceAll('Owner','Verantwortung').replaceAll('## Actions','## Aufgaben').replaceAll('| Action |','| Aufgabe |').replaceAll('Evidence','Nachweis').replaceAll('Handover','Übergabe').replaceAll('Restart','Wiederanlauf'),'utf8');
  meetingIndex.meetings.push({id:meeting.id,title:meeting.title,date:meeting.time.slice(0,10),time:meeting.time,phase:meeting.phase,status:'simulated-complete',transcriptPath:file,facilitatorActorRef:'P-PILOT-LEAD-001',actorRefs:meeting.participants,jiraRefs:ticketRefs,agenda:meeting.agenda,result:meeting.result,evidenceClaimed:false});
}
fs.writeFileSync(path.join(root,'atlassian/confluence/meetings/index.yaml'),YAML.stringify(meetingIndex),'utf8');

const offer=`# Angebot: BC Basic Einrichtung\n\n## Angebotsgrenze\n\nDieses Dokument beschreibt den ausdruecklich simulierten Beispielkunden **${simulatedCompany.name}**. Es ist kein real angenommenes Angebot und kein Nachweis einer produktiven Business-Central-Leistung. Continia, Bankfeed und Steueruebermittlung sind nicht im Umfang.\n\n## Umfang und Preis\n\n| Position | Plan | Simulations-Ist | Abweichung |\n|---|---:|---:|---:|\n| Beratungsstunden | 80,00 h | ${actualHours.toFixed(2).replace('.',',')} h | -2,00 h |\n| Satz | 120,00 EUR/h | 120,00 EUR/h | 0,00 EUR/h |\n| Netto | 9.600,00 EUR | ${actualAmount.toLocaleString('de-DE',{minimumFractionDigits:2})} EUR | -240,00 EUR |\n\nDer Plan bleibt strikt unter der Obergrenze von 10.000 EUR. Abgerechnet werden nur genehmigte Task-Worklogs; Phase, Epic und Story enthalten ausschliesslich Rollups. Die Simulation erzeugt neun woechentliche Rechnungsprojektionen, versendet aber keine Rechnung und behauptet keine Zahlung.\n\n## Projektmodell\n\nDiscovery laeuft vom 01.04. bis 01.05.2026. Die fuenftaegige Einrichtungswoche liegt vom 04.05. bis 08.05.2026, der Mock-Cutover am 11.05., Hypercare vom 12.05. bis 22.05., Restart am 25.05., Monatsabschluss und UStVA-Vorschau am 27./28.05. und Handover am 01.06.2026. Die 50 bestehenden UABC-Tickets, zwoelf Meetingtranskripte, sieben rechenbare Prozessfaelle und 19 fakturierbare Task-Worklogs bilden die Leistungsgrundlage.\n\n## Lieferobjekte und Akzeptanz\n\nGeliefert werden Projektauftrag, Discovery-/Fit-to-Standard-Ergebnisse, Setup-Baseline, Daten- und Testnachweise, Schulungsunterlagen, Cutover-/Hypercare-Paket sowie Kunden- und Consultanthandbuch. Jede Leistung benoetigt Ticket, Ergebnisobjekt, Transkriptbezug, Test oder Readback und eine synthetische Rollenabnahme. Acht reale Gates fuer Tenant, Lizenzen, Security, UAT, Cutover, ersten Abschluss, UStVA und Supportannahme bleiben vor einem echten Kunden-Go-live offen.\n`;
fs.writeFileSync(path.join(root,'docs/offers/bc-basic-offer.md'),offer,'utf8');

const chronicle=`# Projektchronik BC Basic\n\n## Fuehrender Stand V3\n\nDer repositorybasierte Referenzlauf fuer **${simulatedCompany.name}** besitzt den Status \`synthetic-closed-v3\`. Er bildet keine reale Gesellschaft und keine produktive BC-Ausfuehrung ab. Kajetan Kalicki ist die reale Consultantrolle; alle benannten Saarblick-Ansprechpartner sind simulierte Kundenrollen.\n\n## Verlauf\n\n- 01.04.-01.05.2026: Angebot, Kickoff, Finance- und Prozess-Discovery, Datenmapping, Scope und RACI.\n- 04.05.-08.05.2026: fuenftaegige Einrichtung, SIT, UAT sowie Finance- und Operations-Training.\n- 11.05.-25.05.2026: Mock-Cutover, Hypercare, Korrektur der Zahlungsreferenz und Restart.\n- 27.05.-01.06.2026: Monatsabschluss, UStVA-Vorschau, Retro und Handover.\n\nP2P, O2C, Zahlungsausgleich, Bankabstimmung, Inventur, Monatsabschluss und UStVA-Vorschau besitzen konkrete Belege, Betragskontrollen, Abweichung, Korrektur und bestandenen synthetischen Retest. Das Planbudget betraegt 80 Stunden/9.600 EUR; aus den Worklogs aller 19 fakturierbaren Tasks ergeben sich ${actualHours} Stunden/${actualAmount} EUR. Neun woechentliche Rechnungsprojektionen sind nicht versendet.\n\n## Ergebnisgrenze\n\nDie Projektstory fuehrt 50 unveraenderte UABC-IDs in drei Phasen. Zwoelf eigenstaendige Transkripte dokumentieren Erwartungen, Entscheidungen, Actions und Gates. Acht reale Kundengates bleiben PENDING; insbesondere wurden weder ein Live-Tenant beschrieben noch Steuerdaten uebermittelt oder Kundenfreigaben erfunden. Die abgeloeste V2-OpenSpec-Aenderung bleibt im Archiv erhalten.\n`;
fs.writeFileSync(path.join(root,'docs/reports/bc-basic-project-chronicle.md'),chronicle,'utf8');

fs.writeFileSync(path.join(root,'docs/guides/bc-basic-requirements.md'),`# BC Basic Einrichtung: Anforderungen\n\nDie V3-Referenz umfasst die bestehenden 50 UABC-Tickets in drei Phasen, neun Liefergegenstaende, 19 fakturierbare Tasks mit ${actualHours} Iststunden, zwoelf dokumentierte Meetings, drei Wissensraeume sowie Kunden- und Consultanthandbuch.\n\nFachlich muessen Grundeinrichtung, Finanzbuchhaltung, Einkauf, Verkauf, einfaches Lager, Zahlung und Bank, Monatsabschluss und UStVA-Vorschau jeweils mit konkreten BC-Seiten, Feldern, Aktionen, Postenwirkung, Kontrollsumme, Abweichung, Korrektur und Retest beschrieben sein. Continia bleibt ausserhalb des Pilots.\n\nDer Repository-Nachweis darf keinen Live-Tenant, keine echte Kundenabnahme, keine Rechnung, Zahlung oder Steueruebermittlung behaupten. Vor einem realen Go-live bleiben acht beweispflichtige Kundengates offen.\n`,'utf8');

fs.writeFileSync(path.join(root,'docs/guides/bc-basic-delivery-plan.md'),`# Lieferplan: BC Basic Einrichtung\n\nDer Plan bildet eine realistische, aber ausdruecklich synthetische Einfuehrung fuer ${simulatedCompany.name} ab.\n\n| Phase | Zeitraum | Schwerpunkt | Gate |\n|---|---|---|---|\n| 1 Vorbereitung | 01.04.-01.05.2026 | Angebot, Discovery, Scope, RACI, Daten | Setup-ready |\n| 2 Einrichtung | 04.05.-11.05.2026 | fuenf Tage Setup, SIT, UAT, Training, Mock-Cutover | GO_SIMULATION |\n| 3 Hypercare | 12.05.-01.06.2026 | Triage, Restart, Abschluss, UStVA-Vorschau, Handover | synthetic-closed-v3 |\n\nPlan: 80 Stunden/9.600 EUR. Simulations-Ist: ${actualHours} Stunden/${actualAmount} EUR aus den Worklogs aller 19 fakturierbaren Tasks; Eltern-Tickets sind nicht fakturierbar. Zwoelf Transkripte, neun Wochenrechnungsprojektionen und sieben rechenbare Prozessfaelle verbinden Arbeit, Erwartung, Ergebnis und Evidence.\n\nDer Twin liest den unveraenderlichen filesystem-basierten Katalog ohne Git-Laufzeitabhaengigkeit. Acht reale Gates bleiben vor Kunden-Go-live offen.\n`,'utf8');

const projectPage=`---\nid: UABC-PROJECT\ntitle: 00 Hilfe und Projektumgebung\nparent: null\nowners: [P-PILOT-LEAD-001, ROLE-CUSTOMER-SPONSOR]\nstatus: published\nspaceId: UABC-SPACE-CUSTOMER\nspaceType: customer-project\norder: 0\nstoryPageId: PAGE-UABC-000\npurpose: Zentraler Einstieg in Projektumgebung, Supportweg und Wahrheitsgrenzen.\naudience: [Projektleitung, Key User, Support]\njiraRefs: [UABC-32, UABC-33, UABC-47, UABC-50]\nreferenceIds: [UABC-REQ-BCB-001, UABC-REQ-BCB-002, UABC-REQ-BCB-010, UABC-REQ-BCB-011]\nlastReviewed: 2026-07-15\nversion: 6\n---\n\n# 00 Hilfe und Projektumgebung\n\n## Aktueller Projektstatus\n\nDer V3-Referenzlauf fuer **${simulatedCompany.name}** besitzt den Status \`synthetic-closed-v3\`: 50 UABC-Tickets, zwoelf Transkripte, ${actualHours} Task-Iststunden und ${actualAmount} EUR Simulations-Ist. Dies ist kein Live-Tenant-Nachweis. Reale UAT, Cutover, erster Abschluss, UStVA und Supportannahme bleiben offen.\n\n## Umgebung und Zugriff\n\n| Bereich | Simulationsstand | Reale Anforderung |\n|---|---|---|\n| Gesellschaft | Saarblick-Handelsmodell | Tenant- und Company-ID per Readback pruefen |\n| Module | Finance, Einkauf, Verkauf, einfaches Lager | Lizenz und Berechtigung bestaetigen |\n| Integrationen | keine | separat beauftragen und pruefen |\n| Continia | out of scope | separates Projekt |\n| Reset | Restart synthetisch geprobt | realen Wiederanlaufpunkt nachweisen |\n\nZugangsdaten, Cookies, Tokens, Browserprofile sowie reale Bank- oder Personendaten duerfen nicht in Projektartefakten stehen.\n\n## Ansprechpartner und Eskalation\n\nKajetan Kalicki ist reale Projektleitung und Lead BC Consultant. Dr. Lena Hartmann (Sponsorin), Miriam Becker (Finance/UAT), Tobias Klein (Einkauf), Julia Brandt (Verkauf), Mehmet Yilmaz (Lager), Nora Schmitt (IT) und Paul Weber (Support) sind ausdruecklich simulierte Rollen. P1 stoppt das Gate sofort, P2 wird innerhalb vier Stunden triagiert, P3 im naechsten Daily.\n\n## Supportweg\n\nEin Supportfall nennt Umgebung, Rolle, Zeitpunkt, Seite und Aktion, Soll/Ist, Fehlertext, letzten erfolgreichen Schritt, reproduzierbaren Weg, Korrektur und Retest. Finanz-, VAT- oder Bestandsabweichungen werden nicht durch manuelle Gegenbuchungen verdeckt.\n\n## Naechster realer Schritt\n\nEin kontrollierter Nur-Lese-Onboardingtermin prueft Tenant, Gesellschaft, Lizenzen, Rollen und Baseline. Erst danach duerfen Setup, Datenuebernahme und UAT in einer echten Kundenumgebung autorisiert werden. Der Repository-Lauf liefert Runbook und Erwartungswerte, aber keine reale Freigabe.\n\n## Referenzen\n\n- [Projektstory](../../../evidence/simulation/project-story.json)\n- [V3-Pilotmodell](../../../project/bc-basic/pilot-v3.yaml)\n- [Projektplan](../../../project/bc-basic/project-plan.yaml)\n- [Billing](../../../project/bc-basic/billing.yaml)\n- [Meetingindex](../meetings/index.yaml)\n- [Readiness-Vertrag](../../../governance/production-readiness.json)\n\n<!-- story-metadata {"id":"PAGE-UABC-000","title":"00 Hilfe und Projektumgebung","parent":null,"version":6,"status":"published"} -->\n`;
fs.writeFileSync(path.join(root,'atlassian/confluence/pages/00-project.md'),projectPage.replace('owners: [P-PILOT-LEAD-001, ROLE-CUSTOMER-SPONSOR]','owners: [P-002, P-005]').replace('version: 6','version: 5').replace('"version":6','"version":5'),'utf8');
for(const relative of ['docs/offers/bc-basic-offer.md','docs/reports/bc-basic-project-chronicle.md','docs/guides/bc-basic-requirements.md','docs/guides/bc-basic-delivery-plan.md','atlassian/confluence/pages/00-project.md']){
  const absolute=path.join(root,relative);fs.writeFileSync(absolute,wrapMarkdown(fs.readFileSync(absolute,'utf8')),'utf8');
}

const reconciliationPath=path.join(root,'evidence/simulation/project-reconciliation.json');
const reconciliation=JSON.parse(fs.readFileSync(reconciliationPath,'utf8'));
Object.assign(reconciliation.offer,{version:3,hours:80,rate,amount:9600,currency:'EUR'});
Object.assign(reconciliation.actual,{version:4,hours:actualHours,rate,amount:actualAmount,currency:'EUR'});
Object.assign(reconciliation.variance,{hours:actualHours-80,rate:0,amount:actualAmount-9600,reason_code:'efficiency',reason:'Der V3-Plan umfasst 80 Stunden und 9.600 EUR. Das synthetische Ist von 78 Stunden und 9.360 EUR stammt ausschliesslich aus 19 genehmigten Task-Worklogs; Eltern-Tickets sind nicht fakturierbar.'});
fs.writeFileSync(reconciliationPath,`${JSON.stringify(reconciliation,null,2)}\n`,'utf8');

const readinessPath=path.join(root,'governance/production-readiness.json');
const readiness=JSON.parse(fs.readFileSync(readinessPath,'utf8'));
readiness.artifacts.transcripts=meetings.map(meeting=>`atlassian/confluence/meetings/${meeting.id}.md`);
fs.writeFileSync(readinessPath,`${JSON.stringify(readiness,null,2)}\n`,'utf8');

const decisionPath=path.join(root,'project/bc-basic/decision-register.yaml');
const decisionRegister=YAML.parse(fs.readFileSync(decisionPath,'utf8'));
const oldDecision=decisionRegister.decisions?.find(item=>item.id==='UABC-DEC-BCB-010');
if(oldDecision){
  for(const key of Object.keys(oldDecision))delete oldDecision[key];
  Object.assign(oldDecision,{id:'UABC-DEC-BCB-010',status:'superseded',decidedAt:'2026-07-13',decidedByRef:'real-repository-user',decidedByActorRef:'P-PILOT-LEAD-001',decidedByRole:'Projektleitung',statement:'Historischer Rebaseline-Stand vor Pilot V3. Die damals nur vorbereiteten Worklogs und blockierten Browserversuche besitzen keine aktuelle Abrechnungs- oder Ausfuehrungswirkung.',supersededBy:'UABC-DEC-BCB-011'});
}
if(!decisionRegister.decisions?.some(item=>item.id==='UABC-DEC-BCB-011'))decisionRegister.decisions.push({id:'UABC-DEC-BCB-011',status:'decided',decidedAt:'2026-07-15',decidedByRef:'real-repository-user',decidedByActorRef:'P-PILOT-LEAD-001',decidedByRole:'Projektleitung',statement:'V3 nutzt den 80-Stunden-Plan zu 120 EUR und 9.600 EUR als synthetische Angebotsbasis. 78 Iststunden und 9.360 EUR werden ausschliesslich aus 19 genehmigten Task-Worklogs abgeleitet; neun Wochenrechnungsprojektionen werden weder versendet noch als reale Kundenrechnung behauptet. Acht reale Kundengates bleiben offen.'});
decisionRegister.historicalDecisionRefs=[...new Set([...(decisionRegister.historicalDecisionRefs??[]),'UABC-DEC-BCB-010'])];
decisionRegister.activePilotDecisionRefs=[...new Set((decisionRegister.activePilotDecisionRefs??[]).filter(id=>id!=='UABC-DEC-BCB-010').concat('UABC-DEC-BCB-011'))];
fs.writeFileSync(decisionPath,YAML.stringify(decisionRegister),'utf8');

const billingPath=path.join(root,'project/bc-basic/billing.yaml'); const billing=YAML.parse(fs.readFileSync(billingPath,'utf8'));
Object.assign(billing,{status:'synthetic-closed-v3',plannedBillableHours:80,plannedNetAmount:9600,forecast:{source:'evidence/simulation/project-story.json:tickets[type=task].worklogs',countingRule:'billable-task-worklogs-only',plannedHours:80,consumedHours:actualHours,committedHours:actualHours,remainingHours:2,estimateToCompleteHours:0,estimateAtCompletionHours:actualHours,varianceHours:actualHours-80,hourlyRate:rate,plannedNetAmount:9600,consumedNetAmount:actualAmount,estimateAtCompletionNetAmount:actualAmount,varianceNetAmount:actualAmount-9600,phaseHours:Object.fromEntries(['UABC-1','UABC-2','UABC-3'].map(id=>[id,story.tickets.find(ticket=>ticket.id===id).actualHours])),invoiceLineSource:'synthetic-task-worklogs-only',parentBillingLines:false},simulationClose:{status:'synthetic-closed-v3',offerVersion:'pilot-v3-simulation-2026-06-01',plannedHours:80,actualHours,hourlyRate:rate,plannedNetAmount:9600,actualNetAmount:actualAmount,worklogCount:taskWorklogs.length,invoiceCount:invoices.length,reconciliationResult:'synthetic-complete',evidence:'project/bc-basic/pilot-v3.yaml',truthBoundary:'Keine reale Rechnung, Zahlung, Kundenfreigabe oder Steueruebermittlung.'},worklogs:taskWorklogs.map(log=>({worklogId:log.id,jiraKey:log.taskId,personRef:log.actorRef,workDate:log.date,isoWeek:isoWeek(log.date),hours:log.hours,billable:true,approvalStatus:'approved-synthetic',approverRef:'ROLE-CUSTOMER-FINANCE',invoiceRef:invoices.find(invoice=>invoice.lines.some(line=>line.worklogId===log.id)).invoiceId})),invoices});
fs.writeFileSync(billingPath,YAML.stringify(billing),'utf8');

const referencePath=path.join(root,'project/bc-basic/reference-simulation.yaml'); const reference=YAML.parse(fs.readFileSync(referencePath,'utf8'));
reference.meetings=meetings.map(meeting=>({id:meeting.id,path:`atlassian/confluence/meetings/${meeting.id}.md`,phase:meeting.phase}));
fs.writeFileSync(referencePath,YAML.stringify(reference),'utf8');

const planPath=path.join(root,'project/bc-basic/project-plan.yaml'); const plan=YAML.parse(fs.readFileSync(planPath,'utf8'));
Object.assign(plan.schedule,{timelineAuthority:'pilot-v3-april-june-2026',referenceSimulationStart:'2026-04-01',referenceSimulationEnd:'2026-06-01',customerTemplateStatus:'not-active',notice:'Die V3-Referenzsimulation besitzt eine einzige fuehrende April-bis-Juni-Zeitachse.',startDate:'2026-04-01',implementationWeek:'2026-05-04/2026-05-08',hypercareEndDate:'2026-05-22'});
for(const phase of plan.phases??[]){const dates=phase.id==='UABC-1'?['2026-04-01','2026-04-30']:phase.id==='UABC-2'?['2026-05-04','2026-05-11']:['2026-05-12','2026-06-01'];phase.startDate=dates[0];phase.endDate=dates[1];phase.scheduleRole='current-synthetic-pilot-v3';}
fs.writeFileSync(planPath,YAML.stringify(plan),'utf8');

const sourcesPath=path.join(root,'docs/research/sources.yaml'); const sources=YAML.parse(fs.readFileSync(sourcesPath,'utf8')); sources.sources??=[];
const officialSources=[
 {id:'UABC-SRC-V3-P2P-001',kind:'microsoft-learn',title:'Record purchases with purchase invoices',url:'https://learn.microsoft.com/en-us/dynamics365/business-central/purchasing-how-record-purchases',retrievedAt:'2026-07-15',truthClass:'BC-Standard',appliesTo:'P2P; Receive/Invoice, Preview Posting und resultierende Vendor-, G/L-, VAT- und Item Ledger Entries'},
 {id:'UABC-SRC-V3-CASH-001',kind:'microsoft-learn',title:'Apply payments automatically and reconciling bank accounts',url:'https://learn.microsoft.com/en-us/dynamics365/business-central/receivables-apply-payments-auto-reconcile-bank-accounts',retrievedAt:'2026-07-15',truthClass:'BC-Standard',appliesTo:'Zahlungsausgleich und Payment Reconciliation Journal; synthetische Werte sind Projektannahmen'},
 {id:'UABC-SRC-V3-BANK-001',kind:'microsoft-learn',title:'Reconcile bank accounts',url:'https://learn.microsoft.com/en-us/dynamics365/business-central/bank-how-reconcile-bank-accounts-separately',retrievedAt:'2026-07-15',truthClass:'BC-Standard',appliesTo:'Bank Acc. Reconciliation, Matching und Differenz-null-Kontrolle'},
 {id:'UABC-SRC-V3-INVENTORY-001',kind:'microsoft-learn',title:'Adjust inventory in Dynamics 365 Business Central',url:'https://learn.microsoft.com/en-us/training/modules/adjust-inventory/',retrievedAt:'2026-07-15',truthClass:'BC-Standard',appliesTo:'Physische Inventur und Bestandskorrektur; Menge und Werte sind synthetisch'},
 {id:'UABC-SRC-V3-CLOSE-001',kind:'microsoft-learn',title:'Overview of tasks to close accounting periods',url:'https://learn.microsoft.com/en-us/dynamics365/business-central/year-how-complete-period-end-processes',retrievedAt:'2026-07-15',truthClass:'BC-Standard',appliesTo:'Monatsabschlusskontrollen und erlaubte Buchungsperioden; kein Live-Abschlussnachweis'},
 {id:'UABC-SRC-V3-VAT-001',kind:'microsoft-learn',title:'Set up value-added tax',url:'https://learn.microsoft.com/en-us/dynamics365/business-central/finance-setup-vat',retrievedAt:'2026-07-15',truthClass:'BC-Standard-mit-offener-deutscher-Steuerfreigabe',appliesTo:'VAT Posting Setup und UStVA-Vorschau; keine Steuerberatung oder Uebermittlung'}
];
for(const source of officialSources)if(!sources.sources.some(item=>item.id===source.id))sources.sources.push(source);
fs.writeFileSync(sourcesPath,YAML.stringify(sources),'utf8');

const indexPath=path.join(root,'exports/project-data/v1/index.yaml'); const index=YAML.parse(fs.readFileSync(indexPath,'utf8'));
const remove=new Set(['atlassian/jira/issues/bc-basic-project.yaml','atlassian/jira/people.yaml']);
index.artifacts=(index.artifacts??[]).filter(item=>!remove.has(item.path));
const ensure=(id,kind,artifactPath,references=[])=>{const format=path.extname(artifactPath).slice(1).replace('yml','yaml');const existing=index.artifacts.find(item=>item.path===artifactPath); if(existing)Object.assign(existing,{id,kind,kindId:existing.kindId??kind,format:existing.format??format,references}); else index.artifacts.push({id,kind,kindId:kind,format,path:artifactPath,references});};
ensure('UABC-PILOT-V3-001','pilot-v3','project/bc-basic/pilot-v3.yaml',['UABC-BC-BASIC-001']);
ensure('UABC-EV-PILOT-V3-FINANCE-001','finance-evidence','evidence/simulation/pilot-v3-finance-ledger.json',['UABC-PILOT-V3-001']);
ensure('UABC-TWIN-PILOT-V3-VIEW-001','typed-project-view','exports/project-data/v1/pilot-v3-view.json',['UABC-PILOT-V3-001']);
const meetingArtifactIds={'UABC-MTG-001':'UABC-SRC-BCB-MTG-TRANSCRIPT-001','UABC-MTG-002':'UABC-SRC-BCB-MTG-TRANSCRIPT-002','UABC-MTG-003':'UABC-SRC-BCB-MTG-TRANSCRIPT-003'};
for(const meeting of meetings)ensure(meetingArtifactIds[meeting.id]??`UABC-SRC-BCB-${meeting.id}`,'meeting-transcript',`atlassian/confluence/meetings/${meeting.id}.md`,story.tickets.filter(ticket=>ticket.meetingTranscriptRefs.includes(meeting.id)).map(ticket=>ticket.id));
const documentUpdates=new Map([
  ['atlassian/confluence/meetings/UABC-MTG-001.md',{title:'Kickoff'}],
  ['atlassian/confluence/meetings/UABC-MTG-002.md',{title:'Discovery Finance'}],
  ['atlassian/confluence/meetings/UABC-MTG-003.md',{title:'Prozessworkshop'}],
  ['atlassian/confluence/pages/00-project.md',{lastReviewed:'2026-07-15'}],
  ['docs/guides/bc-basic-requirements.md',{title:'BC Basic Einrichtung: Anforderungen'}],
  ['docs/guides/bc-basic-delivery-plan.md',{title:'Lieferplan: BC Basic Einrichtung'}],
  ['docs/offers/bc-basic-offer.md',{title:'Angebot: BC Basic Einrichtung'}],
  ['docs/reports/bc-basic-project-chronicle.md',{title:'Projektchronik BC Basic'}]
]);
for(const definition of index.documentCatalog?.definitions??[]){const artifact=index.artifacts.find(item=>item.id===definition.artifactId);const update=artifact&&documentUpdates.get(artifact.path);if(update)Object.assign(definition,update);}
index.artifacts.sort((a,b)=>String(a.path).localeCompare(String(b.path))); index.artifactCount=index.artifacts.length;
index.runtime={...(index.runtime??{}),requiresGit:false,readOnly:true,entryPoint:'exports/project-data/v1/snapshots/current.json'};
fs.writeFileSync(indexPath,YAML.stringify(index),'utf8');

console.log(`BC-Basic-Pilot V3 materialisiert: 50 Tickets, ${meetings.length} Meetings, ${taskWorklogs.length} Worklogs, ${invoices.length} Wochenrechnungen, ${actualHours} Stunden, ${actualAmount} EUR, ${financeCases.length} rechenbare Prozessfaelle.`);

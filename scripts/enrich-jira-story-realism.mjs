import fs from 'node:fs';
import YAML from 'yaml';

const STORY='evidence/simulation/project-story.json';
const ACTORS='project/bc-basic/actor-register.yaml';
const LEAD='P-PILOT-LEAD-001';

const descriptions={
'UABC-1':'Phase 1 schafft einen entscheidungsfaehigen Projektauftrag, ein abgestimmtes Standarddesign und ein pruefbares Datenpaket. Eintritt sind benannte Rollen und vorbereitete Workshops; Austritt sind entschiedener Scope, Finance-/Prozessdesign und Datenbereitschaft.',
'UABC-2':'Phase 2 setzt die entschiedene Baseline in nachvollziehbarer Reihenfolge um, stimmt drei Datenwellen ab und weist Kernprozesse, UAT und Rollenkompetenz nach. Die Phase endet erst nach bestandener Prozess- und Abnahmeprobe.',
'UABC-3':'Phase 3 stabilisiert den simulierten Go-live, korrigiert den Zahlungsreferenzbefund, probt Finance-Abschluss und VAT-Vorschau und uebergibt Betrieb und Support nach einer Retro ohne offene P1/P2.',
'UABC-4':'Der Arbeitsstrang verbindet Angebot, Projektauftrag, Scope, Rollen, drei Discovery-Workshops und die Eintrittskriterien fuer UAT und Cutover. Ergebnis sind ein startfaehiger Auftrag und ein klarer Entscheidungsweg; BC-Konfiguration und produktive Freigaben liegen ausserhalb dieses Epics.',
'UABC-5':'Der Arbeitsstrang entscheidet Konten-, Buchungsgruppen-, VAT-, Dimensions-, Einkaufs-, Verkaufs- und Lagerstandard vor der Einrichtung. Ergebnis ist ein Fit-to-Standard-Blueprint mit sichtbaren Kunden- und Steuerbestaetigungen.',
'UABC-6':'Der Arbeitsstrang macht zehn Migrationsobjekte in drei Wellen import- und abstimmbar. Ergebnis sind Owner, Mapping, Qualitaetsregeln, Fehlerkorrektur und differenzfreie Kontrollsummen.',
'UABC-7':'Der Arbeitsstrang richtet Gesellschaft, Perioden, Nummernserien, Finance, VAT und Funktionstrennung in fachlich richtiger Reihenfolge ein. Ergebnis ist eine reproduzierbare Baseline fuer Prozesse und UAT.',
'UABC-8':'Der Arbeitsstrang uebernimmt synthetische Stamm- und Eroeffnungsdaten, behandelt Importfehler und stimmt Mengen, offene Posten und Salden ab. Historische Bewegungsdaten bleiben ausserhalb des Pakets.',
'UABC-9':'Der Arbeitsstrang prueft Einkauf, Verkauf, Zahlung und Lager als getrennte Ende-zu-Ende-Ketten mit Belegen, Entries, Kontenwirkung, Kontrollsummen und Fehlerkorrektur.',
'UABC-10':'Der Arbeitsstrang befaehigt vier operative Rollen und fuehrt SIT, sieben UAT-Faelle sowie die Mock-Cutover-Entscheidung zusammen. Reale Benutzerabnahme bleibt fuer den Kundenlauf zu bestaetigen.',
'UABC-11':'Der Arbeitsstrang fuehrt Hypercare-Triage und Retest des Zahlungsreferenzfehlers. Ergebnis ist eine stabile simulierte Zahlungskette; andere Finance-Abschlussarbeiten liegen in UABC-12.',
'UABC-12':'Der Arbeitsstrang stimmt Sachkonto, Nebenbuecher, Bank, Lager und VAT ab und erstellt die synthetische UStVA-Vorschau ohne externe Uebermittlung.',
'UABC-13':'Der Arbeitsstrang schliesst Projektstory, Deliverables, Retro, Supportweg und Handover zusammen. Ergebnis ist ein lesbares Betriebsuebergabepaket; produktive Supportannahme ist nicht behauptet.',
'UABC-14':'Als Projektleitung moechte ich einen abgestimmten Projektauftrag mit Scope, Nicht-Scope, Rollen, Budget, Phasen und Change-Regel, damit Kunde und Consultant denselben Startpunkt und dieselben Entscheidungsgrenzen verwenden.',
'UABC-15':'Als Projektleitung moechte ich klare Entry- und Exit-Kriterien fuer Setup, UAT und Mock-Cutover, damit offene Daten-, Rollen- oder Steuerfragen nicht in spaetere Gates verschoben werden.',
'UABC-16':'Als Finance-Verantwortung moechte ich Konten-, Buchungsgruppen-, VAT-, Dimensions- und Periodenentscheidungen nachvollziehen, damit die spaetere Einrichtung konsistent und pruefbar ist.',
'UABC-17':'Als Einkauf Key User moechte ich Bestellung, Wareneingang, Rechnung und Zahlung im Standard festlegen, damit Abweichungen vor der Einrichtung entschieden sind.',
'UABC-18':'Als Verkauf Key User moechte ich Auftrag, Lieferung, Rechnung, Zahlungseingang und Korrektur im Standard festlegen, damit Forderungs- und Umsatzwirkung eindeutig sind.',
'UABC-19':'Als Lager Key User moechte ich Lagerort, Einheit, Bewertungsmethode, Inventur und Negativbestandsregel entscheiden, damit Mengen- und Wertfluesse abgestimmt werden koennen.',
'UABC-20':'Als Datenowner moechte ich vollstaendige, bereinigte und abgestimmte Datenwellen bereitstellen, damit Setup und UAT ohne verdeckte Datenfehler beginnen.',
'UABC-21':'Als Consultant moechte ich Gesellschaft, Perioden, Nummernserien und Rollenbaseline geprueft einrichten, damit Finance- und Prozesskonfiguration darauf aufbauen kann.',
'UABC-22':'Als Finance Key User moechte ich Finance, VAT, Buchungsmatrizen und SoD geprueft vorfinden, damit Buchungen korrekt kontiert und unzulaessige Rollenkombinationen erkannt werden.',
'UABC-23':'Als Datenowner moechte ich Stammdaten, offene Posten, Bestand und Eroeffnungsbilanz nach Fehlerkorrektur abgestimmt sehen, damit die Prozessprobe mit einer belastbaren Ausgangslage startet.',
'UABC-24':'Als Einkauf Key User moechte ich die P2P-Kette inklusive Abweichung, Zahlung und Ausgleich nachweisen, damit Bestellung, Verbindlichkeit, VAT und Lagerwirkung kontrolliert sind.',
'UABC-25':'Als Verkauf Key User moechte ich die O2C-Kette inklusive Korrektur, Zahlungseingang und Ausgleich nachweisen, damit Lieferung, Forderung, Umsatz, VAT und Bestand stimmen.',
'UABC-26':'Als Lager Key User moechte ich Bewegungen, Inventur, Differenz und Bewertung abstimmen, damit Artikel-, Wert- und Sachkontoeintraege dieselbe Bestandswahrheit zeigen.',
'UABC-27':'Als Key User moechte ich meinen positiven Prozess, einen Fehlerfall und den Retest ohne Hilfe ausfuehren, damit ich Alltag, Kontrolle und Eskalation sicher beherrsche.',
'UABC-28':'Als Projektleitung moechte ich SIT, UAT und Mock-Cutover mit Evidence und ohne offene P1/P2 abschliessen, damit GO_SIMULATION nachvollziehbar entschieden werden kann.',
'UABC-29':'In Hypercare wurde eine Zahlung wegen abweichender Referenz nicht automatisch zugeordnet. Die Story bewahrt Symptom, Ursache, Korrekturregel und erfolgreichen Retest, damit derselbe Fehler reproduzierbar diagnostiziert wird.',
'UABC-30':'Als Finance Key User moechte ich Monatsabschlusskontrollen und VAT-/UStVA-Vorschau differenzfrei abstimmen, damit der simulierte Periodenabschluss fachlich abgeschlossen ist.',
'UABC-31':'Als Projektleitung moechte ich Deliverables, Restpunkte, Retro, Supportweg und Verantwortung uebergeben, damit das Projekt nach Hypercare eindeutig endet.',
'UABC-32':'Projektauftrag, In-/Out-Scope, 80-Stunden-/9.600-EUR-Baseline, Rollen, Phasen, Gate-Matrix und Change-Regel wurden aus Angebot und Discovery zusammengefuehrt und gegen die neun Lieferobjekte geprueft.',
'UABC-33':'Entry-Kriterien fuer Setup, UAT und Mock-Cutover wurden mit Datenqualitaet, Rollen, Steuerfragen, Resetpunkt und Abbruchkriterien verbunden und als passierbare Simulationsgates dokumentiert.',
'UABC-34':'Kontenplan, Buchungsmatrizen, VAT-Annahmen, Dimensionen, Nummernserien und Perioden wurden als Standardbaseline entschieden; reale Steuerkennzeichen bleiben explizit zu bestaetigen.',
'UABC-35':'Bestellung, Wareneingang, Eingangsrechnung, Preis-/Mengenabweichung, Zahlung und Ausgleich wurden als schlanker Einkaufsstandard entschieden.',
'UABC-36':'Auftrag, Lieferung, Ausgangsrechnung, Preisabweichung, Zahlungseingang, Ausgleich und Gutschrift wurden als Verkaufsstandard entschieden.',
'UABC-37':'Lagerort HAUPT, Basiseinheit STK, FIFO, Inventur und Verbot des Soll-Negativbestands wurden als Lagerstandard entschieden.',
'UABC-38':'Acht Vorlagenpaare und zehn Migrationsobjekte wurden drei Wellen zugeordnet, auf Pflichtfelder und Referenzen geprueft und mit Mengen-, Salden- und Bestandskontrollen freigegeben.',
'UABC-39':'Gesellschaft, Arbeitsdatum, Perioden, Nummernserien, Rollen und Grundeinstellungen wurden in der Repositorysimulation in Abhaengigkeitsreihenfolge durchgespielt und feldnah kontrolliert.',
'UABC-40':'Finance-, Buchungsgruppen-, VAT-, Dimensions- und SoD-Baseline wurde mit erwarteten Kontenwirkungen und verweigerten Rollenkombinationen geprueft.',
'UABC-41':'Stammdaten, offene Posten, Bestand und Eroeffnungsbilanz wurden geladen, ein Referenzfehler korrigiert und Mengen sowie Salden differenzfrei erneut abgestimmt.',
'UABC-42':'Die P2P-Kette wurde von Bestellung bis Kreditorenzahlung mit Belegfolge, Lagerzugang, Vorsteuer, Verbindlichkeit, Abweichung und Retest durchgespielt.',
'UABC-43':'Die O2C-Kette wurde von Auftrag bis Zahlungseingang mit Lieferung, Forderung, Umsatz, VAT, Lagerabgang, Korrektur und Retest durchgespielt.',
'UABC-44':'Lagerbewegung, Inventurzaehlung, Differenzbuchung und Bewertung wurden mit Artikel-, Wert- und Sachkontoeintraegen abgestimmt.',
'UABC-45':'Finance, Handel und Lager absolvierten synthetische Rollenpfade mit positivem Fall, Fehlerdiagnose, Retest, Kontrollpunkt und vierstufiger Eskalation.',
'UABC-46':'Sieben UAT-Faelle, Defect-Retests, Rollenkompetenz, Datenkontrollen und Mock-Cutover wurden zu GO_SIMULATION ohne offene P1/P2 zusammengefuehrt.',
'UABC-47':'Symptom war eine nicht automatisch zugeordnete Zahlung. Ursache war die vom Rechnungsbezug abweichende Referenz; die Referenzregel wurde korrigiert und Matching, Ausgleich sowie Bankabstimmung im Retest bestanden.',
'UABC-48':'Sachkonto, Debitoren, Kreditoren, Bank und Lager wurden fuer den Monatsabschluss abgestimmt; offene Belege und Periodenstatus wurden kontrolliert.',
'UABC-49':'VAT-Entries, Bemessungsgrundlagen, Vorsteuer und Umsatzsteuer wurden zur synthetischen UStVA-Vorschau abgestimmt; es erfolgte keine ELSTER-Uebermittlung.',
'UABC-50':'Projektziele, 80 Stunden, 9.600 EUR, neun Deliverables, Retro, Restpunkte und Supportweg wurden abgeglichen und als synthetisches Handover ohne produktive Supportannahme abgeschlossen.'
};

const taskSchedule={
'UABC-32':['2026-04-06','2026-04-08',5.5,'Projektleitung'], 'UABC-33':['2026-04-09','2026-04-10',3.5,'Projektleitung'],
'UABC-34':['2026-04-13','2026-04-14',4,'Solution Architect'], 'UABC-35':['2026-04-15','2026-04-15',1.5,'Lead BC Consultant'],
'UABC-36':['2026-04-16','2026-04-16',1.5,'Lead BC Consultant'], 'UABC-37':['2026-04-17','2026-04-17',1,'Lead BC Consultant'],
'UABC-38':['2026-04-20','2026-04-24',5,'Projektleitung'], 'UABC-39':['2026-04-27','2026-04-28',5,'Lead BC Consultant'],
'UABC-40':['2026-04-29','2026-05-05',9,'Solution Architect'], 'UABC-41':['2026-05-06','2026-05-08',4,'Lead BC Consultant'],
'UABC-42':['2026-05-11','2026-05-12',5,'Lead BC Consultant'], 'UABC-43':['2026-05-13','2026-05-14',5,'Lead BC Consultant'],
'UABC-44':['2026-05-15','2026-05-15',5,'Lead BC Consultant'], 'UABC-45':['2026-05-18','2026-05-20',4,'Projektleitung'],
'UABC-46':['2026-05-21','2026-05-22',3,'Projektleitung'], 'UABC-47':['2026-05-25','2026-05-25',2.5,'Lead BC Consultant'],
'UABC-48':['2026-05-26','2026-05-26',2.5,'Lead BC Consultant'], 'UABC-49':['2026-05-27','2026-05-27',2,'Solution Architect'],
'UABC-50':['2026-05-28','2026-05-29',11,'Projektleitung']
};
const customerActor={
'UABC-32':'ROLE-CUSTOMER-SPONSOR','UABC-33':'ROLE-CUSTOMER-SPONSOR','UABC-34':'ROLE-CUSTOMER-FINANCE','UABC-35':'ROLE-CUSTOMER-PURCHASE','UABC-36':'ROLE-CUSTOMER-SALES','UABC-37':'ROLE-CUSTOMER-WAREHOUSE','UABC-38':'ROLE-CUSTOMER-IT','UABC-39':'ROLE-CUSTOMER-IT','UABC-40':'ROLE-CUSTOMER-FINANCE','UABC-41':'ROLE-CUSTOMER-IT','UABC-42':'ROLE-CUSTOMER-PURCHASE','UABC-43':'ROLE-CUSTOMER-SALES','UABC-44':'ROLE-CUSTOMER-WAREHOUSE','UABC-45':'ROLE-CUSTOMER-FINANCE','UABC-46':'ROLE-CUSTOMER-SPONSOR','UABC-47':'ROLE-CUSTOMER-FINANCE','UABC-48':'ROLE-CUSTOMER-FINANCE','UABC-49':'ROLE-CUSTOMER-FINANCE','UABC-50':'ACTOR-KUNDEN-SUPPORT'};
const deliverableRef={32:'UABC-DEL-BCB-001',33:'UABC-DEL-BCB-006',34:'UABC-DEL-BCB-002',35:'UABC-DEL-BCB-002',36:'UABC-DEL-BCB-002',37:'UABC-DEL-BCB-002',38:'UABC-DEL-BCB-003',39:'UABC-DEL-BCB-004',40:'UABC-DEL-BCB-004',41:'UABC-DEL-BCB-003',42:'UABC-DEL-BCB-004',43:'UABC-DEL-BCB-004',44:'UABC-DEL-BCB-004',45:'UABC-DEL-BCB-005',46:'UABC-DEL-BCB-006',47:'UABC-DEL-BCB-007',48:'UABC-DEL-BCB-007',49:'UABC-DEL-BCB-008',50:'UABC-DEL-BCB-009'};
const pageRef={32:'PAGE-UABC-130',33:'PAGE-UABC-060',34:'PAGE-UABC-100',35:'PAGE-UABC-100',36:'PAGE-UABC-100',37:'PAGE-UABC-100',38:'PAGE-UABC-050',39:'PAGE-UABC-110',40:'PAGE-UABC-110',41:'PAGE-UABC-050',42:'PAGE-UABC-110',43:'PAGE-UABC-110',44:'PAGE-UABC-110',45:'PAGE-UABC-170',46:'PAGE-UABC-060',47:'PAGE-UABC-160',48:'PAGE-UABC-160',49:'PAGE-UABC-160',50:'PAGE-UABC-180'};
const decisionRef=(id)=> id<=33?'UABC-DEC-BCB-003':id<=40?'UABC-DEC-BCB-002':id===49?'UABC-DEC-BCB-006':'UABC-DEC-BCB-008';

const ranges={
'UABC-1':['2026-04-06','2026-04-24'],'UABC-2':['2026-04-27','2026-05-22'],'UABC-3':['2026-05-25','2026-05-29'],
'UABC-4':['2026-04-06','2026-04-10'],'UABC-5':['2026-04-13','2026-04-17'],'UABC-6':['2026-04-20','2026-04-24'],
'UABC-7':['2026-04-27','2026-05-05'],'UABC-8':['2026-05-06','2026-05-08'],'UABC-9':['2026-05-11','2026-05-15'],'UABC-10':['2026-05-18','2026-05-22'],
'UABC-11':['2026-05-25','2026-05-25'],'UABC-12':['2026-05-26','2026-05-27'],'UABC-13':['2026-05-28','2026-05-29'],
'UABC-14':['2026-04-06','2026-04-08'],'UABC-15':['2026-04-09','2026-04-10'],'UABC-16':['2026-04-13','2026-04-14'],'UABC-17':['2026-04-15','2026-04-15'],'UABC-18':['2026-04-16','2026-04-16'],'UABC-19':['2026-04-17','2026-04-17'],'UABC-20':['2026-04-20','2026-04-24'],
'UABC-21':['2026-04-27','2026-04-28'],'UABC-22':['2026-04-29','2026-05-05'],'UABC-23':['2026-05-06','2026-05-08'],'UABC-24':['2026-05-11','2026-05-12'],'UABC-25':['2026-05-13','2026-05-14'],'UABC-26':['2026-05-15','2026-05-15'],'UABC-27':['2026-05-18','2026-05-20'],'UABC-28':['2026-05-21','2026-05-22'],'UABC-29':['2026-05-25','2026-05-25'],'UABC-30':['2026-05-26','2026-05-27'],'UABC-31':['2026-05-28','2026-05-29']};

function parentStatusReason(ticket){
 const children=ticket.childTicketIds.join(', ');const evidence=ticket.evidenceRefs[0]??'evidence/simulation/project-completion.yaml';
 if(ticket.type==='phase')return `Projektleitung Kajetan Kalicki hat das Exit-Gate von ${ticket.summary} nach Abschluss der enthaltenen Arbeitsstraenge ${children} entschieden. ${ticket.description} Ergebnis und Stundenrollup sind in ${evidence} belegt; reale Kunden- und Tenantbestaetigungen bleiben vom Referenzabschluss getrennt.`;
 if(ticket.type==='epic')return `Der fachliche Arbeitsstrang ${ticket.summary} ist nach Abschluss der Ergebnisbausteine ${children} geschlossen. ${ticket.description} Abhaengigkeiten und Entscheidung ${ticket.decisionRefs.join(', ')} sind aufgeloest; ${evidence} belegt das Ergebnis, nicht eine reale BC-Ausfuehrung.`;
 return `Das fachliche Ergebnis ${ticket.summary} ist erreicht: ${ticket.description} Die abrechenbaren Child-Tasks ${children} liefern den Nachweis ${evidence}; der Businessnutzen ist synthetisch geprueft, waehrend reale Kundenwerte und Sandboxhandlungen weiterhin separat zu bestaetigen sind.`;
}

function enrich(){
 const story=JSON.parse(fs.readFileSync(STORY,'utf8')); const actors=YAML.parse(fs.readFileSync(ACTORS,'utf8'));
 story.actors=actors.actors;
 story.offer.versions[0].date='2026-04-03';story.offer.versions[1].date='2026-04-06';story.offer.versions[2].date='2026-05-29';
 const byId=new Map(story.tickets.map(t=>[t.id,t]));
 for(const ticket of story.tickets){
  ticket.description=descriptions[ticket.id]; ticket.reporter=LEAD; ticket.assignee=LEAD; ticket.reporterRole='Projektleitung'; ticket.assigneeRole=ticket.type==='task'?(taskSchedule[ticket.id]?.[3]??'Lead BC Consultant'):'Projektleitung';
  ticket.decisionRefs=[decisionRef(Number(ticket.id.split('-')[1]))]; ticket.pageRefs=[]; ticket.deliverableRefs=[];
  ticket.childTicketIds=story.tickets.filter(c=>c.parent===ticket.id).map(c=>c.id);
  ticket.statusReason=ticket.type==='task'?`${ticket.deliverable} ist mit erfuellten Akzeptanzkriterien und referenziertem Nachweis synthetisch abgeschlossen.`:parentStatusReason(ticket);
  const range=ranges[ticket.id]??taskSchedule[ticket.id]?.slice(0,2); if(range){ticket.createdAt=range[0];ticket.startedAt=range[0];ticket.testedAt=range[1];ticket.closedAt=range[1];if(ticket.start)ticket.start=range[0];if(ticket.end)ticket.end=range[1];}
  ticket.statusHistory=[{status:'created',time:ticket.createdAt,actorRef:LEAD,actorType:'human',actionRole:'Projektleitung'},{status:'in-progress',time:ticket.startedAt,actorRef:LEAD,actorType:'human',actionRole:ticket.assigneeRole},{status:'tested',time:ticket.testedAt,actorRef:LEAD,actorType:'human',actionRole:'Solution Architect'},{status:ticket.status,time:ticket.closedAt,actorRef:LEAD,actorType:'human',actionRole:'Projektleitung'}];
  const criterion=ticket.type==='phase'?`Entry, fachliche Ergebnisse und Exit-Gates von ${ticket.summary} sind belegt.`:ticket.type==='epic'?`Definition of Done fuer ${ticket.summary} ist durch untergeordnete Stories und Nachweise erfuellt.`:ticket.type==='story'?`${ticket.deliverable} liefert den beschriebenen Businessnutzen und alle Child-Tasks sind abgeschlossen.`:`${ticket.deliverable} ist fachlich geprueft, mit Nachweis belegt und ohne offene P1/P2 abgeschlossen.`;
  ticket.acceptanceCriteria=[{criterion,fulfilled:true},{criterion:'Simulation und spaetere reale Kundenbestaetigung sind eindeutig getrennt.',fulfilled:true}];
  if(ticket.type!=='task'){
    if(!ticket.evidenceRefs.length)ticket.evidenceRefs=['evidence/simulation/project-completion.yaml'];
    ticket.comments=[{id:`COM-${ticket.id}-STATUS`,type:'status',time:ticket.closedAt,role:'Projektleitung',actorRef:LEAD,actorType:'human',actionRole:'Projektleitung',text:ticket.statusReason,evidenceRef:ticket.evidenceRefs[0]}];
  } else {
    const [start,end,estimate,role]=taskSchedule[ticket.id]; ticket.estimateHours=estimate; ticket.createdAt=start;ticket.startedAt=start;ticket.testedAt=end;ticket.closedAt=end;
    ticket.reporterRole='Projektleitung';ticket.assigneeRole=role;ticket.participants=[LEAD,customerActor[ticket.id]];ticket.pageRefs=[pageRef[Number(ticket.id.split('-')[1])]];ticket.deliverableRefs=[deliverableRef[Number(ticket.id.split('-')[1])]];
    ticket.statusHistory=[{status:'created',time:start,actorRef:LEAD,actorType:'human',actionRole:'Projektleitung'},{status:'in-progress',time:start,actorRef:LEAD,actorType:'human',actionRole:role},{status:'tested',time:end,actorRef:LEAD,actorType:'human',actionRole:'Solution Architect'},{status:ticket.status,time:end,actorRef:LEAD,actorType:'human',actionRole:'Projektleitung'}];
    const ev=ticket.evidenceRefs[0];
    const continuity=ticket.id==='UABC-50'?' Reconciliation und read-only Adapter-Provenienz sind im Handover verknuepft.':'';
    const processReview=ticket.id==='UABC-42'?'Pruefung P2P: Bestellung, Wareneingang, Eingangsrechnung, Vorsteuer, Verbindlichkeit und Kreditorenzahlung stimmen mit Lagerzugang und Kontrollsummen ueberein; Preisabweichung und Retest sind belegt.':ticket.id==='UABC-43'?'Pruefung O2C: Auftrag, Lieferung, Ausgangsrechnung, Umsatzsteuer, Forderung und Zahlungseingang stimmen mit Lagerabgang und Kontrollsummen ueberein; Preisfehler und Retest sind belegt.':`Pruefung: ${ticket.deliverable} wurde gegen Akzeptanz, Kontrollsummen und Wahrheitsgrenze bewertet; notwendige Abweichungen sind im Retest enthalten.`;
    const processClose=ticket.id==='UABC-42'?`Abschluss P2P: Kreditorenposten und Zahlung sind ausgeglichen, Vorsteuer und Lagerzugang abgestimmt. Nachweis ${ev}; der synthetische Retest ist bestanden, reale Buchung bleibt separat.`:ticket.id==='UABC-43'?`Abschluss O2C: Debitorenposten und Zahlungseingang sind ausgeglichen, Umsatzsteuer, Erlos und Lagerabgang abgestimmt. Nachweis ${ev}; der synthetische Retest ist bestanden, reale Buchung bleibt separat.`:`Abschluss: ${ticket.deliverable}. Nachweis ${ev}; Test beziehungsweise Retest bestanden.${continuity} Reale Kunden- oder Systembestaetigung bleibt, wo erforderlich, als eigener spaeterer Schritt sichtbar. Naechster Bezug: ${ticket.deliverableRefs[0]}.`;
    ticket.comments=[{id:`COM-${ticket.id}-ANALYSE`,type:'analysis',time:start,role:role,actorRef:LEAD,actorType:'human',actionRole:role,text:`Analyse und Vorgehen: ${descriptions[ticket.id]}`,evidenceRef:ev},{id:`COM-${ticket.id}-REVIEW`,type:'review',time:end,role:'Solution Architect',actorRef:LEAD,actorType:'human',actionRole:'Solution Architect',text:processReview,evidenceRef:ev},{id:`COM-${ticket.id}-CLOSING`,type:'closing',time:end,role:'Projektleitung',actorRef:LEAD,actorType:'human',actionRole:'Projektleitung',text:processClose,evidenceRef:ev}];
    ticket.worklogs=[{...ticket.worklogs[0],date:end,role,actorRef:LEAD,actorType:'human',actionRole:role,activity:`${descriptions[ticket.id]}${continuity}`,hours:ticket.actualHours,netAmount:ticket.actualHours*120}];
  }
 }
 const actual=(id)=>story.tickets.filter(t=>t.parent===id).reduce((s,t)=>s+t.actualHours,0); const estimate=(id)=>story.tickets.filter(t=>t.parent===id).reduce((s,t)=>s+t.estimateHours,0);
 for(const ticket of story.tickets.filter(t=>t.type!=='task')){ticket.actualHours=actual(ticket.id);ticket.estimateHours=estimate(ticket.id);ticket.netAmount=ticket.actualHours*120;}
 story.catalogs.decisions=[...new Set([...story.catalogs.decisions,...Array.from({length:8},(_,i)=>`UABC-DEC-BCB-00${i+1}`)])];
 story.catalogs.decisions=[...new Set([...story.catalogs.decisions,'UABC-DEC-BCB-009'])];
 story.catalogs.evidenceRefs=[...new Set([...story.catalogs.evidenceRefs,'evidence/playthru-uabc-basic-de/setup-baseline.yaml','evidence/playthru-uabc-basic-de/country-company-information-execution.yaml'])];
 const pilotSetupTask=story.tickets.find(ticket=>ticket.id==='UABC-39');
 pilotSetupTask.evidenceRefs=[...new Set([...pilotSetupTask.evidenceRefs,'evidence/playthru-uabc-basic-de/setup-baseline.yaml','evidence/playthru-uabc-basic-de/country-company-information-execution.yaml'])];
 pilotSetupTask.decisionRefs=[...new Set([...pilotSetupTask.decisionRefs,'UABC-DEC-BCB-009'])];
 pilotSetupTask.comments=[...pilotSetupTask.comments.filter(comment=>!['COM-UABC-39-PILOT-PROVENIENZ','COM-UABC-39-COMPANY-RETEST'].includes(comment.id)),{
  id:'COM-UABC-39-PILOT-PROVENIENZ',type:'provenance',time:'2026-07-13',role:'Solution Architect',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'fachliche Pruefung',
  text:'Die Playthru-Pilotbaseline ist ein neuer separater Lauf des Projekts UABC-BC-PILOT-001. Sie aendert weder den synthetischen Abschluss noch den Worklog von UABC-39 und belegt noch keine Einrichtung: beobachtet sind nur der leere Mandant und drei Paketgerueste ohne Tabellen oder Datensaetze.',
  evidenceRef:'evidence/playthru-uabc-basic-de/setup-baseline.yaml'
 },{
  id:'COM-UABC-39-COMPANY-RETEST',type:'retest',time:'2026-07-13',role:'Solution Architect',actorRef:'P-PILOT-LEAD-001',actorType:'human',actionRole:'fachliche Pruefung',
  text:'Nachfolgelauf UABC-BC-PILOT-001: Country/Region DE und die freigegebenen Firmendaten wurden in Playthru gespeichert und per Readback geprueft. Die drei Paketgerueste blieben bei null Tabellen, Daten und Fehlern; der April-Abschluss und seine Worklogs bleiben unveraendert.',
  evidenceRef:'evidence/playthru-uabc-basic-de/country-company-information-execution.yaml'
 }];
 const timelineDates=['2026-04-03','2026-04-06','2026-04-08','2026-04-14','2026-04-24','2026-04-28','2026-05-08','2026-05-12','2026-05-14','2026-05-15','2026-05-20','2026-05-22','2026-05-25','2026-05-27','2026-05-29'];
 story.timeline.forEach((event,index)=>{event.time=`${timelineDates[index]}T${index===0?'10:00':'16:00'}:00+02:00`;event.role='Projektleitung';event.actorRef=LEAD;event.actorType='human';event.actionRole='Projektleitung';});
 const timelineSuffix='Reconciliation und Provenienz sind im Abschluss verknuepft.';
 story.timeline.at(-1).result=`${story.timeline.at(-1).result.replace(/(?:\s*Reconciliation und Provenienz sind im Abschluss verknuepft\.)+$/,'').trim()} ${timelineSuffix}`;
 const hypercareComments={1:'COM-UABC-47-CLOSING',2:'COM-UABC-44-CLOSING',3:'COM-UABC-48-CLOSING'};
 const oldComments={1:'COM-35-C',2:'COM-32-C',3:'COM-36-C'};
 story.hypercare.forEach(day=>{day.comment=hypercareComments[day.day];day.actorRef=LEAD;day.actorType='human';day.actionRole=day.day===3?'Projektleitung':'Lead BC Consultant';});
 const hypercareSuffix='Provenienz der Projektion und Reconciliation wurden in die Betriebsuebergabe aufgenommen.';
 story.hypercare.at(-1).fix=`${story.hypercare.at(-1).fix.replace(/(?:\s*Provenienz der Projektion und Reconciliation wurden in die Betriebsuebergabe aufgenommen\.)+$/,'').trim()} ${hypercareSuffix}`;
 const replacement=new Map(Object.entries(oldComments).map(([day,old])=>[old,hypercareComments[day]]));
 story.relations=story.relations.map(relation=>({...relation,from:replacement.get(relation.from)??relation.from,to:replacement.get(relation.to)??relation.to}));
 fs.writeFileSync(STORY,`${JSON.stringify(story,null,2)}\n`,'utf8');
}
if(process.argv[1]?.endsWith('enrich-jira-story-realism.mjs')){if(!process.argv.includes('--write'))throw new Error('Die Erzeugung benoetigt --write.');enrich();console.log('Jira-Projektstory angereichert: 50 Tickets, 11 Akteure, 19 Task-Worklogs, fuehrende April-/Mai-Zeitachse.');}

import fs from 'node:fs';
import YAML from 'yaml';

const STORY='evidence/simulation/project-story.json';
const ACTORS='project/bc-basic/actor-register.yaml';
const LEAD='P-PILOT-LEAD-001';

const descriptions={
'UABC-1':'Phase 1 schafft einen entscheidungsfaehigen Projektauftrag, ein abgestimmtes Standarddesign und ein pruefbares Datenpaket. Eintritt sind benannte Rollen und vorbereitete Workshops; Austritt sind entschiedener Scope, Finance-/Prozessdesign und Datenbereitschaft.',
'UABC-2':'Phase 2 setzt die entschiedene Baseline in nachvollziehbarer Reihenfolge um, stimmt drei Datenwellen ab und weist Kernprozesse, UAT und Rollenkompetenz nach. Die Phase endet erst nach erfolgreicher Prozess- und Abnahmeprobe.',
'UABC-3':'Phase 3 plant Stabilisierung, Hypercare, Finance-Abschluss, VAT-Vorschau, Retro und Supportübergabe. Eintritt ist eine belegte Simulationsabnahme; Austritt setzt ausgeführte Kontrollen und keine offenen P1/P2 voraus.',
'UABC-4':'Der Arbeitsstrang verbindet Angebot, Projektauftrag, Scope, Rollen, drei Discovery-Workshops und die Eintrittskriterien fuer UAT und Cutover. Ergebnis sind ein startfaehiger Auftrag und ein klarer Entscheidungsweg; BC-Konfiguration und produktive Freigaben liegen ausserhalb dieses Epics.',
'UABC-5':'Der Arbeitsstrang entscheidet Konten-, Buchungsgruppen-, VAT-, Dimensions-, Einkaufs-, Verkaufs- und Lagerstandard vor der Einrichtung. Ergebnis ist ein Fit-to-Standard-Blueprint mit sichtbaren Kunden- und Steuerbestaetigungen.',
'UABC-6':'Der Arbeitsstrang macht zehn Migrationsobjekte in drei Wellen import- und abstimmbar. Ergebnis sind Owner, Mapping, Qualitaetsregeln, Fehlerkorrektur und differenzfreie Kontrollsummen.',
'UABC-7':'Der Arbeitsstrang richtet Gesellschaft, Perioden, Nummernserien, Finance, VAT und Funktionstrennung in fachlich richtiger Reihenfolge ein. Ergebnis ist eine reproduzierbare Baseline fuer Prozesse und UAT.',
'UABC-8':'Der Arbeitsstrang uebernimmt synthetische Stamm- und Eroeffnungsdaten, behandelt Importfehler und stimmt Mengen, offene Posten und Salden ab. Historische Bewegungsdaten bleiben ausserhalb des Pakets.',
'UABC-9':'Der Arbeitsstrang prueft Einkauf, Verkauf, Zahlung und Lager als getrennte Ende-zu-Ende-Ketten mit Belegen, Entries, Kontenwirkung, Kontrollsummen und Fehlerkorrektur.',
'UABC-10':'Der Arbeitsstrang befaehigt vier operative Rollen und fuehrt SIT, sieben UAT-Faelle sowie die Mock-Cutover-Entscheidung zusammen. Reale Benutzerabnahme bleibt fuer den Kundenlauf zu bestaetigen.',
'UABC-11':'Der Arbeitsstrang plant Hypercare-Triage und Retest eines möglichen Zahlungsreferenzfehlers. Ein Defect entsteht erst nach realer Beobachtung; Finance-Abschlussarbeiten liegen in UABC-12.',
'UABC-12':'Der Arbeitsstrang soll Sachkonto, Nebenbuecher, Bank, Lager und VAT abstimmen und eine UStVA-Vorschau ohne externe Uebermittlung prüfen.',
'UABC-13':'Der Arbeitsstrang plant Projektstory, Deliverables, Retro, Supportweg und Handover. Ergebnis soll ein lesbares Betriebsuebergabepaket sein; produktive Supportannahme bleibt ausgeschlossen.',
'UABC-14':'Als Projektleitung moechte ich einen abgestimmten Projektauftrag mit Scope, Nicht-Scope, Rollen, Budget, Phasen und Change-Regel, damit Kunde und Consultant denselben Startpunkt und dieselben Entscheidungsgrenzen verwenden.',
'UABC-15':'Als Projektleitung moechte ich klare Entry- und Exit-Kriterien fuer Setup, UAT und Mock-Cutover, damit offene Daten-, Rollen- oder Steuerfragen nicht in spaetere Gates verschoben werden.',
'UABC-16':'Als Finance-Verantwortung moechte ich Konten-, Buchungsgruppen-, VAT-, Dimensions- und Periodenentscheidungen nachvollziehen, damit die spaetere Einrichtung konsistent und pruefbar ist.',
'UABC-17':'Als Einkauf Key User moechte ich Bestellung, Wareneingang, Rechnung und Zahlung im Standard festlegen, damit Abweichungen vor der Einrichtung entschieden sind.',
'UABC-18':'Als Verkauf Key User moechte ich Auftrag, Lieferung, Rechnung, Zahlungseingang und Korrektur im Standard festlegen, damit Forderungs- und Umsatzwirkung eindeutig sind.',
'UABC-19':'Als Lager Key User moechte ich Lagerort, Einheit, Bewertungsmethode, Inventur und Negativbestandsregel entscheiden, damit Mengen- und Wertfluesse abgestimmt werden koennen.',
'UABC-20':'Als Datenowner moechte ich vollstaendige, bereinigte und abgestimmte Datenwellen bereitstellen, damit Setup und UAT ohne verdeckte Datenfehler beginnen.',
'UABC-21':'Als Projektleitung möchte ich CRONUS-Ist, BC-Basic-Soll, angewendete Differenz und Gesellschaftsstrategie getrennt entscheiden, damit ein Name niemals als Konfigurationsnachweis gilt.',
'UABC-22':'Als Finance-Verantwortung möchte ich CORE-FINANCE erst nach geschlossenem Ziel- und Resetgate feldgenau einrichten, lesen und fachlich abnehmen, damit jede Wirkung nachvollziehbar bleibt.',
'UABC-23':'Als Datenowner moechte ich Stammdaten, offene Posten, Bestand und Eroeffnungsbilanz nach Fehlerkorrektur abgestimmt sehen, damit die Prozessprobe mit einer belastbaren Ausgangslage startet.',
'UABC-24':'Als Einkauf Key User moechte ich die P2P-Kette inklusive Abweichung, Zahlung und Ausgleich nachweisen, damit Bestellung, Verbindlichkeit, VAT und Lagerwirkung kontrolliert sind.',
'UABC-25':'Als Verkauf Key User moechte ich die O2C-Kette inklusive Korrektur, Zahlungseingang und Ausgleich nachweisen, damit Lieferung, Forderung, Umsatz, VAT und Bestand stimmen.',
'UABC-26':'Als Lager Key User moechte ich Bewegungen, Inventur, Differenz und Bewertung abstimmen, damit Artikel-, Wert- und Sachkontoeintraege dieselbe Bestandswahrheit zeigen.',
'UABC-27':'Als Key User moechte ich meinen positiven Prozess, einen Fehlerfall und den Retest ohne Hilfe ausfuehren, damit ich Alltag, Kontrolle und Eskalation sicher beherrsche.',
'UABC-28':'Als Projektleitung moechte ich SIT, UAT und Mock-Cutover mit aktueller Evidence prüfen, damit eine belegte Simulationsabnahme erst ohne offene P1/P2 entschieden werden kann.',
'UABC-29':'Ein geplantes Hypercare-Szenario beschreibt eine möglicherweise nicht automatisch zugeordnete Zahlung. Symptom, Diagnose, Korrekturregel und Retest werden erst nach einer realen Beobachtung belegt.',
'UABC-30':'Als Finance Key User moechte ich Monatsabschlusskontrollen und VAT-/UStVA-Vorschau differenzfrei prüfen, bevor ein simulierter Periodenabschluss fachlich abgenommen werden kann.',
'UABC-31':'Als Projektleitung moechte ich Deliverables, Restpunkte, Retro, Supportweg und Verantwortung vorbereitet übergeben, sobald Hypercare und Simulationsabnahme belegt sind.',
'UABC-32':'Projektauftrag, In- und Out-Scope, Angebotsplanung, Rollen, Phasen, Gate-Matrix und Change-Regel werden aus Angebot und Discovery zusammengefuehrt und gegen die vorgesehenen Lieferobjekte geprueft.',
'UABC-33':'Entry-Kriterien fuer Setup, UAT und Mock-Cutover werden mit Datenqualität, Rollen, Steuerfragen, Resetpunkt und Abbruchkriterien verbunden; ein Gate gilt erst mit aktueller Evidence als passierbar.',
'UABC-34':'Kontenplan, Buchungsmatrizen, VAT-Annahmen, Dimensionen, Nummernserien und Perioden wurden als Standardbaseline entschieden; reale Steuerkennzeichen bleiben explizit zu bestaetigen.',
'UABC-35':'Bestellung, Wareneingang, Eingangsrechnung, Preis-/Mengenabweichung, Zahlung und Ausgleich wurden als schlanker Einkaufsstandard entschieden.',
'UABC-36':'Auftrag, Lieferung, Ausgangsrechnung, Preisabweichung, Zahlungseingang, Ausgleich und Gutschrift wurden als Verkaufsstandard entschieden.',
'UABC-37':'Lagerort HAUPT, Basiseinheit STK, FIFO, Inventur und Verbot des Soll-Negativbestands wurden als Lagerstandard entschieden.',
'UABC-38':'Acht Vorlagenpaare und zehn Migrationsobjekte wurden drei Wellen zugeordnet, auf Pflichtfelder und Referenzen geprueft und mit Mengen-, Salden- und Bestandskontrollen freigegeben.',
'UABC-39':'UABC-BASIC-DE wird ausschließlich lesend als Standard-CRONUS-Demo-Baseline inventarisiert. W0-01 liest Company-ID und technischen Namen; Zielstrategie und Resetpunkt bleiben bis vollständiger Evidence offen.',
'UABC-40':'CORE-FINANCE wird erst nach geschlossenem Ziel- und Resetgate aus der exakten Allowlist eingerichtet, feldgenau gelesen und fachlich abgenommen; spätere Wellen und Ledgerwirkung bleiben ausgeschlossen.',
'UABC-41':'Stammdaten, offene Posten, Bestand und Eroeffnungsbilanz wurden geladen, ein Referenzfehler korrigiert und Mengen sowie Salden differenzfrei erneut abgestimmt.',
'UABC-42':'Die P2P-Kette wurde von Bestellung bis Kreditorenzahlung mit Belegfolge, Lagerzugang, Vorsteuer, Verbindlichkeit, Abweichung und Retest durchgespielt.',
'UABC-43':'Die O2C-Kette wurde von Auftrag bis Zahlungseingang mit Lieferung, Forderung, Umsatz, VAT, Lagerabgang, Korrektur und Retest durchgespielt.',
'UABC-44':'Lagerbewegung, Inventurzaehlung, Differenzbuchung und Bewertung wurden mit Artikel-, Wert- und Sachkontoeintraegen abgestimmt.',
'UABC-45':'Finance, Handel und Lager absolvierten synthetische Rollenpfade mit positivem Fall, Fehlerdiagnose, Retest, Kontrollpunkt und vierstufiger Eskalation.',
'UABC-46':'UAT-Fälle, Defect-Retests, Rollenkompetenz, Datenkontrollen und Mock-Cutover werden für eine spätere belegte Simulationsabnahme geplant; aktuell sind sie nicht ausgeführt.',
'UABC-47':'Symptom war eine nicht automatisch zugeordnete Zahlung. Ursache war die vom Rechnungsbezug abweichende Referenz; die Referenzregel wurde korrigiert und Matching, Ausgleich sowie Bankabstimmung im Retest bestanden.',
'UABC-48':'Sachkonto, Debitoren, Kreditoren, Bank und Lager wurden fuer den Monatsabschluss abgestimmt; offene Belege und Periodenstatus wurden kontrolliert.',
'UABC-49':'VAT-Entries, Bemessungsgrundlagen, Vorsteuer und Umsatzsteuer werden für die geplante UStVA-Vorschau vorbereitet. Eine externe ELSTER-Uebermittlung bleibt verboten; Ausführung und Readback stehen aus.',
'UABC-50':'Projektziele, Deliverables, Retro, Restpunkte und Supportweg werden für die spätere Übergabe vorbereitet. Der aktive Pilot besitzt noch kein abgeschlossenes Handover und keine produktive Supportannahme.'
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
const decisionRef=(id)=> id<=33?'UABC-DEC-BCB-003':id<=40?'UABC-DEC-BCB-002':id===49?'UABC-DEC-BCB-006':'UABC-DEC-BCB-010';

export function ticketRealismSeed(ticket) {
 const id=ticket?.id; const numericId=Number(String(id??'').split('-')[1]); const schedule=taskSchedule[id];
 return {
  description:descriptions[id]??ticket?.description,
  estimateHours:schedule?.[2]??ticket?.estimateHours,
  assigneeRole:schedule?.[3]??ticket?.assigneeRole,
  participants:ticket?.type==='task'?[LEAD,customerActor[id]].filter(Boolean):[...(ticket?.participants??[])],
  pageRefs:ticket?.type==='task'&&pageRef[numericId]?[pageRef[numericId]]:[...(ticket?.pageRefs??[])],
  deliverableRefs:ticket?.type==='task'&&deliverableRef[numericId]?[deliverableRef[numericId]]:[...(ticket?.deliverableRefs??[])],
  decisionRefs:[...new Set([...(ticket?.decisionRefs??[]),decisionRef(numericId)].filter(Boolean))]
 };
}

export function currentPilotText(value){
 return String(value??'')
  .replace(/(?:\s*Status im aktuellen Playthru-Pilot:\s*[^.]+\.)+\s*$/gi,'')
  .replace(/\s*Aktueller Playthru-Pilot:[\s\S]*$/gi,'')
  .replace(/synthetisch(?:e|er|es)?/gi,'historisch')
  .replace(/soll geprüft werdener/gi,'zu prüfender')
  .replace(/historischn/gi,'geplanten')
  .replace(/\bwurden\b/g,'werden')
  .replace(/\bwurde\b/g,'wird')
  .replace(/\bbestanden\b/g,'erfolgreich geprüft')
  .replace(/\bdurchgespielt\b/g,'für den Lauf geplant')
  .replace(/\babgeschlossen\b/g,'für die spätere Abnahme vorbereitet')
  .trim();
}

if(process.argv[1]?.endsWith('enrich-jira-story-realism.mjs')){
 if(!process.argv.includes('--write'))throw new Error('Die Erzeugung benötigt --write.');
 await import('./generate-uabc-ticket-export.mjs');
}

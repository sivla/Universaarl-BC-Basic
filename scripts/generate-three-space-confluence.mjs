import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';

const BASE = '7b988e1cb8dee9b7f227481478ad97449e774100';
const INDEX = 'exports/project-data/v1/index.yaml';
const STORY = 'evidence/simulation/project-story.json';
const CONTRACT = 'project/bc-basic/confluence-three-space-v1.yaml';
const sha = (value) => crypto.createHash('sha256').update(value).digest('hex');
const baseStory = JSON.parse(execFileSync('git', ['show', `${BASE}:${STORY}`], { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }));
const baseById = new Map(baseStory.pages.map((page) => [page.id, page]));
const story = JSON.parse(fs.readFileSync(STORY, 'utf8'));
const index = YAML.parse(fs.readFileSync(INDEX, 'utf8'));
const existingDefinitions = new Map(index.documentCatalog.definitions.filter((item) => item.documentType === 'confluence-page').map((item) => [item.storyPageId, item]));
const existingArtifacts = new Map(index.artifacts.map((item) => [item.id, item]));
const archivedChangePrefix = 'openspec/changes/archive/2026-07-12-migrate-bc-basic-to-single-uabc-ticket-project/';
for (const artifact of index.artifacts) if (artifact.path?.startsWith('openspec/changes/migrate-bc-basic-to-single-uabc-ticket-project/')) artifact.path = artifact.path.replace('openspec/changes/migrate-bc-basic-to-single-uabc-ticket-project/', archivedChangePrefix);

const spaces = [
  { spaceId:'UABC-SPACE-CUSTOMER', spaceType:'customer-project', title:'Universaarl Kundenprojekt', purpose:'Fuehrende Wahrheit fuer die konkrete Universaarl-Kundeninstanz.', audience:['Kunde','Projektleitung','Key User','Consultant'], order:0, homeDocumentId:'UABC-PROJECT', externalUrl:null, pageId:null, spaceKey:null },
  { spaceId:'UABC-SPACE-PRODUCT', spaceType:'standard-product', title:'BC Basic Produkt', purpose:'Pilot-Arbeitsstand fuer das verkaufte und gelieferte BC-Basic-Leistungsmodell.', audience:['Vertrieb','Projektleitung','Consultant','Solution Architect'], order:1, homeDocumentId:'UABC-BCBPROJECT', externalUrl:null, pageId:null, spaceKey:null },
  { spaceId:'UABC-SPACE-CONSULTANT', spaceType:'consultant-internal', title:'BC Basic Consulting-Handbuch', purpose:'Pilot-Arbeitsstand fuer die reproduzierbare interne Durchfuehrung.', audience:['Consultant','Solution Architect','Support'], order:2, homeDocumentId:'UABC-BLUEPRINT', externalUrl:null, pageId:null, spaceKey:null }
];

const pages = [
  ['PAGE-UABC-000','UABC-PROJECT','00 Hilfe und Projektumgebung',null,'UABC-SPACE-CUSTOMER',0,'atlassian/confluence/pages/00-project.md'],
  ['PAGE-UABC-010','UABC-COMPANY','01 Unternehmen',null,'UABC-SPACE-CUSTOMER',1,'atlassian/confluence/pages/10-company-profile.md'],
  ['PAGE-UABC-130','UABC-BCBDELIVERABLES','02 Business Central',null,'UABC-SPACE-CUSTOMER',2,'atlassian/confluence/pages/74-bc-basic-deliverables.md'],
  ['PAGE-UABC-150','UABC-BCBSTORY','03 Projekte',null,'UABC-SPACE-CUSTOMER',3,'atlassian/confluence/pages/bc-basic-project-story.md'],
  ['PAGE-UABC-170','UABC-HYPERCARE','04 Handbuecher',null,'UABC-SPACE-CUSTOMER',4,'atlassian/confluence/pages/80-bc-basic-training.md'],
  ['PAGE-UABC-190','UABC-ARCHIVE','99 Archiv',null,'UABC-SPACE-CUSTOMER',5,'atlassian/confluence/pages/99-archive.md'],
  ['PAGE-UABC-050','UABC-DECISIONS','02.1 Datenmigration','UABC-BCBDELIVERABLES','UABC-SPACE-CUSTOMER',6,'atlassian/confluence/pages/32-decisions.md'],
  ['PAGE-UABC-100','UABC-BCBDISCOVERY','02.2 Prozesse und Fit-to-Standard','UABC-BCBDELIVERABLES','UABC-SPACE-CUSTOMER',7,'atlassian/confluence/pages/71-bc-basic-discovery.md'],
  ['PAGE-UABC-110','UABC-BCBIMPLEMENTATION','02.3 Loesung und Einrichtung','UABC-BCBDELIVERABLES','UABC-SPACE-CUSTOMER',8,'atlassian/confluence/pages/72-bc-basic-implementation.md'],
  ['PAGE-UABC-060','UABC-TESTS','03.1 Test und Abnahme','UABC-BCBSTORY','UABC-SPACE-CUSTOMER',9,'atlassian/confluence/pages/50-tests.md'],
  ['PAGE-UABC-080','UABC-WALKTHROUGH','03.2 Cutover und Go-live','UABC-BCBSTORY','UABC-SPACE-CUSTOMER',10,'atlassian/confluence/pages/61-walkthrough-pilot.md'],
  ['PAGE-UABC-160','UABC-BCBHCSTORY','03.3 Hypercare und Uebergabe','UABC-BCBSTORY','UABC-SPACE-CUSTOMER',11,'atlassian/confluence/pages/bc-basic-hypercare.md'],
  ['PAGE-UABC-090','UABC-BCBPROJECT','00 BC Basic Produktuebersicht',null,'UABC-SPACE-PRODUCT',0,'atlassian/confluence/pages/70-bc-basic-project.md'],
  ['PAGE-UABC-200','UABC-PRODUCTAUDIENCE','01 Zielgruppe und Einsatzfaelle',null,'UABC-SPACE-PRODUCT',1,'atlassian/confluence/pages/76-product-audience.md'],
  ['PAGE-UABC-040','UABC-PROCESSES','02 Leistungsumfang und Abgrenzung',null,'UABC-SPACE-PRODUCT',2,'atlassian/confluence/pages/31-processes.md'],
  ['PAGE-UABC-210','UABC-PRODUCTAPPROACH','03 Phasen und Vorgehensmodell',null,'UABC-SPACE-PRODUCT',3,'atlassian/confluence/pages/77-product-approach.md'],
  ['PAGE-UABC-180','UABC-TRAINING','04 Lieferobjekte und Abnahme',null,'UABC-SPACE-PRODUCT',4,'atlassian/confluence/pages/81-bc-basic-handover.md'],
  ['PAGE-UABC-220','UABC-PRODUCTOFFER','05 Angebot, Aufwand und Voraussetzungen',null,'UABC-SPACE-PRODUCT',5,'atlassian/confluence/pages/78-product-offer.md'],
  ['PAGE-UABC-120','UABC-BCBHYPERCARE','06 Optionen und Erweiterungen',null,'UABC-SPACE-PRODUCT',6,'atlassian/confluence/pages/73-bc-basic-hypercare.md'],
  ['PAGE-UABC-230','UABC-PRODUCTSALESFAQ','07 Vertriebsleitfaden und FAQ',null,'UABC-SPACE-PRODUCT',7,'atlassian/confluence/pages/79-product-sales-faq.md'],
  ['PAGE-UABC-030','UABC-BLUEPRINT','00 Durchfuehrungsueberblick',null,'UABC-SPACE-CONSULTANT',0,'atlassian/confluence/pages/30-blueprint.md'],
  ['PAGE-UABC-020','UABC-DISCOVERY','01 Discovery und Fit-to-Standard',null,'UABC-SPACE-CONSULTANT',1,'atlassian/confluence/pages/20-discovery.md'],
  ['PAGE-UABC-240','UABC-CONSULTINGDESIGN','02 Loesungsdesign und Projektplanung',null,'UABC-SPACE-CONSULTANT',2,'atlassian/confluence/pages/82-consulting-design.md'],
  ['PAGE-UABC-070','UABC-ENVBASELINE','03 BC-Einrichtung und Konfigurationspakete',null,'UABC-SPACE-CONSULTANT',3,'atlassian/confluence/pages/60-environment-baseline.md'],
  ['PAGE-UABC-250','UABC-CONSULTINGTESTS','04 Tests, UAT und Evidence',null,'UABC-SPACE-CONSULTANT',4,'atlassian/confluence/pages/83-consulting-tests.md'],
  ['PAGE-UABC-140','UABC-BCBMEETINGS','05 Schulung, Cutover und Hypercare',null,'UABC-SPACE-CONSULTANT',5,'atlassian/confluence/pages/75-bc-basic-meetings-decisions.md'],
  ['PAGE-UABC-260','UABC-CONSULTINGHANDOVER','06 Dokumentation und Uebergabe',null,'UABC-SPACE-CONSULTANT',6,'atlassian/confluence/pages/84-consulting-handover.md'],
  ['PAGE-UABC-270','UABC-CONSULTINGCHECKLISTS','07 Checklisten, Vorlagen und Fehlerbilder',null,'UABC-SPACE-CONSULTANT',7,'atlassian/confluence/pages/85-consulting-checklists.md']
].map(([storyPageId,documentId,title,parentId,spaceId,order,sourcePath])=>({storyPageId,documentId,title,parentId,spaceId,order,sourcePath}));
const pageIdByDocument = new Map(pages.map((page)=>[page.documentId,page.storyPageId]));
const spaceById = new Map(spaces.map((space)=>[space.spaceId,space]));
const newIds = new Set(pages.filter((page)=>!baseById.has(page.storyPageId)).map((page)=>page.storyPageId));
const newPageText = (page) => {
  const space = spaceById.get(page.spaceId);
  const role = page.spaceId === 'UABC-SPACE-CUSTOMER' ? 'Diese Seite fuehrt konkrete Universaarl-Projektwahrheit.' : page.spaceId === 'UABC-SPACE-PRODUCT' ? 'Diese Seite beschreibt, was als BC-Basic-Pilotprodukt verkauft und geliefert wird.' : 'Diese Seite beschreibt, wie Consultants die Leistung reproduzierbar durchfuehren.';
  const special = page.documentId === 'UABC-ARCHIVE' ? 'Archivdatum und Archivgrund sind je Eintrag verpflichtend. Jeder Eintrag nennt eine aktive Nachfolgeseite; aktuell verweist der abgeschlossene Producerstand auf `UABC-BCBSTORY`.' : page.documentId === 'UABC-PRODUCTOFFER' ? 'Der synthetische Referenzumfang betraegt 80 Stunden und 9.600 EUR. Reale Angebote und Voraussetzungen werden kundenspezifisch bestaetigt.' : page.documentId === 'UABC-PRODUCTSALESFAQ' ? 'Continia Banking und Continia Finance sind ausschliesslich spaetere Produktoptionen. Es gibt keine Ausfuehrung, Stunden oder Evidence.' : 'Fuehrende Details werden verlinkt und nicht als zweite Wahrheit kopiert.';
  const meta = { id:page.documentId,title:page.title,parent:page.parentId,owners:['P-002'],status:'published',version:1,spaceId:page.spaceId,spaceType:space.spaceType,order:page.order,storyPageId:page.storyPageId,purpose:role,audience:space.audience,jiraRefs:['UABC-50'],referenceIds:['UABC-REQ-BCB-010'],lastReviewed:'2026-07-12' };
  const storyMeta={id:page.storyPageId,title:page.title,parent:page.parentId?pageIdByDocument.get(page.parentId):null,version:1,status:'published'};
  return `---\n${YAML.stringify(meta).trimEnd()}\n---\n\n# ${page.title}\n\n## Zweck und Inhaltsgrenze\n\n${role} ${special}\n\n## Dauerhafter Inhalt\n\nDie Seite ist Bestandteil der source-driven V1-Navigation. Kunden-, Produkt- und Consulting-Wahrheiten bleiben getrennt; Querverbindungen erfolgen als Referenz auf die jeweils fuehrende Seite. Wiederverwendbare Erkenntnisse bleiben \`blueprint-candidate\` und werden nicht automatisch Spectra zugerechnet.\n\n## Referenzen\n\n- Drei-Space-Vertrag: \`${CONTRACT}\`\n- Projektstory: \`${STORY}\`\n\n<!-- story-metadata ${JSON.stringify(storyMeta)} -->\n`;
};
const updateExisting = (page) => {
  const text = fs.readFileSync(page.sourcePath,'utf8').replace(/\r\n/g,'\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/); if(!match) throw new Error(`${page.sourcePath}: Frontmatter fehlt`);
  const meta = YAML.parse(match[1]); const space=spaceById.get(page.spaceId);
  const version=(baseById.get(page.storyPageId)?.version??1)+1;
  Object.assign(meta,{title:page.title,parent:page.parentId,version,spaceId:page.spaceId,spaceType:space.spaceType,order:page.order,storyPageId:page.storyPageId});
  const storyMeta={id:page.storyPageId,title:page.title,parent:page.parentId?pageIdByDocument.get(page.parentId):null,version,status:'published'};
  const body=text.slice(match[0].length).replace(/^# .+$/m,`# ${page.title}`).replace(/<!-- story-metadata [\s\S]*? -->/,`<!-- story-metadata ${JSON.stringify(storyMeta)} -->`);
  fs.writeFileSync(page.sourcePath,`---\n${YAML.stringify(meta).trimEnd()}\n---\n${body}`,'utf8');
};
for(const page of pages){ if(newIds.has(page.storyPageId) && !fs.existsSync(page.sourcePath)){fs.mkdirSync('atlassian/confluence/pages',{recursive:true});fs.writeFileSync(page.sourcePath,newPageText(page),'utf8');}else updateExisting(page); }

const definitions = pages.map((page,indexNumber)=>{
  const old=existingDefinitions.get(page.storyPageId); const meta=YAML.parse(fs.readFileSync(page.sourcePath,'utf8').match(/^---\n([\s\S]*?)\n---/)[1]);
  return { artifactId:old?.artifactId??`UABC-SRC-BCB-CONF-${String(20+indexNumber).padStart(3,'0')}`, documentId:page.documentId,title:page.title,documentType:'confluence-page',parentId:page.parentId,phase:old?.phase??'project-wide',process:old?.process??'three-space-navigation',status:'published',ownerRefs:meta.owners,jiraRefs:meta.jiraRefs,referenceIds:meta.referenceIds,lastReviewed:meta.lastReviewed,visibility:'twin-visible',readiness:newIds.has(page.storyPageId)?'v1-ready':'verified-with-history',externalUrl:null,pageId:null,spaceKey:null,spaceId:page.spaceId,spaceType:spaceById.get(page.spaceId).spaceType,order:page.order,storyPageId:page.storyPageId };
});
for(const definition of definitions){ if(!existingArtifacts.has(definition.artifactId)) index.artifacts.push({id:definition.artifactId,kindId:'confluence-page',path:pages.find((page)=>page.storyPageId===definition.storyPageId).sourcePath,format:'markdown',required:true}); }
if(!index.artifacts.some((item)=>item.path===CONTRACT))index.artifacts.push({id:'UABC-SRC-BCB-THREE-SPACE-001',kindId:'confluence-three-space-contract',path:CONTRACT,format:'yaml',required:true});
index.allowedBranch='codex/universaarl-projekt'; index.deliveryBranch='codex/universaarl-projekt';
index.consumerRules=(index.consumerRules??[]).map((rule)=>typeof rule==='string'?rule.replace('19 strukturierten Projektseiten','28 strukturierten Projektseiten mit 22 Roots und sechs Unterseiten'):rule);
index.documentCatalog.documentCount=46; index.documentCatalog.spaces=spaces;
index.documentCatalog.definitions=[...index.documentCatalog.definitions.filter((item)=>item.documentType!=='confluence-page'),...definitions];
index.documentCatalog.navigationModules=spaces.map((space)=>({moduleId:`UABC-NAV-${space.spaceId.split('-').at(-1)}`,spaceId:space.spaceId,title:space.title,order:space.order}));
const moduleBySpace=new Map(index.documentCatalog.navigationModules.map((module)=>[module.spaceId,module]));
const nodeByDocument=new Map(pages.map((page)=>[page.documentId,`UABC-NAV-NODE-${page.documentId.replace(/^UABC-/,'')}`]));
index.documentCatalog.navigationNodes=[...spaces.map((space)=>({nodeId:`UABC-NAV-NODE-${space.spaceId.split('-').at(-1)}`,moduleId:moduleBySpace.get(space.spaceId).moduleId,nodeType:'group',title:space.title,order:0,parentNodeId:null,documentId:null,description:space.purpose,initialState:'expanded'})),...pages.map((page)=>({nodeId:nodeByDocument.get(page.documentId),moduleId:moduleBySpace.get(page.spaceId).moduleId,nodeType:'page',title:page.title,order:page.order,parentNodeId:page.parentId?nodeByDocument.get(page.parentId):`UABC-NAV-NODE-${page.spaceId.split('-').at(-1)}`,documentId:page.documentId,initialState:page.parentId?'collapsed':'expanded'}))];
const basePathById=new Map(baseStory.pages.map((page)=>[page.id,page.sourcePath]));
const migrations=baseStory.pages.map((old)=>{const page=pages.find((candidate)=>candidate.storyPageId===old.id);if(!page)throw new Error(`${old.id}: Ziel fehlt`);const normalizeBody=(value)=>value.toString('utf8').replace(/\r\n/g,'\n').replace(/^---\n[\s\S]*?\n---\n/,'').replace(/^\s*# .+\n/,'').replace(/\n?<!-- story-metadata [\s\S]*? -->\s*$/,'').trim();const before=normalizeBody(execFileSync('git',['show',`${BASE}:${old.sourcePath}`],{env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}));const after=normalizeBody(fs.readFileSync(page.sourcePath));return {documentId:page.documentId,storyPageId:page.storyPageId,sourcePath:page.sourcePath,previousTitle:old.title,previousParentId:old.parent?baseStory.pages.find((p)=>p.id===old.parent)?.id??old.parent:null,targetTitle:page.title,targetParentId:page.parentId,migrationStatus:'migrated-in-place',bodySha256Before:sha(before),bodySha256After:sha(after),lossless:sha(before)===sha(after)};});
const newRoots=pages.filter((page)=>newIds.has(page.storyPageId)).map((page)=>({documentId:page.documentId,storyPageId:page.storyPageId,sourcePath:page.sourcePath,previousTitle:null,previousParentId:null,targetTitle:page.title,targetParentId:page.parentId,migrationStatus:'neue-erforderliche-wurzelseite',bodySha256Before:null,bodySha256After:sha(fs.readFileSync(page.sourcePath)),lossless:true}));
index.documentCatalog.redirects=migrations.map(({bodySha256Before,bodySha256After,lossless,...redirect})=>redirect);
const referencesById=new Map(pages.map((page)=>{const meta=YAML.parse(fs.readFileSync(page.sourcePath,'utf8').match(/^---\n([\s\S]*?)\n---/)[1]);return [page.storyPageId,meta.jiraRefs??[]];}));
story.pages=pages.map((page)=>{const meta=YAML.parse(fs.readFileSync(page.sourcePath,'utf8').match(/^---\n([\s\S]*?)\n---/)[1]);return {id:page.storyPageId,title:page.title,parent:page.parentId?pageIdByDocument.get(page.parentId):null,version:Number(meta.version),status:'published',author_role:'project-team',time:'2026-07-12T12:00:00+02:00',sourcePath:page.sourcePath,references:referencesById.get(page.storyPageId),spaceId:page.spaceId,spaceType:spaceById.get(page.spaceId).spaceType,order:page.order};});
story.controls={...story.controls,confluencePageCount:28,confluenceRootCount:22,confluenceRootDistribution:{customer:6,product:8,consultant:8},confluenceMigrationCount:19};
const committedContract=YAML.parse(execFileSync('git',['show',`HEAD:${CONTRACT}`],{env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).toString('utf8'));
const contract={schemaVersion:1,contractId:'UABC-CONFLUENCE-THREE-SPACE-V1',projectId:'UABC-BC-BASIC-001',governingChange:'migrate-bc-basic-to-three-space-confluence-v1',sourceMode:'repository-quelle',deliveryBranch:index.deliveryBranch,consumerProducerBranch:'codex/universaarl-projekt',spaceCount:3,rootDistribution:{customer:6,product:8,consultant:8},pageCount:28,legacyPageCount:19,newRequiredRootCount:9,truthBoundaries:{customer:'konkrete-kundenprojektwahrheit',product:'pilotstand-verkaufs-und-lieferumfang',consulting:'pilotstand-durchfuehrungsmethode',spectra:'blueprint-candidate-only-no-automatic-adoption'},leadingContentOwnership:{customer:'konkrete-kundenauspraegung',product:'verkaufs-und-lieferumfang',consulting:'durchfuehrungsmethode'},spaces,roots:pages.filter((page)=>page.parentId===null),children:pages.filter((page)=>page.parentId!==null),migrations:committedContract.migrations,newRoots:committedContract.newRoots,forbiddenClaims:['live-atlassian','live-rovo','live-business-central','continia-execution','invented-approval','invented-spectra-release']};
fs.writeFileSync(CONTRACT,YAML.stringify(contract),'utf8');
fs.writeFileSync(INDEX,YAML.stringify(index),'utf8');
fs.writeFileSync(STORY,JSON.stringify(story,null,2)+'\n','utf8');
console.log(`Drei-Space-Vertrag erzeugt: ${spaces.length} Spaces, ${contract.roots.length} Roots, ${contract.children.length} Kinder, ${migrations.length} Altseiten, ${newRoots.length} neue Roots.`);

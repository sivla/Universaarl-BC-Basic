import fs from 'node:fs';
import YAML from 'yaml';

const CONTRACT='project/bc-basic/confluence-three-space-v1.yaml';
const EXPECTED={
  'UABC-SPACE-CUSTOMER':['00 Support','01 Unternehmen','02 Business Central','03 Projekte','04 Handbuecher','99 Archiv'],
  'UABC-SPACE-PRODUCT':['00 BC Basic Produktuebersicht','01 Zielgruppe und Einsatzfaelle','02 Leistungsumfang und Abgrenzung','03 Phasen und Vorgehensmodell','04 Lieferobjekte und Abnahme','05 Angebot, Aufwand und Voraussetzungen','06 Optionen und Erweiterungen','07 Vertriebsleitfaden und FAQ'],
  'UABC-SPACE-CONSULTANT':['00 Consulting-Ueberblick','01 Discovery und Fit-to-Standard','02 Loesungsdesign und Projektplanung','03 BC-Einrichtung und Konfigurationspakete','04 Tests, UAT und Evidence','05 Schulung, Cutover und Hypercare','06 Dokumentation und Uebergabe','07 Checklisten, Vorlagen und Fehlerbilder']
};
export function validateThreeSpace({contract,index,story,readText=(path)=>fs.readFileSync(path,'utf8')}){
  const errors=[];const fail=(code,detail)=>errors.push(`${code}: ${detail}`);
  if(contract?.spaceCount!==3||contract?.spaces?.length!==3||JSON.stringify(contract.rootDistribution)!==JSON.stringify({customer:6,product:8,consultant:8})||JSON.stringify((contract?.spaces??[]).map(s=>s.spaceId))!==JSON.stringify(Object.keys(EXPECTED)))fail('SPACE-VERTRAG','3 Spaces und 6/8/8 erforderlich');
  if(contract?.deliveryBranch!=='codex/bc-basic-three-space-v1'||contract?.consumerProducerBranch!=='codex/universaarl-projekt'||index?.allowedBranch!=='codex/universaarl-projekt'||index?.deliveryBranch!=='codex/bc-basic-three-space-v1')fail('BRANCH-VERTRAG','Delivery- und Consumer-Producerbranch muessen getrennt bleiben');
  const roots=contract?.roots??[],children=contract?.children??[];
  if(roots.length!==22)fail('ROOT-VERTRAG',String(roots.length)); if(children.length!==6)fail('UNTERSEITEN-VERTRAG',String(children.length));
  for(const [spaceId,titles] of Object.entries(EXPECTED)){const actual=roots.filter(r=>r.spaceId===spaceId).sort((a,b)=>a.order-b.order).map(r=>r.title);if(JSON.stringify(actual)!==JSON.stringify(titles))fail('ROOT-VERTRAG',spaceId);}
  const all=[...roots,...children],ids=new Set(),stories=new Set(),paths=new Set();for(const page of all){if(ids.has(page.documentId)||stories.has(page.storyPageId)||paths.has(page.sourcePath))fail('DOPPELTE-SEITEN-ID',page.documentId);ids.add(page.documentId);stories.add(page.storyPageId);paths.add(page.sourcePath);if(page.parentId){const parent=all.find(x=>x.documentId===page.parentId);if(!parent)fail('PARENT-FEHLT',page.documentId);else if(parent.spaceId!==page.spaceId)fail('CROSS-SPACE-PARENT',page.documentId);}}
  if(children.some(c=>c.spaceId!=='UABC-SPACE-CUSTOMER'||!['UABC-BCBDELIVERABLES','UABC-BCBSTORY','UABC-HYPERCARE'].includes(c.parentId)))fail('UNTERSEITEN-VERTRAG','05..10 muessen unter 02/03/04 liegen');
  const migrations=contract?.migrations??[];if(migrations.length!==19||new Set(migrations.map(m=>m.storyPageId)).size!==19||migrations.some(m=>!m.lossless||m.bodySha256Before!==m.bodySha256After))fail('MIGRATIONS-PROVENIENZ','19/19 verlustfreie Altseiten erforderlich');
  if((contract?.newRoots??[]).length!==9||contract.newRoots.some(r=>!r.sourcePath||readText(r.sourcePath).length<500))fail('NEUE-ROOT-INHALT','neun dauerhafte neue Roots erforderlich');
  if(JSON.stringify(contract?.leadingContentOwnership)!==JSON.stringify({customer:'concrete-instance-facts',product:'sold-and-delivered-scope',consulting:'delivery-method'}))fail('INHALTSGRENZE','fuehrende Inhalte sind nicht eindeutig');
  if(contract?.truthBoundaries?.spectra!=='blueprint-candidate-only-no-automatic-adoption')fail('SPECTRA-WAHRHEIT','keine automatische Spectra-Uebernahme');
  for(const claim of ['live-atlassian','live-rovo','live-business-central','continia-execution','invented-approval','invented-spectra-release'])if(!(contract?.forbiddenClaims??[]).includes(claim))fail('WAHRHEITSGRENZE',claim);
  const {ticketMigration,...activeStory}=story??{};const activeText=JSON.stringify({story:activeStory,index,roots,children});if(/\b(?:TKT-UABC-|UABC-PHASE-)/.test(activeText))fail('AKTIVE-ALT-ID','aktive Alt-ID gefunden');
  if(index?.governingChange!==contract.governingChange||index?.documentCatalog?.definitions?.filter(d=>d.documentType==='confluence-page').length!==28)fail('KATALOG-FEHLT','Index ist nicht aus dem Drei-Space-Vertrag abgeleitet');
  if(story?.pages?.length!==28||story?.pages?.filter(p=>p.parent===null).length!==22)fail('STORY-ABLEITUNG','Project Story ist unvollstaendig');
  const archive=readText('atlassian/confluence/pages/99-archive.md');if(!/Archivdatum|Archivgrund|Nachfolgeseite/.test(archive))fail('ARCHIV-INHALT','Archivdatum, Grund und Nachfolger fehlen');
  return errors;
}
export function loadThreeSpace(){return {contract:YAML.parse(fs.readFileSync(CONTRACT,'utf8')),index:YAML.parse(fs.readFileSync('exports/project-data/v1/index.yaml','utf8')),story:JSON.parse(fs.readFileSync('evidence/simulation/project-story.json','utf8'))};}
if(process.argv[1]?.endsWith('validate-three-space-confluence.mjs')){const errors=validateThreeSpace(loadThreeSpace());if(errors.length){console.error(`Drei-Space-Pruefung fehlgeschlagen (${errors.length}):`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1);}console.log('Drei-Space-Pruefung bestanden: 3 Spaces, 22 Roots (6/8/8), 6 Unterseiten und 19/19 verlustfreie Migrationen.');}

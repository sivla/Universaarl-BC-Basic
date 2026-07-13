import fs from 'node:fs';
import YAML from 'yaml';

const CONTRACT='project/bc-basic/confluence-three-space-v1.yaml';
const EXPECTED_SPACES=['UABC-SPACE-CUSTOMER','UABC-SPACE-PRODUCT','UABC-SPACE-CONSULTANT'];
export function validateThreeSpace({contract,index,story,readText=(path)=>fs.readFileSync(path,'utf8')}){
  const errors=[];const fail=(code,detail)=>errors.push(`${code}: ${detail}`);
  if(contract?.spaceCount!==3||contract?.spaces?.length!==3||JSON.stringify((contract?.spaces??[]).map(s=>s.spaceId))!==JSON.stringify(EXPECTED_SPACES))fail('SPACE-VERTRAG','exakt drei geordnete fachliche Spaces sind erforderlich');
  if(contract?.consumerProducerBranch!=='codex/universaarl-projekt'||index?.allowedBranch!=='codex/universaarl-projekt'||index?.deliveryBranch!==contract.deliveryBranch||contract.deliveryBranch===contract.consumerProducerBranch||!contract.deliveryBranch?.startsWith('codex/'))fail('BRANCH-VERTRAG','Delivery- und Consumer-Producerbranch muessen getrennt bleiben');
  const roots=contract?.roots??[],children=contract?.children??[];
  const derivedRootDistribution={customer:roots.filter(r=>r.spaceId==='UABC-SPACE-CUSTOMER').length,product:roots.filter(r=>r.spaceId==='UABC-SPACE-PRODUCT').length,consultant:roots.filter(r=>r.spaceId==='UABC-SPACE-CONSULTANT').length};
  if(roots.length<3||Object.values(derivedRootDistribution).some(count=>count<1)||JSON.stringify(contract.rootDistribution)!==JSON.stringify(derivedRootDistribution))fail('ROOT-VERTRAG','jede Space-Struktur benoetigt mindestens eine Rootseite und eine abgeleitete Zaehlsicht');
  const all=[...roots,...children],ids=new Set(),stories=new Set(),paths=new Set();for(const page of all){if(ids.has(page.documentId)||stories.has(page.storyPageId)||paths.has(page.sourcePath))fail('DOPPELTE-SEITEN-ID',page.documentId);ids.add(page.documentId);stories.add(page.storyPageId);paths.add(page.sourcePath);if(page.parentId){const parent=all.find(x=>x.documentId===page.parentId);if(!parent)fail('PARENT-FEHLT',page.documentId);else if(parent.spaceId!==page.spaceId)fail('CROSS-SPACE-PARENT',page.documentId);}}
  if(children.some(c=>c.spaceId!=='UABC-SPACE-CUSTOMER'||!['UABC-BCBDELIVERABLES','UABC-BCBSTORY','UABC-HYPERCARE'].includes(c.parentId)))fail('UNTERSEITEN-VERTRAG','bestehende Kunden-Unterseiten muessen unter ihrer fachlich fuehrenden Rootseite liegen');
  const migrations=contract?.migrations??[];if(migrations.length!==19||new Set(migrations.map(m=>m.storyPageId)).size!==19||migrations.some(m=>!m.lossless||m.bodySha256Before!==m.bodySha256After))fail('MIGRATIONS-PROVENIENZ','19/19 verlustfreie Altseiten erforderlich');
  for(const page of all){const text=readText(page.sourcePath);if(text.length<1000||/Die Seite ist Bestandteil der source-driven V1-Navigation/.test(text))fail('SEITEN-NUTZWERT',`${page.documentId}: Seite ist leer, zu kurz oder nur Meta-Inhalt`);}
  if(JSON.stringify(contract?.leadingContentOwnership)!==JSON.stringify({customer:'konkrete-kundenauspraegung',product:'verkaufs-und-lieferumfang',consulting:'durchfuehrungsmethode'}))fail('INHALTSGRENZE','fuehrende Inhalte sind nicht eindeutig');
  if(contract?.sourceMode!=='repository-quelle'||contract?.truthBoundaries?.customer!=='konkrete-kundenprojektwahrheit'||contract?.truthBoundaries?.spectra!=='blueprint-candidate-only-no-automatic-adoption')fail('SPECTRA-WAHRHEIT','Repositoryquelle, Kundenwahrheit und keine automatische Spectra-Uebernahme muessen eindeutig sein');
  for(const claim of ['live-atlassian','live-rovo','live-business-central','continia-execution','invented-approval','invented-spectra-release'])if(!(contract?.forbiddenClaims??[]).includes(claim))fail('WAHRHEITSGRENZE',claim);
  const {ticketMigration,...activeStory}=story??{};const activeText=JSON.stringify({story:activeStory,index,roots,children});if(/\b(?:TKT-UABC-|UABC-PHASE-)/.test(activeText))fail('AKTIVE-ALT-ID','aktive Alt-ID gefunden');
  const contractArtifact=(index?.artifacts??[]).find(artifact=>artifact.path===CONTRACT);
  if(!contractArtifact||index?.documentCatalog?.definitions?.filter(d=>d.documentType==='confluence-page').length!==28)fail('KATALOG-FEHLT','Index ist nicht aus dem versionierten Drei-Space-Vertrag abgeleitet');
  if(story?.pages?.length!==28||story?.pages?.filter(p=>p.parent===null).length!==22)fail('STORY-ABLEITUNG','Project Story ist unvollstaendig');
  const archive=readText('atlassian/confluence/pages/99-archive.md');if(!/Archivdatum|Archivgrund|Nachfolgeseite/.test(archive))fail('ARCHIV-INHALT','Archivdatum, Grund und Nachfolger fehlen');
  return errors;
}
export function loadThreeSpace(){return {contract:YAML.parse(fs.readFileSync(CONTRACT,'utf8')),index:YAML.parse(fs.readFileSync('exports/project-data/v1/index.yaml','utf8')),story:JSON.parse(fs.readFileSync('evidence/simulation/project-story.json','utf8'))};}
if(process.argv[1]?.endsWith('validate-three-space-confluence.mjs')){const data=loadThreeSpace();const errors=validateThreeSpace(data);if(errors.length){console.error(`Drei-Space-Pruefung fehlgeschlagen (${errors.length}):`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1);}console.log(`Drei-Space-Pruefung bestanden: 3 Spaces, ${data.contract.roots.length} nutzwertige Roots, ${data.contract.children.length} Unterseiten und ${data.contract.migrations.length}/${data.contract.migrations.length} verlustfreie Migrationen.`);}

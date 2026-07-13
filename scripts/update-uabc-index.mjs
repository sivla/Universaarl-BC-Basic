import fs from 'node:fs'; import YAML from 'yaml';
const path='exports/project-data/v1/index.yaml'; const index=YAML.parse(fs.readFileSync(path,'utf8'));
const tickets=YAML.parse(fs.readFileSync('atlassian/jira/issues/bc-basic-story-tickets.yaml','utf8'));
const records=tickets.records??tickets.ticketRecords??[];
index.ticketCatalog={path:'atlassian/jira/issues/bc-basic-story-tickets.yaml',sourceContract:'evidence/simulation/project-story.json',migrationMatrix:'project/bc-basic/ticket-migration.yaml',recordCount:records.length,customerStoryCount:records.length,internalTraceabilityCount:0,canonicalTypes:['phase','epic','story','task'],typeField:'type',canonicalTypeField:'canonicalType',parentField:'parent',visibilityRoleField:'visibilityRole',countingScopeField:'countingScope',typePresentationsField:'typePresentations',typeLabelField:'typeLabel',displayIconKeyField:'displayIconKey',displayColorTokenField:'displayColorToken',liveIconPolicyField:'liveIconPolicy',viewsField:'views',presentationTypes:['phase','epic','story','task'],viewIds:['UABC-TICKET-VIEW-BOARD-001','UABC-TICKET-VIEW-COMPACT-001'],viewTypes:['board','compact-list'],inferTypeFromKeyOrTitle:false};
index.referenceDefinitions=index.referenceDefinitions||{}; index.referenceDefinitions.jiraRefs=records.map((ticket)=>ticket.id);
index.documentCatalog=index.documentCatalog||{}; index.documentCatalog.referenceDefinitions=index.documentCatalog.referenceDefinitions||{}; index.documentCatalog.referenceDefinitions.jiraRefs=records.map((ticket)=>ticket.id);
index.consumerRules=(index.consumerRules||[]).map(r=>typeof r==='string'&&r.includes('drei Phase-Tickets')?'Ausschliesslich ticketCatalog.path ist die aktuelle Ticketansicht und Zaehlsurface; Umfang und Ticketanzahl werden aus der kanonischen Quelle dynamisch gelesen.':r);
const replacePath=(oldPath,newPath)=>{for(const a of index.artifacts||[]) if(a.path===oldPath) a.path=newPath;};
index.artifacts=(index.artifacts||[]).filter(a=>!String(a.path||'').includes('openspec/changes/deliver-bc-basic-customer-project'));
for(const name of ['proposal.md','design.md','tasks.md','verification.md']) replacePath(`openspec/changes/deliver-bc-basic-customer-project/${name}`,`openspec/changes/migrate-bc-basic-to-single-uabc-ticket-project/${name}`);
replacePath('openspec/changes/deliver-bc-basic-customer-project/specs/bc-basic-delivery/spec.md','openspec/changes/migrate-bc-basic-to-single-uabc-ticket-project/specs/bc-basic-ticket-migration/spec.md');
replacePath('scripts/validate-spectra-0.7-conformance.mjs','scripts/validate-spectra-0.7-historical-provenance.mjs');
for(const [id,p,kind] of [['UABC-SRC-BCB-TICKET-MIGRATION-001','project/bc-basic/ticket-migration.yaml','ticket-migration-provenance']]) if(!(index.artifacts||[]).some(a=>a.path===p)) index.artifacts.push({id,kindId:kind,path:p,format:'yaml',required:true});
index.artifacts=(index.artifacts||[]).filter(a=>!String(a.path||'').includes('atlassian/confluence/meetings/')||a.path==='atlassian/confluence/meetings/index.yaml');
const transcripts=[['UABC-SRC-BCB-MTG-TRANSCRIPT-001','UABC-MTG-001','Synthetischer Discovery- und Fit-to-Standard-Workshop','discovery'],['UABC-SRC-BCB-MTG-TRANSCRIPT-002','UABC-MTG-002','Setup, Migration, Prozesse, SIT, UAT und Schulung','setup-and-migration'],['UABC-SRC-BCB-MTG-TRANSCRIPT-003','UABC-MTG-003','Go-live, Hypercare, Finance-Abschluss und Handover','transition']];
for(const [id,docId,title] of transcripts){const p=`atlassian/confluence/meetings/${docId}.md`;if(!(index.artifacts||[]).some(a=>a.path===p))index.artifacts.push({id,kindId:'meeting-transcript',path:p,format:'markdown',required:true});}
if(index.documentCatalog?.definitions){index.documentCatalog.definitions=index.documentCatalog.definitions.filter(d=>!String(d.artifactId||'').startsWith('UABC-SRC-BCB-MTG-'));for(const [id,docId,title,phase] of transcripts)index.documentCatalog.definitions.push({artifactId:id,documentId:docId,title,documentType:'meeting-transcript',parentId:null,phase,process:'project-delivery',status:'simulated-complete',ownerRefs:[],jiraRefs:[],referenceIds:[],lastReviewed:null,visibility:'twin-visible',readiness:'verified-with-history',externalUrl:null,pageId:null,spaceKey:null});index.documentCatalog.documentCount=43;}
for (const definition of index.documentCatalog?.definitions ?? []) {
  if (definition.documentType !== 'confluence-page') continue;
  const artifact = (index.artifacts ?? []).find((item) => item.id === definition.artifactId);
  if (!artifact?.path?.startsWith('atlassian/confluence/pages/')) continue;
  const source = fs.readFileSync(artifact.path, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error(`${artifact.path}: Frontmatter fehlt`);
  const metadata = YAML.parse(frontmatter[1]);
  Object.assign(definition, {
    documentId: metadata.id,
    title: metadata.title,
    parentId: metadata.parent ?? null,
    status: metadata.status,
    ownerRefs: metadata.owners,
    jiraRefs: metadata.jiraRefs,
    referenceIds: metadata.referenceIds,
    lastReviewed: metadata.lastReviewed,
    spaceId: metadata.spaceId,
    spaceType: metadata.spaceType,
    order: metadata.order,
    storyPageId: metadata.storyPageId
  });
}
if(index.documentCatalog) index.documentCatalog.documentCount=43;
fs.writeFileSync(path,YAML.stringify(index)); console.log(`Branch-Index auf ${records.length} dynamische aktive Tickets aktualisiert.`);

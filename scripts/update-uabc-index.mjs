import fs from 'node:fs'; import YAML from 'yaml';
const path='exports/project-data/v1/index.yaml'; const index=YAML.parse(fs.readFileSync(path,'utf8'));
const archivedReferenceChangePath='openspec/changes/archive/2026-07-14-complete-bc-basic-reference-simulation';
const tickets=YAML.parse(fs.readFileSync('atlassian/jira/issues/bc-basic-story-tickets.yaml','utf8'));
const records=tickets.records??tickets.ticketRecords??[];
index.governingChange='complete-bc-basic-reference-simulation';
index.ticketCatalog={path:'atlassian/jira/issues/bc-basic-story-tickets.yaml',sourceContract:'evidence/simulation/project-story.json',migrationMatrix:'project/bc-basic/ticket-migration.yaml',recordCount:records.length,customerStoryCount:records.length,internalTraceabilityCount:0,canonicalTypes:['phase','epic','story','task'],typeField:'type',canonicalTypeField:'canonicalType',parentField:'parent',visibilityRoleField:'visibilityRole',countingScopeField:'countingScope',typePresentationsField:'typePresentations',typeLabelField:'typeLabel',displayIconKeyField:'displayIconKey',displayColorTokenField:'displayColorToken',liveIconPolicyField:'liveIconPolicy',viewsField:'views',presentationTypes:['phase','epic','story','task'],viewIds:['UABC-TICKET-VIEW-BOARD-001','UABC-TICKET-VIEW-COMPACT-001'],viewTypes:['board','compact-list'],inferTypeFromKeyOrTitle:false};
index.referenceDefinitions=index.referenceDefinitions||{}; index.referenceDefinitions.jiraRefs=records.map((ticket)=>ticket.id);
index.documentCatalog=index.documentCatalog||{}; index.documentCatalog.referenceDefinitions=index.documentCatalog.referenceDefinitions||{}; index.documentCatalog.referenceDefinitions.jiraRefs=records.map((ticket)=>ticket.id);
index.consumerRules=(index.consumerRules||[]).map(r=>typeof r==='string'&&r.includes('drei Phase-Tickets')?'Ausschliesslich ticketCatalog.path ist die aktuelle Ticketansicht und Zaehlsurface; Umfang und Ticketanzahl werden aus der kanonischen Quelle dynamisch gelesen.':r);
const replacePath=(oldPath,newPath)=>{for(const a of index.artifacts||[]) if(a.path===oldPath) a.path=newPath;};
index.artifacts=(index.artifacts||[]).filter(a=>!String(a.path||'').includes('openspec/changes/deliver-bc-basic-customer-project'));
for(const name of ['proposal.md','design.md','tasks.md','verification.md']) replacePath(`openspec/changes/deliver-bc-basic-customer-project/${name}`,`openspec/changes/migrate-bc-basic-to-single-uabc-ticket-project/${name}`);
replacePath('openspec/changes/deliver-bc-basic-customer-project/specs/bc-basic-delivery/spec.md','openspec/changes/migrate-bc-basic-to-single-uabc-ticket-project/specs/bc-basic-ticket-migration/spec.md');
replacePath('scripts/validate-spectra-0.7-conformance.mjs','scripts/validate-spectra-0.7-historical-provenance.mjs');
replacePath('evidence/spectra-release-0.10.0-alpha.1.yaml','evidence/spectra-release-1.0.0.yaml');
replacePath('openspec/changes/deliver-production-ready-bc-basic-onboarding/specs/project-governance/spec.md','openspec/changes/complete-bc-basic-reference-simulation/specs/bc-basic-reference-simulation/spec.md');
for(const [id,p,kind] of [['UABC-SRC-BCB-TICKET-MIGRATION-001','project/bc-basic/ticket-migration.yaml','ticket-migration-provenance']]) if(!(index.artifacts||[]).some(a=>a.path===p)) index.artifacts.push({id,kindId:kind,path:p,format:'yaml',required:true});
const readinessArtifacts=[
  ['UABC-SRC-BCB-PRODUCTION-READINESS-001','governance/production-readiness.json','production-readiness-contract','json'],
  ['UABC-SRC-BCB-ONBOARDING-RUNBOOK-001','docs/runbooks/bc-basic-onboarding-delivery.md','consultant-onboarding-runbook','markdown'],
  ['UABC-SRC-BCB-ONBOARDING-INPUT-001','project/bc-basic/customer-templates/blank/onboarding-intake.blank.yaml','sanitized-input-template','yaml'],
  ['UABC-SRC-BCB-ONBOARDING-INPUT-DOC-001','docs/templates/bc-basic-onboarding-input.md','sanitized-input-guide','markdown'],
  ['UABC-SRC-BCB-DELIVERY-EVIDENCE-TPL-001','docs/templates/bc-basic-delivery-evidence-pack.md','delivery-evidence-template','markdown'],
  ['UABC-SRC-BCB-READINESS-VALIDATOR-001','scripts/validate-production-readiness.mjs','production-readiness-validator','javascript'],
  ['UABC-SRC-BCB-READINESS-TEST-001','tests/governance/production-readiness.test.mjs','production-readiness-negative-tests','javascript'],
  ['UABC-SRC-BCB-REFERENCE-PROPOSAL-001','openspec/changes/complete-bc-basic-reference-simulation/proposal.md','openspec-proposal','markdown'],
  ['UABC-SRC-BCB-REFERENCE-DESIGN-001','openspec/changes/complete-bc-basic-reference-simulation/design.md','openspec-design','markdown'],
  ['UABC-SRC-BCB-REFERENCE-TASKS-001','openspec/changes/complete-bc-basic-reference-simulation/tasks.md','openspec-tasks','markdown'],
  ['UABC-SRC-BCB-REFERENCE-VERIFICATION-001','openspec/changes/complete-bc-basic-reference-simulation/verification.md','openspec-verification','markdown'],
  ['UABC-SRC-BCB-REFERENCE-SPEC-001','openspec/changes/complete-bc-basic-reference-simulation/specs/bc-basic-reference-simulation/spec.md','openspec-spec','markdown'],
  ['UABC-SRC-BCB-REFERENCE-CONTRACT-001','project/bc-basic/reference-simulation.yaml','reference-simulation-contract','yaml'],
  ['UABC-SRC-BCB-REFERENCE-EXPORT-001','exports/project-data/v1/reference-simulation.json','reference-simulation-export','json'],
  ['UABC-SRC-BCB-REFERENCE-VALIDATOR-001','scripts/validate-reference-simulation.mjs','reference-simulation-validator','javascript'],
  ['UABC-SRC-BCB-REFERENCE-TEST-001','tests/governance/reference-simulation.test.mjs','reference-simulation-negative-tests','javascript']
];
for(const [id,p,kind,format] of readinessArtifacts) if(!(index.artifacts||[]).some(a=>a.path===p)) index.artifacts.push({id,kindId:kind,path:p,format,required:true});
for (const artifact of readinessArtifacts) {
  const legacy = artifact[1].replace('openspec/changes/complete-bc-basic-reference-simulation', 'openspec/changes/deliver-production-ready-bc-basic-onboarding');
  replacePath(legacy, artifact[1]);
}
for (const artifact of index.artifacts||[]) if (String(artifact.path||'').startsWith('openspec/changes/complete-bc-basic-reference-simulation/')) artifact.path=artifact.path.replace('openspec/changes/complete-bc-basic-reference-simulation',archivedReferenceChangePath);
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
if(index.documentCatalog?.definitions){
  const readinessDocuments=[
    {artifactId:'UABC-SRC-BCB-ONBOARDING-RUNBOOK-001',documentId:'UABC-DOC-BCB-ONBOARDING-RUNBOOK-001',title:'BC Basic – Onboarding- und Delivery-Runbook',documentType:'consultant-runbook',parentId:null,phase:'all',process:'project-delivery',status:'ready',ownerRefs:['P-003'],jiraRefs:['UABC-32','UABC-50'],referenceIds:[],lastReviewed:'2026-07-14',visibility:'twin-visible',readiness:'verified',externalUrl:null,pageId:null,spaceKey:null},
    {artifactId:'UABC-SRC-BCB-ONBOARDING-INPUT-DOC-001',documentId:'UABC-DOC-BCB-ONBOARDING-INPUT-001',title:'BC Basic – Sanitisierte Onboarding-Eingabe',documentType:'blank-template',parentId:null,phase:'discovery',process:'customer-onboarding',status:'ready',ownerRefs:['P-003'],jiraRefs:['UABC-32','UABC-38'],referenceIds:[],lastReviewed:'2026-07-14',visibility:'twin-visible',readiness:'verified',externalUrl:null,pageId:null,spaceKey:null},
    {artifactId:'UABC-SRC-BCB-DELIVERY-EVIDENCE-TPL-001',documentId:'UABC-DOC-BCB-DELIVERY-EVIDENCE-TPL-001',title:'BC Basic – Blankopaket für Delivery und Evidence',documentType:'blank-template',parentId:null,phase:'all',process:'project-delivery',status:'ready',ownerRefs:['P-003'],jiraRefs:['UABC-32','UABC-46','UABC-47','UABC-50'],referenceIds:[],lastReviewed:'2026-07-14',visibility:'twin-visible',readiness:'verified',externalUrl:null,pageId:null,spaceKey:null}
  ];
  for(const definition of readinessDocuments) if(!index.documentCatalog.definitions.some(item=>item.documentId===definition.documentId)) index.documentCatalog.definitions.push(definition);
  index.documentCatalog.documentCount=index.documentCatalog.definitions.length;
}
const rewrite=(value)=>{if(Array.isArray(value)) return value.map(rewrite); if(value&&typeof value==='object'){for(const [key,item] of Object.entries(value)) value[key]=rewrite(item); return value;} if(typeof value==='string') return value.replaceAll('deliver-production-ready-bc-basic-onboarding','complete-bc-basic-reference-simulation'); return value;};
rewrite(index);
fs.writeFileSync(path,YAML.stringify(index)); console.log(`Branch-Index auf ${records.length} dynamische aktive Tickets aktualisiert.`);

import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { canonicalBundleDigest, sha256 } from './lib/twin-catalog-digest.mjs';

const root=process.cwd();
const base=path.join(root,'exports/project-data/v1/snapshots');
const releaseId='UABC-CUSTOMER-001-CATALOG-20260715-V3-FINAL';
const releaseDir=path.join(base,'releases',releaseId);
const staging=path.join(base,'releases',`.staging-${releaseId}`);
if(fs.existsSync(releaseDir))throw new Error(`Unveraenderliches V3-Final existiert bereits: ${releaseId}`);
fs.rmSync(staging,{recursive:true,force:true});fs.mkdirSync(staging,{recursive:true});
const sourceIndex=YAML.parse(fs.readFileSync(path.join(root,'exports/project-data/v1/index.yaml'),'utf8'));
const safe=value=>typeof value==='string'&&!path.isAbsolute(value)&&!value.includes('\\')&&value.split('/').every(part=>part&&part!=='.'&&part!=='..');
const internal=new Set(['docs/research/sources.yaml','evidence/simulation/adapter-provenance.json','evidence/simulation/reference-graph-coverage.json','evidence/verification-register.yaml','exports/project-data/v1/document-catalog.json','exports/project-data/v1/reference-graph-mapping.json','exports/project-data/v1/reference-simulation.json','governance/production-readiness.json','project/bc-basic/reference-simulation.yaml']);
const artifacts=(sourceIndex.artifacts??[]).filter(item=>safe(item.path)&&!internal.has(item.path)&&!/^(scripts|tests|openspec|governance\/schemas)\//.test(item.path)&&!/^exports\/project-data\/v1\/snapshots\//.test(item.path)&&!/^(package\.json|package-lock\.json|REVIEW\.md)$/.test(item.path));
const required=['project/bc-basic/pilot-v3.yaml','evidence/simulation/pilot-v3-finance-ledger.json','exports/project-data/v1/pilot-v3-view.json'];
for(const file of required)if(!artifacts.some(item=>item.path===file))throw new Error(`V3-Pflichtartefakt fehlt im Index: ${file}`);
const indexData={...sourceIndex,artifactCount:artifacts.length,artifacts,runtime:{...(sourceIndex.runtime??{}),requiresGit:false,readOnly:true,entryPoint:'exports/project-data/v1/snapshots/current.json'}};
const indexBytes=Buffer.from(YAML.stringify(indexData),'utf8');fs.writeFileSync(path.join(staging,'project-index.yaml'),indexBytes);
const records=[];
for(const artifact of artifacts){
 const source=path.join(root,artifact.path);if(!fs.existsSync(source)||!fs.statSync(source).isFile())throw new Error(`V3-Quellartefakt fehlt: ${artifact.path}`);
 const bytes=Buffer.from(fs.readFileSync(source).toString('utf8').replace(/\r\n/g,'\n'),'utf8');const payloadPath=`payload/${artifact.path}`;const target=path.join(staging,payloadPath);
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
 records.push({id:artifact.id,kind:artifact.kind??'fachartefakt',domainType:artifact.kind??'fachartefakt',sourcePath:artifact.path,payloadPath,sizeBytes:bytes.length,sha256:sha256(bytes),visibility:'nur-lesend',references:artifact.references??[]});
}
const domainTypes=['offer-scope','project-phase-gate','role-raci','meeting-training','ticket-lifecycle-comment-worklog','weekly-invoice','decision-risk-defect','space-page','use-case-bc-session','test-uat-retest','deliverable','evidence','hypercare-restart','handover','resource-catalog'];
const resourceCatalog={schemaVersion:2,catalogId:'UABC-RESOURCE-CATALOG-V3',customerId:'UABC-CUSTOMER-001',projectId:'UABC-BC-BASIC-001',readOnly:true,requiresGit:false,domainTypes,resources:records.map(record=>({resourceId:record.id,relativePath:record.payloadPath,type:record.kind,domainType:record.domainType,title:record.sourcePath,digest:record.sha256,sizeBytes:record.sizeBytes,references:record.references,visibility:record.visibility}))};
const resourceBytes=Buffer.from(`${JSON.stringify(resourceCatalog,null,2)}\n`,'utf8');fs.writeFileSync(path.join(staging,'resource-catalog.json'),resourceBytes);
const payloadBundleDigest=canonicalBundleDigest(records);
const manifest={schemaVersion:2,manifestContract:'uabc-customer-catalog-release-v1',releaseId,immutable:true,readOnly:true,customerId:'UABC-CUSTOMER-001',projects:sourceIndex.catalogModel.projects,supportEngagements:sourceIndex.catalogModel.supportEngagements,projectIndexPath:'project-index.yaml',resourceCatalogPath:'resource-catalog.json',projectIndex:{path:'project-index.yaml',sizeBytes:indexBytes.length,sha256:sha256(indexBytes)},resourceCatalog:{path:'resource-catalog.json',sizeBytes:resourceBytes.length,sha256:sha256(resourceBytes)},artifactCount:records.length,records,payloadBundleDigest,digestAlgorithm:'SHA-256',domainTypes,spectraBinding:{productId:'spectra',repositoryUrl:'https://github.com/sivla/BCProjectOS.git',releaseVersion:'1.0.0',releaseTag:'spectra-v1.0.0',bindingStatus:'BOUND'},producerCommitProvenance:null,runtime:{requiresGit:false,readOnly:true,currentPointer:'exports/project-data/v1/snapshots/current.json'}};
const manifestBytes=Buffer.from(`${JSON.stringify(manifest,null,2)}\n`,'utf8');fs.writeFileSync(path.join(staging,'manifest.json'),manifestBytes);
for(const record of records){const bytes=fs.readFileSync(path.join(staging,record.payloadPath));if(bytes.length!==record.sizeBytes||sha256(bytes)!==record.sha256)throw new Error(`V3-Stagingdigest driftet: ${record.id}`);}
if(canonicalBundleDigest(records)!==payloadBundleDigest)throw new Error('V3-Bundledigest driftet.');
fs.renameSync(staging,releaseDir);
const pointer={schemaVersion:1,pointerContract:'uabc-customer-catalog-current-v1',customerId:'UABC-CUSTOMER-001',currentReleaseId:releaseId,releasePath:`exports/project-data/v1/snapshots/releases/${releaseId}`,manifestPath:`exports/project-data/v1/snapshots/releases/${releaseId}/manifest.json`,manifestSha256:sha256(manifestBytes),payloadBundleDigest,artifactCount:records.length,readOnly:true,requiresGit:false,bindingStatus:'BOUND_BCPROJECTOS_RELEASE',updatedAt:'2026-07-15T12:00:00+02:00'};
const pointerBytes=`${JSON.stringify(pointer,null,2)}\n`;const candidate=path.join(base,'current-v3.candidate.json');const candidateTmp=`${candidate}.tmp`;const current=path.join(base,'current.json');const currentTmp=`${current}.tmp`;
fs.writeFileSync(candidateTmp,pointerBytes,'utf8');fs.renameSync(candidateTmp,candidate);fs.writeFileSync(currentTmp,pointerBytes,'utf8');fs.renameSync(currentTmp,current);
console.log(`V3-Katalog atomar aktiviert: ${releaseId}; ${records.length} Records; Manifest ${pointer.manifestSha256}; Bundle ${payloadBundleDigest}.`);

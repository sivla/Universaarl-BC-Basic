import fs from 'node:fs';
import YAML from 'yaml';

const EXPECTED_PACKAGES=[
 ['UABC-01-CORE-FINANCE','Kern und Finanzwesen',1],
 ['UABC-02-TRADE-MASTER','Handel und Stammdaten',2],
 ['UABC-03-OPENING-DATA','Eroeffnungs- und offene Daten',3]
];
const LEDGER=/^(?:G\/L Entry|Customer Ledger Entry|Vendor Ledger Entry|VAT Entry|Item Ledger Entry|Value Entry|Bank Account Ledger Entry)$/;
const REQUIRED_SOURCES=['SRC-BC-085','SRC-BC-086','SRC-BC-087','SRC-BC-088'];

export function validatePilotSetup({evidence,baseline,sources,sourceRegister,story,exists=(path)=>fs.existsSync(path)}){
 const errors=[];const fail=(code,detail)=>errors.push(`${code}: ${detail}`);
 if(evidence?.environment?.name!=='Playthru'||evidence?.environment?.environmentType!=='Sandbox'||evidence?.environment?.clientVersion!=='DE Business Central 28.2'||evidence?.environment?.platformVersion!=='28.0.52048.0'||evidence?.environment?.applicationVersion!=='28.2.50931.52241'||evidence?.environment?.alRuntimeVersion!=='17.0')fail('VERSION-ODER-UMGEBUNG','Playthru und exakte BC-/AL-Versionen erforderlich');
 const creation=evidence?.companyCreation??{};if(creation.companyId!=='UABC-BASIC-DE'||creation.displayName!=='Universaarl GmbH'||creation.wizardAction!=='Neu erstellen - Keine Daten'||creation.status!=='Completed'||creation.assignedUserCount!==1||creation.assignedUsers?.[0]!=='Kajetan Kalicki'||creation.copied!==false||creation.legacyCompaniesChanged!==false||creation.deletedCompanies?.length)fail('MANDANTEN-BASELINE','Gesellschaftserstellung oder Altmandantengrenze weicht ab');
 if(evidence?.actorTruth?.operationActorType!=='codex-spectra'||evidence?.actorTruth?.operationActorRef!=='ACTOR-CODEX-SPECTRA'||evidence?.actorTruth?.operationRole!=='Codex-/Browserautomation'||evidence?.actorTruth?.reviewedByActorRef!=='P-PILOT-LEAD-001'||evidence?.actorTruth?.humanAutomationClaimed!==false)fail('AKTEURVERWECHSLUNG','Codex-/Browserautomation und menschliches Review muessen getrennt sein');
 const packages=evidence?.configurationPackageSkeletons??[];if(packages.length!==3)fail('PAKET-ANZAHL','exakt drei Paketgerueste erforderlich');
 for(const [code,name,sequence] of EXPECTED_PACKAGES){const item=packages.find(p=>p.code===code);if(!item||item.name!==name||item.sequence!==sequence||item.languageId!==0||item.productVersion!==''||item.tables!==0||item.records!==0||item.errors!==0||item.status!=='skeleton-created')fail('PAKET-DEFINITION',code);if(item&&(item.setupEffectClaimed!==false||item.dataEffectClaimed!==false))fail('LEERES-PAKET-MIT-WIRKUNG',code);}
 const values=baseline?.companyInformation?.targetValues??{},observed=baseline?.companyInformation?.observedValues??{},seed=baseline?.companyInformation?.countryRegionSeed??{};
 if(values.name!=='Universaarl GmbH'||values.address!=='Simulationsstraße 1'||values.postCode!=='66123'||values.city!=='Saarbrücken'||values.countryRegionCode!=='DE'||values.language!=='de-DE'||values.localCurrencyCode!=='EUR'||values.fiscalYearStart!=='2026-01-01'||values.contact!=='Projektteam BC Basic (synthetisch)'||values.email!=='bc-basic@example.invalid'||values.homePage!=='https://universaarl.example.invalid')fail('FIRMENSTAMMDATEN','synthetische Zielwerte sind unvollstaendig');
 if(observed.countryRegionCode==='DE'&&seed.status!=='validated')fail('DE-OHNE-COUNTRY-SEED','DE darf erst nach validiertem Seed als beobachtet gelten');
 if(observed.countryRegionCode!==null||seed.status!=='missing'||evidence?.defects?.[0]?.status!=='open'||evidence?.defects?.[0]?.setupClaimed!==false)fail('COUNTRY-DEFECT','offener DE-Seed-Defect muss ehrlich erhalten bleiben');
 const identifiers=['vatRegistrationNo','eori','gln','bankName','bankBranchNo','iban','swift','phoneNo'];if(baseline?.companyInformation?.identifierPolicy?.validationStatus!=='validated'&&identifiers.some(key=>values[key]!==''))fail('UNVALIDIERTE-STEUER-BANK-ID','Steuer-/Bank-/Telefonwerte muessen leer bleiben');
 const paymentKeys=['bankName','bankBranchNo','iban','swift'];if(values.allowEmptyPaymentInformation!==true&&paymentKeys.some(key=>!values[key]))fail('LEERE-ZAHLUNGSINFORMATION','leere Zahlungsinformationen brauchen explizite Erlaubnis');
 const waves=baseline?.packageWaves??[];if(waves.map(w=>w.waveId).join('|')!==EXPECTED_PACKAGES.map(x=>x[0]).join('|')||waves.map(w=>w.sequence).join('|')!=='1|2|3')fail('PAKETREIHENFOLGE','CORE-FINANCE, TRADE-MASTER, OPENING-DATA erforderlich');
 for(const wave of waves){if(wave.state!=='skeleton-only'||!/0 Tabellen/.test(wave.validation??''))fail('PAKETWIRKUNG-UNZULAESSIG',wave.waveId);for(const table of wave.tablesIncluded??[])if(LEDGER.test(table))fail('LEDGER-TABELLE-IM-PAKET',`${wave.waveId}/${table}`);}
 if((baseline?.dependencyMatrix??[]).map(x=>x.sequence).join('|')!=='1|2|3|4|5'||baseline?.executionGate?.state!=='authorized-scope-awaiting-table-review'||baseline?.executionGate?.requires?.length!==6||baseline?.executionGate?.liveTablesAdded!==0||baseline?.executionGate?.liveSetupClaimed!==false||baseline?.executionGate?.liveBusinessDataClaimed!==false)fail('ABHAENGIGKEIT-ODER-LIVE-CLAIM','autorisierter Scope, Vorpruefungen, Reihenfolge und Nullwirkung muessen fail-closed sein');
 const pilotTask=story?.tickets?.find(ticket=>ticket.id==='UABC-39');const provenance=pilotTask?.comments?.find(comment=>comment.id==='COM-UABC-39-PILOT-PROVENIENZ');
 if(!provenance||provenance.time!=='2026-07-13'||provenance.evidenceRef!=='evidence/playthru-uabc-basic-de/setup-baseline.yaml'||!/neuer separater Lauf/.test(provenance.text)||!/aendert weder den synthetischen Abschluss noch den Worklog/.test(provenance.text)||!/belegt noch keine Einrichtung/.test(provenance.text))fail('PILOT-PROVENIENZ','separater Lauf, unveraenderter Altabschluss und fehlender Einrichtungsnachweis muessen belegt sein');
 const sourceIds=new Set((sources?.sources??[]).map(s=>s.id));for(const id of REQUIRED_SOURCES)if(!sourceIds.has(id)||!sourceRegister?.includes(id))fail('QUELLE-FEHLT',id);
 if(!baseline?.evidencePath||!exists(baseline.evidencePath))fail('EVIDENCE-FEHLT',baseline?.evidencePath??'leer');
 const secretText=JSON.stringify({evidence,baseline});if(/authorization|apiToken|accessToken|password|sessionId|telemetryId/i.test(secretText))fail('SECRET-ODER-SESSION','verbotenes Auth-/Sessionfeld');
 return errors;
}

if(process.argv[1]?.endsWith('validate-pilot-setup-baseline.mjs')){
 const readYaml=path=>YAML.parse(fs.readFileSync(path,'utf8'));
 const data={evidence:readYaml('evidence/playthru-uabc-basic-de/setup-baseline.yaml'),baseline:readYaml('project/bc-basic/pilot-setup-baseline.yaml'),sources:readYaml('docs/research/sources.yaml'),sourceRegister:fs.readFileSync('docs/research/source-register.md','utf8'),story:JSON.parse(fs.readFileSync('evidence/simulation/project-story.json','utf8'))};
 const errors=validatePilotSetup(data);if(errors.length){console.error(`Pilot-Setup-Baseline fehlgeschlagen (${errors.length}):`);errors.forEach(e=>console.error(`- ${e}`));process.exit(1);}console.log('Pilot-Setup-Baseline bestanden: Playthru/UABC-BASIC-DE, BC 28.2, drei leere Paketgerueste, Country/Region-Defect offen, keine weitere Live-Wirkung.');
}

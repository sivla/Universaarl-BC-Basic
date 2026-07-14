import fs from 'node:fs';
import process from 'node:process';

export const PRODUCTIVE_TICKET_CONTRACT_FILES = Object.freeze([
  'package.json',
  'scripts/adapt-spectra-portable-story.mjs',
  'scripts/enrich-jira-story-realism.mjs',
  'scripts/generate-setup-wave-1-export.mjs',
  'scripts/generate-spectra-0.10-integration.mjs',
  'scripts/generate-uabc-ticket-export.mjs',
  'scripts/migrate-uabc-ticket-story.mjs',
  'scripts/update-uabc-conformance.mjs',
  'scripts/validate-bc-playthrough.mjs',
  'scripts/validate-jira-story-realism.mjs',
  'scripts/validate-project-story.mjs',
  'scripts/validate-simulation-evidence.mjs',
  'scripts/validate-spectra-0.10-integration.mjs'
]);
export const CURRENT_PROJECT_TRUTH_FILES = Object.freeze([
  'evidence/verification-register.yaml',
  'docs/offers/bc-basic-offer.md',
  'docs/reports/bc-basic-project-chronicle.md',
  'docs/handover/bc-basic-handover.md',
  'docs/runbooks/business-central-basic.md',
  'atlassian/confluence/pages/00-project.md',
  'atlassian/confluence/pages/50-tests.md',
  'atlassian/confluence/pages/61-walkthrough-pilot.md',
  'atlassian/confluence/pages/71-bc-basic-discovery.md',
  'atlassian/confluence/pages/74-bc-basic-deliverables.md',
  'atlassian/confluence/pages/80-bc-basic-training.md',
  'atlassian/confluence/pages/bc-basic-project-story.md',
  'atlassian/confluence/pages/bc-basic-hypercare.md',
  'project/bc-basic/project-plan.yaml',
  'project/bc-basic/decision-register.yaml',
  'project/bc-basic/data-readiness-check.yaml',
  'project/bc-basic/deliverables.yaml',
  'project/bc-basic/result-object-catalog.yaml',
  'project/bc-basic/uat-catalog.yaml',
  'project/bc-basic/training-plan.yaml',
  'project/bc-basic/data-package.yaml',
  'project/bc-basic/traceability-matrix.yaml'
]);
export const HISTORICAL_PROJECT_FILES = Object.freeze([
  'atlassian/jira/issues/bc-basic-project.yaml',
  'project/bc-basic/bc-playthrough-catalog.yaml',
  'project/bc-basic/uat-training-run.yaml',
  'project/bc-basic/phase-2-readiness-gate.yaml',
  'evidence/simulation/phase-2-p2p-o2c.yaml',
  'evidence/simulation/phase-3-cash-inventory-close.yaml',
  'evidence/simulation/end-to-end-objective-audit.yaml',
  'evidence/simulation/billing-reconciliation.yaml',
  'evidence/simulation/bc-playthrough-ledger.yaml',
  'evidence/simulation/phase-gate-register.yaml',
  'evidence/simulation/project-completion.yaml',
  'evidence/simulation/demo-readiness.yaml',
  'atlassian/confluence/meetings/index.yaml',
  'atlassian/confluence/meetings/UABC-MTG-001.md',
  'atlassian/confluence/meetings/UABC-MTG-002.md',
  'atlassian/confluence/meetings/UABC-MTG-003.md',
  'docs/runbooks/bc-basic-simulation-demo.md'
]);

const FIXED_CONTRACT_FORBIDDEN = Object.freeze([
  { id:'fixed-ticket-count', pattern:/tickets(?:\?\.)?\.length\s*!==?\s*(?:45)\b/i },
  { id:'fixed-type-count', pattern:/\.filter\([^\n]+type[^\n]+\)\.length\s*!==?\s*(?:10|18|19)\b/i },
  { id:'fixed-active-count-field', pattern:/(?:activeTicketCount|recordCount|customerStoryCount|tickets|tasks|stories|epics)\s*:\s*(?:10|18|19|45|50)\b/i },
  { id:'fixed-id-range', pattern:/UABC-1\.\.UABC-50/i },
  { id:'fixed-output-claim', pattern:/(?:19 Task-Worklogs|80h\/9\.600 EUR|50 aktive Tickets)/i }
]);
const CURRENT_TRUTH_FORBIDDEN = Object.freeze([
  { id:'active-historical-count-claim', pattern:/(?:17 Records|17 Eintr(?:ä|ae)ge|19 Task-Worklogs)/i },
  { id:'active-ist-close-claim', pattern:/(?:synthetisch(?:er|e|es)?\s+Ist-(?:Abschluss|Abgleich)|Angebot und (?:synthetisches\s+)?Ist[^.\n]*(?:geschlossen|stimmen))/i },
  { id:'active-completion-claim', pattern:/(?:V1_STANDARDPRODUCT_READY|GO_SIMULATION[^.\n]*(?:bestanden|entschied)|(?:Referenzsimulation|Simulation|Hypercare)\s+(?:ist|wurde)\s+(?:als\s+)?(?:vollst(?:ä|ae)ndig\s+|synthetisch\s+)?abgeschlossen)/i }
]);
const SOURCE_ENCODING_FORBIDDEN = /\u00c3|\u00e2|\ufffd/u;

export function findForbiddenActiveContracts(entries) {
  const findings = [];
  for (const [file, text] of entries) {
    for (const rule of FIXED_CONTRACT_FORBIDDEN) if (rule.pattern.test(text)) findings.push(`${rule.id}: ${file}`);
    if (file !== 'evidence/verification-register.yaml') for (const rule of CURRENT_TRUTH_FORBIDDEN) if (rule.pattern.test(text)) findings.push(`${rule.id}: ${file}`);
    if (SOURCE_ENCODING_FORBIDDEN.test(text)) findings.push(`mojibake: ${file}`);
  }
  return findings;
}

export function validateReachability(packageJson, fileEntries, historicalEntries = []) {
  const findings = [];
  for (const [file,text] of fileEntries) {
    if (file !== 'evidence/verification-register.yaml') for (const rule of FIXED_CONTRACT_FORBIDDEN) if(rule.pattern.test(text)) findings.push(`${rule.id}: ${file}`);
    if (SOURCE_ENCODING_FORBIDDEN.test(text)) findings.push(`mojibake: ${file}`);
  }
  for (const [file,text] of fileEntries.filter(([file])=>CURRENT_PROJECT_TRUTH_FILES.includes(file) && file !== 'evidence/verification-register.yaml')) for (const rule of CURRENT_TRUTH_FORBIDDEN) if(rule.pattern.test(text)) findings.push(`${rule.id}: ${file}`);
  const fullTest = packageJson?.scripts?.test ?? '';
  for (const required of ['validate:project-story','validate:jira-story-realism','validate:active-ticket-contract','validate:simulation','validate:simulation:historical','validate:bc-playthrough','validate:bc-playthrough:historical','test:current-historical-truth','validate:spectra010','test:project-story','test:jira-story-realism','test:spectra010']) if (!fullTest.includes(required)) findings.push(`npm-test-fehlt: ${required}`);
  if (packageJson?.scripts?.['validate:spectra-conformance'] !== 'node scripts/validate-spectra-0.10-integration.mjs') findings.push('spectra-conformance-ist-nicht-aktuell');
  const migration = new Map(fileEntries).get('scripts/migrate-uabc-ticket-story.mjs') ?? '';
  if (!migration.includes('activeExecutionAllowed: false') || !migration.includes('assertMigrationLocked')) findings.push('historische-migration-ist-nicht-gesperrt');
  for (const [file, text] of historicalEntries) {
    if (!/classification:\s*historical-reference-simulation/i.test(text) || !/currentAuthority:\s*false/i.test(text) || !/supersededBy:\s*(?:evidence\/simulation\/(?:project-story\.json|project-reconciliation\.json)|evidence\/playthru-uabc-basic-de\/setup-wave-1-control-center-run-plan\.yaml)/i.test(text)) findings.push(`historische-datei-nicht-abgeloest: ${file}`);
  }
  return findings;
}

if (process.argv[1]?.endsWith('validate-active-ticket-contract-source.mjs')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const entries = [...PRODUCTIVE_TICKET_CONTRACT_FILES, ...CURRENT_PROJECT_TRUTH_FILES].map((file) => [file, fs.readFileSync(file, 'utf8')]);
  const historicalEntries = HISTORICAL_PROJECT_FILES.map((file) => [file, fs.readFileSync(file, 'utf8')]);
  const findings = validateReachability(packageJson, entries, historicalEntries);
  if (findings.length) { console.error(`Aktiver Ticketvertrag enthält verbotene Festannahmen (${findings.length}):`); findings.forEach((finding) => console.error(`- ${finding}`)); process.exit(1); }
  console.log(`Aktiver Ticketvertrag geprüft: ${entries.length} produktive und current-facing Flächen, ${historicalEntries.length} abgelöste Historienquelle, dynamische Ticket-/Istbindung und vollständige npm-Erreichbarkeit.`);
}

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { validateConsumerBindings } from '../../scripts/lib/validate-consumer-bindings.mjs';
import { buildSnapshotManifest, hasSingleParent, parseGitTreeEntry, validateManifestDigests, validateSnapshotManifest } from '../../scripts/lib/snapshot-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function exists(relativePath) {
  try {
    await fs.access(path.join(root, ...relativePath.split('/')));
    return true;
  } catch {
    return false;
  }
}

async function yaml(relativePath) {
  return YAML.parse(await fs.readFile(path.join(root, ...relativePath.split('/')), 'utf8'));
}

async function csv(relativePath) {
  const content = await fs.readFile(path.join(root, ...relativePath.split('/')), 'utf8');
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split(';');
  const rows = lines.slice(1).map((line, index) => {
    const values = line.split(';');
    assert.equal(values.length, headers.length, `${relativePath}: Zeile ${index + 2} hat eine abweichende Spaltenzahl`);
    return Object.fromEntries(headers.map((header, column) => [header, values[column]]));
  });
  return { headers, rows };
}

const [plan, billing, issueDocument, deliverableRegister, dataPackage, dataReadiness, uatCatalog, trainingPlan, meetingIndex, projectIndex, consumerBindings, scenarioCatalog, verificationRegister] = await Promise.all([
  yaml('project/bc-basic/project-plan.yaml'),
  yaml('project/bc-basic/billing.yaml'),
  yaml('atlassian/jira/issues/bc-basic-project.yaml'),
  yaml('project/bc-basic/deliverables.yaml'),
  yaml('project/bc-basic/data-package.yaml'),
  yaml('project/bc-basic/data-readiness-check.yaml'),
  yaml('project/bc-basic/uat-catalog.yaml'),
  yaml('project/bc-basic/training-plan.yaml'),
  yaml('atlassian/confluence/meetings/index.yaml'),
  yaml('exports/project-data/v1/index.yaml'),
  yaml('governance/consumer-bindings.yaml'),
  yaml('playwright/scenarios/bc-basic-e2e.yaml'),
  yaml('evidence/verification-register.yaml')
]);

const issues = issueDocument.issues ?? [];
const issueByKey = new Map(issues.map((issue) => [issue.key, issue]));
const deliverables = deliverableRegister.deliverables ?? [];
const deliverableById = new Map(deliverables.map((deliverable) => [deliverable.id, deliverable]));
const meetings = meetingIndex.meetings ?? [];
const meetingById = new Map(meetings.map((meeting) => [meeting.id, meeting]));
const verificationById = new Map((verificationRegister.verifications ?? []).map((verification) => [verification.id, verification]));
const taskPlanText = await fs.readFile(path.join(root, 'openspec', 'changes', 'deliver-bc-basic-customer-project', 'tasks.md'), 'utf8');
const [changeConfig, decisionRegister] = await Promise.all([
  yaml('openspec/changes/deliver-bc-basic-customer-project/.openspec.yaml'),
  yaml('project/bc-basic/decision-register.yaml')
]);

test('BC-Basic bindet genau eine synthetische Gesellschaft in playthru', () => {
  assert.equal(plan.projectId, 'UABC-BC-BASIC-001');
  assert.equal(plan.simulation, true);
  assert.equal(plan.environment, 'playthru');
  assert.equal(plan.company?.count, 1);
  assert.equal(plan.company?.id, 'UABC-BASIC-DE');
  assert.equal(plan.company?.dataClassification, 'synthetic-only');
  assert.equal(scenarioCatalog.target?.environment, 'playthru');
  assert.equal(scenarioCatalog.target?.companyRef, 'UABC-BASIC-DE');
  assert.equal(scenarioCatalog.target?.companyCount, 1);
  assert.equal(dataPackage.companyRef, 'UABC-BASIC-DE');
  assert.equal(scenarioCatalog.status, 'planned');
  assert.equal(scenarioCatalog.executed, false);
});

test('Drei Phasen ergeben 68 Planstunden mit genau einer Einrichtungswoche und begrenzter Hypercare', () => {
  assert.equal(plan.phases?.length, 3);
  assert.deepEqual(plan.phases.map((phase) => phase.plannedBillableHours), [18, 40, 10]);
  assert.equal(plan.phases.reduce((sum, phase) => sum + phase.plannedBillableHours, 0), 68);
  assert.equal(plan.phases[1].startDate, '2026-08-24');
  assert.equal(plan.phases[1].endDate, '2026-08-28');
  assert.match(plan.phases[0].name, /Vorbereitung/);
  assert.match(plan.phases[2].name, /Hypercare/);
  assert.equal(plan.phases[2].plannedBillableHours <= 10, true);
});

test('OpenSpec-Aufgaben und Jira-Arbeitspakete stimmen bei Schluessel und Stunden ueberein', () => {
  const taskEntries = [...taskPlanText.matchAll(/\(`(UABC-\d+)`, (\d+) h\)/g)].map((match) => ({ key: match[1], hours: Number(match[2]) }));
  assert.deepEqual(taskEntries.map((entry) => entry.key), Array.from({ length: 17 }, (_, index) => `UABC-${index + 22}`));
  assert.equal(taskEntries.reduce((sum, entry) => sum + entry.hours, 0), 68);
  for (const entry of taskEntries) assert.equal(issueByKey.get(entry.key)?.plannedBillableHours, entry.hours, `${entry.key}: OpenSpec- und Jira-Stunden weichen ab`);
  assert.match(taskPlanText, /Kontrollhandlungen erzeugen keine zusaetzlichen abrechenbaren Stunden/);
  assert.match(taskPlanText, /Innerhalb von `UABC-38` den Projektindex/);
});

test('Kanonisches Liefermodell bleibt bei Einrichtung Hypercare und Monatsabschlussprobe', () => {
  const deliveryModel = changeConfig.proposedCanonicalUpdate?.facts?.deliveryModel?.value ?? '';
  assert.match(deliveryModel, /BC Basic Einrichtung/);
  assert.match(deliveryModel, /Hypercare/);
  assert.match(deliveryModel, /Monatsabschlussprobe in der Sandbox/);
  assert.match(deliveryModel, /ohne Uebermittlung/);
  assert.doesNotMatch(deliveryModel, /ersten Monatsabschluss/i);
});

test('Planstunden und Jira-Abrechnung verhindern Eltern Doppelabrechnung und erfundene Budgetlimits', () => {
  assert.equal(billing.plannedBillableHours, 68);
  assert.equal(billing.contingencyHours, 0);
  assert.equal(billing.maximumBillableHours, null);
  assert.equal(billing.netDailyRate, 1300);
  assert.equal(billing.workdayHours, 8);
  assert.equal(billing.netHourlyRate, 162.5);
  assert.equal(billing.plannedNetAmount, 11050);
  assert.equal(billing.budgetLimitStatus, 'unknown');
  assert.equal(billing.budgetLimitNetAmount, null);
  assert.deepEqual(billing.worklogs, []);
  assert.deepEqual(billing.invoices, []);
  assert.equal(billing.rollupRule?.noDoubleBilling?.includes('niemals gemeinsam'), true);
  assert.deepEqual(billing.worklogContract?.required, [
    'worklogId',
    'jiraKey',
    'personRef',
    'workDate',
    'isoWeek',
    'hours',
    'billable',
    'approvalStatus',
    'approverRef',
    'invoiceRef'
  ]);

  const leafIssues = issues.filter((issue) => issue.billable === true);
  assert.deepEqual(leafIssues.map((issue) => issue.key), Array.from({ length: 17 }, (_, index) => `UABC-${index + 22}`));
  assert.equal(leafIssues.reduce((sum, issue) => sum + issue.plannedBillableHours, 0), 68);
  assert.ok(leafIssues.every((issue) => issue.worklogEligible === true));
  for (const key of ['UABC-18', 'UABC-19', 'UABC-20', 'UABC-21']) {
    assert.equal(issueByKey.get(key)?.billable, false, `${key} darf als Elternsumme nicht abrechenbar sein`);
    assert.equal(issueByKey.get(key)?.worklogEligible, false, `${key} darf kein eigenes abrechenbares Arbeitsprotokoll erhalten`);
  }
});

test('Jedes Jira-Ticket nennt Lieferergebnis und synthetischen Transkriptbezug', async () => {
  assert.deepEqual(issues.map((issue) => issue.key), Array.from({ length: 21 }, (_, index) => `UABC-${index + 18}`));
  assert.equal(new Set(issues.map((issue) => issue.key)).size, 21);
  for (const issue of issues) {
    assert.equal(issue.status, 'Backlog', `${issue.key} muss als noch nicht ausgefuehrt im Backlog bleiben`);
    assert.deepEqual(issue.history, [], `${issue.key} darf keine erfundene Historie besitzen`);
    assert.ok(issue.deliverableIds?.length > 0, `${issue.key} benoetigt mindestens ein Lieferergebnis`);
    assert.ok(issue.transcriptRefs?.length > 0, `${issue.key} benoetigt mindestens einen Transkriptbezug`);
    assert.ok(issue.deliverableIds.every((id) => deliverableById.has(id)), `${issue.key} verweist auf unbekanntes Lieferergebnis`);
    assert.ok(issue.transcriptRefs.every((id) => meetingById.has(id)), `${issue.key} verweist auf unbekanntes Transkript`);
  }
  assert.equal(meetings.length, 1);
  assert.equal(meetings[0].evidenceClaimed, false);
  assert.equal(await exists(meetings[0].transcriptPath), true);
});

test('Lieferregister verweist nur auf vorhandene geplante Quellartefakte', async () => {
  assert.equal(deliverables.length, 9);
  assert.equal(deliverableById.size, 9);
  for (const deliverable of deliverables) {
    assert.ok(['planned', 'simulated-complete'].includes(deliverable.status));
    assert.equal(deliverable.resultClaimed, false);
    if (deliverable.status === 'planned') assert.equal(deliverable.completionEvidence, null);
    else assert.ok(['evidence/simulation/phase-2-p2p-o2c.yaml', 'evidence/simulation/project-completion.yaml'].includes(deliverable.completionEvidence));
    assert.ok(deliverable.requiredSourcePaths?.length > 0, `${deliverable.id} benoetigt Quellpfade`);
    for (const sourcePath of deliverable.requiredSourcePaths) {
      assert.equal(await exists(sourcePath), true, `${deliverable.id}: Quellpfad fehlt: ${sourcePath}`);
    }
  }
});

test('Acht getrennte Datenvorlagenpaare sind parsebar und fachlich abgestimmt', async () => {
  assert.equal(dataPackage.status, 'template');
  assert.equal(dataPackage.classification, 'synthetic-only');
  assert.equal(dataPackage.providerOwnerRef, 'P-002');
  assert.equal(dataPackage.configurationPackages?.length, 3);
  for (const pkg of dataPackage.configurationPackages) {
    assert.match(pkg.namePattern ?? '', /^BCB-[A-Z]+-v001$/);
    assert.ok(pkg.candidateTables?.length > 0, `${pkg.id}: Kandidatentabellen fehlen`);
    assert.ok(pkg.requiredFieldRule?.length > 0, `${pkg.id}: Pflichtfeldregel fehlt`);
    assert.ok(pkg.excludedFieldRule?.length > 0, `${pkg.id}: Ausschlussregel fehlt`);
    assert.ok(pkg.importOrder?.length > 0, `${pkg.id}: Importreihenfolge fehlt`);
  }
  assert.ok(dataPackage.validationAndRecovery?.manualSteps?.some((step) => step.includes('manuelle Ausnahme')));
  assert.match(dataPackage.configurationPackageCustomerRule ?? '', /Werkzeug des Dienstleisters/);
  assert.match(dataPackage.configurationPackageCustomerRule ?? '', /weder pflegen noch bedienen/);
  assert.equal(dataPackage.templates?.length, 8);
  const examples = new Map();
  for (const template of dataPackage.templates) {
    assert.ok(template.objectId?.length > 0, `${template.id}: Objektkennung fehlt`);
    assert.ok(template.purpose?.length > 0, `${template.id}: Zweck fehlt`);
    assert.ok(template.format?.length > 0, `${template.id}: Format fehlt`);
    assert.ok(template.ownerRef?.length > 0, `${template.id}: Eigentuemer fehlt`);
    assert.equal(template.approvalStatus, 'open', `${template.id}: Freigabestatus muss offen sein`);
    assert.ok(template.required?.length > 0, `${template.id}: Pflichtfelder fehlen`);
    assert.ok(template.qualityRules?.length > 0, `${template.id}: Qualitaetsregeln fehlen`);
    assert.ok(template.blankTemplatePath?.length > 0, `${template.id}: Blankopfad fehlt`);
    assert.ok(template.exampleTemplatePath?.length > 0, `${template.id}: Beispielpfad fehlt`);
    assert.notEqual(template.blankTemplatePath, template.exampleTemplatePath);
    assert.equal(await exists(template.blankTemplatePath), true, `${template.id}: Blankovorlage fehlt`);
    assert.equal(await exists(template.exampleTemplatePath), true, `${template.id}: Beispielvorlage fehlt`);
    if (template.blankTemplatePath.endsWith('.yaml')) {
      const blank = await yaml(template.blankTemplatePath);
      const example = await yaml(template.exampleTemplatePath);
      assert.equal(blank.templateKind, 'blank');
      assert.deepEqual(blank.values, {}, `${template.id}: Blankovorlage darf keine Projektdaten enthalten`);
      const fieldDefinitions = Array.isArray(blank.fields) ? blank.fields : Object.values(blank.fields ?? {});
      assert.ok(fieldDefinitions.every((field) => field.description && field.allowedValues !== undefined), `${template.id}: Feldbeschreibung oder Wertregel fehlt`);
      assert.equal(example.templateKind, 'example');
      assert.equal(example.values?.synthetic, true);
      examples.set(template.objectId, [example.values]);
    } else {
      const blank = await csv(template.blankTemplatePath);
      const example = await csv(template.exampleTemplatePath);
      assert.equal(blank.rows.length, 0, `${template.id}: CSV-Blanko darf keine Datenzeilen enthalten`);
      assert.deepEqual(blank.headers, example.headers, `${template.id}: Blanko- und Beispielheader muessen identisch sein`);
      assert.ok(example.rows.length > 0, `${template.id}: Beispieldatei ist leer`);
      assert.ok(example.rows.every((row) => row.synthetic === 'true'), `${template.id}: Beispieldaten muessen synthetisch sein`);
      examples.set(template.objectId, example.rows);
    }
  }

  const company = examples.get('company-setup')[0];
  const dimensions = examples.get('dimensions');
  const customer = examples.get('customers')[0];
  const vendor = examples.get('vendors')[0];
  const item = examples.get('items')[0];
  const inventory = examples.get('inventory-opening')[0];
  const glOpening = examples.get('gl-opening');
  const openEntries = examples.get('open-customer-vendor-entries');
  const companyBlank = await yaml(dataPackage.templates.find((template) => template.objectId === 'company-setup').blankTemplatePath);
  const companyFieldNames = Array.isArray(companyBlank.fields) ? companyBlank.fields.map((field) => field.name) : Object.keys(companyBlank.fields ?? {});
  assert.deepEqual(Object.keys(company).sort(), companyFieldNames.sort(), 'Company-Beispielwerte muessen exakt durch Blanko-Felder definiert sein');
  assert.equal(company.chartOfAccountsTemplate, 'SKR04');
  assert.equal(company.postingGroupsApprovalStatus, 'pending');
  assert.equal(company.taxSetupApprovalStatus, 'pending');
  const dimensionValues = new Set(dimensions.map((entry) => `${entry.dimensionCode}:${entry.valueCode}`));

  assert.equal(company.companyId, 'UABC-BASIC-DE');
  assert.equal(company.locationCode, 'HAUPT');
  assert.equal(customer.customerNo, 'K-10000');
  assert.equal(vendor.vendorNo, 'L-70000');
  assert.equal(item.itemNo, 'A-1000');
  assert.equal(Number(item.unitCost), 42);
  assert.equal(Number(item.unitPrice), 79);
  assert.equal(item.taxDecisionStatus, 'offen');
  assert.equal(inventory.itemNo, item.itemNo);
  assert.equal(inventory.locationCode, company.locationCode);
  assert.equal(Number(inventory.quantity) * Number(inventory.unitCost), Number(inventory.lineAmount));
  for (const entry of [customer, vendor, item, inventory, ...openEntries]) {
    const costCenter = entry.defaultCostCenter ?? entry.costCenter;
    const business = entry.defaultBusiness ?? entry.business;
    assert.ok(dimensionValues.has(`KOSTENSTELLE:${costCenter}`), `Unbekannte Kostenstelle ${costCenter}`);
    assert.ok(dimensionValues.has(`GESCHAEFT:${business}`), `Unbekannter Geschaeftsbereich ${business}`);
  }
  assert.equal(openEntries.find((entry) => entry.accountType === 'customer')?.accountNo, customer.customerNo);
  assert.equal(openEntries.find((entry) => entry.accountType === 'vendor')?.accountNo, vendor.vendorNo);
  assert.ok(openEntries.every((entry) => entry.documentNo.startsWith('SYN-')));
  assert.equal(Math.round(glOpening.reduce((sum, entry) => sum + Number(entry.debitAmount), 0) * 100), Math.round(glOpening.reduce((sum, entry) => sum + Number(entry.creditAmount), 0) * 100));
  assert.equal(glOpening.find((entry) => entry.accountRole === 'DEBITOREN-SAMMEL')?.debitAmount, openEntries.find((entry) => entry.accountType === 'customer')?.amount);
  assert.equal(glOpening.find((entry) => entry.accountRole === 'KREDITOREN-SAMMEL')?.creditAmount, openEntries.find((entry) => entry.accountType === 'vendor')?.amount);
  assert.equal(glOpening.find((entry) => entry.accountRole === 'BESTAND-HANDEL')?.debitAmount, inventory.lineAmount);
  assert.ok(glOpening.every((entry) => entry.accountNoCandidate === '' && entry.approvalStatus === 'pending'), 'SKR04-Konten duerfen im Beispiel nicht als final freigegeben erscheinen');
});

test('Datenbereitschaft bleibt geplant und blockiert unvollstaendige oder ungepruefte Daten', () => {
  assert.equal(dataReadiness.status, 'planned');
  assert.equal(dataReadiness.executed, false);
  assert.equal(dataReadiness.resultClaimed, false);
  assert.equal(dataReadiness.templatePairs?.length, 8);
  assert.deepEqual(dataReadiness.templatePairs.map((pair) => pair.templateId), dataPackage.templates.map((template) => template.id));
  for (const pair of dataReadiness.templatePairs) {
    const template = dataPackage.templates.find((entry) => entry.id === pair.templateId);
    assert.equal(pair.objectId, template.objectId);
    assert.equal(pair.blankPath, template.blankTemplatePath);
    assert.equal(pair.examplePath, template.exampleTemplatePath);
  }
  assert.deepEqual(dataReadiness.checks.map((check) => check.subject), [
    'Vollstaendigkeit',
    'Eindeutigkeit',
    'Buchungsgruppenabhaengigkeiten',
    'Summenabstimmung',
    'Synthetische Klassifikation',
    'Offene Freigaben'
  ]);
  assert.ok(dataReadiness.openApprovalRefs?.length > 0);
  assert.match(dataReadiness.blockerRule?.consequence ?? '', /Kein.*BC-Schreibschritt/);
  assert.match(dataReadiness.configurationPackageResponsibility ?? '', /Werkzeug des Dienstleisters/);
});

test('UAT-Katalog enthaelt genau sieben geplante Pflichtfaelle ohne Ausfuehrungsbehauptung', () => {
  assert.equal(uatCatalog.status, 'planned');
  assert.equal(uatCatalog.executed, false);
  assert.equal(uatCatalog.resultClaimed, false);
  assert.deepEqual(uatCatalog.cases?.map((uatCase) => uatCase.id), Array.from({ length: 7 }, (_, index) => `UABC-UAT-BCB-00${index + 1}`));
  assert.deepEqual(uatCatalog.cases.map((uatCase) => uatCase.title), [
    'Navigation und Look-and-Feel',
    'Einkauf',
    'Verkauf',
    'Einfacher Bestand',
    'Finance und Abstimmung',
    'Monatsabschlussprobe',
    'UStVA-Vorschau ohne Uebermittlung'
  ]);
  for (const uatCase of uatCatalog.cases) {
    assert.ok(['planned', 'synthetic-complete'].includes(uatCase.status));
    if (uatCase.status === 'synthetic-complete') assert.equal(uatCase.syntheticExecutionEvidence, 'evidence/simulation/phase-3-cash-inventory-close.yaml');
    assert.ok(uatCase.initialState?.length > 0, `${uatCase.id}: Ausgangslage fehlt`);
    assert.ok(uatCase.roleRef?.length > 0, `${uatCase.id}: Rolle fehlt`);
    assert.ok(uatCase.testDataRefs?.length > 0, `${uatCase.id}: Testdatenreferenz fehlt`);
    assert.ok(uatCase.steps?.length > 0, `${uatCase.id}: fachliche Schritte fehlen`);
    assert.ok(uatCase.expectedResult?.length > 0, `${uatCase.id}: erwartetes Ergebnis fehlt`);
    assert.ok(uatCase.acceptanceCriterion?.length > 0, `${uatCase.id}: Abnahmekriterium fehlt`);
    assert.equal('evidence' in uatCase, false, `${uatCase.id}: geplanter Fall darf keine Evidence behaupten`);
  }
  assert.match(uatCatalog.cases.at(-1).expectedResult, /keine Meldung verlaesst die Sandbox/);
  assert.match(uatCatalog.configurationPackageResponsibility ?? '', /kein Schulungs- oder Pflegegegenstand/);
});

test('Schulungsplan trennt Planung konsequent von Ausfuehrungsnachweisen', () => {
  assert.equal(trainingPlan.status, 'planned');
  assert.equal(trainingPlan.sessions?.length, 4);
  assert.match(trainingPlan.completionRule, /Konfigurationspaketen ist ausgeschlossen/);
  for (const session of trainingPlan.sessions) {
    assert.equal(session.status, 'planned');
    assert.equal(session.planningTranscriptRef, 'UABC-MTG-001');
    assert.equal(session.executionTranscriptRef, null);
    assert.deepEqual(session.attendance, []);
    assert.deepEqual(session.exerciseResults, []);
    assert.deepEqual(session.openQuestions, []);
    assert.equal(session.competencyCheck, null);
    assert.ok(session.agenda?.length > 0);
    assert.ok(session.exercises?.length > 0);
  }
});

test('Projekt-Twin-Vertrag liest nur positivgelistete vorhandene Blueprint-Pfade', async () => {
  assert.equal(projectIndex.contractId, 'UABC-PROJECT-DATA-V1');
  assert.equal(projectIndex.readOnly, true);
  assert.equal(projectIndex.pathSemantics, 'repository-relative');
  assert.equal(projectIndex.missingValuePolicy, 'leer');
  assert.equal(projectIndex.allowedBranch, 'codex/universaarl-projekt');
  assert.equal(projectIndex.validationStatus, 'branch-commit-validierung-erforderlich');
  assert.equal(new Set(projectIndex.artifacts.map((artifact) => artifact.id)).size, projectIndex.artifacts.length);
  const forbiddenBroadPaths = new Set([
    'atlassian/jira/project.yaml',
    'atlassian/jira/workflow.yaml',
    'atlassian/confluence/space.yaml',
    'atlassian/confluence/navigation.md',
    'docs/research/source-register.md'
  ]);
  const requiredSelectors = new Map([
    ['atlassian/jira/people.yaml', 'people[id in P-001,P-002,P-004,P-005,P-011,P-016,P-019]'],
    ['evidence/verification-register.yaml', 'verifications[changeRef=deliver-bc-basic-customer-project]'],
    ['docs/research/sources.yaml', 'sources[id in SRC-BC-016,SRC-BC-052,SRC-BC-053,SRC-BC-054,SRC-BC-055,SRC-BC-056,SRC-BC-057,SRC-LAW-001,SRC-ELSTER-001]']
  ]);
  assert.ok(projectIndex.artifacts.some((artifact) => artifact.path === 'evidence/simulation/phase-2-p2p-o2c.yaml'));
  assert.ok(projectIndex.artifacts.some((artifact) => artifact.path === 'evidence/simulation/phase-3-cash-inventory-close.yaml'));
  const expectedPhaseOnePaths = [
    ...dataPackage.templates.flatMap((template) => [template.blankTemplatePath, template.exampleTemplatePath]),
    dataPackage.readinessCheckPath,
    dataPackage.uatCatalogPath
  ];
  const indexedPaths = new Set(projectIndex.artifacts.map((artifact) => artifact.path));
  assert.ok(expectedPhaseOnePaths.every((sourcePath) => indexedPaths.has(sourcePath)), 'Neue Phase-1-Artefakte muessen einzeln positivgelistet sein');
  assert.ok(expectedPhaseOnePaths.every((sourcePath) => !sourcePath.includes('*') && !sourcePath.endsWith('/')), 'Positivliste darf keine Verzeichnis- oder Wildcardfreigabe enthalten');
  for (const artifact of projectIndex.artifacts) {
    assert.ok(artifact.kindId?.length > 0, `${artifact.id}: Artkennung fehlt`);
    assert.equal(path.isAbsolute(artifact.path), false, `${artifact.id}: Pfad muss relativ sein`);
    assert.equal(artifact.path.includes('..'), false, `${artifact.id}: Pfad darf die Wurzel der Projektablage nicht verlassen`);
    assert.equal(/(^|\/)\.env(?:\.|$)/i.test(artifact.path), false, `${artifact.id}: Umgebungsdatei ist verboten`);
    assert.equal(forbiddenBroadPaths.has(artifact.path), false, `${artifact.id}: projektuebergreifende Quelle ist nicht zulaessig`);
    if (requiredSelectors.has(artifact.path)) assert.equal(artifact.selector, requiredSelectors.get(artifact.path), `${artifact.id}: verbindlicher Selektor fehlt oder weicht ab`);
    assert.equal(await exists(artifact.path), true, `${artifact.id}: positivgelisteter Pfad fehlt: ${artifact.path}`);
  }
});

test('Phase-2-Trockenlauf liefert synthetische Bereitschaft und blockiert reale Ausfuehrung', () => {
  const dryRun = YAML.parse(readFileSync(path.join(root, 'project', 'bc-basic', 'phase-2-dry-run.yaml'), 'utf8'));
  assert.equal(dryRun.classification, 'synthetic-only');
  assert.equal(dryRun.realBcExecution, false);
  assert.equal(dryRun.status, 'synthetisch-bereit-real-blockiert');
  assert.equal(dryRun.goNoGo.decision, 'NO_GO_REAL');
  assert.equal(dataReadiness.dryRunPath, 'project/bc-basic/phase-2-dry-run.yaml');
  assert.equal(dryRun.importSequence.length, 8);
  assert.deepEqual(dryRun.importSequence.map((step) => step.order), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.ok(dryRun.checks.some((check) => check.kind === 'approvals'));
  assert.ok(dryRun.checks.some((check) => check.kind === 'rollback'));
  assert.match(dryRun.evidence.executionClaim, /keine reale BC-Ausfuehrung/);
});

test('Synthetischer UAT- und Schulungslauf besitzt vollstaendige Coverage und bleibt real blockiert', () => {
  const runPlan = YAML.parse(readFileSync(path.join(root, 'project', 'bc-basic', 'uat-training-run.yaml'), 'utf8'));
  assert.equal(runPlan.classification, 'synthetic-only');
  assert.equal(runPlan.realExecution, false);
  assert.equal(runPlan.status, 'synthetisch-uat-bereit-real-blockiert');
  assert.equal(runPlan.goNoGo.decision, 'NO_GO_REAL');
  assert.equal(runPlan.cases.length, 7);
  assert.equal(runPlan.coverage.length, 7);
  assert.ok(runPlan.cases.every((item) => item.priority === 'P1' || item.priority === 'P2'));
  assert.equal(runPlan.evidenceRules.missingEvidence, 'block');
  assert.equal(runPlan.evidenceRules.realAcceptance, 'menschliche-abnahme');
});

test('Phase-2-Readiness-Gate verbindet Nachweise und offene Freigaben fail-closed', () => {
  const gate = YAML.parse(readFileSync(path.join(root, 'project', 'bc-basic', 'phase-2-readiness-gate.yaml'), 'utf8'));
  assert.equal(gate.status, 'geplant-blockiert');
  assert.equal(gate.decision, 'NO_GO_REAL');
  assert.equal(gate.simulation.decision, 'GO_SIMULATION');
  assert.equal(gate.simulation.customerApproval, 'simulated');
  assert.equal(gate.simulation.assumptions.zielumgebung, 'playthru');
  assert.equal(gate.simulation.assumptions.lizenz, 'Essentials');
  assert.equal(gate.requiredEvidence.length, 6);
  assert.equal(gate.blockers.length, 4);
  assert.ok(gate.blockers.every((blocker) => blocker.decisionRef.startsWith('UABC-APP-BCB-')));
  assert.ok(gate.rules.some((rule) => /P1- oder P2-Abweichung blockiert/.test(rule)));
  assert.match(gate.nextStep, /Reale Entscheider/);
});

test('Rueckverfolgbarkeitsmatrix verbindet Requirements bis Evidence ohne Abnahmebehauptung', () => {
  const matrix = YAML.parse(readFileSync(path.join(root, 'project', 'bc-basic', 'traceability-matrix.yaml'), 'utf8'));
  assert.equal(matrix.entries.length, 12);
  assert.equal(matrix.evidenceStatus.realExecution, false);
  assert.equal(matrix.evidenceStatus.humanAcceptance, 'open');
  assert.equal(matrix.evidenceStatus.missingEvidenceBlocks, true);
  assert.ok(matrix.entries.every((entry) => entry.requirement && entry.solution && Array.isArray(entry.workPackages) && Array.isArray(entry.uat) && Array.isArray(entry.training) && entry.evidence));
});

test('P2P- und O2C-Simulation besitzt Inventar Kontrollsummen Defects und Retests', () => {
  const simulation = YAML.parse(readFileSync(path.join(root, 'evidence', 'simulation', 'phase-2-p2p-o2c.yaml'), 'utf8'));
  assert.equal(simulation.classification, 'synthetic-only');
  assert.equal(simulation.realBcExecution, false);
  assert.equal(simulation.inventory.openingBalance.difference, 0);
  assert.equal(simulation.purchaseToPay.controls.gross, 499.80);
  assert.equal(simulation.orderToCash.controls.gross, 940.10);
  assert.equal(simulation.defectsAndRetest.allDefectsClosedInSimulation, true);
  assert.equal(simulation.defectsAndRetest.realGoNoGo, 'NO_GO_REAL');
});

test('Cash Lager Monatsabschluss und UStVA-Simulation besitzen Summen Retests und ehrliche Abnahme', () => {
  const simulation = YAML.parse(readFileSync(path.join(root, 'evidence', 'simulation', 'phase-3-cash-inventory-close.yaml'), 'utf8'));
  assert.equal(simulation.payments.controls.closingBank, 5440.30);
  assert.equal(simulation.payments.controls.bankDifference, 0);
  assert.equal(simulation.bankReconciliation.difference, 0);
  assert.equal(simulation.inventory.count.closingValue, 4158.00);
  assert.equal(simulation.monthClose.checklist.length, 6);
  assert.equal(simulation.vatPreview.calculation.netPayable, 70.30);
  assert.equal(simulation.vatPreview.transmission, 'ausgeschlossen');
  assert.equal(simulation.uatExecution.status, 'synthetisch-ausgefuehrt-und-abgenommen');
  assert.equal(simulation.goNoGo.real, 'NO_GO_REAL');
});

test('Blueprint kennt den lesenden Project Twin ohne umgekehrte Datenabhaengigkeit', () => {
  assert.equal(consumerBindings.schemaVersion, 2);
  assert.equal(consumerBindings.governingChange, 'deliver-bc-basic-customer-project');
  assert.equal(consumerBindings.lifecycleStatus, 'proposed');
  assert.deepEqual(consumerBindings.producer, {
    projectId: 'UABC-BC-BASIC-001',
    contractId: 'UABC-PROJECT-DATA-V1',
    contractPath: 'exports/project-data/v1/index.yaml'
  });
  assert.deepEqual(consumerBindings.spectraReleaseBinding, {
    bindingStatus: 'BOUND',
    productId: 'spectra',
    technicalRepositoryName: 'BCProjectOS',
    repositoryUrl: 'https://github.com/sivla/BCProjectOS.git',
    releaseVersion: '0.1.0-alpha.1',
    releaseTag: 'spectra-v0.1.0-alpha.1',
    tagCommit: 'aa89c4395bb2fd3d21c52367eca250ce8d6dd432',
    manifestPath: 'release/versions/0.1.0-alpha.1/release-manifest.json',
    manifestSourceCommit: 'ea35dcbb736d94a2494fa572cd09df476b611be8',
    consumerMode: 'INSTALLABLE_BLUEPRINT',
    installableBlueprint: true,
    digestAlgorithm: 'SHA-256',
    payloadBundleDigest: 'bc842ae6144c79ba66b934c9b4285f7a0d7c5da503e87e8bc3e7d626ab3adbd5',
    installationStatus: 'geplant-nicht-installiert',
    reason: 'Kontrollierte GitHub-Release-Evidence ist reproduzierbar geprueft; eine Installation in BC Basic erfolgt nicht.'
  });
  assert.equal(consumerBindings.consumers?.length, 1);
  const [twin] = consumerBindings.consumers;
  assert.equal(twin.consumerId, 'project-twin');
  assert.equal(twin.displayName, 'Universaarl Project Twin');
  assert.equal(twin.routeKey, 'bc-basic');
  assert.equal(twin.access, 'nur-lesend');
  assert.deepEqual(twin.identity, {
    status: 'autorisierter-leser',
    authorizationScope: 'ausschliesslich-validierte-snapshots-lesen',
    repository: {
      url: 'https://github.com/sivla/FiBu.git',
      branch: 'codex/universaarl-projekt-twin'
    }
  });
  assert.deepEqual(twin.snapshotContract, {
    dataContractPath: 'exports/project-data/v1/index.yaml',
    manifestSchemaPath: 'governance/schemas/project-snapshot-manifest.schema.json',
    manifestPath: null,
    pathSemantics: 'repository-relative',
    lifecycleStatus: 'proposed',
    sourceCommitSha: null,
    consumerBindingDigest: null,
    payloadBundleDigest: null,
    digestAlgorithm: 'SHA-256',
    canonicalization: 'uabc-snapshot-records-v1',
    generationStages: ['commitgebundene-payloadliste-und-digests', 'manifest-aus-validierter-payloadliste'],
    validationStatus: 'blocked',
    accessRule: 'Nur ein validierter, versionierter Snapshot mit positivgelisteten Pfaden und verbindlichen Selektoren darf gelesen werden.',
    availability: 'blockiert-bcprojectos-release-und-snapshotnachweise-ausstehend'
  });
  assert.deepEqual(twin.dependency, {
    direction: 'consumer-to-producer',
    blueprintReadsConsumer: false,
    consumerWritesProducer: false
  });

  const serializedBinding = JSON.stringify(consumerBindings);
  assert.equal(/\b[a-f0-9]{40}\b/i.test(serializedBinding), true, 'Gebundene Konsumentenbindung muss die Release-Commit-SHA enthalten');
  assert.equal(consumerBindings.spectraReleaseBinding.tagCommit, 'aa89c4395bb2fd3d21c52367eca250ce8d6dd432');
  assert.equal(twin.snapshotContract.sourceCommitSha, null, 'Ohne saubere versionierte Snapshot-Quelle muss die Quell-Commit-SHA leer bleiben');
  assert.equal(projectIndex.artifacts.some(({ path: sourcePath }) => sourcePath === 'governance/consumer-bindings.yaml'), false, 'Die interne Consumerbindung darf nicht als Twin-Payload positivgelistet sein');
  assert.equal(projectIndex.artifacts.some(({ kindId, format, path: sourcePath }) => kindId === 'snapshot-manifest-schema' && format === 'json-schema' && sourcePath.endsWith('.json')), true, 'Das Snapshot-Schema muss als json-schema unter .json positivgelistet sein');
  assert.equal(projectIndex.artifacts.some(({ path: sourcePath }) => /(?:universaarl-project-twin|<twin_root>|^\.\.[\\/])/i.test(sourcePath)), false, 'Twin-Pfade duerfen nicht als Blueprint-Projektdatenquelle positivgelistet werden');
  assert.equal(twin.dependency.blueprintReadsConsumer, false);
  assert.equal(twin.dependency.consumerWritesProducer, false);
});

test('Consumer-Vertrag blockiert fehlende Release-, Autorisierungs- und Snapshot-Nachweise fail-closed', () => {
  assert.deepEqual(validateConsumerBindings(consumerBindings, projectIndex), []);
  const mutationCases = [
    ['Spectra ohne Nachweise gebunden', (value) => { value.spectraReleaseBinding.bindingStatus = 'PENDING_BCPROJECTOS_RELEASE'; value.spectraReleaseBinding.releaseVersion = null; value.spectraReleaseBinding.releaseTag = null; value.spectraReleaseBinding.tagCommit = null; value.spectraReleaseBinding.manifestPath = null; value.spectraReleaseBinding.manifestSourceCommit = null; value.spectraReleaseBinding.consumerMode = null; value.spectraReleaseBinding.installableBlueprint = null; value.spectraReleaseBinding.payloadBundleDigest = null; }],
    ['Spectra-Tag-Commit ohne gueltigen Nachweis', (value) => { value.spectraReleaseBinding.tagCommit = 'kein-commit'; }],
    ['falsche BCProjectOS-Repository-Identitaet', (value) => { value.spectraReleaseBinding.repositoryUrl = 'https://github.com/sivla/falsch.git'; }],
    ['falsche Spectra-Produktidentitaet', (value) => { value.spectraReleaseBinding.productId = 'bcprojectos'; }],
    ['falsche Twin-Repository-Identitaet', (value) => { value.consumers[0].identity.repository.url = 'https://github.com/sivla/falsch.git'; }],
    ['falscher Twin-Branch', (value) => { value.consumers[0].identity.repository.branch = 'main'; }],
    ['Consumer erhaelt Schreibzugriff', (value) => { value.consumers[0].access = 'schreibend'; }],
    ['Snapshot ohne Nachweise freigegeben', (value) => { value.consumers[0].snapshotContract.validationStatus = 'passed'; }],
    ['Snapshot nutzt absoluten Pfad', (value) => { value.consumers[0].snapshotContract.dataContractPath = 'C:\\temp\\snapshot.json'; }],
    ['Snapshot behauptet falschen Quellcommit', (value) => { value.consumers[0].snapshotContract.sourceCommitSha = 'b'.repeat(40); }],
    ['Snapshot behauptet falschen Digest', (value) => { value.consumers[0].snapshotContract.payloadBundleDigest = `sha256:${'c'.repeat(64)}`; }],
    ['Consumer schreibt zurueck', (value) => { value.consumers[0].dependency.consumerWritesProducer = true; }],
    ['Zweiter Consumer wird eingeschleust', (value) => { value.consumers.push(structuredClone(value.consumers[0])); }]
  ];
  for (const [label, mutate] of mutationCases) {
    const candidate = structuredClone(consumerBindings);
    mutate(candidate);
    assert.notDeepEqual(validateConsumerBindings(candidate, projectIndex), [], `${label}: Manipulation muss scheitern`);
  }
});

test('Snapshotvalidator bindet B und blockiert Dirty-Worktree-Nachweise', () => {
  const validatorSource = readFileSync(path.join(root, 'scripts', 'validate-snapshot-contract.mjs'), 'utf8');
  assert.match(validatorSource, /status', '--porcelain/);
  assert.match(validatorSource, /git\(\['show'/);
  assert.match(validatorSource, /git\(\['cat-file'/);
  assert.doesNotMatch(validatorSource, /fs\.readFile|fs\.access/);
  assert.match(validatorSource, /rev-parse', 'HEAD'/);
  assert.match(validatorSource, /parseGitTreeEntry/);
});

test('BOUND-Zustand und JSON-Snapshotmanifest verlangen vollstaendige konsistente Nachweise', () => {
  const gebunden = structuredClone(consumerBindings);
  Object.assign(gebunden.spectraReleaseBinding, {
    bindingStatus: 'BOUND',
    technicalRepositoryName: 'BCProjectOS',
    productId: 'spectra',
    repositoryUrl: 'https://github.com/sivla/BCProjectOS.git',
    releaseVersion: '0.1.0-alpha.1',
    releaseTag: 'spectra-v0.1.0-alpha.1',
    tagCommit: 'a'.repeat(40),
    manifestPath: 'release/install-manifest.json',
    manifestSourceCommit: 'b'.repeat(40),
    consumerMode: 'INSTALLABLE_BLUEPRINT',
    installableBlueprint: true,
    digestAlgorithm: 'SHA-256',
    payloadBundleDigest: 'c'.repeat(64),
    installationStatus: 'nicht-installiert'
  });
  assert.deepEqual(validateConsumerBindings(gebunden, projectIndex), []);
  const falscherTag = structuredClone(gebunden);
  falscherTag.spectraReleaseBinding.releaseTag = 'v0.1.0-alpha.1';
  assert.notDeepEqual(validateConsumerBindings(falscherTag, projectIndex), [], 'Ein Nicht-Spectra-Tag muss scheitern');
  const readEntry = (sourcePath) => ({ bytes: Buffer.from(`blob:${sourcePath}\n`, 'utf8'), gitMode: '100644' });
  const manifest = buildSnapshotManifest({ binding: gebunden, projectIndex, producerCommitSha: 'd'.repeat(40), readEntry });
  const schema = JSON.parse(readFileSync(path.join(root, 'governance', 'schemas', 'project-snapshot-manifest.schema.json'), 'utf8'));
  assert.deepEqual(validateSnapshotManifest(manifest, schema), []);
  assert.deepEqual(validateManifestDigests(manifest, readEntry), []);
  assert.equal(manifest.producerId, 'blueprint');
  assert.equal(manifest.spectraReleaseBinding.productId, 'spectra');
  assert.equal(manifest.spectraReleaseBinding.technicalRepositoryName, 'BCProjectOS');
  assert.equal(manifest.payloadDigestFormat, 'uabc-snapshot-records-v1');
  assert.equal(manifest.index.path, 'exports/project-data/v1/index.yaml');
  assert.match(manifest.spectraReleaseBinding.payloadBundleDigest, /^[a-f0-9]{64}$/);
  assert.match(manifest.payloadBundleDigest, /^sha256:[a-f0-9]{64}$/);
  assert.notEqual(`sha256:${manifest.spectraReleaseBinding.payloadBundleDigest}`, manifest.payloadBundleDigest, 'Spectra-Release- und BC-Basic-Snapshotdigest muessen getrennte Domaenen bleiben');
  const forbiddenPayload = structuredClone(manifest);
  forbiddenPayload.payloads.push({ id: 'UABC-SRC-BCB-INTERNAL-001', path: 'governance/consumer-bindings.yaml', selector: null, gitMode: '100644', sizeBytes: 1, sha256: '0'.repeat(64) });
  assert.notDeepEqual(validateSnapshotManifest(forbiddenPayload, schema), [], 'Manifest darf die interne Consumerbindung nicht als Twin-Payload anbieten');
  assert.equal(manifest.producerCommitSha, 'd'.repeat(40));
  assert.equal(manifest.payloads.some(({ path: sourcePath }) => sourcePath === 'exports/project-data/v1/snapshot-manifest.json'), false, 'Manifest darf nicht Teil seiner eigenen Payload sein');
  const invalidFixtures = [
    ['falscher Payload-Digest', (value) => { value.payloadBundleDigest = `sha256:${'0'.repeat(63)}`; }],
    ['falscher Quellcommit', (value) => { value.producerCommitSha = 'kein-commit'; }],
    ['absoluter Payloadpfad', (value) => { value.payloads[0].path = 'C:\\temp\\payload'; }],
    ['Rueckschreibzugriff', (value) => { value.consumer.access = 'schreibend'; }],
    ['falscher Twin-Branch', (value) => { value.consumer.branch = 'main'; }]
    ,['nicht erlaubter Git-Modus', (value) => { value.payloads[0].gitMode = '100755'; }]
    ,['Backslashpfad', (value) => { value.payloads[0].path = 'docs\\file.md'; }]
    ,['Doppeltrennzeichenpfad', (value) => { value.payloads[0].path = 'docs//file.md'; }]
    ,['URI-Pfad', (value) => { value.payloads[0].path = 'https://example.invalid/file'; }]
    ,['Abschliessender Schraegstrich', (value) => { value.payloads[0].path = 'docs/file.md/'; }]
    ,['Releaseversion-Tag-Mismatch', (value) => { value.spectraReleaseBinding.releaseTag = 'spectra-v0.1.0-alpha.2'; }]
  ];
  for (const [label, mutate] of invalidFixtures) {
    const candidate = structuredClone(manifest);
    mutate(candidate);
    assert.notDeepEqual(validateSnapshotManifest(candidate, schema), [], `${label}: JSON-Manifestfixture muss scheitern`);
  }
  const wrongDigest = structuredClone(manifest);
  wrongDigest.payloads[0].sha256 = 'e'.repeat(64);
  assert.notDeepEqual(validateManifestDigests(wrongDigest, readEntry), [], 'Formal gueltiger aber falscher Payload-Digest muss scheitern');
  assert.equal(hasSingleParent(`${'d'.repeat(40)} ${'a'.repeat(40)}`, 'a'.repeat(40)), true, 'Direkter Einzelparent A muss akzeptiert werden');
  assert.equal(hasSingleParent(`${'d'.repeat(40)} ${'a'.repeat(40)} ${'b'.repeat(40)}`, 'a'.repeat(40)), false, 'Merge-B mit zwei Parent-SHAs muss scheitern');
  assert.deepEqual(parseGitTreeEntry(`100644 blob ${'a'.repeat(40)} 3\tfile`, 'file'), { gitMode: '100644', sizeBytes: 3 });
  assert.throws(() => parseGitTreeEntry(`100755 blob ${'a'.repeat(40)} 3\tfile`, 'file'), /kein exakter 100644-Blob/);
  assert.throws(() => parseGitTreeEntry(`100644 blob ${'a'.repeat(40)} 3\tfile-extra`, 'file'), /kein exakter 100644-Blob/);
  assert.throws(() => parseGitTreeEntry(`100644 blob ${'a'.repeat(40)} 3\tfile\n100644 blob ${'b'.repeat(40)} 2\tother`, 'file'), /nicht genau eine Zeile/);
});

test('Alle BC-Basic-Nachweise bleiben vor der Ausfuehrung ehrlich ausstehend', () => {
  const requiredIds = [
    'UABC-VER-BCB-LOCAL-001',
    'UABC-VER-BCB-READINESS-001',
    'UABC-VER-BCB-E2E-001',
    'UABC-VER-BCB-TRAINING-001',
    'UABC-VER-BCB-CLOSE-001',
    'UABC-VER-BCB-VAT-001',
    'UABC-VER-BCB-HANDOVER-001',
    'UABC-VER-BCB-POLICY-GATE-001'
  ];
  for (const id of requiredIds) {
    const verification = verificationById.get(id);
    assert.ok(verification, `${id}: Nachweis fehlt`);
    assert.equal(verification.status, 'pending');
    assert.equal(verification.executedAt, null);
    assert.equal(verification.evidence, null);
  }
});

test('Entscheidungen bleiben an eine technische Entscheiderreferenz gebunden', () => {
  assert.equal(decisionRegister.decisions?.length, 7);
  for (const decision of decisionRegister.decisions) {
    assert.equal(decision.decidedByRef, 'real-repository-user');
    assert.equal(decision.status, 'decided');
  }
  assert.ok(decisionRegister.openApprovals?.some((approval) => approval.id === 'UABC-APP-BCB-006' && approval.status === 'open'));
});

test('Szenariokatalog schliesst Produktivbetrieb E-Rechnung und UStVA-Uebermittlung aus', () => {
  assert.equal(scenarioCatalog.simulation, true);
  assert.equal(scenarioCatalog.writePolicy?.authorizationStatus, 'required');
  assert.equal(scenarioCatalog.scenarios?.length, 9);
  const closeScenario = scenarioCatalog.scenarios.find((scenario) => scenario.id === 'UABC-PW-BCB-007');
  const vatScenario = scenarioCatalog.scenarios.find((scenario) => scenario.id === 'UABC-PW-BCB-008');
  const writeApproval = decisionRegister.openApprovals?.find((approval) => approval.id === 'UABC-APP-BCB-001');
  assert.match(closeScenario?.expectedResult ?? '', /Sandbox/);
  assert.match(closeScenario?.expectedResult ?? '', /kein echter Monatsabschluss/i);
  assert.ok(closeScenario?.requirementRefs?.includes('UABC-REQ-BCB-008'), 'Monatsabschlussprobe muss den Schreibsicherheitsvertrag referenzieren');
  assert.ok(writeApproval?.blocks?.includes('UABC-36'), 'Ziel- und Ruecksetzfreigabe muss UABC-36 blockieren');
  assert.match(vatScenario?.expectedResult ?? '', /weder eine Test-, Produktiv- noch ELSTER-Uebermittlung/i);
  assert.ok(scenarioCatalog.writePolicy?.rules?.some((rule) => rule.includes('E-Rechnung')));
});

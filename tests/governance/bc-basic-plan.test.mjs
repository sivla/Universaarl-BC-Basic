import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { validateConsumerBindings } from '../../scripts/lib/validate-consumer-bindings.mjs';

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
    assert.equal(deliverable.status, 'planned');
    assert.equal(deliverable.resultClaimed, false);
    assert.equal(deliverable.completionEvidence, null);
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
    assert.equal(uatCase.status, 'planned');
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

test('Blueprint kennt den lesenden Project Twin ohne umgekehrte Datenabhaengigkeit', () => {
  assert.equal(consumerBindings.schemaVersion, 1);
  assert.equal(consumerBindings.governingChange, 'deliver-bc-basic-customer-project');
  assert.equal(consumerBindings.lifecycleStatus, 'proposed');
  assert.deepEqual(consumerBindings.producer, {
    projectId: 'UABC-BC-BASIC-001',
    contractId: 'UABC-PROJECT-DATA-V1',
    contractPath: 'exports/project-data/v1/index.yaml'
  });
  assert.deepEqual(consumerBindings.bcProjectOsBinding, {
    status: 'PENDING_BCPROJECTOS_RELEASE',
    releaseTag: null,
    commitSha: null,
    digest: null,
    reason: 'Kein echter unveraenderlicher BCProjectOS-Release-Tag mit nachgewiesenem Digest liegt in dieser Projektablage vor.'
  });
  assert.equal(consumerBindings.consumers?.length, 1);
  const [twin] = consumerBindings.consumers;
  assert.equal(twin.consumerId, 'project-twin');
  assert.equal(twin.displayName, 'Universaarl Project Twin');
  assert.equal(twin.routeKey, 'bc-basic');
  assert.equal(twin.access, 'nur-lesend');
  assert.deepEqual(twin.identity, {
    status: 'pending-authorization',
    reason: 'Die lokale Projektablage belegt weder die Autorisierung noch die Existenz des benannten Zielbranch als Universaarl Project Twin.',
    candidateRepository: {
      url: 'https://github.com/sivla/FiBu.git',
      branch: 'codex/universaarl-projekt-twin'
    }
  });
  assert.deepEqual(twin.snapshotContract, {
    path: 'exports/project-data/v1/index.yaml',
    pathSemantics: 'repository-relative',
    lifecycleStatus: 'proposed',
    sourceCommitSha: null,
    digest: null,
    validationStatus: 'blocked',
    accessRule: 'Nur ein validierter, versionierter Snapshot mit positivgelisteten Pfaden und verbindlichen Selektoren darf gelesen werden.',
    availability: 'blockiert-bcprojectos-bindung-validierung-und-versionierung-ausstehend'
  });
  assert.deepEqual(twin.dependency, {
    direction: 'consumer-to-producer',
    blueprintReadsConsumer: false,
    consumerWritesProducer: false
  });

  const serializedBinding = JSON.stringify(consumerBindings);
  assert.equal(/\b[a-f0-9]{40}\b/i.test(serializedBinding), false, 'Konsumentenbindung darf keine vollstaendige Commit-SHA enthalten');
  assert.equal(consumerBindings.bcProjectOsBinding.commitSha, null, 'Ohne echten BCProjectOS-Release muss die Commit-SHA leer bleiben');
  assert.equal(twin.snapshotContract.sourceCommitSha, null, 'Ohne saubere versionierte Snapshot-Quelle muss die Quell-Commit-SHA leer bleiben');
  assert.equal(projectIndex.artifacts.some(({ id, kindId, path: sourcePath }) => id === 'UABC-SRC-BCB-CONSUMER-001' && kindId === 'consumer-binding' && sourcePath === 'governance/consumer-bindings.yaml'), true, 'Der Consumer-Vertrag muss positivgelistet und repository-relativ referenziert sein');
  assert.equal(projectIndex.artifacts.some(({ path: sourcePath }) => /(?:universaarl-project-twin|<twin_root>|^\.\.[\\/])/i.test(sourcePath)), false, 'Twin-Pfade duerfen nicht als Blueprint-Projektdatenquelle positivgelistet werden');
  assert.equal(twin.dependency.blueprintReadsConsumer, false);
  assert.equal(twin.dependency.consumerWritesProducer, false);
});

test('Consumer-Vertrag blockiert fehlende Release-, Autorisierungs- und Snapshot-Nachweise fail-closed', () => {
  assert.deepEqual(validateConsumerBindings(consumerBindings, projectIndex), []);
  const mutationCases = [
    ['BCProjectOS ohne Nachweise freigegeben', (value) => { value.bcProjectOsBinding.status = 'released'; }],
    ['BCProjectOS-Commit ohne Release behauptet', (value) => { value.bcProjectOsBinding.commitSha = 'a'.repeat(40); }],
    ['Consumer ohne Nachweis autorisiert', (value) => { value.consumers[0].identity.status = 'authorized'; }],
    ['Consumer erhaelt Schreibzugriff', (value) => { value.consumers[0].access = 'schreibend'; }],
    ['Snapshot ohne Nachweise freigegeben', (value) => { value.consumers[0].snapshotContract.validationStatus = 'passed'; }],
    ['Snapshot nutzt absoluten Pfad', (value) => { value.consumers[0].snapshotContract.path = 'C:\\temp\\snapshot.yaml'; }],
    ['Consumer schreibt zurueck', (value) => { value.consumers[0].dependency.consumerWritesProducer = true; }],
    ['Zweiter Consumer wird eingeschleust', (value) => { value.consumers.push(structuredClone(value.consumers[0])); }]
  ];
  for (const [label, mutate] of mutationCases) {
    const candidate = structuredClone(consumerBindings);
    mutate(candidate);
    assert.notDeepEqual(validateConsumerBindings(candidate, projectIndex), [], `${label}: Manipulation muss scheitern`);
  }
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

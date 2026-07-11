import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

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

const [plan, billing, issueDocument, deliverableRegister, dataPackage, trainingPlan, meetingIndex, projectIndex, scenarioCatalog, verificationRegister] = await Promise.all([
  yaml('project/bc-basic/project-plan.yaml'),
  yaml('project/bc-basic/billing.yaml'),
  yaml('atlassian/jira/issues/bc-basic-project.yaml'),
  yaml('project/bc-basic/deliverables.yaml'),
  yaml('project/bc-basic/data-package.yaml'),
  yaml('project/bc-basic/training-plan.yaml'),
  yaml('atlassian/confluence/meetings/index.yaml'),
  yaml('exports/project-data/v1/index.yaml'),
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

test('Drei Phasen ergeben 76 Planstunden mit genau einer Einrichtungswoche', () => {
  assert.equal(plan.phases?.length, 3);
  assert.deepEqual(plan.phases.map((phase) => phase.plannedBillableHours), [20, 40, 16]);
  assert.equal(plan.phases.reduce((sum, phase) => sum + phase.plannedBillableHours, 0), 76);
  assert.equal(plan.phases[1].startDate, '2026-08-24');
  assert.equal(plan.phases[1].endDate, '2026-08-28');
  assert.match(plan.phases[0].name, /Vorbereitung/);
  assert.match(plan.phases[2].name, /Stabilisierungsphase/);
});

test('OpenSpec-Aufgaben und Jira-Arbeitspakete stimmen bei Schluessel und Stunden ueberein', () => {
  const taskEntries = [...taskPlanText.matchAll(/\(`(UABC-\d+)`, (\d+) h\)/g)].map((match) => ({ key: match[1], hours: Number(match[2]) }));
  assert.deepEqual(taskEntries.map((entry) => entry.key), Array.from({ length: 17 }, (_, index) => `UABC-${index + 22}`));
  assert.equal(taskEntries.reduce((sum, entry) => sum + entry.hours, 0), 76);
  for (const entry of taskEntries) assert.equal(issueByKey.get(entry.key)?.plannedBillableHours, entry.hours, `${entry.key}: OpenSpec- und Jira-Stunden weichen ab`);
  assert.match(taskPlanText, /Kontrollhandlungen erzeugen keine zusaetzlichen abrechenbaren Stunden/);
  assert.match(taskPlanText, /Innerhalb von `UABC-38` den Projektindex/);
});

test('Kanonisches Liefermodell bleibt bei Sandbox-Pilot und Monatsabschlussprobe', () => {
  const deliveryModel = changeConfig.proposedCanonicalUpdate?.facts?.deliveryModel?.value ?? '';
  assert.match(deliveryModel, /Monatsabschlussprobe in der Sandbox/);
  assert.match(deliveryModel, /ohne Uebermittlung/);
  assert.doesNotMatch(deliveryModel, /ersten Monatsabschluss/i);
});

test('Budget und Jira-Abrechnung verhindern Eltern- und Doppelabrechnung', () => {
  assert.equal(billing.plannedBillableHours, 76);
  assert.equal(billing.contingencyHours, 4);
  assert.equal(billing.maximumBillableHours, 80);
  assert.equal(billing.netHourlyRate, 120);
  assert.equal(billing.plannedNetAmount, 9120);
  assert.equal(billing.maximumNetAmount, 9600);
  assert.ok(billing.maximumNetAmount < 10000, 'Maximalbetrag muss strikt unter 10.000 EUR netto bleiben');
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
  assert.equal(leafIssues.reduce((sum, issue) => sum + issue.plannedBillableHours, 0), 76);
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

test('Datenvorlagen sind synthetisch, pruefbar und mindestens einfach befuellt', () => {
  assert.equal(dataPackage.status, 'template');
  assert.equal(dataPackage.classification, 'synthetic-only');
  assert.equal(dataPackage.templates?.length, 8);
  for (const template of dataPackage.templates) {
    assert.ok(template.objectId?.length > 0, `${template.id}: Objektkennung fehlt`);
    assert.ok(template.purpose?.length > 0, `${template.id}: Zweck fehlt`);
    assert.ok(template.format?.length > 0, `${template.id}: Format fehlt`);
    assert.ok(template.ownerRef?.length > 0, `${template.id}: Eigentuemer fehlt`);
    assert.equal(template.approvalStatus, 'open', `${template.id}: Freigabestatus muss offen sein`);
    assert.ok(template.required?.length > 0, `${template.id}: Pflichtfelder fehlen`);
    assert.ok(template.qualityRules?.length > 0, `${template.id}: Qualitaetsregeln fehlen`);
    const examples = template.examples ?? (template.example ? [template.example] : []);
    assert.ok(examples.length > 0, `${template.id}: synthetisches Beispiel fehlt`);
    assert.ok(examples.every((example) => example.synthetic === true), `${template.id}: Beispiel muss synthetisch sein`);
  }
});

test('Schulungsplan trennt Planung konsequent von Ausfuehrungsnachweisen', () => {
  assert.equal(trainingPlan.status, 'planned');
  assert.equal(trainingPlan.sessions?.length, 4);
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
});

test('Szenariokatalog schliesst Produktivbetrieb und UStVA-Uebermittlung aus', () => {
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
  assert.match(vatScenario?.expectedResult ?? '', /weder Test- noch Produktivuebermittlung/i);
});

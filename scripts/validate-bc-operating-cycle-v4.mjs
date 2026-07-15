import fs from 'node:fs';
import crypto from 'node:crypto';
import YAML from 'yaml';
import {buildOperatingCycle, readOperatingCycleSource} from './materialize-bc-operating-cycle-v4.mjs';

const generatedPath = 'evidence/simulation/operating-cycle-v4.json';
const expectedBaseline = {
  releaseId: 'UABC-CUSTOMER-001-CATALOG-20260715-V3-FINAL',
  manifestSha256: 'ce92caf9d612bf8fff8fd84cc12c5e13fd20bc8ec3535b13ac4ba0b931cb7c8f',
  payloadBundleDigest: 'bc691ce634b38e782280016bf3e34ac683d70f705a3bb4be46f995ef37e2e57b',
  releaseFileCount: 125,
  aggregateSha256: '981a56d7ba9956a61b90d01b6dc5f1982b6f1163ebcbf5c0aa61f8b9a2b76507',
  ticketCount: 50,
  taskWorklogCount: 19,
  actualHours: 78,
  actualNetAmount: 9360
};
const round = value => Number(value.toFixed(2));
const errors = [];
const fail = (code, detail) => errors.push(`${code}: ${detail}`);
const source = readOperatingCycleSource();
const expected = buildOperatingCycle(source);
const actual = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
const story = JSON.parse(fs.readFileSync('evidence/simulation/project-story.json', 'utf8'));
const pointer = JSON.parse(fs.readFileSync('exports/project-data/v1/snapshots/current.json', 'utf8'));
const releaseDir = `exports/project-data/v1/snapshots/releases/${expectedBaseline.releaseId}`;
const manifestPath = `${releaseDir}/manifest.json`;
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const meetings = YAML.parse(fs.readFileSync('atlassian/confluence/meetings/index.yaml', 'utf8'));
const uat = YAML.parse(fs.readFileSync('project/bc-basic/uat-catalog.yaml', 'utf8'));
const decisions = YAML.parse(fs.readFileSync('project/bc-basic/decision-register.yaml', 'utf8'));
const ledger = JSON.parse(fs.readFileSync('evidence/simulation/pilot-v3-finance-ledger.json', 'utf8'));
const countFiles = directory => fs.readdirSync(directory, {withFileTypes: true}).reduce((count, entry) => count + (entry.isDirectory() ? countFiles(`${directory}/${entry.name}`) : 1), 0);

if (JSON.stringify(actual) !== JSON.stringify(expected)) fail('DETERMINISMUS', 'Evidence ist nicht exakt aus der kanonischen Quelle materialisiert.');
if (JSON.stringify(actual.v3Baseline) !== JSON.stringify(expectedBaseline)) fail('V3-BASELINE', 'V3-Baselinewerte wurden veraendert.');
if (pointer.currentReleaseId !== expectedBaseline.releaseId || pointer.manifestSha256 !== expectedBaseline.manifestSha256 || pointer.payloadBundleDigest !== expectedBaseline.payloadBundleDigest) fail('V3-CURRENT', 'current.json zeigt nicht unveraendert auf V3.');
const manifestSha = crypto.createHash('sha256').update(fs.readFileSync(manifestPath)).digest('hex');
if (manifestSha !== expectedBaseline.manifestSha256 || manifest.payloadBundleDigest !== expectedBaseline.payloadBundleDigest || countFiles(releaseDir) !== expectedBaseline.releaseFileCount) fail('V3-RELEASE', `${manifestSha}/${manifest.payloadBundleDigest}/${countFiles(releaseDir)}`);
if (story.tickets?.length !== 50 || story.tickets.some(ticket => ticket.id === 'UABC-51')) fail('V3-TICKETS', 'Die V3-Story muss ihre 50 IDs unveraendert behalten.');
const dates = actual.journalRecords.map(record => record.date);
if (actual.journalRecords.length !== 22 || dates[0] !== '2026-05-11' || dates.at(-1) !== '2026-06-01' || new Set(dates).size !== 22) fail('TAGESCHRONOLOGIE', `${dates.length} eindeutige Tagesrecords erwartet.`);
for (let i = 1; i < dates.length; i++) {
  const previous = new Date(`${dates[i - 1]}T00:00:00Z`);
  previous.setUTCDate(previous.getUTCDate() + 1);
  if (previous.toISOString().slice(0, 10) !== dates[i]) fail('TAGESLUECKE', `${dates[i - 1]} -> ${dates[i]}`);
}
for (const record of actual.journalRecords) {
  if (!record.roles.owner || !record.roles.controller || !record.activity || !record.traceability.evidence.length) fail('TAGESRECORD', record.recordId);
  if (record.controls.dailyDifference !== 0 || record.controls.trialBalanceDifference !== 0) fail('LEDGER-DIFFERENZ', record.recordId);
  for (const [type, refs] of Object.entries(record.traceability)) {
    if (!refs.length) fail('TRACE-LEER', `${record.recordId}/${type}`);
    for (const ref of refs) {
      const forward = actual.traceability.edges.some(edge => edge.from === record.recordId && edge.to === ref);
      const reverse = actual.traceability.edges.some(edge => edge.from === ref && edge.to === record.recordId);
      if (!forward || !reverse) fail('TRACE-EINSEITIG', `${record.recordId}/${ref}`);
      const known = {
        tickets: new Set([...story.tickets.map(ticket => ticket.id), actual.ticketProjection.id]),
        meetings: new Set(meetings.meetings.map(meeting => meeting.id)),
        processes: new Set(ledger.cases.map(item => item.caseId)),
        tests: new Set(uat.cases.map(item => item.id)),
        decisions: new Set(decisions.decisions.map(item => item.id))
      };
      if (type === 'evidence' ? !fs.existsSync(ref) : !known[type]?.has(ref)) fail('TRACE-ZIEL-FEHLT', `${type}/${ref}`);
    }
  }
}
if (actual.exceptions.length < 3) fail('AUSNAHMEN', 'Mindestens drei realistische Ausnahmen sind erforderlich.');
for (const item of actual.exceptions) {
  for (const field of ['finding', 'cause', 'correction', 'retest', 'decision', 'owner', 'decisionRef']) if (!item[field]) fail('AUSNAHME-FELD', `${item.id}/${field}`);
  if (item.status !== 'closed-synthetic' || item.severity !== 'P2') fail('AUSNAHME-STATUS', item.id);
}
const task = actual.ticketProjection;
if (task.id !== 'UABC-51' || task.type !== 'task' || !story.tickets.some(ticket => ticket.id === task.parent && ticket.type === 'story')) fail('TICKET-HIERARCHIE', `${task.id}->${task.parent}`);
if (!/^UABC-[1-9]\d*$/.test(task.id) || task.summary.split(/\s+/).length > 3 || task.meetingTranscriptRefs?.length !== 1 || !fs.existsSync(`atlassian/confluence/meetings/${task.meetingTranscriptRefs[0]}.md`) || !task.deliverableRefs?.length || task.acceptanceCriteria?.length < 3) fail('TICKET-QUALITAET', task.id);
if (task.worklog.hours > 3 || task.worklog.netAmount > 360 || task.worklog.netAmount !== task.worklog.hours * task.worklog.hourlyRate || !task.worklog.syntheticApprovalOnly || task.worklog.invoiceStatus !== 'projektion-nicht-versendet') fail('M2-ABRECHNUNG', JSON.stringify(task.worklog));
if (actual.billing.cumulativeHours !== 81 || actual.billing.cumulativeNetAmount !== 9720 || actual.billing.cumulativeNetAmount >= actual.billing.overallCapNetAmount) fail('BUDGET', JSON.stringify(actual.billing));
const end = actual.closingControl;
const expectedEnd = {bank: 5440.3, inventoryQuantity: 49, inventoryValue: 2058, accountsReceivable: 0, accountsPayable: 0, inputVat: 79.8, outputVat: 150.1, trialBalanceDebit: 11080.2, trialBalanceCredit: 11080.2};
for (const [key, value] of Object.entries(expectedEnd)) if (round(end[key]) !== value) fail('ENDKONTROLLE', `${key}=${end[key]} statt ${value}`);
if (round(end.outputVat - end.inputVat) !== 70.3 || actual.truthBoundary.vatTransmitted !== false || actual.truthBoundary.realCustomerApprovalClaimed !== false || actual.materialization.twinVisible !== false) fail('WAHRHEITSGRENZE', 'UStVA, reale Freigabe oder Twin-Aktivierung unzulaessig.');

if (errors.length) {
  console.error(`V4-Betriebsjournal-Pruefung fehlgeschlagen (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('V4-Betriebsjournal bestanden: 22 Tage, 5 geschlossene P2-Ausnahmen, 81 h/9.720 EUR, Endkontrollen differenzfrei, V3 current unveraendert.');

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import YAML from 'yaml';

const sourcePath = 'project/bc-basic/operating-cycle-v4.yaml';
const targetPath = 'evidence/simulation/operating-cycle-v4.json';
const round = value => Number(value.toFixed(2));
const asDate = value => value instanceof Date ? value.toISOString().slice(0, 10) : `${value}`;
const unique = values => [...new Set(values)];

export function buildOperatingCycle(source) {
  const balances = {
    bank: source.openingControl.bank,
    inventoryQuantity: source.openingControl.inventoryQuantity,
    inventoryValue: source.openingControl.inventoryValue,
    accountsReceivable: source.openingControl.accountsReceivable,
    accountsPayable: source.openingControl.accountsPayable,
    inputVat: source.openingControl.inputVat,
    outputVat: source.openingControl.outputVat,
    trialBalanceDebit: source.openingControl.trialBalanceDebit,
    trialBalanceCredit: source.openingControl.trialBalanceCredit
  };
  const exceptionsByDate = new Map((source.exceptions ?? []).map(item => [asDate(item.date), item]));
  const reverse = new Map();
  const journalRecords = source.days.map((day, index) => {
    const date = asDate(day.date);
    const recordId = `UABC-V4-DAY-${String(index + 1).padStart(3, '0')}`;
    const opening = {...balances};
    let debit = 0;
    let credit = 0;
    for (const posting of day.postings ?? []) {
      const postingDebit = Number(posting.debit ?? 0);
      const postingCredit = Number(posting.credit ?? 0);
      debit = round(debit + postingDebit);
      credit = round(credit + postingCredit);
      const delta = round(postingDebit - postingCredit);
      if (posting.account === 'Bank') balances.bank = round(balances.bank + delta);
      if (posting.account === 'Bestand') {
        balances.inventoryValue = round(balances.inventoryValue + delta);
        balances.inventoryQuantity += Number(posting.quantityDelta ?? 0);
      }
      if (posting.account === 'Debitoren') balances.accountsReceivable = round(balances.accountsReceivable + delta);
      if (posting.account === 'Kreditoren') balances.accountsPayable = round(balances.accountsPayable - delta);
      if (posting.account === 'Vorsteuer 19%') balances.inputVat = round(balances.inputVat + delta);
      if (posting.account === 'Umsatzsteuer 19%') balances.outputVat = round(balances.outputVat - delta);
    }
    balances.trialBalanceDebit = round(balances.trialBalanceDebit + debit);
    balances.trialBalanceCredit = round(balances.trialBalanceCredit + credit);
    const profileValues = (day.profiles ?? []).map(profile => {
      if (!source.traceProfiles[profile]) throw new Error(`Unbekanntes Trace-Profil ${profile} am ${date}.`);
      return source.traceProfiles[profile];
    });
    const refs = {
      tickets: unique(profileValues.flatMap(item => item.tickets ?? [])),
      meetings: unique(profileValues.flatMap(item => item.meetings ?? [])),
      processes: unique(profileValues.flatMap(item => item.processes ?? [])),
      tests: unique(profileValues.flatMap(item => item.tests ?? [])),
      decisions: unique(profileValues.flatMap(item => item.decisions ?? [])),
      evidence: [sourcePath, targetPath, 'evidence/simulation/pilot-v3-finance-ledger.json']
    };
    for (const [type, ids] of Object.entries(refs)) for (const id of ids) {
      const objectKey = `${type}:${id}`;
      const records = reverse.get(objectKey) ?? [];
      records.push(recordId);
      reverse.set(objectKey, records);
    }
    const exception = exceptionsByDate.get(date) ?? null;
    return {
      recordId,
      date,
      state: day.state,
      activity: day.activity,
      roles: {owner: day.owner, controller: day.controller},
      documents: day.documents ?? [],
      postings: day.postings ?? [],
      openingBalances: opening,
      closingBalances: {...balances},
      controls: {
        dailyDebit: debit,
        dailyCredit: credit,
        dailyDifference: round(debit - credit),
        trialBalanceDifference: round(balances.trialBalanceDebit - balances.trialBalanceCredit),
        noUnplannedPosting: (day.postings ?? []).length === 0
      },
      exceptionRef: exception?.id ?? null,
      traceability: refs,
      syntheticAcceptance: true,
      realApprovalClaimed: false
    };
  });
  const traceabilityEdges = [];
  for (const record of journalRecords) for (const [type, ids] of Object.entries(record.traceability)) for (const id of ids) {
    traceabilityEdges.push({from: record.recordId, to: id, relation: `verweist-auf-${type}`});
    traceabilityEdges.push({from: id, to: record.recordId, relation: 'belegt-betriebstag'});
  }
  return {
    schemaVersion: 1,
    journalId: source.journalId,
    projectId: source.projectId,
    classification: source.classification,
    period: {start: asDate(source.period.start), end: asDate(source.period.end)},
    truthBoundary: source.truthBoundary,
    v3Baseline: source.baseline,
    ticketProjection: source.extensionTask,
    billing: source.billing,
    openingControl: source.openingControl,
    journalRecords,
    exceptions: (source.exceptions ?? []).map(item => ({...item, date: asDate(item.date)})),
    traceability: {
      contract: 'bidirectional-day-object-v1',
      edges: traceabilityEdges,
      reverseIndex: Object.fromEntries([...reverse.entries()].sort(([left], [right]) => left.localeCompare(right)))
    },
    closingControl: {...balances},
    materialization: {
      canonicalSource: sourcePath,
      generatedEvidence: targetPath,
      twinVisible: false,
      activationGate: 'UABC-M4'
    }
  };
}

export function readOperatingCycleSource(file = sourcePath) {
  return YAML.parse(fs.readFileSync(file, 'utf8'));
}

export function writeOperatingCycle(file = targetPath) {
  const result = buildOperatingCycle(readOperatingCycleSource());
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  return result;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = writeOperatingCycle();
  console.log(`V4-Betriebsjournal materialisiert: ${result.journalRecords.length} Tagesrecords, ${result.exceptions.length} Ausnahmen, ${result.traceability.edges.length} Traceability-Kanten.`);
}

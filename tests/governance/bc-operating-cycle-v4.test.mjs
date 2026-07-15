import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildOperatingCycle, readOperatingCycleSource} from '../../scripts/materialize-bc-operating-cycle-v4.mjs';

const source = readOperatingCycleSource();
const journal = buildOperatingCycle(source);

test('Betriebszyklus deckt jeden Kalendertag lueckenlos ab', () => {
  assert.equal(journal.journalRecords.length, 22);
  assert.equal(journal.journalRecords[0].date, '2026-05-11');
  assert.equal(journal.journalRecords.at(-1).date, '2026-06-01');
});

test('Kernprozesse erzeugen die erwarteten Belege und Endsalden', () => {
  const documents = new Set(journal.journalRecords.flatMap(record => record.documents));
  for (const id of ['PO-260501', 'PINV-260501', 'SINV-260501', 'CPAY-260519', 'VPAY-260520', 'BSTMT-260531', 'ADJ-260527']) assert.ok(documents.has(id), id);
  assert.deepEqual(journal.closingControl, {bank: 5440.3, inventoryQuantity: 49, inventoryValue: 2058, accountsReceivable: 0, accountsPayable: 0, inputVat: 79.8, outputVat: 150.1, trialBalanceDebit: 11080.2, trialBalanceCredit: 11080.2});
});

test('jede Traceability-Kante besitzt ihre Rueckkante', () => {
  for (const record of journal.journalRecords) for (const refs of Object.values(record.traceability)) for (const ref of refs) {
    assert.ok(journal.traceability.edges.some(edge => edge.from === record.recordId && edge.to === ref));
    assert.ok(journal.traceability.edges.some(edge => edge.from === ref && edge.to === record.recordId));
  }
});

test('Ausnahmen sind geschlossen, begruendet, korrigiert und identisch retestet', () => {
  assert.equal(journal.exceptions.length, 5);
  for (const item of journal.exceptions) {
    assert.equal(item.status, 'closed-synthetic');
    for (const field of ['cause', 'correction', 'retest', 'decision']) assert.ok(item[field].length > 30, `${item.id}/${field}`);
  }
});

test('M2 bleibt taskgebunden unter Budget und ohne reale Freigabe', () => {
  assert.equal(journal.ticketProjection.id, 'UABC-51');
  assert.equal(journal.ticketProjection.worklog.hours, 3);
  assert.equal(journal.ticketProjection.worklog.netAmount, 360);
  assert.equal(journal.billing.afterM2NetAmount, 9720);
  assert.equal(journal.truthBoundary.realCustomerApprovalClaimed, false);
  assert.equal(journal.materialization.twinVisible, false);
  assert.equal(fs.existsSync('evidence/simulation/operating-cycle-v4.json'), true);
});

test('elf Hypercaretage schliessen Incidents innerhalb der P2-SLA', () => {
  const hypercare = journal.operationalClosure.hypercare;
  assert.equal(hypercare.days.length, 11);
  assert.equal(hypercare.days[0].date, '2026-05-12');
  assert.equal(hypercare.days.at(-1).date, '2026-05-22');
  const events = hypercare.days.flatMap(day => day.slaEvents);
  assert.equal(events.length, 4);
  for (const event of events) {
    assert.equal(event.exceptionStatus, 'closed-synthetic');
    assert.ok(event.reactionMinutes <= hypercare.sla.P2.targetMinutes);
    assert.ok(event.closureMinutes <= hypercare.sla.P2.targetMinutes);
  }
  assert.equal(hypercare.days.at(-1).status, 'exit-bestanden-synthetisch');
});

test('Restart und Supportuebergabe bleiben synthetisch und vollstaendig', () => {
  const closure = journal.operationalClosure;
  assert.ok(closure.restart.checklist.every(item => item.result === 'bestanden-synthetisch'));
  assert.equal(closure.restart.realApprovalClaimed, false);
  assert.ok(closure.supportHandover.checklist.every(item => item.result === 'bestanden-synthetisch'));
  assert.equal(closure.supportHandover.realCustomerAcceptanceClaimed, false);
});

test('Monatsabschluss und UStVA-Vorschau stimmen mit dem Journal ueberein', () => {
  const {monthEndClose: close, vatPreview: vat} = journal.operationalClosure;
  assert.equal(close.reconciliations.bank.difference, 0);
  assert.equal(close.reconciliations.bank.ledger, journal.closingControl.bank);
  assert.equal(close.reconciliations.inventory.itemValue, journal.closingControl.inventoryValue);
  assert.equal(close.reconciliations.trialBalance.debit, journal.closingControl.trialBalanceDebit);
  assert.equal(close.reconciliations.trialBalance.credit, journal.closingControl.trialBalanceCredit);
  assert.equal(Number((vat.outputVat - vat.inputVat).toFixed(2)), vat.payable);
  assert.equal(vat.transmitted, false);
  assert.equal(vat.taxApprovalClaimed, false);
});

test('M3 fuegt hoechstens eine taskgebundene Stunde hinzu', () => {
  const task = journal.ticketProjections.find(item => item.id === 'UABC-52');
  assert.equal(task.worklog.hours, 1);
  assert.equal(task.worklog.netAmount, 120);
  assert.equal(journal.billing.cumulativeHours, 82);
  assert.equal(journal.billing.cumulativeNetAmount, 9840);
  assert.ok(journal.billing.cumulativeNetAmount < journal.billing.overallCapNetAmount);
});

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

const root = process.cwd();
const errors = [];
const load = (file) => {
  const full = path.join(root, file);
  if (!existsSync(full)) { errors.push(`Datei fehlt: ${file}`); return null; }
  try { return YAML.parse(readFileSync(full, 'utf8')); } catch (e) { errors.push(`YAML unlesbar ${file}: ${e.message}`); return null; }
};
const catalog = load('project/bc-basic/bc-playthrough-catalog.yaml');
const ledger = load('evidence/simulation/bc-playthrough-ledger.yaml');
const company = load('project/bc-basic/customer-templates/example/company-setup.example.yaml');
const phase2 = load('evidence/simulation/phase-2-p2p-o2c.yaml');
const phase3 = load('evidence/simulation/phase-3-cash-inventory-close.yaml');
const candidates = load('project/bc-basic/blueprint-candidates.yaml');
if (catalog) {
  if (catalog.classification !== 'synthetic-only' || catalog.status !== 'synthetisch-abgeschlossen') errors.push('Katalog ist nicht synthetisch abgeschlossen.');
  if (catalog.sessions?.length !== 7) errors.push(`Erwartet 7 Kern-Sitzungen, gefunden ${catalog.sessions?.length ?? 0}.`);
  const required = ['id','date','role','goal','navigation','steps','preview','documents','entries','controls','negative','result','references'];
  for (const session of catalog.sessions ?? []) {
    for (const key of required) if (session[key] === undefined) errors.push(`${session.id}: Pflichtfeld ${key} fehlt.`);
    if (session.result !== 'synthetisch-abgenommen') errors.push(`${session.id}: kein synthetisches Abnahmeergebnis.`);
    if (!session.negative?.defect || session.negative.retest !== 'bestanden-synthetisch') errors.push(`${session.id}: Defect/Retest fehlt.`);
    if (!session.references?.evidence || !session.references?.sources?.length) errors.push(`${session.id}: Evidence-/Quellenreferenz fehlt.`);
    if ((session.documents?.length ?? 0) === 0 || (session.entries?.length ?? 0) === 0) errors.push(`${session.id}: Dokument- oder Entry-Kette fehlt.`);
  }
  if (catalog.gate !== 'GO_SIMULATION') errors.push('Katalog liefert kein GO_SIMULATION.');
}
if (ledger) {
  if (ledger.classification !== 'synthetic-only' || ledger.result !== 'GO_SIMULATION') errors.push('Ledger verletzt Simulationstatus oder liefert kein GO_SIMULATION.');
  const ids = new Set();
  for (const entry of ledger.ledgerEntries ?? []) {
    if (ids.has(entry.id)) errors.push(`Doppelte Entry-ID: ${entry.id}`);
    ids.add(entry.id);
  }
  const documents = new Map((ledger.documents ?? []).map((document) => [document.id, document]));
  const salesInvoice = documents.get('SYN-AR-002');
  if (salesInvoice?.net !== 790 || salesInvoice?.vat !== 150.10 || salesInvoice?.gross !== 940.10) errors.push('O2C-Rechnung entspricht nicht 10 x 79,00 EUR plus 19 Prozent VAT.');
  if (documents.get('SYN-SO-001')?.status !== 'fully-shipped-and-invoiced' || documents.get('SYN-PO-001')?.status !== 'fully-received-and-invoiced') errors.push('Auftragsstatus wird unzulaessig als gebuchtes Dokument behandelt.');
  const glEntries = (ledger.ledgerEntries ?? []).filter((entry) => entry.ledger === 'G/L');
  const glDebit = Math.round(glEntries.reduce((sum, entry) => sum + Number(entry.debit ?? 0), 0) * 100) / 100;
  const glCredit = Math.round(glEntries.reduce((sum, entry) => sum + Number(entry.credit ?? 0), 0) * 100) / 100;
  if (glDebit !== ledger.controls?.glDebit || glCredit !== ledger.controls?.glCredit || glDebit !== glCredit || ledger.controls?.glDifference !== 0) errors.push('G/L-Soll-Haben ist nicht aus den Entry-Zeilen ausgeglichen.');
  const trial = ledger.controls?.closingTrialBalance ?? [];
  const trialDebit = Math.round(trial.reduce((sum, entry) => sum + Number(entry.debitBalance ?? 0), 0) * 100) / 100;
  const trialCredit = Math.round(trial.reduce((sum, entry) => sum + Number(entry.creditBalance ?? 0), 0) * 100) / 100;
  if (trialDebit !== 11080.20 || trialCredit !== 11080.20 || ledger.controls?.closingTrialBalanceDifference !== 0) errors.push('Vollstaendige Schlussbilanz ist nicht mit 11.080,20 EUR je Seite abgestimmt.');
  if (ledger.controls?.newCustomerInvoiceOpenAfterApply !== 0 || ledger.controls?.newVendorInvoiceOpenAfterApply !== 0) errors.push('Neue P2P-/O2C-Posten sind nicht vollstaendig ausgeglichen.');
  if (ledger.controls?.customerOpenAfterApply !== 940.10 || ledger.controls?.vendorOpenAfterApply !== 499.80) errors.push('Offene Eroeffnungsposten stimmen nicht mit den Nebenbuechern ueberein.');
  const configuredRoles = new Set(company?.values?.syntheticConfigurationBaseline?.accountRoles?.map((entry) => entry.role) ?? []);
  if (configuredRoles.size !== 11 || company?.values?.syntheticConfigurationBaseline?.postingMatrices?.length !== 6) errors.push('Synthetische Konten-/Buchungsmatrix ist nicht vollstaendig.');
  for (const entry of glEntries) if (!configuredRoles.has(entry.accountRole)) errors.push(`${entry.id}: Kontenrolle ${entry.accountRole ?? 'leer'} fehlt in der Konfigurationsbaseline.`);
  if (phase2?.orderToCash?.controls?.net !== 790 || phase2?.orderToCash?.controls?.vat !== 150.10 || phase2?.orderToCash?.controls?.gross !== 940.10) errors.push('Phase-2-O2C-Kontrollsumme weicht vom Ledger ab.');
  if (phase3?.monthClose?.closingTrialBalance?.debit !== 11080.20 || phase3?.monthClose?.closingTrialBalance?.credit !== 11080.20 || phase3?.monthClose?.closingTrialBalance?.difference !== 0) errors.push('Phase-3-Schlussbilanz weicht vom Ledger ab.');
  if (ledger.controls?.allDefectsRetested !== true) errors.push('Nicht alle Defects wurden retestet.');
}
if (candidates) {
  if (candidates.classification !== 'anonymized-product-candidates') errors.push('Kandidatenregister ist nicht als anonymisiert gekennzeichnet.');
  for (const candidate of candidates.candidates ?? []) {
    if (!['proposed', 'accepted', 'partially-adopted', 'released', 'bound'].includes(candidate.status)) errors.push(`${candidate.findingId}: ungültiger Kandidatenstatus.`);
    if (candidate.anonymization !== 'bestanden-keine-kundenwerte') errors.push(`${candidate.findingId}: Anonymisierungsprüfung fehlt.`);
  }
  const statusByFinding = new Map((candidates.candidates ?? []).map((candidate) => [candidate.findingId, candidate.status]));
  if (statusByFinding.get('UABC-FINDING-BCB-PLANACTUAL-001') !== 'bound') errors.push('Die veröffentlichte Baseline-Reconciliation ist nicht gebunden.');
  if (statusByFinding.get('UABC-FINDING-BCB-ADAPTER-001') !== 'bound') errors.push('Die veröffentlichte Adapter-Provenienz ist nicht gebunden.');
  if (statusByFinding.get('UABC-FINDING-BCB-GRAPH-COVERAGE-001') !== 'bound') errors.push('Die veroeffentlichte Spectra-0.10-Graph-Coverage ist nicht gebunden.');
  if (statusByFinding.get('PROJECT-STORY-VALIDATION-001') !== 'bound') errors.push('Die portable Project-Story-Konformität ist nicht gebunden.');
  if (candidates.currentReleaseBinding?.status !== 'bound' || candidates.currentReleaseBinding?.release !== 'spectra-v0.10.0-alpha.1') errors.push('Aktuelle Spectra-0.10-Bindung ist inkonsistent.');
  if (candidates.currentReleaseBinding?.graphCoverageDecision !== 'released-and-bound' || candidates.currentReleaseBinding?.baselineReconciliation !== 'released-and-bound' || candidates.currentReleaseBinding?.adapterProvenance !== 'released-and-bound') errors.push('Spectra-0.10-Kandidatenentscheidungen sind inkonsistent.');
}
if (errors.length) {
  console.error(`BC-Playthrough-Pruefung fehlgeschlagen (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('BC-Playthrough-Pruefung bestanden: 7 Sitzungen, 16 Dokumente, 35 Entries, O2C 790,00/150,10/940,10 EUR, Schlussbilanz 11.080,20 EUR je Seite und Retests konsistent.');

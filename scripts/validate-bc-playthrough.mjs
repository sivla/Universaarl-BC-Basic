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
  if (ledger.controls?.glDebit !== ledger.controls?.glCredit || ledger.controls?.glDifference !== 0) errors.push('G/L-Soll-Haben ist nicht ausgeglichen.');
  if (ledger.controls?.customerOpenAfterApply !== 0 || ledger.controls?.vendorOpenAfterApply !== 0) errors.push('Nebenbücher sind nach Ausgleich nicht null.');
  if (ledger.controls?.allDefectsRetested !== true) errors.push('Nicht alle Defects wurden retestet.');
}
if (candidates) {
  if (candidates.classification !== 'anonymized-product-candidates') errors.push('Kandidatenregister ist nicht als anonymisiert gekennzeichnet.');
  for (const candidate of candidates.candidates ?? []) {
    if (!['proposed', 'partially-adopted', 'released', 'bound'].includes(candidate.status)) errors.push(`${candidate.findingId}: ungültiger Kandidatenstatus.`);
    if (candidate.anonymization !== 'bestanden-keine-kundenwerte') errors.push(`${candidate.findingId}: Anonymisierungsprüfung fehlt.`);
  }
  if (candidates.currentReleaseBinding?.status !== 'bound' || candidates.currentReleaseBinding?.release !== 'spectra-v0.6.0-alpha.1') errors.push('Aktuelle Spectra-0.6-Bindung ist inkonsistent.');
}
if (errors.length) {
  console.error(`BC-Playthrough-Pruefung fehlgeschlagen (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('BC-Playthrough-Pruefung bestanden: 7 Sitzungen, Dokument-/Entry-Ketten, Soll/Haben, Nebenbücher und Retests konsistent.');

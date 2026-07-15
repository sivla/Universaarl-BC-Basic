import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import YAML from 'yaml';
import {buildOperatingCycle, readOperatingCycleSource} from './materialize-bc-operating-cycle-v4.mjs';
import {canonicalBundleDigest, sha256} from './lib/twin-catalog-digest.mjs';

const root = process.cwd();
const sourcePath = 'project/bc-basic/operating-cycle-v4.yaml';
const evidencePath = 'evidence/simulation/operating-cycle-v4.json';
const indexPath = 'exports/project-data/v1/index.yaml';
const snapshotsPath = 'exports/project-data/v1/snapshots';
const lf = value => `${value}`.replace(/\r\n/gu, '\n');
const bytes = value => Buffer.from(lf(value), 'utf8');
const money = value => `${Number(value).toFixed(2).replace('.', ',')} EUR`;
const safe = value => typeof value === 'string' && !path.isAbsolute(value) && !value.includes('\\') && value.split('/').every(part => part && part !== '.' && part !== '..');
const writeAtomic = (relative, content) => {
  const target = path.join(root, relative);
  const temporary = `${target}.tmp`;
  fs.mkdirSync(path.dirname(target), {recursive: true});
  fs.writeFileSync(temporary, content);
  fs.renameSync(temporary, target);
};

export function buildV4Documents(source, journal) {
  const close = journal.operationalClosure.monthEndClose.reconciliations;
  const vat = journal.operationalClosure.vatPreview;
  const billing = journal.billing;
  const incidents = journal.exceptions.map(item => `| ${item.id} | ${item.severity} | ${item.finding} | ${item.correction} | ${item.status} |`).join('\n');
  const hypercare = journal.operationalClosure.hypercare.days.map(item => `| ${item.date} | ${item.status} | ${item.incidentRefs.join(', ') || 'keiner'} | ${item.decision} | ${item.dayClose} |`).join('\n');
  const gates = source.projectClosure.realGates.map(item => `- ${item.id}: ${item.title} – **${item.status}**`).join('\n');
  const customer = `# Business Central Basic – Kundenhandbuch V4

## Zweck und Wahrheitsgrenze

Dieses Handbuch beschreibt den synthetisch durchgespielten ersten Betriebszyklus der Saarblick Handel & Service GmbH vom 11. Mai bis 1. Juni 2026. Es ist aus \`${sourcePath}\` erzeugt. Es belegt weder eine produktive Business-Central-Buchung noch eine reale Bankbestaetigung, Steueruebermittlung oder Kundenabnahme.

## Taeglicher Arbeitsweg

1. Vor dem Buchen Gesellschaft, Arbeitsdatum, Buchungsperiode und eigene Rolle pruefen.
2. Beleg vollstaendig erfassen und vor der Buchung Nummer, Menge, Preis, Lagerort und MwSt.-Buchungsgruppe kontrollieren.
3. Buchungsvorschau lesen; nach der simulierten Buchung Beleg, Nebenbuch, Sachposten, Artikelposten und Wertposten per Drill-down abstimmen.
4. Eine Differenz sofort als Incident erfassen. Erst nach Ursache, Korrektur und identischem Retest weiterarbeiten.
5. Tagesabschluss mit verantwortlicher und kontrollierender Rolle dokumentieren.

## Einkauf

- Bestellung \`PO-260501\`, Wareneingang \`PRE-260501\`, Rechnung \`PINV-260501\`.
- 10 Stück zu 42,00 EUR ergeben ${money(420)} netto, ${money(79.8)} Vorsteuer und ${money(499.8)} Kreditor.
- Kontrolle: Bestand und Vorsteuer im Soll, Kreditor im Haben; Tagesdifferenz 0,00 EUR.

## Verkauf

- Auftrag \`SO-260501\`, Lieferung \`SHP-260501\`, Rechnung \`SINV-260501\`.
- 10 Stück zu 79,00 EUR ergeben ${money(790)} netto, ${money(150.1)} Umsatzsteuer und ${money(940.1)} Debitor.
- Der Wareneinsatz beträgt ${money(420)}; Menge und Wert werden im Lager kontrolliert.

## Zahlungen und Bank

- Kundenzahlung \`CPAY-260519\`: ${money(940.1)}, Debitor danach 0,00 EUR.
- Lieferantenzahlung \`VPAY-260520\`: ${money(499.8)}, Kreditor danach 0,00 EUR.
- Kontoauszug \`BSTMT-260531\`: Bankanfang ${money(5000)}, Endbestand ${money(close.bank.ledger)}, Differenz 0,00 EUR.

## Lager und Inventur

Die Inventur \`PHY-260527\` ergab 49 statt 50 Stück. Mit \`ADJ-260527\` wurde ein Stück zu 42,00 EUR korrigiert. Endbestand: ${close.inventory.itemQuantity} Stück und ${money(close.inventory.itemValue)}; Mengen- und Wertdifferenz jeweils null.

## Hypercare und Support

| Datum | Status | Incident | Entscheidung | Tagesabschluss |
| --- | --- | --- | --- | --- |
${hypercare}

Support nimmt einen Vorgang mit Belegnummer, Datum, Rolle, beobachtetem Ergebnis, Erwartung, Betrag oder Menge und Screenshot-/Evidence-Referenz an. P1 stoppt sofort; P2 blockiert den betroffenen Prozess bis zum identischen Retest; P3 wird im naechsten Daily entschieden.

## Monatsabschluss und UStVA-Vorschau

- Debitoren: Nebenbuch 0,00 EUR, Sachbuch 0,00 EUR, Differenz 0,00 EUR.
- Kreditoren: Nebenbuch 0,00 EUR, Sachbuch 0,00 EUR, Differenz 0,00 EUR.
- Bank: ${money(close.bank.statement)} laut Auszug und ${money(close.bank.ledger)} im Ledger.
- Lager: ${close.inventory.itemQuantity} Stück und ${money(close.inventory.itemValue)}.
- Summen- und Saldenliste: Soll und Haben jeweils ${money(close.trialBalance.debit)}.
- UStVA-Vorschau: ${money(vat.outputVat)} Umsatzsteuer minus ${money(vat.inputVat)} Vorsteuer gleich ${money(vat.payable)} Zahllast.

Die Vorschau wurde nicht übermittelt und ist keine Steuerberatung oder reale Steuerfreigabe.

## Weiterhin offene reale Gates

${gates}

## Referenzen

\`UABC-51\`, \`UABC-52\`, \`UABC-53\`, \`UABC-MTG-012\`, \`${evidencePath}\`.
`;
  const consultant = `# Business Central Basic – Consultant-Handbuch V4

## Einsatzregel

Dieses Runbook materialisiert den repositorybasierten V4-Betriebszyklus. Die kanonische Quelle ist \`${sourcePath}\`; Handbuch, Evidence und Katalog duerfen keine abweichenden Werte enthalten. Live-Tenant, Bank, ELSTER und reale Kundenkommunikation sind nicht Teil dieses Nachweises.

## Vorbereitung und Kontrollpunkte

1. Projekt-, Gesellschafts-, Rollen- und Periodenkontext lesen.
2. Anfangskontrollen sichern: Bank ${money(source.openingControl.bank)}, Lager ${source.openingControl.inventoryQuantity} Stück/${money(source.openingControl.inventoryValue)}, Debitoren und Kreditoren 0,00 EUR, Trial Balance ${money(source.openingControl.trialBalanceDebit)} beidseitig.
3. P2P, O2C, Zahlung, Bank und Lager nur mit den kanonischen Belegnummern durchspielen.
4. Pro Vorgang Buchungsvorschau, Beleg, Nebenbuch, Sachposten, MwSt.-Posten, Artikelposten und Wertposten zuruecklesen.
5. Kein Folgetor bei Differenz ungleich null oder offenem P1/P2.

## Buchungswirkungen

| Vorgang | Soll | Haben | Kontrolle |
| --- | --- | --- | --- |
| P2P | Bestand 420,00; Vorsteuer 79,80 | Kreditor 499,80 | Differenz 0,00 |
| O2C | Debitor 940,10; Wareneinsatz 420,00 | Umsatz 790,00; Umsatzsteuer 150,10; Bestand 420,00 | Differenz 0,00 |
| Kundenzahlung | Bank 940,10 | Debitor 940,10 | Restbetrag 0,00 |
| Lieferantenzahlung | Kreditor 499,80 | Bank 499,80 | Restbetrag 0,00 |
| Inventurdifferenz | Inventurdifferenzen 42,00 | Bestand 42,00 | 49 Stück/${money(close.inventory.itemValue)} |

## Incident- und Retestverfahren

| ID | Klasse | Befund | Korrektur | Status |
| --- | --- | --- | --- | --- |
${incidents}

Zeitfolge je P2: melden, reagieren, Ursache sichern, korrigieren, dieselbe Ausgangslage retesten, Kontrollsummen lesen, Entscheidung dokumentieren, erst dann schliessen. Das Reaktions- und Abschlussziel betraegt im V4-Fall höchstens 240 Minuten.

## Restart

Der operative Restart am ${journal.operationalClosure.restart.date} verwendet \`${journal.operationalClosure.restart.lastKnownGood}\` als letzte differenzfreie Baseline. Benutzer, Rollen, Buchungsperiode, Kernprozesse und Ledgerkontrollen werden gelesen. Bei Abweichung gilt: ${journal.operationalClosure.restart.resetPath}.

## Monatsabschluss

1. Buchungsstichtag und Periode kontrollieren.
2. Debitoren und Kreditoren gegen Sachbuch abstimmen.
3. Bankauszug ${money(close.bank.statement)} gegen Bankledger ${money(close.bank.ledger)} abstimmen.
4. ${close.inventory.itemQuantity} Stück/${money(close.inventory.itemValue)} aus Artikel-/Wertposten gegen Sachbuch abstimmen.
5. Umsatzsteuer ${money(vat.outputVat)} und Vorsteuer ${money(vat.inputVat)} gegen MwSt.-Posten abstimmen.
6. Trial Balance Soll/Haben ${money(close.trialBalance.debit)} und Differenz null nachweisen.
7. UStVA nur als Vorschau erzeugen; keine Übermittlung und keine Steuerfreigabe behaupten.

## Abrechnung und Abschluss

V3: 78 Stunden/${money(9360)}. V4-Aufgaben \`UABC-51\` bis \`UABC-53\`: 5 Stunden/${money(600)}. Kumuliert: ${billing.cumulativeHours} Stunden/${money(billing.cumulativeNetAmount)}. Nur Task-Worklogs sind fakturierbar; alle Rechnungsprojektionen bleiben nicht versendet.

## Katalogübergabe

Der Generator schreibt relative Payloadpfade, Einzelhashes, Bundle- und Katalog-Aggregatdigest. Erst nach Stagingvalidierung wird \`exports/project-data/v1/snapshots/current.json\` atomar auf V4 gesetzt. Runtime: nur lesend, \`requiresGit=false\`.
`;
  const support = `# BC Basic V4 – Supportübergabe

## Übergabestatus

- Projekt: \`${source.projectId}\`
- Zeitraum: ${journal.period.start} bis ${journal.period.end}
- Status: abgeschlossen-synthetisch
- Supportannahme: bestanden-synthetisch
- Reale Kundenabnahme: nicht behauptet
- Letzte bekannte gute Hypercare-Baseline: \`${journal.operationalClosure.restart.lastKnownGood}\`

## Betriebswerte

Bank ${money(close.bank.ledger)}, Lager ${close.inventory.itemQuantity} Stück/${money(close.inventory.itemValue)}, Debitoren 0,00 EUR, Kreditoren 0,00 EUR, Trial Balance ${money(close.trialBalance.debit)} beidseitig, UStVA-Vorschau ${money(vat.payable)} ohne Übermittlung.

## Incidentüberblick

${journal.exceptions.length} P2-Ausnahmen sind mit Ursache, Korrektur, identischem Retest und Entscheidung synthetisch geschlossen. Offene P1: 0. Offene P2: 0. Die vollständigen Details stehen in \`${evidencePath}\`.

## Annahmecheckliste

${journal.operationalClosure.supportHandover.checklist.map(item => `- [x] ${item.id}: ${item.check}`).join('\n')}

## Supportweg

P1 stoppt den Betriebspfad sofort und eskaliert an Projektleitung und Sponsorrolle. P2 blockiert den betroffenen Kernprozess bis Korrektur und identischem Retest. P3 wird im naechsten Daily bewertet. Jede Anfrage nennt Kunde, Projekt, Gesellschaft, Rolle, Datum, Beleg, erwartetes und beobachtetes Ergebnis sowie Evidence-Referenz.

## Offene reale Gates

${gates}

## Katalogzugriff

Project Twin liest ausschließlich den relativen Zeiger \`exports/project-data/v1/snapshots/current.json\`. Der Katalog ist portabel, nur lesend und benötigt kein Git. Ein Rückschreibpfad ist nicht vorhanden.
`;
  const projectClose = `# BC Basic V4 – Projektabschluss

## Ergebnis

Der synthetische BC-Basic-Pilot ist vom Cutover bis zur Supportübergabe lückenlos materialisiert. 22 Kalendertage, elf Hypercaretage, fünf geschlossene P2-Ausnahmen, Restart, Monatsabschluss und UStVA-Vorschau sind aus derselben Quelle belegt. Reale Produktivsetzung und reale Kundenabnahme werden nicht behauptet.

## Abschlusszahlen

| Kennzahl | Ergebnis |
| --- | ---: |
| Iststunden V3 | 78 |
| V4-Zusatzstunden | 5 |
| Gesamtstunden | ${billing.cumulativeHours} |
| Gesamtbetrag netto | ${money(billing.cumulativeNetAmount)} |
| Budgetgrenze netto | ${money(billing.overallCapNetAmount)} |
| Offene P1/P2 in der Simulation | 0 |
| Trial Balance Soll/Haben | ${money(close.trialBalance.debit)} |
| UStVA-Vorschau | ${money(vat.payable)} |

## Lieferobjekte

- Kundenhandbuch \`docs/guides/bc-basic-v4-customer-handbook.md\`
- Consultant-Handbuch \`docs/runbooks/bc-basic-v4-consultant-handbook.md\`
- Supportübergabe \`docs/handover/bc-basic-v4-support-handover.md\`
- Betriebsjournal \`${evidencePath}\`
- Portabler unveränderlicher V4-Katalog \`${source.catalog.releaseId}\`

## Abnahmegrenze

Die automatische Repositorypolicy akzeptiert ausschließlich den synthetischen Nachweis. Kundenannahme, Bankbestaetigung, Steuerfreigabe, ELSTER-Übermittlung, produktive Buchung und Produktivstart bleiben außerhalb.

## Offene reale Gates

${gates}

## Traceability

Abschluss-Task \`UABC-53\`, Handover-Task \`UABC-50\`, Meetingtranskript \`UABC-MTG-012\`, Entscheidungen \`UABC-DEC-BCB-010\` und \`UABC-DEC-BCB-011\`, Deliverables \`UABC-DEL-BCB-007\` bis \`UABC-DEL-BCB-009\`.
`;
  return new Map([
    ['docs/guides/bc-basic-v4-customer-handbook.md', customer],
    ['docs/runbooks/bc-basic-v4-consultant-handbook.md', consultant],
    ['docs/handover/bc-basic-v4-support-handover.md', support],
    ['docs/reports/bc-basic-v4-project-close.md', projectClose]
  ]);
}

export function buildV4Index(source, existingIndex) {
  const ownedIds = new Set(source.catalog.generatedArtifacts.map(artifact => artifact.id));
  const ownedPaths = new Set(source.catalog.generatedArtifacts.map(artifact => artifact.path));
  const artifacts = (existingIndex.artifacts ?? []).filter(item => !ownedIds.has(item.id) && !ownedPaths.has(item.path));
  for (const artifact of source.catalog.generatedArtifacts) {
    artifacts.push({id: artifact.id, kindId: artifact.kind, kind: artifact.kind, path: artifact.path, format: artifact.path.endsWith('.json') ? 'json' : artifact.path.endsWith('.yaml') ? 'yaml' : 'markdown', required: true, references: artifact.references});
  }
  const jiraRefs = [...new Set([...(existingIndex.referenceDefinitions?.jiraRefs ?? []), 'UABC-51', 'UABC-52', 'UABC-53'])];
  return {
    ...existingIndex,
    artifacts,
    referenceDefinitions: {...existingIndex.referenceDefinitions, jiraRefs},
    catalogModel: {
      ...existingIndex.catalogModel,
      projects: [{projectId: source.catalog.projectId, projectType: 'implementation', status: 'simulated-complete', sourcePath: evidencePath}],
      supportEngagements: [{engagementId: 'UABC-SUPPORT-HANDOVER-001', mode: 'simulated-handover', status: 'simulated-complete', projectId: source.catalog.projectId, sourcePath: 'docs/handover/bc-basic-v4-support-handover.md'}]
    },
    runtime: {reader: 'project-twin', requiresGit: false, readOnly: true, entryPoint: 'exports/project-data/v1/snapshots/current.json'},
    activeCatalog: {releaseId: source.catalog.releaseId, sourcePath, evidencePath, status: 'validated-final'},
    artifactCount: artifacts.length
  };
}

const internal = new Set(['docs/research/sources.yaml', 'evidence/simulation/adapter-provenance.json', 'evidence/simulation/reference-graph-coverage.json', 'evidence/verification-register.yaml', 'exports/project-data/v1/document-catalog.json', 'exports/project-data/v1/reference-graph-mapping.json', 'exports/project-data/v1/reference-simulation.json', 'governance/production-readiness.json', 'project/bc-basic/reference-simulation.yaml']);
const visibleArtifacts = index => (index.artifacts ?? []).filter(item => safe(item.path) && !internal.has(item.path) && !/^(scripts|tests|openspec|governance\/schemas)\//u.test(item.path) && !/^exports\/project-data\/v1\/snapshots\//u.test(item.path) && !/^(package\.json|package-lock\.json|REVIEW\.md)$/u.test(item.path));
export const aggregateDigest = (indexDigest, resourceDigest, bundleDigest) => sha256(Buffer.from(`project-index.yaml\0${indexDigest}\nresource-catalog.json\0${resourceDigest}\npayload-bundle\0${bundleDigest}\n`, 'utf8'));

function equalTrees(left, right) {
  const walk = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.relative(directory === left || directory === right ? directory : '', path.join(directory, entry.name))]);
  const list = base => {
    const result = [];
    const visit = (directory, prefix = '') => { for (const entry of fs.readdirSync(directory, {withFileTypes: true})) { const relative = prefix ? `${prefix}/${entry.name}` : entry.name; if (entry.isDirectory()) visit(path.join(directory, entry.name), relative); else result.push(relative); } };
    visit(base); return result.sort();
  };
  const leftFiles = list(left); const rightFiles = list(right);
  return JSON.stringify(leftFiles) === JSON.stringify(rightFiles) && leftFiles.every(relative => fs.readFileSync(path.join(left, relative)).equals(fs.readFileSync(path.join(right, relative))));
}

export function finalizeV4() {
  const source = readOperatingCycleSource(sourcePath);
  const journal = buildOperatingCycle(source);
  const evidenceBytes = Buffer.from(`${JSON.stringify(journal, null, 2)}\n`, 'utf8');
  writeAtomic(evidencePath, evidenceBytes);
  const documents = buildV4Documents(source, journal);
  for (const [relative, content] of documents) writeAtomic(relative, bytes(content));
  const currentIndex = YAML.parse(fs.readFileSync(path.join(root, indexPath), 'utf8'));
  const index = buildV4Index(source, currentIndex);
  writeAtomic(indexPath, bytes(YAML.stringify(index)));

  const releaseId = source.catalog.releaseId;
  const releaseDir = path.join(root, snapshotsPath, 'releases', releaseId);
  const staging = path.join(root, snapshotsPath, 'releases', `.staging-${releaseId}`);
  fs.rmSync(staging, {recursive: true, force: true});
  fs.mkdirSync(staging, {recursive: true});
  const artifacts = visibleArtifacts(index);
  for (const required of source.catalog.generatedArtifacts) if (!artifacts.some(item => item.id === required.id && item.path === required.path)) throw new Error(`V4-Pflichtartefakt fehlt: ${required.id}`);
  const indexData = {...index, artifacts, artifactCount: artifacts.length, runtime: {...index.runtime, requiresGit: false, readOnly: true}};
  const indexBytes = bytes(YAML.stringify(indexData));
  fs.writeFileSync(path.join(staging, 'project-index.yaml'), indexBytes);
  const records = [];
  for (const artifact of artifacts) {
    if (!safe(artifact.path)) throw new Error(`Unsicherer V4-Quellpfad: ${artifact.path}`);
    const sourceFile = path.join(root, artifact.path);
    if (!fs.existsSync(sourceFile) || !fs.statSync(sourceFile).isFile()) throw new Error(`V4-Quellartefakt fehlt: ${artifact.path}`);
    const payloadBytes = bytes(fs.readFileSync(sourceFile, 'utf8'));
    const payloadPath = `payload/${artifact.path}`;
    const target = path.join(staging, payloadPath);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, payloadBytes);
    const catalogType = artifact.id.startsWith('UABC-V4-') ? artifact.kind : 'fachartefakt';
    records.push({id: artifact.id, kind: catalogType, domainType: catalogType, sourcePath: artifact.path, payloadPath, sizeBytes: payloadBytes.length, sha256: sha256(payloadBytes), visibility: 'nur-lesend', references: artifact.references ?? []});
  }
  const domainTypes = [...new Set(records.map(record => record.domainType))].sort();
  const resourceCatalog = {schemaVersion: 3, catalogId: source.catalog.catalogId, customerId: source.catalog.customerId, projectId: source.catalog.projectId, readOnly: true, requiresGit: false, resources: records.map(record => ({resourceId: record.id, relativePath: record.payloadPath, type: record.kind, domainType: record.domainType, title: record.sourcePath, digest: record.sha256, sizeBytes: record.sizeBytes, references: record.references, visibility: record.visibility}))};
  const resourceBytes = Buffer.from(`${JSON.stringify(resourceCatalog, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(staging, 'resource-catalog.json'), resourceBytes);
  const payloadBundleDigest = canonicalBundleDigest(records);
  const projectIndexSha256 = sha256(indexBytes);
  const resourceCatalogSha256 = sha256(resourceBytes);
  const catalogAggregateDigest = aggregateDigest(projectIndexSha256, resourceCatalogSha256, payloadBundleDigest);
  const manifest = {
    schemaVersion: 3, manifestContract: source.catalog.manifestContract, releaseId, immutable: true, readOnly: true,
    customerId: source.catalog.customerId, projects: indexData.catalogModel.projects, supportEngagements: indexData.catalogModel.supportEngagements,
    projectIndexPath: 'project-index.yaml', resourceCatalogPath: 'resource-catalog.json',
    projectIndex: {path: 'project-index.yaml', sizeBytes: indexBytes.length, sha256: projectIndexSha256},
    resourceCatalog: {path: 'resource-catalog.json', sizeBytes: resourceBytes.length, sha256: resourceCatalogSha256},
    artifactCount: records.length, records, payloadBundleDigest, catalogAggregateDigest, aggregateContract: 'project-index-resource-catalog-payload-bundle-v1', digestAlgorithm: 'SHA-256', domainTypes,
    spectraBinding: {productId: 'spectra', repositoryUrl: 'https://github.com/sivla/BCProjectOS.git', releaseVersion: '1.0.0', releaseTag: 'spectra-v1.0.0', bindingStatus: 'BOUND'},
    producerHandoff: {projectId: 'blueprint', branch: 'codex/universaarl-projekt', commitBinding: 'control-center-handoff', runtimeCommitRequired: false},
    runtime: {requiresGit: false, readOnly: true, currentPointer: 'exports/project-data/v1/snapshots/current.json'}
  };
  const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(staging, 'manifest.json'), manifestBytes);
  for (const record of records) { const payload = fs.readFileSync(path.join(staging, record.payloadPath)); if (payload.length !== record.sizeBytes || sha256(payload) !== record.sha256) throw new Error(`V4-Payloaddigest driftet: ${record.id}`); }
  if (canonicalBundleDigest(records) !== payloadBundleDigest || aggregateDigest(sha256(indexBytes), sha256(resourceBytes), payloadBundleDigest) !== catalogAggregateDigest) throw new Error('V4-Bundle- oder Aggregatdigest driftet.');
  if (source.catalog.requiresGit !== false || manifest.runtime.requiresGit !== false || resourceCatalog.requiresGit !== false) throw new Error('V4-Katalog ist nicht Git-unabhaengig.');
  if (fs.existsSync(releaseDir)) {
    if (!equalTrees(staging, releaseDir)) throw new Error(`Unveraenderlicher V4-Release existiert mit abweichenden Bytes: ${releaseId}`);
    fs.rmSync(staging, {recursive: true, force: true});
  } else fs.renameSync(staging, releaseDir);
  const pointer = {schemaVersion: 1, pointerContract: source.catalog.pointerContract, customerId: source.catalog.customerId, currentReleaseId: releaseId, releasePath: `${snapshotsPath}/releases/${releaseId}`, manifestPath: `${snapshotsPath}/releases/${releaseId}/manifest.json`, manifestSha256: sha256(manifestBytes), payloadBundleDigest, catalogAggregateDigest, artifactCount: records.length, readOnly: true, requiresGit: false, bindingStatus: 'BOUND_BCPROJECTOS_RELEASE', updatedAt: source.catalog.generatedAt};
  const pointerBytes = Buffer.from(`${JSON.stringify(pointer, null, 2)}\n`, 'utf8');
  writeAtomic(`${snapshotsPath}/current-v4.candidate.json`, pointerBytes);
  writeAtomic(`${snapshotsPath}/current.json`, pointerBytes);
  return {source, journal, documents, index, manifest, pointer};
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = finalizeV4();
  console.log(`V4-Katalog atomar aktiviert: ${result.pointer.currentReleaseId}; ${result.pointer.artifactCount} Artefakte; Manifest ${result.pointer.manifestSha256}; Bundle ${result.pointer.payloadBundleDigest}; Aggregat ${result.pointer.catalogAggregateDigest}.`);
}

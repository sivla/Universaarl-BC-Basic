import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';
import { buildPortableArtifacts, buildProjectBundle, PORTABLE_RELEASE_SCHEMA_PATH, PORTABLE_SCHEMA_PATH, PORTABLE_SOURCE_PATH, PROJECT_INDEX_PATH, validatePortableArtifacts, validatePortableContract } from './lib/portable-snapshot-pilot.mjs';

const root = process.cwd();
const readText = (relative) => fs.readFile(path.join(root, relative), 'utf8');
const contract = YAML.parse(await readText(PORTABLE_SOURCE_PATH));
const releaseEvidence = YAML.parse(await readText(contract.release.spectraReleaseBinding.evidencePath));
const index = YAML.parse(await readText('exports/project-data/v1/index.yaml'));
const producerCommit = contract.release.producerCommitProvenance;
const gitBytes = (relative) => execFileSync('git', ['show', `${producerCommit}:${relative}`], { cwd: root, encoding: null, maxBuffer: 64 * 1024 * 1024 });
const confluence = YAML.parse(gitBytes(contract.sourceInventory.confluenceContractPath).toString('utf8'));
const pages = [...(confluence.roots ?? []), ...(confluence.children ?? [])];
const pageTexts = new Map();
for (const page of pages) pageTexts.set(page.sourcePath, gitBytes(page.sourcePath).toString('utf8'));
const projectBundle = buildProjectBundle({ producerCommit, indexBytes: gitBytes(PROJECT_INDEX_PATH), readBytes: gitBytes });
const expected = buildPortableArtifacts(contract, confluence, (relative) => pageTexts.get(relative), projectBundle);
const actual = {};
for (const relative of Object.keys(expected)) actual[relative] = await fs.readFile(path.join(root, relative));
const errors = [...validatePortableContract(contract, confluence), ...validatePortableArtifacts(contract, actual)];
const bound = contract.release.spectraReleaseBinding;
if (releaseEvidence.productId !== bound.productId || releaseEvidence.repositoryUrl !== bound.repositoryUrl || releaseEvidence.tag?.name !== bound.releaseTag || releaseEvidence.tag?.annotatedObject !== bound.annotatedTagObject || releaseEvidence.tag?.peeledCommit !== bound.peeledCommit || releaseEvidence.manifest?.path !== bound.manifestPath || releaseEvidence.manifest?.state !== 'final' || releaseEvidence.manifest?.manifestSourceCommit !== bound.manifestSourceCommit || releaseEvidence.manifest?.sourceTree !== bound.sourceTree || releaseEvidence.manifest?.consumerMode !== bound.consumerMode || releaseEvidence.manifest?.installableBlueprint !== true || releaseEvidence.payload?.bundleDigest !== bound.payloadBundleDigest || releaseEvidence.payload?.mismatches !== 0 || releaseEvidence.platformEvidence?.status !== 'passed' || releaseEvidence.platformEvidence?.workflowRun !== bound.platformEvidenceRun || releaseEvidence.platformEvidence?.windows !== 'passed' || releaseEvidence.platformEvidence?.macos14 !== 'passed') errors.push('PILOT-SPECTRA-EVIDENCE: versionierte Evidence stimmt nicht exakt mit der Releasebindung und Plattformmatrix ueberein');
for (const relative of Object.keys(expected)) if (!expected[relative].equals(actual[relative])) errors.push(`PILOT-DETERMINISMUS: ${relative} weicht von der kanonischen Projektion ab`);
const requiredIndexPaths = [
  PORTABLE_SOURCE_PATH,
  PORTABLE_SCHEMA_PATH,
  PORTABLE_RELEASE_SCHEMA_PATH,
  'scripts/lib/portable-snapshot-pilot.mjs',
  'scripts/generate-portable-snapshot-pilot.mjs',
  'scripts/validate-portable-snapshot-pilot.mjs',
  'tests/governance/portable-snapshot-pilot.test.mjs',
  contract.release.spectraReleaseBinding.evidencePath,
  contract.release.catalogPath,
  contract.release.currentPointerPath,
  `${contract.release.releaseDirectory}/payload.json`,
  `${contract.release.releaseDirectory}/catalog-fragment.json`,
  `${contract.release.releaseDirectory}/manifest.json`
];
const indexPaths = (index.artifacts ?? []).map((item) => item.path);
if (index.governingChange !== 'prepare-portable-snapshot-pilot' || index.artifacts?.length !== 158 || new Set(indexPaths).size !== indexPaths.length || requiredIndexPaths.some((relative) => !indexPaths.includes(relative)) || indexPaths.some((relative) => relative.startsWith('tests/fixtures/') || /exports\/project-data\/v1\/snapshots\/releases\/UABC-PORTABLE-PILOT-000[12]\//u.test(relative))) errors.push('PILOT-ALLOWLIST: Index muss 158 eindeutige aktuelle Artefakte enthalten, die gebundene 0003-Steuerflaeche positivlisten und historische oder fremde Fixtures ausschliessen');
const historical = {
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0001/payload.json': 'abc2bb5347978d15ed1ebfcf50fd344f71b8d4a1b265eee900090d2de8272c3b',
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0001/catalog-fragment.json': '91a1f1fae8360d7f1e7445081ffc44d5e6d65be602ada96347f9b5a41185a1c4',
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0001/manifest.json': 'e6b2a6dd271afb2e9978423440de7aba53168a0a60d2a34dbba06f77438281fa',
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0002/payload.json': '3207d0da25375c9b56dd816bc1f6f7c880b7ebaf0c289583985efd72146cb4e4',
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0002/catalog-fragment.json': '01446f62fe5a1442f590dfb40cf96059f3e7baa4e3a1fc0788a54c0ea7735868',
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0002/manifest.json': '505ee0fea7e7db9441fb9ad32a0a1f839e751cbd1e00d2b539b777c1ab400322'
};
for (const [relative, digest] of Object.entries(historical)) {
  const bytes = await fs.readFile(path.join(root, relative));
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== digest) errors.push(`PILOT-IMMUTABILITAET: historischer Release wurde veraendert: ${relative}`);
}
const ajv = new Ajv2020({ allErrors: true, strict: true });
for (const [schemaPath, value] of [[PORTABLE_SCHEMA_PATH, contract], [PORTABLE_RELEASE_SCHEMA_PATH, JSON.parse(actual[`${contract.release.releaseDirectory}/manifest.json`].toString('utf8'))]]) {
  const schema = JSON.parse(await readText(schemaPath));
  const validate = ajv.compile(schema);
  if (!validate(value)) for (const error of validate.errors ?? []) errors.push(`PILOT-SCHEMA: ${schemaPath}${error.instancePath || '/'} ${error.message}`);
}
if (errors.length) { console.error(`Portabler Snapshot-Pilot ungueltig (${errors.length}):`); for (const error of errors) console.error(`- ${error}`); process.exit(1); }
console.log(`Portabler Snapshot-Pilot gueltig: Quellen=${pages.length}; aktueller Release=${contract.release.releaseId}; historische Releases=2; Kunden=1; Projekte=${contract.customerCatalog.projects.length}; Projektartefakte=${projectBundle.files.length}; Bindung=${contract.release.bindingStatus}.`);

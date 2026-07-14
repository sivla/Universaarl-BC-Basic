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
  contract.release.currentPointerPath
];
const projectIndex = projectBundle.index;
const indexPaths = (projectIndex.artifacts ?? []).map((item) => item.path);
const expectedArtifactCount = projectIndex.artifacts?.length ?? 0;
if (projectIndex.governingChange !== 'deliver-production-ready-bc-basic-onboarding' || projectBundle.files.length !== expectedArtifactCount || new Set(indexPaths).size !== indexPaths.length || requiredIndexPaths.some((relative) => !indexPaths.includes(relative)) || indexPaths.some((relative) => relative.startsWith('tests/fixtures/'))) errors.push(`PILOT-ALLOWLIST: Der commitgebundene historische Index muss ${expectedArtifactCount} eindeutige BC-Basic-Artefakte enthalten und historische oder fremde Fixtures ausschliessen`);
const historical = {
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0005/payload.json': 'dc53641c906088fcf43b435f0e85e5f3c287580aefd02453d54f4bc0bb5a21a6',
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0005/catalog-fragment.json': '4e7d3b2d4412ca1ca9da3fcc2ccf9d5b5d601a736b52e2fd3d6d21d3c4c175e0',
  'exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0005/manifest.json': 'b0202e3969958aca151121ef53338d5b489a0876250c2b5322ce0dfbbf3b7305'
};
for (const [relative, digest] of Object.entries(historical)) {
  const bytes = await fs.readFile(path.join(root, relative));
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== digest) errors.push(`PILOT-IMMUTABILITAET: historischer Release wurde veraendert: ${relative}`);
}
const historicalManifest = JSON.parse(await readText('exports/project-data/v1/snapshots/releases/UABC-PORTABLE-PILOT-0005/manifest.json'));
for (const record of historicalManifest.records ?? []) {
  const bytes = await fs.readFile(path.join(root, record.path));
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (digest !== record.sha256 || bytes.length !== record.size) errors.push(`PILOT-IMMUTABILITAET: historischer Release 0003 enthaelt abweichende Bytes: ${record.path}`);
}
const ajv = new Ajv2020({ allErrors: true, strict: true });
for (const [schemaPath, value] of [[PORTABLE_SCHEMA_PATH, contract], [PORTABLE_RELEASE_SCHEMA_PATH, JSON.parse(actual[`${contract.release.releaseDirectory}/manifest.json`].toString('utf8'))]]) {
  const schema = JSON.parse(await readText(schemaPath));
  const validate = ajv.compile(schema);
  if (!validate(value)) for (const error of validate.errors ?? []) errors.push(`PILOT-SCHEMA: ${schemaPath}${error.instancePath || '/'} ${error.message}`);
}
if (errors.length) { console.error(`Portabler Snapshot-Pilot ungueltig (${errors.length}):`); for (const error of errors) console.error(`- ${error}`); process.exit(1); }
console.log(`Portabler Snapshot-Pilot gueltig: Quellen=${pages.length}; aktueller Release=${contract.release.releaseId}; historische Releases=1; Kunden=1; Projekte=${contract.customerCatalog.projects.length}; Projektartefakte=${projectBundle.files.length}; Bindung=${contract.release.bindingStatus}.`);

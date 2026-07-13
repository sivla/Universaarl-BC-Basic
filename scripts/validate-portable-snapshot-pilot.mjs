import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';
import { buildPortableArtifacts, PORTABLE_RELEASE_SCHEMA_PATH, PORTABLE_SCHEMA_PATH, PORTABLE_SOURCE_PATH, validatePortableArtifacts, validatePortableContract } from './lib/portable-snapshot-pilot.mjs';

const root = process.cwd();
const readText = (relative) => fs.readFile(path.join(root, relative), 'utf8');
const contract = YAML.parse(await readText(PORTABLE_SOURCE_PATH));
const index = YAML.parse(await readText('exports/project-data/v1/index.yaml'));
const confluence = YAML.parse(await readText(contract.sourceInventory.confluenceContractPath));
const pages = [...(confluence.roots ?? []), ...(confluence.children ?? [])];
const pageTexts = new Map();
for (const page of pages) pageTexts.set(page.sourcePath, await readText(page.sourcePath));
const expected = buildPortableArtifacts(contract, confluence, (relative) => pageTexts.get(relative));
const actual = {};
for (const relative of Object.keys(expected)) actual[relative] = await fs.readFile(path.join(root, relative));
const errors = [...validatePortableContract(contract, confluence), ...validatePortableArtifacts(contract, actual)];
for (const relative of Object.keys(expected)) if (!expected[relative].equals(actual[relative])) errors.push(`PILOT-DETERMINISMUS: ${relative} weicht von der kanonischen Projektion ab`);
const requiredIndexPaths = [
  PORTABLE_SOURCE_PATH,
  PORTABLE_SCHEMA_PATH,
  PORTABLE_RELEASE_SCHEMA_PATH,
  'scripts/lib/portable-snapshot-pilot.mjs',
  'scripts/generate-portable-snapshot-pilot.mjs',
  'scripts/validate-portable-snapshot-pilot.mjs',
  'tests/governance/portable-snapshot-pilot.test.mjs',
  contract.release.catalogPath,
  contract.release.currentPointerPath,
  ...Object.keys(expected).filter((relative) => relative.startsWith(`${contract.release.releaseDirectory}/`))
];
const indexPaths = (index.artifacts ?? []).map((item) => item.path);
if (index.governingChange !== 'prepare-portable-snapshot-pilot' || index.artifacts?.length !== 157 || new Set(indexPaths).size !== indexPaths.length || requiredIndexPaths.some((relative) => !indexPaths.includes(relative)) || indexPaths.some((relative) => relative.startsWith('tests/fixtures/'))) errors.push('PILOT-ALLOWLIST: Index muss 157 eindeutige Artefakte enthalten, alle Pilotflaechen positivlisten und Fremdkunden-Fixtures ausschliessen');
const ajv = new Ajv2020({ allErrors: true, strict: true });
for (const [schemaPath, value] of [[PORTABLE_SCHEMA_PATH, contract], [PORTABLE_RELEASE_SCHEMA_PATH, JSON.parse(actual[`${contract.release.releaseDirectory}/manifest.json`].toString('utf8'))]]) {
  const schema = JSON.parse(await readText(schemaPath));
  const validate = ajv.compile(schema);
  if (!validate(value)) for (const error of validate.errors ?? []) errors.push(`PILOT-SCHEMA: ${schemaPath}${error.instancePath || '/'} ${error.message}`);
}
if (errors.length) { console.error(`Portabler Snapshot-Pilot ungueltig (${errors.length}):`); for (const error of errors) console.error(`- ${error}`); process.exit(1); }
console.log(`Portabler Snapshot-Pilot gueltig: Quellen=${pages.length}; Releases=1; Kunden=1; Projekte=${contract.customerCatalog.projects.length}; Bindung=${contract.release.bindingStatus}.`);

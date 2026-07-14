import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { buildPortableArtifacts, buildProjectBundle, PORTABLE_SOURCE_PATH, PROJECT_INDEX_PATH, validatePortableArtifacts } from './lib/portable-snapshot-pilot.mjs';

const root = process.cwd();
const write = process.argv.includes('--write');
const readText = (relative) => fs.readFile(path.join(root, relative), 'utf8');
const contract = YAML.parse(await readText(PORTABLE_SOURCE_PATH));
const producerCommit = contract.release.producerCommitProvenance;
const gitBytes = (relative) => execFileSync('git', ['show', `${producerCommit}:${relative}`], { cwd: root, encoding: null, maxBuffer: 64 * 1024 * 1024 });
try {
  execFileSync('git', ['cat-file', '-e', `${producerCommit}^{commit}`], { cwd: root, stdio: 'ignore' });
  execFileSync('git', ['merge-base', '--is-ancestor', producerCommit, 'HEAD'], { cwd: root, stdio: 'ignore' });
} catch { throw new Error(`PILOT-PROVENIENZ: ${producerCommit} ist kein erreichbarer Vorfahr von HEAD`); }
const confluence = YAML.parse(gitBytes(contract.sourceInventory.confluenceContractPath).toString('utf8'));
const pageTexts = new Map();
for (const page of [...(confluence.roots ?? []), ...(confluence.children ?? [])]) pageTexts.set(page.sourcePath, gitBytes(page.sourcePath).toString('utf8'));
const projectBundle = buildProjectBundle({ producerCommit, indexBytes: gitBytes(PROJECT_INDEX_PATH), readBytes: gitBytes });
const artifacts = buildPortableArtifacts(contract, confluence, (relative) => pageTexts.get(relative), projectBundle);
const errors = validatePortableArtifacts(contract, artifacts);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

async function writeImmutable(relative, bytes) {
  const absolute = path.join(root, relative);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  try {
    const existing = await fs.readFile(absolute);
    if (!existing.equals(bytes)) throw new Error(`${relative}: bestehender immutable Release weicht ab`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.writeFile(absolute, bytes, { flag: 'wx' });
  }
}

async function updateCurrentReleaseAllowlist() {
  const absolute = path.join(root, PROJECT_INDEX_PATH);
  let text = await fs.readFile(absolute, 'utf8');
  const replacements = [
    ['UABC-SRC-BCB-PORTABLE-FRAGMENT-003', 'UABC-SRC-BCB-PORTABLE-FRAGMENT-004'],
    ['UABC-SRC-BCB-PORTABLE-MANIFEST-003', 'UABC-SRC-BCB-PORTABLE-MANIFEST-004'],
    ['UABC-SRC-BCB-PORTABLE-PAYLOAD-003', 'UABC-SRC-BCB-PORTABLE-PAYLOAD-004'],
    ['UABC-PORTABLE-PILOT-0003/catalog-fragment.json', 'UABC-PORTABLE-PILOT-0004/catalog-fragment.json'],
    ['UABC-PORTABLE-PILOT-0003/manifest.json', 'UABC-PORTABLE-PILOT-0004/manifest.json'],
    ['UABC-PORTABLE-PILOT-0003/payload.json', 'UABC-PORTABLE-PILOT-0004/payload.json']
  ];
  for (const [before, after] of replacements) {
    const beforeCount = text.split(before).length - 1;
    const afterCount = text.split(after).length - 1;
    if (beforeCount === 1 && afterCount === 0) text = text.replace(before, after);
    else if (beforeCount === 0 && afterCount === 1) continue;
    else throw new Error(`PILOT-ALLOWLIST: erwartete eindeutige aktuelle Releasebindung fehlt oder ist mehrdeutig: ${before}`);
  }
  await fs.writeFile(absolute, text, 'utf8');
}

if (write) {
  for (const [relative, bytes] of Object.entries(artifacts)) {
    if (relative === contract.release.currentPointerPath || relative === contract.release.catalogPath) continue;
    await writeImmutable(relative, bytes);
  }
  for (const relative of [contract.release.catalogPath, contract.release.currentPointerPath]) {
    const absolute = path.join(root, relative);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    const temporary = `${absolute}.tmp`;
    await fs.writeFile(temporary, artifacts[relative]);
    await fs.rename(temporary, absolute);
  }
  await updateCurrentReleaseAllowlist();
  console.log(`Portabler Snapshot-Pilot erzeugt: ${Object.keys(artifacts).length} Artefakte.`);
} else console.log(`Portabler Snapshot-Pilot ist deterministisch erzeugbar: ${Object.keys(artifacts).length} Artefakte.`);

import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';
import { buildPortableArtifacts, PORTABLE_SOURCE_PATH, validatePortableArtifacts } from './lib/portable-snapshot-pilot.mjs';

const root = process.cwd();
const write = process.argv.includes('--write');
const readText = (relative) => fs.readFile(path.join(root, relative), 'utf8');
const contract = YAML.parse(await readText(PORTABLE_SOURCE_PATH));
const confluence = YAML.parse(await readText(contract.sourceInventory.confluenceContractPath));
const pageTexts = new Map();
for (const page of [...(confluence.roots ?? []), ...(confluence.children ?? [])]) pageTexts.set(page.sourcePath, await readText(page.sourcePath));
const artifacts = buildPortableArtifacts(contract, confluence, (relative) => pageTexts.get(relative));
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
  console.log(`Portabler Snapshot-Pilot erzeugt: ${Object.keys(artifacts).length} Artefakte.`);
} else console.log(`Portabler Snapshot-Pilot ist deterministisch erzeugbar: ${Object.keys(artifacts).length} Artefakte.`);

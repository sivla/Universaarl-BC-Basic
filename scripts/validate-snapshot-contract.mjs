import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { SNAPSHOT_MANIFEST_PATH, SNAPSHOT_SCHEMA_PATH, validateManifestDigests, validateSnapshotManifest } from './lib/snapshot-contract.mjs';
import { validateConsumerBindings } from './lib/validate-consumer-bindings.mjs';

const projectIndex = YAML.parse(await fs.readFile('exports/project-data/v1/index.yaml', 'utf8'));
const binding = YAML.parse(await fs.readFile('governance/consumer-bindings.yaml', 'utf8'));
const errors = validateConsumerBindings(binding, projectIndex);
const schema = JSON.parse(await fs.readFile(SNAPSHOT_SCHEMA_PATH, 'utf8'));
validateSnapshotManifest({}, schema);
const manifestExists = await fs.access(SNAPSHOT_MANIFEST_PATH).then(() => true).catch(() => false);
if (manifestExists) {
  const manifest = JSON.parse(await fs.readFile(SNAPSHOT_MANIFEST_PATH, 'utf8'));
  errors.push(...validateSnapshotManifest(manifest, schema));
  if (binding.bcProjectOsBinding.status !== 'BOUND_BCPROJECTOS_RELEASE') errors.push('Snapshotmanifest ist bei PENDING_BCPROJECTOS_RELEASE unzulaessig');
  if (/^[a-f0-9]{40}$/.test(manifest.sourceCommitSha ?? '')) {
    const readBlob = (relative) => execFileSync('git', ['show', `${manifest.sourceCommitSha}:${relative}`], { env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
    try { errors.push(...validateManifestDigests(manifest, readBlob)); }
    catch (error) { errors.push(`Snapshot-Quellcommit ist nicht vollstaendig lesbar: ${error.message}`); }
  }
} else if (binding.consumers?.[0]?.snapshotContract?.validationStatus !== 'blocked') {
  errors.push('Fehlendes Snapshotmanifest erfordert validationStatus blocked');
}
if (errors.length) {
  console.error(`Snapshotvertragspruefung fehlgeschlagen (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Snapshotvertragspruefung bestanden: BCProjectOS=${binding.bcProjectOsBinding.status}; Manifest=${manifestExists ? 'vorhanden' : 'nicht-erzeugt'}; Snapshot=${binding.consumers[0].snapshotContract.validationStatus}.`);

import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { buildSnapshotManifest, canonicalJson, SNAPSHOT_MANIFEST_PATH, SNAPSHOT_SCHEMA_PATH, validateSnapshotManifest } from './lib/snapshot-contract.mjs';
import { validateConsumerBindings } from './lib/validate-consumer-bindings.mjs';

const commitIndex = process.argv.indexOf('--source-commit');
const sourceCommitSha = commitIndex >= 0 ? process.argv[commitIndex + 1] : null;
const fail = (message) => { console.error(message); process.exit(1); };
if (!/^[a-f0-9]{40}$/.test(sourceCommitSha ?? '')) fail('--source-commit erfordert eine vollstaendige Commit-SHA.');
const gitText = (args) => execFileSync('git', args, { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim();
const readBlob = (relative) => execFileSync('git', ['show', `${sourceCommitSha}:${relative}`], { env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
if (gitText(['rev-parse', 'HEAD']) !== sourceCommitSha) fail('HEAD stimmt nicht mit --source-commit ueberein. Snapshotmanifest nicht erzeugt.');
if (gitText(['status', '--porcelain']) !== '') fail('Die Arbeitskopie ist nicht sauber. Snapshotmanifest nicht erzeugt.');

const projectIndex = YAML.parse(readBlob('exports/project-data/v1/index.yaml').toString('utf8'));
const binding = YAML.parse(readBlob('governance/consumer-bindings.yaml').toString('utf8'));
const bindingErrors = validateConsumerBindings(binding, projectIndex);
if (bindingErrors.length) fail(bindingErrors.join('\n'));
const manifest = buildSnapshotManifest({ binding, projectIndex, sourceCommitSha, readBlob });
const schema = JSON.parse(await fs.readFile(SNAPSHOT_SCHEMA_PATH, 'utf8'));
const schemaErrors = validateSnapshotManifest(manifest, schema);
if (schemaErrors.length) fail(`Snapshotmanifest ist ungueltig:\n${schemaErrors.join('\n')}`);
await fs.writeFile(SNAPSHOT_MANIFEST_PATH, canonicalJson(manifest), { flag: 'wx' });
console.log(`Snapshotmanifest erzeugt: ${SNAPSHOT_MANIFEST_PATH}`);

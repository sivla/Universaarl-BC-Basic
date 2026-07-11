import { execFileSync } from 'node:child_process';
import YAML from 'yaml';
import { parseGitTreeEntry, SNAPSHOT_MANIFEST_PATH, SNAPSHOT_SCHEMA_PATH, validateManifestDigests, validateSnapshotManifest } from './lib/snapshot-contract.mjs';
import { validateConsumerBindings } from './lib/validate-consumer-bindings.mjs';

const git = (args, options = {}) => execFileSync('git', args, { ...options, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
const gitText = (args) => git(args, { encoding: 'utf8' }).trim();
const fail = (messages) => {
  console.error(`Snapshotvertragspruefung fehlgeschlagen (${messages.length}):`);
  for (const message of messages) console.error(`- ${message}`);
  process.exit(1);
};

const dirty = gitText(['status', '--porcelain']);
if (dirty !== '') fail(['Die Arbeitskopie ist nicht sauber. Commitgebundener B-Nachweis blockiert.']);
const consumerCommitSha = gitText(['rev-parse', 'HEAD']);
const hasBlob = (relative) => {
  try { git(['cat-file', '-e', `${consumerCommitSha}:${relative}`]); return true; }
  catch { return false; }
};
const blob = (relative) => git(['show', `${consumerCommitSha}:${relative}`]);
const blobText = (relative) => blob(relative).toString('utf8');
const readEntry = (relative) => {
  const bytes = blob(relative);
  const entry = parseGitTreeEntry(git(['ls-tree', '-l', consumerCommitSha, '--', relative], { encoding: 'utf8' }), relative);
  return { bytes, gitMode: entry.gitMode };
};

const errors = [];
try {
  const projectIndex = YAML.parse(blobText('exports/project-data/v1/index.yaml'));
  const binding = YAML.parse(blobText('governance/consumer-bindings.yaml'));
  const branch = gitText(['branch', '--show-current']);
  if (projectIndex.projectId !== 'UABC-BC-BASIC-001' || projectIndex.contractId !== 'UABC-PROJECT-DATA-V1') errors.push('Index-Projektidentitaet oder Vertragsversion ist ungueltig');
  if (projectIndex.allowedBranch !== branch || branch !== 'codex/universaarl-projekt') errors.push('Index erlaubt nicht den aktuellen kanonischen Branch');
  if (projectIndex.validationStatus !== 'branch-commit-validierung-erforderlich') errors.push('Index-Validierungsstatus ist ungueltig');
  const artifacts = projectIndex.artifacts ?? [];
  const ids = new Set();
  const paths = new Set();
  for (const artifact of artifacts) {
    const safe = typeof artifact.path === 'string' && artifact.path.length > 0 && !artifact.path.startsWith('/') && !artifact.path.includes('\\') && !artifact.path.split('/').some((segment) => segment === '' || segment === '.' || segment === '..');
    if (!safe) errors.push(`Indexpfad ist unsicher: ${artifact.path}`);
    if (ids.has(artifact.id) || paths.has(artifact.path)) errors.push(`Index-ID oder Pfad ist doppelt: ${artifact.id}`);
    ids.add(artifact.id); paths.add(artifact.path);
    if (safe && !hasBlob(artifact.path)) errors.push(`Index verweist auf fehlenden Git-Blob: ${artifact.path}`);
  }
  errors.push(...validateConsumerBindings(binding, projectIndex));
  const schema = JSON.parse(blobText(SNAPSHOT_SCHEMA_PATH).toString('utf8'));
  validateSnapshotManifest({}, schema);
  const manifestExists = hasBlob(SNAPSHOT_MANIFEST_PATH);
  if (manifestExists) {
    const manifest = JSON.parse(blobText(SNAPSHOT_MANIFEST_PATH).toString('utf8'));
    errors.push(...validateSnapshotManifest(manifest, schema));
    if (binding.spectraReleaseBinding.bindingStatus !== 'BOUND') errors.push('Snapshotmanifest ist ohne vollstaendige Spectra-Bindung unzulaessig');
    if (manifest.producerCommitSha === consumerCommitSha) {
      try { errors.push(...validateManifestDigests(manifest, readEntry)); }
      catch (error) { errors.push(`Snapshot-Blobs des Branch-Commits sind nicht vollstaendig lesbar: ${error.message}`); }
    }
  } else if (binding.consumers?.[0]?.snapshotContract?.validationStatus !== 'blocked') errors.push('Fehlendes Snapshotmanifest erfordert validationStatus blocked');
  if (errors.length) fail(errors);
  console.log(`Snapshotvertragspruefung bestanden: Spectra=${binding.spectraReleaseBinding.bindingStatus}; Branch-Commit=${consumerCommitSha}; Manifest=${manifestExists ? 'vorhanden' : 'nicht-erzeugt'}; Snapshot=${manifestExists ? 'historisch-oder-aktuell' : binding.consumers[0].snapshotContract.validationStatus}.`);
} catch (error) {
  fail([`Commitgebundener B-Nachweis konnte nicht gelesen werden: ${error.message}`]);
}

import path from 'node:path';

const SHA40 = /^[a-f0-9]{40}$/;
const SHA256HEX = /^[a-f0-9]{64}$/;
const SPECTRA_TAG = /^spectra-v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const BCPROJECTOS_URL = 'https://github.com/sivla/BCProjectOS.git';
const TWIN_URL = 'https://github.com/sivla/FiBu.git';
const TWIN_BRANCH = 'codex/universaarl-projekt-twin';
const SAFE_REPOSITORY_PATH = /^(?![A-Za-z]:)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!\/)(?!.*[\\\\\u0000-\u001F\u007F])(?!.*\/\/)(?!.*(?:^|\/)\.(?:\/|$))(?!.*(?:^|\/)\.\.(?:\/|$)).+$/;

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join('\u0000') === [...keys].sort().join('\u0000');
}

export function repositoryRelative(value) {
  return typeof value === 'string' && SAFE_REPOSITORY_PATH.test(value) && !path.win32.isAbsolute(value) && !path.posix.isAbsolute(value);
}

export function validateConsumerBindings(binding, projectIndex) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const prefix = 'governance/consumer-bindings.yaml';
  check(binding?.schemaVersion === 2, `${prefix}: schemaVersion muss 2 sein`);
  check(binding?.governingChange === 'migrate-bc-basic-to-single-uabc-ticket-project' && ['proposed','active'].includes(binding?.lifecycleStatus), `${prefix}: Change- und Lebenszyklusbindung ist ungueltig`);
  check(exactKeys(binding?.producer, ['projectId', 'contractId', 'contractPath']), `${prefix}: producer enthaelt unerlaubte oder fehlende Felder`);
  check(binding?.producer?.projectId === projectIndex?.projectId && binding?.producer?.contractId === projectIndex?.contractId && binding?.producer?.contractPath === 'exports/project-data/v1/index.yaml', `${prefix}: Producervertrag stimmt nicht mit dem Index ueberein`);
  check(projectIndex?.contractRole === 'repository-relative-data-allowlist' && projectIndex?.snapshotManifestIncluded === false, `${prefix}: Index muss Allowlist und kein Snapshotmanifest sein`);

  const release = binding?.spectraReleaseBinding ?? {};
  const releaseKeys = ['bindingStatus', 'productId', 'technicalRepositoryName', 'repositoryUrl', 'releaseVersion', 'releaseTag', 'tagCommit', 'manifestPath', 'manifestSourceCommit', 'consumerMode', 'installableBlueprint', 'digestAlgorithm', 'payloadBundleDigest', 'installationStatus', 'reason'];
  check(exactKeys(release, releaseKeys), `${prefix}: spectraReleaseBinding enthaelt unerlaubte oder fehlende Felder`);
  check(release.productId === 'spectra' && release.technicalRepositoryName === 'BCProjectOS' && release.repositoryUrl === BCPROJECTOS_URL, `${prefix}: Spectra-Produkt- oder technische Repository-Identitaet ist falsch`);
  check(release.digestAlgorithm === 'SHA-256', `${prefix}: Digestalgorithmus muss SHA-256 sein`);
  if (release.bindingStatus === 'PENDING_BCPROJECTOS_RELEASE') {
    for (const field of ['releaseVersion', 'releaseTag', 'tagCommit', 'manifestPath', 'manifestSourceCommit', 'consumerMode', 'installableBlueprint', 'payloadBundleDigest']) check(release[field] === null, `${prefix}: PENDING darf ${field} nicht behaupten`);
    check(release.installationStatus === 'nicht-installiert', `${prefix}: PENDING darf keine Installation behaupten`);
  } else if (release.bindingStatus === 'BOUND') {
    check(typeof release.releaseVersion === 'string' && release.releaseVersion.length > 0 && release.releaseTag === `spectra-v${release.releaseVersion}` && SPECTRA_TAG.test(release.releaseTag), `${prefix}: BOUND erfordert releaseTag exakt spectra-v plus releaseVersion`);
    check(SHA40.test(release.tagCommit ?? '') && repositoryRelative(release.manifestPath) && SHA40.test(release.manifestSourceCommit ?? ''), `${prefix}: BOUND erfordert Tag-Commit, Manifestpfad und Manifest-Quellcommit`);
    check(release.consumerMode === 'INSTALLABLE_BLUEPRINT' && release.installableBlueprint === true && SHA256HEX.test(release.payloadBundleDigest ?? ''), `${prefix}: BOUND erfordert installierbaren Blueprint und Payloaddigest`);
  } else check(false, `${prefix}: ungueltiger bindingStatus ${release.bindingStatus ?? '<fehlt>'}`);

  const twin = binding?.consumers?.[0] ?? {};
  check(Array.isArray(binding?.consumers) && binding.consumers.length === 1, `${prefix}: genau ein Consumer ist zulaessig`);
  check(twin.consumerId === 'project-twin' && twin.access === 'nur-lesend' && twin.identity?.repository?.url === TWIN_URL && twin.identity?.repository?.branch === TWIN_BRANCH, `${prefix}: Project-Twin-Leseridentitaet ist ungueltig`);
  check(twin.identity?.status === 'autorisierter-leser' && twin.identity?.authorizationScope === 'ausschliesslich-validierte-snapshots-lesen', `${prefix}: Consumer darf nur validierte Snapshots lesen`);
  const snapshot = twin.snapshotContract ?? {};
  const snapshotKeys = ['dataContractPath', 'manifestSchemaPath', 'manifestPath', 'pathSemantics', 'lifecycleStatus', 'sourceCommitSha', 'consumerBindingDigest', 'payloadBundleDigest', 'digestAlgorithm', 'canonicalization', 'generationStages', 'validationStatus', 'accessRule', 'availability'];
  check(exactKeys(snapshot, snapshotKeys), `${prefix}: snapshotContract enthaelt unerlaubte oder fehlende Felder`);
  check(snapshot.dataContractPath === binding.producer.contractPath, `${prefix}: Snapshotdatenpfad ist ungueltig`);
  check(snapshot.manifestSchemaPath === 'governance/schemas/project-snapshot-manifest.schema.json' && repositoryRelative(snapshot.manifestSchemaPath), `${prefix}: JSON-Schema-Pfad ist ungueltig`);
  check(snapshot.pathSemantics === 'repository-relative' && snapshot.lifecycleStatus === 'active' && snapshot.digestAlgorithm === 'SHA-256' && snapshot.canonicalization === 'uabc-snapshot-records-v1', `${prefix}: Snapshotvertrag verwendet nicht den kanonischen Rohblobvertrag`);
  check(JSON.stringify(snapshot.generationStages) === JSON.stringify(['commitgebundene-payloadliste-und-digests', 'manifest-aus-validierter-payloadliste']), `${prefix}: Snapshot muss zweistufig erzeugt werden`);
  check(snapshot.manifestPath === null && snapshot.sourceCommitSha === null && snapshot.consumerBindingDigest === null && snapshot.payloadBundleDigest === null && snapshot.validationStatus === 'validated', `${prefix}: aktueller Branchvertrag muss ohne Selbst-SHA extern pinnbar und validiert sein`);
  check(snapshot.availability === 'validierter-branch-commit-extern-zu-pinnen', `${prefix}: Snapshotavailability ist ungueltig`);
  check(twin.dependency?.direction === 'consumer-to-producer' && twin.dependency?.blueprintReadsConsumer === false && twin.dependency?.consumerWritesProducer === false, `${prefix}: Rueckschreiben oder umgekehrtes Lesen ist unzulaessig`);
  check(!(projectIndex?.artifacts ?? []).some((item) => item.path === 'governance/consumer-bindings.yaml'), `${prefix}: interne Consumerbindung darf nicht als Twin-Payload positivgelistet sein`);
  for (const artifact of projectIndex?.artifacts ?? []) if (artifact.kindId === 'snapshot-manifest-schema') check(artifact.format === 'json-schema' && artifact.path.endsWith('.json'), `${prefix}: Snapshot-Schema muss als json-schema unter .json positivgelistet sein`);
  check(!/[A-Z]:\\|(?:^|["'])\.{2}[\\/]/i.test(JSON.stringify(binding)), `${prefix}: absolute oder uebergeordnete Pfade sind unzulaessig`);
  return errors;
}

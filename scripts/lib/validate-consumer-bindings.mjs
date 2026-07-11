import path from 'node:path';

const SHA40 = /^[a-f0-9]{40}$/;
const SHA256 = /^sha256:[a-f0-9]{64}$/;
const BCPROJECTOS_URL = 'https://github.com/sivla/BCProjectOS.git';
const TWIN_URL = 'https://github.com/sivla/FiBu.git';
const TWIN_BRANCH = 'codex/universaarl-projekt-twin';

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).sort().join('\u0000') === [...keys].sort().join('\u0000');
}

export function repositoryRelative(value) {
  return typeof value === 'string' && value.length > 0
    && !path.win32.isAbsolute(value) && !path.posix.isAbsolute(value)
    && !value.split(/[\\/]+/).includes('..');
}

export function validateConsumerBindings(binding, projectIndex) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const prefix = 'governance/consumer-bindings.yaml';

  check(binding?.schemaVersion === 2, `${prefix}: schemaVersion muss 2 sein`);
  check(binding?.governingChange === 'deliver-bc-basic-customer-project', `${prefix}: governingChange ist nicht an den aktiven BC-Basic-Change gebunden`);
  check(binding?.lifecycleStatus === 'proposed', `${prefix}: Vertrag muss bis zur nachgewiesenen Snapshotfreigabe proposed bleiben`);
  check(exactKeys(binding?.producer, ['projectId', 'contractId', 'contractPath']), `${prefix}: producer enthaelt unerlaubte oder fehlende Felder`);
  check(binding?.producer?.projectId === projectIndex?.projectId && binding?.producer?.contractId === projectIndex?.contractId, `${prefix}: Producer stimmt nicht mit dem Projektindex ueberein`);
  check(binding?.producer?.contractPath === 'exports/project-data/v1/index.yaml' && repositoryRelative(binding?.producer?.contractPath), `${prefix}: contractPath muss repository-relativ auf den Projektindex zeigen`);
  check(projectIndex?.contractRole === 'repository-relative-data-allowlist' && projectIndex?.snapshotManifestIncluded === false, `${prefix}: Projektindex muss klar als Allowlist und nicht als Snapshotmanifest markiert sein`);

  const os = binding?.bcProjectOsBinding ?? {};
  const osKeys = ['status', 'productId', 'repositoryUrl', 'releaseVersion', 'releaseTag', 'tagType', 'tagCommit', 'manifestPath', 'manifestSourceCommit', 'manifestStatus', 'productScopeStatus', 'payloadBundleDigest', 'installationStatus', 'reason'];
  check(exactKeys(os, osKeys), `${prefix}: bcProjectOsBinding enthaelt unerlaubte oder fehlende Felder`);
  check(os.productId === 'bcprojectos' && os.repositoryUrl === BCPROJECTOS_URL, `${prefix}: BCProjectOS-Produkt- oder Repository-Identitaet ist falsch`);
  const releaseFields = ['releaseVersion', 'releaseTag', 'tagType', 'tagCommit', 'manifestPath', 'manifestSourceCommit', 'manifestStatus', 'productScopeStatus', 'payloadBundleDigest'];
  if (os.status === 'PENDING_BCPROJECTOS_RELEASE') {
    check(releaseFields.every((field) => os[field] === null), `${prefix}: PENDING darf keine Release-, Manifest-, Scope- oder Digestwerte behaupten`);
    check(os.installationStatus === 'nicht-installiert', `${prefix}: PENDING darf keine Installation behaupten`);
  } else if (os.status === 'BOUND_BCPROJECTOS_RELEASE') {
    check(typeof os.releaseVersion === 'string' && os.releaseVersion.length > 0, `${prefix}: BOUND erfordert releaseVersion`);
    check(typeof os.releaseTag === 'string' && os.releaseTag.length > 0 && os.tagType === 'annotated', `${prefix}: BOUND erfordert einen annotierten Release-Tag`);
    check(SHA40.test(os.tagCommit ?? '') && SHA40.test(os.manifestSourceCommit ?? ''), `${prefix}: BOUND erfordert extern aufgeloesten Tag-Commit und Manifest-Quellcommit`);
    check(repositoryRelative(os.manifestPath) && os.manifestStatus === 'final-installierbar', `${prefix}: BOUND erfordert ein finales installierbares Manifest an repository-relativem Pfad`);
    check(os.productScopeStatus === 'unveraendert' && SHA256.test(os.payloadBundleDigest ?? ''), `${prefix}: BOUND erfordert unveraenderten Produktumfang und SHA-256-Payload-Digest`);
    check(os.installationStatus === 'gebunden-nicht-installiert', `${prefix}: Releasebindung darf keine Installation vortaeuschen`);
  } else check(false, `${prefix}: ungueltiger BCProjectOS-Zustand ${os.status ?? '<fehlt>'}`);

  check(Array.isArray(binding?.consumers) && binding.consumers.length === 1, `${prefix}: genau ein Project-Twin-Consumer ist zulaessig`);
  const twin = binding?.consumers?.[0] ?? {};
  check(twin.consumerId === 'project-twin' && twin.displayName === 'Universaarl Project Twin' && twin.routeKey === projectIndex?.routeKey, `${prefix}: Project-Twin-Identitaet oder routeKey ist ungueltig`);
  check(twin.access === 'nur-lesend', `${prefix}: Project Twin muss ausschliesslich nur-lesend sein`);
  check(twin.identity?.status === 'autorisierter-leser' && twin.identity?.authorizationScope === 'ausschliesslich-validierte-snapshots-lesen', `${prefix}: Twin darf nur als begrenzter Snapshot-Leser autorisiert sein`);
  check(twin.identity?.repository?.url === TWIN_URL && twin.identity?.repository?.branch === TWIN_BRANCH, `${prefix}: Twin-Repository oder -Branch stimmt nicht mit der nachgewiesenen Identitaet ueberein`);

  const snapshot = twin.snapshotContract ?? {};
  const snapshotKeys = ['dataContractPath', 'manifestSchemaPath', 'manifestPath', 'pathSemantics', 'lifecycleStatus', 'sourceCommitSha', 'consumerBindingDigest', 'payloadBundleDigest', 'digestAlgorithm', 'canonicalization', 'generationStages', 'validationStatus', 'accessRule', 'availability'];
  check(exactKeys(snapshot, snapshotKeys), `${prefix}: snapshotContract enthaelt unerlaubte oder fehlende Felder`);
  check(snapshot.dataContractPath === binding?.producer?.contractPath && repositoryRelative(snapshot.dataContractPath), `${prefix}: Datenvertragspfad muss repository-relativ auf den Producer-Vertrag zeigen`);
  check(snapshot.manifestSchemaPath === 'governance/schemas/project-snapshot-manifest.schema.json' && repositoryRelative(snapshot.manifestSchemaPath), `${prefix}: Snapshot-Schema muss versioniert und repository-relativ sein`);
  check(snapshot.pathSemantics === 'repository-relative' && snapshot.lifecycleStatus === 'proposed', `${prefix}: Snapshot muss proposed und repository-relative bleiben`);
  check(snapshot.digestAlgorithm === 'sha256' && snapshot.canonicalization === 'utf8-json-sortierte-schluessel-lf', `${prefix}: Digest- und Kanonisierungsvertrag ist ungueltig`);
  check(JSON.stringify(snapshot.generationStages) === JSON.stringify(['commitgebundene-payloadliste-und-digests', 'manifest-aus-validierter-payloadliste']), `${prefix}: Snapshot muss zweistufig und nicht selbstreferenziell erzeugt werden`);
  check(snapshot.manifestPath === null && snapshot.sourceCommitSha === null && snapshot.consumerBindingDigest === null && snapshot.payloadBundleDigest === null && snapshot.validationStatus === 'blocked', `${prefix}: aktueller Snapshot darf weder Manifest noch Commit oder Digests behaupten und muss blocked sein`);
  check(snapshot.availability === 'blockiert-bcprojectos-release-und-snapshotnachweise-ausstehend', `${prefix}: Snapshot-Verfuegbarkeit muss alle offenen Gates benennen`);
  if (os.status !== 'BOUND_BCPROJECTOS_RELEASE') check(snapshot.validationStatus === 'blocked', `${prefix}: PENDING BCProjectOS muss die Snapshotvalidierung blockieren`);
  check(twin.dependency?.direction === 'consumer-to-producer' && twin.dependency?.blueprintReadsConsumer === false && twin.dependency?.consumerWritesProducer === false, `${prefix}: Abhaengigkeit muss Rueckschreiben und umgekehrtes Lesen ausschliessen`);

  const serialized = JSON.stringify(binding);
  check((projectIndex?.artifacts ?? []).some((item) => item.id === 'UABC-SRC-BCB-CONSUMER-001' && item.path === 'governance/consumer-bindings.yaml'), `${prefix}: Vertrag muss im Projektindex positivgelistet sein`);
  check(!/[A-Z]:\\|(?:^|["'])\.{2}[\\/]/i.test(serialized), `${prefix}: Vertrag darf keine absoluten oder uebergeordneten Laufzeitpfade enthalten`);
  return errors;
}

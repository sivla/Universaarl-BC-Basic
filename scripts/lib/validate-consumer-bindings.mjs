import path from 'node:path';

const SHA40 = /^[a-f0-9]{40}$/i;
const SHA256 = /^sha256:[a-f0-9]{64}$/i;

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).sort().join('\u0000') === [...keys].sort().join('\u0000');
}

function repositoryRelative(value) {
  return typeof value === 'string'
    && value.length > 0
    && !path.win32.isAbsolute(value)
    && !path.posix.isAbsolute(value)
    && !value.split(/[\\/]+/).includes('..');
}

export function validateConsumerBindings(binding, projectIndex) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const prefix = 'governance/consumer-bindings.yaml';

  check(binding?.schemaVersion === 1, `${prefix}: schemaVersion muss 1 sein`);
  check(binding?.governingChange === 'deliver-bc-basic-customer-project', `${prefix}: governingChange ist nicht an den aktiven BC-Basic-Change gebunden`);
  check(binding?.lifecycleStatus === 'proposed', `${prefix}: Vertrag muss bis zur nachgewiesenen Freigabe proposed bleiben`);
  check(exactKeys(binding?.producer, ['projectId', 'contractId', 'contractPath']), `${prefix}: producer enthaelt unerlaubte oder fehlende Felder`);
  check(binding?.producer?.projectId === projectIndex?.projectId, `${prefix}: producer.projectId stimmt nicht mit dem Projektindex ueberein`);
  check(binding?.producer?.contractId === projectIndex?.contractId, `${prefix}: producer.contractId stimmt nicht mit dem Projektindex ueberein`);
  check(binding?.producer?.contractPath === 'exports/project-data/v1/index.yaml' && repositoryRelative(binding?.producer?.contractPath), `${prefix}: producer.contractPath muss repository-relativ auf den Projektindex zeigen`);

  const os = binding?.bcProjectOsBinding ?? {};
  check(exactKeys(os, ['status', 'releaseTag', 'commitSha', 'digest', 'reason']), `${prefix}: bcProjectOsBinding enthaelt unerlaubte oder fehlende Felder`);
  check(os.status === 'PENDING_BCPROJECTOS_RELEASE', `${prefix}: ohne separat nachgewiesenen Release muss BCProjectOS PENDING_BCPROJECTOS_RELEASE bleiben`);
  check(os.releaseTag === null && os.commitSha === null && os.digest === null, `${prefix}: pending BCProjectOS-Bindung darf Tag, Commit-SHA oder Digest nicht behaupten`);
  check(typeof os.reason === 'string' && /Release-Tag/i.test(os.reason) && /Digest/i.test(os.reason), `${prefix}: pending BCProjectOS-Bindung benoetigt eine nachvollziehbare Begruendung`);

  check(Array.isArray(binding?.consumers) && binding.consumers.length === 1, `${prefix}: genau ein Project-Twin-Consumer ist zulaessig`);
  const twin = binding?.consumers?.[0] ?? {};
  check(twin.consumerId === 'project-twin' && twin.displayName === 'Universaarl Project Twin' && twin.routeKey === projectIndex?.routeKey, `${prefix}: Project-Twin-Identitaet oder routeKey ist ungueltig`);
  check(twin.access === 'nur-lesend', `${prefix}: Project Twin muss ausschliesslich nur-lesend sein`);
  check(twin.identity?.status === 'pending-authorization', `${prefix}: Consumer-Identitaet muss ohne versionierten Nachweis pending-authorization bleiben`);
  check(typeof twin.identity?.reason === 'string' && /weder die Autorisierung noch die Existenz/i.test(twin.identity.reason), `${prefix}: ausstehende Consumer-Autorisierung benoetigt eine klare Begruendung`);
  check(typeof twin.identity?.candidateRepository?.url === 'string' && typeof twin.identity?.candidateRepository?.branch === 'string', `${prefix}: Repository-Kandidat muss strukturiert angegeben sein`);

  const snapshot = twin.snapshotContract ?? {};
  check(exactKeys(snapshot, ['path', 'pathSemantics', 'lifecycleStatus', 'sourceCommitSha', 'digest', 'validationStatus', 'accessRule', 'availability']), `${prefix}: snapshotContract enthaelt unerlaubte oder fehlende Felder`);
  check(snapshot.path === binding?.producer?.contractPath && repositoryRelative(snapshot.path), `${prefix}: Snapshot-Pfad muss repository-relativ auf den Producer-Vertrag zeigen`);
  check(snapshot.pathSemantics === 'repository-relative' && snapshot.lifecycleStatus === 'proposed', `${prefix}: Snapshot muss proposed und repository-relative bleiben`);
  check(snapshot.sourceCommitSha === null && snapshot.digest === null && snapshot.validationStatus === 'blocked', `${prefix}: ungepruefter Snapshot darf keine Quell-Commit-SHA oder Digest behaupten und muss blocked sein`);
  check(snapshot.availability === 'blockiert-bcprojectos-bindung-validierung-und-versionierung-ausstehend', `${prefix}: Snapshot-Verfuegbarkeit muss alle offenen Gates benennen`);
  check(twin.dependency?.direction === 'consumer-to-producer' && twin.dependency?.blueprintReadsConsumer === false && twin.dependency?.consumerWritesProducer === false, `${prefix}: Abhaengigkeit muss lesend vom Consumer zum Producer zeigen und Rueckschreiben ausschliessen`);

  const serialized = JSON.stringify(binding);
  check(!SHA40.test(os.commitSha ?? '') && !SHA256.test(os.digest ?? ''), `${prefix}: pending BCProjectOS-Bindung darf keine Release-Nachweise enthalten`);
  check(!SHA40.test(snapshot.sourceCommitSha ?? '') && !SHA256.test(snapshot.digest ?? ''), `${prefix}: blockierter Snapshot darf keine Versionsnachweise enthalten`);
  check((projectIndex?.artifacts ?? []).some((item) => item.id === 'UABC-SRC-BCB-CONSUMER-001' && item.kindId === 'consumer-binding' && item.path === 'governance/consumer-bindings.yaml'), `${prefix}: Vertrag muss im Projektindex positivgelistet sein`);
  check(!/[A-Z]:\\|(?:^|["'])\.{2}[\\/]/i.test(serialized), `${prefix}: Vertrag darf keine absoluten oder uebergeordneten Laufzeitpfade enthalten`);

  return errors;
}

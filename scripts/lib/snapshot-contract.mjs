import crypto from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';

export const SNAPSHOT_MANIFEST_PATH = 'exports/project-data/v1/snapshot-manifest.json';
export const SNAPSHOT_SCHEMA_PATH = 'governance/schemas/project-snapshot-manifest.schema.json';

export function parseGitTreeEntry(raw, relative) {
  const lines = String(raw).replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  if (lines.length !== 1) throw new Error(`Git-Treeausgabe fuer ${relative} ist nicht genau eine Zeile`);
  const match = lines[0].match(/^100644\s+blob\s+([a-f0-9]{40})\s+(\d+)\t(.+)$/);
  if (!match || match[3] !== relative) throw new Error(`Git-Treeeintrag fuer ${relative} ist kein exakter 100644-Blob`);
  return { gitMode: '100644', sizeBytes: Number(match[2]) };
}

export function canonicalJson(value) {
  const normalize = (item) => Array.isArray(item) ? item.map(normalize) : (item && typeof item === 'object' ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, normalize(item[key])])) : item);
  return `${JSON.stringify(normalize(value))}\n`;
}

export function sha256Hex(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
export function sha256(bytes) { return `sha256:${sha256Hex(bytes)}`; }

function recordFor(path, selector, entry, id = null) {
  return { ...(id === null ? {} : { id }), path, ...(id === null ? {} : { selector: selector ?? null }), gitMode: entry.gitMode, sizeBytes: entry.bytes.length, sha256: sha256Hex(entry.bytes) };
}

function sortRecords(records) { return [...records].sort((left, right) => Buffer.from(left.path).compare(Buffer.from(right.path))); }

export function framedPayloadDigest(records) {
  const framed = sortRecords(records).map((record) => `${record.path}\0${record.gitMode}\0${record.sizeBytes}\0${record.sha256}\n`).join('');
  return sha256(Buffer.from(framed, 'utf8'));
}

export function buildPayloadRecords(projectIndex, readEntry) {
  if ((projectIndex.artifacts ?? []).some((artifact) => artifact.path === 'governance/consumer-bindings.yaml')) throw new Error('Interne Consumerbindung darf nicht in die Twin-Payload-Allowlist gelangen.');
  const indexRecord = recordFor('exports/project-data/v1/index.yaml', undefined, readEntry('exports/project-data/v1/index.yaml'));
  const payloads = (projectIndex.artifacts ?? []).map((artifact) => recordFor(artifact.path, artifact.selector, readEntry(artifact.path), artifact.id));
  return { index: indexRecord, payloads: sortRecords(payloads), payloadBundleDigest: framedPayloadDigest([indexRecord, ...payloads]) };
}

export function buildSnapshotManifest({ binding, projectIndex, producerCommitSha, readEntry }) {
  const release = binding.spectraReleaseBinding;
  if (release?.bindingStatus !== 'BOUND') throw new Error('Spectra ist nicht an einen vollstaendigen Release gebunden. Snapshotmanifest nicht erzeugt.');
  const twin = binding.consumers?.[0];
  const records = buildPayloadRecords(projectIndex, readEntry);
  return {
    schemaVersion: 1,
    producerId: 'blueprint',
    projectId: projectIndex.projectId,
    contractId: projectIndex.contractId,
    producerCommitSha,
    schemaPath: SNAPSHOT_SCHEMA_PATH,
    indexPath: binding.producer.contractPath,
    consumer: { consumerId: twin.consumerId, repositoryUrl: twin.identity.repository.url, branch: twin.identity.repository.branch, access: twin.access },
    spectraReleaseBinding: {
      bindingStatus: 'BOUND', productId: release.productId, technicalRepositoryName: release.technicalRepositoryName, repositoryUrl: release.repositoryUrl,
      releaseVersion: release.releaseVersion, releaseTag: release.releaseTag, tagCommit: release.tagCommit, manifestPath: release.manifestPath,
      manifestSourceCommit: release.manifestSourceCommit, consumerMode: release.consumerMode, installableBlueprint: release.installableBlueprint,
      digestAlgorithm: 'SHA-256', payloadBundleDigest: release.payloadBundleDigest
    },
    consumerBindingDigest: sha256(readEntry('governance/consumer-bindings.yaml').bytes),
    payloadDigestFormat: 'uabc-snapshot-records-v1',
    index: records.index,
    payloads: records.payloads,
    payloadBundleDigest: records.payloadBundleDigest,
    validationStatus: 'validated'
  };
}

export function validateSnapshotManifest(manifest, schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const errors = validate(manifest) ? [] : (validate.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`);
  if (errors.length === 0 && manifest.spectraReleaseBinding?.releaseTag !== `spectra-v${manifest.spectraReleaseBinding?.releaseVersion}`) errors.push('/spectraReleaseBinding/releaseTag muss exakt spectra-v plus releaseVersion sein');
  if (manifest.payloads?.some((record) => record.path === 'governance/consumer-bindings.yaml')) errors.push('/payloads darf die interne Consumerbindung nicht anbieten');
  return errors;
}

export function hasSingleParent(revListParentsLine, producerCommitSha) {
  const commits = String(revListParentsLine).trim().split(/\s+/).filter(Boolean);
  return commits.length === 2 && commits[1] === producerCommitSha;
}

export function validateManifestDigests(manifest, readEntry) {
  const errors = [];
  const records = [manifest.index, ...manifest.payloads];
  const paths = records.map((record) => record.path);
  if (new Set(paths).size !== paths.length) errors.push('Snapshotrecords enthalten doppelte Pfade');
  if (manifest.index.path !== manifest.indexPath) errors.push('Indexpfad und Indexrecord stimmen nicht ueberein');
  if (records.some((record) => record.path === SNAPSHOT_MANIFEST_PATH)) errors.push('Manifest darf nicht Teil seines eigenen Digests sein');
  if (records.some((record) => record.gitMode !== '100644')) errors.push('Index- und Payloadrecords duerfen nur Git-Modus 100644 verwenden');
  const expected = records.map((record) => { const entry = readEntry(record.path); return { ...record, gitMode: entry.gitMode, sizeBytes: entry.bytes.length, sha256: sha256Hex(entry.bytes) }; });
  for (const record of records) {
    const actual = expected.find((candidate) => candidate.path === record.path);
    if (JSON.stringify(record) !== JSON.stringify(actual)) errors.push(`${record.path}: Rohblobrecord stimmt nicht mit dem Quellcommit ueberein`);
  }
  if (expected.some((record) => record.gitMode !== '100644')) errors.push('Quell-Index oder Payload enthaelt einen nicht erlaubten Git-Modus');
  if (manifest.payloadBundleDigest !== framedPayloadDigest(expected)) errors.push('payloadBundleDigest stimmt nicht mit dem uabc-snapshot-records-v1-Vertrag ueberein');
  if (manifest.consumerBindingDigest !== sha256(readEntry('governance/consumer-bindings.yaml').bytes)) errors.push('consumerBindingDigest stimmt nicht mit der Consumerbindung ueberein');
  return errors;
}

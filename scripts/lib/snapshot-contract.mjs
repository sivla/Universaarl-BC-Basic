import crypto from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';

export const SNAPSHOT_MANIFEST_PATH = 'exports/project-data/v1/snapshot-manifest.json';
export const SNAPSHOT_SCHEMA_PATH = 'governance/schemas/project-snapshot-manifest.schema.json';

export function canonicalJson(value) {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === 'object') return Object.fromEntries(Object.keys(item).sort().map((key) => [key, normalize(item[key])]));
    return item;
  };
  return `${JSON.stringify(normalize(value))}\n`;
}

export function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(value).digest('hex')}`;
}

export function buildPayloadList(projectIndex, readBlob) {
  const artifacts = [...(projectIndex.artifacts ?? [])].sort((left, right) => left.id.localeCompare(right.id));
  return artifacts.map((artifact) => ({
    id: artifact.id,
    path: artifact.path,
    selector: artifact.selector ?? null,
    sha256: sha256(readBlob(artifact.path))
  }));
}

export function buildSnapshotManifest({ binding, projectIndex, sourceCommitSha, readBlob }) {
  if (binding.bcProjectOsBinding?.status !== 'BOUND_BCPROJECTOS_RELEASE') throw new Error('BCProjectOS ist nicht an einen nachgewiesenen Release gebunden. Snapshotmanifest nicht erzeugt.');
  const twin = binding.consumers?.[0];
  const payloads = buildPayloadList(projectIndex, readBlob);
  const os = binding.bcProjectOsBinding;
  return {
    schemaVersion: 1,
    projectId: projectIndex.projectId,
    contractId: projectIndex.contractId,
    sourceCommitSha,
    indexPath: binding.producer.contractPath,
    consumer: {
      consumerId: twin.consumerId,
      repositoryUrl: twin.identity.repository.url,
      branch: twin.identity.repository.branch,
      access: twin.access
    },
    bcProjectOsRelease: {
      productId: os.productId,
      repositoryUrl: os.repositoryUrl,
      releaseVersion: os.releaseVersion,
      releaseTag: os.releaseTag,
      tagType: os.tagType,
      tagCommit: os.tagCommit,
      manifestPath: os.manifestPath,
      manifestSourceCommit: os.manifestSourceCommit,
      payloadBundleDigest: os.payloadBundleDigest
    },
    consumerBindingDigest: sha256(readBlob('governance/consumer-bindings.yaml')),
    payloadBundleDigest: sha256(canonicalJson(payloads)),
    payloads,
    validationStatus: 'validated'
  };
}

export function validateSnapshotManifest(manifest, schema) {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  return validate(manifest) ? [] : (validate.errors ?? []).map((error) => `${error.instancePath || '/'} ${error.message}`);
}

export function validateManifestDigests(manifest, readBlob) {
  const errors = [];
  const ids = manifest.payloads.map((item) => item.id);
  if (new Set(ids).size !== ids.length) errors.push('Payloadliste enthaelt doppelte IDs');
  if (JSON.stringify(ids) !== JSON.stringify([...ids].sort())) errors.push('Payloadliste ist nicht deterministisch nach ID sortiert');
  if (manifest.payloads.some((item) => item.path === SNAPSHOT_MANIFEST_PATH)) errors.push('Snapshotmanifest darf nicht Teil seiner eigenen Payloadliste sein');
  const expectedPayloads = manifest.payloads.map((item) => ({ ...item, sha256: sha256(readBlob(item.path)) }));
  for (let index = 0; index < manifest.payloads.length; index += 1) {
    if (manifest.payloads[index].sha256 !== expectedPayloads[index].sha256) errors.push(`${manifest.payloads[index].path}: Payload-Digest stimmt nicht mit dem Quell-Commit ueberein`);
  }
  if (manifest.payloadBundleDigest !== sha256(canonicalJson(expectedPayloads))) errors.push('payloadBundleDigest stimmt nicht mit der kanonischen Payloadliste ueberein');
  if (manifest.consumerBindingDigest !== sha256(readBlob('governance/consumer-bindings.yaml'))) errors.push('consumerBindingDigest stimmt nicht mit der commitgebundenen Consumerbindung ueberein');
  return errors;
}

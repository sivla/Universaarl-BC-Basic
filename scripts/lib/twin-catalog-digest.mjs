import { createHash } from 'node:crypto';

export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
export const canonicalBundleBytes = (records) => {
  const ordered = [...records].sort((a, b) => a.payloadPath < b.payloadPath ? -1 : a.payloadPath > b.payloadPath ? 1 : 0);
  return Buffer.from(ordered.map(record => `${record.payloadPath}\0${record.sizeBytes}\0${record.sha256}\n`).join(''), 'utf8');
};
export const canonicalBundleDigest = (records) => sha256(canonicalBundleBytes(records));

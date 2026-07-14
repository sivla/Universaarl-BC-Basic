import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalBundleBytes, canonicalBundleDigest } from '../../scripts/lib/twin-catalog-digest.mjs';

const records = [
  { payloadPath: 'payload/b.yaml', sizeBytes: 2, sha256: 'b'.repeat(64) },
  { payloadPath: 'payload/a.yaml', sizeBytes: 1, sha256: 'a'.repeat(64) }
];

test('Bundle-Digest ist von der Eingabereihenfolge unabhängig', () => {
  assert.equal(canonicalBundleDigest(records), canonicalBundleDigest([...records].reverse()));
  assert.equal(canonicalBundleBytes(records).toString('utf8'), `payload/a.yaml\0${1}\0${'a'.repeat(64)}\npayload/b.yaml\0${2}\0${'b'.repeat(64)}\n`);
});

test('Falscher Bundle-Digest wird nicht akzeptiert', () => {
  assert.notEqual(canonicalBundleDigest(records), '0'.repeat(64));
});

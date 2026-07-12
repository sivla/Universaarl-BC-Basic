import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import {
  DOCUMENT_CATALOG_ERROR,
  buildDocumentCatalog,
  canonicalCatalogBytes,
  validateDocumentCatalog
} from '../../scripts/lib/document-catalog.mjs';

const root = process.cwd();
const absolute = (relative) => path.join(root, ...relative.split('/'));
const lfBytes = (bytes) => Buffer.from(Buffer.from(bytes).toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
const index = YAML.parse(fs.readFileSync(absolute('exports/project-data/v1/index.yaml'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(absolute('governance/schemas/project-document-catalog.schema.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(absolute('exports/project-data/v1/document-catalog.json'), 'utf8'));
const clone = (value) => structuredClone(value);
const repositoryReader = (relative) => {
  const target = absolute(relative);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) throw new Error('Blob fehlt');
  return { bytes: lfBytes(fs.readFileSync(target)), gitMode: '100644' };
};
const validate = (candidate, readEntry = repositoryReader) => validateDocumentCatalog({ catalog: candidate, schema, projectIndex: index, readEntry });
const codes = (errors) => new Set(errors.map((error) => error.code));

test('vollstaendiger BC-Basic-Katalog bindet 32 Dokumente und 19 strukturierte Seiten', () => {
  assert.equal(catalog.documents.length, 32);
  assert.equal(catalog.documents.filter((document) => document.documentType === 'confluence-page').length, 19);
  assert.equal(new Set(catalog.documents.map((document) => document.sourcePath)).size, 32);
  assert.equal(new Set(catalog.documents.map((document) => document.documentId)).size, 32);
  assert.deepEqual(validate(catalog), []);
});

test('Katalogerzeugung ist bei unveraenderten Blobs bytegleich', () => {
  const first = canonicalCatalogBytes(buildDocumentCatalog(index, repositoryReader));
  const second = canonicalCatalogBytes(buildDocumentCatalog(index, repositoryReader));
  assert.deepEqual(first, second);
  assert.deepEqual(first, lfBytes(fs.readFileSync(absolute('exports/project-data/v1/document-catalog.json'))));
});

test('fehlender Dokumentblob scheitert isoliert', () => {
  const missing = catalog.documents[0].sourcePath;
  const errors = validate(catalog, (relative) => {
    if (relative === missing) throw new Error('isoliert entfernter Blob');
    return repositoryReader(relative);
  });
  assert.equal(codes(errors).has(DOCUMENT_CATALOG_ERROR.missingBlob), true);
});

test('manipulierter Dokumenthash scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents[0].contentSha256 = '0'.repeat(64);
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.hash), true);
});

test('Traversal im Dokumentpfad scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents[0].sourcePath = '../ausbruch.md';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.unsafePath), true);
});

test('doppelte Dokument-ID scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents[1].documentId = candidate.documents[0].documentId;
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.duplicateId), true);
});

test('fehlendes Parentziel scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents.find((document) => document.documentId === 'UABC-COMPANY').parentId = 'UABC-DOKUMENT-FEHLT';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.reference), true);
});

test('fehlendes Projekt-Referenzziel scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents.find((document) => document.documentId === 'UABC-COMPANY').referenceIds[0] = 'UABC-REQ-NICHT-VORHANDEN-001';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.reference), true);
});

test('Parentzyklus scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents.find((document) => document.documentId === 'UABC-PROJECT').parentId = 'UABC-COMPANY';
  candidate.documents.find((document) => document.documentId === 'UABC-COMPANY').parentId = 'UABC-PROJECT';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.cycle), true);
});

test('unzulässiger Dokumentdateityp scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents[0].sourcePath = candidate.documents[0].sourcePath.replace(/\.md$/, '.pdf');
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.fileType), true);
});

test('unsichere oder nicht freigegebene externe URL scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents[0].externalUrl = 'http://confluence.invalid/page/1';
  candidate.documents[0].pageId = '1';
  candidate.documents[0].spaceKey = 'UABC';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.url), true);
});

test('nicht durch den Branch-Index belegte Dokumentmetadaten scheitern isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents.find((document) => document.documentType === 'synthetic-demo-guide').phase = 'frei-erfunden';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.metadata), true);
});

test('nicht regulaerer Gitmodus scheitert isoliert', () => {
  const target = catalog.documents[0].sourcePath;
  const errors = validate(catalog, (relative) => {
    const entry = repositoryReader(relative);
    return relative === target ? { ...entry, gitMode: '100755' } : entry;
  });
  assert.equal(codes(errors).has(DOCUMENT_CATALOG_ERROR.gitMode), true);
});

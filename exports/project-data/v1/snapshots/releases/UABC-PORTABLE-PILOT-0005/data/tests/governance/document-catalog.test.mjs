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
const validatePageMutation = (mutateText) => {
  const target = catalog.documents.find((document) => document.documentType === 'confluence-page').sourcePath;
  return validate(catalog, (relative) => {
    const entry = repositoryReader(relative);
    return relative === target ? { ...entry, bytes: Buffer.from(mutateText(entry.bytes.toString('utf8')), 'utf8') } : entry;
  });
};

test('vollstaendiger BC-Basic-Katalog bindet 46 Dokumente und 28 strukturierte Seiten', () => {
  assert.equal(catalog.documents.length, 46);
  assert.equal(catalog.documents.filter((document) => document.documentType === 'confluence-page').length, 28);
  assert.equal(new Set(catalog.documents.map((document) => document.sourcePath)).size, 46);
  assert.equal(new Set(catalog.documents.map((document) => document.documentId)).size, 46);
  const catalogArtifactIds = new Set(catalog.documents.map((document) => document.artifactId));
  assert.equal(index.artifacts.filter((artifact) => artifact.id.startsWith('UABC-SRC-BCB-ONBOARDING-') && artifact.kindId.startsWith('openspec-')).every((artifact) => !catalogArtifactIds.has(artifact.id)), true, 'Technische OpenSpec-Quellen des aktiven Changes dürfen nicht als Projektdokumente klassifiziert werden');
  assert.equal(catalog.spaces.length, 3);
  assert.equal(catalog.spaces.every((space) => typeof space.purpose === 'string' && space.purpose.length > 0 && Array.isArray(space.audience) && space.audience.length > 0), true);
  assert.equal(catalog.navigationModules.length, 3);
  assert.equal(catalog.navigationNodes.length, 31);
  assert.equal(catalog.navigationNodes.filter((node) => node.nodeType === 'group').length, 3);
  assert.equal(catalog.navigationNodes.filter((node) => node.nodeType === 'page').length, 28);
  assert.equal(catalog.redirects.length, 19);
  const pages = catalog.documents.filter((document) => document.documentType === 'confluence-page');
  assert.equal(new Set(pages.map((document) => document.storyPageId)).size, 28);
  assert.deepEqual(Object.fromEntries(catalog.spaces.map((space) => [space.spaceId, pages.filter((page) => page.spaceId === space.spaceId).length])), {
    'UABC-SPACE-CUSTOMER': 12,
    'UABC-SPACE-PRODUCT': 8,
    'UABC-SPACE-CONSULTANT': 8
  });
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

test('fehlender interner Space scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.spaces.pop();
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.space), true);
});

test('doppelte interne Space-Reihenfolge scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.spaces[1].order = candidate.spaces[0].order;
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.space), true);
});

test('space-uebergreifender Parent scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents.find((document) => document.documentId === 'UABC-COMPANY').parentId = 'UABC-BCBPROJECT';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.space), true);
});

test('doppelte Seitenreihenfolge im Space scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents.find((document) => document.documentId === 'UABC-COMPANY').order = 0;
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.space), true);
});

test('doppelte Story-Page-ID scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.documents.find((document) => document.documentId === 'UABC-COMPANY').storyPageId = 'PAGE-UABC-000';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.space), true);
});

test('doppelte Navigationsmodul- oder Node-ID scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.navigationModules[1].moduleId = candidate.navigationModules[0].moduleId;
  candidate.navigationNodes[1].nodeId = candidate.navigationNodes[0].nodeId;
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.navigation), true);
});

test('unbekannter Navigationstyp oder Dokumentverweis scheitert isoliert', () => {
  const candidate = clone(catalog);
  const page = candidate.navigationNodes.find((node) => node.nodeType === 'page');
  page.nodeType = 'extern';
  page.documentId = 'UABC-DOKUMENT-FEHLT';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.navigation), true);
});

test('Navigation mit falschem Parent oder Zyklus scheitert isoliert', () => {
  const candidate = clone(catalog);
  const group = candidate.navigationNodes.find((node) => node.nodeType === 'group');
  const page = candidate.navigationNodes.find((node) => node.moduleId === group.moduleId && node.nodeType === 'page');
  group.parentNodeId = page.nodeId;
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.navigation), true);
});

test('doppelte Geschwisterreihenfolge in der Navigation scheitert isoliert', () => {
  const candidate = clone(catalog);
  const pages = candidate.navigationNodes.filter((node) => node.nodeType === 'page' && node.moduleId === 'UABC-NAV-CUSTOMER');
  pages[1].order = pages[0].order;
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.navigation), true);
});

test('ungueltiger initialState in der Navigation scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.navigationNodes[0].initialState = 'auto';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.navigation), true);
});

test('unvollstaendige Migrationsmatrix scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.redirects.pop();
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.redirect), true);
});

test('abweichendes Migrationsziel scheitert isoliert', () => {
  const candidate = clone(catalog);
  candidate.redirects[0].targetTitle = 'Nicht die Zielseite';
  assert.equal(codes(validate(candidate)).has(DOCUMENT_CATALOG_ERROR.redirect), true);
});

test('doppelter H1-Titel scheitert isoliert', () => assert.equal(codes(validatePageMutation((text) => `${text}\n# Doppelter Titel\n`)).has(DOCUMENT_CATALOG_ERROR.format), true));
test('fehlender Pflichtabschnitt scheitert isoliert', () => assert.equal(codes(validatePageMutation((text) => text.replace('## Referenzen', '### Referenzen'))).has(DOCUMENT_CATALOG_ERROR.format), true));
test('ungeschlossener Codeblock scheitert isoliert', () => assert.equal(codes(validatePageMutation((text) => `${text}\n\`\`\`text\nNicht geschlossen\n`)).has(DOCUMENT_CATALOG_ERROR.format), true));
test('roher JSON-Block scheitert isoliert', () => assert.equal(codes(validatePageMutation((text) => `${text}\n\`\`\`json\n{}\n\`\`\`\n`)).has(DOCUMENT_CATALOG_ERROR.format), true));
test('Tabelle mit mehr als vier Spalten scheitert isoliert', () => assert.equal(codes(validatePageMutation((text) => `${text}\n| A | B | C | D | E |\n|---|---|---|---|---|\n`)).has(DOCUMENT_CATALOG_ERROR.format), true));
test('ueberlange Inhaltszeile scheitert isoliert', () => assert.equal(codes(validatePageMutation((text) => `${text}\n${'x'.repeat(321)}\n`)).has(DOCUMENT_CATALOG_ERROR.format), true));
test('Verifikation ohne fachlichen Statusabschnitt scheitert isoliert', () => {
  const target = catalog.documents.find((document) => document.documentType === 'verification-plan').sourcePath;
  const errors = validate(catalog, (relative) => {
    const entry = repositoryReader(relative);
    return relative === target ? { ...entry, bytes: Buffer.from(entry.bytes.toString('utf8').replace('## Status', '### Status'), 'utf8') } : entry;
  });
  assert.equal(codes(errors).has(DOCUMENT_CATALOG_ERROR.format), true);
});

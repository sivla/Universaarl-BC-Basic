import crypto from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import YAML from 'yaml';

export const DOCUMENT_CATALOG_PATH = 'exports/project-data/v1/document-catalog.json';
export const DOCUMENT_CATALOG_SCHEMA_PATH = 'governance/schemas/project-document-catalog.schema.json';
export const DOCUMENT_CATALOG_ID = 'UABC-DOCUMENT-CATALOG-V1';

export const DOCUMENT_CATALOG_ERROR = Object.freeze({
  schema: 'DOKUMENT-SCHEMA-UNGUELTIG',
  identity: 'DOKUMENT-VERTRAG-UNGUELTIG',
  count: 'DOKUMENT-ANZAHL-ABWEICHUNG',
  index: 'DOKUMENT-INDEX-ABWEICHUNG',
  duplicateId: 'DOKUMENT-ID-DOPPELT',
  duplicatePath: 'DOKUMENT-PFAD-DOPPELT',
  unsafePath: 'DOKUMENT-PFAD-UNSICHER',
  missingBlob: 'DOKUMENT-BLOB-FEHLT',
  gitMode: 'DOKUMENT-GITMODUS-UNZULAESSIG',
  hash: 'DOKUMENT-HASH-ABWEICHUNG',
  fileType: 'DOKUMENT-DATEITYP-UNZULAESSIG',
  metadata: 'DOKUMENT-METADATEN-ABWEICHUNG',
  reference: 'DOKUMENT-REFERENZZIEL-FEHLT',
  cycle: 'DOKUMENT-HIERARCHIE-ZYKLUS',
  url: 'DOKUMENT-URL-UNSICHER'
});

const SAFE_PATH = /^(?![A-Za-z]:)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!\/)(?!.*[\\\u0000-\u001F\u007F])(?!.*\/\/)(?!.*(?:^|\/)\.(?:\/|$))(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\/$).+\.md$/;
const DOCUMENT_METADATA_FIELDS = ['artifactId', 'documentId', 'title', 'documentType', 'parentId', 'phase', 'process', 'status', 'ownerRefs', 'jiraRefs', 'referenceIds', 'lastReviewed', 'visibility', 'readiness', 'externalUrl', 'pageId', 'spaceKey'];

export const sha256Hex = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
export const canonicalCatalogBytes = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
export const safeDocumentPath = (value) => typeof value === 'string' && SAFE_PATH.test(value);

function add(errors, code, message) {
  errors.push({ code, message });
}

function sameArray(left, right) {
  return JSON.stringify(left ?? []) === JSON.stringify(right ?? []);
}

function frontmatterAndTitle(bytes) {
  const text = Buffer.from(bytes).toString('utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const metadata = match ? YAML.parse(match[1]) : null;
  const title = text.match(/^#\s+(.+?)\s*$/m)?.[1] ?? null;
  return { metadata, title };
}

function validOrigin(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.username === '' && parsed.password === '' && parsed.pathname === '/' && parsed.search === '' && parsed.hash === '' && value === parsed.origin;
  } catch {
    return false;
  }
}

export function collectReferenceSets(projectIndex) {
  const definitions = projectIndex?.documentCatalog?.referenceDefinitions ?? {};
  const owners = new Set(definitions.ownerRefs ?? []);
  const jira = new Set(definitions.jiraRefs ?? []);
  const all = new Set([...(definitions.projectRefs ?? []), ...owners, ...jira]);
  return { all, owners, jira };
}

function documentMetadata(document) {
  return Object.fromEntries(DOCUMENT_METADATA_FIELDS.map((field) => [field, document[field]]));
}

function semanticEqual(left, right) {
  const normalize = (value) => Array.isArray(value) ? value.map(normalize) : (value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, normalize(value[key])])) : value);
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

export function buildDocumentCatalog(projectIndex, readEntry) {
  const config = projectIndex?.documentCatalog ?? {};
  const markdownArtifacts = (projectIndex?.artifacts ?? []).filter((artifact) => artifact.format === 'markdown');
  const artifactById = new Map(markdownArtifacts.map((artifact) => [artifact.id, artifact]));
  const documents = (config.definitions ?? []).map((definition) => {
    const artifact = artifactById.get(definition.artifactId);
    if (!artifact) throw new Error(`${definition.artifactId}: Dokumentdefinition besitzt kein Markdown-Artefakt`);
    const entry = readEntry(artifact.path);
    return {
      artifactId: definition.artifactId,
      documentId: definition.documentId,
      title: definition.title,
      documentType: definition.documentType,
      sourcePath: artifact.path,
      parentId: definition.parentId,
      phase: definition.phase,
      process: definition.process,
      status: definition.status,
      ownerRefs: definition.ownerRefs,
      jiraRefs: definition.jiraRefs,
      referenceIds: definition.referenceIds,
      lastReviewed: definition.lastReviewed,
      contentSha256: sha256Hex(entry.bytes),
      visibility: definition.visibility,
      readiness: definition.readiness,
      externalUrl: definition.externalUrl,
      pageId: definition.pageId,
      spaceKey: definition.spaceKey
    };
  }).sort((left, right) => Buffer.from(left.sourcePath, 'utf8').compare(Buffer.from(right.sourcePath, 'utf8')));
  return {
    schemaVersion: 1,
    catalogId: config.catalogId,
    contractId: projectIndex.contractId,
    projectId: projectIndex.projectId,
    sourceIndexPath: 'exports/project-data/v1/index.yaml',
    allowedBranch: projectIndex.allowedBranch,
    commitBinding: config.commitResolution,
    readOnly: true,
    validationStatus: 'validated',
    allowedExternalOrigins: config.allowedExternalOrigins,
    documentCount: documents.length,
    confluenceDocumentCount: documents.filter((document) => document.documentType === 'confluence-page').length,
    documents
  };
}

function validatePageMetadata(document, bytes, errors) {
  const { metadata } = frontmatterAndTitle(bytes);
  if (!metadata || typeof metadata !== 'object') {
    add(errors, DOCUMENT_CATALOG_ERROR.metadata, `${document.sourcePath}: strukturierte Seitenmetadaten fehlen`);
    return;
  }
  const checks = [
    ['id', metadata.id, document.documentId],
    ['title', metadata.title, document.title],
    ['parent', metadata.parent ?? null, document.parentId],
    ['status', metadata.status, document.status],
    ['lastReviewed', metadata.lastReviewed ?? null, document.lastReviewed]
  ];
  for (const [field, actual, expected] of checks) if (actual !== expected) add(errors, DOCUMENT_CATALOG_ERROR.metadata, `${document.sourcePath}: ${field} stimmt nicht mit der Quelldatei ueberein`);
  for (const [field, actual, expected] of [
    ['owners', metadata.owners, document.ownerRefs],
    ['jiraRefs', metadata.jiraRefs, document.jiraRefs],
    ['referenceIds', metadata.referenceIds, document.referenceIds]
  ]) if (!sameArray(actual, expected)) add(errors, DOCUMENT_CATALOG_ERROR.metadata, `${document.sourcePath}: ${field} stimmt nicht mit der Quelldatei ueberein`);
}

function validateHierarchy(documents, errors) {
  const byId = new Map(documents.map((document) => [document.documentId, document]));
  for (const document of documents) {
    if (document.parentId !== null && !byId.has(document.parentId)) add(errors, DOCUMENT_CATALOG_ERROR.reference, `${document.documentId}: Parent ${document.parentId} fehlt im Katalog`);
  }
  for (const start of documents) {
    const visited = new Set();
    let current = start;
    while (current?.parentId !== null) {
      if (visited.has(current.documentId)) {
        add(errors, DOCUMENT_CATALOG_ERROR.cycle, `${start.documentId}: Parenthierarchie enthaelt einen Zyklus`);
        break;
      }
      visited.add(current.documentId);
      current = byId.get(current.parentId);
      if (!current) break;
    }
  }
}

export function validateDocumentCatalog({ catalog, schema, projectIndex, readEntry, referenceSets = null }) {
  const errors = [];
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  let schemaValid = false;
  try {
    const validate = ajv.compile(schema);
    schemaValid = validate(catalog);
    if (!schemaValid) for (const error of validate.errors ?? []) add(errors, DOCUMENT_CATALOG_ERROR.schema, `${error.instancePath || '/'} ${error.message}`);
  } catch (error) {
    add(errors, DOCUMENT_CATALOG_ERROR.schema, `Schema konnte nicht kompiliert werden: ${error.message}`);
  }

  const config = projectIndex?.documentCatalog ?? {};
  if (catalog?.catalogId !== DOCUMENT_CATALOG_ID || catalog?.projectId !== projectIndex?.projectId || catalog?.contractId !== projectIndex?.contractId || catalog?.allowedBranch !== projectIndex?.allowedBranch || catalog?.sourceIndexPath !== 'exports/project-data/v1/index.yaml') {
    add(errors, DOCUMENT_CATALOG_ERROR.identity, 'Katalog und Branch-Index besitzen nicht dieselbe Projekt-/Vertragsidentitaet');
  }
  if (config.path !== DOCUMENT_CATALOG_PATH || config.schemaPath !== DOCUMENT_CATALOG_SCHEMA_PATH || config.documentCount !== 32 || config.commitResolution !== 'allowed-branch-head-resolved-once') add(errors, DOCUMENT_CATALOG_ERROR.identity, 'Dokumentkatalog-Pointer im Branch-Index ist ungueltig');
  if (!sameArray(config.allowedExternalOrigins, catalog?.allowedExternalOrigins)) add(errors, DOCUMENT_CATALOG_ERROR.identity, 'Erlaubte externe Origins stimmen nicht zwischen Index und Katalog ueberein');

  const documents = Array.isArray(catalog?.documents) ? catalog.documents : [];
  if (catalog?.documentCount !== documents.length || documents.length !== 32) add(errors, DOCUMENT_CATALOG_ERROR.count, `Erwartet sind exakt 32 Dokumente, gefunden wurden ${documents.length}`);
  const pageCount = documents.filter((document) => document.documentType === 'confluence-page').length;
  if (catalog?.confluenceDocumentCount !== pageCount || pageCount !== 19) add(errors, DOCUMENT_CATALOG_ERROR.count, `Erwartet sind exakt 19 strukturierte Seiten, gefunden wurden ${pageCount}`);

  const markdownArtifacts = (projectIndex?.artifacts ?? []).filter((artifact) => artifact.format === 'markdown');
  const artifactById = new Map(markdownArtifacts.map((artifact) => [artifact.id, artifact]));
  const expectedPairs = new Set(markdownArtifacts.map((artifact) => `${artifact.id}\0${artifact.path}`));
  const actualPairs = new Set(documents.map((document) => `${document.artifactId}\0${document.sourcePath}`));
  if (expectedPairs.size !== 32 || actualPairs.size !== expectedPairs.size || [...expectedPairs].some((pair) => !actualPairs.has(pair))) add(errors, DOCUMENT_CATALOG_ERROR.index, 'Katalog und Markdown-Allowlist des Branch-Index sind nicht exakt mengengleich');

  const documentIds = new Set();
  const artifactIds = new Set();
  const sourcePaths = new Set();
  const refs = referenceSets ?? collectReferenceSets(projectIndex, readEntry);
  const origins = new Set(catalog?.allowedExternalOrigins ?? []);
  const definitions = new Map((config.definitions ?? []).map((definition) => [definition.artifactId, definition]));
  if (definitions.size !== 32 || (config.definitions ?? []).length !== 32) add(errors, DOCUMENT_CATALOG_ERROR.count, 'Branch-Index muss exakt 32 eindeutige Dokumentdefinitionen enthalten');
  for (const origin of origins) if (!validOrigin(origin)) add(errors, DOCUMENT_CATALOG_ERROR.url, `Erlaubte Origin ist keine sichere kanonische HTTPS-Origin: ${origin}`);

  for (const document of documents) {
    if (documentIds.has(document.documentId) || artifactIds.has(document.artifactId)) add(errors, DOCUMENT_CATALOG_ERROR.duplicateId, `${document.documentId}: Dokument- oder Artefakt-ID ist doppelt`);
    documentIds.add(document.documentId);
    artifactIds.add(document.artifactId);
    if (sourcePaths.has(document.sourcePath)) add(errors, DOCUMENT_CATALOG_ERROR.duplicatePath, `${document.sourcePath}: Dokumentpfad ist doppelt`);
    sourcePaths.add(document.sourcePath);

    if (!safeDocumentPath(document.sourcePath)) add(errors, DOCUMENT_CATALOG_ERROR.unsafePath, `${document.sourcePath}: Pfad ist nicht sicher repository-relativ`);
    const artifact = artifactById.get(document.artifactId);
    if (!artifact || artifact.path !== document.sourcePath) add(errors, DOCUMENT_CATALOG_ERROR.index, `${document.documentId}: Artefakt-ID und Quellpfad sind nicht gemeinsam positivgelistet`);
    if (!document.sourcePath?.endsWith('.md') || artifact?.format !== 'markdown') add(errors, DOCUMENT_CATALOG_ERROR.fileType, `${document.sourcePath}: nur positivgelistete Markdown-Dateien sind zulaessig`);
    const definition = definitions.get(document.artifactId);
    if (!definition || !semanticEqual(definition, documentMetadata(document))) add(errors, DOCUMENT_CATALOG_ERROR.metadata, `${document.documentId}: Katalogmetadaten weichen von der Branch-Index-Definition ab`);

    let entry;
    try { entry = readEntry(document.sourcePath); }
    catch (error) {
      add(errors, DOCUMENT_CATALOG_ERROR.missingBlob, `${document.sourcePath}: Git-Blob fehlt oder ist unlesbar (${error.message})`);
      continue;
    }
    if (entry.gitMode !== '100644') add(errors, DOCUMENT_CATALOG_ERROR.gitMode, `${document.sourcePath}: Git-Modus muss exakt 100644 sein`);
    if (sha256Hex(entry.bytes) !== document.contentSha256) add(errors, DOCUMENT_CATALOG_ERROR.hash, `${document.sourcePath}: SHA-256 stimmt nicht mit dem Git-Blob ueberein`);
    const { title } = frontmatterAndTitle(entry.bytes);
    if (document.documentType === 'confluence-page') validatePageMetadata(document, entry.bytes, errors);
    else if (title !== document.title) add(errors, DOCUMENT_CATALOG_ERROR.metadata, `${document.sourcePath}: H1-Titel stimmt nicht mit dem Katalog ueberein`);

    for (const owner of document.ownerRefs ?? []) if (!refs.owners.has(owner)) add(errors, DOCUMENT_CATALOG_ERROR.reference, `${document.documentId}: Owner ${owner} kann nicht aufgeloest werden`);
    for (const jira of document.jiraRefs ?? []) if (!refs.jira.has(jira)) add(errors, DOCUMENT_CATALOG_ERROR.reference, `${document.documentId}: Jira-Referenz ${jira} kann nicht aufgeloest werden`);
    for (const reference of document.referenceIds ?? []) if (!refs.all.has(reference)) add(errors, DOCUMENT_CATALOG_ERROR.reference, `${document.documentId}: Referenz ${reference} kann nicht aufgeloest werden`);

    if (document.externalUrl === null) {
      if (document.pageId !== null || document.spaceKey !== null) add(errors, DOCUMENT_CATALOG_ERROR.url, `${document.documentId}: externe Page-ID oder Space-Key ohne belegte URL ist unzulaessig`);
    } else {
      try {
        const external = new URL(document.externalUrl);
        if (external.protocol !== 'https:' || external.username !== '' || external.password !== '' || !origins.has(external.origin)) add(errors, DOCUMENT_CATALOG_ERROR.url, `${document.documentId}: externe URL ist nicht durch eine sichere Origin erlaubt`);
      } catch {
        add(errors, DOCUMENT_CATALOG_ERROR.url, `${document.documentId}: externe URL ist ungueltig`);
      }
    }
  }

  validateHierarchy(documents, errors);
  return errors;
}

export function materializeDocumentCatalog(catalog, projectIndex, readEntry) {
  return buildDocumentCatalog(projectIndex, readEntry);
}

export function formatDocumentCatalogErrors(errors) {
  return errors.map((error) => `${error.code}: ${error.message}`);
}

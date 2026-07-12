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
  url: 'DOKUMENT-URL-UNSICHER',
  space: 'DOKUMENT-SPACE-VERTRAG-UNGUELTIG',
  navigation: 'DOKUMENT-NAVIGATION-UNGUELTIG',
  redirect: 'DOKUMENT-MIGRATION-UNVOLLSTAENDIG',
  format: 'DOKUMENT-FORMAT-UNLESBAR'
});

const SAFE_PATH = /^(?![A-Za-z]:)(?![A-Za-z][A-Za-z0-9+.-]*:)(?!\/)(?!.*[\\\u0000-\u001F\u007F])(?!.*\/\/)(?!.*(?:^|\/)\.(?:\/|$))(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\/$).+\.md$/;
const DOCUMENT_METADATA_FIELDS = ['artifactId', 'documentId', 'title', 'documentType', 'parentId', 'phase', 'process', 'status', 'ownerRefs', 'jiraRefs', 'referenceIds', 'lastReviewed', 'visibility', 'readiness', 'externalUrl', 'pageId', 'spaceKey', 'spaceId', 'spaceType', 'order', 'storyPageId'];
const REQUIRED_SPACES = Object.freeze([
  { spaceId: 'UABC-SPACE-CUSTOMER', spaceType: 'customer-project', homeDocumentId: 'UABC-PROJECT' },
  { spaceId: 'UABC-SPACE-PRODUCT', spaceType: 'standard-product', homeDocumentId: 'UABC-BCBPROJECT' },
  { spaceId: 'UABC-SPACE-CONSULTANT', spaceType: 'consultant-internal', homeDocumentId: 'UABC-BLUEPRINT' }
]);
const REQUIRED_ROOT_COUNTS = Object.freeze({ 'UABC-SPACE-CUSTOMER': 6, 'UABC-SPACE-PRODUCT': 8, 'UABC-SPACE-CONSULTANT': 8 });

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

function markdownStructure(bytes) {
  const text = Buffer.from(bytes).toString('utf8').replace(/\r\n/g, '\n');
  const withoutFrontmatter = text.replace(/^---\n[\s\S]*?\n---\n/, '');
  const withoutMetadata = withoutFrontmatter.replace(/<!--\s*story-metadata[\s\S]*?-->/g, '');
  const headings = [];
  const tableWidths = [];
  let fence = null;
  let rawDataFence = false;
  let giantLine = false;
  for (const line of withoutMetadata.split('\n')) {
    const fenceMatch = line.match(/^\s*\x60{3}\s*([A-Za-z0-9_-]*)\s*$/);
    if (fenceMatch) {
      if (fence === null) {
        fence = fenceMatch[1].toLowerCase();
        rawDataFence ||= fence === 'yaml' || fence === 'yml' || fence === 'json';
      } else fence = null;
      continue;
    }
    if (fence !== null) continue;
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (heading) headings.push({ level: heading[1].length, title: heading[2] });
    if (/^\s*\|.*\|\s*$/.test(line)) tableWidths.push(Math.max(0, line.split('|').length - 2));
    if (line.length > 320 && !/^\s*(?:https:\/\/|<!--)/.test(line)) giantLine = true;
  }
  return { headings, tableWidths, fenceClosed: fence === null, rawDataFence, giantLine };
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
      spaceKey: definition.spaceKey,
      spaceId: definition.spaceId,
      spaceType: definition.spaceType,
      order: definition.order,
      storyPageId: definition.storyPageId
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
    spaces: config.spaces,
    navigationModules: config.navigationModules,
    navigationNodes: config.navigationNodes,
    redirects: config.redirects,
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
    ['lastReviewed', metadata.lastReviewed ?? null, document.lastReviewed],
    ['spaceId', metadata.spaceId, document.spaceId],
    ['spaceType', metadata.spaceType, document.spaceType],
    ['order', metadata.order, document.order],
    ['storyPageId', metadata.storyPageId, document.storyPageId]
  ];
  for (const [field, actual, expected] of checks) if (actual !== expected) add(errors, DOCUMENT_CATALOG_ERROR.metadata, `${document.sourcePath}: ${field} stimmt nicht mit der Quelldatei ueberein`);
  for (const [field, actual, expected] of [
    ['owners', metadata.owners, document.ownerRefs],
    ['jiraRefs', metadata.jiraRefs, document.jiraRefs],
    ['referenceIds', metadata.referenceIds, document.referenceIds]
  ]) if (!sameArray(actual, expected)) add(errors, DOCUMENT_CATALOG_ERROR.metadata, `${document.sourcePath}: ${field} stimmt nicht mit der Quelldatei ueberein`);
}

function validateMarkdownFormat(document, bytes, errors) {
  const { headings, tableWidths, fenceClosed, rawDataFence, giantLine } = markdownStructure(bytes);
  const h1 = headings.filter((heading) => heading.level === 1);
  const h2 = new Set(headings.filter((heading) => heading.level === 2).map((heading) => heading.title));
  if (h1.length !== 1 || h1[0]?.title !== document.title) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: genau ein H1-Titel muss dem Katalogtitel entsprechen`);
  if (h2.size < 2) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: mindestens zwei fachliche H2-Abschnitte sind erforderlich`);
  if (!h2.has('Referenzen')) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: Abschnitt \"Referenzen\" fehlt`);
  for (let index = 1; index < headings.length; index += 1) if (headings[index].level > headings[index - 1].level + 1) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: Ueberschriftenebene wird uebersprungen`);
  if (!fenceClosed) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: Codeblock ist nicht geschlossen`);
  if (rawDataFence) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: rohe YAML-/JSON-Bloecke gehoeren nicht in die lesbare Projektseite`);
  if (tableWidths.some((width) => width > 4)) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: Tabelle besitzt mehr als vier Spalten`);
  if (giantLine) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: ueberlange Inhaltszeile beeintraechtigt die Lesbarkeit`);
}

function validateVerificationFormat(document, bytes, errors) {
  const { headings, tableWidths, fenceClosed, giantLine } = markdownStructure(bytes);
  const h1 = headings.filter((heading) => heading.level === 1);
  const h2 = new Set(headings.filter((heading) => heading.level === 2).map((heading) => heading.title));
  const required = ['Status', 'Prüfbarer Umfang', 'Fachliche Ergebnisse', 'Offene Abweichungen und Wahrheitsgrenzen', 'Evidence und Referenzen', 'Technische Prüfungen'];
  if (h1.length !== 1 || h1[0]?.title !== document.title) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: Verifikation benoetigt genau den Katalogtitel als H1`);
  for (const section of required) if (!h2.has(section)) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: Verifikationsabschnitt \"${section}\" fehlt`);
  for (let index = 1; index < headings.length; index += 1) if (headings[index].level > headings[index - 1].level + 1) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: Ueberschriftenebene wird uebersprungen`);
  if (!fenceClosed || tableWidths.some((width) => width > 4) || giantLine) add(errors, DOCUMENT_CATALOG_ERROR.format, `${document.sourcePath}: technische Formatierung beeintraechtigt die lesbare Verifikation`);
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

function validateSpaces(catalog, config, documents, errors) {
  const pages = documents.filter((document) => document.documentType === 'confluence-page');
  const spaces = Array.isArray(catalog?.spaces) ? catalog.spaces : [];
  const configSpaces = Array.isArray(config?.spaces) ? config.spaces : [];
  if (spaces.length !== 3 || configSpaces.length !== 3 || !semanticEqual(spaces, configSpaces)) add(errors, DOCUMENT_CATALOG_ERROR.space, 'Index und Katalog muessen dieselben exakt drei internen Spaces definieren');
  const spaceById = new Map(spaces.map((space) => [space.spaceId, space]));
  const spaceOrders = new Set(spaces.map((space) => space.order));
  if (spaceById.size !== 3) add(errors, DOCUMENT_CATALOG_ERROR.space, 'Interne Space-IDs muessen eindeutig sein');
  if (spaceOrders.size !== 3 || ![0, 1, 2].every((order) => spaceOrders.has(order))) add(errors, DOCUMENT_CATALOG_ERROR.space, 'Interne Spaces muessen die eindeutige Reihenfolge 0, 1 und 2 besitzen');
  for (const required of REQUIRED_SPACES) {
    const actual = spaceById.get(required.spaceId);
    if (!actual || actual.spaceType !== required.spaceType || actual.homeDocumentId !== required.homeDocumentId || typeof actual.purpose !== 'string' || actual.purpose.trim() === '' || !Array.isArray(actual.audience) || actual.audience.length === 0 || actual.externalUrl !== null || actual.pageId !== null || actual.spaceKey !== null) add(errors, DOCUMENT_CATALOG_ERROR.space, `${required.spaceId}: Space-Identitaet, Zweck, Zielgruppe oder externe Wahrheitsgrenze ist ungueltig`);
  }
  const pageById = new Map(pages.map((page) => [page.documentId, page]));
  const storyIds = new Set();
  const orderKeys = new Set();
  for (const page of pages) {
    const space = spaceById.get(page.spaceId);
    if (!space || page.spaceType !== space.spaceType || !Number.isInteger(page.order) || page.order < 0 || typeof page.storyPageId !== 'string') add(errors, DOCUMENT_CATALOG_ERROR.space, `${page.documentId}: interne Space-Zuordnung ist unvollstaendig`);
    if (storyIds.has(page.storyPageId)) add(errors, DOCUMENT_CATALOG_ERROR.space, `${page.storyPageId}: Story-Page-ID ist doppelt`);
    storyIds.add(page.storyPageId);
    const orderKey = `${page.spaceId}\0${page.order}`;
    if (orderKeys.has(orderKey)) add(errors, DOCUMENT_CATALOG_ERROR.space, `${page.spaceId}: Reihenfolge ${page.order} ist doppelt`);
    orderKeys.add(orderKey);
    if (page.parentId !== null && pageById.get(page.parentId)?.spaceId !== page.spaceId) add(errors, DOCUMENT_CATALOG_ERROR.space, `${page.documentId}: Parent liegt nicht im selben Space`);
  }
  for (const space of spaces) {
    const roots = pages.filter((page) => page.spaceId === space.spaceId && page.parentId === null);
    if (roots.length !== REQUIRED_ROOT_COUNTS[space.spaceId] || !roots.some((root) => root.documentId === space.homeDocumentId)) add(errors, DOCUMENT_CATALOG_ERROR.space, `${space.spaceId}: Rootanzahl oder deklarierte Startseite ist ungueltig`);
    const orders = pages.filter((page) => page.spaceId === space.spaceId).map((page) => page.order).sort((left, right) => left - right);
    if (!orders.every((order, index) => order === index)) add(errors, DOCUMENT_CATALOG_ERROR.space, `${space.spaceId}: Seitenreihenfolge muss lueckenlos bei 0 beginnen`);
  }

  const redirects = Array.isArray(catalog?.redirects) ? catalog.redirects : [];
  const configRedirects = Array.isArray(config?.redirects) ? config.redirects : [];
  if (redirects.length !== 19 || configRedirects.length !== 19 || !semanticEqual(redirects, configRedirects)) add(errors, DOCUMENT_CATALOG_ERROR.redirect, 'Index und Katalog muessen dieselben 19 Migrationseintraege enthalten');
  const redirectIds = new Set();
  const redirectStoryIds = new Set();
  const redirectPaths = new Set();
  for (const redirect of redirects) {
    if (redirectIds.has(redirect.documentId)) add(errors, DOCUMENT_CATALOG_ERROR.redirect, `${redirect.documentId}: Migrationseintrag ist doppelt`);
    if (redirectStoryIds.has(redirect.storyPageId) || redirectPaths.has(redirect.sourcePath)) add(errors, DOCUMENT_CATALOG_ERROR.redirect, `${redirect.documentId}: Story-Page-ID oder Quellpfad ist in der Migrationsmatrix doppelt`);
    redirectIds.add(redirect.documentId);
    redirectStoryIds.add(redirect.storyPageId);
    redirectPaths.add(redirect.sourcePath);
    const page = pageById.get(redirect.documentId);
    if (!page || redirect.storyPageId !== page.storyPageId || redirect.sourcePath !== page.sourcePath || redirect.targetTitle !== page.title || redirect.targetParentId !== page.parentId || redirect.migrationStatus !== 'migrated-in-place') add(errors, DOCUMENT_CATALOG_ERROR.redirect, `${redirect.documentId}: Migrationseintrag stimmt nicht mit der Zielseite ueberein`);
  }
  const migratedPages = pages.filter((page) => redirectIds.has(page.documentId));
  const newPages = pages.filter((page) => !redirectIds.has(page.documentId));
  if (migratedPages.length !== 19 || newPages.length !== 9 || migratedPages.some((page) => !redirectIds.has(page.documentId)) || newPages.some((page) => redirectIds.has(page.documentId))) add(errors, DOCUMENT_CATALOG_ERROR.redirect, 'Migrationsmatrix muss exakt 19 Altseiten abdecken und neun neue Roots getrennt halten');
}

function validateNavigation(catalog, config, documents, errors) {
  const modules = Array.isArray(catalog?.navigationModules) ? catalog.navigationModules : [];
  const configModules = Array.isArray(config?.navigationModules) ? config.navigationModules : [];
  const nodes = Array.isArray(catalog?.navigationNodes) ? catalog.navigationNodes : [];
  const configNodes = Array.isArray(config?.navigationNodes) ? config.navigationNodes : [];
  if (modules.length !== 3 || configModules.length !== 3 || !semanticEqual(modules, configModules)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, 'Index und Katalog muessen dieselben exakt drei Navigationsmodule definieren');
  if (nodes.length !== 31 || configNodes.length !== 31 || !semanticEqual(nodes, configNodes)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, 'Index und Katalog muessen dieselben drei Gruppen- und 28 Seitennodes definieren');

  const spaces = new Map((catalog?.spaces ?? []).map((space) => [space.spaceId, space]));
  const moduleById = new Map();
  const moduleOrders = new Set();
  const moduleSpaces = new Set();
  for (const module of modules) {
    if (!module || typeof module !== 'object' || moduleById.has(module.moduleId)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${module?.moduleId ?? 'unbekannt'}: Modul-ID ist doppelt oder ungueltig`);
    else moduleById.set(module.moduleId, module);
    if (moduleOrders.has(module?.order)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${module?.moduleId ?? 'unbekannt'}: Modulreihenfolge ist doppelt`);
    moduleOrders.add(module?.order);
    if (moduleSpaces.has(module?.spaceId)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${module?.moduleId ?? 'unbekannt'}: Space besitzt mehr als ein Navigationsmodul`);
    moduleSpaces.add(module?.spaceId);
    const space = spaces.get(module?.spaceId);
    if (!space || module?.title !== space.title || module?.order !== space.order) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${module?.moduleId ?? 'unbekannt'}: Modul verweist nicht konsistent auf einen Space`);
  }
  if (moduleOrders.size !== 3 || ![0, 1, 2].every((order) => moduleOrders.has(order))) add(errors, DOCUMENT_CATALOG_ERROR.navigation, 'Navigationsmodule muessen lueckenlos in der Reihenfolge 0, 1 und 2 liegen');

  const pages = new Map(documents.filter((document) => document.documentType === 'confluence-page').map((document) => [document.documentId, document]));
  const nodeById = new Map();
  const pageDocumentIds = new Set();
  const siblingOrders = new Set();
  for (const node of nodes) {
    if (!node || typeof node !== 'object' || nodeById.has(node.nodeId)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node?.nodeId ?? 'unbekannt'}: Node-ID ist doppelt oder ungueltig`);
    else nodeById.set(node.nodeId, node);
    if (!moduleById.has(node?.moduleId)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node?.nodeId ?? 'unbekannt'}: Navigationsmodul ${node?.moduleId ?? 'fehlt'} ist unbekannt`);
    if (!['group', 'page'].includes(node?.nodeType)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node?.nodeId ?? 'unbekannt'}: Node-Typ ist unbekannt`);
    if (!['expanded', 'collapsed'].includes(node?.initialState)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node?.nodeId ?? 'unbekannt'}: initialState muss expanded oder collapsed sein`);
    const orderKey = `${node?.moduleId}\0${node?.parentNodeId ?? '<root>'}\0${node?.order}`;
    if (siblingOrders.has(orderKey)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node?.nodeId ?? 'unbekannt'}: Reihenfolge unter demselben Parent ist doppelt`);
    siblingOrders.add(orderKey);
    if (node?.nodeType === 'group') {
      if (node.parentNodeId !== null || node.documentId !== null) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node.nodeId}: Gruppennode darf weder Parent noch Dokument besitzen`);
    } else if (node?.nodeType === 'page') {
      const page = pages.get(node.documentId);
      if (!page || page.title !== node.title || page.order !== node.order) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node.nodeId}: Seitennode verweist nicht konsistent auf ein Katalogdokument`);
      if (pageDocumentIds.has(node.documentId)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node.nodeId}: Dokument ${node.documentId} ist mehrfach in der Navigation enthalten`);
      pageDocumentIds.add(node.documentId);
    }
  }

  for (const node of nodes) {
    if (node?.parentNodeId !== null) {
      const parent = nodeById.get(node.parentNodeId);
      if (!parent || parent.moduleId !== node.moduleId || !['group','page'].includes(parent.nodeType)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node?.nodeId ?? 'unbekannt'}: Parentnode fehlt oder liegt in einem anderen Modul`);
    }
    const visited = new Set();
    let current = node;
    let depth = 0;
    while (current) {
      if (visited.has(current.nodeId)) {
        add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node?.nodeId ?? 'unbekannt'}: Navigation enthaelt einen Zyklus`);
        break;
      }
      visited.add(current.nodeId);
      depth += 1;
      if (depth > 3) {
        add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${node?.nodeId ?? 'unbekannt'}: Navigation ueberschreitet die maximale Tiefe 3`);
        break;
      }
      current = current.parentNodeId === null ? null : nodeById.get(current.parentNodeId);
    }
  }

  for (const module of modules) {
    const moduleNodes = nodes.filter((node) => node.moduleId === module.moduleId);
    const roots = moduleNodes.filter((node) => node.nodeType === 'group' && node.parentNodeId === null);
    if (roots.length !== 1 || roots[0]?.title !== module.title || roots[0]?.order !== 0) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${module.moduleId}: exakt eine passende Root-Gruppe ist erforderlich`);
    const pageOrders = moduleNodes.filter((node) => node.nodeType === 'page').map((node) => node.order).sort((left, right) => left - right);
    if (!pageOrders.every((order, index) => order === index)) add(errors, DOCUMENT_CATALOG_ERROR.navigation, `${module.moduleId}: Seitennodes muessen lueckenlos bei 0 beginnen`);
  }
  if (nodes.filter((node) => node.nodeType === 'group').length !== 3 || nodes.filter((node) => node.nodeType === 'page').length !== 28 || pageDocumentIds.size !== 28 || [...pages.keys()].some((documentId) => !pageDocumentIds.has(documentId))) add(errors, DOCUMENT_CATALOG_ERROR.navigation, 'Navigation muss exakt drei Space-Gruppen und jede der 28 Seiten genau einmal enthalten');
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
  if (config.path !== DOCUMENT_CATALOG_PATH || config.schemaPath !== DOCUMENT_CATALOG_SCHEMA_PATH || config.documentCount !== 43 || config.commitResolution !== 'allowed-branch-head-resolved-once') add(errors, DOCUMENT_CATALOG_ERROR.identity, 'Dokumentkatalog-Pointer im Branch-Index ist ungueltig');
  if (!sameArray(config.allowedExternalOrigins, catalog?.allowedExternalOrigins)) add(errors, DOCUMENT_CATALOG_ERROR.identity, 'Erlaubte externe Origins stimmen nicht zwischen Index und Katalog ueberein');

  const documents = Array.isArray(catalog?.documents) ? catalog.documents : [];
  if (catalog?.documentCount !== documents.length || documents.length !== 43) add(errors, DOCUMENT_CATALOG_ERROR.count, `Erwartet sind exakt 43 Dokumente, gefunden wurden ${documents.length}`);
  const pageCount = documents.filter((document) => document.documentType === 'confluence-page').length;
  if (catalog?.confluenceDocumentCount !== pageCount || pageCount !== 28) add(errors, DOCUMENT_CATALOG_ERROR.count, `Erwartet sind exakt 28 strukturierte Seiten, gefunden wurden ${pageCount}`);

  const markdownArtifacts = (projectIndex?.artifacts ?? []).filter((artifact) => artifact.format === 'markdown');
  const artifactById = new Map(markdownArtifacts.map((artifact) => [artifact.id, artifact]));
  const expectedPairs = new Set(markdownArtifacts.map((artifact) => `${artifact.id}\0${artifact.path}`));
  const actualPairs = new Set(documents.map((document) => `${document.artifactId}\0${document.sourcePath}`));
  if (expectedPairs.size !== 43 || actualPairs.size !== expectedPairs.size || [...expectedPairs].some((pair) => !actualPairs.has(pair))) add(errors, DOCUMENT_CATALOG_ERROR.index, 'Katalog und Markdown-Allowlist des Branch-Index sind nicht exakt mengengleich');

  const documentIds = new Set();
  const artifactIds = new Set();
  const sourcePaths = new Set();
  const refs = referenceSets ?? collectReferenceSets(projectIndex, readEntry);
  const origins = new Set(catalog?.allowedExternalOrigins ?? []);
  const definitions = new Map((config.definitions ?? []).map((definition) => [definition.artifactId, definition]));
  if (definitions.size !== 43 || (config.definitions ?? []).length !== 43) add(errors, DOCUMENT_CATALOG_ERROR.count, 'Branch-Index muss exakt 43 eindeutige Dokumentdefinitionen enthalten');
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
    if (document.documentType === 'confluence-page') {
      validatePageMetadata(document, entry.bytes, errors);
      validateMarkdownFormat(document, entry.bytes, errors);
    } else {
      if (title !== document.title) add(errors, DOCUMENT_CATALOG_ERROR.metadata, `${document.sourcePath}: H1-Titel stimmt nicht mit dem Katalog ueberein`);
      if (document.documentType === 'verification-plan') validateVerificationFormat(document, entry.bytes, errors);
    }

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
  validateSpaces(catalog, config, documents, errors);
  validateNavigation(catalog, config, documents, errors);
  return errors;
}

export function materializeDocumentCatalog(catalog, projectIndex, readEntry) {
  return buildDocumentCatalog(projectIndex, readEntry);
}

export function formatDocumentCatalogErrors(errors) {
  return errors.map((error) => `${error.code}: ${error.message}`);
}

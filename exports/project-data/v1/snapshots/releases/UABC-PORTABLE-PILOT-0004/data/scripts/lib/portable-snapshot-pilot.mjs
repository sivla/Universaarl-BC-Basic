import crypto from 'node:crypto';
import YAML from 'yaml';

export const PORTABLE_SOURCE_PATH = 'project/bc-basic/portable-snapshot-pilot.yaml';
export const PORTABLE_SCHEMA_PATH = 'governance/schemas/portable-snapshot-pilot.schema.json';
export const PORTABLE_RELEASE_SCHEMA_PATH = 'governance/schemas/portable-snapshot-release.schema.json';

export const canonicalJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
export const sha256Hex = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
export const normalizeContent = (value) => `${String(value).replace(/\r\n/g, '\n').split('\n').map((line) => line.replace(/[ \t]+$/u, '')).join('\n').replace(/\n+$/u, '')}\n`;
export const safePath = (value) => typeof value === 'string' && value.length > 0 && !/^[A-Za-z]:|^[A-Za-z][A-Za-z0-9+.-]*:|^\//u.test(value) && !value.includes('\\') && !value.split('/').some((part) => ['', '.', '..'].includes(part));

export const PROJECT_INDEX_PATH = 'exports/project-data/v1/index.yaml';

export function buildProjectBundle({ producerCommit, indexBytes, readBytes }) {
  if (!/^[a-f0-9]{40}$/u.test(producerCommit ?? '') || !Buffer.isBuffer(indexBytes) || typeof readBytes !== 'function') throw new Error('PILOT-PROJEKTDATEN: Commit, Indexbytes oder Blobleser fehlen');
  let index;
  try { index = YAML.parse(indexBytes.toString('utf8')); } catch (error) { throw new Error(`PILOT-PROJEKTINDEX: ${error.message}`); }
  if (index?.schemaVersion !== 1 || index?.contractId !== 'UABC-PROJECT-DATA-V1' || index?.projectId !== 'UABC-BC-BASIC-001' || index?.routeKey !== 'bc-basic' || !Array.isArray(index?.artifacts) || index.artifacts.length < 1) throw new Error('PILOT-PROJEKTINDEX: Identitaet oder Artefaktliste ist ungueltig');
  const ids = new Set(); const paths = new Set();
  const files = index.artifacts.map((artifact) => {
    if (!artifact?.id || ids.has(artifact.id) || !safePath(artifact?.path) || paths.has(artifact.path) || artifact.required !== true || !artifact.kindId || !artifact.format) throw new Error(`PILOT-PROJEKTINDEX: Artefakt ${artifact?.id ?? 'unbekannt'} ist ungueltig oder doppelt`);
    ids.add(artifact.id); paths.add(artifact.path);
    const bytes = Buffer.from(readBytes(artifact.path));
    if (bytes.length < 1) throw new Error(`PILOT-PROJEKTDATEN: ${artifact.path} ist leer`);
    return Object.freeze({ id: artifact.id, kindId: artifact.kindId, sourcePath: artifact.path, format: artifact.format, selector: artifact.selector ?? null, bytes });
  });
  return Object.freeze({ producerCommit, index: Object.freeze(index), indexBytes: Buffer.from(indexBytes), files: Object.freeze(files) });
}

const add = (errors, code, message) => errors.push(`${code}: ${message}`);
const unique = (values) => new Set(values).size === values.length;
const asPages = (confluence) => [...(confluence.roots ?? []), ...(confluence.children ?? [])];
const RELEASE_FILES = Object.freeze({
  payload: 'payload.json',
  fragment: 'catalog-fragment.json',
  manifest: 'manifest.json'
});

export function validatePortableContract(contract, confluence) {
  const errors = [];
  const pages = asPages(confluence);
  const pageIds = new Set(pages.map((page) => page.storyPageId));
  const spaces = confluence.spaces ?? [];
  if (contract?.schemaVersion !== 1 || contract?.contractId !== 'UABC-PORTABLE-SNAPSHOT-PILOT-V1') add(errors, 'PILOT-IDENTITAET', 'Schema oder Vertrags-ID ist ungueltig');
  if (contract?.classification !== 'synthetic-local-simulation' || contract?.simulation !== true) add(errors, 'PILOT-SIMULATION', 'Pilot muss vollstaendig synthetisch bleiben');
  if (spaces.length !== 3 || JSON.stringify(spaces.map((item) => item.spaceId)) !== JSON.stringify(contract?.sourceInventory?.invariants?.spaceIds)) add(errors, 'PILOT-SPACES', 'Exakt die bestehenden drei Spaces sind erforderlich');
  if (pages.length !== 28 || !unique(pages.map((page) => page.storyPageId)) || !unique(pages.map((page) => page.documentId))) add(errors, 'PILOT-SEITEN', '28 stabile Seiten- und Dokument-IDs sind erforderlich');
  const support = pages.find((page) => page.storyPageId === 'PAGE-UABC-000');
  const migration = pages.find((page) => page.storyPageId === contract?.sourceInventory?.invariants?.dataMigrationPageId);
  if (support?.documentId !== contract?.sourceInventory?.invariants?.customerSupportRoot || support?.title !== '00 Hilfe und Projektumgebung') add(errors, 'PILOT-SUPPORT', 'Kundensupportwurzel muss 00 Support bleiben');
  if (migration?.title !== '02.1 Datenmigration' || migration?.parentId !== 'UABC-BCBDELIVERABLES' || migration?.spaceId !== 'UABC-SPACE-CUSTOMER') add(errors, 'PILOT-DATENMIGRATION', '02.1 Datenmigration muss dauerhafte Kundenseite bleiben');
  const checkpoint = contract?.sourceInventory?.checkpoint;
  if (!checkpoint?.checkpointId || !checkpoint?.capturedAt || checkpoint?.mode !== 'local-simulation' || checkpoint?.externalReadPerformed !== false || !/^[a-f0-9]{40}$/u.test(checkpoint?.producerCommitProvenance ?? '')) add(errors, 'PILOT-CHECKPOINT', 'Lokaler Sync-Checkpoint ist unvollstaendig');

  const allowedTypes = ['added', 'modified', 'renamed', 'moved', 'deleted', 'inaccessible', 'conflicted'];
  if (JSON.stringify(contract?.deltaContract?.allowedTypes) !== JSON.stringify(allowedTypes)) add(errors, 'PILOT-DELTA-TYPEN', 'Deltaarten sind unvollstaendig oder ungeordnet');
  const changes = contract?.deltaContract?.changes ?? [];
  if (!unique(changes.map((item) => item.changeId)) || !allowedTypes.every((type) => changes.some((item) => item.type === type))) add(errors, 'PILOT-DELTA-MENGE', 'Jede Deltaart braucht genau adressierbare Beispiele');
  const specialSources = new Set(['PAGE-UABC-LEGACY-001', 'UABC-CONF-EXTERNAL-001', 'UABC-CONF-GAP-001']);
  for (const change of changes) {
    if (!allowedTypes.includes(change.type)) add(errors, 'PILOT-DELTA-UNBEKANNT', `${change.changeId}: Deltaart ist ungueltig`);
    if (!pageIds.has(change.sourceId) && !specialSources.has(change.sourceId)) add(errors, 'PILOT-QUELLE-UNBEKANNT', `${change.changeId}: Quelle ${change.sourceId} ist unbekannt`);
    if ((change.type === 'deleted') !== (change.tombstone === true)) add(errors, 'PILOT-TOMBSTONE', `${change.changeId}: Tombstone passt nicht zur Deltaart`);
    for (const ref of [change.predecessorId, change.successorId].filter(Boolean)) if (!pageIds.has(ref) && !specialSources.has(ref)) add(errors, 'PILOT-DELTA-REFERENZ', `${change.changeId}: Vorgaenger oder Nachfolger ist unbekannt`);
    if (change.type === 'added' && change.predecessorId !== null) add(errors, 'PILOT-DELTA-REFERENZ', `${change.changeId}: added darf keinen Vorgaenger besitzen`);
    if (change.type === 'inaccessible' && (change.predecessorId !== null || change.successorId !== null)) add(errors, 'PILOT-DELTA-REFERENZ', `${change.changeId}: inaccessible darf keine erfundene Relation besitzen`);
  }
  for (const knowledge of contract?.knowledgeChanges ?? []) {
    if (!['approved', 'pending', 'rejected'].includes(knowledge.reviewStatus)) add(errors, 'PILOT-WISSENSREVIEW', `${knowledge.knowledgeId}: Reviewstatus ist ungueltig`);
    if (knowledge.reviewStatus !== 'approved' && (knowledge.authoritative !== false || knowledge.truthTarget !== null)) add(errors, 'PILOT-WISSENSWAHRHEIT', `${knowledge.knowledgeId}: ungeprueftes Wissen darf keine Wahrheit sein`);
    if (knowledge.reviewStatus === 'approved' && knowledge.authoritative !== true) add(errors, 'PILOT-WISSENSWAHRHEIT', `${knowledge.knowledgeId}: freigegebenes Wissen muss explizit autoritativ sein`);
  }
  for (const coverage of contract?.coverage ?? []) {
    if (!coverage.ownerRef || !coverage.workshopRef || !['covered', 'gap', 'conflicted', 'excluded'].includes(coverage.status)) add(errors, 'PILOT-COVERAGE', `${coverage.coverageId}: Coverage ist unvollstaendig`);
    for (const ref of coverage.sourceIds ?? []) if (!pageIds.has(ref) && !specialSources.has(ref)) add(errors, 'PILOT-QUELLE-UNBEKANNT', `${coverage.coverageId}: Quelle ${ref} ist unbekannt`);
  }
  for (const contradiction of contract?.contradictions ?? []) if (contradiction.status === 'open' && (contradiction.resolution !== null || contradiction.authoritativeSourceId !== null)) add(errors, 'PILOT-WIDERSPRUCH', `${contradiction.contradictionId}: offener Widerspruch darf keine Aufloesung behaupten`);
  for (const row of contract?.brownfieldReconciliation?.rows ?? []) {
    if (!['import', 'exclude', 'gap', 'conflict'].includes(row.decision) || !row.ownerRef || !row.workshopRef) add(errors, 'PILOT-RECONCILIATION', `${row.rowId}: Reconciliation ist unvollstaendig`);
    if (row.artifactPath !== null && !safePath(row.artifactPath)) add(errors, 'PILOT-PFAD', `${row.rowId}: Artefaktpfad ist nicht portabel`);
  }
  const release = contract?.release;
  for (const path of [release?.releaseDirectory, release?.currentPointerPath, release?.catalogPath]) if (!safePath(path)) add(errors, 'PILOT-PFAD', `Releasepfad ist nicht repository-relativ: ${path}`);
  if (release?.bindingStatus !== 'BOUND_BCPROJECTOS_RELEASE' || release?.pendingReason !== null || release?.consumerEligible !== true || release?.publishEligible !== true) add(errors, 'PILOT-RELEASEBINDUNG', 'Nur ein vollstaendig gebundener Release darf gelesen und zur kontrollierten Publikation uebergeben werden');
  if (release?.immutable !== true || release?.byteContract !== 'identical-canonical-bytes' || JSON.stringify(release?.transports) !== JSON.stringify(['filesystem', 'https'])) add(errors, 'PILOT-IMMUTABILITAET', 'Release- und Transportvertrag ist ungueltig');
  if (JSON.stringify(release?.requiredReleaseEvidence) !== JSON.stringify(['annotatedTag', 'peeledCommit', 'finalManifest', 'productDigest', 'platformMatrix'])) add(errors, 'PILOT-RELEASEEVIDENCE', 'Echte Releasebindung benoetigt Tag, Commit, Manifest, Produktdigest und Plattformmatrix');
  const spectra = release?.spectraReleaseBinding ?? {};
  if (spectra.productId !== 'spectra' || spectra.technicalRepositoryName !== 'BCProjectOS' || spectra.repositoryUrl !== 'https://github.com/sivla/BCProjectOS.git' || spectra.releaseTag !== `spectra-v${spectra.releaseVersion}` || !/^spectra-v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(spectra.releaseTag ?? '') || !['annotatedTagObject', 'peeledCommit', 'manifestSourceCommit', 'sourceTree'].every((key) => /^[a-f0-9]{40}$/u.test(spectra[key] ?? '')) || spectra.manifestPath !== `release/versions/${spectra.releaseVersion}/release-manifest.json` || spectra.consumerMode !== 'INSTALLABLE_BLUEPRINT' || spectra.installableBlueprint !== true || spectra.digestAlgorithm !== 'SHA-256' || !/^[a-f0-9]{64}$/u.test(spectra.payloadBundleDigest ?? '') || spectra.platformEvidenceStatus !== 'passed' || !/^https:\/\/github\.com\/sivla\/BCProjectOS\/actions\/runs\/\d+$/u.test(spectra.platformEvidenceRun ?? '') || !safePath(spectra.evidencePath)) add(errors, 'PILOT-SPECTRA-EVIDENCE', 'Spectra-Releasebindung ist unvollstaendig oder nicht unveraenderlich belegt');
  if (contract?.customerCatalog?.producerCustomerId !== contract?.customerId || contract?.customerCatalog?.projects?.some((item) => item.projectId !== contract.projectId || item.snapshotReleaseId !== release?.releaseId) || contract?.customerCatalog?.foreignCustomerFixturesOnly !== true) add(errors, 'PILOT-KUNDENGRENZE', 'Producer darf nur die eigene Kundeninstanz und eigene Projekte veroeffentlichen');
  return errors;
}

function inventoryFor(contract, confluence, readText) {
  return asPages(confluence).map((page) => {
    const normalized = normalizeContent(readText(page.sourcePath));
    return {
      sourceId: page.storyPageId,
      documentId: page.documentId,
      sourcePath: page.sourcePath,
      sourceVersion: contract.sourceInventory.sourceVersion,
      normalizedContentSha256: sha256Hex(Buffer.from(normalized, 'utf8')),
      attachmentDigests: [],
      parentId: page.parentId,
      spaceId: page.spaceId,
      checkpointId: contract.sourceInventory.checkpoint.checkpointId
    };
  }).sort((left, right) => left.sourceId.localeCompare(right.sourceId));
}

export function buildPortableArtifacts(contract, confluence, readText, projectBundle) {
  const contractErrors = validatePortableContract(contract, confluence);
  if (contractErrors.length) throw new Error(contractErrors.join('\n'));
  if (!projectBundle || projectBundle.producerCommit !== contract.release.producerCommitProvenance || projectBundle.index?.contractId !== 'UABC-PROJECT-DATA-V1' || projectBundle.index?.projectId !== contract.projectId) throw new Error('PILOT-PROJEKTDATEN: Der commitgebundene Projektindex fehlt oder widerspricht dem Release');
  const inventory = inventoryFor(contract, confluence, readText);
  const reconciliationOverrides = new Map(contract.brownfieldReconciliation.rows.map((row) => [row.sourceId, row]));
  const defaultWorkshop = { 'UABC-SPACE-CUSTOMER': 'UABC-MTG-001', 'UABC-SPACE-PRODUCT': 'UABC-MTG-002', 'UABC-SPACE-CONSULTANT': 'UABC-MTG-003' };
  const expandedReconciliation = [
    ...inventory.map((page, index) => reconciliationOverrides.get(page.sourceId) ?? {
      rowId: `UABC-BF-PAGE-${String(index + 1).padStart(3, '0')}`,
      sourceId: page.sourceId,
      decision: 'import',
      artifactPath: page.sourcePath,
      ownerRef: 'P-PILOT-LEAD-001',
      workshopRef: defaultWorkshop[page.spaceId],
      baselineStatus: 'matched',
      openGap: null
    }),
    ...contract.brownfieldReconciliation.rows.filter((row) => !inventory.some((page) => page.sourceId === row.sourceId))
  ];
  const releaseDir = contract.release.releaseDirectory;
  const payloadPath = `${releaseDir}/${RELEASE_FILES.payload}`;
  const fragmentPath = `${releaseDir}/${RELEASE_FILES.fragment}`;
  const manifestPath = `${releaseDir}/${RELEASE_FILES.manifest}`;
  const payload = {
    schemaVersion: 1,
    contractId: contract.contractId,
    releaseId: contract.release.releaseId,
    customerId: contract.customerId,
    projectId: contract.projectId,
    classification: contract.classification,
    sourceInventory: { checkpoint: contract.sourceInventory.checkpoint, pages: inventory },
    deltas: contract.deltaContract.changes,
    views: {
      customer: {
        approvedKnowledgeChanges: contract.knowledgeChanges.filter((item) => item.reviewStatus === 'approved'),
        coverage: contract.coverage
      },
      internal: {
        knowledgeChanges: contract.knowledgeChanges,
        contradictions: contract.contradictions,
        brownfieldReconciliation: { baseline: contract.brownfieldReconciliation.baseline, rows: expandedReconciliation }
      }
    },
    visibilityBoundary: { allowed: contract.release.visibilityClasses, customerSelector: 'views.customer', internalSelector: 'views.internal', foreignCustomerDataAllowed: false },
    truthBoundary: { liveExecutionClaimed: false, externalSyncClaimed: false, uncheckedKnowledgePromoted: false }
  };
  const payloadBytes = Buffer.from(canonicalJson(payload), 'utf8');
  const fragment = {
    schemaVersion: 1,
    fragmentContract: 'uabc-customer-project-fragment-v1',
    customerId: contract.customerId,
    fixtureOnly: false,
    projects: contract.customerCatalog.projects.map((item) => ({ ...item, consumerEligible: contract.release.consumerEligible, publishEligible: contract.release.publishEligible })),
    payload: { path: payloadPath, sha256: sha256Hex(payloadBytes), sizeBytes: payloadBytes.length },
    projectData: { contractId: 'UABC-PROJECT-DATA-V1', sourceCommit: projectBundle.producerCommit, artifactCount: projectBundle.files.length }
  };
  const fragmentBytes = Buffer.from(canonicalJson(fragment), 'utf8');
  const projectIndexPath = `${releaseDir}/data/${PROJECT_INDEX_PATH}`;
  const rawRecords = [
    { kind: 'knowledge-payload', id: 'UABC-SNAPSHOT-KNOWLEDGE-0003', sourcePath: null, format: 'json', selector: null, path: payloadPath, bytes: payloadBytes },
    { kind: 'catalog-fragment', id: 'UABC-SNAPSHOT-FRAGMENT-0003', sourcePath: null, format: 'json', selector: null, path: fragmentPath, bytes: fragmentBytes },
    { kind: 'project-index', id: 'UABC-SNAPSHOT-INDEX-0003', sourcePath: PROJECT_INDEX_PATH, format: 'yaml', selector: null, path: projectIndexPath, bytes: projectBundle.indexBytes },
    ...projectBundle.files.map((item) => ({ kind: 'project-source', id: item.id, sourcePath: item.sourcePath, format: item.format, selector: item.selector, path: `${releaseDir}/data/${item.sourcePath}`, bytes: item.bytes }))
  ];
  const records = rawRecords.map((item) => ({ kind: item.kind, id: item.id, sourcePath: item.sourcePath, format: item.format, selector: item.selector, path: item.path, sizeBytes: item.bytes.length, sha256: sha256Hex(item.bytes), transports: [
    { type: 'filesystem', relativePath: item.path, sha256: sha256Hex(item.bytes) },
    { type: 'https', relativePath: item.path, sha256: sha256Hex(item.bytes) }
  ] }));
  const manifest = {
    schemaVersion: 1,
    manifestContract: 'uabc-portable-snapshot-release-v1',
    releaseId: contract.release.releaseId,
    immutable: true,
    producer: { customerId: contract.customerId, projectIds: [contract.projectId], commitShaProvenance: contract.release.producerCommitProvenance },
    releaseBinding: { bindingStatus: contract.release.bindingStatus, pendingReason: contract.release.pendingReason, consumerEligible: contract.release.consumerEligible, publishEligible: contract.release.publishEligible, requiredEvidence: contract.release.requiredReleaseEvidence, spectraReleaseBinding: contract.release.spectraReleaseBinding },
    pathSemantics: 'repository-relative',
    byteContract: 'identical-canonical-bytes',
    sourceInventoryDigest: sha256Hex(Buffer.from(canonicalJson(inventory), 'utf8')),
    projectData: { contractId: 'UABC-PROJECT-DATA-V1', indexSourcePath: PROJECT_INDEX_PATH, indexPath: projectIndexPath, sourceCommit: projectBundle.producerCommit, artifactCount: projectBundle.files.length },
    files: records,
    validationStatus: 'validated-release'
  };
  const manifestBytes = Buffer.from(canonicalJson(manifest), 'utf8');
  const manifestSha256 = sha256Hex(manifestBytes);
  const current = {
    schemaVersion: 1,
    pointerContract: 'uabc-portable-snapshot-current-v1',
    customerId: contract.customerId,
    projectId: contract.projectId,
    currentReleaseId: contract.release.releaseId,
    manifestPath,
    manifestSha256,
    bindingStatus: contract.release.bindingStatus,
    consumerEligible: contract.release.consumerEligible,
    publishEligible: contract.release.publishEligible,
    updatedAt: contract.sourceInventory.checkpoint.capturedAt
  };
  const catalog = {
    schemaVersion: 1,
    catalogContract: 'uabc-portable-customer-catalog-v1',
    producerCustomerId: contract.customerId,
    customerFragments: [{ customerId: contract.customerId, fragmentPath, fragmentSha256: sha256Hex(fragmentBytes), manifestPath, manifestSha256, consumerEligible: contract.release.consumerEligible, publishEligible: contract.release.publishEligible }],
    aggregationRule: contract.customerCatalog.aggregationRule,
    foreignCustomerFixturesOnly: true
  };
  return {
    ...Object.fromEntries(rawRecords.map((item) => [item.path, Buffer.from(item.bytes)])),
    [payloadPath]: payloadBytes,
    [fragmentPath]: fragmentBytes,
    [manifestPath]: manifestBytes,
    [contract.release.currentPointerPath]: Buffer.from(canonicalJson(current), 'utf8'),
    [contract.release.catalogPath]: Buffer.from(canonicalJson(catalog), 'utf8')
  };
}

export function validatePortableArtifacts(contract, artifacts) {
  const errors = [];
  const releaseDir = contract.release.releaseDirectory;
  const payloadPath = `${releaseDir}/${RELEASE_FILES.payload}`;
  const fragmentPath = `${releaseDir}/${RELEASE_FILES.fragment}`;
  const manifestPath = `${releaseDir}/${RELEASE_FILES.manifest}`;
  let payload; let fragment; let manifest; let current; let catalog;
  try {
    payload = JSON.parse(Buffer.from(artifacts[payloadPath]).toString('utf8'));
    fragment = JSON.parse(Buffer.from(artifacts[fragmentPath]).toString('utf8'));
    manifest = JSON.parse(Buffer.from(artifacts[manifestPath]).toString('utf8'));
    current = JSON.parse(Buffer.from(artifacts[contract.release.currentPointerPath]).toString('utf8'));
    catalog = JSON.parse(Buffer.from(artifacts[contract.release.catalogPath]).toString('utf8'));
  } catch (error) { return [`PILOT-OUTPUT-PARSE: ${error.message}`]; }
  if (manifest.immutable !== true) add(errors, 'PILOT-IMMUTABILITAET', 'Manifest muss immutable true sein');
  if (manifest.releaseBinding?.bindingStatus !== contract.release.bindingStatus || manifest.releaseBinding?.pendingReason !== contract.release.pendingReason || manifest.releaseBinding?.consumerEligible !== contract.release.consumerEligible || manifest.releaseBinding?.publishEligible !== contract.release.publishEligible || JSON.stringify(manifest.releaseBinding?.spectraReleaseBinding) !== JSON.stringify(contract.release.spectraReleaseBinding)) add(errors, 'PILOT-RELEASEBINDUNG', 'Manifest bildet die vollstaendige Releasebindung nicht exakt ab');
  if (manifest.producer?.customerId !== contract.customerId || JSON.stringify(manifest.producer?.projectIds) !== JSON.stringify([contract.projectId]) || manifest.producer?.commitShaProvenance !== contract.release.producerCommitProvenance) add(errors, 'PILOT-PROVENIENZ', 'Manifest bindet nicht exakt den freigegebenen Kunden-, Projekt- und Commitstand');
  const records = manifest.files ?? [];
  const ids = records.map((record) => record.id);
  const paths = records.map((record) => record.path);
  const sourcePaths = records.map((record) => record.sourcePath).filter(Boolean);
  if (!unique(ids) || !unique(paths) || !unique(sourcePaths)) add(errors, 'PILOT-PROJEKTDATEN', 'Manifest-IDs, Releasepfade und Quellpfade muessen eindeutig sein');
  for (const record of records) {
    if (!safePath(record.path) || !artifacts[record.path]) { add(errors, 'PILOT-PFAD', `${record.path}: Releasepfad fehlt oder ist unsicher`); continue; }
    const bytes = Buffer.from(artifacts[record.path]);
    if (record.sha256 !== sha256Hex(bytes) || record.sizeBytes !== bytes.length) add(errors, 'PILOT-DIGEST', `${record.path}: Digest oder Groesse weicht ab`);
    if ((record.transports ?? []).length !== 2 || record.transports.some((item) => item.relativePath !== record.path || item.sha256 !== record.sha256) || !['filesystem', 'https'].every((type) => record.transports.some((item) => item.type === type))) add(errors, 'PILOT-TRANSPORT', `${record.path}: Filesystem- und HTTPS-Bytes divergieren`);
  }
  const projectIndexRecords = records.filter((record) => record.kind === 'project-index');
  const projectSourceRecords = records.filter((record) => record.kind === 'project-source');
  const projectData = manifest.projectData;
  const expectedIndexPath = `${releaseDir}/data/${PROJECT_INDEX_PATH}`;
  if (projectData?.contractId !== 'UABC-PROJECT-DATA-V1' || projectData?.indexSourcePath !== PROJECT_INDEX_PATH || projectData?.indexPath !== expectedIndexPath || projectData?.sourceCommit !== contract.release.producerCommitProvenance || projectData?.artifactCount !== projectSourceRecords.length || records.length !== projectSourceRecords.length + 3 || projectIndexRecords.length !== 1 || records.filter((record) => record.kind === 'knowledge-payload').length !== 1 || records.filter((record) => record.kind === 'catalog-fragment').length !== 1) add(errors, 'PILOT-PROJEKTDATEN', 'Manifest bildet Projektindex, Projektquellen und Releasebeilagen nicht vollstaendig ab');
  let projectIndex;
  try { projectIndex = YAML.parse(Buffer.from(artifacts[expectedIndexPath]).toString('utf8')); } catch (error) { add(errors, 'PILOT-PROJEKTINDEX', `Gebundener Projektindex ist nicht lesbar: ${error.message}`); }
  if (projectIndex) {
    if (projectIndex.schemaVersion !== 1 || projectIndex.contractId !== 'UABC-PROJECT-DATA-V1' || projectIndex.projectId !== contract.projectId || projectIndex.routeKey !== 'bc-basic' || !Array.isArray(projectIndex.artifacts) || projectIndex.artifacts.length !== projectSourceRecords.length) add(errors, 'PILOT-PROJEKTINDEX', 'Gebundener Projektindex besitzt eine falsche Identitaet oder Artefaktzahl');
    for (const indexed of projectIndex.artifacts ?? []) {
      const record = projectSourceRecords.find((candidate) => candidate.id === indexed.id);
      if (!record || record.sourcePath !== indexed.path || record.format !== indexed.format || record.selector !== (indexed.selector ?? null) || record.path !== `${releaseDir}/data/${indexed.path}`) add(errors, 'PILOT-PROJEKTDATEN', `${indexed.id}: Index und gebundene Projektquelle widersprechen sich`);
    }
  }
  if (current.customerId !== contract.customerId || current.projectId !== contract.projectId || current.currentReleaseId !== contract.release.releaseId || current.manifestPath !== manifestPath || current.manifestSha256 !== sha256Hex(Buffer.from(artifacts[manifestPath])) || current.bindingStatus !== contract.release.bindingStatus || current.consumerEligible !== contract.release.consumerEligible || current.publishEligible !== contract.release.publishEligible || current.updatedAt !== contract.sourceInventory.checkpoint.capturedAt) add(errors, 'PILOT-CURRENT', 'current.json bindet nicht exakt das freigegebene Kundenprojekt und Manifest');
  if (payload.customerId !== contract.customerId || payload.projectId !== contract.projectId || payload.truthBoundary?.liveExecutionClaimed !== false) add(errors, 'PILOT-KUNDENGRENZE', 'Payload enthaelt fremde oder unzulaessige Projektwahrheit');
  if (JSON.stringify(payload.visibilityBoundary?.allowed) !== JSON.stringify(['customer', 'internal']) || payload.visibilityBoundary?.customerSelector !== 'views.customer' || payload.visibilityBoundary?.internalSelector !== 'views.internal' || payload.visibilityBoundary?.foreignCustomerDataAllowed !== false) add(errors, 'PILOT-SICHTKLASSE', 'Payload besitzt eine fremde oder nicht freigegebene Sichtklasse');
  if (payload.views?.customer?.contradictions || payload.views?.customer?.brownfieldReconciliation || payload.views?.customer?.approvedKnowledgeChanges?.some((item) => item.reviewStatus !== 'approved')) add(errors, 'PILOT-SICHTKLASSE', 'Kundensicht enthaelt interne oder ungepruefte Wissensdaten');
  if ((payload.sourceInventory?.pages ?? []).length !== 28 || payload.sourceInventory.pages.some((page) => !/^[a-f0-9]{64}$/u.test(page.normalizedContentSha256) || !page.checkpointId || !unique(page.attachmentDigests ?? []) || page.attachmentDigests.some((digest) => !/^[a-f0-9]{64}$/u.test(digest)))) add(errors, 'PILOT-INVENTAR', 'Source Inventory ist unvollstaendig oder besitzt ungueltige Digests');
  const reconciliation = payload.views?.internal?.brownfieldReconciliation?.rows ?? [];
  if (reconciliation.length !== 30 || !['import', 'exclude', 'gap', 'conflict'].every((decision) => reconciliation.some((row) => row.decision === decision)) || payload.sourceInventory.pages.some((page) => !reconciliation.some((row) => row.sourceId === page.sourceId))) add(errors, 'PILOT-RECONCILIATION', 'Brownfield-Reconciliation deckt Quellen oder Entscheidungsarten nicht vollstaendig ab');
  if (fragment.customerId !== contract.customerId || fragment.fixtureOnly !== false || fragment.projectData?.contractId !== 'UABC-PROJECT-DATA-V1' || fragment.projectData?.sourceCommit !== contract.release.producerCommitProvenance || fragment.projectData?.artifactCount !== projectSourceRecords.length || fragment.projects?.some((project) => project.consumerEligible !== contract.release.consumerEligible || project.publishEligible !== contract.release.publishEligible)) add(errors, 'PILOT-FRAGMENT', 'Kundenfragment verletzt Isolation, Projektbindung oder Releasefreigabe');
  if (catalog.producerCustomerId !== contract.customerId || catalog.customerFragments?.length !== 1 || catalog.customerFragments[0]?.customerId !== contract.customerId || catalog.customerFragments[0]?.fragmentPath !== fragmentPath || catalog.customerFragments[0]?.fragmentSha256 !== sha256Hex(Buffer.from(artifacts[fragmentPath])) || catalog.customerFragments[0]?.manifestPath !== manifestPath || catalog.customerFragments[0]?.manifestSha256 !== sha256Hex(Buffer.from(artifacts[manifestPath])) || catalog.customerFragments[0]?.consumerEligible !== contract.release.consumerEligible || catalog.customerFragments[0]?.publishEligible !== contract.release.publishEligible) add(errors, 'PILOT-CROSS-CUSTOMER', 'Katalog enthaelt fremde, divergierende oder ungepruefte Kundenfragmente');
  const forbiddenKey = (value) => value && typeof value === 'object' && Object.entries(value).some(([key, child]) => /password|token|cookie|secret|authstate/iu.test(key) || forbiddenKey(child));
  if ([payload, fragment, manifest, current, catalog].some(forbiddenKey)) add(errors, 'PILOT-GEHEIMNIS', 'Snapshot enthaelt ein verbotenes Geheimnis- oder Authfeld');
  return errors;
}

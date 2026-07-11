import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';
import YAML from 'yaml';

const root = process.cwd();
const archiveReadyMode = process.argv.includes('--archive-ready');
const resolveArgumentIndex = process.argv.indexOf('--resolve-id');
const resolveId = resolveArgumentIndex >= 0 ? process.argv[resolveArgumentIndex + 1] : null;
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const absolute = (relative) => path.join(root, relative);
const read = (relative) => fs.readFile(absolute(relative), 'utf8');
const yaml = async (relative) => YAML.parse(await read(relative));
const json = async (relative) => JSON.parse(await read(relative));
const exists = async (relative) => fs.access(absolute(relative)).then(() => true).catch(() => false);
const asDate = (value) => value instanceof Date ? value : new Date(String(value));
const dateValid = (value) => value !== null && !Number.isNaN(asDate(value).valueOf());
const evidenceSchemaVersion = 2;
const persistedTargetId = '[redacted-target-id]';
const persistedTenant = '[redacted-tenant]';
const persistedBasePath = '/[redacted-tenant]/playthru';
const allowedReadOnlyRequestClasses = ['GET', 'HEAD', 'OPTIONS'].flatMap((method) => ['document', 'script', 'stylesheet', 'image', 'font', 'xhr', 'fetch'].map((resourceType) => `${method}:${resourceType}`)).sort();
const legacyManifestContracts = new Map([
  ['run-1', { relativePath: 'evidence/playthru-environment-baseline/run-1/manifest.json', sha256: '04a099f0830c7a234c6a834ff2455d2cfa51a11d76bee76831efff77ff13a3e4' }],
  ['run-2', { relativePath: 'evidence/playthru-environment-baseline/run-2/manifest.json', sha256: '490df612a29de17e8c3506fe9e08ef3df580f6dc0a41704b773b9da05471762e' }]
]);

function normalizeSemantic(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalizeSemantic).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, normalizeSemantic(item)]));
  }
  return value;
}

const semanticEqual = (left, right) => JSON.stringify(normalizeSemantic(left)) === JSON.stringify(normalizeSemantic(right));

function collectEvidenceIds(value, result = new Set()) {
  if (Array.isArray(value)) for (const item of value) collectEvidenceIds(item, result);
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'evidenceIds' && Array.isArray(item)) for (const id of item) result.add(id);
      else collectEvidenceIds(item, result);
    }
  }
  return result;
}

function stripClientVersion(value) {
  return String(value ?? '').replace(/^Version:\s*/i, '').replace(/\s*\(Plattform[\s\S]*$/i, '').trim();
}

function rawFact(run, name) {
  return run?.facts?.[name] ?? {};
}

function rawValue(run, name) {
  return rawFact(run, name).value;
}

function exactKeys(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) && semanticEqual(Object.keys(value), keys);
}

function rawManifestSafetyProjection(manifest, label, source) {
  check(typeof manifest.writesPerformed === 'boolean', `${label}: writesPerformed muss boolean sein`);
  check(manifest.writesPerformed === false, `${label}: writesPerformed muss fuer die read-only Baseline exakt false sein`);
  if (manifest.schemaVersion === 1) {
    const contract = legacyManifestContracts.get(manifest.runId);
    const sourceHash = source?.bytes ? crypto.createHash('sha256').update(source.bytes).digest('hex') : null;
    check(Boolean(contract), `${label}: legacy-absent ist nur fuer run-1 und run-2 erlaubt`);
    check(source?.relativePath === contract?.relativePath, `${label}: historisches Legacy-Manifest liegt nicht am gebundenen Pfad`);
    check(sourceHash === contract?.sha256, `${label}: historisches Legacy-Manifest weicht in SHA-256 von den freigegebenen Originalbytes ab`);
    check(manifest.readOnlyGuard === undefined && manifest.targetBinding === undefined, `${label}: historisches Schema 1 darf Guard und Zielbindung nicht nachtraeglich vortaeuschen`);
    return { writesPerformed: manifest.writesPerformed, readOnlyGuard: { status: 'legacy-absent' }, targetBinding: { status: 'legacy-absent' } };
  }
  check(manifest.schemaVersion === evidenceSchemaVersion, `${label}: neue EvidenceRun-Manifeste muessen Schema ${evidenceSchemaVersion} verwenden`);
  check(manifest.readOnlyGuard !== undefined && manifest.targetBinding !== undefined, `${label}: Schema ${evidenceSchemaVersion} erfordert Guard und Zielbindung`);
  const allowedManifestKeys = new Set(['companySwitchPerformed', 'executionContext', 'facts', 'generatedAt', 'playwrightVersion', 'rawTrace', 'rawVideo', 'readOnlyGuard', 'runId', 'schemaVersion', 'steps', 'targetBinding', 'testId', 'writesPerformed']);
  check(Object.keys(manifest).every((key) => allowedManifestKeys.has(key)), `${label}: Schema ${evidenceSchemaVersion} enthaelt unerlaubte Manifestfelder`);
  for (const required of ['executionContext', 'facts', 'generatedAt', 'runId', 'steps', 'testId']) check(Object.hasOwn(manifest, required), `${label}: Schema ${evidenceSchemaVersion} fehlt das Pflichtfeld ${required}`);
  check(!JSON.stringify(manifest).match(/UABC-BC-TARGET-[A-Z0-9-]+|hmac-sha256:[0-9a-f]{64}|sha256:[0-9a-f]{64}|(?:hex|base64|base64url):[A-Za-z0-9+/_=-]{32,}|\btenant-[a-z0-9-]{16,}\b|https:\/\/businesscentral\.dynamics\.com\/(?!\[tenant\]\/playthru)/i), `${label}: Schema ${evidenceSchemaVersion} enthaelt nicht redigierte Ziel-, URL-, Tenant-, HMAC- oder Fingerprintdaten`);

  const binding = manifest.targetBinding ?? {};
  const bindingKeys = ['basePath', 'environment', 'fingerprintAlgorithm', 'host', 'port', 'protocol', 'targetId', 'tenant', 'verified'];
  check(exactKeys(binding, bindingKeys), `${label}: targetBinding enthaelt unerlaubte oder fehlende Felder`);
  check(
    binding.targetId === persistedTargetId
      && binding.verified === true
      && ['sha256', 'hmac-sha256'].includes(binding.fingerprintAlgorithm)
      && binding.protocol === 'https:'
      && binding.host === 'businesscentral.dynamics.com'
      && binding.port === 443
      && binding.environment === 'playthru'
      && binding.tenant === persistedTenant
      && binding.basePath === persistedBasePath,
    `${label}: targetBinding ist nicht vollstaendig redigiert oder nicht exakt an HTTPS, Port 443 und playthru gebunden`
  );
  check(!JSON.stringify(binding).match(/UABC-BC-TARGET-[A-Z0-9-]+|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|hmac-sha256:[0-9a-f]{64}|sha256:[0-9a-f]{64}/i), `${label}: targetBinding enthaelt nicht persistierbare Ziel-, Tenant- oder Fingerprintdaten`);

  const guard = manifest.readOnlyGuard ?? {};
  const guardKeys = ['allowedRequestClasses', 'allowedRequests', 'blockedMutationAttempts', 'blockedRequests', 'installation', 'limit', 'mode', 'observedBusinessCentralRequests', 'observedRequestClasses', 'targetBinding', 'targetBoundaryVerified'];
  check(exactKeys(guard, guardKeys), `${label}: readOnlyGuard enthaelt unerlaubte oder fehlende Felder`);
  check(guard.mode === 'businesscentral-network-read-only-fail-closed', `${label}: readOnlyGuard hat keinen gueltigen Fail-Closed-Modus`);
  check(guard.targetBoundaryVerified === true, `${label}: readOnlyGuard muss eine verifizierte Zielgrenze bestaetigen`);
  check(exactKeys(guard.installation, ['httpRoute', 'serviceWorkers', 'webSocketRoute']) && guard.installation?.httpRoute === true && guard.installation?.webSocketRoute === true && guard.installation?.serviceWorkers === 'block', `${label}: readOnlyGuard weist HTTP-, WebSocket- und Service-Worker-Schutz nicht vollstaendig nach`);
  check(semanticEqual(guard.targetBinding, binding), `${label}: readOnlyGuard und targetBinding sind nicht exakt miteinander verbunden`);
  for (const field of ['observedBusinessCentralRequests', 'allowedRequests', 'blockedMutationAttempts']) {
    check(Number.isInteger(guard?.[field]) && guard[field] >= 0, `${label}: readOnlyGuard ${field} ist ungueltig`);
  }
  const blockedRequests = Array.isArray(guard.blockedRequests) ? guard.blockedRequests : [];
  check(Array.isArray(guard.observedRequestClasses) && Array.isArray(guard.allowedRequestClasses) && Array.isArray(guard.blockedRequests), `${label}: readOnlyGuard Requestklassen sind nicht strukturiert`);
  check(semanticEqual(guard.allowedRequestClasses, allowedReadOnlyRequestClasses), `${label}: readOnlyGuard hat den festen Nur-Lese-Klassenvertrag veraendert`);
  check(Array.isArray(guard.observedRequestClasses) && guard.observedRequestClasses.every((item) => typeof item === 'string') && new Set(guard.observedRequestClasses).size === guard.observedRequestClasses.length, `${label}: readOnlyGuard enthaelt ungueltige oder doppelte beobachtete Requestklassen`);
  check(guard.blockedMutationAttempts === blockedRequests.length && guard.observedBusinessCentralRequests === guard.allowedRequests + blockedRequests.length, `${label}: readOnlyGuard enthaelt inkonsistente oder manipulierte Zaehler`);
  check(guard.blockedMutationAttempts === 0 && blockedRequests.length === 0, `${label}: readOnlyGuard meldet blockierte oder unklare Mutationsversuche`);
  check((guard.observedRequestClasses ?? []).every((item) => allowedReadOnlyRequestClasses.includes(item)), `${label}: beobachtete Requestklassen verlassen den festen Nur-Lese-Vertrag`);
  for (const request of blockedRequests) check(exactKeys(request, ['method', 'reason', 'resourceType', 'url']), `${label}: readOnlyGuard enthaelt unstrukturierte blockierte Requests`);

  const readOnlyGuard = {
    mode: guard.mode,
    installation: guard.installation,
    targetBoundaryVerified: guard.targetBoundaryVerified,
    targetBinding: guard.targetBinding,
    observedBusinessCentralRequests: guard.observedBusinessCentralRequests,
    allowedRequests: guard.allowedRequests,
    observedRequestClasses: guard.observedRequestClasses ?? [],
    allowedRequestClasses: guard.allowedRequestClasses ?? [],
    blockedMutationAttempts: guard.blockedMutationAttempts
  };
  const targetBinding = binding;
  return { writesPerformed: manifest.writesPerformed, readOnlyGuard, targetBinding };
}

async function expectedSandboxBaselineFromRawEvidence() {
  const run1Path = 'evidence/playthru-environment-baseline/run-1/manifest.json';
  const run2Path = 'evidence/playthru-environment-baseline/run-2/manifest.json';
  const run1Bytes = await fs.readFile(absolute(run1Path));
  const run2Bytes = await fs.readFile(absolute(run2Path));
  const run1 = JSON.parse(run1Bytes.toString('utf8'));
  const run2 = JSON.parse(run2Bytes.toString('utf8'));
  const comparison = await json('evidence/playthru-environment-baseline/comparison.json');
  const run1Safety = rawManifestSafetyProjection(run1, 'run-1', { relativePath: run1Path, bytes: run1Bytes });
  const run2Safety = rawManifestSafetyProjection(run2, 'run-2', { relativePath: run2Path, bytes: run2Bytes });
  check(run1.runId === 'run-1' && run2.runId === 'run-2', 'Baseline-Roh-Evidence: erwartete run-1/run-2-Manifeste fehlen');
  check(comparison.verificationId === 'UABC-VER-ENV-COMPARE-001', 'Baseline-Roh-Evidence: comparison.json hat keine erwartete Verification-ID');
  check(semanticEqual(comparison.runIds, ['run-1', 'run-2']), 'Baseline-Roh-Evidence: comparison.json verweist nicht auf run-1 und run-2');
  check(comparison.stableFactsEqual === true && semanticEqual(comparison.differences ?? [], []), 'Baseline-Roh-Evidence: comparison.json weist keine stabil gleichen Fakten nach');
  check(semanticEqual({ facts: run1.facts, executionContext: run1.executionContext, safety: run1Safety }, { facts: run2.facts, executionContext: run2.executionContext, safety: run2Safety }), 'Baseline-Roh-Evidence: run-1 und run-2 unterscheiden sich in kanonisierbaren Fakten oder Sicherheitsindikatoren');

  const evidenceRunIds = ['UABC-VER-ENV-RUN1-001', 'UABC-VER-ENV-RUN2-001'];
  const evidenceRunAndCompareIds = [...evidenceRunIds, 'UABC-VER-ENV-COMPARE-001'];
  const targetCompanies = (rawValue(run1, 'universaarlTargetCompanies') ?? []).map((item) => ({
    bcCompany: item.bcCompany,
    observationStatus: item.status
  }));
  const targetInferences = new Set((rawValue(run1, 'universaarlTargetCompanies') ?? []).map((item) => item.inference).filter(Boolean));
  const extensionsValue = rawValue(run1, 'extensions') ?? {};
  const featuresValue = rawValue(run1, 'featureManagement') ?? {};
  const unknowns = [];
  if (rawFact(run1, 'experience').status === 'unknown') unknowns.push('Experience je Unternehmen');
  if (rawFact(run1, 'localization').status !== 'confirmed') unknowns.push('vollstaendiges Inventar der deutschen Lokalisierungs-Apps');
  if (extensionsValue.completeness === 'visible-partial') unknowns.push('vollstaendiges Inventar der installierten Erweiterungen');
  if (featuresValue.completeness === 'visible-partial') unknowns.push('vollstaendiges Feature-Inventar');

  return {
    facts: {
      environment: { status: rawFact(run1, 'environment').status, value: rawValue(run1, 'environment'), evidenceIds: evidenceRunAndCompareIds },
      activeCompany: { status: rawFact(run1, 'activeCompany').status, value: rawValue(run1, 'activeCompany'), evidenceIds: evidenceRunIds },
      accessibleCompanyNames: { status: rawFact(run1, 'accessibleCompanies').status, value: rawValue(run1, 'accessibleCompanies')?.names ?? [], evidenceIds: evidenceRunIds },
      universaarlTargetCompanies: {
        status: rawFact(run1, 'universaarlTargetCompanies').status,
        value: targetCompanies,
        inferenceLimit: targetInferences.size === 1 ? [...targetInferences][0] : null,
        evidenceIds: evidenceRunIds
      },
      clientVersion: { status: rawFact(run1, 'version').status, value: stripClientVersion(rawValue(run1, 'version')), evidenceIds: evidenceRunIds },
      platformVersion: { status: rawFact(run1, 'build').status, value: rawValue(run1, 'build')?.platform ?? null, evidenceIds: evidenceRunIds },
      applicationVersion: { status: rawFact(run1, 'build').status, value: rawValue(run1, 'build')?.application ?? null, evidenceIds: evidenceRunIds },
      language: { status: rawFact(run1, 'language').status, value: rawValue(run1, 'language'), evidenceIds: evidenceRunIds },
      region: { status: rawFact(run1, 'region').status, value: rawValue(run1, 'region'), evidenceIds: evidenceRunIds },
      executionContext: {
        status: 'confirmed',
        scope: 'user-run-context',
        workDate: run1.executionContext?.workDate?.value ?? null,
        timeZone: run1.executionContext?.timeZone?.value ?? null,
        evidenceIds: evidenceRunIds
      },
      localization: { status: rawFact(run1, 'localization').status, value: rawValue(run1, 'localization'), evidenceIds: evidenceRunIds },
      experience: { status: rawFact(run1, 'experience').status, value: rawValue(run1, 'experience'), evidenceIds: evidenceRunIds },
      extensions: { status: rawFact(run1, 'extensions').status, completeness: extensionsValue.completeness, visibilityBasis: extensionsValue.visibilityBasis, visibleItemCount: (extensionsValue.items ?? []).length, evidenceIds: evidenceRunIds },
      featureManagement: { status: rawFact(run1, 'featureManagement').status, completeness: featuresValue.completeness, visibilityBasis: featuresValue.visibilityBasis, visibleRowCount: (featuresValue.items ?? []).length, evidenceIds: evidenceRunIds }
    },
    unknowns
  };
}

function validateRawBaselineProjection(candidate, context, expected, options = {}) {
  check(semanticEqual(candidate?.facts, expected.facts), `${context}: kanonische Baseline-Fakten weichen von der Roh-Evidence-Projektion ab`);
  check(semanticEqual(candidate?.unknowns, expected.unknowns), `${context}: kanonische Unknowns weichen von der Roh-Evidence-Projektion ab`);
  if (options.requireEvidenceIds) {
    const requiredEvidenceIds = new Set([...collectEvidenceIds(expected.facts), 'UABC-VER-ENV-POLICY-GATE-001'].filter(Boolean));
    check(semanticEqual(candidate?.evidenceIds, [...requiredEvidenceIds]), `${context}: Evidence-IDs decken die Roh-Evidence-Projektion und das Policy-Gate nicht exakt ab`);
  }
}

async function walk(relative, predicate = () => true) {
  if (!(await exists(relative))) return [];
  const result = [];
  for (const entry of await fs.readdir(absolute(relative), { withFileTypes: true })) {
    const child = path.posix.join(relative.replaceAll('\\', '/'), entry.name);
    if (entry.isDirectory()) result.push(...await walk(child, predicate));
    else if (predicate(child)) result.push(child);
  }
  return result;
}

function frontmatter(content, file) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  check(Boolean(match), `${file}: YAML-Frontmatter fehlt`);
  if (!match) return {};
  try { return YAML.parse(match[1]); }
  catch (error) { errors.push(`${file}: ungueltiges Frontmatter: ${error.message}`); return {}; }
}

function registerIds(value, document, target, owners) {
  if (Array.isArray(value)) for (const item of value) registerIds(item, document, target, owners);
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if ((key === 'id' || key === 'artifactId') && typeof item === 'string') {
        const previous = owners.get(item);
        check(!previous, `doppelte strukturierte ID ${item} in ${previous ?? document} und ${document}`);
        if (!previous) owners.set(item, document);
        target.add(item);
      }
      registerIds(item, document, target, owners);
    }
  }
}

function findCycle(nodes, edges, label) {
  const visiting = new Set();
  const visited = new Set();
  const visit = (node, trail) => {
    if (visiting.has(node)) { errors.push(`${label}-Zyklus: ${[...trail, node].join(' -> ')}`); return; }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of edges.get(node) ?? []) visit(next, [...trail, node]);
    visiting.delete(node);
    visited.add(node);
  };
  for (const node of nodes) visit(node, []);
}

function specIds(content) {
  return new Set([...content.matchAll(/^#{3,4}\s+(?:Requirement|Scenario):\s+(UABC-[A-Z0-9-]+)\b/gm)].map((match) => match[1]));
}

async function openSpecReferences(lifecycle) {
  const changesRoot = 'openspec/changes';
  const changeDirs = (await fs.readdir(absolute(changesRoot), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name !== 'archive')
    .map((entry) => entry.name);
  check(changeDirs.length <= 1, `aktive OpenSpec-Changes muessen 0..1 sein, gefunden ${changeDirs.length}`);
  const activeChangeConfigs = new Map();
  for (const change of changeDirs) {
    const manifest = `${changesRoot}/${change}/.openspec.yaml`;
    check(await exists(manifest), `${change}: .openspec.yaml fehlt`);
    if (await exists(manifest)) activeChangeConfigs.set(change, await yaml(manifest));
  }

  const archiveDirs = (await exists(`${changesRoot}/archive`))
    ? (await fs.readdir(absolute(`${changesRoot}/archive`), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : [];
  const archivedChanges = new Set(archiveDirs.map((name) => name.replace(/^\d{4}-\d{2}-\d{2}-/, '')));
  const archivedChangeConfigs = new Map();
  for (const archiveDir of archiveDirs) {
    const manifest = `${changesRoot}/archive/${archiveDir}/.openspec.yaml`;
    if (await exists(manifest)) {
      archivedChangeConfigs.set(archiveDir, {
        change: archiveDir.replace(/^\d{4}-\d{2}-\d{2}-/, ''),
        config: await yaml(manifest),
        file: manifest
      });
    }
  }

  const order = (lifecycle.resolutionOrder ?? []).map((item) => item.state);
  check(order.join('>') === 'approved>proposed>historical', `resolutionOrder muss approved > proposed > historical sein, gefunden ${order.join(' > ')}`);
  check(new Set(order).size === order.length, 'resolutionOrder-Status muessen eindeutig sein');
  for (const state of order) check((lifecycle.states ?? []).includes(state), `resolutionOrder verwendet nicht deklarierten Status ${state}`);

  const filesByState = {
    approved: await walk('openspec/specs', (file) => file.endsWith('/spec.md')),
    proposed: (await Promise.all(changeDirs.map((change) => walk(`${changesRoot}/${change}/specs`, (file) => file.endsWith('/spec.md'))))).flat(),
    historical: await walk(`${changesRoot}/archive`, (file) => file.endsWith('/spec.md'))
  };
  const references = new Map();
  for (const state of order) {
    for (const file of filesByState[state] ?? []) {
      const content = await read(file);
      const matches = content.matchAll(/^#{3,4}\s+(?:Requirement|Scenario):\s+(UABC-[A-Z0-9-]+)\b/gm);
      for (const match of matches) {
        const entries = references.get(match[1]) ?? [];
        if (state === 'historical') {
          const archiveDir = file.slice(`${changesRoot}/archive/`.length).split('/')[0];
          const archiveMatch = archiveDir.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
          check(Boolean(archiveMatch), `${file}: historisches Archivverzeichnis muss mit YYYY-MM-DD- beginnen`);
          entries.push({ state, file, archiveDir, archiveDate: archiveMatch?.[1] ?? '' });
        } else {
          entries.push({ state, file });
        }
        references.set(match[1], entries);
      }
    }
  }
  const resolved = new Map();
  for (const [id, entries] of references) {
    for (const state of order) {
      const sameState = entries.filter((entry) => entry.state === state);
      if (state === 'historical') {
        const byArchive = new Map();
        for (const entry of sameState) {
          const archiveEntries = byArchive.get(entry.archiveDir) ?? [];
          archiveEntries.push(entry);
          byArchive.set(entry.archiveDir, archiveEntries);
        }
        for (const [archiveDir, archiveEntries] of byArchive) {
          check(archiveEntries.length <= 1, `${id}: doppelte historische Definitionen innerhalb des archivierten Changes ${archiveDir}`);
        }
        const newestFirst = [...sameState].sort((left, right) => {
          if (left.archiveDate !== right.archiveDate) return left.archiveDate < right.archiveDate ? 1 : -1;
          if (left.archiveDir !== right.archiveDir) return left.archiveDir < right.archiveDir ? 1 : -1;
          return left.file < right.file ? 1 : left.file > right.file ? -1 : 0;
        });
        if (!resolved.has(id) && newestFirst.length > 0) resolved.set(id, newestFirst[0]);
      } else {
        check(sameState.length <= 1, `${id}: doppelte OpenSpec-Definitionen im Lifecycle-Status ${state}`);
        if (!resolved.has(id) && sameState.length === 1) resolved.set(id, sameState[0]);
      }
    }
  }
  return { activeChanges: changeDirs, activeChangeConfigs, archivedChanges, archivedChangeConfigs, references, resolved, filesByState };
}

async function validateCatalogAndArchitecture({ stableIds, idOwners, people, sourceIds, verificationMap, openSpecRefs, architecture, catalog, lifecycle }) {
  registerIds(architecture, 'architecture/enterprise-blueprint.yaml', stableIds, idOwners);
  registerIds(catalog, 'capabilities/catalog.yaml', stableIds, idOwners);
  registerIds(lifecycle, 'governance/reference-lifecycle.yaml', stableIds, idOwners);

  const decisionKeys = ['decidedAt', 'id', 'statement', 'status'];
  for (const decision of architecture.decisions ?? []) {
    check(semanticEqual(Object.keys(decision).sort(), decisionKeys), `${decision.id ?? 'architecture decision'}: Decision-Objekt darf nur id, status, decidedAt und statement enthalten`);
  }

  const lifecycleStates = new Set(lifecycle.states ?? []);
  check(lifecycleStates.has('historical'), 'Lifecycle-Status muessen historical deklarieren');
  check(lifecycleStates.has(architecture.lifecycleStatus), `architecture: ungueltiger lifecycleStatus ${architecture.lifecycleStatus}`);
  check(lifecycleStates.has(catalog.lifecycleStatus), `catalog: ungueltiger lifecycleStatus ${catalog.lifecycleStatus}`);
  check(!['historical'].includes(architecture.lifecycleStatus), 'kanonische Architektur darf historical nicht als lifecycleStatus verwenden');
  check(!['historical'].includes(catalog.lifecycleStatus), 'kanonischer Katalog darf historical nicht als lifecycleStatus verwenden');

  check(architecture.planningReference === '2026 Release Wave 1', 'planningReference muss 2026 Release Wave 1 sein');
  const baseline = architecture.actualSandboxBaseline;
  check(baseline === 'unknown' || (baseline && typeof baseline === 'object' && !Array.isArray(baseline)), 'actualSandboxBaseline muss unknown oder eine strukturierte evidenzbasierte Baseline sein');
  if (baseline !== 'unknown' && baseline && typeof baseline === 'object') {
    check(['candidate', 'approved'].includes(baseline.status), `actualSandboxBaseline: ungueltiger Status ${baseline.status}`);
    check(typeof baseline.governingChange === 'string' && baseline.governingChange.length > 0, 'actualSandboxBaseline: governingChange erforderlich');
    check(baseline.facts && typeof baseline.facts === 'object' && !Array.isArray(baseline.facts), 'actualSandboxBaseline: strukturierte facts erforderlich');
    check(Array.isArray(baseline.evidenceIds) && baseline.evidenceIds.length > 0, 'actualSandboxBaseline: evidenceIds erforderlich');
    for (const evidenceId of baseline.evidenceIds ?? []) {
      const verification = verificationMap.get(evidenceId);
      check(Boolean(verification), `actualSandboxBaseline: unbekannter Nachweis ${evidenceId}`);
      if (baseline.status === 'approved') check(verification?.status === 'passed', `actualSandboxBaseline: approved Baseline erfordert passed Evidence ${evidenceId}`);
    }
    check(Array.isArray(baseline.unknowns), 'actualSandboxBaseline: unknowns muss ein Array sein');
  }
  check(/Aus der Planungsreferenz darf keine Feature-Verf(?:ue|ü)gbarkeit abgeleitet werden/.test(architecture.availabilityRule ?? ''), 'availabilityRule muss Schlussfolgerungen aus der Planungsreferenz verbieten');

  const companies = new Set([
    ...(architecture.legalEntities ?? []).map((item) => item.bcCompany),
    ...(architecture.reportingCompanies ?? []).map((item) => item.bcCompany)
  ]);
  const siteMap = new Map((architecture.sites ?? []).map((site) => [site.id, site]));
  for (const location of architecture.locations ?? []) {
    const site = siteMap.get(location.site);
    check(companies.has(location.company), `${location.id}: unbekannte Standort-Gesellschaft ${location.company}`);
    check(Boolean(site), `${location.id}: unbekannter Standort ${location.site}`);
    if (site) check(site.company === location.company, `${location.id}: Standort-Gesellschaft ${location.company} widerspricht Standort ${site.id} mit Gesellschaft ${site.company}`);
  }
  const locations = new Set([...(architecture.locations ?? []).map((item) => item.id), ...siteMap.keys()]);
  const statuses = new Set(catalog.statusValues ?? []);
  const domainIds = new Set();
  const capabilityIds = new Set();
  const capabilityMap = new Map();
  const capabilityDependencyEdges = new Map();
  const scenarioIds = new Set();
  check((catalog.domains ?? []).length > 0, 'Capability-Katalog benoetigt mindestens eine Domaene');
  for (const domain of catalog.domains ?? []) {
    check(!domainIds.has(domain.id), `doppelte Capability-Domaene ${domain.id}`); domainIds.add(domain.id);
    check(Boolean(domain.name), `${domain.id}: Domaenenname erforderlich`);
    check((domain.capabilities ?? []).length > 0, `${domain.id}: mindestens eine Unterfaehigkeit erforderlich`);
    for (const capability of domain.capabilities ?? []) {
      check(!capabilityIds.has(capability.id), `doppelte Capability ${capability.id}`); capabilityIds.add(capability.id);
      capabilityMap.set(capability.id, capability);
      capabilityDependencyEdges.set(capability.id, capability.dependencyIds ?? []);
      for (const field of ['name', 'status', 'purpose', 'companies', 'locations', 'roles', 'sourceIds', 'rationale', 'wave', 'scenarioId']) {
        check(Object.hasOwn(capability, field), `${capability.id}: ${field} fehlt`);
      }
      check(statuses.has(capability.status), `${capability.id}: ungueltiger Status ${capability.status}`);
      check((capability.companies ?? []).length > 0 && capability.companies.every((id) => companies.has(id)), `${capability.id}: ungueltige Gesellschaftszuordnung`);
      check((capability.locations ?? []).length > 0 && capability.locations.every((id) => locations.has(id)), `${capability.id}: ungueltige Standort-/Site-Zuordnung`);
      check((capability.roles ?? []).length > 0 && capability.roles.every((id) => people.has(id)), `${capability.id}: ungueltige Rollenzuordnung`);
      check((capability.sourceIds ?? []).length > 0 && capability.sourceIds.every((id) => sourceIds.has(id)), `${capability.id}: fehlende oder unbekannte Quelle`);
      check(String(capability.rationale ?? '').length >= 20, `${capability.id}: rationale ist nicht substanziell`);
      check(/^UABC-SCN-/.test(capability.scenarioId ?? ''), `${capability.id}: ungueltige scenarioId`);
      check(!scenarioIds.has(capability.scenarioId), `${capability.id}: doppelte reservierte scenarioId ${capability.scenarioId}`);
      scenarioIds.add(capability.scenarioId);
      if (['validated', 'approved'].includes(capability.status)) {
        check(openSpecRefs.has(capability.scenarioId), `${capability.id}: Capability mit Status ${capability.status} erfordert ein implementiertes OpenSpec-Szenario ${capability.scenarioId}`);
      }
      if (capability.evidenceId !== undefined) {
        const evidence = verificationMap.get(capability.evidenceId);
        check(Boolean(evidence), `${capability.id}: unbekannte evidenceId ${capability.evidenceId}`);
        if (capability.status === 'approved') check(evidence?.status === 'passed', `${capability.id}: approved Capability erfordert passed Evidence`);
      } else if (capability.status === 'approved') {
        check(false, `${capability.id}: approved Capability erfordert evidenceId`);
      }
    }
  }
  const waveOrder = new Map(['W0', 'W1', 'W2', 'W3', 'W4', 'W5'].map((wave, index) => [wave, index]));
  for (const capability of capabilityMap.values()) {
    const dependencies = capability.dependencyIds ?? [];
    check(Array.isArray(dependencies), `${capability.id}: dependencyIds muss ein Array sein`);
    for (const dependencyId of Array.isArray(dependencies) ? dependencies : []) {
      const dependency = capabilityMap.get(dependencyId);
      check(Boolean(dependency), `${capability.id}: unbekannte Capability-Abhaengigkeit ${dependencyId}`);
      check(dependencyId !== capability.id, `${capability.id}: Capability darf nicht von sich selbst abhaengen`);
      if (dependency && dependencyId !== capability.id) {
        const capabilityWave = waveOrder.get(capability.wave);
        const dependencyWave = waveOrder.get(dependency.wave);
        check(capabilityWave !== undefined && dependencyWave !== undefined, `${capability.id}: Wellenvergleich fuer Abhaengigkeiten erfordert W0..W5`);
        if (capabilityWave !== undefined && dependencyWave !== undefined) {
          check(dependencyWave <= capabilityWave, `${capability.id}: Abhaengigkeit ${dependencyId} liegt in spaeterer Welle ${dependency.wave}`);
        }
      }
    }
  }
  findCycle(capabilityMap.keys(), capabilityDependencyEdges, 'Capability-Abhaengigkeit');
  return { architecture, catalog, lifecycle, scenarioIds };
}

async function validateLifecycleGate({ architecture, catalog, lifecycle, verificationMap, openSpec }) {
  const validateWalkthroughCanonical = async (change, update, context) => {
    const registry = await yaml('exports/project-artifacts/v0.1/index.yaml');
    const artifact = (registry.artifacts ?? []).find((item) => item.artifactId === update?.facts?.pilotArtifact?.value);
    check(update?.facts?.artifactType?.status === 'confirmed' && update?.facts?.artifactType?.value === 'Walkthrough Package', `${context}: Walkthrough-Artefakttyp weicht vom proposedCanonicalUpdate ab`);
    check(update?.facts?.pilotArtifact?.status === 'confirmed' && Boolean(artifact), `${context}: Walkthrough-Pilot weicht vom proposedCanonicalUpdate ab`);
    check(artifact?.status === 'approved' && artifact?.governingChange === change, `${context}: Walkthrough-Register ist nicht durch ${change} freigegeben`);
    check(artifact?.evidenceSemantics?.artifactProvidesBusinessEvidence === false && artifact?.evidenceSemantics?.sourceEvidenceRetainedAsProvenance === true, `${context}: Evidence-Semantik des Walkthrough-Registers ist ungueltig`);
  };
  const canonicals = [
    { name: 'Architektur', value: architecture },
    { name: 'Capability-Katalog', value: catalog }
  ];
  if (openSpec.activeChanges.length === 0) {
    for (const canonical of canonicals) {
      if (openSpec.archivedChanges.has(canonical.value.governingChange)) {
        check(canonical.value.lifecycleStatus !== 'proposed', `${canonical.name}: governingChange ist archiviert, aber das kanonische Artefakt ist weiterhin proposed`);
      }
    }
  }

  for (const { change, config, file } of openSpec.archivedChangeConfigs.values()) {
    if (config.approvalPolicy?.type !== 'automated-policy-gate') continue;
    const update = config.proposedCanonicalUpdate;
    const policyEvidenceId = config.approvalPolicy.evidenceId;
    const policyEvidence = verificationMap.get(policyEvidenceId);
    const canonicalTargets = config.canonicalTargets ?? [];
    check(Array.isArray(canonicalTargets) && canonicalTargets.length > 0, `${file}: archivierter Change mit approvalPolicy erfordert canonicalTargets`);
    check(update?.status === 'applied', `${file}: archiviertes automatisiertes Policy-Gate erfordert proposedCanonicalUpdate-Status applied`);
    check(semanticEqual(update?.targets, canonicalTargets), `${file}: archivierte proposedCanonicalUpdate-Ziele muessen canonicalTargets entsprechen`);
    check(update?.policyGateEvidenceId === policyEvidenceId, `${file}: archivierte proposedCanonicalUpdate policyGateEvidenceId muss zur approvalPolicy passen`);
    check(policyEvidence?.changeRef === change, `${file}: archivierte Policy-Evidence ${policyEvidenceId} muss zu ${change} gehoeren`);
    check(policyEvidence?.type === 'automated-policy-gate', `${file}: archivierte Policy-Evidence ${policyEvidenceId} muss automated-policy-gate sein`);
    check(policyEvidence?.status === 'passed' && Boolean(policyEvidence?.evidence), `${file}: archiviertes automatisiertes Policy-Gate ${policyEvidenceId} muss passed bleiben und Evidence besitzen`);

    const archivedRequiredVerifications = [...verificationMap.values()].filter((item) => item.changeRef === change && item.requiredForArchive === true);
    check(archivedRequiredVerifications.length > 0, `${file}: archivierter Change erfordert change-spezifische Archiv-Verifications`);
    for (const verification of archivedRequiredVerifications) {
      check(verification.status === 'passed' && Boolean(verification.evidence), `${file}: archivierte erforderliche Verification ${verification.id} muss passed bleiben und Evidence besitzen`);
    }

    if (canonicalTargets.includes('architecture-baseline') && architecture.actualSandboxBaseline?.governingChange === change) {
      const baseline = architecture.actualSandboxBaseline;
      check(baseline.status === 'approved', `${file}: archivierte Architektur-Baseline muss approved bleiben`);
      check(semanticEqual(baseline.facts, update?.facts), `${file}: archivierte Architektur-Baseline-Fakten weichen semantisch vom proposedCanonicalUpdate ab`);
      check(semanticEqual(baseline.unknowns, update?.unknowns), `${file}: archivierte Architektur-Baseline-Unknowns weichen semantisch vom proposedCanonicalUpdate ab`);
      check(baseline.policyGateEvidenceId === policyEvidenceId, `${file}: archivierte Architektur-Baseline policyGateEvidenceId passt nicht`);
      const requiredEvidenceIds = new Set([...collectEvidenceIds(update?.facts), policyEvidenceId].filter(Boolean));
      check(semanticEqual(baseline.evidenceIds, [...requiredEvidenceIds]), `${file}: archivierte Architektur-Baseline evidenceIds passen nicht`);
      for (const evidenceId of new Set([...(baseline.evidenceIds ?? []), ...collectEvidenceIds(baseline.facts), baseline.policyGateEvidenceId].filter(Boolean))) {
        const verification = verificationMap.get(evidenceId);
        check(verification?.changeRef === change, `${file}: archivierte Architektur-Evidence ${evidenceId} muss zu ${change} gehoeren`);
        check(verification?.status === 'passed', `${file}: archivierte Architektur-Evidence ${evidenceId} muss passed bleiben`);
      }
      if (change === 'establish-playthru-environment-baseline') {
        const rawBaseline = await expectedSandboxBaselineFromRawEvidence();
        validateRawBaselineProjection(baseline, `${file}: Architektur-Baseline`, rawBaseline, { requireEvidenceIds: true });
        validateRawBaselineProjection(update, `${file}: archiviertes proposedCanonicalUpdate`, rawBaseline);
      }
    }
    if (canonicalTargets.includes('capability-catalog') && catalog.governingChange === change) {
      check(catalog.lifecycleStatus === 'approved', `${file}: archivierter Capability-Katalog muss approved bleiben`);
    }
    if (canonicalTargets.includes('walkthrough-package-registry')) await validateWalkthroughCanonical(change, update, file);
  }

  let activeChange = null;
  let changeConfig = {};
  let canonicalTargets = [];
  let proposedUpdate = null;
  let approvalPolicy = null;
  if (openSpec.activeChanges.length === 1) {
    activeChange = openSpec.activeChanges[0];
    changeConfig = openSpec.activeChangeConfigs.get(activeChange) ?? {};
    canonicalTargets = changeConfig.canonicalTargets ?? [];
    const targetDefinitions = lifecycle.rules?.canonicalStructuredPaths ?? {};
    check(Array.isArray(canonicalTargets) && canonicalTargets.length > 0, `${activeChange}: canonicalTargets muss mindestens ein explizites Ziel enthalten`);
    check(new Set(canonicalTargets).size === canonicalTargets.length, `${activeChange}: canonicalTargets muessen eindeutig sein`);
    for (const target of canonicalTargets) check(Boolean(targetDefinitions[target]), `${activeChange}: unbekanntes kanonisches Ziel ${target}`);
    proposedUpdate = changeConfig.proposedCanonicalUpdate;
    check(Boolean(proposedUpdate && typeof proposedUpdate === 'object'), `${activeChange}: proposedCanonicalUpdate ist erforderlich`);
    check(['unapplied', 'applied'].includes(proposedUpdate?.status), `${activeChange}: proposedCanonicalUpdate-Status muss unapplied oder applied sein`);
    check(JSON.stringify(proposedUpdate?.targets ?? []) === JSON.stringify(canonicalTargets), `${activeChange}: proposedCanonicalUpdate-Ziele muessen canonicalTargets in gleicher Reihenfolge entsprechen`);
    check(proposedUpdate?.facts && typeof proposedUpdate.facts === 'object' && !Array.isArray(proposedUpdate.facts), `${activeChange}: proposedCanonicalUpdate facts erforderlich`);
    check(Array.isArray(proposedUpdate?.unknowns), `${activeChange}: proposedCanonicalUpdate unknowns muss ein Array sein`);
    approvalPolicy = changeConfig.approvalPolicy;
    check(approvalPolicy?.type === 'automated-policy-gate', `${activeChange}: approvalPolicy type muss automated-policy-gate sein`);
    check(typeof approvalPolicy?.evidenceId === 'string' && approvalPolicy.evidenceId.length > 0, `${activeChange}: approvalPolicy evidenceId erforderlich`);
    check(proposedUpdate?.policyGateEvidenceId === approvalPolicy?.evidenceId, `${activeChange}: proposedCanonicalUpdate policyGateEvidenceId muss zur approvalPolicy passen`);
    if (activeChange === 'establish-playthru-environment-baseline' && canonicalTargets.includes('architecture-baseline')) {
      const rawBaseline = await expectedSandboxBaselineFromRawEvidence();
      validateRawBaselineProjection(proposedUpdate, `${activeChange}: proposedCanonicalUpdate`, rawBaseline);
      if (architecture.actualSandboxBaseline?.governingChange === activeChange) {
        validateRawBaselineProjection(architecture.actualSandboxBaseline, 'architecture-baseline', rawBaseline, { requireEvidenceIds: true });
      }
    }
  }

  if (!archiveReadyMode) return;

  check(openSpec.activeChanges.length === 1, `archive-ready erfordert genau einen aktiven Change, gefunden ${openSpec.activeChanges.length}`);
  check(proposedUpdate?.status === 'applied', `${activeChange}: proposedCanonicalUpdate ist ${proposedUpdate?.status ?? 'fehlt'}, erwartet applied`);

  const activeVerifications = [...verificationMap.values()].filter((item) => item.changeRef === activeChange);
  const policyGates = activeVerifications.filter((item) => item.type === 'automated-policy-gate' && item.requiredForArchive === true);
  check(policyGates.length === 1, `${activeChange}: archive-ready erfordert genau ein automatisiertes Policy-Gate fuer den aktiven Change, gefunden ${policyGates.length}`);
  check(policyGates[0]?.id === approvalPolicy?.evidenceId, `${activeChange}: aktives automatisiertes Policy-Gate muss zur approvalPolicy evidenceId ${approvalPolicy?.evidenceId ?? '<fehlt>'} passen`);
  check(policyGates[0]?.status === 'passed' && Boolean(policyGates[0]?.evidence), `${activeChange}: archive-ready erfordert ein passed automatisiertes Policy-Gate des aktiven Changes mit Evidence`);

  if (canonicalTargets.includes('architecture-baseline')) {
    const baseline = architecture.actualSandboxBaseline;
    check(baseline && typeof baseline === 'object' && !Array.isArray(baseline), 'architecture-baseline: archive-ready erfordert strukturierte actualSandboxBaseline');
    check(baseline?.status === 'approved', `architecture-baseline: archive-ready erfordert Status approved, gefunden ${baseline?.status ?? baseline}`);
    check(baseline?.governingChange === activeChange, `architecture-baseline: governingChange muss aktivem Change ${activeChange} entsprechen`);
    check(semanticEqual(baseline?.facts, proposedUpdate?.facts), 'architecture-baseline: facts weichen semantisch vom proposedCanonicalUpdate ab');
    check(semanticEqual(baseline?.unknowns, proposedUpdate?.unknowns), 'architecture-baseline: unknowns weichen semantisch vom proposedCanonicalUpdate ab');
    check(baseline?.policyGateEvidenceId === proposedUpdate?.policyGateEvidenceId, 'architecture-baseline: policyGateEvidenceId muss zum proposedCanonicalUpdate passen');
    check(baseline?.policyGateEvidenceId === policyGates[0]?.id, `architecture-baseline: policyGateEvidenceId muss das automatisierte Policy-Gate des aktiven Changes ${policyGates[0]?.id ?? '<fehlt>'} identifizieren`);

    const proposedFactEvidenceIds = collectEvidenceIds(proposedUpdate?.facts);
    const requiredBaselineEvidenceIds = new Set([...proposedFactEvidenceIds, proposedUpdate?.policyGateEvidenceId].filter(Boolean));
    check(semanticEqual(baseline?.evidenceIds, [...requiredBaselineEvidenceIds]), 'architecture-baseline: evidenceIds muessen vorgeschlagene Fakten-Evidence und Policy-Gate-Evidence exakt abdecken');
    const allUsedEvidenceIds = new Set([...(baseline?.evidenceIds ?? []), ...collectEvidenceIds(baseline?.facts), baseline?.policyGateEvidenceId].filter(Boolean));
    for (const evidenceId of allUsedEvidenceIds) {
      const verification = verificationMap.get(evidenceId);
      check(Boolean(verification), `architecture-baseline: unbekannte Evidence ${evidenceId}`);
      check(verification?.changeRef === activeChange, `architecture-baseline: Evidence ${evidenceId} gehoert nicht zum aktiven Change ${activeChange}`);
      check(verification?.status === 'passed', `architecture-baseline: Evidence ${evidenceId} muss passed sein`);
    }
    if (activeChange === 'establish-playthru-environment-baseline') {
      const rawBaseline = await expectedSandboxBaselineFromRawEvidence();
      validateRawBaselineProjection(baseline, 'architecture-baseline', rawBaseline, { requireEvidenceIds: true });
      validateRawBaselineProjection(proposedUpdate, `${activeChange}: proposedCanonicalUpdate`, rawBaseline);
    }
  }
  if (canonicalTargets.includes('capability-catalog')) {
    check(catalog.lifecycleStatus === 'approved', 'capability-catalog: archive-ready erfordert lifecycleStatus approved');
    check(catalog.governingChange === activeChange, `capability-catalog: governingChange muss aktivem Change ${activeChange} entsprechen`);
  }
  if (canonicalTargets.includes('walkthrough-package-registry')) await validateWalkthroughCanonical(activeChange, proposedUpdate, activeChange);

  for (const verification of activeVerifications) {
    if (verification.requiredForArchive === true) check(verification.status === 'passed', `${verification.id}: fuer Archivierung erforderliche aktive Verification ist ${verification.status}, erwartet passed`);
  }

  const declaredPreconditions = new Set(lifecycle.rules?.archivePreconditions ?? []);
  for (const expected of ['automatisiertes Policy-Gate des Changes erfuellt', 'kanonische strukturierte Artefakte von proposed nach approved aktualisiert', 'alle erforderlichen Nachweise bestanden', 'aktive Change-Specs strict-valide und durch OpenSpec-Archivierung mergebar', 'lokale Validierung bestanden']) {
    check(declaredPreconditions.has(expected), `Archivlebenszyklus vermisst erzwungene Vorbedingung: ${expected}`);
  }
}

async function validateAtlassian(stableIds, openSpecRefs, verificationMap) {
  const project = await yaml('atlassian/jira/project.yaml');
  const workflow = await yaml('atlassian/jira/workflow.yaml');
  const peopleDoc = await yaml('atlassian/jira/people.yaml');
  const allowedTypes = new Set(['Epic', 'Story', 'Task', 'Sub-task', 'Bug']);
  const people = new Set((peopleDoc.people ?? []).map((person) => person.id));
  const statuses = new Set(workflow.statuses ?? []);
  const transitions = new Set((workflow.transitions ?? []).map((item) => `${item.from}->${item.to}`));
  const components = new Set(project.components ?? []);
  const issueDocs = await Promise.all((await walk('atlassian/jira/issues', (file) => file.endsWith('.yaml'))).map(yaml));
  const issues = issueDocs.flatMap((doc) => doc.issues ?? []);
  const issueMap = new Map(issues.map((issue) => [issue.key, issue]));

  check(project.key === 'UABC', 'Jira-Projektschluessel muss UABC sein');
  check(issueMap.size === issues.length, 'doppelte Jira-Issue-Keys');
  check(issues.filter((issue) => issue.type === 'Epic' && issue.status !== 'Done').length <= 1, 'hoechstens ein aktuelles Epic darf nicht Done sein');

  const hierarchy = {
    Epic: new Set(),
    Story: new Set(['Epic']),
    Task: new Set(['Epic']),
    'Sub-task': new Set(['Story', 'Task']),
    Bug: new Set(['Epic', 'Story'])
  };
  const dependencyEdges = new Map();
  const required = ['key', 'type', 'summary', 'status', 'components', 'assignee', 'customerRole', 'startDate', 'dueDate', 'effort', 'dependencies', 'dataRequirements', 'acceptanceCriteria', 'referenceIds', 'confluenceRefs', 'evidenceRefs', 'historySynthetic', 'history'];
  for (const issue of issues) {
    for (const field of required) check(Object.hasOwn(issue, field), `${issue.key ?? 'unknown'}: ${field} fehlt`);
    check(/^UABC-\d+$/.test(issue.key), `${issue.key}: ungueltiger Key`);
    check(allowedTypes.has(issue.type), `${issue.key}: ungueltiger Typ ${issue.type}`);
    check(statuses.has(issue.status), `${issue.key}: unbekannter Status ${issue.status}`);
    check(people.has(issue.assignee) && people.has(issue.customerRole), `${issue.key}: unbekannte Personenreferenz`);
    check(issue.historySynthetic === true, `${issue.key}: simulierte Historie muss explizit als synthetisch markiert sein`);
    check((issue.components ?? []).length > 0 && issue.components.every((component) => components.has(component)), `${issue.key}: unbekannte oder leere Components`);
    check((issue.acceptanceCriteria ?? []).length > 0 && (issue.dataRequirements ?? []).length > 0, `${issue.key}: Akzeptanzkriterien und Datenanforderungen erforderlich`);
    check(dateValid(issue.startDate) && dateValid(issue.dueDate) && asDate(issue.startDate) <= asDate(issue.dueDate), `${issue.key}: inkonsistente Daten`);

    if (issue.type === 'Epic') check(issue.parent === null, `${issue.key}: Epic parent muss null sein`);
    else {
      const parent = issueMap.get(issue.parent);
      check(Boolean(parent), `${issue.key}: parent ${issue.parent} fehlt`);
      if (parent) {
        check(hierarchy[issue.type]?.has(parent.type), `${issue.key}: ${issue.type} darf kein Kind von ${parent.type} sein`);
        check(asDate(issue.startDate) >= asDate(parent.startDate) && asDate(issue.dueDate) <= asDate(parent.dueDate), `${issue.key}: Daten muessen in parent ${parent.key} passen`);
      }
    }

    dependencyEdges.set(issue.key, issue.dependencies ?? []);
    for (const dependency of issue.dependencies ?? []) check(issueMap.has(dependency), `${issue.key}: Abhaengigkeit ${dependency} fehlt`);
    for (const reference of issue.referenceIds ?? []) check(stableIds.has(reference) || openSpecRefs.has(reference), `${issue.key}: ungeloeste Referenz-ID ${reference}`);
    for (const evidenceId of issue.evidenceRefs ?? []) {
      const verification = verificationMap.get(evidenceId);
      check(Boolean(verification), `${issue.key}: ungeloeste Verification ${evidenceId}`);
      if (issue.status === 'In Review') check(['passed', 'in-review'].includes(verification?.status), `${issue.key}: In Review darf sich nicht auf Evidence ${evidenceId} mit Status ${verification?.status ?? 'fehlt'} stuetzen`);
    }

    let previousAt = null;
    for (const item of issue.history ?? []) {
      check(people.has(item.by), `${issue.key}: unbekannter Historienakteur ${item.by}`);
      check(statuses.has(item.from) && statuses.has(item.to) && transitions.has(`${item.from}->${item.to}`), `${issue.key}: ungueltiger Historienuebergang ${item.from}->${item.to}`);
      check(dateValid(item.at), `${issue.key}: ungueltiger Historienzeitpunkt`);
      if (dateValid(item.at)) {
        const at = asDate(item.at);
        check(previousAt === null || at >= previousAt, `${issue.key}: Historie ist nicht chronologisch`);
        check(at >= asDate(issue.startDate) && at < new Date(asDate(issue.dueDate).valueOf() + 86400000), `${issue.key}: Historienzeitpunkt liegt ausserhalb der Issue-Daten`);
        previousAt = at;
      }
    }
    const history = issue.history ?? [];
    if (history.length) check(history.at(-1).to === issue.status, `${issue.key}: aktueller Status widerspricht Historie`);
    else check(issue.status === 'Backlog', `${issue.key}: Nicht-Backlog-Issue benoetigt Historie`);

    if (issue.status === 'Done') {
      check(issue.doneGate?.acceptanceCriteriaMet === true, `${issue.key}: Done erfordert acceptanceCriteriaMet`);
      check(issue.doneGate?.verificationPassed === true, `${issue.key}: Done erfordert verificationPassed`);
      check(issue.doneGate?.humanApprovalRequired !== true || issue.doneGate?.humanApprovalRecorded === true, `${issue.key}: Done erfordert menschliche Freigabe, wenn sie verlangt ist`);
      check((issue.evidenceRefs ?? []).every((id) => verificationMap.get(id)?.status === 'passed'), `${issue.key}: Done erfordert passed Evidence`);
    }
  }
  findCycle(issueMap.keys(), dependencyEdges, 'Jira-Abhaengigkeit');

  const pageFiles = await walk('atlassian/confluence/pages', (file) => file.endsWith('.md'));
  const pages = await Promise.all(pageFiles.map(async (file) => ({ file, meta: frontmatter(await read(file), file) })));
  const pageMap = new Map(pages.map((page) => [page.meta.id, page]));
  check(pageMap.size === pages.length, 'doppelte Confluence-Seiten-IDs');
  const pageEdges = new Map();
  for (const { file, meta } of pages) {
    for (const field of ['id', 'title', 'parent', 'owners', 'status', 'jiraRefs', 'referenceIds', 'lastReviewed']) check(Object.hasOwn(meta, field), `${file}: ${field} fehlt`);
    check(/^UABC-[A-Z]+$/.test(meta.id ?? ''), `${file}: ungueltige Seiten-ID`);
    check(meta.parent === null || pageMap.has(meta.parent), `${file}: unbekannter parent ${meta.parent}`);
    pageEdges.set(meta.id, meta.parent ? [meta.parent] : []);
    check((meta.owners ?? []).length > 0 && meta.owners.every((owner) => people.has(owner)), `${file}: ungueltige owners`);
    check(dateValid(meta.lastReviewed), `${file}: ungueltiges lastReviewed`);
    check((meta.jiraRefs ?? []).length > 0 && meta.jiraRefs.every((key) => issueMap.has(key)), `${file}: ungueltige jiraRefs`);
    check((meta.referenceIds ?? []).length > 0 && meta.referenceIds.every((id) => stableIds.has(id) || openSpecRefs.has(id)), `${file}: ungeloeste referenceIds`);
  }
  findCycle(pageMap.keys(), pageEdges, 'Confluence-parent');
  for (const issue of issues) for (const reference of issue.confluenceRefs ?? []) check(pageMap.has(reference), `${issue.key}: Confluence-Referenz ${reference} fehlt`);
  check(pageMap.has((await yaml('atlassian/confluence/space.yaml')).homepage), 'Confluence-Startseite existiert nicht');
}

async function validateWalkthroughExports({ openSpec, openSpecRefs, verificationMap, people }) {
  const registryPath = 'exports/project-artifacts/v0.1/index.yaml';
  const targeted = [...openSpec.activeChangeConfigs.values()].some((config) => (config.canonicalTargets ?? []).includes('walkthrough-package-registry'));
  if (!(await exists(registryPath))) {
    check(!targeted, `${registryPath}: durch aktives walkthrough-package-registry-Ziel erforderlich`);
    return;
  }
  const registry = await yaml(registryPath);
  check(registry.schemaVersion === '0.1.0' && registry.access === 'read-only', `${registryPath}: ungueltiger Versions- oder Zugriffsvertrag`);
  check(Array.isArray(registry.artifacts) && registry.artifacts.length === 1, `${registryPath}: Pilot erfordert genau ein exportiertes Artefakt`);
  const issueDocs = await Promise.all((await walk('atlassian/jira/issues', (file) => file.endsWith('.yaml'))).map(yaml));
  const issueKeys = new Set(issueDocs.flatMap((doc) => (doc.issues ?? []).map((issue) => issue.key)));
  const sha256 = async (relative) => crypto.createHash('sha256').update(await fs.readFile(absolute(relative))).digest('hex');
  for (const artifact of registry.artifacts ?? []) {
    check(artifact.artifactId === 'UABC-WT-ENV-001' && artifact.artifactTypeId === 'UABC-ARTTYPE-WALKTHROUGH-001', `${registryPath}: unerwartete Pilotidentitaet`);
    for (const field of ['sourceManifestPath', 'resolvedManifestPath']) check(await exists(artifact[field]), `${registryPath}: ${field} ${artifact[field]} fehlt`);
    for (const [kind, file] of Object.entries(artifact.outputs ?? {})) {
      check(await exists(file), `${registryPath}: Output ${kind} ${file} fehlt`);
      if (await exists(file)) check(await sha256(file) === artifact.checksums?.[kind], `${registryPath}: Pruefsumme fuer ${kind} passt nicht`);
    }
    if (await exists(artifact.resolvedManifestPath)) check(await sha256(artifact.resolvedManifestPath) === artifact.checksums?.manifest, `${registryPath}: Manifest-Pruefsumme passt nicht`);
    if (await exists(artifact.sourceManifestPath)) {
      const source = await yaml(artifact.sourceManifestPath);
      check(source.artifactId === artifact.artifactId && source.artifactTypeId === artifact.artifactTypeId, `${artifact.sourceManifestPath}: Registeridentitaet passt nicht`);
      check(people.has(source.owner) && (source.reviewers ?? []).every((id) => people.has(id)), `${artifact.sourceManifestPath}: ungueltige owner oder reviewers`);
      check((source.sourceScenarioRefs ?? []).every((id) => openSpecRefs.has(id)), `${artifact.sourceManifestPath}: ungeloeste Szenarioreferenz`);
      check((source.requirementRefs ?? []).every((id) => openSpecRefs.has(id)), `${artifact.sourceManifestPath}: ungeloeste Requirement-Referenz`);
      check((source.jiraRefs ?? []).every((id) => issueKeys.has(id)), `${artifact.sourceManifestPath}: ungeloeste Jira-Referenz`);
      check((source.evidenceRefs ?? []).every((id) => verificationMap.has(id)), `${artifact.sourceManifestPath}: ungeloeste Evidence-Referenz`);
      for (const runRef of source.sourceRunRefs ?? []) check(await exists(`evidence/playthru-environment-baseline/${runRef}/manifest.json`), `${artifact.sourceManifestPath}: ungeloester Quelllauf ${runRef}`);
    }
  }
}

async function validateMainSpecPurposes() {
  const files = await walk('openspec/specs', (file) => file.endsWith('/spec.md'));
  for (const file of files) {
    const content = await read(file);
    const purpose = content.match(/## Purpose\s+([\s\S]*?)(?=\s+## Requirements)/)?.[1]?.trim() ?? '';
    check(purpose.length >= 20, `${file}: substantieller Purpose fehlt`);
    check(!/\bTBD\b|Zweck nach der Archivierung aktualisieren/i.test(purpose), `${file}: provisorischer Purpose ist unzulaessig`);
  }
}

const peopleDoc = await yaml('atlassian/jira/people.yaml');
const people = new Set((peopleDoc.people ?? []).map((person) => person.id));
check(people.size === (peopleDoc.people ?? []).length, 'doppelte Personen-IDs');
check((peopleDoc.people ?? []).every((person) => person.synthetic === true), 'alle Beispielpersonen muessen als synthetisch markiert sein');

const sourcesDoc = await yaml('docs/research/sources.yaml');
const sourceIds = new Set((sourcesDoc.sources ?? []).map((source) => source.id));
check(sourceIds.size === (sourcesDoc.sources ?? []).length, 'doppelte Quellen-IDs');

const verificationDoc = await yaml('evidence/verification-register.yaml');
const verificationMap = new Map((verificationDoc.verifications ?? []).map((item) => [item.id, item]));
const evidenceStatuses = new Set(['pending', 'in-review', 'passed', 'failed', 'superseded']);
check(verificationMap.size === (verificationDoc.verifications ?? []).length, 'doppelte Verification-IDs');
for (const verification of verificationMap.values()) {
  check(evidenceStatuses.has(verification.status), `${verification.id}: ungueltiger Evidence-Status`);
  check(typeof verification.requiredForArchive === 'boolean', `${verification.id}: requiredForArchive muss boolean sein`);
  check(typeof verification.changeRef === 'string' && verification.changeRef.length > 0, `${verification.id}: logischer changeRef erforderlich`);
  if (verification.status === 'passed') check(dateValid(verification.executedAt) && Boolean(verification.evidence), `${verification.id}: passed Evidence benoetigt Ausfuehrungszeit und Ergebnis`);
  if (verification.status === 'pending') check(verification.executedAt === null && verification.evidence === null, `${verification.id}: pending Evidence darf keine Ausfuehrung behaupten`);
}

const stableIds = new Set();
const idOwners = new Map();
registerIds(peopleDoc, 'atlassian/jira/people.yaml', stableIds, idOwners);
registerIds(sourcesDoc, 'docs/research/sources.yaml', stableIds, idOwners);
registerIds(verificationDoc, 'evidence/verification-register.yaml', stableIds, idOwners);

const architecture = await yaml('architecture/enterprise-blueprint.yaml');
const catalog = await yaml('capabilities/catalog.yaml');
const lifecycle = await yaml('governance/reference-lifecycle.yaml');
const openSpecConfig = await yaml('openspec/config.yaml');
const openSpecContext = String(openSpecConfig.context ?? '');
check(openSpecContext.includes('architecture/enterprise-blueprint.yaml#actualSandboxBaseline'), 'openspec/config.yaml: context muss den kanonischen actualSandboxBaseline-Pfad referenzieren');
check(/nur dort best(?:ae|ä)tigte Fakten/i.test(openSpecContext), 'openspec/config.yaml: Kontext muss die Baseline-Nutzung auf bestaetigte kanonische Fakten begrenzen');
check(/unbekannte oder nur teilweise sichtbare Werte/i.test(openSpecContext), 'openspec/config.yaml: Kontext muss unbekannte und nur teilweise sichtbare Baseline-Werte erhalten');
const openSpec = await openSpecReferences(lifecycle);
await validateMainSpecPurposes();
for (const verification of verificationMap.values()) {
  check(openSpec.activeChanges.includes(verification.changeRef) || openSpec.archivedChanges.has(verification.changeRef), `${verification.id}: changeRef ${verification.changeRef} ist weder aktiv noch archiviert`);
}
await validateCatalogAndArchitecture({
  stableIds,
  idOwners,
  people,
  sourceIds,
  verificationMap,
  openSpecRefs: new Set(openSpec.resolved.keys()),
  architecture,
  catalog,
  lifecycle
});
await validateLifecycleGate({ architecture, catalog, lifecycle, verificationMap, openSpec });
await validateAtlassian(stableIds, new Set(openSpec.resolved.keys()), verificationMap);
await validateWalkthroughExports({ openSpec, openSpecRefs: new Set(openSpec.resolved.keys()), verificationMap, people });
if (resolveArgumentIndex >= 0) {
  check(Boolean(resolveId), '--resolve-id erfordert ein ID-Argument');
  check(Boolean(openSpec.resolved.get(resolveId)), `OpenSpec-ID ${resolveId ?? '<fehlt>'} kann nicht aufgeloest werden`);
}

if (errors.length) {
  console.error(`Projektvalidierung fehlgeschlagen (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (resolveId) console.log(`OpenSpec-ID aufgeloest: ${JSON.stringify({ id: resolveId, ...openSpec.resolved.get(resolveId) })}`);
console.log(`Projektvalidierung bestanden (${archiveReadyMode ? 'archive-ready' : 'normal'}): aktive Changes=${openSpec.activeChanges.length}; Lifecycle-Aufloesung, Capability-Semantik, Standortverantwortung sowie Jira- und Confluence-Referenzen sind konsistent.`);

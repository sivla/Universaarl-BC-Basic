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
const exists = async (relative) => fs.access(absolute(relative)).then(() => true).catch(() => false);
const asDate = (value) => value instanceof Date ? value : new Date(String(value));
const dateValid = (value) => value !== null && !Number.isNaN(asDate(value).valueOf());

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
  check(Boolean(match), `${file}: missing YAML frontmatter`);
  if (!match) return {};
  try { return YAML.parse(match[1]); }
  catch (error) { errors.push(`${file}: invalid frontmatter: ${error.message}`); return {}; }
}

function registerIds(value, document, target, owners) {
  if (Array.isArray(value)) for (const item of value) registerIds(item, document, target, owners);
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if ((key === 'id' || key === 'artifactId') && typeof item === 'string') {
        const previous = owners.get(item);
        check(!previous, `duplicate structured ID ${item} in ${previous ?? document} and ${document}`);
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
    if (visiting.has(node)) { errors.push(`${label} cycle: ${[...trail, node].join(' -> ')}`); return; }
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
  check(changeDirs.length <= 1, `active OpenSpec changes must be 0..1, found ${changeDirs.length}`);
  const activeChangeConfigs = new Map();
  for (const change of changeDirs) {
    const manifest = `${changesRoot}/${change}/.openspec.yaml`;
    check(await exists(manifest), `${change}: missing .openspec.yaml`);
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
  check(order.join('>') === 'approved>proposed>historical', `resolutionOrder must be approved > proposed > historical, found ${order.join(' > ')}`);
  check(new Set(order).size === order.length, 'resolutionOrder states must be unique');
  for (const state of order) check((lifecycle.states ?? []).includes(state), `resolutionOrder uses undeclared state ${state}`);

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
          check(Boolean(archiveMatch), `${file}: historical archive directory must start with YYYY-MM-DD-`);
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
          check(archiveEntries.length <= 1, `${id}: duplicate historical definitions inside archived change ${archiveDir}`);
        }
        const newestFirst = [...sameState].sort((left, right) => {
          if (left.archiveDate !== right.archiveDate) return left.archiveDate < right.archiveDate ? 1 : -1;
          if (left.archiveDir !== right.archiveDir) return left.archiveDir < right.archiveDir ? 1 : -1;
          return left.file < right.file ? 1 : left.file > right.file ? -1 : 0;
        });
        if (!resolved.has(id) && newestFirst.length > 0) resolved.set(id, newestFirst[0]);
      } else {
        check(sameState.length <= 1, `${id}: duplicate OpenSpec definitions in lifecycle state ${state}`);
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

  const lifecycleStates = new Set(lifecycle.states ?? []);
  check(lifecycleStates.has('historical'), 'lifecycle states must declare historical');
  check(lifecycleStates.has(architecture.lifecycleStatus), `architecture: invalid lifecycleStatus ${architecture.lifecycleStatus}`);
  check(lifecycleStates.has(catalog.lifecycleStatus), `catalog: invalid lifecycleStatus ${catalog.lifecycleStatus}`);
  check(!['historical'].includes(architecture.lifecycleStatus), 'canonical architecture cannot use historical lifecycleStatus');
  check(!['historical'].includes(catalog.lifecycleStatus), 'canonical catalog cannot use historical lifecycleStatus');

  check(architecture.planningReference === '2026 Release Wave 1', 'planningReference must be 2026 Release Wave 1');
  const baseline = architecture.actualSandboxBaseline;
  check(baseline === 'unknown' || (baseline && typeof baseline === 'object' && !Array.isArray(baseline)), 'actualSandboxBaseline must be unknown or a structured evidence-based baseline');
  if (baseline !== 'unknown' && baseline && typeof baseline === 'object') {
    check(['candidate', 'approved'].includes(baseline.status), `actualSandboxBaseline: invalid status ${baseline.status}`);
    check(typeof baseline.governingChange === 'string' && baseline.governingChange.length > 0, 'actualSandboxBaseline: governingChange required');
    check(baseline.facts && typeof baseline.facts === 'object' && !Array.isArray(baseline.facts), 'actualSandboxBaseline: structured facts required');
    check(Array.isArray(baseline.evidenceIds) && baseline.evidenceIds.length > 0, 'actualSandboxBaseline: evidenceIds required');
    for (const evidenceId of baseline.evidenceIds ?? []) {
      const verification = verificationMap.get(evidenceId);
      check(Boolean(verification), `actualSandboxBaseline: unknown evidence ${evidenceId}`);
      if (baseline.status === 'approved') check(verification?.status === 'passed', `actualSandboxBaseline: approved baseline requires passed evidence ${evidenceId}`);
    }
    check(Array.isArray(baseline.unknowns), 'actualSandboxBaseline: unknowns must be an array');
  }
  check(/No feature availability may be inferred/.test(architecture.availabilityRule ?? ''), 'availabilityRule must prohibit inference from planning reference');

  const companies = new Set([
    ...(architecture.legalEntities ?? []).map((item) => item.bcCompany),
    ...(architecture.reportingCompanies ?? []).map((item) => item.bcCompany)
  ]);
  const siteMap = new Map((architecture.sites ?? []).map((site) => [site.id, site]));
  for (const location of architecture.locations ?? []) {
    const site = siteMap.get(location.site);
    check(companies.has(location.company), `${location.id}: unknown location company ${location.company}`);
    check(Boolean(site), `${location.id}: unknown site ${location.site}`);
    if (site) check(site.company === location.company, `${location.id}: location company ${location.company} conflicts with site ${site.id} company ${site.company}`);
  }
  const locations = new Set([...(architecture.locations ?? []).map((item) => item.id), ...siteMap.keys()]);
  const statuses = new Set(catalog.statusValues ?? []);
  const domainIds = new Set();
  const capabilityIds = new Set();
  const capabilityMap = new Map();
  const capabilityDependencyEdges = new Map();
  const scenarioIds = new Set();
  check((catalog.domains ?? []).length > 0, 'capability catalog requires at least one domain');
  for (const domain of catalog.domains ?? []) {
    check(!domainIds.has(domain.id), `duplicate capability domain ${domain.id}`); domainIds.add(domain.id);
    check(Boolean(domain.name), `${domain.id}: domain name required`);
    check((domain.capabilities ?? []).length > 0, `${domain.id}: at least one sub-capability required`);
    for (const capability of domain.capabilities ?? []) {
      check(!capabilityIds.has(capability.id), `duplicate capability ${capability.id}`); capabilityIds.add(capability.id);
      capabilityMap.set(capability.id, capability);
      capabilityDependencyEdges.set(capability.id, capability.dependencyIds ?? []);
      for (const field of ['name', 'status', 'purpose', 'companies', 'locations', 'roles', 'sourceIds', 'rationale', 'wave', 'scenarioId']) {
        check(Object.hasOwn(capability, field), `${capability.id}: missing ${field}`);
      }
      check(statuses.has(capability.status), `${capability.id}: invalid status ${capability.status}`);
      check((capability.companies ?? []).length > 0 && capability.companies.every((id) => companies.has(id)), `${capability.id}: invalid company assignment`);
      check((capability.locations ?? []).length > 0 && capability.locations.every((id) => locations.has(id)), `${capability.id}: invalid location/site assignment`);
      check((capability.roles ?? []).length > 0 && capability.roles.every((id) => people.has(id)), `${capability.id}: invalid role assignment`);
      check((capability.sourceIds ?? []).length > 0 && capability.sourceIds.every((id) => sourceIds.has(id)), `${capability.id}: missing or unknown source`);
      check(String(capability.rationale ?? '').length >= 20, `${capability.id}: rationale is not substantive`);
      check(/^UABC-SCN-/.test(capability.scenarioId ?? ''), `${capability.id}: invalid scenarioId`);
      check(!scenarioIds.has(capability.scenarioId), `${capability.id}: duplicate reserved scenarioId ${capability.scenarioId}`);
      scenarioIds.add(capability.scenarioId);
      if (['validated', 'approved'].includes(capability.status)) {
        check(openSpecRefs.has(capability.scenarioId), `${capability.id}: ${capability.status} capability requires an implemented OpenSpec scenario ${capability.scenarioId}`);
      }
      if (capability.evidenceId !== undefined) {
        const evidence = verificationMap.get(capability.evidenceId);
        check(Boolean(evidence), `${capability.id}: unknown evidenceId ${capability.evidenceId}`);
        if (capability.status === 'approved') check(evidence?.status === 'passed', `${capability.id}: approved capability requires passed evidence`);
      } else if (capability.status === 'approved') {
        check(false, `${capability.id}: approved capability requires evidenceId`);
      }
    }
  }
  const waveOrder = new Map(['W0', 'W1', 'W2', 'W3', 'W4', 'W5'].map((wave, index) => [wave, index]));
  for (const capability of capabilityMap.values()) {
    const dependencies = capability.dependencyIds ?? [];
    check(Array.isArray(dependencies), `${capability.id}: dependencyIds must be an array`);
    for (const dependencyId of Array.isArray(dependencies) ? dependencies : []) {
      const dependency = capabilityMap.get(dependencyId);
      check(Boolean(dependency), `${capability.id}: unknown capability dependency ${dependencyId}`);
      check(dependencyId !== capability.id, `${capability.id}: capability cannot depend on itself`);
      if (dependency && dependencyId !== capability.id) {
        const capabilityWave = waveOrder.get(capability.wave);
        const dependencyWave = waveOrder.get(dependency.wave);
        check(capabilityWave !== undefined && dependencyWave !== undefined, `${capability.id}: dependency wave comparison requires W0..W5`);
        if (capabilityWave !== undefined && dependencyWave !== undefined) {
          check(dependencyWave <= capabilityWave, `${capability.id}: dependency ${dependencyId} is in later wave ${dependency.wave}`);
        }
      }
    }
  }
  findCycle(capabilityMap.keys(), capabilityDependencyEdges, 'Capability dependency');
  return { architecture, catalog, lifecycle, scenarioIds };
}

async function validateLifecycleGate({ architecture, catalog, lifecycle, verificationMap, openSpec }) {
  const validateWalkthroughCanonical = async (change, update, context) => {
    const registry = await yaml('exports/project-artifacts/v0.1/index.yaml');
    const artifact = (registry.artifacts ?? []).find((item) => item.artifactId === update?.facts?.pilotArtifact?.value);
    check(update?.facts?.artifactType?.status === 'confirmed' && update?.facts?.artifactType?.value === 'Walkthrough Package', `${context}: walkthrough artifact type differs from proposedCanonicalUpdate`);
    check(update?.facts?.pilotArtifact?.status === 'confirmed' && Boolean(artifact), `${context}: walkthrough pilot differs from proposedCanonicalUpdate`);
    check(artifact?.status === 'approved' && artifact?.governingChange === change, `${context}: walkthrough registry is not approved by ${change}`);
    check(artifact?.evidenceSemantics?.artifactProvidesBusinessEvidence === false && artifact?.evidenceSemantics?.sourceEvidenceRetainedAsProvenance === true, `${context}: walkthrough registry evidence semantics invalid`);
  };
  const canonicals = [
    { name: 'architecture', value: architecture },
    { name: 'capability catalog', value: catalog }
  ];
  if (openSpec.activeChanges.length === 0) {
    for (const canonical of canonicals) {
      if (openSpec.archivedChanges.has(canonical.value.governingChange)) {
        check(canonical.value.lifecycleStatus !== 'proposed', `${canonical.name}: governing change is archived but canonical artifact is still proposed`);
      }
    }
  }

  for (const { change, config, file } of openSpec.archivedChangeConfigs.values()) {
    if (config.approvalPolicy?.type !== 'automated-policy-gate') continue;
    const update = config.proposedCanonicalUpdate;
    const policyEvidenceId = config.approvalPolicy.evidenceId;
    const policyEvidence = verificationMap.get(policyEvidenceId);
    const canonicalTargets = config.canonicalTargets ?? [];
    check(Array.isArray(canonicalTargets) && canonicalTargets.length > 0, `${file}: archived change with approvalPolicy requires canonicalTargets`);
    check(update?.status === 'applied', `${file}: archived automated policy gate requires proposedCanonicalUpdate status applied`);
    check(semanticEqual(update?.targets, canonicalTargets), `${file}: archived proposedCanonicalUpdate targets must match canonicalTargets`);
    check(update?.policyGateEvidenceId === policyEvidenceId, `${file}: archived proposedCanonicalUpdate policyGateEvidenceId must match approvalPolicy`);
    check(policyEvidence?.changeRef === change, `${file}: archived policy evidence ${policyEvidenceId} must belong to ${change}`);
    check(policyEvidence?.type === 'automated-policy-gate', `${file}: archived policy evidence ${policyEvidenceId} must be automated-policy-gate`);
    check(policyEvidence?.status === 'passed' && Boolean(policyEvidence?.evidence), `${file}: archived automated policy gate ${policyEvidenceId} must remain passed with evidence`);

    const archivedRequiredVerifications = [...verificationMap.values()].filter((item) => item.changeRef === change && item.requiredForArchive === true);
    check(archivedRequiredVerifications.length > 0, `${file}: archived change requires change-specific archive verifications`);
    for (const verification of archivedRequiredVerifications) {
      check(verification.status === 'passed' && Boolean(verification.evidence), `${file}: archived required verification ${verification.id} must remain passed with evidence`);
    }

    if (canonicalTargets.includes('architecture-baseline') && architecture.actualSandboxBaseline?.governingChange === change) {
      const baseline = architecture.actualSandboxBaseline;
      check(baseline.status === 'approved', `${file}: archived architecture baseline must remain approved`);
      check(semanticEqual(baseline.facts, update?.facts), `${file}: archived architecture baseline facts differ semantically from proposedCanonicalUpdate`);
      check(semanticEqual(baseline.unknowns, update?.unknowns), `${file}: archived architecture baseline unknowns differ semantically from proposedCanonicalUpdate`);
      check(baseline.policyGateEvidenceId === policyEvidenceId, `${file}: archived architecture baseline policyGateEvidenceId mismatch`);
      const requiredEvidenceIds = new Set([...collectEvidenceIds(update?.facts), policyEvidenceId].filter(Boolean));
      check(semanticEqual(baseline.evidenceIds, [...requiredEvidenceIds]), `${file}: archived architecture baseline evidenceIds mismatch`);
      for (const evidenceId of new Set([...(baseline.evidenceIds ?? []), ...collectEvidenceIds(baseline.facts), baseline.policyGateEvidenceId].filter(Boolean))) {
        const verification = verificationMap.get(evidenceId);
        check(verification?.changeRef === change, `${file}: archived architecture evidence ${evidenceId} must belong to ${change}`);
        check(verification?.status === 'passed', `${file}: archived architecture evidence ${evidenceId} must remain passed`);
      }
    }
    if (canonicalTargets.includes('capability-catalog') && catalog.governingChange === change) {
      check(catalog.lifecycleStatus === 'approved', `${file}: archived capability catalog must remain approved`);
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
    check(Array.isArray(canonicalTargets) && canonicalTargets.length > 0, `${activeChange}: canonicalTargets must contain at least one explicit target`);
    check(new Set(canonicalTargets).size === canonicalTargets.length, `${activeChange}: canonicalTargets must be unique`);
    for (const target of canonicalTargets) check(Boolean(targetDefinitions[target]), `${activeChange}: unknown canonical target ${target}`);
    proposedUpdate = changeConfig.proposedCanonicalUpdate;
    check(Boolean(proposedUpdate && typeof proposedUpdate === 'object'), `${activeChange}: proposedCanonicalUpdate is required`);
    check(['unapplied', 'applied'].includes(proposedUpdate?.status), `${activeChange}: proposedCanonicalUpdate status must be unapplied or applied`);
    check(JSON.stringify(proposedUpdate?.targets ?? []) === JSON.stringify(canonicalTargets), `${activeChange}: proposedCanonicalUpdate targets must match canonicalTargets in order`);
    check(proposedUpdate?.facts && typeof proposedUpdate.facts === 'object' && !Array.isArray(proposedUpdate.facts), `${activeChange}: proposedCanonicalUpdate facts required`);
    check(Array.isArray(proposedUpdate?.unknowns), `${activeChange}: proposedCanonicalUpdate unknowns must be an array`);
    approvalPolicy = changeConfig.approvalPolicy;
    check(approvalPolicy?.type === 'automated-policy-gate', `${activeChange}: approvalPolicy type must be automated-policy-gate`);
    check(typeof approvalPolicy?.evidenceId === 'string' && approvalPolicy.evidenceId.length > 0, `${activeChange}: approvalPolicy evidenceId required`);
    check(proposedUpdate?.policyGateEvidenceId === approvalPolicy?.evidenceId, `${activeChange}: proposedCanonicalUpdate policyGateEvidenceId must match approvalPolicy`);
  }

  if (!archiveReadyMode) return;

  check(openSpec.activeChanges.length === 1, `archive-ready requires exactly one active change, found ${openSpec.activeChanges.length}`);
  check(proposedUpdate?.status === 'applied', `${activeChange}: proposedCanonicalUpdate is ${proposedUpdate?.status ?? 'missing'}, expected applied`);

  const activeVerifications = [...verificationMap.values()].filter((item) => item.changeRef === activeChange);
  const policyGates = activeVerifications.filter((item) => item.type === 'automated-policy-gate' && item.requiredForArchive === true);
  check(policyGates.length === 1, `${activeChange}: archive-ready requires exactly one automated policy gate for the active change, found ${policyGates.length}`);
  check(policyGates[0]?.id === approvalPolicy?.evidenceId, `${activeChange}: active automated policy gate must match approvalPolicy evidenceId ${approvalPolicy?.evidenceId ?? '<missing>'}`);
  check(policyGates[0]?.status === 'passed' && Boolean(policyGates[0]?.evidence), `${activeChange}: archive-ready requires passed active-change automated policy gate with evidence`);

  if (canonicalTargets.includes('architecture-baseline')) {
    const baseline = architecture.actualSandboxBaseline;
    check(baseline && typeof baseline === 'object' && !Array.isArray(baseline), 'architecture-baseline: archive-ready requires structured actualSandboxBaseline');
    check(baseline?.status === 'approved', `architecture-baseline: archive-ready requires status approved, found ${baseline?.status ?? baseline}`);
    check(baseline?.governingChange === activeChange, `architecture-baseline: governingChange must match active change ${activeChange}`);
    check(semanticEqual(baseline?.facts, proposedUpdate?.facts), 'architecture-baseline: facts differ semantically from proposedCanonicalUpdate');
    check(semanticEqual(baseline?.unknowns, proposedUpdate?.unknowns), 'architecture-baseline: unknowns differ semantically from proposedCanonicalUpdate');
    check(baseline?.policyGateEvidenceId === proposedUpdate?.policyGateEvidenceId, 'architecture-baseline: policyGateEvidenceId must match proposedCanonicalUpdate');
    check(baseline?.policyGateEvidenceId === policyGates[0]?.id, `architecture-baseline: policyGateEvidenceId must identify the active-change automated policy gate ${policyGates[0]?.id ?? '<missing>'}`);

    const proposedFactEvidenceIds = collectEvidenceIds(proposedUpdate?.facts);
    const requiredBaselineEvidenceIds = new Set([...proposedFactEvidenceIds, proposedUpdate?.policyGateEvidenceId].filter(Boolean));
    check(semanticEqual(baseline?.evidenceIds, [...requiredBaselineEvidenceIds]), 'architecture-baseline: evidenceIds must exactly cover proposed fact evidence and policy-gate evidence');
    const allUsedEvidenceIds = new Set([...(baseline?.evidenceIds ?? []), ...collectEvidenceIds(baseline?.facts), baseline?.policyGateEvidenceId].filter(Boolean));
    for (const evidenceId of allUsedEvidenceIds) {
      const verification = verificationMap.get(evidenceId);
      check(Boolean(verification), `architecture-baseline: unknown evidence ${evidenceId}`);
      check(verification?.changeRef === activeChange, `architecture-baseline: evidence ${evidenceId} does not belong to active change ${activeChange}`);
      check(verification?.status === 'passed', `architecture-baseline: evidence ${evidenceId} must be passed`);
    }
  }
  if (canonicalTargets.includes('capability-catalog')) {
    check(catalog.lifecycleStatus === 'approved', 'capability-catalog: archive-ready requires lifecycleStatus approved');
    check(catalog.governingChange === activeChange, `capability-catalog: governingChange must match active change ${activeChange}`);
  }
  if (canonicalTargets.includes('walkthrough-package-registry')) await validateWalkthroughCanonical(activeChange, proposedUpdate, activeChange);

  for (const verification of activeVerifications) {
    if (verification.requiredForArchive === true) check(verification.status === 'passed', `${verification.id}: active-change archive-required verification is ${verification.status}, expected passed`);
  }

  const declaredPreconditions = new Set(lifecycle.rules?.archivePreconditions ?? []);
  for (const expected of ['change approval policy gate satisfied', 'canonical structured artifacts updated from proposed to approved', 'all required verifications passed', 'active change specs strict-valid and mergeable by OpenSpec archive', 'local validation passed']) {
    check(declaredPreconditions.has(expected), `archive lifecycle is missing enforced precondition: ${expected}`);
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

  check(project.key === 'UABC', 'Jira project key must be UABC');
  check(issueMap.size === issues.length, 'duplicate Jira issue keys');
  check(issues.filter((issue) => issue.type === 'Epic' && issue.status !== 'Done').length <= 1, 'at most one non-Done current Epic is allowed');

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
    for (const field of required) check(Object.hasOwn(issue, field), `${issue.key ?? 'unknown'}: missing ${field}`);
    check(/^UABC-\d+$/.test(issue.key), `${issue.key}: invalid key`);
    check(allowedTypes.has(issue.type), `${issue.key}: invalid type ${issue.type}`);
    check(statuses.has(issue.status), `${issue.key}: unknown status ${issue.status}`);
    check(people.has(issue.assignee) && people.has(issue.customerRole), `${issue.key}: unknown person reference`);
    check(issue.historySynthetic === true, `${issue.key}: simulated history must be explicitly synthetic`);
    check((issue.components ?? []).length > 0 && issue.components.every((component) => components.has(component)), `${issue.key}: unknown/empty components`);
    check((issue.acceptanceCriteria ?? []).length > 0 && (issue.dataRequirements ?? []).length > 0, `${issue.key}: acceptance criteria and data requirements required`);
    check(dateValid(issue.startDate) && dateValid(issue.dueDate) && asDate(issue.startDate) <= asDate(issue.dueDate), `${issue.key}: inconsistent dates`);

    if (issue.type === 'Epic') check(issue.parent === null, `${issue.key}: Epic parent must be null`);
    else {
      const parent = issueMap.get(issue.parent);
      check(Boolean(parent), `${issue.key}: missing parent ${issue.parent}`);
      if (parent) {
        check(hierarchy[issue.type]?.has(parent.type), `${issue.key}: ${issue.type} cannot be child of ${parent.type}`);
        check(asDate(issue.startDate) >= asDate(parent.startDate) && asDate(issue.dueDate) <= asDate(parent.dueDate), `${issue.key}: dates must fit parent ${parent.key}`);
      }
    }

    dependencyEdges.set(issue.key, issue.dependencies ?? []);
    for (const dependency of issue.dependencies ?? []) check(issueMap.has(dependency), `${issue.key}: missing dependency ${dependency}`);
    for (const reference of issue.referenceIds ?? []) check(stableIds.has(reference) || openSpecRefs.has(reference), `${issue.key}: unresolved reference ID ${reference}`);
    for (const evidenceId of issue.evidenceRefs ?? []) {
      const verification = verificationMap.get(evidenceId);
      check(Boolean(verification), `${issue.key}: unresolved verification ${evidenceId}`);
      if (issue.status === 'In Review') check(['passed', 'in-review'].includes(verification?.status), `${issue.key}: In Review cannot rely on ${verification?.status ?? 'missing'} evidence ${evidenceId}`);
    }

    let previousAt = null;
    for (const item of issue.history ?? []) {
      check(people.has(item.by), `${issue.key}: unknown history actor ${item.by}`);
      check(statuses.has(item.from) && statuses.has(item.to) && transitions.has(`${item.from}->${item.to}`), `${issue.key}: invalid history transition ${item.from}->${item.to}`);
      check(dateValid(item.at), `${issue.key}: invalid history timestamp`);
      if (dateValid(item.at)) {
        const at = asDate(item.at);
        check(previousAt === null || at >= previousAt, `${issue.key}: history is not chronological`);
        check(at >= asDate(issue.startDate) && at < new Date(asDate(issue.dueDate).valueOf() + 86400000), `${issue.key}: history timestamp outside issue dates`);
        previousAt = at;
      }
    }
    const history = issue.history ?? [];
    if (history.length) check(history.at(-1).to === issue.status, `${issue.key}: current status disagrees with history`);
    else check(issue.status === 'Backlog', `${issue.key}: non-Backlog issue needs history`);

    if (issue.status === 'Done') {
      check(issue.doneGate?.acceptanceCriteriaMet === true, `${issue.key}: Done requires acceptanceCriteriaMet`);
      check(issue.doneGate?.verificationPassed === true, `${issue.key}: Done requires verificationPassed`);
      check(issue.doneGate?.humanApprovalRequired !== true || issue.doneGate?.humanApprovalRecorded === true, `${issue.key}: Done requires human approval`);
      check((issue.evidenceRefs ?? []).every((id) => verificationMap.get(id)?.status === 'passed'), `${issue.key}: Done requires passed evidence`);
    }
  }
  findCycle(issueMap.keys(), dependencyEdges, 'Jira dependency');

  const pageFiles = await walk('atlassian/confluence/pages', (file) => file.endsWith('.md'));
  const pages = await Promise.all(pageFiles.map(async (file) => ({ file, meta: frontmatter(await read(file), file) })));
  const pageMap = new Map(pages.map((page) => [page.meta.id, page]));
  check(pageMap.size === pages.length, 'duplicate Confluence page IDs');
  const pageEdges = new Map();
  for (const { file, meta } of pages) {
    for (const field of ['id', 'title', 'parent', 'owners', 'status', 'jiraRefs', 'referenceIds', 'lastReviewed']) check(Object.hasOwn(meta, field), `${file}: missing ${field}`);
    check(/^UABC-[A-Z]+$/.test(meta.id ?? ''), `${file}: invalid page ID`);
    check(meta.parent === null || pageMap.has(meta.parent), `${file}: unknown parent ${meta.parent}`);
    pageEdges.set(meta.id, meta.parent ? [meta.parent] : []);
    check((meta.owners ?? []).length > 0 && meta.owners.every((owner) => people.has(owner)), `${file}: invalid owners`);
    check(dateValid(meta.lastReviewed), `${file}: invalid lastReviewed`);
    check((meta.jiraRefs ?? []).length > 0 && meta.jiraRefs.every((key) => issueMap.has(key)), `${file}: invalid jiraRefs`);
    check((meta.referenceIds ?? []).length > 0 && meta.referenceIds.every((id) => stableIds.has(id) || openSpecRefs.has(id)), `${file}: unresolved referenceIds`);
  }
  findCycle(pageMap.keys(), pageEdges, 'Confluence parent');
  for (const issue of issues) for (const reference of issue.confluenceRefs ?? []) check(pageMap.has(reference), `${issue.key}: missing Confluence ref ${reference}`);
  check(pageMap.has((await yaml('atlassian/confluence/space.yaml')).homepage), 'Confluence homepage does not exist');
}

async function validateWalkthroughExports({ openSpec, openSpecRefs, verificationMap, people }) {
  const registryPath = 'exports/project-artifacts/v0.1/index.yaml';
  const targeted = [...openSpec.activeChangeConfigs.values()].some((config) => (config.canonicalTargets ?? []).includes('walkthrough-package-registry'));
  if (!(await exists(registryPath))) {
    check(!targeted, `${registryPath}: required by active walkthrough-package-registry target`);
    return;
  }
  const registry = await yaml(registryPath);
  check(registry.schemaVersion === '0.1.0' && registry.access === 'read-only', `${registryPath}: invalid version or access contract`);
  check(Array.isArray(registry.artifacts) && registry.artifacts.length === 1, `${registryPath}: pilot requires exactly one exported artifact`);
  const issueDocs = await Promise.all((await walk('atlassian/jira/issues', (file) => file.endsWith('.yaml'))).map(yaml));
  const issueKeys = new Set(issueDocs.flatMap((doc) => (doc.issues ?? []).map((issue) => issue.key)));
  const sha256 = async (relative) => crypto.createHash('sha256').update(await fs.readFile(absolute(relative))).digest('hex');
  for (const artifact of registry.artifacts ?? []) {
    check(artifact.artifactId === 'UABC-WT-ENV-001' && artifact.artifactTypeId === 'UABC-ARTTYPE-WALKTHROUGH-001', `${registryPath}: unexpected pilot identity`);
    for (const field of ['sourceManifestPath', 'resolvedManifestPath']) check(await exists(artifact[field]), `${registryPath}: missing ${field} ${artifact[field]}`);
    for (const [kind, file] of Object.entries(artifact.outputs ?? {})) {
      check(await exists(file), `${registryPath}: missing output ${kind} ${file}`);
      if (await exists(file)) check(await sha256(file) === artifact.checksums?.[kind], `${registryPath}: checksum mismatch for ${kind}`);
    }
    if (await exists(artifact.resolvedManifestPath)) check(await sha256(artifact.resolvedManifestPath) === artifact.checksums?.manifest, `${registryPath}: manifest checksum mismatch`);
    if (await exists(artifact.sourceManifestPath)) {
      const source = await yaml(artifact.sourceManifestPath);
      check(source.artifactId === artifact.artifactId && source.artifactTypeId === artifact.artifactTypeId, `${artifact.sourceManifestPath}: registry identity mismatch`);
      check(people.has(source.owner) && (source.reviewers ?? []).every((id) => people.has(id)), `${artifact.sourceManifestPath}: invalid owner or reviewers`);
      check((source.sourceScenarioRefs ?? []).every((id) => openSpecRefs.has(id)), `${artifact.sourceManifestPath}: unresolved scenario reference`);
      check((source.requirementRefs ?? []).every((id) => openSpecRefs.has(id)), `${artifact.sourceManifestPath}: unresolved requirement reference`);
      check((source.jiraRefs ?? []).every((id) => issueKeys.has(id)), `${artifact.sourceManifestPath}: unresolved Jira reference`);
      check((source.evidenceRefs ?? []).every((id) => verificationMap.has(id)), `${artifact.sourceManifestPath}: unresolved evidence reference`);
      for (const runRef of source.sourceRunRefs ?? []) check(await exists(`evidence/playthru-environment-baseline/${runRef}/manifest.json`), `${artifact.sourceManifestPath}: unresolved source run ${runRef}`);
    }
  }
}

async function validateMainSpecPurposes() {
  const files = await walk('openspec/specs', (file) => file.endsWith('/spec.md'));
  for (const file of files) {
    const content = await read(file);
    const purpose = content.match(/## Purpose\s+([\s\S]*?)(?=\s+## Requirements)/)?.[1]?.trim() ?? '';
    check(purpose.length >= 20, `${file}: missing substantive Purpose`);
    check(!/\bTBD\b|Update Purpose after archive/i.test(purpose), `${file}: provisional Purpose is not allowed`);
  }
}

const peopleDoc = await yaml('atlassian/jira/people.yaml');
const people = new Set((peopleDoc.people ?? []).map((person) => person.id));
check(people.size === (peopleDoc.people ?? []).length, 'duplicate people IDs');
check((peopleDoc.people ?? []).every((person) => person.synthetic === true), 'all example people must be marked synthetic');

const sourcesDoc = await yaml('docs/research/sources.yaml');
const sourceIds = new Set((sourcesDoc.sources ?? []).map((source) => source.id));
check(sourceIds.size === (sourcesDoc.sources ?? []).length, 'duplicate source IDs');

const verificationDoc = await yaml('evidence/verification-register.yaml');
const verificationMap = new Map((verificationDoc.verifications ?? []).map((item) => [item.id, item]));
const evidenceStatuses = new Set(['pending', 'in-review', 'passed', 'failed', 'superseded']);
check(verificationMap.size === (verificationDoc.verifications ?? []).length, 'duplicate verification IDs');
for (const verification of verificationMap.values()) {
  check(evidenceStatuses.has(verification.status), `${verification.id}: invalid evidence status`);
  check(typeof verification.requiredForArchive === 'boolean', `${verification.id}: requiredForArchive must be boolean`);
  check(typeof verification.changeRef === 'string' && verification.changeRef.length > 0, `${verification.id}: logical changeRef required`);
  if (verification.status === 'passed') check(dateValid(verification.executedAt) && Boolean(verification.evidence), `${verification.id}: passed evidence needs execution time and result`);
  if (verification.status === 'pending') check(verification.executedAt === null && verification.evidence === null, `${verification.id}: pending evidence must not claim execution`);
}

const stableIds = new Set();
const idOwners = new Map();
registerIds(peopleDoc, 'atlassian/jira/people.yaml', stableIds, idOwners);
registerIds(sourcesDoc, 'docs/research/sources.yaml', stableIds, idOwners);
registerIds(verificationDoc, 'evidence/verification-register.yaml', stableIds, idOwners);

const architecture = await yaml('architecture/enterprise-blueprint.yaml');
const catalog = await yaml('capabilities/catalog.yaml');
const lifecycle = await yaml('governance/reference-lifecycle.yaml');
const openSpec = await openSpecReferences(lifecycle);
await validateMainSpecPurposes();
for (const verification of verificationMap.values()) {
  check(openSpec.activeChanges.includes(verification.changeRef) || openSpec.archivedChanges.has(verification.changeRef), `${verification.id}: changeRef ${verification.changeRef} is neither active nor archived`);
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
  check(Boolean(resolveId), '--resolve-id requires an ID argument');
  check(Boolean(openSpec.resolved.get(resolveId)), `cannot resolve OpenSpec ID ${resolveId ?? '<missing>'}`);
}

if (errors.length) {
  console.error(`Project validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (resolveId) console.log(`Resolved OpenSpec ID: ${JSON.stringify({ id: resolveId, ...openSpec.resolved.get(resolveId) })}`);
console.log(`Project validation passed (${archiveReadyMode ? 'archive-ready' : 'normal'}): active changes=${openSpec.activeChanges.length}; lifecycle resolution, capability semantics, location ownership, Jira and Confluence references are consistent.`);

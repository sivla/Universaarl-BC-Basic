import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import test from 'node:test';
import YAML from 'yaml';
import { buildPortableArtifacts, buildProjectBundle, canonicalJson, PROJECT_INDEX_PATH, validatePortableArtifacts, validatePortableContract } from '../../scripts/lib/portable-snapshot-pilot.mjs';

const source = YAML.parse(fs.readFileSync('project/bc-basic/portable-snapshot-pilot.yaml', 'utf8'));
const gitBytes = (relative) => execFileSync('git', ['show', `${source.release.producerCommitProvenance}:${relative}`], { encoding: null, maxBuffer: 64 * 1024 * 1024 });
const confluence = YAML.parse(gitBytes(source.sourceInventory.confluenceContractPath).toString('utf8'));
const readText = (relative) => gitBytes(relative).toString('utf8');
const clone = (value) => structuredClone(value);
const projectBundle = buildProjectBundle({ producerCommit: source.release.producerCommitProvenance, indexBytes: gitBytes(PROJECT_INDEX_PATH), readBytes: gitBytes });
const build = (contract = source, pages = confluence) => buildPortableArtifacts(contract, pages, readText, projectBundle);
const errorText = (contract, artifacts) => validatePortableArtifacts(contract, artifacts).join('\n');
const rewrite = (artifacts, relative, mutate) => {
  const copy = Object.fromEntries(Object.entries(artifacts).map(([key, value]) => [key, Buffer.from(value)]));
  const value = JSON.parse(copy[relative].toString('utf8'));
  mutate(value);
  copy[relative] = Buffer.from(canonicalJson(value), 'utf8');
  return copy;
};

test('kanonischer Brownfield- und portabler Snapshot-Pilot besteht', () => {
  assert.deepEqual(validatePortableContract(source, confluence), []);
  assert.deepEqual(validatePortableArtifacts(source, build()), []);
  assert.equal(source.release.bindingStatus, 'BOUND_BCPROJECTOS_RELEASE');
  assert.equal(source.release.pendingReason, null);
  assert.equal(source.release.consumerEligible, true);
  assert.equal(source.release.publishEligible, true);
  assert.equal(source.release.spectraReleaseBinding.releaseTag, 'spectra-v1.2.0-alpha.12');
  assert.equal(source.release.spectraReleaseBinding.platformEvidenceStatus, 'passed');
  assert.deepEqual(source.consumerIdentity, {
    consumerId: 'project-twin',
    repositoryUrl: 'https://github.com/sivla/Universaarl-Project-Twin.git',
    branch: 'codex/universaarl-projekt-twin',
    access: 'nur-lesend',
    authorizationScope: 'ausschliesslich-validierte-snapshots-lesen'
  });
  const artifacts = build();
  const payload = JSON.parse(artifacts[`${source.release.releaseDirectory}/payload.json`]);
  const manifest = JSON.parse(artifacts[`${source.release.releaseDirectory}/manifest.json`]);
  assert.equal(payload.views.internal.brownfieldReconciliation.rows.length, 30);
  assert.equal(payload.views.customer.approvedKnowledgeChanges.length, 1);
  assert.equal(payload.views.customer.contradictions, undefined);
  assert.equal(manifest.projectData.sourceCommit, source.release.producerCommitProvenance);
  assert.deepEqual(manifest.consumer, source.consumerIdentity);
  assert.equal(manifest.projectData.artifactCount, 170);
  assert.equal(manifest.files.filter((item) => item.kind === 'project-source').length, 170);
  assert.equal(manifest.files.length, 173);
  for (const relative of [source.release.currentPointerPath, `${source.release.releaseDirectory}/manifest.json`, manifest.files.find((item) => item.kind === 'project-source').path]) {
    assert.match(execFileSync('git', ['check-attr', 'text', '--', relative], { encoding: 'utf8' }), /text: unset/u, relative);
  }
});

test('die historische 0005-Evidence bleibt unveraenderlich erhalten', () => {
  for (const releaseId of ['UABC-PORTABLE-PILOT-0005']) {
    const oldDirectory = `exports/project-data/v1/snapshots/releases/${releaseId}`;
    for (const name of ['payload.json', 'catalog-fragment.json', 'manifest.json']) assert.equal(fs.existsSync(`${oldDirectory}/${name}`), true);
  }
});

test('falsche oder schreibende Twin-Consumeridentitaet wird abgelehnt', () => {
  const wrongRepository = clone(source); wrongRepository.consumerIdentity.repositoryUrl = 'https://github.com/sivla/FiBu.git';
  const writable = clone(source); writable.consumerIdentity.access = 'schreibend';
  assert.match(validatePortableContract(wrongRepository, confluence).join('\n'), /PILOT-CONSUMER/);
  assert.match(validatePortableContract(writable, confluence).join('\n'), /PILOT-CONSUMER/);
  const artifacts = build();
  const manifestPath = `${source.release.releaseDirectory}/manifest.json`;
  const changed = rewrite(artifacts, manifestPath, (manifest) => { manifest.consumer.branch = 'main'; });
  assert.match(errorText(source, changed), /PILOT-CONSUMER/);
});

test('unvollstaendige Spectra-Releaseevidence wird abgelehnt', () => {
  const input = clone(source); input.release.spectraReleaseBinding.platformEvidenceStatus = 'pending';
  assert.match(validatePortableContract(input, confluence).join('\n'), /PILOT-SPECTRA-EVIDENCE/);
});

test('unbekannte Quelle wird abgelehnt', () => {
  const input = clone(source); input.coverage[0].sourceIds = ['PAGE-UNBEKANNT'];
  assert.match(validatePortableContract(input, confluence).join('\n'), /PILOT-QUELLE-UNBEKANNT/);
});

test('instabile oder doppelte Seiten-ID wird abgelehnt', () => {
  const pages = clone(confluence); pages.roots[1].storyPageId = pages.roots[0].storyPageId;
  assert.match(validatePortableContract(source, pages).join('\n'), /PILOT-SEITEN/);
});

test('fehlender Checkpoint wird abgelehnt', () => {
  const input = clone(source); input.sourceInventory.checkpoint.checkpointId = null;
  assert.match(validatePortableContract(input, confluence).join('\n'), /PILOT-CHECKPOINT/);
});

test('ungueltiges Delta und Tombstone werden abgelehnt', () => {
  const input = clone(source); input.deltaContract.changes[0].type = 'unknown'; input.deltaContract.changes[1].tombstone = true;
  assert.match(validatePortableContract(input, confluence).join('\n'), /PILOT-DELTA-UNBEKANNT/);
  assert.match(validatePortableContract(input, confluence).join('\n'), /PILOT-TOMBSTONE/);
});

test('ungueltige Vorgaenger- oder Nachfolgerbeziehung wird abgelehnt', () => {
  const input = clone(source); input.deltaContract.changes[0].predecessorId = 'PAGE-UABC-000';
  assert.match(validatePortableContract(input, confluence).join('\n'), /PILOT-DELTA-REFERENZ/);
});

test('ungepruefter Wissenssatz darf keine Wahrheit werden', () => {
  const input = clone(source); input.knowledgeChanges[1].authoritative = true; input.knowledgeChanges[1].truthTarget = 'project/bc-basic/project-plan.yaml';
  assert.match(validatePortableContract(input, confluence).join('\n'), /PILOT-WISSENSWAHRHEIT/);
});

test('absoluter oder traversierender Pfad wird abgelehnt', () => {
  const absolute = clone(source); absolute.release.releaseDirectory = 'C:/temp/release';
  const traversal = clone(source); traversal.release.catalogPath = '../catalog.json';
  assert.match(validatePortableContract(absolute, confluence).join('\n'), /PILOT-PFAD/);
  assert.match(validatePortableContract(traversal, confluence).join('\n'), /PILOT-PFAD/);
});

test('veraenderlicher Release wird abgelehnt', () => {
  const input = clone(source); input.release.immutable = false;
  assert.match(validatePortableContract(input, confluence).join('\n'), /PILOT-IMMUTABILITAET/);
});

test('falscher Payloaddigest wird abgelehnt', () => {
  const artifacts = build();
  const manifestPath = `${source.release.releaseDirectory}/manifest.json`;
  const changed = rewrite(artifacts, manifestPath, (manifest) => { manifest.files[0].sha256 = '0'.repeat(64); });
  assert.match(errorText(source, changed), /PILOT-DIGEST/);
});

test('veraenderte commitgebundene Projektbytes werden abgelehnt', () => {
  const artifacts = build();
  const manifestPath = `${source.release.releaseDirectory}/manifest.json`;
  const manifest = JSON.parse(artifacts[manifestPath]);
  const projectSource = manifest.files.find((item) => item.kind === 'project-source');
  artifacts[projectSource.path] = Buffer.concat([artifacts[projectSource.path], Buffer.from('\nveraendert')]);
  assert.match(errorText(source, artifacts), /PILOT-DIGEST/);
});

test('widerspruechliche Projektindex-Zuordnung wird abgelehnt', () => {
  const artifacts = build();
  const manifestPath = `${source.release.releaseDirectory}/manifest.json`;
  const changed = rewrite(artifacts, manifestPath, (manifest) => {
    const projectSources = manifest.files.filter((item) => item.kind === 'project-source');
    projectSources[1].sourcePath = projectSources[0].sourcePath;
  });
  assert.match(errorText(source, changed), /PILOT-PROJEKTDATEN/);
});

test('ungueltiger Attachment-Digest wird abgelehnt', () => {
  const artifacts = build();
  const payloadPath = `${source.release.releaseDirectory}/payload.json`;
  const changed = rewrite(artifacts, payloadPath, (payload) => { payload.sourceInventory.pages[0].attachmentDigests = ['kein-digest']; });
  assert.match(errorText(source, changed), /PILOT-INVENTAR/);
});

test('divergierende Filesystem- und HTTPS-Bytes werden abgelehnt', () => {
  const artifacts = build();
  const manifestPath = `${source.release.releaseDirectory}/manifest.json`;
  const changed = rewrite(artifacts, manifestPath, (manifest) => { manifest.files[0].transports[1].sha256 = 'f'.repeat(64); });
  assert.match(errorText(source, changed), /PILOT-TRANSPORT/);
});

test('Cross-Customer-Leakage wird abgelehnt', () => {
  const artifacts = build();
  const changed = rewrite(artifacts, source.release.catalogPath, (catalog) => { catalog.customerFragments.push({ ...catalog.customerFragments[0], customerId: 'TEST-CUSTOMER-002' }); });
  assert.match(errorText(source, changed), /PILOT-CROSS-CUSTOMER/);
});

test('fremde Sichtklasse wird abgelehnt', () => {
  const artifacts = build();
  const payloadPath = `${source.release.releaseDirectory}/payload.json`;
  const changed = rewrite(artifacts, payloadPath, (payload) => { payload.visibilityBoundary.allowed.push('foreign'); });
  assert.match(errorText(source, changed), /PILOT-SICHTKLASSE/);
});

test('Katalogeintrag mit entzogener Releasefreigabe wird abgelehnt', () => {
  const artifacts = build();
  const changed = rewrite(artifacts, source.release.catalogPath, (catalog) => { catalog.customerFragments[0].consumerEligible = false; });
  assert.match(errorText(source, changed), /PILOT-CROSS-CUSTOMER/);
});

test('current.json mit falschem Manifestdigest wird abgelehnt', () => {
  const artifacts = build();
  const changed = rewrite(artifacts, source.release.currentPointerPath, (current) => { current.manifestSha256 = '1'.repeat(64); });
  assert.match(errorText(source, changed), /PILOT-CURRENT/);
});

test('zweite Kundeninstanz bleibt reine synthetische Fixture', () => {
  const fixture = JSON.parse(fs.readFileSync('tests/fixtures/portable-snapshot/other-customer-fragment.json', 'utf8'));
  assert.equal(fixture.fixtureOnly, true);
  assert.equal(fixture.synthetic, true);
  assert.notEqual(fixture.customerId, source.customerId);
  assert.equal(source.customerCatalog.projects.some((item) => item.projectId === fixture.projects[0].projectId), false);
});

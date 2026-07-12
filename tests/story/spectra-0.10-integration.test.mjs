import assert from 'node:assert/strict';
import test from 'node:test';
import { generateIntegration, jsonBytes } from '../../scripts/generate-spectra-0.10-integration.mjs';
import { loadIntegration, validateIntegration } from '../../scripts/validate-spectra-0.10-integration.mjs';

const base = loadIntegration();
const clone = () => ({
  ...base,
  binding: structuredClone(base.binding), releaseEvidence: structuredClone(base.releaseEvidence), index: structuredClone(base.index), indexBytes: Buffer.from(base.indexBytes),
  reconciliation: structuredClone(base.reconciliation), provenance: structuredClone(base.provenance), exportMap: structuredClone(base.exportMap), exportMapBytes: Buffer.from(base.exportMapBytes),
  coverage: structuredClone(base.coverage), coverageSource: structuredClone(base.coverageSource), coverageSourceBytes: Buffer.from(base.coverageSourceBytes),
  coverageMapping: structuredClone(base.coverageMapping), coverageMappingBytes: Buffer.from(base.coverageMappingBytes),
  coverageProjection: structuredClone(base.coverageProjection), coverageProjectionBytes: Buffer.from(base.coverageProjectionBytes), story: structuredClone(base.story)
});
const expectCode = (mutate, code) => { const data = clone(); mutate(data); assert.ok(validateIntegration(data).some((error) => error.startsWith(`${code}:`)), `Fehlercode ${code} fehlt`); };

test('vollstaendige Spectra-0.10-Integration besteht auf der echten Projektstory', () => assert.deepEqual(validateIntegration(clone()), []));
test('Generator liefert zweimal bytegleiche sieben Ausgabeartefakte', () => {
  const first = generateIntegration(); const second = generateIntegration();
  for (const key of ['reconciliation', 'exportMap', 'provenance', 'source', 'mapping', 'projection', 'coverage']) assert.deepEqual(jsonBytes(first[key]), jsonBytes(second[key]), key);
});
test('alte oder falsche Spectra-Bindung wird abgelehnt', () => expectCode((data) => { data.binding.spectraReleaseBinding.releaseVersion = '0.9.0-alpha.1'; }, 'SPECTRA_BINDUNG'));
test('manipulierte Release-Evidence wird abgelehnt', () => expectCode((data) => { data.releaseEvidence.payload.verifiedGitBlobs = 109; }, 'VEROEFFENTLICHUNGSNACHWEIS'));
test('manipulierter Projektionsdigest wird abgelehnt', () => expectCode((data) => { data.provenance.projection.projection_digest = '0'.repeat(64); }, 'PROJECTION_DIGEST'));
test('manipulierter Source-Hash wird abgelehnt', () => expectCode((data) => { data.provenance.source.source_hash = '0'.repeat(64); }, 'SOURCE_HASH'));
test('Source-Mutation nach der Projektion wird abgelehnt', () => expectCode((data) => { data.provenance.source.source_hash_after = '1'.repeat(64); }, 'SOURCE_MUTATION'));
test('fehlender 0.10-Abweichungsgrund wird abgelehnt', () => expectCode((data) => { data.reconciliation.variance.reason = 'Nur historische Abweichung.'; }, 'VARIANCE_REASON_REQUIRED'));
test('Rechnungs- oder Produktivbehauptung wird abgelehnt', () => expectCode((data) => { data.reconciliation.truth_boundary.invoice_claim = true; }, 'TRUTH_CLAIM'));
test('Schreibrecht oder Source-Ueberschreibung wird abgelehnt', () => expectCode((data) => { data.provenance.write_protection.overwrite_allowed = true; }, 'WRITE_PROTECTION'));
test('unsicherer absoluter oder traversierender Pfad wird abgelehnt', () => expectCode((data) => { data.coverage.provenance.source.path = '../project-story.json'; }, 'COVERAGE_PATH'));
test('manipulierter Coverage-Digest wird abgelehnt', () => expectCode((data) => { data.coverage.provenance.mapping.sha256 = '0'.repeat(64); }, 'COVERAGE_DIGEST'));
test('unvollstaendige Coverage-Erklaerung wird abgelehnt', () => expectCode((data) => { data.coverage.claims.explanation_complete = false; }, 'COVERAGE_SUMMARY'));
test('abweichende Coverage-Mappingregel wird abgelehnt', () => expectCode((data) => { data.coverageMapping.mappings[0].reason_code = 'direct'; data.coverageMappingBytes = jsonBytes(data.coverageMapping); data.coverage.provenance.mapping.sha256 = '0'.repeat(64); }, 'COVERAGE_MAPPING'));
test('unvollstaendige Storyverknuepfung wird abgelehnt', () => expectCode((data) => { data.story.catalogs.evidenceRefs = data.story.catalogs.evidenceRefs.filter((path) => path !== 'evidence/simulation/project-reconciliation.json'); }, 'STORY_LINK_INCOMPLETE'));
test('unvollstaendige Exportmap wird abgelehnt', () => expectCode((data) => { data.exportMap.artifacts.pop(); data.exportMapBytes = jsonBytes(data.exportMap); }, 'EXPORT_MAP_INCOMPLETE'));

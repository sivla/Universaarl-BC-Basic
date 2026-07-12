import assert from 'node:assert/strict';
import test from 'node:test';
import { loadIntegration, validateIntegration } from '../../scripts/validate-spectra-0.9-integration.mjs';

const base = loadIntegration();
const clone = () => ({ ...base, binding: structuredClone(base.binding), index: structuredClone(base.index), indexBytes: Buffer.from(base.indexBytes), reconciliation: structuredClone(base.reconciliation), provenance: structuredClone(base.provenance), exportMap: structuredClone(base.exportMap), exportMapBytes: Buffer.from(base.exportMapBytes), story: structuredClone(base.story) });
const expectCode = (mutate, code) => { const data = clone(); mutate(data); assert.ok(validateIntegration(data).some((error) => error.startsWith(`${code}:`)), `Fehlercode ${code} fehlt`); };

test('vollstaendige Spectra-0.9-Integration besteht auf der echten Projektstory', () => assert.deepEqual(validateIntegration(clone()), []));
test('alte oder falsche Spectra-Bindung wird abgelehnt', () => expectCode((data) => { data.binding.spectraReleaseBinding.releaseVersion = '0.8.0-alpha.1'; }, 'SPECTRA_BINDUNG'));
test('manipulierter Projektionsdigest wird abgelehnt', () => expectCode((data) => { data.provenance.projection.projection_digest = '0'.repeat(64); }, 'PROJECTION_DIGEST'));
test('manipulierter Source-Hash wird abgelehnt', () => expectCode((data) => { data.provenance.source.source_hash = '0'.repeat(64); }, 'SOURCE_HASH'));
test('Source-Mutation nach der Projektion wird abgelehnt', () => expectCode((data) => { data.provenance.source.source_hash_after = '1'.repeat(64); }, 'SOURCE_MUTATION'));
test('fehlender Abweichungsgrund wird abgelehnt', () => expectCode((data) => { data.reconciliation.variance.reason_code = 'none'; data.reconciliation.variance.reason = ''; }, 'VARIANCE_REASON_REQUIRED'));
test('Rechnungs- oder Produktivbehauptung wird abgelehnt', () => expectCode((data) => { data.reconciliation.truth_boundary.invoice_claim = true; }, 'TRUTH_CLAIM'));
test('Schreibrecht oder Source-Ueberschreibung wird abgelehnt', () => expectCode((data) => { data.provenance.write_protection.overwrite_allowed = true; }, 'WRITE_PROTECTION'));
test('unsicherer absoluter oder traversierender Pfad wird abgelehnt', () => expectCode((data) => { data.provenance.source.blob_path = '../index.yaml'; }, 'PATH_UNSAFE'));
test('unvollstaendige Storyverknuepfung wird abgelehnt', () => expectCode((data) => { data.story.tickets.find((ticket) => ticket.id === 'TKT-UABC-38').comments.find((comment) => comment.type === 'closing').text = 'Abschluss ohne Vertragsreferenz.'; }, 'STORY_LINK_INCOMPLETE'));
test('unvollstaendige Exportmap wird abgelehnt', () => expectCode((data) => { data.exportMap.artifacts.pop(); data.exportMapBytes = Buffer.from(`${JSON.stringify(data.exportMap, null, 2)}\n`); data.provenance.projection.projection_digest = '0'.repeat(64); }, 'EXPORT_MAP_INCOMPLETE'));

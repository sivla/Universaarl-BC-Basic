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
  coverageProjection: structuredClone(base.coverageProjection), coverageProjectionBytes: Buffer.from(base.coverageProjectionBytes), story: structuredClone(base.story), ticketExport: structuredClone(base.ticketExport), historicalTicketSources: structuredClone(base.historicalTicketSources)
});
const expectCode = (mutate, code) => { const data = clone(); mutate(data); assert.ok(validateIntegration(data).some((error) => error.startsWith(`${code}:`)), `Fehlercode ${code} fehlt`); };

test('vollstaendige Spectra-0.10-Integration besteht auf der echten Projektstory', () => assert.deepEqual(validateIntegration(clone()), []));
test('Ticketexport trennt 17 Storytickets und 38 interne Traceability-Issues ohne Doppelzaehlung', () => {
  assert.equal(base.ticketExport.recordCount, 55);
  assert.equal(base.ticketExport.customerStoryCount, 17);
  assert.equal(base.ticketExport.internalTraceabilityCount, 38);
  assert.equal(base.ticketExport.ticketRecords.length, 17);
  assert.equal(base.ticketExport.traceabilityRecords.length, 38);
  assert.equal(base.ticketExport.traceabilityRelations.length, 17);
  assert.equal(base.ticketExport.countedWorklogHours, 80);
});
test('Ticketexport liefert genau Board und kompakte Phasenliste ohne historische Issues', () => {
  assert.deepEqual(base.ticketExport.views.map(({ id, type }) => ({ id, type })), [
    { id: 'UABC-TICKET-VIEW-BOARD-001', type: 'board' },
    { id: 'UABC-TICKET-VIEW-COMPACT-001', type: 'compact-list' }
  ]);
  for (const view of base.ticketExport.views) {
    const ticketIds = view.groups.flatMap((group) => group.ticketIds);
    assert.equal(ticketIds.length, 17);
    assert.equal(new Set(ticketIds).size, 17);
    assert.ok(ticketIds.every((id) => id.startsWith('TKT-UABC-')));
  }
});
test('Tickettypen besitzen geschlossene deutsche Darstellung und leere lokale Live-Icon-Allowlist', () => {
  assert.deepEqual(Object.keys(base.ticketExport.typePresentations), ['epic', 'story', 'task', 'subtask', 'bug', 'change']);
  assert.deepEqual(base.ticketExport.typePresentations.bug, { typeLabel: 'Fehler', displayIconKey: 'jira-bug', displayColorToken: 'red' });
  assert.deepEqual(base.ticketExport.liveIconPolicy.allowlistedAssets, []);
  assert.deepEqual(base.ticketExport.liveIconPolicy.allowedOrigins, []);
  assert.ok([...base.ticketExport.ticketRecords, ...base.ticketExport.traceabilityRecords].every((ticket) => ticket.typeLabel && ticket.displayIconKey && ticket.displayColorToken));
});
test('Generator liefert zweimal bytegleiche acht Ausgabeartefakte', () => {
  const first = generateIntegration(); const second = generateIntegration();
  for (const key of ['reconciliation', 'ticketExport', 'exportMap', 'provenance', 'source', 'mapping', 'projection', 'coverage']) assert.deepEqual(jsonBytes(first[key]), jsonBytes(second[key]), key);
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
test('Ticketexport ohne expliziten Typ wird abgelehnt', () => expectCode((data) => { delete data.ticketExport.ticketRecords[0].type; }, 'TICKET_EXPORT_ABWEICHUNG'));
test('Ticketexport mit abweichendem Parent wird abgelehnt', () => expectCode((data) => { data.ticketExport.ticketRecords[1].parent = null; }, 'TICKET_EXPORT_ABWEICHUNG'));
test('Ticketvertrag mit Typinferenz wird abgelehnt', () => expectCode((data) => { data.index.ticketCatalog.inferTypeFromKeyOrTitle = true; }, 'TICKET_EXPORT_VERTRAG'));
test('Unbekannter nativer Tickettyp wird abgelehnt', () => expectCode((data) => { data.story.tickets[0].type = 'aus-titel-abgeleitet'; }, 'TICKET_TYP'));
test('Inkonsistenter nativer Parent-Typ wird abgelehnt', () => expectCode((data) => { data.story.tickets.find((ticket) => ticket.id === 'TKT-UABC-23').parent = 'TKT-UABC-35'; }, 'TICKET_PARENT_TYP'));
test('Unbekannte historische Typnormalisierung wird abgelehnt', () => expectCode((data) => { data.ticketExport.traceabilityRecords[0].canonicalType = 'task'; }, 'TICKET_TYP'));
test('Quelluebergreifender historischer Parent muss aufloesbar bleiben', () => expectCode((data) => { data.ticketExport.traceabilityRecords.find((ticket) => ticket.id === 'UABC-15').parent = 'UABC-NICHT-VORHANDEN'; }, 'TICKET_PARENT_TYP'));
test('Historische Issues duerfen keine Worklogstunden doppelt zaehlen', () => expectCode((data) => { data.ticketExport.traceabilityRecords[0].worklogHours = 68; }, 'TICKET_ZAEHLSCOPE'));
test('Fehlende realizes-plan-item-Kante wird abgelehnt', () => expectCode((data) => { data.ticketExport.traceabilityRelations.pop(); }, 'TICKET_ZAEHLSCOPE'));
test('Unsicherer Ticketquellpfad wird abgelehnt', () => expectCode((data) => { data.ticketExport.traceabilityRecords[0].sourcePath = '../jira.yaml'; }, 'TICKET_ZAEHLSCOPE'));
test('Nicht-lowercase Consumer-Typ wird abgelehnt', () => expectCode((data) => { data.ticketExport.traceabilityRecords[0].type = 'Epic'; }, 'TICKET_TYP'));
test('Abgeleitete statt explizite Planreferenz wird abgelehnt', () => expectCode((data) => { data.ticketExport.ticketRecords[0].planningRef = 'UABC-23'; }, 'TICKET_ZAEHLSCOPE'));
test('Zweite aktuelle Jira-Zaehlsurface wird abgelehnt', () => expectCode((data) => { data.index.artifacts.find((artifact) => artifact.id === 'UABC-SRC-BCB-JIRA-003').kindId = 'jira-issues'; }, 'TICKET_COUNTING_SURFACE'));
test('Unaufloesbare historische Dependency wird abgelehnt', () => expectCode((data) => { data.ticketExport.traceabilityRecords.find((ticket) => ticket.id === 'UABC-15').dependencyRefs = ['UABC-NICHT-VORHANDEN']; }, 'TICKET_ZAEHLSCOPE'));
test('Historisches Issue in einer Customer-View wird abgelehnt', () => expectCode((data) => { data.ticketExport.views[0].groups[0].ticketIds[0] = 'UABC-22'; }, 'TICKET_VIEW'));
test('Doppeltes oder fehlendes Storyticket in einer View wird abgelehnt', () => expectCode((data) => { data.ticketExport.views[1].groups[0].ticketIds[0] = 'TKT-UABC-23'; }, 'TICKET_VIEW'));
test('Ungueltiger initialState einer Ticketgruppe wird abgelehnt', () => expectCode((data) => { data.ticketExport.views[0].groups[0].initialState = 'visible'; }, 'TICKET_VIEW'));
test('Fehlende Typdarstellung wird abgelehnt', () => expectCode((data) => { delete data.ticketExport.typePresentations.change; }, 'TICKET_PRAESENTATION'));
test('Abweichende Recorddarstellung wird abgelehnt', () => expectCode((data) => { data.ticketExport.ticketRecords[0].displayIconKey = 'fremdes-icon'; }, 'TICKET_PRAESENTATION'));
test('Nicht allowlistgebundenes Live-Icon-Asset wird abgelehnt', () => expectCode((data) => { data.ticketExport.liveIconPolicy.allowlistedAssets.push({ path: 'https://example.invalid/icon.svg' }); }, 'TICKET_PRAESENTATION'));

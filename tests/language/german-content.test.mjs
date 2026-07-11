import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  RAW_EVIDENCE_BLOBS,
  STANDARD_PAYLOAD_KEYS,
  createStandardPayload,
  gitBlobSha1,
  scanEntries,
  scanRepository,
  validateStandardPayload
} from '../../scripts/check-german.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const scanner = path.join(root, 'scripts/check-german.mjs');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const gitEnvironment = { ...process.env, GIT_OPTIONAL_LOCKS: '0' };

function entry(relative, content, overrides = {}) {
  const bytes = Buffer.from(content, 'utf8');
  const blobHash = gitBlobSha1(bytes);
  return { path: relative, content: bytes, blobHash, indexBlobHash: blobHash, ...overrides };
}

function violations(relative, content) {
  return scanEntries([entry(relative, content)]).violations;
}

function runScanner(environment = {}, args = []) {
  return spawnSync(process.execPath, [scanner, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...environment },
    windowsHide: true
  });
}

test('unbekannte englische Wortfolgen in Markdown YAML und JSON-Schema werden erkannt', () => {
  const cases = [
    ['docs/neuer-text.md', '# Kundenfreigabe\nThis unfamiliar customer workflow requires careful approval before release.'],
    ['docs/neuer-text.yaml', 'summary: The newly discovered customer workflow requires careful approval.\n'],
    ['docs/neues-schema.json', JSON.stringify({
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      title: 'Unexpected customer approval workflow',
      description: 'This unfamiliar interface explains hidden customer outcomes.'
    })]
  ];
  for (const [relative, content] of cases) {
    const result = violations(relative, content);
    assert.ok(result.length > 0, relative);
    assert.equal(result.every((item) => item.path === relative), true);
  }
});

test('sichtbares HTML A11y-Beschriftungen und eingebettete Manifesttexte werden geprueft', () => {
  const html = `<!doctype html><html lang="de"><body>
    <button aria-label="Open the customer approval dashboard">Pruefen</button>
    <img alt="Unexpected customer workflow overview" src="bild.png">
    <script type="application/json">{"description":"This hidden customer workflow requires careful approval."}</script>
  </body></html>`;
  const result = violations('artifacts/walkthrough/generated/NEU/index.html', html);
  assert.ok(result.some((item) => item.location === 'HTML-aria-label'));
  assert.ok(result.some((item) => item.location === 'HTML-alt'));
  assert.ok(result.some((item) => item.location?.includes('eingebettetesManifest')));
});

test('eigene JavaScript-Fehler und Testtitel werden erkannt', () => {
  const source = `
    import test from 'node:test';
    throw new Error('The unfamiliar customer workflow requires careful approval.');
    test('Unexpected customer outcomes remain visible after release', () => {});
  `;
  const result = violations('scripts/neuer-nachbar.mjs', source);
  assert.ok(result.length >= 2, JSON.stringify(result));
  assert.equal(result.every((item) => item.location === 'JavaScript-Zeichenfolge'), true);
});

test('JavaScript prueft nur echte Fehler-, Pruef-, CLI-, A11y-, Testtitel- und Ausgabekontexte', () => {
  const visible = `
    fail('The unfamiliar customer workflow requires careful approval.');
    check(false, 'The hidden customer dashboard exposes unexpected outcomes.');
    console.error('The customer approval workflow failed unexpectedly.');
    process.stdout.write('The customer workflow result remains unexpectedly visible.');
    button.textContent = 'The customer approval dashboard remains unexpectedly visible.';
    button.setAttribute('aria-label', 'Open the unfamiliar customer approval dashboard');
  `;
  const visibleReport = violations('scripts/ausgaben.mjs', visible);
  assert.ok(visibleReport.length >= 6, JSON.stringify(visibleReport));

  const technical = `
    for (const field of ['sourceRunRefs', 'sourceScenarioRefs', 'businessRationale', 'expectedResult']) compare(field);
    const manifestFields = ['companySwitchPerformed', 'generatedAt', 'rawTrace', 'readOnlyGuard', 'resourceType', 'sourceManifestPath'];
    if (mode === 'businesscentral-network-read-only-fail-closed') compare(mode);
    const title = 'Unfamiliar customer workflow implementation guide';
    const fixture = { title: 'Unexpected customer approval workflow' };
  `;
  assert.deepEqual(violations('scripts/technische-vergleiche.mjs', technical), []);

  const governanceTitle = violations('tests/governance/neuer-sprachtest.test.mjs', "test('Unexpected customer outcomes remain visible after release', () => {});");
  assert.equal(governanceTitle.length, 1);
});

test('Grossschreibung Mischsprache CamelCase Unterstriche Trenner und neue Nachbardateien werden erkannt', () => {
  const cases = [
    ['docs/gross.md', 'THIS CUSTOMER WORKFLOW REQUIRES CAREFUL APPROVAL.'],
    ['docs/gemischt.md', 'Dieser workflow needs careful approval before release.'],
    ['docs/camel.md', 'ThisCustomerWorkflowRequiresCarefulApproval'],
    ['docs/unterstrich.md', 'this_customer_workflow_requires_careful_approval'],
    ['docs/trenner.md', 'this-customer-workflow-requires-careful-approval'],
    ['docs/voellig-neue-nachbardatei.md', 'The adjacent customer dashboard exposes unexpected approval outcomes.']
  ];
  for (const [relative, content] of cases) assert.ok(violations(relative, content).length > 0, relative);
});

test('Review- und Exportnarrative besitzen keine pauschale Ausnahme', () => {
  const review = violations('artifacts/walkthrough/reviews/NEU-visual.yaml', 'findings:\n  - The customer workflow exposes unexpected approval outcomes.\n');
  const exportText = violations('exports/project-artifacts/v9/index.yaml', 'consumerNote: This package displays hidden customer approval outcomes.\n');
  const verification = violations('evidence/verification-register.yaml', 'evidence: The reviewer confirms unexpected customer workflow outcomes.\n');
  assert.ok(review.length > 0);
  assert.ok(exportText.length > 0);
  assert.ok(verification.length > 0);
});

test('.gitattributes wird als technische Regeldatei eng und fail-closed behandelt', () => {
  const allowed = scanEntries([entry('.gitattributes', [
    'evidence/run-1/manifest.json -text',
    'artifacts/generated/index.html -text'
  ].join('\n'))]);
  assert.deepEqual(allowed.violations, []);
  assert.equal(allowed.scannedFileCount, 1);
  assert.equal(allowed.exceptions.filter((item) => item.kind === 'technische-gitattributes-regel').length, 2);

  const comment = scanEntries([entry('.gitattributes', '# This unfamiliar customer workflow requires careful approval.\n')]);
  assert.equal(comment.violations.length, 1);
});

test('deutsche Texte und eng gebundene technische Marker bleiben zulaessig', () => {
  const entries = [
    entry('docs/positiv.md', '# Pruefung\nDie fachliche Pruefung bestaetigt den sichtbaren Ablauf fuer das Unternehmen.\n`npm test` bleibt der technische Befehl.'),
    entry('docs/positiv.yaml', [
      'artifactId: UABC-WT-TEST-001',
      'status: passed',
      'purpose: learning-and-display',
      'path: artifacts/walkthrough/generated/index.html',
      'summary: Der sichtbare Ablauf ist vollstaendig auf Deutsch beschrieben.'
    ].join('\n')),
    entry('docs/positiv-schema.json', JSON.stringify({ type: 'object', title: 'Deutsche Pruefung', description: 'Die Oberflaeche zeigt den geprueften Ablauf.' })),
    entry('docs/positiv.html', '<button aria-label="Fachliche Freigabe pruefen">Pruefen</button>'),
    entry('scripts/positiv.mjs', "throw new Error('Die fachliche Freigabe fehlt.');\ntest('deutsche Oberflaeche bleibt sichtbar', () => {});")
  ];
  const report = scanEntries(entries);
  assert.deepEqual(report.violations, []);
  assert.equal(report.scannedFileCount, entries.length);
  assert.ok(report.checkedValueCount > 0);
});

test('historische Roh-Nachweise sind nur mit exaktem Pfad und Git-Blob ausgenommen', () => {
  const [relative, expectedBlob] = Object.entries(RAW_EVIDENCE_BLOBS)[0];
  const bytes = fs.readFileSync(path.join(root, ...relative.split('/')));
  assert.equal(gitBlobSha1(bytes), expectedBlob);
  const exact = scanEntries([{ path: relative, content: bytes, blobHash: expectedBlob, indexBlobHash: expectedBlob }]);
  assert.deepEqual(exact.violations, []);
  assert.equal(exact.exceptions.some((item) => item.kind === 'historische-raw-evidence'), true);

  const changedBytes = Buffer.concat([bytes, Buffer.from('\n')]);
  const changedBlob = gitBlobSha1(changedBytes);
  const changed = scanEntries([{ path: relative, content: changedBytes, blobHash: changedBlob, indexBlobHash: expectedBlob }]);
  assert.equal(changed.violations.some((item) => item.kind === 'raw-evidence-blobabweichung'), true);

  const copied = violations('evidence/neuer-nachweis.json', '{"description":"This customer workflow requires careful approval."}');
  assert.ok(copied.length > 0);
});

test('B-Werte sind nur an ihre exakten Felder und Planungsreferenzmarker gebunden', () => {
  const baselineArchive = 'openspec/changes/archive/2026-07-10-establish-playthru-environment-baseline/.openspec.yaml';
  const allowed = scanEntries([
    entry('architecture/enterprise-blueprint.yaml', [
      'planningReference: 2026 Release Wave 1',
      'actualSandboxBaseline:',
      '  facts:',
      '    executionContext:',
      '      scope: user-run-context'
    ].join('\n')),
    entry(baselineArchive, [
      'proposedCanonicalUpdate:',
      '  facts:',
      '    executionContext:',
      '      scope: user-run-context'
    ].join('\n')),
    entry('docs/planungsreferenz.md', 'Planungsmarker: planningReference: 2026 Release Wave 1. Die fachliche Pruefung bleibt deutsch.'),
    entry('openspec/config.yaml', 'context: "Die Konfiguration nutzt planningReference: 2026 Release Wave 1. Alle fachlichen Aussagen bleiben deutsch."')
  ]);
  assert.deepEqual(allowed.violations, []);
  assert.equal(allowed.exceptions.filter((item) => item.kind === 'gebundener-ausfuehrungskontext').length, 2);
  assert.equal(allowed.exceptions.some((item) => item.kind === 'technische-planungsreferenz'), true);
  assert.equal(allowed.exceptions.filter((item) => item.kind === 'technischer-planungsreferenzmarker').length, 2);

  const wrong = scanEntries([
    entry('architecture/enterprise-blueprint.yaml', 'otherScope: user-run-context\n'),
    entry('docs/falscher-marker.md', 'releaseLabel: 2026 Release Wave 1 requires careful customer approval before release.')
  ]);
  assert.equal(wrong.violations.some((item) => item.text.includes('user-run-context')), true);
  assert.equal(wrong.violations.some((item) => item.path.endsWith('falscher-marker.md')), true);
});

test('C-Werte gelten nur in den inventarisierten strukturellen Kontexten', () => {
  const baselineArchive = 'openspec/changes/archive/2026-07-10-establish-playthru-environment-baseline/.openspec.yaml';
  const allowed = scanEntries([
    entry('architecture/enterprise-blueprint.yaml', [
      'identityAndEnvironment:',
      '  targetEnvironment:',
      '    writeReadiness: not-authorized',
      'sites:',
      '  - {}',
      '  - {}',
      '  - {}',
      '  - {}',
      '  - inventoryPurpose: project staging'
    ].join('\n')),
    entry('capabilities/catalog.yaml', 'statusValues: [planned, validated, approved, deferred, out-of-scope]\n'),
    entry('exports/project-artifacts/v0.1/index.yaml', 'access: read-only\n'),
    entry(baselineArchive, 'approvalPolicy:\n  authorizedBy: real-repository-user\n'),
    entry('evidence/verification-register.yaml', 'verifications:\n  - type: human-approval\n')
  ]);
  assert.deepEqual(allowed.violations, []);
  for (const kind of ['gebundene-schreibbereitschaft', 'gebundener-inventarzweck', 'deklarierter-statuswert', 'gebundener-exportzugriff', 'gebundene-freigabeidentitaet', 'deklarierter-verifikationstyp']) {
    assert.equal(allowed.exceptions.some((item) => item.kind === kind), true, kind);
  }

  const wrong = scanEntries([
    entry('architecture/enterprise-blueprint.yaml', 'otherWriteState: not-authorized\nsites:\n  - inventoryPurpose: project staging\n'),
    entry('capabilities/catalog.yaml', 'otherValues: [out-of-scope]\n'),
    entry('exports/project-artifacts/v0.1/index.yaml', 'mode: read-only\n'),
    entry(baselineArchive, 'approvalPolicy:\n  otherIdentity: real-repository-user\n'),
    entry('evidence/verification-register.yaml', 'verifications:\n  - type: unexpected-customer-workflow\n'),
    entry('docs/status.yaml', 'status: unexpected-customer-workflow\n')
  ]);
  for (const expected of ['not-authorized', 'project staging', 'out-of-scope', 'read-only', 'real-repository-user', 'unexpected-customer-workflow']) {
    assert.equal(wrong.violations.some((item) => item.text.includes(expected)), true, expected);
  }
});

test('Verifikationsnachweis entfernt nur technischen Pfad und humanApproval-Marker', () => {
  const relative = 'evidence/verification-register.yaml';
  const prefix = 'verifications:\n  - evidence: "evidence/playthru-environment-baseline/visual-review.yaml; 14 kuratierte Screenshots fachlich geprueft mit humanApproval false';
  const allowed = scanEntries([entry(relative, `${prefix}."\n`)]);
  assert.deepEqual(allowed.violations, []);
  assert.equal(allowed.exceptions.some((item) => item.kind === 'technischer-visual-review-pfad'), true);
  assert.equal(allowed.exceptions.some((item) => item.kind === 'technischer-human-approval-marker'), true);

  const prose = scanEntries([entry(relative, `${prefix}; This unfamiliar customer workflow requires careful approval."\n`)]);
  assert.equal(prose.violations.some((item) => item.path === relative), true);
  const wrongField = scanEntries([entry(relative, 'notes: "evidence/playthru-environment-baseline/visual-review.yaml; humanApproval false; This unfamiliar customer workflow requires careful approval."\n')]);
  assert.equal(wrongField.violations.some((item) => item.path === relative), true);
});

test('offizielle Originaltitel sind nur im Quellenfeld und an der passenden Link-URL zulaessig', () => {
  const title = 'Unfamiliar customer workflow implementation guide';
  const url = 'https://example.invalid/official-guide';
  const source = entry('docs/research/sources.yaml', [
    'schemaVersion: 1',
    'sources:',
    `  - { id: SRC-TEST-001, kind: official, title: ${title}, url: ${url}, retrievedAt: 2026-07-11, appliesTo: nur Pruefung }`
  ].join('\n'));
  const linked = entry('docs/research/source-register.md', `Die offizielle Quelle [${title}](${url}) wird fachlich eingeordnet.`);
  const allowed = scanEntries([source, linked]);
  assert.deepEqual(allowed.violations, []);
  assert.equal(allowed.exceptions.some((item) => item.kind === 'offizieller-quellentitel'), true);
  assert.equal(allowed.exceptions.some((item) => item.kind === 'zugehoerige-offizielle-linkbeschriftung'), true);

  const wrongField = scanEntries([source, entry('docs/research/notizen.yaml', `notes: ${title}\n`)]);
  assert.ok(wrongField.violations.some((item) => item.path.endsWith('notizen.yaml')));
  const wrongUrl = scanEntries([source, entry('docs/research/source-register.md', `[${title}](https://example.invalid/andere-quelle)`)]);
  assert.ok(wrongUrl.violations.some((item) => item.path === 'docs/research/source-register.md'));
});

test('Standardpayload besitzt exakt sechs Eigenschaften in fester Schreibweise Reihenfolge und Typisierung', () => {
  const commit = 'a'.repeat(40);
  const payload = createStandardPayload(commit);
  assert.deepEqual(Object.keys(payload), STANDARD_PAYLOAD_KEYS);
  assert.deepEqual(validateStandardPayload(payload, { expectedCommit: commit }), []);

  const variants = [];
  const wrongCase = { ...payload }; delete wrongCase.projectId; wrongCase.projectID = 'blueprint'; variants.push(wrongCase);
  variants.push({ ...payload, extra: true });
  variants.push({ ...payload, schemaVersion: '1' });
  variants.push({ ...payload, status: true });
  variants.push({ ...payload, language: 'DE' });
  variants.push({ ...payload, projectId: 'project-twin' });
  variants.push({ ...payload, commit: 'A'.repeat(40) });
  variants.push({ ...payload, userVisibleOwnContentGerman: 'true' });
  variants.push({ status: 'passed', schemaVersion: 1, language: 'de', projectId: 'blueprint', commit, userVisibleOwnContentGerman: true });
  for (const variant of variants) assert.ok(validateStandardPayload(variant, { expectedCommit: commit }).length > 0, JSON.stringify(variant));
});

test('falsche Projekt- und Commit-Umgebungswerte scheitern ohne Standardpayload', () => {
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', env: gitEnvironment }).trim();
  const cases = [
    { UNIVERSAARL_PROJECT_ID: 'Blueprint', UNIVERSAARL_EXPECTED_COMMIT: head },
    { UNIVERSAARL_PROJECT_ID: 'blueprint', UNIVERSAARL_EXPECTED_COMMIT: '0'.repeat(40) },
    { UNIVERSAARL_PROJECT_ID: 'blueprint', UNIVERSAARL_EXPECTED_COMMIT: head.toUpperCase() }
  ];
  for (const environment of cases) {
    const result = runScanner(environment);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Deutsch-Gate fehlgeschlagen/);
  }
});

test('Detailmodus liefert Inventar nur nach ausdruecklicher Anforderung', () => {
  const result = runScanner({}, ['--details']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  const details = JSON.parse(result.stdout);
  assert.equal(details.projectId, 'blueprint');
  assert.equal(Array.isArray(details.violations), true);
  assert.equal(Array.isArray(details.exceptions), true);
  assert.deepEqual(details.violations, []);
});

test('Standardkommando liefert exakt ein sechsfeldriges JSON und bleibt read-only', () => {
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', env: gitEnvironment }).trim();
  const indexBefore = execFileSync('git', ['ls-files', '-s'], { cwd: root, encoding: 'utf8', env: gitEnvironment });
  const statusBefore = execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], { cwd: root, encoding: 'utf8', env: gitEnvironment });
  const result = spawnSync(npmCommand, ['--silent', 'run', 'test:german'], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, UNIVERSAARL_PROJECT_ID: 'blueprint', UNIVERSAARL_EXPECTED_COMMIT: head },
    windowsHide: true,
    shell: process.platform === 'win32'
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout.trim().split(/\r?\n/).length, 1);
  const payload = JSON.parse(result.stdout);
  assert.deepEqual(Object.keys(payload), STANDARD_PAYLOAD_KEYS);
  assert.deepEqual(validateStandardPayload(payload, { expectedCommit: head }), []);
  assert.equal(result.stdout, JSON.stringify(payload));
  const indexAfter = execFileSync('git', ['ls-files', '-s'], { cwd: root, encoding: 'utf8', env: gitEnvironment });
  const statusAfter = execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], { cwd: root, encoding: 'utf8', env: gitEnvironment });
  assert.equal(indexAfter, indexBefore);
  assert.equal(statusAfter, statusBefore);
});

test('interner Reposcan liefert die verlangten Detailfelder', () => {
  const report = scanRepository({ rootDir: root });
  assert.match(report.commit, /^[0-9a-f]{40}$/);
  assert.equal(Number.isInteger(report.scannedFileCount), true);
  assert.equal(Number.isInteger(report.checkedValueCount), true);
  assert.equal(Array.isArray(report.violations), true);
  assert.equal(Array.isArray(report.exceptions), true);
  assert.deepEqual(report.violations, []);
});
